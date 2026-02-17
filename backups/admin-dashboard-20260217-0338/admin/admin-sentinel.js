/**
 * ADMIN SENTINEL v1.0 🛡️
 * @description Sentinelle de diagnostic automatique
 * Scanne tous les bugs potentiels et remonte les infos dans la section Admin
 *
 * Features:
 * - Détection erreurs JavaScript en temps réel
 * - Tests santé backend (tous endpoints)
 * - Analyse performance frontend
 * - Détection memory leaks
 * - Vérification intégrité fichiers critiques
 * - Tests API automatiques
 * - Détection conflits CSS/JS
 */

const AdminSentinel = {
  // État de la sentinelle
  state: {
    isRunning: false,
    lastScan: null,
    scanInterval: null,
    autoScanEnabled: false,
    errors: [],
    warnings: [],
    info: []
  },

  // Configuration
  config: {
    scanIntervalMs: 60000, // 1 minute
    maxErrorsStored: 100,
    criticalEndpoints: [
      '/health',
      '/stats',
      '/tasks',
      '/notes',
      '/projects'
    ]
  },

  // Résultats du dernier scan
  lastScanResults: {
    timestamp: null,
    jsErrors: [],
    backendHealth: null,
    performanceMetrics: null,
    memoryStats: null,
    criticalFiles: [],
    apiTests: [],
    cssConflicts: [],
    overallScore: 0,
    criticalIssues: 0,
    warnings: 0
  },

  /**
   * Démarrer la sentinelle
   */
  start() {
    if (this.state.isRunning) {
      console.warn('[Sentinel] Already running');
      return;
    }

    console.log('[Sentinel] 🛡️ Starting diagnostic sentinel...');
    this.state.isRunning = true;

    // Hook global pour capturer toutes les erreurs JS
    this.hookGlobalErrorHandlers();

    // Premier scan immédiat
    this.runFullScan();

    Toast.success('🛡️ Sentinelle activée - Diagnostic en cours');
  },

  /**
   * Arrêter la sentinelle
   */
  stop() {
    if (!this.state.isRunning) return;

    console.log('[Sentinel] 🛑 Stopping sentinel...');
    this.state.isRunning = false;

    if (this.state.scanInterval) {
      clearInterval(this.state.scanInterval);
      this.state.scanInterval = null;
    }

    this.state.autoScanEnabled = false;
    Toast.info('⏸️ Sentinelle mise en pause');
  },

  /**
   * Toggle auto-scan
   */
  toggleAutoScan() {
    this.state.autoScanEnabled = !this.state.autoScanEnabled;

    if (this.state.autoScanEnabled) {
      // Démarrer scan automatique toutes les 1 minute
      this.state.scanInterval = setInterval(() => {
        this.runFullScan(true); // Silent mode
      }, this.config.scanIntervalMs);

      Toast.success('🔄 Auto-scan activé (1 min)');
    } else {
      if (this.state.scanInterval) {
        clearInterval(this.state.scanInterval);
        this.state.scanInterval = null;
      }
      Toast.info('⏸️ Auto-scan désactivé');
    }
  },

  /**
   * Scanner complet du système
   */
  async runFullScan(silent = false) {
    if (!silent) Toast.info('🔍 Scan complet en cours...');

    const startTime = Date.now();
    this.state.lastScan = new Date();

    try {
      // Paralléliser tous les tests
      const [
        jsErrorsCheck,
        backendCheck,
        performanceCheck,
        memoryCheck,
        filesCheck,
        apiTestsCheck,
        cssCheck
      ] = await Promise.allSettled([
        this.checkJavaScriptErrors(),
        this.checkBackendHealth(),
        this.checkPerformance(),
        this.checkMemoryUsage(),
        this.checkCriticalFiles(),
        this.runAPITests(),
        this.checkCSSConflicts()
      ]);

      // Compiler les résultats
      this.lastScanResults = {
        timestamp: new Date(),
        jsErrors: jsErrorsCheck.value || [],
        backendHealth: backendCheck.value || null,
        performanceMetrics: performanceCheck.value || null,
        memoryStats: memoryCheck.value || null,
        criticalFiles: filesCheck.value || [],
        apiTests: apiTestsCheck.value || [],
        cssConflicts: cssCheck.value || [],
        overallScore: 0,
        criticalIssues: 0,
        warnings: 0,
        scanDuration: Date.now() - startTime
      };

      // Calculer le score global et compter les issues
      this.calculateOverallScore();

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (!silent) {
        const emoji = this.lastScanResults.criticalIssues === 0 ? '✅' : '⚠️';
        Toast.success(`${emoji} Scan terminé en ${duration}s - Score: ${this.lastScanResults.overallScore}/100`);
      }

      console.log('[Sentinel] Scan results:', this.lastScanResults);

      // Émettre event pour mise à jour UI
      document.dispatchEvent(new CustomEvent('sentinel-scan-complete', {
        detail: this.lastScanResults
      }));

    } catch (error) {
      console.error('[Sentinel] Scan failed:', error);
      if (!silent) Toast.error('❌ Erreur lors du scan');
    }
  },

  /**
   * Hook pour capturer toutes les erreurs JavaScript
   */
  hookGlobalErrorHandlers() {
    // Déjà hookée par admin-errors.js, mais on ajoute un listener
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'js_error',
        severity: 'error',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: new Date()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'promise_rejection',
        severity: 'error',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: new Date()
      });
    });

    console.log('[Sentinel] Global error handlers hooked');
  },

  /**
   * Logger une erreur détectée
   */
  logError(error) {
    this.state.errors.push(error);

    // Limiter le nombre d'erreurs stockées
    if (this.state.errors.length > this.config.maxErrorsStored) {
      this.state.errors.shift();
    }

    // Émettre event pour alerte temps réel
    document.dispatchEvent(new CustomEvent('sentinel-error-detected', {
      detail: error
    }));
  },

  /**
   * CHECK 1: Erreurs JavaScript récentes
   */
  async checkJavaScriptErrors() {
    try {
      // Récupérer les erreurs frontend via AdminAPI
      const response = await AdminAPI.getFrontendErrors({
        limit: 20,
        resolved: false
      });

      const errors = response.errors || [];

      return {
        status: errors.length === 0 ? 'healthy' : errors.length < 5 ? 'warning' : 'critical',
        count: errors.length,
        recent: errors.slice(0, 5),
        message: errors.length === 0
          ? 'Aucune erreur JavaScript détectée'
          : `${errors.length} erreur(s) non résolue(s)`
      };
    } catch (error) {
      console.error('[Sentinel] JS errors check failed:', error);
      return {
        status: 'error',
        message: 'Impossible de vérifier les erreurs JS',
        error: error.message
      };
    }
  },

  /**
   * CHECK 2: Santé du backend
   */
  async checkBackendHealth() {
    try {
      const health = await AdminAPI.getHealth();

      return {
        status: health.status || 'unknown',
        database: health.database?.status === 'connected',
        uptime: health.uptime || 0,
        responseTime: health.database?.responseTime || 0,
        message: health.status === 'healthy'
          ? 'Backend opérationnel'
          : 'Backend dégradé'
      };
    } catch (error) {
      console.error('[Sentinel] Backend health check failed:', error);
      return {
        status: 'critical',
        message: 'Backend inaccessible',
        error: error.message
      };
    }
  },

  /**
   * CHECK 3: Performance frontend
   */
  async checkPerformance() {
    const perf = window.performance;

    if (!perf || !perf.timing) {
      return {
        status: 'unknown',
        message: 'Performance API non disponible'
      };
    }

    const timing = perf.timing;
    const navigation = perf.getEntriesByType('navigation')[0];

    const metrics = {
      // Page load metrics
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,

      // Network metrics
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart, // Time to first byte

      // Resource metrics
      resources: perf.getEntriesByType('resource').length,

      // Memory (si disponible)
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      } : null
    };

    // Détecter les scripts lents (>500ms)
    const slowScripts = perf.getEntriesByType('resource')
      .filter(r => r.initiatorType === 'script' && r.duration > 500)
      .map(r => ({
        name: r.name.split('/').pop(),
        duration: Math.round(r.duration)
      }));

    const status = metrics.pageLoadTime < 3000 ? 'healthy'
      : metrics.pageLoadTime < 5000 ? 'warning'
      : 'critical';

    return {
      status,
      metrics,
      slowScripts,
      message: `Page load: ${Math.round(metrics.pageLoadTime)}ms`
    };
  },

  /**
   * CHECK 4: Utilisation mémoire
   */
  async checkMemoryUsage() {
    if (!performance.memory) {
      return {
        status: 'unknown',
        message: 'Memory API non disponible (Chrome uniquement)'
      };
    }

    const mem = performance.memory;
    const usedMB = Math.round(mem.usedJSHeapSize / 1048576);
    const limitMB = Math.round(mem.jsHeapSizeLimit / 1048576);
    const percentUsed = ((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100).toFixed(1);

    const status = percentUsed < 60 ? 'healthy'
      : percentUsed < 80 ? 'warning'
      : 'critical';

    return {
      status,
      usedMB,
      limitMB,
      percentUsed: parseFloat(percentUsed),
      message: `${usedMB}MB utilisés (${percentUsed}%)`,
      warning: percentUsed > 80 ? 'Memory leak possible' : null
    };
  },

  /**
   * CHECK 5: Fichiers critiques
   */
  async checkCriticalFiles() {
    const criticalFiles = [
      { path: '/js/config.js', name: 'Config' },
      { path: '/js/modules/auth/login.js', name: 'Login' },
      { path: '/js/modules/tasks/tasks.js', name: 'Tasks' },
      { path: '/js/modules/notes/notes-core.js', name: 'Notes' },
      { path: '/js/router.js', name: 'Router' },
      { path: '/css/style-themes.css', name: 'Themes CSS' }
    ];

    const results = await Promise.all(
      criticalFiles.map(async (file) => {
        try {
          const response = await fetch(file.path, { method: 'HEAD' });
          return {
            name: file.name,
            path: file.path,
            status: response.ok ? 'ok' : 'error',
            httpStatus: response.status
          };
        } catch (error) {
          return {
            name: file.name,
            path: file.path,
            status: 'error',
            error: error.message
          };
        }
      })
    );

    const errors = results.filter(r => r.status === 'error');
    const status = errors.length === 0 ? 'healthy'
      : errors.length < 2 ? 'warning'
      : 'critical';

    return {
      status,
      total: criticalFiles.length,
      ok: results.filter(r => r.status === 'ok').length,
      errors: errors.length,
      files: results,
      message: errors.length === 0
        ? 'Tous les fichiers critiques chargés'
        : `${errors.length} fichier(s) manquant(s)`
    };
  },

  /**
   * CHECK 6: Tests API automatiques
   */
  async runAPITests() {
    const endpoints = [
      { path: '/health', method: 'GET', name: 'Health Check', auth: false },
      { path: '/tasks', method: 'GET', name: 'Tasks API', auth: true },
      { path: '/notes', method: 'GET', name: 'Notes API', auth: true },
      { path: '/projects', method: 'GET', name: 'Projects API', auth: true },
      { path: '/admin/stats', method: 'GET', name: 'Admin Stats', auth: true }
    ];

    const token = ApiTokens?.getAccessToken() || localStorage.getItem('accessToken');

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        const startTime = Date.now();
        try {
          const headers = {
            'Content-Type': 'application/json'
          };

          if (endpoint.auth && token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(`${AppConfig.API_URL}${endpoint.path}`, {
            method: endpoint.method,
            headers
          });

          const duration = Date.now() - startTime;

          return {
            name: endpoint.name,
            path: endpoint.path,
            status: response.ok ? 'ok' : 'error',
            httpStatus: response.status,
            responseTime: duration
          };
        } catch (error) {
          return {
            name: endpoint.name,
            path: endpoint.path,
            status: 'error',
            error: error.message,
            responseTime: Date.now() - startTime
          };
        }
      })
    );

    const errors = results.filter(r => r.status === 'error');
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    return {
      status: errors.length === 0 ? 'healthy' : errors.length < 2 ? 'warning' : 'critical',
      total: endpoints.length,
      ok: results.filter(r => r.status === 'ok').length,
      errors: errors.length,
      avgResponseTime: Math.round(avgResponseTime),
      tests: results,
      message: errors.length === 0
        ? `${results.length}/${results.length} endpoints OK`
        : `${errors.length} endpoint(s) en erreur`
    };
  },

  /**
   * CHECK 7: Conflits CSS
   */
  async checkCSSConflicts() {
    const conflicts = [];

    // Vérifier les scrollbars multiples (problème connu)
    const scrollableElements = document.querySelectorAll('*');
    const multipleScrollbars = [];

    scrollableElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.overflow === 'scroll' || style.overflowY === 'scroll') {
        const rect = el.getBoundingClientRect();
        if (rect.height > 0) {
          multipleScrollbars.push({
            tag: el.tagName,
            class: el.className,
            id: el.id
          });
        }
      }
    });

    if (multipleScrollbars.length > 3) {
      conflicts.push({
        type: 'multiple_scrollbars',
        severity: 'warning',
        count: multipleScrollbars.length,
        message: `${multipleScrollbars.length} éléments avec overflow:scroll détectés`
      });
    }

    // Vérifier les z-index élevés (>1000)
    const highZIndexElements = [];
    document.querySelectorAll('*').forEach(el => {
      const zIndex = parseInt(window.getComputedStyle(el).zIndex);
      if (zIndex > 1000) {
        highZIndexElements.push({
          tag: el.tagName,
          class: el.className,
          zIndex
        });
      }
    });

    if (highZIndexElements.length > 5) {
      conflicts.push({
        type: 'high_z_index',
        severity: 'info',
        count: highZIndexElements.length,
        message: `${highZIndexElements.length} éléments avec z-index > 1000`
      });
    }

    return {
      status: conflicts.length === 0 ? 'healthy' : 'warning',
      conflicts,
      message: conflicts.length === 0
        ? 'Aucun conflit CSS détecté'
        : `${conflicts.length} conflit(s) potentiel(s)`
    };
  },

  /**
   * Calculer le score global du système
   */
  calculateOverallScore() {
    const results = this.lastScanResults;
    let score = 100;
    let criticalIssues = 0;
    let warnings = 0;

    // JS Errors (-20 points par erreur non résolue, max -40)
    if (results.jsErrors?.count > 0) {
      const penalty = Math.min(results.jsErrors.count * 20, 40);
      score -= penalty;
      if (results.jsErrors.status === 'critical') criticalIssues++;
      else warnings++;
    }

    // Backend Health (-50 si down, -20 si dégradé)
    if (results.backendHealth?.status === 'critical') {
      score -= 50;
      criticalIssues++;
    } else if (results.backendHealth?.status === 'warning') {
      score -= 20;
      warnings++;
    }

    // Performance (-15 si lent)
    if (results.performanceMetrics?.status === 'critical') {
      score -= 15;
      criticalIssues++;
    } else if (results.performanceMetrics?.status === 'warning') {
      score -= 10;
      warnings++;
    }

    // Memory (-10 si >80%)
    if (results.memoryStats?.status === 'critical') {
      score -= 10;
      warnings++;
    }

    // Critical Files (-30 si fichiers manquants)
    if (results.criticalFiles?.errors > 0) {
      score -= results.criticalFiles.errors * 10;
      if (results.criticalFiles.status === 'critical') criticalIssues++;
      else warnings++;
    }

    // API Tests (-5 par endpoint en erreur)
    if (results.apiTests?.errors > 0) {
      score -= results.apiTests.errors * 5;
      if (results.apiTests.status === 'critical') criticalIssues++;
      else warnings++;
    }

    results.overallScore = Math.max(0, score);
    results.criticalIssues = criticalIssues;
    results.warnings = warnings;
  },

  /**
   * Exporter rapport de diagnostic complet
   */
  exportDiagnosticReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      systemInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      },
      scanResults: this.lastScanResults,
      recentErrors: this.state.errors.slice(-20),
      config: this.config
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Toast.success('📥 Rapport de diagnostic exporté');
  },

  /**
   * Obtenir le statut actuel
   */
  getStatus() {
    return {
      isRunning: this.state.isRunning,
      autoScanEnabled: this.state.autoScanEnabled,
      lastScan: this.state.lastScan,
      errorCount: this.state.errors.length,
      lastResults: this.lastScanResults
    };
  }
};

// Exposer globalement
window.AdminSentinel = AdminSentinel;

console.log('[AdminSentinel] Module loaded - Ready to protect 🛡️');
