/**
 * Messaging UI Module - Premium Edition
 * Divine layout with file sharing capabilities
 */

const MessagingUI = (function() {
    'use strict';

    let container = null;

    /**
     * Initialize UI with container
     */
    function init(el) {
        container = el;
    }

    /**
     * Render main layout - Premium two-column
     */
    function render() {
        if (!container) return;

        container.innerHTML = `
            <div class="msg-container">
                <!-- Left: Conversations List -->
                <aside class="msg-sidebar" id="msg-sidebar">
                    <div class="msg-sidebar-header">
                        <div class="msg-sidebar-title">
                            <span>TeamTalk</span>
                            <button class="msg-new-btn" id="msg-new-btn" title="Nouvelle conversation">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="msg-search">
                            <svg class="msg-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input type="text" class="msg-search-input" id="msg-search-input" placeholder="Rechercher une conversation..." autocomplete="off">
                        </div>
                    </div>
                    <div class="msg-conv-list" id="msg-conv-list">
                        <!-- Conversations rendered here -->
                    </div>
                </aside>

                <!-- Right: Chat Zone -->
                <section class="msg-chat" id="msg-chat">
                    <!-- Chat content or empty state -->
                </section>
            </div>
        `;
    }

    /**
     * Render empty state - Divine welcome
     */
    function renderEmptyState() {
        const chatEl = document.getElementById('msg-chat');
        if (!chatEl) return;

        chatEl.innerHTML = `
            <div class="msg-empty">
                <div class="msg-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                </div>
                <div class="msg-empty-title">Bienvenue sur TeamTalk</div>
                <div class="msg-empty-text">
                    Votre espace de communication premium.<br>
                    Partagez des messages, fichiers et images avec votre equipe.
                </div>
            </div>
        `;
    }

    /**
     * Render chat header - Premium with actions
     */
    function renderChatHeader(conversation) {
        const isGroup = conversation.type === 'channel' || conversation.type === 'group';
        const currentUserId = (typeof AppState !== 'undefined') ? AppState.currentUser?.id : null;

        let name, avatar, isOnline, subtitle;

        if (isGroup) {
            name = conversation.name || 'Groupe';
            avatar = conversation.type === 'channel' ? '#' : '&#128101;';
            isOnline = false;
            const participantNames = conversation.participants
                .map(p => p.name)
                .slice(0, 3)
                .join(', ');
            const extra = conversation.participants.length > 3 ? ` +${conversation.participants.length - 3}` : '';
            subtitle = participantNames + extra;
        } else {
            const other = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0] || {};
            name = other.name || 'Conversation';
            avatar = other.avatar || '&#128100;';
            isOnline = other.online || false;
            subtitle = isOnline ? 'En ligne' : 'Hors ligne';
        }

        return `
            <div class="msg-chat-header">
                <button class="msg-back-btn msg-action-btn" id="msg-back-btn" style="display: none;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <div class="msg-chat-avatar ${isGroup ? 'group' : ''}">
                    ${avatar.startsWith && avatar.startsWith('http')
                        ? `<img src="${avatar}" alt="${escapeHtml(name)}">`
                        : `<span>${avatar}</span>`}
                    ${!isGroup ? `<div class="msg-status-dot ${isOnline ? 'online' : ''}"></div>` : ''}
                </div>
                <div class="msg-chat-info">
                    <div class="msg-chat-name">${escapeHtml(name)}</div>
                    <div class="msg-chat-status">${escapeHtml(subtitle)}</div>
                </div>
                <div class="msg-chat-actions">
                    <button class="msg-chat-action" id="msg-search-chat" title="Rechercher">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                    <button class="msg-chat-action" id="msg-chat-info" title="Informations">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render chat input area - Premium with file sharing
     */
    function renderChatInput() {
        return `
            <div class="msg-upload-preview" id="msg-upload-preview" style="display: none;"></div>
            <div class="msg-input-area">
                <div class="msg-input-actions">
                    <button class="msg-action-btn" id="msg-attach-file" title="Joindre un fichier">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                        <input type="file" id="msg-file-input" multiple accept="*/*" />
                    </button>
                    <button class="msg-action-btn" id="msg-attach-image" title="Envoyer une image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <input type="file" id="msg-image-input" multiple accept="image/*" />
                    </button>
                </div>
                <div class="msg-input-wrapper">
                    <textarea class="msg-input" id="msg-input" placeholder="Ecrivez votre message..." rows="1"></textarea>
                    <button class="msg-emoji-btn" id="msg-emoji-btn" title="Emoji">&#128522;</button>
                </div>
                <button class="msg-send-btn" id="msg-send-btn" title="Envoyer">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        `;
    }

    /**
     * Show loading state with premium skeleton
     */
    function showLoading() {
        const listEl = document.getElementById('msg-conv-list');
        if (listEl) {
            listEl.innerHTML = `
                <div class="msg-skeleton msg-skeleton-conv"></div>
                <div class="msg-skeleton msg-skeleton-conv"></div>
                <div class="msg-skeleton msg-skeleton-conv"></div>
                <div class="msg-skeleton msg-skeleton-conv"></div>
            `;
        }
    }

    /**
     * Render new conversation modal
     */
    function renderNewConversationModal(users, onSelect, onCreateGroup) {
        const modal = document.createElement('div');
        modal.className = 'msg-modal-overlay';
        modal.id = 'msg-new-conv-modal';

        const usersHtml = users.map(u => `
            <div class="msg-user-option" data-user-id="${u.id}" data-user-name="${escapeHtml(u.name)}">
                <div class="msg-user-avatar">${u.avatar || '&#128100;'}</div>
                <div class="msg-user-name">${escapeHtml(u.name)}</div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="msg-modal">
                <div class="msg-modal-header">
                    <div class="msg-modal-title">Nouvelle conversation</div>
                    <button class="msg-modal-close" id="msg-modal-close">&times;</button>
                </div>
                <div class="msg-modal-body">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 12px; color: var(--text-muted); font-size: 0.85rem;">
                            Conversation directe
                        </label>
                        ${usersHtml}
                    </div>
                    <div style="border-top: 1px solid var(--tt-glass-border); padding-top: 16px; margin-top: 16px;">
                        <label style="display: block; margin-bottom: 12px; color: var(--text-muted); font-size: 0.85rem;">
                            Ou creer un groupe
                        </label>
                        <input type="text" class="msg-group-input" id="msg-group-name" placeholder="Nom du groupe...">
                        <div id="msg-group-users" style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;"></div>
                    </div>
                </div>
                <div class="msg-modal-footer">
                    <button class="msg-modal-btn secondary" id="msg-modal-cancel">Annuler</button>
                    <button class="msg-modal-btn primary" id="msg-create-group" style="display: none;">Creer le groupe</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const closeModal = () => modal.remove();

        modal.querySelector('#msg-modal-close').addEventListener('click', closeModal);
        modal.querySelector('#msg-modal-cancel').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Direct conversation selection
        modal.querySelectorAll('.msg-user-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const userId = opt.dataset.userId;
                onSelect([userId]);
                closeModal();
            });
        });

        // Group creation
        const groupNameInput = modal.querySelector('#msg-group-name');
        const createGroupBtn = modal.querySelector('#msg-create-group');
        let selectedGroupUsers = [];

        groupNameInput.addEventListener('input', () => {
            createGroupBtn.style.display = groupNameInput.value.trim() ? 'block' : 'none';
        });

        createGroupBtn.addEventListener('click', () => {
            const name = groupNameInput.value.trim();
            if (name && selectedGroupUsers.length > 0) {
                onCreateGroup(name, selectedGroupUsers);
                closeModal();
            }
        });
    }

    /**
     * Show lightbox for images
     */
    function showLightbox(src) {
        const lightbox = document.createElement('div');
        lightbox.className = 'msg-lightbox';
        lightbox.innerHTML = `
            <button class="msg-lightbox-close">&times;</button>
            <img src="${src}" alt="Image">
        `;

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('msg-lightbox-close')) {
                lightbox.remove();
            }
        });

        document.body.appendChild(lightbox);
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get container
     */
    function getContainer() {
        return container;
    }

    /**
     * Format file size
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * Get file icon based on extension
     */
    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            pdf: { icon: 'PDF', class: 'pdf' },
            doc: { icon: 'DOC', class: 'doc' },
            docx: { icon: 'DOC', class: 'doc' },
            xls: { icon: 'XLS', class: 'doc' },
            xlsx: { icon: 'XLS', class: 'doc' },
            ppt: { icon: 'PPT', class: 'doc' },
            pptx: { icon: 'PPT', class: 'doc' },
            zip: { icon: 'ZIP', class: 'default' },
            rar: { icon: 'RAR', class: 'default' },
            txt: { icon: 'TXT', class: 'default' },
            mp3: { icon: '&#127925;', class: 'default' },
            mp4: { icon: '&#127909;', class: 'default' },
        };
        return icons[ext] || { icon: '&#128196;', class: 'default' };
    }

    return {
        init,
        render,
        renderEmptyState,
        renderChatHeader,
        renderChatInput,
        showLoading,
        renderNewConversationModal,
        showLightbox,
        formatFileSize,
        getFileIcon,
        getContainer
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingUI = MessagingUI;
}
