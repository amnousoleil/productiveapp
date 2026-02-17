import type { Request, Response, NextFunction } from 'express';
import type { AdminService } from './admin.service.js';
import type { AdminDashboardService } from './services/admin-dashboard.service.js';
import type { FrontendErrorsService } from './services/frontend-errors.service.js';
import type { AnalyticsService } from './services/analytics.service.js';
export declare class AdminControllerExtended {
    private adminService;
    private dashboardService;
    private frontendErrorsService;
    private analyticsService;
    constructor(adminService: AdminService, dashboardService: AdminDashboardService, frontendErrorsService: FrontendErrorsService, analyticsService: AnalyticsService);
    getHealth: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMemberActivity: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRecentActivity: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAPIMetrics: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTopEndpoints: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFrontendErrors: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFrontendErrorStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    resolveFrontendError: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteFrontendError: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    exportFrontendErrorsCSV: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTopPages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTopFeatures: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserActivityStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFeatureEngagement: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=admin.controller.extended.d.ts.map