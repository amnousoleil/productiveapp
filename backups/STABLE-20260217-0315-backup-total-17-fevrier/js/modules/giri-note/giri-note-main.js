/**
 * GIRI NOTE - Main Orchestrator
 * ProductiveApp - World Class Notes System
 *
 * Coordinates all existing modules into a unified premium experience
 * Architecture: Reuses existing modules (notes-core, notes-graph-2d, notes-ai-cluster, etc.)
 */

const GiriNote = (function() {
    'use strict';

    let initialized = false;
    let currentView = 'editor'; // editor | graph | ai

    // === INITIALIZATION ===

    async function init() {
        if (initialized) {
            console.log('📝 Giri Note: Already initialized');
            return;
        }

        console.log('📝 Giri Note: Initializing WORLD CLASS System...');

        try {
            // 1. Check dependencies
            checkDependencies();

            // 2. Initialize core modules (if not already done)
            if (typeof NotesModule !== 'undefined' && !NotesModule.isReady()) {
                await NotesModule.init();
            }

            // 3. Load user notes
            const notes = NotesModule ? NotesModule.getNotes() : [];
            console.log(`  ✓ ${notes.length} notes loaded`);

            // 4. Initialize AI clustering (async, non-blocking)
            initAIClustering();

            initialized = true;
            console.log('✅ Giri Note: WORLD CLASS System Ready 🚀');

            // Dispatch ready event
            window.dispatchEvent(new CustomEvent('giriNoteReady', {
                detail: { notesCount: notes.length }
            }));

        } catch (error) {
            console.error('❌ Giri Note initialization failed:', error);
            throw error;
        }
    }

    function checkDependencies() {
        const required = {
            'NotesModule': typeof NotesModule !== 'undefined',
            'NotesGraph2D': typeof NotesGraph2D !== 'undefined',
            'NotesGraphView': typeof NotesGraphView !== 'undefined',
            'GiriNoteUI': typeof GiriNoteUI !== 'undefined'
        };

        const missing = Object.keys(required).filter(key => !required[key]);

        if (missing.length > 0) {
            console.warn('⚠️  Missing dependencies:', missing);
        } else {
            console.log('  ✓ All dependencies loaded');
        }
    }

    async function initAIClustering() {
        if (typeof NotesAiCluster === 'undefined') {
            console.warn('  ⚠️  AI Clustering not available');
            return;
        }

        try {
            // Load cached clusters (fast)
            NotesAiCluster.init();

            // Check if re-clustering needed (async)
            const notes = NotesModule.getNotes();
            const lastClusterTime = localStorage.getItem('giri_note_last_cluster_time');
            const now = Date.now();
            const ONE_HOUR = 3600000;

            if (!lastClusterTime || (now - parseInt(lastClusterTime)) > ONE_HOUR) {
                console.log('  🤖 Running AI clustering (background)...');

                // Non-blocking background clustering
                setTimeout(async () => {
                    try {
                        // Check if method exists
                        if (typeof NotesAiCluster.clusterAllNotes === 'function') {
                            await NotesAiCluster.clusterAllNotes();
                            localStorage.setItem('giri_note_last_cluster_time', now.toString());
                            console.log('  ✓ AI clustering complete');
                        } else {
                            console.log('  ℹ️  AI clustering method not available (will use cache)');
                        }
                    } catch (e) {
                        console.warn('  ⚠️  AI clustering failed:', e.message);
                    }
                }, 2000);
            } else {
                console.log('  ✓ Using cached AI clusters');
            }
        } catch (error) {
            console.warn('  ⚠️  AI Clustering init failed:', error);
        }
    }

    // === RENDERING ===

    function render() {
        if (!initialized) {
            init();
        }

        const container = document.getElementById('view-notes');
        if (!container) {
            console.error('Giri Note: #view-notes container not found');
            return;
        }

        // Render premium UI
        if (typeof GiriNoteUI !== 'undefined') {
            GiriNoteUI.render(container);
            console.log('🎨 Giri Note: Premium UI rendered');
        } else {
            console.error('❌ GiriNoteUI not loaded');
        }
    }

    function refresh() {
        render();
    }

    // === VIEW SWITCHING ===

    function switchView(view) {
        currentView = view;

        switch(view) {
            case 'graph':
                openGraphView();
                break;
            case 'ai':
                openAIView();
                break;
            case 'editor':
            default:
                // Already in editor view
                break;
        }
    }

    function openGraphView() {
        if (typeof NotesGraphView !== 'undefined') {
            NotesGraphView.open();
        } else {
            console.error('NotesGraphView not available');
        }
    }

    function openAIView() {
        if (typeof NotesLayoutV6 !== 'undefined') {
            NotesLayoutV6.switchSidebarTab('ai');
        } else {
            console.warn('AI View not available');
        }
    }

    // === UTILITIES ===

    function isReady() {
        return initialized;
    }

    function getCurrentView() {
        return currentView;
    }

    function getNotes() {
        return NotesModule ? NotesModule.getNotes() : [];
    }

    function createNote(title, content) {
        if (!NotesModule) return null;
        return NotesModule.createNew({ title, content });
    }

    // === PUBLIC API ===

    return {
        init,
        render,
        refresh,
        switchView,
        openGraphView,
        openAIView,
        isReady,
        getCurrentView,
        getNotes,
        createNote
    };
})();

// Make globally available
if (typeof window !== 'undefined') {
    window.GiriNote = GiriNote;
}

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', GiriNote.init);
} else {
    GiriNote.init();
}
