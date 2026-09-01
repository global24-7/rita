const sharp = require('sharp');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#E8E4DE"/>
  <text x="32" y="46" font-family="Georgia, serif" font-size="38" font-weight="700" fill="#2D2D2D" text-anchor="middle" letter-spacing="-2">RJ</text>
</svg>`;

const buf = Buffer.from(svg);

async function generate() {
  await sharp(buf).resize(16, 16).png().toFile('./public/favicon-16x16.png');
  await sharp(buf).resize(32, 32).png().toFile('./public/favicon-32x32.png');
  await sharp(buf).resize(180, 180).png().toFile('./public/apple-touch-icon.png');
  await sharp(buf).resize(192, 192).png().toFile('./public/android-chrome-192x192.png');
  await sharp(buf).resize(512, 512).png().toFile('./public/android-chrome-512x512.png');
  console.log('All favicons generated');
}

generate().catch(console.error);
