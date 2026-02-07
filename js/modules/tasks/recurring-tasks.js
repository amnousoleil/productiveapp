/**
 * RECURRING TASKS - ProductiveApp v4.0
 * Taches recurrentes auto-recreees a la completion
 */
const RecurringTasks = (function() {
    'use strict';

    var RECURRENCE_TYPES = {
        daily: { label: 'Quotidien', days: 1 },
        weekly: { label: 'Hebdomadaire', days: 7 },
        biweekly: { label: 'Bi-mensuel', days: 14 },
        monthly: { label: 'Mensuel', days: 30 }
    };

    function init() {
        // Hook sur les changements de statut
        document.addEventListener('taskStatusChanged', function(e) {
            if (e.detail && e.detail.status === 'done') {
                handleTaskCompleted(e.detail.taskId);
            }
        });
    }

    function renderRecurrenceSelect(task) {
        var current = getRecurrence(task);
        var html = '<div class="recurrence-select">' +
            '<label class="recurrence-label">' +
                '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>' +
                ' Recurrence' +
            '</label>' +
            '<select onchange="RecurringTasks.setRecurrence(\'' + task.id + '\', this.value)">' +
                '<option value="">Aucune</option>';
        Object.keys(RECURRENCE_TYPES).forEach(function(key) {
            html += '<option value="' + key + '"' + (current === key ? ' selected' : '') + '>' + RECURRENCE_TYPES[key].label + '</option>';
        });
        html += '</select></div>';
        return html;
    }

    function renderBadge(task) {
        var rec = getRecurrence(task);
        if (!rec) return '';
        var type = RECURRENCE_TYPES[rec];
        return '<span class="recurrence-badge" title="Recurrence : ' + (type ? type.label : rec) + '">' +
            '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15A9 9 0 1 1 21 6"/></svg>' +
        '</span>';
    }

    function getRecurrence(task) {
        if (!task) return null;
        if (task.metadata && task.metadata.recurrence) return task.metadata.recurrence;
        return null;
    }

    function setRecurrence(taskId, type) {
        var task = findTask(taskId);
        if (!task) return;
        if (!task.metadata) task.metadata = {};
        task.metadata.recurrence = type || null;
        if (typeof ApiTasks !== 'undefined' && ApiTasks.update) {
            ApiTasks.update(taskId, { metadata: task.metadata }).catch(function(e) {
                console.error('Recurrence save error:', e);
            });
        }
    }

    async function handleTaskCompleted(taskId) {
        var task = findTask(taskId);
        if (!task) return;
        var rec = getRecurrence(task);
        if (!rec || !RECURRENCE_TYPES[rec]) return;

        // Calculer la prochaine echeance
        var daysOffset = RECURRENCE_TYPES[rec].days;
        var baseDue = task.due_date || task.dueDate || new Date().toISOString();
        var nextDue = new Date(baseDue);
        nextDue.setDate(nextDue.getDate() + daysOffset);

        // Creer la nouvelle tache
        try {
            if (typeof ApiTasks !== 'undefined' && ApiTasks.create) {
                await ApiTasks.create({
                    title: task.title || task.text,
                    description: task.description || '',
                    priority: task.priority,
                    project_id: task.project_id,
                    assigned_to: task.assigned_to,
                    due_date: nextDue.toISOString(),
                    status: 'todo',
                    metadata: { recurrence: rec, subtasks: [] }
                });
                console.log('Recurrence: created next task for', nextDue.toLocaleDateString());
            }
        } catch (e) {
            console.error('Recurring task creation error:', e);
        }
    }

    function findTask(taskId) {
        if (typeof AppState === 'undefined' || !AppState.tasks) return null;
        return AppState.tasks.find(function(t) { return t.id === taskId; });
    }

    return {
        init: init,
        renderRecurrenceSelect: renderRecurrenceSelect,
        renderBadge: renderBadge,
        setRecurrence: setRecurrence,
        getRecurrence: getRecurrence
    };
})();

if (typeof window !== 'undefined') window.RecurringTasks = RecurringTasks;
