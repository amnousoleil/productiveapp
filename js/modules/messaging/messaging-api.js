/**
 * Messaging API Module
 * Handles all API calls to /api/v1/messaging
 */

const MessagingAPI = (function() {
    'use strict';

    const BASE_PATH = '/messaging';

    /**
     * Get all conversations for current user
     */
    async function getConversations() {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations`);
            console.log('💬 Conversations:', response);
            return response.data || response;
        } catch (error) {
            console.warn('⚠️ API failed, using mock data');
            return getMockConversations();
        }
    }

    /**
     * Get messages for a conversation
     * @param {string} conversationId
     * @param {number} limit
     * @param {string} before - Cursor for pagination
     */
    async function getMessages(conversationId, limit = 50, before = null) {
        try {
            let url = `${BASE_PATH}/conversations/${conversationId}/messages?limit=${limit}`;
            if (before) url += `&before=${before}`;
            const response = await ApiFetch.fetchWithAuth(url);
            console.log('📨 Messages:', response);
            return response.data || response;
        } catch (error) {
            console.warn('⚠️ API failed, using mock messages');
            return getMockMessages(conversationId);
        }
    }

    /**
     * Send a message
     * @param {string} conversationId
     * @param {string} content
     */
    async function sendMessage(conversationId, content) {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations/${conversationId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ content })
            });
            console.log('✉️ Message sent:', response);
            return response.data || response;
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            // Return optimistic response for UX
            return {
                id: 'temp-' + Date.now(),
                content,
                senderId: 'me',
                createdAt: new Date().toISOString(),
                status: 'sending'
            };
        }
    }

    /**
     * Mark conversation as read
     * @param {string} conversationId
     */
    async function markAsRead(conversationId) {
        try {
            await ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations/${conversationId}/read`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('❌ Failed to mark as read:', error);
        }
    }

    /**
     * Create new conversation
     * @param {Array} participantIds
     * @param {string} name - Optional for group chats
     */
    async function createConversation(participantIds, name = null) {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations`, {
                method: 'POST',
                body: JSON.stringify({ participantIds, name })
            });
            return response.data || response;
        } catch (error) {
            console.error('❌ Failed to create conversation:', error);
            throw error;
        }
    }

    /**
     * Search conversations
     * @param {string} query
     */
    async function searchConversations(query) {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/conversations/search?q=${encodeURIComponent(query)}`);
            return response.data || response;
        } catch (error) {
            console.warn('⚠️ Search failed');
            return [];
        }
    }

    /**
     * Get users for new conversation
     */
    async function getUsers() {
        try {
            const response = await ApiFetch.fetchWithAuth('/users');
            return response.data || response;
        } catch (error) {
            return getMockUsers();
        }
    }

    // ========== Mock Data ==========

    function getMockConversations() {
        return [
            {
                id: 'conv-1',
                name: null,
                participants: [{ id: 'user-1', name: 'Maha', avatar: '👑', online: true }],
                lastMessage: { content: 'Super, on fait ça demain !', createdAt: new Date(Date.now() - 300000).toISOString() },
                unreadCount: 2
            },
            {
                id: 'conv-2',
                name: null,
                participants: [{ id: 'user-2', name: 'Brice', avatar: '🚀', online: false }],
                lastMessage: { content: 'J\'ai terminé le rapport', createdAt: new Date(Date.now() - 3600000).toISOString() },
                unreadCount: 0
            },
            {
                id: 'conv-3',
                name: 'Team ProductiveApp',
                participants: [
                    { id: 'user-1', name: 'Maha', avatar: '👑' },
                    { id: 'user-2', name: 'Brice', avatar: '🚀' }
                ],
                lastMessage: { content: 'Réunion à 15h', createdAt: new Date(Date.now() - 7200000).toISOString() },
                unreadCount: 5
            }
        ];
    }

    function getMockMessages(conversationId) {
        const messages = [
            { id: 'm1', content: 'Salut ! Comment ça va ?', senderId: 'user-1', createdAt: new Date(Date.now() - 600000).toISOString(), status: 'read' },
            { id: 'm2', content: 'Ça va bien et toi ? J\'ai vu ta proposition pour le projet.', senderId: 'me', createdAt: new Date(Date.now() - 550000).toISOString(), status: 'read' },
            { id: 'm3', content: 'Oui c\'est top ! On peut en discuter demain si tu veux.', senderId: 'user-1', createdAt: new Date(Date.now() - 400000).toISOString(), status: 'read' },
            { id: 'm4', content: 'Parfait, je bloque mon créneau.', senderId: 'me', createdAt: new Date(Date.now() - 350000).toISOString(), status: 'sent' },
            { id: 'm5', content: 'Super, on fait ça demain !', senderId: 'user-1', createdAt: new Date(Date.now() - 300000).toISOString(), status: 'read' }
        ];
        return messages;
    }

    function getMockUsers() {
        return [
            { id: 'user-1', name: 'Maha', avatar: '👑', email: 'maha@productive.app' },
            { id: 'user-2', name: 'Brice', avatar: '🚀', email: 'brice@productive.app' },
            { id: 'user-3', name: 'Team', avatar: '👥', email: 'team@productive.app' }
        ];
    }

    return {
        getConversations,
        getMessages,
        sendMessage,
        markAsRead,
        createConversation,
        searchConversations,
        getUsers,
        getMockConversations,
        getMockMessages
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingAPI = MessagingAPI;
}
