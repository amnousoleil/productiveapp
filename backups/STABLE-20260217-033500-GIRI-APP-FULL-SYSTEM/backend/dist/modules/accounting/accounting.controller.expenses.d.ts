/**
 * Module Comptabilite - Controller Notes de Frais
 * @description Handlers Express pour les endpoints notes de frais (expense reports)
 */
import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
    itemId?: string;
}>;
/**
 * GET /expense-reports
 * Liste des notes de frais avec filtres : status, member_id, page, limit
 */
export declare const listExpenseReports: (req: Req, res: Response) => Promise<void>;
/**
 * POST /expense-reports
 * Creer une nouvelle note de frais
 * Body: { member_id, member_name, title, description?, department_id?, currency? }
 */
export declare const createExpenseReport: (req: Req, res: Response) => Promise<void>;
/**
 * GET /expense-reports/:id
 * Detail d'une note de frais avec ses items
 */
export declare const getExpenseReport: (req: Req, res: Response) => Promise<void>;
/**
 * PUT /expense-reports/:id
 * Modifier une note de frais (seulement si status = draft)
 */
export declare const updateExpenseReport: (req: Req, res: Response) => Promise<void>;
/**
 * POST /expense-reports/:id/items
 * Ajouter un item a une note de frais
 * Body: { description, amount, date, category_id?, tva_rate?, receipt_url?, notes? }
 */
export declare const addExpenseItem: (req: Req, res: Response) => Promise<void>;
/**
 * POST /expense-reports/:id/items/:itemId/scan
 * Scanner un justificatif et extraire les donnees via IA
 */
export declare const scanExpenseReceipt: (req: Req, res: Response) => Promise<void>;
/**
 * POST /expense-reports/:id/submit
 * Soumettre une note de frais pour validation
 */
export declare const submitExpenseReport: (req: Req, res: Response) => Promise<void>;
/**
 * POST /expense-reports/:id/approve
 * Approuver une note de frais
 * Body: { reviewer_name, notes? }
 */
export declare const approveExpenseReport: (req: Req, res: Response) => Promise<void>;
/**
 * POST /expense-reports/:id/reject
 * Rejeter une note de frais
 * Body: { reviewer_name, notes }
 */
export declare const rejectExpenseReport: (req: Req, res: Response) => Promise<void>;
/**
 * POST /expense-reports/:id/reimburse
 * Marquer une note de frais comme remboursee
 */
export declare const reimburseExpenseReport: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=accounting.controller.expenses.d.ts.map