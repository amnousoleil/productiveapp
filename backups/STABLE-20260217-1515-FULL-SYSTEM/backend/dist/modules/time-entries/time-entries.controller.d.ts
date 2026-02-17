import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class TimeEntriesController {
    createEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listEntries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getRunningEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    stopEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getWeeklySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMonthlySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMemberRate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    setMemberRate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const timeEntriesController: TimeEntriesController;
//# sourceMappingURL=time-entries.controller.d.ts.map