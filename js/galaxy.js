// =============================================
// PRODUCTIVEAPP - GALAXY.JS v2.0
// Galaxy View - Mind Mapping comme Miro/Excalidraw
// =============================================

// === STATE ===
let galaxyCanvas = null;
let galaxyCtx = null;
let galaxyNodes = [];
let galaxyConnections = [];
let selectedNodes = []; // Multi-sélection
let clipboard = null;
let isDragging = false;
let isPanning = false;
let dragStartX = 0;
let dragStartY = 0;
let panOffsetX = window.innerWidth / 2;
let panOffsetY = window.innerHeight / 2;
let zoom = 1;
let isCreatingConnection = false;
let connectionStart = null;
let mouseX = 0;
let mouseY = 0;
let isEditingText = false;
let currentTheme = 'white'; // Thème blanc Excalidraw
let roughCanvas = null; // Instance Rough.js pour style hand-drawn
let showHelp = false;
let currentShape = 'circle'; // circle, rect, diamond, text
let contextMenuPos = null; // {x, y, screenX, screenY}

// === CONSTANTES ===
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_SPEED = 0.1;
const NODE_RADIUS = 60;
const CONNECTION_THRESHOLD = 20;

// === FORMES DISPONIBLES ===
const SHAPES = [
    { id: 'circle', name: 'Cercle', icon: '●' },
    { id: 'rect', name: 'Rectangle', icon: '▭' },
    { id: 'diamond', name: 'Losange', icon: '◆' },
    { id: 'text', name: 'Texte libre', icon: 'T' }
];

// === THÈMES DE FOND ===
const GALAXY_THEMES = {
    obsidian: {
        name: 'Obsidian',
        background: '#1e1e1e',
        grid: '#2d2d2d',
        text: '#e4e4e4'
    },
    cream: {
        name: 'Crème',
        background: '#faf8f3',
        grid: '#e8e6e1',
        text: '#2d2d2d'
    },
    white: {
        name: 'Blanc',
        background: '#ffffff',
        grid: '#e5e7eb',
        text: '#111827'
    },
    dark: {
        name: 'Nuit étoilée',
        background: '#0a0a0f',
        grid: '#1a1a1f',
        text: '#f5f5f5',
        stars: true
    }
};

// === COULEURS DISPONIBLES (palette Excalidraw simplifiée) ===
const COLORS = [
    '#1e1e1e', // Noir
    '#e03131', // Rouge
    '#2f9e44', // Vert
    '#1971c2', // Bleu
    '#f08c00', // Orange
    '#ae3ec9', // Violet
    '#0c8599', // Cyan
];

// === ÉTOILES (pour thème dark) ===
const stars = [];

// =============================================
// INITIALISATION
// =============================================

async function initGalaxyView() {
    console.log('🌌 Initialisation Galaxy View v2.0...');

    createGalaxyOverlay();
    generateStars();
    setupGalaxyEvents();
    await loadFromAPI();
    requestAnimationFrame(renderGalaxy);

    console.log('✅ Galaxy View v2.0 initialisée avec API PostgreSQL');
}

function createGalaxyOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'galaxy-overlay';
    overlay.className = 'galaxy-overlay hidden';

    // Toolbar en haut
    const toolbar = document.createElement('div');
    toolbar.className = 'galaxy-toolbar';
    toolbar.innerHTML = `
        <div class="galaxy-toolbar-left">
            <span class="galaxy-title">✨ Galaxy View</span>
            <button class="galaxy-tool-btn galaxy-help-btn" id="galaxy-help-btn" title="Aide & Raccourcis">ℹ️</button>
        </div>
        <div class="galaxy-toolbar-center">
            <div class="galaxy-shape-selector"></div>
            <div class="galaxy-color-palette"></div>
            <div class="galaxy-theme-selector"></div>
        </div>
        <div class="galaxy-toolbar-right">
            <button class="galaxy-tool-btn" id="galaxy-export-png-btn" title="Exporter PNG">📸</button>
            <button class="galaxy-tool-btn" id="galaxy-clear-btn" title="Tout effacer">🗑️</button>
            <button class="galaxy-tool-btn" id="galaxy-export-btn" title="Exporter JSON">💾</button>
            <button class="galaxy-close-btn" id="galaxy-close-btn" title="Fermer (Échap)">✕</button>
        </div>
    `;

    const canvas = document.createElement('canvas');
    canvas.id = 'galaxy-canvas';
    canvas.className = 'galaxy-canvas';

    overlay.appendChild(toolbar);
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    galaxyCanvas = canvas;
    galaxyCtx = canvas.getContext('2d');

    // Initialiser Rough.js pour style hand-drawn Excalidraw
    if (typeof rough !== 'undefined') {
        roughCanvas = rough.canvas(canvas);
        console.log('✅ Rough.js initialisé - style hand-drawn activé');
    }

    resizeGalaxyCanvas();
    renderShapeSelector();
    renderColorPalette();
    renderThemeSelector();
}

