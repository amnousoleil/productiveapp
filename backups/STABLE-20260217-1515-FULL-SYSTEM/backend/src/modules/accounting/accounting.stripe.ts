/**
 * Module Comptabilite - Service Stripe
 * @description Integration Stripe pour paiements en ligne des factures
 * Checkout Sessions, Payment Intents, Webhooks, Payment Links
 */

import { Pool } from 'pg';
import Stripe from 'stripe';
import { randomBytes } from 'crypto';

let pool: Pool;
let stripe: Stripe | null = null;

export const initStripeService = (dbPool: Pool, stripeSecretKey?: string): void => {
  pool = dbPool;
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-01-28.clover' as any });
    console.log('[Stripe] Service initialized');
  } else {
    console.warn('[Stripe] No API key provided - payment features disabled');
  }
};

export const isStripeEnabled = (): boolean => stripe !== null;

// ============================================
// CHECKOUT SESSION
// ============================================

export interface CreateCheckoutOptions {
  invoiceId: string;
  workspaceId: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Cree une session de paiement Stripe Checkout
 */
export const createCheckoutSession = async (
  options: CreateCheckoutOptions
): Promise<{ sessionId: string; url: string; paymentLinkToken: string }> => {
  if (!stripe) throw new Error('Stripe non configure');

  const token = randomBytes(32).toString('hex');

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'sepa_debit'],
    mode: 'payment',
    customer_email: options.customerEmail || undefined,
    line_items: [{
      price_data: {
        currency: (options.currency || 'eur').toLowerCase(),
        product_data: {
          name: options.description || `Facture ${options.invoiceId.substring(0, 8)}`,
          description: options.customerName ? `Client: ${options.customerName}` : undefined,
        },
        unit_amount: Math.round(options.amount * 100), // Stripe veut des centimes
      },
      quantity: 1,
    }],
    metadata: {
      invoice_id: options.invoiceId,
      workspace_id: options.workspaceId,
      payment_link_token: token,
    },
    success_url: options.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: options.cancelUrl,
  });

  // Sauvegarder le payment link
  await pool.query(
    `INSERT INTO payment_links (workspace_id, invoice_id, token, stripe_checkout_session_id, amount, currency, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '7 days')`,
    [options.workspaceId, options.invoiceId, token, session.id, options.amount, options.currency || 'EUR']
  );

  // Sauvegarder la transaction
  await pool.query(
    `INSERT INTO payment_transactions (workspace_id, invoice_id, stripe_checkout_session_id, amount, currency, status, customer_email, customer_name, description)
     VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8)`,
    [options.workspaceId, options.invoiceId, session.id, options.amount, options.currency || 'EUR',
     options.customerEmail || null, options.customerName || null, options.description || null]
  );

  // Mettre a jour la facture
  await pool.query(
    `UPDATE invoices SET payment_link_token = $1 WHERE id = $2 AND workspace_id = $3`,
    [token, options.invoiceId, options.workspaceId]
  );

  return {
    sessionId: session.id,
    url: session.url!,
    paymentLinkToken: token,
  };
};

// ============================================
// PAYMENT LINK PUBLIC
// ============================================

/**
 * Recupere les infos d'un lien de paiement par token (pas besoin d'auth)
 */
export const getPaymentLinkInfo = async (token: string): Promise<{
  invoice: { id: string; reference: string; fournisseur: string; montant_ttc: number; currency: string; status: string };
  paymentLink: { status: string; expires_at: string };
} | null> => {
  const result = await pool.query(
    `SELECT pl.*, i.id as invoice_id, i.reference, i.fournisseur, i.montant_ttc, i.currency, i.status as invoice_status
     FROM payment_links pl
     JOIN invoices i ON pl.invoice_id = i.id
     WHERE pl.token = $1`,
    [token]
  );

  if (!result.rows[0]) return null;

  const row = result.rows[0];
  return {
    invoice: {
      id: row.invoice_id,
      reference: row.reference,
      fournisseur: row.fournisseur,
      montant_ttc: parseFloat(row.montant_ttc),
      currency: row.currency || 'EUR',
      status: row.invoice_status,
    },
    paymentLink: {
      status: row.status,
      expires_at: row.expires_at,
    },
  };
};

