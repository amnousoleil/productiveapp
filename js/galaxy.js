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
let currentTheme = 'obsidian';
let showHelp = false;

// === CONSTANTES ===
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_SPEED = 0.1;
const NODE_RADIUS = 60;
const CONNECTION_THRESHOLD = 20;

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

// === COULEURS DISPONIBLES ===
const COLORS = [
    '#e07840', // Desert orange
    '#00ff66', // Matrix green
    '#6482ff', // Midnight blue
    '#bf6bff', // Fantasy purple
    '#ff6b9d', // Bubblegum pink
    '#fbbf24', // Golden yellow
    '#10b981', // Emerald
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#06b6d4'  // Cyan
];

// === ÉTOILES (pour thème dark) ===
const stars = [];

// =============================================
// INITIALISATION
// =============================================

function initGalaxyView() {
    console.log('🌌 Initialisation Galaxy View v2.0...');

    createGalaxyOverlay();
    generateStars();
    setupGalaxyEvents();
    loadFromLocalStorage();
    requestAnimationFrame(renderGalaxy);

    console.log('✅ Galaxy View v2.0 initialisée');
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
            <div class="galaxy-color-palette"></div>
            <div class="galaxy-theme-selector"></div>
        </div>
        <div class="galaxy-toolbar-right">
            <button class="galaxy-tool-btn" id="galaxy-clear-btn" title="Tout effacer">🗑️</button>
            <button class="galaxy-tool-btn" id="galaxy-export-btn" title="Exporter">💾</button>
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

    resizeGalaxyCanvas();
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

function renderColorPalette() {
    const palette = document.querySelector('.galaxy-color-palette');
    if (!palette) return;

    palette.innerHTML = COLORS.map(color => `
        <button class="color-btn" style="background: ${color}" data-color="${color}" title="Couleur"></button>
    `).join('');

    palette.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            selectedNodes.forEach(node => {
                node.color = color;
            });
            saveToLocalStorage();
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
            saveToLocalStorage();
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
    const helpBtn = document.getElementById('galaxy-help-btn');

    closeBtn.addEventListener('click', closeGalaxyView);
    clearBtn.addEventListener('click', clearAllNodes);
    exportBtn.addEventListener('click', exportToJSON);
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

function handleKeyDown(e) {
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
        deleteSelectedNodes();
    }

    // Ctrl+C - Copier
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        copySelectedNodes();
    }

    // Ctrl+V - Coller
    if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        pasteNodes();
    }

    // Ctrl+D - Dupliquer
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        duplicateSelectedNodes();
    }

    // Ctrl+A - Tout sélectionner
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        selectedNodes = [...galaxyNodes];
    }
}

function handleCanvasMouseDown(e) {
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
        saveToLocalStorage();
    } else if (isPanning) {
        panOffsetX = e.clientX - dragStartX;
        panOffsetY = e.clientY - dragStartY;
    }
}

function handleCanvasMouseUp(e) {
    if (isCreatingConnection && connectionStart) {
        const rect = galaxyCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - panOffsetX) / zoom;
        const y = (e.clientY - rect.top - panOffsetY) / zoom;

        const targetNode = getNodeAt(x, y);

        if (targetNode && targetNode !== connectionStart) {
            createConnection(connectionStart, targetNode);
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
    // Désactivé - Utiliser double-clic à la place
}

function handleCanvasDoubleClick(e) {
    const rect = galaxyCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffsetX) / zoom;
    const y = (e.clientY - rect.top - panOffsetY) / zoom;

    const node = getNodeAt(x, y);
    if (node) {
        // Double-clic sur une bulle = éditer le texte
        editNodeText(node);
    } else {
        // Double-clic sur vide = créer une bulle (comme Miro)
        createNode(x, y, 'Nouvelle idée');
    }
}

// =============================================
// LOGIQUE MÉTIER
// =============================================

function createNode(x, y, text = 'Nouvelle idée', color = COLORS[0]) {
    const node = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x,
        y,
        text,
        color
    };

    galaxyNodes.push(node);
    selectedNodes = [node];
    saveToLocalStorage();

    console.log('✨ Nœud créé:', node.text);
    return node;
}

function createConnection(nodeA, nodeB) {
    const exists = galaxyConnections.some(c =>
        (c.from === nodeA.id && c.to === nodeB.id) ||
        (c.from === nodeB.id && c.to === nodeA.id)
    );

    if (!exists) {
        galaxyConnections.push({
            id: `conn-${Date.now()}`,
            from: nodeA.id,
            to: nodeB.id
        });
        saveToLocalStorage();
        console.log('🔗 Connexion créée');
    }
}

