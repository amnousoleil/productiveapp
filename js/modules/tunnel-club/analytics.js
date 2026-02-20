/**
 * ================================================
 * TUNNEL ANALYTICS v1.0
 * Dashboard analytics tenant — revenus, leads, tunnels, formations
 * ================================================
 */

const TunnelAnalytics = (function() {
    'use strict';

    let overlay = null;
    let currentPeriod = '30d';
    let chartData = null;

    // ── API ──────────────────────────────────────

    async function _api(path) {
        const token = (typeof ApiTokens !== 'undefined' && ApiTokens.getToken && ApiTokens.getToken())
            || localStorage.getItem('productiveapp_auth_token')
            || localStorage.getItem('productiveapp_token');
        const r = await fetch('/api/v1/tenant-analytics' + path, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        return r.json();
    }

    // ── OUVERTURE / FERMETURE ─────────────────────

    function open() {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'tc-wizard-overlay';
            overlay.id = 'tc-analytics-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        }
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        _render(currentPeriod);
    }

    function close() {
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ── RENDU PRINCIPAL ───────────────────────────

    async function _render(period) {
        if (!overlay) return;
        overlay.innerHTML = _skeleton();

        const res = await _api('/dashboard?period=' + period);
        if (!res.success) {
            overlay.innerHTML = `<div class="tc-wizard"><div style="padding:40px;text-align:center;color:var(--text-muted)">${res.error || 'Erreur de chargement'}</div></div>`;
            return;
        }

        const d = res.data;
        chartData = d.revenue_curve;

        overlay.innerHTML = `
            <div class="tc-wizard tca-panel">
                <div class="tc-wizard-header">
                    <h2 class="tc-wizard-title">📊 Analytics</h2>
                    <div class="tca-period-tabs">
                        ${['7d','30d','90d','1y'].map(p =>
                            `<button class="tca-period-btn${p===period?' active':''}" data-period="${p}">
                                ${{  '7d':'7 jours','30d':'30 jours','90d':'90 jours','1y':'1 an'}[p]}
                            </button>`
                        ).join('')}
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="tc-btn tc-btn-secondary tc-btn-sm" id="tca-export-leads">⬇ Leads CSV</button>
                        <button class="tc-btn tc-btn-secondary tc-btn-sm" id="tca-export-sales">⬇ Ventes CSV</button>
                        <button class="tc-wizard-close" id="tca-close">✕</button>
                    </div>
                </div>

                <div class="tca-body">
                    ${_renderKpis(d.kpis, period)}
                    ${_renderChart()}
                    <div class="tca-two-cols">
                        ${_renderTopTunnels(d.top_tunnels)}
                        ${_renderTopFormations(d.top_formations)}
                    </div>
                </div>
            </div>
        `;

        _attachEvents();
        requestAnimationFrame(() => {
            _drawChart(chartData, period);
        });
    }

    // ── SQUELETTE ─────────────────────────────────

    function _skeleton() {
        return `<div class="tc-wizard tca-panel">
            <div class="tc-wizard-header">
                <h2 class="tc-wizard-title">📊 Analytics</h2>
                <button class="tc-wizard-close" id="tca-close-sk">✕</button>
            </div>
            <div class="tca-body" style="padding:32px">
                ${[1,2,3,4].map(() => '<div class="tc-skeleton" style="height:80px;border-radius:12px;margin-bottom:16px;"></div>').join('')}
                <div class="tc-skeleton" style="height:160px;border-radius:12px;"></div>
            </div>
        </div>`;
    }

    // ── KPIs ──────────────────────────────────────

    function _renderKpis(k, period) {
        const eur = n => (Number(n) / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
        const num = n => Number(n).toLocaleString('fr-FR');
        const pLabels = { '7d':'7 j', '30d':'30 j', '90d':'90 j', '1y':'1 an' };
        const p = pLabels[period] || period;

        const kpis = [
            { icon:'💰', label:'Revenus ' + p, value: eur(k.period_revenue_cents), sub:'Total : ' + eur(k.total_revenue_cents), color:'#10b981' },
            { icon:'📧', label:'Leads ' + p,   value: num(k.period_leads),          sub: num(k.total_tunnels) + ' tunnels actifs', color:'#6366f1' },
            { icon:'💳', label:'Ventes ' + p,  value: num(k.period_sales),           sub: num(k.total_formations) + ' formations', color:'#f59e0b' },
            { icon:'🎯', label:'Conversion',   value: k.conversion_rate + '%',       sub: num(k.total_students) + ' étudiants total', color:'#ec4899' },
        ];

        return `<div class="tca-kpi-grid">${kpis.map(kpi => `
            <div class="tca-kpi-card">
                <div class="tca-kpi-icon" style="color:${kpi.color}">${kpi.icon}</div>
                <div class="tca-kpi-value" style="color:${kpi.color}">${kpi.value}</div>
                <div class="tca-kpi-label">${kpi.label}</div>
                <div class="tca-kpi-sub">${kpi.sub}</div>
            </div>`).join('')}
        </div>`;
    }

    // ── CHART CANVAS ──────────────────────────────

    function _renderChart() {
        return `
            <div class="tca-chart-block">
                <div class="tca-chart-header">
                    <span class="tca-chart-title">📈 Revenus dans le temps</span>
                    <div class="tca-chart-legend">
                        <span><span class="tca-dot" style="background:#10b981"></span>Revenus</span>
                        <span><span class="tca-dot" style="background:#6366f1"></span>Ventes</span>
                    </div>
                </div>
                <canvas id="tca-chart" height="140"></canvas>
            </div>`;
    }

    function _drawChart(data, period) {
        const canvas = document.getElementById('tca-chart');
        if (!canvas || !canvas.getContext) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.offsetWidth || 900;
        const H = 140;
        canvas.width = W;
        canvas.height = H;

        if (!data || data.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.font = '13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Aucune vente sur cette période', W / 2, H / 2);
            return;
        }

        // Remplir les jours manquants
        const days = PERIOD_DAYS_FRONT[period] || 30;
        const filled = _fillDays(data, days);
        const labels = filled.map(r => _shortDate(r.date));
        const revenues = filled.map(r => Number(r.revenue_cents || 0));
        const sales = filled.map(r => Number(r.sales_count || 0));
        const maxR = Math.max(...revenues, 1);
        const maxS = Math.max(...sales, 1);

        const pad = { l: 48, r: 16, t: 12, b: 28 };
        const cw = W - pad.l - pad.r;
        const ch = H - pad.t - pad.b;
        const n = filled.length;

        // Grille
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 3; i++) {
            const y = pad.t + (ch / 3) * i;
            ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
        }

        // Valeur max axe Y
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(_fmtEur(maxR), pad.l - 4, pad.t + 4);

        function drawArea(vals, max, color) {
            if (n < 2) return;
            const xs = vals.map((_, i) => pad.l + (i / (n - 1)) * cw);
            const ys = vals.map(v => pad.t + ch - (v / max) * ch);

            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            xs.forEach((x, i) => { if (i === 0) ctx.moveTo(x, ys[i]); else ctx.lineTo(x, ys[i]); });
            ctx.stroke();

            ctx.beginPath();
            xs.forEach((x, i) => { if (i === 0) ctx.moveTo(x, ys[i]); else ctx.lineTo(x, ys[i]); });
            ctx.lineTo(xs[xs.length - 1], pad.t + ch);
            ctx.lineTo(xs[0], pad.t + ch);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, pad.t, 0, H);
            grad.addColorStop(0, color + '55');
            grad.addColorStop(1, color + '00');
            ctx.fillStyle = grad;
            ctx.fill();
        }

        drawArea(revenues, maxR, '#10b981');
        drawArea(sales.map(s => s / maxS * maxR), maxR, '#6366f1'); // normalise sur même échelle

        // Labels X (afficher seulement quelques dates)
        const step = Math.max(1, Math.floor(n / 8));
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        filled.forEach((_, i) => {
            if (i % step === 0 || i === n - 1) {
                const x = pad.l + (i / (n - 1)) * cw;
                ctx.fillText(labels[i], x, H - 8);
            }
        });
    }

    const PERIOD_DAYS_FRONT = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };

    function _fillDays(data, days) {
        const map = {};
        data.forEach(r => { map[r.date?.substring(0, 10)] = r; });
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000);
            const key = d.toISOString().substring(0, 10);
            result.push(map[key] || { date: key, revenue_cents: 0, sales_count: 0 });
        }
        return result;
    }

    function _shortDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return (d.getMonth() + 1) + '/' + d.getDate();
    }

    function _fmtEur(cents) {
        const eur = cents / 100;
        return eur >= 1000 ? (eur / 1000).toFixed(1) + 'k€' : eur.toFixed(0) + '€';
    }

    // ── TOP TUNNELS ───────────────────────────────

    function _renderTopTunnels(tunnels) {
        if (!tunnels?.length) return `<div class="tca-section"><h3 class="tca-section-title">⚡ Tunnels</h3><p class="tca-empty">Aucun tunnel</p></div>`;
        return `
            <div class="tca-section">
                <h3 class="tca-section-title">⚡ Top tunnels</h3>
                <table class="tca-table">
                    <thead><tr><th>Tunnel</th><th>Leads</th><th>Conv.</th><th>Revenus</th></tr></thead>
                    <tbody>
                        ${tunnels.map(t => `
                            <tr>
                                <td><span class="tca-status-dot tca-status-${t.status}"></span>${_esc(t.name)}</td>
                                <td>${Number(t.leads_count).toLocaleString('fr-FR')}</td>
                                <td><span class="tca-badge tca-badge-${_convClass(t.conversion_rate)}">${t.conversion_rate}%</span></td>
                                <td><strong>${_fmtEur(Number(t.revenue_cents))}</strong></td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    // ── TOP FORMATIONS ────────────────────────────

    function _renderTopFormations(formations) {
        if (!formations?.length) return `<div class="tca-section"><h3 class="tca-section-title">🎓 Formations</h3><p class="tca-empty">Aucune formation</p></div>`;
        return `
            <div class="tca-section">
                <h3 class="tca-section-title">🎓 Top formations</h3>
                <table class="tca-table">
                    <thead><tr><th>Formation</th><th>Étudiants</th><th>Complétion</th><th>Prix</th></tr></thead>
                    <tbody>
                        ${formations.map(f => `
                            <tr>
                                <td><span class="tca-status-dot tca-status-${f.status}"></span>${_esc(f.title)}</td>
                                <td>${Number(f.students_count).toLocaleString('fr-FR')}</td>
                                <td>
                                    <div class="tca-progress-bar">
                                        <div class="tca-progress-fill" style="width:${f.avg_completion_pct || 0}%"></div>
                                    </div>
                                    <span class="tca-progress-label">${f.avg_completion_pct || 0}%</span>
                                </td>
                                <td>${f.price_cents ? _fmtEur(Number(f.price_cents)) : 'Gratuit'}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    // ── ÉVÉNEMENTS ────────────────────────────────

    function _attachEvents() {
        document.getElementById('tca-close')?.addEventListener('click', close);
        document.getElementById('tca-close-sk')?.addEventListener('click', close);

        document.querySelectorAll('.tca-period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPeriod = btn.dataset.period;
                _render(currentPeriod);
            });
        });

        document.getElementById('tca-export-leads')?.addEventListener('click', _exportLeads);
        document.getElementById('tca-export-sales')?.addEventListener('click', _exportSales);
    }

    async function _exportLeads() {
        const token = (typeof ApiTokens !== 'undefined' && ApiTokens.getToken && ApiTokens.getToken())
            || localStorage.getItem('productiveapp_auth_token')
            || localStorage.getItem('productiveapp_token');
        const r = await fetch('/api/v1/tenant-analytics/export/leads', { headers: { Authorization: 'Bearer ' + token } });
        if (!r.ok) return;
        const blob = await r.blob();
        _downloadBlob(blob, 'leads.csv');
    }

    async function _exportSales() {
        const token = (typeof ApiTokens !== 'undefined' && ApiTokens.getToken && ApiTokens.getToken())
            || localStorage.getItem('productiveapp_auth_token')
            || localStorage.getItem('productiveapp_token');
        const r = await fetch('/api/v1/tenant-analytics/export/sales', { headers: { Authorization: 'Bearer ' + token } });
        if (!r.ok) return;
        const blob = await r.blob();
        _downloadBlob(blob, 'ventes.csv');
    }

    function _downloadBlob(blob, filename) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // ── Utils ─────────────────────────────────────

    function _esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]); }
    function _convClass(r) { return r >= 5 ? 'green' : r >= 2 ? 'yellow' : 'red'; }

    // ── CSS inline ────────────────────────────────

    (function injectCSS() {
        if (document.getElementById('tca-css')) return;
        const s = document.createElement('style');
        s.id = 'tca-css';
        s.textContent = `
.tca-panel { max-width: 1100px; width: 95vw; max-height: 90vh; display: flex; flex-direction: column; }
.tca-body { overflow-y: auto; padding: 24px 28px 32px; flex: 1; }
.tca-period-tabs { display: flex; gap: 4px; }
.tca-period-btn { padding: 5px 13px; font-size: 0.75rem; border-radius: 6px; border: 1px solid var(--border,#333); background: transparent; color: var(--text-muted,#888); cursor: pointer; transition: all .18s; }
.tca-period-btn.active, .tca-period-btn:hover { background: var(--accent,#7c3aed); color: #fff; border-color: var(--accent,#7c3aed); }
.tca-kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
.tca-kpi-card { background: var(--bg-secondary,#1a1a2e); border: 1px solid var(--border,#333); border-radius: 12px; padding: 18px 16px; }
.tca-kpi-icon { font-size: 1.4rem; margin-bottom: 8px; }
.tca-kpi-value { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
.tca-kpi-label { font-size: 0.75rem; color: var(--text-muted,#888); margin-bottom: 4px; }
.tca-kpi-sub { font-size: 0.71rem; color: var(--text-muted,#666); }
.tca-chart-block { background: var(--bg-secondary,#1a1a2e); border: 1px solid var(--border,#333); border-radius: 12px; padding: 16px 20px 12px; margin-bottom: 24px; }
.tca-chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.tca-chart-title { font-size: 0.82rem; font-weight: 600; }
.tca-chart-legend { display: flex; gap: 14px; font-size: 0.73rem; color: var(--text-muted,#888); }
.tca-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
.tca-two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.tca-section { background: var(--bg-secondary,#1a1a2e); border: 1px solid var(--border,#333); border-radius: 12px; padding: 16px 20px; }
.tca-section-title { font-size: 0.82rem; font-weight: 600; margin-bottom: 14px; }
.tca-empty { color: var(--text-muted,#888); font-size: 0.8rem; }
.tca-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.tca-table th { color: var(--text-muted,#888); font-weight: 500; padding: 0 6px 8px; text-align: left; border-bottom: 1px solid var(--border,#333); }
.tca-table td { padding: 7px 6px; border-bottom: 1px solid rgba(255,255,255,0.04); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tca-status-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
.tca-status-published { background: #10b981; }
.tca-status-draft { background: #888; }
.tca-status-archived { background: #f59e0b; }
.tca-badge { padding: 2px 7px; border-radius: 10px; font-size: 0.7rem; font-weight: 600; }
.tca-badge-green { background: rgba(16,185,129,.15); color: #10b981; }
.tca-badge-yellow { background: rgba(245,158,11,.15); color: #f59e0b; }
.tca-badge-red { background: rgba(239,68,68,.15); color: #ef4444; }
.tca-progress-bar { display: inline-block; width: 55px; height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; vertical-align: middle; margin-right: 5px; overflow: hidden; }
.tca-progress-fill { height: 100%; background: var(--accent,#7c3aed); border-radius: 3px; }
.tca-progress-label { font-size: 0.71rem; color: var(--text-muted,#888); }
@media(max-width:768px) { .tca-kpi-grid{grid-template-columns:1fr 1fr;} .tca-two-cols{grid-template-columns:1fr;} }
        `;
        document.head.appendChild(s);
    })();

    return { open, close };
})();
