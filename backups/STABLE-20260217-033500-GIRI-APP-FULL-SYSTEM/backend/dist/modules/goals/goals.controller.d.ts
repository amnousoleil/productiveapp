import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
}>;
export declare const list: (req: Req, res: Response) => Promise<void>;
export declare const get: (req: Req, res: Response) => Promise<void>;
export declare const create: (req: Req, res: Response) => Promise<void>;
export declare const update: (req: Req, res: Response) => Promise<void>;
export declare const remove: (req: Req, res: Response) => Promise<void>;
export declare const refresh: (req: Req, res: Response) => Promise<void>;
export declare const dashboard: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=goals.controller.d.ts.map