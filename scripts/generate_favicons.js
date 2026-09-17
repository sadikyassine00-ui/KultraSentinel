const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Perfectly Trimmed Vector SVG for kultra-logo-horizontal.svg (Primary Logo)
// ViewBox: 128x36. Symmetrical 2px padding on Left/Right and Top/Bottom.
const horizontalSvgContent = `<svg width="128" height="36" viewBox="0 0 128 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- mark: a ghost network with one live signal connection -->
  <g transform="translate(-1, -1)">
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
  </g>

  <!-- wordmark in Inter 700 uppercase -->
  <text x="44.5" y="24" font-family="Inter, -apple-system, sans-serif" font-weight="700" font-size="20" letter-spacing="0.5" fill="#f4f1ea">KULTRA</text>
</svg>`;

// The reusable vector mark centered at (21.55, 19.25)
const markElements = `
  <line x1="20" y1="20" x2="6" y2="10"  stroke="#6b7078" stroke-width="1.4"/>
  <line x1="20" y1="20" x2="8" y2="32"  stroke="#6b7078" stroke-width="1.4"/>
  <line x1="20" y1="20" x2="33" y2="33" stroke="#6b7078" stroke-width="1.4"/>
  <line x1="20" y1="20" x2="34" y2="9"  stroke="#f2a93b" stroke-width="1.8"/>

  <circle cx="6"  cy="10" r="2.6" fill="#6b7078"/>
  <circle cx="8"  cy="32" r="2.6" fill="#6b7078"/>
  <circle cx="33" cy="33" r="2.2" fill="#6b7078"/>
  <circle cx="34" cy="9"  r="3.2" fill="#f2a93b"/>
  <circle cx="34" cy="9"  r="5.5" fill="none" stroke="#f2a93b" stroke-width="1" opacity="0.4"/>

  <circle cx="20" cy="20" r="4.8" fill="#f2a93b"/>
  <circle cx="20" cy="20" r="4.8" fill="none" stroke="#0a0b0d" stroke-width="1.5"/>
`;

// 2. Pure Vector Icon Mark (transparent background, exact center)
const pureIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none">
  <g transform="translate(24, 24) scale(1.05) translate(-21.55, -19.25)">
    ${markElements}
  </g>
</svg>`;

// 3. Favicon Vector SVG with dark surface container (exact center)
const faviconTileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none">
  <rect width="48" height="48" rx="10" fill="#0a0b0d"/>
  <rect x="0.5" y="0.5" width="47" height="47" rx="9.5" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <g transform="translate(24, 24) scale(1.05) translate(-21.55, -19.25)">
    ${markElements}
  </g>
</svg>`;

// 4. Apple Touch Icon (180x180 solid background, exact center)
const touchIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180" fill="none">
  <rect width="180" height="180" fill="#0a0b0d"/>
  <g transform="translate(90, 90) scale(3.0) translate(-21.55, -19.25)">
    ${markElements}
  </g>
</svg>`;

// 5. Standard PWA Icon (512x512 solid background, exact center)
const pwaIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <rect width="512" height="512" fill="#0a0b0d"/>
  <g transform="translate(256, 256) scale(8.8) translate(-21.55, -19.25)">
    ${markElements}
  </g>
</svg>`;

// 6. Maskable Icon (512x512 with safe-zone margin, exact center)
const maskableIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <rect width="512" height="512" fill="#0a0b0d"/>
  <g transform="translate(256, 256) scale(7.5) translate(-21.55, -19.25)">
    ${markElements}
  </g>
