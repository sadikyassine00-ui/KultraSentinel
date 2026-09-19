const fs = require('fs');
const path = require('path');

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('====================================================');
  console.log('       KULTRA TDD COMPREHENSIVE TEST SUITE          ');
  console.log('====================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (details) console.error(`       Details: ${details}`);
      failedTests++;
    }
  }

  // 1. Wait for server readiness
  console.log('[TEST GROUP 1] Dev Server Readiness & HTTP Status');
  let res = null;
  let html = '';
  const maxRetries = 20;

  for (let i = 0; i < maxRetries; i++) {
    try {
      res = await fetch('http://localhost:3000');
      if (res.status === 200) {
        html = await res.text();
        break;
      }
    } catch (e) {
      // Server warming up
    }
    await wait(1000);
  }

  assert(res && res.status === 200, 'GET http://localhost:3000 returns 200 OK', res ? `Status: ${res.status}` : 'Server not responding');
  assert(html.length > 5000, 'HTML payload is non-empty and fully formed', `HTML length: ${html.length}`);

  // 2. Test Section Content & Conversion Hierarchy
  console.log('\n[TEST GROUP 2] Required 8 Sections & Copy Hierarchy');

  const requiredPhrases = [
    // Elevated SocialProof Integration Cards
    { name: 'SocialProof: Header', text: 'Engineered for modern high-volume merchant stacks' },
    { name: 'SocialProof: Google Cloud Pub/Sub Card', text: 'Google Cloud Pub/Sub' },
    { name: 'SocialProof: Pub/Sub QoS 1 Spec', text: 'Push QoS 1' },
    { name: 'SocialProof: Pub/Sub Latency', text: '&lt; 18s E2E Latency' },
    { name: 'SocialProof: Google Merchant API v1 Card', text: 'Google Merchant API v1' },
    { name: 'SocialProof: Shopify Admin Card', text: 'Shopify Admin' },
    { name: 'SocialProof: Slack Telemetry Card', text: 'Slack Telemetry' },

    // Section 1
    { name: 'Section 1: The Cost of Silence Title', text: 'The Cost of Silence' },
    { name: 'Section 1: Outcome-first headline', text: 'Silent disapprovals drain ad budgets before your team notices' },
    { name: 'Section 1: Without Kultra 5-Day Blindspot', text: 'The 5-Day Silent Blindspot' },
    { name: 'Section 1: Without Kultra Loss Metric', text: '$4,800+' },
    { name: 'Section 1: With Kultra Telemetry Sub-3-Minute', text: 'Sub-3-Minute Incident Remediation' },
    { name: 'Section 1: With Kultra Metric $0.00 Lost Ad Spend', text: '$0.00 (Zero Downtime)' },

    // Section 2
    { name: 'Section 2: The 3-Step Pipeline Title', text: 'The 3-Step Pipeline' },
    { name: 'Section 2: Step 1 Catch outcome line', text: 'We see the disapproval the second it happens, not hours later.' },
    { name: 'Section 2: Step 2 Translate outcome line', text: 'No more decoding cryptic Google error codes yourself.' },
    { name: 'Section 2: Step 3 Resolve outcome line', text: 'Fix it in one click, without opening Merchant Center at all.' },

    // Section 3
    { name: 'Section 3: Architecture Comparison Title', text: 'Pub/Sub Event Streaming vs. Legacy Polling Architecture' },
    { name: 'Section 3: Metric: Detection Speed', text: 'Detection Speed' },
    { name: 'Section 3: Metric: API Foundation', text: 'API Foundation' },
    { name: 'Section 3: Metric: Remediation Action', text: 'Remediation Action' },
    { name: 'Section 3: Metric: Revenue Urgency Context', text: 'Revenue Urgency Context' },
    { name: 'Section 3: Metric: Delivery Routing', text: 'Delivery Routing' },

    // Section 4
    { name: 'Section 4: Slack Preview Bot Identity', text: 'Kultra Bot' },
    { name: 'Section 4: Slack Urgency Badge (Static)', text: 'Critical - High Bestseller Alert' },
    { name: 'Section 4: Revenue Impact Metric', text: '14,280 clicks / 30d at risk' },
    { name: 'Section 4: Product Metadata Title', text: 'Apex Waterproof Trail Runner - Carbon / 10.5' },
    { name: 'Section 4: Plain-English Root Cause', text: 'Plain-English Root Cause' },
    { name: 'Section 4: 1-Click Shopify CTA Button', text: 'Edit in Shopify Admin' },
    { name: 'Section 4: Raw Protocol Payload Toggle', text: 'Inspect Raw Google Payload' },
    { name: 'Section 4: Protocol Error String', text: 'item_disapproved: promotional_overlay_image [image_link]' },

    // Section 5
    { name: 'Section 5: FAQ Section Title', text: 'Frequently Asked Questions' },
    { name: 'Section 5: Q1 Disapproval Notification Delay', text: 'Why doesn&#x27;t Google Merchant Center alert me immediately when products are disapproved?' },
    { name: 'Section 5: Q2 Shopify Deep Link Mapping', text: 'How does Kultra link directly to my specific Shopify product admin?' },
    { name: 'Section 5: Q3 Zero Storefront Footprint', text: 'Does Kultra require a Shopify app installation or slow down storefront performance?' },
    { name: 'Section 5: Q4 Merchant API v1 Migration', text: 'How does Kultra handle Google&#x27;s migration from Content API to Merchant API v1?' },
    { name: 'Section 5: Q5 Pilot Access Timeline', text: 'What happens during the pilot? How fast do I get access after applying?' },
    { name: 'Section 5: JSON-LD FAQPage Schema', text: '"@type":"FAQPage"' },
    { name: 'Section 5: JSON-LD SoftwareApplication Schema', text: '"@type":"SoftwareApplication"' },

    // Section 6
    { name: 'Section 6: Dual Pricing Title', text: 'Predictable Flat Pricing' },
    { name: 'Section 6: Honest Founder Trust Line', text: 'We are personally onboarding every pilot account this month: no automated queue.' },
    { name: 'Section 6: Plan 1 Solo Merchant ($19)', text: 'Solo Merchant' },
    { name: 'Section 6: Plan 2 PPC Agency ($49)', text: 'PPC Agency' },
    { name: 'Section 6: Merchant CTA Label', text: 'Apply for Merchant Pilot' },
    { name: 'Section 6: Agency CTA Label', text: 'Apply for Agency Pilot' },

    // Section 7
    { name: 'Section 7: Application Form Headline', text: 'Secure Early Pilot Access &amp; Receive a Free Feed Audit' },
    { name: 'Section 7: Risk Reversal Line', text: 'No credit card required. If it is not a fit yet, we will tell you honestly on the call.' },
    { name: 'Section 7: Form Email Field', text: 'Work Email Address' },
    { name: 'Section 7: Form Segmented Account Types', text: 'Shopify Merchant ($19/mo)' },

    // Section 8
    { name: 'Section 8: Brand Positioning Statement', text: 'Real-time Google Merchant Center telemetry' },
    { name: 'Section 8: Static Status Pill Badge', text: 'Merchant API v1 Telemetry: Operational' },
    { name: 'Section 8: Legal Navigation', text: 'Legal &amp; Compliance' }
  ];

  for (const item of requiredPhrases) {
    assert(html.includes(item.text), item.name, `Missing text: "${item.text}"`);
  }

  // 3. Test Section Sequential Order in Rendered HTML
  console.log('\n[TEST GROUP 3] Strict Conversion Order Verification');
  const sectionOrderKeys = [
    { name: 'Section 1: Cost of Silence', key: 'id="cost-of-silence"' },
    { name: 'Section 2: Remediation Pipeline', key: 'The 3-Step Pipeline' },
    { name: 'Section 3: Architecture Comparison', key: 'id="architecture"' },
    { name: 'Section 4: Slack Preview', key: 'id="diagnostics"' },
    { name: 'Section 5: FAQ Section', key: 'id="faq"' },
    { name: 'Section 6: Pricing Matrix', key: 'id="pricing"' },
    { name: 'Section 7: Pilot Application Form', key: 'id="pilot-application"' },
    { name: 'Section 8: Technical Footer', key: 'Merchant API v1 Telemetry: Operational' }
  ];

  let lastIndex = -1;
  let orderPreserved = true;
  for (const sec of sectionOrderKeys) {
    const idx = html.indexOf(sec.key);
    if (idx === -1) {
      assert(false, `Order verification: ${sec.name} present in HTML`, 'Not found');
      orderPreserved = false;
    } else if (idx < lastIndex) {
      assert(false, `Order verification: ${sec.name} appears after preceding section`, `Found at ${idx}, previous at ${lastIndex}`);
      orderPreserved = false;
    } else {
      lastIndex = idx;
    }
  }
  assert(orderPreserved, 'All 8 sections strictly follow the required conversion order (1 through 8)');

  // 4. Test Lead Generation API Route
  console.log('\n[TEST GROUP 4] API Route Lead Capture Verification');
  try {
    const validPostRes = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'agency-lead@growthmarketing.com',
        accountType: 'agency',
        website: 'growthmarketing.com',
        catalogSize: '5,000+ SKUs'
      })
    });
    const postData = await validPostRes.json();
    assert(validPostRes.status === 200, 'POST /api/leads valid submission returns 200 OK', `Status: ${validPostRes.status}`);
    assert(postData.success === true, 'POST /api/leads response returns { success: true }', JSON.stringify(postData));
    assert(postData.bookingUrl === 'https://cal.com/kultra/15min-audit', 'POST /api/leads returns direct Cal.com booking link', postData.bookingUrl);

    // Test validation failure
    const invalidPostRes = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '',
        accountType: 'agency'
      })
    });
    assert(invalidPostRes.status === 400, 'POST /api/leads invalid payload returns 400 Bad Request', `Status: ${invalidPostRes.status}`);
  } catch (err) {
    assert(false, 'API route execution without throwing', err.message);
  }

  // 5. Test GEMINI.md Restraint Audit across Source Code
  console.log('\n[TEST GROUP 5] GEMINI.md Restraint Standards Audit');
  const componentDir = path.join(__dirname, '../src/components');
  const files = fs.readdirSync(componentDir).filter((f) => f.endsWith('.tsx'));

  let glowFound = false;
  let pulseFound = false;
  let emDashFound = false;
  let middleDotFound = false;
  let uppercaseFound = false;
  let emojiFound = false;

  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  for (const file of files) {
    const content = fs.readFileSync(path.join(componentDir, file), 'utf8');
    if (content.includes('animate-pulse')) pulseFound = true;
    if (content.includes('—')) emDashFound = true;
    if (content.includes('·')) middleDotFound = true;
    if (content.includes('uppercase')) uppercaseFound = true;
    if (emojiRegex.test(content)) emojiFound = true;
    if (content.includes('text-glow') || content.includes('box-glow')) glowFound = true;
  }

  assert(!pulseFound, 'Zero Pulsing or Blinking (no animate-pulse in any component)');
  assert(!emDashFound, 'Zero Em-Dashes (no — character anywhere in copy)');
  assert(!middleDotFound, 'Zero Middle-Dots (no · strings)');
  assert(!uppercaseFound, 'Zero ALL-CAPS (no uppercase class in any component)');
  assert(!emojiFound, 'Zero Unicode Emojis (SVG glyphs only)');
  assert(!glowFound, 'Zero Glows or luminous shadows');

  // 6. Test Sparse Section Network Canvas Integration
  console.log('\n[TEST GROUP 6] Sparse Section Network Mesh Verification');
  const sectionsWithNetwork = [
    'CostOfSilence.tsx',
    'RemediationPipeline.tsx',
    'ArchitectureComparison.tsx',
    'SlackPreview.tsx',
    'FaqSection.tsx',
    'PricingMatrix.tsx',
    'PilotApplicationForm.tsx'
  ];

  for (const comp of sectionsWithNetwork) {
    const compContent = fs.readFileSync(path.join(componentDir, comp), 'utf8');
    assert(
      compContent.includes('SectionNetworkCanvas'),
      `Sparse network canvas integrated in ${comp}`,
      `Missing SectionNetworkCanvas in ${comp}`
    );
  }

  const shapesPath = path.join(componentDir, 'AbstractShapes.tsx');
  assert(!fs.existsSync(shapesPath), 'AbstractShapes.tsx removed cleanly');

  // 7. Test Anti-AI Slop & Universal Satoshi Font
  console.log('\n[TEST GROUP 7] Anti-AI Slop & Universal Satoshi Font Verification');
  
  // Check for no "//" in rendered HTML copy (outside http/https URLs)
  const renderedLinesWithoutUrls = html
    .split('\n')
    .filter((line) => !line.includes('http://') && !line.includes('https://') && !line.includes('<script') && !line.includes('schema.org'));
  
  const slashBadgeFound = renderedLinesWithoutUrls.some((line) => line.includes(' // '));
  assert(!slashBadgeFound, 'Zero "//" section number badges rendered in HTML');

  // Verify globals.css enforces universal Satoshi
  const globalsCss = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8');
  assert(
    globalsCss.includes("font-family: 'Satoshi', sans-serif !important;"),
    'Universal Satoshi font enforced in globals.css for all elements'
  );

  // Verify tailwind.config.ts configures Satoshi for all font families
  const tailwindConfig = fs.readFileSync(path.join(__dirname, '../tailwind.config.ts'), 'utf8');
  assert(
    tailwindConfig.includes('mono: ["\'Satoshi\'", "sans-serif"]') &&
    tailwindConfig.includes('sans: ["\'Satoshi\'", "sans-serif"]'),
    'All font families (sans, mono, display) configured to Satoshi in tailwind.config.ts'
  );

  // Verify zero JetBrains Mono font imports in globals.css
  assert(!globalsCss.includes('JetBrains+Mono'), 'Zero JetBrains Mono imported in globals.css');

  // Verify zero decorative macOS window chrome dots in SlackPreview.tsx
  const slackPreviewCode = fs.readFileSync(path.join(componentDir, 'SlackPreview.tsx'), 'utf8');
  assert(!slackPreviewCode.includes('rounded-full bg-[#1E293B]'), 'Zero fake window chrome dots in SlackPreview.tsx');

  // Verify zero Sparkles AI icon in PricingMatrix.tsx
  const pricingCode = fs.readFileSync(path.join(componentDir, 'PricingMatrix.tsx'), 'utf8');
  assert(!pricingCode.includes('Sparkles'), 'Zero AI Sparkles glyphs in PricingMatrix.tsx');

  // Verify zero fake window circles in DashboardIllustration.tsx
  const dashCode = fs.readFileSync(path.join(componentDir, 'DashboardIllustration.tsx'), 'utf8');
  assert(!dashCode.includes('<circle cx="32" cy="27"'), 'Zero fake window circles in DashboardIllustration.tsx');
  assert(dashCode.includes("font-family: 'Satoshi', -apple-system, sans-serif !important;"), 'Satoshi embedded in DashboardIllustration SVG style');

  // Verify authentic product photo replaces distorted SVG wireframe in dashboard
  const productImgPath = path.join(__dirname, '../public/assets/alpine-anorak.jpg');
  assert(fs.existsSync(productImgPath), 'Authentic Alpine Anorak product image exists in public/assets');
  assert(dashCode.includes('href="/assets/alpine-anorak.jpg"'), 'DashboardIllustration embeds authentic Alpine Anorak product photo');
  assert(!dashCode.includes('M 28 32 L 36 24'), 'Distorted SVG polygon path deleted from DashboardIllustration');

  // Summary
  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
