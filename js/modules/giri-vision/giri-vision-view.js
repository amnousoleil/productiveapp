/**
 * Giri Vision v3.4 - Simple Video Meetings
 * One-click video conferencing powered by ProductiveApp Meet
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
  mediaRecorder: null,
  recordedChunks: [],

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
    // CRITICAL FIX: Bind events after render (otherwise buttons are frozen)
    this.bindEvents();
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

        <div class="gv-section">
          <div class="gv-section-header">
            <h2 class="gv-section-title">📹 Mes enregistrements</h2>
            <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="refresh-recordings">
              🔄 Actualiser
            </button>
          </div>
          <div id="gv-recordings-list">
            <div class="gv-loading">Chargement des enregistrements...</div>
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

    // Load meetings history and recordings
    await this.loadMeetingsHistory();
    await this.loadRecordings();
  },

  generateRoomName() {
    // Format: giri-TIMESTAMP-RANDOM (ex: giri-1707654321-a7f3)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `giri-${timestamp}-${random}`;
  },

  async startNewMeeting() {
    const roomName = this.generateRoomName();

    // REDIRECT TO STANDALONE MEET PAGE (cleaner, no CSP issues)
    const domain = window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : window.location.origin;
    const meetUrl = `${domain}/meet/${roomName}`;

    // Show toast before redirect
    if (window.Toast) {
      Toast.success('🎥 Ouverture de la réunion...');
    }

    // Create meeting record in backend (for history) - optional
    try {
      await GiriApi.createConsultation({
        room_name: roomName,
        scheduled_at: new Date().toISOString(),
        duration_minutes: 60
      });
    } catch (err) {
      // If backend fails, continue anyway - meeting will work standalone
      console.warn('[Giri Vision] Failed to save meeting to backend:', err);
    }

    // REDIRECT to standalone meet page (no CSP/iframe issues)
    setTimeout(() => {
      window.location.href = meetUrl;
    }, 500); // Small delay for toast to show
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
            <div class="gv-empty-text">Impossible de charger la visioconférence. Vérifiez votre connexion internet.</div>
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

    // CUSTOM URL: giri-app.com/meet/{roomId} instead of meet.jit.si
    const domain = window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://giri-app.com';
    const link = `${domain}/meet/${roomName}`;

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
      if (window.Toast) Toast.success(`Lien copié : ${domain}/meet/...`);
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

      if (window.Toast) Toast.success(`Lien copié : ${domain}/meet/...`);
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

  async loadRecordings() {
    const listEl = document.getElementById('gv-recordings-list');
    if (!listEl) return;

    listEl.innerHTML = '<div class="gv-loading">Chargement des enregistrements...</div>';

    try {
      const data = await GiriApi.listRecordings();
      const recordings = data.recordings || data || [];
      const recentRecordings = (Array.isArray(recordings) ? recordings : [])
        .filter(r => r.recording_url) // Only show recordings with files
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);

      if (recentRecordings.length === 0) {
        listEl.innerHTML = `
          <div class="gv-empty-history">
            <div class="gv-empty-icon">📹</div>
            <p class="gv-empty-hint">Aucun enregistrement disponible</p>
            <p class="gv-empty-hint-small">Les enregistrements de vos réunions apparaîtront ici</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = recentRecordings.map(r => this.renderRecordingCard(r)).join('');
    } catch (err) {
      console.error('[Giri Vision] Error loading recordings:', err);
      listEl.innerHTML = `
        <div class="gv-empty-history">
          <div class="gv-empty-icon">⚠️</div>
          <p>Erreur de chargement des enregistrements</p>
          <button class="gv-btn gv-btn-secondary gv-btn-sm" data-gv-action="refresh-recordings">
            🔄 Réessayer
          </button>
        </div>
      `;
    }
  },

  renderRecordingCard(recording) {
    const date = new Date(recording.created_at);
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const roomName = recording.room_name || 'Réunion';
    const fileSize = recording.file_size ? (recording.file_size / (1024 * 1024)).toFixed(1) + ' MB' : '?';
    const duration = recording.duration_seconds
      ? Math.floor(recording.duration_seconds / 60) + ' min'
      : '?';
    const recordingUrl = recording.recording_url;

    return `
      <div class="gv-recording-card">
        <div class="gv-recording-card-header">
          <div class="gv-recording-card-icon">🎬</div>
          <div class="gv-recording-card-info">
            <div class="gv-recording-card-title">${roomName}</div>
            <div class="gv-recording-card-date">${dateStr}</div>
          </div>
          <div class="gv-recording-card-size">${fileSize}</div>
        </div>
        <div class="gv-recording-card-footer">
          <span class="gv-recording-card-duration">⏱️ ${duration}</span>
          <button class="gv-btn gv-btn-primary gv-btn-xs"
                  data-gv-action="play-recording"
                  data-recording-url="${recordingUrl}"
                  data-recording-name="${roomName}">
            ▶️ Lire
          </button>
          <a href="${recordingUrl}" download class="gv-btn gv-btn-secondary gv-btn-xs">
            📥 Télécharger
          </a>
        </div>
      </div>
    `;
  },

  async rejoinMeeting(roomName) {
    // REDIRECT to standalone meet page
    const domain = window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : window.location.origin;
    const meetUrl = `${domain}/meet/${roomName}`;

    if (window.Toast) {
      Toast.info('🎥 Reconnexion à la réunion...');
    }

    setTimeout(() => {
      window.location.href = meetUrl;
    }, 300);
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
      this.stopClientRecording(recordBtn);
    } else {
      // Start recording
      this.startClientRecording(recordBtn);
    }
  },

  async startClientRecording(recordBtn) {
    try {
      // Check MediaRecorder support
      if (!window.MediaRecorder) {
        if (window.Toast) Toast.error('Votre navigateur ne supporte pas l\'enregistrement vidéo');
        return;
      }

      // Get display media stream (screen + audio)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true
      });

      this.recordedChunks = [];

      // Create MediaRecorder
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm'; // Fallback
      }

      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await this.saveRecording();
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      recordBtn.innerHTML = '⏹️ STOP';
      recordBtn.classList.add('gv-btn-recording');

      if (window.Toast) Toast.success('🔴 Enregistrement démarré');
    } catch (err) {
      console.error('Failed to start recording:', err);
      if (window.Toast) {
        if (err.name === 'NotAllowedError') {
          Toast.error('Permission refusée pour enregistrer l\'écran');
        } else {
          Toast.error('Impossible de démarrer l\'enregistrement');
        }
      }
    }
  },

  stopClientRecording(recordBtn) {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.recordingStartTime = null;

      recordBtn.innerHTML = '🔴 REC';
      recordBtn.classList.remove('gv-btn-recording');

      if (window.Toast) Toast.info('⏹️ Enregistrement arrêté, sauvegarde en cours...');
    }
  },

  async saveRecording() {
    try {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const duration = Math.floor((Date.now() - (this.recordingStartTime || Date.now())) / 1000);

      // Create FormData for upload
      const formData = new FormData();
      const filename = `recording-${Date.now()}.webm`;
      formData.append('recording', blob, filename);
      formData.append('meeting_id', this.currentMeeting?.id || 'unknown');
      formData.append('room_name', this.currentMeeting?.room_name || 'unknown');
      formData.append('duration', duration);

      // Upload to backend
      const token = ApiTokens.getAccessToken() || localStorage.getItem('accessToken');
      const workspaceId = AppState.currentWorkspace?.id;

      const response = await fetch(`${AppConfig.API_URL}/giri-vision/recordings/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Workspace-Id': workspaceId
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (window.Toast) Toast.success('✅ Enregistrement sauvegardé !');
        this.recordedChunks = [];
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Failed to save recording:', err);

      // Fallback: download locally
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);

      if (window.Toast) Toast.warning('⚠️ Enregistrement téléchargé localement (échec upload serveur)');
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
      case 'refresh-recordings':
        this.loadRecordings();
        break;
      case 'play-recording':
        this.playRecording(dataset.recordingUrl, dataset.recordingName);
        break;
    }
  },

  playRecording(url, name) {
    // Create a modal with video player
    const modal = document.createElement('div');
    modal.className = 'gv-video-modal';
    modal.innerHTML = `
      <div class="gv-video-modal-overlay" data-gv-action="close-video-modal"></div>
      <div class="gv-video-modal-content">
        <div class="gv-video-modal-header">
          <h3 class="gv-video-modal-title">📹 ${name || 'Enregistrement'}</h3>
          <button class="gv-video-modal-close" data-gv-action="close-video-modal">✕</button>
        </div>
        <div class="gv-video-modal-body">
          <video controls autoplay style="width: 100%; max-height: 70vh; background: #000;">
            <source src="${url}" type="video/webm">
            <source src="${url}" type="video/mp4">
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
        <div class="gv-video-modal-footer">
          <a href="${url}" download class="gv-btn gv-btn-primary">
            📥 Télécharger
          </a>
          <button class="gv-btn gv-btn-secondary" data-gv-action="close-video-modal">
            Fermer
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal on click
    modal.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-gv-action="close-video-modal"]');
      if (closeBtn || e.target.classList.contains('gv-video-modal-overlay')) {
        const video = modal.querySelector('video');
        if (video) video.pause();
        modal.remove();
      }
    });
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
