// Service worker: makes the São Paulo app installable and usable offline.
// - App shell, place data and Leaflet are pre-cached on install.
// - Map tiles are cached the first time they are fetched (cache-first, capped).
// - Google ratings are cached by the page itself (Cache API, see index.html).
const VERSION = 'v1';
const SHELL = `sp-shell-${VERSION}`;
const TILES = 'sp-tiles-v1';
const MAX_TILES = 1500;

const SHELL_FILES = [
  './',
  './index.html',
  '../config.js',
  './manifest.webmanifest',
  './data/places.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './vendor/leaflet.js',
  './vendor/leaflet.css',
  './vendor/images/marker-icon.png',
  './vendor/images/marker-icon-2x.png',
  './vendor/images/marker-shadow.png',
  './vendor/images/layers.png',
  './vendor/images/layers-2x.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((k) => k.startsWith('sp-shell-') && k !== SHELL).map((k) => caches.delete(k)),
  )).then(() => self.clients.claim()));
});

const isTile = (url) => url.hostname.endsWith('basemaps.cartocdn.com') || url.hostname === 'tile.openstreetmap.org';

async function trimTiles(c) {
  const keys = await c.keys();
  if (keys.length <= MAX_TILES) return;
  for (const k of keys.slice(0, keys.length - MAX_TILES)) await c.delete(k);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (isTile(url)) {
    e.respondWith(caches.open(TILES).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); trimTiles(c); }
      return res;
    }).catch(() => new Response('', { status: 504 })));
    return;
  }

  if (url.origin === self.location.origin) {
    // App files: network-first so updates show up, falling back to cache offline.
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) caches.open(SHELL).then((c) => c.put(req, res.clone()));
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))));
  }
});
