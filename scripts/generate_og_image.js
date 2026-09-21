const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0b0d" />
      <stop offset="100%" stop-color="#0d0e12" />
    </linearGradient>
    <radialGradient id="signal-wash" cx="90%" cy="10%" r="60%">
      <stop offset="0%" stop-color="#f2a93b" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#0a0b0d" stop-opacity="0" />
    </radialGradient>
    <style>
      .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .font-mono { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; }
    </style>
  </defs>

  <!-- Background Base -->
  <rect width="${width}" height="${height}" fill="url(#bg-gradient)" />
  <rect width="${width}" height="${height}" fill="url(#signal-wash)" />

  <!-- Outer Hairline Border -->
  <rect x="1" y="1" width="1198" height="628" rx="8" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

  <!-- Top Navigation / Brand Header -->
  <g transform="translate(60, 40)">
    <!-- Authentic Kultra Logo Mark -->
    <g transform="scale(1.2)">
      <line x1="20" y1="20" x2="6" y2="10"  stroke="#3a3d43" stroke-width="1.2"/>
      <line x1="20" y1="20" x2="8" y2="32"  stroke="#3a3d43" stroke-width="1.2"/>
      <line x1="20" y1="20" x2="33" y2="33" stroke="#3a3d43" stroke-width="1.2"/>
      <line x1="20" y1="20" x2="34" y2="9"  stroke="#f2a93b" stroke-width="1.6"/>

      <circle cx="6"  cy="10" r="2.4" fill="#3a3d43"/>
      <circle cx="8"  cy="32" r="2.4" fill="#3a3d43"/>
      <circle cx="33" cy="33" r="2"   fill="#3a3d43"/>
      <circle cx="34" cy="9"  r="3"   fill="#f2a93b"/>
      <circle cx="34" cy="9"  r="5.5" fill="none" stroke="#f2a93b" stroke-width="1" opacity="0.35"/>

      <circle cx="20" cy="20" r="4.5" fill="#f2a93b"/>
      <circle cx="20" cy="20" r="4.5" fill="none" stroke="#0a0b0d" stroke-width="1.5"/>

      <text x="46" y="25" class="font-sans" font-weight="800" font-size="22" letter-spacing="1.5" fill="#f4f1ea">KULTRA</text>
    </g>

    <!-- Header Status Pill -->
    <g transform="translate(900, 4)">
      <rect x="0" y="0" width="180" height="28" rx="14" fill="rgba(242,169,59,0.08)" stroke="rgba(242,169,59,0.3)" stroke-width="1" />
      <circle cx="16" cy="14" r="3.5" fill="#f2a93b" />
      <text x="28" y="18" class="font-mono" font-size="11" font-weight="600" fill="#f2a93b" letter-spacing="0.5">SUB-30S DETECTION</text>
    </g>
  </g>

  <!-- Value Headline -->
  <g transform="translate(60, 125)">
    <text x="0" y="0" class="font-sans" font-size="36" font-weight="700" fill="#f4f1ea" letter-spacing="-0.5">
      Real-Time Google Merchant Center
    </text>
    <text x="0" y="46" class="font-sans" font-size="36" font-weight="700" fill="#f2a93b" letter-spacing="-0.5">
      Disapproval Alerts in Slack
    </text>
    <text x="0" y="86" class="font-sans" font-size="16" font-weight="400" fill="#b9b3a5">
      Instant Cloud Pub/Sub incident dispatch with direct one-click fix links before ad spend bleeds.
    </text>
  </g>

  <!-- Product Proof: Realistic Slack Notification UI -->
  <g transform="translate(60, 248)">
    <!-- Main Slack Card Shell -->
    <rect x="0" y="0" width="1080" height="340" rx="8" fill="#0e0f11" stroke="rgba(255,255,255,0.09)" stroke-width="1" />

    <!-- Slack Channel Ribbon Bar -->
    <rect x="0" y="0" width="1080" height="42" rx="8" fill="#131418" />
    <rect x="0" y="34" width="1080" height="8" fill="#131418" />
    <line x1="0" y1="42" x2="1080" y2="42" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

    <!-- Channel Title & Indicators -->
    <text x="20" y="26" class="font-mono" font-size="13" font-weight="600" fill="#f4f1ea">#alerts-google-merchant</text>
    <line x1="210" y1="14" x2="210" y2="30" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
    <text x="225" y="26" class="font-mono" font-size="11" fill="#6b7078">Webhook active</text>
    <circle cx="340" cy="22" r="3.5" fill="#f2a93b" />
    <text x="352" y="26" class="font-mono" font-size="11" fill="#f2a93b">Pub/Sub push live</text>

    <!-- Slack Message Body -->
    <g transform="translate(24, 60)">
      <!-- Bot Avatar & Name Header -->
      <rect x="0" y="0" width="36" height="36" rx="4" fill="#181a20" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
      <!-- Mini Kultra Icon inside avatar -->
      <circle cx="18" cy="18" r="4.5" fill="#f2a93b" />

      <text x="48" y="16" class="font-sans" font-size="15" font-weight="700" fill="#f4f1ea">Kultra Alerts</text>
      <rect x="146" y="5" width="36" height="16" rx="3" fill="#1f2128" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
      <text x="155" y="17" class="font-mono" font-size="9" font-weight="600" fill="#6b7078">APP</text>
      <text x="194" y="16" class="font-mono" font-size="12" fill="#6b7078">10:42:18 UTC</text>

      <!-- Attached Alert Block with Red Left Accent -->
      <g transform="translate(48, 30)">
        <!-- Alert Box Container -->
        <rect x="0" y="0" width="970" height="195" rx="4" fill="#131418" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        <!-- Red Left Accent Bar (§1 semantic danger) -->
        <rect x="0" y="0" width="5" height="195" rx="2" fill="#d64545" />

        <g transform="translate(20, 20)">
          <!-- Urgency Badge + Risk Metric -->
          <rect x="0" y="0" width="168" height="24" rx="12" fill="rgba(214,69,69,0.12)" stroke="rgba(214,69,69,0.4)" stroke-width="1" />
          <text x="12" y="16" class="font-mono" font-size="10.5" font-weight="700" fill="#d64545">BESTSELLER DISAPPROVAL</text>
          <text x="184" y="17" class="font-mono" font-size="12" font-weight="600" fill="#d64545">14,280 clicks / 30d at risk</text>

          <!-- Product Title -->
          <text x="0" y="50" class="font-sans" font-size="17" font-weight="700" fill="#f4f1ea">
            Apex Waterproof Trail Runner / Carbon / 10.5
          </text>

          <!-- Product Metadata Row -->
          <text x="0" y="74" class="font-mono" font-size="12" fill="#6b7078">
            SKU: APX-TR-402    ID: US-8492049182    Price: $168.00 USD
          </text>

          <!-- Root Cause Diagnostic Box -->
          <g transform="translate(0, 92)">
            <rect x="0" y="0" width="710" height="54" rx="4" fill="#0a0b0d" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
            <text x="14" y="22" class="font-sans" font-size="12" font-weight="600" fill="#6b7078">Root cause diagnosis:</text>
            <text x="150" y="22" class="font-mono" font-size="11.5" font-weight="600" fill="#d64545">
              item_disapproved: promotional_overlay_image [image_link]
            </text>
            <text x="14" y="42" class="font-sans" font-size="12" fill="#b9b3a5">
              Product image contains promotional text or badge overlay, violating Google Shopping image standards.
            </text>
          </g>

          <!-- One-Click Fix CTA Button -->
          <g transform="translate(735, 96)">
            <rect x="0" y="0" width="195" height="46" rx="4" fill="#f2a93b" />
            <text x="24" y="28" class="font-sans" font-size="13" font-weight="700" fill="#1a1305">
              Edit in Shopify Admin →
            </text>
          </g>
        </g>
      </g>
    </g>
  </g>
</svg>`;

  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(outputPath);

  console.log('Successfully generated public/og-image.png (1200x630)');
}

generateOgImage().catch((err) => {
  console.error('Error generating OG image:', err);
  process.exit(1);
});
