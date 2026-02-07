/**
 * Module Comptabilite - TVA
 * @description Recapitulatif TVA et aide a la declaration
 */
const AccTva = (function() {
  'use strict';

  function render(container) {
    var state = AccState.getState();
    var tvaData = state.tva || {};
    var summary = tvaData.summary || {};
    var byRate = tvaData.by_rate || [];
    var quarterly = tvaData.quarterly || [];

    var collected = parseFloat(summary.total_collected) || 0;
    var deductible = parseFloat(summary.total_deductible) || 0;
    var net = collected - deductible;

    container.innerHTML = `
      <div class="acc-tva-module">
        <!-- Period selector -->
        <div class="acc-toolbar">
          <div class="acc-filter-group">
            <select class="acc-select" id="tva-period-type">
              <option value="quarter">Trimestriel</option>
              <option value="month">Mensuel</option>
              <option value="year">Annuel</option>
            </select>
            <select class="acc-select" id="tva-year">
              ${[2026, 2025, 2024].map(function(y) { return '<option value="' + y + '"' + (y === new Date().getFullYear() ? ' selected' : '') + '>' + y + '</option>'; }).join('')}
            </select>
            <select class="acc-select" id="tva-quarter">
              <option value="1" ${getCurrentQuarter() === 1 ? 'selected' : ''}>T1 (Jan-Mar)</option>
              <option value="2" ${getCurrentQuarter() === 2 ? 'selected' : ''}>T2 (Avr-Jun)</option>
              <option value="3" ${getCurrentQuarter() === 3 ? 'selected' : ''}>T3 (Jul-Sep)</option>
              <option value="4" ${getCurrentQuarter() === 4 ? 'selected' : ''}>T4 (Oct-Dec)</option>
            </select>
            <button class="acc-btn acc-btn-primary" data-action="refresh-tva">Actualiser</button>
          </div>
          <button class="acc-btn" data-action="export-tva-declaration">
            📄 Exporter declaration
          </button>
        </div>

        <!-- KPI Cards -->
        <div class="acc-stats-row">
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#ef4444">📤</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${formatCurrency(collected)}</span>
              <span class="acc-stat-label">TVA collectee</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#10b981">📥</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${formatCurrency(deductible)}</span>
              <span class="acc-stat-label">TVA deductible</span>
            </div>
          </div>
          <div class="acc-stat-card ${net > 0 ? 'acc-card-danger' : 'acc-card-success'}">
            <div class="acc-stat-icon" style="background:${net > 0 ? '#ef4444' : '#10b981'}">${net > 0 ? '💸' : '🎉'}</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${formatCurrency(Math.abs(net))}</span>
              <span class="acc-stat-label">${net > 0 ? 'TVA a payer' : 'Credit de TVA'}</span>
            </div>
          </div>
        </div>

        <!-- TVA by rate breakdown -->
        <div class="acc-section">
          <h4>Ventilation par taux</h4>
          <table class="acc-table">
            <thead>
              <tr>
                <th>Taux</th>
                <th>Base HT ventes</th>
                <th>TVA collectee</th>
                <th>Base HT achats</th>
                <th>TVA deductible</th>
                <th>Solde</th>
              </tr>
            </thead>
            <tbody>
              ${byRate.length > 0 ? byRate.map(function(r) { return `
                <tr>
                  <td><strong>${r.rate}%</strong></td>
                  <td>${formatCurrency(r.sales_base)}</td>
                  <td class="acc-amount text-danger">${formatCurrency(r.collected)}</td>
                  <td>${formatCurrency(r.purchase_base)}</td>
                  <td class="acc-amount text-success">${formatCurrency(r.deductible)}</td>
                  <td class="acc-amount"><strong>${formatCurrency(r.collected - r.deductible)}</strong></td>
                </tr>
              `; }).join('') : `
                <tr>
                  <td colspan="6" class="text-center text-muted">
                    Aucune donnee TVA pour cette periode.<br>
                    Les donnees seront calculees a partir de vos factures validees.
                  </td>
                </tr>
              `}
              ${byRate.length > 0 ? `
                <tr class="acc-table-total">
                  <td><strong>TOTAL</strong></td>
                  <td><strong>${formatCurrency(byRate.reduce(function(s, r) { return s + (r.sales_base || 0); }, 0))}</strong></td>
                  <td class="acc-amount text-danger"><strong>${formatCurrency(collected)}</strong></td>
                  <td><strong>${formatCurrency(byRate.reduce(function(s, r) { return s + (r.purchase_base || 0); }, 0))}</strong></td>
                  <td class="acc-amount text-success"><strong>${formatCurrency(deductible)}</strong></td>
                  <td class="acc-amount"><strong>${formatCurrency(net)}</strong></td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>

        <!-- Quarterly evolution chart -->
        <div class="acc-section">
          <h4>Evolution trimestrielle</h4>
          <div class="acc-chart-container" style="height:300px">
            <canvas id="tva-chart"></canvas>
          </div>
        </div>

        <!-- Declaration helper -->
        <div class="acc-section">
          <h4>Aide a la declaration CA3</h4>
          <div class="acc-declaration-helper">
            <div class="acc-declaration-row">
              <span class="acc-declaration-label">Ligne 08 - Operations imposables (HT)</span>
              <span class="acc-declaration-value">${formatCurrency(byRate.reduce(function(s, r) { return s + (r.sales_base || 0); }, 0))}</span>
            </div>
            <div class="acc-declaration-row">
              <span class="acc-declaration-label">Ligne 09 - Taux normal 20% (base)</span>
              <span class="acc-declaration-value">${formatCurrency(findRate(byRate, 20, 'sales_base'))}</span>
            </div>
            <div class="acc-declaration-row">
              <span class="acc-declaration-label">Ligne 09B - Taux normal 20% (taxe)</span>
              <span class="acc-declaration-value">${formatCurrency(findRate(byRate, 20, 'collected'))}</span>
            </div>
            <div class="acc-declaration-row">
              <span class="acc-declaration-label">Ligne 10 - Taux reduit 10% (base)</span>
              <span class="acc-declaration-value">${formatCurrency(findRate(byRate, 10, 'sales_base'))}</span>
            </div>
            <div class="acc-declaration-row">
              <span class="acc-declaration-label">Ligne 11 - Taux reduit 5.5% (base)</span>
              <span class="acc-declaration-value">${formatCurrency(findRate(byRate, 5.5, 'sales_base'))}</span>
            </div>
            <div class="acc-declaration-row">
              <span class="acc-declaration-label">Ligne 16 - Total TVA brute</span>
              <span class="acc-declaration-value">${formatCurrency(collected)}</span>
            </div>
            <div class="acc-declaration-row">
              <span class="acc-declaration-label">Ligne 20 - TVA deductible immobilisations</span>
              <span class="acc-declaration-value">${formatCurrency(0)}</span>
            </div>
            <div class="acc-declaration-row">
              <span class="acc-declaration-label">Ligne 21 - TVA deductible autres biens/services</span>
              <span class="acc-declaration-value">${formatCurrency(deductible)}</span>
            </div>
            <div class="acc-declaration-row acc-declaration-total ${net > 0 ? 'text-danger' : 'text-success'}">
              <span class="acc-declaration-label"><strong>${net > 0 ? 'Ligne 28 - TVA nette due' : 'Ligne 27 - Credit de TVA'}</strong></span>
              <span class="acc-declaration-value"><strong>${formatCurrency(Math.abs(net))}</strong></span>
            </div>
          </div>
        </div>

        <!-- Deadlines reminder -->
        <div class="acc-section">
          <h4>Echeances declaratives</h4>
          <div class="acc-deadlines">
            ${renderDeadlines()}
          </div>
        </div>
      </div>
    `;

    // Render chart
    renderChart(quarterly);
  }

  function getCurrentQuarter() {
    return Math.ceil((new Date().getMonth() + 1) / 3);
  }

  function findRate(byRate, rate, field) {
    var found = null;
    for (var i = 0; i < byRate.length; i++) {
      if (byRate[i].rate == rate) { found = byRate[i]; break; }
    }
    return found ? (found[field] || 0) : 0;
  }

  function renderDeadlines() {
    var now = new Date();
    var year = now.getFullYear();
    var deadlines = [
      { label: 'CA3 T1 (Jan-Mar)', date: new Date(year, 3, 24), period: 'T1' },
      { label: 'CA3 T2 (Avr-Jun)', date: new Date(year, 6, 24), period: 'T2' },
      { label: 'CA3 T3 (Jul-Sep)', date: new Date(year, 9, 24), period: 'T3' },
      { label: 'CA3 T4 (Oct-Dec)', date: new Date(year + 1, 0, 24), period: 'T4' }
    ];

    return deadlines.map(function(d) {
      var daysLeft = Math.ceil((d.date - now) / (1000 * 60 * 60 * 24));
      var isPast = daysLeft < 0;
      var isUrgent = daysLeft >= 0 && daysLeft <= 15;
      var cls = isPast ? 'acc-badge-danger' : isUrgent ? 'acc-badge-warning' : 'acc-badge-success';
      var statusText = isPast ? 'Depassee' : isUrgent ? daysLeft + 'j restants' : daysLeft + 'j';
      return `
        <div class="acc-deadline-item">
          <span class="acc-deadline-label">${d.label}</span>
          <span class="acc-deadline-date">${d.date.toLocaleDateString('fr-FR')}</span>
          <span class="acc-badge ${cls}">${statusText}</span>
        </div>
      `;
    }).join('');
  }

  function renderChart(quarterly) {
    var canvas = document.getElementById('tva-chart');
    if (!canvas || !window.Chart) return;
    var ctx = canvas.getContext('2d');

    if (canvas._chart) canvas._chart.destroy();

    var labels = quarterly.map(function(q) { return q.label || ('T' + q.quarter); });
    var docStyle = getComputedStyle(document.documentElement);
    var textPrimary = docStyle.getPropertyValue('--text-primary').trim() || '#fff';
    var textSecondary = docStyle.getPropertyValue('--text-secondary').trim() || '#999';

    canvas._chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'TVA collectee',
            data: quarterly.map(function(q) { return q.collected || 0; }),
            backgroundColor: 'rgba(239,68,68,0.7)',
            borderRadius: 4
          },
          {
            label: 'TVA deductible',
            data: quarterly.map(function(q) { return q.deductible || 0; }),
            backgroundColor: 'rgba(16,185,129,0.7)',
            borderRadius: 4
          },
          {
            label: 'Solde net',
            data: quarterly.map(function(q) { return (q.collected || 0) - (q.deductible || 0); }),
            type: 'line',
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: '#6366f1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textPrimary,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(tooltipCtx) {
                return tooltipCtx.dataset.label + ': ' + formatCurrency(tooltipCtx.raw);
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function(v) { return formatCurrency(v); },
              color: textSecondary
            },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          x: {
            ticks: { color: textSecondary },
            grid: { display: false }
          }
        }
      }
    });
  }

  // --- Actions ---
  async function handleAction(action, target) {
    switch(action) {
      case 'refresh-tva':
        await loadTva();
        break;

      case 'export-tva-declaration': {
        try {
          var yearEl = document.getElementById('tva-year');
          var quarterEl = document.getElementById('tva-quarter');
          var year = yearEl ? yearEl.value : new Date().getFullYear();
          var quarter = quarterEl ? quarterEl.value : getCurrentQuarter();
          showToast('Generation de la declaration TVA...', 'info');
          var blob = await AccountingApi.exportTvaDeclaration({ year: year, quarter: quarter });
          if (blob instanceof Blob) {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'declaration_tva_' + year + '_T' + quarter + '.pdf';
            a.click();
            URL.revokeObjectURL(url);
          }
          showToast('Declaration TVA exportee', 'success');
        } catch(e) {
          showToast('Erreur export TVA', 'error');
        }
        break;
      }
    }
  }

  async function loadTva() {
    try {
      var yearEl = document.getElementById('tva-year');
      var quarterEl = document.getElementById('tva-quarter');
      var year = yearEl ? yearEl.value : new Date().getFullYear();
      var quarter = quarterEl ? quarterEl.value : getCurrentQuarter();
      var result = await AccountingApi.getTvaSummary({ year: year, quarter: quarter });
      AccState.setState('tva', result || {});
      var container = document.querySelector('.acc-tab-content');
      if (container) render(container);
    } catch(e) {
      console.error('Erreur chargement TVA:', e);
      // Render with empty data so the UI is still usable
      var container = document.querySelector('.acc-tab-content');
      if (container) render(container);
    }
  }

  // --- Helpers ---
  function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  }

  function showToast(msg, type) {
    if (window.Toast) { Toast.show(msg, type); return; }
    if (window.showToast) { window.showToast(msg, type); return; }
    console.log('[' + type + '] ' + msg);
  }

  return { render: render, handleAction: handleAction, loadTva: loadTva };
})();

if (typeof window !== 'undefined') window.AccTva = AccTva;
