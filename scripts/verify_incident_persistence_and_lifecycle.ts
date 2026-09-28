/**
 * Verification Script: Permanent Incident Persistence, Retrieval, and Non-Destructive Lifecycle
 * Tests all 4 Core Engineering Directives:
 * 1. Dedicated incident schema with store association, external product ID, notification status, timestamps.
 * 2. Immediate ingestion persistence in Neon Postgres (zero data loss across page refreshes).
 * 3. Non-destructive incident lifecycle: status transitions to DISMISSED / resolved with timestamps, zero DELETE queries.
 * 4. Full chronological audit trail hydration with both active and resolved incidents.
 */

import assert from 'assert';
import {
  getDb,
  claimStoreForTenant,
  createTenant,
  getIncidentsByStore,
  upsertIncident,
  resolveIncident,
  updateIncidentNotificationStatus,
  ensureSchema,
} from '../src/lib/db';
import { getDashboardDataPayload } from '../src/lib/dashboard';
import { POST as pubsubIngestRoute } from '../src/app/api/ingest/pubsub/route';
import { POST as verifyIncidentRoute } from '../src/app/api/incidents/[id]/verify/route';
import { SignJWT } from 'jose';

const AUTH_SECRET = process.env.AUTH_SECRET || 'kultra-sentinel-fallback-secret-key-32-chars-min!';

async function makeSessionCookie(email: string, role = 'merchant') {
  const secret = new TextEncoder().encode(AUTH_SECRET);
  const token = await new SignJWT({ email, role, name: email.split('@')[0] })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  return `kultra_admin_session=${token}`;
}

