"use strict";
/**
 * Module Comptabilite - Controller Stripe
 * @description Handlers Express pour les endpoints Stripe
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripeStatus = exports.createRefund = exports.getInvoicePayments = exports.listPaymentTransactions = exports.createCheckoutSession = void 0;
const stripeService = __importStar(require("./accounting.stripe.js"));
const pool_js_1 = __importDefault(require("./pool.js"));
/**
 * POST /payments/checkout - Creer une session Stripe Checkout
 */
const createCheckoutSession = async (req, res) => {
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
        const invoiceResult = await pool_js_1.default.query(`SELECT i.*, co.email as contact_email, co.name as contact_name
       FROM invoices i
       LEFT JOIN contacts co ON i.contact_id = co.id
       WHERE i.id = $1 AND i.workspace_id = $2`, [invoice_id, workspaceId]);
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
    }
    catch (error) {
        console.error('Erreur creation checkout:', error);
        res.status(500).json({ error: 'Erreur lors de la creation de la session de paiement' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
/**
 * GET /payments/transactions - Liste des transactions
 */
const listPaymentTransactions = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const result = await stripeService.listPaymentTransactions(workspaceId, {
            status: req.query.status,
            page: req.query.page ? parseInt(req.query.page, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Erreur liste transactions:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des transactions' });
    }
};
exports.listPaymentTransactions = listPaymentTransactions;
/**
 * GET /payments/invoices/:invoiceId - Transactions d'une facture
 */
const getInvoicePayments = async (req, res) => {
    try {
        const { workspaceId, invoiceId } = req.params;
        const payments = await stripeService.getInvoicePayments(workspaceId, invoiceId);
        res.json({ payments });
    }
    catch (error) {
        console.error('Erreur paiements facture:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des paiements' });
    }
};
exports.getInvoicePayments = getInvoicePayments;
/**
 * POST /payments/refund - Rembourser
 */
const createRefund = async (req, res) => {
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
    }
    catch (error) {
        console.error('Erreur remboursement:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur lors du remboursement' });
    }
};
exports.createRefund = createRefund;
/**
 * GET /payments/status - Verifier si Stripe est configure
 */
const getStripeStatus = async (_req, res) => {
    res.json({
        enabled: stripeService.isStripeEnabled(),
        methods: stripeService.isStripeEnabled() ? ['card', 'sepa_debit'] : [],
    });
};
exports.getStripeStatus = getStripeStatus;
//# sourceMappingURL=accounting.controller.stripe.js.map