function getNodeAt(x, y) {
    for (let i = galaxyNodes.length - 1; i >= 0; i--) {
        const node = galaxyNodes[i];
        const dist = Math.hypot(x - node.x, y - node.y);

        if (dist <= NODE_RADIUS) {
            return node;
        }
    }
    return null;
}

function editNodeText(node) {
    const newText = prompt('✏️ Modifier le texte:', node.text);
    if (newText !== null && newText.trim()) {
        node.text = newText.trim();
        saveToLocalStorage();
    }
}

function deleteSelectedNodes() {
    if (selectedNodes.length === 0) return;

    selectedNodes.forEach(node => {
        galaxyNodes = galaxyNodes.filter(n => n.id !== node.id);
        galaxyConnections = galaxyConnections.filter(c =>
            c.from !== node.id && c.to !== node.id
        );
    });

    selectedNodes = [];
    saveToLocalStorage();
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

function pasteNodes() {
    if (!clipboard || clipboard.length === 0) return;

    selectedNodes = [];
    clipboard.forEach((data, i) => {
        const node = createNode(
            mouseX + i * 30,
            mouseY + i * 30,
            data.text,
            data.color
        );
        selectedNodes.push(node);
    });

    console.log('📌 Collé:', clipboard.length, 'nœud(s)');
}

function duplicateSelectedNodes() {
    if (selectedNodes.length === 0) return;

    copySelectedNodes();
    pasteNodes();
}

function clearAllNodes() {
    if (!confirm('🗑️ Effacer toutes les bulles ?')) return;

    galaxyNodes = [];
    galaxyConnections = [];
    selectedNodes = [];
    saveToLocalStorage();
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
    console.log('💾 Exporté');
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
            // Glow de la connexion
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(100, 130, 255, 0.6)';

            // Ligne principale avec gradient
            const gradient = ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y);
            gradient.addColorStop(0, fromNode.color + 'aa');
            gradient.addColorStop(0.5, 'rgba(100, 130, 255, 0.5)');
            gradient.addColorStop(1, toNode.color + 'aa');

            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.shadowBlur = 0;
        }
    });
}

function drawNodes(ctx, theme) {
    galaxyNodes.forEach(node => {
        const isSelected = selectedNodes.includes(node);

        // Glow externe (plus prononcé)
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, NODE_RADIUS + 25);
        glowGradient.addColorStop(0, node.color + 'cc');
        glowGradient.addColorStop(0.3, node.color + '66');
        glowGradient.addColorStop(1, node.color + '00');

        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS + 25, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Ombre portée
        ctx.shadowColor = node.color + '99';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;

        // Fond glassmorphism avec gradient
        const bgGradient = ctx.createRadialGradient(
            node.x - NODE_RADIUS * 0.3,
            node.y - NODE_RADIUS * 0.3,
            0,
            node.x,
            node.y,
            NODE_RADIUS
        );

        const isDark = theme.background === '#0a0a0f' || theme.background === '#1e1e1e';
        if (isDark) {
            bgGradient.addColorStop(0, 'rgba(40, 40, 50, 0.95)');
            bgGradient.addColorStop(1, 'rgba(20, 20, 30, 0.9)');
        } else {
            bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
            bgGradient.addColorStop(1, 'rgba(245, 245, 250, 0.95)');
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = bgGradient;
        ctx.fill();

        // Bordure avec gradient
        const borderGradient = ctx.createLinearGradient(
            node.x - NODE_RADIUS,
            node.y - NODE_RADIUS,
            node.x + NODE_RADIUS,
            node.y + NODE_RADIUS
        );
        borderGradient.addColorStop(0, node.color);
        borderGradient.addColorStop(0.5, node.color + 'dd');
        borderGradient.addColorStop(1, node.color);

        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = isSelected ? 5 : 3;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Reflet glassmorphism (shine)
        const shineGradient = ctx.createRadialGradient(
            node.x - NODE_RADIUS * 0.4,
            node.y - NODE_RADIUS * 0.4,
            0,
            node.x,
            node.y,
            NODE_RADIUS
        );
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = shineGradient;
        ctx.fill();

        // Texte avec ombre
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.fillStyle = theme.text;
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Texte multi-lignes si trop long
        const maxWidth = NODE_RADIUS * 1.6;
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
    });
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

// =============================================
// PERSISTANCE LOCAL STORAGE
// =============================================

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

        console.log('📂 Chargé:', galaxyNodes.length, 'nœud(s)');
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
