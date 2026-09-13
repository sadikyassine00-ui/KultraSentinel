/**
 * TDD Verification Suite for Kultra Internal Super-Admin Specification
 * Run with: node scripts/test_super_admin.js
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
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

async function runSuperAdminSuite() {
  console.log('=============================================================================');
  console.log('   KULTRA INTERNAL SUPER-ADMIN SPECIFICATION - TDD TEST SUITE                ');
  console.log('=============================================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Auth Guarding on Super Admin Endpoints
  console.log('[TEST GROUP 1] Sole Admin Authorization Boundary');
  try {
    const endpoints = [
      '/api/admin/super/telemetry',
      '/api/admin/super/tenants',
      '/api/admin/super/stores',
      '/api/admin/super/dlq',
      '/api/admin/super/dispatches',
      '/api/admin/super/config',
    ];

    for (const ep of endpoints) {
      const res = await makeRequest(ep);
      assert(res.status === 401, `Unauthenticated ${ep} is rejected with 401 Unauthorized`);
      passed++;
    }
  } catch (err) {
    console.error('Test Group 1 Error:', err.message);
    failed++;
  }

  // 2. Authenticate as Sole Admin
  console.log('\n[TEST GROUP 2] Admin Session Authentication');
  let adminCookie = '';
  try {
    const loginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'yassinesadik0@gmail.com', password: 'KultraSentinel2026!' },
    });
    assert(loginRes.status === 200, 'Authenticated sole platform owner yassinesadik0@gmail.com');
    adminCookie = loginRes.setCookie.split(';')[0];
    passed++;
  } catch (err) {
    console.error('Test Group 2 Error:', err.message);
    failed++;
  }

  // 3. Section 1: Top-Level Platform Telemetry
  console.log('\n[TEST GROUP 3] Section 1: Top-Level Platform Telemetry (Global KPIs)');
  try {
    const telemRes = await makeRequest('/api/admin/super/telemetry', {
      headers: { Cookie: adminCookie },
    });
    assert(telemRes.status === 200, 'GET /api/admin/super/telemetry returns 200 OK');
    const t = telemRes.data.telemetry;
    assert(typeof t.mrr === 'number' && t.mrr >= 0, `MRR metric verified: $${t.mrr}`);
    assert(typeof t.activeSubscriptions === 'number', `Active Subscriptions: ${t.activeSubscriptions}`);
    assert(typeof t.activeTrials === 'number', `Active Trials: ${t.activeTrials}`);
    assert(typeof t.totalMonitoredStores === 'number' && t.totalMonitoredStores > 0, `Total Monitored Stores: ${t.totalMonitoredStores}`);
    assert(typeof t.totalSkusTracked === 'number' && t.totalSkusTracked > 0, `Total SKUs Tracked: ${t.totalSkusTracked}`);
    assert(typeof t.globalIngestionRate === 'number', `Global Ingestion Rate: ${t.globalIngestionRate} msg/min`);
    assert(typeof t.averageLatencyMs === 'number', `Average Latency: ${t.averageLatencyMs} ms`);
    assert(typeof t.dlqCount === 'number', `DLQ Count: ${t.dlqCount}`);
    assert(typeof t.webhookFailureRate === 'number', `Webhook Failure Rate: ${t.webhookFailureRate * 100}%`);
    passed += 10;
  } catch (err) {
    console.error('Test Group 3 Error:', err.message);
    failed++;
  }

  // 4. Tab 1: Tenant Management
  console.log('\n[TEST GROUP 4] Tab 1: Tenant Management (Users & Agencies)');
  try {
    // 4.1 Fetch Tenants
    const tenantsRes = await makeRequest('/api/admin/super/tenants', {
      headers: { Cookie: adminCookie },
    });
    assert(tenantsRes.status === 200, 'GET /api/admin/super/tenants returns 200 OK');
    assert(Array.isArray(tenantsRes.data.tenants) && tenantsRes.data.tenants.length >= 3, 'Returns list of tenants');
    const firstTenant = tenantsRes.data.tenants[0];
    assert(Boolean(firstTenant.user_id && firstTenant.email && firstTenant.company_name), 'Tenant identity attributes intact');
    assert(Boolean(firstTenant.plan_tier && firstTenant.oauth_status), 'Subscription and OAuth status intact');
    passed += 4;

    // 4.2 Impersonate User
    const impRes = await makeRequest('/api/admin/super/tenants', {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: { id: firstTenant.id, action: 'impersonate' },
    });
    assert(impRes.status === 200, 'PATCH action=impersonate generates scoped session');
    assert(impRes.data.impersonating.email === firstTenant.email, 'Returns impersonated tenant target email');
    passed += 2;

    // 4.3 Extend Trial / Grant Pilot
    const pilotRes = await makeRequest('/api/admin/super/tenants', {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: { id: firstTenant.id, action: 'extendTrial' },
    });
    assert(pilotRes.status === 200, 'PATCH action=extendTrial upgrades plan to Agency Pilot');
    assert(pilotRes.data.tenant.plan_tier === 'Agency Pilot', 'Tenant plan confirmed Agency Pilot');
    passed += 2;

    // 4.4 Force Re-Auth Request
    const reauthRes = await makeRequest('/api/admin/super/tenants', {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: { id: firstTenant.id, action: 'forceReauth' },
    });
    assert(reauthRes.status === 200, 'PATCH action=forceReauth dispatches reauth alert');
    passed++;

    // 4.5 Suspend and Unsuspend Tenant
    const suspRes = await makeRequest('/api/admin/super/tenants', {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: { id: firstTenant.id, action: 'suspend' },
    });
    assert(suspRes.status === 200 && suspRes.data.tenant.status === 'suspended', 'PATCH action=suspend halts processing');
    const unsuspRes = await makeRequest('/api/admin/super/tenants', {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: { id: firstTenant.id, action: 'unsuspend' },
    });
    assert(unsuspRes.status === 200 && unsuspRes.data.tenant.status === 'active', 'PATCH action=unsuspend restores active state');
    passed += 2;
  } catch (err) {
    console.error('Test Group 4 Error:', err.message);
    failed++;
  }

  // 5. Tab 2: Global Store Registry
  console.log('\n[TEST GROUP 5] Tab 2: Global Store Registry (Cross-Tenant Inventory)');
  try {
    const storesRes = await makeRequest('/api/admin/super/stores', {
      headers: { Cookie: adminCookie },
    });
    assert(storesRes.status === 200, 'GET /api/admin/super/stores returns 200 OK');
    assert(Array.isArray(storesRes.data.stores) && storesRes.data.stores.length > 0, 'Returns cross-tenant store registry');
    const store = storesRes.data.stores[0];
    assert(Boolean(store.gmc_id && store.tenant_email && store.store_url), 'Store attributes GMC ID, parent tenant, domain verified');
    passed += 3;

    // 5.2 Trigger Full Sync / Rescan
    const syncRes = await makeRequest('/api/admin/super/stores', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: { action: 'sync', storeId: store.id },
    });
    assert(syncRes.status === 200 && syncRes.data.success === true, 'POST action=sync forces Merchant API v1 reconcile');
    passed++;

    // 5.3 Orphan Cleanup
    const orphanRes = await makeRequest('/api/admin/super/stores', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: { action: 'cleanupOrphans' },
    });
    assert(orphanRes.status === 200, 'POST action=cleanupOrphans purges unlinked merchant feeds');
    passed++;
  } catch (err) {
    console.error('Test Group 5 Error:', err.message);
    failed++;
  }

  // 6. Tab 3: Pub/Sub Ingestion Pipeline & Dead Letter Queue (DLQ)
  console.log('\n[TEST GROUP 6] Tab 3: Pub/Sub Ingestion Pipeline & DLQ Triage');
  try {
    const dlqRes = await makeRequest('/api/admin/super/dlq', {
      headers: { Cookie: adminCookie },
    });
    assert(dlqRes.status === 200, 'GET /api/admin/super/dlq returns 200 OK');
    assert(Array.isArray(dlqRes.data.messages), 'Returns DLQ message list');
    if (dlqRes.data.messages.length > 0) {
      const msg = dlqRes.data.messages[0];
      assert(Boolean(msg.message_id && msg.failure_reason && msg.payload), 'DLQ message contains GCP message_id, failure string, raw payload');

      // Replay Message
      const replayRes = await makeRequest('/api/admin/super/dlq', {
        method: 'POST',
        headers: { Cookie: adminCookie },
        body: { action: 'replay', messageId: msg.id },
      });
      assert(replayRes.status === 200 && replayRes.data.success === true, 'POST action=replay re-injects payload into worker queue');
      passed += 2;
    }
    passed += 2;
  } catch (err) {
    console.error('Test Group 6 Error:', err.message);
    failed++;
  }

  // 7. Tab 4: Outbound Dispatch Logs
  console.log('\n[TEST GROUP 7] Tab 4: Outbound Dispatch Logs (Slack & Notification Engine)');
  try {
    const dispatchesRes = await makeRequest('/api/admin/super/dispatches', {
      headers: { Cookie: adminCookie },
    });
    assert(dispatchesRes.status === 200, 'GET /api/admin/super/dispatches returns 200 OK');
    assert(Array.isArray(dispatchesRes.data.dispatches) && dispatchesRes.data.dispatches.length > 0, 'Returns Slack notification dispatch logs');
    const firstDispatch = dispatchesRes.data.dispatches[0];
    assert(Boolean(firstDispatch.dispatch_id && firstDispatch.destination && firstDispatch.payload), 'Verified dispatch log attributes and Block Kit JSON');
    passed += 3;

    // Retry Failed Delivery
    const retryRes = await makeRequest('/api/admin/super/dispatches', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: { action: 'retry', dispatchId: firstDispatch.id },
    });
    assert(retryRes.status === 200 && retryRes.data.success === true, 'POST action=retry re-dispatches Slack notification');
    passed++;

    // Disable Poisoned Webhook
    const disableRes = await makeRequest('/api/admin/super/dispatches', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: { action: 'disableWebhook', destination: 'https://hooks.slack.com/services/T999/B000/deadtoken' },
    });
    assert(disableRes.status === 200 && disableRes.data.success === true, 'POST action=disableWebhook disables invalid webhook');
    passed++;
  } catch (err) {
    console.error('Test Group 7 Error:', err.message);
    failed++;
  }

  // 8. Tab 5: System Configuration & Feature Flags
  console.log('\n[TEST GROUP 8] Tab 5: System Configuration & Feature Flags');
  try {
    const configRes = await makeRequest('/api/admin/super/config', {
      headers: { Cookie: adminCookie },
    });
    assert(configRes.status === 200, 'GET /api/admin/super/config returns 200 OK');
    assert(typeof configRes.data.config.maintenance_mode === 'boolean', 'Maintenance mode boolean verified');
    assert(typeof configRes.data.config.rate_limit_per_min === 'number', 'Rate limit param verified');
    passed += 3;

    // Update Config
    const updateRes = await makeRequest('/api/admin/super/config', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: {
        maintenance_mode: false,
        registration_gate: 'invite_only',
        rate_limit_per_min: 1200,
        banner_text: 'Routine Google Merchant API maintenance scheduled for Sunday 02:00 UTC.',
      },
    });
    assert(updateRes.status === 200 && updateRes.data.success === true, 'POST /api/admin/super/config saves feature flags');
    assert(updateRes.data.config.registration_gate === 'invite_only', 'Updated registration gate to invite_only');
    assert(updateRes.data.config.rate_limit_per_min === 1200, 'Updated rate limit to 1200');
    passed += 3;
  } catch (err) {
    console.error('Test Group 8 Error:', err.message);
    failed++;
  }

  console.log('\n=============================================================================');
  console.log(`SUPER-ADMIN TDD SUITE RESULT: ${passed} assertions passed, ${failed} failed.`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuperAdminSuite().catch((err) => {
  console.error('Fatal Super-Admin Test Error:', err);
  process.exit(1);
});
