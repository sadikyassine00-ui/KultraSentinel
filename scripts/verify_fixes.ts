import fs from 'fs';
import path from 'path';

// Load .env
const envFiles = ['.env', '.env.local'];
for (const file of envFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = val.trim();
        }
      }
    }
  }
}

import { evaluateSubscription, getTenantSubscription } from '../src/lib/subscription';
import { getTenants, findTenantByEmail } from '../src/lib/db';

async function main() {
  console.log('=== VERIFYING DEFECT FIXES ===\n');

  // Test 1: Layout & CSS sticky checks
  console.log('[Test 1] Verifying layout and CSS sticky rules...');
  const layoutContent = fs.readFileSync(path.join(__dirname, '../src/app/layout.tsx'), 'utf8');
  if (layoutContent.includes('overflow-x-hidden')) {
    throw new Error('FAIL: src/app/layout.tsx still contains overflow-x-hidden on body');
  }
  if (!layoutContent.includes('overflow-x-clip')) {
    throw new Error('FAIL: src/app/layout.tsx missing overflow-x-clip');
  }
  console.log('  ✓ layout.tsx uses overflow-x-clip (sticky positioning preserved)');

  const adminPageContent = fs.readFileSync(path.join(__dirname, '../src/app/admin/dashboard/page.tsx'), 'utf8');
  if (adminPageContent.includes('lg:static')) {
    throw new Error('FAIL: admin dashboard page.tsx still contains lg:static on aside');
  }
  if (!adminPageContent.includes('lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)]')) {
    throw new Error('FAIL: admin dashboard page.tsx missing lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)]');
  }
  console.log('  ✓ admin dashboard page.tsx aside is sticky pinned below header at top-[60px]');

  const adminTenantsRoute = fs.readFileSync(path.join(__dirname, '../src/app/api/admin/super/tenants/route.ts'), 'utf8');
  if (!adminTenantsRoute.includes("export const dynamic = 'force-dynamic'")) {
    throw new Error('FAIL: api/admin/super/tenants/route.ts missing force-dynamic');
  }
  console.log('  ✓ api/admin/super/tenants/route.ts is force-dynamic');

  // Test 2: Verify tenant 32 (sadikyassine00@gmail.com) in getTenants
  console.log('\n[Test 2] Verifying getTenants returns registered trial user...');
  const allTenants = await getTenants({ search: '', planTier: 'all', status: 'all' });
  const targetTenant = allTenants.find((t) => t.email.toLowerCase() === 'sadikyassine00@gmail.com');
  if (!targetTenant) {
    throw new Error('FAIL: sadikyassine00@gmail.com not returned by getTenants({ search: "", planTier: "all", status: "all" })');
  }
  console.log('  ✓ Found tenant in allTenants:', {
    id: targetTenant.id,
    email: targetTenant.email,
    plan_tier: targetTenant.plan_tier,
    status: targetTenant.status,
    connected_stores: targetTenant.connected_stores,
  });

  // Test case-insensitive plan filter
  const trialFiltered = await getTenants({ planTier: 'trial' });
  const foundInTrial = trialFiltered.find((t) => t.email.toLowerCase() === 'sadikyassine00@gmail.com');
  if (!foundInTrial) {
    throw new Error('FAIL: Case-insensitive planTier="trial" did not match tenant');
  }
  console.log('  ✓ Case-insensitive planTier="trial" matched successfully');

  // Test 3: Verify subscription evaluation for connected GMC store
  console.log('\n[Test 3] Verifying trial status for GMC-connected user...');
  const tenantRecord = await findTenantByEmail('sadikyassine00@gmail.com');
  if (!tenantRecord) {
    throw new Error('FAIL: Tenant sadikyassine00@gmail.com not found in DB');
  }

  const evalDirect = evaluateSubscription(tenantRecord, { storeCount: 1 });
  console.log('  evaluateSubscription result:', {
    hasTrialStarted: evalDirect.hasTrialStarted,
    daysRemaining: evalDirect.daysRemaining,
    formattedTrialEnd: evalDirect.formattedTrialEnd,
    effectiveStatus: evalDirect.effectiveStatus,
    planName: evalDirect.planName,
  });

  if (!evalDirect.hasTrialStarted) {
    throw new Error('FAIL: hasTrialStarted is false for user with connected GMC');
  }
  if (evalDirect.daysRemaining <= 0) {
    throw new Error('FAIL: daysRemaining is <= 0 for active trial');
  }
  console.log('  ✓ Trial badge will render "Free Trial: 14 Days Left" (NOT "Connect GMC to Start Trial")');

  // Test 4: Verify fallback when trial_ends_at is null but storeCount > 0
  console.log('\n[Test 4] Verifying fallback when trial_ends_at is null but storeCount > 0...');
  const mockTenantNoDate = { ...tenantRecord, trial_ends_at: null };
  const evalFallback = evaluateSubscription(mockTenantNoDate, { storeCount: 1 });
  if (!evalFallback.hasTrialStarted) {
    throw new Error('FAIL: Fallback with null trial_ends_at and storeCount=1 did not start trial');
  }
  if (evalFallback.daysRemaining !== 14) {
    throw new Error(`FAIL: Fallback expected 14 days remaining, got ${evalFallback.daysRemaining}`);
  }
  console.log('  ✓ Fallback correctly evaluates trial as started with 14 days remaining');

  console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY ===');
}

main().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
}).finally(() => {
  process.exit(0);
});
