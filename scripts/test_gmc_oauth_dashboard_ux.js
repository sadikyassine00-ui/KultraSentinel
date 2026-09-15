/**
 * TDD Verification Suite for INSTRUCTIONS.md:
 * "Google Merchant Center OAuth, Live Dashboard Engine & Conversion UX"
 * 
 * Verifies all 6 mandatory checklist workflows:
 * 1. Clean Connect
 * 2. CSRF Rejection (HTTP 403 Forbidden on invalid state)
 * 3. Double Claim Rejection (HTTP 409 Conflict)
 * 4. Slack Activation (Verification Ping & Arm System)
 * 5. Dynamic Triage (Live Pub/Sub ingestion without database wipe)
 * 6. Shopify Deep Link (?query= syntax and Auto-Resolved feedback)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment from .env.local
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
const TENANT_A_EMAIL = 'yassine@example.com';
const TENANT_B_EMAIL = 'imposter@shopify-merchants.com';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path || '/', BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          // not json
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json,
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

// Session Generator using Jose (matching application token logic)
const { SignJWT } = require('jose');
const AUTH_SECRET = process.env.AUTH_SECRET || 'kultra-sentinel-fallback-secret-key-32-chars-min!';

async function makeSessionCookie(email, role = 'merchant') {
  const secret = new TextEncoder().encode(AUTH_SECRET);
  const token = await new SignJWT({ email, role, name: email.split('@')[0] })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  return `kultra_admin_session=${token}`;
}

async function runGmcOAuthAndDashboardSuite() {
  console.log('=============================================================================');
  console.log('  KULTRA GMC OAUTH, LIVE DASHBOARD ENGINE & CONVERSION UX VERIFICATION SUITE ');
  console.log('=============================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  const tenantACookie = await makeSessionCookie(TENANT_A_EMAIL);
  const tenantBCookie = await makeSessionCookie(TENANT_B_EMAIL);

  // ---------------------------------------------------------------------------
  // CHECKLIST 1: Clean Connect & Stateful CSRF Token Initiation
  // ---------------------------------------------------------------------------
  console.log('[CHECKLIST 1] Clean Connect & Stateful CSRF Token Initiation');
  let gmcIdA = `gmc-${Date.now()}`;
  let storeAId = null;

  {
    // Step 1: Initiate OAuth connect
    const connectRes = await request({
      method: 'GET',
      path: '/api/auth/merchant/connect?format=json',
      headers: { Cookie: tenantACookie },
    });

    assert(connectRes.statusCode === 200, 'Initiation endpoint GET /api/auth/merchant/connect returns 200 OK');
    assert(!!connectRes.json?.url, 'Returns Google OAuth authorization URL');
    assert(connectRes.json.url.includes('accounts.google.com/o/oauth2/v2/auth'), 'Directs to Google OAuth authorization endpoint');
    assert(connectRes.json.url.includes('content.readonly'), 'Requests read-only Content API access scope');
    assert(connectRes.json.url.includes('access_type=offline'), 'Requests access_type=offline for refresh token');
    assert(connectRes.json.url.includes('prompt=consent'), 'Requests prompt=consent to guarantee refresh token return');
    assert(connectRes.json.url.includes('state='), 'Injects stateful CSRF verification token into Google authorization URL');

    // Verify kultra_oauth_state cookie
    const setCookie = connectRes.headers['set-cookie'];
    const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie || '';
    assert(cookieStr.includes('kultra_oauth_state='), 'Attaches encrypted HTTP-only kultra_oauth_state cookie');
    assert(cookieStr.includes('HttpOnly'), 'OAuth state cookie is marked HttpOnly');
    assert(cookieStr.includes('Max-Age=600') || cookieStr.includes('Expires='), 'OAuth state cookie has 10-minute expiration lifespan');

    // Programmatic Store Registration to simulate successful Google callback
    const registerRes = await request(
      {
        method: 'POST',
        path: '/api/auth/merchant/callback',
        headers: { Cookie: tenantACookie },
      },
      {
        gmcId: gmcIdA,
        storeName: 'Kultra Alpine Outfitters',
        storeUrl: 'https://alpine-outfitters.myshopify.com',
        refreshToken: '1//mock_refresh_token_offline_2026',
        tenantEmail: TENANT_A_EMAIL,
      }
    );

    assert(registerRes.statusCode === 200, 'Store registration succeeds with 200 OK');
    assert(registerRes.json?.store?.gmc_id === gmcIdA, `Store successfully registered with GMC ID ${gmcIdA}`);
    storeAId = registerRes.json?.store?.id;
    assert(!!storeAId, `Store assigned database ID #${storeAId}`);

    // Verify hydrated dashboard responds for this newly connected store
    const dashRes = await request({
      method: 'GET',
      path: `/api/dashboard?store_id=${storeAId}`,
      headers: { Cookie: tenantACookie },
    });

    assert(dashRes.statusCode === 200, 'Dashboard hydration endpoint responds with 200 OK');
    assert(dashRes.json?.zeroStore === false, 'zeroStore flag is false after successful store connection');
    assert(dashRes.json?.activeStore?.gmc_id === gmcIdA, 'Dashboard successfully hydrated with newly connected store');
    assert(dashRes.json?.metrics?.monitoredProducts > 0, 'Monitored products counter hydrated');
  }

  // ---------------------------------------------------------------------------
  // CHECKLIST 2: CSRF Rejection (HTTP 403 Forbidden on Invalid State)
  // ---------------------------------------------------------------------------
  console.log('\n[CHECKLIST 2] CSRF Rejection on Invalid / Missing State');
  {
    // Test 2a: Missing state parameter on callback
    const missingStateRes = await request({
      method: 'GET',
      path: '/api/auth/merchant/callback?code=mock_google_code_123',
      headers: { Cookie: tenantACookie },
    });

    assert(missingStateRes.statusCode === 403, 'Callback rejects missing state parameter with HTTP 403 Forbidden');
    assert(missingStateRes.json?.error?.includes('Forbidden'), 'Returns descriptive CSRF error payload');

    // Test 2b: Invalid or tampered state parameter with no matching cookie
    const forgedStateRes = await request({
      method: 'GET',
      path: '/api/auth/merchant/callback?code=mock_google_code_123&state=evil_tampered_csrf_token',
      headers: { Cookie: tenantACookie },
    });

    assert(forgedStateRes.statusCode === 403, 'Callback rejects tampered state parameter with HTTP 403 Forbidden');
    assert(forgedStateRes.json?.error?.includes('Forbidden'), 'Returns 403 Forbidden preventing OAuth login CSRF attacks');
  }

  // ---------------------------------------------------------------------------
  // CHECKLIST 3: Double Claim Rejection (Cross-Tenant Collision 409)
  // ---------------------------------------------------------------------------
  console.log('\n[CHECKLIST 3] Double Claim Rejection (Cross-Tenant Collision Defense)');
  {
    // Tenant B attempts to claim the exact same GMC ID owned by Tenant A
    const imposterRes = await request(
      {
        method: 'POST',
        path: '/api/auth/merchant/callback',
        headers: { Cookie: tenantBCookie },
      },
      {
        gmcId: gmcIdA, // Same GMC ID
        storeName: 'Imposter Storefront',
        storeUrl: 'https://imposter.com',
        tenantEmail: TENANT_B_EMAIL,
      }
    );

    assert(imposterRes.statusCode === 409, 'Rejects cross-tenant double claim attempt with HTTP 409 Conflict');
    assert(imposterRes.json?.collision === true, 'Returns collision: true flag');
    assert(imposterRes.json?.error?.includes('Cross-tenant collisions are strictly forbidden'), 'Returns explicit cross-tenant isolation rejection error');
  }

  // ---------------------------------------------------------------------------
  // CHECKLIST 4: Slack Activation (Verification Ping & Arm System)
  // ---------------------------------------------------------------------------
  console.log('\n[CHECKLIST 4] Slack Activation (Verification Ping & Arm System)');
  {
    // Test 4a: Reject invalid webhook URL
    const invalidWebhookRes = await request(
      {
        method: 'POST',
        path: `/api/stores/${storeAId}/verify-webhook`,
        headers: { Cookie: tenantACookie },
      },
      { webhookUrl: 'http://insecure-http-webhook.com' }
    );
    assert(invalidWebhookRes.statusCode === 400, 'Rejects non-HTTPS webhook with 400 Bad Request');

    // Test 4b: Verify valid webhook destination (using provided environment webhook)
    const targetWebhook = SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/MOCK/STORE/TEST';

    const verifyRes = await request(
      {
        method: 'POST',
        path: `/api/stores/${storeAId}/verify-webhook`,
        headers: { Cookie: tenantACookie },
      },
      { webhookUrl: targetWebhook }
    );

    assert(verifyRes.statusCode === 200, 'Verification ping succeeds with HTTP 200 OK');
    assert(verifyRes.json?.verified === true, 'Webhook marked verified: true');
    assert(typeof verifyRes.json?.latencyMs === 'number', `Round-trip delivery latency measured: ${verifyRes.json?.latencyMs}ms`);

    // Verify dashboard reflects verified webhook and channel name
    const dashRes = await request({
      method: 'GET',
      path: `/api/dashboard?store_id=${storeAId}`,
      headers: { Cookie: tenantACookie },
    });

    assert(dashRes.json?.metrics?.alertPipelineStatus?.verified === true, 'Dashboard reflects verified alert pipeline status');
    assert(dashRes.json?.metrics?.alertPipelineStatus?.channel === '#ppc-alerts', 'Dashboard displays configured Slack channel #ppc-alerts');
  }

  // ---------------------------------------------------------------------------
  // CHECKLIST 5: Dynamic Triage via Real-Time Pub/Sub Ingestion
  // ---------------------------------------------------------------------------
  console.log('\n[CHECKLIST 5] Dynamic Triage (Live Pub/Sub Ingestion)');
  const heroSku = `HERO-ANORAK-${Date.now().toString().slice(-4)}`;
  const rawIssueCode = 'item_disapproved: missing_required_attribute [gtin]';

  {
    // Ingest disapproval event via Pub/Sub
    const pubsubPayload = {
      message: {
        messageId: `msg-triage-${Date.now()}`,
        publishTime: new Date().toISOString(),
        data: Buffer.from(
          JSON.stringify({
            accountId: gmcIdA,
            eventType: 'PRODUCT_STATUS_CHANGE',
            offerId: heroSku,
            title: 'Alpine Stormproof Mountain Anorak',
            issues: [
              {
                code: rawIssueCode,
                severity: 'critical',
                attribute: 'gtin',
              },
            ],
          })
        ).toString('base64'),
      },
    };

    const ingestRes = await request(
      {
        method: 'POST',
        path: '/api/ingest/pubsub',
        headers: { 'Content-Type': 'application/json' },
      },
      pubsubPayload
    );

    assert(ingestRes.statusCode === 200, 'Pub/Sub event ingested with HTTP 200 OK');

    // Immediately query dashboard without database wipe
    const triageDashRes = await request({
      method: 'GET',
      path: `/api/dashboard?store_id=${storeAId}`,
      headers: { Cookie: tenantACookie },
    });

    assert(triageDashRes.statusCode === 200, 'Dashboard hydrated with live triage state');
    assert(triageDashRes.json?.metrics?.activeDisapprovals >= 1, `Active disapprovals incremented: ${triageDashRes.json?.metrics?.activeDisapprovals}`);
    
    // Tier 1 Threat Banner
    const critical = triageDashRes.json?.criticalIncident;
    assert(!!critical, 'Tier 1 Critical Threat Banner rendered');
    assert(critical.sku === heroSku, `Critical impacted product SKU matches: ${heroSku}`);
    assert(critical.title === 'Alpine Stormproof Mountain Anorak', 'Critical product title matches: Alpine Stormproof Mountain Anorak');
    assert(critical.issue_code === rawIssueCode, `Raw rejection reason strictly matches protocol string: ${rawIssueCode}`);
    assert(critical.severity === 'CRITICAL_DISAPPROVAL', 'Severity marked as CRITICAL_DISAPPROVAL');
  }

  // ---------------------------------------------------------------------------
  // CHECKLIST 6: Shopify Deep Link Syntax & Auto-Resolution Feedback
  // ---------------------------------------------------------------------------
  console.log('\n[CHECKLIST 6] Shopify Deep Link (?query=) & Auto-Resolution Feedback');
  {
    const triageDashRes = await request({
      method: 'GET',
      path: `/api/dashboard?store_id=${storeAId}`,
      headers: { Cookie: tenantACookie },
    });

    const critical = triageDashRes.json?.criticalIncident;
    assert(!!critical, 'Critical incident retrieved for deep-link verification');

    // Verify Shopify deep-link syntax: https://${store.domain}/admin/products?query=${encodeURIComponent(sku)}
    const expectedShopifyUrl = `https://alpine-outfitters.myshopify.com/admin/products?query=${encodeURIComponent(heroSku)}`;
    assert(critical.shopifyUrl === expectedShopifyUrl, `Shopify link uses strict native syntax: ${critical.shopifyUrl}`);
    assert(critical.shopifyUrl.includes('?query='), 'Link strictly uses ?query= parameter (not ?sku=)');

    // Test Action: Mark Pending Verification
    const verifyActionRes = await request({
      method: 'POST',
      path: `/api/incidents/${critical.id}/verify`,
      headers: { Cookie: tenantACookie },
    });

    assert(verifyActionRes.statusCode === 200, 'Mark Pending Verification returns HTTP 200 OK');
    assert(verifyActionRes.json?.incident?.status === 'pending_verification', 'Incident status updated to pending_verification');

    // Simulate Google crawler re-crawl & approval event via Pub/Sub
    const approvalPayload = {
      message: {
        messageId: `msg-approve-${Date.now()}`,
        publishTime: new Date().toISOString(),
        data: Buffer.from(
          JSON.stringify({
            accountId: gmcIdA,
            eventType: 'PRODUCT_STATUS_CHANGE',
            offerId: heroSku,
            title: 'Alpine Stormproof Mountain Anorak',
            issues: [], // Empty issues signifies re-approval!
          })
        ).toString('base64'),
      },
    };

    const approveRes = await request(
      {
        method: 'POST',
        path: '/api/ingest/pubsub',
        headers: { 'Content-Type': 'application/json' },
      },
      approvalPayload
    );

    assert(approveRes.statusCode === 200, 'Google crawler re-approval event ingested with HTTP 200');

    // Query dashboard after resolution
    const resolvedDashRes = await request({
      method: 'GET',
      path: `/api/dashboard?store_id=${storeAId}`,
      headers: { Cookie: tenantACookie },
    });

    const resolvedIncident = resolvedDashRes.json?.incidents?.find((i) => i.sku === heroSku);
    assert(!!resolvedIncident, `Resolved incident found in Incident History table`);
    assert(resolvedIncident.status === 'resolved', 'Incident state dynamically transitioned to resolved');
    assert(typeof resolvedIncident.downtimeDuration === 'string' && resolvedIncident.downtimeDuration.includes('Resolved in'), `Table dynamically computes downtime duration: "${resolvedIncident.downtimeDuration}"`);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n=============================================================================');
  console.log(`GMC OAUTH & DASHBOARD CONVERSION UX SUITE: ${passed} passed, ${failed} failed.`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runGmcOAuthAndDashboardSuite().catch((err) => {
  console.error('Fatal test execution failure:', err);
  process.exit(1);
});
