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
  participantsCount: 1, // Start with 1 (current user)
  isRecording: false,
  recordingStartTime: null,

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
            <div class="gv-hero-actions">
              <button class="gv-btn gv-btn-primary gv-btn-lg" data-gv-action="new-meeting">
                🎥 Créer une réunion
              </button>
              <button class="gv-btn gv-btn-secondary gv-btn-lg" data-gv-action="join-with-code">
                🔗 Rejoindre avec un code
              </button>
            </div>
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
            <span class="gv-meeting-participants" id="gv-meeting-participants">
              👥 <span id="gv-participants-count">1</span>
            </span>
          </div>
          <div class="gv-meeting-controls">
            <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="copy-link" id="copy-link-btn">
              📋 Copier le lien
            </button>
            <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="toggle-recording" id="recording-btn">
              🔴 REC
            </button>
            <button class="gv-btn gv-btn-danger gv-btn-sm" data-gv-action="end-meeting">
              ❌ Terminer
            </button>
          </div>
        </div>
        <div class="gv-video-container" id="gv-jitsi-container">
          <!-- Custom GIRI VISION logo overlay -->
          <div class="gv-custom-logo">
            <span class="gv-custom-logo-icon">🎥</span>
            <span class="gv-custom-logo-text">Giri Vision</span>
          </div>
        </div>
      </div>
    `;

    // Load meetings history
    await this.loadMeetingsHistory();
  },

  generateRoomName() {
    // Format: giri-TIMESTAMP-RANDOM (ex: giri-1707654321-a7f3)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `giri-${timestamp}-${random}`;
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

    // FULLSCREEN MODE: Hide sidebar and show meeting room
    this.enterFullscreenMode();

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

    // Show success toast with link
    if (window.Toast) {
      Toast.success('Réunion créée ! Partagez le lien pour inviter des participants.');
    }
  },

  enterFullscreenMode() {
    // Hide sidebar
    if (window.Sidebar && typeof Sidebar.close === 'function') {
      Sidebar.close();
    }
    // Alternative: Add class to body
    document.body.classList.add('gv-fullscreen-active');

    // Hide header and content, show meeting room
    const header = document.querySelector('#view-giri-vision > .gv-header');
    const mainContent = document.querySelector('#view-giri-vision > .gv-content');
    const meetingRoom = document.getElementById('gv-meeting-room');

    if (header) header.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    if (meetingRoom) meetingRoom.style.display = 'flex';
  },

  exitFullscreenMode() {
    // Remove fullscreen class
    document.body.classList.remove('gv-fullscreen-active');

    // Hide meeting room, show header and content
    const header = document.querySelector('#view-giri-vision > .gv-header');
    const mainContent = document.querySelector('#view-giri-vision > .gv-content');
    const meetingRoom = document.getElementById('gv-meeting-room');

    if (meetingRoom) meetingRoom.style.display = 'none';
    if (header) header.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'block';
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

    // Event listeners
    this.jitsiApi.addEventListener('videoConferenceLeft', () => {
      this.endMeeting();
    });

    this.jitsiApi.addEventListener('participantJoined', (participant) => {
      this.participantsCount++;
      this.updateParticipantsCount();

      if (window.Toast && participant.displayName) {
        Toast.info(`${participant.displayName} a rejoint la réunion`);
      }
    });

    this.jitsiApi.addEventListener('participantLeft', (participant) => {
      this.participantsCount = Math.max(1, this.participantsCount - 1);
      this.updateParticipantsCount();

      if (window.Toast && participant.displayName) {
        Toast.info(`${participant.displayName} a quitté la réunion`);
      }
    });

    // Get initial participant count
    this.jitsiApi.addEventListener('videoConferenceJoined', () => {
      setTimeout(() => {
        this.jitsiApi.getNumberOfParticipants().then(count => {
          this.participantsCount = count;
          this.updateParticipantsCount();
        });
      }, 1000);
    });
  },

  updateParticipantsCount() {
    const countEl = document.getElementById('gv-participants-count');
    if (countEl) {
      countEl.textContent = this.participantsCount;
    }
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

    // Exit fullscreen mode
    this.exitFullscreenMode();

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
          <div class="gv-empty-history gv-empty-first-time">
            <div class="gv-empty-icon-large">🎥</div>
            <h3 class="gv-empty-title">Aucune réunion récente</h3>
            <p class="gv-empty-hint">Créez votre première réunion pour démarrer !</p>
            <button class="gv-btn gv-btn-primary" data-gv-action="new-meeting">
              ✨ Créer ma première réunion
            </button>
          </div>
        `;
        return;
      }

      listEl.innerHTML = recentMeetings.map(m => this.renderMeetingCard(m)).join('');
    } catch (err) {
      // Si l'erreur est due à l'absence de données (404), afficher le message d'encouragement
      const is404 = err.message?.includes('404') || err.message?.includes('Not found');

      if (is404) {
        listEl.innerHTML = `
          <div class="gv-empty-history gv-empty-first-time">
            <div class="gv-empty-icon-large">🎥</div>
            <h3 class="gv-empty-title">Aucune réunion récente</h3>
            <p class="gv-empty-hint">Créez votre première réunion pour démarrer !</p>
            <button class="gv-btn gv-btn-primary" data-gv-action="new-meeting">
              ✨ Créer ma première réunion
            </button>
          </div>
        `;
      } else {
        // Vraie erreur réseau/serveur
        listEl.innerHTML = `
          <div class="gv-empty-history">
            <div class="gv-empty-icon">⚠️</div>
            <p>Erreur de connexion au serveur</p>
            <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="refresh-history">
              🔄 Réessayer
            </button>
          </div>
        `;
      }
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

    // FULLSCREEN MODE: Hide sidebar and show meeting room
    this.enterFullscreenMode();

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

    if (window.Toast) {
      Toast.info('Reconnexion à la réunion...');
    }
  },

  async promptJoinWithCode() {
    const roomName = prompt('Entrez le code de la réunion (format: giri-XXXXX-XXXX) :');
    if (roomName && roomName.trim()) {
      await this.rejoinMeeting(roomName.trim());
    }
  },

  async toggleRecording() {
    if (!this.jitsiApi) return;

    const recordBtn = document.getElementById('recording-btn');
    if (!recordBtn) return;

    if (this.isRecording) {
      // Stop recording
      try {
        await this.jitsiApi.executeCommand('stopRecording', 'file');
        this.isRecording = false;
        this.recordingStartTime = null;

        recordBtn.innerHTML = '🔴 REC';
        recordBtn.classList.remove('gv-btn-recording');

        // Save recording metadata to backend
        if (this.currentMeeting && this.currentMeeting.id) {
          try {
            await GiriApi.stopRecording(this.currentMeeting.id);
          } catch (e) {
            console.warn('Failed to save recording metadata:', e);
          }
        }

        if (window.Toast) Toast.success('Enregistrement sauvegardé');
      } catch (err) {
        console.error('Failed to stop recording:', err);
        if (window.Toast) Toast.error('Erreur lors de l\'arrêt de l\'enregistrement');
      }
    } else {
      // Start recording
      try {
        await this.jitsiApi.executeCommand('startRecording', {
          mode: 'file',
          shouldShare: false
        });
        this.isRecording = true;
        this.recordingStartTime = Date.now();

        recordBtn.innerHTML = '⏹️ STOP';
        recordBtn.classList.add('gv-btn-recording');

        // Notify backend that recording started
        if (this.currentMeeting && this.currentMeeting.id) {
          try {
            await GiriApi.startRecording(this.currentMeeting.id);
          } catch (e) {
            console.warn('Failed to notify backend of recording:', e);
          }
        }

        if (window.Toast) Toast.info('Enregistrement démarré');
      } catch (err) {
        console.error('Failed to start recording:', err);
        if (window.Toast) Toast.error('Erreur: l\'enregistrement nécessite des autorisations');
      }
    }
  },

  handleAction(action, dataset) {
    switch (action) {
      case 'new-meeting':
        this.startNewMeeting();
        break;
      case 'join-with-code':
        this.promptJoinWithCode();
        break;
      case 'copy-link':
        this.copyMeetingLink(dataset.roomName);
        break;
      case 'toggle-recording':
        this.toggleRecording();
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
