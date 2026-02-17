/**
 * ================================================
 * FOCUS MODE - ProductiveApp v5.0
 * Mode concentration avec sons ambiants,
 * timer optionnel, blocage navigation
 * ================================================
 */
const FocusMode = (function() {
    'use strict';

    let active = false;
    let audioCtx = null;
    let ambientNodes = [];
    let currentSound = 'silence';
    let volume = 0.3;
    let focusTimer = null;
    let focusTimeRemaining = 0;
    let focusStartTime = null;
    let barEl = null;
    let initialized = false;

    // ============================================
    // AMBIENT SOUNDS (Web Audio API)
    // ============================================
    function createNoise(type) {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = 2 * audioCtx.sampleRate;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (type === 'brown') {
                b0 = (b0 + (0.02 * white)) / 1.02;
                output[i] = b0 * 3.5;
            } else if (type === 'pink') {
                b0 = 0.99886*b0 + white*0.0555179;
                b1 = 0.99332*b1 + white*0.0750759;
                b2 = 0.96900*b2 + white*0.1538520;
                b3 = 0.86650*b3 + white*0.3104856;
                b4 = 0.55000*b4 + white*0.5329522;
                b5 = -0.7616*b5 - white*0.0168980;
                output[i] = (b0+b1+b2+b3+b4+b5+b6+white*0.5362) * 0.11;
                b6 = white * 0.115926;
            } else {
                output[i] = white;
            }
        }
        const src = audioCtx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        return src;
    }

    function stopAmbient() {
        ambientNodes.forEach(n => { try { n.stop(); n.disconnect(); } catch(e){} });
        ambientNodes = [];
    }

    function playAmbient(type) {
        stopAmbient();
        currentSound = type;
        if (type === 'silence' || !audioCtx) return;

        const gain = audioCtx.createGain();
        gain.gain.value = volume;
        gain.connect(audioCtx.destination);

        if (type === 'rain') {
            const src = createNoise('brown');
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            src.connect(filter);
            filter.connect(gain);
            src.start();
            ambientNodes.push(src);
        } else if (type === 'cafe') {
            const src = createNoise('pink');
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            src.connect(filter);
            filter.connect(gain);
            gain.gain.value = volume * 0.5;
            src.start();
            ambientNodes.push(src);
        } else if (type === 'forest') {
            const src = createNoise('pink');
            const bp = audioCtx.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = 1200;
            bp.Q.value = 0.8;
            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.frequency.value = 0.3;
            lfoGain.gain.value = 0.15;
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            lfo.start();
            src.connect(bp);
            bp.connect(gain);
            src.start();
            ambientNodes.push(src, lfo);
        }
        renderBar();
    }

    function setVolume(val) {
        volume = Math.max(0, Math.min(1, val));
        if (currentSound !== 'silence') playAmbient(currentSound);
    }

    // ============================================
    // FOCUS TIMER
    // ============================================
    function startFocusTimer(minutes) {
        focusTimeRemaining = minutes * 60;
        focusTimer = setInterval(() => {
            focusTimeRemaining--;
            renderBar();
            if (focusTimeRemaining <= 0) {
                clearInterval(focusTimer);
                focusTimer = null;
                if (typeof Utils !== 'undefined') Utils.notify('Temps de focus termin\u00e9 !', 'success');
                deactivate();
            }
        }, 1000);
    }

    function fmtTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    // ============================================
    // ACTIVATION / DEACTIVATION
    // ============================================
    function activate(durationMinutes) {
        if (active) return;
        active = true;
        focusStartTime = Date.now();
        document.body.classList.add('focus-mode-active');

        // Create top bar
        barEl = document.createElement('div');
        barEl.className = 'focus-bar';
        barEl.id = 'focus-mode-bar';
        document.body.appendChild(barEl);

        if (durationMinutes) startFocusTimer(durationMinutes);
        renderBar();

        // Block navigation
        window.addEventListener('hashchange', onHashChange);
    }

    function deactivate() {
        if (!active) return;
        active = false;
        document.body.classList.remove('focus-mode-active');
        stopAmbient();
        if (focusTimer) { clearInterval(focusTimer); focusTimer = null; }
        if (barEl) { barEl.remove(); barEl = null; }
        window.removeEventListener('hashchange', onHashChange);
        // Save stats
        saveFocusTime();
    }

    function toggle(durationMinutes) {
        if (active) deactivate();
        else activate(durationMinutes);
    }

    function onHashChange(e) {
        if (!active) return;
        if (!confirm('Vous \u00eates en mode focus. Quitter le mode focus ?')) {
            e.preventDefault();
            history.pushState(null, '', e.oldURL);
        } else {
            deactivate();
        }
    }

    // ============================================
    // STATS
    // ============================================
    function saveFocusTime() {
        if (!focusStartTime) return;
        const memberId = (typeof AppState !== 'undefined' && AppState.currentUser?.id) || 'anon';
        const today = new Date().toISOString().split('T')[0];
        const key = `productiveapp_focus_${memberId}_${today}`;
        const data = JSON.parse(localStorage.getItem(key) || '{"minutes":0,"sessions":0}');
        data.minutes += Math.round((Date.now() - focusStartTime) / 60000);
        data.sessions++;
        localStorage.setItem(key, JSON.stringify(data));
        focusStartTime = null;
    }

    function getStats() {
        const memberId = (typeof AppState !== 'undefined' && AppState.currentUser?.id) || 'anon';
        const today = new Date().toISOString().split('T')[0];
        const todayData = JSON.parse(localStorage.getItem(`productiveapp_focus_${memberId}_${today}`) || '{"minutes":0,"sessions":0}');
        let weekMinutes = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const k = `productiveapp_focus_${memberId}_${d.toISOString().split('T')[0]}`;
            const dd = JSON.parse(localStorage.getItem(k) || '{"minutes":0}');
            weekMinutes += dd.minutes;
        }
        return { todayMinutes: todayData.minutes, todaySessions: todayData.sessions, weekMinutes };
    }

    // ============================================
    // RENDER BAR
    // ============================================
    function renderBar() {
        if (!barEl) return;
        const sounds = [
            { id: 'silence', label: 'Silence', icon: '🔇' },
            { id: 'rain', label: 'Pluie', icon: '🌧️' },
            { id: 'cafe', label: 'Caf\u00e9', icon: '☕' },
            { id: 'forest', label: 'For\u00eat', icon: '🌲' }
        ];
        barEl.innerHTML = `
            <div class="focus-bar-left">
                <span class="focus-bar-label">🎯 Mode Focus</span>
                ${focusTimer ? `<span class="focus-bar-timer">${fmtTime(focusTimeRemaining)}</span>` : ''}
            </div>
            <div class="focus-bar-center">
                ${sounds.map(s => `<button class="focus-sound-btn ${currentSound===s.id?'active':''}" onclick="FocusMode.setSound('${s.id}')">${s.icon} ${s.label}</button>`).join('')}
                <input type="range" min="0" max="100" value="${Math.round(volume*100)}" class="focus-volume" onchange="FocusMode.setVolume(this.value/100)" title="Volume">
            </div>
            <div class="focus-bar-right">
                <div class="focus-presets">
                    <button class="focus-preset-btn" onclick="FocusMode.activate(25)">25min</button>
                    <button class="focus-preset-btn" onclick="FocusMode.activate(45)">45min</button>
                    <button class="focus-preset-btn" onclick="FocusMode.activate(60)">60min</button>
                </div>
                <button class="focus-exit-btn" onclick="FocusMode.deactivate()">Quitter le focus</button>
            </div>
        `;
    }

    // ============================================
    // CSS
    // ============================================
    function injectStyles() {
        if (document.getElementById('focus-mode-styles')) return;
        const s = document.createElement('style');
        s.id = 'focus-mode-styles';
        s.textContent = `
            .focus-mode-active #app-sidebar,.focus-mode-active .sidebar-mobile-toggle,.focus-mode-active .quick-add-fab,.focus-mode-active .animation-controls-fab,.focus-mode-active .chatbot-fab,.focus-mode-active .pomo-fab,.focus-mode-active #pomodoro-fab,.focus-mode-active .sidebar-mobile-overlay{display:none!important}
            .focus-mode-active .main-content{margin-left:0!important;transition:margin 0.3s ease}
            .focus-bar{position:fixed;top:0;left:0;right:0;z-index:10000;display:flex;align-items:center;justify-content:space-between;padding:8px 20px;background:var(--bg-secondary,#1a1a2e);border-bottom:1px solid var(--border-color,#333);backdrop-filter:blur(20px);font-family:Inter,system-ui,sans-serif;gap:12px}
            .focus-bar-left{display:flex;align-items:center;gap:12px}
            .focus-bar-label{font-size:13px;font-weight:600;color:var(--accent,#d4af37)}
            .focus-bar-timer{font-size:14px;font-weight:700;color:var(--text-primary,#fff);font-variant-numeric:tabular-nums;background:var(--bg-primary,#111);padding:3px 10px;border-radius:6px}
            .focus-bar-center{display:flex;align-items:center;gap:6px}
            .focus-sound-btn{background:none;border:1px solid var(--border-color,#333);color:var(--text-secondary,#888);padding:4px 10px;border-radius:16px;font-size:11px;cursor:pointer;transition:all 0.2s;white-space:nowrap}
            .focus-sound-btn.active,.focus-sound-btn:hover{border-color:var(--accent,#d4af37);color:var(--accent,#d4af37);background:rgba(212,175,55,0.1)}
            .focus-volume{width:60px;accent-color:var(--accent,#d4af37);cursor:pointer}
            .focus-bar-right{display:flex;align-items:center;gap:8px}
            .focus-presets{display:flex;gap:4px}
            .focus-preset-btn{background:var(--bg-primary,#111);border:1px solid var(--border-color,#333);color:var(--text-secondary,#888);padding:3px 8px;border-radius:6px;font-size:10px;cursor:pointer}
            .focus-preset-btn:hover{border-color:var(--accent,#d4af37);color:var(--text-primary,#fff)}
            .focus-exit-btn{background:#ef4444;color:#fff;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.2s}
            .focus-exit-btn:hover{background:#dc2626}
            @media(max-width:768px){.focus-bar{flex-wrap:wrap;padding:6px 12px}.focus-bar-center{order:3;width:100%;overflow-x:auto}.focus-presets{display:none}}
            @media(prefers-reduced-motion:reduce){.focus-mode-active .main-content{transition:none}}
        `;
        document.head.appendChild(s);
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        if (initialized) return;
        injectStyles();
        // Keyboard shortcut Alt+F
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'f') {
                e.preventDefault();
                toggle();
            }
        });
        initialized = true;
        console.log('[FocusMode] Initialized (Alt+F)');
    }

    return {
        init,
        activate,
        deactivate,
        toggle,
        isActive: () => active,
        getStats,
        setSound: playAmbient,
        setVolume
    };
})();

window.FocusMode = FocusMode;
