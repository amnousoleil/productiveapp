import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class AuthController {
    register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    refresh(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updatePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map