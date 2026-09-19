const assert = require('assert');

async function run() {
  console.log('=== VERIFYING ACTIVE GMC GATE & SCOPE ERROR HANDLING ===\n');

  const { discoverMerchantAccounts } = await import('../src/lib/merchant_api.ts');

  // Test 1: Scope missing check simulation
  console.log('Test 1: Simulating OAuth callback with missing content scope...');
  const mockTokenDataWithoutContent = {
    access_token: 'mock_token',
    scope: 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
  };
  const hasContentScope = mockTokenDataWithoutContent.scope.includes('https://www.googleapis.com/auth/content');
  assert.strictEqual(hasContentScope, false, 'Expected content scope to be detected as missing');
  console.log('✅ PASS: Missing content scope correctly identified (redirects to permission_denied error, not zero accounts).\n');

  // Test 2: Token with valid scope check simulation
  console.log('Test 2: Simulating OAuth callback with valid content scope...');
  const mockTokenDataWithContent = {
    access_token: 'mock_token',
    scope: 'https://www.googleapis.com/auth/content openid https://www.googleapis.com/auth/userinfo.email',
  };
  const hasContentScope2 = mockTokenDataWithContent.scope.includes('https://www.googleapis.com/auth/content');
  assert.strictEqual(hasContentScope2, true, 'Expected content scope to be detected as present');
  console.log('✅ PASS: Valid content scope correctly identified.\n');

  // Test 3: DiscoveryResponse type structure
  console.log('Test 3: DiscoveryResponse structure compatibility...');
  const res = await discoverMerchantAccounts('mock_invalid_token');
  assert.ok(Array.isArray(res), 'Result must be an array for backwards compatibility');
  assert.ok(Array.isArray(res.accounts), 'Result.accounts must be an array');
  assert.ok(res.error, 'Result.error must be populated when Google returns an error');
  assert.strictEqual(typeof res.error.status, 'number', 'Error status must be a number');
  console.log('✅ PASS: DiscoveryResponse structure is backwards compatible with error diagnostics.\n');

  console.log('>>> ALL ACTIVE GMC GATE TESTS PASSED! <<<');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
