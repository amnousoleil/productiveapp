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
declare const router: import("express-serve-static-core").Router;
export default router;
export declare const createAccountingRouter: () => Router;
export declare const ACCOUNTING_BASE_PATH = "/api/v1/accounting/workspace/:workspaceId";
//# sourceMappingURL=accounting.routes.d.ts.map