/**
 * Cree une checkout session depuis un lien de paiement public
 */
export const createCheckoutFromLink = async (
  token: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string } | null> => {
  if (!stripe) throw new Error('Stripe non configure');

  const linkResult = await pool.query(
    `SELECT pl.*, i.montant_ttc, i.currency, i.fournisseur, i.reference, i.client_email, i.client_name
     FROM payment_links pl
     JOIN invoices i ON pl.invoice_id = i.id
     WHERE pl.token = $1 AND pl.status = 'active' AND (pl.expires_at IS NULL OR pl.expires_at > NOW())`,
    [token]
  );

  if (!linkResult.rows[0]) return null;

  const link = linkResult.rows[0];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'sepa_debit'],
    mode: 'payment',
    customer_email: link.client_email || undefined,
    line_items: [{
      price_data: {
        currency: (link.currency || 'eur').toLowerCase(),
        product_data: {
          name: `Facture ${link.reference || link.invoice_id.substring(0, 8)}`,
          description: `Paiement a ${link.fournisseur}`,
        },
        unit_amount: Math.round(parseFloat(link.montant_ttc) * 100),
      },
      quantity: 1,
    }],
    metadata: {
      invoice_id: link.invoice_id,
      workspace_id: link.workspace_id,
      payment_link_token: token,
    },
    success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: cancelUrl,
  });

  // Mettre a jour la transaction
  await pool.query(
    `INSERT INTO payment_transactions (workspace_id, invoice_id, stripe_checkout_session_id, amount, currency, status, customer_email, customer_name)
     VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)`,
    [link.workspace_id, link.invoice_id, session.id, link.montant_ttc, link.currency || 'EUR',
     link.client_email || null, link.client_name || null]
  );

  return { sessionId: session.id, url: session.url! };
};

// ============================================
// WEBHOOK HANDLER
// ============================================

/**
 * Traite les evenements Stripe webhook
 */
export const handleWebhookEvent = async (
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Promise<{ received: boolean; event_type: string }> => {
  if (!stripe) throw new Error('Stripe non configure');

  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutExpired(session);
      break;
    }
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSucceeded(pi);
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(pi);
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      await handleRefund(charge);
      break;
    }
  }

  return { received: true, event_type: event.type };
};

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const invoiceId = session.metadata?.invoice_id;
  const workspaceId = session.metadata?.workspace_id;
  const token = session.metadata?.payment_link_token;

  if (!invoiceId || !workspaceId) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Mettre a jour la transaction
    await client.query(
      `UPDATE payment_transactions
       SET status = 'succeeded',
           stripe_payment_intent_id = $1,
           payment_method = $2,
           receipt_url = $3,
           paid_at = NOW(),
           updated_at = NOW()
       WHERE stripe_checkout_session_id = $4`,
      [session.payment_intent, session.payment_method_types?.[0] || 'card',
       null, session.id]
    );

    // Marquer la facture comme payee
    await client.query(
      `UPDATE invoices
       SET status = 'paid',
           paid_at = NOW(),
           payment_method = 'stripe',
           stripe_payment_intent_id = $1,
           updated_at = NOW()
       WHERE id = $2 AND workspace_id = $3`,
      [session.payment_intent, invoiceId, workspaceId]
    );

    // Desactiver le lien de paiement
    if (token) {
      await client.query(
        `UPDATE payment_links SET status = 'used', used_at = NOW() WHERE token = $1`,
        [token]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
  await pool.query(
    `UPDATE payment_transactions SET status = 'cancelled', updated_at = NOW()
     WHERE stripe_checkout_session_id = $1`,
    [session.id]
  );
}

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  await pool.query(
    `UPDATE payment_transactions
     SET status = 'succeeded', stripe_payment_intent_id = $1, paid_at = NOW(), updated_at = NOW()
     WHERE stripe_payment_intent_id = $1 OR stripe_checkout_session_id IN (
       SELECT stripe_checkout_session_id FROM payment_transactions WHERE stripe_payment_intent_id = $1
     )`,
    [pi.id]
  );
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent): Promise<void> {
  const failureMessage = pi.last_payment_error?.message || 'Paiement echoue';
  await pool.query(
    `UPDATE payment_transactions SET status = 'failed', failure_reason = $1, updated_at = NOW()
     WHERE stripe_payment_intent_id = $2`,
    [failureMessage, pi.id]
  );
}

