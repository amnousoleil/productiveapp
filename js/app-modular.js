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
     * Initialise l'application après login
     */
    async init() {
        console.log(`🚀 ProductiveApp v${this.VERSION} - Initialisation...`);

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

            // Initialiser le drag & drop
            setTimeout(() => {
                if (typeof initDragAndDrop === 'function') initDragAndDrop();
                if (typeof initAnimation === 'function') initAnimation();
            }, 100);

            console.log(`✅ ProductiveApp v${this.VERSION} prête !`);
        } catch (error) {
            console.error('❌ App.init() error:', error);
        }
    },

    /**
     * Charge toutes les données depuis l'API
     */
    async loadData() {
        console.log('📡 Chargement des données...');

        // Use legacy N8N webhook system
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

        // Initialiser les événements auth (logout button, etc.)
        if (typeof Auth !== 'undefined' && Auth.initEvents) {
            Auth.initEvents();
        }

        // Initialiser l'authentification (vérifie session, affiche login si besoin)
        if (typeof Auth !== 'undefined' && Auth.init) {
            Auth.init();
        } else {
            console.error('Auth module not loaded');
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
window.loadJournalFromAPI = async () => await ApiService.loadJournal();
window.createJournalAPI = async (entry) => await ApiService.createJournalEntry(entry);
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
window.logout = () => Auth.logout();
window.getProject = (id) => AppState.findProject(id);
window.getPriorityLabel = (level) => Utils.getPriorityLabel(level);
window.getUserName = (id) => Utils.getUserName(id);
window.getUserAvatar = (id) => Utils.getUserAvatar(id);
window.escapeHtml = (text) => Utils.escapeHtml(text);

// Exposer App globalement
window.App = App;

// Exposer Sidebar
window.Sidebar = typeof Sidebar !== 'undefined' ? Sidebar : null;
