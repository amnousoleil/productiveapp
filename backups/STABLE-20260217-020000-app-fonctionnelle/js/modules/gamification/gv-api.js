/**
 * Gamification View - API Module
 * Data loading functions for gamification-view.js
 */

const GVApi = (function() {
    'use strict';

    function getWorkspaceId() {
        return ApiTokens.getWorkspaceId();
    }

    async function loadProfile() {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) return getDefaultProfile();

        try {
            const response = await ApiFetch.fetchWithAuth(
                `/gamification/workspace/${workspaceId}/profile`
            );
            if (response.success && response.data?.profile) {
                return response.data.profile;
            }
        } catch (error) {
            console.error('GVApi: Error loading profile:', error);
        }
        return getDefaultProfile();
    }

    async function loadBadges() {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) return null;

        try {
            const response = await ApiFetch.fetchWithAuth(
                `/gamification/workspace/${workspaceId}/badges`
            );
            if (response.success && response.data?.badges) {
                return response.data.badges;
            }
        } catch (error) {
            console.error('GVApi: Error loading badges:', error);
        }
        return null;
    }

    async function loadLeaderboard() {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) return [];

        try {
            const response = await ApiFetch.fetchWithAuth(
                `/gamification/workspace/${workspaceId}/leaderboard?period=weekly&limit=10`
            );
            if (response.success && response.data?.leaderboard) {
                return response.data.leaderboard;
            }
        } catch (error) {
            console.error('GVApi: Error loading leaderboard:', error);
        }
        return [];
    }

    async function loadXpHistory() {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) return [];

        try {
            const response = await ApiFetch.fetchWithAuth(
                `/gamification/workspace/${workspaceId}/xp-history?limit=10`
            );
            if (response.success && response.data?.events) {
                return response.data.events;
            }
        } catch (error) {
            console.error('GVApi: Error loading XP history:', error);
        }
        return [];
    }

    async function loadAll() {
        const [profile, badges, leaderboard, xpHistory] = await Promise.all([
            loadProfile(),
            loadBadges(),
            loadLeaderboard(),
            loadXpHistory()
        ]);
        return { profile, badges, leaderboard, xpHistory };
    }

    function getDefaultProfile() {
        return {
            total_xp: 0,
            level: 1,
            level_progress: 0,
            xp_to_next_level: 100,
            current_streak: 0,
            badges_count: 0,
            total_badges: 0
        };
    }

    return {
        loadProfile,
        loadBadges,
        loadLeaderboard,
        loadXpHistory,
        loadAll,
        getDefaultProfile
    };
})();

if (typeof window !== 'undefined') {
    window.GVApi = GVApi;
}
