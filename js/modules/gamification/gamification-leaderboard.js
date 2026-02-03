/**
 * Gamification Leaderboard Component
 * Displays top 10 users ranked by XP
 */

const GamificationLeaderboard = (function() {
    'use strict';

    let leaderboardData = [];
    let currentUserId = null;

    /**
     * Render the leaderboard
     * @param {HTMLElement} container - Container element
     * @param {Array} data - Leaderboard data array
     * @param {string} userId - Current user ID to highlight
     */
    function render(container, data, userId = null) {
        if (!container || !data) return;
        leaderboardData = data;
        currentUserId = userId || (typeof AppState !== 'undefined' ? AppState.currentUser?.id : null);

        container.innerHTML = `
            <div class="gam-leaderboard">
                <div class="gam-section-title">🏅 Classement</div>
                <div class="gam-leaderboard-list">
                    ${data.slice(0, 10).map(user => renderLeaderboardItem(user)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render single leaderboard item
     * @param {Object} user - User data
     */
    function renderLeaderboardItem(user) {
        const isCurrentUser = user.userId === currentUserId;
        const rankClass = getRankClass(user.rank);

        const avatarHtml = user.avatar?.startsWith('http')
            ? `<img src="${user.avatar}" alt="${user.name}" class="gam-lb-avatar">`
            : `<div class="gam-lb-avatar" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;background:var(--gam-accent-muted);">${user.avatar || '👤'}</div>`;

        return `
            <div class="gam-leaderboard-item ${isCurrentUser ? 'current-user' : ''}" data-user="${user.userId}">
                <div class="gam-rank ${rankClass}">${user.rank}</div>
                ${avatarHtml}
                <div class="gam-lb-info">
                    <div class="gam-lb-name">${escapeHtml(user.name)}</div>
                    <div class="gam-lb-level">Niveau ${user.level}</div>
                </div>
                <div class="gam-lb-xp">${formatNumber(user.xp)} XP</div>
            </div>
        `;
    }

    /**
     * Get CSS class for rank styling
     * @param {number} rank - User rank
     */
    function getRankClass(rank) {
        switch (rank) {
            case 1: return 'gold';
            case 2: return 'silver';
            case 3: return 'bronze';
            default: return 'default';
        }
    }

    /**
     * Update a user's position in the leaderboard
     * @param {string} userId - User ID
     * @param {number} newXP - New XP value
     */
    function updateUser(userId, newXP) {
        const user = leaderboardData.find(u => u.userId === userId);
        if (!user) return;

        user.xp = newXP;

        // Re-sort leaderboard
        leaderboardData.sort((a, b) => b.xp - a.xp);

        // Update ranks
        leaderboardData.forEach((u, i) => {
            u.rank = i + 1;
        });

        // Re-render
        const container = document.querySelector('.gam-leaderboard');
        if (container) {
            render(container.parentElement, leaderboardData, currentUserId);
        }
    }

    /**
     * Get user's current rank
     * @param {string} userId - User ID
     */
    function getUserRank(userId) {
        const user = leaderboardData.find(u => u.userId === userId);
        return user?.rank || null;
    }

    /**
     * Get top N users
     * @param {number} n - Number of users to return
     */
    function getTopN(n = 10) {
        return leaderboardData.slice(0, n);
    }

    /**
     * Check if user is in top 3
     * @param {string} userId - User ID
     */
    function isTopThree(userId) {
        const rank = getUserRank(userId);
        return rank !== null && rank <= 3;
    }

    /**
     * Format number with spaces
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get current data
     */
    function getData() {
        return leaderboardData;
    }

    return {
        render,
        updateUser,
        getUserRank,
        getTopN,
        isTopThree,
        getData
    };
})();

if (typeof window !== 'undefined') {
    window.GamificationLeaderboard = GamificationLeaderboard;
}
