/**
 * CONFIG DEV VIEW
 * Interface développeur - Configuration globale app
 * @version 1.0
 */

const ConfigDevView = {
  config: null,
  currentTab: 'branding',

  async render() {
    console.log('[ConfigDevView] Rendering config dev interface');

    let container = document.querySelector('#view-config-dev');
    const mainContent = document.querySelector('.main-content');

    if (!mainContent) {
      console.error('[ConfigDevView] .main-content not found');
      return;
    }

    if (!container) {
      container = document.createElement('div');
      container.id = 'view-config-dev';
      container.className = 'view-container';
      mainContent.appendChild(container);
    }

    // Charger config
    try {
      this.config = await ConfigDevAPI.getConfig();
    } catch (error) {
      container.innerHTML = `<div class="error-message">Erreur de chargement: ${error.message}</div>`;
      return;
    }

    container.innerHTML = `
      <div class="config-dev-container">
        <div class="config-dev-header">
          <h1 class="config-dev-title">🛠️ Configuration Développeur</h1>
          <p class="config-dev-subtitle">Personnalisez l'application sans toucher au code</p>
        </div>

        <div class="config-dev-tabs">
          <button class="config-dev-tab active" data-tab="branding">🎨 Branding</button>
          <button class="config-dev-tab" data-tab="textes">📝 Textes</button>
          <button class="config-dev-tab" data-tab="tarifs">💳 Tarifs</button>
          <button class="config-dev-tab" data-tab="autre">⚙️ Autre</button>
        </div>

        <div id="tab-branding" class="config-dev-content active"></div>
        <div id="tab-textes" class="config-dev-content"></div>
        <div id="tab-tarifs" class="config-dev-content"></div>
        <div id="tab-autre" class="config-dev-content"></div>

        <div class="config-dev-footer">
          <button class="btn-config btn-config-secondary" onclick="ConfigDevView.resetConfig()">
            🔄 Réinitialiser
          </button>
          <button class="btn-config btn-config-secondary" onclick="ConfigDevView.exportConfig()">
            💾 Exporter JSON
          </button>
          <button class="btn-config btn-config-primary" onclick="ConfigDevView.saveConfig()">
            💾 Enregistrer les modifications
          </button>
        </div>
      </div>
    `;

    this.renderBrandingTab();
    this.renderTextesTab();
    this.renderTarifsTab();
    this.renderAutreTab();
    this.initEvents();
  },

  renderBrandingTab() {
    const container = document.getElementById('tab-branding');
    container.innerHTML = `
      <div class="config-section">
        <h3 class="config-section-title">Logo de l'application</h3>
        <div class="logo-preview-container">
          <div class="logo-preview">
            ${this.config.logo_url ?
              `<img src="${this.config.logo_url}" alt="Logo" id="logo-preview-img">` :
              '<span class="logo-preview-placeholder">👑</span>'}
          </div>
          <div>
            <input type="file" id="logo-file-input" accept="image/png,image/jpeg,image/svg+xml" style="display:none">
            <button class="logo-upload-btn" onclick="document.getElementById('logo-file-input').click()">
              📁 Choisir un fichier
            </button>
            <p style="font-size:12px;color:#666;margin:8px 0 0 0;">PNG, JPG ou SVG · Max 2MB</p>
          </div>
        </div>
      </div>

      <div class="config-section">
        <h3 class="config-section-title">Identité</h3>
        <div class="config-field">
          <label class="config-label">Nom de l'application</label>
          <input type="text" class="config-input" id="input-app-name" value="${this.config.app_name}" maxlength="100">
        </div>
        <div class="config-field">
          <label class="config-label">Signature créateur</label>
          <input type="text" class="config-input" id="input-creator-signature" value="${this.config.creator_signature}" maxlength="100">
        </div>
        <div class="config-field">
          <label class="config-label">Couleur de marque</label>
          <div class="color-picker-wrapper">
            <input type="color" class="color-picker-input" id="input-brand-color" value="${this.config.brand_color}">
            <div class="color-preview" style="background-color:${this.config.brand_color}"></div>
            <input type="text" class="config-input" id="input-brand-color-text" value="${this.config.brand_color}"
                   pattern="^#[0-9A-Fa-f]{6}$" style="max-width:100px">
          </div>
        </div>
      </div>
    `;
  },

  renderTextesTab() {
    const container = document.getElementById('tab-textes');
    container.innerHTML = `
      <div class="config-section">
        <h3 class="config-section-title">Textes de la page de connexion</h3>
        <div class="config-field">
          <label class="config-label">Texte de bienvenue</label>
          <textarea class="config-textarea" id="input-welcome-text" maxlength="500">${this.config.welcome_text}</textarea>
        </div>
        <div class="config-field">
          <label class="config-label">Sous-titre</label>
          <input type="text" class="config-input" id="input-login-subtitle" value="${this.config.login_subtitle}" maxlength="200">
        </div>
      </div>
    `;
  },

  renderTarifsTab() {
    const container = document.getElementById('tab-tarifs');
    const plans = this.config.pricing_plans || [];

    container.innerHTML = `
      <div class="config-section">
        <h3 class="config-section-title">Plans tarifaires</h3>
        <p style="color:#666;font-size:14px;margin-bottom:16px;">Gérez les offres d'abonnement de votre application.</p>
        <div class="pricing-plans-list" id="pricing-plans-list">
          ${plans.length === 0 ? '<p style="color:#999;text-align:center;padding:20px;">Aucun plan tarifaire configuré</p>' :
            plans.map((plan, i) => this.renderPricingPlanCard(plan, i)).join('')}
        </div>
        <button class="btn-config btn-config-secondary" style="margin-top:16px" onclick="ConfigDevView.addPlan()">
          + Ajouter un plan
        </button>
      </div>
    `;
  },

  renderPricingPlanCard(plan, index) {
    return `
      <div class="pricing-plan-card ${plan.highlighted ? 'highlighted' : ''}" data-plan-index="${index}">
        <div class="pricing-plan-info">
          <h4>${plan.name} ${plan.highlighted ? '⭐' : ''}</h4>
          <div class="pricing-plan-price">${plan.price}</div>
          <ul class="pricing-plan-features">
            ${(plan.features || []).map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
        <div class="pricing-plan-actions">
          <button class="icon-btn" onclick="ConfigDevView.editPlan(${index})" title="Modifier">✏️</button>
          <button class="icon-btn" onclick="ConfigDevView.deletePlan(${index})" title="Supprimer">🗑️</button>
        </div>
      </div>
    `;
  },

  renderAutreTab() {
    const container = document.getElementById('tab-autre');
    container.innerHTML = `
      <div class="config-section">
        <h3 class="config-section-title">Contact & Support</h3>
        <div class="config-field">
          <label class="config-label">Email support</label>
          <input type="email" class="config-input" id="input-support-email" value="${this.config.support_email}" maxlength="100">
        </div>
        <div class="config-field">
          <label class="config-label">Domaine personnalisé</label>
          <input type="text" class="config-input" id="input-custom-domain" value="${this.config.custom_domain}" maxlength="200">
        </div>
      </div>
    `;
  },

  initEvents() {
    // Tabs
    document.querySelectorAll('.config-dev-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Logo upload
    const logoInput = document.getElementById('logo-file-input');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => this.handleLogoUpload(e));
    }

    // Color picker sync
    const colorPicker = document.getElementById('input-brand-color');
    const colorText = document.getElementById('input-brand-color-text');
    const colorPreview = document.querySelector('.color-preview');

    if (colorPicker && colorText) {
      colorPicker.addEventListener('input', (e) => {
        colorText.value = e.target.value;
        if (colorPreview) colorPreview.style.backgroundColor = e.target.value;
      });
      colorText.addEventListener('input', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
          colorPicker.value = e.target.value;
          if (colorPreview) colorPreview.style.backgroundColor = e.target.value;
        }
      });
    }
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.config-dev-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.config-dev-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
  },

  async handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Toast.error('Fichier trop volumineux (max 2MB)');
      return;
    }

    try {
      const result = await ConfigDevAPI.uploadLogo(file);
      this.config.logo_url = result.logo_url;
      const img = document.getElementById('logo-preview-img');
      if (img) {
        img.src = result.logo_url;
      } else {
        document.querySelector('.logo-preview').innerHTML = `<img src="${result.logo_url}" alt="Logo" id="logo-preview-img">`;
      }
      Toast.success('Logo uploadé avec succès');
    } catch (error) {
      Toast.error(`Erreur upload: ${error.message}`);
    }
  },

  async saveConfig() {
    const data = {
      app_name: document.getElementById('input-app-name')?.value,
      creator_signature: document.getElementById('input-creator-signature')?.value,
      brand_color: document.getElementById('input-brand-color')?.value,
      welcome_text: document.getElementById('input-welcome-text')?.value,
      login_subtitle: document.getElementById('input-login-subtitle')?.value,
      support_email: document.getElementById('input-support-email')?.value,
      custom_domain: document.getElementById('input-custom-domain')?.value,
      pricing_plans: this.config.pricing_plans,
    };

    try {
      this.config = await ConfigDevAPI.updateConfig(data);
      Toast.success('Configuration enregistrée avec succès');
    } catch (error) {
      Toast.error(`Erreur: ${error.message}`);
    }
  },

  async resetConfig() {
    if (!confirm('Réinitialiser toute la configuration aux valeurs par défaut ?')) return;

    try {
      this.config = await ConfigDevAPI.resetConfig();
      await this.render();
      Toast.success('Configuration réinitialisée');
    } catch (error) {
      Toast.error(`Erreur: ${error.message}`);
    }
  },

  exportConfig() {
    ConfigDevAPI.exportJSON(this.config, `config-${Date.now()}.json`);
    Toast.success('Configuration exportée');
  },

  addPlan() {
    const name = prompt('Nom du plan:');
    if (!name) return;
    const price = prompt('Prix (ex: "9.99€/mois"):');
    if (!price) return;

    this.config.pricing_plans = this.config.pricing_plans || [];
    this.config.pricing_plans.push({
      name,
      price,
      features: ['Fonctionnalité 1', 'Fonctionnalité 2'],
      highlighted: false,
    });
    this.renderTarifsTab();
  },

  editPlan(index) {
    Toast.info('Edition de plan: à implémenter (modal)');
  },

  deletePlan(index) {
    if (!confirm('Supprimer ce plan ?')) return;
    this.config.pricing_plans.splice(index, 1);
    this.renderTarifsTab();
  },

  destroy() {
    // Cleanup si nécessaire
  },
};

window.ConfigDevView = ConfigDevView;
