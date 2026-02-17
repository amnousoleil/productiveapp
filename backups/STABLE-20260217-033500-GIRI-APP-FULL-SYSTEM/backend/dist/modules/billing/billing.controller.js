"use strict";
/**
 * Billing Controller - Handlers Express
 * Checkout | Webhooks | Status | Portal
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.getStripeStatus = exports.getPlans = exports.getBillingStatus = exports.createPortal = exports.createCheckout = void 0;
const billing_plans_js_1 = require("./billing.plans.js");
const billingService = __importStar(require("./billing.service.js"));
// ============================================
// CHECKOUT
// ============================================
/**
 * POST /api/v1/billing/checkout
 * Crée une session Stripe Checkout pour un abonnement
 */
const createCheckout = async (req, res) => {
    try {
        if (!billingService.isStripeEnabled()) {
            res.status(503).json({ error: 'Stripe non configuré', code: 'STRIPE_NOT_CONFIGURED' });
            return;
        }
        const { planId, interval = 'month' } = req.body;
        const userId = req.user.id;
        if (!planId || !billing_plans_js_1.PLANS[planId]) {
            res.status(400).json({ error: `Plan invalide: "${planId}"`, validPlans: Object.keys(billing_plans_js_1.PLANS) });
            return;
        }
        if (planId === 'free' || planId === 'enterprise') {
            res.status(400).json({
                error: planId === 'free'
                    ? 'Le plan Free est gratuit, pas besoin de paiement'
                    : 'Le plan Enterprise nécessite un contact commercial',
                code: planId === 'enterprise' ? 'CONTACT_SALES' : 'FREE_PLAN'
            });
            return;
        }
        const result = await billingService.createCheckoutSession(userId, planId, interval);
        res.json(result);
    }
    catch (error) {
        console.error('[Billing] Checkout error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors du checkout' });
    }
};
exports.createCheckout = createCheckout;
// ============================================
// CUSTOMER PORTAL
// ============================================
/**
 * POST /api/v1/billing/portal
 * Crée une session Stripe Customer Portal
 */
const createPortal = async (req, res) => {
    try {
        if (!billingService.isStripeEnabled()) {
            res.status(503).json({ error: 'Stripe non configuré', code: 'STRIPE_NOT_CONFIGURED' });
            return;
        }
        const userId = req.user.id;
        const url = await billingService.createPortalSession(userId);
        res.json({ url });
    }
    catch (error) {
        console.error('[Billing] Portal error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de l\'accès au portail' });
    }
};
exports.createPortal = createPortal;
// ============================================
// STATUS & PLANS
// ============================================
/**
 * GET /api/v1/billing/status
 * Statut d'abonnement de l'utilisateur connecté
 */
const getBillingStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const status = await billingService.getUserBillingStatus(userId);
        res.json(status);
    }
    catch (error) {
        console.error('[Billing] Status error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la récupération du statut' });
    }
};
exports.getBillingStatus = getBillingStatus;
/**
 * GET /api/v1/billing/plans
 * Liste tous les plans disponibles (public)
 */
const getPlans = async (_req, res) => {
    try {
        // Ne pas exposer les stripePriceId en production côté client
        const publicPlans = Object.values(billing_plans_js_1.PLANS).map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            yearlyPrice: plan.yearlyPrice,
            interval: plan.interval,
            popular: plan.popular || false,
            highlights: plan.highlights,
            features: plan.features,
            hasStripePayment: !!(plan.stripePriceIdMonthly || plan.stripePriceIdYearly)
        }));
        res.json({ plans: publicPlans });
    }
    catch (error) {
        console.error('[Billing] Plans error:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.getPlans = getPlans;
/**
 * GET /api/v1/billing/stripe-status
 * Vérifie si Stripe est configuré (pour le dashboard admin)
 */
const getStripeStatus = async (_req, res) => {
    res.json({
        enabled: billingService.isStripeEnabled(),
        plans: {
            pro: {
                monthly: !!process.env.STRIPE_PRICE_PRO_MONTHLY,
                yearly: !!process.env.STRIPE_PRICE_PRO_YEARLY
            },
            business: {
                monthly: !!process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
                yearly: !!process.env.STRIPE_PRICE_BUSINESS_YEARLY
            }
        }
    });
};
exports.getStripeStatus = getStripeStatus;
// ============================================
// WEBHOOKS
// ============================================
/**
 * POST /api/v1/billing/webhooks
 * ⚠️ CRITIQUE: Reçoit les événements Stripe
 * DOIT utiliser express.raw() et NOT express.json()
 */
const handleWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
        res.status(400).json({ error: 'stripe-signature header manquant' });
        return;
    }
    let event;
    try {
        event = billingService.constructWebhookEvent(req.body, signature);
    }
    catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    console.log(`📨 Stripe Webhook: ${event.type}`);
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await billingService.handleCheckoutCompleted(event.data.object);
                break;
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await billingService.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await billingService.handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_failed':
                await billingService.handlePaymentFailed(event.data.object);
                break;
            case 'invoice.paid':
                await billingService.handleInvoicePaid(event.data.object);
                break;
            default:
                console.log(`[Billing] Unhandled webhook: ${event.type}`);
        }
        res.json({ received: true, type: event.type });
    }
    catch (error) {
        console.error('[Billing] Webhook handler error:', error);
        // Retourner 200 quand même pour éviter que Stripe retente
        res.status(200).json({ received: true, error: error.message });
    }
};
exports.handleWebhook = handleWebhook;
//# sourceMappingURL=billing.controller.js.map