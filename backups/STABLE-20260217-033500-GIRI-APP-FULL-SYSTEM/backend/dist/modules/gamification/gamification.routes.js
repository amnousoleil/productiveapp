"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gamification_controller_js_1 = require("./gamification.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication and workspace context
router.use(auth_middleware_js_1.authMiddleware);
// User profile & stats
router.get('/workspace/:workspaceId/profile', workspace_middleware_js_1.workspaceMiddleware, gamification_controller_js_1.gamificationController.getProfile.bind(gamification_controller_js_1.gamificationController));
router.get('/workspace/:workspaceId/stats', workspace_middleware_js_1.workspaceMiddleware, gamification_controller_js_1.gamificationController.getMyStats.bind(gamification_controller_js_1.gamificationController));
router.post('/workspace/:workspaceId/xp', workspace_middleware_js_1.workspaceMiddleware, gamification_controller_js_1.gamificationController.addXp.bind(gamification_controller_js_1.gamificationController));
router.get('/workspace/:workspaceId/xp-history', workspace_middleware_js_1.workspaceMiddleware, gamification_controller_js_1.gamificationController.getXpHistory.bind(gamification_controller_js_1.gamificationController));
// Badges
router.get('/workspace/:workspaceId/badges', workspace_middleware_js_1.workspaceMiddleware, gamification_controller_js_1.gamificationController.getBadges.bind(gamification_controller_js_1.gamificationController));
// Leaderboard
router.get('/workspace/:workspaceId/leaderboard', workspace_middleware_js_1.workspaceMiddleware, gamification_controller_js_1.gamificationController.getLeaderboard.bind(gamification_controller_js_1.gamificationController));
// Achievements
router.get('/workspace/:workspaceId/achievements', workspace_middleware_js_1.workspaceMiddleware, gamification_controller_js_1.gamificationController.getAchievements.bind(gamification_controller_js_1.gamificationController));
router.post('/workspace/:workspaceId/achievements/check', workspace_middleware_js_1.workspaceMiddleware, gamification_controller_js_1.gamificationController.checkAchievements.bind(gamification_controller_js_1.gamificationController));
// Streaks
router.get('/workspace/:workspaceId/streaks', workspace_middleware_js_1.workspaceMiddleware, gamification_controller_js_1.gamificationController.getStreaks.bind(gamification_controller_js_1.gamificationController));
router.post('/workspace/:workspaceId/streaks', workspace_middleware_js_1.workspaceMiddleware, gamification_controller_js_1.gamificationController.updateStreak.bind(gamification_controller_js_1.gamificationController));
exports.default = router;
//# sourceMappingURL=gamification.routes.js.map