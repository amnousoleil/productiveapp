// ═══════════════════════════════════════════════════════════════════
// GALAXY VIEW COSMIC v3.0 - "L'Univers Vivant"
// Inspiré par une intelligence supérieure pour créer un bijou cosmique
// ═══════════════════════════════════════════════════════════════════

'use strict';

// ═══════════════════════════════════════════════════════════════════
// ÉTAT COSMIQUE
// ═══════════════════════════════════════════════════════════════════

const CosmicState = {
    // Canvas & Contexte
    canvas: null,
    ctx: null,
    bgCanvas: null,  // Canvas de fond pour optimisation
    bgCtx: null,

    // Éléments cosmiques
    nodes: [],           // Pensées cristallisées
    connections: [],     // Flux d'énergie
    strokes: [],         // Traits de feutre (dessin libre)
    particles: [],       // Particules cosmiques
    nebulae: [],        // Nébuleuses génératives

    // Interaction
    selectedNodes: new Set(),
    clipboard: null,
    currentTool: 'circle',  // circle par défaut pour dessin immédiat
    currentColor: '#60a5fa', // Couleur de dessin par défaut
    penWidth: 4,             // Épaisseur feutre (1-20)

    // Transformation spatiale
    camera: {
        x: 0,
        y: 0,
        zoom: 1,
        targetZoom: 1
    },

    // Temporalité
    timeline: {
        snapshots: [],
        currentIndex: -1,
        autoSaveTimer: null
    },

    // État d'interaction
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0, down: false },
    interaction: {
        isDragging: false,
        isPanning: false,
        isSelecting: false,
        lassoPoints: [],
        dragStart: { x: 0, y: 0 }
    },

    // IA Copilote
    ai: {
        suggestions: [],
        autoCluster: false,
        patterns: []
    },

    // Visibilité connexions (toggle Orbites)
    showConnections: true,

    // Préférences
    prefs: {
        showParticles: true,
        showNebulae: true,
        particleDensity: 0.5,
        uiOpacity: 0.8,
        zenMode: false,
        breathingIntensity: 0.3
    }
};

// ═══════════════════════════════════════════════════════════════════
// PRINCIPE #1 : FOND COSMIQUE VIVANT
// ═══════════════════════════════════════════════════════════════════

// Presets de skins pour le fond cosmique
const COSMIC_SKINS = {
    night: {
        bg: '#0a0a0f',
        particle: [200, 210, 255],
        starColors: ['#a8c0ff', '#ffffff'],
        nebulae: [
            ['#1a0a3a', '#4a1a7a', '#2a0a5a'],
            ['#0a1a3a', '#1a4a7a', '#0a2a5a'],
            ['#3a0a1a', '#7a1a4a', '#5a0a2a']
        ]
    },
    desert: {
        bg: '#f5f0e8',
        particle: [210, 185, 120],
        starColors: ['#d4af37', '#c9a84c'],
        nebulae: [
            ['#e8d4a0', '#d4b878', '#c9a84c'],
            ['#dcc898', '#c8a86c', '#b89860'],
            ['#f0deb0', '#e0c890', '#d0b878'],
            ['#e4d0a8', '#d0b480', '#c0a468'],
            ['#ecdcc0', '#d8c098', '#c8b080']
        ]
    }
};

class CosmicBackground {
    constructor() {
        this.particles = [];
        this.nebulae = [];
        this.stars = [];
        this.skin = localStorage.getItem('galaxy-skin') || 'night';
        this.initParticles();
        this.initNebulae();
        this.initStars();
    }

    get colors() { return COSMIC_SKINS[this.skin]; }

    setSkin(name) {
        if (!COSMIC_SKINS[name]) return;
        this.skin = name;
        localStorage.setItem('galaxy-skin', name);
        const view = document.getElementById('view-galaxy');
        if (view) view.dataset.galaxySkin = name;
        // Re-assign nebula colors to match skin
        const cols = this.colors.nebulae;
        this.nebulae.forEach((n, i) => { n.colors = cols[i % cols.length]; });
    }

    toggleSkin() {
        this.setSkin(this.skin === 'night' ? 'desert' : 'night');
    }

    initParticles() {
        const density = 0.0005;
        const area = window.innerWidth * window.innerHeight;
        const count = Math.floor(area * density * CosmicState.prefs.particleDensity);

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth * 2 - window.innerWidth / 2,
                y: Math.random() * window.innerHeight * 2 - window.innerHeight / 2,
                z: Math.random() * 1000,
                size: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                opacity: Math.random() * 0.5 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }

