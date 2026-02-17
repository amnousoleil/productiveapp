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

        // Rendre la sidebar
        Sidebar.render();

        // Initialiser les events
        SidebarEvents.init();

        // Ajouter classe au body
        document.body.classList.add('has-sidebar');

        console.log('✅ Sidebar v5: Ready');
    };

    /**
     * Set unread messages count
     */
    Sidebar.setUnreadMessages = function(count) {
        Sidebar.state.unreadMessages = count;
        const badge = document.querySelector('.sidebar-item[data-id="messaging"] .sidebar-badge');
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
