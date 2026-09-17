const http = require('http');

const BASE_URL = 'http://localhost:3000';
let passed = 0;
let failed = 0;

function assert(condition, name, detail = '') {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name} - Detail: ${detail}`);
    failed++;
  }
}

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

    const startTime = Date.now();
    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json,
          duration,
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

async function runLiveTests() {
  console.log('======================================================');
  console.log('ENTERPRISE AUTH & SESSION ARCHITECTURE LIVE HTTP SUITE');
  console.log('======================================================\n');

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Registration Password Entropy & Input Bounds
    // -------------------------------------------------------------------------
    console.log('--- Phase 1: Registration Validation & Entropy Enforcement ---');

    // 1.1 Rejects password shorter than 10 characters
    const shortPassRes = await request(
      {
        method: 'POST',
        path: '/api/auth/register',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.10',
        },
      },
      {
        email: 'test_short@example.com',
        password: 'Pass1!',
        companyName: 'Short Corp',
        agreedToTerms: true,
      }
    );
    assert(shortPassRes.statusCode === 400, 'Rejects password shorter than 10 chars with 400 Bad Request');
    assert(
      shortPassRes.json?.error?.includes('10 characters'),
      'Returns descriptive password length error message',
      shortPassRes.body
    );

    // 1.2 Rejects password missing symbol
    const noSymbolRes = await request(
      {
        method: 'POST',
        path: '/api/auth/register',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.11',
        },
      },
      {
        email: 'test_nosymbol@example.com',
        password: 'StrongPassword12345',
        companyName: 'No Symbol Corp',
        agreedToTerms: true,
      }
    );
    assert(noSymbolRes.statusCode === 400, 'Rejects password lacking symbol with 400 Bad Request');
    assert(
      noSymbolRes.json?.error?.includes('symbol'),
      'Returns descriptive symbol error',
      noSymbolRes.body
    );

    // 1.3 Rejects breached password pattern
    const breachedRes = await request(
      {
        method: 'POST',
        path: '/api/auth/register',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.12',
        },
      },
      {
        email: 'test_breached@example.com',
        password: 'Password123!',
        companyName: 'Breached Corp',
        agreedToTerms: true,
      }
    );
    assert(breachedRes.statusCode === 400, 'Rejects breached pattern password (Password123!) with 400');
    assert(
      breachedRes.json?.error?.includes('breached') || breachedRes.json?.error?.includes('trivial'),
      'Returns anti-breach error notification',
      breachedRes.body
    );

    // 1.4 Rejects registration without Terms acceptance
    const noTermsRes = await request(
      {
        method: 'POST',
        path: '/api/auth/register',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.13',
        },
      },
      {
        email: 'test_noterms@example.com',
        password: 'ValidEnterprisePass123!@#',
        companyName: 'No Terms Corp',
        agreedToTerms: false,
      }
    );
    assert(noTermsRes.statusCode === 400, 'Rejects registration when agreedToTerms is false');
    assert(noTermsRes.json?.error?.includes('Terms of Service'), 'Returns legal terms required error');

    // 1.5 Valid Registration with Tenant Provisioning
    const uniqueEmail = `merchant_${Date.now()}@domain.com`;
    const validRegRes = await request(
      {
        method: 'POST',
        path: '/api/auth/register',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.14',
        },
      },
      {
        email: `  ${uniqueEmail.toUpperCase()}  `, // Test email normalization (spaces & uppercase)
        password: 'Sentinel#Enterprise2026!',
        companyName: 'Apex Zenith Outfitters',
        website: 'apexzenith.com',
        agreedToTerms: true,
      }
    );
    assert(validRegRes.statusCode === 200, 'Valid registration succeeds with 200 OK', validRegRes.body);
    assert(validRegRes.json?.success === true, 'Returns success: true');
    assert(validRegRes.json?.user?.email === uniqueEmail.toLowerCase(), 'Normalized email stored in lowercase without whitespace');
    assert(
      validRegRes.headers['set-cookie'] && validRegRes.headers['set-cookie'].some((c) => c.includes('HttpOnly')),
      'Sets HttpOnly session cookie on registration'
    );
    assert(validRegRes.json?.redirectUrl?.includes('/dashboard'), 'Redirects newly registered user directly to /dashboard');

    // -------------------------------------------------------------------------
    // TEST 2: User Enumeration Prevention & Timing Equalization
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 2: User Enumeration Prevention & Timing Side-Channel Defense ---');

    // 2.1 Non-existent user login
    const nonExistentRes = await request(
      {
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.20',
        },
      },
      {
        email: 'completely_nonexistent_user_998877@example.com',
        password: 'SomeRandomPassword123!',
      }
    );
    assert(nonExistentRes.statusCode === 401, 'Non-existent user login returns 401 Unauthorized');
    assert(nonExistentRes.json?.error === 'Invalid email or password.', 'Returns identical generic error for non-existent email');

    // 2.2 Existing user with wrong password
    const wrongPassRes = await request(
      {
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.21',
        },
      },
      {
        email: uniqueEmail, // Existing user created above
        password: 'WrongPassword999!',
      }
    );
    assert(wrongPassRes.statusCode === 401, 'Existing user with wrong password returns 401 Unauthorized');
    assert(wrongPassRes.json?.error === 'Invalid email or password.', 'Returns identical generic error for wrong password');

    console.log(`[INFO] Non-existent user login duration: ${nonExistentRes.duration}ms | Wrong password login duration: ${wrongPassRes.duration}ms`);
    const timingDifference = Math.abs(nonExistentRes.duration - wrongPassRes.duration);
    assert(
      timingDifference < 250,
      'Timing difference between existing and non-existent accounts is equalized via dummy hash comparison',
      `diff=${timingDifference}ms`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Google OAuth Strict Scope Isolation & State CSRF
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 3: Google OAuth Scope Isolation & State Mitigation ---');

    const googleAuthRes = await request({
      method: 'GET',
      path: '/api/auth/google?format=json',
      headers: {
        'X-Forwarded-For': '198.51.100.30',
      },
    });

    assert(googleAuthRes.statusCode === 200, 'GET /api/auth/google returns 200 with authorization URL payload');
    const authUrlStr = googleAuthRes.json?.url || '';
    assert(authUrlStr.includes('accounts.google.com'), 'Auth URL targets Google OAuth 2.0');

    // Verify scope parameters
    const parsedAuthUrl = new URL(authUrlStr);
    const requestedScope = parsedAuthUrl.searchParams.get('scope') || '';
    assert(requestedScope.includes('openid'), 'Scope includes openid');
    assert(requestedScope.includes('email'), 'Scope includes email');
    assert(requestedScope.includes('profile'), 'Scope includes profile');
    assert(
      !requestedScope.includes('auth/content'),
      'CRITICAL: Scope strictly excludes Google Merchant Center / Content API (auth/content)'
    );

    // Verify CSRF state
    const stateParam = parsedAuthUrl.searchParams.get('state') || '';
    assert(stateParam.length >= 32, 'OAuth state parameter is high-entropy cryptorandom (length >= 32)', `len=${stateParam.length}`);

    const stateCookieHeader = googleAuthRes.headers['set-cookie'] || [];
    const stateCookie = stateCookieHeader.find((c) => c.includes('kultra_oauth_state='));
    assert(!!stateCookie, 'GET /api/auth/google issues kultra_oauth_state cookie');
    assert(stateCookie.includes('HttpOnly'), 'OAuth state cookie is HttpOnly');
    assert(stateCookie.toLowerCase().includes('samesite=lax'), 'OAuth state cookie has SameSite=Lax');

    // Verify Callback rejects mismatched or forged state
    const callbackBogusStateRes = await request({
      method: 'GET',
      path: '/api/auth/google/callback?state=forged_state_value_123&code=sample_code',
      headers: {
        Cookie: stateCookie.split(';')[0],
      },
    });
    assert(
      callbackBogusStateRes.statusCode === 307 || callbackBogusStateRes.statusCode === 302,
      'Callback redirects on state mismatch'
    );
    const callbackLocation = callbackBogusStateRes.headers['location'] || '';
    assert(
      callbackLocation.includes('/login') && callbackLocation.includes('error='),
      'Callback redirects to /login with security verification error on state mismatch',
      callbackLocation
    );

    // -------------------------------------------------------------------------
    // TEST 4: Session Hardening & Server-Side Revocation on Logout
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 4: Session Hardening & Server-Side Revocation ---');

    // Login with created user
    const loginRes = await request(
      {
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.40',
        },
      },
      {
        email: uniqueEmail,
        password: 'Sentinel#Enterprise2026!',
      }
    );
    assert(loginRes.statusCode === 200, 'Login succeeds for newly provisioned user');
    const sessionCookieHeader = loginRes.headers['set-cookie']?.find((c) => c.includes('kultra_admin_session='));
    assert(!!sessionCookieHeader, 'Session cookie issued');
    assert(sessionCookieHeader.includes('HttpOnly'), 'Session cookie is HttpOnly');
    assert(sessionCookieHeader.includes('SameSite=Lax') || sessionCookieHeader.includes('samesite=lax'), 'Session cookie is SameSite=Lax');

    const rawSessionCookie = sessionCookieHeader.split(';')[0];

    // Call /api/auth/logout with session cookie
    const logoutRes = await request({
      method: 'POST',
      path: '/api/auth/logout',
      headers: {
        Cookie: rawSessionCookie,
        'X-Forwarded-For': '198.51.100.40',
      },
    });
    assert(logoutRes.statusCode === 200, 'Logout succeeds with 200 OK');
    const clearCookieHeader = logoutRes.headers['set-cookie']?.find((c) => c.includes('kultra_admin_session='));
    assert(clearCookieHeader && (clearCookieHeader.includes('Max-Age=0') || clearCookieHeader.includes('max-age=0')), 'Logout clears session cookie with Max-Age=0');

    // -------------------------------------------------------------------------
    // TEST 5: Dual-Key Rate Limiting & 5-Attempt Ceiling
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 5: Rate Limiting & Brute-Force Ceiling ---');

    const rateLimitIp = `198.51.100.${Math.floor(Math.random() * 200) + 50}`;
    const victimEmail = `victim_${Date.now()}@domain.com`;

    for (let attempt = 1; attempt <= 5; attempt++) {
      const attemptRes = await request(
        {
          method: 'POST',
          path: '/api/auth/login',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': rateLimitIp,
          },
        },
        {
          email: victimEmail,
          password: 'WrongPassword123!',
        }
      );
      assert(attemptRes.statusCode === 401, `Failed attempt ${attempt} yields 401 Unauthorized`);
    }

    // 6th Attempt MUST be rate limited with HTTP 429
    const blockedRes = await request(
      {
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': rateLimitIp,
        },
      },
      {
        email: victimEmail,
        password: 'WrongPassword123!',
      }
    );
    assert(blockedRes.statusCode === 429, '6th invalid attempt triggers HTTP 429 Too Many Requests', `Status: ${blockedRes.statusCode}`);
    assert(blockedRes.headers['retry-after'], 'HTTP 429 response includes Retry-After header', blockedRes.headers['retry-after']);
    assert(blockedRes.json?.error?.includes('Too many failed authentication attempts'), 'Returns standard rate limit security message');

    console.log('\n======================================================');
    console.log(`LIVE E2E TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Unexpected error running live tests:', err);
    process.exit(1);
  }
}

runLiveTests();
