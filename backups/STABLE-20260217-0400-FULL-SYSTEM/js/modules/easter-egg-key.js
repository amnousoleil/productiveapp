/**
 * Easter Egg : Clé Dorée 🗝️
 * Apparaît aléatoirement toutes les 5-15 min dans un coin de l'écran
 * Clic → +25 XP via GamificationAPI + animation dorée
 */

const EasterEggKey = (function() {
    'use strict';

    const XP_AMOUNT = 25;
    const MIN_INTERVAL = 5 * 60 * 1000;  // 5 min
    const MAX_INTERVAL = 15 * 60 * 1000; // 15 min
    const VISIBLE_DURATION = 20 * 1000;   // 20 sec pour cliquer

    let keyEl = null;
    let timerId = null;
    let hideTimerId = null;
    let keysFound = parseInt(localStorage.getItem('eek_found') || '0');

    // ── CSS ─────────────────────────────────────────────────────────────
    function _injectCSS() {
        if (document.getElementById('eek-styles')) return;
        const s = document.createElement('style');
        s.id = 'eek-styles';
        s.textContent = `
            @keyframes eekAppear {
                0% { opacity:0; transform: scale(0) rotate(-180deg); }
                70% { transform: scale(1.15) rotate(10deg); }
                100% { opacity:1; transform: scale(1) rotate(0deg); }
            }
            @keyframes eekFloat {
                0%,100% { transform: translateY(0px) rotate(-5deg); }
                50% { transform: translateY(-10px) rotate(5deg); }
            }
            @keyframes eekGlow {
                0%,100% { box-shadow: 0 0 20px rgba(251,191,36,0.5), 0 0 40px rgba(251,191,36,0.2); }
                50% { box-shadow: 0 0 35px rgba(251,191,36,0.8), 0 0 70px rgba(251,191,36,0.35); }
            }
            @keyframes eekCollect {
                0% { opacity:1; transform: scale(1); }
                50% { transform: scale(1.6); opacity:0.9; }
                100% { opacity:0; transform: scale(0) translateY(-60px); }
            }
            @keyframes eekXpFloat {
                0% { opacity:0; transform: translateY(0) scale(0.5); }
                20% { opacity:1; transform: translateY(-20px) scale(1.2); }
                80% { opacity:1; transform: translateY(-70px) scale(1); }
                100% { opacity:0; transform: translateY(-100px) scale(0.8); }
            }

            #eek-key {
                position: fixed;
                z-index: 99999;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: radial-gradient(circle at 35% 35%, #fde68a, #f59e0b, #b45309);
                border: 3px solid #fbbf24;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 26px;
                pointer-events: all;
                user-select: none;
                transition: transform 0.1s ease;
            }
            #eek-key.entering {
                animation: eekAppear 0.6s cubic-bezier(0.4,0,0.2,1) forwards,
                            eekGlow 2s ease-in-out 0.6s infinite;
            }
            #eek-key.floating {
                animation: eekFloat 2.5s ease-in-out infinite,
                            eekGlow 2s ease-in-out infinite;
            }
            #eek-key.collecting {
                animation: eekCollect 0.5s ease-in forwards;
                pointer-events: none;
            }
            #eek-key:hover {
                transform: scale(1.15);
            }
            #eek-tooltip {
                position: fixed;
                z-index: 99998;
                padding: 6px 12px;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(251,191,36,0.4);
                border-radius: 8px;
                color: #fbbf24;
                font-size: 12px;
                font-weight: 600;
                pointer-events: none;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            #eek-key:hover + #eek-tooltip { opacity: 1; }
        `;
        document.head.appendChild(s);
    }

    // ── Positions aléatoires dans les 4 coins ──────────────────────────
    function _randomPosition() {
        const margin = 80;
        const corners = [
            { right: margin, top: margin },
            { left: margin, top: margin },
            { right: margin, bottom: margin + 60 },
            { left: margin, bottom: margin + 60 },
        ];
        const corner = corners[Math.floor(Math.random() * corners.length)];
        // Randomiser un peu dans le coin
        const offsetX = Math.floor(Math.random() * 40);
        const offsetY = Math.floor(Math.random() * 40);
        const pos = {};
        if (corner.right !== undefined) pos.right = (corner.right + offsetX) + 'px';
        if (corner.left !== undefined) pos.left = (corner.left + offsetX) + 'px';
        if (corner.top !== undefined) pos.top = (corner.top + offsetY) + 'px';
        if (corner.bottom !== undefined) pos.bottom = (corner.bottom + offsetY) + 'px';
        return pos;
    }

    // ── Afficher la clé ────────────────────────────────────────────────
    function _show() {
        if (keyEl) return; // déjà affichée

        keyEl = document.createElement('div');
        keyEl.id = 'eek-key';
        keyEl.textContent = '🗝️';
        keyEl.title = '';
        keyEl.className = 'entering';

        const tooltip = document.createElement('div');
        tooltip.id = 'eek-tooltip';
        tooltip.textContent = '+25 XP — Cliquez vite !';

        const pos = _randomPosition();
        Object.assign(keyEl.style, pos);
        Object.assign(tooltip.style, pos);
        if (pos.top) tooltip.style.top = (parseInt(pos.top) + 60) + 'px';
        else if (pos.bottom) tooltip.style.bottom = (parseInt(pos.bottom) + 60) + 'px';

        document.body.appendChild(keyEl);
        document.body.appendChild(tooltip);

        // Après l'animation d'entrée → mode float
        setTimeout(() => {
            if (keyEl) keyEl.className = 'floating';
        }, 700);

        keyEl.addEventListener('click', _collect);

        // Auto-hide si pas cliqué
        hideTimerId = setTimeout(_hide, VISIBLE_DURATION);
    }

    // ── Masquer sans collecter ─────────────────────────────────────────
    function _hide() {
        if (keyEl) { keyEl.remove(); keyEl = null; }
        const tooltip = document.getElementById('eek-tooltip');
        if (tooltip) tooltip.remove();
        clearTimeout(hideTimerId);
        _scheduleNext();
    }

    // ── Collecter la clé ──────────────────────────────────────────────
    async function _collect() {
        if (!keyEl) return;
        clearTimeout(hideTimerId);

        const rect = keyEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Animation collecte
        keyEl.className = 'collecting';
        const tooltip = document.getElementById('eek-tooltip');
        if (tooltip) tooltip.remove();

        // Floating "+25 XP" text
        const xpEl = document.createElement('div');
        xpEl.style.cssText = `
            position:fixed;left:${cx - 35}px;top:${cy - 20}px;
            z-index:100000;font-size:22px;font-weight:800;
            color:#fbbf24;text-shadow:0 0 12px rgba(251,191,36,0.8);
            pointer-events:none;animation:eekXpFloat 2s ease-out forwards;
        `;
        xpEl.textContent = '+25 XP 🗝️';
        document.body.appendChild(xpEl);
        setTimeout(() => xpEl.remove(), 2100);

        // Enregistrer la trouvaille
        keysFound++;
        localStorage.setItem('eek_found', keysFound);

        // Appel API gamification
        try {
            if (window.GamificationAPI && window.GamificationAPI.recordAction) {
                await window.GamificationAPI.recordAction('easter_egg_key', {
                    xp_override: XP_AMOUNT,
                    keys_found: keysFound
                });
            } else {
                // Fallback : dispatch event pour XP feedback system
                window.dispatchEvent(new CustomEvent('xp_earned', {
                    detail: { amount: XP_AMOUNT, label: '🗝️ Clé dorée trouvée !' }
                }));
            }
        } catch(err) {
            console.warn('[EasterEgg] XP call failed:', err);
        }

        // Toast si disponible
        if (window.Toast) {
            window.Toast.success(`🗝️ Clé dorée ! +${XP_AMOUNT} XP — Clé #${keysFound}`);
        } else if (window.XPFeedback) {
            window.XPFeedback.showXP(XP_AMOUNT, '🗝️ Clé dorée !');
        }

        // Supprimer après animation
        setTimeout(() => {
            if (keyEl) { keyEl.remove(); keyEl = null; }
        }, 600);

        _scheduleNext();
    }

    // ── Planifier la prochaine apparition ─────────────────────────────
    function _scheduleNext() {
        const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
        timerId = setTimeout(_show, delay);
    }

    // ── API publique ──────────────────────────────────────────────────
    function init() {
        _injectCSS();
        // Ne pas démarrer si l'utilisateur n'est pas connecté
        const checkReady = setInterval(() => {
            if (document.body.classList.contains('logged-in') ||
                document.getElementById('sidebar')) {
                clearInterval(checkReady);
                _scheduleNext();
            }
        }, 2000);
        // Fallback : démarrer après 10s quoi qu'il arrive
        setTimeout(() => {
            clearInterval(checkReady);
            if (!timerId) _scheduleNext();
        }, 10000);
    }

    function forceShow() { _show(); }

    return { init, forceShow };
})();

if (typeof window !== 'undefined') {
    window.EasterEggKey = EasterEggKey;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => EasterEggKey.init());
    } else {
        EasterEggKey.init();
    }
}
