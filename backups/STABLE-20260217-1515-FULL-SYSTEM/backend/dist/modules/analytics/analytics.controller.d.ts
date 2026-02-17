import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class AnalyticsController {
    logActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getActivityLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getActivitySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getDailyStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getWorkspaceStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getProductivityStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateDailyStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateWorkspaceStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const analyticsController: AnalyticsController;
//# sourceMappingURL=analytics.controller.d.ts.map