/**
 * ANALYTICS VIEW - ProductiveApp v4.0
 * Orchestrates the analytics dashboard
 */

var AnalyticsView = (function() {
    'use strict';

    var currentPeriod = 7;
    var data = null;

    var icons = {
        chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'
    };

    async function render() {
        var container = document.getElementById('view-analytics');
        if (!container) return;

        if (typeof AnalyticsStyles !== 'undefined') {
            AnalyticsStyles.inject();
        } else {
            injectFallbackStyles();
        }
        container.innerHTML = renderLayout();
        attachEvents();
        await loadData();
    }

    function injectFallbackStyles() {
        if (document.getElementById('analytics-view-styles')) return;
        var s = document.createElement('style');
        s.id = 'analytics-view-styles';
        s.textContent = '.analytics-page{max-width:1200px;margin:0 auto}.analytics-period-selector{display:flex;gap:8px;margin-bottom:24px;background:var(--surface,#1a1a2e);padding:4px;border-radius:12px;width:fit-content}.period-btn{padding:10px 20px;border:none;background:transparent;color:var(--text-muted);border-radius:8px;cursor:pointer;font-weight:500}.period-btn.active{background:var(--primary,#8b5cf6);color:#fff}.analytics-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}.analytics-grid{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px}.analytics-card{background:var(--surface,#1a1a2e);border-radius:16px;padding:20px;margin-bottom:16px}.analytics-card-header h3{margin:0 0 16px;font-size:16px;color:var(--text)}.analytics-chart{height:200px}.analytics-chart svg{width:100%;height:100%}.analytics-heatmap{height:120px;overflow-x:auto}.analytics-heatmap svg{min-width:100%;height:100%}.streak-main{text-align:center;padding:20px 0}.streak-icon{font-size:48px}.streak-value{font-size:48px;font-weight:800;color:var(--text)}.streak-label{color:var(--text-muted)}.streak-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)}.streak-stat{text-align:center}.streak-stat-value{font-weight:600;color:var(--text)}.streak-stat-label{font-size:11px;color:var(--text-muted)}.activity-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}.activity-icon{width:32px;height:32px;border-radius:8px;background:var(--surface-hover);display:flex;align-items:center;justify-content:center}.activity-content{flex:1}.activity-content strong{color:var(--text)}.activity-time{font-size:12px;color:var(--text-muted)}.stat-icon.green{color:#22c55e}.stat-icon.blue{color:#3b82f6}.stat-icon.orange{color:#f59e0b}.stat-icon.up{color:#22c55e}.stat-icon.down{color:#ef4444}.loading,.error,.empty-state{text-align:center;padding:40px;color:var(--text-muted)}@media(max-width:768px){.analytics-stats-row{grid-template-columns:repeat(2,1fr)}.analytics-grid{grid-template-columns:1fr}}';
        document.head.appendChild(s);
    }

    function renderLayout() {
        return '<div class="analytics-page">' +
            '<div class="view-header">' +
                '<h1 class="view-title">' +
                    '<span class="view-title-icon">' + icons.chart + '</span>' +
                    'Analytics' +
                '</h1>' +
                '<div class="view-actions">' +
                    '<button class="btn btn-secondary" id="analytics-refresh-btn">' +
                        icons.refresh + '<span>Actualiser</span>' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="analytics-period-selector">' +
                '<button class="period-btn active" data-days="7">7 jours</button>' +
                '<button class="period-btn" data-days="30">30 jours</button>' +
                '<button class="period-btn" data-days="90">90 jours</button>' +
            '</div>' +
            '<div class="analytics-stats-row" id="analytics-stats"></div>' +
            '<div class="analytics-grid">' +
                '<div class="analytics-card analytics-chart-card">' +
                    '<div class="analytics-card-header">' +
                        '<h3>Productivite quotidienne</h3>' +
                    '</div>' +
                    '<div class="analytics-chart" id="analytics-bar-chart"></div>' +
                '</div>' +
                '<div class="analytics-card analytics-streak-card">' +
                    '<div class="analytics-card-header">' +
                        '<h3>Streak & Stats</h3>' +
                    '</div>' +
                    '<div id="analytics-streak-content"></div>' +
                '</div>' +
            '</div>' +
            '<div class="analytics-card analytics-heatmap-card">' +
                '<div class="analytics-card-header">' +
                    '<h3>Activite (90 derniers jours)</h3>' +
                '</div>' +
                '<div class="analytics-heatmap" id="analytics-heatmap"></div>' +
            '</div>' +
            '<div class="analytics-card">' +
                '<div class="analytics-card-header">' +
                    '<h3>Activite recente</h3>' +
                '</div>' +
                '<div class="analytics-activity" id="analytics-activity"></div>' +
            '</div>' +
        '</div>';
    }

    async function loadData() {
        showLoading();
        try {
            data = await AnalyticsAPI.getAll(currentPeriod);
            renderData();
        } catch (error) {
            console.error('Analytics load error:', error);
            showError();
        }
    }

    function renderData() {
        if (!data) return;
        renderStats(data.productivity);
        renderChart(data.dailyStats);
        renderStreak(data.productivity);
        renderHeatmap(data.activity.heatmap);
        renderActivity(data.activity.recent);
    }

    function renderStats(prod) {
        var container = document.getElementById('analytics-stats');
        if (!container || !prod) return;

        var trendIcon = prod.trend === 'up' ? '↑' : (prod.trend === 'down' ? '↓' : '→');
        var trendClass = prod.trend === 'up' ? 'up' : (prod.trend === 'down' ? 'down' : '');

        container.innerHTML =
            '<div class="stat-card">' +
                '<div class="stat-icon green">✓</div>' +
                '<div class="stat-content">' +
                    '<h3>' + (prod.tasks_completed || 0) + '</h3>' +
                    '<p>Taches completees</p>' +
                '</div>' +
            '</div>' +
            '<div class="stat-card">' +
                '<div class="stat-icon blue">%</div>' +
                '<div class="stat-content">' +
                    '<h3>' + (prod.completion_rate || 0) + '%</h3>' +
                    '<p>Taux completion</p>' +
                '</div>' +
            '</div>' +
            '<div class="stat-card">' +
                '<div class="stat-icon orange">📅</div>' +
                '<div class="stat-content">' +
                    '<h3>' + (prod.best_day || '-') + '</h3>' +
                    '<p>Meilleur jour</p>' +
                '</div>' +
            '</div>' +
            '<div class="stat-card">' +
                '<div class="stat-icon ' + trendClass + '">' + trendIcon + '</div>' +
                '<div class="stat-content">' +
                    '<h3>' + (prod.trend_percent > 0 ? '+' : '') + (prod.trend_percent || 0) + '%</h3>' +
                    '<p>Tendance</p>' +
                '</div>' +
            '</div>';
    }

    function renderChart(dailyStats) {
        if (typeof AnalyticsCharts !== 'undefined') {
            AnalyticsCharts.renderBarChart('analytics-bar-chart', dailyStats);
        }
    }

    function renderStreak(prod) {
        var container = document.getElementById('analytics-streak-content');
        if (!container || !prod) return;

        container.innerHTML =
            '<div class="streak-main">' +
                '<div class="streak-icon">🔥</div>' +
                '<div class="streak-value">' + (prod.current_streak || 0) + '</div>' +
                '<div class="streak-label">jours consecutifs</div>' +
            '</div>' +
            '<div class="streak-stats">' +
                '<div class="streak-stat">' +
                    '<span class="streak-stat-value">🏆 ' + (prod.best_streak || 0) + '</span>' +
                    '<span class="streak-stat-label">Record</span>' +
                '</div>' +
                '<div class="streak-stat">' +
                    '<span class="streak-stat-value">⏰ ' + (prod.best_hour || 10) + 'h</span>' +
                    '<span class="streak-stat-label">Heure productive</span>' +
                '</div>' +
                '<div class="streak-stat">' +
                    '<span class="streak-stat-value">📊 ' + (prod.avg_tasks_per_day || 0) + '</span>' +
                    '<span class="streak-stat-label">Taches/jour</span>' +
                '</div>' +
            '</div>';
    }

    function renderHeatmap(heatmapData) {
        if (typeof AnalyticsCharts !== 'undefined') {
            AnalyticsCharts.renderHeatmap('analytics-heatmap', heatmapData);
        }
    }

    function renderActivity(recent) {
        var container = document.getElementById('analytics-activity');
        if (!container) return;

        if (!recent || !recent.length) {
            container.innerHTML = '<div class="empty-state">Aucune activite recente</div>';
            return;
        }

        container.innerHTML = recent.slice(0, 5).map(function(item) {
            var icon = item.type === 'task' ? '✓' : (item.type === 'note' ? '📝' : '📌');
            var time = formatRelativeTime(item.time);
            return '<div class="activity-item">' +
                '<div class="activity-icon">' + icon + '</div>' +
                '<div class="activity-content">' +
                    '<strong>' + escapeHtml(item.title) + '</strong>' +
                    '<span class="activity-action">' + (item.action || '') + '</span>' +
                '</div>' +
                '<div class="activity-time">' + time + '</div>' +
            '</div>';
        }).join('');
    }

    function showLoading() {
        var stats = document.getElementById('analytics-stats');
        if (stats) stats.innerHTML = '<div class="loading">Chargement...</div>';
    }

    function showError() {
        var stats = document.getElementById('analytics-stats');
        if (stats) stats.innerHTML = '<div class="error">Erreur de chargement</div>';
    }

    function attachEvents() {
        document.querySelectorAll('.period-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.period-btn').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentPeriod = parseInt(btn.dataset.days);
                loadData();
            });
        });

        var refreshBtn = document.getElementById('analytics-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() { loadData(); });
        }
    }

    function formatRelativeTime(dateStr) {
        if (!dateStr) return '';
        var diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return 'maintenant';
        if (diff < 3600) return Math.floor(diff / 60) + 'min';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        return Math.floor(diff / 86400) + 'j';
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function refresh() { render(); }
    function init() { console.log('📊 AnalyticsView: Ready'); }

    return { init: init, render: render, refresh: refresh };
})();

if (typeof window !== 'undefined') {
    window.AnalyticsView = AnalyticsView;
}
