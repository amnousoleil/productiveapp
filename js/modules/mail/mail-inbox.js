// =============================================
// MAIL INBOX - Boîte d'envoi GMAIL COMPACT
// =============================================

const MailInbox = {
  mails: [],
  filter: 'all', // all | sent | opened | failed
  searchQuery: '', // Recherche

  async load() {
    const container = document.getElementById('mail-inbox-content');
    if (!container) return;

    container.innerHTML = '<div class="mail-loading"><div class="spinner"></div> Chargement...</div>';

    try {
      const result = await MailAPI.getSentMails({ limit: 100 });
      this.mails = result.mails || [];
      this.render();
    } catch (error) {
      console.error('[MailInbox] load error:', error);
      container.innerHTML = `
        <div class="mail-error">
          <p>❌ Erreur lors du chargement</p>
          <button class="btn btn-outline" onclick="MailInbox.load()">Réessayer</button>
        </div>
      `;
    }
  },

  render() {
    const container = document.getElementById('mail-inbox-content');
    if (!container) return;

    // Filter mails
    const filtered = this.filterMails();

    container.innerHTML = `
      <div class="mail-inbox-header">
        <h3>📥 Emails envoyés (${filtered.length})</h3>
        <div class="mail-filters">
          <button class="mail-filter-btn ${this.filter === 'all' ? 'active' : ''}" data-filter="all">
            Tous (${this.mails.length})
          </button>
          <button class="mail-filter-btn ${this.filter === 'sent' ? 'active' : ''}" data-filter="sent">
            ✓ Envoyés
          </button>
          <button class="mail-filter-btn ${this.filter === 'opened' ? 'active' : ''}" data-filter="opened">
            👁️ Ouverts
          </button>
          <button class="mail-filter-btn ${this.filter === 'failed' ? 'active' : ''}" data-filter="failed">
            ✗ Échecs
          </button>
        </div>
      </div>

      <div class="mail-search-bar">
        <svg class="mail-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          class="mail-search-input"
          placeholder="🔍 Rechercher par destinataire, sujet ou contenu..."
          value="${this.escapeHtml(this.searchQuery)}"
        />
        ${this.searchQuery ? '<button class="mail-search-clear">✕</button>' : ''}
      </div>

      <div class="mail-list-compact">
        ${filtered.length === 0
          ? '<div class="mail-empty"><p>Aucun email trouvé</p></div>'
          : filtered.map(mail => this.renderMailRow(mail)).join('')
        }
      </div>
    `;

    this.attachEvents();
  },

  filterMails() {
    let filtered = this.mails;

    // Filtre par status
    switch (this.filter) {
      case 'sent':
        filtered = filtered.filter(m => m.status === 'sent' && !m.opened_at);
        break;
      case 'opened':
        filtered = filtered.filter(m => m.opened_at);
        break;
      case 'failed':
        filtered = filtered.filter(m => m.status === 'failed');
        break;
    }

    // Filtre par recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(mail => {
        // Recherche dans destinataires
        const recipients = (mail.to_addresses || []).join(' ').toLowerCase();
        // Recherche dans sujet
        const subject = (mail.subject || '').toLowerCase();
        // Recherche dans body (limité pour performances)
        const body = (mail.body || '').substring(0, 500).toLowerCase();

        return recipients.includes(query) || subject.includes(query) || body.includes(query);
      });
    }

    return filtered;
  },

  renderMailRow(mail) {
    // Nettoyage ULTRA STRICT du HTML pour preview propre
    let preview = '';
    if (mail.is_html) {
      preview = mail.body
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&[a-z0-9]+;/gi, '')
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\u00C0-\u024F.,!?-]/g, '')
        .trim()
        .substring(0, 80); // 80 caractères pour preview inline
    } else {
      preview = mail.body
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 80);
    }

    // Formater les destinataires (max 2 emails)
    const recipients = mail.to_addresses || [];
    const recipientText = recipients.length === 1
      ? recipients[0]
      : recipients.length === 2
        ? recipients.join(', ')
        : `${recipients[0]} +${recipients.length - 1}`;

    // Status avec icônes
    let statusIcon = '✉️';
    let statusClass = 'sent';
    let statusTooltip = 'Envoyé';

    if (mail.opened_at) {
      statusIcon = '👁️';
      statusClass = 'opened';
      statusTooltip = 'Lu le ' + this.formatDate(mail.opened_at);
    } else if (mail.status === 'failed') {
      statusIcon = '❌';
      statusClass = 'failed';
      statusTooltip = 'Échec d\'envoi';
    }

    // Date courte
    const sentDate = this.formatDateShort(mail.sent_at);

    return `
      <div class="mail-row" data-mail-id="${mail.id}">
        <input type="checkbox" class="mail-row-checkbox" data-mail-id="${mail.id}">
        <span class="mail-row-status ${statusClass}" title="${statusTooltip}">${statusIcon}</span>
        <div class="mail-row-recipient">${this.escapeHtml(recipientText)}</div>
        <div class="mail-row-content">
          <span class="mail-row-subject">${this.escapeHtml(mail.subject || '(sans objet)')}</span>
          <span class="mail-row-preview"> - ${preview ? this.escapeHtml(preview) : 'Email vide'}</span>
        </div>
        <div class="mail-row-date">${sentDate}</div>
      </div>
    `;
  },

  attachEvents() {
    // Filter buttons
    document.querySelectorAll('.mail-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filter = e.currentTarget.dataset.filter;
        this.render();
      });
    });

    // Search input
    const searchInput = document.querySelector('.mail-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }

    // Search clear button
    const clearBtn = document.querySelector('.mail-search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.render();
      });
    }

    // Mail rows click (éviter checkbox)
    document.querySelectorAll('.mail-row').forEach(row => {
      row.addEventListener('click', async (e) => {
        // Ne pas ouvrir si click sur checkbox
        if (e.target.classList.contains('mail-row-checkbox')) {
          return;
        }
        const mailId = e.currentTarget.dataset.mailId;
        await this.openDetail(mailId);
      });
    });

    // Checkboxes (fonctionnalité future - sélection multiple)
    document.querySelectorAll('.mail-row-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêcher ouverture du mail
        // TODO: Gérer sélection multiple (suppression, archivage batch)
      });
    });
  },

  async openDetail(mailId) {
    try {
      const result = await MailAPI.getMailById(mailId);
      const mail = result.mail;

      // Create detail modal
      const modal = document.createElement('div');
      modal.className = 'mail-modal-overlay';
      modal.innerHTML = `
        <div class="mail-modal mail-modal-large">
          <div class="mail-modal-header">
            <h3>📧 ${this.escapeHtml(mail.subject)}</h3>
            <button class="mail-modal-close">×</button>
          </div>

          <div class="mail-modal-body">
            <div class="mail-detail-meta">
              <p><strong>À:</strong> ${mail.to_addresses.join(', ')}</p>
              <p><strong>Envoyé:</strong> ${this.formatDate(mail.sent_at)}</p>
              ${mail.opened_at ? `<p><strong>Ouvert:</strong> ${this.formatDate(mail.opened_at)} <span style="color: #3b82f6;">✓</span></p>` : ''}
              <p><strong>Statut:</strong> <span class="mail-status-badge ${mail.status}">${mail.status === 'sent' ? 'Envoyé' : 'Échec'}</span></p>
            </div>

            <div class="mail-detail-body">
              ${mail.is_html ? mail.body : `<pre>${this.escapeHtml(mail.body)}</pre>`}
            </div>
          </div>

          <div class="mail-modal-footer">
            <button class="btn btn-outline mail-modal-close">Fermer</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Close handlers
      modal.querySelectorAll('.mail-modal-close').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
      });

      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('mail-modal-overlay')) {
          modal.remove();
        }
      });
    } catch (error) {
      console.error('[MailInbox] openDetail error:', error);
      Toast.error('Erreur lors du chargement');
    }
  },

  // Helpers
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Il y a quelques minutes';
    if (hours < 24) return `Il y a ${hours}h`;
    if (hours < 48) return 'Hier';

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  },

  formatDateDetailed(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    // Moins d'1h : minutes
    if (minutes < 60) {
      return minutes < 1 ? 'À l\'instant' : `Il y a ${minutes}min`;
    }

    // Moins de 24h : heures + timestamp
    if (hours < 24) {
      const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `Aujourd'hui à ${time}`;
    }

    // Hier
    if (hours < 48) {
      const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `Hier à ${time}`;
    }

    // Moins de 7 jours : jour de la semaine
    if (hours < 168) {
      const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
      const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${day.charAt(0).toUpperCase() + day.slice(1)} à ${time}`;
    }

    // Plus vieux : date complète
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatDateShort(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    // Aujourd'hui : heure seulement
    if (hours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    // Hier
    if (hours < 48) {
      return 'Hier';
    }

    // Moins de 7 jours : jour de la semaine court (Lun, Mar, etc.)
    if (hours < 168) {
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      return days[date.getDay()];
    }

    // Cette année : jour + mois court (12 fév)
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    // Année passée : jour + mois + année (12 fév 2025)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }
};

window.MailInbox = MailInbox;
