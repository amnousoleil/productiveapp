/**
 * Billing Service - Gestion des abonnements Stripe
 * Checkout Sessions, Webhooks, Customer Portal
 */
import Stripe from 'stripe';
import { type PlanId } from './billing.plans.js';
import type { UUID } from '../../types/index.js';
export declare function isStripeEnabled(): boolean;
/**
 * Récupère ou crée un Customer Stripe pour un utilisateur
 */
export declare function getOrCreateStripeCustomer(userId: UUID): Promise<string>;
/**
 * Crée une session Stripe Checkout pour un abonnement
 */
export declare function createCheckoutSession(userId: UUID, planId: PlanId, interval?: 'month' | 'year'): Promise<{
    sessionId: string;
    url: string;
}>;
/**
 * Crée une session Customer Portal Stripe
 */
export declare function createPortalSession(userId: UUID): Promise<string>;
/**
 * Récupère le statut d'abonnement complet d'un utilisateur
 */
export declare function getUserBillingStatus(userId: UUID): Promise<{
    plan: PlanId;
    planName: string;
    features: import("./billing.plans.js").PlanFeatures;
    status: any;
    interval: any;
    currentPeriodEnd: any;
    cancelAtPeriodEnd: any;
    stripeCustomerId: any;
    hasActiveSubscription: boolean;
}>;
/**
 * Vérifie et parse un webhook Stripe
 */
export declare function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event;
/**
 * Handler: checkout.session.completed
 */
export declare function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void>;
/**
 * Handler: customer.subscription.updated
 */
export declare function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void>;
/**
 * Handler: customer.subscription.deleted
 */
export declare function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void>;
/**
 * Handler: invoice.payment_failed
 */
export declare function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void>;
/**
 * Handler: invoice.paid (renouvellement réussi)
 */
export declare function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void>;
//# sourceMappingURL=billing.service.d.ts.map