/**
 * Admin Users Module v1.0
 * Onglet "Utilisateurs" du dashboard admin
 * Affiche membres, activité, et plans d'abonnement
 */

const AdminUsers = {

  _members: [],
  _stats: null,
  _filter: 'all', // all | active | inactive

  async render(container) {
    if (!container) return;
    container.innerHTML = this._skeleton();

    try {
      const [members, stats] = await Promise.all([
        AdminApi.getMemberActivity(),
        AdminApi.getStats()
      ]);
      this._members = members || [];
      this._stats = stats || {};
      container.innerHTML = this._renderFull();
      this._attachEvents(container);
    } catch (err) {
      console.error('[AdminUsers] Error:', err);
      container.innerHTML = `<div class="admin-error">Erreur chargement utilisateurs : ${err.message}</div>`;
    }
  },

  _skeleton() {
    return `<div style="padding:20px">
      ${[1,2,3].map(() => `<div class="skeleton" style="height:60px;margin-bottom:10px;border-radius:8px"></div>`).join('')}
    </div>`;
  },

  _renderFull() {
    const { users = {}, content = {} } = this._stats;
    const activeCount = this._members.filter(m => m.last_login && this._isRecent(m.last_login, 7)).length;

    return `
      <div class="admin-users-panel">

        <!-- KPIs -->
        <div class="users-kpis">
          <div class="users-kpi">
            <span class="kpi-value">${users.total || this._members.length}</span>
            <span class="kpi-label">Membres total</span>
          </div>
          <div class="users-kpi kpi-green">
            <span class="kpi-value">${users.active_today || 0}</span>
            <span class="kpi-label">Actifs aujourd'hui</span>
          </div>
          <div class="users-kpi kpi-blue">
            <span class="kpi-value">${activeCount}</span>
            <span class="kpi-label">Actifs cette semaine</span>
          </div>
          <div class="users-kpi kpi-purple">
            <span class="kpi-value">${content.notes || 0}</span>
            <span class="kpi-label">Notes créées</span>
          </div>
          <div class="users-kpi kpi-orange">
            <span class="kpi-value">${content.tasks || 0}</span>
            <span class="kpi-label">Tâches totales</span>
          </div>
        </div>

        <!-- Filtres -->
        <div class="users-toolbar">
          <div class="users-filters">
            <button class="filter-btn ${this._filter === 'all' ? 'active' : ''}" data-filter="all">Tous (${this._members.length})</button>
            <button class="filter-btn ${this._filter === 'active' ? 'active' : ''}" data-filter="active">Actifs 7j (${activeCount})</button>
            <button class="filter-btn ${this._filter === 'inactive' ? 'active' : ''}" data-filter="inactive">Inactifs (${this._members.length - activeCount})</button>
          </div>
        </div>

        <!-- Table membres -->
        <div class="users-table-wrap">
          <table class="users-table">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Dernière connexion</th>
                <th>Connexions / semaine</th>
                <th>Notes</th>
                <th>Tâches</th>
                <th>Projets</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${this._filteredMembers().map(m => this._renderRow(m)).join('')}
            </tbody>
          </table>
        </div>

        ${this._renderBillingNotice()}
      </div>`;
  },

  _renderRow(m) {
    const lastLogin = m.last_login ? this._timeAgo(m.last_login) : 'Jamais';
    const isActive = m.last_login && this._isRecent(m.last_login, 7);
    const isToday = m.last_login && this._isRecent(m.last_login, 1);

    const statusClass = isToday ? 'status-today' : isActive ? 'status-active' : 'status-inactive';
    const statusLabel = isToday ? 'Aujourd\'hui' : isActive ? 'Actif' : 'Inactif';

    const initials = (m.member_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return `
      <tr class="user-row">
        <td class="user-name-cell">
          <div class="user-avatar">${initials}</div>
          <span class="user-name">${this._escape(m.member_name || 'Inconnu')}</span>
        </td>
        <td class="user-login-cell">${lastLogin}</td>
        <td class="user-logins-cell">
          <span class="logins-count">${m.login_count_week || 0}</span>
        </td>
        <td class="user-notes-cell">${m.notes_count || 0}</td>
        <td class="user-tasks-cell">${m.tasks_count || 0}</td>
        <td class="user-projects-cell">${m.projects_count || 0}</td>
        <td class="user-status-cell">
          <span class="user-status ${statusClass}">${statusLabel}</span>
        </td>
      </tr>`;
  },

  _renderBillingNotice() {
    return `
      <div class="billing-notice">
        <div class="billing-notice-icon">💳</div>
        <div class="billing-notice-content">
          <strong>Plans d'abonnement</strong>
          <p>L'intégration Stripe est en place. Une fois les clés API configurées, les colonnes <code>subscription_plan</code> et <code>subscription_status</code> seront visibles ici pour chaque utilisateur.</p>
        </div>
      </div>`;
  },

  _filteredMembers() {
    if (this._filter === 'active') return this._members.filter(m => m.last_login && this._isRecent(m.last_login, 7));
    if (this._filter === 'inactive') return this._members.filter(m => !m.last_login || !this._isRecent(m.last_login, 7));
    return this._members;
  },

  _attachEvents(container) {
    container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._filter = btn.dataset.filter;
        container.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === this._filter));
        const tbody = container.querySelector('.users-table tbody');
        if (tbody) tbody.innerHTML = this._filteredMembers().map(m => this._renderRow(m)).join('');
      });
    });
  },

  _isRecent(dateStr, days) {
    const d = new Date(dateStr);
    return (Date.now() - d.getTime()) < days * 24 * 3600 * 1000;
  },

  _timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `il y a ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `il y a ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `il y a ${days}j`;
    return new Date(dateStr).toLocaleDateString('fr-FR');
  },

  _escape(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
};

window.AdminUsers = AdminUsers;
