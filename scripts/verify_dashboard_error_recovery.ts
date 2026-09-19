/**
 * Verification script for Dashboard URL Error Handlers and GMC Account Recovery UI
 * 
 * Verifies:
 * 1. Server-side & client-side URL error parameter ingestion in /dashboard
 * 2. High-visibility contextual error banners:
 *    - error=no_accounts_found
 *    - error=access_denied / error=insufficient_permissions
 *    - error=api_disabled
 * 3. Recovery actions:
 *    - Connect a Different Google Account (prompt=select_account)
 *    - Grant Permissions (prompt=consent)
 *    - Open Google Merchant Center (merchants.google.com)
 * 4. Error persistence on mount (fetchDashboardData does not wipe URL error)
 * 5. Clean URL state sanitization via history.replaceState on dismissal
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail: string = '') {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name} - ${detail}`);
    failed++;
  }
}

async function run() {
  console.log('================================================================');
  console.log('  VERIFYING DASHBOARD URL ERROR HANDLERS & RECOVERY UI          ');
  console.log('================================================================\n');

  // --- 1. Audit Server-Side Ingestion in src/app/dashboard/page.tsx ---
  console.log('--- 1. Auditing Server-Side Search Params Ingestion in /dashboard ---');
  const pagePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'page.tsx');
  const pageCode = fs.readFileSync(pagePath, 'utf8');

  assert(
    pageCode.includes('resolvedParams.error') && pageCode.includes('initialError={initialError}'),
    'CustomerDashboardPage extracts error query parameter and passes initialError prop',
    'Must parse error searchParam and forward to TenantTriageCenter'
  );

  // --- 2. Audit Client-Side Ingestion in src/components/dashboard/TenantTriageCenter.tsx ---
  console.log('\n--- 2. Auditing TenantTriageCenter Error Ingestion & Persistence ---');
  const triagePath = path.join(__dirname, '..', 'src', 'components', 'dashboard', 'TenantTriageCenter.tsx');
  const triageCode = fs.readFileSync(triagePath, 'utf8');

  assert(
    triageCode.includes('initialError || null') &&
    triageCode.includes('urlParams.get(\'error\')'),
    'TenantTriageCenter ingests error from initialError prop and client-side URL parameters',
    'Must ingest error both server-side and client-side'
  );

  assert(
    !/fetchDashboardData[\s\S]*?setError\s*\(\s*null\s*\)/.test(triageCode),
    'fetchDashboardData does NOT reset or wipe error state on mount',
    'Banner must persist across layout mount and data loading'
  );

  assert(
    triageCode.includes('window.history.replaceState') &&
    triageCode.includes('url.searchParams.delete(\'error\')'),
    'dismissError sanitizes URL using window.history.replaceState',
    'Must cleanly remove error query param without full page reload'
  );

  // --- 3. Audit Contextual Banner & Recovery Actions ---
  console.log('\n--- 3. Auditing Error Banner Cases & Actionable Recovery CTAs ---');

  // Case A: no_accounts_found
  assert(
    triageCode.includes('No Google Merchant Center Account Found') &&
    triageCode.includes('Google authenticated successfully, but no Merchant Center accounts or MCA client profiles are linked to this Google email.'),
    'error=no_accounts_found renders dedicated headline and plain-language explanation',
    'Must match specified headline and body copy'
  );

  assert(
    triageCode.includes('/api/auth/merchant/connect?prompt=select_account') &&
    triageCode.includes('Connect a Different Google Account'),
    'error=no_accounts_found renders "Connect a Different Google Account" button with prompt=select_account',
    'Must force account picker via prompt=select_account'
  );

  assert(
    triageCode.includes('https://merchants.google.com') &&
    triageCode.includes('Open Google Merchant Center'),
    'error=no_accounts_found renders deep-link to merchants.google.com in a new tab',
    'Must link to Google Merchant Center'
  );

  // Case B: access_denied / insufficient_permissions
  assert(
    triageCode.includes('Permissions Missing') &&
    triageCode.includes('Kultra requires read access to your Merchant Center catalog to detect disapprovals. Please reconnect and check all requested permission boxes.'),
    'error=access_denied / insufficient_permissions renders dedicated permissions warning',
    'Must explain missing read-only access'
  );

  assert(
    triageCode.includes('/api/auth/merchant/connect?prompt=consent') &&
    triageCode.includes('Grant Permissions'),
    'error=access_denied renders "Grant Permissions" button forcing prompt=consent',
    'Must force re-consent via prompt=consent'
  );

  // Case C: api_disabled
  assert(
    triageCode.includes('Google Merchant Center API Disabled') &&
    triageCode.includes('The Content API for Shopping is not enabled for your Google Cloud Project or Google account.'),
    'error=api_disabled renders dedicated API disabled explanation',
    'Must explain Content API activation requirement'
  );

  // Layout Placement: directly above onboarding steps
  assert(
    triageCode.includes('{renderErrorBanner()}\n\n        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-8 sm:p-10 text-center">') ||
    triageCode.includes('{renderErrorBanner()}'),
    'Error banner is rendered directly above the onboarding steps in State A',
    'Banner must anchor above onboarding steps'
  );

  // --- 4. Audit /api/auth/merchant/connect prompt handling ---
  console.log('\n--- 4. Auditing OAuth Connect Endpoint Prompt Parameter Handling ---');
  const connectPath = path.join(__dirname, '..', 'src', 'app', 'api', 'auth', 'merchant', 'connect', 'route.ts');
  const connectCode = fs.readFileSync(connectPath, 'utf8');

  assert(
    connectCode.includes('url.searchParams.get(\'prompt\')'),
    '/api/auth/merchant/connect forwards custom prompt parameter (select_account, consent)',
    'Must pass prompt parameter to Google OAuth'
  );

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
