/**
 * ================================================
 * VISION HOME - Giri Vision v1.1
 * Page d'accueil : créer ou rejoindre une réunion
 * ================================================
 */

const VisionHome = (function () {
    'use strict';

    // Mode courant du modal : 'now' ou 'schedule'
    let _modalMode = 'now';

    function render() {
        const container = document.getElementById('view-giri-vision');
        if (!container) return;

        container.innerHTML = `
            <div class="vision-home-wrapper">
                <div class="vision-home-header">
                    <div class="vision-home-logo">🎥</div>
                    <h1 class="vision-home-title">Giri Vision</h1>
                    <p class="vision-home-subtitle">Réunions vidéo sécurisées pour votre équipe</p>
                </div>

                <div class="vision-home-actions">
                    <!-- Démarrer maintenant -->
                    <div class="vision-action-card vision-action-create">
                        <div class="vision-action-icon">🚀</div>
                        <h3>Démarrer maintenant</h3>
                        <p>Lance une conférence vidéo instantanément</p>
                        <button class="vision-btn-primary" onclick="VisionHome.openModal('now')">
                            Démarrer maintenant
                        </button>
                    </div>

                    <div class="vision-action-divider">ou</div>

                    <!-- Planifier -->
                    <div class="vision-action-card vision-action-schedule">
                        <div class="vision-action-icon">📅</div>
                        <h3>Planifier</h3>
                        <p>Programmez une réunion pour plus tard</p>
                        <button class="vision-btn-secondary" onclick="VisionHome.openModal('schedule')">
                            Planifier une réunion
                        </button>
                    </div>

                    <div class="vision-action-divider">ou</div>

                    <!-- Rejoindre -->
                    <div class="vision-action-card vision-action-join">
                        <div class="vision-action-icon">🔗</div>
                        <h3>Rejoindre</h3>
                        <p>Entrez le code ou l'identifiant</p>
                        <div class="vision-join-form">
                            <input type="text" id="vision-room-code" placeholder="Code de réunion"
                                class="vision-input" maxlength="50"
                                onkeydown="if(event.key==='Enter') VisionHome.joinByCode()">
                            <button class="vision-btn-secondary" onclick="VisionHome.joinByCode()">
                                Rejoindre
                            </button>
                        </div>
                    </div>
                </div>

                <div class="vision-home-recent">
                    <div class="vision-home-section-header">
                        <h2>Réunions planifiées</h2>
                        <button class="vision-link" onclick="VisionMain.showHistory()">Voir l'historique →</button>
                    </div>
                    <div id="vision-scheduled-list" class="vision-scheduled-list">
                        <div class="vision-loading">Chargement...</div>
                    </div>
                </div>

                <!-- Modal création -->
                <div id="vision-create-modal" class="vision-modal-overlay" style="display:none;"
                    onclick="VisionHome._handleOverlayClick(event)">
                    <div class="vision-modal">
                        <div class="vision-modal-header">
                            <h3 id="vision-modal-title">Nouvelle réunion</h3>
                            <button class="vision-modal-close" onclick="VisionHome.closeModal()">✕</button>
                        </div>

                        <!-- Toggle mode -->
                        <div class="vision-modal-tabs">
                            <button id="vision-tab-now" class="vision-tab active"
                                onclick="VisionHome.setMode('now')">
                                🚀 Démarrer maintenant
                            </button>
                            <button id="vision-tab-schedule" class="vision-tab"
                                onclick="VisionHome.setMode('schedule')">
                                📅 Planifier
                            </button>
                        </div>

                        <div class="vision-modal-body">
                            <div class="vision-form-group">
                                <label>Titre <span style="color:rgba(255,255,255,0.4)">(optionnel)</span></label>
                                <input type="text" id="vision-title-input"
                                    placeholder="Ex: Réunion d'équipe"
                                    class="vision-input" maxlength="255"
                                    onkeydown="if(event.key==='Enter' && !event.shiftKey) VisionHome.confirm()">
                            </div>

                            <!-- Champ date/heure — visible seulement en mode 'schedule' -->
                            <div class="vision-form-group" id="vision-schedule-group" style="display:none;">
                                <label>Date et heure <span style="color:#f87171">*</span></label>
                                <input type="datetime-local" id="vision-schedule-input" class="vision-input">
                                <span class="vision-form-hint">La réunion apparaîtra dans "Réunions planifiées"</span>
                            </div>
                        </div>

                        <div class="vision-modal-footer">
                            <button class="vision-btn-secondary" onclick="VisionHome.closeModal()">Annuler</button>
                            <button class="vision-btn-primary" id="vision-confirm-btn" onclick="VisionHome.confirm()">
                                🚀 Démarrer maintenant
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        _loadScheduled();
    }

    async function _loadScheduled() {
        const listEl = document.getElementById('vision-scheduled-list');
        if (!listEl) return;

        try {
            const data = await VisionApi.getMeetings();
            const scheduled = data.scheduled || [];

            if (scheduled.length === 0) {
                listEl.innerHTML = `
                    <div class="vision-empty-state vision-empty-small">
                        <span>Aucune réunion planifiée</span>
                    </div>`;
                return;
            }

            listEl.innerHTML = scheduled.map(m => `
                <div class="vision-scheduled-item">
                    <div class="vision-scheduled-info">
                        <span class="vision-scheduled-title">${_escapeHtml(m.title)}</span>
                        <span class="vision-scheduled-date">📅 ${VisionUtils.formatDate(m.scheduled_at)}</span>
                    </div>
                    <button class="vision-btn-sm vision-btn-primary"
                        onclick="VisionHome._joinMeeting('${m.room_id}')">
                        Démarrer
                    </button>
                </div>
            `).join('');
        } catch (err) {
            listEl.innerHTML = `<div class="vision-error-small">Erreur de chargement</div>`;
        }
    }

    function openModal(mode) {
        _modalMode = mode || 'now';
        const modal = document.getElementById('vision-create-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        // Appliquer le mode sans délai
        _applyMode(_modalMode);
        setTimeout(() => document.getElementById('vision-title-input')?.focus(), 100);
    }

    function closeModal() {
        const modal = document.getElementById('vision-create-modal');
        if (modal) modal.style.display = 'none';
        // Reset
        const titleEl = document.getElementById('vision-title-input');
        const scheduleEl = document.getElementById('vision-schedule-input');
        if (titleEl) titleEl.value = '';
        if (scheduleEl) scheduleEl.value = '';
    }

    function setMode(mode) {
        _modalMode = mode;
        _applyMode(mode);
    }

    function _applyMode(mode) {
        const tabNow = document.getElementById('vision-tab-now');
        const tabSchedule = document.getElementById('vision-tab-schedule');
        const scheduleGroup = document.getElementById('vision-schedule-group');
        const confirmBtn = document.getElementById('vision-confirm-btn');

        if (mode === 'now') {
            tabNow?.classList.add('active');
            tabSchedule?.classList.remove('active');
            if (scheduleGroup) scheduleGroup.style.display = 'none';
            if (confirmBtn) { confirmBtn.textContent = '🚀 Démarrer maintenant'; confirmBtn.disabled = false; }
        } else {
            tabNow?.classList.remove('active');
            tabSchedule?.classList.add('active');
            if (scheduleGroup) scheduleGroup.style.display = 'flex';
            if (confirmBtn) { confirmBtn.textContent = '📅 Enregistrer la réunion'; confirmBtn.disabled = false; }
        }
    }

    function _handleOverlayClick(e) {
        if (e.target === e.currentTarget) closeModal();
    }

    async function confirm() {
        const titleEl = document.getElementById('vision-title-input');
        const scheduleEl = document.getElementById('vision-schedule-input');
        const btn = document.getElementById('vision-confirm-btn');

        const title = titleEl?.value.trim() || 'Réunion Giri Vision';

        if (_modalMode === 'schedule') {
            const scheduledAt = scheduleEl?.value;
            if (!scheduledAt) {
                if (typeof Toast !== 'undefined') Toast.warning('Choisissez une date et heure');
                scheduleEl?.focus();
                return;
            }
            // Vérifier que la date est dans le futur
            if (new Date(scheduledAt) <= new Date()) {
                if (typeof Toast !== 'undefined') Toast.warning('La date doit être dans le futur');
                scheduleEl?.focus();
                return;
            }
            btn.disabled = true;
            btn.textContent = 'Enregistrement...';
            try {
                await VisionApi.createMeeting(title, scheduledAt);
                closeModal();
                if (typeof Toast !== 'undefined') Toast.success('Réunion planifiée !');
                render();
            } catch (err) {
                btn.disabled = false;
                btn.textContent = '📅 Enregistrer la réunion';
                if (typeof Toast !== 'undefined') Toast.error('Erreur : ' + err.message);
            }
        } else {
            // Démarrer maintenant
            btn.disabled = true;
            btn.textContent = 'Démarrage...';
            try {
                const data = await VisionApi.createMeeting(title, null);
                closeModal();
                VisionMeeting.show(data.meeting);
            } catch (err) {
                btn.disabled = false;
                btn.textContent = '🚀 Démarrer maintenant';
                if (typeof Toast !== 'undefined') Toast.error('Erreur : ' + err.message);
            }
        }
    }

    async function joinByCode() {
        const input = document.getElementById('vision-room-code');
        if (!input) return;
        const code = VisionUtils.sanitizeRoomId(input.value);
        if (!code) {
            if (typeof Toast !== 'undefined') Toast.warning('Entrez un code de réunion');
            return;
        }
        await _joinMeeting(code);
    }

    async function _joinMeeting(roomId) {
        try {
            const data = await VisionApi.getMeeting(roomId);
            if (!data.meeting) throw new Error('Réunion introuvable');
            VisionMeeting.show(data.meeting);
        } catch (err) {
            if (typeof Toast !== 'undefined') Toast.error('Réunion introuvable : ' + err.message);
            else alert('Réunion introuvable : ' + err.message);
        }
    }

    function _escapeHtml(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    return { render, openModal, closeModal, setMode, confirm, joinByCode, _joinMeeting, _handleOverlayClick };
})();

if (typeof window !== 'undefined') window.VisionHome = VisionHome;
