const assert = require('assert');

// 1. Test translation logic
const { translateGmcIssue, extractProductMeta } = require('../src/lib/gmcErrors.ts');

console.log('🧪 Starting Dashboard UX & Layout Overhaul Verification...\n');

console.log('Test 1: Plain-English Google Merchant Center Error Translations');
const gtinError = translateGmcIssue('item_disapproved: missing_required_attribute [gtin]');
assert.strictEqual(gtinError.title, 'Missing Barcode (GTIN / UPC)');
assert.ok(gtinError.explanation.includes('Google requires a valid GTIN or UPC'));
assert.ok(gtinError.fixAdvice.includes('Add the 12- or 14-digit barcode'));
console.log('✅ GTIN Barcode error translation verified:');
console.log(`   Title: "${gtinError.title}"`);
console.log(`   Explanation: "${gtinError.explanation}"`);
console.log(`   Fix Advice: "${gtinError.fixAdvice}"\n`);

const priceError = translateGmcIssue('price_mismatch');
assert.strictEqual(priceError.title, 'Price Mismatch Detected');
assert.ok(priceError.explanation.includes('does not match the price shown on your checkout'));
console.log('✅ Price mismatch error translation verified.\n');

const stockError = translateGmcIssue('availability_mismatch');
assert.strictEqual(stockError.title, 'Stock Status Mismatch');
assert.ok(stockError.explanation.includes('marked out of stock on your website'));
console.log('✅ Stock status mismatch error translation verified.\n');

const imageError = translateGmcIssue('image_link_broken');
assert.strictEqual(imageError.title, 'Product Image Issue');
console.log('✅ Product image issue error translation verified.\n');

const policyError = translateGmcIssue('policy_violation');
assert.strictEqual(policyError.title, 'Google Policy Violation');
console.log('✅ Policy violation error translation verified.\n');

console.log('Test 2: Product Metadata Extraction');
const meta = extractProductMeta('SKU-RUNNER-901', 'Apex Carbon Runner', {
  price: '$180.00',
  color: 'Stealth Black',
  size: '10.5',
});
assert.strictEqual(meta.price, '$180.00');
assert.strictEqual(meta.variant, 'Stealth Black / 10.5');
console.log('✅ Product metadata extraction verified.\n');

console.log('🎉 ALL DASHBOARD OVERHAUL TESTS PASSED SUCCESSFULLY!');
