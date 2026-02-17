// js/modules/task-popup/task-popup.js
import { canvasData } from '../canvas/canvas-data.js';
import { taskPopupUI } from './task-popup-ui.js';

export const taskPopupModule = {
    currentTaskId: null,

    init() {
        console.log('📝 Task Popup init');
        this.setupEventListeners();
    },

    setupEventListeners() {
        const popup = document.getElementById('task-popup');
        if (!popup) return;

        const closeBtn = popup.querySelector('.close-popup');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.close();
            }
        });

        const saveBtn = popup.querySelector('.save-task-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }
    },

    open(taskId = null) {
        this.currentTaskId = taskId;

        const popup = document.getElementById('task-popup');
        if (!popup) return;

        if (taskId) {
            const task = canvasData.getTask(taskId);
            if (task) {
                taskPopupUI.populateForm(task);
            }
        } else {
            taskPopupUI.clearForm();
        }

        popup.classList.add('active');
    },

    close() {
        const popup = document.getElementById('task-popup');
        if (popup) {
            popup.classList.remove('active');
        }
        this.currentTaskId = null;
    },

    save() {
        const formData = taskPopupUI.getFormData();

        if (!formData.title.trim()) {
            alert('Le titre est requis');
            return;
        }

        if (this.currentTaskId) {
            window.canvasModule.updateTask(this.currentTaskId, formData);
        } else {
            window.canvasModule.addTask(formData);
        }

        this.close();
    }
};
