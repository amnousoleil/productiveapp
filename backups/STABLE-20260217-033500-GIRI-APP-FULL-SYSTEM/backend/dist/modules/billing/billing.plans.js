"use strict";
/**
 * Billing Plans - Définition des 4 plans de Giri App
 * Plans : Free | Pro | Business | Enterprise
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANS = void 0;
exports.hasFeature = hasFeature;
exports.checkLimit = checkLimit;
exports.getMinimumPlanForFeature = getMinimumPlanForFeature;
exports.getPlanFromPriceId = getPlanFromPriceId;
exports.isYearlyPrice = isYearlyPrice;
// ============================================
// DÉFINITION DES PLANS
// ============================================
exports.PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        description: 'Démarrez gratuitement, sans carte bancaire',
        price: 0,
        yearlyPrice: 0,
        interval: null,
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
        highlights: [
            '50 notes maximum',
            '5 prompts par jour',
            '100 MB de stockage',
            'Support communauté'
        ],
        features: {
            maxNotes: 50,
            aiClustering: false,
            graph3D: false,
            promptsPerDay: 5,
            promptLibrary: false,
            customDomains: 0,
            teamMembers: 1,
            storage: '100MB',
            support: 'community',
            api: false,
            analytics: false,
            whiteLabel: false,
            aiReports: false,
            reportsPerMonth: 0
        }
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        description: 'Parfait pour les professionnels indépendants',
        price: 9.99,
        yearlyPrice: 99,
        interval: 'month',
        stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || null,
        stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY || null,
        popular: true,
        highlights: [
            '500 notes',
            'Clustering IA et Graph 3D',
            '50 prompts par jour',
            '5 GB de stockage',
            'Support email'
        ],
        features: {
            maxNotes: 500,
            aiClustering: true,
            graph3D: true,
            promptsPerDay: 50,
            promptLibrary: true,
            customDomains: 1,
            teamMembers: 1,
            storage: '5GB',
            support: 'email',
            api: false,
            analytics: true,
            whiteLabel: false,
            aiReports: true,
            reportsPerMonth: 30
        }
    },
    business: {
        id: 'business',
        name: 'Business',
        description: 'Pour les équipes et les PME ambitieuses',
        price: 29.99,
        yearlyPrice: 299,
        interval: 'month',
        stripePriceIdMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || null,
        stripePriceIdYearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || null,
        highlights: [
            'Notes illimitées',
            'Jusqu\'à 10 membres',
            'Prompts illimités',
            '50 GB de stockage',
            'API et analytics avancés',
            'Support prioritaire'
        ],
        features: {
            maxNotes: -1,
            aiClustering: true,
            graph3D: true,
            promptsPerDay: -1,
            promptLibrary: true,
            customDomains: 5,
            teamMembers: 10,
            storage: '50GB',
            support: 'priority',
            api: true,
            analytics: true,
            whiteLabel: false,
            aiReports: true,
            reportsPerMonth: -1
        }
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Solution sur mesure pour les grandes organisations',
        price: null,
        yearlyPrice: null,
        interval: 'month',
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
        highlights: [
            'Tout illimité',
            'Membres illimités',
            'White label',
            'SSO',
            'Intégrations custom',
            'Support dédié',
            'SLA garanti'
        ],
        features: {
            maxNotes: -1,
            aiClustering: true,
            graph3D: true,
            promptsPerDay: -1,
            promptLibrary: true,
            customDomains: -1,
            teamMembers: -1,
            storage: 'unlimited',
            support: 'dedicated',
            api: true,
            analytics: true,
            whiteLabel: true,
            aiReports: true,
            reportsPerMonth: -1
        }
    }
};
// ============================================
// HELPERS
// ============================================
/**
 * Vérifie si un plan a accès à une feature
 */
function hasFeature(planId, feature) {
    const plan = exports.PLANS[planId];
    if (!plan)
        return false;
    const value = plan.features[feature];
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'number')
        return value !== 0;
    return !!value;
}
/**
 * Vérifie une limite avec l'usage actuel
 */
function checkLimit(planId, limitKey, currentUsage) {
    const plan = exports.PLANS[planId];
    if (!plan)
        return { allowed: false, remaining: 0, limit: 0 };
    const limit = plan.features[limitKey];
    if (limit === -1)
        return { allowed: true, remaining: Infinity, limit: -1 };
    const remaining = limit - currentUsage;
    return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining),
        limit
    };
}
/**
 * Trouve le plan minimum requis pour une feature
 */
function getMinimumPlanForFeature(feature) {
    const planOrder = ['free', 'pro', 'business', 'enterprise'];
    for (const planId of planOrder) {
        if (hasFeature(planId, feature)) {
            return planId;
        }
    }
    return 'enterprise';
}
/**
 * Trouve un plan à partir d'un price ID Stripe
 */
function getPlanFromPriceId(priceId) {
    for (const [planId, plan] of Object.entries(exports.PLANS)) {
        if (plan.stripePriceIdMonthly === priceId || plan.stripePriceIdYearly === priceId) {
            return planId;
        }
    }
    return 'free';
}
/**
 * Vérifie si un interval est annuel à partir d'un price ID
 */
function isYearlyPrice(priceId) {
    for (const plan of Object.values(exports.PLANS)) {
        if (plan.stripePriceIdYearly === priceId)
            return true;
    }
    return false;
}
//# sourceMappingURL=billing.plans.js.map