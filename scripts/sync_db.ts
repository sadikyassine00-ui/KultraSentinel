import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local or .env
for (const envFile of ['.env.local', '.env']) {
  const p = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[match[1]]) {
          process.env[match[1]] = val;
        }
      }
    }
  }
}

import { ensureSchema, getDb } from '../src/lib/db';

async function main() {
  console.log('[DB Sync] Connecting to Neon Postgres...');
  const sql = getDb();
  if (!sql) {
    console.error('[DB Sync] No database URL found in environment.');
    process.exit(1);
  }

  console.log('[DB Sync] Running ensureSchema()...');
  const migrated = await ensureSchema();
  console.log('[DB Sync] Migration completed. Status:', migrated);

  // Validate columns on incidents table
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'incidents'
    ORDER BY ordinal_position;
  `;
  console.log('[DB Sync] Verified incident table columns:');
  for (const c of cols) {
    console.log(`  - ${c.column_name} (${c.data_type})`);
  }

  // Validate indexes
  const idxs = await sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'incidents';
  `;
  console.log('[DB Sync] Verified incident table indexes:');
  for (const idx of idxs) {
    console.log(`  - ${idx.indexname}`);
  }

  console.log('[DB Sync] Database is fully up to date with latest schema and index architecture.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[DB Sync Error]', err);
  process.exit(1);
});
