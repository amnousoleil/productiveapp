/**
 * Billing Controller - Handlers Express
 * Checkout | Webhooks | Status | Portal
 */

import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { PLANS, type PlanId } from './billing.plans.js';
import * as billingService from './billing.service.js';

type Req = AuthenticatedRequest;

// ============================================
// CHECKOUT
// ============================================

/**
 * POST /api/v1/billing/checkout
 * Crée une session Stripe Checkout pour un abonnement
 */
export const createCheckout = async (req: Req, res: Response): Promise<void> => {
  try {
    if (!billingService.isStripeEnabled()) {
      res.status(503).json({ error: 'Stripe non configuré', code: 'STRIPE_NOT_CONFIGURED' });
      return;
    }

    const { planId, interval = 'month' } = req.body as { planId: PlanId; interval?: 'month' | 'year' };
    const userId = req.user!.id;

    if (!planId || !PLANS[planId]) {
      res.status(400).json({ error: `Plan invalide: "${planId}"`, validPlans: Object.keys(PLANS) });
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

  } catch (error: any) {
    console.error('[Billing] Checkout error:', error);
    res.status(500).json({ error: error.message || 'Erreur lors du checkout' });
  }
};

// ============================================
// CUSTOMER PORTAL
// ============================================

/**
 * POST /api/v1/billing/portal
 * Crée une session Stripe Customer Portal
 */
export const createPortal = async (req: Req, res: Response): Promise<void> => {
  try {
    if (!billingService.isStripeEnabled()) {
      res.status(503).json({ error: 'Stripe non configuré', code: 'STRIPE_NOT_CONFIGURED' });
      return;
    }

    const userId = req.user!.id;
    const url = await billingService.createPortalSession(userId);
    res.json({ url });

  } catch (error: any) {
    console.error('[Billing] Portal error:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de l\'accès au portail' });
  }
};

// ============================================
// STATUS & PLANS
// ============================================

/**
 * GET /api/v1/billing/status
 * Statut d'abonnement de l'utilisateur connecté
 */
export const getBillingStatus = async (req: Req, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const status = await billingService.getUserBillingStatus(userId);
    res.json(status);

  } catch (error: any) {
    console.error('[Billing] Status error:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la récupération du statut' });
  }
};

/**
 * GET /api/v1/billing/plans
 * Liste tous les plans disponibles (public)
 */
export const getPlans = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Ne pas exposer les stripePriceId en production côté client
    const publicPlans = Object.values(PLANS).map(plan => ({
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

  } catch (error: any) {
    console.error('[Billing] Plans error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/v1/billing/stripe-status
 * Vérifie si Stripe est configuré (pour le dashboard admin)
 */
export const getStripeStatus = async (_req: Request, res: Response): Promise<void> => {
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

// ============================================
// WEBHOOKS
// ============================================

/**
 * POST /api/v1/billing/webhooks
 * ⚠️ CRITIQUE: Reçoit les événements Stripe
 * DOIT utiliser express.raw() et NOT express.json()
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).json({ error: 'stripe-signature header manquant' });
    return;
  }

  let event;
  try {
    event = billingService.constructWebhookEvent(req.body as Buffer, signature);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  console.log(`📨 Stripe Webhook: ${event.type}`);

  try {
    switch (event.type) {

      case 'checkout.session.completed':
        await billingService.handleCheckoutCompleted(event.data.object as any);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await billingService.handleSubscriptionUpdated(event.data.object as any);
        break;

      case 'customer.subscription.deleted':
        await billingService.handleSubscriptionDeleted(event.data.object as any);
        break;

      case 'invoice.payment_failed':
        await billingService.handlePaymentFailed(event.data.object as any);
        break;

      case 'invoice.paid':
        await billingService.handleInvoicePaid(event.data.object as any);
        break;

      default:
        console.log(`[Billing] Unhandled webhook: ${event.type}`);
    }

    res.json({ received: true, type: event.type });

  } catch (error: any) {
    console.error('[Billing] Webhook handler error:', error);
    // Retourner 200 quand même pour éviter que Stripe retente
    res.status(200).json({ received: true, error: error.message });
  }
};
