"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_js_1 = require("./analytics.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const role_middleware_js_1 = require("../../middleware/role.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication and workspace context
router.use(auth_middleware_js_1.authMiddleware);
// User activity
router.post('/workspace/:workspaceId/activity', workspace_middleware_js_1.workspaceMiddleware, analytics_controller_js_1.analyticsController.logActivity.bind(analytics_controller_js_1.analyticsController));
router.get('/workspace/:workspaceId/activity', workspace_middleware_js_1.workspaceMiddleware, analytics_controller_js_1.analyticsController.getActivityLogs.bind(analytics_controller_js_1.analyticsController));
router.get('/workspace/:workspaceId/activity/summary', workspace_middleware_js_1.workspaceMiddleware, analytics_controller_js_1.analyticsController.getActivitySummary.bind(analytics_controller_js_1.analyticsController));
// User stats
router.get('/workspace/:workspaceId/daily-stats', workspace_middleware_js_1.workspaceMiddleware, analytics_controller_js_1.analyticsController.getDailyStats.bind(analytics_controller_js_1.analyticsController));
router.get('/workspace/:workspaceId/productivity', workspace_middleware_js_1.workspaceMiddleware, analytics_controller_js_1.analyticsController.getProductivityStats.bind(analytics_controller_js_1.analyticsController));
router.post('/workspace/:workspaceId/daily-stats/update', workspace_middleware_js_1.workspaceMiddleware, analytics_controller_js_1.analyticsController.updateDailyStats.bind(analytics_controller_js_1.analyticsController));
// Workspace stats (admin only)
router.get('/workspace/:workspaceId/stats', workspace_middleware_js_1.workspaceMiddleware, (0, role_middleware_js_1.requireRole)(['owner', 'admin']), analytics_controller_js_1.analyticsController.getWorkspaceStats.bind(analytics_controller_js_1.analyticsController));
router.post('/workspace/:workspaceId/stats/update', workspace_middleware_js_1.workspaceMiddleware, (0, role_middleware_js_1.requireRole)(['owner', 'admin']), analytics_controller_js_1.analyticsController.updateWorkspaceStats.bind(analytics_controller_js_1.analyticsController));
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map