async function runVerificationSuite() {
  console.log('=============================================================================');
  console.log('  KULTRA AUDIT LOG & PERMANENT INCIDENT PERSISTENCE TEST SUITE               ');
  console.log('=============================================================================\n');

  const tenantEmail = `audit-qa-${Date.now()}@agency-client.com`;
  const tenantId = Date.now();
  const gmcId = `gmc-${Date.now()}`;

  // Step 1: Ensure Schema
  console.log('[STEP 1] Validating Neon Postgres Schema & Incident Columns...');
  await ensureSchema();
  const sql = getDb();
  if (sql) {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'incidents';
    `;
    const colNames = columns.map((c: any) => c.column_name);
    console.log('  Detected columns in incidents table:', colNames.join(', '));
    assert.ok(colNames.includes('store_id'), 'Schema must include store_id');
    assert.ok(colNames.includes('sku'), 'Schema must include sku');
    assert.ok(colNames.includes('external_product_id'), 'Schema must include external_product_id');
    assert.ok(colNames.includes('title'), 'Schema must include title');
    assert.ok(colNames.includes('issue_code'), 'Schema must include issue_code');
    assert.ok(colNames.includes('severity'), 'Schema must include severity');
    assert.ok(colNames.includes('status'), 'Schema must include status');
    assert.ok(colNames.includes('notification_status'), 'Schema must include notification_status');
    assert.ok(colNames.includes('first_detected_at'), 'Schema must include first_detected_at');
    assert.ok(colNames.includes('resolved_at'), 'Schema must include resolved_at');
    assert.ok(colNames.includes('dismissed_at'), 'Schema must include dismissed_at');
    console.log('  ✅ PASS: All required incident model fields exist in Neon Postgres schema.\n');
  }

  // Step 2: Create Tenant & Claim Store
  console.log('[STEP 2] Setting up authenticated agency tenant & monitored store...');
  await createTenant({
    email: tenantEmail,
    companyName: 'Boutique PPC Agency Client',
    subscriptionStatus: 'paid active',
  });

  const claimResult = await claimStoreForTenant({
    gmcId,
    tenantId,
    tenantEmail,
    storeName: 'Nordic Velocity Footwear',
    storeUrl: 'https://nordicvelocity.com',
    accountType: 'Standalone Merchant',
  });
  assert.ok(claimResult.success && claimResult.store, 'Must successfully claim store');
  const store = claimResult.store;
  console.log(`  ✅ Store linked: ID ${store.id}, GMC #${gmcId} for ${tenantEmail}\n`);

  // Step 3: Test Immediate Pub/Sub Ingestion Persistence
  console.log('[STEP 3] Testing Pub/Sub Ingestion Immediate Persistence (Zero Data Loss)...');
  const pubsubMessage = {
    message: {
      data: Buffer.from(
        JSON.stringify({
          merchant_id: gmcId,
          sku: 'NORDIC-RUNNER-909',
          title: 'Nordic Velocity Elite Carbon Runner - Midnight Black',
          status: 'disapproved',
          issues: ['item_disapproved: missing_required_attribute [gtin]'],
          severity: 'critical',
          price: '$189.00',
        })
      ).toString('base64'),
      messageId: `msg-${Date.now()}-1`,
      publishTime: new Date().toISOString(),
    },
    subscription: 'projects/kultra-sentinel/subscriptions/gmc-product-events',
  };

  const pubsubReq = new Request('http://localhost:3000/api/ingest/pubsub', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pubsubMessage),
  });

  const pubsubRes = await pubsubIngestRoute(pubsubReq);
  const pubsubJson = await pubsubRes.json();
  assert.strictEqual(pubsubRes.status, 200, 'PubSub ingestion must return 200 OK');
  assert.strictEqual(pubsubJson.ok, true, 'PubSub status must be ok');
  console.log('  PubSub route response:', pubsubJson);

  // Directly check Neon Postgres database
  if (sql) {
    const dbRows = await sql`
      SELECT * FROM incidents
      WHERE store_id::text = ${String(store.id)} AND sku = 'NORDIC-RUNNER-909';
    `;
    assert.strictEqual(dbRows.length, 1, 'Incident must be written immediately to Neon Postgres');
    const inc = dbRows[0];
    assert.strictEqual(inc.sku, 'NORDIC-RUNNER-909', 'SKU must match');
    assert.strictEqual(inc.external_product_id, 'NORDIC-RUNNER-909', 'External Product ID must match');
    assert.strictEqual(inc.issue_code, 'item_disapproved: missing_required_attribute [gtin]', 'Issue code must match');
    assert.strictEqual(inc.status, 'unresolved', 'Status must be unresolved');
    assert.ok(inc.first_detected_at, 'Must have first_detected_at timestamp');
    console.log(`  ✅ PASS: Incident persisted in Neon Postgres with ID ${inc.id}, status=${inc.status}, notification_status=${inc.notification_status}.\n`);
  }

  // Step 4: Verify Dashboard Hydration across multiple page refreshes
  console.log('[STEP 4] Verifying Dashboard Server-Hydration & Refresh Persistence...');
  const firstHydration = await getDashboardDataPayload(tenantEmail, String(store.id));
  assert.strictEqual(firstHydration.status, 200, 'Dashboard payload must return 200');
  assert.ok(firstHydration.data, 'Dashboard payload must contain data');
  assert.strictEqual(firstHydration.data.incidents.length, 1, 'Dashboard must hydrate 1 persistent incident');
  const incidentPayload = firstHydration.data.incidents[0];
  assert.strictEqual(incidentPayload.sku, 'NORDIC-RUNNER-909');
  assert.strictEqual(incidentPayload.external_product_id, 'NORDIC-RUNNER-909');
  assert.strictEqual(incidentPayload.status, 'unresolved');
  console.log('  First hydration: loaded persistent incident', incidentPayload.id);

  // Simulate Hard Page Refresh with ensureSchema execution
  await ensureSchema();
  const secondHydration = await getDashboardDataPayload(tenantEmail, String(store.id));
  assert.strictEqual(secondHydration.data.incidents.length, 1, 'Incident must survive page refresh and schema check without deletion');
  console.log('  ✅ PASS: Incident remained intact across simulated hard page refresh.\n');

  // Step 5: Test Non-Destructive Dismissal Mutation
  console.log('[STEP 5] Testing Non-Destructive Dismissal Mutation (Zero Delete)...');
  const sessionCookie = await makeSessionCookie(tenantEmail);
  const targetIncidentId = incidentPayload.id;

  const dismissReq = new Request(`http://localhost:3000/api/incidents/${targetIncidentId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: sessionCookie,
    },
    body: JSON.stringify({ incidentId: targetIncidentId }),
  });

  const dismissRes = await verifyIncidentRoute(dismissReq, {
    params: Promise.resolve({ id: String(targetIncidentId) }),
  });
  const dismissJson = await dismissRes.json();
  assert.strictEqual(dismissRes.status, 200, 'Dismiss route must return 200');
  assert.strictEqual(dismissJson.success, true, 'Dismiss mutation must succeed');
  assert.strictEqual(dismissJson.status, 'DISMISSED', 'Status must be DISMISSED');

  // Authoritative Postgres check: row must NOT be deleted
  if (sql) {
    const afterDismissRows = await sql`
      SELECT * FROM incidents WHERE id::text = ${String(targetIncidentId)};
    `;
    assert.strictEqual(afterDismissRows.length, 1, 'Incident row must NEVER be deleted');
    const dismissedRow = afterDismissRows[0];
    assert.strictEqual(dismissedRow.status, 'DISMISSED', 'Database row status must be DISMISSED');
    assert.ok(dismissedRow.dismissed_at, 'dismissed_at timestamp must be recorded in Postgres');
    assert.ok(dismissedRow.resolved_at, 'resolved_at timestamp must be recorded in Postgres');
    console.log(`  ✅ PASS: Non-destructive update confirmed. Row exists in Neon DB with status=${dismissedRow.status}, dismissed_at=${dismissedRow.dismissed_at}.\n`);
  }

  // Step 6: Test Non-Destructive Resolution Lifecycle (Auto-Resolution via GMC Approval)
  console.log('[STEP 6] Testing Non-Destructive Auto-Resolution Lifecycle (GMC Product Approval)...');
  // Seed a second incident
  const secondInc = await upsertIncident({
    storeId: store.id,
    gmcId,
    sku: 'NORDIC-JACKET-404',
    title: 'Nordic Waterproof Expedition Shell',
    issueCode: 'policy_enforcement: promotional_overlay_on_image',
    severity: 'critical',
    tenant_email: tenantEmail,
  });

  // Resolve it via resolveIncident
  const resolveSuccess = await resolveIncident(store.id, 'NORDIC-JACKET-404');
  assert.ok(resolveSuccess, 'resolveIncident must return true');

  if (sql) {
    const resolvedRows = await sql`
      SELECT * FROM incidents WHERE store_id::text = ${String(store.id)} AND sku = 'NORDIC-JACKET-404';
    `;
    assert.strictEqual(resolvedRows.length, 1, 'Resolved incident must remain permanently in Neon Postgres');
    assert.strictEqual(resolvedRows[0].status, 'resolved', 'Status must be resolved');
    assert.ok(resolvedRows[0].resolved_at, 'resolved_at timestamp must be set');
    console.log(`  ✅ PASS: Resolved incident retained in Neon DB with status=resolved, resolved_at=${resolvedRows[0].resolved_at}.\n`);
  }

  // Step 7: Verify Full Chronological Audit Trail Hydration
  console.log('[STEP 7] Verifying Full Chronological Audit Trail (Active + Resolved + Dismissed)...');
  // Seed a third active incident
  await upsertIncident({
    storeId: store.id,
    gmcId,
    sku: 'NORDIC-GLOVE-777',
    title: 'Nordic Thermal Mountaineering Gloves',
    issueCode: 'item_disapproved: missing_shipping_dimensions',
    severity: 'warning',
    tenant_email: tenantEmail,
  });

  const fullAuditHydration = await getDashboardDataPayload(tenantEmail, String(store.id));
  assert.strictEqual(fullAuditHydration.data.incidents.length, 3, 'Audit log must contain all 3 incidents');

  const statuses = fullAuditHydration.data.incidents.map((i: any) => ({
    sku: i.sku,
    status: i.status,
    notification_status: i.notification_status,
  }));
  console.log('  Audit trail items:', statuses);

  const hasUnresolved = fullAuditHydration.data.incidents.some((i: any) => i.status === 'unresolved');
  const hasDismissed = fullAuditHydration.data.incidents.some((i: any) => i.status === 'DISMISSED');
  const hasResolved = fullAuditHydration.data.incidents.some((i: any) => i.status === 'resolved');

  assert.ok(hasUnresolved, 'Audit trail must include active incident');
  assert.ok(hasDismissed, 'Audit trail must include dismissed incident');
  assert.ok(hasResolved, 'Audit trail must include resolved incident');
  console.log('  ✅ PASS: Audit log contains all historical events (active, dismissed, and resolved).\n');

  console.log('=============================================================================');
  console.log('  ALL AUDIT LOG & PERMANENCE VERIFICATION TESTS PASSED SUCCESSFULLY!          ');
  console.log('=============================================================================');
}

runVerificationSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  });
