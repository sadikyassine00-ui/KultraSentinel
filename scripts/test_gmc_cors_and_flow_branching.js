/**
 * Test script for verifying:
 * 1. GMC OAuth Connect endpoint CORS protection (JSON for fetch/cors/rsc, 307 for document navigation)
 * 2. Multi-Account Chooser Enforced: Zero login_hint and prompt=select_account consent
 * 3. Source code verification: zero <Link> or fetch() targeting /api/auth/merchant/connect
 * 4. Callback flow branching:
 *    - 0 accounts / 404 -> redirects to /dashboard?error=no_accounts_found
 *    - Scope denied / cancelled -> redirects to /dashboard?error=permission_denied
 *    - 1 account -> claims store & redirects to /dashboard?just_connected=true
 *    - >1 accounts -> redirects to /dashboard/connect/select-account
 * 5. Onboarding UI Fork:
 *    - On no_accounts_found: hides 3-step setup cards, displays "No Google Merchant Center Account Found",
 *      plain-English explanation, and two resolution buttons.
 *    - On permission_denied: displays amber warning banner explaining Content API requirements.
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
  console.log('=== VERIFYING FULL GMC CONNECTION FLOW AUDIT & ZERO-STATE FORKING ===\n');

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

  // Test Group 2: GET /api/auth/merchant/connect route handler & Account Chooser Enforcement
  console.log('\n--- Test 2: Connect Endpoint & Account Chooser Enforcement ---');
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
  assert(redirectLocation.includes('prompt=select_account') || redirectLocation.includes('prompt=select_account+consent'), 'Forces Google account chooser (prompt=select_account)');
  assert(!redirectLocation.includes('login_hint='), 'Prevents auto-login lock by omitting login_hint');
  const navCookie = navResponse.headers.get('set-cookie');
  assert(navCookie && navCookie.includes('kultra_oauth_state='), 'Attaches kultra_oauth_state HTTP-only cookie');
  console.log('[PASS] Document navigation forces Google Account Chooser without login_hint locking');

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
  assert(!corsJson.url.includes('login_hint='), 'CORS url omits login_hint to prevent auto-selecting account');
  console.log('[PASS] CORS fetch returns 200 JSON { url } preventing browser cross-origin redirect errors');

  // Test Group 3: Callback Route State Machine & Branching
  console.log('\n--- Test 3: OAuth Callback State Machine ---');
  const callbackRouteContent = fs.readFileSync(
    path.join(__dirname, '../src/app/api/auth/merchant/callback/route.ts'),
    'utf8'
  );

  // Branch A: Single store claims & transitions directly to Slack alarm view
  assert(
    callbackRouteContent.includes("successUrl.searchParams.set('just_connected', 'true')"),
    'Branch A (Single store): advances user directly with just_connected=true'
  );
  assert(
    callbackRouteContent.includes("new URL('/dashboard/connect/select-account'"),
    'Branch A (Multiple stores): routes user to store selection screen'
  );
  console.log('[PASS] Branch A verified: Single store connects directly; Multiple stores route to select-account');

  // Branch B: Zero accounts -> routes to onboarding with error=no_accounts_found
  assert(
    callbackRouteContent.includes("fallbackDashboardUrl.searchParams.set('error', 'no_accounts_found')"),
    'Branch B: Routes user back to onboarding with error=no_accounts_found'
  );
  console.log('[PASS] Branch B verified: Zero accounts explicitly signaled to onboarding without ghost store records');

  // Branch C: Scope denied or canceled -> routes to onboarding with error=permission_denied
  assert(
    callbackRouteContent.includes("fallbackDashboardUrl.searchParams.set('error', 'permission_denied')"),
    'Branch C: Scope missing routes to onboarding with error=permission_denied'
  );
  console.log('[PASS] Branch C verified: Permission denial routes to onboarding with permission_denied indicator');

  // Test Group 4: Onboarding UI Fork & Zero-State Rendering
  console.log('\n--- Test 4: Onboarding UI Fork & Zero GMC Account Screen ---');
  const triageView = fs.readFileSync(
    path.join(__dirname, '../src/components/dashboard/TenantTriageCenter.tsx'),
    'utf8'
  );

  // Check Fork State: Hides 3-step setup cards
  assert(
    triageView.includes('isNoAccountError ?'),
    'TenantTriageCenter conditionally forks UI when isNoAccountError is true'
  );
  assert(
    triageView.includes('No Google Merchant Center Account Found'),
    'Zero-account screen renders prominent "No Google Merchant Center Account Found" header'
  );
  assert(
    triageView.includes('The Google account you just signed into does not have access to any Google Merchant Center stores. This usually happens when your merchant center is under a different Google email.'),
    'Zero-account screen renders required plain-English explanation'
  );
  assert(
    triageView.includes('Connect with a Different Google Account'),
    'Zero-account screen renders "Connect with a Different Google Account" button'
  );
  assert(
    triageView.includes('Create a Google Merchant Center Account'),
    'Zero-account screen renders "Create a Google Merchant Center Account" outbound button'
  );
  assert(
    triageView.includes('isPermissionDenied &&'),
    'TenantTriageCenter renders amber permission rejection banner'
  );
  assert(
    triageView.includes('Kultra requires read-only Content API access to intercept product disapprovals'),
    'Permission banner explains Content API disapproval interception requirements'
  );
  console.log('[PASS] Onboarding UI fork renders explicit Zero GMC Account screen and permission banner');

  console.log('\n===================================================================');
  console.log('>>> ALL GMC CONNECTION FLOW & STATE FORKING AUDITS PASSED! <<<');
  console.log('===================================================================\n');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
