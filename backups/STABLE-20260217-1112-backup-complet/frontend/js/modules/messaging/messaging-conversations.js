/**
 * Messaging Conversations Module
 * Handles the conversations list on the left panel
 */

const MessagingConversations = (function() {
    'use strict';

    let conversations = [];
    let activeConversationId = null;
    let onSelectCallback = null;

    /**
     * Set callback for conversation selection
     * @param {Function} callback
     */
    function onSelect(callback) {
        onSelectCallback = callback;
    }

    /**
     * Load and render conversations
     */
    async function load() {
        try {
            conversations = await MessagingAPI.getConversations();
            render();
        } catch (error) {
            console.error('❌ Failed to load conversations:', error);
            conversations = [];
            render();
        }
    }

    /**
     * Render conversations list
     */
    function render() {
        const listEl = document.getElementById('msg-conv-list');
        if (!listEl) return;

        if (conversations.length === 0) {
            listEl.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
                    <div style="font-size: 2rem; margin-bottom: 12px;">📭</div>
                    <div style="font-size: 0.9rem;">Aucune conversation</div>
                    <div style="font-size: 0.8rem; margin-top: 8px;">Cliquez sur + pour en créer une</div>
                </div>
            `;
            return;
        }

        listEl.innerHTML = conversations.map(conv => renderItem(conv)).join('');
        attachListeners();
    }

    /**
     * Render single conversation item
     * @param {Object} conv
     */
    function renderItem(conv) {
        const isActive = conv.id === activeConversationId;
        const participant = conv.participants?.[0] || {};
        const name = conv.name || participant.name || 'Conversation';
        const avatar = participant.avatar || '👤';
        const lastMsg = conv.lastMessage?.content || '';
        const time = formatRelativeTime(conv.lastMessage?.createdAt);
        const unread = conv.unreadCount || 0;

        return `
            <div class="msg-conv-item ${isActive ? 'active' : ''}" data-id="${conv.id}">
                <div class="msg-conv-avatar">
                    ${(avatar.startsWith('http') || avatar.startsWith('/uploads'))
                        ? `<img src="${avatar}" alt="${name}">`
                        : avatar}
                </div>
                <div class="msg-conv-info">
                    <div class="msg-conv-header">
                        <span class="msg-conv-name">${escapeHtml(name)}</span>
                        <span class="msg-conv-time">${time}</span>
                    </div>
                    <div class="msg-conv-preview">${escapeHtml(truncate(lastMsg, 40))}</div>
                </div>
                ${unread > 0 ? `<span class="msg-conv-badge">${unread > 99 ? '99+' : unread}</span>` : ''}
            </div>
        `;
    }

    /**
     * Attach click listeners
     */
    function attachListeners() {
        const items = document.querySelectorAll('.msg-conv-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                selectConversation(id);
            });
        });
    }

    /**
     * Select a conversation
     * @param {string} id
     */
    function selectConversation(id) {
        if (id === activeConversationId) return;

        activeConversationId = id;

        // Update active class
        document.querySelectorAll('.msg-conv-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === id);
        });

        // Clear unread badge
        const conv = conversations.find(c => c.id === id);
        if (conv) {
            conv.unreadCount = 0;
            MessagingAPI.markAsRead(id);
        }

        // Callback
        if (onSelectCallback) {
            onSelectCallback(conv);
        }
    }

    /**
     * Filter conversations by search
     * @param {string} query
     */
    function filter(query) {
        const listEl = document.getElementById('msg-conv-list');
        if (!listEl) return;

        const q = query.toLowerCase().trim();

        if (!q) {
            render();
            return;
        }

        const filtered = conversations.filter(conv => {
            const name = (conv.name || conv.participants?.[0]?.name || '').toLowerCase();
            const lastMsg = (conv.lastMessage?.content || '').toLowerCase();
            return name.includes(q) || lastMsg.includes(q);
        });

        listEl.innerHTML = filtered.map(conv => renderItem(conv)).join('');
        attachListeners();
    }

    /**
     * Update conversation with new message
     * @param {string} conversationId
     * @param {Object} message
     */
    function updateWithMessage(conversationId, message) {
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) {
            conv.lastMessage = message;
            if (conversationId !== activeConversationId) {
                conv.unreadCount = (conv.unreadCount || 0) + 1;
            }
            // Move to top
            conversations = [conv, ...conversations.filter(c => c.id !== conversationId)];
            render();
        }
    }

    /**
     * Get active conversation
     */
    function getActive() {
        return conversations.find(c => c.id === activeConversationId);
    }

    /**
     * Get all conversations
     */
    function getAll() {
        return conversations;
    }

    // ========== Helpers ==========

    function formatRelativeTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'maintenant';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    function truncate(str, len) {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '...' : str;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        load,
        render,
        filter,
        selectConversation,
        updateWithMessage,
        getActive,
        getAll,
        onSelect
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingConversations = MessagingConversations;
}
