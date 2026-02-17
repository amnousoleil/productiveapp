// =============================================
// MAHAYAWEN CONTEXT AWARENESS
// Comprend où se trouve l'utilisateur et le contexte actuel
// Version 2.0 - Intelligence Contextuelle
// =============================================

const MahayawenContext = {
    /**
     * État du contexte actuel
     */
    state: {
        currentView: 'dashboard',
        previousView: null,
        currentProject: null,
        currentTask: null,
        currentNote: null,
        selectedItems: [],
        filters: {},
        searchQuery: null,
        lastAction: null,
        history: []
    },

    /**
     * Initialise le context tracking
     */
    init() {
        this.trackViewChanges();
        this.trackUserActions();
        this.trackSelections();
        console.log('🧠 Mahayawen Context Awareness initialized');
    },

    /**
     * Track les changements de vue
     */
    trackViewChanges() {
        // Observer le ViewRouter
        if (typeof ViewRouter !== 'undefined') {
            const originalNavigate = ViewRouter.navigate;
            ViewRouter.navigate = (view) => {
                this.state.previousView = this.state.currentView;
                this.state.currentView = view;
                this.addToHistory('navigate', { from: this.state.previousView, to: view });
                console.log('🧭 Navigation:', this.state.previousView, '→', view);
                return originalNavigate.call(ViewRouter, view);
            };
        }
    },

    /**
     * Track les actions utilisateur
     */
    trackUserActions() {
        // Observer les événements globaux
        document.addEventListener('task-created', (e) => {
            this.state.lastAction = { type: 'task-created', data: e.detail };
            this.addToHistory('task-created', e.detail);
        });

        document.addEventListener('note-created', (e) => {
            this.state.lastAction = { type: 'note-created', data: e.detail };
            this.addToHistory('note-created', e.detail);
        });

        document.addEventListener('project-changed', (e) => {
            this.state.currentProject = e.detail.projectId;
            this.addToHistory('project-changed', e.detail);
        });
    },

    /**
     * Track les sélections utilisateur
     */
    trackSelections() {
        // Détecte les clics sur les éléments
        document.addEventListener('click', (e) => {
            const taskBubble = e.target.closest('.task-bubble');
            if (taskBubble) {
                this.state.currentTask = taskBubble.dataset.id;
            }

            const noteItem = e.target.closest('.note-item');
            if (noteItem) {
                this.state.currentNote = noteItem.dataset.id;
            }
        });
    },

    /**
     * Ajoute une action à l'historique
     */
    addToHistory(action, data) {
        this.state.history.push({
            action,
            data,
            timestamp: Date.now(),
            view: this.state.currentView
        });

        // Limite à 50 dernières actions
        if (this.state.history.length > 50) {
            this.state.history.shift();
        }
    },

    /**
     * Obtient le contexte actuel complet
     */
    getCurrentContext() {
        return {
            // Vue actuelle
            currentView: this.state.currentView,
            previousView: this.state.previousView,

            // Projet/Workspace actif
            currentProject: this.state.currentProject || this.detectCurrentProject(),
            currentWorkspace: this.detectCurrentWorkspace(),

            // Éléments sélectionnés
            selectedTaskId: this.state.currentTask,
            selectedNoteId: this.state.currentNote,
            selectedItems: this.state.selectedItems,

            // Filtres actifs
            filters: this.getActiveFilters(),
            searchQuery: this.state.searchQuery,

            // Stats utilisateur
            userStats: this.getUserStats(),

            // Dernière action
            lastAction: this.state.lastAction,

            // Historique récent
            recentHistory: this.state.history.slice(-5)
        };
    },

    /**
     * Détecte le projet actuel
     */
    detectCurrentProject() {
        if (typeof AppState !== 'undefined' && AppState.filters) {
            return AppState.filters.project !== 'all' ? AppState.filters.project : null;
        }
        return null;
    },

    /**
     * Détecte le workspace actuel
     */
    detectCurrentWorkspace() {
        if (typeof ApiTokens !== 'undefined') {
            return ApiTokens.getWorkspaceId();
        }
        return null;
    },

    /**
     * Récupère les filtres actifs
     */
    getActiveFilters() {
        if (typeof AppState !== 'undefined' && AppState.filters) {
            return { ...AppState.filters };
        }
        return {};
    },

    /**
     * Récupère les stats utilisateur
     */
    getUserStats() {
        if (typeof AppState === 'undefined') return {};

        return {
            tasksTotal: AppState.tasks?.length || 0,
            tasksTodo: AppState.tasks?.filter(t => t.status === 'todo').length || 0,
            tasksInProgress: AppState.tasks?.filter(t => t.status === 'inprogress').length || 0,
            tasksDone: AppState.tasks?.filter(t => t.status === 'done').length || 0,
            tasksUrgent: AppState.tasks?.filter(t => t.priority?.level === 1).length || 0,
            notesTotal: AppState.notes?.length || 0,
            projectsTotal: AppState.projects?.length || 0,
            currentUser: AppState.currentUser?.name || 'Unknown'
        };
    },

    /**
     * Détecte si l'utilisateur a mentionné un contexte spécifique
     */
    detectMentionedContext(input) {
        const mentions = {
            tasks: [],
            notes: [],
            projects: [],
            users: []
        };

        const normalized = input.toLowerCase();

        // Détecte les références à "cette/ce/cet/ces"
        if (normalized.match(/cette|ce|cet|ces|la|le|mon|ma/)) {
            // Retourne le contexte actuel
            if (this.state.currentTask) {
                mentions.tasks.push(this.state.currentTask);
            }
            if (this.state.currentNote) {
                mentions.notes.push(this.state.currentNote);
            }
            if (this.state.currentProject) {
                mentions.projects.push(this.state.currentProject);
            }
        }

        // Détecte les noms de tâches mentionnés
        if (typeof AppState !== 'undefined' && AppState.tasks) {
            AppState.tasks.forEach(task => {
                if (normalized.includes(task.text.toLowerCase())) {
                    mentions.tasks.push(task.id);
                }
            });
        }

        // Détecte les noms de notes mentionnés
        if (typeof AppState !== 'undefined' && AppState.notes) {
            AppState.notes.forEach(note => {
                if (normalized.includes(note.title.toLowerCase())) {
                    mentions.notes.push(note.id);
                }
            });
        }

        // Détecte les noms de projets mentionnés
        if (typeof AppState !== 'undefined' && AppState.projects) {
            AppState.projects.forEach(project => {
                if (normalized.includes(project.name.toLowerCase())) {
                    mentions.projects.push(project.id);
                }
            });
        }

        // Détecte les noms d'utilisateurs mentionnés
        if (typeof AppConfig !== 'undefined' && AppConfig.USERS) {
            AppConfig.USERS.forEach(user => {
                const firstName = user.name.split(' ')[0].toLowerCase();
                if (normalized.includes(firstName) || normalized.includes(user.name.toLowerCase())) {
                    mentions.users.push(user.id);
                }
            });
        }

        return mentions;
    },

    /**
     * Enrichit le contexte avec des mentions détectées
     */
    enrichContextWithMentions(input, baseContext) {
        const mentions = this.detectMentionedContext(input);

        return {
            ...baseContext,
            mentionedTasks: mentions.tasks,
            mentionedNotes: mentions.notes,
            mentionedProjects: mentions.projects,
            mentionedUsers: mentions.users
        };
    },

    /**
     * Génère un résumé textuel du contexte pour l'IA
     */
    getContextSummary() {
        const ctx = this.getCurrentContext();
        const stats = ctx.userStats;

        let summary = `📍 **Contexte actuel**\n`;
        summary += `- Vue: ${ctx.currentView}\n`;
        summary += `- Projet: ${this.getProjectName(ctx.currentProject) || 'Aucun'}\n`;
        summary += `- Utilisateur: ${stats.currentUser}\n\n`;

        summary += `📊 **Statistiques**\n`;
        summary += `- Tâches: ${stats.tasksTodo} à faire, ${stats.tasksInProgress} en cours, ${stats.tasksDone} terminées\n`;
        summary += `- ${stats.tasksUrgent} tâches urgentes\n`;
        summary += `- ${stats.notesTotal} notes, ${stats.projectsTotal} projets\n`;

        if (ctx.lastAction) {
            summary += `\n⏱️ **Dernière action**: ${ctx.lastAction.type}`;
        }

        return summary;
    },

    /**
     * Récupère le nom d'un projet par ID
     */
    getProjectName(projectId) {
        if (!projectId || typeof AppState === 'undefined') return null;
        const project = AppState.projects?.find(p => p.id === projectId);
        return project?.name || null;
    },

    /**
     * Reset le contexte
     */
    reset() {
        this.state = {
            currentView: 'dashboard',
            previousView: null,
            currentProject: null,
            currentTask: null,
            currentNote: null,
            selectedItems: [],
            filters: {},
            searchQuery: null,
            lastAction: null,
            history: []
        };
        console.log('🔄 Context reset');
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.MahayawenContext = MahayawenContext;
}
