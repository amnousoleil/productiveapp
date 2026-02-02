/**
 * NOTES INIT - Initialize notes module
 * ProductiveApp v4.0
 */

(function() {
    'use strict';

    /**
     * Initialize notes module
     */
    NotesModule.init = function() {
        console.log('📝 Notes: Initializing...');

        // Load notes from storage
        NotesModule.loadNotes();

        // Set current note if exists
        const notes = NotesModule.getNotes();
        if (notes.length > 0 && !NotesModule.currentNoteId) {
            NotesModule.setCurrentNote(notes[0].id);
        }

        // Initialize slash commands
        NotesSlash.init();

        // Initialize toolbar shortcuts
        NotesToolbar.initShortcuts();

        // Keyboard shortcut: Ctrl+N for new note
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                NotesEditor.createNew();
                if (typeof ViewRouter !== 'undefined') {
                    ViewRouter.navigate('notes');
                }
            }
        });

        console.log('✅ Notes: Ready');
    };

    /**
     * Render (delegate to editor)
     */
    NotesModule.render = function() {
        NotesEditor.render();
    };

    /**
     * Refresh (delegate to editor)
     */
    NotesModule.refresh = function() {
        NotesEditor.refresh();
    };

})();
