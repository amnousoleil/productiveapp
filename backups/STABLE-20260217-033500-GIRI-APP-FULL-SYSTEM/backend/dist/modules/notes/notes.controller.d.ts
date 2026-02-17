import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class NotesController {
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    restore(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    permanentDelete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getDeleted(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getVersions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    restoreVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getLinks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addLink(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    removeLink(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const notesController: NotesController;
//# sourceMappingURL=notes.controller.d.ts.map