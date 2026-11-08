// Service Worker: holt die App immer frisch aus dem Netz und fällt offline auf die letzte Kopie zurück.
// Anfragen an Supabase (Daten, Anmeldung, Fotos) laufen unverändert durch.
const CACHE = 'kaffeetagebuch-v3';
const SHELL = ['./', './index.html', './app.css', './app.js', './config.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const keep = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
const STATIC_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // eigene Dateien: Netz zuerst, damit Verbesserungen sofort ankommen
    e.respondWith(fetch(req).then(res => keep(req, res))
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  } else if (STATIC_HOSTS.includes(url.hostname)) {
    // Schriften und Bibliothek mit fester Version: Kopie zuerst
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => keep(req, res))));
  }
});
