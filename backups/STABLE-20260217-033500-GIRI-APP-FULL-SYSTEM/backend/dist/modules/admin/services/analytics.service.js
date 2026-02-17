"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
/**
 * AnalyticsService - Analytics utilisateurs et features
 * Note: Nécessite une table 'page_views' ou 'analytics_events' (à créer si besoin)
 */
class AnalyticsService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Stats pages les plus visitées
     * Pour l'instant, on simule avec les données disponibles
     */
    async getTopPages(limit = 10) {
        // TODO: Créer table page_views pour tracker réellement
        // Pour l'instant, on retourne des données basées sur l'activité
        const query = `
      SELECT
        'Dashboard' as page,
        COUNT(*) as views,
        COUNT(DISTINCT member_id) as unique_users,
        0 as avg_time_on_page
      FROM activity_logs
      WHERE action_type = 'view_dashboard'
        AND timestamp >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT
        'Notes' as page,
        COUNT(*) as views,
        COUNT(DISTINCT member_id) as unique_users,
        0 as avg_time_on_page
      FROM notes
      WHERE created_at >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT
        'Tasks' as page,
        COUNT(*) as views,
        COUNT(DISTINCT member_id) as unique_users,
        0 as avg_time_on_page
      FROM tasks
      WHERE created_at >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT
        'Projects' as page,
        COUNT(*) as views,
        COUNT(DISTINCT member_id) as unique_users,
        0 as avg_time_on_page
      FROM projects
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ORDER BY views DESC
      LIMIT $1
    `;
        try {
            const result = await this.pool.query(query, [limit]);
            return result.rows.map(row => ({
                page: row.page,
                views: parseInt(row.views, 10),
                uniqueUsers: parseInt(row.unique_users, 10),
                avgTimeOnPage: parseFloat(row.avg_time_on_page) || 0,
            }));
        }
        catch (error) {
            console.error('[AnalyticsService] getTopPages error:', error);
            // Retourner données par défaut si erreur
            return [
                { page: 'Dashboard', views: 0, uniqueUsers: 0, avgTimeOnPage: 0 },
                { page: 'Notes', views: 0, uniqueUsers: 0, avgTimeOnPage: 0 },
                { page: 'Tasks', views: 0, uniqueUsers: 0, avgTimeOnPage: 0 },
            ];
        }
    }
    /**
     * Stats features les plus utilisées
     */
    async getTopFeatures(limit = 10) {
        // Compter l'utilisation des features principales
        try {
            const totalUsersResult = await this.pool.query('SELECT COUNT(DISTINCT id) as total FROM users');
            const totalUsers = parseInt(totalUsersResult.rows[0]?.total || '0', 10);
            const features = [
                {
                    name: 'Notes',
                    query: 'SELECT COUNT(*) as count, COUNT(DISTINCT member_id) as users FROM notes',
                },
                {
                    name: 'Tasks',
                    query: 'SELECT COUNT(*) as count, COUNT(DISTINCT member_id) as users FROM tasks',
                },
                {
                    name: 'Projects',
                    query: 'SELECT COUNT(*) as count, COUNT(DISTINCT member_id) as users FROM projects',
                },
                {
                    name: 'Gamification',
                    query: 'SELECT COUNT(*) as count, COUNT(DISTINCT user_id) as users FROM user_gamification',
                },
                {
                    name: 'Reports',
                    query: 'SELECT COUNT(*) as count, COUNT(DISTINCT user_id) as users FROM reports_ai',
                },
            ];
            const results = [];
            for (const feature of features) {
                try {
                    const result = await this.pool.query(feature.query);
                    const row = result.rows[0];
                    const usageCount = parseInt(row?.count || '0', 10);
                    const uniqueUsers = parseInt(row?.users || '0', 10);
                    const adoptionRate = totalUsers > 0 ? (uniqueUsers / totalUsers) * 100 : 0;
                    results.push({
                        feature: feature.name,
                        usageCount,
                        uniqueUsers,
                        adoptionRate: Math.round(adoptionRate),
                    });
                }
                catch (err) {
                    // Ignorer si table n'existe pas
                    console.warn(`[AnalyticsService] Feature ${feature.name} query failed:`, err);
                }
            }
            // Trier par usage et limiter
            return results.sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
        }
        catch (error) {
            console.error('[AnalyticsService] getTopFeatures error:', error);
            return [];
        }
    }
    /**
     * Stats activité utilisateurs
     */
    async getUserActivity() {
        try {
            const query = `
        SELECT
          COUNT(*) as total_users,
          SUM(CASE WHEN last_login >= NOW() - INTERVAL '1 day' THEN 1 ELSE 0 END) as active_today,
          SUM(CASE WHEN last_login >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as active_week,
          SUM(CASE WHEN last_login >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as active_month,
          SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as new_week
        FROM users
      `;
            const result = await this.pool.query(query);
            const row = result.rows[0];
            return {
                totalUsers: parseInt(row.total_users, 10),
                activeToday: parseInt(row.active_today, 10),
                activeThisWeek: parseInt(row.active_week, 10),
                activeThisMonth: parseInt(row.active_month, 10),
                newUsersThisWeek: parseInt(row.new_week, 10),
            };
        }
        catch (error) {
            console.error('[AnalyticsService] getUserActivity error:', error);
            return {
                totalUsers: 0,
                activeToday: 0,
                activeThisWeek: 0,
                activeThisMonth: 0,
                newUsersThisWeek: 0,
            };
        }
    }
    /**
     * Engagement par feature (taux d'utilisation)
     */
    async getFeatureEngagement() {
        try {
            const totalUsers = await this.pool.query('SELECT COUNT(*) as total FROM users');
            const total = parseInt(totalUsers.rows[0]?.total || '0', 10);
            if (total === 0) {
                return { notes: 0, tasks: 0, projects: 0, gamification: 0 };
            }
            const queries = {
                notes: 'SELECT COUNT(DISTINCT member_id) as users FROM notes',
                tasks: 'SELECT COUNT(DISTINCT member_id) as users FROM tasks',
                projects: 'SELECT COUNT(DISTINCT member_id) as users FROM projects',
                gamification: 'SELECT COUNT(DISTINCT user_id) as users FROM user_gamification',
            };
            const engagement = {};
            for (const [feature, query] of Object.entries(queries)) {
                try {
                    const result = await this.pool.query(query);
                    const users = parseInt(result.rows[0]?.users || '0', 10);
                    engagement[feature] = Math.round((users / total) * 100);
                }
                catch (err) {
                    engagement[feature] = 0;
                }
            }
            return engagement;
        }
        catch (error) {
            console.error('[AnalyticsService] getFeatureEngagement error:', error);
            return { notes: 0, tasks: 0, projects: 0, gamification: 0 };
        }
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map