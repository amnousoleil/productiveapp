/**
 * Module Comptabilite - Notes de Frais
 * @description Gestion des notes de frais avec workflow validation
 */
const AccExpenses = (function() {
  'use strict';

  // --- Render main view ---
  function render(container) {
    const state = AccState.getState();
    const expenses = state.expenses || [];
    const stats = computeStats(expenses);

    container.innerHTML = `
      <div class="acc-expenses-module">
        <!-- Stats cards -->
        <div class="acc-stats-row">
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:var(--accent-primary,#3b82f6)">📋</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${stats.total}</span>
              <span class="acc-stat-label">Total notes</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#f59e0b">⏳</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${stats.pending}</span>
              <span class="acc-stat-label">En attente</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#10b981">✅</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${formatCurrency(stats.approved)}</span>
              <span class="acc-stat-label">Approuvees</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#8b5cf6">💰</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${formatCurrency(stats.reimbursed)}</span>
              <span class="acc-stat-label">Remboursees</span>
            </div>
          </div>
        </div>

        <!-- Actions bar -->
        <div class="acc-toolbar">
          <button class="acc-btn acc-btn-primary" data-action="new-expense">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvelle note de frais
          </button>
          <div class="acc-filter-group">
            <select class="acc-select" data-filter="expense-status">
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="submitted">Soumise</option>
              <option value="approved">Approuvee</option>
              <option value="rejected">Rejetee</option>
              <option value="reimbursed">Remboursee</option>
            </select>
          </div>
        </div>

        <!-- Expense reports list -->
        <div class="acc-table-container">
          ${expenses.length === 0 ? renderEmpty() : renderTable(expenses)}
        </div>
      </div>
    `;
  }

  function computeStats(expenses) {
    return {
      total: expenses.length,
      pending: expenses.filter(function(e) { return e.status === 'submitted'; }).length,
      approved: expenses.filter(function(e) { return e.status === 'approved'; }).reduce(function(s, e) { return s + (parseFloat(e.total_ttc) || 0); }, 0),
      reimbursed: expenses.filter(function(e) { return e.status === 'reimbursed'; }).reduce(function(s, e) { return s + (parseFloat(e.total_ttc) || 0); }, 0)
    };
  }

  function renderEmpty() {
    return `
      <div class="acc-empty-state">
        <div class="acc-empty-icon">📋</div>
        <h3>Aucune note de frais</h3>
        <p>Creez votre premiere note de frais pour commencer le suivi.</p>
        <button class="acc-btn acc-btn-primary" data-action="new-expense">Creer une note de frais</button>
      </div>
    `;
  }

  function renderTable(expenses) {
    return `
      <table class="acc-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Articles</th>
            <th>Montant TTC</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map(function(e) { return `
            <tr class="acc-table-row" data-id="${e.id}">
              <td>
                <strong>${escapeHtml(e.title)}</strong>
                ${e.description ? '<br><small class="text-muted">' + escapeHtml(e.description) + '</small>' : ''}
              </td>
              <td>${formatDate(e.created_at)}</td>
              <td>${renderStatusBadge(e.status)}</td>
              <td>${e.item_count || 0} article(s)</td>
              <td class="acc-amount">${formatCurrency(e.total_ttc || 0)}</td>
              <td>
                <div class="acc-action-btns">
                  <button class="acc-btn-icon" data-action="view-expense" data-id="${e.id}" title="Voir">👁</button>
                  ${e.status === 'draft' ? `
                    <button class="acc-btn-icon" data-action="edit-expense" data-id="${e.id}" title="Modifier">✏️</button>
                    <button class="acc-btn-icon" data-action="submit-expense" data-id="${e.id}" title="Soumettre">📤</button>
                    <button class="acc-btn-icon acc-btn-danger" data-action="delete-expense" data-id="${e.id}" title="Supprimer">🗑</button>
                  ` : ''}
                  ${e.status === 'submitted' ? `
                    <button class="acc-btn-icon acc-btn-success" data-action="approve-expense" data-id="${e.id}" title="Approuver">✅</button>
                    <button class="acc-btn-icon acc-btn-danger" data-action="reject-expense" data-id="${e.id}" title="Rejeter">❌</button>
                  ` : ''}
                  ${e.status === 'approved' ? `
                    <button class="acc-btn-icon" data-action="reimburse-expense" data-id="${e.id}" title="Rembourser">💰</button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `; }).join('')}
        </tbody>
      </table>
    `;
  }

  function renderStatusBadge(status) {
    var map = {
      draft: { label: 'Brouillon', cls: 'neutral' },
      submitted: { label: 'Soumise', cls: 'warning' },
      approved: { label: 'Approuvee', cls: 'success' },
      rejected: { label: 'Rejetee', cls: 'danger' },
      reimbursed: { label: 'Remboursee', cls: 'info' }
    };
    var s = map[status] || { label: status, cls: 'neutral' };
    return '<span class="acc-badge acc-badge-' + s.cls + '">' + s.label + '</span>';
  }

  // --- Detail view ---
  function renderDetail(container, report) {
    var items = report.items || [];
    container.innerHTML = `
      <div class="acc-expense-detail">
        <div class="acc-detail-header">
          <button class="acc-btn acc-btn-ghost" data-action="back-expenses">← Retour</button>
          <h3>${escapeHtml(report.title)}</h3>
          ${renderStatusBadge(report.status)}
        </div>

        <div class="acc-detail-meta">
          <div><strong>Description :</strong> ${escapeHtml(report.description || 'Aucune')}</div>
          <div><strong>Creee le :</strong> ${formatDate(report.created_at)}</div>
          <div><strong>Montant total :</strong> ${formatCurrency(report.total_ttc || 0)}</div>
          ${report.rejection_reason ? '<div class="acc-alert-warning"><strong>Motif de rejet :</strong> ' + escapeHtml(report.rejection_reason) + '</div>' : ''}
        </div>

        <!-- Items -->
        <div class="acc-section">
          <div class="acc-section-header">
            <h4>Articles (${items.length})</h4>
            ${report.status === 'draft' ? `
              <button class="acc-btn acc-btn-sm" data-action="add-expense-item" data-id="${report.id}">+ Ajouter</button>
            ` : ''}
          </div>
          ${items.length === 0 ? '<p class="text-muted">Aucun article ajoute.</p>' : `
            <table class="acc-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Categorie</th>
                  <th>Montant TTC</th>
                  <th>Justificatif</th>
                  ${report.status === 'draft' ? '<th>Actions</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${items.map(function(item) { return `
                  <tr>
                    <td>${escapeHtml(item.description)}</td>
                    <td>${formatDate(item.expense_date)}</td>
                    <td>${escapeHtml(item.category || '-')}</td>
                    <td class="acc-amount">${formatCurrency(item.amount_ttc || 0)}</td>
                    <td>${item.receipt_url ? '<span class="acc-badge acc-badge-success">✓</span>' : '<span class="acc-badge acc-badge-neutral">-</span>'}</td>
                    ${report.status === 'draft' ? `
                      <td>
                        <button class="acc-btn-icon acc-btn-danger" data-action="remove-expense-item" data-report-id="${report.id}" data-item-id="${item.id}">🗑</button>
                      </td>
                    ` : ''}
                  </tr>
                `; }).join('')}
              </tbody>
            </table>
          `}
        </div>

        <!-- Workflow actions -->
        <div class="acc-detail-actions">
          ${report.status === 'draft' ? `
            <button class="acc-btn acc-btn-primary" data-action="submit-expense" data-id="${report.id}">📤 Soumettre pour validation</button>
          ` : ''}
          ${report.status === 'submitted' ? `
            <button class="acc-btn acc-btn-success" data-action="approve-expense" data-id="${report.id}">✅ Approuver</button>
            <button class="acc-btn acc-btn-danger" data-action="reject-expense" data-id="${report.id}">❌ Rejeter</button>
          ` : ''}
          ${report.status === 'approved' ? `
            <button class="acc-btn acc-btn-primary" data-action="reimburse-expense" data-id="${report.id}">💰 Marquer comme remboursee</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // --- Modals ---
  function showCreateModal() {
    var modal = document.createElement('div');
    modal.className = 'acc-modal-overlay';
    modal.innerHTML = `
      <div class="acc-modal">
        <div class="acc-modal-header">
          <h3>Nouvelle note de frais</h3>
          <button class="acc-modal-close" data-action="close-modal">&times;</button>
        </div>
        <div class="acc-modal-body">
          <div class="acc-form-group">
            <label>Titre *</label>
            <input type="text" class="acc-input" id="expense-title" placeholder="Ex: Deplacement client Mars 2026">
          </div>
          <div class="acc-form-group">
            <label>Description</label>
            <textarea class="acc-input" id="expense-description" rows="3" placeholder="Details de la note de frais..."></textarea>
          </div>
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>Departement</label>
              <select class="acc-select" id="expense-department">
                <option value="">Aucun</option>
                ${(AccState.getState().departments || []).map(function(d) { return '<option value="' + d.id + '">' + escapeHtml(d.name) + '</option>'; }).join('')}
              </select>
            </div>
          </div>
        </div>
        <div class="acc-modal-footer">
          <button class="acc-btn" data-action="close-modal">Annuler</button>
          <button class="acc-btn acc-btn-primary" data-action="save-expense">Creer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    var titleInput = modal.querySelector('#expense-title');
    if (titleInput) titleInput.focus();
  }

  function showAddItemModal(reportId) {
    var modal = document.createElement('div');
    modal.className = 'acc-modal-overlay';
    modal.innerHTML = `
      <div class="acc-modal">
        <div class="acc-modal-header">
          <h3>Ajouter un article</h3>
          <button class="acc-modal-close" data-action="close-modal">&times;</button>
        </div>
        <div class="acc-modal-body">
          <div class="acc-form-group">
            <label>Description *</label>
            <input type="text" class="acc-input" id="item-description" placeholder="Ex: Taxi aeroport">
          </div>
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>Montant HT *</label>
              <input type="number" class="acc-input" id="item-amount-ht" step="0.01" min="0">
            </div>
            <div class="acc-form-group">
              <label>TVA %</label>
              <input type="number" class="acc-input" id="item-tva" value="20" step="0.1">
            </div>
            <div class="acc-form-group">
              <label>Montant TTC</label>
              <input type="number" class="acc-input" id="item-amount-ttc" step="0.01" readonly>
            </div>
          </div>
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>Date</label>
              <input type="date" class="acc-input" id="item-date" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="acc-form-group">
              <label>Categorie</label>
              <select class="acc-select" id="item-category">
                <option value="">Selectionner</option>
                <option value="transport">Transport</option>
                <option value="hebergement">Hebergement</option>
                <option value="restauration">Restauration</option>
                <option value="fournitures">Fournitures</option>
                <option value="telecom">Telecom</option>
                <option value="formation">Formation</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          <div class="acc-form-group">
            <label>Commercant</label>
            <input type="text" class="acc-input" id="item-merchant" placeholder="Nom du commercant">
          </div>
          <div class="acc-form-group">
            <label>Justificatif (photo/scan)</label>
            <div class="acc-upload-zone" id="item-receipt-zone">
              <input type="file" id="item-receipt" accept="image/*,application/pdf" capture="environment" style="display:none">
              <p>📷 Cliquez ou glissez un justificatif</p>
            </div>
            <div id="item-receipt-preview" style="display:none"></div>
          </div>
        </div>
        <div class="acc-modal-footer">
          <button class="acc-btn" data-action="close-modal">Annuler</button>
          <button class="acc-btn acc-btn-primary" data-action="save-expense-item" data-report-id="${reportId}">Ajouter</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Auto-calculate TTC
    var htInput = modal.querySelector('#item-amount-ht');
    var tvaInput = modal.querySelector('#item-tva');
    var ttcInput = modal.querySelector('#item-amount-ttc');
    var calc = function() {
      var ht = parseFloat(htInput.value) || 0;
      var tva = parseFloat(tvaInput.value) || 0;
      ttcInput.value = (ht * (1 + tva / 100)).toFixed(2);
    };
    htInput.addEventListener('input', calc);
    tvaInput.addEventListener('input', calc);

    // Upload zone
    var zone = modal.querySelector('#item-receipt-zone');
    var fileInput = modal.querySelector('#item-receipt');
    zone.addEventListener('click', function() { fileInput.click(); });
    fileInput.addEventListener('change', function() {
      if (fileInput.files[0]) {
        var preview = modal.querySelector('#item-receipt-preview');
        preview.style.display = 'block';
        preview.innerHTML = '<span class="acc-badge acc-badge-success">📎 ' + fileInput.files[0].name + '</span>';
        zone.style.display = 'none';
      }
    });

    var descInput = modal.querySelector('#item-description');
    if (descInput) descInput.focus();
  }

  // --- Event handlers ---
  async function handleAction(action, target) {
    var id = target.dataset ? target.dataset.id : undefined;

    switch(action) {
      case 'new-expense':
        showCreateModal();
        break;

      case 'save-expense': {
        var titleEl = document.getElementById('expense-title');
        var title = titleEl ? titleEl.value.trim() : '';
        if (!title) { showToast('Le titre est requis', 'error'); return; }
        try {
          var descEl = document.getElementById('expense-description');
          var deptEl = document.getElementById('expense-department');
          await AccountingApi.createExpenseReport({
            title: title,
            description: descEl ? descEl.value.trim() : '',
            department_id: deptEl ? (deptEl.value || null) : null
          });
          closeModal();
          showToast('Note de frais creee', 'success');
          await loadExpenses();
        } catch(e) {
          showToast('Erreur: ' + (e.message || 'Creation echouee'), 'error');
        }
        break;
      }

      case 'view-expense': {
        try {
          var report = await AccountingApi.getExpenseReport(id);
          var container = document.querySelector('.acc-expenses-module') || document.querySelector('.acc-tab-content');
          if (container && report) renderDetail(container, report);
        } catch(e) {
          showToast('Erreur chargement', 'error');
        }
        break;
      }

      case 'back-expenses':
        await loadExpenses();
        break;

      case 'submit-expense': {
        if (!confirm('Soumettre cette note de frais pour validation ?')) return;
        try {
          await AccountingApi.submitExpenseReport(id);
          showToast('Note soumise pour validation', 'success');
          await loadExpenses();
        } catch(e) {
          showToast('Erreur soumission', 'error');
        }
        break;
      }

      case 'approve-expense': {
        if (!confirm('Approuver cette note de frais ?')) return;
        try {
          await AccountingApi.approveExpenseReport(id);
          showToast('Note approuvee', 'success');
          await loadExpenses();
        } catch(e) {
          showToast('Erreur approbation', 'error');
        }
        break;
      }

      case 'reject-expense': {
        var reason = prompt('Motif du rejet :');
        if (reason === null) return;
        try {
          await AccountingApi.rejectExpenseReport(id, reason);
          showToast('Note rejetee', 'success');
          await loadExpenses();
        } catch(e) {
          showToast('Erreur rejet', 'error');
        }
        break;
      }

      case 'reimburse-expense': {
        if (!confirm('Marquer comme remboursee ?')) return;
        try {
          await AccountingApi.reimburseExpenseReport(id);
          showToast('Note remboursee', 'success');
          await loadExpenses();
        } catch(e) {
          showToast('Erreur remboursement', 'error');
        }
        break;
      }

      case 'delete-expense': {
        if (!confirm('Supprimer cette note de frais ?')) return;
        try {
          await AccountingApi.deleteExpenseReport(id);
          showToast('Note supprimee', 'success');
          await loadExpenses();
        } catch(e) {
          showToast('Erreur suppression', 'error');
        }
        break;
      }

      case 'add-expense-item':
        showAddItemModal(id);
        break;

      case 'save-expense-item': {
        var reportId = target.dataset ? target.dataset.reportId : undefined;
        var descEl2 = document.getElementById('item-description');
        var desc = descEl2 ? descEl2.value.trim() : '';
        var amountHtEl = document.getElementById('item-amount-ht');
        var amountHt = parseFloat(amountHtEl ? amountHtEl.value : '') || 0;
        if (!desc || !amountHt) { showToast('Description et montant requis', 'error'); return; }
        try {
          var formData = new FormData();
          formData.append('description', desc);
          formData.append('amount_ht', amountHt.toString());
          var tvaEl = document.getElementById('item-tva');
          formData.append('tva_rate', tvaEl ? tvaEl.value : '20');
          var ttcEl = document.getElementById('item-amount-ttc');
          formData.append('amount_ttc', ttcEl ? ttcEl.value : '0');
          var dateEl = document.getElementById('item-date');
          formData.append('expense_date', dateEl ? dateEl.value : '');
          var catEl = document.getElementById('item-category');
          formData.append('category', catEl ? catEl.value : '');
          var merchantEl = document.getElementById('item-merchant');
          formData.append('merchant', merchantEl ? merchantEl.value : '');
          var receiptInput = document.getElementById('item-receipt');
          var receiptFile = receiptInput && receiptInput.files ? receiptInput.files[0] : null;
          if (receiptFile) formData.append('receipt', receiptFile);
          await AccountingApi.addExpenseItem(reportId, formData);
          closeModal();
          showToast('Article ajoute', 'success');
          // Refresh detail view
          var updatedReport = await AccountingApi.getExpenseReport(reportId);
          var detailParent = document.querySelector('.acc-expense-detail');
          var detailContainer = detailParent ? detailParent.parentElement : document.querySelector('.acc-tab-content');
          if (detailContainer && updatedReport) renderDetail(detailContainer, updatedReport);
        } catch(e) {
          showToast('Erreur ajout article', 'error');
        }
        break;
      }

      case 'remove-expense-item': {
        var rptId = target.dataset ? target.dataset.reportId : undefined;
        var itemId = target.dataset ? target.dataset.itemId : undefined;
        if (!confirm('Supprimer cet article ?')) return;
        try {
          await AccountingApi.removeExpenseItem(rptId, itemId);
          showToast('Article supprime', 'success');
          var rpt = await AccountingApi.getExpenseReport(rptId);
          var detailEl = document.querySelector('.acc-expense-detail');
          var ctn = detailEl ? detailEl.parentElement : document.querySelector('.acc-tab-content');
          if (ctn && rpt) renderDetail(ctn, rpt);
        } catch(e) {
          showToast('Erreur suppression', 'error');
        }
        break;
      }

      case 'close-modal':
        closeModal();
        break;
    }
  }

  // --- Data loading ---
  async function loadExpenses() {
    try {
      var statusEl = document.querySelector('[data-filter="expense-status"]');
      var statusFilter = statusEl ? statusEl.value : '';
      var params = {};
      if (statusFilter) params.status = statusFilter;
      var result = await AccountingApi.listExpenseReports(params);
      AccState.setState('expenses', result.data || result || []);
      var container = document.querySelector('.acc-tab-content');
      if (container) render(container);
    } catch(e) {
      console.error('Erreur chargement notes de frais:', e);
    }
  }

  // --- Helpers ---
  function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  }

  function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR');
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function closeModal() {
    var overlay = document.querySelector('.acc-modal-overlay');
    if (overlay) overlay.remove();
  }

  function showToast(msg, type) {
    if (window.Toast) { Toast.show(msg, type); return; }
    if (window.showToast) { window.showToast(msg, type); return; }
    console.log('[' + type + '] ' + msg);
  }

  return { render: render, handleAction: handleAction, loadExpenses: loadExpenses };
})();

if (typeof window !== 'undefined') window.AccExpenses = AccExpenses;
