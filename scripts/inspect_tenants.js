const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function run() {
  const rows = await sql`SELECT id, email, plan_tier, subscription_status, stripe_customer_id, paddle_customer_id, paddle_subscription_id FROM tenants;`;
  console.log(JSON.stringify(rows, null, 2));
}

run().catch(console.error);
