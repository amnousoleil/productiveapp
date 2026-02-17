import { Router } from 'express';
import { timeEntriesController } from './time-entries.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// All time entry routes are workspace-scoped
// Mounted at: /api/v1/time/workspace/:workspaceId
router.use('/workspace/:workspaceId', workspaceMiddleware);

// --- Collection routes ---
router.post('/workspace/:workspaceId', timeEntriesController.createEntry.bind(timeEntriesController));
router.get('/workspace/:workspaceId', timeEntriesController.listEntries.bind(timeEntriesController));

// --- Special queries (must come before /:id to avoid param conflicts) ---
router.get('/workspace/:workspaceId/running', timeEntriesController.getRunningEntry.bind(timeEntriesController));
router.get('/workspace/:workspaceId/summary/weekly', timeEntriesController.getWeeklySummary.bind(timeEntriesController));
router.get('/workspace/:workspaceId/summary/monthly', timeEntriesController.getMonthlySummary.bind(timeEntriesController));

// --- Member rates ---
router.get('/workspace/:workspaceId/rates/:memberId', timeEntriesController.getMemberRate.bind(timeEntriesController));
router.put('/workspace/:workspaceId/rates/:memberId', timeEntriesController.setMemberRate.bind(timeEntriesController));

// --- Individual entry routes ---
router.get('/workspace/:workspaceId/:id', timeEntriesController.getEntry.bind(timeEntriesController));
router.put('/workspace/:workspaceId/:id', timeEntriesController.updateEntry.bind(timeEntriesController));
router.delete('/workspace/:workspaceId/:id', timeEntriesController.deleteEntry.bind(timeEntriesController));
router.post('/workspace/:workspaceId/:id/stop', timeEntriesController.stopEntry.bind(timeEntriesController));

export default router;
