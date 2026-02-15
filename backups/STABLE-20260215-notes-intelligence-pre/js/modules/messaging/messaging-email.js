/**
 * Messaging Email Module - TeamTalk Pro
 * Handles email export and sharing of conversations
 */

const MessagingEmail = (function() {
    'use strict';

    /**
     * Show email export modal
     */
    function showExportModal(conversationId) {
        const conv = MessagingConversations?.getActive();
        if (!conv) return;

        const modalHtml = `
            <div class="msg-email-modal-overlay" id="msg-email-modal">
                <div class="msg-email-modal">
                    <div class="msg-email-modal-header">
                        <h3>📧 Envoyer par email</h3>
                        <button class="msg-email-modal-close" onclick="MessagingEmail.closeModal()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="msg-email-modal-body">
                        <div class="msg-email-conv-info">
                            <div class="msg-email-conv-name">${escapeHtml(conv.name || 'Conversation')}</div>
                            <div class="msg-email-conv-meta">
                                ${conv.participants?.length || 0} participants
                            </div>
                        </div>

                        <div class="msg-email-form">
                            <div class="msg-email-form-group">
                                <label for="msg-email-recipient">Destinataire</label>
                                <input
                                    type="email"
                                    id="msg-email-recipient"
                                    class="msg-email-input"
                                    placeholder="nom@exemple.com"
                                    autocomplete="email"
                                />
                            </div>

                            <div class="msg-email-form-group">
                                <label>Type d'export</label>
                                <div class="msg-email-export-types">
                                    <label class="msg-email-export-type active">
                                        <input type="radio" name="export-type" value="summary" checked />
                                        <div class="msg-email-export-card">
                                            <div class="msg-email-export-icon">📝</div>
                                            <div class="msg-email-export-title">Résumé</div>
                                            <div class="msg-email-export-desc">10 derniers messages</div>
                                        </div>
                                    </label>

                                    <label class="msg-email-export-type">
                                        <input type="radio" name="export-type" value="full" />
                                        <div class="msg-email-export-card">
                                            <div class="msg-email-export-icon">📚</div>
                                            <div class="msg-email-export-title">Complet</div>
                                            <div class="msg-email-export-desc">Tous les messages</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="msg-email-actions">
                            <button class="msg-email-btn msg-email-btn-secondary" onclick="MessagingEmail.closeModal()">
                                Annuler
                            </button>
                            <button class="msg-email-btn msg-email-btn-primary" onclick="MessagingEmail.sendEmail('${conversationId}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                                Envoyer
                            </button>
                        </div>

                        <div class="msg-email-history" id="msg-email-history"></div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existing = document.getElementById('msg-email-modal');
        if (existing) existing.remove();

        // Insert modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Attach radio button listeners
        attachRadioListeners();

        // Load history
        loadExportHistory(conversationId);

        // Focus input
        setTimeout(() => {
            document.getElementById('msg-email-recipient')?.focus();
        }, 100);
    }

    /**
     * Attach radio button listeners for visual feedback
     */
    function attachRadioListeners() {
        const radios = document.querySelectorAll('input[name="export-type"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('.msg-email-export-type').forEach(label => {
                    label.classList.remove('active');
                });
                radio.closest('.msg-email-export-type').classList.add('active');
            });
        });
    }

    /**
     * Close modal
     */
    function closeModal() {
        const modal = document.getElementById('msg-email-modal');
        if (modal) {
            modal.classList.add('msg-email-modal-fade-out');
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Send email export
     */
    async function sendEmail(conversationId) {
        const recipientInput = document.getElementById('msg-email-recipient');
        const recipientEmail = recipientInput?.value.trim();

        if (!recipientEmail) {
            showError('Veuillez entrer une adresse email');
            recipientInput?.focus();
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            showError('Adresse email invalide');
            recipientInput?.focus();
            return;
        }

        // Get export type
        const exportType = document.querySelector('input[name="export-type"]:checked')?.value || 'summary';

        // Show loading
        const sendBtn = document.querySelector('.msg-email-btn-primary');
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = `
                <svg class="msg-email-spinner" width="16" height="16" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10" />
                </svg>
                Envoi en cours...
            `;
        }

        try {
            const endpoint = exportType === 'summary'
                ? `/api/v1/messaging/${conversationId}/email/summary`
                : `/api/v1/messaging/${conversationId}/email/full`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ApiTokens.getToken()}`
                },
                body: JSON.stringify({ recipientEmail })
            });

            if (!response.ok) {
                throw new Error('Échec de l\'envoi');
            }

            const data = await response.json();

            // Show success
            showSuccess(data.message || 'Email envoyé avec succès !');

            // Close modal after 1s
            setTimeout(() => {
                closeModal();
            }, 1000);

            // Reload history
            setTimeout(() => {
                loadExportHistory(conversationId);
            }, 500);

        } catch (error) {
            console.error('Failed to send email:', error);
            showError('Erreur lors de l\'envoi de l\'email');

            // Restore button
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    Envoyer
                `;
            }
        }
    }

    /**
     * Load export history
     */
    async function loadExportHistory(conversationId) {
        try {
            const response = await fetch(`/api/v1/messaging/${conversationId}/email/history`, {
                headers: {
                    'Authorization': `Bearer ${ApiTokens.getToken()}`
                }
            });

            if (!response.ok) return;

            const history = await response.json();

            if (history.length === 0) return;

            const historyEl = document.getElementById('msg-email-history');
            if (!historyEl) return;

            historyEl.innerHTML = `
                <div class="msg-email-history-title">📜 Historique des exports</div>
                <div class="msg-email-history-list">
                    ${history.slice(0, 5).map(item => `
                        <div class="msg-email-history-item">
                            <div class="msg-email-history-icon">
                                ${item.exportType === 'summary' ? '📝' : '📚'}
                            </div>
                            <div class="msg-email-history-info">
                                <div class="msg-email-history-recipient">${escapeHtml(item.recipientEmail)}</div>
                                <div class="msg-email-history-meta">
                                    ${item.messageCount} messages • ${formatDate(item.createdAt)}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    /**
     * Add email button to chat header
     */
    function addEmailButtonToHeader() {
        const actionsEl = document.querySelector('.msg-chat-actions');
        if (!actionsEl) return;

        // Check if already exists
        if (document.getElementById('msg-email-btn')) return;

        const conv = MessagingConversations?.getActive();
        if (!conv) return;

        const button = document.createElement('button');
        button.id = 'msg-email-btn';
        button.className = 'msg-chat-action msg-email-header-btn';
        button.title = 'Envoyer par email';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
        `;
        button.addEventListener('click', () => {
            showExportModal(conv.id);
        });

        // Insert before info button
        const infoBtn = document.getElementById('msg-chat-info');
        if (infoBtn) {
            infoBtn.before(button);
        } else {
            actionsEl.appendChild(button);
        }
    }

    /**
     * Show error toast
     */
    function showError(message) {
        if (typeof Toast !== 'undefined') {
            Toast.error(message);
        } else {
            alert(message);
        }
    }

    /**
     * Show success toast
     */
    function showSuccess(message) {
        if (typeof Toast !== 'undefined') {
            Toast.success(message);
        } else {
            console.log('✅', message);
        }
    }

    // ========== Helpers ==========

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 3600) return `il y a ${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`;

        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    return {
        showExportModal,
        closeModal,
        sendEmail,
        addEmailButtonToHeader
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingEmail = MessagingEmail;
}
