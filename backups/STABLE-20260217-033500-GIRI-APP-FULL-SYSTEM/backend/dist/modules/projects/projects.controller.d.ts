import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class ProjectsController {
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMyProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    archive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    restore(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    reorder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const projectsController: ProjectsController;
//# sourceMappingURL=projects.controller.d.ts.map