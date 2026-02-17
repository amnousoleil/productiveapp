/**
 * CACHE MANAGER v1.0
 * Système anti-cache intelligent pour garantir la fraîcheur des vues critiques
 * Résout les problèmes de cache SW qui causent des affichages obsolètes
 */

const CacheManager = {
  // Version de l'app pour détection de mismatch
  APP_VERSION: 'v4.0.36',

  // Vues critiques qui nécessitent toujours du contenu frais
  CRITICAL_VIEWS: ['giriVision', 'mail', 'calendar', 'admin', 'configDev'],

  // Cache des checksums pour détection de changements
  checksums: new Map(),

  // Flag pour éviter les boucles infinies
  reloadInProgress: false,

  /**
   * Initialise le système de cache management
   */
  init() {
    console.log('🔄 CacheManager v1.0 initialized');

    // Écoute les erreurs de chargement de ressources
    window.addEventListener('error', (e) => {
      if (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK') {
        console.warn('⚠️ Resource load error:', e.target.src || e.target.href);
        this.handleResourceError(e.target);
      }
    }, true);

    // Détection de version mismatch au démarrage
    this.checkVersionMismatch();
  },

  /**
   * Vérifie si une vue critique nécessite un refresh forcé
   */
  shouldForceRefresh(viewName) {
    return this.CRITICAL_VIEWS.includes(viewName);
  },

  /**
   * Force le rechargement propre d'une vue critique
   * Utilisé avant de rendre une vue pour garantir du contenu frais
   */
  async prepareView(viewName) {
    if (!this.shouldForceRefresh(viewName)) {
      return; // Vues non-critiques : pas de traitement spécial
    }

    console.log(`🔄 CacheManager: Preparing critical view "${viewName}"`);

    // Pour les vues critiques, on force un fetch network-only des ressources clés
    const criticalResources = this.getCriticalResourcesForView(viewName);

    try {
      await Promise.all(
        criticalResources.map(url => this.fetchFresh(url))
      );
      console.log(`✅ CacheManager: View "${viewName}" resources refreshed`);
    } catch (error) {
      console.error(`❌ CacheManager: Failed to refresh view "${viewName}"`, error);
      // En cas d'erreur, on tente un hard refresh si pas déjà en cours
      if (!this.reloadInProgress) {
        this.forceHardRefresh(`Resource fetch failed for ${viewName}`);
      }
    }
  },

  /**
   * Retourne les ressources critiques pour une vue donnée
   */
  getCriticalResourcesForView(viewName) {
    const baseUrl = window.location.origin;
    const resources = [];

    // Mapping des vues vers leurs fichiers critiques
    const viewResources = {
      giriVision: [
        `${baseUrl}/js/modules/vision/vision-main.js?v=100`,
        `${baseUrl}/css/giri-vision.css?v=100`
      ],
      mail: [
        `${baseUrl}/js/modules/mail/mail-composer-v7.js?v=2700`,
        `${baseUrl}/js/modules/mail/mail-view.js?v=2700`,
        `${baseUrl}/css/mail-premium-v7.css?v=2700`
      ],
      calendar: [
        `${baseUrl}/js/modules/calendar/calendar-view-v7.js?v=2700`,
        `${baseUrl}/css/calendar-v7.css?v=2700`
      ],
      admin: [
        `${baseUrl}/js/modules/admin/admin-view.js?v=200`,
        `${baseUrl}/css/admin.css?v=200`
      ],
      configDev: [
        `${baseUrl}/js/modules/config-dev/config-dev-view.js?v=100`,
        `${baseUrl}/css/config-dev.css?v=100`
      ]
    };

    return viewResources[viewName] || [];
  },

  /**
   * Fetch une ressource en mode network-only (bypass cache SW)
   */
  async fetchFresh(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store', // Force network-only
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      // Calculer checksum du contenu pour détection de changements
      const content = await response.text();
      const checksum = this.simpleHash(content);

      // Comparer avec ancien checksum si existant
      const oldChecksum = this.checksums.get(url);
      if (oldChecksum && oldChecksum !== checksum) {
        console.log(`🔄 CacheManager: Content changed for ${url}`);
      }

      this.checksums.set(url, checksum);
      return response;
    } catch (error) {
      console.error(`❌ CacheManager: fetchFresh failed for ${url}`, error);
      throw error;
    }
  },

  /**
   * Hash simple pour détection de changements de contenu
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  },

  /**
   * Gère les erreurs de chargement de ressources
   */
  handleResourceError(element) {
    const url = element.src || element.href;
    console.error('⚠️ Failed to load resource:', url);

    // Si erreur critique et pas déjà en reload, force un hard refresh
    if (!this.reloadInProgress && this.isCriticalResource(url)) {
      this.forceHardRefresh('Critical resource load failure');
    }
  },

  /**
   * Vérifie si une ressource est critique
   */
  isCriticalResource(url) {
    const criticalPatterns = [
      '/router.js',
      '/app-modular.js',
      '/config.js',
      '/vision-main.js',
      '/mail-composer-v7.js',
      '/calendar-view-v7.js'
    ];

    return criticalPatterns.some(pattern => url.includes(pattern));
  },

  /**
   * Vérifie les mismatch de version au démarrage
   */
  checkVersionMismatch() {
    const storedVersion = localStorage.getItem('productiveapp_version');

    if (storedVersion && storedVersion !== this.APP_VERSION) {
      console.log(`🔄 Version mismatch detected: ${storedVersion} → ${this.APP_VERSION}`);
      // Mise à jour de version : clear storage et refresh
      this.handleVersionUpdate(storedVersion, this.APP_VERSION);
    }

    localStorage.setItem('productiveapp_version', this.APP_VERSION);
  },

  /**
   * Gère les mises à jour de version
   */
  async handleVersionUpdate(oldVersion, newVersion) {
    console.log(`📦 Updating app: ${oldVersion} → ${newVersion}`);

    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`🗑️ Clearing cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }

    // Unregister service worker pour force reinstall
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(reg => {
          console.log('🗑️ Unregistering SW');
          return reg.unregister();
        })
      );
    }

    // Force reload après cleanup
    console.log('🔄 Reloading with clean cache...');
    window.location.reload(true);
  },

  /**
   * Force un hard refresh en dernier recours
   */
  forceHardRefresh(reason) {
    if (this.reloadInProgress) {
      console.log('⏳ Hard refresh already in progress');
      return;
    }

    this.reloadInProgress = true;
    console.warn(`🔄 Forcing hard refresh: ${reason}`);

    // Toast notification pour l'utilisateur
    if (typeof Toast !== 'undefined') {
      Toast.info('Actualisation en cours...', { duration: 2000 });
    }

    // Delay court pour que le toast s'affiche
    setTimeout(() => {
      window.location.reload(true);
    }, 500);
  },

  /**
   * Nettoie manuellement le cache (pour debug ou admin)
   */
  async clearAllCaches() {
    console.log('🗑️ Clearing all caches manually...');

    // Clear SW caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log(`✅ Cleared ${cacheNames.length} caches`);
    }

    // Clear localStorage (sauf auth token et user prefs)
    const keysToKeep = ['productiveapp_token', 'productiveapp_user', 'productiveapp_theme'];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    console.log('✅ CacheManager: All caches cleared');

    if (typeof Toast !== 'undefined') {
      Toast.success('Cache vidé avec succès');
    }
  },

  /**
   * Debug info pour le développeur
   */
  getDebugInfo() {
    return {
      appVersion: this.APP_VERSION,
      criticalViews: this.CRITICAL_VIEWS,
      checksumCount: this.checksums.size,
      reloadInProgress: this.reloadInProgress,
      storedVersion: localStorage.getItem('productiveapp_version')
    };
  }
};

// Export global
window.CacheManager = CacheManager;
