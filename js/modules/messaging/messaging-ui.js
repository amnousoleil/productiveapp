/**
 * Messaging UI Module
 * Main layout rendering (two-column layout)
 */

const MessagingUI = (function() {
    'use strict';

    let container = null;

    /**
     * Initialize UI with container
     * @param {HTMLElement} el
     */
    function init(el) {
        container = el;
    }

    /**
     * Render main layout
     */
    function render() {
        if (!container) return;

        container.innerHTML = `
            <div class="msg-container">
                <!-- Left: Conversations List -->
                <aside class="msg-sidebar" id="msg-sidebar">
                    <div class="msg-sidebar-header">
                        <div class="msg-sidebar-title">
                            <span>Messages</span>
                            <button class="msg-new-btn" id="msg-new-btn" title="Nouvelle conversation">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="msg-search">
                            <svg class="msg-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input type="text" class="msg-search-input" id="msg-search-input" placeholder="Rechercher..." autocomplete="off">
                        </div>
                    </div>
                    <div class="msg-conv-list" id="msg-conv-list">
                        <!-- Conversations rendered here -->
                    </div>
                </aside>

                <!-- Right: Chat Zone -->
                <section class="msg-chat" id="msg-chat">
                    <!-- Chat content or empty state -->
                </section>
            </div>
        `;
    }

    /**
     * Render empty state in chat zone
     */
    function renderEmptyState() {
        const chatEl = document.getElementById('msg-chat');
        if (!chatEl) return;

        chatEl.innerHTML = `
            <div class="msg-empty">
                <div class="msg-empty-icon">💬</div>
                <div class="msg-empty-title">Vos messages</div>
                <div class="msg-empty-text">
                    Sélectionnez une conversation ou démarrez-en une nouvelle pour commencer à discuter.
                </div>
            </div>
        `;
    }

    /**
     * Render chat header
     * @param {Object} conversation
     */
    function renderChatHeader(conversation) {
        const participant = conversation.participants?.[0] || {};
        const isOnline = participant.online || false;
        const name = conversation.name || participant.name || 'Conversation';
        const avatar = participant.avatar || '👤';

        return `
            <div class="msg-chat-header">
                <div class="msg-chat-avatar">
                    ${avatar.startsWith('http')
                        ? `<img src="${avatar}" alt="${name}">`
                        : avatar}
                    <div class="msg-status-dot ${isOnline ? 'online' : ''}"></div>
                </div>
                <div class="msg-chat-info">
                    <div class="msg-chat-name">${escapeHtml(name)}</div>
                    <div class="msg-chat-status">${isOnline ? 'En ligne' : 'Hors ligne'}</div>
                </div>
            </div>
        `;
    }

    /**
     * Render chat input area
     */
    function renderChatInput() {
        return `
            <div class="msg-input-area">
                <div class="msg-input-wrapper">
                    <textarea class="msg-input" id="msg-input" placeholder="Écrire un message..." rows="1"></textarea>
                    <button class="msg-emoji-btn" id="msg-emoji-btn" title="Emoji">😊</button>
                </div>
                <button class="msg-send-btn" id="msg-send-btn" title="Envoyer">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        `;
    }

    /**
     * Show loading state
     */
    function showLoading() {
        const listEl = document.getElementById('msg-conv-list');
        if (listEl) {
            listEl.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                    <div style="font-size: 2rem; margin-bottom: 12px;">⏳</div>
                    Chargement...
                </div>
            `;
        }
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get container
     */
    function getContainer() {
        return container;
    }

    return {
        init,
        render,
        renderEmptyState,
        renderChatHeader,
        renderChatInput,
        showLoading,
        getContainer
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingUI = MessagingUI;
}
