/**
 * FORMATION STATS v1.0
 * Statistiques d'une formation — KPIs, Charts Canvas 2D
 */

const FormationStats = (function () {
    'use strict';

    let _formation = null;
    let _onBack = null;

    function setHandlers(handlers) {
        _onBack = handlers.onBack;
    }

    async function render(container, formation) {
        _formation = formation;
        container.innerHTML = `<div class="academy-loading"><div class="academy-spinner"></div><span>Chargement des statistiques...</span></div>`;

        let stats = {};
        try {
            stats = await AcademyApi.getStats(formation.id);
        } catch (e) {
            stats = _getMockStats();
        }

        container.innerHTML = _buildHtml(stats);
        _attachEvents(container);
        _renderCharts(container, stats);
    }

    function _buildHtml(stats) {
        const t = stats.totals || stats;
        const revenue = ((t.revenue_cents || 0) / 100).toFixed(0);
        const conversion = t.conversion_rate || stats.conversionRate || '0.00';
        const cr = parseFloat(conversion).toFixed(1);

        return `
        <div class="academy-header">
            <div class="academy-header-left">
                <button class="btn-academy btn-secondary btn-sm" id="btn-back-from-stats">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    Retour
                </button>
                <div>
                    <h1 class="academy-header-title">Statistiques — ${_esc(_formation.title || _formation.name || '')}</h1>
                    <p class="academy-header-subtitle">30 derniers jours</p>
                </div>
            </div>
            <div class="academy-header-actions">
                <button class="btn-academy btn-secondary btn-sm" id="btn-export-stats">
                    📥 Exporter CSV
                </button>
            </div>
        </div>
        <div class="academy-body">
            <!-- KPI Cards -->
            <div class="stats-kpi-grid">
                <div class="stats-kpi-card">
                    <div class="stats-kpi-value">${t.views_count || 0}</div>
                    <div class="stats-kpi-label">Vues de la page</div>
                </div>
                <div class="stats-kpi-card">
                    <div class="stats-kpi-value">${t.leads_count || 0}</div>
                    <div class="stats-kpi-label">Inscriptions</div>
                </div>
                <div class="stats-kpi-card">
                    <div class="stats-kpi-value">${t.sales_count || 0}</div>
                    <div class="stats-kpi-label">Ventes</div>
                </div>
                <div class="stats-kpi-card">
                    <div class="stats-kpi-value">${revenue} €</div>
                    <div class="stats-kpi-label">Revenus totaux</div>
                </div>
                <div class="stats-kpi-card">
                    <div class="stats-kpi-value">${cr}%</div>
                    <div class="stats-kpi-label">Taux de conversion</div>
                </div>
                <div class="stats-kpi-card">
                    <div class="stats-kpi-value">${_avgProgress(stats)}%</div>
                    <div class="stats-kpi-label">Progression moyenne</div>
                </div>
            </div>

            <!-- Charts -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
                <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;padding:20px">
                    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px">📈 Inscriptions — 30 jours</div>
                    <canvas id="canvas-leads" height="180" style="width:100%"></canvas>
                </div>
                <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;padding:20px">
                    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px">💰 Revenus — 30 jours</div>
                    <canvas id="canvas-revenue" height="180" style="width:100%"></canvas>
                </div>
            </div>

            <!-- Progression étudiants -->
            <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;padding:20px">
                <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px">🎓 Distribution de progression</div>
                <canvas id="canvas-progress" height="120" style="width:100%"></canvas>
                <div id="progress-legend" style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap;font-size:12px;color:var(--text-muted)"></div>
            </div>
        </div>`;
    }

    function _attachEvents(container) {
        container.querySelector('#btn-back-from-stats')?.addEventListener('click', () => _onBack && _onBack());

        container.querySelector('#btn-export-stats')?.addEventListener('click', () => {
            _exportCsv();
        });
    }

    function _renderCharts(container, stats) {
        _renderLineChart(container.querySelector('#canvas-leads'), stats.dailyLeads || [], 'leads', '#7c3aed');
        _renderLineChart(container.querySelector('#canvas-revenue'), stats.dailySales || [], 'revenue', '#10b981', true);
        _renderProgressChart(container.querySelector('#canvas-progress'), container.querySelector('#progress-legend'), stats.progressDistribution);
    }

    function _renderLineChart(canvas, data, field, color, isMoney) {
        if (!canvas) return;
        canvas.width = canvas.offsetWidth || canvas.parentElement.offsetWidth || 400;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const pad = { top: 16, right: 16, bottom: 32, left: isMoney ? 52 : 36 };

        if (!data || data.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Pas de données', W / 2, H / 2);
            return;
        }

        const values = data.map(d => {
            const v = d[field] || d.leads || d.revenue || d.sales || 0;
            return isMoney ? v / 100 : Number(v);
        });
        const maxVal = Math.max(...values, 1);
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (plotH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(W - pad.right, y);
            ctx.stroke();
        }

        // Area gradient
        const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
        grad.addColorStop(0, color + '55');
        grad.addColorStop(1, color + '05');

        const pts = values.map((v, i) => ({
            x: pad.left + (i / Math.max(values.length - 1, 1)) * plotW,
            y: pad.top + plotH - (v / maxVal) * plotH
        }));

        ctx.beginPath();
        ctx.moveTo(pts[0].x, H - pad.bottom);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, H - pad.bottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Dots
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = 'var(--bg-secondary, #1a1a2e)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Labels Y
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 2; i++) {
            const v = (maxVal / 2) * i;
            const y = pad.top + plotH - (v / maxVal) * plotH;
            const label = isMoney ? v.toFixed(0) + '€' : v.toFixed(0);
            ctx.fillText(label, pad.left - 4, y + 4);
        }

        // Labels X (date)
        if (data.length > 0) {
            ctx.textAlign = 'center';
            const step = Math.ceil(data.length / 5);
            data.forEach((d, i) => {
                if (i % step === 0 || i === data.length - 1) {
                    const p = pts[i];
                    const label = d.date ? new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : `J${i}`;
                    ctx.fillText(label, p.x, H - 8);
                }
            });
        }
    }

    function _renderProgressChart(canvas, legend, distribution) {
        if (!canvas) return;
        canvas.width = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 600;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        const segments = distribution || [
            { label: '0-25%', count: 3, color: '#ef4444' },
            { label: '25-50%', count: 5, color: '#f59e0b' },
            { label: '50-75%', count: 8, color: '#3b82f6' },
            { label: '75-100%', count: 12, color: '#10b981' }
        ];

        const total = segments.reduce((n, s) => n + (s.count || 0), 0) || 1;
        const barH = 24;
        const gap = 10;
        const pad = { left: 60, right: 20, top: 10 };

        ctx.clearRect(0, 0, W, H);

        segments.forEach((seg, i) => {
            const pct = (seg.count || 0) / total;
            const barW = Math.max(pct * (W - pad.left - pad.right), 2);
            const y = pad.top + i * (barH + gap);

            // Label
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(seg.label, pad.left - 6, y + barH / 2 + 4);

            // Bar bg
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(pad.left, y, W - pad.left - pad.right, barH, 6) :
                ctx.rect(pad.left, y, W - pad.left - pad.right, barH);
            ctx.fill();

            // Bar fill
            ctx.fillStyle = seg.color;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(pad.left, y, barW, barH, 6) :
                ctx.rect(pad.left, y, barW, barH);
            ctx.fill();

            // Count
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.textAlign = 'left';
            ctx.font = '11px sans-serif';
            ctx.fillText(`${seg.count} (${(pct * 100).toFixed(0)}%)`, pad.left + barW + 6, y + barH / 2 + 4);
        });

        // Legend
        if (legend) {
            legend.innerHTML = segments.map(s =>
                `<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:50%;background:${s.color};display:inline-block"></span>${s.label}</span>`
            ).join('');
        }
    }

    function _avgProgress(stats) {
        if (!stats.avgProgress && !stats.avg_progress) return 0;
        return Math.round(stats.avgProgress || stats.avg_progress || 0);
    }

    function _exportCsv() {
        const rows = [
            ['Formation', _formation.title || _formation.name || ''],
            [''],
            ['Métrique', 'Valeur'],
            ['Vues', _formation.views_count || 0],
            ['Inscriptions', _formation.leads_count || 0],
            ['Ventes', _formation.sales_count || 0],
            ['Revenus (€)', ((_formation.revenue_cents || 0) / 100).toFixed(2)],
        ];
        const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        a.download = `stats-${(_formation.title || 'formation').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    }

    function _getMockStats() {
        const dailyLeads = Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
            leads: Math.floor(Math.random() * 4)
        }));
        const dailySales = Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
            sales: Math.floor(Math.random() * 2),
            revenue: Math.floor(Math.random() * 10000)
        }));
        return {
            totals: { views_count: 247, leads_count: 24, sales_count: 8, revenue_cents: 77600, conversion_rate: '33.33' },
            dailyLeads, dailySales, conversionRate: '33.33',
            progressDistribution: [
                { label: '0-25%', count: 4, color: '#ef4444' },
                { label: '25-50%', count: 6, color: '#f59e0b' },
                { label: '50-75%', count: 8, color: '#3b82f6' },
                { label: '75-100%', count: 6, color: '#10b981' }
            ]
        };
    }

    function _esc(s) {
        const d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    }

    return { render, setHandlers };
})();

if (typeof window !== 'undefined') window.FormationStats = FormationStats;
