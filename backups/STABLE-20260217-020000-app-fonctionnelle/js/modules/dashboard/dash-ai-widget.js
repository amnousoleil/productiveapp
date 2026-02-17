/**
 * Dashboard AI Widget
 * ProductiveApp v4.3
 *
 * Displays latest AI report + quick actions
 */

const DashAIWidget = (function() {
    'use strict';

    let latestReport = null;

    /**
     * Render the AI Widget section
     */
    function render() {
        return `
            <div class="dashboard-ai-section">
                <div class="dashboard-section-header">
                    <h2 class="dashboard-section-title">
                        <span class="ai-sparkle">✨</span>
                        Intelligence Artificielle
                    </h2>
                    <button class="btn btn-sm btn-primary" onclick="DashAIWidget.generateQuickReport()" id="dash-ai-generate-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                        </svg>
                        Générer un rapport
                    </button>
                </div>

                <div class="dashboard-ai-grid" id="dashboard-ai-content">
                    <div class="ai-widget-placeholder">
                        <div class="ai-widget-placeholder-icon">🤖</div>
                        <p>Chargement des insights IA...</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load AI content after rendering
     */
    async function loadContent() {
        const container = document.getElementById('dashboard-ai-content');
        if (!container) return;

        try {
            // Fetch latest report
            if (typeof ApiReportsAi !== 'undefined' && ApiReportsAi.isAvailable()) {
                const result = await ApiReportsAi.list({ limit: 1 });
                const reports = result.reports || [];

                if (reports.length > 0) {
                    latestReport = reports[0];
                    renderLatestReport(container);
                } else {
                    renderEmptyState(container);
                }
            } else {
                renderEmptyState(container);
            }
        } catch (error) {
            console.warn('DashAIWidget: Failed to load report', error);
            renderEmptyState(container);
        }

        // Load AI suggestions
        loadAISuggestions();
    }

    /**
     * Render latest AI report
     */
    function renderLatestReport(container) {
        const date = new Date(latestReport.created_at);
        const dateStr = date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        const score = latestReport.ai_score || 0;
        const scoreColor = getScoreColor(score);
        const scoreLabel = getScoreLabel(score);

        container.innerHTML = `
            <div class="ai-report-card" onclick="DashAIWidget.openReportDetail()">
                <div class="ai-report-header">
                    <div class="ai-report-title">
                        <span class="ai-report-icon">📊</span>
                        <div>
                            <h4>Dernier rapport IA</h4>
                            <span class="ai-report-date">${dateStr}</span>
                        </div>
                    </div>
                    <div class="ai-report-score" style="--score-color: ${scoreColor}">
                        <div class="score-circle">
                            <svg viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
                                <circle cx="18" cy="18" r="16" fill="none" stroke="${scoreColor}" stroke-width="3"
                                    stroke-dasharray="${score * 1.005} 100.5"
                                    stroke-linecap="round" transform="rotate(-90 18 18)"/>
                            </svg>
                            <span class="score-value">${score}</span>
                        </div>
                        <span class="score-label">${scoreLabel}</span>
                    </div>
                </div>

                <div class="ai-report-preview">
                    <p>${escapeHtml(latestReport.ai_analysis?.substring(0, 150) || '')}...</p>
                </div>

                ${latestReport.ai_recommendations?.length > 0 ? `
                <div class="ai-report-recommendations">
                    <h5>💡 Recommandations clés</h5>
                    <ul>
                        ${latestReport.ai_recommendations.slice(0, 3).map(rec =>
                            `<li>${escapeHtml(rec.substring(0, 80))}${rec.length > 80 ? '...' : ''}</li>`
                        ).join('')}
                    </ul>
                </div>
                ` : ''}

                <button class="ai-report-cta">
                    Voir le rapport complet →
                </button>
            </div>

            <div class="ai-quick-actions">
                <button class="ai-quick-btn" onclick="DashAIWidget.openChatbot()" title="Ouvrir l'assistant IA">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <span>Mahayawen</span>
                </button>
                <button class="ai-quick-btn" onclick="ViewRouter.navigate('psycho-audit')" title="Psycho-Audit">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                    <span>Audit Premium</span>
                </button>
                <button class="ai-quick-btn" onclick="ViewRouter.navigate('reports')" title="Voir tous les rapports">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        <path d="M9 12h6m-6 4h6"/>
                    </svg>
                    <span>Tous les rapports</span>
                </button>
            </div>
        `;
    }

    /**
     * Render empty state
     */
    function renderEmptyState(container) {
        container.innerHTML = `
            <div class="ai-empty-state">
                <div class="ai-empty-icon">✨</div>
                <h4>Aucun rapport IA généré</h4>
                <p>Générez votre premier rapport pour obtenir des insights personnalisés sur votre productivité</p>
                <button class="btn btn-primary" onclick="DashAIWidget.generateQuickReport()">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    Générer mon premier rapport
                </button>
            </div>

            <div class="ai-quick-actions">
                <button class="ai-quick-btn" onclick="DashAIWidget.openChatbot()">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <span>Mahayawen</span>
                </button>
                <button class="ai-quick-btn" onclick="ViewRouter.navigate('psycho-audit')">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                    <span>Audit Premium</span>
                </button>
            </div>
        `;
    }

    /**
     * Load AI suggestions (quick insights)
     */
    async function loadAISuggestions() {
        // This could call a quick AI endpoint for real-time suggestions
        // For now, we'll show a placeholder or skip it
    }

    /**
     * Generate a quick report
     */
    async function generateQuickReport() {
        const btn = document.getElementById('dash-ai-generate-btn');
        if (!btn) return;

        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Génération...';

        try {
            if (typeof ApiReportsAi === 'undefined' || !ApiReportsAi.isAvailable()) {
                throw new Error('Service IA non disponible');
            }

            // Generate standard report for current week
            const report = await ApiReportsAi.generate({
                report_type: 'standard',
                period_type: 'week'
            });

            latestReport = report;

            // Show success notification
            if (typeof Utils !== 'undefined' && Utils.notify) {
                Utils.notify('✨ Rapport IA généré avec succès !', 'success');
            }

            // Refresh the widget
            await loadContent();

            // Auto-open the report
            setTimeout(() => openReportDetail(), 500);

        } catch (error) {
            console.error('DashAIWidget: Failed to generate report', error);
            if (typeof Utils !== 'undefined' && Utils.notify) {
                Utils.notify(error.message || 'Erreur lors de la génération', 'error');
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        }
    }

    /**
     * Open report detail modal
     */
    function openReportDetail() {
        if (!latestReport) return;

        if (typeof AIReportsView !== 'undefined' && AIReportsView.openReportDetail) {
            AIReportsView.openReportDetail(latestReport);
        } else {
            // Fallback: navigate to reports view
            ViewRouter.navigate('reports');
        }
    }

    /**
     * Open chatbot
     */
    function openChatbot() {
        if (typeof Chatbot !== 'undefined' && Chatbot.toggle) {
            Chatbot.toggle();
        } else if (typeof Sidebar !== 'undefined') {
            Sidebar.navigate('mahayawen');
        }
    }

    /**
     * Get score color
     */
    function getScoreColor(score) {
        if (score >= 80) return '#10b981';  // Green
        if (score >= 60) return '#f59e0b';  // Yellow
        if (score >= 40) return '#f97316';  // Orange
        return '#ef4444';  // Red
    }

    /**
     * Get score label
     */
    function getScoreLabel(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Bon';
        if (score >= 40) return 'Moyen';
        return 'À améliorer';
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        render,
        loadContent,
        generateQuickReport,
        openReportDetail,
        openChatbot
    };
})();

// Export
if (typeof window !== 'undefined') {
    window.DashAIWidget = DashAIWidget;
}
