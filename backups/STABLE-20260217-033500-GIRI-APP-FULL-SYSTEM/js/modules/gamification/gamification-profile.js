/**
 * Gamification Profile Card Component
 * Displays avatar, name, level, XP bar, total XP
 */

const GamificationProfile = (function() {
    'use strict';

    let profileData = null;

    /**
     * Render the profile card
     * @param {HTMLElement} container - Container element
     * @param {Object} data - Profile data
     */
    function render(container, data) {
        if (!container || !data) return;
        profileData = data;

        const xpProgress = Math.round((data.currentXP / data.nextLevelXP) * 100);
        const avatarHtml = data.avatar?.startsWith('http')
            ? `<img src="${data.avatar}" alt="${data.name}" class="gam-avatar">`
            : `<div class="gam-avatar" style="display:flex;align-items:center;justify-content:center;font-size:2.5rem;background:var(--gam-accent-muted);">${data.avatar || '👤'}</div>`;

        container.innerHTML = `
            <div class="gam-profile-card">
                ${avatarHtml}
                <div class="gam-profile-info">
                    <div class="gam-profile-name">${escapeHtml(data.name)}</div>
                    <div class="gam-profile-level">
                        <span class="gam-level-badge">Niveau ${data.level}</span>
                        <span class="gam-xp-total">${formatNumber(data.totalXP)} XP total</span>
                    </div>
                    <div class="gam-xp-bar-container">
                        <div class="gam-xp-bar-label">
                            <span>${formatNumber(data.currentXP)} XP</span>
                            <span>Niveau ${data.level + 1} : ${formatNumber(data.nextLevelXP)} XP</span>
                        </div>
                        <div class="gam-xp-bar">
                            <div class="gam-xp-bar-fill" style="width: 0%;" data-target="${xpProgress}"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Animate XP bar after render
        requestAnimationFrame(() => {
            const bar = container.querySelector('.gam-xp-bar-fill');
            if (bar) {
                bar.style.width = bar.dataset.target + '%';
            }
        });
    }

    /**
     * Update XP with animation
     * @param {number} newXP - New current XP value
     * @param {number} xpGained - XP gained (for floating animation)
     */
    function updateXP(newXP, xpGained = 0) {
        if (!profileData) return;

        profileData.currentXP = newXP;
        profileData.totalXP += xpGained;

        // Update display
        const container = document.querySelector('.gam-profile-card');
        if (!container) return;

        const xpProgress = Math.round((newXP / profileData.nextLevelXP) * 100);
        const bar = container.querySelector('.gam-xp-bar-fill');
        const xpLabel = container.querySelector('.gam-xp-bar-label span:first-child');
        const totalLabel = container.querySelector('.gam-xp-total');

        if (bar) bar.style.width = xpProgress + '%';
        if (xpLabel) xpLabel.textContent = formatNumber(newXP) + ' XP';
        if (totalLabel) totalLabel.textContent = formatNumber(profileData.totalXP) + ' XP total';

        // Show XP gain animation if gained
        if (xpGained > 0) {
            showXPGain(xpGained);
        }
    }

    /**
     * Handle level up
     * @param {number} newLevel - New level
     * @param {number} nextLevelXP - XP needed for next level
     */
    function levelUp(newLevel, nextLevelXP) {
        if (!profileData) return;

        profileData.level = newLevel;
        profileData.nextLevelXP = nextLevelXP;
        profileData.currentXP = 0;

        const container = document.querySelector('.gam-profile-card');
        if (!container) return;

        const badge = container.querySelector('.gam-level-badge');
        const nextLabel = container.querySelector('.gam-xp-bar-label span:last-child');
        const bar = container.querySelector('.gam-xp-bar-fill');

        if (badge) badge.textContent = 'Niveau ' + newLevel;
        if (nextLabel) nextLabel.textContent = `Niveau ${newLevel + 1} : ${formatNumber(nextLevelXP)} XP`;
        if (bar) bar.style.width = '0%';

        // Level up animation
        if (badge) {
            badge.style.animation = 'none';
            badge.offsetHeight; // Trigger reflow
            badge.style.animation = 'levelUp 0.6s ease-out';
        }
    }

    /**
     * Show floating XP gain animation
     * @param {number} amount - XP amount gained
     */
    function showXPGain(amount) {
        const card = document.querySelector('.gam-profile-card');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const el = document.createElement('div');
        el.className = 'gam-xp-gain';
        el.textContent = `+${amount} XP`;
        el.style.left = (rect.left + rect.width / 2) + 'px';
        el.style.top = (rect.top + 20) + 'px';

        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format number with thousands separator
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    /**
     * Get current profile data
     */
    function getData() {
        return profileData;
    }

    return {
        render,
        updateXP,
        levelUp,
        showXPGain,
        getData
    };
})();

if (typeof window !== 'undefined') {
    window.GamificationProfile = GamificationProfile;
}
