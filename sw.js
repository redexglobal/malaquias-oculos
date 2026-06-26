/* ============================================================
   SERVICE WORKER — Dr. Malaquias Óculos (PWA) — paridade fibro
   - HTML/navegacao: NETWORK-FIRST (online sempre pega versao nova; offline shell)
   - Supabase (dados): SEM cache, sempre rede
   - CDN/estaticos: cache-first
   - skipWaiting + clients.claim
   ============================================================ */
const CACHE_VERSION = 'mlq-oculos-v9';
const SHELL_URL = '/';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(['/', '/index.html', '/icon.svg', '/manifest.json']).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.hostname.endsWith('supabase.co')) return;

  const isNav = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isNav) {
    event.respondWith(
      fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE_VERSION).then((c) => c.put(SHELL_URL, copy)).catch(() => {}); return res; })
        .catch(() => caches.match(req).then((m) => m || caches.match(SHELL_URL)))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
        const copy = res.clone(); caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => cached))
  );
});
