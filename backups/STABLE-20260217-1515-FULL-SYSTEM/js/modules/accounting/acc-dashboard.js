/**
 * AccDashboard v2.0 - Tableau de bord financier premium
 * KPI cards avec sparklines, charts line+area, alertes premium
 */
const AccDashboard = (function() {
    'use strict';

    const EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
    const PCT = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1 });

    let charts = {};
    let dashData  = null;
    let overdueData = [];
    let alertsData  = [];

    // ─────────────────────────────────────────────────
    // Sparkline (Canvas 2D mini-chart)
    // ─────────────────────────────────────────────────
    function drawSparkline(canvasEl, values, color) {
        if (!canvasEl || !values || values.length < 2) return;
        const dpr = window.devicePixelRatio || 1;
        const W = canvasEl.offsetWidth  || 120;
        const H = canvasEl.offsetHeight || 38;
        canvasEl.width  = W * dpr;
        canvasEl.height = H * dpr;
        const ctx = canvasEl.getContext('2d');
        ctx.scale(dpr, dpr);

        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        const pad = 4;
        const xs = values.map((_, i) => pad + (i / (values.length - 1)) * (W - pad * 2));
        const ys = values.map(v => H - pad - ((v - min) / range) * (H - pad * 2));

        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, color + '55');
        grad.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let i = 1; i < xs.length; i++) {
            const cpx = (xs[i - 1] + xs[i]) / 2;
            ctx.bezierCurveTo(cpx, ys[i - 1], cpx, ys[i], xs[i], ys[i]);
        }
        ctx.lineTo(xs[xs.length - 1], H);
        ctx.lineTo(xs[0], H);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let i = 1; i < xs.length; i++) {
            const cpx = (xs[i - 1] + xs[i]) / 2;
            ctx.bezierCurveTo(cpx, ys[i - 1], cpx, ys[i], xs[i], ys[i]);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(xs[xs.length - 1], ys[ys.length - 1], 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    // ─────────────────────────────────────────────────
    // Counter animation
    // ─────────────────────────────────────────────────
    function animateCounter(el, targetValue, isEur) {
        if (!el) return;
        const duration = 900;
        const steps = 40;
        let step = 0;
        const interval = setInterval(() => {
            step++;
            const eased = 1 - Math.pow(1 - step / steps, 3);
            const current = targetValue * eased;
            el.textContent = isEur ? EUR.format(current) : Math.round(current).toLocaleString('fr-FR');
            if (step >= steps) {
                clearInterval(interval);
                el.textContent = isEur ? EUR.format(targetValue) : targetValue.toLocaleString('fr-FR');
            }
        }, duration / steps);
    }

    function getTrend(trend, field) {
        if (!trend || trend.length < 2) return { pct: 0, dir: 'flat', diff: 0 };
        const now  = new Date().getMonth() + 1;
        const prev = now === 1 ? 12 : now - 1;
        const cur  = trend.find(t => parseInt(t.month) === now);
        const prv  = trend.find(t => parseInt(t.month) === prev);
        const curVal = cur ? parseFloat(cur[field]) || 0 : 0;
        const prvVal = prv ? parseFloat(prv[field]) || 0 : 0;
        if (prvVal === 0) return { pct: curVal > 0 ? 100 : 0, dir: curVal > 0 ? 'up' : 'flat', diff: curVal };
        const pct = ((curVal - prvVal) / prvVal) * 100;
        return { pct: Math.abs(pct).toFixed(1), dir: pct >= 0 ? 'up' : 'down', diff: curVal - prvVal };
    }

    function getSparkData(trend, field) {
        const data = new Array(12).fill(0);
        (trend || []).forEach(t => {
            const m = (parseInt(t.month) || 1) - 1;
            data[m] = parseFloat(t[field]) || 0;
        });
        return data;
    }

    function _esc(str) {
        return String(str || '').replace(/[&<>"']/g, c =>
            ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    }

    function _cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    // ─────────────────────────────────────────────────
    // KPI Cards HTML
    // ─────────────────────────────────────────────────
    function renderKPI(d) {
        const result = (d.total_income || 0) - (d.total_expense || 0);
        const margin = d.total_income > 0 ? result / d.total_income : 0;
        const overdueCount = overdueData.length;
        const overdueTotal = overdueData.reduce((s, i) => s + parseFloat(i.montant_ttc || 0), 0);
        const trendInc = getTrend(d.monthly_trend, 'income');
        const trendExp = getTrend(d.monthly_trend, 'expense');

        const trendBadge = (t, invertColor) => {
            const effectiveDir = invertColor
                ? (t.dir === 'up' ? 'down' : (t.dir === 'down' ? 'up' : 'flat'))
                : t.dir;
            const arrow = t.dir === 'up' ? '↑' : (t.dir === 'down' ? '↓' : '→');
            return `<span class="acc-kpi-prem-trend ${effectiveDir}">${arrow} ${t.pct}%</span>`;
        };

        return `
<div class="acc-kpi-premium-grid">

  <div class="acc-kpi-premium-card">
    <div class="acc-kpi-prem-header">
      <div class="acc-kpi-prem-icon revenue">💰</div>
      ${trendBadge(trendInc, false)}
    </div>
    <div class="acc-kpi-prem-value" id="kpi-income">${EUR.format(d.total_income || 0)}</div>
    <div class="acc-kpi-prem-label">Chiffre d'affaires</div>
    <canvas class="acc-kpi-prem-sparkline" id="sp-income"></canvas>
    <div class="acc-kpi-prem-footer">
      <span class="label">${d.invoice_count || 0} factures</span>
      <span class="val ${trendInc.dir === 'up' ? 'pos' : 'neg'}">${trendInc.diff >= 0 ? '+' : ''}${EUR.format(trendInc.diff)}</span>
    </div>
  </div>

  <div class="acc-kpi-premium-card">
    <div class="acc-kpi-prem-header">
      <div class="acc-kpi-prem-icon expense">📉</div>
      ${trendBadge(trendExp, true)}
    </div>
    <div class="acc-kpi-prem-value" id="kpi-expense">${EUR.format(d.total_expense || 0)}</div>
    <div class="acc-kpi-prem-label">Dépenses</div>
    <canvas class="acc-kpi-prem-sparkline" id="sp-expense"></canvas>
    <div class="acc-kpi-prem-footer">
      <span class="label">vs mois dernier</span>
      <span class="val ${trendExp.dir === 'up' ? 'neg' : 'pos'}">${trendExp.diff >= 0 ? '+' : ''}${EUR.format(trendExp.diff)}</span>
    </div>
  </div>

  <div class="acc-kpi-premium-card highlight">
    <div class="acc-kpi-prem-header">
      <div class="acc-kpi-prem-icon profit">📊</div>
      <span class="acc-kpi-prem-trend ${result >= 0 ? 'up' : 'down'}">Marge ${PCT.format(Math.abs(margin))}</span>
    </div>
    <div class="acc-kpi-prem-value ${result >= 0 ? 'pos' : 'neg'}" id="kpi-result">${EUR.format(result)}</div>
    <div class="acc-kpi-prem-label">Résultat net</div>
    <canvas class="acc-kpi-prem-sparkline" id="sp-result"></canvas>
    <div class="acc-kpi-prem-footer">
      <span class="label">${result >= 0 ? 'Bénéfice' : 'Déficit'}</span>
      <span class="val neutral">${result >= 0 ? '✓ En positif' : '⚠ En négatif'}</span>
    </div>
  </div>

  <div class="acc-kpi-premium-card">
    <div class="acc-kpi-prem-header">
      <div class="acc-kpi-prem-icon treasury">⏳</div>
      ${overdueCount > 0
        ? `<span class="acc-kpi-prem-badge crit">⚠ ${overdueCount} en retard</span>`
        : `<span class="acc-kpi-prem-badge ok">✓ À jour</span>`}
    </div>
    <div class="acc-kpi-prem-value" id="kpi-pending">${d.pending_count || 0}</div>
    <div class="acc-kpi-prem-label">Factures en attente</div>
    <div class="acc-kpi-prem-breakdown">
      <div class="acc-kpi-prem-breakdown-item">
        <div class="acc-kpi-prem-dot pending"></div>
        <span>${Math.max(0, (d.pending_count || 0) - overdueCount)} envoyées</span>
      </div>
      ${overdueCount > 0 ? `<div class="acc-kpi-prem-breakdown-item">
        <div class="acc-kpi-prem-dot overdue"></div>
        <span>${overdueCount} en retard</span>
      </div>` : ''}
    </div>
    <div class="acc-kpi-prem-footer">
      <span class="label">Montant total</span>
      <span class="val ${overdueTotal > 0 ? 'neg' : 'neutral'}">${EUR.format(overdueTotal)}</span>
    </div>
  </div>

</div>`;
    }

    // ─────────────────────────────────────────────────
    // Alertes premium
    // ─────────────────────────────────────────────────
    function renderAlertsBanner() {
        if (!alertsData.length) return '';
        const icons   = { danger:'🚨', warning:'⚠️', success:'✅', info:'ℹ️' };
        const typeMap = { critical:'danger', high:'danger', medium:'warning', low:'info', info:'info' };
        return `<div class="acc-alerts-premium">
${alertsData.slice(0, 3).map(a => {
    const cls = typeMap[a.severity] || 'info';
    return `<div class="acc-alert-prem ${cls}">
        <div class="acc-alert-prem-icon">${icons[cls]}</div>
        <div class="acc-alert-prem-body">
            <div class="acc-alert-prem-title">${_esc(a.title || 'Alerte')}</div>
            <div class="acc-alert-prem-desc">${_esc(a.description || a.message || '')}</div>
        </div>
        <button class="acc-alert-prem-btn" onclick="AccDashboard.handleAlertAction('${_esc(a.id || '')}','${cls}')">Voir</button>
        <button class="acc-alert-prem-dismiss" onclick="this.closest('.acc-alert-prem').remove()">✕</button>
    </div>`;
}).join('')}
</div>`;
    }

    function renderQuickActions() {
        return `<div class="acc-quick-actions-prem">
            <button class="acc-quick-btn-prem primary" data-action="tab-scanner">📷 Scanner facture</button>
            <button class="acc-quick-btn-prem" data-action="tab-invoices" data-sub="create">➕ Nouvelle facture</button>
            <button class="acc-quick-btn-prem" data-action="tab-documents">📄 Créer devis</button>
            <button class="acc-quick-btn-prem" data-action="tab-expenses">🧾 Note de frais</button>
            <button class="acc-quick-btn-prem" data-action="export-fec">⬇️ Export FEC</button>
        </div>`;
    }

    function renderChartsHTML() {
        return `<div class="acc-charts-row">
            <div class="acc-chart-premium">
                <div class="acc-chart-premium-header">
                    <h3>Revenus vs Dépenses</h3>
                    <div class="acc-chart-legend">
                        <div class="acc-chart-legend-item">
                            <div class="acc-chart-legend-dot" style="background:#00d68f"></div>Revenus
                        </div>
                        <div class="acc-chart-legend-item">
                            <div class="acc-chart-legend-dot" style="background:#ff3d71"></div>Dépenses
                        </div>
                    </div>
                </div>
                <div class="acc-chart-prem-canvas-wrap"><canvas id="acc-chart-revenue"></canvas></div>
            </div>
            <div class="acc-chart-premium">
                <div class="acc-chart-premium-header"><h3>Répartition</h3></div>
                <div class="acc-chart-prem-canvas-wrap"><canvas id="acc-chart-categories"></canvas></div>
            </div>
        </div>`;
    }

    function renderInfoCards(d) {
        const overdueCount = overdueData.length;
        const overdueTotal = overdueData.reduce((s, i) => s + parseFloat(i.montant_ttc || 0), 0);
        const alertCount   = alertsData.length;
        return `<div class="acc-dash-info-prem">
            <div class="acc-info-prem-card ${overdueCount > 0 ? 'has-alert' : ''}">
                <div class="acc-info-prem-head">
                    ⚠️ Factures impayées
                    ${overdueCount > 0 ? `<span style="margin-left:auto;background:var(--fin-danger-soft);color:var(--fin-danger);padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">${overdueCount}</span>` : ''}
                </div>
                ${overdueCount > 0
                    ? `<div class="acc-info-prem-amount">${EUR.format(overdueTotal)}</div>
                       <ul class="acc-info-prem-list">
                           ${overdueData.slice(0, 5).map(inv => `<li>
                               <span>${_esc(inv.fournisseur || inv.client_name || 'Client')}</span>
                               <span class="neg">${EUR.format(parseFloat(inv.montant_ttc || 0))}</span>
                           </li>`).join('')}
                       </ul>`
                    : `<p class="acc-info-prem-empty">✓ Aucune facture en retard</p>`}
            </div>
            <div class="acc-info-prem-card">
                <div class="acc-info-prem-head">📈 Flux de trésorerie</div>
                <div class="acc-chart-prem-canvas-wrap" style="height:130px;"><canvas id="acc-chart-cashflow"></canvas></div>
            </div>
            <div class="acc-info-prem-card ${alertCount > 0 ? 'has-alert' : ''}">
                <div class="acc-info-prem-head">
                    🔔 Alertes
                    ${alertCount > 0 ? `<span style="margin-left:auto;background:var(--fin-warning-soft);color:var(--fin-warning);padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">${alertCount}</span>` : ''}
                </div>
                ${alertCount > 0
                    ? `<ul class="acc-info-prem-list">
                           ${alertsData.slice(0, 4).map(a => `<li>
                               <span>${_esc(a.title || 'Alerte')}</span>
                               <span>${a.severity === 'critical' ? '🔴' : a.severity === 'high' ? '🟠' : '🟡'}</span>
                           </li>`).join('')}
                       </ul>`
                    : `<p class="acc-info-prem-empty">✓ Aucune alerte active</p>`}
            </div>
        </div>`;
    }

    function renderTopCategories(d) {
        const cats = (d.top_categories || []).slice(0, 8);
        if (!cats.length) return '';
        const total  = cats.reduce((s, c) => s + parseFloat(c.total || 0), 0);
        const colors = ['#0095ff','#a855f7','#00d68f','#ffaa00','#ff3d71','#00e0ff','#ff6b9d','#14b8a6'];
        return `<div class="acc-chart-premium" style="margin-bottom:22px;">
            <div class="acc-chart-premium-header"><h3>Top catégories</h3></div>
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr>
                    <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-secondary,#8f9bb3)">Catégorie</th>
                    <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-secondary,#8f9bb3)">Type</th>
                    <th style="padding:8px 10px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-secondary,#8f9bb3)">Montant</th>
                    <th style="padding:8px 10px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-secondary,#8f9bb3)">%</th>
                </tr></thead>
                <tbody>
                ${cats.map((c, i) => {
                    const pct = total > 0 ? (parseFloat(c.total) / total * 100).toFixed(1) : '0';
                    return `<tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                        <td style="padding:10px;color:var(--text-primary,#fff);font-size:13px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <div style="width:8px;height:8px;border-radius:50%;background:${colors[i % colors.length]};flex-shrink:0;"></div>
                                ${_esc(c.category_name || '—')}
                            </div>
                        </td>
                        <td style="padding:10px;">
                            <span class="acc-status-prem ${c.type === 'income' ? 'paid' : 'overdue'}" style="font-size:11px;">${c.type === 'income' ? 'Revenu' : 'Dépense'}</span>
                        </td>
                        <td style="padding:10px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:var(--text-primary,#fff)">${EUR.format(parseFloat(c.total || 0))}</td>
                        <td style="padding:10px;text-align:right;color:var(--text-secondary,#8f9bb3);font-size:13px;">${pct}%</td>
                    </tr>`;
                }).join('')}
                </tbody>
            </table>
        </div>`;
    }

    // ─────────────────────────────────────────────────
    // Init Charts
    // ─────────────────────────────────────────────────
    function initCharts(d) {
        destroyCharts();
        _initRevenueChart(d);
        _initCategoryDonut(d);
        _initCashFlowChart(d);
        _initSparklines(d);
        _animateKPIs(d);
    }

    function _initRevenueChart(d) {
        const canvas = document.getElementById('acc-chart-revenue');
        if (!canvas || !window.Chart) return;
        const ctx = canvas.getContext('2d');
        const incomeData  = getSparkData(d.monthly_trend, 'income');
        const expenseData = getSparkData(d.monthly_trend, 'expense');
        const gR = ctx.createLinearGradient(0, 0, 0, 220);
        gR.addColorStop(0, 'rgba(0,214,143,0.35)');
        gR.addColorStop(1, 'rgba(0,214,143,0)');
        const gE = ctx.createLinearGradient(0, 0, 0, 220);
        gE.addColorStop(0, 'rgba(255,61,113,0.35)');
        gE.addColorStop(1, 'rgba(255,61,113,0)');
        const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
        charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    { label:'Revenus',  data:incomeData,  borderColor:'#00d68f', backgroundColor:gR, borderWidth:2.5, fill:true, tension:0.4, pointRadius:0, pointHoverRadius:5, pointHoverBackgroundColor:'#00d68f', pointHoverBorderColor:'#fff', pointHoverBorderWidth:2 },
                    { label:'Dépenses', data:expenseData, borderColor:'#ff3d71', backgroundColor:gE, borderWidth:2.5, fill:true, tension:0.4, pointRadius:0, pointHoverRadius:5, pointHoverBackgroundColor:'#ff3d71', pointHoverBorderColor:'#fff', pointHoverBorderWidth:2 }
                ]
            },
            options: {
                responsive:true, maintainAspectRatio:false,
                interaction:{ intersect:false, mode:'index' },
                plugins:{
                    legend:{ display:false },
                    tooltip:{ backgroundColor:'#1e252e', titleColor:'#fff', bodyColor:'#8f9bb3', borderColor:'rgba(255,255,255,0.1)', borderWidth:1, cornerRadius:8, padding:10,
                        callbacks:{ label: ctx => `${ctx.dataset.label}: ${EUR.format(ctx.parsed.y)}` } }
                },
                scales:{
                    x:{ grid:{ color:'rgba(255,255,255,0.04)', drawBorder:false }, ticks:{ color:'#5e6978', font:{size:11} } },
                    y:{ grid:{ color:'rgba(255,255,255,0.04)', drawBorder:false }, ticks:{ color:'#5e6978', font:{size:11}, callback: v => EUR.format(v) } }
                }
            }
        });
    }

    function _initCategoryDonut(d) {
        const canvas = document.getElementById('acc-chart-categories');
        if (!canvas || !window.Chart) return;
        const cats = (d.top_categories || []).slice(0, 6);
        if (!cats.length) {
            const ctx = canvas.getContext('2d');
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 28;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 55, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#5e6978';
            ctx.font = '13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Aucune donnée', canvas.width / 2, canvas.height / 2);
            return;
        }
        const palette = ['#0095ff','#a855f7','#00d68f','#ffaa00','#ff3d71','#00e0ff'];
        const total   = cats.reduce((s, c) => s + parseFloat(c.total || 0), 0);
        charts.categories = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: cats.map(c => c.category_name),
                datasets: [{ data: cats.map(c => parseFloat(c.total || 0)), backgroundColor: palette, borderWidth:0, hoverOffset:6 }]
            },
            options: {
                responsive:true, maintainAspectRatio:false, cutout:'68%',
                plugins:{
                    legend:{ display:false },
                    tooltip:{ backgroundColor:'#1e252e', titleColor:'#fff', bodyColor:'#8f9bb3', borderColor:'rgba(255,255,255,0.1)', borderWidth:1, cornerRadius:8,
                        callbacks:{ label: ctx => `${ctx.label}: ${EUR.format(ctx.parsed)} (${((ctx.parsed/total)*100).toFixed(1)}%)` } }
                }
            },
            plugins: [{
                id: 'centerLabel',
                beforeDraw(chart) {
                    const { ctx, width, height } = chart;
                    ctx.save();
                    ctx.font = 'bold 15px Inter, sans-serif';
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(EUR.format(total), width/2, height/2 - 8);
                    ctx.font = '11px Inter, sans-serif';
                    ctx.fillStyle = '#8f9bb3';
                    ctx.fillText('Total', width/2, height/2 + 12);
                    ctx.restore();
                }
            }]
        });
    }

    function _initCashFlowChart(d) {
        const canvas = document.getElementById('acc-chart-cashflow');
        if (!canvas || !window.Chart) return;
        const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
        const trend  = d.monthly_trend || [];
        let running  = 0;
        const balData = [];
        for (let i = 0; i < 12; i++) {
            const t = trend.find(tr => parseInt(tr.month) === i + 1);
            running += t ? (parseFloat(t.income) || 0) - (parseFloat(t.expense) || 0) : 0;
            balData.push(running);
        }
        const ctx  = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 130);
        grad.addColorStop(0, 'rgba(0,149,255,0.3)');
        grad.addColorStop(1, 'rgba(0,149,255,0)');
        charts.cashflow = new Chart(ctx, {
            type: 'line',
            data: { labels: months, datasets: [{
                label:'Trésorerie', data: balData,
                borderColor:'#0095ff', backgroundColor: grad,
                borderWidth:2, fill:true, tension:0.4, pointRadius:0,
                pointHoverRadius:4, pointHoverBackgroundColor:'#0095ff', pointHoverBorderColor:'#fff', pointHoverBorderWidth:2
            }] },
            options: {
                responsive:true, maintainAspectRatio:false,
                plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:'#1e252e', cornerRadius:8, callbacks:{ label: ctx => EUR.format(ctx.parsed.y) } } },
                scales:{
                    x:{ grid:{ display:false }, ticks:{ color:'#5e6978', font:{size:10} } },
                    y:{ grid:{ color:'rgba(255,255,255,0.04)', drawBorder:false }, ticks:{ color:'#5e6978', font:{size:10}, callback: v => EUR.format(v) } }
                }
            }
        });
    }

    function _initSparklines(d) {
        const sparkInc = getSparkData(d.monthly_trend, 'income');
        const sparkExp = getSparkData(d.monthly_trend, 'expense');
        const sparkRes = sparkInc.map((v, i) => v - sparkExp[i]);
        requestAnimationFrame(() => {
            drawSparkline(document.getElementById('sp-income'),  sparkInc, '#00d68f');
            drawSparkline(document.getElementById('sp-expense'), sparkExp, '#ff3d71');
            drawSparkline(document.getElementById('sp-result'),  sparkRes, '#0095ff');
        });
    }

    function _animateKPIs(d) {
        const result = (d.total_income || 0) - (d.total_expense || 0);
        setTimeout(() => {
            animateCounter(document.getElementById('kpi-income'),  d.total_income  || 0, true);
            animateCounter(document.getElementById('kpi-expense'), d.total_expense || 0, true);
            animateCounter(document.getElementById('kpi-result'),  result,               true);
        }, 150);
    }

    // ─────────────────────────────────────────────────
    // Render principal
    // ─────────────────────────────────────────────────
    function render(container) {
        const d = dashData || { total_income:0, total_expense:0, balance:0, invoice_count:0, pending_count:0, top_categories:[], monthly_trend:[] };
        container.innerHTML = `
<div class="acc-dash" style="padding:4px 0;">
    ${alertsData.length > 0 ? renderAlertsBanner() : ''}
    ${renderKPI(d)}
    ${renderChartsHTML()}
    ${renderInfoCards(d)}
    ${renderTopCategories(d)}
    ${renderQuickActions()}
</div>`;
        setTimeout(() => initCharts(d), 120);
    }

    function destroyCharts() {
        Object.values(charts).forEach(c => { try { c.destroy(); } catch(e) {} });
        charts = {};
    }

    async function refresh(container) {
        if (!container) return;
        container.innerHTML = `<div style="padding:48px;text-align:center;color:var(--text-secondary,#8f9bb3);">
            <div style="display:inline-block;width:32px;height:32px;border:3px solid rgba(255,255,255,0.1);border-top-color:#0095ff;border-radius:50%;animation:acc-spin 0.7s linear infinite;"></div>
            <p style="margin-top:14px;font-size:14px;">Chargement du tableau de bord…</p>
        </div>
        <style>@keyframes acc-spin{to{transform:rotate(360deg)}}</style>`;
        try {
            const year = new Date().getFullYear();
            const [r0, r1, r2] = await Promise.allSettled([
                AccountingApi.getDashboard(year),
                AccountingApi.getOverdueInvoices().catch(() => []),
                AccountingApi.getAlerts(true).catch(() => [])
            ]);
            dashData    = r0.status === 'fulfilled' ? r0.value : null;
            overdueData = r1.status === 'fulfilled' ? (Array.isArray(r1.value) ? r1.value : r1.value?.data || []) : [];
            alertsData  = r2.status === 'fulfilled' ? (Array.isArray(r2.value) ? r2.value : r2.value?.data || []) : [];
            if (dashData) AccState.setState('dashboard', dashData);
        } catch(e) { console.error('[AccDashboard] load error:', e); }
        render(container);
    }

    function handleAlertAction(id, type) {
        if (type === 'danger') {
            const tabEl = document.querySelector('[data-tab="invoices"]');
            if (tabEl) tabEl.click();
        }
    }

    return { render, refresh, destroyCharts, handleAlertAction };
})();
