/**
 * Notifications Module - Main Orchestrator
 * Coordinates all notification components
 */

const Notifications = (function() {
    'use strict';

    let initialized = false;

    /**
     * Initialize notifications system
     * @param {Object} options - Configuration options
     */
    function init(options = {}) {
        if (initialized) {
            console.log('🔔 Notifications already initialized');
            return;
        }

        console.log('🔔 Initializing Notifications...');

        try {
            // Initialize UI (panel)
            NotificationsUI.init();

            // Initialize badge in navbar
            const badgeContainer = options.badgeContainer || 'header-right';
            NotificationsBadge.init(badgeContainer);

            initialized = true;
            console.log('✅ Notifications initialized successfully');

        } catch (error) {
            console.error('❌ Notifications init failed:', error);
        }
    }

    /**
     * Show notifications panel
     */
    function show() {
        if (!initialized) init();
        NotificationsUI.open();
    }

    /**
     * Hide notifications panel
     */
    function hide() {
        NotificationsUI.close();
    }

    /**
     * Toggle notifications panel
     */
    function toggle() {
        if (!initialized) init();
        NotificationsUI.toggle();
    }

    /**
     * Refresh notifications data
     */
    async function refresh() {
        await NotificationsList.load();
        await NotificationsBadge.updateCount();
    }

    /**
     * Add a new notification (from websocket/external source)
     * @param {Object} notification
     */
    function addNotification(notification) {
        NotificationsList.addNotification(notification);
    }

    /**
     * Mark notification as read
     * @param {string} id
     */
    async function markAsRead(id) {
        await NotificationsList.markAsRead(id);
    }

    /**
     * Mark all as read
     */
    async function markAllAsRead() {
        await NotificationsList.markAllRead();
    }

    /**
     * Get unread count
     */
    function getUnreadCount() {
        return NotificationsList.getUnreadCount();
    }

    /**
     * Get all notifications
     */
    function getAll() {
        return NotificationsList.getAll();
    }

    /**
     * Show a toast notification
     * @param {Object} notification
     */
    function showToast(notification) {
        const toast = document.createElement('div');
        toast.className = 'notif-toast';
        toast.innerHTML = `
            <div class="notif-toast-icon">${getIcon(notification.type)}</div>
            <div class="notif-toast-content">
                <div class="notif-toast-title">${escapeHtml(notification.title)}</div>
                <div class="notif-toast-body">${escapeHtml(notification.body)}</div>
            </div>
            <button class="notif-toast-close">✕</button>
        `;

        // Style toast (inline for simplicity)
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 360px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            animation: toastSlideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Close button
        toast.querySelector('.notif-toast-close')?.addEventListener('click', () => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'toastSlideOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    /**
     * Check if initialized
     */
    function isInitialized() {
        return initialized;
    }

    /**
     * Cleanup
     */
    function destroy() {
        NotificationsBadge.destroy();
        initialized = false;
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

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        init,
        show,
        hide,
        toggle,
        refresh,
        addNotification,
        markAsRead,
        markAllAsRead,
        getUnreadCount,
        getAll,
        showToast,
        isInitialized,
        destroy
    };
})();

if (typeof window !== 'undefined') {
    window.Notifications = Notifications;
}
