const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const OUTPUT_DIR_67 = path.join(__dirname, '..', 'app_store_screenshots', '6.7_inch');
const OUTPUT_DIR_65 = path.join(__dirname, '..', 'app_store_screenshots', '6.5_inch');
const PORT = 4182;

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
    subtitle: 'Taklukkan ribuan teka-teki silang berstandar resmi KBBI',
    accentColor: '#F59E0B',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
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
        store.setCurrentTab('profile');
        setTimeout(() => store.openCustomCrosswordModal(), 200);
      });
      await new Promise((r) => setTimeout(r, 900));
    },
  },
];

function generateMarketingCardHtml({ badge, title, subtitle, accentColor, imageTimestamp }) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1290px;
    height: 2796px;
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
    top: -250px;
    left: 50%;
    transform: translateX(-50%);
    width: 1100px;
    height: 600px;
    background: radial-gradient(circle, ${accentColor}33 0%, rgba(0,0,0,0) 70%);
    filter: blur(90px);
    pointer-events: none;
  }
  .glow-bottom {
    position: absolute;
    bottom: -300px;
    left: 50%;
    transform: translateX(-50%);
    width: 1200px;
    height: 700px;
    background: radial-gradient(circle, ${accentColor}22 0%, rgba(0,0,0,0) 70%);
    filter: blur(120px);
    pointer-events: none;
  }

  .header-container {
    width: 100%;
    padding: 135px 80px 60px 80px;
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
    gap: 10px;
    padding: 12px 28px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    margin-bottom: 24px;
  }
  .badge-pill .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${accentColor};
    box-shadow: 0 0 12px ${accentColor};
  }
  .badge-pill span {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #ffffff;
  }

  .main-title {
    font-size: 82px;
    font-weight: 900;
    letter-spacing: -0.035em;
    line-height: 1.06;
    margin-bottom: 20px;
    background: linear-gradient(180deg, #FFFFFF 20%, #E2E8F0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(0,0,0,0.4);
  }

  .sub-title {
    font-size: 34px;
    font-weight: 500;
    line-height: 1.35;
    color: rgba(255, 255, 255, 0.82);
    max-width: 980px;
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
    margin-top: 10px;
  }

  .iphone-frame {
    width: 1040px;
    height: 2250px;
    background: #000000;
    border-radius: 120px;
    border: 14px solid #3A3C42;
    box-shadow: 0 0 0 4px #1c1d22,
                0 40px 100px -20px rgba(0,0,0,0.85),
                0 0 80px rgba(0,0,0,0.5);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .iphone-frame::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 106px;
    border: 2px solid rgba(255, 255, 255, 0.25);
    pointer-events: none;
    z-index: 30;
  }

  .dynamic-island {
    position: absolute;
    top: 26px;
    left: 50%;
    transform: translateX(-50%);
    width: 290px;
    height: 82px;
    background: #000000;
    border-radius: 46px;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.7);
  }
  .dynamic-island .camera {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #0f131f;
    border: 2px solid #1f2538;
  }
  .dynamic-island .sensor {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0b0d14;
  }

  .screen-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    background: #000000;
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
    <div class="iphone-frame">
      <div class="dynamic-island">
        <div class="sensor"></div>
        <div class="camera"></div>
      </div>
      <img src="http://127.0.0.1:${PORT}/temp_screen.png?v=${imageTimestamp}" class="screen-image" alt="Screen" />
    </div>
  </div>
</body>
</html>`;
}

async function run() {
  console.log('=== [App Store Screenshot Generator] ===');
  fs.mkdirSync(OUTPUT_DIR_67, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR_65, { recursive: true });

  const server = await createStaticServer();

  console.log('[Puppeteer] Launching headless Chrome with extended timeout...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    protocolTimeout: 300000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--hide-scrollbars',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  });

  try {
    const page = await browser.newPage();

    // Emulate iPhone 16 Pro Max viewport
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

    // Pre-populate rich game state for realistic App Store screenshots
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

    for (let i = 0; i < SLIDES.length; i++) {
      const slide = SLIDES[i];
      console.log(`[Screenshot ${i + 1}/${SLIDES.length}] Preparing: ${slide.title}...`);

      // Execute scenario setup
      await slide.setup(page);

      // Capture raw app screen to static server temp file
      const tempPath = path.join(DIST_DIR, 'temp_screen.png');
      const rawScreenBuffer = await page.screenshot({
        type: 'png',
        fullPage: false,
      });
      fs.writeFileSync(tempPath, rawScreenBuffer);

      const timestamp = Date.now();

      // Generate HTML for marketing card
      const cardHtml = generateMarketingCardHtml({
        badge: slide.badge,
        title: slide.title,
        subtitle: slide.subtitle,
        accentColor: slide.accentColor,
        imageTimestamp: timestamp,
      });

      // Render marketing card on dedicated fresh page
      const cardPage = await browser.newPage();
      await cardPage.setViewport({
        width: 1290,
        height: 2796,
        deviceScaleFactor: 1,
      });

      await cardPage.setContent(cardHtml, { waitUntil: 'load' });
      await new Promise((r) => setTimeout(r, 500));

      // Capture 6.7" (1290x2796)
      const outPath67 = path.join(OUTPUT_DIR_67, `${slide.id}.png`);
      const cardBuffer67 = await cardPage.screenshot({
        type: 'png',
        fullPage: false,
      });
      fs.writeFileSync(outPath67, cardBuffer67);
      console.log(`   ✓ Saved 6.7" (1290x2796): ${outPath67}`);

      // Close card page immediately to free GPU memory
      await cardPage.close();

      // Resize to 6.5" (1242x2688) with sharp
      const outPath65 = path.join(OUTPUT_DIR_65, `${slide.id}.png`);
      await sharp(cardBuffer67)
        .resize(1242, 2688, { fit: 'fill' })
        .png({ quality: 100 })
        .toFile(outPath65);
      console.log(`   ✓ Saved 6.5" (1242x2688): ${outPath65}`);
    }

    // Clean up temp file
    const tempPath = path.join(DIST_DIR, 'temp_screen.png');
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    console.log('\n🎉 [Success] All 10 App Store promotional screenshots generated successfully!');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('[Error] Screenshot generation failed:', err);
  process.exit(1);
});
