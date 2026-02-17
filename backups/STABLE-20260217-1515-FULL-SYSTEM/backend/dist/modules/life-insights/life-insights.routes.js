"use strict";
// =============================================
// PRODUCTIVEAPP - LIFE INSIGHTS ROUTES
// Routes Express pour Life Insights
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const life_insights_controller_js_1 = require("./life-insights.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent l'authentification
router.use(auth_middleware_js_1.authMiddleware);
// ==================== Activity Logging ====================
// POST /api/v1/life-insights/activities - Enregistrer une activité
router.post('/activities', life_insights_controller_js_1.LifeInsightsController.logActivity);
// GET /api/v1/life-insights/activities - Récupérer les activités
router.get('/activities', life_insights_controller_js_1.LifeInsightsController.getActivities);
// ==================== Statistics ====================
// GET /api/v1/life-insights/stats - Statistiques globales
router.get('/stats', life_insights_controller_js_1.LifeInsightsController.getStats);
// GET /api/v1/life-insights/stats/hourly - Distribution horaire
router.get('/stats/hourly', life_insights_controller_js_1.LifeInsightsController.getHourlyDistribution);
// GET /api/v1/life-insights/stats/daily - Tendances quotidiennes
router.get('/stats/daily', life_insights_controller_js_1.LifeInsightsController.getDailyTrends);
// ==================== Insights ====================
// GET /api/v1/life-insights/insights - Récupérer les insights
router.get('/insights', life_insights_controller_js_1.LifeInsightsController.getInsights);
// PUT /api/v1/life-insights/insights/:id/read - Marquer comme lu
router.put('/insights/:id/read', life_insights_controller_js_1.LifeInsightsController.markInsightAsRead);
// ==================== Patterns ====================
// GET /api/v1/life-insights/patterns - Récupérer les patterns
router.get('/patterns', life_insights_controller_js_1.LifeInsightsController.getPatterns);
// ==================== Psychological Profile ====================
// GET /api/v1/life-insights/profile - Récupérer le profil psychologique
router.get('/profile', life_insights_controller_js_1.LifeInsightsController.getProfile);
// ==================== AI Analysis ====================
// POST /api/v1/life-insights/analyze - Lancer une analyse IA
router.post('/analyze', life_insights_controller_js_1.LifeInsightsController.analyzeUser);
// ==================== Daily Snapshots ====================
// GET /api/v1/life-insights/snapshots/today - Snapshot du jour
router.get('/snapshots/today', life_insights_controller_js_1.LifeInsightsController.getTodaySnapshot);
// ==================== Export ====================
// GET /api/v1/life-insights/export - Exporter toutes les données
router.get('/export', life_insights_controller_js_1.LifeInsightsController.exportData);
exports.default = router;
//# sourceMappingURL=life-insights.routes.js.map