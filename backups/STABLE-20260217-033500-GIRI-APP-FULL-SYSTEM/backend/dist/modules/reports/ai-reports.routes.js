"use strict";
/**
 * AI Reports Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_reports_controller_js_1 = require("./ai-reports.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const rateLimit_middleware_js_1 = require("../../middleware/rateLimit.middleware.js");
const constants_js_1 = require("../../config/constants.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// Rate limiter for AI reports (uses AI under the hood)
const aiReportLimiter = (0, rateLimit_middleware_js_1.createRateLimiter)({
    windowMs: constants_js_1.RATE_LIMITS.AI.windowMs,
    max: constants_js_1.RATE_LIMITS.AI.max,
    keyPrefix: 'ai-reports',
});
// POST /api/v1/reports/ai/generate - Generate new AI report
router.post('/generate', aiReportLimiter, ai_reports_controller_js_1.aiReportsController.generate.bind(ai_reports_controller_js_1.aiReportsController));
// POST /api/v1/reports/ai/meta-synthesis - Generate meta-synthesis
router.post('/meta-synthesis', aiReportLimiter, ai_reports_controller_js_1.aiReportsController.metaSynthesis.bind(ai_reports_controller_js_1.aiReportsController));
// GET /api/v1/reports/ai - List AI reports
router.get('/', ai_reports_controller_js_1.aiReportsController.list.bind(ai_reports_controller_js_1.aiReportsController));
// GET /api/v1/reports/ai/visualizations - Get chart data
router.get('/visualizations', ai_reports_controller_js_1.aiReportsController.visualizations.bind(ai_reports_controller_js_1.aiReportsController));
// GET /api/v1/reports/ai/:reportId - Get single report
router.get('/:reportId', ai_reports_controller_js_1.aiReportsController.getById.bind(ai_reports_controller_js_1.aiReportsController));
exports.default = router;
//# sourceMappingURL=ai-reports.routes.js.map