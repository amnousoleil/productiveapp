/**
 * Gamification View - Render Module
 * Rendering functions for gamification-view.js
 */

const GVRender = (function() {
    'use strict';

    const H = GVHelpers;

    function renderProfile(profile) {
        if (!profile) return;
        const levelEl = document.querySelector('.level-number');
        const xpBarEl = document.getElementById('xp-bar-fill');
        const xpTextEl = document.getElementById('xp-text');

        if (levelEl) levelEl.textContent = profile.level || 1;
        if (xpBarEl) xpBarEl.style.width = `${profile.level_progress || 0}%`;
        if (xpTextEl) {
            const current = profile.total_xp - H.getXpForLevel(profile.level);
            const needed = profile.xp_to_next_level || 100;
            xpTextEl.textContent = `${Math.max(0, current)} / ${needed} XP`;
        }
    }

    function renderStats(profile) {
        if (!profile) return;
        const xpEl = document.getElementById('stat-xp');
        const levelEl = document.getElementById('stat-level');
        const streakEl = document.getElementById('stat-streak');
        const badgesEl = document.getElementById('stat-badges');

        if (xpEl) xpEl.textContent = (profile.total_xp || 0).toLocaleString();
        if (levelEl) levelEl.textContent = profile.level || 1;
        if (streakEl) streakEl.textContent = `${profile.current_streak || 0}j`;
        if (badgesEl) badgesEl.textContent = `${profile.badges_count || 0}/${profile.total_badges || 0}`;
    }

    function renderBadges(badges) {
        const container = document.getElementById('badges-grid');
        if (!container) return;

        if (!badges) {
            container.innerHTML = '<div class="empty-state">Aucun badge disponible</div>';
            return;
        }

        const { unlocked = [], locked = [] } = badges;
        const allBadges = [...unlocked, ...locked];

        if (allBadges.length === 0) {
            container.innerHTML = '<div class="empty-state">Aucun badge disponible</div>';
            return;
        }

        container.innerHTML = allBadges.map(badge => {
            const isUnlocked = badge.unlocked;
            const rarity = badge.rarity || 'common';
            const date = badge.unlocked_at ? H.formatDate(new Date(badge.unlocked_at)) : null;

            return `
                <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'} ${rarity}">
                    ${!isUnlocked ? `<div class="badge-lock">${H.getIcon('lock')}</div>` : ''}
                    <div class="badge-icon">${badge.icon || '🏆'}</div>
                    <div class="badge-name">${H.escapeHtml(badge.name)}</div>
                    <div class="badge-rarity">${rarity}</div>
                    ${date ? `<div class="badge-date">${date}</div>` : ''}
                    <div class="badge-tooltip">
                        <div class="badge-tooltip-title">${H.escapeHtml(badge.name)}</div>
                        <div class="badge-tooltip-desc">${H.escapeHtml(badge.description || '')}</div>
                        ${badge.xp_reward ? `<div class="badge-tooltip-reward">+${badge.xp_reward} XP</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderLeaderboard(leaderboard) {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;

        if (!leaderboard || leaderboard.length === 0) {
            container.innerHTML = '<div class="empty-state">Aucun classement disponible</div>';
            return;
        }

        container.innerHTML = leaderboard.map((entry, index) => {
            const rank = index + 1;
            const topClass = rank <= 3 ? `top-${rank}` : '';
            const user = entry.user || {};
            const initial = (user.name || 'U').charAt(0).toUpperCase();

            return `
                <div class="leaderboard-item ${topClass}">
                    <div class="rank-badge">${rank}</div>
                    <div class="user-avatar">${initial}</div>
                    <div class="user-info">
                        <div class="user-name">${H.escapeHtml(user.name || 'Utilisateur')}</div>
                        <div class="user-level">Niveau ${entry.level || 1}</div>
                    </div>
                    <div class="user-xp">${(entry.xp_earned || 0).toLocaleString()} XP</div>
                </div>
            `;
        }).join('');
    }

    function renderStreakCalendar(profile) {
        const container = document.getElementById('streak-calendar');
        if (!container) return;

        const today = new Date();
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            days.push(date);
        }

        const activeDays = new Set();
        if (profile?.streaks) {
            profile.streaks.forEach(streak => {
                if (streak.is_active) {
                    const lastActivity = new Date(streak.last_activity_date);
                    for (let i = 0; i < streak.current_count; i++) {
                        const d = new Date(lastActivity);
                        d.setDate(lastActivity.getDate() - i);
                        activeDays.add(d.toDateString());
                    }
                }
            });
        }

        if (profile?.current_streak > 0) {
            for (let i = 0; i < profile.current_streak && i < 30; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                activeDays.add(d.toDateString());
            }
        }

        container.innerHTML = days.map(date => {
            const isToday = date.toDateString() === today.toDateString();
            const isActive = activeDays.has(date.toDateString());
            return `<div class="streak-day ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}" title="${H.formatDate(date)}"></div>`;
        }).join('');
    }

    function renderXpHistory(xpHistory) {
        const container = document.getElementById('xp-history-list');
        if (!container) return;

        if (!xpHistory || xpHistory.length === 0) {
            container.innerHTML = '<div class="empty-state">Aucune transaction XP</div>';
            return;
        }

        container.innerHTML = xpHistory.map(event => {
            const isPositive = event.amount >= 0;
            const reasonLabel = H.getReasonLabel(event.reason);
            const time = H.formatTime(new Date(event.created_at));

            return `
                <div class="xp-history-item">
                    <div class="xp-history-left">
                        <div class="xp-reason-icon">${H.getIcon('zap')}</div>
                        <div>
                            <div class="xp-reason-text">${reasonLabel}</div>
                            <div class="xp-reason-time">${time}</div>
                        </div>
                    </div>
                    <div class="xp-amount ${isPositive ? '' : 'negative'}">
                        ${isPositive ? '+' : ''}${event.amount} XP
                    </div>
                </div>
            `;
        }).join('');
    }

    return {
        renderProfile,
        renderStats,
        renderBadges,
        renderLeaderboard,
        renderStreakCalendar,
        renderXpHistory
    };
})();

if (typeof window !== 'undefined') {
    window.GVRender = GVRender;
}
