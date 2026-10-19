const CACHE_NAME = 'tts-quest-cache-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  // All 19 WebP Mascot Assets
  '/maskot/Cheerful%20Plush%20Puzzle%20Explorer.webp',
  '/maskot/Cheerful%20Puzzle%20Book%20Boy.webp',
  '/maskot/Cute%20Plush%20Crossword%20Girl%20Sticker.webp',
  '/maskot/Fierce%20Plush%20Crossword%20Champion.webp',
  '/maskot/Fuzzy%20Crossword%20Friends%20Playing%20Together.webp',
  '/maskot/Fuzzy%20Crossword%20Puzzle%20Mascot.webp',
  '/maskot/Maskot%20Teka-Teki%20Silang%20Ceria.webp',
  '/maskot/Playful%20Plush%20Crossword%20Board.webp',
  '/maskot/Plush%20Boy%20Crying%20Over%20Lost%20Streak.webp',
  '/maskot/Plush%20Boy%20Solving%20a%20Puzzle.webp',
  '/maskot/Plush%20Crossword%20Duel%20at%2000_45.webp',
  '/maskot/Plush%20Crossword%20Puzzle%20Girl.webp',
  '/maskot/Plush%20Crossword%20Puzzle%20Moment.webp',
  '/maskot/Plush%20Crossword%20Thinker.webp',
  '/maskot/Plush%20Indonesian%20Batik%20Wordsmith%20Mascot.webp',
  '/maskot/Plush%20Indonesian%20Puzzle%20Kid.webp',
  '/maskot/Plush%20Indonesian%20Puzzle%20Pals.webp',
  '/maskot/Plush%20Puzzle%20Gamer%20with%20Cozy%20Accessories.webp',
  '/maskot/Plush%20Tech-Savvy%20Walker.webp',
];

// Precache static assets & mascots on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Use individual add to avoid failing entire install if a single optional asset fails
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW] Failed to precache:', url, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Strategy: Stale-While-Revalidate for app assets & Cache First for Fonts & Images
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests and unsupported schemes (e.g. chrome-extension)
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // 1. Navigation requests (HTML SPA) -> Network First with cached fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html').then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // 2. Google Fonts & Static Assets (WebP, PNG, SVG, CSS, JS) -> Cache First with Network Fallback
  const isFont = url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com');
  const isImageOrMedia = request.destination === 'image' || url.pathname.endsWith('.webp') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg');
  const isStaticBundle = url.pathname.startsWith('/assets/');

  if (isFont || isImageOrMedia || isStaticBundle) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background for static bundles
          if (isStaticBundle) {
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
                }
              })
              .catch(() => {});
          }
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            return networkResponse;
          })
          .catch(() => {
            // If offline and image requested, return fallback if available
            return caches.match(request);
          });
      })
    );
    return;
  }

  // 3. Default: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
