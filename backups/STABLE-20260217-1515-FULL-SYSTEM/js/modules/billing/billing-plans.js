/**
 * Billing Plans View - Page de pricing/abonnement
 * Affiche les plans Free/Pro/Business/Enterprise
 */

const BillingPlansView = {

  _plans: null,
  _currentPlan: 'free',
  _interval: 'month',
  _stripeEnabled: false,

  async init(containerId = 'view-billing') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = this._renderSkeleton();

    try {
      const [plansData, statusData, stripeData] = await Promise.all([
        BillingApi.getPlans(),
        BillingApi.getStatus().catch(() => ({ plan: 'free' })),
        BillingApi.getStripeStatus().catch(() => ({ enabled: false }))
      ]);

      this._plans = plansData.plans;
      this._currentPlan = statusData.plan || 'free';
      this._stripeEnabled = stripeData.enabled;

      container.innerHTML = this._renderFull(statusData);
      this._attachEvents(container);
    } catch (err) {
      console.error('[BillingPlansView] init error:', err);
      container.innerHTML = `<div class="billing-error">Erreur lors du chargement des plans. <button onclick="BillingPlansView.init()">Réessayer</button></div>`;
    }
  },

  _renderSkeleton() {
    return `
      <div class="billing-container">
        <div class="billing-header">
          <div class="skeleton" style="height:40px;width:300px;margin:0 auto 12px"></div>
          <div class="skeleton" style="height:20px;width:400px;margin:0 auto"></div>
        </div>
        <div class="billing-plans-grid">
          ${[1,2,3,4].map(() => `<div class="billing-plan-card skeleton" style="height:480px"></div>`).join('')}
        </div>
      </div>`;
  },

  _renderFull(statusData) {
    const yearlyDiscount = 20;
    return `
      <div class="billing-container">
        <div class="billing-header">
          <h1 class="billing-title">Choisissez votre plan</h1>
          <p class="billing-subtitle">Passez à un plan supérieur pour débloquer toutes les fonctionnalités de Giri App</p>

          ${statusData.plan !== 'free' ? this._renderCurrentPlanBanner(statusData) : ''}

          <div class="billing-interval-toggle">
            <button class="interval-btn ${this._interval === 'month' ? 'active' : ''}" data-interval="month">Mensuel</button>
            <button class="interval-btn ${this._interval === 'year' ? 'active' : ''}" data-interval="year">
              Annuel <span class="discount-badge">-${yearlyDiscount}%</span>
            </button>
          </div>
        </div>

        <div class="billing-plans-grid">
          ${(this._plans || []).map(plan => this._renderPlanCard(plan)).join('')}
        </div>

        ${!this._stripeEnabled ? `
          <div class="billing-stripe-notice">
            <span class="notice-icon">⚠️</span>
            Paiement Stripe non configuré — contactez <a href="mailto:contact@mahagiri.fr">contact@mahagiri.fr</a> pour mettre à niveau votre plan.
          </div>
        ` : ''}

        <div class="billing-faq">
          <h2>Questions fréquentes</h2>
          <div class="faq-grid">
            <div class="faq-item">
              <h3>Puis-je changer de plan ?</h3>
              <p>Oui, vous pouvez upgrader ou downgrader à tout moment. Les changements prennent effet immédiatement.</p>
            </div>
            <div class="faq-item">
              <h3>Y a-t-il un engagement ?</h3>
              <p>Aucun engagement. Annulez à tout moment depuis votre espace client Stripe.</p>
            </div>
            <div class="faq-item">
              <h3>Quels modes de paiement ?</h3>
              <p>Carte bancaire (Visa, Mastercard, American Express). Paiement sécurisé par Stripe.</p>
            </div>
            <div class="faq-item">
              <h3>Plan Enterprise ?</h3>
              <p>Contactez-nous à <a href="mailto:contact@mahagiri.fr">contact@mahagiri.fr</a> pour un devis personnalisé.</p>
            </div>
          </div>
        </div>
      </div>`;
  },

  _renderCurrentPlanBanner(statusData) {
    const expiry = statusData.currentPeriodEnd
      ? new Date(statusData.currentPeriodEnd).toLocaleDateString('fr-FR')
      : null;
    return `
      <div class="billing-current-banner">
        <span class="current-plan-label">Plan actuel :</span>
        <span class="current-plan-name plan-badge plan-${statusData.plan}">${statusData.planName || statusData.plan}</span>
        ${expiry ? `<span class="current-plan-expiry">Renouvellement le ${expiry}</span>` : ''}
        ${statusData.cancelAtPeriodEnd ? `<span class="cancel-warning">⚠️ Annulation en cours</span>` : ''}
        <button class="btn-manage-billing" data-action="portal">Gérer mon abonnement</button>
      </div>`;
  },

  _renderPlanCard(plan) {
    const isCurrent = plan.id === this._currentPlan;
    const isPopular = plan.popular;
    const price = this._interval === 'year' ? plan.yearlyPrice : plan.price;
    const monthlyEquiv = this._interval === 'year' && plan.yearlyPrice
      ? (plan.yearlyPrice / 12).toFixed(2)
      : null;
    const hasStripe = plan.hasStripePayment && this._stripeEnabled;
    const canUpgrade = !isCurrent && plan.id !== 'free';

    return `
      <div class="billing-plan-card ${isCurrent ? 'current' : ''} ${isPopular ? 'popular' : ''} plan-${plan.id}">
        ${isPopular ? `<div class="popular-badge">⭐ Plus populaire</div>` : ''}
        ${isCurrent ? `<div class="current-plan-badge">Plan actuel</div>` : ''}

        <div class="plan-header">
          <div class="plan-name">${plan.name}</div>
          <div class="plan-description">${plan.description}</div>
          <div class="plan-price">
            ${price === 0
              ? `<span class="price-amount">Gratuit</span>`
              : price === null
                ? `<span class="price-custom">Sur devis</span>`
                : `<span class="price-amount">${price}€</span><span class="price-interval">/${this._interval === 'year' ? 'an' : 'mois'}</span>`
            }
            ${monthlyEquiv ? `<div class="price-monthly-equiv">soit ${monthlyEquiv}€/mois</div>` : ''}
          </div>
        </div>

        <div class="plan-highlights">
          ${(plan.highlights || []).map(h => `<div class="plan-highlight">✓ ${h}</div>`).join('')}
        </div>

        <div class="plan-features">
          ${this._renderFeaturesList(plan.features)}
        </div>

        <div class="plan-cta">
          ${this._renderPlanButton(plan, isCurrent, hasStripe, canUpgrade)}
        </div>
      </div>`;
  },

  _renderFeaturesList(features) {
    if (!features) return '';
    const items = [
      { key: 'maxNotes', label: 'Notes', format: v => v === -1 ? 'Illimité' : `${v} notes` },
      { key: 'maxTasks', label: 'Tâches', format: v => v === -1 ? 'Illimité' : `${v} tâches` },
      { key: 'maxProjects', label: 'Projets', format: v => v === -1 ? 'Illimité' : `${v} projets` },
      { key: 'maxAiPromptsPerDay', label: 'IA / jour', format: v => v === -1 ? 'Illimité' : `${v} prompts` },
      { key: 'maxTeamMembers', label: 'Membres équipe', format: v => v === -1 ? 'Illimité' : `${v} membres` },
      { key: 'aiAssistant', label: 'Assistant IA', boolean: true },
      { key: 'graph3D', label: 'Graph 3D', boolean: true },
      { key: 'advancedAnalytics', label: 'Analytics avancées', boolean: true },
      { key: 'apiAccess', label: 'Accès API', boolean: true },
      { key: 'prioritySupport', label: 'Support prioritaire', boolean: true },
      { key: 'customBranding', label: 'Branding custom', boolean: true },
      { key: 'ssoSaml', label: 'SSO / SAML', boolean: true },
    ];

    return items.map(item => {
      const val = features[item.key];
      if (val === undefined || val === null) return '';
      if (item.boolean) {
        return `<div class="feature-row ${val ? 'enabled' : 'disabled'}">
          <span class="feature-icon">${val ? '✓' : '✗'}</span>
          <span class="feature-label">${item.label}</span>
        </div>`;
      }
      return `<div class="feature-row enabled">
        <span class="feature-icon">✓</span>
        <span class="feature-label">${item.label} : <strong>${item.format(val)}</strong></span>
      </div>`;
    }).filter(Boolean).join('');
  },

  _renderPlanButton(plan, isCurrent, hasStripe, canUpgrade) {
    if (isCurrent) {
      return `<button class="btn-plan current" disabled>Plan actuel</button>`;
    }
    if (plan.id === 'free') {
      return `<button class="btn-plan downgrade" data-action="downgrade">Passer au gratuit</button>`;
    }
    if (plan.id === 'enterprise') {
      return `<a href="mailto:contact@mahagiri.fr?subject=Plan Enterprise - Giri App" class="btn-plan enterprise">Contacter les ventes</a>`;
    }
    if (!hasStripe) {
      return `<button class="btn-plan disabled" disabled>Bientôt disponible</button>`;
    }
    return `<button class="btn-plan upgrade" data-action="checkout" data-plan="${plan.id}">
      ${canUpgrade ? 'Passer à ce plan' : 'S\'abonner'}
    </button>`;
  },

  _attachEvents(container) {
    // Interval toggle
    container.querySelectorAll('.interval-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._interval = btn.dataset.interval;
        container.querySelectorAll('.interval-btn').forEach(b => b.classList.toggle('active', b.dataset.interval === this._interval));
        // Re-render just the price cards
        const grid = container.querySelector('.billing-plans-grid');
        if (grid) grid.innerHTML = (this._plans || []).map(p => this._renderPlanCard(p)).join('');
        this._attachCardEvents(container);
      });
    });

    this._attachCardEvents(container);
  },

  _attachCardEvents(container) {
    container.querySelectorAll('[data-action="checkout"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const planId = btn.dataset.plan;
        await BillingApi.redirectToCheckout(planId, this._interval);
      });
    });

    container.querySelectorAll('[data-action="portal"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await BillingApi.redirectToPortal();
      });
    });

    container.querySelectorAll('[data-action="downgrade"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Passer au plan gratuit ? Vos fonctionnalités premium seront désactivées à la fin de la période en cours.')) {
          await BillingApi.redirectToPortal();
        }
      });
    });
  }
};

window.BillingPlansView = BillingPlansView;
