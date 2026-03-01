const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = path.join('C:', 'Users', 'vlcan', 'OneDrive', 'Desktop', 'conv insights website', 'conv insights.png');
const OUT = path.join('C:', 'Users', 'vlcan', 'OneDrive', 'Desktop', 'conv insights website');

async function run() {
  const meta = await sharp(SRC).metadata();
  console.log('Source:', meta.width, 'x', meta.height);

  // Crop the spiral pinwheel icon only (no "c" letterform).
  // Source is 1105x311. The spiral is roughly centered vertically.
  // Extract the icon region, then extend to a square with white padding.
  const cropLeft = 15;
  const cropTop = 15;
  const cropWidth = 205;
  const cropHeight = 280;

  // Extract the icon region and pad to square (280x280)
  const padLeft = Math.round((cropHeight - cropWidth) / 2);  // 25px each side
  const padRight = cropHeight - cropWidth - padLeft;

  const iconBuffer = await sharp(SRC)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .extend({
      left: padLeft,
      right: padRight,
      top: 0,
      bottom: 0,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toBuffer();

  // Save a preview
  await sharp(iconBuffer).toFile(path.join(OUT, 'icon-crop-preview.png'));
  console.log('Preview saved (280x280 padded square)');

  // favicon-32x32.png
  await sharp(iconBuffer).resize(32, 32).png().toFile(path.join(OUT, 'favicon-32x32.png'));
  console.log('Created favicon-32x32.png');

  // favicon-16x16.png
  await sharp(iconBuffer).resize(16, 16).png().toFile(path.join(OUT, 'favicon-16x16.png'));
  console.log('Created favicon-16x16.png');

  // icon-192.png for PWA
  await sharp(iconBuffer).resize(192, 192).png().toFile(path.join(OUT, 'icon-192.png'));
  console.log('Created icon-192.png');

  // icon-512.png for PWA
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(OUT, 'icon-512.png'));
  console.log('Created icon-512.png');

  // apple-touch-icon.png — 180x180
  await sharp(iconBuffer).resize(180, 180).png().toFile(path.join(OUT, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // og-image.png — 1200x630 with icon centered on white background
  const ogIconSize = 400;
  const ogIcon = await sharp(iconBuffer).resize(ogIconSize, ogIconSize).png().toBuffer();

  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
    .composite([{
      input: ogIcon,
      left: Math.round((1200 - ogIconSize) / 2),
      top: Math.round((630 - ogIconSize) / 2)
    }])
    .png()
    .toFile(path.join(OUT, 'og-image.png'));
  console.log('Created og-image.png (1200x630)');

  // site.webmanifest
  const manifest = {
    name: "Conversion Insights",
    short_name: "CI",
    description: "Strategic AI Advisory — From CX to AX",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6b7c2a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  };
  fs.writeFileSync(path.join(OUT, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('Created site.webmanifest');

  console.log('\nAll assets generated!');
}

run().catch(err => { console.error(err); process.exit(1); });
