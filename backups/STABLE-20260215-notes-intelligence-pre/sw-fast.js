// sw-fast.js v99.0 - FORCE TOTAL REFRESH 🚀
// Strategy: Network-first for critical, Cache-first for static, Stale-while-revalidate for API
// v99.0: NUCLEAR CACHE CLEAR - Notes v6.0

const CACHE_VERSION = 'v99-nuclear-refresh-2026-02-14';
const CACHE_CRITICAL = `${CACHE_VERSION}-critical`;
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_API = `${CACHE_VERSION}-api`;

// ============================================================================
// CRITICAL FILES (cache immediately on install)
// ============================================================================
const CRITICAL_FILES = [
    '/',
    '/index.html',
    '/js/fast-loader.js',
    '/js/modules/config.js',
    '/js/modules/state.js',
    '/js/modules/utils.js',
    '/js/modules/auth/auth.js',
    '/js/modules/auth/login.js',
    '/js/modules/router.js',
    '/css/style-base.css',
    '/css/style-themes.css'
];

// ============================================================================
// INSTALL: Pre-cache critical files only
// ============================================================================
self.addEventListener('install', (event) => {
    console.log('⚡ SW Fast: Installing...');

    event.waitUntil(
        caches.open(CACHE_CRITICAL)
            .then((cache) => {
                console.log('📦 Caching critical files...');
                return cache.addAll(CRITICAL_FILES);
            })
            .then(() => {
                console.log('✅ Critical files cached');
                return self.skipWaiting(); // Activate immediately
            })
    );
});

// ============================================================================
// ACTIVATE: Clean old caches
// ============================================================================
self.addEventListener('activate', (event) => {
    console.log('🔄 SW Fast: Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName.startsWith('v') && !cacheName.startsWith(CACHE_VERSION)) {
                            console.log(`🗑️ Deleting old cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ SW Fast activated');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// ============================================================================
// FETCH: Smart caching strategy
// ============================================================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // ========================================
    // STRATEGY 1: HTML - Network first (always fresh)
    // ========================================
    if (request.destination === 'document' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Update cache in background
                    const responseClone = response.clone();
                    caches.open(CACHE_CRITICAL).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if offline
                    return caches.match(request);
                })
        );
        return;
    }

    // ========================================
    // STRATEGY 2: API - Stale-while-revalidate (fast + fresh)
    // ========================================
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            caches.open(CACHE_API).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    const fetchPromise = fetch(request).then((networkResponse) => {
                        // Update cache in background
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });

                    // Return cached immediately if available, otherwise wait for network
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // ========================================
    // STRATEGY 3: Static (CSS/JS/Images) - Cache first (fast!)
    // ========================================
    if (
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font' ||
        url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|webp)$/i)
    ) {
        event.respondWith(
            caches.open(CACHE_STATIC).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        // Return cached immediately
                        return cachedResponse;
                    }

                    // Fetch and cache
                    return fetch(request).then((networkResponse) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // ========================================
    // STRATEGY 4: Everything else - Network only
    // ========================================
    event.respondWith(fetch(request));
});

// ============================================================================
// BACKGROUND SYNC (future enhancement)
// ============================================================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('🔄 Background sync triggered');
        // Implement background sync logic here
    }
});

// ============================================================================
// PUSH NOTIFICATIONS (future enhancement)
// ============================================================================
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        console.log('📬 Push notification:', data);

        event.waitUntil(
            self.registration.showNotification(data.title || 'ProductiveApp', {
                body: data.body || 'Nouvelle notification',
                icon: '/assets/images/logos/golden-ball.png?v=2',
                badge: '/assets/images/logos/golden-ball.png?v=2',
                data: data
            })
        );
    }
});

console.log('🚀 SW Fast v1.0 loaded');
