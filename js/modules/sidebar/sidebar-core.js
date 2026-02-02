/**
 * SIDEBAR CORE - Toggle-based sidebar
 * ProductiveApp v4.0
 */

const Sidebar = (function() {
    'use strict';

    const STORAGE_KEY = 'productiveapp_sidebar';

    let state = {
        expanded: false,
        mobileOpen: false,
        activeItem: 'dashboard',
        userStatus: 'online',
        unreadMessages: 0
    };

    // Navigation config
    const navItems = [
        { id: 'dashboard', icon: 'home', label: 'Dashboard', tooltip: 'Tableau de bord' },
        { id: 'tasks', icon: 'check-square', label: 'Tâches', tooltip: 'Gérer les tâches' },
        { id: 'notes', icon: 'file-text', label: 'Notes', tooltip: 'Éditeur de notes' },
        { id: 'projects', icon: 'folder', label: 'Projets', tooltip: 'Vos projets' },
        { id: 'galaxy', icon: 'sparkles', label: 'Galaxy', tooltip: 'Vue Galaxy' },
        { id: 'divider1', type: 'divider' },
        { id: 'messaging', icon: 'message-circle', label: 'Chat IA', tooltip: 'Assistant IA', badge: true },
        { id: 'journal', icon: 'book-open', label: 'Journal', tooltip: 'Journal d\'activité' },
        { id: 'divider2', type: 'divider' },
        { id: 'psycho-audit', icon: 'brain', label: 'Psycho-Audit', tooltip: 'Analyse', tag: 'NEW' },
        { id: 'reports', icon: 'file-bar-chart', label: 'Rapports', tooltip: 'Générer rapports' }
    ];

    const footerItems = [
        { id: 'settings', icon: 'settings', label: 'Paramètres', tooltip: 'Réglages' },
        { id: 'theme', icon: 'palette', label: 'Thème', tooltip: 'Changer le thème' },
        { id: 'logout', icon: 'log-out', label: 'Déconnexion', tooltip: 'Se déconnecter' }
    ];

    /**
     * Toggle sidebar expanded state
     */
    function toggle() {
        state.expanded = !state.expanded;
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.toggle('expanded', state.expanded);
        }
        if (overlay) {
            overlay.classList.toggle('active', state.expanded);
        }

        saveState();
    }

    /**
     * Expand sidebar
     */
    function expand() {
        if (!state.expanded) toggle();
    }

    /**
     * Collapse sidebar
     */
    function collapse() {
        if (state.expanded) toggle();
    }

    /**
     * Navigate to an item
     */
    function navigate(itemId) {
        state.activeItem = itemId;

        // Update visual state
        document.querySelectorAll('.sidebar-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === itemId);
        });

        // Execute navigation
        executeNavigation(itemId);

        // Collapse on navigation (better UX)
        if (window.innerWidth > 768) {
            setTimeout(collapse, 150);
        }
    }

    /**
     * Execute navigation action
     */
    function executeNavigation(itemId) {
        const routedViews = ['dashboard', 'tasks', 'projects', 'notes'];

        if (routedViews.includes(itemId) && typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate(itemId);
            return;
        }

        switch (itemId) {
            case 'galaxy':
                document.getElementById('galaxy-icon')?.click();
                break;
            case 'messaging':
                document.getElementById('chatbot-toggle')?.click();
                break;
            case 'journal':
                ViewRouter?.navigate('tasks');
                setTimeout(() => {
                    document.querySelector('.journal-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
                break;
            case 'psycho-audit':
                document.getElementById('premium-report-btn')?.click();
                break;
            case 'reports':
                ViewRouter?.navigate('tasks');
                setTimeout(() => {
                    document.querySelector('.journal-report')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
                break;
            case 'settings':
                console.log('Settings - Coming soon');
                break;
            case 'theme':
                document.getElementById('theme-btn')?.click();
                break;
            case 'logout':
                if (typeof Auth !== 'undefined') Auth.logout();
                break;
        }
    }

    /**
     * Set active item
     */
    function setActiveItem(itemId) {
        state.activeItem = itemId;
        document.querySelectorAll('.sidebar-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === itemId);
        });
    }

    /**
     * Save state to localStorage
     */
    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                expanded: state.expanded,
                userStatus: state.userStatus
            }));
        } catch (e) {}
    }

    /**
     * Load state from localStorage
     */
    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                state.userStatus = parsed.userStatus || 'online';
            }
        } catch (e) {}
    }

    // Public API
    return {
        get state() { return state; },
        toggle,
        expand,
        collapse,
        navigate,
        setActiveItem,
        navItems,
        footerItems,
        loadState,
        saveState
    };
})();

if (typeof window !== 'undefined') {
    window.Sidebar = Sidebar;
}
