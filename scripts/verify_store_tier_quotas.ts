import { canTenantConnectStore, getStoreLimitForTenant, Tenant } from '../src/lib/subscription';
import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('--- STARTING STORE TIER QUOTA VERIFICATION ---');

// 1. Test Solo Plan Account Quota (1 store max)
const soloTenant: Partial<Tenant> = {
  id: 101,
  email: 'merchant@example.com',
  created_at: new Date().toISOString(),
  subscription_status: 'paid active',
  plan_tier: 'Active Pro',
};

const soloLimit = getStoreLimitForTenant(soloTenant);
assert(soloLimit === 1, 'Solo tier store limit is 1');

const solo0 = canTenantConnectStore(soloTenant, 0);
assert(solo0.allowed === true, 'Solo tier allows connecting first store (0 current)');

const solo1 = canTenantConnectStore(soloTenant, 1);
assert(solo1.allowed === false, 'Solo tier blocks connecting second store (1 current)');
assert(solo1.limit === 1 && solo1.current === 1 && solo1.planTier === 'Solo', 'Solo tier returns structured error payload');
assert(Boolean(solo1.reason?.includes('Solo Plan quota reached')), 'Solo tier returns correct rejection reason');

// 2. Test Agency Fleet Plan Account Quota (5 stores max)
const agencyTenant: Partial<Tenant> = {
  id: 102,
  email: 'agency@example.com',
  created_at: new Date().toISOString(),
  subscription_status: 'paid active',
  plan_tier: 'Agency Pilot',
};

const agencyLimit = getStoreLimitForTenant(agencyTenant);
assert(agencyLimit === 5, 'Agency tier store limit is 5');

const agency4 = canTenantConnectStore(agencyTenant, 4);
assert(agency4.allowed === true, 'Agency tier allows connecting 5th store (4 current)');

const agency5 = canTenantConnectStore(agencyTenant, 5);
assert(agency5.allowed === false, 'Agency tier blocks connecting 6th store (5 current)');
assert(agency5.limit === 5 && agency5.current === 5 && agency5.planTier === 'Agency', 'Agency tier returns structured error payload');
assert(Boolean(agency5.reason?.includes('Agency Fleet quota reached: Maximum 5 connected')), 'Agency tier returns correct rejection reason');

// 3. Test Superadmin Immunity (yassinesadik0@gmail.com)
const superadminTenant: Partial<Tenant> = {
  id: 103,
  email: 'yassinesadik0@gmail.com',
  created_at: new Date().toISOString(),
  subscription_status: 'paid active',
  plan_tier: 'Agency Pilot',
};

const superadminLimit = getStoreLimitForTenant(superadminTenant);
assert(superadminLimit === 'unlimited', 'Superadmin store limit is unlimited');

const admin5 = canTenantConnectStore(superadminTenant, 5);
assert(admin5.allowed === true, 'Superadmin can connect 6th store (5 current)');

const admin20 = canTenantConnectStore(superadminTenant, 20);
assert(admin20.allowed === true, 'Superadmin can connect 21st store (20 current)');

// 4. Verify PricingMatrix copy
const pricingMatrixPath = path.join(__dirname, '../src/components/PricingMatrix.tsx');
const pricingContent = fs.readFileSync(pricingMatrixPath, 'utf8');
assert(pricingContent.includes('Up to 5 GMC Accounts'), 'PricingMatrix contains "Up to 5 GMC Accounts"');
assert(pricingContent.includes('Expandable fleet capacity for high-volume portfolios'), 'PricingMatrix contains expandable fleet bullet');
assert(!pricingContent.includes('Unlimited GMC Accounts connected'), 'PricingMatrix does NOT contain "Unlimited GMC Accounts connected"');

// 5. Verify SettingsClientView copy
const settingsViewPath = path.join(__dirname, '../src/components/dashboard/SettingsClientView.tsx');
const settingsContent = fs.readFileSync(settingsViewPath, 'utf8');
assert(settingsContent.includes('Up to 5 GMC Accounts'), 'SettingsClientView contains "Up to 5 GMC Accounts"');
assert(settingsContent.includes('Expandable fleet capacity for high-volume portfolios'), 'SettingsClientView contains expandable fleet bullet');
assert(settingsContent.includes('GMC Accounts: {stores.length} of'), 'SettingsClientView displays GMC Accounts telemetry');
assert(settingsContent.includes('FleetLimitModal'), 'SettingsClientView imports and renders FleetLimitModal');

// 6. Verify FleetLimitModal implementation
const modalPath = path.join(__dirname, '../src/components/dashboard/FleetLimitModal.tsx');
const modalContent = fs.readFileSync(modalPath, 'utf8');
assert(modalContent.includes('Fleet Limit Reached (5 of 5 Stores Active)'), 'FleetLimitModal has headline "Fleet Limit Reached (5 of 5 Stores Active)"');
assert(modalContent.includes('Your Agency Fleet tier covers up to 5 monitored stores.'), 'FleetLimitModal has required description text');
assert(modalContent.includes('Request Fleet Expansion'), 'FleetLimitModal has "Request Fleet Expansion" primary action');
assert(modalContent.includes('support@usekultra.com'), 'FleetLimitModal routes to support@usekultra.com');
assert(modalContent.includes('Custom Agency Fleet Request'), 'FleetLimitModal pre-fills subject "Custom Agency Fleet Request"');
assert(modalContent.includes('Manage Existing Stores'), 'FleetLimitModal has "Manage Existing Stores" secondary action');

console.log('--- ALL VERIFICATIONS PASSED SUCCESSFULLY ---');
