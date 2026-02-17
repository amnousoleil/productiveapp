/**
 * Module Comptabilite - Index v2.0
 * @description Point d'entree et exports du module comptabilite complet
 */

import { Pool } from 'pg';
import { Express } from 'express';
import accountingRouter, { ACCOUNTING_BASE_PATH } from './accounting.routes.js';
// v1.0 services
import { initAccountingService } from './accounting.service.js';
import { initAnalyticsService } from './accounting.analytics.js';
import { initAIService } from './accounting.ai.js';
import { initExportService } from './accounting.export.js';
// v2.0 services
import { initContactsService } from './accounting.contacts.js';
import { initDepartmentsService } from './accounting.departments.js';
import { initExpensesService } from './accounting.expenses.js';
import { initBankService } from './accounting.bank.js';
import { initAlertsService } from './accounting.alerts.js';
import { initFECService } from './accounting.fec.js';
import { initPredictionsService } from './accounting.predictions.js';
// v3.0 services
import { initStripeService } from './accounting.stripe.js';
import { initRecurringService } from './accounting.recurring.js';
import pool from './pool.js';

// ============================================
// TYPES EXPORTS
// ============================================

export * from './accounting.types.js';

// ============================================
// SERVICES EXPORTS
// ============================================

// v1.0 services
export * as AccountingService from './accounting.service.js';
export * as AnalyticsService from './accounting.analytics.js';
export * as AIService from './accounting.ai.js';
export * as ExportService from './accounting.export.js';

// v2.0 services
export * as ContactsService from './accounting.contacts.js';
export * as DepartmentsService from './accounting.departments.js';
export * as ExpensesService from './accounting.expenses.js';
export * as BankService from './accounting.bank.js';
export * as AlertsService from './accounting.alerts.js';
export * as FECService from './accounting.fec.js';
export * as PredictionsService from './accounting.predictions.js';

// v3.0 services
export * as StripeService from './accounting.stripe.js';
export * as RecurringService from './accounting.recurring.js';

// ============================================
// ROUTES EXPORTS
// ============================================

export { default as accountingRouter, ACCOUNTING_BASE_PATH } from './accounting.routes.js';

// ============================================
// CONFIGURATION MODULE
// ============================================

export interface AccountingModuleConfig {
  pool: Pool;
  openaiApiKey?: string;
  stripeSecretKey?: string;
  exportDirectory?: string;
}

/**
 * Initialise le module comptabilite v2.0
 * @param config Configuration du module
 */
export const initAccountingModule = (config: AccountingModuleConfig): void => {
  // v1.0 services
  initAccountingService(config.pool);
  initAnalyticsService(config.pool);
  initExportService(config.pool, config.exportDirectory);

  // v2.0 services
  initContactsService(config.pool);
  initDepartmentsService(config.pool);
  initExpensesService(config.pool);
  initBankService(config.pool);
  initAlertsService(config.pool);
  initFECService(config.pool);
  initPredictionsService(config.pool, config.openaiApiKey);

  // Initialiser le service IA si cle API fournie
  if (config.openaiApiKey) {
    initAIService(config.openaiApiKey);
  }

  // v3.0 services
  initStripeService(config.pool, config.stripeSecretKey);
  initRecurringService(config.pool);

  console.log('[Accounting Module v3.0] Initialized successfully (13 services)');
};

/**
 * Monte le module sur une application Express
 * @param app Application Express
 * @param config Configuration du module
 */
export const mountAccountingModule = (
  app: Express,
  config: AccountingModuleConfig
): void => {
  // Initialiser le module
  initAccountingModule(config);

  // Monter les routes
  app.use(ACCOUNTING_BASE_PATH, accountingRouter);

  console.log(`[Accounting Module v2.0] Routes mounted at ${ACCOUNTING_BASE_PATH}`);
};

// ============================================
// AUTO-INITIALISATION AVEC POOL LOCAL
// ============================================

// Initialiser automatiquement avec le pool local
initAccountingModule({
  pool,
  openaiApiKey: process.env.OPENAI_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  exportDirectory: process.env.EXPORT_DIR || './exports'
});

// Export du router pre-configure pour montage dans index.ts
export { default as accountingRoutes } from './accounting.routes.js';

// ============================================
// RESUME DU MODULE v2.0
// ============================================

