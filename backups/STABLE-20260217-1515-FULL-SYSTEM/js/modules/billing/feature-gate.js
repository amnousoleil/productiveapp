/**
 * Feature Gate - Contrôle d'accès aux features par plan
 * Bloque les fonctionnalités non disponibles avec le plan actuel
 */

const FeatureGate = {

  _status: null,
  _initialized: false,

  // Définition locale des plans (miroir du backend)
  _planLevels: { free: 0, pro: 1, business: 2, enterprise: 3 },

  _features: {
    free:       { maxNotes: 50, maxTasks: 100, maxProjects: 3, maxTeamMembers: 1, maxAiPromptsPerDay: 5, aiAssistant: true, graph3D: false, advancedAnalytics: false, apiAccess: false, prioritySupport: false, customBranding: false, ssoSaml: false },
    pro:        { maxNotes: 500, maxTasks: -1, maxProjects: 20, maxTeamMembers: 5, maxAiPromptsPerDay: 50, aiAssistant: true, graph3D: true, advancedAnalytics: true, apiAccess: false, prioritySupport: false, customBranding: false, ssoSaml: false },
    business:   { maxNotes: -1, maxTasks: -1, maxProjects: -1, maxTeamMembers: 10, maxAiPromptsPerDay: 200, aiAssistant: true, graph3D: true, advancedAnalytics: true, apiAccess: true, prioritySupport: true, customBranding: false, ssoSaml: false },
    enterprise: { maxNotes: -1, maxTasks: -1, maxProjects: -1, maxTeamMembers: -1, maxAiPromptsPerDay: -1, aiAssistant: true, graph3D: true, advancedAnalytics: true, apiAccess: true, prioritySupport: true, customBranding: true, ssoSaml: true }
  },

  _planNames: { free: 'Free', pro: 'Pro', business: 'Business', enterprise: 'Enterprise' },

  async init() {
    if (this._initialized) return;
    try {
      this._status = await BillingApi.getStatus();
      this._initialized = true;
    } catch {
      // fallback silencieux
      this._status = { plan: 'free' };
    }
  },

  /** Plan actuel (sync, utilise le cache) */
  getCurrentPlan() {
    return this._status?.plan || 'free';
  },

  /** Vérifie si la feature est disponible pour le plan actuel */
  hasFeature(featureKey) {
    const plan = this.getCurrentPlan();
    const features = this._features[plan] || this._features.free;
    return !!features[featureKey];
  },

  /** Vérifie si l'usage est sous la limite */
  checkLimit(limitKey, currentUsage) {
    const plan = this.getCurrentPlan();
    const features = this._features[plan] || this._features.free;
    const limit = features[limitKey];
    if (limit === undefined || limit === -1) return { allowed: true, remaining: Infinity, limit: -1 };
    return { allowed: currentUsage < limit, remaining: Math.max(0, limit - currentUsage), limit };
  },

  /**
   * Affiche une modale de blocage si la feature n'est pas disponible
   * @returns {boolean} true si accessible, false si bloqué
   */
  requireFeature(featureKey, options = {}) {
    if (this.hasFeature(featureKey)) return true;
    const requiredPlan = this._getMinimumPlan(featureKey);
    this._showUpgradeModal({
      feature: options.label || featureKey,
      currentPlan: this.getCurrentPlan(),
      requiredPlan,
      description: options.description || `Cette fonctionnalité nécessite le plan ${this._planNames[requiredPlan] || requiredPlan}.`
    });
    return false;
  },

  /** Rend un élément visible ou masqué selon la feature */
  gateElement(element, featureKey) {
    if (!element) return;
    const allowed = this.hasFeature(featureKey);
    element.style.display = allowed ? '' : 'none';
    if (!allowed) {
      const plan = this._getMinimumPlan(featureKey);
      element.setAttribute('data-gated', plan);
    }
  },

  /** Ajoute un badge "PRO" ou "BUSINESS" sur les éléments gated */
  addPlanBadges(container = document) {
    container.querySelectorAll('[data-requires-plan]').forEach(el => {
      const requiredPlan = el.dataset.requiresPlan;
      const currentLevel = this._planLevels[this.getCurrentPlan()] || 0;
      const requiredLevel = this._planLevels[requiredPlan] || 0;
      if (currentLevel < requiredLevel) {
        if (!el.querySelector('.plan-required-badge')) {
          const badge = document.createElement('span');
          badge.className = `plan-required-badge plan-badge-${requiredPlan}`;
          badge.textContent = (this._planNames[requiredPlan] || requiredPlan).toUpperCase();
          el.appendChild(badge);
          el.classList.add('feature-locked');
          el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.requireFeature(requiredPlan, { label: el.dataset.featureLabel || requiredPlan });
          }, { capture: true });
        }
      }
    });
  },

  _getMinimumPlan(featureKey) {
    for (const plan of ['free', 'pro', 'business', 'enterprise']) {
      if (this._features[plan]?.[featureKey]) return plan;
    }
    return 'enterprise';
  },

  _showUpgradeModal({ feature, currentPlan, requiredPlan, description }) {
    // Fermer modal existante si présente
    document.getElementById('feature-gate-modal')?.remove();

    const planName = this._planNames[requiredPlan] || requiredPlan;
    const modal = document.createElement('div');
    modal.id = 'feature-gate-modal';
    modal.className = 'feature-gate-overlay';
    modal.innerHTML = `
      <div class="feature-gate-modal">
        <button class="feature-gate-close" aria-label="Fermer">✕</button>
        <div class="feature-gate-icon">🔒</div>
        <h2 class="feature-gate-title">Fonctionnalité Premium</h2>
        <p class="feature-gate-description">${description}</p>
        <div class="feature-gate-plans">
          <div class="gate-current-plan">
            <span class="gate-plan-label">Plan actuel</span>
            <span class="plan-badge plan-${currentPlan}">${this._planNames[currentPlan] || currentPlan}</span>
          </div>
          <div class="gate-arrow">→</div>
          <div class="gate-required-plan">
            <span class="gate-plan-label">Plan requis</span>
            <span class="plan-badge plan-${requiredPlan} required">${planName}</span>
          </div>
        </div>
        <div class="feature-gate-actions">
          <button class="btn-upgrade-now" data-plan="${requiredPlan}">
            Passer au plan ${planName}
          </button>
          <button class="btn-see-plans">Voir tous les plans</button>
          <button class="btn-gate-cancel">Plus tard</button>
        </div>
      </div>`;

    document.body.appendChild(modal);

    modal.querySelector('.feature-gate-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.btn-gate-cancel').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelector('.btn-upgrade-now').addEventListener('click', async () => {
      modal.remove();
      await BillingApi.redirectToCheckout(requiredPlan, 'month');
    });

    modal.querySelector('.btn-see-plans').addEventListener('click', () => {
      modal.remove();
      if (typeof Sidebar !== 'undefined' && Sidebar.navigate) {
        Sidebar.navigate('billing');
      } else if (typeof ViewRouter !== 'undefined') {
        ViewRouter.navigate('billing');
      }
    });
  }
};

window.FeatureGate = FeatureGate;
