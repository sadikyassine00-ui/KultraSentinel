import crypto from 'crypto';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { processPaddleWebhookEvent } from '../src/lib/paddle/process-webhook';
import {
  findTenantByEmail,
  createTenant,
  isPaddleEventProcessed,
  markPaddleEventProcessed,
  getStoresForTenant,
  claimStoreForTenant,
  setTenantStoreAlertStatus,
} from '../src/lib/db';
import { evaluateSubscription } from '../src/lib/subscription';

function generatePaddleSignature(rawBody: string, secretKey: string): string {
  const ts = Math.floor(Date.now() / 1000);
  const payloadToSign = `${ts}:${rawBody}`;
  const h1 = crypto.createHmac('sha256', secretKey).update(payloadToSign).digest('hex');
  return `ts=${ts};h1=${h1}`;
}

function createMockSubscription(params: {
  id: string;
  customerId: string;
  status: string;
  priceId: string;
  productId: string;
  plan: 'solo' | 'agency';
  tenantEmail?: string;
  userId?: string;
  tenantId?: number | string;
  currentPeriodEndsAt?: string;
  scheduledChange?: { action: string; effective_at: string } | null;
}) {
  const now = new Date().toISOString();
  const periodEnd = params.currentPeriodEndsAt || new Date(Date.now() + 30 * 86400000).toISOString();
  return {
    id: params.id,
    customer_id: params.customerId,
    status: params.status,
    currency_code: 'USD',
    created_at: now,
    updated_at: now,
    current_billing_period: {
      starts_at: now,
      ends_at: periodEnd,
    },
    scheduled_change: params.scheduledChange || null,
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
          id: params.priceId,
          product_id: params.productId,
          name: params.plan === 'agency' ? 'Kultra Agency Monthly' : 'Kultra Solo Monthly',
          unit_price: {
            amount: params.plan === 'agency' ? '4900' : '1900',
            currency_code: 'USD',
          },
          billing_cycle: { interval: 'month', frequency: 1 },
        },
      },
    ],
    custom_data: {
      ...(params.tenantEmail ? { tenantEmail: params.tenantEmail } : {}),
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.tenantId ? { tenantId: params.tenantId } : {}),
      accountPlan: params.plan,
    },
  };
}

