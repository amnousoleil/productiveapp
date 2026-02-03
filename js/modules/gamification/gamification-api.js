/**
 * Gamification API Module
 * Calls to /api/v1/gamification endpoints
 */

const GamificationAPI = (function() {
    'use strict';

    const BASE_PATH = '/gamification';

    /**
     * Get user profile (level, XP, stats)
     */
    async function getProfile() {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/profile`);
            console.log('📊 Gamification profile:', response);
            return response.data || response;
        } catch (error) {
            console.error('❌ Failed to get gamification profile:', error);
            throw error;
        }
    }

    /**
     * Get all achievements (unlocked and locked)
     */
    async function getAchievements() {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/achievements`);
            console.log('🏆 Achievements:', response);
            return response.data || response;
        } catch (error) {
            console.error('❌ Failed to get achievements:', error);
            throw error;
        }
    }

    /**
     * Get streak data (calendar, current streak)
     */
    async function getStreak() {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/streak`);
            console.log('🔥 Streak:', response);
            return response.data || response;
        } catch (error) {
            console.error('❌ Failed to get streak:', error);
            throw error;
        }
    }

    /**
     * Get leaderboard (top 10)
     */
    async function getLeaderboard() {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/leaderboard`);
            console.log('🏅 Leaderboard:', response);
            return response.data || response;
        } catch (error) {
            console.error('❌ Failed to get leaderboard:', error);
            throw error;
        }
    }

    /**
     * Record an action (for XP gain)
     * @param {string} action - Action type (task_complete, login, etc.)
     * @param {Object} metadata - Additional data
     */
    async function recordAction(action, metadata = {}) {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/action`, {
                method: 'POST',
                body: JSON.stringify({ action, ...metadata })
            });
            console.log('✨ Action recorded:', response);
            return response.data || response;
        } catch (error) {
            console.error('❌ Failed to record action:', error);
            throw error;
        }
    }

    /**
     * Get all gamification data in one call
     */
    async function getAll() {
        try {
            const [profile, achievements, streak, leaderboard] = await Promise.all([
                getProfile(),
                getAchievements(),
                getStreak(),
                getLeaderboard()
            ]);
            return { profile, achievements, streak, leaderboard };
        } catch (error) {
            console.error('❌ Failed to get gamification data:', error);
            throw error;
        }
    }

    /**
     * Mock data for development/testing
     */
    function getMockData() {
        return {
            profile: {
                userId: 'demo-user',
                name: 'Demo User',
                avatar: '👤',
                level: 7,
                currentXP: 2450,
                nextLevelXP: 3000,
                totalXP: 12450,
                title: 'Productif'
            },
            achievements: [
                { id: 'first_task', icon: '✅', name: 'Premier pas', desc: 'Créer sa première tâche', unlocked: true, unlockedAt: '2026-01-15' },
                { id: 'streak_7', icon: '🔥', name: 'En feu', desc: '7 jours consécutifs', unlocked: true, unlockedAt: '2026-01-22' },
                { id: 'tasks_50', icon: '💪', name: 'Productif', desc: 'Terminer 50 tâches', unlocked: true, unlockedAt: '2026-01-28' },
                { id: 'streak_30', icon: '⭐', name: 'Dévoué', desc: '30 jours consécutifs', unlocked: false, condition: '15/30 jours' },
                { id: 'tasks_100', icon: '🏆', name: 'Champion', desc: 'Terminer 100 tâches', unlocked: false, condition: '67/100 tâches' },
                { id: 'speed_demon', icon: '⚡', name: 'Éclair', desc: '10 tâches en 1 heure', unlocked: false, condition: 'Non commencé' }
            ],
            streak: {
                current: 12,
                longest: 23,
                activeDays: [1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14]
            },
            leaderboard: [
                { rank: 1, userId: 'maha', name: 'Maître Maha', avatar: '👑', level: 15, xp: 45200 },
                { rank: 2, userId: 'brice', name: 'Brice', avatar: '🚀', level: 12, xp: 32100 },
                { rank: 3, userId: 'demo-user', name: 'Demo User', avatar: '👤', level: 7, xp: 12450 },
                { rank: 4, userId: 'team', name: 'Team', avatar: '👥', level: 5, xp: 8900 }
            ]
        };
    }

    return {
        getProfile,
        getAchievements,
        getStreak,
        getLeaderboard,
        recordAction,
        getAll,
        getMockData
    };
})();

if (typeof window !== 'undefined') {
    window.GamificationAPI = GamificationAPI;
}
