const assert = require('assert');

// Mock token logic
function isSuperAdminEmail(email) {
  if (!email) return false;
  return email.toLowerCase().trim() === 'yassinesadik0@gmail.com';
}

function normalizeSubscriptionStatus(status) {
  if (!status) return 'active trial';
  const s = status.toLowerCase().trim();
  if (
    s === 'paid active' ||
    s === 'active' ||
    s === 'active pro' ||
    s === 'agency pilot' ||
    s === 'paid' ||
    s === 'pro'
  ) {
    return 'paid active';
  }
  if (s === 'expired' || s === 'delinquent' || s === 'suspended') {
    return 'expired';
  }
  if (s === 'canceled' || s === 'cancelled') {
    return 'canceled';
  }
  return 'active trial';
}

function evaluateSubscription(tenant, extra) {
  const upgradeUrl = process.env.NEXT_PUBLIC_UPGRADE_URL || '/dashboard/settings?tab=billing';

  // 1. Permanent Superadmin Bypass
  const email = tenant?.email?.toLowerCase().trim();
  if (isSuperAdminEmail(email)) {
    const storeCount = extra?.storeCount ?? (tenant?.connected_stores || 1);
    const slackCount = extra?.slackCount ?? 1;
    return {
      effectiveStatus: 'paid active',
      rawStatus: 'superadmin',
      trialEndsAt: '',
      formattedTrialEnd: 'Permanent Superadmin Access',
      daysRemaining: 9999,
      isLocked: false,
      hasTrialStarted: true,
      isSuperAdmin: true,
      upgradeUrl: '',
      planTier: 'Superadmin',
      planName: 'Lifetime Admin',
      monthlyPrice: 0,
      formattedPrice: 'Complimentary (Platform Owner)',
      renewalOrExpirationDate: '',
      formattedRenewalOrExpiration: 'Never Expires (Lifetime Admin)',
      isUrgent: false,
      quotas: {
        gmcAccountsConnected: storeCount,
        gmcAccountsLimit: 'unlimited',
        slackDestinationsActive: slackCount,
        pubsubMonitoringStatus: 'Active',
      },
    };
  }

  // Fallback if tenant is completely missing
  if (!tenant) {
    return {
      effectiveStatus: 'active trial',
      rawStatus: 'active trial',
      trialEndsAt: '',
      formattedTrialEnd: 'Pending GMC Connection',
      daysRemaining: 14,
      isLocked: false,
      hasTrialStarted: false,
      isSuperAdmin: false,
      upgradeUrl,
      planTier: 'Solo',
      planName: 'Free Trial',
      monthlyPrice: 19,
      formattedPrice: '$19/mo',
      renewalOrExpirationDate: '',
      formattedRenewalOrExpiration: 'Pending GMC Connection',
      isUrgent: false,
      quotas: {
        gmcAccountsConnected: 0,
        gmcAccountsLimit: 1,
        slackDestinationsActive: 0,
        pubsubMonitoringStatus: 'Paused',
      },
    };
  }

  const isAgency = tenant.plan_tier === 'Agency Pilot' || tenant.account_plan === 'agency';
  const planTier = isAgency ? 'Agency' : 'Solo';
  const monthlyPrice = isAgency ? 49 : 19;
  const formattedPrice = isAgency ? '$49/mo' : '$19/mo';
  const gmcAccountsLimit = isAgency ? 'unlimited' : 1;
  const storeCount = extra?.storeCount ?? (tenant.connected_stores || 0);
  const slackCount = extra?.slackCount ?? 0;

  const rawStatus =
    tenant.subscription_status ||
    (tenant.plan_tier === 'Active Pro' || tenant.plan_tier === 'Agency Pilot'
      ? 'paid active'
      : 'active trial');

  const normalized = normalizeSubscriptionStatus(rawStatus);

  if (normalized === 'paid active') {
    return {
      effectiveStatus: 'paid active',
      rawStatus: String(tenant.subscription_status || 'paid active'),
      trialEndsAt: tenant.trial_ends_at || '',
      formattedTrialEnd: 'Active Subscription',
      daysRemaining: 999,
      isLocked: false,
      hasTrialStarted: true,
      isSuperAdmin: false,
      upgradeUrl,
      planTier,
      planName: isAgency ? 'Agency Plan' : 'Solo Plan',
      monthlyPrice,
      formattedPrice,
      renewalOrExpirationDate: tenant.trial_ends_at || '',
      formattedRenewalOrExpiration: 'Auto-renews monthly',
      isUrgent: false,
      quotas: {
        gmcAccountsConnected: storeCount,
        gmcAccountsLimit,
        slackDestinationsActive: slackCount,
        pubsubMonitoringStatus: extra?.pubsubStatus || 'Active',
      },
    };
  }

  if (!tenant.trial_ends_at) {
    return {
      effectiveStatus: 'active trial',
      rawStatus: 'active trial',
      trialEndsAt: '',
      formattedTrialEnd: 'Pending GMC Connection',
      daysRemaining: 14,
      isLocked: false,
      hasTrialStarted: false,
      isSuperAdmin: false,
      upgradeUrl,
      planTier,
      planName: 'Free Trial',
      monthlyPrice,
      formattedPrice,
      renewalOrExpirationDate: '',
      formattedRenewalOrExpiration: 'Pending GMC Connection',
      isUrgent: false,
      quotas: {
        gmcAccountsConnected: storeCount,
        gmcAccountsLimit,
        slackDestinationsActive: slackCount,
        pubsubMonitoringStatus: 'Paused',
      },
    };
  }

  const trialDate = new Date(tenant.trial_ends_at);
  const now = Date.now();
  const msRemaining = trialDate.getTime() - now;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  let effectiveStatus = normalized;
  if (normalized === 'active trial') {
    if (msRemaining <= 0) {
      effectiveStatus = 'expired';
    }
  }

  const isLocked = effectiveStatus === 'expired' || effectiveStatus === 'canceled';
  const isUrgent = effectiveStatus === 'active trial' && daysRemaining <= 3;
  const formattedTrialEnd = trialDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    effectiveStatus,
    rawStatus: String(tenant.subscription_status || normalized),
    trialEndsAt: trialDate.toISOString(),
    formattedTrialEnd,
    daysRemaining,
    isLocked,
    hasTrialStarted: true,
    isSuperAdmin: false,
    upgradeUrl,
    planTier,
    planName: effectiveStatus === 'expired' ? 'Trial Expired' : 'Free Trial',
    monthlyPrice,
    formattedPrice,
    renewalOrExpirationDate: trialDate.toISOString(),
    formattedRenewalOrExpiration: effectiveStatus === 'expired' ? `Expired on ${formattedTrialEnd}` : formattedTrialEnd,
    isUrgent: isUrgent || isLocked,
    quotas: {
      gmcAccountsConnected: storeCount,
      gmcAccountsLimit,
      slackDestinationsActive: slackCount,
      pubsubMonitoringStatus: isLocked ? 'Paused' : (extra?.pubsubStatus || 'Active'),
    },
  };
}

