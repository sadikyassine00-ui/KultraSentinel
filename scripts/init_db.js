/**
 * Neon Postgres Database Schema Initializer & Admin Seeder
 * Run with: node scripts/init_db.js
 */

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read local .env or .env.local if present
const envFiles = ['.env.local', '.env'];
let databaseUrl = process.env.DATABASE_URL;

for (const file of envFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match && !databaseUrl) {
      databaseUrl = match[1];
      console.log(`[Init DB] Loaded DATABASE_URL from ${file}`);
    }
  }
}

async function initDb() {
  if (!databaseUrl) {
    console.log(`
=============================================================================
[Notice] DATABASE_URL is not set in your environment or .env.local file.
Kultra will use its high-performance in-memory persistence layer.

To connect your real Neon Postgres database:
1. Sign up for free at https://neon.tech
2. Create a project (e.g. 'kultra')
3. Copy your Pooled Connection String (starts with postgresql://...)
4. Add it to .env.local:
   DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
5. Re-run: node scripts/init_db.js
=============================================================================
`);
    return;
  }

  console.log('[Init DB] Connecting to Neon Postgres...');
  const sql = neon(databaseUrl);

  try {
    // 1. Create leads table
    console.log('[Init DB] Ensuring "leads" table exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        account_type TEXT NOT NULL,
        website TEXT NOT NULL,
        catalog_size TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Create admins table
    console.log('[Init DB] Ensuring "admins" table exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        google_id TEXT,
        name TEXT,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 3. Create telemetry_events table
    console.log('[Init DB] Ensuring "telemetry_events" table exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS telemetry_events (
        id SERIAL PRIMARY KEY,
        event_type TEXT NOT NULL,
        sku TEXT,
        revenue_impact NUMERIC DEFAULT 0,
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 4. Seed sole authorized administrators
    const adminEmails = ['support@usekultra.com'];
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'KultraSentinel2026!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    for (const email of adminEmails) {
      console.log(`[Init DB] Seeding administrator (${email})...`);
      await sql`
        INSERT INTO admins (email, password_hash, name, role)
        VALUES (${email.toLowerCase()}, ${passwordHash}, ${email.split('@')[0]}, 'admin')
        ON CONFLICT (email) DO UPDATE
        SET role = 'admin', password_hash = COALESCE(admins.password_hash, EXCLUDED.password_hash);
      `;
    }

    // 5. Seed initial telemetry events if empty
    const countRes = await sql`SELECT COUNT(*)::int as count FROM telemetry_events;`;
    if (countRes[0].count === 0) {
      console.log('[Init DB] Seeding initial telemetry events stream...');
      await sql`
        INSERT INTO telemetry_events (event_type, sku, revenue_impact, details)
        VALUES 
          ('crawler_disapproval', 'ALP-ANORAK-BLK-L', 4800, '{"reason": "missing_required_attribute [gtin]", "platform": "Google Merchant API v1"}'::jsonb),
          ('shopify_remediation', 'ALP-ANORAK-BLK-L', 4800, '{"action": "gtin_resolved_via_deep_link", "duration_seconds": 144}'::jsonb),
          ('pilot_signup', NULL, 0, '{"email": "marcus.vance@solarestudio.com", "account_type": "merchant"}'::jsonb);
      `;
    }

    console.log('[Init DB] Neon Database successfully initialized and operational!');
  } catch (error) {
    console.error('[Init DB] Error connecting or migrating Neon database:', error);
    process.exit(1);
  }
}

initDb();