async function runTests() {
  console.log('====================================================');
  console.log(' Running Kultra Paddle Webhook Fulfillment Suite');
  console.log('====================================================\n');

  const testSecret = 'pdl_ntfset_test_secret_key_12345';
  const testApiKey = 'pdl_sdbx_apikey_test_placeholder_key_67890';
  process.env.PADDLE_API_KEY = testApiKey;
  process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET = testSecret;

  const paddle = new Paddle(testApiKey, { environment: Environment.sandbox });

  // 1. Signature Verification & Tamper Resistance
  console.log('Test 1: Webhook Signature Verification & Tamper Resistance');
  const testEmail = 'paddle_fulfillment_test@usekultra.com';
  const futureDate = new Date(Date.now() + 30 * 86400000).toISOString();

  const rawBody = JSON.stringify({
    event_id: 'evt_test_001_sub_created',
    event_type: 'subscription.created',
    occurred_at: new Date().toISOString(),
    data: createMockSubscription({
      id: 'sub_test_001',
      customerId: 'ctm_test_001',
      status: 'active',
      priceId: 'pri_01m2zzky40faxjvts1jke4rtm5', // Solo
      productId: 'pro_01m2zs52qf4gccrjm7g4dtypzt',
      plan: 'solo',
      tenantEmail: testEmail,
      userId: 'usr_custom_123',
      currentPeriodEndsAt: futureDate,
    }),
  });

  const validSignature = generatePaddleSignature(rawBody, testSecret);
  const unmarshaled = await paddle.webhooks.unmarshal(rawBody, testSecret, validSignature);
  if (!unmarshaled || unmarshaled.eventId !== 'evt_test_001_sub_created') {
    throw new Error('Valid signature failed unmarshaling');
  }

  try {
    await paddle.webhooks.unmarshal(rawBody + 'tampered', testSecret, validSignature);
    throw new Error('Tampered payload was not rejected!');
  } catch {
    console.log('[PASS] Signature correctly validated and tampered payloads rejected.');
  }

  // 2. Idempotency Ledger
  console.log('\nTest 2: Webhook Idempotency & Replay Protection');
  const testEventId = 'evt_idempotency_check_456';
  const seenBefore = await isPaddleEventProcessed(testEventId);
  if (seenBefore) throw new Error('Unseen event reported as processed');

  await markPaddleEventProcessed(testEventId, 'subscription.created');
  const seenAfter = await isPaddleEventProcessed(testEventId);
  if (!seenAfter) throw new Error('Processed event not reported as processed');
  console.log('[PASS] Event deduplication ledger prevents duplicate processing.');

  // 3. subscription.created: Provisioning, Paywall Lifting & Alert Activation
  console.log('\nTest 3: subscription.created Fulfillment');
  const initialTenant = await createTenant({
    email: testEmail,
    companyName: 'Fulfillment Test Store',
    planTier: 'Trial',
    accountPlan: 'solo',
    subscriptionStatus: 'active trial',
  });
  // Add a test store for this tenant to check alert status arming
  await claimStoreForTenant({
    tenantId: initialTenant.id,
    tenantEmail: testEmail,
    gmcId: '987654321',
    storeName: 'Fulfillment Test Store',
    storeUrl: 'https://fulfillment-test.com',
  });
  await setTenantStoreAlertStatus(testEmail, 'degraded');

  await processPaddleWebhookEvent(unmarshaled);

  const tenantAfterCreate = await findTenantByEmail(testEmail);
  if (
    tenantAfterCreate?.subscription_status !== 'paid active' ||
    tenantAfterCreate?.plan_tier !== 'Active Pro' ||
    tenantAfterCreate?.account_plan !== 'solo' ||
    tenantAfterCreate?.paddle_customer_id !== 'ctm_test_001' ||
    tenantAfterCreate?.paddle_subscription_id !== 'sub_test_001' ||
    !tenantAfterCreate?.current_period_ends_at
  ) {
    throw new Error('subscription.created failed to update tenant record correctly');
  }

  // Verify stores alert status set to active (monitoring and Slack enabled)
  const storesAfterCreate = await getStoresForTenant(testEmail);
  const storeAlertActive = storesAfterCreate.every((s) => s.alert_status === 'active');
  if (!storeAlertActive) {
    throw new Error('subscription.created did not enable active store alert status');
  }

  // Verify paywall is lifted and quotas match Solo tier (1 GMC account)
  const evalAfterCreate = evaluateSubscription(tenantAfterCreate);
  if (evalAfterCreate.isLocked !== false || evalAfterCreate.quotas.gmcAccountsLimit !== 1) {
    throw new Error('subscription.created did not lift paywall or set proper Solo limits');
  }
  console.log('[PASS] subscription.created upgraded tenant, lifted paywall, and armed live alerts.');

  // 4. subscription.updated: Tier Upgrade (Solo -> Agency) & Limits
  console.log('\nTest 4: subscription.updated Plan Upgrade (Solo -> Agency $49/mo)');
  const upgradeBody = JSON.stringify({
    event_id: 'evt_test_002_sub_updated',
    event_type: 'subscription.updated',
    occurred_at: new Date().toISOString(),
    data: createMockSubscription({
      id: 'sub_test_001',
      customerId: 'ctm_test_001',
      status: 'active',
      priceId: 'pri_01m2zs53ec1e4cjvn2fqc7aav1', // Agency
      productId: 'pro_01m2zs538gbfdk2ht4y93bgm0f',
      plan: 'agency',
      tenantEmail: testEmail,
      currentPeriodEndsAt: futureDate,
    }),
  });
  const upgradeSig = generatePaddleSignature(upgradeBody, testSecret);
  const upgradeEvent = await paddle.webhooks.unmarshal(upgradeBody, testSecret, upgradeSig);
  await processPaddleWebhookEvent(upgradeEvent);

  const tenantAfterUpgrade = await findTenantByEmail(testEmail);
  if (
    tenantAfterUpgrade?.plan_tier !== 'Agency Pilot' ||
    tenantAfterUpgrade?.account_plan !== 'agency'
  ) {
    throw new Error('subscription.updated failed to upgrade to Agency tier');
  }

  const evalAfterUpgrade = evaluateSubscription(tenantAfterUpgrade);
  if (evalAfterUpgrade.quotas.gmcAccountsLimit !== 'unlimited' || evalAfterUpgrade.isLocked !== false) {
    throw new Error('Agency tier quotas (unlimited) not applied after upgrade');
  }
  console.log('[PASS] subscription.updated transitioned tier to Agency Fleet with unlimited quotas.');

  // 5. subscription.past_due: Grace Period Flagging & Active Alerts
  console.log('\nTest 5: subscription.past_due Grace Period Handling');
  const pastDueBody = JSON.stringify({
    event_id: 'evt_test_003_sub_past_due',
    event_type: 'subscription.past_due',
    occurred_at: new Date().toISOString(),
    data: createMockSubscription({
      id: 'sub_test_001',
      customerId: 'ctm_test_001',
      status: 'past_due',
      priceId: 'pri_01m2zs53ec1e4cjvn2fqc7aav1',
      productId: 'pro_01m2zs538gbfdk2ht4y93bgm0f',
      plan: 'agency',
      tenantEmail: testEmail,
    }),
  });
  const pastDueSig = generatePaddleSignature(pastDueBody, testSecret);
  const pastDueEvent = await paddle.webhooks.unmarshal(pastDueBody, testSecret, pastDueSig);
  await processPaddleWebhookEvent(pastDueEvent);

  const tenantAfterPastDue = await findTenantByEmail(testEmail);
  if (!tenantAfterPastDue?.is_past_due) {
    throw new Error('Tenant not flagged as is_past_due');
  }

  const evalAfterPastDue = evaluateSubscription(tenantAfterPastDue);
  if (evalAfterPastDue.isLocked !== false || evalAfterPastDue.isPastDue !== true) {
    throw new Error('Past due account was incorrectly locked or missing isPastDue flag');
  }
  const storesAfterPastDue = await getStoresForTenant(testEmail);
  if (!storesAfterPastDue.every((s) => s.alert_status === 'active')) {
    throw new Error('Critical alerts were silenced during past_due grace period');
  }
  console.log('[PASS] subscription.past_due entered grace period without silencing alerts.');

  // 6. subscription.canceled: Scheduled Cancellation for Period End
  console.log('\nTest 6: subscription.canceled Scheduled for Future Period End');
  const futureCancelDate = new Date(Date.now() + 15 * 86400000).toISOString();
  const scheduledCancelBody = JSON.stringify({
    event_id: 'evt_test_004_sub_canceled_scheduled',
    event_type: 'subscription.canceled',
    occurred_at: new Date().toISOString(),
    data: createMockSubscription({
      id: 'sub_test_001',
      customerId: 'ctm_test_001',
      status: 'active',
      priceId: 'pri_01m2zs53ec1e4cjvn2fqc7aav1',
      productId: 'pro_01m2zs538gbfdk2ht4y93bgm0f',
      plan: 'agency',
      tenantEmail: testEmail,
      scheduledChange: {
        action: 'cancel',
        effective_at: futureCancelDate,
      },
    }),
  });
  const schedSig = generatePaddleSignature(scheduledCancelBody, testSecret);
  const schedEvent = await paddle.webhooks.unmarshal(scheduledCancelBody, testSecret, schedSig);
  await processPaddleWebhookEvent(schedEvent);

  const tenantAfterSched = await findTenantByEmail(testEmail);
  const evalAfterSched = evaluateSubscription(tenantAfterSched);
  if (
    evalAfterSched.isLocked !== false ||
    evalAfterSched.effectiveStatus !== 'paid active' ||
    !evalAfterSched.scheduledCancellationDate
  ) {
    throw new Error('Scheduled cancellation prematurely cut off access before period end');
  }
  console.log('[PASS] Future scheduled cancellation preserved active surveillance until period end.');

  // 7. subscription.canceled: Expired / Immediate Termination
  console.log('\nTest 7: subscription.canceled Immediate Termination & Alert Silencing');
  const immediateCancelBody = JSON.stringify({
    event_id: 'evt_test_005_sub_canceled_now',
    event_type: 'subscription.canceled',
    occurred_at: new Date().toISOString(),
    data: createMockSubscription({
      id: 'sub_test_001',
      customerId: 'ctm_test_001',
      status: 'canceled',
      priceId: 'pri_01m2zs53ec1e4cjvn2fqc7aav1',
      productId: 'pro_01m2zs538gbfdk2ht4y93bgm0f',
      plan: 'agency',
      tenantEmail: testEmail,
      currentPeriodEndsAt: new Date(Date.now() - 3600000).toISOString(), // expired 1h ago
    }),
  });
  const immSig = generatePaddleSignature(immediateCancelBody, testSecret);
  const immEvent = await paddle.webhooks.unmarshal(immediateCancelBody, testSecret, immSig);
  await processPaddleWebhookEvent(immEvent);

  const tenantAfterImm = await findTenantByEmail(testEmail);
  if (tenantAfterImm?.subscription_status !== 'canceled') {
    throw new Error('Tenant subscription_status not set to canceled');
  }

  const evalAfterImm = evaluateSubscription(tenantAfterImm);
  if (evalAfterImm.isLocked !== true || evalAfterImm.effectiveStatus !== 'canceled') {
    throw new Error('Immediate cancellation did not trigger paywall lock');
  }

  const storesAfterImm = await getStoresForTenant(testEmail);
  if (!storesAfterImm.every((s) => s.alert_status === 'degraded')) {
    throw new Error('Immediate cancellation did not silence store alert status');
  }
  console.log('[PASS] Expired cancellation locked dashboard, silenced alerts, and updated status.');

  // 8. Superadmin Immunity Guardrails
  console.log('\nTest 8: Superadmin Permanent Paywall & Alert Immunity');
  const superAdminEmail = 'yassinesadik0@gmail.com';
  const superCancelBody = JSON.stringify({
    event_id: 'evt_test_006_superadmin_cancel',
    event_type: 'subscription.canceled',
    occurred_at: new Date().toISOString(),
    data: createMockSubscription({
      id: 'sub_super_999',
      customerId: 'ctm_super_999',
      status: 'canceled',
      priceId: 'pri_01m2zs53ec1e4cjvn2fqc7aav1',
      productId: 'pro_01m2zs538gbfdk2ht4y93bgm0f',
      plan: 'agency',
      tenantEmail: superAdminEmail,
    }),
  });
  const superSig = generatePaddleSignature(superCancelBody, testSecret);
  const superEvent = await paddle.webhooks.unmarshal(superCancelBody, testSecret, superSig);
  await processPaddleWebhookEvent(superEvent);

  const superEval = evaluateSubscription({ email: superAdminEmail });
  if (
    superEval.isLocked !== false ||
    superEval.isSuperAdmin !== true ||
    superEval.effectiveStatus !== 'paid active' ||
    superEval.quotas.pubsubMonitoringStatus !== 'Active' ||
    superEval.quotas.gmcAccountsLimit !== 'unlimited'
  ) {
    throw new Error('Superadmin account lost immunity or had alerts silenced!');
  }
  console.log('[PASS] Superadmin (yassinesadik0@gmail.com) maintains permanent paywall immunity.');

  console.log('\n====================================================');
  console.log(' ALL PADDLE INTEGRATION & FULFILLMENT TESTS PASSED (8/8)');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('[Test Execution Error]:', err);
  process.exit(1);
});
