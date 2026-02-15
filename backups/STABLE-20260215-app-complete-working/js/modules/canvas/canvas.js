// js/modules/canvas/canvas.js
import { canvasData } from './canvas-data.js';
import { renderCanvas } from './canvas-render.js';

export const canvasModule = {
    currentView: 'galaxie',
    currentFilter: 'all',
    currentAssigneeFilter: 'all',
    columnCount: 3,

    init() {
        console.log('🎨 Canvas init');
        this.setupEventListeners();
        this.switchView('galaxie');
    },

    setupEventListeners() {
        // View switchers
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Assignee filter
        const assigneeFilter = document.getElementById('assignee-filter');
        if (assigneeFilter) {
            assigneeFilter.addEventListener('change', (e) => {
                this.setAssigneeFilter(e.target.value);
            });
        }

        // Column count
        const columnSelect = document.getElementById('column-count');
        if (columnSelect) {
            columnSelect.addEventListener('change', (e) => {
                this.setColumnCount(parseInt(e.target.value));
            });
        }
    },

    switchView(view) {
        this.currentView = view;

        // Update buttons
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Show/hide views
        document.querySelectorAll('.canvas-view').forEach(el => {
            el.style.display = 'none';
        });

        const targetView = document.getElementById(`${view}-view`);
        if (targetView) {
            targetView.style.display = 'block';
        }

        this.render();
    },

    setFilter(filter) {
        this.currentFilter = filter;

        // Update filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.render();
    },

    setAssigneeFilter(assignee) {
        this.currentAssigneeFilter = assignee;
        this.render();
    },

    setColumnCount(count) {
        this.columnCount = count;
        this.render();
    },

    getFilteredTasks() {
        let tasks = canvasData.getAllTasks();

        // Filter by project/status
        if (this.currentFilter !== 'all') {
            tasks = tasks.filter(t => t.project === this.currentFilter);
        }

        // Filter by assignee
        if (this.currentAssigneeFilter !== 'all') {
            tasks = tasks.filter(t => t.assignee === this.currentAssigneeFilter);
        }

        return tasks;
    },

    render() {
        const tasks = this.getFilteredTasks();

        if (this.currentView === 'galaxie') {
            renderCanvas.renderGalaxie(tasks, this.columnCount);
        } else if (this.currentView === 'kanban') {
            renderCanvas.renderKanban(tasks);
        } else if (this.currentView === 'journal') {
            renderCanvas.renderJournal();
        }
    },

    addTask(taskData) {
        canvasData.addTask(taskData);
        this.render();
    },

    updateTask(taskId, updates) {
        canvasData.updateTask(taskId, updates);
        this.render();
    },

    deleteTask(taskId) {
        canvasData.deleteTask(taskId);
        this.render();
    },

    toggleTaskComplete(taskId) {
        const task = canvasData.getTask(taskId);
        if (task) {
            task.completed = !task.completed;
            canvasData.saveToLocalStorage();
            this.render();
        }
    }
};
