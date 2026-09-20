import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';

// Load .env
const envFiles = ['.env', '.env.local'];
for (const file of envFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

function generatePaddleSignature(rawBody: string, secretKey: string): string {
  const ts = Math.floor(Date.now() / 1000);
  const payloadToSign = `${ts}:${rawBody}`;
  const h1 = crypto.createHmac('sha256', secretKey).update(payloadToSign).digest('hex');
  return `ts=${ts};h1=${h1}`;
}

async function main() {
  console.log('=== VERIFYING REAL CHECKOUT & WEBHOOK PROVISIONING ISOLATION ===\n');

  // ---------------------------------------------------------------------------
  // Test 1: Static Analysis - Zero Direct DB Mutation in Checkout Route
  // ---------------------------------------------------------------------------
  console.log('--- Test 1: Static Analysis of Checkout Route & DB Isolation ---');
  const checkoutRouteContent = fs.readFileSync(
    path.join(__dirname, '../src/app/api/billing/checkout/route.ts'),
    'utf8'
  );

  assert(
    !checkoutRouteContent.includes("subscription_status = 'paid active'") &&
    !checkoutRouteContent.includes("subscription_status: 'paid active'"),
    'Checkout route must NEVER set subscription_status to paid active directly'
  );
  assert(
    !checkoutRouteContent.includes('updateTenant(') &&
    !checkoutRouteContent.includes('updateTenantByEmail('),
    'Checkout route must not call updateTenant or updateTenantByEmail directly'
  );
  assert(
    checkoutRouteContent.includes('paddle.transactions.create'),
    'Checkout route must initiate authentic Paddle transaction via paddle.transactions.create'
  );
  assert(
    checkoutRouteContent.includes('transactionId') && checkoutRouteContent.includes('checkoutUrl'),
    'Checkout route must return transactionId and hosted checkout URL'
  );
  console.log('[PASS] Zero direct database mutation or instant elevation in checkout route.');

  // ---------------------------------------------------------------------------
  // Test 2: Verify Test Accounts Reset to Authentic State
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 2: Test Account Elevation Reset Verification ---');
  const { findTenantByEmail } = await import('../src/lib/db');
  const testTenant = await findTenantByEmail('sadikyassine00@gmail.com');
  assert(testTenant, 'sadikyassine00@gmail.com tenant must exist');
  assert.strictEqual(
    testTenant.subscription_status,
    'active trial',
    'Artificially elevated test account must be reset to active trial'
  );
  assert.strictEqual(
    testTenant.paddle_customer_id,
    null,
    'Paddle customer ID must be null before authentic checkout'
  );
  console.log('[PASS] Test account sadikyassine00@gmail.com authentic active trial state confirmed.');

  // ---------------------------------------------------------------------------
  // Test 3: Backend Checkout Session Generation with Real Metadata
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 3: Backend Checkout Session Generation (Solo & Agency) ---');
  const { POST: checkoutPost } = await import('../src/app/api/billing/checkout/route');
  const { createSessionToken, COOKIE_NAME } = await import('../src/lib/token');

  const sessionToken = await createSessionToken({
    email: 'sadikyassine00@gmail.com',
    role: 'merchant',
  });

  // Request Solo checkout session
  const soloReq = new Request('http://localhost:3000/api/billing/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `${COOKIE_NAME}=${sessionToken}`,
    },
    body: JSON.stringify({ plan: 'solo' }),
  });

  const soloRes = await checkoutPost(soloReq);
  assert.strictEqual(soloRes.status, 200, 'Solo checkout request returns HTTP 200');
  const soloData = await soloRes.json();
  console.log('Solo checkout session response:', {
    hasUrl: Boolean(soloData.url),
    hasTransactionId: Boolean(soloData.transactionId),
    plan: soloData.plan,
  });
  assert(soloData.transactionId || soloData.url || soloData.priceId, 'Must return transactionId, hosted checkout url, or priceId for overlay');
  assert.strictEqual(soloData.plan, 'solo');

  // Verify DB was NOT mutated by the checkout request
  const tenantAfterCheckout = await findTenantByEmail('sadikyassine00@gmail.com');
  assert.strictEqual(
    tenantAfterCheckout?.subscription_status,
    'active trial',
    'Tenant subscription status must remain active trial after requesting checkout'
  );
  console.log('[PASS] Authentic checkout session generated. Database remains un-mutated on checkout initiation.');

  // ---------------------------------------------------------------------------
  // Test 4: Frontend UI Wireup & Zero Instant Confirmation
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 4: Frontend UI Wireup & Success Banner Strict Gating ---');
  const settingsViewContent = fs.readFileSync(
    path.join(__dirname, '../src/components/dashboard/SettingsClientView.tsx'),
    'utf8'
  );

  assert(
    settingsViewContent.includes('openPaddleOverlayCheckout'),
    'SettingsClientView must wire checkout to openPaddleOverlayCheckout'
  );
  assert(
    settingsViewContent.includes("showSuccessBanner && isPaidActive"),
    'SettingsClientView must only declare Subscription Confirmed when isPaidActive is true'
  );
  assert(
    settingsViewContent.includes('Payment Submitted - Awaiting Webhook Confirmation') ||
    settingsViewContent.includes('Payment Submitted'),
    'SettingsClientView must show pending status when returning before webhook execution'
  );
  console.log('[PASS] Frontend upgrade buttons wired to authentic overlay. Instant confirmation eradicated.');

  // ---------------------------------------------------------------------------
  // Test 5: Asynchronous Provisioning via Cryptographically Signed Webhooks Only
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 5: Asynchronous Provisioning via Signed Webhooks ---');
  const { POST: webhookPost } = await import('../src/app/api/webhooks/paddle/route');
  const webhookSecret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET?.trim() || '';

  assert(webhookSecret, 'PADDLE_NOTIFICATION_WEBHOOK_SECRET must be configured');

  const webhookEmail = 'webhook_prov_test@usekultra.com';
  const { createTenant, updateTenantByEmail } = await import('../src/lib/db');

  // Create a clean tenant in trial state
  let provTenant = await findTenantByEmail(webhookEmail);
  if (!provTenant) {
    provTenant = await createTenant({
      email: webhookEmail,
      companyName: 'Webhook Prov Corp',
      planTier: 'Active Pro',
      accountPlan: 'solo',
      subscriptionStatus: 'active trial',
    });
  } else {
    await updateTenantByEmail(webhookEmail, {
      subscription_status: 'active trial',
      paddle_customer_id: null,
      paddle_subscription_id: null,
    });
  }

  // 5a. Reject unsigned request
  const unsignedReq = new NextRequest('http://localhost:3000/api/webhooks/paddle', {
    method: 'POST',
    body: JSON.stringify({ event_type: 'subscription.created' }),
  });
  const unsignedRes = await webhookPost(unsignedReq);
  assert.strictEqual(unsignedRes.status, 400, 'Unsigned webhook must be rejected with HTTP 400');

  // 5b. Send valid signed subscription.created event
  const now = new Date().toISOString();
  const futureDate = new Date(Date.now() + 30 * 86400000).toISOString();
  const eventId = `evt_test_prov_${Date.now()}`;
  const mockSubPayload = {
    event_id: eventId,
    event_type: 'subscription.created',
    occurred_at: now,
    data: {
      id: 'sub_test_real_001',
      customer_id: 'ctm_test_real_001',
      status: 'active',
      currency_code: 'USD',
      created_at: now,
      updated_at: now,
      current_billing_period: {
        starts_at: now,
        ends_at: futureDate,
      },
      billing_cycle: {
        interval: 'month',
        frequency: 1,
      },
      items: [
        {
          status: 'active',
          quantity: 1,
          recurring: true,
          created_at: now,
          updated_at: now,
          price: {
            id: process.env.NEXT_PUBLIC_PADDLE_AGENCY_PRICE_ID || 'pri_01m2zs53ec1e4cjvn2fqc7aav1',
            product_id: 'pro_01m2zs538gbfdk2ht4y93bgm0f',
            name: 'Kultra Agency Monthly',
            unit_price: {
              amount: '4900',
              currency_code: 'USD',
            },
            billing_cycle: { interval: 'month', frequency: 1 },
          },
        },
      ],
      custom_data: {
        tenantEmail: webhookEmail,
        accountPlan: 'agency',
        userId: String(provTenant.id),
      },
    },
  };

  const rawSubBody = JSON.stringify(mockSubPayload);
  const signature = generatePaddleSignature(rawSubBody, webhookSecret);

  const signedReq = new NextRequest('http://localhost:3000/api/webhooks/paddle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'paddle-signature': signature,
    },
    body: rawSubBody,
  });

  const signedRes = await webhookPost(signedReq);
  assert.strictEqual(signedRes.status, 200, 'Signed webhook must return HTTP 200 OK');

  // 5c. Verify database was provisioned exclusively by the webhook
  const provisionedTenant = await findTenantByEmail(webhookEmail);
  assert.strictEqual(
    provisionedTenant?.subscription_status,
    'paid active',
    'Subscription status must be paid active after webhook processing'
  );
  assert.strictEqual(
    provisionedTenant?.paddle_customer_id,
    'ctm_test_real_001',
    'Customer ID must be stored from webhook'
  );
  assert.strictEqual(
    provisionedTenant?.paddle_subscription_id,
    'sub_test_real_001',
    'Subscription ID must be stored from webhook'
  );
  assert.strictEqual(
    provisionedTenant?.plan_tier,
    'Agency Pilot',
    'Plan tier must be updated to Agency Pilot from webhook'
  );
  console.log('[PASS] Webhook cryptographic verification and asynchronous provisioning verified.');

  console.log('\n=============================================================');
  console.log('>>> ALL REAL CHECKOUT & WEBHOOK ISOLATION TESTS PASSED! <<<');
  console.log('=============================================================\n');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
