// =============================================
// PRODUCTIVEAPP - MAIN APP (Modular v3.0)
// Point d'entrée principal - Orchestre tous les modules
// =============================================

const App = {
    /**
     * Version de l'application
     */
    VERSION: '4.0.0',

    /**
     * Migre les anciens IDs (format string) vers les nouveaux UUIDs
     */
    migrateOldIds() {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // Migration du selectedMemberId dans localStorage
        const savedMemberId = localStorage.getItem('selectedMemberId');
        if (savedMemberId && !uuidRegex.test(savedMemberId)) {
            console.warn('⚠️ Migrating old selectedMemberId:', savedMemberId);
            if (typeof AppConfig !== 'undefined' && AppConfig.USERS) {
                const match = AppConfig.USERS.find(u =>
                    u.name.toLowerCase().includes(savedMemberId.toLowerCase()) ||
                    savedMemberId.toLowerCase().includes(u.name.toLowerCase().split(' ')[0])
                );
                if (match && uuidRegex.test(match.id)) {
                    console.log('✅ Migrated localStorage:', savedMemberId, '→', match.id);
                    localStorage.setItem('selectedMemberId', match.id);
                } else {
                    // Can't migrate - clear it
                    console.log('🧹 Clearing invalid selectedMemberId');
                    localStorage.removeItem('selectedMemberId');
                }
            }
        }

        // Migration du currentUser dans AppState
        if (typeof AppState !== 'undefined' && AppState.currentUser) {
            if (AppState.currentUser.id && !uuidRegex.test(AppState.currentUser.id)) {
                console.warn('⚠️ Migrating old currentUser.id:', AppState.currentUser.id);
                if (typeof AppConfig !== 'undefined' && AppConfig.USERS) {
                    const match = AppConfig.USERS.find(u =>
                        u.name.toLowerCase() === AppState.currentUser.name?.toLowerCase()
                    );
                    if (match && uuidRegex.test(match.id)) {
                        console.log('✅ Migrated currentUser.id:', AppState.currentUser.id, '→', match.id);
                        AppState.currentUser.id = match.id;
                        AppState.setUser(AppState.currentUser);
                    }
                }
            }
        }
    },

    /**
     * Initialise l'application après login
     */
    async init() {
        console.log(`🚀 ProductiveApp v${this.VERSION} - Initialisation...`);

        // AUTO-MIGRATE old IDs to UUIDs
        this.migrateOldIds();

        // GUARD: Ne pas initialiser si pas encore authentifié via AuthLogin
        if (typeof AuthLogin !== 'undefined' && !AuthLogin.authenticated) {
            console.log('⚠️ App.init: AuthLogin not authenticated yet, skipping');
            return;
        }

        try {
            // Mettre à jour le badge utilisateur
            if (typeof Auth !== 'undefined') Auth.updateUserBadge();

            // Charger le thème
            if (typeof Themes !== 'undefined') Themes.loadTheme();

            // Mettre à jour le mode de vue
            if (typeof Effects !== 'undefined' && Effects.updateViewMode) Effects.updateViewMode();

            // Initialiser la taille de police du chatbot
            if (typeof Chatbot !== 'undefined' && Chatbot.initFontSize) Chatbot.initFontSize();

            // Charger les données
            await this.loadData();

            // Initialiser les composants UI
            this.initUI();

            // Initialiser le système de backup
            if (typeof Backup !== 'undefined' && Backup.init) Backup.init();

            // Initialiser la sidebar
            if (typeof Sidebar !== 'undefined' && Sidebar.init) Sidebar.init();

            // Initialiser les nouveaux modules de vues
            if (typeof NotesModule !== 'undefined' && NotesModule.init) NotesModule.init();
            if (typeof ProjectsView !== 'undefined' && ProjectsView.init) ProjectsView.init();
            if (typeof Dashboard !== 'undefined' && Dashboard.init) Dashboard.init();
            if (typeof SettingsView !== 'undefined' && SettingsView.init) SettingsView.init();
            if (typeof AnalyticsView !== 'undefined' && AnalyticsView.init) AnalyticsView.init();
            if (typeof ReportsView !== 'undefined' && ReportsView.init) ReportsView.init();
            if (typeof GalaxieView !== 'undefined' && GalaxieView.init) GalaxieView.init();
            if (typeof AccountingView !== 'undefined' && AccountingView.init) AccountingView.init();
            if (typeof PsychoAuditView !== 'undefined' && PsychoAuditView.init) PsychoAuditView.init();
            if (typeof AIReportsView !== 'undefined' && AIReportsView.init) AIReportsView.init();
            if (typeof TeamVisionView !== 'undefined' && TeamVisionView.init) TeamVisionView.init();
            if (typeof GiriVisionView !== 'undefined' && GiriVisionView.init) GiriVisionView.init();

            // Power Features
            if (typeof CommandPalette !== 'undefined' && CommandPalette.init) CommandPalette.init();
            if (typeof KeyboardShortcuts !== 'undefined' && KeyboardShortcuts.init) KeyboardShortcuts.init();
            if (typeof QuickAdd !== 'undefined' && QuickAdd.init) QuickAdd.init();
            if (typeof ZenMode !== 'undefined' && ZenMode.init) ZenMode.init();
            if (typeof PomodoroTimer !== 'undefined' && PomodoroTimer.init) PomodoroTimer.init();
            if (typeof TimeTracker !== 'undefined' && TimeTracker.init) TimeTracker.init();
            if (typeof KanbanBoard !== 'undefined' && KanbanBoard.init) KanbanBoard.init();
            if (typeof NotificationCenter !== 'undefined' && NotificationCenter.init) NotificationCenter.init();
            if (typeof CalendarView !== 'undefined' && CalendarView.init) CalendarView.init();

            // Recharger les notifications avec le token auth (l'auto-init avant login utilisait mock data)
            if (typeof NotificationsPremiumUI !== 'undefined' && NotificationsPremiumUI.loadNotifications) {
                NotificationsPremiumUI.loadNotifications();
            }
            if (typeof MobileNav !== 'undefined' && MobileNav.init) MobileNav.init();
            if (typeof UIPolish !== 'undefined' && UIPolish.init) UIPolish.init();

            // Initialiser le routeur de vues (gère le hash URL)
            if (typeof ViewRouter !== 'undefined' && ViewRouter.init) ViewRouter.init();

            // Initialiser le cache manager (anti-cache system for critical views)
            if (typeof CacheManager !== 'undefined' && CacheManager.init) {
                CacheManager.init();
                console.log('✅ CacheManager initialized');
            }

            // Initialiser le drag & drop
            setTimeout(() => {
                if (typeof initDragAndDrop === 'function') initDragAndDrop();
            }, 100);

            // ANIMATIONS: Init with longer delay to ensure canvas exists
            setTimeout(() => {
                console.log('🎨 App.init: Attempting animation init...');
                const canvas = document.getElementById('matrix-bg');
                console.log('Canvas exists?', !!canvas);
                console.log('initAnimation defined?', typeof initAnimation === 'function');
                console.log('AnimationControls defined?', typeof AnimationControls !== 'undefined');

                if (typeof initAnimation === 'function') {
                    initAnimation();
                    console.log('✅ initAnimation() called from App.init');
                } else {
                    console.warn('⚠️ initAnimation not defined yet');
                }

                if (typeof AnimationControls !== 'undefined' && AnimationControls.init) {
                    AnimationControls.init();
                    console.log('✅ AnimationControls.init() called from App.init');
                } else {
                    console.warn('⚠️ AnimationControls not defined yet');
                }
            }, 1000);

            // CRITICAL: Ensure all modals are closed on startup
            this.closeAllModals();

            console.log(`✅ ProductiveApp v${this.VERSION} prête !`);
        } catch (error) {
            console.error('❌ App.init() error:', error);
        }
    },

    /**
     * Close all modals on startup (prevents stale modals from appearing)
     */
    closeAllModals() {
        // Close standard .modal elements
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                console.log('🔒 Closed stale modal:', modal.id);
            }
        });

        // Close confirm modals
        const confirmModals = document.querySelectorAll('.confirm-modal-overlay');
        confirmModals.forEach(modal => {
            modal.classList.remove('active');
        });

        // Close onboarding overlays
        const onboardingOverlays = document.querySelectorAll('.onboarding-overlay');
        onboardingOverlays.forEach(overlay => {
            overlay.remove();
            console.log('🔒 Removed onboarding overlay');
        });

        // Close campaign modals
        const campaignModals = document.querySelectorAll('.campaigns-modal-overlay');
        campaignModals.forEach(modal => {
            modal.classList.remove('active');
        });
    },

    /**
     * Charge toutes les données depuis l'API
     */
    async loadData() {
        const hasApiDataLoader = typeof ApiDataLoader !== 'undefined';
        const hasApiTokens = typeof ApiTokens !== 'undefined';
        const accessToken = hasApiTokens ? ApiTokens.getAccessToken() : null;
        const workspaceId = hasApiTokens ? ApiTokens.getWorkspaceId() : null;

        // API Express = source unique (PostgreSQL)
        if (hasApiDataLoader && hasApiTokens && accessToken && workspaceId) {
            try {
                console.log('📡 Chargement API Express (PostgreSQL) pour workspace:', workspaceId);
                await ApiDataLoader.loadAll();
                const taskCount = (AppState.tasks || []).length;
                const projectCount = (AppState.projects || []).length;
                console.log('✅ API chargée:', taskCount, 'tâches,', projectCount, 'projets');

                // Render filters and UI (toujours, même si 0 tâches)
                Projects.renderFilter();
                Projects.renderSelect();
                Projects.renderUserFilter();
                Projects.renderAssignSelect();
                // Render data
                Tasks.render();
                Journal.render();

                // REMOVED 2026-02-12: FORCE CLOSE ALL MODALS ON STARTUP (was closing modals automatically)
                // this.forceCloseAllModals();

                // Record daily login for gamification streak + XP + celebration
                if (typeof GamificationAPI !== 'undefined' && GamificationAPI.recordDailyLogin) {
                    GamificationAPI.recordDailyLogin()
                        .then(result => {
                            // Afficher la célébration de connexion quotidienne
                            if (result && typeof XPFeedback !== 'undefined' && XPFeedback.showLoginBonus) {
                                setTimeout(() => {
                                    XPFeedback.showLoginBonus(result.xp, result.streak);
                                }, 2000); // Délai pour laisser l'UI se charger
                            }
                        })
                        .catch(() => {});
                }

                // Force start animations after login
                setTimeout(() => {
                    if (typeof initAnimation === 'function') {
                        initAnimation();
                        console.log('✅ Animations démarrées après login');
                    }
                }, 1000);

                // Detect super-admin (contact@mahagiri.fr)
                this.detectSuperAdmin();

                return; // API a répondu, ne pas appeler legacy
            } catch (e) {
                console.error('⚠️ API Express failed:', e.message, e);
            }
        } else {
            console.warn('⚠️ Cannot use API:', {
                hasApiDataLoader,
                hasApiTokens,
                hasAccessToken: !!accessToken,
                workspaceId
            });
        }

        // Fallback legacy SEULEMENT si API n'est pas disponible
        console.log('📡 Fallback legacy (webhooks)...');
        try {
            await this.loadDataLegacy();
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
        }

        // Render filters and UI
        Projects.renderFilter();
        Projects.renderSelect();
        Projects.renderUserFilter();
        Projects.renderAssignSelect();

        // Render data
        Tasks.render();
        Journal.render();

        // REMOVED 2026-02-12: FORCE CLOSE ALL MODALS ON STARTUP (was closing modals automatically)
        // this.forceCloseAllModals();
    },

    /**
     * Charge les données via l'ancien système (n8n webhooks)
     */
    async loadDataLegacy() {
        console.log('📡 Chargement legacy (webhooks)...');

        // Charger projets d'abord (pour les références)
        await Projects.load();

        // Charger l'ordre personnalisé des projets
        if (typeof loadProjectsOrder === 'function') {
            loadProjectsOrder();
        }

        // Charger tâches et journal en parallèle
        await Promise.all([
            Tasks.load(),
            Journal.load()
        ]);

        console.log('✅ Données legacy chargées');
    },

    /**
     * Initialise les composants UI
     */
    initUI() {
        console.log('🎨 Initialisation UI...');

        // Initialiser les événements de chaque module
        try { if (typeof Tasks !== 'undefined' && Tasks.initEvents) Tasks.initEvents(); } catch(e) { console.error('Tasks.initEvents error:', e); }
        try { if (typeof Projects !== 'undefined' && Projects.initEvents) Projects.initEvents(); } catch(e) { console.error('Projects.initEvents error:', e); }
        try { if (typeof Journal !== 'undefined' && Journal.initEvents) Journal.initEvents(); } catch(e) { console.error('Journal.initEvents error:', e); }
        try { if (typeof Chatbot !== 'undefined' && Chatbot.initEvents) Chatbot.initEvents(); } catch(e) { console.error('Chatbot.initEvents error:', e); }
        try { if (typeof Themes !== 'undefined' && Themes.initEvents) Themes.initEvents(); } catch(e) { console.error('Themes.initEvents error:', e); }
        try { if (typeof Report !== 'undefined' && Report.initEvents) Report.initEvents(); } catch(e) { console.error('Report.initEvents error:', e); }

        // Effets et interactions
        try { if (typeof Effects !== 'undefined' && Effects.initSearch) Effects.initSearch(); } catch(e) { console.error('Effects.initSearch error:', e); }
        try { if (typeof Effects !== 'undefined' && Effects.initMenuDropdown) Effects.initMenuDropdown(); } catch(e) { console.error('Effects.initMenuDropdown error:', e); }
        try { if (typeof Effects !== 'undefined' && Effects.initGyrophare) Effects.initGyrophare(); } catch(e) { console.error('Effects.initGyrophare error:', e); }
        try { if (typeof Effects !== 'undefined' && Effects.initViewToggle) Effects.initViewToggle(); } catch(e) { console.error('Effects.initViewToggle error:', e); }

        console.log('✅ UI initialisée');
    },

    /**
     * REMOVED 2026-02-12: Force close all modals on startup
     * This method was causing modals to auto-close - now commented out
     */
    /*
    forceCloseAllModals() {
        const modalIds = [
            'edit-task-modal',
            'theme-modal',
            'project-modal',
            'premium-report-modal',
            'premium-results-modal'
        ];

        modalIds.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                // Remove visibility classes
                modal.classList.remove('modal-visible');
                modal.classList.add('hidden');
                // Force inline style
                modal.style.display = 'none';
            }
        });

        // Also close any generic .modal elements
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('modal-visible');
            modal.classList.add('hidden');
            modal.style.display = 'none';
        });

        console.log('🔒 All modals force-closed on startup');
    },
    */

    /**
     * Detect if the current user is super-admin (contact@mahagiri.fr)
     */
    detectSuperAdmin() {
        // Get user email from AppState or State
        const userEmail = AppState?.currentUser?.email || State?.user?.email;

        // Set isAdmin flag in global window
        window.isAdmin = (userEmail === 'contact@mahagiri.fr');
        console.log('🛡️ Admin detection:', window.isAdmin ? 'ADMIN' : 'USER', `(${userEmail})`);
    },

    /**
     * Recharge les données depuis l'API
     */
    async refresh() {
        console.log('🔄 Rafraîchissement...');
        await this.loadData();
        console.log('✅ Rafraîchi');
    }
};

