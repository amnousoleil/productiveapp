/**
 * ================================================
 * VISION MEETING - Giri Vision v1.0
 * Page de réunion active avec iframe Jitsi
 * ================================================
 */

const VisionMeeting = (function () {
    'use strict';

    let _currentMeeting = null;
    let _timerInterval = null;
    let _elapsed = 0;

    /**
     * Affiche la vue réunion active
     * @param {object} meeting - objet réunion du backend
     */
    async function show(meeting) {
        _currentMeeting = meeting;
        _elapsed = 0;

        const container = document.getElementById('view-giri-vision');
        if (!container) return;

        const user = VisionUtils.getCurrentUser();
        const displayName = user.displayName || user.name || user.email || 'Utilisateur';

        container.innerHTML = `
            <div class="vision-meeting-wrapper" id="vision-meeting-wrapper">
                <div class="vision-meeting-header">
                    <div class="vision-meeting-info">
                        <span class="vision-meeting-icon">🎥</span>
                        <span class="vision-meeting-title">${_escapeHtml(meeting.title || 'Réunion')}</span>
                        <span class="vision-meeting-room">· ${meeting.room_id}</span>
                    </div>
                    <div class="vision-meeting-controls">
                        <span class="vision-meeting-timer" id="vision-timer">00:00</span>
                        <button class="vision-btn-share" onclick="VisionMeeting.copyLink()" title="Copier le lien">
                            🔗 Partager
                        </button>
                        <button class="vision-btn-end" onclick="VisionMeeting.end()">
                            📴 Terminer
                        </button>
                    </div>
                </div>
                <div class="vision-jitsi-container" id="vision-jitsi-container"></div>
            </div>
        `;

        // Démarrer le timer
        _startTimer();

        // Lancer Jitsi
        try {
            await VisionJitsi.init(meeting.room_id, 'vision-jitsi-container', {
                displayName,
                title: meeting.title,
                onEnd: (duration) => _handleMeetingEnd(duration)
            });
            // Enregistrer la participation
            await VisionApi.joinMeeting(meeting.room_id, displayName).catch(() => {});
        } catch (err) {
            console.error('❌ VisionMeeting: Jitsi init failed:', err);
            _showJitsiError(err.message);
        }
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

    function _showJitsiError(msg) {
        const c = document.getElementById('vision-jitsi-container');
        if (!c) return;
        c.innerHTML = `
            <div class="vision-error-state">
                <div class="vision-error-icon">⚠️</div>
                <h3>Impossible de lancer la réunion</h3>
                <p>${_escapeHtml(msg)}</p>
                <p>Vérifiez que votre navigateur autorise <strong>meet.jit.si</strong></p>
                <div class="vision-error-actions">
                    <a href="https://meet.jit.si/${_currentMeeting?.room_id || ''}"
                       target="_blank" class="vision-btn-primary">
                        Ouvrir dans un nouvel onglet
                    </a>
                    <button onclick="VisionMain.showHome()" class="vision-btn-secondary">
                        Retour
                    </button>
                </div>
            </div>
        `;
    }

    async function _handleMeetingEnd(duration) {
        clearInterval(_timerInterval);
        if (_currentMeeting) {
            const d = duration || _elapsed;
            await VisionApi.endMeeting(_currentMeeting.room_id, d).catch(() => {});
        }
        VisionMain.showHome();
    }

    async function end() {
        clearInterval(_timerInterval);
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
            if (typeof Toast !== 'undefined') Toast.success('Lien copié dans le presse-papier');
            else alert('Lien : ' + link);
        });
    }

    function _escapeHtml(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    return { show, end, copyLink };
})();

if (typeof window !== 'undefined') window.VisionMeeting = VisionMeeting;
