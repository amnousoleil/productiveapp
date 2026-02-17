/**
 * Module Comptabilite - Alertes
 * @description Centre d'alertes comptables avec badges severite
 */
const AccAlerts = (function() {
  'use strict';

  function render(container) {
    const state = AccState.getState();
    const alerts = state.alerts || [];

    const counts = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      unread: alerts.filter(a => !a.read_at).length
    };

    container.innerHTML = `
      <div class="acc-alerts-module">
        <div class="acc-stats-row">
          <div class="acc-stat-card ${counts.critical > 0 ? 'acc-card-danger' : ''}">
            <div class="acc-stat-icon" style="background:#ef4444">&#x1F6A8;</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${counts.critical}</span>
              <span class="acc-stat-label">Critiques</span>
            </div>
          </div>
          <div class="acc-stat-card ${counts.high > 0 ? 'acc-card-warning' : ''}">
            <div class="acc-stat-icon" style="background:#f59e0b">&#x26A0;&#xFE0F;</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${counts.high}</span>
              <span class="acc-stat-label">Hautes</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#3b82f6">&#x2139;&#xFE0F;</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${counts.medium + counts.low}</span>
              <span class="acc-stat-label">Info / Basses</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#8b5cf6">&#x1F4EC;</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${counts.unread}</span>
              <span class="acc-stat-label">Non lues</span>
            </div>
          </div>
        </div>

        <div class="acc-toolbar">
          <button class="acc-btn acc-btn-primary" data-action="generate-alerts">
            &#x1F504; Actualiser les alertes
          </button>
          <div class="acc-filter-group">
            <select class="acc-select" data-filter="alert-severity">
              <option value="">Toutes s\u00e9v\u00e9rit\u00e9s</option>
              <option value="critical">&#x1F6A8; Critiques</option>
              <option value="high">&#x26A0;&#xFE0F; Hautes</option>
              <option value="medium">&#x2139;&#xFE0F; Moyennes</option>
              <option value="low">&#x1F4CB; Basses</option>
            </select>
            <select class="acc-select" data-filter="alert-read">
              <option value="">Toutes</option>
              <option value="unread">Non lues</option>
              <option value="read">Lues</option>
            </select>
          </div>
        </div>

        <div class="acc-alerts-list">
          ${alerts.length === 0 ? renderEmpty() : renderAlerts(alerts)}
        </div>
      </div>
    `;
  }

  function renderEmpty() {
    return `
      <div class="acc-empty-state">
        <div class="acc-empty-icon">&#x1F514;</div>
        <h3>Aucune alerte</h3>
        <p>Toutes vos alertes comptables s'afficheront ici.</p>
        <button class="acc-btn acc-btn-primary" data-action="generate-alerts">V\u00e9rifier maintenant</button>
      </div>
    `;
  }

  function renderAlerts(alerts) {
    return alerts.map(alert => {
      const sev = getSeverityConfig(alert.severity);
      const isUnread = !alert.read_at;
      const typeLabel = getTypeLabel(alert.type);

      return `
        <div class="acc-alert-item ${isUnread ? 'unread' : ''} severity-${alert.severity}" data-id="${alert.id}">
          <div class="acc-alert-icon">${sev.icon}</div>
          <div class="acc-alert-content">
            <div class="acc-alert-header">
              <span class="acc-badge acc-badge-${sev.cls}">${sev.label}</span>
              <span class="acc-badge acc-badge-neutral">${typeLabel}</span>
              <span class="acc-alert-date">${formatDate(alert.created_at)}</span>
              ${isUnread ? '<span class="acc-unread-dot"></span>' : ''}
            </div>
            <h4 class="acc-alert-title">${escapeHtml(alert.title)}</h4>
            <p class="acc-alert-message">${escapeHtml(alert.message)}</p>
            ${alert.metadata?.amount ? `<p class="acc-alert-amount">Montant : ${formatCurrency(alert.metadata.amount)}</p>` : ''}
            ${alert.metadata?.invoice_reference ? `<p class="text-muted">R\u00e9f: ${escapeHtml(alert.metadata.invoice_reference)}</p>` : ''}
          </div>
          <div class="acc-alert-actions">
            ${isUnread ? `<button class="acc-btn-icon" data-action="mark-read" data-id="${alert.id}" title="Marquer comme lue">&#x2713;</button>` : ''}
            <button class="acc-btn-icon acc-btn-danger" data-action="dismiss-alert" data-id="${alert.id}" title="Rejeter">&#x2715;</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function getSeverityConfig(severity) {
    const map = {
      critical: { icon: '&#x1F6A8;', label: 'Critique', cls: 'danger' },
      high: { icon: '&#x26A0;&#xFE0F;', label: 'Haute', cls: 'warning' },
      medium: { icon: '&#x2139;&#xFE0F;', label: 'Moyenne', cls: 'info' },
      low: { icon: '&#x1F4CB;', label: 'Basse', cls: 'neutral' }
    };
    return map[severity] || map.medium;
  }

  function getTypeLabel(type) {
    const map = {
      overdue: 'Impay\u00e9e',
      upcoming_deadline: '\u00c9ch\u00e9ance',
      budget_exceeded: 'Budget d\u00e9pass\u00e9',
      anomaly: 'Anomalie',
      tva_deadline: '\u00c9ch\u00e9ance TVA',
      payment_received: 'Paiement re\u00e7u',
      low_cash: 'Tr\u00e9sorerie basse'
    };
    return map[type] || type || 'Alerte';
  }

  // --- Action handler ---
  async function handleAction(action, target) {
    const id = target.dataset?.id;

    switch(action) {
      case 'generate-alerts': {
        try {
          showToast('Analyse en cours...', 'info');
          await AccountingApi.generateAlerts();
          showToast('Alertes mises \u00e0 jour', 'success');
          await loadAlerts();
        } catch(e) {
          showToast('Erreur g\u00e9n\u00e9ration alertes', 'error');
        }
        break;
      }

      case 'mark-read': {
        try {
          await AccountingApi.markAlertRead(id);
          // Update locally without full reload
          const state = AccState.getState();
          const alerts = (state.alerts || []).map(a => a.id === id ? { ...a, read_at: new Date().toISOString() } : a);
          AccState.setState('alerts', alerts);
          const container = document.querySelector('.acc-tab-content');
          if (container) render(container);
        } catch(e) {
          showToast('Erreur', 'error');
        }
        break;
      }

      case 'dismiss-alert': {
        try {
          await AccountingApi.dismissAlert(id);
          const state = AccState.getState();
          const alerts = (state.alerts || []).filter(a => a.id !== id);
          AccState.setState('alerts', alerts);
          const container = document.querySelector('.acc-tab-content');
          if (container) render(container);
          showToast('Alerte rejet\u00e9e', 'success');
        } catch(e) {
          showToast('Erreur', 'error');
        }
        break;
      }
    }
  }

  async function loadAlerts() {
    try {
      const severityFilter = document.querySelector('[data-filter="alert-severity"]')?.value || '';
      const readFilter = document.querySelector('[data-filter="alert-read"]')?.value || '';
      const result = await AccountingApi.listAlerts({
        severity: severityFilter || undefined,
        read: readFilter === 'read' ? true : readFilter === 'unread' ? false : undefined
      });
      AccState.setState('alerts', result.data || result || []);
      const container = document.querySelector('.acc-tab-content');
      if (container) render(container);
    } catch(e) {
      console.error('Erreur chargement alertes:', e);
      const container = document.querySelector('.acc-tab-content');
      if (container) render(container);
    }
  }

  function formatCurrency(a) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(a || 0); }
  function formatDate(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('fr-FR'); }
  function escapeHtml(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function showToast(m, t) { if (window.Toast) Toast.show(m, t); else if (window.showToast) window.showToast(m, t); }

  return { render, handleAction, loadAlerts };
})();

if (typeof window !== 'undefined') window.AccAlerts = AccAlerts;
