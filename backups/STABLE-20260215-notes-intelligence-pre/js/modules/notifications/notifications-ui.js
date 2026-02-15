/**
 * Notifications UI Module
 * Renders the slide-in panel
 */

const NotificationsUI = (function() {
    'use strict';

    let panelEl = null;
    let overlayEl = null;
    let isOpen = false;

    /**
     * Initialize UI - create panel structure
     */
    function init() {
        createOverlay();
        createPanel();
    }

    /**
     * Create backdrop overlay
     */
    function createOverlay() {
        if (document.getElementById('notif-overlay')) return;

        overlayEl = document.createElement('div');
        overlayEl.id = 'notif-overlay';
        overlayEl.className = 'notif-overlay';
        overlayEl.addEventListener('click', close);
        document.body.appendChild(overlayEl);
    }

    /**
     * Create panel structure
     */
    function createPanel() {
        if (document.getElementById('notif-panel')) return;

        panelEl = document.createElement('div');
        panelEl.id = 'notif-panel';
        panelEl.className = 'notif-panel';
        panelEl.innerHTML = `
            <div class="notif-header">
                <div class="notif-title">
                    <span class="notif-title-icon">🔔</span>
                    <span>Notifications</span>
                </div>
                <div class="notif-header-actions">
                    <button class="notif-action-btn" id="notif-mark-all-btn">Tout lire</button>
                    <button class="notif-close-btn" id="notif-close-btn">✕</button>
                </div>
            </div>
            <div class="notif-list" id="notif-list">
                <!-- Notifications rendered here -->
            </div>
            <div class="notif-footer">
                <a href="#" class="notif-settings-link" id="notif-settings-link">
                    <span>⚙️</span>
                    <span>Paramètres notifications</span>
                </a>
            </div>
        `;
        document.body.appendChild(panelEl);

        // Attach close button listener
        document.getElementById('notif-close-btn')?.addEventListener('click', close);

        // Mark all as read listener
        document.getElementById('notif-mark-all-btn')?.addEventListener('click', async () => {
            await NotificationsList.markAllRead();
        });

        // Settings link
        document.getElementById('notif-settings-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            close();
            if (typeof Router !== 'undefined') {
                Router.navigate('settings');
            }
        });
    }

    /**
     * Open the panel
     */
    function open() {
        if (isOpen) return;

        overlayEl?.classList.add('visible');
        panelEl?.classList.add('visible');
        isOpen = true;

        // Load notifications
        NotificationsList.load();

        // Keyboard escape to close
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Close the panel
     */
    function close() {
        overlayEl?.classList.remove('visible');
        panelEl?.classList.remove('visible');
        isOpen = false;

        document.removeEventListener('keydown', handleEscape);
    }

    /**
     * Toggle panel
     */
    function toggle() {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    /**
     * Handle escape key
     * @param {KeyboardEvent} e
     */
    function handleEscape(e) {
        if (e.key === 'Escape') {
            close();
        }
    }

    /**
     * Check if panel is open
     */
    function isPanelOpen() {
        return isOpen;
    }

    /**
     * Show loading state
     */
    function showLoading() {
        const listEl = document.getElementById('notif-list');
        if (listEl) {
            listEl.innerHTML = `
                <div style="padding: 60px 40px; text-align: center; color: var(--text-muted);">
                    <div style="font-size: 2rem; margin-bottom: 16px;">⏳</div>
                    Chargement...
                </div>
            `;
        }
    }

    /**
     * Show empty state
     */
    function showEmpty() {
        const listEl = document.getElementById('notif-list');
        if (listEl) {
            listEl.innerHTML = `
                <div class="notif-empty">
                    <div class="notif-empty-icon">🔕</div>
                    <div class="notif-empty-title">Aucune notification</div>
                    <div class="notif-empty-text">Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.</div>
                </div>
            `;
        }
    }

    return {
        init,
        open,
        close,
        toggle,
        isPanelOpen,
        showLoading,
        showEmpty
    };
})();

if (typeof window !== 'undefined') {
    window.NotificationsUI = NotificationsUI;
}
