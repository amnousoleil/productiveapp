/**
 * Module Time Tracking - Controller
 */
import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
}>;
export declare const start: (req: Req, res: Response) => Promise<void>;
export declare const stop: (req: Req, res: Response) => Promise<void>;
export declare const running: (req: Req, res: Response) => Promise<void>;
export declare const create: (req: Req, res: Response) => Promise<void>;
export declare const update: (req: Req, res: Response) => Promise<void>;
export declare const remove: (req: Req, res: Response) => Promise<void>;
export declare const list: (req: Req, res: Response) => Promise<void>;
export declare const report: (req: Req, res: Response) => Promise<void>;
export declare const getRate: (req: Req, res: Response) => Promise<void>;
export declare const setRate: (req: Req, res: Response) => Promise<void>;
export declare const unbilled: (req: Req, res: Response) => Promise<void>;
export declare const linkInvoice: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=time-tracking.controller.d.ts.map