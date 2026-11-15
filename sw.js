const CACHE = 'prism-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// network-first برای صفحه اصلی (تا نسخه جدید دیده شود)، cache-first برای بقیه (مثلاً Three.js از CDN)
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isPage = req.mode === 'navigate';
  e.respondWith(
    (isPage
      ? fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
          .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
      : caches.match(req).then(hit => hit || fetch(req).then(res => {
          const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
        })))
  );
});
