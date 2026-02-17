import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { auditService } from './audit.service.js';
import { successResponse, paginatedResponse } from '../../utils/helpers.js';
import { paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';
import { recordSignalAsync } from '../signals/signals.service.js';

const createJournalEntrySchema = z.object({
  date: z.string().datetime().optional(),
  content: z.string().min(1).max(50000),
  mood: z.number().int().min(1).max(10).optional(),
  energy_level: z.number().int().min(1).max(10).optional(),
  sleep_quality: z.number().int().min(1).max(10).optional(),
  tags: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  gratitude: z.array(z.string()).optional(),
});

const updateJournalEntrySchema = createJournalEntrySchema.partial().omit({ date: true });

const journalQuerySchema = paginationSchema.extend({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const humanDesignSchema = z.object({
  type: z.enum(['generator', 'manifesting_generator', 'projector', 'manifestor', 'reflector']),
  authority: z.string().min(1),
  profile: z.string().min(1),
  definition: z.string().min(1),
  centers: z.record(z.boolean()),
  channels: z.array(z.string()),
  gates: z.array(z.number().int()),
  incarnation_cross: z.string().min(1),
  variables: z.record(z.unknown()).optional(),
  birth_data: z.object({
    date: z.string(),
    time: z.string(),
    location: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

const generateReportSchema = z.object({
  report_type: z.enum(['quick', 'standard', 'deep', 'comprehensive']),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
});

const createPsychoAuditSchema = z.object({
  score: z.number().int().min(0).max(100),
  answers: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional(),
  recommendations: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional(),
});

export class AuditController {
  // Journal
  async createJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const input = createJournalEntrySchema.parse(req.body);

      const entry = await auditService.createJournalEntry(userId, workspaceId, input);

      res.status(201).json(successResponse({ entry }));
    } catch (error) {
      next(error);
    }
  }

  async getJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entryId = uuidSchema.parse(req.params.entryId);

      const entry = await auditService.getJournalEntry(entryId);

      res.json(successResponse({ entry }));
    } catch (error) {
      next(error);
    }
  }

  async listJournalEntries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const params = journalQuerySchema.parse(req.query);

      const { entries, total } = await auditService.getJournalEntries(userId, workspaceId, params);

      res.json(paginatedResponse(entries, params, total));
    } catch (error) {
      next(error);
    }
  }

  async updateJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entryId = uuidSchema.parse(req.params.entryId);
      const input = updateJournalEntrySchema.parse(req.body);

      const entry = await auditService.updateJournalEntry(entryId, input);

      res.json(successResponse({ entry }));
    } catch (error) {
      next(error);
    }
  }

  async deleteJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entryId = uuidSchema.parse(req.params.entryId);

      await auditService.deleteJournalEntry(entryId);

      res.json(successResponse({ message: 'Entry deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async getJournalStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const stats = await auditService.getJournalStats(userId, workspaceId);

      res.json(successResponse({ stats }));
    } catch (error) {
      next(error);
    }
  }

  // Human Design
  async createHumanDesign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = humanDesignSchema.parse(req.body);

      const profile = await auditService.createHumanDesignProfile(userId, input);

      res.status(201).json(successResponse({ profile }));
    } catch (error) {
      next(error);
    }
  }

  async getHumanDesign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const profile = await auditService.getHumanDesignProfile(userId);

      res.json(successResponse({ profile }));
    } catch (error) {
      next(error);
    }
  }

  async updateHumanDesign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = humanDesignSchema.partial().parse(req.body);

      const profile = await auditService.updateHumanDesignProfile(userId, input);

      res.json(successResponse({ profile }));
    } catch (error) {
      next(error);
    }
  }

  // Reports
  async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const input = generateReportSchema.parse(req.body);

      const report = await auditService.generateReport(userId, workspaceId, input);

      res.status(201).json(successResponse({ report }));
    } catch (error) {
      next(error);
    }
  }

  async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportId = uuidSchema.parse(req.params.reportId);

      const report = await auditService.getReport(reportId);

      res.json(successResponse({ report }));
    } catch (error) {
      next(error);
    }
  }

  async listReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const params = paginationSchema.parse(req.query);

      const { reports, total } = await auditService.getReports(userId, workspaceId, params);

      res.json(paginatedResponse(reports, params, total));
    } catch (error) {
      next(error);
    }
  }

  async deleteReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportId = uuidSchema.parse(req.params.reportId);

      await auditService.deleteReport(reportId);

      res.json(successResponse({ message: 'Report deleted' }));
    } catch (error) {
      next(error);
    }
  }

  // Psycho Audits
  async listPsychoAudits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const audits = await auditService.listPsychoAudits(workspaceId);
      res.json(successResponse({ data: audits }));
    } catch (error) {
      next(error);
    }
  }

  async createPsychoAudit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const input = createPsychoAuditSchema.parse(req.body);

      // Get previous audit for delta calculation
      const previousAudits = await auditService.listPsychoAudits(workspaceId);
      const previousAudit = previousAudits.length > 0 ? previousAudits[0] : null;

      const audit = await auditService.createPsychoAudit(userId, workspaceId, input);

      // Record behavioral signal
      const previousScore = previousAudit ? (previousAudit as { score: number }).score : null;
      const timeSinceLastDays = previousAudit && (previousAudit as { created_at: Date }).created_at
        ? Math.round((Date.now() - new Date((previousAudit as { created_at: Date }).created_at).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      recordSignalAsync(userId, workspaceId, 'audit_completed', 'psycho_audit', audit.id, {
        score: audit.score,
        previous_score: previousScore,
        delta: previousScore !== null ? audit.score - previousScore : null,
        time_since_last_audit_days: timeSinceLastDays
      });

      res.status(201).json(successResponse({ data: { id: audit.id, score: audit.score, created_at: audit.created_at } }));
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
