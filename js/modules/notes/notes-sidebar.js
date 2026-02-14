/**
 * NOTES SIDEBAR - Arborescence dossiers type Obsidian
 * ProductiveApp v5.0 - Phase 1
 */

const NotesSidebar = (function() {
    'use strict';

    let draggedNote = null;
    let draggedFolder = null;
    let expandedFolders = new Set();

    // ========== ICONS ==========

    const icons = {
        folder: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        folderOpen: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"/></svg>',
        chevronRight: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
        chevronDown: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
        file: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        plus: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        moreVertical: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
        search: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    };

    // ========== HELPERS ==========

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function loadExpandedState() {
        const memberId = localStorage.getItem('selectedMemberId') || 'default';
        const key = `productiveapp_expanded_folders_${memberId}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved) expandedFolders = new Set(JSON.parse(saved));
        } catch (e) {
            console.warn('Failed to load expanded folders state', e);
        }
    }

    function saveExpandedState() {
        const memberId = localStorage.getItem('selectedMemberId') || 'default';
        const key = `productiveapp_expanded_folders_${memberId}`;
        try {
            localStorage.setItem(key, JSON.stringify([...expandedFolders]));
        } catch (e) {
            console.warn('Failed to save expanded folders state', e);
        }
    }

    function toggleFolder(folderId) {
        if (expandedFolders.has(folderId)) {
            expandedFolders.delete(folderId);
        } else {
            expandedFolders.add(folderId);
        }
        saveExpandedState();
        render();
    }

    // ========== RENDER TREE ==========

    function renderFolderNode(folder, depth = 0) {
        const isExpanded = expandedFolders.has(folder.id);
        const hasChildren = folder.children && folder.children.length > 0;
        const notes = NotesModule.getNotesByFolder(folder.id);
        const totalCount = notes.length;

        const chevron = hasChildren
            ? (isExpanded ? icons.chevronDown : icons.chevronRight)
            : '<span style="width:14px;display:inline-block"></span>';

        const folderIcon = isExpanded ? icons.folderOpen : icons.folder;

        const html = `
            <div class="sidebar-folder-item" data-folder-id="${folder.id}" data-depth="${depth}" draggable="true">
                <div class="sidebar-folder-header" onclick="NotesSidebar.selectFolder('${folder.id}')">
                    <span class="sidebar-folder-chevron" onclick="event.stopPropagation(); NotesSidebar.toggleFolder('${folder.id}')">${chevron}</span>
                    <span class="sidebar-folder-icon" style="color: ${escapeHtml(folder.color)}">${folderIcon}</span>
                    <span class="sidebar-folder-name">${escapeHtml(folder.name)}</span>
                    <span class="sidebar-folder-count">${totalCount}</span>
                    <button class="sidebar-folder-menu" onclick="event.stopPropagation(); NotesSidebar.showFolderMenu('${folder.id}', event)" title="Options">
                        ${icons.moreVertical}
                    </button>
                </div>
                ${isExpanded ? `
                    <div class="sidebar-folder-children">
                        ${hasChildren ? folder.children.map(child => renderFolderNode(child, depth + 1)).join('') : ''}
                        ${notes.length > 0 ? renderNotesList(notes, depth + 1) : ''}
                    </div>
                ` : ''}
            </div>
        `;

        return html;
    }

    function renderNotesList(notes, depth = 0) {
        const currentId = NotesModule.currentNoteId;
        return notes.map(note => {
            const isActive = note.id === currentId;
            return `
                <div class="sidebar-note-item ${isActive ? 'active' : ''}"
                     data-note-id="${note.id}"
                     data-depth="${depth}"
                     draggable="true"
                     onclick="NotesSidebar.selectNote('${note.id}')">
                    <span class="sidebar-note-icon">${icons.file}</span>
                    <span class="sidebar-note-title">${escapeHtml(note.title) || 'Sans titre'}</span>
                </div>
            `;
        }).join('');
    }

    function renderRootNotes() {
        const rootNotes = NotesModule.getNotesByFolder(null);
        if (rootNotes.length === 0) return '';

        return `
            <div class="sidebar-section">
                <div class="sidebar-section-header">
                    <span>📄 Notes racine</span>
                    <span class="sidebar-folder-count">${rootNotes.length}</span>
                </div>
                ${renderNotesList(rootNotes, 0)}
            </div>
        `;
    }

    // ========== MAIN RENDER ==========

    function render() {
        const container = document.querySelector('.notes-sidebar-tree');
        if (!container) return;

        const folders = NotesModule.getFolderTree();

        const html = `
            <div class="sidebar-toolbar">
                <button class="sidebar-btn sidebar-btn-primary" onclick="NotesSidebar.createNewFolder()" title="Nouveau dossier">
                    ${icons.folder} <span>Nouveau dossier</span>
                </button>
                <button class="sidebar-btn" onclick="NotesSidebar.createNewNote()" title="Nouvelle note">
                    ${icons.plus} <span>Note</span>
                </button>
            </div>

            <div class="sidebar-search">
                <span class="sidebar-search-icon">${icons.search}</span>
                <input type="text"
                    class="sidebar-search-input"
                    placeholder="Rechercher..."
                    oninput="NotesSidebar.handleSearch(this.value)"
                    value="">
            </div>

            <div class="sidebar-folders">
                ${folders.map(folder => renderFolderNode(folder, 0)).join('')}
                ${renderRootNotes()}
            </div>

            ${folders.length === 0 && NotesModule.getNotes().length === 0 ? `
                <div class="sidebar-empty">
                    <p>Aucun dossier ni note</p>
                    <button class="sidebar-btn sidebar-btn-primary" onclick="NotesSidebar.createNewFolder()">
                        ${icons.folder} Créer un dossier
                    </button>
                </div>
            ` : ''}
        `;

        container.innerHTML = html;

        // Setup drag & drop
        setupDragAndDrop();
    }

    // ========== DRAG & DROP ==========

    function setupDragAndDrop() {
        const container = document.querySelector('.notes-sidebar-tree');
        if (!container) return;

        // Drag start
        container.addEventListener('dragstart', (e) => {
            const noteItem = e.target.closest('.sidebar-note-item');
            const folderItem = e.target.closest('.sidebar-folder-item');

            if (noteItem) {
                draggedNote = noteItem.dataset.noteId;
                noteItem.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            } else if (folderItem) {
                draggedFolder = folderItem.dataset.folderId;
                folderItem.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        // Drag end
        container.addEventListener('dragend', (e) => {
            const item = e.target.closest('.sidebar-note-item, .sidebar-folder-item');
            if (item) item.classList.remove('dragging');
            draggedNote = null;
            draggedFolder = null;

            // Remove all drag-over classes
            container.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
        });

        // Drag over folder
        container.addEventListener('dragover', (e) => {
            const folderHeader = e.target.closest('.sidebar-folder-header');
            if (!folderHeader) return;

            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        // Drag enter folder
        container.addEventListener('dragenter', (e) => {
            const folderHeader = e.target.closest('.sidebar-folder-header');
            if (!folderHeader) return;

            const folderItem = folderHeader.closest('.sidebar-folder-item');
            if (folderItem) folderItem.classList.add('drag-over');
        });

        // Drag leave folder
        container.addEventListener('dragleave', (e) => {
            const folderHeader = e.target.closest('.sidebar-folder-header');
            if (!folderHeader) return;

            const folderItem = folderHeader.closest('.sidebar-folder-item');
            if (folderItem && !folderItem.contains(e.relatedTarget)) {
                folderItem.classList.remove('drag-over');
            }
        });

        // Drop on folder
        container.addEventListener('drop', (e) => {
            e.preventDefault();

            const folderHeader = e.target.closest('.sidebar-folder-header');
            if (!folderHeader) return;

            const targetFolderItem = folderHeader.closest('.sidebar-folder-item');
            if (!targetFolderItem) return;

            const targetFolderId = targetFolderItem.dataset.folderId;
            targetFolderItem.classList.remove('drag-over');

            if (draggedNote) {
                // Move note to folder
                handleMoveNote(draggedNote, targetFolderId);
            } else if (draggedFolder && draggedFolder !== targetFolderId) {
                // Move folder into folder
                handleMoveFolder(draggedFolder, targetFolderId);
            }
        });
    }

    async function handleMoveNote(noteId, targetFolderId) {
        await NotesModule.updateNote(noteId, { folderId: targetFolderId });
        render();

        if (window.Toast) {
            window.Toast.success('Note déplacée', { duration: 2000 });
        }
    }

    async function handleMoveFolder(folderId, targetFolderId) {
        // Prevent circular reference
        const folder = NotesModule.getFolder(folderId);
        if (!folder) return;

        // Check if target is a descendant
        let current = NotesModule.getFolder(targetFolderId);
        while (current) {
            if (current.id === folderId) {
                if (window.Toast) {
                    window.Toast.error('Impossible de déplacer un dossier dans lui-même');
                }
                return;
            }
            current = current.parentId ? NotesModule.getFolder(current.parentId) : null;
        }

        NotesModule.updateFolder(folderId, { parentId: targetFolderId });
        render();

        if (window.Toast) {
            window.Toast.success('Dossier déplacé', { duration: 2000 });
        }
    }

    // ========== ACTIONS ==========

    function selectFolder(folderId) {
        NotesModule.setCurrentFolder(folderId);

        // Auto-expand folder
        if (!expandedFolders.has(folderId)) {
            expandedFolders.add(folderId);
            saveExpandedState();
        }

        // Filter notes list by folder
        if (typeof NotesEditor !== 'undefined' && NotesEditor.filterByFolder) {
            NotesEditor.filterByFolder(folderId);
        }

        render();
    }

    function selectNote(noteId) {
        if (typeof NotesEditor !== 'undefined' && NotesEditor.selectNote) {
            NotesEditor.selectNote(noteId);
        }
        render();
    }

    async function createNewFolder(parentId = null) {
        const name = prompt('Nom du dossier:', 'Nouveau dossier');
        if (!name) return;

        const folder = NotesModule.createFolder(name, parentId);

        // Auto-expand parent
        if (parentId) {
            expandedFolders.add(parentId);
            saveExpandedState();
        }

        render();

        if (window.Toast) {
            window.Toast.success('Dossier créé', { duration: 2000 });
        }
    }

    async function createNewNote() {
        const currentFolderId = NotesModule.currentFolderId;

        if (typeof NotesEditor !== 'undefined' && NotesEditor.createNew) {
            const note = await NotesModule.createNew();
            if (note && currentFolderId) {
                await NotesModule.updateNote(note.id, { folderId: currentFolderId });
            }
            NotesEditor.render();
        }

        render();
    }

    function handleSearch(query) {
        if (typeof NotesEditor !== 'undefined' && NotesEditor.handleSearch) {
            NotesEditor.handleSearch(query);
        }
    }

    // ========== CONTEXT MENU ==========

    function showFolderMenu(folderId, event) {
        event.preventDefault();
        event.stopPropagation();

        const folder = NotesModule.getFolder(folderId);
        if (!folder) return;

        // Remove existing menu
        const existing = document.querySelector('.sidebar-context-menu');
        if (existing) existing.remove();

        // Create menu
        const menu = document.createElement('div');
        menu.className = 'sidebar-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" onclick="NotesSidebar.createNewFolder('${folderId}')">
                ${icons.plus} Nouveau sous-dossier
            </div>
            <div class="context-menu-item" onclick="NotesSidebar.renameFolder('${folderId}')">
                ✏️ Renommer
            </div>
            <div class="context-menu-item" onclick="NotesSidebar.changeFolderColor('${folderId}')">
                🎨 Couleur
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item context-menu-danger" onclick="NotesSidebar.deleteFolder('${folderId}')">
                🗑️ Supprimer
            </div>
        `;

        // Position menu
        const rect = event.target.getBoundingClientRect();
        menu.style.left = rect.left + 'px';
        menu.style.top = (rect.bottom + 4) + 'px';

        document.body.appendChild(menu);

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 0);
    }

    async function renameFolder(folderId) {
        const folder = NotesModule.getFolder(folderId);
        if (!folder) return;

        const newName = prompt('Nouveau nom:', folder.name);
        if (!newName || newName === folder.name) return;

        NotesModule.updateFolder(folderId, { name: newName });
        render();

        if (window.Toast) {
            window.Toast.success('Dossier renommé', { duration: 2000 });
        }
    }

    async function changeFolderColor(folderId) {
        const folder = NotesModule.getFolder(folderId);
        if (!folder) return;

        const colors = [
            '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b',
            '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
        ];

        const colorPicker = colors.map(c =>
            `<button onclick="NotesSidebar.setFolderColor('${folderId}', '${c}')" style="background: ${c}; width: 32px; height: 32px; border-radius: 8px; border: 2px solid ${c === folder.color ? '#fff' : 'transparent'}; cursor: pointer;"></button>`
        ).join('');

        const container = document.createElement('div');
        container.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
                <div style="background: var(--surface, #1e1e2e); padding: 24px; border-radius: 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;" onclick="event.stopPropagation()">
                    ${colorPicker}
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    function setFolderColor(folderId, color) {
        NotesModule.updateFolder(folderId, { color });
        render();
        document.querySelector('.sidebar-context-menu')?.remove();
        document.querySelectorAll('[style*="position: fixed"]').forEach(el => el.remove());
    }

    async function deleteFolder(folderId) {
        const folder = NotesModule.getFolder(folderId);
        if (!folder) return;

        const notes = NotesModule.getNotesByFolder(folderId);
        const message = notes.length > 0
            ? `Supprimer "${folder.name}" et ses ${notes.length} note(s) ?`
            : `Supprimer le dossier "${folder.name}" ?`;

        if (!confirm(message)) return;

        NotesModule.deleteFolder(folderId, true); // Delete notes too
        render();

        if (window.Toast) {
            window.Toast.success('Dossier supprimé', { duration: 2000 });
        }
    }

    // ========== INIT ==========

    function init() {
        loadExpandedState();
        render();
    }

    // ========== PUBLIC API ==========

    return {
        init,
        render,
        toggleFolder,
        selectFolder,
        selectNote,
        createNewFolder,
        createNewNote,
        handleSearch,
        showFolderMenu,
        renameFolder,
        changeFolderColor,
        setFolderColor,
        deleteFolder
    };
})();

if (typeof window !== 'undefined') {
    window.NotesSidebar = NotesSidebar;
}
