"use strict";
/**
 * Billing Service - Gestion des abonnements Stripe
 * Checkout Sessions, Webhooks, Customer Portal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStripeEnabled = isStripeEnabled;
exports.getOrCreateStripeCustomer = getOrCreateStripeCustomer;
exports.createCheckoutSession = createCheckoutSession;
exports.createPortalSession = createPortalSession;
exports.getUserBillingStatus = getUserBillingStatus;
exports.constructWebhookEvent = constructWebhookEvent;
exports.handleCheckoutCompleted = handleCheckoutCompleted;
exports.handleSubscriptionUpdated = handleSubscriptionUpdated;
exports.handleSubscriptionDeleted = handleSubscriptionDeleted;
exports.handlePaymentFailed = handlePaymentFailed;
exports.handleInvoicePaid = handleInvoicePaid;
const stripe_1 = __importDefault(require("stripe"));
const database_js_1 = require("../../config/database.js");
const billing_plans_js_1 = require("./billing.plans.js");
// Initialisation Stripe (lazy - seulement si clé présente)
let stripe = null;
function getStripe() {
    if (!stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key)
            throw new Error('STRIPE_SECRET_KEY non configurée dans .env');
        stripe = new stripe_1.default(key, { apiVersion: '2024-12-18.acacia' });
    }
    return stripe;
}
function isStripeEnabled() {
    return !!process.env.STRIPE_SECRET_KEY;
}
// ============================================
// CUSTOMER MANAGEMENT
// ============================================
/**
 * Récupère ou crée un Customer Stripe pour un utilisateur
 */
async function getOrCreateStripeCustomer(userId) {
    // Récupérer l'user avec son stripe_customer_id
    const users = await (0, database_js_1.sql) `
    SELECT id, email, name, stripe_customer_id FROM users WHERE id = ${userId}
  `;
    if (users.length === 0)
        throw new Error('Utilisateur introuvable');
    const user = users[0];
    // Si déjà un customer Stripe
    if (user.stripe_customer_id) {
        try {
            const customer = await getStripe().customers.retrieve(user.stripe_customer_id);
            if (!customer.deleted)
                return customer.id;
        }
        catch {
            // Customer supprimé dans Stripe - en créer un nouveau
        }
    }
    // Créer un nouveau Customer
    const customer = await getStripe().customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId }
    });
    // Sauvegarder dans la DB
    await (0, database_js_1.sql) `
    UPDATE users SET stripe_customer_id = ${customer.id}, updated_at = NOW()
    WHERE id = ${userId}
  `;
    return customer.id;
}
// ============================================
// CHECKOUT
// ============================================
/**
 * Crée une session Stripe Checkout pour un abonnement
 */
async function createCheckoutSession(userId, planId, interval = 'month') {
    const plan = billing_plans_js_1.PLANS[planId];
    if (!plan)
        throw new Error(`Plan "${planId}" invalide`);
    const priceId = interval === 'year' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
    if (!priceId)
        throw new Error(`Aucun price Stripe configuré pour le plan ${planId} en ${interval}ly`);
    const customerId = await getOrCreateStripeCustomer(userId);
    const sessionParams = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'https://giri-app.com'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://giri-app.com'}/billing/cancel`,
        metadata: { userId },
        subscription_data: {
            metadata: { userId }
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        locale: 'fr'
    };
    const session = await getStripe().checkout.sessions.create(sessionParams);
    return { sessionId: session.id, url: session.url };
}
// ============================================
// CUSTOMER PORTAL
// ============================================
/**
 * Crée une session Customer Portal Stripe
 */
