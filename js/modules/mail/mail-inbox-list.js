// =============================================
// MAIL INBOX LIST v2.0 - Design Magique
// Avatars colorés, breathing room, élégance
// =============================================

const MailInboxList = {
  emails: [],
  filter: 'all', // all | unread | starred
  searchQuery: '',
  loading: false,

  async load() {
    const container = document.getElementById('mail-inbox-content');
    if (!container) return;

    this.loading = true;
    container.innerHTML = '<div class="mail-loading"><div class="spinner"></div> Chargement...</div>';

    try {
      const result = await MailAPI.getInbox({ limit: 100, folder: 'inbox' });
      this.emails = result.emails || [];
      this.render();
    } catch (error) {
      console.error('[MailInboxList] load error:', error);
      container.innerHTML = `
        <div class="mail-error">
          <p>❌ Erreur lors du chargement</p>
          <button class="btn btn-outline" onclick="MailInboxList.load()">Réessayer</button>
        </div>
      `;
    } finally {
      this.loading = false;
    }
  },

  render() {
    const container = document.getElementById('mail-inbox-content');
    if (!container) return;

    const filtered = this.filterEmails();
    const unreadCount = this.emails.filter(e => !e.is_read).length;

    container.innerHTML = `
      ${this.renderToolbar(filtered.length, unreadCount)}
      ${this.renderSearchBar()}
      ${this.renderList(filtered)}
    `;
    this.attachEvents();
  },

  renderToolbar(count, unreadCount) {
    return `
      <div class="mail-inbox-toolbar">
        <div class="mail-inbox-toolbar-left">
          <h3 class="mail-inbox-title">
            📬 Boite de réception
            <span class="mail-inbox-count">${count}</span>
            ${unreadCount > 0 ? `<span class="mail-inbox-unread-badge">${unreadCount} non lu${unreadCount > 1 ? 's' : ''}</span>` : ''}
          </h3>
        </div>
        <div class="mail-inbox-filters">
          <button class="mail-inbox-filter-btn ${this.filter === 'all' ? 'active' : ''}" data-filter="all">Tous</button>
          <button class="mail-inbox-filter-btn ${this.filter === 'unread' ? 'active' : ''}" data-filter="unread">Non lus</button>
          <button class="mail-inbox-filter-btn ${this.filter === 'starred' ? 'active' : ''}" data-filter="starred">★ Favoris</button>
          <button class="mail-inbox-filter-btn mail-ai-triage-btn" id="mail-ai-triage-btn" title="Analyser et classer les emails avec l'IA">
            🤖 Trier avec l'IA
          </button>
        </div>
      </div>
    `;
  },

  renderSearchBar() {
    return `
      <div class="mail-inbox-search">
        <svg class="mail-inbox-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" class="mail-inbox-search-input" id="inbox-search-input"
          placeholder="Rechercher par expéditeur, sujet ou contenu..."
          value="${MailUtils.escapeHtml(this.searchQuery)}" />
        ${this.searchQuery ? '<button class="mail-inbox-search-clear" id="inbox-search-clear">✕</button>' : ''}
      </div>
    `;
  },

  renderList(filtered) {
    if (filtered.length === 0) {
      const emptyMsg = this.emails.length === 0
        ? '📭 Votre boite de réception est vide'
        : 'Aucun email ne correspond à votre recherche';
      return `
        <div class="mail-inbox-empty">
          <div class="mail-inbox-empty-icon">📭</div>
          <p>${emptyMsg}</p>
        </div>
      `;
    }

    return `
      <div class="mail-inbox-list">
        ${filtered.map(email => this.renderRow(email)).join('')}
      </div>
    `;
  },

  renderRow(email) {
    const fromDisplay = email.from_name || email.from_address || 'Inconnu';

    // Initiales pour l'avatar (max 2 lettres)
    const initials = email.from_name
      ? email.from_name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase()
      : (email.from_address || '?').slice(0, 2).toUpperCase();

    // Fix literal \n dans le texte stocké en DB
    const rawText = (email.body_text || '').replace(/\\n/g, ' ').replace(/\n/g, ' ');
    const preview = rawText
      ? MailUtils.cleanTextPreview(rawText, 100)
      : email.body_html
        ? MailUtils.cleanHtmlPreview(email.body_html, 100)
        : '';

    const date = MailUtils.formatDateShort(email.received_at || email.created_at);
    const isUnread = !email.is_read;
    const isStarred = email.is_starred;
    const avatarGradient = this.getAvatarColor(fromDisplay);

    return `
      <div class="mail-inbox-row${isUnread ? ' unread' : ''}" data-email-id="${email.id}">
        <div class="mail-inbox-avatar" style="background: ${avatarGradient}">
          ${MailUtils.escapeHtml(initials)}
        </div>
        <div class="mail-inbox-body">
          <div class="mail-inbox-header-row">
            <span class="mail-inbox-from">${MailUtils.escapeHtml(fromDisplay)}</span>
            <div class="mail-inbox-meta">
              <button class="mail-inbox-star-btn${isStarred ? ' starred' : ''}"
                data-email-id="${email.id}"
                title="${isStarred ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                ${isStarred ? '★' : '☆'}
              </button>
              <time class="mail-inbox-date">${date}</time>
            </div>
          </div>
          <div class="mail-inbox-content-row">
            <span class="mail-inbox-subject">${MailUtils.escapeHtml(email.subject || '(sans objet)')}</span>
            ${preview ? `<span class="mail-inbox-preview"> — ${MailUtils.escapeHtml(preview)}</span>` : ''}
          </div>
          ${(typeof MailAI !== 'undefined' && MailAI.renderPriorityBadge(email.id)) || ''}
        </div>
        ${isUnread ? '<div class="mail-inbox-unread-pip"></div>' : ''}
      </div>
    `;
  },

  /**
   * Génère un gradient unique basé sur le nom de l'expéditeur
   */
  getAvatarColor(name) {
    const palettes = [
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
      'linear-gradient(135deg, #e879f9 0%, #a855f7 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palettes[Math.abs(hash) % palettes.length];
  },

  filterEmails() {
    let filtered = this.emails;

    switch (this.filter) {
      case 'unread':
        filtered = filtered.filter(e => !e.is_read);
        break;
      case 'starred':
        filtered = filtered.filter(e => e.is_starred);
        break;
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        (e.from_address || '').toLowerCase().includes(q) ||
        (e.from_name || '').toLowerCase().includes(q) ||
        (e.subject || '').toLowerCase().includes(q) ||
        (e.body_text || '').substring(0, 300).toLowerCase().includes(q)
      );
    }

    return filtered;
  },

  async markRead(emailId, isRead) {
    try {
      await MailAPI.markAsRead(emailId, isRead);
      const email = this.emails.find(e => e.id === emailId);
      if (email) email.is_read = isRead;
      this.render();
    } catch (error) {
      console.error('[MailInboxList] markRead error:', error);
    }
  },

  async toggleStar(emailId) {
    const email = this.emails.find(e => e.id === emailId);
    if (!email) return;
    try {
      await MailAPI.markAsStarred(emailId, !email.is_starred);
      email.is_starred = !email.is_starred;
      this.render();
    } catch (error) {
      console.error('[MailInboxList] toggleStar error:', error);
    }
  },

  attachEvents() {
    // Filter buttons (exclude AI triage btn from filter logic)
    document.querySelectorAll('#mail-inbox-content .mail-inbox-filter-btn:not(.mail-ai-triage-btn)').forEach(btn => {
      btn.addEventListener('click', e => {
        this.filter = e.currentTarget.dataset.filter;
        this.render();
      });
    });

    // AI Triage button
    const triageBtn = document.getElementById('mail-ai-triage-btn');
    if (triageBtn && typeof MailAI !== 'undefined') {
      triageBtn.addEventListener('click', async () => {
        if (!ApiAi || !ApiAi.isAvailable()) {
          Toast.error('IA non disponible');
          return;
        }
        triageBtn.disabled = true;
        triageBtn.innerHTML = '<span class="mail-ai-spinner"></span> Analyse en cours...';
        try {
          await MailAI.analyzeEmailsBatch(this.emails);
          this.render(); // Re-render to show badges
          Toast.success('🤖 Triage terminé !');
        } catch (e) {
          Toast.error('Erreur lors du triage');
        } finally {
          triageBtn.disabled = false;
          triageBtn.innerHTML = '🤖 Trier avec l\'IA';
        }
      });
    }

    // Search input
    const searchInput = document.getElementById('inbox-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }

    // Clear search
    const clearBtn = document.getElementById('inbox-search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.render();
      });
    }

    // Star buttons
    document.querySelectorAll('#mail-inbox-content .mail-inbox-star-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        this.toggleStar(e.currentTarget.dataset.emailId);
      });
    });

    // Row click → open detail + mark as read
    document.querySelectorAll('#mail-inbox-content .mail-inbox-row').forEach(row => {
      row.addEventListener('click', async e => {
        if (e.target.classList.contains('mail-inbox-star-btn')) return;
        const emailId = e.currentTarget.dataset.emailId;
        const email = this.emails.find(em => em.id === emailId);
        if (email && !email.is_read) {
          await this.markRead(emailId, true);
        }
        if (typeof MailDetail !== 'undefined') {
          await MailDetail.openInbound(emailId);
        }
      });
    });
  }
};

window.MailInboxList = MailInboxList;
