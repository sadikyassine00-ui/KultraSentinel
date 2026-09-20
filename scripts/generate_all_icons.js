const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Master SVG template at 512x512 with high precision vector definitions
function getSvg(size, rxRatio = 0.22, paddingRatio = 1.0) {
  const rx = Math.round(size * rxRatio);
  const strokeW = Math.max(1, Math.round(size * 0.015));
  const scale = (size / 48) * paddingRatio;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" fill="none">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#0a0b0d"/>
  <rect x="${strokeW / 2}" y="${strokeW / 2}" width="${size - strokeW}" height="${size - strokeW}" rx="${rx - strokeW / 2}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="${strokeW}"/>
  <g transform="translate(${size / 2}, ${size / 2}) scale(${scale * 1.05}) translate(-21.55, -19.25)">
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
  </g>
</svg>
`.trim();
}

// Function to construct a valid Windows ICO buffer containing PNG frames
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let currentOffset = headerSize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(count, 4); // count

  const entries = [];
  for (const { buffer, size } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buffer.length, 8); // size
    entry.writeUInt32LE(currentOffset, 12); // offset
    entries.push(entry);
    currentOffset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)]);
}

async function main() {
  console.log('Generating all high-resolution brand icons...');
  const publicDir = path.join(__dirname, '../public');
  const appDir = path.join(__dirname, '../src/app');

  // 1. Master SVG
  const masterSvg48 = getSvg(48, 0.22);
  const masterSvg512 = getSvg(512, 0.22);
  const maskableSvg512 = getSvg(512, 0, 0.75); // 0 radius full bleed with 75% scale for Android maskable

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), masterSvg48);
  fs.writeFileSync(path.join(appDir, 'icon.svg'), masterSvg48);
  console.log('  ✓ Generated favicon.svg and src/app/icon.svg');

  // 2. Render PNG sizes
  const sizesToGenerate = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-120x120.png', size: 120 },
    { name: 'apple-touch-icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    { name: 'apple-touch-icon-precomposed.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'mstile-70x70.png', size: 70 },
    { name: 'mstile-150x150.png', size: 150 },
    { name: 'mstile-310x310.png', size: 310 },
  ];

  for (const item of sizesToGenerate) {
    const svgSource = item.size >= 120 ? masterSvg512 : getSvg(item.size, 0.22);
    const pngBuf = await sharp(Buffer.from(svgSource)).resize(item.size, item.size).png().toBuffer();
    fs.writeFileSync(path.join(publicDir, item.name), pngBuf);
  }
  console.log(`  ✓ Generated ${sizesToGenerate.length} PNG icons in public/`);

  // Maskable icon
  const maskableBuf = await sharp(Buffer.from(maskableSvg512)).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), maskableBuf);
  console.log('  ✓ Generated maskable-icon-512x512.png');

  // Apple icon in src/app
  const apple180 = await sharp(Buffer.from(masterSvg512)).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), apple180);
  console.log('  ✓ Generated src/app/apple-icon.png');

  // 3. Multi-resolution ICO (16x16, 32x32, 48x48)
  const icoSizes = [16, 32, 48];
  const icoFrames = [];
  for (const size of icoSizes) {
    const buf = await sharp(Buffer.from(getSvg(size, 0.22))).resize(size, size).png().toBuffer();
    icoFrames.push({ buffer: buf, size });
  }

  const icoBuffer = createIco(icoFrames);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('  ✓ Generated valid multi-resolution favicon.ico in public/ and src/app/');

  console.log('\nAll brand icons generated successfully!');
}

main().catch(console.error);
