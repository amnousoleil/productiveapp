/**
 * ================================================
 * KANBAN BOARD + NOTIFICATION CENTER - ProductiveApp v1.0
 * Drag & drop kanban view for tasks
 * Notification center with bell icon + activity feed
 * ================================================
 */

/* ================================================
   KANBAN BOARD
   ================================================ */
var KanbanBoard = (function() {
    'use strict';

    var COLUMNS = [
        { id: 'todo', label: '\u00C0 faire', statuses: ['todo', 'pending'], color: 'var(--accent)', icon: '\u25CB' },
        { id: 'in_progress', label: 'En cours', statuses: ['in_progress', 'active', 'inprogress'], color: 'var(--warning, #f59e0b)', icon: '\u23F3' },
        { id: 'review', label: 'En revue', statuses: ['review', 'in_review'], color: 'var(--info, #3b82f6)', icon: '\uD83D\uDD0D' },
        { id: 'completed', label: 'Termin\u00e9', statuses: ['completed', 'done'], color: 'var(--success, #22c55e)', icon: '\u2705' }
    ];

    var initialized = false;
    var showing = false;
    var boardEl = null;
    var draggedCard = null;
    var filterProject = 'all';
    var sortMode = 'priority';

    function init() {
        if (initialized) return;
        initialized = true;
    }

    function show() {
        if (showing) return;
        showing = true;
        var container = document.getElementById('view-tasks');
        if (!container) return;

        // Hide default task list
        var taskList = container.querySelector('.task-list, .tasks-content, .tasks-container');
        if (taskList) taskList.style.display = 'none';

        // Create or show board
        if (!boardEl) {
            boardEl = document.createElement('div');
            boardEl.className = 'kanban-board';
            boardEl.id = 'kanban-board';
            container.appendChild(boardEl);
        }
        boardEl.style.display = '';
        refresh();

        // Toggle button state
        updateToggleButtons();
    }

    function hide() {
        if (!showing) return;
        showing = false;
        if (boardEl) boardEl.style.display = 'none';

        var container = document.getElementById('view-tasks');
        if (!container) return;
        var taskList = container.querySelector('.task-list, .tasks-content, .tasks-container');
        if (taskList) taskList.style.display = '';

        updateToggleButtons();
    }

    function isShowing() { return showing; }

    function refresh() {
        if (!boardEl || !showing) return;
        var tasks = getTasks();
        renderBoard(tasks);
    }

    function renderBoard(tasks) {
        if (!boardEl) return;

        // Filter by project
        if (filterProject !== 'all') {
            tasks = tasks.filter(function(t) {
                return (t.project_id || t.project || t.projectId) === filterProject;
            });
        }

        var html = '<div class="kanban-toolbar">';
        html += '<div class="kanban-toolbar-left">';
        html += '<div class="kanban-view-toggle">';
        html += '<button class="kanban-toggle-btn' + (!showing ? ' active' : '') + '" data-view="list" title="Vue liste"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>';
        html += '<button class="kanban-toggle-btn' + (showing ? ' active' : '') + '" data-view="kanban" title="Vue Kanban"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="10" rx="1"/></svg></button>';
        html += '</div>';

        // Project filter
        var projects = getUniqueProjects(getTasks());
        if (projects.length > 0) {
            html += '<select class="kanban-filter-select" id="kanban-project-filter">';
            html += '<option value="all">Tous les projets</option>';
            projects.forEach(function(p) {
                html += '<option value="' + escapeHtml(p.id) + '"' + (filterProject === p.id ? ' selected' : '') + '>' + escapeHtml(p.name || p.title || p.id) + '</option>';
            });
            html += '</select>';
        }
        html += '</div>';

        // Sort
        html += '<div class="kanban-toolbar-right">';
        html += '<select class="kanban-sort-select" id="kanban-sort">';
        html += '<option value="priority"' + (sortMode === 'priority' ? ' selected' : '') + '>Priorit\u00e9</option>';
        html += '<option value="dueDate"' + (sortMode === 'dueDate' ? ' selected' : '') + '>\u00c9ch\u00e9ance</option>';
        html += '</select>';
        html += '</div></div>';

        // Columns
        html += '<div class="kanban-columns">';
        COLUMNS.forEach(function(col) {
            var colTasks = tasks.filter(function(t) {
                var s = getTaskStatus(t);
                return col.statuses.indexOf(s) !== -1;
            });
            colTasks = sortTasks(colTasks);

            html += '<div class="kanban-column" data-column="' + col.id + '">';
            html += '<div class="kanban-column-header">';
            html += '<span class="kanban-column-icon">' + col.icon + '</span>';
            html += '<span class="kanban-column-title">' + col.label + '</span>';
            html += '<span class="kanban-column-count">' + colTasks.length + '</span>';
            html += '</div>';
            html += '<div class="kanban-column-body" data-status="' + col.id + '">';

            colTasks.forEach(function(task) {
                html += renderCard(task);
            });

            html += '</div>';
            html += '<button class="kanban-add-btn" data-column="' + col.id + '">+ Ajouter</button>';
            html += '</div>';
        });
        html += '</div>';

        boardEl.innerHTML = html;
        bindBoardEvents();
    }

    function renderCard(task) {
        var priority = getTaskPriority(task);
        var priorityClass = priority <= 1 ? 'high' : priority === 2 ? 'medium' : 'low';
        var priorityLabel = priority <= 1 ? 'Urgente' : priority === 2 ? 'Normale' : 'Basse';
        var project = getProjectForTask(task);
        var due = formatDueDate(task);
        var assignee = getAssignee(task);

        var html = '<div class="kanban-card" draggable="true" data-task-id="' + (task.id || '') + '">';
        html += '<div class="kanban-card-priority ' + priorityClass + '">' + priorityLabel + '</div>';
        html += '<div class="kanban-card-title">' + escapeHtml(task.title || task.text || 'Sans titre') + '</div>';

        if (project) {
            html += '<div class="kanban-card-project"><span class="kanban-card-project-dot" style="background:' + (project.color || 'var(--accent)') + '"></span>' + escapeHtml(project.name || project.title || '') + '</div>';
        }

        html += '<div class="kanban-card-meta">';
        if (due.text) html += '<span class="kanban-card-due ' + due.cssClass + '" title="' + due.full + '">' + due.text + '</span>';
        if (assignee) html += '<span class="kanban-card-assignee" title="' + escapeHtml(assignee.name || '') + '"><img src="' + escapeHtml(assignee.avatar || assignee.loginImg || '') + '" alt=""></span>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    function bindBoardEvents() {
        if (!boardEl) return;

        // View toggle
        boardEl.querySelectorAll('.kanban-toggle-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var view = btn.getAttribute('data-view');
                if (view === 'list') hide();
                else show();
            });
        });

        // Project filter
        var filterSelect = boardEl.querySelector('#kanban-project-filter');
        if (filterSelect) filterSelect.addEventListener('change', function() { filterProject = this.value; refresh(); });

        // Sort
        var sortSelect = boardEl.querySelector('#kanban-sort');
        if (sortSelect) sortSelect.addEventListener('change', function() { sortMode = this.value; refresh(); });

        // Add buttons
        boardEl.querySelectorAll('.kanban-add-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var colId = btn.getAttribute('data-column');
                showInlineAdd(colId);
            });
        });

        // Card click
        boardEl.querySelectorAll('.kanban-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var taskId = card.getAttribute('data-task-id');
                var task = findTaskById(taskId);
                if (task) openTaskDetail(task);
            });
        });

        // Drag & drop
        setupDragDrop();
    }

    function setupDragDrop() {
        var cards = boardEl.querySelectorAll('.kanban-card');
        var columns = boardEl.querySelectorAll('.kanban-column-body');

        cards.forEach(function(card) {
            card.addEventListener('dragstart', function(e) {
                draggedCard = card;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', card.getAttribute('data-task-id'));
            });
            card.addEventListener('dragend', function() {
                card.classList.remove('dragging');
                draggedCard = null;
                columns.forEach(function(col) { col.classList.remove('drag-over'); });
            });
        });

        columns.forEach(function(col) {
            col.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; col.classList.add('drag-over'); });
            col.addEventListener('dragleave', function() { col.classList.remove('drag-over'); });
            col.addEventListener('drop', function(e) {
                e.preventDefault();
                col.classList.remove('drag-over');
                var taskId = e.dataTransfer.getData('text/plain');
                var newStatus = col.getAttribute('data-status');
                if (taskId && newStatus) {
                    var backendStatus = mapColumnToBackendStatus(newStatus);
                    updateTaskStatus(taskId, backendStatus);
                    // Optimistic update
                    if (typeof AppState !== 'undefined' && AppState.tasks) {
                        var task = AppState.tasks.find(function(t) { return t.id === taskId; });
                        if (task) task.status = backendStatus;
                    }
                    refresh();
                }
            });
        });
    }

    function mapColumnToBackendStatus(colId) {
        var map = { todo: 'todo', in_progress: 'in_progress', review: 'review', completed: 'completed' };
        return map[colId] || colId;
    }

    function showInlineAdd(statusId) {
        var colBody = boardEl.querySelector('.kanban-column-body[data-status="' + statusId + '"]');
        if (!colBody) return;
        if (colBody.querySelector('.kanban-inline-add')) return;

        var form = document.createElement('div');
        form.className = 'kanban-inline-add';
        form.innerHTML = '<input class="kanban-inline-input" type="text" placeholder="Titre de la t\u00e2che..." autofocus><div class="kanban-inline-actions"><button class="kanban-inline-save">Cr\u00e9er</button><button class="kanban-inline-cancel">Annuler</button></div>';
        colBody.appendChild(form);

        var input = form.querySelector('.kanban-inline-input');
        input.focus();

        var save = function() {
            var title = input.value.trim();
            if (!title) { form.remove(); return; }
            createTask(title, statusId);
            form.remove();
        };

        form.querySelector('.kanban-inline-save').addEventListener('click', save);
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); save(); }
            else if (e.key === 'Escape') form.remove();
        });
        form.querySelector('.kanban-inline-cancel').addEventListener('click', function() { form.remove(); });
    }

    async function updateTaskStatus(taskId, newStatus) {
        try {
            if (typeof ApiTasks !== 'undefined' && ApiTasks.update) await ApiTasks.update(taskId, { status: newStatus });
            else if (typeof Api !== 'undefined' && Api.put) await Api.put('/tasks/' + taskId, { status: newStatus });

            if (newStatus === 'completed' || newStatus === 'done') {
                if (typeof NotificationCenter !== 'undefined' && NotificationCenter.addNotification) {
                    var task = findTaskById(taskId);
                    NotificationCenter.addNotification('success', 'T\u00e2che termin\u00e9e', (task ? task.title : '') + ' a \u00e9t\u00e9 marqu\u00e9e comme termin\u00e9e.');
                }
            }
        } catch (err) { refresh(); }
    }

    async function createTask(title, statusId) {
        var newStatus = mapColumnToBackendStatus(statusId);
        try {
            if (typeof ApiTasks !== 'undefined' && ApiTasks.create) {
                var created = await ApiTasks.create({ title: title, status: newStatus, priority: 'normal' });
                if (created && typeof AppState !== 'undefined') AppState.addTask(created);
            } else if (typeof Api !== 'undefined' && Api.post) {
                var wid = typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : null;
                if (wid) { var r = await Api.post('/tasks/workspace/' + wid, { title: title, status: newStatus, priority: 'normal' }); }
            }
            refresh();
        } catch (err) {}
    }

    function getTasks() {
        if (typeof AppState !== 'undefined' && AppState.tasks && AppState.tasks.length > 0) return AppState.tasks.slice();
        return [];
    }

    function findTaskById(taskId) {
        var tasks = getTasks();
        for (var i = 0; i < tasks.length; i++) { if (tasks[i].id === taskId) return tasks[i]; }
        return null;
    }

    function getTaskStatus(task) {
        var s = (task.status || 'todo').toLowerCase().replace(/\s+/g, '_');
        if (s === 'pending') return 'todo';
        if (s === 'active' || s === 'inprogress') return 'in_progress';
        return s;
    }

    function getTaskPriority(task) {
        if (typeof task.priority === 'number') return task.priority;
        if (typeof task.priority === 'string') {
            var map = { urgent: 1, high: 1, normal: 2, medium: 2, low: 3, zen: 3 };
            return map[task.priority.toLowerCase()] || 2;
        }
        return 2;
    }

    function getProjectForTask(task) {
        var pid = task.project_id || task.project || task.projectId;
        if (!pid || typeof AppState === 'undefined' || !AppState.projects) return null;
        return AppState.projects.find(function(p) { return p.id === pid; }) || null;
    }

    function getAssignee(task) {
        var uid = task.assigned_to || task.assignee_id || task.userId || task.user_id;
        if (!uid || typeof AppConfig === 'undefined' || !AppConfig.USERS) return null;
        return AppConfig.USERS.find(function(u) { return u.id === uid; }) || null;
    }

    function getUniqueProjects(tasks) {
        var seen = {}, result = [];
        tasks.forEach(function(t) {
            var p = getProjectForTask(t);
            if (p && !seen[p.id]) { seen[p.id] = true; result.push(p); }
        });
        return result;
    }

    function sortTasks(tasks) {
        var sorted = tasks.slice();
        if (sortMode === 'priority') sorted.sort(function(a, b) { return getTaskPriority(a) - getTaskPriority(b); });
        else if (sortMode === 'dueDate') sorted.sort(function(a, b) {
            var da = a.due_date || a.dueDate || a.deadline || '';
            var db = b.due_date || b.dueDate || b.deadline || '';
            if (!da && !db) return 0; if (!da) return 1; if (!db) return -1;
            return new Date(da) - new Date(db);
        });
        return sorted;
    }

    function formatDueDate(task) {
        var dateStr = task.due_date || task.dueDate || task.deadline;
        if (!dateStr) return { text: '', cssClass: '', full: '' };
        var date = new Date(dateStr);
        if (isNaN(date.getTime())) return { text: '', cssClass: '', full: '' };
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var diffDays = Math.floor((dueDay - today) / (1000 * 60 * 60 * 24));
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var full = day + '/' + month + '/' + date.getFullYear();
        var text = day + '/' + month;
        var cssClass = '';
        if (diffDays < 0) { cssClass = 'overdue'; text = 'En retard'; }
        else if (diffDays === 0) { cssClass = 'due-soon'; text = "Aujourd'hui"; }
        else if (diffDays === 1) { cssClass = 'due-soon'; text = 'Demain'; }
        else if (diffDays <= 3) cssClass = 'due-soon';
        return { text: text, cssClass: cssClass, full: full };
    }

    function openTaskDetail(task) {
        if (typeof TaskModule !== 'undefined' && TaskModule.openEditModal) TaskModule.openEditModal(task);
        else if (typeof Tasks !== 'undefined' && Tasks.openEditModal) Tasks.openEditModal(task);
        else if (typeof Tasks !== 'undefined' && Tasks.editTask) Tasks.editTask(task.id);
    }

    function updateToggleButtons() {
        var container = document.getElementById('view-tasks');
        if (!container) return;
        container.querySelectorAll('.kanban-toggle-btn').forEach(function(btn) {
            btn.classList.toggle('active', (btn.getAttribute('data-view') === 'kanban') === showing);
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { init: init, refresh: refresh, show: show, hide: hide, isShowing: isShowing };
})();

if (typeof window !== 'undefined') window.KanbanBoard = KanbanBoard;


/* ================================================
   NOTIFICATION CENTER
   ================================================ */
var NotificationCenter = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_notifications';
    var MAX_NOTIFICATIONS = 50;
    var CHECK_INTERVAL = 60000;

    var initialized = false;
    var panelOpen = false;
    var bellEl = null;
    var panelEl = null;
    var badgeEl = null;
    var checkTimer = null;

    var ICONS = {
        bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    };

    function init() {
        if (initialized) return;
        createBellButton();
        createPanel();
        setupOutsideClick();
        checkOverdueTasks();
        checkTimer = setInterval(checkOverdueTasks, CHECK_INTERVAL);
        updateBadge();
        initialized = true;
    }

    function addNotification(type, title, message) {
        var notifications = getAll();
        var notif = { id: genId(), type: type || 'info', title: title || '', message: message || '', timestamp: Date.now(), read: false };
        notifications.unshift(notif);
        if (notifications.length > MAX_NOTIFICATIONS) notifications = notifications.slice(0, MAX_NOTIFICATIONS);
        saveAll(notifications);
        updateBadge();
        if (panelOpen) renderPanelContent();
        return notif;
    }

    function markAsRead(id) {
        var n = getAll();
        for (var i = 0; i < n.length; i++) { if (n[i].id === id) { n[i].read = true; break; } }
        saveAll(n); updateBadge();
        if (panelOpen) renderPanelContent();
    }

    function markAllRead() {
        var n = getAll();
        n.forEach(function(x) { x.read = true; });
        saveAll(n); updateBadge();
        if (panelOpen) renderPanelContent();
    }

    function removeNotification(id) {
        saveAll(getAll().filter(function(n) { return n.id !== id; }));
        updateBadge();
        if (panelOpen) renderPanelContent();
    }

    function getUnreadCount() { return getAll().filter(function(n) { return !n.read; }).length; }
    function getAll() { try { var d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; } catch (e) { return []; } }
    function saveAll(n) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(n)); } catch (e) {} }

    function toggle() { panelOpen ? closePanel() : openPanel(); }

    function createBellButton() {
        bellEl = document.createElement('button');
        bellEl.className = 'notif-center-bell';
        bellEl.title = 'Centre de notifications';
        bellEl.innerHTML = ICONS.bell + '<span class="notif-center-badge hidden">0</span>';
        badgeEl = bellEl.querySelector('.notif-center-badge');
        bellEl.addEventListener('click', function(e) { e.stopPropagation(); toggle(); });

        // Inject into sidebar header or fallback to fixed
        var target = document.querySelector('.sidebar-header, .sidebar-top');
        if (target) {
            target.style.position = 'relative';
            bellEl.style.position = 'absolute';
            bellEl.style.top = '12px';
            bellEl.style.right = '12px';
            target.appendChild(bellEl);
        } else {
            bellEl.style.position = 'fixed';
            bellEl.style.top = '16px';
            bellEl.style.right = '16px';
            bellEl.style.zIndex = '9998';
            document.body.appendChild(bellEl);
        }
    }

    function createPanel() {
        panelEl = document.createElement('div');
        panelEl.className = 'notif-center-panel hidden';

        var header = document.createElement('div');
        header.className = 'notif-center-header';
        header.innerHTML = '<span class="notif-center-title">Notifications</span><div class="notif-center-header-actions"><button class="notif-center-mark-all">Tout lu</button><button class="notif-center-close">' + ICONS.close + '</button></div>';
        header.querySelector('.notif-center-mark-all').addEventListener('click', markAllRead);
        header.querySelector('.notif-center-close').addEventListener('click', closePanel);
        panelEl.appendChild(header);

        var body = document.createElement('div');
        body.className = 'notif-center-body';
        panelEl.appendChild(body);

        var footer = document.createElement('div');
        footer.className = 'notif-center-footer';
        footer.innerHTML = '<button class="notif-center-footer-btn">Effacer tout</button>';
        footer.querySelector('.notif-center-footer-btn').addEventListener('click', function() { saveAll([]); updateBadge(); renderPanelContent(); });
        panelEl.appendChild(footer);

        document.body.appendChild(panelEl);
    }

    function renderPanelContent() {
        if (!panelEl) return;
        var body = panelEl.querySelector('.notif-center-body');
        if (!body) return;
        var notifications = getAll();
        if (!notifications.length) {
            body.innerHTML = '<div class="notif-center-empty">' + ICONS.empty + '<span class="notif-center-empty-text">Aucune notification</span></div>';
            return;
        }
        body.innerHTML = '';
        notifications.forEach(function(notif) {
            var item = document.createElement('div');
            item.className = 'notif-center-item' + (notif.read ? '' : ' unread') + ' type-' + (notif.type || 'info');
            item.setAttribute('data-notif-id', notif.id);
            var iconSvg = ICONS[notif.type] || ICONS.info;
            item.innerHTML = '<div class="notif-center-item-icon type-' + (notif.type || 'info') + '">' + iconSvg + '</div>' +
                '<div class="notif-center-item-content"><div class="notif-center-item-title">' + escapeHtml(notif.title) + '</div><div class="notif-center-item-desc">' + escapeHtml(notif.message) + '</div><div class="notif-center-item-time">' + formatTimeAgo(notif.timestamp) + '</div></div>' +
                '<button class="notif-center-item-dismiss" title="Supprimer">&times;</button>';
            item.addEventListener('click', function(e) {
                if (e.target.closest('.notif-center-item-dismiss')) return;
                if (!notif.read) markAsRead(notif.id);
            });
            item.querySelector('.notif-center-item-dismiss').addEventListener('click', function(e) { e.stopPropagation(); removeNotification(notif.id); });
            body.appendChild(item);
        });
    }

    function openPanel() { if (!panelEl) return; renderPanelContent(); panelEl.classList.remove('hidden'); panelOpen = true; }
    function closePanel() { if (!panelEl) return; panelEl.classList.add('hidden'); panelOpen = false; }

    function setupOutsideClick() {
        document.addEventListener('click', function(e) {
            if (!panelOpen) return;
            if (panelEl && panelEl.contains(e.target)) return;
            if (bellEl && bellEl.contains(e.target)) return;
            closePanel();
        });
    }

    function updateBadge() {
        if (!badgeEl) return;
        var count = getUnreadCount();
        if (count > 0) { badgeEl.textContent = count > 99 ? '99+' : String(count); badgeEl.classList.remove('hidden'); }
        else badgeEl.classList.add('hidden');
    }

    function checkOverdueTasks() {
        var tasks = [];
        if (typeof AppState !== 'undefined' && AppState.tasks) tasks = AppState.tasks;
        if (!tasks || !tasks.length) return;

        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var todayStr = today.toISOString().slice(0, 10);
        var notifications = getAll();
        var notifiedToday = {};
        notifications.forEach(function(n) { if (n.type === 'alert' && n._overdueTaskId && n._dateKey === todayStr) notifiedToday[n._overdueTaskId] = true; });

        tasks.forEach(function(task) {
            var status = (task.status || '').toLowerCase();
            if (status === 'done' || status === 'completed') return;
            var dateStr = task.due_date || task.dueDate || task.deadline;
            if (!dateStr) return;
            var dueDate = new Date(dateStr);
            if (isNaN(dueDate.getTime())) return;
            var dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            if (dueDay < today && !notifiedToday[task.id]) {
                notifications.unshift({ id: genId(), type: 'alert', title: 'T\u00e2che en retard', message: (task.title || 'Sans titre') + ' \u2014 \u00e9ch\u00e9ance d\u00e9pass\u00e9e', timestamp: Date.now(), read: false, _overdueTaskId: task.id, _dateKey: todayStr });
            }
        });

        if (notifications.length > MAX_NOTIFICATIONS) notifications = notifications.slice(0, MAX_NOTIFICATIONS);
        saveAll(notifications); updateBadge();
    }

    function notifyPomodoroComplete() { addNotification('success', 'Pomodoro termin\u00e9', 'Session de concentration termin\u00e9e. Bravo !'); }
    function notifyStreakMilestone(days) { addNotification('success', 'S\u00e9rie de ' + days + ' jours !', 'F\u00e9licitations ! Vous maintenez une s\u00e9rie de ' + days + ' jours cons\u00e9cutifs.'); }

    function genId() { return 'nc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6); }

    function formatTimeAgo(timestamp) {
        if (!timestamp) return '';
        var diff = Date.now() - timestamp;
        var sec = Math.floor(diff / 1000), min = Math.floor(sec / 60), hr = Math.floor(min / 60), days = Math.floor(hr / 24);
        if (sec < 60) return '\u00C0 l\'instant';
        if (min < 60) return 'il y a ' + min + 'min';
        if (hr < 24) return 'il y a ' + hr + 'h';
        if (days === 1) return 'hier';
        if (days < 7) return 'il y a ' + days + 'j';
        return 'il y a ' + Math.floor(days / 7) + ' sem.';
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        init: init, addNotification: addNotification, markAsRead: markAsRead, markAllRead: markAllRead,
        removeNotification: removeNotification, getUnreadCount: getUnreadCount, getAll: getAll, toggle: toggle,
        notifyPomodoroComplete: notifyPomodoroComplete, notifyStreakMilestone: notifyStreakMilestone
    };
})();

if (typeof window !== 'undefined') window.NotificationCenter = NotificationCenter;
