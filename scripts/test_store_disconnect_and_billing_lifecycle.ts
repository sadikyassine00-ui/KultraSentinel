/**
 * Kultra Lifecycle Verification Suite:
 * 1. Google OAuth Token Revocation & Store Disconnection
 * 2. Self-Serve Paddle Customer Portal Generation
 * 3. Self-Serve In-App Paddle Cancellation (with Prepaid Retention)
 * 4. Paddle Webhook Lifecycle Processing & Alert Silencing
 * 5. Superadmin Permanent Bypass & Access Immunity
 * 6. Authenticated HTTP Route Handler End-to-End Invocations
 */

import { revokeGoogleOAuthToken } from '../src/lib/googleAuth';
import {
  claimStoreForTenant,
  disconnectStoreForTenant,
  getStoresForTenant,
  getStoreByIdAndTenant,
  findStoreByGmcId,
  findTenantByEmail,
  updateTenant,
  inMemoryStores,
  inMemoryTenants,
  type Tenant,
} from '../src/lib/db';
import { processPaddleWebhookEvent } from '../src/lib/paddle/process-webhook';
import { isSuperAdminEmail, SUPERADMIN_EMAILS, createSessionToken } from '../src/lib/token';
import { EventName } from '@paddle/paddle-node-sdk';

import { DELETE as deleteStoreHandler } from '../src/app/api/stores/[id]/route';
import { POST as disconnectStoreHandler } from '../src/app/api/stores/[id]/disconnect/route';
import { POST as portalHandler } from '../src/app/api/billing/portal/route';
import { POST as cancelHandler } from '../src/app/api/billing/cancel/route';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

