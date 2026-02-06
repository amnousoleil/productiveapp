/**
 * GALAXIE VIEW - Integration module for Excalidraw
 * Uses embedded iframe in #view-galaxy via ViewRouter
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
        console.log('🌌 GalaxieView.open() -> navigating to galaxy view');
        if (typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate('galaxy');
        } else if (typeof Router !== 'undefined') {
            Router.navigate('galaxy');
        } else {
            // Fallback: manually show #view-galaxy
            document.querySelectorAll('.view-container').forEach(function(v) {
                v.classList.remove('active');
            });
            var galaxyView = document.getElementById('view-galaxy');
            if (galaxyView) {
                galaxyView.classList.add('active');
            }
        }
    }

    function close() {
        console.log('🌌 GalaxieView.close() -> navigating away from galaxy');
        if (typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate('dashboard');
        } else if (typeof Router !== 'undefined') {
            Router.navigate('dashboard');
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