        // Desert sand ribbons — 3 depth layers across full screen height
        this.silkThreads = [];
        const w = window.innerWidth, h = window.innerHeight;
        // Pale/light golds for far, warm/amber for close
        // 9 threads: interleave far/mid/close, assign uniform Y slots
        const defs = [
            // [thick, opacity, blur, drift, amp, color]  — watercolor mist: high blur, low opacity
            { thick: [25, 40], op: [0.025, 0.04], blur: [16, 24], drift: [0.04, 0.08], amp: [25, 55], col: [184, 140, 60] },
            { thick: [3, 5],   op: [0.015, 0.025], blur: [6, 10], drift: [0.15, 0.25], amp: [10, 25], col: [230, 215, 160] },
            { thick: [10, 16], op: [0.02, 0.035], blur: [10, 16], drift: [0.08, 0.15], amp: [20, 40], col: [212, 175, 55] },
            { thick: [3, 5],   op: [0.015, 0.025], blur: [6, 10], drift: [0.15, 0.25], amp: [10, 25], col: [220, 205, 150] },
            { thick: [25, 40], op: [0.025, 0.04], blur: [16, 24], drift: [0.04, 0.08], amp: [25, 55], col: [175, 130, 50] },
            { thick: [10, 16], op: [0.02, 0.035], blur: [10, 16], drift: [0.08, 0.15], amp: [20, 40], col: [200, 168, 76] },
            { thick: [3, 5],   op: [0.015, 0.025], blur: [6, 10], drift: [0.15, 0.25], amp: [10, 25], col: [235, 220, 170] },
            { thick: [10, 16], op: [0.02, 0.035], blur: [10, 16], drift: [0.08, 0.15], amp: [20, 40], col: [192, 164, 80] },
            { thick: [25, 40], op: [0.025, 0.04], blur: [16, 24], drift: [0.04, 0.08], amp: [25, 55], col: [190, 150, 70] },
        ];
        defs.forEach((d, i) => {
            const partial = Math.random() > 0.5;
            const startX = partial ? Math.random() * w * 0.3 : -100;
            const endX = partial ? startX + w * (0.5 + Math.random() * 0.3) : w + 100;
            // Uniform Y: divide screen into 9 equal slots
            const baseY = h * ((i + 0.5) / 9);
            this.silkThreads.push({
                startX, endX, baseY, color: d.col,
                thickness: d.thick[0] + Math.random() * (d.thick[1] - d.thick[0]),
                opacity: d.op[0] + Math.random() * (d.op[1] - d.op[0]),
                blur: d.blur[0] + Math.random() * (d.blur[1] - d.blur[0]),
                waveAmp: d.amp[0] + Math.random() * (d.amp[1] - d.amp[0]),
                waveFreq: 0.002 + Math.random() * 0.003,
                wavePhase: Math.random() * Math.PI * 2,
                waveSpeed: 0.003 + Math.random() * 0.005,
                driftSpeed: d.drift[0] + Math.random() * (d.drift[1] - d.drift[0]),
                driftOffset: 0,
                breathPhase: Math.random() * Math.PI * 2,
                breathSpeed: 0.0008 + Math.random() * 0.001,
                breathAmp: 5 + Math.random() * 15,
            });
        });
    }

    initNebulae() {
        const cols = this.colors.nebulae;
        const isDesert = this.skin === 'desert';
        const count = isDesert ? 8 : 5;
        for (let i = 0; i < count; i++) {
            const colorSet = cols[i % cols.length];
            this.nebulae.push({
                x: Math.random() * window.innerWidth * 2 - window.innerWidth / 2,
                y: Math.random() * window.innerHeight * 2 - window.innerHeight / 2,
                radius: isDesert ? (Math.random() * 400 + 300) : (Math.random() * 300 + 200),
                colors: colorSet,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * (isDesert ? 0.0003 : 0.001),
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: isDesert ? (Math.random() * 0.001 + 0.0005) : (Math.random() * 0.005 + 0.002)
            });
        }
    }

    initStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth * 2 - window.innerWidth / 2,
                y: Math.random() * window.innerHeight * 2 - window.innerHeight / 2,
                size: Math.random() * 3 + 1,
                brightness: Math.random(),
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                colorIndex: Math.random() > 0.7 ? 0 : 1
            });
        }
    }

    render(ctx, camera, deltaTime) {
        const { x: camX, y: camY, zoom } = camera;
        const c = this.colors;
        const [pr, pg, pb] = c.particle;

        // Fond
        const isDesert = this.skin === 'desert';
        ctx.fillStyle = c.bg;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Nébuleuses (night only — desert uses silk threads only)
        if (CosmicState.prefs.showNebulae && !isDesert) {
            this.nebulae.forEach(nebula => {
                nebula.rotation += nebula.rotationSpeed;
                nebula.pulsePhase += nebula.pulseSpeed;
                const pulse = Math.sin(nebula.pulsePhase) * 0.2 + 1;
                const screenX = (nebula.x - camX) * zoom * 0.3 + ctx.canvas.width / 2;
                const screenY = (nebula.y - camY) * zoom * 0.3 + ctx.canvas.height / 2;
                const screenRadius = nebula.radius * zoom * 0.3 * pulse;
                const gradient = ctx.createRadialGradient(
                    screenX, screenY, 0, screenX, screenY, screenRadius
                );
                const nAlpha = isDesert ? ['25', '12', '00'] : ['40', '20', '00'];
                gradient.addColorStop(0, nebula.colors[0] + nAlpha[0]);
                gradient.addColorStop(0.5, nebula.colors[1] + nAlpha[1]);
                gradient.addColorStop(1, nebula.colors[2] + nAlpha[2]);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            });
        }

        // Desert silk threads — fine golden sinusoidal curves
        if (isDesert && CosmicState.prefs.showParticles && this.silkThreads) {
            const cw = ctx.canvas.width;
            this.silkThreads.forEach(t => {
                t.wavePhase += t.waveSpeed;
                t.breathPhase += t.breathSpeed;
                t.driftOffset += t.driftSpeed;

                const [cr, cg, cb] = t.color;
                const breathY = Math.sin(t.breathPhase) * t.breathAmp;
                const step = 6;  // px per segment — smooth enough

                // Build path once, stroke multiple times for soft edges (no ctx.filter)
                const grad = ctx.createLinearGradient(t.startX, 0, t.endX, 0);
                grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0)`);
                grad.addColorStop(0.12, `rgba(${cr}, ${cg}, ${cb}, ${t.opacity})`);
                grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${t.opacity})`);
                grad.addColorStop(0.88, `rgba(${cr}, ${cg}, ${cb}, ${t.opacity})`);
                grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Build path
                const path = new Path2D();
                for (let x = t.startX; x <= t.endX; x += step) {
                    const xShifted = x - t.driftOffset;
                    const wave = Math.sin(xShifted * t.waveFreq + t.wavePhase) * t.waveAmp;
                    const y = t.baseY + wave + breathY;
                    if (x === t.startX) path.moveTo(x, y);
                    else path.lineTo(x, y);
                }

                // Watercolor wash: wide uniform passes, no concentrated core
                const b = t.blur;
                ctx.strokeStyle = grad;
                ctx.globalAlpha = 0.04;
                ctx.lineWidth = t.thickness + b * 16;
                ctx.stroke(path);
                ctx.globalAlpha = 0.035;
                ctx.lineWidth = t.thickness + b * 9;
                ctx.stroke(path);
                ctx.globalAlpha = 0.025;
                ctx.lineWidth = t.thickness + b * 4;
                ctx.stroke(path);
            });
        }

        // Night particles (stars/dust)
        if (!isDesert && CosmicState.prefs.showParticles) {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.opacity = 0.3 + Math.sin(Date.now() * p.twinkleSpeed) * 0.3;
                const depth = 1 - p.z / 1000;
                const screenX = (p.x - camX) * zoom * depth + ctx.canvas.width / 2;
                const screenY = (p.y - camY) * zoom * depth + ctx.canvas.height / 2;
                const screenSize = p.size * zoom * depth;
                if (screenX > -10 && screenX < ctx.canvas.width + 10 &&
                    screenY > -10 && screenY < ctx.canvas.height + 10) {
                    const alpha = p.opacity * depth;
                    ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // Étoiles (night skin only)
        if (!isDesert) {
            this.stars.forEach(star => {
                star.twinklePhase += star.twinkleSpeed;
                const brightness = 0.5 + Math.sin(star.twinklePhase) * 0.5;
                const screenX = (star.x - camX) * zoom + ctx.canvas.width / 2;
                const screenY = (star.y - camY) * zoom + ctx.canvas.height / 2;
                if (screenX > -10 && screenX < ctx.canvas.width + 10 &&
                    screenY > -10 && screenY < ctx.canvas.height + 10) {
                    const sColor = c.starColors[star.colorIndex];
                    ctx.fillStyle = sColor;
                    ctx.globalAlpha = brightness;
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, star.size * zoom, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 10 * zoom;
                    ctx.shadowColor = sColor;
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, star.size * zoom * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1;
                }
            });
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// PRINCIPE #2 : SYSTÈME GESTUEL D'INTENTIONS
// ═══════════════════════════════════════════════════════════════════

class IntentionSystem {
    constructor() {
        this.intentHistory = [];
        this.clickCount = 0;
        this.clickTimer = null;
        this.holdTimer = null;
        this.holdStart = null;
    }

    // Détecte l'intention de l'utilisateur
    detectIntent(event, state) {
        const intent = {
            type: null,
            position: { x: state.mouse.worldX, y: state.mouse.worldY },
            timestamp: Date.now()
        };

        // Double-clic = Créer une pensée (bulle)
        if (event.type === 'dblclick') {
            intent.type = 'CREATE_THOUGHT';
            intent.shape = 'circle';
            return intent;
        }

        // Maintien (hold) = Déployer une forme
        if (event.type === 'mousedown') {
            this.holdStart = Date.now();
            this.holdTimer = setTimeout(() => {
                if (state.mouse.down) {
                    intent.type = 'DEPLOY_SHAPE';
                    this.triggerIntent(intent);
                }
            }, 500); // 500ms pour détecter un hold
        }

        if (event.type === 'mouseup') {
            clearTimeout(this.holdTimer);
            const holdDuration = Date.now() - (this.holdStart || Date.now());

            // Hold court = sélection
            if (holdDuration < 500) {
                intent.type = 'SELECT';
            }
        }

        // Glisser = Créer un flux (connexion)
        if (event.type === 'mousemove' && state.mouse.down) {
            const dragDist = Math.hypot(
                state.mouse.x - state.interaction.dragStart.x,
                state.mouse.y - state.interaction.dragStart.y
            );

            if (dragDist > 20 && state.selectedNodes.size > 0) {
                intent.type = 'CREATE_FLOW';
            }
        }

        return intent;
    }

    triggerIntent(intent) {
        console.log('🧠 Intention détectée:', intent.type);

        switch (intent.type) {
            case 'CREATE_THOUGHT':
                this.createThought(intent.position);
                break;
            case 'DEPLOY_SHAPE':
                this.deployShape(intent.position);
                break;
            case 'CREATE_FLOW':
                this.createFlow();
                break;
        }

        this.intentHistory.push(intent);
    }

    createThought(pos) {
        const node = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: 'thought',
            shape: 'circle',
            x: pos.x,
            y: pos.y,
            radius: 60,
            color: '#60a5fa',
            text: '',
            createdAt: Date.now(),
            breathing: true,
            glowIntensity: 1
        };

        CosmicState.nodes.push(node);

        // Animation d'apparition
        this.animateNodeBirth(node);

        // Activer l'édition de texte
        setTimeout(() => this.startTextEdit(node), 100);
    }

    deployShape(pos) {
        // Forme qui se déploie depuis un point
        const shapes = ['circle', 'rect', 'diamond', 'hexagon', 'star'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        const node = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: 'shape',
            shape: shape,
            x: pos.x,
            y: pos.y,
            radius: 0,
            targetRadius: 80,
            color: this.getRandomCosmicColor(),
            text: '',
            createdAt: Date.now(),
            deploying: true
        };

        CosmicState.nodes.push(node);
        this.animateShapeDeployment(node);
    }

    createFlow() {
        // Créer connexion entre nœuds sélectionnés
        // TODO: Implémenter
    }

    animateNodeBirth(node) {
        const startTime = Date.now();
        const duration = 600;

        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);

            node.radius = 60 * easeOut;
            node.glowIntensity = 2 - progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                node.breathing = true;
            }
        }

        animate();
    }

    animateShapeDeployment(node) {
        const startTime = Date.now();
        const duration = 800;

        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);

            node.radius = node.targetRadius * easeOut;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                node.deploying = false;
            }
        }

        animate();
    }

    getRandomCosmicColor() {
        const colors = [
            '#60a5fa', // Bleu ciel
            '#a78bfa', // Violet
            '#f472b6', // Rose
            '#34d399', // Vert émeraude
            '#fbbf24', // Or
            '#f87171', // Rouge corail
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    startTextEdit(node) {
        // TODO: Créer input temporaire pour éditer texte
    }
}

// ═══════════════════════════════════════════════════════════════════
// PRINCIPE #8 : MICRO-ANIMATIONS DE VIE
// ═══════════════════════════════════════════════════════════════════

class LifeAnimations {
    static renderBreathing(ctx, node, time) {
        if (!node.breathing) return;

        const breathPhase = Math.sin(time * 0.001 + node.createdAt * 0.001) * 0.5 + 0.5;
        const breathIntensity = CosmicState.prefs.breathingIntensity;
        const scale = 1 + breathPhase * 0.05 * breathIntensity;

        return scale;
    }

    static renderGlow(ctx, node, time) {
        const age = Date.now() - node.createdAt;
        const isNew = age < 5000; // 5 secondes

        if (isNew || node.glowIntensity > 0) {
            const glow = isNew ? 1 - age / 5000 : node.glowIntensity;

            ctx.shadowBlur = 20 * glow;
            ctx.shadowColor = node.color;

            return glow;
        }

        return 0;
    }

    static renderFloat(ctx, node, time) {
        // Léger mouvement de flottement
        const floatX = Math.sin(time * 0.0005 + node.id.charCodeAt(0)) * 2;
        const floatY = Math.cos(time * 0.0007 + node.id.charCodeAt(1)) * 2;

        return { x: floatX, y: floatY };
    }
}

// ═══════════════════════════════════════════════════════════════════
// MOTEUR DE RENDU PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

class CosmicRenderer {
    constructor() {
        this.background = new CosmicBackground();
        this.lastFrameTime = Date.now();
        // Offscreen canvas for cached background (perf: heavy blur runs every N frames)
        this._bgCache = document.createElement('canvas');
        this._bgCacheCtx = this._bgCache.getContext('2d');
        this._bgFrame = 0;
    }

    render() {
        const now = Date.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        const ctx = CosmicState.ctx;
        const camera = CosmicState.camera;
        const cw = ctx.canvas.width, ch = ctx.canvas.height;

        // Sync offscreen size
        if (this._bgCache.width !== cw || this._bgCache.height !== ch) {
            this._bgCache.width = cw;
            this._bgCache.height = ch;
            this._bgFrame = 0; // force re-render on resize
        }

        // Freeze background completely during shape drawing (perf)
        const isDrawing = window.CosmicShapeInteraction &&
            (window.CosmicShapeInteraction.isDrawing || window.CosmicShapeInteraction.isDraggingNode || window.CosmicShapeInteraction.isResizing);
        if (!isDrawing && this._bgFrame % 4 === 0) {
            this.background.render(this._bgCacheCtx, camera, deltaTime);
        }
        this._bgFrame++;

        // Blit cached background
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(this._bgCache, 0, 0);

        // Skip grid + connections during active drawing (perf)
        // But keep connections during resize so they follow in real-time
        const isResizingOnly = window.CosmicShapeInteraction && window.CosmicShapeInteraction.isResizing;
        if (!isDrawing || isResizingOnly) {
            this.renderGrid(ctx, camera);
            if (CosmicState.showConnections) this.renderConnections(ctx, camera, now);
        }

        // Traits de feutre (dessin libre)
        this.renderStrokes(ctx, camera);

        // Nœuds (pensées cristallisées)
        this.renderNodes(ctx, camera, now);

        // Resize handles (Miro-style)
        this.renderResizeHandles(ctx, camera);

        // Preview forme en cours de dessin
        if (window.renderShapePreview) {
            window.renderShapePreview(ctx, camera);
        }

        // Preview text zone during drag
        if (window.renderTextPreview) {
            window.renderTextPreview(ctx, camera);
        }

        // Marquee selection rectangle
        if (window.renderMarqueeRect) {
            window.renderMarqueeRect(ctx, camera);
        }

        // UI Fantôme
        if (!CosmicState.prefs.zenMode) {
            this.renderUI(ctx, now);
        }

        // Floating text toolbar (positioned over canvas via DOM)
        if (window.TextToolbar) window.TextToolbar.update();

        // Boucle
        requestAnimationFrame(() => this.render());
    }

    renderGrid(ctx, camera) {
        const gridSize = 50;
        const { x: camX, y: camY, zoom } = camera;

        ctx.strokeStyle = 'rgba(100, 120, 150, 0.1)';
        ctx.lineWidth = 1;

        const startX = Math.floor((camX - ctx.canvas.width / 2 / zoom) / gridSize) * gridSize;
        const startY = Math.floor((camY - ctx.canvas.height / 2 / zoom) / gridSize) * gridSize;

        for (let x = startX; x < camX + ctx.canvas.width / 2 / zoom; x += gridSize) {
            const screenX = (x - camX) * zoom + ctx.canvas.width / 2;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, ctx.canvas.height);
            ctx.stroke();
        }

        for (let y = startY; y < camY + ctx.canvas.height / 2 / zoom; y += gridSize) {
            const screenY = (y - camY) * zoom + ctx.canvas.height / 2;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(ctx.canvas.width, screenY);
            ctx.stroke();
        }
    }

    renderStrokes(ctx, camera) {
        const { x: camX, y: camY, zoom } = camera;
        const all = CosmicState.strokes.slice();
        // Include live stroke being drawn
        const si = window.CosmicShapeInteraction;
        if (si && si._penStroke && si._penStroke.points.length > 1) all.push(si._penStroke);
        all.forEach(s => {
            if (s.points.length < 2) return;
            ctx.save();
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.width * zoom;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath();
            const p0 = s.points[0];
            ctx.moveTo((p0.x - camX) * zoom + ctx.canvas.width / 2,
                       (p0.y - camY) * zoom + ctx.canvas.height / 2);
            for (let i = 1; i < s.points.length - 1; i++) {
                const p = s.points[i], pn = s.points[i + 1];
                const cx = ((p.x + pn.x) / 2 - camX) * zoom + ctx.canvas.width / 2;
                const cy = ((p.y + pn.y) / 2 - camY) * zoom + ctx.canvas.height / 2;
                const px = (p.x - camX) * zoom + ctx.canvas.width / 2;
                const py = (p.y - camY) * zoom + ctx.canvas.height / 2;
                ctx.quadraticCurveTo(px, py, cx, cy);
            }
            const pl = s.points[s.points.length - 1];
            ctx.lineTo((pl.x - camX) * zoom + ctx.canvas.width / 2,
                       (pl.y - camY) * zoom + ctx.canvas.height / 2);
            ctx.stroke();
            ctx.restore();
        });
    }

    // Edge anchor: compute point on node border closest to target (tx,ty) in world coords
    // Ray from origin at angle → intersection with polygon boundary
    _polyEdge(angle, verts) {
        const cx = Math.cos(angle), cy = Math.sin(angle);
        const n = verts.length;
        let bestT = Infinity, bx = cx, by = cy;
        for (let i = 0; i < n; i++) {
            const v1 = verts[i], v2 = verts[(i + 1) % n];
            const edx = v2.x - v1.x, edy = v2.y - v1.y;
            const denom = edx * cy - edy * cx;
            if (Math.abs(denom) < 1e-10) continue;
            const s = (v1.y * cx - v1.x * cy) / denom;
            if (s < -1e-6 || s > 1 + 1e-6) continue;
            const t = Math.abs(cx) > 1e-6
                ? (v1.x + s * edx) / cx
                : (v1.y + s * edy) / cy;
            if (t > 1e-6 && t < bestT) { bestT = t; bx = v1.x + s * edx; by = v1.y + s * edy; }
        }
        return { x: bx, y: by };
    }

    _edgeAnchor(node, tx, ty, zoom) {
        const dx = tx - node.x, dy = ty - node.y;
        const angle = Math.atan2(dy, dx);
        const r = node.radius;
        let ex, ey;
        if (node.shape === 'rect') {
            const hw = node.width ? node.width / 2 : r * 0.8;
            const hh = node.height ? node.height / 2 : r * 0.6;
            const absCos = Math.abs(Math.cos(angle)), absSin = Math.abs(Math.sin(angle));
            const scale = Math.min(hw / (absCos || 1e-6), hh / (absSin || 1e-6));
            ex = Math.cos(angle) * scale;
            ey = Math.sin(angle) * scale;
        } else if (node.shape === 'diamond') {
            const absCos = Math.abs(Math.cos(angle)), absSin = Math.abs(Math.sin(angle));
            const scale = r / (absCos + absSin || 1);
            ex = Math.cos(angle) * scale;
            ey = Math.sin(angle) * scale;
        } else if (node.shape === 'hexagon') {
            const verts = [];
            for (let i = 0; i < 6; i++) {
                const a = (Math.PI / 3) * i - Math.PI / 2;
                verts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
            }
            const pt = this._polyEdge(angle, verts);
            ex = pt.x; ey = pt.y;
        } else if (node.shape === 'star') {
            const verts = [];
            for (let i = 0; i < 10; i++) {
                const a = (Math.PI / 5) * i - Math.PI / 2;
                const d = i % 2 === 0 ? r : r * 0.4;
                verts.push({ x: Math.cos(a) * d, y: Math.sin(a) * d });
            }
            const pt = this._polyEdge(angle, verts);
            ex = pt.x; ey = pt.y;
        } else {
            // circle
            ex = Math.cos(angle) * r;
            ey = Math.sin(angle) * r;
        }
        return { x: ex, y: ey };
    }

    renderConnections(ctx, camera, time) {
        const { x: camX, y: camY, zoom } = camera;
        const hw = ctx.canvas.width / 2, hh = ctx.canvas.height / 2;
        const desert = this.background.skin === 'desert';
        const lineColor = desert ? '#000000' : '#ffffff';
        const hoverColor = desert ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)';
        const prevCol = desert ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
        const nodeMap = {};
        CosmicState.nodes.forEach(n => { nodeMap[n.id] = n; });

        // Anti-aliasing (enabled by default on canvas, ensure not disabled)
        ctx.imageSmoothingEnabled = true;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const ARROW = 8;
        const mouseX = CosmicState.mouse.x, mouseY = CosmicState.mouse.y;

        // Detect hovered connection (10px tolerance)
        let hoveredIdx = -1;
        const HOVER_DIST = 10;

        CosmicState.connections.forEach((conn, idx) => {
            const from = nodeMap[conn.fromId], to = nodeMap[conn.toId];
            if (!from || !to) return;

            // Edge anchors (world coords offset from node center)
            const ea1 = this._edgeAnchor(from, to.x, to.y, zoom);
            const ea2 = this._edgeAnchor(to, from.x, from.y, zoom);
            const x1 = (from.x + ea1.x - camX) * zoom + hw;
            const y1 = (from.y + ea1.y - camY) * zoom + hh;
            const x2 = (to.x + ea2.x - camX) * zoom + hw;
            const y2 = (to.y + ea2.y - camY) * zoom + hh;

            // Bézier control points — curvature scales with distance, flat when close
            const dx = x2 - x1, dy = y2 - y1;
            const dist = Math.hypot(dx, dy) || 1;
            const curve = Math.min(dist * 0.12, 60); // cap curvature
            const absDx = Math.abs(dx), absDy = Math.abs(dy);
            let cpx1, cpy1, cpx2, cpy2;
            if (absDx >= absDy) {
                cpx1 = x1 + dx * 0.33; cpy1 = y1 - curve;
                cpx2 = x1 + dx * 0.66; cpy2 = y2 - curve;
            } else {
                cpx1 = x1 + curve; cpy1 = y1 + dy * 0.33;
                cpx2 = x2 + curve; cpy2 = y1 + dy * 0.66;
            }

            // Hover detection: sample 10 points on bezier, check min distance to mouse
            if (hoveredIdx < 0) {
                for (let t = 0; t <= 1; t += 0.1) {
                    const it = 1 - t;
                    const bx = it*it*it*x1 + 3*it*it*t*cpx1 + 3*it*t*t*cpx2 + t*t*t*x2;
                    const by = it*it*it*y1 + 3*it*it*t*cpy1 + 3*it*t*t*cpy2 + t*t*t*y2;
                    if (Math.hypot(bx - mouseX, by - mouseY) < HOVER_DIST) {
                        hoveredIdx = idx; break;
                    }
                }
            }

            // Store computed data for drawing pass
            conn._draw = { x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2 };
        });

        // Store for external use (cursor change etc.)
        CosmicState._hoveredConnIdx = hoveredIdx;

        // Draw pass
        CosmicState.connections.forEach((conn, idx) => {
            if (!conn._draw) return;
            const { x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2 } = conn._draw;
            const hovered = idx === hoveredIdx;
            const selected = CosmicState._selectedConnId === conn.id;

            ctx.strokeStyle = selected ? '#4A90D9' : hovered ? hoverColor : lineColor;
            ctx.lineWidth = selected ? 3 : hovered ? 2.5 : 1.5;

            // Curve
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
            ctx.stroke();

            // Arrow at destination, following tangent at t=1: 3*(P3-P2)
            const tx = 3 * (x2 - cpx2), ty = 3 * (y2 - cpy2);
            const tLen = Math.hypot(tx, ty) || 1;
            const ux = tx / tLen, uy = ty / tLen;
            const px = -uy, py = ux;
            ctx.fillStyle = selected ? '#4A90D9' : hovered ? hoverColor : lineColor;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - ux * ARROW + px * ARROW * 0.4, y2 - uy * ARROW + py * ARROW * 0.4);
            ctx.lineTo(x2 - ux * ARROW - px * ARROW * 0.4, y2 - uy * ARROW - py * ARROW * 0.4);
            ctx.closePath();
            ctx.fill();

            conn._draw = null; // free
        });

        // Preview line from pending connector to mouse
        const si = window.CosmicShapeInteraction;
        if (si && si.pendingConnFrom && CosmicState.currentTool === 'connector') {
            const from = si.pendingConnFrom;
            const ea = this._edgeAnchor(from, (mouseX - hw) / zoom + camX, (mouseY - hh) / zoom + camY, zoom);
            const fx = (from.x + ea.x - camX) * zoom + hw;
            const fy = (from.y + ea.y - camY) * zoom + hh;
            const mx = mouseX, my = mouseY;
            const pdx = mx - fx, pdy = my - fy;
            const pDist = Math.hypot(pdx, pdy) || 1;
            const pCurve = Math.min(pDist * 0.12, 60);
            ctx.beginPath(); ctx.moveTo(fx, fy);
            if (Math.abs(pdx) >= Math.abs(pdy)) {
                ctx.bezierCurveTo(fx + pdx * 0.33, fy - pCurve, fx + pdx * 0.66, my - pCurve, mx, my);
            } else {
                ctx.bezierCurveTo(fx + pCurve, fy + pdy * 0.33, mx + pCurve, fy + pdy * 0.66, mx, my);
            }
            ctx.strokeStyle = prevCol; ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);
        }
    }

    renderNodes(ctx, camera, time) {
        const { x: camX, y: camY, zoom } = camera;

        CosmicState.nodes.forEach(node => {
            // Position à l'écran
            const screenX = (node.x - camX) * zoom + ctx.canvas.width / 2;
            const screenY = (node.y - camY) * zoom + ctx.canvas.height / 2;

            // Culling (ne pas dessiner hors écran)
            const margin = 200;
            if (screenX < -margin || screenX > ctx.canvas.width + margin ||
                screenY < -margin || screenY > ctx.canvas.height + margin) {
                return;
            }

            ctx.save();
            ctx.translate(screenX, screenY);

            // Dessiner la forme — flat fill + simple stroke, with node opacity
            const radius = node.radius * zoom;
            const nodeOpacity = node.opacity != null ? node.opacity : 1;
            ctx.globalAlpha = nodeOpacity;

            // Text nodes with custom dimensions: draw custom rect path
            const isTextBox = node.isTextNode && node.textBoxWidth;
            const pathFn = window.CosmicShapes && window.CosmicShapes[node.shape];
            if (isTextBox) {
                const tw = node.textBoxWidth * zoom;
                const th = node.textBoxHeight * zoom;
                ctx.beginPath();
                ctx.rect(-tw / 2, -th / 2, tw, th);
            } else if (pathFn) {
                pathFn(ctx, radius, node.shape === 'rect' ? node : undefined);
            }
            if (isTextBox || pathFn) {
                // Text nodes: skip fill/stroke (invisible shape)
                if (!node.isTextNode) {
                    ctx.fillStyle = node.color;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                // Selection highlight at full opacity
                if (CosmicState.selectedNodes.has(node)) {
                    ctx.globalAlpha = 1;
                    ctx.strokeStyle = '#fbbf24';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([6, 3]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Reset opacity for text (always fully visible)
            ctx.globalAlpha = 1;

            // Texte (word-wrap + vertical clamp) — skip during inline editing
            if (node.text && !node._editing) {
                const fs = Math.max(4, (node.fontSize || 14) * zoom);
                ctx.fillStyle = node.textColor || '#ffffff';
                ctx.font = `${fs}px "Segoe UI", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const maxW = (node.isTextNode && node.textBoxWidth) ? node.textBoxWidth * zoom * 0.95
                           : (node.shape === 'rect' && node.width) ? node.width * zoom * 0.85
                           : node.isTextNode ? radius * 2.5
                           : radius * 1.4;
                const words = node.text.split(' ');
                const lines = [];
                let line = '';
                for (const word of words) {
                    const test = line ? line + ' ' + word : word;
                    if (ctx.measureText(test).width > maxW && line) {
                        lines.push(line);
                        line = word;
                    } else {
                        line = test;
                    }
                }
                if (line) lines.push(line);
                const lh = fs * 1.25;
                // Vertical clamp: limit lines to fit inside shape
                const maxH = (node.isTextNode && node.textBoxHeight) ? node.textBoxHeight * zoom * 0.95
                           : (node.shape === 'rect' && node.height) ? node.height * zoom * 0.85
                           : (node.shape === 'rect') ? radius * zoom * 1.0
                           : radius * zoom * 1.6;
                const maxLines = Math.max(1, Math.floor(maxH / lh));
                if (lines.length > maxLines) {
                    lines.length = maxLines;
                    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*$/, '') + '…';
                }
                const startY = -(lines.length - 1) * lh / 2;
                lines.forEach((l, i) => ctx.fillText(l, 0, startY + i * lh));
            }

            // Padlock icon on locked nodes
            if (node.locked) {
                const sz = Math.max(12, 14 * zoom);
                const px = radius * 0.6;
                const py = radius * 0.5;
                ctx.font = `${sz}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillText('🔒', px + 1, py + 1);
                ctx.fillStyle = '#ffffff';
                ctx.fillText('🔒', px, py);
            }

            ctx.restore();
        });
    }

    renderResizeHandles(ctx, camera) {
        if (CosmicState.selectedNodes.size !== 1) return;
        const node = CosmicState.selectedNodes.values().next().value;
        if (node.locked) return;
        if (!window.getResizeHandles) return;

        const handles = window.getResizeHandles(node, camera, ctx.canvas.width, ctx.canvas.height);
        const si = window.CosmicShapeInteraction;
        const activeId = (si && si.isResizing) ? si.resizeHandle : null;
        const isDark = !(this.background && this.background.skin === 'desert');

        ctx.save();
        handles.forEach(h => {
            const sz = 5; // half-size
            ctx.fillStyle = (h.id === activeId) ? '#fbbf24' : '#ffffff';
            ctx.fillRect(h.sx - sz, h.sy - sz, sz * 2, sz * 2);
            ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.8)';
            ctx.lineWidth = 1;
            ctx.strokeRect(h.sx - sz, h.sy - sz, sz * 2, sz * 2);
        });
        ctx.restore();
    }

    renderSelection(ctx) {
        // TODO: Lasso organique
    }

    renderUI(ctx, time) {
        // TODO: UI fantôme contextuelle
    }
}

// ═══════════════════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════════════════

let _cosmicInitialized = false;

function initGalaxyCosmic() {
    // Guard: never init twice (prevents duplicate render loops + event listeners)
    if (_cosmicInitialized) {
        console.log('🌌 Galaxy Cosmic already initialized, skipping');
        return;
    }

    console.log('🌌 Galaxy Cosmic v3.0 - Initialisation...');

    const canvas = document.getElementById('galaxy-canvas');
    if (!canvas) {
        console.error('Canvas #galaxy-canvas introuvable');
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    CosmicState.canvas = canvas;
    CosmicState.ctx = canvas.getContext('2d');
    CosmicState.camera.x = 0;
    CosmicState.camera.y = 0;

    setupEventListeners();

    const renderer = new CosmicRenderer();
    renderer.render();
    renderer.background.setSkin(renderer.background.skin);
    window.GalaxyCosmic._renderer = renderer;
    window.IntentionSystem = new IntentionSystem();

    // Pause matrix background animation while Galaxy View is open
    if (window.AnimEngine) window.AnimEngine.setIntensity(0);

    _cosmicInitialized = true;
    if (window.CosmicHistory) window.CosmicHistory.save(); // initial snapshot
    console.log('✨ Galaxy Cosmic initialisée');

    // Projets Cosmic: init géré par auto-init dans galaxy-cosmic-projects-ui.js
}

function setupEventListeners() {
    const canvas = CosmicState.canvas;

    // Mouse move
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        // Scale CSS pixels → internal canvas pixels (fixes offset when display size ≠ resolution)
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        CosmicState.mouse.x = (e.clientX - rect.left) * scaleX;
        CosmicState.mouse.y = (e.clientY - rect.top) * scaleY;

        // Conversion en coordonnées monde
        const { x: camX, y: camY, zoom } = CosmicState.camera;
        CosmicState.mouse.worldX = (CosmicState.mouse.x - canvas.width / 2) / zoom + camX;
        CosmicState.mouse.worldY = (CosmicState.mouse.y - canvas.height / 2) / zoom + camY;

        // Resize handle cursor (only when not dragging)
        if (!CosmicState.mouse.down && CosmicState.selectedNodes.size === 1 && window.hitTestHandle) {
            const selNode = CosmicState.selectedNodes.values().next().value;
            const h = window.hitTestHandle(selNode, CosmicState.mouse.x, CosmicState.mouse.y,
                CosmicState.camera, canvas.width, canvas.height);
            canvas.style.cursor = h ? h.cursor : '';
        }

        if (window.CosmicShapeInteraction && window.CosmicShapeInteraction.onMouseMove(e)) return;
        if (window.IntentionSystem) {
            window.IntentionSystem.detectIntent(e, CosmicState);
        }
    });

    // Double-clic : Créer pensée
    canvas.addEventListener('dblclick', (e) => {
        // Double-click on existing node → edit text
        const node = typeof getNodeAtWorld === 'function' ? getNodeAtWorld(CosmicState.mouse.worldX, CosmicState.mouse.worldY) : null;
        if (node && window.RadialMenu) {
            window.RadialMenu.targetNode = node;
            window.RadialMenu.editText();
            return;
        }
        if (window.IntentionSystem) {
            const intent = window.IntentionSystem.detectIntent(e, CosmicState);
            if (intent) window.IntentionSystem.triggerIntent(intent);
        }
    });

    // Mouse down/up
    canvas.addEventListener('mousedown', (e) => {
        // Update coords so drawOrigin is fresh on first click
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        CosmicState.mouse.x = (e.clientX - rect.left) * scaleX;
        CosmicState.mouse.y = (e.clientY - rect.top) * scaleY;
        const { x: camX, y: camY, zoom } = CosmicState.camera;
        CosmicState.mouse.worldX = (CosmicState.mouse.x - canvas.width / 2) / zoom + camX;
        CosmicState.mouse.worldY = (CosmicState.mouse.y - canvas.height / 2) / zoom + camY;

        CosmicState.mouse.down = true;
        CosmicState.interaction.dragStart = { x: CosmicState.mouse.x, y: CosmicState.mouse.y };

        if (window.CosmicShapeInteraction && window.CosmicShapeInteraction.onMouseDown(e)) return;
        if (window.IntentionSystem) {
            window.IntentionSystem.detectIntent(e, CosmicState);
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        CosmicState.mouse.down = false;

        if (window.CosmicShapeInteraction && window.CosmicShapeInteraction.onMouseUp(e)) return;
        if (window.IntentionSystem) {
            const intent = window.IntentionSystem.detectIntent(e, CosmicState);
            if (intent) window.IntentionSystem.triggerIntent(intent);
        }
    });

    // Wheel: trackpad pan (2 fingers) vs pinch zoom (ctrlKey)
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();

        if (e.ctrlKey) {
            // Pinch-to-zoom (browser sends ctrlKey for trackpad pinch)
            const zoomSpeed = 0.1;
            const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
            CosmicState.camera.targetZoom = Math.max(0.01, Math.min(100, CosmicState.camera.zoom * (1 + delta)));
            smoothZoom();
        } else {
            // Two-finger pan: shift camera by delta
            CosmicState.camera.x += e.deltaX / CosmicState.camera.zoom;
            CosmicState.camera.y += e.deltaY / CosmicState.camera.zoom;
        }
    });

    // Resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function smoothZoom() {
    const diff = CosmicState.camera.targetZoom - CosmicState.camera.zoom;
    CosmicState.camera.zoom += diff * 0.2; // Lerp

    if (Math.abs(diff) > 0.001) {
        requestAnimationFrame(smoothZoom);
    }
}

// Auto-init DÉSACTIVÉ (lazy load - s'initialise via galaxie-view.js quand user ouvre Galaxy View)
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initGalaxyCosmic);
// } else {
//     setTimeout(initGalaxyCosmic, 0);
// }

// Export global
window.GalaxyCosmic = {
    state: CosmicState,
    init: initGalaxyCosmic,
    toggleSkin() {
        if (this._renderer && this._renderer.background) {
            this._renderer.background.toggleSkin();
        }
    }
};

console.log('📦 galaxy-cosmic.js chargé - Prêt pour l\'éveil cosmique');