// =============================================
// INITIALISATION AU CHARGEMENT DU DOM
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log(`🚀 ProductiveApp v${App.VERSION} - Démarrage...`);

    try {
        // Initialiser les projets par défaut dans l'état
        if (typeof AppState !== 'undefined' && AppState.initProjects) {
            AppState.initProjects();
        }

        // Initialiser les événements auth (logout button, etc.) - garder pour compatibilité
        if (typeof Auth !== 'undefined' && Auth.initEvents) {
            Auth.initEvents();
        }

        // === NEW: Utiliser AuthLogin au lieu de Auth ===
        if (typeof AuthLogin !== 'undefined' && AuthLogin.init) {
            console.log('🔐 Starting AuthLogin...');
            AuthLogin.init();
        } else if (typeof Auth !== 'undefined' && Auth.init) {
            // Fallback vers ancien système si AuthLogin n'est pas chargé
            console.log('🔐 Fallback to Auth...');
            Auth.init();
        } else {
            console.error('❌ No auth module loaded');
        }

        console.log(`✅ ProductiveApp v${App.VERSION} - Prêt`);
    } catch (error) {
        console.error('❌ Error during initialization:', error);
    }
});

// =============================================
// COMPATIBILITÉ AVEC ANCIEN CODE
// =============================================

