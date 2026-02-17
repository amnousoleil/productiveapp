"use strict";
// =============================================
// PRODUCTIVEAPP - LIFE INSIGHTS CONTROLLER
// Contrôleur HTTP pour Life Insights
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifeInsightsController = void 0;
const life_insights_service_js_1 = require("./life-insights.service.js");
const life_insights_ai_service_js_1 = require("./life-insights.ai.service.js");
class LifeInsightsController {
    // ==================== Activity Logging ====================
    /**
     * POST /api/v1/life-insights/activities
     * Enregistre une nouvelle activité
     */
    static async logActivity(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const dto = {
                user_id: userId,
                member_id: req.body.member_id,
                action_type: req.body.action_type,
                entity_type: req.body.entity_type,
                entity_id: req.body.entity_id,
                action_label: req.body.action_label,
                metadata: req.body.metadata,
                session_id: req.body.session_id,
                device_info: req.body.device_info || {
                    user_agent: req.headers['user-agent'],
                },
                ip_address: req.ip,
                duration_seconds: req.body.duration_seconds,
            };
            const activity = await life_insights_service_js_1.LifeInsightsService.logActivity(dto);
            return res.status(201).json(activity);
        }
        catch (error) {
            console.error('Error logging activity:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /api/v1/life-insights/activities
     * Récupère les activités de l'utilisateur
     */
    static async getActivities(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const query = {
                user_id: userId,
                member_id: req.query.member_id,
                start_date: req.query.start_date ? new Date(req.query.start_date) : undefined,
                end_date: req.query.end_date ? new Date(req.query.end_date) : undefined,
                action_types: req.query.action_types ? req.query.action_types.split(',') : undefined,
                entity_types: req.query.entity_types ? req.query.entity_types.split(',') : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : 100,
            };
            const activities = await life_insights_service_js_1.LifeInsightsService.getActivities(query);
            return res.json(activities);
        }
        catch (error) {
            console.error('Error getting activities:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    // ==================== Statistics ====================
    /**
     * GET /api/v1/life-insights/stats
     * Récupère les statistiques d'activité
     */
    static async getStats(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const query = {
                user_id: userId,
                member_id: req.query.member_id,
                period: req.query.period || 'month',
            };
            const stats = await life_insights_service_js_1.LifeInsightsService.getActivityStats(query);
            return res.json(stats);
        }
        catch (error) {
            console.error('Error getting stats:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /api/v1/life-insights/stats/hourly
     * Récupère la distribution horaire
     */
    static async getHourlyDistribution(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const days = req.query.days ? parseInt(req.query.days) : 30;
            const distribution = await life_insights_service_js_1.LifeInsightsService.getHourlyDistribution(userId, days);
            return res.json(distribution);
        }
        catch (error) {
            console.error('Error getting hourly distribution:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /api/v1/life-insights/stats/daily
     * Récupère les tendances quotidiennes
     */
    static async getDailyTrends(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const days = req.query.days ? parseInt(req.query.days) : 30;
            const trends = await life_insights_service_js_1.LifeInsightsService.getDailyTrends(userId, days);
            return res.json(trends);
        }
        catch (error) {
            console.error('Error getting daily trends:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    // ==================== Insights ====================
    /**
     * GET /api/v1/life-insights/insights
     * Récupère les insights comportementaux
     */
    static async getInsights(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const memberId = req.query.member_id;
            const insights = await life_insights_service_js_1.LifeInsightsService.getInsights(userId, memberId);
            return res.json(insights);
        }
        catch (error) {
            console.error('Error getting insights:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * PUT /api/v1/life-insights/insights/:id/read
     * Marque un insight comme lu
     */
    static async markInsightAsRead(req, res) {
        try {
            const insightId = parseInt(req.params.id);
            await life_insights_service_js_1.LifeInsightsService.markInsightAsRead(insightId);
            return res.json({ success: true });
        }
        catch (error) {
            console.error('Error marking insight as read:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    // ==================== Patterns ====================
    /**
     * GET /api/v1/life-insights/patterns
     * Récupère les patterns détectés
     */
    static async getPatterns(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const memberId = req.query.member_id;
            const patterns = await life_insights_service_js_1.LifeInsightsService.getPatterns(userId, memberId);
            return res.json(patterns);
        }
        catch (error) {
            console.error('Error getting patterns:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    // ==================== Psychological Profile ====================
    /**
     * GET /api/v1/life-insights/profile
     * Récupère le profil psychologique
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const memberId = req.query.member_id;
            const profile = await life_insights_service_js_1.LifeInsightsService.getProfile(userId, memberId);
            if (!profile) {
                return res.status(404).json({ error: 'Profile not found. Run analysis first.' });
            }
            return res.json(profile);
        }
        catch (error) {
            console.error('Error getting profile:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    // ==================== AI Analysis ====================
    /**
     * POST /api/v1/life-insights/analyze
     * Lance une analyse complète de l'utilisateur
     */
    static async analyzeUser(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const request = {
                user_id: userId,
                member_id: req.body.member_id,
                analysis_type: req.body.analysis_type || 'full',
                days_to_analyze: req.body.days_to_analyze || 30,
                regenerate: req.body.regenerate || false,
            };
            const result = await life_insights_ai_service_js_1.LifeInsightsAIService.analyzeUser(request);
            return res.json(result);
        }
        catch (error) {
            console.error('Error analyzing user:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    // ==================== Daily Snapshots ====================
    /**
     * GET /api/v1/life-insights/snapshots/today
     * Récupère le snapshot du jour
     */
    static async getTodaySnapshot(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const memberId = req.query.member_id;
            const snapshot = await life_insights_service_js_1.LifeInsightsService.getTodaySnapshot(userId, memberId);
            if (!snapshot) {
                return res.status(404).json({ error: 'No snapshot for today yet' });
            }
            return res.json(snapshot);
        }
        catch (error) {
            console.error('Error getting today snapshot:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    // ==================== Export ====================
    /**
     * GET /api/v1/life-insights/export
     * Exporte toutes les données Life Insights
     */
    static async exportData(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const memberId = req.query.member_id;
            const data = await life_insights_service_js_1.LifeInsightsService.exportUserData(userId, memberId);
            return res.json(data);
        }
        catch (error) {
            console.error('Error exporting data:', error);
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.LifeInsightsController = LifeInsightsController;
//# sourceMappingURL=life-insights.controller.js.map