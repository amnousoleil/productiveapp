/**
 * ================================================
 * LAZY LOADER - ProductiveApp v1.0
 * Charge les modules uniquement quand nécessaire
 * ================================================
 */

const LazyLoader = (function() {
  'use strict';

  // Modules déjà chargés
  const loadedModules = new Set();

  // Modules en cours de chargement (pour éviter les doublons)
  const loadingPromises = new Map();

  // Mapping: viewId → scripts requis
  const VIEW_MODULES = {
    dashboard: [
      'js/modules/dashboard/dashboard.js',
      'js/modules/dashboard/dash-insights.js',
      'js/modules/dashboard/dash-charts.js'
      // Removed: dash-quick-actions, dash-activity, dash-widgets (404 - files don't exist)
    ],

    tasks: [
      'js/modules/tasks/tasks.js'
      // Removed: kanban.js (404 - file doesn't exist)
    ],

    projects: [
      'js/modules/projects/projects.js',
      'js/modules/projects/projects-view.js'
    ],

    notes: [
      'js/modules/notes/notes.js',
      'js/modules/notes/api-notes.js'
    ],

    galaxy: [
      'js/lib/three/three.min.js',
      'js/lib/three/EffectComposer.js',
      'js/lib/three/RenderPass.js',
      'js/lib/three/ShaderPass.js',
      'js/lib/three/UnrealBloomPass.js',
      'js/lib/three/CopyShader.js',
      'js/lib/three/LuminosityHighPassShader.js',
      'js/modules/canvases/galaxy-3d.js',
      'js/modules/canvases/galaxy-ai.js',
      'js/modules/canvases/galaxie-view.js'
    ],

    journal: [
      'js/modules/journal/journal.js'
    ],

    settings: [
      'js/modules/settings/settings-view.js',
      'js/modules/settings/settings-render.js',
      'js/modules/settings/settings-actions.js',
      'js/modules/settings/settings-appearance.js',
      'js/modules/settings/settings-team.js'
    ],

    analytics: [
      'js/modules/analytics/analytics-view.js'
    ],

    reports: [
      'js/modules/reports/reports-view.js',
      'js/modules/reports/api-reports-ai.js',
      'js/modules/reports/ai-reports-view.js',
      'js/modules/reports/report.js',
      'js/modules/reports/report-creator.js'
    ],

    accounting: [
      'js/modules/accounting/accounting.js',
      'js/modules/accounting/acc-state.js',
      'js/modules/accounting/accounting-api.js',
      'js/modules/accounting/acc-styles.js',
      'js/modules/accounting/acc-dashboard.js',
      'js/modules/accounting/acc-scanner.js',
      'js/modules/accounting/acc-invoices.js',
      'js/modules/accounting/acc-documents.js',
      'js/modules/accounting/acc-expenses.js',
      'js/modules/accounting/acc-tva.js',
      'js/modules/accounting/acc-budgets.js',
      'js/modules/accounting/acc-bank.js',
      'js/modules/accounting/acc-contacts.js',
      'js/modules/accounting/acc-alerts.js',
      'js/modules/accounting/acc-recurring.js'
    ],

    psychoAudit: [
      'js/modules/audit/psycho-audit-view.js',
      'js/modules/audit/pa-state.js',
      'js/modules/audit/pa-render.js',
      'js/modules/audit/pa-events.js',
      'js/modules/audit/pa-evaluation.js',
      'js/modules/audit/pa-report.js',
      'js/modules/audit/pa-api.js',
      'js/modules/audit/pa-therapy-library.js',
      'js/modules/audit/pa-premium-ui.js',
      'js/modules/audit/pa-recommendations.js',
      'js/modules/audit/pa-sharing.js',
      'js/modules/audit/pa-history.js'
    ],

    teamMessaging: [
      'js/modules/messaging/messaging-api.js',
      'js/modules/messaging/messaging-ui.js',
      'js/modules/messaging/messaging-conversations.js',
      'js/modules/messaging/messaging-websocket.js',
      'js/modules/messaging/messaging-view.js'
    ],

    campaigns: [
      'js/modules/campaigns/campaigns.js'
    ],

    gamification: [
      'js/modules/gamification/gamification-api.js',
      'js/modules/gamification/gamification-view.js'
    ],

    behavioral: [
      'js/modules/behavioral/behavioral-view.js'
    ],

    teamVision: [
      'js/modules/team-vision/team-vision-view.js'
    ],

    giriVision: [
      'js/modules/giri-vision/giri-api.js',
      'js/modules/giri-vision/giri-vision-view.js'
    ],

    calendar: [
      'js/modules/calendar/calendar-view.js'
    ],

    mail: [
      'js/modules/mail/mail-view.js'
    ],

    admin: [
      'js/modules/admin/admin-api.js',
      'js/modules/admin/admin-view.js',
      'js/modules/admin/admin-health.js',
      'js/modules/admin/admin-metrics.js',
      'js/modules/admin/admin-logs.js',
      'js/modules/admin/admin-database.js',
      'js/modules/admin/admin-alerts.js',
      'js/modules/admin/admin-users.js',
      'js/modules/admin/admin-version.js',
      'js/modules/admin/admin-charts.js'
    ],

    configDev: [
      'js/modules/config-dev/config-dev-view.js',
      'js/modules/config-dev/config-dev-api.js',
      'js/modules/config-dev/config-dev-ui.js'
    ]
  };

  /**
   * Charger un script JavaScript de manière asynchrone
   */
  function loadScript(src) {
    // Si déjà chargé, retourner immédiatement
    if (loadedModules.has(src)) {
      return Promise.resolve();
    }

    // Si en cours de chargement, retourner la promesse existante
    if (loadingPromises.has(src)) {
      return loadingPromises.get(src);
    }

    // Créer une nouvelle promesse de chargement
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        loadedModules.add(src);
        loadingPromises.delete(src);
        console.log(`✅ Loaded: ${src}`);
        resolve();
      };

      script.onerror = () => {
        loadingPromises.delete(src);
        console.error(`❌ Failed to load: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });

    loadingPromises.set(src, promise);
    return promise;
  }

  /**
   * Charger tous les modules requis pour une vue
   */
  async function loadViewModules(viewId) {
    const modules = VIEW_MODULES[viewId];

    if (!modules || modules.length === 0) {
      console.log(`📦 No modules to load for view: ${viewId}`);
      return;
    }

    console.log(`📦 Loading ${modules.length} modules for view: ${viewId}`);

    try {
      // Charger tous les modules en parallèle
      await Promise.all(modules.map(src => loadScript(src)));
      console.log(`✅ All modules loaded for view: ${viewId}`);
    } catch (err) {
      console.error(`❌ Failed to load modules for view: ${viewId}`, err);
      throw err;
    }
  }

  /**
   * Précharger les modules d'une vue en arrière-plan (sans bloquer)
   */
  function preloadViewModules(viewId) {
    const modules = VIEW_MODULES[viewId];

    if (!modules || modules.length === 0) {
      return;
    }

    console.log(`🔮 Preloading ${modules.length} modules for view: ${viewId}`);

    // Charger en arrière-plan sans attendre
    modules.forEach(src => {
      if (!loadedModules.has(src)) {
        loadScript(src).catch(err => {
          console.warn(`⚠️ Preload failed: ${src}`, err);
        });
      }
    });
  }

  /**
   * Marquer un module comme déjà chargé (pour les scripts inline)
   */
  function markAsLoaded(src) {
    loadedModules.add(src);
  }

  /**
   * Obtenir le statut de chargement
   */
  function getLoadedModules() {
    return Array.from(loadedModules);
  }

  // Public API
  return {
    loadViewModules,
    preloadViewModules,
    loadScript,
    markAsLoaded,
    getLoadedModules
  };
})();

window.LazyLoader = LazyLoader;
