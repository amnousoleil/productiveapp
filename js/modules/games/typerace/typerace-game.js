/**
 * GIRI TYPERACE v2.0 — Accents corrigés, design premium, intégration GIRIS
 */
const TypeRaceGame = (function() {
    'use strict';

    const TEXTS_FR = [
        "La productivité est la clé du succès dans tout projet professionnel sérieux.",
        "Chaque grand voyage commence par un seul petit pas vers l'avant.",
        "Le travail d'équipe permet de transformer des rêves en réalité concrète.",
        "La persévérance est la vertu des forts face aux obstacles de la vie quotidienne.",
        "Innover c'est voir ce que tout le monde voit et penser ce que personne ne pense.",
        "La simplicité est la sophistication suprême dans la conception moderne.",
        "Chaque journée est une nouvelle opportunité de s'améliorer et de progresser.",
        "Les grandes réalisations nécessitent du temps, de la patience et de la détermination.",
        "La créativité c'est l'intelligence qui s'amuse à résoudre des problèmes complexes.",
        "Le succès appartient à ceux qui se lèvent tôt et travaillent avec passion.",
        "L'organisation est la clé d'une vie équilibrée et d'une carrière épanouissante.",
        "Chaque obstacle est une opportunité déguisée de se surpasser et de grandir.",
        "La discipline est le pont entre les objectifs et les accomplissements durables.",
        "Celui qui veut atteindre ses rêves doit d'abord croire en ses propres capacités.",
        "Le courage n'est pas l'absence de peur, mais la décision d'agir malgré elle."
    ];

    const TEXTS_EN = [
        "The quick brown fox jumps over the lazy dog in the sunny meadow today.",
        "Productivity is not about doing more things but doing the right things well.",
        "Every expert was once a beginner who refused to give up on their dreams.",
        "The best way to predict the future is to create it with your own hands.",
        "Success is not the key to happiness but happiness is the key to success.",
        "Hard work beats talent when talent fails to work as hard as it should.",
        "Quality is not an act it is a habit that must be cultivated every single day.",
        "Innovation distinguishes between a leader and a follower in any industry.",
        "In the middle of every difficulty lies opportunity waiting to be discovered.",
        "The only limit to our realization of tomorrow will be our doubts of today."
    ];

    let container = null, currentText = '', typedIndex = 0, errors = 0;
    let started = false, finished = false, timer = null, elapsed = 0;
    let lang = 'fr', listeners = [];
    let errorMap = {};

    function mount(el) { container = el; if (!container) return; newRace(); }

    function unmount() {
        listeners.forEach(({el, ev, fn}) => el.removeEventListener(ev, fn));
        listeners = [];
        if (timer) clearInterval(timer);
        if (container) container.innerHTML = '';
        container = null;
    }

    function addListener(el, ev, fn) { el.addEventListener(ev, fn); listeners.push({el, ev, fn}); }

    function newRace() {
        const texts = lang === 'fr' ? TEXTS_FR : TEXTS_EN;
        currentText = texts[Math.floor(Math.random() * texts.length)];
        typedIndex = 0; errors = 0; errorMap = {}; started = false; finished = false; elapsed = 0;
        if (timer) clearInterval(timer);
        render();
    }

    function render() {
        if (!container) return;
        container.innerHTML = `
        <div class="typerace-wrapper">
            <div class="typerace-toolbar">
                <div class="typerace-lang-btns">
                    <button class="games-btn ${lang==='fr'?'active':''}" onclick="TypeRaceGame.setLang('fr')">🇫🇷 Français</button>
                    <button class="games-btn ${lang==='en'?'active':''}" onclick="TypeRaceGame.setLang('en')">🇬🇧 English</button>
                </div>
                <button class="games-btn" onclick="TypeRaceGame.newRace()">🔄 Nouveau texte</button>
            </div>
            <div class="typerace-text-display" id="tr-display"></div>
            <div class="typerace-input-wrap">
                <input type="text" class="typerace-input" id="tr-input"
                    placeholder="Commencez à taper pour démarrer…"
                    autocomplete="off" spellcheck="false"/>
            </div>
            <div class="typerace-stats">
                <div class="typerace-stat">
                    <div class="stat-num" id="tr-wpm">0</div>
                    <div class="stat-label">WPM</div>
                </div>
                <div class="typerace-stat">
                    <div class="stat-num" id="tr-acc">100%</div>
                    <div class="stat-label">Précision</div>
                </div>
                <div class="typerace-stat">
                    <div class="stat-num" id="tr-time">0:00</div>
                    <div class="stat-label">Temps</div>
                </div>
                <div class="typerace-stat">
                    <div class="stat-num" id="tr-chars">0/${currentText.length}</div>
                    <div class="stat-label">Caractères</div>
                </div>
            </div>
            <div class="typerace-progress-bar">
                <div class="typerace-progress-fill" id="tr-progress" style="width:0%"></div>
            </div>
        </div>`;
        renderText();
        attachInputEvents();
        setTimeout(() => { const inp = document.getElementById('tr-input'); if (inp) inp.focus(); }, 100);
    }

    function renderText() {
        const el = document.getElementById('tr-display');
        if (!el) return;
        let html = '';
        for (let i = 0; i < currentText.length; i++) {
            const ch = currentText[i] === ' ' ? '&nbsp;' : currentText[i];
            if (i < typedIndex) {
                const cls = errorMap[i] ? 'typerace-char wrong' : 'typerace-char correct';
                html += `<span class="${cls}">${ch}</span>`;
            } else if (i === typedIndex) {
                html += `<span class="typerace-char current">${ch}</span>`;
            } else {
                html += `<span class="typerace-char">${ch}</span>`;
            }
        }
        el.innerHTML = html;
        // Scroll cursor visible
        const cur = el.querySelector('.current');
        if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    function attachInputEvents() {
        const inp = document.getElementById('tr-input');
        if (!inp) return;
        const onInput = (e) => {
            if (finished) return;
            const typed = e.target.value;
            if (!started && typed.length > 0) {
                started = true;
                timer = setInterval(() => { elapsed++; updateStats(); }, 1000);
            }
            if (typed.length > currentText.length) { e.target.value = typed.slice(0, currentText.length); return; }
            errors = 0;
            for (let i = 0; i < typed.length; i++) {
                if (typed[i] !== currentText[i]) { errors++; errorMap[i] = true; }
                else if (!errorMap[i]) errorMap[i] = false;
            }
            typedIndex = typed.length;
            // Update progress
            const prog = document.getElementById('tr-progress');
            if (prog) prog.style.width = `${Math.round((typedIndex / currentText.length) * 100)}%`;
            renderText(); updateStats();
            if (typed === currentText) { finished = true; if (timer) clearInterval(timer); handleFinish(); }
        };
        addListener(inp, 'input', onInput);
        addListener(inp, 'keydown', (e) => { if (e.key === 'Tab') e.preventDefault(); });
    }

    function updateStats() {
        const wpm = elapsed > 0 ? Math.round((typedIndex / 5) / (elapsed / 60)) : 0;
        const acc = typedIndex > 0 ? Math.round(((typedIndex - errors) / typedIndex) * 100) : 100;
        const m = Math.floor(elapsed / 60), s = elapsed % 60;
        const wpmEl = document.getElementById('tr-wpm');
        const accEl = document.getElementById('tr-acc');
        const timeEl = document.getElementById('tr-time');
        const charsEl = document.getElementById('tr-chars');
        if (wpmEl) wpmEl.textContent = wpm;
        if (accEl) accEl.textContent = acc + '%';
        if (timeEl) timeEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        if (charsEl) charsEl.textContent = `${typedIndex}/${currentText.length}`;
    }

    function handleFinish() {
        const wpm = elapsed > 0 ? Math.round((currentText.length / 5) / (elapsed / 60)) : 0;
        const acc = currentText.length > 0 ? Math.round(((currentText.length - errors) / currentText.length) * 100) : 100;
        let girisEarned = 0;
        if (typeof GamesState !== 'undefined') {
            const res = GamesState.addScore('typerace', wpm, true);
            girisEarned = res ? res.girisEarned : 0;
        }
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore('typerace', wpm, { won: true, duration: elapsed, metadata: { wpm, acc } });
        if (wpm > 100 && typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('speed_demon');
        if (wpm > 60 && typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('typerace_60wpm');
        // Notif XP
        if (typeof XpFeedback !== 'undefined') XpFeedback.trigger('game_win', { el: container });

        const overlay = document.createElement('div');
        overlay.className = 'games-finish-overlay';
        const medal = wpm >= 100 ? '⚡' : wpm >= 70 ? '🏆' : wpm >= 40 ? '🥈' : '🎯';
        overlay.innerHTML = `<div class="games-finish-box">
            <div class="finish-icon">${medal}</div>
            <h2 class="finish-title">Course terminée !</h2>
            <div class="finish-stats-row">
                <div class="finish-stat"><div class="finish-val">${wpm}</div><div class="finish-lbl">WPM</div></div>
                <div class="finish-stat"><div class="finish-val">${acc}%</div><div class="finish-lbl">Précision</div></div>
                <div class="finish-stat"><div class="finish-val">${elapsed}s</div><div class="finish-lbl">Temps</div></div>
            </div>
            <div class="finish-giris">+${girisEarned} <span class="giri-coin">GIRIS</span></div>
            <div class="finish-actions">
                <button class="games-btn-primary" onclick="this.closest('.games-finish-overlay').remove();TypeRaceGame.newRace()">🔄 Rejouer</button>
                <button class="games-btn" onclick="this.closest('.games-finish-overlay').remove();GiriGames.showHome()">🏠 Accueil</button>
            </div>
        </div>`;
        if (container) container.appendChild(overlay);
        else document.body.appendChild(overlay);
    }

    function setLang(l) { lang = l; newRace(); }

    return { mount, unmount, newRace, setLang };
})();
