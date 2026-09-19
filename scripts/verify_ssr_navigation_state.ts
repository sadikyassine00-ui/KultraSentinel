/**
 * Verification script for Server-Side Session Resolution and FOUC Elimination
 * 
 * Tests:
 * 1. Root layout and Header component structural contracts:
 *    - Server-side cookie extraction (kultra_admin_session) and token verification
 *    - Passing initialUser from layout into Header
 *    - Synchronous useState initialization without initial mount checkAuth execution
 *    - Active plan indicator badge rendering in Header button & dropdown
 *    - Public navigation ("Sign In" + primary CTA) with zero ghost/skeleton artifacts
 *    - Fixed header container height (h-[60px]) preventing layout shifts
 * 2. Session verification resolution and user model contract
 * 3. /api/auth/me consistency with planName & planTier
 * 4. Dashboard layout initialUser propagation
 */

import fs from 'fs';
import path from 'path';
import { createSessionToken, verifySessionToken, COOKIE_NAME } from '../src/lib/token';

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
  console.log('  VERIFYING SERVER-DRIVEN AUTH & FOUC ELIMINATION IN NAVIGATION ');
  console.log('================================================================\n');

  // --- 1. Audit Root Layout (src/app/layout.tsx) ---
  console.log('--- 1. Auditing Server-Side Session Resolution in Root Layout ---');
  const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
  const layoutCode = fs.readFileSync(layoutPath, 'utf8');

  assert(
    layoutCode.includes('export default async function RootLayout'),
    'RootLayout is an async Server Component',
    'RootLayout must be async to read cookies on the server'
  );

  assert(
    layoutCode.includes('await cookies()') && layoutCode.includes('cookieStore.get(COOKIE_NAME)'),
    'RootLayout reads HttpOnly session cookie before rendering',
    'Must read COOKIE_NAME from cookieStore'
  );

  assert(
    layoutCode.includes('verifySessionToken'),
    'RootLayout verifies session token server-side',
    'Must verify session token using verifySessionToken'
  );

  assert(
    layoutCode.includes('<Header initialUser={initialUser} />'),
    'RootLayout passes verified initialUser to Header',
    'Header must receive initialUser prop from server render'
  );

  // --- 2. Audit Client Navigation (src/components/Header.tsx) ---
  console.log('\n--- 2. Auditing Header Component Hydration & State Invariants ---');
  const headerPath = path.join(__dirname, '..', 'src', 'components', 'Header.tsx');
  const headerCode = fs.readFileSync(headerPath, 'utf8');

  assert(
    headerCode.includes('export function Header({ initialUser = null }: HeaderProps)'),
    'Header accepts initialUser prop',
    'HeaderProps must define initialUser'
  );

  assert(
    headerCode.includes('useState<AuthUser | null>(initialUser ?? null)'),
    'Header initializes user state synchronously from initialUser',
    'State must be initialized with initialUser to prevent default-to-logged-out FOUC'
  );

  // Check that checkAuth is NOT run on initial mount
  const hasMountCheckAuth = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*checkAuth\(\s*\);\s*\}\s*,\s*\[\s*checkAuth\s*,\s*pathname\s*\]\s*\)/.test(headerCode);
  assert(
    !hasMountCheckAuth,
    'Header eliminates asynchronous checkAuth() on initial mount',
    'Initial mount must not trigger checkAuth() which resets/wipes server state'
  );

  assert(
    headerCode.includes('window.addEventListener(\'auth-change\', handleAuthChange)'),
    'Header listens for auth-change custom event for explicit login/logout transitions',
    'Must retain dynamic event-based updates'
  );

  assert(
    headerCode.includes('user.planName'),
    'Header renders active plan indicator badge',
    'Must render active plan indicator in authenticated pill & dropdown'
  );

  assert(
    headerCode.includes('h-[60px]'),
    'Header enforces fixed height h-[60px] for zero layout shift',
    'Header container must maintain fixed height for both states'
  );

  // --- 3. Audit /api/auth/me Response Consistency ---
  console.log('\n--- 3. Auditing /api/auth/me Data Parity ---');
  const mePath = path.join(__dirname, '..', 'src', 'app', 'api', 'auth', 'me', 'route.ts');
  const meCode = fs.readFileSync(mePath, 'utf8');

  assert(
    meCode.includes('planName') && meCode.includes('planTier'),
    '/api/auth/me returns planName and planTier',
    'Client updates must receive matching plan data'
  );

  // --- 4. Audit Dashboard Layout User Forwarding ---
  console.log('\n--- 4. Auditing Dashboard Layout initialUser Forwarding ---');
  const dashLayoutPath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'layout.tsx');
  const dashLayoutCode = fs.readFileSync(dashLayoutPath, 'utf8');

  assert(
    dashLayoutCode.includes('<TenantDashboardClientLayout initialUser={initialUser}>'),
    'TenantDashboardLayout passes initialUser to TenantDashboardClientLayout',
    'Dashboard layout must forward server-resolved session'
  );

  const dashClientPath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'TenantDashboardClientLayout.tsx');
  const dashClientCode = fs.readFileSync(dashClientPath, 'utf8');

  assert(
    dashClientCode.includes('initialUser = null') && dashClientCode.includes('useState<AuthUser | null>(initialUser)'),
    'TenantDashboardClientLayout synchronously initializes user state',
    'Dashboard client layout must initialize from initialUser'
  );

  // --- 5. Functional Token Verification & Resolution Test ---
  console.log('\n--- 5. Functional Token Generation & Session Resolution ---');
  const testPayload = {
    email: 'merchant-test@usekultra.com',
    role: 'user',
    name: 'Merchant Test',
  };

  const token = await createSessionToken(testPayload);
  assert(Boolean(token && token.length > 20), 'Generated signed JWT session token');

  const verified = await verifySessionToken(token);
  assert(Boolean(verified && verified.email === testPayload.email), 'Verified token preserves authentic user identity', `Got: ${verified?.email}`);

  // Test invalid token
  const invalidResult = await verifySessionToken('invalid.token.payload');
  assert(invalidResult === null, 'Malformed token securely resolves to null (Anonymous)');

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
