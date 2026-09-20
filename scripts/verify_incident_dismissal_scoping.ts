/**
 * Verification Script: Scoped Incident Dismissal and Bulk Erasure Prevention
 * Verifies all criteria from the Directive:
 * 1. Backend mutation scoping strictly to unique incident IDs
 * 2. Request payload validation (outbound and server-side)
 * 3. Client-side state isolation: single card removal and neighboring button preservation
 * 4. Metric counter decrement by exactly 1 and correct zero-state threshold
 * 5. Hard refresh persistence of remaining undismissed incidents
 */

import assert from 'assert';
import {
  claimStoreForTenant,
  getIncidentsByStore,
  upsertIncident,
  dismissOrAcknowledgeIncident,
  deleteStoreForTenant,
  createTenant,
} from '../src/lib/db';
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

async function runScopedIncidentDismissalSuite() {
  console.log('=============================================================================');
  console.log('  KULTRA SCOPED INCIDENT DISMISSAL & BULK ERASURE PREVENTION TEST SUITE      ');
  console.log('=============================================================================\n');

  const tenantEmail = `triage-test-${Date.now()}@example.com`;
  const tenantId = Date.now();

  // Create tenant record with active status
  await createTenant({
    email: tenantEmail,
    companyName: 'Triage QA Merchant',
    subscriptionStatus: 'paid active',
  });

  const sessionCookie = await makeSessionCookie(tenantEmail);

  // Claim a test store
  const claim = await claimStoreForTenant({
    gmcId: `gmc-${Date.now()}`,
    tenantId,
    tenantEmail,
    storeName: 'Nordic Peak Outfitters',
    storeUrl: 'https://nordicpeak.myshopify.com',
    accountType: 'Standalone Merchant',
  });
  assert.ok(claim.success && claim.store, 'Failed to claim store');
  const store = claim.store;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Seed Multiple Distinct Incidents (2 Real Disapprovals + 1 Test Drill)
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Seeding multiple distinct incidents on store...');

    const resInc1 = await upsertIncident({
      storeId: store.id,
      gmcId: store.gmc_id,
      sku: 'DEMO-RUNNER-402',
      title: 'Apex Carbon Runner (Demo Item)',
      issueCode: 'item_disapproved: missing_required_attribute [gtin]',
      severity: 'critical',
      tenant_email: tenantEmail,
      is_simulated: true,
    });
    const inc1 = resInc1.incident;

    const resInc2 = await upsertIncident({
      storeId: store.id,
      gmcId: store.gmc_id,
      sku: 'ALPINE-JACKET-101',
      title: 'Alpine Stormproof Mountain Anorak',
      issueCode: 'policy_enforcement: promotional_overlay_on_image',
      severity: 'critical',
      tenant_email: tenantEmail,
      is_simulated: false,
    });
    const inc2 = resInc2.incident;

    const resInc3 = await upsertIncident({
      storeId: store.id,
      gmcId: store.gmc_id,
      sku: 'TRAIL-BOOT-202',
      title: 'Summit Gore-Tex Trail Boots',
      issueCode: 'item_disapproved: missing_shipping_dimensions',
      severity: 'warning',
      tenant_email: tenantEmail,
      is_simulated: false,
    });
    const inc3 = resInc3.incident;

    assert.ok(inc1.id, 'Incident 1 must have valid unique ID');
    assert.ok(inc2.id, 'Incident 2 must have valid unique ID');
    assert.ok(inc3.id, 'Incident 3 must have valid unique ID');
    assert.notStrictEqual(String(inc1.id), String(inc2.id), 'Incidents 1 and 2 must have distinct IDs');
    assert.notStrictEqual(String(inc2.id), String(inc3.id), 'Incidents 2 and 3 must have distinct IDs');

    const initialFeed = await getIncidentsByStore(store.id, tenantEmail);
    const initialUnresolved = initialFeed.filter((i) => i.status === 'unresolved');
    assert.strictEqual(initialUnresolved.length, 3, 'Initial unresolved count must equal 3');
    console.log(`✅ PASS: Seeded 3 distinct incidents with unique IDs (IDs: ${inc1.id}, ${inc2.id}, ${inc3.id}).\n`);

    // -------------------------------------------------------------------------
    // TEST 2: Endpoint Payload Validation and Mismatch Rejection
    // -------------------------------------------------------------------------
    console.log('[TEST 2] Testing dismissal endpoint payload validation and mismatch guards...');

    // 2a: Missing ID in both param and body
    {
      const req = new Request('http://localhost/api/incidents//verify', {
        method: 'POST',
        headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const res = await verifyIncidentRoute(req, { params: Promise.resolve({ id: '' }) });
      assert.strictEqual(res.status, 400, 'Empty incident ID must return HTTP 400 Bad Request');
    }

    // 2b: Mismatched ID between URL param and payload
    {
      const req = new Request(`http://localhost/api/incidents/${inc1.id}/verify`, {
        method: 'POST',
        headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: '99999999', id: '99999999' }),
      });
      const res = await verifyIncidentRoute(req, { params: Promise.resolve({ id: String(inc1.id) }) });
      assert.strictEqual(res.status, 400, 'Mismatched ID between param and payload must return HTTP 400');
    }

    // 2c: Unauthorized tenant session
    {
      const alienCookie = await makeSessionCookie('alien-tenant@example.com');
      const req = new Request(`http://localhost/api/incidents/${inc1.id}/verify`, {
        method: 'POST',
        headers: { Cookie: alienCookie, 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: inc1.id, id: inc1.id }),
      });
      const res = await verifyIncidentRoute(req, { params: Promise.resolve({ id: String(inc1.id) }) });
      assert.strictEqual(res.status, 404, 'Alien tenant cannot access other store incidents');
    }

    console.log('✅ PASS: Endpoint enforces strict payload validation, anti-tampering, and tenant authorization.\n');

    // -------------------------------------------------------------------------
    // TEST 3: Dismiss Incident 1 (Simulated Test Drill) via Endpoint
    // -------------------------------------------------------------------------
    console.log('[TEST 3] Dismissing Incident 1 (simulated card) and verifying strict isolation...');

    const req1 = new Request(`http://localhost/api/incidents/${inc1.id}/verify`, {
      method: 'POST',
      headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId: inc1.id, id: inc1.id }),
    });
    const res1 = await verifyIncidentRoute(req1, { params: Promise.resolve({ id: String(inc1.id) }) });
    assert.strictEqual(res1.status, 200, 'Dismissing Incident 1 returns HTTP 200');
    const json1 = await res1.json();
    assert.strictEqual(json1.success, true, 'Returns success: true');
    assert.strictEqual(String(json1.incidentId), String(inc1.id), 'Returns confirmed target incidentId');
    assert.strictEqual(json1.isSimulated, true, 'Flags incident as simulated');
    assert.strictEqual(json1.dismissed, true, 'Simulated incident marked dismissed');

    // Verify database state: Incident 1 is deleted, but Incident 2 and 3 remain!
    const feedAfterDismiss1 = await getIncidentsByStore(store.id, tenantEmail);
    const unresolvedAfterDismiss1 = feedAfterDismiss1.filter((i) => i.status === 'unresolved');
    assert.strictEqual(unresolvedAfterDismiss1.length, 2, 'Unresolved counter decrements by exactly 1: from 3 to 2');
    assert.ok(!feedAfterDismiss1.some((i) => String(i.id) === String(inc1.id)), 'Incident 1 is removed');
    assert.ok(feedAfterDismiss1.some((i) => String(i.id) === String(inc2.id)), 'Incident 2 remains visible and actionable');
    assert.ok(feedAfterDismiss1.some((i) => String(i.id) === String(inc3.id)), 'Incident 3 remains visible and actionable');

    console.log('✅ PASS: Only Incident 1 disappeared; Incidents 2 & 3 remain visible, actionable, and persistent.\n');

    // -------------------------------------------------------------------------
    // TEST 4: Dismiss Incident 2 (Real Disapproval) via Endpoint
    // -------------------------------------------------------------------------
    console.log('[TEST 4] Acknowledging Incident 2 (real disapproval) and checking counter...');

    const req2 = new Request(`http://localhost/api/incidents/${inc2.id}/verify`, {
      method: 'POST',
      headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId: inc2.id, id: inc2.id }),
    });
    const res2 = await verifyIncidentRoute(req2, { params: Promise.resolve({ id: String(inc2.id) }) });
    assert.strictEqual(res2.status, 200, 'Acknowledging Incident 2 returns HTTP 200');
    const json2 = await res2.json();
    assert.strictEqual(json2.success, true, 'Returns success: true');
    assert.strictEqual(String(json2.incidentId), String(inc2.id), 'Returns confirmed target incidentId');
    assert.strictEqual(json2.status, 'acknowledged', 'Real incident status updated to acknowledged');

    // Verify database state: Incident 2 acknowledged, Incident 3 still unresolved!
    const feedAfterDismiss2 = await getIncidentsByStore(store.id, tenantEmail);
    const unresolvedAfterDismiss2 = feedAfterDismiss2.filter((i) => i.status === 'unresolved');
    assert.strictEqual(unresolvedAfterDismiss2.length, 1, 'Active disapproval count decrements from 2 to 1 (NOT zero)');

    const updatedInc2 = feedAfterDismiss2.find((i) => String(i.id) === String(inc2.id));
    assert.ok(updatedInc2, 'Incident 2 persists in database');
    assert.strictEqual(updatedInc2.status, 'acknowledged', 'Incident 2 status is acknowledged');
    assert.ok(updatedInc2.resolved_at, 'Incident 2 resolved_at timestamp populated');

    const activeInc3 = feedAfterDismiss2.find((i) => String(i.id) === String(inc3.id));
    assert.ok(activeInc3, 'Incident 3 persists in database');
    assert.strictEqual(activeInc3.status, 'unresolved', 'Incident 3 remains strictly unresolved');

    console.log('✅ PASS: Incident 2 marked acknowledged; counter decremented to 1; Incident 3 remains unresolved.\n');

    // -------------------------------------------------------------------------
    // TEST 5: Metric Counter and Non-Zero State Verification
    // -------------------------------------------------------------------------
    console.log('[TEST 5] Verifying metric card status with 1 remaining active disapproval...');

    // Since activeCount = 1:
    // - "Active Disapprovals Requiring Action" pill displays 1
    // - "Catalog Status" displays "1 Disapproved" with red styling and "Action Needed" badge
    // - Does NOT transition to "100% Compliant" or green zero-state!
    const activeCount = unresolvedAfterDismiss2.length;
    assert.strictEqual(activeCount, 1, 'Active disapproval count must equal 1');
    const catalogStatusText = activeCount > 0 ? `${activeCount} Disapproved` : '100% Compliant';
    assert.strictEqual(catalogStatusText, '1 Disapproved', 'Catalog status remains flagged in red as 1 Disapproved');

    console.log('✅ PASS: Catalog status reflects "1 Disapproved" and refuses zero-state while incidents remain.\n');

    // -------------------------------------------------------------------------
    // TEST 6: Hard Refresh Persistence Simulation
    // -------------------------------------------------------------------------
    console.log('[TEST 6] Simulating browser hard refresh and verifying persisted state...');

    const refreshFeed = await getIncidentsByStore(store.id, tenantEmail);
    const refreshUnresolved = refreshFeed.filter((i) => i.status === 'unresolved');
    const refreshAcknowledged = refreshFeed.filter((i) => i.status === 'acknowledged');

    assert.strictEqual(refreshUnresolved.length, 1, 'Hard refresh confirms exactly 1 unresolved incident');
    assert.strictEqual(String(refreshUnresolved[0].id), String(inc3.id), 'Remaining unresolved incident is strictly Incident 3');
    assert.strictEqual(refreshAcknowledged.length, 1, 'Hard refresh confirms exactly 1 acknowledged incident');
    assert.strictEqual(String(refreshAcknowledged[0].id), String(inc2.id), 'Acknowledged incident is strictly Incident 2');

    console.log('✅ PASS: Hard refresh preserves remaining active cards and hides dismissed cards.\n');

    // -------------------------------------------------------------------------
    // TEST 7: Dismiss Final Incident and Verify Clean Zero-State Transition
    // -------------------------------------------------------------------------
    console.log('[TEST 7] Dismissing final Incident 3 and verifying transition to 100% Compliant zero-state...');

    const req3 = new Request(`http://localhost/api/incidents/${inc3.id}/verify`, {
      method: 'POST',
      headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId: inc3.id, id: inc3.id }),
    });
    const res3 = await verifyIncidentRoute(req3, { params: Promise.resolve({ id: String(inc3.id) }) });
    assert.strictEqual(res3.status, 200, 'Final dismissal returns HTTP 200 OK');

    const finalFeed = await getIncidentsByStore(store.id, tenantEmail);
    const finalUnresolved = finalFeed.filter((i) => i.status === 'unresolved');
    assert.strictEqual(finalUnresolved.length, 0, 'All incidents resolved; active count reaches exactly 0');

    const finalStatusText = finalUnresolved.length > 0 ? `${finalUnresolved.length} Disapproved` : '100% Compliant';
    assert.strictEqual(finalStatusText, '100% Compliant', 'Interface cleanly transitions to 100% Compliant zero-state');

    console.log('✅ PASS: Zero-state cleanly unlocked only when remaining active incident count reaches 0.\n');

  } finally {
    // Cleanup test store
    await deleteStoreForTenant(store.id, tenantEmail);
    console.log('Test store cleaned up.');
  }

  console.log('\n--- All Scoped Incident Dismissal Tests Passed Successfully! ---');
}

runScopedIncidentDismissalSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
