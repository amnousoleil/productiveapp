// =============================================
// MAIL INBOX - Boîte d'envoi avec cartes
// =============================================

const MailInbox = {
  mails: [],
  filter: 'all', // all | sent | opened | failed

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

      <div class="mail-cards-grid">
        ${filtered.length === 0
          ? '<div class="mail-empty"><p>Aucun email trouvé</p></div>'
          : filtered.map(mail => this.renderMailCard(mail)).join('')
        }
      </div>
    `;

    this.attachEvents();
  },

  filterMails() {
    switch (this.filter) {
      case 'sent':
        return this.mails.filter(m => m.status === 'sent' && !m.opened_at);
      case 'opened':
        return this.mails.filter(m => m.opened_at);
      case 'failed':
        return this.mails.filter(m => m.status === 'failed');
      default:
        return this.mails;
    }
  },

  renderMailCard(mail) {
    const preview = mail.is_html
      ? mail.body.replace(/<[^>]*>/g, '').substring(0, 120)
      : mail.body.substring(0, 120);

    let statusClass = 'sent';
    let statusIcon = '✓';
    let statusLabel = 'Envoyé';

    if (mail.opened_at) {
      statusClass = 'opened';
      statusIcon = '👁️';
      statusLabel = 'Ouvert';
    } else if (mail.status === 'failed') {
      statusClass = 'failed';
      statusIcon = '✗';
      statusLabel = 'Échec';
    }

    return `
      <div class="mail-card" data-mail-id="${mail.id}">
        <div class="mail-card-header">
          <div class="mail-card-to">
            <strong>À:</strong> ${this.escapeHtml(mail.to_addresses.join(', '))}
          </div>
          <span class="mail-card-status ${statusClass}">${statusIcon} ${statusLabel}</span>
        </div>

        <div class="mail-card-subject">${this.escapeHtml(mail.subject)}</div>
        <div class="mail-card-preview">${this.escapeHtml(preview)}...</div>

        <div class="mail-card-footer">
          <span class="mail-card-date">${this.formatDate(mail.sent_at)}</span>
          ${mail.opened_at ? `<span class="mail-card-opened">Ouvert ${this.formatDate(mail.opened_at)}</span>` : ''}
        </div>
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

    // Mail cards click
    document.querySelectorAll('.mail-card').forEach(card => {
      card.addEventListener('click', async (e) => {
        const mailId = e.currentTarget.dataset.mailId;
        await this.openDetail(mailId);
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
  }
};

window.MailInbox = MailInbox;
