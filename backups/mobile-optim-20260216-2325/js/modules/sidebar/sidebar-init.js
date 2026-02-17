/**
 * SIDEBAR INIT v5.0
 * ProductiveApp - Initialisation
 */

(function() {
    'use strict';

    /**
     * Initialize sidebar
     */
    Sidebar.init = function() {
        console.log('🎨 Sidebar v5: Initializing...');

        // Charger l'état sauvegardé
        Sidebar.loadState();

        // Attendre que le DOM soit prêt (après display: flex appliqué)
        requestAnimationFrame(function() {
            // Rendre la sidebar
            Sidebar.render();

            // Initialiser les events
            SidebarEvents.init();

            // Ajouter classe au body
            document.body.classList.add('has-sidebar');

            // Fallback: re-render si sidebar vide après 200ms
            setTimeout(function() {
                var sidebar = document.getElementById('app-sidebar');
                var navItems = sidebar ? sidebar.querySelectorAll('.sidebar-item') : [];
                if (sidebar && navItems.length === 0) {
                    console.warn('⚠️ Sidebar: Empty after init, re-rendering...');
                    Sidebar.render();
                    if (typeof SidebarEvents !== 'undefined') {
                        SidebarEvents.setupTooltips();
                    }
                }
            }, 200);

            console.log('✅ Sidebar v5: Ready');
        });
    };

    /**
     * Set unread messages count
     */
    Sidebar.setUnreadMessages = function(count) {
        Sidebar.state.unreadMessages = count;
        const badge = document.querySelector('.sidebar-item[data-id="mahayawen"] .sidebar-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    };

    /**
     * Go to home
     */
    Sidebar.goHome = function() {
        Sidebar.navigate('dashboard');
    };
})();
