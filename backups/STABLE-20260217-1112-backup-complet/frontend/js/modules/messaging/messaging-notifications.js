/**
 * Messaging Notifications Integration
 * Crée des notifications système pour chaque nouveau message TeamTalk
 * Version 1.0 - 2026-02-12
 */

const MessagingNotifications = (function() {
    'use strict';

    // Stockage local des derniers messages vus
    const STORAGE_KEY = 'productiveapp_teamtalk_last_message_id';

    /**
     * Créer une notification pour un nouveau message
     * @param {Object} message - Message reçu
     * @param {Object} conversation - Conversation associée
     */
    function createMessageNotification(message, conversation) {
        // Ne pas notifier ses propres messages
        const currentUserId = (typeof AppState !== 'undefined') ? AppState.currentUser?.id : null;
        if (message.senderId === currentUserId) {
            return;
        }

        // Récupérer le nom de l'expéditeur
        const senderName = message.senderName || 'Utilisateur';

        // Créer la notification via le système de notifications
        if (typeof Notifications !== 'undefined' && typeof Notifications.add === 'function') {
            Notifications.add({
                id: `teamtalk-${message.id}`,
                type: 'message',
                title: `💬 ${senderName}`,
                message: truncateMessage(message.content),
                timestamp: new Date(message.timestamp || message.createdAt),
                read: false,
                data: {
                    conversationId: conversation.id,
                    messageId: message.id,
                    senderId: message.senderId
                },
                action: () => {
                    // Navigation vers la conversation
                    if (typeof Messaging !== 'undefined') {
                        Messaging.openConversation(conversation.id);
                    }
                    if (typeof ViewRouter !== 'undefined') {
                        ViewRouter.navigate('teamMessaging');
                    }
                }
            });
        }

        // Afficher aussi une toast notification
        if (typeof Toast !== 'undefined') {
            Toast.info(`💬 ${senderName}: ${truncateMessage(message.content, 50)}`);
        }

        // Mettre à jour le badge de notifications
        updateNotificationBadge();
    }

    /**
     * Tronquer un message pour l'affichage
     */
    function truncateMessage(text, maxLength = 100) {
        if (!text) return '(message vide)';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Mettre à jour le badge de notifications
     */
    function updateNotificationBadge() {
        if (typeof NotificationsBadge !== 'undefined') {
            NotificationsBadge.refresh();
        }
    }

    /**
     * Vérifier les nouveaux messages dans une conversation
     * @param {Array} messages - Liste des messages
     * @param {Object} conversation - Conversation
     */
    function checkNewMessages(messages, conversation) {
        if (!messages || messages.length === 0) return;

        // Récupérer le dernier ID vu
        const lastSeenId = getLastSeenMessageId(conversation.id);

        // Filtrer les nouveaux messages
        const newMessages = messages.filter(msg => {
            // Si pas de lastSeenId, tous sont nouveaux (mais on notifie que le dernier)
            if (!lastSeenId) return false;

            // Comparer les IDs ou timestamps
            if (msg.id) {
                return msg.id > lastSeenId;
            }
            return false;
        });

        // Créer des notifications pour les nouveaux messages
        newMessages.forEach(msg => {
            createMessageNotification(msg, conversation);
        });

        // Mettre à jour le dernier message vu
        if (messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            if (latestMessage.id) {
                setLastSeenMessageId(conversation.id, latestMessage.id);
            }
        }
    }

    /**
     * Récupérer le dernier ID de message vu pour une conversation
     */
    function getLastSeenMessageId(conversationId) {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return data[conversationId] || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Enregistrer le dernier ID de message vu
     */
    function setLastSeenMessageId(conversationId, messageId) {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            data[conversationId] = messageId;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save last seen message:', e);
        }
    }

    /**
     * Marquer tous les messages d'une conversation comme vus
     */
    function markConversationAsRead(conversationId, latestMessageId) {
        if (latestMessageId) {
            setLastSeenMessageId(conversationId, latestMessageId);
        }
    }

    /**
     * Hook pour sendMessage - créer notification après envoi
     */
    function onMessageSent(message, conversation) {
        // Mettre à jour le dernier message vu (notre propre message)
        if (message.id) {
            setLastSeenMessageId(conversation.id, message.id);
        }
    }

    return {
        createMessageNotification,
        checkNewMessages,
        markConversationAsRead,
        onMessageSent
    };
})();

// Exposer globalement
if (typeof window !== 'undefined') {
    window.MessagingNotifications = MessagingNotifications;
}
