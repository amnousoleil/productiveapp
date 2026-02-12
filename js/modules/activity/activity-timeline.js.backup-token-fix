/**
 * ACTIVITY TIMELINE - ProductiveApp v4.0
 * Flux chronologique des actions recentes
 */
const ActivityTimeline = (function() {
    'use strict';

    var activities = [];
    var filter = 'all';
    var containerId = 'view-activity';

    var TYPES = {
        task: { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>', color: 'var(--accent)' },
        note: { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', color: '#10b981' },
        project: { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>', color: '#f59e0b' },
        invoice: { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>', color: '#8b5cf6' },
        gamification: { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>', color: '#ec4899' }
    };

    function init() {
        // Ecouter les evenements de l'app pour construire la timeline
        document.addEventListener('taskStatusChanged', function(e) {
            if (e.detail) addLocal('task', 'Tâche terminée : ' + (e.detail.title || ''));
        });
    }

    function addLocal(type, message) {
        activities.unshift({
            type: type,
            message: message,
            timestamp: new Date().toISOString()
        });
        if (activities.length > 100) activities.length = 100;
    }

    async function loadFromApi() {
        try {
            var wsId = getWorkspaceId();
            if (!wsId) return;
            var token = getToken();
            if (!token) return;
            var resp = await fetch('/api/v1/analytics/' + wsId + '/activity', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (resp.ok) {
                var data = await resp.json();
                if (data.data && Array.isArray(data.data)) {
                    activities = data.data.map(function(a) {
                        return {
                            type: a.entity_type || a.type || 'task',
                            message: formatActivityMessage(a),
                            timestamp: a.created_at || a.timestamp || new Date().toISOString(),
                            details: a
                        };
                    });
                }
            }
        } catch (e) {
            console.error('ActivityTimeline load error:', e);
            buildFromState();
        }
    }

    function buildFromState() {
        activities = [];
        if (typeof AppState !== 'undefined') {
            // Construire depuis les donnees locales
            if (AppState.tasks) {
                AppState.tasks.slice(0, 20).forEach(function(t) {
                    activities.push({
                        type: 'task',
                        message: (t.status === 'done' ? 'Terminée' : 'Mise à jour') + ' : ' + (t.title || t.text || ''),
                        timestamp: t.updated_at || t.created_at || new Date().toISOString()
                    });
                });
            }
            if (AppState.projects) {
                AppState.projects.slice(0, 10).forEach(function(p) {
                    activities.push({
                        type: 'project',
                        message: 'Projet : ' + (p.name || p.title || ''),
                        timestamp: p.updated_at || p.created_at || new Date().toISOString()
                    });
                });
            }
            if (AppState.notes) {
                AppState.notes.slice(0, 10).forEach(function(n) {
                    activities.push({
                        type: 'note',
                        message: 'Note : ' + (n.title || ''),
                        timestamp: n.updated_at || n.created_at || new Date().toISOString()
                    });
                });
            }
        }
        // Trier par date decroissante
        activities.sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
    }

    function formatActivityMessage(a) {
        var action = a.action || 'updated';
        var entity = a.entity_type || 'item';
        var name = a.entity_name || a.title || '';
        var actionMap = {
            created: 'Créé',
            updated: 'Mis à jour',
            deleted: 'Supprimé',
            completed: 'Terminé'
        };
        return (actionMap[action] || action) + ' ' + entity + (name ? ' : ' + name : '');
    }

    async function render() {
        var container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div class="activity-loading"><div class="skeleton-line" style="width:60%;height:20px;margin:16px auto;background:var(--bg-tertiary);border-radius:4px;animation:shimmer 1.5s infinite"></div></div>';

        await loadFromApi();

        var filtered = filter === 'all' ? activities : activities.filter(function(a) { return a.type === filter; });

        var html = '<div class="activity-container">';
        html += '<div class="activity-header">';
        html += '<h2>Activité récente</h2>';
        html += '<div class="activity-filters">';
        html += renderFilterChip('all', 'Tout');
        html += renderFilterChip('task', 'Tâches');
        html += renderFilterChip('note', 'Notes');
        html += renderFilterChip('project', 'Projets');
        html += renderFilterChip('invoice', 'Factures');
        html += '</div></div>';

        if (!filtered.length) {
            html += '<div class="activity-empty">';
            html += '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
            html += '<p>Aucune activité récente</p>';
            html += '</div>';
        } else {
            html += '<div class="activity-list">';
            var lastDate = '';
            filtered.forEach(function(a) {
                var date = formatDate(a.timestamp);
                if (date !== lastDate) {
                    html += '<div class="activity-date-separator">' + date + '</div>';
                    lastDate = date;
                }
                var typeInfo = TYPES[a.type] || TYPES.task;
                html += '<div class="activity-item">';
                html += '<div class="activity-icon" style="color:' + typeInfo.color + '">' + typeInfo.icon + '</div>';
                html += '<div class="activity-content">';
                html += '<div class="activity-message">' + escHtml(a.message) + '</div>';
                html += '<div class="activity-time">' + formatTime(a.timestamp) + '</div>';
                html += '</div></div>';
            });
            html += '</div>';
        }
        html += '</div>';
        container.innerHTML = html;
    }

    function renderFilterChip(id, label) {
        return '<button class="activity-filter-chip' + (filter === id ? ' active' : '') + '" onclick="ActivityTimeline.setFilter(\'' + id + '\')">' + label + '</button>';
    }

    function setFilter(f) {
        filter = f;
        render();
    }

    function renderDashboardWidget() {
        var recent = activities.slice(0, 5);
        if (!recent.length) {
            buildFromState();
            recent = activities.slice(0, 5);
        }
        if (!recent.length) return '<div class="dash-widget activity-widget"><h3>Activité récente</h3><p style="color:var(--text-muted);font-size:13px;">Aucune activité</p></div>';

        var html = '<div class="dash-widget activity-widget">';
        html += '<h3>Activité récente</h3>';
        html += '<div class="activity-widget-list">';
        recent.forEach(function(a) {
            var typeInfo = TYPES[a.type] || TYPES.task;
            html += '<div class="activity-widget-item">';
            html += '<span class="activity-widget-icon" style="color:' + typeInfo.color + '">' + typeInfo.icon + '</span>';
            html += '<span class="activity-widget-text">' + escHtml(truncate(a.message, 40)) + '</span>';
            html += '<span class="activity-widget-time">' + timeAgo(a.timestamp) + '</span>';
            html += '</div>';
        });
        html += '</div></div>';
        return html;
    }

    function formatDate(ts) {
        var d = new Date(ts);
        var today = new Date();
        if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
        var yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Hier';
        return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    function formatTime(ts) {
        return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    function timeAgo(ts) {
        var diff = (Date.now() - new Date(ts).getTime()) / 1000;
        if (diff < 60) return 'À l\'instant';
        if (diff < 3600) return Math.floor(diff / 60) + 'min';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        return Math.floor(diff / 86400) + 'j';
    }

    function truncate(s, n) { return s.length > n ? s.substring(0, n) + '…' : s; }
    function escHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function getWorkspaceId() {
        if (typeof AppState !== 'undefined' && AppState.currentWorkspace) return AppState.currentWorkspace.id || AppState.currentWorkspace;
        return localStorage.getItem('productiveapp_workspace_id');
    }

    function getToken() {
        return localStorage.getItem('productiveapp_token') || (typeof AppState !== 'undefined' && AppState.token);
    }

    return {
        init: init,
        render: render,
        setFilter: setFilter,
        renderDashboardWidget: renderDashboardWidget,
        loadFromApi: loadFromApi
    };
})();

if (typeof window !== 'undefined') window.ActivityTimeline = ActivityTimeline;
