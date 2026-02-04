/**
 * Gamification API Module
 * Calls to /api/v1/gamification/workspace/:workspaceId endpoints
 */

const GamificationAPI = (function() {
    'use strict';

    /**
     * Get workspace base path with current workspaceId
     */
    function getBasePath() {
        const workspaceId = ApiTokens?.getWorkspaceId?.() || localStorage.getItem('workspaceId');
        if (!workspaceId) {
            console.warn('⚠️ No workspaceId found for gamification');
            return null;
        }
        return `/gamification/workspace/${workspaceId}`;
    }

    /**
     * Get user profile (level, XP, stats)
     * Backend: GET /gamification/workspace/:workspaceId/stats
     */
    async function getProfile() {
        const basePath = getBasePath();
        if (!basePath) return getMockData().profile;

        try {
            const response = await ApiFetch.fetchWithAuth(`${basePath}/stats`);
            console.log('📊 Gamification stats raw:', response);

            // Map backend stats to frontend profile format
            const stats = response.data?.stats || response.stats || response;
            const user = ApiTokens?.getStoredUser?.() || {};

            return {
                userId: stats.user_id || user.id,
                name: user.name || user.email || 'Utilisateur',
                avatar: user.avatar || '👤',
                level: stats.level || 1,
                currentXP: stats.level_progress || (stats.total_xp % 1000) || 0,
                nextLevelXP: stats.xp_to_next_level || 1000,
                totalXP: stats.total_xp || 0,
                coins: stats.coins || 0,
                prestige: stats.prestige || 0,
                title: getLevelTitle(stats.level || 1)
            };
        } catch (error) {
            console.error('❌ Failed to get gamification profile:', error);
            throw error;
        }
    }

    /**
     * Get all achievements (unlocked and locked)
     * Backend: GET /gamification/workspace/:workspaceId/achievements
     */
    async function getAchievements() {
        const basePath = getBasePath();
        if (!basePath) return getMockData().achievements;

        try {
            const response = await ApiFetch.fetchWithAuth(`${basePath}/achievements`);
            console.log('🏆 Achievements raw:', response);

            const achievements = response.data?.achievements || response.achievements || [];

            // Map backend achievements to frontend format
            return achievements.map(a => ({
                id: a.id,
                icon: a.icon || '🏆',
                name: a.name,
                desc: a.description,
                unlocked: a.unlocked || false,
                unlockedAt: a.unlocked_at,
                condition: !a.unlocked ? getConditionText(a.condition) : null,
                xpReward: a.xp_reward,
                coinReward: a.coin_reward,
                rarity: a.rarity
            }));
        } catch (error) {
            console.error('❌ Failed to get achievements:', error);
            throw error;
        }
    }

    /**
     * Get streak data (calendar, current streak)
     * Backend: GET /gamification/workspace/:workspaceId/streaks
     */
    async function getStreak() {
        const basePath = getBasePath();
        if (!basePath) return getMockData().streak;

        try {
            const response = await ApiFetch.fetchWithAuth(`${basePath}/streaks`);
            console.log('🔥 Streaks raw:', response);

            const streaks = response.data?.streaks || response.streaks || [];

            // Also get stats for current/best streak
            const statsResponse = await ApiFetch.fetchWithAuth(`${basePath}/stats`);
            const stats = statsResponse.data?.stats || statsResponse.stats || {};

            // Build active days from streaks data
            const activeDays = buildActiveDays(streaks);

            return {
                current: stats.current_streak || 0,
                longest: stats.best_streak || 0,
                activeDays: activeDays
            };
        } catch (error) {
            console.error('❌ Failed to get streak:', error);
            throw error;
        }
    }

    /**
     * Get leaderboard (top 10)
     * Backend: GET /gamification/workspace/:workspaceId/leaderboard
     */
    async function getLeaderboard() {
        const basePath = getBasePath();
        if (!basePath) return getMockData().leaderboard;

        try {
            const response = await ApiFetch.fetchWithAuth(`${basePath}/leaderboard`);
            console.log('🏅 Leaderboard raw:', response);

            const leaderboard = response.data?.leaderboard || response.leaderboard || [];

            // Map backend leaderboard to frontend format
            return leaderboard.map((entry, index) => ({
                rank: entry.rank || index + 1,
                userId: entry.user_id,
                name: entry.user_name || entry.name || 'Utilisateur',
                avatar: entry.avatar || '👤',
                level: entry.level || 1,
                xp: entry.total_xp || entry.xp || 0
            }));
        } catch (error) {
            console.error('❌ Failed to get leaderboard:', error);
            throw error;
        }
    }

    /**
     * Record an action (for XP gain)
     * Backend: POST /gamification/workspace/:workspaceId/xp
     * @param {string} action - Action type (task_completed, note_created, etc.)
     * @param {Object} metadata - Additional data (task_id, note_id, etc.)
     */
    async function recordAction(action, metadata = {}) {
        const basePath = getBasePath();
        if (!basePath) {
            console.warn('⚠️ Cannot record action: no workspaceId');
            return null;
        }

        // Map action names and determine XP amount
        const xpAmounts = {
            task_completed: 25,
            task_created: 5,
            note_created: 10,
            note_updated: 5,
            message_sent: 2,
            login_bonus: 10,
            streak_bonus: 50,
            daily_goal: 100,
            weekly_goal: 500
        };

        // Determine entity type from action
        const entityTypes = {
            task_completed: 'task',
            task_created: 'task',
            note_created: 'note',
            note_updated: 'note',
            message_sent: 'message'
        };

        try {
            const response = await ApiFetch.fetchWithAuth(`${basePath}/xp`, {
                method: 'POST',
                body: JSON.stringify({
                    amount: xpAmounts[action] || 10,
                    reason: action,
                    entity_type: entityTypes[action] || undefined,
                    entity_id: metadata.task_id || metadata.note_id || metadata.entity_id || undefined,
                    metadata: metadata
                })
            });
            console.log('✨ XP recorded:', response);

            // Map response to expected format
            const data = response.data || response;
            return {
                success: true,
                xpGained: data.xp_gained || data.amount || xpAmounts[action] || 10,
                newXP: data.new_xp || data.total_xp || 0,
                levelUp: data.level_up || data.leveled_up || false,
                newLevel: data.new_level || data.level || null,
                nextLevelXP: data.next_level_xp || data.xp_to_next_level || 1000,
                achievementUnlocked: data.achievement_unlocked || data.achievement_id || null,
                streakUpdated: data.streak_updated || false
            };
        } catch (error) {
            console.error('❌ Failed to record XP:', error);
            return { success: false, xpGained: 0 };
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
     * Helper: Get level title based on level
     */
    function getLevelTitle(level) {
        if (level >= 50) return 'Légende';
        if (level >= 30) return 'Expert';
        if (level >= 20) return 'Maître';
        if (level >= 15) return 'Vétéran';
        if (level >= 10) return 'Confirmé';
        if (level >= 5) return 'Productif';
        if (level >= 3) return 'Apprenti';
        return 'Débutant';
    }

    /**
     * Helper: Parse condition JSON to human-readable text
     */
    function getConditionText(conditionStr) {
        try {
            const condition = typeof conditionStr === 'string' ? JSON.parse(conditionStr) : conditionStr;
            const type = condition?.type || '';
            const threshold = condition?.threshold || 0;

            switch (type) {
                case 'tasks_completed': return `0/${threshold} tâches`;
                case 'notes_created': return `0/${threshold} notes`;
                case 'streak_days': return `0/${threshold} jours`;
                case 'level_reached': return `Niveau ${threshold}`;
                case 'messages_sent': return `0/${threshold} messages`;
                default: return 'Non commencé';
            }
        } catch {
            return 'Non commencé';
        }
    }

    /**
     * Helper: Build active days array from streaks
     */
    function buildActiveDays(streaks) {
        const today = new Date();
        const activeDays = [];

        // If we have streak data, extract the days
        if (streaks && streaks.length > 0) {
            streaks.forEach(s => {
                if (s.activity_date) {
                    const date = new Date(s.activity_date);
                    if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
                        activeDays.push(date.getDate());
                    }
                }
            });
        }

        return [...new Set(activeDays)].sort((a, b) => a - b);
    }

    /**
     * Mock data for development/testing (fallback)
     */
    function getMockData() {
        return {
            profile: {
                userId: 'demo-user',
                name: 'Demo User',
                avatar: '👤',
                level: 1,
                currentXP: 0,
                nextLevelXP: 1000,
                totalXP: 0,
                coins: 100,
                title: 'Débutant'
            },
            achievements: [
                { id: 'first_task', icon: '✅', name: 'Premier pas', desc: 'Créer sa première tâche', unlocked: false, condition: 'Non commencé' },
                { id: 'streak_7', icon: '🔥', name: 'En feu', desc: '7 jours consécutifs', unlocked: false, condition: '0/7 jours' },
                { id: 'tasks_50', icon: '💪', name: 'Productif', desc: 'Terminer 50 tâches', unlocked: false, condition: '0/50 tâches' }
            ],
            streak: {
                current: 0,
                longest: 0,
                activeDays: []
            },
            leaderboard: []
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
