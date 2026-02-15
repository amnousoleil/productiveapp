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
    particles: [],       // Particules cosmiques
    nebulae: [],        // Nébuleuses génératives

    // Interaction
    selectedNodes: new Set(),
    clipboard: null,
    currentTool: 'circle',  // circle par défaut pour dessin immédiat
    currentColor: '#60a5fa', // Couleur de dessin par défaut

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
            // [thick, opacity*0.6, blur, drift, amp, color]  — opacity reduced 40%
            { thick: [25, 40], op: [0.06, 0.10], blur: [3, 4.5], drift: [0.04, 0.08], amp: [25, 55], col: [184, 140, 60] },
            { thick: [3, 5],   op: [0.036, 0.06], blur: [1, 2], drift: [0.15, 0.25], amp: [10, 25], col: [230, 215, 160] },
            { thick: [10, 16], op: [0.054, 0.084], blur: [2, 3], drift: [0.08, 0.15], amp: [20, 40], col: [212, 175, 55] },
            { thick: [3, 5],   op: [0.036, 0.06], blur: [1, 2], drift: [0.15, 0.25], amp: [10, 25], col: [220, 205, 150] },
            { thick: [25, 40], op: [0.06, 0.10], blur: [3, 4.5], drift: [0.04, 0.08], amp: [25, 55], col: [175, 130, 50] },
            { thick: [10, 16], op: [0.054, 0.084], blur: [2, 3], drift: [0.08, 0.15], amp: [20, 40], col: [200, 168, 76] },
            { thick: [3, 5],   op: [0.036, 0.06], blur: [1, 2], drift: [0.15, 0.25], amp: [10, 25], col: [235, 220, 170] },
            { thick: [10, 16], op: [0.054, 0.084], blur: [2, 3], drift: [0.08, 0.15], amp: [20, 40], col: [192, 164, 80] },
            { thick: [25, 40], op: [0.06, 0.10], blur: [3, 4.5], drift: [0.04, 0.08], amp: [25, 55], col: [190, 150, 70] },
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

                // Multi-pass soft edges: thick faint outer + thin bright core
                ctx.strokeStyle = grad;
                ctx.globalAlpha = 0.3;
                ctx.lineWidth = t.thickness * 2.5;
                ctx.stroke(path);
                ctx.globalAlpha = 0.5;
                ctx.lineWidth = t.thickness * 1.4;
                ctx.stroke(path);
                ctx.globalAlpha = 1;
                ctx.lineWidth = t.thickness;
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
            (window.CosmicShapeInteraction.isDrawing || window.CosmicShapeInteraction.isDraggingNode);
        if (!isDrawing && this._bgFrame % 4 === 0) {
            this.background.render(this._bgCacheCtx, camera, deltaTime);
        }
        this._bgFrame++;

        // Blit cached background
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(this._bgCache, 0, 0);

        // Skip grid + connections during active drawing (perf)
        if (!isDrawing) {
            this.renderGrid(ctx, camera);
            this.renderConnections(ctx, camera, now);
        }

        // Nœuds (pensées cristallisées)
        this.renderNodes(ctx, camera, now);

        // Preview forme en cours de dessin
        if (window.renderShapePreview) {
            window.renderShapePreview(ctx, camera);
        }

        // Marquee selection rectangle
        if (window.renderMarqueeRect) {
            window.renderMarqueeRect(ctx, camera);
        }

        // UI Fantôme
        if (!CosmicState.prefs.zenMode) {
            this.renderUI(ctx, now);
        }

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

    renderConnections(ctx, camera, time) {
        const { x: camX, y: camY, zoom } = camera;
        const desert = this.background.skin === 'desert';
        const prevCol = desert ? 'rgba(120,70,20,0.6)' : 'rgba(96,165,250,0.5)';
        // Metallic white tubes (both skins), fully opaque
        const hi = '#ffffff', mid = '#b0b8c4', lo = '#5a6270';
        const dHi = '#ffffff', dLo = '#7a8494';
        const nodeMap = {};
        CosmicState.nodes.forEach(n => { nodeMap[n.id] = n; });

        CosmicState.connections.forEach(conn => {
            const from = nodeMap[conn.fromId], to = nodeMap[conn.toId];
            if (!from || !to) return;
            const x1 = (from.x - camX) * zoom + ctx.canvas.width / 2;
            const y1 = (from.y - camY) * zoom + ctx.canvas.height / 2;
            const x2 = (to.x - camX) * zoom + ctx.canvas.width / 2;
            const y2 = (to.y - camY) * zoom + ctx.canvas.height / 2;
            const w1 = Math.max(1, Math.min(10, from.radius * zoom * 0.08));
            const w2 = Math.max(1, Math.min(10, to.radius * zoom * 0.08));
            const dx = x2 - x1, dy = y2 - y1;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len, ny = dx / len;
            // Trapezoid path
            ctx.beginPath();
            ctx.moveTo(x1 + nx * w1, y1 + ny * w1);
            ctx.lineTo(x2 + nx * w2, y2 + ny * w2);
            ctx.lineTo(x2 - nx * w2, y2 - ny * w2);
            ctx.lineTo(x1 - nx * w1, y1 - ny * w1);
            ctx.closePath();
            // Metallic gradient perpendicular to tube, light from top
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            const gw = Math.max(w1, w2);
            const s = ny <= 0 ? 1 : -1; // +normal faces up when ny<=0
            const grad = ctx.createLinearGradient(
                mx + nx * gw * s, my + ny * gw * s,
                mx - nx * gw * s, my - ny * gw * s
            );
            grad.addColorStop(0, hi); grad.addColorStop(0.4, mid);
            grad.addColorStop(0.7, mid); grad.addColorStop(1, lo);
            ctx.fillStyle = grad; ctx.fill();
            // Metallic rivet dots (radial gradient)
            [[ x1, y1, w1 ], [ x2, y2, w2 ]].forEach(([cx, cy, w]) => {
                const r = w + 1;
                const dg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
                dg.addColorStop(0, dHi); dg.addColorStop(1, dLo);
                ctx.fillStyle = dg;
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
            });
        });

        // Preview line from pending connector to mouse
        const si = window.CosmicShapeInteraction;
        if (si && si.pendingConnFrom && CosmicState.currentTool === 'connector') {
            const from = si.pendingConnFrom;
            const fx = (from.x - camX) * zoom + ctx.canvas.width / 2;
            const fy = (from.y - camY) * zoom + ctx.canvas.height / 2;
            ctx.beginPath(); ctx.moveTo(fx, fy);
            ctx.lineTo(CosmicState.mouse.x, CosmicState.mouse.y);
            ctx.strokeStyle = prevCol; ctx.lineWidth = 2;
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

            // Dessiner la forme — flat fill + simple stroke, no effects
            const radius = node.radius * zoom;

            const pathFn = window.CosmicShapes && window.CosmicShapes[node.shape];
            if (pathFn) {
                pathFn(ctx, radius);
                ctx.fillStyle = node.color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
                if (CosmicState.selectedNodes.has(node)) {
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

            // Texte
            if (node.text) {
                ctx.fillStyle = '#ffffff';
                ctx.font = `${14 * zoom}px "Segoe UI", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.text, 0, 0);
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
}

function setupEventListeners() {
    const canvas = CosmicState.canvas;

    // Mouse move
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        CosmicState.mouse.x = e.clientX - rect.left;
        CosmicState.mouse.y = e.clientY - rect.top;

        // Conversion en coordonnées monde
        const { x: camX, y: camY, zoom } = CosmicState.camera;
        CosmicState.mouse.worldX = (CosmicState.mouse.x - canvas.width / 2) / zoom + camX;
        CosmicState.mouse.worldY = (CosmicState.mouse.y - canvas.height / 2) / zoom + camY;

        if (window.CosmicShapeInteraction && window.CosmicShapeInteraction.onMouseMove(e)) return;
        if (window.IntentionSystem) {
            window.IntentionSystem.detectIntent(e, CosmicState);
        }
    });

    // Double-clic : Créer pensée
    canvas.addEventListener('dblclick', (e) => {
        if (window.IntentionSystem) {
            const intent = window.IntentionSystem.detectIntent(e, CosmicState);
            if (intent) window.IntentionSystem.triggerIntent(intent);
        }
    });

    // Mouse down/up
    canvas.addEventListener('mousedown', (e) => {
        // Update coords so drawOrigin is fresh on first click
        const rect = canvas.getBoundingClientRect();
        CosmicState.mouse.x = e.clientX - rect.left;
        CosmicState.mouse.y = e.clientY - rect.top;
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
