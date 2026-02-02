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

        if (mins < 1) return 'now';
        if (mins < 60) return `${mins}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
                    Dashboard
                </h1>
                <div class="view-actions">
                    <button class="btn btn-secondary" onclick="Dashboard.refresh()">
                        ${icons.refresh}
                        <span>Refresh</span>
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
                        <p>Projects</p>
                    </div>
                </div>
                <div class="stat-card" onclick="ViewRouter.navigate('tasks')">
                    <div class="stat-icon tasks">✓</div>
                    <div class="stat-content">
                        <h3>${stats.done}<span style="font-size:16px;color:var(--text-tertiary)">/${stats.tasks}</span></h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon urgent">🔥</div>
                    <div class="stat-content">
                        <h3>${stats.urgent}</h3>
                        <p>Urgent</p>
                    </div>
                </div>
            </div>

            <!-- Grid -->
            <div class="dashboard-grid">
                <!-- Quick Actions -->
                <div class="dashboard-section">
                    <div class="dashboard-section-header">
                        <h2 class="dashboard-section-title">⚡ Quick Actions</h2>
                    </div>
                    <div class="quick-actions">
                        <div class="quick-action" onclick="NotesModule.createNew(); ViewRouter.navigate('notes');">
                            <div class="quick-action-icon">📝</div>
                            <span>New Note</span>
                        </div>
                        <div class="quick-action" onclick="ProjectsView.openCreateModal()">
                            <div class="quick-action-icon">📁</div>
                            <span>New Project</span>
                        </div>
                        <div class="quick-action" onclick="ViewRouter.navigate('tasks')">
                            <div class="quick-action-icon">✓</div>
                            <span>Add Task</span>
                        </div>
                        <div class="quick-action" onclick="Sidebar.navigate('messaging')">
                            <div class="quick-action-icon">💬</div>
                            <span>AI Chat</span>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="dashboard-section">
                    <div class="dashboard-section-header">
                        <h2 class="dashboard-section-title">🕒 Recent Activity</h2>
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
                                        <strong>Welcome!</strong>
                                        <p>Start by creating a note or project</p>
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
                    <h2 class="dashboard-section-title">📊 Tasks Overview</h2>
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
                            Done (${stats.done})
                        </div>
                        <div class="progress-legend-item">
                            <span class="progress-legend-dot" style="background: #f59e0b;"></span>
                            In Progress (${stats.inProgress})
                        </div>
                        <div class="progress-legend-item">
                            <span class="progress-legend-dot" style="background: #3f3f46;"></span>
                            To Do (${stats.todo})
                        </div>
                    </div>
                </div>
            </div>
        `;
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

        // Load data from API if authenticated
        if (typeof ApiDataLoader !== 'undefined' && ApiTokens.isAuthenticated()) {
            try {
                await ApiDataLoader.loadAll();
            } catch (error) {
                console.warn('Failed to load data from API:', error);
            }
        }

        render();
        console.log('✅ Dashboard: Ready');
    }

    return { init, render, refresh, getStats };
})();

if (typeof window !== 'undefined') {
    window.Dashboard = Dashboard;
}