function resizeGalaxyCanvas() {
    if (!galaxyCanvas) return;
    galaxyCanvas.width = window.innerWidth;
    galaxyCanvas.height = window.innerHeight;
}

function generateStars() {
    stars.length = 0;
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * 4000 - 2000,
            y: Math.random() * 4000 - 2000,
            radius: Math.random() * 1.5 + 0.3,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

function renderShapeSelector() {
    const selector = document.querySelector('.galaxy-shape-selector');
    if (!selector) return;

    selector.innerHTML = SHAPES.map(shape => `
        <button class="shape-btn ${shape.id === currentShape ? 'active' : ''}"
                data-shape="${shape.id}"
                title="${shape.name}">
            ${shape.icon}
        </button>
    `).join('');

    selector.querySelectorAll('.shape-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentShape = btn.dataset.shape;
            selector.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function renderColorPalette() {
    const palette = document.querySelector('.galaxy-color-palette');
    if (!palette) return;

    palette.innerHTML = COLORS.map(color => `
        <button class="color-btn" style="background: ${color}" data-color="${color}" title="Couleur"></button>
    `).join('');

    palette.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const color = btn.dataset.color;
            for (const node of selectedNodes) {
                node.color = color;
                await saveNodeToAPI(node, 'update');
            }
        });
    });
}

function renderThemeSelector() {
    const selector = document.querySelector('.galaxy-theme-selector');
    if (!selector) return;

    selector.innerHTML = Object.keys(GALAXY_THEMES).map(key => `
        <button class="theme-btn ${key === currentTheme ? 'active' : ''}"
                data-theme="${key}"
                title="${GALAXY_THEMES[key].name}">
            ${GALAXY_THEMES[key].name[0]}
        </button>
    `).join('');

    selector.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTheme = btn.dataset.theme;
            selector.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Thème sauvegardé localement seulement
            localStorage.setItem('galaxyTheme', currentTheme);
        });
    });
}

// =============================================
// ÉVÉNEMENTS
// =============================================

function setupGalaxyEvents() {
    const overlay = document.getElementById('galaxy-overlay');
    const closeBtn = document.getElementById('galaxy-close-btn');
    const clearBtn = document.getElementById('galaxy-clear-btn');
    const exportBtn = document.getElementById('galaxy-export-btn');
    const exportPngBtn = document.getElementById('galaxy-export-png-btn');
    const helpBtn = document.getElementById('galaxy-help-btn');

    closeBtn.addEventListener('click', closeGalaxyView);
    clearBtn.addEventListener('click', clearAllNodes);
    exportBtn.addEventListener('click', exportToJSON);
    exportPngBtn.addEventListener('click', exportToPNG);
    helpBtn.addEventListener('click', toggleHelp);

    document.addEventListener('keydown', handleKeyDown);

    galaxyCanvas.addEventListener('mousedown', handleCanvasMouseDown);
    galaxyCanvas.addEventListener('mousemove', handleCanvasMouseMove);
    galaxyCanvas.addEventListener('mouseup', handleCanvasMouseUp);
    galaxyCanvas.addEventListener('wheel', handleCanvasWheel);
    galaxyCanvas.addEventListener('contextmenu', handleCanvasRightClick);
    galaxyCanvas.addEventListener('dblclick', handleCanvasDoubleClick);

    window.addEventListener('resize', resizeGalaxyCanvas);
}

async function handleKeyDown(e) {
    const overlay = document.getElementById('galaxy-overlay');
    if (overlay.classList.contains('hidden')) return;

    if (isEditingText) return;

    // Échap - Fermer ou déselectionner
    if (e.key === 'Escape') {
        if (selectedNodes.length > 0) {
            selectedNodes = [];
        } else {
            closeGalaxyView();
        }
    }

    // Delete - Supprimer
    if (e.key === 'Delete' || e.key === 'Backspace') {
        await deleteSelectedNodes();
    }

    // Ctrl+C - Copier
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        copySelectedNodes();
    }

    // Ctrl+V - Coller
    if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        await pasteNodes();
    }

    // Ctrl+D - Dupliquer
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        await duplicateSelectedNodes();
    }

    // Ctrl+A - Tout sélectionner
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        selectedNodes = [...galaxyNodes];
    }
}

