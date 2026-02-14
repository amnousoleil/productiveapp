// animations-lite.js v1.0 - MINIMAL ANIMATIONS FOR LOGIN SCREEN 🎨
// Ultra-lightweight: NO canvas, NO particles, just subtle CSS effects

const AnimationsLite = {
    enabled: true,
    intensity: 0.15, // 15% - minimal for login

    init() {
        console.log('🎨 Animations Lite: Minimal mode');

        // Apply minimal intensity CSS variable
        document.documentElement.style.setProperty('--anim-intensity', this.intensity);

        // Add subtle background gradient animation only
        this.addSubtleBackground();

        // Disable canvas if it exists
        const canvas = document.getElementById('matrix-bg');
        if (canvas) {
            canvas.style.display = 'none';
        }

        console.log('✅ Animations Lite ready');
    },

    addSubtleBackground() {
        // NO VISIBLE OVERLAY - Prevents white flashing
        // Just add minimal fade-in CSS for UI elements
        if (!document.getElementById('lite-animations-style')) {
            const style = document.createElement('style');
            style.id = 'lite-animations-style';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .fade-in {
                    animation: fadeIn 0.4s ease forwards;
                }
            `;
            document.head.appendChild(style);
        }

        // No overlay created - prevents white screen flashing
        console.log('✅ Animations Lite: No overlay mode (prevents flash)');
    },

    // Upgrade to full animations after login
    upgradeToFull() {
        console.log('⬆️ Upgrading to full animations...');

        // 1. Show canvas with smooth fade-in
        const canvas = document.getElementById('matrix-bg');
        if (canvas) {
            canvas.style.display = 'block';
            canvas.style.opacity = '0';
            canvas.style.transition = 'opacity 1s ease-in-out';
            // Fade in slowly to prevent flash
            setTimeout(() => {
                canvas.style.opacity = '0.4';
            }, 100);
            console.log('✅ Canvas displayed (smooth fade)');
        }

        // 2. No overlay to remove (prevents white flash)

        // 3. Load full animations dynamically
        if (window.FastLoader) {
            window.FastLoader.loadModule('animations').then(() => {
                console.log('✅ Animations module loaded via FastLoader');
                // Init animation engine
                if (window.initAnimation) {
                    window.initAnimation();
                }
                // Set elegant intensity (45%)
                if (window.AnimEngine) {
                    setTimeout(() => {
                        window.AnimEngine.setIntensity(45);
                        console.log('✅ Animations set to 45% (elegant mode)');
                    }, 500);
                }
            }).catch(err => {
                console.error('❌ Failed to load animations via FastLoader:', err);
            });
        } else {
            // Fallback: load script directly
            const script = document.createElement('script');
            script.src = '/js/animations.js?v=5000';
            script.onload = () => {
                console.log('✅ Full animations loaded (fallback)');
                if (window.initAnimation) {
                    window.initAnimation();
                }
                if (window.AnimEngine) {
                    setTimeout(() => {
                        window.AnimEngine.setIntensity(45);
                    }, 500);
                }
            };
            document.body.appendChild(script);
        }
    },

    disable() {
        this.enabled = false;
        const overlay = document.getElementById('lite-bg-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AnimationsLite.init());
} else {
    AnimationsLite.init();
}

// Listen for login success to upgrade animations
window.addEventListener('userLoggedIn', () => {
    console.log('🎨 AnimationsLite: userLoggedIn received, upgrading in 1s...');
    setTimeout(() => {
        AnimationsLite.upgradeToFull();
    }, 1000);
});

// Expose globally
window.AnimationsLite = AnimationsLite;
