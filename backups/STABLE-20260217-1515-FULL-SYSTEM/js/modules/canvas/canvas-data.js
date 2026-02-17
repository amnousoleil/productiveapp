// js/modules/canvas/canvas-data.js
export const canvasData = {
    tasks: [],
    journalEntries: [],

    init() {
        this.loadFromLocalStorage();
    },

    loadFromLocalStorage() {
        const stored = localStorage.getItem('productiveapp_tasks');
        if (stored) {
            this.tasks = JSON.parse(stored);
        }

        const journal = localStorage.getItem('productiveapp_journal');
        if (journal) {
            this.journalEntries = JSON.parse(journal);
        }
    },

    saveToLocalStorage() {
        localStorage.setItem('productiveapp_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('productiveapp_journal', JSON.stringify(this.journalEntries));
    },

    getAllTasks() {
        return this.tasks;
    },

    getTask(id) {
        return this.tasks.find(t => t.id === id);
    },

    addTask(taskData) {
        const task = {
            id: Date.now().toString(),
            title: taskData.title || 'Nouvelle tâche',
            project: taskData.project || 'default',
            priority: taskData.priority || 'normal',
            assignee: taskData.assignee || 'me',
            status: taskData.status || 'todo',
            completed: false,
            createdAt: new Date().toISOString(),
            ...taskData
        };

        this.tasks.unshift(task);
        this.saveToLocalStorage();
        return task;
    },

    updateTask(id, updates) {
        const task = this.getTask(id);
        if (task) {
            Object.assign(task, updates);
            this.saveToLocalStorage();
        }
    },

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveToLocalStorage();
    },

    addJournalEntry(entry) {
        const journalEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: entry.type || 'task',
            content: entry.content || '',
            energy: entry.energy || 'normal',
            ...entry
        };

        this.journalEntries.unshift(journalEntry);
        this.saveToLocalStorage();
        return journalEntry;
    },

    getJournalEntries() {
        return this.journalEntries;
    }
};
