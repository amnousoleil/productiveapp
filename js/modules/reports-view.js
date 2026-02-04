/**
 * REPORTS VIEW - ProductiveApp v4.0
 * Page des rapports avec statistiques API
 */

const ReportsView = (function() {
    'use strict';

    const icons = {
        file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'
    };

    let currentPeriod = 'week';
    let cachedData = null;

    /**
     * Render reports page
     */
    async function render() {
        const container = document.getElementById('view-reports');
        if (!container) return;

        container.innerHTML = `
            <div class="view-header">
                <h1 class="view-title">
                    <span class="view-title-icon">${icons.file}</span>
                    Rapports
                </h1>
                <div class="view-actions">
                    <button class="btn btn-secondary" onclick="ReportsView.refresh()">
                        ${icons.refresh} Actualiser
                    </button>
                    <button class="btn btn-secondary" onclick="ReportsView.exportCSV()">
                        ${icons.download} CSV
                    </button>
                    <button class="btn btn-primary btn-audit" onclick="ReportCreator.open()" style="background: linear-gradient(135deg, #E07840, #c45d2a); display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 16px;">🎯</span> Créer un Audit IA
                    </button>
                </div>
            </div>

            <div class="reports-period-selector">
                <button class="period-btn ${currentPeriod === 'week' ? 'active' : ''}" onclick="ReportsView.setPeriod('week')">Cette semaine</button>
                <button class="period-btn ${currentPeriod === 'month' ? 'active' : ''}" onclick="ReportsView.setPeriod('month')">Ce mois</button>
                <button class="period-btn ${currentPeriod === 'all' ? 'active' : ''}" onclick="ReportsView.setPeriod('all')">Tout</button>
            </div>

            <div id="reports-content" class="reports-content">
                <div class="reports-loading">
                    <div class="spinner"></div>
                    <p>Chargement des statistiques...</p>
                </div>
            </div>
        `;

        await loadData();
    }

    /**
     * Load data from API
     */
    async function loadData() {
        const contentEl = document.getElementById('reports-content');
        if (!contentEl) return;

        try {
            // Fetch tasks from API
            const tasks = await ApiTasks.getAll({ limit: 1000 });

            // Fetch analytics if available
            let analyticsStats = null;
            let activityData = null;

            if (typeof AnalyticsAPI !== 'undefined') {
                try {
                    analyticsStats = await AnalyticsAPI.getStats();
                    activityData = await AnalyticsAPI.getActivityChart(currentPeriod === 'week' ? 7 : currentPeriod === 'month' ? 30 : 90);
                } catch (e) {
                    console.warn('Analytics API not available, computing from tasks');
                }
            }

            // Compute statistics
            const stats = computeStats(tasks, currentPeriod);
            cachedData = { tasks, stats, analyticsStats, activityData };

            renderContent(stats);
        } catch (error) {
            console.error('Error loading reports data:', error);
            contentEl.innerHTML = `
                <div class="reports-error">
                    <p>Erreur de chargement des données</p>
                    <button class="btn btn-secondary" onclick="ReportsView.refresh()">Réessayer</button>
                </div>
            `;
        }
    }

    /**
     * Compute statistics from tasks
     */
    function computeStats(tasks, period) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let filterDate = null;
        if (period === 'week') filterDate = startOfWeek;
        else if (period === 'month') filterDate = startOfMonth;

        // Filter tasks by period
        const filteredTasks = filterDate
            ? tasks.filter(t => new Date(t.created_at || t.createdAt) >= filterDate)
            : tasks;

        // Status counts
        const statusCounts = {
            todo: 0,
            in_progress: 0,
            done: 0
        };

        filteredTasks.forEach(t => {
            const status = t.status || 'todo';
            if (status === 'completed' || status === 'done') statusCounts.done++;
            else if (status === 'in_progress' || status === 'inProgress') statusCounts.in_progress++;
            else statusCounts.todo++;
        });

        // Completed tasks with completion time
        const completedTasks = filteredTasks.filter(t =>
            t.status === 'completed' || t.status === 'done'
        );

        // Tasks by project
        const byProject = {};
        filteredTasks.forEach(t => {
            const projectId = t.project_id || t.projectId || 'no-project';
            const projectName = t.project?.name || t.projectName || 'Sans projet';
            if (!byProject[projectId]) {
                byProject[projectId] = { name: projectName, total: 0, done: 0 };
            }
            byProject[projectId].total++;
            if (t.status === 'completed' || t.status === 'done') {
                byProject[projectId].done++;
            }
        });

        // Activity by day (last 7 or 30 days)
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 14;
        const activityByDay = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const tasksThisDay = tasks.filter(t => {
                const taskDate = new Date(t.completed_at || t.completedAt || t.updated_at || t.updatedAt);
                return taskDate >= date && taskDate < nextDate && (t.status === 'completed' || t.status === 'done');
            });

            activityByDay.push({
                date: date,
                label: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                count: tasksThisDay.length
            });
        }

        // Average completion time (if we have timestamps)
        let avgCompletionTime = null;
        const tasksWithTime = completedTasks.filter(t => t.created_at && t.completed_at);
        if (tasksWithTime.length > 0) {
            const totalMs = tasksWithTime.reduce((sum, t) => {
                return sum + (new Date(t.completed_at) - new Date(t.created_at));
            }, 0);
            avgCompletionTime = totalMs / tasksWithTime.length;
        }

        return {
            total: filteredTasks.length,
            statusCounts,
            completedCount: statusCounts.done,
            byProject: Object.values(byProject).sort((a, b) => b.total - a.total),
            activityByDay,
            avgCompletionTime,
            period
        };
    }

    /**
     * Render the stats content
     */
    function renderContent(stats) {
        const contentEl = document.getElementById('reports-content');
        if (!contentEl) return;

        const maxActivity = Math.max(...stats.activityByDay.map(d => d.count), 1);

        // Format completion time
        let avgTimeStr = 'N/A';
        if (stats.avgCompletionTime) {
            const hours = Math.floor(stats.avgCompletionTime / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);
            if (days > 0) avgTimeStr = `${days}j ${hours % 24}h`;
            else if (hours > 0) avgTimeStr = `${hours}h`;
            else avgTimeStr = '< 1h';
        }

        const periodLabel = stats.period === 'week' ? 'cette semaine' : stats.period === 'month' ? 'ce mois' : 'au total';

        contentEl.innerHTML = `
            <!-- Summary Cards -->
            <div class="reports-summary">
                <div class="report-card">
                    <div class="report-card-icon" style="background: var(--success-light); color: var(--success);">
                        ${icons.check}
                    </div>
                    <div class="report-card-content">
                        <div class="report-card-value">${stats.completedCount}</div>
                        <div class="report-card-label">Tâches terminées ${periodLabel}</div>
                    </div>
                </div>

                <div class="report-card">
                    <div class="report-card-icon" style="background: var(--warning-light); color: var(--warning);">
                        ${icons.clock}
                    </div>
                    <div class="report-card-content">
                        <div class="report-card-value">${stats.statusCounts.in_progress}</div>
                        <div class="report-card-label">En cours</div>
                    </div>
                </div>

                <div class="report-card">
                    <div class="report-card-icon" style="background: var(--accent-light); color: var(--accent);">
                        ${icons.calendar}
                    </div>
                    <div class="report-card-content">
                        <div class="report-card-value">${avgTimeStr}</div>
                        <div class="report-card-label">Temps moyen</div>
                    </div>
                </div>

                <div class="report-card">
                    <div class="report-card-icon" style="background: var(--info-light); color: var(--info);">
                        ${icons.file}
                    </div>
                    <div class="report-card-content">
                        <div class="report-card-value">${stats.total}</div>
                        <div class="report-card-label">Total tâches</div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="reports-charts">
                <!-- Activity Chart -->
                <div class="report-section">
                    <h3>${icons.chart} Activité quotidienne</h3>
                    <div class="activity-chart">
                        ${stats.activityByDay.map(day => `
                            <div class="activity-bar-container">
                                <div class="activity-bar" style="height: ${(day.count / maxActivity) * 100}%;" title="${day.count} tâches">
                                    <span class="activity-count">${day.count}</span>
                                </div>
                                <div class="activity-label">${day.label}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Status Distribution -->
                <div class="report-section">
                    <h3>${icons.chart} Répartition par statut</h3>
                    <div class="status-distribution">
                        ${renderStatusBar(stats.statusCounts, stats.total)}
                        <div class="status-legend">
                            <div class="legend-item">
                                <span class="legend-color" style="background: var(--text-muted);"></span>
                                À faire: ${stats.statusCounts.todo}
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" style="background: var(--warning);"></span>
                                En cours: ${stats.statusCounts.in_progress}
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" style="background: var(--success);"></span>
                                Terminées: ${stats.statusCounts.done}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Projects Section -->
            <div class="report-section">
                <h3>${icons.folder} Répartition par projet</h3>
                <div class="projects-list">
                    ${stats.byProject.length === 0 ? '<p class="no-data">Aucun projet</p>' : ''}
                    ${stats.byProject.slice(0, 10).map(project => `
                        <div class="project-row">
                            <div class="project-info">
                                <span class="project-name">${escapeHtml(project.name)}</span>
                                <span class="project-count">${project.done}/${project.total} terminées</span>
                            </div>
                            <div class="project-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${project.total > 0 ? (project.done / project.total) * 100 : 0}%;"></div>
                                </div>
                                <span class="progress-percent">${project.total > 0 ? Math.round((project.done / project.total) * 100) : 0}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render status bar
     */
    function renderStatusBar(counts, total) {
        if (total === 0) {
            return '<div class="status-bar"><div class="status-segment empty" style="width: 100%;"></div></div>';
        }

        const todoPercent = (counts.todo / total) * 100;
        const inProgressPercent = (counts.in_progress / total) * 100;
        const donePercent = (counts.done / total) * 100;

        return `
            <div class="status-bar">
                ${todoPercent > 0 ? `<div class="status-segment todo" style="width: ${todoPercent}%;" title="À faire: ${counts.todo}"></div>` : ''}
                ${inProgressPercent > 0 ? `<div class="status-segment in-progress" style="width: ${inProgressPercent}%;" title="En cours: ${counts.in_progress}"></div>` : ''}
                ${donePercent > 0 ? `<div class="status-segment done" style="width: ${donePercent}%;" title="Terminées: ${counts.done}"></div>` : ''}
            </div>
        `;
    }

    /**
     * Set period filter
     */
    function setPeriod(period) {
        currentPeriod = period;

        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(period === 'week' ? 'semaine' : period === 'month' ? 'mois' : 'tout')) {
                btn.classList.add('active');
            }
        });

        loadData();
    }

    /**
     * Refresh data
     */
    async function refresh() {
        cachedData = null;
        await render();
    }

    /**
     * Export to CSV
     */
    function exportCSV() {
        if (!cachedData || !cachedData.tasks) {
            alert('Aucune donnée à exporter');
            return;
        }

        const tasks = cachedData.tasks;
        const headers = ['Titre', 'Statut', 'Projet', 'Priorité', 'Date création', 'Date complétion'];

        const rows = tasks.map(t => [
            `"${(t.title || t.name || '').replace(/"/g, '""')}"`,
            t.status || 'todo',
            `"${(t.project?.name || t.projectName || 'Sans projet').replace(/"/g, '""')}"`,
            t.priority || 'normal',
            t.created_at || t.createdAt || '',
            t.completed_at || t.completedAt || ''
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_taches_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        render,
        refresh,
        setPeriod,
        exportCSV
    };
})();

if (typeof window !== 'undefined') {
    window.ReportsView = ReportsView;
}
