/**
 * Billing API - Appels vers le backend Stripe
 * Gère checkout, portal, status, plans
 */

const BillingApi = {

  _baseUrl: '/api/v1/billing',

  _headers() {
    const token = localStorage.getItem('productive_token') || sessionStorage.getItem('productive_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  async _request(method, path, body = null) {
    const res = await fetch(this._baseUrl + path, {
      method,
      headers: this._headers(),
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Billing API error'), { data, status: res.status });
    return data;
  },

  /** Récupère les plans disponibles (public) */
  async getPlans() {
    return this._request('GET', '/plans');
  },

  /** Statut Stripe configuré ou non (public) */
  async getStripeStatus() {
    return this._request('GET', '/stripe-status');
  },

  /** Statut abonnement de l'utilisateur connecté */
  async getStatus() {
    return this._request('GET', '/status');
  },

  /**
   * Créer une session Checkout Stripe
   * @param {string} planId - 'pro' | 'business'
   * @param {string} interval - 'month' | 'year'
   * @returns {{ url: string }} URL de redirection Stripe
   */
  async checkout(planId, interval = 'month') {
    return this._request('POST', '/checkout', { planId, interval });
  },

  /**
   * Créer une session Customer Portal Stripe
   * @returns {{ url: string }} URL du portail client
   */
  async portal() {
    return this._request('POST', '/portal');
  },

  /**
   * Redirige vers Stripe Checkout
   * Gère les erreurs avec Toast si disponible
   */
  async redirectToCheckout(planId, interval = 'month') {
    try {
      if (typeof Toast !== 'undefined') Toast.info('Redirection vers Stripe...');
      const { url } = await this.checkout(planId, interval);
      window.location.href = url;
    } catch (err) {
      console.error('[BillingApi] Checkout error:', err);
      const msg = err.data?.code === 'STRIPE_NOT_CONFIGURED'
        ? 'Stripe non configuré. Contactez l\'administrateur.'
        : err.message || 'Erreur lors du checkout';
      if (typeof Toast !== 'undefined') Toast.error(msg);
      else alert(msg);
    }
  },

  /**
   * Redirige vers le Customer Portal Stripe
   */
  async redirectToPortal() {
    try {
      if (typeof Toast !== 'undefined') Toast.info('Ouverture du portail...');
      const { url } = await this.portal();
      window.location.href = url;
    } catch (err) {
      console.error('[BillingApi] Portal error:', err);
      const msg = err.message || 'Erreur lors de l\'accès au portail';
      if (typeof Toast !== 'undefined') Toast.error(msg);
      else alert(msg);
    }
  }
};

window.BillingApi = BillingApi;
