// =============================================
// MAIL HEADER - Header compact + Stats bar
// Design zen et épuré
// =============================================

const MailHeader = {
  configStatus: null,
  stats: { sent: 0, opened: 0, openRate: 0, contacts: 0 },
  statsVisible: true,

  /**
   * Charge la configuration et les stats
   */
  async init() {
    await this.checkConfig();
    await this.loadStats();
  },

  /**
   * Vérifie la config Resend
   */
  async checkConfig() {
    try {
      const result = await MailAPI.checkConfig();
      this.configStatus = { ok: true, from: result.from };
    } catch (error) {
      this.configStatus = { ok: false, error: error.message };
    }
  },

  /**
   * Charge les statistiques
   */
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
      console.error('[MailHeader] loadStats error:', error);
    }
  },

  /**
   * Render header compact premium
   */
  render() {
    const statusBadge = this.configStatus?.ok
      ? '<span class="mail-header-badge ok"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Resend configuré</span>'
      : '<span class="mail-header-badge error"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Configuration requise</span>';

    return `
      <div class="mail-header">
        <div class="mail-header-top">
          <div class="mail-header-title">
            <div class="mail-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div class="mail-header-text">
              <h1>Mail Pro</h1>
              ${statusBadge}
            </div>
          </div>
          <button class="btn mail-compose-btn" data-action="compose">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Composer un email
          </button>
        </div>
        ${this.renderStatsBar()}
      </div>
    `;
  },

  /**
   * Render stats bar premium
   */
  renderStatsBar() {
    if (!this.statsVisible) return '';

    return `
      <div class="mail-stats-bar">
        <div class="mail-stats-items">
          <span class="mail-stats-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            <strong>${this.stats.sent}</strong> envoyés
          </span>
          <span class="mail-stats-dot"></span>
          <span class="mail-stats-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <strong>${this.stats.openRate}%</strong> ouverture
          </span>
          <span class="mail-stats-dot"></span>
          <span class="mail-stats-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <strong>${this.stats.contacts}</strong> contacts
          </span>
        </div>
        <button class="mail-stats-toggle" data-action="toggle-stats">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          Stats
        </button>
      </div>
    `;
  },

  /**
   * Attache les événements
   */
  attachEvents() {
    // Bouton Composer
    document.querySelector('[data-action="compose"]')?.addEventListener('click', () => {
      if (typeof MailComposer !== 'undefined') {
        MailComposer.open();
      } else {
        Toast.info('Chargement du compositeur...');
      }
    });

    // Toggle stats bar (fonctionnalité future)
    document.querySelector('[data-action="toggle-stats"]')?.addEventListener('click', () => {
      // TODO: ouvrir modal détaillée ou toggle visibility
    });
  },

  /**
   * Rafraîchit les stats
   */
  async refresh() {
    await this.loadStats();
    // Re-render just stats bar
    const statsBar = document.querySelector('.mail-stats-bar');
    if (statsBar) {
      const container = document.createElement('div');
      container.innerHTML = this.renderStatsBar();
      statsBar.replaceWith(container.firstElementChild);
    }
  },

  /**
   * Toggle visibility de la stats bar
   */
  toggleStatsBar() {
    this.statsVisible = !this.statsVisible;
    const header = document.querySelector('.mail-header');
    if (header) {
      const container = document.createElement('div');
      container.innerHTML = this.render();
      header.replaceWith(container.firstElementChild);
      this.attachEvents();
    }
  }
};

window.MailHeader = MailHeader;
