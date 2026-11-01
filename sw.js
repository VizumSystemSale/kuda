const C = 'kuda-v3g';
const A = ['./', './index.html', './app.js', './ext.js', './go.html', './manifest.webmanifest', './icon.svg'];
/* CDN-хосты офлайн OCR (Tesseract.js) — кэшируем, чтобы скан скринов работал без интернета */
const CDN = /cdn\.jsdelivr\.net|tessdata\.projectnaptha\.com/;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(A)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  const own = url.startsWith(self.location.origin);
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(n => {
      if (n && (n.ok || n.type === 'opaque') && (own || CDN.test(url))) {
        const cp = n.clone();
        caches.open(C).then(c => c.put(e.request, cp));
      }
      return n;
    }).catch(() => (own && e.request.mode === 'navigate') ? caches.match('./index.html') : Response.error()))
  );
});
