// =============================================
// GALAXIE VIEW - INTEGRATION MODULE
// Opens the customized Excalidraw (Galaxie View) in an overlay iframe
// =============================================

const GalaxieView = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Use the static build if available, otherwise dev server
        iframeUrl: '/galaxy/index.html',  // Static build path
        devUrl: 'http://localhost:3004',   // Dev server fallback
        overlayId: 'galaxie-view-overlay',
        iframeId: 'galaxie-view-iframe',
        closeButtonId: 'galaxie-view-close'
    };

    let isOpen = false;
    let overlayElement = null;

    /**
     * Initialize the Galaxie View module
     */
    function init() {
        createOverlay();

        // Connect the galaxy icon button to open the view
        const galaxyIcon = document.getElementById('galaxy-icon');
        if (galaxyIcon) {
            galaxyIcon.addEventListener('click', open);
            console.log('🌌 Galaxie View: Connected to #galaxy-icon button');
        }

        console.log('🌌 Galaxie View module initialized');
    }

    /**
     * Create the overlay container with iframe
     */
    function createOverlay() {
        // Check if overlay already exists
        if (document.getElementById(CONFIG.overlayId)) {
            overlayElement = document.getElementById(CONFIG.overlayId);
            return;
        }

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = CONFIG.overlayId;
        overlay.className = 'galaxie-view-overlay hidden';
        overlay.innerHTML = `
            <div class="galaxie-view-header">
                <span class="galaxie-view-title">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="12" y1="2" x2="12" y2="6"></line>
                        <line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line>
                        <line x1="18" y1="12" x2="22" y2="12"></line>
                    </svg>
                    Galaxie View
                </span>
                <button id="${CONFIG.closeButtonId}" class="galaxie-view-close-btn" title="Fermer (Echap)">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <iframe
                id="${CONFIG.iframeId}"
                class="galaxie-view-iframe"
                src=""
                allow="clipboard-read; clipboard-write"
                title="Galaxie View - Whiteboard"
            ></iframe>
        `;

        document.body.appendChild(overlay);
        overlayElement = overlay;

        // Setup events
        setupEvents();
    }

    /**
     * Setup event listeners
     */
    function setupEvents() {
        // Close button
        const closeBtn = document.getElementById(CONFIG.closeButtonId);
        if (closeBtn) {
            closeBtn.addEventListener('click', close);
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                close();
            }
        });

        // Click outside to close (on overlay background)
        overlayElement.addEventListener('click', (e) => {
            if (e.target === overlayElement) {
                close();
            }
        });
    }

    /**
     * Open Galaxie View
     */
    function open() {
        console.log('🌌 GalaxieView.open() called, isOpen:', isOpen);
        if (isOpen) return;

        if (!overlayElement) {
            console.log('🌌 Creating overlay...');
            createOverlay();
        }

        const iframe = document.getElementById(CONFIG.iframeId);
        console.log('🌌 Iframe element found:', !!iframe, 'current src:', iframe?.src);

        if (iframe && (!iframe.src || iframe.src === 'about:blank' || iframe.src === window.location.href)) {
            // Set iframe src directly - the file is known to exist
            iframe.src = CONFIG.iframeUrl;
            console.log('🌌 Set iframe src to:', CONFIG.iframeUrl);
        }

        // Force display and remove hidden
        if (overlayElement) {
            overlayElement.style.display = 'flex';
            overlayElement.classList.remove('hidden');
            console.log('🌌 Overlay shown, classList:', overlayElement.className);
        }

        isOpen = true;

        // Hide scrollbar on body
        document.body.style.overflow = 'hidden';

        console.log('🌌 Galaxie View opened successfully');
    }

    /**
     * Check if static build is available and set iframe src
     */
    async function checkAndSetIframeSrc(iframe) {
        try {
            // Try to fetch the static build
            const response = await fetch(CONFIG.iframeUrl, { method: 'HEAD' });
            if (response.ok) {
                iframe.src = CONFIG.iframeUrl;
                console.log('📦 Using static build:', CONFIG.iframeUrl);
            } else {
                throw new Error('Static build not found');
            }
        } catch (e) {
            // Fallback to dev server
            iframe.src = CONFIG.devUrl;
            console.log('🔧 Using dev server:', CONFIG.devUrl);
        }
    }

    /**
     * Close Galaxie View
     */
    function close() {
        console.log('🌌 GalaxieView.close() called, isOpen:', isOpen);
        if (!isOpen) return;

        if (overlayElement) {
            overlayElement.classList.add('hidden');
            overlayElement.style.display = 'none';
        }
        isOpen = false;

        // Restore scrollbar on body
        document.body.style.overflow = '';

        console.log('🌌 Galaxie View closed');
    }

    /**
     * Toggle Galaxie View
     */
    function toggle() {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    /**
     * Check if currently open
     */
    function isOpened() {
        return isOpen;
    }

    // Inject styles
    function injectStyles() {
        if (document.getElementById('galaxie-view-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'galaxie-view-styles';
        styles.textContent = `
            .galaxie-view-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                z-index: 99999;
                display: none;
                flex-direction: column;
                opacity: 1;
                transition: opacity 0.2s ease;
            }

            .galaxie-view-overlay:not(.hidden) {
                display: flex !important;
            }

            .galaxie-view-overlay.hidden {
                display: none !important;
                opacity: 0;
                pointer-events: none;
            }

            .galaxie-view-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 16px;
                background: #1a1a24;
                border-bottom: 1px solid rgba(139, 92, 246, 0.3);
            }

            .galaxie-view-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: 'Inter', -apple-system, sans-serif;
                font-size: 14px;
                font-weight: 600;
                color: #a78bfa;
            }

            .galaxie-view-title svg {
                color: #8b5cf6;
            }

            .galaxie-view-close-btn {
                background: transparent;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 8px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.15s ease;
            }

            .galaxie-view-close-btn:hover {
                background: rgba(139, 92, 246, 0.2);
                color: #a78bfa;
            }

            .galaxie-view-iframe {
                flex: 1;
                width: 100%;
                border: none;
                background: #121212;
            }

            /* Animation for opening */
            @keyframes galaxieViewFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.98);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .galaxie-view-overlay:not(.hidden) {
                animation: galaxieViewFadeIn 0.2s ease forwards;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .galaxie-view-header {
                    padding: 6px 12px;
                }

                .galaxie-view-title {
                    font-size: 13px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Auto-inject styles when module loads
    injectStyles();

    // Public API
    return {
        init,
        open,
        close,
        toggle,
        isOpened
    };
})();

// Export globally for backward compatibility
window.GalaxieView = GalaxieView;

// Also export functions that galaxy.js provided
window.openGalaxieView = () => GalaxieView.open();
window.closeGalaxieView = () => GalaxieView.close();
window.initGalaxieView = () => GalaxieView.init();

console.log('📦 galaxie-view.js module loaded');
