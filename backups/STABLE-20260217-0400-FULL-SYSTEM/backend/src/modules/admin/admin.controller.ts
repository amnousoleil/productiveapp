import type { Request, Response, NextFunction } from 'express';
import type { AdminService } from './admin.service.js';
import type { AdminDashboardService } from './services/admin-dashboard.service.js';
import type { ErrorLogService } from './services/error-log.service.js';

export class AdminController {
  constructor(
    private adminService: AdminService,
    private dashboardService?: AdminDashboardService,
    private errorLogService?: ErrorLogService
  ) {}

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

  // ===== NEW DASHBOARD ENDPOINTS =====

  getAPIMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.dashboardService) {
        res.status(501).json({ error: 'Dashboard service not initialized' });
        return;
      }
      const metrics = this.dashboardService.getAPIMetrics();
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  };

  getTopEndpoints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.dashboardService) {
        res.status(501).json({ error: 'Dashboard service not initialized' });
        return;
      }
      const limit = parseInt(req.query.limit as string) || 10;
      const endpoints = this.dashboardService.getTopEndpoints(limit);
      res.json(endpoints);
    } catch (error) {
      next(error);
    }
  };

  getErrorLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.dashboardService) {
        res.status(501).json({ error: 'Dashboard service not initialized' });
        return;
      }
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const severity = req.query.severity as string | undefined;
      const errorType = req.query.errorType as string | undefined;

      const result = await this.dashboardService.getErrorLogs({
        limit,
        offset,
        severity,
        errorType,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getErrorStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.dashboardService) {
        res.status(501).json({ error: 'Dashboard service not initialized' });
        return;
      }
      const stats = await this.dashboardService.getErrorStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  createErrorLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.errorLogService) {
        res.status(501).json({ error: 'Error log service not initialized' });
        return;
      }
      const id = await this.errorLogService.createLog(req.body);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  };

  getHealthHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.dashboardService) {
        res.status(501).json({ error: 'Dashboard service not initialized' });
        return;
      }
      const limit = parseInt(req.query.limit as string) || 100;
      const history = await this.dashboardService.getHealthHistory(limit);
      res.json(history);
    } catch (error) {
      next(error);
    }
  };

  getDatabaseMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.dashboardService) {
        res.status(501).json({ error: 'Dashboard service not initialized' });
        return;
      }
      const metrics = await this.dashboardService.getDatabaseMetrics();
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  };

  getSystemAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.dashboardService) {
        res.status(501).json({ error: 'Dashboard service not initialized' });
        return;
      }
      const status = req.query.status as string | undefined;
      const severity = req.query.severity as string | undefined;
      const result = await this.dashboardService.getSystemAlerts({ status, severity });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.dashboardService) {
        res.status(501).json({ error: 'Dashboard service not initialized' });
        return;
      }
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const analytics = await this.dashboardService.getUserAnalytics(startDate, endDate);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  };

  getVersion = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.dashboardService) {
        res.status(501).json({ error: 'Dashboard service not initialized' });
        return;
      }
      const version = await this.dashboardService.getVersionInfo();
      res.json(version);
    } catch (error) {
      next(error);
    }
  };
}
