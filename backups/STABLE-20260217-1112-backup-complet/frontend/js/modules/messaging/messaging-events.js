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
        document.addEventListener('keydown', handleInputKeydown);
        document.addEventListener('input', handleInputResize);
    }

    /**
     * Handle input keydown (Enter to send, Shift+Enter for newline)
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
     * Show new conversation modal using the app's modal system
     */
    async function showNewConversationModal() {
        const users = MessagingAPI.getUsers();

        if (!users.length) {
            if (typeof Utils !== 'undefined' && Utils.showToast) {
                Utils.showToast('Aucun membre disponible', 'error');
            }
            return;
        }

        // Build user selection HTML
        const userListHtml = users.map(u => `
            <div class="msg-user-option" data-user-id="${u.id}" tabindex="0">
                <span class="msg-user-avatar">${u.avatar || '&#128100;'}</span>
                <span class="msg-user-name">${u.name}</span>
            </div>
        `).join('');

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'msg-new-conv-modal';
        modal.innerHTML = `
            <div class="modal-box" style="max-width: 400px;">
                <h3 class="modal-title">Nouvelle conversation</h3>
                <div class="msg-user-list" style="max-height: 300px; overflow-y: auto; margin: 16px 0;">
                    ${userListHtml}
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" id="msg-cancel-new">Annuler</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle clicks
        modal.querySelectorAll('.msg-user-option').forEach(option => {
            option.addEventListener('click', async () => {
                const userId = option.dataset.userId;
                modal.remove();

                try {
                    const conv = await MessagingAPI.createConversation([userId]);
                    await MessagingConversations.load();
                    if (conv && conv.id) {
                        MessagingConversations.selectConversation(conv.id);
                    }
                } catch (error) {
                    console.error('Failed to create conversation:', error);
                    if (typeof Utils !== 'undefined' && Utils.showToast) {
                        Utils.showToast('Erreur lors de la création', 'error');
                    }
                }
            });
        });

        // Cancel
        modal.querySelector('#msg-cancel-new').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    /**
     * Toggle emoji picker
     */
    function toggleEmojiPicker(btn) {
        const emojis = ['😊', '👍', '❤️', '🎉', '🔥', '✨', '💪', '🙏', '😂', '🤔', '👏', '🚀', '💯', '🤝', '😎'];

        // Check if picker already open
        const existing = document.getElementById('msg-emoji-picker');
        if (existing) {
            existing.remove();
            return;
        }

        const picker = document.createElement('div');
        picker.id = 'msg-emoji-picker';
        picker.className = 'msg-emoji-picker';
        picker.innerHTML = emojis.map(e => `<span class="msg-emoji-item">${e}</span>`).join('');

        // Position above the button
        const rect = btn.getBoundingClientRect();
        picker.style.cssText = `
            position: fixed;
            bottom: ${window.innerHeight - rect.top + 8}px;
            right: ${window.innerWidth - rect.right}px;
            z-index: 1000;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 12px;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.3);
            animation: bubbleIn 0.2s ease;
        `;

        document.body.appendChild(picker);

        picker.querySelectorAll('.msg-emoji-item').forEach(item => {
            item.style.cssText = 'cursor: pointer; font-size: 1.4rem; padding: 6px; text-align: center; border-radius: 8px; transition: background 0.15s;';
            item.addEventListener('mouseenter', () => item.style.background = 'var(--hover)');
            item.addEventListener('mouseleave', () => item.style.background = 'transparent');
            item.addEventListener('click', () => {
                const input = document.getElementById('msg-input');
                if (input) {
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    const text = input.value;
                    input.value = text.substring(0, start) + item.textContent + text.substring(end);
                    input.selectionStart = input.selectionEnd = start + item.textContent.length;
                    input.focus();
                }
                picker.remove();
            });
        });

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (!picker.contains(e.target) && e.target !== btn) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 10);
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
