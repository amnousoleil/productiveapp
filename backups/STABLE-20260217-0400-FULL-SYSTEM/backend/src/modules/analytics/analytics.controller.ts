import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { analyticsService } from './analytics.service.js';
import { successResponse, paginatedResponse } from '../../utils/helpers.js';
import { paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';

const dateRangeSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

const activityLogsSchema = paginationSchema.extend({
  user_id: uuidSchema.optional(),
  action: z.string().optional(),
  entity_type: z.string().optional(),
});

const logActivitySchema = z.object({
  action: z.enum(['create', 'update', 'delete', 'view', 'login', 'logout', 'invite', 'join', 'leave', 'archive', 'restore']),
  entity_type: z.enum(['note', 'task', 'message', 'canvas', 'project', 'workspace']).optional(),
  entity_id: uuidSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export class AnalyticsController {
  async logActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const input = logActivitySchema.parse(req.body);
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const activity = await analyticsService.logActivity(userId, workspaceId, input, ip, userAgent);

      res.status(201).json(successResponse({ activity }));
    } catch (error) {
      next(error);
    }
  }

  async getActivityLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const params = activityLogsSchema.parse(req.query);

      const { activities, total } = await analyticsService.getActivityLogs(workspaceId, params);

      res.json(paginatedResponse(activities, params, total));
    } catch (error) {
      next(error);
    }
  }

  async getActivitySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const dateRange = dateRangeSchema.parse(req.query);

      const summary = await analyticsService.getActivitySummary(userId, workspaceId, dateRange);

      res.json(successResponse({ summary }));
    } catch (error) {
      next(error);
    }
  }

  async getDailyStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const dateRange = dateRangeSchema.parse(req.query);

      const stats = await analyticsService.getDailyStats(userId, workspaceId, dateRange);

      res.json(successResponse({ stats }));
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const dateRange = dateRangeSchema.parse(req.query);

      const stats = await analyticsService.getWorkspaceStats(workspaceId, dateRange);

      res.json(successResponse({ stats }));
    } catch (error) {
      next(error);
    }
  }

  async getProductivityStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const stats = await analyticsService.getUserProductivityStats(userId, workspaceId);

      res.json(successResponse({ stats }));
    } catch (error) {
      next(error);
    }
  }

  async updateDailyStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const stats = await analyticsService.updateDailyStats(userId, workspaceId);

      res.json(successResponse({ stats }));
    } catch (error) {
      next(error);
    }
  }

  async updateWorkspaceStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;

      const stats = await analyticsService.updateWorkspaceStats(workspaceId);

      res.json(successResponse({ stats }));
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
