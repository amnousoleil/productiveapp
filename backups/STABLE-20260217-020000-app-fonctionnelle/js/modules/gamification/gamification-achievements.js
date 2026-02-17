/**
 * Gamification Achievements Component
 * Displays grid of unlocked and locked achievements
 */

const GamificationAchievements = (function() {
    'use strict';

    let achievementsData = [];

    /**
     * Render the achievements grid
     * @param {HTMLElement} container - Container element
     * @param {Array} achievements - Achievements array
     */
    function render(container, achievements) {
        if (!container || !achievements) return;
        achievementsData = achievements;

        const unlockedCount = achievements.filter(a => a.unlocked).length;

        container.innerHTML = `
            <div class="gam-achievements">
                <div class="gam-section-title">
                    🏆 Achievements <span style="color:var(--gam-text-muted);font-weight:400;">(${unlockedCount}/${achievements.length})</span>
                </div>
                <div class="gam-achievements-grid">
                    ${achievements.map(a => renderAchievement(a)).join('')}
                </div>
            </div>
        `;

        // Add click handlers for achievement details
        container.querySelectorAll('.gam-achievement').forEach(el => {
            el.addEventListener('click', () => showAchievementDetails(el.dataset.id));
        });
    }

    /**
     * Render single achievement card
     * @param {Object} achievement - Achievement data
     */
    function renderAchievement(achievement) {
        const statusClass = achievement.unlocked ? 'unlocked' : 'locked';
        const dateHtml = achievement.unlocked && achievement.unlockedAt
            ? `<div class="gam-achievement-date">${formatDate(achievement.unlockedAt)}</div>`
            : '';
        const conditionHtml = !achievement.unlocked && achievement.condition
            ? `<div class="gam-achievement-date" style="color:var(--gam-text-muted);">${achievement.condition}</div>`
            : '';

        return `
            <div class="gam-achievement ${statusClass}" data-id="${achievement.id}">
                <div class="gam-achievement-icon">${achievement.icon}</div>
                <div class="gam-achievement-name">${escapeHtml(achievement.name)}</div>
                <div class="gam-achievement-desc">${escapeHtml(achievement.desc)}</div>
                ${dateHtml}
                ${conditionHtml}
            </div>
        `;
    }

    /**
     * Unlock an achievement with animation
     * @param {string} achievementId - Achievement ID
     */
    function unlockAchievement(achievementId) {
        const achievement = achievementsData.find(a => a.id === achievementId);
        if (!achievement || achievement.unlocked) return;

        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString().split('T')[0];

        const el = document.querySelector(`.gam-achievement[data-id="${achievementId}"]`);
        if (el) {
            el.classList.remove('locked');
            el.classList.add('unlocked');
            el.style.animation = 'achievementUnlock 0.6s ease-out';

            // Update date
            const dateEl = el.querySelector('.gam-achievement-date');
            if (dateEl) {
                dateEl.style.color = 'var(--gam-accent)';
                dateEl.textContent = formatDate(achievement.unlockedAt);
            }
        }

        // Show notification
        showUnlockNotification(achievement);
    }

    /**
     * Show achievement unlock notification
     * @param {Object} achievement - Achievement data
     */
    function showUnlockNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'gam-unlock-notification';
        notification.innerHTML = `
            <div class="gam-unlock-icon">${achievement.icon}</div>
            <div class="gam-unlock-text">
                <strong>Achievement débloqué!</strong>
                <span>${achievement.name}</span>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gam-card);
            border: 2px solid var(--gam-accent);
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 30px var(--gam-accent-glow);
            z-index: 10000;
            animation: slideInRight 0.4s ease-out;
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease-in forwards';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }

    /**
     * Show achievement details modal
     * @param {string} achievementId - Achievement ID
     */
    function showAchievementDetails(achievementId) {
        const achievement = achievementsData.find(a => a.id === achievementId);
        if (!achievement) return;

        console.log('📋 Achievement details:', achievement);
        // Could show a modal here if needed
    }

    /**
     * Get achievements by status
     * @param {boolean} unlocked - Filter by unlocked status
     */
    function getByStatus(unlocked) {
        return achievementsData.filter(a => a.unlocked === unlocked);
    }

    /**
     * Format date to locale string
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
        return achievementsData;
    }

    return {
        render,
        unlockAchievement,
        getByStatus,
        getData
    };
})();

if (typeof window !== 'undefined') {
    window.GamificationAchievements = GamificationAchievements;
}
