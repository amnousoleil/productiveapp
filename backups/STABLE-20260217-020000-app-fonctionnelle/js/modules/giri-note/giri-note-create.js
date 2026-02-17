/**
 * GIRI NOTE CREATE - Helper for creating notes with workspace check
 * ProductiveApp - World Class Notes System
 */

const GiriNoteCreate = (function() {
    'use strict';

    function createNewNote() {
        // Check if NotesModule is available
        if (typeof NotesModule === 'undefined') {
            showError('Module Notes non disponible');
            return;
        }

        // Check workspace
        const workspaceId = getCurrentWorkspaceId();
        if (!workspaceId) {
            showError('Aucun workspace actif. Veuillez vous reconnecter.');
            return;
        }

        // Create note
        try {
            NotesModule.createNew();
            console.log('✅ Nouvelle note créée');
        } catch (error) {
            console.error('Erreur création note:', error);
            showError('Impossible de créer la note: ' + error.message);
        }
    }

    function getCurrentWorkspaceId() {
        // Try multiple sources
        if (typeof AppState !== 'undefined' && AppState.currentWorkspaceId) {
            return AppState.currentWorkspaceId;
        }
        if (typeof NotesModule !== 'undefined' && NotesModule.currentWorkspaceId) {
            return NotesModule.currentWorkspaceId;
        }
        if (typeof AppConfig !== 'undefined' && AppConfig.DEFAULT_WORKSPACE_ID) {
            return AppConfig.DEFAULT_WORKSPACE_ID;
        }

        // Try localStorage
        const savedWorkspace = localStorage.getItem('productiveapp_current_workspace');
        if (savedWorkspace) {
            try {
                const data = JSON.parse(savedWorkspace);
                return data.id || data;
            } catch (e) {
                return savedWorkspace;
            }
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
