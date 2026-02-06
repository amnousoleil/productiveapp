/**
 * ProductiveApp Service Worker v4.0
 * PWA avec cache intelligent et mode offline
 */

const CACHE_NAME = 'productiveapp-v4';
const STATIC_CACHE = 'static-v4';
const API_CACHE = 'api-v4';

// Fichiers à mettre en cache immédiatement
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style-base.css',
  '/css/style-components.css',
  '/css/style-themes.css',
  '/js/modules/config.js',
  '/js/modules/state.js',
  '/js/modules/utils.js',
  '/js/app-modular.js'
];

// Installation - Cache les fichiers statiques
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 SW: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation - Nettoie les vieux caches
self.addEventListener('activate', (event) => {
  console.log('✅ SW: Activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => !name.includes('v4'))
          .map(name => {
            console.log('🗑️ SW: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Stratégie cache-first pour static, network-first pour API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // API calls - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Static files - Cache first, network fallback
  event.respondWith(cacheFirstStrategy(event.request));
});

// Cache-first strategy
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

// Network-first strategy for API
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'OFFLINE', message: 'Mode hors ligne' }
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png',
    badge: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png',
    vibrate: [100, 50, 100],
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ProductiveApp', options)
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

console.log('🚀 ProductiveApp Service Worker v4.0 loaded');
