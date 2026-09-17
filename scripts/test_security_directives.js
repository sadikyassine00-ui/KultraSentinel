const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env.local if present
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  // Ignore
}

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'support@usekultra.com';
const ADMIN_PASS = 'KultraSentinel2026!';
const TENANT_A_EMAIL = 'marcus.vance@apexmedia.io';
const TENANT_B_EMAIL = 'elena.rostova@solarestudio.com';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path || '/', options.baseUrl || BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      if (typeof postData === 'string') {
        req.write(postData);
      } else {
        req.write(JSON.stringify(postData));
      }
    }
    req.end();
  });
}

async function runSecurityTests() {
  console.log('====================================================');
  console.log('KULTRA PLATFORM SECURITY & AUTH DIRECTIVES TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - Detail: ${detail}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // Scenario 0: Login and acquire valid cryptographic session token
    // -------------------------------------------------------------------------
    console.log('--- Phase 1: Cookie Hardening & Session Issuance ---');
    const loginRes = await request(
      {
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.1', // Distinct test IP
        },
      },
      { email: ADMIN_EMAIL, password: ADMIN_PASS }
    );

    assert(loginRes.statusCode === 200, 'Admin login API returns 200 OK');
    const setCookieHeader = loginRes.headers['set-cookie'];
    assert(!!setCookieHeader, 'Login response sets session cookie');

    const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : (setCookieHeader || '');
    assert(cookieStr.includes('HttpOnly'), 'Cookie is marked HttpOnly (prevent script access)');
    assert(cookieStr.includes('SameSite=Lax') || cookieStr.includes('samesite=lax'), 'Cookie has SameSite=Lax (cross-site defense)');
    assert(cookieStr.includes('Max-Age=604800') || cookieStr.includes('max-age=604800'), 'Cookie has 7-day hard expiration (604800s)');

    const match = cookieStr.match(/kultra_admin_session=([^;]+)/);
    const validToken = match ? match[1] : '';
    assert(validToken.length > 20, 'Valid cryptographic JWT token retrieved');

    // -------------------------------------------------------------------------
    // Scenario 1: Logged-in user visiting login screen is redirected to dashboard
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 2: Checklist #1 - Logged-In User Visiting Login Screen ---');
    const authVisitRes = await request({
      method: 'GET',
      path: '/admin/login',
      headers: {
        Cookie: `kultra_admin_session=${validToken}`,
      },
    });

    assert(
      authVisitRes.statusCode === 307 || authVisitRes.statusCode === 302 || authVisitRes.statusCode === 308,
      'Authenticated user visiting /admin/login is intercepted and redirected',
      `Status: ${authVisitRes.statusCode}`
    );
    const location1 = authVisitRes.headers['location'] || '';
    assert(
      location1.includes('/admin/dashboard'),
      'Redirect target is strictly the main dashboard (/admin/dashboard)',
      `Location: ${location1}`
    );

    // Also test public /login
    const publicLoginVisit = await request({
      method: 'GET',
      path: '/login',
      headers: {
        Cookie: `kultra_admin_session=${validToken}`,
      },
    });
    assert(
      (publicLoginVisit.headers['location'] || '').includes('/admin/dashboard'),
      'Authenticated user visiting /login is also redirected to /admin/dashboard',
      `Location: ${publicLoginVisit.headers['location']}`
    );

    // -------------------------------------------------------------------------
    // Scenario 2: Logged-out user visiting dashboard redirected to login with return URL
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 3: Checklist #2 - Unauthenticated Visitor Gate ---');
    const unauthDashboardRes = await request({
      method: 'GET',
      path: '/admin/dashboard',
      headers: {},
    });

    assert(
      unauthDashboardRes.statusCode === 307 || unauthDashboardRes.statusCode === 302,
      'Unauthenticated visitor accessing /admin/dashboard is intercepted with redirect',
      `Status: ${unauthDashboardRes.statusCode}`
    );
    const location2 = unauthDashboardRes.headers['location'] || '';
    assert(
      location2.includes('/admin/login'),
      'Redirect destination pushes visitor to /admin/login',
      `Location: ${location2}`
    );
    assert(
      location2.includes('redirect=%2Fadmin%2Fdashboard') || location2.includes('redirect=/admin/dashboard'),
      'Return URL is securely attached to login redirect destination',
      `Location: ${location2}`
    );

    // -------------------------------------------------------------------------
    // Scenario 3: Tampered cookie recognized, cleared, and redirected to login
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 4: Checklist #3 - Tampered / Forged Cookie Defense ---');
    // We create a fake tampered JWT token with forged signature
    const forgedToken = validToken.slice(0, -10) + 'TAMPERED99';
    const tamperedRes = await request({
      method: 'GET',
      path: '/admin/dashboard',
      headers: {
        Cookie: `kultra_admin_session=${forgedToken}`,
      },
    });

    assert(
      tamperedRes.statusCode === 307 || tamperedRes.statusCode === 302,
      'Tampered cookie request is blocked and redirected to login',
      `Status: ${tamperedRes.statusCode}`
    );
    const tamperedLocation = tamperedRes.headers['location'] || '';
    assert(
      tamperedLocation.includes('/admin/login'),
      'Tampered session redirected to /admin/login',
      `Location: ${tamperedLocation}`
    );
    assert(
      tamperedLocation.includes('error='),
      'Error message attached notifying signature invalidation',
      `Location: ${tamperedLocation}`
    );

    const clearCookieHeader = tamperedRes.headers['set-cookie'];
    const clearCookieStr = Array.isArray(clearCookieHeader) ? clearCookieHeader.join('; ') : (clearCookieHeader || '');
    assert(
      clearCookieStr.includes('Max-Age=0') || clearCookieStr.includes('max-age=0'),
      'Invalid/tampered session cookie is immediately purged from client storage (Max-Age=0)',
      `Set-Cookie: ${clearCookieStr}`
    );

    // -------------------------------------------------------------------------
    // Scenario 4: Anti-IDOR Tenant Data Ownership Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 5: Checklist #4 - Cross-Account Data Leak Defense (Anti-IDOR) ---');

    const { SignJWT } = require('jose');
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'kultra-sentinel-fallback-secret-key-32-chars-min!');

    async function makeToken(payload) {
      return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);
    }

    // Create session for User A (Marcus Vance - tenant_id 1, owns store 1 & 2)
    const userAToken = await makeToken({
      email: TENANT_A_EMAIL,
      role: 'tenant',
      name: 'Marcus Vance',
    });

    // User B (Elena Rostova - owns store 3: solarestudio.com)
    const userBToken = await makeToken({
      email: TENANT_B_EMAIL,
      role: 'tenant',
      name: 'Elena Rostova',
    });

    // 4a. User A legitimately accesses Store 1 (owned by User A)
    const legitStoreRes = await request({
      method: 'GET',
      path: '/api/stores/1',
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(legitStoreRes.statusCode === 200, 'User A can load their own store record (Store #1)');
    const legitData = JSON.parse(legitStoreRes.body);
    assert(legitData.store.tenant_email === TENANT_A_EMAIL, 'Store #1 belongs to User A');

    // 4b. User A attempts to view Store 3 (owned by User B: Elena)
    const idorViewRes = await request({
      method: 'GET',
      path: '/api/stores/3',
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(
      idorViewRes.statusCode === 404 || idorViewRes.statusCode === 403,
      'User A attempting to view User B store (Store #3) is rejected with 404/403',
      `Status: ${idorViewRes.statusCode}, Body: ${idorViewRes.body}`
    );

    // 4c. User A attempts to tamper/update Store 3 (owned by User B)
    const idorUpdateRes = await request(
      {
        method: 'PATCH',
        path: '/api/stores/3',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
      },
      { store_url: 'https://hacked-by-user-a.com' }
    );
    assert(
      idorUpdateRes.statusCode === 404 || idorUpdateRes.statusCode === 403,
      'User A attempting to update User B store (Store #3) is rejected with 404/403',
      `Status: ${idorUpdateRes.statusCode}, Body: ${idorUpdateRes.body}`
    );

    // Verify Store 3 was NOT modified
    const store3Check = await request({
      method: 'GET',
      path: '/api/stores/3',
      headers: {
        Authorization: `Bearer ${userBToken}`,
      },
    });
    assert(store3Check.statusCode === 200, 'User B can still access their unmodified Store #3');
    const store3Data = JSON.parse(store3Check.body);
    assert(
      store3Data.store.store_url === 'solarestudio.com',
      'Store #3 was protected from IDOR tampering'
    );

    // 4d. User A attempts to delete Store 3 (owned by User B)
    const idorDeleteRes = await request({
      method: 'DELETE',
      path: '/api/stores/3',
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(
      idorDeleteRes.statusCode === 404 || idorDeleteRes.statusCode === 403,
      'User A attempting to delete User B store (Store #3) is rejected with 404/403',
      `Status: ${idorDeleteRes.statusCode}`
    );

    // -------------------------------------------------------------------------
    // Scenario 5: Open Redirect Defense Sanitization
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 6: Open-Redirect Defense ---');

    // 5a. Attempt external HTTPS open-redirect
    const openRedirect1 = await request(
      {
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.2',
        },
      },
      { email: ADMIN_EMAIL, password: ADMIN_PASS, redirect: 'https://evil-phishing-site.com' }
    );
    const orData1 = JSON.parse(openRedirect1.body);
    assert(
      orData1.redirectUrl === '/admin/dashboard',
      'Rejects external absolute https URL, defaults to /admin/dashboard',
      `Got: ${orData1.redirectUrl}`
    );

    // 5b. Attempt protocol-relative open-redirect (//evil.com)
    const openRedirect2 = await request(
      {
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.3',
        },
      },
      { email: ADMIN_EMAIL, password: ADMIN_PASS, redirect: '//evil.com/fake-login' }
    );
    const orData2 = JSON.parse(openRedirect2.body);
    assert(
      orData2.redirectUrl === '/admin/dashboard',
      'Rejects protocol-relative // URL, defaults to /admin/dashboard',
      `Got: ${orData2.redirectUrl}`
    );

    // 5c. Attempt backslash traversal (/\\evil.com)
    const openRedirect3 = await request(
      {
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.4',
        },
      },
      { email: ADMIN_EMAIL, password: ADMIN_PASS, redirect: '/\\evil.com' }
    );
    const orData3 = JSON.parse(openRedirect3.body);
    assert(
      orData3.redirectUrl === '/admin/dashboard',
      'Rejects backslash traversal URL, defaults to /admin/dashboard',
      `Got: ${orData3.redirectUrl}`
    );

    // 5d. Legitimate relative internal destination
    const openRedirect4 = await request(
      {
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.5',
        },
      },
      { email: ADMIN_EMAIL, password: ADMIN_PASS, redirect: '/admin/dashboard?tab=telemetry' }
    );
    const orData4 = JSON.parse(openRedirect4.body);
    assert(
      orData4.redirectUrl === '/admin/dashboard?tab=telemetry',
      'Preserves safe relative internal destination (/admin/dashboard?tab=telemetry)',
      `Got: ${orData4.redirectUrl}`
    );

    // -------------------------------------------------------------------------
    // Scenario 6: Brute-Force & Abuse Protection (IP Rate Limiting)
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 7: IP Rate Limiting & Abuse Defense ---');
    const attackerIp = '203.0.113.42'; // Dedicated testing IP

    let rateLimited = false;
    let rateLimitRes = null;

    for (let i = 1; i <= 6; i++) {
      const res = await request(
        {
          method: 'POST',
          path: '/api/auth/login',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': attackerIp,
          },
        },
        { email: ADMIN_EMAIL, password: 'WrongPassword123!' }
      );

      if (res.statusCode === 429) {
        rateLimited = true;
        rateLimitRes = res;
        break;
      }
    }

    assert(rateLimited === true, 'Rate limiter activates and returns HTTP 429 after threshold exceeded');
    assert(
      !!rateLimitRes && !!rateLimitRes.headers['retry-after'],
      'HTTP 429 response includes Retry-After header',
      `Retry-After: ${rateLimitRes?.headers['retry-after']}`
    );
    const rateBody = JSON.parse(rateLimitRes.body);
    assert(
      rateBody.error.includes('Too many failed'),
      'Returns descriptive rate limit error message to client'
    );

    // -------------------------------------------------------------------------
    // Final Summary
    // -------------------------------------------------------------------------
    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Test Suite Error:', err);
    process.exit(1);
  }
}

runSecurityTests();
