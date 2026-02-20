/**
 * Tunnel Club — Notifications temps réel
 * Écoute les événements WebSocket tenant et affiche des toasts
 * Cache buster: v=100
 */

const TunnelNotifications = (function() {
    'use strict';

    let initialized = false;

    // ─── CSS inline (injecté une seule fois) ───────────────

    function injectStyles() {
        if (document.getElementById('tn-styles')) return;
        const s = document.createElement('style');
        s.id = 'tn-styles';
        s.textContent = `
            #tn-container {
                position: fixed;
                top: 72px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
                max-width: 360px;
            }
            .tn-toast {
                background: #1a1a24;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 14px 16px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                opacity: 0;
                transform: translateX(120%);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: auto;
                cursor: pointer;
            }
            .tn-toast.show {
                opacity: 1;
                transform: translateX(0);
            }
            .tn-toast.hide {
                opacity: 0;
                transform: translateX(120%);
            }
            .tn-icon {
                width: 36px;
                height: 36px;
                border-radius: 9px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }
            .tn-icon.lead  { background: rgba(99,102,241,0.2); }
            .tn-icon.sale  { background: rgba(34,197,94,0.2); }
            .tn-icon.student { background: rgba(234,179,8,0.2); }
            .tn-icon.warning { background: rgba(239,68,68,0.15); }
            .tn-body { flex: 1; min-width: 0; }
            .tn-title {
                font-size: 13px;
                font-weight: 600;
                color: #e8e8f0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .tn-detail {
                font-size: 12px;
                color: rgba(232,232,240,0.55);
                margin-top: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .tn-time {
                font-size: 11px;
                color: rgba(232,232,240,0.35);
                margin-top: 4px;
            }
            /* KPI flash */
            .tn-kpi-flash {
                animation: tn-flash 0.6s ease;
            }
            @keyframes tn-flash {
                0%  { background: rgba(34,197,94,0.25); }
                100%{ background: transparent; }
            }
            /* Badge pulsant sur l'onglet Tunnel Club */
            .tn-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 18px;
                height: 18px;
                background: #ef4444;
                border-radius: 9px;
                font-size: 10px;
                font-weight: 700;
                color: #fff;
                padding: 0 4px;
                margin-left: 6px;
                animation: tn-badge-pop 0.3s ease;
            }
            @keyframes tn-badge-pop {
                0%  { transform: scale(0); }
                70% { transform: scale(1.2); }
                100%{ transform: scale(1); }
            }
        `;
        document.head.appendChild(s);
    }

    function getContainer() {
        let c = document.getElementById('tn-container');
        if (!c) {
            c = document.createElement('div');
            c.id = 'tn-container';
            document.body.appendChild(c);
        }
        return c;
    }

    // ─── Affichage toast ───────────────────────────────────

    const ICONS = { lead: '👤', sale: '💰', student: '🎓', warning: '⚠️', default: '🔔' };

    function showToast(type, title, detail, duration = 6000) {
        const container = getContainer();
        const iconType = type in ICONS ? type : 'default';

        const toast = document.createElement('div');
        toast.className = 'tn-toast';

        const now = new Date();
        const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        toast.innerHTML = `
            <div class="tn-icon ${iconType}">${ICONS[iconType]}</div>
            <div class="tn-body">
                <div class="tn-title">${escHtml(title)}</div>
                ${detail ? `<div class="tn-detail">${escHtml(detail)}</div>` : ''}
                <div class="tn-time">${timeStr}</div>
            </div>
        `;

        toast.addEventListener('click', () => dismissToast(toast));
        container.appendChild(toast);

        // Déclencher l'animation d'entrée
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });

        // Auto-dismiss
        const timer = setTimeout(() => dismissToast(toast), duration);
        toast._timer = timer;
    }

    function dismissToast(toast) {
        clearTimeout(toast._timer);
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 350);
    }

    // ─── Mise à jour KPI dans le dashboard ────────────────

    function flashKpiElement(selector) {
        const el = document.querySelector(selector);
        if (el) {
            el.classList.remove('tn-kpi-flash');
            void el.offsetWidth; // reflow
            el.classList.add('tn-kpi-flash');
        }
    }

    function incrementKpiCounter(selector, delta = 1) {
        const el = document.querySelector(selector);
        if (!el) return;
        const current = parseInt(el.textContent?.replace(/[^0-9]/g, '') || '0', 10);
        el.textContent = (current + delta).toLocaleString('fr-FR');
        flashKpiElement(selector);
    }

    // ─── Badge sur l'onglet Tunnel Club ───────────────────

    let unreadCount = 0;

    function incrementBadge() {
        unreadCount++;
        const sidebarItem = document.querySelector('[data-view="tunnelClub"] .sidebar-label, [href*="tunnelClub"]');
        if (sidebarItem) {
            let badge = sidebarItem.querySelector('.tn-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tn-badge';
                sidebarItem.appendChild(badge);
            }
            badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
        }
    }

    function clearBadge() {
        unreadCount = 0;
        document.querySelectorAll('.tn-badge').forEach(b => b.remove());
    }

    // ─── Handlers événements ──────────────────────────────

    function handleNewLead(payload) {
        showToast('lead', payload.message || 'Nouveau lead', payload.detail);
        incrementKpiCounter('[data-kpi="leads"]');
        incrementBadge();

        // Rafraîchir la liste de leads si visible
        if (typeof TunnelStats !== 'undefined' && TunnelStats.refresh) {
            TunnelStats.refresh({ tunnelId: payload.tunnelId });
        }
    }

    function handleNewSale(payload) {
        showToast('sale', `🎉 ${payload.message || 'Nouvelle vente !'}`, payload.detail, 8000);
        incrementKpiCounter('[data-kpi="sales"]');

        // Incrémenter le revenu affiché
        const revenueEl = document.querySelector('[data-kpi="revenue"]');
        if (revenueEl && payload.amountCents) {
            const current = parseFloat(revenueEl.textContent?.replace(/[^0-9.,]/g, '').replace(',', '.') || '0');
            const added = payload.amountCents / 100;
            revenueEl.textContent = (current + added).toFixed(2).replace('.', ',') + ' €';
            flashKpiElement('[data-kpi="revenue"]');
        }

        incrementBadge();
        playSound('cash');
    }

    function handleNewStudent(payload) {
        showToast('student', payload.message || 'Nouvel étudiant', payload.detail);
        incrementKpiCounter('[data-kpi="students"]');
        incrementBadge();
    }

    function handleStorageWarning(payload) {
        showToast('warning', payload.message, payload.detail, 10000);
    }

    // ─── Son de caisse (discret) ───────────────────────────

    function playSound(type) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'cash') {
                // Deux bips courts ascendants
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.25);
            }
        } catch (e) {
            // AudioContext non disponible, on ignore
        }
    }

    // ─── Initialisation ───────────────────────────────────

    function init() {
        if (initialized) return;
        if (typeof WebSocketService === 'undefined') {
            // Réessayer dans 1s si le service n'est pas encore chargé
            setTimeout(init, 1000);
            return;
        }

        injectStyles();
        initialized = true;

        WebSocketService.on('tunnel:new_lead',          (p) => handleNewLead(p));
        WebSocketService.on('tunnel:new_sale',          (p) => handleNewSale(p));
        WebSocketService.on('formation:new_student',    (p) => handleNewStudent(p));
        WebSocketService.on('storage:quota_warning',    (p) => handleStorageWarning(p));

        // Effacer le badge quand l'utilisateur arrive sur Tunnel Club
        document.addEventListener('viewChanged', (e) => {
            if (e.detail?.view === 'tunnelClub') clearBadge();
        });

        console.log('[TunnelNotifications] ✅ Initialisé — écoute WS tenant');
    }

    // ─── API publique ─────────────────────────────────────

    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    // Démarrage automatique
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init, showToast, clearBadge };
})();

if (typeof window !== 'undefined') window.TunnelNotifications = TunnelNotifications;
