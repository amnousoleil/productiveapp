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

            // === AUTO-TRIGGER AI CLUSTERING if no cached data ===
            if (typeof NotesAiCluster !== 'undefined') {
                NotesAiCluster.init();
                if (!NotesAiCluster.isCacheValid() && (data.nodes || []).length >= 3) {
                    console.log('NotesGraphView: no AI clusters yet — triggering auto-clustering...');
                    NotesAiCluster.analyzeAndCluster(true /* silent */).then(() => {
                        // Reload graph with fresh AI clusters + connections
                        if (typeof NotesGraph2D !== 'undefined' && graphData) {
                            NotesGraph2D.loadGraph(graphData);
                            // Update stats with AI connection count
                            const aiConns = NotesAiCluster.getConnections().length;
                            const aiClusters = NotesAiCluster.getClusters().length;
                            updateStats({
                                totalNotes: (graphData.nodes || []).length,
                                totalLinks: aiConns,
                                categories: aiClusters
                            });
                        }
                    }).catch(err => console.warn('Auto-clustering failed:', err));
                } else if (NotesAiCluster.isCacheValid()) {
                    // Cache exists — reload immediately with clusters applied
                    if (typeof NotesGraph2D !== 'undefined') {
                        NotesGraph2D.loadGraph(data);
                        updateStats({
                            totalNotes: (data.nodes || []).length,
                            totalLinks: NotesAiCluster.getConnections().length,
                            categories: NotesAiCluster.getClusters().length
                        });
                    }
                }
            }

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

        // === AI CLUSTERING VIA NotesAiCluster (primary path) ===
        if (typeof NotesAiCluster !== 'undefined') {
            try {
                // Force fresh analysis (clear old cache)
                NotesAiCluster.clearCache();

                // analyzeAndCluster() handles its own toasts (loading + success/error)
                const result = await NotesAiCluster.analyzeAndCluster();

                if (result && result.clusters && result.clusters.length > 0) {
                    // Reload graph — loadGraph() will pick up new clusters + connections
                    if (typeof NotesGraph2D !== 'undefined' && graphData) {
                        NotesGraph2D.loadGraph(graphData);
                        updateStats({
                            totalNotes: (graphData.nodes || []).length,
                            totalLinks: (result.connections || []).length,
                            categories: result.clusters.length
                        });
                    }
                }
            } catch (error) {
                console.error('NotesGraphView: AI auto-link failed', error);
                if (typeof Toast !== 'undefined') {
                    Toast.error('Analyse IA échouée — vérifiez la connexion');
                }
            }
            return;
        }

        // === FALLBACK: ApiNotesGraph if available ===
        if (typeof ApiNotesGraph !== 'undefined') {
            try {
                if (typeof Toast !== 'undefined') {
                    Toast.info('Auto-linking via API...', { duration: 0 });
                }
                const result = await ApiNotesGraph.autoLinkNotes(currentWorkspaceId, {
                    strategy: 'keyword',
                    minStrength: 0.3,
                    maxLinksPerNote: 10
                });
                if (typeof Toast !== 'undefined') {
                    Toast.success(`${result.linksCreated} liens créés`);
                }
                await loadGraphData();
            } catch (error) {
                console.error('NotesGraphView: auto-link API failed', error);
                if (typeof Toast !== 'undefined') {
                    Toast.error('Échec auto-link');
                }
            }
            return;
        }

        // No AI or API available
        if (typeof Toast !== 'undefined') {
            Toast.warning('Module IA non disponible pour l\'auto-linking');
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

    // === NOTE PREVIEW PANEL (single click — stays in graph) ===
    function showNotePreview(noteId, noteData, cluster) {
        if (!modalEl) return;

        // Remove existing panel
        const existing = document.getElementById('graph-note-preview');
        if (existing) existing.remove();

        const note = noteData || {};
        const title = note.title || 'Sans titre';
        const rawContent = (note.content || '')
            .replace(/#{1,6}\s[^\n]*/g, '')
            .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
            .replace(/\[\[([^\]]+)\]\]/g, '$1')
            .replace(/\n+/g, ' ')
            .trim()
            .slice(0, 280);
        const tags = note.tags || [];
        const clusterTheme = cluster ? cluster.theme : null;
        const clusterColor = cluster ? cluster.color : '#a371f7';

        // Get AI connections for this note
        const aiConns = typeof NotesAiCluster !== 'undefined'
            ? NotesAiCluster.getConnectionsForNote(noteId) : [];

        const safeId = String(noteId).replace(/'/g, '');

        // Restore saved font size preference
        const savedFontSize = parseInt(localStorage.getItem('gnp_font_size') || '15');

        const panel = document.createElement('div');
        panel.id = 'graph-note-preview';
        panel.innerHTML = `
            <style>
                #graph-note-preview {
                    position: absolute; top: 0; right: 0; bottom: 0;
                    width: 340px;
                    background: linear-gradient(160deg, rgba(10,14,26,0.97) 0%, rgba(15,20,40,0.97) 100%);
                    backdrop-filter: blur(20px);
                    border-left: 1px solid rgba(163,113,247,0.2);
                    display: flex; flex-direction: column;
                    z-index: 100;
                    transform: translateX(100%);
                    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
                    overflow: hidden;
                }
                #graph-note-preview.visible { transform: translateX(0); }
                .gnp-header {
                    padding: 16px 14px 12px;
                    border-bottom: 1px solid rgba(163,113,247,0.12);
                    background: linear-gradient(180deg, rgba(163,113,247,0.06) 0%, transparent 100%);
                }
                .gnp-header-top {
                    display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;
                }
                .gnp-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
                .gnp-title {
                    flex: 1; font-size: 16px; font-weight: 700; color: #e6edf3;
                    line-height: 1.4; word-break: break-word;
                }
                .gnp-close {
                    background: none; border: none; color: #6b7280;
                    cursor: pointer; font-size: 18px; padding: 0; line-height: 1;
                    flex-shrink: 0; transition: color 0.15s;
                }
                .gnp-close:hover { color: #e6edf3; }

                /* Font size controls */
                .gnp-font-controls {
                    display: flex; align-items: center; gap: 6px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 8px; padding: 4px 8px;
                }
                .gnp-font-label {
                    font-size: 10px; color: #6b7280; letter-spacing: 0.08em;
                    text-transform: uppercase; flex: 1;
                }
                .gnp-font-size-display {
                    font-size: 11px; color: #a371f7; font-weight: 700; min-width: 28px; text-align: center;
                }
                .gnp-font-btn {
                    background: rgba(163,113,247,0.15); border: 1px solid rgba(163,113,247,0.25);
                    border-radius: 5px; color: #c4b5fd;
                    cursor: pointer; font-size: 14px; line-height: 1;
                    padding: 2px 7px; transition: all 0.15s; font-weight: 700;
                }
                .gnp-font-btn:hover { background: rgba(163,113,247,0.3); color: white; }
                .gnp-font-btn-reset {
                    font-size: 10px; padding: 2px 6px; color: #6b7280;
                    background: transparent; border-color: rgba(255,255,255,0.1);
                }

                .gnp-body { flex: 1; overflow-y: auto; padding: 14px 16px; }
                .gnp-cluster {
                    display: inline-flex; align-items: center; gap: 6px;
                    font-size: 12px; font-weight: 700; padding: 4px 12px;
                    border-radius: 20px; margin-bottom: 14px;
                    text-transform: uppercase; letter-spacing: 0.06em;
                }
                .gnp-preview {
                    color: #b0b8c8; line-height: 1.7;
                    margin-bottom: 14px;
                    border-left: 2px solid rgba(163,113,247,0.35);
                    padding-left: 14px;
                }
                .gnp-tags {
                    display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px;
                }
                .gnp-tag {
                    padding: 3px 10px; border-radius: 5px;
                    background: rgba(163,113,247,0.1); color: #a371f7;
                    border: 1px solid rgba(163,113,247,0.2);
                }
                .gnp-connections-section { margin-bottom: 14px; }
                .gnp-section-title {
                    font-size: 10px; font-weight: 700; color: #4b5563;
                    text-transform: uppercase; letter-spacing: 0.1em;
                    margin-bottom: 8px;
                }
                .gnp-conn-item {
                    color: #9ca3af; padding: 6px 10px;
                    border-radius: 6px; margin-bottom: 3px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    display: flex; align-items: center; gap: 6px;
                    cursor: pointer; transition: all 0.15s;
                }
                .gnp-conn-item:hover {
                    background: rgba(163,113,247,0.08);
                    border-color: rgba(163,113,247,0.2);
                    color: #c4b5fd;
                }
                .gnp-footer {
                    padding: 12px 16px;
                    border-top: 1px solid rgba(163,113,247,0.1);
                }
                .gnp-open-btn {
                    width: 100%; padding: 12px 16px;
                    background: linear-gradient(135deg, #a371f7, #58a6ff);
                    border: none; border-radius: 10px; color: white;
                    font-weight: 700; font-size: 14px; cursor: pointer;
                    letter-spacing: 0.01em; transition: all 0.2s;
                    box-shadow: 0 4px 14px rgba(163,113,247,0.35);
                }
                .gnp-open-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(163,113,247,0.5);
                }
                .gnp-hint {
                    font-size: 11px; color: #374151; text-align: center; margin-top: 8px;
                }
            </style>

            <div class="gnp-header">
                <div class="gnp-header-top">
                    <span class="gnp-icon">📝</span>
                    <span class="gnp-title">${escHtml(title)}</span>
                    <button class="gnp-close" onclick="document.getElementById('graph-note-preview').remove()">✕</button>
                </div>
                <!-- Font size controls -->
                <div class="gnp-font-controls">
                    <span class="gnp-font-label">Texte</span>
                    <button class="gnp-font-btn" onclick="NotesGraphView.gnpChangeFontSize(-2)">A-</button>
                    <span class="gnp-font-size-display" id="gnp-font-size-val">${savedFontSize}px</span>
                    <button class="gnp-font-btn" onclick="NotesGraphView.gnpChangeFontSize(+2)">A+</button>
                    <button class="gnp-font-btn gnp-font-btn-reset" onclick="NotesGraphView.gnpChangeFontSize(0)">↺</button>
                </div>
            </div>

            <div class="gnp-body">
                ${clusterTheme ? `
                    <div class="gnp-cluster" style="background:${clusterColor}20;color:${clusterColor};border:1px solid ${clusterColor}40;">
                        ● ${escHtml(clusterTheme)}
                    </div>` : ''}

                ${rawContent ? `<div class="gnp-preview">${escHtml(rawContent)}${rawContent.length >= 280 ? '...' : ''}</div>` : '<p style="color:#4b5563;font-size:13px;font-style:italic">Note vide</p>'}

                ${tags.length > 0 ? `
                    <div class="gnp-tags">
                        ${tags.slice(0, 5).map(t => `<span class="gnp-tag">${escHtml(t)}</span>`).join('')}
                    </div>` : ''}

                ${aiConns.length > 0 ? `
                    <div class="gnp-connections-section">
                        <div class="gnp-section-title">Connexions (${aiConns.length})</div>
                        ${aiConns.slice(0, 5).map(conn => {
                            const otherId = conn.fromNoteId === noteId ? conn.toNoteId : conn.fromNoteId;
                            const otherNote = (typeof NotesModule !== 'undefined' ? NotesModule.getNotes() : []).find(n => n.id === otherId);
                            const otherTitle = otherNote ? (otherNote.title || 'Sans titre') : otherId.slice(0, 12) + '...';
                            const strength = Math.round((conn.strength || 0.5) * 100);
                            return `<div class="gnp-conn-item" onclick="NotesGraphView.showNotePreview('${otherId}',null,null)">
                                <span style="color:${clusterColor};font-size:9px">●</span>
                                ${escHtml(otherTitle.slice(0, 28))}
                                <span style="margin-left:auto;font-size:10px;color:#4b5563">${strength}%</span>
                            </div>`;
                        }).join('')}
                    </div>` : ''}
            </div>

            <div class="gnp-footer">
                <button class="gnp-open-btn" onclick="NotesGraphView.onNoteClick('${safeId}')">
                    ✦ Ouvrir dans l'éditeur
                </button>
                <div class="gnp-hint">Double-clic sur le nœud pour ouvrir directement</div>
            </div>
        `;

        // Find the graph container to append into
        const graphModal = modalEl.querySelector('.notes-graph-modal');
        if (graphModal) {
            graphModal.style.position = 'relative';
            graphModal.appendChild(panel);
            // Apply saved font size to body
            const body = panel.querySelector('.gnp-body');
            if (body) body.style.fontSize = savedFontSize + 'px';
            // Trigger slide-in animation
            requestAnimationFrame(() => panel.classList.add('visible'));
        }
    }

    // Font size control (called from panel buttons)
    function gnpChangeFontSize(delta) {
        const panel = document.getElementById('graph-note-preview');
        if (!panel) return;
        const body = panel.querySelector('.gnp-body');
        const display = panel.querySelector('#gnp-font-size-val');
        if (!body || !display) return;

        let current = parseInt(body.style.fontSize || '15');
        if (delta === 0) {
            current = 15; // Reset to default
        } else {
            current = Math.max(12, Math.min(24, current + delta));
        }

        body.style.fontSize = current + 'px';
        display.textContent = current + 'px';
        localStorage.setItem('gnp_font_size', current);
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // === NOTE CLICK HANDLER (double-click or "Open" button) ===
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
        onNoteClick,
        showNotePreview,
        gnpChangeFontSize
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
