/**
 * Module Comptabilite - Banque
 * @description Rapprochement bancaire avec import et auto-match IA
 */
const AccBank = (function() {
  'use strict';

  function render(container) {
    const state = AccState.getState();
    const transactions = state.bankTransactions || [];
    const stats = computeStats(transactions);

    container.innerHTML = `
      <div class="acc-bank-module">
        <!-- KPI Cards -->
        <div class="acc-stats-row">
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:var(--accent-primary,#3b82f6)">🏦</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${stats.total}</span>
              <span class="acc-stat-label">Transactions</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#10b981">✅</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${stats.reconciled}</span>
              <span class="acc-stat-label">Rapprochees</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#f59e0b">⏳</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${stats.unreconciled}</span>
              <span class="acc-stat-label">En attente</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#8b5cf6">🤖</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${stats.autoMatched}</span>
              <span class="acc-stat-label">Auto-matchees IA</span>
            </div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="acc-toolbar">
          <div class="acc-btn-group">
            <button class="acc-btn acc-btn-primary" data-action="import-bank">
              📥 Importer un releve
            </button>
            <button class="acc-btn" data-action="auto-match">
              🤖 Auto-match IA
            </button>
          </div>
          <div class="acc-filter-group">
            <select class="acc-select" data-filter="bank-status">
              <option value="">Toutes</option>
              <option value="unreconciled">Non rapprochees</option>
              <option value="reconciled">Rapprochees</option>
              <option value="auto_matched">Auto-matchees</option>
            </select>
            <select class="acc-select" data-filter="bank-type">
              <option value="">Type</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
            </select>
          </div>
        </div>

        <!-- Transactions table -->
        <div class="acc-table-container">
          ${transactions.length === 0 ? renderEmpty() : renderTable(transactions)}
        </div>
      </div>
    `;
  }

  function computeStats(transactions) {
    return {
      total: transactions.length,
      reconciled: transactions.filter(t => t.reconciled || t.invoice_id).length,
      unreconciled: transactions.filter(t => !t.reconciled && !t.invoice_id).length,
      autoMatched: transactions.filter(t => t.auto_matched || t.ai_confidence).length
    };
  }

  function renderEmpty() {
    return `
      <div class="acc-empty-state">
        <div class="acc-empty-icon">🏦</div>
        <h3>Aucune transaction bancaire</h3>
        <p>Importez un releve bancaire (CSV/OFX) pour commencer le rapprochement.</p>
        <button class="acc-btn acc-btn-primary" data-action="import-bank">Importer un releve</button>
      </div>
    `;
  }

  function renderTable(transactions) {
    return `
      <table class="acc-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th>Montant</th>
            <th>Rapprochement</th>
            <th>Confiance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => {
            const isCredit = t.type === 'credit';
            const isReconciled = t.reconciled || t.invoice_id;
            return `
              <tr class="acc-table-row ${isReconciled ? 'reconciled' : ''}">
                <td>${formatDate(t.transaction_date || t.date)}</td>
                <td>
                  <strong>${escapeHtml(t.description || t.label)}</strong>
                  ${t.counterparty ? `<br><small class="text-muted">${escapeHtml(t.counterparty)}</small>` : ''}
                </td>
                <td><span class="acc-badge ${isCredit ? 'acc-badge-success' : 'acc-badge-danger'}">${isCredit ? '↑ Credit' : '↓ Debit'}</span></td>
                <td class="acc-amount ${isCredit ? 'text-success' : 'text-danger'}">
                  ${isCredit ? '+' : '-'}${formatCurrency(Math.abs(parseFloat(t.amount) || 0))}
                </td>
                <td>
                  ${isReconciled
                    ? `<span class="acc-badge acc-badge-success">✓ Rapprochee</span>${t.invoice_reference ? `<br><small>${escapeHtml(t.invoice_reference)}</small>` : ''}`
                    : t.ai_confidence
                      ? `<span class="acc-badge acc-badge-warning">🤖 ${Math.round(t.ai_confidence * 100)}%</span>`
                      : '<span class="acc-badge acc-badge-neutral">—</span>'}
                </td>
                <td>
                  ${t.ai_confidence ? renderConfidenceBar(t.ai_confidence) : '-'}
                </td>
                <td>
                  <div class="acc-action-btns">
                    ${!isReconciled ? `
                      <button class="acc-btn-icon" data-action="match-transaction" data-id="${t.id}" title="Rapprocher manuellement">🔗</button>
                    ` : `
                      <button class="acc-btn-icon" data-action="unmatch-transaction" data-id="${t.id}" title="Defaire rapprochement">🔓</button>
                    `}
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  function renderConfidenceBar(confidence) {
    const pct = Math.round(confidence * 100);
    const color = pct >= 85 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
    return `
      <div class="acc-confidence-bar">
        <div class="acc-confidence-fill" style="width:${pct}%;background:${color}"></div>
        <span>${pct}%</span>
      </div>
    `;
  }

  // --- Modals ---
  function showImportModal() {
    const modal = document.createElement('div');
    modal.className = 'acc-modal-overlay';
    modal.innerHTML = `
      <div class="acc-modal">
        <div class="acc-modal-header">
          <h3>Importer un releve bancaire</h3>
          <button class="acc-modal-close" data-action="close-modal">&times;</button>
        </div>
        <div class="acc-modal-body">
          <div class="acc-upload-zone" id="bank-upload-zone">
            <input type="file" id="bank-file" accept=".csv,.ofx,.qfx,.qif" style="display:none">
            <div class="acc-upload-content">
              <div style="font-size:48px;margin-bottom:16px">📄</div>
              <p><strong>Glissez-deposez votre fichier ici</strong></p>
              <p class="text-muted">ou cliquez pour selectionner</p>
              <p class="text-muted" style="margin-top:8px">Formats acceptes : CSV, OFX, QFX, QIF</p>
            </div>
          </div>
          <div id="bank-file-preview" style="display:none;margin-top:12px"></div>
          <div class="acc-form-group" style="margin-top:16px">
            <label>Compte bancaire</label>
            <input type="text" class="acc-input" id="bank-account" placeholder="Ex: Compte courant BNP">
          </div>
        </div>
        <div class="acc-modal-footer">
          <button class="acc-btn" data-action="close-modal">Annuler</button>
          <button class="acc-btn acc-btn-primary" data-action="process-import" disabled id="btn-process-import">Importer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const zone = modal.querySelector('#bank-upload-zone');
    const fileInput = modal.querySelector('#bank-file');

    zone.addEventListener('click', () => fileInput.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelected(fileInput.files[0], modal);
      }
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleFileSelected(fileInput.files[0], modal);
    });
  }

  function handleFileSelected(file, modal) {
    const preview = modal.querySelector('#bank-file-preview');
    const btn = modal.querySelector('#btn-process-import');
    preview.style.display = 'block';
    preview.innerHTML = `<span class="acc-badge acc-badge-success">📎 ${file.name} (${(file.size / 1024).toFixed(1)} Ko)</span>`;
    btn.disabled = false;
  }

  function showMatchModal(transactionId) {
    const state = AccState.getState();
    const invoices = (state.invoices || []).filter(inv => inv.status !== 'draft');

    const modal = document.createElement('div');
    modal.className = 'acc-modal-overlay';
    modal.innerHTML = `
      <div class="acc-modal" style="max-width:700px">
        <div class="acc-modal-header">
          <h3>Rapprocher la transaction</h3>
          <button class="acc-modal-close" data-action="close-modal">&times;</button>
        </div>
        <div class="acc-modal-body">
          <div class="acc-form-group">
            <label>Rechercher une facture</label>
            <input type="text" class="acc-input" id="match-search" placeholder="Reference, fournisseur, montant...">
          </div>
          <div class="acc-match-list" id="match-list" style="max-height:300px;overflow-y:auto">
            ${invoices.length === 0 ? '<p class="text-muted">Aucune facture disponible pour le rapprochement.</p>' :
              invoices.map(inv => `
                <div class="acc-match-item" data-action="confirm-match" data-transaction-id="${transactionId}" data-invoice-id="${inv.id}">
                  <div class="acc-match-info">
                    <strong>${escapeHtml(inv.reference || inv.fournisseur)}</strong>
                    <span class="text-muted">${formatDate(inv.date_facture)}</span>
                  </div>
                  <div class="acc-match-amount">${formatCurrency(inv.montant_ttc)}</div>
                </div>
              `).join('')}
          </div>
        </div>
        <div class="acc-modal-footer">
          <button class="acc-btn" data-action="close-modal">Annuler</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Search filter
    const searchInput = modal.querySelector('#match-search');
    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      modal.querySelectorAll('.acc-match-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // --- Event handlers ---
  async function handleAction(action, target) {
    const id = target.dataset?.id;

    switch(action) {
      case 'import-bank':
        showImportModal();
        break;

      case 'process-import': {
        const file = document.getElementById('bank-file')?.files?.[0];
        if (!file) { showToast('Veuillez selectionner un fichier', 'error'); return; }
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('account_name', document.getElementById('bank-account')?.value || '');
          showToast('Import en cours...', 'info');
          const result = await AccountingApi.importBankTransactions(formData);
          closeModal();
          showToast(`${result.imported || 0} transactions importees`, 'success');
          await loadBank();
        } catch(e) {
          showToast('Erreur import: ' + (e.message || 'Format invalide'), 'error');
        }
        break;
      }

      case 'auto-match': {
        try {
          showToast('Auto-match IA en cours...', 'info');
          const result = await AccountingApi.autoMatchTransactions();
          showToast(`${result.matched || 0} transactions rapprochees automatiquement`, 'success');
          await loadBank();
        } catch(e) {
          showToast('Erreur auto-match', 'error');
        }
        break;
      }

      case 'match-transaction':
        showMatchModal(id);
        break;

      case 'confirm-match': {
        const transactionId = target.dataset?.transactionId || target.closest('[data-transaction-id]')?.dataset?.transactionId;
        const invoiceId = target.dataset?.invoiceId || target.closest('[data-invoice-id]')?.dataset?.invoiceId;
        if (!transactionId || !invoiceId) return;
        try {
          await AccountingApi.matchTransaction(transactionId, invoiceId);
          closeModal();
          showToast('Transaction rapprochee', 'success');
          await loadBank();
        } catch(e) {
          showToast('Erreur rapprochement', 'error');
        }
        break;
      }

      case 'unmatch-transaction': {
        if (!confirm('Defaire le rapprochement de cette transaction ?')) return;
        try {
          await AccountingApi.unmatchTransaction(id);
          showToast('Rapprochement annule', 'success');
          await loadBank();
        } catch(e) {
          showToast('Erreur', 'error');
        }
        break;
      }

      case 'close-modal':
        closeModal();
        break;
    }
  }

  async function loadBank() {
    try {
      const statusFilter = document.querySelector('[data-filter="bank-status"]')?.value || '';
      const typeFilter = document.querySelector('[data-filter="bank-type"]')?.value || '';
      const result = await AccountingApi.listBankTransactions({
        status: statusFilter || undefined,
        type: typeFilter || undefined
      });
      AccState.setState('bankTransactions', result.data || result || []);
      const container = document.querySelector('.acc-tab-content');
      if (container) render(container);
    } catch(e) {
      console.error('Erreur chargement banque:', e);
      const container = document.querySelector('.acc-tab-content');
      if (container) render(container);
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
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function closeModal() { document.querySelector('.acc-modal-overlay')?.remove(); }
  function showToast(msg, type) {
    if (window.Toast) { Toast.show(msg, type); return; }
    if (window.showToast) { window.showToast(msg, type); return; }
  }

  return { render, handleAction, loadBank };
})();

if (typeof window !== 'undefined') window.AccBank = AccBank;
