/**
 * NOTES EDITOR - Rendering and autosave
 * ProductiveApp v4.0
 */

const NotesEditor = (function() {
    'use strict';

    const icons = {
        'file-text': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        plus: '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        trash: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
    };

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
     * Count words
     */
    function countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    /**
     * Handle autosave
     */
    function handleAutoSave() {
        const noteId = NotesModule.currentNoteId;
        if (!noteId) return;

        const titleInput = document.querySelector('.note-title-input');
        const contentInput = document.querySelector('.note-textarea');
        if (!titleInput || !contentInput) return;

        NotesModule.setSaveStatus('unsaved');
        updateSaveIndicator();

        NotesModule.clearAutosaveTimeout();

        const timeout = setTimeout(() => {
            NotesModule.setSaveStatus('saving');
            updateSaveIndicator();

            NotesModule.updateNote(noteId, {
                title: titleInput.value || 'Sans titre',
                content: contentInput.value
            });

            renderNotesList();
            updateWordCount(contentInput.value);

            setTimeout(() => {
                NotesModule.setSaveStatus('saved');
                updateSaveIndicator();
            }, 300);
        }, NotesModule.AUTOSAVE_DELAY);

        NotesModule.setAutosaveTimeout(timeout);
    }

    /**
     * Update save indicator
     */
    function updateSaveIndicator() {
        const indicator = document.querySelector('.save-indicator');
        if (!indicator) return;

        const status = NotesModule.getSaveStatus();
        indicator.className = 'save-indicator ' + status;

        const labels = {
            saving: '⏳ Sauvegarde...',
            saved: '✓ Sauvegardé',
            unsaved: '• Non sauvegardé'
        };
        indicator.innerHTML = labels[status] || '';
    }

    /**
     * Update word count
     */
    function updateWordCount(text) {
        const counter = document.querySelector('.word-count');
        if (counter) {
            const words = countWords(text);
            counter.textContent = `${words} mot${words !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Render notes list
     */
    function renderNotesList() {
        const container = document.querySelector('.notes-list');
        if (!container) return;

        const notes = NotesModule.getNotes();
        const currentId = NotesModule.currentNoteId;

        if (notes.length === 0) {
            container.innerHTML = `
                <div class="notes-empty-list">
                    Aucune note
                </div>
            `;
            return;
        }

        container.innerHTML = notes.map(note => `
            <div class="note-item ${note.id === currentId ? 'active' : ''}"
                 onclick="NotesEditor.selectNote('${note.id}')">
                <h4 class="note-item-title">${escapeHtml(note.title) || 'Sans titre'}</h4>
                <p class="note-item-preview">${escapeHtml(note.content?.substring(0, 80)) || 'Note vide...'}</p>
                <div class="note-item-meta">
                    <span>${formatDate(note.updatedAt)}</span>
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

        const note = NotesModule.getCurrentNote();

        if (!note) {
            container.innerHTML = `
                <div class="notes-empty">
                    ${icons['file-text']}
                    <h3>Aucune note sélectionnée</h3>
                    <p>Sélectionnez une note ou créez-en une nouvelle</p>
                    <button class="btn btn-primary" onclick="NotesEditor.createNew()">
                        ${icons.plus} Nouvelle note
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
                       oninput="NotesEditor.handleAutoSave()">
                <button class="btn btn-icon btn-secondary" onclick="NotesEditor.confirmDelete('${note.id}')" title="Supprimer">
                    ${icons.trash}
                </button>
            </div>
            ${NotesToolbar.getToolbarHTML()}
            <div class="notes-editor-content">
                <textarea class="note-textarea"
                          placeholder="Tapez '/' pour les commandes..."
                          oninput="NotesEditor.handleInput(this)"
                          onkeydown="NotesEditor.handleKeydown(event)">${escapeHtml(note.content)}</textarea>
            </div>
            <div class="notes-editor-footer">
                <div class="save-indicator saved">✓ Sauvegardé</div>
                <div class="word-count">${countWords(note.content)} mots</div>
            </div>
        `;
    }

    /**
     * Handle input (for slash commands)
     */
    function handleInput(textarea) {
        NotesSlash.handleInput(textarea);
        handleAutoSave();
    }

    /**
     * Handle keydown (for slash commands navigation)
     */
    function handleKeydown(e) {
        if (NotesSlash.handleKeydown(e)) {
            return;
        }
    }

    /**
     * Select note
     */
    function selectNote(id) {
        NotesModule.selectNote(id);
        renderEditor();
        renderNotesList();
    }

    /**
     * Create new note
     */
    function createNew() {
        NotesModule.createNew();
        render();

        setTimeout(() => {
            const titleInput = document.querySelector('.note-title-input');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    /**
     * Confirm delete
     */
    async function confirmDelete(id) {
        const confirmed = await ConfirmModal.confirmDelete('cette note');
        if (confirmed) {
            NotesModule.deleteNote(id);
            render();
        }
    }

    /**
     * Full render
     */
    function render() {
        const container = document.getElementById('view-notes');
        if (!container) return;

        const notes = NotesModule.getNotes();

        container.innerHTML = `
            <div class="view-header">
                <h1 class="view-title">
                    <span class="view-title-icon">${icons['file-text']}</span>
                    Notes
                </h1>
                <div class="view-actions">
                    <button class="btn btn-primary" onclick="NotesEditor.createNew()">
                        ${icons.plus} Nouvelle note
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
     * Refresh
     */
    function refresh() {
        render();
    }

    return {
        render,
        refresh,
        renderNotesList,
        renderEditor,
        handleAutoSave,
        handleInput,
        handleKeydown,
        selectNote,
        createNew,
        confirmDelete
    };
})();

if (typeof window !== 'undefined') {
    window.NotesEditor = NotesEditor;
}
