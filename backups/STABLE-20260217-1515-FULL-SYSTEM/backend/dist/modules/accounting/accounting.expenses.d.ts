/**
 * Module Comptabilité - Service Notes de Frais
 * @description Gestion des notes de frais avec workflow d'approbation
 * (draft -> submitted -> under_review -> approved/rejected -> reimbursed)
 */
import { Pool } from 'pg';
import { ExpenseReport, ExpenseItem, CreateExpenseReportDTO, UpdateExpenseReportDTO, CreateExpenseItemDTO, ExpenseReportFilters, PaginatedResponse } from './accounting.types.js';
export declare const initExpensesService: (dbPool: Pool) => void;
/**
 * Crée une nouvelle note de frais en statut 'draft'
 */
export declare const createExpenseReport: (workspaceId: string, data: CreateExpenseReportDTO) => Promise<ExpenseReport>;
/**
 * Liste les notes de frais avec pagination et filtres
 */
export declare const listExpenseReports: (workspaceId: string, filters: ExpenseReportFilters) => Promise<PaginatedResponse<ExpenseReport>>;
/**
 * Récupère une note de frais par ID avec tous ses items
 */
export declare const getExpenseReportById: (workspaceId: string, reportId: string) => Promise<ExpenseReport | null>;
/**
 * Met à jour une note de frais (uniquement si en statut 'draft')
 */
export declare const updateExpenseReport: (workspaceId: string, reportId: string, data: UpdateExpenseReportDTO) => Promise<ExpenseReport | null>;
/**
 * Ajoute un item à une note de frais et recalcule le total
 */
export declare const addExpenseItem: (reportId: string, data: CreateExpenseItemDTO) => Promise<ExpenseItem>;
/**
 * Supprime un item d'une note de frais et recalcule le total
 */
export declare const removeExpenseItem: (reportId: string, itemId: string) => Promise<boolean>;
/**
 * Soumet une note de frais pour approbation (draft -> submitted)
 */
export declare const submitExpenseReport: (workspaceId: string, reportId: string) => Promise<ExpenseReport | null>;
/**
 * Approuve une note de frais (submitted/under_review -> approved)
 */
export declare const approveExpenseReport: (workspaceId: string, reportId: string, reviewerName: string, notes?: string) => Promise<ExpenseReport | null>;
/**
 * Rejette une note de frais (submitted/under_review -> rejected)
 */
export declare const rejectExpenseReport: (workspaceId: string, reportId: string, reviewerName: string, notes: string) => Promise<ExpenseReport | null>;
/**
 * Marque une note de frais comme remboursée (approved -> reimbursed)
 */
export declare const reimburseExpenseReport: (workspaceId: string, reportId: string) => Promise<ExpenseReport | null>;
//# sourceMappingURL=accounting.expenses.d.ts.map