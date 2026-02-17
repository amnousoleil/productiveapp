/**
 * Module Comptabilite - Budgets
 * @description Gestion des budgets par departement avec suivi des ecarts
 */
const AccBudgets = (function() {
  'use strict';

  function render(container) {
    const state = AccState.getState();
    const departments = state.departments || [];
    const budgets = state.budgets || [];

    // Calculate totals
    const totalBudget = budgets.reduce((s, b) => s + (parseFloat(b.planned) || 0), 0);
    const totalActual = budgets.reduce((s, b) => s + (parseFloat(b.actual) || 0), 0);
    const totalVariance = totalBudget - totalActual;
    const variancePercent = totalBudget > 0 ? ((totalVariance / totalBudget) * 100).toFixed(1) : 0;

    container.innerHTML = `
      <div class="acc-budgets-module">
        <!-- KPI Cards -->
        <div class="acc-stats-row">
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:var(--accent-primary,#3b82f6)">📊</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${formatCurrency(totalBudget)}</span>
              <span class="acc-stat-label">Budget total</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#f59e0b">💰</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${formatCurrency(totalActual)}</span>
              <span class="acc-stat-label">Depense</span>
            </div>
          </div>
          <div class="acc-stat-card ${totalVariance < 0 ? 'acc-card-danger' : ''}">
            <div class="acc-stat-icon" style="background:${totalVariance >= 0 ? '#10b981' : '#ef4444'}">${totalVariance >= 0 ? '✅' : '⚠️'}</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${formatCurrency(Math.abs(totalVariance))}</span>
              <span class="acc-stat-label">${totalVariance >= 0 ? 'Sous budget' : 'Depassement'} (${variancePercent}%)</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#8b5cf6">🏢</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${departments.length}</span>
              <span class="acc-stat-label">Departements</span>
            </div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="acc-toolbar">
          <button class="acc-btn acc-btn-primary" data-action="new-department">
            + Nouveau departement
          </button>
          <div class="acc-filter-group">
            <select class="acc-select" id="budget-year">
              ${[2026, 2025, 2024].map(y => `<option value="${y}" ${y === new Date().getFullYear() ? 'selected' : ''}>${y}</option>`).join('')}
            </select>
            <select class="acc-select" id="budget-month">
              <option value="">Tous les mois</option>
              ${['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'].map((m, i) => `<option value="${i + 1}" ${(i + 1) === new Date().getMonth() + 1 ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
            <button class="acc-btn" data-action="refresh-budgets">Actualiser</button>
          </div>
        </div>

        <!-- Budget chart -->
        <div class="acc-section">
          <h4>Repartition budgetaire</h4>
          <div class="acc-chart-container" style="height:300px">
            <canvas id="budget-chart"></canvas>
          </div>
        </div>

        <!-- Department budgets table -->
        <div class="acc-section">
          <h4>Budgets par departement</h4>
          <div class="acc-table-container">
            ${departments.length === 0 ? renderEmpty() : renderDepartmentsTable(departments, budgets)}
          </div>
        </div>
      </div>
    `;

    renderBudgetChart(departments, budgets);
  }

  function renderEmpty() {
    return `
      <div class="acc-empty-state">
        <div class="acc-empty-icon">📊</div>
        <h3>Aucun departement configure</h3>
        <p>Creez des departements pour commencer le suivi budgetaire.</p>
        <button class="acc-btn acc-btn-primary" data-action="new-department">Creer un departement</button>
      </div>
    `;
  }

  function renderDepartmentsTable(departments, budgets) {
    return `
      <table class="acc-table">
        <thead>
          <tr>
            <th>Departement</th>
            <th>Code</th>
            <th>Budget prevu</th>
            <th>Realise</th>
            <th>Ecart</th>
            <th>Progression</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${departments.map(dept => {
            const deptBudget = budgets.find(b => b.department_id === dept.id) || {};
            const planned = parseFloat(deptBudget.planned) || parseFloat(dept.annual_budget) || 0;
            const actual = parseFloat(deptBudget.actual) || 0;
            const variance = planned - actual;
            const progress = planned > 0 ? Math.min((actual / planned) * 100, 150) : 0;
            const isOver = actual > planned && planned > 0;
            return `
              <tr>
                <td>
                  <div class="acc-dept-name">
                    <span class="acc-dept-color" style="background:${dept.color || '#6b7280'}"></span>
                    <strong>${escapeHtml(dept.name)}</strong>
                  </div>
                </td>
                <td><code>${escapeHtml(dept.code || '-')}</code></td>
                <td class="acc-amount">${formatCurrency(planned)}</td>
                <td class="acc-amount">${formatCurrency(actual)}</td>
                <td class="acc-amount ${isOver ? 'text-danger' : 'text-success'}">
                  ${isOver ? '-' : '+'}${formatCurrency(Math.abs(variance))}
                </td>
                <td>
                  <div class="acc-progress-bar">
                    <div class="acc-progress-fill ${isOver ? 'danger' : progress > 80 ? 'warning' : 'success'}" style="width:${Math.min(progress, 100)}%"></div>
                    <span class="acc-progress-text">${progress.toFixed(0)}%</span>
                  </div>
                </td>
                <td>
                  <div class="acc-action-btns">
                    <button class="acc-btn-icon" data-action="edit-budget" data-id="${dept.id}" title="Modifier budget">📝</button>
                    <button class="acc-btn-icon" data-action="edit-department" data-id="${dept.id}" title="Modifier departement">⚙️</button>
                    <button class="acc-btn-icon acc-btn-danger" data-action="delete-department" data-id="${dept.id}" title="Supprimer">🗑</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  function renderBudgetChart(departments, budgets) {
    const canvas = document.getElementById('budget-chart');
    if (!canvas || !window.Chart) return;
    const ctx = canvas.getContext('2d');
    if (canvas._chart) canvas._chart.destroy();

    const labels = departments.map(d => d.name);
    const planned = departments.map(d => {
      const b = budgets.find(b => b.department_id === d.id);
      return parseFloat(b?.planned) || parseFloat(d.annual_budget) || 0;
    });
    const actual = departments.map(d => {
      const b = budgets.find(b => b.department_id === d.id);
      return parseFloat(b?.actual) || 0;
    });

    canvas._chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Budget prevu', data: planned, backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 4 },
          { label: 'Realise', data: actual, backgroundColor: departments.map((d, i) => actual[i] > planned[i] ? 'rgba(239,68,68,0.7)' : 'rgba(16,185,129,0.7)'), borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#fff' } },
          tooltip: { callbacks: { label: c => `${c.dataset.label}: ${formatCurrency(c.raw)}` } }
        },
        scales: {
          y: { ticks: { callback: v => formatCurrency(v), color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#999' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#999' }, grid: { display: false } }
        }
      }
    });
  }

  // --- Modals ---
  function showDepartmentModal(dept) {
    const isEdit = !!dept;
    const modal = document.createElement('div');
    modal.className = 'acc-modal-overlay';
    modal.innerHTML = `
      <div class="acc-modal">
        <div class="acc-modal-header">
          <h3>${isEdit ? 'Modifier' : 'Nouveau'} departement</h3>
          <button class="acc-modal-close" data-action="close-modal">&times;</button>
        </div>
        <div class="acc-modal-body">
          <div class="acc-form-group">
            <label>Nom *</label>
            <input type="text" class="acc-input" id="dept-name" value="${isEdit ? escapeHtml(dept.name) : ''}" placeholder="Ex: Marketing">
          </div>
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>Code</label>
              <input type="text" class="acc-input" id="dept-code" value="${isEdit ? escapeHtml(dept.code || '') : ''}" placeholder="Ex: MKT">
            </div>
            <div class="acc-form-group">
              <label>Couleur</label>
              <input type="color" class="acc-input" id="dept-color" value="${dept?.color || '#3b82f6'}" style="height:40px">
            </div>
          </div>
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>Budget annuel</label>
              <input type="number" class="acc-input" id="dept-annual-budget" value="${dept?.annual_budget || ''}" step="100" min="0" placeholder="50000">
            </div>
            <div class="acc-form-group">
              <label>Budget mensuel</label>
              <input type="number" class="acc-input" id="dept-monthly-budget" value="${dept?.monthly_budget || ''}" step="100" min="0" placeholder="4000">
            </div>
          </div>
          <div class="acc-form-group">
            <label>Manager</label>
            <input type="text" class="acc-input" id="dept-manager" value="${isEdit ? escapeHtml(dept.manager_name || '') : ''}" placeholder="Nom du responsable">
          </div>
        </div>
        <div class="acc-modal-footer">
          <button class="acc-btn" data-action="close-modal">Annuler</button>
          <button class="acc-btn acc-btn-primary" data-action="save-department" ${isEdit ? `data-id="${dept.id}"` : ''}>
            ${isEdit ? 'Modifier' : 'Creer'}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#dept-name')?.focus();
  }

  function showBudgetModal(deptId) {
    const dept = (AccState.getState().departments || []).find(d => d.id === deptId);
    if (!dept) return;
    const categories = AccState.getState().categories || [];
    const month = document.getElementById('budget-month')?.value || (new Date().getMonth() + 1);
    const year = document.getElementById('budget-year')?.value || new Date().getFullYear();

    const modal = document.createElement('div');
    modal.className = 'acc-modal-overlay';
    modal.innerHTML = `
      <div class="acc-modal">
        <div class="acc-modal-header">
          <h3>Budget - ${escapeHtml(dept.name)}</h3>
          <button class="acc-modal-close" data-action="close-modal">&times;</button>
        </div>
        <div class="acc-modal-body">
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>Annee</label>
              <input type="number" class="acc-input" id="bl-year" value="${year}" min="2020" max="2030">
            </div>
            <div class="acc-form-group">
              <label>Mois</label>
              <select class="acc-select" id="bl-month">
                ${['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'].map((m, i) => `<option value="${i + 1}" ${(i + 1) == month ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="acc-form-group">
            <label>Categorie</label>
            <select class="acc-select" id="bl-category">
              <option value="">Toutes categories</option>
              ${categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
            </select>
          </div>
          <div class="acc-form-group">
            <label>Montant prevu</label>
            <input type="number" class="acc-input" id="bl-amount" step="100" min="0" placeholder="10000">
          </div>
        </div>
        <div class="acc-modal-footer">
          <button class="acc-btn" data-action="close-modal">Annuler</button>
          <button class="acc-btn acc-btn-primary" data-action="save-budget-line" data-dept-id="${deptId}">Enregistrer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // --- Event handlers ---
  async function handleAction(action, target) {
    const id = target.dataset?.id;

    switch(action) {
      case 'new-department':
        showDepartmentModal(null);
        break;

      case 'edit-department': {
        const dept = (AccState.getState().departments || []).find(d => d.id === id);
        if (dept) showDepartmentModal(dept);
        break;
      }

      case 'save-department': {
        const name = document.getElementById('dept-name')?.value?.trim();
        if (!name) { showToast('Nom requis', 'error'); return; }
        const data = {
          name,
          code: document.getElementById('dept-code')?.value?.trim() || '',
          color: document.getElementById('dept-color')?.value || '#3b82f6',
          annual_budget: parseFloat(document.getElementById('dept-annual-budget')?.value) || 0,
          monthly_budget: parseFloat(document.getElementById('dept-monthly-budget')?.value) || 0,
          manager_name: document.getElementById('dept-manager')?.value?.trim() || ''
        };
        try {
          if (id) {
            await AccountingApi.updateDepartment(id, data);
          } else {
            await AccountingApi.createDepartment(data);
          }
          closeModal();
          showToast('Departement enregistre', 'success');
          await loadBudgets();
        } catch(e) {
          showToast('Erreur: ' + (e.message || 'Echec'), 'error');
        }
        break;
      }

      case 'delete-department': {
        if (!confirm('Supprimer ce departement ?')) return;
        try {
          await AccountingApi.deleteDepartment(id);
          showToast('Departement supprime', 'success');
          await loadBudgets();
        } catch(e) {
          showToast('Erreur suppression', 'error');
        }
        break;
      }

      case 'edit-budget':
        showBudgetModal(id);
        break;

      case 'save-budget-line': {
        const deptId = target.dataset?.deptId;
        const amount = parseFloat(document.getElementById('bl-amount')?.value) || 0;
        if (!amount) { showToast('Montant requis', 'error'); return; }
        try {
          await AccountingApi.setBudgetLine({
            department_id: deptId,
            year: parseInt(document.getElementById('bl-year')?.value) || new Date().getFullYear(),
            month: parseInt(document.getElementById('bl-month')?.value) || (new Date().getMonth() + 1),
            category_id: document.getElementById('bl-category')?.value || null,
            planned: amount
          });
          closeModal();
          showToast('Budget enregistre', 'success');
          await loadBudgets();
        } catch(e) {
          showToast('Erreur: ' + (e.message || 'Echec'), 'error');
        }
        break;
      }

      case 'refresh-budgets':
        await loadBudgets();
        break;

      case 'close-modal':
        closeModal();
        break;
    }
  }

  async function loadBudgets() {
    try {
      const [depts, budget] = await Promise.all([
        AccountingApi.listDepartments(),
        AccountingApi.getBudgetOverview({
          year: document.getElementById('budget-year')?.value || new Date().getFullYear(),
          month: document.getElementById('budget-month')?.value || undefined
        })
      ]);
      AccState.setState('departments', depts.data || depts || []);
      AccState.setState('budgets', budget.data || budget || []);
      const container = document.querySelector('.acc-tab-content');
      if (container) render(container);
    } catch(e) {
      console.error('Erreur chargement budgets:', e);
      const container = document.querySelector('.acc-tab-content');
      if (container) render(container);
    }
  }

  // --- Helpers ---
  function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  }
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function closeModal() { document.querySelector('.acc-modal-overlay')?.remove(); }
  function showToast(msg, type) {
    if (window.Toast) { Toast.show(msg, type); return; }
    if (window.showToast) { window.showToast(msg, type); return; }
  }

  return { render, handleAction, loadBudgets };
})();

if (typeof window !== 'undefined') window.AccBudgets = AccBudgets;
