/**
 * ════════════════════════════════════════════════════════
 * TEAM VISION — APEX Command Center v3.0
 * Ultra-premium: gradient rings, animated counters,
 * sparklines, glassmorphism, staggered entrances
 * ════════════════════════════════════════════════════════
 */

const TeamVisionView = (function () {
    'use strict';

    let allTasks = [];
    let selectedMemberId = null;

    const PALETTE = {
        'dd8db965-df93-4274-9ae9-8847a58730d3': { c: '#f59e0b', g: '#1c0a00,#7c2d12', label: '👑 Team Lead' },
        '7ea300fa-b086-4215-8641-bdb4dfb0c543': { c: '#6366f1', g: '#1e1b4b,#312e81', label: '⚡ Dev' },
        'fae3f5c9-c032-47f6-a7cd-45c510edf2ec': { c: '#ec4899', g: '#4a0020,#881337', label: '🎯 Stratégie' },
        'a62984e6-d424-4803-a7c7-d55ab0814fad': { c: '#a78bfa', g: '#1e0a4e,#4c1d95', label: '✨ Créa' },
        'dc1b4c74-9da5-48c0-8057-a159cc661cb9': { c: '#22d3ee', g: '#042f3e,#0c4a6e', label: '💫 Ops' },
        '948f61a5-136a-4ff5-b4c2-aeb1e945a3a2': { c: '#f87171', g: '#3d0000,#7f1d1d', label: '❤️ Support' },
        'f74dabfd-4b33-4c6d-847d-f7cb7965ec4a': { c: '#34d399', g: '#021a0e,#064e3b', label: '🔱 Growth' },
    };
    const DEFAULT_PAL = { c: '#64748b', g: '#0f172a,#1e293b', label: '👤 Équipe' };
    function pal(id) { return PALETTE[id] || DEFAULT_PAL; }

    const CIRC = +(2 * Math.PI * 40).toFixed(2); // r=40 → 251.33

    // ── GRADIENT SVG RING ─────────────────────────────────
    function ring(pct, color, size, uid, delay) {
        size  = size  || 88;
        uid   = uid   || 'x';
        delay = delay || 0;
        const offset = +(CIRC * (1 - pct / 100)).toFixed(2);
        const gid = 'tvg' + uid;
        return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="tv3-ring">
            <defs>
                <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="${color}"/>
                    <stop offset="100%" stop-color="${color}77"/>
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="5"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="${color}10" stroke-width="2"/>
            <circle cx="50" cy="50" r="40" fill="none"
                stroke="url(#${gid})" stroke-width="5" stroke-linecap="round"
                stroke-dasharray="${CIRC} ${CIRC}" stroke-dashoffset="${CIRC}"
                transform="rotate(-90 50 50)" class="tv3-arc"
                style="--off:${offset};--dly:${delay}s;filter:drop-shadow(0 0 5px ${color}99)"/>
        </svg>`;
    }

    // ── MINI SPARKLINE (7-day activity) ──────────────────
    function sparkline(tasks, color) {
        const N = 7, now = Date.now();
        const bins = Array(N).fill(0);
        tasks.forEach(t => {
            const d = Math.floor((now - new Date(t.created_at || t.updated_at || now)) / 86400000);
            if (d >= 0 && d < N) bins[N - 1 - d]++;
        });
        if (bins.every(b => b === 0)) { bins[1]=1; bins[3]=2; bins[5]=1; bins[6]=2; }
        const max = Math.max(...bins, 1);
        const W = 58, H = 22;
        const pts = bins.map((v, i) =>
            `${((i / (N - 1)) * W).toFixed(1)},${(H - Math.max(3, (v / max) * H)).toFixed(1)}`
        ).join(' ');
        const hc = 'sp' + color.replace('#', '');
        return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="tv3-spark">
            <defs><linearGradient id="${hc}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </linearGradient></defs>
            <polygon points="${pts} ${W},${H} 0,${H}" fill="url(#${hc})"/>
            <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }

    // ── ANIMATED COUNTER (ease-out cubic) ─────────────────
    function animateCounters(root) {
        root.querySelectorAll('[data-count]').forEach((el, i) => {
            const target = parseInt(el.dataset.count) || 0;
            const dur = 900, t0 = performance.now() + i * 40;
            function step(now) {
                if (now < t0) { requestAnimationFrame(step); return; }
                const p = Math.min((now - t0) / dur, 1);
                const e = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.floor(e * target);
                if (p < 1) requestAnimationFrame(step);
                else el.textContent = target;
            }
            requestAnimationFrame(step);
        });
    }

    // ── RING ENTRANCE (JS-driven CSS transition) ───────────
    function animateRings(root) {
        root.querySelectorAll('.tv3-arc').forEach(arc => {
            const off = arc.style.getPropertyValue('--off');
            const dly = parseFloat(arc.style.getPropertyValue('--dly') || '0') * 1000;
            setTimeout(() => {
                arc.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)';
                arc.style.strokeDashoffset = off;
            }, dly);
        });
    }

    // ── HELPERS ───────────────────────────────────────────
    function members() {
        if (typeof AppConfig === 'undefined') return [];
        return (AppConfig.USERS || []).filter(u => u.id !== 'all');
    }

    function stats(memberId) {
        const t = allTasks.filter(t => t.assigned_to === memberId || t.creator_id === memberId);
        return {
            total:  t.length,
            todo:   t.filter(x => x.status === 'todo').length,
            ip:     t.filter(x => x.status === 'inprogress').length,
            done:   t.filter(x => x.status === 'done').length,
            urgent: t.filter(x => x.status !== 'done' && x.priority?.level === 1).length,
            tasks:  t,
        };
    }

    function pct(done, total) { return total > 0 ? Math.round(done / total * 100) : 0; }

    function esc(s) {
        if (!s) return '';
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function ago(dateStr) {
        if (!dateStr) return '';
        const ms = Date.now() - new Date(dateStr);
        const h = Math.floor(ms / 3600000), d = Math.floor(ms / 86400000);
        if (h < 1) return 'maintenant';
        if (h < 24) return `${h}h`;
        if (d < 7) return `${d}j`;
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    // ── OVERVIEW ─────────────────────────────────────────
    function renderOverview(el) {
        const team = members();
        const total = allTasks.length;
        const done   = allTasks.filter(t => t.status === 'done').length;
        const ip     = allTasks.filter(t => t.status === 'inprogress').length;
        const urgent = allTasks.filter(t => t.status !== 'done' && t.priority?.level === 1).length;
        const completion = pct(done, total);
        const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

        el.innerHTML = `
        <div class="tv3-wrap">
            <div class="tv3-hero">
                <div class="tv3-hero-orb tv3-hero-orb--a"></div>
                <div class="tv3-hero-orb tv3-hero-orb--b"></div>
                <div class="tv3-hero-inner">
                    <div class="tv3-hero-identity">
                        <div class="tv3-apex-badge">APEX</div>
                        <div>
                            <h1 class="tv3-hero-h1">Command <em>Center</em></h1>
                            <p class="tv3-hero-date">${date}</p>
                        </div>
                    </div>
                    <div class="tv3-kpi-row">
                        <div class="tv3-kpi"><div class="tv3-kpi-n" data-count="${team.length}">0</div><div class="tv3-kpi-l">Membres</div></div>
                        <div class="tv3-kpi"><div class="tv3-kpi-n" data-count="${total}">0</div><div class="tv3-kpi-l">Tâches</div></div>
                        <div class="tv3-kpi tv3-kpi--teal"><div class="tv3-kpi-n" data-count="${completion}">0</div><div class="tv3-kpi-l">% Complet</div></div>
                        <div class="tv3-kpi tv3-kpi--amber"><div class="tv3-kpi-n" data-count="${ip}">0</div><div class="tv3-kpi-l">En cours</div></div>
                        <div class="tv3-kpi tv3-kpi--rose"><div class="tv3-kpi-n" data-count="${urgent}">0</div><div class="tv3-kpi-l">Urgentes</div></div>
                    </div>
                    <button class="tv3-btn-refresh" onclick="TeamVisionView.refresh()" title="Actualiser">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    </button>
                </div>
            </div>
            <div class="tv3-grid">
                ${team.map((m, i) => {
                    const s = stats(m.id), p = pal(m.id), c = pct(s.done, s.total);
                    return `
                    <div class="tv3-card" style="--c:${p.c};--i:${i}" onclick="TeamVisionView.selectMember('${m.id}')" role="button" tabindex="0">
                        <div class="tv3-card-aurora"></div>
                        <div class="tv3-card-body">
                            <div class="tv3-card-top">
                                <div class="tv3-ring-box">
                                    ${ring(c, p.c, 82, m.id.slice(0, 8), i * 0.06)}
                                    <div class="tv3-emoji">${m.avatar || '👤'}</div>
                                </div>
                                <div class="tv3-card-meta">
                                    <div class="tv3-card-name">${esc(m.name)}</div>
                                    <div class="tv3-card-role">${p.label}</div>
                                    <div class="tv3-card-score">${c}<sup>%</sup></div>
                                </div>
                            </div>
                            <div class="tv3-stat-row">
                                <div class="tv3-pill"><span class="tv3-pill-n">${s.todo}</span><span class="tv3-pill-l">À faire</span></div>
                                <div class="tv3-pill tv3-pill--amber"><span class="tv3-pill-n">${s.ip}</span><span class="tv3-pill-l">En cours</span></div>
                                <div class="tv3-pill tv3-pill--emerald"><span class="tv3-pill-n">${s.done}</span><span class="tv3-pill-l">Fait</span></div>
                            </div>
                            <div class="tv3-card-foot">
                                ${sparkline(s.tasks, p.c)}
                                ${s.urgent > 0 ? `<div class="tv3-fire">🔥 ${s.urgent}</div>` : '<div class="tv3-clear">✓ Clear</div>'}
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;

        requestAnimationFrame(() => { animateRings(el); animateCounters(el); });
    }

    // ── DETAIL ────────────────────────────────────────────
    function renderDetail(el, memberId) {
        const m = members().find(x => x.id === memberId);
        if (!m) { renderOverview(el); return; }

        const s = stats(memberId), p = pal(memberId);
        const c = pct(s.done, s.total);
        const ipPct = pct(s.ip, s.total), todoPct = pct(s.todo, s.total);

        const recent = [...s.tasks]
            .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
            .slice(0, 10);

        const projs = {};
        s.tasks.forEach(t => {
            const k = t.project_id || '__none__';
            if (!projs[k]) projs[k] = { name: null, tasks: [] };
            projs[k].tasks.push(t);
        });
        Object.keys(projs).forEach(k => {
            if (k === '__none__') { projs[k].name = 'Sans projet'; return; }
            const pr = typeof AppState !== 'undefined' && AppState.projects?.find(x => x.id === k);
            projs[k].name = pr ? pr.name : 'Projet';
        });

        el.innerHTML = `
        <div class="tv3-wrap tv3-detail-wrap">
            <div class="tv3-detail-hero" style="background:linear-gradient(140deg,${p.g})">
                <div class="tv3-detail-ring-bg tv3-detail-ring-bg--1"></div>
                <div class="tv3-detail-ring-bg tv3-detail-ring-bg--2"></div>
                <div class="tv3-detail-ring-bg tv3-detail-ring-bg--3"></div>
                <button class="tv3-back" onclick="TeamVisionView.backToOverview()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Équipe
                </button>
                <div class="tv3-detail-inner">
                    <div class="tv3-detail-ring-wrap">
                        ${ring(c, p.c, 130, memberId.slice(0, 8) + 'D', 0)}
                        <div class="tv3-detail-emoji">${m.avatar || '👤'}</div>
                    </div>
                    <div class="tv3-detail-profile">
                        <h2 class="tv3-detail-name">${esc(m.name)}</h2>
                        <div class="tv3-detail-role" style="color:${p.c}">${p.label}</div>
                        <div class="tv3-detail-score" style="--c:${p.c}">${c}<span>%</span></div>
                        <div class="tv3-detail-subtitle">taux de complétion</div>
                    </div>
                </div>
            </div>
            <div class="tv3-detail-content">
                <div class="tv3-detail-kpis">
                    <div class="tv3-dkpi"><div class="tv3-dkpi-icon" style="background:${p.c}18;color:${p.c}">📋</div><div class="tv3-dkpi-num" data-count="${s.total}">0</div><div class="tv3-dkpi-lbl">Tâches</div></div>
                    <div class="tv3-dkpi"><div class="tv3-dkpi-icon" style="background:#34d39918;color:#34d399">✅</div><div class="tv3-dkpi-num" data-count="${s.done}">0</div><div class="tv3-dkpi-lbl">Terminées</div></div>
                    <div class="tv3-dkpi"><div class="tv3-dkpi-icon" style="background:#fbbf2418;color:#fbbf24">⚡</div><div class="tv3-dkpi-num" data-count="${s.ip}">0</div><div class="tv3-dkpi-lbl">En cours</div></div>
                    <div class="tv3-dkpi"><div class="tv3-dkpi-icon" style="background:#f8717118;color:#f87171">🔥</div><div class="tv3-dkpi-num" data-count="${s.urgent}">0</div><div class="tv3-dkpi-lbl">Urgentes</div></div>
                </div>
                <div class="tv3-seg-section">
                    <div class="tv3-seg-label">Répartition globale</div>
                    <div class="tv3-seg-bar">
                        <div class="tv3-seg-done" style="width:${c}%"></div>
                        <div class="tv3-seg-wip"  style="width:${ipPct}%"></div>
                        <div class="tv3-seg-todo" style="width:${todoPct}%"></div>
                    </div>
                    <div class="tv3-seg-legend">
                        <span><i class="tv3-dot tv3-dot--done"></i>Fait (${s.done})</span>
                        <span><i class="tv3-dot tv3-dot--wip"></i>En cours (${s.ip})</span>
                        <span><i class="tv3-dot tv3-dot--todo"></i>À faire (${s.todo})</span>
                    </div>
                </div>
                <div class="tv3-cols">
                    <div class="tv3-col">
                        <div class="tv3-col-h">Activité récente</div>
                        ${recent.length === 0
                            ? '<div class="tv3-empty">Aucune tâche assignée</div>'
                            : recent.map(t => `
                            <div class="tv3-task tv3-task--${t.status}">
                                <span class="tv3-task-dot"></span>
                                <span class="tv3-task-txt">${esc(t.title || t.text)}</span>
                                <span class="tv3-task-time">${ago(t.updated_at || t.created_at)}</span>
                            </div>`).join('')}
                    </div>
                    <div class="tv3-col">
                        <div class="tv3-col-h">Par projet</div>
                        ${Object.keys(projs).length === 0
                            ? '<div class="tv3-empty">Aucun projet</div>'
                            : Object.entries(projs).map(([, pr]) => {
                                const d = pr.tasks.filter(t => t.status === 'done').length;
                                const pp = pct(d, pr.tasks.length);
                                return `<div class="tv3-proj">
                                    <div class="tv3-proj-top">
                                        <span class="tv3-proj-name">${esc(pr.name)}</span>
                                        <span class="tv3-proj-ct">${d}/${pr.tasks.length}</span>
                                    </div>
                                    <div class="tv3-proj-track"><div class="tv3-proj-fill" style="width:${pp}%;background:${p.c}"></div></div>
                                </div>`;
                            }).join('')}
                    </div>
                </div>
            </div>
        </div>`;

        requestAnimationFrame(() => { animateRings(el); animateCounters(el); });
    }

    // ── PUBLIC API ────────────────────────────────────────
    function render() {
        const el = document.getElementById('view-team-vision');
        if (!el) return;
        selectedMemberId ? renderDetail(el, selectedMemberId) : renderOverview(el);
    }

    async function loadData() {
        try {
            if (typeof ApiDataLoader !== 'undefined' && ApiDataLoader.loadAllTasks) {
                allTasks = await ApiDataLoader.loadAllTasks();
            } else if (typeof ApiTasks !== 'undefined') {
                allTasks = await ApiTasks.getAll({ limit: 500 });
            }
        } catch { allTasks = []; }
    }

    async function refresh() { await loadData(); render(); }
    function selectMember(id) { selectedMemberId = id; render(); }
    function backToOverview() { selectedMemberId = null; render(); }
    function init() {}

    return { init, render, refresh, selectMember, backToOverview };
})();

if (typeof window !== 'undefined') window.TeamVisionView = TeamVisionView;
