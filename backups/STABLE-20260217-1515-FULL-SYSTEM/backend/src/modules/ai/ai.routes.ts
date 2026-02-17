/**
 * AI Routes - Rate limited to prevent API key abuse
 */

import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { createRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { RATE_LIMITS } from '../../config/constants.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// AI-specific rate limiter
const aiRateLimiter = createRateLimiter({
  windowMs: RATE_LIMITS.AI.windowMs,
  max: RATE_LIMITS.AI.max,
  keyPrefix: 'ai',
});

// POST /api/v1/ai/generate - Generate AI content
router.post('/generate', aiRateLimiter, aiController.generate.bind(aiController));

// POST /api/v1/ai/chat - Chatbot with smart routing
router.post('/chat', aiRateLimiter, aiController.chat.bind(aiController));

// POST /api/v1/ai/correct - Correct text (spell check)
router.post('/correct', aiRateLimiter, aiController.correct.bind(aiController));

export default router;
