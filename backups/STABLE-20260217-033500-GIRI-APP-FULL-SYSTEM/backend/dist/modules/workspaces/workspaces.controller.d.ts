import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class WorkspacesController {
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMyWorkspaces(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getBySlug(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    invite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    acceptInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getInvitations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    cancelInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    leave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    transferOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const workspacesController: WorkspacesController;
//# sourceMappingURL=workspaces.controller.d.ts.map