function handleCanvasMouseDown(e) {
    // Gérer le menu contextuel en priorité
    if (contextMenuPos) {
        handleContextMenuClick(e);
        return;
    }

    const rect = galaxyCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffsetX) / zoom;
    const y = (e.clientY - rect.top - panOffsetY) / zoom;

    const node = getNodeAt(x, y);

    if (node) {
        // Sélection multiple avec Shift
        if (e.shiftKey) {
            if (selectedNodes.includes(node)) {
                selectedNodes = selectedNodes.filter(n => n !== node);
            } else {
                selectedNodes.push(node);
            }
        } else {
            if (!selectedNodes.includes(node)) {
                selectedNodes = [node];
            }
        }

        // Vérifier si on clique sur le bord pour créer une connexion
        const dist = Math.hypot(x - node.x, y - node.y);
        if (dist > NODE_RADIUS - CONNECTION_THRESHOLD) {
            isCreatingConnection = true;
            connectionStart = node;
        } else {
            isDragging = true;
            dragStartX = x;
            dragStartY = y;
        }
    } else {
        // Déselectionner si pas de Shift
        if (!e.shiftKey) {
            selectedNodes = [];
        }

        // Pan
        isPanning = true;
        dragStartX = e.clientX - panOffsetX;
        dragStartY = e.clientY - panOffsetY;
    }
}

function handleCanvasMouseMove(e) {
    const rect = galaxyCanvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left - panOffsetX) / zoom;
    mouseY = (e.clientY - rect.top - panOffsetY) / zoom;

    if (isDragging && selectedNodes.length > 0) {
        const dx = mouseX - dragStartX;
        const dy = mouseY - dragStartY;

        selectedNodes.forEach(node => {
            node.x += dx;
            node.y += dy;
        });

        dragStartX = mouseX;
        dragStartY = mouseY;
        // Sauvegarde sera faite au mouseUp
    } else if (isPanning) {
        panOffsetX = e.clientX - dragStartX;
        panOffsetY = e.clientY - dragStartY;
    }
}

async function handleCanvasMouseUp(e) {
    if (isCreatingConnection && connectionStart) {
        const rect = galaxyCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - panOffsetX) / zoom;
        const y = (e.clientY - rect.top - panOffsetY) / zoom;

        const targetNode = getNodeAt(x, y);

        if (targetNode && targetNode !== connectionStart) {
            await createConnection(connectionStart, targetNode);
        }
    }

    // Sauvegarder les nodes après un drag
    if (isDragging && selectedNodes.length > 0) {
        for (const node of selectedNodes) {
            await saveNodeToAPI(node, 'update');
        }
    }

    isDragging = false;
    isPanning = false;
    isCreatingConnection = false;
    connectionStart = null;
}

function handleCanvasWheel(e) {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));

    const rect = galaxyCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const oldZoom = zoom;
    zoom = newZoom;

    panOffsetX = mouseX - (mouseX - panOffsetX) * (zoom / oldZoom);
    panOffsetY = mouseY - (mouseY - panOffsetY) * (zoom / oldZoom);
}

function handleCanvasRightClick(e) {
    e.preventDefault();

    const rect = galaxyCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffsetX) / zoom;
    const y = (e.clientY - rect.top - panOffsetY) / zoom;

    // Si on clique sur un node, ne pas afficher le menu
    const node = getNodeAt(x, y);
    if (node) return;

    // Afficher le menu contextuel radial
    contextMenuPos = {
        x: x,
        y: y,
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top
    };
}

async function handleCanvasDoubleClick(e) {
    const rect = galaxyCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffsetX) / zoom;
    const y = (e.clientY - rect.top - panOffsetY) / zoom;

    const node = getNodeAt(x, y);
    if (node) {
        // Double-clic sur une bulle = éditer le texte
        await editNodeText(node);
    } else {
        // Double-clic sur vide = créer une bulle (comme Miro)
        await createNode(x, y, 'Nouvelle idée');
    }
}

// =============================================
// LOGIQUE MÉTIER
// =============================================

async function createNode(x, y, text = 'Nouvelle idée', color = COLORS[0], shape = null) {
    const node = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x,
        y,
        text,
        color,
        shape: shape || currentShape, // circle, rect, diamond, text
        width: currentShape === 'rect' ? 120 : NODE_RADIUS * 2,
        height: currentShape === 'rect' ? 80 : NODE_RADIUS * 2
    };

    galaxyNodes.push(node);
    selectedNodes = [node];

    // Sauvegarder en API
    await saveNodeToAPI(node, 'create');

    console.log('✨ Nœud créé:', node.text, `(${node.shape})`);
    return node;
}

async function createConnection(nodeA, nodeB) {
    const exists = galaxyConnections.some(c =>
        (c.from === nodeA.id && c.to === nodeB.id) ||
        (c.from === nodeB.id && c.to === nodeA.id)
    );

    if (!exists) {
        const conn = {
            id: `conn-${Date.now()}`,
            from: nodeA.id,
            to: nodeB.id
        };

        galaxyConnections.push(conn);

        // Sauvegarder en API
        await saveConnectionToAPI(conn);

        console.log('🔗 Connexion créée');
    }
}

