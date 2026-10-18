// Offline support. Network first, so a new version shows up on the next visit; the cache only
// answers when there is no connection. Lives at the site root so it can serve every page and file.
//
// When you add, move or remove a file under site/, update ASSETS and bump CACHE (tests/site.test.js checks the list).
const CACHE = 'dailies-v9';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './css/editor.css',
  './js/app.js',
  './js/colour.js',
  './js/constellations.js',
  './js/dailies.js',
  './js/editor.js',
  './js/greeting.js',
  './js/html.js',
  './js/icons.js',
  './js/quotes.js',
  './js/share.js',
  './js/sky.js',
  './js/store.js',
  './img/icon.svg',
  './img/apple-touch-icon.png',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/icon-maskable-512.png',
  './fonts/manrope-latin.woff2',
];

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the browser's HTTP cache, so the copy stored here is the freshly deployed one.
  const fresh = ASSETS.map((url) => new Request(url, { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(fresh)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const stale = (keys) => keys.filter((key) => key !== CACHE).map((key) => caches.delete(key));
  event.waitUntil(caches.keys().then((keys) => Promise.all(stale(keys))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith(
    // no-cache: always revalidate with the server (cheap 304s); GitHub Pages would otherwise serve
    // a copy up to ten minutes old from the HTTP cache.
    fetch(new Request(request.url, { cache: 'no-cache', credentials: 'same-origin' }))
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true })),
  );
});
