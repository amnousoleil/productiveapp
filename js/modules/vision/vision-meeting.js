/**
 * ================================================
 * VISION MEETING - Giri Vision v3.0
 * Écran pré-rejoindre + réunion active + post-séance
 * AUCUNE ref Jitsi/ffmuc — 100% marque Giri Vision
 * ================================================
 */

const VisionMeeting = (function () {
    'use strict';

    let _meeting = null;
    let _timerInterval = null;
    let _elapsed = 0;
    let _localStream = null;
    let _micMuted = false;
    let _camOff = false;

    async function show(meeting) {
        _meeting = meeting;
        _elapsed = 0; _micMuted = false; _camOff = false;

        const container = document.getElementById('view-giri-vision');
        if (!container) return;

        const user = VisionUtils.getCurrentUser();
        const defaultName = user.displayName || user.name || user.email || 'Participant';

        container.innerHTML = `
            <div class="vision-prejoin-wrapper">
                <div class="vision-prejoin-header">
                    <button class="vision-btn-back" onclick="VisionMeeting._cancelPrejoin()">← Retour</button>
                    <div class="vision-prejoin-brand">
                        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="20" fill="url(#gpj)"/>
                            <rect x="10" y="14" width="14" height="12" rx="3" fill="white" opacity="0.9"/>
                            <path d="M24 17L31 13v14L24 23V17z" fill="white" opacity="0.85"/>
                            <defs><linearGradient id="gpj" x1="0" y1="0" x2="40" y2="40">
                                <stop stop-color="#7c3aed"/><stop offset="1" stop-color="#2563eb"/>
                            </linearGradient></defs>
                        </svg>
                        <span class="vision-prejoin-brand-name">Giri Vision</span>
                    </div>
                    <div style="width:80px"></div>
                </div>

                <div class="vision-prejoin-body">
                    <div class="vision-prejoin-camera-col">
                        <div class="vision-camera-preview" id="vision-camera-preview">
                            <video id="vision-preview-video" autoplay muted playsinline></video>
                            <div class="vision-camera-off-overlay" id="vision-cam-off-overlay" style="display:none;">
                                <span class="vision-cam-off-icon">📷</span>
                                <span>Caméra désactivée</span>
                            </div>
                            <div class="vision-preview-badges">
                                <span class="vision-preview-badge" id="vision-mic-badge">🎤</span>
                                <span class="vision-preview-badge" id="vision-cam-badge">📷</span>
                            </div>
                        </div>
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

                    <div class="vision-prejoin-info-col">
                        <div class="vision-prejoin-meeting-card">
                            <div class="vision-prejoin-meeting-icon">🎯</div>
                            <div class="vision-prejoin-meeting-details">
                                <h2 class="vision-prejoin-meeting-title">${_esc(meeting.title || 'Séance')}</h2>
                                <p class="vision-prejoin-meeting-code">Code : ${_esc(meeting.room_id)}</p>
                            </div>
                        </div>

                        <div class="vision-prejoin-form">
                            <label class="vision-prejoin-label">Votre nom</label>
                            <input type="text" id="vision-prejoin-name"
                                class="vision-input"
                                value="${_esc(defaultName)}" maxlength="50"
                                onkeydown="if(event.key==='Enter') VisionMeeting._join()">
                        </div>

                        <button class="vision-btn-join" id="vision-join-btn" onclick="VisionMeeting._join()">
                            <span id="vision-join-icon">▶</span>
                            <span id="vision-join-text">Rejoindre la séance</span>
                        </button>

                        <p class="vision-prejoin-hint">
                            Caméra et micro s'activeront selon vos choix ci-dessus
                        </p>
                    </div>
                </div>
            </div>
        `;

        _startCameraPreview();
    }

    async function _startCameraPreview() {
        try {
            _localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const video = document.getElementById('vision-preview-video');
            if (video) video.srcObject = _localStream;
        } catch (err) {
            const preview = document.getElementById('vision-camera-preview');
            if (preview) preview.innerHTML = `
                <div class="vision-no-camera">
                    <span style="font-size:2rem">📷</span>
                    <p>Caméra non disponible</p>
                    <small>${err.name === 'NotAllowedError' ? 'Accès refusé dans le navigateur' : 'Aucune caméra détectée'}</small>
                </div>`;
        }
    }

    function _stopCameraPreview() {
        if (_localStream) { _localStream.getTracks().forEach(t => t.stop()); _localStream = null; }
    }

    function _toggleMic() {
        _micMuted = !_micMuted;
        const btn = document.getElementById('vision-mic-btn');
        const icon = document.getElementById('vision-mic-icon');
        const label = document.getElementById('vision-mic-label');
        const badge = document.getElementById('vision-mic-badge');
        if (_micMuted) {
            btn?.classList.add('vision-ctrl-off');
            if (icon) icon.textContent = '🔇'; if (label) label.textContent = 'Coupé';
            if (badge) { badge.textContent = '🔇'; badge.classList.add('off'); }
            _localStream?.getAudioTracks().forEach(t => t.enabled = false);
        } else {
            btn?.classList.remove('vision-ctrl-off');
            if (icon) icon.textContent = '🎤'; if (label) label.textContent = 'Micro';
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
            if (icon) icon.textContent = '🚫'; if (label) label.textContent = 'Désactivée';
            if (badge) { badge.textContent = '🚫'; badge.classList.add('off'); }
            if (overlay) overlay.style.display = 'flex';
            _localStream?.getVideoTracks().forEach(t => t.enabled = false);
        } else {
            btn?.classList.remove('vision-ctrl-off');
            if (icon) icon.textContent = '📷'; if (label) label.textContent = 'Caméra';
            if (badge) { badge.textContent = '📷'; badge.classList.remove('off'); }
            if (overlay) overlay.style.display = 'none';
            _localStream?.getVideoTracks().forEach(t => t.enabled = true);
        }
    }

    function _cancelPrejoin() { _stopCameraPreview(); VisionMain.showHome(); }

    async function _join() {
        const nameEl = document.getElementById('vision-prejoin-name');
        const joinBtn = document.getElementById('vision-join-btn');
        const joinText = document.getElementById('vision-join-text');
        const displayName = nameEl?.value.trim() || 'Participant';
        if (joinBtn) joinBtn.disabled = true;
        if (joinText) joinText.textContent = 'Connexion...';
        _stopCameraPreview();
        _showActiveRoom();
        try {
            await VisionJitsi.init(_meeting.room_id, 'vision-jitsi-container', {
                displayName,
                title: _meeting.title,
                startMuted: _micMuted,
                startCamOff: _camOff,
                onEnd: (duration) => _handleSessionEnd(duration),
                onError: (code) => _handleJitsiError(code)
            });
            await VisionApi.joinMeeting(_meeting.room_id, displayName).catch(() => {});
        } catch (err) {
            _showErrorState(err.message);
        }
    }

    function _showActiveRoom() {
        const container = document.getElementById('view-giri-vision');
        if (!container) return;
        const style = getComputedStyle(document.documentElement);
        const bg = style.getPropertyValue('--bg-primary').trim() || '#050510';

        container.innerHTML = `
            <div class="vision-meeting-wrapper" style="--meeting-bg:${bg}">
                <div class="vision-meeting-header">
                    <div class="vision-meeting-info">
                        <div class="vision-meeting-brand">
                            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                                <circle cx="20" cy="20" r="20" fill="url(#gmh)"/>
                                <rect x="10" y="14" width="14" height="12" rx="3" fill="white" opacity="0.9"/>
                                <path d="M24 17L31 13v14L24 23V17z" fill="white" opacity="0.85"/>
                                <defs><linearGradient id="gmh" x1="0" y1="0" x2="40" y2="40">
                                    <stop stop-color="#7c3aed"/><stop offset="1" stop-color="#2563eb"/>
                                </linearGradient></defs>
                            </svg>
                            <span class="vision-meeting-brand-name">Giri Vision</span>
                            <span class="vision-meeting-brand-badge">PRO</span>
                        </div>
                        <span class="vision-meeting-sep">·</span>
                        <span class="vision-meeting-title">${_esc(_meeting?.title || 'Séance')}</span>
                    </div>
                    <div class="vision-meeting-controls">
                        <div class="vision-meeting-timer-wrap">
                            <span class="vision-meeting-timer-dot"></span>
                            <span class="vision-meeting-timer" id="vision-timer">00:00</span>
                        </div>
                        <button class="vision-btn-share" onclick="VisionMeeting.shareCode()">
                            🔗 Partager
                        </button>
                        <button class="vision-btn-end" onclick="VisionMeeting.end()">
                            ⬛ Terminer
                        </button>
                    </div>
                </div>
                <div class="vision-jitsi-container" id="vision-jitsi-container">
                    <div class="vision-loading-room" id="vision-loading-room">
                        <div class="vision-loading-spinner"></div>
                        <p>Connexion à la séance en cours...</p>
                    </div>
                    <!-- Badge marque : couvre tout watermark résiduel -->
                    <div class="vision-brand-badge" id="vision-brand-badge" style="display:none">
                        <span class="vision-brand-badge-dot"></span>
                        Giri Vision Pro
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
        const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
        const p = n => String(n).padStart(2,'0');
        return h > 0 ? `${p(h)}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`;
    }

    /** Partage le code uniquement — JAMAIS de lien ffmuc/jitsi */
    function shareCode() {
        if (!_meeting) return;
        const msg = `Rejoignez ma séance Giri Vision — Code : ${_meeting.room_id}`;
        navigator.clipboard.writeText(msg).then(() => {
            typeof Toast !== 'undefined' && Toast.success('Code de séance copié !');
        });
    }

    function _handleJitsiError(code) {
        VisionJitsi.dispose(); clearInterval(_timerInterval);
        const c = document.getElementById('vision-jitsi-container');
        if (!c) return;
        if (code === 'membersOnly') {
            c.innerHTML = `<div class="vision-error-state">
                <div class="vision-error-icon">🔒</div>
                <h3>Séance verrouillée</h3>
                <p>Créez une nouvelle séance pour continuer.</p>
                <div class="vision-error-actions">
                    <button class="vision-btn-primary" onclick="VisionHome.openModal('now')">Nouvelle séance</button>
                    <button class="vision-btn-secondary" onclick="VisionMain.showHome()">Retour</button>
                </div>
            </div>`;
        } else { _showErrorState(code); }
    }

    function _showErrorState(msg) {
        const c = document.getElementById('vision-jitsi-container');
        if (!c) return;
        c.innerHTML = `<div class="vision-error-state">
            <div class="vision-error-icon">⚠️</div>
            <h3>Connexion impossible</h3>
            <p>${_esc(String(msg || 'Erreur inconnue'))}</p>
            <div class="vision-error-actions">
                <button onclick="VisionMeeting.show(window.__gvLastMeeting)" class="vision-btn-primary">Réessayer</button>
                <button onclick="VisionMain.showHome()" class="vision-btn-secondary">Retour</button>
            </div>
        </div>`;
        window.__gvLastMeeting = _meeting;
    }

    async function _handleSessionEnd(duration) {
        clearInterval(_timerInterval);
        if (_meeting) {
            await VisionApi.endMeeting(_meeting.room_id, duration || _elapsed).catch(() => {});
            _updateStats(duration || _elapsed);
        }
        _showPostSession(duration || _elapsed);
    }

    function _updateStats(durationSec) {
        const s = JSON.parse(localStorage.getItem('gv_stats') || '{}');
        s.sessions = (s.sessions || 0) + 1;
        s.hours = Math.round(((s.hours || 0) * 3600 + durationSec) / 3600 * 10) / 10;
        localStorage.setItem('gv_stats', JSON.stringify(s));
    }

    function _showPostSession(durationSec) {
        const dur = _formatTime(durationSec);
        const title = _esc(_meeting?.title || 'Séance terminée');
        const roomId = _meeting?.room_id || '';

        const overlay = document.createElement('div');
        overlay.className = 'vision-postsession-overlay';
        overlay.id = 'vision-postsession-overlay';
        overlay.innerHTML = `
            <div class="vision-postsession-modal">
                <div class="vision-postsession-header">
                    <span class="vision-postsession-icon">✅</span>
                    <div>
                        <p class="vision-postsession-title">Séance terminée</p>
                        <p class="vision-postsession-sub">${title}</p>
                    </div>
                </div>
                <div class="vision-postsession-stats">
                    <div class="vision-postsession-stat">
                        <div class="vision-postsession-stat-val">${dur}</div>
                        <div class="vision-postsession-stat-lbl">Durée</div>
                    </div>
                    <div class="vision-postsession-stat">
                        <div class="vision-postsession-stat-val">✨</div>
                        <div class="vision-postsession-stat-lbl">Séance enregistrée</div>
                    </div>
                </div>
                <p class="vision-postsession-notes-label">Notes de séance</p>
                <textarea class="vision-postsession-textarea" id="gv-session-notes" rows="3"
                    placeholder="Points clés, actions à suivre, observations..."></textarea>
                <p class="vision-postsession-notes-label" style="margin-top:14px">Évaluation</p>
                <div class="vision-postsession-rating" id="gv-rating">
                    ${[1,2,3,4,5].map(i=>`<span class="vision-rating-star" data-v="${i}" onclick="VisionMeeting._setRating(${i})">★</span>`).join('')}
                </div>
                <div class="vision-postsession-footer">
                    <button class="vision-btn-secondary" onclick="VisionMeeting._closePostSession()">Ignorer</button>
                    <button class="vision-btn-primary" onclick="VisionMeeting._savePostSession('${roomId}')">
                        Enregistrer les notes
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function _setRating(val) {
        document.querySelectorAll('.vision-rating-star').forEach((s,i) => {
            s.classList.toggle('active', i < val);
        });
        window.__gvRating = val;
    }

    function _savePostSession(roomId) {
        const notes = document.getElementById('gv-session-notes')?.value.trim() || '';
        const rating = window.__gvRating || 0;
        const all = JSON.parse(localStorage.getItem('gv_session_notes') || '{}');
        all[roomId] = { notes, rating, savedAt: new Date().toISOString() };
        localStorage.setItem('gv_session_notes', JSON.stringify(all));
        if (notes) typeof Toast !== 'undefined' && Toast.success('Notes enregistrées');
        _closePostSession();
    }

    function _closePostSession() {
        document.getElementById('vision-postsession-overlay')?.remove();
        window.__gvRating = 0;
        VisionMain.showHome();
    }

    async function end() {
        clearInterval(_timerInterval);
        _stopCameraPreview();
        const dur = _elapsed;
        VisionJitsi.dispose();
        if (_meeting) {
            await VisionApi.endMeeting(_meeting.room_id, dur).catch(() => {});
            _updateStats(dur);
        }
        _showPostSession(dur);
    }

    function _esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    return { show, end, shareCode, _toggleMic, _toggleCam, _cancelPrejoin, _join, _setRating, _savePostSession, _closePostSession };
})();

if (typeof window !== 'undefined') window.VisionMeeting = VisionMeeting;
