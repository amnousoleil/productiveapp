import { Router } from 'express';
import { AdminService } from './admin.service.js';
import { AdminControllerExtended } from './admin.controller.extended.js';
import { requireSuperAdmin } from './admin.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import pool from '../accounting/pool.js';
import { HealthCheckService } from './services/health-check.service.js';
import { SystemAlertService } from './services/system-alert.service.js';
import { AdminDashboardService } from './services/admin-dashboard.service.js';
import { FrontendErrorsService } from './services/frontend-errors.service.js';
import { AnalyticsService } from './services/analytics.service.js';
import { ErrorLogService } from './services/error-log.service.js';
import { apiMetricsService } from '../../middleware/request-tracker.middleware.js';

const router = Router();

// Initialize services
const adminService = new AdminService(pool);
const healthCheckService = new HealthCheckService(pool);
const systemAlertService = new SystemAlertService(pool);
const frontendErrorsService = new FrontendErrorsService(pool);
const analyticsService = new AnalyticsService(pool);
const errorLogService = new ErrorLogService(pool);

// Dashboard service aggregates all specialized services
const dashboardService = new AdminDashboardService(
  pool,
  apiMetricsService,
  errorLogService,
  healthCheckService,
  systemAlertService
);

const adminController = new AdminControllerExtended(
  adminService,
  dashboardService,
  frontendErrorsService,
  analyticsService
);

// All admin routes require authentication AND super-admin status
router.use(authMiddleware);
router.use(requireSuperAdmin);

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

export default router;
