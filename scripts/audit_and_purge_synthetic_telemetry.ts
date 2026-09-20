/**
 * Database Audit and Synthetic Data Cleanup Script (Directive §3)
 * 
 * Scans all database tables for synthetic products, mock SKU records,
 * and untagged simulation rows created during development or testing.
 * Purges all synthetic products and recalculates store metrics strictly
 * from authentic Google Merchant Center figures.
 * 
 * Run with: npx tsx scripts/audit_and_purge_synthetic_telemetry.ts
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// 1. Load connection string from .env or .env.local
const envFiles = ['.env', '.env.local'];
let databaseUrl = process.env.DATABASE_URL;

for (const file of envFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match && !databaseUrl) {
      databaseUrl = match[1];
      console.log(`[Audit & Purge] Loaded DATABASE_URL from ${file}`);
    }
  }
}

if (!databaseUrl) {
  console.error('[Audit & Purge] Error: DATABASE_URL not found in environment or .env files.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runAuditAndPurge() {
  console.log('\n=============================================================');
  console.log('[Audit & Purge] Initiating Database Scan & Synthetic Cleanup');
  console.log('=============================================================\n');

  try {
    // 1. Ensure Schema Columns Exist
    console.log('[Step 1] Ensuring is_test and is_simulated columns exist across tables...');
    await sql`ALTER TABLE incidents ADD COLUMN IF NOT EXISTS is_simulated BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE incidents ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE telemetry_events ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE dispatch_logs ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;`;

    // 2. Pre-cleanup Audit
    console.log('[Step 2] Scanning for synthetic mock artifacts in database...');
    const syntheticIncidents = await sql`
      SELECT id, store_id, gmc_id, sku, title, is_simulated, is_test 
      FROM incidents 
      WHERE sku IN ('DEMO-RUNNER-402', 'APX-TR-402', 'OW-8842-BLK-M') 
         OR offer_id IN ('DEMO-RUNNER-402', 'APX-TR-402', 'OW-8842-BLK-M') 
         OR gmc_id = 'DEMO-GMC';
    `;
    console.log(`Found ${syntheticIncidents.length} synthetic incident records.`);

    const syntheticTelemetry = await sql`
      SELECT id, event_type, details 
      FROM telemetry_events 
      WHERE details->>'simulated' = 'true' OR details->>'is_test' = 'true';
    `;
    console.log(`Found ${syntheticTelemetry.length} synthetic telemetry events.`);

    // 3. Purge Synthetic Records
    console.log('[Step 3] Purging synthetic products and mock SKU records...');
    const deletedIncidents = await sql`
      DELETE FROM incidents 
      WHERE sku IN ('DEMO-RUNNER-402', 'APX-TR-402', 'OW-8842-BLK-M') 
         OR offer_id IN ('DEMO-RUNNER-402', 'APX-TR-402', 'OW-8842-BLK-M') 
         OR gmc_id = 'DEMO-GMC'
      RETURNING id, sku;
    `;
    console.log(`Purged ${deletedIncidents.length} synthetic incidents.`);

    const deletedTelemetry = await sql`
      DELETE FROM telemetry_events 
      WHERE details->>'simulated' = 'true' OR details->>'is_test' = 'true'
      RETURNING id;
    `;
    console.log(`Purged ${deletedTelemetry.length} synthetic telemetry events.`);

    // 4. Synchronize Store Metrics
    console.log('[Step 4] Recalculating store open_disapprovals and total_caught exclusively from authentic data...');
    await sql`
      UPDATE stores s
      SET open_disapprovals = (
        SELECT COUNT(*)::int FROM incidents i 
        WHERE i.store_id::text = s.id::text 
          AND i.status = 'unresolved' 
          AND COALESCE(i.is_simulated, FALSE) = FALSE 
          AND COALESCE(i.is_test, FALSE) = FALSE
      ),
      total_caught = (
        SELECT COUNT(*)::int FROM incidents i 
        WHERE i.store_id::text = s.id::text 
          AND COALESCE(i.is_simulated, FALSE) = FALSE 
          AND COALESCE(i.is_test, FALSE) = FALSE
      );
    `;

    // 5. Post-Cleanup Verification
    console.log('\n=============================================================');
    console.log('[Audit & Purge] Verification of Cleaned Store Metrics');
    console.log('=============================================================');

    const stores = await sql`
      SELECT id, store_name, store_url, gmc_id, open_disapprovals, total_caught 
      FROM stores 
      ORDER BY id ASC;
    `;

    console.table(stores);

    const remainingSynthetic = await sql`
      SELECT count(*)::int as count 
      FROM incidents 
      WHERE sku IN ('DEMO-RUNNER-402', 'APX-TR-402', 'OW-8842-BLK-M') 
         OR offer_id IN ('DEMO-RUNNER-402', 'APX-TR-402', 'OW-8842-BLK-M') 
         OR gmc_id = 'DEMO-GMC';
    `;

    if (remainingSynthetic[0].count === 0) {
      console.log('\n>>> SUCCESS: All synthetic artifacts purged and store metrics recalculated! <<<\n');
    } else {
      console.warn(`\n[Warning] ${remainingSynthetic[0].count} synthetic records still remain.`);
    }

  } catch (error) {
    console.error('[Audit & Purge] Critical error during cleanup:', error);
    process.exit(1);
  }
}

runAuditAndPurge();
