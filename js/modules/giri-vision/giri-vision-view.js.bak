/**
 * Giri Vision v2.0 - Main View Controller
 * Premium video consultation interface
 * Theme-integrated, skeleton loading, smooth transitions
 */
const GiriVisionView = {
  currentTab: 'dashboard',
  dashboard: null,
  currentConsultation: null,
  jitsiApi: null,
  sessionTimer: null,
  sessionSeconds: 0,
  waitingInterval: null,
  notesVisible: true,
  _notesAutoSaveIndicator: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const container = document.getElementById('view-giri-vision');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const tab = e.target.closest('.gv-tab');
      if (tab) {
        this.switchTab(tab.dataset.tab);
        return;
      }

      const btn = e.target.closest('[data-gv-action]');
      if (btn) {
        e.stopPropagation();
        this.handleAction(btn.dataset.gvAction, btn.dataset);
        return;
      }
    });
  },

  async refresh() {
    this.render();
    this.switchTab(this.currentTab);
  },

  render() {
    const container = document.getElementById('view-giri-vision');
    if (!container) return;

    container.innerHTML = `
      <div class="gv-header">
        <div class="gv-logo">
          <div class="gv-logo-icon">\u{1F441}</div>
          <span class="gv-logo-text">Giri Vision</span>
        </div>
        <div class="gv-header-actions">
          <div class="gv-header-status">
            <span class="gv-status-dot"></span>
            <span>En ligne</span>
          </div>
        </div>
      </div>

      <div class="gv-tabs">
        <button class="gv-tab active" data-tab="dashboard">
          <span class="gv-tab-icon">\u{1F4CA}</span> Tableau de bord
        </button>
        <button class="gv-tab" data-tab="agenda">
          <span class="gv-tab-icon">\u{1F4C5}</span> Agenda
        </button>
        <button class="gv-tab" data-tab="therapists">
          <span class="gv-tab-icon">\u{1F9D1}\u{200D}\u{2695}\u{FE0F}</span> Th\u00e9rapeutes
        </button>
        <button class="gv-tab" data-tab="consultation">
          <span class="gv-tab-icon">\u{1F4F9}</span> Consultation
        </button>
        <button class="gv-tab" data-tab="reports">
          <span class="gv-tab-icon">\u{1F4DD}</span> Rapports
        </button>
      </div>

      <div class="gv-content">
        <div class="gv-tab-content active" data-content="dashboard"></div>
        <div class="gv-tab-content" data-content="agenda"></div>
        <div class="gv-tab-content" data-content="therapists"></div>
        <div class="gv-tab-content" data-content="consultation"></div>
        <div class="gv-tab-content" data-content="reports"></div>
      </div>

      <div class="gv-modal-overlay" id="gv-booking-modal">
        <div class="gv-modal" id="gv-booking-modal-content"></div>
      </div>
    `;
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    const container = document.getElementById('view-giri-vision');
    if (!container) return;

    container.querySelectorAll('.gv-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });
    container.querySelectorAll('.gv-tab-content').forEach(c => {
      const isTarget = c.dataset.content === tabName;
      c.classList.toggle('active', isTarget);
    });

    switch (tabName) {
      case 'dashboard': this.loadDashboard(); break;
      case 'agenda': this.loadAgenda(); break;
      case 'therapists': this.loadTherapists(); break;
      case 'consultation': this.loadConsultationRoom(); break;
      case 'reports': this.loadReports(); break;
    }
  },

  // =============================================
  // SKELETON LOADERS
  // =============================================

  _skeletonStats(count = 4) {
    return `<div class="gv-dashboard-grid">${
      Array(count).fill('').map(() => '<div class="gv-skeleton gv-skeleton-stat"></div>').join('')
    }</div>`;
  },

  _skeletonCards(count = 3) {
    return Array(count).fill('').map(() => '<div class="gv-skeleton gv-skeleton-card"></div>').join('');
  },

  _skeletonTherapists(count = 3) {
    return `<div class="gv-therapist-grid">${
      Array(count).fill('').map(() => `
        <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg, 16px);padding:24px">
          <div style="display:flex;gap:16px;margin-bottom:16px">
            <div class="gv-skeleton gv-skeleton-avatar"></div>
            <div style="flex:1">
              <div class="gv-skeleton gv-skeleton-line" style="width:60%;height:16px"></div>
              <div class="gv-skeleton gv-skeleton-line" style="width:40%;height:12px;margin-top:8px"></div>
            </div>
          </div>
          <div class="gv-skeleton gv-skeleton-line"></div>
          <div class="gv-skeleton gv-skeleton-line short"></div>
          <div class="gv-skeleton gv-skeleton-line" style="width:80%;margin-top:16px"></div>
        </div>
      `).join('')
    }</div>`;
  },

  // =============================================
  // DASHBOARD
  // =============================================

  async loadDashboard() {
    const el = document.querySelector('[data-content="dashboard"]');
    if (!el) return;

    // Show skeleton while loading
    el.innerHTML = this._skeletonStats() + this._skeletonCards(2);

    try {
      const data = await GiriApi.getDashboard();
      const dashboard = data.dashboard || data;
      this.dashboard = dashboard;
      this.renderDashboard(el, dashboard);
    } catch (err) {
      el.innerHTML = `
        <div class="gv-empty">
          <div class="gv-empty-icon">\u{1F3E5}</div>
          <div class="gv-empty-title">Bienvenue sur Giri Vision</div>
          <div class="gv-empty-text">
            Votre espace de consultation vid\u00e9o premium.<br>
            Configurez votre profil th\u00e9rapeute pour commencer \u00e0 recevoir des consultations.
          </div>
          <button class="gv-btn gv-btn-primary gv-btn-lg" data-gv-action="setup-profile">
            Configurer mon profil
          </button>
        </div>
      `;
    }
  },

  renderDashboard(el, d) {
    const stats = d.stats || {};
    const todaySessions = d.today_sessions || [];
    const pendingBookings = d.pending_bookings || [];

    const statCards = [
      {
        icon: '\u{1F4C8}',
        label: 'Sessions ce mois',
        value: stats.this_month_sessions || 0,
        trend: null
      },
      {
        icon: '\u{1F4B0}',
        label: 'Revenus ce mois',
        value: `<span class="gv-currency">${stats.this_month_revenue || 0} \u20ac</span>`,
        trend: null
      },
      {
        icon: '\u{1F3AF}',
        label: 'Total sessions',
        value: stats.total_sessions || 0,
        trend: null
      },
      {
        icon: '\u{2B50}',
        label: 'Note moyenne',
        value: `${stats.average_rating ? Number(stats.average_rating).toFixed(1) : '\u2013'} <span class="gv-currency">/ 5</span>`,
        trend: null
      }
    ];

    el.innerHTML = `
      <div class="gv-dashboard-grid">
        ${statCards.map(s => `
          <div class="gv-stat-card">
            <div class="gv-stat-icon">${s.icon}</div>
            <div class="gv-stat-label">${s.label}</div>
            <div class="gv-stat-value">${s.value}</div>
            ${s.trend ? `<div class="gv-stat-trend ${s.trend.dir}">${s.trend.dir === 'up' ? '\u2191' : '\u2193'} ${s.trend.value}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="gv-section-title">
        Aujourd'hui
        <span class="gv-badge">${todaySessions.length} session${todaySessions.length !== 1 ? 's' : ''}</span>
      </div>

      <div class="gv-session-list">
        ${todaySessions.length === 0 ? `
          <div class="gv-empty" style="padding:40px 20px">
            <div class="gv-empty-icon" style="font-size:36px">\u{1F4C5}</div>
            <div class="gv-empty-text">Aucune session pr\u00e9vue aujourd'hui</div>
            <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="new-consultation">
              Planifier une session
            </button>
          </div>
        ` : todaySessions.map(s => this.renderSessionCard(s)).join('')}
      </div>

      ${pendingBookings.length > 0 ? `
        <div class="gv-divider"></div>
        <div class="gv-section-title">
          Demandes en attente
          <span class="gv-badge">${pendingBookings.length}</span>
        </div>
        <div class="gv-session-list">
          ${pendingBookings.map(b => this._renderBookingCard(b)).join('')}
        </div>
      ` : ''}
    `;
  },

  _renderBookingCard(b) {
    const reqDate = new Date(b.requested_at);
    return `
      <div class="gv-session-card">
        <div class="gv-session-time">
          <div class="gv-session-hour">${reqDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
          <div class="gv-session-duration">${reqDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
        </div>
        <div class="gv-session-info">
          <div class="gv-session-client">${b.client_name || 'Client'}</div>
          <div class="gv-session-type">${b.client_message || 'Demande de consultation'}</div>
        </div>
        <div class="gv-session-actions">
          <button class="gv-btn gv-btn-success gv-btn-sm" data-gv-action="confirm-booking" data-booking-id="${b.id}">Accepter</button>
          <button class="gv-btn gv-btn-danger gv-btn-sm" data-gv-action="cancel-booking" data-booking-id="${b.id}">Refuser</button>
        </div>
      </div>
    `;
  },

  renderSessionCard(s) {
    const time = new Date(s.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const canJoin = s.status === 'waiting' || s.status === 'scheduled';
    return `
      <div class="gv-session-card">
        <div class="gv-session-time">
          <div class="gv-session-hour">${time}</div>
          <div class="gv-session-duration">${s.duration_minutes || 60}min</div>
        </div>
        <div class="gv-session-info">
          <div class="gv-session-client">${s.client_name || s.therapist_name || 'Participant'}</div>
          <div class="gv-session-type">Consultation vid\u00e9o</div>
        </div>
        <span class="gv-session-status ${s.status}">${this.statusLabel(s.status)}</span>
        ${canJoin ? `
          <button class="gv-btn gv-btn-primary gv-btn-sm" data-gv-action="join-session" data-consultation-id="${s.id}">
            Rejoindre
          </button>
        ` : ''}
      </div>
    `;
  },

  statusLabel(status) {
    const labels = {
      scheduled: 'Planifi\u00e9',
      waiting: 'En attente',
      in_progress: 'En cours',
      completed: 'Termin\u00e9',
      cancelled: 'Annul\u00e9',
      no_show: 'Absent'
    };
    return labels[status] || status;
  },

  // =============================================
  // AGENDA
  // =============================================

  async loadAgenda() {
    const el = document.querySelector('[data-content="agenda"]');
    if (!el) return;

    el.innerHTML = `
      <div class="gv-section-title">
        Mes consultations
        <button class="gv-btn gv-btn-primary gv-btn-sm" data-gv-action="new-consultation" style="margin-left:auto">+ Nouvelle</button>
      </div>
      ${this._skeletonCards(3)}
    `;

    try {
      const data = await GiriApi.listConsultations();
      const consultations = data.consultations || data || [];
      const upcoming = (Array.isArray(consultations) ? consultations : [])
        .filter(c => c.status !== 'cancelled' && c.status !== 'no_show')
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

      el.innerHTML = `
        <div class="gv-section-title">
          Mes consultations
          <span class="gv-badge">${upcoming.length}</span>
          <button class="gv-btn gv-btn-primary gv-btn-sm" data-gv-action="new-consultation" style="margin-left:auto">+ Nouvelle</button>
        </div>
        <div class="gv-session-list">
          ${upcoming.length === 0 ? `
            <div class="gv-empty" style="padding:40px 20px">
              <div class="gv-empty-icon">\u{1F4C5}</div>
              <div class="gv-empty-title">Aucune consultation</div>
              <div class="gv-empty-text">Planifiez votre premi\u00e8re consultation ou attendez les demandes de r\u00e9servation.</div>
            </div>
          ` : upcoming.map(s => this.renderSessionCard(s)).join('')}
        </div>
      `;
    } catch (err) {
      el.innerHTML = `
        <div class="gv-empty">
          <div class="gv-empty-icon">\u{26A0}\u{FE0F}</div>
          <div class="gv-empty-text">Erreur de chargement des consultations</div>
          <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="retry-agenda">R\u00e9essayer</button>
        </div>
      `;
    }
  },

  // =============================================
  // THERAPISTS CATALOG
  // =============================================

  async loadTherapists() {
    const el = document.querySelector('[data-content="therapists"]');
    if (!el) return;

    el.innerHTML = `
      <div class="gv-section-title">Th\u00e9rapeutes disponibles</div>
      ${this._skeletonTherapists()}
    `;

    try {
      const data = await GiriApi.listTherapists();
      const therapists = data.therapists || data || [];
      const list = Array.isArray(therapists) ? therapists : [];

      el.innerHTML = `
        <div class="gv-section-title">
          Th\u00e9rapeutes disponibles
          <span class="gv-badge">${list.length}</span>
        </div>
        <div class="gv-therapist-grid">
          ${list.length === 0 ? `
            <div class="gv-empty" style="grid-column:1/-1">
              <div class="gv-empty-icon">\u{1F9D1}\u{200D}\u{2695}\u{FE0F}</div>
              <div class="gv-empty-title">Aucun th\u00e9rapeute inscrit</div>
              <div class="gv-empty-text">Les th\u00e9rapeutes appara\u00eetront ici une fois leur profil configur\u00e9.</div>
              <button class="gv-btn gv-btn-primary" data-gv-action="setup-profile" style="margin-top:16px">
                Devenir th\u00e9rapeute
              </button>
            </div>
          ` : list.map(t => this.renderTherapistCard(t)).join('')}
        </div>
      `;
    } catch (err) {
      el.innerHTML = `
        <div class="gv-empty">
          <div class="gv-empty-icon">\u{26A0}\u{FE0F}</div>
          <div class="gv-empty-text">Erreur de chargement</div>
          <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="retry-therapists">R\u00e9essayer</button>
        </div>
      `;
    }
  },

  renderTherapistCard(t) {
    const initials = (t.user_name || 'T').substring(0, 2).toUpperCase();
    const specialties = (t.specialties || []).slice(0, 3);
    const rating = t.average_rating ? Number(t.average_rating).toFixed(1) : null;

    return `
      <div class="gv-therapist-card">
        <div class="gv-therapist-top">
          <div class="gv-therapist-avatar">${initials}</div>
          <div>
            <div class="gv-therapist-name">${t.user_name || 'Th\u00e9rapeute'}</div>
            <div class="gv-therapist-specialty">${specialties[0] || 'Th\u00e9rapeute'}</div>
            ${rating ? `
              <div class="gv-therapist-rating">
                \u{2B50} ${rating}
                <span style="color:var(--text-muted);font-size:11px;margin-left:4px">(${t.rating_count || 0} avis)</span>
              </div>
            ` : ''}
          </div>
        </div>
        ${t.bio ? `<div class="gv-therapist-bio">${t.bio}</div>` : ''}
        <div class="gv-therapist-tags">
          ${specialties.map(s => `<span class="gv-tag">${s}</span>`).join('')}
          ${(t.languages || []).map(l => `<span class="gv-tag">${l}</span>`).join('')}
        </div>
        <div class="gv-therapist-footer">
          <div class="gv-therapist-price">${t.hourly_rate || 0}\u20ac <span>/ ${t.session_duration_minutes || 60}min</span></div>
          <button class="gv-btn gv-btn-primary gv-btn-sm" data-gv-action="book-therapist" data-therapist-id="${t.id}">
            R\u00e9server
          </button>
        </div>
      </div>
    `;
  },

  // =============================================
  // CONSULTATION ROOM (Jitsi + Waiting Room)
  // =============================================

  async loadConsultationRoom() {
    const el = document.querySelector('[data-content="consultation"]');
    if (!el) return;

    if (this.currentConsultation) {
      this.renderVideoRoom(el);
      return;
    }

    el.innerHTML = `
      <div class="gv-empty">
        <div class="gv-empty-icon">\u{1F4F9}</div>
        <div class="gv-empty-title">Espace de consultation</div>
        <div class="gv-empty-text">
          S\u00e9lectionnez une session depuis le tableau de bord ou l'agenda pour d\u00e9marrer votre consultation vid\u00e9o.
        </div>
        <button class="gv-btn gv-btn-secondary" data-gv-action="back-dashboard">
          Voir le tableau de bord
        </button>
      </div>
    `;
  },

  async joinSession(consultationId) {
    if (!consultationId) return;

    // Show loading in consultation tab
    this.switchTab('consultation');
    const el = document.querySelector('[data-content="consultation"]');
    if (el) {
      el.innerHTML = `
        <div class="gv-empty">
          <div class="gv-empty-icon" style="font-size:36px">\u{23F3}</div>
          <div class="gv-empty-title">Connexion en cours...</div>
        </div>
      `;
    }

    try {
      const data = await GiriApi.getConsultation(consultationId);
      const consultation = data.consultation || data;
      this.currentConsultation = consultation;

      if (consultation.status === 'scheduled') {
        await GiriApi.joinWaitingRoom(consultationId);
        this.currentConsultation.status = 'waiting';
      }

      if (this.currentConsultation.status === 'waiting') {
        this.renderWaitingRoom();
      } else {
        this.startVideoSession();
      }
    } catch (err) {
      if (window.Toast) Toast.error('Impossible de rejoindre la session');
      if (el) {
        el.innerHTML = `
          <div class="gv-empty">
            <div class="gv-empty-icon">\u{26A0}\u{FE0F}</div>
            <div class="gv-empty-title">Connexion \u00e9chou\u00e9e</div>
            <div class="gv-empty-text">${err.message || 'Impossible de rejoindre la session'}</div>
            <button class="gv-btn gv-btn-secondary" data-gv-action="back-dashboard">Retour</button>
          </div>
        `;
      }
    }
  },

  renderWaitingRoom() {
    const el = document.querySelector('[data-content="consultation"]');
    if (!el) return;
    const c = this.currentConsultation;

    el.innerHTML = `
      <div class="gv-waiting-room">
        <div class="gv-waiting-avatar">\u{1F9D1}\u{200D}\u{2695}\u{FE0F}</div>
        <div class="gv-waiting-title">${c.therapist_name || c.client_name || 'Votre session'}</div>
        <div class="gv-waiting-subtitle">Votre th\u00e9rapeute va vous accueillir dans un instant...</div>
        <div class="gv-waiting-timer" id="gv-waiting-timer">--:--</div>
        <div class="gv-waiting-breathing">
          <div class="gv-waiting-breathing-text">Respirez profond\u00e9ment...</div>
          <div class="gv-waiting-breathing-circle"></div>
          <div class="gv-waiting-breathing-text" style="font-size:12px;opacity:0.6">
            Inspirez 4s... Retenez 4s... Expirez 4s...
          </div>
        </div>
        <button class="gv-btn gv-btn-primary gv-btn-lg" style="margin-top:32px" data-gv-action="start-video">
          D\u00e9marrer la visio
        </button>
      </div>
    `;

    this.startWaitingTimer();
  },

  startWaitingTimer() {
    if (this.waitingInterval) clearInterval(this.waitingInterval);
    const scheduledAt = new Date(this.currentConsultation.scheduled_at).getTime();

    this.waitingInterval = setInterval(() => {
      const now = Date.now();
      const diff = scheduledAt - now;
      const timerEl = document.getElementById('gv-waiting-timer');
      if (!timerEl) { clearInterval(this.waitingInterval); return; }

      if (diff <= 0) {
        timerEl.textContent = "C'est l'heure !";
        timerEl.style.color = 'var(--success)';
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    }, 1000);
  },

  async startVideoSession() {
    if (this.waitingInterval) clearInterval(this.waitingInterval);
    const c = this.currentConsultation;

    try {
      if (c.status !== 'in_progress') {
        await GiriApi.startConsultation(c.id);
        this.currentConsultation.status = 'in_progress';
      }
    } catch (e) {
      // May already be started
    }

    this.renderVideoRoom(document.querySelector('[data-content="consultation"]'));
  },

  renderVideoRoom(el) {
    if (!el) return;
    const c = this.currentConsultation;

    el.innerHTML = `
      <div class="gv-video-room active">
        <div class="gv-video-toolbar">
          <div class="gv-video-info">
            <span class="gv-video-timer" id="gv-session-timer">00:00:00</span>
            <span class="gv-video-client-name">${c.client_name || c.therapist_name || 'Session'}</span>
          </div>
          <div class="gv-video-controls">
            <button class="gv-btn gv-btn-ghost gv-btn-sm" data-gv-action="toggle-recording" title="Enregistrement">
              \u{23FA}\u{FE0F} REC
            </button>
            <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="toggle-notes">
              \u{1F4DD} Notes
            </button>
            <button class="gv-btn gv-btn-danger gv-btn-sm" data-gv-action="end-session" data-consultation-id="${c.id}">
              Terminer
            </button>
          </div>
        </div>
        <div class="gv-video-main">
          <div class="gv-video-container" id="gv-jitsi-container"></div>
          <div class="gv-notes-panel" id="gv-notes-panel">
            <div class="gv-notes-header">
              <span>\u{1F4DD} Notes de s\u00e9ance</span>
              <span class="gv-autosave-indicator" id="gv-autosave-status"></span>
            </div>
            <textarea class="gv-notes-textarea" id="gv-session-notes" placeholder="Prenez vos notes ici pendant la s\u00e9ance...\n\nConseils :\n\u2022 Th\u00e8mes abord\u00e9s\n\u2022 \u00c9motions observ\u00e9es\n\u2022 Points cl\u00e9s\n\u2022 Actions \u00e0 suivre">${c.therapist_notes || ''}</textarea>
            <div class="gv-notes-quick-tags">
              <span class="gv-notes-quick-tag" data-tag="[IMPORTANT] ">\u{26A0} Important</span>
              <span class="gv-notes-quick-tag" data-tag="[ACTION] ">\u{2705} Action</span>
              <span class="gv-notes-quick-tag" data-tag="[EMOTION] ">\u{1F49C} \u00c9motion</span>
              <span class="gv-notes-quick-tag" data-tag="[SUIVI] ">\u{1F4CB} Suivi</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind quick tag clicks
    el.querySelectorAll('.gv-notes-quick-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const textarea = document.getElementById('gv-session-notes');
        if (textarea) {
          const prefix = tag.dataset.tag;
          const pos = textarea.selectionStart;
          const before = textarea.value.substring(0, pos);
          const after = textarea.value.substring(pos);
          textarea.value = before + prefix + after;
          textarea.focus();
          textarea.setSelectionRange(pos + prefix.length, pos + prefix.length);
        }
      });
    });

    this.initJitsi(c.room_name);
    this.startSessionTimer();
  },

  initJitsi(roomName) {
    const container = document.getElementById('gv-jitsi-container');
    if (!container) return;

    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => this.createJitsiRoom(roomName, container);
      script.onerror = () => {
        container.innerHTML = `
          <div class="gv-empty" style="height:100%;background:var(--bg-primary)">
            <div class="gv-empty-icon">\u{26A0}\u{FE0F}</div>
            <div class="gv-empty-title">Erreur de chargement vid\u00e9o</div>
            <div class="gv-empty-text">Impossible de charger le service de visioconf\u00e9rence.</div>
          </div>
        `;
      };
      document.head.appendChild(script);
    } else {
      this.createJitsiRoom(roomName, container);
    }
  },

  createJitsiRoom(roomName, container) {
    if (this.jitsiApi) {
      this.jitsiApi.dispose();
    }

    const userName = AppState.currentMember?.name || 'Utilisateur';

    this.jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
      roomName: roomName,
      parentNode: container,
      width: '100%',
      height: '100%',
      userInfo: {
        displayName: userName,
      },
      configOverrides: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        toolbarButtons: [
          'microphone', 'camera', 'desktop', 'chat',
          'fullscreen', 'settings', 'tileview',
        ],
        hideConferenceSubject: true,
        hideConferenceTimer: true,
        disableInviteFunctions: true,
        disableJoinLeaveSounds: false,
        enableWelcomePage: false,
        enableClosePage: false,
      },
      interfaceConfigOverrides: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DEFAULT_BACKGROUND: '#111118',
        TOOLBAR_ALWAYS_VISIBLE: true,
        DISABLE_FOCUS_INDICATOR: true,
      },
    });

    this.jitsiApi.addEventListener('videoConferenceLeft', () => {
      this.endSession();
    });
  },

  startSessionTimer() {
    this.sessionSeconds = 0;
    if (this.sessionTimer) clearInterval(this.sessionTimer);

    this.sessionTimer = setInterval(() => {
      this.sessionSeconds++;
      const h = Math.floor(this.sessionSeconds / 3600);
      const m = Math.floor((this.sessionSeconds % 3600) / 60);
      const s = this.sessionSeconds % 60;
      const timerEl = document.getElementById('gv-session-timer');
      if (timerEl) {
        timerEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }

      // Auto-save notes every 30s
      if (this.sessionSeconds % 30 === 0) {
        this.autoSaveNotes();
      }
    }, 1000);
  },

  async autoSaveNotes() {
    if (!this.currentConsultation) return;
    const notesEl = document.getElementById('gv-session-notes');
    if (!notesEl) return;

    const indicator = document.getElementById('gv-autosave-status');

    try {
      await GiriApi.updateConsultation(this.currentConsultation.id, {
        therapist_notes: notesEl.value,
      });
      if (indicator) {
        indicator.textContent = 'Sauvegard\u00e9';
        indicator.classList.add('saved');
        setTimeout(() => {
          if (indicator) {
            indicator.textContent = '';
            indicator.classList.remove('saved');
          }
        }, 3000);
      }
    } catch (e) {
      if (indicator) indicator.textContent = 'Erreur sauvegarde';
    }
  },

  async endSession() {
    if (!this.currentConsultation) return;
    const consultationId = this.currentConsultation.id;

    // Save final notes
    await this.autoSaveNotes();

    // End consultation
    try {
      await GiriApi.endConsultation(consultationId);
    } catch (e) {
      // May already be ended
    }

    // Dispose Jitsi
    if (this.jitsiApi) {
      this.jitsiApi.dispose();
      this.jitsiApi = null;
    }

    // Stop timers
    if (this.sessionTimer) clearInterval(this.sessionTimer);
    if (this.waitingInterval) clearInterval(this.waitingInterval);

    const durationMin = Math.floor(this.sessionSeconds / 60);

    // Show post-session screen immediately
    const el = document.querySelector('[data-content="consultation"]');
    if (el) {
      el.innerHTML = `
        <div class="gv-empty">
          <div class="gv-empty-icon" style="font-size:56px">\u{2705}</div>
          <div class="gv-empty-title">Session termin\u00e9e</div>
          <div class="gv-empty-text">
            Dur\u00e9e : ${durationMin} minute${durationMin !== 1 ? 's' : ''}<br>
            <span style="color:var(--accent)" id="gv-report-generating">G\u00e9n\u00e9ration du rapport IA en cours...</span>
          </div>
          <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;justify-content:center">
            <button class="gv-btn gv-btn-primary" data-gv-action="view-report" data-consultation-id="${consultationId}">
              \u{1F4DD} Voir le rapport
            </button>
            <button class="gv-btn gv-btn-secondary" data-gv-action="back-dashboard">
              Retour au tableau de bord
            </button>
          </div>
        </div>
      `;
    }

    // Generate AI report in background
    try {
      await GiriApi.generateReport(consultationId);
      const genEl = document.getElementById('gv-report-generating');
      if (genEl) genEl.textContent = 'Rapport IA g\u00e9n\u00e9r\u00e9 avec succ\u00e8s !';
    } catch (e) {
      const genEl = document.getElementById('gv-report-generating');
      if (genEl) genEl.textContent = 'Le rapport pourra \u00eatre g\u00e9n\u00e9r\u00e9 depuis l\'onglet Rapports.';
    }

    this.currentConsultation = null;
    this.sessionSeconds = 0;
  },

  // =============================================
  // REPORTS
  // =============================================

  async loadReports() {
    const el = document.querySelector('[data-content="reports"]');
    if (!el) return;

    el.innerHTML = `
      <div class="gv-section-title">Rapports de s\u00e9ances</div>
      ${this._skeletonCards(3)}
    `;

    try {
      const data = await GiriApi.listConsultations();
      const consultations = data.consultations || data || [];
      const completed = (Array.isArray(consultations) ? consultations : [])
        .filter(c => c.status === 'completed')
        .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

      el.innerHTML = `
        <div class="gv-section-title">
          Rapports de s\u00e9ances
          <span class="gv-badge">${completed.length}</span>
        </div>
        ${completed.length === 0 ? `
          <div class="gv-empty">
            <div class="gv-empty-icon">\u{1F4DD}</div>
            <div class="gv-empty-title">Aucun rapport</div>
            <div class="gv-empty-text">Les rapports appara\u00eetront ici apr\u00e8s vos premi\u00e8res consultations.</div>
          </div>
        ` : completed.map(c => this._renderReportCard(c)).join('')}
      `;
    } catch (err) {
      el.innerHTML = `
        <div class="gv-empty">
          <div class="gv-empty-icon">\u{26A0}\u{FE0F}</div>
          <div class="gv-empty-text">Erreur de chargement des rapports</div>
          <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="retry-reports">R\u00e9essayer</button>
        </div>
      `;
    }
  },

  _renderReportCard(c) {
    const dateStr = new Date(c.scheduled_at).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const duration = c.actual_duration_minutes || c.duration_minutes || '?';

    return `
      <div class="gv-report-card">
        <div class="gv-report-header">
          <div>
            <strong style="color:var(--text)">${c.client_name || c.therapist_name || 'Session'}</strong>
            <div class="gv-report-date">${dateStr}</div>
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0">
            <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="view-report" data-consultation-id="${c.id}">
              Voir rapport
            </button>
            ${!c.has_report ? `
              <button class="gv-btn gv-btn-primary gv-btn-sm" data-gv-action="generate-report" data-consultation-id="${c.id}">
                G\u00e9n\u00e9rer IA
              </button>
            ` : ''}
          </div>
        </div>
        <div style="display:flex;gap:16px;font-size:12px;color:var(--text-muted)">
          <span>Dur\u00e9e : ${duration} min</span>
          ${c.client_rating ? `<span>\u{2B50} ${c.client_rating}/5</span>` : ''}
        </div>
      </div>
    `;
  },

  async viewReport(consultationId) {
    try {
      const data = await GiriApi.getReport(consultationId);
      const report = data.report || data;
      if (!report || !report.ai_summary) {
        if (window.Toast) Toast.info('G\u00e9n\u00e9ration du rapport IA...');
        await GiriApi.generateReport(consultationId);
        const res = await GiriApi.getReport(consultationId);
        const r = res.report || res;
        if (r) this.showReportModal(r);
        return;
      }
      this.showReportModal(report);
    } catch (err) {
      if (window.Toast) Toast.error('Erreur lors du chargement du rapport');
    }
  },

  showReportModal(report) {
    const overlay = document.getElementById('gv-booking-modal');
    const content = document.getElementById('gv-booking-modal-content');
    if (!overlay || !content) return;

    const themes = report.ai_key_themes || [];
    const actions = report.ai_action_items || [];

    content.innerHTML = `
      <div class="gv-modal-header">
        <div class="gv-modal-title">Rapport de s\u00e9ance IA</div>
        <div class="gv-modal-close" data-gv-action="close-modal">\u{2715}</div>
      </div>

      <div class="gv-report-section">
        <div class="gv-report-section-title">\u{1F4CB} R\u00e9sum\u00e9</div>
        <div class="gv-report-text">${report.ai_summary || 'Aucun r\u00e9sum\u00e9 disponible'}</div>
      </div>

      ${themes.length > 0 ? `
        <div class="gv-report-section">
          <div class="gv-report-section-title">\u{1F3AF} Th\u00e8mes abord\u00e9s</div>
          <div class="gv-report-themes">
            ${themes.map(t => `<span class="gv-report-theme">${t}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${actions.length > 0 ? `
        <div class="gv-report-section">
          <div class="gv-report-section-title">\u{2705} Actions recommand\u00e9es</div>
          <div class="gv-report-actions">
            ${actions.map(a => `
              <div class="gv-report-action-item">
                <span class="gv-check">\u{25CB}</span>
                <span>${a}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="gv-divider"></div>

      <div class="gv-report-section">
        <div class="gv-report-section-title">\u{1F4AC} R\u00e9sum\u00e9 pour le client</div>
        <textarea class="gv-form-textarea" id="gv-client-summary" placeholder="R\u00e9digez le r\u00e9sum\u00e9 \u00e0 envoyer au client...">${report.client_summary || ''}</textarea>
      </div>

      <div style="display:flex;gap:12px;margin-top:24px">
        <button class="gv-btn gv-btn-primary" data-gv-action="close-modal">Fermer</button>
      </div>
    `;

    overlay.classList.add('active');
  },

  // =============================================
  // BOOKING FLOW
  // =============================================

  async openBooking(therapistId) {
    const overlay = document.getElementById('gv-booking-modal');
    const content = document.getElementById('gv-booking-modal-content');
    if (!overlay || !content) return;

    const todayStr = new Date().toISOString().split('T')[0];

    content.innerHTML = `
      <div class="gv-modal-header">
        <div class="gv-modal-title">R\u00e9server une consultation</div>
        <div class="gv-modal-close" data-gv-action="close-modal">\u{2715}</div>
      </div>

      <div class="gv-form-group">
        <label class="gv-form-label">Date</label>
        <input type="date" class="gv-form-input" id="gv-booking-date" min="${todayStr}">
      </div>
      <div class="gv-form-group">
        <label class="gv-form-label">Cr\u00e9neaux disponibles</label>
        <div class="gv-time-slots" id="gv-time-slots">
          <div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted);font-size:13px">
            S\u00e9lectionnez une date pour voir les cr\u00e9neaux
          </div>
        </div>
      </div>
      <div class="gv-form-group">
        <label class="gv-form-label">Message (optionnel)</label>
        <textarea class="gv-form-textarea" id="gv-booking-message" placeholder="D\u00e9crivez bri\u00e8vement votre besoin..."></textarea>
        <div class="gv-form-hint">Ce message sera visible par le th\u00e9rapeute</div>
      </div>
      <div style="display:flex;gap:12px;margin-top:24px">
        <button class="gv-btn gv-btn-primary" id="gv-booking-submit" disabled data-gv-action="submit-booking" data-therapist-id="${therapistId}">
          R\u00e9server
        </button>
        <button class="gv-btn gv-btn-secondary" data-gv-action="close-modal">Annuler</button>
      </div>
    `;

    overlay.classList.add('active');

    // Listen for date change
    const dateInput = document.getElementById('gv-booking-date');
    dateInput?.addEventListener('change', async (e) => {
      const slotsEl = document.getElementById('gv-time-slots');
      if (!slotsEl) return;
      slotsEl.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:20px">
          <div class="gv-skeleton" style="height:36px;margin-bottom:8px"></div>
          <div class="gv-skeleton" style="height:36px;margin-bottom:8px"></div>
          <div class="gv-skeleton" style="height:36px"></div>
        </div>
      `;

      try {
        const data = await GiriApi.getAvailableSlots(therapistId, e.target.value);
        const slots = data.slots || data || [];
        if (slots.length === 0) {
          slotsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted);font-size:13px">Aucun cr\u00e9neau disponible ce jour</div>';
          return;
        }
        slotsEl.innerHTML = slots.map(s => `
          <div class="gv-time-slot" data-time="${e.target.value}T${s.start}:00.000Z">${s.start} - ${s.end}</div>
        `).join('');

        slotsEl.querySelectorAll('.gv-time-slot').forEach(slot => {
          slot.addEventListener('click', () => {
            slotsEl.querySelectorAll('.gv-time-slot').forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            const submitBtn = document.getElementById('gv-booking-submit');
            if (submitBtn) submitBtn.disabled = false;
          });
        });
      } catch (err) {
        slotsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--danger);font-size:13px">Erreur de chargement des cr\u00e9neaux</div>';
      }
    });
  },

  async submitBooking(therapistId) {
    const selectedSlot = document.querySelector('.gv-time-slot.selected');
    const message = document.getElementById('gv-booking-message')?.value;
    const submitBtn = document.getElementById('gv-booking-submit');

    if (!selectedSlot) return;

    // Show loading
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    try {
      await GiriApi.createBooking({
        therapist_id: therapistId,
        requested_at: selectedSlot.dataset.time,
        client_message: message || undefined,
      });

      this.closeModal();
      if (window.Toast) Toast.success('Demande de r\u00e9servation envoy\u00e9e !');
    } catch (err) {
      if (window.Toast) Toast.error('Erreur lors de la r\u00e9servation');
      if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    }
  },

  // =============================================
  // PROFILE SETUP
  // =============================================

  async setupProfile() {
    const overlay = document.getElementById('gv-booking-modal');
    const content = document.getElementById('gv-booking-modal-content');
    if (!overlay || !content) return;

    content.innerHTML = `
      <div class="gv-modal-header">
        <div class="gv-modal-title">Profil th\u00e9rapeute</div>
        <div class="gv-modal-close" data-gv-action="close-modal">\u{2715}</div>
      </div>

      <div class="gv-profile-setup-header" style="text-align:center;margin-bottom:24px">
        <div class="gv-profile-setup-icon" style="width:64px;height:64px;border-radius:50%;background:color-mix(in srgb, var(--accent) 12%, transparent);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px;border:2px solid color-mix(in srgb, var(--accent) 20%, transparent)">
          \u{1F9D1}\u{200D}\u{2695}\u{FE0F}
        </div>
        <div style="font-size:13px;color:var(--text-muted)">
          Cr\u00e9ez votre profil pour commencer \u00e0 recevoir des consultations
        </div>
      </div>

      <div class="gv-form-group">
        <label class="gv-form-label">Sp\u00e9cialit\u00e9s</label>
        <input type="text" class="gv-form-input" id="gv-profile-specialties" placeholder="Psychologie, Th\u00e9rapie cognitive, Gestion du stress...">
        <div class="gv-form-hint">S\u00e9par\u00e9es par des virgules</div>
      </div>
      <div class="gv-form-group">
        <label class="gv-form-label">Bio</label>
        <textarea class="gv-form-textarea" id="gv-profile-bio" placeholder="Pr\u00e9sentez-vous en quelques lignes..."></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="gv-form-group">
          <label class="gv-form-label">Tarif horaire (\u20ac)</label>
          <input type="number" class="gv-form-input" id="gv-profile-rate" placeholder="80" min="0">
        </div>
        <div class="gv-form-group">
          <label class="gv-form-label">Dur\u00e9e session (min)</label>
          <input type="number" class="gv-form-input" id="gv-profile-duration" value="60" min="15" max="180">
        </div>
      </div>
      <div class="gv-form-group">
        <label class="gv-form-label">Ann\u00e9es d'exp\u00e9rience</label>
        <input type="number" class="gv-form-input" id="gv-profile-exp" placeholder="5" min="0">
      </div>
      <div style="display:flex;gap:12px;margin-top:24px">
        <button class="gv-btn gv-btn-primary" id="gv-save-profile-btn" data-gv-action="save-profile">
          Cr\u00e9er mon profil
        </button>
        <button class="gv-btn gv-btn-secondary" data-gv-action="close-modal">Annuler</button>
      </div>
    `;

    overlay.classList.add('active');
  },

  async saveProfile() {
    const btn = document.getElementById('gv-save-profile-btn');
    const specialties = document.getElementById('gv-profile-specialties')?.value
      .split(',').map(s => s.trim()).filter(Boolean) || [];
    const bio = document.getElementById('gv-profile-bio')?.value || '';
    const hourly_rate = parseFloat(document.getElementById('gv-profile-rate')?.value) || 0;
    const session_duration_minutes = parseInt(document.getElementById('gv-profile-duration')?.value) || 60;
    const experience_years = parseInt(document.getElementById('gv-profile-exp')?.value) || 0;

    if (btn) { btn.classList.add('loading'); btn.disabled = true; }

    try {
      await GiriApi.createProfile({ specialties, bio, hourly_rate, session_duration_minutes, experience_years });
      this.closeModal();
      if (window.Toast) Toast.success('Profil th\u00e9rapeute cr\u00e9\u00e9 !');
      this.loadDashboard();
    } catch (err) {
      if (window.Toast) Toast.error('Erreur lors de la cr\u00e9ation du profil');
      if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
    }
  },

  // =============================================
  // RECORDING TOGGLE
  // =============================================

  async toggleRecording() {
    if (!this.currentConsultation) return;
    const timerEl = document.getElementById('gv-session-timer');

    try {
      if (timerEl && !timerEl.classList.contains('recording')) {
        await GiriApi.startRecording(this.currentConsultation.id);
        timerEl.classList.add('recording');
        if (window.Toast) Toast.success('Enregistrement d\u00e9marr\u00e9');
      } else {
        timerEl?.classList.remove('recording');
        if (window.Toast) Toast.info('Enregistrement arr\u00eat\u00e9');
      }
    } catch (err) {
      if (window.Toast) Toast.error('Erreur enregistrement');
    }
  },

  // =============================================
  // ACTION HANDLER
  // =============================================

  handleAction(action, dataset) {
    switch (action) {
      case 'setup-profile': this.setupProfile(); break;
      case 'save-profile': this.saveProfile(); break;
      case 'join-session': this.joinSession(dataset.consultationId); break;
      case 'open-session': this.joinSession(dataset.consultationId); break;
      case 'start-video': this.startVideoSession(); break;
      case 'end-session': this.endSession(); break;
      case 'toggle-notes':
        const panel = document.getElementById('gv-notes-panel');
        if (panel) {
          panel.classList.toggle('hidden');
          this.notesVisible = !panel.classList.contains('hidden');
        }
        break;
      case 'toggle-recording': this.toggleRecording(); break;
      case 'book-therapist': this.openBooking(dataset.therapistId); break;
      case 'submit-booking': this.submitBooking(dataset.therapistId); break;
      case 'confirm-booking': this.confirmBookingAction(dataset.bookingId); break;
      case 'cancel-booking': this.cancelBookingAction(dataset.bookingId); break;
      case 'view-report': this.viewReport(dataset.consultationId); break;
      case 'generate-report': this.generateReportAction(dataset.consultationId); break;
      case 'back-dashboard': this.switchTab('dashboard'); break;
      case 'close-modal': this.closeModal(); break;
      case 'new-consultation': this.switchTab('therapists'); break;
      case 'retry-agenda': this.loadAgenda(); break;
      case 'retry-therapists': this.loadTherapists(); break;
      case 'retry-reports': this.loadReports(); break;
    }
  },

  async confirmBookingAction(bookingId) {
    try {
      await GiriApi.confirmBooking(bookingId);
      if (window.Toast) Toast.success('R\u00e9servation confirm\u00e9e !');
      this.loadDashboard();
    } catch (err) {
      if (window.Toast) Toast.error('Erreur de confirmation');
    }
  },

  async cancelBookingAction(bookingId) {
    try {
      await GiriApi.cancelBooking(bookingId);
      if (window.Toast) Toast.success('R\u00e9servation annul\u00e9e');
      this.loadDashboard();
    } catch (err) {
      if (window.Toast) Toast.error('Erreur lors de l\'annulation');
    }
  },

  async generateReportAction(consultationId) {
    try {
      if (window.Toast) Toast.info('G\u00e9n\u00e9ration du rapport IA...');
      await GiriApi.generateReport(consultationId);
      if (window.Toast) Toast.success('Rapport g\u00e9n\u00e9r\u00e9 !');
      this.loadReports();
    } catch (err) {
      if (window.Toast) Toast.error('Erreur lors de la g\u00e9n\u00e9ration');
    }
  },

  closeModal() {
    const overlay = document.getElementById('gv-booking-modal');
    if (overlay) overlay.classList.remove('active');
  },

  // Cleanup
  destroy() {
    if (this.jitsiApi) { this.jitsiApi.dispose(); this.jitsiApi = null; }
    if (this.sessionTimer) clearInterval(this.sessionTimer);
    if (this.waitingInterval) clearInterval(this.waitingInterval);
  }
};

window.GiriVisionView = GiriVisionView;