function getNodeAt(x, y) {
    for (let i = galaxyNodes.length - 1; i >= 0; i--) {
        const node = galaxyNodes[i];

        if (node.shape === 'circle') {
            const dist = Math.hypot(x - node.x, y - node.y);
            if (dist <= NODE_RADIUS) return node;
        } else if (node.shape === 'rect') {
            const halfW = (node.width || 120) / 2;
            const halfH = (node.height || 80) / 2;
            if (x >= node.x - halfW && x <= node.x + halfW &&
                y >= node.y - halfH && y <= node.y + halfH) {
                return node;
            }
        } else if (node.shape === 'diamond') {
            // Test diamond (losange) avec distance Manhattan
            const size = NODE_RADIUS;
            const dx = Math.abs(x - node.x);
            const dy = Math.abs(y - node.y);
            if (dx / size + dy / size <= 1) {
                return node;
            }
        } else if (node.shape === 'text') {
            // Zone de hit pour texte libre (rectangle invisible autour)
            const textWidth = node.text.length * 8; // Approximation
            const textHeight = 20;
            if (x >= node.x - 5 && x <= node.x + textWidth + 5 &&
                y >= node.y - textHeight && y <= node.y + 5) {
                return node;
            }
        }
    }
    return null;
}

async function editNodeText(node) {
    const newText = prompt('✏️ Modifier le texte:', node.text);
    if (newText !== null && newText.trim()) {
        node.text = newText.trim();
        await saveNodeToAPI(node, 'update');
    }
}

async function deleteSelectedNodes() {
    if (selectedNodes.length === 0) return;

    // Supprimer chaque nœud via l'API
    for (const node of selectedNodes) {
        if (node.id) {
            await deleteNodeFromAPI(node.id);
        }

        // Retirer du tableau local
        galaxyNodes = galaxyNodes.filter(n => n.id !== node.id);

        // Retirer les connexions associées
        galaxyConnections = galaxyConnections.filter(c =>
            c.from !== node.id && c.to !== node.id
        );
    }

    selectedNodes = [];
    console.log('🗑️ Nœuds supprimés');
}

function copySelectedNodes() {
    if (selectedNodes.length === 0) return;

    clipboard = selectedNodes.map(node => ({
        text: node.text,
        color: node.color
    }));

    console.log('📋 Copié:', clipboard.length, 'nœud(s)');
}

async function pasteNodes() {
    if (!clipboard || clipboard.length === 0) return;

    selectedNodes = [];
    for (let i = 0; i < clipboard.length; i++) {
        const data = clipboard[i];
        const node = await createNode(
            mouseX + i * 30,
            mouseY + i * 30,
            data.text,
            data.color
        );
        selectedNodes.push(node);
    }

    console.log('📌 Collé:', clipboard.length, 'nœud(s)');
}

async function duplicateSelectedNodes() {
    if (selectedNodes.length === 0) return;

    copySelectedNodes();
    await pasteNodes();
}

async function clearAllNodes() {
    if (!confirm('🗑️ Effacer toutes les bulles ?')) return;

    // Supprimer tous les nœuds via l'API
    for (const node of galaxyNodes) {
        if (node.id) {
            await deleteNodeFromAPI(node.id);
        }
    }

    galaxyNodes = [];
    galaxyConnections = [];
    selectedNodes = [];
    console.log('🗑️ Toutes les bulles effacées');
}

function exportToJSON() {
    const data = {
        nodes: galaxyNodes,
        connections: galaxyConnections,
        theme: currentTheme,
        zoom,
        panX: panOffsetX,
        panY: panOffsetY
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `galaxy-view-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    console.log('💾 Exporté JSON');
}

async function exportToPNG() {
    if (!galaxyCanvas) return;

    try {
        // Convertir le canvas en blob PNG
        const blob = await new Promise(resolve => galaxyCanvas.toBlob(resolve, 'image/png'));

        // Télécharger localement
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `galaxy-view-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('📸 PNG exporté localement');

        // Sauvegarder dans la base de données via API
        await saveScreenshotToAPI(blob);
    } catch (e) {
        console.error('❌ Erreur export PNG:', e);
    }
}

async function saveScreenshotToAPI(blob) {
    try {
        // Convertir le blob en base64
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        // Envoyer à l'API N8N
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'saveScreenshot',
                user_id: window.currentUser?.id || 'maha',
                screenshot: base64,
                timestamp: new Date().toISOString(),
                nodes_count: galaxyNodes.length,
                connections_count: galaxyConnections.length
            })
        });

        if (response.ok) {
            console.log('💾 Screenshot sauvegardé en base de données');
        }
    } catch (e) {
        console.error('❌ Erreur sauvegarde screenshot:', e);
    }
}

// =============================================
// RENDU
// =============================================

