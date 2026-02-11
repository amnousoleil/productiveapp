/**
 * Giri Vision v3.0 - Simple Video Meetings
 * One-click video conferencing with Jitsi Meet
 * No therapist profile required - just start a meeting!
 */
const GiriVisionView = {
  currentMeeting: null,
  jitsiApi: null,
  sessionTimer: null,
  sessionSeconds: 0,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const container = document.getElementById('view-giri-vision');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-gv-action]');
      if (btn) {
        e.stopPropagation();
        this.handleAction(btn.dataset.gvAction, btn.dataset);
        return;
      }
    });
  },

  async refresh() {
    await this.render();
  },

  async render() {
    const container = document.getElementById('view-giri-vision');
    if (!container) return;

    container.innerHTML = `
      <div class="gv-header">
        <div class="gv-logo">
          <div class="gv-logo-icon">🎥</div>
          <span class="gv-logo-text">Giri Vision</span>
        </div>
        <div class="gv-header-subtitle">Visioconférence simple et rapide</div>
      </div>

      <div class="gv-content">
        <div class="gv-main-card">
          <div class="gv-hero">
            <div class="gv-hero-icon">📹</div>
            <h1 class="gv-hero-title">Démarrez une réunion vidéo</h1>
            <p class="gv-hero-subtitle">
              Créez une salle de visioconférence instantanément et invitez vos participants
            </p>
            <button class="gv-btn gv-btn-primary gv-btn-lg" data-gv-action="new-meeting">
              ➕ Nouvelle réunion
            </button>
          </div>
        </div>

        <div class="gv-section">
          <div class="gv-section-header">
            <h2 class="gv-section-title">📅 Réunions récentes</h2>
            <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="refresh-history">
              🔄 Actualiser
            </button>
          </div>
          <div id="gv-meetings-list">
            <div class="gv-loading">Chargement de l'historique...</div>
          </div>
        </div>
      </div>

      <!-- Meeting Room Container -->
      <div class="gv-meeting-room" id="gv-meeting-room" style="display:none;">
        <div class="gv-meeting-toolbar">
          <div class="gv-meeting-info">
            <span class="gv-meeting-timer" id="gv-meeting-timer">00:00:00</span>
            <span class="gv-meeting-name" id="gv-meeting-name"></span>
          </div>
          <div class="gv-meeting-controls">
            <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="copy-link" id="copy-link-btn">
              📋 Copier le lien
            </button>
            <button class="gv-btn gv-btn-danger gv-btn-sm" data-gv-action="end-meeting">
              ❌ Terminer
            </button>
          </div>
        </div>
        <div class="gv-video-container" id="gv-jitsi-container"></div>
      </div>
    `;

    // Load meetings history
    await this.loadMeetingsHistory();
  },

  generateRoomName() {
    const adjectives = ['Quick', 'Smart', 'Pro', 'Fast', 'Cool', 'Nice', 'Easy', 'Great'];
    const nouns = ['Meeting', 'Talk', 'Call', 'Session', 'Chat', 'Room', 'Conference'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const timestamp = Date.now().toString(36).substring(2, 8);
    return `${adj}${noun}-${timestamp}`;
  },

  async startNewMeeting() {
    const roomName = this.generateRoomName();
    const userName = AppState.currentMember?.name || 'Utilisateur';

    // Create meeting record in backend (for history)
    try {
      const data = await GiriApi.createConsultation({
        room_name: roomName,
        scheduled_at: new Date().toISOString(),
        duration_minutes: 60
      });
      this.currentMeeting = data.consultation || data;
    } catch (err) {
      // If backend fails, continue anyway with local meeting
      this.currentMeeting = {
        room_name: roomName,
        scheduled_at: new Date().toISOString()
      };
    }

    // Show meeting room (hide header and content)
    const header = document.querySelector('#view-giri-vision > .gv-header');
    const mainContent = document.querySelector('#view-giri-vision > .gv-content');
    const meetingRoom = document.getElementById('gv-meeting-room');

    if (header) header.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    if (meetingRoom) meetingRoom.style.display = 'flex';

    // Update meeting name display
    const nameEl = document.getElementById('gv-meeting-name');
    if (nameEl) nameEl.textContent = roomName;

    // Initialize Jitsi
    this.initJitsi(roomName, userName);
    this.startMeetingTimer();

    // Show link copied button
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
      copyBtn.dataset.roomName = roomName;
    }
  },

  initJitsi(roomName, userName) {
    const container = document.getElementById('gv-jitsi-container');
    if (!container) return;

    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => this.createJitsiRoom(roomName, userName, container);
      script.onerror = () => {
        container.innerHTML = `
          <div class="gv-empty" style="height:100%;background:var(--bg-primary)">
            <div class="gv-empty-icon">⚠️</div>
            <div class="gv-empty-title">Erreur de chargement</div>
            <div class="gv-empty-text">Impossible de charger Jitsi Meet. Vérifiez votre connexion.</div>
          </div>
        `;
      };
      document.head.appendChild(script);
    } else {
      this.createJitsiRoom(roomName, userName, container);
    }
  },

  createJitsiRoom(roomName, userName, container) {
    if (this.jitsiApi) {
      this.jitsiApi.dispose();
    }

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
          'raisehand', 'participants-pane', 'tileview',
          'fullscreen', 'settings'
        ],
        hideConferenceSubject: false,
        hideConferenceTimer: false,
        enableWelcomePage: false,
        enableClosePage: false,
      },
      interfaceConfigOverrides: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DEFAULT_BACKGROUND: '#111118',
        TOOLBAR_ALWAYS_VISIBLE: false,
        DISABLE_FOCUS_INDICATOR: false,
      },
    });

    this.jitsiApi.addEventListener('videoConferenceLeft', () => {
      this.endMeeting();
    });
  },

  startMeetingTimer() {
    this.sessionSeconds = 0;
    if (this.sessionTimer) clearInterval(this.sessionTimer);

    this.sessionTimer = setInterval(() => {
      this.sessionSeconds++;
      const h = Math.floor(this.sessionSeconds / 3600);
      const m = Math.floor((this.sessionSeconds % 3600) / 60);
      const s = this.sessionSeconds % 60;
      const timerEl = document.getElementById('gv-meeting-timer');
      if (timerEl) {
        timerEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    }, 1000);
  },

  async copyMeetingLink(roomName) {
    if (!roomName && this.currentMeeting) {
      roomName = this.currentMeeting.room_name;
    }

    const link = `https://meet.jit.si/${roomName}`;

    try {
      await navigator.clipboard.writeText(link);
      const btn = document.getElementById('copy-link-btn');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Lien copié !';
        btn.classList.add('gv-btn-success');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('gv-btn-success');
        }, 2000);
      }
      if (window.Toast) Toast.success('Lien copié dans le presse-papier');
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = link;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      if (window.Toast) Toast.success('Lien copié dans le presse-papier');
    }
  },

  async endMeeting() {
    // Update backend if we have a meeting ID
    if (this.currentMeeting && this.currentMeeting.id) {
      try {
        await GiriApi.endConsultation(this.currentMeeting.id);
      } catch (e) {
        // Silent fail - meeting may not be in backend
      }
    }

    // Dispose Jitsi
    if (this.jitsiApi) {
      this.jitsiApi.dispose();
      this.jitsiApi = null;
    }

    // Stop timer
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }

    // Hide meeting room and show header + main content
    const header = document.querySelector('#view-giri-vision > .gv-header');
    const mainContent = document.querySelector('#view-giri-vision > .gv-content');
    const meetingRoom = document.getElementById('gv-meeting-room');

    if (meetingRoom) meetingRoom.style.display = 'none';
    if (header) header.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'block';

    // Reset state
    this.currentMeeting = null;
    this.sessionSeconds = 0;

    // Refresh history
    await this.loadMeetingsHistory();

    if (window.Toast) Toast.info('Réunion terminée');
  },

  async loadMeetingsHistory() {
    const listEl = document.getElementById('gv-meetings-list');
    if (!listEl) return;

    listEl.innerHTML = '<div class="gv-loading">Chargement...</div>';

    try {
      const data = await GiriApi.listConsultations();
      const meetings = data.consultations || data || [];
      const recentMeetings = (Array.isArray(meetings) ? meetings : [])
        .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
        .slice(0, 10);

      if (recentMeetings.length === 0) {
        listEl.innerHTML = `
          <div class="gv-empty-history">
            <div class="gv-empty-icon">📭</div>
            <p>Aucune réunion dans l'historique</p>
            <p class="gv-empty-hint">Créez votre première réunion pour commencer</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = recentMeetings.map(m => this.renderMeetingCard(m)).join('');
    } catch (err) {
      listEl.innerHTML = `
        <div class="gv-empty-history">
          <div class="gv-empty-icon">⚠️</div>
          <p>Impossible de charger l'historique</p>
          <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="refresh-history">
            Réessayer
          </button>
        </div>
      `;
    }
  },

  renderMeetingCard(meeting) {
    const date = new Date(meeting.scheduled_at);
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const duration = meeting.actual_duration_minutes || meeting.duration_minutes || '?';
    const status = meeting.status || 'completed';
    const roomName = meeting.room_name || 'Réunion';

    const statusLabels = {
      'scheduled': '📅 Planifiée',
      'in_progress': '🟢 En cours',
      'completed': '✅ Terminée',
      'cancelled': '❌ Annulée'
    };

    const statusLabel = statusLabels[status] || status;

    return `
      <div class="gv-meeting-card">
        <div class="gv-meeting-card-header">
          <div class="gv-meeting-card-icon">🎥</div>
          <div class="gv-meeting-card-info">
            <div class="gv-meeting-card-title">${roomName}</div>
            <div class="gv-meeting-card-date">${dateStr}</div>
          </div>
          <div class="gv-meeting-card-status ${status}">${statusLabel}</div>
        </div>
        <div class="gv-meeting-card-footer">
          <span class="gv-meeting-card-duration">⏱️ ${duration} min</span>
          ${status !== 'cancelled' ? `
            <button class="gv-btn gv-btn-secondary gv-btn-xs"
                    data-gv-action="copy-link"
                    data-room-name="${roomName}">
              📋 Copier le lien
            </button>
            <button class="gv-btn gv-btn-primary gv-btn-xs"
                    data-gv-action="rejoin-meeting"
                    data-room-name="${roomName}">
              🔗 Rejoindre
            </button>
          ` : ''}
        </div>
      </div>
    `;
  },

  async rejoinMeeting(roomName) {
    const userName = AppState.currentMember?.name || 'Utilisateur';

    this.currentMeeting = {
      room_name: roomName,
      scheduled_at: new Date().toISOString()
    };

    // Show meeting room (hide header and content)
    const header = document.querySelector('#view-giri-vision > .gv-header');
    const mainContent = document.querySelector('#view-giri-vision > .gv-content');
    const meetingRoom = document.getElementById('gv-meeting-room');

    if (header) header.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    if (meetingRoom) meetingRoom.style.display = 'flex';

    // Update meeting name display
    const nameEl = document.getElementById('gv-meeting-name');
    if (nameEl) nameEl.textContent = roomName;

    // Initialize Jitsi
    this.initJitsi(roomName, userName);
    this.startMeetingTimer();

    // Show link copied button
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
      copyBtn.dataset.roomName = roomName;
    }
  },

  handleAction(action, dataset) {
    switch (action) {
      case 'new-meeting':
        this.startNewMeeting();
        break;
      case 'copy-link':
        this.copyMeetingLink(dataset.roomName);
        break;
      case 'end-meeting':
        this.endMeeting();
        break;
      case 'refresh-history':
        this.loadMeetingsHistory();
        break;
      case 'rejoin-meeting':
        this.rejoinMeeting(dataset.roomName);
        break;
    }
  },

  // Cleanup
  destroy() {
    if (this.jitsiApi) {
      this.jitsiApi.dispose();
      this.jitsiApi = null;
    }
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }
};

window.GiriVisionView = GiriVisionView;
