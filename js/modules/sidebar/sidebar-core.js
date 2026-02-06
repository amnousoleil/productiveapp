/**
 * SIDEBAR CORE v5.0
 * ProductiveApp - Toggle-based sidebar
 *
 * Comportement:
 * - Par défaut: OUVERTE
 * - toggleCollapse(): replie/déplie
 * - État sauvegardé en localStorage
 */

const Sidebar = (function() {
    'use strict';

    const STORAGE_KEY = 'productiveapp_sidebar_v5';

    // État initial
    let state = {
        collapsed: false,      // false = ouverte par défaut
        mobileOpen: false,
        activeItem: 'dashboard',
        userStatus: 'online',
        unreadMessages: 0
    };

    // Configuration navigation
    const navItems = [
        { id: 'dashboard', icon: 'home', label: 'Dashboard', tooltip: 'Tableau de bord' },
        { id: 'tasks', icon: 'check-square', label: 'Tâches', tooltip: 'Gérer les tâches' },
        { id: 'notes', icon: 'file-text', label: 'Notes', tooltip: 'Éditeur de notes' },
        { id: 'projects', icon: 'folder', label: 'Projets', tooltip: 'Vos projets' },
        { id: 'galaxy', icon: 'sparkles', label: 'Galaxy', tooltip: 'Vue Galaxy' },
        { id: 'divider1', type: 'divider' },
        { id: 'mahayawen', icon: 'bot', label: 'Mahayawen', tooltip: 'Assistant IA', badge: true },
        { id: 'team-messaging', icon: 'messages', label: 'TeamTalk', tooltip: 'TeamTalk' },
        { id: 'campaigns', icon: 'mail', label: 'Campagnes', tooltip: 'Email Campaigns', tag: 'NEW' },
        { id: 'journal', icon: 'book-open', label: 'Journal', tooltip: 'Journal d\'activité' },
        { id: 'divider2', type: 'divider' },
        { id: 'accounting', icon: 'calculator', label: 'Comptabilité', tooltip: 'Gestion comptable', tag: 'NEW' },
        { id: 'psycho-audit', icon: 'brain', label: 'Psycho-Audit', tooltip: 'Analyse psycho' },
        { id: 'behavioral', icon: 'activity', label: 'Mon Profil', tooltip: 'Profil comportemental' },
        { id: 'reports', icon: 'file-bar-chart', label: 'Rapports', tooltip: 'Générer rapports' }
    ];

    const footerItems = [
        { id: 'settings', icon: 'settings', label: 'Paramètres', tooltip: 'Réglages' },
        { id: 'theme', icon: 'palette', label: 'Thème', tooltip: 'Changer le thème' },
        { id: 'logout', icon: 'log-out', label: 'Déconnexion', tooltip: 'Se déconnecter' }
    ];

    // ==========================================
    // TOGGLE FUNCTIONS
    // ==========================================

    /**
     * Toggle collapse (bouton chevron)
     */
    function toggleCollapse() {
        state.collapsed = !state.collapsed;
        applyState();
        saveState();
        console.log('📐 Sidebar:', state.collapsed ? 'collapsed' : 'expanded');
    }

    /**
     * Ouvrir la sidebar
     */
    function expand() {
        state.collapsed = false;
        applyState();
        saveState();
    }

    /**
     * Fermer la sidebar
     */
    function collapse() {
        state.collapsed = true;
        applyState();
        saveState();
    }

    /**
     * Toggle mobile
     */
    function toggle() {
        state.mobileOpen = !state.mobileOpen;

        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.toggle('mobile-open', state.mobileOpen);
        }
        if (overlay) {
            overlay.classList.toggle('active', state.mobileOpen);
        }
    }

    /**
     * Appliquer l'état visuel
     */
    function applyState() {
        const sidebar = document.getElementById('app-sidebar');

        if (sidebar) {
            sidebar.classList.toggle('collapsed', state.collapsed);
        }

        document.body.classList.toggle('sidebar-collapsed', state.collapsed);
    }

    // ==========================================
    // NAVIGATION
    // ==========================================

    /**
     * Naviguer vers un item
     */
    function navigate(itemId) {
        state.activeItem = itemId;

        // Mettre à jour l'état visuel
        document.querySelectorAll('.sidebar-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === itemId);
        });

        // Exécuter la navigation
        executeNavigation(itemId);
    }

    /**
     * Exécuter l'action de navigation
     */
    function executeNavigation(itemId) {
        // Mapper les IDs sidebar vers router
        const routerIdMap = {
            'psycho-audit': 'psychoAudit',
            'team-messaging': 'teamMessaging'
        };
        const routerId = routerIdMap[itemId] || itemId;

        // Vues gérées par le router (messaging retiré - toggle chatbot à la place)
        const routedViews = ['dashboard', 'tasks', 'projects', 'notes', 'galaxy', 'accounting', 'psychoAudit', 'teamMessaging', 'campaigns', 'reports', 'analytics', 'gamification', 'behavioral'];

        if (routedViews.includes(routerId) && typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate(routerId);
            return;
        }

        // Actions spéciales
        switch (itemId) {
            case 'mahayawen':
                // Toggle le chatbot flottant (pas de navigation)
                if (typeof Chatbot !== 'undefined' && Chatbot.toggle) {
                    Chatbot.toggle();
                } else if (typeof toggleChatbot === 'function') {
                    toggleChatbot();
                }
                break;
            case 'galaxy':
                document.getElementById('galaxy-icon')?.click();
                break;
            case 'journal':
                if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('tasks');
                setTimeout(() => {
                    document.querySelector('.journal-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
                break;
            case 'settings':
                if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('settings');
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
     * Définir l'item actif
     */
    function setActiveItem(itemId) {
        state.activeItem = itemId;
        document.querySelectorAll('.sidebar-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === itemId);
        });
    }

    // ==========================================
    // PERSISTENCE
    // ==========================================

    /**
     * Sauvegarder l'état
     */
    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                collapsed: state.collapsed,
                userStatus: state.userStatus
            }));
        } catch (e) {
            console.warn('Sidebar: Failed to save state');
        }
    }

    /**
     * Charger l'état
     */
    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                state.collapsed = parsed.collapsed === true;
                state.userStatus = parsed.userStatus || 'online';
            }
        } catch (e) {
            console.warn('Sidebar: Failed to load state');
        }

        // Appliquer après le rendu
        requestAnimationFrame(() => {
            applyState();
        });
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return {
        get state() { return state; },

        // Toggle
        toggleCollapse,
        toggle,
        expand,
        collapse,

        // Navigation
        navigate,
        setActiveItem,

        // Config
        navItems,
        footerItems,

        // Persistence
        loadState,
        saveState
    };
})();

// Exposer globalement
if (typeof window !== 'undefined') {
    window.Sidebar = Sidebar;
}