function renderGalaxy() {
    if (!galaxyCtx || !galaxyCanvas) return;

    const ctx = galaxyCtx;
    const w = galaxyCanvas.width;
    const h = galaxyCanvas.height;
    const theme = GALAXY_THEMES[currentTheme];

    // Fond avec gradient atmosphérique
    const bgGradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);

    // Couleurs selon le thème
    if (theme.background === '#0a0a0f') {
        // Dark theme - Nuit étoilée
        bgGradient.addColorStop(0, '#1a1a2e');
        bgGradient.addColorStop(0.5, '#0f0f1e');
        bgGradient.addColorStop(1, '#050508');
    } else if (theme.background === '#1e1e1e') {
        // Obsidian
        bgGradient.addColorStop(0, '#2a2a2a');
        bgGradient.addColorStop(0.5, '#1e1e1e');
        bgGradient.addColorStop(1, '#121212');
    } else if (theme.background === '#faf8f3') {
        // Crème
        bgGradient.addColorStop(0, '#ffffff');
        bgGradient.addColorStop(0.5, '#faf8f3');
        bgGradient.addColorStop(1, '#f0ede5');
    } else {
        // Blanc
        bgGradient.addColorStop(0, '#ffffff');
        bgGradient.addColorStop(0.5, '#f8f9fa');
        bgGradient.addColorStop(1, '#e9ecef');
    }

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // Grid (optionnel)
    if (theme.grid) {
        drawGrid(ctx, w, h, theme.grid);
    }

    ctx.save();
    ctx.translate(panOffsetX, panOffsetY);
    ctx.scale(zoom, zoom);

    // Étoiles pour thème dark
    if (theme.stars) {
        drawStars(ctx);
    }

    // Connexions
    drawConnections(ctx);

    // Nœuds
    drawNodes(ctx, theme);

    ctx.restore();

    // Message d'aide si activé ou si vide
    if (showHelp || galaxyNodes.length === 0) {
        drawWelcomeMessage(ctx, w, h, theme);
    }

    // Connexion temporaire
    if (isCreatingConnection && connectionStart) {
        drawTemporaryConnection(ctx);
    }

    // Mini-map
    if (galaxyNodes.length > 0) {
        drawMiniMap(ctx, w, h, theme);
    }

    // Menu contextuel
    if (contextMenuPos) {
        drawContextMenu(ctx, contextMenuPos.screenX, contextMenuPos.screenY, theme);
    }

    requestAnimationFrame(renderGalaxy);
}

function drawGrid(ctx, w, h, color) {
    const gridSize = 50;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.15;

    // Lignes verticales
    for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }

    // Lignes horizontales
    for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // Points aux intersections pour effet plus élégant
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.25;
    for (let x = 0; x < w; x += gridSize) {
        for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.globalAlpha = 1;
}

function drawStars(ctx) {
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
    });
}

function drawConnections(ctx) {
    galaxyConnections.forEach(conn => {
        const fromNode = galaxyNodes.find(n => n.id === conn.from);
        const toNode = galaxyNodes.find(n => n.id === conn.to);

        if (fromNode && toNode) {
            // Style Excalidraw - ligne hand-drawn simple
            if (roughCanvas) {
                const options = {
                    roughness: 0.8,
                    strokeWidth: 2,
                    stroke: '#94a3b8' // Gris pour les connexions
                };

                roughCanvas.line(fromNode.x, fromNode.y, toNode.x, toNode.y, options);
            } else {
                // Fallback sans Rough.js
                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Flèche directionnelle à l'extrémité (simplified)
            const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
            const arrowSize = 10;

            // Point de la flèche
            const arrowX = toNode.x - Math.cos(angle) * (NODE_RADIUS * 0.7);
            const arrowY = toNode.y - Math.sin(angle) * (NODE_RADIUS * 0.7);

            ctx.save();
            ctx.translate(arrowX, arrowY);
            ctx.rotate(angle);

            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-arrowSize, -arrowSize / 2);
            ctx.lineTo(-arrowSize, arrowSize / 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    });
}

function drawNodes(ctx, theme) {
    galaxyNodes.forEach(node => {
        const isSelected = selectedNodes.includes(node);

        // Dispatch selon la forme
        if (node.shape === 'circle' || !node.shape) {
            drawCircleNode(ctx, theme, node, isSelected);
        } else if (node.shape === 'rect') {
            drawRectNode(ctx, theme, node, isSelected);
        } else if (node.shape === 'diamond') {
            drawDiamondNode(ctx, theme, node, isSelected);
        } else if (node.shape === 'text') {
            drawTextNode(ctx, theme, node, isSelected);
        }
    });
}

function drawCircleNode(ctx, theme, node, isSelected) {
    // Style Excalidraw - cercle hand-drawn avec Rough.js
    if (roughCanvas) {
        const options = {
            roughness: 0.8,
            strokeWidth: isSelected ? 3 : 2,
            stroke: node.color,
            fill: '#ffffff',
            fillStyle: 'solid'
        };

        roughCanvas.circle(node.x, node.y, NODE_RADIUS * 2, options);
    } else {
        // Fallback sans Rough.js
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
    }

    // Texte
    drawNodeText(ctx, theme, node, NODE_RADIUS * 1.6);
}

function drawRectNode(ctx, theme, node, isSelected) {
    const w = node.width || 120;
    const h = node.height || 80;
    const x = node.x - w / 2;
    const y = node.y - h / 2;

    // Style Excalidraw - rectangle hand-drawn avec Rough.js
    if (roughCanvas) {
        const options = {
            roughness: 0.8,
            strokeWidth: isSelected ? 3 : 2,
            stroke: node.color,
            fill: '#ffffff',
            fillStyle: 'solid'
        };

        roughCanvas.rectangle(x, y, w, h, options);
    } else {
        // Fallback sans Rough.js
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeRect(x, y, w, h);
    }

    // Texte
    drawNodeText(ctx, theme, node, w - 20);
}

function drawDiamondNode(ctx, theme, node, isSelected) {
    const size = NODE_RADIUS;

    // Style Excalidraw - losange hand-drawn avec Rough.js
    if (roughCanvas) {
        const options = {
            roughness: 0.8,
            strokeWidth: isSelected ? 3 : 2,
            stroke: node.color,
            fill: '#ffffff',
            fillStyle: 'solid'
        };

        // Polygon (losange)
        const points = [
            [node.x, node.y - size],
            [node.x + size, node.y],
            [node.x, node.y + size],
            [node.x - size, node.y]
        ];
        roughCanvas.polygon(points, options);
    } else {
        // Fallback sans Rough.js
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(node.x, node.y - size);
        ctx.lineTo(node.x + size, node.y);
        ctx.lineTo(node.x, node.y + size);
        ctx.lineTo(node.x - size, node.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
    }

    // Texte
    drawNodeText(ctx, theme, node, size * 1.4);
}

function drawTextNode(ctx, theme, node, isSelected) {
    // Texte libre sans forme
    ctx.save();
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Fond semi-transparent si sélectionné
    if (isSelected) {
        const metrics = ctx.measureText(node.text);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.fillRect(node.x - 5, node.y - 20, metrics.width + 10, 25);
    }

    ctx.fillStyle = theme.text;
    ctx.fillText(node.text, node.x, node.y - 15);
    ctx.restore();
}

function drawNodeText(ctx, theme, node, maxWidth) {
    // Style Excalidraw - texte simple sans ombre
    ctx.fillStyle = '#1e293b'; // Gris foncé pour meilleure lisibilité
    ctx.font = '600 14px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Texte multi-lignes
    const words = node.text.split(' ');
    let line = '';
    let lines = [];

    words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
            lines.push(line);
            line = word + ' ';
        } else {
            line = testLine;
        }
    });
    lines.push(line);

    const lineHeight = 18;
    const startY = node.y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
        ctx.fillText(line.trim(), node.x, startY + i * lineHeight);
    });

    ctx.shadowBlur = 0;
}

