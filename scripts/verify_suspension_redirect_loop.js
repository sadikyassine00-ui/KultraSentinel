/**
 * End-to-End Verification Suite for Suspended Account Lockout & Redirect Loop Resolution
 */

const BASE_URL = 'http://localhost:3000';

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    ...(options.headers || {}),
  };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    redirect: options.redirect || 'manual', // 'manual' to inspect 307/302 redirects
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  const res = await fetch(url, fetchOptions);
  let data = null;
  let text = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      text = await res.text();
    } catch {
      text = null;
    }
  }

  const setCookie = res.headers.get('set-cookie');
  const location = res.headers.get('location');

  return {
    status: res.status,
    headers: res.headers,
    data,
    text,
    setCookie,
    location,
  };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ [PASS] ${message}`);
}

async function runSuite() {
  console.log('=============================================================================');
  console.log('   KULTRA SENTINEL - SUSPENSION REDIRECT LOOP RESOLUTION VERIFICATION       ');
  console.log('=============================================================================\n');

  // STEP 1: Superadmin Authentication
  console.log('[STEP 1] Superadmin Authentication');
  const superadminLogin = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'yassinesadik0@gmail.com',
      password: process.env.ADMIN_DEFAULT_PASSWORD || 'KultraSentinel2026!',
    },
  });
  assert(superadminLogin.status === 200, 'Superadmin logged in successfully');
  const superadminCookie = superadminLogin.setCookie?.split(';')[0];
  assert(!!superadminCookie, 'Received superadmin session cookie');

  // STEP 2: Register Secondary User Account
  console.log('\n[STEP 2] Register Secondary Merchant Account');
  const secondaryEmail = `merchant_lockout_${Date.now()}@example.com`;
  const secondaryPassword = 'ApexSentinel#9824$Nordic';
  const registerRes = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: {
      email: secondaryEmail,
      password: secondaryPassword,
      companyName: 'Lockout Test Merchant',
      website: 'https://lockout-test.com',
      accountType: 'merchant',
      agreedToTerms: true,
    },
  });
  assert(registerRes.status === 200, `Secondary user ${secondaryEmail} registered successfully`);

  // STEP 3: Superadmin Suspends Secondary Tenant
  console.log('\n[STEP 3] Superadmin Suspends Secondary User');
  const tenantsList = await makeRequest('/api/admin/super/tenants', {
    headers: { Cookie: superadminCookie },
  });
  assert(tenantsList.status === 200, 'Superadmin queried tenants list');
  const targetTenant = tenantsList.data?.tenants?.find((t) => t.email === secondaryEmail);
  assert(!!targetTenant, `Found secondary tenant with ID ${targetTenant?.id}`);

  const suspendRes = await makeRequest('/api/admin/super/tenants', {
    method: 'PATCH',
    headers: { Cookie: superadminCookie },
    body: {
      id: targetTenant.id,
      action: 'suspend',
    },
  });
  assert(suspendRes.status === 200, 'Superadmin suspended secondary tenant');

  // STEP 4: Secondary User Logs In While Suspended
  console.log('\n[STEP 4] Secondary User Logs In While Suspended');
  const loginSuspended = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: secondaryEmail,
      password: secondaryPassword,
    },
  });
  assert(loginSuspended.status === 200, 'Login succeeded and handled suspension cleanly');
  assert(loginSuspended.data.isSuspended === true, 'Response identifies user isSuspended: true');
  assert(loginSuspended.data.redirectUrl === '/suspended', 'Response points redirectUrl to /suspended');
  const suspendedUserCookie = loginSuspended.setCookie?.split(';')[0];
  assert(!!suspendedUserCookie, 'Session cookie issued to suspended user');

  // STEP 5: Request /suspended with Suspended Session (Must NOT redirect or loop)
  console.log('\n[STEP 5] Navigate to /suspended with Suspended Session');
  const suspendedPageRes = await makeRequest('/suspended', {
    headers: { Cookie: suspendedUserCookie },
    redirect: 'manual',
  });
  assert(suspendedPageRes.status === 200, 'GET /suspended returned HTTP 200 OK (no redirect loop)');
  assert(
    suspendedPageRes.text?.includes('Account Access Suspended') ||
    suspendedPageRes.text?.includes('STATUS: SUSPENDED'),
    'Lockout screen renders clear unambiguous messaging: "Account Access Suspended"'
  );
  assert(
    suspendedPageRes.text?.includes('support@usekultra.com'),
    'Lockout screen renders unclickable protected notice pointing to support@usekultra.com'
  );

  // STEP 6: Manually Navigate to /dashboard (Server must immediately redirect to /suspended without looping)
  console.log('\n[STEP 6] Manually Navigate to /dashboard as Suspended User');
  const dashNavRes = await makeRequest('/dashboard', {
    headers: { Cookie: suspendedUserCookie },
    redirect: 'manual',
  });
  assert(
    dashNavRes.status === 307 || dashNavRes.status === 302 || dashNavRes.status === 308,
    `GET /dashboard intercepted with HTTP ${dashNavRes.status} redirect`
  );
  assert(
    dashNavRes.location?.includes('/suspended'),
    `Redirect location is /suspended (Location: ${dashNavRes.location})`
  );

  // Follow the redirect destination to confirm it settles stably at /suspended
  const followRes = await makeRequest(dashNavRes.location, {
    headers: { Cookie: suspendedUserCookie },
    redirect: 'manual',
  });
  assert(followRes.status === 200, 'Followed redirect to /suspended returned HTTP 200 with zero cyclic loop');

  // STEP 7: Navigate to /login as Suspended User with Active Session
  console.log('\n[STEP 7] Navigate to /login with Active Suspended Session');
  const loginNavRes = await makeRequest('/login', {
    headers: { Cookie: suspendedUserCookie },
    redirect: 'manual',
  });
  assert(
    loginNavRes.status === 307 || loginNavRes.status === 302,
    `GET /login intercepted with HTTP ${loginNavRes.status} redirect`
  );
  assert(
    loginNavRes.location?.includes('/suspended'),
    `Redirect location from /login is /suspended (Location: ${loginNavRes.location})`
  );

  // STEP 8: Click Log Out Action on Suspended Screen
  console.log('\n[STEP 8] Log Out from Suspended Screen');
  const logoutRes = await makeRequest('/api/auth/logout', {
    method: 'POST',
    headers: { Cookie: suspendedUserCookie },
  });
  assert(logoutRes.status === 200, 'POST /api/auth/logout succeeded');
  assert(
    logoutRes.setCookie?.includes('Max-Age=0') || logoutRes.setCookie?.includes('kultra_admin_session=;'),
    'Session cookie was destroyed on server and client'
  );

  // Subsequent request to /suspended without cookie must redirect cleanly to /login
  const postLogoutSuspended = await makeRequest('/suspended', {
    redirect: 'manual',
  });
  assert(
    postLogoutSuspended.status === 307 || postLogoutSuspended.status === 302,
    'Unauthenticated GET /suspended redirects to /login'
  );
  assert(
    postLogoutSuspended.location?.includes('/login'),
    `Redirect location is /login (Location: ${postLogoutSuspended.location})`
  );

  // STEP 9: Superadmin Unsuspends the User Account
  console.log('\n[STEP 9] Superadmin Unsuspends the User Account');
  const unsuspendRes = await makeRequest('/api/admin/super/tenants', {
    method: 'PATCH',
    headers: { Cookie: superadminCookie },
    body: {
      id: targetTenant.id,
      action: 'unsuspend',
    },
  });
  assert(unsuspendRes.status === 200, 'Superadmin unsuspended secondary tenant');

  // STEP 10: Secondary User Logs In After Being Unsuspended
  console.log('\n[STEP 10] Secondary User Logs In After Reinstatement');
  const loginReinstated = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: secondaryEmail,
      password: secondaryPassword,
    },
  });
  assert(loginReinstated.status === 200, 'Login succeeded after unsuspension');
  assert(loginReinstated.data.isSuspended === false, 'User is no longer suspended (isSuspended: false)');
  assert(loginReinstated.data.redirectUrl === '/dashboard', 'Redirect URL points to /dashboard');
  const activeUserCookie = loginReinstated.setCookie?.split(';')[0];
  assert(!!activeUserCookie, 'Received active session cookie');

  const dashActiveRes = await makeRequest('/dashboard', {
    headers: { Cookie: activeUserCookie },
    redirect: 'manual',
  });
  assert(dashActiveRes.status === 200, 'GET /dashboard returns HTTP 200 OK for active restored user');

  console.log('\n=============================================================================');
  console.log('   🎉 ALL 10 REDIRECT LOOP RESOLUTION CRITERIA VERIFIED WITH 100% SUCCESS!   ');
  console.log('=============================================================================\n');
}

runSuite().catch((err) => {
  console.error('\n❌ Verification Suite Failed:', err);
  process.exit(1);
});
