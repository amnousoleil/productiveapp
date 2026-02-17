import { Router } from 'express';
import * as ctrl from './notifications.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

router.get('/preferences', ctrl.getPreferences);
router.put('/preferences', ctrl.updatePreferences);
router.get('/history', ctrl.getHistory);
router.post('/test', ctrl.testNotification);
router.post('/subscribe', ctrl.subscribe);
router.post('/unsubscribe', ctrl.unsubscribe);

// AI-powered smart reminders
router.get('/ai/analyze', ctrl.aiAnalyzeAndGenerate);
router.post('/ai/generate-reminders', ctrl.aiGenerateReminders);

export default router;