/**
 * Module Comptabilite v2.0
 *
 * Tables SQL:
 * - accounting_categories: Categories comptables (depenses/revenus)
 * - invoices: Factures + documents (devis, avoirs)
 * - invoice_line_items: Lignes de facture
 * - accounting_periods: Periodes comptables mensuelles
 * - tva_summary: Resume TVA par periode
 * - accounting_exports: Historique des exports
 * - contacts: Clients et fournisseurs
 * - departments: Departements
 * - budget_lines: Lignes budgetaires
 * - expense_reports: Notes de frais
 * - expense_items: Items des notes de frais
 * - bank_transactions: Transactions bancaires
 * - accounting_alerts: Alertes comptables
 * - company_settings: Parametres societe
 *
 * Services (11):
 * - AccountingService: CRUD factures et categories
 * - AnalyticsService: Dashboard, analytics mensuel, TVA
 * - AIService: Extraction IA (GPT-4 Vision)
 * - ExportService: Export CSV/PDF/Excel
 * - ContactsService: CRUD contacts (clients, fournisseurs)
 * - DepartmentsService: CRUD departements
 * - ExpensesService: Notes de frais
 * - BankService: Rapprochement bancaire
 * - AlertsService: Alertes comptables
 * - FECService: Fichier des Ecritures Comptables
 * - PredictionsService: Predictions IA tresorerie
 *
 * Endpoints API (60+):
 * === INVOICES (13) ===
 * - POST   /invoices                          - Creer facture
 * - POST   /invoices/scan                     - Upload + extraction IA
 * - POST   /invoices/batch-scan               - Scan en lot
 * - GET    /invoices/overdue                   - Factures en retard
 * - GET    /invoices                           - Liste avec filtres
 * - GET    /invoices/:id                       - Detail facture
 * - PUT    /invoices/:id                       - Modifier
 * - DELETE /invoices/:id                       - Supprimer
 * - POST   /invoices/:id/validate              - Valider
 * - POST   /invoices/:id/reprocess             - Relancer IA
 * - POST   /invoices/:id/mark-paid             - Marquer payee
 * - POST   /invoices/:id/send                  - Envoyer
 * - POST   /invoices/:id/remind                - Rappel
 *
 * === CATEGORIES (2) ===
 * - GET    /categories                         - Liste
 * - POST   /categories                         - Creer
 *
 * === ANALYTICS (3) ===
 * - GET    /analytics/dashboard                - Stats globales
 * - GET    /analytics/monthly                  - Detail mensuel
 * - GET    /analytics/tva                      - Resume TVA
 *
 * === SETTINGS (3) ===
 * - GET    /settings                           - Parametres societe
 * - PUT    /settings                           - Modifier
 * - POST   /settings/logo                      - Upload logo
 *
 * === CONTACTS (6) ===
 * - GET    /contacts                           - Liste
 * - POST   /contacts                           - Creer
 * - GET    /contacts/:id                       - Detail
 * - PUT    /contacts/:id                       - Modifier
 * - DELETE /contacts/:id                       - Desactiver
 * - GET    /contacts/:id/invoices              - Factures
 *
 * === DOCUMENTS (2) ===
 * - POST   /documents                          - Creer (devis, avoir)
 * - POST   /documents/:id/convert              - Convertir devis -> facture
 *
 * === EXPENSE REPORTS (10) ===
 * - GET    /expense-reports                    - Liste
 * - POST   /expense-reports                    - Creer
 * - GET    /expense-reports/:id                - Detail
 * - PUT    /expense-reports/:id                - Modifier
 * - POST   /expense-reports/:id/items          - Ajouter item
 * - POST   /expense-reports/:id/items/:itemId/scan - Scan justificatif
 * - POST   /expense-reports/:id/submit         - Soumettre
 * - POST   /expense-reports/:id/approve        - Approuver
 * - POST   /expense-reports/:id/reject         - Rejeter
 * - POST   /expense-reports/:id/reimburse      - Rembourser
 *
 * === DEPARTMENTS & BUDGETS (8) ===
 * - GET    /departments                        - Liste
 * - POST   /departments                        - Creer
 * - PUT    /departments/:id                    - Modifier
 * - DELETE /departments/:id                    - Supprimer
 * - GET    /budgets                            - Vue d'ensemble
 * - POST   /budgets                            - Creer/modifier
 * - GET    /budgets/variance                   - Ecarts
 * - GET    /budgets/:departmentId              - Detail departement
 *
 * === BANK RECONCILIATION (5) ===
 * - POST   /bank/import                        - Import CSV
 * - GET    /bank/transactions                   - Liste
 * - POST   /bank/match/:txId/:invoiceId         - Rapprochement manuel
 * - POST   /bank/auto-match                     - Rapprochement auto
 * - GET    /bank/unreconciled                    - Non rapprochees
 *
 * === ALERTS (4) ===
 * - GET    /alerts                              - Liste
 * - PUT    /alerts/:id/read                     - Lue
 * - PUT    /alerts/:id/dismiss                  - Rejetee
 * - POST   /alerts/generate                     - Generer
 *
 * === FINANCIAL STATEMENTS (3) ===
 * - GET    /statements/balance-sheet            - Bilan
 * - GET    /statements/profit-loss              - Compte de resultat
 * - GET    /statements/cash-flow                - Flux tresorerie
 *
 * === AI (3) ===
 * - POST   /ai/predict-cashflow                 - Prediction tresorerie
 * - POST   /ai/categorize                       - Categorisation IA
 * - POST   /ai/detect-anomalies                 - Detection anomalies
 *
 * === EXPORTS (3) ===
 * - POST   /export                              - Export generique
 * - POST   /export/fec                          - FEC legal
 * - POST   /export/tva-declaration              - Declaration TVA
 *
 * === INIT (1) ===
 * - POST   /init                                - Initialiser workspace
 */
