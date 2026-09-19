/**
 * Comprehensive Verification Script for:
 * 1. Enforce Active Store Parameter Passing on All Triggers (§1)
 * 2. Multi-Store Database Scoping and Incident Isolation (§2)
 * 3. Slack Message Enrichment and Error Translation Engine (§3)
 * 4. Verification and Acceptance Checklist (§4)
 */

import { translateGmcIssue } from '../src/lib/gmcErrors';
import { dispatchDisapprovalSlackNotification } from '../src/lib/slack';
import {
  claimStoreForTenant,
  updateStoreWebhook,
  getIncidentsByStore,
  upsertIncident,
  Store,
} from '../src/lib/db';

async function runVerification() {
  console.log('=== STARTING SLACK ALERT ATTRIBUTION & INCIDENT ISOLATION VERIFICATION ===\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: unknown, testName: string, detail?: string) {
    totalTests++;
    if (Boolean(condition)) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    }
  }

  // -------------------------------------------------------------
  // Test 1: Plain-English Error Translation Engine (§3)
  // -------------------------------------------------------------
  console.log('\n--- Test 1: Plain-English Error Translation Engine ---');
  
  // 1a. Missing GTIN / Barcode
  const gtinIssue = translateGmcIssue('item_disapproved: missing_required_attribute [gtin]');
  assert(
    gtinIssue.category === 'barcode' &&
    gtinIssue.explanation.includes('12- or 14-digit GTIN, UPC, or EAN') &&
    gtinIssue.fixAdvice.includes('Shopify') &&
    gtinIssue.fixAdvice.includes('barcode'),
    'GTIN error translates with 12/14-digit requirement and Shopify fix steps'
  );

  // 1b. Promotional Watermark / Image Crawl
  const imageIssue = translateGmcIssue('item_disapproved: promotional_overlay_on_image');
  assert(
    imageIssue.category === 'image' &&
    imageIssue.explanation.includes('promotional') &&
    imageIssue.explanation.includes('800x800') &&
    imageIssue.fixAdvice.includes('product image'),
    'Promotional watermark error translates with resolution and overlay rules'
  );

  // 1c. Price / Availability Mismatch
  const priceIssue = translateGmcIssue('item_disapproved: price_mismatch_crawl');
  assert(
    priceIssue.category === 'pricing' &&
    priceIssue.explanation.includes('landing page does not match') &&
    priceIssue.fixAdvice.includes('feed'),
    'Price mismatch error explains landing page vs feed discrepancy'
  );

  // 1d. Missing Shipping / Tax Attributes
  const shippingIssue = translateGmcIssue('item_disapproved: missing_shipping_attribute');
  assert(
    shippingIssue.category === 'shipping' &&
    shippingIssue.explanation.includes('shipping') &&
    shippingIssue.fixAdvice.includes('Merchant Center'),
    'Shipping attribute error explains undefined target country shipping rates'
  );

  // -------------------------------------------------------------
  // Test 2: Slack Message Enrichment & 4 Distinct Blocks (§3)
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Slack Message Enrichment & Dynamic Store Attribution Header ---');

  const mockStoreA: Store = {
    id: 9901,
    tenant_id: 901,
    account_type: 'Standalone Merchant',
    pubsub_topic: 'projects/kultra-sentinel/topics/gmc-284935066',
    store_url: 'patagonia-gear-lab.myshopify.com',
    store_name: 'Patagonia Gear Lab',
    gmc_id: '284935066',
    merchant_id: '284935066',
    tenant_email: 'test-tenant@example.com',
    status: 'active',
    alert_status: 'active',
    webhook_url: 'https://hooks.slack.com/services/MOCK/TEST/STORE_A',
    webhook_verified: true,
    total_caught: 0,
    open_disapprovals: 0,
    created_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  };

  const mockStoreB: Store = {
    id: 9902,
    tenant_id: 901,
    account_type: 'Standalone Merchant',
    pubsub_topic: 'projects/kultra-sentinel/topics/gmc-182703199',
    store_url: 'arcteryx-tech-studio.myshopify.com',
    store_name: "Arc'teryx Tech Studio",
    gmc_id: '182703199',
    merchant_id: '182703199',
    tenant_email: 'test-tenant@example.com',
    status: 'active',
    alert_status: 'active',
    webhook_url: 'https://hooks.slack.com/services/MOCK/TEST/STORE_B',
    webhook_verified: true,
    total_caught: 0,
    open_disapprovals: 0,
    created_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  };

  // Mock fetch to intercept Slack payload without hitting external servers
  const originalFetch = global.fetch;
  let lastDispatchedPayload: any = null;
  let lastDispatchedDestination: string | null = null;

  global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' ? input : input.toString();
    if (urlStr.includes('hooks.slack.com')) {
      lastDispatchedDestination = urlStr;
      lastDispatchedPayload = init?.body ? JSON.parse(init.body as string) : null;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return originalFetch(input, init);
  };

  try {
    // Dispatch test ping for Store A (gmc-284935066)
    await dispatchDisapprovalSlackNotification({
      store: mockStoreA,
      triggerType: 'Diagnostic Test Ping',
      incident: {
        sku: 'DEMO-RUNNER-402',
        title: 'Apex Carbon Runner - Size 10.5',
        price: '$165.00',
        issueCode: 'item_disapproved: missing_required_attribute [gtin]',
        severity: 'critical',
      },
      appUrl: 'https://app.usekultra.com',
    });

    assert(lastDispatchedDestination === mockStoreA.webhook_url, 'Store A dispatched to its own unique webhook URL');
    assert(Boolean(lastDispatchedPayload?.blocks), 'Store A payload contains Block Kit blocks');

    const blocksA = (lastDispatchedPayload?.blocks as Array<Record<string, unknown>>) || [];
    
    // Header & Attribution check
    const attributionBlockA = blocksA[1];
    const attributionTextA = (attributionBlockA?.text as Record<string, unknown>)?.text as string;

    assert(
      attributionTextA.includes('Patagonia Gear Lab') &&
      attributionTextA.includes('GMC #284935066') &&
      attributionTextA.includes('Diagnostic Test Ping'),
      'Store A header explicitly names Patagonia Gear Lab, GMC #284935066, and Diagnostic Test Ping'
    );

    // Block 1: Incident Summary
    const block1A = blocksA.find((b) => (b.text as Record<string, unknown>)?.text?.toString().includes('*SKU:* `DEMO-RUNNER-402`'));
    assert(
      Boolean(block1A) &&
      (block1A?.text as Record<string, unknown>)?.text?.toString().includes('*Price:* $165.00'),
      'Block 1 contains SKU, product title, and price ($165.00)'
    );

    // Block 2: Plain-English Explanation
    const block2A = blocksA.find((b) => (b.text as Record<string, unknown>)?.text?.toString().includes('*Why Google Blocked This Ad:*'));
    assert(
      Boolean(block2A) &&
      (block2A?.text as Record<string, unknown>)?.text?.toString().includes('12- or 14-digit GTIN, UPC, or EAN'),
      'Block 2 contains plain-English explanation of why Google blocked the ad'
    );

    // Block 3: Exact Steps to Resolve
    const block3A = blocksA.find((b) => (b.text as Record<string, unknown>)?.text?.toString().includes('*How to Fix:*'));
    assert(
      Boolean(block3A) &&
      (block3A?.text as Record<string, unknown>)?.text?.toString().includes('Shopify admin'),
      'Block 3 contains exact steps required to resolve the issue'
    );

    // Block 4: Direct Deep Link Action Button
    const block4A = blocksA.find((b) => b.type === 'actions');
    const actionsA = (block4A?.elements as Array<Record<string, unknown>>) || [];
    const triageButtonA = actionsA.find((a) => (a.text as Record<string, unknown>)?.text === 'Triage in Kultra');
    assert(
      Boolean(triageButtonA) &&
      triageButtonA?.url === `https://app.usekultra.com/dashboard?store_id=${mockStoreA.id}`,
      `Block 4 contains direct deep link button routing to Kultra triage with store_id=${mockStoreA.id}`
    );

    // Dispatch test ping for Store B (gmc-182703199)
    await dispatchDisapprovalSlackNotification({
      store: mockStoreB,
      triggerType: 'Diagnostic Test Ping',
      incident: {
        sku: 'ARC-SHELL-01',
        title: 'Alpha SV Jacket - Black / Medium',
        price: '$899.00',
        issueCode: 'item_disapproved: promotional_overlay_on_image',
        severity: 'critical',
      },
      appUrl: 'https://app.usekultra.com',
    });

    assert(lastDispatchedDestination === mockStoreB.webhook_url, 'Store B dispatched to its own unique webhook URL');
    const blocksB = (lastDispatchedPayload?.blocks as Array<Record<string, unknown>>) || [];
    const attributionBlockB = blocksB[1];
    const attributionTextB = (attributionBlockB?.text as Record<string, unknown>)?.text as string;

    assert(
      attributionTextB.includes("Arc'teryx Tech Studio") &&
      attributionTextB.includes('GMC #182703199') &&
      attributionTextB.includes('Diagnostic Test Ping'),
      "Store B header explicitly names Arc'teryx Tech Studio, GMC #182703199, and Diagnostic Test Ping"
    );

    // -------------------------------------------------------------
    // Test 3: Multi-Store Database Scoping & Incident Isolation (§2)
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Multi-Store Database Scoping & Incident Isolation ---');

    // Register both stores in DB
    const storeARes = await claimStoreForTenant({
      tenantEmail: 'test-tenant@example.com',
      tenantId: 901,
      gmcId: mockStoreA.gmc_id,
      storeUrl: mockStoreA.store_url,
      storeName: mockStoreA.store_name!,
    });
    const storeA = storeARes.store!;
    await updateStoreWebhook(storeA.id, 'test-tenant@example.com', mockStoreA.webhook_url!, true, 'active');

    const storeBRes = await claimStoreForTenant({
      tenantEmail: 'test-tenant@example.com',
      tenantId: 901,
      gmcId: mockStoreB.gmc_id,
      storeUrl: mockStoreB.store_url,
      storeName: mockStoreB.store_name!,
    });
    const storeB = storeBRes.store!;
    await updateStoreWebhook(storeB.id, 'test-tenant@example.com', mockStoreB.webhook_url!, true, 'active');

    assert(Boolean(storeA.id) && Boolean(storeB.id), 'Both Store A and Store B registered successfully');
    assert(String(storeA.id) !== String(storeB.id), 'Store A and Store B have distinct store IDs');

    // Simulate triggering a test ping in Store A ONLY
    await upsertIncident({
      storeId: storeA.id,
      gmcId: storeA.gmc_id,
      sku: 'DEMO-RUNNER-402',
      title: 'Apex Carbon Runner - Size 10.5 (Demo Item)',
      issueCode: 'item_disapproved: missing_required_attribute [gtin]',
      severity: 'critical',
      tenant_email: 'test-tenant@example.com',
      is_simulated: true,
      details: {
        simulated: true,
        source: 'diagnostic_test_ping',
      },
    });

    // Verify Store A has the incident
    const storeAIncidents = await getIncidentsByStore(storeA.id, 'test-tenant@example.com');
    assert(
      storeAIncidents.some((i) => i.sku === 'DEMO-RUNNER-402' && String(i.store_id) === String(storeA.id)),
      'Store A incident feed contains the test incident tagged with Store A ID'
    );

    // Verify Store B has ZERO incidents (zero cross-store contamination)
    const storeBIncidents = await getIncidentsByStore(storeB.id, 'test-tenant@example.com');
    assert(
      storeBIncidents.length === 0,
      'Store B incident feed is completely empty with ZERO leaked records from Store A'
    );

    // Now trigger a test ping for Store B
    await upsertIncident({
      storeId: storeB.id,
      gmcId: storeB.gmc_id,
      sku: 'ARC-SHELL-01',
      title: 'Alpha SV Jacket - Black / Medium',
      issueCode: 'item_disapproved: promotional_overlay_on_image',
      severity: 'critical',
      tenant_email: 'test-tenant@example.com',
      is_simulated: true,
      details: {
        simulated: true,
        source: 'diagnostic_test_ping',
      },
    });

    // Verify Store B has ONLY its incident and Store A has ONLY its incident
    const storeBIncidentsAfter = await getIncidentsByStore(storeB.id, 'test-tenant@example.com');
    const storeAIncidentsAfter = await getIncidentsByStore(storeA.id, 'test-tenant@example.com');

    assert(
      storeBIncidentsAfter.length === 1 && storeBIncidentsAfter[0].sku === 'ARC-SHELL-01',
      'Store B incident feed contains solely its own incident (ARC-SHELL-01)'
    );
    assert(
      storeAIncidentsAfter.length === 1 && storeAIncidentsAfter[0].sku === 'DEMO-RUNNER-402',
      'Store A incident feed still contains solely its own incident (DEMO-RUNNER-402)'
    );

    // -------------------------------------------------------------
    // Test 4: Enforce Active Store Parameter Passing on All Triggers (§1)
    // -------------------------------------------------------------
    console.log('\n--- Test 4: API Route Explicit storeId Validation ---');

    const { createSessionToken } = await import('../src/lib/token');
    const testToken = await createSessionToken({ email: 'test-tenant@example.com', role: 'user' });
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken}`,
    };

    const { POST: verifyWebhookHandler } = await import('../src/app/api/stores/[id]/verify-webhook/route');
    const { POST: simulateHandler } = await import('../src/app/api/stores/[id]/simulate/route');

    // 4a. verify-webhook: Missing storeId
    const reqMissingStoreId = new Request('http://localhost:3000/api/stores/9901/verify-webhook', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ webhookUrl: 'https://hooks.slack.com/services/TEST' }),
    });
    const resMissing = await verifyWebhookHandler(reqMissingStoreId, {
      params: Promise.resolve({ id: '9901' }),
    });
    assert(
      resMissing.status === 400,
      'verify-webhook rejects request missing storeId with HTTP 400'
    );

    // 4b. verify-webhook: Mismatched storeId
    const reqMismatched = new Request('http://localhost:3000/api/stores/9901/verify-webhook', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ storeId: '9902', webhookUrl: 'https://hooks.slack.com/services/TEST' }),
    });
    const resMismatched = await verifyWebhookHandler(reqMismatched, {
      params: Promise.resolve({ id: '9901' }),
    });
    assert(
      resMismatched.status === 400,
      'verify-webhook rejects mismatched storeId (body: 9902, route: 9901) with HTTP 400'
    );

    // 4c. simulate: Missing storeId
    const reqSimMissing = new Request('http://localhost:3000/api/stores/9901/simulate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const resSimMissing = await simulateHandler(reqSimMissing, {
      params: Promise.resolve({ id: '9901' }),
    });
    assert(
      resSimMissing.status === 400,
      'simulate rejects request missing storeId with HTTP 400'
    );

    // 4d. simulate: Mismatched storeId
    const reqSimMismatched = new Request('http://localhost:3000/api/stores/9901/simulate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ storeId: '9902' }),
    });
    const resSimMismatched = await simulateHandler(reqSimMismatched, {
      params: Promise.resolve({ id: '9901' }),
    });
    assert(
      resSimMismatched.status === 400,
      'simulate rejects mismatched storeId with HTTP 400'
    );

  } finally {
    global.fetch = originalFetch;
  }

  console.log(`\n=== VERIFICATION RESULTS: ${passedTests}/${totalTests} TESTS PASSED ===\n`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL ASSERTIONS PASSED WITH ZERO CROSS-CONTAMINATION!');
    process.exit(0);
  } else {
    console.error('💥 SOME TESTS FAILED!');
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
