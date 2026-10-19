// Service worker: makes the app installable and usable offline.
// - App shell + terrain data for every area are pre-cached on install.
// - Satellite tiles are cached the first time they are fetched (cache-first).
// - Trail data is cached by the page itself (Cache API, see index.html).
const VERSION = 'v11';
const SHELL = `itacare-shell-${VERSION}`;
const TILES = 'itacare-tiles-v1';

const SHELL_FILES = [
  './',
  './index.html',
  './config.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './data/terrain.json',
  './data/terrain.bin',
  './data/saopaulo/terrain.json',
  './data/saopaulo/terrain.bin',
  './data/saopaulo/places.json',
  './data/lima/terrain.json',
  './data/lima/terrain.bin',
  './data/lima/places.json',
  './vendor/three.module.min.js',
  './vendor/OrbitControls.js',
  './vendor/MapControls.js',
  './vendor/Line2.js',
  './vendor/LineGeometry.js',
  './vendor/LineMaterial.js',
  './vendor/LineSegments2.js',
  './vendor/LineSegmentsGeometry.js',
  './vendor/BufferGeometryUtils.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((k) => k.startsWith('itacare-shell-') && k !== SHELL).map((k) => caches.delete(k)),
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'server.arcgisonline.com' || (url.hostname === 'tile.googleapis.com' && url.pathname.includes('/2dtiles/'))) {
    // Imagery tiles never change for our purposes: cache-first. Google tile URLs carry a
    // per-session token, so the cache key is the URL without its query string.
    const key = url.origin + url.pathname;
    e.respondWith(caches.open(TILES).then(async (c) => {
      const hit = await c.match(key);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(key, res.clone());
      return res;
    }));
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
