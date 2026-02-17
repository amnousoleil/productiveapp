/**
 * Module CRM Pipeline - Controller
 */
import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
    dealId?: string;
}>;
export declare const pipelines: (req: Req, res: Response) => Promise<void>;
export declare const createPipeline: (req: Req, res: Response) => Promise<void>;
export declare const updatePipeline: (req: Req, res: Response) => Promise<void>;
export declare const board: (req: Req, res: Response) => Promise<void>;
export declare const listDeals: (req: Req, res: Response) => Promise<void>;
export declare const getDeal: (req: Req, res: Response) => Promise<void>;
export declare const createDeal: (req: Req, res: Response) => Promise<void>;
export declare const updateDealCtrl: (req: Req, res: Response) => Promise<void>;
export declare const deleteDeal: (req: Req, res: Response) => Promise<void>;
export declare const moveDeal: (req: Req, res: Response) => Promise<void>;
export declare const convertDealCtrl: (req: Req, res: Response) => Promise<void>;
export declare const activities: (req: Req, res: Response) => Promise<void>;
export declare const addActivity: (req: Req, res: Response) => Promise<void>;
export declare const stats: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=crm.controller.d.ts.map