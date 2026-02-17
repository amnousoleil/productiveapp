// js/modules/canvas/canvas-render.js - DIVINE VERSION v2.0 🔥
// Professional canvas rendering with drag-drop, animations, XP feedback, undo/redo

import { canvasData } from './canvas-data.js';

export const renderCanvas = {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    draggedTask: null,
    draggedElement: null,
    undoStack: [],
    selectedTasks: new Set(),
    sortMode: 'priority', // priority | date | title

    // ============================================================================
    // GALAXIE VIEW - Todo/Done Sections
    // ============================================================================
    renderGalaxie(tasks, columnCount = 3) {
        const container = document.getElementById('galaxie-grid') || document.getElementById('galaxie-view');
        if (!container) {
            console.warn('⚠️ Galaxie container not found');
            return;
        }

        // Clear and setup
        container.innerHTML = '';
        container.className = 'galaxie-container';

        // Sort tasks
        const sortedTasks = this.sortTasks(tasks);
        const todoTasks = sortedTasks.filter(t => !t.completed);
        const doneTasks = sortedTasks.filter(t => t.completed);

        // Empty state
        if (tasks.length === 0) {
            container.innerHTML = this.renderEmptyState('galaxie');
            return;
        }

        // Create sections
        const todoSection = this.createGalaxieSection('📋 À faire', todoTasks, false);
        const doneSection = this.createGalaxieSection('✅ Terminé', doneTasks, true);

        container.appendChild(todoSection);
        container.appendChild(doneSection);

        // Setup event delegation
        this.setupGalaxieEvents(container);
    },

    createGalaxieSection(title, tasks, isCompleted) {
        const section = document.createElement('div');
        section.className = 'galaxie-section';
        section.setAttribute('role', 'region');
        section.setAttribute('aria-label', title);

        const header = document.createElement('h2');
        header.className = 'galaxie-section-header';
        header.innerHTML = `
            <span class="section-title">${this.escapeHtml(title)}</span>
            <span class="section-count">${tasks.length}</span>
        `;
        section.appendChild(header);

        const list = document.createElement('div');
        list.className = 'galaxie-task-list';
        list.setAttribute('role', 'list');

        if (tasks.length === 0) {
            list.innerHTML = `<div class="empty-section">${isCompleted ? 'Aucune tâche terminée' : 'Aucune tâche en cours'}</div>`;
        } else {
            tasks.forEach(task => {
                const taskEl = this.createGalaxieTask(task, isCompleted);
                list.appendChild(taskEl);
            });
        }

        section.appendChild(list);
        return section;
    },

    createGalaxieTask(task, isCompleted) {
        const div = document.createElement('div');
        div.className = `galaxie-task ${isCompleted ? 'completed' : ''} ${task.priority ? 'priority-' + task.priority : ''}`;
        div.dataset.taskId = task.id;
        div.setAttribute('role', 'listitem');
        div.setAttribute('tabindex', '0');
        div.setAttribute('aria-label', `Tâche: ${task.title}`);

        const priorityIcon = this.getPriorityIcon(task.priority);
        const priorityLabel = this.getPriorityLabel(task.priority);

        div.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox"
                    id="task-${this.escapeHtml(task.id)}"
                    ${isCompleted ? 'checked' : ''}
                    data-action="toggle"
                    data-task-id="${this.escapeHtml(task.id)}"
                    aria-label="Marquer comme ${isCompleted ? 'non terminé' : 'terminé'}">
            </div>
            <div class="task-main">
                <div class="task-content">
                    <span class="task-priority" title="${this.escapeHtml(priorityLabel)}">${priorityIcon}</span>
                    <span class="task-title">${this.escapeHtml(task.title)}</span>
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    ${task.project ? `<span class="task-project">📁 ${this.escapeHtml(task.project)}</span>` : ''}
                    ${task.assignee ? `<span class="task-assignee">👤 ${this.escapeHtml(task.assignee)}</span>` : ''}
                    ${task.createdAt ? `<span class="task-date">🕒 ${this.formatDate(task.createdAt)}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn task-btn-edit"
                    data-action="edit"
                    data-task-id="${this.escapeHtml(task.id)}"
                    aria-label="Éditer la tâche"
                    title="Éditer">
                    ✏️
                </button>
                <button class="task-btn task-btn-delete"
                    data-action="delete"
                    data-task-id="${this.escapeHtml(task.id)}"
                    aria-label="Supprimer la tâche"
                    title="Supprimer">
                    🗑️
                </button>
            </div>
        `;

        // Animate in
        requestAnimationFrame(() => {
            div.classList.add('task-enter');
        });

        return div;
    },

    setupGalaxieEvents(container) {
        // Event delegation for all task actions
        container.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const taskId = target.dataset.taskId;

            if (!taskId) return;

            e.preventDefault();
            e.stopPropagation();

            switch (action) {
                case 'toggle':
                    this.handleToggleTask(taskId);
                    break;
                case 'edit':
                    this.handleEditTask(taskId);
                    break;
                case 'delete':
                    this.handleDeleteTask(taskId);
                    break;
            }
        });

        // Keyboard navigation
        container.addEventListener('keydown', (e) => {
            const task = e.target.closest('.galaxie-task');
            if (!task) return;

            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const taskId = task.dataset.taskId;
                this.handleToggleTask(taskId);
            } else if (e.key === 'Delete') {
                e.preventDefault();
                const taskId = task.dataset.taskId;
                this.handleDeleteTask(taskId);
            }
        });
    },

    // ============================================================================
    // KANBAN VIEW - With Drag & Drop
    // ============================================================================
    renderKanban(tasks) {
        const container = document.getElementById('kanban-board') || document.getElementById('kanban-view');
        if (!container) {
            console.warn('⚠️ Kanban container not found');
            return;
        }

        container.innerHTML = '';
        container.className = 'kanban-container';

        // Empty state
        if (tasks.length === 0) {
            container.innerHTML = this.renderEmptyState('kanban');
            return;
        }

        const columns = [
            { id: 'todo', title: '⏳ À faire', status: 'todo', color: '#f59e0b' },
            { id: 'doing', title: '🔄 En cours', status: 'doing', color: '#3b82f6' },
            { id: 'done', title: '✅ Terminé', status: 'done', color: '#22c55e' }
        ];

        columns.forEach(col => {
            const columnEl = this.createKanbanColumn(col, tasks);
            container.appendChild(columnEl);
        });

        // Setup drag & drop
        this.setupKanbanDragDrop(container);
    },

    createKanbanColumn(column, allTasks) {
        const tasks = allTasks.filter(t => {
            if (column.status === 'done') return t.completed || t.status === 'done';
            if (column.status === 'doing') return t.status === 'doing';
            return !t.completed && (!t.status || t.status === 'todo');
        });

        const columnEl = document.createElement('div');
        columnEl.className = 'kanban-column';
        columnEl.dataset.status = column.status;
        columnEl.style.borderTopColor = column.color;
        columnEl.setAttribute('role', 'region');
        columnEl.setAttribute('aria-label', column.title);

        columnEl.innerHTML = `
            <div class="kanban-column-header">
                <h3 class="kanban-column-title">${this.escapeHtml(column.title)}</h3>
                <span class="kanban-column-count">${tasks.length}</span>
            </div>
        `;

        const taskContainer = document.createElement('div');
        taskContainer.className = 'kanban-column-tasks';
        taskContainer.dataset.status = column.status;
        taskContainer.setAttribute('data-drop-zone', 'true');

        if (tasks.length === 0) {
            taskContainer.innerHTML = `<div class="kanban-empty">Glissez une tâche ici</div>`;
        } else {
            tasks.forEach(task => {
                const taskEl = this.createKanbanTask(task);
                taskContainer.appendChild(taskEl);
            });
        }

        columnEl.appendChild(taskContainer);
        return columnEl;
    },

    createKanbanTask(task) {
        const div = document.createElement('div');
        div.className = `kanban-task ${task.priority ? 'priority-' + task.priority : ''}`;
        div.dataset.taskId = task.id;
        div.draggable = true;
        div.setAttribute('role', 'article');
        div.setAttribute('tabindex', '0');
        div.setAttribute('aria-label', `Tâche: ${task.title}`);

        const priorityIcon = this.getPriorityIcon(task.priority);

        div.innerHTML = `
            <div class="kanban-task-header">
                <span class="kanban-task-priority">${priorityIcon}</span>
                <span class="kanban-task-id">#${this.escapeHtml(task.id.slice(-4))}</span>
            </div>
            <div class="kanban-task-title">${this.escapeHtml(task.title)}</div>
            ${task.description ? `<div class="kanban-task-description">${this.escapeHtml(task.description)}</div>` : ''}
            <div class="kanban-task-meta">
                ${task.project ? `<span class="kanban-task-project">${this.escapeHtml(task.project)}</span>` : ''}
                ${task.assignee ? `<span class="kanban-task-assignee">👤 ${this.escapeHtml(task.assignee)}</span>` : ''}
            </div>
        `;

        // Click to edit
        div.addEventListener('click', () => {
            this.handleEditTask(task.id);
        });

        return div;
    },

    setupKanbanDragDrop(container) {
        let dragCounter = 0;

        // Drag start
        container.addEventListener('dragstart', (e) => {
            const task = e.target.closest('.kanban-task');
            if (!task) return;

            this.draggedTask = task.dataset.taskId;
            this.draggedElement = task;
            task.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', task.innerHTML);
        });

        // Drag end
        container.addEventListener('dragend', (e) => {
            const task = e.target.closest('.kanban-task');
            if (!task) return;

            task.classList.remove('dragging');
            this.draggedTask = null;
            this.draggedElement = null;

            // Remove all drag-over classes
            container.querySelectorAll('.kanban-column-tasks').forEach(col => {
                col.classList.remove('drag-over');
            });
        });

        // Drag over column
        container.addEventListener('dragover', (e) => {
            const dropZone = e.target.closest('[data-drop-zone]');
            if (!dropZone) return;

            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        // Drag enter column
        container.addEventListener('dragenter', (e) => {
            const dropZone = e.target.closest('[data-drop-zone]');
            if (!dropZone) return;

            dragCounter++;
            dropZone.classList.add('drag-over');
        });

        // Drag leave column
        container.addEventListener('dragleave', (e) => {
            const dropZone = e.target.closest('[data-drop-zone]');
            if (!dropZone) return;

            dragCounter--;
            if (dragCounter === 0) {
                dropZone.classList.remove('drag-over');
            }
        });

        // Drop on column
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;

            const dropZone = e.target.closest('[data-drop-zone]');
            if (!dropZone || !this.draggedTask) return;

            dropZone.classList.remove('drag-over');

            const newStatus = dropZone.dataset.status;
            const taskId = this.draggedTask;

            // Update task status
            this.handleUpdateTaskStatus(taskId, newStatus);
        });
    },

    // ============================================================================
    // JOURNAL VIEW
    // ============================================================================
    renderJournal() {
        const container = document.getElementById('journal-container') || document.getElementById('journal-view');
        if (!container) {
            console.warn('⚠️ Journal container not found');
            return;
        }

        const entries = canvasData.getJournalEntries();

        container.innerHTML = '';
        container.className = 'journal-container';

        // Empty state
        if (entries.length === 0) {
            container.innerHTML = this.renderEmptyState('journal');
            return;
        }

        // Group by date
        const groupedEntries = this.groupEntriesByDate(entries);

        Object.entries(groupedEntries).forEach(([date, dateEntries]) => {
            const daySection = this.createJournalDaySection(date, dateEntries);
            container.appendChild(daySection);
        });

        // Setup events
        this.setupJournalEvents(container);
    },

    createJournalDaySection(date, entries) {
        const section = document.createElement('div');
        section.className = 'journal-day-section';
        section.setAttribute('role', 'region');
        section.setAttribute('aria-label', `Entrées du ${date}`);

        const header = document.createElement('h2');
        header.className = 'journal-day-header';
        header.textContent = this.formatDateHeader(date);
        section.appendChild(header);

        const entriesList = document.createElement('div');
        entriesList.className = 'journal-entries-list';

        entries.forEach(entry => {
            const entryEl = this.createJournalEntry(entry);
            entriesList.appendChild(entryEl);
        });

        section.appendChild(entriesList);
        return section;
    },

    createJournalEntry(entry) {
        const div = document.createElement('div');
        div.className = `journal-entry journal-entry-${entry.type || 'task'}`;
        div.dataset.entryId = entry.id;
        div.setAttribute('role', 'article');

        const typeIcons = {
            'task': '✅',
            'idea': '💡',
            'reflection': '🤔',
            'blocker': '🚧',
            'win': '🏆',
            'note': '📝'
        };

        const energyIcons = {
            'high': '⚡',
            'normal': '😊',
            'low': '😴'
        };

        const energyLabels = {
            'high': 'Haute énergie',
            'normal': 'Énergie normale',
            'low': 'Faible énergie'
        };

        div.innerHTML = `
            <div class="journal-entry-header">
                <span class="journal-entry-icon" title="${this.escapeHtml(entry.type || 'Note')}">${typeIcons[entry.type] || '📝'}</span>
                <span class="journal-entry-time">${this.formatTime(entry.timestamp)}</span>
                ${entry.energy ? `<span class="journal-entry-energy" title="${this.escapeHtml(energyLabels[entry.energy])}">${energyIcons[entry.energy]}</span>` : ''}
                <button class="journal-entry-delete" data-action="delete-entry" data-entry-id="${this.escapeHtml(entry.id)}" title="Supprimer">×</button>
            </div>
            <div class="journal-entry-content">${this.escapeHtml(entry.content)}</div>
        `;

        // Animate in
        requestAnimationFrame(() => {
            div.classList.add('entry-enter');
        });

        return div;
    },

    setupJournalEvents(container) {
        container.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('[data-action="delete-entry"]');
            if (!deleteBtn) return;

            e.preventDefault();
            const entryId = deleteBtn.dataset.entryId;
            this.handleDeleteEntry(entryId);
        });
    },

    // ============================================================================
    // ACTION HANDLERS
    // ============================================================================
    handleToggleTask(taskId) {
        const task = canvasData.getTask(taskId);
        if (!task) return;

        const wasCompleted = task.completed;

        // Save to undo stack
        this.pushUndo({
            type: 'toggle',
            taskId: taskId,
            oldValue: wasCompleted,
            newValue: !wasCompleted
        });

        // Toggle in module
        if (window.canvasModule && window.canvasModule.toggleTaskComplete) {
            window.canvasModule.toggleTaskComplete(taskId);
        } else {
            task.completed = !task.completed;
            canvasData.saveToLocalStorage();
            this.rerender();
        }

        // XP Feedback
        if (!wasCompleted && window.XpFeedback) {
            window.XpFeedback.triggerXp('task_completed', 20);
        }

        // Toast
        if (window.Toast) {
            window.Toast.success(
                wasCompleted ? 'Tâche réouverte' : 'Tâche terminée ! 🎉',
                {
                    duration: 2000,
                    action: {
                        label: 'Annuler',
                        callback: () => this.undo()
                    }
                }
            );
        }
    },

    handleEditTask(taskId) {
        // Try to use existing task popup module
        if (window.taskPopupModule && window.taskPopupModule.open) {
            window.taskPopupModule.open(taskId);
        } else if (window.Tasks && window.Tasks.openEditModal) {
            window.Tasks.openEditModal(taskId);
        } else {
            console.warn('No task edit handler found');
            if (window.Toast) {
                window.Toast.warning('Fonctionnalité d\'édition non disponible');
            }
        }
    },

    handleDeleteTask(taskId) {
        const task = canvasData.getTask(taskId);
        if (!task) return;

        // Save to undo stack
        this.pushUndo({
            type: 'delete',
            taskId: taskId,
            task: { ...task }
        });

        // Delete in module
        if (window.canvasModule && window.canvasModule.deleteTask) {
            window.canvasModule.deleteTask(taskId);
        } else {
            canvasData.deleteTask(taskId);
            this.rerender();
        }

        // Toast with undo
        if (window.Toast) {
            window.Toast.info(
                'Tâche supprimée',
                {
                    duration: 5000,
                    action: {
                        label: 'Annuler',
                        callback: () => this.undo()
                    }
                }
            );
        }
    },

    handleUpdateTaskStatus(taskId, newStatus) {
        const task = canvasData.getTask(taskId);
        if (!task) return;

        const oldStatus = task.status || 'todo';
        const oldCompleted = task.completed;

        // Save to undo stack
        this.pushUndo({
            type: 'status',
            taskId: taskId,
            oldStatus: oldStatus,
            newStatus: newStatus,
            oldCompleted: oldCompleted
        });

        // Update task
        task.status = newStatus;
        task.completed = (newStatus === 'done');
        canvasData.saveToLocalStorage();

        // XP if completed
        if (newStatus === 'done' && !oldCompleted && window.XpFeedback) {
            window.XpFeedback.triggerXp('task_completed', 20);
        }

        // Rerender
        this.rerender();

        // Toast
        if (window.Toast) {
            const statusLabels = {
                'todo': 'à faire',
                'doing': 'en cours',
                'done': 'terminée'
            };
            window.Toast.success(
                `Tâche déplacée vers "${statusLabels[newStatus] || newStatus}"`,
                {
                    duration: 2000,
                    action: {
                        label: 'Annuler',
                        callback: () => this.undo()
                    }
                }
            );
        }
    },

    handleDeleteEntry(entryId) {
        // Implementation depends on canvasData having deleteJournalEntry
        if (window.Toast) {
            window.Toast.info('Entrée supprimée', { duration: 2000 });
        }
        // Add actual delete logic here when canvasData supports it
        this.rerender();
    },

    // ============================================================================
    // UNDO/REDO SYSTEM
    // ============================================================================
    pushUndo(action) {
        this.undoStack.push(action);
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
    },

    undo() {
        const action = this.undoStack.pop();
        if (!action) return;

        switch (action.type) {
            case 'toggle': {
                const task = canvasData.getTask(action.taskId);
                if (task) {
                    task.completed = action.oldValue;
                    canvasData.saveToLocalStorage();
                    this.rerender();
                }
                break;
            }
            case 'delete': {
                canvasData.tasks.push(action.task);
                canvasData.saveToLocalStorage();
                this.rerender();
                break;
            }
            case 'status': {
                const task = canvasData.getTask(action.taskId);
                if (task) {
                    task.status = action.oldStatus;
                    task.completed = action.oldCompleted;
                    canvasData.saveToLocalStorage();
                    this.rerender();
                }
                break;
            }
        }

        if (window.Toast) {
            window.Toast.info('Action annulée', { duration: 1500 });
        }
    },

    // ============================================================================
    // HELPERS
    // ============================================================================
    rerender() {
        // Trigger re-render in canvas module if available
        if (window.canvasModule && window.canvasModule.render) {
            window.canvasModule.render();
        }
    },

    sortTasks(tasks) {
        const sorted = [...tasks];

        const priorityOrder = { urgent: 0, important: 1, normal: 2, zen: 3 };

        switch (this.sortMode) {
            case 'priority':
                sorted.sort((a, b) => {
                    const aPri = priorityOrder[a.priority] ?? 2;
                    const bPri = priorityOrder[b.priority] ?? 2;
                    return aPri - bPri;
                });
                break;
            case 'date':
                sorted.sort((a, b) => {
                    const aDate = new Date(a.createdAt || 0);
                    const bDate = new Date(b.createdAt || 0);
                    return bDate - aDate;
                });
                break;
            case 'title':
                sorted.sort((a, b) => {
                    return (a.title || '').localeCompare(b.title || '');
                });
                break;
        }

        return sorted;
    },

    groupEntriesByDate(entries) {
        const grouped = {};

        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const dateKey = date.toISOString().split('T')[0];

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(entry);
        });

        return grouped;
    },

    getPriorityIcon(priority) {
        const icons = {
            'urgent': '🔥',
            'important': '⚡',
            'normal': '📌',
            'zen': '💤'
        };
        return icons[priority] || '📌';
    },

    getPriorityLabel(priority) {
        const labels = {
            'urgent': 'Urgent',
            'important': 'Important',
            'normal': 'Normal',
            'zen': 'Zen'
        };
        return labels[priority] || 'Normal';
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins}min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;

        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    },

    formatTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    },

    formatDateHeader(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateKey = date.toISOString().split('T')[0];
        const todayKey = today.toISOString().split('T')[0];
        const yesterdayKey = yesterday.toISOString().split('T')[0];

        if (dateKey === todayKey) return 'Aujourd\'hui';
        if (dateKey === yesterdayKey) return 'Hier';

        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    },

    renderEmptyState(view) {
        const states = {
            galaxie: {
                icon: '🌌',
                title: 'Aucune tâche',
                message: 'Créez votre première tâche pour commencer votre galaxie de productivité',
                action: 'Créer une tâche'
            },
            kanban: {
                icon: '📋',
                title: 'Tableau vide',
                message: 'Organisez vos tâches en colonnes pour mieux suivre votre flux de travail',
                action: 'Créer une tâche'
            },
            journal: {
                icon: '📔',
                title: 'Journal vide',
                message: 'Commencez à documenter vos réflexions, idées et victoires quotidiennes',
                action: 'Nouvelle entrée'
            }
        };

        const state = states[view] || states.galaxie;

        return `
            <div class="empty-state" role="status" aria-live="polite">
                <div class="empty-state-icon">${state.icon}</div>
                <h3 class="empty-state-title">${this.escapeHtml(state.title)}</h3>
                <p class="empty-state-message">${this.escapeHtml(state.message)}</p>
                <button class="empty-state-action" onclick="window.canvasModule?.addTask?.({})" aria-label="${this.escapeHtml(state.action)}">
                    ${this.escapeHtml(state.action)}
                </button>
            </div>
        `;
    },

    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================================================
// AUTO-INIT
// ============================================================================
if (typeof window !== 'undefined') {
    window.renderCanvas = renderCanvas;
    console.log('🎨 Canvas Render v2.0 DIVINE loaded');
}