async function createPortalSession(userId) {
    const customerId = await getOrCreateStripeCustomer(userId);
    const session = await getStripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.FRONTEND_URL || 'https://giri-app.com'}/settings`
    });
    return session.url;
}
// ============================================
// SUBSCRIPTION STATUS
// ============================================
/**
 * Récupère le statut d'abonnement complet d'un utilisateur
 */
async function getUserBillingStatus(userId) {
    const users = await (0, database_js_1.sql) `
    SELECT
      id, email, plan, subscription_plan, subscription_status,
      stripe_customer_id, stripe_subscription_id,
      current_period_end, cancel_at_period_end,
      subscription_interval
    FROM users WHERE id = ${userId}
  `;
    if (users.length === 0)
        throw new Error('Utilisateur introuvable');
    const user = users[0];
    const planId = (user.subscription_plan || user.plan || 'free');
    const planConfig = billing_plans_js_1.PLANS[planId] || billing_plans_js_1.PLANS.free;
    return {
        plan: planId,
        planName: planConfig.name,
        features: planConfig.features,
        status: user.subscription_status || 'none',
        interval: user.subscription_interval || null,
        currentPeriodEnd: user.current_period_end || null,
        cancelAtPeriodEnd: user.cancel_at_period_end || false,
        stripeCustomerId: user.stripe_customer_id || null,
        hasActiveSubscription: user.subscription_status === 'active' || user.subscription_status === 'trialing'
    };
}
// ============================================
// WEBHOOK HANDLERS
// ============================================
/**
 * Vérifie et parse un webhook Stripe
 */
function constructWebhookEvent(payload, signature) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret)
        throw new Error('STRIPE_WEBHOOK_SECRET non configurée');
    return getStripe().webhooks.constructEvent(payload, signature, secret);
}
/**
 * Handler: checkout.session.completed
 */
async function handleCheckoutCompleted(session) {
    const userId = session.metadata?.userId;
    if (!userId) {
        console.error('[Billing] No userId in checkout metadata');
        return;
    }
    if (!session.subscription) {
        console.warn('[Billing] No subscription in session');
        return;
    }
    const subscription = await getStripe().subscriptions.retrieve(session.subscription);
    const priceId = subscription.items.data[0]?.price?.id;
    const planId = priceId ? (0, billing_plans_js_1.getPlanFromPriceId)(priceId) : 'free';
    await updateUserSubscription(userId, {
        plan: planId,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        interval: subscription.items.data[0]?.price?.recurring?.interval || null
    });
    await logBillingEvent(userId, 'checkout.completed', {
        stripeEventId: session.id,
        newPlan: planId,
        amountCents: session.amount_total || 0
    });
    console.log(`[Billing] ✅ User ${userId} subscribed to ${planId}`);
}
/**
 * Handler: customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) {
        // Essayer de trouver l'user via stripe_subscription_id
        const users = await (0, database_js_1.sql) `
      SELECT id FROM users WHERE stripe_subscription_id = ${subscription.id}
    `;
        if (users.length === 0) {
            console.error('[Billing] No user found for subscription', subscription.id);
            return;
        }
        const foundUserId = users[0].id;
        return handleSubscriptionUpdated({ ...subscription, metadata: { userId: foundUserId } });
    }
    const priceId = subscription.items.data[0]?.price?.id;
    const planId = priceId ? (0, billing_plans_js_1.getPlanFromPriceId)(priceId) : 'free';
    const oldUsers = await (0, database_js_1.sql) `SELECT subscription_plan FROM users WHERE id = ${userId}`;
    const oldPlan = oldUsers[0]?.subscription_plan || 'free';
    await updateUserSubscription(userId, {
        plan: planId,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        interval: subscription.items.data[0]?.price?.recurring?.interval || null
    });
    if (oldPlan !== planId) {
        await logBillingEvent(userId, 'subscription.plan_changed', {
            stripeEventId: subscription.id,
            oldPlan,
            newPlan: planId
        });
        console.log(`[Billing] 🔄 User ${userId} changed plan: ${oldPlan} → ${planId}`);
    }
}
/**
 * Handler: customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription) {
    const users = await (0, database_js_1.sql) `
    SELECT id, subscription_plan FROM users WHERE stripe_subscription_id = ${subscription.id}
  `;
    if (users.length === 0) {
        console.warn('[Billing] Subscription not found:', subscription.id);
        return;
    }
    const user = users[0];
    await (0, database_js_1.sql) `
    UPDATE users SET
      subscription_plan = 'free',
      subscription_status = 'canceled',
      stripe_subscription_id = NULL,
      cancel_at_period_end = FALSE,
      updated_at = NOW()
    WHERE id = ${user.id}
  `;
    await logBillingEvent(user.id, 'subscription.canceled', {
        stripeEventId: subscription.id,
        oldPlan: user.subscription_plan
    });
    console.log(`[Billing] ❌ Subscription canceled for user ${user.id}, downgraded to free`);
}
/**
 * Handler: invoice.payment_failed
 */
async function handlePaymentFailed(invoice) {
    const customerId = invoice.customer;
    const users = await (0, database_js_1.sql) `
    SELECT id FROM users WHERE stripe_customer_id = ${customerId}
  `;
    if (users.length === 0)
        return;
    const userId = users[0].id;
    await (0, database_js_1.sql) `
    UPDATE users SET subscription_status = 'past_due', updated_at = NOW()
    WHERE id = ${userId}
  `;
    await logBillingEvent(userId, 'invoice.payment_failed', {
        stripeEventId: invoice.id
    });
    console.warn(`[Billing] ⚠️ Payment failed for customer ${customerId}`);
}
/**
 * Handler: invoice.paid (renouvellement réussi)
 */
async function handleInvoicePaid(invoice) {
    const customerId = invoice.customer;
    const users = await (0, database_js_1.sql) `
    SELECT id FROM users WHERE stripe_customer_id = ${customerId}
  `;
    if (users.length === 0)
        return;
    const userId = users[0].id;
    await (0, database_js_1.sql) `
    UPDATE users SET subscription_status = 'active', updated_at = NOW()
    WHERE id = ${userId}
  `;
    console.log(`[Billing] 💰 Invoice paid for customer ${customerId}`);
}
// ============================================
// HELPERS INTERNES
// ============================================
async function updateUserSubscription(userId, data) {
    await (0, database_js_1.sql) `
    UPDATE users SET
      subscription_plan = ${data.plan},
      plan = ${data.plan},
      stripe_subscription_id = ${data.subscriptionId},
      subscription_status = ${data.status},
      current_period_end = ${data.currentPeriodEnd},
      cancel_at_period_end = ${data.cancelAtPeriodEnd},
      subscription_interval = ${data.interval},
      updated_at = NOW()
    WHERE id = ${userId}
  `;
}
async function logBillingEvent(userId, eventType, data) {
    try {
        await (0, database_js_1.sql) `
      INSERT INTO billing_events (user_id, event_type, stripe_event_id, old_plan, new_plan, amount_cents)
      VALUES (
        ${userId},
        ${eventType},
        ${data.stripeEventId || null},
        ${data.oldPlan || null},
        ${data.newPlan || null},
        ${data.amountCents || null}
      )
      ON CONFLICT (stripe_event_id) DO NOTHING
    `;
    }
    catch (err) {
        console.error('[Billing] Failed to log billing event:', err);
    }
}
//# sourceMappingURL=billing.service.js.map