"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plansController = exports.PlansController = void 0;
const plans_service_js_1 = require("./plans.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
class PlansController {
    async getUserPlan(req, res, next) {
        try {
            const userId = validation_js_1.uuidSchema.parse(req.params.userId);
            const plan = await plans_service_js_1.plansService.getUserPlan(userId);
            if (!plan) {
                res.status(404).json({ success: false, error: 'Plan not found' });
                return;
            }
            res.json((0, helpers_js_1.successResponse)({
                plan: {
                    tier: plan.plan_tier,
                    features: plan.features,
                    reports_used: plan.reports_used_this_month,
                    reports_limit: plan.reports_limit,
                    started_at: plan.started_at,
                    expires_at: plan.expires_at
                }
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMyPlan(req, res, next) {
        try {
            const userId = req.user.id;
            const plan = await plans_service_js_1.plansService.getUserPlan(userId);
            res.json((0, helpers_js_1.successResponse)({
                plan: plan ? {
                    tier: plan.plan_tier,
                    features: plan.features,
                    reports_used: plan.reports_used_this_month,
                    reports_limit: plan.reports_limit,
                    started_at: plan.started_at,
                    expires_at: plan.expires_at
                } : null
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async getFeaturesByTier(_req, res, next) {
        try {
            const configs = plans_service_js_1.plansService.getTierConfigs();
            res.json((0, helpers_js_1.successResponse)({ tiers: configs }));
        }
        catch (error) {
            next(error);
        }
    }
    async checkFeature(req, res, next) {
        try {
            const userId = req.user.id;
            const feature = req.params.feature;
            const canUse = await plans_service_js_1.plansService.canUseFeature(userId, feature);
            res.json((0, helpers_js_1.successResponse)({ feature, allowed: canUse }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PlansController = PlansController;
exports.plansController = new PlansController();
//# sourceMappingURL=plans.controller.js.map