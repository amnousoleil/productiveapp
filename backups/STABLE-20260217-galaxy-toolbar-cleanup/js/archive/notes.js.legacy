/**
 * ================================================
 * NOTES MODULE - ProductiveApp v3.2
 * Éditeur de notes avec auto-save
 * ================================================
 */

const NotesModule = (function() {
    'use strict';

    const STORAGE_KEY = 'productiveapp_notes';
    const AUTOSAVE_DELAY = 1000; // 1 second

    let notes = [];
    let currentNoteId = null;
    let autosaveTimeout = null;
    let saveStatus = 'saved'; // 'saved', 'saving', 'unsaved'

    // Icons for notes
    const icons = {
        'file-text': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
        'plus': '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        'trash': '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        'bold': '<svg viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
        'italic': '<svg viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
        'list': '<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
        'link': '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
        'code': '<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
    };

    /**
     * Generate unique ID
     */
    function generateId() {
        return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Load notes from localStorage
     */
    function loadNotes() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                notes = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Notes: Could not load notes', e);
            notes = [];
        }
    }

    /**
     * Save notes to localStorage
     */
    function saveNotes() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch (e) {
            console.warn('Notes: Could not save notes', e);
        }
    }

    /**
     * Get all notes
     */
    function getNotes() {
        return notes;
    }

    /**
     * Get notes by project
     */
    function getNotesByProject(projectId) {
        if (!projectId || projectId === 'all') return notes;
        return notes.filter(n => n.projectId === projectId);
    }

    /**
     * Get note by ID
     */
    function getNote(id) {
        return notes.find(n => n.id === id);
    }

    /**
     * Create new note
     */
    function createNew(projectId = null) {
        const note = {
            id: generateId(),
            title: '',
            content: '',
            projectId: projectId,
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        notes.unshift(note);
        saveNotes();

        currentNoteId = note.id;
        render();

        // Focus title input
        setTimeout(() => {
            const titleInput = document.querySelector('.note-title-input');
            if (titleInput) titleInput.focus();
        }, 100);

        return note;
    }

    /**
     * Update note
     */
    function updateNote(id, updates) {
        const index = notes.findIndex(n => n.id === id);
        if (index === -1) return null;

        notes[index] = {
            ...notes[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        saveNotes();
        return notes[index];
    }

    /**
     * Delete note
     */
    function deleteNote(id) {
        const index = notes.findIndex(n => n.id === id);
        if (index === -1) return false;

        notes.splice(index, 1);
        saveNotes();

        if (currentNoteId === id) {
            currentNoteId = notes.length > 0 ? notes[0].id : null;
        }

        render();
        return true;
    }

    /**
     * Select note
     */
    function selectNote(id) {
        currentNoteId = id;
        renderEditor();
        renderNotesList();
    }

    /**
     * Auto-save handler
     */
    function handleAutoSave() {
        if (!currentNoteId) return;

        const titleInput = document.querySelector('.note-title-input');
        const contentInput = document.querySelector('.note-textarea');

        if (!titleInput || !contentInput) return;

        // Update save status
        saveStatus = 'unsaved';
        updateSaveIndicator();

        // Clear existing timeout
        if (autosaveTimeout) {
            clearTimeout(autosaveTimeout);
        }

        // Set new timeout
        autosaveTimeout = setTimeout(() => {
            saveStatus = 'saving';
            updateSaveIndicator();

            updateNote(currentNoteId, {
                title: titleInput.value || 'Sans titre',
                content: contentInput.value
            });

            // Update list without re-rendering editor
            renderNotesList();

            setTimeout(() => {
                saveStatus = 'saved';
                updateSaveIndicator();
            }, 300);
        }, AUTOSAVE_DELAY);
    }

    /**
     * Update save indicator
     */
    function updateSaveIndicator() {
        const indicator = document.querySelector('.save-indicator');
        if (!indicator) return;

        indicator.className = 'save-indicator ' + saveStatus;

        switch (saveStatus) {
            case 'saving':
                indicator.innerHTML = '⏳ Sauvegarde...';
                break;
            case 'saved':
                indicator.innerHTML = '✓ Sauvegardé';
                break;
            case 'unsaved':
                indicator.innerHTML = '• Non sauvegardé';
                break;
        }
    }

    /**
     * Render notes list
     */
    function renderNotesList() {
        const container = document.querySelector('.notes-list');
        if (!container) return;

        if (notes.length === 0) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: rgba(255,255,255,0.4); font-size: 13px;">
                    Aucune note
                </div>
            `;
            return;
        }

        container.innerHTML = notes.map(note => `
            <div class="note-item ${note.id === currentNoteId ? 'active' : ''}"
                 onclick="NotesModule.selectNote('${note.id}')">
                <h4 class="note-item-title">${escapeHtml(note.title) || 'Sans titre'}</h4>
                <p class="note-item-preview">${escapeHtml(note.content?.substring(0, 80)) || 'Note vide...'}</p>
                <div class="note-item-meta">
                    <span>${formatDate(note.updatedAt)}</span>
                    ${note.tags.length > 0 ? note.tags.slice(0, 2).map(t => `<span class="note-tag">${t}</span>`).join('') : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * Render editor
     */
    function renderEditor() {
        const container = document.querySelector('.notes-editor');
        if (!container) return;

        const note = currentNoteId ? getNote(currentNoteId) : null;

        if (!note) {
            container.innerHTML = `
                <div class="notes-empty">
                    ${icons['file-text']}
                    <h3>Aucune note sélectionnée</h3>
                    <p>Sélectionnez une note ou créez-en une nouvelle</p>
                    <button class="btn btn-primary" onclick="NotesModule.createNew()">
                        ${icons['plus']} Nouvelle note
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="notes-editor-header">
                <input type="text"
                       class="note-title-input"
                       placeholder="Titre de la note..."
                       value="${escapeHtml(note.title)}"
                       oninput="NotesModule.handleAutoSave()">
                <button class="btn btn-icon btn-secondary" onclick="NotesModule.confirmDelete('${note.id}')" title="Supprimer">
                    ${icons['trash']}
                </button>
            </div>
            <div class="notes-editor-toolbar">
                <button class="toolbar-btn" onclick="NotesModule.insertMarkdown('**', '**')" title="Gras">
                    ${icons['bold']}
                </button>
                <button class="toolbar-btn" onclick="NotesModule.insertMarkdown('*', '*')" title="Italique">
                    ${icons['italic']}
                </button>
                <span class="toolbar-divider"></span>
                <button class="toolbar-btn" onclick="NotesModule.insertMarkdown('- ', '')" title="Liste">
                    ${icons['list']}
                </button>
                <button class="toolbar-btn" onclick="NotesModule.insertMarkdown('[', '](url)')" title="Lien">
                    ${icons['link']}
                </button>
                <button class="toolbar-btn" onclick="NotesModule.insertMarkdown('\`', '\`')" title="Code">
                    ${icons['code']}
                </button>
            </div>
            <div class="notes-editor-content">
                <textarea class="note-textarea"
                          placeholder="Commencez à écrire..."
                          oninput="NotesModule.handleAutoSave()">${escapeHtml(note.content)}</textarea>
            </div>
            <div class="notes-editor-footer">
                <div class="save-indicator saved">✓ Sauvegardé</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.4);">
                    Modifié ${formatDate(note.updatedAt)}
                </div>
            </div>
        `;
    }

    /**
     * Insert markdown formatting
     */
    function insertMarkdown(before, after) {
        const textarea = document.querySelector('.note-textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        textarea.value = text.substring(0, start) + before + selectedText + after + text.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);

        handleAutoSave();
    }

    /**
     * Confirm delete
     */
    function confirmDelete(id) {
        if (confirm('Supprimer cette note ?')) {
            deleteNote(id);
        }
    }

    /**
     * Format date
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'À l\'instant';
        if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;

        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
     * Render full view
     */
    function render() {
        const container = document.getElementById('view-notes');
        if (!container) return;

        container.innerHTML = `
            <div class="view-header">
                <h1 class="view-title">
                    <span class="view-title-icon">${icons['file-text']}</span>
                    Notes
                </h1>
                <div class="view-actions">
                    <button class="btn btn-primary" onclick="NotesModule.createNew()">
                        ${icons['plus']} Nouvelle note
                    </button>
                </div>
            </div>

            <div class="notes-layout">
                <div class="notes-sidebar">
                    <div class="notes-sidebar-header">
                        <h3>Mes notes (${notes.length})</h3>
                    </div>
                    <div class="notes-list"></div>
                </div>
                <div class="notes-editor"></div>
            </div>
        `;

        renderNotesList();
        renderEditor();
    }

    /**
     * Refresh view
     */
    function refresh() {
        render();
    }

    /**
     * Initialize
     */
    function init() {
        console.log('📝 Notes: Initializing...');
        loadNotes();

        // Set current note if exists
        if (notes.length > 0 && !currentNoteId) {
            currentNoteId = notes[0].id;
        }

        // Keyboard shortcut: Ctrl+N
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                createNew();
                ViewRouter.navigate('notes');
            }
        });

        console.log('✅ Notes: Ready');
    }

    return {
        init,
        render,
        refresh,
        getNotes,
        getNotesByProject,
        getNote,
        createNew,
        updateNote,
        deleteNote,
        selectNote,
        handleAutoSave,
        insertMarkdown,
        confirmDelete
    };
})();

if (typeof window !== 'undefined') {
    window.NotesModule = NotesModule;
}
