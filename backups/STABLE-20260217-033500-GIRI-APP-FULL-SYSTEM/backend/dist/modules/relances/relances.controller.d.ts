import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
}>;
export declare const getSettings: (req: Req, res: Response) => Promise<void>;
export declare const updateSettings: (req: Req, res: Response) => Promise<void>;
export declare const schedule: (req: Req, res: Response) => Promise<void>;
export declare const process: (_req: Req, res: Response) => Promise<void>;
export declare const list: (req: Req, res: Response) => Promise<void>;
export declare const cancel: (req: Req, res: Response) => Promise<void>;
export declare const overdueReport: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=relances.controller.d.ts.map