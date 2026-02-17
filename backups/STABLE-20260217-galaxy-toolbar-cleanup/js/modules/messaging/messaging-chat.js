/**
 * Messaging Chat Module - Premium Edition
 * Handles the chat zone with file sharing support
 */

const MessagingChat = (function() {
    'use strict';

    let currentConversation = null;
    let messages = [];
    let pendingUploads = []; // Files waiting to be sent

    /**
     * Open a conversation
     */
    async function open(conversation) {
        if (!conversation) return;

        currentConversation = conversation;
        pendingUploads = [];
        renderChatZone();
        setupEventListeners();

        try {
            messages = await MessagingAPI.getMessages(conversation.id);
            renderMessages();
            scrollToBottom();

            // Mark as read
            MessagingAPI.markAsRead(conversation.id);
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
                <div class="msg-skeleton msg-skeleton-bubble"></div>
                <div class="msg-skeleton msg-skeleton-bubble mine"></div>
                <div class="msg-skeleton msg-skeleton-bubble"></div>
            </div>
            <div class="msg-typing" id="msg-typing" style="display: none;">
                <span>ecrit</span>
                <div class="msg-typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
            ${MessagingUI.renderChatInput()}
        `;
    }

    /**
     * Setup event listeners for chat interactions
     */
    function setupEventListeners() {
        // Send button
        const sendBtn = document.getElementById('msg-send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }

        // Enter key to send
        const input = document.getElementById('msg-input');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Auto-resize textarea
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 150) + 'px';
            });
        }

        // File input handlers
        const fileInput = document.getElementById('msg-file-input');
        const imageInput = document.getElementById('msg-image-input');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => handleFileSelect(e, 'file'));
        }
        if (imageInput) {
            imageInput.addEventListener('change', (e) => handleFileSelect(e, 'image'));
        }

        // Emoji button (simple implementation)
        const emojiBtn = document.getElementById('msg-emoji-btn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', toggleEmojiPicker);
        }
    }

    /**
     * Handle file selection
     */
    function handleFileSelect(event, type) {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        files.forEach(file => {
            // Check file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                alert(`Le fichier "${file.name}" depasse la limite de 10MB`);
                return;
            }

            const upload = {
                id: 'upload-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                file: file,
                type: type === 'image' && file.type.startsWith('image/') ? 'image' : 'file',
                preview: null
            };

            // Generate preview for images
            if (upload.type === 'image') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    upload.preview = e.target.result;
                    renderUploadPreview();
                };
                reader.readAsDataURL(file);
            }

            pendingUploads.push(upload);
        });

        renderUploadPreview();
        event.target.value = ''; // Reset input
    }

    /**
     * Render upload preview area
     */
    function renderUploadPreview() {
        const previewEl = document.getElementById('msg-upload-preview');
        if (!previewEl) return;

        if (pendingUploads.length === 0) {
            previewEl.style.display = 'none';
            previewEl.innerHTML = '';
            return;
        }

        previewEl.style.display = 'flex';
        previewEl.innerHTML = pendingUploads.map(upload => {
            if (upload.type === 'image' && upload.preview) {
                return `
                    <div class="msg-upload-item" data-upload-id="${upload.id}">
                        <img src="${upload.preview}" alt="${escapeHtml(upload.file.name)}">
                        <button class="msg-upload-remove" onclick="MessagingChat.removeUpload('${upload.id}')">&times;</button>
                    </div>
                `;
            } else {
                const fileInfo = MessagingUI.getFileIcon(upload.file.name);
                return `
                    <div class="msg-upload-item file" data-upload-id="${upload.id}">
                        <div class="msg-attachment-icon ${fileInfo.class}">${fileInfo.icon}</div>
                        <div class="msg-attachment-info">
                            <div class="msg-attachment-name">${escapeHtml(upload.file.name)}</div>
                            <div class="msg-attachment-size">${MessagingUI.formatFileSize(upload.file.size)}</div>
                        </div>
                        <button class="msg-upload-remove" onclick="MessagingChat.removeUpload('${upload.id}')">&times;</button>
                    </div>
                `;
            }
        }).join('');
    }

    /**
     * Remove pending upload
     */
    function removeUpload(uploadId) {
        pendingUploads = pendingUploads.filter(u => u.id !== uploadId);
        renderUploadPreview();
    }

    /**
     * Render all messages
     */
    function renderMessages() {
        const messagesEl = document.getElementById('msg-messages');
        if (!messagesEl) return;

        if (messages.length === 0) {
            messagesEl.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 60px 40px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">&#128075;</div>
                    <div style="font-size: 1.1rem; color: var(--tt-gold-light);">Demarrez la conversation !</div>
                    <div style="font-size: 0.9rem; margin-top: 8px; opacity: 0.7;">Envoyez un message ou partagez un fichier</div>
                </div>
            `;
            return;
        }

        const isGroup = currentConversation?.type === 'channel' || currentConversation?.type === 'group';
        messagesEl.innerHTML = messages.map((msg, i) => renderBubble(msg, isGroup, i)).join('');

        // Add click handlers for images
        messagesEl.querySelectorAll('.msg-attachment-image').forEach(img => {
            img.addEventListener('click', () => {
                MessagingUI.showLightbox(img.src);
            });
        });
    }

    /**
     * Render single message bubble with attachment support
     */
    function renderBubble(msg, isGroup = false, index = 0) {
        const isMine = msg.senderId === getCurrentUserId();
        const time = formatTime(msg.createdAt);
        const checkIcon = getCheckIcon(msg.status);

        // Show sender name + avatar in group chats for other people's messages
        let senderHeader = '';
        if (isGroup && !isMine) {
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

        const editedBadge = msg.isEdited ? '<span class="msg-edited">(modifie)</span>' : '';

        // Render attachments if present
        let attachmentsHtml = '';
        if (msg.attachments && msg.attachments.length > 0) {
            attachmentsHtml = msg.attachments.map(att => renderAttachment(att)).join('');
        }

        // Check if message type is image/file
        if (msg.messageType === 'image' && msg.attachmentUrl) {
            attachmentsHtml = `
                <div class="msg-attachment">
                    <img src="${msg.attachmentUrl}" alt="Image" class="msg-attachment-image">
                </div>
            `;
        } else if (msg.messageType === 'file' && msg.attachmentUrl) {
            const fileInfo = MessagingUI.getFileIcon(msg.attachmentName || 'file');
            attachmentsHtml = `
                <div class="msg-attachment">
                    <a href="${msg.attachmentUrl}" target="_blank" class="msg-attachment-file">
                        <div class="msg-attachment-icon ${fileInfo.class}">${fileInfo.icon}</div>
                        <div class="msg-attachment-info">
                            <div class="msg-attachment-name">${escapeHtml(msg.attachmentName || 'Fichier')}</div>
                            <div class="msg-attachment-size">${msg.attachmentSize ? MessagingUI.formatFileSize(msg.attachmentSize) : ''}</div>
                        </div>
                        <div class="msg-attachment-download">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </div>
                    </a>
                </div>
            `;
        }

        const hasContent = msg.content && msg.content.trim();
        const contentHtml = hasContent ? `<div class="msg-bubble">${escapeHtml(msg.content)}</div>` : '';

        return `
            <div class="msg-bubble-wrapper ${isMine ? 'mine' : 'theirs'}" data-msg-id="${msg.id}">
                ${senderHeader}
                ${contentHtml}
                ${attachmentsHtml}
                <div class="msg-bubble-time">
                    ${time} ${editedBadge}
                    ${isMine ? checkIcon : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render attachment
     */
    function renderAttachment(attachment) {
        if (attachment.type === 'image') {
            return `
                <div class="msg-attachment">
                    <img src="${attachment.url}" alt="${escapeHtml(attachment.name || 'Image')}" class="msg-attachment-image">
                </div>
            `;
        } else {
            const fileInfo = MessagingUI.getFileIcon(attachment.name || 'file');
            return `
                <div class="msg-attachment">
                    <a href="${attachment.url}" target="_blank" class="msg-attachment-file">
                        <div class="msg-attachment-icon ${fileInfo.class}">${fileInfo.icon}</div>
                        <div class="msg-attachment-info">
                            <div class="msg-attachment-name">${escapeHtml(attachment.name || 'Fichier')}</div>
                            <div class="msg-attachment-size">${attachment.size ? MessagingUI.formatFileSize(attachment.size) : ''}</div>
                        </div>
                        <div class="msg-attachment-download">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </div>
                    </a>
                </div>
            `;
        }
    }

    /**
     * Send a message (with optional attachments)
     */
    async function sendMessage() {
        const input = document.getElementById('msg-input');
        if (!input || !currentConversation) return;

        const content = input.value.trim();

        // Need either content or attachments
        if (!content && pendingUploads.length === 0) return;

        // Clear input and uploads
        input.value = '';
        input.style.height = 'auto';
        const uploadsToSend = [...pendingUploads];
        pendingUploads = [];
        renderUploadPreview();

        // Create optimistic message
        const tempMsg = {
            id: 'temp-' + Date.now(),
            content: content,
            senderId: getCurrentUserId(),
            senderName: getCurrentUserName(),
            senderAvatar: getCurrentUserAvatar(),
            createdAt: new Date().toISOString(),
            status: 'sending',
            messageType: 'text',
            attachments: uploadsToSend.map(u => ({
                name: u.file.name,
                size: u.file.size,
                type: u.type,
                url: u.preview || null
            }))
        };

        messages.push(tempMsg);
        const isGroup = currentConversation?.type === 'channel' || currentConversation?.type === 'group';
        addBubble(tempMsg, isGroup);
        scrollToBottom();

        try {
            let sentMsg;

            if (uploadsToSend.length > 0) {
                // Upload files first, then send message with attachments
                const uploadedFiles = await uploadFiles(uploadsToSend);
                sentMsg = await MessagingAPI.sendMessageWithAttachments(
                    currentConversation.id,
                    content,
                    uploadedFiles
                );
            } else {
                // Simple text message
                sentMsg = await MessagingAPI.sendMessage(currentConversation.id, content);
            }

            // Update temp message with real data
            const idx = messages.findIndex(m => m.id === tempMsg.id);
            if (idx !== -1) {
                messages[idx] = { ...sentMsg, status: 'sent' };
                updateBubble(tempMsg.id, messages[idx], isGroup);
            }

            // Update conversation list
            MessagingConversations.updateWithMessage(currentConversation.id, sentMsg);
        } catch (error) {
            console.error('MessagingChat: Send failed:', error);
            updateBubbleStatus(tempMsg.id, 'error');
        }
    }

    /**
     * Upload files to server
     */
    async function uploadFiles(uploads) {
        const results = [];

        for (const upload of uploads) {
            try {
                const result = await MessagingAPI.uploadFile(upload.file);
                results.push({
                    type: upload.type,
                    url: result.url,
                    name: upload.file.name,
                    size: upload.file.size
                });
            } catch (error) {
                console.error('File upload failed:', upload.file.name, error);
            }
        }

        return results;
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
     * Update full bubble
     */
    function updateBubble(msgId, newMsg, isGroup) {
        const wrapper = document.querySelector(`[data-msg-id="${msgId}"]`);
        if (!wrapper) return;

        const newBubble = document.createElement('div');
        newBubble.innerHTML = renderBubble(newMsg, isGroup, messages.findIndex(m => m.id === newMsg.id));
        wrapper.replaceWith(newBubble.firstElementChild);
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
     * Toggle emoji picker (simple version)
     */
    function toggleEmojiPicker() {
        const input = document.getElementById('msg-input');
        if (!input) return;

        const emojis = ['&#128512;', '&#128513;', '&#128514;', '&#128516;', '&#128522;', '&#128525;', '&#129315;', '&#128077;', '&#128079;', '&#128293;', '&#10084;', '&#128151;'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Decode HTML entity to actual emoji
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = randomEmoji;
        input.value += tempDiv.textContent;
        input.focus();
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
        return '&#128100;';
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
            case 'error': return '<span class="msg-check" style="color: #ef4444;">&#9888;</span>';
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
        getCurrent,
        removeUpload
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingChat = MessagingChat;
}
