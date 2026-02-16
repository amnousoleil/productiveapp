const ConfigView = {
  currentConfig: null,

  async render(container) {
    try {
      this.currentConfig = await ConfigApi.getConfig();
    } catch (error) {
      console.error('Failed to load config:', error);
      container.innerHTML = '<div class="config-error">❌ Erreur chargement config</div>';
      return;
    }

    container.innerHTML = `
      <div class="config-premium-container">
        <!-- Hero Header -->
        <div class="config-hero">
          <div class="hero-icon">⚙️</div>
          <div class="hero-content">
            <h1 class="hero-title">Configuration Workspace</h1>
            <p class="hero-subtitle">Personnalisez votre espace de travail</p>
          </div>
        </div>

        <!-- Grid 2 colonnes -->
        <div class="config-grid">
          <!-- Card Apparence -->
          <div class="config-card">
            <div class="card-header">
              <span class="card-icon gradient-1">🎨</span>
              <h2 class="card-title">Apparence</h2>
            </div>
            
            <div class="config-section">
              <label class="config-label">Logo Workspace</label>
              <div class="logo-uploader" id="logo-dropzone">
                <img id="logo-preview" 
                     src="${this.currentConfig.logo_url || ''}" 
                     style="${this.currentConfig.logo_url ? 'display:block' : 'display:none'}"
                     class="logo-preview-img">
                <div class="upload-placeholder" style="${this.currentConfig.logo_url ? 'display:none' : ''}">
                  <span class="upload-icon">📤</span>
                  <span class="upload-text">Cliquez ou glissez une image</span>
                  <span class="upload-hint">PNG, JPG, max 5MB</span>
                </div>
              </div>
              ${this.currentConfig.logo_url ? `
                <button class="btn-delete-logo" id="delete-logo-btn">🗑️ Supprimer logo</button>
              ` : ''}
            </div>

            <div class="config-section">
              <label class="config-label">Couleur Primaire</label>
              <div class="color-picker-wrapper">
                <input type="color" id="primary-color-input" 
                       value="${this.currentConfig.primary_color || '#d4af37'}"
                       class="color-input">
                <span class="color-value">${this.currentConfig.primary_color || '#d4af37'}</span>
              </div>
              <div class="color-presets">
                ${['#d4af37', '#6366f1', '#ec4899', '#10b981', '#f59e0b'].map(c => 
                  `<button class="color-preset" style="background:${c}" data-color="${c}"></button>`
                ).join('')}
              </div>
            </div>

            <div class="config-section">
              <label class="config-label">Thème par Défaut</label>
              <select id="theme-select" class="config-select">
                <option value="executive" ${this.currentConfig.default_theme === 'executive' ? 'selected' : ''}>Executive (Or)</option>
                <option value="sakura" ${this.currentConfig.default_theme === 'sakura' ? 'selected' : ''}>Sakura (Rose)</option>
                <option value="lavender" ${this.currentConfig.default_theme === 'lavender' ? 'selected' : ''}>Lavender (Violet)</option>
                <option value="mint" ${this.currentConfig.default_theme === 'mint' ? 'selected' : ''}>Mint (Vert)</option>
                <option value="ocean" ${this.currentConfig.default_theme === 'ocean' ? 'selected' : ''}>Ocean (Bleu)</option>
              </select>
            </div>
          </div>

          <!-- Card Workspace -->
          <div class="config-card">
            <div class="card-header">
              <span class="card-icon gradient-2">🌍</span>
              <h2 class="card-title">Workspace</h2>
            </div>

            <div class="config-section">
              <label class="config-label">Nom du Workspace</label>
              <input type="text" id="workspace-name-input" 
                     value="${this.currentConfig.name || ''}"
                     placeholder="Mon Entreprise"
                     class="config-input">
            </div>

            <div class="config-section">
              <label class="config-label">Fuseau Horaire</label>
              <select id="timezone-select" class="config-select">
                ${[
                  ['Europe/Paris', 'Europe/Paris (GMT+1)'],
                  ['America/New_York', 'America/New York (GMT-5)'],
                  ['America/Los_Angeles', 'America/Los Angeles (GMT-8)'],
                  ['Asia/Tokyo', 'Asia/Tokyo (GMT+9)'],
                  ['UTC', 'UTC']
                ].map(([val, label]) => 
                  `<option value="${val}" ${this.currentConfig.timezone === val ? 'selected' : ''}>${label}</option>`
                ).join('')}
              </select>
            </div>

            <div class="config-section">
              <label class="config-label">Langue Interface</label>
              <select id="locale-select" class="config-select">
                <option value="fr" ${this.currentConfig.locale === 'fr' ? 'selected' : ''}>🇫🇷 Français</option>
                <option value="en" ${this.currentConfig.locale === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                <option value="es" ${this.currentConfig.locale === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
                <option value="de" ${this.currentConfig.locale === 'de' ? 'selected' : ''}>🇩🇪 Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="config-footer">
          <button class="btn-save" id="save-config-btn">
            <span class="btn-icon">💾</span>
            <span class="btn-text">Enregistrer les modifications</span>
          </button>
        </div>
      </div>
    `;

    this.attachEvents();
  },

  attachEvents() {
    const dropzone = document.getElementById('logo-dropzone');
    const preview = document.getElementById('logo-preview');
    if (dropzone && preview) {
      ConfigUploader.init(dropzone, preview, (logoUrl) => {
        this.currentConfig.logo_url = logoUrl;
        // Refresh view pour montrer bouton supprimer
        this.render(document.querySelector('.config-premium-container').parentElement);
      });
    }

    document.getElementById('delete-logo-btn')?.addEventListener('click', async () => {
      if (!confirm('Supprimer le logo ?')) return;
      await ConfigApi.deleteLogo();
      this.currentConfig.logo_url = null;
      window.Toast?.success('Logo supprimé');
      this.render(document.querySelector('.config-premium-container').parentElement);
    });

    const colorInput = document.getElementById('primary-color-input');
    const colorValue = document.querySelector('.color-value');
    colorInput?.addEventListener('input', (e) => {
      colorValue.textContent = e.target.value;
      this.currentConfig.primary_color = e.target.value;
    });

    document.querySelectorAll('.color-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        colorInput.value = color;
        colorValue.textContent = color;
        this.currentConfig.primary_color = color;
      });
    });

    document.getElementById('save-config-btn')?.addEventListener('click', () => this.saveConfig());

    // Live preview
    ['workspace-name-input', 'theme-select', 'timezone-select', 'locale-select'].forEach(id => {
      const el = document.getElementById(id);
      const key = id.replace('-input', '').replace('-select', '').replace(/-/g, '_');
      el?.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', (e) => {
        this.currentConfig[key] = e.target.value;
      });
    });
  },

  async saveConfig() {
    try {
      const btn = document.getElementById('save-config-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Enregistrement...</span>';

      await ConfigApi.updateConfig({
        name: this.currentConfig.name,
        primary_color: this.currentConfig.primary_color,
        default_theme: this.currentConfig.default_theme,
        timezone: this.currentConfig.timezone,
        locale: this.currentConfig.locale
      });

      window.Toast?.success('✅ Configuration enregistrée !');
      btn.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">Enregistrer les modifications</span>';
      btn.disabled = false;

      // Apply theme if changed
      if (window.ThemeManager && this.currentConfig.default_theme) {
        setTimeout(() => {
          if (confirm('Appliquer le nouveau thème maintenant ?')) {
            ThemeManager.apply(this.currentConfig.default_theme);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Save error:', error);
      window.Toast?.error('❌ Erreur sauvegarde');
      const btn = document.getElementById('save-config-btn');
      btn.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">Enregistrer les modifications</span>';
      btn.disabled = false;
    }
  }
};

window.ConfigView = ConfigView;
console.log('✅ ConfigView loaded');
