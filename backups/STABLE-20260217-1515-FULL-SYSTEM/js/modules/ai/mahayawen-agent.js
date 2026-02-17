// =============================================
// MAHAYAWEN AGENT - ORCHESTRATEUR AUTONOME
// Agent IA capable d'exécuter TOUTES les actions de l'application
// Version 2.0 - Full Autonomy
// =============================================

const MahayawenAgent = {
    /**
     * État de l'agent
     */
    state: {
        isProcessing: false,
        lastCommand: null,
        executionHistory: [],
        pendingConfirmations: []
    },

    /**
     * Initialise l'agent
     */
    init() {
        MahayawenContext.init();
        console.log('🤖 Mahayawen Agent v2.0 initialized');
        console.log(`📚 ${MahayawenActionRegistry.getTotalActionsCount()} actions disponibles`);
    },

    /**
     * Exécute une commande vocale ou textuelle
     * @param {string} command - La commande de l'utilisateur
     * @returns {Promise<object>} - Résultat de l'exécution
     */
    async execute(command) {
        if (this.state.isProcessing) {
            return {
                success: false,
                message: '⏳ Je suis déjà en train de traiter une commande. Patiente un instant.',
                status: 'busy'
            };
        }

        this.state.isProcessing = true;
        this.state.lastCommand = command;

        console.log('🎯 Mahayawen executing:', command);

        try {
            // 1. Obtenir le contexte actuel
            const context = MahayawenContext.getCurrentContext();
            const enrichedContext = MahayawenContext.enrichContextWithMentions(command, context);

            console.log('🧠 Context:', enrichedContext);

            // 2. Parser l'intent
            const intent = await MahayawenIntentParser.parse(command, enrichedContext);

            console.log('🎯 Intent detected:', intent);

            if (intent.confidence < 0.3) {
                return {
                    success: false,
                    message: `❓ Je n'ai pas bien compris "${command}". Peux-tu reformuler ?`,
                    status: 'low_confidence',
                    suggestions: this.getSuggestions(command)
                };
            }

            // 3. Vérifier si confirmation nécessaire
            if (intent.action.requiresConfirmation && !this.isConfirmed(intent)) {
                return await this.requestConfirmation(intent);
            }

            // 4. Exécuter l'action
            const result = await this.executeAction(intent, enrichedContext);

            // 5. Enregistrer dans l'historique
            this.addToHistory(command, intent, result);

            return result;

        } catch (error) {
            console.error('❌ Mahayawen execution error:', error);
            return {
                success: false,
                message: `❌ Erreur lors de l'exécution: ${error.message}`,
                status: 'error',
                error
            };
        } finally {
            this.state.isProcessing = false;
        }
    },

    /**
     * Exécute une action spécifique
     * NOUVELLE VERSION : Utilise MahayawenRouter
     */
    async executeAction(intent, context) {
        const { action, params } = intent;

        console.log('⚡ Executing action:', action.id, params);

        // Utiliser le nouveau routeur si disponible
        if (typeof MahayawenRouter !== 'undefined' && MahayawenRouter.route) {
            try {
                const routeIntent = {
                    intent: action.id,
                    params: params || {},
                    isConfirmed: intent.isConfirmed || false,
                    confirmation_message: intent.confirmation_message
                };

                return await MahayawenRouter.route(routeIntent);
            } catch (error) {
                console.error('[MahayawenAgent] Router error:', error);
                return {
                    success: false,
                    message: `❌ Erreur: ${error.message}`,
                    error
                };
            }
        }

        // Fallback: ancienne logique (si routeur pas chargé)
        console.warn('[MahayawenAgent] MahayawenRouter non disponible - utilisation ancienne logique');

        try {
            // Appel de l'API correspondante
            const result = await this.callAPI(action.api, params);

            // Mise à jour de l'UI si nécessaire
            await this.updateUI(action, result);

            // Message de succès personnalisé
            const message = this.generateSuccessMessage(action, params, result);

            return {
                success: true,
                message,
                status: 'completed',
                action: action.id,
                data: result
            };

        } catch (error) {
            console.error('❌ Action execution failed:', error);
            return {
                success: false,
                message: `❌ Impossible d'exécuter "${action.description}": ${error.message}`,
                status: 'failed',
                action: action.id,
                error
            };
        }
    },

    /**
     * Appelle l'API correspondant à une action
     */
    async callAPI(apiPath, params) {
        // Parse le chemin API (ex: "ApiTasks.create")
        const parts = apiPath.split('.');
        const module = parts[0];
        const method = parts[1];

        // Vérifier que le module existe
        if (typeof window[module] === 'undefined') {
            throw new Error(`Module ${module} non disponible`);
        }

        // Vérifier que la méthode existe
        if (typeof window[module][method] !== 'function') {
            throw new Error(`Méthode ${module}.${method} non disponible`);
        }

        // Appeler la méthode avec les bons paramètres
        const args = this.prepareAPIArgs(method, params);
        console.log('📞 Calling API:', module, method, args);

        return await window[module][method](...args);
    },

    /**
     * Prépare les arguments pour l'appel API
     */
    prepareAPIArgs(method, params) {
        // Certaines méthodes prennent des arguments individuels, d'autres un objet
        const singleArgMethods = ['create', 'update', 'complete', 'delete', 'remove', 'archive', 'restore'];

        if (singleArgMethods.some(m => method.includes(m)) && Object.keys(params).length > 0) {
            // Pour create/update, on passe un objet data
            if (method === 'create') {
                return [params];
            }
            // Pour update, on passe (id, data)
            if (method === 'update') {
                const { taskId, noteId, projectId, ...data } = params;
                const id = taskId || noteId || projectId;
                return [id, data];
            }
            // Pour delete/complete, on passe juste l'id
            if (['complete', 'delete', 'remove', 'archive', 'restore'].includes(method)) {
                const id = params.taskId || params.noteId || params.projectId;
                return [id];
            }
        }

        // Par défaut, retourner les valeurs des paramètres dans l'ordre
        return Object.values(params);
    },

    /**
     * Met à jour l'UI après une action
     */
    async updateUI(action, result) {
        // Recharger les données selon le type d'action
        if (action.id.startsWith('task.')) {
            if (typeof Tasks !== 'undefined' && Tasks.load) {
                await Tasks.load();
                if (Tasks.render) Tasks.render();
            }
        }

        if (action.id.startsWith('note.')) {
            if (typeof NotesCore !== 'undefined' && NotesCore.loadNotes) {
                await NotesCore.loadNotes();
            }
        }

        if (action.id.startsWith('project.')) {
            if (typeof Projects !== 'undefined' && Projects.load) {
                await Projects.load();
                if (Projects.render) Projects.render();
            }
        }

        if (action.id.startsWith('navigation.')) {
            // La navigation est déjà faite par l'API
        }

        // Feedback visuel XP si gamification active
        if (typeof XPFeedback !== 'undefined') {
            XPFeedback.showFloatingXP(10, action.description);
        }
    },

    /**
     * Génère un message de succès personnalisé
     */
    generateSuccessMessage(action, params, result) {
        const messages = {
            'task.create': `✅ Tâche "${params.title}" créée avec succès !`,
            'task.complete': `✅ Tâche terminée ! Bien joué ! 🎉`,
            'task.delete': `🗑️ Tâche supprimée`,
            'task.update': `✏️ Tâche modifiée`,
            'task.assign': `👤 Tâche assignée`,
            'note.create': `📝 Note "${params.title}" créée !`,
            'note.delete': `🗑️ Note supprimée`,
            'project.create': `🚀 Projet "${params.name}" créé !`,
            'project.archive': `📦 Projet archivé`,
            'messaging.send': `💬 Message envoyé !`,
            'mail.compose': `📧 Email envoyé !`,
            'calendar.createEvent': `📅 Événement créé pour ${params.startDate}`,
            'accounting.createInvoice': `💰 Facture créée !`,
            'navigation.goToView': `📍 Navigation vers ${params.viewName}`,
            'gamification.recordXP': `⚡ +${params.xpAmount || 10} XP !`
        };

        return messages[action.id] || `✅ ${action.description} effectuée avec succès !`;
    },

    /**
     * Demande une confirmation pour une action critique
     */
    async requestConfirmation(intent) {
        const confirmationId = Date.now().toString();

        this.state.pendingConfirmations.push({
            id: confirmationId,
            intent,
            timestamp: Date.now()
        });

        return {
            success: false,
            message: `⚠️ Confirmation requise: ${intent.action.description}. Dis "oui" pour confirmer ou "non" pour annuler.`,
            status: 'awaiting_confirmation',
            confirmationId,
            requiresConfirmation: true
        };
    },

    /**
     * Vérifie si une action a été confirmée
     */
    isConfirmed(intent) {
        // Pour l'instant, pas de système de confirmation multi-étapes
        // On considère que si l'utilisateur répète la commande, c'est confirmé
        return false;
    },

    /**
     * Confirme une action en attente
     */
    async confirmAction(confirmationId) {
        const pending = this.state.pendingConfirmations.find(c => c.id === confirmationId);

        if (!pending) {
            return {
                success: false,
                message: '❌ Aucune action en attente de confirmation',
                status: 'no_pending'
            };
        }

        // Retirer de la liste
        this.state.pendingConfirmations = this.state.pendingConfirmations.filter(c => c.id !== confirmationId);

        // Exécuter l'action
        const context = MahayawenContext.getCurrentContext();
        return await this.executeAction(pending.intent, context);
    },

    /**
     * Annule une action en attente
     */
    cancelAction(confirmationId) {
        this.state.pendingConfirmations = this.state.pendingConfirmations.filter(c => c.id !== confirmationId);

        return {
            success: true,
            message: '✅ Action annulée',
            status: 'cancelled'
        };
    },

    /**
     * Ajoute à l'historique d'exécution
     */
    addToHistory(command, intent, result) {
        this.state.executionHistory.push({
            command,
            intent: intent.action.id,
            params: intent.params,
            result: result.success,
            timestamp: Date.now()
        });

        // Limite à 100 dernières commandes
        if (this.state.executionHistory.length > 100) {
            this.state.executionHistory.shift();
        }
    },

    /**
     * Génère des suggestions de commandes
     */
    getSuggestions(command) {
        const normalized = command.toLowerCase();

        // Suggestions basées sur le contexte
        const suggestions = [];
        const context = MahayawenContext.getCurrentContext();

        if (normalized.includes('tâche') || normalized.includes('task')) {
            suggestions.push('Crée une tâche "Nom de la tâche"');
            suggestions.push('Montre-moi les tâches urgentes');
            suggestions.push('Termine la tâche en cours');
        }

        if (normalized.includes('note')) {
            suggestions.push('Crée une note "Titre de la note"');
            suggestions.push('Cherche dans mes notes');
        }

        if (normalized.includes('projet')) {
            suggestions.push('Crée un projet "Nom du projet"');
            suggestions.push('Montre les stats du projet actuel');
        }

        // Suggestions par vue actuelle
        if (context.currentView === 'dashboard') {
            suggestions.push('Va aux tâches', 'Ouvre les notes', 'Montre le calendrier');
        }

        return suggestions.slice(0, 3);
    },

    /**
     * Obtient l'historique des commandes
     */
    getHistory() {
        return this.state.executionHistory.slice(-10).reverse();
    },

    /**
     * Génère un rapport de capacités
     */
    getCapabilitiesReport() {
        const total = MahayawenActionRegistry.getTotalActionsCount();
        const categories = {};

        for (const category in MahayawenActionRegistry) {
            if (typeof MahayawenActionRegistry[category] === 'object' && category !== 'getActionById' && category !== 'searchActions' && category !== 'getTotalActionsCount') {
                const count = Object.keys(MahayawenActionRegistry[category]).length;
                if (count > 0) {
                    categories[category] = count;
                }
            }
        }

        return {
            totalActions: total,
            categories,
            version: '2.0',
            features: [
                'Reconnaissance vocale',
                'Compréhension NLP',
                'Context awareness',
                'Exécution autonome',
                'Confirmations intelligentes',
                'Historique des commandes'
            ]
        };
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.MahayawenAgent = MahayawenAgent;
}
