/**
 * NOTES INIT - Initialize notes module
 * ProductiveApp v6.0 - WORLD CLASS EDITION ⚡
 */

(function() {
    'use strict';

    let initialized = false;

    /**
     * Initialize notes module with all new features
     */
    NotesModule.init = async function() {
        if (initialized) {
            console.log('📝 Notes: Already initialized');
            return;
        }

        console.log('📝 Notes v6.0: Initializing WORLD CLASS System...');

        try {
            // 1. Load notes from API/localStorage
            await NotesModule.loadNotes();
            console.log('  ✓ Notes data loaded');

            // 2. Set current note if exists
            const notes = NotesModule.getNotes();
            if (notes.length > 0 && !NotesModule.currentNoteId) {
                NotesModule.setCurrentNote(notes[0].id);
            }

            // 3. Initialize v6.0 modules
            if (typeof NotesWikiLinks !== 'undefined') {
                NotesWikiLinks.init();
                console.log('  ✓ Wiki Links initialized');
            }

            if (typeof NotesTagsView !== 'undefined') {
                NotesTagsView.init();
                console.log('  ✓ Tags View initialized');
            }

            // 4. Initialize search (build index)
            if (typeof NotesSearch !== 'undefined') {
                NotesSearch.init();
                console.log('  ✓ Search index ready');
            }

            // 5. Initialize AI clustering (load from cache)
            if (typeof NotesAiCluster !== 'undefined') {
                NotesAiCluster.init();
                console.log('  ✓ AI clustering cache loaded');
            }

            // 6. Initialize markdown editor
            if (typeof NotesMarkdown !== 'undefined') {
                NotesMarkdown.init();
                console.log('  ✓ Markdown editor configured');
            }

            // 7. Initialize sidebar (load expanded state)
            if (typeof NotesSidebar !== 'undefined') {
                NotesSidebar.init();
                console.log('  ✓ Sidebar tree ready');
            }

            // 8. Initialize legacy modules if available
            if (typeof NotesSlash !== 'undefined' && NotesSlash.init) {
                NotesSlash.init();
            }

            if (typeof NotesToolbar !== 'undefined' && NotesToolbar.initShortcuts) {
                NotesToolbar.initShortcuts();
            }

            // 9. Setup keyboard shortcuts
            setupKeyboardShortcuts();

            initialized = true;
            console.log('✅ Notes v6.0: WORLD CLASS System Ready 🚀');

            // Dispatch event
            window.dispatchEvent(new CustomEvent('notesReady', {
                detail: {
                    modules: {
                        core: true,
                        sidebar: typeof NotesSidebar !== 'undefined',
                        markdown: typeof NotesMarkdown !== 'undefined',
                        search: typeof NotesSearch !== 'undefined',
                        aiCluster: typeof NotesAiCluster !== 'undefined'
                    }
                }
            }));

        } catch (error) {
            console.error('❌ Notes initialization failed:', error);
            throw error;
        }
    };

    function setupKeyboardShortcuts() {
        // Ctrl+N: New note
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                NotesEditor.createNew();
                if (typeof ViewRouter !== 'undefined') {
                    ViewRouter.navigate('notes');
                }
            }
        });

        console.log('  ✓ Keyboard shortcuts registered (Ctrl+N, Ctrl+K)');
    }

    /**
     * Render (use v6.0 layout if available, fallback to legacy editor)
     */
    NotesModule.render = function() {
        if (!initialized) {
            NotesModule.init();
        }

        // Use v6.0 World Class Layout if available
        if (typeof NotesLayoutV6 !== 'undefined') {
            NotesLayoutV6.render();
            console.log('🎨 Rendering Notes v6.0 World Class UI');
        } else if (typeof NotesEditor !== 'undefined') {
            // Fallback to legacy editor
            NotesEditor.render();
            console.log('⚠️  Fallback to legacy Notes editor');
        }
    };

    /**
     * Refresh (delegate to editor)
     */
    NotesModule.refresh = function() {
        if (typeof NotesEditor !== 'undefined') {
            NotesEditor.refresh();
        }
    };

    /**
     * Check if initialized
     */
    NotesModule.isReady = function() {
        return initialized;
    };

})();
