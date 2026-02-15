/**
 * ================================================
 * PRELOADER - ProductiveApp v1.0
 * Précharge les vues populaires en arrière-plan
 * ================================================
 */

const Preloader = (function() {
  'use strict';

  // Vues à précharger (ordre de priorité)
  const PRIORITY_VIEWS = [
    'tasks',      // Vue la plus utilisée
    'projects',   // 2ème plus utilisée
    'notes',      // 3ème plus utilisée
    'settings',   // Settings souvent consultés
    'calendar'    // Calendrier fréquent
  ];

  let isPreloading = false;
  let preloadedViews = new Set();

  /**
   * Démarrer le préchargement en arrière-plan
   */
  function start() {
    if (isPreloading) return;

    console.log('🚀 Preloader: Starting background preload...');
    isPreloading = true;

    // Attendre 3 secondes après le chargement initial
    // pour ne pas ralentir l'app au démarrage
    setTimeout(() => {
      preloadNextView(0);
    }, 3000);
  }

  /**
   * Précharger la prochaine vue de la liste
   */
  function preloadNextView(index) {
    if (index >= PRIORITY_VIEWS.length) {
      console.log('✅ Preloader: All priority views preloaded');
      isPreloading = false;
      return;
    }

    const viewId = PRIORITY_VIEWS[index];

    // Skip si déjà préchargée
    if (preloadedViews.has(viewId)) {
      preloadNextView(index + 1);
      return;
    }

    console.log(`🔮 Preloader: Loading ${viewId}...`);

    if (typeof LazyLoader !== 'undefined') {
      LazyLoader.preloadViewModules(viewId);
      preloadedViews.add(viewId);
    }

    // Précharger la suivante après 2 secondes
    setTimeout(() => {
      preloadNextView(index + 1);
    }, 2000);
  }

  /**
   * Précharger une vue spécifique (priorité haute)
   */
  function preloadView(viewId) {
    if (preloadedViews.has(viewId)) {
      console.log(`ℹ️ Preloader: ${viewId} already preloaded`);
      return;
    }

    console.log(`🔮 Preloader: Priority load ${viewId}`);

    if (typeof LazyLoader !== 'undefined') {
      LazyLoader.preloadViewModules(viewId);
      preloadedViews.add(viewId);
    }
  }

  /**
   * Démarrer automatiquement quand l'utilisateur est authentifié
   */
  function autoStart() {
    // Écouter l'événement de connexion réussie
    document.addEventListener('userLoggedIn', () => {
      console.log('🔐 Preloader: User logged in, starting preload...');
      start();
    });

    // Si l'utilisateur est déjà connecté (rechargement de page)
    if (typeof AppState !== 'undefined' && AppState.isAuthenticated) {
      start();
    }
  }

  // Démarrer automatiquement
  setTimeout(autoStart, 1000);

  // Public API
  return {
    start,
    preloadView
  };
})();

window.Preloader = Preloader;
