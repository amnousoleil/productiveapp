// =============================================
// MIDDLEWARE PERMISSIONS
// Vérifie que l'utilisateur a les droits pour l'action
// =============================================

const PermissionsMiddleware = {
    /**
     * Vérifie les permissions de l'utilisateur
     * Pour l'instant: permissions de base seulement
     * TODO: Étendre avec des rôles granulaires
     */
    async process(intent) {
        // Récupérer l'utilisateur actuel
        const currentUser = AppState?.currentUser;

        if (!currentUser) {
            return {
                blocked: true,
                reason: '🔒 Aucun utilisateur connecté. Veuillez vous connecter.'
            };
        }

        // Actions admin uniquement (si nécessaire)
        const adminOnlyActions = [
            'team.deleteUser',
            'settings.resetAll',
            'crm.deletePipeline'
        ];

        if (adminOnlyActions.includes(intent.intent)) {
            const isAdmin = currentUser.role === 'admin' || currentUser.role === 'owner';
            if (!isAdmin) {
                return {
                    blocked: true,
                    reason: '🔒 Action réservée aux administrateurs.'
                };
            }
        }

        // Actions nécessitant un plan premium (exemple)
        const premiumActions = [
            'mail.sendCampaign',
            'crm.exportData',
            'analytics.advanced'
        ];

        if (premiumActions.includes(intent.intent)) {
            // Vérifier le plan (si le module Plans existe)
            if (typeof PlansModule !== 'undefined') {
                const currentPlan = PlansModule.getCurrentPlanSync?.();
                if (currentPlan && currentPlan.id === 'free') {
                    return {
                        blocked: true,
                        reason: '💎 Cette action nécessite un abonnement Premium.',
                        upgrade: true
                    };
                }
            }
        }

        // Pas de restriction
        return { blocked: false };
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.PermissionsMiddleware = PermissionsMiddleware;
}
