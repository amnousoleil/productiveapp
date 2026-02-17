/**
 * AccDashboard - Tableau de bord financier avec KPIs et graphiques
 */
const AccDashboard = (function() {
    'use strict';
    const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
    const fmtPct = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    let charts = {};
    let dashData = null;
    let overdueData = [];
    let alertsData = [];

    function render(container) {
        const d = dashData || { total_income: 0, total_expense: 0, balance: 0, invoice_count: 0, pending_count: 0, top_categories: [], monthly_trend: [] };
        const result = d.total_income - d.total_expense;
        const trendIcon = result >= 0 ? '&#9650;' : '&#9660;';
        const trendClass = result >= 0 ? 'positive' : 'negative';
        const overdueCount = overdueData.length || 0;
        const overdueTotal = overdueData.reduce((s, i) => s + parseFloat(i.montant_ttc || 0), 0);
        const alertCount = alertsData.length || 0;

        container.innerHTML = `
        <div class="acc-dash">
            <div class="acc-dash-kpis">
                <div class="acc-kpi-card kpi-income">
                    <div class="acc-kpi-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
                    <div class="acc-kpi-label">Chiffre d'affaires</div>
                    <div class="acc-kpi-value">${fmt.format(d.total_income)}</div>
                    <div class="acc-kpi-sub">${d.invoice_count} factures</div>
                </div>
                <div class="acc-kpi-card kpi-expense">
                    <div class="acc-kpi-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg></div>
                    <div class="acc-kpi-label">Depenses</div>
                    <div class="acc-kpi-value">${fmt.format(d.total_expense)}</div>
                    <div class="acc-kpi-sub">${d.pending_count} en attente</div>
                </div>
                <div class="acc-kpi-card kpi-result ${trendClass}">
                    <div class="acc-kpi-icon"><span style="font-size:20px">${trendIcon}</span></div>
                    <div class="acc-kpi-label">Resultat net</div>
                    <div class="acc-kpi-value">${fmt.format(result)}</div>
                    <div class="acc-kpi-sub">${result >= 0 ? 'Benefice' : 'Deficit'}</div>
                </div>
                <div class="acc-kpi-card kpi-treasury">
                    <div class="acc-kpi-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="12" x2="22" y2="12"/></svg></div>
                    <div class="acc-kpi-label">Tresorerie</div>
                    <div class="acc-kpi-value">${fmt.format(d.balance)}</div>
                    <div class="acc-kpi-sub">Solde courant</div>
                </div>
            </div>

            <div class="acc-dash-charts">
                <div class="acc-chart-box">
                    <h3>Revenus vs Depenses</h3>
                    <canvas id="acc-chart-revenue" height="280"></canvas>
                </div>
                <div class="acc-chart-box">
                    <h3>Flux de tresorerie</h3>
                    <canvas id="acc-chart-cashflow" height="280"></canvas>
                </div>
            </div>

            <div class="acc-dash-info-row">
                <div class="acc-info-card ${overdueCount > 0 ? 'has-alert' : ''}">
                    <div class="acc-info-header">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Factures impayees ${overdueCount > 0 ? '<span class="acc-badge danger">' + overdueCount + '</span>' : ''}
                    </div>
                    <div class="acc-info-body">
                        ${overdueCount > 0 ? `<div class="acc-info-amount danger">${fmt.format(overdueTotal)}</div>
                        <ul class="acc-info-list">${overdueData.slice(0, 5).map(inv => `<li><span>${inv.fournisseur}</span><span class="danger">${fmt.format(parseFloat(inv.montant_ttc))}</span></li>`).join('')}</ul>` : '<p class="acc-empty-msg">Aucune facture en retard</p>'}
                    </div>
                </div>

                <div class="acc-info-card">
                    <div class="acc-info-header">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Prochaines echeances
                    </div>
                    <div class="acc-info-body">
                        <p class="acc-empty-msg">Chargement...</p>
                    </div>
                </div>

                <div class="acc-info-card ${alertCount > 0 ? 'has-alert' : ''}">
                    <div class="acc-info-header">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Alertes ${alertCount > 0 ? '<span class="acc-badge warning">' + alertCount + '</span>' : ''}
                    </div>
                    <div class="acc-info-body">
                        ${alertCount > 0 ? `<ul class="acc-info-list">${alertsData.slice(0, 3).map(a => `<li class="alert-${a.severity || 'info'}"><span>${a.title}</span></li>`).join('')}</ul>` : '<p class="acc-empty-msg">Aucune alerte</p>'}
                    </div>
                </div>
            </div>

            <div class="acc-dash-actions">
                <button class="acc-action-btn primary" data-action="tab-scanner">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
                    Scanner facture
                </button>
                <button class="acc-action-btn" data-action="tab-invoices" data-sub="create">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    Creer facture
                </button>
                <button class="acc-action-btn" data-action="tab-documents">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Creer devis
                </button>
                <button class="acc-action-btn" data-action="export-fec">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export FEC
                </button>
            </div>

            <div class="acc-dash-categories">
                <div class="acc-chart-box">
                    <h3>Repartition par categorie</h3>
                    <canvas id="acc-chart-categories" height="250"></canvas>
                </div>
                <div class="acc-chart-box">
                    <h3>Top categories</h3>
                    <table class="acc-table-mini">
                        <thead><tr><th>Categorie</th><th>Type</th><th>Montant</th><th>%</th></tr></thead>
                        <tbody>
                        ${(d.top_categories || []).slice(0, 8).map(c => {
                            const total = d.total_income + d.total_expense;
                            const pct = total > 0 ? (parseFloat(c.total) / total * 100).toFixed(1) : '0';
                            return `<tr><td>${c.category_name}</td><td><span class="acc-type-badge ${c.type}">${c.type === 'income' ? 'Revenu' : 'Depense'}</span></td><td>${fmt.format(parseFloat(c.total))}</td><td>${pct}%</td></tr>`;
                        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;

        setTimeout(() => initCharts(d), 100);
    }

    function initCharts(d) {
        destroyCharts();
        renderRevenueChart(d);
        renderCashFlowChart(d);
        renderCategoryChart(d);
    }

    function renderRevenueChart(d) {
        const canvas = document.getElementById('acc-chart-revenue');
        if (!canvas) return;
        const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trend = d.monthly_trend || [];
        const incomeData = new Array(12).fill(0);
        const expenseData = new Array(12).fill(0);
        trend.forEach(t => {
            const m = (parseInt(t.month) || 1) - 1;
            incomeData[m] = parseFloat(t.income) || 0;
            expenseData[m] = parseFloat(t.expense) || 0;
        });
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#6366f1';
        charts.revenue = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    { label: 'Revenus', data: incomeData, backgroundColor: '#10b981', borderRadius: 4 },
                    { label: 'Depenses', data: expenseData, backgroundColor: '#ef4444', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#fff', font: { size: 11 } } } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#999' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#999', callback: v => fmt.format(v) } }
                }
            }
        });
    }

    function renderCashFlowChart(d) {
        const canvas = document.getElementById('acc-chart-cashflow');
        if (!canvas) return;
        const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trend = d.monthly_trend || [];
        const balanceData = [];
        let running = 0;
        for (let i = 0; i < 12; i++) {
            const t = trend.find(tr => parseInt(tr.month) === i + 1);
            if (t) {
                running += (parseFloat(t.income) || 0) - (parseFloat(t.expense) || 0);
            }
            balanceData.push(running);
        }
        charts.cashflow = new Chart(canvas, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Tresorerie cumulee',
                    data: balanceData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    fill: true, tension: 0.4, pointRadius: 3
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#fff' } } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#999' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#999', callback: v => fmt.format(v) } }
                }
            }
        });
    }

    function renderCategoryChart(d) {
        const canvas = document.getElementById('acc-chart-categories');
        if (!canvas) return;
        const cats = (d.top_categories || []).slice(0, 8);
        if (cats.length === 0) return;
        const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];
        charts.categories = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: cats.map(c => c.category_name),
                datasets: [{ data: cats.map(c => parseFloat(c.total)), backgroundColor: colors.slice(0, cats.length), borderWidth: 0 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#fff', font: { size: 11 }, padding: 8 } } }
            }
        });
    }

    function destroyCharts() {
        Object.values(charts).forEach(c => { try { c.destroy(); } catch(e) {} });
        charts = {};
    }

    async function refresh(container) {
        if (!container) return;
        container.innerHTML = '<div class="acc-loading"><div class="acc-spinner"></div><p>Chargement du tableau de bord...</p></div>';
        try {
            const year = new Date().getFullYear();
            const results = await Promise.allSettled([
                AccountingApi.getDashboard(year),
                AccountingApi.getOverdueInvoices().catch(() => []),
                AccountingApi.getAlerts(true).catch(() => [])
            ]);
            dashData = results[0].status === 'fulfilled' ? results[0].value : null;
            overdueData = results[1].status === 'fulfilled' ? (Array.isArray(results[1].value) ? results[1].value : results[1].value?.data || []) : [];
            alertsData = results[2].status === 'fulfilled' ? (Array.isArray(results[2].value) ? results[2].value : results[2].value?.data || []) : [];
            if (dashData) AccState.setState('dashboard', dashData);
        } catch (e) { console.error('Dashboard load error:', e); }
        render(container);
    }

    return { render, refresh, destroyCharts };
})();
