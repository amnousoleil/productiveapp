import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
}>;
export declare const listTemplates: (req: Req, res: Response) => Promise<void>;
export declare const createTemplate: (req: Req, res: Response) => Promise<void>;
export declare const updateTemplate: (req: Req, res: Response) => Promise<void>;
export declare const deleteTemplate: (req: Req, res: Response) => Promise<void>;
export declare const listContracts: (req: Req, res: Response) => Promise<void>;
export declare const createContract: (req: Req, res: Response) => Promise<void>;
export declare const getContract: (req: Req, res: Response) => Promise<void>;
export declare const updateContract: (req: Req, res: Response) => Promise<void>;
export declare const deleteContract: (req: Req, res: Response) => Promise<void>;
export declare const sendForSignature: (req: Req, res: Response) => Promise<void>;
export declare const signContract: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=contracts.controller.d.ts.map