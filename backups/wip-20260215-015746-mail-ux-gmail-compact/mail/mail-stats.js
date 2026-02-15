// =============================================
// MAIL STATS - Statistiques visuelles
// =============================================

const MailStats = {
  stats: null,

  async load() {
    const container = document.getElementById('mail-stats-content');
    if (!container) return;

    container.innerHTML = '<div class="mail-loading"><div class="spinner"></div> Chargement...</div>';

    try {
      const result = await MailAPI.getStats();
      this.stats = result.stats;
      this.render();
    } catch (error) {
      console.error('[MailStats] load error:', error);
      container.innerHTML = '<div class="mail-error">Erreur lors du chargement</div>';
    }
  },

  render() {
    const container = document.getElementById('mail-stats-content');
    if (!container) return;

    const s = this.stats;

    container.innerHTML = `
      <div class="mail-section-header">
        <h3>📈 Statistiques d'emailing</h3>
        <button class="btn btn-outline" data-action="refresh-stats">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Actualiser
        </button>
      </div>

      <div class="mail-stats-grid">
        <div class="mail-stat-box">
          <div class="mail-stat-box-icon">📨</div>
          <div class="mail-stat-box-value">${s.total_sent}</div>
          <div class="mail-stat-box-label">Total envoyés</div>
        </div>

        <div class="mail-stat-box">
          <div class="mail-stat-box-icon">👁️</div>
          <div class="mail-stat-box-value">${s.total_opened}</div>
          <div class="mail-stat-box-label">Emails ouverts</div>
        </div>

        <div class="mail-stat-box">
          <div class="mail-stat-box-icon">🎯</div>
          <div class="mail-stat-box-value">${Math.round(s.open_rate)}%</div>
          <div class="mail-stat-box-label">Taux d'ouverture</div>
        </div>

        <div class="mail-stat-box">
          <div class="mail-stat-box-icon">🖱️</div>
          <div class="mail-stat-box-value">${Math.round(s.click_rate)}%</div>
          <div class="mail-stat-box-label">Taux de clics</div>
        </div>
      </div>

      <div class="mail-stats-period">
        <div class="mail-stat-card">
          <h4>📅 Aujourd'hui</h4>
          <p class="mail-stat-big">${s.sent_today}</p>
          <p class="mail-stat-small">emails envoyés</p>
        </div>

        <div class="mail-stat-card">
          <h4>📆 Cette semaine</h4>
          <p class="mail-stat-big">${s.sent_this_week}</p>
          <p class="mail-stat-small">emails envoyés</p>
        </div>

        <div class="mail-stat-card">
          <h4>📊 Ce mois</h4>
          <p class="mail-stat-big">${s.sent_this_month}</p>
          <p class="mail-stat-small">emails envoyés</p>
        </div>
      </div>

      ${s.recent_activity && s.recent_activity.length > 0 ? `
        <div class="mail-activity-chart">
          <h4>📈 Activité des 7 derniers jours</h4>
          <div class="mail-activity-bars">
            ${s.recent_activity.reverse().map(day => `
              <div class="mail-activity-bar">
                <div class="mail-activity-bar-fill" style="height: ${this.getBarHeight(day.count, s.recent_activity)}%"></div>
                <span class="mail-activity-bar-label">${new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    this.attachEvents();
  },

  attachEvents() {
    document.querySelector('[data-action="refresh-stats"]')?.addEventListener('click', () => {
      this.load();
    });
  },

  getBarHeight(count, allCounts) {
    const maxCount = Math.max(...allCounts.map(d => d.count), 1);
    return Math.max(10, (count / maxCount) * 100);
  }
};

window.MailStats = MailStats;
