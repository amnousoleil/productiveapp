// =============================================
// MAIL SENT LIST - Liste compacte Gmail-style
// Format tableau dense et scannable
// =============================================

const MailSentList = {
  mails: [],
  filter: 'all', // all | sent | opened | failed
  searchQuery: '',

  /**
   * Load sent mails
   */
  async load() {
    const container = document.getElementById('mail-sent-content');
    if (!container) return;

    container.innerHTML = '<div class="mail-loading"><div class="spinner"></div> Chargement...</div>';

    try {
      const result = await MailAPI.getSentMails({ limit: 100 });
      this.mails = result.mails || [];
      this.render();
    } catch (error) {
      console.error('[MailSentList] load error:', error);
      container.innerHTML = `
        <div class="mail-error">
          <p>❌ Erreur lors du chargement</p>
          <button class="btn btn-outline" onclick="MailSentList.load()">Réessayer</button>
        </div>
      `;
    }
  },

  /**
   * Render full list view
   */
  render() {
    const container = document.getElementById('mail-sent-content');
    if (!container) return;

    const filtered = this.filterMails();

    container.innerHTML = `
      ${this.renderToolbar(filtered.length)}
      ${this.renderSearchBar()}
      ${this.renderList(filtered)}
    `;

    this.attachEvents();
  },

  /**
   * Render toolbar with filters
   */
  renderToolbar(count) {
    return `
      <div class="mail-sent-toolbar">
        <h3 class="mail-sent-title">📥 Emails envoyés (${count})</h3>
        <div class="mail-filters">
          <button class="mail-filter-btn ${this.filter === 'all' ? 'active' : ''}" data-filter="all">
            Tous
          </button>
          <button class="mail-filter-btn ${this.filter === 'sent' ? 'active' : ''}" data-filter="sent">
            Envoyés
          </button>
          <button class="mail-filter-btn ${this.filter === 'opened' ? 'active' : ''}" data-filter="opened">
            Ouverts
          </button>
          <button class="mail-filter-btn ${this.filter === 'failed' ? 'active' : ''}" data-filter="failed">
            Échecs
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render search bar
   */
  renderSearchBar() {
    return `
      <div class="mail-search-bar">
        <svg class="mail-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          class="mail-search-input"
          placeholder="Rechercher par destinataire, sujet ou contenu..."
          value="${MailUtils.escapeHtml(this.searchQuery)}"
        />
        ${this.searchQuery ? '<button class="mail-search-clear">✕</button>' : ''}
      </div>
    `;
  },

  /**
   * Render list of mails
   */
  renderList(filtered) {
    if (filtered.length === 0) {
      return `
        <div class="mail-empty">
          <p>Aucun email trouvé</p>
        </div>
      `;
    }

    return `
      <div class="mail-list-compact">
        ${filtered.map(mail => this.renderMailRow(mail)).join('')}
      </div>
    `;
  },

  /**
   * Render single mail row
   */
  renderMailRow(mail) {
    // Preview
    const preview = mail.is_html
      ? MailUtils.cleanHtmlPreview(mail.body, 80)
      : MailUtils.cleanTextPreview(mail.body, 80);

    // Recipients
    const recipientText = MailUtils.formatRecipients(mail.to_addresses || [], 2);

    // Status
    const { icon, cssClass, tooltip } = MailUtils.parseStatus(mail);

    // Date
    const sentDate = MailUtils.formatDateShort(mail.sent_at);

    return `
      <div class="mail-row" data-mail-id="${mail.id}">
        <input type="checkbox" class="mail-row-checkbox" data-mail-id="${mail.id}">
        <span class="mail-row-status ${cssClass}" title="${tooltip}">${icon}</span>
        <div class="mail-row-recipient">${MailUtils.escapeHtml(recipientText)}</div>
        <div class="mail-row-content">
          <span class="mail-row-subject">${MailUtils.escapeHtml(mail.subject || '(sans objet)')}</span>
          <span class="mail-row-preview"> - ${preview ? MailUtils.escapeHtml(preview) : 'Email vide'}</span>
        </div>
        <div class="mail-row-date">${sentDate}</div>
      </div>
    `;
  },

  /**
   * Filter mails based on current filter and search query
   */
  filterMails() {
    let filtered = this.mails;

    // Filter by status
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

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(mail => {
        const recipients = (mail.to_addresses || []).join(' ').toLowerCase();
        const subject = (mail.subject || '').toLowerCase();
        const body = (mail.body || '').substring(0, 500).toLowerCase();
        return recipients.includes(query) || subject.includes(query) || body.includes(query);
      });
    }

    return filtered;
  },

  /**
   * Attach event listeners
   */
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

    // Mail rows click
    document.querySelectorAll('.mail-row').forEach(row => {
      row.addEventListener('click', async (e) => {
        // Ignore checkbox click
        if (e.target.classList.contains('mail-row-checkbox')) {
          return;
        }
        const mailId = e.currentTarget.dataset.mailId;
        await MailDetail.open(mailId);
      });
    });

    // Checkboxes (pour sélection multiple future)
    document.querySelectorAll('.mail-row-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        // TODO: Gérer sélection multiple
      });
    });
  }
};

window.MailSentList = MailSentList;
