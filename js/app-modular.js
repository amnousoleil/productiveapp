// =============================================
// PRODUCTIVEAPP - MAIN APP (Modular v3.0)
// Point d'entrée principal - Orchestre tous les modules
// =============================================

const App = {
    /**
     * Version de l'application
     */
    VERSION: '3.1.0',

    /**
     * Initialise l'application après login
     */
    async init() {
        console.log(`🚀 ProductiveApp v${this.VERSION} - Initialisation...`);

        // Mettre à jour le badge utilisateur
        Auth.updateUserBadge();

        // Charger le thème
        Themes.loadTheme();

        // Mettre à jour le mode de vue
        Effects.updateViewMode();

        // Initialiser la taille de police du chatbot
        Chatbot.initFontSize();

        // Charger les données
        await this.loadData();

        // Initialiser les composants UI
        this.initUI();

        // Initialiser le système de backup
        Backup.init();

        // Initialiser la sidebar
        if (typeof Sidebar !== 'undefined') {
            Sidebar.init();
        }

        // Initialiser le drag & drop
        setTimeout(() => {
            if (typeof initDragAndDrop === 'function') initDragAndDrop();
            if (typeof initAnimation === 'function') initAnimation();
        }, 100);

        console.log(`✅ ProductiveApp v${this.VERSION} prête !`);
    },

    /**
     * Charge toutes les données depuis l'API
     */
    async loadData() {
        console.log('📡 Chargement des données...');

        // Charger projets d'abord (pour les références)
        await Projects.load();

        // Charger l'ordre personnalisé des projets
        if (typeof loadProjectsOrder === 'function') {
            loadProjectsOrder();
        }

        // Render les filtres de projets
        Projects.renderFilter();
        Projects.renderSelect();
        Projects.renderUserFilter();
        Projects.renderAssignSelect();

        // Charger tâches et journal en parallèle
        await Promise.all([
            Tasks.load(),
            Journal.load()
        ]);

        // Render initial
        Tasks.render();
        Journal.render();

        console.log('✅ Données chargées');
    },

    /**
     * Initialise les composants UI
     */
    initUI() {
        // Initialiser les événements de chaque module
        Tasks.initEvents();
        Projects.initEvents();
        Journal.initEvents();
        Chatbot.initEvents();
        Themes.initEvents();
        Report.initEvents();

        // Effets et interactions
        Effects.initSearch();
        Effects.initMenuDropdown();
        Effects.initGyrophare();
        Effects.initViewToggle();
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

    // Initialiser les projets par défaut dans l'état
    AppState.initProjects();

    // Render l'écran de login
    Auth.renderUserSelect();
    Auth.initEvents();

    // Créer les effets visuels de login
    Effects.createFireBubbles();

    // Vérifier si une session existe
    if (Auth.checkExistingSession()) {
        App.init();
    }

    console.log(`✅ ProductiveApp v${App.VERSION} - Prêt pour login`);
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
