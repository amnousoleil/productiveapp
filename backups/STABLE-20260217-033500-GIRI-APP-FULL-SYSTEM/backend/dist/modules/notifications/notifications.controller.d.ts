import { Request, Response } from 'express';
type Req = Request<any, any, any, any> & {
    user?: {
        id: string;
        memberId?: string;
    };
};
export declare const getPreferences: (req: Req, res: Response) => Promise<void>;
export declare const updatePreferences: (req: Req, res: Response) => Promise<void>;
export declare const getHistory: (req: Req, res: Response) => Promise<void>;
export declare const testNotification: (req: Req, res: Response) => Promise<void>;
export declare const subscribe: (req: Req, res: Response) => Promise<void>;
export declare const unsubscribe: (req: Req, res: Response) => Promise<void>;
/**
 * Analyser le contexte utilisateur et générer des rappels intelligents
 */
export declare const aiAnalyzeAndGenerate: (req: Req, res: Response) => Promise<void>;
/**
 * Générer des rappels et les créer en DB
 */
export declare const aiGenerateReminders: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=notifications.controller.d.ts.map