/**
 * BULK ACTIONS - ProductiveApp v4.0
 * Selection multiple et actions en lot sur les taches
 */
const BulkActions = (function() {
    'use strict';

    var selectedIds = new Set();
    var isActive = false;

    function init() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isActive) clear();
        });
    }

    function toggle(taskId) {
        if (selectedIds.has(taskId)) {
            selectedIds.delete(taskId);
        } else {
            selectedIds.add(taskId);
        }
        isActive = selectedIds.size > 0;
        updateUI();
    }

    function selectAll() {
        if (typeof AppState === 'undefined' || !AppState.tasks) return;
        AppState.tasks.forEach(function(t) { selectedIds.add(t.id); });
        isActive = true;
        updateUI();
    }

    function clear() {
        selectedIds.clear();
        isActive = false;
        updateUI();
    }

    function isSelected(taskId) {
        return selectedIds.has(taskId);
    }

    function getCount() {
        return selectedIds.size;
    }

    function renderCheckbox(taskId) {
        var checked = selectedIds.has(taskId) ? ' checked' : '';
        return '<input type="checkbox" class="bulk-checkbox"' + checked + ' onclick="event.stopPropagation();BulkActions.toggle(\'' + taskId + '\')" title="Sélectionner">';
    }

    function renderBar() {
        if (!isActive) return '';
        var count = selectedIds.size;
        return '<div class="bulk-bar" id="bulk-actions-bar">' +
            '<div class="bulk-bar-left">' +
                '<button class="bulk-bar-close" onclick="BulkActions.clear()" title="Annuler">&times;</button>' +
                '<span class="bulk-bar-count">' + count + ' sélectionné' + (count > 1 ? 's' : '') + '</span>' +
                '<button class="bulk-bar-select-all" onclick="BulkActions.selectAll()">Tout sélectionner</button>' +
            '</div>' +
            '<div class="bulk-bar-actions">' +
                '<div class="bulk-action-group">' +
                    '<label class="bulk-action-label">Statut</label>' +
                    '<select onchange="BulkActions.changeStatus(this.value);this.selectedIndex=0" class="bulk-action-select">' +
                        '<option value="">Changer...</option>' +
                        '<option value="todo">À faire</option>' +
                        '<option value="in_progress">En cours</option>' +
                        '<option value="done">Terminé</option>' +
                    '</select>' +
                '</div>' +
                '<div class="bulk-action-group">' +
                    '<label class="bulk-action-label">Priorité</label>' +
                    '<select onchange="BulkActions.changePriority(this.value);this.selectedIndex=0" class="bulk-action-select">' +
                        '<option value="">Changer...</option>' +
                        '<option value="1">Urgent</option>' +
                        '<option value="2">Haute</option>' +
                        '<option value="3">Moyenne</option>' +
                        '<option value="4">Basse</option>' +
                    '</select>' +
                '</div>' +
                '<button class="bulk-action-btn bulk-action-delete" onclick="BulkActions.deleteSelected()" title="Supprimer">' +
                    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
                    ' Supprimer' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    function updateUI() {
        // Toggle checked state on checkboxes
        document.querySelectorAll('.bulk-checkbox').forEach(function(cb) {
            var taskEl = cb.closest('[data-task-id]');
            if (taskEl) {
                var id = taskEl.getAttribute('data-task-id');
                cb.checked = selectedIds.has(id);
            }
        });

        // Show/hide bulk bar
        var existing = document.getElementById('bulk-actions-bar');
        if (isActive) {
            if (existing) {
                existing.outerHTML = renderBar();
            } else {
                var div = document.createElement('div');
                div.innerHTML = renderBar();
                document.body.appendChild(div.firstChild);
            }
        } else {
            if (existing) existing.remove();
        }
    }

    async function changeStatus(status) {
        if (!status || !selectedIds.size) return;
        var ids = Array.from(selectedIds);
        var count = 0;
        for (var i = 0; i < ids.length; i++) {
            try {
                if (typeof ApiTasks !== 'undefined' && ApiTasks.update) {
                    await ApiTasks.update(ids[i], { status: status });
                    count++;
                    // Mettre a jour l'etat local
                    if (typeof AppState !== 'undefined' && AppState.tasks) {
                        var task = AppState.tasks.find(function(t) { return t.id === ids[i]; });
                        if (task) task.status = status;
                    }
                }
            } catch (e) { console.error('Bulk status error:', e); }
        }
        clear();
        if (typeof Utils !== 'undefined' && Utils.notify) {
            Utils.notify(count + ' tâche' + (count > 1 ? 's' : '') + ' mise' + (count > 1 ? 's' : '') + ' à jour', 'success');
        }
        refreshTasks();
    }

    async function changePriority(priority) {
        if (!priority || !selectedIds.size) return;
        var ids = Array.from(selectedIds);
        var count = 0;
        for (var i = 0; i < ids.length; i++) {
            try {
                if (typeof ApiTasks !== 'undefined' && ApiTasks.update) {
                    await ApiTasks.update(ids[i], { priority: parseInt(priority) });
                    count++;
                }
            } catch (e) { console.error('Bulk priority error:', e); }
        }
        clear();
        if (typeof Utils !== 'undefined' && Utils.notify) {
            Utils.notify(count + ' priorité' + (count > 1 ? 's' : '') + ' modifiée' + (count > 1 ? 's' : ''), 'success');
        }
        refreshTasks();
    }

    async function deleteSelected() {
        if (!selectedIds.size) return;
        var ids = Array.from(selectedIds);
        var count = ids.length;

        // Undo toast si disponible
        if (typeof UndoToast !== 'undefined') {
            var backup = [];
            if (typeof AppState !== 'undefined' && AppState.tasks) {
                backup = AppState.tasks.filter(function(t) { return selectedIds.has(t.id); });
            }

            UndoToast.show(count + ' tâche' + (count > 1 ? 's' : '') + ' supprimée' + (count > 1 ? 's' : ''), function() {
                // Undo : restaurer
                if (typeof AppState !== 'undefined' && AppState.tasks) {
                    AppState.tasks = AppState.tasks.concat(backup);
                }
                refreshTasks();
            });
        }

        // Supprimer effectivement
        for (var i = 0; i < ids.length; i++) {
            try {
                if (typeof ApiTasks !== 'undefined' && ApiTasks.delete) {
                    await ApiTasks.delete(ids[i]);
                }
                if (typeof AppState !== 'undefined' && AppState.tasks) {
                    AppState.tasks = AppState.tasks.filter(function(t) { return t.id !== ids[i]; });
                }
            } catch (e) { console.error('Bulk delete error:', e); }
        }
        clear();
        refreshTasks();
    }

    function refreshTasks() {
        if (typeof Tasks !== 'undefined' && Tasks.render) {
            Tasks.render();
        }
    }

    return {
        init: init,
        toggle: toggle,
        selectAll: selectAll,
        clear: clear,
        isSelected: isSelected,
        getCount: getCount,
        renderCheckbox: renderCheckbox,
        renderBar: renderBar,
        changeStatus: changeStatus,
        changePriority: changePriority,
        deleteSelected: deleteSelected
    };
})();

if (typeof window !== 'undefined') window.BulkActions = BulkActions;
