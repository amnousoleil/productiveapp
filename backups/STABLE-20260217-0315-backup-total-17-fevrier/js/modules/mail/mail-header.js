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
   * Render header compact
   */
  render() {
    const statusBadge = this.configStatus?.ok
      ? '<span class="mail-header-badge ok">Resend configuré ✓</span>'
      : '<span class="mail-header-badge error">Configuration requise ⚠</span>';

    return `
      <div class="mail-header">
        <div class="mail-header-top">
          <div class="mail-header-title">
            <h1>✉ Mail Pro</h1>
            ${statusBadge}
          </div>
          <button class="btn btn-primary mail-compose-btn" data-action="compose">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
   * Render stats bar (optionnelle, peut être masquée)
   */
  renderStatsBar() {
    if (!this.statsVisible) return '';

    return `
      <div class="mail-stats-bar">
        <div class="mail-stats-items">
          <span class="mail-stats-item">
            📤 <strong>${this.stats.sent}</strong> envoyés
          </span>
          <span class="mail-stats-separator">•</span>
          <span class="mail-stats-item">
            👁 <strong>${this.stats.openRate}%</strong> ouverture
          </span>
          <span class="mail-stats-separator">•</span>
          <span class="mail-stats-item">
            👥 <strong>${this.stats.contacts}</strong> contacts
          </span>
        </div>
        <button class="mail-stats-toggle" data-action="toggle-stats">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18"></path>
          </svg>
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
