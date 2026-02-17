/**
 * Behavioral API - Data fetching with mock fallback
 * ProductiveApp v4.0
 */
const BehavioralApi = (function() {
    'use strict';

    function getUserId() {
        return ApiTokens.getStoredUser()?.id || AppState.currentUser?.id;
    }

    async function getProfile() {
        const userId = getUserId();
        if (!userId) return getMockProfile();

        try {
            const response = await ApiFetch.fetchWithAuth(`/signals/user/${userId}/stats`);
            return response.success ? response.data : getMockProfile();
        } catch (e) {
            console.warn('BH API fallback to mock:', e.message);
            return getMockProfile();
        }
    }

    async function getSignals(filters = {}) {
        const userId = getUserId();
        if (!userId) return getMockSignals();

        try {
            const params = new URLSearchParams();
            if (filters.type) params.set('type', filters.type);
            if (filters.from) params.set('from', filters.from);
            if (filters.limit) params.set('limit', filters.limit);
            const query = params.toString();
            const url = `/signals/user/${userId}${query ? '?' + query : ''}`;
            const response = await ApiFetch.fetchWithAuth(url);
            return response.success ? response.data : getMockSignals();
        } catch (e) {
            return getMockSignals();
        }
    }

    function getMockProfile() {
        return {
            userId: 'mock',
            hourlyActivity: [0,0,0,0,0,1,3,8,15,18,14,10,8,12,15,13,10,8,5,3,2,1,0,0],
            weeklyHeatmap: Array.from({length: 7}, () =>
                Array.from({length: 24}, (_, h) => h >= 8 && h <= 18 ? Math.random() * 10 : Math.random() * 2)
            ),
            auditScores: Array.from({length: 30}, (_, i) => ({
                date: new Date(Date.now() - (29-i) * 86400000).toISOString().slice(0,10),
                score: 50 + Math.sin(i * 0.3) * 20 + Math.random() * 15
            })),
            projectEngagement: [
                { id: 'academie', name: 'Académie', score: 85, lastActive: '2 jours' },
                { id: 'bible', name: 'Bible', score: 62, lastActive: '5 jours' },
                { id: 'digital', name: 'Digital Giri', score: 45, lastActive: '1 jour' },
                { id: 'retraites', name: 'Retraites', score: 30, lastActive: '12 jours' }
            ],
            peakHours: { start: 9, end: 11 },
            avgTasksPerDay: 4.2,
            completionRate: 78
        };
    }

    function getMockSignals() {
        return Array.from({length: 20}, (_, i) => ({
            id: `sig_${i}`,
            type: ['task_completed', 'focus_session', 'break'][i % 3],
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            value: Math.random() * 100
        }));
    }

    return { getProfile, getSignals, getMockProfile };
})();

if (typeof window !== 'undefined') window.BehavioralApi = BehavioralApi;
