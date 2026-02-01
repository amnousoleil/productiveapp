/* =============================================
   GALAXY VIEW - Vue Révolutionnaire
   Canvas-based task visualization system
   ============================================= */

// ========== GALAXY VIEW STATE ==========
const GalaxyView = {
    // Canvas & rendering
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,

    // Camera (zoom/pan)
    camera: {
        x: 0,
        y: 0,
        zoom: 1,
        minZoom: 0.3,
        maxZoom: 3
    },

    // Interaction
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    selectedBubble: null,
    hoveredBubble: null,

    // Data
    bubbles: [],
    connections: [],
    pearls: [],

    // XP System
    xp: {
        current: 0,
        level: 1,
        levelThreshold: 100
    },

    // Animation
    animationFrame: null,
    particles: []
};

// ========== BUBBLE CLASS ==========
class GalaxyBubble {
    constructor(x, y, title, category = 'personal') {
        this.id = Date.now() + Math.random();
        this.x = x;
        this.y = y;
        this.title = title;
        this.category = category; // creative, professional, personal, important
        this.radius = 50;
        this.color = this.getCategoryColor();
        this.completed = false;
        this.children = []; // IDs of child bubbles (méduse system)
        this.parent = null; // ID of parent bubble
        this.velocity = { x: 0, y: 0 };
    }

    getCategoryColor() {
        const colors = {
            creative: '#60a5fa',    // Blue
            professional: '#4ade80', // Green
            personal: '#bf6bff',    // Purple
            important: '#fbbf24'    // Gold
        };
        return colors[this.category] || colors.personal;
    }

