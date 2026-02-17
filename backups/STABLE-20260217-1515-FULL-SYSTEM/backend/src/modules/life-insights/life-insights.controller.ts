// =============================================
// PRODUCTIVEAPP - LIFE INSIGHTS CONTROLLER
// Contrôleur HTTP pour Life Insights
// =============================================

import { Request, Response } from 'express';
import { LifeInsightsService } from './life-insights.service.js';
import { LifeInsightsAIService } from './life-insights.ai.service.js';
import { CreateActivityLogDto, TimelineQuery, ActivityStatsQuery, AnalyzeUserRequest } from './life-insights.types.js';

export class LifeInsightsController {
  // ==================== Activity Logging ====================

  /**
   * POST /api/v1/life-insights/activities
   * Enregistre une nouvelle activité
   */
  static async logActivity(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const dto: CreateActivityLogDto = {
        user_id: userId,
        member_id: req.body.member_id,
        action_type: req.body.action_type,
        entity_type: req.body.entity_type,
        entity_id: req.body.entity_id,
        action_label: req.body.action_label,
        metadata: req.body.metadata,
        session_id: req.body.session_id,
        device_info: req.body.device_info || {
          user_agent: req.headers['user-agent'],
        },
        ip_address: req.ip,
        duration_seconds: req.body.duration_seconds,
      };

      const activity = await LifeInsightsService.logActivity(dto);

      return res.status(201).json(activity);
    } catch (error: any) {
      console.error('Error logging activity:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/life-insights/activities
   * Récupère les activités de l'utilisateur
   */
  static async getActivities(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const query: TimelineQuery = {
        user_id: userId,
        member_id: req.query.member_id as string,
        start_date: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
        end_date: req.query.end_date ? new Date(req.query.end_date as string) : undefined,
        action_types: req.query.action_types ? (req.query.action_types as string).split(',') as any : undefined,
        entity_types: req.query.entity_types ? (req.query.entity_types as string).split(',') as any : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      };

      const activities = await LifeInsightsService.getActivities(query);

      return res.json(activities);
    } catch (error: any) {
      console.error('Error getting activities:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // ==================== Statistics ====================

  /**
   * GET /api/v1/life-insights/stats
   * Récupère les statistiques d'activité
   */
  static async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const query: ActivityStatsQuery = {
        user_id: userId,
        member_id: req.query.member_id as string,
        period: (req.query.period as any) || 'month',
      };

      const stats = await LifeInsightsService.getActivityStats(query);

      return res.json(stats);
    } catch (error: any) {
      console.error('Error getting stats:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/life-insights/stats/hourly
   * Récupère la distribution horaire
   */
  static async getHourlyDistribution(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const distribution = await LifeInsightsService.getHourlyDistribution(userId, days);

      return res.json(distribution);
    } catch (error: any) {
      console.error('Error getting hourly distribution:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/life-insights/stats/daily
   * Récupère les tendances quotidiennes
   */
  static async getDailyTrends(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const trends = await LifeInsightsService.getDailyTrends(userId, days);

      return res.json(trends);
    } catch (error: any) {
      console.error('Error getting daily trends:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // ==================== Insights ====================

  /**
   * GET /api/v1/life-insights/insights
   * Récupère les insights comportementaux
   */
  static async getInsights(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const memberId = req.query.member_id as string;
      const insights = await LifeInsightsService.getInsights(userId, memberId);

      return res.json(insights);
    } catch (error: any) {
      console.error('Error getting insights:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/v1/life-insights/insights/:id/read
   * Marque un insight comme lu
   */
  static async markInsightAsRead(req: Request, res: Response) {
    try {
      const insightId = parseInt(req.params.id);
      await LifeInsightsService.markInsightAsRead(insightId);

      return res.json({ success: true });
    } catch (error: any) {
      console.error('Error marking insight as read:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // ==================== Patterns ====================

  /**
   * GET /api/v1/life-insights/patterns
   * Récupère les patterns détectés
   */
  static async getPatterns(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const memberId = req.query.member_id as string;
      const patterns = await LifeInsightsService.getPatterns(userId, memberId);

      return res.json(patterns);
    } catch (error: any) {
      console.error('Error getting patterns:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // ==================== Psychological Profile ====================

  /**
   * GET /api/v1/life-insights/profile
   * Récupère le profil psychologique
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const memberId = req.query.member_id as string;
      const profile = await LifeInsightsService.getProfile(userId, memberId);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found. Run analysis first.' });
      }

      return res.json(profile);
    } catch (error: any) {
      console.error('Error getting profile:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // ==================== AI Analysis ====================

  /**
   * POST /api/v1/life-insights/analyze
   * Lance une analyse complète de l'utilisateur
   */
  static async analyzeUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const request: AnalyzeUserRequest = {
        user_id: userId,
        member_id: req.body.member_id,
        analysis_type: req.body.analysis_type || 'full',
        days_to_analyze: req.body.days_to_analyze || 30,
        regenerate: req.body.regenerate || false,
      };

      const result = await LifeInsightsAIService.analyzeUser(request);

      return res.json(result);
    } catch (error: any) {
      console.error('Error analyzing user:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // ==================== Daily Snapshots ====================

  /**
   * GET /api/v1/life-insights/snapshots/today
   * Récupère le snapshot du jour
   */
  static async getTodaySnapshot(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const memberId = req.query.member_id as string;
      const snapshot = await LifeInsightsService.getTodaySnapshot(userId, memberId);

      if (!snapshot) {
        return res.status(404).json({ error: 'No snapshot for today yet' });
      }

      return res.json(snapshot);
    } catch (error: any) {
      console.error('Error getting today snapshot:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // ==================== Export ====================

  /**
   * GET /api/v1/life-insights/export
   * Exporte toutes les données Life Insights
   */
  static async exportData(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const memberId = req.query.member_id as string;
      const data = await LifeInsightsService.exportUserData(userId, memberId);

      return res.json(data);
    } catch (error: any) {
      console.error('Error exporting data:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}
