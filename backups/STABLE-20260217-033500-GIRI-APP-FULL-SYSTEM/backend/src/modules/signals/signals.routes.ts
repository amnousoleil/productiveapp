import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import * as SignalsController from './signals.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /signals/user/:userId - List signals with filters
router.get('/user/:userId', SignalsController.getSignals);

// GET /signals/user/:userId/stats - Aggregated stats
router.get('/user/:userId/stats', SignalsController.getSignalStats);

// GET /signals/user/:userId/profile - Computed behavioral profile (requires ?workspaceId=)
router.get('/user/:userId/profile', SignalsController.getBehavioralProfile);

// GET /signals/user/:userId/summary - Simple profile summary (legacy)
router.get('/user/:userId/summary', SignalsController.getProfile);

// POST /signals - Create signal manually (for debug)
router.post('/', SignalsController.createSignal);

export default router;
