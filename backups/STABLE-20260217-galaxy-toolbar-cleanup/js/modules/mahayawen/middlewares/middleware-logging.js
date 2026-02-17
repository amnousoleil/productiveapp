// =============================================
// MIDDLEWARE LOGGING
// Enregistre toutes les actions MahaYawen dans le Journal
// =============================================

const LoggingMiddleware = {
    /**
     * Enregistre l'action dans le journal d'activité
     * Ne bloque JAMAIS l'exécution
     */
    async process(intent) {
        try {
            // Créer une entrée journal pour cette action MahaYawen
            const logEntry = {
                category: 'task', // Catégorie "task" = action exécutée
                text: `🤖 MahaYawen: ${intent.intent} - ${this.formatParams(intent.params)}`,
                energy: 2, // Énergie normale
                source: 'mahayawen'
            };

            // Appeler le Journal (async, sans attendre)
            if (typeof Journal !== 'undefined' && Journal.add) {
                Journal.add(logEntry.category, logEntry.text, logEntry.energy)
                    .catch(err => console.warn('[LoggingMiddleware] Journal write failed:', err));
            }

            console.log('📝 [MahaYawen Log]', intent.intent, intent.params);
        } catch (error) {
            console.error('[LoggingMiddleware] Error:', error);
            // Ne jamais bloquer même en cas d'erreur
        }

        return { blocked: false };
    },

    /**
     * Formater les paramètres pour le log
     */
    formatParams(params) {
        if (!params) return '';
        const keys = Object.keys(params);
        if (keys.length === 0) return '';
        if (keys.length > 3) return `${keys.length} paramètres`;
        return keys.map(k => `${k}=${JSON.stringify(params[k]).slice(0, 50)}`).join(', ');
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.LoggingMiddleware = LoggingMiddleware;
}
