const C = 'kuda-v4-stellar-ai-6';
const A = ['./', './index.html', './app.js', './ext.js', './stellar.js', './stellar.css', './go.html', './manifest.webmanifest', './icon.svg'];
/* CDN-хосты офлайн OCR (Tesseract.js) — кэшируем, чтобы скан скринов работал без интернета */
const CDN = /cdn\.jsdelivr\.net|tessdata\.projectnaptha\.com/;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(A)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => clients.claim()));
});
function networkFirst(request) {
  return fetch(request).then(response => {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(C).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('./index.html');
    return Response.error();
  });
}
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  const own = url.startsWith(self.location.origin);
  /* Код приложения всегда сначала проверяет сеть: телефон получает новую версию после обычного обновления. */
  if (own) {
    e.respondWith(networkFirst(e.request));
    return;
  }
  if (CDN.test(url)) {
    e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(response => {
      if (response && (response.ok || response.type === 'opaque')) {
        const copy = response.clone();
        caches.open(C).then(cache => cache.put(e.request, copy));
      }
      return response;
    })));
  }
});
