import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

console.log('================================================================');
console.log('  VERIFYING KULTRA REFUND & CANCELLATION POLICY PAGE           ');
console.log('================================================================\n');

const refundPagePath = path.join(process.cwd(), 'src/app/refund/page.tsx');
assert(fs.existsSync(refundPagePath), 'src/app/refund/page.tsx exists');

const content = fs.readFileSync(refundPagePath, 'utf8');

// 1. Strict Punctuation Rule: Never use em dashes (—, –, or --)
console.log('--- 1. Punctuation & Constraint Audits ---');
const emDashMatch = content.match(/[—–]/);
assert(!emDashMatch, 'Zero em dashes (— or –) present in the page copy');

// 2. Critical Restriction: No third-party payment processors or MoR names
const paymentProcessorMatch = content.match(/stripe|lemon\s*squeezy|paddle|paypal|payoneer|adyen/i);
assert(!paymentProcessorMatch, 'Zero third-party payment processors or Merchant of Record names mentioned');

// 3. Pricing Tiers & Domain Specifics
console.log('\n--- 2. Business Context & Pricing Verification ---');
assert(content.includes('$19'), 'Solo plan price ($19) present');
assert(content.includes('$49'), 'Agency plan price ($49) present');
assert(content.includes('USD') || content.includes('United States Dollars'), 'Currency stated as USD');
assert(content.includes('support@usekultra.com'), 'Support email support@usekultra.com present');
assert(content.includes('Ouarzazate, Morocco'), 'Operating location Ouarzazate, Morocco present');

// 4. Trial Architecture & Activation Trigger
console.log('\n--- 3. Trial & Activation Architecture ---');
assert(
  content.includes('14-day') || content.includes('14 days'),
  '14-day duration specified'
);
assert(
  content.toLowerCase().includes('connects your first google merchant center') ||
  content.toLowerCase().includes('connect your first google merchant center'),
  'Trial starts strictly when user connects their first Google Merchant Center account'
);
assert(
  content.toLowerCase().includes('never charged') || content.toLowerCase().includes('never charged prior'),
  'Explicit statement that card is never charged if canceled before day 14 ends'
);

// 5. 10 Required Sections Verification
console.log('\n--- 4. Section-by-Section Verification ---');
assert(content.includes('Clear Commitment and Overview'), 'Section 1: Clear Commitment and Overview present');
assert(content.includes('14-Day Free Trial Terms'), 'Section 2: 14-Day Free Trial Terms present');
assert(content.includes('First-Payment 14-Day Money-Back Guarantee'), 'Section 3: First-Payment 14-Day Money-Back Guarantee present');
assert(content.includes('Subsequent Monthly Renewals'), 'Section 4: Subsequent Monthly Renewals present');
assert(content.includes('Plan Upgrades and Downgrades'), 'Section 5: Plan Upgrades and Downgrades present');
assert(content.includes('Frictionless Self-Serve Cancellation'), 'Section 6: Frictionless Self-Serve Cancellation present');
assert(content.includes('Alerting Reliability and Outage Credits'), 'Section 7: Alerting Reliability and Outage Credits present');
assert(content.includes('Step-by-Step Refund Request Process'), 'Section 8: Step-by-Step Refund Request Process present');
assert(content.includes('Chargeback Prevention and Dispute Policy'), 'Section 9: Chargeback Prevention and Dispute Policy present');
assert(content.includes('Contact and Business Details'), 'Section 10: Contact and Business Details present');

// 6. Footer Integration
console.log('\n--- 5. Footer & Navigation Links Audit ---');
const footerPath = path.join(process.cwd(), 'src/components/Footer.tsx');
const footerContent = fs.readFileSync(footerPath, 'utf8');
assert(footerContent.includes('/refund'), 'Footer links to /refund');

const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
assert(nextConfigContent.includes('/cancellation') && nextConfigContent.includes('/refund'), 'next.config.mjs redirects /cancellation to /refund');

console.log('\n================================================================');
console.log('RESULTS: ALL AUDITS PASSED CLEANLY (0 ERRORS)');
console.log('================================================================\n');
