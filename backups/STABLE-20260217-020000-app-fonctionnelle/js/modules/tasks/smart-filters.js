/**
 * SMART FILTERS - ProductiveApp v4.0
 * Filtres avances et vues sauvegardees pour les taches
 */
const SmartFilters = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_smart_filters';
    var activeFilter = null;
    var savedViews = [];

    var presets = [
        { id: 'overdue', label: 'En retard', icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', color: '#ef4444', fn: function(t) { return isOverdue(t) && t.status !== 'done'; } },
        { id: 'today', label: 'Aujourd\'hui', icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>', color: '#f97316', fn: function(t) { return isDueToday(t) && t.status !== 'done'; } },
        { id: 'thisweek', label: 'Cette semaine', icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', color: '#eab308', fn: function(t) { return isDueThisWeek(t) && t.status !== 'done'; } },
        { id: 'mytasks', label: 'Mes taches', icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', color: '#3b82f6', fn: function(t) { var me = typeof AppState !== 'undefined' ? AppState.currentUser?.id : null; return t.assigned_to === me || t.assignedTo === me; } },
        { id: 'urgent', label: 'Urgentes', icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', color: '#dc2626', fn: function(t) { return (t.priority === 'urgent' || t.priority === 1) && t.status !== 'done'; } },
        { id: 'noduedate', label: 'Sans echeance', icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>', color: '#6b7280', fn: function(t) { return !(t.due_date || t.dueDate) && t.status !== 'done'; } }
    ];

    function init() {
        loadSavedViews();
    }

    function renderBar() {
        var html = '<div class="smart-filters-bar">';
        html += '<div class="smart-filters-scroll">';

        // Bouton "Tous"
        html += '<button class="sf-chip' + (!activeFilter ? ' active' : '') + '" onclick="SmartFilters.clear()">' +
            'Tous' +
        '</button>';

        // Presets
        presets.forEach(function(p) {
            var count = getFilterCount(p.fn);
            html += '<button class="sf-chip' + (activeFilter === p.id ? ' active' : '') + '" style="--sf-color:' + p.color + '" onclick="SmartFilters.apply(\'' + p.id + '\')">' +
                p.icon + ' ' + p.label +
                (count > 0 ? ' <span class="sf-count">' + count + '</span>' : '') +
            '</button>';
        });

        html += '</div></div>';
        return html;
    }

    function apply(filterId) {
        var preset = presets.find(function(p) { return p.id === filterId; });
        if (!preset) return;
        activeFilter = filterId;
        filterTasks(preset.fn);
        rerenderBar();
    }

    function clear() {
        activeFilter = null;
        if (typeof Tasks !== 'undefined' && Tasks.render) Tasks.render();
        rerenderBar();
    }

    function filterTasks(fn) {
        var tasks = typeof AppState !== 'undefined' ? (AppState.tasks || []) : [];
        var filtered = tasks.filter(fn);
        // Re-render tasks with filtered list
        renderFilteredTasks(filtered);
    }

    function renderFilteredTasks(filteredTasks) {
        var todoList = document.getElementById('todo-list');
        var inprogressList = document.getElementById('inprogress-list');
        var doneList = document.getElementById('done-list');
        if (!todoList || !inprogressList || !doneList) return;

        var todo = [], inprogress = [], done = [];
        filteredTasks.forEach(function(t) {
            if (t.status === 'done') done.push(t);
            else if (t.status === 'in_progress' || t.status === 'inprogress') inprogress.push(t);
            else todo.push(t);
        });

        if (typeof Tasks !== 'undefined' && Tasks.renderTaskItem) {
            todoList.innerHTML = todo.map(function(t) { return Tasks.renderTaskItem(t); }).join('');
            inprogressList.innerHTML = inprogress.map(function(t) { return Tasks.renderTaskItem(t); }).join('');
            doneList.innerHTML = done.map(function(t) { return Tasks.renderTaskItem(t); }).join('');
        }

        // Update counters
        var tc = document.getElementById('todo-count');
        var ic = document.getElementById('inprogress-count');
        var dc = document.getElementById('done-count');
        if (tc) tc.textContent = todo.length;
        if (ic) ic.textContent = inprogress.length;
        if (dc) dc.textContent = done.length;
    }

    function rerenderBar() {
        var existing = document.querySelector('.smart-filters-bar');
        if (existing) {
            existing.outerHTML = renderBar();
        }
    }

    function getFilterCount(fn) {
        var tasks = typeof AppState !== 'undefined' ? (AppState.tasks || []) : [];
        return tasks.filter(fn).length;
    }

    function isOverdue(t) {
        var due = t.due_date || t.dueDate;
        if (!due) return false;
        return new Date(due) < new Date(new Date().toDateString());
    }

    function isDueToday(t) {
        var due = t.due_date || t.dueDate;
        if (!due) return false;
        var d = new Date(due);
        var today = new Date();
        return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    }

    function isDueThisWeek(t) {
        var due = t.due_date || t.dueDate;
        if (!due) return false;
        var d = new Date(due);
        var now = new Date();
        var endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        return d >= now && d <= endOfWeek;
    }

    function loadSavedViews() {
        try {
            savedViews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) { savedViews = []; }
    }

    return {
        init: init,
        renderBar: renderBar,
        apply: apply,
        clear: clear
    };
})();

if (typeof window !== 'undefined') window.SmartFilters = SmartFilters;
