// =============================================
// MAHAYAWEN MAIN
// Point d'entrée principal - Initialise tout le système
// =============================================

const MahayawenMain = {
    initialized: false,
    version: '3.0.0',

    /**
     * Initialise MahaYawen complet
     */
    async init() {
        if (this.initialized) {
            console.log('⚠️ MahaYawen déjà initialisé');
            return;
        }

        console.log(`
╔═══════════════════════════════════════════╗
║   🤖 MAHAYAWEN v${this.version} - LE BRAS ARTICULÉ   ║
╚═══════════════════════════════════════════╝
        `);

        try {
            // 1. Vérifier les dépendances
            this.checkDependencies();

            // 2. Initialiser le routeur
            MahayawenRouter.init();

            // 3. Charger l'agent (qui utilisera le routeur)
            if (typeof MahayawenAgent !== 'undefined') {
                MahayawenAgent.init();
            }

            // 4. Initialiser le chatbot UI si disponible
            if (typeof Chatbot !== 'undefined') {
                console.log('   ✓ Chatbot UI prêt');
            }

            this.initialized = true;
            console.log('✅ MahaYawen initialisé avec succès\n');

            // Afficher les capacités
            this.printCapabilities();

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation de MahaYawen:', error);
            throw error;
        }
    },

    /**
     * Vérifie que toutes les dépendances sont chargées
     */
    checkDependencies() {
        const required = {
            'MahayawenApiMap': typeof MahayawenApiMap !== 'undefined',
            'MahayawenRouter': typeof MahayawenRouter !== 'undefined',
            'TaskExecutor': typeof TaskExecutor !== 'undefined',
            'MailExecutor': typeof MailExecutor !== 'undefined',
            'JournalExecutor': typeof JournalExecutor !== 'undefined',
            'ChatExecutor': typeof ChatExecutor !== 'undefined',
            'SystemExecutor': typeof SystemExecutor !== 'undefined',
            'ApiTasks': typeof ApiTasks !== 'undefined',
            'ApiNotes': typeof ApiNotes !== 'undefined',
            'AppState': typeof AppState !== 'undefined'
        };

        const missing = Object.entries(required)
            .filter(([_, loaded]) => !loaded)
            .map(([name, _]) => name);

        if (missing.length > 0) {
            console.warn('⚠️ Dépendances manquantes:', missing.join(', '));
            console.warn('   MahaYawen fonctionnera partiellement');
        } else {
            console.log('   ✓ Toutes les dépendances chargées');
        }

        return missing;
    },

    /**
     * Affiche les capacités de MahaYawen
     */
    printCapabilities() {
        const capabilities = [
            { icon: '📋', name: 'Tasks', count: this.countActions('task') },
            { icon: '✉️', name: 'Mail', count: this.countActions('mail') },
            { icon: '📝', name: 'Notes', count: this.countActions('note') },
            { icon: '📔', name: 'Journal', count: this.countActions('journal') },
            { icon: '📅', name: 'Calendar', count: this.countActions('calendar') },
            { icon: '💼', name: 'CRM', count: this.countActions('crm') },
            { icon: '🔍', name: 'System', count: this.countActions('system') }
        ];

        console.log('📚 Capacités disponibles :');
        capabilities.forEach(cap => {
            if (cap.count > 0) {
                console.log(`   ${cap.icon} ${cap.name} : ${cap.count} actions`);
            }
        });
    },

    /**
     * Compte le nombre d'actions dans un domaine
     */
    countActions(domain) {
        if (typeof MahayawenApiMap === 'undefined') return 0;
        const domainMap = MahayawenApiMap[domain];
        if (!domainMap) return 0;
        return Object.keys(domainMap).filter(k => k !== 'utils').length;
    },

    /**
     * Exécute une commande
     * Point d'entrée unique pour l'utilisateur
     */
    async execute(command) {
        if (!this.initialized) {
            await this.init();
        }

        // Déléguer à l'agent
        if (typeof MahayawenAgent !== 'undefined' && MahayawenAgent.execute) {
            return await MahayawenAgent.execute(command);
        }

        throw new Error('Agent MahaYawen non disponible');
    },

    /**
     * Récupère les statistiques
     */
    getStats() {
        if (!this.initialized) return null;

        return {
            version: this.version,
            initialized: this.initialized,
            domains: Object.keys(MahayawenApiMap || {}).length,
            totalActions: Object.values(MahayawenApiMap || {})
                .reduce((sum, domain) => sum + Object.keys(domain).length, 0),
            executors: Object.keys(MahayawenRouter?.executors || {}).length,
            middlewares: MahayawenRouter?.middlewares?.length || 0
        };
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.MahayawenMain = MahayawenMain;
    window.Mahayawen = MahayawenMain; // Alias court
}

// Auto-init au chargement (si pas en mode lazy)
if (typeof window !== 'undefined' && window.AUTO_INIT_MAHAYAWEN !== false) {
    document.addEventListener('DOMContentLoaded', () => {
        MahayawenMain.init().catch(err => {
            console.error('[MahaYawen] Auto-init failed:', err);
        });
    });
}
