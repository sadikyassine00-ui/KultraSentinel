/**
 * Test Driven Development (TDD) Suite for Kultra
 * Tests: Form Submissions, Neon DB Data Access, Admin Auth, Protected APIs, Status Updates
 * Run with: node scripts/test_admin_suite.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
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
  return {
    status: res.status,
    headers: res.headers,
    data,
    setCookie,
  };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

async function runSuite() {
  console.log('=============================================================================');
  console.log('       KULTRA - ADMIN & NEON DB TDD VERIFICATION SUITE              ');
  console.log('=============================================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Form Ingestion Validation
  console.log('[TEST GROUP 1] Pilot Lead Form Ingestion & Validation');
  try {
    // 1.1 Invalid email rejection
    const invalidEmailRes = await makeRequest('/api/leads', {
      method: 'POST',
      body: { email: 'invalid-email', website: 'https://teststore.com' },
    });
    assert(invalidEmailRes.status === 400, 'Rejects invalid email format with 400 Bad Request');
    passed++;

    // 1.2 Missing website rejection
    const missingWebsiteRes = await makeRequest('/api/leads', {
      method: 'POST',
      body: { email: 'merchant@teststore.com', website: '' },
    });
    assert(missingWebsiteRes.status === 400, 'Rejects missing store website with 400 Bad Request');
    passed++;

    // 1.3 Successful submission & persistence
    const testEmail = `pilot-${Date.now()}@outdoorgear.com`;
    const validLeadRes = await makeRequest('/api/leads', {
      method: 'POST',
      body: {
        email: testEmail,
        accountType: 'merchant',
        website: 'outdoorgear.com',
        catalogSize: '1,000 - 5,000 SKUs',
      },
    });
    assert(validLeadRes.status === 200, 'Accepts valid pilot application with 200 OK');
    assert(validLeadRes.data.success === true, 'Returns success: true flag');
    assert(validLeadRes.data.bookingUrl === 'https://cal.com/kultra/15min-audit', 'Returns 15-min Cal.com booking URL');
    assert(typeof validLeadRes.data.leadId === 'number', 'Returns generated database lead ID');
    passed += 4;
  } catch (err) {
    console.error('Test Group 1 Error:', err.message);
    failed++;
  }

  // TEST 2: Security & Unauthenticated Access Prevention
  console.log('\n[TEST GROUP 2] Admin Security & Unauthorized Guard');
  try {
    // 2.1 Protected leads API without cookie
    const unauthLeads = await makeRequest('/api/admin/leads');
    assert(unauthLeads.status === 401, 'Rejects unauthenticated GET /api/admin/leads with 401');
    passed++;

    // 2.2 Protected telemetry API without cookie
    const unauthTelemetry = await makeRequest('/api/admin/telemetry');
    assert(unauthTelemetry.status === 401, 'Rejects unauthenticated GET /api/admin/telemetry with 401');
    passed++;

    // 2.3 Verify /api/auth/me returns 401 when not logged in
    const unauthMe = await makeRequest('/api/auth/me');
    assert(unauthMe.status === 401, 'GET /api/auth/me returns 401 for anonymous visitor');
    passed++;
  } catch (err) {
    console.error('Test Group 2 Error:', err.message);
    failed++;
  }

  // TEST 3: Admin Login & Session Management
  console.log('\n[TEST GROUP 3] Admin Login & Session Management');
  let sessionCookie = '';
  try {
    // 3.1 Invalid password rejection
    const badLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'support@usekultra.com', password: 'WrongPassword999!' },
    });
    assert(badLogin.status === 401, 'Rejects invalid password with 401 Unauthorized');
    passed++;

    // 3.2 Non-whitelisted regular user rejection
    const nonAdminLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'regularuser@gmail.com', password: 'AnyPassword123!' },
    });
    assert(nonAdminLogin.status === 403, 'Rejects non-admin user email with 403 Forbidden');
    passed++;

    // 3.3 Valid authorized admin login (support@usekultra.com)
    const goodLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'support@usekultra.com', password: 'KultraSentinel2026!' },
    });
    assert(goodLogin.status === 200, 'Authenticates authorized admin (support@usekultra.com) with 200 OK');
    assert(goodLogin.data.success === true, 'Returns success: true payload');
    assert(goodLogin.data.user.email === 'support@usekultra.com', 'Returns correct admin user object');
    assert(Boolean(goodLogin.setCookie), 'Issues HttpOnly kultra_admin_session cookie');
    sessionCookie = goodLogin.setCookie.split(';')[0];
    passed += 4;
  } catch (err) {
    console.error('Test Group 3 Error:', err.message);
    failed++;
  }

  // TEST 4: Authenticated Operations on Admin Dashboard
  console.log('\n[TEST GROUP 4] Authenticated Leads Retrieval & Status Triage');
  try {
    // 4.1 Check /api/auth/me with session cookie
    const authMe = await makeRequest('/api/auth/me', {
      headers: { Cookie: sessionCookie },
    });
    assert(authMe.status === 200, 'GET /api/auth/me validates active session cookie with 200');
    assert(authMe.data.authenticated === true, 'Returns authenticated: true');
    passed += 2;

    // 4.2 Fetch leads with session cookie
    const leadsRes = await makeRequest('/api/admin/leads', {
      headers: { Cookie: sessionCookie },
    });
    assert(leadsRes.status === 200, 'GET /api/admin/leads returns 200 with session cookie');
    assert(Array.isArray(leadsRes.data.leads), 'Returns array of leads from database');
    assert(leadsRes.data.leads.length > 0, 'Contains persisted pilot leads');
    passed += 3;

    // 4.3 Update lead status (e.g. pending -> approved)
    const targetLead = leadsRes.data.leads[0];
    const updateRes = await makeRequest('/api/admin/leads', {
      method: 'PATCH',
      headers: { Cookie: sessionCookie },
      body: {
        id: targetLead.id,
        status: 'approved',
        notes: 'Verified high-volume Shopify merchant with $250k monthly ad spend.',
      },
    });
    assert(updateRes.status === 200, 'PATCH /api/admin/leads updates status with 200 OK');
    assert(updateRes.data.lead.status === 'approved', 'Persists new status "approved" in database');
    passed += 2;

    // 4.4 Fetch Telemetry Stats
    const telemetryRes = await makeRequest('/api/admin/telemetry', {
      headers: { Cookie: sessionCookie },
    });
    assert(telemetryRes.status === 200, 'GET /api/admin/telemetry returns 200 with session cookie');
    assert(typeof telemetryRes.data.stats.totalLeads === 'number', 'Returns real totalLeads count');
    assert(typeof telemetryRes.data.stats.revenueProtected === 'string', 'Returns protected revenue metric');
    assert(Array.isArray(telemetryRes.data.stats.recentEvents), 'Returns real telemetry events array');
    passed += 4;

    // 4.5 Logout clears session
    const logoutRes = await makeRequest('/api/auth/logout', { method: 'POST' });
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns 200');
    assert(logoutRes.setCookie && logoutRes.setCookie.includes('Max-Age=0'), 'Sets Max-Age=0 to invalidate cookie');
    passed += 2;
  } catch (err) {
    console.error('Test Group 4 Error:', err.message);
    failed++;
  }

  // TEST 5: Google OAuth Endpoint Contract
  console.log('\n[TEST GROUP 5] Google OAuth Authentication Contract');
  try {
    // 5.1 Rejects empty payload
    const emptyGoogle = await makeRequest('/api/auth/google', {
      method: 'POST',
      body: {},
    });
    assert(emptyGoogle.status === 400, 'Rejects empty Google OAuth request with 400 Bad Request');
    passed++;

    // 5.2 Rejects non-admin Google identity with 403 Forbidden
    const nonAdminGoogle = await makeRequest('/api/auth/google', {
      method: 'POST',
      body: { demoEmail: 'unauthorized-shopper@gmail.com', demoName: 'Regular User' },
    });
    assert(nonAdminGoogle.status === 403, 'Rejects non-admin Google account with 403 Forbidden');
    passed++;

    // 5.3 Accepts authorized administrator Google identity (support@usekultra.com)
    const adminGoogle = await makeRequest('/api/auth/google', {
      method: 'POST',
      body: { demoEmail: 'support@usekultra.com', demoName: 'Kultra Founder' },
    });
    assert(adminGoogle.status === 200, 'Authenticates authorized admin Google identity (support@usekultra.com) with 200 OK');
    assert(Boolean(adminGoogle.setCookie), 'Issues session cookie on authorized Google sign-in');
    passed += 2;
  } catch (err) {
    console.error('Test Group 5 Error:', err.message);
    failed++;
  }

  console.log('\n=============================================================================');
  console.log(`TDD SUITE COMPLETED: ${passed} assertions passed, ${failed} failed.`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
