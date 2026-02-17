// js/modules/task-popup/task-popup-ui.js
export const taskPopupUI = {
    populateForm(task) {
        const titleInput = document.getElementById('task-title-input');
        const projectSelect = document.getElementById('task-project-select');
        const prioritySelect = document.getElementById('task-priority-select');
        const assigneeSelect = document.getElementById('task-assignee-select');

        if (titleInput) titleInput.value = task.title || '';
        if (projectSelect) projectSelect.value = task.project || 'default';
        if (prioritySelect) prioritySelect.value = task.priority || 'normal';
        if (assigneeSelect) assigneeSelect.value = task.assignee || 'me';
    },

    clearForm() {
        const titleInput = document.getElementById('task-title-input');
        const projectSelect = document.getElementById('task-project-select');
        const prioritySelect = document.getElementById('task-priority-select');
        const assigneeSelect = document.getElementById('task-assignee-select');

        if (titleInput) titleInput.value = '';
        if (projectSelect) projectSelect.value = 'default';
        if (prioritySelect) prioritySelect.value = 'normal';
        if (assigneeSelect) assigneeSelect.value = 'me';
    },

    getFormData() {
        const titleInput = document.getElementById('task-title-input');
        const projectSelect = document.getElementById('task-project-select');
        const prioritySelect = document.getElementById('task-priority-select');
        const assigneeSelect = document.getElementById('task-assignee-select');

        return {
            title: titleInput ? titleInput.value : '',
            project: projectSelect ? projectSelect.value : 'default',
            priority: prioritySelect ? prioritySelect.value : 'normal',
            assignee: assigneeSelect ? assigneeSelect.value : 'me'
        };
    }
};