// Fonctions globales pour compatibilité avec dragdrop.js et autres
window.loadTasks = async () => await Tasks.load();
window.loadTasksFromAPI = async () => await ApiService.loadTasks();
window.createTaskAPI = async (data) => await ApiService.createTask(data);
window.updateTaskAPI = async (id, status, priority) => await ApiService.updateTask(id, status, priority);
window.deleteTaskAPI = async (id) => await ApiService.deleteTask(id);
window.reorderTaskAPI = async (id, status, position) => await ApiService.reorderTask(id, status, position);
window.loadProjectsFromAPI = async () => await ApiService.loadProjects();
window.createProjectAPI = async (data) => await ApiService.createProject(data);
window.deleteProjectAPI = async (id) => await ApiService.deleteProject(id);
window.loadJournalFromAPI = async () => await ApiJournal.getTodayEntries();
window.createJournalAPI = async (entry) => await ApiJournal.upsertEntry(entry);
window.correctText = async (text, mode) => await ApiService.correctText(text, mode);

// Variables globales pour compatibilité
window.TENANT_ID = AppConfig.TENANT_ID;
window.API_TASKS = AppConfig.API.TASKS;
window.API_JOURNAL = AppConfig.API.JOURNAL;
window.API_PROJECTS = AppConfig.API.PROJECTS;
window.API_CORRECT = AppConfig.API.CORRECT;
window.CHATBOT_WEBHOOK_URL = AppConfig.API.CHATBOT;
window.USERS = AppConfig.USERS;
window.DEFAULT_PROJECTS = AppConfig.DEFAULT_PROJECTS;
window.THEMES = AppConfig.THEMES;
window.ALL_THEMES = AppConfig.ALL_THEMES;
window.GYRO_IMAGES = AppConfig.GYRO_IMAGES;

