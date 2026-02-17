/**
 * ================================================
 * DASHBOARD MODULE - ProductiveApp v4.0
 * Premium design inspired by Linear/Raycast
 * ================================================
 */

const Dashboard = (function() {
    'use strict';

    const icons = {
        refresh: '<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
        home: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        plus: '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        'file-text': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        'check-square': '<svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
        'message-circle': '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
    };

    function getStats() {
        const tasks = typeof AppState !== 'undefined' ? AppState.tasks || [] : [];
        const projects = typeof AppState !== 'undefined' ? AppState.projects || [] : [];
        const notes = typeof NotesModule !== 'undefined' ? NotesModule.getNotes() : [];

        return {
            notes: notes.length,
            projects: projects.length,
            tasks: tasks.length,
            todo: tasks.filter(t => t.status === 'todo').length,
            inProgress: tasks.filter(t => t.status === 'inprogress').length,
            done: tasks.filter(t => t.status === 'done').length,
            urgent: tasks.filter(t => t.priority == 1).length
        };
    }

    function getRecentActivity() {
        const activities = [];
        const tasks = typeof AppState !== 'undefined' ? AppState.tasks || [] : [];
        const journal = typeof AppState !== 'undefined' ? AppState.journal || [] : [];

        tasks.slice(0, 4).forEach(task => {
            activities.push({
                icon: '✓',
                text: task.text?.substring(0, 45) || 'Tâche',
                detail: task.project || 'Sans projet',
                time: task.created_at || new Date().toISOString()
            });
        });

        journal.slice(0, 2).forEach(entry => {
            activities.push({
                icon: '📝',
                text: entry.text?.substring(0, 45) || 'Entrée',
                detail: entry.category || 'Journal',
                time: entry.date || new Date().toISOString()
            });
        });

        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        return activities.slice(0, 6);
    }

    function formatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'maintenant';
        if (mins < 60) return `${mins}min`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // API Widget data cache
    let apiWidgets = { xp: null, streak: null, productivity: null };

    async function fetchApiWidgets() {
        if (typeof ApiFetch === 'undefined' || typeof ApiTokens === 'undefined') return;
        if (!ApiTokens.isAuthenticated()) return;

        const workspaceId = ApiTokens.getWorkspaceId();
        if (!workspaceId) return;

        const endpoints = [
            { key: 'xp', url: `/gamification/workspace/${workspaceId}/profile` },
            { key: 'streak', url: `/gamification/workspace/${workspaceId}/streaks` },
            { key: 'productivity', url: `/analytics/workspace/${workspaceId}/productivity` }
        ];

        const results = await Promise.allSettled(
            endpoints.map(e => ApiFetch.fetchWithAuth(e.url))
        );

        results.forEach((result, i) => {
            if (result.status === 'fulfilled' && result.value?.data) {
                apiWidgets[endpoints[i].key] = result.value.data;
            }
        });
    }

    function renderApiWidgets() {
        const xp = apiWidgets.xp?.profile || apiWidgets.xp;
        const streaks = apiWidgets.streak?.streaks || apiWidgets.streak;
        const prod = apiWidgets.productivity;

        // XP Widget
        const level = xp?.level || 1;
        const currentXp = xp?.current_xp || xp?.xp || 0;
        const xpForNext = xp?.xp_for_next_level || 1000;
        const xpPercent = Math.min(100, (currentXp / xpForNext) * 100);

        // Streak Widget
        const dailyStreak = streaks?.find?.(s => s.type === 'daily_login') || {};
        const currentStreak = dailyStreak.current || 0;
        const bestStreak = dailyStreak.best || 0;

        // Productivity Widget
        const weeklyRate = prod?.completion_rate || prod?.weekly_completion || 0;

        return `
            <div class="dashboard-api-widgets">
                <div class="api-widget xp-widget">
                    <div class="api-widget-icon">🏆</div>
                    <div class="api-widget-content">
                        <div class="api-widget-title">Niveau ${level}</div>
                        <div class="api-widget-progress">
                            <div class="api-progress-bar" style="width:${xpPercent}%"></div>
                        </div>
                        <div class="api-widget-detail">${currentXp} / ${xpForNext} XP</div>
                    </div>
                </div>
                <div class="api-widget streak-widget">
                    <div class="api-widget-icon">🔥</div>
                    <div class="api-widget-content">
                        <div class="api-widget-value">${currentStreak}</div>
                        <div class="api-widget-label">jours consécutifs</div>
                        <div class="api-widget-detail">Record: ${bestStreak} jours</div>
                    </div>
                </div>
                <div class="api-widget prod-widget">
                    <div class="api-widget-icon">📈</div>
                    <div class="api-widget-content">
                        <div class="api-widget-value">${Math.round(weeklyRate)}%</div>
                        <div class="api-widget-label">productivité semaine</div>
                        <div class="api-widget-progress">
                            <div class="api-progress-bar" style="width:${weeklyRate}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function render() {
        const container = document.getElementById('view-dashboard');
        if (!container) return;

        const stats = getStats();
        const activities = getRecentActivity();
        const donePercent = stats.tasks > 0 ? (stats.done / stats.tasks * 100) : 0;
        const progressPercent = stats.tasks > 0 ? (stats.inProgress / stats.tasks * 100) : 0;
        const todoPercent = stats.tasks > 0 ? (stats.todo / stats.tasks * 100) : 0;

        container.innerHTML = `
            <div class="view-header">
                <h1 class="view-title">
                    <span class="view-title-icon">${icons.home}</span>
                    Tableau de bord ${AppState?.currentUser?.name ? 'de ' + escapeHtml(AppState.currentUser.name) : ''}
                </h1>
                <div class="view-actions">
                    <button class="btn btn-secondary" onclick="Dashboard.refresh()">
                        ${icons.refresh}
                        <span>Actualiser</span>
                    </button>
                </div>
            </div>

            <!-- Stats -->
            <div class="dashboard-stats">
                <div class="stat-card" onclick="ViewRouter.navigate('notes')">
                    <div class="stat-icon notes">📝</div>
                    <div class="stat-content">
                        <h3>${stats.notes}</h3>
                        <p>Notes</p>
                    </div>
                </div>
                <div class="stat-card" onclick="ViewRouter.navigate('projects')">
                    <div class="stat-icon projects">📁</div>
                    <div class="stat-content">
                        <h3>${stats.projects}</h3>
                        <p>Projets</p>
                    </div>
                </div>
                <div class="stat-card" onclick="ViewRouter.navigate('tasks')">
                    <div class="stat-icon tasks">✓</div>
                    <div class="stat-content">
                        <h3>${stats.done}<span style="font-size:16px;color:var(--text-tertiary)">/${stats.tasks}</span></h3>
                        <p>Terminées</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon urgent">🔥</div>
                    <div class="stat-content">
                        <h3>${stats.urgent}</h3>
                        <p>Urgentes</p>
                    </div>
                </div>
            </div>

            <!-- API Widgets -->
            <div id="dashboard-api-widgets-container"></div>

            <!-- Insights -->
            <div id="dashboard-insights-container"></div>

            <!-- Grid -->
            <div class="dashboard-grid">
                <!-- Quick Actions -->
                <div class="dashboard-section">
                    <div class="dashboard-section-header">
                        <h2 class="dashboard-section-title">Actions rapides</h2>
                    </div>
                    <div class="quick-actions">
                        <div class="quick-action" onclick="NotesModule.createNew(); ViewRouter.navigate('notes');">
                            <div class="quick-action-icon">📝</div>
                            <span>Nouvelle note</span>
                        </div>
                        <div class="quick-action" onclick="ProjectsView.openCreateModal()">
                            <div class="quick-action-icon">📁</div>
                            <span>Nouveau projet</span>
                        </div>
                        <div class="quick-action" onclick="ViewRouter.navigate('tasks')">
                            <div class="quick-action-icon">✓</div>
                            <span>Ajouter une tâche</span>
                        </div>
                        <div class="quick-action" onclick="Sidebar.navigate('mahayawen')">
                            <div class="quick-action-icon">💬</div>
                            <span>Assistant IA</span>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="dashboard-section">
                    <div class="dashboard-section-header">
                        <h2 class="dashboard-section-title">Activité récente</h2>
                    </div>
                    <div class="dashboard-section-content">
                        <div class="activity-list">
                            ${activities.length > 0 ? activities.map(a => `
                                <div class="activity-item">
                                    <div class="activity-icon">${a.icon}</div>
                                    <div class="activity-content">
                                        <strong>${escapeHtml(a.text)}</strong>
                                        <p>${escapeHtml(a.detail)}</p>
                                    </div>
                                    <div class="activity-time">${formatTime(a.time)}</div>
                                </div>
                            `).join('') : `
                                <div class="activity-item">
                                    <div class="activity-icon">👋</div>
                                    <div class="activity-content">
                                        <strong>Bienvenue !</strong>
                                        <p>Commencez par créer une note ou un projet</p>
                                    </div>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Progress Section -->
            <div class="dashboard-section" style="margin-top: 24px;">
                <div class="dashboard-section-header">
                    <h2 class="dashboard-section-title">Vue d'ensemble des tâches</h2>
                </div>
                <div class="progress-section">
                    <div class="progress-bar-container">
                        <div style="width: ${donePercent}%; background: #22c55e;"></div>
                        <div style="width: ${progressPercent}%; background: #f59e0b;"></div>
                        <div style="width: ${todoPercent}%; background: #3f3f46;"></div>
                    </div>
                    <div class="progress-legend">
                        <div class="progress-legend-item">
                            <span class="progress-legend-dot" style="background: #22c55e;"></span>
                            Terminées (${stats.done})
                        </div>
                        <div class="progress-legend-item">
                            <span class="progress-legend-dot" style="background: #f59e0b;"></span>
                            En cours (${stats.inProgress})
                        </div>
                        <div class="progress-legend-item">
                            <span class="progress-legend-dot" style="background: #3f3f46;"></span>
                            À faire (${stats.todo})
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Widget Section -->
            <div id="dashboard-ai-widget-container"></div>

            <!-- Interactive Charts Section -->
            <div id="dashboard-charts-container"></div>
        `;

        // Load API widgets asynchronously
        loadApiWidgets();
    }

    async function loadApiWidgets() {
        const container = document.getElementById('dashboard-api-widgets-container');
        if (!container) return;

        await fetchApiWidgets();
        container.innerHTML = renderApiWidgets();

        // Load Insights widget
        const insightsContainer = document.getElementById('dashboard-insights-container');
        if (insightsContainer && typeof DashInsights !== 'undefined') {
            insightsContainer.innerHTML = DashInsights.render();
        }

        // Load AI Widget
        const aiWidgetContainer = document.getElementById('dashboard-ai-widget-container');
        if (aiWidgetContainer && typeof DashAIWidget !== 'undefined') {
            aiWidgetContainer.innerHTML = DashAIWidget.render();
            await DashAIWidget.loadContent();
        }

        // Load Charts section
        const chartsContainer = document.getElementById('dashboard-charts-container');
        if (chartsContainer && typeof DashCharts !== 'undefined') {
            chartsContainer.innerHTML = DashCharts.renderChartsSection();
            await DashCharts.init();
        }
    }

    async function refresh() {
        // Reload data from API if authenticated
        if (typeof ApiDataLoader !== 'undefined' && ApiTokens.isAuthenticated()) {
            try {
                await ApiDataLoader.loadAll();
            } catch (error) {
                console.warn('Failed to refresh data from API:', error);
            }
        }
        render();
    }

    async function init() {
        console.log('📊 Dashboard: Initializing...');
        // Use refresh() to ensure data is loaded (handles race condition with login)
        await refresh();
        console.log('✅ Dashboard: Ready');
    }

    return { init, render, refresh, getStats };
})();

if (typeof window !== 'undefined') {
    window.Dashboard = Dashboard;
}
