/**
 * AI Controller
 * ProductiveApp v4.0
 */
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class AiController {
    generate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    correct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const aiController: AiController;
//# sourceMappingURL=ai.controller.d.ts.map