// Getters pour état
Object.defineProperty(window, 'currentUser', {
    get: () => AppState.currentUser,
    set: (val) => { AppState.currentUser = val; }
});
Object.defineProperty(window, 'tasks', {
    get: () => AppState.tasks,
    set: (val) => { AppState.tasks = val; }
});
Object.defineProperty(window, 'projects', {
    get: () => AppState.projects,
    set: (val) => { AppState.projects = val; }
});
Object.defineProperty(window, 'journal', {
    get: () => AppState.journal,
    set: (val) => { AppState.journal = val; }
});
Object.defineProperty(window, 'activeProjectFilter', {
    get: () => AppState.filters.project,
    set: (val) => { AppState.filters.project = val; }
});
Object.defineProperty(window, 'activeUserFilter', {
    get: () => AppState.filters.user,
    set: (val) => { AppState.filters.user = val; }
});
Object.defineProperty(window, 'priorityFilterMode', {
    get: () => AppState.filters.priority,
    set: (val) => { AppState.filters.priority = val; }
});
Object.defineProperty(window, 'viewMode', {
    get: () => AppState.ui.viewMode,
    set: (val) => { AppState.ui.viewMode = val; }
});

// Fonctions anciennes
window.initApp = () => App.init();
window.setTheme = (id) => Themes.setTheme(id);
window.loadTheme = () => Themes.loadTheme();
window.logout = () => typeof AuthLogin !== 'undefined' ? AuthLogin.logout() : Auth?.logout();
window.getProject = (id) => AppState.findProject(id);
window.getPriorityLabel = (level) => Utils.getPriorityLabel(level);
window.getUserName = (id) => Utils.getUserName(id);
window.getUserAvatar = (id) => Utils.getUserAvatar(id);
window.escapeHtml = (text) => Utils.escapeHtml(text);