async function runTests() {
  console.log('🧪 Starting Subscription & Billing Verification Suite...\n');

  // Test 1: Superadmin permanent access
  console.log('Test 1: Superadmin (yassinesadik0@gmail.com) bypasses all trial expirations & billing');
  const superadminEval = evaluateSubscription({ email: 'yassinesadik0@gmail.com' });
  assert.strictEqual(superadminEval.isSuperAdmin, true, 'isSuperAdmin must be true');
  assert.strictEqual(superadminEval.planTier, 'Superadmin', 'planTier must be Superadmin');
  assert.strictEqual(superadminEval.planName, 'Lifetime Admin', 'planName must be Lifetime Admin');
  assert.strictEqual(superadminEval.isLocked, false, 'isLocked must be false');
  assert.strictEqual(superadminEval.isUrgent, false, 'isUrgent must be false');
  assert.strictEqual(superadminEval.upgradeUrl, '', 'upgradeUrl must be empty string');
  assert.strictEqual(superadminEval.quotas.gmcAccountsLimit, 'unlimited', 'GMC limit must be unlimited');
  console.log('✅ Superadmin bypass verified: Lifetime Admin with 0 timers and 0 upgrade prompts.\n');

  // Test 2: Active Trial with > 3 days left (neutral styling)
  console.log('Test 2: Active Trial with 10 days remaining (> 3 days)');
  const tenDaysFuture = new Date(Date.now() + 10 * 86400000).toISOString();
  const trialNeutral = evaluateSubscription({
    email: 'merchant@test.com',
    subscription_status: 'active trial',
    trial_ends_at: tenDaysFuture,
  });
  assert.strictEqual(trialNeutral.effectiveStatus, 'active trial');
  assert.strictEqual(trialNeutral.isUrgent, false, 'isUrgent must be false when daysRemaining > 3');
  assert.strictEqual(trialNeutral.daysRemaining, 10);
  assert.strictEqual(trialNeutral.planName, 'Free Trial');
  console.log(`✅ Neutral trial verified: ${trialNeutral.daysRemaining} days left, isUrgent=${trialNeutral.isUrgent}.\n`);

  // Test 3: Active Trial with <= 3 days left (urgent styling)
  console.log('Test 3: Active Trial with 2 days remaining (<= 3 days)');
  const twoDaysFuture = new Date(Date.now() + 2 * 86400000).toISOString();
  const trialUrgent = evaluateSubscription({
    email: 'urgent@test.com',
    subscription_status: 'active trial',
    trial_ends_at: twoDaysFuture,
  });
  assert.strictEqual(trialUrgent.effectiveStatus, 'active trial');
  assert.strictEqual(trialUrgent.isUrgent, true, 'isUrgent must be true when daysRemaining <= 3');
  assert.strictEqual(trialUrgent.daysRemaining, 2);
  console.log(`✅ Urgent trial verified: ${trialUrgent.daysRemaining} days left, isUrgent=${trialUrgent.isUrgent}.\n`);

  // Test 4: Solo Plan user ($19/mo, 1 store limit)
  console.log('Test 4: Solo Plan user entitlements');
  const soloEval = evaluateSubscription({
    email: 'solo@test.com',
    plan_tier: 'Active Pro',
    account_plan: 'solo',
    subscription_status: 'paid active',
  }, { storeCount: 1, slackCount: 1 });
  assert.strictEqual(soloEval.planTier, 'Solo');
  assert.strictEqual(soloEval.planName, 'Solo Plan');
  assert.strictEqual(soloEval.monthlyPrice, 19);
  assert.strictEqual(soloEval.formattedPrice, '$19/mo');
  assert.strictEqual(soloEval.quotas.gmcAccountsLimit, 1);
  assert.strictEqual(soloEval.quotas.gmcAccountsConnected, 1);
  console.log(`✅ Solo Plan verified: $19/mo with 1 GMC limit.\n`);

  // Test 5: Agency Plan user ($49/mo, unlimited store limit)
  console.log('Test 5: Agency Plan user entitlements');
  const agencyEval = evaluateSubscription({
    email: 'agency@test.com',
    plan_tier: 'Agency Pilot',
    account_plan: 'agency',
    subscription_status: 'paid active',
  }, { storeCount: 6, slackCount: 3 });
  assert.strictEqual(agencyEval.planTier, 'Agency');
  assert.strictEqual(agencyEval.planName, 'Agency Plan');
  assert.strictEqual(agencyEval.monthlyPrice, 49);
  assert.strictEqual(agencyEval.formattedPrice, '$49/mo');
  assert.strictEqual(agencyEval.quotas.gmcAccountsLimit, 'unlimited');
  assert.strictEqual(agencyEval.quotas.gmcAccountsConnected, 6);
  console.log(`✅ Agency Plan verified: $49/mo with unlimited GMC limit.\n`);

  console.log('🎉 ALL 5 SUBSCRIPTION AND BILLING TESTS PASSED PERFECTLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
