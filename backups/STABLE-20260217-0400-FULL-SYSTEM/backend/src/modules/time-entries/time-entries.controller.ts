import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { timeEntriesService } from './time-entries.service.js';
import { successResponse, paginatedResponse } from '../../utils/helpers.js';
import { paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================

const createTimeEntrySchema = z.object({
  member_id: uuidSchema,
  task_id: uuidSchema.nullable().optional(),
  project_id: uuidSchema.nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().nullable().optional(),
  duration_minutes: z.coerce.number().int().min(0).nullable().optional(),
  is_billable: z.boolean().optional(),
  is_running: z.boolean().optional(),
  hourly_rate: z.coerce.number().min(0).nullable().optional(),
  currency: z.string().max(3).nullable().optional(),
  tags: z.array(z.string()).optional(),
});

const updateTimeEntrySchema = z.object({
  task_id: uuidSchema.nullable().optional(),
  project_id: uuidSchema.nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().nullable().optional(),
  duration_minutes: z.coerce.number().int().min(0).nullable().optional(),
  is_billable: z.boolean().optional(),
  is_running: z.boolean().optional(),
  hourly_rate: z.coerce.number().min(0).nullable().optional(),
  currency: z.string().max(3).nullable().optional(),
  tags: z.array(z.string()).optional(),
});

const listTimeEntriesSchema = paginationSchema.extend({
  member_id: uuidSchema.optional(),
  project_id: uuidSchema.optional(),
  task_id: uuidSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  is_billable: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  is_running: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

const setMemberRateSchema = z.object({
  hourly_rate: z.coerce.number().min(0),
  currency: z.string().max(3).default('EUR'),
});

// ============================================
// Controller
// ============================================

export class TimeEntriesController {
  async createEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const input = createTimeEntrySchema.parse(req.body);

      const entry = await timeEntriesService.createEntry(workspaceId, input);

      res.status(201).json(successResponse({ entry }));
    } catch (error) {
      next(error);
    }
  }

  async updateEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const entryId = uuidSchema.parse(req.params.id);
      const input = updateTimeEntrySchema.parse(req.body);

      const entry = await timeEntriesService.updateEntry(workspaceId, entryId, input);

      res.json(successResponse({ entry }));
    } catch (error) {
      next(error);
    }
  }

  async deleteEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const entryId = uuidSchema.parse(req.params.id);

      await timeEntriesService.deleteEntry(workspaceId, entryId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const entryId = uuidSchema.parse(req.params.id);

      const entry = await timeEntriesService.getEntry(workspaceId, entryId);

      res.json(successResponse({ entry }));
    } catch (error) {
      next(error);
    }
  }

  async listEntries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const filters = listTimeEntriesSchema.parse(req.query);

      const { entries, total } = await timeEntriesService.listEntries(workspaceId, filters);

      res.json(paginatedResponse(entries, filters, total));
    } catch (error) {
      next(error);
    }
  }

  async getRunningEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const memberId = uuidSchema.parse(req.query.member_id as string);

      const entry = await timeEntriesService.getRunningEntry(workspaceId, memberId);

      if (!entry) {
        res.json(successResponse({ entry: null }));
        return;
      }

      res.json(successResponse({ entry }));
    } catch (error) {
      next(error);
    }
  }

  async stopEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const entryId = uuidSchema.parse(req.params.id);

      const entry = await timeEntriesService.stopEntry(workspaceId, entryId);

      res.json(successResponse({ entry }));
    } catch (error) {
      next(error);
    }
  }

  async getWeeklySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const memberId = uuidSchema.parse(req.query.member_id as string);
      const weekStart = z.string().parse(req.query.week_start as string);

      const summary = await timeEntriesService.getWeeklySummary(workspaceId, memberId, weekStart);

      res.json(successResponse({ summary }));
    } catch (error) {
      next(error);
    }
  }

  async getMonthlySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const memberId = uuidSchema.parse(req.query.member_id as string);
      const year = z.coerce.number().int().min(2000).max(2100).parse(req.query.year);
      const month = z.coerce.number().int().min(1).max(12).parse(req.query.month);

      const summary = await timeEntriesService.getMonthlySummary(workspaceId, memberId, year, month);

      res.json(successResponse({ summary }));
    } catch (error) {
      next(error);
    }
  }

  async getMemberRate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const memberId = uuidSchema.parse(req.params.memberId);

      const rate = await timeEntriesService.getMemberRate(workspaceId, memberId);

      if (!rate) {
        res.json(successResponse({ rate: null }));
        return;
      }

      res.json(successResponse({ rate }));
    } catch (error) {
      next(error);
    }
  }

  async setMemberRate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const memberId = uuidSchema.parse(req.params.memberId);
      const { hourly_rate, currency } = setMemberRateSchema.parse(req.body);

      const rate = await timeEntriesService.setMemberRate(workspaceId, memberId, hourly_rate, currency);

      res.status(201).json(successResponse({ rate }));
    } catch (error) {
      next(error);
    }
  }
}

export const timeEntriesController = new TimeEntriesController();
