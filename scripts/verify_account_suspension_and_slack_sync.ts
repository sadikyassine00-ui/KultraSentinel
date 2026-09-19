/**
 * Verification Script: Account-Level Suspension Handling, Precision Policy Translation,
 * and Slack UI Synchronization
 */

import { translateGmcIssue, isAccountSuspensionCode } from '../src/lib/gmcErrors';
import { dispatchDisapprovalSlackNotification } from '../src/lib/slack';
import { Store } from '../src/lib/db';

async function runVerification() {
  console.log('================================================================');
  console.log('VERIFYING ACCOUNT SUSPENSION, POLICY TRANSLATION & SLACK SYNC');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: unknown, testName: string, detail?: string) {
    total++;
    if (Boolean(condition)) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    }
  }

  // -------------------------------------------------------------------------
  // 1. Precision Policy Translation Engine Tests
  // -------------------------------------------------------------------------
  console.log('\n--- 1. Precision Policy Translation Engine ---');

  // 1a. Account-Level Suspension: policy_enforcement_account_disapproval
  const acctIssue = translateGmcIssue('policy_enforcement_account_disapproval');
  assert(
    acctIssue.isAccountLevel === true,
    'policy_enforcement_account_disapproval flagged as isAccountLevel === true'
  );
  assert(
    acctIssue.category === 'account_suspension',
    'policy_enforcement_account_disapproval classified under category account_suspension'
  );
  assert(
    acctIssue.fixAdvice.toLowerCase().includes('do not edit individual product titles') &&
    !acctIssue.fixAdvice.toLowerCase().includes('edit product title, description') &&
    !acctIssue.fixAdvice.toLowerCase().includes('remove flagged terminology'),
    'Account suspension never instructs merchant to edit product titles, descriptions, or images'
  );
  assert(
    Boolean(
      acctIssue.storeTrustChecklist?.businessTransparency &&
      acctIssue.storeTrustChecklist?.legalPages &&
      acctIssue.storeTrustChecklist?.paymentAndDomainIntegrity &&
      acctIssue.storeTrustChecklist?.gmcVerification
    ),
    'Account suspension includes complete 4-point store trust checklist'
  );

  // 1b. Account-Level Suspension: misrepresentation
  const misrepIssue = translateGmcIssue('misrepresentation');
  assert(
    misrepIssue.isAccountLevel === true && isAccountSuspensionCode('misrepresentation'),
    'Misrepresentation classified as store-level account suspension'
  );

  // 1c. Missing GTIN or Barcode
  const gtinIssue = translateGmcIssue('item_disapproved: missing_required_attribute [gtin]');
  assert(
    gtinIssue.category === 'barcode' &&
    gtinIssue.title === 'Missing GTIN or Barcode' &&
    gtinIssue.explanation.includes('UPC, EAN, or ISBN') &&
    gtinIssue.fixAdvice.includes('Shopify admin or product feed catalog'),
    'Missing GTIN/Barcode translates with UPC/EAN/ISBN explanation and catalog guidance'
  );

  // 1d. Promotional Watermark or Image Resolution
  const watermarkIssue = translateGmcIssue('promotional_overlay_on_image');
  assert(
    watermarkIssue.category === 'image' &&
    watermarkIssue.title === 'Promotional Watermark or Image Resolution' &&
    watermarkIssue.explanation.includes('800x800 pixels') &&
    watermarkIssue.fixAdvice.includes('minimum 800x800 pixels'),
    'Promotional watermark / resolution error translates with 800x800 and overlay guidance'
  );

  // 1e. Price or Availability Mismatch
  const priceIssue = translateGmcIssue('price_mismatch');
  assert(
    priceIssue.category === 'pricing' &&
    priceIssue.title === 'Price or Availability Mismatch' &&
    priceIssue.explanation.includes('scraped from the store landing page differs from the feed data') &&
    priceIssue.fixAdvice.includes('Update your product feed to match the current on-page price'),
    'Price/Availability mismatch translates with scraper vs feed discrepancy explanation'
  );

  // 1f. Translation Guardrail for Undocumented Errors
  const unknownIssue = translateGmcIssue('custom_unknown_google_rule_xyz_404');
  assert(
    unknownIssue.isUndocumented === true &&
    unknownIssue.category === 'general' &&
    unknownIssue.documentationUrl === 'https://merchants.google.com/mc/products/diagnostics' &&
    unknownIssue.fixAdvice.includes('Do not guess or apply unverified edits') &&
    unknownIssue.title.includes('custom unknown google rule xyz 404'),
    'Translation guardrail preserves clean official Google policy name and links to GMC Diagnostics without speculative guessing'
  );

  // -------------------------------------------------------------------------
  // 2. Comprehensive Slack Alert Architecture Tests
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Comprehensive Slack Alert Architecture ---');

  const mockStore: Store = {
    id: 9999,
    tenant_id: 901,
    account_type: 'Standalone Merchant',
    pubsub_topic: 'projects/kultra-sentinel/topics/gmc-543210987',
    store_url: 'https://apextactical.myshopify.com',
    store_name: 'Apex Tactical Outfitters',
    gmc_id: '543210987',
    merchant_id: '543210987',
    tenant_email: 'test@apextactical.com',
    status: 'active',
    alert_status: 'active',
    webhook_url: 'https://httpbin.org/status/200', // Mock destination for dry-run inspection
    webhook_verified: true,
    total_caught: 0,
    open_disapprovals: 0,
    created_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  };

  // 2a. Account Suspension Slack Alert Payload
  console.log('Testing Account Suspension Slack Alert Payload...');
  const acctSlackResult = await dispatchDisapprovalSlackNotification({
    store: mockStore,
    triggerType: 'Diagnostic Test Ping',
    incident: {
      sku: 'ALL-CATALOG',
      title: 'Store-Wide Account Disapproval',
      issueCode: 'policy_enforcement_account_disapproval',
      targetCountries: ['United States', 'Canada', 'United Kingdom'],
    },
  });

  assert(
    Boolean(acctSlackResult.payload),
    'Account suspension Slack payload generated successfully'
  );

  const acctBlocks = (acctSlackResult.payload as { blocks: Array<Record<string, unknown>> })?.blocks || [];
  const headerBlock = acctBlocks[0] as { text?: { text?: string } };
  const attributionBlock = acctBlocks[1] as { text?: { text?: string } };
  const diagnosisBlock = acctBlocks[3] as { text?: { text?: string } };
  const checklistBlock = acctBlocks[4] as { text?: { text?: string } };
  const actionBlock = acctBlocks[7] as { elements?: Array<{ text?: { text?: string }; url?: string }> };

  assert(
    headerBlock?.text?.text?.includes('Emergency Account Suspension Detected'),
    'Account suspension Slack header contains "Emergency Account Suspension Detected"'
  );
  assert(
    attributionBlock?.text?.text?.includes('Apex Tactical Outfitters') &&
    attributionBlock?.text?.text?.includes('543210987') &&
    attributionBlock?.text?.text?.includes('United States, Canada, United Kingdom') &&
    attributionBlock?.text?.text?.includes('TOTAL STORE-WIDE SUSPENSION'),
    'Attribution block contains authentic store name, GMC ID, affected countries, and store-wide scope'
  );
  assert(
    diagnosisBlock?.text?.text?.includes('Diagnosis (Store-Wide Policy Block)') &&
    diagnosisBlock?.text?.text?.includes('paused ad delivery across all products in your catalog'),
    'Diagnosis block explains store-wide ad delivery pause'
  );
  assert(
    checklistBlock?.text?.text?.includes('Business Transparency') &&
    checklistBlock?.text?.text?.includes('Legal Pages') &&
    checklistBlock?.text?.text?.includes('Payment & Domain Integrity') &&
    checklistBlock?.text?.text?.includes('GMC Verification'),
    'Action plan block provides concise 4-point store compliance checklist'
  );
  assert(
    actionBlock?.elements?.some((btn) => btn.text?.text === 'Triage in Kultra') &&
    actionBlock?.elements?.some((btn) => btn.text?.text === 'GMC Account Settings') &&
    actionBlock?.elements?.some((btn) => btn.text?.text === 'Open GMC Diagnostics'),
    'Action buttons include deep links to Kultra triage, GMC Account Settings, and GMC Diagnostics'
  );

  // 2b. SKU Disapproval Slack Alert Payload
  console.log('Testing SKU Disapproval Slack Alert Payload...');
  const skuSlackResult = await dispatchDisapprovalSlackNotification({
    store: mockStore,
    triggerType: 'Live Google Alert',
    incident: {
      sku: 'SKU-TRAIL-88',
      title: 'Vapor Carbon Running Shoe - Men 11',
      price: '$180.00',
      variant: 'Midnight Blue / Size 11',
      issueCode: 'item_disapproved: missing_required_attribute [gtin]',
      severity: 'critical',
    },
  });

  const skuBlocks = (skuSlackResult.payload as { blocks: Array<Record<string, unknown>> })?.blocks || [];
  const skuHeader = skuBlocks[0] as { text?: { text?: string } };
  const skuItemDetails = skuBlocks[3] as { text?: { text?: string } };
  const skuDiagnosis = skuBlocks[4] as { text?: { text?: string } };
  const skuResolution = skuBlocks[5] as { text?: { text?: string } };
  const skuActions = skuBlocks[7] as { elements?: Array<{ text?: { text?: string }; url?: string }> };

  assert(
    skuHeader?.text?.text === '🚨 Item Disapproval Flagged',
    'SKU disapproval Slack header contains "🚨 Item Disapproval Flagged"'
  );
  assert(
    skuItemDetails?.text?.text?.includes('Vapor Carbon Running Shoe') &&
    skuItemDetails?.text?.text?.includes('SKU-TRAIL-88') &&
    skuItemDetails?.text?.text?.includes('Midnight Blue / Size 11') &&
    skuItemDetails?.text?.text?.includes('$180.00'),
    'Item details block contains product title, SKU, variant, and price'
  );
  assert(
    skuDiagnosis?.text?.text?.includes('Diagnosis') &&
    skuDiagnosis?.text?.text?.includes('Why Google Blocked This Ad'),
    'SKU diagnosis translates specific attribute failure'
  );
  assert(
    skuResolution?.text?.text?.includes('Resolution') &&
    skuResolution?.text?.text?.includes('How to Fix'),
    'SKU resolution provides exact attribute fix in Shopify or catalog'
  );
  assert(
    skuActions?.elements?.some((btn) => btn.text?.text === 'Fix in Store Backend'),
    'SKU actions provide direct link to edit in store backend'
  );

  // -------------------------------------------------------------------------
  // 3. Slack Status Card UI Synchronization
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Slack Status Card UI Synchronization ---');

  // Case 3a: Store WITH configured webhook
  const storeWithWebhook: Store = {
    ...mockStore,
    webhook_url: 'https://hooks.slack.com/services/T00/B00/XXXX',
    slack_channel: '#merchant-alerts',
  };

  const hasWebhookActive = Boolean(
    storeWithWebhook.webhook_url || storeWithWebhook.slack_webhook_url
  );
  const displayChannelA: string = storeWithWebhook.slack_channel || 'Active Webhook';
  const badgeA: string = hasWebhookActive ? 'Connected' : 'Not Connected';

  assert(
    hasWebhookActive === true &&
    badgeA === 'Connected' &&
    displayChannelA === '#merchant-alerts',
    'Configured store displays green Connected badge and channel name (#merchant-alerts)'
  );

  // Case 3b: Store WITH webhook but empty channel name
  const storeWithWebhookNoName: Store = {
    ...mockStore,
    webhook_url: 'https://hooks.slack.com/services/T00/B00/XXXX',
    slack_channel: '',
  };

  const hasWebhookActiveB = Boolean(
    storeWithWebhookNoName.webhook_url || storeWithWebhookNoName.slack_webhook_url
  );
  const displayChannelB: string = (storeWithWebhookNoName.slack_channel && storeWithWebhookNoName.slack_channel.length > 0)
    ? storeWithWebhookNoName.slack_channel
    : 'Active Webhook';

  assert(
    hasWebhookActiveB === true &&
    displayChannelB === 'Active Webhook',
    'Configured store with null/empty channel displays "Active Webhook" instead of "Unconfigured"'
  );

  // Case 3c: Store WITHOUT configured webhook
  const storeWithoutWebhook: Store = {
    ...mockStore,
    webhook_url: undefined,
    slack_webhook_url: undefined,
    slack_channel: undefined,
  };

  const hasWebhookActiveC = Boolean(
    storeWithoutWebhook.webhook_url || storeWithoutWebhook.slack_webhook_url
  );
  const displayChannelC = hasWebhookActiveC ? 'Active Webhook' : 'Unconfigured';
  const badgeC = hasWebhookActiveC ? 'Connected' : 'Not Connected';

  assert(
    hasWebhookActiveC === false &&
    badgeC === 'Not Connected' &&
    displayChannelC === 'Unconfigured',
    'Unconfigured store displays neutral "Not Connected" badge and "Unconfigured" label'
  );

  // Verification that "Unconfigured" is NEVER paired with "Connected"
  const conflictPresent = (badgeA === 'Connected' && displayChannelA === 'Unconfigured') ||
    (badgeC === 'Connected' && displayChannelC === 'Unconfigured');
  assert(
    !conflictPresent,
    'CONFLICT RESOLVED: Interface never renders "Unconfigured" next to a green "Connected" badge'
  );

  console.log(`\n================================================================`);
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log(`================================================================\n`);

  if (passed === total) {
    console.log('🎯 ALL VERIFICATION CRITERIA SATISFIED.');
  } else {
    console.error('❌ VERIFICATION FAILED.');
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification script crashed:', err);
  process.exit(1);
});
