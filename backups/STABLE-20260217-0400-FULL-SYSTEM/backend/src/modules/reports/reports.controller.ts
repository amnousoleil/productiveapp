import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { reportsService } from './reports.service.js';
import { successResponse, paginatedResponse, AppError } from '../../utils/helpers.js';
import { paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';

const periodTypeSchema = z.enum(['week', 'month', 'year']);

const reportListSchema = paginationSchema.extend({
  period_type: periodTypeSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const generateReportSchema = z.object({
  period_type: periodTypeSchema.default('week'),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
}).transform(data => ({
  ...data,
  period_type: data.period_type as 'week' | 'month' | 'year'
}));

const summaryQuerySchema = z.object({
  period: periodTypeSchema.default('week'),
});

export class ReportsController {
  /**
   * GET /reports/workspace/:workspaceId
   * List reports with pagination and filters
   */
  async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const params = reportListSchema.parse(req.query);

      const { reports, total } = await reportsService.getReports(workspaceId, userId, params);

      res.json(paginatedResponse(reports, params, total));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reports/workspace/:workspaceId/:reportId
   * Get single report by ID
   */
  async getReportById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const reportId = uuidSchema.parse(req.params.reportId);

      const report = await reportsService.getReportById(reportId, workspaceId);

      if (!report) {
        throw AppError.notFound('Report');
      }

      res.json(successResponse({ report }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reports/workspace/:workspaceId/summary
   * Get quick summary for current period
   */
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const { period } = summaryQuerySchema.parse(req.query);

      const summary = await reportsService.getSummary(workspaceId, userId, period);

      res.json(successResponse({ summary }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /reports/workspace/:workspaceId/generate
   * Generate a new report
   */
  async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const input = generateReportSchema.parse(req.body);

      const report = await reportsService.generateReport(workspaceId, userId, input);

      res.status(201).json(successResponse({ report }));
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
