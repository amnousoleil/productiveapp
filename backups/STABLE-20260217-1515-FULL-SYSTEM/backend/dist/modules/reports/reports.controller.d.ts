import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class ReportsController {
    /**
     * GET /reports/workspace/:workspaceId
     * List reports with pagination and filters
     */
    getReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /reports/workspace/:workspaceId/:reportId
     * Get single report by ID
     */
    getReportById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /reports/workspace/:workspaceId/summary
     * Get quick summary for current period
     */
    getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /reports/workspace/:workspaceId/generate
     * Generate a new report
     */
    generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const reportsController: ReportsController;
//# sourceMappingURL=reports.controller.d.ts.map