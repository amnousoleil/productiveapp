/**
 * Module Comptabilite - Routes API v2.0
 * @description Routes Express pour le module comptabilite complet
 * Base: /api/v1/accounting/workspace/:workspaceId/
 *
 * Endpoints (60+):
 * - Invoices: CRUD + scan + validate + reprocess + mark-paid + send + remind + batch-scan + overdue
 * - Categories: list + create
 * - Analytics: dashboard + monthly + tva
 * - Contacts: CRUD + invoices
 * - Documents: create (quote/credit_note) + convert
 * - Expense Reports: CRUD + items + scan + submit + approve + reject + reimburse
 * - Departments: CRUD
 * - Budgets: overview + set + variance + department detail
 * - Bank Reconciliation: import + list + match + auto-match + unreconciled
 * - Alerts: list + read + dismiss + generate
 * - Company Settings: get + update + logo
 * - Financial Statements: balance-sheet + profit-loss + cash-flow
 * - AI: predict-cashflow + categorize + detect-anomalies
 * - Exports: generic + FEC + TVA declaration
 * - Init: seed default categories
 */

import { Router } from 'express';
import multer from 'multer';
import * as invoiceCtrl from './accounting.controller.js';
import * as analyticsCtrl from './accounting.controller.analytics.js';
import * as contactsCtrl from './accounting.controller.contacts.js';
import * as expensesCtrl from './accounting.controller.expenses.js';
import * as bankCtrl from './accounting.controller.bank.js';
// v3.0 controllers
import * as stripeCtrl from './accounting.controller.stripe.js';
import * as recurringCtrl from './accounting.controller.recurring.js';

const router = Router({ mergeParams: true });

