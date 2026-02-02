/**
 * SIDEBAR INIT - Initialize sidebar module
 * ProductiveApp v4.0
 */

(function() {
    'use strict';

    /**
     * Initialize sidebar
     */
    Sidebar.init = function() {
        console.log('🎨 Sidebar: Initializing...');

        // Load saved state
        Sidebar.loadState();

        // Render sidebar
        Sidebar.render();

        // Initialize events
        SidebarEvents.init();

        // Add body class
        document.body.classList.add('has-sidebar');

        console.log('✅ Sidebar: Ready');
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
     * Go to home (dashboard)
     */
    Sidebar.goHome = function() {
        Sidebar.navigate('dashboard');
    };

})();
