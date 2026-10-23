const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = 4173;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function createStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      // Decode URI components so spaces in filenames (e.g. %20) are handled correctly
      let decodedUrl = decodeURIComponent(req.url.split('?')[0]);
      if (decodedUrl === '/' || decodedUrl === '') decodedUrl = '/index.html';

      const filePath = path.join(DIST_DIR, decodedUrl);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        const indexPath = path.join(DIST_DIR, 'index.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(indexPath).pipe(res);
      }
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Static server running at http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

async function capture() {
  const server = await createStaticServer();

  console.log('Launching headless Chrome with iPhone Pro Max mobile emulation...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--hide-scrollbars',
    ],
  });

  try {
    const page = await browser.newPage();
    // iPhone 14/15/16 Pro Max viewport: 430 x 932 @ 3x = exactly 1290 x 2796 px
    await page.setViewport({
      width: 430,
      height: 932,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    );

    // Pre-seed localStorage so the user is marked onboarded and on the authentic Home Screen
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('tts_quest_onboarded', 'true');
      localStorage.setItem('tts_quest_theme', 'monokrom');
      localStorage.setItem(
        'tts_quest_user',
        JSON.stringify({
          id: 'player_champion',
          name: 'Budi Santoso',
          coins: 1250,
          gems: 85,
          currentStreak: 14,
          highestStreak: 21,
          avatar: '/maskot/Fierce Plush Crossword Champion.webp',
        })
      );
    });

    console.log('Navigating to app with ?vip=1...');
    await page.goto(`http://127.0.0.1:${PORT}/?vip=1`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for the liquid glass VIP modal to appear
    console.log('Waiting for VIP modal element...');
    await page.waitForSelector('.liquid-glass-card', { timeout: 10000 });

    // Wait for mascot image to be fully decoded & rendered
    await page.waitForFunction(() => {
      const img = document.querySelector('img[alt="TTS Pass VIP Champion"]');
      return img && img.complete && img.naturalWidth > 0;
    }, { timeout: 10000 });

    // Small delay to ensure all spring transitions and CSS blur finish rendering
    await new Promise((r) => setTimeout(r, 1500));

    const outputPath = path.join(__dirname, '..', 'paywall_review_screenshot.png');
    console.log(`Taking full screenshot (${outputPath})...`);
    await page.screenshot({
      path: outputPath,
      type: 'png',
    });

    console.log('Screenshot successfully generated at:', outputPath);
  } finally {
    await browser.close();
    server.close();
  }
}

capture().catch((err) => {
  console.error('Error generating screenshot:', err);
  process.exit(1);
});
