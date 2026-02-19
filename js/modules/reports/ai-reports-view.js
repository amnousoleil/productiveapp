/**
 * AI Reports View
 * ProductiveApp v4.0
 *
 * Beautiful charts, animations and AI-powered insights
 */

const AIReportsView = (function() {
    'use strict';

    let currentReport = null;
    let charts = {};
    let reportsList = [];

    /**
     * Initialize the view
     */
    function init() {
        console.log('📊 AIReportsView: Initializing...');
        initEvents();
    }

    /**
     * Render the reports dashboard
     */
    async function render(container) {
        if (!container) container = document.getElementById('reports-ai-container');
        if (!container) return;

        container.innerHTML = `
            <div class="ai-reports-dashboard">
                <!-- Header -->
                <div class="ai-reports-header">
                    <div class="ai-reports-title">
                        <h2>Rapports Intelligents</h2>
                        <p>Analyses IA et visualisations de votre performance</p>
                    </div>
                    <div class="ai-reports-actions">
                        <select id="report-period-select" class="ai-select">
                            <option value="week">Cette semaine</option>
                            <option value="month">Ce mois</option>
                            <option value="year">Cette année</option>
                        </select>
                        <button id="generate-ai-report-btn" class="ai-btn ai-btn-primary">
                            <span class="ai-btn-icon">✨</span>
                            Générer un rapport
                        </button>
                        <button id="generate-audit-btn" class="ai-btn ai-btn-secondary">
                            <span class="ai-btn-icon">🔍</span>
                            Audit comportemental
                        </button>
                    </div>
                </div>

                <!-- Quick Stats Cards -->
                <div class="ai-stats-grid" id="ai-stats-grid">
                    <div class="ai-stat-card loading">
                        <div class="ai-stat-icon">📊</div>
                        <div class="ai-stat-value">--</div>
                        <div class="ai-stat-label">Score Global</div>
                    </div>
                    <div class="ai-stat-card loading">
                        <div class="ai-stat-icon">✅</div>
                        <div class="ai-stat-value">--</div>
                        <div class="ai-stat-label">Tâches terminées</div>
                    </div>
                    <div class="ai-stat-card loading">
                        <div class="ai-stat-icon">📈</div>
                        <div class="ai-stat-value">--</div>
                        <div class="ai-stat-label">Taux complétion</div>
                    </div>
                    <div class="ai-stat-card loading">
                        <div class="ai-stat-icon">🔥</div>
                        <div class="ai-stat-value">--</div>
                        <div class="ai-stat-label">Streak jours</div>
                    </div>
                </div>

                <!-- Charts Grid -->
                <div class="ai-charts-grid">
                    <div class="ai-chart-card">
                        <h3>📊 Répartition des tâches</h3>
                        <div class="ai-chart-container">
                            <canvas id="chart-tasks-status"></canvas>
                        </div>
                    </div>
                    <div class="ai-chart-card">
                        <h3>📈 Productivité (7 jours)</h3>
                        <div class="ai-chart-container">
                            <canvas id="chart-productivity"></canvas>
                        </div>
                    </div>
                    <div class="ai-chart-card">
                        <h3>🎯 Priorités en cours</h3>
                        <div class="ai-chart-container">
                            <canvas id="chart-priorities"></canvas>
                        </div>
                    </div>
                    <div class="ai-chart-card">
                        <h3>📁 Avancement projets</h3>
                        <div class="ai-chart-container">
                            <canvas id="chart-projects"></canvas>
                        </div>
                    </div>
                </div>

                <!-- AI Analysis Section -->
                <div class="ai-analysis-section" id="ai-analysis-section">
                    <div class="ai-analysis-header">
                        <h3>🤖 Dernière analyse IA</h3>
                        <button id="view-all-reports-btn" class="ai-btn ai-btn-ghost">
                            Voir tous les rapports →
                        </button>
                    </div>
                    <div class="ai-analysis-content" id="ai-analysis-content">
                        <p class="ai-analysis-placeholder">
                            Générez votre premier rapport pour voir l'analyse IA
                        </p>
                    </div>
                </div>

                <!-- Reports History -->
                <div class="ai-reports-history" id="ai-reports-history">
                    <h3>📚 Historique des rapports</h3>
                    <div class="ai-reports-list" id="ai-reports-list">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <!-- Meta Synthesis Section -->
                <div class="ai-meta-section" id="ai-meta-section">
                    <div class="ai-meta-header">
                        <h3>🧠 Méta-Synthèse</h3>
                        <p>Analyse de vos tendances sur plusieurs rapports</p>
                    </div>
                    <button id="generate-meta-btn" class="ai-btn ai-btn-accent">
                        <span class="ai-btn-icon">🔮</span>
                        Générer une méta-synthèse
                    </button>
                </div>
            </div>
        `;

        // Load data
        await loadStats();
        await loadCharts();
        await loadReportsList();
        await loadLastAnalysis();
    }

    /**
     * Load quick stats
     */
    async function loadStats() {
        const statsGrid = document.getElementById('ai-stats-grid');
        if (!statsGrid) return;

        try {
            // Calculate from AppState
            const stats = AppState.getTaskStats();
            const streak = 0; // TODO: Get from gamification

            // Animate stats cards
            const cards = statsGrid.querySelectorAll('.ai-stat-card');

            // Score (based on completion rate)
            animateStatCard(cards[0], Math.min(stats.completionRate || 0, 100), '/100', 1000);
            cards[0].classList.remove('loading');
            cards[0].style.setProperty('--score-color', getScoreColor(stats.completionRate || 0));

            // Tasks completed
            animateStatCard(cards[1], stats.done || 0, '', 800);
            cards[1].classList.remove('loading');

            // Completion rate
            animateStatCard(cards[2], stats.completionRate || 0, '%', 1200);
            cards[2].classList.remove('loading');

            // Streak
            animateStatCard(cards[3], streak, ' jours', 600);
            cards[3].classList.remove('loading');

        } catch (e) {
            console.error('Error loading stats:', e);
        }
    }

    /**
     * Animate a stat card value
     */
    function animateStatCard(card, targetValue, suffix, duration) {
        const valueEl = card.querySelector('.ai-stat-value');
        if (!valueEl) return;

        let startValue = 0;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out-cubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentValue = Math.round(startValue + (targetValue - startValue) * easeProgress);
            valueEl.textContent = currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    /**
     * Get color based on score
     */
    function getScoreColor(score) {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#f59e0b'; // Yellow
        if (score >= 40) return '#f97316'; // Orange
        return '#ef4444'; // Red
    }

    /**
     * Load and render charts
     */
    async function loadCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }

        try {
            // Get visualization data from API or calculate locally
            const vizData = await getVisualizationData();

            // Tasks by status - Doughnut chart
            renderDoughnutChart('chart-tasks-status', vizData.tasksByStatus, {
                colors: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
                labels: ['Terminé', 'En cours', 'À faire', 'En retard']
            });

            // Productivity trend - Line chart
            renderLineChart('chart-productivity', vizData.productivityTrend, {
                color: '#e07840',
                label: 'Tâches complétées'
            });

            // Priorities - Bar chart
            renderBarChart('chart-priorities', vizData.priorityDistribution, {
                colors: ['#ef4444', '#f59e0b', '#10b981'],
                labels: ['Urgent', 'Normal', 'Basse']
            });

            // Projects progress - Horizontal bar
            renderHorizontalBarChart('chart-projects', vizData.projectsProgress, {
                color: '#3b82f6'
            });

        } catch (e) {
            console.error('Error loading charts:', e);
        }
    }

    /**
     * Get visualization data
     */
    async function getVisualizationData() {
        // Try API first
        if (ApiReportsAi && ApiReportsAi.isAvailable()) {
            try {
                const periodType = document.getElementById('report-period-select')?.value || 'week';
                return await ApiReportsAi.getVisualizations(periodType);
            } catch (e) {
                console.warn('API visualization failed, using local data');
            }
        }

        // Fallback to local calculation
        return calculateLocalVisualization();
    }

    /**
     * Calculate visualization data locally
     */
    function calculateLocalVisualization() {
        const tasks = AppState.tasks || [];
        const projects = AppState.projects || [];

        // Tasks by status
        const statusCounts = {
            done: tasks.filter(t => t.status === 'done').length,
            inprogress: tasks.filter(t => t.status === 'inprogress').length,
            todo: tasks.filter(t => t.status === 'todo').length
        };

        // Priority distribution (non-done tasks)
        const activeTasks = tasks.filter(t => t.status !== 'done');
        const priorityCounts = {
            urgent: activeTasks.filter(t => (t.priority?.level || t.priority) === 1).length,
            important: activeTasks.filter(t => (t.priority?.level || t.priority) === 2).length,
            normal: activeTasks.filter(t => (t.priority?.level || t.priority) === 3).length,
            low: activeTasks.filter(t => (t.priority?.level || t.priority) === 4).length
        };

        // Last 7 days productivity
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const count = tasks.filter(t => {
                if (!t.completedAt) return false;
                const completed = new Date(t.completedAt).toISOString().split('T')[0];
                return completed === dateStr;
            }).length;

            last7Days.push({
                label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                value: count
            });
        }

        // Projects progress
        const projectsProgress = projects.slice(0, 5).map(p => ({
            label: p.name,
            value: p.progress || 0
        }));

        return {
            tasksByStatus: {
                labels: ['Terminé', 'En cours', 'À faire'],
                datasets: [{
                    data: [statusCounts.done, statusCounts.inprogress, statusCounts.todo],
                    backgroundColor: ['#10b981', '#f59e0b', '#3b82f6']
                }]
            },
            productivityTrend: {
                labels: last7Days.map(d => d.label),
                datasets: [{
                    label: 'Tâches',
                    data: last7Days.map(d => d.value),
                    borderColor: '#e07840',
                    backgroundColor: 'rgba(224, 120, 64, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            priorityDistribution: {
                labels: ['Urgent', 'Normal', 'Basse'],
                datasets: [{
                    data: [priorityCounts.urgent, priorityCounts.normal, priorityCounts.low],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
                }]
            },
            projectsProgress: {
                labels: projectsProgress.map(p => p.label),
                datasets: [{
                    label: 'Progression',
                    data: projectsProgress.map(p => p.value),
                    backgroundColor: '#3b82f6'
                }]
            }
        };
    }

    /**
     * Render a doughnut chart
     */
    function renderDoughnutChart(canvasId, data, options) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (charts[canvasId]) charts[canvasId].destroy();

        charts[canvasId] = new Chart(canvas, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#94a3b8', padding: 15 }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                cutout: '60%'
            }
        });
    }

    /**
     * Render a line chart
     */
    function renderLineChart(canvasId, data, options) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (charts[canvasId]) charts[canvasId].destroy();

        charts[canvasId] = new Chart(canvas, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    /**
     * Render a bar chart
     */
    function renderBarChart(canvasId, data, options) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (charts[canvasId]) charts[canvasId].destroy();

        charts[canvasId] = new Chart(canvas, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutBounce'
                }
            }
        });
    }

    /**
     * Render a horizontal bar chart
     */
    function renderHorizontalBarChart(canvasId, data, options) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (charts[canvasId]) charts[canvasId].destroy();

        charts[canvasId] = new Chart(canvas, {
            type: 'bar',
            data: data,
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8', callback: v => v + '%' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                },
                animation: {
                    duration: 1800,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    /**
     * Load reports list
     */
    async function loadReportsList() {
        const listEl = document.getElementById('ai-reports-list');
        if (!listEl) return;

        try {
            if (ApiReportsAi && ApiReportsAi.isAvailable()) {
                const result = await ApiReportsAi.list({ limit: 5 });
                reportsList = result.reports || [];
            }

            if (reportsList.length === 0) {
                listEl.innerHTML = '<p class="ai-no-reports">Aucun rapport généré</p>';
                return;
            }

            listEl.innerHTML = reportsList.map(report => `
                <div class="ai-report-item" data-id="${report.id}">
                    <div class="ai-report-item-icon">
                        ${getReportIcon(report.report_type)}
                    </div>
                    <div class="ai-report-item-info">
                        <h4>${escapeHtml(report.title)}</h4>
                        <span class="ai-report-item-date">${formatDate(report.created_at)}</span>
                    </div>
                    <div class="ai-report-item-score" style="--score-color: ${getScoreColor(report.ai_score)}">
                        ${report.ai_score}/100
                    </div>
                </div>
            `).join('');

        } catch (e) {
            console.error('Error loading reports list:', e);
            listEl.innerHTML = '<p class="ai-error">Erreur de chargement</p>';
        }
    }

    /**
     * Load last analysis
     */
    async function loadLastAnalysis() {
        const contentEl = document.getElementById('ai-analysis-content');
        if (!contentEl) return;

        if (reportsList.length > 0) {
            const lastReport = reportsList[0];
            renderAnalysis(contentEl, lastReport);
        }
    }

    /**
     * Render AI analysis
     */
    function renderAnalysis(container, report) {
        container.innerHTML = `
            <div class="ai-analysis-card">
                <div class="ai-analysis-score">
                    <div class="ai-score-circle" style="--score: ${report.ai_score}; --score-color: ${getScoreColor(report.ai_score)}">
                        <span>${report.ai_score}</span>
                    </div>
                    <span>Score Global</span>
                </div>
                <div class="ai-analysis-text">
                    <p>${escapeHtml(report.ai_analysis?.substring(0, 500) || '')}...</p>
                </div>
            </div>

            ${report.strengths?.length > 0 ? `
            <div class="ai-swot-section ai-strengths">
                <h4>💪 Forces</h4>
                <ul>${report.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
            </div>
            ` : ''}

            ${report.weaknesses?.length > 0 ? `
            <div class="ai-swot-section ai-weaknesses">
                <h4>⚠️ Axes d'amélioration</h4>
                <ul>${report.weaknesses.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul>
            </div>
            ` : ''}

            ${report.ai_recommendations?.length > 0 ? `
            <div class="ai-recommendations">
                <h4>💡 Recommandations</h4>
                <ul>${report.ai_recommendations.slice(0, 5).map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
            </div>
            ` : ''}
        `;
    }

    /**
     * Generate a new report
     */
    async function generateReport(type = 'standard') {
        const btn = type === 'audit'
            ? document.getElementById('generate-audit-btn')
            : document.getElementById('generate-ai-report-btn');

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="ai-spinner"></span> Génération...';
        }

        try {
            const periodType = document.getElementById('report-period-select')?.value || 'week';

            let report;
            if (type === 'audit') {
                report = await ApiReportsAi.generateAudit({ period_type: periodType });
            } else {
                report = await ApiReportsAi.generate({
                    report_type: type,
                    period_type: periodType
                });
            }

            currentReport = report;

            // Show success and refresh
            showNotification('✨ Rapport généré avec succès !', 'success');
            await loadReportsList();
            await loadLastAnalysis();

            // Open report detail
            openReportDetail(report);

        } catch (e) {
            console.error('Error generating report:', e);
            showNotification('Erreur lors de la génération', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = type === 'audit'
                    ? '<span class="ai-btn-icon">🔍</span> Audit comportemental'
                    : '<span class="ai-btn-icon">✨</span> Générer un rapport';
            }
        }
    }

    /**
     * Generate meta-synthesis
     */
    async function generateMetaSynthesis() {
        const btn = document.getElementById('generate-meta-btn');

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="ai-spinner"></span> Analyse en cours...';
        }

        try {
            const periodType = document.getElementById('report-period-select')?.value || 'month';

            const report = await ApiReportsAi.generateMetaSynthesis({
                period_type: periodType
            });

            showNotification('🧠 Méta-synthèse générée !', 'success');
            openReportDetail(report);

        } catch (e) {
            console.error('Error generating meta-synthesis:', e);
            showNotification(e.message || 'Erreur de génération', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span class="ai-btn-icon">🔮</span> Générer une méta-synthèse';
            }
        }
    }

    /**
     * Open report detail modal
     */
    function openReportDetail(report) {
        const modal = document.createElement('div');
        modal.className = 'ai-report-modal';
        modal.innerHTML = `
            <div class="ai-report-modal-content">
                <div class="ai-report-modal-header">
                    <h2>${escapeHtml(report.title)}</h2>
                    <button class="ai-modal-close">&times;</button>
                </div>
                <div class="ai-report-modal-body">
                    <div class="ai-report-score-large" style="--score-color: ${getScoreColor(report.ai_score)}">
                        <div class="ai-score-ring">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--score-color)" stroke-width="8"
                                    stroke-dasharray="${report.ai_score * 2.83} 283"
                                    stroke-linecap="round" transform="rotate(-90 50 50)"/>
                            </svg>
                            <span class="ai-score-value">${report.ai_score}</span>
                        </div>
                        <span class="ai-score-label">Score de performance</span>
                    </div>

                    <div class="ai-report-analysis">
                        <h3>📊 Analyse détaillée</h3>
                        <p>${escapeHtml(report.ai_analysis || '')}</p>
                    </div>

                    ${report.strengths?.length > 0 ? `
                    <div class="ai-swot ai-strengths-full">
                        <h3>💪 Forces identifiées</h3>
                        <ul>${report.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
                    </div>` : ''}

                    ${report.weaknesses?.length > 0 ? `
                    <div class="ai-swot ai-weaknesses-full">
                        <h3>⚠️ Points d'amélioration</h3>
                        <ul>${report.weaknesses.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul>
                    </div>` : ''}

                    ${report.opportunities?.length > 0 ? `
                    <div class="ai-swot ai-opportunities">
                        <h3>🚀 Opportunités</h3>
                        <ul>${report.opportunities.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
                    </div>` : ''}

                    ${report.threats?.length > 0 ? `
                    <div class="ai-swot ai-threats">
                        <h3>⚡ Points de vigilance</h3>
                        <ul>${report.threats.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
                    </div>` : ''}

                    ${report.ai_recommendations?.length > 0 ? `
                    <div class="ai-recommendations-full">
                        <h3>💡 Plan d'action recommandé</h3>
                        <ol>${report.ai_recommendations.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ol>
                    </div>` : ''}
                </div>
                <div class="ai-report-modal-footer">
                    <button class="ai-btn ai-btn-secondary" onclick="AIReportsView.downloadPDF()">
                        📥 Télécharger PDF
                    </button>
                    <button class="ai-btn ai-btn-primary ai-modal-close-btn">
                        Fermer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        currentReport = report;

        // Animation
        requestAnimationFrame(() => modal.classList.add('open'));

        // Close handlers
        modal.querySelector('.ai-modal-close').onclick = () => closeModal(modal);
        modal.querySelector('.ai-modal-close-btn').onclick = () => closeModal(modal);
        modal.onclick = (e) => {
            if (e.target === modal) closeModal(modal);
        };
    }

    /**
     * Close modal
     */
    function closeModal(modal) {
        modal.classList.remove('open');
        setTimeout(() => modal.remove(), 300);
    }

    /**
     * Download report as PDF
     */
    function downloadPDF() {
        if (!currentReport) return;

        const jsPDF = window.jspdf?.jsPDF;
        if (!jsPDF) {
            showNotification('PDF non disponible', 'error');
            return;
        }

        const doc = new jsPDF();
        const w = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(224, 120, 64);
        doc.rect(0, 0, w, 30, 'F');
        doc.setTextColor(255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(currentReport.title, w / 2, 18, { align: 'center' });

        // Score
        let y = 45;
        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.text(`Score: ${currentReport.ai_score}/100`, 20, y);

        // Analysis
        y += 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const analysisLines = doc.splitTextToSize(currentReport.ai_analysis || '', w - 40);
        analysisLines.forEach(line => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(line, 20, y);
            y += 6;
        });

        // Recommendations
        if (currentReport.ai_recommendations?.length) {
            y += 10;
            doc.setFont('helvetica', 'bold');
            doc.text('Recommandations:', 20, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            currentReport.ai_recommendations.forEach((rec, i) => {
                if (y > 270) { doc.addPage(); y = 20; }
                const recLines = doc.splitTextToSize(`${i + 1}. ${rec}`, w - 40);
                recLines.forEach(line => {
                    doc.text(line, 20, y);
                    y += 6;
                });
            });
        }

        // Save
        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`rapport_${currentReport.report_type}_${dateStr}.pdf`);

        showNotification('📥 PDF téléchargé !', 'success');
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        if (typeof Utils !== 'undefined' && Utils.notify) {
            Utils.notify(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    /**
     * Show the AI Reports view
     */
    function show() {
        const aiReportsView = document.getElementById('ai-reports-view');
        const viewTasks = document.querySelector('.view-tasks');
        const menuDropdown = document.getElementById('menu-dropdown');

        if (aiReportsView && viewTasks) {
            viewTasks.classList.add('hidden');
            aiReportsView.classList.remove('hidden');
            render();
        }

        // Close menu dropdown
        if (menuDropdown) {
            menuDropdown.classList.remove('show');
        }
    }

    /**
     * Hide the AI Reports view and return to tasks
     */
    function hide() {
        const aiReportsView = document.getElementById('ai-reports-view');
        const viewTasks = document.querySelector('.view-tasks');

        if (aiReportsView && viewTasks) {
            aiReportsView.classList.add('hidden');
            viewTasks.classList.remove('hidden');
        }

        // Destroy charts to free memory
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        charts = {};
    }

    /**
     * Initialize events
     */
    function initEvents() {
        document.addEventListener('click', (e) => {
            // Menu button to open AI Reports
            if (e.target.id === 'ai-reports-btn' || e.target.closest('#ai-reports-btn')) {
                show();
            }

            // Back button to return to tasks
            if (e.target.id === 'back-to-tasks-btn' || e.target.closest('#back-to-tasks-btn')) {
                hide();
            }

            if (e.target.id === 'generate-ai-report-btn') {
                generateReport('standard');
            }
            if (e.target.id === 'generate-audit-btn') {
                generateReport('audit');
            }
            if (e.target.id === 'generate-meta-btn') {
                generateMetaSynthesis();
            }
            if (e.target.closest('.ai-report-item')) {
                const id = e.target.closest('.ai-report-item').dataset.id;
                const report = reportsList.find(r => r.id === id);
                if (report) openReportDetail(report);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'report-period-select') {
                loadCharts();
            }
        });
    }

    // Helpers
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    }

    function getReportIcon(type) {
        return {
            standard: '📊',
            audit: '🔍',
            meta_synthesis: '🧠'
        }[type] || '📋';
    }

    return {
        init,
        render,
        show,
        hide,
        generateReport,
        generateMetaSynthesis,
        downloadPDF,
        openReportDetail
    };
})();

// Initialize
if (typeof window !== 'undefined') {
    window.AIReportsView = AIReportsView;
}