    draw(ctx, camera) {
        const screenX = (this.x - camera.x) * camera.zoom + GalaxyView.width / 2;
        const screenY = (this.y - camera.y) * camera.zoom + GalaxyView.height / 2;
        const screenRadius = this.radius * camera.zoom;

        // Glow effect
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, screenRadius * 1.5);
        gradient.addColorStop(0, this.color + '40');
        gradient.addColorStop(0.5, this.color + '20');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, screenRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Main bubble
        ctx.fillStyle = this.completed ? this.color + '80' : this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3 * camera.zoom;
        ctx.beginPath();
        ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Completion checkmark
        if (this.completed) {
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${20 * camera.zoom}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✓', screenX, screenY);
        }

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = `${14 * camera.zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Wrap text if too long
        const maxWidth = screenRadius * 1.6;
        const words = this.title.split(' ');
        let line = '';
        let y = this.completed ? screenY + screenRadius + 20 * camera.zoom : screenY;

        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, screenX, y);
                line = word + ' ';
                y += 18 * camera.zoom;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, screenX, y);
    }

    contains(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }

    update() {
        // Apply physics (optional - for smooth movement)
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.95;
    }
}

// ========== INITIALIZATION ==========
function initGalaxyView() {
    console.log('🌌 Initializing Galaxy View...');

    GalaxyView.canvas = document.getElementById('galaxy-canvas');
    GalaxyView.ctx = GalaxyView.canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load data from localStorage
    loadGalaxyData();

    // Event listeners
    setupEventListeners();

    // Start animation loop
    animate();

    console.log('✅ Galaxy View initialized');
}

function resizeCanvas() {
    const container = GalaxyView.canvas.parentElement;
    GalaxyView.width = container.clientWidth;
    GalaxyView.height = container.clientHeight;
    GalaxyView.canvas.width = GalaxyView.width;
    GalaxyView.canvas.height = GalaxyView.height;
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    const overlay = document.getElementById('galaxy-view-overlay');
    const openBtn = document.getElementById('galaxy-view-btn');
    const closeBtn = document.getElementById('galaxy-view-close');
    const canvas = GalaxyView.canvas;

    // Open/Close overlay
    openBtn.addEventListener('click', () => {
        overlay.classList.add('active');
        resizeCanvas();
    });

    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        saveGalaxyData();
    });

    // Zoom controls
    document.getElementById('galaxy-zoom-in').addEventListener('click', () => {
        zoomCamera(1.2);
    });

    document.getElementById('galaxy-zoom-out').addEventListener('click', () => {
        zoomCamera(0.8);
    });

    document.getElementById('galaxy-zoom-reset').addEventListener('click', () => {
        GalaxyView.camera.x = 0;
        GalaxyView.camera.y = 0;
        GalaxyView.camera.zoom = 1;
    });

    // Canvas interactions
    canvas.addEventListener('mousedown', onCanvasMouseDown);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseup', onCanvasMouseUp);
    canvas.addEventListener('wheel', onCanvasWheel);

    // Add bubble button
    document.getElementById('galaxy-add-bubble').addEventListener('click', () => {
        document.getElementById('galaxy-bubble-modal').classList.add('active');
    });

    // Create bubble modal
    document.getElementById('galaxy-bubble-create').addEventListener('click', createBubbleFromModal);
    document.getElementById('galaxy-bubble-cancel').addEventListener('click', () => {
        document.getElementById('galaxy-bubble-modal').classList.remove('active');
    });

    // View pearls
    document.getElementById('galaxy-view-pearls').addEventListener('click', showPearlNecklace);
    document.getElementById('pearl-section-close').addEventListener('click', hidePearlNecklace);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('active')) return;

        if (e.key === 'Escape') {
            overlay.classList.remove('active');
            saveGalaxyData();
        } else if (e.key === '+' || e.key === '=') {
            zoomCamera(1.2);
        } else if (e.key === '-') {
            zoomCamera(0.8);
        } else if (e.key === '0') {
            GalaxyView.camera.x = 0;
            GalaxyView.camera.y = 0;
            GalaxyView.camera.zoom = 1;
        }
    });
}

// ========== CANVAS INTERACTIONS ==========
function onCanvasMouseDown(e) {
    const rect = GalaxyView.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert to world coordinates
    const worldPos = screenToWorld(mouseX, mouseY);

    // Check if clicking on a bubble
    for (let i = GalaxyView.bubbles.length - 1; i >= 0; i--) {
        const bubble = GalaxyView.bubbles[i];
        if (bubble.contains(worldPos.x, worldPos.y)) {
            GalaxyView.selectedBubble = bubble;
            GalaxyView.dragStart = { x: worldPos.x - bubble.x, y: worldPos.y - bubble.y };
            return;
        }
    }

    // Start panning
    GalaxyView.isDragging = true;
    GalaxyView.dragStart = { x: mouseX, y: mouseY };
}

function onCanvasMouseMove(e) {
    const rect = GalaxyView.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldPos = screenToWorld(mouseX, mouseY);

    // Update hovered bubble
    GalaxyView.hoveredBubble = null;
    for (let bubble of GalaxyView.bubbles) {
        if (bubble.contains(worldPos.x, worldPos.y)) {
            GalaxyView.hoveredBubble = bubble;
            GalaxyView.canvas.style.cursor = 'pointer';
            break;
        }
    }
    if (!GalaxyView.hoveredBubble && !GalaxyView.isDragging) {
        GalaxyView.canvas.style.cursor = 'grab';
    }

    // Move selected bubble
    if (GalaxyView.selectedBubble) {
        GalaxyView.selectedBubble.x = worldPos.x - GalaxyView.dragStart.x;
        GalaxyView.selectedBubble.y = worldPos.y - GalaxyView.dragStart.y;
        GalaxyView.canvas.style.cursor = 'grabbing';
    }
    // Pan camera
    else if (GalaxyView.isDragging) {
        const dx = (mouseX - GalaxyView.dragStart.x) / GalaxyView.camera.zoom;
        const dy = (mouseY - GalaxyView.dragStart.y) / GalaxyView.camera.zoom;
        GalaxyView.camera.x -= dx;
        GalaxyView.camera.y -= dy;
        GalaxyView.dragStart = { x: mouseX, y: mouseY };
        GalaxyView.canvas.style.cursor = 'grabbing';
    }
}

function onCanvasMouseUp(e) {
    // Double-click to toggle completion
    if (GalaxyView.selectedBubble && e.detail === 2) {
        toggleBubbleCompletion(GalaxyView.selectedBubble);
    }

    GalaxyView.isDragging = false;
    GalaxyView.selectedBubble = null;
    GalaxyView.canvas.style.cursor = 'grab';
}

function onCanvasWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    zoomCamera(zoomFactor);
}

// ========== CAMERA FUNCTIONS ==========
function zoomCamera(factor) {
    GalaxyView.camera.zoom *= factor;
    GalaxyView.camera.zoom = Math.max(GalaxyView.camera.minZoom, Math.min(GalaxyView.camera.maxZoom, GalaxyView.camera.zoom));
}

function screenToWorld(screenX, screenY) {
    const worldX = (screenX - GalaxyView.width / 2) / GalaxyView.camera.zoom + GalaxyView.camera.x;
    const worldY = (screenY - GalaxyView.height / 2) / GalaxyView.camera.zoom + GalaxyView.camera.y;
    return { x: worldX, y: worldY };
}

// ========== BUBBLE MANAGEMENT ==========
function createBubbleFromModal() {
    const title = document.getElementById('galaxy-bubble-title').value.trim();
    const category = document.getElementById('galaxy-bubble-category').value;

    if (!title) {
        alert('Veuillez entrer un titre pour la bulle');
        return;
    }

    // Create bubble at center of view
    const bubble = new GalaxyBubble(
        GalaxyView.camera.x,
        GalaxyView.camera.y,
        title,
        category
    );

    GalaxyView.bubbles.push(bubble);

    // Clear modal
    document.getElementById('galaxy-bubble-title').value = '';
    document.getElementById('galaxy-bubble-modal').classList.remove('active');

    // Play sound
    playSound('bubble-create');

    saveGalaxyData();
}

function toggleBubbleCompletion(bubble) {
    bubble.completed = !bubble.completed;

    if (bubble.completed) {
        // Add to pearls
        GalaxyView.pearls.push({
            id: bubble.id,
            title: bubble.title,
            category: bubble.category,
            color: bubble.color,
            completedAt: new Date().toISOString()
        });

        // Add XP
        addXP(20);

        // Play victory sound
        playSound('victory');

        // Create celebration particles
        createCelebrationParticles(bubble.x, bubble.y);
    } else {
        // Remove from pearls
        GalaxyView.pearls = GalaxyView.pearls.filter(p => p.id !== bubble.id);
    }

    saveGalaxyData();
}

// ========== XP SYSTEM ==========
function addXP(amount) {
    GalaxyView.xp.current += amount;

    // Level up check
    while (GalaxyView.xp.current >= GalaxyView.xp.levelThreshold) {
        GalaxyView.xp.current -= GalaxyView.xp.levelThreshold;
        GalaxyView.xp.level++;
        GalaxyView.xp.levelThreshold = Math.floor(GalaxyView.xp.levelThreshold * 1.5);

        // Play level up sound
        playSound('levelup');

        // Show level up notification
        showLevelUpNotification();
    }

    updateXPDisplay();
}

function updateXPDisplay() {
    const xpBar = document.getElementById('galaxy-xp-bar');
    const xpLevel = document.getElementById('galaxy-xp-level');
    const xpPoints = document.getElementById('galaxy-xp-points');

    const percentage = (GalaxyView.xp.current / GalaxyView.xp.levelThreshold) * 100;
    xpBar.style.width = percentage + '%';
    xpLevel.textContent = `Niveau ${GalaxyView.xp.level}`;
    xpPoints.textContent = `${GalaxyView.xp.current} / ${GalaxyView.xp.levelThreshold} XP`;
}

function showLevelUpNotification() {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, var(--accent), var(--accent-light));
        color: var(--bg-primary);
        padding: 30px 50px;
        border-radius: 20px;
        font-size: 2rem;
        font-weight: 700;
        z-index: 10001;
        box-shadow: 0 10px 50px rgba(0,0,0,0.8), 0 0 60px var(--accent-glow);
        animation: levelUpPop 2s ease-in-out forwards;
    `;
    notification.textContent = `🎉 Niveau ${GalaxyView.xp.level} atteint! 🎉`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// ========== PEARL NECKLACE ==========
function showPearlNecklace() {
    const pearlSection = document.getElementById('galaxy-pearl-section');
    pearlSection.classList.add('active');

    // Draw pearl necklace
    renderPearlNecklace();
}

function hidePearlNecklace() {
    document.getElementById('galaxy-pearl-section').classList.remove('active');
}

function renderPearlNecklace() {
    const svg = document.getElementById('pearl-necklace-svg');
    svg.innerHTML = ''; // Clear previous

    if (GalaxyView.pearls.length === 0) {
        // Show empty state
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '50%');
        text.setAttribute('y', '50%');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#888');
        text.setAttribute('font-size', '24');
        text.textContent = 'Aucune victoire pour le moment... Complète des bulles pour créer ton collier!';
        svg.appendChild(text);
        return;
    }

