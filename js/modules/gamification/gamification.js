/**
 * Gamification Module - Main Orchestrator
 * Coordinates all gamification components
 */

const Gamification = (function() {
    'use strict';

    let initialized = false;
    let container = null;

    /**
     * Initialize gamification system
     * @param {string} containerId - ID of container element
     */
    async function init(containerId = 'view-gamification') {
        if (initialized) {
            console.log('🎮 Gamification already initialized');
            return;
        }

        container = document.getElementById(containerId);
        if (!container) {
            console.warn('⚠️ Gamification container not found:', containerId);
            return;
        }

        console.log('🎮 Initializing Gamification...');

        try {
            await loadAndRender();
            initialized = true;
            console.log('✅ Gamification initialized successfully');
        } catch (error) {
            console.error('❌ Gamification init failed:', error);
            renderError();
        }
    }

    /**
     * Load data and render all components
     */
    async function loadAndRender() {
        showLoading();

        let data;
        try {
            data = await GamificationAPI.getAll();
        } catch (error) {
            console.warn('⚠️ API failed, using mock data');
            data = GamificationAPI.getMockData();
        }

        render(data);
    }

    /**
     * Render all gamification components
     * @param {Object} data - All gamification data
     */
    function render(data) {
        if (!container) return;

        container.innerHTML = `
            <div class="gam-container">
                <div class="gam-header">
                    <h2 class="gam-title">🎮 Gamification</h2>
                    <button class="gam-close-btn" id="gam-close-btn">✕</button>
                </div>
                <div class="gam-content">
                    <div class="gam-profile-section" id="gam-profile"></div>
                    <div class="gam-grid">
                        <div class="gam-streak-section" id="gam-streak"></div>
                        <div class="gam-leaderboard-section" id="gam-leaderboard"></div>
                    </div>
                    <div class="gam-achievements-section" id="gam-achievements"></div>
                </div>
            </div>
        `;

        // Render each component
        const profileEl = document.getElementById('gam-profile');
        const streakEl = document.getElementById('gam-streak');
        const leaderboardEl = document.getElementById('gam-leaderboard');
        const achievementsEl = document.getElementById('gam-achievements');

        if (profileEl && data.profile) {
            GamificationProfile.render(profileEl, data.profile);
        }

        if (streakEl && data.streak) {
            GamificationStreak.render(streakEl, data.streak);
        }

        if (leaderboardEl && data.leaderboard) {
            GamificationLeaderboard.render(leaderboardEl, data.leaderboard, data.profile?.userId);
        }

        if (achievementsEl && data.achievements) {
            GamificationAchievements.render(achievementsEl, data.achievements);
        }

        // Attach close button handler
        const closeBtn = document.getElementById('gam-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', hide);
        }
    }

    /**
     * Show loading state
     */
    function showLoading() {
        if (!container) return;
        container.innerHTML = `
            <div class="gam-container">
                <div class="gam-loading">
                    <div class="gam-spinner"></div>
                    <p>Chargement...</p>
                </div>
            </div>
        `;
    }

    /**
     * Render error state
     */
    function renderError() {
        if (!container) return;
        container.innerHTML = `
            <div class="gam-container">
                <div class="gam-error">
                    <p>❌ Erreur de chargement</p>
                    <button onclick="Gamification.refresh()">Réessayer</button>
                </div>
            </div>
        `;
    }

    /**
     * Show gamification view
     */
    function show() {
        if (!container) {
            container = document.getElementById('view-gamification');
        }
        if (container) {
            container.classList.add('visible');
            if (!initialized) {
                init();
            }
        }
    }

    /**
     * Hide gamification view
     */
    function hide() {
        if (container) {
            container.classList.remove('visible');
        }
    }

    /**
     * Toggle gamification view
     */
    function toggle() {
        if (container?.classList.contains('visible')) {
            hide();
        } else {
            show();
        }
    }

    /**
     * Refresh data
     */
    async function refresh() {
        initialized = false;
        await loadAndRender();
        initialized = true;
    }

    /**
     * Record an action and update UI
     * @param {string} action - Action type
     * @param {Object} metadata - Additional data
     */
    async function recordAction(action, metadata = {}) {
        try {
            const result = await GamificationAPI.recordAction(action, metadata);

            if (result.xpGained) {
                GamificationProfile.updateXP(result.newXP, result.xpGained);
            }

            if (result.levelUp) {
                GamificationProfile.levelUp(result.newLevel, result.nextLevelXP);
            }

            if (result.achievementUnlocked) {
                GamificationAchievements.unlockAchievement(result.achievementUnlocked);
            }

            if (result.streakUpdated) {
                GamificationStreak.markDayActive(new Date().getDate());
            }

            return result;
        } catch (error) {
            console.error('❌ Failed to record action:', error);
        }
    }

    /**
     * Get current stats
     */
    function getStats() {
        return {
            profile: GamificationProfile.getData(),
            streak: GamificationStreak.getData(),
            achievements: GamificationAchievements.getData(),
            leaderboard: GamificationLeaderboard.getData()
        };
    }

    return {
        init,
        show,
        hide,
        toggle,
        refresh,
        recordAction,
        getStats
    };
})();

if (typeof window !== 'undefined') {
    window.Gamification = Gamification;
}
