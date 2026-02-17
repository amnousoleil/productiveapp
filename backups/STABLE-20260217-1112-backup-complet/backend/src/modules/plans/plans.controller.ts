import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { plansService } from './plans.service.js';
import { successResponse } from '../../utils/helpers.js';
import { uuidSchema } from '../../utils/validation.js';

export class PlansController {
  async getUserPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = uuidSchema.parse(req.params.userId);
      const plan = await plansService.getUserPlan(userId);

      if (!plan) {
        res.status(404).json({ success: false, error: 'Plan not found' });
        return;
      }

      res.json(successResponse({
        plan: {
          tier: plan.plan_tier,
          features: plan.features,
          reports_used: plan.reports_used_this_month,
          reports_limit: plan.reports_limit,
          started_at: plan.started_at,
          expires_at: plan.expires_at
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  async getMyPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const plan = await plansService.getUserPlan(userId);

      res.json(successResponse({
        plan: plan ? {
          tier: plan.plan_tier,
          features: plan.features,
          reports_used: plan.reports_used_this_month,
          reports_limit: plan.reports_limit,
          started_at: plan.started_at,
          expires_at: plan.expires_at
        } : null
      }));
    } catch (error) {
      next(error);
    }
  }

  async getFeaturesByTier(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const configs = plansService.getTierConfigs();
      res.json(successResponse({ tiers: configs }));
    } catch (error) {
      next(error);
    }
  }

  async checkFeature(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const feature = req.params.feature as 'ai_reports' | 'language_analysis' | 'export_pdf';
      const canUse = await plansService.canUseFeature(userId, feature);

      res.json(successResponse({ feature, allowed: canUse }));
    } catch (error) {
      next(error);
    }
  }
}

export const plansController = new PlansController();