    // SVG dimensions
    const width = svg.clientWidth || 1200;
    const height = svg.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Necklace curve parameters
    const pearlCount = GalaxyView.pearls.length;
    const angleStep = Math.PI / (pearlCount + 1);
    const radius = Math.min(width * 0.4, height * 0.6);

    // Draw necklace string
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let pathData = `M ${centerX - radius} ${centerY}`;

    for (let i = 0; i <= pearlCount + 1; i++) {
        const angle = Math.PI - i * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * 0.5 * Math.sin(angle);
        pathData += ` L ${x} ${y}`;
    }

    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(255,255,255,0.2)');
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);

    // Draw pearls
    GalaxyView.pearls.forEach((pearl, index) => {
        const angle = Math.PI - (index + 1) * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * 0.5 * Math.sin(angle);

        // Pearl glow
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', `pearl-gradient-${index}`);
        gradient.innerHTML = `
            <stop offset="0%" style="stop-color:${pearl.color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${pearl.color};stop-opacity:0.6" />
        `;
        defs.appendChild(gradient);
        svg.appendChild(defs);

        // Pearl circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 15);
        circle.setAttribute('fill', `url(#pearl-gradient-${index})`);
        circle.setAttribute('stroke', pearl.color);
        circle.setAttribute('stroke-width', '2');
        circle.style.cursor = 'pointer';
        circle.style.filter = `drop-shadow(0 0 10px ${pearl.color})`;

        // Add tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = pearl.title;
        circle.appendChild(title);

        svg.appendChild(circle);

        // Animate pearl entrance
        circle.style.animation = `pearlPop 0.5s ease-out ${index * 0.1}s both`;
    });
}

