"use strict";
/**
 * MONITORING ROUTES
 * API routes for frontend error monitoring
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const monitoring_controller_js_1 = require("./monitoring.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// Log error (POST)
router.post('/errors/log', (req, res) => monitoring_controller_js_1.monitoringController.logError(req, res));
// Get errors (GET with filters)
router.get('/errors', (req, res) => monitoring_controller_js_1.monitoringController.getErrors(req, res));
// Get stats
router.get('/stats', (req, res) => monitoring_controller_js_1.monitoringController.getStats(req, res));
// Export CSV
router.get('/errors/export/csv', (req, res) => monitoring_controller_js_1.monitoringController.exportCSV(req, res));
// Get single error by ID
router.get('/errors/:id', (req, res) => monitoring_controller_js_1.monitoringController.getErrorById(req, res));
// Resolve error
router.post('/errors/:id/resolve', (req, res) => monitoring_controller_js_1.monitoringController.resolveError(req, res));
exports.default = router;
//# sourceMappingURL=monitoring.routes.js.map