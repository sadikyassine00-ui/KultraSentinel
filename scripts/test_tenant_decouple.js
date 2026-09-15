/**
 * Verification Suite for Tenant Workspace Decoupling & Role Guarding
 * Run with: node scripts/test_tenant_decouple.js
 */

const { SignJWT, jwtVerify } = require('jose');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

let authSecret = 'kultra-sentinel-fallback-secret-key-32-chars-min!';
try {
  const envLocal = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const match = envLocal.match(/AUTH_SECRET=["']?([^"'\r\n]+)/);
  if (match) {
    authSecret = match[1];
  }
} catch {}

const DEFAULT_SECRET = authSecret;
const ALLOWED_ADMIN_EMAILS = [
  'yassinesadik0@gmail.com',
  'contact@usekultra.com',
];

function isAllowedAdminEmail(email) {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

async function verifyTokenLocally(token) {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || DEFAULT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    redirect: 'manual', // do not auto-follow so we inspect 307/308 redirects!
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  const res = await fetch(url, fetchOptions);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  const setCookie = res.headers.get('set-cookie');
  const location = res.headers.get('location');
  return {
    status: res.status,
    headers: res.headers,
    data,
    setCookie,
    location,
  };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

async function runTests() {
  console.log('=============================================================================');
  console.log('   TENANT WORKSPACE DECOUPLING & ROLE GUARDING VERIFICATION SUITE');
  console.log('=============================================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Register Standard User (Non-whitelisted)
  console.log('[TEST 1] Standard Customer Registration & Role Tagging');
  const testEmail = `tenant_${Date.now()}@merchantstore.com`;
  const testPassword = 'SecureTenantPass123!';
  let userCookie = '';

  try {
    const regRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword,
        companyName: 'Acme Merchant Test',
        accountType: 'merchant',
        website: 'acme-test.com',
      },
    });

    assert(regRes.status === 200, `Registration returned status 200 (got ${regRes.status})`);
    assert(regRes.data?.success === true, 'Response indicates success: true');
    assert(regRes.data?.user?.role === 'user', `User role tagged as 'user' (got '${regRes.data?.user?.role}')`);
    assert(regRes.data?.redirectUrl?.includes('/dashboard'), `Redirect URL targets /dashboard (got '${regRes.data?.redirectUrl}')`);
    assert(!!regRes.setCookie, 'Set-Cookie header present with session token');

    userCookie = regRes.setCookie.split(';')[0];
    passed++;
  } catch (err) {
    console.error('Test 1 failed:', err.message);
    failed++;
  }

  // TEST 2: Standard User Login
  console.log('\n[TEST 2] Standard Customer Login (No Private Pilot Block)');
  try {
    const loginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword,
      },
    });

    assert(loginRes.status === 200, `Login returned status 200 (got ${loginRes.status})`);
    assert(loginRes.data?.success === true, 'Login response indicates success: true');
    assert(loginRes.data?.user?.role === 'user', `User role confirmed as 'user' (got '${loginRes.data?.user?.role}')`);
    assert(loginRes.data?.redirectUrl === '/dashboard', `Redirect URL is /dashboard (got '${loginRes.data?.redirectUrl}')`);
    assert(!!loginRes.setCookie, 'Session cookie issued');

    userCookie = loginRes.setCookie.split(';')[0];
    passed++;
  } catch (err) {
    console.error('Test 2 failed:', err.message);
    failed++;
  }

  // TEST 3: Admin Login & Role Tagging
  console.log('\n[TEST 3] Platform Owner Admin Login');
  let adminCookie = '';
  try {
    const adminEmail = 'contact@usekultra.com';
    const adminRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: adminEmail,
        password: process.env.ADMIN_DEFAULT_PASSWORD || 'KultraSentinel2026!',
      },
    });

    assert(adminRes.status === 200, `Admin login returned status 200 (got ${adminRes.status})`);
    assert(adminRes.data?.user?.role === 'admin', `Admin role confirmed as 'admin' (got '${adminRes.data?.user?.role}')`);
    assert(adminRes.data?.redirectUrl === '/admin/dashboard', `Admin redirect targets /admin/dashboard (got '${adminRes.data?.redirectUrl}')`);

    adminCookie = adminRes.setCookie.split(';')[0];
    passed++;
  } catch (err) {
    console.error('Test 3 failed:', err.message);
    failed++;
  }

  // TEST 4: Standard User Accesses Customer Dashboard API
  console.log('\n[TEST 4] Standard User Dashboard API Access');
  try {
    const dashRes = await makeRequest('/api/dashboard', {
      method: 'GET',
      headers: { Cookie: userCookie },
    });

    assert(dashRes.status === 200, `Customer dashboard returned status 200 (got ${dashRes.status})`);
    assert(dashRes.data !== null, 'Dashboard returned valid JSON data');
    assert('zeroStore' in dashRes.data, 'Dashboard returned zeroStore state flag');
    passed++;
  } catch (err) {
    console.error('Test 4 failed:', err.message);
    failed++;
  }

  // TEST 5: Standard User Blocked From Super Admin Telemetry API
  console.log('\n[TEST 5] Anti-Privilege Escalation: Standard User Blocked from Super Admin API');
  try {
    const superRes = await makeRequest('/api/admin/super/telemetry', {
      method: 'GET',
      headers: { Cookie: userCookie },
    });

    assert(superRes.status === 401 || superRes.status === 403, `Standard user rejected with 401/403 (got ${superRes.status})`);
    passed++;
  } catch (err) {
    console.error('Test 5 failed:', err.message);
    failed++;
  }

  // TEST 6: Admin Permitted to Super Admin Telemetry API
  console.log('\n[TEST 6] Admin Permitted to Super Admin API');
  try {
    const adminSuperRes = await makeRequest('/api/admin/super/telemetry', {
      method: 'GET',
      headers: { Cookie: adminCookie },
    });

    assert(adminSuperRes.status === 200, `Admin permitted with 200 (got ${adminSuperRes.status})`);
    assert('totalMonitoredStores' in (adminSuperRes.data?.telemetry || adminSuperRes.data || {}), 'Telemetry data returned');
    passed++;
  } catch (err) {
    console.error('Test 6 failed:', err.message);
    failed++;
  }

  // TEST 7: Token Cryptographic Signature & Role Integrity
  console.log('\n[TEST 7] Cryptographic Token Verification');
  try {
    const rawToken = userCookie.replace('kultra_admin_session=', '');
    const decoded = await verifyTokenLocally(rawToken);
    assert(decoded.email === testEmail.toLowerCase(), `Decoded email matches (${decoded.email})`);
    assert(decoded.role === 'user', `Decoded role is cryptographically signed as 'user' (got '${decoded.role}')`);
    passed++;
  } catch (err) {
    console.error('Test 7 failed:', err.message);
    failed++;
  }

  // TEST 8: Middleware Boundary - Unauthenticated Visitor to /dashboard
  console.log('\n[TEST 8] Edge Boundary: Unauthenticated Visitor Redirected to /login');
  try {
    const res = await makeRequest('/dashboard');
    assert(res.status === 307 || res.status === 308, `Redirect status returned (got ${res.status})`);
    assert(res.location?.includes('/login'), `Redirect targets /login (got '${res.location}')`);
    passed++;
  } catch (err) {
    console.error('Test 8 failed:', err.message);
    failed++;
  }

  // TEST 9: Middleware Boundary - Standard User Blocked from /admin/dashboard
  console.log('\n[TEST 9] Edge Boundary: Standard User Blocked from /admin/dashboard');
  try {
    const res = await makeRequest('/admin/dashboard', {
      headers: { Cookie: userCookie },
    });
    assert(res.status === 307 || res.status === 308, `Redirect status returned (got ${res.status})`);
    assert(res.location?.includes('/dashboard'), `Standard user redirected to /dashboard (got '${res.location}')`);
    passed++;
  } catch (err) {
    console.error('Test 9 failed:', err.message);
    failed++;
  }

  // TEST 10: Middleware Boundary - Authenticated User visiting /login bounces to /dashboard
  console.log('\n[TEST 10] Edge Boundary: Authenticated User visiting /login bounces to /dashboard');
  try {
    const res = await makeRequest('/login', {
      headers: { Cookie: userCookie },
    });
    assert(res.status === 307 || res.status === 308, `Redirect status returned (got ${res.status})`);
    assert(res.location?.includes('/dashboard'), `Authenticated user redirected to /dashboard (got '${res.location}')`);
    passed++;
  } catch (err) {
    console.error('Test 10 failed:', err.message);
    failed++;
  }

  // TEST 11: Middleware Boundary - Authenticated Admin visiting /login bounces to /admin/dashboard
  console.log('\n[TEST 11] Edge Boundary: Authenticated Admin visiting /login bounces to /admin/dashboard');
  try {
    const res = await makeRequest('/login', {
      headers: { Cookie: adminCookie },
    });
    assert(res.status === 307 || res.status === 308, `Redirect status returned (got ${res.status})`);
    assert(res.location?.includes('/admin/dashboard'), `Authenticated admin redirected to /admin/dashboard (got '${res.location}')`);
    passed++;
  } catch (err) {
    console.error('Test 11 failed:', err.message);
    failed++;
  }

  console.log('\n=============================================================================');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
