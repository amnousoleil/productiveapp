/**
 * POMODORO TIMER - ProductiveApp v5.0
 * Widget flottant draggable avec mode focus
 * 25min travail / 5min pause courte / 15min pause longue
 */
var PomodoroTimer = (function() {
    'use strict';

    var CONFIG = {
        WORK_DURATION: 25 * 60,
        SHORT_BREAK: 5 * 60,
        LONG_BREAK: 15 * 60,
        CYCLES_BEFORE_LONG: 4,
        STORAGE_KEY: 'productiveapp_pomodoro_stats',
        POSITION_KEY: 'productiveapp_pomodoro_pos',
        SETTINGS_KEY: 'productiveapp_pomodoro_settings'
    };

    var state = {
        initialized: false,
        isRunning: false,
        isPaused: false,
        currentSession: 'work',
        timeRemaining: CONFIG.WORK_DURATION,
        totalTime: CONFIG.WORK_DURATION,
        cycleCount: 0,
        autoStart: false,
        expanded: false,
        intervalId: null,
        currentTask: null,
        focusModeActive: false
    };

    var elements = {};
    var audioCtx = null;

    function injectCSS() {
        if (document.getElementById('pomodoro-styles')) return;
        var s = document.createElement('style');
        s.id = 'pomodoro-styles';
        s.textContent = [
            '.pomodoro-widget{position:fixed;bottom:155px;right:25px;z-index:9000;border-radius:20px;background:color-mix(in srgb,var(--surface,#1e1e2e) 95%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid color-mix(in srgb,var(--border,#333) 60%,transparent);box-shadow:0 8px 32px rgba(0,0,0,.25);transition:all .4s cubic-bezier(.22,1,.36,1);cursor:default;user-select:none}',
            '.pomodoro-widget.collapsed{width:60px;height:60px;border-radius:50%;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;overflow:hidden}',
            '.pomodoro-widget.expanded{width:280px;padding:20px;border-radius:20px}',
            '.pomodoro-collapsed{display:flex;align-items:center;justify-content:center;position:relative;width:100%;height:100%}',
            '.pomodoro-expanded{display:none}',
            '.pomodoro-widget.expanded .pomodoro-collapsed{display:none}',
            '.pomodoro-widget.expanded .pomodoro-expanded{display:flex;flex-direction:column;align-items:center;gap:16px}',
            '.pomodoro-ring-container{position:relative}',
            '.pomodoro-ring-container svg{display:block}',
            '.pomodoro-ring-bg{fill:none;stroke:color-mix(in srgb,var(--border,#333) 40%,transparent)}',
            '.pomodoro-ring-progress{fill:none;stroke-linecap:round;transition:stroke-dashoffset .5s ease,stroke .3s;transform:rotate(-90deg);transform-origin:center}',
            '.pomodoro-ring-progress.work{stroke:var(--accent,#8b5cf6)}',
            '.pomodoro-ring-progress.short_break{stroke:#22c55e}',
            '.pomodoro-ring-progress.long_break{stroke:#3b82f6}',
            '.pomodoro-time-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:13px;font-weight:700;color:var(--text,#fff);font-variant-numeric:tabular-nums}',
            '.pomodoro-session-badge{display:none}',
            '.pomodoro-header{display:flex;justify-content:space-between;align-items:center;width:100%}',
            '.pomodoro-header-title{font-size:14px;font-weight:700;color:var(--text,#fff)}',
            '.pomodoro-close-btn{background:none;border:none;color:var(--text-secondary,#888);font-size:20px;cursor:pointer;padding:0;line-height:1;transition:color .2s}',
            '.pomodoro-close-btn:hover{color:var(--text,#fff)}',
            '.pomodoro-session-label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;padding:4px 12px;border-radius:8px;text-align:center}',
            '.pomodoro-session-label.work{color:var(--accent,#8b5cf6);background:color-mix(in srgb,var(--accent,#8b5cf6) 12%,transparent)}',
            '.pomodoro-session-label.short_break{color:#22c55e;background:rgba(34,197,94,.12)}',
            '.pomodoro-session-label.long_break{color:#3b82f6;background:rgba(59,130,246,.12)}',
            '.pomodoro-ring-center{position:relative}',
            '.pomodoro-ring-time-overlay{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:28px;font-weight:800;color:var(--text,#fff);font-variant-numeric:tabular-nums;letter-spacing:1px}',
            '.pomodoro-cycles{display:flex;gap:8px;justify-content:center}',
            '.pomodoro-cycle-dot{width:10px;height:10px;border-radius:50%;background:color-mix(in srgb,var(--border,#333) 50%,transparent);transition:all .3s}',
            '.pomodoro-cycle-dot.completed{background:var(--accent,#8b5cf6)}',
            '.pomodoro-cycle-dot.active{background:var(--accent,#8b5cf6);animation:pomodoroDotPulse 1.5s ease infinite}',
            '.pomodoro-controls{display:flex;gap:8px;justify-content:center;width:100%}',
            '.pomodoro-btn{border:none;cursor:pointer;font-family:inherit;font-weight:600;border-radius:12px;transition:all .2s ease;display:inline-flex;align-items:center;justify-content:center;gap:6px}',
            '.pomodoro-btn-primary{flex:1;padding:10px 16px;font-size:14px;background:var(--accent,#8b5cf6);color:#fff}',
            '.pomodoro-btn-primary:hover{filter:brightness(1.1);transform:scale(1.02)}',
            '.pomodoro-btn-secondary{width:40px;height:40px;font-size:16px;background:color-mix(in srgb,var(--surface,#1e1e2e) 80%,transparent);color:var(--text-secondary,#888);border:1px solid var(--border,#333)}',
            '.pomodoro-btn-secondary:hover{color:var(--text,#fff);border-color:var(--text-secondary,#888)}',
            '.pomodoro-auto-start{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary,#888);cursor:pointer}',
            '.pomodoro-auto-start input{accent-color:var(--accent,#8b5cf6)}',
            '.pomodoro-stats{display:flex;gap:16px;width:100%;justify-content:center;padding-top:8px;border-top:1px solid color-mix(in srgb,var(--border,#333) 30%,transparent)}',
            '.pomodoro-stat{display:flex;flex-direction:column;align-items:center;gap:2px}',
            '.pomodoro-stat-value{font-size:16px;font-weight:700;color:var(--text,#fff)}',
            '.pomodoro-stat-label{font-size:10px;color:var(--text-secondary,#888);text-transform:uppercase;letter-spacing:.5px}',
            '.pomodoro-task-name{font-size:11px;color:var(--text-secondary,#888);text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
            '.pomodoro-focus-overlay{position:fixed;inset:0;background:rgba(0,0,0,.08);pointer-events:none;z-index:8999;opacity:0;transition:opacity .5s}',
            '.pomodoro-focus-overlay.active{opacity:1}',
            '@keyframes pomodoroDotPulse{0%,100%{opacity:1}50%{opacity:.5}}',
            '@keyframes pomodoroFadeIn{from{opacity:0;transform:scale(.9) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}',
            '.pomodoro-widget{animation:pomodoroFadeIn .4s cubic-bezier(.4,0,.2,1) forwards}',
            '@media(max-width:480px){.pomodoro-widget.expanded{width:calc(100vw - 32px);right:16px!important;bottom:80px!important}}',
            '@media(prefers-reduced-motion:reduce){.pomodoro-widget,.pomodoro-cycle-dot.active{animation:none!important;transition:none!important}}'
        ].join('\n');
        document.head.appendChild(s);
    }

    function buildRingSVG(size, sw) {
        var r = (size - sw) / 2, c = 2 * Math.PI * r, cx = size / 2;
        return {
            svg: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
                '<circle class="pomodoro-ring-bg" cx="' + cx + '" cy="' + cx + '" r="' + r + '" stroke-width="' + sw + '"/>' +
                '<circle class="pomodoro-ring-progress ' + state.currentSession + '" cx="' + cx + '" cy="' + cx + '" r="' + r + '" stroke-width="' + sw + '" stroke-dasharray="' + c + '" stroke-dashoffset="0"/>' +
                '</svg>',
            circumference: c
        };
    }

    function updateRing(container, progress, size, sw) {
        var r = (size - sw) / 2, c = 2 * Math.PI * r;
        var el = container.querySelector('.pomodoro-ring-progress');
        if (el) {
            el.style.strokeDashoffset = c * (1 - progress);
            el.setAttribute('class', 'pomodoro-ring-progress ' + state.currentSession);
        }
    }

    function fmt(sec) {
        var m = Math.floor(sec / 60), s = sec % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    function sessLabel() {
        return state.currentSession === 'work' ? 'Concentration' :
               state.currentSession === 'short_break' ? 'Pause courte' : 'Pause longue';
    }

    function sessShort() {
        return state.currentSession === 'work' ? 'Focus' :
               state.currentSession === 'short_break' ? 'Pause' : 'Repos';
    }

    function getACtx() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
        }
        return audioCtx;
    }

    function playBell() {
        var ctx = getACtx();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        var now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach(function(freq, i) {
            var osc = ctx.createOscillator(), gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            var vol = 0.12 - (i * 0.025);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(vol, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + 1.9);
        });
    }

    // Stats persistence
    function loadStats() {
        try {
            var r = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (!r) return defStats();
            var p = JSON.parse(r);
            var t = new Date().toISOString().slice(0, 10);
            if (p.date !== t) { p.date = t; p.dailySessions = 0; p.dailyFocusMinutes = 0; }
            return p;
        } catch (e) { return defStats(); }
    }

    function defStats() {
        return { date: new Date().toISOString().slice(0, 10), dailySessions: 0, dailyFocusMinutes: 0, totalSessions: 0, totalFocusMinutes: 0, currentStreak: 0 };
    }

    function saveStats(st) {
        try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(st)); } catch (e) {}
    }

    function recordComplete() {
        var st = loadStats();
        st.dailySessions++;
        st.totalSessions++;
        st.dailyFocusMinutes += 25;
        st.totalFocusMinutes += 25;
        st.currentStreak++;
        saveStats(st);
        updateStatsUI();
        // XP Feedback: pomodoro terminé
        try {
            if (typeof XPFeedback !== 'undefined' && XPFeedback.recordAction) {
                XPFeedback.recordAction('pomodoro_completed', null, 'Pomodoro terminé');
            }
        } catch (e) {}
    }

    function loadPos() { try { var r = localStorage.getItem(CONFIG.POSITION_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
    function savePos(l, b) { try { localStorage.setItem(CONFIG.POSITION_KEY, JSON.stringify({ left: l, bottom: b })); } catch (e) {} }
    function loadSet() { try { var r = localStorage.getItem(CONFIG.SETTINGS_KEY); return r ? JSON.parse(r) : {}; } catch (e) { return {}; } }
    function saveSet() { try { localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify({ autoStart: state.autoStart })); } catch (e) {} }

    function buildCycleDots() {
        var h = '';
        for (var i = 0; i < 4; i++) {
            var c = 'pomodoro-cycle-dot';
            if (i < state.cycleCount) c += ' completed';
            else if (i === state.cycleCount && state.currentSession === 'work') c += ' active';
            h += '<div class="' + c + '"></div>';
        }
        return h;
    }

    function createWidget() {
        var w = document.createElement('div');
        w.className = 'pomodoro-widget collapsed';
        w.id = 'pomodoro-widget';

        var cr = buildRingSVG(60, 4);
        var er = buildRingSVG(120, 6);

        w.innerHTML =
            '<div class="pomodoro-collapsed" id="pomodoro-collapsed">' +
                '<div class="pomodoro-ring-container" id="pomodoro-ring-collapsed">' + cr.svg + '</div>' +
                '<span class="pomodoro-time-text" id="pomodoro-time-collapsed">' + fmt(state.timeRemaining) + '</span>' +
                '<span class="pomodoro-session-badge" id="pomodoro-badge-collapsed">' + sessShort() + '</span>' +
            '</div>' +
            '<div class="pomodoro-expanded" id="pomodoro-expanded">' +
                '<div class="pomodoro-header">' +
                    '<span class="pomodoro-header-title">Pomodoro</span>' +
                    '<button class="pomodoro-close-btn" id="pomodoro-close-btn" title="R\u00e9duire">&times;</button>' +
                '</div>' +
                '<div class="pomodoro-session-label ' + state.currentSession + '" id="pomodoro-session-label">' + sessLabel() + '</div>' +
                '<div class="pomodoro-ring-center">' +
                    '<div class="pomodoro-ring-container" id="pomodoro-ring-expanded">' + er.svg + '</div>' +
                    '<div class="pomodoro-ring-time-overlay" id="pomodoro-time-expanded">' + fmt(state.timeRemaining) + '</div>' +
                '</div>' +
                '<div class="pomodoro-cycles" id="pomodoro-cycles">' + buildCycleDots() + '</div>' +
                '<div class="pomodoro-controls">' +
                    '<button class="pomodoro-btn pomodoro-btn-primary" id="pomodoro-btn-start">' +
                        '<span id="pomodoro-btn-start-icon">&#9654;</span>' +
                        '<span id="pomodoro-btn-start-text">D\u00e9marrer</span>' +
                    '</button>' +
                    '<button class="pomodoro-btn pomodoro-btn-secondary" id="pomodoro-btn-reset" title="R\u00e9initialiser">&#8634;</button>' +
                    '<button class="pomodoro-btn pomodoro-btn-secondary" id="pomodoro-btn-skip" title="Passer">&#9197;</button>' +
                '</div>' +
                '<div class="pomodoro-task-name" id="pomodoro-task-name" style="display:none"></div>' +
                '<label class="pomodoro-auto-start">' +
                    '<input type="checkbox" id="pomodoro-auto-start"' + (state.autoStart ? ' checked' : '') + '/>' +
                    'Encha\u00eener automatiquement' +
                '</label>' +
                '<div class="pomodoro-stats">' +
                    '<div class="pomodoro-stat"><span class="pomodoro-stat-value" id="pomodoro-stat-sessions">0</span><span class="pomodoro-stat-label">Sessions</span></div>' +
                    '<div class="pomodoro-stat"><span class="pomodoro-stat-value" id="pomodoro-stat-focus">0 min</span><span class="pomodoro-stat-label">Focus</span></div>' +
                    '<div class="pomodoro-stat"><span class="pomodoro-stat-value" id="pomodoro-stat-streak">0</span><span class="pomodoro-stat-label">S\u00e9rie</span></div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(w);

        // Focus overlay
        var ov = document.createElement('div');
        ov.className = 'pomodoro-focus-overlay';
        ov.id = 'pomodoro-focus-overlay';
        document.body.appendChild(ov);

        elements = {
            widget: w,
            collapsed: w.querySelector('#pomodoro-collapsed'),
            expanded: w.querySelector('#pomodoro-expanded'),
            ringCollapsed: w.querySelector('#pomodoro-ring-collapsed'),
            ringExpanded: w.querySelector('#pomodoro-ring-expanded'),
            timeCollapsed: w.querySelector('#pomodoro-time-collapsed'),
            timeExpanded: w.querySelector('#pomodoro-time-expanded'),
            badgeCollapsed: w.querySelector('#pomodoro-badge-collapsed'),
            sessionLabel: w.querySelector('#pomodoro-session-label'),
            cycles: w.querySelector('#pomodoro-cycles'),
            btnStart: w.querySelector('#pomodoro-btn-start'),
            btnStartIcon: w.querySelector('#pomodoro-btn-start-icon'),
            btnStartText: w.querySelector('#pomodoro-btn-start-text'),
            btnReset: w.querySelector('#pomodoro-btn-reset'),
            btnSkip: w.querySelector('#pomodoro-btn-skip'),
            taskName: w.querySelector('#pomodoro-task-name'),
            autoStartCb: w.querySelector('#pomodoro-auto-start'),
            closeBtn: w.querySelector('#pomodoro-close-btn'),
            statSessions: w.querySelector('#pomodoro-stat-sessions'),
            statFocus: w.querySelector('#pomodoro-stat-focus'),
            statStreak: w.querySelector('#pomodoro-stat-streak'),
            focusOverlay: ov
        };

        var pos = loadPos();
        if (pos) {
            w.style.left = pos.left + 'px';
            w.style.bottom = pos.bottom + 'px';
            w.style.right = 'auto';
        }
    }

    function bindEvents() {
        elements.collapsed.addEventListener('click', function(e) { e.stopPropagation(); toggleExpand(); });
        elements.closeBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleExpand(); });
        elements.btnStart.addEventListener('click', function(e) { e.stopPropagation(); state.isRunning ? pause() : start(); });
        elements.btnReset.addEventListener('click', function(e) { e.stopPropagation(); reset(); });
        elements.btnSkip.addEventListener('click', function(e) { e.stopPropagation(); skipSession(); });
        elements.autoStartCb.addEventListener('change', function(e) { state.autoStart = e.target.checked; saveSet(); });
        setupDrag();
    }

    function setupDrag() {
        var dsx, dsy, sl, sb, dr = false, mv = false;
        elements.widget.addEventListener('pointerdown', function(e) {
            if (state.expanded) {
                var h = elements.widget.querySelector('.pomodoro-header');
                if (!h || !h.contains(e.target)) return;
            }
            dr = true; mv = false;
            dsx = e.clientX; dsy = e.clientY;
            var r = elements.widget.getBoundingClientRect();
            sl = r.left; sb = window.innerHeight - r.bottom;
            e.preventDefault();
        });
        document.addEventListener('pointermove', function(e) {
            if (!dr) return;
            var dx = e.clientX - dsx, dy = e.clientY - dsy;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) mv = true;
            var nl = sl + dx, nb = sb - dy;
            var wr = elements.widget.getBoundingClientRect();
            nl = Math.max(8, Math.min(nl, window.innerWidth - wr.width - 8));
            nb = Math.max(8, Math.min(nb, window.innerHeight - wr.height - 8));
            elements.widget.style.left = nl + 'px';
            elements.widget.style.bottom = nb + 'px';
            elements.widget.style.right = 'auto';
            elements.widget.style.top = 'auto';
        });
        document.addEventListener('pointerup', function() {
            if (!dr) return;
            dr = false;
            if (mv) {
                var r = elements.widget.getBoundingClientRect();
                savePos(r.left, window.innerHeight - r.bottom);
            }
        });
    }

    function toggleExpand() {
        state.expanded = !state.expanded;
        elements.widget.classList.toggle('collapsed', !state.expanded);
        elements.widget.classList.toggle('expanded', state.expanded);
        updateUI();
    }

    function start() {
        if (state.isRunning) return;
        state.isRunning = true;
        state.isPaused = false;
        getACtx();
        if (state.currentSession === 'work') activateFocus();
        updateCtrl();
        state.intervalId = setInterval(tick, 1000);
    }

    function pause() {
        if (!state.isRunning) return;
        state.isRunning = false;
        state.isPaused = true;
        clearInterval(state.intervalId);
        state.intervalId = null;
        deactivateFocus();
        updateCtrl();
    }

    function reset() {
        clearInterval(state.intervalId);
        state.intervalId = null;
        state.isRunning = false;
        state.isPaused = false;
        state.currentSession = 'work';
        state.timeRemaining = CONFIG.WORK_DURATION;
        state.totalTime = CONFIG.WORK_DURATION;
        state.cycleCount = 0;
        deactivateFocus();
        updateUI();
        updateCtrl();
    }

    function tick() {
        state.timeRemaining--;
        if (state.timeRemaining <= 0) { onComplete(); return; }
        updateUI();
    }

    function onComplete() {
        clearInterval(state.intervalId);
        state.intervalId = null;
        state.isRunning = false;
        playBell();

        if (state.currentSession === 'work') {
            state.cycleCount++;
            recordComplete();
            if (state.cycleCount >= CONFIG.CYCLES_BEFORE_LONG) {
                state.currentSession = 'long_break';
                state.timeRemaining = CONFIG.LONG_BREAK;
                state.totalTime = CONFIG.LONG_BREAK;
                state.cycleCount = 0;
            } else {
                state.currentSession = 'short_break';
                state.timeRemaining = CONFIG.SHORT_BREAK;
                state.totalTime = CONFIG.SHORT_BREAK;
            }
        } else {
            state.currentSession = 'work';
            state.timeRemaining = CONFIG.WORK_DURATION;
            state.totalTime = CONFIG.WORK_DURATION;
        }

        deactivateFocus();
        updateUI();
        updateCtrl();

        // Toast
        if (typeof Toast !== 'undefined') {
            Toast.success(state.currentSession === 'work' ? 'Pause termin\u00e9e ! Au travail.' : 'Session compl\u00e8te ! Bonne pause.');
        }

        if (state.autoStart) setTimeout(start, 1500);
    }

    function skipSession() {
        clearInterval(state.intervalId);
        state.intervalId = null;
        state.isRunning = false;
        state.isPaused = false;

        if (state.currentSession === 'work') {
            if (state.cycleCount + 1 >= CONFIG.CYCLES_BEFORE_LONG) {
                state.currentSession = 'long_break';
                state.timeRemaining = CONFIG.LONG_BREAK;
                state.totalTime = CONFIG.LONG_BREAK;
            } else {
                state.currentSession = 'short_break';
                state.timeRemaining = CONFIG.SHORT_BREAK;
                state.totalTime = CONFIG.SHORT_BREAK;
            }
        } else {
            if (state.currentSession === 'long_break') state.cycleCount = 0;
            state.currentSession = 'work';
            state.timeRemaining = CONFIG.WORK_DURATION;
            state.totalTime = CONFIG.WORK_DURATION;
        }

        deactivateFocus();
        updateUI();
        updateCtrl();
    }

    function activateFocus() {
        state.focusModeActive = true;
        if (elements.focusOverlay) elements.focusOverlay.classList.add('active');
    }

    function deactivateFocus() {
        state.focusModeActive = false;
        if (elements.focusOverlay) elements.focusOverlay.classList.remove('active');
    }

    function updateUI() {
        if (!elements.timeCollapsed) return;
        var t = fmt(state.timeRemaining);
        var p = state.totalTime > 0 ? state.timeRemaining / state.totalTime : 0;

        elements.timeCollapsed.textContent = t;
        elements.badgeCollapsed.textContent = sessShort();
        updateRing(elements.ringCollapsed, p, 60, 4);

        elements.timeExpanded.textContent = t;
        elements.sessionLabel.textContent = sessLabel();
        elements.sessionLabel.className = 'pomodoro-session-label ' + state.currentSession;
        updateRing(elements.ringExpanded, p, 120, 6);

        elements.cycles.innerHTML = buildCycleDots();

        if (state.currentTask) {
            elements.taskName.style.display = 'block';
            elements.taskName.textContent = state.currentTask;
        } else {
            elements.taskName.style.display = 'none';
        }

        if (state.isRunning) {
            document.title = t + ' - ' + sessShort() + ' | ProductiveApp';
        }
    }

    function updateCtrl() {
        if (!elements.btnStartIcon) return;
        if (state.isRunning) {
            elements.btnStartIcon.innerHTML = '&#10074;&#10074;';
            elements.btnStartText.textContent = 'Pause';
        } else if (state.isPaused) {
            elements.btnStartIcon.innerHTML = '&#9654;';
            elements.btnStartText.textContent = 'Reprendre';
        } else {
            elements.btnStartIcon.innerHTML = '&#9654;';
            elements.btnStartText.textContent = 'D\u00e9marrer';
        }
    }

    function updateStatsUI() {
        var st = loadStats();
        if (elements.statSessions) elements.statSessions.textContent = st.dailySessions;
        if (elements.statFocus) elements.statFocus.textContent = st.dailyFocusMinutes + ' min';
        if (elements.statStreak) elements.statStreak.textContent = st.currentStreak;
    }

    function init() {
        if (state.initialized) return;
        state.initialized = true;
        var set = loadSet();
        if (set.autoStart !== undefined) state.autoStart = set.autoStart;
        injectCSS();
        createWidget();
        bindEvents();
        updateUI();
        updateCtrl();
        updateStatsUI();
        console.log('[Pomodoro] Module initialis\u00e9');
    }

    function setTask(name) {
        state.currentTask = name || null;
        if (state.initialized) updateUI();
    }

    return {
        init: init,
        start: start,
        pause: pause,
        reset: reset,
        setTask: setTask,
        getStats: function() { return loadStats(); },
        isRunning: function() { return state.isRunning; },
        isFocusModeActive: function() { return state.focusModeActive; },
        getCurrentSession: function() { return state.currentSession; },
        getTimeRemaining: function() { return state.timeRemaining; }
    };
})();

if (typeof window !== 'undefined') window.PomodoroTimer = PomodoroTimer;