function drawTemporaryConnection(ctx) {
    ctx.beginPath();
    ctx.moveTo(connectionStart.x, connectionStart.y);
    ctx.lineTo(mouseX, mouseY);
    ctx.strokeStyle = 'rgba(100, 130, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawWelcomeMessage(ctx, w, h, theme) {
    const centerX = w / 2;
    const centerY = h / 2;

    // Fond semi-transparent
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, h);

    // Titre principal
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Bienvenue dans Galaxy View', centerX, centerY - 120);

    // Instructions
    ctx.font = '24px sans-serif';
    ctx.fillStyle = theme.text;
    ctx.globalAlpha = 0.9;

    const instructions = [
        '🖱️ Double-clic sur vide : Créer une bulle',
        '✏️ Double-clic sur bulle : Éditer le texte',
        '🎨 Shift + Clic : Sélectionner plusieurs bulles',
        '🖐️ Glisser bulle : Déplacer une bulle',
        '📋 Ctrl+C / Ctrl+V : Copier / Coller',
        '🗑️ Delete : Supprimer la sélection',
        '🔍 Molette : Zoom',
        '🖐️ Glisser fond : Déplacer la vue'
    ];

    instructions.forEach((instruction, i) => {
        ctx.fillText(instruction, centerX, centerY - 20 + i * 35);
    });

    // Message d'encouragement
    ctx.font = 'italic 20px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.globalAlpha = 0.8;
    ctx.fillText('👉 Double-clique n\'importe où pour créer ta première bulle !', centerX, centerY + 280);

    ctx.globalAlpha = 1;
}

