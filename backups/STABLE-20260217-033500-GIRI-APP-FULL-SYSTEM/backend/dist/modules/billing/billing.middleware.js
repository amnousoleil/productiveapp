"use strict";
/**
 * Billing Middleware - Feature Gating par plan
 * Vérifie si l'utilisateur a accès à une feature selon son plan
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFeature = requireFeature;
exports.requireLimit = requireLimit;
exports.attachPlanInfo = attachPlanInfo;
const billing_plans_js_1 = require("./billing.plans.js");
/**
 * Middleware qui vérifie si l'utilisateur a accès à une feature
 *
 * Exemple d'utilisation :
 * router.get('/notes/graph', authMiddleware, requireFeature('graph3D'), handler)
 */
function requireFeature(feature) {
    return (req, res, next) => {
        const userPlan = req.user?.subscription_plan || req.user?.plan || 'free';
        if (!(0, billing_plans_js_1.hasFeature)(userPlan, feature)) {
            const requiredPlan = (0, billing_plans_js_1.getMinimumPlanForFeature)(feature);
            res.status(403).json({
                error: 'Feature non disponible avec votre plan actuel',
                code: 'FEATURE_GATE',
                feature,
                currentPlan: userPlan,
                requiredPlan,
                upgradeUrl: '/billing'
            });
            return;
        }
        next();
    };
}
/**
 * Middleware qui vérifie une limite d'usage
 *
 * Exemple d'utilisation :
 * router.post('/notes', authMiddleware, requireLimit('maxNotes', getNotesCount), handler)
 */
function requireLimit(limitKey, getUsage) {
    return async (req, res, next) => {
        const userPlan = req.user?.subscription_plan || req.user?.plan || 'free';
        const currentUsage = await getUsage(req);
        const { allowed, remaining, limit } = (0, billing_plans_js_1.checkLimit)(userPlan, limitKey, currentUsage);
        if (!allowed) {
            const requiredPlan = (0, billing_plans_js_1.getMinimumPlanForFeature)(limitKey);
            res.status(403).json({
                error: 'Limite du plan atteinte',
                code: 'LIMIT_REACHED',
                limitKey,
                currentUsage,
                limit,
                currentPlan: userPlan,
                requiredPlan,
                upgradeUrl: '/billing'
            });
            return;
        }
        // Attacher les infos de limite à la request
        req.limitInfo = { remaining, limit, currentUsage };
        next();
    };
}
/**
 * Middleware qui attache les infos du plan à req.planInfo
 * Utile pour les routes qui ont besoin de connaître le plan sans bloquer
 */
function attachPlanInfo(req, _res, next) {
    const userPlan = req.user?.subscription_plan || req.user?.plan || 'free';
    req.planInfo = {
        plan: userPlan,
        hasFeature: (feature) => (0, billing_plans_js_1.hasFeature)(userPlan, feature),
        checkLimit: (limitKey, usage) => (0, billing_plans_js_1.checkLimit)(userPlan, limitKey, usage)
    };
    next();
}
//# sourceMappingURL=billing.middleware.js.map