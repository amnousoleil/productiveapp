/**
 * Notifications Badge Module
 * Handles the bell icon and badge counter in the navbar
 */

const NotificationsBadge = (function() {
    'use strict';

    let badgeEl = null;
    let countEl = null;
    let pollInterval = null;
    const POLL_INTERVAL = 30000; // 30 seconds

    /**
     * Initialize badge in navbar
     * @param {string} containerId - ID of container to insert badge into
     */
    function init(containerId = 'header-right') {
        const container = document.getElementById(containerId) ||
                         document.querySelector('.header-right') ||
                         document.querySelector('.app-header');

        if (!container) {
            console.warn('⚠️ Badge container not found');
            return;
        }

        // Check if already exists
        if (document.getElementById('notif-badge-container')) return;

        // Create badge element
        badgeEl = document.createElement('div');
        badgeEl.id = 'notif-badge-container';
        badgeEl.className = 'notif-badge-container';
        badgeEl.innerHTML = `
            <button class="notif-badge-btn" id="notif-badge-btn" title="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span class="notif-badge-count hidden" id="notif-badge-count">0</span>
            </button>
        `;

        // Insert at beginning of container
        container.insertBefore(badgeEl, container.firstChild);

        // Cache count element
        countEl = document.getElementById('notif-badge-count');

        // Attach click listener
        document.getElementById('notif-badge-btn')?.addEventListener('click', () => {
            NotificationsUI.toggle();
        });

        // Start polling
        startPolling();

        // Initial count fetch
        updateCount();
    }

    /**
     * Update the badge count
     */
    async function updateCount() {
        try {
            const count = NotificationsList.getUnreadCount() ||
                         await NotificationsAPI.getUnreadCount();
            setCount(count);
        } catch (error) {
            console.warn('⚠️ Failed to update notification count');
        }
    }

    /**
     * Set the badge count
     * @param {number} count
     */
    function setCount(count) {
        if (!countEl) return;

        if (count > 0) {
            countEl.textContent = count > 99 ? '99+' : count;
            countEl.classList.remove('hidden');
        } else {
            countEl.classList.add('hidden');
        }
    }

    /**
     * Trigger pulse animation (for new notifications)
     */
    function pulse() {
        if (!countEl) return;

        countEl.classList.remove('pulse');
        // Trigger reflow
        countEl.offsetHeight;
        countEl.classList.add('pulse');

        // Remove pulse after animation
        setTimeout(() => {
            countEl.classList.remove('pulse');
        }, 3000);
    }

    /**
     * Start polling for new notifications
     */
    function startPolling() {
        if (pollInterval) return;

        pollInterval = setInterval(async () => {
            try {
                const currentCount = parseInt(countEl?.textContent || '0');
                const newCount = await NotificationsAPI.getUnreadCount();

                if (newCount > currentCount) {
                    setCount(newCount);
                    pulse();

                    // If panel is open, refresh the list
                    if (NotificationsUI.isPanelOpen()) {
                        NotificationsList.load();
                    }
                } else {
                    setCount(newCount);
                }
            } catch (error) {
                console.warn('⚠️ Notification poll failed');
            }
        }, POLL_INTERVAL);

        console.log('🔔 Notification polling started');
    }

    /**
     * Stop polling
     */
    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
            console.log('🔔 Notification polling stopped');
        }
    }

    /**
     * Show/hide badge completely
     * @param {boolean} visible
     */
    function setVisible(visible) {
        if (badgeEl) {
            badgeEl.style.display = visible ? 'flex' : 'none';
        }
    }

    /**
     * Cleanup
     */
    function destroy() {
        stopPolling();
        badgeEl?.remove();
        badgeEl = null;
        countEl = null;
    }

    return {
        init,
        updateCount,
        setCount,
        pulse,
        startPolling,
        stopPolling,
        setVisible,
        destroy
    };
})();

if (typeof window !== 'undefined') {
    window.NotificationsBadge = NotificationsBadge;
}
