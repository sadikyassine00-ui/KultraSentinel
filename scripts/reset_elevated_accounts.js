const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function resetArtificiallyElevatedAccounts() {
  console.log('Resetting artificially elevated accounts...');
  // Find tenants marked 'paid active' but with no paddle or stripe customer/subscription id, excluding superadmin
  const result = await sql`
    UPDATE tenants
    SET subscription_status = 'active trial',
        plan_tier = 'Active Pro',
        account_plan = 'solo',
        paddle_customer_id = NULL,
        paddle_subscription_id = NULL,
        stripe_customer_id = NULL,
        stripe_subscription_id = NULL
    WHERE LOWER(email) = 'sadikyassine00@gmail.com'
    RETURNING id, email, plan_tier, subscription_status, paddle_customer_id, paddle_subscription_id;
  `;
  console.log('Reset result:', result);
}

resetArtificiallyElevatedAccounts().catch(console.error);
