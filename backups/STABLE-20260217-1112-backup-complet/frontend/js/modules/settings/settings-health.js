/**
 * SETTINGS HEALTH - ProductiveApp v5.0
 * Onglet "Santé Système" pour monitoring (admin only)
 */

const SettingsHealth = (function() {
    'use strict';

    let healthData = null;
    let errorsData = [];
    let alertsData = [];
    let refreshInterval = null;

    /**
     * Render health system section
     */
    function render(icons) {
        const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';

        return '<section class="settings-section" id="settings-health-section">' +
            '<h2 class="settings-section-title">' + icon + '<span>Santé Système</span></h2>' +
            '<div class="settings-card" style="padding: 20px;">' +
                '<div id="health-dashboard">' +
                    '<div class="health-loading">Chargement...</div>' +
                '</div>' +
            '</div>' +
        '</section>';
    }

    /**
     * Initialize health dashboard
     */
    async function init() {
        try {
            await loadData();
            renderDashboard();
            startAutoRefresh();
        } catch (error) {
            console.error('Failed to load health data:', error);
            showError('Impossible de charger les données de santé système');
        }
    }

    /**
     * Load all monitoring data
     */
    async function loadData() {
        const [health, errors, alerts] = await Promise.all([
            ApiMonitoring.getHealth().catch(() => null),
            ApiMonitoring.getErrors(10, 0).then(r => r.data?.errors || []).catch(() => []),
            ApiMonitoring.getAlerts().then(r => r.data?.alerts || []).catch(() => []),
        ]);

        healthData = health;
        errorsData = errors;
        alertsData = alerts;
    }

    /**
     * Render dashboard content
     */
    function renderDashboard() {
        const container = document.getElementById('health-dashboard');
        if (!container) return;

        let html = '';

        // 1. Status badges
        html += renderStatusBadges();

        // 2. Metrics cards
        html += renderMetrics();

        // 3. Alerts
        if (alertsData.length > 0) {
            html += renderAlerts();
        }

        // 4. Recent errors
        html += renderRecentErrors();

        // 5. Actions
        html += renderActions();

        container.innerHTML = html;
    }

    /**
     * Render status badges
     */
    function renderStatusBadges() {
        if (!healthData) {
            return '<div class="health-status-error">❌ Service indisponible</div>';
        }

        const statusIcon = healthData.status === 'healthy' ? '✅' :
                          healthData.status === 'degraded' ? '⚠️' : '❌';
        const statusText = healthData.status === 'healthy' ? 'Sain' :
                          healthData.status === 'degraded' ? 'Dégradé' : 'En panne';
        const statusClass = 'health-status-' + healthData.status;

        return '<div class="health-status-row">' +
            '<div class="health-status-badge ' + statusClass + '">' +
                statusIcon + ' ' + statusText +
            '</div>' +
            '<div class="health-timestamp">Dernière vérification : ' + formatTimestamp(healthData.timestamp) + '</div>' +
        '</div>';
    }

    /**
     * Render metrics
     */
    function renderMetrics() {
        if (!healthData) return '';

        const dbStatus = healthData.database?.status || 'unknown';
        const dbIcon = dbStatus === 'ok' ? '🟢' : dbStatus === 'slow' ? '🟡' : '🔴';
        const dbText = dbStatus === 'ok' ? 'OK' : dbStatus === 'slow' ? 'Lent' : 'Erreur';
        const dbResponseTime = healthData.database?.responseTimeMs || 0;

        const memPercent = healthData.memory?.percent || 0;
        const memUsed = healthData.memory?.usedMb || 0;
        const memTotal = healthData.memory?.totalMb || 0;
        const memIcon = memPercent < 70 ? '🟢' : memPercent < 90 ? '🟡' : '🔴';

        const cpuPercent = healthData.cpu?.percent || 0;
        const cpuIcon = cpuPercent < 70 ? '🟢' : cpuPercent < 90 ? '🟡' : '🔴';

        const uptime = healthData.uptime?.formatted || 'N/A';

        return '<div class="health-metrics">' +
            '<div class="health-metric-card">' +
                '<div class="health-metric-icon">' + dbIcon + '</div>' +
                '<div class="health-metric-label">Base de données</div>' +
                '<div class="health-metric-value">' + dbText + '</div>' +
                '<div class="health-metric-detail">' + dbResponseTime + ' ms</div>' +
            '</div>' +
            '<div class="health-metric-card">' +
                '<div class="health-metric-icon">' + memIcon + '</div>' +
                '<div class="health-metric-label">Mémoire</div>' +
                '<div class="health-metric-value">' + memPercent.toFixed(1) + '%</div>' +
                '<div class="health-metric-detail">' + memUsed + ' / ' + memTotal + ' MB</div>' +
            '</div>' +
            '<div class="health-metric-card">' +
                '<div class="health-metric-icon">' + cpuIcon + '</div>' +
                '<div class="health-metric-label">CPU</div>' +
                '<div class="health-metric-value">' + cpuPercent.toFixed(1) + '%</div>' +
                '<div class="health-metric-detail">Load average</div>' +
            '</div>' +
            '<div class="health-metric-card">' +
                '<div class="health-metric-icon">⏱️</div>' +
                '<div class="health-metric-label">Uptime</div>' +
                '<div class="health-metric-value">' + uptime + '</div>' +
                '<div class="health-metric-detail">Temps en ligne</div>' +
            '</div>' +
        '</div>';
    }

    /**
     * Render alerts
     */
    function renderAlerts() {
        let html = '<div class="health-section-title">⚠️ Alertes actives (' + alertsData.length + ')</div>';
        html += '<div class="health-alerts">';

        alertsData.forEach(alert => {
            const severityClass = 'health-alert-' + alert.severity;
            const severityIcon = alert.severity === 'critical' ? '🔴' :
                                alert.severity === 'warning' ? '🟡' : '🔵';

            html += '<div class="health-alert ' + severityClass + '">' +
                '<div class="health-alert-icon">' + severityIcon + '</div>' +
                '<div class="health-alert-content">' +
                    '<div class="health-alert-title">' + alert.title + '</div>' +
                    '<div class="health-alert-desc">' + (alert.description || '') + '</div>' +
                '</div>' +
            '</div>';
        });

        html += '</div>';
        return html;
    }

    /**
     * Render recent errors
     */
    function renderRecentErrors() {
        let html = '<div class="health-section-title">📋 Dernières erreurs (' + errorsData.length + ')</div>';

        if (errorsData.length === 0) {
            html += '<div class="health-no-errors">✅ Aucune erreur récente</div>';
        } else {
            html += '<div class="health-errors">';

            errorsData.slice(0, 10).forEach(error => {
                const severityClass = 'health-error-' + (error.severity || 'error');
                const severityIcon = error.severity === 'critical' ? '🔴' :
                                    error.severity === 'error' ? '🟠' :
                                    error.severity === 'warning' ? '🟡' : '🔵';

                html += '<div class="health-error ' + severityClass + '">' +
                    '<div class="health-error-icon">' + severityIcon + '</div>' +
                    '<div class="health-error-content">' +
                        '<div class="health-error-message">' + truncate(error.message, 100) + '</div>' +
                        '<div class="health-error-meta">' +
                            '<span>' + formatTimestamp(error.createdAt) + '</span>' +
                            (error.url ? '<span>• ' + truncate(error.url, 40) + '</span>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>';
            });

            html += '</div>';
        }

        return html;
    }

    /**
     * Render action buttons
     */
    function renderActions() {
        return '<div class="health-actions">' +
            '<button class="settings-btn secondary" onclick="SettingsHealth.refresh()">🔄 Actualiser</button>' +
            '<button class="settings-btn secondary" onclick="SettingsHealth.cleanup()">🗑️ Nettoyer les anciens logs</button>' +
        '</div>';
    }

    /**
     * Refresh data
     */
    async function refresh() {
        try {
            showLoading();
            await loadData();
            renderDashboard();
        } catch (error) {
            console.error('Refresh failed:', error);
            showError('Échec de l\'actualisation');
        }
    }

    /**
     * Cleanup old logs
     */
    async function cleanup() {
        if (!confirm('Nettoyer les logs de plus de 30 jours ?')) return;

        try {
            const result = await ApiMonitoring.cleanup();
            alert('Logs nettoyés : ' + result.data.deletedErrors + ' erreurs, ' +
                  result.data.deletedHealthChecks + ' health checks');
            await refresh();
        } catch (error) {
            console.error('Cleanup failed:', error);
            alert('Échec du nettoyage');
        }
    }

    /**
     * Start auto-refresh
     */
    function startAutoRefresh() {
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(refresh, 30000); // Every 30 seconds
    }

    /**
     * Stop auto-refresh
     */
    function stopAutoRefresh() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }

    /**
     * Show loading state
     */
    function showLoading() {
        const container = document.getElementById('health-dashboard');
        if (container) {
            container.innerHTML = '<div class="health-loading">🔄 Actualisation...</div>';
        }
    }

    /**
     * Show error
     */
    function showError(message) {
        const container = document.getElementById('health-dashboard');
        if (container) {
            container.innerHTML = '<div class="health-error-msg">❌ ' + message + '</div>';
        }
    }

    /**
     * Helpers
     */
    function formatTimestamp(ts) {
        if (!ts) return 'N/A';
        const date = new Date(ts);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Il y a moins d\'1 min';
        if (diff < 3600000) return 'Il y a ' + Math.floor(diff / 60000) + ' min';
        if (diff < 86400000) return 'Il y a ' + Math.floor(diff / 3600000) + ' h';
        return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    function truncate(str, max) {
        if (!str) return '';
        if (str.length <= max) return str;
        return str.substring(0, max) + '...';
    }

    return {
        render,
        init,
        refresh,
        cleanup,
        stopAutoRefresh,
    };
})();

if (typeof window !== 'undefined') {
    window.SettingsHealth = SettingsHealth;
}
