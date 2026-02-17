/**
 * AI Reports Controller
 */

import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { aiReportsService } from './ai-reports.service.js';
import { successResponse } from '../../utils/helpers.js';
import { z } from 'zod';

const generateSchema = z.object({
  report_type: z.enum(['standard', 'audit', 'meta_synthesis']).optional(),
  title: z.string().max(255).optional(),
  period_type: z.enum(['week', 'month', 'year']).optional(),
  custom_prompt: z.string().max(1000).optional(),
  workspace_id: z.string().uuid().optional(),
});

const metaSynthesisSchema = z.object({
  report_ids: z.array(z.string().uuid()).optional(),
  period_type: z.enum(['week', 'month', 'year']).optional(),
  focus_areas: z.array(z.string()).optional(),
  workspace_id: z.string().uuid().optional(),
});

const listSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  report_type: z.enum(['standard', 'audit', 'meta_synthesis']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  workspace_id: z.string().uuid().optional(),
});

export class AIReportsController {
  /**
   * Generate a new AI report
   */
  async generate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = generateSchema.parse(req.body);
      const workspaceId = req.workspace?.id || input.workspace_id;
      const userId = req.user?.id;

      if (!workspaceId || !userId) {
        res.status(400).json({ success: false, error: { message: 'Missing workspace or user' } });
        return;
      }

      console.log(`📊 Generating AI report for user ${userId}, type: ${input.report_type || 'standard'}`);

      const report = await aiReportsService.generateReport(workspaceId, userId, input);

      res.json(successResponse(report));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get list of AI reports
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = listSchema.parse(req.query);
      const workspaceId = req.workspace?.id || params.workspace_id;
      const userId = req.user?.id;

      if (!workspaceId || !userId) {
        res.status(400).json({ success: false, error: { message: 'Missing workspace or user' } });
        return;
      }

      const result = await aiReportsService.getReports(workspaceId, userId, params);

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single report by ID
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reportId } = req.params;
      const workspaceId = req.workspace?.id || (req.query.workspace_id as string);

      if (!workspaceId) {
        res.status(400).json({ success: false, error: { message: 'Missing workspace' } });
        return;
      }

      const report = await aiReportsService.getReportById(reportId, workspaceId);

      if (!report) {
        res.status(404).json({ success: false, error: { message: 'Report not found' } });
        return;
      }

      res.json(successResponse(report));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate meta-synthesis
   */
  async metaSynthesis(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = metaSynthesisSchema.parse(req.body);
      const workspaceId = req.workspace?.id || input.workspace_id;
      const userId = req.user?.id;

      if (!workspaceId || !userId) {
        res.status(400).json({ success: false, error: { message: 'Missing workspace or user' } });
        return;
      }

      console.log(`🧠 Generating meta-synthesis for user ${userId}`);

      const report = await aiReportsService.generateMetaSynthesis(workspaceId, userId, input);

      res.json(successResponse(report));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get visualization data for charts
   */
  async visualizations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const periodType = (req.query.period_type as 'week' | 'month' | 'year') || 'week';
      const workspaceId = req.workspace?.id || (req.query.workspace_id as string);
      const userId = req.user?.id;

      if (!workspaceId || !userId) {
        res.status(400).json({ success: false, error: { message: 'Missing workspace or user' } });
        return;
      }

      const data = await aiReportsService.getVisualizationData(workspaceId, userId, periodType);

      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }
}

export const aiReportsController = new AIReportsController();
