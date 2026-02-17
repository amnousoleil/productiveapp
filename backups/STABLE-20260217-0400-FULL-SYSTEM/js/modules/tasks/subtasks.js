/**
 * SUBTASKS - ProductiveApp v4.0
 * Sous-taches (checklist) pour chaque tache
 */
const Subtasks = (function() {
    'use strict';

    function getSubtasks(task) {
        if (!task) return [];
        if (task.metadata && task.metadata.subtasks) return task.metadata.subtasks;
        if (task.subtasks) return task.subtasks;
        return [];
    }

    function renderBadge(task) {
        var subs = getSubtasks(task);
        if (!subs.length) return '';
        var done = subs.filter(function(s) { return s.done; }).length;
        var cls = done === subs.length ? 'subtask-badge-complete' : '';
        return '<span class="subtask-badge ' + cls + '" title="Sous-taches: ' + done + '/' + subs.length + '">' +
            '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/></svg> ' +
            done + '/' + subs.length +
        '</span>';
    }

    function renderList(task) {
        var subs = getSubtasks(task);
        var taskId = task.id;
        var html = '<div class="subtasks-section">';
        html += '<div class="subtasks-header">' +
            '<span class="subtasks-title">Sous-taches (' + subs.length + ')</span>' +
            '<button class="subtasks-add-btn" onclick="Subtasks.addSubtask(\'' + taskId + '\')">+ Ajouter</button>' +
        '</div>';
        html += '<div class="subtasks-list">';
        subs.forEach(function(sub, idx) {
            html += '<div class="subtask-item' + (sub.done ? ' subtask-done' : '') + '">' +
                '<input type="checkbox" ' + (sub.done ? 'checked' : '') + ' onchange="Subtasks.toggleSubtask(\'' + taskId + '\',' + idx + ')" class="subtask-check">' +
                '<span class="subtask-text">' + escHtml(sub.text) + '</span>' +
                '<button class="subtask-delete" onclick="Subtasks.removeSubtask(\'' + taskId + '\',' + idx + ')">&times;</button>' +
            '</div>';
        });
        html += '</div>';
        // Input ajout
        html += '<div class="subtasks-input-row">' +
            '<input type="text" id="subtask-input-' + taskId + '" class="subtask-input" placeholder="Nouvelle sous-tache..." onkeydown="if(event.key===\'Enter\')Subtasks.addSubtask(\'' + taskId + '\')">' +
        '</div>';
        html += '</div>';
        return html;
    }

    function addSubtask(taskId) {
        var input = document.getElementById('subtask-input-' + taskId);
        var text = input ? input.value.trim() : '';
        if (!text) {
            text = prompt('Sous-tache :');
            if (!text) return;
        }
        var task = findTask(taskId);
        if (!task) return;
        if (!task.metadata) task.metadata = {};
        if (!task.metadata.subtasks) task.metadata.subtasks = [];
        task.metadata.subtasks.push({ text: text, done: false });
        saveTaskMetadata(task);
        if (input) { input.value = ''; }
        rerenderSubtasks(taskId);
    }

    function toggleSubtask(taskId, idx) {
        var task = findTask(taskId);
        if (!task || !task.metadata || !task.metadata.subtasks) return;
        task.metadata.subtasks[idx].done = !task.metadata.subtasks[idx].done;
        saveTaskMetadata(task);
        rerenderSubtasks(taskId);
    }

    function removeSubtask(taskId, idx) {
        var task = findTask(taskId);
        if (!task || !task.metadata || !task.metadata.subtasks) return;
        task.metadata.subtasks.splice(idx, 1);
        saveTaskMetadata(task);
        rerenderSubtasks(taskId);
    }

    function findTask(taskId) {
        if (typeof AppState === 'undefined' || !AppState.tasks) return null;
        return AppState.tasks.find(function(t) { return t.id === taskId; });
    }

    function saveTaskMetadata(task) {
        if (typeof ApiTasks !== 'undefined' && ApiTasks.update) {
            ApiTasks.update(task.id, { metadata: task.metadata }).catch(function(e) {
                console.error('Subtask save error:', e);
            });
        }
    }

    function rerenderSubtasks(taskId) {
        var container = document.querySelector('.subtasks-section[data-task="' + taskId + '"]');
        if (container) {
            var task = findTask(taskId);
            if (task) container.outerHTML = renderList(task);
        }
    }

    function escHtml(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    return {
        renderBadge: renderBadge,
        renderList: renderList,
        addSubtask: addSubtask,
        toggleSubtask: toggleSubtask,
        removeSubtask: removeSubtask,
        getSubtasks: getSubtasks
    };
})();

if (typeof window !== 'undefined') window.Subtasks = Subtasks;
