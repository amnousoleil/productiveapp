/**
 * Module Comptabilite - Controller Bank, Departments, Budgets, Alerts, Settings, Statements, AI, Exports
 * @description Handlers Express pour les endpoints v2.0 etendus
 */
import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
    txId?: string;
    invoiceId?: string;
    departmentId?: string;
    itemId?: string;
}>;
/**
 * POST /bank/import
 * Importer des transactions bancaires depuis un fichier CSV
 */
export declare const importBankTransactions: (req: Req, res: Response) => Promise<void>;
/**
 * GET /bank/transactions
 * Liste des transactions bancaires avec filtres
 */
export declare const listBankTransactions: (req: Req, res: Response) => Promise<void>;
/**
 * POST /bank/match/:txId/:invoiceId
 * Rapprocher manuellement une transaction avec une facture
 */
export declare const matchBankTransaction: (req: Req, res: Response) => Promise<void>;
/**
 * POST /bank/auto-match
 * Rapprochement automatique des transactions non rapprochees
 */
export declare const autoMatchBankTransactions: (req: Req, res: Response) => Promise<void>;
/**
 * GET /bank/unreconciled
 * Transactions non rapprochees avec resume
 */
export declare const getUnreconciledTransactions: (req: Req, res: Response) => Promise<void>;
/**
 * GET /departments
 * Liste des departements
 */
export declare const listDepartments: (req: Req, res: Response) => Promise<void>;
/**
 * POST /departments
 * Creer un departement
 */
export declare const createDepartment: (req: Req, res: Response) => Promise<void>;
/**
 * PUT /departments/:id
 * Modifier un departement
 */
export declare const updateDepartment: (req: Req, res: Response) => Promise<void>;
/**
 * DELETE /departments/:id
 * Supprimer un departement (soft delete)
 */
export declare const deleteDepartment: (req: Req, res: Response) => Promise<void>;
/**
 * GET /budgets
 * Vue d'ensemble des budgets par annee
 */
export declare const getBudgets: (req: Req, res: Response) => Promise<void>;
/**
 * POST /budgets
 * Creer/mettre a jour une ligne de budget
 */
export declare const setBudget: (req: Req, res: Response) => Promise<void>;
/**
 * GET /budgets/variance
 * Ecarts budgetaires par annee et optionnellement par departement
 */
export declare const getBudgetVariance: (req: Req, res: Response) => Promise<void>;
/**
 * GET /budgets/:departmentId
 * Budget detaille d'un departement
 */
export declare const getDepartmentBudget: (req: Req, res: Response) => Promise<void>;
/**
 * GET /alerts
 * Liste des alertes comptables
 */
export declare const listAlerts: (req: Req, res: Response) => Promise<void>;
/**
 * PUT /alerts/:id/read
 * Marquer une alerte comme lue
 */
export declare const markAlertRead: (req: Req, res: Response) => Promise<void>;
/**
 * PUT /alerts/:id/dismiss
 * Rejeter/masquer une alerte
 */
export declare const dismissAlert: (req: Req, res: Response) => Promise<void>;
/**
 * POST /alerts/generate
 * Generer des alertes automatiques (factures en retard, budgets depasses, etc.)
 */
export declare const generateAlerts: (req: Req, res: Response) => Promise<void>;
/**
 * GET /settings
 * Recuperer les parametres de la societe
 */
export declare const getCompanySettings: (req: Req, res: Response) => Promise<void>;
/**
 * PUT /settings
 * Modifier les parametres de la societe
 */
export declare const updateCompanySettings: (req: Req, res: Response) => Promise<void>;
/**
 * POST /settings/logo
 * Upload du logo de la societe
 */
export declare const uploadLogo: (req: Req, res: Response) => Promise<void>;
/**
 * GET /statements/balance-sheet
 * Bilan comptable simplifie
 */
export declare const getBalanceSheet: (req: Req, res: Response) => Promise<void>;
/**
 * GET /statements/profit-loss
 * Compte de resultat
 */
export declare const getProfitLoss: (req: Req, res: Response) => Promise<void>;
/**
 * GET /statements/cash-flow
 * Tableau des flux de tresorerie
 */
export declare const getCashFlowStatement: (req: Req, res: Response) => Promise<void>;
/**
 * POST /ai/predict-cashflow
 * Prediction de tresorerie basee sur l'historique
 */
export declare const predictCashFlow: (req: Req, res: Response) => Promise<void>;
/**
 * POST /ai/categorize
 * Suggestion de categorie par IA basee sur la description et le montant
 */
export declare const aiCategorize: (req: Req, res: Response) => Promise<void>;
/**
 * POST /ai/detect-anomalies
 * Detection d'anomalies dans les donnees comptables
 */
export declare const detectAnomalies: (req: Req, res: Response) => Promise<void>;
/**
 * POST /export/fec
 * Generer le Fichier des Ecritures Comptables (format legal francais)
 */
export declare const exportFEC: (req: Req, res: Response) => Promise<void>;
/**
 * POST /export/tva-declaration
 * Generer la declaration de TVA
 */
export declare const exportTVADeclaration: (req: Req, res: Response) => Promise<void>;
/**
 * POST /invoices/:id/mark-paid
 * Marquer une facture comme payee
 */
export declare const markInvoicePaid: (req: Req, res: Response) => Promise<void>;
/**
 * POST /invoices/:id/send
 * Simuler l'envoi d'une facture par email
 */
export declare const sendInvoice: (req: Req, res: Response) => Promise<void>;
/**
 * POST /invoices/:id/remind
 * Envoyer un rappel pour une facture en retard
 */
export declare const sendReminder: (req: Req, res: Response) => Promise<void>;
/**
 * POST /invoices/batch-scan
 * Scanner plusieurs factures en lot
 */
export declare const batchScanInvoices: (req: Req, res: Response) => Promise<void>;
/**
 * GET /invoices/overdue
 * Liste des factures en retard
 */
export declare const getOverdueInvoices: (req: Req, res: Response) => Promise<void>;
/**
 * POST /documents
 * Creer un document (devis, avoir)
 */
export declare const createDocument: (req: Req, res: Response) => Promise<void>;
/**
 * POST /documents/:id/convert
 * Convertir un devis en facture
 */
export declare const convertQuoteToInvoice: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=accounting.controller.bank.d.ts.map