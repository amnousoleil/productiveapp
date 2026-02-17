/**
 * ================================================
 * VISION HISTORY - Giri Vision v1.0
 * Historique des réunions passées
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
                    <button class="vision-btn-back" onclick="VisionMain.showHome()">
                        ← Retour
                    </button>
                    <h2 class="vision-history-title">Historique des réunions</h2>
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
                        <h3>Aucune réunion terminée</h3>
                        <p>Vos réunions passées apparaîtront ici</p>
                        <button class="vision-btn-primary" onclick="VisionMain.showHome()">
                            Créer une réunion
                        </button>
                    </div>`;
                return;
            }

            listEl.innerHTML = meetings.map(m => `
                <div class="vision-history-item">
                    <div class="vision-history-item-icon">🎥</div>
                    <div class="vision-history-item-info">
                        <div class="vision-history-item-title">${_escapeHtml(m.title)}</div>
                        <div class="vision-history-item-meta">
                            <span>📅 ${VisionUtils.formatDate(m.started_at || m.created_at)}</span>
                            ${m.duration_seconds ? `<span>⏱ ${VisionUtils.formatDuration(m.duration_seconds)}</span>` : ''}
                            ${m.participants?.length ? `<span>👥 ${m.participants.length} participant(s)</span>` : ''}
                        </div>
                        <div class="vision-history-item-room">${m.room_id}</div>
                    </div>
                    <div class="vision-history-item-actions">
                        <button class="vision-btn-sm vision-btn-secondary"
                            onclick="VisionHistory._copyLink('${m.room_id}')"
                            title="Copier le lien">🔗</button>
                        <button class="vision-btn-sm vision-btn-danger"
                            onclick="VisionHistory._deleteMeeting('${m.room_id}')"
                            title="Supprimer">🗑</button>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            listEl.innerHTML = `
                <div class="vision-error-state">
                    <p>Erreur lors du chargement : ${_escapeHtml(err.message)}</p>
                    <button class="vision-btn-secondary" onclick="VisionHistory.render()">Réessayer</button>
                </div>`;
        }
    }

    function _copyLink(roomId) {
        const link = `https://meet.jit.si/${roomId}`;
        navigator.clipboard.writeText(link).then(() => {
            if (typeof Toast !== 'undefined') Toast.success('Lien copié');
            else alert('Lien : ' + link);
        });
    }

    async function _deleteMeeting(roomId) {
        if (!confirm('Supprimer cette réunion de l\'historique ?')) return;
        try {
            await VisionApi.deleteMeeting(roomId);
            if (typeof Toast !== 'undefined') Toast.success('Réunion supprimée');
            render();
        } catch (err) {
            if (typeof Toast !== 'undefined') Toast.error('Erreur : ' + err.message);
        }
    }

    function _escapeHtml(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    return { render, _copyLink, _deleteMeeting };
})();

if (typeof window !== 'undefined') window.VisionHistory = VisionHistory;
