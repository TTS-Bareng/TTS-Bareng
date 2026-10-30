const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const OUTPUT_DIR_IPAD = path.join(__dirname, '..', 'app_store_screenshots', '13_inch_ipad');
const OUTPUT_DIR_IAP = path.join(__dirname, '..', 'app_store_screenshots', 'iap_review');
const PORT = 4183;

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
      console.log(`[Server] Static server running at http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

const SLIDES = [
  {
    id: '01_500_bab_nusantara',
    badge: 'PETUALANGAN KATA',
    title: '500+ BAB NUSANTARA',
    subtitle: 'Taklukkan ribuan teka-teki silang berstandar resmi KBBI di layar lebar',
    accentColor: '#F59E0B',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.setCurrentTab('home');
        setTimeout(() => store.openLevelSelect(), 200);
      });
      await new Promise((r) => setTimeout(r, 900));
    },
  },
  {
    id: '02_mabar_duel_kata',
    badge: 'ARENA KOMPETISI 1V1',
    title: 'MABAR & DUEL KATA',
    subtitle: 'Tanding cepat bareng sahabat atau uji otak lawan AI cerdas',
    accentColor: '#3B82F6',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.setCurrentTab('arena');
        store.setArenaSubTab('mabar');
      });
      await new Promise((r) => setTimeout(r, 900));
    },
  },
  {
    id: '03_game_center_leaderboard',
    badge: 'APPLE GAMEKIT NATIVE',
    title: 'APPLE GAME CENTER',
    subtitle: 'Papan peringkat global, lencana prestasi, & tangga ELO catur',
    accentColor: '#10B981',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.setCurrentTab('profile');
      });
      await new Promise((r) => setTimeout(r, 900));
    },
  },
  {
    id: '04_daily_rush_gameplay',
    badge: 'TANTANGAN SETIAP HARI',
    title: 'ASAH OTAK DAILY RUSH',
    subtitle: 'Selesaikan teka-teki 90 detik & pertahankan rentetan api',
    accentColor: '#EF4444',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.selectLevel(0);
        store.setCurrentTab('game');
      });
      await new Promise((r) => setTimeout(r, 900));
    },
  },
  {
    id: '05_studio_kreator_tts',
    badge: 'KREASI TANPA BATAS',
    title: 'STUDIO PEMBUAT TTS',
    subtitle: 'Susun kisi teka-teki rahasiamu & bagikan via kode QR',
    accentColor: '#8B5CF6',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.closeLevelSelect();
        store.closeLeaderboard();
        store.closeVipModal();
        store.setCurrentTab('profile');
        setTimeout(() => store.openCustomCrosswordModal(), 200);
      });
      await new Promise((r) => setTimeout(r, 900));
    },
  },
];

function generateIpadMarketingCardHtml({ badge, title, subtitle, accentColor, imageTimestamp }) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 2048px;
    height: 2732px;
    background: radial-gradient(circle at 50% 15%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 65%),
                linear-gradient(180deg, #18191f 0%, #0d0e12 40%, #050507 100%);
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .glow-top {
    position: absolute;
    top: -300px;
    left: 50%;
    transform: translateX(-50%);
    width: 1600px;
    height: 800px;
    background: radial-gradient(circle, ${accentColor}33 0%, rgba(0,0,0,0) 70%);
    filter: blur(120px);
    pointer-events: none;
  }
  .glow-bottom {
    position: absolute;
    bottom: -350px;
    left: 50%;
    transform: translateX(-50%);
    width: 1700px;
    height: 900px;
    background: radial-gradient(circle, ${accentColor}22 0%, rgba(0,0,0,0) 70%);
    filter: blur(140px);
    pointer-events: none;
  }

  .header-container {
    width: 100%;
    padding: 130px 100px 50px 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    z-index: 10;
  }

  .badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 14px 34px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    margin-bottom: 24px;
  }
  .badge-pill .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${accentColor};
    box-shadow: 0 0 14px ${accentColor};
  }
  .badge-pill span {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #ffffff;
  }

  .main-title {
    font-size: 96px;
    font-weight: 900;
    letter-spacing: -0.035em;
    line-height: 1.08;
    margin-bottom: 22px;
    background: linear-gradient(180deg, #FFFFFF 20%, #E2E8F0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(0,0,0,0.4);
  }

  .sub-title {
    font-size: 40px;
    font-weight: 500;
    line-height: 1.35;
    color: rgba(255, 255, 255, 0.82);
    max-width: 1400px;
    letter-spacing: -0.01em;
  }

  .device-wrapper {
    flex: 1;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    z-index: 10;
    margin-top: 20px;
  }

  .ipad-frame {
    width: 1540px;
    height: 2050px;
    background: #000000;
    border-radius: 64px;
    border: 16px solid #2A2C32;
    box-shadow: 0 0 0 4px #1c1d22,
                0 40px 100px -20px rgba(0,0,0,0.85),
                0 0 80px rgba(0,0,0,0.5);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .ipad-frame::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 48px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    pointer-events: none;
    z-index: 30;
  }

  .screen-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }
</style>
</head>
<body>
  <div class="glow-top"></div>
  <div class="glow-bottom"></div>
  <div class="header-container">
    <div class="badge-pill">
      <div class="dot"></div>
      <span>${badge}</span>
    </div>
    <h1 class="main-title">${title}</h1>
    <p class="sub-title">${subtitle}</p>
  </div>
  <div class="device-wrapper">
    <div class="ipad-frame">
      <img class="screen-img" src="http://127.0.0.1:${PORT}/temp_screen_ipad.png?t=${imageTimestamp}" />
    </div>
  </div>
</body>
</html>`;
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR_IPAD)) {
    fs.mkdirSync(OUTPUT_DIR_IPAD, { recursive: true });
  }
  if (!fs.existsSync(OUTPUT_DIR_IAP)) {
    fs.mkdirSync(OUTPUT_DIR_IAP, { recursive: true });
  }

  const server = await createStaticServer();

  console.log('[Puppeteer] Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    protocolTimeout: 300000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--window-size=2048,2732',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1024,
      height: 1366,
      deviceScaleFactor: 1.5,
    });

    await page.setUserAgent(
      'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    );

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('tts_quest_onboarded', 'true');
      localStorage.setItem('tts_quest_theme', 'obsidian');
      localStorage.setItem('tts_quest_stars', '480');
      localStorage.setItem('tts_quest_streak', '14');
      localStorage.setItem('tts_quest_elo', '1320');
      localStorage.setItem('tts_quest_is_vip', 'true');
      localStorage.setItem(
        'tts_quest_user',
        JSON.stringify({
          id: 'player_champion',
          name: 'Nusantara Juara',
          isGuest: false,
          avatar: '/maskot/Fierce Plush Crossword Champion.webp',
          soundPack: 'default',
          joinedAt: new Date().toISOString(),
        })
      );
    });

    console.log('[App] Loading app at http://127.0.0.1:' + PORT + '...');
    await page.goto(`http://127.0.0.1:${PORT}/`, {
      waitUntil: 'networkidle0',
      timeout: 45000,
    });

    // 1. Generate 5 iPad 13-inch screenshots
    for (let i = 0; i < SLIDES.length; i++) {
      const slide = SLIDES[i];
      console.log(`[iPad Screenshot ${i + 1}/${SLIDES.length}] Preparing: ${slide.title}...`);

      await slide.setup(page);

      const tempPath = path.join(DIST_DIR, 'temp_screen_ipad.png');
      const rawScreenBuffer = await page.screenshot({
        type: 'png',
        fullPage: false,
      });
      fs.writeFileSync(tempPath, rawScreenBuffer);

      const timestamp = Date.now();
      const cardHtml = generateIpadMarketingCardHtml({
        badge: slide.badge,
        title: slide.title,
        subtitle: slide.subtitle,
        accentColor: slide.accentColor,
        imageTimestamp: timestamp,
      });

      const cardPage = await browser.newPage();
      await cardPage.setViewport({
        width: 2048,
        height: 2732,
        deviceScaleFactor: 1,
      });

      await cardPage.setContent(cardHtml, { waitUntil: 'load' });
      await new Promise((r) => setTimeout(r, 600));

      const outPathIpad = path.join(OUTPUT_DIR_IPAD, `${slide.id}.png`);
      const cardBufferIpad = await cardPage.screenshot({
        type: 'png',
        fullPage: false,
      });
      fs.writeFileSync(outPathIpad, cardBufferIpad);
      console.log(`   ✓ Saved 13-inch iPad (2048x2732): ${outPathIpad}`);

      await cardPage.close();
    }

    // 2. Generate Dedicated In-App Purchase Review Screenshot (VIP Paywall Modal)
    console.log('[IAP Screenshot] Capturing dedicated VIP Paywall for App Store Review Info...');
    await page.setViewport({
      width: 430,
      height: 932,
      deviceScaleFactor: 3, // 1290 x 2796
    });

    await page.evaluate(() => {
      const store = window.__gameStore.getState();
      store.closeLevelSelect();
      store.closeCustomCrosswordModal();
      store.closeLeaderboard();
      store.setCurrentTab('profile');
      setTimeout(() => {
        store.openVipModal();
      }, 200);
    });
    await new Promise((r) => setTimeout(r, 1200));

    const iapBuffer = await page.screenshot({
      type: 'png',
      fullPage: false,
    });
    const iapOutPath = path.join(OUTPUT_DIR_IAP, 'iap_vip_subscription_paywall.png');
    fs.writeFileSync(iapOutPath, iapBuffer);
    console.log(`   ✓ Saved IAP Review Screenshot (1290x2796): ${iapOutPath}`);

    // Clean up temp file
    const tempPath = path.join(DIST_DIR, 'temp_screen_ipad.png');
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    console.log('\n🎉 [Success] All 13-inch iPad & dedicated IAP screenshots generated successfully!');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('[Error] Generation failed:', err);
  process.exit(1);
});
