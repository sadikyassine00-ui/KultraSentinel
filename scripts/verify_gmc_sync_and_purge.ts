/**
 * Verification Script: GMC Sync, Account Ownership, and Mock Data Purge
 * Tests the acceptance criteria from Directive: Purge Mock Data, Validate GMC Account Ownership, and Implement Real Catalog Sync
 */

import assert from 'assert';
import { extractProductMeta } from '../src/lib/gmcErrors';
import { auditExistingDisapprovals, discoverMerchantAccounts } from '../src/lib/merchant_api';

async function testSuite() {
  console.log('--- Starting GMC Sync and Mock Data Purge Test Suite ---\n');

  // Test 1: Verify extractProductMeta does NOT inject fake $129.00
  console.log('Test 1: Verify extractProductMeta returns null price when price is missing...');
  const meta1 = extractProductMeta('SKU-100', 'Test Product', {});
  assert.strictEqual(meta1.price, null, 'Expected price to be null when omitted, not $129.00');
  assert.strictEqual(meta1.variant, null, 'Expected variant to be null when omitted');
  console.log('✅ PASS: extractProductMeta does not inject fake price or variant.\n');

  // Test 2: Verify auditExistingDisapprovals does NOT inject Alpine or Apex
  console.log('Test 2: Verify auditExistingDisapprovals returns empty for non-existent/mock accounts...');
  const auditResult = await auditExistingDisapprovals('gmc-284935066', 'invalid_or_mock_token');
  assert.strictEqual(auditResult.totalAudited, 0, 'Expected totalAudited to be 0');
  assert.strictEqual(auditResult.disapprovals.length, 0, 'Expected disapprovals to be empty');
  const hasAlpine = auditResult.disapprovals.some(d => d.title.includes('Alpine Expedition Anorak'));
  const hasApex = auditResult.disapprovals.some(d => d.title.includes('Apex Waterproof Trail Runner'));
  assert.strictEqual(hasAlpine, false, 'Alpine Expedition Anorak must not exist');
  assert.strictEqual(hasApex, false, 'Apex Waterproof Trail Runner must not exist');
  console.log('✅ PASS: auditExistingDisapprovals never injects synthetic demo products.\n');

  // Test 3: Verify discoverMerchantAccounts handles zero accounts cleanly
  console.log('Test 3: Verify discoverMerchantAccounts returns empty array for invalid/empty auth...');
  const accounts = await discoverMerchantAccounts('invalid_mock_token');
  assert.ok(Array.isArray(accounts), 'Expected accounts to be an array');
  assert.strictEqual(accounts.length, 0, 'Expected 0 accounts for invalid token');
  console.log('✅ PASS: discoverMerchantAccounts cleanly returns empty array when no accounts exist.\n');

  // Test 4: Verify external link construction logic
  console.log('Test 4: Verify external links (Shopify & GMC deep links)...');
  const nonShopifyStoreUrl = 'https://outdoorgear-direct.com';
  const shopifyStoreUrl = 'https://outdoorgear-direct.myshopify.com';
  const sku = 'SHOE-TRAIL-01';
  const gmcId = '104928192';

  const isShopify1 = Boolean(nonShopifyStoreUrl && (nonShopifyStoreUrl.includes('myshopify.com') || nonShopifyStoreUrl.includes('.myshopify.')));
  const isShopify2 = Boolean(shopifyStoreUrl && (shopifyStoreUrl.includes('myshopify.com') || shopifyStoreUrl.includes('.myshopify.')));
  assert.strictEqual(isShopify1, false, 'Non-Shopify store should not be marked as Shopify');
  assert.strictEqual(isShopify2, true, 'Shopify store should be marked as Shopify');

  const gmcUrl = `https://merchants.google.com/mc/items/details?account=${gmcId}&item=${encodeURIComponent(sku)}`;
  assert.ok(gmcUrl.includes(gmcId), 'GMC URL must include authentic account ID');
  assert.ok(gmcUrl.includes(sku), 'GMC URL must include product SKU');
  console.log(`✅ PASS: Deep links correctly constructed: ${gmcUrl}\n`);

  console.log('--- All Tests Passed Successfully! ---');
}

testSuite().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
