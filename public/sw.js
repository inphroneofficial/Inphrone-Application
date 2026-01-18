// INPHRONE Service Worker - Fully Optimized

const CACHE_NAME = 'inphrone-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline support
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/inphrone-logo-192.png',
  '/inphrone-logo-512.png',
  '/screenshot-wide.png',
  '/screenshot-narrow.png',
  '/screenshot-tablet.png',
  '/src/main.tsx'
];

// ------------------------
// Install Event
// ------------------------
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ------------------------
// Activate Event
// ------------------------
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ------------------------
// Fetch Event (Offline Support)
// ------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then((networkResponse) => {
            // Cache the response for future offline use
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // Fallback offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// ------------------------
// Push Notifications
// ------------------------
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'Inphrone',
    body: 'You have a new notification',
    icon: '/inphrone-logo-192.png',
    badge: '/inphrone-logo-192.png',
    url: '/dashboard',
    tag: `inphrone-${Date.now()}`
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || payload.message || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        url: payload.url || payload.action_url || data.url,
        tag: payload.tag || data.tag,
        data: payload.data || {}
      };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: { url: data.url, ...data.data },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ------------------------
// Notification Click
// ------------------------
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/dashboard';
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(fullUrl);
    })
  );
});

// ------------------------
// Notification Close
// ------------------------
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});

// ------------------------
// Background Sync
// ------------------------
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  // Implement syncing logic if needed
});

// ------------------------
// Messages from Main Thread
// ------------------------
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