async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const refundedAmount = (charge.amount_refunded || 0) / 100;
  const isFullRefund = charge.refunded;

  await pool.query(
    `UPDATE payment_transactions
     SET status = $1, refunded_amount = $2, updated_at = NOW()
     WHERE stripe_charge_id = $3 OR stripe_payment_intent_id = $4`,
    [isFullRefund ? 'refunded' : 'partially_refunded', refundedAmount,
     charge.id, charge.payment_intent]
  );
}

// ============================================
// HISTORIQUE DE PAIEMENT
// ============================================

/**
 * Liste les transactions de paiement pour une facture
 */
export const getInvoicePayments = async (
  workspaceId: string,
  invoiceId: string
): Promise<unknown[]> => {
  const result = await pool.query(
    `SELECT * FROM payment_transactions
     WHERE workspace_id = $1 AND invoice_id = $2
     ORDER BY created_at DESC`,
    [workspaceId, invoiceId]
  );
  return result.rows;
};

/**
 * Liste toutes les transactions de paiement du workspace
 */
export const listPaymentTransactions = async (
  workspaceId: string,
  filters: { status?: string; page?: number; limit?: number }
): Promise<{ data: unknown[]; total: number }> => {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE pt.workspace_id = $1';
  const params: (string | number)[] = [workspaceId];
  let paramIndex = 2;

  if (filters.status) {
    whereClause += ` AND pt.status = $${paramIndex++}`;
    params.push(filters.status);
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM payment_transactions pt ${whereClause}`, params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const result = await pool.query(
    `SELECT pt.*, i.reference as invoice_reference, i.fournisseur
     FROM payment_transactions pt
     LEFT JOIN invoices i ON pt.invoice_id = i.id
     ${whereClause}
     ORDER BY pt.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    params
  );

  return { data: result.rows, total };
};

/**
 * Cree un remboursement Stripe
 */
export const createRefund = async (
  workspaceId: string,
  transactionId: string,
  amount?: number,
  reason?: string
): Promise<unknown> => {
  if (!stripe) throw new Error('Stripe non configure');

  const txResult = await pool.query(
    `SELECT * FROM payment_transactions WHERE id = $1 AND workspace_id = $2 AND status = 'succeeded'`,
    [transactionId, workspaceId]
  );

  if (!txResult.rows[0]) throw new Error('Transaction non trouvee ou non remboursable');

  const tx = txResult.rows[0];
  const refundAmount = amount ? Math.round(amount * 100) : undefined;

  const refund = await stripe.refunds.create({
    payment_intent: tx.stripe_payment_intent_id,
    amount: refundAmount,
    reason: (reason as Stripe.RefundCreateParams['reason']) || 'requested_by_customer',
  });

  const refundedTotal = (refund.amount || 0) / 100;
  const isFullRefund = !amount || amount >= parseFloat(tx.amount);

  await pool.query(
    `UPDATE payment_transactions
     SET status = $1, refunded_amount = refunded_amount + $2, updated_at = NOW()
     WHERE id = $3`,
    [isFullRefund ? 'refunded' : 'partially_refunded', refundedTotal, transactionId]
  );

  // Si remboursement total, remettre la facture en statut valide
  if (isFullRefund && tx.invoice_id) {
    await pool.query(
      `UPDATE invoices SET status = 'validated', paid_at = NULL, updated_at = NOW() WHERE id = $1`,
      [tx.invoice_id]
    );
  }

  return refund;
};
