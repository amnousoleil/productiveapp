/**
 * Analytics API Module
 * Handles all API calls to /api/v1/analytics
 */

const AnalyticsAPI = (function() {
    'use strict';

    const BASE_PATH = '/analytics';

    /**
     * Get dashboard stats
     */
    async function getStats() {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/stats`);
            console.log('📊 Analytics stats:', response);
            return response.data || response;
        } catch (error) {
            console.warn('⚠️ API failed, using mock data');
            return getMockStats();
        }
    }

    /**
     * Get activity data for chart
     * @param {number} days - Number of days (7, 14, 30)
     */
    async function getActivityChart(days = 7) {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/activity?days=${days}`);
            return response.data || response;
        } catch (error) {
            console.warn('⚠️ API failed, using mock chart data');
            return getMockActivityChart(days);
        }
    }

    /**
     * Get streak data
     */
    async function getStreak() {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/streak`);
            return response.data || response;
        } catch (error) {
            return getMockStreak();
        }
    }

    /**
     * Get recent activity
     * @param {number} limit
     */
    async function getRecentActivity(limit = 10) {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/recent?limit=${limit}`);
            return response.data || response;
        } catch (error) {
            return getMockRecentActivity();
        }
    }

    /**
     * Get productivity insights
     */
    async function getInsights() {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/insights`);
            return response.data || response;
        } catch (error) {
            return getMockInsights();
        }
    }

    // ========== Mock Data ==========

    function getMockStats() {
        return {
            notesToday: { value: 12, change: 15, trend: 'up' },
            tasksCompleted: { value: 8, change: -5, trend: 'down' },
            messagesSent: { value: 24, change: 32, trend: 'up' },
            xpGained: { value: 450, change: 12, trend: 'up' }
        };
    }

    function getMockActivityChart(days) {
        const labels = [];
        const notes = [];
        const tasks = [];
        const messages = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));
            notes.push(Math.floor(Math.random() * 15) + 2);
            tasks.push(Math.floor(Math.random() * 10) + 1);
            messages.push(Math.floor(Math.random() * 20) + 5);
        }

        return { labels, datasets: { notes, tasks, messages } };
    }

    function getMockStreak() {
        return {
            current: 12,
            best: 23,
            productiveHour: '10h - 11h',
            avgTasksPerDay: 6.5
        };
    }

    function getMockRecentActivity() {
        const now = Date.now();
        return [
            { type: 'note', action: 'created', title: 'Réunion équipe', time: new Date(now - 300000).toISOString() },
            { type: 'task', action: 'completed', title: 'Revue de code API', time: new Date(now - 900000).toISOString() },
            { type: 'message', action: 'sent', title: 'à Maha', time: new Date(now - 1800000).toISOString() },
            { type: 'task', action: 'created', title: 'Implémenter analytics', time: new Date(now - 3600000).toISOString() },
            { type: 'achievement', action: 'unlocked', title: 'Productif', time: new Date(now - 7200000).toISOString() },
            { type: 'note', action: 'edited', title: 'Architecture v3', time: new Date(now - 10800000).toISOString() },
            { type: 'task', action: 'completed', title: 'Fix login bug', time: new Date(now - 14400000).toISOString() },
            { type: 'message', action: 'sent', title: 'à Brice', time: new Date(now - 18000000).toISOString() }
        ];
    }

    function getMockInsights() {
        return {
            mostProductiveDay: 'Mardi',
            mostProductiveHour: '10:00',
            avgSessionDuration: '2h 15min',
            tasksPerWeek: 35,
            notesPerWeek: 18
        };
    }

    return {
        getStats,
        getActivityChart,
        getStreak,
        getRecentActivity,
        getInsights,
        getMockStats,
        getMockActivityChart,
        getMockStreak,
        getMockRecentActivity
    };
})();

if (typeof window !== 'undefined') {
    window.AnalyticsAPI = AnalyticsAPI;
}
