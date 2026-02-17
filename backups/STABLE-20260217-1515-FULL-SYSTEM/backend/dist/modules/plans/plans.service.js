"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plansService = exports.PlansService = void 0;
const database_js_1 = require("../../config/database.js");
const TIER_CONFIGS = {
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
class PlansService {
    async getUserPlan(userId) {
        const plans = await (0, database_js_1.sql) `
      SELECT * FROM user_plans WHERE user_id = ${userId}
    `;
        if (plans.length === 0) {
            // Auto-create free plan for user
            const newPlan = await this.createFreePlan(userId);
            return newPlan;
        }
        return plans[0];
    }
    async createFreePlan(userId) {
        const config = TIER_CONFIGS.free;
        const plans = await (0, database_js_1.sql) `
      INSERT INTO user_plans (user_id, plan_tier, reports_limit, features)
      VALUES (${userId}, 'free', ${config.reports_limit}, ${JSON.stringify(config.features)})
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    `;
        if (plans.length === 0) {
            const existing = await (0, database_js_1.sql) `SELECT * FROM user_plans WHERE user_id = ${userId}`;
            return existing[0];
        }
        return plans[0];
    }
    async canUseFeature(userId, feature) {
        const plan = await this.getUserPlan(userId);
        if (!plan)
            return false;
        const features = plan.features;
        if (feature === 'ai_reports') {
            if (!features.ai_reports)
                return false;
            // Check monthly limit
            if (plan.reports_limit === -1)
                return true; // unlimited
            return plan.reports_used_this_month < plan.reports_limit;
        }
        return features[feature];
    }
    async incrementReportUsage(userId) {
        const plan = await this.getUserPlan(userId);
        if (!plan)
            return { success: false, remaining: 0 };
        if (plan.reports_limit === -1) {
            return { success: true, remaining: -1 }; // unlimited
        }
        if (plan.reports_used_this_month >= plan.reports_limit) {
            return { success: false, remaining: 0 };
        }
        await (0, database_js_1.sql) `
      UPDATE user_plans
      SET reports_used_this_month = reports_used_this_month + 1,
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;
        const remaining = plan.reports_limit - plan.reports_used_this_month - 1;
        return { success: true, remaining };
    }
    async resetMonthlyUsage() {
        const result = await (0, database_js_1.sql) `
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
exports.PlansService = PlansService;
exports.plansService = new PlansService();
//# sourceMappingURL=plans.service.js.map