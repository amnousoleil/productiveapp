/**
 * GALAXY VIEW 6.0 - DIVINE EDITION
 * Architecture Premium Figma/Miro-like
 * ProductiveApp v6.0
 */
const GalaxyViewPremium = (function() {
    'use strict';

    // === STATE ===
    let initialized = false;
    let currentTool = 'select'; // select, pen, shapes, text, connector, sticky
    let currentPanel = null; // Panneau latéral actif
    let selectedElements = [];
    let canvas, ctx;
    let elements = []; // Tous les éléments sur le canvas
    let layers = [{ id: 'layer1', name: 'Calque 1', visible: true, locked: false }];
    let currentLayer = 'layer1';
    let history = [];
    let historyIndex = -1;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let panOffset = { x: 0, y: 0 };
    let zoom = 1.0;
    let gridSize = 20;
    let showGrid = true;
    let snapToGrid = false;

    // === TOOLS CONFIG ===
    const TOOLS = {
        select: {
            id: 'select',
            name: 'Sélection',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
                <path d="M13 13l6 6"/>
            </svg>`,
            shortcut: 'V',
            hasPanel: true
        },
        pen: {
            id: 'pen',
            name: 'Crayon',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>`,
            shortcut: 'P',
            hasPanel: true
        },
        shapes: {
            id: 'shapes',
            name: 'Formes',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>`,
            shortcut: 'R',
            hasPanel: true
        },
        text: {
            id: 'text',
            name: 'Texte',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
            </svg>`,
            shortcut: 'T',
            hasPanel: true
        },
        connector: {
            id: 'connector',
            name: 'Connecteur',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <line x1="15.7" y1="6.7" x2="8.3" y2="10.3"/>
            </svg>`,
            shortcut: 'L',
            hasPanel: true
        },
        sticky: {
            id: 'sticky',
            name: 'Post-it',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 3 21 3 21 8"/>
                <line x1="21" y1="3" x2="10" y2="14"/>
            </svg>`,
            shortcut: 'N',
            hasPanel: true
        },
        hand: {
            id: 'hand',
            name: 'Main (Pan)',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>`,
            shortcut: 'H',
            hasPanel: false
        }
    };

    // === COLORS PALETTE ===
    const COLORS = [
        '#000000', '#6b7280', '#ffffff',
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
        '#f43f5e'
    ];

    // === INITIALIZATION ===
    function init() {
        if (initialized) return;
        console.log('🌌 Galaxy View Premium 6.0 - Initializing...');

        setupHTML();
        setupCanvas();
        setupToolbar();
        setupKeyboardShortcuts();
        setupEvents();

        // Load from backend
        loadGalaxyData();

        initialized = true;
        console.log('✅ Galaxy View Premium 6.0 initialized');
    }

    function setupHTML() {
        const viewGalaxy = document.getElementById('view-galaxy');
        if (!viewGalaxy) return;

        // Injecter la structure HTML
        const mainContainer = document.createElement('div');
        mainContainer.id = 'galaxy-main-container';
        mainContainer.innerHTML = `
            <!-- Toolbar latérale gauche (outils) -->
            <div class="galaxy-sidebar-left" id="galaxy-sidebar-left">
                <!-- Injecté dynamiquement par setupToolbar() -->
            </div>

            <!-- Zone canvas centrale -->
            <div id="galaxy-canvas-zone">
                <canvas id="galaxy-canvas"></canvas>
                <div id="galaxy-loading" class="galaxy-loading" style="display: none;">
                    <div class="galaxy-loading-spinner"></div>
                    <div class="galaxy-loading-text">Chargement...</div>
                </div>
            </div>

            <!-- Panneau propriétés droit (contextuel) -->
            <div class="galaxy-sidebar-right" id="galaxy-sidebar-right">
                <!-- Injecté dynamiquement selon l'outil actif -->
            </div>
        `;

        // Vider le container 3D et injecter notre structure
        const container3D = document.getElementById('galaxy-3d-container');
        if (container3D) {
            container3D.innerHTML = '';
            container3D.appendChild(mainContainer);
        } else {
            viewGalaxy.appendChild(mainContainer);
        }
    }

    function setupCanvas() {
        canvas = document.getElementById('galaxy-canvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d', { alpha: false });
        resizeCanvas();

        // Animation loop
        requestAnimationFrame(render);
    }

    function resizeCanvas() {
        if (!canvas) return;
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    function setupToolbar() {
        const sidebar = document.getElementById('galaxy-sidebar-left');
        if (!sidebar) return;

        let html = '';

        Object.values(TOOLS).forEach((tool, index) => {
            html += `
                <button class="galaxy-tool-btn ${tool.id === currentTool ? 'active' : ''}"
                        data-tool="${tool.id}"
                        title="${tool.name} (${tool.shortcut})">
                    ${tool.icon}
                </button>
            `;

            // Séparateur après certains outils
            if (index === 0 || index === 3) {
                html += '<div class="galaxy-sidebar-sep"></div>';
            }
        });

        // Boutons additionnels
        html += `
            <div class="galaxy-sidebar-sep"></div>
            <button class="galaxy-tool-btn" id="galaxy-layers-btn" title="Calques (L)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                </svg>
            </button>
            <button class="galaxy-tool-btn" id="galaxy-history-btn" title="Historique (H)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
            </button>
            <button class="galaxy-tool-btn" id="galaxy-export-btn" title="Export (E)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
            </button>
        `;

        sidebar.innerHTML = html;

        // Event listeners pour les outils
        sidebar.querySelectorAll('.galaxy-tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                const toolId = btn.dataset.tool;
                switchTool(toolId);
            });
        });

        // Event listeners pour les boutons spéciaux
        document.getElementById('galaxy-layers-btn')?.addEventListener('click', () => openPanel('layers'));
        document.getElementById('galaxy-history-btn')?.addEventListener('click', () => openPanel('history'));
        document.getElementById('galaxy-export-btn')?.addEventListener('click', () => openPanel('export'));
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore si on est en train d'éditer du texte
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key.toUpperCase();

            // Raccourcis outils
            Object.values(TOOLS).forEach(tool => {
                if (key === tool.shortcut) {
                    e.preventDefault();
                    switchTool(tool.id);
                }
            });

            // Autres raccourcis
            if (e.ctrlKey || e.metaKey) {
                switch (key) {
                    case 'Z':
                        e.preventDefault();
                        e.shiftKey ? redo() : undo();
                        break;
                    case 'Y':
                        e.preventDefault();
                        redo();
                        break;
                    case 'S':
                        e.preventDefault();
                        saveGalaxyData();
                        break;
                    case 'A':
                        e.preventDefault();
                        selectAll();
                        break;
                    case 'D':
                        e.preventDefault();
                        duplicateSelection();
                        break;
                }
            }

            // Delete
            if (key === 'DELETE' || key === 'BACKSPACE') {
                if (selectedElements.length > 0) {
                    e.preventDefault();
                    deleteSelection();
                }
            }

            // Escape
            if (key === 'ESCAPE') {
                closePanel();
                deselectAll();
            }
        });
    }

    function setupEvents() {
        if (!canvas) return;

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('wheel', onWheel);
        canvas.addEventListener('contextmenu', onContextMenu);

        window.addEventListener('resize', resizeCanvas);
    }

    // === TOOL SWITCHING ===
    function switchTool(toolId) {
        if (!TOOLS[toolId]) return;

        currentTool = toolId;

        // Mettre à jour l'UI
        document.querySelectorAll('.galaxy-tool-btn[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === toolId);
        });

        // Ouvrir le panneau si l'outil en a un
        if (TOOLS[toolId].hasPanel) {
            openPanel(toolId);
        } else {
            closePanel();
        }

        // Changer le curseur
        updateCursor();

        console.log(`🔧 Tool switched to: ${toolId}`);
    }

    function updateCursor() {
        if (!canvas) return;

        switch (currentTool) {
            case 'select':
                canvas.style.cursor = 'default';
                break;
            case 'pen':
                canvas.style.cursor = 'crosshair';
                break;
            case 'shapes':
            case 'text':
            case 'sticky':
                canvas.style.cursor = 'crosshair';
                break;
            case 'connector':
                canvas.style.cursor = 'cell';
                break;
            case 'hand':
                canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
                break;
        }
    }

    // === PANEL MANAGEMENT ===
    function openPanel(panelId) {
        const sidebar = document.getElementById('galaxy-sidebar-right');
        if (!sidebar) return;

        currentPanel = panelId;
        sidebar.classList.add('visible');

        let content = '';

        switch (panelId) {
            case 'select':
                content = renderSelectPanel();
                break;
            case 'pen':
                content = renderPenPanel();
                break;
            case 'shapes':
                content = renderShapesPanel();
                break;
            case 'text':
                content = renderTextPanel();
                break;
            case 'connector':
                content = renderConnectorPanel();
                break;
            case 'sticky':
                content = renderStickyPanel();
                break;
            case 'layers':
                content = renderLayersPanel();
                break;
            case 'history':
                content = renderHistoryPanel();
                break;
            case 'export':
                content = renderExportPanel();
                break;
        }

        sidebar.innerHTML = content;

        // Event listener pour fermer
        sidebar.querySelector('.galaxy-panel-close')?.addEventListener('click', closePanel);
    }

    function closePanel() {
        const sidebar = document.getElementById('galaxy-sidebar-right');
        if (sidebar) {
            sidebar.classList.remove('visible');
            currentPanel = null;
        }
    }

    // === PANEL RENDERERS ===
    function renderSelectPanel() {
        const count = selectedElements.length;
        return `
            <div class="galaxy-panel-header">
                <h3 class="galaxy-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
                    </svg>
                    Sélection
                </h3>
                <p class="galaxy-panel-subtitle">${count} élément${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}</p>
                <button class="galaxy-panel-close">✕</button>
            </div>
            <div class="galaxy-panel-content">
                ${count === 0 ? `
                    <p style="color: #9ca3af; font-size: 13px; text-align: center; padding: 40px 20px;">
                        Sélectionnez des éléments pour voir leurs propriétés
                    </p>
                ` : `
                    <div class="galaxy-prop-section">
                        <label class="galaxy-prop-label">Position</label>
                        <div class="galaxy-prop-row">
                            <div class="galaxy-prop-field">
                                <input type="number" class="galaxy-prop-input" placeholder="X" value="0">
                            </div>
                            <div class="galaxy-prop-field">
                                <input type="number" class="galaxy-prop-input" placeholder="Y" value="0">
                            </div>
                        </div>
                    </div>

                    <div class="galaxy-prop-section">
                        <label class="galaxy-prop-label">Dimensions</label>
                        <div class="galaxy-prop-row">
                            <div class="galaxy-prop-field">
                                <input type="number" class="galaxy-prop-input" placeholder="Largeur" value="100">
                            </div>
                            <div class="galaxy-prop-field">
                                <input type="number" class="galaxy-prop-input" placeholder="Hauteur" value="100">
                            </div>
                        </div>
                    </div>

                    <div class="galaxy-prop-section">
                        <label class="galaxy-prop-label">Couleur</label>
                        <div class="galaxy-color-grid">
                            ${COLORS.map(color => `
                                <button class="galaxy-color-swatch ${color === '#667eea' ? 'active' : ''}"
                                        style="background: ${color}"
                                        data-color="${color}"></button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="galaxy-prop-section">
                        <label class="galaxy-prop-label">Opacité</label>
                        <input type="range" class="galaxy-prop-slider" min="0" max="100" value="100">
                    </div>

                    <div class="galaxy-prop-section">
                        <button class="galaxy-prop-btn">Dupliquer</button>
                        <button class="galaxy-prop-btn secondary" style="margin-top: 8px;">Supprimer</button>
                    </div>
                `}
            </div>
        `;
    }

    function renderPenPanel() {
        return `
            <div class="galaxy-panel-header">
                <h3 class="galaxy-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    </svg>
                    Crayon
                </h3>
                <p class="galaxy-panel-subtitle">Dessin libre</p>
                <button class="galaxy-panel-close">✕</button>
            </div>
            <div class="galaxy-panel-content">
                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Épaisseur</label>
                    <input type="range" class="galaxy-prop-slider" min="1" max="20" value="3">
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Couleur</label>
                    <div class="galaxy-color-grid">
                        ${COLORS.map(color => `
                            <button class="galaxy-color-swatch ${color === '#000000' ? 'active' : ''}"
                                    style="background: ${color}"
                                    data-color="${color}"></button>
                        `).join('')}
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Opacité</label>
                    <input type="range" class="galaxy-prop-slider" min="0" max="100" value="100">
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Style</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        <button class="galaxy-prop-btn secondary">Solide</button>
                        <button class="galaxy-prop-btn secondary">Pointillé</button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderShapesPanel() {
        return `
            <div class="galaxy-panel-header">
                <h3 class="galaxy-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                    </svg>
                    Formes
                </h3>
                <p class="galaxy-panel-subtitle">Créer des formes géométriques</p>
                <button class="galaxy-panel-close">✕</button>
            </div>
            <div class="galaxy-panel-content">
                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Type de forme</label>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        <button class="galaxy-prop-btn secondary">⬜ Carré</button>
                        <button class="galaxy-prop-btn secondary">⭕ Cercle</button>
                        <button class="galaxy-prop-btn secondary">🔺 Triangle</button>
                        <button class="galaxy-prop-btn secondary">◆ Losange</button>
                        <button class="galaxy-prop-btn secondary">⬢ Hexagone</button>
                        <button class="galaxy-prop-btn secondary">⭐ Étoile</button>
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Couleur de remplissage</label>
                    <div class="galaxy-color-grid">
                        ${COLORS.map(color => `
                            <button class="galaxy-color-swatch ${color === '#667eea' ? 'active' : ''}"
                                    style="background: ${color}"
                                    data-color="${color}"></button>
                        `).join('')}
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Couleur de contour</label>
                    <div class="galaxy-color-grid">
                        ${COLORS.map(color => `
                            <button class="galaxy-color-swatch ${color === '#000000' ? 'active' : ''}"
                                    style="background: ${color}"
                                    data-color="${color}"></button>
                        `).join('')}
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Épaisseur contour</label>
                    <input type="range" class="galaxy-prop-slider" min="0" max="10" value="2">
                </div>
            </div>
        `;
    }

    function renderTextPanel() {
        return `
            <div class="galaxy-panel-header">
                <h3 class="galaxy-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="4 7 4 4 20 4 20 7"/>
                        <line x1="9" y1="20" x2="15" y2="20"/>
                        <line x1="12" y1="4" x2="12" y2="20"/>
                    </svg>
                    Texte
                </h3>
                <p class="galaxy-panel-subtitle">Ajouter du texte</p>
                <button class="galaxy-panel-close">✕</button>
            </div>
            <div class="galaxy-panel-content">
                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Police</label>
                    <select class="galaxy-prop-input">
                        <option>Inter</option>
                        <option>Arial</option>
                        <option>Times New Roman</option>
                        <option>Courier New</option>
                        <option>Georgia</option>
                        <option>Verdana</option>
                    </select>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Taille</label>
                    <input type="range" class="galaxy-prop-slider" min="8" max="72" value="16">
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Style</label>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        <button class="galaxy-prop-btn secondary"><strong>B</strong></button>
                        <button class="galaxy-prop-btn secondary"><em>I</em></button>
                        <button class="galaxy-prop-btn secondary"><u>U</u></button>
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Alignement</label>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        <button class="galaxy-prop-btn secondary">⬅️</button>
                        <button class="galaxy-prop-btn secondary">↔️</button>
                        <button class="galaxy-prop-btn secondary">➡️</button>
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Couleur</label>
                    <div class="galaxy-color-grid">
                        ${COLORS.map(color => `
                            <button class="galaxy-color-swatch ${color === '#000000' ? 'active' : ''}"
                                    style="background: ${color}"
                                    data-color="${color}"></button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function renderConnectorPanel() {
        return `
            <div class="galaxy-panel-header">
                <h3 class="galaxy-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <line x1="15.7" y1="6.7" x2="8.3" y2="10.3"/>
                    </svg>
                    Connecteur
                </h3>
                <p class="galaxy-panel-subtitle">Relier des éléments</p>
                <button class="galaxy-panel-close">✕</button>
            </div>
            <div class="galaxy-panel-content">
                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Type de ligne</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        <button class="galaxy-prop-btn secondary">Droite</button>
                        <button class="galaxy-prop-btn secondary">Courbée</button>
                        <button class="galaxy-prop-btn secondary">Étapes</button>
                        <button class="galaxy-prop-btn secondary">Flèche</button>
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Épaisseur</label>
                    <input type="range" class="galaxy-prop-slider" min="1" max="10" value="2">
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Couleur</label>
                    <div class="galaxy-color-grid">
                        ${COLORS.map(color => `
                            <button class="galaxy-color-swatch ${color === '#6b7280' ? 'active' : ''}"
                                    style="background: ${color}"
                                    data-color="${color}"></button>
                        `).join('')}
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Style</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        <button class="galaxy-prop-btn secondary">Solide</button>
                        <button class="galaxy-prop-btn secondary">Pointillé</button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderStickyPanel() {
        return `
            <div class="galaxy-panel-header">
                <h3 class="galaxy-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 3 21 3 21 8"/>
                    </svg>
                    Post-it
                </h3>
                <p class="galaxy-panel-subtitle">Notes adhésives</p>
                <button class="galaxy-panel-close">✕</button>
            </div>
            <div class="galaxy-panel-content">
                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Couleur du post-it</label>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                        <button class="galaxy-color-swatch active" style="background: #fef3c7"></button>
                        <button class="galaxy-color-swatch" style="background: #dbeafe"></button>
                        <button class="galaxy-color-swatch" style="background: #fecaca"></button>
                        <button class="galaxy-color-swatch" style="background: #d9f99d"></button>
                        <button class="galaxy-color-swatch" style="background: #fed7aa"></button>
                        <button class="galaxy-color-swatch" style="background: #e9d5ff"></button>
                        <button class="galaxy-color-swatch" style="background: #fce7f3"></button>
                        <button class="galaxy-color-swatch" style="background: #ccfbf1"></button>
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Taille de police</label>
                    <input type="range" class="galaxy-prop-slider" min="10" max="24" value="14">
                </div>

                <div class="galaxy-prop-section">
                    <button class="galaxy-prop-btn">Créer post-it</button>
                </div>
            </div>
        `;
    }

    function renderLayersPanel() {
        return `
            <div class="galaxy-panel-header">
                <h3 class="galaxy-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                        <polyline points="2 17 12 22 22 17"/>
                        <polyline points="2 12 12 17 22 12"/>
                    </svg>
                    Calques
                </h3>
                <p class="galaxy-panel-subtitle">${layers.length} calque${layers.length > 1 ? 's' : ''}</p>
                <button class="galaxy-panel-close">✕</button>
            </div>
            <div class="galaxy-panel-content">
                <div class="galaxy-layer-list">
                    ${layers.map((layer, index) => `
                        <div class="galaxy-layer-item ${layer.id === currentLayer ? 'active' : ''}">
                            <div class="galaxy-layer-icon">📄</div>
                            <div class="galaxy-layer-name">${layer.name}</div>
                            <button class="galaxy-layer-visibility">${layer.visible ? '👁️' : '👁️‍🗨️'}</button>
                        </div>
                    `).join('')}
                </div>
                <div class="galaxy-prop-section" style="margin-top: 16px;">
                    <button class="galaxy-prop-btn">+ Nouveau calque</button>
                </div>
            </div>
        `;
    }

    function renderHistoryPanel() {
        return `
            <div class="galaxy-panel-header">
                <h3 class="galaxy-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                    Historique
                </h3>
                <p class="galaxy-panel-subtitle">${history.length} action${history.length > 1 ? 's' : ''}</p>
                <button class="galaxy-panel-close">✕</button>
            </div>
            <div class="galaxy-panel-content">
                ${history.length === 0 ? `
                    <p style="color: #9ca3af; font-size: 13px; text-align: center; padding: 40px 20px;">
                        Aucune action pour le moment
                    </p>
                ` : `
                    <div class="galaxy-history-list">
                        ${history.slice().reverse().map((action, index) => `
                            <div class="galaxy-history-item ${index === 0 ? 'current' : ''}">
                                <div class="galaxy-history-icon">📝</div>
                                <div class="galaxy-history-text">${action.description}</div>
                                <div class="galaxy-history-time">${action.time}</div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }

    function renderExportPanel() {
        return `
            <div class="galaxy-panel-header">
                <h3 class="galaxy-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export
                </h3>
                <p class="galaxy-panel-subtitle">Exporter votre création</p>
                <button class="galaxy-panel-close">✕</button>
            </div>
            <div class="galaxy-panel-content">
                <div class="galaxy-export-format">
                    <div class="galaxy-export-option selected">
                        <div class="galaxy-export-icon">🖼️</div>
                        <div class="galaxy-export-label">PNG</div>
                    </div>
                    <div class="galaxy-export-option">
                        <div class="galaxy-export-icon">📄</div>
                        <div class="galaxy-export-label">PDF</div>
                    </div>
                    <div class="galaxy-export-option">
                        <div class="galaxy-export-icon">🎨</div>
                        <div class="galaxy-export-label">SVG</div>
                    </div>
                    <div class="galaxy-export-option">
                        <div class="galaxy-export-icon">📦</div>
                        <div class="galaxy-export-label">JSON</div>
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Qualité</label>
                    <input type="range" class="galaxy-prop-slider" min="50" max="100" value="100">
                </div>

                <div class="galaxy-prop-section">
                    <label class="galaxy-prop-label">Arrière-plan</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        <button class="galaxy-prop-btn secondary">Transparent</button>
                        <button class="galaxy-prop-btn secondary">Blanc</button>
                    </div>
                </div>

                <div class="galaxy-prop-section">
                    <button class="galaxy-prop-btn">📥 Télécharger</button>
                </div>
            </div>
        `;
    }

    // === MOUSE EVENTS ===
    function onMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        isDragging = true;
        dragStart = { x, y };

        console.log(`🖱️ Mouse down at (${x}, ${y}) - Tool: ${currentTool}`);
    }

    function onMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDragging) {
            if (currentTool === 'hand') {
                // Pan
                const dx = x - dragStart.x;
                const dy = y - dragStart.y;
                panOffset.x += dx;
                panOffset.y += dy;
                dragStart = { x, y };
            }
        }
    }

    function onMouseUp(e) {
        isDragging = false;
    }

    function onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        zoom = Math.max(0.1, Math.min(10, zoom * delta));
        console.log(`🔍 Zoom: ${(zoom * 100).toFixed(0)}%`);
    }

    function onContextMenu(e) {
        e.preventDefault();
        // TODO: Context menu
    }

    // === HISTORY ===
    function addToHistory(description) {
        const action = {
            description,
            time: new Date().toLocaleTimeString(),
            elements: JSON.parse(JSON.stringify(elements))
        };

        history = history.slice(0, historyIndex + 1);
        history.push(action);
        historyIndex = history.length - 1;

        console.log(`📝 History: ${description}`);
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            elements = JSON.parse(JSON.stringify(history[historyIndex].elements));
            console.log('↩️ Undo');
        }
    }

    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            elements = JSON.parse(JSON.stringify(history[historyIndex].elements));
            console.log('↪️ Redo');
        }
    }

    // === SELECTION ===
    function selectAll() {
        selectedElements = [...elements];
        console.log(`✅ Selected all (${elements.length})`);
    }

    function deselectAll() {
        selectedElements = [];
    }

    function duplicateSelection() {
        // TODO: Duplicate selected elements
        console.log('📋 Duplicate');
    }

    function deleteSelection() {
        elements = elements.filter(el => !selectedElements.includes(el));
        selectedElements = [];
        addToHistory('Suppression d\'éléments');
        console.log('🗑️ Delete');
    }

    // === RENDER LOOP ===
    function render() {
        if (!ctx || !canvas) return;

        // Clear
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        if (showGrid) {
            drawGrid();
        }

        // Transform
        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        ctx.scale(zoom, zoom);

        // Draw elements
        elements.forEach(el => {
            // TODO: Draw element based on type
        });

        ctx.restore();

        requestAnimationFrame(render);
    }

    function drawGrid() {
        const gridSpacing = gridSize * zoom;
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = panOffset.x % gridSpacing; x < canvas.width; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = panOffset.y % gridSpacing; y < canvas.height; y += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // === DATA MANAGEMENT ===
    async function loadGalaxyData() {
        showLoading(true);
        try {
            // TODO: Load from backend API
            console.log('📥 Loading galaxy data...');
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error loading galaxy data:', error);
        } finally {
            showLoading(false);
        }
    }

    async function saveGalaxyData() {
        showLoading(true);
        try {
            // TODO: Save to backend API
            console.log('💾 Saving galaxy data...');
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('✅ Galaxy data saved');
        } catch (error) {
            console.error('Error saving galaxy data:', error);
        } finally {
            showLoading(false);
        }
    }

    function showLoading(show) {
        const loading = document.getElementById('galaxy-loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    // === PUBLIC API ===
    return {
        init,
        switchTool,
        openPanel,
        closePanel,
        saveGalaxyData,
        undo,
        redo
    };
})();

window.GalaxyViewPremium = GalaxyViewPremium;
console.log('📦 Galaxy View Premium 6.0 loaded');
