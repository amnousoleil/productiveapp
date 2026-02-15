/**
 * ================================================
 * PRODUCTIVITY TOOLS - ProductiveApp v1.0
 * Pomodoro Timer + Time Tracker per task
 * ================================================
 */

/* ================================================
   POMODORO TIMER
   ================================================ */
var PomodoroTimer = (function() {
    'use strict';

    var STATES = { IDLE: 'idle', FOCUS: 'focus', SHORT_BREAK: 'short_break', LONG_BREAK: 'long_break' };
    var LABELS = { idle: 'Pr\u00eat', focus: 'Concentration', short_break: 'Pause courte', long_break: 'Pause longue' };
    var STORAGE_SETTINGS = 'productiveapp_pomodoro_settings';
    var STORAGE_STATE = 'productiveapp_pomodoro_state';
    var STORAGE_SESSIONS = 'productiveapp_pomodoro_sessions';

    var settings = { focus: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLong: 4 };
    var state = STATES.IDLE;
    var timeLeft = 1500;
    var totalTime = 1500;
    var running = false;
    var sessionCount = 0;
    var intervalId = null;
    var audioCtx = null;
    var expanded = false;
    var settingsOpen = false;
    var pillEl = null;
    var cardEl = null;
    var ringProgress = null;
    var initialized = false;
    var circumference = 2 * Math.PI * 54;

    function init() {
        if (initialized) return;
        initialized = true;
        loadSettings();
        loadState();
        timeLeft = timeLeft || settings.focus * 60;
        totalTime = totalTime || timeLeft;
        createPillDOM();
        createCardDOM();
        bindEvents();
        updateUI();
        if (running) startInterval();
    }

    // Settings persistence
    function loadSettings() {
        try { var s = JSON.parse(localStorage.getItem(STORAGE_SETTINGS)); if (s) Object.assign(settings, s); } catch (e) {}
    }
    function saveSettings() {
        try { localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings)); } catch (e) {}
    }

    // State persistence
    function loadState() {
        try {
            var s = JSON.parse(localStorage.getItem(STORAGE_STATE));
            if (s) { state = s.state || STATES.IDLE; timeLeft = s.timeLeft || settings.focus * 60; totalTime = s.totalTime || timeLeft; running = s.running || false; sessionCount = s.sessionCount || 0; }
        } catch (e) {}
    }
    function saveState() {
        try { localStorage.setItem(STORAGE_STATE, JSON.stringify({ state: state, timeLeft: timeLeft, totalTime: totalTime, running: running, sessionCount: sessionCount })); } catch (e) {}
    }

    // Sessions persistence
    function getTodaySessions() {
        try {
            var d = JSON.parse(localStorage.getItem(STORAGE_SESSIONS)) || {};
            var key = new Date().toISOString().slice(0, 10);
            return d[key] || 0;
        } catch (e) { return 0; }
    }
    function incrementTodaySessions() {
        try {
            var d = JSON.parse(localStorage.getItem(STORAGE_SESSIONS)) || {};
            var key = new Date().toISOString().slice(0, 10);
            d[key] = (d[key] || 0) + 1;
            localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(d));
        } catch (e) {}
    }

    // DOM: Pill (compact)
    function createPillDOM() {
        pillEl = document.createElement('div');
        pillEl.className = 'pomodoro-pill';
        pillEl.innerHTML =
            '<span class="pomodoro-pill__icon">\uD83C\uDF45</span>' +
            '<span class="pomodoro-pill__time">25:00</span>' +
            '<button class="pomodoro-pill__action">\u25B6</button>';
        pillEl.addEventListener('click', function(e) {
            if (e.target.closest('.pomodoro-pill__action')) {
                if (running) pause(); else start();
                return;
            }
            toggleExpanded();
        });
        document.body.appendChild(pillEl);
    }

    // DOM: Card (expanded)
    function createCardDOM() {
        cardEl = document.createElement('div');
        cardEl.className = 'pomodoro-card hidden';
        cardEl.innerHTML =
            '<div class="pomodoro-card__header">' +
                '<span class="pomodoro-card__label">Pr\u00eat</span>' +
                '<button class="pomodoro-settings-btn" title="Param\u00e8tres">\u2699\uFE0F</button>' +
                '<button class="pomodoro-card__minimize" title="R\u00e9duire">\u2796</button>' +
            '</div>' +
            '<div class="pomodoro-card__ring">' +
                '<svg viewBox="0 0 120 120">' +
                    '<circle class="pomodoro-ring__bg" cx="60" cy="60" r="54" fill="none" stroke-width="6"/>' +
                    '<circle class="pomodoro-ring__progress" cx="60" cy="60" r="54" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + circumference + '" stroke-dashoffset="0" transform="rotate(-90 60 60)"/>' +
                '</svg>' +
                '<div class="pomodoro-card__time">25:00</div>' +
            '</div>' +
            '<div class="pomodoro-card__session">Session 1/4</div>' +
            '<div class="pomodoro-card__controls">' +
                '<button data-action="reset" title="R\u00e9initialiser"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg></button>' +
                '<button data-action="play" class="pomodoro-play-btn" title="D\u00e9marrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg></button>' +
                '<button data-action="skip" title="Suivant"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5,4 15,12 5,20" fill="currentColor"/><line x1="19" y1="5" x2="19" y2="19"/></svg></button>' +
            '</div>' +
            '<div class="pomodoro-card__completed"></div>' +
            '<div class="pomodoro-card__settings">' +
                '<div class="pomodoro-setting-row"><label>Concentration</label><input type="number" data-setting="focus" value="' + settings.focus + '" min="1" max="120"> min</div>' +
                '<div class="pomodoro-setting-row"><label>Pause courte</label><input type="number" data-setting="shortBreak" value="' + settings.shortBreak + '" min="1" max="60"> min</div>' +
                '<div class="pomodoro-setting-row"><label>Pause longue</label><input type="number" data-setting="longBreak" value="' + settings.longBreak + '" min="1" max="60"> min</div>' +
                '<div class="pomodoro-setting-row"><label>Sessions</label><input type="number" data-setting="sessionsBeforeLong" value="' + settings.sessionsBeforeLong + '" min="1" max="12"></div>' +
            '</div>';

        cardEl.querySelector('.pomodoro-card__minimize').addEventListener('click', function() { toggleExpanded(); });
        document.body.appendChild(cardEl);
    }

    function bindEvents() {
        cardEl.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-action]');
            if (!btn) return;
            var action = btn.getAttribute('data-action');
            if (action === 'play') { running ? pause() : start(); }
            else if (action === 'reset') { reset(); }
            else if (action === 'skip') { skip(); }
        });

        cardEl.querySelector('.pomodoro-settings-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            settingsOpen = !settingsOpen;
            var panel = cardEl.querySelector('.pomodoro-card__settings');
            panel.classList.toggle('open', settingsOpen);
        });

        var inputs = cardEl.querySelectorAll('.pomodoro-card__settings input');
        for (var i = 0; i < inputs.length; i++) inputs[i].addEventListener('change', onSettingChange);

        document.addEventListener('click', function(e) {
            if (expanded && cardEl && !cardEl.contains(e.target) && !pillEl.contains(e.target)) toggleExpanded();
        });

        window.addEventListener('beforeunload', function() { saveState(); });
        setInterval(function() { if (running) saveState(); }, 10000);
    }

    // Timer logic
    function start() {
        if (state === STATES.IDLE) { state = STATES.FOCUS; timeLeft = settings.focus * 60; totalTime = timeLeft; }
        running = true;
        startInterval();
        updateUI();
        saveState();
    }

    function pause() {
        running = false;
        clearInterval(intervalId);
        intervalId = null;
        updateUI();
        saveState();
    }

    function skip() {
        clearInterval(intervalId); intervalId = null; running = false;
        advancePhase(); updateUI(); saveState();
    }

    function reset() {
        clearInterval(intervalId); intervalId = null; running = false;
        state = STATES.IDLE; sessionCount = 0;
        timeLeft = settings.focus * 60; totalTime = timeLeft;
        updateUI(); saveState();
    }

    function startInterval() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(function() {
            timeLeft--;
            if (timeLeft <= 0) { timeLeft = 0; clearInterval(intervalId); intervalId = null; onTimerEnd(); }
            updateUI();
        }, 1000);
    }

    function onTimerEnd() {
        running = false;
        playBeep();
        showNotification();
        if (state === STATES.FOCUS) { sessionCount++; incrementTodaySessions(); }
        advancePhase();
        running = true; startInterval(); updateUI(); saveState();
    }

    function advancePhase() {
        if (state === STATES.FOCUS) {
            if (sessionCount > 0 && sessionCount % settings.sessionsBeforeLong === 0) { state = STATES.LONG_BREAK; timeLeft = settings.longBreak * 60; }
            else { state = STATES.SHORT_BREAK; timeLeft = settings.shortBreak * 60; }
        } else { state = STATES.FOCUS; timeLeft = settings.focus * 60; }
        totalTime = timeLeft;
    }

    function toggleExpanded() {
        expanded = !expanded;
        if (expanded) { pillEl.classList.add('hidden'); cardEl.classList.remove('hidden'); }
        else { pillEl.classList.remove('hidden'); cardEl.classList.add('hidden'); settingsOpen = false; var p = cardEl.querySelector('.pomodoro-card__settings'); if (p) p.classList.remove('open'); }
    }

    function updateUI() {
        if (!pillEl || !cardEl) return;
        var mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        var ss = String(timeLeft % 60).padStart(2, '0');
        var timeStr = mm + ':' + ss;
        var isBreak = (state === STATES.SHORT_BREAK || state === STATES.LONG_BREAK);

        // Pill
        var pillTime = pillEl.querySelector('.pomodoro-pill__time');
        var pillAction = pillEl.querySelector('.pomodoro-pill__action');
        if (pillTime) pillTime.textContent = timeStr;
        if (pillAction) pillAction.textContent = running ? '\u23F8' : '\u25B6';
        pillEl.classList.toggle('running', running);
        pillEl.classList.toggle('on-break', isBreak);

        // Card
        var labelEl = cardEl.querySelector('.pomodoro-card__label');
        if (labelEl) { labelEl.textContent = LABELS[state] || 'Pomodoro'; labelEl.classList.toggle('break-label', isBreak); }

        var timeEl = cardEl.querySelector('.pomodoro-card__time');
        if (timeEl) timeEl.textContent = timeStr;

        ringProgress = cardEl.querySelector('.pomodoro-ring__progress');
        if (ringProgress && totalTime > 0) {
            var progress = 1 - (timeLeft / totalTime);
            ringProgress.style.strokeDashoffset = circumference * (1 - progress);
            ringProgress.classList.toggle('break-stroke', isBreak);
        }

        var sessionEl = cardEl.querySelector('.pomodoro-card__session');
        if (sessionEl) {
            if (isBreak) sessionEl.textContent = LABELS[state];
            else sessionEl.textContent = 'Session ' + ((sessionCount % settings.sessionsBeforeLong) + 1) + '/' + settings.sessionsBeforeLong;
        }

        var playBtn = cardEl.querySelector('[data-action="play"]');
        if (playBtn) {
            if (running) { playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="5" height="18" rx="1"/><rect x="14" y="3" width="5" height="18" rx="1"/></svg>'; playBtn.title = 'Pause'; }
            else { playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>'; playBtn.title = state === STATES.IDLE ? 'D\u00e9marrer' : 'Reprendre'; }
        }

        var completedEl = cardEl.querySelector('.pomodoro-card__completed');
        if (completedEl) {
            var today = getTodaySessions();
            completedEl.textContent = today > 0 ? (today + ' session' + (today > 1 ? 's' : '') + ' aujourd\'hui') : '';
        }
    }

    function onSettingChange(e) {
        var key = e.target.getAttribute('data-setting');
        var val = parseInt(e.target.value, 10);
        if (!key || isNaN(val)) return;
        if (key === 'focus') settings.focus = Math.max(1, Math.min(120, val));
        else if (key === 'shortBreak') settings.shortBreak = Math.max(1, Math.min(60, val));
        else if (key === 'longBreak') settings.longBreak = Math.max(1, Math.min(60, val));
        else if (key === 'sessionsBeforeLong') settings.sessionsBeforeLong = Math.max(1, Math.min(12, val));
        saveSettings();
        if (state === STATES.IDLE) { timeLeft = settings.focus * 60; totalTime = timeLeft; updateUI(); }
    }

    function playBeep() {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var freqs = [880, 880, 1100], durs = [0.12, 0.12, 0.2], gaps = [0.08, 0.08, 0];
            var t = audioCtx.currentTime;
            for (var i = 0; i < freqs.length; i++) {
                var osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.type = 'sine'; osc.frequency.value = freqs[i];
                gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
                gain.gain.linearRampToValueAtTime(0.3, t + durs[i] - 0.02); gain.gain.linearRampToValueAtTime(0, t + durs[i]);
                osc.start(t); osc.stop(t + durs[i]);
                t += durs[i] + gaps[i];
            }
        } catch (e) {}
    }

    function showNotification() {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'default') { Notification.requestPermission(); return; }
        if (Notification.permission !== 'granted') return;
        var title = state === STATES.FOCUS ? '\uD83C\uDF45 Concentration termin\u00e9e !' : '\u2615 Pause termin\u00e9e !';
        var body = state === STATES.FOCUS ? 'Bravo ! C\'est l\'heure de la pause.' : 'C\'est reparti pour une session de concentration.';
        try { new Notification(title, { body: body, icon: '/icons/icon-192.png', tag: 'pomodoro', silent: true }); } catch (e) {}
        // Notify notification center
        if (typeof NotificationCenter !== 'undefined' && NotificationCenter.notifyPomodoroComplete) {
            NotificationCenter.notifyPomodoroComplete();
        }
    }

    return {
        init: init, start: start, pause: pause, skip: skip, reset: reset,
        toggle: function() { toggleExpanded(); },
        togglePlay: function() { running ? pause() : start(); },
        isRunning: function() { return running; },
        isVisible: function() { return expanded; },
        getState: function() { return state; },
        getTodaySessions: getTodaySessions
    };
})();

