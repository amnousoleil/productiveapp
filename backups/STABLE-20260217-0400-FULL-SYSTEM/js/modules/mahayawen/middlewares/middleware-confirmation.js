// =============================================
// MIDDLEWARE CONFIRMATION
// Demande confirmation pour les actions destructives
// =============================================

const ConfirmationMiddleware = {
    /**
     * Vérifie si l'action nécessite confirmation
     * Bloque l'exécution et demande à l'utilisateur
     */
    async process(intent) {
        // Vérifier si l'action existe dans l'API Map
        const [domain, action] = intent.intent.split('.');
        const apiMapEntry = MahayawenApiMap[domain]?.[action];

        // Si l'action nécessite confirmation et n'est pas déjà confirmée
        if (apiMapEntry?.confirmation && !intent.isConfirmed) {
            return {
                blocked: true,
                needsConfirmation: true,
                confirmationMessage: intent.confirmation_message ||
                    `⚠️ Voulez-vous vraiment exécuter cette action destructive ?\n\n**Action** : ${intent.intent}\n\nCette action est irréversible.`,
                intent: intent // Garder l'intent pour re-exécution après confirmation
            };
        }

        // Pas de confirmation nécessaire ou déjà confirmée
        return { blocked: false };
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.ConfirmationMiddleware = ConfirmationMiddleware;
}
