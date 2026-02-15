/**
 * GALAXIE VIEW - Integration module for Galaxy Cosmic v3.0
 * Initializes cosmic canvas on #view-galaxy
 */
const GalaxieView = (function() {
    'use strict';

    let initialized = false;

    function init() {
        if (initialized) return;
        console.log('🌌 Galaxie View: init()');
        setupIconListener();
        initialized = true;
        console.log('🌌 Galaxie View initialized');
    }


    function setupIconListener() {
        var icon = document.getElementById('galaxy-icon');
        if (icon) {
            icon.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                open();
            };
            console.log('🌌 Connected to #galaxy-icon');
        } else {
            // Fallback: listen for clicks on dynamically added icon
            document.addEventListener('click', function(e) {
                var target = e.target.closest('#galaxy-icon');
                if (target) {
                    e.preventDefault();
                    e.stopPropagation();
                    open();
                }
            });
        }
    }

    function open() {
        console.log('🌌 GalaxieView.open() -> opening Galaxy Cosmic v3.0');
        // Initialize Galaxy Cosmic (canvas-based infinite canvas)
        if (window.GalaxyCosmic && typeof window.GalaxyCosmic.init === 'function') {
            window.GalaxyCosmic.init();
        } else {
            console.warn('⚠️ Galaxy Cosmic not loaded yet, waiting...');
            // Retry after brief delay (lazy load might not be complete)
            setTimeout(() => {
                if (window.GalaxyCosmic && typeof window.GalaxyCosmic.init === 'function') {
                    window.GalaxyCosmic.init();
                } else {
                    console.error('❌ Galaxy Cosmic failed to load');
                }
            }, 500);
        }
    }

    function close() {
        console.log('🌌 GalaxieView.close() -> closing canvas galaxy view');
        if (typeof window.closeGalaxyView === 'function') {
            window.closeGalaxyView();
        }
    }

    function toggle() {
        var galaxyView = document.getElementById('view-galaxy');
        if (galaxyView && galaxyView.classList.contains('active')) {
            close();
        } else {
            open();
        }
    }

    function isOpened() {
        var galaxyView = document.getElementById('view-galaxy');
        return galaxyView && galaxyView.classList.contains('active');
    }

    function refresh() {
        // Reload the iframe if needed
        var iframe = document.getElementById('galaxy-iframe');
        if (iframe) {
            var src = iframe.src;
            if (!src || !src.includes('galaxy')) {
                iframe.src = '/galaxy/index.html';
            }
        }
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

    return {
        init: init,
        open: open,
        close: close,
        toggle: toggle,
        isOpened: isOpened,
        refresh: refresh
    };
})();

window.GalaxieView = GalaxieView;
window.openGalaxieView = function() { GalaxieView.open(); };
window.closeGalaxieView = function() { GalaxieView.close(); };
window.initGalaxieView = function() { GalaxieView.init(); };

console.log('📦 galaxie-view.js loaded');
