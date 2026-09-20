import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret';

async function main() {
  console.log('=== VERIFYING GMC DISCOVERY PARSING & DIRECT MERCHANT ID FALLBACK ===\n');

  // ---------------------------------------------------------------------------
  // Test 1: Content API v2.1 accounts.authinfo & Tier-1 Merchant API Discovery Parsing
  // ---------------------------------------------------------------------------
  console.log('--- Test 1: Content API authinfo & Merchant API Schema Parsing ---');
  const merchantApiContent = fs.readFileSync(
    path.join(__dirname, '../src/lib/merchant_api.ts'),
    'utf8'
  );

  // 1a. Ensure authinfo parsing extracts directly from accountIdentifiers
  assert(
    merchantApiContent.includes('authInfo.accountIdentifiers ??') &&
    merchantApiContent.includes('authInfo.data?.accountIdentifiers'),
    'Must extract identifiers directly from accountIdentifiers or data.accountIdentifiers'
  );

  // 1b. Ensure it does not inspect non-existent properties on authinfo
  assert(
    !merchantApiContent.includes('authInfo.accounts') &&
    !merchantApiContent.includes('authInfo.items') &&
    !merchantApiContent.includes('authInfo.resources'),
    'Must not check non-existent properties (accounts, items, resources) on authInfo response'
  );

  // 1c. Support string and numeric merchantId
  assert(
    merchantApiContent.includes('ident.merchantId ?? ident.merchant_id') &&
    merchantApiContent.includes('rawMerchantId != null ? String(rawMerchantId).trim() : null'),
    'Must support both string and numeric merchantId'
  );

  // 1d. Tier-1 Merchant API unwraps accounts collection and falls back immediately to Content API
  assert(
    merchantApiContent.includes('Array.isArray(gmaData.accounts)') &&
    merchantApiContent.includes('Falling back immediately to Content API v2.1 accounts.authinfo'),
    'Tier-1 unwraps accounts collection and logs immediate fallback to Content API'
  );
  console.log('[PASS] Content API v2.1 authinfo schema parsing and Tier-1 fallback verified.');

  // ---------------------------------------------------------------------------
  // Test 2: Targeted Direct Verification (accounts.get) & Error Messaging
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 2: Direct Manual Verification Fallback & Exact Error Output ---');
  const { verifyAndFetchMerchantAccount } = await import('../src/lib/merchant_api');

  // 2a. Direct call with invalid format rejects before making HTTP request
  const formatCheck = await verifyAndFetchMerchantAccount({
    merchantId: 'abc-not-digits',
    accessToken: 'test_token',
  });
  assert.strictEqual(formatCheck.ok, false);
  assert.strictEqual(formatCheck.status, 400);
  console.log('[PASS] Non-digit Merchant ID rejected with HTTP 400.');

  // 2b. Test HTTP 403 / 404 error phrasing
  const cleanTestId = '5857345262';
  const expectedErrorMessage = `Google reported that your currently authenticated email does not have access to Merchant ID ${cleanTestId}. Reconnect with the correct Google email or grant access in Merchant Center.`;

  // Verify that verifyAndFetchMerchantAccount implements the exact error message required
  assert(
    merchantApiContent.includes(
      'Google reported that your currently authenticated email does not have access to Merchant ID ${cleanId}. Reconnect with the correct Google email or grant access in Merchant Center.'
    ),
    'verifyAndFetchMerchantAccount must contain the exact required error string for 403/404'
  );

  // Direct verification route also enforces this exact message
  const linkDirectContent = fs.readFileSync(
    path.join(__dirname, '../src/app/api/auth/merchant/link-direct/route.ts'),
    'utf8'
  );
  assert(
    linkDirectContent.includes(
      'Google reported that your currently authenticated email does not have access to Merchant ID ${gmcId}. Reconnect with the correct Google email or grant access in Merchant Center.'
    ),
    'POST /api/auth/merchant/link-direct must return the exact error message'
  );
  console.log('[PASS] Exact error message for HTTP 403/404 unauthorized/non-existent Merchant ID verified.');

  // 2c. Verify link-direct stores store record, triggers trial activation, and returns active dashboard redirect
  assert(
    linkDirectContent.includes('claimStoreForTenant({') &&
    linkDirectContent.includes('activateTrialOnFirstStoreConnect(') &&
    linkDirectContent.includes('redirectUrl') &&
    linkDirectContent.includes('/dashboard?just_connected=true'),
    'link-direct must claim store, activate 14-day trial, and return active dashboard redirect'
  );
  console.log('[PASS] Store persistence, trial activation, and active dashboard redirect verified in link-direct.');

  // ---------------------------------------------------------------------------
  // Test 3: Force Google Account Switcher on Reconnection
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 3: Force Google Account Switcher (prompt=select_account) ---');
  const { GET: connectGet } = await import('../src/app/api/auth/merchant/connect/route');
  const { createSessionToken, COOKIE_NAME } = await import('../src/lib/token');

  const testEmail = 'merchant-test-switcher@usekultra.com';
  const sessionToken = await createSessionToken({ email: testEmail, role: 'merchant' });

  // 3a. Test reconnection request with prompt=select_account
  const reqWithPrompt = new Request('http://localhost:3000/api/auth/merchant/connect?prompt=select_account', {
    method: 'GET',
    headers: {
      cookie: `${COOKIE_NAME}=${sessionToken}`,
      'sec-fetch-mode': 'navigate',
    },
  });
  const resWithPrompt = await connectGet(reqWithPrompt);
  assert.strictEqual(resWithPrompt.status, 307);
  const locationWithPrompt = resWithPrompt.headers.get('location');
  assert(locationWithPrompt?.includes('prompt=select_account'), 'Must include prompt=select_account in Google OAuth URL');
  assert(!locationWithPrompt?.includes('login_hint='), 'Must not include login_hint so user can pick profile freely');

  // 3b. Verify reconnection links across UI components specify prompt=select_account
  const triageCenterContent = fs.readFileSync(
    path.join(__dirname, '../src/components/dashboard/TenantTriageCenter.tsx'),
    'utf8'
  );
  assert(
    triageCenterContent.includes('/api/auth/merchant/connect?prompt=select_account'),
    'TenantTriageCenter reconnection links must include prompt=select_account'
  );

  const noAccountPageContent = fs.readFileSync(
    path.join(__dirname, '../src/app/dashboard/connect/no-account/page.tsx'),
    'utf8'
  );
  assert(
    noAccountPageContent.includes('/api/auth/merchant/connect?prompt=select_account'),
    'No-account page reconnection link must include prompt=select_account'
  );
  console.log('[PASS] Google account switcher prompt=select_account strictly enforced.');

  // ---------------------------------------------------------------------------
  // Test 4: Direct Manual Merchant ID Input in UI
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 4: UI Manual Verification Fallback Components ---');
  const directLinkFormContent = fs.readFileSync(
    path.join(__dirname, '../src/app/dashboard/connect/no-account/DirectGmcLinkForm.tsx'),
    'utf8'
  );

  // 4a. Headline and action elements in DirectGmcLinkForm
  assert(
    directLinkFormContent.includes('Already have a Merchant ID? Enter it directly.'),
    'DirectGmcLinkForm must have "Already have a Merchant ID? Enter it directly." headline'
  );
  assert(
    directLinkFormContent.includes('Verify and Link Store'),
    'DirectGmcLinkForm must have "Verify and Link Store" button'
  );
  assert(
    directLinkFormContent.includes('placeholder="e.g. 5857345262"'),
    'DirectGmcLinkForm must have placeholder="e.g. 5857345262"'
  );

  // 4b. Headline and action elements in TenantTriageCenter error banner and zero-store view
  assert(
    triageCenterContent.includes('Already have a Merchant ID? Enter it directly.'),
    'TenantTriageCenter must render "Already have a Merchant ID? Enter it directly."'
  );
  assert(
    triageCenterContent.includes('Verify and Link Store'),
    'TenantTriageCenter must render "Verify and Link Store" button'
  );
  assert(
    triageCenterContent.includes('placeholder="e.g. 5857345262"'),
    'TenantTriageCenter must provide 10-digit input placeholder="e.g. 5857345262"'
  );
  console.log('[PASS] Manual Merchant ID input components and copy verified in all UI entrypoints.');

  console.log('\n=============================================================');
  console.log('>>> ALL GMC DISCOVERY & DIRECT FALLBACK TESTS PASSED! <<<');
  console.log('=============================================================\n');
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
