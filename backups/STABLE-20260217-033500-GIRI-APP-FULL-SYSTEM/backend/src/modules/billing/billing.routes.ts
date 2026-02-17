/**
 * Billing Routes
 * Montage des endpoints de paiement Stripe
 */

import express, { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import {
  createCheckout,
  createPortal,
  getBillingStatus,
  getPlans,
  getStripeStatus,
  handleWebhook
} from './billing.controller.js';

const router = Router();

// ============================================
// PUBLIC ROUTES (pas d'auth requise)
// ============================================

// Liste des plans disponibles
router.get('/plans', getPlans);

// Statut Stripe (pour dashboard)
router.get('/stripe-status', getStripeStatus);

// Webhook Stripe — DOIT utiliser express.raw() pour la vérification de signature
// ⚠️ NE PAS mettre authMiddleware ici — Stripe appelle sans token
router.post(
  '/webhooks',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// ============================================
// AUTHENTICATED ROUTES (auth requise)
// ============================================

// Statut d'abonnement de l'utilisateur
router.get('/status', authMiddleware, getBillingStatus);

// Créer une session Checkout
router.post('/checkout', authMiddleware, createCheckout);

// Accéder au Customer Portal
router.post('/portal', authMiddleware, createPortal);

export { router as billingRoutes };
