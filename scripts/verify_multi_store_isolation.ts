/**
 * Verification Script: Multi-Store Data Isolation, Store Identification, and Incident Dismissal Mechanics
 * Tests acceptance criteria from the Directive.
 */

import assert from 'assert';
import {
  claimStoreForTenant,
  getIncidentsByStore,
  upsertIncident,
  dismissOrAcknowledgeIncident,
  deleteStoreForTenant,
  getStoresForTenant,
} from '../src/lib/db';

async function testSuite() {
  console.log('--- Starting Multi-Store Isolation & Incident Dismissal Test Suite ---\n');

  const tenantEmail = `test-isolation-${Date.now()}@example.com`;
  const tenantId = 99999;

  // ---------------------------------------------------------------------------
  // TEST 1: Authentic Store Identification & Creation
  // ---------------------------------------------------------------------------
  console.log('Test 1: Connecting two distinct stores under a single user profile...');
  const claimA = await claimStoreForTenant({
    gmcId: '881100111',
    tenantId,
    tenantEmail,
    storeName: 'Patagonia Gear Lab',
    storeUrl: 'https://patagoniagear.com/shop',
    accountType: 'Standalone Merchant',
  });
  assert.ok(claimA.success && claimA.store, 'Failed to claim Store A');
  const storeA = claimA.store;

  const claimB = await claimStoreForTenant({
    gmcId: '881100222',
    tenantId,
    tenantEmail,
    storeName: 'Arcteryx Technical Lab',
    storeUrl: 'https://arcteryxalpha.com',
    accountType: 'Standalone Merchant',
  });
  assert.ok(claimB.success && claimB.store, 'Failed to claim Store B');
  const storeB = claimB.store;

  assert.strictEqual(storeA.store_name, 'Patagonia Gear Lab', 'Store A must have authentic business name');
  assert.strictEqual(storeB.store_name, 'Arcteryx Technical Lab', 'Store B must have authentic business name');
  console.log('✅ PASS: Both stores registered with authentic business names and clean URLs.\n');

  try {
    // ---------------------------------------------------------------------------
    // TEST 2: Multi-Store Data Isolation & Scoped Queries
    // ---------------------------------------------------------------------------
    console.log('Test 2: Triggering incidents on Store A and verifying strict isolation from Store B...');

    // 1. Simulated test drill on Store A
    const simResult = await upsertIncident({
      storeId: storeA.id,
      gmcId: storeA.gmc_id,
      sku: 'DEMO-RUNNER-402',
      title: 'Apex Carbon Runner - Size 10.5 (Demo Item)',
      issueCode: 'item_disapproved: missing_required_attribute [gtin]',
      severity: 'critical',
      tenant_email: tenantEmail,
      is_simulated: true,
      details: { simulated: true },
    });
    const simIncident = simResult.incident;

    // 2. Real disapproval on Store A
    const realResult = await upsertIncident({
      storeId: storeA.id,
      gmcId: storeA.gmc_id,
      sku: 'PATAGONIA-VEST-01',
      title: 'Patagonia Nano Puff Vest',
      issueCode: 'item_disapproved: price_mismatch',
      severity: 'critical',
      tenant_email: tenantEmail,
      is_simulated: false,
    });
    const realIncident = realResult.incident;

    // Verify Store A incidents
    const incidentsA = await getIncidentsByStore(storeA.id, tenantEmail);
    assert.strictEqual(incidentsA.length, 2, 'Store A should have exactly 2 incidents');
    console.log(`Store A has ${incidentsA.length} incidents.`);

    // Verify Store B incidents (MUST BE ZERO LEAKAGE)
    const incidentsB = await getIncidentsByStore(storeB.id, tenantEmail);
    assert.strictEqual(incidentsB.length, 0, 'Store B MUST have 0 incidents (no cross-store leakage)');
    console.log('✅ PASS: Store B is completely isolated and unaffected by Store A test and real incidents.\n');

    // ---------------------------------------------------------------------------
    // TEST 3: Instant Dismissal and Cleanup of Simulated Test Incidents
    // ---------------------------------------------------------------------------
    console.log('Test 3: Dismissing simulated test drill incident on Store A...');
    const dismissSim = await dismissOrAcknowledgeIncident(simIncident.id, tenantEmail);
    assert.strictEqual(dismissSim.success, true, 'Dismiss action should succeed');
    assert.strictEqual(dismissSim.isSimulated, true, 'Should detect incident as simulated');
    assert.strictEqual(dismissSim.dismissed, true, 'Should mark simulated incident as dismissed');
    assert.strictEqual(dismissSim.message, 'Test incident cleared.', 'Confirmation message must match directive');

    // Verify simulated incident is permanently deleted
    const incidentsAAfterSimDismiss = await getIncidentsByStore(storeA.id, tenantEmail);
    const hasSim = incidentsAAfterSimDismiss.some((i) => String(i.id) === String(simIncident.id));
    assert.strictEqual(hasSim, false, 'Simulated incident must be permanently deleted from database');
    assert.strictEqual(incidentsAAfterSimDismiss.length, 1, 'Only real incident should remain on Store A');
    console.log('✅ PASS: Test incident permanently deleted on dismissal with "Test incident cleared." confirmation.\n');

    // ---------------------------------------------------------------------------
    // TEST 4: Dismissal of Real Disapproval (Acknowledge Mechanics)
    // ---------------------------------------------------------------------------
    console.log('Test 4: Dismissing real disapproval on Store A...');
    const dismissReal = await dismissOrAcknowledgeIncident(realIncident.id, tenantEmail);
    assert.strictEqual(dismissReal.success, true, 'Dismiss action should succeed');
    assert.strictEqual(dismissReal.isSimulated, false, 'Should detect incident as real');
    assert.strictEqual(dismissReal.status, 'acknowledged', 'Real incident status must be updated to acknowledged');
    assert.strictEqual(dismissReal.message, 'Incident acknowledged.', 'Confirmation message must match directive');

    // Verify real incident status in database
    const incidentsAAfterRealDismiss = await getIncidentsByStore(storeA.id, tenantEmail);
    const updatedReal = incidentsAAfterRealDismiss.find((i) => String(i.id) === String(realIncident.id));
    assert.ok(updatedReal, 'Real incident should still exist in database');
    assert.strictEqual(updatedReal.status, 'acknowledged', 'Status must be acknowledged');
    assert.ok(updatedReal.resolved_at, 'resolved_at timestamp must be populated');
    console.log('✅ PASS: Real disapproval immediately updated to acknowledged with resolved timestamp.\n');

  } finally {
    // Cleanup test stores
    await deleteStoreForTenant(storeA.id, tenantEmail);
    await deleteStoreForTenant(storeB.id, tenantEmail);
    console.log('Cleaned up test stores.');
  }

  console.log('\n--- All Multi-Store Isolation & Dismissal Tests Passed Successfully! ---');
}

testSuite().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
