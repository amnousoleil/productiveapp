import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// All routes require authentication and workspace context
router.use(authMiddleware);

// User activity
router.post('/workspace/:workspaceId/activity', workspaceMiddleware, analyticsController.logActivity.bind(analyticsController));
router.get('/workspace/:workspaceId/activity', workspaceMiddleware, analyticsController.getActivityLogs.bind(analyticsController));
router.get('/workspace/:workspaceId/activity/summary', workspaceMiddleware, analyticsController.getActivitySummary.bind(analyticsController));

// User stats
router.get('/workspace/:workspaceId/daily-stats', workspaceMiddleware, analyticsController.getDailyStats.bind(analyticsController));
router.get('/workspace/:workspaceId/productivity', workspaceMiddleware, analyticsController.getProductivityStats.bind(analyticsController));
router.post('/workspace/:workspaceId/daily-stats/update', workspaceMiddleware, analyticsController.updateDailyStats.bind(analyticsController));

// Workspace stats (admin only)
router.get('/workspace/:workspaceId/stats', workspaceMiddleware, requireRole(['owner', 'admin']), analyticsController.getWorkspaceStats.bind(analyticsController));
router.post('/workspace/:workspaceId/stats/update', workspaceMiddleware, requireRole(['owner', 'admin']), analyticsController.updateWorkspaceStats.bind(analyticsController));

export default router;
