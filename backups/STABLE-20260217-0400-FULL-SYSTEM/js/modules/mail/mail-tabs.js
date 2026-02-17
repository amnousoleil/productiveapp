// =============================================
// MAIL TABS - Gestion des onglets de navigation
// Tabs épurées et discrètes
// =============================================

const MailTabs = {
  currentTab: 'inbox', // Tab par défaut : Boite de réception

  // Configuration des onglets (inbox en premier)
  tabs: [
    { id: 'inbox', label: '📬 Boite de réception' },
    { id: 'sent', label: 'Envoyés' },
    { id: 'drafts', label: 'Brouillons' },
    { id: 'templates', label: 'Templates' },
    { id: 'campaigns', label: 'Campagnes' },
    { id: 'contacts', label: 'Contacts' }
  ],

  /**
   * Render tabs navigation
   */
  render() {
    return `
      <div class="mail-tabs">
        ${this.tabs.map(tab => `
          <button
            class="mail-tab ${this.currentTab === tab.id ? 'active' : ''}"
            data-tab="${tab.id}">
            ${tab.label}
          </button>
        `).join('')}
      </div>
    `;
  },

  /**
   * Render content area
   */
  renderContent() {
    return `
      <div class="mail-tab-content" id="mail-tab-content">
        ${this.getTabContent()}
      </div>
    `;
  },

  /**
   * Get content for current tab
   */
  getTabContent() {
    switch (this.currentTab) {
      case 'inbox':
        return '<div id="mail-inbox-content" class="mail-tab-panel"></div>';
      case 'sent':
        return '<div id="mail-sent-content" class="mail-tab-panel"></div>';
      case 'drafts':
        return '<div id="mail-drafts-content" class="mail-tab-panel"><div class="mail-empty">Aucun brouillon</div></div>';
      case 'templates':
        return '<div id="mail-templates-content" class="mail-tab-panel"></div>';
      case 'campaigns':
        return '<div id="mail-campaigns-content" class="mail-tab-panel"></div>';
      case 'contacts':
        return '<div id="mail-contacts-content" class="mail-tab-panel"></div>';
      default:
        return '<div class="mail-empty">Onglet inconnu</div>';
    }
  },

  /**
   * Switch to another tab
   */
  switchTab(tabId) {
    // Validation
    if (!this.tabs.find(t => t.id === tabId)) {
      console.error('[MailTabs] Invalid tab:', tabId);
      return;
    }

    this.currentTab = tabId;

    // Update active class
    document.querySelectorAll('.mail-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update content
    const content = document.getElementById('mail-tab-content');
    if (content) {
      content.innerHTML = this.getTabContent();
      this.loadTabContent(tabId);
    }
  },

  /**
   * Load tab content (delegate to appropriate module)
   */
  async loadTabContent(tabId) {
    const container = document.querySelector(`#mail-${tabId}-content`);
    if (!container) return;

    // Show loading
    container.innerHTML = '<div class="mail-loading"><div class="spinner"></div> Chargement...</div>';

    try {
      switch (tabId) {
        case 'inbox':
          if (typeof MailInboxList !== 'undefined') {
            await MailInboxList.load();
          }
          break;
        case 'sent':
          if (typeof MailSentList !== 'undefined') {
            await MailSentList.load();
          }
          break;
        case 'drafts':
          // TODO: MailDrafts module
          container.innerHTML = '<div class="mail-empty">Aucun brouillon</div>';
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
        case 'contacts':
          if (typeof MailContacts !== 'undefined') {
            await MailContacts.load();
          }
          break;
      }
    } catch (error) {
      console.error('[MailTabs] loadTabContent error:', error);
      container.innerHTML = `
        <div class="mail-error">
          <p>❌ Erreur lors du chargement</p>
          <button class="btn btn-outline" onclick="MailTabs.loadTabContent('${tabId}')">Réessayer</button>
        </div>
      `;
    }
  },

  /**
   * Attach event listeners
   */
  attachEvents() {
    document.querySelectorAll('.mail-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.currentTarget.dataset.tab);
      });
    });
  },

  /**
   * Get current tab ID
   */
  getCurrentTab() {
    return this.currentTab;
  }
};

window.MailTabs = MailTabs;
