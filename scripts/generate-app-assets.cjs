const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ROOT_APP = path.resolve(__dirname, '..');
const SOURCE_ICON = path.join(ROOT_APP, 'public', 'pwa-512x512.png');
const IOS_ASSETS = path.join(ROOT_APP, 'ios', 'App', 'App', 'Assets.xcassets');
const ANDROID_RES = path.join(ROOT_APP, 'android', 'app', 'src', 'main', 'res');

async function main() {
  console.log('🚀 Starting App Assets Generation (iOS & Android)...');

  if (!fs.existsSync(SOURCE_ICON)) {
    throw new Error(`Source icon not found at ${SOURCE_ICON}`);
  }

  // 1. Generate 1024x1024 Master Icon for iOS (24-bit RGB, solid, no alpha)
  const iosAppIconDir = path.join(IOS_ASSETS, 'AppIcon.appiconset');
  fs.mkdirSync(iosAppIconDir, { recursive: true });
  const iosMasterPath = path.join(iosAppIconDir, 'AppIcon-512@2x.png');

  await sharp(SOURCE_ICON)
    .resize(1024, 1024, { kernel: sharp.kernel.lanczos3 })
    .removeAlpha() // iOS App Store strictly requires no alpha channel in AppIcon
    .png()
    .toFile(iosMasterPath);

  console.log('✅ Generated iOS AppIcon-512@2x.png (1024x1024, RGB solid)');

  // 2. Generate Android Mipmap Icons
  const androidMipmaps = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  for (const item of androidMipmaps) {
    const targetDir = path.join(ANDROID_RES, item.dir);
    fs.mkdirSync(targetDir, { recursive: true });

    // ic_launcher.png (Square / standard)
    await sharp(SOURCE_ICON)
      .resize(item.size, item.size, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // ic_launcher_round.png (Circular mask)
    const circleSvg = Buffer.from(
      `<svg width="${item.size}" height="${item.size}"><circle cx="${item.size / 2}" cy="${item.size / 2}" r="${item.size / 2}" fill="#fff" /></svg>`
    );
    await sharp(SOURCE_ICON)
      .resize(item.size, item.size, { kernel: sharp.kernel.lanczos3 })
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png (Adaptive icon foreground with 66% safe zone padding)
    const innerSize = Math.round(item.fgSize * 0.72);
    const innerBuffer = await sharp(SOURCE_ICON)
      .resize(innerSize, innerSize, { fit: 'contain' })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: item.fgSize,
        height: item.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: innerBuffer, gravity: 'centre' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`✅ Generated Android ${item.dir} (${item.size}px launcher & ${item.fgSize}px foreground)`);
  }

  // 3. Generate iOS Splash Screens (2732x2732)
  const iosSplashDir = path.join(IOS_ASSETS, 'Splash.imageset');
  fs.mkdirSync(iosSplashDir, { recursive: true });

  const splashLogoBuffer = await sharp(SOURCE_ICON)
    .resize(900, 900, { fit: 'contain' })
    .png()
    .toBuffer();

  const iosSplashBuffer = await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 3,
      background: { r: 17, g: 17, b: 19 }, // #111113 brand background
    },
  })
    .composite([{ input: splashLogoBuffer, gravity: 'centre' }])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(iosSplashDir, 'splash-2732x2732.png'), iosSplashBuffer);
  fs.writeFileSync(path.join(iosSplashDir, 'splash-2732x2732-1.png'), iosSplashBuffer);
  fs.writeFileSync(path.join(iosSplashDir, 'splash-2732x2732-2.png'), iosSplashBuffer);
  console.log('✅ Generated iOS Splash screens (2732x2732, #111113 dark theme)');

  // 4. Generate Android Splash Screens
  const androidSplashes = [
    { dir: 'drawable', width: 480, height: 320, logoSize: 180 },
    { dir: 'drawable-port-mdpi', width: 320, height: 480, logoSize: 160 },
    { dir: 'drawable-port-hdpi', width: 480, height: 800, logoSize: 240 },
    { dir: 'drawable-port-xhdpi', width: 720, height: 1280, logoSize: 340 },
    { dir: 'drawable-port-xxhdpi', width: 960, height: 1600, logoSize: 450 },
    { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920, logoSize: 600 },
    { dir: 'drawable-land-mdpi', width: 480, height: 320, logoSize: 180 },
    { dir: 'drawable-land-hdpi', width: 800, height: 480, logoSize: 240 },
    { dir: 'drawable-land-xhdpi', width: 1280, height: 720, logoSize: 340 },
    { dir: 'drawable-land-xxhdpi', width: 1600, height: 960, logoSize: 450 },
    { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280, logoSize: 550 },
  ];

  for (const s of androidSplashes) {
    const splashDir = path.join(ANDROID_RES, s.dir);
    fs.mkdirSync(splashDir, { recursive: true });

    const logoBuf = await sharp(SOURCE_ICON)
      .resize(s.logoSize, s.logoSize, { fit: 'contain' })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: s.width,
        height: s.height,
        channels: 3,
        background: { r: 17, g: 17, b: 19 },
      },
    })
      .composite([{ input: logoBuf, gravity: 'centre' }])
      .png()
      .toFile(path.join(splashDir, 'splash.png'));

    console.log(`✅ Generated Android splash for ${s.dir} (${s.width}x${s.height})`);
  }

  console.log('🎉 All mobile app icons & splash assets generated successfully!');
}

main().catch((err) => {
  console.error('❌ Error generating assets:', err);
  process.exit(1);
});
