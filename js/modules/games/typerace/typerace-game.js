/**
 * GIRI TYPERACE v1.0
 */
const TypeRaceGame = (function() {
    'use strict';

    const TEXTS_FR = [
        "La productivite est la cle du succes dans tout projet professionnel serieux.",
        "Chaque grand voyage commence par un seul petit pas vers l'avant.",
        "Le travail d'equipe permet de transformer des reves en realite concrete.",
        "La perseverance est la vertu des forts face aux obstacles de la vie quotidienne.",
        "Innover c'est voir ce que tout le monde voit et penser ce que personne ne pense.",
        "La simplicite est la sophistication supreme dans la conception moderne.",
        "Chaque journee est une nouvelle opportunite de s'ameliorer et de progresser.",
        "Les grandes realisations necessitent du temps de la patience et de la determination.",
        "La creativite c'est l'intelligence qui s'amuse a resoudre des problemes complexes.",
        "Le succes appartient a ceux qui se levent tot et travaillent avec passion."
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
    let started = false, finished = false, startTime = 0, timer = null, elapsed = 0;
    let lang = 'fr', listeners = [];

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
        typedIndex = 0; errors = 0; started = false; finished = false; elapsed = 0;
        if (timer) clearInterval(timer);
        render();
    }

    function render() {
        if (!container) return;
        container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:20px;max-width:800px;margin:0 auto;width:100%;"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;"><button class="games-btn" onclick="TypeRaceGame.setLang('fr')" style="${lang==='fr'?'background:var(--accent-primary,#7c3aed);color:white;':''}">🇫🇷 Français</button><button class="games-btn" onclick="TypeRaceGame.setLang('en')" style="${lang==='en'?'background:var(--accent-primary,#7c3aed);color:white;':''}">🇬🇧 English</button><button class="games-btn" onclick="TypeRaceGame.newRace()">🔄 Nouveau texte</button></div><div class="typerace-text-display" id="tr-display"></div><input type="text" class="typerace-input" id="tr-input" placeholder="Commencez à taper pour démarrer..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/><div class="typerace-stats"><div class="typerace-stat"><div class="stat-num" id="tr-wpm">0</div><div class="stat-label">WPM</div></div><div class="typerace-stat"><div class="stat-num" id="tr-acc">100%</div><div class="stat-label">Précision</div></div><div class="typerace-stat"><div class="stat-num" id="tr-time">0:00</div><div class="stat-label">Temps</div></div><div class="typerace-stat"><div class="stat-num" id="tr-chars">0/${currentText.length}</div><div class="stat-label">Caractères</div></div></div></div>`;
        renderText();
        attachInputEvents();
        setTimeout(() => { const inp = document.getElementById('tr-input'); if (inp) inp.focus(); }, 100);
    }

    function renderText() {
        const el = document.getElementById('tr-display'); if (!el) return;
        let html = '';
        for (let i = 0; i < currentText.length; i++) {
            const ch = currentText[i] === ' ' ? '&nbsp;' : currentText[i];
            if (i < typedIndex) html += `<span class="typerace-char correct">${ch}</span>`;
            else if (i === typedIndex) html += `<span class="typerace-char current">${ch}</span>`;
            else html += `<span class="typerace-char">${ch}</span>`;
        }
        el.innerHTML = html;
    }

    function attachInputEvents() {
        const inp = document.getElementById('tr-input'); if (!inp) return;
        const onInput = (e) => {
            if (finished) return;
            const typed = e.target.value;
            if (!started && typed.length > 0) { started = true; timer = setInterval(() => { elapsed++; updateStats(); }, 1000); }
            if (typed.length > currentText.length) { e.target.value = typed.slice(0, currentText.length); return; }
            errors = 0;
            for (let i = 0; i < typed.length; i++) if (typed[i] !== currentText[i]) errors++;
            typedIndex = typed.length;
            renderText(); updateStats();
            if (typed === currentText) { finished = true; if (timer) clearInterval(timer); handleFinish(); }
        };
        addListener(inp, 'input', onInput);
        addListener(inp, 'keydown', (e) => { if (e.key === 'Tab') e.preventDefault(); });
    }

    function updateStats() {
        const wpm = elapsed > 0 ? Math.round((typedIndex / 5) / (elapsed / 60)) : 0;
        const acc = typedIndex > 0 ? Math.round(((typedIndex - errors) / typedIndex) * 100) : 100;
        const m = Math.floor(elapsed/60), s = elapsed%60;
        const wpmEl=document.getElementById('tr-wpm'), accEl=document.getElementById('tr-acc'), timeEl=document.getElementById('tr-time'), charsEl=document.getElementById('tr-chars');
        if (wpmEl) wpmEl.textContent = wpm; if (accEl) accEl.textContent = acc+'%'; if (timeEl) timeEl.textContent = `${m}:${s.toString().padStart(2,'0')}`; if (charsEl) charsEl.textContent = `${typedIndex}/${currentText.length}`;
    }

    function handleFinish() {
        const wpm = elapsed > 0 ? Math.round((currentText.length / 5) / (elapsed / 60)) : 0;
        const acc = currentText.length > 0 ? Math.round(((currentText.length - errors) / currentText.length) * 100) : 100;
        if (typeof GamesState !== 'undefined') GamesState.addScore('typerace', wpm);
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore('typerace', wpm, { won:true, duration:elapsed, metadata:{wpm,acc} });
        if (wpm > 100 && typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('speed_demon');
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
        overlay.innerHTML = `<div style="background:var(--bg-primary);border-radius:16px;padding:32px;text-align:center;max-width:360px;"><div style="font-size:48px;margin-bottom:12px">⌨️</div><h2 style="color:var(--text-primary);margin-bottom:16px">Terminé !</h2><div style="display:flex;gap:24px;justify-content:center;margin-bottom:20px;"><div style="text-align:center;"><div style="font-size:32px;font-weight:700;color:var(--accent-primary,#7c3aed)">${wpm}</div><div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase">WPM</div></div><div style="text-align:center;"><div style="font-size:32px;font-weight:700;color:var(--accent-primary,#7c3aed)">${acc}%</div><div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase">Précision</div></div><div style="text-align:center;"><div style="font-size:32px;font-weight:700;color:var(--accent-primary,#7c3aed)">${elapsed}s</div><div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase">Temps</div></div></div><div style="display:flex;gap:10px;justify-content:center;"><button onclick="this.closest('[style*=fixed]').remove();TypeRaceGame.newRace()" style="padding:10px 20px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 Rejouer</button><button onclick="this.closest('[style*=fixed]').remove();GiriGames.showHome()" style="padding:10px 20px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:8px;cursor:pointer;">🏠 Accueil</button></div></div>`;
        document.body.appendChild(overlay);
    }

    function setLang(l) { lang = l; newRace(); }

    return { mount, unmount, newRace, setLang };
})();
