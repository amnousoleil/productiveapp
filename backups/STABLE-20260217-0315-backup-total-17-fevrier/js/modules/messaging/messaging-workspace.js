/**
 * Messaging Workspace Module - TeamTalk Pro
 * Handles conversation organization: folders, channels, favorites, archives
 */

const MessagingWorkspace = (function() {
    'use strict';

    // State
    let folders = [];
    let favorites = new Set();
    let archived = new Set();

    /**
     * Initialize workspace
     */
    async function init() {
        try {
            // Load folders from localStorage (backend integration later)
            loadFolders();

            // Render workspace structure
            renderWorkspace();

            console.log('✅ Workspace system initialized');
        } catch (error) {
            console.error('❌ Failed to init workspace:', error);
        }
    }

    /**
     * Load folders from localStorage
     */
    function loadFolders() {
        const saved = localStorage.getItem('productiveapp_msg_folders');
        if (saved) {
            try {
                folders = JSON.parse(saved);
            } catch (e) {
                folders = [];
            }
        } else {
            // Default folders
            folders = [
                { id: 'favorites', name: '⭐ Favoris', type: 'system', color: '#f59e0b' },
                { id: 'channels', name: '📢 Channels', type: 'system', color: '#3b82f6' },
                { id: 'direct', name: '💬 Messages directs', type: 'system', color: '#8b5cf6' },
                { id: 'archived', name: '📦 Archives', type: 'system', color: '#6b7280' }
            ];
        }

        // Load favorites
        const favs = localStorage.getItem('productiveapp_msg_favorites');
        if (favs) {
            try {
                favorites = new Set(JSON.parse(favs));
            } catch (e) {
                favorites = new Set();
            }
        }

        // Load archived
        const arch = localStorage.getItem('productiveapp_msg_archived');
        if (arch) {
            try {
                archived = new Set(JSON.parse(arch));
            } catch (e) {
                archived = new Set();
            }
        }
    }

    /**
     * Save folders to localStorage
     */
    function saveFolders() {
        localStorage.setItem('productiveapp_msg_folders', JSON.stringify(folders));
        localStorage.setItem('productiveapp_msg_favorites', JSON.stringify([...favorites]));
        localStorage.setItem('productiveapp_msg_archived', JSON.stringify([...archived]));
    }

    /**
     * Render workspace structure in sidebar
     */
    function renderWorkspace() {
        const listEl = document.getElementById('msg-conv-list');
        if (!listEl) return;

        const conversations = MessagingConversations?.getAll() || [];

        // Filter conversations
        const favConvs = conversations.filter(c => favorites.has(c.id));
        const channels = conversations.filter(c => c.type === 'channel' && !favorites.has(c.id) && !archived.has(c.id));
        const direct = conversations.filter(c => c.type === 'direct' && !favorites.has(c.id) && !archived.has(c.id));
        const archivedConvs = conversations.filter(c => archived.has(c.id));

        let html = '';

        // Favorites
        if (favConvs.length > 0) {
            html += renderFolderSection('favorites', '⭐ Favoris', favConvs, true);
        }

        // Channels
        if (channels.length > 0) {
            html += renderFolderSection('channels', '📢 Channels', channels, true);
        }

        // Direct messages
        if (direct.length > 0) {
            html += renderFolderSection('direct', '💬 Messages directs', direct, true);
        }

        // Archived (collapsed by default)
        if (archivedConvs.length > 0) {
            html += renderFolderSection('archived', '📦 Archives', archivedConvs, false);
        }

        listEl.innerHTML = html || '<div class="msg-empty-state">Aucune conversation</div>';

        // Attach listeners
        attachWorkspaceListeners();
    }

    /**
     * Render folder section
     */
    function renderFolderSection(folderId, title, conversations, expanded = true) {
        const count = conversations.length;

        return `
            <div class="msg-folder" data-folder-id="${folderId}">
                <div class="msg-folder-header" onclick="MessagingWorkspace.toggleFolder('${folderId}')">
                    <svg class="msg-folder-icon ${expanded ? 'expanded' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span class="msg-folder-title">${title}</span>
                    <span class="msg-folder-count">${count}</span>
                </div>
                <div class="msg-folder-content ${expanded ? 'expanded' : ''}" id="msg-folder-${folderId}">
                    ${conversations.map(conv => renderConversationItem(conv)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render conversation item
     */
    function renderConversationItem(conv) {
        const isActive = false; // TODO: check active from MessagingConversations
        const participant = conv.participants?.[0] || {};
        const name = conv.name || participant.name || 'Conversation';
        const avatar = participant.avatar || '👤';
        const lastMsg = conv.lastMessage?.content || '';
        const time = formatRelativeTime(conv.lastMessage?.createdAt);
        const unread = conv.unreadCount || 0;
        const isFavorite = favorites.has(conv.id);
        const isArchived = archived.has(conv.id);

        return `
            <div class="msg-conv-item ${isActive ? 'active' : ''}" data-id="${conv.id}">
                <div class="msg-conv-avatar">
                    ${(avatar.startsWith('http') || avatar.startsWith('/uploads'))
                        ? `<img src="${avatar}" alt="${name}">`
                        : avatar}
                    ${MessagingPresence?.getStatusDot(participant.id) || ''}
                </div>
                <div class="msg-conv-info">
                    <div class="msg-conv-header">
                        <span class="msg-conv-name">${escapeHtml(name)}</span>
                        <span class="msg-conv-time">${time}</span>
                    </div>
                    <div class="msg-conv-preview">${escapeHtml(truncate(lastMsg, 40))}</div>
                </div>
                ${unread > 0 ? `<span class="msg-conv-badge">${unread > 99 ? '99+' : unread}</span>` : ''}
                <div class="msg-conv-actions">
                    <button class="msg-conv-action" onclick="MessagingWorkspace.toggleFavorite('${conv.id}', event)" title="${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                        ${isFavorite ? '⭐' : '☆'}
                    </button>
                    <button class="msg-conv-action" onclick="MessagingWorkspace.toggleArchive('${conv.id}', event)" title="${isArchived ? 'Désarchiver' : 'Archiver'}">
                        📦
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Attach workspace listeners
     */
    function attachWorkspaceListeners() {
        // Conversation clicks
        const items = document.querySelectorAll('.msg-conv-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons
                if (e.target.closest('.msg-conv-action')) return;

                const id = item.dataset.id;
                if (MessagingConversations) {
                    MessagingConversations.selectConversation(id);
                }
            });
        });
    }

    /**
     * Toggle folder expand/collapse
     */
    function toggleFolder(folderId) {
        const content = document.getElementById(`msg-folder-${folderId}`);
        const icon = document.querySelector(`[data-folder-id="${folderId}"] .msg-folder-icon`);

        if (!content || !icon) return;

        const isExpanded = content.classList.contains('expanded');

        if (isExpanded) {
            content.classList.remove('expanded');
            icon.classList.remove('expanded');
        } else {
            content.classList.add('expanded');
            icon.classList.add('expanded');
        }
    }

    /**
     * Toggle favorite
     */
    function toggleFavorite(conversationId, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (favorites.has(conversationId)) {
            favorites.delete(conversationId);
        } else {
            favorites.add(conversationId);
        }

        saveFolders();
        renderWorkspace();

        // Show toast
        const isFav = favorites.has(conversationId);
        if (typeof Toast !== 'undefined') {
            Toast.success(isFav ? '⭐ Ajouté aux favoris' : 'Retiré des favoris');
        }
    }

    /**
     * Toggle archive
     */
    function toggleArchive(conversationId, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (archived.has(conversationId)) {
            archived.delete(conversationId);
        } else {
            archived.add(conversationId);
        }

        saveFolders();
        renderWorkspace();

        // Show toast
        const isArch = archived.has(conversationId);
        if (typeof Toast !== 'undefined') {
            Toast.success(isArch ? '📦 Archivé' : 'Désarchivé');
        }
    }

    /**
     * Create custom folder
     */
    function createFolder(name, color = '#6b7280') {
        const id = 'folder-' + Date.now();

        folders.push({
            id,
            name,
            type: 'custom',
            color,
            conversations: []
        });

        saveFolders();
        renderWorkspace();

        return id;
    }

    /**
     * Show new channel modal
     */
    function showNewChannelModal() {
        const modalHtml = `
            <div class="msg-modal-overlay" id="msg-channel-modal">
                <div class="msg-modal">
                    <div class="msg-modal-header">
                        <h3>📢 Nouveau Channel</h3>
                        <button class="msg-modal-close" onclick="MessagingWorkspace.closeChannelModal()">×</button>
                    </div>
                    <div class="msg-modal-body">
                        <div class="msg-form-group">
                            <label>Nom du channel</label>
                            <input type="text" id="msg-channel-name" class="msg-input" placeholder="ex: #général, #dev, #marketing" />
                        </div>
                        <div class="msg-form-group">
                            <label>Description (optionnelle)</label>
                            <textarea id="msg-channel-desc" class="msg-textarea" rows="3" placeholder="Objectif du channel..."></textarea>
                        </div>
                        <div class="msg-form-group">
                            <label>
                                <input type="checkbox" id="msg-channel-private" />
                                Channel privé (sur invitation uniquement)
                            </label>
                        </div>
                    </div>
                    <div class="msg-modal-footer">
                        <button class="msg-btn-secondary" onclick="MessagingWorkspace.closeChannelModal()">Annuler</button>
                        <button class="msg-btn-primary" onclick="MessagingWorkspace.createChannel()">Créer</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('msg-channel-name')?.focus();
    }

    /**
     * Close channel modal
     */
    function closeChannelModal() {
        document.getElementById('msg-channel-modal')?.remove();
    }

    /**
     * Create new channel
     */
    async function createChannel() {
        const nameInput = document.getElementById('msg-channel-name');
        const descInput = document.getElementById('msg-channel-desc');
        const privateCheck = document.getElementById('msg-channel-private');

        const name = nameInput?.value.trim();
        if (!name) {
            if (typeof Toast !== 'undefined') {
                Toast.error('Veuillez entrer un nom');
            }
            nameInput?.focus();
            return;
        }

        // Add # prefix if not present
        const channelName = name.startsWith('#') ? name : '#' + name;
        const description = descInput?.value.trim() || '';
        const isPrivate = privateCheck?.checked || false;

        try {
            // Create conversation via API
            const conversation = await MessagingAPI.createConversation({
                type: 'channel',
                name: channelName,
                description,
                isPrivate
            });

            // Close modal
            closeChannelModal();

            // Reload conversations
            if (MessagingConversations) {
                await MessagingConversations.load();
                renderWorkspace();
            }

            // Show success
            if (typeof Toast !== 'undefined') {
                Toast.success(`Channel ${channelName} créé !`);
            }

            // Select new conversation
            if (MessagingConversations) {
                MessagingConversations.selectConversation(conversation.id);
            }
        } catch (error) {
            console.error('Failed to create channel:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Échec de la création du channel');
            }
        }
    }

    // ========== Helpers ==========

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function truncate(str, len) {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '...' : str;
    }

    function formatRelativeTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'maintenant';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    return {
        init,
        renderWorkspace,
        toggleFolder,
        toggleFavorite,
        toggleArchive,
        createFolder,
        showNewChannelModal,
        closeChannelModal,
        createChannel
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingWorkspace = MessagingWorkspace;
}
