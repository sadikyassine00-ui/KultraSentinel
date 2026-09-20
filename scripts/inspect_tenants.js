const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function run() {
  const tenants = await sql`SELECT * FROM tenants;`;
  console.log('TENANTS:', JSON.stringify(tenants, null, 2));
  const stores = await sql`SELECT * FROM stores;`;
  console.log('STORES:', JSON.stringify(stores, null, 2));
}

run().catch(console.error);
