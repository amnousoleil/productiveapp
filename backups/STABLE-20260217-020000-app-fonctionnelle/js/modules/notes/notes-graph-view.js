/**
 * NOTES GRAPH VIEW - Orchestrator for 2D knowledge graph (Obsidian-style)
 * ProductiveApp v6.0
 *
 * Manages:
 * - Fullscreen modal with glassmorphism
 * - Toolbar (Sync, Reset, Labels, Auto-Link, Classifier)
 * - Lightweight Canvas 2D engine (NotesGraph2D)
 * - AI clustering integration (NotesAiCluster)
 * - Click handlers for note selection
 */
const NotesGraphView = (function() {
    'use strict';

    let modalEl, containerEl, toolbarEl, loadingEl;
    let currentWorkspaceId = null;
    let isOpen = false;
    let graphData = null;

    // === INITIALIZATION ===
    function init() {
        console.log('NotesGraphView: initializing');
    }

    // === MODAL MANAGEMENT ===
    function open() {
        if (isOpen) return;

        // Get current workspace
        currentWorkspaceId = getCurrentWorkspaceId();
        if (!currentWorkspaceId) {
            if (typeof Toast !== 'undefined') {
                Toast.error('Aucun workspace actif');
            }
            return;
        }

        // Create modal if not exists
        if (!modalEl) {
            createModal();
        }

        // Show modal
        modalEl.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        isOpen = true;

        // Initialize 2D engine (lightweight Canvas)
        if (typeof NotesGraph2D !== 'undefined') {
            NotesGraph2D.init(containerEl);
        } else {
            console.error('NotesGraph2D not loaded');
        }

        // Load graph data
        loadGraphData();
    }

    function close() {
        if (!isOpen || !modalEl) return;

        modalEl.style.display = 'none';
        document.body.style.overflow = '';
        isOpen = false;
    }

    function createModal() {
        modalEl = document.createElement('div');
        modalEl.className = 'notes-graph-modal-overlay';
        modalEl.innerHTML = `
            <div class="notes-graph-modal">
                <div class="notes-graph-header">
                    <h2 class="notes-graph-title">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <circle cx="6" cy="6" r="2"/>
                            <circle cx="18" cy="6" r="2"/>
                            <circle cx="6" cy="18" r="2"/>
                            <circle cx="18" cy="18" r="2"/>
                            <line x1="12" y1="9" x2="12" y2="15"/>
                            <line x1="9" y1="12" x2="15" y2="12"/>
                            <line x1="7.5" y1="7.5" x2="10.5" y2="10.5"/>
                            <line x1="16.5" y1="7.5" x2="13.5" y2="10.5"/>
                            <line x1="7.5" y1="16.5" x2="10.5" y2="13.5"/>
                            <line x1="16.5" y1="16.5" x2="13.5" y2="13.5"/>
                        </svg>
                        Graph de connaissances
                    </h2>
                    <button class="notes-graph-close" onclick="NotesGraphView.close()">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="notes-graph-toolbar">
                    <button class="graph-btn" onclick="NotesGraphView.syncGraph()" title="Synchroniser">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"/>
                            <polyline points="1 20 1 14 7 14"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        Sync
                    </button>

                    <button class="graph-btn" onclick="NotesGraphView.autoLink()" title="Auto-Link (IA)">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        Auto-Link
                    </button>

                    <button class="graph-btn" onclick="NotesGraphView.classifyAll()" title="Classifier toutes les notes">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                        Classifier
                    </button>

                    <div class="graph-toolbar-divider"></div>

                    <button class="graph-btn" onclick="NotesGraphView.toggleLabels()" title="Labels">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            <path d="M2 12h20"/>
                        </svg>
                        Labels
                    </button>

                    <button class="graph-btn" onclick="NotesGraphView.toggleAutoRotate()" title="Auto-rotation">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Rotation
                    </button>

                    <button class="graph-btn" onclick="NotesGraphView.resetView()" title="Réinitialiser la vue">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
                            <polyline points="3 12 9 6 3 12 9 18 3 12"/>
                            <path d="M13 6h8"/>
                            <path d="M13 12h8"/>
                            <path d="M13 18h8"/>
                        </svg>
                        Reset
                    </button>
                </div>

                <div class="notes-graph-container" id="notes-graph-container">
                    <canvas id="notes-graph-canvas"></canvas>
                    <div id="graph-tooltip" class="graph-tooltip"></div>

                    <div class="graph-loading" style="display:none;">
                        <div class="graph-loading-spinner"></div>
                        <div class="graph-loading-text">Chargement du graphe...</div>
                    </div>

                    <div class="graph-stats" style="display:none;">
                        <div class="graph-stat">
                            <span class="graph-stat-label">Notes</span>
                            <span class="graph-stat-value" id="graph-stat-notes">0</span>
                        </div>
                        <div class="graph-stat">
                            <span class="graph-stat-label">Liens</span>
                            <span class="graph-stat-value" id="graph-stat-links">0</span>
                        </div>
                        <div class="graph-stat">
                            <span class="graph-stat-label">Catégories</span>
                            <span class="graph-stat-value" id="graph-stat-categories">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalEl);

        // Store references
        containerEl = modalEl.querySelector('.notes-graph-container');
        toolbarEl = modalEl.querySelector('.notes-graph-toolbar');
        loadingEl = modalEl.querySelector('.graph-loading');

        // Close on overlay click
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                close();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                close();
            }
        });
    }

    // === DATA LOADING ===
    async function loadGraphData() {
        if (!currentWorkspaceId) return;

        showLoading(true);

        try {
            if (typeof ApiNotesGraph === 'undefined') {
                throw new Error('ApiNotesGraph not loaded');
            }

            const data = await ApiNotesGraph.getGraph(currentWorkspaceId, {
                includeManual: true,
                includeAuto: true
            });

            graphData = data;

            // Update stats
            updateStats(data.stats);

            // Load into 2D engine
            if (typeof NotesGraph2D !== 'undefined') {
                NotesGraph2D.loadGraph(data);
            } else {
                console.error('NotesGraph2D not loaded');
            }

            console.log('NotesGraphView: graph loaded', data);

        } catch (error) {
            console.error('NotesGraphView: failed to load graph', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Impossible de charger le graphe');
            }
        } finally {
            showLoading(false);
        }
    }

    function showLoading(show) {
        if (!loadingEl) return;
        loadingEl.style.display = show ? 'flex' : 'none';
    }

    function updateStats(stats) {
        if (!stats) return;

        const notesEl = document.getElementById('graph-stat-notes');
        const linksEl = document.getElementById('graph-stat-links');
        const categoriesEl = document.getElementById('graph-stat-categories');

        if (notesEl) notesEl.textContent = stats.totalNotes || 0;
        if (linksEl) linksEl.textContent = stats.totalLinks || 0;
        if (categoriesEl) categoriesEl.textContent = Object.keys(stats.categories || {}).length;

        const statsContainer = document.querySelector('.graph-stats');
        if (statsContainer) {
            statsContainer.style.display = 'flex';
        }
    }

    // === TOOLBAR ACTIONS ===
    async function syncGraph() {
        if (typeof Toast !== 'undefined') {
            Toast.info('Synchronisation du graphe...');
        }
        await loadGraphData();
    }

    async function autoLink() {
        if (!currentWorkspaceId) return;

        if (typeof Toast === 'undefined') {
            alert('Auto-linking en cours (peut prendre 1-2 minutes pour 100 notes)...');
        } else {
            Toast.info('Auto-linking IA en cours...', { duration: 0 });
        }

        try {
            if (typeof ApiNotesGraph === 'undefined') {
                throw new Error('ApiNotesGraph not loaded');
            }

            const result = await ApiNotesGraph.autoLinkNotes(currentWorkspaceId, {
                strategy: 'keyword',
                minStrength: 0.3,
                maxLinksPerNote: 10
            });

            if (typeof Toast !== 'undefined') {
                Toast.success(`${result.linksCreated} liens créés en ${(result.timeMs / 1000).toFixed(1)}s`);
            }

            // Reload graph
            await loadGraphData();

        } catch (error) {
            console.error('NotesGraphView: auto-link failed', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Échec de l\'auto-linking');
            }
        }
    }

    async function classifyAll() {
        if (!currentWorkspaceId) return;

        if (typeof Toast === 'undefined') {
            alert('Classification en cours...');
        } else {
            Toast.info('Classification IA en cours...', { duration: 0 });
        }

        try {
            if (typeof ApiNotesGraph === 'undefined') {
                throw new Error('ApiNotesGraph not loaded');
            }

            const result = await ApiNotesGraph.classifyAllNotes(currentWorkspaceId, false);

            if (typeof Toast !== 'undefined') {
                Toast.success(`${result.classified} notes classifiées`);
            }

            // Reload graph
            await loadGraphData();

        } catch (error) {
            console.error('NotesGraphView: classify-all failed', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Échec de la classification');
            }
        }
    }

    function toggleLabels() {
        if (typeof NotesGraph2D !== 'undefined') {
            NotesGraph2D.toggleLabels();
        }
    }

    function toggleAutoRotate() {
        if (typeof NotesGraph2D !== 'undefined') {
            NotesGraph2D.toggleAutoRotate();
        }
    }

    function resetView() {
        if (typeof NotesGraph2D !== 'undefined') {
            NotesGraph2D.resetView();
        }
    }

    // === NOTE CLICK HANDLER ===
    function onNoteClick(noteId) {
        console.log('NotesGraphView: note clicked', noteId);

        // Close graph modal
        close();

        // Open note in editor (after brief delay for modal close animation)
        setTimeout(() => {
            if (typeof NotesModule !== 'undefined' && typeof NotesModule.openNote === 'function') {
                NotesModule.openNote(noteId);
            } else if (typeof NotesEditor !== 'undefined' && typeof NotesEditor.loadNote === 'function') {
                NotesEditor.loadNote(noteId);
            }
        }, 300);
    }

    // === UTILITIES ===
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

        // Fallback: try localStorage
        const savedWorkspace = localStorage.getItem('productiveapp_current_workspace');
        if (savedWorkspace) {
            try {
                const data = JSON.parse(savedWorkspace);
                return data.id || data;
            } catch (e) {
                return savedWorkspace;
            }
        }

        console.error('NotesGraphView: no workspace ID found');
        return null;
    }

    // === PUBLIC API ===
    return {
        init,
        open,
        close,
        syncGraph,
        autoLink,
        classifyAll,
        toggleLabels,
        toggleAutoRotate,
        resetView,
        onNoteClick
    };
})();

// Make globally available
if (typeof window !== 'undefined') {
    window.NotesGraphView = NotesGraphView;
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', NotesGraphView.init);
} else {
    NotesGraphView.init();
}
