/**
 * ================================================
 * TEAM VISION VIEW - ProductiveApp v4.0
 * Vue globale de l'equipe avec stats par membre
 * ================================================
 */

const TeamVisionView = (function() {
    'use strict';

    let allTasks = [];
    let selectedMemberId = null; // null = overview, UUID = member detail

    const icons = {
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
        refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>'
    };

    function getMembers() {
        if (typeof AppConfig === 'undefined' || !AppConfig.USERS) return [];
        return AppConfig.USERS.filter(u => u.id !== 'all');
    }

    function getMemberStats(memberId) {
        const tasks = allTasks.filter(t =>
            t.assigned_to === memberId || t.creator_id === memberId
        );
        return {
            total: tasks.length,
            todo: tasks.filter(t => t.status === 'todo').length,
            inProgress: tasks.filter(t => t.status === 'inprogress').length,
            done: tasks.filter(t => t.status === 'done').length,
            urgent: tasks.filter(t => t.status !== 'done' && t.priority?.level === 1).length,
            tasks: tasks
        };
    }

    function getTeamStats() {
        return {
            total: allTasks.length,
            todo: allTasks.filter(t => t.status === 'todo').length,
            inProgress: allTasks.filter(t => t.status === 'inprogress').length,
            done: allTasks.filter(t => t.status === 'done').length,
            members: getMembers().length
        };
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'maintenant';
        if (mins < 60) return `${mins}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    // ==========================================
    // RENDER: Overview (all members)
    // ==========================================
    function renderOverview(container) {
        const team = getTeamStats();
        const members = getMembers();
        const donePercent = team.total > 0 ? Math.round(team.done / team.total * 100) : 0;

        container.innerHTML = `
            <div class="view-header">
                <h1 class="view-title">
                    <span class="view-title-icon">${icons.users}</span>
                    Vision Team
                </h1>
                <div class="view-actions">
                    <button class="btn btn-secondary" onclick="TeamVisionView.refresh()">
                        ${icons.refresh} <span>Actualiser</span>
                    </button>
                </div>
            </div>

            <div class="tv-team-summary">
                <div class="tv-summary-card">
                    <div class="tv-summary-value">${team.members}</div>
                    <div class="tv-summary-label">Membres</div>
                </div>
                <div class="tv-summary-card">
                    <div class="tv-summary-value">${team.total}</div>
                    <div class="tv-summary-label">Taches totales</div>
                </div>
                <div class="tv-summary-card tv-done">
                    <div class="tv-summary-value">${donePercent}%</div>
                    <div class="tv-summary-label">Completion</div>
                </div>
                <div class="tv-summary-card">
                    <div class="tv-summary-value">${team.todo}</div>
                    <div class="tv-summary-label">A faire</div>
                </div>
                <div class="tv-summary-card">
                    <div class="tv-summary-value">${team.inProgress}</div>
                    <div class="tv-summary-label">En cours</div>
                </div>
            </div>

            <h2 class="tv-section-title">Membres de l'equipe</h2>

            <div class="tv-members-grid">
                ${members.map(member => {
                    const stats = getMemberStats(member.id);
                    const completion = stats.total > 0 ? Math.round(stats.done / stats.total * 100) : 0;
                    return `
                        <div class="tv-member-card" data-member-id="${member.id}" onclick="TeamVisionView.selectMember('${member.id}')">
                            <div class="tv-member-header">
                                <span class="tv-member-avatar">${member.avatar || '👤'}</span>
                                <div class="tv-member-info">
                                    <div class="tv-member-name">${escapeHtml(member.name)}</div>
                                    <div class="tv-member-role">${member.role === 'boss' ? 'Boss' : 'Equipe'}</div>
                                </div>
                            </div>
                            <div class="tv-member-stats">
                                <div class="tv-stat">
                                    <span class="tv-stat-value">${stats.total}</span>
                                    <span class="tv-stat-label">Total</span>
                                </div>
                                <div class="tv-stat tv-stat-todo">
                                    <span class="tv-stat-value">${stats.todo}</span>
                                    <span class="tv-stat-label">A faire</span>
                                </div>
                                <div class="tv-stat tv-stat-progress">
                                    <span class="tv-stat-value">${stats.inProgress}</span>
                                    <span class="tv-stat-label">En cours</span>
                                </div>
                                <div class="tv-stat tv-stat-done">
                                    <span class="tv-stat-value">${stats.done}</span>
                                    <span class="tv-stat-label">Fait</span>
                                </div>
                            </div>
                            <div class="tv-member-progress">
                                <div class="tv-progress-bar">
                                    <div class="tv-progress-fill" style="width:${completion}%"></div>
                                </div>
                                <span class="tv-progress-text">${completion}%</span>
                            </div>
                            ${stats.urgent > 0 ? `<div class="tv-urgent-badge">${stats.urgent} urgent${stats.urgent > 1 ? 'es' : 'e'}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // ==========================================
    // RENDER: Member Detail
    // ==========================================
    function renderMemberDetail(container, memberId) {
        const members = getMembers();
        const member = members.find(m => m.id === memberId);
        if (!member) { renderOverview(container); return; }

        const stats = getMemberStats(memberId);
        const donePercent = stats.total > 0 ? Math.round(stats.done / stats.total * 100) : 0;
        const progressPercent = stats.total > 0 ? Math.round(stats.inProgress / stats.total * 100) : 0;
        const todoPercent = stats.total > 0 ? Math.round(stats.todo / stats.total * 100) : 0;

        // Recent tasks (last 10, sorted by updated)
        const recentTasks = [...stats.tasks]
            .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
            .slice(0, 10);

        // Tasks by project
        const projects = {};
        stats.tasks.forEach(t => {
            const pid = t.project_id || 'sans-projet';
            if (!projects[pid]) projects[pid] = { name: null, tasks: [] };
            projects[pid].tasks.push(t);
        });
        // Resolve project names
        Object.keys(projects).forEach(pid => {
            if (pid === 'sans-projet') {
                projects[pid].name = 'Sans projet';
            } else if (typeof AppState !== 'undefined') {
                const p = AppState.projects?.find(pr => pr.id === pid);
                projects[pid].name = p ? p.name : 'Projet';
            }
        });

        container.innerHTML = `
            <div class="view-header">
                <h1 class="view-title">
                    <button class="btn btn-ghost tv-back-btn" onclick="TeamVisionView.backToOverview()">
                        ${icons.back}
                    </button>
                    <span class="tv-detail-avatar">${member.avatar || '👤'}</span>
                    Dashboard de ${escapeHtml(member.name)}
                </h1>
                <div class="view-actions">
                    <button class="btn btn-secondary" onclick="TeamVisionView.refresh()">
                        ${icons.refresh} <span>Actualiser</span>
                    </button>
                </div>
            </div>

            <div class="tv-detail-stats">
                <div class="tv-detail-card">
                    <div class="tv-detail-card-icon">📋</div>
                    <div class="tv-detail-card-value">${stats.total}</div>
                    <div class="tv-detail-card-label">Taches</div>
                </div>
                <div class="tv-detail-card">
                    <div class="tv-detail-card-icon">✅</div>
                    <div class="tv-detail-card-value">${stats.done}/${stats.total}</div>
                    <div class="tv-detail-card-label">Completees</div>
                </div>
                <div class="tv-detail-card">
                    <div class="tv-detail-card-icon">🔥</div>
                    <div class="tv-detail-card-value">${stats.urgent}</div>
                    <div class="tv-detail-card-label">Urgentes</div>
                </div>
                <div class="tv-detail-card">
                    <div class="tv-detail-card-icon">📊</div>
                    <div class="tv-detail-card-value">${donePercent}%</div>
                    <div class="tv-detail-card-label">Completion</div>
                </div>
            </div>

            <div class="tv-detail-progress-section">
                <h3>Progression</h3>
                <div class="tv-detail-progress-bar">
                    <div class="tv-dp-done" style="width:${donePercent}%"></div>
                    <div class="tv-dp-progress" style="width:${progressPercent}%"></div>
                    <div class="tv-dp-todo" style="width:${todoPercent}%"></div>
                </div>
                <div class="tv-detail-progress-legend">
                    <span class="tv-legend-item"><span class="tv-legend-dot tv-dot-done"></span> Fait (${stats.done})</span>
                    <span class="tv-legend-item"><span class="tv-legend-dot tv-dot-progress"></span> En cours (${stats.inProgress})</span>
                    <span class="tv-legend-item"><span class="tv-legend-dot tv-dot-todo"></span> A faire (${stats.todo})</span>
                </div>
            </div>

            <div class="tv-detail-columns">
                <div class="tv-detail-section">
                    <h3>Taches recentes</h3>
                    <div class="tv-task-list">
                        ${recentTasks.length === 0 ? '<div class="tv-empty">Aucune tache</div>' :
                            recentTasks.map(t => `
                                <div class="tv-task-item tv-task-${t.status}">
                                    <span class="tv-task-status-dot"></span>
                                    <span class="tv-task-title">${escapeHtml(t.title || t.text)}</span>
                                    <span class="tv-task-time">${formatTime(t.updated_at || t.created_at)}</span>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>

                <div class="tv-detail-section">
                    <h3>Par projet</h3>
                    <div class="tv-project-list">
                        ${Object.keys(projects).length === 0 ? '<div class="tv-empty">Aucun projet</div>' :
                            Object.entries(projects).map(([pid, p]) => {
                                const done = p.tasks.filter(t => t.status === 'done').length;
                                const pct = p.tasks.length > 0 ? Math.round(done / p.tasks.length * 100) : 0;
                                return `
                                    <div class="tv-project-item">
                                        <div class="tv-project-name">${escapeHtml(p.name)}</div>
                                        <div class="tv-project-stats">${done}/${p.tasks.length} (${pct}%)</div>
                                        <div class="tv-project-bar">
                                            <div class="tv-project-bar-fill" style="width:${pct}%"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    function selectMember(memberId) {
        selectedMemberId = memberId;
        render();
    }

    function backToOverview() {
        selectedMemberId = null;
        render();
    }

    async function loadData() {
        try {
            if (typeof ApiDataLoader !== 'undefined' && ApiDataLoader.loadAllTasks) {
                allTasks = await ApiDataLoader.loadAllTasks();
            } else if (typeof ApiTasks !== 'undefined') {
                const raw = await ApiTasks.getAll({ limit: 500 });
                allTasks = raw;
            }
        } catch (err) {
            console.error('TeamVision: Failed to load tasks', err);
            allTasks = [];
        }
    }

    function render() {
        const container = document.getElementById('view-team-vision');
        if (!container) return;

        if (selectedMemberId) {
            renderMemberDetail(container, selectedMemberId);
        } else {
            renderOverview(container);
        }
    }

    async function refresh() {
        await loadData();
        render();
    }

    function init() {
        console.log('TeamVisionView: initialized');
    }

    return {
        init,
        render,
        refresh,
        selectMember,
        backToOverview
    };
})();

if (typeof window !== 'undefined') {
    window.TeamVisionView = TeamVisionView;
}
