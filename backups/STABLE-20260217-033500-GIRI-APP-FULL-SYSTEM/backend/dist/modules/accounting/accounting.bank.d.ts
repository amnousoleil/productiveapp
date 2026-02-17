/**
 * Module Comptabilité - Service Rapprochement Bancaire
 * @description Import de transactions bancaires, rapprochement manuel et automatique
 * avec les factures, statistiques de réconciliation
 */
import { Pool } from 'pg';
import { BankTransaction, ImportBankTransactionDTO, BankTransactionFilters, ReconciliationSummary, AutoMatchResult, PaginatedResponse } from './accounting.types.js';
export declare const initBankService: (dbPool: Pool) => void;
/**
 * Importe un lot de transactions bancaires (depuis un CSV parsé)
 * Chaque transaction reçoit un batch ID commun pour le suivi
 */
export declare const importBankTransactions: (workspaceId: string, transactions: ImportBankTransactionDTO[]) => Promise<{
    imported: number;
    batch_id: string;
}>;
/**
 * Liste les transactions bancaires avec filtres et pagination
 */
export declare const listBankTransactions: (workspaceId: string, filters: BankTransactionFilters) => Promise<PaginatedResponse<BankTransaction>>;
/**
 * Associe manuellement une transaction bancaire à une facture
 */
export declare const matchTransaction: (workspaceId: string, transactionId: string, invoiceId: string) => Promise<BankTransaction | null>;
/**
 * Supprime l'association d'une transaction avec une facture
 */
export declare const unmatchTransaction: (workspaceId: string, transactionId: string) => Promise<BankTransaction | null>;
/**
 * Tente un rapprochement automatique basé sur:
 * - Correspondance exacte du montant
 * - Proximité de date (±5 jours)
 * - Correspondance de référence (si disponible)
 * Retourne les correspondances avec score de confiance
 */
export declare const autoMatchTransactions: (workspaceId: string) => Promise<AutoMatchResult[]>;
/**
 * Récupère toutes les transactions non rapprochées
 */
export declare const getUnreconciledTransactions: (workspaceId: string) => Promise<BankTransaction[]>;
/**
 * Retourne un résumé des statistiques de réconciliation
 */
export declare const getReconciliationSummary: (workspaceId: string) => Promise<ReconciliationSummary>;
//# sourceMappingURL=accounting.bank.d.ts.map