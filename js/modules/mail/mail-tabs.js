// =============================================
// MAIL TABS - Gestion des onglets de navigation
// Tabs épurées et discrètes
// =============================================

const MailTabs = {
  currentTab: 'inbox', // Tab par défaut : Boite de réception

  // Configuration des onglets avec icônes SVG
  tabs: [
    {
      id: 'inbox', label: 'Boite de réception',
      icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>'
    },
    {
      id: 'sent', label: 'Envoyés',
      icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>'
    },
    {
      id: 'drafts', label: 'Brouillons',
      icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>'
    },
    {
      id: 'templates', label: 'Templates',
      icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>'
    },
    {
      id: 'campaigns', label: 'Campagnes',
      icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
    },
    {
      id: 'contacts', label: 'Contacts',
      icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
    }
  ],

  /**
   * Render tabs navigation avec icônes
   */
  render() {
    return `
      <div class="mail-tabs">
        ${this.tabs.map(tab => `
          <button
            class="mail-tab ${this.currentTab === tab.id ? 'active' : ''}"
            data-tab="${tab.id}">
            <span class="mail-tab-icon">${tab.icon}</span>
            <span class="mail-tab-label">${tab.label}</span>
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
