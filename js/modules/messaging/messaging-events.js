/**
 * Messaging Events Module
 * Handles all event listeners, keyboard shortcuts, scroll behavior
 */

const MessagingEvents = (function() {
    'use strict';

    let initialized = false;

    /**
     * Initialize all event listeners
     */
    function init() {
        if (initialized) return;

        initSearchEvents();
        initInputEvents();
        initKeyboardShortcuts();
        initNewConversation();

        initialized = true;
        console.log('✅ Messaging events initialized');
    }

    /**
     * Initialize search input events
     */
    function initSearchEvents() {
        const searchInput = document.getElementById('msg-search-input');
        if (!searchInput) return;

        let debounceTimer = null;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                MessagingConversations.filter(e.target.value);
            }, 200);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                MessagingConversations.filter('');
                searchInput.blur();
            }
        });
    }

    /**
     * Initialize message input events
     */
    function initInputEvents() {
        // Use event delegation since input is dynamically created
        document.addEventListener('keydown', handleInputKeydown);
        document.addEventListener('input', handleInputResize);
    }

    /**
     * Handle input keydown (Enter to send, Shift+Enter for newline)
     * @param {KeyboardEvent} e
     */
    function handleInputKeydown(e) {
        if (e.target.id !== 'msg-input') return;

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            MessagingChat.sendMessage();
        }
    }

    /**
     * Auto-resize textarea as user types
     * @param {InputEvent} e
     */
    function handleInputResize(e) {
        if (e.target.id !== 'msg-input') return;

        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    /**
     * Initialize keyboard shortcuts
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('msg-search-input');
                if (searchInput) searchInput.focus();
            }

            // Escape to close/unfocus
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('msg-search-input');
                if (searchInput && document.activeElement === searchInput) {
                    searchInput.blur();
                }
            }

            // Arrow keys to navigate conversations
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                navigateConversations(e.key === 'ArrowUp' ? -1 : 1);
            }
        });
    }

    /**
     * Navigate conversations with arrow keys
     * @param {number} direction - -1 for up, 1 for down
     */
    function navigateConversations(direction) {
        const conversations = MessagingConversations.getAll();
        const active = MessagingConversations.getActive();

        if (!conversations.length) return;

        let currentIdx = conversations.findIndex(c => c.id === active?.id);
        let newIdx = currentIdx + direction;

        if (newIdx < 0) newIdx = conversations.length - 1;
        if (newIdx >= conversations.length) newIdx = 0;

        MessagingConversations.selectConversation(conversations[newIdx].id);
    }

    /**
     * Initialize new conversation button
     */
    function initNewConversation() {
        // Use event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('#msg-new-btn')) {
                showNewConversationModal();
            }

            // Emoji button
            if (e.target.closest('#msg-emoji-btn')) {
                toggleEmojiPicker(e.target.closest('#msg-emoji-btn'));
            }
        });
    }

    /**
     * Show new conversation modal
     */
    async function showNewConversationModal() {
        // Simple prompt for now - could be replaced with a proper modal
        const users = await MessagingAPI.getUsers();
        const userList = users.map((u, i) => `${i + 1}. ${u.name}`).join('\n');

        const choice = prompt(`Nouvelle conversation avec :\n${userList}\n\nEntrez le numéro :`);
        if (!choice) return;

        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < users.length) {
            try {
                const conv = await MessagingAPI.createConversation([users[idx].id]);
                await MessagingConversations.load();
                MessagingConversations.selectConversation(conv.id);
            } catch (error) {
                console.error('❌ Failed to create conversation:', error);
                alert('Erreur lors de la création de la conversation');
            }
        }
    }

    /**
     * Toggle emoji picker
     * @param {HTMLElement} btn
     */
    function toggleEmojiPicker(btn) {
        // Simple emoji insertion for now
        const emojis = ['😊', '👍', '❤️', '🎉', '🔥', '✨', '💪', '🙏', '😂', '🤔'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        const input = document.getElementById('msg-input');
        if (input) {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const text = input.value;
            input.value = text.substring(0, start) + emoji + text.substring(end);
            input.selectionStart = input.selectionEnd = start + emoji.length;
            input.focus();
        }
    }

    /**
     * Handle scroll for infinite loading
     */
    function initScrollHandler() {
        document.addEventListener('scroll', (e) => {
            if (e.target.id !== 'msg-messages') return;

            const el = e.target;
            if (el.scrollTop < 50) {
                // Load more messages (pagination)
                console.log('📜 Load more messages...');
            }
        }, true);
    }

    /**
     * Cleanup listeners
     */
    function destroy() {
        document.removeEventListener('keydown', handleInputKeydown);
        document.removeEventListener('input', handleInputResize);
        initialized = false;
    }

    return {
        init,
        destroy,
        navigateConversations
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingEvents = MessagingEvents;
}
