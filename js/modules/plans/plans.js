// =============================================
// PRODUCTIVEAPP - PLANS MODULE
// Gestion des abonnements et plans
// =============================================

const PlansModule = {
    initialized: false,
    plans: [
        {
            id: 'free',
            name: 'Gratuit',
            price: 0,
            features: ['5 projets', '100 taches', '1 Go stockage', 'Support communaute']
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 9.99,
            features: ['Projets illimites', 'Taches illimitees', '10 Go stockage', 'Support prioritaire', 'Analytics avances']
        },
        {
            id: 'team',
            name: 'Team',
            price: 19.99,
            features: ['Tout Pro +', 'Membres illimites', '100 Go stockage', 'SSO', 'API access', 'Support dedie']
        }
    ],

    /**
     * Initialise le module
     */
    init() {
        if (this.initialized) return;
        console.log('[PlansModule] Initialized');
        this.initialized = true;
    },

    /**
     * Recupere le plan actuel de l'utilisateur
     */
    async getCurrentPlan() {
        try {
            const response = await ApiFetch.get('/users/me/plan');
            return response.data?.plan || 'free';
        } catch (error) {
            console.error('[PlansModule] Get plan error:', error);
            return 'free';
        }
    },

    /**
     * Liste tous les plans disponibles
     */
    getPlans() {
        return this.plans;
    },

    /**
     * Recupere un plan par son ID
     */
    getPlan(planId) {
        return this.plans.find(p => p.id === planId);
    },

    /**
     * Upgrade vers un nouveau plan
     */
    async upgrade(planId) {
        try {
            const response = await ApiFetch.post('/plans/upgrade', { plan_id: planId });
            return response.success;
        } catch (error) {
            console.error('[PlansModule] Upgrade error:', error);
            return false;
        }
    },

    /**
     * Verifie si l'utilisateur a acces a une feature
     */
    hasFeature(featureName) {
        // Implementation basee sur le plan actuel
        return true; // Par defaut, autoriser
    },

    /**
     * Render la page des plans
     */
    render() {
        const container = document.getElementById('view-plans');
        if (!container) return;

        container.innerHTML = `
            <div class="plans-page">
                <h1>Choisissez votre plan</h1>
                <div class="plans-grid">
                    ${this.plans.map(plan => `
                        <div class="plan-card ${plan.id}">
                            <h2>${plan.name}</h2>
                            <div class="plan-price">
                                ${plan.price === 0 ? 'Gratuit' : `${plan.price}€/mois`}
                            </div>
                            <ul class="plan-features">
                                ${plan.features.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                            <button onclick="PlansModule.upgrade('${plan.id}')">
                                Choisir
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.PlansModule = PlansModule;
}
