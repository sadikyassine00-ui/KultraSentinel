/**
 * Verification Script: Platform-Wide Test Isolation & Metric Sanitization (Directive §1, §2, §3)
 * 
 * Run with: npx tsx scripts/verify_test_isolation_and_metric_sanitization.ts
 */

import assert from 'assert';
import { createSessionToken } from '../src/lib/auth';
import {
  claimStoreForTenant,
  createTenant,
  findTenantByEmail,
  getStoreForTenant,
  getIncidentsByStore,
  dismissOrAcknowledgeIncident,
  upsertIncident,
  getDb,
  ensureSchema,
} from '../src/lib/db';

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('--- Test Suite: Platform-Wide Test Isolation & Metric Sanitization ---');
  console.log('=============================================================\n');

  await ensureSchema();

  const testEmail = `test-isolation-${Date.now()}@example.com`;
  const gmcId = `9900${Math.floor(Math.random() * 8999 + 1000)}`;

  const token = await createSessionToken({
    email: testEmail,
    name: 'Test Isolation',
    role: 'user',
    id: 1,
  });

  // Setup: Create a tenant with 0 products initially
  console.log('[Setup] Creating test tenant with 0 GMC products...');
  const tenant = await createTenant({
    email: testEmail,
    companyName: 'Test Isolation Labs',
    accountPlan: 'solo',
  });

  const claim = await claimStoreForTenant({
    tenantId: tenant.id,
    tenantEmail: testEmail,
    gmcId,
    storeUrl: 'https://test-isolation-store.myshopify.com',
    storeName: 'Test Isolation Store',
    accountType: 'Standalone Merchant',
  });

  assert(claim.success && claim.store, 'Store must be successfully claimed');
  const storeId = claim.store.id;

  const initialStore = await getStoreForTenant(storeId, testEmail);
  assert.strictEqual(initialStore?.open_disapprovals, 0, 'Initial open_disapprovals must be 0');
  assert.strictEqual(initialStore?.total_caught, 0, 'Initial total_caught must be 0');
  console.log('✅ PASS: Tenant and store initialized with 0 disapprovals and 0 products.\n');

  // ---------------------------------------------------------------------------
  // Test 1: Ephemeral Execution for Test Pings (verify-webhook)
  // ---------------------------------------------------------------------------
  console.log('[Test 1] Testing ephemeral execution for Slack verification ping...');
  const { POST: verifyWebhookHandler } = await import('../src/app/api/stores/[id]/verify-webhook/route');

  // Mock Request to verify-webhook
  const mockWebhookUrl = 'https://hooks.slack.com/services/T000/B000/MOCK_ISOLATION_PING';
  const pingReq = new Request(`http://localhost:3000/api/stores/${storeId}/verify-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-test-email': testEmail,
    },
    body: JSON.stringify({
      storeId: String(storeId),
      webhookUrl: mockWebhookUrl,
      channel: '#test-alerts',
    }),
  });

  // Note: Since mock webhook URL won't deliver to Slack, handler will return 422 or fail delivery,
  // but critically, ZERO incidents must be inserted!
  await verifyWebhookHandler(pingReq, { params: Promise.resolve({ id: String(storeId) }) });

  // Verify DB/Memory state
  const incidentsAfterPing = await getIncidentsByStore(storeId, testEmail);
  const storeAfterPing = await getStoreForTenant(storeId, testEmail);

  const hasDemoIncident = incidentsAfterPing.some((i) => i.sku === 'DEMO-RUNNER-402');
  assert.strictEqual(hasDemoIncident, false, 'verify-webhook must NEVER insert DEMO-RUNNER-402 incident into database');
  assert.strictEqual(storeAfterPing?.open_disapprovals, 0, 'verify-webhook must NOT mutate store open_disapprovals');
  assert.strictEqual(storeAfterPing?.total_caught, 0, 'verify-webhook must NOT mutate store total_caught');
  console.log('✅ PASS: Test ping executed ephemerally with ZERO incident creation or counter mutation.\n');

  // ---------------------------------------------------------------------------
  // Test 2: Mandatory Simulation Tagging & Isolation for Fire Drills (simulate)
  // ---------------------------------------------------------------------------
  console.log('[Test 2] Testing fire drill simulation isolation and tagging...');
  const { POST: simulateHandler } = await import('../src/app/api/stores/[id]/simulate/route');

  const simReq = new Request(`http://localhost:3000/api/stores/${storeId}/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-test-email': testEmail,
    },
    body: JSON.stringify({
      storeId: String(storeId),
      sku: 'DEMO-RUNNER-402',
      title: 'Apex Carbon Runner - Size 10.5 (Demo Item)',
      issueCode: 'item_disapproved: missing_required_attribute [gtin]',
    }),
  });

  const simRes = await simulateHandler(simReq, { params: Promise.resolve({ id: String(storeId) }) });
  const simJson = await simRes.json();
  assert.strictEqual(simRes.status, 200, `Simulate route should succeed, got ${simRes.status}: ${JSON.stringify(simJson)}`);
  assert.strictEqual(simJson.success, true, 'Simulate response must indicate success');

  // Verify incident is tagged as simulated AND test
  const incidentsAfterSim = await getIncidentsByStore(storeId, testEmail);
  const simIncident = incidentsAfterSim.find((i) => i.sku === 'DEMO-RUNNER-402');
  assert(simIncident, 'Simulated incident must exist for UI inspection in triage feed');
  assert.strictEqual(simIncident.is_simulated, true, 'Incident must be tagged with is_simulated: true');
  assert.strictEqual(simIncident.is_test, true, 'Incident must be tagged with is_test: true');

  // Verify store counters were NEVER incremented
  const storeAfterSim = await getStoreForTenant(storeId, testEmail);
  assert.strictEqual(storeAfterSim?.open_disapprovals, 0, 'Simulation must NEVER increment store open_disapprovals');
  assert.strictEqual(storeAfterSim?.total_caught, 0, 'Simulation must NEVER increment store total_caught');
  console.log('✅ PASS: Fire drill incident tagged with is_simulated & is_test, and store counters remained at 0.\n');

  // ---------------------------------------------------------------------------
  // Test 3: Dashboard Metric Sanitization for Zero-Product Store
  // ---------------------------------------------------------------------------
  console.log('[Test 3] Testing dashboard metrics for store with 0 products after simulation...');
  const { GET: dashboardHandler } = await import('../src/app/api/dashboard/route');

  const dashReq = new Request(`http://localhost:3000/api/dashboard?store_id=${storeId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-test-email': testEmail,
    },
  });

  const dashRes = await dashboardHandler(dashReq);
  const dashJson = await dashRes.json();
  assert.strictEqual(dashRes.status, 200, 'Dashboard request must succeed');

  // Authentic catalog data as sole source of truth:
  assert.strictEqual(
    dashJson.metrics.monitoredProducts,
    0,
    `monitoredProducts must be strictly 0 for zero-product store, got: ${dashJson.metrics.monitoredProducts}`
  );
  assert.strictEqual(
    dashJson.metrics.approvedProducts,
    0,
    `approvedProducts must be strictly 0 for zero-product store, got: ${dashJson.metrics.approvedProducts}`
  );
  assert.strictEqual(
    dashJson.metrics.activeDisapprovals,
    0,
    `activeDisapprovals must omit simulated fire drill, got: ${dashJson.metrics.activeDisapprovals}`
  );
  assert.strictEqual(
    dashJson.criticalIncident,
    null,
    'criticalIncident must be null when only simulated incidents exist'
  );

  console.log('✅ PASS: Dashboard metrics strictly show 0 monitored products, 0 approved, and 0 active disapprovals.\n');

  // ---------------------------------------------------------------------------
  // Test 4: Dashboard Metric Sanitization with Authentic Products
  // ---------------------------------------------------------------------------
  console.log('[Test 4] Testing dashboard metrics with authentic products + fire drill...');
  // Update tenant to have 250 authentic products
  const sql = getDb();
  if (sql) {
    await sql`UPDATE tenants SET total_skus = 250 WHERE LOWER(email) = ${testEmail.toLowerCase()};`;
  } else {
    tenant.total_skus = 250;
  }

  const dashReq2 = new Request(`http://localhost:3000/api/dashboard?store_id=${storeId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-test-email': testEmail,
    },
  });

  const dashRes2 = await dashboardHandler(dashReq2);
  const dashJson2 = await dashRes2.json();

  assert.strictEqual(dashJson2.metrics.monitoredProducts, 250, 'monitoredProducts must equal authentic GMC count 250');
  assert.strictEqual(dashJson2.metrics.approvedProducts, 250, 'approvedProducts must equal 250 (not decremented by simulation)');
  assert.strictEqual(dashJson2.metrics.activeDisapprovals, 0, 'activeDisapprovals must be 0 (simulation excluded)');

  console.log('✅ PASS: Authentic products (250) are preserved and not polluted by simulation.\n');

  // ---------------------------------------------------------------------------
  // Test 5: Dismissal of Simulated Incident Does Not Decrement Real Counters
  // ---------------------------------------------------------------------------
  console.log('[Test 5] Testing dismissal of simulated incident...');
  const dismissResult = await dismissOrAcknowledgeIncident(simIncident.id, testEmail);
  assert.strictEqual(dismissResult.success, true, 'Dismissal should succeed');
  assert.strictEqual(dismissResult.isSimulated, true, 'Dismissal should recognize simulated incident');

  const storeAfterDismiss = await getStoreForTenant(storeId, testEmail);
  assert.strictEqual(storeAfterDismiss?.open_disapprovals, 0, 'open_disapprovals must remain 0 and not decrement below 0');

  const incidentsAfterDismiss = await getIncidentsByStore(storeId, testEmail);
  assert.strictEqual(incidentsAfterDismiss.length, 0, 'Simulated incident should be completely cleared after dismissal');

  console.log('✅ PASS: Simulated incident dismissed without corrupting store counters.\n');

  // Cleanup test tenant
  if (sql) {
    await sql`DELETE FROM incidents WHERE store_id = ${String(storeId)};`;
    await sql`DELETE FROM stores WHERE id = ${String(storeId)};`;
    await sql`DELETE FROM tenants WHERE LOWER(email) = ${testEmail.toLowerCase()};`;
  }

  console.log('=============================================================');
  console.log('>>> ALL 5 TEST SUITES PASSED FLAWLESSLY! <<<');
  console.log('=============================================================\n');
}

runTestSuite().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
