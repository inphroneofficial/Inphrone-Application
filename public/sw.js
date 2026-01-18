/* =========================================================
   INPHRONE SERVICE WORKER — PRODUCTION GRADE (V2)
   ========================================================= */

const APP_VERSION = 'v2.0.0';
const STATIC_CACHE = `inphrone-static-${APP_VERSION}`;
const DYNAMIC_CACHE = `inphrone-dynamic-${APP_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

/* ---------------------------------------------------------
   STATIC ASSETS (App Shell)
--------------------------------------------------------- */
const STATIC_ASSETS = [
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

/* ---------------------------------------------------------
   INSTALL
--------------------------------------------------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

/* ---------------------------------------------------------
   ACTIVATE
--------------------------------------------------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE].includes(key)) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------------------------------------------------------
   FETCH STRATEGY
--------------------------------------------------------- */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);

  /* API → Network First */
  if (requestURL.pathname.startsWith('/api')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  /* Pages → App Shell */
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_PAGE))
    );
    return;
  }

  /* Assets → Cache First */
  event.respondWith(cacheFirst(event.request));
});

/* ---------------------------------------------------------
   STRATEGIES
--------------------------------------------------------- */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache = await caches.open(DYNAMIC_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match(request);
  }
}

/* ---------------------------------------------------------
   PUSH NOTIFICATIONS
--------------------------------------------------------- */
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Inphrone',
    body: 'You have a new update',
    icon: '/inphrone-logo-192.png',
    badge: '/inphrone-logo-192.png',
    url: '/insights'
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: { url: payload.url },
      vibrate: [100, 50, 100],
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  );
});

/* ---------------------------------------------------------
   NOTIFICATION CLICK
--------------------------------------------------------- */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url === url && 'focus' in client) return client.focus();
        }
        return clients.openWindow(url);
      })
  );
});

/* ---------------------------------------------------------
   BACKGROUND SYNC (READY)
--------------------------------------------------------- */
self.addEventListener('sync', (event) => {
  if (event.tag === 'inphrone-sync') {
    // future sync logic
  }
});

/* ---------------------------------------------------------
   MESSAGE CHANNEL
--------------------------------------------------------- */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