function drawMiniMap(ctx, canvasW, canvasH, theme) {
    if (galaxyNodes.length === 0) return;

    const miniW = 200;
    const miniH = 150;
    const padding = 20;
    const x = canvasW - miniW - padding;
    const y = canvasH - miniH - padding;

    // Calculer la bounding box de tous les nodes
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    galaxyNodes.forEach(node => {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x);
        maxY = Math.max(maxY, node.y);
    });

    // Ajouter une marge
    const margin = 200;
    minX -= margin;
    minY -= margin;
    maxX += margin;
    maxY += margin;

    const worldW = maxX - minX;
    const worldH = maxY - minY;

    // Fond de la mini-map
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, miniW, miniH);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, miniW, miniH);

    // Dessiner les nodes en miniature
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, miniW, miniH);
    ctx.clip();

    galaxyNodes.forEach(node => {
        const miniX = x + ((node.x - minX) / worldW) * miniW;
        const miniY = y + ((node.y - minY) / worldH) * miniH;

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(miniX, miniY, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Rectangle de la vue actuelle
    const viewX = x + ((-panOffsetX / zoom - minX) / worldW) * miniW;
    const viewY = y + ((-panOffsetY / zoom - minY) / worldH) * miniH;
    const viewW = (canvasW / zoom / worldW) * miniW;
    const viewH = (canvasH / zoom / worldH) * miniH;

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewX, viewY, viewW, viewH);

    ctx.restore();
}

function drawContextMenu(ctx, x, y, theme) {
    const radius = 80;
    const btnRadius = 30;

    // Fond semi-transparent
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, radius + 20, 0, Math.PI * 2);
    ctx.fill();

    // Dessiner les options en cercle
    SHAPES.forEach((shape, i) => {
        const angle = (Math.PI * 2 / SHAPES.length) * i - Math.PI / 2;
        const btnX = x + Math.cos(angle) * radius;
        const btnY = y + Math.sin(angle) * radius;

        // Bouton
        ctx.fillStyle = 'rgba(40, 40, 50, 0.95)';
        ctx.beginPath();
        ctx.arc(btnX, btnY, btnRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bordure
        ctx.strokeStyle = COLORS[i % COLORS.length];
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icône
        ctx.fillStyle = theme.text;
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(shape.icon, btnX, btnY);

        // Label
        ctx.fillStyle = theme.text;
        ctx.font = '12px sans-serif';
        ctx.fillText(shape.name, btnX, btnY + btnRadius + 15);
    });

    // Centre "Annuler"
    ctx.fillStyle = 'rgba(60, 60, 70, 0.95)';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = theme.text;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✕', x, y);
}

function handleContextMenuClick(e) {
    if (!contextMenuPos) return;

    const rect = galaxyCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = contextMenuPos.screenX;
    const centerY = contextMenuPos.screenY;
    const radius = 80;
    const btnRadius = 30;

    // Vérifier clic sur bouton central (annuler)
    const distCenter = Math.hypot(clickX - centerX, clickY - centerY);
    if (distCenter <= 20) {
        contextMenuPos = null;
        return;
    }

    // Vérifier clic sur une option
    let selectedShape = null;
    SHAPES.forEach((shape, i) => {
        const angle = (Math.PI * 2 / SHAPES.length) * i - Math.PI / 2;
        const btnX = centerX + Math.cos(angle) * radius;
        const btnY = centerY + Math.sin(angle) * radius;

        const dist = Math.hypot(clickX - btnX, clickY - btnY);
        if (dist <= btnRadius) {
            selectedShape = shape.id;
        }
    });

    if (selectedShape) {
        // Créer un node avec la forme sélectionnée
        createNode(contextMenuPos.x, contextMenuPos.y, 'Nouvelle idée', COLORS[0], selectedShape);
        contextMenuPos = null;
    } else {
        // Clic en dehors = annuler
        contextMenuPos = null;
    }
}

// =============================================
// API N8N + POSTGRESQL
// =============================================

const API_URL = 'https://n8n.srv1053121.hstgr.cloud/webhook/galaxy';

async function loadFromAPI() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'get',
                user_id: window.currentUser?.id || 'maha'
            })
        });

        if (!response.ok) throw new Error('Erreur chargement API');

        const data = await response.json();

        // Charger les nodes
        if (data.nodes && Array.isArray(data.nodes)) {
            galaxyNodes = data.nodes.map(node => ({
                id: node.id,
                x: parseFloat(node.x),
                y: parseFloat(node.y),
                text: node.title || 'Sans titre',
                color: node.color || COLORS[0]
            }));
        }

        // Charger les connexions
        const connResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'getConnections',
                user_id: window.currentUser?.id || 'maha'
            })
        });

        if (connResponse.ok) {
            const connData = await connResponse.json();
            if (connData.connections && Array.isArray(connData.connections)) {
                galaxyConnections = connData.connections.map(conn => ({
                    id: conn.id,
                    from: conn.from_node,
                    to: conn.to_node
                }));
            }
        }

        console.log('📂 Chargé depuis API:', galaxyNodes.length, 'nœud(s),', galaxyConnections.length, 'connexion(s)');
    } catch (e) {
        console.error('❌ Erreur chargement API:', e);
        // Fallback localStorage en cas d'erreur
        loadFromLocalStorage();
    }
}

