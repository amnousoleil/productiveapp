/**
 * Module Comptabilite - Controller Stripe
 * @description Handlers Express pour les endpoints Stripe
 */
import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    invoiceId?: string;
}>;
/**
 * POST /payments/checkout - Creer une session Stripe Checkout
 */
export declare const createCheckoutSession: (req: Req, res: Response) => Promise<void>;
/**
 * GET /payments/transactions - Liste des transactions
 */
export declare const listPaymentTransactions: (req: Req, res: Response) => Promise<void>;
/**
 * GET /payments/invoices/:invoiceId - Transactions d'une facture
 */
export declare const getInvoicePayments: (req: Req, res: Response) => Promise<void>;
/**
 * POST /payments/refund - Rembourser
 */
export declare const createRefund: (req: Req, res: Response) => Promise<void>;
/**
 * GET /payments/status - Verifier si Stripe est configure
 */
export declare const getStripeStatus: (_req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=accounting.controller.stripe.d.ts.map