</svg>`;

/**
 * Creates an ICO binary buffer from an array of PNG buffers
 * @param {Array<{size: number, buffer: Buffer}>} images
 */
function createIco(images) {
  const count = images.length;
  const headerSize = 6;
  const entrySize = 16;
  const totalHeaderSize = headerSize + count * entrySize;

  let currentOffset = totalHeaderSize;
  const entries = [];

  for (const img of images) {
    const width = img.size >= 256 ? 0 : img.size;
    const height = img.size >= 256 ? 0 : img.size;
    const size = img.buffer.length;
    const offset = currentOffset;

    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(width, 0); // Width
    entry.writeUInt8(height, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(size, 8); // Image size in bytes
    entry.writeUInt32LE(offset, 12); // Offset in file
    entries.push(entry);

    currentOffset += size;
  }

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  return Buffer.concat([header, ...entries, ...images.map((i) => i.buffer)]);
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  const logosDir = path.join(publicDir, 'assets', 'logos');

  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }

  console.log('1. Saving trimmed primary horizontal logo and variants...');
  fs.writeFileSync(path.join(logosDir, 'kultra-logo-horizontal.svg'), horizontalSvgContent, 'utf8');
  fs.writeFileSync(path.join(logosDir, 'kultra-horizontal-logo.svg'), horizontalSvgContent, 'utf8');
  fs.writeFileSync(path.join(logosDir, 'kultra-icon.svg'), pureIconSvg, 'utf8');

  // Also write public/favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconTileSvg, 'utf8');

  console.log('2. Generating perfectly centered raster PNG favicons with Sharp...');

  // Standard Favicons
  const png16 = await sharp(Buffer.from(faviconTileSvg)).resize(16, 16).png().toBuffer();
  const png32 = await sharp(Buffer.from(faviconTileSvg)).resize(32, 32).png().toBuffer();
  const png48 = await sharp(Buffer.from(faviconTileSvg)).resize(48, 48).png().toBuffer();
  const png96 = await sharp(Buffer.from(faviconTileSvg)).resize(96, 96).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), png48); // Google search priority
  fs.writeFileSync(path.join(publicDir, 'favicon-96x96.png'), png96);

  // Multi-resolution favicon.ico (16, 32, 48)
  console.log('3. Building multi-resolution favicon.ico...');
  const icoBuffer = createIco([
    { size: 16, buffer: png16 },
    { size: 32, buffer: png32 },
    { size: 48, buffer: png48 },
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  // Apple Touch Icons
  console.log('4. Generating Apple Touch Icons...');
  const apple180 = await sharp(Buffer.from(touchIconSvg)).resize(180, 180).png().toBuffer();
  const apple152 = await sharp(Buffer.from(touchIconSvg)).resize(152, 152).png().toBuffer();
  const apple120 = await sharp(Buffer.from(touchIconSvg)).resize(120, 120).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), apple180);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon-180x180.png'), apple180);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon-152x152.png'), apple152);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon-120x120.png'), apple120);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon-precomposed.png'), apple180);

  // Android / Chrome / PWA
  console.log('5. Generating Android / Chrome PWA Icons...');
  const chrome192 = await sharp(Buffer.from(pwaIconSvg)).resize(192, 192).png().toBuffer();
  const chrome512 = await sharp(Buffer.from(pwaIconSvg)).resize(512, 512).png().toBuffer();
  const maskable512 = await sharp(Buffer.from(maskableIconSvg)).resize(512, 512).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), chrome192);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), chrome512);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), chrome192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), chrome512);
  fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), maskable512);

  // Windows Tiles
  console.log('6. Generating Windows Tiles...');
  const mstile70 = await sharp(Buffer.from(touchIconSvg)).resize(70, 70).png().toBuffer();
  const mstile150 = await sharp(Buffer.from(touchIconSvg)).resize(150, 150).png().toBuffer();
  const mstile310 = await sharp(Buffer.from(touchIconSvg)).resize(310, 310).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'mstile-70x70.png'), mstile70);
  fs.writeFileSync(path.join(publicDir, 'mstile-150x150.png'), mstile150);
  fs.writeFileSync(path.join(publicDir, 'mstile-310x310.png'), mstile310);

  // Fallback PNGs for primary horizontal logo
  console.log('7. Generating horizontal logo PNG fallbacks...');
  const horizontalPng = await sharp(Buffer.from(horizontalSvgContent)).resize(384, 108).png().toBuffer();
  fs.writeFileSync(path.join(logosDir, 'kultra-logo-horizontal.png'), horizontalPng);
  fs.writeFileSync(path.join(logosDir, 'kultra-horizontal-logo.png'), horizontalPng);
  fs.writeFileSync(path.join(logosDir, 'kultraLogo-trimmed.png'), horizontalPng);

  // Social OpenGraph Image (1200x630)
  console.log('8. Generating og-image.png (1200x630)...');
  const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0a0b0d"/>
    <rect x="20" y="20" width="1160" height="590" rx="12" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    
    <!-- Background subtle network lines -->
    <line x1="100" y1="120" x2="320" y2="280" stroke="rgba(255,255,255,0.05)" stroke-width="1.5"/>
    <line x1="320" y1="280" x2="600" y2="180" stroke="rgba(255,255,255,0.05)" stroke-width="1.5"/>
    <line x1="600" y1="180" x2="880" y2="340" stroke="rgba(255,255,255,0.05)" stroke-width="1.5"/>
    <line x1="880" y1="340" x2="1100" y2="220" stroke="rgba(242,169,59,0.12)" stroke-width="1.5"/>
    
    <circle cx="100" cy="120" r="3" fill="rgba(255,255,255,0.15)"/>
    <circle cx="320" cy="280" r="3" fill="rgba(255,255,255,0.15)"/>
    <circle cx="600" cy="180" r="3" fill="rgba(255,255,255,0.15)"/>
    <circle cx="880" cy="340" r="3" fill="rgba(255,255,255,0.15)"/>
    <circle cx="1100" cy="220" r="4" fill="#f2a93b"/>

    <!-- Centered Trimmed Logo -->
    <g transform="translate(446, 175) scale(2.4)">
      <!-- mark -->
      <g transform="translate(-1, -1)">
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
      </g>
      <text x="44.5" y="24" font-family="Inter, -apple-system, sans-serif" font-weight="700" font-size="20" letter-spacing="0.5" fill="#f4f1ea">KULTRA</text>
    </g>

    <!-- Tagline -->
    <text x="600" y="340" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="34" fill="#f4f1ea" letter-spacing="-0.01em">
      Google Merchant Center Disapproval Watchdog
    </text>
    
    <text x="600" y="395" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-weight="400" font-size="18" fill="#b9b3a5">
      Real-time automated catalog feed monitoring and instant disapproval dispatch
    </text>

    <!-- Status pill -->
    <g transform="translate(485, 445)">
      <rect width="230" height="34" rx="17" fill="rgba(242,169,59,0.06)" stroke="#7a5a26" stroke-width="1"/>
      <circle cx="22" cy="17" r="3.5" fill="#f2a93b"/>
      <text x="35" y="22" font-family="Roboto Mono, monospace" font-size="12" font-weight="500" fill="#f2a93b">LIVE FEED MONITORING</text>
    </g>
  </svg>`;

  const ogBuffer = await sharp(Buffer.from(ogSvg)).resize(1200, 630).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogBuffer);

  console.log('All favicons, touch icons, primary logos, and OG image successfully generated and centered!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
