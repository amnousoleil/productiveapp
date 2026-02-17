/**
 * Module Comptabilité - Controller
 * @description Handlers Express pour les endpoints API
 */
import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
}>;
export declare const createInvoice: (req: Req, res: Response) => Promise<void>;
export declare const scanInvoice: (req: Req, res: Response) => Promise<void>;
export declare const listInvoices: (req: Req, res: Response) => Promise<void>;
export declare const getInvoice: (req: Req, res: Response) => Promise<void>;
export declare const updateInvoice: (req: Req, res: Response) => Promise<void>;
export declare const deleteInvoice: (req: Req, res: Response) => Promise<void>;
export declare const validateInvoice: (req: Req, res: Response) => Promise<void>;
export declare const reprocessInvoice: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=accounting.controller.d.ts.map