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
    currentTool: 'intention',  // intention, shape, connector, text

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

                ctx.save();
                // Blur proportional to thickness — misty dissolving edges
                ctx.filter = `blur(${Math.round(t.blur + t.thickness * 0.3)}px)`;

                const grad = ctx.createLinearGradient(t.startX, 0, t.endX, 0);
                grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0)`);
                grad.addColorStop(0.12, `rgba(${cr}, ${cg}, ${cb}, ${t.opacity})`);
                grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${t.opacity})`);
                grad.addColorStop(0.88, `rgba(${cr}, ${cg}, ${cb}, ${t.opacity})`);
                grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

                ctx.strokeStyle = grad;
                ctx.lineWidth = t.thickness;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();

                for (let x = t.startX; x <= t.endX; x += step) {
                    const xShifted = x - t.driftOffset;
                    const wave = Math.sin(xShifted * t.waveFreq + t.wavePhase) * t.waveAmp;
                    const y = t.baseY + wave + breathY;
                    if (x === t.startX) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.restore();
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
    }

    render() {
        const now = Date.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        const ctx = CosmicState.ctx;
        const camera = CosmicState.camera;

        // Clear
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Fond cosmique
        this.background.render(ctx, camera, deltaTime);

        // Grille subtile (optionnelle)
        this.renderGrid(ctx, camera);

        // Connexions (flux d'énergie)
        this.renderConnections(ctx, camera, now);

        // Nœuds (pensées cristallisées)
        this.renderNodes(ctx, camera, now);

        // Sélection (lasso organique)
        this.renderSelection(ctx);

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
        // TODO: Connexions avec courbes Bézier et animation de flux
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

            // Breathing
            const breathScale = LifeAnimations.renderBreathing(ctx, node, time);
            ctx.scale(breathScale, breathScale);

            // Float
            const float = LifeAnimations.renderFloat(ctx, node, time);
            ctx.translate(float.x, float.y);

            // Glow
            const glowIntensity = LifeAnimations.renderGlow(ctx, node, time);

            // Dessiner la forme
            const radius = node.radius * zoom;

            if (node.shape === 'circle') {
                ctx.fillStyle = node.color;
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();

                // Contour
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
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

function initGalaxyCosmic() {
    console.log('🌌 Galaxy Cosmic v3.0 - Initialisation...');

    // Canvas principal
    const canvas = document.getElementById('galaxy-canvas');
    if (!canvas) {
        console.error('Canvas #galaxy-canvas introuvable');
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    CosmicState.canvas = canvas;
    CosmicState.ctx = canvas.getContext('2d');

    // Position initiale caméra (centré)
    CosmicState.camera.x = 0;
    CosmicState.camera.y = 0;

    // Event listeners
    setupEventListeners();

    // Démarrer le rendu
    const renderer = new CosmicRenderer();
    renderer.render();

    // Appliquer le skin sauvegardé
    renderer.background.setSkin(renderer.background.skin);

    // Exposer le renderer pour le skin toggle
    window.GalaxyCosmic._renderer = renderer;

    // Système d'intentions
    window.IntentionSystem = new IntentionSystem();

    console.log('✨ Galaxy Cosmic initialisée - L\'univers vivant vous attend');
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
        CosmicState.mouse.down = true;
        CosmicState.interaction.dragStart = { x: CosmicState.mouse.x, y: CosmicState.mouse.y };

        if (window.IntentionSystem) {
            window.IntentionSystem.detectIntent(e, CosmicState);
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        CosmicState.mouse.down = false;

        if (window.IntentionSystem) {
            const intent = window.IntentionSystem.detectIntent(e, CosmicState);
            if (intent) window.IntentionSystem.triggerIntent(intent);
        }
    });

    // Zoom (molette)
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();

        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;

        CosmicState.camera.targetZoom = Math.max(0.01, Math.min(100, CosmicState.camera.zoom * (1 + delta)));

        // Smooth zoom
        smoothZoom();
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
