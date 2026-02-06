/**
 * NOTES EDITOR - Editor logic and autosave
 * ProductiveApp v4.0
 */

const NotesEditor = (function() {
    'use strict';

    let searchQuery = '';
    let projectFilter = null;

    /**
     * Handle autosave with debounce
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

        const timeout = setTimeout(async () => {
            NotesModule.setSaveStatus('saving');
            updateSaveIndicator();

            await NotesModule.updateNote(noteId, {
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

    function updateSaveIndicator() {
        const indicator = document.querySelector('.save-indicator');
        if (!indicator) return;
        const status = NotesModule.getSaveStatus();
        indicator.className = 'save-indicator ' + status;
        indicator.innerHTML = NotesRender.renderSaveIndicator(status);
    }

    function updateWordCount(text) {
        const counter = document.querySelector('.word-count');
        if (counter) {
            const words = NotesRender.countWords(text);
            counter.textContent = `${words} mot${words !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Handle search input
     */
    function handleSearch(query) {
        searchQuery = query;
        renderNotesList();
    }

    /**
     * Filter by project
     */
    function filterByProject(projectId) {
        projectFilter = projectId || null;
        renderNotesList();
    }

    /**
     * Render notes list with search + project filter
     */
    function renderNotesList() {
        const container = document.querySelector('.notes-list');
        if (!container) return;

        let filteredNotes = searchQuery
            ? NotesModule.searchNotes(searchQuery)
            : NotesModule.getSortedNotes('updatedAt');

        // Apply project filter
        if (projectFilter) {
            filteredNotes = filteredNotes.filter(n => n.projectId === projectFilter);
        }

        const currentId = NotesModule.currentNoteId;
        container.innerHTML = NotesRender.renderNotesList(filteredNotes, currentId);

        // Update count
        const countEl = document.querySelector('.notes-sidebar-header h3');
        if (countEl) {
            countEl.textContent = `Mes notes (${filteredNotes.length})`;
        }
    }

    /**
     * Render editor panel
     */
    function renderEditor() {
        const container = document.querySelector('.notes-editor');
        if (!container) return;

        const note = NotesModule.getCurrentNote();

        if (!note) {
            container.innerHTML = NotesRender.renderEmptyEditor();
            return;
        }

        const toolbarHtml = typeof NotesToolbar !== 'undefined'
            ? NotesToolbar.getToolbarHTML()
            : '';

        container.innerHTML = NotesRender.renderEditor(note, toolbarHtml);
    }

    function handleInput(textarea) {
        if (typeof NotesSlash !== 'undefined') {
            NotesSlash.handleInput(textarea);
        }
        handleAutoSave();
    }

    function handleKeydown(e) {
        if (typeof NotesSlash !== 'undefined' && NotesSlash.handleKeydown(e)) {
            return;
        }
    }

    function selectNote(id) {
        NotesModule.selectNote(id);
        renderEditor();
        renderNotesList();
    }

    async function createNew(projectId) {
        // Use current project filter if no explicit projectId
        const pid = projectId || projectFilter || null;
        await NotesModule.createNew(pid);
        render();

        setTimeout(() => {
            const titleInput = document.querySelector('.note-title-input');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    async function confirmDelete(id) {
        if (typeof ConfirmModal !== 'undefined') {
            const confirmed = await ConfirmModal.confirmDelete('cette note');
            if (!confirmed) return;
        }
        await NotesModule.deleteNote(id);
        render();
    }

    /**
     * Toggle note public/private visibility
     */
    async function toggleVisibility(noteId) {
        const note = NotesModule.getNote(noteId);
        if (!note) return;

        await NotesModule.updateNote(noteId, {
            isPublic: !note.isPublic
        });
        renderEditor();
        renderNotesList();
    }

    /**
     * Full render
     */
    function render() {
        const container = document.getElementById('view-notes');
        if (!container) return;

        const notes = NotesModule.getNotes();
        container.innerHTML = NotesRender.renderLayout(notes.length);

        renderNotesList();
        renderEditor();
    }

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
        handleSearch,
        selectNote,
        createNew,
        confirmDelete,
        toggleVisibility,
        filterByProject
    };
})();

if (typeof window !== 'undefined') {
    window.NotesEditor = NotesEditor;
}
