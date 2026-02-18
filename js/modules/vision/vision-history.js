/**
 * ================================================
 * VISION HISTORY - Giri Vision v2.0
 * Historique des séances — AUCUNE ref externe
 * ================================================
 */

const VisionHistory = (function () {
    'use strict';

    function render() {
        const container = document.getElementById('view-giri-vision');
        if (!container) return;

        container.innerHTML = `
            <div class="vision-history-wrapper">
                <div class="vision-history-header">
                    <button class="vision-btn-back" onclick="VisionMain.showHome()">← Retour</button>
                    <h2 class="vision-history-title">Historique des séances</h2>
                </div>
                <div id="vision-history-list" class="vision-history-list">
                    <div class="vision-loading">Chargement de l'historique...</div>
                </div>
            </div>
        `;

        _loadHistory();
    }

    async function _loadHistory() {
        const listEl = document.getElementById('vision-history-list');
        if (!listEl) return;

        try {
            const data = await VisionApi.getMeetings();
            const meetings = (data.meetings || []).filter(m => m.status === 'ended');

            if (meetings.length === 0) {
                listEl.innerHTML = `
                    <div class="vision-empty-state">
                        <div class="vision-empty-icon">📋</div>
                        <h3>Aucune séance terminée</h3>
                        <p>Vos séances passées apparaîtront ici</p>
                        <button class="vision-btn-primary" onclick="VisionMain.showHome()">
                            Démarrer une séance
                        </button>
                    </div>`;
                return;
            }

            listEl.innerHTML = meetings.map(m => {
                const notes = _getSessionNotes(m.room_id);
                return `
                <div class="vision-history-item">
                    <div class="vision-history-item-icon">🎥</div>
                    <div class="vision-history-item-info">
                        <div class="vision-history-item-title">${_esc(m.title || 'Séance sans titre')}</div>
                        <div class="vision-history-item-meta">
                            <span>📅 ${VisionUtils.formatDate(m.started_at || m.created_at)}</span>
                            ${m.duration_seconds ? `<span>⏱ ${VisionUtils.formatDuration(m.duration_seconds)}</span>` : ''}
                            ${m.participants?.length ? `<span>👥 ${m.participants.length} participant(s)</span>` : ''}
                            ${notes ? `<span>📝 Note</span>` : ''}
                        </div>
                        <div class="vision-history-item-room">Code : ${_esc(m.room_id)}</div>
                    </div>
                    <div class="vision-history-item-actions">
                        <button class="vision-btn-sm vision-btn-secondary"
                            onclick="VisionHistory._shareCode('${_esc(m.room_id)}')"
                            title="Partager le code">🔗</button>
                        <button class="vision-btn-sm vision-btn-danger"
                            onclick="VisionHistory._deleteSession('${_esc(m.room_id)}')"
                            title="Supprimer">🗑</button>
                    </div>
                </div>`;
            }).join('');
        } catch (err) {
            listEl.innerHTML = `
                <div class="vision-error-state">
                    <div class="vision-error-icon">⚠️</div>
                    <p>Erreur lors du chargement</p>
                    <div class="vision-error-actions">
                        <button class="vision-btn-secondary" onclick="VisionHistory.render()">Réessayer</button>
                    </div>
                </div>`;
        }
    }

    /** Partage uniquement le code de séance — AUCUNE URL externe */
    function _shareCode(roomId) {
        const msg = `Code de séance Giri Vision : ${roomId}`;
        navigator.clipboard.writeText(msg).then(() => {
            typeof Toast !== 'undefined' && Toast.success('Code copié — partagez-le à vos participants');
        }).catch(() => {
            typeof Toast !== 'undefined' && Toast.info('Code : ' + roomId);
        });
    }

    function _getSessionNotes(roomId) {
        const all = JSON.parse(localStorage.getItem('gv_session_notes') || '{}');
        return all[roomId] || null;
    }

    async function _deleteSession(roomId) {
        if (!confirm('Supprimer cette séance de l\'historique ?')) return;
        try {
            await VisionApi.deleteMeeting(roomId);
            typeof Toast !== 'undefined' && Toast.success('Séance supprimée');
            render();
        } catch (err) {
            typeof Toast !== 'undefined' && Toast.error('Erreur : ' + err.message);
        }
    }

    function _esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    return { render, _shareCode, _deleteSession };
})();

if (typeof window !== 'undefined') window.VisionHistory = VisionHistory;
