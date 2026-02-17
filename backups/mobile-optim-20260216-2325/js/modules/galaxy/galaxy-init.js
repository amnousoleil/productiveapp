/**
 * GALAXY VIEW - INITIALIZATION HANDLER
 * Initializes Galaxy View Premium when navigating to Galaxy View
 */

(function() {
    'use strict';

    let initialized = false;

    // Listen for router navigation events
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🌌 Galaxy Init: Setting up navigation listener');

        // Listen for router navigation
        if (typeof ViewRouter !== 'undefined') {
            // Override original navigate to add our hook
            const originalNavigate = ViewRouter.navigate;

            ViewRouter.navigate = function(viewKey) {
                // Call original
                const result = originalNavigate.apply(this, arguments);

                // If navigating to galaxy view, initialize Premium
                if (viewKey === 'galaxy' && typeof GalaxyViewPremium !== 'undefined') {
                    if (!initialized) {
                        console.log('🌌 Initializing Galaxy View Premium 6.0...');
                        setTimeout(() => {
                            GalaxyViewPremium.init();
                            initialized = true;
                        }, 100);
                    }
                }

                return result;
            };

            console.log('✅ Galaxy Init: Navigation hook installed');
        }

        // Fallback: watch for view-galaxy becoming active
        const observer = new MutationObserver((mutations) => {
            const galaxyView = document.getElementById('view-galaxy');
            if (galaxyView && galaxyView.classList.contains('active')) {
                if (!initialized && typeof GalaxyViewPremium !== 'undefined') {
                    console.log('🌌 Initializing Galaxy View Premium 6.0 (via observer)...');
                    setTimeout(() => {
                        GalaxyViewPremium.init();
                        initialized = true;
                    }, 100);
                }
            }
        });

        const galaxyView = document.getElementById('view-galaxy');
        if (galaxyView) {
            observer.observe(galaxyView, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    });
})();

console.log('📦 Galaxy Init loaded');
