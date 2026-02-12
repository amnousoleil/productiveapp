/**
 * ProductiveApp Service Worker v5.0
 * PWA avec cache intelligent - network-first pour CSS/JS
 */

const CACHE_VERSION = 'v42-giri-vision-events-fix';
const STATIC_CACHE = 'static-' + CACHE_VERSION;
const API_CACHE = 'api-' + CACHE_VERSION;
const CDN_CACHE = 'cdn-' + CACHE_VERSION;

// CDNs autorisés - cache-first strategy
const ALLOWED_CDN_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net',
  'https://d1yei2z3i6k35z.cloudfront.net'
  // meet.jit.si volontairement EXCLU - laissé au navigateur pour éviter conflit CSP
];

// Fichiers critiques à pré-cacher
const PRECACHE_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation - Cache les fichiers critiques et force l'activation
self.addEventListener('install', (event) => {
  console.log('🔧 SW v41: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activation - Supprime TOUS les anciens caches
self.addEventListener('activate', (event) => {
  console.log('✅ SW v41: Activated - clearing old caches');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== API_CACHE && name !== CDN_CACHE)
          .map(name => {
            console.log('🗑️ SW: Deleting cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Check if external URL is in allowed CDNs list
  const isAllowedCDN = ALLOWED_CDN_ORIGINS.some(origin => url.href.startsWith(origin));

  // External URLs: only handle allowed CDNs, skip others
  if (url.origin !== self.location.origin) {
    if (isAllowedCDN) {
      // CDNs autorisés - cache first (fonts, libs, images CDN)
      event.respondWith(cacheFirstCDN(event.request));
    }
    return; // Autres domaines externes - laisser passer au navigateur
  }

  // API calls - Network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // CSS & JS files - ALWAYS network first (theme changes must be immediate)
  if (url.pathname.match(/\.(css|js)$/)) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // index.html - Network first (cache busting versions)
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Images, fonts, other static assets - Cache first (rarely change)
  event.respondWith(cacheFirstStrategy(event.request));
});

// Network-first: try network, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'OFFLINE', message: 'Mode hors ligne' }
      }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Offline', { status: 503 });
  }
}

// Cache-first: try cache, fallback to network (for images/fonts)
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Cache-first pour CDNs autorisés (fonts, libs externes)
async function cacheFirstCDN(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request, { mode: 'cors' });
    if (response.ok) {
      const cache = await caches.open(CDN_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('CDN fetch failed:', request.url, error);
    return new Response('CDN Offline', { status: 503 });
  }
}

// Listen for SKIP_WAITING message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'ProductiveApp', {
      body: data.body || 'Nouvelle notification',
      icon: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png',
      badge: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png',
      vibrate: [100, 50, 100],
      data: data.url || '/'
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

console.log('🚀 ProductiveApp Service Worker v33 loaded - CDN Whitelist');

// ========================================
// WEB PUSH NOTIFICATIONS
// ========================================

self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: data.icon || '/images/icon-192.png',
    badge: data.badge || '/images/badge-96.png',
    data: data.data || {},
    actions: data.actions || [],
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: data.tag || 'notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre ProductiveApp est déjà ouverte, focus dessus
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => client.navigate(url));
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');
  // Renew subscription
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('BHp4veU7EMv3jyMj5eKw6MSQdrjgN2WLieNehEIM97NV4Esg1sVS0EqzxML0eM817bUOtOOgyj9i9WTZGcEdl6I')
    })
  );
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
