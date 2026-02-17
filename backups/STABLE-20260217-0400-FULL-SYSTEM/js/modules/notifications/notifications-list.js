/**
 * Notifications List Module
 * Handles rendering and managing the notifications list
 */

const NotificationsList = (function() {
    'use strict';

    let notifications = [];

    /**
     * Load notifications from API
     */
    async function load() {
        NotificationsUI.showLoading();

        try {
            notifications = await NotificationsAPI.getNotifications();
            render();
        } catch (error) {
            console.error('❌ Failed to load notifications:', error);
            notifications = [];
            render();
        }
    }

    /**
     * Render notifications list
     */
    function render() {
        const listEl = document.getElementById('notif-list');
        if (!listEl) return;

        if (notifications.length === 0) {
            NotificationsUI.showEmpty();
            return;
        }

        listEl.innerHTML = notifications.map(n => renderItem(n)).join('');
        attachListeners();
    }

    /**
     * Render single notification item
     * @param {Object} notif
     */
    function renderItem(notif) {
        const icon = getIcon(notif.type);
        const time = formatRelativeTime(notif.createdAt);
        const unreadClass = notif.read ? '' : 'unread';

        return `
            <div class="notif-item ${unreadClass}" data-id="${notif.id}" data-link="${notif.link || ''}">
                <div class="notif-icon ${notif.type}">${icon}</div>
                <div class="notif-content">
                    <div class="notif-content-title">${escapeHtml(notif.title)}</div>
                    <div class="notif-content-body">${escapeHtml(notif.body)}</div>
                    <div class="notif-meta">
                        <span class="notif-time">${time}</span>
                        <button class="notif-delete-btn" data-id="${notif.id}" title="Supprimer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Attach click listeners
     */
    function attachListeners() {
        // Click on notification
        document.querySelectorAll('.notif-item').forEach(el => {
            el.addEventListener('click', (e) => {
                // Ignore if clicking delete button
                if (e.target.closest('.notif-delete-btn')) return;

                const id = el.dataset.id;
                const link = el.dataset.link;

                // Mark as read
                markAsRead(id);

                // Navigate if link exists
                if (link) {
                    NotificationsUI.close();
                    // Handle navigation
                    if (link.startsWith('/')) {
                        const route = link.split('?')[0].substring(1);
                        if (typeof Router !== 'undefined') {
                            Router.navigate(route);
                        }
                    }
                }
            });
        });

        // Delete buttons
        document.querySelectorAll('.notif-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                deleteNotification(id);
            });
        });
    }

    /**
     * Mark notification as read
     * @param {string} id
     */
    async function markAsRead(id) {
        const notif = notifications.find(n => n.id === id);
        if (!notif || notif.read) return;

        notif.read = true;

        // Update UI
        const el = document.querySelector(`.notif-item[data-id="${id}"]`);
        if (el) {
            el.classList.remove('unread');
        }

        // Update badge
        NotificationsBadge.updateCount();

        // API call
        await NotificationsAPI.markAsRead(id);
    }

    /**
     * Mark all as read
     */
    async function markAllRead() {
        notifications.forEach(n => n.read = true);
        render();
        NotificationsBadge.updateCount();
        await NotificationsAPI.markAllAsRead();
    }

    /**
     * Delete notification
     * @param {string} id
     */
    async function deleteNotification(id) {
        const el = document.querySelector(`.notif-item[data-id="${id}"]`);
        if (el) {
            el.classList.add('removing');
            await new Promise(r => setTimeout(r, 300));
        }

        notifications = notifications.filter(n => n.id !== id);
        render();
        NotificationsBadge.updateCount();
        await NotificationsAPI.deleteNotification(id);
    }

    /**
     * Add new notification (from websocket/polling)
     * @param {Object} notif
     */
    function addNotification(notif) {
        notifications.unshift(notif);
        if (NotificationsUI.isPanelOpen()) {
            render();
        }
        NotificationsBadge.updateCount();
        NotificationsBadge.pulse();
    }

    /**
     * Get unread count
     */
    function getUnreadCount() {
        return notifications.filter(n => !n.read).length;
    }

    /**
     * Get all notifications
     */
    function getAll() {
        return notifications;
    }

    // ========== Helpers ==========

    function getIcon(type) {
        const icons = {
            mention: '📝',
            assignment: '✅',
            achievement: '🏆',
            task_due: '⏰',
            message: '💬',
            default: '🔔'
        };
        return icons[type] || icons.default;
    }

    function formatRelativeTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return "À l'instant";
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
        markAsRead,
        markAllRead,
        deleteNotification,
        addNotification,
        getUnreadCount,
        getAll
    };
})();

if (typeof window !== 'undefined') {
    window.NotificationsList = NotificationsList;
}
