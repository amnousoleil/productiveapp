/**
 * ADMIN ERRORS - Bug tracking UI
 */

const AdminErrors = {
  async render(container) {
    const [errors, stats] = await Promise.all([
      this.fetchErrors(),
      this.fetchStats(),
    ]);

    container.innerHTML = `
      <div class="admin-errors">
        <div class="admin-header">
          <h2>🐛 Bug Tracking</h2>
          <div class="admin-actions">
            <button id="refresh-errors-btn" class="btn-primary">🔄 Refresh</button>
            <button id="export-csv-btn" class="btn-secondary">📥 Export CSV</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card error">
            <span class="label">Errors</span>
            <span class="value">${stats.errors || 0}</span>
          </div>
          <div class="stat-card warning">
            <span class="label">Warnings</span>
            <span class="value">${stats.warnings || 0}</span>
          </div>
          <div class="stat-card success">
            <span class="label">Resolved</span>
            <span class="value">${stats.resolved || 0}</span>
          </div>
          <div class="stat-card info">
            <span class="label">Today</span>
            <span class="value">${stats.today || 0}</span>
          </div>
        </div>

        <table class="errors-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Message</th>
              <th>URL</th>
              <th>Severity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="errors-list">
            ${errors.map(e => `
              <tr data-id="${e.id}" class="${e.resolved ? 'resolved' : ''}">
                <td>${new Date(e.timestamp).toLocaleString()}</td>
                <td title="${e.stack || ''}">${e.message || 'Unknown error'}</td>
                <td>${e.url || '-'}</td>
                <td><span class="badge badge-${e.severity}">${e.severity}</span></td>
                <td>
                  <button class="btn-resolve" data-id="${e.id}">
                    ${e.resolved ? '✅' : '⬜'} Resolve
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.attachEvents();
  },

  attachEvents() {
    document.getElementById('refresh-errors-btn')?.addEventListener('click', () => {
      this.render(document.querySelector('.admin-errors')?.parentElement);
    });

    document.getElementById('export-csv-btn')?.addEventListener('click', () => {
      this.exportCSV();
    });

    document.querySelectorAll('.btn-resolve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.resolveError(id);
      });
    });
  },

  async fetchErrors() {
    try {
      const token = ApiTokens.getAccessToken();
      const res = await fetch('/api/v1/monitoring/errors?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error('Failed to fetch errors:', err);
      return [];
    }
  },

  async fetchStats() {
    try {
      const token = ApiTokens.getAccessToken();
      const res = await fetch('/api/v1/monitoring/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      return json.data || {};
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      return {};
    }
  },

  async resolveError(id) {
    try {
      const token = ApiTokens.getAccessToken();
      await fetch(`/api/v1/monitoring/errors/${id}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const row = document.querySelector(`tr[data-id="${id}"]`);
      if (row) row.classList.add('resolved');
      
      Toast.success('Error marked as resolved');
    } catch (err) {
      Toast.error('Failed to resolve error');
    }
  },

  async exportCSV() {
    try {
      const token = ApiTokens.getAccessToken();
      const res = await fetch('/api/v1/monitoring/errors/export/csv', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const csv = await res.text();
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `frontend-errors-${Date.now()}.csv`;
      a.click();
      
      Toast.success('CSV exported successfully');
    } catch (err) {
      Toast.error('Failed to export CSV');
    }
  },
};

window.AdminErrors = AdminErrors;
