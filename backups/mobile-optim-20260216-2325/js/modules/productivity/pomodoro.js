/**
 * ================================================
 * POMODORO TIMER - ProductiveApp v5.0
 * Widget flottant avec timer circulaire, presets,
 * integration taches, notifications sonores
 * ================================================
 */
const PomodoroTimer = (function() {
    'use strict';

    // State
    let state = {
        isRunning: false,
        isPaused: false,
        currentMode: 'work', // work | break | longBreak
        timeRemaining: 25 * 60,
        totalTime: 25 * 60,
        sessionsCompleted: 0,
        linkedTaskId: null,
        linkedTaskName: '',
        minimized: false,
        settings: {
            workDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLongBreak: 4
        }
    };

    let timerInterval = null;
    let audioCtx = null;
    let containerEl = null;
    let initialized = false;

    // ============================================
    // AUDIO
    // ============================================
    function playBeep() {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.8);
            // Double beep
            setTimeout(() => {
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.frequency.value = 1000;
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                osc2.start(audioCtx.currentTime);
                osc2.stop(audioCtx.currentTime + 0.5);
            }, 300);
        } catch (e) { /* Audio non disponible */ }
    }

    // ============================================
    // TIMER LOGIC
    // ============================================
    function startTimer() {
        if (state.isRunning && !state.isPaused) return;
        if (state.isPaused) {
            state.isPaused = false;
        } else {
            state.isRunning = true;
        }
        timerInterval = setInterval(() => {
            if (state.timeRemaining > 0) {
                state.timeRemaining--;
                renderTimer();
            } else {
                onTimerComplete();
            }
        }, 1000);
        renderTimer();
    }

    function pauseTimer() {
        if (!state.isRunning) return;
        state.isPaused = true;
        clearInterval(timerInterval);
        timerInterval = null;
        renderTimer();
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        state.isRunning = false;
        state.isPaused = false;
        state.timeRemaining = getModeTime();
        state.totalTime = state.timeRemaining;
        renderTimer();
    }

    function getModeTime() {
        const s = state.settings;
        switch (state.currentMode) {
            case 'work': return s.workDuration * 60;
            case 'break': return s.breakDuration * 60;
            case 'longBreak': return s.longBreakDuration * 60;
            default: return s.workDuration * 60;
        }
    }

    function onTimerComplete() {
        clearInterval(timerInterval);
        timerInterval = null;
        state.isRunning = false;
        state.isPaused = false;
        playBeep();

        if (state.currentMode === 'work') {
            state.sessionsCompleted++;
            saveSession();
            document.dispatchEvent(new CustomEvent('pomodoroComplete', {
                detail: { taskId: state.linkedTaskId, duration: state.settings.workDuration, sessions: state.sessionsCompleted }
            }));
            // Decide break type
            if (state.sessionsCompleted % state.settings.sessionsBeforeLongBreak === 0) {
                state.currentMode = 'longBreak';
            } else {
                state.currentMode = 'break';
            }
        } else {
            state.currentMode = 'work';
        }
        state.timeRemaining = getModeTime();
        state.totalTime = state.timeRemaining;
        renderTimer();
        if (typeof Utils !== 'undefined' && Utils.notify) {
            const msg = state.currentMode === 'work' ? 'Pause terminée ! Prêt pour une session ?' : 'Session terminée ! Pause bien méritée.';
            Utils.notify(msg, 'success');
        }
    }

    function saveSession() {
        const memberId = (typeof AppState !== 'undefined' && AppState.currentUser?.id) || 'anonymous';
        const key = `productiveapp_pomodoro_${memberId}`;
        const data = JSON.parse(localStorage.getItem(key) || '{"sessions":[],"total":0}');
        data.sessions.push({
            date: new Date().toISOString(),
            duration: state.settings.workDuration,
            taskId: state.linkedTaskId,
            taskName: state.linkedTaskName
        });
        data.total = data.sessions.length;
        localStorage.setItem(key, JSON.stringify(data));
    }

    // ============================================
    // RENDERING
    // ============================================
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function getProgress() {
        if (state.totalTime === 0) return 0;
        return 1 - (state.timeRemaining / state.totalTime);
    }

    function getModeLabel() {
        switch (state.currentMode) {
            case 'work': return 'Travail';
            case 'break': return 'Pause';
            case 'longBreak': return 'Longue pause';
            default: return 'Travail';
        }
    }

    function getModeColor() {
        switch (state.currentMode) {
            case 'work': return 'var(--accent, #d4af37)';
            case 'break': return '#4ade80';
            case 'longBreak': return '#60a5fa';
            default: return 'var(--accent, #d4af37)';
        }
    }

    function renderTimer() {
        if (!containerEl) return;
        const progress = getProgress();
        const circumference = 2 * Math.PI * 45;
        const dashoffset = circumference * (1 - progress);
        const color = getModeColor();

        if (state.minimized) {
            containerEl.innerHTML = `
                <div class="pomo-mini" onclick="PomodoroTimer.toggleMinimize()">
                    <span class="pomo-mini-time" style="color:${color}">${formatTime(state.timeRemaining)}</span>
                    ${state.isRunning ? '<span class="pomo-mini-pulse"></span>' : ''}
                </div>
            `;
            return;
        }

        containerEl.innerHTML = `
            <div class="pomo-widget">
                <div class="pomo-header">
                    <span class="pomo-mode" style="color:${color}">${getModeLabel()}</span>
                    <div class="pomo-header-actions">
                        <button class="pomo-btn-mini" onclick="PomodoroTimer.toggleMinimize()" title="Réduire">─</button>
                        <button class="pomo-btn-mini" onclick="PomodoroTimer.close()" title="Fermer">×</button>
                    </div>
                </div>
                <div class="pomo-circle-wrap">
                    <svg viewBox="0 0 100 100" class="pomo-svg">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-color, #333)" stroke-width="3" opacity="0.3"/>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="${color}" stroke-width="4"
                                stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}"
                                stroke-linecap="round" transform="rotate(-90 50 50)"
                                style="transition: stroke-dashoffset 0.3s ease"/>
                    </svg>
                    <div class="pomo-time">${formatTime(state.timeRemaining)}</div>
                </div>
                <div class="pomo-sessions">${state.sessionsCompleted}/${state.settings.sessionsBeforeLongBreak} sessions</div>
                ${state.linkedTaskName ? `<div class="pomo-task" title="${state.linkedTaskName}">🎯 ${state.linkedTaskName.substring(0, 25)}${state.linkedTaskName.length > 25 ? '...' : ''}</div>` : ''}
                <div class="pomo-controls">
                    ${!state.isRunning ? `<button class="pomo-btn pomo-btn-start" onclick="PomodoroTimer.start()">▶ Démarrer</button>` :
                      state.isPaused ? `<button class="pomo-btn pomo-btn-start" onclick="PomodoroTimer.start()">▶ Reprendre</button>` :
                      `<button class="pomo-btn pomo-btn-pause" onclick="PomodoroTimer.pause()">⏸ Pause</button>`}
                    <button class="pomo-btn pomo-btn-reset" onclick="PomodoroTimer.reset()">↺</button>
                </div>
                <div class="pomo-presets">
                    <button class="pomo-preset ${state.settings.workDuration===25?'active':''}" onclick="PomodoroTimer.setPreset(25,5)">25/5</button>
                    <button class="pomo-preset ${state.settings.workDuration===50?'active':''}" onclick="PomodoroTimer.setPreset(50,10)">50/10</button>
                    <button class="pomo-preset ${state.settings.workDuration===15?'active':''}" onclick="PomodoroTimer.setPreset(15,3)">15/3</button>
                </div>
            </div>
        `;
    }

    // ============================================
    // CSS INJECTION
    // ============================================
    function injectStyles() {
        if (document.getElementById('pomodoro-styles')) return;
        const style = document.createElement('style');
        style.id = 'pomodoro-styles';
        style.textContent = `
            .pomo-container{position:fixed;bottom:175px;right:25px;z-index:900;font-family:Inter,system-ui,sans-serif}
            .pomo-widget{background:var(--bg-secondary,#1a1a2e);border:1px solid var(--border-color,#333);border-radius:16px;padding:16px;width:220px;backdrop-filter:blur(20px);box-shadow:0 8px 32px rgba(0,0,0,0.3)}
            .pomo-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
            .pomo-mode{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
            .pomo-header-actions{display:flex;gap:4px}
            .pomo-btn-mini{background:none;border:none;color:var(--text-secondary,#888);cursor:pointer;font-size:16px;padding:2px 6px;border-radius:4px;line-height:1}
            .pomo-btn-mini:hover{background:var(--bg-primary,#111);color:var(--text-primary,#fff)}
            .pomo-circle-wrap{position:relative;width:140px;height:140px;margin:8px auto}
            .pomo-svg{width:100%;height:100%}
            .pomo-time{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:28px;font-weight:700;color:var(--text-primary,#fff);font-variant-numeric:tabular-nums}
            .pomo-sessions{text-align:center;font-size:12px;color:var(--text-secondary,#888);margin:4px 0}
            .pomo-task{text-align:center;font-size:11px;color:var(--text-secondary,#888);padding:4px 8px;background:var(--bg-primary,#111);border-radius:6px;margin:6px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .pomo-controls{display:flex;gap:8px;justify-content:center;margin:12px 0 8px}
            .pomo-btn{padding:8px 16px;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s}
            .pomo-btn-start{background:var(--accent,#d4af37);color:#000}
            .pomo-btn-start:hover{filter:brightness(1.1);transform:scale(1.02)}
            .pomo-btn-pause{background:#f59e0b;color:#000}
            .pomo-btn-reset{background:var(--bg-primary,#111);color:var(--text-secondary,#888);padding:8px 12px}
            .pomo-btn-reset:hover{color:var(--text-primary,#fff)}
            .pomo-presets{display:flex;gap:4px;justify-content:center}
            .pomo-preset{background:none;border:1px solid var(--border-color,#333);color:var(--text-secondary,#888);padding:3px 10px;border-radius:12px;font-size:11px;cursor:pointer;transition:all 0.2s}
            .pomo-preset.active,.pomo-preset:hover{border-color:var(--accent,#d4af37);color:var(--accent,#d4af37)}
            .pomo-mini{display:flex;align-items:center;gap:8px;background:var(--bg-secondary,#1a1a2e);border:1px solid var(--border-color,#333);border-radius:20px;padding:6px 14px;cursor:pointer;backdrop-filter:blur(20px)}
            .pomo-mini-time{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums}
            .pomo-mini-pulse{width:8px;height:8px;border-radius:50%;background:#4ade80;animation:pomoPulse 1.5s infinite}
            @keyframes pomoPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}
            .pomo-fab{position:fixed;bottom:165px;right:33px;z-index:899;width:44px;height:44px;border-radius:50%;background:var(--accent,#d4af37);border:none;color:#000;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:transform 0.2s}
            .pomo-fab:hover{transform:scale(1.1)}
            @media(prefers-reduced-motion:reduce){.pomo-mini-pulse{animation:none}.pomo-btn-start:hover{transform:none}}
            @media(max-width:768px){.pomo-container{bottom:152px;right:20px}.pomo-widget{width:190px;padding:12px}.pomo-fab{bottom:152px;right:28px}}
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // PUBLIC API
    // ============================================
    function init() {
        if (initialized) return;
        injectStyles();
        // Create FAB button
        const fab = document.createElement('button');
        fab.className = 'pomo-fab';
        fab.id = 'pomodoro-fab';
        fab.title = 'Minuteur Pomodoro';
        fab.innerHTML = '🍅';
        fab.onclick = () => toggle();
        document.body.appendChild(fab);
        // Load settings from localStorage
        const saved = localStorage.getItem('productiveapp_pomodoro_settings');
        if (saved) {
            try { Object.assign(state.settings, JSON.parse(saved)); } catch (e) {}
        }
        state.timeRemaining = getModeTime();
        state.totalTime = state.timeRemaining;
        initialized = true;
        console.log('[PomodoroTimer] Initialized');
    }

    function toggle() {
        if (containerEl) {
            close();
        } else {
            containerEl = document.createElement('div');
            containerEl.className = 'pomo-container';
            containerEl.id = 'pomodoro-container';
            document.body.appendChild(containerEl);
            renderTimer();
            const fab = document.getElementById('pomodoro-fab');
            if (fab) fab.style.display = 'none';
        }
    }

    function close() {
        if (containerEl) {
            containerEl.remove();
            containerEl = null;
        }
        const fab = document.getElementById('pomodoro-fab');
        if (fab) fab.style.display = '';
    }

    function toggleMinimize() {
        state.minimized = !state.minimized;
        renderTimer();
    }

    function setPreset(work, brk) {
        if (state.isRunning) return;
        state.settings.workDuration = work;
        state.settings.breakDuration = brk;
        localStorage.setItem('productiveapp_pomodoro_settings', JSON.stringify(state.settings));
        state.currentMode = 'work';
        state.timeRemaining = work * 60;
        state.totalTime = work * 60;
        renderTimer();
    }

    function linkTask(taskId, taskName) {
        state.linkedTaskId = taskId;
        state.linkedTaskName = taskName || '';
        if (containerEl) renderTimer();
    }

    function getStats() {
        const memberId = (typeof AppState !== 'undefined' && AppState.currentUser?.id) || 'anonymous';
        const key = `productiveapp_pomodoro_${memberId}`;
        const data = JSON.parse(localStorage.getItem(key) || '{"sessions":[],"total":0}');
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = data.sessions.filter(s => s.date.startsWith(today));
        return {
            totalSessions: data.total,
            todaySessions: todaySessions.length,
            todayMinutes: todaySessions.reduce((sum, s) => sum + (s.duration || 25), 0)
        };
    }

    return {
        init,
        toggle,
        close,
        start: startTimer,
        pause: pauseTimer,
        reset: resetTimer,
        toggleMinimize,
        setPreset,
        linkTask,
        getStats,
        get isRunning() { return state.isRunning; }
    };
})();

window.PomodoroTimer = PomodoroTimer;
