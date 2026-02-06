/**
 * Messaging Chat Module
 * Handles the chat zone (messages area, input)
 */

const MessagingChat = (function() {
    'use strict';

    let currentConversation = null;
    let messages = [];

    /**
     * Open a conversation
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
            console.error('MessagingChat: Failed to load messages:', error);
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
                <div style="text-align: center; color: var(--text-muted); padding: 40px;">
                    <div style="font-size: 2rem; margin-bottom: 12px;">&#8987;</div>
                    Chargement...
                </div>
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
                    <div style="font-size: 2rem; margin-bottom: 12px;">&#128075;</div>
                    <div>Démarrez la conversation !</div>
                </div>
            `;
            return;
        }

        const isGroup = currentConversation?.type === 'channel' || currentConversation?.type === 'group';
        messagesEl.innerHTML = messages.map((msg, i) => renderBubble(msg, isGroup, i)).join('');
    }

    /**
     * Render single message bubble
     */
    function renderBubble(msg, isGroup = false, index = 0) {
        const isMine = msg.senderId === getCurrentUserId();
        const time = formatTime(msg.createdAt);
        const checkIcon = getCheckIcon(msg.status);

        // Show sender name + avatar in group chats for other people's messages
        let senderHeader = '';
        if (isGroup && !isMine) {
            // Only show sender if different from previous message
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showSender = !prevMsg || prevMsg.senderId !== msg.senderId;
            if (showSender) {
                const avatar = msg.senderAvatar || MessagingAPI.getUserAvatar(msg.senderId);
                const name = msg.senderName || MessagingAPI.getUserName(msg.senderId);
                senderHeader = `
                    <div class="msg-bubble-sender">
                        <span class="msg-bubble-sender-avatar">${escapeHtml(avatar)}</span>
                        <span class="msg-bubble-sender-name">${escapeHtml(name)}</span>
                    </div>
                `;
            }
        }

        const editedBadge = msg.isEdited ? '<span class="msg-edited">(modifié)</span>' : '';

        return `
            <div class="msg-bubble-wrapper ${isMine ? 'mine' : 'theirs'}" data-msg-id="${msg.id}">
                ${senderHeader}
                <div class="msg-bubble">${escapeHtml(msg.content)}</div>
                <div class="msg-bubble-time">
                    ${time} ${editedBadge}
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
            senderId: getCurrentUserId(),
            senderName: getCurrentUserName(),
            senderAvatar: getCurrentUserAvatar(),
            createdAt: new Date().toISOString(),
            status: 'sending'
        };

        messages.push(tempMsg);
        const isGroup = currentConversation?.type === 'channel' || currentConversation?.type === 'group';
        addBubble(tempMsg, isGroup);
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
            console.error('MessagingChat: Send failed:', error);
            updateBubbleStatus(tempMsg.id, 'error');
        }
    }

    /**
     * Add a single bubble to the chat
     */
    function addBubble(msg, isGroup) {
        const messagesEl = document.getElementById('msg-messages');
        if (!messagesEl) return;

        // Remove empty/loading state if present
        const emptyState = messagesEl.querySelector('[style*="text-align: center"]');
        if (emptyState) {
            messagesEl.innerHTML = '';
        }

        const div = document.createElement('div');
        div.innerHTML = renderBubble(msg, isGroup, messages.length - 1);
        messagesEl.appendChild(div.firstElementChild);
    }

    /**
     * Update bubble status
     */
    function updateBubbleStatus(msgId, status) {
        const wrapper = document.querySelector(`[data-msg-id="${msgId}"]`);
        if (!wrapper) return;

        const checkEl = wrapper.querySelector('.msg-check');
        if (checkEl) {
            checkEl.outerHTML = getCheckIcon(status);
        }
    }

    /**
     * Scroll to bottom of messages
     */
    function scrollToBottom() {
        const messagesEl = document.getElementById('msg-messages');
        if (messagesEl) {
            requestAnimationFrame(() => {
                messagesEl.scrollTo({
                    top: messagesEl.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * Show typing indicator
     */
    function showTyping(show) {
        const typingEl = document.getElementById('msg-typing');
        if (typingEl) {
            typingEl.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Receive a new message (from websocket/polling)
     */
    function receiveMessage(msg) {
        if (msg.conversationId !== currentConversation?.id) return;

        messages.push(msg);
        const isGroup = currentConversation?.type === 'channel' || currentConversation?.type === 'group';
        addBubble(msg, isGroup);
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
        return (typeof AppState !== 'undefined') ? AppState.currentUser?.id : null;
    }

    function getCurrentUserName() {
        // Use selected member name if available
        const memberId = localStorage.getItem('selectedMemberId');
        if (memberId && typeof AppConfig !== 'undefined' && AppConfig.USERS) {
            const member = AppConfig.USERS.find(u => u.id === memberId);
            if (member) return member.name;
        }
        return (typeof AppState !== 'undefined') ? AppState.currentUser?.name : 'Moi';
    }

    function getCurrentUserAvatar() {
        const memberId = localStorage.getItem('selectedMemberId');
        if (memberId) {
            return MessagingAPI.getUserAvatar(memberId);
        }
        return '👤';
    }

    function formatTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' ' +
               date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    function getCheckIcon(status) {
        switch (status) {
            case 'sending': return '<span class="msg-check">&#9675;</span>';
            case 'sent': return '<span class="msg-check">&#10003;</span>';
            case 'read': return '<span class="msg-check read">&#10003;&#10003;</span>';
            case 'error': return '<span class="msg-check" style="color: #ef4444;">!</span>';
            default: return '<span class="msg-check">&#10003;</span>';
        }
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
