/**
 * ================================================
 * PERFORMANCE UTILITIES
 * Debounce, Throttle, RequestAnimationFrame helpers
 * ================================================
 */

const PerformanceUtils = {
    /**
     * Debounce - retarde l'exécution jusqu'à ce que l'utilisateur arrête d'interagir
     * Parfait pour: search, resize, input typing
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle - limite le nombre d'exécutions par période
     * Parfait pour: scroll, mousemove, resize
     */
    throttle(func, limit = 100) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * RequestAnimationFrame wrapper - synchronise avec le browser paint
     * Parfait pour: animations, DOM updates
     */
    raf(callback) {
        if (typeof requestAnimationFrame !== 'undefined') {
            return requestAnimationFrame(callback);
        }
        return setTimeout(callback, 16); // ~60fps fallback
    },

    /**
     * Lazy load images - charge uniquement les images visibles
     */
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px' // Charge 50px avant d'être visible
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback pour anciens browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    },

    /**
     * Batch DOM updates - regroupe les modifications DOM
     */
    batchDOMUpdates(callback) {
        this.raf(() => {
            callback();
        });
    },

    /**
     * Mesure performance d'une fonction
     */
    measure(name, func) {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    },

    /**
     * Détecte si l'appareil est lent (low-end device)
     */
    isLowEndDevice() {
        // Check hardware concurrency (nombre de cores)
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            return true;
        }

        // Check memory
        if (navigator.deviceMemory && navigator.deviceMemory < 4) {
            return true;
        }

        return false;
    },

    /**
     * Adapte la qualité selon la performance de l'appareil
     */
    adaptQuality() {
        if (this.isLowEndDevice()) {
            console.log('🔽 Low-end device detected - reducing quality');

            // Réduit l'intensité des animations
            if (typeof AnimationControls !== 'undefined') {
                AnimationControls.setPreset('zen'); // 15% au lieu de 45%
            }

            // Désactive les effets non-essentiels
            document.documentElement.classList.add('low-end-device');

            return 'low';
        }

        return 'high';
    },

    /**
     * Prefetch les ressources pour la prochaine page
     */
    prefetch(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    },

    /**
     * Preload une ressource critique
     */
    preload(url, as = 'script') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = as;
        document.head.appendChild(link);
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    // Lazy load toutes les images
    PerformanceUtils.lazyLoadImages();

    // Adapte la qualité
    PerformanceUtils.adaptQuality();

    console.log('⚡ Performance Utils initialized');
});

// Export global
window.PerformanceUtils = PerformanceUtils;
