/**
 * Messaging Presence Module - TeamTalk Pro
 * Handles real-time user presence, status, typing indicators
 */

const MessagingPresence = (function() {
    'use strict';

    // State
    let currentUserPresence = null;
    let allPresences = new Map(); // userId -> presence object
    let typingUsers = new Map(); // conversationId -> Set of userIds
    let heartbeatInterval = null;
    let typingTimeout = null;

    // Constants
    const HEARTBEAT_INTERVAL = 30000; // 30s
    const TYPING_TIMEOUT = 3000; // 3s
    const STATUS_ICONS = {
        available: '🟢',
        busy: '🟡',
        dnd: '🔴',
        away: '🟠',
        offline: '⚫',
        custom: '💬'
    };

    const STATUS_LABELS = {
        available: 'Disponible',
        busy: 'Occupé',
        dnd: 'Ne pas déranger',
        away: 'Absent',
        offline: 'Hors ligne',
        custom: 'Personnalisé'
    };

    /**
     * Initialize presence system
     */
    async function init() {
        try {
            // Load current user presence
            await loadMyPresence();

            // Set online
            await setStatus('available');

            // Start heartbeat
            startHeartbeat();

            // Load all presences
            await loadOnlineUsers();

            console.log('✅ Presence system initialized');
        } catch (error) {
            console.error('❌ Failed to init presence:', error);
        }
    }

    /**
     * Cleanup on logout/unload
     */
    function cleanup() {
        stopHeartbeat();
        setStatus('offline').catch(console.error);
    }

    /**
     * Load current user's presence
     */
    async function loadMyPresence() {
        try {
            const response = await fetch('/api/v1/presence/me', {
                headers: {
                    'Authorization': `Bearer ${ApiTokens.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load presence');
            }

            currentUserPresence = await response.json();
        } catch (error) {
            console.error('Failed to load my presence:', error);
        }
    }

    /**
     * Load all online users
     */
    async function loadOnlineUsers() {
        try {
            const response = await fetch('/api/v1/presence/online', {
                headers: {
                    'Authorization': `Bearer ${ApiTokens.getToken()}`
                }
            });

            if (!response.ok) return;

            const users = await response.json();
            users.forEach(presence => {
                allPresences.set(presence.userId, presence);
            });

            // Render online users widget
            renderOnlineUsersWidget();
        } catch (error) {
            console.error('Failed to load online users:', error);
        }
    }

    /**
     * Get presence for multiple users
     */
    async function getPresences(userIds) {
        if (!userIds || userIds.length === 0) return;

        try {
            const response = await fetch(`/api/v1/presence/users?ids=${userIds.join(',')}`, {
                headers: {
                    'Authorization': `Bearer ${ApiTokens.getToken()}`
                }
            });

            if (!response.ok) return;

            const presences = await response.json();
            presences.forEach(p => {
                allPresences.set(p.userId, p);
            });
        } catch (error) {
            console.error('Failed to get presences:', error);
        }
    }

    /**
     * Set current user status
     */
    async function setStatus(status, customMessage = null) {
        try {
            const response = await fetch('/api/v1/presence/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ApiTokens.getToken()}`
                },
                body: JSON.stringify({ status, customMessage })
            });

            if (!response.ok) {
                throw new Error('Failed to set status');
            }

            currentUserPresence = await response.json();
            return currentUserPresence;
        } catch (error) {
            console.error('Failed to set status:', error);
            throw error;
        }
    }

    /**
     * Send heartbeat (keep alive)
     */
    async function sendHeartbeat() {
        try {
            await fetch('/api/v1/presence/heartbeat', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ApiTokens.getToken()}`
                }
            });
        } catch (error) {
            // Silent fail
        }
    }

    /**
     * Start heartbeat interval
     */
    function startHeartbeat() {
        if (heartbeatInterval) return;

        heartbeatInterval = setInterval(() => {
            sendHeartbeat();
        }, HEARTBEAT_INTERVAL);
    }

    /**
     * Stop heartbeat
     */
    function stopHeartbeat() {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
    }

    /**
     * Set typing indicator in conversation
     */
    async function setTyping(conversationId) {
        try {
            await fetch(`/api/v1/presence/typing/${conversationId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ApiTokens.getToken()}`
                }
            });

            // Auto-clear after timeout
            if (typingTimeout) clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                clearTyping(conversationId);
            }, TYPING_TIMEOUT);
        } catch (error) {
            console.error('Failed to set typing:', error);
        }
    }

    /**
     * Clear typing indicator
     */
    async function clearTyping(conversationId) {
        try {
            await fetch(`/api/v1/presence/typing/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${ApiTokens.getToken()}`
                }
            });
        } catch (error) {
            // Silent fail
        }
    }

    /**
     * Get typing users in conversation
     */
    async function getTypingUsers(conversationId) {
        try {
            const response = await fetch(`/api/v1/presence/typing/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${ApiTokens.getToken()}`
                }
            });

            if (!response.ok) return [];

            const data = await response.json();
            return data.userIds || [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Poll typing users (call every 2s while conversation open)
     */
    async function pollTypingUsers(conversationId) {
        const userIds = await getTypingUsers(conversationId);

        if (!typingUsers.has(conversationId)) {
            typingUsers.set(conversationId, new Set());
        }

        const oldSet = typingUsers.get(conversationId);
        const newSet = new Set(userIds);

        // Detect changes
        const added = [...newSet].filter(id => !oldSet.has(id));
        const removed = [...oldSet].filter(id => !newSet.has(id));

        if (added.length > 0 || removed.length > 0) {
            typingUsers.set(conversationId, newSet);
            renderTypingIndicator(conversationId, [...newSet]);
        }
    }

    /**
     * Render typing indicator in chat
     */
    function renderTypingIndicator(conversationId, userIds) {
        const indicatorEl = document.getElementById('msg-typing-indicator');
        if (!indicatorEl) return;

        // Get current conversation
        const activeConv = MessagingConversations?.getActive();
        if (!activeConv || activeConv.id !== conversationId) return;

        // Filter out current user
        const currentUserId = (typeof AppState !== 'undefined') ? AppState.currentUser?.id : null;
        const otherUsers = userIds.filter(id => id !== currentUserId);

        if (otherUsers.length === 0) {
            indicatorEl.innerHTML = '';
            indicatorEl.style.display = 'none';
            return;
        }

        // Get user names
        const names = otherUsers.map(uid => {
            const user = AppConfig.USERS?.find(u => u.id === uid);
            return user ? user.name.split(' ')[0] : 'Quelqu\'un';
        });

        const text = names.length === 1
            ? `${names[0]} est en train d'écrire...`
            : names.length === 2
            ? `${names[0]} et ${names[1]} sont en train d'écrire...`
            : `${names[0]} et ${names.length - 1} autres sont en train d'écrire...`;

        indicatorEl.innerHTML = `
            <div class="msg-typing-bubble">
                <div class="msg-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="msg-typing-text">${text}</span>
            </div>
        `;
        indicatorEl.style.display = 'block';
    }

    /**
     * Render online users widget in sidebar
     */
    function renderOnlineUsersWidget() {
        const sidebar = document.getElementById('msg-sidebar');
        if (!sidebar) return;

        // Check if widget already exists
        let widget = document.getElementById('msg-online-widget');

        const onlineUsers = Array.from(allPresences.values()).filter(p => p.status !== 'offline');
        const count = onlineUsers.length;

        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'msg-online-widget';
            widget.className = 'msg-online-widget';

            // Insert after search box
            const header = sidebar.querySelector('.msg-sidebar-header');
            if (header) {
                header.after(widget);
            }
        }

        widget.innerHTML = `
            <div class="msg-online-header" onclick="MessagingPresence.toggleOnlineList()">
                <span class="msg-online-icon">👥</span>
                <span class="msg-online-title">En ligne maintenant</span>
                <span class="msg-online-count">${count}</span>
            </div>
            <div class="msg-online-list" id="msg-online-list" style="display: none;">
                ${onlineUsers.map(p => renderOnlineUserItem(p)).join('')}
            </div>
        `;
    }

    /**
     * Render single online user item
     */
    function renderOnlineUserItem(presence) {
        const user = AppConfig.USERS?.find(u => u.id === presence.userId);
        if (!user) return '';

        const statusIcon = STATUS_ICONS[presence.status] || '⚫';
        const statusLabel = presence.customMessage || STATUS_LABELS[presence.status] || 'Hors ligne';

        return `
            <div class="msg-online-user">
                <div class="msg-online-user-avatar">
                    ${user.avatar || '👤'}
                </div>
                <div class="msg-online-user-info">
                    <div class="msg-online-user-name">${escapeHtml(user.name)}</div>
                    <div class="msg-online-user-status">
                        <span class="msg-status-icon">${statusIcon}</span>
                        <span>${escapeHtml(statusLabel)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Toggle online users list
     */
    function toggleOnlineList() {
        const list = document.getElementById('msg-online-list');
        if (!list) return;

        const isHidden = list.style.display === 'none';
        list.style.display = isHidden ? 'block' : 'none';

        // Add animation class
        if (isHidden) {
            list.classList.add('msg-online-list-open');
        } else {
            list.classList.remove('msg-online-list-open');
        }
    }

    /**
     * Get presence for user
     */
    function getPresence(userId) {
        return allPresences.get(userId) || null;
    }

    /**
     * Check if user is online
     */
    function isOnline(userId) {
        const presence = allPresences.get(userId);
        return presence && presence.status !== 'offline';
    }

    /**
     * Get status indicator HTML
     */
    function getStatusDot(userId) {
        const online = isOnline(userId);
        const presence = getPresence(userId);
        const statusClass = presence?.status || 'offline';

        return `<div class="msg-status-dot ${online ? 'online' : ''} status-${statusClass}"></div>`;
    }

    // ========== Helpers ==========

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========== Lifecycle ==========

    // Auto-init when page loads
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', cleanup);
    }

    return {
        init,
        cleanup,
        setStatus,
        setTyping,
        clearTyping,
        getTypingUsers,
        pollTypingUsers,
        getPresence,
        isOnline,
        getStatusDot,
        toggleOnlineList,
        loadOnlineUsers,
        renderOnlineUsersWidget
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingPresence = MessagingPresence;
}
