/**
 * GIRI TYPERACE v4.0 — MOTIVATION EDITION ⚡
 * Messages d'encouragement · Combos · Milestones · Gamification maximale
 */
const TypeRaceGame = (function() {
    'use strict';

    // ── TEXTES ────────────────────────────────────────────────────────────────
    const TEXTS = {
        debutant: [
            "Le chat mange du poisson.",
            "Bonjour, comment vas tu ?",
            "Je tape vite sur mon clavier.",
            "Le ciel est bleu et beau.",
            "La vie est belle quand on sourit.",
            "J'apprends à taper vite chaque jour.",
            "Mon ami joue aux jeux vidéo le soir.",
            "Il fait beau aujourd'hui, je me promène.",
            "Les fleurs poussent au printemps.",
            "Taper vite est une compétence utile.",
            "Le soleil brille dans le grand ciel bleu.",
            "Je lis un bon livre avant de dormir.",
            "La musique rend la vie plus douce.",
            "Chaque jour est une nouvelle chance.",
            "Je m'entraîne pour taper plus vite.",
        ],
        normal: [
            "La productivité est la clé du succès dans tout projet professionnel sérieux.",
            "Chaque grand voyage commence par un seul petit pas vers l'avant.",
            "Le travail d'équipe permet de transformer des rêves en réalité concrète.",
            "La persévérance est la vertu des forts face aux obstacles de la vie.",
            "Innover c'est voir ce que tout le monde voit et penser différemment.",
            "La simplicité est la sophistication suprême dans la conception moderne.",
            "Chaque journée est une nouvelle opportunité de s'améliorer et de progresser.",
            "Les grandes réalisations nécessitent du temps, de la patience et de la détermination.",
            "La créativité c'est l'intelligence qui s'amuse à résoudre des problèmes.",
            "Le succès appartient à ceux qui travaillent avec passion chaque jour.",
            "La discipline personnelle est le fondement de toute grande carrière réussie.",
            "Celui qui avance lentement mais sûrement finit toujours par atteindre son but.",
            "Apprendre de ses erreurs est la voie la plus rapide vers la sagesse.",
            "Le courage ne consiste pas à ne jamais avoir peur, mais à agir malgré elle.",
            "Un objectif sans plan n'est qu'un rêve, alors commence à agir dès aujourd'hui.",
        ],
        expert: [
            "La persévérance, combinée à une discipline quotidienne rigoureuse, est sans doute la qualité la plus précieuse que puisse cultiver un être humain désireux de réussir dans n'importe quel domaine.",
            "L'architecture des microservices favorise une séparation nette des responsabilités, permettant à chaque équipe de déployer et de maintenir ses composants de façon indépendante et efficace.",
            "Dans le domaine de la cybersécurité, la défense en profondeur consiste à superposer plusieurs couches de protection afin qu'un attaquant ayant contourné la première soit bloqué par les suivantes.",
            "La théorie des graphes, fondée par Euler au dix-huitième siècle à travers le problème des sept ponts de Königsberg, est aujourd'hui au cœur des algorithmes de routage internet modernes.",
            "Le machine learning transforme radicalement notre façon d'interagir avec les données en permettant aux systèmes d'apprendre automatiquement à partir d'exemples sans être explicitement programmés.",
        ]
    };

    // ── PALIERS DE VITESSE ────────────────────────────────────────────────────
    const SPEED_TIERS = [
        { wpm: 0,   label: '🐢 Tortue',  color: '#64748b' },
        { wpm: 20,  label: '🐰 Lapin',   color: '#3b82f6' },
        { wpm: 40,  label: '🐎 Cheval',  color: '#06b6d4' },
        { wpm: 60,  label: '🚗 Voiture', color: '#10b981' },
        { wpm: 80,  label: '✈️ Avion',   color: '#f59e0b' },
        { wpm: 100, label: '🚀 Fusée',   color: '#f97316' },
        { wpm: 130, label: '⚡ Éclair',  color: '#a78bfa' },
        { wpm: 160, label: '🌩️ Foudre', color: '#ec4899' },
    ];

    // ── MESSAGES D'ENCOURAGEMENT EN COURS DE JEU (par tranche WPM) ───────────
    const LIVE_BOOST = [
        { max: 15,  msgs: ['💪 Tu y es, continue !', '🌱 Chaque lettre compte !', '👆 Regarde le texte, prends ton temps !', '❤️ Tu fais super bien !'] },
        { max: 25,  msgs: ['🔥 Ça chauffe !', '💡 Tu prends le rythme !', '⬆️ Tu montes en puissance !', '🎯 Concentration !'] },
        { max: 40,  msgs: ['💨 Tu prends de la vitesse !', '🚀 Continue comme ça !', '✨ Tu assures !', '🏃 En route vers la victoire !'] },
        { max: 60,  msgs: ['🏎️ Tu déchires !', '⚡ Quelle allure !', '🔥 Impressionnant !', '🌟 Tu es dans la zone !'] },
        { max: 999, msgs: ['🚀 Tu voles !', '⚡ Vitesse de la lumière !', '👑 Légende vivante !', '🌩️ Inarrêtable !'] },
    ];

    // ── MESSAGES DE FIN SELON WPM (spécialement pour les débutants) ──────────
    const FINISH_MSGS = [
        {
            max: 15,
            title: '🌱 Premier pas accompli !',
            msgs: [
                'Tu as TERMINÉ ! C\'est ça qui compte. Chaque champion a commencé là où tu es.',
                'Bravo d\'avoir tout tapé jusqu\'au bout ! La régularité bat toujours le talent.',
                'Tu l\'as fait ! Les légendes ont toutes commencé par une première course lente.',
                'Pas vite, mais FINI. C\'est le plus important. Rejouons pour battre ce score !',
            ]
        },
        {
            max: 25,
            title: '🐰 Tu prends ton envol !',
            msgs: [
                'Super ! Tu construis quelque chose de solide. La vitesse vient avec la pratique.',
                'Chaque session tu t\'améliores, même si tu ne le sens pas encore. Continue !',
                'À ce rythme, dans une semaine tu seras deux fois plus rapide. Rejoue !',
                'Beau travail ! Les doigts apprennent à mémoriser les touches. Keep going !',
            ]
        },
        {
            max: 40,
            title: '🐎 Tu galopes !',
            msgs: [
                'Belle vitesse ! Tu es au-dessus de la moyenne mondiale des débutants.',
                'Solide ! Avec de la pratique quotidienne tu peux doubler ça en un mois.',
                'Tu trouves ton rythme. C\'est à cet instant que les vrais champions se révèlent.',
            ]
        },
        {
            max: 60,
            title: '🚗 Tu roules à toute vitesse !',
            msgs: [
                'Excellent ! Tu tapes plus vite que 60% des gens sur Terre. Respect.',
                'Beau niveau ! Tu n\'es plus un débutant, tu es un intermédiaire qui monte.',
                'Impressionnant ! Continue et tu vas franchir le cap des 60 WPM très vite.',
            ]
        },
        {
            max: 999,
            title: '🚀 Tu es une machine !',
            msgs: [
                'WOW. Tu tapes plus vite que 90% de la population. Légende.',
                'À ce niveau tu fais partie des meilleurs typeurs. Respect absolu.',
                'Incroyable. Continue et le record du monde n\'est plus si loin !',
            ]
        },
    ];

    // ── MILESTONES (messages aux étapes 25/50/75%) ────────────────────────────
    const MILESTONES = [
        { pct: 25, icon: '🌟', msg: '25% — Continue !' },
        { pct: 50, icon: '🔥', msg: '50% — À mi-chemin !' },
        { pct: 75, icon: '⚡', msg: '75% — Dernier sprint !' },
    ];

    // ── MESSAGES COMBO (séries de bonnes frappes) ─────────────────────────────
    const COMBO_MSGS = ['🔥', '⚡', '💥', '🌟', '👑', '🚀'];

    // ── PHRASES DU MAÎTRE MAHA GIRI (désactivé en live — uniquement start/finish) ──
    const MAHA_GIRI_MSGS = [
        '🎯 Vise la précision avant la vitesse.',
        '🌱 La régularité bat le talent tous les jours.',
        '💪 Chaque erreur est une leçon.',
        '🏹 Concentre-toi sur le texte.',
        '🧠 Tes doigts apprennent à chaque frappe.',
        '⚡ La vitesse vient avec la pratique.',
    ];

    // ── PHRASE DE FIN DE COURSE ───────────────────────────────────────────────
    const MAHA_GIRI_FINISH = [
        'Belle course ! Rejoue pour t\'améliorer.',
        'Chaque session te rend plus rapide.',
        'La pratique régulière fait la différence.',
    ];

    let mahaGiriIndex = Math.floor(Math.random() * MAHA_GIRI_MSGS.length);
    let nextMahaGiriAt = 0; // en secondes

    // ── TEXTES SOUPLE (phrases inspirantes courtes) ───────────────────────────
    const TEXTS_SOUPLE = [
        "Le Maître Maha Giri croit en toi. Alors ne doute jamais.",
        "Chaque journée est une nouvelle chance de progresser.",
        "La persévérance, c'est la clé du succès.",
        "Avance doucement, mais avance toujours.",
        "Tu es capable de bien plus que tu ne l'imagines.",
        "Chaque effort compte, chaque frappe compte.",
        "Le chemin est long, mais tu le mérites pleinement.",
        "La régularité bat le talent tous les jours.",
        "Tu grandis à chaque session. C'est magnifique.",
        "Respire, concentre-toi, et tape. Tu peux le faire.",
        "Maha Giri dit : tu n'as pas besoin d'être rapide, juste constant.",
        "Chaque erreur est une leçon. Continue sans peur.",
    ];

    // ── ÉTAT ──────────────────────────────────────────────────────────────────
    let container = null;
    let currentText = '';
    let typedIndex = 0;
    let errorMap = {};
    let erroredPositions = new Set(); // positions qui ont été tapées FAUX au moins une fois
    let started = false;
    let finished = false;
    let timer = null;
    let elapsed = 0;
    let level = 'normal';
    let listeners = [];
    let bestWpm = 0;
    let lastWpm = 0;
    let combo = 0;
    let maxCombo = 0;
    let milestoneFired = {};
    let lastLiveBoostWpm = -1;
    let sessionCount = 0;
    let boostTimer = null;

    // ── MOUNT / UNMOUNT ───────────────────────────────────────────────────────
    function mount(el) {
        container = el;
        if (!container) return;
        bestWpm = parseInt(localStorage.getItem('typerace_best_wpm') || '0');
        lastWpm  = parseInt(localStorage.getItem('typerace_last_wpm') || '0');
        sessionCount = parseInt(localStorage.getItem('typerace_sessions') || '0');
        newRace();
    }

    function unmount() {
        listeners.forEach(({ el, ev, fn }) => el.removeEventListener(ev, fn));
        listeners = [];
        if (timer) clearInterval(timer);
        if (boostTimer) clearTimeout(boostTimer);
        if (container) container.innerHTML = '';
        container = null;
    }

    function addListener(el, ev, fn) {
        el.addEventListener(ev, fn);
        listeners.push({ el, ev, fn });
    }

    // ── HELPER : Prénom du joueur (depuis AppState ou GamesState) ────────────
    function getPlayerFirstName() {
        try {
            if (window.AppState && AppState.member && AppState.member.name)
                return AppState.member.name.split(' ')[0];
            if (window.GamesState && GamesState.getPlayer) {
                const p = GamesState.getPlayer();
                if (p && p.name) return p.name.split(' ')[0];
            }
        } catch (e) {}
        return null;
    }

    // Insère le prénom dans un message si disponible, sinon retourne le message tel quel
    function maha(msg) {
        const name = getPlayerFirstName();
        if (!name) return msg.replace(/\{nom\},?\s*/g, '');
        return msg.replace('{nom}', name);
    }

    // ── HELPER MODE SOUPLE : fautes sur espace/virgule tolérées ─────────────
    const SOUPLE_CHARS = new Set([' ', ',', '.', ';', ':', '!', '?', '-', "\u2019", "\u2026"]);
    function charMatch(typedChar, expectedChar) {
        if (typedChar === expectedChar) return true;
        if (level !== 'souple') return false;
        // Tolérer les fautes sur ponctuation et espaces
        return SOUPLE_CHARS.has(typedChar) && SOUPLE_CHARS.has(expectedChar);
    }

    // ── NOUVELLE COURSE ───────────────────────────────────────────────────────
    function newRace() {
        const texts = level === 'souple' ? TEXTS_SOUPLE : (TEXTS[level] || TEXTS.normal);
        currentText = texts[Math.floor(Math.random() * texts.length)];
        typedIndex = 0;
        errorMap = {};
        erroredPositions = new Set();
        started = false;
        finished = false;
        elapsed = 0;
        combo = 0;
        maxCombo = 0;
        milestoneFired = {};
        lastLiveBoostWpm = -1;
        mahaGiriIndex = Math.floor(Math.random() * MAHA_GIRI_MSGS.length);
        nextMahaGiriAt = 9999; // messages live désactivés
        if (timer) clearInterval(timer);
        if (boostTimer) clearTimeout(boostTimer);
        render();
    }

    function setLevel(l) { level = l; newRace(); }

    // ── RENDU PRINCIPAL ───────────────────────────────────────────────────────
    function render() {
        if (!container) return;

        const levelLabels = { debutant: '🌱 Débutant', normal: '🔥 Normal', expert: '💎 Expert', souple: '🕊️ Souple' };
        const progressMsg = lastWpm > 0 && sessionCount > 0
            ? `<div class="tr-progress-hint">Dernière session : <strong>${lastWpm} WPM</strong> — Peux-tu faire mieux ?</div>`
            : sessionCount === 0
            ? `<div class="tr-progress-hint">✨ Première session — Lance-toi, tu vas adorer !</div>`
            : '';

        container.innerHTML = `
        <div class="tr-wrapper">

            <!-- HEADER -->
            <div class="tr-header">
                <div class="tr-logo-block">
                    <div class="tr-logo-icon">⌨️</div>
                    <div class="tr-logo-text">TypeRace</div>
                    <div class="tr-logo-sub">Vitesse · Précision · Record</div>
                </div>
                <div class="tr-controls">
                    <div class="tr-level-tabs">
                        <button class="tr-level-btn ${level==='debutant'?'active':''}" onclick="TypeRaceGame.setLevel('debutant')">🌱 Débutant</button>
                        <button class="tr-level-btn ${level==='normal'?'active':''}" onclick="TypeRaceGame.setLevel('normal')">🔥 Normal</button>
                        <button class="tr-level-btn ${level==='expert'?'active':''}" onclick="TypeRaceGame.setLevel('expert')">💎 Expert</button>
                        <button class="tr-level-btn tr-souple-btn ${level==='souple'?'active':''}" onclick="TypeRaceGame.setLevel('souple')">🕊️ Souple</button>
                    </div>
                    <button class="tr-new-btn" onclick="TypeRaceGame.newRace()">🔄 Nouveau</button>
                </div>
            </div>

            <!-- STATS LIVE -->
            <div class="tr-stats-bar">
                <div class="tr-stat-card tr-stat-wpm-card">
                    <div class="tr-stat-main" id="tr-wpm">0</div>
                    <div class="tr-stat-sub">mots/min</div>
                    <div class="tr-stat-icon">💨</div>
                </div>
                <div class="tr-stat-card">
                    <div class="tr-stat-main" id="tr-acc">100%</div>
                    <div class="tr-stat-sub">précision</div>
                    <div class="tr-stat-icon">🎯</div>
                </div>
                <div class="tr-stat-card">
                    <div class="tr-stat-main" id="tr-time">0:00</div>
                    <div class="tr-stat-sub">temps</div>
                    <div class="tr-stat-icon">⏱️</div>
                </div>
                <div class="tr-stat-card" id="tr-combo-card" style="display:none">
                    <div class="tr-stat-main tr-combo-num" id="tr-combo">0</div>
                    <div class="tr-stat-sub">combo 🔥</div>
                    <div class="tr-stat-icon">✨</div>
                </div>
                ${bestWpm > 0 ? `
                <div class="tr-stat-card tr-record-card">
                    <div class="tr-stat-main tr-record-val">🏆 ${bestWpm}</div>
                    <div class="tr-stat-sub">record</div>
                    <div class="tr-stat-icon">⭐</div>
                </div>` : ''}
            </div>

            <!-- BARRE DE PROGRESSION -->
            <div class="tr-progress-zone">
                <div class="tr-progress-track">
                    <div class="tr-progress-fill" id="tr-progress"></div>
                    <div class="tr-progress-cursor" id="tr-cursor">⌨️</div>
                </div>
                <div class="tr-progress-pct" id="tr-pct">0%</div>
            </div>

            <!-- ZONE ENCOURAGEMENT LIVE -->
            <div class="tr-boost-zone" id="tr-boost"></div>

            <!-- TEXTE À TAPER -->
            <div class="tr-arena">
                <div class="tr-text-display" id="tr-display"></div>
                <div class="tr-start-hint" id="tr-hint">
                    <span class="tr-hint-pulse">▶</span>
                    Commencez à taper pour démarrer…
                </div>
            </div>

            ${progressMsg}

            <!-- INPUT -->
            <input type="text" class="tr-input" id="tr-input"
                autocomplete="off" autocorrect="off" autocapitalize="off"
                spellcheck="false" placeholder="Tapez ici…"/>

            <div class="tr-level-badge">Niveau : ${levelLabels[level]}</div>

        </div>`;

        renderText();
        attachInputEvents();
        setTimeout(() => { const inp = document.getElementById('tr-input'); if (inp) inp.focus(); }, 80);
    }

    // ── TEXTE CARACTÈRE PAR CARACTÈRE ────────────────────────────────────────
    function renderText() {
        const el = document.getElementById('tr-display');
        if (!el) return;
        let html = '';
        for (let i = 0; i < currentText.length; i++) {
            const raw = currentText[i];
            // Garder l'espace réel pour que le navigateur puisse couper les lignes
            const ch = raw === ' ' ? '<span class="tr-space"> </span>' : raw;
            if (i < typedIndex) {
                const cls = errorMap[i] ? 'wrong' : 'correct';
                html += raw === ' '
                    ? `<span class="tr-ch ${cls} tr-space-ch"> </span>`
                    : `<span class="tr-ch ${cls}">${ch}</span>`;
            } else if (i === typedIndex) {
                html += raw === ' '
                    ? `<span class="tr-ch current tr-space-ch"> <span class="tr-caret"></span></span>`
                    : `<span class="tr-ch current">${ch}<span class="tr-caret"></span></span>`;
            } else {
                html += raw === ' '
                    ? `<span class="tr-ch pending tr-space-ch"> </span>`
                    : `<span class="tr-ch pending">${ch}</span>`;
            }
        }
        el.innerHTML = html;
        const cur = el.querySelector('.tr-ch.current');
        if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    // ── BOOST MESSAGE (encouragement live) ───────────────────────────────────
    function showBoost(msg, type) {
        const zone = document.getElementById('tr-boost');
        if (!zone) return;
        const cls = type === 'maha' ? 'tr-boost-msg tr-maha-msg' : 'tr-boost-msg';
        zone.innerHTML = `<div class="${cls}">${msg}</div>`;
        zone.querySelector('.tr-boost-msg').classList.add('pop');
        if (boostTimer) clearTimeout(boostTimer);
        const duration = type === 'maha' ? 3800 : 2200;
        boostTimer = setTimeout(() => { if (zone) zone.innerHTML = ''; }, duration);
    }

    // ── MILESTONE ─────────────────────────────────────────────────────────────
    function checkMilestones(pct) {
        MILESTONES.forEach(m => {
            if (pct >= m.pct && !milestoneFired[m.pct]) {
                milestoneFired[m.pct] = true;
                showBoost(`${m.icon} ${m.msg}`);
            }
        });
    }

    // ── COMBO ─────────────────────────────────────────────────────────────────
    function updateCombo(correct) {
        if (correct) {
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            const card = document.getElementById('tr-combo-card');
            const num  = document.getElementById('tr-combo');
            if (combo >= 10) {
                if (card) card.style.display = '';
                if (num) { num.textContent = combo; num.classList.add('tr-combo-pulse'); setTimeout(() => num.classList.remove('tr-combo-pulse'), 300); }
                if (combo % 15 === 0) showBoost(`${COMBO_MSGS[Math.floor(combo/15) % COMBO_MSGS.length]} Combo x${combo} !`);
            }
        } else {
            if (combo >= 20) showBoost('💔 Combo cassé… Reprends-toi !');
            combo = 0;
            const num = document.getElementById('tr-combo');
            if (num) num.textContent = '0';
        }
    }

    // ── EVENTS INPUT ──────────────────────────────────────────────────────────
    function attachInputEvents() {
        const inp = document.getElementById('tr-input');
        if (!inp) return;

        const onInput = (e) => {
            if (finished) return;
            const typed = e.target.value;

            if (!started && typed.length > 0) {
                started = true;
                const hint = document.getElementById('tr-hint');
                if (hint) { hint.style.opacity = '0'; hint.style.transform = 'translateY(-8px)'; }
                timer = setInterval(() => { elapsed++; updateStats(); }, 1000);
                // Message de démarrage
                setTimeout(() => showBoost('🚀 C\'est parti !'), 300);
            }

            if (typed.length > currentText.length) { e.target.value = typed.slice(0, currentText.length); return; }

            // Rebuild errorMap (état courant pour coloration rouge/vert)
            // + erroredPositions (cumul permanent pour accuracy réelle)
            const newErrors = {};
            let lastCorrect = true;
            for (let i = 0; i < typed.length; i++) {
                if (!charMatch(typed[i], currentText[i])) {
                    newErrors[i] = true;
                    lastCorrect = false;
                    erroredPositions.add(i); // jamais effacé, même si l'user corrige
                }
            }
            errorMap = newErrors;
            typedIndex = typed.length;

            // Combo
            if (typedIndex > 0) updateCombo(lastCorrect && !newErrors[typedIndex - 1]);

            // Progress
            const pct = currentText.length > 0 ? Math.round((typedIndex / currentText.length) * 100) : 0;
            const prog = document.getElementById('tr-progress');
            const cursor = document.getElementById('tr-cursor');
            const pctEl = document.getElementById('tr-pct');
            if (prog) prog.style.width = pct + '%';
            if (cursor) cursor.style.left = `calc(${Math.min(pct, 96)}% - 10px)`;
            if (pctEl) pctEl.textContent = pct + '%';

            // Milestones
            checkMilestones(pct);

            renderText();
            updateStats();

            // Fin : longueur atteinte — MAIS vérification d'accuracy minimale
            const isDone = typed.length >= currentText.length;
            if (isDone) {
                finished = true;
                if (timer) clearInterval(timer);
                const finalAcc = Math.max(0, Math.round(((typed.length - erroredPositions.size) / typed.length) * 100));
                if (finalAcc < 75) {
                    handleFail(finalAcc);
                } else {
                    handleFinish();
                }
            }
        };

        addListener(inp, 'input', onInput);
        addListener(inp, 'keydown', (e) => {
            if (e.key === 'Tab') e.preventDefault();
            if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) e.preventDefault();
        });
        addListener(inp, 'paste', (e) => e.preventDefault());
        const arena = container.querySelector('.tr-arena');
        if (arena) addListener(arena, 'click', () => inp.focus());
    }

    // ── STATS LIVE ────────────────────────────────────────────────────────────
    function getWpm() { return elapsed > 0 ? Math.round((typedIndex / 5) / (elapsed / 60)) : 0; }

    function getAcc() {
        // Compte les positions qui ont été tapées incorrectement AU MOINS UNE FOIS
        // (n'est pas remis à zéro quand on corrige avec backspace)
        return typedIndex > 0 ? Math.max(0, Math.round(((typedIndex - erroredPositions.size) / typedIndex) * 100)) : 100;
    }

    function getSpeedColor(wpm) {
        const tier = [...SPEED_TIERS].reverse().find(t => wpm >= t.wpm);
        return tier ? tier.color : '#64748b';
    }

    function updateStats() {
        const wpm = getWpm();
        const acc = getAcc();
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;

        const wpmEl  = document.getElementById('tr-wpm');
        const accEl  = document.getElementById('tr-acc');
        const timeEl = document.getElementById('tr-time');
        if (wpmEl) { wpmEl.textContent = wpm; wpmEl.style.color = getSpeedColor(wpm); }
        if (accEl) { accEl.textContent = acc + '%'; accEl.style.color = acc >= 95 ? '#10b981' : acc >= 80 ? '#f59e0b' : '#f87171'; }
        if (timeEl) timeEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

        // Phrase du Maître Maha Giri à intervalles réguliers
        if (elapsed > 0 && elapsed >= nextMahaGiriAt) {
            nextMahaGiriAt = elapsed + 20 + Math.floor(Math.random() * 15);
            showBoost(maha(MAHA_GIRI_MSGS[mahaGiriIndex % MAHA_GIRI_MSGS.length]), 'maha');
            mahaGiriIndex++;
            return; // priorité absolue au Maître
        }
        // Boost live toutes les 8 secondes selon WPM
        const tier = Math.floor(wpm / 15);
        if (tier !== lastLiveBoostWpm && elapsed > 0 && elapsed % 8 === 0) {
            lastLiveBoostWpm = tier;
            const bucket = LIVE_BOOST.find(b => wpm < b.max) || LIVE_BOOST[LIVE_BOOST.length - 1];
            showBoost(bucket.msgs[Math.floor(Math.random() * bucket.msgs.length)]);
        }
    }

    // ── ÉCHEC : trop d'erreurs ────────────────────────────────────────────────
    function handleFail(acc) {
        const overlay = document.createElement('div');
        overlay.className = 'tr-finish-overlay';
        overlay.innerHTML = `
        <div class="tr-finish-box" style="border-color:#f87171;box-shadow:0 0 30px rgba(248,113,113,0.2)">
            <div class="tr-finish-medal">❌ Trop d'erreurs</div>
            <div class="tr-finish-motivate" style="color:#f87171;font-size:1.1rem;margin:8px 0 16px">
                Précision : <strong>${acc}%</strong> — Il faut au moins <strong>75%</strong> pour valider.
            </div>
            <div style="font-size:0.9rem;color:var(--text-muted);margin-bottom:20px">
                Tape les bons caractères, ne martèle pas au hasard !
            </div>
            <div class="tr-finish-actions">
                <button class="tr-btn-primary" onclick="this.closest('.tr-finish-overlay').remove();TypeRaceGame.newRace()">
                    🔄 Recommencer
                </button>
                <button class="tr-btn-outline" onclick="this.closest('.tr-finish-overlay').remove();GiriGames.showHome()">
                    🏠 Accueil
                </button>
            </div>
        </div>`;
        if (container) container.appendChild(overlay);
    }

    // ── FIN DE COURSE ─────────────────────────────────────────────────────────
    function handleFinish() {
        const wpm  = elapsed > 0 ? Math.round((currentText.length / 5) / (elapsed / 60)) : 999;
        // Accuracy basée sur les positions jamais tapées faux (cumul réel)
        const acc  = Math.max(0, Math.round(((currentText.length - erroredPositions.size) / currentText.length) * 100));
        const tier = [...SPEED_TIERS].reverse().find(t => wpm >= t.wpm) || SPEED_TIERS[0];
        const isRecord  = wpm > bestWpm;
        const improved  = lastWpm > 0 && wpm > lastWpm;
        const progDelta = lastWpm > 0 ? wpm - lastWpm : 0;

        // Sauvegarder
        if (isRecord) { bestWpm = wpm; localStorage.setItem('typerace_best_wpm', wpm); }
        localStorage.setItem('typerace_last_wpm', wpm);
        localStorage.setItem('typerace_sessions', sessionCount + 1);

        // Giris
        let girisEarned = 0;
        if (typeof GamesState !== 'undefined') {
            const res = GamesState.addScore('typerace', wpm, true);
            girisEarned = res ? res.girisEarned : 0;
        }
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore('typerace', wpm, { won: acc >= 75, duration: elapsed, metadata: { wpm, acc } });
        if (wpm > 100 && typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('speed_demon');
        if (wpm > 60  && typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('typerace_60wpm');
        if (typeof XpFeedback !== 'undefined') XpFeedback.trigger('game_win', { el: container });

        // Message de fin adapté au niveau + citation Maha Giri
        const finishBucket = FINISH_MSGS.find(b => wpm < b.max) || FINISH_MSGS[FINISH_MSGS.length - 1];
        const finishMsg = finishBucket.msgs[Math.floor(Math.random() * finishBucket.msgs.length)];
        const mahaFinishMsg = maha(MAHA_GIRI_FINISH[Math.floor(Math.random() * MAHA_GIRI_FINISH.length)]);

        // Dots de vitesse
        const speedDotsHtml = SPEED_TIERS.map(t => {
            const active = wpm >= t.wpm;
            return `<div class="tr-speed-dot ${active ? 'lit' : ''}"
                style="${active ? `background:${t.color};box-shadow:0 0 8px ${t.color}` : ''}"
                title="${t.label}"></div>`;
        }).join('');

        const overlay = document.createElement('div');
        overlay.className = 'tr-finish-overlay';
        overlay.innerHTML = `
        <div class="tr-finish-box">

            ${isRecord ? '<div class="tr-new-record-banner">🌟 NOUVEAU RECORD PERSONNEL !</div>' : ''}
            ${improved && !isRecord ? `<div class="tr-improved-banner">📈 +${progDelta} WPM par rapport à la dernière session !</div>` : ''}

            <div class="tr-finish-medal">${tier.label}</div>

            <!-- MESSAGE MOTIVANT PERSONNALISÉ -->
            <div class="tr-finish-motivate">${finishMsg}</div>

            <!-- PAROLE DU MAÎTRE MAHA GIRI -->
            <div class="tr-finish-maha">${mahaFinishMsg}</div>

            <!-- STATS -->
            <div class="tr-finish-stats">
                <div class="tr-finish-stat">
                    <div class="tr-finish-val" style="color:${tier.color}">${wpm}</div>
                    <div class="tr-finish-lbl">WPM</div>
                </div>
                <div class="tr-finish-stat">
                    <div class="tr-finish-val" style="color:${acc>=95?'#10b981':acc>=80?'#f59e0b':'#f87171'}">${acc}%</div>
                    <div class="tr-finish-lbl">Précision</div>
                </div>
                <div class="tr-finish-stat">
                    <div class="tr-finish-val">${Math.floor(elapsed/60)}:${(elapsed%60).toString().padStart(2,'0')}</div>
                    <div class="tr-finish-lbl">Temps</div>
                </div>
                <div class="tr-finish-stat">
                    <div class="tr-finish-val" style="color:#a78bfa">${maxCombo}</div>
                    <div class="tr-finish-lbl">Best combo</div>
                </div>
            </div>

            <!-- ÉCHELLE DE VITESSE -->
            <div class="tr-speed-scale">
                <div class="tr-speed-scale-label">Ton niveau de vitesse :</div>
                <div class="tr-speed-dots">${speedDotsHtml}</div>
                <div class="tr-speed-tiers-labels">
                    ${SPEED_TIERS.map(t => `<span style="color:${wpm>=t.wpm?t.color:'#1e3a5f'};font-size:10px">${t.label.split(' ')[0]}</span>`).join('')}
                </div>
            </div>

            <!-- PROCHAINE ÉTAPE -->
            ${wpm < 160 ? (() => {
                const next = SPEED_TIERS.find(t => t.wpm > wpm);
                return next ? `<div class="tr-next-goal">🎯 Prochain objectif : <strong style="color:${next.color}">${next.label}</strong> à ${next.wpm} WPM — encore ${next.wpm - wpm} WPM à gagner !</div>` : '';
            })() : '<div class="tr-next-goal">👑 Tu as atteint le niveau MAXIMUM. Légende absolue.</div>'}

            ${girisEarned > 0 ? `<div class="tr-finish-giris">+${girisEarned} ✨ GIRIS gagnés !</div>` : `<div class="tr-finish-giris" style="opacity:0.5">+${Math.max(5, wpm)} ✨ GIRIS pour avoir terminé !</div>`}

            <div class="tr-finish-actions">
                <button class="tr-btn-primary" onclick="this.closest('.tr-finish-overlay').remove();TypeRaceGame.newRace()">
                    🔄 Rejouer
                </button>
                <button class="tr-btn-outline" onclick="this.closest('.tr-finish-overlay').remove();GiriGames.showHome()">
                    🏠 Accueil
                </button>
            </div>

            ${bestWpm > 0 ? `<div class="tr-finish-record">🏆 Ton record perso : <strong style="color:#f59e0b">${bestWpm} WPM</strong></div>` : ''}
        </div>`;

        if (container) container.appendChild(overlay);
    }

    return { mount, unmount, newRace, setLevel };
})();