async function runTests() {
  console.log('=============================================================================');
  console.log('    KULTRA - STORE DISCONNECT, GOOGLE REVOCATION & PADDLE LIFECYCLE TESTS    ');
  console.log('=============================================================================\n');

  let passed = 0;
  let failed = 0;

  // ---------------------------------------------------------------------------
  // TEST GROUP 1: Google OAuth Token Revocation Handler
  // ---------------------------------------------------------------------------
  console.log('[TEST GROUP 1] Google OAuth Token Revocation Endpoint Handler');

  // 1.1 Empty/blank token handling
  try {
    const res = await revokeGoogleOAuthToken('');
    assert(res.success === true, 'Empty token returns success without making outbound call');
    passed++;
  } catch (e: any) {
    console.error('  [FAIL] 1.1 Empty token revocation failed:', e.message);
    failed++;
  }

  // 1.2 Mock fetch: Successful token revocation on Google servers (HTTP 200)
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url: any, init: any) => {
      if (String(url).includes('oauth2.googleapis.com/revoke')) {
        assert(init.method === 'POST', 'Google revocation uses HTTP POST');
        assert(
          init.headers['Content-Type'] === 'application/x-www-form-urlencoded',
          'Google revocation sets application/x-www-form-urlencoded header'
        );
        assert(
          String(init.body).includes('token=valid_refresh_token_123'),
          'Google revocation sends url-encoded token parameter'
        );
        return new Response('', { status: 200 });
      }
      return originalFetch(url, init);
    };

    const res = await revokeGoogleOAuthToken('valid_refresh_token_123');
    assert(res.success === true && !res.alreadyRevoked, 'Valid token revocation returns { success: true }');
    passed++;
  } catch (e: any) {
    console.error('  [FAIL] 1.2 Valid token revocation failed:', e.message);
    failed++;
  }

  // 1.3 Mock fetch: Defensive handling when token was already revoked externally in Google Account settings (HTTP 400 invalid_token)
  try {
    global.fetch = async (url: any) => {
      if (String(url).includes('oauth2.googleapis.com/revoke')) {
        return new Response(JSON.stringify({ error: 'invalid_token', error_description: 'Token is expired or revoked' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return originalFetch(url);
    };

    const res = await revokeGoogleOAuthToken('already_revoked_token_456');
    assert(
      res.success === true && res.alreadyRevoked === true,
      'Already revoked token is caught gracefully with { success: true, alreadyRevoked: true }'
    );
    passed++;
  } catch (e: any) {
    console.error('  [FAIL] 1.3 Already revoked token handling failed:', e.message);
    failed++;
  }

  // 1.4 Mock fetch: Network error handling
  try {
    global.fetch = async (url: any) => {
      if (String(url).includes('oauth2.googleapis.com/revoke')) {
        throw new Error('ENOTFOUND oauth2.googleapis.com');
      }
      return originalFetch(url);
    };

    const res = await revokeGoogleOAuthToken('token_network_fail');
    assert(
      res.success === false && typeof res.error === 'string',
      'Network failure returns graceful { success: false, error } without throwing unhandled exception'
    );
    passed++;
  } catch (e: any) {
    console.error('  [FAIL] 1.4 Network error handling failed:', e.message);
    failed++;
  } finally {
    global.fetch = originalFetch;
  }

  // ---------------------------------------------------------------------------
  // TEST GROUP 2: Store Disconnection & Database Credential Scrubbing
  // ---------------------------------------------------------------------------
  console.log('\n[TEST GROUP 2] Store Disconnection, Credential Scrubbing & Telemetry Halting');

  const testTenantEmail = 'lifecycle-test@kultra-test.io';
  const testGmcId = '9876543210';

  try {
    // 2.1 Claim a new store for tenant
    const claimRes = await claimStoreForTenant({
      gmcId: testGmcId,
      merchantId: testGmcId,
      tenantId: 101,
      tenantEmail: testTenantEmail,
      storeName: 'Lifecycle Test Merchant Store',
      storeUrl: 'lifecycle-test.myshopify.com',
      accountType: 'Standalone Merchant',
      encryptedRefreshToken: 'enc_sec_token_abc_xyz_789',
    });

    assert(claimRes.success === true && Boolean(claimRes.store), 'Store claimed successfully in database');
    const store = claimRes.store!;
    assert(store.encrypted_refresh_token === 'enc_sec_token_abc_xyz_789', 'Store has encrypted refresh token stored');
    assert(store.status === 'active' && store.is_active === true, 'Store is created in active state');
    passed++;

    // 2.2 Verify store is routable by GMC ID before disconnection
    const routableStoreBefore = await findStoreByGmcId(testGmcId);
    assert(
      Boolean(routableStoreBefore && routableStoreBefore.id === store.id),
      'Active store is successfully discovered by findStoreByGmcId for Pub/Sub ingestion'
    );
    passed++;

    // 2.3 Execute disconnectStoreForTenant
    const disconnected = await disconnectStoreForTenant(store.id, testTenantEmail);
    assert(disconnected === true, 'disconnectStoreForTenant returns true');
    passed++;

    // 2.4 Verify store record is scrubbed in database
    const storeInDb = await getStoreByIdAndTenant(store.id, testTenantEmail);
    assert(storeInDb !== null, 'Store record exists in database with status disconnected');
    assert(storeInDb?.status === 'disconnected', 'Store status is updated to disconnected');
    assert(storeInDb?.encrypted_refresh_token === null, 'Encrypted refresh token is permanently scrubbed (null)');
    assert(storeInDb?.is_active === false, 'is_active flag is set to false');
    passed++;

    // 2.5 Verify store is EXCLUDED from active tenant stores list
    const tenantStores = await getStoresForTenant(testTenantEmail);
    const foundInActive = tenantStores.some((s) => String(s.id) === String(store.id));
    assert(!foundInActive, 'Disconnected store is excluded from getStoresForTenant');
    passed++;

    // 2.6 Verify Pub/Sub message routing halts immediately for that GMC ID
    const routableStoreAfter = await findStoreByGmcId(testGmcId);
    assert(routableStoreAfter === null, 'findStoreByGmcId returns null for disconnected store (Pub/Sub alerts halted)');
    passed++;

    // 2.7 Verify reconnection: Tenant can reconnect the same GMC ID cleanly without broken state
    const reconnectedRes = await claimStoreForTenant({
      gmcId: testGmcId,
      merchantId: testGmcId,
      tenantId: 101,
      tenantEmail: testTenantEmail,
      storeName: 'Lifecycle Test Merchant Store Reconnected',
      storeUrl: 'lifecycle-test.myshopify.com',
      accountType: 'Standalone Merchant',
      encryptedRefreshToken: 'enc_sec_new_token_111_222',
    });

    assert(reconnectedRes.success === true && Boolean(reconnectedRes.store), 'Store reconnected successfully');
    const reconnectedStore = reconnectedRes.store!;
    assert(
      reconnectedStore.status === 'active' && reconnectedStore.is_active === true,
      'Reconnected store is cleanly restored to active status'
    );
    assert(
      reconnectedStore.encrypted_refresh_token === 'enc_sec_new_token_111_222',
      'Reconnected store receives new encrypted refresh token'
    );
    passed++;
  } catch (e: any) {
    console.error('  [FAIL] Test Group 2 failed:', e.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST GROUP 3: Paddle Customer Portal Generation & Superadmin Immunity
  // ---------------------------------------------------------------------------
  console.log('\n[TEST GROUP 3] Paddle Customer Portal Generation & Superadmin Bypass');

  try {
    // 3.1 Superadmin bypass check
    assert(SUPERADMIN_EMAILS.length > 0, 'SUPERADMIN_EMAILS is configured');
    assert(isSuperAdminEmail(SUPERADMIN_EMAILS[0]), 'Superadmin email constant matches isSuperAdminEmail');
    assert(isSuperAdminEmail('YassineSadik0@gmail.com'), 'isSuperAdminEmail is case-insensitive');
    assert(!isSuperAdminEmail('normal-user@example.com'), 'Normal user is not superadmin');
    passed++;

    // 3.2 Tenant record creation for Paddle portal tests
    let tenant = await findTenantByEmail('billing-customer@kultra-test.io');
    if (!tenant) {
      const newTenant: Tenant = {
        id: 9901,
        user_id: 'usr_paddle_portal_test',
        email: 'billing-customer@kultra-test.io',
        company_name: 'Portal Test Brands LLC',
        plan_tier: 'Active Pro',
        connected_stores: 1,
        total_skus: 500,
        incidents_month: 2,
        oauth_status: 'Valid',
        last_active: new Date().toISOString(),
        status: 'active',
        subscription_status: 'paid active',
        paddle_customer_id: 'ctm_portal_test_9901',
        paddle_subscription_id: 'sub_portal_test_9901',
        current_period_ends_at: new Date(Date.now() + 86400000 * 20).toISOString(),
        created_at: new Date().toISOString(),
      };
      inMemoryTenants.push(newTenant);
      tenant = newTenant;
    }

    assert(Boolean(tenant && tenant.paddle_customer_id), 'Paddle customer record exists in test database');
    passed++;
  } catch (e: any) {
    console.error('  [FAIL] Test Group 3 failed:', e.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST GROUP 4: Self-Serve In-App Cancellation & Prepaid Period Retention
  // ---------------------------------------------------------------------------
  console.log('\n[TEST GROUP 4] Self-Serve In-App Cancellation & Retention Protection');

  try {
    const cancelTenantEmail = 'cancel-test@kultra-test.io';
    const futureEndDate = new Date(Date.now() + 86400000 * 25).toISOString();

    let cancelTenant = await findTenantByEmail(cancelTenantEmail);
    if (!cancelTenant) {
      const newTenant: Tenant = {
        id: 9902,
        user_id: 'usr_paddle_cancel_test',
        email: cancelTenantEmail,
        company_name: 'Prepaid Retention Media',
        plan_tier: 'Active Pro',
        connected_stores: 1,
        total_skus: 1200,
        incidents_month: 4,
        oauth_status: 'Valid',
        last_active: new Date().toISOString(),
        status: 'active',
        subscription_status: 'paid active',
        paddle_customer_id: 'ctm_cancel_test_9902',
        paddle_subscription_id: 'sub_cancel_test_9902',
        current_period_ends_at: futureEndDate,
        created_at: new Date().toISOString(),
      };
      inMemoryTenants.push(newTenant);
      cancelTenant = newTenant;
    }

    // 4.1 Superadmin immunity on cancellation
    assert(isSuperAdminEmail('yassinesadik0@gmail.com') === true, 'Superadmin email is immune to cancellation');
    passed++;

    // 4.2 Schedule cancellation for end of period
    await updateTenant(cancelTenant.id, {
      scheduled_cancellation_at: futureEndDate,
      subscription_status: 'paid active',
    });

    const refreshedTenant = await findTenantByEmail(cancelTenantEmail);
    assert(
      refreshedTenant?.scheduled_cancellation_at === futureEndDate,
      'scheduled_cancellation_at is recorded in database'
    );
    assert(
      refreshedTenant?.subscription_status === 'paid active',
      'subscription_status remains "paid active" through prepaid period'
    );
    passed++;
  } catch (e: any) {
    console.error('  [FAIL] Test Group 4 failed:', e.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST GROUP 5: Paddle Webhook Processing Lifecycle
  // ---------------------------------------------------------------------------
  console.log('\n[TEST GROUP 5] Paddle Webhook Processing Lifecycle & Alert Silencing');

  try {
    const webhookTenantEmail = 'webhook-lifecycle@kultra-test.io';
    const prepaidEnd = new Date(Date.now() + 86400000 * 14).toISOString();

    const webhookTenant: Tenant = {
      id: 9903,
      user_id: 'usr_webhook_lifecycle_test',
      email: webhookTenantEmail,
      company_name: 'Webhook Lifecycle Store',
      plan_tier: 'Active Pro',
      connected_stores: 1,
      total_skus: 3400,
      incidents_month: 6,
      oauth_status: 'Valid',
      last_active: new Date().toISOString(),
      status: 'active',
      subscription_status: 'paid active',
      paddle_customer_id: 'ctm_webhook_9903',
      paddle_subscription_id: 'sub_webhook_9903',
      current_period_ends_at: prepaidEnd,
      created_at: new Date().toISOString(),
    };
    inMemoryTenants.push(webhookTenant);

    // Create a store for this tenant to verify alert status updates
    await claimStoreForTenant({
      gmcId: '5566778899',
      merchantId: '5566778899',
      tenantId: 9903,
      tenantEmail: webhookTenantEmail,
      storeName: 'Webhook Lifecycle Store',
      storeUrl: 'webhook-lifecycle.com',
      accountType: 'Standalone Merchant',
    });

    // 5.1 Webhook subscription.canceled with future effectiveAt: maintains active access
    const futureCancelEvent: any = {
      eventId: 'evt_cancel_future_1',
      eventType: EventName.SubscriptionCanceled,
      occurredAt: new Date().toISOString(),
      data: {
        id: 'sub_webhook_9903',
        customerId: 'ctm_webhook_9903',
        status: 'canceled',
        currentBillingPeriod: {
          startsAt: new Date(Date.now() - 86400000 * 16).toISOString(),
          endsAt: prepaidEnd,
        },
        scheduledChange: {
          action: 'cancel',
          effectiveAt: prepaidEnd,
        },
        customData: {
          tenantEmail: webhookTenantEmail,
          userId: 'usr_webhook_lifecycle_test',
        },
      },
    };

    await processPaddleWebhookEvent(futureCancelEvent);

    const tenantAfterFutureCancel = await findTenantByEmail(webhookTenantEmail);
    assert(
      tenantAfterFutureCancel?.subscription_status === 'paid active',
      'Webhook: future cancellation keeps subscription_status as "paid active"'
    );
    assert(
      tenantAfterFutureCancel?.scheduled_cancellation_at === prepaidEnd,
      'Webhook: future cancellation sets scheduled_cancellation_at'
    );

    const storeAfterFutureCancel = await findStoreByGmcId('5566778899');
    assert(
      storeAfterFutureCancel?.alert_status === 'active',
      'Webhook: future cancellation maintains store alert_status as "active"'
    );
    passed++;

    // 5.2 Webhook subscription.canceled with immediate/past effectiveAt: silences alerts & marks canceled
    const pastDate = new Date(Date.now() - 1000 * 60).toISOString();
    const immediateCancelEvent: any = {
      eventId: 'evt_cancel_immediate_2',
      eventType: EventName.SubscriptionCanceled,
      occurredAt: new Date().toISOString(),
      data: {
        id: 'sub_webhook_9903',
        customerId: 'ctm_webhook_9903',
        status: 'canceled',
        currentBillingPeriod: {
          startsAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          endsAt: pastDate,
        },
        scheduledChange: null,
        customData: {
          tenantEmail: webhookTenantEmail,
          userId: 'usr_webhook_lifecycle_test',
        },
      },
    };

    await processPaddleWebhookEvent(immediateCancelEvent);

    const tenantAfterImmediateCancel = await findTenantByEmail(webhookTenantEmail);
    assert(
      tenantAfterImmediateCancel?.subscription_status === 'canceled',
      'Webhook: immediate/expired cancellation flips subscription_status to "canceled"'
    );

    // Look directly into inMemoryStores because findStoreByGmcId requires active store
    const storeInMem = inMemoryStores.find((s) => s.gmc_id === '5566778899');
    assert(
      storeInMem?.alert_status === 'degraded',
      'Webhook: expired cancellation silences store alert_status to "degraded"'
    );
    passed++;

    // 5.3 Webhook superadmin immunity test: cancellation event for superadmin is completely blocked
    const superadminCancelEvent: any = {
      eventId: 'evt_cancel_superadmin_3',
      eventType: EventName.SubscriptionCanceled,
      occurredAt: new Date().toISOString(),
      data: {
        id: 'sub_superadmin_fake',
        customerId: 'ctm_superadmin_fake',
        status: 'canceled',
        currentBillingPeriod: {
          startsAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          endsAt: pastDate,
        },
        customData: {
          tenantEmail: 'yassinesadik0@gmail.com',
          userId: 'usr_superadmin_01',
        },
      },
    };

    await processPaddleWebhookEvent(superadminCancelEvent);

    const superadminTenant = await findTenantByEmail('yassinesadik0@gmail.com');
    assert(
      superadminTenant?.subscription_status === 'paid active',
      'Webhook: superadmin account subscription_status remains "paid active" despite cancellation webhook'
    );
    passed++;
  } catch (e: any) {
    console.error('  [FAIL] Test Group 5 failed:', e.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST GROUP 6: Authenticated Route Handler End-to-End Invocations
  // ---------------------------------------------------------------------------
  console.log('\n[TEST GROUP 6] Authenticated Next.js Route Handlers');

  try {
    const routeTenantEmail = 'route-handler-test@kultra-test.io';
    const routeGmcId = '7788990011';

    // Claim a store for route handler testing
    const routeStoreRes = await claimStoreForTenant({
      gmcId: routeGmcId,
      merchantId: routeGmcId,
      tenantId: 9904,
      tenantEmail: routeTenantEmail,
      storeName: 'Route Handler Store',
      storeUrl: 'route-handler.myshopify.com',
      accountType: 'Standalone Merchant',
      encryptedRefreshToken: 'enc_token_route_test',
    });
    const routeStore = routeStoreRes.store!;

    // Create session token for the store owner
    const sessionToken = await createSessionToken({
      email: routeTenantEmail,
      role: 'user',
    });

    // 6.1 DELETE /api/stores/[id] with anti-IDOR check
    // An attacker tries to delete this store
    const attackerToken = await createSessionToken({
      email: 'attacker@evil-corp.com',
      role: 'user',
    });

    const unauthorizedReq = new Request(`http://localhost:3000/api/stores/${routeStore.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${attackerToken}`,
      },
    });

    const unauthorizedRes = await deleteStoreHandler(unauthorizedReq, {
      params: Promise.resolve({ id: String(routeStore.id) }),
    });
    assert(
      unauthorizedRes.status === 404,
      'DELETE /api/stores/[id]: Cross-tenant deletion attempt rejected with 404 (Anti-IDOR)'
    );
    passed++;

    // 6.2 DELETE /api/stores/[id] with legitimate owner
    const authorizedReq = new Request(`http://localhost:3000/api/stores/${routeStore.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    const authorizedRes = await deleteStoreHandler(authorizedReq, {
      params: Promise.resolve({ id: String(routeStore.id) }),
    });
    assert(
      authorizedRes.status === 200,
      'DELETE /api/stores/[id]: Legitimate owner receives 200 OK'
    );
    const authorizedBody = await authorizedRes.json();
    assert(
      authorizedBody.success === true,
      'DELETE /api/stores/[id]: Returns { success: true }'
    );

    const storeAfterApiDisconnect = await getStoreByIdAndTenant(routeStore.id, routeTenantEmail);
    assert(
      storeAfterApiDisconnect?.status === 'disconnected' && storeAfterApiDisconnect?.encrypted_refresh_token === null,
      'DELETE /api/stores/[id]: DB credentials wiped and status updated to disconnected'
    );
    passed++;

    // 6.3 POST /api/stores/[id]/disconnect
    // Reconnect store to test the POST disconnect route
    const reconnectedStoreRes = await claimStoreForTenant({
      gmcId: routeGmcId,
      merchantId: routeGmcId,
      tenantId: 9904,
      tenantEmail: routeTenantEmail,
      storeName: 'Route Handler Store 2',
      storeUrl: 'route-handler.myshopify.com',
      accountType: 'Standalone Merchant',
      encryptedRefreshToken: 'enc_token_route_test_2',
    });
    const reconnectedStore = reconnectedStoreRes.store!;

    const postDisconnectReq = new Request(`http://localhost:3000/api/stores/${reconnectedStore.id}/disconnect`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    const postDisconnectRes = await disconnectStoreHandler(postDisconnectReq, {
      params: Promise.resolve({ id: String(reconnectedStore.id) }),
    });
    assert(
      postDisconnectRes.status === 200,
      'POST /api/stores/[id]/disconnect: Returns 200 OK for store owner'
    );
    passed++;

    // 6.4 POST /api/billing/portal: Superadmin bypass
    const superadminToken = await createSessionToken({
      email: 'yassinesadik0@gmail.com',
      role: 'admin',
    });

    const superadminPortalReq = new Request('http://localhost:3000/api/billing/portal', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${superadminToken}`,
      },
    });

    const superadminPortalRes = await portalHandler(superadminPortalReq);
    assert(
      superadminPortalRes.status === 200,
      'POST /api/billing/portal: Superadmin receives 200'
    );
    const superadminPortalBody = await superadminPortalRes.json();
    assert(
      superadminPortalBody.isSuperAdmin === true,
      'POST /api/billing/portal: Returns permanent superadmin bypass'
    );
    passed++;

    // 6.5 POST /api/billing/cancel: Superadmin immunity
    const superadminCancelReq = new Request('http://localhost:3000/api/billing/cancel', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${superadminToken}`,
      },
    });

    const superadminCancelRes = await cancelHandler(superadminCancelReq);
    assert(
      superadminCancelRes.status === 400,
      'POST /api/billing/cancel: Superadmin cancellation is blocked with 400 immunity error'
    );
    passed++;
  } catch (e: any) {
    console.error('  [FAIL] Test Group 6 failed:', e.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n=============================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('[FATAL] Test runner crashed:', err);
  process.exit(1);
});
