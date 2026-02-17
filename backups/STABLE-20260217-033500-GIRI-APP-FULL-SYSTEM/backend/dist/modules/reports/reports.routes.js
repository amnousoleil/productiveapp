"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_js_1 = require("./reports.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// List reports
router.get('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, reports_controller_js_1.reportsController.getReports.bind(reports_controller_js_1.reportsController));
// Get summary
router.get('/workspace/:workspaceId/summary', workspace_middleware_js_1.workspaceMiddleware, reports_controller_js_1.reportsController.getSummary.bind(reports_controller_js_1.reportsController));
// Generate report
router.post('/workspace/:workspaceId/generate', workspace_middleware_js_1.workspaceMiddleware, reports_controller_js_1.reportsController.generateReport.bind(reports_controller_js_1.reportsController));
// Get single report (must be after other routes to avoid conflicts)
router.get('/workspace/:workspaceId/:reportId', workspace_middleware_js_1.workspaceMiddleware, reports_controller_js_1.reportsController.getReportById.bind(reports_controller_js_1.reportsController));
exports.default = router;
//# sourceMappingURL=reports.routes.js.map