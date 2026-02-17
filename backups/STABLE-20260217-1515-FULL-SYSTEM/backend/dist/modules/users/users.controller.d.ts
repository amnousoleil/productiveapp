import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class UsersController {
    getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    search(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getWorkspaceMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const usersController: UsersController;
//# sourceMappingURL=users.controller.d.ts.map