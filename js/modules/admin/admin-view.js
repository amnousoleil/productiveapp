/**
 * Admin View Module v2.0 - Complete Monitoring Dashboard
 * @description Dashboard admin with bugs monitoring, analytics, performance
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

  async show() {
    console.log('[AdminView] Showing admin dashboard v2.0');

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
  },

  async init() {
    console.log('[AdminView] Initializing complete admin dashboard');
    await this.loadAllData();
    this.render();
    this.initCharts();
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

  async refresh() {
    Toast.info('Actualisation en cours...');
    await this.loadAllData();
    this.render();
    this.initCharts();
    Toast.success('Données actualisées');
  },

  render() {
    const container = document.querySelector('#view-admin');
    if (!container) return;

    container.innerHTML = `
      <div class="admin-dashboard">
        <!-- Header -->
        <div class="admin-header">
          <div>
            <h1>🛡️ Admin Dashboard</h1>
            <p class="admin-subtitle">Monitoring complet • Super-admin only</p>
          </div>
          <button class="btn-refresh" onclick="AdminView.refresh()">
            <span>🔄</span> Actualiser
          </button>
        </div>

        <!-- Real-time Stats Cards -->
        ${this.renderRealTimeStats()}

        <!-- Tabs Navigation -->
        <div class="admin-tabs">
          <button class="admin-tab active" onclick="AdminView.switchTab('bugs')">
            🐛 Bugs Monitoring
          </button>
          <button class="admin-tab" onclick="AdminView.switchTab('analytics')">
            📊 Analytics
          </button>
          <button class="admin-tab" onclick="AdminView.switchTab('performance')">
            ⚡ Performance
          </button>
          <button class="admin-tab" onclick="AdminView.switchTab('system')">
            🖥️ Système
          </button>
        </div>

        <!-- Tab Contents -->
        <div class="admin-tab-content active" data-tab="bugs">
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

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

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

        <!-- Filters -->
        <div class="bugs-filters">
          <select id="severityFilter" onchange="AdminView.filterBugs()">
            <option value="">Tous les niveaux</option>
            <option value="error">❌ Error</option>
            <option value="warning">⚠️ Warning</option>
            <option value="info">ℹ️ Info</option>
          </select>

          <select id="resolvedFilter" onchange="AdminView.filterBugs()">
            <option value="">Tous les statuts</option>
            <option value="false">Non résolus</option>
            <option value="true">Résolus</option>
          </select>

          <button class="btn-export" onclick="AdminView.exportErrorsCSV()">
            📥 Export CSV
          </button>
        </div>

        <!-- Errors Table -->
        ${this.renderErrorsTable(frontendErrors.errors)}
      </div>
    `;
  },

  renderErrorsTable(errors) {
    if (!errors || errors.length === 0) {
      return '<p class="empty">✅ Aucune erreur enregistrée</p>';
    }

    return `
      <div class="errors-table-container">
        <table class="errors-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Severity</th>
              <th>Message</th>
              <th>URL</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${errors.map(error => {
              const timestamp = new Date(error.timestamp).toLocaleString('fr-FR');
              const severityIcon = error.severity === 'error' ? '🔴' : error.severity === 'warning' ? '🟡' : '🔵';
              const resolved = error.metadata?.resolved === 'true';

              return `
                <tr class="${resolved ? 'error-resolved' : ''}">
                  <td>${timestamp}</td>
                  <td><span class="severity-badge severity-${error.severity}">${severityIcon} ${error.severity}</span></td>
                  <td class="error-message" title="${error.message}">${error.message.substring(0, 80)}${error.message.length > 80 ? '...' : ''}</td>
                  <td class="error-url" title="${error.url || '-'}">${error.url ? new URL(error.url).pathname : '-'}</td>
                  <td>${error.user_name || error.user_email || '-'}</td>
                  <td>
                    ${!resolved ? `
                      <button class="btn-resolve" onclick="AdminView.resolveError('${error.id}')">
                        ✅ Résoudre
                      </button>
                    ` : '<span class="resolved-badge">✅ Résolu</span>'}
                    <button class="btn-delete" onclick="AdminView.deleteError('${error.id}')">
                      🗑️
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
    const { health, stats, members } = this.data;
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
    const severity = document.getElementById('severityFilter').value;
    const resolved = document.getElementById('resolvedFilter').value;

    this.filters.severity = severity;
    this.filters.resolved = resolved === '' ? null : resolved === 'true';

    try {
      const frontendErrors = await AdminAPI.getFrontendErrors(this.filters);
      this.data.frontendErrors = frontendErrors;

      // Re-render errors table only
      const errorsTableContainer = document.querySelector('.errors-table-container');
      if (errorsTableContainer) {
        errorsTableContainer.parentElement.innerHTML = this.renderErrorsTable(frontendErrors.errors);
      }

      Toast.success('Filtres appliqués');
    } catch (error) {
      console.error('[AdminView] Filter bugs failed:', error);
      Toast.error('Erreur lors du filtrage');
    }
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
      Toast.success('Erreur supprimée');
      await this.refresh();
    } catch (error) {
      console.error('[AdminView] Delete error failed:', error);
      Toast.error('Erreur lors de la suppression');
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
  }
};

window.AdminView = AdminView;
