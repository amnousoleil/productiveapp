/**
 * Notifications API Module
 * Handles all API calls to /api/v1/notifications
 */

const NotificationsAPI = (function() {
    'use strict';

    const BASE_PATH = '/notifications';

    /**
     * Get all notifications for current user
     * @param {number} limit
     * @param {number} offset
     */
    async function getNotifications(limit = 50, offset = 0) {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}?limit=${limit}&offset=${offset}`);
            console.log('🔔 Notifications:', response);
            return response.data || response;
        } catch (error) {
            console.warn('⚠️ API failed, using mock data');
            return getMockNotifications();
        }
    }

    /**
     * Get unread count
     */
    async function getUnreadCount() {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/unread/count`);
            return response.data?.count || response.count || 0;
        } catch (error) {
            console.warn('⚠️ Failed to get unread count');
            return getMockNotifications().filter(n => !n.read).length;
        }
    }

    /**
     * Mark notification as read
     * @param {string} notificationId
     */
    async function markAsRead(notificationId) {
        try {
            await ApiFetch.fetchWithAuth(`${BASE_PATH}/${notificationId}/read`, {
                method: 'POST'
            });
            return true;
        } catch (error) {
            console.error('❌ Failed to mark as read:', error);
            return false;
        }
    }

    /**
     * Mark all notifications as read
     */
    async function markAllAsRead() {
        try {
            await ApiFetch.fetchWithAuth(`${BASE_PATH}/read-all`, {
                method: 'POST'
            });
            return true;
        } catch (error) {
            console.error('❌ Failed to mark all as read:', error);
            return false;
        }
    }

    /**
     * Delete a notification
     * @param {string} notificationId
     */
    async function deleteNotification(notificationId) {
        try {
            await ApiFetch.fetchWithAuth(`${BASE_PATH}/${notificationId}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('❌ Failed to delete notification:', error);
            return false;
        }
    }

    /**
     * Delete all notifications
     */
    async function deleteAll() {
        try {
            await ApiFetch.fetchWithAuth(`${BASE_PATH}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('❌ Failed to delete all:', error);
            return false;
        }
    }

    /**
     * Update notification preferences
     * @param {Object} preferences
     */
    async function updatePreferences(preferences) {
        try {
            const response = await ApiFetch.fetchWithAuth(`${BASE_PATH}/preferences`, {
                method: 'PUT',
                body: JSON.stringify(preferences)
            });
            return response.data || response;
        } catch (error) {
            console.error('❌ Failed to update preferences:', error);
            throw error;
        }
    }

    // ========== Mock Data ==========

    function getMockNotifications() {
        return [
            {
                id: 'notif-1',
                type: 'mention',
                title: 'Maha vous a mentionné',
                body: 'dans le projet "ProductiveApp v3"',
                read: false,
                createdAt: new Date(Date.now() - 300000).toISOString(),
                link: '/tasks?id=123'
            },
            {
                id: 'notif-2',
                type: 'assignment',
                title: 'Nouvelle tâche assignée',
                body: 'Implémenter le système de notifications',
                read: false,
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                link: '/tasks?id=456'
            },
            {
                id: 'notif-3',
                type: 'achievement',
                title: '🏆 Achievement débloqué !',
                body: 'Productif - 50 tâches terminées',
                read: true,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                link: '/gamification'
            },
            {
                id: 'notif-4',
                type: 'task_due',
                title: 'Tâche due bientôt',
                body: 'Revue de code API - dans 2 heures',
                read: false,
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                link: '/tasks?id=789'
            },
            {
                id: 'notif-5',
                type: 'message',
                title: 'Nouveau message de Brice',
                body: 'J\'ai terminé le rapport...',
                read: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                link: '/messaging?conv=conv-2'
            }
        ];
    }

    return {
        getNotifications,
        getUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAll,
        updatePreferences,
        getMockNotifications
    };
})();

if (typeof window !== 'undefined') {
    window.NotificationsAPI = NotificationsAPI;
}
