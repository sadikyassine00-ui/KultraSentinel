import { isSuperAdminEmail, isAllowedAdminEmail, createSessionToken, verifySessionToken } from '../src/lib/token.ts';
import { evaluateSubscription, activateTrialOnFirstStoreConnect } from '../src/lib/subscription.ts';
import { createTenant, findTenantByEmail, claimStoreForTenant } from '../src/lib/db.ts';

async function runTests() {
  console.log('=== TEST SUITE: Trial Logic & Superadmin Privileges ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Superadmin Privilege Recognition
  console.log('\n--- 1. Superadmin Privilege Recognition ---');
  const superEmail = 'yassinesadik0@gmail.com';
  assert(isSuperAdminEmail(superEmail), 'yassinesadik0@gmail.com is recognized as superadmin');
  assert(isSuperAdminEmail('YASSINESADIK0@GMAIL.COM'), 'Case-insensitive superadmin check passes');
  assert(!isSuperAdminEmail('random@gmail.com'), 'Regular user is not superadmin');
  assert(isAllowedAdminEmail(superEmail), 'Superadmin is included in allowed admin perimeter');

  // 2. Superadmin JWT Session Token
  console.log('\n--- 2. Superadmin Session Token ---');
  const token = await createSessionToken({ email: superEmail, role: 'user' });
  const verified = await verifySessionToken(token);
  assert(verified !== null, 'Token verifies successfully');
  assert(verified?.role === 'admin', 'Superadmin role automatically upgraded to admin');
  assert(verified?.isSuperAdmin === true, 'Token payload includes isSuperAdmin: true');

  // 3. Superadmin Permanent Bypass in Subscription Evaluation
  console.log('\n--- 3. Superadmin Subscription Evaluation ---');
  const superEval = evaluateSubscription({
    email: superEmail,
    plan_tier: 'Trial',
    subscription_status: 'expired',
    trial_ends_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  });
  assert(superEval.isLocked === false, 'Superadmin is NEVER locked, even if status was marked expired');
  assert(superEval.isSuperAdmin === true, 'isSuperAdmin is true in evaluation');
  assert(superEval.effectiveStatus === 'paid active', 'Effective status is paid active');
  assert(superEval.daysRemaining > 900, 'Days remaining indicates permanent status');
  assert(superEval.formattedTrialEnd === 'Permanent Superadmin Access', 'Trial end formatted for permanent access');

  // 4. Shift Trial Start to Merchant Center Connection
  console.log('\n--- 4. Unstarted Trial on Registration ---');
  const testEmail = `newuser_${Date.now()}@teststore.com`;
  const newTenant = await createTenant({
    email: testEmail,
    companyName: 'Test Brand Store',
    accountType: 'merchant',
  });

  assert(newTenant.trial_ends_at === null, 'Newly created tenant has trial_ends_at: null');
  const unstartedEval = evaluateSubscription(newTenant);
  assert(unstartedEval.hasTrialStarted === false, 'hasTrialStarted is false before GMC connection');
  assert(unstartedEval.isLocked === false, 'Unstarted trial is not locked');
  assert(unstartedEval.formattedTrialEnd === 'Pending GMC Connection', 'Status shows Pending GMC Connection');
  assert(unstartedEval.daysRemaining === 14, 'Countdown displays 14 days ready to activate');

  // 5. Connecting Merchant Center Activates 14-Day Trial
  console.log('\n--- 5. Connecting Merchant Center Activates 14-Day Trial ---');
  const gmcId = `gmc_test_${Date.now()}`;
  const claimRes = await claimStoreForTenant({
    gmcId,
    tenantId: newTenant.id,
    tenantEmail: testEmail,
    storeName: 'Test Connected Store',
    storeUrl: 'https://teststore.com',
  });
  assert(claimRes.success === true, 'Store claimed successfully');

  const tenantAfterConnect = await findTenantByEmail(testEmail);
  assert(tenantAfterConnect?.trial_ends_at !== null, 'trial_ends_at is now populated');
  
  const connectedEval = evaluateSubscription(tenantAfterConnect);
  assert(connectedEval.hasTrialStarted === true, 'hasTrialStarted is true after GMC connection');
  assert(connectedEval.isLocked === false, 'Active trial is not locked');
  assert(connectedEval.daysRemaining === 14, 'Days remaining is exactly 14');
  assert(connectedEval.effectiveStatus === 'active trial', 'Effective status is active trial');

  // 6. Reconnecting Store Must NOT Reset Timer
  console.log('\n--- 6. Reconnecting Store Must NOT Reset Timer ---');
  // Artificially simulate 5 days elapsed
  const fiveDaysLeftDate = new Date(Date.now() + 5 * 86400000).toISOString();
  tenantAfterConnect.trial_ends_at = fiveDaysLeftDate;

  // Reconnect the store
  await claimStoreForTenant({
    gmcId,
    tenantId: newTenant.id,
    tenantEmail: testEmail,
    storeName: 'Test Reconnected Store',
    storeUrl: 'https://teststore.com',
  });

  const tenantAfterReconnect = await findTenantByEmail(testEmail);
  assert(
    tenantAfterReconnect?.trial_ends_at === fiveDaysLeftDate,
    'Reconnecting store DID NOT reset the 14-day timer'
  );
  const reconnectedEval = evaluateSubscription(tenantAfterReconnect);
  assert(reconnectedEval.daysRemaining === 5, 'Days remaining is still 5 days, not reset to 14');

  // 7. Expired Trial Lockout for Normal Users
  console.log('\n--- 7. Expired Trial Lockout for Normal Users ---');
  const expiredTenant = {
    email: 'expired_user@test.com',
    trial_ends_at: new Date(Date.now() - 86400000).toISOString(),
    subscription_status: 'active trial',
  };
  const expiredEval = evaluateSubscription(expiredTenant);
  assert(expiredEval.isLocked === true, 'Normal user with expired trial is locked');
  assert(expiredEval.effectiveStatus === 'expired', 'Effective status transitioned to expired');

  console.log(`\n========================================`);
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
