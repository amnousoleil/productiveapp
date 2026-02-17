/**
 * Admin View Module v3.0 - Premium Real-time Monitoring Center
 * @description Ultra-comfortable dark mode monitoring with real-time updates
 * Features: Auto-refresh, sound alerts, keyboard shortcuts, error grouping
 */

const AdminView = {
  data: {
    health: null,
    stats: null,
    members: [],
    recentActivity: [],
    frontendErrors: null,
    frontendErrorStats: null,
    analyticsPages: [],
    analyticsFeatures: [],
    userActivity: null,
    featureEngagement: null,
    apiMetrics: null,
    topEndpoints: []
  },

  charts: {
    bugsTrend: null,
    pagesVisited: null,
    featuresUsed: null
  },

  filters: {
    severity: '',
    resolved: null,
    limit: 50
  },

  // Real-time monitoring state
  monitoring: {
    autoRefresh: false,
    refreshInterval: null,
    soundEnabled: false,
    lastErrorCount: 0,
    selectedErrors: new Set()
  },

  async show() {
    console.log('[AdminView] Showing admin dashboard v3.0 PREMIUM');

    let container = document.querySelector('#view-admin');
    const mainContent = document.querySelector('.main-content');

    if (!mainContent) {
      console.error('[AdminView] .main-content not found');
      return;
    }

    if (!container) {
      container = document.createElement('div');
      container.id = 'view-admin';
      container.className = 'view-container';
      mainContent.appendChild(container);
    }

    container.classList.add('active');
    await this.init();
    this.initKeyboardShortcuts();
  },

  async init() {
    console.log('[AdminView] Initializing premium monitoring center');
    await this.loadAllData();
    this.render();
    this.initCharts();
    this.checkForNewErrors(); // Initial error count
  },

  hide() {
    this.stopAutoRefresh();
    this.removeKeyboardShortcuts();
  },

  async loadAllData() {
    try {
      const [
        health,
        stats,
        members,
        activity,
        frontendErrors,
        frontendErrorStats,
        analyticsPages,
        analyticsFeatures,
        userActivity,
        featureEngagement,
        apiMetrics,
        topEndpoints
      ] = await Promise.all([
        AdminAPI.getHealth(),
        AdminAPI.getStats(),
        AdminAPI.getMemberActivity(),
        AdminAPI.getRecentActivity(15),
        AdminAPI.getFrontendErrors(this.filters),
        AdminAPI.getFrontendErrorStats(),
        AdminAPI.getAnalyticsPages(10),
        AdminAPI.getAnalyticsFeatures(10),
        AdminAPI.getUserActivity(),
        AdminAPI.getFeatureEngagement(),
        AdminAPI.getAPIMetrics(),
        AdminAPI.getTopEndpoints(10)
      ]);

      this.data = {
        health,
        stats,
        members,
        recentActivity: activity,
        frontendErrors,
        frontendErrorStats,
        analyticsPages,
        analyticsFeatures,
        userActivity,
        featureEngagement,
        apiMetrics,
        topEndpoints
      };

      console.log('[AdminView] Complete data loaded:', this.data);
    } catch (error) {
      console.error('[AdminView] Failed to load data:', error);
      Toast.error('Erreur de chargement des données admin');
    }
  },

  async refresh(silent = false) {
    if (!silent) Toast.info('🔄 Actualisation en cours...');

    await this.loadAllData();
    this.render();
    this.initCharts();
    this.checkForNewErrors();

    if (!silent) Toast.success('✅ Données actualisées');

    // Update last refresh time
    const timeEl = document.querySelector('.refresh-time');
    if (timeEl) {
      timeEl.textContent = `Dernière mise à jour : ${new Date().toLocaleTimeString('fr-FR')}`;
    }
  },

  // ===== AUTO-REFRESH SYSTEM =====

  toggleAutoRefresh() {
    this.monitoring.autoRefresh = !this.monitoring.autoRefresh;

    if (this.monitoring.autoRefresh) {
      this.startAutoRefresh();
      Toast.success('🔄 Auto-refresh activé (30s)', { duration: 2000 });
    } else {
      this.stopAutoRefresh();
      Toast.info('⏸️ Auto-refresh désactivé', { duration: 2000 });
    }

    // Update button UI
    const btn = document.querySelector('.btn-auto-refresh');
    if (btn) {
      btn.classList.toggle('active', this.monitoring.autoRefresh);
      btn.innerHTML = this.monitoring.autoRefresh
        ? '<span>🔄</span> Auto (ON)'
        : '<span>⏸️</span> Auto (OFF)';
    }
  },

  startAutoRefresh() {
    this.stopAutoRefresh(); // Clear any existing interval
    this.monitoring.refreshInterval = setInterval(() => {
      this.refresh(true); // Silent refresh
    }, 30000); // 30 seconds
  },

  stopAutoRefresh() {
    if (this.monitoring.refreshInterval) {
      clearInterval(this.monitoring.refreshInterval);
      this.monitoring.refreshInterval = null;
    }
  },

  toggleSoundAlerts() {
    this.monitoring.soundEnabled = !this.monitoring.soundEnabled;

    const btn = document.querySelector('.btn-sound-toggle');
    if (btn) {
      btn.classList.toggle('active', this.monitoring.soundEnabled);
      btn.innerHTML = this.monitoring.soundEnabled
        ? '<span>🔔</span> Son (ON)'
        : '<span>🔕</span> Son (OFF)';
    }

    Toast.info(this.monitoring.soundEnabled ? '🔔 Alertes sonores activées' : '🔕 Alertes sonores désactivées', { duration: 2000 });
  },

  checkForNewErrors() {
    if (!this.data.frontendErrorStats) return;

    const currentCount = this.data.frontendErrorStats.unresolved || 0;
    const previousCount = this.monitoring.lastErrorCount;

    // New error detected
    if (currentCount > previousCount && previousCount > 0) {
      const newErrors = currentCount - previousCount;

      // Update badge
      this.updateErrorBadge(newErrors);

      // Play sound if enabled
      if (this.monitoring.soundEnabled) {
        this.playErrorSound();
      }

      // Show toast notification
      Toast.error(`🚨 ${newErrors} nouvelle(s) erreur(s) détectée(s)`, { duration: 5000 });
    }

    this.monitoring.lastErrorCount = currentCount;
  },

  updateErrorBadge(count) {
    const badge = document.querySelector('.error-badge');
    if (badge) {
      badge.textContent = count;
      badge.classList.add('pulse');
      setTimeout(() => badge.classList.remove('pulse'), 1000);
    }
  },

  playErrorSound() {
    try {
      // Create simple beep with Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // 800Hz beep
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('[AdminView] Sound playback failed:', error);
    }
  },

  render() {
    const container = document.querySelector('#view-admin');
    if (!container) return;

    const unresolvedCount = this.data.frontendErrorStats?.unresolved || 0;

    container.innerHTML = `
      <div class="admin-dashboard">
        <!-- Sticky Header -->
        <div class="admin-header sticky-header">
          <div class="header-left">
            <div>
              <h1>🛡️ Centre de Surveillance</h1>
              <p class="admin-subtitle">Monitoring temps réel • Super-admin</p>
              <p class="refresh-time">Dernière mise à jour : ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
            ${unresolvedCount > 0 ? `<div class="error-badge pulse">${unresolvedCount}</div>` : ''}
          </div>

          <div class="header-controls">
            <button class="btn-auto-refresh" onclick="AdminView.toggleAutoRefresh()">
              <span>⏸️</span> Auto (OFF)
            </button>
            <button class="btn-sound-toggle" onclick="AdminView.toggleSoundAlerts()">
              <span>🔕</span> Son (OFF)
            </button>
            <button class="btn-refresh" onclick="AdminView.refresh()">
              <span>🔄</span> Actualiser
            </button>
          </div>
        </div>

        <!-- Real-time Stats Cards -->
        ${this.renderRealTimeStats()}

        <!-- Tabs Navigation -->
        <div class="admin-tabs">
          <button class="admin-tab active" onclick="AdminView.switchTab('sentinel', event)">
            🔍 Sentinelle
          </button>
          <button class="admin-tab" onclick="AdminView.switchTab('bugs', event)">
            🐛 Bugs Monitoring
          </button>
          <button class="admin-tab" onclick="AdminView.switchTab('analytics', event)">
            📊 Analytics
          </button>
          <button class="admin-tab" onclick="AdminView.switchTab('performance', event)">
            ⚡ Performance
          </button>
          <button class="admin-tab" onclick="AdminView.switchTab('system', event)">
            🖥️ Système
          </button>
        </div>

        <!-- Tab Contents -->
        <div class="admin-tab-content active" data-tab="sentinel">
          ${this.renderSentinel()}
        </div>

        <div class="admin-tab-content" data-tab="bugs">
          ${this.renderBugsMonitoring()}
        </div>

        <div class="admin-tab-content" data-tab="analytics">
          ${this.renderAnalytics()}
        </div>

        <div class="admin-tab-content" data-tab="performance">
          ${this.renderPerformance()}
        </div>

        <div class="admin-tab-content" data-tab="system">
          ${this.renderSystemInfo()}
        </div>
      </div>
    `;
  },

  switchTab(tabName, event) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
    if (event?.target) event.target.classList.add('active');

    // Update tab contents
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    const targetContent = document.querySelector(`.admin-tab-content[data-tab="${tabName}"]`);
    if (targetContent) {
      targetContent.classList.add('active');
      // Re-init charts for this tab
      setTimeout(() => this.initCharts(), 100);
    }
  },

  renderRealTimeStats() {
    const { stats, frontendErrorStats, userActivity, health } = this.data;
    if (!stats || !frontendErrorStats || !userActivity) {
      return '<div class="loading">Chargement...</div>';
    }

    const uptimeHours = health ? (health.uptime / 3600).toFixed(1) : '0';

    return `
      <div class="realtime-stats-grid">
        <div class="realtime-card">
          <div class="realtime-icon">👥</div>
          <div class="realtime-content">
            <p class="realtime-value">${userActivity.activeToday || 0}</p>
            <p class="realtime-label">Utilisateurs actifs maintenant</p>
          </div>
        </div>

        <div class="realtime-card">
          <div class="realtime-icon">✅</div>
          <div class="realtime-content">
            <p class="realtime-value">${stats.activity.logins_today || 0}</p>
            <p class="realtime-label">Tâches créées aujourd'hui</p>
          </div>
        </div>

        <div class="realtime-card ${frontendErrorStats.last24h > 10 ? 'realtime-warning' : ''}">
          <div class="realtime-icon">🐛</div>
          <div class="realtime-content">
            <p class="realtime-value">${frontendErrorStats.last24h}</p>
            <p class="realtime-label">Erreurs frontend (24h)</p>
          </div>
        </div>

        <div class="realtime-card realtime-success">
          <div class="realtime-icon">⏱️</div>
          <div class="realtime-content">
            <p class="realtime-value">${uptimeHours}h</p>
            <p class="realtime-label">Uptime backend</p>
          </div>
        </div>
      </div>
    `;
  },

  renderBugsMonitoring() {
    const { frontendErrors, frontendErrorStats } = this.data;
    if (!frontendErrors || !frontendErrorStats) {
      return '<div class="loading">Chargement...</div>';
    }

    return `
      <div class="bugs-section">
        <!-- Stats Overview -->
        <div class="bugs-stats-grid">
          <div class="bug-stat-card">
            <span class="bug-stat-icon">🔴</span>
            <div>
              <p class="bug-stat-value">${frontendErrorStats.bySeverity.error}</p>
              <p class="bug-stat-label">Errors</p>
            </div>
          </div>
          <div class="bug-stat-card">
            <span class="bug-stat-icon">🟡</span>
            <div>
              <p class="bug-stat-value">${frontendErrorStats.bySeverity.warning}</p>
              <p class="bug-stat-label">Warnings</p>
            </div>
          </div>
          <div class="bug-stat-card">
            <span class="bug-stat-icon">🔵</span>
            <div>
              <p class="bug-stat-value">${frontendErrorStats.bySeverity.info}</p>
              <p class="bug-stat-label">Info</p>
            </div>
          </div>
          <div class="bug-stat-card">
            <span class="bug-stat-icon">📈</span>
            <div>
              <p class="bug-stat-value">${frontendErrorStats.lastWeek}</p>
              <p class="bug-stat-label">Cette semaine</p>
            </div>
          </div>
        </div>

        <!-- Trend Chart -->
        <div class="chart-container">
          <h3>📉 Tendance des bugs (7 derniers jours)</h3>
          <canvas id="bugsTrendChart"></canvas>
        </div>

        <!-- Filters & Actions -->
        <div class="bugs-filters">
          <div class="filter-group">
            <select id="severityFilter" onchange="AdminView.filterBugs()">
              <option value="">Tous les niveaux</option>
              <option value="error">🔴 Error</option>
              <option value="warning">🟡 Warning</option>
              <option value="info">🔵 Info</option>
            </select>

            <select id="resolvedFilter" onchange="AdminView.filterBugs()">
              <option value="">Tous les statuts</option>
              <option value="false">⏳ Non résolus</option>
              <option value="true">✅ Résolus</option>
            </select>

            <button class="btn-quick-filter" onclick="AdminView.quickFilter('today')">
              📅 Aujourd'hui
            </button>

            <button class="btn-quick-filter" onclick="AdminView.quickFilter('critical')">
              🚨 Critiques
            </button>
          </div>

          <div class="action-group">
            <button class="btn-action" onclick="AdminView.resolveSelected()" title="Résoudre la sélection (R)">
              ✅ Résoudre sélection
            </button>
            <button class="btn-action" onclick="AdminView.clearResolved()" title="Nettoyer résolus (C)">
              🗑️ Nettoyer résolus
            </button>
            <button class="btn-export" onclick="AdminView.exportErrorsCSV()" title="Export CSV (E)">
              📥 Export CSV
            </button>
          </div>
        </div>

        <!-- Keyboard shortcuts hint -->
        <div class="shortcuts-hint">
          💡 Raccourcis : <kbd>R</kbd> Refresh • <kbd>F</kbd> Filtrer • <kbd>E</kbd> Export • <kbd>C</kbd> Clear
        </div>

        <!-- Errors Table -->
        ${this.renderErrorsTable(frontendErrors.errors)}
      </div>
    `;
  },

  renderErrorsTable(errors) {
    if (!errors || errors.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <p class="empty-title">Aucune erreur enregistrée</p>
          <p class="empty-subtitle">Le système fonctionne parfaitement</p>
        </div>
      `;
    }

    // Group errors by message (same error repeated)
    const groupedErrors = this.groupErrors(errors);

    return `
      <div class="errors-table-container">
        <div class="table-header">
          <label class="select-all-container">
            <input type="checkbox" onchange="AdminView.toggleSelectAll(this)">
            <span>Tout sélectionner (${groupedErrors.length})</span>
          </label>
          <span class="selected-count"></span>
        </div>

        <table class="errors-table">
          <thead>
            <tr>
              <th width="40"></th>
              <th width="180">Timestamp</th>
              <th width="120">Severity</th>
              <th>Message</th>
              <th width="200">URL</th>
              <th width="120">User</th>
              <th width="180">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${groupedErrors.map(group => {
              const error = group.errors[0]; // First error in group
              const timestamp = new Date(error.timestamp).toLocaleString('fr-FR');
              const severityIcon = error.severity === 'error' ? '🔴' : error.severity === 'warning' ? '🟡' : '🔵';
              const resolved = error.metadata?.resolved === 'true';
              const count = group.count;

              return `
                <tr class="${resolved ? 'error-resolved' : ''}"
                    ondblclick="AdminView.showErrorDetails('${error.id}')"
                    data-error-id="${error.id}">
                  <td>
                    <input type="checkbox"
                           class="error-checkbox"
                           data-error-id="${error.id}"
                           onchange="AdminView.toggleErrorSelection('${error.id}')">
                  </td>
                  <td class="timestamp-cell">
                    <div class="timestamp">${timestamp}</div>
                    ${count > 1 ? `<div class="error-count">×${count}</div>` : ''}
                  </td>
                  <td>
                    <span class="severity-badge severity-${error.severity}">
                      ${severityIcon} ${error.severity}
                    </span>
                  </td>
                  <td class="error-message" title="${error.message}">
                    ${this.highlightErrorMessage(error.message)}
                  </td>
                  <td class="error-url" title="${error.url || '-'}">
                    ${error.url ? new URL(error.url).pathname : '-'}
                  </td>
                  <td class="user-cell">${error.user_name || error.user_email || '-'}</td>
                  <td class="actions-cell">
                    ${!resolved ? `
                      <button class="btn-resolve" onclick="AdminView.resolveError('${error.id}')" title="Résoudre">
                        ✅
                      </button>
                    ` : '<span class="resolved-badge">✅</span>'}
                    <button class="btn-delete" onclick="AdminView.deleteError('${error.id}')" title="Supprimer">
                      🗑️
                    </button>
                    <button class="btn-details" onclick="AdminView.showErrorDetails('${error.id}')" title="Détails">
                      👁️
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  groupErrors(errors) {
    const groups = new Map();

    errors.forEach(error => {
      const key = error.message.substring(0, 100); // Group by first 100 chars of message
      if (!groups.has(key)) {
        groups.set(key, { errors: [], count: 0 });
      }
      groups.get(key).errors.push(error);
      groups.get(key).count++;
    });

    // Convert to array and sort by most recent
    return Array.from(groups.values())
      .sort((a, b) => new Date(b.errors[0].timestamp) - new Date(a.errors[0].timestamp));
  },

  highlightErrorMessage(message) {
    // Truncate and highlight keywords
    let truncated = message.substring(0, 100);
    if (message.length > 100) truncated += '...';

    // Highlight error keywords
    truncated = truncated
      .replace(/(undefined|null|failed|error|exception)/gi, '<mark class="error-keyword">$1</mark>')
      .replace(/line (\d+)/gi, '<code class="error-line">line $1</code>');

    return truncated;
  },

  renderAnalytics() {
    return `
      <div class="analytics-section">
        <div class="analytics-grid">
          <!-- Top Pages Chart -->
          <div class="chart-card">
            <h3>📄 Pages les plus visitées</h3>
            <canvas id="pagesVisitedChart"></canvas>
          </div>

          <!-- Top Features Chart -->
          <div class="chart-card">
            <h3>✨ Features les plus utilisées</h3>
            <canvas id="featuresUsedChart"></canvas>
          </div>
        </div>

        <!-- User Activity Stats -->
        ${this.renderUserActivityStats()}

        <!-- Feature Engagement -->
        ${this.renderFeatureEngagement()}
      </div>
    `;
  },

  renderUserActivityStats() {
    const { userActivity } = this.data;
    if (!userActivity) return '';

    return `
      <div class="user-activity-stats">
        <h3>👥 Activité utilisateurs</h3>
        <div class="activity-grid">
          <div class="activity-card">
            <p class="activity-value">${userActivity.activeToday || 0}</p>
            <p class="activity-label">Actifs aujourd'hui</p>
          </div>
          <div class="activity-card">
            <p class="activity-value">${userActivity.activeThisWeek || 0}</p>
            <p class="activity-label">Actifs cette semaine</p>
          </div>
          <div class="activity-card">
            <p class="activity-value">${userActivity.activeThisMonth || 0}</p>
            <p class="activity-label">Actifs ce mois</p>
          </div>
          <div class="activity-card">
            <p class="activity-value">${userActivity.newUsersThisWeek || 0}</p>
            <p class="activity-label">Nouveaux (7j)</p>
          </div>
        </div>
      </div>
    `;
  },

  renderFeatureEngagement() {
    const { featureEngagement } = this.data;
    if (!featureEngagement || !featureEngagement.features) return '';

    return `
      <div class="feature-engagement">
        <h3>📊 Taux d'adoption des features</h3>
        <div class="engagement-list">
          ${featureEngagement.features.map(feature => {
            const adoptionRate = ((feature.uniqueUsers / featureEngagement.totalUsers) * 100).toFixed(1);
            return `
              <div class="engagement-item">
                <div class="engagement-info">
                  <span class="engagement-name">${feature.featureName}</span>
                  <span class="engagement-users">${feature.uniqueUsers} utilisateurs</span>
                </div>
                <div class="engagement-bar">
                  <div class="engagement-fill" style="width: ${adoptionRate}%"></div>
                  <span class="engagement-percent">${adoptionRate}%</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  renderPerformance() {
    const { apiMetrics, topEndpoints } = this.data;
    if (!apiMetrics || !topEndpoints) {
      return '<div class="loading">Chargement...</div>';
    }

    const avgResponseTime = apiMetrics.averageResponseTime || 0;
    const totalRequests = apiMetrics.totalRequests || 0;

    return `
      <div class="performance-section">
        <!-- API Metrics -->
        <div class="perf-stats-grid">
          <div class="perf-card">
            <span class="perf-icon">⚡</span>
            <div>
              <p class="perf-value">${avgResponseTime.toFixed(0)}ms</p>
              <p class="perf-label">Temps de réponse moyen</p>
            </div>
          </div>
          <div class="perf-card">
            <span class="perf-icon">📊</span>
            <div>
              <p class="perf-value">${totalRequests}</p>
              <p class="perf-label">Requêtes (dernière heure)</p>
            </div>
          </div>
          <div class="perf-card">
            <span class="perf-icon">✅</span>
            <div>
              <p class="perf-value">${apiMetrics.successRate || 0}%</p>
              <p class="perf-label">Taux de succès</p>
            </div>
          </div>
          <div class="perf-card ${apiMetrics.errorRate > 5 ? 'perf-warning' : ''}">
            <span class="perf-icon">❌</span>
            <div>
              <p class="perf-value">${apiMetrics.errorRate || 0}%</p>
              <p class="perf-label">Taux d'erreur</p>
            </div>
          </div>
        </div>

        <!-- Top Endpoints -->
        <div class="endpoints-section">
          <h3>🔝 Endpoints les plus sollicités</h3>
          <div class="endpoints-list">
            ${topEndpoints.map((endpoint, idx) => `
              <div class="endpoint-item">
                <span class="endpoint-rank">#${idx + 1}</span>
                <div class="endpoint-info">
                  <span class="endpoint-path">${endpoint.path}</span>
                  <span class="endpoint-stats">${endpoint.count} requêtes • ${endpoint.avgResponseTime}ms moy</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  renderSystemInfo() {
    const { health, stats } = this.data;
    if (!health || !stats) {
      return '<div class="loading">Chargement...</div>';
    }

    return `
      <div class="system-section">
        <!-- System Health -->
        ${this.renderHealthCard()}

        <!-- Stats Grid -->
        <div class="admin-grid">
          ${this.renderStatsCards()}
        </div>

        <!-- Members Activity -->
        <div class="admin-section">
          <h2>👥 Activité par membre</h2>
          ${this.renderMembersTable()}
        </div>
      </div>
    `;
  },

  renderHealthCard() {
    const { health } = this.data;
    if (!health) return '';

    const statusEmoji = health.status === 'healthy' ? '✅' : health.status === 'degraded' ? '⚠️' : '❌';
    const statusClass = `health-${health.status}`;
    const uptimeHours = (health.uptime / 3600).toFixed(1);

    return `
      <div class="health-card ${statusClass}">
        <div class="health-status">
          <span class="health-emoji">${statusEmoji}</span>
          <div>
            <h3>Santé du système</h3>
            <p class="health-label">${health.status.toUpperCase()}</p>
          </div>
        </div>
        <div class="health-details">
          <div class="health-item">
            <span class="health-icon">🗄️</span>
            <div>
              <p class="health-value">${health.database.status === 'connected' ? 'Connectée' : 'Déconnectée'}</p>
              <p class="health-label">Base de données (${health.database.responseTime}ms)</p>
            </div>
          </div>
          <div class="health-item">
            <span class="health-icon">⏱️</span>
            <div>
              <p class="health-value">${uptimeHours}h</p>
              <p class="health-label">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderStatsCards() {
    const { stats } = this.data;
    if (!stats) return '';

    return `
      <div class="stat-card">
        <span class="stat-icon">👥</span>
        <div class="stat-content">
          <p class="stat-value">${stats.users.total}</p>
          <p class="stat-label">Utilisateurs</p>
          <p class="stat-sublabel">${stats.users.active_today} actifs aujourd'hui</p>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">📝</span>
        <div class="stat-content">
          <p class="stat-value">${stats.content.notes}</p>
          <p class="stat-label">Notes</p>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">✅</span>
        <div class="stat-content">
          <p class="stat-value">${stats.content.tasks}</p>
          <p class="stat-label">Tâches</p>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">📁</span>
        <div class="stat-content">
          <p class="stat-value">${stats.content.projects}</p>
          <p class="stat-label">Projets</p>
        </div>
      </div>
    `;
  },

  renderMembersTable() {
    const { members } = this.data;
    if (!members || members.length === 0) return '<p class="empty">Aucun membre</p>';

    return `
      <div class="members-table">
        <table>
          <thead>
            <tr>
              <th>Membre</th>
              <th>Dernière connexion</th>
              <th>Connexions (7j)</th>
              <th>Notes</th>
              <th>Tâches</th>
              <th>Projets</th>
            </tr>
          </thead>
          <tbody>
            ${members.map(member => `
              <tr>
                <td><strong>${member.member_name}</strong></td>
                <td>${member.last_login ? new Date(member.last_login).toLocaleString('fr-FR') : '-'}</td>
                <td>${member.login_count_week}</td>
                <td>${member.notes_count}</td>
                <td>${member.tasks_count}</td>
                <td>${member.projects_count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== ACTIONS =====

  async filterBugs() {
    const severity = document.getElementById('severityFilter')?.value || '';
    const resolved = document.getElementById('resolvedFilter')?.value || '';

    this.filters.severity = severity;
    this.filters.resolved = resolved === '' ? null : resolved === 'true';

    try {
      const frontendErrors = await AdminAPI.getFrontendErrors(this.filters);
      this.data.frontendErrors = frontendErrors;

      // Re-render errors table only
      const errorsTableContainer = document.querySelector('.errors-table-container');
      if (errorsTableContainer?.parentElement) {
        const tableHtml = this.renderErrorsTable(frontendErrors.errors);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = tableHtml;
        errorsTableContainer.parentElement.replaceChild(tempDiv.firstElementChild, errorsTableContainer);
      }

      Toast.success('✅ Filtres appliqués');
    } catch (error) {
      console.error('[AdminView] Filter bugs failed:', error);
      Toast.error('❌ Erreur lors du filtrage');
    }
  },

  quickFilter(type) {
    const severityFilter = document.getElementById('severityFilter');
    const resolvedFilter = document.getElementById('resolvedFilter');

    if (type === 'today') {
      // Show only today's errors (not implemented in backend, use resolved filter)
      resolvedFilter.value = 'false';
      Toast.info('📅 Affichage : erreurs non résolues');
    } else if (type === 'critical') {
      severityFilter.value = 'error';
      resolvedFilter.value = 'false';
      Toast.info('🚨 Affichage : erreurs critiques non résolues');
    }

    this.filterBugs();
  },

  // ===== ERROR SELECTION =====

  toggleSelectAll(checkbox) {
    const checkboxes = document.querySelectorAll('.error-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = checkbox.checked;
      const errorId = cb.dataset.errorId;
      if (checkbox.checked) {
        this.monitoring.selectedErrors.add(errorId);
      } else {
        this.monitoring.selectedErrors.delete(errorId);
      }
    });
    this.updateSelectedCount();
  },

  toggleErrorSelection(errorId) {
    if (this.monitoring.selectedErrors.has(errorId)) {
      this.monitoring.selectedErrors.delete(errorId);
    } else {
      this.monitoring.selectedErrors.add(errorId);
    }
    this.updateSelectedCount();
  },

  updateSelectedCount() {
    const count = this.monitoring.selectedErrors.size;
    const countEl = document.querySelector('.selected-count');
    if (countEl) {
      countEl.textContent = count > 0 ? `${count} sélectionnée(s)` : '';
      countEl.classList.toggle('visible', count > 0);
    }
  },

  async resolveSelected() {
    const count = this.monitoring.selectedErrors.size;
    if (count === 0) {
      Toast.warning('⚠️ Aucune erreur sélectionnée');
      return;
    }

    if (!confirm(`Résoudre ${count} erreur(s) sélectionnée(s) ?`)) return;

    try {
      const promises = Array.from(this.monitoring.selectedErrors).map(id =>
        AdminAPI.resolveFrontendError(id)
      );
      await Promise.all(promises);

      this.monitoring.selectedErrors.clear();
      Toast.success(`✅ ${count} erreur(s) résolue(s)`);
      await this.refresh();
    } catch (error) {
      console.error('[AdminView] Resolve selected failed:', error);
      Toast.error('❌ Erreur lors de la résolution');
    }
  },

  async clearResolved() {
    if (!confirm('Supprimer toutes les erreurs résolues ? Cette action est irréversible.')) return;

    try {
      // Get all resolved errors
      const resolvedErrors = this.data.frontendErrors?.errors.filter(e => e.metadata?.resolved === 'true') || [];

      if (resolvedErrors.length === 0) {
        Toast.info('ℹ️ Aucune erreur résolue à supprimer');
        return;
      }

      const promises = resolvedErrors.map(error => AdminAPI.deleteFrontendError(error.id));
      await Promise.all(promises);

      Toast.success(`✅ ${resolvedErrors.length} erreur(s) résolue(s) supprimée(s)`);
      await this.refresh();
    } catch (error) {
      console.error('[AdminView] Clear resolved failed:', error);
      Toast.error('❌ Erreur lors du nettoyage');
    }
  },

  showErrorDetails(errorId) {
    const error = this.data.frontendErrors?.errors.find(e => e.id === errorId);
    if (!error) return;

    const modal = document.createElement('div');
    modal.className = 'error-detail-modal';
    modal.innerHTML = `
      <div class="error-detail-content">
        <div class="error-detail-header">
          <h2>🐛 Détails de l'erreur</h2>
          <button class="btn-close-modal" onclick="this.closest('.error-detail-modal').remove()">✕</button>
        </div>
        <div class="error-detail-body">
          <div class="detail-row">
            <strong>Timestamp:</strong>
            <span>${new Date(error.timestamp).toLocaleString('fr-FR')}</span>
          </div>
          <div class="detail-row">
            <strong>Severity:</strong>
            <span class="severity-badge severity-${error.severity}">${error.severity.toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <strong>Message:</strong>
            <pre>${error.message}</pre>
          </div>
          <div class="detail-row">
            <strong>URL:</strong>
            <code>${error.url || 'N/A'}</code>
          </div>
          <div class="detail-row">
            <strong>User:</strong>
            <span>${error.user_name || error.user_email || 'Anonymous'}</span>
          </div>
          <div class="detail-row">
            <strong>User Agent:</strong>
            <pre>${error.user_agent || 'N/A'}</pre>
          </div>
          ${error.stack_trace ? `
            <div class="detail-row">
              <strong>Stack Trace:</strong>
              <pre class="stack-trace">${error.stack_trace}</pre>
            </div>
          ` : ''}
          ${error.metadata ? `
            <div class="detail-row">
              <strong>Metadata:</strong>
              <pre>${JSON.stringify(error.metadata, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
        <div class="error-detail-footer">
          <button class="btn-action" onclick="AdminView.resolveError('${error.id}'); this.closest('.error-detail-modal').remove();">
            ✅ Résoudre
          </button>
          <button class="btn-delete" onclick="AdminView.deleteError('${error.id}'); this.closest('.error-detail-modal').remove();">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  async resolveError(errorId) {
    if (!confirm('Marquer cette erreur comme résolue ?')) return;

    try {
      await AdminAPI.resolveFrontendError(errorId);
      Toast.success('Erreur marquée comme résolue');
      await this.refresh();
    } catch (error) {
      console.error('[AdminView] Resolve error failed:', error);
      Toast.error('Erreur lors de la résolution');
    }
  },

  async deleteError(errorId) {
    if (!confirm('Supprimer définitivement cette erreur ?')) return;

    try {
      await AdminAPI.deleteFrontendError(errorId);
      this.monitoring.selectedErrors.delete(errorId); // Remove from selection
      Toast.success('✅ Erreur supprimée');
      await this.refresh();
    } catch (error) {
      console.error('[AdminView] Delete error failed:', error);
      Toast.error('❌ Erreur lors de la suppression');
    }
  },

  // ===== KEYBOARD SHORTCUTS =====

  initKeyboardShortcuts() {
    this.keyboardHandler = this.handleKeyPress.bind(this);
    document.addEventListener('keydown', this.keyboardHandler);
    console.log('[AdminView] Keyboard shortcuts initialized');
  },

  removeKeyboardShortcuts() {
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      console.log('[AdminView] Keyboard shortcuts removed');
    }
  },

  handleKeyPress(event) {
    // Ignore if typing in input/textarea
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    // Ignore if modal is open
    if (document.querySelector('.error-detail-modal')) return;

    const key = event.key.toLowerCase();

    switch (key) {
      case 'r':
        event.preventDefault();
        this.refresh();
        break;

      case 'f':
        event.preventDefault();
        document.getElementById('severityFilter')?.focus();
        break;

      case 'e':
        event.preventDefault();
        this.exportErrorsCSV();
        break;

      case 'c':
        event.preventDefault();
        this.clearResolved();
        break;

      case 'a':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const selectAllCheckbox = document.querySelector('.select-all-container input[type="checkbox"]');
          if (selectAllCheckbox) {
            selectAllCheckbox.checked = !selectAllCheckbox.checked;
            this.toggleSelectAll(selectAllCheckbox);
          }
        }
        break;

      case 'escape':
        // Deselect all
        this.monitoring.selectedErrors.clear();
        document.querySelectorAll('.error-checkbox').forEach(cb => cb.checked = false);
        this.updateSelectedCount();
        Toast.info('ℹ️ Sélection annulée');
        break;
    }
  },

  async exportErrorsCSV() {
    try {
      Toast.info('Export en cours...');
      const blob = await AdminAPI.exportFrontendErrorsCSV({
        severity: this.filters.severity,
        startDate: null,
        endDate: null
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `frontend-errors-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Toast.success('Export CSV téléchargé');
    } catch (error) {
      console.error('[AdminView] Export CSV failed:', error);
      Toast.error('Erreur lors de l\'export');
    }
  },

  // ===== CHARTS =====

  initCharts() {
    // Destroy existing charts
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });

    // Bugs Trend Chart
    const bugsTrendCanvas = document.getElementById('bugsTrendChart');
    if (bugsTrendCanvas && this.data.frontendErrorStats) {
      this.charts.bugsTrend = new Chart(bugsTrendCanvas, {
        type: 'line',
        data: {
          labels: this.data.frontendErrorStats.byDay.map(d => new Date(d.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Erreurs par jour',
            data: this.data.frontendErrorStats.byDay.map(d => d.count),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Pages Visited Chart
    const pagesCanvas = document.getElementById('pagesVisitedChart');
    if (pagesCanvas && this.data.analyticsPages) {
      this.charts.pagesVisited = new Chart(pagesCanvas, {
        type: 'bar',
        data: {
          labels: this.data.analyticsPages.map(p => p.page),
          datasets: [{
            label: 'Visites',
            data: this.data.analyticsPages.map(p => p.views),
            backgroundColor: '#6366f1',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Features Used Chart
    const featuresCanvas = document.getElementById('featuresUsedChart');
    if (featuresCanvas && this.data.analyticsFeatures) {
      this.charts.featuresUsed = new Chart(featuresCanvas, {
        type: 'doughnut',
        data: {
          labels: this.data.analyticsFeatures.map(f => f.feature),
          datasets: [{
            data: this.data.analyticsFeatures.map(f => f.usageCount),
            backgroundColor: [
              '#6366f1',
              '#8b5cf6',
              '#ec4899',
              '#f59e0b',
              '#10b981',
              '#06b6d4',
              '#ef4444',
              '#84cc16',
              '#f97316',
              '#a855f7'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' }
          }
        }
      });
    }
  },

  // ===== SENTINELLE DIAGNOSTIC =====

  renderSentinel() {
    const status = AdminSentinel.getStatus();
    const results = status.lastResults || {};

    const isRunning = status.isRunning;
    const autoScanEnabled = status.autoScanEnabled;
    const lastScan = status.lastScan ? new Date(status.lastScan).toLocaleString('fr-FR') : 'Jamais';

    // Score color
    const score = results.overallScore || 0;
    const scoreClass = score >= 80 ? 'score-excellent' : score >= 60 ? 'score-good' : score >= 40 ? 'score-warning' : 'score-critical';

    return `
      <div class="sentinel-section">
        <!-- Sentinel Controls -->
        <div class="sentinel-controls">
          <div class="sentinel-status">
            <div class="status-indicator ${isRunning ? 'status-active' : 'status-inactive'}"></div>
            <div>
              <h3>Statut de la sentinelle</h3>
              <p class="status-text">${isRunning ? '🛡️ Actif - Surveillance en cours' : '⏸️ Inactif'}</p>
              <p class="status-subtext">Dernier scan : ${lastScan}</p>
            </div>
          </div>

          <div class="sentinel-actions">
            ${!isRunning ? `
              <button class="btn-sentinel-start" onclick="AdminView.startSentinel()">
                <span>▶️</span> Démarrer
              </button>
            ` : `
              <button class="btn-sentinel-stop" onclick="AdminView.stopSentinel()">
                <span>⏸️</span> Arrêter
              </button>
            `}

            <button class="btn-sentinel-scan ${isRunning ? '' : 'disabled'}"
                    onclick="AdminView.runSentinelScan()"
                    ${!isRunning ? 'disabled' : ''}>
              <span>🔍</span> Scan manuel
            </button>

            <button class="btn-sentinel-auto ${autoScanEnabled ? 'active' : ''}"
                    onclick="AdminView.toggleAutoScan()">
              <span>${autoScanEnabled ? '🔄' : '⏸️'}</span> Auto-scan ${autoScanEnabled ? '(ON)' : '(OFF)'}
            </button>

            <button class="btn-sentinel-export" onclick="AdminView.exportDiagnostic()">
              <span>📥</span> Export rapport
            </button>
          </div>
        </div>

        ${results.timestamp ? this.renderSentinelResults(results, scoreClass, score) : this.renderSentinelEmpty()}
      </div>
    `;
  },

  renderSentinelEmpty() {
    return `
      <div class="sentinel-empty">
        <div class="empty-icon">🛡️</div>
        <h3>Aucun scan effectué</h3>
        <p>Démarrez la sentinelle pour lancer le diagnostic automatique du système</p>
        <button class="btn-primary" onclick="AdminView.startSentinel()">
          ▶️ Démarrer la sentinelle
        </button>
      </div>
    `;
  },

  renderSentinelResults(results, scoreClass, score) {
    return `
      <!-- Overall Score -->
      <div class="sentinel-score-card ${scoreClass}">
        <div class="score-circle">
          <svg viewBox="0 0 120 120" class="score-svg">
            <circle cx="60" cy="60" r="54" class="score-bg"></circle>
            <circle cx="60" cy="60" r="54" class="score-fill"
                    style="stroke-dashoffset: ${339 - (339 * score / 100)}"></circle>
          </svg>
          <div class="score-value">${score}</div>
        </div>
        <div class="score-info">
          <h3>Score de santé global</h3>
          <p class="score-label">${score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : score >= 40 ? 'Moyen' : 'Critique'}</p>
          <div class="score-issues">
            ${results.criticalIssues > 0 ? `<span class="issue-critical">🔴 ${results.criticalIssues} critique(s)</span>` : ''}
            ${results.warnings > 0 ? `<span class="issue-warning">🟡 ${results.warnings} avertissement(s)</span>` : ''}
            ${results.criticalIssues === 0 && results.warnings === 0 ? '<span class="issue-ok">✅ Aucun problème détecté</span>' : ''}
          </div>
          <p class="scan-duration">Scan effectué en ${(results.scanDuration / 1000).toFixed(1)}s</p>
        </div>
      </div>

      <!-- Diagnostic Grid -->
      <div class="diagnostic-grid">
        ${this.renderDiagnosticCard('JavaScript Errors', results.jsErrors, '🐛')}
        ${this.renderDiagnosticCard('Backend Health', results.backendHealth, '🖥️')}
        ${this.renderDiagnosticCard('Performance', results.performanceMetrics, '⚡')}
        ${this.renderDiagnosticCard('Memory Usage', results.memoryStats, '💾')}
        ${this.renderDiagnosticCard('Critical Files', results.criticalFiles, '📁')}
        ${this.renderDiagnosticCard('API Tests', results.apiTests, '🔌')}
        ${this.renderDiagnosticCard('CSS Conflicts', results.cssConflicts, '🎨')}
      </div>

      <!-- Detailed Results -->
      <div class="diagnostic-details">
        ${this.renderJSErrorsDetail(results.jsErrors)}
        ${this.renderAPITestsDetail(results.apiTests)}
        ${this.renderPerformanceDetail(results.performanceMetrics)}
      </div>
    `;
  },

  renderDiagnosticCard(title, data, icon) {
    if (!data) return '';

    const statusClass = data.status === 'healthy' ? 'diag-healthy'
      : data.status === 'warning' ? 'diag-warning'
      : data.status === 'critical' ? 'diag-critical'
      : 'diag-unknown';

    const statusEmoji = data.status === 'healthy' ? '✅'
      : data.status === 'warning' ? '⚠️'
      : data.status === 'critical' ? '🔴'
      : '❓';

    return `
      <div class="diagnostic-card ${statusClass}">
        <div class="diag-header">
          <span class="diag-icon">${icon}</span>
          <h4>${title}</h4>
          <span class="diag-status">${statusEmoji}</span>
        </div>
        <p class="diag-message">${data.message || 'N/A'}</p>
        ${this.renderDiagnosticMetrics(data)}
      </div>
    `;
  },

  renderDiagnosticMetrics(data) {
    const metrics = [];

    if (data.count !== undefined) metrics.push(`Count: ${data.count}`);
    if (data.responseTime !== undefined) metrics.push(`Response: ${data.responseTime}ms`);
    if (data.usedMB !== undefined) metrics.push(`${data.usedMB}MB / ${data.limitMB}MB`);
    if (data.ok !== undefined && data.total !== undefined) metrics.push(`${data.ok}/${data.total} OK`);
    if (data.avgResponseTime !== undefined) metrics.push(`Avg: ${data.avgResponseTime}ms`);

    if (metrics.length === 0) return '';

    return `<div class="diag-metrics">${metrics.join(' • ')}</div>`;
  },

  renderJSErrorsDetail(jsErrors) {
    if (!jsErrors || !jsErrors.recent || jsErrors.recent.length === 0) return '';

    return `
      <div class="detail-section">
        <h3>🐛 Erreurs JavaScript récentes (${jsErrors.count})</h3>
        <div class="error-list">
          ${jsErrors.recent.map(err => `
            <div class="error-item">
              <span class="error-severity severity-${err.severity}">${err.severity}</span>
              <span class="error-message">${err.message.substring(0, 100)}...</span>
              <span class="error-time">${new Date(err.timestamp).toLocaleTimeString('fr-FR')}</span>
            </div>
          `).join('')}
        </div>
        <button class="btn-view-all" onclick="AdminView.switchTab('bugs', event)">
          Voir tous les bugs →
        </button>
      </div>
    `;
  },

  renderAPITestsDetail(apiTests) {
    if (!apiTests || !apiTests.tests || apiTests.tests.length === 0) return '';

    return `
      <div class="detail-section">
        <h3>🔌 Tests API (${apiTests.ok}/${apiTests.total})</h3>
        <table class="api-tests-table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Status</th>
              <th>HTTP</th>
              <th>Response Time</th>
            </tr>
          </thead>
          <tbody>
            ${apiTests.tests.map(test => `
              <tr class="${test.status === 'ok' ? 'test-ok' : 'test-error'}">
                <td><code>${test.path}</code></td>
                <td>${test.status === 'ok' ? '✅' : '❌'} ${test.name}</td>
                <td>${test.httpStatus || '-'}</td>
                <td>${test.responseTime}ms</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderPerformanceDetail(perf) {
    if (!perf || !perf.metrics) return '';

    const metrics = perf.metrics;

    return `
      <div class="detail-section">
        <h3>⚡ Métriques de performance</h3>
        <div class="perf-metrics-grid">
          <div class="metric-card">
            <p class="metric-label">Page Load</p>
            <p class="metric-value">${Math.round(metrics.pageLoadTime)}ms</p>
          </div>
          <div class="metric-card">
            <p class="metric-label">DOM Ready</p>
            <p class="metric-value">${Math.round(metrics.domReady)}ms</p>
          </div>
          <div class="metric-card">
            <p class="metric-label">TTFB</p>
            <p class="metric-value">${Math.round(metrics.ttfb)}ms</p>
          </div>
          <div class="metric-card">
            <p class="metric-label">Resources</p>
            <p class="metric-value">${metrics.resources}</p>
          </div>
          ${metrics.memory ? `
            <div class="metric-card">
              <p class="metric-label">Memory</p>
              <p class="metric-value">${metrics.memory.used}MB</p>
            </div>
          ` : ''}
        </div>

        ${perf.slowScripts && perf.slowScripts.length > 0 ? `
          <div class="slow-scripts">
            <h4>⚠️ Scripts lents (>500ms)</h4>
            <ul>
              ${perf.slowScripts.map(s => `
                <li><code>${s.name}</code> - ${s.duration}ms</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  },

  // Sentinel actions
  startSentinel() {
    AdminSentinel.start();
    setTimeout(() => this.refresh(), 2000);
  },

  stopSentinel() {
    AdminSentinel.stop();
    this.refresh();
  },

  runSentinelScan() {
    AdminSentinel.runFullScan();
    setTimeout(() => this.refresh(), 3000);
  },

  toggleAutoScan() {
    AdminSentinel.toggleAutoScan();
    setTimeout(() => this.refresh(), 500);
  },

  exportDiagnostic() {
    AdminSentinel.exportDiagnosticReport();
  }
};

window.AdminView = AdminView;
