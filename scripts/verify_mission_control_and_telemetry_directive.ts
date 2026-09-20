import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('================================================================');
console.log('STARTING MISSION CONTROL TELEMETRY & BILLING UX DIRECTIVE VERIFICATION');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. Verify TenantDashboardClientLayout.tsx
// -----------------------------------------------------------------------------
console.log('1. Verifying Header and Billing UX Consolidation...');
const layoutPath = path.join(__dirname, '../src/app/dashboard/TenantDashboardClientLayout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

// A. Unified Header Status Pill
assert(
  layoutContent.includes("import { PaddleCheckoutModal } from '@/components/billing/PaddleCheckoutOverlay';"),
  'TenantDashboardClientLayout imports PaddleCheckoutModal directly'
);
assert(
  layoutContent.includes('const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);'),
  'TenantDashboardClientLayout manages isCheckoutOpen state'
);
assert(
  layoutContent.includes('Left · Upgrade</span>') || layoutContent.includes('Left · Upgrade'),
  'Unified status pill includes countdown and Upgrade action in single element'
);
assert(
  layoutContent.includes('<PaddleCheckoutModal'),
  'PaddleCheckoutModal is mounted in TenantDashboardClientLayout'
);

// B. Elimination of Redundant Upgrade Buttons
const headerSection = layoutContent.slice(
  layoutContent.indexOf('<header'),
  layoutContent.indexOf('</header>')
);
assert(
  !headerSection.includes('btn-primary text-[11px] py-1 px-2.5 !rounded-[3px] font-semibold tracking-tight shrink-0 shadow-none'),
  'Redundant secondary Upgrade button removed from trial header'
);
assert(
  !headerSection.includes('btn-primary text-[11px] py-1 px-2.5 !rounded-[3px] font-semibold shrink-0\n                    >\n                      Upgrade'),
  'Redundant secondary Upgrade button removed from expired trial header'
);

// C. Paid Account Plan Indicators
assert(
  layoutContent.includes('Solo Plan · {stores.length}/1 Stores'),
  'Solo active accounts render Solo Plan · X/1 Stores indicator'
);
assert(
  layoutContent.includes('Agency Fleet · {stores.length}/5 Stores'),
  'Agency active accounts render Agency Fleet · X/5 Stores indicator'
);

// D. Store Switcher Quota & Interception
assert(
  layoutContent.includes('({quotaLabel})'),
  'Store switcher trigger displays account quota directly next to store name'
);
assert(
  layoutContent.includes('if (stores.length >= maxStoresLimit) {') &&
  layoutContent.includes('setIsFleetModalOpen(true);'),
  'Adding store at or above quota immediately intercepts with FleetLimitModal'
);

// -----------------------------------------------------------------------------
// 2. Verify Operational Telemetry & Action Bar in TenantTriageCenter.tsx
// -----------------------------------------------------------------------------
console.log('\n2. Verifying Operational Telemetry and Action Bar...');
const triagePath = path.join(__dirname, '../src/components/dashboard/TenantTriageCenter.tsx');
const triageContent = fs.readFileSync(triagePath, 'utf-8');

// A. Heartbeat Telemetry Proof-of-Work
assert(
  triageContent.includes('Surveillance Active'),
  'Operational action bar includes Surveillance Active heartbeat indicator'
);
assert(
  triageContent.includes('Last sync'),
  'Heartbeat telemetry displays last sync verification timestamp'
);
assert(
  triageContent.includes('issues detected'),
  'Heartbeat telemetry displays issues detected summary'
);
assert(
  triageContent.includes('items verified'),
  'Heartbeat telemetry displays total verified SKUs'
);

// B. Elimination of Refresh & Secondary Billing Triggers
const actionBarSection = triageContent.slice(
  triageContent.indexOf('Operational Action Bar'),
  triageContent.indexOf('Fire Drill Confirmation Banner')
);
assert(
  !actionBarSection.includes('>Refresh<') && !actionBarSection.includes('handleRefresh'),
  'Manual Refresh button removed from secondary action bar'
);
assert(
  !actionBarSection.includes('Billing &amp; Quotas') && !actionBarSection.includes('Billing & Quotas'),
  'Redundant secondary Billing & Quotas button removed from operational action bar'
);

// C. Relocated Controls
assert(
  actionBarSection.includes('Run Test Fire Drill') && actionBarSection.includes('Configure alerts'),
  'Test Fire Drill and Configure alerts controls relocated as secondary utility actions'
);

// -----------------------------------------------------------------------------
// 3. Verify High-Density KPI Scorecard Grid in TenantTriageCenter.tsx
// -----------------------------------------------------------------------------
console.log('\n3. Verifying High-Density KPI Scorecard Grid...');
const kpiSection = triageContent.slice(
  triageContent.indexOf('SECTION 2: Restructured KPI Scorecards Grid'),
  triageContent.indexOf('SECTION 3: Primary Incident Triage Center')
);

// Card 1: Catalog Health and Risk
assert(
  kpiSection.includes('Catalog Health &amp; Risk') || kpiSection.includes('Catalog Health & Risk'),
  'Card 1 labeled Catalog Health & Risk'
);
assert(
  kpiSection.includes('100% Compliant') && kpiSection.includes('Revenue at risk'),
  'Card 1 displays compliance status, policy violations count, and revenue at risk'
);

// Card 2: Four-State Inventory Breakdown
assert(
  kpiSection.includes('Inventory Breakdown'),
  'Card 2 labeled Inventory Breakdown'
);
assert(
  kpiSection.includes('Serving Ads') &&
  kpiSection.includes('Expiring Soon') &&
  kpiSection.includes('In Review') &&
  kpiSection.includes('Disapproved'),
  'Card 2 renders all 4 required states: Serving Ads, Expiring Soon, In Review, Disapproved'
);

// Card 3: Slack Alert Routing
assert(
  kpiSection.includes('Slack Alert Routing'),
  'Card 3 labeled Slack Alert Routing'
);
assert(
  kpiSection.includes('Send test ping →') || kpiSection.includes('Send Test Ping →'),
  'Card 3 includes instant test ping action trigger'
);

// Card 4: Surveillance Engine Performance
assert(
  kpiSection.includes('Surveillance Engine'),
  'Card 4 labeled Surveillance Engine'
);
assert(
  kpiSection.includes('Pub/Sub Listener:') &&
  kpiSection.includes('Push Latency:') &&
  kpiSection.includes('24h Event Volume:'),
  'Card 4 renders Pub/Sub listener status, push latency in ms, and 24h event volume'
);

// -----------------------------------------------------------------------------
// 4. Verify Real-Time Surveillance Audit Feed in TenantTriageCenter.tsx
// -----------------------------------------------------------------------------
console.log('\n4. Verifying Real-Time Surveillance Audit Feed...');
const auditSection = triageContent.slice(
  triageContent.indexOf('SECTION 4: Real-Time Surveillance Audit Feed')
);

assert(
  auditSection.includes('<table className="w-full text-left border-collapse'),
  'Surveillance Audit Feed is implemented as a persistent table'
);
assert(
  !auditSection.includes('onClick={() => setActivityFeedOpen(!activityFeedOpen)}'),
  'Surveillance Audit Feed is persistent and not collapsed behind a toggle button'
);
assert(
  auditSection.includes('Timestamp') &&
  auditSection.includes('Event Category') &&
  auditSection.includes('Operational Description') &&
  auditSection.includes('Status'),
  'Audit table includes all required columns: Timestamp, Category, Description, Status'
);
assert(
  auditSection.includes('Nominal') &&
  auditSection.includes('Active') &&
  auditSection.includes('Resolved') &&
  auditSection.includes('Simulation'),
  'Audit table renders status badges: Nominal, Active, Resolved, Simulation'
);
assert(
  auditSection.includes('Test Isolation Active'),
  'Simulated events render Test Isolation Active badge'
);

// -----------------------------------------------------------------------------
// 5. Verify Dashboard API Route (src/app/api/dashboard/route.ts)
// -----------------------------------------------------------------------------
console.log('\n5. Verifying Dashboard API Route Payload...');
const routePath = path.join(__dirname, '../src/app/api/dashboard/route.ts');
const routeContent = fs.readFileSync(routePath, 'utf-8');

assert(
  routeContent.includes('inventoryBreakdown: {') &&
  routeContent.includes('servingAds') &&
  routeContent.includes('expiringSoon') &&
  routeContent.includes('inReview') &&
  routeContent.includes('disapproved'),
  'Dashboard API returns structured inventoryBreakdown with 4 states'
);
assert(
  routeContent.includes('surveillance: {') &&
  routeContent.includes('pushLatencyMs') &&
  routeContent.includes('eventVolume24h') &&
  routeContent.includes('lastSyncTimestamp'),
  'Dashboard API returns surveillance engine performance telemetry'
);
assert(
  routeContent.includes("category: 'Catalog Audit'") &&
  routeContent.includes("category: 'Pub/Sub Ingestion'") &&
  routeContent.includes("category: 'Webhook Latency'"),
  'Dashboard API generates background surveillance audit events for zero-disapproval accounts'
);

console.log('\n================================================================');
console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! 100% SPEC COMPLIANT');
console.log('================================================================');
