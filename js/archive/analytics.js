/**
 * Analytics Module - Main Orchestrator
 * Coordinates all analytics components
 */

const Analytics = (function() {
    'use strict';

    let initialized = false;
    let container = null;

    /**
     * Initialize analytics module
     * @param {string} containerId - ID of container element
     */
    async function init(containerId = 'view-analytics') {
        if (initialized) {
            console.log('📊 Analytics already initialized');
            return;
        }

        container = document.getElementById(containerId);
        if (!container) {
            console.warn('⚠️ Analytics container not found:', containerId);
            return;
        }

        console.log('📊 Initializing Analytics...');

        try {
            renderLayout();
            showLoading();

            // Load all data
            await Promise.all([
                AnalyticsDashboard.load(),
                AnalyticsCharts.init()
            ]);

            initialized = true;
            console.log('✅ Analytics initialized successfully');

        } catch (error) {
            console.error('❌ Analytics init failed:', error);
            renderError();
        }
    }

    /**
     * Render the main layout
     */
    function renderLayout() {
        container.innerHTML = `
            <div class="analytics-container">
                <div class="analytics-header">
                    <h1 class="analytics-title">
                        <span>📊</span>
                        <span>Analytics</span>
                    </h1>
                    <p class="analytics-subtitle">Vue d'ensemble de votre activité</p>
                </div>

                <!-- Stats Cards Row -->
                <div class="analytics-stats-row" id="analytics-stats-row">
                    <!-- Rendered by AnalyticsDashboard -->
                </div>

                <!-- Charts Row -->
                <div class="analytics-charts-row">
                    <!-- Activity Chart -->
                    <div class="analytics-chart-card">
                        <div class="analytics-chart-header">
                            <div class="analytics-chart-title">Activité</div>
                            <div class="analytics-chart-period">
                                <button class="analytics-period-btn active" data-days="7">7j</button>
                                <button class="analytics-period-btn" data-days="14">14j</button>
                                <button class="analytics-period-btn" data-days="30">30j</button>
                            </div>
                        </div>
                        <canvas class="analytics-chart-canvas" id="analytics-chart-canvas"></canvas>
                    </div>

                    <!-- Streak Card -->
                    <div class="analytics-chart-card analytics-streak-card" id="analytics-streak-card">
                        <!-- Rendered by AnalyticsDashboard -->
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="analytics-activity-section">
                    <div class="analytics-activity-title">
                        <span>⚡</span>
                        <span>Activité récente</span>
                    </div>
                    <div class="analytics-activity-list" id="analytics-activity-list">
                        <!-- Rendered by AnalyticsDashboard -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show loading state
     */
    function showLoading() {
        const statsRow = document.getElementById('analytics-stats-row');
        if (statsRow) {
            statsRow.innerHTML = `
                <div class="analytics-loading" style="grid-column: 1 / -1;">
                    <div class="analytics-loading-spinner"></div>
                    <p>Chargement des statistiques...</p>
                </div>
            `;
        }
    }

    /**
     * Render error state
     */
    function renderError() {
        if (!container) return;

        container.innerHTML = `
            <div class="analytics-container">
                <div style="text-align: center; padding: 80px 40px; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 1.1rem; margin-bottom: 16px;">Erreur de chargement</div>
                    <button onclick="Analytics.refresh()" style="padding: 12px 24px; border-radius: 10px; background: var(--accent); color: white; border: none; cursor: pointer; font-weight: 600;">
                        Réessayer
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Show analytics view
     */
    function show() {
        if (!initialized) {
            init();
        }

        if (typeof Router !== 'undefined') {
            Router.navigate('analytics');
        } else {
            document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
            const view = document.getElementById('view-analytics');
            if (view) view.classList.add('active');
        }
    }

    /**
     * Refresh data
     */
    async function refresh() {
        initialized = false;
        await init();
    }

    /**
     * Get current stats
     */
    function getStats() {
        return AnalyticsDashboard.getData();
    }

    /**
     * Check if initialized
     */
    function isInitialized() {
        return initialized;
    }

    return {
        init,
        show,
        refresh,
        getStats,
        isInitialized
    };
})();

if (typeof window !== 'undefined') {
    window.Analytics = Analytics;
}
