const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const OUTPUT_DIR_LOCAL = path.join(__dirname, '..', 'preview_screenshots');
const OUTPUT_DIR_CURATED = path.join(OUTPUT_DIR_LOCAL, 'curated_figma_slides');
const OUTPUT_DIR_LIGHT = path.join(OUTPUT_DIR_LOCAL, 'all_light_mode');
const OUTPUT_DIR_DARK = path.join(OUTPUT_DIR_LOCAL, 'all_dark_mode');
const OUTPUT_DIR_ARTIFACT = path.join(
  'C:\\Users\\afa\\.gemini\\antigravity\\brain\\719fae40-99f1-473d-b918-6f718d2d1bc4\\screenshots\\figma_multi_theme'
);
const PORT = 4199;

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
      console.log(`[Server] Static server running on http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

// 1. Curated Palette Screens directly matching Figma 7-slide layout
const CURATED_SCREENS = [
  {
    id: 'slide_01_gameplay_fauna_endemik_obsidian',
    title: 'Slide 1: 500+ Bab Alam Nusantara (Dark Luxury Obsidian)',
    theme: 'obsidian',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.setTheme('obsidian');
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.selectLevel(0);
        store.setCurrentTab('game');
      });
      await new Promise((r) => setTimeout(r, 1200));
    },
  },
  {
    id: 'slide_02_mabar_coop_realtime_sage',
    title: 'Slide 2: Mabar Teman & Pasangan (Kyoto Matcha Light)',
    theme: 'sage',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.setTheme('sage');
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.setCurrentTab('arena');
        store.setArenaSubTab('mabar');
      });
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
  {
    id: 'slide_03_turnamen_komunitas_cup_bordo',
    title: 'Slide 3: Turnamen & Piala Kejuaraan (Bordo Royale Deep Red)',
    theme: 'bordo',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.setTheme('bordo');
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.setCurrentTab('arena');
        store.setArenaSubTab('tournament');
      });
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
  {
    id: 'slide_04_studio_kreator_tts_nube',
    title: 'Slide 4: Bikin TTS Sesukamu (Apple Light Mono Crisp Ivory)',
    theme: 'nube',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.setTheme('nube');
        store.closeLevelSelect();
        store.closeLeaderboard();
        store.closeVipModal();
        store.setCurrentTab('profile');
        store.openCustomCrosswordModal();
      });
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
  {
    id: 'slide_05_duel_strategi_lobi_milky',
    title: 'Slide 5: Duel Strategi 1v1 Lobi Setting (Milky Glass Light)',
    theme: 'milky',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.setTheme('milky');
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.setCurrentTab('arena');
        store.setArenaSubTab('solo');
      });
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
  {
    id: 'slide_06_tarik_tambang_kata_duel_blossom',
    title: 'Slide 6: Tarik Tambang Kata Gameplay (Sakura Rose / Purple)',
    theme: 'blossom',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.setTheme('blossom');
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.selectLevel(0);
        store.startBattleMatch();
        // Claim one clue to show colored battle tiles
        const level = store.level;
        if (level && level.clues.across && level.clues.across[0]) {
          store.claimBattleClue(level.clues.across[0].id, [level.clues.across[0].id], 'local');
        }
        store.setCurrentTab('game');
      });
      await new Promise((r) => setTimeout(r, 1200));
    },
  },
  {
    id: 'slide_07_klasemen_master_elo_oxford',
    title: 'Slide 7: Klasemen Master ELO Liga Catur (Midnight Oxford Navy)',
    theme: 'oxford',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.setTheme('oxford');
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeVipModal();
        store.setCurrentTab('home');
        store.openLeaderboard();
      });
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
  {
    id: 'extra_08_jelajah_12_alam_nusantara_nube',
    title: 'Extra 8: Pilihan Bab & 12 Alam Tematik (Crisp Ivory Light)',
    theme: 'nube',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.setTheme('nube');
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.setCurrentTab('home');
        store.openLevelSelect();
      });
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
  {
    id: 'extra_09_profil_paspor_dan_kreasiku_nube',
    title: 'Extra 9: Profil Paspor & Koleksi TTS Kreasiku (Crisp Ivory Light)',
    theme: 'nube',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.setTheme('nube');
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.closeVipModal();
        store.setCurrentTab('profile');
      });
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
  {
    id: 'extra_10_vip_pass_storekit_milky',
    title: 'Extra 10: VIP Pass StoreKit Modal (Milky Glass Light)',
    theme: 'milky',
    setup: async (page) => {
      await page.evaluate(() => {
        const store = window.__gameStore.getState();
        store.setTheme('milky');
        store.closeLevelSelect();
        store.closeCustomCrosswordModal();
        store.closeLeaderboard();
        store.setCurrentTab('profile');
        store.openVipModal();
      });
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
];

async function run() {
  console.log('=== [Starting Multi-Theme Figma Preview Screenshot Capture] ===');
  fs.mkdirSync(OUTPUT_DIR_LOCAL, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR_CURATED, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR_LIGHT, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR_DARK, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR_ARTIFACT, { recursive: true });

  const server = await createStaticServer();

  console.log('[Puppeteer] Launching Chrome at native iPhone 16 Pro Max resolution (1290x2796)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
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

    // iPhone 16 Pro Max native resolution: 430 x 932 @ 3x scale factor = 1290 x 2796 pixels
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

    // Pre-populate realistic data
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('tts_quest_onboarded', 'true');
      localStorage.setItem('tts_quest_theme', 'obsidian');
      localStorage.setItem('tts_quest_stars', '850');
      localStorage.setItem('tts_quest_streak', '28');
      localStorage.setItem('tts_quest_elo', '1485');
      localStorage.setItem('tts_is_vip_v1', 'true');
      localStorage.setItem(
        'tts_quest_user',
        JSON.stringify({
          id: 'fc39f465-b1a9-4cf4-9dc8-53b708b5e28a',
          name: 'Nusantara Juara',
          isGuest: false,
          avatar: '/maskot/Fierce Plush Crossword Champion.webp',
          soundPack: 'default',
          joinedAt: '2026-08-15T00:00:00.000Z',
        })
      );
      localStorage.setItem(
        'tts_trophies_v1',
        JSON.stringify({
          gold: 5,
          silver: 3,
          bronze: 2,
          totalTournaments: 18,
        })
      );
      localStorage.setItem(
        'tts_user_custom_crosswords_v1',
        JSON.stringify([
          {
            id: 'custom_sample_1',
            title: 'Keluarga Cemara',
            category: 'Keluarga & Nostalgia',
            wordsList: [
              { word: 'RUMAH', clue: 'Tempat pulang ternyaman' },
              { word: 'KASIH', clue: 'Cinta tulus tanpa syarat' },
              { word: 'HANGAT', clue: 'Suasana santai di meja makan' },
            ],
            createdAt: '25 Okt 2026',
            level: {
              id: 9991,
              title: 'Keluarga Cemara',
              category: 'Keluarga & Nostalgia',
              gridSize: 7,
              clues: { across: [{ number: 1, text: 'Tempat pulang ternyaman', answer: 'RUMAH', row: 0, col: 0 }], down: [] },
              solution: [['R', 'U', 'M', 'A', 'H']],
            },
          },
          {
            id: 'custom_sample_2',
            title: 'Kuis Seru Kantor',
            category: 'Kolega & Teman',
            wordsList: [
              { word: 'SINERGI', clue: 'Kerja sama menghasilkan karya luar biasa' },
              { word: 'REHAT', clue: 'Waktu santai sejenak di pantry' },
            ],
            createdAt: '26 Okt 2026',
            level: {
              id: 9992,
              title: 'Kuis Seru Kantor',
              category: 'Kolega & Teman',
              gridSize: 8,
              clues: { across: [{ number: 1, text: 'Kerja sama tim hebat', answer: 'SINERGI', row: 0, col: 0 }], down: [] },
              solution: [['S', 'I', 'N', 'E', 'R', 'G', 'I']],
            },
          },
        ])
      );
    });

    console.log('[App] Navigating to http://127.0.0.1:' + PORT + '...');
    await page.goto(`http://127.0.0.1:${PORT}/`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Inject authentic iPhone 16 Pro Max Safe Area Insets Simulation into Chromium
    await page.addStyleTag({
      content: `
        /* 1. Top Safe Area Inset: Exactly 66px, giving 12px clean breathing room below the 54px Status Bar */
        [class*="pt-"][class*="safe-area-inset-top"] {
          padding-top: 66px !important;
        }

        /* 2. Floating toast alerts positioned comfortably below status bar */
        div[class*="fixed"][class*="top-"][class*="safe-area-inset-top"] {
          top: 66px !important;
        }

        /* 3. Bottom Navigation Bar: Floating 36px above bottom edge */
        nav,
        div[class*="bottom-"][class*="safe-area-inset-bottom"] {
          bottom: 36px !important;
        }

        /* 4. Active Game Resume Banner */
        div[class*="bottom-[max(76px"] {
          bottom: 104px !important;
        }

        /* 5. Scrollable Containers Bottom Padding */
        div[class*="pb-"][class*="safe-area-inset-bottom"] {
          padding-bottom: 112px !important;
        }

        /* 6. Sticky bottom bar in CustomCrosswordModal */
        .sticky.bottom-0[class*="safe-area-inset-bottom"] {
          padding-bottom: 42px !important;
        }

        /* 7. Keyboard bottom padding */
        div[class*="touch-none"][class*="safe-area-inset-bottom"] {
          padding-bottom: 34px !important;
        }
      `,
    });

    // Adaptive Status Bar (Dark text on light themes, White text on dark themes)
    const injectIosStatusBar = async (themeKey) => {
      const isDark = ['obsidian', 'espresso', 'oxford'].includes(themeKey);
      const color = isDark ? '#FFFFFF' : '#000000';
      await page.evaluate(({ color }) => {
        let statusBar = document.getElementById('figma-ios-status-bar');
        if (!statusBar) {
          statusBar = document.createElement('div');
          statusBar.id = 'figma-ios-status-bar';
          document.body.appendChild(statusBar);
        }
        statusBar.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; right: 0; height: 54px; z-index: 99999999; pointer-events: none; display: flex; align-items: center; justify-content: space-between; padding: 0 32px 0 34px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', 'Segoe UI', Roboto, sans-serif; color: ${color}; user-select: none;">
            <!-- Apple Marketing Time 9:41 -->
            <div style="font-size: 16.5px; font-weight: 600; letter-spacing: -0.02em; padding-top: 1px;">
              9:41
            </div>
            <!-- Center gap for Figma Dynamic Island Cutout -->
            <div style="flex: 1;"></div>
            <!-- Status Icons: Cellular, Wi-Fi, 100% Battery -->
            <div style="display: flex; align-items: center; gap: 7.5px;">
              <!-- Cellular Signal 4 bars -->
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="8.5" width="3" height="3.5" rx="0.8" fill="${color}"/>
                <rect x="5" y="6" width="3" height="6" rx="0.8" fill="${color}"/>
                <rect x="9.5" y="3.5" width="3" height="8.5" rx="0.8" fill="${color}"/>
                <rect x="14" y="0.5" width="3" height="11.5" rx="0.8" fill="${color}"/>
              </svg>
              <!-- Wi-Fi 3 arcs -->
              <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 2.1C11.3 2.1 13.8 3.2 15.6 5L16.8 3.8C14.7 1.7 11.7 0.4 8.5 0.4C5.3 0.4 2.3 1.7 0.2 3.8L1.4 5C3.2 3.2 5.7 2.1 8.5 2.1ZM8.5 5.5C10.4 5.5 12.1 6.2 13.4 7.5L14.6 6.3C13 4.7 10.9 3.8 8.5 3.8C6.1 3.8 4 4.7 2.4 6.3L3.6 7.5C4.9 6.2 6.6 5.5 8.5 5.5ZM8.5 8.8C9.4 8.8 10.3 9.2 10.9 9.8L8.5 12.2L6.1 9.8C6.7 9.2 7.6 8.8 8.5 8.8Z" fill="${color}"/>
              </svg>
              <!-- Battery Pill 100% -->
              <div style="display: flex; align-items: center; margin-left: 1px;">
                <div style="width: 25px; height: 12.5px; border: 1.2px solid ${color}; border-radius: 4px; padding: 1.5px; display: flex; align-items: center;">
                  <div style="width: 100%; height: 100%; background: ${color}; border-radius: 1.8px;"></div>
                </div>
                <div style="width: 1.5px; height: 4.5px; background: ${color}; border-radius: 0 1px 1px 0; margin-left: 1px;"></div>
              </div>
            </div>
          </div>
        `;
      }, { color });
    };

    // A. Capture Curated Multi-Theme Figma Slides
    console.log('\n--- [Part A: Curated Multi-Theme Figma Slides] ---');
    for (let i = 0; i < CURATED_SCREENS.length; i++) {
      const screen = CURATED_SCREENS[i];
      console.log(`[Curated ${i + 1}/${CURATED_SCREENS.length}] ${screen.title}...`);

      await screen.setup(page);
      await injectIosStatusBar(screen.theme);
      await new Promise((r) => setTimeout(r, 200));

      const buffer = await page.screenshot({
        type: 'png',
        fullPage: false,
      });

      const rootPath = path.join(OUTPUT_DIR_LOCAL, `${screen.id}.png`);
      const curatedPath = path.join(OUTPUT_DIR_CURATED, `${screen.id}.png`);
      const artifactPath = path.join(OUTPUT_DIR_ARTIFACT, `${screen.id}.png`);

      fs.writeFileSync(rootPath, buffer);
      fs.writeFileSync(curatedPath, buffer);
      fs.writeFileSync(artifactPath, buffer);

      console.log(`   ✓ Saved: ${screen.id}.png (${screen.theme.toUpperCase()})`);
    }

    // B. Capture All Screens in 100% Clean Light Mode (Crisp Ivory 'nube')
    console.log('\n--- [Part B: Complete 100% Light Mode Pack (Crisp Ivory)] ---');
    for (let i = 0; i < CURATED_SCREENS.length; i++) {
      const screen = CURATED_SCREENS[i];
      await screen.setup(page);
      await page.evaluate(() => {
        window.__gameStore.getState().setTheme('nube');
      });
      await injectIosStatusBar('nube');
      await new Promise((r) => setTimeout(r, 200));

      const buffer = await page.screenshot({ type: 'png', fullPage: false });
      const lightPath = path.join(OUTPUT_DIR_LIGHT, `${screen.id.replace(/_[a-z]+$/, '')}_light.png`);
      fs.writeFileSync(lightPath, buffer);
      console.log(`   ✓ Saved Light: ${path.basename(lightPath)}`);
    }

    // C. Capture All Screens in 100% Dark Mode (Warm Obsidian 'obsidian')
    console.log('\n--- [Part C: Complete 100% Dark Mode Pack (Warm Obsidian)] ---');
    for (let i = 0; i < CURATED_SCREENS.length; i++) {
      const screen = CURATED_SCREENS[i];
      await screen.setup(page);
      await page.evaluate(() => {
        window.__gameStore.getState().setTheme('obsidian');
      });
      await injectIosStatusBar('obsidian');
      await new Promise((r) => setTimeout(r, 200));

      const buffer = await page.screenshot({ type: 'png', fullPage: false });
      const darkPath = path.join(OUTPUT_DIR_DARK, `${screen.id.replace(/_[a-z]+$/, '')}_dark.png`);
      fs.writeFileSync(darkPath, buffer);
      console.log(`   ✓ Saved Dark: ${path.basename(darkPath)}`);
    }

    // D. Capture Standalone Transparent Status Bar Overlays (White and Black)
    const overlayPage = await browser.newPage();
    await overlayPage.setViewport({ width: 430, height: 54, deviceScaleFactor: 3 });

    // White Overlay (for dark themes)
    await overlayPage.setContent(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><style>* { box-sizing: border-box; margin: 0; padding: 0; } html, body { width: 100%; height: 100%; background: transparent; overflow: hidden; }</style></head><body>
        <div style="width: 100%; height: 54px; display: flex; align-items: center; justify-content: space-between; padding: 0 32px 0 34px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', 'Segoe UI', Roboto, sans-serif; color: #FFFFFF;">
          <div style="font-size: 16.5px; font-weight: 600; letter-spacing: -0.02em; padding-top: 1px;">9:41</div>
          <div style="flex: 1;"></div>
          <div style="display: flex; align-items: center; gap: 7.5px;">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0.5" y="8.5" width="3" height="3.5" rx="0.8" fill="#FFFFFF"/><rect x="5" y="6" width="3" height="6" rx="0.8" fill="#FFFFFF"/><rect x="9.5" y="3.5" width="3" height="8.5" rx="0.8" fill="#FFFFFF"/><rect x="14" y="0.5" width="3" height="11.5" rx="0.8" fill="#FFFFFF"/></svg>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 2.1C11.3 2.1 13.8 3.2 15.6 5L16.8 3.8C14.7 1.7 11.7 0.4 8.5 0.4C5.3 0.4 2.3 1.7 0.2 3.8L1.4 5C3.2 3.2 5.7 2.1 8.5 2.1ZM8.5 5.5C10.4 5.5 12.1 6.2 13.4 7.5L14.6 6.3C13 4.7 10.9 3.8 8.5 3.8C6.1 3.8 4 4.7 2.4 6.3L3.6 7.5C4.9 6.2 6.6 5.5 8.5 5.5ZM8.5 8.8C9.4 8.8 10.3 9.2 10.9 9.8L8.5 12.2L6.1 9.8C6.7 9.2 7.6 8.8 8.5 8.8Z" fill="#FFFFFF"/></svg>
            <div style="display: flex; align-items: center; margin-left: 1px;"><div style="width: 25px; height: 12.5px; border: 1.2px solid #FFFFFF; border-radius: 4px; padding: 1.5px; display: flex; align-items: center;"><div style="width: 100%; height: 100%; background: #FFFFFF; border-radius: 1.8px;"></div></div><div style="width: 1.5px; height: 4.5px; background: #FFFFFF; border-radius: 0 1px 1px 0; margin-left: 1px;"></div></div>
          </div>
        </div>
      </body></html>
    `, { waitUntil: 'load' });
    const whiteOverlayBuf = await overlayPage.screenshot({ type: 'png', omitBackground: true });
    fs.writeFileSync(path.join(OUTPUT_DIR_LOCAL, 'ios_status_bar_white_941.png'), whiteOverlayBuf);

    // Black Overlay (for light themes)
    await overlayPage.setContent(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><style>* { box-sizing: border-box; margin: 0; padding: 0; } html, body { width: 100%; height: 100%; background: transparent; overflow: hidden; }</style></head><body>
        <div style="width: 100%; height: 54px; display: flex; align-items: center; justify-content: space-between; padding: 0 32px 0 34px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', 'Segoe UI', Roboto, sans-serif; color: #000000;">
          <div style="font-size: 16.5px; font-weight: 600; letter-spacing: -0.02em; padding-top: 1px;">9:41</div>
          <div style="flex: 1;"></div>
          <div style="display: flex; align-items: center; gap: 7.5px;">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0.5" y="8.5" width="3" height="3.5" rx="0.8" fill="#000000"/><rect x="5" y="6" width="3" height="6" rx="0.8" fill="#000000"/><rect x="9.5" y="3.5" width="3" height="8.5" rx="0.8" fill="#000000"/><rect x="14" y="0.5" width="3" height="11.5" rx="0.8" fill="#000000"/></svg>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 2.1C11.3 2.1 13.8 3.2 15.6 5L16.8 3.8C14.7 1.7 11.7 0.4 8.5 0.4C5.3 0.4 2.3 1.7 0.2 3.8L1.4 5C3.2 3.2 5.7 2.1 8.5 2.1ZM8.5 5.5C10.4 5.5 12.1 6.2 13.4 7.5L14.6 6.3C13 4.7 10.9 3.8 8.5 3.8C6.1 3.8 4 4.7 2.4 6.3L3.6 7.5C4.9 6.2 6.6 5.5 8.5 5.5ZM8.5 8.8C9.4 8.8 10.3 9.2 10.9 9.8L8.5 12.2L6.1 9.8C6.7 9.2 7.6 8.8 8.5 8.8Z" fill="#000000"/></svg>
            <div style="display: flex; align-items: center; margin-left: 1px;"><div style="width: 25px; height: 12.5px; border: 1.2px solid #000000; border-radius: 4px; padding: 1.5px; display: flex; align-items: center;"><div style="width: 100%; height: 100%; background: #000000; border-radius: 1.8px;"></div></div><div style="width: 1.5px; height: 4.5px; background: #000000; border-radius: 0 1px 1px 0; margin-left: 1px;"></div></div>
          </div>
        </div>
      </body></html>
    `, { waitUntil: 'load' });
    const blackOverlayBuf = await overlayPage.screenshot({ type: 'png', omitBackground: true });
    fs.writeFileSync(path.join(OUTPUT_DIR_LOCAL, 'ios_status_bar_black_941.png'), blackOverlayBuf);

    await overlayPage.close();

    console.log('\n🎉 [Success] All Multi-Theme Packs Generated Successfully!');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('[Error] Multi-theme capture failed:', err);
  process.exit(1);
});
