import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class CanvasesController {
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addCollaborator(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    removeCollaborator(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const canvasesController: CanvasesController;
//# sourceMappingURL=canvases.controller.d.ts.map