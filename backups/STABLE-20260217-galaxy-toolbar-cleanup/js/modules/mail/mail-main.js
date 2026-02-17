// =============================================
// MAIL MAIN - Orchestrateur principal
// Coordonne Header, Tabs et Content
// =============================================

const MailView = {
  initialized: false,

  /**
   * Point d'entrée principal
   */
  async init() {
    if (this.initialized) {
      console.log('[MailView] Already initialized');
      return;
    }

    console.log('[MailView] Initializing Mail Pro...');

    try {
      // Init header (charge config + stats)
      await MailHeader.init();

      // Render UI
      this.render();

      // Attach events
      this.attachEvents();

      this.initialized = true;
      console.log('[MailView] ✓ Mail Pro initialized');
    } catch (error) {
      console.error('[MailView] Init error:', error);
      this.renderError();
    }
  },

  /**
   * Render full UI
   */
  render() {
    const container = document.getElementById('view-mail');
    if (!container) {
      console.error('[MailView] Container #view-mail not found');
      return;
    }

    container.innerHTML = `
      ${MailHeader.render()}
      ${MailTabs.render()}
      ${MailTabs.renderContent()}
    `;
  },

  /**
   * Attach global events
   */
  attachEvents() {
    MailHeader.attachEvents();
    MailTabs.attachEvents();

    // Load initial tab content
    MailTabs.loadTabContent(MailTabs.getCurrentTab());
  },

  /**
   * Render error state
   */
  renderError() {
    const container = document.getElementById('view-mail');
    if (!container) return;

    container.innerHTML = `
      <div class="mail-error-full">
        <h2>❌ Erreur d'initialisation</h2>
        <p>Impossible de charger la section Mail Pro</p>
        <button class="btn btn-primary" onclick="MailView.init()">
          Réessayer
        </button>
      </div>
    `;
  },

  /**
   * Refresh entire view
   */
  async refresh() {
    await MailHeader.refresh();
    await MailTabs.loadTabContent(MailTabs.getCurrentTab());
  },

  /**
   * Switch to specific tab (API publique)
   */
  switchToTab(tabId) {
    MailTabs.switchTab(tabId);
  },

  /**
   * Open composer (API publique)
   */
  openComposer(prefill = null) {
    if (typeof MailComposer !== 'undefined') {
      MailComposer.open(prefill);
    } else {
      Toast.error('Module compositeur non chargé');
    }
  }
};

// Expose globalement
window.MailView = MailView;
