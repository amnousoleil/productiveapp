"use strict";
/**
 * AI Routes - Rate limited to prevent API key abuse
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_js_1 = require("./ai.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const rateLimit_middleware_js_1 = require("../../middleware/rateLimit.middleware.js");
const constants_js_1 = require("../../config/constants.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// AI-specific rate limiter
const aiRateLimiter = (0, rateLimit_middleware_js_1.createRateLimiter)({
    windowMs: constants_js_1.RATE_LIMITS.AI.windowMs,
    max: constants_js_1.RATE_LIMITS.AI.max,
    keyPrefix: 'ai',
});
// POST /api/v1/ai/generate - Generate AI content
router.post('/generate', aiRateLimiter, ai_controller_js_1.aiController.generate.bind(ai_controller_js_1.aiController));
// POST /api/v1/ai/chat - Chatbot with smart routing
router.post('/chat', aiRateLimiter, ai_controller_js_1.aiController.chat.bind(ai_controller_js_1.aiController));
// POST /api/v1/ai/correct - Correct text (spell check)
router.post('/correct', aiRateLimiter, ai_controller_js_1.aiController.correct.bind(ai_controller_js_1.aiController));
exports.default = router;
//# sourceMappingURL=ai.routes.js.map