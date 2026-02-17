import type { Request, Response, NextFunction } from 'express';
import type { AdminService } from './admin.service.js';
import type { AdminDashboardService } from './services/admin-dashboard.service.js';
import type { FrontendErrorsService } from './services/frontend-errors.service.js';
import type { AnalyticsService } from './services/analytics.service.js';

export class AdminControllerExtended {
  constructor(
    private adminService: AdminService,
    private dashboardService: AdminDashboardService,
    private frontendErrorsService: FrontendErrorsService,
    private analyticsService: AnalyticsService
  ) {}

  // ===== EXISTING ENDPOINTS =====

  getHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await this.adminService.getSystemHealth();
      res.json(health);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.adminService.getSystemStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  getMemberActivity = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activity = await this.adminService.getMemberActivity();
      res.json(activity);
    } catch (error) {
      next(error);
    }
  };

  getRecentActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activity = await this.adminService.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      next(error);
    }
  };

  getAPIMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = this.dashboardService.getAPIMetrics();
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  };

  getTopEndpoints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const endpoints = this.dashboardService.getTopEndpoints(limit);
      res.json(endpoints);
    } catch (error) {
      next(error);
    }
  };

  // ===== NEW FRONTEND ERRORS ENDPOINTS =====

  getFrontendErrors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const severity = req.query.severity as string | undefined;
      const userId = req.query.userId as string | undefined;
      const resolved = req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined;

      const result = await this.frontendErrorsService.getErrors({
        limit,
        offset,
        severity,
        userId,
        resolved,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getFrontendErrorStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.frontendErrorsService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  resolveFrontendError = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errorId = req.params.id;
      const resolvedBy = (req as any).user?.id || 'admin';

      const success = await this.frontendErrorsService.resolveError(errorId, resolvedBy);

      if (success) {
        res.json({ success: true, message: 'Error marked as resolved' });
      } else {
        res.status(404).json({ success: false, error: 'Error not found' });
      }
    } catch (error) {
      next(error);
    }
  };

  deleteFrontendError = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errorId = req.params.id;
      const success = await this.frontendErrorsService.deleteError(errorId);

      if (success) {
        res.json({ success: true, message: 'Error deleted' });
      } else {
        res.status(404).json({ success: false, error: 'Error not found' });
      }
    } catch (error) {
      next(error);
    }
  };

  exportFrontendErrorsCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const severity = req.query.severity as string | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const data = await this.frontendErrorsService.getCSVData({
        severity,
        startDate,
        endDate,
      });

      // Generate CSV
      const csvLines = [];
      csvLines.push('Timestamp,Severity,Message,URL,User Agent,User Name,User Email');

      for (const row of data) {
        const escapeCsv = (str: any) => {
          if (str === null || str === undefined) return '';
          str = String(str).replace(/"/g, '""');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str}"`;
          }
          return str;
        };

        csvLines.push([
          escapeCsv(row.timestamp),
          escapeCsv(row.severity),
          escapeCsv(row.message),
          escapeCsv(row.url),
          escapeCsv(row.user_agent),
          escapeCsv(row.user_name),
          escapeCsv(row.user_email),
        ].join(','));
      }

      const csv = csvLines.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="frontend-errors-export.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  };

  // ===== NEW ANALYTICS ENDPOINTS =====

  getTopPages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const pages = await this.analyticsService.getTopPages(limit);
      res.json(pages);
    } catch (error) {
      next(error);
    }
  };

  getTopFeatures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const features = await this.analyticsService.getTopFeatures(limit);
      res.json(features);
    } catch (error) {
      next(error);
    }
  };

  getUserActivityStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.analyticsService.getUserActivity();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  getFeatureEngagement = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const engagement = await this.analyticsService.getFeatureEngagement();
      res.json(engagement);
    } catch (error) {
      next(error);
    }
  };
}
