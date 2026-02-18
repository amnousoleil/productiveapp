/**
 * ================================================
 * VISION HOME - Giri Vision v3.0
 * Dashboard consultant professionnel
 * AUCUNE mention Jitsi/ffmuc — 100% marque Giri
 * ================================================
 */

const VisionHome = (function () {
    'use strict';

    let _modalMode = 'now';

    function render() {
        const container = document.getElementById('view-giri-vision');
        if (!container) return;

        const user = typeof VisionUtils !== 'undefined' ? VisionUtils.getCurrentUser() : {};
        const firstName = (user.displayName || user.name || 'Consultant').split(' ')[0];
        const stats = _getStats();

        container.innerHTML = `
            <div class="vision-home-wrapper">
                <!-- Header Pro -->
                <div class="vision-pro-header">
                    <div class="vision-pro-header-left">
                        <div class="vision-pro-logo">
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="20" fill="url(#gvh-g)"/>
                                <rect x="10" y="14" width="14" height="12" rx="3" fill="white" opacity="0.9"/>
                                <path d="M24 17L31 13v14L24 23V17z" fill="white" opacity="0.85"/>
                                <defs><linearGradient id="gvh-g" x1="0" y1="0" x2="40" y2="40">
                                    <stop stop-color="#7c3aed"/><stop offset="1" stop-color="#2563eb"/>
                                </linearGradient></defs>
                            </svg>
                        </div>
                        <div>
                            <h1 class="vision-pro-title">Giri Vision</h1>
                            <p class="vision-pro-greeting">Bonjour, ${_esc(firstName)} — Bienvenue dans votre studio</p>
                        </div>
                    </div>
                    <div class="vision-pro-header-actions">
                        <button class="vision-btn-history" onclick="VisionMain.showHistory()">
                            📋 Historique
                        </button>
                        <button class="vision-btn-primary vision-btn-new" onclick="VisionHome.openModal('now')">
                            ▶ Démarrer
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div class="vision-stats-row">
                    <div class="vision-stat-card vision-stat-revenue">
                        <div class="vision-stat-icon">💰</div>
                        <div class="vision-stat-value" id="vstat-revenue">${stats.revenue}€</div>
                        <div class="vision-stat-label">Revenus ce mois</div>
                    </div>
                    <div class="vision-stat-card vision-stat-sessions">
                        <div class="vision-stat-icon">🎯</div>
                        <div class="vision-stat-value" id="vstat-sessions">${stats.sessions}</div>
                        <div class="vision-stat-label">Séances totales</div>
                    </div>
                    <div class="vision-stat-card vision-stat-clients">
                        <div class="vision-stat-icon">👥</div>
                        <div class="vision-stat-value" id="vstat-clients">${stats.clients}</div>
                        <div class="vision-stat-label">Clients actifs</div>
                    </div>
                    <div class="vision-stat-card vision-stat-time">
                        <div class="vision-stat-icon">⏱</div>
                        <div class="vision-stat-value" id="vstat-hours">${stats.hours}h</div>
                        <div class="vision-stat-label">Heures de séances</div>
                    </div>
                </div>

                <!-- Main Grid -->
                <div class="vision-main-grid">
                    <!-- Colonne actions -->
                    <div class="vision-actions-col">
                        <h3 class="vision-col-title">Actions rapides</h3>

                        <button class="vision-action-btn vision-action-instant" onclick="VisionHome.openModal('now')">
                            <div class="vision-action-btn-icon">▶</div>
                            <div class="vision-action-btn-text">
                                <strong>Séance instantanée</strong>
                                <span>Démarrez en 1 clic, lien partageable</span>
                            </div>
                        </button>

                        <button class="vision-action-btn vision-action-schedule" onclick="VisionHome.openModal('schedule')">
                            <div class="vision-action-btn-icon">📅</div>
                            <div class="vision-action-btn-text">
                                <strong>Planifier une séance</strong>
                                <span>Date, heure, titre client</span>
                            </div>
                        </button>

                        <div class="vision-join-section">
                            <h4 class="vision-join-title">Rejoindre par code</h4>
                            <div class="vision-join-input-row">
                                <input type="text" id="vision-room-code"
                                    placeholder="Code de séance"
                                    class="vision-input" maxlength="50"
                                    onkeydown="if(event.key==='Enter') VisionHome.joinByCode()">
                                <button class="vision-btn-join-small" onclick="VisionHome.joinByCode()">→</button>
                            </div>
                        </div>

                        <div class="vision-package-card">
                            <div class="vision-package-header">
                                <span class="vision-package-icon">💎</span>
                                <span class="vision-package-title">Forfaits séances</span>
                            </div>
                            <p class="vision-package-desc">Vendez des packs de séances à vos clients et boostez votre cash flow instantanément.</p>
                            <button class="vision-btn-packages"
                                onclick="typeof VisionPro !== 'undefined' && VisionPro.showPackages()">
                                Gérer mes forfaits →
                            </button>
                        </div>
                    </div>

                    <!-- Colonne planning -->
                    <div class="vision-schedule-col">
                        <div class="vision-schedule-section">
                            <div class="vision-section-header">
                                <h3 class="vision-col-title">Séances planifiées</h3>
                                <span class="vision-section-count" id="vision-scheduled-count">—</span>
                            </div>
                            <div id="vision-scheduled-list" class="vision-scheduled-list">
                                <div class="vision-loading-small">Chargement...</div>
                            </div>
                        </div>

                        <div class="vision-recent-section">
                            <div class="vision-section-header">
                                <h3 class="vision-col-title">Séances récentes</h3>
                            </div>
                            <div id="vision-recent-list" class="vision-recent-list">
                                <div class="vision-loading-small">Chargement...</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal -->
                <div id="vision-create-modal" class="vision-modal-overlay" style="display:none;"
                    onclick="VisionHome._handleOverlayClick(event)">
                    <div class="vision-modal">
                        <div class="vision-modal-header">
                            <h3 id="vision-modal-title">Nouvelle séance</h3>
                            <button class="vision-modal-close" onclick="VisionHome.closeModal()">✕</button>
                        </div>
                        <div class="vision-modal-tabs">
                            <button id="vision-tab-now" class="vision-tab active" onclick="VisionHome.setMode('now')">
                                ▶ Maintenant
                            </button>
                            <button id="vision-tab-schedule" class="vision-tab" onclick="VisionHome.setMode('schedule')">
                                📅 Planifier
                            </button>
                        </div>
                        <div class="vision-modal-body">
                            <div class="vision-form-group">
                                <label>Titre <span class="vision-optional">(optionnel)</span></label>
                                <input type="text" id="vision-title-input"
                                    placeholder="Ex: Coaching développement personnel"
                                    class="vision-input" maxlength="255"
                                    onkeydown="if(event.key==='Enter') VisionHome.confirm()">
                            </div>
                            <div class="vision-form-group" id="vision-schedule-group" style="display:none;">
                                <label>Date et heure <span class="vision-required">*</span></label>
                                <input type="datetime-local" id="vision-schedule-input" class="vision-input">
                                <span class="vision-form-hint">Apparaîtra dans "Séances planifiées"</span>
                            </div>
                        </div>
                        <div class="vision-modal-footer">
                            <button class="vision-btn-secondary" onclick="VisionHome.closeModal()">Annuler</button>
                            <button class="vision-btn-primary" id="vision-confirm-btn" onclick="VisionHome.confirm()">
                                ▶ Démarrer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        _loadSessions();
    }

    function _getStats() {
        const raw = localStorage.getItem('gv_stats') || '{}';
        const s = JSON.parse(raw);
        return {
            revenue: s.revenue || 0,
            sessions: s.sessions || 0,
            clients: s.clients || 0,
            hours: s.hours || 0
        };
    }

    async function _loadSessions() {
        const scheduledEl = document.getElementById('vision-scheduled-list');
        const recentEl = document.getElementById('vision-recent-list');
        const countEl = document.getElementById('vision-scheduled-count');

        try {
            const data = await VisionApi.getMeetings();
            const scheduled = data.scheduled || [];
            const recent = (data.meetings || []).filter(m => m.status === 'ended').slice(0, 5);

            // Compteur planifiées
            if (countEl) countEl.textContent = scheduled.length || '0';

            // Liste planifiées
            if (scheduledEl) {
                if (scheduled.length === 0) {
                    scheduledEl.innerHTML = `<div class="vision-empty-small">Aucune séance planifiée</div>`;
                } else {
                    scheduledEl.innerHTML = scheduled.map(m => `
                        <div class="vision-scheduled-item">
                            <div class="vision-scheduled-info">
                                <span class="vision-scheduled-title">${_esc(m.title || 'Séance sans titre')}</span>
                                <span class="vision-scheduled-date">📅 ${VisionUtils.formatDate(m.scheduled_at)}</span>
                            </div>
                            <button class="vision-btn-sm vision-btn-primary"
                                onclick="VisionHome._joinSession('${m.room_id}')">▶</button>
                        </div>
                    `).join('');
                }
            }

            // Liste récentes
            if (recentEl) {
                if (recent.length === 0) {
                    recentEl.innerHTML = `<div class="vision-empty-small">Aucune séance terminée</div>`;
                } else {
                    recentEl.innerHTML = recent.map(m => `
                        <div class="vision-recent-item">
                            <div class="vision-history-item-icon">✅</div>
                            <div class="vision-recent-info">
                                <span class="vision-recent-title">${_esc(m.title || 'Séance')}</span>
                                <div class="vision-recent-meta">
                                    <span>${VisionUtils.formatDate(m.ended_at || m.created_at)}</span>
                                    ${m.duration_seconds ? `<span class="vision-recent-duration">${VisionUtils.formatDuration(m.duration_seconds)}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // Mettre à jour stats depuis API
            const totalSessions = (data.meetings || []).filter(m => m.status === 'ended').length;
            const totalHours = Math.round((data.meetings || []).reduce((sum, m) => sum + (m.duration_seconds || 0), 0) / 3600);
            const saved = JSON.parse(localStorage.getItem('gv_stats') || '{}');
            saved.sessions = totalSessions;
            saved.hours = totalHours;
            localStorage.setItem('gv_stats', JSON.stringify(saved));
            const sesEl = document.getElementById('vstat-sessions');
            const hrsEl = document.getElementById('vstat-hours');
            if (sesEl) sesEl.textContent = totalSessions;
            if (hrsEl) hrsEl.textContent = totalHours + 'h';

        } catch (e) {
            if (scheduledEl) scheduledEl.innerHTML = `<div class="vision-empty-small">Non disponible hors connexion</div>`;
            if (recentEl) recentEl.innerHTML = `<div class="vision-empty-small">Non disponible hors connexion</div>`;
        }
    }

    function openModal(mode) {
        _modalMode = mode || 'now';
        const modal = document.getElementById('vision-create-modal');
        if (modal) modal.style.display = 'flex';
        _applyMode(_modalMode);
        setTimeout(() => document.getElementById('vision-title-input')?.focus(), 80);
    }

    function closeModal() {
        const modal = document.getElementById('vision-create-modal');
        if (modal) modal.style.display = 'none';
        const t = document.getElementById('vision-title-input');
        const s = document.getElementById('vision-schedule-input');
        if (t) t.value = '';
        if (s) s.value = '';
    }

    function setMode(mode) {
        _modalMode = mode;
        _applyMode(mode);
    }

    function _applyMode(mode) {
        const tabNow = document.getElementById('vision-tab-now');
        const tabSched = document.getElementById('vision-tab-schedule');
        const schedGrp = document.getElementById('vision-schedule-group');
        const btn = document.getElementById('vision-confirm-btn');
        if (mode === 'now') {
            tabNow?.classList.add('active'); tabSched?.classList.remove('active');
            if (schedGrp) schedGrp.style.display = 'none';
            if (btn) { btn.textContent = '▶ Démarrer'; btn.disabled = false; }
        } else {
            tabNow?.classList.remove('active'); tabSched?.classList.add('active');
            if (schedGrp) schedGrp.style.display = 'flex';
            if (btn) { btn.textContent = '📅 Enregistrer'; btn.disabled = false; }
        }
    }

    function _handleOverlayClick(e) { if (e.target === e.currentTarget) closeModal(); }

    async function confirm() {
        const titleEl = document.getElementById('vision-title-input');
        const schedEl = document.getElementById('vision-schedule-input');
        const btn = document.getElementById('vision-confirm-btn');
        const title = titleEl?.value.trim() || 'Séance Giri Vision';

        if (_modalMode === 'schedule') {
            const at = schedEl?.value;
            if (!at) { typeof Toast !== 'undefined' && Toast.warning('Choisissez une date'); schedEl?.focus(); return; }
            if (new Date(at) <= new Date()) { typeof Toast !== 'undefined' && Toast.warning('La date doit être dans le futur'); return; }
            btn.disabled = true; btn.textContent = 'Enregistrement...';
            try {
                await VisionApi.createMeeting(title, at);
                closeModal();
                typeof Toast !== 'undefined' && Toast.success('Séance planifiée !');
                render();
            } catch (e) { btn.disabled = false; btn.textContent = '📅 Enregistrer'; typeof Toast !== 'undefined' && Toast.error(e.message); }
        } else {
            btn.disabled = true; btn.textContent = 'Démarrage...';
            try {
                const data = await VisionApi.createMeeting(title, null);
                closeModal();
                VisionMeeting.show(data.meeting);
            } catch (e) { btn.disabled = false; btn.textContent = '▶ Démarrer'; typeof Toast !== 'undefined' && Toast.error(e.message); }
        }
    }

    async function joinByCode() {
        const input = document.getElementById('vision-room-code');
        if (!input) return;
        const code = VisionUtils.sanitizeRoomId(input.value);
        if (!code) { typeof Toast !== 'undefined' && Toast.warning('Entrez un code de séance'); return; }
        await _joinSession(code);
    }

    async function _joinSession(roomId) {
        try {
            const data = await VisionApi.getMeeting(roomId);
            if (!data.meeting) throw new Error('Séance introuvable');
            VisionMeeting.show(data.meeting);
        } catch (e) { typeof Toast !== 'undefined' && Toast.error('Séance introuvable'); }
    }

    function _esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    return { render, openModal, closeModal, setMode, confirm, joinByCode, _joinSession, _handleOverlayClick };
})();

if (typeof window !== 'undefined') window.VisionHome = VisionHome;
