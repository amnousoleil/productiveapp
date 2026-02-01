// =============================================
// PRODUCTIVEAPP - GALAXY.JS v1.0
// Galaxy View - Vue spatiale des tâches
// =============================================

// === STATE ===
let galaxyCanvas = null;
let galaxyCtx = null;
let galaxyNodes = [];
let galaxyConnections = [];
let selectedNode = null;
let isDragging = false;
let isPanning = false;
let dragStartX = 0;
let dragStartY = 0;
let panOffsetX = 0;
let panOffsetY = 0;
let zoom = 1;
let isCreatingConnection = false;
let connectionStart = null;
let mouseX = 0;
let mouseY = 0;

// === CONSTANTES ===
const STAR_COUNT = 200;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_SPEED = 0.1;
const NODE_RADIUS = 60;
const CONNECTION_THRESHOLD = 20; // Distance pour détecter le bord d'une bulle

// === ÉTOILES ===
const stars = [];

// =============================================
// INITIALISATION
// =============================================

function initGalaxyView() {
    console.log('🌌 Initialisation Galaxy View...');

    // Créer l'overlay
    createGalaxyOverlay();

    // Générer les étoiles
    generateStars();

    // Event listeners
    setupGalaxyEvents();

    // Animation loop
    requestAnimationFrame(renderGalaxy);

    console.log('✅ Galaxy View initialisée');
}

function createGalaxyOverlay() {
    // Créer le conteneur overlay
    const overlay = document.createElement('div');
    overlay.id = 'galaxy-overlay';
    overlay.className = 'galaxy-overlay hidden';

    // Créer le bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.id = 'galaxy-close-btn';
    closeBtn.className = 'galaxy-close-btn';
    closeBtn.innerHTML = '✕';
    closeBtn.title = 'Fermer Galaxy View (Échap)';

    // Créer le canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'galaxy-canvas';
    canvas.className = 'galaxy-canvas';

    // Assembler
    overlay.appendChild(closeBtn);
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    // Références
    galaxyCanvas = canvas;
    galaxyCtx = canvas.getContext('2d');

    // Redimensionner le canvas
    resizeGalaxyCanvas();
}

function resizeGalaxyCanvas() {
    if (!galaxyCanvas) return;

    galaxyCanvas.width = window.innerWidth;
    galaxyCanvas.height = window.innerHeight;
}

function generateStars() {
    stars.length = 0;

    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * 4000 - 2000,
            y: Math.random() * 4000 - 2000,
            radius: Math.random() * 1.5 + 0.3,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

// =============================================
// ÉVÉNEMENTS
// =============================================

function setupGalaxyEvents() {
    const overlay = document.getElementById('galaxy-overlay');
    const closeBtn = document.getElementById('galaxy-close-btn');

    // Fermeture
    closeBtn.addEventListener('click', closeGalaxyView);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeGalaxyView();
        }
    });

    // Canvas events
    galaxyCanvas.addEventListener('mousedown', handleCanvasMouseDown);
    galaxyCanvas.addEventListener('mousemove', handleCanvasMouseMove);
    galaxyCanvas.addEventListener('mouseup', handleCanvasMouseUp);
    galaxyCanvas.addEventListener('wheel', handleCanvasWheel);
    galaxyCanvas.addEventListener('contextmenu', handleCanvasRightClick);

    // Resize
    window.addEventListener('resize', resizeGalaxyCanvas);
}

function handleCanvasMouseDown(e) {
    const rect = galaxyCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffsetX) / zoom;
    const y = (e.clientY - rect.top - panOffsetY) / zoom;

    // Vérifier si on clique sur un nœud
    const node = getNodeAt(x, y);

    if (node) {
        // Vérifier si on clique sur le bord (pour créer une connexion)
        const dist = Math.hypot(x - node.x, y - node.y);

        if (dist > NODE_RADIUS - CONNECTION_THRESHOLD) {
            // Démarrer création de connexion
            isCreatingConnection = true;
            connectionStart = node;
        } else {
            // Drag du nœud
            isDragging = true;
            selectedNode = node;
            dragStartX = x - node.x;
            dragStartY = y - node.y;
        }
    } else {
        // Pan du canvas
        isPanning = true;
        dragStartX = e.clientX - panOffsetX;
        dragStartY = e.clientY - panOffsetY;
    }
}

