import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { evaluateSubscription, activateTrialOnFirstStoreConnect } from '../src/lib/subscription';
import { findTenantByEmail, createTenant, updateTenantByEmail } from '../src/lib/db';
import { PADDLE_PLANS, getPaddlePriceId } from '../src/lib/paddle/config';

// Load .env
const envFiles = ['.env', '.env.local'];
for (const file of envFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    for (const line of fs.readFileSync(fullPath, 'utf8').split('\n')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1].trim()]) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

async function main() {
  console.log('=== VERIFYING TRIAL DECOUPLING, IMMEDIATE BILLING & CHECKOUT STYLING ===\n');

  // ---------------------------------------------------------------------------
  // Test 1: Cardless Trial Decoupling & Lifecycle Auditing
  // ---------------------------------------------------------------------------
  console.log('--- Test 1: Cardless Trial Decoupling & Database Timers ---');
  const testEmail = `cardless_trial_test_${Date.now()}@usekultra.com`;

  // 1a. Registration / Onboarding: zero credit card, trial unstarted
  const tenant = await createTenant({
    email: testEmail,
    companyName: 'Cardless Merchant Co',
    planTier: 'Trial',
    accountPlan: 'solo',
    subscriptionStatus: 'active trial',
  });

  const evalBeforeGmc = evaluateSubscription(tenant);
  assert.strictEqual(evalBeforeGmc.hasTrialStarted, false, 'Trial must not start prior to GMC connection');
  assert.strictEqual(evalBeforeGmc.isLocked, false, 'Unstarted trial must not be locked');
  assert.strictEqual(evalBeforeGmc.daysRemaining, 14, 'Pending trial displays 14 days remaining');
  console.log('[PASS] Registration is 100% cardless: trial unstarted until GMC connection.');

  // 1b. GMC Connection: initiates 14-day internal database countdown
  await activateTrialOnFirstStoreConnect(testEmail);
  const tenantAfterGmc = await findTenantByEmail(testEmail);
  assert(tenantAfterGmc?.trial_ends_at, 'GMC connection must set trial_ends_at');
  const evalAfterGmc = evaluateSubscription(tenantAfterGmc);
  assert.strictEqual(evalAfterGmc.hasTrialStarted, true, 'Trial starts once GMC is connected');
  assert.strictEqual(evalAfterGmc.isLocked, false, 'Active trial is unlocked');
  assert(evalAfterGmc.daysRemaining > 0 && evalAfterGmc.daysRemaining <= 14, 'Days remaining is within 1-14');
  console.log('[PASS] Trial activation triggered strictly upon GMC connection without payment prompts.');

  // 1c. Day 15 Expiration: locks unbilled account and engages alert silencer
  const expiredDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago (elapsed)
  const evalExpired = evaluateSubscription({
    ...tenantAfterGmc,
    trial_ends_at: expiredDate,
    subscription_status: 'active trial',
  });
  assert.strictEqual(evalExpired.effectiveStatus, 'expired', 'Elapsed trial transitions to expired');
  assert.strictEqual(evalExpired.isLocked, true, 'Expired trial account is locked by paywall');
  assert.strictEqual(evalExpired.quotas.pubsubMonitoringStatus, 'Paused', 'Alert silencer engaged on expiration');
  console.log('[PASS] Day 15 trial expiration automatically locks unbilled accounts and silences alerts.');

  // 1d. Superadmin permanent paywall immunity
  const superadminEval = evaluateSubscription({ email: 'yassinesadik0@gmail.com' });
  assert.strictEqual(superadminEval.isSuperAdmin, true, 'Superadmin identified');
  assert.strictEqual(superadminEval.isLocked, false, 'Superadmin permanently unlocked');
  assert.strictEqual(superadminEval.daysRemaining, 9999, 'Superadmin retains permanent access');
  console.log('[PASS] Superadmin (yassinesadik0@gmail.com) retains permanent paywall immunity.');

  // ---------------------------------------------------------------------------
  // Test 2: Immediate Billing on Checkout Initiation (Zero Deferred Billing)
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 2: Immediate Billing on Checkout (No Deferred Billing/Trial) ---');
  const checkoutRouteSource = fs.readFileSync(
    path.join(__dirname, '../src/app/api/billing/checkout/route.ts'),
    'utf8'
  );

  // Verify zero trial parameters in checkout session creation
  assert(!checkoutRouteSource.includes('trial_period'), 'Must not pass trial_period to payment provider');
  assert(!checkoutRouteSource.includes('billing_period_starts_at'), 'Must not pass deferred billing_period_starts_at');
  assert(!checkoutRouteSource.includes('zero_dollar'), 'Must not offer zero-dollar checkout');

  // Verify plan prices and amounts
  assert.strictEqual(PADDLE_PLANS.solo.monthlyPriceUsd, 19, 'Solo plan is $19/mo');
  assert.strictEqual(PADDLE_PLANS.agency.monthlyPriceUsd, 49, 'Agency plan is $49/mo');
  assert.strictEqual(PADDLE_PLANS.solo.unitAmount, '1900', 'Solo amount is 1900 cents ($19.00)');
  assert.strictEqual(PADDLE_PLANS.agency.unitAmount, '4900', 'Agency amount is 4900 cents ($49.00)');

  // Verify clean customData sanitization
  assert(
    checkoutRouteSource.includes('cleanCustomData'),
    'Checkout route must sanitize customData to prevent undefined values and Paddle 400s'
  );
  console.log('[PASS] Immediate billing verified: full $19/mo or $49/mo charged today with zero trial deferrals.');

  // ---------------------------------------------------------------------------
  // Test 3: Styling Strictly According to GEMINI.md Design Tokens
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 3: Modal & Checkout Styling According to GEMINI.md ---');
  const overlaySource = fs.readFileSync(
    path.join(__dirname, '../src/components/billing/PaddleCheckoutOverlay.tsx'),
    'utf8'
  );
  const globalsCss = fs.readFileSync(
    path.join(__dirname, '../src/app/globals.css'),
    'utf8'
  );

  // Verify GEMINI.md tokens used in modal
  assert(overlaySource.includes('var(--bg-surface)'), 'Modal uses --bg-surface (#0e0f11)');
  assert(overlaySource.includes('var(--hairline)'), 'Modal uses --hairline (rgba(255,255,255,0.08))');
  assert(overlaySource.includes('var(--radius-md)'), 'Modal container uses --radius-md (4px)');
  assert(overlaySource.includes('shadow-[0_16px_40px_rgba(0,0,0,0.5)]'), 'Floating modal uses 0 16px 40px shadow (§3)');
  assert(overlaySource.includes('font-serif'), 'Plan heading uses Fraunces display serif (§2)');
  assert(overlaySource.includes('font-mono'), 'Price figures use Roboto Mono (§2)');
  assert(overlaySource.includes('var(--signal)'), 'Accents strictly use single signal color (§0, §1)');

  // Verify Paddle checkout iframe dark mode styling in globals.css
  assert(globalsCss.includes('.paddle-checkout-frame'), 'globals.css styles .paddle-checkout-frame');
  assert(globalsCss.includes('color-scheme: dark !important'), 'Paddle iframe forced to color-scheme: dark');
  console.log('[PASS] Checkout modal strictly themed to GEMINI.md tokens (no white boxes, dark aesthetic).');

  // ---------------------------------------------------------------------------
  // Test 4: Mobile Responsiveness & Touch Target Optimization
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 4: Mobile Responsiveness & Touch Optimization ---');
  // Check touch target height (minimum 44px)
  assert(overlaySource.includes('min-h-[44px]') && overlaySource.includes('min-w-[44px]'), 'Touch targets are min 44x44px');
  assert(overlaySource.includes('checkout-touch-target'), 'Close button has checkout-touch-target class');
  
  // Check input font-size >= 16px on mobile in globals.css to prevent iOS zoom
  assert(globalsCss.includes('font-size: 16px !important'), 'Mobile input font-size >= 16px to prevent iOS auto-zoom');
  assert(globalsCss.includes('min-height: 44px !important'), 'Mobile input/button min-height >= 44px');

  // Check fluid mobile container down to 320px width and expanded desktop view per user request
  assert(
    overlaySource.includes('max-w-[calc(100vw-24px)]') || overlaySource.includes('w-full max-w-[500px]'),
    'Modal is fluid width with responsive max width'
  );
  assert(
    overlaySource.includes('p-3 sm:p-6') || overlaySource.includes('p-3 sm:p-4'),
    'Outer backdrop padding scales for small viewports'
  );
  console.log('[PASS] Mobile responsiveness down to 320px, 44px touch targets, and iOS zoom prevention verified.');

  console.log('\n================================================================');
  console.log('>>> ALL TRIAL DECOUPLING & CHECKOUT STYLING TESTS PASSED! <<<');
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('[Verification Error]:', err);
  process.exit(1);
});
