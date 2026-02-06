/**
 * Messaging API Module - Premium Edition
 * Handles all API calls to /api/v1/messaging
 * Maps backend snake_case responses to frontend camelCase
 * Includes file upload support
 */

const MessagingAPI = (function() {
    'use strict';

    const BASE_PATH = '/messaging';
    const UPLOAD_PATH = '/uploads';

    function getWorkspaceId() {
        return ApiTokens.getWorkspaceId();
    }

    // ========== Data Mapping ==========

    /**
     * Get avatar from AppConfig.USERS by user ID
     */
    function getUserAvatar(userId) {
        if (typeof AppConfig !== 'undefined' && AppConfig.USERS) {
            const user = AppConfig.USERS.find(u => u.id === userId);
            if (user) return user.avatar;
        }
        return '&#128100;';
    }

    /**
     * Get display name from AppConfig.USERS by user ID
     */
    function getUserName(userId, fallback) {
        if (typeof AppConfig !== 'undefined' && AppConfig.USERS) {
            const user = AppConfig.USERS.find(u => u.id === userId);
            if (user) return user.name;
        }
        return fallback || 'Utilisateur';
    }

    /**
     * Map backend conversation to frontend format
     */
    function mapConversation(conv) {
        if (!conv) return null;
        return {
            id: conv.id,
            type: conv.type,
            name: conv.name,
            description: conv.description,
            isPrivate: conv.is_private,
            createdBy: conv.created_by,
            participants: (conv.participants || []).map(p => {
                const userId = p.user_id || p.user?.id;
                return {
                    id: userId,
                    name: getUserName(userId, p.user?.name),
                    avatar: p.user?.avatar_url || getUserAvatar(userId),
                    online: p.user?.status === 'online',
                    role: p.role
                };
            }),
            lastMessage: conv.last_message ? {
                id: conv.last_message.id,
                content: conv.last_message.content,
                senderId: conv.last_message.sender_id,
                senderName: getUserName(conv.last_message.sender_id, conv.last_message.sender_name),
                createdAt: conv.last_message.created_at
            } : null,
            unreadCount: conv.unread_count || 0,
            createdAt: conv.created_at,
            updatedAt: conv.updated_at
        };
    }

    /**
     * Map backend message to frontend format
     */
    function mapMessage(msg) {
        if (!msg) return null;
        const senderId = msg.sender_id;

        // Parse attachments if string
        let attachments = msg.attachments;
        if (typeof attachments === 'string') {
            try {
                attachments = JSON.parse(attachments);
            } catch (e) {
                attachments = [];
            }
        }
        attachments = attachments || [];

        return {
            id: msg.id,
            conversationId: msg.conversation_id,
            content: msg.content,
            senderId: senderId,
            senderName: getUserName(senderId, msg.sender?.name),
            senderAvatar: msg.sender?.avatar_url || getUserAvatar(senderId),
            createdAt: msg.created_at,
            status: msg.deleted_at ? 'deleted' : 'sent',
            isEdited: msg.is_edited || false,
            isPinned: msg.is_pinned || false,
            replyTo: msg.reply_to || null,
            reactions: msg.reactions || [],
            messageType: msg.message_type || 'text',
            attachments: attachments.map(att => ({
                type: att.type || 'file',
                url: att.url,
                name: att.name || att.filename,
                size: att.size
            })),
            attachmentUrl: attachments[0]?.url || null,
            attachmentName: attachments[0]?.name || attachments[0]?.filename || null,
            attachmentSize: attachments[0]?.size || null
        };
    }

    // ========== API Calls ==========

    /**
     * Get all conversations for current user
     */
    async function getConversations() {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            console.warn('MessagingAPI: No workspace ID');
            return [];
        }

        const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/workspace/${workspaceId}/conversations`);
        const rawConvs = response.data || [];
        return rawConvs.map(mapConversation);
    }

    /**
     * Get messages for a conversation
     */
    async function getMessages(conversationId, limit = 50, before = null) {
        let url = `${BASE_PATH}/conversations/${conversationId}/messages?limit=${limit}`;
        if (before) url += `&before=${before}`;

        const response = await ApiFetch.fetchWithAuth(url);
        const rawMsgs = response.data || [];
        return rawMsgs.map(mapMessage).reverse();
    }

    /**
     * Send a text message
     */
    async function sendMessage(conversationId, content) {
        const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        const rawMsg = response.data?.message || response.data;
        return mapMessage(rawMsg);
    }

    /**
     * Send a message with attachments
     */
    async function sendMessageWithAttachments(conversationId, content, attachments) {
        const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                content: content || '',
                message_type: attachments[0]?.type === 'image' ? 'image' : 'file',
                attachments: attachments
            })
        });
        const rawMsg = response.data?.message || response.data;
        return mapMessage(rawMsg);
    }

    /**
     * Upload a file
     */
    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        // Use fetch directly for multipart/form-data
        const token = ApiTokens.getAccessToken();
        const response = await fetch(`/api/v1${UPLOAD_PATH}/message`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        return {
            url: data.data?.url || data.url,
            filename: data.data?.filename || data.filename || file.name
        };
    }

    /**
     * Mark conversation as read
     */
    async function markAsRead(conversationId) {
        try {
            await ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations/${conversationId}/read`, {
                method: 'POST'
            });
        } catch (error) {
            console.warn('MessagingAPI: Failed to mark as read');
        }
    }

    /**
     * Create new conversation
     */
    async function createConversation(participantIds, name = null, type = null) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No workspace ID');

        const convType = type || (participantIds.length === 1 ? 'direct' : 'group');

        const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/workspace/${workspaceId}/conversations`, {
            method: 'POST',
            body: JSON.stringify({
                type: convType,
                participant_ids: participantIds,
                name: name
            })
        });

        const rawConv = response.data?.conversation || response.data;
        return mapConversation(rawConv);
    }

    /**
     * Search messages in workspace
     */
    async function searchMessages(query) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) return [];

        const response = await ApiFetch.fetchWithAuth(
            `${BASE_PATH}/workspace/${workspaceId}/search?q=${encodeURIComponent(query)}`
        );
        const rawMsgs = response.data || [];
        return rawMsgs.map(mapMessage);
    }

    /**
     * Get team members for new conversation
     */
    function getUsers() {
        if (typeof AppConfig !== 'undefined' && AppConfig.USERS) {
            const currentUserId = (typeof AppState !== 'undefined') ? AppState.currentUser?.id : null;
            return AppConfig.USERS
                .filter(u => u.id !== currentUserId && u.id !== 'all')
                .map(u => ({
                    id: u.id,
                    name: u.name,
                    avatar: u.avatar
                }));
        }
        return [];
    }

    /**
     * Add reaction to message
     */
    async function addReaction(messageId, emoji) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/messages/${messageId}/reactions`, {
            method: 'POST',
            body: JSON.stringify({ emoji })
        });
    }

    /**
     * Remove reaction from message
     */
    async function removeReaction(messageId, emoji) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, {
            method: 'DELETE'
        });
    }

    /**
     * Update a message
     */
    async function updateMessage(messageId, content) {
        const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/messages/${messageId}`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        });
        return mapMessage(response.data?.message || response.data);
    }

    /**
     * Delete a message
     */
    async function deleteMessage(messageId) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/messages/${messageId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get conversation details
     */
    async function getConversation(conversationId) {
        const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations/${conversationId}`);
        return mapConversation(response.data);
    }

    /**
     * Add participant to conversation
     */
    async function addParticipant(conversationId, userId) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations/${conversationId}/participants`, {
            method: 'POST',
            body: JSON.stringify({ user_id: userId })
        });
    }

    /**
     * Remove participant from conversation
     */
    async function removeParticipant(conversationId, userId) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations/${conversationId}/participants/${userId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Leave conversation
     */
    async function leaveConversation(conversationId) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations/${conversationId}/leave`, {
            method: 'POST'
        });
    }

    return {
        getConversations,
        getConversation,
        getMessages,
        sendMessage,
        sendMessageWithAttachments,
        uploadFile,
        markAsRead,
        createConversation,
        searchMessages,
        getUsers,
        addReaction,
        removeReaction,
        updateMessage,
        deleteMessage,
        addParticipant,
        removeParticipant,
        leaveConversation,
        getUserAvatar,
        getUserName
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingAPI = MessagingAPI;
}
