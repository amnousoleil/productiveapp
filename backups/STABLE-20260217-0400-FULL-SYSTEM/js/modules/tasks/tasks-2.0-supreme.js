/**
 * TASKS 2.0 - ERGONOMIE SUPRÊME
 * ProductiveApp - Ultra-Modern Task Management
 *
 * Features:
 * - 3 vues : Inbox (smart grouping), Kanban (drag & drop), Timeline (chronologique)
 * - Filtres intelligents (Aujourd'hui, Cette semaine, Urgent, Moi)
 * - Quick add inline
 * - Animations fluides
 * - Keyboard shortcuts
 */

const Tasks2Supreme = (function() {
    'use strict';

    // ==========================================
    // STATE
    // ==========================================
    let currentView = 'inbox'; // inbox | kanban | timeline
    let currentFilter = 'all'; // all | today | week | urgent | me
    let tasks = [];
    let projects = [];
    let currentUser = null;

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
        console.log('🎯 Tasks 2.0 Supreme: Initializing...');

        // Load data
        loadData();

        // Render interface
        renderInterface();

        // Attach events
        attachEvents();

        // Setup keyboard shortcuts
        setupKeyboardShortcuts();

        console.log('✅ Tasks 2.0 Supreme: Ready!');
    }

    async function loadData() {
        // Get current user
        if (typeof AppState !== 'undefined') {
            currentUser = AppState.currentUser;
            tasks = AppState.tasks || [];
            projects = AppState.projects || [];
        }

        // Reload from API if needed
        if (typeof Tasks !== 'undefined' && Tasks.load) {
            await Tasks.load();
            tasks = AppState.tasks || [];
        }
    }

    // ==========================================
    // INTERFACE RENDERING
    // ==========================================
    function renderInterface() {
        const container = document.getElementById('view-tasks');
        if (!container) {
            console.error('❌ #view-tasks container not found');
            return;
        }

        container.innerHTML = generateHTML();

        // Render current view
        renderCurrentView();
    }

    function generateHTML() {
        const stats = getStats();

        return `
            <!-- Command Bar -->
            <div class="tasks-command-bar">
                <!-- Header Row -->
                <div class="tasks-header-row">
                    <div class="tasks-title-section">
                        <h1 class="tasks-title">MA VISION</h1>
                        <span class="tasks-count">${stats.total}</span>
                    </div>

                    <!-- View Switcher -->
                    <div class="tasks-view-switcher">
                        <button class="view-switcher-btn ${currentView === 'inbox' ? 'active' : ''}" data-view="inbox">
                            <svg viewBox="0 0 24 24"><path d="M3 3h18v8H3V3zm0 10h7v8H3v-8zm9 0h9v8h-9v-8z"/></svg>
                            <span>Inbox</span>
                        </button>
                        <button class="view-switcher-btn ${currentView === 'kanban' ? 'active' : ''}" data-view="kanban">
                            <svg viewBox="0 0 24 24"><path d="M9 3H4v18h5V3zm11 0h-5v11h5V3zm-6 7h-5v11h5V10z"/></svg>
                            <span>Kanban</span>
                        </button>
                        <button class="view-switcher-btn ${currentView === 'timeline' ? 'active' : ''}" data-view="timeline">
                            <svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                            <span>Timeline</span>
                        </button>
                    </div>
                </div>

                <!-- Actions Row -->
                <div class="tasks-actions-row">
                    <!-- Quick Add -->
                    <div class="quick-add-inline">
                        <input
                            type="text"
                            id="quick-add-input"
                            placeholder="Nouvelle tâche... (Ctrl+K)"
                            autocomplete="off"
                        />
                        <button class="add-btn" id="quick-add-btn">+</button>
                    </div>

                    <!-- Smart Filters -->
                    <div class="tasks-smart-filters">
                        <button class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                            Toutes <span class="count">${stats.total}</span>
                        </button>
                        <button class="filter-chip ${currentFilter === 'today' ? 'active' : ''}" data-filter="today">
                            Aujourd'hui <span class="count">${stats.today}</span>
                        </button>
                        <button class="filter-chip ${currentFilter === 'week' ? 'active' : ''}" data-filter="week">
                            Cette semaine <span class="count">${stats.week}</span>
                        </button>
                        <button class="filter-chip ${currentFilter === 'urgent' ? 'active' : ''}" data-filter="urgent">
                            🔥 Urgent <span class="count">${stats.urgent}</span>
                        </button>
                        <button class="filter-chip ${currentFilter === 'me' ? 'active' : ''}" data-filter="me">
                            👤 Moi <span class="count">${stats.me}</span>
                        </button>
                    </div>

                    <!-- More Actions -->
                    <div class="tasks-more-actions">
                        <button class="action-icon-btn" id="sort-btn" title="Trier">
                            <svg viewBox="0 0 24 24"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg>
                        </button>
                        <button class="action-icon-btn" id="group-btn" title="Grouper">
                            <svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
                        </button>
                        <button class="action-icon-btn" id="search-btn" title="Rechercher">
                            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Content Zone (3 views) -->
            <div class="tasks-content-zone">
                <!-- Inbox View -->
                <div class="tasks-view tasks-view-inbox ${currentView === 'inbox' ? 'active' : ''}" id="view-inbox">
                    <!-- Rendered dynamically -->
                </div>

                <!-- Kanban View -->
                <div class="tasks-view tasks-view-kanban ${currentView === 'kanban' ? 'active' : ''}" id="view-kanban">
                    <!-- Rendered dynamically -->
                </div>

                <!-- Timeline View -->
                <div class="tasks-view tasks-view-timeline ${currentView === 'timeline' ? 'active' : ''}" id="view-timeline">
                    <!-- Rendered dynamically -->
                </div>
            </div>
        `;
    }

    // ==========================================
    // VIEW RENDERING
    // ==========================================
    function renderCurrentView() {
        switch (currentView) {
            case 'inbox':
                renderInboxView();
                break;
            case 'kanban':
                renderKanbanView();
                break;
            case 'timeline':
                renderTimelineView();
                break;
        }
    }

    // INBOX VIEW: Smart grouping par priorité/date
    function renderInboxView() {
        const container = document.getElementById('view-inbox');
        if (!container) return;

        const filtered = getFilteredTasks();

        if (filtered.length === 0) {
            container.innerHTML = renderEmptyState('inbox');
            return;
        }

        // Grouper intelligemment
        const groups = groupTasksIntelligently(filtered);

        let html = '';
        for (const group of groups) {
            html += `
                <div class="inbox-group">
                    <div class="inbox-group-header">
                        <div class="inbox-group-title">
                            <span>${group.icon}</span>
                            <span>${group.label}</span>
                        </div>
                        <span class="inbox-group-count">${group.tasks.length}</span>
                    </div>
                    <div class="inbox-tasks-list">
                        ${group.tasks.map(task => renderTaskCardInbox(task)).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    function groupTasksIntelligently(tasks) {
        const groups = [];

        // Groupe 1: Urgent + High priority
        const urgent = tasks.filter(t => t.priority?.level === 1 || t.priority?.level === 2);
        if (urgent.length > 0) {
            groups.push({
                icon: '🔥',
                label: 'Priorité haute',
                tasks: urgent
            });
        }

        // Groupe 2: En cours
        const inProgress = tasks.filter(t => t.status === 'inprogress');
        if (inProgress.length > 0) {
            groups.push({
                icon: '⚡',
                label: 'En cours',
                tasks: inProgress
            });
        }

        // Groupe 3: Aujourd'hui (medium priority ou sans date)
        const today = tasks.filter(t =>
            t.status === 'todo' &&
            (t.priority?.level === 3 || !t.priority) &&
            !urgent.includes(t)
        );
        if (today.length > 0) {
            groups.push({
                icon: '📋',
                label: 'À faire',
                tasks: today
            });
        }

        // Groupe 4: Terminé
        const done = tasks.filter(t => t.status === 'done').slice(0, 10);
        if (done.length > 0) {
            groups.push({
                icon: '✅',
                label: 'Terminé',
                tasks: done
            });
        }

        return groups;
    }

    function renderTaskCardInbox(task) {
        const project = projects.find(p => p.id === task.project) || { icon: '📁', name: 'Général', color: '#6B7280' };
        const priorityClass = getPriorityClass(task.priority?.level);
        const priorityLabel = getPriorityLabel(task.priority?.level);

        return `
            <div class="task-card-inbox" data-id="${task.id}" data-status="${task.status}">
                <div class="task-card-main">
                    <!-- Checkbox -->
                    <div class="task-checkbox-custom">
                        <input type="checkbox" ${task.status === 'done' ? 'checked' : ''} data-action="toggle">
                        <span class="task-checkbox-checkmark"></span>
                    </div>

                    <!-- Content -->
                    <div class="task-content-wrapper">
                        <div class="task-title-row">
                            <div class="task-title-text">${escapeHtml(task.text)}</div>
                            ${priorityClass !== 'low' ? `<span class="task-priority-badge ${priorityClass}">${priorityLabel}</span>` : ''}
                        </div>

                        <!-- Meta -->
                        <div class="task-meta-row">
                            <div class="task-project-tag" style="background: ${project.color}15; color: ${project.color};">
                                <span>${project.icon}</span>
                                <span>${project.name}</span>
                            </div>
                            ${task.userId ? `
                                <div class="task-meta-item">
                                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    <span>${getUserName(task.userId)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="task-actions-inline">
                        <button class="task-quick-action" data-action="edit" title="Éditer">
                            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="task-quick-action" data-action="delete" title="Supprimer">
                            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // KANBAN VIEW: 3 colonnes drag & drop
    function renderKanbanView() {
        const container = document.getElementById('view-kanban');
        if (!container) return;

        const filtered = getFilteredTasks();

        const todo = filtered.filter(t => t.status === 'todo');
        const inProgress = filtered.filter(t => t.status === 'inprogress');
        const done = filtered.filter(t => t.status === 'done').slice(0, 20);

        container.innerHTML = `
            <!-- À faire -->
            <div class="kanban-column todo" data-status="todo">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span class="kanban-column-indicator"></span>
                        <span>À faire</span>
                    </div>
                    <span class="kanban-column-count">${todo.length}</span>
                </div>
                <div class="kanban-column-body">
                    ${todo.length > 0 ? todo.map(t => renderTaskCardKanban(t)).join('') : '<div class="tasks-empty-state"><span class="empty-state-icon">📋</span><p class="empty-state-text">Aucune tâche</p></div>'}
                </div>
            </div>

            <!-- En cours -->
            <div class="kanban-column progress" data-status="inprogress">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span class="kanban-column-indicator"></span>
                        <span>En cours</span>
                    </div>
                    <span class="kanban-column-count">${inProgress.length}</span>
                </div>
                <div class="kanban-column-body">
                    ${inProgress.length > 0 ? inProgress.map(t => renderTaskCardKanban(t)).join('') : '<div class="tasks-empty-state"><span class="empty-state-icon">⚡</span><p class="empty-state-text">Rien en cours</p></div>'}
                </div>
            </div>

            <!-- Terminé -->
            <div class="kanban-column done" data-status="done">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span class="kanban-column-indicator"></span>
                        <span>Terminé</span>
                    </div>
                    <span class="kanban-column-count">${done.length}</span>
                </div>
                <div class="kanban-column-body">
                    ${done.length > 0 ? done.map(t => renderTaskCardKanban(t)).join('') : '<div class="tasks-empty-state"><span class="empty-state-icon">✅</span><p class="empty-state-text">Rien terminé</p></div>'}
                </div>
            </div>
        `;

        // Setup drag and drop
        setupKanbanDragDrop();
    }

    function renderTaskCardKanban(task) {
        const project = projects.find(p => p.id === task.project) || { icon: '📁', name: 'Général', color: '#6B7280' };
        const priorityClass = getPriorityClass(task.priority?.level);
        const priorityLabel = getPriorityLabel(task.priority?.level);

        return `
            <div class="task-card-kanban" data-id="${task.id}" draggable="true">
                <div class="task-title-row">
                    <div class="task-title-text">${escapeHtml(task.text)}</div>
                    ${priorityClass !== 'low' ? `<span class="task-priority-badge ${priorityClass}">${priorityLabel}</span>` : ''}
                </div>
                <div class="task-meta-row">
                    <div class="task-project-tag" style="background: ${project.color}15; color: ${project.color};">
                        <span>${project.icon}</span>
                    </div>
                    ${task.userId ? `
                        <div class="task-meta-item">
                            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            <span>${getUserName(task.userId)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // TIMELINE VIEW: Vue chronologique
    function renderTimelineView() {
        const container = document.getElementById('view-timeline');
        if (!container) return;

        const filtered = getFilteredTasks();

        if (filtered.length === 0) {
            container.innerHTML = renderEmptyState('timeline');
            return;
        }

        // Grouper par date (Aujourd'hui, Cette semaine, Plus tard)
        const sections = groupTasksByDate(filtered);

        let html = '<div class="timeline-container"><div class="timeline-line"></div>';

        for (const section of sections) {
            html += `
                <div class="timeline-section">
                    <div class="timeline-date-header">
                        <span class="timeline-date-dot"></span>
                        <span class="timeline-date-label">${section.label}</span>
                        <span class="timeline-date-count">${section.tasks.length} tâches</span>
                    </div>
                    <div class="timeline-tasks-list">
                        ${section.tasks.map(t => renderTaskCardTimeline(t)).join('')}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    function groupTasksByDate(tasks) {
        const today = new Date();
        const sections = [
            { label: "Aujourd'hui", tasks: [], icon: '📅' },
            { label: 'Cette semaine', tasks: [], icon: '📆' },
            { label: 'Plus tard', tasks: [], icon: '🗓️' }
        ];

        for (const task of tasks) {
            // Simple logic: all tasks go to "Aujourd'hui" for now
            // TODO: implement real date logic when task.dueDate exists
            sections[0].tasks.push(task);
        }

        return sections.filter(s => s.tasks.length > 0);
    }

    function renderTaskCardTimeline(task) {
        const project = projects.find(p => p.id === task.project) || { icon: '📁', name: 'Général', color: '#6B7280' };
        const priorityClass = getPriorityClass(task.priority?.level);
        const priorityLabel = getPriorityLabel(task.priority?.level);

        return `
            <div class="task-card-timeline" data-id="${task.id}">
                <div class="task-card-main">
                    <div class="task-checkbox-custom">
                        <input type="checkbox" ${task.status === 'done' ? 'checked' : ''} data-action="toggle">
                        <span class="task-checkbox-checkmark"></span>
                    </div>
                    <div class="task-content-wrapper">
                        <div class="task-title-row">
                            <div class="task-title-text">${escapeHtml(task.text)}</div>
                            ${priorityClass !== 'low' ? `<span class="task-priority-badge ${priorityClass}">${priorityLabel}</span>` : ''}
                        </div>
                        <div class="task-meta-row">
                            <div class="task-project-tag" style="background: ${project.color}15; color: ${project.color};">
                                <span>${project.icon}</span>
                                <span>${project.name}</span>
                            </div>
                            ${task.userId ? `
                                <div class="task-meta-item">
                                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    <span>${getUserName(task.userId)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="task-actions-inline">
                        <button class="task-quick-action" data-action="edit" title="Éditer">
                            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="task-quick-action" data-action="delete" title="Supprimer">
                            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderEmptyState(view) {
        const messages = {
            inbox: {
                icon: '🎯',
                title: 'Aucune tâche',
                text: 'Utilisez Ctrl+K pour créer votre première tâche'
            },
            kanban: {
                icon: '📋',
                title: 'Tableau vide',
                text: 'Créez des tâches pour les organiser en colonnes'
            },
            timeline: {
                icon: '📅',
                title: 'Timeline vide',
                text: 'Ajoutez des tâches pour visualiser votre planning'
            }
        };

        const msg = messages[view] || messages.inbox;

        return `
            <div class="tasks-empty-state">
                <div class="empty-state-icon">${msg.icon}</div>
                <h3 class="empty-state-title">${msg.title}</h3>
                <p class="empty-state-text">${msg.text}</p>
            </div>
        `;
    }

    // ==========================================
    // EVENTS
    // ==========================================
    function attachEvents() {
        const container = document.getElementById('view-tasks');
        if (!container) return;

        // View switcher
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-switcher-btn');
            if (btn) {
                switchView(btn.dataset.view);
            }
        });

        // Filter chips
        container.addEventListener('click', (e) => {
            const chip = e.target.closest('.filter-chip');
            if (chip) {
                switchFilter(chip.dataset.filter);
            }
        });

        // Quick add
        const addBtn = container.querySelector('#quick-add-btn');
        const addInput = container.querySelector('#quick-add-input');

        if (addBtn) {
            addBtn.addEventListener('click', () => handleQuickAdd());
        }

        if (addInput) {
            addInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleQuickAdd();
            });
        }

        // Task actions (delegation)
        container.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (!actionBtn) return;

            const taskCard = actionBtn.closest('[data-id]');
            if (!taskCard) return;

            const taskId = taskCard.dataset.id;
            const action = actionBtn.dataset.action;

            handleTaskAction(taskId, action);
        });

        // Task card click (open edit modal)
        container.addEventListener('click', (e) => {
            const taskCard = e.target.closest('.task-card-inbox, .task-card-timeline');
            if (!taskCard) return;

            // Ignore if clicking on action buttons or checkbox
            if (e.target.closest('[data-action]') || e.target.closest('.task-checkbox-custom')) {
                return;
            }

            const taskId = taskCard.dataset.id;
            if (typeof Tasks !== 'undefined' && Tasks.openEditModal) {
                Tasks.openEditModal(taskId);
            }
        });
    }

    function switchView(view) {
        if (view === currentView) return;

        currentView = view;

        // Update buttons
        const btns = document.querySelectorAll('.view-switcher-btn');
        btns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update views
        const views = document.querySelectorAll('.tasks-view');
        views.forEach(v => {
            v.classList.remove('active');
        });

        const targetView = document.getElementById(`view-${view}`);
        if (targetView) {
            targetView.classList.add('active');
            renderCurrentView();
        }
    }

    function switchFilter(filter) {
        if (filter === currentFilter) return;

        currentFilter = filter;

        // Update chips
        const chips = document.querySelectorAll('.filter-chip');
        chips.forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === filter);
        });

        // Re-render current view
        renderCurrentView();
    }

    async function handleQuickAdd() {
        const input = document.getElementById('quick-add-input');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        // Use existing Tasks module
        if (typeof Tasks !== 'undefined' && Tasks.create) {
            await Tasks.create({ text });

            // Reload data
            await loadData();

            // Clear input
            input.value = '';

            // Re-render
            renderInterface();
        }
    }

    async function handleTaskAction(taskId, action) {
        if (typeof Tasks !== 'undefined' && Tasks.handleAction) {
            if (action === 'toggle') {
                const task = tasks.find(t => t.id === taskId);
                if (!task) return;

                const newAction = task.status === 'done' ? 'reopen' : 'done';
                await Tasks.handleAction(taskId, newAction);
            } else if (action === 'edit') {
                if (Tasks.openEditModal) {
                    Tasks.openEditModal(taskId);
                }
                return; // Don't reload yet
            } else {
                await Tasks.handleAction(taskId, action);
            }

            // Reload and re-render
            await loadData();
            renderInterface();
        }
    }

    // ==========================================
    // DRAG & DROP (Kanban)
    // ==========================================
    function setupKanbanDragDrop() {
        const cards = document.querySelectorAll('.task-card-kanban');
        const columns = document.querySelectorAll('.kanban-column-body');

        cards.forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });

        columns.forEach(col => {
            col.addEventListener('dragover', handleDragOver);
            col.addEventListener('drop', handleDrop);
            col.addEventListener('dragleave', handleDragLeave);
        });
    }

    let draggedTask = null;

    function handleDragStart(e) {
        draggedTask = e.target.dataset.id;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        draggedTask = null;

        // Remove all drag-over classes
        document.querySelectorAll('.kanban-column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const column = e.target.closest('.kanban-column');
        if (column) {
            column.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        const column = e.target.closest('.kanban-column');
        if (column && !column.contains(e.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    }

    async function handleDrop(e) {
        e.preventDefault();

        const column = e.target.closest('.kanban-column');
        if (!column || !draggedTask) return;

        column.classList.remove('drag-over');

        const newStatus = column.dataset.status;
        const task = tasks.find(t => t.id === draggedTask);

        if (!task || task.status === newStatus) return;

        // Update via Tasks module
        if (typeof Tasks !== 'undefined' && Tasks.handleAction) {
            const actionMap = {
                'todo': 'reopen',
                'inprogress': 'start',
                'done': 'done'
            };

            const action = actionMap[newStatus];
            if (action) {
                await Tasks.handleAction(draggedTask, action);
                await loadData();
                renderKanbanView();
            }
        }
    }

    // ==========================================
    // KEYBOARD SHORTCUTS
    // ==========================================
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K: Focus quick add
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                const input = document.getElementById('quick-add-input');
                if (input) input.focus();
            }

            // 1,2,3: Switch views
            if (e.key === '1' && !e.ctrlKey && !e.metaKey) {
                const input = document.getElementById('quick-add-input');
                if (document.activeElement !== input) {
                    switchView('inbox');
                }
            }
            if (e.key === '2' && !e.ctrlKey && !e.metaKey) {
                const input = document.getElementById('quick-add-input');
                if (document.activeElement !== input) {
                    switchView('kanban');
                }
            }
            if (e.key === '3' && !e.ctrlKey && !e.metaKey) {
                const input = document.getElementById('quick-add-input');
                if (document.activeElement !== input) {
                    switchView('timeline');
                }
            }
        });
    }

    // ==========================================
    // FILTERS
    // ==========================================
    function getFilteredTasks() {
        let filtered = [...tasks];

        switch (currentFilter) {
            case 'today':
                // TODO: implement real date filtering
                filtered = filtered.filter(t => t.status !== 'done');
                break;
            case 'week':
                filtered = filtered.filter(t => t.status !== 'done');
                break;
            case 'urgent':
                filtered = filtered.filter(t => t.priority?.level === 1 || t.priority?.level === 2);
                break;
            case 'me':
                filtered = filtered.filter(t => t.userId === currentUser?.id);
                break;
            case 'all':
            default:
                // All tasks
                break;
        }

        return filtered;
    }

    function getStats() {
        const total = tasks.filter(t => t.status !== 'done').length;
        const today = tasks.filter(t => t.status !== 'done').length; // TODO: real date logic
        const week = tasks.filter(t => t.status !== 'done').length; // TODO: real date logic
        const urgent = tasks.filter(t => (t.priority?.level === 1 || t.priority?.level === 2) && t.status !== 'done').length;
        const me = tasks.filter(t => t.userId === currentUser?.id && t.status !== 'done').length;

        return { total, today, week, urgent, me };
    }

    // ==========================================
    // UTILS
    // ==========================================
    function getPriorityClass(level) {
        const map = { 1: 'urgent', 2: 'high', 3: 'medium', 4: 'low' };
        return map[level] || 'low';
    }

    function getPriorityLabel(level) {
        const map = { 1: 'Urgent', 2: 'Haute', 3: 'Normale', 4: 'Basse' };
        return map[level] || 'Normale';
    }

    function getUserName(userId) {
        if (typeof AppConfig !== 'undefined' && AppConfig.USERS) {
            const user = AppConfig.USERS.find(u => u.id === userId);
            return user ? user.name : 'Inconnu';
        }
        return 'Inconnu';
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==========================================
    // PUBLIC API
    // ==========================================
    return {
        init,
        refresh: () => {
            loadData().then(() => renderInterface());
        },
        switchView,
        switchFilter
    };
})();

// Export
if (typeof window !== 'undefined') {
    window.Tasks2Supreme = Tasks2Supreme;
}
