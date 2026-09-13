const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + (dirEntrySize * count);

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // count

  const dirEntries = [];
  for (const img of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(img.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(img => img.buffer)]);
}

async function run() {
  const faviconSource = 'public/assets/logos/kultraFavicon.png';
  const logoSource = 'public/assets/logos/kultraLogo.png';
  
  // 1. Trim kultraFavicon
  const trimmedFaviconBuffer = await sharp(faviconSource).trim().toBuffer();
  
  // Helper to create square icon with custom inner padding ratio
  async function makeSquareIcon(size, paddingRatio = 0.88, bg = { r: 0, g: 0, b: 0, alpha: 0 }) {
    const innerSize = Math.max(1, Math.round(size * paddingRatio));
    const innerBuf = await sharp(trimmedFaviconBuffer)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    return await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: bg
      }
    })
    .composite([{ input: innerBuf, gravity: 'center' }])
    .png()
    .toBuffer();
  }

  // Favicon PNG sizes
  const sizes = [16, 32, 48, 64, 96, 120, 128, 144, 152, 180, 192, 256, 384, 512];
  const generatedIcons = {};

  for (const s of sizes) {
    const pad = s <= 48 ? 0.94 : (s <= 180 ? 0.86 : 0.82);
    const buf = await makeSquareIcon(s, pad);
    generatedIcons[s] = buf;
  }

  // Ensure directories
  if (!fs.existsSync('public')) fs.mkdirSync('public', { recursive: true });
  if (!fs.existsSync('src/app')) fs.mkdirSync('src/app', { recursive: true });

  // Standard web favicons
  fs.writeFileSync('public/favicon-16x16.png', generatedIcons[16]);
  fs.writeFileSync('public/favicon-32x32.png', generatedIcons[32]);
  fs.writeFileSync('public/favicon-48x48.png', generatedIcons[48]);
  fs.writeFileSync('public/favicon-96x96.png', generatedIcons[96]);

  // Apple touch icons
  fs.writeFileSync('public/apple-touch-icon.png', generatedIcons[180]);
  fs.writeFileSync('public/apple-touch-icon-180x180.png', generatedIcons[180]);
  fs.writeFileSync('public/apple-touch-icon-152x152.png', generatedIcons[152]);
  fs.writeFileSync('public/apple-touch-icon-120x120.png', generatedIcons[120]);
  fs.writeFileSync('public/apple-touch-icon-precomposed.png', generatedIcons[180]);
  fs.writeFileSync('src/app/apple-icon.png', generatedIcons[180]);

  // Android / PWA icons
  fs.writeFileSync('public/android-chrome-192x192.png', generatedIcons[192]);
  fs.writeFileSync('public/android-chrome-512x512.png', generatedIcons[512]);
  fs.writeFileSync('public/icon-192.png', generatedIcons[192]);
  fs.writeFileSync('public/icon-512.png', generatedIcons[512]);
  fs.writeFileSync('src/app/icon.png', generatedIcons[512]);

  // Maskable icon with solid background (#0a0b1d) and safe zone for PWA
  const maskable512 = await makeSquareIcon(512, 0.68, { r: 10, g: 11, b: 29, alpha: 1 });
  fs.writeFileSync('public/maskable-icon-512x512.png', maskable512);

  // Microsoft Tiles
  fs.writeFileSync('public/mstile-150x150.png', generatedIcons[152]);
  fs.writeFileSync('public/mstile-310x310.png', generatedIcons[384]);
  fs.writeFileSync('public/mstile-70x70.png', generatedIcons[64]);

  // Multi-size ICO (16, 32, 48)
  const icoBuf = createIco([
    { width: 16, height: 16, buffer: generatedIcons[16] },
    { width: 32, height: 32, buffer: generatedIcons[32] },
    { width: 48, height: 48, buffer: generatedIcons[48] }
  ]);
  fs.writeFileSync('public/favicon.ico', icoBuf);
  fs.writeFileSync('src/app/favicon.ico', icoBuf);

  // 2. Trimmed Horizontal Logo
  const trimmedLogoBuffer = await sharp(logoSource).trim().toBuffer();
  const trimmedLogoMeta = await sharp(trimmedLogoBuffer).metadata();
  const padW = trimmedLogoMeta.width + 16;
  const padH = trimmedLogoMeta.height + 16;
  const framedLogo = await sharp({
    create: {
      width: padW,
      height: padH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: trimmedLogoBuffer, gravity: 'center' }])
  .png()
  .toBuffer();

  fs.writeFileSync('public/assets/logos/kultraLogo-trimmed.png', framedLogo);
  console.log('Trimmed logo saved: kultraLogo-trimmed.png (' + padW + 'x' + padH + ')');

  // 3. Generate SVG Favicon for modern browser tabs
  const favPngBase64 = generatedIcons[180].toString('base64');
  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="100%" height="100%">
  <image width="180" height="180" href="data:image/png;base64,${favPngBase64}" />
</svg>
`;
  fs.writeFileSync('public/favicon.svg', svgFavicon);
  fs.writeFileSync('src/app/icon.svg', svgFavicon);

  // 4. OpenGraph Social Card (1200x630)
  const ogLogo = await sharp(framedLogo)
    .resize(540, null, { fit: 'inside' })
    .toBuffer();
  const ogLogoMeta = await sharp(ogLogo).metadata();

  const ogImage = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 10, g: 11, b: 29, alpha: 1 } // #0a0b1d
    }
  })
  .composite([
    {
      input: ogLogo,
      top: Math.round((630 - ogLogoMeta.height) / 2),
      left: Math.round((1200 - ogLogoMeta.width) / 2)
    }
  ])
  .png()
  .toBuffer();
  fs.writeFileSync('public/og-image.png', ogImage);

  // 5. site.webmanifest
  const webmanifest = {
    name: 'Kultra: Google Merchant Center Disapproval Watchdog',
    short_name: 'Kultra',
    description: 'Instant alerts before policy changes kill your bestselling Google Merchant ads.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0b1d',
    theme_color: '#FF788D',
    icons: [
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
  fs.writeFileSync('public/site.webmanifest', JSON.stringify(webmanifest, null, 2));
  fs.writeFileSync('public/manifest.json', JSON.stringify(webmanifest, null, 2));

  // 6. browserconfig.xml for Windows
  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <notification>
            <polling-frequency-in-minutes>1440</polling-frequency-in-minutes>
        </notification>
        <windows>
            <square70x70logo src="/mstile-70x70.png"/>
            <square150x150logo src="/mstile-150x150.png"/>
            <square310x310logo src="/mstile-310x310.png"/>
            <TileColor>#0a0b1d</TileColor>
        </windows>
    </msapplication>
</browserconfig>
`;
  fs.writeFileSync('public/browserconfig.xml', browserconfig);

  console.log('SUCCESS: All favicons, manifests, and trimmed logos generated successfully!');
}

run().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
