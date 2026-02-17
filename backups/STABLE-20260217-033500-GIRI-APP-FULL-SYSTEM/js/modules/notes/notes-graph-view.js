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
            let data = null;

            // Try API first
            if (typeof ApiNotesGraph !== 'undefined') {
                data = await ApiNotesGraph.getGraph(currentWorkspaceId, {
                    includeManual: true,
                    includeAuto: true
                });
            } else {
                // Fallback: build graph from local notes + wiki links
                console.log('NotesGraphView: building graph from local notes (ApiNotesGraph not available)');
                const notes = typeof NotesModule !== 'undefined' ? NotesModule.getNotes() : [];
                // Build connections using getForwardLinks per note
                const connections = [];
                if (typeof NotesWikiLinks !== 'undefined' && NotesWikiLinks.getForwardLinks) {
                    notes.forEach(note => {
                        const linked = NotesWikiLinks.getForwardLinks(note.id) || [];
                        linked.forEach(linkedNote => {
                            if (linkedNote && linkedNote.id) {
                                connections.push({ fromNoteId: note.id, toNoteId: linkedNote.id, strength: 1 });
                            }
                        });
                    });
                }
                data = {
                    nodes: notes,
                    connections,
                    stats: {
                        totalNotes: notes.length,
                        totalLinks: connections.length,
                        categories: 0
                    }
                };
            }

            graphData = data;

            // Update stats
            updateStats(data.stats);

            // Load into 2D engine
            if (typeof NotesGraph2D !== 'undefined') {
                NotesGraph2D.loadGraph(data);
            } else {
                console.error('NotesGraph2D not loaded');
            }

            console.log('NotesGraphView: graph loaded', data.nodes?.length, 'nodes');

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

        if (typeof Toast !== 'undefined') {
            Toast.info('Analyse des connexions entre notes...', { duration: 0 });
        }

        try {
            // Use ApiNotesGraph if available
            if (typeof ApiNotesGraph !== 'undefined') {
                const result = await ApiNotesGraph.autoLinkNotes(currentWorkspaceId, {
                    strategy: 'keyword',
                    minStrength: 0.3,
                    maxLinksPerNote: 10
                });
                if (typeof Toast !== 'undefined') {
                    Toast.success(`${result.linksCreated} liens créés en ${(result.timeMs / 1000).toFixed(1)}s`);
                }
                await loadGraphData();
                return;
            }

            // === LOCAL KEYWORD MATCHING FALLBACK ===
            const startTime = Date.now();
            const notes = typeof NotesModule !== 'undefined' ? NotesModule.getNotes() : [];
            if (notes.length < 2) {
                if (typeof Toast !== 'undefined') Toast.warning('Pas assez de notes pour créer des liens');
                return;
            }

            // Extract keywords for each note (title + content words, min 4 chars)
            const stopWords = new Set(['pour','dans','avec','mais','plus','tout','être','cette','sont','bien','nous','vous','ils','elle','les','des','une','qui','que','par','sur','pas','lui','peut','comme','aussi','très','même','donc','fait','quand','votre','notre','leur','leurs','dont','vers','lors','ainsi','sans','entre','avant','après','sous','selon','encore','depuis','reste','doit','faut','each','that','with','this','from','have','been','were','they','what','when','will','some','only','more','into','then','than','your','also']);

            function extractKeywords(note) {
                const text = ((note.title || '') + ' ' + (note.content || '')).toLowerCase();
                const words = text.match(/[a-záàâãéèêëíìîïóòôõúùûüçñ]{4,}/g) || [];
                return new Set(words.filter(w => !stopWords.has(w)));
            }

            // Build keyword sets for all notes
            const keywordsMap = new Map();
            notes.forEach(note => keywordsMap.set(note.id, extractKeywords(note)));

            // Compute pairwise similarity and collect new connections
            const existing = new Set();
            (graphData?.connections || []).forEach(c => existing.add(`${c.fromNoteId}-${c.toNoteId}`));

            const newConnections = [];
            for (let i = 0; i < notes.length; i++) {
                let linksForNote = 0;
                const kwA = keywordsMap.get(notes[i].id);
                if (!kwA.size) continue;

                // Sort by similarity, take best matches
                const scored = [];
                for (let j = 0; j < notes.length; j++) {
                    if (i === j) continue;
                    const kwB = keywordsMap.get(notes[j].id);
                    if (!kwB.size) continue;
                    // Jaccard similarity
                    let intersection = 0;
                    kwA.forEach(w => { if (kwB.has(w)) intersection++; });
                    const union = kwA.size + kwB.size - intersection;
                    const similarity = intersection / union;
                    if (similarity >= 0.08) scored.push({ note: notes[j], sim: similarity });
                }
                scored.sort((a, b) => b.sim - a.sim);

                for (const { note: noteB, sim } of scored.slice(0, 5)) {
                    const key = `${notes[i].id}-${noteB.id}`;
                    const keyRev = `${noteB.id}-${notes[i].id}`;
                    if (!existing.has(key) && !existing.has(keyRev)) {
                        existing.add(key);
                        newConnections.push({ fromNoteId: notes[i].id, toNoteId: noteB.id, strength: sim });
                        linksForNote++;
                    }
                    if (linksForNote >= 3) break;
                }
            }

            if (newConnections.length === 0) {
                if (typeof Toast !== 'undefined') Toast.info('Aucun nouveau lien trouvé (notes trop différentes)');
                return;
            }

            // Merge into graphData and reload
            if (graphData) {
                graphData.connections = [...(graphData.connections || []), ...newConnections];
                graphData.stats = {
                    ...graphData.stats,
                    totalLinks: graphData.connections.length
                };
                if (typeof NotesGraph2D !== 'undefined') {
                    NotesGraph2D.loadGraph(graphData);
                }
                updateStats(graphData.stats);
            }

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            if (typeof Toast !== 'undefined') {
                Toast.success(`✦ ${newConnections.length} connexions découvertes en ${elapsed}s`);
            }
            console.log(`NotesGraphView: auto-link local created ${newConnections.length} connections`);

        } catch (error) {
            console.error('NotesGraphView: auto-link failed', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Échec de l\'analyse de connexions');
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
            // Use GiriNoteUI if available (preferred)
            if (typeof GiriNoteUI !== 'undefined' && GiriNoteUI.openNote) {
                GiriNoteUI.openNote(noteId);
                return;
            }
            // Fallback: select note + render editor
            if (typeof NotesModule !== 'undefined') {
                NotesModule.selectNote(noteId);
            }
            if (typeof NotesEditor !== 'undefined' && NotesEditor.render) {
                NotesEditor.render();
            }
        }, 300);
    }

    // === UTILITIES ===
    function getCurrentWorkspaceId() {
        // Primary source: ApiTokens (stores workspaceId in localStorage under 'workspaceId' key)
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) {
            const id = ApiTokens.getWorkspaceId();
            if (id) return id;
        }

        // Fallback: direct key used by ApiTokens
        const directId = localStorage.getItem('workspaceId');
        if (directId) return directId;

        // Fallback: AppState
        if (typeof AppState !== 'undefined' && AppState.currentWorkspaceId) {
            return AppState.currentWorkspaceId;
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
