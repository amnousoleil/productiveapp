import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import type { AddXpInput } from './gamification.types.js';
import { gamificationService } from './gamification.service.js';
import { successResponse } from '../../utils/helpers.js';
import { z } from 'zod';
import { recordSignalAsync } from '../signals/signals.service.js';

const addXpSchema = z.object({
  amount: z.number().int().min(1).max(10000),
  reason: z.enum([
    'note_created', 'note_updated', 'task_created', 'task_completed', 'task_early',
    'streak_bonus', 'achievement', 'message_sent', 'login_bonus', 'daily_goal',
    'weekly_goal', 'report_generated', 'audit_completed'
  ]),
  entity_type: z.enum(['note', 'task', 'message', 'canvas', 'project', 'workspace', 'report', 'audit']).optional(),
  entity_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const leaderboardSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'alltime']).default('weekly'),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const streakTypeSchema = z.object({
  type: z.enum(['daily_login', 'daily_note', 'daily_task', 'weekly_goal']),
});

export class GamificationController {
  /**
   * GET /gamification/workspace/:workspaceId/profile
   * Profil complet avec stats, badges et streaks
   */
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const [stats, achievements, streaks] = await Promise.all([
        gamificationService.getUserStats(userId, workspaceId),
        gamificationService.getAchievements(userId, workspaceId),
        gamificationService.getStreaks(userId, workspaceId),
      ]);

      const unlockedBadges = achievements.filter(a => a.unlocked);
      const nextBadges = achievements.filter(a => !a.unlocked).slice(0, 3);

      res.json(successResponse({
        profile: {
          ...stats,
          badges_count: unlockedBadges.length,
          total_badges: achievements.length,
          recent_badges: unlockedBadges.slice(0, 5),
          next_badges: nextBadges,
          streaks,
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /gamification/workspace/:workspaceId/badges
   * Liste des badges du user
   */
  async getBadges(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const achievements = await gamificationService.getAchievements(userId, workspaceId);
      const unlocked = achievements.filter(a => a.unlocked);
      const locked = achievements.filter(a => !a.unlocked);

      res.json(successResponse({
        badges: {
          unlocked,
          locked,
          total: achievements.length,
          unlocked_count: unlocked.length,
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  async getMyStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const stats = await gamificationService.getUserStats(userId, workspaceId);

      res.json(successResponse({ stats }));
    } catch (error) {
      next(error);
    }
  }

  async addXp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const input = addXpSchema.parse(req.body);

      const result = await gamificationService.addXp(userId, workspaceId, input as AddXpInput);

      // Record behavioral signal
      recordSignalAsync(userId, workspaceId, 'xp_earned', 'gamification', null, {
        amount: input.amount,
        reason: input.reason,
        leveled_up: result.leveled_up,
        new_level: result.new_level
      });

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getXpHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const limit = parseInt(req.query.limit as string) || 50;

      const events = await gamificationService.getXpHistory(userId, workspaceId, limit);

      res.json(successResponse({ events }));
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const { period, limit } = leaderboardSchema.parse(req.query);

      const leaderboard = await gamificationService.getLeaderboard(workspaceId, period, limit);

      res.json(successResponse({ leaderboard }));
    } catch (error) {
      next(error);
    }
  }

  async getAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const achievements = await gamificationService.getAchievements(userId, workspaceId);

      res.json(successResponse({ achievements }));
    } catch (error) {
      next(error);
    }
  }

  async getStreaks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const streaks = await gamificationService.getStreaks(userId, workspaceId);

      res.json(successResponse({ streaks }));
    } catch (error) {
      next(error);
    }
  }

  async updateStreak(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const { type } = streakTypeSchema.parse(req.body);

      const streak = await gamificationService.updateStreak(userId, workspaceId, type);

      res.json(successResponse({ streak }));
    } catch (error) {
      next(error);
    }
  }

  async checkAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const unlocked = await gamificationService.checkAchievements(userId, workspaceId);

      res.json(successResponse({ unlocked_achievements: unlocked }));
    } catch (error) {
      next(error);
    }
  }
}

export const gamificationController = new GamificationController();