function handleCanvasMouseMove(e) {
    const rect = galaxyCanvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left - panOffsetX) / zoom;
    mouseY = (e.clientY - rect.top - panOffsetY) / zoom;

    if (isDragging && selectedNode) {
        // Drag du nœud
        selectedNode.x = mouseX - dragStartX;
        selectedNode.y = mouseY - dragStartY;
    } else if (isPanning) {
        // Pan du canvas
        panOffsetX = e.clientX - dragStartX;
        panOffsetY = e.clientY - dragStartY;
    }
}

function handleCanvasMouseUp(e) {
    if (isCreatingConnection && connectionStart) {
        // Vérifier si on termine sur un autre nœud
        const rect = galaxyCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - panOffsetX) / zoom;
        const y = (e.clientY - rect.top - panOffsetY) / zoom;

        const targetNode = getNodeAt(x, y);

        if (targetNode && targetNode !== connectionStart) {
            // Créer la connexion
            createConnection(connectionStart, targetNode);
        }
    }

    isDragging = false;
    isPanning = false;
    isCreatingConnection = false;
    selectedNode = null;
    connectionStart = null;
}

function handleCanvasWheel(e) {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));

    // Zoom vers la position de la souris
    const rect = galaxyCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const oldZoom = zoom;
    zoom = newZoom;

    // Ajuster le pan pour zoomer vers la souris
    panOffsetX = mouseX - (mouseX - panOffsetX) * (zoom / oldZoom);
    panOffsetY = mouseY - (mouseY - panOffsetY) * (zoom / oldZoom);
}

function handleCanvasRightClick(e) {
    e.preventDefault();

    const rect = galaxyCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffsetX) / zoom;
    const y = (e.clientY - rect.top - panOffsetY) / zoom;

    // Créer un nouveau nœud
    createNode(x, y, 'Nouvelle idée');
}

// =============================================
// LOGIQUE MÉTIER
// =============================================

function createNode(x, y, text = 'Nouvelle idée') {
    const node = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x,
        y,
        text,
        color: getRandomNodeColor()
    };

    galaxyNodes.push(node);
    console.log('✨ Nœud créé:', node.text);
    return node;
}

function createConnection(nodeA, nodeB) {
    // Vérifier si la connexion existe déjà
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
        console.log('🔗 Connexion créée:', nodeA.text, '→', nodeB.text);
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

function getRandomNodeColor() {
    const colors = [
        '#e07840', // Desert
        '#00ff66', // Matrix
        '#6482ff', // Midnight
        '#bf6bff', // Fantasy
        '#ff6b9d'  // Bubblegum
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// =============================================
// RENDU
// =============================================

function renderGalaxy() {
    if (!galaxyCtx || !galaxyCanvas) return;

    const ctx = galaxyCtx;
    const w = galaxyCanvas.width;
    const h = galaxyCanvas.height;

    // Fond noir spatial
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // Appliquer transformations
    ctx.save();
    ctx.translate(panOffsetX, panOffsetY);
    ctx.scale(zoom, zoom);

    // Dessiner les étoiles
    drawStars(ctx);

    // Dessiner les connexions
    drawConnections(ctx);

    // Dessiner les nœuds
    drawNodes(ctx);

    // Dessiner la connexion en cours de création
    if (isCreatingConnection && connectionStart) {
        drawTemporaryConnection(ctx);
    }

    ctx.restore();

    // Boucle d'animation
    requestAnimationFrame(renderGalaxy);
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
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.strokeStyle = 'rgba(100, 130, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function drawNodes(ctx) {
    galaxyNodes.forEach(node => {
        // Cercle extérieur (glow)
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, NODE_RADIUS + 10);
        gradient.addColorStop(0, node.color + '80');
        gradient.addColorStop(1, node.color + '00');

        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS + 10, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Cercle principal
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Texte
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.text, node.x, node.y);
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
        console.log('🌌 Galaxy View fermée');
    }
}

// =============================================
// EXPORT GLOBAL
// =============================================

window.openGalaxyView = openGalaxyView;
window.closeGalaxyView = closeGalaxyView;
window.initGalaxyView = initGalaxyView;

console.log('📦 galaxy.js v1.0 loaded');
