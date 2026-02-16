
const CACHE_NAME = 'agrihub-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(event.request).catch(() => {
        // Silent fail for failed fetches (like tracking or non-critical assets)
        return new Response('Offline content unavailable', { status: 503 });
      });
    })
  );
});
