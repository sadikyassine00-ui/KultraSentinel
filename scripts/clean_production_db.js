/**
 * Production Database Cleanup & Fresh Start Script
 * 
 * Safely purges all accounts and operational data, leaving exclusively
 * the superadmin / platform owner: yassinesadik0@gmail.com
 * 
 * Run with: node scripts/clean_production_db.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// 1. Load connection string from .env or .env.local
const envFiles = ['.env', '.env.local'];
let databaseUrl = process.env.DATABASE_URL;

for (const file of envFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match && !databaseUrl) {
      databaseUrl = match[1];
      console.log(`[Clean DB] Loaded DATABASE_URL from ${file}`);
    }
  }
}

if (!databaseUrl) {
  console.error('[Clean DB] Error: DATABASE_URL not found in environment or .env files.');
  process.exit(1);
}

const SUPERADMIN_EMAIL = 'yassinesadik0@gmail.com';
const sql = neon(databaseUrl);

async function cleanProductionDb() {
  console.log('\n=============================================================');
  console.log(`[Clean DB] Initiating Fresh Start Database Reset`);
  console.log(`[Clean DB] Retaining ONLY Superadmin: ${SUPERADMIN_EMAIL}`);
  console.log('=============================================================\n');

  try {
    // Audit Pre-Cleanup Counts
    console.log('[Clean DB] Auditing pre-cleanup table states...');
    const preAdmins = await sql`SELECT count(*)::int as count FROM admins;`;
    const preTenants = await sql`SELECT count(*)::int as count FROM tenants;`;
    const preStores = await sql`SELECT count(*)::int as count FROM stores;`;
    const preIncidents = await sql`SELECT count(*)::int as count FROM incidents;`;
    const preLeads = await sql`SELECT count(*)::int as count FROM leads;`;
    const preSessions = await sql`SELECT count(*)::int as count FROM user_sessions;`;
    const preDlq = await sql`SELECT count(*)::int as count FROM dlq_messages;`;
    const preDispatches = await sql`SELECT count(*)::int as count FROM dispatch_logs;`;
    const preProcessed = await sql`SELECT count(*)::int as count FROM processed_messages;`;
    const preTelemetry = await sql`SELECT count(*)::int as count FROM telemetry_events;`;

    console.log(`Pre-cleanup state:
  - Admins: ${preAdmins[0].count}
  - Tenants: ${preTenants[0].count}
  - Stores: ${preStores[0].count}
  - Incidents: ${preIncidents[0].count}
  - Leads: ${preLeads[0].count}
  - User Sessions: ${preSessions[0].count}
  - DLQ Messages: ${preDlq[0].count}
  - Dispatch Logs: ${preDispatches[0].count}
  - Processed Messages: ${preProcessed[0].count}
  - Telemetry Events: ${preTelemetry[0].count}
    `);

    // Verify Superadmin Exists in Admins and Tenants
    const existingAdmin = await sql`SELECT * FROM admins WHERE LOWER(email) = ${SUPERADMIN_EMAIL} LIMIT 1;`;
    if (existingAdmin.length === 0) {
      console.log(`[Clean DB] Superadmin ${SUPERADMIN_EMAIL} not found in admins table. Inserting...`);
      await sql`
        INSERT INTO admins (email, name, role, status)
        VALUES (${SUPERADMIN_EMAIL}, 'Yassine Sadik', 'admin', 'active')
        ON CONFLICT (email) DO UPDATE SET role = 'admin', status = 'active';
      `;
    }

    const existingTenant = await sql`SELECT * FROM tenants WHERE LOWER(email) = ${SUPERADMIN_EMAIL} LIMIT 1;`;
    if (existingTenant.length === 0) {
      console.log(`[Clean DB] Superadmin ${SUPERADMIN_EMAIL} not found in tenants table. Inserting...`);
      await sql`
        INSERT INTO tenants (
          user_id, email, company_name, plan_tier, connected_stores, total_skus, incidents_month,
          oauth_status, last_active, status, subscription_status, created_at
        ) VALUES (
          'usr_superadmin_01', ${SUPERADMIN_EMAIL}, 'Kultra Superadmin', 'Active Pro', 0, 0, 0,
          'Valid', NOW(), 'active', 'paid active', NOW()
        );
      `;
    }

    // 1. Purge other Admins
    console.log('[Clean DB] 1. Purging all other admins...');
    const deletedAdmins = await sql`
      DELETE FROM admins 
      WHERE LOWER(email) != ${SUPERADMIN_EMAIL}
      RETURNING email;
    `;
    console.log(`   Deleted ${deletedAdmins.length} admin accounts.`);

    // Ensure superadmin has active status & admin role
    await sql`
      UPDATE admins 
      SET role = 'admin', status = 'active'
      WHERE LOWER(email) = ${SUPERADMIN_EMAIL};
    `;

    // 2. Purge other Tenants
    console.log('[Clean DB] 2. Purging all other tenants...');
    const deletedTenants = await sql`
      DELETE FROM tenants 
      WHERE LOWER(email) != ${SUPERADMIN_EMAIL}
      RETURNING email;
    `;
    console.log(`   Deleted ${deletedTenants.length} tenant accounts.`);

    // Reset superadmin tenant counters for a completely fresh start
    await sql`
      UPDATE tenants 
      SET status = 'active', 
          plan_tier = 'Active Pro', 
          subscription_status = 'paid active',
          connected_stores = 0,
          total_skus = 0,
          incidents_month = 0,
          oauth_status = 'disconnected'
      WHERE LOWER(email) = ${SUPERADMIN_EMAIL};
    `;

    // 3. Purge User Sessions (except superadmin)
    console.log('[Clean DB] 3. Purging non-superadmin user sessions...');
    const deletedSessions = await sql`
      DELETE FROM user_sessions 
      WHERE LOWER(email) != ${SUPERADMIN_EMAIL}
      RETURNING session_id;
    `;
    console.log(`   Deleted ${deletedSessions.length} sessions.`);

    // 4. Purge Leads (except superadmin)
    console.log('[Clean DB] 4. Purging non-superadmin leads...');
    const deletedLeads = await sql`
      DELETE FROM leads 
      WHERE LOWER(email) != ${SUPERADMIN_EMAIL}
      RETURNING email;
    `;
    console.log(`   Deleted ${deletedLeads.length} leads.`);

    // 5. Purge Stores & Incidents (Full fresh start)
    console.log('[Clean DB] 5. Purging all stores & incidents for a clean slate...');
    const deletedIncidents = await sql`DELETE FROM incidents RETURNING id;`;
    const deletedStores = await sql`DELETE FROM stores RETURNING id;`;
    console.log(`   Deleted ${deletedIncidents.length} incidents.`);
    console.log(`   Deleted ${deletedStores.length} stores.`);

    // 6. Purge Operational Queues & Logs (Full fresh start)
    console.log('[Clean DB] 6. Purging DLQ, processed messages, all dispatches, telemetry...');
    const deletedDlq = await sql`DELETE FROM dlq_messages RETURNING id;`;
    const deletedProcessed = await sql`DELETE FROM processed_messages RETURNING message_id;`;
    const deletedDispatches = await sql`DELETE FROM dispatch_logs RETURNING id;`;
    const deletedTelemetry = await sql`DELETE FROM telemetry_events RETURNING id;`;
    console.log(`   Deleted ${deletedDlq.length} DLQ messages.`);
    console.log(`   Deleted ${deletedProcessed.length} processed deduplication messages.`);
    console.log(`   Deleted ${deletedDispatches.length} dispatch logs.`);
    console.log(`   Deleted ${deletedTelemetry.length} telemetry events.`);

    // Post-Cleanup Verification
    console.log('\n=============================================================');
    console.log('[Clean DB] Verification of Cleaned Database State');
    console.log('=============================================================');

    const postAdmins = await sql`SELECT id, email, role, status FROM admins;`;
    const postTenants = await sql`SELECT id, user_id, email, plan_tier, connected_stores, status FROM tenants;`;
    const postStores = await sql`SELECT count(*)::int as count FROM stores;`;
    const postIncidents = await sql`SELECT count(*)::int as count FROM incidents;`;
    const postLeads = await sql`SELECT count(*)::int as count FROM leads;`;
    const postSessions = await sql`SELECT count(*)::int as count FROM user_sessions;`;
    const postDlq = await sql`SELECT count(*)::int as count FROM dlq_messages;`;
    const postDispatches = await sql`SELECT count(*)::int as count FROM dispatch_logs;`;
    const postProcessed = await sql`SELECT count(*)::int as count FROM processed_messages;`;
    const postTelemetry = await sql`SELECT count(*)::int as count FROM telemetry_events;`;

    console.log('Admins (should be 1):', postAdmins);
    console.log('Tenants (should be 1):', postTenants);
    console.log(`Stores count (should be 0): ${postStores[0].count}`);
    console.log(`Incidents count (should be 0): ${postIncidents[0].count}`);
    console.log(`Leads count: ${postLeads[0].count}`);
    console.log(`User Sessions count: ${postSessions[0].count}`);
    console.log(`DLQ Messages count (should be 0): ${postDlq[0].count}`);
    console.log(`Dispatch Logs count: ${postDispatches[0].count}`);
    console.log(`Processed Messages count (should be 0): ${postProcessed[0].count}`);
    console.log(`Telemetry Events count (should be 0): ${postTelemetry[0].count}`);

    if (postAdmins.length === 1 && postAdmins[0].email === SUPERADMIN_EMAIL &&
        postTenants.length === 1 && postTenants[0].email === SUPERADMIN_EMAIL &&
        postStores[0].count === 0 && postIncidents[0].count === 0) {
      console.log('\n>>> SUCCESS: Database fresh start completed flawlessly! <<<');
    } else {
      console.warn('\n[Warning] Database cleanup finished, but check unexpected counts above.');
    }

  } catch (error) {
    console.error('[Clean DB] Critical error executing database cleanup:', error);
    process.exit(1);
  }
}

cleanProductionDb();
