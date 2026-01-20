/**
 * =============================================================================
 * INPHRONE™ Service Worker
 * People-Powered Entertainment Intelligence
 * Version: 2.0.0
 * Last Updated: January 19, 2026
 * =============================================================================
 */

const CACHE_VERSION = 'inphrone-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Assets to precache for offline capability
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/inphrone-logo.jpg',
  '/manifest.json',
  '/site.webmanifest'
];

// =============================================================================
// INSTALL EVENT - Precache critical assets
// =============================================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// =============================================================================
// ACTIVATE EVENT - Clean up old caches
// =============================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('inphrone-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// =============================================================================
// FETCH EVENT - Network-first strategy with cache fallback
// =============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests
  if (url.origin !== self.location.origin) return;
  
  // Skip API and auth requests
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/auth/') ||
      url.pathname.includes('supabase')) {
    return;
  }
  
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response for caching
        const responseClone = response.clone();
        
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            cache.put(request, responseClone);
          });
        
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // For navigation requests, return index.html
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// =============================================================================
// PUSH EVENT - Handle incoming push notifications
// =============================================================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  let data = {
    title: 'Inphrone',
    body: 'You have a new notification',
    icon: '/inphrone-logo.jpg',
    badge: '/inphrone-logo.jpg',
    url: '/dashboard',
    tag: 'inphrone-notification'
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || payload.message || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        url: payload.url || payload.action_url || data.url,
        tag: payload.tag || `inphrone-${Date.now()}`,
        data: payload.data || {}
      };
    }
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url,
      timestamp: Date.now(),
      ...data.data
    },
    actions: [
      {
        action: 'open',
        title: 'View',
        icon: '/inphrone-logo.jpg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// =============================================================================
// NOTIFICATION CLICK EVENT - Handle deep linking
// =============================================================================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const url = event.notification.data?.url || '/dashboard';
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === fullUrl && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

// =============================================================================
// NOTIFICATION CLOSE EVENT
// =============================================================================
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});

// =============================================================================
// BACKGROUND SYNC EVENT
// =============================================================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-opinions') {
    event.waitUntil(syncOpinions());
  }
});

async function syncOpinions() {
  // Placeholder for background sync logic
  console.log('[SW] Syncing opinions...');
}

// =============================================================================
// MESSAGE EVENT - Handle messages from main thread
// =============================================================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
