// =============================================
// PRODUCTIVEAPP - STATE MODULE
// Gestion centralisée de l'état de l'application
// =============================================

const AppState = {
    // === UTILISATEUR ACTIF ===
    currentUser: null,

    // === DONNÉES ===
    tasks: [],
    journal: [],
    projects: [],

    // === FILTRES ===
    filters: {
        project: 'all',
        user: 'all',
        priority: 'off', // off -> urgent -> normal -> zen -> off
        donePeriod: 'today' // today, week, month, year, all
    },

    // === UI ===
    ui: {
        viewMode: localStorage.getItem('viewMode') || 'columns',
        chatbotLarge: localStorage.getItem('chatbot-large') === 'true',
        chatbotFontSize: localStorage.getItem('chatbot-font-size') || 'medium',
        lastChatbotActionTaskId: null,
        lastReportData: null,
        isCorrectingText: false
    },

    // === MEDIA ===
    media: {
        recorder: null,
        audioChunks: [],
        isRecording: false,
        audioContext: null,
        analyser: null,
        dataArray: null,
        animationId: null,
        recordingStartTime: null,
        timerInterval: null
    },

    // === MÉTHODES DE GESTION D'ÉTAT ===

    /**
     * Initialise les projets par défaut
     */
    initProjects() {
        this.projects = [...AppConfig.DEFAULT_PROJECTS];
    },

    /**
     * Met à jour l'utilisateur actif
     * @param {Object|null} user - L'utilisateur ou null pour déconnexion
     */
    setUser(user) {
        this.currentUser = user;
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            sessionStorage.removeItem('currentUser');
        }
    },

    /**
     * Restaure l'utilisateur depuis la session
     * @returns {boolean} - true si un utilisateur a été restauré
     */
    restoreUser() {
        const saved = sessionStorage.getItem('currentUser');
        if (saved) {
            let user = JSON.parse(saved);

            // AUTO-MIGRATION: If ID is old format (not UUID), find and fix it
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (user && user.id && !uuidRegex.test(user.id)) {
                console.warn('⚠️ Old ID format detected:', user.id, '- migrating...');
                // Find matching user in config by name
                if (typeof AppConfig !== 'undefined' && AppConfig.USERS) {
                    const match = AppConfig.USERS.find(u =>
                        u.name.toLowerCase() === user.name?.toLowerCase() ||
                        u.id.toLowerCase() === user.id?.toLowerCase()
                    );
                    if (match && uuidRegex.test(match.id)) {
                        console.log('✅ Migrated user ID:', user.id, '→', match.id);
                        user.id = match.id;
                        sessionStorage.setItem('currentUser', JSON.stringify(user));
                        // Also fix localStorage
                        localStorage.setItem('selectedMemberId', match.id);
                    }
                }
            }

            this.currentUser = user;
            return true;
        }
        return false;
    },

    /**
     * Met à jour les tâches
     * @param {Array} tasks - Nouvelles tâches
     */
    setTasks(tasks) {
        this.tasks = tasks;
        window.tasks = tasks; // Compatibilité avec dragdrop.js
    },

    /**
     * Ajoute une tâche en haut de la liste
     * @param {Object} task - La tâche à ajouter
     */
    addTask(task) {
        this.tasks.unshift(task);
        window.tasks = this.tasks;
    },

    /**
     * Supprime une tâche par ID
     * @param {string} taskId - L'ID de la tâche
     */
    removeTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        window.tasks = this.tasks;
    },

    /**
     * Trouve une tâche par ID
     * @param {string} taskId - L'ID de la tâche
     * @returns {Object|undefined} - La tâche ou undefined
     */
    findTask(taskId) {
        return this.tasks.find(t => t.id === taskId);
    },

    /**
     * Met à jour les projets
     * @param {Array} projects - Nouveaux projets
     */
    setProjects(projects) {
        this.projects = projects;
        window.projects = projects; // Compatibilité avec dragdrop.js
    },

    /**
     * Ajoute un projet
     * @param {Object} project - Le projet à ajouter
     */
    addProject(project) {
        this.projects.push(project);
        window.projects = this.projects;
    },

    /**
     * Supprime un projet par ID
     * @param {string} projectId - L'ID du projet
     */
    removeProject(projectId) {
        this.projects = this.projects.filter(p => p.id !== projectId);
        window.projects = this.projects;
    },

    /**
     * Trouve un projet par ID
     * @param {string} projectId - L'ID du projet
     * @returns {Object|undefined} - Le projet ou undefined
     */
    findProject(projectId) {
        return this.projects.find(p => p.id === projectId) ||
               this.projects.find(p => p.id === 'general');
    },

    /**
     * Met à jour le journal
     * @param {Array} entries - Nouvelles entrées
     */
    setJournal(entries) {
        this.journal = entries;
    },

    /**
     * Ajoute une entrée au journal
     * @param {Object} entry - L'entrée à ajouter
     */
    addJournalEntry(entry) {
        this.journal.unshift(entry);
    },

    /**
     * Met à jour un filtre
     * @param {string} filterType - Type de filtre (project, user, priority)
     * @param {string} value - Valeur du filtre
     */
    setFilter(filterType, value) {
        if (this.filters.hasOwnProperty(filterType)) {
            this.filters[filterType] = value;
        }
    },

    /**
     * Met à jour le mode de vue
     * @param {string} mode - 'columns' ou 'bubbles'
     */
    setViewMode(mode) {
        this.ui.viewMode = mode;
        localStorage.setItem('viewMode', mode);
    },

    /**
     * Bascule la taille du chatbot
     */
    toggleChatbotSize() {
        this.ui.chatbotLarge = !this.ui.chatbotLarge;
        localStorage.setItem('chatbot-large', this.ui.chatbotLarge);
    },

    /**
     * Obtient les tâches filtrées
     * @returns {Array} - Tâches filtrées selon les filtres actifs
     */
    getFilteredTasks() {
        let filtered = [...this.tasks];

        // Filtre par projet
        if (this.filters.project !== 'all') {
            filtered = filtered.filter(t => t.project === this.filters.project);
        }

        // Filtre par utilisateur
        if (this.filters.user !== 'all') {
            filtered = filtered.filter(t => t.userId === this.filters.user);
        }

        // Filtre par priorité — use raw string as primary (level 2 is ambiguous: high & medium)
        if (this.filters.priority !== 'off') {
            var pf = this.filters.priority; // urgent | important | normal | zen
            filtered = filtered.filter(function(t) {
                var raw = (t.priority?.raw || 'medium').toLowerCase();
                switch (pf) {
                    case 'urgent':    return raw === 'urgent';
                    case 'important': return raw === 'high';
                    case 'normal':    return raw === 'medium';
                    case 'zen':       return raw === 'low';
                    default:          return true;
                }
            });
        }

        // Tri par date de création décroissante (plus récentes en premier)
        filtered.sort(function(a, b) {
            var dateA = a.createdAt || a.created_at || a.updated_at || '';
            var dateB = b.createdAt || b.created_at || b.updated_at || '';
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateB) - new Date(dateA);
        });

        return filtered;
    },

    /**
     * Obtient les statistiques des tâches
     * @returns {Object} - Statistiques
     */
    getTaskStats() {
        return {
            total: this.tasks.length,
            todo: this.tasks.filter(t => t.status === 'todo').length,
            inProgress: this.tasks.filter(t => t.status === 'inprogress').length,
            done: this.tasks.filter(t => t.status === 'done').length,
            urgent: this.tasks.filter(t => t.status !== 'done' && t.priority?.level === 1).length
        };
    },

    /**
     * Obtient le journal du jour
     * @returns {Array} - Entrées du jour
     */
    getTodayJournal() {
        const today = new Date().toDateString();
        let entries = this.journal.filter(e => new Date(e.date).toDateString() === today);

        if (this.filters.user !== 'all') {
            entries = entries.filter(e => e.userId === this.filters.user);
        }

        return entries;
    },

    /**
     * Réinitialise l'état
     */
    reset() {
        this.currentUser = null;
        this.tasks = [];
        this.journal = [];
        this.projects = [...AppConfig.DEFAULT_PROJECTS];
        this.filters = { project: 'all', user: 'all', priority: 'off' };
        this.ui.lastChatbotActionTaskId = null;
        this.ui.lastReportData = null;
        window.tasks = [];
        window.projects = this.projects;
    }
};

// Exposer globalement
window.AppState = AppState;
