/**
 * Module Comptabilite - Service Stripe
 * @description Integration Stripe pour paiements en ligne des factures
 * Checkout Sessions, Payment Intents, Webhooks, Payment Links
 */
import { Pool } from 'pg';
export declare const initStripeService: (dbPool: Pool, stripeSecretKey?: string) => void;
export declare const isStripeEnabled: () => boolean;
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
export declare const createCheckoutSession: (options: CreateCheckoutOptions) => Promise<{
    sessionId: string;
    url: string;
    paymentLinkToken: string;
}>;
/**
 * Recupere les infos d'un lien de paiement par token (pas besoin d'auth)
 */
export declare const getPaymentLinkInfo: (token: string) => Promise<{
    invoice: {
        id: string;
        reference: string;
        fournisseur: string;
        montant_ttc: number;
        currency: string;
        status: string;
    };
    paymentLink: {
        status: string;
        expires_at: string;
    };
} | null>;
/**
 * Cree une checkout session depuis un lien de paiement public
 */
export declare const createCheckoutFromLink: (token: string, successUrl: string, cancelUrl: string) => Promise<{
    sessionId: string;
    url: string;
} | null>;
/**
 * Traite les evenements Stripe webhook
 */
export declare const handleWebhookEvent: (payload: string | Buffer, signature: string, webhookSecret: string) => Promise<{
    received: boolean;
    event_type: string;
}>;
/**
 * Liste les transactions de paiement pour une facture
 */
export declare const getInvoicePayments: (workspaceId: string, invoiceId: string) => Promise<unknown[]>;
/**
 * Liste toutes les transactions de paiement du workspace
 */
export declare const listPaymentTransactions: (workspaceId: string, filters: {
    status?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: unknown[];
    total: number;
}>;
/**
 * Cree un remboursement Stripe
 */
export declare const createRefund: (workspaceId: string, transactionId: string, amount?: number, reason?: string) => Promise<unknown>;
//# sourceMappingURL=accounting.stripe.d.ts.map