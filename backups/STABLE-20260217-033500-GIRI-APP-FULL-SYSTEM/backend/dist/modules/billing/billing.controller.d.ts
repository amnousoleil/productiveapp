/**
 * Billing Controller - Handlers Express
 * Checkout | Webhooks | Status | Portal
 */
import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
type Req = AuthenticatedRequest;
/**
 * POST /api/v1/billing/checkout
 * Crée une session Stripe Checkout pour un abonnement
 */
export declare const createCheckout: (req: Req, res: Response) => Promise<void>;
/**
 * POST /api/v1/billing/portal
 * Crée une session Stripe Customer Portal
 */
export declare const createPortal: (req: Req, res: Response) => Promise<void>;
/**
 * GET /api/v1/billing/status
 * Statut d'abonnement de l'utilisateur connecté
 */
export declare const getBillingStatus: (req: Req, res: Response) => Promise<void>;
/**
 * GET /api/v1/billing/plans
 * Liste tous les plans disponibles (public)
 */
export declare const getPlans: (_req: Request, res: Response) => Promise<void>;
/**
 * GET /api/v1/billing/stripe-status
 * Vérifie si Stripe est configuré (pour le dashboard admin)
 */
export declare const getStripeStatus: (_req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/billing/webhooks
 * ⚠️ CRITIQUE: Reçoit les événements Stripe
 * DOIT utiliser express.raw() et NOT express.json()
 */
export declare const handleWebhook: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=billing.controller.d.ts.map