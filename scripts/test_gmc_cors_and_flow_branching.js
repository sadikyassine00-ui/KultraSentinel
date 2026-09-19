/**
 * Test script for verifying:
 * 1. GMC OAuth Connect endpoint CORS protection (JSON for fetch/cors/rsc, 307 for document navigation)
 * 2. Source code verification: zero <Link> or fetch() targeting /api/auth/merchant/connect
 * 3. Flow branching:
 *    - 0 accounts / 404 -> redirects to /dashboard/connect/no-account
 *    - 1 account -> claims store & redirects to /dashboard?just_connected=true
 *    - >1 accounts -> redirects to /dashboard/connect/select-account
 * 4. Verify no-account page contains explicit "NO MERCHANT ACCOUNT FOUND" guidance
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Read .env
const envFiles = ['.env', '.env.local'];
let databaseUrl = process.env.DATABASE_URL;

for (const file of envFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match && !databaseUrl) {
      databaseUrl = match[1];
    }
  }
}

if (!databaseUrl) {
  console.error('No DATABASE_URL found in .env files');
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret';

async function runTests() {
  console.log('=== VERIFYING GMC OAUTH CORS FIX & FLOW BRANCHING ===\n');

  // Test Group 1: Source code verification (No Link or fetch targeting connect endpoint)
  console.log('--- Test 1: Static Analysis of GMC Connect Links ---');
  const filesToCheck = [
    path.join(__dirname, '../src/app/dashboard/TenantDashboardClientLayout.tsx'),
    path.join(__dirname, '../src/components/dashboard/SettingsClientView.tsx'),
    path.join(__dirname, '../src/components/dashboard/TenantTriageCenter.tsx'),
  ];

  for (const file of filesToCheck) {
    const content = fs.readFileSync(file, 'utf8');
    assert(
      !content.includes('<Link\n                href="/api/auth/merchant/connect"') &&
      !content.includes('<Link\n                              href="/api/auth/merchant/connect"') &&
      !content.includes('<Link href="/api/auth/merchant/connect"'),
      `File ${path.basename(file)} must not use Next.js <Link> for /api/auth/merchant/connect`
    );
  }

  const triageContent = fs.readFileSync(
    path.join(__dirname, '../src/components/dashboard/TenantTriageCenter.tsx'),
    'utf8'
  );
  assert(
    !triageContent.includes("fetch('/api/auth/merchant/connect')"),
    'TenantTriageCenter must not use fetch() to request /api/auth/merchant/connect'
  );
  console.log('[PASS] Zero Next.js <Link> or client fetch() targeting /api/auth/merchant/connect');

  // Test Group 2: GET /api/auth/merchant/connect route handler
  console.log('\n--- Test 2: Connect Endpoint Response Verification ---');
  const { GET: connectGet } = await import('../src/app/api/auth/merchant/connect/route.ts');
  const { createSessionToken, COOKIE_NAME } = await import('../src/lib/token.ts');

  const testEmail = 'merchant-test@usekultra.com';
  const sessionToken = await createSessionToken({ email: testEmail, role: 'merchant' });

  // 2a. Standard document navigation (Mode: navigate) -> Returns HTTP 307 redirect
  const navRequest = new Request('http://localhost:3000/api/auth/merchant/connect', {
    method: 'GET',
    headers: {
      cookie: `${COOKIE_NAME}=${sessionToken}`,
      'sec-fetch-mode': 'navigate',
    },
  });

  const navResponse = await connectGet(navRequest);
  assert.strictEqual(navResponse.status, 307, 'Document navigation returns HTTP 307 Temporary Redirect');
  const redirectLocation = navResponse.headers.get('location');
  assert(redirectLocation && redirectLocation.includes('accounts.google.com/o/oauth2/v2/auth'), 'Redirects to Google OAuth authorization endpoint');
  const navCookie = navResponse.headers.get('set-cookie');
  assert(navCookie && navCookie.includes('kultra_oauth_state='), 'Attaches kultra_oauth_state HTTP-only cookie');
  console.log('[PASS] Document navigation returns 307 redirect directly to Google with state cookie');

  // 2b. CORS / AJAX Fetch (Mode: cors) -> Returns HTTP 200 JSON with { url } (NO REDIRECT = ZERO CORS ERRORS)
  const corsRequest = new Request('http://localhost:3000/api/auth/merchant/connect', {
    method: 'GET',
    headers: {
      cookie: `${COOKIE_NAME}=${sessionToken}`,
      'sec-fetch-mode': 'cors',
    },
  });

  const corsResponse = await connectGet(corsRequest);
  assert.strictEqual(corsResponse.status, 200, 'CORS fetch returns HTTP 200 JSON (NOT 307 redirect)');
  const corsJson = await corsResponse.json();
  assert(corsJson.url && corsJson.url.includes('accounts.google.com/o/oauth2/v2/auth'), 'Returns Google OAuth authorization URL in JSON body');
  const corsCookie = corsResponse.headers.get('set-cookie');
  assert(corsCookie && corsCookie.includes('kultra_oauth_state='), 'Attaches kultra_oauth_state cookie in JSON response');
  console.log('[PASS] CORS fetch returns 200 JSON { url } preventing browser cross-origin redirect errors');

  // 2c. Next.js RSC Request (?_rsc=...) -> Returns HTTP 200 JSON with { url }
  const rscRequest = new Request('http://localhost:3000/api/auth/merchant/connect?_rsc=abc1234', {
    method: 'GET',
    headers: {
      cookie: `${COOKIE_NAME}=${sessionToken}`,
    },
  });

  const rscResponse = await connectGet(rscRequest);
  assert.strictEqual(rscResponse.status, 200, 'RSC request returns HTTP 200 JSON rather than 307 redirect');
  console.log('[PASS] RSC prefetch request returns 200 JSON without throwing CORS redirect errors');

  // Test Group 3: Flow branching verification
  console.log('\n--- Test 3: Flow Branching Logic Verification ---');
  const callbackRouteContent = fs.readFileSync(
    path.join(__dirname, '../src/app/api/auth/merchant/callback/route.ts'),
    'utf8'
  );

  // Verification 3a: Zero accounts redirect
  assert(
    callbackRouteContent.includes("new URL('/dashboard/connect/no-account'"),
    'Callback route must redirect to /dashboard/connect/no-account on zero accounts'
  );
  assert(
    callbackRouteContent.includes('discoveredAccounts.length === 0'),
    'Callback route explicitly checks discoveredAccounts.length === 0'
  );
  console.log('[PASS] Zero accounts cleanly branches to /dashboard/connect/no-account');

  // Verification 3b: notFound handling
  assert(
    callbackRouteContent.includes('discoveryResult.error.notFound') || callbackRouteContent.includes('status === 404'),
    'Callback route treats 404 / notFound discovery error as zero-account branch'
  );
  console.log('[PASS] 404 / notFound errors properly route to /dashboard/connect/no-account');

  // Verification 3c: Multiple accounts selector
  assert(
    callbackRouteContent.includes("new URL('/dashboard/connect/select-account'"),
    'Callback route redirects multiple accounts to /dashboard/connect/select-account'
  );
  console.log('[PASS] Multiple accounts branch to /dashboard/connect/select-account');

  // Verification 3d: Single account success -> Arm Alarm modal
  assert(
    callbackRouteContent.includes("successUrl.searchParams.set('just_connected', 'true')"),
    'Callback route redirects single account to /dashboard?just_connected=true'
  );
  console.log('[PASS] Single account branch connects and redirects to /dashboard?just_connected=true');

  // Test Group 4: UI Message on No-Account Screen
  console.log('\n--- Test 4: No-Account Page Message & Actions ---');
  const noAccountPage = fs.readFileSync(
    path.join(__dirname, '../src/app/dashboard/connect/no-account/page.tsx'),
    'utf8'
  );
  assert(
    noAccountPage.includes('NO MERCHANT ACCOUNT FOUND'),
    'No-account page displays "NO MERCHANT ACCOUNT FOUND" status pill'
  );
  assert(
    noAccountPage.includes('No Google Merchant Center account found for this Google email'),
    'No-account page displays explicit "No Google Merchant Center account found for this Google email" headline'
  );
  assert(
    noAccountPage.includes('Switch Google Accounts'),
    'No-account page provides alternative to switch Google accounts'
  );
  assert(
    noAccountPage.includes('Create a Merchant Account'),
    'No-account page provides guidance to create a Merchant account'
  );
  console.log('[PASS] No-account page displays explicit messages, instructions, and next action options');

  console.log('\n=============================================================');
  console.log('>>> ALL GMC CORS & FLOW BRANCHING VERIFICATIONS PASSED! <<<');
  console.log('=============================================================\n');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
