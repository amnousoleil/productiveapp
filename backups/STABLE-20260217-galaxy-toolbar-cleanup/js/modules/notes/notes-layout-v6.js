/**
 * NOTES LAYOUT v6.0 - Multi-panes resizable layout
 * ProductiveApp - World Class Edition
 *
 * Features:
 * - 3-column layout (sidebar | editor | backlinks panel)
 * - Resizable dividers with drag
 * - Multiple tabs support
 * - Split view (vertical/horizontal)
 * - Fullscreen mode
 * - Responsive collapse
 */

const NotesLayoutV6 = (function() {
    'use strict';

    // Layout state
    let state = {
        sidebarWidth: 280,
        backlinksWidth: 320,
        sidebarCollapsed: false,
        backlinksCollapsed: false,
        splitMode: null, // null | 'vertical' | 'horizontal'
        openTabs: [],
        activeTabId: null,
        fullscreen: false
    };

    const MIN_WIDTH = 200;
    const MAX_SIDEBAR_WIDTH = 400;
    const MAX_BACKLINKS_WIDTH = 500;

    // ========== INITIALIZATION ==========

    function init() {
        console.log('📐 NotesLayoutV6: Initializing world-class layout');
        loadState();
        render();
        attachEventListeners();
        attachResizeHandlers();
    }

    function loadState() {
        try {
            const saved = localStorage.getItem('productiveapp_notes_layout_v6');
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
            }
        } catch (e) {
            console.warn('Failed to load layout state', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem('productiveapp_notes_layout_v6', JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save layout state', e);
        }
    }

    // ========== RENDER ==========

    function render() {
        const container = document.getElementById('view-notes');
        if (!container) {
            console.warn('NotesLayoutV6: #view-notes container not found');
            return;
        }

        const sidebarStyle = state.sidebarCollapsed
            ? 'width: 0; min-width: 0;'
            : `width: ${state.sidebarWidth}px;`;

        const backlinksStyle = state.backlinksCollapsed
            ? 'width: 0; min-width: 0;'
            : `width: ${state.backlinksWidth}px;`;

        container.innerHTML = `
            <div class="notes-v6-layout ${state.fullscreen ? 'fullscreen' : ''}" data-split="${state.splitMode || 'none'}">

                <!-- Left Sidebar -->
                <div class="notes-v6-sidebar" style="${sidebarStyle}">
                    <div class="notes-v6-sidebar-header">
                        <div class="notes-v6-logo">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            <span class="notes-v6-title">Notes</span>
                        </div>
                        <div class="notes-v6-header-actions">
                            <button class="notes-v6-btn-icon" onclick="NotesLayoutV6.toggleFullscreen()" title="Plein écran (F11)">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Sidebar Tabs -->
                    <div class="notes-v6-sidebar-tabs">
                        <button class="notes-v6-tab active" data-tab="tree" onclick="NotesLayoutV6.switchSidebarTab('tree')">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>Dossiers</span>
                        </button>
                        <button class="notes-v6-tab" data-tab="tags" onclick="NotesLayoutV6.switchSidebarTab('tags')">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                <line x1="7" y1="7" x2="7.01" y2="7"/>
                            </svg>
                            <span>Tags</span>
                        </button>
                        <button class="notes-v6-tab" data-tab="daily" onclick="NotesLayoutV6.switchSidebarTab('daily')">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>Daily</span>
                        </button>
                        <button class="notes-v6-tab" data-tab="ai" onclick="NotesLayoutV6.switchSidebarTab('ai')">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 16v-4m0-4h.01"/>
                            </svg>
                            <span>IA</span>
                        </button>
                    </div>

                    <!-- Sidebar Content -->
                    <div id="notes-v6-sidebar-content" class="notes-v6-sidebar-content">
                        <!-- Content injected by sidebar modules -->
                    </div>

                    <!-- New Note Button -->
                    <div class="notes-v6-sidebar-footer">
                        <button class="notes-v6-btn-primary" onclick="NotesEditorV6.createNew()">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            <span>Nouvelle note</span>
                        </button>
                    </div>
                </div>

                <!-- Resize Handle Left -->
                <div class="notes-v6-resize-handle left" data-resize="sidebar"></div>

                <!-- Main Editor Area -->
                <div class="notes-v6-main">
                    <!-- Command Bar -->
                    <div class="notes-v6-command-bar">
                        <button class="notes-v6-btn-icon" onclick="NotesLayoutV6.toggleSidebar()" title="Toggle sidebar (Ctrl+\\)">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <line x1="9" y1="3" x2="9" y2="21"/>
                            </svg>
                        </button>

                        <div class="notes-v6-quick-search" onclick="NotesCommandPalette && NotesCommandPalette.open()">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <span class="notes-v6-search-placeholder">Recherche rapide...</span>
                            <kbd>Ctrl+P</kbd>
                        </div>

                        <div class="notes-v6-view-controls">
                            <button class="notes-v6-btn-icon" onclick="NotesLayoutV6.setSplitMode('vertical')" title="Split vertical">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="12" y1="3" x2="12" y2="21"/>
                                </svg>
                            </button>
                            <button class="notes-v6-btn-icon" onclick="NotesLayoutV6.setSplitMode('horizontal')" title="Split horizontal">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="3" y1="12" x2="21" y2="12"/>
                                </svg>
                            </button>
                            <button class="notes-v6-btn-icon" onclick="NotesGraphView && NotesGraphView.open()" title="Vue Graph 3D">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <circle cx="6" cy="6" r="2"/>
                                    <circle cx="18" cy="6" r="2"/>
                                    <circle cx="6" cy="18" r="2"/>
                                    <circle cx="18" cy="18" r="2"/>
                                </svg>
                            </button>
                        </div>

                        <button class="notes-v6-btn-icon" onclick="NotesLayoutV6.toggleBacklinks()" title="Toggle backlinks (Ctrl+B)">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Editor Tabs -->
                    <div id="notes-v6-tabs" class="notes-v6-tabs">
                        <!-- Tabs injected dynamically -->
                    </div>

                    <!-- Editor Content -->
                    <div id="notes-v6-editor-container" class="notes-v6-editor-container">
                        <!-- Editor injected by NotesEditorV6 -->
                    </div>
                </div>

                <!-- Resize Handle Right -->
                <div class="notes-v6-resize-handle right" data-resize="backlinks"></div>

                <!-- Right Panel (Backlinks + AI) -->
                <div class="notes-v6-backlinks-panel" style="${backlinksStyle}">
                    <div class="notes-v6-panel-header">
                        <div class="notes-v6-panel-tabs">
                            <button class="notes-v6-panel-tab active" data-panel-tab="backlinks" onclick="NotesLayoutV6.switchPanelTab('backlinks')">
                                Backlinks
                            </button>
                            <button class="notes-v6-panel-tab" data-panel-tab="ai" onclick="NotesLayoutV6.switchPanelTab('ai')">
                                IA
                            </button>
                        </div>
                    </div>
                    <div id="notes-v6-panel-content" class="notes-v6-panel-content">
                        <!-- Panel content injected dynamically -->
                    </div>
                </div>

            </div>
        `;

        // Initialize submodules
        initializeModules();
    }

    function initializeModules() {
        // Initialize sidebar with default tree view
        switchSidebarTab('tree');

        // Initialize backlinks panel
        switchPanelTab('backlinks');

        console.log('✅ NotesLayoutV6: Layout rendered');
    }

    // ========== SIDEBAR TABS ==========

    function switchSidebarTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.notes-v6-sidebar-tabs .notes-v6-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        const contentEl = document.getElementById('notes-v6-sidebar-content');
        if (!contentEl) return;

        // Render content based on tab
        switch(tabName) {
            case 'tree':
                if (typeof NotesSidebar !== 'undefined') {
                    contentEl.innerHTML = '<div class="notes-sidebar-tree"></div>';
                    NotesSidebar.init();
                    NotesSidebar.render();
                } else {
                    contentEl.innerHTML = '<div class="notes-v6-placeholder">Arborescence des dossiers</div>';
                }
                break;
            case 'tags':
                if (typeof NotesTagsView !== 'undefined' && NotesTagsView.render) {
                    contentEl.innerHTML = NotesTagsView.render();
                } else {
                    contentEl.innerHTML = '<div class="notes-v6-placeholder">Système de tags</div>';
                }
                break;
            case 'daily':
                if (typeof NotesDailyView !== 'undefined' && NotesDailyView.render) {
                    contentEl.innerHTML = NotesDailyView.render();
                } else {
                    contentEl.innerHTML = '<div class="notes-v6-placeholder">Notes quotidiennes</div>';
                }
                break;
            case 'ai':
                if (typeof NotesAiBridge !== 'undefined' && NotesAiBridge.renderSidebar) {
                    contentEl.innerHTML = NotesAiBridge.renderSidebar();
                } else {
                    contentEl.innerHTML = '<div class="notes-v6-placeholder">Clusters IA</div>';
                }
                break;
            default:
                contentEl.innerHTML = '<div class="notes-v6-placeholder">Tab non implémenté</div>';
        }
    }

    // ========== PANEL TABS ==========

    function switchPanelTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.notes-v6-panel-tabs .notes-v6-panel-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.panelTab === tabName);
        });

        const contentEl = document.getElementById('notes-v6-panel-content');
        if (!contentEl) return;

        switch(tabName) {
            case 'backlinks':
                if (typeof NotesBacklinksPanel !== 'undefined' && NotesBacklinksPanel.render) {
                    NotesBacklinksPanel.render(contentEl);
                } else {
                    contentEl.innerHTML = '<div class="notes-v6-placeholder">Backlinks automatiques</div>';
                }
                break;
            case 'ai':
                if (typeof NotesAiBridge !== 'undefined' && NotesAiBridge.renderPanel) {
                    NotesAiBridge.renderPanel(contentEl);
                } else {
                    contentEl.innerHTML = '<div class="notes-v6-placeholder">Suggestions IA</div>';
                }
                break;
        }
    }

    // ========== RESIZE HANDLERS ==========

    function attachResizeHandlers() {
        document.querySelectorAll('.notes-v6-resize-handle').forEach(handle => {
            let startX = 0;
            let startWidth = 0;
            let resizeTarget = null;

            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                resizeTarget = handle.dataset.resize;
                startX = e.clientX;
                startWidth = resizeTarget === 'sidebar' ? state.sidebarWidth : state.backlinksWidth;

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                document.body.style.cursor = 'col-resize';
                handle.classList.add('dragging');
            });

            function onMouseMove(e) {
                if (!resizeTarget) return;

                const delta = resizeTarget === 'sidebar' ? (e.clientX - startX) : (startX - e.clientX);
                const newWidth = Math.max(MIN_WIDTH, Math.min(
                    resizeTarget === 'sidebar' ? MAX_SIDEBAR_WIDTH : MAX_BACKLINKS_WIDTH,
                    startWidth + delta
                ));

                if (resizeTarget === 'sidebar') {
                    state.sidebarWidth = newWidth;
                    document.querySelector('.notes-v6-sidebar').style.width = newWidth + 'px';
                } else {
                    state.backlinksWidth = newWidth;
                    document.querySelector('.notes-v6-backlinks-panel').style.width = newWidth + 'px';
                }
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.body.style.cursor = '';
                handle.classList.remove('dragging');
                resizeTarget = null;
                saveState();
            }
        });
    }

    // ========== EVENT LISTENERS ==========

    function attachEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+\ : Toggle sidebar
            if (e.ctrlKey && e.key === '\\') {
                e.preventDefault();
                toggleSidebar();
            }
            // Ctrl+B : Toggle backlinks
            if (e.ctrlKey && e.key === 'b' && !e.shiftKey) {
                e.preventDefault();
                toggleBacklinks();
            }
            // F11 : Fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
            }
        });
    }

    // ========== ACTIONS ==========

    function toggleSidebar() {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        const sidebar = document.querySelector('.notes-v6-sidebar');
        if (sidebar) {
            sidebar.style.width = state.sidebarCollapsed ? '0' : state.sidebarWidth + 'px';
        }
        saveState();
    }

    function toggleBacklinks() {
        state.backlinksCollapsed = !state.backlinksCollapsed;
        const panel = document.querySelector('.notes-v6-backlinks-panel');
        if (panel) {
            panel.style.width = state.backlinksCollapsed ? '0' : state.backlinksWidth + 'px';
        }
        saveState();
    }

    function toggleFullscreen() {
        state.fullscreen = !state.fullscreen;
        const layout = document.querySelector('.notes-v6-layout');
        if (layout) {
            layout.classList.toggle('fullscreen', state.fullscreen);
        }
        saveState();
    }

    function setSplitMode(mode) {
        state.splitMode = state.splitMode === mode ? null : mode;
        const layout = document.querySelector('.notes-v6-layout');
        if (layout) {
            layout.dataset.split = state.splitMode || 'none';
        }
        saveState();

        if (typeof Toast !== 'undefined') {
            Toast.info(state.splitMode ? `Mode split ${mode} activé` : 'Mode split désactivé');
        }
    }

    // ========== PUBLIC API ==========

    return {
        init,
        render,
        switchSidebarTab,
        switchPanelTab,
        toggleSidebar,
        toggleBacklinks,
        toggleFullscreen,
        setSplitMode,
        getState: () => ({ ...state })
    };

})();
