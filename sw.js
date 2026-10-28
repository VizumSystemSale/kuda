const C = 'kuda-v1';
const A = ['./', './index.html', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(A)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(n => {
      const cp = n.clone();
      if (e.request.url.startsWith(self.location.origin)) {
        caches.open(C).then(c => c.put(e.request, cp));
      }
      return n;
    }).catch(() => caches.match('./index.html')))
  );
});
