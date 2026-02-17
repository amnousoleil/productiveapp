"use strict";
/**
 * Module Comptabilite - Index v2.0
 * @description Point d'entree et exports du module comptabilite complet
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountingRoutes = exports.mountAccountingModule = exports.initAccountingModule = exports.ACCOUNTING_BASE_PATH = exports.accountingRouter = exports.RecurringService = exports.StripeService = exports.PredictionsService = exports.FECService = exports.AlertsService = exports.BankService = exports.ExpensesService = exports.DepartmentsService = exports.ContactsService = exports.ExportService = exports.AIService = exports.AnalyticsService = exports.AccountingService = void 0;
const accounting_routes_js_1 = __importStar(require("./accounting.routes.js"));
// v1.0 services
const accounting_service_js_1 = require("./accounting.service.js");
const accounting_analytics_js_1 = require("./accounting.analytics.js");
const accounting_ai_js_1 = require("./accounting.ai.js");
const accounting_export_js_1 = require("./accounting.export.js");
// v2.0 services
const accounting_contacts_js_1 = require("./accounting.contacts.js");
const accounting_departments_js_1 = require("./accounting.departments.js");
const accounting_expenses_js_1 = require("./accounting.expenses.js");
const accounting_bank_js_1 = require("./accounting.bank.js");
const accounting_alerts_js_1 = require("./accounting.alerts.js");
const accounting_fec_js_1 = require("./accounting.fec.js");
const accounting_predictions_js_1 = require("./accounting.predictions.js");
// v3.0 services
const accounting_stripe_js_1 = require("./accounting.stripe.js");
const accounting_recurring_js_1 = require("./accounting.recurring.js");
const pool_js_1 = __importDefault(require("./pool.js"));
// ============================================
// TYPES EXPORTS
// ============================================
__exportStar(require("./accounting.types.js"), exports);
// ============================================
// SERVICES EXPORTS
// ============================================
// v1.0 services
exports.AccountingService = __importStar(require("./accounting.service.js"));
exports.AnalyticsService = __importStar(require("./accounting.analytics.js"));
exports.AIService = __importStar(require("./accounting.ai.js"));
exports.ExportService = __importStar(require("./accounting.export.js"));
// v2.0 services
exports.ContactsService = __importStar(require("./accounting.contacts.js"));
exports.DepartmentsService = __importStar(require("./accounting.departments.js"));
exports.ExpensesService = __importStar(require("./accounting.expenses.js"));
exports.BankService = __importStar(require("./accounting.bank.js"));
exports.AlertsService = __importStar(require("./accounting.alerts.js"));
exports.FECService = __importStar(require("./accounting.fec.js"));
exports.PredictionsService = __importStar(require("./accounting.predictions.js"));
// v3.0 services
exports.StripeService = __importStar(require("./accounting.stripe.js"));
exports.RecurringService = __importStar(require("./accounting.recurring.js"));
// ============================================
// ROUTES EXPORTS
// ============================================
var accounting_routes_js_2 = require("./accounting.routes.js");
Object.defineProperty(exports, "accountingRouter", { enumerable: true, get: function () { return __importDefault(accounting_routes_js_2).default; } });
Object.defineProperty(exports, "ACCOUNTING_BASE_PATH", { enumerable: true, get: function () { return accounting_routes_js_2.ACCOUNTING_BASE_PATH; } });
/**
 * Initialise le module comptabilite v2.0
 * @param config Configuration du module
 */
const initAccountingModule = (config) => {
    // v1.0 services
    (0, accounting_service_js_1.initAccountingService)(config.pool);
    (0, accounting_analytics_js_1.initAnalyticsService)(config.pool);
    (0, accounting_export_js_1.initExportService)(config.pool, config.exportDirectory);
    // v2.0 services
    (0, accounting_contacts_js_1.initContactsService)(config.pool);
    (0, accounting_departments_js_1.initDepartmentsService)(config.pool);
    (0, accounting_expenses_js_1.initExpensesService)(config.pool);
    (0, accounting_bank_js_1.initBankService)(config.pool);
    (0, accounting_alerts_js_1.initAlertsService)(config.pool);
    (0, accounting_fec_js_1.initFECService)(config.pool);
    (0, accounting_predictions_js_1.initPredictionsService)(config.pool, config.openaiApiKey);
    // Initialiser le service IA si cle API fournie
    if (config.openaiApiKey) {
        (0, accounting_ai_js_1.initAIService)(config.openaiApiKey);
    }
    // v3.0 services
    (0, accounting_stripe_js_1.initStripeService)(config.pool, config.stripeSecretKey);
    (0, accounting_recurring_js_1.initRecurringService)(config.pool);
    console.log('[Accounting Module v3.0] Initialized successfully (13 services)');
};
exports.initAccountingModule = initAccountingModule;
/**
 * Monte le module sur une application Express
 * @param app Application Express
 * @param config Configuration du module
 */
const mountAccountingModule = (app, config) => {
    // Initialiser le module
    (0, exports.initAccountingModule)(config);
    // Monter les routes
    app.use(accounting_routes_js_1.ACCOUNTING_BASE_PATH, accounting_routes_js_1.default);
    console.log(`[Accounting Module v2.0] Routes mounted at ${accounting_routes_js_1.ACCOUNTING_BASE_PATH}`);
};
exports.mountAccountingModule = mountAccountingModule;
// ============================================
// AUTO-INITIALISATION AVEC POOL LOCAL
// ============================================
// Initialiser automatiquement avec le pool local
(0, exports.initAccountingModule)({
    pool: pool_js_1.default,
    openaiApiKey: process.env.OPENAI_API_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    exportDirectory: process.env.EXPORT_DIR || './exports'
});
// Export du router pre-configure pour montage dans index.ts
var accounting_routes_js_3 = require("./accounting.routes.js");
Object.defineProperty(exports, "accountingRoutes", { enumerable: true, get: function () { return __importDefault(accounting_routes_js_3).default; } });
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
//# sourceMappingURL=index.js.map