/**
 * Config Enhanced Features v1.0
 * @description Live preview, validation, quick actions
 */

const ConfigEnhanced = {
  previewMode: false,
  originalConfig: null,
  changeHistory: [],

  /**
   * Enable live preview of changes
   */
  enableLivePreview() {
    this.previewMode = true;
    this.originalConfig = { ...ConfigDevView.config };

    Toast.info('Mode prévisualisation activé');

    // Add preview banner
    this.showPreviewBanner();

    // Watch form inputs for changes
    this.watchFormChanges();
  },

  /**
   * Disable live preview and revert changes
   */
  disableLivePreview() {
    if (!this.previewMode) return;

    this.previewMode = false;

    // Revert to original config
    if (this.originalConfig) {
      ConfigDevView.config = { ...this.originalConfig };
      ConfigDevView.renderCurrentTab();
    }

    // Remove preview banner
    const banner = document.querySelector('.config-preview-banner');
    if (banner) banner.remove();

    Toast.success('Prévisualisation désactivée');
  },

  /**
   * Show preview banner at top
   */
  showPreviewBanner() {
    const existing = document.querySelector('.config-preview-banner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.className = 'config-preview-banner';
    banner.innerHTML = `
      <span class="preview-icon">👁️</span>
      <span class="preview-text">Mode Prévisualisation • Les modifications ne sont pas encore sauvegardées</span>
      <button class="preview-close" onclick="ConfigEnhanced.disableLivePreview()">✕</button>
    `;

    const container = document.querySelector('.config-dev-container');
    if (container) {
      container.insertBefore(banner, container.firstChild);
    }
  },

  /**
   * Watch form inputs for real-time changes
   */
  watchFormChanges() {
    const container = document.querySelector('.config-dev-container');
    if (!container) return;

    container.addEventListener('input', (e) => {
      if (!this.previewMode) return;

      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        this.applyPreviewChange(target);
      }
    });
  },

  /**
   * Apply preview change instantly (without saving)
   */
  applyPreviewChange(input) {
    const fieldName = input.name || input.id;
    const value = input.value;

    console.log(`[ConfigEnhanced] Preview change: ${fieldName} = ${value}`);

    // Record change for history
    this.changeHistory.push({
      field: fieldName,
      from: ConfigDevView.config[fieldName],
      to: value,
      timestamp: new Date().toISOString()
    });

    // Update config temporarily
    ConfigDevView.config[fieldName] = value;

    // Apply visual preview (e.g., change theme color)
    this.applyVisualPreview(fieldName, value);
  },

  /**
   * Apply visual preview changes to UI
   */
  applyVisualPreview(field, value) {
    switch (field) {
      case 'primary_color':
        document.documentElement.style.setProperty('--preview-primary', value);
        break;
      case 'app_name':
        const title = document.querySelector('.config-dev-title');
        if (title) {
          title.textContent = `🛠️ Configuration - ${value}`;
        }
        break;
      case 'default_theme':
        document.documentElement.setAttribute('data-preview-theme', value);
        break;
    }
  },

  /**
   * Validate config before saving
   */
  async validateConfig(config) {
    const errors = [];

    // Validate app name
    if (!config.app_name || config.app_name.trim().length < 3) {
      errors.push('Le nom de l\'application doit contenir au moins 3 caractères');
    }

    // Validate primary color (hex format)
    if (config.primary_color && !/^#[0-9A-F]{6}$/i.test(config.primary_color)) {
      errors.push('La couleur primaire doit être au format hexadécimal (#RRGGBB)');
    }

    // Validate email format
    if (config.support_email && !this.isValidEmail(config.support_email)) {
      errors.push('L\'email de support n\'est pas valide');
    }

    // Validate URLs
    if (config.logo_url && !this.isValidURL(config.logo_url)) {
      errors.push('L\'URL du logo n\'est pas valide');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Check if email is valid
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Check if URL is valid
   */
  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Quick action: Reset to default theme
   */
  async quickResetTheme() {
    if (!confirm('Réinitialiser le thème par défaut ?')) return;

    try {
      const updated = await ConfigDevAPI.updateConfig({
        default_theme: 'midnight',
        primary_color: '#d4af37'
      });

      ConfigDevView.config = updated;
      ConfigDevView.renderCurrentTab();
      Toast.success('Thème réinitialisé');
    } catch (error) {
      Toast.error('Erreur de réinitialisation');
      console.error(error);
    }
  },

  /**
   * Quick action: Toggle maintenance mode
   */
  async toggleMaintenanceMode() {
    try {
      const currentMode = ConfigDevView.config.maintenance_mode || false;
      const updated = await ConfigDevAPI.updateConfig({
        maintenance_mode: !currentMode
      });

      ConfigDevView.config = updated;
      ConfigDevView.renderCurrentTab();

      const status = updated.maintenance_mode ? 'activé' : 'désactivé';
      Toast.success(`Mode maintenance ${status}`);
    } catch (error) {
      Toast.error('Erreur de basculement');
      console.error(error);
    }
  },

  /**
   * Show change history modal
   */
  showChangeHistory() {
    if (this.changeHistory.length === 0) {
      Toast.info('Aucune modification récente');
      return;
    }

    const historyHTML = this.changeHistory.slice(-10).reverse().map(change => `
      <div class="history-item">
        <span class="history-field">${change.field}</span>
        <span class="history-arrow">→</span>
        <span class="history-value">${change.to}</span>
        <span class="history-time">${new Date(change.timestamp).toLocaleTimeString()}</span>
      </div>
    `).join('');

    const modal = document.createElement('div');
    modal.className = 'config-history-modal';
    modal.innerHTML = `
      <div class="history-modal-content">
        <h3>📜 Historique des modifications</h3>
        <div class="history-list">${historyHTML}</div>
        <button class="btn-close-modal" onclick="this.closest('.config-history-modal').remove()">Fermer</button>
      </div>
    `;

    document.body.appendChild(modal);
  },

  /**
   * Enhanced save with validation
   */
  async saveWithValidation() {
    // Validate first
    const validation = await this.validateConfig(ConfigDevView.config);

    if (!validation.valid) {
      Toast.error('Erreurs de validation :');
      validation.errors.forEach(err => {
        console.error('Validation error:', err);
        Toast.error(err);
      });
      return;
    }

    // Proceed with save
    try {
      await ConfigDevView.saveConfig();
    } catch (error) {
      Toast.error('Erreur de sauvegarde');
      console.error(error);
    }
  },

  /**
   * Initialize enhanced features
   */
  init() {
    console.log('[ConfigEnhanced] Initializing enhanced features');

    // Add quick actions to UI
    this.injectQuickActions();
  },

  /**
   * Inject quick action buttons into UI
   */
  injectQuickActions() {
    setTimeout(() => {
      const header = document.querySelector('.config-dev-header');
      if (!header || document.querySelector('.config-quick-actions')) return;

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'config-quick-actions';
      actionsDiv.innerHTML = `
        <button class="quick-action-btn" onclick="ConfigEnhanced.enableLivePreview()" title="Activer prévisualisation live">
          👁️ Prévisualisation
        </button>
        <button class="quick-action-btn" onclick="ConfigEnhanced.showChangeHistory()" title="Voir l'historique">
          📜 Historique
        </button>
        <button class="quick-action-btn success" onclick="ConfigEnhanced.saveWithValidation()" title="Sauvegarder avec validation">
          ✅ Valider & Sauvegarder
        </button>
      `;

      header.appendChild(actionsDiv);
    }, 500);
  }
};

// Auto-init when ConfigDevView renders
if (typeof ConfigDevView !== 'undefined') {
  const originalRender = ConfigDevView.render;
  ConfigDevView.render = async function() {
    await originalRender.call(this);
    setTimeout(() => ConfigEnhanced.init(), 500);
  };
}

// Expose globally
window.ConfigEnhanced = ConfigEnhanced;
