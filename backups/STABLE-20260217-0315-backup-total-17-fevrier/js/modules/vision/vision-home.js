/**
 * ================================================
 * VISION HOME - Giri Vision v1.0
 * Page d'accueil : créer ou rejoindre une réunion
 * ================================================
 */

const VisionHome = (function () {
    'use strict';

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
                    <div class="vision-action-card vision-action-create">
                        <div class="vision-action-icon">✨</div>
                        <h3>Nouvelle réunion</h3>
                        <p>Démarrez une conférence vidéo instantanément</p>
                        <button class="vision-btn-primary" onclick="VisionHome.startCreate()">
                            Créer une réunion
                        </button>
                    </div>

                    <div class="vision-action-divider">ou</div>

                    <div class="vision-action-card vision-action-join">
                        <div class="vision-action-icon">🔗</div>
                        <h3>Rejoindre</h3>
                        <p>Entrez le code ou l'identifiant de réunion</p>
                        <div class="vision-join-form">
                            <input type="text" id="vision-room-code" placeholder="Code de réunion (ex: abc-def-ghi)"
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
                <div id="vision-create-modal" class="vision-modal-overlay" style="display:none;">
                    <div class="vision-modal">
                        <div class="vision-modal-header">
                            <h3>Créer une réunion</h3>
                            <button class="vision-modal-close" onclick="VisionHome.closeCreate()">✕</button>
                        </div>
                        <div class="vision-modal-body">
                            <div class="vision-form-group">
                                <label>Titre de la réunion</label>
                                <input type="text" id="vision-title-input"
                                    placeholder="Ex: Réunion d'équipe hebdomadaire"
                                    class="vision-input" maxlength="255">
                            </div>
                            <div class="vision-form-group">
                                <label>Planifier (optionnel)</label>
                                <input type="datetime-local" id="vision-schedule-input" class="vision-input">
                            </div>
                        </div>
                        <div class="vision-modal-footer">
                            <button class="vision-btn-secondary" onclick="VisionHome.closeCreate()">Annuler</button>
                            <button class="vision-btn-primary" id="vision-create-btn" onclick="VisionHome.confirmCreate()">
                                🚀 Démarrer
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
                        Rejoindre
                    </button>
                </div>
            `).join('');
        } catch (err) {
            listEl.innerHTML = `<div class="vision-error-small">Erreur de chargement</div>`;
        }
    }

    function startCreate() {
        document.getElementById('vision-create-modal').style.display = 'flex';
        setTimeout(() => document.getElementById('vision-title-input')?.focus(), 100);
    }

    function closeCreate() {
        document.getElementById('vision-create-modal').style.display = 'none';
    }

    async function confirmCreate() {
        const titleEl = document.getElementById('vision-title-input');
        const scheduleEl = document.getElementById('vision-schedule-input');
        const btn = document.getElementById('vision-create-btn');

        const title = titleEl?.value.trim() || 'Réunion Giri Vision';
        const scheduledAt = scheduleEl?.value || null;

        btn.disabled = true;
        btn.textContent = 'Création...';

        try {
            const data = await VisionApi.createMeeting(title, scheduledAt);
            closeCreate();
            if (scheduledAt) {
                if (typeof Toast !== 'undefined') Toast.success('Réunion planifiée !');
                render();
            } else {
                VisionMeeting.show(data.meeting);
            }
        } catch (err) {
            btn.disabled = false;
            btn.textContent = '🚀 Démarrer';
            if (typeof Toast !== 'undefined') Toast.error('Erreur : ' + err.message);
            else alert('Erreur : ' + err.message);
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

    return { render, startCreate, closeCreate, confirmCreate, joinByCode, _joinMeeting };
})();

if (typeof window !== 'undefined') window.VisionHome = VisionHome;
