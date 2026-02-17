/**
 * ProductiveApp Service Worker - SELF-UNINSTALL VERSION
 * This SW uninstalls itself and clears all caches to fix CSP violations
 * Version: v100-self-destruct
 */

console.log('🗑️ Service Worker: Self-destruct mode activated');

// Install: immediate activation
self.addEventListener('install', event => {
  console.log('🗑️ SW Install: Skipping waiting...');
  self.skipWaiting();
});

// Activate: delete all caches and unregister
self.addEventListener('activate', event => {
  console.log('🗑️ SW Activate: Deleting all caches and unregistering...');

  event.waitUntil(
    Promise.all([
      // Delete ALL caches
      caches.keys().then(cacheNames => {
        console.log(`🗑️ Deleting ${cacheNames.length} caches:`, cacheNames);
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }),
      // Claim all clients to take control immediately
      self.clients.claim()
    ]).then(() => {
      console.log('✅ All caches deleted, SW is now in control');

      // Notify all clients to unregister this SW
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_SELF_DESTRUCT',
            message: 'Service Worker is uninstalling itself. Please reload the page.'
          });
        });
      });
    })
  );
});

// Fetch: pass through everything (no caching)
self.addEventListener('fetch', event => {
  // Just pass through to the network, no caching
  event.respondWith(fetch(event.request));
});

// Message handler
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🗑️ Service Worker loaded: SELF-DESTRUCT mode');
