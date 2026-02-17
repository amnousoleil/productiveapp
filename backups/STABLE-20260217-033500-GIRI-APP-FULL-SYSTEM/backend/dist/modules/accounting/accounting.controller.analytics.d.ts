/**
 * Module Comptabilité - Controller Analytics & Catégories
 * @description Handlers Express pour analytics, catégories et exports
 */
import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
}>;
export declare const listCategories: (req: Req, res: Response) => Promise<void>;
export declare const createCategory: (req: Req, res: Response) => Promise<void>;
export declare const getDashboard: (req: Req, res: Response) => Promise<void>;
export declare const getMonthlyAnalytics: (req: Req, res: Response) => Promise<void>;
export declare const getTVASummary: (req: Req, res: Response) => Promise<void>;
export declare const generateExport: (req: Req, res: Response) => Promise<void>;
export declare const initWorkspace: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=accounting.controller.analytics.d.ts.map