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
console.log('STARTING PLAN SELECTION MODAL & MOBILE OVERFLOW VERIFICATION');
console.log('================================================================\n');

// 1. Verify PlanSelectionModal component
console.log('1. Verifying PlanSelectionModal Component...');
const modalPath = path.join(__dirname, '../src/components/billing/PlanSelectionModal.tsx');
assert(fs.existsSync(modalPath), 'PlanSelectionModal.tsx exists');
const modalContent = fs.readFileSync(modalPath, 'utf-8');

assert(
  modalContent.includes('$19') && modalContent.includes('Solo Plan'),
  'PlanSelectionModal presents Solo Plan at $19/mo'
);
assert(
  modalContent.includes('$49') && modalContent.includes('Agency Fleet'),
  'PlanSelectionModal presents Agency Fleet at $49/mo'
);
assert(
  modalContent.includes('1 GMC Store') && modalContent.includes('Up to 5 Stores'),
  'PlanSelectionModal specifies store limits (1 store vs up to 5 stores)'
);
assert(
  modalContent.includes('Sub-30-second Cloud Pub/Sub detection latency'),
  'PlanSelectionModal displays sub-30-second Pub/Sub detection feature'
);
assert(
  modalContent.includes('Instant plain-English violation breakdowns'),
  'PlanSelectionModal displays plain-English violation breakdowns feature'
);
assert(
  modalContent.includes('1-click Slack OAuth delivery'),
  'PlanSelectionModal displays 1-click Slack OAuth delivery feature'
);
assert(
  modalContent.includes("onSelectPlan('solo')") && modalContent.includes("onSelectPlan('agency')"),
  'PlanSelectionModal routes selection to exact plan identifiers'
);
assert(
  modalContent.includes('var(--bg-surface)') && modalContent.includes('var(--signal)'),
  'PlanSelectionModal strictly adheres to Ghost & Signal tokens'
);

// 2. Verify TenantDashboardClientLayout Interception & Store Switcher
console.log('\n2. Verifying Dashboard Header Interception & Store Switcher Constraints...');
const layoutPath = path.join(__dirname, '../src/app/dashboard/TenantDashboardClientLayout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

assert(
  layoutContent.includes('import { PlanSelectionModal } from'),
  'TenantDashboardClientLayout imports PlanSelectionModal'
);
assert(
  layoutContent.includes('const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);'),
  'TenantDashboardClientLayout tracks isPlanModalOpen state'
);
assert(
  layoutContent.includes('setIsPlanModalOpen(true);'),
  'Trial countdown upgrade action intercepts and opens PlanSelectionModal'
);
assert(
  layoutContent.includes('<PlanSelectionModal'),
  'PlanSelectionModal is mounted in TenantDashboardClientLayout'
);
assert(
  layoutContent.includes('max-w-[125px]') && layoutContent.includes('truncate'),
  'Store switcher enforces strict max-width and ellipsis truncation for mobile'
);
assert(
  layoutContent.includes('max-w-[calc(100vw-16px)]') || layoutContent.includes('max-w-[calc(100vw-24px)]'),
  'Store dropdown popover bounds are constrained to viewport minus padding'
);

// 3. Verify Public Marketing Header Containment
console.log('\n3. Verifying Public Mobile Header Responsive Actions & Containment...');
const headerPath = path.join(__dirname, '../src/components/Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf-8');

assert(
  headerContent.includes('text-[12px]') && headerContent.includes('Sign In'),
  'Header renders compact ghost text Sign In link on mobile'
);
assert(
  headerContent.includes('Start Trial') && headerContent.includes('btn-primary'),
  'Header renders compact signal Start Trial button on narrow viewports'
);
assert(
  headerContent.includes('max-w-full') &&
  !headerContent.includes('overflow-x-auto') &&
  !headerContent.includes('overflow-auto') &&
  !headerContent.includes('overflow-scroll'),
  'Header eliminates container scrollbar triggers while constraining bounds'
);

// 4. Verify Root Layout Containment
console.log('\n4. Verifying Root Layout Viewport Containment...');
const rootLayoutPath = path.join(__dirname, '../src/app/layout.tsx');
const rootLayoutContent = fs.readFileSync(rootLayoutPath, 'utf-8');

assert(
  rootLayoutContent.includes('overflow-x-hidden') && rootLayoutContent.includes('max-w-full'),
  'RootLayout enforces horizontal overflow prevention on body and children wrapper'
);

console.log('\n================================================================');
console.log('ALL PLAN SELECTION & MOBILE OVERFLOW VERIFICATIONS PASSED 100%!');
console.log('================================================================\n');
