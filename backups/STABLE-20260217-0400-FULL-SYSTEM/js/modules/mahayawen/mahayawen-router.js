// =============================================
// MAHAYAWEN ROUTER
// Routeur central qui orchestre les intentions → exécutions
// =============================================

const MahayawenRouter = {
    executors: {},
    middlewares: [],
    initialized: false,

    /**
     * Initialise le routeur
     */
    init() {
        if (this.initialized) return;

        console.log('🔌 [MahayawenRouter] Initializing...');

        // Enregistrer les middlewares dans l'ordre d'exécution
        this.registerMiddleware(PermissionsMiddleware);
        this.registerMiddleware(RateLimitMiddleware);
        this.registerMiddleware(ConfirmationMiddleware);
        this.registerMiddleware(LoggingMiddleware);

        // Enregistrer les exécuteurs (un par domaine)
        // Les exécuteurs seront chargés à la demande
        this.executorRegistry = {
            task: 'TaskExecutor',
            note: 'NoteExecutor',
            mail: 'MailExecutor',
            journal: 'JournalExecutor',
            calendar: 'CalendarExecutor',
            crm: 'CrmExecutor',
            settings: 'SettingsExecutor',
            system: 'SystemExecutor',
            chat: 'ChatExecutor'
        };

        this.initialized = true;
        console.log('✅ [MahayawenRouter] Ready');
    },

    /**
     * Enregistre un middleware
     */
    registerMiddleware(middleware) {
        if (!middleware || typeof middleware.process !== 'function') {
            console.error('[MahayawenRouter] Invalid middleware:', middleware);
            return;
        }
        this.middlewares.push(middleware);
        console.log(`   ✓ Middleware: ${middleware.constructor?.name || 'Unknown'}`);
    },

    /**
     * Enregistre un exécuteur pour un domaine
     */
    registerExecutor(domain, executor) {
        if (!executor || typeof executor.execute !== 'function') {
            console.error('[MahayawenRouter] Invalid executor for', domain);
            return;
        }
        this.executors[domain] = executor;
        console.log(`   ✓ Executor registered: ${domain}`);
    },

    /**
     * Route une intention vers le bon exécuteur
     * @param {object} intent - Intention structurée de l'IA
     * @returns {Promise<object>} - Résultat de l'exécution
     */
    async route(intent) {
        if (!this.initialized) this.init();

        console.log('🎯 [MahayawenRouter] Routing:', intent.intent);

        try {
            // 1. Exécuter les middlewares
            for (const middleware of this.middlewares) {
                const result = await middleware.process(intent);

                if (result.blocked) {
                    console.warn('🚫 [Middleware] Blocked:', result.reason || 'Unknown reason');
                    return {
                        success: false,
                        blocked: true,
                        ...result
                    };
                }
            }

            // 2. Extraire le domaine et l'action
            const [domain, action] = intent.intent.split('.');

            if (!domain || !action) {
                throw new Error(`Format d'intention invalide: "${intent.intent}". Format attendu: "domaine.action"`);
            }

            // 3. Récupérer l'exécuteur
            const executor = await this.getExecutor(domain);

            if (!executor) {
                throw new Error(`Aucun exécuteur trouvé pour le domaine: ${domain}`);
            }

            // 4. Vérifier que l'action existe
            if (typeof executor[action] !== 'function') {
                throw new Error(`Action "${action}" inconnue pour le domaine "${domain}"`);
            }

            // 5. Exécuter l'action
            console.log('⚡ [MahayawenRouter] Executing:', domain, action, intent.params);
            const result = await executor[action](intent.params);

            console.log('✅ [MahayawenRouter] Success:', intent.intent);

            return {
                success: true,
                intent: intent.intent,
                result
            };

        } catch (error) {
            console.error('❌ [MahayawenRouter] Error:', error);
            return {
                success: false,
                error: error.message,
                intent: intent.intent,
                stack: error.stack
            };
        }
    },

    /**
     * Récupère un exécuteur (lazy loading)
     */
    async getExecutor(domain) {
        // Si déjà chargé, retourner directement
        if (this.executors[domain]) {
            return this.executors[domain];
        }

        // Charger l'exécuteur à la demande
        const executorClassName = this.executorRegistry[domain];

        if (!executorClassName) {
            console.error(`[MahayawenRouter] Domaine inconnu: ${domain}`);
            return null;
        }

        // Vérifier si l'exécuteur est déjà chargé globalement
        if (typeof window[executorClassName] !== 'undefined') {
            const executor = window[executorClassName];
            this.executors[domain] = executor;
            return executor;
        }

        console.warn(`[MahayawenRouter] Exécuteur ${executorClassName} non chargé. Assurez-vous d'inclure le script.`);
        return null;
    },

    /**
     * Exécute une action multi (plusieurs actions séquentielles)
     */
    async routeMulti(actions) {
        const results = [];

        for (const action of actions) {
            const result = await this.route(action);
            results.push(result);

            // Arrêter si une action échoue
            if (!result.success) {
                console.warn('[MahayawenRouter] Multi-action stopped due to failure:', result);
                break;
            }
        }

        return {
            success: results.every(r => r.success),
            results,
            count: results.length,
            total: actions.length
        };
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.MahayawenRouter = MahayawenRouter;
}
