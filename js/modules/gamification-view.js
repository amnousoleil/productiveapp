/**
 * GAMIFICATION VIEW - ProductiveApp v4.0
 * Orchestrateur - utilise les sous-modules gv-*.js
 * Modules requis: GVStyles, GVApi, GVHelpers, GVRender
 */

const GamificationView = (function() {
    'use strict';

    let state = {
        profile: null,
        badges: null,
        leaderboard: [],
        xpHistory: [],
        loading: false
    };

    /**
     * Build the main HTML template
     */
    function buildTemplate() {
        const H = GVHelpers;
        return `
            <div class="gamification-page">
                <div class="gamif-header">
                    <div class="gamif-header-left">
                        <h1 class="view-title">
                            <span class="view-title-icon">${H.getIcon('trophy')}</span>
                            Gamification
                        </h1>
                    </div>
                    <div class="gamif-level-display" id="gamif-level-display">
                        <div class="level-badge">
                            <span class="level-number">-</span>
                        </div>
                        <div class="xp-bar-wrapper">
                            <div class="xp-bar">
                                <div class="xp-bar-fill" id="xp-bar-fill" style="width: 0%"></div>
                            </div>
                            <div class="xp-text" id="xp-text">0 / 100 XP</div>
                        </div>
                    </div>
                </div>

                <div class="gamif-stats" id="gamif-stats">
                    <div class="stat-card">
                        <div class="stat-icon gold">${H.getIcon('zap')}</div>
                        <div class="stat-content">
                            <div class="stat-value" id="stat-xp">-</div>
                            <div class="stat-label">XP Total</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon blue">${H.getIcon('star')}</div>
                        <div class="stat-content">
                            <div class="stat-value" id="stat-level">-</div>
                            <div class="stat-label">Niveau</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange">${H.getIcon('flame')}</div>
                        <div class="stat-content">
                            <div class="stat-value" id="stat-streak">-</div>
                            <div class="stat-label">Streak actuel</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon green">${H.getIcon('check')}</div>
                        <div class="stat-content">
                            <div class="stat-value" id="stat-badges">-</div>
                            <div class="stat-label">Badges</div>
                        </div>
                    </div>
                </div>

                <div class="gamif-grid">
                    <div class="gamif-section badges-section">
                        <h2 class="section-title">${H.getIcon('award')} Badges</h2>
                        <div class="badges-grid" id="badges-grid">
                            <div class="loading">Chargement...</div>
                        </div>
                    </div>
                    <div class="gamif-section leaderboard-section">
                        <h2 class="section-title">${H.getIcon('users')} Classement</h2>
                        <div class="leaderboard-list" id="leaderboard-list">
                            <div class="loading">Chargement...</div>
                        </div>
                    </div>
                </div>

                <div class="gamif-section streak-section">
                    <h2 class="section-title">${H.getIcon('calendar')} Activite (30 derniers jours)</h2>
                    <div class="streak-calendar" id="streak-calendar">
                        <div class="loading">Chargement...</div>
                    </div>
                </div>

                <div class="gamif-section history-section">
                    <h2 class="section-title">${H.getIcon('clock')} Historique XP</h2>
                    <div class="xp-history-list" id="xp-history-list">
                        <div class="loading">Chargement...</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Main render function
     */
    async function render() {
        const container = document.getElementById('view-gamification');
        if (!container) return;

        container.innerHTML = buildTemplate();
        GVStyles.inject();

        state.loading = true;
        try {
            const data = await GVApi.loadAll();
            state.profile = data.profile;
            state.badges = data.badges;
            state.leaderboard = data.leaderboard;
            state.xpHistory = data.xpHistory;

            GVRender.renderProfile(state.profile);
            GVRender.renderStats(state.profile);
            GVRender.renderBadges(state.badges);
            GVRender.renderLeaderboard(state.leaderboard);
            GVRender.renderStreakCalendar(state.profile);
            GVRender.renderXpHistory(state.xpHistory);
        } catch (error) {
            console.error('GamificationView: Error loading data:', error);
        }
        state.loading = false;
    }

    /**
     * Refresh view
     */
    async function refresh() {
        await render();
    }

    /**
     * Get current state
     */
    function getState() {
        return state;
    }

    return {
        render,
        refresh,
        getState
    };
})();

if (typeof window !== 'undefined') {
    window.GamificationView = GamificationView;
}
