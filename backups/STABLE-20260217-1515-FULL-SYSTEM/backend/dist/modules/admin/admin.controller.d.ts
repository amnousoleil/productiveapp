import type { Request, Response, NextFunction } from 'express';
import type { AdminService } from './admin.service.js';
import type { AdminDashboardService } from './services/admin-dashboard.service.js';
import type { ErrorLogService } from './services/error-log.service.js';
export declare class AdminController {
    private adminService;
    private dashboardService?;
    private errorLogService?;
    constructor(adminService: AdminService, dashboardService?: AdminDashboardService | undefined, errorLogService?: ErrorLogService | undefined);
    getHealth: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMemberActivity: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRecentActivity: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAPIMetrics: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTopEndpoints: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getErrorLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getErrorStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    createErrorLog: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getHealthHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getDatabaseMetrics: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSystemAlerts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserAnalytics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getVersion: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=admin.controller.d.ts.map