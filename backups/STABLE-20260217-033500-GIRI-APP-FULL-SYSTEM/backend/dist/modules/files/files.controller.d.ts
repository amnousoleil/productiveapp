import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class FilesController {
    upload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getByEntity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getStorageUsage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMyStorageUsage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const filesController: FilesController;
//# sourceMappingURL=files.controller.d.ts.map