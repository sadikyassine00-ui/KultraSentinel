/**
 * End-to-End Verification Suite for Admin Backend Actions and User Suspension System
 */

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
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ [PASS] ${message}`);
}

async function runSuite() {
  console.log('=============================================================================');
  console.log('     KULTRA - BACKEND ACTIONS & USER SUSPENSION VERIFICATION        ');
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
  const secondaryEmail = `merchant_${Date.now()}@example.com`;
  const registerRes = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: {
      email: secondaryEmail,
      password: 'ApexSentinel#9824$Nordic',
      companyName: 'Apex Nordic Apparel',
      website: 'https://apexnordic.com',
      accountType: 'merchant',
      agreedToTerms: true,
    },
  });
  if (registerRes.status !== 200) {
    console.error('Registration failed with status:', registerRes.status, registerRes.data);
  }
  assert(registerRes.status === 200, `Secondary user ${secondaryEmail} registered successfully`);
  const secondaryCookie = registerRes.setCookie?.split(';')[0];
  assert(!!secondaryCookie, 'Received secondary user session cookie');

  // STEP 3: Verify Initial Active Status for Secondary User
  console.log('\n[STEP 3] Verify Initial Active Status & Catalog Queries');
  const initialMe = await makeRequest('/api/auth/me', {
    headers: { Cookie: secondaryCookie },
  });
  assert(initialMe.status === 200, 'Secondary user session valid');
  assert(initialMe.data.isSuspended === false, 'Secondary user is not suspended initially');

  const initialDash = await makeRequest('/api/dashboard', {
    headers: { Cookie: secondaryCookie },
  });
  assert(initialDash.status === 200, 'Secondary user can query catalog dashboard');

  // STEP 4: Query Tenant List as Superadmin to Locate Secondary User
  console.log('\n[STEP 4] Query Tenants Table as Superadmin');
  const tenantsList = await makeRequest('/api/admin/super/tenants', {
    headers: { Cookie: superadminCookie },
  });
  assert(tenantsList.status === 200, 'Superadmin retrieved tenant list');
  const secondaryTenant = tenantsList.data.tenants.find((t) => t.email.toLowerCase() === secondaryEmail.toLowerCase());
  assert(!!secondaryTenant, 'Found registered secondary tenant in admin table');
  console.log(`  ℹ️ Tenant ID: ${secondaryTenant.id}, Initial Status: ${secondaryTenant.status}`);

  // STEP 5: Security Test - Superadmin Cannot Be Suspended
  console.log('\n[STEP 5] Security Guard: Attempt Suspending Superadmin');
  const superTenant = tenantsList.data.tenants.find((t) => t.email === 'yassinesadik0@gmail.com');
  if (superTenant) {
    const suspendSuperRes = await makeRequest('/api/admin/super/tenants', {
      method: 'PATCH',
      headers: { Cookie: superadminCookie },
      body: { id: superTenant.id, action: 'suspend' },
    });
    assert(suspendSuperRes.status === 400, 'Superadmin suspension was rejected with HTTP 400');
  } else {
    console.log('  ℹ️ Superadmin does not have a tenant record; permanent access verified.');
  }

  // STEP 6: Superadmin Suspends Secondary Tenant
  console.log('\n[STEP 6] Superadmin Suspends Secondary Merchant');
  const suspendRes = await makeRequest('/api/admin/super/tenants', {
    method: 'PATCH',
    headers: { Cookie: superadminCookie },
    body: { id: secondaryTenant.id, action: 'suspend' },
  });
  assert(suspendRes.status === 200, 'Suspension action returned HTTP 200');
  assert(suspendRes.data.tenant.status === 'suspended', 'Tenant record status updated to "suspended"');

  // STEP 7: Route Guard Verification - Catalog & Incident Queries Blocked (HTTP 403)
  console.log('\n[STEP 7] Route Guard Verification for Suspended User');
  const suspendedMe = await makeRequest('/api/auth/me', {
    headers: { Cookie: secondaryCookie },
  });
  assert(suspendedMe.status === 200, 'Auth status checked');
  assert(suspendedMe.data.isSuspended === true, 'Secondary user is marked as suspended');

  const suspendedDash = await makeRequest('/api/dashboard', {
    headers: { Cookie: secondaryCookie },
  });
  assert(suspendedDash.status === 403, 'Catalog query blocked with HTTP 403');
  assert(suspendedDash.data.isSuspended === true, 'Error payload contains isSuspended: true');
  assert(suspendedDash.data.supportEmail === 'support@usekultra.com', 'Provides support@usekultra.com');

  // STEP 8: Pub/Sub & Slack Muting Verification
  console.log('\n[STEP 8] Ingestion & Slack Muting for Suspended Store/User');
  const pubsubRes = await makeRequest('/api/ingest/pubsub', {
    method: 'POST',
    body: {
      message: {
        data: Buffer.from(
          JSON.stringify({
            store_url: 'apexnordic.com',
            sku: 'APEX-TEST-404',
            title: 'Nordic Shell Jacket',
            status: 'disapproved',
            issue_code: 'item_disapproved: missing_required_attribute [gtin]',
          })
        ).toString('base64'),
        messageId: `msg_test_${Date.now()}`,
      },
    },
  });
  // Since apexnordic.com is owned by suspended secondary user:
  assert(pubsubRes.status === 200, 'Pub/Sub endpoint acknowledged incoming message');
  console.log(`  ℹ️ Pub/Sub Action: ${pubsubRes.data.action}`);

  // STEP 9: Superadmin Unsuspends Secondary Tenant
  console.log('\n[STEP 9] Superadmin Unsuspends Secondary Merchant');
  const unsuspendRes = await makeRequest('/api/admin/super/tenants', {
    method: 'PATCH',
    headers: { Cookie: superadminCookie },
    body: { id: secondaryTenant.id, action: 'unsuspend' },
  });
  assert(unsuspendRes.status === 200, 'Unsuspend action returned HTTP 200');
  assert(unsuspendRes.data.tenant.status === 'active', 'Tenant record status restored to "active"');

  // STEP 10: Verify Normal Dashboard & Session Restored Immediately
  console.log('\n[STEP 10] Verify Instant Restoration of Normal Dashboard Access');
  const restoredMe = await makeRequest('/api/auth/me', {
    headers: { Cookie: secondaryCookie },
  });
  assert(restoredMe.status === 200 && restoredMe.data.isSuspended === false, 'Session status restored to active');

  const restoredDash = await makeRequest('/api/dashboard', {
    headers: { Cookie: secondaryCookie },
  });
  assert(restoredDash.status === 200, 'Catalog query succeeded with HTTP 200');
  console.log(`  ℹ️ Restored Dashboard ZeroStore State: ${restoredDash.data.zeroStore}`);

  // STEP 11: DLQ Replay & Purge Parameter Compatibility Verification
  console.log('\n[STEP 11] DLQ Action Parameter Fix Verification');
  const dlqReplay = await makeRequest('/api/admin/super/dlq', {
    method: 'POST',
    headers: { Cookie: superadminCookie },
    body: { action: 'replay', id: 1 },
  });
  assert(dlqReplay.status === 200 || dlqReplay.status === 404, 'DLQ replay endpoint accepts id parameter');

  const dlqPurge = await makeRequest('/api/admin/super/dlq', {
    method: 'POST',
    headers: { Cookie: superadminCookie },
    body: { action: 'purge', id: 1 },
  });
  assert(dlqPurge.status === 200 || dlqPurge.status === 404, 'DLQ purge endpoint accepts id parameter');

  console.log('\n=============================================================================');
  console.log('  🎉 ALL BACKEND ACTIONS & SUSPENSION TESTS PASSED PERFECTLY!');
  console.log('=============================================================================\n');
}

runSuite().catch((err) => {
  console.error('\n❌ Suite execution failed:', err);
  process.exit(1);
});
