/**
 * Module Comptabilite - Contacts
 * @description Repertoire clients/fournisseurs avec historique
 */
const AccContacts = (function() {
  'use strict';

  let currentView = 'list'; // 'list' or 'detail'

  function render(container) {
    if (currentView === 'detail') return;
    const state = AccState.getState();
    const contacts = state.contacts || [];
    const typeFilter = document.querySelector('[data-filter="contact-type"]')?.value || '';
    const filtered = typeFilter ? contacts.filter(c => c.type === typeFilter) : contacts;

    const stats = {
      total: contacts.length,
      clients: contacts.filter(c => c.type === 'client').length,
      fournisseurs: contacts.filter(c => c.type === 'supplier' || c.type === 'fournisseur').length,
      totalInvoiced: contacts.reduce((s, c) => s + (parseFloat(c.total_invoiced) || 0), 0)
    };

    container.innerHTML = `
      <div class="acc-contacts-module">
        <div class="acc-stats-row">
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:var(--accent-primary,#3b82f6)">&#x1F465;</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${stats.total}</span>
              <span class="acc-stat-label">Total contacts</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#10b981">&#x1F3E2;</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${stats.clients}</span>
              <span class="acc-stat-label">Clients</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#f59e0b">&#x1F4E6;</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${stats.fournisseurs}</span>
              <span class="acc-stat-label">Fournisseurs</span>
            </div>
          </div>
          <div class="acc-stat-card">
            <div class="acc-stat-icon" style="background:#8b5cf6">&#x1F4B0;</div>
            <div class="acc-stat-info">
              <span class="acc-stat-value">${formatCurrency(stats.totalInvoiced)}</span>
              <span class="acc-stat-label">Total factur\u00e9</span>
            </div>
          </div>
        </div>

        <div class="acc-toolbar">
          <button class="acc-btn acc-btn-primary" data-action="new-contact">
            + Nouveau contact
          </button>
          <div class="acc-filter-group">
            <select class="acc-select" data-filter="contact-type">
              <option value="">Tous les types</option>
              <option value="client" ${typeFilter === 'client' ? 'selected' : ''}>Clients</option>
              <option value="supplier" ${typeFilter === 'supplier' ? 'selected' : ''}>Fournisseurs</option>
              <option value="both" ${typeFilter === 'both' ? 'selected' : ''}>Les deux</option>
            </select>
            <input type="text" class="acc-input" placeholder="Rechercher..." data-filter="contact-search" style="max-width:200px">
          </div>
        </div>

        <div class="acc-table-container">
          ${filtered.length === 0 ? renderEmpty() : renderTable(filtered)}
        </div>
      </div>
    `;
  }

  function renderEmpty() {
    return `
      <div class="acc-empty-state">
        <div class="acc-empty-icon">&#x1F465;</div>
        <h3>Aucun contact</h3>
        <p>Ajoutez vos clients et fournisseurs pour un suivi efficace.</p>
        <button class="acc-btn acc-btn-primary" data-action="new-contact">Ajouter un contact</button>
      </div>
    `;
  }

  function renderTable(contacts) {
    return `
      <table class="acc-table">
        <thead>
          <tr>
            <th>Nom / Entreprise</th>
            <th>Type</th>
            <th>Email</th>
            <th>T\u00e9l\u00e9phone</th>
            <th>Total factur\u00e9</th>
            <th>Solde d\u00fb</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${contacts.map(c => `
            <tr class="acc-table-row" data-id="${c.id}">
              <td>
                <strong>${escapeHtml(c.company || c.name)}</strong>
                ${c.company && c.name ? `<br><small class="text-muted">${escapeHtml(c.name)}</small>` : ''}
              </td>
              <td>${renderTypeBadge(c.type)}</td>
              <td>${c.email ? `<a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>` : '-'}</td>
              <td>${escapeHtml(c.phone || '-')}</td>
              <td class="acc-amount">${formatCurrency(c.total_invoiced)}</td>
              <td class="acc-amount ${(parseFloat(c.total_invoiced) - parseFloat(c.total_paid)) > 0 ? 'text-danger' : ''}">${formatCurrency((parseFloat(c.total_invoiced) || 0) - (parseFloat(c.total_paid) || 0))}</td>
              <td>
                <div class="acc-action-btns">
                  <button class="acc-btn-icon" data-action="view-contact" data-id="${c.id}" title="Voir">&#x1F441;</button>
                  <button class="acc-btn-icon" data-action="edit-contact" data-id="${c.id}" title="Modifier">&#x270F;&#xFE0F;</button>
                  <button class="acc-btn-icon acc-btn-danger" data-action="delete-contact" data-id="${c.id}" title="Supprimer">&#x1F5D1;</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function renderTypeBadge(type) {
    const map = {
      client: { label: 'Client', cls: 'success' },
      supplier: { label: 'Fournisseur', cls: 'warning' },
      fournisseur: { label: 'Fournisseur', cls: 'warning' },
      both: { label: 'Client/Fourn.', cls: 'info' }
    };
    const t = map[type] || { label: type || 'Autre', cls: 'neutral' };
    return `<span class="acc-badge acc-badge-${t.cls}">${t.label}</span>`;
  }

  // --- Detail view ---
  async function renderDetail(container, contact) {
    currentView = 'detail';
    let invoices = [];
    try { invoices = await AccountingApi.getContactInvoices(contact.id); } catch(e) {}
    if (Array.isArray(invoices.data)) invoices = invoices.data;

    container.innerHTML = `
      <div class="acc-contact-detail">
        <div class="acc-detail-header">
          <button class="acc-btn acc-btn-ghost" data-action="back-contacts">\u2190 Retour</button>
          <h3>${escapeHtml(contact.company || contact.name)}</h3>
          ${renderTypeBadge(contact.type)}
        </div>
        <div class="acc-detail-grid">
          <div class="acc-detail-card">
            <h4>Informations</h4>
            <div class="acc-detail-field"><label>Nom</label><span>${escapeHtml(contact.name || '-')}</span></div>
            <div class="acc-detail-field"><label>Entreprise</label><span>${escapeHtml(contact.company || '-')}</span></div>
            <div class="acc-detail-field"><label>Email</label><span>${contact.email ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : '-'}</span></div>
            <div class="acc-detail-field"><label>T\u00e9l\u00e9phone</label><span>${escapeHtml(contact.phone || '-')}</span></div>
            <div class="acc-detail-field"><label>Adresse</label><span>${escapeHtml([contact.address, contact.postal_code, contact.city, contact.country].filter(Boolean).join(', ') || '-')}</span></div>
          </div>
          <div class="acc-detail-card">
            <h4>Informations fiscales</h4>
            <div class="acc-detail-field"><label>SIRET</label><span>${escapeHtml(contact.siret || '-')}</span></div>
            <div class="acc-detail-field"><label>N\u00b0 TVA</label><span>${escapeHtml(contact.tva_number || '-')}</span></div>
            <div class="acc-detail-field"><label>Conditions paiement</label><span>${contact.default_payment_terms ? contact.default_payment_terms + ' jours' : '-'}</span></div>
            <div class="acc-detail-field"><label>Devise</label><span>${escapeHtml(contact.default_currency || 'EUR')}</span></div>
          </div>
          <div class="acc-detail-card">
            <h4>Statistiques</h4>
            <div class="acc-detail-field"><label>Total factur\u00e9</label><span class="acc-amount">${formatCurrency(contact.total_invoiced)}</span></div>
            <div class="acc-detail-field"><label>Total pay\u00e9</label><span class="acc-amount text-success">${formatCurrency(contact.total_paid)}</span></div>
            <div class="acc-detail-field"><label>Solde d\u00fb</label><span class="acc-amount text-danger">${formatCurrency((parseFloat(contact.total_invoiced) || 0) - (parseFloat(contact.total_paid) || 0))}</span></div>
          </div>
        </div>
        <div class="acc-section">
          <h4>Factures (${invoices.length})</h4>
          ${invoices.length > 0 ? `
            <table class="acc-table">
              <thead><tr><th>R\u00e9f\u00e9rence</th><th>Date</th><th>Montant TTC</th><th>Statut</th></tr></thead>
              <tbody>
                ${invoices.map(inv => `
                  <tr>
                    <td>${escapeHtml(inv.reference || inv.id?.slice(0, 8))}</td>
                    <td>${formatDate(inv.date_facture)}</td>
                    <td class="acc-amount">${formatCurrency(inv.montant_ttc)}</td>
                    <td><span class="acc-badge acc-badge-${inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}">${inv.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p class="text-muted">Aucune facture pour ce contact.</p>'}
        </div>
      </div>
    `;
  }

  // --- Contact modal ---
  function showContactModal(contact) {
    const isEdit = !!contact;
    const modal = document.createElement('div');
    modal.className = 'acc-modal-overlay';
    modal.innerHTML = `
      <div class="acc-modal" style="max-width:650px">
        <div class="acc-modal-header">
          <h3>${isEdit ? 'Modifier' : 'Nouveau'} contact</h3>
          <button class="acc-modal-close" data-action="close-modal">&times;</button>
        </div>
        <div class="acc-modal-body">
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>Type *</label>
              <select class="acc-select" id="contact-type">
                <option value="client" ${contact?.type === 'client' ? 'selected' : ''}>Client</option>
                <option value="supplier" ${contact?.type === 'supplier' ? 'selected' : ''}>Fournisseur</option>
                <option value="both" ${contact?.type === 'both' ? 'selected' : ''}>Les deux</option>
              </select>
            </div>
            <div class="acc-form-group">
              <label>Entreprise *</label>
              <input type="text" class="acc-input" id="contact-company" value="${escapeHtml(contact?.company || '')}" placeholder="Nom de l'entreprise">
            </div>
          </div>
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>Nom contact</label>
              <input type="text" class="acc-input" id="contact-name" value="${escapeHtml(contact?.name || '')}" placeholder="Pr\u00e9nom Nom">
            </div>
            <div class="acc-form-group">
              <label>Email</label>
              <input type="email" class="acc-input" id="contact-email" value="${escapeHtml(contact?.email || '')}" placeholder="email@example.com">
            </div>
          </div>
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>T\u00e9l\u00e9phone</label>
              <input type="tel" class="acc-input" id="contact-phone" value="${escapeHtml(contact?.phone || '')}" placeholder="+33 1 23 45 67 89">
            </div>
            <div class="acc-form-group">
              <label>SIRET</label>
              <input type="text" class="acc-input" id="contact-siret" value="${escapeHtml(contact?.siret || '')}" placeholder="123 456 789 00001">
            </div>
          </div>
          <div class="acc-form-group">
            <label>Adresse</label>
            <input type="text" class="acc-input" id="contact-address" value="${escapeHtml(contact?.address || '')}" placeholder="Rue, num\u00e9ro">
          </div>
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>Code postal</label>
              <input type="text" class="acc-input" id="contact-postal" value="${escapeHtml(contact?.postal_code || '')}" placeholder="75001">
            </div>
            <div class="acc-form-group">
              <label>Ville</label>
              <input type="text" class="acc-input" id="contact-city" value="${escapeHtml(contact?.city || '')}" placeholder="Paris">
            </div>
            <div class="acc-form-group">
              <label>Pays</label>
              <input type="text" class="acc-input" id="contact-country" value="${escapeHtml(contact?.country || 'France')}" placeholder="France">
            </div>
          </div>
          <div class="acc-form-row">
            <div class="acc-form-group">
              <label>N\u00b0 TVA intracommunautaire</label>
              <input type="text" class="acc-input" id="contact-tva" value="${escapeHtml(contact?.tva_number || '')}" placeholder="FR12345678901">
            </div>
            <div class="acc-form-group">
              <label>Conditions paiement (jours)</label>
              <input type="number" class="acc-input" id="contact-payment-terms" value="${contact?.default_payment_terms || 30}" min="0" max="365">
            </div>
          </div>
        </div>
        <div class="acc-modal-footer">
          <button class="acc-btn" data-action="close-modal">Annuler</button>
          <button class="acc-btn acc-btn-primary" data-action="save-contact" ${isEdit ? `data-id="${contact.id}"` : ''}>
            ${isEdit ? 'Modifier' : 'Cr\u00e9er'}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#contact-company')?.focus();
  }

  // --- Action handler ---
  async function handleAction(action, target) {
    const id = target.dataset?.id;

    switch(action) {
      case 'new-contact':
        showContactModal(null);
        break;

      case 'save-contact': {
        const company = document.getElementById('contact-company')?.value?.trim();
        if (!company) { showToast('Entreprise requise', 'error'); return; }
        const data = {
          type: document.getElementById('contact-type')?.value || 'client',
          company,
          name: document.getElementById('contact-name')?.value?.trim() || '',
          email: document.getElementById('contact-email')?.value?.trim() || '',
          phone: document.getElementById('contact-phone')?.value?.trim() || '',
          siret: document.getElementById('contact-siret')?.value?.trim() || '',
          address: document.getElementById('contact-address')?.value?.trim() || '',
          postal_code: document.getElementById('contact-postal')?.value?.trim() || '',
          city: document.getElementById('contact-city')?.value?.trim() || '',
          country: document.getElementById('contact-country')?.value?.trim() || 'France',
          tva_number: document.getElementById('contact-tva')?.value?.trim() || '',
          default_payment_terms: parseInt(document.getElementById('contact-payment-terms')?.value) || 30
        };
        try {
          if (id) {
            await AccountingApi.updateContact(id, data);
          } else {
            await AccountingApi.createContact(data);
          }
          closeModal();
          showToast('Contact enregistr\u00e9', 'success');
          await loadContacts();
        } catch(e) {
          showToast('Erreur: ' + (e.message || '\u00c9chec'), 'error');
        }
        break;
      }

      case 'view-contact': {
        try {
          const contact = await AccountingApi.getContact(id);
          const container = document.querySelector('.acc-tab-content');
          if (container && contact) await renderDetail(container, contact);
        } catch(e) { showToast('Erreur chargement', 'error'); }
        break;
      }

      case 'edit-contact': {
        try {
          const contact = await AccountingApi.getContact(id);
          if (contact) showContactModal(contact);
        } catch(e) { showToast('Erreur', 'error'); }
        break;
      }

      case 'delete-contact': {
        if (!confirm('Supprimer ce contact ?')) return;
        try {
          await AccountingApi.deleteContact(id);
          showToast('Contact supprim\u00e9', 'success');
          await loadContacts();
        } catch(e) { showToast('Erreur suppression', 'error'); }
        break;
      }

      case 'back-contacts':
        currentView = 'list';
        await loadContacts();
        break;

      case 'close-modal':
        closeModal();
        break;
    }
  }

  async function loadContacts() {
    try {
      const typeFilter = document.querySelector('[data-filter="contact-type"]')?.value || '';
      const result = await AccountingApi.listContacts({ type: typeFilter || undefined });
      AccState.setState('contacts', result.data || result || []);
      const container = document.querySelector('.acc-tab-content');
      if (container) { currentView = 'list'; render(container); }
    } catch(e) {
      console.error('Erreur chargement contacts:', e);
      const container = document.querySelector('.acc-tab-content');
      if (container) render(container);
    }
  }

  function formatCurrency(a) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(a || 0); }
  function formatDate(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('fr-FR'); }
  function escapeHtml(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function closeModal() { document.querySelector('.acc-modal-overlay')?.remove(); }
  function showToast(m, t) { if (window.Toast) Toast.show(m, t); else if (window.showToast) window.showToast(m, t); }

  return { render, handleAction, loadContacts };
})();

if (typeof window !== 'undefined') window.AccContacts = AccContacts;
