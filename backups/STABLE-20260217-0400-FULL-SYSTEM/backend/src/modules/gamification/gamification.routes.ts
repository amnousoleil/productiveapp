import { Router } from 'express';
import { gamificationController } from './gamification.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication and workspace context
router.use(authMiddleware);

// User profile & stats
router.get('/workspace/:workspaceId/profile', workspaceMiddleware, gamificationController.getProfile.bind(gamificationController));
router.get('/workspace/:workspaceId/stats', workspaceMiddleware, gamificationController.getMyStats.bind(gamificationController));
router.post('/workspace/:workspaceId/xp', workspaceMiddleware, gamificationController.addXp.bind(gamificationController));
router.get('/workspace/:workspaceId/xp-history', workspaceMiddleware, gamificationController.getXpHistory.bind(gamificationController));

// Badges
router.get('/workspace/:workspaceId/badges', workspaceMiddleware, gamificationController.getBadges.bind(gamificationController));

// Leaderboard
router.get('/workspace/:workspaceId/leaderboard', workspaceMiddleware, gamificationController.getLeaderboard.bind(gamificationController));

// Achievements
router.get('/workspace/:workspaceId/achievements', workspaceMiddleware, gamificationController.getAchievements.bind(gamificationController));
router.post('/workspace/:workspaceId/achievements/check', workspaceMiddleware, gamificationController.checkAchievements.bind(gamificationController));

// Streaks
router.get('/workspace/:workspaceId/streaks', workspaceMiddleware, gamificationController.getStreaks.bind(gamificationController));
router.post('/workspace/:workspaceId/streaks', workspaceMiddleware, gamificationController.updateStreak.bind(gamificationController));

export default router;
