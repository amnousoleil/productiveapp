/**
 * Messaging Module - Main Orchestrator
 * Coordinates all messaging components
 */

const Messaging = (function() {
    'use strict';

    let initialized = false;
    let container = null;

    /**
     * Initialize messaging module
     * @param {string} containerId - ID of container element
     */
    async function init(containerId = 'view-messaging') {
        if (initialized) {
            console.log('💬 Messaging already initialized');
            return;
        }

        container = document.getElementById(containerId);
        if (!container) {
            console.warn('⚠️ Messaging container not found:', containerId);
            return;
        }

        console.log('💬 Initializing Messaging...');

        try {
            // Initialize UI
            MessagingUI.init(container);
            MessagingUI.render();

            // Show loading state
            MessagingUI.showLoading();

            // Load conversations
            await MessagingConversations.load();

            // Set up conversation selection handler
            MessagingConversations.onSelect(handleConversationSelect);

            // Show empty state initially
            MessagingUI.renderEmptyState();

            // Initialize event handlers
            MessagingEvents.init();

            initialized = true;
            console.log('✅ Messaging initialized successfully');

        } catch (error) {
            console.error('❌ Messaging init failed:', error);
            renderError();
        }
    }

    /**
     * Handle conversation selection
     * @param {Object} conversation
     */
    function handleConversationSelect(conversation) {
        if (!conversation) {
            MessagingUI.renderEmptyState();
            return;
        }

        MessagingChat.open(conversation);
    }

    /**
     * Render error state
     */
    function renderError() {
        if (!container) return;

        container.innerHTML = `
            <div class="msg-container" style="justify-content: center; align-items: center;">
                <div style="text-align: center; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 1.1rem; margin-bottom: 8px;">Erreur de chargement</div>
                    <button onclick="Messaging.refresh()" style="padding: 10px 20px; border-radius: 8px; background: var(--accent); color: white; border: none; cursor: pointer;">
                        Réessayer
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Show the messaging view
     */
    function show() {
        if (!initialized) {
            init();
        }

        // Navigate to messaging view
        if (typeof Router !== 'undefined') {
            Router.navigate('messaging');
        } else {
            // Manual show
            document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
            const view = document.getElementById('view-messaging');
            if (view) view.classList.add('active');
        }
    }

    /**
     * Hide the messaging view
     */
    function hide() {
        const view = document.getElementById('view-messaging');
        if (view) view.classList.remove('active');
    }

    /**
     * Refresh messaging data
     */
    async function refresh() {
        initialized = false;
        await init();
    }

    /**
     * Open specific conversation
     * @param {string} conversationId
     */
    async function openConversation(conversationId) {
        if (!initialized) {
            await init();
        }

        show();
        MessagingConversations.selectConversation(conversationId);
    }

    /**
     * Send message to current conversation
     * @param {string} content
     */
    function sendMessage(content) {
        const input = document.getElementById('msg-input');
        if (input) {
            input.value = content;
            MessagingChat.sendMessage();
        }
    }

    /**
     * Handle incoming message (from websocket)
     * @param {Object} message
     */
    function handleIncomingMessage(message) {
        if (!initialized) return;

        // Update conversation list
        MessagingConversations.updateWithMessage(message.conversationId, message);

        // If this conversation is open, add bubble
        MessagingChat.receiveMessage(message);
    }

    /**
     * Get unread count
     */
    function getUnreadCount() {
        const conversations = MessagingConversations.getAll();
        return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
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
        MessagingEvents.destroy();
        initialized = false;
        container = null;
    }

    return {
        init,
        show,
        hide,
        refresh,
        openConversation,
        sendMessage,
        handleIncomingMessage,
        getUnreadCount,
        isInitialized,
        destroy
    };
})();

if (typeof window !== 'undefined') {
    window.Messaging = Messaging;
}
