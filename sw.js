/**
 * ProductiveApp Service Worker v5.0
 * PWA avec cache intelligent - network-first pour CSS/JS
 */

const CACHE_VERSION = 'v23-theme-fix';
const STATIC_CACHE = 'static-' + CACHE_VERSION;
const API_CACHE = 'api-' + CACHE_VERSION;

// Fichiers critiques à pré-cacher
const PRECACHE_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation - Cache les fichiers critiques et force l'activation
self.addEventListener('install', (event) => {
  console.log('🔧 SW v6: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activation - Supprime TOUS les anciens caches
self.addEventListener('activate', (event) => {
  console.log('✅ SW v5: Activated - clearing old caches');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== API_CACHE)
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

  // CRITICAL: Skip external URLs (CDNs, fonts, images from other domains)
  // Let the browser handle these directly without service worker interference
  if (url.origin !== self.location.origin) {
    return; // Don't intercept - let browser handle normally
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

console.log('🚀 ProductiveApp Service Worker v13 loaded - Cache refresh');
