/**
 * SERVICE WORKER v999.0 - AUTO-DESTRUCT
 * Remplace et tue définitivement le SW v4.0
 * S'auto-désinstalle immédiatement après installation
 */

const VERSION = 'v999.0-kill-sw-forever';

console.log(`🔥 SW ${VERSION} - AUTO-DESTRUCT MODE ACTIVATED`);

// Installation : vider tous les caches
self.addEventListener('install', (event) => {
  console.log(`🔥 SW ${VERSION} installing - Deleting ALL caches...`);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log(`🗑️ Found ${cacheNames.length} caches to delete`);
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log(`🗑️ Deleting cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ All caches deleted');
      // Force l'activation immédiate
      return self.skipWaiting();
    })
  );
});

// Activation : prendre contrôle immédiat et se désinstaller
self.addEventListener('activate', (event) => {
  console.log(`🔥 SW ${VERSION} activating - Taking control...`);

  event.waitUntil(
    Promise.all([
      // Prendre contrôle de tous les clients immédiatement
      self.clients.claim(),
      // Vider tous les caches (encore une fois pour être sûr)
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    ]).then(() => {
      console.log('✅ SW activated and took control');
      console.log('🔥 Now UNREGISTERING self...');

      // S'auto-désinstaller
      return self.registration.unregister().then((success) => {
        if (success) {
          console.log('✅ SW successfully UNREGISTERED itself');
        } else {
          console.warn('⚠️ SW unregister returned false');
        }
      });
    }).then(() => {
      // Notifier tous les clients de recharger
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          console.log('📤 Sending reload message to client');
          client.postMessage({
            type: 'SW_UNREGISTERED',
            message: 'Service Worker has been removed. Please reload.'
          });
        });
      });
    })
  );
});

// Fetch : ne rien cacher, passer directement au réseau
self.addEventListener('fetch', (event) => {
  // Pass-through mode : ne rien faire, laisser le navigateur gérer
  console.log(`🔥 SW ${VERSION} - Pass-through fetch: ${event.request.url}`);
  event.respondWith(fetch(event.request));
});

// Message handler
self.addEventListener('message', (event) => {
  console.log('📨 SW received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'UNREGISTER') {
    self.registration.unregister().then(() => {
      console.log('✅ SW unregistered via message');
    });
  }
});

console.log(`🔥 SW ${VERSION} - Self-destruct sequence initialized`);
console.log('🔥 This SW will unregister itself after activation');
console.log('🔥 Application will then run WITHOUT any Service Worker');
