/**
 * GIMOTS v1.0 — Wordle FR pour Giri Games
 * 6 tentatives pour trouver le mot du jour (5 lettres)
 */
const GimotsGame = (function() {
    'use strict';

    const MOTS = [
        'BRAVE','CALME','ESPACE','FORCE','GÉNIE','IMAGE','JOUER','LANCE',
        'MONDE','NOBLE','OCEAN','PIEGE','QUETE','REVER','SABRE','TABLE',
        'UNION','VALSE','WAGON','XENON','YACHT','ZEBRE','ABIME','BILAN',
        'CHAOS','DELTA','ECLAT','FLAIR','GRACE','HEROS','ICONE','JUGER',
        'KARMA','LUEUR','MAGIE','NEXUS','ORDRE','PATIR','QUEST','ROBOT',
        'SIGNE','TREVE','ULTRA','VAGUE','WERRE','YODEL','ZESTE','ATLAS',
        'BONUS','COEUR','DROIT','ELOGE','FUTUR','GLACE','HUMAIN','IDEAL',
        'JOULE','KIWIS','LARGE','MEUTE','NORME','OMBRE','PIVOT','QUAND',
        'RICHE','SEUIL','TIMID','USURE','VITRE','WATER','EXACT','YIELD',
        'ABORD','BOITE','CARTE','DUREE','ECUME','FLEUR','GRAIN','HAIKU',
        'ITEMS','JOLIE','KNACK','LIMON','MORAL','NIVAL','OPALE','PRIMA',
        'RADON','SCENE','TOTEM','USAGE','VIGOR','XENIX','ZARBI','ACIER',
        'BRISE','CIVIL','DAGUE','EFFET','FERRY','GLOIRE','HERBE','INUIT',
        'JAPON','KEOPS','LIEGE','MELEE','NADIR','OGIVE','PLUME','REINE',
        'SABLE','TAPIR','ULVER','VESPA','WINCH','RUGBY','CALIN','DANSE'
    ];

    const VALIDES = [...MOTS, 'ARBRE','BELLE','CHIEN','DEUIL','ENFIN','FABLE',
        'GARDE','HAUTE','IVREE','JARDIN','LIENS','MERCI','NOIRS','OFFRE','PARMI',
        'ROUTE','SOLDE','TERRE','USAGE','VERTU','AUTRE','BLANC','CHOSE','DETTE',
        'ENTRE','FRANC','GENRE','HEURE','IDEES','JUNTE','LIVRE','MONDE','NOTER','POEME'];

    let container = null, mot = '', tentatives = [], courante = '', etat = 'jeu';
    let clavier = {}, listeners = [];

    function mount(el) {
        container = el;
        if (!container) return;
        choisirMot();
        render();
    }

    function unmount() {
        listeners.forEach(({el, ev, fn}) => el.removeEventListener(ev, fn));
        listeners = [];
        if (container) container.innerHTML = '';
        container = null;
    }

    function choisirMot() {
        // Mot du jour basé sur la date
        const jour = new Date().toISOString().slice(0, 10);
        let h = 0;
        for (const c of jour) h = ((h << 5) - h) + c.charCodeAt(0);
        mot = MOTS[Math.abs(h) % MOTS.length];
        tentatives = []; courante = ''; etat = 'jeu'; clavier = {};
    }

    function render() {
        if (!container) return;
        const nbMax = 6, taille = 5;
        // Construire grille
        let grilleHtml = '';
        for (let t = 0; t < nbMax; t++) {
            const essai = tentatives[t] || null;
            const estCourante = t === tentatives.length;
            let rangHtml = '';
            for (let c = 0; c < taille; c++) {
                let lettre = '', cls = '';
                if (essai) {
                    lettre = essai.lettres[c];
                    cls = essai.resultats[c];
                } else if (estCourante && courante[c]) {
                    lettre = courante[c];
                    cls = 'current';
                }
                rangHtml += `<div class="gimots-cell ${cls}" id="gc-${t}-${c}">${lettre}</div>`;
            }
            grilleHtml += `<div class="gimots-row">${rangHtml}</div>`;
        }

        // Clavier
        const rangees = [['A','Z','E','R','T','Y','U','I','O','P'],['Q','S','D','F','G','H','J','K','L','M'],['ENTRER','W','X','C','V','B','N','⌫']];
        const clavierHtml = rangees.map(r => `<div class="gimots-kb-row">${r.map(k => {
            const etatK = clavier[k] || '';
            return `<div class="gimots-key ${etatK} ${k.length > 1?'wide':''}" data-key="${k}">${k}</div>`;
        }).join('')}</div>`).join('');

        container.innerHTML = `
        <div class="gimots-wrapper">
            <div class="gimots-title">🔤 GIMOTS</div>
            <div class="gimots-subtitle">Trouvez le mot en 6 essais · Mot du jour</div>
            <div id="gimots-message" class="gimots-message" style="visibility:hidden;min-height:38px">.</div>
            <div class="gimots-grid">${grilleHtml}</div>
            <div class="gimots-keyboard">${clavierHtml}</div>
        </div>`;

        attachEvents();
    }

    function attachEvents() {
        // Clavier virtuel
        container.querySelectorAll('.gimots-key').forEach(k => {
            const fn = () => handleKey(k.dataset.key);
            k.addEventListener('click', fn);
            listeners.push({ el: k, ev: 'click', fn });
        });
        // Clavier physique
        const onKey = (e) => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            if (e.key === 'Enter') handleKey('ENTRER');
            else if (e.key === 'Backspace') handleKey('⌫');
            else if (/^[a-zA-ZÀ-ÿ]$/.test(e.key)) handleKey(e.key.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
        };
        document.addEventListener('keydown', onKey);
        listeners.push({ el: document, ev: 'keydown', fn: onKey });
    }

    function handleKey(k) {
        if (etat !== 'jeu') return;
        if (k === '⌫') {
            courante = courante.slice(0, -1);
        } else if (k === 'ENTRER') {
            valider();
        } else if (courante.length < 5) {
            courante += k;
        }
        updateCourante();
    }

    function updateCourante() {
        const row = tentatives.length;
        for (let c = 0; c < 5; c++) {
            const cell = document.getElementById(`gc-${row}-${c}`);
            if (!cell) continue;
            const lettre = courante[c] || '';
            cell.textContent = lettre;
            cell.className = `gimots-cell ${lettre ? 'current' : ''}`;
            if (lettre) cell.style.animation = 'none';
        }
    }

    function valider() {
        if (courante.length !== 5) { showMsg('Mot trop court !'); return; }
        const norm = courante.toUpperCase();
        // Calculer résultats
        const resultats = Array(5).fill('absent');
        const motArr = mot.split('');
        const restant = [...motArr];
        // Passe 1 : corrects
        for (let i = 0; i < 5; i++) {
            if (norm[i] === motArr[i]) { resultats[i] = 'correct'; restant[i] = null; }
        }
        // Passe 2 : présents
        for (let i = 0; i < 5; i++) {
            if (resultats[i] === 'correct') continue;
            const idx = restant.indexOf(norm[i]);
            if (idx !== -1) { resultats[i] = 'present'; restant[idx] = null; }
        }
        // Mettre à jour clavier
        for (let i = 0; i < 5; i++) {
            const l = norm[i], r = resultats[i];
            if (!clavier[l] || (clavier[l] === 'absent' && r !== 'absent') || (clavier[l] === 'present' && r === 'correct')) {
                clavier[l] = r;
            }
        }
        tentatives.push({ lettres: norm.split(''), resultats });
        courante = '';
        // Animer cellules
        const row = tentatives.length - 1;
        resultats.forEach((res, c) => {
            setTimeout(() => {
                const cell = document.getElementById(`gc-${row}-${c}`);
                if (cell) { cell.className = `gimots-cell ${res}`; cell.style.animation = ''; }
            }, c * 120);
        });
        // Mettre à jour clavier
        setTimeout(() => updateClavier(), 700);
        // Vérifier fin
        setTimeout(() => {
            if (resultats.every(r => r === 'correct')) {
                etat = 'gagne';
                const girisEarned = Math.max(20, 150 - tentatives.length * 20);
                if (typeof GamesState !== 'undefined') {
                    GamesState.addScore('gimots', girisEarned * 10, true);
                    GamesState.addGiris(girisEarned);
                }
                if (typeof GamesAchievements !== 'undefined') {
                    GamesAchievements.unlock('gimots_win');
                    if (tentatives.length === 1) GamesAchievements.unlock('gimots_genius');
                }
                showFinish(true, girisEarned);
            } else if (tentatives.length >= 6) {
                etat = 'perdu';
                if (typeof GamesState !== 'undefined') GamesState.addScore('gimots', 5, false);
                showFinish(false, 0);
            }
        }, 800);
    }

    function updateClavier() {
        container.querySelectorAll('.gimots-key').forEach(k => {
            const l = k.dataset.key;
            if (clavier[l]) k.className = `gimots-key ${k.classList.contains('wide') ? 'wide' : ''} ${clavier[l]}`;
        });
    }

    function showMsg(msg) {
        const el = document.getElementById('gimots-message');
        if (!el) return;
        el.textContent = msg;
        el.style.visibility = 'visible';
        setTimeout(() => { if (el) el.style.visibility = 'hidden'; }, 1500);
    }

    function showFinish(gagne, girisEarned) {
        const overlay = document.createElement('div');
        overlay.className = 'games-finish-overlay';
        const nbEssais = tentatives.length;
        overlay.innerHTML = `<div class="games-finish-box">
            <div class="finish-icon">${gagne ? (nbEssais <= 2 ? '🧠' : nbEssais <= 4 ? '🏆' : '😅') : '😔'}</div>
            <h2 class="finish-title">${gagne ? 'Bravo !' : 'Perdu !'}</h2>
            <div style="font-size:26px;font-weight:900;color:var(--text-primary);letter-spacing:4px;margin-bottom:12px">${mot}</div>
            ${gagne ? `<div style="color:var(--text-secondary);font-size:14px;margin-bottom:16px">Trouvé en ${nbEssais} essai${nbEssais>1?'s':''} !</div>` : `<div style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">Le mot était <strong style="color:var(--text-primary)">${mot}</strong></div>`}
            ${girisEarned > 0 ? `<div class="finish-giris">+${girisEarned} <span class="giri-coin">GIRIS</span></div>` : ''}
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:20px">Nouveau mot demain !</div>
            <div class="finish-actions">
                <button class="games-btn" onclick="this.closest('.games-finish-overlay').remove();GiriGames.showHome()">🏠 Accueil</button>
            </div>
        </div>`;
        if (container) container.appendChild(overlay);
        else document.body.appendChild(overlay);
    }

    return { mount, unmount };
})();
