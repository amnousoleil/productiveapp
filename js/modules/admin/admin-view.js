/**
 * Admin View Module v1.0
 * @description Dashboard admin reserved for super-admin (contact@mahagiri.fr)
 */

const AdminView = {
  data: {
    health: null,
    stats: null,
    members: [],
    recentActivity: []
  },

  async show() {
    console.log('[AdminView] Showing admin dashboard');

    // Find or create admin container
    let container = document.querySelector('#view-admin');
    const mainContent = document.querySelector('.main-content');

    if (!mainContent) {
      console.error('[AdminView] .main-content not found');
      return;
    }

    if (!container) {
      // Create and inject admin container
      container = document.createElement('div');
      container.id = 'view-admin';
      container.className = 'view-container';
      mainContent.appendChild(container);
      console.log('[AdminView] Created #view-admin container');
    }

    // Ensure container is visible
    container.classList.add('active');

    await this.init();
  },

  async init() {
    console.log('[AdminView] Initializing admin dashboard');
    await this.loadAllData();
    this.render();
  },

  async loadAllData() {
    try {
      // Load all data in parallel
      const [health, stats, members, activity] = await Promise.all([
        AdminAPI.getHealth(),
        AdminAPI.getStats(),
        AdminAPI.getMemberActivity(),
        AdminAPI.getRecentActivity(15)
      ]);

      this.data.health = health;
      this.data.stats = stats;
      this.data.members = members;
      this.data.recentActivity = activity;

      console.log('[AdminView] Data loaded:', this.data);
    } catch (error) {
      console.error('[AdminView] Failed to load data:', error);
      Toast.error('Erreur de chargement des données admin');
    }
  },

  async refresh() {
    await this.loadAllData();
    this.render();
    Toast.success('Données actualisées');
  },

  render() {
    const container = document.querySelector('#view-admin');
    if (!container) {
      console.error('[AdminView] Container #view-admin not found');
      return;
    }

    container.innerHTML = `
      <div class="admin-dashboard">
        <!-- Header -->
        <div class="admin-header">
          <div>
            <h1>🛡️ Admin Dashboard</h1>
            <p class="admin-subtitle">Réservé au super-admin</p>
          </div>
          <button class="btn-refresh" onclick="AdminView.refresh()">
            <span>🔄</span> Actualiser
          </button>
        </div>

        <!-- System Health Card -->
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

        <!-- Recent Activity -->
        <div class="admin-section">
          <h2>📝 Activité récente</h2>
          ${this.renderRecentActivity()}
        </div>
      </div>
    `;
  },

  renderHealthCard() {
    const { health } = this.data;
    if (!health) return '<div class="loading">Chargement...</div>';

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
          <div class="health-item">
            <span class="health-icon">🕐</span>
            <div>
              <p class="health-value">${new Date(health.timestamp).toLocaleTimeString('fr-FR')}</p>
              <p class="health-label">Dernière vérification</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderStatsCards() {
    const { stats } = this.data;
    if (!stats) return '<div class="loading">Chargement...</div>';

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
        <span class="stat-icon">🏢</span>
        <div class="stat-content">
          <p class="stat-value">${stats.workspaces.total}</p>
          <p class="stat-label">Workspaces</p>
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

      <div class="stat-card">
        <span class="stat-icon">🔐</span>
        <div class="stat-content">
          <p class="stat-value">${stats.activity.logins_today}</p>
          <p class="stat-label">Connexions aujourd'hui</p>
          <p class="stat-sublabel">${stats.activity.logins_week} cette semaine</p>
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

  renderRecentActivity() {
    const { recentActivity } = this.data;
    if (!recentActivity || recentActivity.length === 0) return '<p class="empty">Aucune activité récente</p>';

    return `
      <div class="activity-list">
        ${recentActivity.map(activity => {
          const icon = activity.type === 'note' ? '📝' : activity.type === 'task' ? '✅' : '📁';
          const time = new Date(activity.timestamp).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          });

          return `
            <div class="activity-item">
              <span class="activity-icon">${icon}</span>
              <div class="activity-content">
                <p class="activity-action"><strong>${activity.member_name}</strong> : ${activity.action}</p>
                <p class="activity-time">${time}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};

window.AdminView = AdminView;