async function saveNodeToAPI(node, action = 'update') {
    try {
        const payload = {
            action: action,
            user_id: window.currentUser?.id || 'maha',
            title: node.text,
            description: '',
            x: node.x.toString(),
            y: node.y.toString(),
            color: node.color,
            status: 'active'
        };

        if (action === 'update' && node.id) {
            payload.id = node.id;
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erreur sauvegarde node');

        const data = await response.json();

        // Mettre à jour l'ID si c'est une création
        if (action === 'create' && data.id) {
            node.id = data.id;
        }

        console.log('💾 Node sauvegardé:', node.text);
    } catch (e) {
        console.error('❌ Erreur sauvegarde node:', e);
    }
}

async function deleteNodeFromAPI(nodeId) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                user_id: window.currentUser?.id || 'maha',
                id: nodeId
            })
        });
        console.log('🗑️ Node supprimé:', nodeId);
    } catch (e) {
        console.error('❌ Erreur suppression node:', e);
    }
}

async function saveConnectionToAPI(conn) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'connect',
                user_id: window.currentUser?.id || 'maha',
                from_node: conn.from,
                to_node: conn.to,
                style: 'default'
            })
        });

        const data = await response.json();
        if (data.id) {
            conn.id = data.id;
        }

        console.log('🔗 Connexion sauvegardée');
    } catch (e) {
        console.error('❌ Erreur sauvegarde connexion:', e);
    }
}

async function deleteConnectionFromAPI(fromNode, toNode) {
    try {
        // L'API devrait supporter une action deleteConnection
        // Pour l'instant on log juste
        console.log('🗑️ Connexion supprimée:', fromNode, '->', toNode);
    } catch (e) {
        console.error('❌ Erreur suppression connexion:', e);
    }
}

// Fallback localStorage (au cas où API fail)
function saveToLocalStorage() {
    const data = {
        nodes: galaxyNodes,
        connections: galaxyConnections,
        theme: currentTheme,
        zoom,
        panX: panOffsetX,
        panY: panOffsetY
    };
    localStorage.setItem('galaxyView', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('galaxyView');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        galaxyNodes = data.nodes || [];
        galaxyConnections = data.connections || [];
        currentTheme = data.theme || 'obsidian';
        zoom = data.zoom || 1;
        panOffsetX = data.panX || window.innerWidth / 2;
        panOffsetY = data.panY || window.innerHeight / 2;

        console.log('📂 Chargé (localStorage):', galaxyNodes.length, 'nœud(s)');
    } catch (e) {
        console.error('Erreur chargement:', e);
    }
}

// =============================================
// OUVERTURE / FERMETURE
// =============================================

function openGalaxyView() {
    const overlay = document.getElementById('galaxy-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        resizeGalaxyCanvas();
        console.log('🌌 Galaxy View ouverte');
    }
}

function closeGalaxyView() {
    const overlay = document.getElementById('galaxy-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        selectedNodes = [];
        console.log('🌌 Galaxy View fermée');
    }
}

function toggleHelp() {
    showHelp = !showHelp;
    console.log('ℹ️ Aide:', showHelp ? 'affichée' : 'masquée');
}

// =============================================
// EFFET DIVIN - PARTICULES DORÉES (conservé)
// =============================================

function initDivineParticles() {
    const iconContainer = document.getElementById('galaxy-icon');
    if (!iconContainer) return;

    let particleInterval = null;

    function createDivineParticle() {
        const particle = document.createElement('div');
        particle.className = 'divine-particle';

        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 10;
        const startX = Math.cos(angle) * distance;
        const startY = Math.sin(angle) * distance;

        const endX = Math.cos(angle) * (distance + 30);
        const endY = Math.sin(angle) * (distance + 30);

        particle.style.cssText = `
            position: absolute;
            width: ${2 + Math.random() * 3}px;
            height: ${2 + Math.random() * 3}px;
            background: radial-gradient(circle, rgba(255, 215, 0, ${0.8 + Math.random() * 0.2}), rgba(218, 165, 32, 0.4));
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(${startX}px, ${startY}px);
            pointer-events: none;
            z-index: 1;
            box-shadow: 0 0 4px rgba(255, 215, 0, 0.6);
        `;

        iconContainer.appendChild(particle);

        const duration = 1500 + Math.random() * 1000;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress < 1) {
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentX = startX + (endX - startX) * easeOut;
                const currentY = startY + (endY - startY) * easeOut;
                const opacity = 1 - progress;

                particle.style.transform = `translate(${currentX}px, ${currentY}px)`;
                particle.style.opacity = opacity;

                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        }

        requestAnimationFrame(animate);
    }

    iconContainer.addEventListener('mouseenter', () => {
        if (!particleInterval) {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => createDivineParticle(), i * 50);
            }
            particleInterval = setInterval(() => createDivineParticle(), 200);
        }
    });

    iconContainer.addEventListener('mouseleave', () => {
        if (particleInterval) {
            clearInterval(particleInterval);
            particleInterval = null;
        }
    });

    console.log('✨ Effet divin initialisé');
}

// =============================================
// EXPORT GLOBAL
// =============================================

window.openGalaxyView = openGalaxyView;
window.closeGalaxyView = closeGalaxyView;
window.initGalaxyView = initGalaxyView;
window.initDivineParticles = initDivineParticles;

console.log('📦 galaxy.js v2.0 loaded - Mind Mapping Edition');