// ============================================
// MULTER CONFIGURATION
// ============================================

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads/invoices');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = file.originalname.split('.').pop();
    cb(null, `invoice-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporte'));
    }
  }
});

// Multer pour CSV (bank import)
const csvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads/bank');
  },
  filename: (_req, _file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `bank-${uniqueSuffix}.csv`);
  }
});

const csvUpload = multer({
  storage: csvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers CSV sont acceptes'));
    }
  }
});

// Multer pour logo
const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads/logos');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = file.originalname.split('.').pop();
    cb(null, `logo-${uniqueSuffix}.${ext}`);
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type d\'image non supporte pour le logo'));
    }
  }
});

// ============================================
// ROUTES FACTURES (existing + enhanced)
// ============================================

/** POST /invoices - Creer une facture manuellement */
router.post('/invoices', invoiceCtrl.createInvoice);

/** POST /invoices/scan - Upload et extraction IA d'une facture */
router.post('/invoices/scan', upload.single('image'), invoiceCtrl.scanInvoice);

/** POST /invoices/batch-scan - Scanner plusieurs factures en lot */
router.post('/invoices/batch-scan', upload.array('images', 20), bankCtrl.batchScanInvoices);

/** GET /invoices/overdue - Liste des factures en retard */
router.get('/invoices/overdue', bankCtrl.getOverdueInvoices);

/** GET /invoices - Liste des factures avec filtres */
router.get('/invoices', invoiceCtrl.listInvoices);

/** GET /invoices/:id - Detail d'une facture */
router.get('/invoices/:id', invoiceCtrl.getInvoice);

/** PUT /invoices/:id - Modifier une facture */
router.put('/invoices/:id', invoiceCtrl.updateInvoice);

/** DELETE /invoices/:id - Supprimer une facture */
router.delete('/invoices/:id', invoiceCtrl.deleteInvoice);

/** POST /invoices/:id/validate - Valider une facture */
router.post('/invoices/:id/validate', invoiceCtrl.validateInvoice);

/** POST /invoices/:id/reprocess - Relancer l'extraction IA */
router.post('/invoices/:id/reprocess', invoiceCtrl.reprocessInvoice);

/** POST /invoices/:id/mark-paid - Marquer une facture comme payee */
router.post('/invoices/:id/mark-paid', bankCtrl.markInvoicePaid);

/** POST /invoices/:id/send - Envoyer une facture par email */
router.post('/invoices/:id/send', bankCtrl.sendInvoice);

/** POST /invoices/:id/remind - Envoyer un rappel */
router.post('/invoices/:id/remind', bankCtrl.sendReminder);

// ============================================
// ROUTES CATEGORIES
// ============================================

/** GET /categories - Liste des categories */
router.get('/categories', analyticsCtrl.listCategories);

/** POST /categories - Creer une categorie custom */
router.post('/categories', analyticsCtrl.createCategory);

// ============================================
// ROUTES ANALYTICS
// ============================================

/** GET /dashboard - Stats globales (alias direct) */
router.get('/dashboard', analyticsCtrl.getDashboard);

/** GET /analytics/dashboard - Stats globales */
router.get('/analytics/dashboard', analyticsCtrl.getDashboard);

/** GET /analytics/monthly - Detail mensuel */
router.get('/analytics/monthly', analyticsCtrl.getMonthlyAnalytics);

/** GET /analytics/tva - Resume TVA par taux */
router.get('/analytics/tva', analyticsCtrl.getTVASummary);

// ============================================
// ROUTES COMPANY SETTINGS
// ============================================

/** GET /settings - Recuperer les parametres societe */
router.get('/settings', bankCtrl.getCompanySettings);

/** PUT /settings - Modifier les parametres societe */
router.put('/settings', bankCtrl.updateCompanySettings);

/** POST /settings/logo - Upload du logo */
router.post('/settings/logo', logoUpload.single('logo'), bankCtrl.uploadLogo);

// ============================================
// ROUTES CONTACTS
// ============================================

/** GET /contacts - Liste des contacts avec filtres */
router.get('/contacts', contactsCtrl.listContacts);

/** POST /contacts - Creer un contact */
router.post('/contacts', contactsCtrl.createContact);

/** GET /contacts/:id - Detail d'un contact */
router.get('/contacts/:id', contactsCtrl.getContact);

/** PUT /contacts/:id - Modifier un contact */
router.put('/contacts/:id', contactsCtrl.updateContact);

/** DELETE /contacts/:id - Desactiver un contact */
router.delete('/contacts/:id', contactsCtrl.deleteContact);

/** GET /contacts/:id/invoices - Factures d'un contact */
router.get('/contacts/:id/invoices', contactsCtrl.getContactInvoices);

// ============================================
// ROUTES DOCUMENTS (quotes, credit notes)
// ============================================

/** POST /documents - Creer un document (devis, avoir, proforma) */
router.post('/documents', bankCtrl.createDocument);

/** POST /documents/:id/convert - Convertir un devis en facture */
router.post('/documents/:id/convert', bankCtrl.convertQuoteToInvoice);

// ============================================
// ROUTES EXPENSE REPORTS
// ============================================

/** GET /expense-reports - Liste des notes de frais */
router.get('/expense-reports', expensesCtrl.listExpenseReports);

/** POST /expense-reports - Creer une note de frais */
router.post('/expense-reports', expensesCtrl.createExpenseReport);

/** GET /expense-reports/:id - Detail d'une note de frais */
router.get('/expense-reports/:id', expensesCtrl.getExpenseReport);

/** PUT /expense-reports/:id - Modifier une note de frais */
router.put('/expense-reports/:id', expensesCtrl.updateExpenseReport);

/** POST /expense-reports/:id/items - Ajouter un item */
router.post('/expense-reports/:id/items', expensesCtrl.addExpenseItem);

/** POST /expense-reports/:id/items/:itemId/scan - Scanner un justificatif */
router.post('/expense-reports/:id/items/:itemId/scan', upload.single('receipt'), expensesCtrl.scanExpenseReceipt);

/** POST /expense-reports/:id/submit - Soumettre pour validation */
router.post('/expense-reports/:id/submit', expensesCtrl.submitExpenseReport);

/** POST /expense-reports/:id/approve - Approuver */
router.post('/expense-reports/:id/approve', expensesCtrl.approveExpenseReport);

/** POST /expense-reports/:id/reject - Rejeter */
router.post('/expense-reports/:id/reject', expensesCtrl.rejectExpenseReport);

/** POST /expense-reports/:id/reimburse - Marquer comme rembourse */
router.post('/expense-reports/:id/reimburse', expensesCtrl.reimburseExpenseReport);

// ============================================
// ROUTES DEPARTMENTS & BUDGETS
// ============================================

/** GET /departments - Liste des departements */
router.get('/departments', bankCtrl.listDepartments);

/** POST /departments - Creer un departement */
router.post('/departments', bankCtrl.createDepartment);

/** PUT /departments/:id - Modifier un departement */
router.put('/departments/:id', bankCtrl.updateDepartment);

/** DELETE /departments/:id - Supprimer un departement */
router.delete('/departments/:id', bankCtrl.deleteDepartment);

/** GET /budgets - Vue d'ensemble des budgets */
router.get('/budgets', bankCtrl.getBudgets);

/** POST /budgets - Creer/modifier une ligne de budget */
router.post('/budgets', bankCtrl.setBudget);

/** GET /budgets/variance - Ecarts budgetaires */
router.get('/budgets/variance', bankCtrl.getBudgetVariance);

/** GET /budgets/:departmentId - Budget detaille d'un departement */
router.get('/budgets/:departmentId', bankCtrl.getDepartmentBudget);

// ============================================
// ROUTES BANK RECONCILIATION
// ============================================

/** POST /bank/import - Importer des transactions bancaires (CSV) */
router.post('/bank/import', csvUpload.single('file'), bankCtrl.importBankTransactions);

/** GET /bank/transactions - Liste des transactions bancaires */
router.get('/bank/transactions', bankCtrl.listBankTransactions);

/** POST /bank/match/:txId/:invoiceId - Rapprochement manuel */
router.post('/bank/match/:txId/:invoiceId', bankCtrl.matchBankTransaction);

/** POST /bank/auto-match - Rapprochement automatique */
router.post('/bank/auto-match', bankCtrl.autoMatchBankTransactions);

/** GET /bank/unreconciled - Transactions non rapprochees */
router.get('/bank/unreconciled', bankCtrl.getUnreconciledTransactions);

// ============================================
// ROUTES ALERTS
// ============================================

/** GET /alerts - Liste des alertes comptables */
router.get('/alerts', bankCtrl.listAlerts);

/** PUT /alerts/:id/read - Marquer une alerte comme lue */
router.put('/alerts/:id/read', bankCtrl.markAlertRead);

/** PUT /alerts/:id/dismiss - Rejeter une alerte */
router.put('/alerts/:id/dismiss', bankCtrl.dismissAlert);

/** POST /alerts/generate - Generer des alertes automatiques */
router.post('/alerts/generate', bankCtrl.generateAlerts);

// ============================================
// ROUTES FINANCIAL STATEMENTS
// ============================================

/** GET /statements/balance-sheet - Bilan comptable */
router.get('/statements/balance-sheet', bankCtrl.getBalanceSheet);

/** GET /statements/profit-loss - Compte de resultat */
router.get('/statements/profit-loss', bankCtrl.getProfitLoss);

/** GET /statements/cash-flow - Flux de tresorerie */
router.get('/statements/cash-flow', bankCtrl.getCashFlowStatement);

// ============================================
// ROUTES AI
// ============================================

/** POST /ai/predict-cashflow - Prediction de tresorerie */
router.post('/ai/predict-cashflow', bankCtrl.predictCashFlow);

/** POST /ai/categorize - Suggestion de categorie par IA */
router.post('/ai/categorize', bankCtrl.aiCategorize);

/** POST /ai/detect-anomalies - Detection d'anomalies */
router.post('/ai/detect-anomalies', bankCtrl.detectAnomalies);

// ============================================
// ROUTES EXPORTS
// ============================================

/** POST /export - Export generique (CSV, PDF, Excel) */
router.post('/export', analyticsCtrl.generateExport);

/** POST /export/fec - Fichier des Ecritures Comptables */
router.post('/export/fec', bankCtrl.exportFEC);

/** POST /export/tva-declaration - Declaration de TVA */
router.post('/export/tva-declaration', bankCtrl.exportTVADeclaration);

// ============================================
// ROUTES STRIPE PAYMENT v3.0
// ============================================

/** POST /payments/checkout - Créer session Stripe Checkout */
router.post('/payments/checkout', stripeCtrl.createCheckoutSession);

/** GET /payments/transactions - Liste des paiements */
router.get('/payments/transactions', stripeCtrl.listPaymentTransactions);

/** GET /payments/invoices/:invoiceId - Paiements d'une facture */
router.get('/payments/invoices/:invoiceId', stripeCtrl.getInvoicePayments);

/** POST /payments/refund - Créer un remboursement */
router.post('/payments/refund', stripeCtrl.createRefund);

/** GET /payments/status - Statut Stripe */
router.get('/payments/status', stripeCtrl.getStripeStatus);

// ============================================
// ROUTES RECURRING INVOICES v3.0
// ============================================

/** GET /recurring - Liste des factures récurrentes */
router.get('/recurring', recurringCtrl.listRecurring);

/** POST /recurring - Créer une facture récurrente */
router.post('/recurring', recurringCtrl.createRecurring);

/** GET /recurring/:id - Détail */
router.get('/recurring/:id', recurringCtrl.getRecurring);

/** PUT /recurring/:id - Modifier */
router.put('/recurring/:id', recurringCtrl.updateRecurring);

/** DELETE /recurring/:id - Supprimer */
router.delete('/recurring/:id', recurringCtrl.deleteRecurring);

/** POST /recurring/:id/pause - Mettre en pause */
router.post('/recurring/:id/pause', recurringCtrl.pauseRecurring);

/** POST /recurring/:id/resume - Reprendre */
router.post('/recurring/:id/resume', recurringCtrl.resumeRecurring);

/** POST /recurring/process - Traitement manuel des récurrences */
router.post('/recurring/process', recurringCtrl.processRecurring);

// ============================================
// ROUTE INITIALISATION
// ============================================

/** POST /init - Initialiser le workspace avec les categories par defaut */
router.post('/init', analyticsCtrl.initWorkspace);

// ============================================
// EXPORTS
// ============================================

export default router;

export const createAccountingRouter = (): Router => {
  return router;
};

export const ACCOUNTING_BASE_PATH = '/api/v1/accounting/workspace/:workspaceId';