// Exposer App globalement
window.App = App;

// Exposer Sidebar
window.Sidebar = typeof Sidebar !== 'undefined' ? Sidebar : null;
// REMOVED: Force close modals fix (2026-02-12)
// This code was causing modals to auto-close on page load
// Commented out to allow modals to remain open naturally
/*
// CRITICAL: Close all modals IMMEDIATELY on page load (before anything else)
(function() {
    'use strict';

    function forceCloseAllModals() {
        // Close standard modals - ensure hidden class + inline display:none + remove modal-visible
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
            modal.classList.remove('modal-visible');
            modal.style.display = 'none';
        });

        // CRITICAL: Force close edit-task-modal specifically (known to auto-open on refresh)
        const editTaskModal = document.getElementById('edit-task-modal');
        if (editTaskModal) {
            editTaskModal.classList.add('hidden');
            editTaskModal.classList.remove('modal-visible');
            editTaskModal.style.display = 'none';
            console.log('🔒 Force closed edit-task-modal');
        }

        // Close confirm modals
        document.querySelectorAll('.confirm-modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });

        // Close any campaign modals
        document.querySelectorAll('.campaigns-modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });

        // Close onboarding overlays
        document.querySelectorAll('.onboarding-overlay').forEach(overlay => {
            overlay.remove();
        });

        console.log('🔒 Force closed all modals on page load');
    }

    // Run immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceCloseAllModals);
    } else {
        forceCloseAllModals();
    }

    // Also run on window load as backup
    window.addEventListener('load', forceCloseAllModals);

    // Run again after a short delay to catch dynamically created modals
    setTimeout(forceCloseAllModals, 500);
    setTimeout(forceCloseAllModals, 1500);

    // CRITICAL: Monitor edit-task-modal and force close if it auto-opens (3 seconds guard)
    let guardActive = true;
    setTimeout(() => { guardActive = false; }, 3000);

    const observer = new MutationObserver((mutations) => {
        if (!guardActive) {
            observer.disconnect();
            return;
        }

        const editTaskModal = document.getElementById('edit-task-modal');
        if (editTaskModal && editTaskModal.classList.contains('modal-visible')) {
            console.warn('⚠️ edit-task-modal auto-opened on startup - force closing');
            editTaskModal.classList.add('hidden');
            editTaskModal.classList.remove('modal-visible');
            editTaskModal.style.display = 'none';
        }
    });

    // Start observing once DOM is ready
    if (document.body) {
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class'],
                subtree: true
            });
        });
    }
})();
*/

// Initialize Error Tracker
if (window.ErrorTracker) {
  ErrorTracker.init();
}
