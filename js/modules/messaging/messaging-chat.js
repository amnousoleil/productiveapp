/**
 * Messaging Chat Module
 * Handles the chat zone (messages area, input)
 */

const MessagingChat = (function() {
    'use strict';

    let currentConversation = null;
    let messages = [];
    let isTyping = false;
    let typingTimeout = null;

    /**
     * Open a conversation
     * @param {Object} conversation
     */
    async function open(conversation) {
        if (!conversation) return;

        currentConversation = conversation;
        renderChatZone();

        try {
            messages = await MessagingAPI.getMessages(conversation.id);
            renderMessages();
            scrollToBottom();
        } catch (error) {
            console.error('❌ Failed to load messages:', error);
            messages = [];
            renderMessages();
        }
    }

    /**
     * Render chat zone structure
     */
    function renderChatZone() {
        const chatEl = document.getElementById('msg-chat');
        if (!chatEl || !currentConversation) return;

        chatEl.innerHTML = `
            ${MessagingUI.renderChatHeader(currentConversation)}
            <div class="msg-messages" id="msg-messages">
                <!-- Messages rendered here -->
            </div>
            <div class="msg-typing" id="msg-typing" style="display: none;">
                <span>écrit</span>
                <div class="msg-typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
            ${MessagingUI.renderChatInput()}
        `;

        // Attach send button listener
        const sendBtn = document.getElementById('msg-send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
    }

    /**
     * Render all messages
     */
    function renderMessages() {
        const messagesEl = document.getElementById('msg-messages');
        if (!messagesEl) return;

        if (messages.length === 0) {
            messagesEl.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 40px;">
                    <div style="font-size: 2rem; margin-bottom: 12px;">👋</div>
                    <div>Démarrez la conversation !</div>
                </div>
            `;
            return;
        }

        messagesEl.innerHTML = messages.map(msg => renderBubble(msg)).join('');
    }

    /**
     * Render single message bubble
     * @param {Object} msg
     */
    function renderBubble(msg) {
        const isMine = msg.senderId === 'me' || msg.senderId === getCurrentUserId();
        const time = formatTime(msg.createdAt);
        const checkIcon = getCheckIcon(msg.status);

        return `
            <div class="msg-bubble-wrapper ${isMine ? 'mine' : 'theirs'}">
                <div class="msg-bubble">${escapeHtml(msg.content)}</div>
                <div class="msg-bubble-time">
                    ${time}
                    ${isMine ? checkIcon : ''}
                </div>
            </div>
        `;
    }

    /**
     * Send a message
     */
    async function sendMessage() {
        const input = document.getElementById('msg-input');
        if (!input || !currentConversation) return;

        const content = input.value.trim();
        if (!content) return;

        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Optimistic add
        const tempMsg = {
            id: 'temp-' + Date.now(),
            content,
            senderId: 'me',
            createdAt: new Date().toISOString(),
            status: 'sending'
        };

        messages.push(tempMsg);
        addBubble(tempMsg);
        scrollToBottom();

        // Send to API
        try {
            const sentMsg = await MessagingAPI.sendMessage(currentConversation.id, content);

            // Update temp message with real data
            const idx = messages.findIndex(m => m.id === tempMsg.id);
            if (idx !== -1) {
                messages[idx] = { ...sentMsg, status: 'sent' };
                updateBubbleStatus(tempMsg.id, 'sent');
            }

            // Update conversation list
            MessagingConversations.updateWithMessage(currentConversation.id, sentMsg);
        } catch (error) {
            console.error('❌ Send failed:', error);
            updateBubbleStatus(tempMsg.id, 'error');
        }
    }

    /**
     * Add a single bubble to the chat
     * @param {Object} msg
     */
    function addBubble(msg) {
        const messagesEl = document.getElementById('msg-messages');
        if (!messagesEl) return;

        // Remove empty state if present
        if (messagesEl.querySelector('[style*="text-align: center"]')) {
            messagesEl.innerHTML = '';
        }

        const div = document.createElement('div');
        div.innerHTML = renderBubble(msg);
        messagesEl.appendChild(div.firstElementChild);
    }

    /**
     * Update bubble status
     * @param {string} msgId
     * @param {string} status
     */
    function updateBubbleStatus(msgId, status) {
        // Find and update the check icon
        const bubble = document.querySelector(`[data-msg-id="${msgId}"] .msg-check`);
        if (bubble) {
            bubble.outerHTML = getCheckIcon(status);
        }
    }

    /**
     * Scroll to bottom of messages
     */
    function scrollToBottom() {
        const messagesEl = document.getElementById('msg-messages');
        if (messagesEl) {
            messagesEl.scrollTo({
                top: messagesEl.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Show typing indicator
     * @param {boolean} show
     */
    function showTyping(show) {
        const typingEl = document.getElementById('msg-typing');
        if (typingEl) {
            typingEl.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Receive a new message (from websocket/polling)
     * @param {Object} msg
     */
    function receiveMessage(msg) {
        if (msg.conversationId !== currentConversation?.id) return;

        messages.push(msg);
        addBubble(msg);
        scrollToBottom();
        showTyping(false);
    }

    /**
     * Get current conversation
     */
    function getCurrent() {
        return currentConversation;
    }

    // ========== Helpers ==========

    function getCurrentUserId() {
        return typeof AppState !== 'undefined' ? AppState.currentUser?.id : 'me';
    }

    function formatTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    function getCheckIcon(status) {
        if (status === 'sending') {
            return '<span class="msg-check">○</span>';
        }
        if (status === 'sent') {
            return '<span class="msg-check">✓</span>';
        }
        if (status === 'read') {
            return '<span class="msg-check read">✓✓</span>';
        }
        if (status === 'error') {
            return '<span class="msg-check" style="color: #ef4444;">!</span>';
        }
        return '<span class="msg-check">✓</span>';
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        open,
        sendMessage,
        receiveMessage,
        showTyping,
        scrollToBottom,
        getCurrent
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingChat = MessagingChat;
}
