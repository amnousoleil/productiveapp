/**
 * AI Reports Routes
 */

import { Router } from 'express';
import { aiReportsController } from './ai-reports.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { createRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { RATE_LIMITS } from '../../config/constants.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Rate limiter for AI reports (uses AI under the hood)
const aiReportLimiter = createRateLimiter({
  windowMs: RATE_LIMITS.AI.windowMs,
  max: RATE_LIMITS.AI.max,
  keyPrefix: 'ai-reports',
});

// POST /api/v1/reports/ai/generate - Generate new AI report
router.post('/generate', aiReportLimiter, aiReportsController.generate.bind(aiReportsController));

// POST /api/v1/reports/ai/meta-synthesis - Generate meta-synthesis
router.post('/meta-synthesis', aiReportLimiter, aiReportsController.metaSynthesis.bind(aiReportsController));

// GET /api/v1/reports/ai - List AI reports
router.get('/', aiReportsController.list.bind(aiReportsController));

// GET /api/v1/reports/ai/visualizations - Get chart data
router.get('/visualizations', aiReportsController.visualizations.bind(aiReportsController));

// GET /api/v1/reports/ai/:reportId - Get single report
router.get('/:reportId', aiReportsController.getById.bind(aiReportsController));

export default router;
