/**
 * NOTIFICATIONS PREMIUM UI v1.0
 * Panneau premium glassmorphism avec IA
 */

const NotificationsPremiumUI = (function() {
    'use strict';

    let panelEl = null;
    let overlayEl = null;
    let isOpen = false;
    let currentTab = 'all'; // all | calendar | tasks | ai
    let notifications = [];

    /**
     * Initialiser le panneau premium
     */
    function init() {
        createOverlay();
        createPanel();
        loadNotifications();
        startPolling();
        updateBadge();
    }

    /**
     * Créer l'overlay backdrop
     */
    function createOverlay() {
        if (document.getElementById('notif-premium-overlay')) return;

        overlayEl = document.createElement('div');
        overlayEl.id = 'notif-premium-overlay';
        overlayEl.className = 'notif-premium-overlay';
        overlayEl.addEventListener('click', close);
        document.body.appendChild(overlayEl);
    }

    /**
     * Créer la structure du panneau
     */
    function createPanel() {
        if (document.getElementById('notif-premium-panel')) return;

        panelEl = document.createElement('div');
        panelEl.id = 'notif-premium-panel';
        panelEl.className = 'notif-premium-panel';
        panelEl.innerHTML = `
            <button class="notif-premium-close" id="notif-premium-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <div class="notif-premium-header">
                <div class="notif-premium-title">
                    <div class="notif-premium-title-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </div>
                    <h2>Notifications intelligentes</h2>
                </div>
                <p class="notif-premium-subtitle">Rappels pertinents générés par IA</p>

                <div class="notif-premium-tabs">
                    <button class="notif-premium-tab active" data-tab="all">
                        Toutes
                        <span class="notif-premium-tab-badge" id="badge-all">0</span>
                    </button>
                    <button class="notif-premium-tab" data-tab="calendar">
                        📅 Calendrier
                        <span class="notif-premium-tab-badge" id="badge-calendar">0</span>
                    </button>
                    <button class="notif-premium-tab" data-tab="tasks">
                        ✓ Tâches
                        <span class="notif-premium-tab-badge" id="badge-tasks">0</span>
                    </button>
                    <button class="notif-premium-tab" data-tab="ai">
                        🤖 IA
                        <span class="notif-premium-tab-badge" id="badge-ai">0</span>
                    </button>
                </div>
            </div>

            <div class="notif-premium-list" id="notif-premium-list">
                <!-- Notifications rendered here -->
            </div>

            <div class="notif-premium-footer">
                <button class="notif-premium-btn notif-premium-btn-primary" id="notif-generate-ai">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
                    </svg>
                    Générer avec IA
                </button>
                <button class="notif-premium-btn notif-premium-btn-secondary" id="notif-mark-all-read">
                    Tout marquer lu
                </button>
            </div>
        `;

        document.body.appendChild(panelEl);

        // Attach event listeners
        attachEventListeners();
    }

    /**
     * Attacher les event listeners
     */
    function attachEventListeners() {
        // Close button
        document.getElementById('notif-premium-close')?.addEventListener('click', close);

        // Tabs
        document.querySelectorAll('.notif-premium-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                switchTab(tabName);
            });
        });

        // Generate AI button
        document.getElementById('notif-generate-ai')?.addEventListener('click', generateAIReminders);

        // Mark all read
        document.getElementById('notif-mark-all-read')?.addEventListener('click', markAllRead);

        // Escape key to close
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Basculer entre les onglets
     */
    function switchTab(tabName) {
        currentTab = tabName;

        // Update tab UI
        document.querySelectorAll('.notif-premium-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Re-render list
        renderNotifications();
    }

    /**
     * Charger les notifications
     */
    async function loadNotifications() {
        try {
            // Charger depuis l'API
            const data = await NotificationsAPI.getNotifications(100, 0);
            notifications = Array.isArray(data) ? data : (data.notifications || []);

            // Générer aussi les rappels IA en background
            loadAIReminders();

            renderNotifications();
            updateBadge();

        } catch (error) {
            console.warn('⚠️ Failed to load notifications, using mock data');
            notifications = NotificationsAPI.getMockNotifications();
            renderNotifications();
        }
    }

    /**
     * Charger les rappels IA
     */
    async function loadAIReminders() {
        try {
            const response = await ApiFetch.fetchWithAuth('/notifications/ai/analyze');

            if (response.success && response.reminders) {
                // Fusionner avec notifications existantes
                const aiNotifs = response.reminders.map(r => ({
                    id: `ai-${Date.now()}-${Math.random()}`,
                    type: r.type,
                    title: r.title,
                    body: r.message,
                    read: false,
                    createdAt: new Date().toISOString(),
                    priority: r.priority,
                    entityType: r.entityType,
                    entityId: r.entityId,
                    metadata: r.metadata,
                    isAI: true
                }));

                notifications = [...aiNotifs, ...notifications];
                renderNotifications();
                updateBadge();
            }

        } catch (error) {
            console.warn('⚠️ Failed to load AI reminders');
        }
    }

    /**
     * Générer de nouveaux rappels IA
     */
    async function generateAIReminders() {
        const btn = document.getElementById('notif-generate-ai');
        if (!btn) return;

        const originalText = btn.innerHTML;
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10"/>
            </svg>
            Analyse en cours...
        `;
        btn.disabled = true;

        try {
            const response = await ApiFetch.fetchWithAuth('/notifications/ai/generate-reminders', {
                method: 'POST'
            });

            if (response.success) {
                // Recharger toutes les notifications
                await loadNotifications();

                // Toast de succès
                if (typeof Toast !== 'undefined') {
                    Toast.success(`✨ ${response.generated} rappels intelligents générés !`);
                }
            }

        } catch (error) {
            console.error('❌ Failed to generate AI reminders:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Erreur lors de la génération des rappels IA');
            }
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    /**
     * Render notifications
     */
    function renderNotifications() {
        const listEl = document.getElementById('notif-premium-list');
        if (!listEl) return;

        // Filtrer selon l'onglet actif
        let filtered = notifications;
        if (currentTab === 'calendar') {
            filtered = notifications.filter(n => n.type === 'calendar' || n.type === 'task_due');
        } else if (currentTab === 'tasks') {
            filtered = notifications.filter(n => n.type === 'task_forgotten' || n.type === 'assignment');
        } else if (currentTab === 'ai') {
            filtered = notifications.filter(n => n.isAI || n.type === 'ai_suggestion');
        }

        // Trier par priorité puis date
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        filtered.sort((a, b) => {
            const aPrio = priorityOrder[a.priority] ?? 2;
            const bPrio = priorityOrder[b.priority] ?? 2;
            if (aPrio !== bPrio) return aPrio - bPrio;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Empty state
        if (filtered.length === 0) {
            listEl.innerHTML = `
                <div class="notif-premium-empty">
                    <div class="notif-premium-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </div>
                    <h3>Aucune notification</h3>
                    <p>Vous êtes à jour ! Générez des rappels intelligents avec l'IA pour rester productif.</p>
                </div>
            `;
            return;
        }

        // Render items
        listEl.innerHTML = filtered.map(n => renderNotificationItem(n)).join('');

        // Attach click handlers
        listEl.querySelectorAll('.notif-premium-item').forEach((el, index) => {
            el.addEventListener('click', () => handleNotificationClick(filtered[index]));
        });
    }

    /**
     * Render un item de notification
     */
    function renderNotificationItem(notif) {
        const timeAgo = formatTimeAgo(new Date(notif.createdAt));
        const icon = getNotificationIcon(notif.type);
        const priority = notif.priority || 'medium';

        return `
            <div class="notif-premium-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
                <div class="notif-premium-item-header">
                    <div class="notif-premium-item-icon priority-${priority}">
                        ${icon}
                    </div>
                    <div class="notif-premium-item-content">
                        <h4 class="notif-premium-item-title">${notif.title}</h4>
                        <p class="notif-premium-item-message">${notif.body || notif.content || ''}</p>
                    </div>
                </div>
                <div class="notif-premium-item-footer">
                    <span class="notif-premium-item-time">${timeAgo}</span>
                    ${notif.isAI ? '<span class="notif-premium-item-action" style="margin-left: 8px; background: rgba(139, 92, 246, 0.15);">🤖 IA</span>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Get icon for notification type
     */
    function getNotificationIcon(type) {
        const icons = {
            calendar: '📅',
            task_due: '⏰',
            task_forgotten: '⏰',
            note_important: '📝',
            project_blocked: '📊',
            ai_suggestion: '🤖',
            assignment: '✓',
            achievement: '🏆',
            mention: '@',
            message: '💬',
            system: 'ℹ️'
        };
        return icons[type] || '🔔';
    }

    /**
     * Format time ago
     */
    function formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins}min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;
        return date.toLocaleDateString('fr-FR');
    }

    /**
     * Handle notification click
     */
    async function handleNotificationClick(notif) {
        // Marquer comme lu
        if (!notif.read) {
            await NotificationsAPI.markAsRead(notif.id);
            notif.read = true;
            renderNotifications();
            updateBadge();
        }

        // Naviguer si lien
        if (notif.entityType && notif.entityId) {
            close();
            // Router vers l'entité
            if (typeof ViewRouter !== 'undefined') {
                if (notif.entityType === 'task') ViewRouter.navigate('tasks');
                else if (notif.entityType === 'note') ViewRouter.navigate('notes');
                else if (notif.entityType === 'project') ViewRouter.navigate('projects');
                else if (notif.entityType === 'calendar_event') ViewRouter.navigate('calendar');
            }
        }
    }

    /**
     * Marquer toutes comme lues
     */
    async function markAllRead() {
        try {
            await NotificationsAPI.markAllAsRead();
            notifications.forEach(n => n.read = true);
            renderNotifications();
            updateBadge();

            if (typeof Toast !== 'undefined') {
                Toast.success('Toutes les notifications marquées comme lues');
            }
        } catch (error) {
            console.error('❌ Failed to mark all as read:', error);
        }
    }

    /**
     * Update badge count
     */
    function updateBadge() {
        const unreadCount = notifications.filter(n => !n.read).length;

        // Sidebar badge
        const sidebarBadge = document.getElementById('sidebar-notif-badge');
        if (sidebarBadge) {
            if (unreadCount > 0) {
                sidebarBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                sidebarBadge.style.display = 'flex';
            } else {
                sidebarBadge.style.display = 'none';
            }
        }

        // Tab badges
        const allCount = notifications.length;
        const calendarCount = notifications.filter(n => n.type === 'calendar' || n.type === 'task_due').length;
        const tasksCount = notifications.filter(n => n.type === 'task_forgotten' || n.type === 'assignment').length;
        const aiCount = notifications.filter(n => n.isAI || n.type === 'ai_suggestion').length;

        document.getElementById('badge-all')?.textContent = allCount;
        document.getElementById('badge-calendar')?.textContent = calendarCount;
        document.getElementById('badge-tasks')?.textContent = tasksCount;
        document.getElementById('badge-ai')?.textContent = aiCount;
    }

    /**
     * Polling des nouvelles notifications
     */
    function startPolling() {
        setInterval(async () => {
            if (!isOpen) {
                // Recharger seulement si panneau fermé
                await loadNotifications();
            }
        }, 60000); // Toutes les 60 secondes
    }

    /**
     * Handle escape key
     */
    function handleEscape(e) {
        if (e.key === 'Escape' && isOpen) {
            close();
        }
    }

    /**
     * Open panel
     */
    function open() {
        if (isOpen) return;

        overlayEl?.classList.add('visible');
        panelEl?.classList.add('visible');
        isOpen = true;

        loadNotifications();
    }

    /**
     * Close panel
     */
    function close() {
        if (!isOpen) return;

        overlayEl?.classList.remove('visible');
        panelEl?.classList.remove('visible');
        isOpen = false;
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

    return {
        init,
        open,
        close,
        toggle,
        loadNotifications,
        updateBadge
    };
})();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => NotificationsPremiumUI.init(), 1000);
    });
} else {
    setTimeout(() => NotificationsPremiumUI.init(), 1000);
}

if (typeof window !== 'undefined') {
    window.NotificationsPremiumUI = NotificationsPremiumUI;
}
