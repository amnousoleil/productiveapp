/**
 * Analytics API Module
 * Handles all API calls to /api/v1/analytics
 */

const AnalyticsAPI = (function() {
    'use strict';

    function getWorkspaceId() {
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) {
            return ApiTokens.getWorkspaceId();
        }
        return localStorage.getItem('workspace_id') || '';
    }

    /**
     * Get daily stats for period
     * @param {number} days - Number of days (7, 30, 90)
     */
    async function getDailyStats(days) {
        days = days || 7;
        var workspaceId = getWorkspaceId();
        if (!workspaceId) return getMockDailyStats(days);

        try {
            var response = await ApiFetch.fetchWithAuth(
                '/analytics/workspace/' + workspaceId + '/daily-stats?days=' + days
            );
            return response.data || response;
        } catch (error) {
            console.warn('API failed, using mock daily stats');
            return getMockDailyStats(days);
        }
    }

    /**
     * Get productivity metrics
     */
    async function getProductivity() {
        var workspaceId = getWorkspaceId();
        if (!workspaceId) return getMockProductivity();

        try {
            var response = await ApiFetch.fetchWithAuth(
                '/analytics/workspace/' + workspaceId + '/productivity'
            );
            return response.data || response;
        } catch (error) {
            console.warn('API failed, using mock productivity');
            return getMockProductivity();
        }
    }

    /**
     * Get activity summary
     */
    async function getActivitySummary() {
        var workspaceId = getWorkspaceId();
        if (!workspaceId) return getMockActivitySummary();

        try {
            var response = await ApiFetch.fetchWithAuth(
                '/analytics/workspace/' + workspaceId + '/activity/summary'
            );
            return response.data || response;
        } catch (error) {
            console.warn('API failed, using mock activity summary');
            return getMockActivitySummary();
        }
    }

    /**
     * Get all analytics data at once
     */
    async function getAll(days) {
        days = days || 7;
        var results = await Promise.allSettled([
            getDailyStats(days),
            getProductivity(),
            getActivitySummary()
        ]);

        return {
            dailyStats: results[0].status === 'fulfilled' ? results[0].value : getMockDailyStats(days),
            productivity: results[1].status === 'fulfilled' ? results[1].value : getMockProductivity(),
            activity: results[2].status === 'fulfilled' ? results[2].value : getMockActivitySummary()
        };
    }

    // ========== Mock Data ==========

    function getMockDailyStats(days) {
        var stats = [];
        var now = new Date();
        for (var i = days - 1; i >= 0; i--) {
            var date = new Date(now);
            date.setDate(date.getDate() - i);
            stats.push({
                date: date.toISOString().split('T')[0],
                tasks_completed: Math.floor(Math.random() * 8) + 1,
                tasks_created: Math.floor(Math.random() * 6) + 2,
                completion_rate: Math.floor(Math.random() * 40) + 50
            });
        }
        return stats;
    }

    function getMockProductivity() {
        return {
            completion_rate: 72,
            weekly_completion: 68,
            trend: 'up',
            trend_percent: 8,
            tasks_completed: 24,
            tasks_total: 33,
            best_day: 'Mardi',
            best_hour: 10,
            avg_tasks_per_day: 4.2,
            current_streak: 5,
            best_streak: 12
        };
    }

    function getMockActivitySummary() {
        var now = Date.now();
        return {
            recent: [
                { type: 'task', action: 'completed', title: 'Revue de code API', time: new Date(now - 300000).toISOString() },
                { type: 'note', action: 'created', title: 'Reunion equipe', time: new Date(now - 900000).toISOString() },
                { type: 'task', action: 'created', title: 'Implementer analytics', time: new Date(now - 1800000).toISOString() },
                { type: 'task', action: 'completed', title: 'Fix login bug', time: new Date(now - 3600000).toISOString() },
                { type: 'note', action: 'edited', title: 'Architecture v3', time: new Date(now - 7200000).toISOString() }
            ],
            heatmap: generateMockHeatmap()
        };
    }

    function generateMockHeatmap() {
        var heatmap = [];
        var now = new Date();
        for (var i = 89; i >= 0; i--) {
            var date = new Date(now);
            date.setDate(date.getDate() - i);
            heatmap.push({
                date: date.toISOString().split('T')[0],
                count: Math.floor(Math.random() * 10)
            });
        }
        return heatmap;
    }

    return {
        getWorkspaceId: getWorkspaceId,
        getDailyStats: getDailyStats,
        getProductivity: getProductivity,
        getActivitySummary: getActivitySummary,
        getAll: getAll
    };
})();

if (typeof window !== 'undefined') {
    window.AnalyticsAPI = AnalyticsAPI;
}
