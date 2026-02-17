/**
 * Admin Enhanced Features v1.0
 * @description Auto-refresh, alerts, cleanup tools
 */

const AdminEnhanced = {
  autoRefreshInterval: null,
  alertSound: null,

  /**
   * Enable auto-refresh every 30s
   */
  enableAutoRefresh() {
    if (this.autoRefreshInterval) return;

    console.log('[AdminEnhanced] Auto-refresh enabled (30s)');
    this.autoRefreshInterval = setInterval(async () => {
      console.log('[AdminEnhanced] Auto-refreshing data...');

      try {
        // Refresh silently (no toast)
        const oldErrors = AdminView.data.frontendErrorStats?.last24h || 0;
        await AdminView.loadAllData();
        AdminView.render();
        AdminView.initCharts();

        const newErrors = AdminView.data.frontendErrorStats?.last24h || 0;

        // Alert if new errors detected
        if (newErrors > oldErrors) {
          const diff = newErrors - oldErrors;
          this.showCriticalAlert(`⚠️ ${diff} nouvelle(s) erreur(s) détectée(s) !`);
        }

        // Update badge
        this.updateSidebarBadge(newErrors);
      } catch (error) {
        console.error('[AdminEnhanced] Auto-refresh failed:', error);
      }
    }, 30000); // 30s
  },

  /**
   * Disable auto-refresh
   */
  disableAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
      console.log('[AdminEnhanced] Auto-refresh disabled');
    }
  },

  /**
   * Show critical alert banner
   */
  showCriticalAlert(message) {
    const existing = document.querySelector('.admin-critical-alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = 'admin-critical-alert';
    alert.innerHTML = `
      <span class="alert-icon">🚨</span>
      <span class="alert-message">${message}</span>
      <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;

    const adminDashboard = document.querySelector('.admin-dashboard');
    if (adminDashboard) {
      adminDashboard.insertBefore(alert, adminDashboard.firstChild);
    }

    // Auto-dismiss after 10s
    setTimeout(() => alert.remove(), 10000);
  },

  /**
   * Update sidebar badge with error count
   */
  updateSidebarBadge(errorCount) {
    const adminNavItem = document.querySelector('[data-view="admin"]');
    if (!adminNavItem) return;

    let badge = adminNavItem.querySelector('.sidebar-badge');

    if (errorCount > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'sidebar-badge badge-error';
        adminNavItem.appendChild(badge);
      }
      badge.textContent = errorCount > 99 ? '99+' : errorCount;
      badge.style.display = 'inline-block';
    } else if (badge) {
      badge.style.display = 'none';
    }
  },

  /**
   * Clear all resolved errors from DB
   */
  async clearResolvedErrors() {
    if (!confirm('Supprimer toutes les erreurs résolues ? Cette action est irréversible.')) {
      return;
    }

    try {
      const errors = AdminView.data.frontendErrors?.errors || [];
      const resolved = errors.filter(e => e.resolved);

      if (resolved.length === 0) {
        Toast.info('Aucune erreur résolue à supprimer');
        return;
      }

      Toast.info(`Suppression de ${resolved.length} erreur(s) résolue(s)...`);

      // Delete each resolved error
      const promises = resolved.map(err => AdminAPI.deleteFrontendError(err.id));
      await Promise.all(promises);

      Toast.success(`${resolved.length} erreur(s) supprimée(s)`);
      await AdminView.refresh();
    } catch (error) {
      console.error('[AdminEnhanced] Clear resolved errors failed:', error);
      Toast.error('Erreur lors de la suppression');
    }
  },

  /**
   * Export bugs report as CSV
   */
  async exportBugsCSV() {
    try {
      Toast.info('Export en cours...');
      const csv = await AdminAPI.exportFrontendErrorsCSV();

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bugs-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Toast.success('Rapport exporté');
    } catch (error) {
      console.error('[AdminEnhanced] Export failed:', error);
      Toast.error('Erreur d\'export');
    }
  },

  /**
   * Quick filter by severity
   */
  quickFilter(severity) {
    const severityFilter = document.getElementById('severityFilter');
    if (severityFilter) {
      severityFilter.value = severity;
      AdminView.filterBugs();
    }
  },

  /**
   * Initialize enhanced features when admin view loads
   */
  init() {
    console.log('[AdminEnhanced] Initializing enhanced features');

    // Enable auto-refresh
    this.enableAutoRefresh();

    // Update sidebar badge on init
    const errorCount = AdminView.data?.frontendErrorStats?.last24h || 0;
    this.updateSidebarBadge(errorCount);

    // Cleanup on route change
    window.addEventListener('routeChange', (e) => {
      if (e.detail?.route !== 'admin') {
        this.disableAutoRefresh();
      }
    });
  }
};

// Auto-init when AdminView loads
if (typeof AdminView !== 'undefined') {
  const originalShow = AdminView.show;
  AdminView.show = async function() {
    await originalShow.call(this);
    setTimeout(() => AdminEnhanced.init(), 1000);
  };
}

// Expose globally
window.AdminEnhanced = AdminEnhanced;
