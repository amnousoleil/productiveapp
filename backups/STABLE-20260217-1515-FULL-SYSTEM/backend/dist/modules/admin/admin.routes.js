"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_service_js_1 = require("./admin.service.js");
const admin_controller_extended_js_1 = require("./admin.controller.extended.js");
const admin_middleware_js_1 = require("./admin.middleware.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const pool_js_1 = __importDefault(require("../accounting/pool.js"));
const health_check_service_js_1 = require("./services/health-check.service.js");
const system_alert_service_js_1 = require("./services/system-alert.service.js");
const admin_dashboard_service_js_1 = require("./services/admin-dashboard.service.js");
const frontend_errors_service_js_1 = require("./services/frontend-errors.service.js");
const analytics_service_js_1 = require("./services/analytics.service.js");
const error_log_service_js_1 = require("./services/error-log.service.js");
const request_tracker_middleware_js_1 = require("../../middleware/request-tracker.middleware.js");
const router = (0, express_1.Router)();
// Initialize services
const adminService = new admin_service_js_1.AdminService(pool_js_1.default);
const healthCheckService = new health_check_service_js_1.HealthCheckService(pool_js_1.default);
const systemAlertService = new system_alert_service_js_1.SystemAlertService(pool_js_1.default);
const frontendErrorsService = new frontend_errors_service_js_1.FrontendErrorsService(pool_js_1.default);
const analyticsService = new analytics_service_js_1.AnalyticsService(pool_js_1.default);
const errorLogService = new error_log_service_js_1.ErrorLogService(pool_js_1.default);
// Dashboard service aggregates all specialized services
const dashboardService = new admin_dashboard_service_js_1.AdminDashboardService(pool_js_1.default, request_tracker_middleware_js_1.apiMetricsService, errorLogService, healthCheckService, systemAlertService);
const adminController = new admin_controller_extended_js_1.AdminControllerExtended(adminService, dashboardService, frontendErrorsService, analyticsService);
// All admin routes require authentication AND super-admin status
router.use(auth_middleware_js_1.authMiddleware);
router.use(admin_middleware_js_1.requireSuperAdmin);
// ===== EXISTING ROUTES =====
// GET /api/v1/admin/health - System health check
router.get('/health', adminController.getHealth);
// GET /api/v1/admin/stats - System statistics
router.get('/stats', adminController.getStats);
// GET /api/v1/admin/members/activity - Member activity overview
router.get('/members/activity', adminController.getMemberActivity);
// GET /api/v1/admin/activity/recent - Recent activity log
router.get('/activity/recent', adminController.getRecentActivity);
// API Metrics
router.get('/metrics/api', adminController.getAPIMetrics);
router.get('/metrics/top-endpoints', adminController.getTopEndpoints);
// ===== NEW FRONTEND ERRORS ROUTES =====
// GET /api/v1/admin/frontend-errors - Liste des erreurs frontend
router.get('/frontend-errors', adminController.getFrontendErrors);
// GET /api/v1/admin/frontend-errors/stats - Statistiques erreurs frontend
router.get('/frontend-errors/stats', adminController.getFrontendErrorStats);
// POST /api/v1/admin/frontend-errors/:id/resolve - Marquer erreur comme résolue
router.post('/frontend-errors/:id/resolve', adminController.resolveFrontendError);
// DELETE /api/v1/admin/frontend-errors/:id - Supprimer erreur
router.delete('/frontend-errors/:id', adminController.deleteFrontendError);
// GET /api/v1/admin/frontend-errors/export - Export CSV
router.get('/frontend-errors/export', adminController.exportFrontendErrorsCSV);
// ===== NEW ANALYTICS ROUTES =====
// GET /api/v1/admin/analytics/pages - Pages les plus visitées
router.get('/analytics/pages', adminController.getTopPages);
// GET /api/v1/admin/analytics/features - Features les plus utilisées
router.get('/analytics/features', adminController.getTopFeatures);
// GET /api/v1/admin/analytics/user-activity - Activité utilisateurs
router.get('/analytics/user-activity', adminController.getUserActivityStats);
// GET /api/v1/admin/analytics/feature-engagement - Taux adoption features
router.get('/analytics/feature-engagement', adminController.getFeatureEngagement);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map