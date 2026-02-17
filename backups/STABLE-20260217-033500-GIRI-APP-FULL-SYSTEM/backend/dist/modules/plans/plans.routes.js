"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plans_controller_js_1 = require("./plans.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// Get current user's plan
router.get('/me', plans_controller_js_1.plansController.getMyPlan.bind(plans_controller_js_1.plansController));
// Get plan by user ID (admin use)
router.get('/user/:userId', plans_controller_js_1.plansController.getUserPlan.bind(plans_controller_js_1.plansController));
// Get all tier configurations
router.get('/features', plans_controller_js_1.plansController.getFeaturesByTier.bind(plans_controller_js_1.plansController));
// Check if current user can use a specific feature
router.get('/check/:feature', plans_controller_js_1.plansController.checkFeature.bind(plans_controller_js_1.plansController));
exports.default = router;
//# sourceMappingURL=plans.routes.js.map