// ========== RENDERING ==========
function animate() {
    GalaxyView.animationFrame = requestAnimationFrame(animate);

    const ctx = GalaxyView.ctx;
    const camera = GalaxyView.camera;

    // Clear canvas
    ctx.clearRect(0, 0, GalaxyView.width, GalaxyView.height);

    // Draw background grid
    drawGrid();

    // Draw connections (méduse system)
    drawConnections();

    // Update and draw bubbles
    for (let bubble of GalaxyView.bubbles) {
        bubble.update();
        bubble.draw(ctx, camera);
    }

    // Draw particles
    updateParticles();
}

function drawGrid() {
    const ctx = GalaxyView.ctx;
    const camera = GalaxyView.camera;
    const gridSize = 100;

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;

    const startX = Math.floor((camera.x - GalaxyView.width / 2 / camera.zoom) / gridSize) * gridSize;
    const endX = Math.ceil((camera.x + GalaxyView.width / 2 / camera.zoom) / gridSize) * gridSize;
    const startY = Math.floor((camera.y - GalaxyView.height / 2 / camera.zoom) / gridSize) * gridSize;
    const endY = Math.ceil((camera.y + GalaxyView.height / 2 / camera.zoom) / gridSize) * gridSize;

    for (let x = startX; x <= endX; x += gridSize) {
        const screenX = (x - camera.x) * camera.zoom + GalaxyView.width / 2;
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, GalaxyView.height);
        ctx.stroke();
    }

    for (let y = startY; y <= endY; y += gridSize) {
        const screenY = (y - camera.y) * camera.zoom + GalaxyView.height / 2;
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(GalaxyView.width, screenY);
        ctx.stroke();
    }
}

