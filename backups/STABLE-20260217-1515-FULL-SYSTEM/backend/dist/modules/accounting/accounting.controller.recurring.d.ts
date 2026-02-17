/**
 * Module Comptabilite - Controller Factures Recurrentes
 * @description Handlers Express pour les endpoints de recurrence
 */
import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
}>;
/**
 * GET /recurring - Liste
 */
export declare const listRecurring: (req: Req, res: Response) => Promise<void>;
/**
 * POST /recurring - Creer
 */
export declare const createRecurring: (req: Req, res: Response) => Promise<void>;
/**
 * GET /recurring/:id - Detail
 */
export declare const getRecurring: (req: Req, res: Response) => Promise<void>;
/**
 * PUT /recurring/:id - Modifier
 */
export declare const updateRecurring: (req: Req, res: Response) => Promise<void>;
/**
 * DELETE /recurring/:id - Supprimer
 */
export declare const deleteRecurring: (req: Req, res: Response) => Promise<void>;
/**
 * POST /recurring/:id/pause - Mettre en pause
 */
export declare const pauseRecurring: (req: Req, res: Response) => Promise<void>;
/**
 * POST /recurring/:id/resume - Reprendre
 */
export declare const resumeRecurring: (req: Req, res: Response) => Promise<void>;
/**
 * POST /recurring/process - Lancer la generation manuelle
 */
export declare const processRecurring: (_req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=accounting.controller.recurring.d.ts.map