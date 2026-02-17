// =============================================
// PRODUCTIVEAPP - LIFE INSIGHTS ROUTES
// Routes Express pour Life Insights
// =============================================

import { Router } from 'express';
import { LifeInsightsController } from './life-insights.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// ==================== Activity Logging ====================

// POST /api/v1/life-insights/activities - Enregistrer une activité
router.post('/activities', LifeInsightsController.logActivity);

// GET /api/v1/life-insights/activities - Récupérer les activités
router.get('/activities', LifeInsightsController.getActivities);

// ==================== Statistics ====================

// GET /api/v1/life-insights/stats - Statistiques globales
router.get('/stats', LifeInsightsController.getStats);

// GET /api/v1/life-insights/stats/hourly - Distribution horaire
router.get('/stats/hourly', LifeInsightsController.getHourlyDistribution);

// GET /api/v1/life-insights/stats/daily - Tendances quotidiennes
router.get('/stats/daily', LifeInsightsController.getDailyTrends);

// ==================== Insights ====================

// GET /api/v1/life-insights/insights - Récupérer les insights
router.get('/insights', LifeInsightsController.getInsights);

// PUT /api/v1/life-insights/insights/:id/read - Marquer comme lu
router.put('/insights/:id/read', LifeInsightsController.markInsightAsRead);

// ==================== Patterns ====================

// GET /api/v1/life-insights/patterns - Récupérer les patterns
router.get('/patterns', LifeInsightsController.getPatterns);

// ==================== Psychological Profile ====================

// GET /api/v1/life-insights/profile - Récupérer le profil psychologique
router.get('/profile', LifeInsightsController.getProfile);

// ==================== AI Analysis ====================

// POST /api/v1/life-insights/analyze - Lancer une analyse IA
router.post('/analyze', LifeInsightsController.analyzeUser);

// ==================== Daily Snapshots ====================

// GET /api/v1/life-insights/snapshots/today - Snapshot du jour
router.get('/snapshots/today', LifeInsightsController.getTodaySnapshot);

// ==================== Export ====================

// GET /api/v1/life-insights/export - Exporter toutes les données
router.get('/export', LifeInsightsController.exportData);

export default router;