function drawConnections() {
    const ctx = GalaxyView.ctx;
    const camera = GalaxyView.camera;

    for (let connection of GalaxyView.connections) {
        const bubble1 = GalaxyView.bubbles.find(b => b.id === connection.from);
        const bubble2 = GalaxyView.bubbles.find(b => b.id === connection.to);

        if (bubble1 && bubble2) {
            const x1 = (bubble1.x - camera.x) * camera.zoom + GalaxyView.width / 2;
            const y1 = (bubble1.y - camera.y) * camera.zoom + GalaxyView.height / 2;
            const x2 = (bubble2.x - camera.x) * camera.zoom + GalaxyView.width / 2;
            const y2 = (bubble2.y - camera.y) * camera.zoom + GalaxyView.height / 2;

            ctx.strokeStyle = bubble1.color + '60';
            ctx.lineWidth = 2 * camera.zoom;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
}

// ========== PARTICLES ==========
function createCelebrationParticles(x, y) {
    for (let i = 0; i < 30; i++) {
        GalaxyView.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
    }
}

function updateParticles() {
    const ctx = GalaxyView.ctx;
    const camera = GalaxyView.camera;

    for (let i = GalaxyView.particles.length - 1; i >= 0; i--) {
        const p = GalaxyView.particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity
        p.life -= 0.02;

        if (p.life <= 0) {
            GalaxyView.particles.splice(i, 1);
            continue;
        }

        const screenX = (p.x - camera.x) * camera.zoom + GalaxyView.width / 2;
        const screenY = (p.y - camera.y) * camera.zoom + GalaxyView.height / 2;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 3 * camera.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ========== SOUND EFFECTS ==========
function playSound(type) {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'bubble-create') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'victory') {
        // Happy ascending tone
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'levelup') {
        // Triumphant chord
        [523, 659, 784].forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.5);
            osc.start(audioContext.currentTime + i * 0.1);
            osc.stop(audioContext.currentTime + i * 0.1 + 0.5);
        });
    }
}

// ========== DATA PERSISTENCE ==========
function saveGalaxyData() {
    const data = {
        bubbles: GalaxyView.bubbles.map(b => ({
            id: b.id,
            x: b.x,
            y: b.y,
            title: b.title,
            category: b.category,
            completed: b.completed,
            children: b.children,
            parent: b.parent
        })),
        connections: GalaxyView.connections,
        pearls: GalaxyView.pearls,
        xp: GalaxyView.xp,
        camera: GalaxyView.camera
    };

    localStorage.setItem('galaxyViewData', JSON.stringify(data));
    console.log('💾 Galaxy View data saved');
}

function loadGalaxyData() {
    const saved = localStorage.getItem('galaxyViewData');
    if (!saved) {
        console.log('No saved Galaxy View data found, starting fresh');
        createDemoBubbles();
        updateXPDisplay();
        return;
    }

    try {
        const data = JSON.parse(saved);

        // Restore bubbles
        GalaxyView.bubbles = data.bubbles.map(b => {
            const bubble = new GalaxyBubble(b.x, b.y, b.title, b.category);
            bubble.id = b.id;
            bubble.completed = b.completed;
            bubble.children = b.children || [];
            bubble.parent = b.parent || null;
            return bubble;
        });

        // Restore connections
        GalaxyView.connections = data.connections || [];

        // Restore pearls
        GalaxyView.pearls = data.pearls || [];

        // Restore XP
        if (data.xp) {
            GalaxyView.xp = data.xp;
        }

        // Restore camera
        if (data.camera) {
            GalaxyView.camera = data.camera;
        }

        updateXPDisplay();
        console.log('✅ Galaxy View data loaded');
    } catch (error) {
        console.error('Error loading Galaxy View data:', error);
        createDemoBubbles();
    }
}

function createDemoBubbles() {
    // Create some demo bubbles for first-time users
    const demoBubbles = [
        { x: 0, y: -150, title: 'Bienvenue dans Galaxy View!', category: 'important' },
        { x: -200, y: 0, title: 'Crée tes tâches', category: 'creative' },
        { x: 200, y: 0, title: 'Organise ton travail', category: 'professional' },
        { x: 0, y: 150, title: 'Double-clic pour terminer', category: 'personal' }
    ];

    demoBubbles.forEach(demo => {
        const bubble = new GalaxyBubble(demo.x, demo.y, demo.title, demo.category);
        GalaxyView.bubbles.push(bubble);
    });
}

// ========== INITIALIZATION ==========
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalaxyView);
} else {
    initGalaxyView();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes levelUpPop {
        0% { transform: translate(-50%, -50%) scale(0); }
        50% { transform: translate(-50%, -50%) scale(1.2); }
        70% { transform: translate(-50%, -50%) scale(0.9); }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }

    @keyframes pearlPop {
        0% { transform: scale(0); }
        60% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);
