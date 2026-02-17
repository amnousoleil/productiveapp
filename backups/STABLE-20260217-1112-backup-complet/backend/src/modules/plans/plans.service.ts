import { sql } from '../../config/database.js';
import type { UUID } from '../../types/index.js';

export interface UserPlan {
  id: UUID;
  user_id: UUID;
  plan_tier: 'free' | 'starter' | 'premium' | 'unlimited';
  reports_used_this_month: number;
  reports_limit: number;
  features: PlanFeatures;
  started_at: Date;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PlanFeatures {
  ai_reports: boolean;
  language_analysis: boolean;
  export_pdf: boolean;
  history_days: number;
}

const TIER_CONFIGS: Record<string, { reports_limit: number; features: PlanFeatures }> = {
  free: {
    reports_limit: 0,
    features: { ai_reports: false, language_analysis: false, export_pdf: false, history_days: 30 }
  },
  starter: {
    reports_limit: 4,
    features: { ai_reports: true, language_analysis: false, export_pdf: false, history_days: 30 }
  },
  premium: {
    reports_limit: 30,
    features: { ai_reports: true, language_analysis: true, export_pdf: false, history_days: 90 }
  },
  unlimited: {
    reports_limit: -1,
    features: { ai_reports: true, language_analysis: true, export_pdf: true, history_days: -1 }
  }
};

export class PlansService {
  async getUserPlan(userId: UUID): Promise<UserPlan | null> {
    const plans = await sql`
      SELECT * FROM user_plans WHERE user_id = ${userId}
    `;

    if (plans.length === 0) {
      // Auto-create free plan for user
      const newPlan = await this.createFreePlan(userId);
      return newPlan;
    }

    return plans[0] as UserPlan;
  }

  async createFreePlan(userId: UUID): Promise<UserPlan> {
    const config = TIER_CONFIGS.free;
    const plans = await sql`
      INSERT INTO user_plans (user_id, plan_tier, reports_limit, features)
      VALUES (${userId}, 'free', ${config.reports_limit}, ${JSON.stringify(config.features)})
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    `;

    if (plans.length === 0) {
      const existing = await sql`SELECT * FROM user_plans WHERE user_id = ${userId}`;
      return existing[0] as UserPlan;
    }

    return plans[0] as UserPlan;
  }

  async canUseFeature(userId: UUID, feature: keyof PlanFeatures): Promise<boolean> {
    const plan = await this.getUserPlan(userId);
    if (!plan) return false;

    const features = plan.features as PlanFeatures;

    if (feature === 'ai_reports') {
      if (!features.ai_reports) return false;
      // Check monthly limit
      if (plan.reports_limit === -1) return true; // unlimited
      return plan.reports_used_this_month < plan.reports_limit;
    }

    return features[feature] as boolean;
  }

  async incrementReportUsage(userId: UUID): Promise<{ success: boolean; remaining: number }> {
    const plan = await this.getUserPlan(userId);
    if (!plan) return { success: false, remaining: 0 };

    if (plan.reports_limit === -1) {
      return { success: true, remaining: -1 }; // unlimited
    }

    if (plan.reports_used_this_month >= plan.reports_limit) {
      return { success: false, remaining: 0 };
    }

    await sql`
      UPDATE user_plans
      SET reports_used_this_month = reports_used_this_month + 1,
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    const remaining = plan.reports_limit - plan.reports_used_this_month - 1;
    return { success: true, remaining };
  }

  async resetMonthlyUsage(): Promise<number> {
    const result = await sql`
      UPDATE user_plans
      SET reports_used_this_month = 0, updated_at = NOW()
      WHERE reports_used_this_month > 0
    `;
    return result.count;
  }

  getTierConfigs() {
    return TIER_CONFIGS;
  }
}

export const plansService = new PlansService();