if (typeof window !== 'undefined') window.PomodoroTimer = PomodoroTimer;


/* ================================================
   TIME TRACKER
   ================================================ */
var TimeTracker = (function() {
    'use strict';

    var STORAGE_ENTRIES = 'productiveapp_time_entries';
    var STORAGE_ACTIVE = 'productiveapp_time_active';

    var entries = [];
    var activeTimer = null;
    var tickInterval = null;
    var floatingEl = null;
    var initialized = false;

    function init() {
        if (initialized) return;
        initialized = true;
        loadEntries(); loadActiveTimer();
        createFloatingDOM(); updateFloating();
        if (activeTimer) startTick();
        window.addEventListener('beforeunload', function() { saveEntries(); saveActiveTimer(); });
    }

    function loadEntries() { try { var r = localStorage.getItem(STORAGE_ENTRIES); if (r) entries = JSON.parse(r) || []; } catch (e) { entries = []; } }
    function saveEntries() { try { localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(entries)); } catch (e) {} }
    function loadActiveTimer() {
        try {
            var r = localStorage.getItem(STORAGE_ACTIVE);
            if (r) { var a = JSON.parse(r); if (a && a.taskId && a.startTime) activeTimer = { id: a.id || genId(), taskId: a.taskId, taskTitle: a.taskTitle || 'T\u00e2che', startTime: a.startTime }; }
        } catch (e) { activeTimer = null; }
    }
    function saveActiveTimer() { try { if (activeTimer) localStorage.setItem(STORAGE_ACTIVE, JSON.stringify(activeTimer)); else localStorage.removeItem(STORAGE_ACTIVE); } catch (e) {} }

    function startTimer(taskId, taskTitle) {
        if (activeTimer) stopTimer();
        activeTimer = { id: genId(), taskId: taskId, taskTitle: taskTitle || 'T\u00e2che sans nom', startTime: Date.now() };
        saveActiveTimer(); startTick(); updateFloating();
        return activeTimer;
    }

    function stopTimer() {
        if (!activeTimer) return null;
        var endTime = Date.now();
        var duration = Math.floor((endTime - activeTimer.startTime) / 1000);
        var entry = null;
        if (duration >= 2) {
            entry = { id: activeTimer.id, taskId: activeTimer.taskId, taskTitle: activeTimer.taskTitle, startTime: activeTimer.startTime, endTime: endTime, duration: duration };
            entries.push(entry); saveEntries();
        }
        activeTimer = null; saveActiveTimer(); stopTick(); updateFloating();
        return entry;
    }

    function startTick() { if (tickInterval) clearInterval(tickInterval); tickInterval = setInterval(updateFloating, 1000); }
    function stopTick() { if (tickInterval) { clearInterval(tickInterval); tickInterval = null; } }

    function getActiveTimer() {
        if (!activeTimer) return null;
        return { taskId: activeTimer.taskId, taskTitle: activeTimer.taskTitle, startTime: activeTimer.startTime, elapsed: Math.floor((Date.now() - activeTimer.startTime) / 1000) };
    }

    function getTimeForTask(taskId) {
        var total = 0;
        for (var i = 0; i < entries.length; i++) { if (entries[i].taskId === taskId) total += entries[i].duration || 0; }
        if (activeTimer && activeTimer.taskId === taskId) total += Math.floor((Date.now() - activeTimer.startTime) / 1000);
        return total;
    }

    function getAllEntries() { return entries.slice(); }
    function getEntriesForTask(taskId) { return entries.filter(function(e) { return e.taskId === taskId; }); }
    function deleteEntry(entryId) { entries = entries.filter(function(e) { return e.id !== entryId; }); saveEntries(); }

    function formatTime(seconds) {
        if (typeof seconds !== 'number' || seconds < 0) seconds = 0;
        var h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
        return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function formatTimeShort(seconds) {
        if (typeof seconds !== 'number' || seconds < 0) seconds = 0;
        var h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return h + 'h ' + m + 'min';
        if (m > 0) return m + 'min';
        return seconds + 's';
    }

    function createFloatingDOM() {
        floatingEl = document.createElement('div');
        floatingEl.className = 'time-tracker-floating hidden';
        floatingEl.innerHTML =
            '<span class="time-tracker-floating__dot"></span>' +
            '<span class="time-tracker-floating__time">00:00:00</span>' +
            '<span class="time-tracker-floating__task"></span>' +
            '<button class="time-tracker-floating__stop" title="Arr\u00eater">' +
                '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>' +
            '</button>';
        floatingEl.querySelector('.time-tracker-floating__stop').addEventListener('click', function(e) { e.stopPropagation(); stopTimer(); });
        document.body.appendChild(floatingEl);
    }

    function updateFloating() {
        if (!floatingEl) return;
        if (!activeTimer) { floatingEl.classList.add('hidden'); return; }
        floatingEl.classList.remove('hidden');
        var elapsed = Math.floor((Date.now() - activeTimer.startTime) / 1000);
        var timeEl = floatingEl.querySelector('.time-tracker-floating__time');
        var taskEl = floatingEl.querySelector('.time-tracker-floating__task');
        if (timeEl) timeEl.textContent = formatTime(elapsed);
        if (taskEl) taskEl.textContent = activeTimer.taskTitle;
    }

    function renderTaskTracker(taskId, taskTitle) {
        var isActive = activeTimer && activeTimer.taskId === taskId;
        var totalSeconds = getTimeForTask(taskId);
        var container = document.createElement('div');
        container.className = 'time-tracker' + (isActive ? ' active' : '');
        container.setAttribute('data-task-id', taskId);
        container.innerHTML =
            '<span class="time-tracker-dot"></span>' +
            '<span class="time-tracker-icon">\u23F1</span>' +
            '<span class="time-tracker-display">' + formatTime(totalSeconds) + '</span>' +
            (isActive
                ? '<button class="time-tracker-btn stop-btn" title="Arr\u00eater"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg></button>'
                : '<button class="time-tracker-btn" title="D\u00e9marrer le suivi"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg></button>'
            );

        container.querySelector('.time-tracker-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            if (isActive) stopTimer(); else startTimer(taskId, taskTitle || 'T\u00e2che');
            var parent = container.parentNode;
            if (parent) { var newTracker = renderTaskTracker(taskId, taskTitle); parent.replaceChild(newTracker, container); }
        });

        if (isActive) {
            var displayEl = container.querySelector('.time-tracker-display');
            var inlineInterval = setInterval(function() {
                if (!activeTimer || activeTimer.taskId !== taskId) { clearInterval(inlineInterval); return; }
                if (displayEl) displayEl.textContent = formatTime(getTimeForTask(taskId));
            }, 1000);
        }
        return container;
    }

    function genId() { return 'tt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6); }

    return {
        init: init, startTimer: startTimer, stopTimer: stopTimer,
        getActiveTimer: getActiveTimer, getTimeForTask: getTimeForTask,
        getAllEntries: getAllEntries, getEntriesForTask: getEntriesForTask, deleteEntry: deleteEntry,
        formatTime: formatTime, formatTimeShort: formatTimeShort,
        renderTaskTracker: renderTaskTracker,
        isTracking: function() { return !!activeTimer; }
    };
})();

if (typeof window !== 'undefined') window.TimeTracker = TimeTracker;
