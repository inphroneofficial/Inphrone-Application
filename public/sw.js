/* =========================================================
   INPHRONE SERVICE WORKER — UNIFIED PRODUCTION (v3)
   Handles:
   - Offline caching
   - API network-first
   - Push notifications
   - Background sync
   - SkipWaiting updates
========================================================= */

const APP_VERSION = 'v3.0.0';
const STATIC_CACHE = `inphrone-static-${APP_VERSION}`;
const DYNAMIC_CACHE = `inphrone-dynamic-${APP_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

/* ---------------------------------------------------------
   Static assets to cache (App Shell)
--------------------------------------------------------- */
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',

  '/inphrone-logo-192.png',
  '/inphrone-logo-512.png',
  '/favicon.ico',

  '/screenshot-wide.png',
  '/screenshot-narrow.png',
  '/screenshot-tablet.png',

  '/src/main.tsx'
];

/* ---------------------------------------------------------
   INSTALL
--------------------------------------------------------- */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ---------------------------------------------------------
   ACTIVATE
--------------------------------------------------------- */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE].includes(key)) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------------------------------------------------------
   FETCH
   - API: network-first
   - Navigation: offline fallback
   - Assets: cache-first
--------------------------------------------------------- */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);

  // ----------------------
  // Network-first for API calls
  // ----------------------
  if (requestURL.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ----------------------
  // Offline fallback for navigation
  // ----------------------
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_PAGE))
    );
    return;
  }

  // ----------------------
  // Cache-first for static assets
  // ----------------------
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((networkResponse) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

/* ---------------------------------------------------------
   PUSH NOTIFICATIONS
--------------------------------------------------------- */
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
        ...data,
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
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url: data.url, ...data.data },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/* ---------------------------------------------------------
   NOTIFICATION CLICK
--------------------------------------------------------- */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/dashboard';
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === fullUrl && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(fullUrl);
      })
  );
});

/* ---------------------------------------------------------
   NOTIFICATION CLOSE
--------------------------------------------------------- */
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});

/* ---------------------------------------------------------
   BACKGROUND SYNC
--------------------------------------------------------- */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  // Implement offline sync logic if needed
});

/* ---------------------------------------------------------
   MESSAGE CHANNEL (Skip waiting)
--------------------------------------------------------- */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
