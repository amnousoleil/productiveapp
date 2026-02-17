/**
 * Billing Service - Gestion des abonnements Stripe
 * Checkout Sessions, Webhooks, Customer Portal
 */

import Stripe from 'stripe';
import { sql } from '../../config/database.js';
import { PLANS, getPlanFromPriceId, type PlanId } from './billing.plans.js';
import type { UUID } from '../../types/index.js';

// Initialisation Stripe (lazy - seulement si clé présente)
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY non configurée dans .env');
    stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' as any });
  }
  return stripe;
}

export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

/**
 * Récupère ou crée un Customer Stripe pour un utilisateur
 */
export async function getOrCreateStripeCustomer(userId: UUID): Promise<string> {
  // Récupérer l'user avec son stripe_customer_id
  const users = await sql`
    SELECT id, email, name, stripe_customer_id FROM users WHERE id = ${userId}
  `;

  if (users.length === 0) throw new Error('Utilisateur introuvable');
  const user = users[0] as { id: string; email: string; name: string; stripe_customer_id?: string };

  // Si déjà un customer Stripe
  if (user.stripe_customer_id) {
    try {
      const customer = await getStripe().customers.retrieve(user.stripe_customer_id);
      if (!customer.deleted) return customer.id;
    } catch {
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
  await sql`
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
export async function createCheckoutSession(
  userId: UUID,
  planId: PlanId,
  interval: 'month' | 'year' = 'month'
): Promise<{ sessionId: string; url: string }> {
  const plan = PLANS[planId];
  if (!plan) throw new Error(`Plan "${planId}" invalide`);

  const priceId = interval === 'year' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
  if (!priceId) throw new Error(`Aucun price Stripe configuré pour le plan ${planId} en ${interval}ly`);

  const customerId = await getOrCreateStripeCustomer(userId);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
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

  return { sessionId: session.id, url: session.url! };
}

// ============================================
// CUSTOMER PORTAL
// ============================================

/**
 * Crée une session Customer Portal Stripe
 */
export async function createPortalSession(userId: UUID): Promise<string> {
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
export async function getUserBillingStatus(userId: UUID) {
  const users = await sql`
    SELECT
      id, email, plan, subscription_plan, subscription_status,
      stripe_customer_id, stripe_subscription_id,
      current_period_end, cancel_at_period_end,
      subscription_interval
    FROM users WHERE id = ${userId}
  `;

  if (users.length === 0) throw new Error('Utilisateur introuvable');

  const user = users[0] as any;
  const planId: PlanId = (user.subscription_plan || user.plan || 'free') as PlanId;
  const planConfig = PLANS[planId] || PLANS.free;

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
export function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET non configurée');

  return getStripe().webhooks.constructEvent(payload, signature, secret);
}

/**
 * Handler: checkout.session.completed
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) { console.error('[Billing] No userId in checkout metadata'); return; }

  if (!session.subscription) { console.warn('[Billing] No subscription in session'); return; }

  const subscription = await getStripe().subscriptions.retrieve(session.subscription as string);
  const priceId = subscription.items.data[0]?.price?.id;
  const planId = priceId ? getPlanFromPriceId(priceId) : 'free';

  await updateUserSubscription(userId, {
    plan: planId,
    subscriptionId: subscription.id,
    status: subscription.status as string,
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
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
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    // Essayer de trouver l'user via stripe_subscription_id
    const users = await sql`
      SELECT id FROM users WHERE stripe_subscription_id = ${subscription.id}
    `;
    if (users.length === 0) { console.error('[Billing] No user found for subscription', subscription.id); return; }
    const foundUserId = (users[0] as any).id;
    return handleSubscriptionUpdated({ ...subscription, metadata: { userId: foundUserId } });
  }

  const priceId = subscription.items.data[0]?.price?.id;
  const planId = priceId ? getPlanFromPriceId(priceId) : 'free';

  const oldUsers = await sql`SELECT subscription_plan FROM users WHERE id = ${userId}`;
  const oldPlan = (oldUsers[0] as any)?.subscription_plan || 'free';

  await updateUserSubscription(userId, {
    plan: planId,
    subscriptionId: subscription.id,
    status: subscription.status as string,
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
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
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const users = await sql`
    SELECT id, subscription_plan FROM users WHERE stripe_subscription_id = ${subscription.id}
  `;

  if (users.length === 0) { console.warn('[Billing] Subscription not found:', subscription.id); return; }

  const user = users[0] as any;

  await sql`
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
export async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;
  const users = await sql`
    SELECT id FROM users WHERE stripe_customer_id = ${customerId}
  `;

  if (users.length === 0) return;
  const userId = (users[0] as any).id;

  await sql`
    UPDATE users SET subscription_status = 'past_due', updated_at = NOW()
    WHERE id = ${userId}
  `;

  await logBillingEvent(userId, 'invoice.payment_failed', {
    stripeEventId: (invoice as any).id
  });

  console.warn(`[Billing] ⚠️ Payment failed for customer ${customerId}`);
}

/**
 * Handler: invoice.paid (renouvellement réussi)
 */
export async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;
  const users = await sql`
    SELECT id FROM users WHERE stripe_customer_id = ${customerId}
  `;

  if (users.length === 0) return;
  const userId = (users[0] as any).id;

  await sql`
    UPDATE users SET subscription_status = 'active', updated_at = NOW()
    WHERE id = ${userId}
  `;

  console.log(`[Billing] 💰 Invoice paid for customer ${customerId}`);
}

// ============================================
// HELPERS INTERNES
// ============================================

async function updateUserSubscription(userId: UUID, data: {
  plan: PlanId;
  subscriptionId: string;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  interval: string | null;
}): Promise<void> {
  await sql`
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

async function logBillingEvent(userId: UUID, eventType: string, data: {
  stripeEventId?: string;
  oldPlan?: string;
  newPlan?: string;
  amountCents?: number;
}): Promise<void> {
  try {
    await sql`
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
  } catch (err) {
    console.error('[Billing] Failed to log billing event:', err);
  }
}
