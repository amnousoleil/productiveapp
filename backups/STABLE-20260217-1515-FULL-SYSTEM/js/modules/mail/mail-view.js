// =============================================
// MAIL VIEW v2.0 - Interface Intuitive
// Hero + 5 onglets clairs
// =============================================

const MailView = {
  currentTab: 'inbox',
  stats: { sent: 0, opened: 0, openRate: 0, contacts: 0 },
  configStatus: null,

  async init() {
    console.log('[MailView v2] Initializing...');
    await this.checkConfig();
    await this.loadStats();
    this.render();
  },

  async checkConfig() {
    try {
      const result = await MailAPI.checkConfig();
      this.configStatus = { ok: true, from: result.from };
    } catch (error) {
      this.configStatus = { ok: false, error: error.message };
    }
  },

  async loadStats() {
    try {
      const result = await MailAPI.getStats();
      const stats = result.stats;
      this.stats = {
        sent: stats.total_sent || 0,
        opened: stats.total_opened || 0,
        openRate: Math.round(stats.open_rate || 0),
        contacts: 0 // TODO: from contacts API
      };
    } catch (error) {
      console.error('[MailView] loadStats error:', error);
    }
  },

  render() {
    const container = document.getElementById('view-mail');
    if (!container) return;

    container.innerHTML = `
      ${this.renderHero()}
      ${this.renderTabs()}
      <div class="mail-tab-content" id="mail-tab-content">
        ${this.renderTabContent()}
      </div>
    `;

    this.attachEvents();
  },

  renderHero() {
    const statusBadge = this.configStatus?.ok
      ? '<span class="mail-hero-badge ok">✓ Resend configuré</span>'
      : '<span class="mail-hero-badge error">⚠ Configuration requise</span>';

    return `
      <div class="mail-hero">
        <div class="mail-hero-header">
          <div class="mail-hero-title">
            <h1>📧 Mail Professionnel</h1>
            ${statusBadge}
          </div>
          <div class="mail-hero-actions">
            <button class="btn btn-lg btn-primary" data-action="send-email">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              Envoyer un email
            </button>
            <button class="btn btn-lg btn-accent" data-action="create-campaign">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Créer une campagne
            </button>
          </div>
        </div>

        <div class="mail-hero-stats">
          <div class="mail-stat-card">
            <div class="mail-stat-icon">📨</div>
            <div class="mail-stat-value">${this.stats.sent}</div>
            <div class="mail-stat-label">Emails envoyés</div>
          </div>
          <div class="mail-stat-card">
            <div class="mail-stat-icon">👁️</div>
            <div class="mail-stat-value">${this.stats.openRate}%</div>
            <div class="mail-stat-label">Taux d'ouverture</div>
          </div>
          <div class="mail-stat-card">
            <div class="mail-stat-icon">👥</div>
            <div class="mail-stat-value">${this.stats.contacts}</div>
            <div class="mail-stat-label">Contacts</div>
          </div>
        </div>
      </div>
    `;
  },

  renderTabs() {
    const tabs = [
      { id: 'inbox', icon: '📥', label: 'Boîte d\'envoi' },
      { id: 'contacts', icon: '👥', label: 'Contacts' },
      { id: 'templates', icon: '📋', label: 'Templates' },
      { id: 'campaigns', icon: '📊', label: 'Campagnes' },
      { id: 'stats', icon: '📈', label: 'Statistiques' }
    ];

    return `
      <div class="mail-tabs">
        ${tabs.map(tab => `
          <button class="mail-tab ${this.currentTab === tab.id ? 'active' : ''}"
                  data-tab="${tab.id}">
            <span class="mail-tab-icon">${tab.icon}</span>
            <span class="mail-tab-label">${tab.label}</span>
          </button>
        `).join('')}
      </div>
    `;
  },

  renderTabContent() {
    switch (this.currentTab) {
      case 'inbox':
        return this.renderInboxTab();
      case 'contacts':
        return this.renderContactsTab();
      case 'templates':
        return this.renderTemplatesTab();
      case 'campaigns':
        return this.renderCampaignsTab();
      case 'stats':
        return this.renderStatsTab();
      default:
        return '<div class="mail-empty">Onglet inconnu</div>';
    }
  },

  renderInboxTab() {
    return '<div id="mail-inbox-content" class="mail-tab-panel"><div class="mail-loading">Chargement...</div></div>';
  },

  renderContactsTab() {
    return '<div id="mail-contacts-content" class="mail-tab-panel"><div class="mail-loading">Chargement...</div></div>';
  },

  renderTemplatesTab() {
    return '<div id="mail-templates-content" class="mail-tab-panel"><div class="mail-loading">Chargement...</div></div>';
  },

  renderCampaignsTab() {
    return '<div id="mail-campaigns-content" class="mail-tab-panel"><div class="mail-loading">Chargement...</div></div>';
  },

  renderStatsTab() {
    return '<div id="mail-stats-content" class="mail-tab-panel"><div class="mail-loading">Chargement...</div></div>';
  },

  attachEvents() {
    // CTA buttons
    document.querySelector('[data-action="send-email"]')?.addEventListener('click', () => {
      MailComposer.open();
    });

    document.querySelector('[data-action="create-campaign"]')?.addEventListener('click', () => {
      if (typeof MailCampaigns !== 'undefined') {
        MailCampaigns.openWizard();
      } else {
        Toast.info('Module campagnes en cours de chargement...');
      }
    });

    // Tabs navigation
    document.querySelectorAll('.mail-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.currentTarget.dataset.tab);
      });
    });

    // Load initial tab content
    this.loadTabContent(this.currentTab);
  },

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update active tab
    document.querySelectorAll('.mail-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update content
    const content = document.getElementById('mail-tab-content');
    if (content) {
      content.innerHTML = this.renderTabContent();
      this.loadTabContent(tabId);
    }
  },

  async loadTabContent(tabId) {
    switch (tabId) {
      case 'inbox':
        if (typeof MailInbox !== 'undefined') {
          await MailInbox.load();
        }
        break;
      case 'contacts':
        if (typeof MailContacts !== 'undefined') {
          await MailContacts.load();
        }
        break;
      case 'templates':
        if (typeof MailTemplates !== 'undefined') {
          await MailTemplates.load();
        }
        break;
      case 'campaigns':
        if (typeof MailCampaigns !== 'undefined') {
          await MailCampaigns.load();
        }
        break;
      case 'stats':
        if (typeof MailStats !== 'undefined') {
          await MailStats.load();
        }
        break;
    }
  },

  async refresh() {
    await this.loadStats();
    this.render();
  }
};

window.MailView = MailView;
