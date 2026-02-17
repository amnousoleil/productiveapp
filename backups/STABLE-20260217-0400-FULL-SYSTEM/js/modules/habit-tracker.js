/**
 * ================================================
 * HABIT TRACKER + DAILY REVIEW - ProductiveApp
 * Suivi d'habitudes + revue quotidienne guidée
 * ================================================
 */

/* ================================================
   HABIT TRACKER
   ================================================ */
var HabitTracker = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_habits';
    var habits = [];
    var initialized = false;
    var EMOJIS = ['\uD83D\uDCAA','\uD83E\uDDD8','\uD83D\uDCDA','\uD83C\uDFC3','\uD83D\uDCA7','\uD83C\uDF4E','\u2615','\uD83D\uDE34','\u270D\uFE0F','\uD83C\uDFAF','\uD83E\uDDE0','\u2764\uFE0F'];

    function init() {
        if (initialized) return;
        initialized = true;
        loadHabits();
    }

    function render(container) {
        if (!container) container = document.getElementById('view-habits') || document.getElementById('view-journal');
        if (!container) return;

        var html = '<div class="habit-tracker">';
        html += '<div class="habit-header"><span class="habit-title">\uD83C\uDFAF Suivi des habitudes</span><button class="habit-add-btn" id="habit-add-btn">+ Nouvelle habitude</button></div>';
        html += '<div class="habit-grid" id="habit-grid">';

        if (!habits.length) {
            html += '<div style="text-align:center;padding:40px;color:var(--text-secondary)"><div style="font-size:2rem;margin-bottom:8px">\uD83C\uDF31</div>Aucune habitude. Commencez par en cr\u00e9er une !</div>';
        } else {
            var today = new Date();
            var weekDates = getLast7Days(today);
            habits.forEach(function(habit) {
                html += renderHabitRow(habit, weekDates, today);
            });
        }
        html += '</div></div>';
        container.innerHTML = html;
        bindEvents(container);
    }

    function renderHabitRow(habit, weekDates, today) {
        var streak = calcStreak(habit);
        var weekChecked = weekDates.filter(function(d) { return habit.completedDates && habit.completedDates.indexOf(fmtDate(d)) !== -1; }).length;
        var pct = Math.round((weekChecked / 7) * 100);
        var todayStr = fmtDate(today);

        var html = '<div class="habit-row" data-habit-id="' + habit.id + '">';
        html += '<span class="habit-icon">' + (habit.icon || '\uD83C\uDFAF') + '</span>';
        html += '<div class="habit-info"><div class="habit-name">' + escapeHtml(habit.name) + '</div>';
        html += '<div class="habit-streak">' + (streak > 0 ? '\uD83D\uDD25 <strong>' + streak + 'j</strong> de suite' : 'Pas encore de s\u00e9rie') + '</div></div>';

        html += '<div class="habit-days">';
        weekDates.forEach(function(d) {
            var ds = fmtDate(d);
            var isChecked = habit.completedDates && habit.completedDates.indexOf(ds) !== -1;
            var isToday = ds === todayStr;
            var dayLabel = ['D','L','M','M','J','V','S'][d.getDay()];
            html += '<button class="habit-day' + (isChecked ? ' checked' : '') + (isToday ? ' today' : '') + '" data-date="' + ds + '" data-habit="' + habit.id + '" title="' + ds + '">' + (isChecked ? '\u2713' : dayLabel) + '</button>';
        });
        html += '</div>';

        html += '<div class="habit-progress-bar"><div class="habit-progress-fill" style="width:' + pct + '%"></div></div>';
        html += '<button class="habit-delete" data-habit-delete="' + habit.id + '" title="Supprimer">\u2715</button>';
        html += '</div>';
        return html;
    }

    function bindEvents(container) {
        container.querySelector('#habit-add-btn')?.addEventListener('click', showAddModal);
        container.querySelectorAll('.habit-day').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var hid = btn.getAttribute('data-habit');
                var date = btn.getAttribute('data-date');
                toggleDay(hid, date);
                render(container);
            });
        });
        container.querySelectorAll('[data-habit-delete]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var hid = btn.getAttribute('data-habit-delete');
                habits = habits.filter(function(h) { return h.id !== hid; });
                saveHabits();
                render(container);
            });
        });
    }

    function showAddModal() {
        var overlay = document.createElement('div');
        overlay.className = 'habit-modal-overlay active';
        var selectedEmoji = EMOJIS[0];
        overlay.innerHTML = '<div class="habit-modal"><h3>Nouvelle habitude</h3>' +
            '<div class="habit-emoji-grid">' + EMOJIS.map(function(e, i) { return '<button class="habit-emoji-btn' + (i === 0 ? ' selected' : '') + '" data-emoji="' + e + '">' + e + '</button>'; }).join('') + '</div>' +
            '<input type="text" id="habit-new-name" placeholder="Nom de l\'habitude..." autofocus>' +
            '<select id="habit-new-freq"><option value="daily">Quotidienne</option><option value="weekdays">Jours ouvrables</option><option value="3x">3x par semaine</option></select>' +
            '<div class="habit-modal-actions"><button class="habit-modal-cancel" id="habit-cancel">Annuler</button><button class="habit-modal-save" id="habit-save">Cr\u00e9er</button></div></div>';
        document.body.appendChild(overlay);

        overlay.querySelectorAll('.habit-emoji-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                overlay.querySelectorAll('.habit-emoji-btn').forEach(function(b) { b.classList.remove('selected'); });
                btn.classList.add('selected');
                selectedEmoji = btn.getAttribute('data-emoji');
            });
        });
        overlay.querySelector('#habit-cancel').addEventListener('click', function() { overlay.remove(); });
        overlay.querySelector('#habit-save').addEventListener('click', function() {
            var name = overlay.querySelector('#habit-new-name').value.trim();
            if (!name) return;
            var freq = overlay.querySelector('#habit-new-freq').value;
            habits.push({ id: 'hab_' + Date.now().toString(36), name: name, icon: selectedEmoji, frequency: freq, completedDates: [], createdAt: Date.now() });
            saveHabits();
            overlay.remove();
            render();
        });
        overlay.querySelector('#habit-new-name').addEventListener('keydown', function(e) { if (e.key === 'Enter') overlay.querySelector('#habit-save').click(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    function toggleDay(habitId, dateStr) {
        var habit = habits.find(function(h) { return h.id === habitId; });
        if (!habit) return;
        if (!habit.completedDates) habit.completedDates = [];
        var idx = habit.completedDates.indexOf(dateStr);
        if (idx === -1) habit.completedDates.push(dateStr);
        else habit.completedDates.splice(idx, 1);
        saveHabits();
    }

    function calcStreak(habit) {
        if (!habit.completedDates || !habit.completedDates.length) return 0;
        var sorted = habit.completedDates.slice().sort().reverse();
        var streak = 0;
        var check = new Date();
        // If today not checked, start from yesterday
        if (sorted[0] !== fmtDate(check)) check.setDate(check.getDate() - 1);
        for (var i = 0; i < 365; i++) {
            if (sorted.indexOf(fmtDate(check)) !== -1) { streak++; check.setDate(check.getDate() - 1); }
            else break;
        }
        return streak;
    }

    function getLast7Days(today) {
        var days = [];
        for (var i = 6; i >= 0; i--) { var d = new Date(today); d.setDate(d.getDate() - i); days.push(d); }
        return days;
    }

    function fmtDate(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    function loadHabits() { try { var r = localStorage.getItem(STORAGE_KEY); if (r) habits = JSON.parse(r) || []; } catch (e) {} }
    function saveHabits() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); } catch (e) {} }
    function escapeHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    return { init: init, render: render, getHabits: function() { return habits; } };
})();
if (typeof window !== 'undefined') window.HabitTracker = HabitTracker;


