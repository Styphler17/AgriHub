
const CACHE_NAME = 'agrihub-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/index.css'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('Offline content unavailable', { 
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'AgriHub Notification';
  const options = {
    body: data.body || 'You have a new update',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'agrihub-notification',
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: data.actions || [
      { action: 'open', title: 'View', icon: '/logo.png' },
      { action: 'close', title: 'Dismiss', icon: '/logo.png' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event (for offline actions)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-prices') {
    event.waitUntil(
      // Sync price data when back online
      fetch('/api/sync-prices')
        .then((response) => response.json())
        .then((data) => {
          console.log('Background sync completed:', data);
        })
        .catch((error) => {
          console.error('Background sync failed:', error);
        })
    );
  }
});

// Periodic background sync (for price alerts)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-price-alerts') {
    event.waitUntil(
      fetch('/api/check-alerts')
        .then((response) => response.json())
        .then((alerts) => {
          alerts.forEach((alert) => {
            self.registration.showNotification('Price Alert!', {
              body: `${alert.commodity} price changed to GH₵${alert.price}`,
              icon: '/logo.png',
              tag: `price-alert-${alert.id}`,
              data: { url: '/prices' }
            });
          });
        })
        .catch((error) => console.error('Alert check failed:', error))
    );
  }
});
