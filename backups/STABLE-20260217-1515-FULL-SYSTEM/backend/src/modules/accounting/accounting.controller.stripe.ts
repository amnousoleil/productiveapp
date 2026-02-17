/**
 * Module Comptabilite - Controller Stripe
 * @description Handlers Express pour les endpoints Stripe
 */

import { Request, Response } from 'express';
import * as stripeService from './accounting.stripe.js';
import pool from './pool.js';

type Req = Request<{ workspaceId: string; invoiceId?: string }>;

/**
 * POST /payments/checkout - Creer une session Stripe Checkout
 */
export const createCheckoutSession = async (req: Req, res: Response): Promise<void> => {
  try {
    if (!stripeService.isStripeEnabled()) {
      res.status(503).json({ error: 'Stripe non configure. Ajoutez STRIPE_SECRET_KEY dans .env' });
      return;
    }

    const { workspaceId } = req.params;
    const { invoice_id, success_url, cancel_url } = req.body;

    if (!invoice_id || !success_url || !cancel_url) {
      res.status(400).json({ error: 'Champs requis: invoice_id, success_url, cancel_url' });
      return;
    }

    // Recuperer la facture
    const invoiceResult = await pool.query(
      `SELECT i.*, co.email as contact_email, co.name as contact_name
       FROM invoices i
       LEFT JOIN contacts co ON i.contact_id = co.id
       WHERE i.id = $1 AND i.workspace_id = $2`,
      [invoice_id, workspaceId]
    );

    if (!invoiceResult.rows[0]) {
      res.status(404).json({ error: 'Facture non trouvee' });
      return;
    }

    const invoice = invoiceResult.rows[0];

    if (invoice.status === 'paid') {
      res.status(400).json({ error: 'Cette facture est deja payee' });
      return;
    }

    const result = await stripeService.createCheckoutSession({
      invoiceId: invoice_id,
      workspaceId,
      amount: parseFloat(invoice.montant_ttc),
      currency: invoice.currency || 'EUR',
      customerEmail: invoice.contact_email || invoice.client_email || undefined,
      customerName: invoice.contact_name || invoice.client_name || undefined,
      description: `Facture ${invoice.reference || invoice.id.substring(0, 8)} - ${invoice.fournisseur}`,
      successUrl: success_url,
      cancelUrl: cancel_url,
    });

    res.json(result);
  } catch (error) {
    console.error('Erreur creation checkout:', error);
    res.status(500).json({ error: 'Erreur lors de la creation de la session de paiement' });
  }
};

/**
 * GET /payments/transactions - Liste des transactions
 */
export const listPaymentTransactions = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const result = await stripeService.listPaymentTransactions(workspaceId, {
      status: req.query.status as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    });
    res.json(result);
  } catch (error) {
    console.error('Erreur liste transactions:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des transactions' });
  }
};

/**
 * GET /payments/invoices/:invoiceId - Transactions d'une facture
 */
export const getInvoicePayments = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, invoiceId } = req.params;
    const payments = await stripeService.getInvoicePayments(workspaceId, invoiceId!);
    res.json({ payments });
  } catch (error) {
    console.error('Erreur paiements facture:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des paiements' });
  }
};

/**
 * POST /payments/refund - Rembourser
 */
export const createRefund = async (req: Req, res: Response): Promise<void> => {
  try {
    if (!stripeService.isStripeEnabled()) {
      res.status(503).json({ error: 'Stripe non configure' });
      return;
    }

    const { workspaceId } = req.params;
    const { transaction_id, amount, reason } = req.body;

    if (!transaction_id) {
      res.status(400).json({ error: 'transaction_id requis' });
      return;
    }

    const refund = await stripeService.createRefund(workspaceId, transaction_id, amount, reason);
    res.json({ refund });
  } catch (error) {
    console.error('Erreur remboursement:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur lors du remboursement' });
  }
};

/**
 * GET /payments/status - Verifier si Stripe est configure
 */
export const getStripeStatus = async (_req: Req, res: Response): Promise<void> => {
  res.json({
    enabled: stripeService.isStripeEnabled(),
    methods: stripeService.isStripeEnabled() ? ['card', 'sepa_debit'] : [],
  });
};
