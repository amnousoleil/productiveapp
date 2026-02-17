/**
 * GIRI NOTE CREATE - Helper for creating notes with workspace check
 * ProductiveApp - World Class Notes System
 */

const GiriNoteCreate = (function() {
    'use strict';

    async function createNewNote() {
        // Check if NotesModule is available
        if (typeof NotesModule === 'undefined') {
            showError('Module Notes non disponible');
            return;
        }

        // Create note and open it in the editor
        try {
            const note = await NotesModule.createNew();
            // Open editor to show the new note
            if (typeof NotesEditor !== 'undefined' && NotesEditor.render) {
                NotesEditor.render();
            }
            // Refresh Giri Note premium sidebar
            if (typeof GiriNoteUI !== 'undefined' && GiriNoteUI.refreshSidebar) {
                GiriNoteUI.refreshSidebar();
            }
            console.log('✅ Nouvelle note créée:', note?.id);
        } catch (error) {
            console.error('Erreur création note:', error);
            showError('Impossible de créer la note: ' + error.message);
        }
    }

    function getCurrentWorkspaceId() {
        // Primary source: ApiTokens (same source as login.js)
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) {
            const id = ApiTokens.getWorkspaceId();
            if (id) return id;
        }

        // Fallback: direct localStorage key used by ApiTokens
        const directId = localStorage.getItem('workspaceId');
        if (directId) return directId;

        // Fallback: AppState
        if (typeof AppState !== 'undefined' && AppState.currentWorkspaceId) {
            return AppState.currentWorkspaceId;
        }

        // Fallback: NotesModule
        if (typeof NotesModule !== 'undefined' && NotesModule.currentWorkspaceId) {
            return NotesModule.currentWorkspaceId;
        }

        console.error('GiriNoteCreate: No workspace ID found');
        return null;
    }

    function showError(message) {
        if (typeof Toast !== 'undefined') {
            Toast.error(message);
        } else {
            alert(message);
        }
    }

    // === PUBLIC API ===

    return {
        createNewNote,
        getCurrentWorkspaceId
    };
})();

// Make globally available
if (typeof window !== 'undefined') {
    window.GiriNoteCreate = GiriNoteCreate;
}
