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
          <button class="admin-tab" onclick="AdminView.switchTab('users', event)">
            👥 Utilisateurs
          </button>
          <button class="admin-tab admin-tab-ai" onclick="AdminView.switchTab('ai-doctor', event)">
            🤖 IA Docteur
          </button>
          <button class="admin-tab admin-tab-reports" onclick="AdminView.switchTab('user-reports', event)">
            📋 Rapports
            <span class="reports-badge" id="reports-badge" style="display:none"></span>
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

        <div class="admin-tab-content" data-tab="users">
          <div id="admin-users-content">
            <div class="loading">Chargement utilisateurs...</div>
          </div>
        </div>

        <div class="admin-tab-content" data-tab="ai-doctor">
          ${this.renderAIDoctor()}
        </div>

        <div class="admin-tab-content" data-tab="user-reports">
          <div class="user-reports-section">
            <div class="ur-header">
              <h3>📋 Rapports de bugs utilisateurs</h3>
              <button class="btn-refresh-small" onclick="AdminView.loadUserReports()">🔄 Actualiser</button>
            </div>
            <div id="user-reports-container">
              <div class="loading">Chargement des rapports…</div>
            </div>
          </div>
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
      // Lazy-load users tab
      if (tabName === 'users' && typeof AdminUsers !== 'undefined') {
        const container = document.getElementById('admin-users-content');
        if (container) AdminUsers.render(container);
      }
      // Lazy-load user reports tab
      if (tabName === 'user-reports') {
        this.loadUserReports();
      }
      // Re-init charts for other tabs
      if (tabName !== 'users' && tabName !== 'user-reports') setTimeout(() => this.initCharts(), 100);
    }
  },

  async loadUserReports() {
    const container = document.getElementById('user-reports-container');
    if (!container) return;
    container.innerHTML = '<div class="loading">Chargement…</div>';

    try {
      const token = this._getToken();
      const res = await fetch('/api/v1/bug-reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const reports = await res.json();

      // Badge count
      const open = reports.filter(r => !['applied','rejected'].includes(r.status)).length;
      const badge = document.getElementById('reports-badge');
      if (badge) {
        badge.textContent = open;
        badge.style.display = open > 0 ? 'inline-flex' : 'none';
      }

      if (reports.length === 0) {
        container.innerHTML = '<div class="ur-empty">Aucun rapport de bug pour l\'instant.<br>Utilisez le bouton 🔴 en bas à droite de l\'app pour en créer un.</div>';
        return;
      }

      container.innerHTML = reports.map(r => this._renderReport(r)).join('');
    } catch (err) {
      container.innerHTML = `<div class="ur-error">Erreur: ${err.message}</div>`;
    }
  },

  _renderReport(r) {
    const statusColors = {
      open: '#6b7280', analyzing: '#f59e0b', fix_proposed: '#3b82f6',
      validated: '#8b5cf6', applied: '#22c55e', rejected: '#ef4444'
    };
    const statusLabels = {
      open: 'Ouvert', analyzing: 'Analyse IA…', fix_proposed: 'Fix proposé',
      validated: 'Validé', applied: 'Appliqué ✅', rejected: 'Rejeté'
    };
    const sevColors = { low:'#6b7280', medium:'#f59e0b', high:'#ef4444', critical:'#dc2626' };
    const color = statusColors[r.status] || '#6b7280';
    const sev = sevColors[r.severity] || '#6b7280';
    const date = new Date(r.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });

    return `
      <div class="ur-card" id="ur-${r.id}">
        <div class="ur-card-header">
          <div class="ur-card-meta">
            <span class="ur-badge" style="background:${color}22;color:${color};border-color:${color}44">${statusLabels[r.status] || r.status}</span>
            <span class="ur-badge" style="background:${sev}22;color:${sev};border-color:${sev}44">${r.severity}</span>
            <span class="ur-date">${date}</span>
            ${r.page_url ? `<span class="ur-page">${r.page_url}</span>` : ''}
          </div>
          <div class="ur-card-actions">
            ${r.status === 'fix_proposed' ? `
              <button class="ur-btn ur-btn-validate" onclick="AdminView.validateReport('${r.id}')">✅ Valider le fix</button>
              <button class="ur-btn ur-btn-reject" onclick="AdminView.rejectReport('${r.id}')">✕ Rejeter</button>
            ` : ''}
            ${r.status === 'validated' && r.proposed_fix_type !== 'manual' ? `
              <button class="ur-btn ur-btn-apply" onclick="AdminView.applyReport('${r.id}')">⚡ Appliquer</button>
            ` : ''}
          </div>
        </div>

        <h4 class="ur-title">${this._esc(r.title)}</h4>
        <p class="ur-desc">${this._esc(r.description)}</p>

        ${r.ai_analysis ? `
          <div class="ur-ai-block">
            <div class="ur-ai-label">🤖 Analyse IA</div>
            <p class="ur-ai-text">${this._esc(r.ai_analysis)}</p>
          </div>
        ` : r.status === 'analyzing' ? `
          <div class="ur-ai-block ur-analyzing">
            <div class="ur-ai-label">🤖 Analyse IA en cours…</div>
          </div>
        ` : ''}

        ${r.proposed_fix_description ? `
          <div class="ur-fix-block">
            <div class="ur-fix-label">🔧 Fix proposé <span class="ur-fix-type">${r.proposed_fix_type || ''}</span></div>
            <p class="ur-fix-text">${this._esc(r.proposed_fix_description)}</p>
            ${r.proposed_fix_file ? `<code class="ur-fix-file">${r.proposed_fix_file}</code>` : ''}
          </div>
        ` : ''}

        ${r.js_errors ? `
          <details class="ur-errors">
            <summary>Erreurs JS capturées</summary>
            <pre>${this._esc(r.js_errors)}</pre>
          </details>
        ` : ''}
      </div>
    `;
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  _getToken() {
    return localStorage.getItem('productiveapp_token') ||
           sessionStorage.getItem('productiveapp_token') || '';
  },

  async validateReport(id) {
    const token = this._getToken();
    const res = await fetch(`/api/v1/bug-reports/${id}/validate`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) { this.loadUserReports(); } else { alert('Erreur lors de la validation'); }
  },

  async rejectReport(id) {
    const token = this._getToken();
    const res = await fetch(`/api/v1/bug-reports/${id}/reject`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) { this.loadUserReports(); } else { alert('Erreur lors du rejet'); }
  },

  async applyReport(id) {
    if (!confirm('Appliquer ce fix automatiquement au fichier frontend ? Un backup sera créé.')) return;
    const token = this._getToken();
    const res = await fetch(`/api/v1/bug-reports/${id}/apply`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      alert(`✅ ${data.message}\nBackup: ${data.backup}`);
      this.loadUserReports();
    } else {
      alert('❌ Erreur: ' + (data.error || 'Impossible d\'appliquer le fix'));
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
                    ${error.url ? (() => { try { return new URL(error.url).pathname; } catch(e) { return error.url; } })() : '-'}
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

    const avgResponseTime = apiMetrics.avgLatency || apiMetrics.averageResponseTime || 0;
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
              <p class="perf-value">${apiMetrics.successRate ?? (100 - (apiMetrics.errorRate || 0))}%</p>
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
                  <span class="endpoint-path">${endpoint.path || endpoint.endpoint || '?'}</span>
                  <span class="endpoint-stats">${endpoint.count} requêtes • ${endpoint.avgResponseTime || endpoint.avgLatency || 0}ms moy</span>
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
  },

  // ===== IA DOCTEUR =====

  renderAIDoctor() {
    return `
      <div class="ai-doctor-panel">
        <div class="ai-doctor-header">
          <div class="ai-doctor-title">
            <span class="ai-doctor-icon">🤖</span>
            <div>
              <h2>IA Docteur Admin</h2>
              <p>Analyse ton rapport, diagnostique les bugs, propose un plan de guérison</p>
            </div>
          </div>
          <button class="ai-doctor-btn-context" onclick="AdminView.injectContextAndAnalyze()" title="Envoie tout le rapport actuel à l'IA">
            🔬 Analyser le rapport complet
          </button>
        </div>

        <!-- Quick action pills -->
        <div class="ai-doctor-quick-actions">
          <button class="ai-quick-pill" onclick="AdminView.aiQuickAction('heal')">🩺 Plan de guérison complet</button>
          <button class="ai-quick-pill" onclick="AdminView.aiQuickAction('bugs')">🐛 Expliquer les erreurs JS</button>
          <button class="ai-quick-pill" onclick="AdminView.aiQuickAction('perf')">⚡ Analyser les perfs</button>
          <button class="ai-quick-pill" onclick="AdminView.aiQuickAction('security')">🔒 Audit sécurité</button>
          <button class="ai-quick-pill" onclick="AdminView.aiQuickAction('missing')">📁 Fichiers manquants</button>
        </div>

        <!-- Chat messages -->
        <div class="ai-doctor-messages" id="ai-doctor-messages">
          <div class="ai-doctor-welcome">
            <div class="ai-welcome-icon">🤖</div>
            <h3>Bonjour, je suis ton IA Docteur Admin</h3>
            <p>Clique sur <strong>"Analyser le rapport complet"</strong> pour que j'examine tous tes logs, erreurs et métriques — ou pose-moi directement une question.</p>
          </div>
        </div>

        <!-- Input area -->
        <div class="ai-doctor-input-area">
          <textarea
            id="ai-doctor-input"
            class="ai-doctor-textarea"
            placeholder="Pose une question sur ton infra, les bugs, les perfs… (Entrée pour envoyer)"
            rows="2"
            onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();AdminView.sendAIMessage();}"
          ></textarea>
          <button class="ai-doctor-send-btn" onclick="AdminView.sendAIMessage()" id="ai-doctor-send-btn">
            <span>Envoyer</span> ➤
          </button>
        </div>
        <p class="ai-doctor-hint">Shift+Entrée pour saut de ligne • L'IA voit automatiquement tous tes logs admin</p>
      </div>
    `;
  },

  // Build a rich context string from all current admin data
  buildAdminContext() {
    const d = this.data;
    const lines = ['=== RAPPORT ADMIN PRODUCTIVEAPP ===\n'];

    // Health
    if (d.health) {
      const h = d.health;
      lines.push(`## SANTÉ SYSTÈME`);
      lines.push(`Status: ${h.status || 'unknown'}`);
      lines.push(`Uptime: ${h.uptime ? Math.round(h.uptime/3600) + 'h' : 'N/A'}`);
      lines.push(`DB: ${h.database?.status || 'N/A'}`);
      lines.push(`Mémoire utilisée: ${h.memory?.used || 'N/A'}MB / ${h.memory?.total || 'N/A'}MB\n`);
    }

    // Stats
    if (d.stats) {
      const s = d.stats;
      lines.push(`## STATISTIQUES`);
      lines.push(`Utilisateurs: ${s.totalUsers || 0}, Actifs: ${s.activeUsers || 0}`);
      lines.push(`Tâches: ${s.totalTasks || 0}, Notes: ${s.totalNotes || 0}`);
      lines.push(`Requêtes API aujourd'hui: ${s.requestsToday || 0}\n`);
    }

    // Frontend errors
    if (d.frontendErrorStats) {
      const fe = d.frontendErrorStats;
      lines.push(`## ERREURS FRONTEND`);
      lines.push(`Total: ${fe.total || 0}, Non résolues: ${fe.unresolved || 0}`);
      lines.push(`Critiques: ${fe.bySeverity?.critical || 0}, Erreurs: ${fe.bySeverity?.error || 0}, Warnings: ${fe.bySeverity?.warning || 0}\n`);
    }

    if (d.frontendErrors?.errors?.length > 0) {
      lines.push(`## DERNIÈRES ERREURS JS (${Math.min(d.frontendErrors.errors.length, 10)} premières)`);
      d.frontendErrors.errors.slice(0, 10).forEach((e, i) => {
        lines.push(`${i+1}. [${e.severity?.toUpperCase() || 'ERROR'}] ${e.message || 'N/A'}`);
        if (e.source) lines.push(`   → ${e.source}${e.line ? ':' + e.line : ''}`);
        if (e.user_agent) lines.push(`   Browser: ${e.user_agent.substring(0, 80)}`);
        if (e.count > 1) lines.push(`   Occurrences: ${e.count}x`);
      });
      lines.push('');
    }

    // API Metrics
    if (d.apiMetrics) {
      const m = d.apiMetrics;
      lines.push(`## MÉTRIQUES API`);
      lines.push(`Requêtes totales: ${m.totalRequests || 0}`);
      lines.push(`Taux d'erreur: ${m.errorRate || '0'}%`);
      lines.push(`Latence moyenne: ${m.avgLatency || 0}ms`);
      lines.push(`Endpoints lents: ${m.slowEndpoints?.length || 0}\n`);
    }

    if (d.topEndpoints?.length > 0) {
      lines.push(`## TOP ENDPOINTS (par usage)`);
      d.topEndpoints.slice(0, 8).forEach(ep => {
        lines.push(`  ${ep.method || 'GET'} ${ep.endpoint} — ${ep.count || 0} req, ${ep.avgLatency || 0}ms avg`);
      });
      lines.push('');
    }

    // Sentinel data
    const sentinel = AdminSentinel?.getLastReport?.();
    if (sentinel) {
      lines.push(`## SENTINEL SCAN`);
      if (sentinel.memoryUsage) lines.push(`Memory: ${sentinel.memoryUsage.used}MB / ${sentinel.memoryUsage.total}MB (${sentinel.memoryUsage.percentage}%)`);
      if (sentinel.criticalFiles) lines.push(`Fichiers critiques: ${sentinel.criticalFiles.ok}/${sentinel.criticalFiles.total} OK (${sentinel.criticalFiles.missing?.join(', ') || 'aucun manquant'})`);
      if (sentinel.cssConflicts) lines.push(`CSS Conflicts: ${sentinel.cssConflicts.count || 0}`);
      if (sentinel.apiTests) lines.push(`API Tests: ${sentinel.apiTests.passed}/${sentinel.apiTests.total} passés (avg ${sentinel.apiTests.avgResponseTime}ms)`);
      lines.push('');
    }

    // Analytics
    if (d.analyticsPages?.length > 0) {
      lines.push(`## PAGES LES PLUS VISITÉES`);
      d.analyticsPages.slice(0, 5).forEach(p => lines.push(`  ${p.page}: ${p.visits} visites`));
      lines.push('');
    }

    // Members
    if (d.members?.length > 0) {
      lines.push(`## ACTIVITÉ MEMBRES`);
      d.members.slice(0, 5).forEach(m => {
        lines.push(`  ${m.name || m.email}: dernière action ${m.lastActivity || 'N/A'}`);
      });
    }

    return lines.join('\n');
  },

  aiChatHistory: [],

  async sendAIMessage(customMessage) {
    const input = document.getElementById('ai-doctor-input');
    const message = customMessage || (input ? input.value.trim() : '');
    if (!message) return;

    // Clear input
    if (input && !customMessage) input.value = '';

    // Show user message
    this.appendAIMessage('user', message);

    // Disable send button
    const sendBtn = document.getElementById('ai-doctor-send-btn');
    if (sendBtn) { sendBtn.disabled = true; sendBtn.innerHTML = '<span>…</span>'; }

    // Show typing indicator
    const typingId = 'ai-typing-' + Date.now();
    this.appendAIMessage('typing', '', typingId);

    try {
      const context = this.buildAdminContext();
      const systemPrompt = `Tu es l'IA Docteur Admin de ProductiveApp, une application SaaS web.
Tu as accès au rapport complet de monitoring ci-dessous.
Tu dois analyser, diagnostiquer et proposer des solutions concrètes et actionnables.
Sois précis, technique, et utilise des émojis pour structurer tes réponses.
Réponds TOUJOURS en français.

${context}`;

      const fullMessage = message;
      this.aiChatHistory.push({ role: 'user', content: fullMessage });

      const result = await ApiAi.generate(fullMessage, systemPrompt);
      const reply = typeof result === 'string' ? result : (result?.content || result?.text || JSON.stringify(result));

      this.aiChatHistory.push({ role: 'assistant', content: reply });

      // Remove typing indicator and show response
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      this.appendAIMessage('assistant', reply);

    } catch (err) {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      this.appendAIMessage('error', `Erreur IA : ${err.message}`);
    }

    // Re-enable send button
    if (sendBtn) { sendBtn.disabled = false; sendBtn.innerHTML = '<span>Envoyer</span> ➤'; }
  },

  aiQuickAction(type) {
    const prompts = {
      heal: `🩺 Génère un PLAN DE GUÉRISON COMPLET pour cette application. Analyse tous les problèmes identifiés dans le rapport, priorise-les (Critique > Haute > Moyenne > Basse), et pour chacun donne : (1) explication claire du problème, (2) cause probable, (3) solution concrète avec les fichiers et lignes à modifier si possible.`,
      bugs: `🐛 Analyse en détail toutes les erreurs JavaScript listées dans le rapport. Pour chaque erreur : explique ce qu'elle signifie en langage clair, identifie le fichier source et la cause probable, et propose le fix exact.`,
      perf: `⚡ Analyse les métriques de performance : endpoints lents, latences API, usage mémoire. Identifie les goulots d'étranglement et propose des optimisations concrètes classées par impact.`,
      security: `🔒 Fais un audit de sécurité à partir de ces métriques. Y a-t-il des endpoints sursolicités (tentatives brute force) ? Des erreurs qui révèlent de l'info sensible ? Des patterns suspects dans les logs ?`,
      missing: `📁 Des fichiers critiques sont manquants selon le Sentinel. Explique l'impact de chaque fichier manquant et donne les commandes exactes pour les recréer ou les restaurer.`
    };
    this.sendAIMessage(prompts[type] || 'Analyse ce rapport admin.');
  },

  injectContextAndAnalyze() {
    const msg = `📋 Voici le rapport complet de l'application. Fais-moi un résumé exécutif en 5 points : ce qui va bien ✅, ce qui est problématique ⚠️, les bugs critiques 🔴, les recommandations prioritaires 🎯, et une note de santé globale de 0 à 10 avec justification.`;
    this.sendAIMessage(msg);
    // Switch to AI doctor tab
    this.switchTab('ai-doctor', null);
  },

  appendAIMessage(role, content, id) {
    const container = document.getElementById('ai-doctor-messages');
    if (!container) return;

    // Remove welcome message on first real message
    const welcome = container.querySelector('.ai-doctor-welcome');
    if (welcome && role !== 'typing') welcome.remove();

    const el = document.createElement('div');
    el.className = `ai-msg ai-msg-${role}`;
    if (id) el.id = id;

    if (role === 'typing') {
      el.innerHTML = `<div class="ai-msg-bubble"><span class="ai-typing-dots"><span></span><span></span><span></span></span></div>`;
    } else if (role === 'user') {
      el.innerHTML = `<div class="ai-msg-bubble">${this.escapeHtml(content)}</div>`;
    } else if (role === 'assistant') {
      // Convert markdown-style formatting to HTML
      const formatted = this.formatAIResponse(content);
      el.innerHTML = `<div class="ai-msg-avatar">🤖</div><div class="ai-msg-bubble">${formatted}</div>`;
    } else if (role === 'error') {
      el.innerHTML = `<div class="ai-msg-bubble ai-msg-error-bubble">⚠️ ${this.escapeHtml(content)}</div>`;
    }

    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  },

  formatAIResponse(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^#{1,3}\s+(.+)$/gm, '<h4>$1</h4>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/gs, '<ul>$&</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(?!<[hupb])(.+)/, '<p>$1')
      .replace(/([^>])$/, '$1</p>');
  },

  escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
};

window.AdminView = AdminView;
