import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
    token?: string;
}>;
export declare const generateToken: (req: Req, res: Response) => Promise<void>;
export declare const listTokens: (req: Req, res: Response) => Promise<void>;
export declare const revokeToken: (req: Req, res: Response) => Promise<void>;
export declare const portalAccess: (req: Request<{
    token: string;
}>, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=portal.controller.d.ts.map