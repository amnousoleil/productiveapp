/**
 * PomodoroTimer - Widget minuteur Pomodoro flottant pour ProductiveApp
 * Position fixe, bas-droite, au-dessus du chatbot FAB
 * Presets: Pomodoro (25/5), Long (50/10), Personnalise
 * Integration taches via linkTask(), evenements CustomEvent
 * Stockage localStorage par membre
 */
const PomodoroTimer = (function() {
    'use strict';

    // --- Etat interne ---
    const state = {
        isRunning: false,
        isPaused: false,
        currentMode: 'work',
        timeRemaining: 25 * 60,
        sessionsCompleted: 0,
        linkedTaskId: null,
        linkedTaskName: null,
        workDuration: 25 * 60,
        breakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        sessionsBeforeLongBreak: 4,
        minimized: false,
        preset: 'pomodoro'
    };

    let animFrameId = null;
    let lastTickTime = null;
    let audioCtx = null;
    let containerEl = null;
    let styleEl = null;

    const PRESETS = {
        pomodoro: { work: 25 * 60, break: 5 * 60, longBreak: 15 * 60, label: 'Pomodoro (25/5)' },
        long:     { work: 50 * 60, break: 10 * 60, longBreak: 20 * 60, label: 'Long (50/10)' },
        custom:   { work: 25 * 60, break: 5 * 60, longBreak: 15 * 60, label: 'Personnalise' }
    };

    const MODE_LABELS = {
        work: 'Travail',
        break: 'Pause',
        longBreak: 'Pause longue'
    };

    // --- Stockage local ---
    function getMemberId() {
        return AppState?.currentUser?.id || 'anonymous';
    }

    function storageKey() {
        return `productiveapp_pomodoro_${getMemberId()}`;
    }

    function loadSessions() {
        try {
            const raw = localStorage.getItem(storageKey());
            return raw ? JSON.parse(raw) : { sessions: [], totalWork: 0 };
        } catch { return { sessions: [], totalWork: 0 }; }
    }

    function saveSessions(data) {
        try { localStorage.setItem(storageKey(), JSON.stringify(data)); } catch {}
    }

    function saveCompletedSession(taskId, duration) {
        const data = loadSessions();
        data.sessions.push({
            taskId: taskId || null,
            duration,
            completedAt: new Date().toISOString(),
            mode: 'work'
        });
        data.totalWork += duration;
        saveSessions(data);
    }

    // --- Audio (Web Audio API, ton genere sans fichier externe) ---
    function playBeep(frequency, durationMs) {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + durationMs / 1000);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + durationMs / 1000);
        } catch {}
    }

    function playWorkEndSound() {
        playBeep(880, 200);
        setTimeout(() => playBeep(1100, 200), 250);
        setTimeout(() => playBeep(1320, 400), 500);
    }

    function playBreakEndSound() {
        playBeep(660, 150);
        setTimeout(() => playBeep(660, 150), 200);
    }

    // --- Logique du minuteur ---
    function getTotalDuration() {
        if (state.currentMode === 'work') return state.workDuration;
        if (state.currentMode === 'longBreak') return state.longBreakDuration;
        return state.breakDuration;
    }

    function tick(timestamp) {
        if (!state.isRunning || state.isPaused) {
            animFrameId = null;
            return;
        }
        if (!lastTickTime) lastTickTime = timestamp;
        const delta = (timestamp - lastTickTime) / 1000;
        if (delta >= 1) {
            const seconds = Math.floor(delta);
            state.timeRemaining = Math.max(0, state.timeRemaining - seconds);
            lastTickTime = timestamp - ((delta - seconds) * 1000);
            updateDisplay();
            if (state.timeRemaining <= 0) {
                onTimerEnd();
                return;
            }
        }
        animFrameId = requestAnimationFrame(tick);
    }

    function onTimerEnd() {
        state.isRunning = false;
        state.isPaused = false;
        lastTickTime = null;

        if (state.currentMode === 'work') {
            state.sessionsCompleted++;
            const duration = state.workDuration;
            saveCompletedSession(state.linkedTaskId, duration);
            playWorkEndSound();

            document.dispatchEvent(new CustomEvent('pomodoroComplete', {
                detail: { taskId: state.linkedTaskId, duration }
            }));

            // Determiner la prochaine pause
            if (state.sessionsCompleted % state.sessionsBeforeLongBreak === 0) {
                state.currentMode = 'longBreak';
                state.timeRemaining = state.longBreakDuration;
            } else {
                state.currentMode = 'break';
                state.timeRemaining = state.breakDuration;
            }
            // Demarrage automatique de la pause
            startTimer();
        } else {
            // Fin de pause - confirmation pour demarrer le travail
            playBreakEndSound();
            state.currentMode = 'work';
            state.timeRemaining = state.workDuration;
            updateDisplay();
            showNotification('Pause terminee ! Pret pour une nouvelle session ?');
        }
        updateDisplay();
    }

    function startTimer() {
        if (state.isRunning && !state.isPaused) return;
        state.isRunning = true;
        state.isPaused = false;
        lastTickTime = null;
        animFrameId = requestAnimationFrame(tick);
        updateDisplay();
    }

    function pauseTimer() {
        if (!state.isRunning) return;
        state.isPaused = true;
        lastTickTime = null;
        if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
        updateDisplay();
    }

    function resetTimer() {
        state.isRunning = false;
        state.isPaused = false;
        lastTickTime = null;
        if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
        state.currentMode = 'work';
        state.timeRemaining = state.workDuration;
        updateDisplay();
    }

    function applyPreset(name) {
        const p = PRESETS[name];
        if (!p) return;
        state.preset = name;
        state.workDuration = p.work;
        state.breakDuration = p.break;
        state.longBreakDuration = p.longBreak;
        if (!state.isRunning) {
            state.currentMode = 'work';
            state.timeRemaining = p.work;
        }
        updateDisplay();
    }

    // --- Integration tache ---
    function linkTask(taskId, taskName) {
        state.linkedTaskId = taskId;
        state.linkedTaskName = taskName || null;
        updateDisplay();
    }

    function unlinkTask() {
        state.linkedTaskId = null;
        state.linkedTaskName = null;
        updateDisplay();
    }

    // --- Notification ---
    function showNotification(msg) {
        if (typeof window.Toast === 'function') {
            window.Toast(msg, 'info');
        } else if (typeof window.showToast === 'function') {
            window.showToast(msg, 'info');
        }
    }

    // --- Formatage ---
    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function getProgress() {
        const total = getTotalDuration();
        if (total === 0) return 0;
        return 1 - (state.timeRemaining / total);
    }

    // --- Mise a jour de l'affichage ---
    function updateDisplay() {
        if (!containerEl) return;

        const pill = containerEl.querySelector('.pomodoro-pill');
        const panel = containerEl.querySelector('.pomodoro-panel');

        // Mode pilule (reduit)
        if (state.minimized) {
            pill.style.display = 'flex';
            panel.style.display = 'none';
            pill.querySelector('.pill-time').textContent = formatTime(state.timeRemaining);
            pill.querySelector('.pill-mode').textContent = MODE_LABELS[state.currentMode];
            pill.classList.toggle('pill-running', state.isRunning && !state.isPaused);
            return;
        }
        pill.style.display = 'none';
        panel.style.display = 'flex';

        // Cercle SVG (stroke-dasharray animation)
        const circle = panel.querySelector('.timer-progress');
        const circumference = 2 * Math.PI * 54;
        const offset = circumference * (1 - getProgress());
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${offset}`;

        // Couleur selon le mode
        const modeColors = { work: 'var(--accent)', break: '#4ecdc4', longBreak: '#a78bfa' };
        circle.style.stroke = modeColors[state.currentMode];

        // Texte minuteur
        panel.querySelector('.timer-time').textContent = formatTime(state.timeRemaining);
        panel.querySelector('.timer-mode-label').textContent = MODE_LABELS[state.currentMode];

        // Compteur de sessions
        const max = state.sessionsBeforeLongBreak;
        panel.querySelector('.session-counter').textContent =
            `${state.sessionsCompleted % max}/${max} sessions`;

        // Nom de la tache liee
        const taskEl = panel.querySelector('.linked-task');
        if (state.linkedTaskName) {
            taskEl.textContent = state.linkedTaskName;
            taskEl.style.display = 'block';
        } else {
            taskEl.style.display = 'none';
        }

        // Boutons lecture / pause
        const playBtn = panel.querySelector('.btn-play');
        const pauseBtn = panel.querySelector('.btn-pause');
        if (state.isRunning && !state.isPaused) {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-flex';
        } else {
            playBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
        }

        // Animation pulsation
        const svgWrap = panel.querySelector('.timer-svg-wrap');
        svgWrap.classList.toggle('pulse-active', state.isRunning && !state.isPaused);

        // Selecteur de preset actif
        panel.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === state.preset);
        });

        // Statistiques totales
        const totalData = loadSessions();
        const totalMin = Math.round(totalData.totalWork / 60);
        panel.querySelector('.total-stats').textContent =
            `Total : ${totalData.sessions.length} sessions (${totalMin} min)`;
    }

    // --- Rendu du widget ---
    function render() {
        if (containerEl) { updateDisplay(); return containerEl; }

        containerEl = document.createElement('div');
        containerEl.id = 'pomodoro-widget';
        containerEl.innerHTML = `
            <div class="pomodoro-pill" style="display:none" title="Ouvrir le minuteur">
                <span class="pill-mode">Travail</span>
                <span class="pill-time">25:00</span>
            </div>
            <div class="pomodoro-panel">
                <div class="panel-header">
                    <span class="panel-title">Minuteur Pomodoro</span>
                    <button class="btn-minimize" title="Reduire" aria-label="Reduire le minuteur">&#x2013;</button>
                    <button class="btn-close-pomo" title="Fermer" aria-label="Fermer le minuteur">&times;</button>
                </div>
                <div class="preset-bar">
                    <button class="preset-btn active" data-preset="pomodoro">25/5</button>
                    <button class="preset-btn" data-preset="long">50/10</button>
                    <button class="preset-btn" data-preset="custom">Perso</button>
                </div>
                <div class="timer-svg-wrap">
                    <svg class="timer-svg" viewBox="0 0 120 120" width="120" height="120">
                        <circle class="timer-bg" cx="60" cy="60" r="54"
                            fill="none" stroke="var(--bg-secondary, #2a2a3e)" stroke-width="8"/>
                        <circle class="timer-progress" cx="60" cy="60" r="54"
                            fill="none" stroke="var(--accent, #6c63ff)" stroke-width="8"
                            stroke-linecap="round" transform="rotate(-90 60 60)"
                            style="transition: stroke-dashoffset 0.4s ease;"/>
                    </svg>
                    <div class="timer-center">
                        <div class="timer-time">25:00</div>
                        <div class="timer-mode-label">Travail</div>
                    </div>
                </div>
                <div class="linked-task" style="display:none"></div>
                <div class="timer-controls">
                    <button class="btn-play" title="Demarrer" aria-label="Demarrer le minuteur">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                    </button>
                    <button class="btn-pause" style="display:none" title="Pause" aria-label="Mettre en pause">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>
                    </button>
                    <button class="btn-reset" title="Reinitialiser" aria-label="Reinitialiser le minuteur">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 105.64-11.36L3 10"/></svg>
                    </button>
                </div>
                <div class="session-counter">0/4 sessions</div>
                <div class="total-stats">Total : 0 sessions (0 min)</div>
                <div class="custom-inputs" style="display:none">
                    <label>Travail (min) <input type="number" class="input-work" value="25" min="1" max="120"></label>
                    <label>Pause (min) <input type="number" class="input-break" value="5" min="1" max="60"></label>
                    <label>Pause longue (min) <input type="number" class="input-long" value="15" min="1" max="60"></label>
                    <button class="btn-apply-custom">Appliquer</button>
                </div>
            </div>
        `;

        bindEvents();
        return containerEl;
    }

    // --- Liaison des evenements ---
    function bindEvents() {
        if (!containerEl) return;

        // Reduire / agrandir
        containerEl.querySelector('.btn-minimize').addEventListener('click', () => {
            state.minimized = true;
            updateDisplay();
        });
        containerEl.querySelector('.pomodoro-pill').addEventListener('click', () => {
            state.minimized = false;
            updateDisplay();
        });

        // Fermer
        containerEl.querySelector('.btn-close-pomo').addEventListener('click', () => {
            hide();
        });

        // Controles du minuteur
        containerEl.querySelector('.btn-play').addEventListener('click', startTimer);
        containerEl.querySelector('.btn-pause').addEventListener('click', pauseTimer);
        containerEl.querySelector('.btn-reset').addEventListener('click', resetTimer);

        // Selection de preset
        containerEl.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = btn.dataset.preset;
                const customInputs = containerEl.querySelector('.custom-inputs');
                if (p === 'custom') {
                    customInputs.style.display = customInputs.style.display === 'none' ? 'flex' : 'none';
                    state.preset = 'custom';
                    updateDisplay();
                    return;
                }
                customInputs.style.display = 'none';
                applyPreset(p);
            });
        });

        // Appliquer les valeurs personnalisees
        containerEl.querySelector('.btn-apply-custom').addEventListener('click', () => {
            const w = parseInt(containerEl.querySelector('.input-work').value) || 25;
            const b = parseInt(containerEl.querySelector('.input-break').value) || 5;
            const l = parseInt(containerEl.querySelector('.input-long').value) || 15;
            PRESETS.custom.work = Math.max(1, Math.min(120, w)) * 60;
            PRESETS.custom.break = Math.max(1, Math.min(60, b)) * 60;
            PRESETS.custom.longBreak = Math.max(1, Math.min(60, l)) * 60;
            applyPreset('custom');
            containerEl.querySelector('.custom-inputs').style.display = 'none';
        });
    }

    // --- Afficher / Masquer / Basculer ---
    function show() {
        if (!containerEl) render();
        if (!containerEl.parentNode) document.body.appendChild(containerEl);
        containerEl.style.display = 'block';
        state.minimized = false;
        updateDisplay();
    }

    function hide() {
        if (containerEl) containerEl.style.display = 'none';
    }

    function toggle() {
        if (!containerEl || containerEl.style.display === 'none') show();
        else hide();
    }

    // --- Injection CSS ---
    function injectStyles() {
        if (styleEl) return;
        styleEl = document.createElement('style');
        styleEl.id = 'pomodoro-styles';
        styleEl.textContent = `
            #pomodoro-widget {
                position: fixed;
                bottom: 100px;
                right: 24px;
                z-index: 900;
                font-family: inherit;
            }
            .pomodoro-pill {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                border-radius: 24px;
                background: var(--bg-secondary, #1e1e2e);
                border: 1px solid var(--accent, #6c63ff);
                color: var(--text-primary, #fff);
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                box-shadow: 0 4px 20px rgba(0,0,0,0.25);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                user-select: none;
            }
            .pomodoro-pill:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 24px rgba(0,0,0,0.35);
            }
            .pomodoro-pill.pill-running .pill-time {
                animation: pomoPillPulse 2s ease-in-out infinite;
            }
            .pomodoro-panel {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                width: 220px;
                padding: 16px;
                border-radius: 16px;
                background: var(--bg-secondary, rgba(30,30,46,0.92));
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 8px 32px rgba(0,0,0,0.35);
                color: var(--text-primary, #e0e0e0);
            }
            .panel-header {
                display: flex;
                align-items: center;
                width: 100%;
                gap: 6px;
            }
            .panel-title {
                flex: 1;
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 0.3px;
            }
            .btn-minimize, .btn-close-pomo {
                background: none;
                border: none;
                color: var(--text-primary, #ccc);
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                padding: 2px 6px;
                border-radius: 6px;
                transition: background 0.15s;
            }
            .btn-minimize:hover, .btn-close-pomo:hover {
                background: rgba(255,255,255,0.08);
            }
            .preset-bar {
                display: flex;
                gap: 4px;
                width: 100%;
            }
            .preset-btn {
                flex: 1;
                padding: 5px 0;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                background: transparent;
                color: var(--text-primary, #ccc);
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .preset-btn.active {
                background: var(--accent, #6c63ff);
                color: #fff;
                border-color: var(--accent, #6c63ff);
            }
            .preset-btn:hover:not(.active) {
                background: rgba(255,255,255,0.06);
            }
            .timer-svg-wrap {
                position: relative;
                width: 120px;
                height: 120px;
            }
            .timer-svg { display: block; }
            .timer-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
            }
            .timer-time {
                font-size: 24px;
                font-weight: 800;
                font-variant-numeric: tabular-nums;
                letter-spacing: 1px;
            }
            .timer-mode-label {
                font-size: 10px;
                text-transform: uppercase;
                opacity: 0.7;
                margin-top: 2px;
                letter-spacing: 0.5px;
            }
            .timer-svg-wrap.pulse-active {
                animation: pomoPulse 2s ease-in-out infinite;
            }
            .linked-task {
                font-size: 11px;
                padding: 4px 10px;
                border-radius: 8px;
                background: rgba(255,255,255,0.05);
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                text-align: center;
            }
            .timer-controls {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .timer-controls button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
                color: #fff;
            }
            .btn-play { background: var(--accent, #6c63ff); }
            .btn-play:hover { filter: brightness(1.15); transform: scale(1.08); }
            .btn-pause { background: #f59e0b; }
            .btn-pause:hover { filter: brightness(1.15); transform: scale(1.08); }
            .btn-reset { background: rgba(255,255,255,0.1); }
            .btn-reset:hover { background: rgba(255,255,255,0.18); transform: scale(1.08); }
            .session-counter { font-size: 12px; font-weight: 600; opacity: 0.8; }
            .total-stats { font-size: 10px; opacity: 0.5; }
            .custom-inputs {
                display: flex;
                flex-direction: column;
                gap: 6px;
                width: 100%;
                padding: 8px;
                border-radius: 8px;
                background: rgba(255,255,255,0.04);
            }
            .custom-inputs label {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                gap: 8px;
            }
            .custom-inputs input {
                width: 50px;
                padding: 3px 6px;
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 6px;
                background: rgba(0,0,0,0.2);
                color: var(--text-primary, #fff);
                font-size: 12px;
                text-align: center;
            }
            .btn-apply-custom {
                padding: 5px 0;
                border: none;
                border-radius: 6px;
                background: var(--accent, #6c63ff);
                color: #fff;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: filter 0.2s;
            }
            .btn-apply-custom:hover { filter: brightness(1.15); }
            @keyframes pomoPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.03); }
            }
            @keyframes pomoPillPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            @media (prefers-reduced-motion: reduce) {
                .timer-svg-wrap.pulse-active,
                .pomodoro-pill.pill-running .pill-time { animation: none; }
                .timer-progress { transition: none !important; }
            }
            @media (max-width: 480px) {
                #pomodoro-widget { right: 8px; bottom: 80px; }
                .pomodoro-panel { width: 190px; padding: 12px; }
                .timer-svg-wrap { width: 100px; height: 100px; }
                .timer-svg { width: 100px; height: 100px; }
                .timer-time { font-size: 20px; }
            }
        `;
        document.head.appendChild(styleEl);
    }

    // --- Initialisation ---
    function init() {
        injectStyles();
        render();
        document.body.appendChild(containerEl);
        containerEl.style.display = 'none';
        updateDisplay();
    }

    // --- API publique ---
    return {
        init,
        render,
        show,
        hide,
        toggle,
        start: startTimer,
        pause: pauseTimer,
        reset: resetTimer,
        linkTask,
        unlinkTask,
        applyPreset,
        getState: () => ({ ...state }),
        getSessions: loadSessions
    };
})();

window.PomodoroTimer = PomodoroTimer;
