import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
}>;
export declare const simulate: (req: Req, res: Response) => Promise<void>;
export declare const listDeclarations: (req: Req, res: Response) => Promise<void>;
export declare const createDeclaration: (req: Req, res: Response) => Promise<void>;
export declare const updateDeclaration: (req: Req, res: Response) => Promise<void>;
export declare const annualSummary: (req: Req, res: Response) => Promise<void>;
export declare const autoCalc: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=urssaf.controller.d.ts.map