/* ================================================
   DAILY REVIEW WIZARD
   ================================================ */
var DailyReview = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_daily_reviews';
    var currentStep = 0;
    var reviewData = {};
    var overlayEl = null;
    var initialized = false;
    var STEPS = ['R\u00e9cap','Accomplissements','Demain','R\u00e9flexion','Fin'];

    function init() {
        if (initialized) return;
        initialized = true;
    }

    function open() {
        currentStep = 0;
        reviewData = { date: new Date().toISOString().slice(0, 10), completedTasks: [], wins: '', tomorrowPlan: '', mood: 0, gratitude: '', createdAt: Date.now() };
        createOverlay();
        renderStep();
    }

    function close() {
        if (overlayEl) overlayEl.remove();
        overlayEl = null;
    }

    function createOverlay() {
        if (overlayEl) overlayEl.remove();
        overlayEl = document.createElement('div');
        overlayEl.className = 'daily-review-overlay active';
        overlayEl.innerHTML = '<div class="daily-review-card">' +
            '<div class="daily-review-header"><h2>\uD83C\uDF05 Revue de la journ\u00e9e</h2><p>Prenez 2 minutes pour faire le bilan</p>' +
            '<div class="daily-review-progress" id="dr-progress"></div></div>' +
            '<div class="daily-review-body" id="dr-body"></div>' +
            '<div class="daily-review-footer"><button class="daily-review-prev" id="dr-prev">Pr\u00e9c\u00e9dent</button><div><button class="daily-review-skip" id="dr-skip">Passer</button><button class="daily-review-next" id="dr-next">Suivant</button></div></div></div>';
        document.body.appendChild(overlayEl);
        overlayEl.addEventListener('click', function(e) { if (e.target === overlayEl) close(); });
        overlayEl.querySelector('#dr-prev').addEventListener('click', function() { if (currentStep > 0) { currentStep--; renderStep(); } });
        overlayEl.querySelector('#dr-next').addEventListener('click', function() { saveCurrentStep(); if (currentStep < STEPS.length - 1) { currentStep++; renderStep(); } else { saveReview(); close(); } });
        overlayEl.querySelector('#dr-skip').addEventListener('click', function() { close(); });
    }

    function renderStep() {
        var body = overlayEl.querySelector('#dr-body');
        var progress = overlayEl.querySelector('#dr-progress');
        var nextBtn = overlayEl.querySelector('#dr-next');
        var prevBtn = overlayEl.querySelector('#dr-prev');

        // Progress dots
        progress.innerHTML = STEPS.map(function(_, i) { return '<div class="daily-review-step' + (i < currentStep ? ' done' : '') + (i === currentStep ? ' active' : '') + '"></div>'; }).join('');
        prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
        nextBtn.textContent = currentStep === STEPS.length - 1 ? 'Terminer' : 'Suivant';

        var tasks = getTodayTasks();
        var html = '<div class="daily-review-section">';

        if (currentStep === 0) {
            html += '<h3>\uD83D\uDCCB R\u00e9cap de la journ\u00e9e</h3><p>Cochez les t\u00e2ches que vous avez termin\u00e9es</p>';
            html += '<div class="daily-review-task-list">';
            if (tasks.length === 0) html += '<p style="color:var(--text-secondary)">Aucune t\u00e2che pour aujourd\'hui</p>';
            tasks.forEach(function(t) {
                var done = (t.status || '').toLowerCase() === 'done' || (t.status || '').toLowerCase() === 'completed';
                html += '<div class="daily-review-task' + (done ? ' completed' : '') + '"><div class="daily-review-task-check' + (done ? ' checked' : '') + '" data-task="' + t.id + '">' + (done ? '\u2713' : '') + '</div><span class="daily-review-task-title">' + escapeHtml(t.title || 'Sans titre') + '</span></div>';
            });
            html += '</div>';
        } else if (currentStep === 1) {
            html += '<h3>\uD83C\uDFC6 Vos accomplissements</h3><p>Qu\'avez-vous bien fait aujourd\'hui ?</p>';
            html += '<textarea class="daily-review-textarea" id="dr-wins" placeholder="Mes victoires du jour...">' + escapeHtml(reviewData.wins || '') + '</textarea>';
        } else if (currentStep === 2) {
            html += '<h3>\uD83D\uDE80 Plan pour demain</h3><p>Les 3 priorit\u00e9s cl\u00e9s pour demain</p>';
            html += '<textarea class="daily-review-textarea" id="dr-tomorrow" placeholder="1. ...\n2. ...\n3. ...">' + escapeHtml(reviewData.tomorrowPlan || '') + '</textarea>';
        } else if (currentStep === 3) {
            html += '<h3>\uD83D\uDE4F Gratitude & Humeur</h3><p>Comment vous sentez-vous ?</p>';
            html += '<div class="daily-review-rating" id="dr-mood">';
            ['\uD83D\uDE1E','\uD83D\uDE10','\uD83D\uDE42','\uD83D\uDE04','\uD83E\uDD29'].forEach(function(e, i) {
                html += '<button class="daily-review-star' + (reviewData.mood === i + 1 ? ' active' : '') + '" data-mood="' + (i + 1) + '">' + e + '</button>';
            });
            html += '</div>';
            html += '<textarea class="daily-review-textarea" id="dr-gratitude" placeholder="Je suis reconnaissant(e) pour..." style="margin-top:12px">' + escapeHtml(reviewData.gratitude || '') + '</textarea>';
        } else {
            var completed = tasks.filter(function(t) { var s = (t.status||'').toLowerCase(); return s === 'done' || s === 'completed'; }).length;
            html += '<div style="text-align:center;padding:20px">';
            html += '<div style="font-size:3rem;margin-bottom:12px">\u2728</div>';
            html += '<h3>Bravo !</h3>';
            html += '<p>' + completed + '/' + tasks.length + ' t\u00e2ches compl\u00e9t\u00e9es aujourd\'hui</p>';
            if (reviewData.mood >= 4) html += '<p style="color:var(--success)">\uD83C\uDF1F Journ\u00e9e \u00e9norme ! Continuez comme \u00e7a.</p>';
            html += '</div>';
        }
        html += '</div>';
        body.innerHTML = html;

        // Bind mood buttons
        body.querySelectorAll('[data-mood]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                reviewData.mood = parseInt(btn.getAttribute('data-mood'));
                body.querySelectorAll('.daily-review-star').forEach(function(b, i) { b.classList.toggle('active', i < reviewData.mood); });
            });
        });
    }

    function saveCurrentStep() {
        if (!overlayEl) return;
        var wins = overlayEl.querySelector('#dr-wins');
        var tomorrow = overlayEl.querySelector('#dr-tomorrow');
        var gratitude = overlayEl.querySelector('#dr-gratitude');
        if (wins) reviewData.wins = wins.value;
        if (tomorrow) reviewData.tomorrowPlan = tomorrow.value;
        if (gratitude) reviewData.gratitude = gratitude.value;
    }

    function saveReview() {
        try {
            var reviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            reviews.unshift(reviewData);
            if (reviews.length > 90) reviews = reviews.slice(0, 90);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
        } catch (e) {}
    }

    function getTodayTasks() {
        if (typeof AppState === 'undefined' || !AppState.tasks) return [];
        var today = new Date().toISOString().slice(0, 10);
        return AppState.tasks.filter(function(t) {
            var due = t.due_date || t.dueDate || t.deadline;
            if (due && due.slice(0, 10) === today) return true;
            var s = (t.status || '').toLowerCase();
            return s !== 'done' && s !== 'completed';
        }).slice(0, 15);
    }

    function escapeHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    return { init: init, open: open, close: close };
})();
if (typeof window !== 'undefined') window.DailyReview = DailyReview;
