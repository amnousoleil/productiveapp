/**
 * ================================================
 * VISION MEETING - Giri Vision v1.1
 * Écran pré-rejoindre premium + réunion active
 * ================================================
 */

const VisionMeeting = (function () {
    'use strict';

    let _currentMeeting = null;
    let _timerInterval = null;
    let _elapsed = 0;
    let _localStream = null;
    let _micMuted = false;
    let _camOff = false;

    /**
     * Affiche l'écran pré-rejoindre (Phase 1 — Giri Vision branded)
     */
    async function show(meeting) {
        _currentMeeting = meeting;
        _elapsed = 0;
        _micMuted = false;
        _camOff = false;

        const container = document.getElementById('view-giri-vision');
        if (!container) return;

        const user = VisionUtils.getCurrentUser();
        const defaultName = user.displayName || user.name || user.email || 'Utilisateur';

        container.innerHTML = `
            <div class="vision-prejoin-wrapper">
                <!-- Header Giri Vision -->
                <div class="vision-prejoin-header">
                    <button class="vision-btn-back" onclick="VisionMeeting._cancelPrejoin()">← Retour</button>
                    <div class="vision-prejoin-brand">
                        <span class="vision-prejoin-logo">🎥</span>
                        <span class="vision-prejoin-brand-name">Giri Vision</span>
                    </div>
                    <div style="width:80px"></div>
                </div>

                <!-- Corps -->
                <div class="vision-prejoin-body">
                    <!-- Colonne caméra -->
                    <div class="vision-prejoin-camera-col">
                        <div class="vision-camera-preview" id="vision-camera-preview">
                            <video id="vision-preview-video" autoplay muted playsinline></video>
                            <div class="vision-camera-off-overlay" id="vision-cam-off-overlay" style="display:none;">
                                <span class="vision-cam-off-icon">📷</span>
                                <span>Caméra désactivée</span>
                            </div>
                            <!-- Badges état -->
                            <div class="vision-preview-badges">
                                <span class="vision-preview-badge" id="vision-mic-badge">🎤</span>
                                <span class="vision-preview-badge" id="vision-cam-badge">📷</span>
                            </div>
                        </div>

                        <!-- Contrôles micro / caméra -->
                        <div class="vision-prejoin-controls">
                            <button class="vision-ctrl-btn" id="vision-mic-btn"
                                onclick="VisionMeeting._toggleMic()" title="Micro">
                                <span id="vision-mic-icon">🎤</span>
                                <span id="vision-mic-label">Micro</span>
                            </button>
                            <button class="vision-ctrl-btn" id="vision-cam-btn"
                                onclick="VisionMeeting._toggleCam()" title="Caméra">
                                <span id="vision-cam-icon">📷</span>
                                <span id="vision-cam-label">Caméra</span>
                            </button>
                        </div>
                    </div>

                    <!-- Colonne infos + rejoindre -->
                    <div class="vision-prejoin-info-col">
                        <div class="vision-prejoin-meeting-card">
                            <div class="vision-prejoin-meeting-icon">🎯</div>
                            <div class="vision-prejoin-meeting-details">
                                <h2 class="vision-prejoin-meeting-title">${_esc(meeting.title || 'Réunion')}</h2>
                                <p class="vision-prejoin-meeting-code">${meeting.room_id}</p>
                            </div>
                        </div>

                        <div class="vision-prejoin-form">
                            <label class="vision-prejoin-label">Votre nom dans la réunion</label>
                            <input type="text" id="vision-prejoin-name"
                                class="vision-input vision-prejoin-name-input"
                                value="${_esc(defaultName)}"
                                maxlength="50"
                                onkeydown="if(event.key==='Enter') VisionMeeting._join()">
                        </div>

                        <button class="vision-btn-join" id="vision-join-btn"
                            onclick="VisionMeeting._join()">
                            <span id="vision-join-icon">🚀</span>
                            <span id="vision-join-text">Rejoindre la réunion</span>
                        </button>

                        <p class="vision-prejoin-hint">
                            Votre caméra et micro s'activeront dans la réunion selon vos choix ci-dessus
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Démarrer la caméra en preview
        _startCameraPreview();
    }

    async function _startCameraPreview() {
        try {
            _localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const video = document.getElementById('vision-preview-video');
            if (video) {
                video.srcObject = _localStream;
            }
        } catch (err) {
            // Pas de caméra disponible — on continue sans preview
            console.warn('📷 Giri Vision: caméra non disponible', err.message);
            const preview = document.getElementById('vision-camera-preview');
            if (preview) {
                preview.innerHTML = `
                    <div class="vision-no-camera">
                        <span>📷</span>
                        <p>Caméra non disponible</p>
                        <small>${err.name === 'NotAllowedError' ? 'Accès refusé' : 'Aucune caméra détectée'}</small>
                    </div>`;
            }
        }
    }

    function _stopCameraPreview() {
        if (_localStream) {
            _localStream.getTracks().forEach(t => t.stop());
            _localStream = null;
        }
    }

    function _toggleMic() {
        _micMuted = !_micMuted;
        const btn = document.getElementById('vision-mic-btn');
        const icon = document.getElementById('vision-mic-icon');
        const label = document.getElementById('vision-mic-label');
        const badge = document.getElementById('vision-mic-badge');

        if (_micMuted) {
            btn?.classList.add('vision-ctrl-off');
            if (icon) icon.textContent = '🔇';
            if (label) label.textContent = 'Coupé';
            if (badge) { badge.textContent = '🔇'; badge.classList.add('off'); }
            // Couper le micro dans le stream preview
            _localStream?.getAudioTracks().forEach(t => t.enabled = false);
        } else {
            btn?.classList.remove('vision-ctrl-off');
            if (icon) icon.textContent = '🎤';
            if (label) label.textContent = 'Micro';
            if (badge) { badge.textContent = '🎤'; badge.classList.remove('off'); }
            _localStream?.getAudioTracks().forEach(t => t.enabled = true);
        }
    }

    function _toggleCam() {
        _camOff = !_camOff;
        const btn = document.getElementById('vision-cam-btn');
        const icon = document.getElementById('vision-cam-icon');
        const label = document.getElementById('vision-cam-label');
        const badge = document.getElementById('vision-cam-badge');
        const overlay = document.getElementById('vision-cam-off-overlay');

        if (_camOff) {
            btn?.classList.add('vision-ctrl-off');
            if (icon) icon.textContent = '🚫';
            if (label) label.textContent = 'Désactivée';
            if (badge) { badge.textContent = '🚫'; badge.classList.add('off'); }
            if (overlay) overlay.style.display = 'flex';
            _localStream?.getVideoTracks().forEach(t => t.enabled = false);
        } else {
            btn?.classList.remove('vision-ctrl-off');
            if (icon) icon.textContent = '📷';
            if (label) label.textContent = 'Caméra';
            if (badge) { badge.textContent = '📷'; badge.classList.remove('off'); }
            if (overlay) overlay.style.display = 'none';
            _localStream?.getVideoTracks().forEach(t => t.enabled = true);
        }
    }

    function _cancelPrejoin() {
        _stopCameraPreview();
        VisionMain.showHome();
    }

    async function _join() {
        const nameEl = document.getElementById('vision-prejoin-name');
        const joinBtn = document.getElementById('vision-join-btn');
        const joinText = document.getElementById('vision-join-text');

        const displayName = nameEl?.value.trim() || 'Utilisateur';

        // UI loading
        if (joinBtn) joinBtn.disabled = true;
        if (joinText) joinText.textContent = 'Connexion en cours...';

        // Arrêter le stream preview (Jitsi va demander les périphériques lui-même)
        _stopCameraPreview();

        // Basculer vers l'écran de réunion active (Phase 2)
        _showActiveRoom();

        // Lancer Jitsi
        try {
            await VisionJitsi.init(_currentMeeting.room_id, 'vision-jitsi-container', {
                displayName,
                title: _currentMeeting.title,
                startMuted: _micMuted,
                startCamOff: _camOff,
                onEnd: (duration) => _handleMeetingEnd(duration),
                onError: (errorCode) => _handleJitsiError(errorCode)
            });
            // Enregistrer la participation en DB
            await VisionApi.joinMeeting(_currentMeeting.room_id, displayName).catch(() => {});
        } catch (err) {
            console.error('❌ VisionMeeting: Jitsi init failed:', err);
            _showJitsiError(err.message);
        }
    }

    /**
     * Phase 2 — Affiche le layout de réunion active avec le header Giri Vision
     */
    function _showActiveRoom() {
        const container = document.getElementById('view-giri-vision');
        if (!container) return;

        // Lire les couleurs du thème actif
        const theme = document.documentElement.getAttribute('data-theme') || 'midnight';
        const style = getComputedStyle(document.documentElement);
        const accentRaw = style.getPropertyValue('--accent-color').trim() || '#7c3aed';
        const bgRaw = style.getPropertyValue('--bg-primary').trim() || '#0d0d1a';

        container.innerHTML = `
            <div class="vision-meeting-wrapper" id="vision-meeting-wrapper" data-theme="${theme}"
                style="--meeting-accent: ${accentRaw}; --meeting-bg: ${bgRaw}">
                <div class="vision-meeting-header">
                    <div class="vision-meeting-info">
                        <div class="vision-meeting-brand">
                            <span class="vision-meeting-logo">🎥</span>
                            <span class="vision-meeting-brand-name">Giri Vision</span>
                        </div>
                        <div class="vision-meeting-sep">·</div>
                        <span class="vision-meeting-title">${_esc(_currentMeeting?.title || 'Réunion')}</span>
                    </div>
                    <div class="vision-meeting-controls">
                        <div class="vision-meeting-timer-wrap">
                            <span class="vision-meeting-timer-dot"></span>
                            <span class="vision-meeting-timer" id="vision-timer">00:00</span>
                        </div>
                        <button class="vision-btn-share" onclick="VisionMeeting.copyLink()">
                            🔗 Partager
                        </button>
                        <button class="vision-btn-end" onclick="VisionMeeting.end()">
                            📴 Terminer
                        </button>
                    </div>
                </div>
                <div class="vision-jitsi-container" id="vision-jitsi-container">
                    <div class="vision-loading-room">
                        <div class="vision-loading-spinner"></div>
                        <p>Connexion à la réunion...</p>
                    </div>
                </div>
            </div>
        `;

        _startTimer();
    }

    function _startTimer() {
        _elapsed = 0;
        clearInterval(_timerInterval);
        _timerInterval = setInterval(() => {
            _elapsed++;
            const el = document.getElementById('vision-timer');
            if (el) el.textContent = _formatTime(_elapsed);
        }, 1000);
    }

    function _formatTime(s) {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${_pad(h)}:${_pad(m)}:${_pad(sec)}`;
        return `${_pad(m)}:${_pad(sec)}`;
    }

    function _pad(n) { return String(n).padStart(2, '0'); }

    function _handleJitsiError(errorCode) {
        VisionJitsi.dispose();
        clearInterval(_timerInterval);
        const c = document.getElementById('vision-jitsi-container');
        if (!c) return;

        if (errorCode === 'membersOnly') {
            c.innerHTML = `
                <div class="vision-error-state">
                    <div class="vision-error-icon">🔒</div>
                    <h3>Salle verrouillée</h3>
                    <p>Cette salle a été verrouillée par un modérateur lors d'une session précédente.</p>
                    <p class="vision-error-tip">💡 Créez une nouvelle réunion pour démarrer sans restriction.</p>
                    <div class="vision-error-actions">
                        <button class="vision-btn-primary" onclick="VisionHome.openModal('now')">
                            🚀 Nouvelle réunion
                        </button>
                        <button class="vision-btn-secondary" onclick="VisionMain.showHome()">Retour</button>
                    </div>
                </div>`;
        } else {
            _showJitsiError(errorCode);
        }
    }

    function _showJitsiError(msg) {
        const c = document.getElementById('vision-jitsi-container');
        if (!c) return;
        c.innerHTML = `
            <div class="vision-error-state">
                <div class="vision-error-icon">⚠️</div>
                <h3>Impossible de rejoindre la réunion</h3>
                <p>${_esc(msg)}</p>
                <div class="vision-error-actions">
                    <button onclick="VisionMeeting.show(window.__lastVisionMeeting)" class="vision-btn-primary">
                        Réessayer
                    </button>
                    <button onclick="VisionMain.showHome()" class="vision-btn-secondary">Retour</button>
                </div>
            </div>`;
        window.__lastVisionMeeting = _currentMeeting;
    }

    async function _handleMeetingEnd(duration) {
        clearInterval(_timerInterval);
        if (_currentMeeting) {
            await VisionApi.endMeeting(_currentMeeting.room_id, duration || _elapsed).catch(() => {});
        }
        VisionMain.showHome();
    }

    async function end() {
        clearInterval(_timerInterval);
        _stopCameraPreview();
        VisionJitsi.dispose();
        if (_currentMeeting) {
            await VisionApi.endMeeting(_currentMeeting.room_id, _elapsed).catch(() => {});
        }
        VisionMain.showHome();
    }

    function copyLink() {
        if (!_currentMeeting) return;
        const link = `https://meet.jit.si/${_currentMeeting.room_id}`;
        navigator.clipboard.writeText(link).then(() => {
            if (typeof Toast !== 'undefined') Toast.success('Lien copié');
            else alert(link);
        });
    }

    function _esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    return { show, end, copyLink, _toggleMic, _toggleCam, _cancelPrejoin, _join };
})();

if (typeof window !== 'undefined') window.VisionMeeting = VisionMeeting;
