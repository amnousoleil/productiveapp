/**
 * ================================================
 * CALENDAR VIEW - ProductiveApp Premium
 * Vue calendrier mois/semaine avec tâches
 * ================================================
 */
var CalendarView = (function() {
    'use strict';

    var DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    var MONTHS = ['Janvier','F\u00e9vrier','Mars','Avril','Mai','Juin','Juillet','Ao\u00fbt','Septembre','Octobre','Novembre','D\u00e9cembre'];

    var currentDate = new Date();
    var viewMode = 'month'; // month | week | day
    var containerEl = null;
    var initialized = false;

    function init() {
        if (initialized) return;
        initialized = true;
    }

    function render(container) {
        containerEl = container || document.getElementById('view-calendar');
        if (!containerEl) return;
        containerEl.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'calendar-container';
        wrap.innerHTML = buildToolbar();

        if (viewMode === 'month') wrap.innerHTML += buildMonthGrid();
        else if (viewMode === 'week') wrap.innerHTML += buildWeekGrid();
        else wrap.innerHTML += buildDayView();

        containerEl.appendChild(wrap);
        bindEvents(wrap);
    }

    function buildToolbar() {
        var title = viewMode === 'day'
            ? currentDate.getDate() + ' ' + MONTHS[currentDate.getMonth()] + ' ' + currentDate.getFullYear()
            : MONTHS[currentDate.getMonth()] + ' ' + currentDate.getFullYear();
        return '<div class="cal-toolbar">' +
            '<div class="cal-toolbar-left">' +
                '<button class="cal-nav-btn" data-action="prev"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>' +
                '<span class="cal-title">' + title + '</span>' +
                '<button class="cal-nav-btn" data-action="next"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>' +
                '<button class="cal-today-btn" data-action="today">Aujourd\'hui</button>' +
            '</div>' +
            '<div class="cal-toolbar-right">' +
                '<div class="cal-view-toggle">' +
                    '<button class="cal-view-btn' + (viewMode === 'month' ? ' active' : '') + '" data-view="month">Mois</button>' +
                    '<button class="cal-view-btn' + (viewMode === 'week' ? ' active' : '') + '" data-view="week">Semaine</button>' +
                    '<button class="cal-view-btn' + (viewMode === 'day' ? ' active' : '') + '" data-view="day">Jour</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function buildMonthGrid() {
        var year = currentDate.getFullYear(), month = currentDate.getMonth();
        var firstDay = new Date(year, month, 1);
        var startDay = (firstDay.getDay() + 6) % 7; // Monday = 0
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var today = new Date();
        var tasks = getTasks();

        var html = '<div class="cal-month-grid">';
        DAYS.forEach(function(d) { html += '<div class="cal-day-header">' + d + '</div>'; });

        var prevMonthDays = new Date(year, month, 0).getDate();
        var totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

        for (var i = 0; i < totalCells; i++) {
            var dayNum, isOtherMonth = false, cellDate;
            if (i < startDay) {
                dayNum = prevMonthDays - startDay + i + 1;
                isOtherMonth = true;
                cellDate = new Date(year, month - 1, dayNum);
            } else if (i >= startDay + daysInMonth) {
                dayNum = i - startDay - daysInMonth + 1;
                isOtherMonth = true;
                cellDate = new Date(year, month + 1, dayNum);
            } else {
                dayNum = i - startDay + 1;
                cellDate = new Date(year, month, dayNum);
            }

            var isToday = !isOtherMonth && cellDate.toDateString() === today.toDateString();
            var dayTasks = getTasksForDate(tasks, cellDate);

            html += '<div class="cal-day-cell' + (isOtherMonth ? ' other-month' : '') + (isToday ? ' today' : '') + '" data-date="' + formatDateISO(cellDate) + '">';
            html += '<div class="cal-day-num">' + dayNum + '</div>';
            html += '<div class="cal-day-events">';

            var maxShow = 3;
            for (var j = 0; j < Math.min(dayTasks.length, maxShow); j++) {
                var t = dayTasks[j];
                var pc = getPriorityClass(t);
                html += '<div class="cal-event ' + pc + '" title="' + escapeAttr(t.title || '') + '">' + escapeHtml(t.title || 'Sans titre') + '</div>';
            }
            if (dayTasks.length > maxShow) {
                html += '<div class="cal-more-events">+' + (dayTasks.length - maxShow) + ' autres</div>';
            }

            html += '</div></div>';
        }
        html += '</div>';
        return html;
    }

    function buildWeekGrid() {
        var start = getWeekStart(currentDate);
        var today = new Date();
        var tasks = getTasks();
        var hours = [];
        for (var h = 6; h <= 22; h++) hours.push(h);

        var html = '<div class="cal-week-grid">';
        // Header
        html += '<div class="cal-week-header-cell"></div>';
        for (var d = 0; d < 7; d++) {
            var day = new Date(start);
            day.setDate(day.getDate() + d);
            var isToday = day.toDateString() === today.toDateString();
            html += '<div class="cal-week-header-cell' + (isToday ? ' today-col' : '') + '">' + DAYS[d] + ' ' + day.getDate() + '</div>';
        }
        // Time slots
        hours.forEach(function(hr) {
            html += '<div class="cal-week-time">' + String(hr).padStart(2, '0') + ':00</div>';
            for (var d = 0; d < 7; d++) {
                var day = new Date(start);
                day.setDate(day.getDate() + d);
                html += '<div class="cal-week-cell" data-date="' + formatDateISO(day) + '" data-hour="' + hr + '"></div>';
            }
        });
        html += '</div>';
        return html;
    }

    function buildDayView() {
        var today = new Date();
        var isToday = currentDate.toDateString() === today.toDateString();
        var tasks = getTasksForDate(getTasks(), currentDate);

        var html = '<div class="cal-day-view">';
        html += '<div class="cal-day-view-header">' + (isToday ? 'Aujourd\'hui' : DAYS[(currentDate.getDay() + 6) % 7]) + ' - ' + tasks.length + ' t\u00e2che' + (tasks.length > 1 ? 's' : '') + '</div>';
        html += '<div class="cal-day-timeline">';
        for (var h = 6; h <= 22; h++) {
            html += '<div class="cal-day-hour">';
            html += '<div class="cal-day-hour-label">' + String(h).padStart(2, '0') + ':00</div>';
            html += '<div class="cal-day-hour-content">';
            // Show tasks without specific time in the morning slot
            if (h === 8) {
                tasks.forEach(function(t) {
                    var pc = getPriorityClass(t);
                    html += '<div class="cal-event ' + pc + '" style="margin-bottom:2px">' + escapeHtml(t.title || 'Sans titre') + '</div>';
                });
            }
            html += '</div></div>';
        }
        html += '</div></div>';
        return html;
    }

    function bindEvents(wrap) {
        wrap.querySelectorAll('[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var action = btn.getAttribute('data-action');
                if (action === 'prev') navigate(-1);
                else if (action === 'next') navigate(1);
                else if (action === 'today') { currentDate = new Date(); render(); }
            });
        });
        wrap.querySelectorAll('[data-view]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                viewMode = btn.getAttribute('data-view');
                render();
            });
        });
        wrap.querySelectorAll('.cal-day-cell').forEach(function(cell) {
            cell.addEventListener('dblclick', function() {
                var dateStr = cell.getAttribute('data-date');
                if (dateStr) {
                    viewMode = 'day';
                    currentDate = new Date(dateStr);
                    render();
                }
            });
        });
    }

    function navigate(dir) {
        if (viewMode === 'month') currentDate.setMonth(currentDate.getMonth() + dir);
        else if (viewMode === 'week') currentDate.setDate(currentDate.getDate() + (dir * 7));
        else currentDate.setDate(currentDate.getDate() + dir);
        render();
    }

    function getWeekStart(date) {
        var d = new Date(date);
        var day = d.getDay();
        var diff = (day + 6) % 7;
        d.setDate(d.getDate() - diff);
        return d;
    }

    function getTasks() {
        if (typeof AppState !== 'undefined' && AppState.tasks) return AppState.tasks;
        return [];
    }

    function getTasksForDate(tasks, date) {
        var dateStr = formatDateISO(date);
        return tasks.filter(function(t) {
            var due = t.due_date || t.dueDate || t.deadline;
            if (!due) return false;
            return due.slice(0, 10) === dateStr;
        });
    }

    function getPriorityClass(task) {
        var s = (task.status || '').toLowerCase();
        if (s === 'done' || s === 'completed') return 'priority-done';
        var p = task.priority;
        if (typeof p === 'string') p = p.toLowerCase();
        if (p === 'urgent' || p === 'high' || p === 1) return 'priority-high';
        if (p === 'low' || p === 'zen' || p === 3) return 'priority-low';
        return 'priority-medium';
    }

    function formatDateISO(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    function escapeHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

    return { init: init, render: render };
})();
if (typeof window !== 'undefined') window.CalendarView = CalendarView;
