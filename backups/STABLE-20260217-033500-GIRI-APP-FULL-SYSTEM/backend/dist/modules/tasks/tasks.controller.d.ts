import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class TasksController {
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMyTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getComments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    reorder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSubtasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getDueSoon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getOverdue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get users with at least one task in_progress (active users)
     * Used for real-time activity visualization / implicit time tracking
     */
    getActiveUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const tasksController: TasksController;
//# sourceMappingURL=tasks.controller.d.ts.map