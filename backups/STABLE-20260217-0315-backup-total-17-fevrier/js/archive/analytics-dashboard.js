/**
 * Analytics Dashboard Module
 * Renders stat cards and manages the dashboard layout
 */

const AnalyticsDashboard = (function() {
    'use strict';

    let stats = null;
    let streak = null;
    let recentActivity = [];

    /**
     * Load all dashboard data
     */
    async function load() {
        try {
            const [statsData, streakData, activityData] = await Promise.all([
                AnalyticsAPI.getStats(),
                AnalyticsAPI.getStreak(),
                AnalyticsAPI.getRecentActivity()
            ]);

            stats = statsData;
            streak = streakData;
            recentActivity = activityData;

            render();
        } catch (error) {
            console.error('❌ Failed to load dashboard:', error);
        }
    }

    /**
     * Render the dashboard
     */
    function render() {
        renderStatsCards();
        renderStreakCard();
        renderRecentActivity();
    }

    /**
     * Render stats cards row
     */
    function renderStatsCards() {
        const container = document.getElementById('analytics-stats-row');
        if (!container || !stats) return;

        const cards = [
            { key: 'notesToday', icon: '📝', label: 'Notes aujourd\'hui', ...stats.notesToday },
            { key: 'tasksCompleted', icon: '✅', label: 'Tâches complétées', ...stats.tasksCompleted },
            { key: 'messagesSent', icon: '💬', label: 'Messages envoyés', ...stats.messagesSent },
            { key: 'xpGained', icon: '⚡', label: 'XP gagné', ...stats.xpGained }
        ];

        container.innerHTML = cards.map(card => renderStatCard(card)).join('');
    }

    /**
     * Render single stat card
     * @param {Object} card
     */
    function renderStatCard(card) {
        const trendClass = card.trend === 'up' ? 'up' : card.trend === 'down' ? 'down' : 'neutral';
        const trendIcon = card.trend === 'up' ? '↑' : card.trend === 'down' ? '↓' : '→';
        const changeText = card.change > 0 ? `+${card.change}%` : `${card.change}%`;

        return `
            <div class="analytics-stat-card" data-stat="${card.key}">
                <div class="analytics-stat-header">
                    <div class="analytics-stat-icon">${card.icon}</div>
                    <div class="analytics-stat-trend ${trendClass}">
                        <span>${trendIcon}</span>
                        <span>${changeText}</span>
                    </div>
                </div>
                <div class="analytics-stat-value">${formatNumber(card.value)}</div>
                <div class="analytics-stat-label">${card.label}</div>
            </div>
        `;
    }

    /**
     * Render streak card
     */
    function renderStreakCard() {
        const container = document.getElementById('analytics-streak-card');
        if (!container || !streak) return;

        container.innerHTML = `
            <div class="analytics-streak-main">
                <div class="analytics-streak-icon">🔥</div>
                <div class="analytics-streak-value">${streak.current}</div>
                <div class="analytics-streak-label">jours consécutifs</div>
            </div>
            <div class="analytics-streak-stats">
                <div class="analytics-streak-stat">
                    <div class="analytics-streak-stat-value">🏆 ${streak.best}</div>
                    <div class="analytics-streak-stat-label">Meilleur streak</div>
                </div>
                <div class="analytics-streak-stat">
                    <div class="analytics-streak-stat-value">⏰ ${streak.productiveHour}</div>
                    <div class="analytics-streak-stat-label">Heure productive</div>
                </div>
            </div>
        `;
    }

    /**
     * Render recent activity
     */
    function renderRecentActivity() {
        const container = document.getElementById('analytics-activity-list');
        if (!container) return;

        if (recentActivity.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    Aucune activité récente
                </div>
            `;
            return;
        }

        container.innerHTML = recentActivity.map(item => renderActivityItem(item)).join('');
    }

    /**
     * Render single activity item
     * @param {Object} item
     */
    function renderActivityItem(item) {
        const icon = getActivityIcon(item.type);
        const text = getActivityText(item);
        const time = formatRelativeTime(item.time);

        return `
            <div class="analytics-activity-item">
                <div class="analytics-activity-icon ${item.type}">${icon}</div>
                <div class="analytics-activity-content">
                    <div class="analytics-activity-text">${text}</div>
                </div>
                <div class="analytics-activity-time">${time}</div>
            </div>
        `;
    }

    // ========== Helpers ==========

    function getActivityIcon(type) {
        const icons = {
            note: '📝',
            task: '✅',
            message: '💬',
            achievement: '🏆'
        };
        return icons[type] || '📌';
    }

    function getActivityText(item) {
        const actions = {
            created: 'Créé',
            completed: 'Terminé',
            edited: 'Modifié',
            sent: 'Envoyé',
            unlocked: 'Débloqué'
        };
        const action = actions[item.action] || item.action;
        return `${action} <strong>${escapeHtml(item.title)}</strong>`;
    }

    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    function formatRelativeTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return "À l'instant";
        if (diff < 3600) return `${Math.floor(diff / 60)}min`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}j`;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get current data
     */
    function getData() {
        return { stats, streak, recentActivity };
    }

    return {
        load,
        render,
        renderStatsCards,
        renderStreakCard,
        renderRecentActivity,
        getData
    };
})();

if (typeof window !== 'undefined') {
    window.AnalyticsDashboard = AnalyticsDashboard;
}
