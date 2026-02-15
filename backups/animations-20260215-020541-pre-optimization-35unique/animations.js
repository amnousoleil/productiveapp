// ============================================================
// PRODUCTIVE APP — ANIMATION ENGINE v4.0
// 40-theme parameterized edition
//
// Features:
//   - Simplex noise for organic movement
//   - Mouse/touch interactivity
//   - 4-tier adaptive quality (ultra > high > medium > low)
//   - Real-time FPS monitor with auto-downgrade/upgrade
//   - Device capability detection (CPU, RAM, GPU benchmark)
//   - Battery API awareness
//   - Canvas resolution scaling
//   - Per-theme canvas opacity (light themes = low opacity)
//   - prefers-reduced-motion support
//   - Page Visibility API (pause when hidden)
//   - 11 unique + 7 parameterized animation types
//   - 40 theme mappings
// ============================================================

(function() {
'use strict';

// ==========================================================
// SECTION 1: SIMPLEX NOISE
// ==========================================================
const G = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
const PM = new Uint8Array(512);
(function seedNoise() {
    const p = new Uint8Array(256);
    let s = 42 * 65536;
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
        s = (s * 16807 + 1) % 2147483647;
        const j = s % (i + 1);
        const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) PM[i] = p[i & 255];
})();

function noise2D(xin, yin) {
    const F2 = 0.3660254037844386, G2 = 0.21132486540518713;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s), j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - i + t, y0 = yin - j + t;
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) { t0 *= t0; const g = G[PM[ii + PM[jj]] % 12]; n0 = t0 * t0 * (g[0] * x0 + g[1] * y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) { t1 *= t1; const g = G[PM[ii + i1 + PM[jj + j1]] % 12]; n1 = t1 * t1 * (g[0] * x1 + g[1] * y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) { t2 *= t2; const g = G[PM[ii + 1 + PM[jj + 1]] % 12]; n2 = t2 * t2 * (g[0] * x2 + g[1] * y2); }
    return 70 * (n0 + n1 + n2);
}

function fbm(x, y, oct) {
    const maxOct = quality === 'low' ? 2 : (quality === 'medium' ? 3 : (oct || 4));
    let v = 0, a = 0.5, f = 1;
    for (let i = 0; i < maxOct; i++) { v += a * noise2D(x * f, y * f); a *= 0.5; f *= 2; }
    return v;
}

// ==========================================================
// SECTION 2: HELPERS
// ==========================================================
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const rand = (a, b) => Math.random() * (b - a) + a;
const Q_MULT = { low: 0.25, medium: 0.55, high: 0.8, ultra: 1.0 };
const cap = (base, q) => Math.max(1, (base * (Q_MULT[q] || 0.8) * Math.max(0.15, intensityFactor)) | 0);
const Q_STEP = { low: 16, medium: 10, high: 6, ultra: 4 };
function getStep() { return Q_STEP[quality] || 6; }

// ==========================================================
// SECTION 3: MOUSE / TOUCH
// ==========================================================
const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, active: false };
document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
document.addEventListener('mouseleave', () => { mouse.active = false; });
document.addEventListener('touchmove', e => {
    if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; mouse.active = true; }
}, { passive: true });
document.addEventListener('touchend', () => { mouse.active = false; });

function updateMouse() {
    if (mouse.active) { mouse.sx = lerp(mouse.sx, mouse.x, 0.08); mouse.sy = lerp(mouse.sy, mouse.y, 0.08); }
}

// ==========================================================
// SECTION 4: PERFORMANCE MONITOR
// ==========================================================
const Perf = {
    frameTimes: new Float32Array(60), frameIdx: 0, fps: 60, warmup: 60,
    tiers: ['low', 'medium', 'high', 'ultra'], tierIdx: 2, maxTier: 3, locked: false,
    downgradeAccum: 0, upgradeAccum: 0, score: 0,

    trackFrame(dt) {
        if (this.locked) return;
        this.frameTimes[this.frameIdx] = dt;
        this.frameIdx = (this.frameIdx + 1) % 60;
        if (this.warmup > 0) { this.warmup--; return; }
        let sum = 0;
        for (let i = 0; i < 60; i++) sum += this.frameTimes[i];
        this.fps = sum > 0 ? 60 / sum : 60;
        if (this.fps < 30) {
            this.downgradeAccum += dt; this.upgradeAccum = 0;
            if (this.downgradeAccum > 2) { this.downgrade(); this.downgradeAccum = 0; }
        } else if (this.fps > 52) {
            this.upgradeAccum += dt; this.downgradeAccum = 0;
            if (this.upgradeAccum > 6) { this.upgrade(); this.upgradeAccum = 0; }
        } else {
            this.downgradeAccum = Math.max(0, this.downgradeAccum - dt * 0.5);
            this.upgradeAccum = Math.max(0, this.upgradeAccum - dt * 0.3);
        }
    },
    downgrade() {
        if (this.tierIdx > 0) { this.tierIdx--; quality = this.tiers[this.tierIdx]; applyResolution(); initTheme(); }
    },
    upgrade() {
        if (this.tierIdx < this.maxTier) { this.tierIdx++; quality = this.tiers[this.tierIdx]; applyResolution(); initTheme(); }
    },
    detectDevice() {
        let score = 50;
        const cores = navigator.hardwareConcurrency || 2;
        if (cores >= 8) score += 20; else if (cores >= 4) score += 10; else if (cores <= 2) score -= 15;
        const mem = navigator.deviceMemory || 4;
        if (mem >= 8) score += 15; else if (mem >= 4) score += 5; else if (mem <= 2) score -= 20;
        const pixels = window.innerWidth * window.innerHeight;
        if (pixels > 3686400) score -= 15; else if (pixels > 2073600) score -= 8;
        if (navigator.maxTouchPoints > 1) score -= 20;
        const conn = navigator.connection;
        if (conn && conn.effectiveType) {
            if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') score -= 15;
            else if (conn.effectiveType === '3g') score -= 5;
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.locked = true; this.tierIdx = 0; this.maxTier = 0; quality = 'low'; this.score = 0; return 0;
        }
        this.score = Math.max(0, Math.min(100, score));
        if (this.score >= 75) { this.tierIdx = 3; this.maxTier = 3; }
        else if (this.score >= 50) { this.tierIdx = 2; this.maxTier = 3; }
        else if (this.score >= 25) { this.tierIdx = 1; this.maxTier = 2; }
        else { this.tierIdx = 0; this.maxTier = 1; }
        quality = this.tiers[this.tierIdx]; return this.score;
    },
    benchmarkGPU(cvs, context) {
        if (this.locked) return 0;
        const start = performance.now();
        for (let i = 0; i < 80; i++) {
            context.shadowBlur = 15; context.shadowColor = '#ff00ff'; context.fillStyle = '#00ffff';
            context.beginPath(); context.arc(Math.random() * 200, Math.random() * 200, 5, 0, Math.PI * 2); context.fill();
        }
        context.shadowBlur = 0; context.clearRect(0, 0, cvs.width, cvs.height);
        const elapsed = performance.now() - start;
        if (elapsed > 20) { this.maxTier = Math.min(this.maxTier, 0); this.tierIdx = 0; }
        else if (elapsed > 12) { this.maxTier = Math.min(this.maxTier, 1); this.tierIdx = Math.min(this.tierIdx, 1); }
        else if (elapsed > 6) { this.maxTier = Math.min(this.maxTier, 2); this.tierIdx = Math.min(this.tierIdx, 2); }
        quality = this.tiers[this.tierIdx]; return elapsed;
    },
    initBattery() {
        if (!('getBattery' in navigator)) return;
        navigator.getBattery().then(battery => {
            const check = () => {
                if (this.locked) return;
                if (battery.level < 0.15 && !battery.charging) {
                    if (this.tierIdx > 0) { this.tierIdx = 0; quality = 'low'; applyResolution(); initTheme(); }
                } else if (battery.level < 0.25 && !battery.charging) {
                    if (this.tierIdx > 1) { this.tierIdx = 1; this.maxTier = Math.min(this.maxTier, 1); quality = 'medium'; applyResolution(); initTheme(); }
                }
            };
            check(); battery.addEventListener('levelchange', check); battery.addEventListener('chargingchange', check);
        }).catch(() => {});
    }
};

// ==========================================================
// SECTION 5: ENGINE
// ==========================================================
let canvas, ctx, W, H;
let running = false, time = 0, lastTime = 0;
let quality = 'high';
let state = {}, fadeIn = 0;
let canvasScale = 1;
let frameSkipCounter = 0;
// Intensity system (controlled by AnimationControls)
let intensityFactor = 0.45;   // 0.0 to 1.0 - DEFAULT ELEGANT MODE (balanced performance)
let intensityTarget = 0.45;   // Start at 45% for good balance
let intensityRaw = 45;      // 0-100 user-facing value - ELEGANT default (NOT CINEMATIC)
const Q_SCALE = { low: 0.5, medium: 0.75, high: 1, ultra: 1 };

function applyResolution() {
    canvasScale = Q_SCALE[quality] || 1;
    if (!canvas) return;
    canvas.width = Math.round(W * canvasScale);
    canvas.height = Math.round(H * canvasScale);
    ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
}

function resize() {
    if (!canvas) return;
    W = window.innerWidth; H = window.innerHeight;
    applyResolution();
}

function glow(blur, color) {
    if (quality === 'low' || quality === 'medium') return;
    if (intensityFactor < 0.3) return;
    var glowMult = Math.max(0, (intensityFactor - 0.3) / 0.7);
    ctx.shadowBlur = (quality === 'high' ? blur * 0.6 : blur) * glowMult;
    ctx.shadowColor = color;
}
function noGlow() { ctx.shadowBlur = 0; }

// ==========================================================
// SECTION 6: THEME CONFIG MAP
// ==========================================================
const TC = {
    // ÉLÉGANCE — 6 animations UNIQUES
    executive:   { type: 'executive',  c: ['#d4af37','#f0d975','#c9a000'], a: 0.92 }, // Art-déco géométrique
    corporate:   { type: 'corporate',  c: ['#6495ed','#89b4f7','#4169e1'], a: 0.92 }, // Flux de données
    ivory:       { type: 'ivory',      c: ['#B8A080','#D4C8B8','#C8B898'], a: 0.92 }, // Soie fluide
    sterling:    { type: 'sterling',   c: ['#C0C8D0','#D8DDE5','#A8B0C0'], a: 0.98 }, // Cristaux de givre
    diplomat:    { type: 'diplomat',   c: ['#C4324A','#E05A72','#A02838'], a: 0.92 }, // Rubans ondulants
    academie:    { type: 'academie',   c: ['#daa520','#f0c850','#b8860b'], a: 0.92 }, // Pages de livre
    // NATURE — 7 animations UNIQUES
    ocean:       { type: 'ocean',     c: ['#00b4d8','#48cae4','#06d6a0'], a: 0.95 }, // CONSERVER - Vagues + poissons
    forest:      { type: 'forest',    c: ['#4aaa64','#70c888','#a3e635'], a: 0.92 }, // CONSERVER - Feuilles qui tombent
    sunset:      { type: 'sunset',    c: ['#f97316','#fbbf24','#ef4444','#fb7185'], a: 0.92 }, // CONSERVER - God rays
    desert:      { type: 'desert',    c: ['#e07840','#f4a261','#fbbf24'], a: 0.92 }, // CONSERVER - Tempête de sable
    lavender:    { type: 'lavender',  c: ['#B07CC8','#D0A0E8','#E8C0FF'], a: 0.88 }, // Champ ondulant + papillons
    sakura:      { type: 'sakura',    c: ['#D4688C','#E890A8','#F0B0C0'], a: 0.92 }, // Pétales en spirale
    // ATMOSPHÈRE — 8 animations UNIQUES
    aurora:      { type: 'aurora',    c: ['#93c5fd','#c4b5fd','#86efac','#a7f3d0'], a: 0.97 }, // CONSERVER - Aurore boréale
    midnight:    { type: 'midnight',  c: ['#7c9fff','#a0c0ff','#88d8a0'], a: 0.97 }, // CONSERVER - Ciel étoilé
    twilight:    { type: 'twilight',  c: ['#C490E0','#D8B0F0','#A080C8'], a: 0.98 }, // Nuages crépuscule
    candlelight: { type: 'candlelight', c: ['#E8A840','#F0C060','#FFE080'], a: 0.88 }, // Flammes dansantes
    moonlit:     { type: 'moonlit',   c: ['#A0B8D8','#C0D0E8','#8098B8'], a: 0.88 }, // Rayons de lune
    'golden-hour': { type: 'goldenhour', c: ['#D4A040','#E8C060','#F0D880'], a: 0.98 }, // Lumière dorée
    storm:       { type: 'storm',     c: ['#6B8DB5','#90B0D0','#4A7098'], a: 0.88 }, // Éclairs + pluie
    // MODERNE
    bubblegum:   { type: 'bubblegum', c: ['#ff6b9d','#ff9ec4','#ffc0d0','#38bdf8'], a: 0.92 },
    neon:        { type: 'neonp',     c: ['#FF1493','#FF69B4','#00FFAA','#FFD700'], a: 0.92 },
    pastel:      { type: 'shimmer',   c: ['#A888C8','#C8A8E0','#88B8D8'], a: 0.45 },
    retrowave:   { type: 'neonp',     c: ['#FF6EC7','#FF90D8','#00E5A0','#8866FF'], a: 0.92 },
    mint:        { type: 'shimmer',   c: ['#3DA878','#60C898','#88E0B8'], a: 0.45 },
    coral:       { type: 'particles', c: ['#FF6F61','#FF9488'], a: 0.92 }, // MASSIVELY BOOSTED for visibility
    // MINIMALISTE
    obsidian:    { type: 'obsidian',  c: ['#a78bfa','#8b5cf6'], a: 0.88 },
    paper:       { type: 'shimmer',   c: ['#8B7B65','#B0A088','#C8B8A0'], a: 0.30 },
    clay:        { type: 'fireflies', c: ['#B89878','#D0B898','#C8A878'], a: 0.75 },
    porcelain:   { type: 'shimmer',   c: ['#6888A8','#88A8C8','#A0C0D8'], a: 0.30 },
    espresso:    { type: 'fireflies', c: ['#A87848','#C89868','#B08858'], a: 0.75 },
    // TECH
    matrix:      { type: 'matrix',    c: ['#00CC33','#66E68C'], a: 0.98 },
    cyberpunk:   { type: 'cyberpunk', c: ['#ff00ff','#00ffff','#ff0088','#8800ff'], a: 0.97 },
    terminal:    { type: 'terminal',  c: ['#FFB000','#FFD060','#FF8800'], a: 0.97 },
    tron:        { type: 'trongrid',  c: ['#00D4FF','#40E0FF','#0080A0'], a: 0.92 },
    hologram:    { type: 'hologram',  c: ['#88DDFF','#FF88DD','#88FFBB','#FFDD88'], a: 0.88 },
    // ARTISTE
    zen:         { type: 'shimmer',   c: ['#708058','#90A070','#A8B888'], a: 0.30 },
    'art-deco':  { type: 'particles', c: ['#C8A040','#E0C060'], a: 0.92 }, // MASSIVELY BOOSTED for visibility
    watercolor:  { type: 'shimmer',   c: ['#8888C0','#A8A8D8','#9898B8'], a: 0.45 },
    nordic:      { type: 'shimmer',   c: ['#5A7A6A','#78A890','#90C0A8'], a: 0.40 },
    cosmic:      { type: 'stars',     c: ['#9966FF','#B888FF','#7744DD'], a: 0.95 },
    // SAISONS
    printemps:   { type: 'shimmer',   c: ['#78B464','#98D080','#B8E8A0'], a: 0.92 },
    ete:         { type: 'shimmer',   c: ['#2890C0','#48B0E0','#F0D080'], a: 0.92 },
    automne:     { type: 'fireflies', c: ['#C85A28','#E07840','#D8A030'], a: 0.98 },
    hiver:       { type: 'stars',     c: ['#88B8E0','#A8D0F0','#C0D8F0'], a: 0.88 },
    // PRÉCIEUX
    amethyst:    { type: 'stars',     c: ['#9060D8','#B080F0','#7040B8'], a: 0.92 },
    jade:        { type: 'fireflies', c: ['#40A878','#60C898','#308860'], a: 0.97 },
    ruby:        { type: 'particles', c: ['#D83040','#F05060'], a: 0.92 }, // MASSIVELY BOOSTED for visibility
    pearl:       { type: 'shimmer',   c: ['#A098B0','#B8B0C8','#D0C8D8'], a: 0.40 },
    copper:      { type: 'fireflies', c: ['#C87850','#E09870','#A06038'], a: 0.82 },
    // VOYAGE
    sahara:      { type: 'desert',    c: ['#D2AF5A','#E8C878','#C09838'], a: 0.98 },
    fjord:       { type: 'waves',     c: ['#3C8296','#58A8C0','#286878'], a: 0.88 },
    bamboo:      { type: 'shimmer',   c: ['#64803C','#88A858','#A0C070'], a: 0.40 },
    bali:        { type: 'ocean',     c: ['#00B496','#30D8B8','#008870'], a: 0.92 },
    provence:    { type: 'shimmer',   c: ['#8C6EA0','#A888C0','#C0A0D0'], a: 0.92 },
    // ADDITIONS (NATURE + ATMOSPHÈRE)
    moss:        { type: 'moss',      c: ['#507832','#70A048','#3A5A20'], a: 0.88 }, // Mycélium organique
    ember:       { type: 'ember',     c: ['#DC5020','#F07040','#FF9060'], a: 0.92 }, // Braises volantes
    snow:        { type: 'shimmer',   c: ['#6880A0','#88A0C0','#A0B8D0'], a: 0.35 },
    charcoal:    { type: 'particles', c: ['#909AA4','#B0B8C0'], a: 0.92 },
    bioluminescence: { type: 'ocean', c: ['#00C8DC','#40E8F0','#00E8A0'], a: 0.97 },
    'ukiyo-e':   { type: 'particles', c: ['#B45038','#D07050'], a: 0.82 },
    pipboy:      { type: 'pipboy',  c: ['#00FF77','#00CC55'], a: 0.98 }
};

// ==========================================================
// SECTION 7: ANIMATION TYPES
// ==========================================================
const AT = {};

// ==========================================================
// ÉLÉGANCE — 6 ANIMATIONS UNIQUES
// ==========================================================

// --- EXECUTIVE: Art-déco géométrique avec polygones dorés rotatifs ---
AT.executive = {
    init(cfg) {
        const count = cap(16, quality);
        state.polygons = [];
        for (let i = 0; i < count; i++) {
            state.polygons.push({
                x: rand(0, W), y: rand(0, H),
                rotation: rand(0, Math.PI*2),
                rotSpeed: rand(-0.3, 0.3),
                size: rand(30, 80),
                sides: [3, 4, 6][Math.floor(Math.random() * 3)], // Triangle, carré, hexagone
                phase: rand(0, Math.PI*2),
                orbit: rand(20, 50),
                color: cfg.c[i % cfg.c.length]
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        // Connexions Delaunay entre polygones proches
        if (quality !== 'low' && state.polygons) {
            ctx.lineWidth = 0.5;
            for (let i = 0; i < state.polygons.length; i++) {
                for (let j = i + 1; j < state.polygons.length; j++) {
                    const a = state.polygons[i], b = state.polygons[j];
                    const d = dist(a.x, a.y, b.x, b.y);
                    if (d < 200) {
                        ctx.globalAlpha = fadeIn * (1-d/200) * 0.15;
                        ctx.strokeStyle = cfg.c[0];
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Polygones rotatifs
        if (state.polygons) for (const p of state.polygons) {
            p.rotation += p.rotSpeed * dt;
            p.phase += dt * 0.3;
            const pulse = (Math.sin(p.phase) + 1) * 0.5;

            // Orbite organique
            const nx = quality === 'low' ? Math.sin(p.phase) : noise2D(p.phase, p.y * 0.005);
            const ny = quality === 'low' ? Math.cos(p.phase * 0.7) : noise2D(p.x * 0.005, p.phase);
            const px = p.x + nx * p.orbit;
            const py = p.y + ny * p.orbit;

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = fadeIn * (0.3 + pulse * 0.4);

            // Dessiner polygone
            ctx.beginPath();
            for (let i = 0; i <= p.sides; i++) {
                const angle = (Math.PI * 2 / p.sides) * i;
                const vx = Math.cos(angle) * p.size * (0.8 + pulse * 0.2);
                const vy = Math.sin(angle) * p.size * (0.8 + pulse * 0.2);
                if (i === 0) ctx.moveTo(vx, vy);
                else ctx.lineTo(vx, vy);
            }
            ctx.closePath();

            glow(8, p.color);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// --- CORPORATE: Flux de données ascendants style Bloomberg Terminal ---
AT.corporate = {
    init(cfg) {
        const count = cap(25, quality);
        state.dataLines = [];
        for (let i = 0; i < count; i++) {
            state.dataLines.push({
                x: rand(0, W),
                y: rand(0, H),
                speed: rand(80, 200),
                height: rand(60, 150),
                width: rand(2, 5),
                color: cfg.c[i % cfg.c.length],
                segments: []
            });
            // Créer segments de données
            for (let j = 0; j < 8; j++) {
                state.dataLines[i].segments.push({
                    offset: j * 15,
                    alpha: rand(0.3, 1)
                });
            }
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);

        // Grille de fond subtile
        if (quality !== 'low') {
            ctx.strokeStyle = 'rgba(100, 149, 237, 0.03)';
            ctx.lineWidth = 1;
            for (let x = 0; x < W; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, H);
                ctx.stroke();
            }
        }

        ctx.globalCompositeOperation = 'lighter';

        if (state.dataLines) for (const line of state.dataLines) {
            line.y -= line.speed * dt;
            if (line.y < -line.height - 150) {
                line.y = H + 50;
                line.x = rand(0, W);
            }

            // Dessiner segments de données
            for (const seg of line.segments) {
                const sy = line.y + seg.offset;
                if (sy > -20 && sy < H + 20) {
                    ctx.globalAlpha = fadeIn * seg.alpha * 0.6;
                    glow(6, line.color);
                    ctx.fillStyle = line.color;
                    ctx.fillRect(line.x, sy, line.width, 10);
                }
            }
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// --- IVORY: Soie fluide avec effet marbré véronèse ---
AT.ivory = {
    init(cfg) {
        state.silkWaves = [];
        const layers = quality === 'low' ? 3 : 5;
        for (let i = 0; i < layers; i++) {
            state.silkWaves.push({
                yOffset: (i / layers) * H,
                speed: 0.3 + i * 0.1,
                amplitude: 40 + i * 15,
                frequency: 0.003 + i * 0.001,
                color: cfg.c[i % cfg.c.length]
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);

        const ws = getStep();
        if (state.silkWaves) for (let l = 0; l < state.silkWaves.length; l++) {
            const wave = state.silkWaves[l];

            // Gradient vertical pour effet soie
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            const hr = parseInt(wave.color.slice(1,3),16);
            const hg = parseInt(wave.color.slice(3,5),16);
            const hb = parseInt(wave.color.slice(5,7),16);
            grad.addColorStop(0, 'rgba('+hr+','+hg+','+hb+',0.02)');
            grad.addColorStop(0.5, 'rgba('+hr+','+hg+','+hb+',0.08)');
            grad.addColorStop(1, 'rgba('+hr+','+hg+','+hb+',0.02)');

            ctx.beginPath();
            ctx.moveTo(0, 0);

            for (let x = 0; x <= W; x += ws) {
                // Multi-octave noise pour mouvement organique
                const n1 = noise2D(x * wave.frequency, time * wave.speed);
                const n2 = noise2D(x * wave.frequency * 2.3, time * wave.speed * 0.7);
                const y = wave.yOffset + n1 * wave.amplitude + n2 * wave.amplitude * 0.4;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.lineTo(W, H);
            ctx.lineTo(0, H);
            ctx.closePath();

            ctx.fillStyle = grad;
            ctx.globalAlpha = fadeIn;
            ctx.fill();
        }

        ctx.globalAlpha = fadeIn;
    }
};

// --- STERLING: Cristaux de givre qui croissent et se dissolvent ---
AT.sterling = {
    init(cfg) {
        const count = cap(12, quality);
        state.crystals = [];
        for (let i = 0; i < count; i++) {
            state.crystals.push({
                x: rand(0, W),
                y: rand(0, H),
                growth: rand(0, 1),
                growSpeed: rand(0.15, 0.4),
                maxSize: rand(40, 100),
                branches: rand(4, 8),
                rotation: rand(0, Math.PI*2),
                color: cfg.c[i % cfg.c.length],
                phase: rand(0, Math.PI*2)
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        if (state.crystals) for (const c of state.crystals) {
            c.phase += dt * 0.5;

            // Cycle de croissance/dissolution
            c.growth += c.growSpeed * dt;
            if (c.growth > 2) c.growth = 0;

            const growthFactor = c.growth <= 1 ? c.growth : (2 - c.growth);
            const size = c.maxSize * growthFactor;

            if (size > 2) {
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.rotation + c.phase * 0.1);

                // Dessiner branches de cristal (fractales)
                for (let i = 0; i < c.branches; i++) {
                    const angle = (Math.PI * 2 / c.branches) * i;
                    ctx.globalAlpha = fadeIn * growthFactor * 0.5;
                    glow(4, c.color);
                    ctx.strokeStyle = c.color;
                    ctx.lineWidth = 1.5;

                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    const ex = Math.cos(angle) * size;
                    const ey = Math.sin(angle) * size;
                    ctx.lineTo(ex, ey);

                    // Sous-branches
                    if (quality !== 'low') {
                        ctx.lineTo(ex * 0.7 + Math.cos(angle + 0.5) * size * 0.3, ey * 0.7 + Math.sin(angle + 0.5) * size * 0.3);
                        ctx.moveTo(ex, ey);
                        ctx.lineTo(ex * 0.7 + Math.cos(angle - 0.5) * size * 0.3, ey * 0.7 + Math.sin(angle - 0.5) * size * 0.3);
                    }

                    ctx.stroke();
                }

                ctx.restore();
            }
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// --- DIPLOMAT: Rubans rouges ondulants type drapeau diplomatique ---
AT.diplomat = {
    init(cfg) {
        const count = quality === 'low' ? 3 : 5;
        state.ribbons = [];
        for (let i = 0; i < count; i++) {
            state.ribbons.push({
                yBase: (i + 1) * (H / (count + 1)),
                phase: rand(0, Math.PI*2),
                speed: rand(0.4, 0.8),
                amplitude: rand(30, 60),
                width: rand(80, 150),
                color: cfg.c[i % cfg.c.length]
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);

        if (state.ribbons) for (const r of state.ribbons) {
            r.phase += r.speed * dt;

            // Courbe de Bézier pour ruban fluide
            ctx.save();
            ctx.globalAlpha = fadeIn * 0.6;

            const points = [];
            const segments = quality === 'low' ? 15 : 30;

            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const x = t * W;
                const wave1 = Math.sin(x * 0.01 + r.phase) * r.amplitude;
                const wave2 = Math.sin(x * 0.02 + r.phase * 0.7) * r.amplitude * 0.5;
                const y = r.yBase + wave1 + wave2;
                points.push({x, y});
            }

            // Dessiner ruban avec gradient
            const grad = ctx.createLinearGradient(0, r.yBase - r.width/2, 0, r.yBase + r.width/2);
            const hr = parseInt(r.color.slice(1,3),16);
            const hg = parseInt(r.color.slice(3,5),16);
            const hb = parseInt(r.color.slice(5,7),16);
            grad.addColorStop(0, 'rgba('+hr+','+hg+','+hb+',0.1)');
            grad.addColorStop(0.5, 'rgba('+hr+','+hg+','+hb+',0.4)');
            grad.addColorStop(1, 'rgba('+hr+','+hg+','+hb+',0.1)');

            // Partie haute du ruban
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y - r.width/2);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y - r.width/2);
            }
            for (let i = points.length - 1; i >= 0; i--) {
                ctx.lineTo(points[i].x, points[i].y + r.width/2);
            }
            ctx.closePath();

            ctx.fillStyle = grad;
            ctx.fill();

            // Contour brillant
            glow(6, r.color);
            ctx.strokeStyle = r.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();

            ctx.restore();
        }

        noGlow();
        ctx.globalAlpha = fadeIn;
    }
};

// --- ACADEMIE: Pages de livre qui tournent + particules de connaissance ---
AT.academie = {
    init(cfg) {
        const pageCount = cap(8, quality);
        const particleCount = cap(30, quality);

        state.pages = [];
        state.knowledgeParticles = [];

        for (let i = 0; i < pageCount; i++) {
            state.pages.push({
                x: rand(W * 0.2, W * 0.8),
                y: rand(H * 0.2, H * 0.8),
                rotation: rand(0, Math.PI*2),
                rotSpeed: rand(0.3, 0.8),
                width: rand(40, 80),
                height: rand(60, 100),
                flip: 0,
                flipSpeed: rand(0.5, 1.2),
                color: cfg.c[i % cfg.c.length]
            });
        }

        for (let i = 0; i < particleCount; i++) {
            state.knowledgeParticles.push({
                x: rand(0, W),
                y: rand(0, H),
                vy: -rand(20, 60),
                size: rand(1, 3),
                alpha: rand(0.3, 1),
                color: cfg.c[i % cfg.c.length]
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        // Particules de connaissance ascendantes
        if (state.knowledgeParticles) for (const p of state.knowledgeParticles) {
            p.y += p.vy * dt;
            if (p.y < -20) {
                p.y = H + 20;
                p.x = rand(0, W);
            }

            ctx.globalAlpha = fadeIn * p.alpha * 0.4;
            glow(3, p.color);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        }

        // Pages qui tournent (effet 3D simplifié)
        if (state.pages) for (const page of state.pages) {
            page.rotation += page.rotSpeed * dt;
            page.flip += page.flipSpeed * dt;

            const flipFactor = Math.abs(Math.sin(page.flip)); // 0 = de profil, 1 = face
            const width3D = page.width * flipFactor;

            if (width3D > 5) { // Ne pas dessiner si trop fin
                ctx.save();
                ctx.translate(page.x, page.y);
                ctx.rotate(page.rotation);

                ctx.globalAlpha = fadeIn * (0.3 + flipFactor * 0.5);

                // Rectangle de page avec perspective
                const hr = parseInt(page.color.slice(1,3),16);
                const hg = parseInt(page.color.slice(3,5),16);
                const hb = parseInt(page.color.slice(5,7),16);

                ctx.fillStyle = 'rgba('+hr+','+hg+','+hb+',0.2)';
                ctx.fillRect(-width3D/2, -page.height/2, width3D, page.height);

                glow(4, page.color);
                ctx.strokeStyle = page.color;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-width3D/2, -page.height/2, width3D, page.height);

                // Lignes de texte
                if (quality !== 'low' && flipFactor > 0.3) {
                    ctx.strokeStyle = 'rgba('+hr+','+hg+','+hb+',0.3)';
                    ctx.lineWidth = 1;
                    for (let i = 0; i < 5; i++) {
                        const ly = -page.height/2 + 15 + i * 12;
                        ctx.beginPath();
                        ctx.moveTo(-width3D/2 + 8, ly);
                        ctx.lineTo(width3D/2 - 8, ly);
                        ctx.stroke();
                    }
                }

                ctx.restore();
            }
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// ==========================================================
// NATURE — 2 ANIMATIONS UNIQUES (+ 4 conservées: ocean, forest, sunset, desert)
// ==========================================================

// --- LAVENDER: Champ de lavande ondulant + papillons ---
AT.lavender = {
    init(cfg) {
        const fieldLines = quality === 'low' ? 8 : 15;
        const butterflyCount = cap(6, quality);

        state.lavenderField = [];
        state.butterflies = [];

        for (let i = 0; i < fieldLines; i++) {
            state.lavenderField.push({
                y: (H / (fieldLines + 1)) * (i + 1),
                phase: rand(0, Math.PI*2),
                speed: rand(0.3, 0.6),
                amplitude: rand(15, 30)
            });
        }

        for (let i = 0; i < butterflyCount; i++) {
            state.butterflies.push({
                x: rand(0, W),
                y: rand(0, H),
                phase: rand(0, Math.PI*2),
                speed: rand(0.8, 1.5),
                wingPhase: rand(0, Math.PI*2),
                wingSpeed: rand(8, 12),
                path: rand(40, 80),
                color: cfg.c[i % cfg.c.length]
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);

        // Champ de lavande ondulant
        if (state.lavenderField) for (const line of state.lavenderField) {
            line.phase += line.speed * dt;

            ctx.globalAlpha = fadeIn * 0.15;
            ctx.strokeStyle = cfg.c[0];
            ctx.lineWidth = 2;

            ctx.beginPath();
            for (let x = 0; x <= W; x += 8) {
                const wave = Math.sin(x * 0.01 + line.phase) * line.amplitude;
                const y = line.y + wave;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Papillons
        ctx.globalCompositeOperation = 'lighter';
        if (state.butterflies) for (const b of state.butterflies) {
            b.phase += b.speed * dt;
            b.wingPhase += b.wingSpeed * dt;

            const nx = noise2D(b.phase, b.y * 0.01);
            const ny = noise2D(b.x * 0.01, b.phase);
            b.x += nx * b.path * dt;
            b.y += ny * b.path * dt * 0.5;

            // Wrap around
            if (b.x < -20) b.x = W + 20;
            if (b.x > W + 20) b.x = -20;
            if (b.y < -20) b.y = H + 20;
            if (b.y > H + 20) b.y = -20;

            const wingFlap = Math.abs(Math.sin(b.wingPhase));

            ctx.save();
            ctx.translate(b.x, b.y);

            ctx.globalAlpha = fadeIn * (0.4 + wingFlap * 0.4);
            glow(4, b.color);
            ctx.fillStyle = b.color;

            // Ailes simplifiées
            ctx.beginPath();
            ctx.ellipse(-3, 0, 5 * wingFlap, 8, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(3, 0, 5 * wingFlap, 8, 0, 0, Math.PI*2);
            ctx.fill();

            ctx.restore();
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// --- SAKURA: Pétales de cerisier en spirale avec vent ---
AT.sakura = {
    init(cfg) {
        const count = cap(40, quality);
        state.petals = [];

        for (let i = 0; i < count; i++) {
            state.petals.push({
                x: rand(0, W),
                y: rand(-H, H),
                rotation: rand(0, Math.PI*2),
                rotSpeed: rand(-3, 3),
                fallSpeed: rand(30, 80),
                sway: rand(40, 100),
                swayPhase: rand(0, Math.PI*2),
                swaySpeed: rand(0.5, 1.5),
                size: rand(4, 10),
                color: cfg.c[i % cfg.c.length]
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        if (state.petals) for (const p of state.petals) {
            p.y += p.fallSpeed * dt;
            p.swayPhase += p.swaySpeed * dt;
            p.rotation += p.rotSpeed * dt;

            const swayX = Math.sin(p.swayPhase) * p.sway * dt;
            p.x += swayX;

            // Vortex effect near mouse
            if (mouse.active) {
                const md = dist(p.x, p.y, mouse.sx, mouse.sy);
                if (md < 200) {
                    const angle = Math.atan2(p.y - mouse.sy, p.x - mouse.sx);
                    const force = (1 - md/200) * 100 * dt;
                    p.x += Math.cos(angle + Math.PI/2) * force;
                    p.y += Math.sin(angle + Math.PI/2) * force;
                }
            }

            // Wrap
            if (p.y > H + 20) {
                p.y = -20;
                p.x = rand(0, W);
            }
            if (p.x < -20) p.x = W + 20;
            if (p.x > W + 20) p.x = -20;

            // Dessiner pétale (forme de coeur simplifiée)
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            ctx.globalAlpha = fadeIn * 0.6;
            glow(3, p.color);
            ctx.fillStyle = p.color;

            ctx.beginPath();
            ctx.moveTo(0, -p.size/2);
            ctx.bezierCurveTo(-p.size/2, -p.size, -p.size, -p.size/2, 0, p.size/2);
            ctx.bezierCurveTo(p.size, -p.size/2, p.size/2, -p.size, 0, -p.size/2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// --- MOSS: Croissance organique mycélium/réseau neuronal ---
AT.moss = {
    init(cfg) {
        const nodeCount = cap(20, quality);
        state.nodes = [];
        state.growthAge = 0;

        for (let i = 0; i < nodeCount; i++) {
            state.nodes.push({
                x: rand(W * 0.3, W * 0.7),
                y: rand(H * 0.3, H * 0.7),
                size: rand(3, 8),
                growth: rand(0, 1),
                maxConnections: 4,
                color: cfg.c[i % cfg.c.length],
                pulse: rand(0, Math.PI*2)
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        state.growthAge += dt * 0.3;

        // Connexions organiques
        if (quality !== 'low' && state.nodes) {
            ctx.lineWidth = 1;
            for (let i = 0; i < state.nodes.length; i++) {
                const node = state.nodes[i];
                let connections = 0;

                for (let j = i + 1; j < state.nodes.length && connections < node.maxConnections; j++) {
                    const other = state.nodes[j];
                    const d = dist(node.x, node.y, other.x, other.y);

                    if (d < 150) {
                        const growFactor = Math.min(node.growth, other.growth);
                        const pulse = (Math.sin(state.growthAge + i * 0.5) + 1) * 0.5;

                        ctx.globalAlpha = fadeIn * growFactor * (1 - d/150) * 0.2 * pulse;
                        ctx.strokeStyle = node.color;

                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();

                        connections++;
                    }
                }
            }
        }

        // Nodes qui croissent
        ctx.globalCompositeOperation = 'lighter';
        if (state.nodes) for (const node of state.nodes) {
            node.pulse += dt * 2;
            node.growth = Math.min(1, node.growth + dt * 0.3);

            const pulseFactor = (Math.sin(node.pulse) + 1) * 0.5;
            const size = node.size * node.growth * (0.8 + pulseFactor * 0.2);

            ctx.globalAlpha = fadeIn * node.growth * (0.5 + pulseFactor * 0.3);
            glow(6, node.color);
            ctx.fillStyle = node.color;

            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, Math.PI*2);
            ctx.fill();

            // Tendrils de croissance
            if (quality !== 'low') {
                const tendrils = 3;
                for (let i = 0; i < tendrils; i++) {
                    const angle = (Math.PI*2 / tendrils) * i + node.pulse * 0.1;
                    const length = size * 2 * node.growth;
                    const ex = node.x + Math.cos(angle) * length;
                    const ey = node.y + Math.sin(angle) * length;

                    ctx.globalAlpha = fadeIn * node.growth * 0.3;
                    ctx.strokeStyle = node.color;
                    ctx.lineWidth = 1;

                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();
                }
            }
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// ==========================================================
// ATMOSPHÈRE — 5 ANIMATIONS UNIQUES (+ 2 conservées: aurora, midnight)
// ==========================================================

// --- TWILIGHT: Nuages de crépuscule + étoiles naissantes ---
AT.twilight = {
    init(cfg) {
        const cloudCount = quality === 'low' ? 3 : 5;
        const starCount = cap(50, quality);

        state.clouds = [];
        state.twilightStars = [];

        for (let i = 0; i < cloudCount; i++) {
            state.clouds.push({
                x: rand(0, W),
                y: rand(H * 0.2, H * 0.6),
                width: rand(150, 300),
                height: rand(40, 80),
                speed: rand(10, 30),
                opacity: rand(0.1, 0.3),
                color: cfg.c[i % cfg.c.length]
            });
        }

        for (let i = 0; i < starCount; i++) {
            state.twilightStars.push({
                x: rand(0, W),
                y: rand(0, H * 0.7),
                size: rand(0.5, 2),
                brightness: 0,
                brightenSpeed: rand(0.2, 0.5),
                twinkle: rand(0, Math.PI*2)
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);

        // Nuages qui dérivent
        if (state.clouds) for (const cloud of state.clouds) {
            cloud.x += cloud.speed * dt;
            if (cloud.x > W + cloud.width) cloud.x = -cloud.width;

            const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.width/2);
            const hr = parseInt(cloud.color.slice(1,3),16);
            const hg = parseInt(cloud.color.slice(3,5),16);
            const hb = parseInt(cloud.color.slice(5,7),16);
            grad.addColorStop(0, 'rgba('+hr+','+hg+','+hb+','+cloud.opacity+')');
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.globalAlpha = fadeIn;
            ctx.fillRect(cloud.x - cloud.width/2, cloud.y - cloud.height/2, cloud.width, cloud.height);
        }

        // Étoiles qui apparaissent progressivement
        ctx.globalCompositeOperation = 'lighter';
        if (state.twilightStars) for (const star of state.twilightStars) {
            star.brightness = Math.min(1, star.brightness + star.brightenSpeed * dt);
            star.twinkle += dt * 2;

            const twinkleFactor = (Math.sin(star.twinkle) + 1) * 0.5;
            const alpha = star.brightness * (0.3 + twinkleFactor * 0.7);

            ctx.globalAlpha = fadeIn * alpha;
            glow(3, cfg.c[0]);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
            ctx.fill();
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// --- CANDLELIGHT: Flammes de bougies dansantes ---
AT.candlelight = {
    init(cfg) {
        const candleCount = quality === 'low' ? 4 : 7;
        state.candles = [];

        for (let i = 0; i < candleCount; i++) {
            state.candles.push({
                x: (W / (candleCount + 1)) * (i + 1),
                y: H * 0.7,
                flameHeight: rand(40, 70),
                flicker: rand(0, Math.PI*2),
                flickerSpeed: rand(4, 8),
                glowRadius: rand(100, 180),
                color: cfg.c[i % cfg.c.length]
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        if (state.candles) for (const candle of state.candles) {
            candle.flicker += candle.flickerSpeed * dt;

            const flickerAmount = (Math.sin(candle.flicker) + 1) * 0.5;
            const height = candle.flameHeight * (0.8 + flickerAmount * 0.2);

            // Halo de lumière chaud
            const grad = ctx.createRadialGradient(candle.x, candle.y, 0, candle.x, candle.y, candle.glowRadius);
            const hr = parseInt(candle.color.slice(1,3),16);
            const hg = parseInt(candle.color.slice(3,5),16);
            const hb = parseInt(candle.color.slice(5,7),16);
            grad.addColorStop(0, 'rgba('+hr+','+hg+','+hb+',0.15)');
            grad.addColorStop(0.5, 'rgba('+hr+','+hg+','+hb+',0.05)');
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.globalAlpha = fadeIn * (0.6 + flickerAmount * 0.4);
            ctx.fillRect(candle.x - candle.glowRadius, candle.y - candle.glowRadius, candle.glowRadius*2, candle.glowRadius*2);

            // Flamme
            ctx.save();
            ctx.translate(candle.x, candle.y);

            ctx.globalAlpha = fadeIn * (0.7 + flickerAmount * 0.3);
            glow(12, candle.color);
            ctx.fillStyle = candle.color;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-8, -height * 0.3, -6, -height * 0.7, 0, -height);
            ctx.bezierCurveTo(6, -height * 0.7, 8, -height * 0.3, 0, 0);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// --- MOONLIT: Rayons de lune à travers nuages ---
AT.moonlit = {
    init(cfg) {
        state.moonX = W * 0.75;
        state.moonY = H * 0.25;
        state.moonGlow = 0;

        const rayCount = quality === 'low' ? 5 : 9;
        state.moonRays = [];

        for (let i = 0; i < rayCount; i++) {
            state.moonRays.push({
                angle: (Math.PI / 4) + (i / rayCount) * (Math.PI / 2),
                length: rand(200, 400),
                width: rand(40, 80),
                opacity: rand(0.05, 0.15),
                drift: rand(0, Math.PI*2),
                driftSpeed: rand(0.1, 0.3)
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        state.moonGlow += dt;

        const glowPulse = (Math.sin(state.moonGlow * 0.5) + 1) * 0.5;

        // Rayons de lune
        ctx.globalCompositeOperation = 'lighter';
        if (state.moonRays) for (const ray of state.moonRays) {
            ray.drift += ray.driftSpeed * dt;

            const angleOffset = Math.sin(ray.drift) * 0.1;
            const finalAngle = ray.angle + angleOffset;

            const startX = state.moonX;
            const startY = state.moonY;
            const endX = startX + Math.cos(finalAngle) * ray.length;
            const endY = startY + Math.sin(finalAngle) * ray.length;

            const grad = ctx.createLinearGradient(startX, startY, endX, endY);
            const hr = parseInt(cfg.c[0].slice(1,3),16);
            const hg = parseInt(cfg.c[0].slice(3,5),16);
            const hb = parseInt(cfg.c[0].slice(5,7),16);
            grad.addColorStop(0, 'rgba('+hr+','+hg+','+hb+','+ray.opacity+')');
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.globalAlpha = fadeIn;

            ctx.beginPath();
            const perpX = -Math.sin(finalAngle);
            const perpY = Math.cos(finalAngle);
            ctx.moveTo(startX + perpX * ray.width/2, startY + perpY * ray.width/2);
            ctx.lineTo(endX + perpX * ray.width/4, endY + perpY * ray.width/4);
            ctx.lineTo(endX - perpX * ray.width/4, endY - perpY * ray.width/4);
            ctx.lineTo(startX - perpX * ray.width/2, startY - perpY * ray.width/2);
            ctx.closePath();
            ctx.fill();
        }

        // Lune
        const moonGrad = ctx.createRadialGradient(state.moonX, state.moonY, 0, state.moonX, state.moonY, 60);
        moonGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        moonGrad.addColorStop(0.5, 'rgba(200, 210, 230, 0.3)');
        moonGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = moonGrad;
        ctx.globalAlpha = fadeIn * (0.7 + glowPulse * 0.3);
        ctx.fillRect(state.moonX - 60, state.moonY - 60, 120, 120);

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// --- GOLDENHOUR: Lumière dorée qui change de direction ---
AT.goldenhour = {
    init(cfg) {
        state.sunAngle = 0;
        state.sunX = W * 0.2;
        state.sunY = H * 0.3;

        const particleCount = cap(25, quality);
        state.dustParticles = [];

        for (let i = 0; i < particleCount; i++) {
            state.dustParticles.push({
                x: rand(0, W),
                y: rand(0, H),
                size: rand(2, 6),
                drift: rand(0, Math.PI*2),
                driftSpeed: rand(0.3, 0.8),
                floatSpeed: rand(10, 30),
                color: cfg.c[i % cfg.c.length]
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        state.sunAngle += dt * 0.2;

        // Soleil qui se déplace lentement
        state.sunX = W * 0.3 + Math.cos(state.sunAngle) * W * 0.2;
        state.sunY = H * 0.3 + Math.sin(state.sunAngle * 0.5) * H * 0.1;

        // Gradient de lumière dorée global
        const bgGrad = ctx.createRadialGradient(state.sunX, state.sunY, 0, state.sunX, state.sunY, Math.max(W, H));
        const hr = parseInt(cfg.c[0].slice(1,3),16);
        const hg = parseInt(cfg.c[0].slice(3,5),16);
        const hb = parseInt(cfg.c[0].slice(5,7),16);
        bgGrad.addColorStop(0, 'rgba('+hr+','+hg+','+hb+',0.1)');
        bgGrad.addColorStop(0.5, 'rgba('+hr+','+hg+','+hb+',0.03)');
        bgGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = bgGrad;
        ctx.globalAlpha = fadeIn;
        ctx.fillRect(0, 0, W, H);

        // Particules de poussière dans la lumière
        ctx.globalCompositeOperation = 'lighter';
        if (state.dustParticles) for (const p of state.dustParticles) {
            p.drift += p.driftSpeed * dt;
            p.x += Math.cos(p.drift) * p.floatSpeed * dt;
            p.y += Math.sin(p.drift * 0.7) * p.floatSpeed * dt * 0.5;

            // Wrap
            if (p.x < -20) p.x = W + 20;
            if (p.x > W + 20) p.x = -20;
            if (p.y < -20) p.y = H + 20;
            if (p.y > H + 20) p.y = -20;

            // Plus visible près du soleil
            const distToSun = dist(p.x, p.y, state.sunX, state.sunY);
            const sunFactor = Math.max(0, 1 - distToSun / 300);

            ctx.globalAlpha = fadeIn * (0.2 + sunFactor * 0.6);
            glow(4, p.color);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// --- STORM: Éclairs qui frappent + pluie torrentielle ---
AT.storm = {
    init(cfg) {
        const rainCount = cap(60, quality);
        state.rainDrops = [];
        state.lightnings = [];
        state.nextLightning = rand(2, 5);

        for (let i = 0; i < rainCount; i++) {
            state.rainDrops.push({
                x: rand(0, W),
                y: rand(-H, H),
                speed: rand(400, 700),
                length: rand(15, 30),
                width: rand(1, 2)
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);

        // Pluie
        if (state.rainDrops) for (const drop of state.rainDrops) {
            drop.y += drop.speed * dt;
            if (drop.y > H + 50) {
                drop.y = -50;
                drop.x = rand(0, W);
            }

            ctx.globalAlpha = fadeIn * 0.3;
            ctx.strokeStyle = cfg.c[0];
            ctx.lineWidth = drop.width;
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x - 2, drop.y + drop.length);
            ctx.stroke();
        }

        // Gestion des éclairs
        state.nextLightning -= dt;
        if (state.nextLightning <= 0) {
            // Créer nouvel éclair
            state.lightnings.push({
                x: rand(W * 0.2, W * 0.8),
                age: 0,
                duration: 0.2,
                branches: []
            });

            // Générer branches d'éclair
            const lightning = state.lightnings[state.lightnings.length - 1];
            let currentX = lightning.x;
            let currentY = 0;

            for (let i = 0; i < 8; i++) {
                const nextX = currentX + rand(-30, 30);
                const nextY = currentY + rand(H / 10, H / 8);
                lightning.branches.push({x1: currentX, y1: currentY, x2: nextX, y2: nextY});
                currentX = nextX;
                currentY = nextY;

                if (currentY > H) break;
            }

            state.nextLightning = rand(3, 7);
        }

        // Dessiner éclairs actifs
        ctx.globalCompositeOperation = 'lighter';
        if (state.lightnings) {
            for (let i = state.lightnings.length - 1; i >= 0; i--) {
                const lightning = state.lightnings[i];
                lightning.age += dt;

                if (lightning.age > lightning.duration) {
                    state.lightnings.splice(i, 1);
                    continue;
                }

                const alpha = 1 - (lightning.age / lightning.duration);

                ctx.globalAlpha = fadeIn * alpha;
                glow(15, '#ffffff');
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;

                for (const branch of lightning.branches) {
                    ctx.beginPath();
                    ctx.moveTo(branch.x1, branch.y1);
                    ctx.lineTo(branch.x2, branch.y2);
                    ctx.stroke();
                }
            }
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// --- EMBER: Braises qui s'envolent d'un feu + fumée ---
AT.ember = {
    init(cfg) {
        const emberCount = cap(30, quality);
        state.embers = [];

        for (let i = 0; i < emberCount; i++) {
            state.embers.push({
                x: W * 0.5 + rand(-100, 100),
                y: H + rand(0, 50),
                vy: -rand(40, 120),
                vx: rand(-20, 20),
                size: rand(2, 6),
                life: rand(0.5, 1),
                decay: rand(0.2, 0.4),
                glow: rand(0, Math.PI*2),
                glowSpeed: rand(4, 8),
                color: cfg.c[i % cfg.c.length]
            });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        if (state.embers) for (let i = state.embers.length - 1; i >= 0; i--) {
            const e = state.embers[i];
            e.y += e.vy * dt;
            e.x += e.vx * dt;
            e.life -= e.decay * dt;
            e.glow += e.glowSpeed * dt;

            // Respawn si mort ou hors écran
            if (e.life <= 0 || e.y < -50) {
                e.x = W * 0.5 + rand(-100, 100);
                e.y = H + rand(0, 50);
                e.life = rand(0.5, 1);
                e.vy = -rand(40, 120);
                e.vx = rand(-20, 20);
            }

            const glowFactor = (Math.sin(e.glow) + 1) * 0.5;
            const alpha = e.life * (0.4 + glowFactor * 0.6);

            ctx.globalAlpha = fadeIn * alpha;
            glow(8, e.color);
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size * e.life, 0, Math.PI*2);
            ctx.fill();

            // Trail de fumée
            if (quality !== 'low') {
                ctx.globalAlpha = fadeIn * e.life * 0.2;
                ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
                ctx.beginPath();
                ctx.arc(e.x, e.y + 10, e.size * 1.5, 0, Math.PI*2);
                ctx.fill();
            }
        }

        noGlow();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fadeIn;
    }
};

// ==========================================================
// ANCIENNES ANIMATIONS (à conserver pour compatibilité)
// ==========================================================

// --- PARTICLES: elegant floating orbs ---
AT.particles = {
    init(cfg) {
        const count = cap(120, quality); // MASSIVELY INCREASED for spectacular effect (was 80)
        state.pts = [];
        for (let i = 0; i < count; i++) {
            state.pts.push({ x: rand(0, W), y: rand(0, H), phase: rand(0, Math.PI*2), speed: rand(0.15, 0.5), size: rand(4, 11), orbit: rand(25, 80), color: cfg.c[i % cfg.c.length] }); // SIZE BOOSTED: 3-8 → 4-11 for "WOW" factor
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        if (state.pts) for (const p of state.pts) {
            p.phase += p.speed * dt;
            const nx = quality === 'low' ? Math.sin(p.phase) : noise2D(p.phase, p.y * 0.005);
            const ny = quality === 'low' ? Math.cos(p.phase * 0.7) : noise2D(p.x * 0.005, p.phase);
            let dx = p.x + nx * p.orbit, dy = p.y + ny * p.orbit;
            if (mouse.active) { const md = dist(dx, dy, mouse.sx, mouse.sy); if (md < 200) { const pull = (1-md/200)*0.3; dx = lerp(dx, mouse.sx, pull); dy = lerp(dy, mouse.sy, pull); } }
            const pulse = (Math.sin(p.phase * 2) + 1) * 0.5;
            ctx.globalAlpha = fadeIn * (0.35 + pulse * 0.50); // OPACITY BOOSTED: 0.25-0.65 → 0.35-0.85 for SPECTACULAR visibility
            glow(15, p.color); // Increased glow: 10 → 15
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(dx, dy, p.size * (0.8 + pulse * 0.4), 0, Math.PI * 2); ctx.fill();
        }
        noGlow(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fadeIn;
    }
};

// --- SHIMMER: soft sparkles for light themes ---
AT.shimmer = {
    init(cfg) {
        const count = cap(25, quality);
        state.dots = [];
        for (let i = 0; i < count; i++) {
            state.dots.push({ x: rand(0, W), y: rand(0, H), phase: rand(0, Math.PI*2), speed: rand(0.3, 1.2), size: rand(1, 3), vx: rand(-3, 3), vy: rand(-3, 3), color: cfg.c[i % cfg.c.length] });
        }
    },
    render(dt, cfg) {
        // Defensive check: ensure state.dots exists and is iterable
        if (!state.dots || !Array.isArray(state.dots)) {
            this.init(cfg); // Auto-init if missing
            if (!state.dots || !Array.isArray(state.dots)) {
                ctx.clearRect(0, 0, W, H);
                return; // Failsafe: skip render if still broken
            }
        }

        ctx.clearRect(0, 0, W, H);
        for (const d of state.dots) {
            d.phase += d.speed * dt;
            d.x += d.vx * dt; d.y += d.vy * dt;
            if (d.x < -10) d.x = W + 10; if (d.x > W + 10) d.x = -10;
            if (d.y < -10) d.y = H + 10; if (d.y > H + 10) d.y = -10;
            const pulse = (Math.sin(d.phase) + 1) * 0.5;
            ctx.globalAlpha = fadeIn * pulse * 0.4;
            ctx.fillStyle = d.color;
            ctx.beginPath(); ctx.arc(d.x, d.y, d.size * (0.5 + pulse * 0.5), 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = fadeIn;
    }
};

// --- FIREFLIES: organic pulsing warm lights ---
AT.fireflies = {
    init(cfg) {
        const count = cap(22, quality);
        state.flies = [];
        for (let i = 0; i < count; i++) {
            state.flies.push({ x: rand(0, W), y: rand(0, H), bx: rand(0, W), by: rand(0, H), phase: rand(0, Math.PI*2), pulse: rand(0, Math.PI*2), radius: rand(30, 120), speed: rand(0.3, 0.8), color: cfg.c[i % cfg.c.length] });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        if (state.flies) for (const f of state.flies) {
            f.phase += f.speed * dt; f.pulse += dt * 3;
            let tx, ty;
            if (quality === 'low') { tx = f.bx + Math.cos(f.phase) * f.radius; ty = f.by + Math.sin(f.phase * 0.7) * f.radius * 0.6; }
            else { tx = f.bx + Math.cos(f.phase) * f.radius + noise2D(f.phase, f.bx * 0.01) * 40; ty = f.by + Math.sin(f.phase * 0.7) * f.radius * 0.6 + noise2D(f.by * 0.01, f.phase) * 30; }
            if (mouse.active) { const md = dist(tx, ty, mouse.sx, mouse.sy); if (md < 250) { const pull = (1-md/250)*0.4; tx = lerp(tx, mouse.sx, pull); ty = lerp(ty, mouse.sy, pull); } }
            f.x = lerp(f.x, tx, dt * 3); f.y = lerp(f.y, ty, dt * 3);
            const p = (Math.sin(f.pulse) + 1) * 0.5;
            ctx.globalAlpha = fadeIn * (0.2 + p * 0.6); glow(15, f.color); ctx.fillStyle = f.color;
            ctx.beginPath(); ctx.arc(f.x, f.y, 2 + p * 2, 0, Math.PI * 2); ctx.fill();
        }
        noGlow(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fadeIn;
    }
};

// --- STARS: twinkling starfield + nebula ---
AT.stars = {
    init(cfg) {
        state.layers = [[], [], []];
        const counts = [cap(70, quality), cap(40, quality), cap(20, quality)];
        for (let l = 0; l < 3; l++) {
            for (let i = 0; i < counts[l]; i++) {
                state.layers[l].push({ x: rand(0, W), y: rand(0, H), size: rand(0.5, 1.5) + l * 0.5, twinkle: rand(0, Math.PI*2), speed: 0.3 + l * 0.7 });
            }
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        if (quality !== 'low') {
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 2; i++) {
                const nx = W * 0.3 + noise2D(i * 3.7 + time * 0.015, 0.5) * W * 0.4;
                const ny = H * 0.3 + noise2D(0.5, i * 3.7 + time * 0.015) * H * 0.3;
                const r = 180 + noise2D(i * 2, time * 0.02) * 80;
                const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
                grad.addColorStop(0, cfg.c[i % cfg.c.length].replace(')', ',0.05)').replace('rgb', 'rgba').replace('#', '')); // fallback
                const cc = cfg.c[i % cfg.c.length];
                // Parse hex to rgba
                const hr = parseInt(cc.slice(1,3),16), hg = parseInt(cc.slice(3,5),16), hb = parseInt(cc.slice(5,7),16);
                grad.addColorStop(0, 'rgba('+hr+','+hg+','+hb+',0.05)');
                grad.addColorStop(0.5, 'rgba('+hr+','+hg+','+hb+',0.02)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad; ctx.globalAlpha = fadeIn; ctx.fillRect(nx-r, ny-r, r*2, r*2);
            }
            ctx.globalCompositeOperation = 'source-over';
        }
        const px = mouse.active ? (mouse.sx - W/2) * 0.01 : 0;
        const py = mouse.active ? (mouse.sy - H/2) * 0.01 : 0;
        for (let l = 0; l < 3; l++) {
            const pf = (l+1) * 0.8;
            if (state.layers[l]) for (const s of state.layers[l]) {
                s.twinkle += dt * (0.8 + l * 0.5);
                const b = (Math.sin(s.twinkle) + 1) * 0.5;
                const sx = s.x + px * pf, sy = s.y + py * pf;
                ctx.globalAlpha = fadeIn * (0.15 + b * 0.7);
                if (quality === 'low') { ctx.fillStyle = cfg.c[0]; ctx.fillRect(sx, sy, s.size, s.size); }
                else { glow(3 + l * 2, cfg.c[0]); ctx.fillStyle = l === 2 ? '#fff' : cfg.c[Math.min(l, cfg.c.length-1)]; ctx.beginPath(); ctx.arc(sx, sy, s.size * (0.6 + b * 0.4), 0, Math.PI * 2); ctx.fill(); noGlow(); }
            }
        }
        ctx.globalAlpha = fadeIn;
    }
};

// --- WAVES: gentle sine waves with particles ---
AT.waves = {
    init(cfg) {
        state.rain = [];
        if (quality !== 'low') {
            const rc = cap(40, quality);
            for (let i = 0; i < rc; i++) state.rain.push({ x: rand(0, W), y: rand(-H, H), speed: rand(200, 500), len: rand(10, 25) });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        const ws = getStep();
        const waveConfigs = [
            { yBase: H * 0.3, amp: 25, freq: 0.006, speed: 0.6 },
            { yBase: H * 0.45, amp: 18, freq: 0.009, speed: -0.4 },
            { yBase: H * 0.6, amp: 22, freq: 0.007, speed: 0.5 },
        ];
        for (let w = 0; w < (quality === 'low' ? 2 : 3); w++) {
            const wc = waveConfigs[w];
            const hr = parseInt(cfg.c[w % cfg.c.length].slice(1,3),16), hg = parseInt(cfg.c[w % cfg.c.length].slice(3,5),16), hb = parseInt(cfg.c[w % cfg.c.length].slice(5,7),16);
            ctx.beginPath(); ctx.moveTo(0, H);
            for (let x = 0; x <= W; x += ws) {
                const y = wc.yBase + Math.sin(x * wc.freq + time * wc.speed) * wc.amp + Math.sin(x * wc.freq * 2.3 + time * wc.speed * 0.7) * wc.amp * 0.4;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(W, H); ctx.closePath();
            ctx.fillStyle = 'rgba('+hr+','+hg+','+hb+',0.08)'; ctx.globalAlpha = fadeIn; ctx.fill();
        }
        // Rain
        if (state.rain) for (const r of state.rain) {
            r.y += r.speed * dt; if (r.y > H + 30) { r.y = rand(-50, -10); r.x = rand(0, W); }
            ctx.globalAlpha = fadeIn * 0.2; ctx.strokeStyle = cfg.c[0]; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 1, r.y + r.len); ctx.stroke();
        }
        ctx.globalAlpha = fadeIn;
    }
};

// --- NEON PARTICLES: bright glow with connections ---
AT.neonp = {
    init(cfg) {
        const count = cap(40, quality);
        state.pts = [];
        for (let i = 0; i < count; i++) {
            state.pts.push({ x: rand(0, W), y: rand(0, H), vx: rand(-40, 40), vy: rand(-40, 40), size: rand(1, 3.5), color: cfg.c[i % cfg.c.length], life: rand(0.5, 1) });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        // Connections
        if (quality !== 'low') {
            ctx.lineWidth = 0.8;
            for (let i = 0; i < state.pts.length; i++) {
                for (let j = i + 1; j < state.pts.length; j++) {
                    const a = state.pts[i], b = state.pts[j];
                    const d = dist(a.x, a.y, b.x, b.y);
                    if (d < 120) { ctx.globalAlpha = fadeIn * (1-d/120) * 0.15; ctx.strokeStyle = a.color; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
                }
            }
        }
        ctx.globalCompositeOperation = 'lighter';
        if (state.pts) for (const p of state.pts) {
            p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 0.1;
            if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
            p.x = Math.max(0, Math.min(W, p.x)); p.y = Math.max(0, Math.min(H, p.y));
            if (p.life <= 0) { p.x = rand(0, W); p.y = rand(0, H); p.life = rand(0.5, 1); }
            if (mouse.active) { const md = dist(p.x, p.y, mouse.sx, mouse.sy); if (md < 150) { const f = (1-md/150)*200*dt; p.vx += (p.x-mouse.sx)/md*f; p.vy += (p.y-mouse.sy)/md*f; } }
            ctx.globalAlpha = fadeIn * p.life * 0.7; glow(12, p.color); ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
        noGlow(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fadeIn;
    }
};

// --- TRON GRID: perspective grid with light pulses ---
AT.trongrid = {
    init(cfg) {
        state.pulses = [];
        for (let i = 0; i < cap(8, quality); i++) {
            state.pulses.push({ pos: rand(0, 1), speed: rand(0.1, 0.3), vertical: Math.random() > 0.5 });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        const vx = W * 0.5, vy = H * 0.9;
        const lines = quality === 'low' ? 10 : 18;
        const hr = parseInt(cfg.c[0].slice(1,3),16), hg = parseInt(cfg.c[0].slice(3,5),16), hb = parseInt(cfg.c[0].slice(5,7),16);
        ctx.strokeStyle = 'rgba('+hr+','+hg+','+hb+',0.06)'; ctx.lineWidth = 1;
        for (let i = 1; i <= lines; i++) {
            const t = i / lines; const y = vy - t * t * H * 0.8; const spread = (1 - t * 0.3) * W * 0.8;
            ctx.beginPath(); ctx.moveTo(vx - spread, y); ctx.lineTo(vx + spread, y); ctx.stroke();
        }
        for (let i = -8; i <= 8; i++) {
            const angle = i * 0.12;
            ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + Math.sin(angle) * W, vy - H); ctx.stroke();
        }
        // Light pulses
        ctx.globalCompositeOperation = 'lighter';
        if (state.pulses) for (const p of state.pulses) {
            p.pos = (p.pos + p.speed * dt) % 1;
            const t = p.pos; const y = vy - t * t * H * 0.8; const spread = (1 - t * 0.3) * W * 0.8;
            const grad = ctx.createLinearGradient(vx - spread * 0.3, y, vx + spread * 0.3, y);
            grad.addColorStop(0, 'transparent'); grad.addColorStop(0.5, 'rgba('+hr+','+hg+','+hb+',0.3)'); grad.addColorStop(1, 'transparent');
            ctx.strokeStyle = grad; ctx.lineWidth = 2;
            ctx.globalAlpha = fadeIn * 0.6; ctx.beginPath(); ctx.moveTo(vx - spread, y); ctx.lineTo(vx + spread, y); ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fadeIn;
    }
};

// --- HOLOGRAM: iridescent shifting circles ---
AT.hologram = {
    init(cfg) {
        state.circles = [];
        const count = cap(12, quality);
        for (let i = 0; i < count; i++) {
            state.circles.push({ x: rand(0, W), y: rand(0, H), r: rand(40, 120), phase: rand(0, Math.PI*2), speed: rand(0.2, 0.6), ci: i });
        }
    },
    render(dt, cfg) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        if (state.circles) for (const c of state.circles) {
            c.phase += c.speed * dt;
            const px = quality === 'low' ? Math.sin(c.phase) * 30 : noise2D(c.phase, c.ci * 2) * 50;
            const py = quality === 'low' ? Math.cos(c.phase * 0.7) * 25 : noise2D(c.ci * 2, c.phase) * 40;
            const dx = c.x + px, dy = c.y + py;
            const colorIdx = (c.ci + Math.floor(time * 0.3)) % cfg.c.length;
            const col = cfg.c[colorIdx];
            const hr = parseInt(col.slice(1,3),16), hg = parseInt(col.slice(3,5),16), hb = parseInt(col.slice(5,7),16);
            const grad = ctx.createRadialGradient(dx, dy, 0, dx, dy, c.r);
            grad.addColorStop(0, 'rgba('+hr+','+hg+','+hb+',0.08)');
            grad.addColorStop(0.6, 'rgba('+hr+','+hg+','+hb+',0.03)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad; ctx.globalAlpha = fadeIn; ctx.fillRect(dx - c.r, dy - c.r, c.r * 2, c.r * 2);
        }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fadeIn;
    }
};

// --- UNIQUE: MATRIX ("I don't even see the code" — Cypher, 1999) ---
AT.matrix = {
    init() {
        state.matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンヴガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ' +
            'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ' +
            '0123456789:.*<>';
        var charsLen = state.matrixChars.length;

        // 3 depth layers for parallax
        var layers = [
            { fontSize: 10, alpha: 0.30, colW: 12 },  // far
            { fontSize: 14, alpha: 0.55, colW: 16 },  // mid
            { fontSize: 18, alpha: 0.80, colW: 20 }   // near
        ];

        // Build columns grouped by fontSize (minimizes ctx.font switches)
        var colsBySize = {};
        for (var li = 0; li < layers.length; li++) {
            var L = layers[li];
            var key = L.fontSize;
            if (!colsBySize[key]) colsBySize[key] = [];
            var count = Math.max(6, Math.floor(W / L.colW));
            for (var i = 0; i < count; i++) {
                var trailLen = (80 + (Math.random() * 60)) | 0;
                var charBuf = [];
                for (var j = 0; j < trailLen; j++) {
                    charBuf.push(state.matrixChars[(Math.random() * charsLen) | 0]);
                }
                var spacing = L.fontSize + 1;
                var la = L.alpha;
                // Pre-compute fade LUT: avoid string concat per char per frame
                var fadeLUT = [];
                for (var fj = 0; fj < trailLen; fj++) {
                    if (fj <= 2) {
                        fadeLUT[fj] = null; // handled by headStyle/bodyStyle
                    } else {
                        var fade = (1 - fj / trailLen);
                        fade = fade * fade * la * 0.7;
                        fadeLUT[fj] = fade < 0.02 ? null : 'rgba(0,204,51,' + fade.toFixed(3) + ')';
                    }
                }
                colsBySize[key].push({
                    x: i * L.colW + rand(0, L.colW * 0.4),
                    y: -(100 + Math.random() * 200),
                    speed: 35 + Math.random() * 105,
                    trail: trailLen,
                    spacing: spacing,
                    headStyle: 'rgba(100,230,140,' + (la * 0.95).toFixed(3) + ')',
                    bodyStyle: 'rgba(0,204,51,' + (la * 0.80).toFixed(3) + ')',
                    fadeLUT: fadeLUT,
                    chars: charBuf
                });
            }
        }
        // Create ordered groups array for render loop
        state.colGroups = [];
        var sizes = Object.keys(colsBySize);
        for (var si = 0; si < sizes.length; si++) {
            state.colGroups.push({
                font: sizes[si] + 'px monospace',
                cols: colsBySize[sizes[si]]
            });
        }

        // Black canvas — columns rain down naturally from above screen
        if (ctx) {
            ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
            ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
            ctx.imageSmoothingEnabled = false;
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        }

        // CRT scanlines pattern (created once, cached as pattern)
        state.crtScanlines = null;
        state.crtPattern = null;
        if (quality !== 'low' && ctx) {
            var scanCvs = document.createElement('canvas');
            scanCvs.width = 4; scanCvs.height = H || 1080;
            var sctx = scanCvs.getContext('2d');
            sctx.fillStyle = 'rgba(0,0,0,0.10)';
            for (var sy = 0; sy < scanCvs.height; sy += 3) {
                sctx.fillRect(0, sy, 4, 1);
            }
            state.crtScanlines = scanCvs;
            state.crtPattern = ctx.createPattern(scanCvs, 'repeat');
        }
    },
    render(dt) {
        // Near-opaque black wipe — kills ghosting, chars are crisp
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, W, H);
        var chars = state.matrixChars;
        var charsLen = chars.length;
        if (!state.colGroups) return;

        // Zero blur for razor-sharp characters
        ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

        // Render by font-size groups to minimize ctx.font switches (expensive)
        var groups = state.colGroups;
        for (var gi = 0; gi < groups.length; gi++) {
            var grp = groups[gi];
            ctx.font = grp.font;
            var cols = grp.cols;
            for (var ci = 0; ci < cols.length; ci++) {
                var c = cols[ci];
                c.y += c.speed * dt;
                var trail = quality === 'low' ? Math.min(c.trail, 20) : c.trail;
                var spacing = c.spacing;
                var headStyle = c.headStyle;
                var bodyStyle = c.bodyStyle;
                for (var j = 0; j < trail; j++) {
                    var cy = c.y - j * spacing;
                    if (cy < -20 || cy > H + 20) continue;
                    // Mutation: ~1.5% per visible char per frame
                    if (Math.random() < 0.015) {
                        c.chars[j] = chars[(Math.random() * charsLen) | 0];
                    }
                    // Head bright, body with pre-cached fade LUT
                    if (j === 0) {
                        ctx.fillStyle = headStyle;
                    } else if (j <= 2) {
                        ctx.fillStyle = bodyStyle;
                    } else {
                        var fs = c.fadeLUT[j];
                        if (!fs) continue; // skip invisible chars
                        ctx.fillStyle = fs;
                    }
                    ctx.fillText(c.chars[j], c.x, cy);
                }
                // Reset off-screen columns
                if (c.y - trail * spacing > H) {
                    c.y = -(100 + Math.random() * 200);
                    c.speed = 35 + Math.random() * 105;
                    for (var rj = 0; rj < c.chars.length; rj++) {
                        c.chars[rj] = chars[(Math.random() * charsLen) | 0];
                    }
                }
            }
        }
        // CRT scanlines (no per-frame noise — reduces micro-stutters)
        if (quality !== 'low' && state.crtScanlines) {
            ctx.globalAlpha = 0.2;
            var pat = state.crtPattern;
            if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); }
            ctx.globalAlpha = 1;
        }
    }
};

// --- UNIQUE: CYBERPUNK ---
AT.cyberpunk = {
    init() {
        state.glitchTimer = 0; state.glitchBands = []; state.particles = [];
        const pc = cap(50, quality);
        for (let i = 0; i < pc; i++) state.particles.push({ x: rand(0,W), y: rand(0,H), vx: rand(-40,40), vy: rand(-40,40), size: rand(1,3), color: ['#ff00ff','#00ffff','#ff0088','#8800ff'][(Math.random()*4)|0], life: rand(0.5,1) });
    },
    render(dt) {
        ctx.clearRect(0, 0, W, H);
        const vx = W*0.5+(mouse.active?(mouse.sx-W/2)*0.05:0), vy = H*0.88;
        const gl = quality === 'low' ? 10 : 20;
        ctx.strokeStyle = 'rgba(255,0,255,0.08)'; ctx.lineWidth = 1;
        for (let i = 1; i <= gl; i++) { const t = i/gl, y = vy-t*t*H*0.8, s = (1-t*0.3)*W*0.8; ctx.beginPath(); ctx.moveTo(vx-s,y); ctx.lineTo(vx+s,y); ctx.stroke(); }
        for (let i = -8; i <= 8; i++) { const a = i*0.12; ctx.beginPath(); ctx.moveTo(vx,vy); ctx.lineTo(vx+Math.sin(a)*W,vy-H); ctx.stroke(); }
        ctx.globalCompositeOperation = 'lighter';
        if (state.particles) for (const p of state.particles) {
            p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt*0.15;
            if (p.x<0||p.x>W) p.vx *= -1; if (p.y<0||p.y>H) p.vy *= -1;
            p.x = Math.max(0,Math.min(W,p.x)); p.y = Math.max(0,Math.min(H,p.y));
            if (p.life <= 0) { p.x=rand(0,W); p.y=rand(0,H); p.life=rand(0.5,1); }
            ctx.fillStyle = p.color; glow(10, p.color); ctx.globalAlpha = fadeIn*p.life*0.7;
            ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
        }
        noGlow(); ctx.globalAlpha = fadeIn; ctx.globalCompositeOperation = 'source-over';
        state.glitchTimer -= dt;
        if (state.glitchTimer <= 0) { state.glitchTimer = rand(1.5,4); state.glitchBands = []; for (let i = 0; i < ((rand(1,4))|0); i++) state.glitchBands.push({ y:rand(0,H), h:rand(2,15), shift:rand(-25,25), life:rand(0.08,0.2), color: Math.random()>0.5?'rgba(255,0,255,':'rgba(0,255,255,' }); }
        if (state.glitchBands) for (const b of state.glitchBands) { if (b.life>0) { b.life -= dt; ctx.fillStyle = b.color+Math.min(0.3,b.life*3)+')'; ctx.fillRect(b.shift,b.y,W,b.h); } }
    }
};

// --- UNIQUE: TERMINAL (AMBER) ---
AT.terminal = {
    init() {
        state.lines = []; state.scanY = 0; state.flickerAlpha = 1; state.nextLine = 0;
        state.cmds = ['$ npm run build --production','$ git push origin main','root@srv:~# systemctl status nginx','$ docker compose up -d','>>> import tensorflow as tf','$ ssh deploy@production-01','mysql> SELECT COUNT(*) FROM tasks;','$ curl -s https://api.app.com/health','$ kubectl get pods -n production','OK (237 tests passed in 4.2s)','Build complete. 14 modules compiled.','Deployment successful. Version 4.7.2'];
        for (let i = 0; i < cap(12, quality); i++) state.lines.push({ text: state.cmds[(Math.random()*state.cmds.length)|0], y: H*0.2+i*22, alpha: 0.15+rand(0,0.15), typed: 999 });
    },
    render(dt) {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(20,16,0,0.03)'; ctx.fillRect(0,0,W,H);
        if (Math.random() < 0.005) state.flickerAlpha = 0.7;
        state.flickerAlpha = lerp(state.flickerAlpha, 1, dt * 8);
        ctx.globalAlpha = fadeIn * state.flickerAlpha;
        if (quality !== 'low') { ctx.fillStyle = 'rgba(0,0,0,0.06)'; const ss = quality === 'medium' ? 6 : 4; for (let y = 0; y < H; y += ss) ctx.fillRect(0,y,W,1); }
        state.scanY = (state.scanY + dt*120) % (H+40);
        ctx.fillStyle = 'rgba(255,176,0,0.03)'; ctx.fillRect(0,state.scanY-20,W,40);
        state.nextLine -= dt;
        if (state.nextLine <= 0) { state.nextLine = rand(0.8,2.5); state.lines.push({ text: state.cmds[(Math.random()*state.cmds.length)|0], y: H-40, alpha: 0.6, typed: 0 }); if (state.lines) for (const l of state.lines) l.y -= 22; }
        ctx.font = (quality === 'low' ? 12 : 13) + 'px monospace';
        for (let i = state.lines.length-1; i >= 0; i--) {
            const l = state.lines[i]; l.typed += dt * 40;
            if (l.y < -30) { state.lines.splice(i,1); continue; }
            l.alpha = Math.max(0.05, l.alpha - dt*0.02);
            const dt2 = l.text.substring(0, Math.floor(l.typed));
            const jitter = quality === 'low' ? 0 : noise2D(l.y*0.1,time)*1.5;
            glow(8,'#FFB000'); ctx.fillStyle = 'rgba(255,176,0,'+l.alpha+')'; ctx.fillText(dt2, 30+jitter, l.y); noGlow();
            if (l.typed < l.text.length && Math.sin(time*8) > 0) { const cx = 30+ctx.measureText(dt2).width+2; ctx.fillStyle = 'rgba(255,176,0,'+l.alpha+')'; ctx.fillRect(cx,l.y-12,8,14); }
        }
        if (mouse.active && quality !== 'low') { const grad = ctx.createRadialGradient(mouse.sx,mouse.sy,0,mouse.sx,mouse.sy,150); grad.addColorStop(0,'rgba(255,176,0,0.04)'); grad.addColorStop(1,'transparent'); ctx.fillStyle = grad; ctx.fillRect(mouse.sx-150,mouse.sy-150,300,300); }
        ctx.globalAlpha = fadeIn;
    }
};

// --- UNIQUE: PIP-BOY (Fallout 3000 CRT) ---
AT.pipboy = {
    init() {
        // CRT scanlines pattern (every 2px, denser than Matrix)
        state.crtScanlines = null;
        if (quality !== 'low') {
            var scanCvs = document.createElement('canvas');
            scanCvs.width = 4; scanCvs.height = H || 1080;
            var sctx = scanCvs.getContext('2d');
            sctx.fillStyle = 'rgba(0,0,0,0.14)';
            for (var sy = 0; sy < scanCvs.height; sy += 2) {
                sctx.fillRect(0, sy, 4, 1);
            }
            state.crtScanlines = scanCvs;
        }
        // Static noise state
        state.noiseTimer = 0;
        state.flickerAlpha = 1;
        // Geiger counter dots
        state.geigerDots = [];
        state.geigerTimer = 0;
        // Vignette gradient (CRT screen curvature)
        state.vignette = null;
        if (quality !== 'low') {
            var vCvs = document.createElement('canvas');
            vCvs.width = W; vCvs.height = H;
            var vctx = vCvs.getContext('2d');
            var vgrad = vctx.createRadialGradient(W*0.5, H*0.5, Math.min(W,H)*0.25, W*0.5, H*0.5, Math.max(W,H)*0.72);
            vgrad.addColorStop(0, 'rgba(0,0,0,0)');
            vgrad.addColorStop(0.55, 'rgba(0,0,0,0)');
            vgrad.addColorStop(0.82, 'rgba(0,0,0,0.3)');
            vgrad.addColorStop(1, 'rgba(0,0,0,0.65)');
            vctx.fillStyle = vgrad;
            vctx.fillRect(0, 0, W, H);
            state.vignette = vCvs;
        }
        // Ambient glow pulse
        state.glowPhase = 0;
        // Radiation needle angle
        state.radNeedle = 0;
        state.radTarget = Math.random() * 0.4 + 0.1;
        state.radTimer = 0;
        // Horizontal sweep line (Pip-Boy scan)
        state.sweepY = 0;
        // Decorative HUD lines drifting
        state.uiLines = [];
        var lineCount = cap(8, quality);
        for (var i = 0; i < lineCount; i++) {
            state.uiLines.push({
                y: rand(H * 0.05, H * 0.95),
                width: rand(W * 0.05, W * 0.35),
                x: rand(-W * 0.1, W * 0.6),
                alpha: rand(0.015, 0.045),
                speed: rand(3, 12)
            });
        }
    },
    render(dt) {
        // Black wipe
        ctx.fillStyle = '#0A0A0A';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = fadeIn;

        // Flicker effect (random CRT flicker)
        if (Math.random() < 0.004) state.flickerAlpha = 0.72 + Math.random() * 0.18;
        state.flickerAlpha = lerp(state.flickerAlpha, 1, dt * 5);
        ctx.globalAlpha = fadeIn * state.flickerAlpha;

        // Subtle ambient glow pulse in center
        state.glowPhase += dt * 0.6;
        if (quality !== 'low') {
            var glowPulse = 0.025 + Math.sin(state.glowPhase) * 0.012;
            var grd = ctx.createRadialGradient(W*0.5, H*0.45, 0, W*0.5, H*0.45, Math.max(W,H)*0.55);
            grd.addColorStop(0, 'rgba(0,255,119,' + glowPulse + ')');
            grd.addColorStop(0.4, 'rgba(0,200,85,' + (glowPulse * 0.3) + ')');
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, W, H);
        }

        // Drifting horizontal HUD decoration lines
        if (state.uiLines && quality !== 'low') {
            for (var li = 0; li < state.uiLines.length; li++) {
                var ln = state.uiLines[li];
                ln.x += ln.speed * dt;
                if (ln.x > W + 10) { ln.x = -ln.width - 10; ln.y = rand(H * 0.05, H * 0.95); }
                ctx.fillStyle = 'rgba(0,255,119,' + ln.alpha + ')';
                ctx.fillRect(ln.x, ln.y, ln.width, 1);
            }
        }

        // Horizontal sweep line (like a radar/CRT scan)
        state.sweepY = (state.sweepY + dt * 80) % (H + 60);
        ctx.fillStyle = 'rgba(0,255,119,0.025)';
        ctx.fillRect(0, state.sweepY - 30, W, 60);
        ctx.fillStyle = 'rgba(0,255,119,0.06)';
        ctx.fillRect(0, state.sweepY - 2, W, 4);

        // CRT scanlines (every 2px)
        if (quality !== 'low' && state.crtScanlines) {
            ctx.globalAlpha = fadeIn * state.flickerAlpha * 0.4;
            var pat = ctx.createPattern(state.crtScanlines, 'repeat');
            if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); }
            ctx.globalAlpha = fadeIn * state.flickerAlpha;
        }

        // Static noise grain
        state.noiseTimer += dt;
        if (state.noiseTimer > 0.055) {
            state.noiseTimer = 0;
            var nc = quality === 'ultra' ? 200 : (quality === 'high' ? 140 : 60);
            for (var n = 0; n < nc; n++) {
                var nAlpha = Math.random() * 0.055;
                ctx.fillStyle = Math.random() > 0.55
                    ? 'rgba(0,255,119,' + nAlpha + ')'
                    : 'rgba(0,0,0,' + (Math.random() * 0.12) + ')';
                ctx.fillRect((Math.random() * W) | 0, (Math.random() * H) | 0, 1, 1);
            }
        }

        // Geiger counter effect — random green dots crackling bottom-right
        state.geigerTimer += dt;
        if (state.geigerTimer > 0.12) {
            state.geigerTimer = 0;
            if (Math.random() < 0.45) {
                var gCount = (1 + Math.random() * 4) | 0;
                for (var gi = 0; gi < gCount; gi++) {
                    state.geigerDots.push({
                        x: W - 55 + rand(-25, 25),
                        y: H - 55 + rand(-25, 25),
                        life: rand(0.12, 0.45),
                        size: rand(1, 2.5),
                        alpha: rand(0.25, 0.7)
                    });
                }
            }
        }
        for (var gdi = state.geigerDots.length - 1; gdi >= 0; gdi--) {
            var gd = state.geigerDots[gdi];
            gd.life -= dt;
            if (gd.life <= 0) { state.geigerDots.splice(gdi, 1); continue; }
            var ga = gd.alpha * Math.min(1, gd.life * 3);
            ctx.fillStyle = 'rgba(0,255,119,' + Math.min(1, ga) + ')';
            ctx.fillRect(gd.x, gd.y, gd.size, gd.size);
        }

        // Mini radiation meter (bottom-right corner, decorative)
        if (quality !== 'low') {
            var rx = W - 70, ry = H - 70, rr = 22;
            // Arc background
            ctx.strokeStyle = 'rgba(0,255,119,0.12)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(rx, ry, rr, Math.PI, 0); ctx.stroke();
            // Tick marks
            ctx.strokeStyle = 'rgba(0,255,119,0.2)';
            ctx.lineWidth = 1;
            for (var ti = 0; ti <= 5; ti++) {
                var ta = Math.PI + (ti / 5) * Math.PI;
                ctx.beginPath();
                ctx.moveTo(rx + Math.cos(ta) * (rr - 4), ry + Math.sin(ta) * (rr - 4));
                ctx.lineTo(rx + Math.cos(ta) * (rr + 2), ry + Math.sin(ta) * (rr + 2));
                ctx.stroke();
            }
            // Needle (animated)
            state.radTimer += dt;
            if (state.radTimer > 2.5 + Math.random() * 3) {
                state.radTimer = 0;
                state.radTarget = Math.random() * 0.5 + 0.05;
            }
            state.radNeedle = lerp(state.radNeedle, state.radTarget, dt * 1.2);
            var needleA = Math.PI + state.radNeedle * Math.PI;
            ctx.strokeStyle = 'rgba(0,255,119,0.55)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx + Math.cos(needleA) * (rr - 6), ry + Math.sin(needleA) * (rr - 6));
            ctx.stroke();
            // RAD label
            ctx.font = '9px monospace';
            ctx.fillStyle = 'rgba(0,255,119,0.25)';
            ctx.fillText('RAD', rx - 8, ry + 10);
        }

        // Vignette overlay (dark corners = CRT curvature)
        if (state.vignette && quality !== 'low') {
            ctx.globalAlpha = fadeIn * 0.85;
            ctx.drawImage(state.vignette, 0, 0, W, H);
            ctx.globalAlpha = fadeIn;
        }

        // Mouse interaction: faint green halo
        if (mouse.active && quality !== 'low') {
            var mgrad = ctx.createRadialGradient(mouse.sx, mouse.sy, 0, mouse.sx, mouse.sy, 100);
            mgrad.addColorStop(0, 'rgba(0,255,119,0.035)');
            mgrad.addColorStop(1, 'transparent');
            ctx.fillStyle = mgrad;
            ctx.fillRect(mouse.sx - 100, mouse.sy - 100, 200, 200);
        }

        ctx.globalAlpha = fadeIn;
    }
};

// --- UNIQUE: MIDNIGHT ---
AT.midnight = {
    init() {
        state.layers = [[],[],[]]; state.shootingStars = [];
        const counts = [cap(80,quality), cap(50,quality), cap(25,quality)];
        for (let l = 0; l < 3; l++) for (let i = 0; i < counts[l]; i++) state.layers[l].push({ x: rand(0,W), y: rand(0,H), size: rand(0.5,1.5)+l*0.5, twinkle: rand(0,Math.PI*2), speed: 0.3+l*0.7 });
    },
    render(dt) {
        ctx.clearRect(0, 0, W, H);
        if (quality !== 'low') {
            ctx.globalCompositeOperation = 'lighter';
            const nc = [{r:80,g:40,b:160},{r:40,g:80,b:180},{r:140,g:40,b:100}];
            for (let i = 0; i < (quality==='medium'?2:3); i++) {
                const nx = W*0.3+noise2D(i*3.7+time*0.015,0.5)*W*0.4, ny = H*0.3+noise2D(0.5,i*3.7+time*0.015)*H*0.3, r = 180+noise2D(i*2,time*0.02)*80;
                const c = nc[i], grad = ctx.createRadialGradient(nx,ny,0,nx,ny,r);
                grad.addColorStop(0,'rgba('+c.r+','+c.g+','+c.b+',0.06)'); grad.addColorStop(0.5,'rgba('+c.r+','+c.g+','+c.b+',0.02)'); grad.addColorStop(1,'transparent');
                ctx.fillStyle = grad; ctx.globalAlpha = fadeIn; ctx.fillRect(nx-r,ny-r,r*2,r*2);
            }
            ctx.globalCompositeOperation = 'source-over';
        }
        const px = mouse.active?(mouse.sx-W/2)*0.01:0, py = mouse.active?(mouse.sy-H/2)*0.01:0;
        for (let l = 0; l < 3; l++) { const pf = (l+1)*0.8;
            if (state.layers[l]) for (const s of state.layers[l]) { s.twinkle += dt*(0.8+l*0.5); const b = (Math.sin(s.twinkle)+1)*0.5; const sx = s.x+px*pf, sy = s.y+py*pf;
                ctx.globalAlpha = fadeIn*(0.2+b*0.8);
                if (quality==='low') { ctx.fillStyle='#c8d8ff'; ctx.fillRect(sx,sy,s.size,s.size); }
                else { glow(3+l*2,'#6c8fff'); ctx.fillStyle = l===2?'#fff':(l===1?'#c8d8ff':'#8898cc'); ctx.beginPath(); ctx.arc(sx,sy,s.size*(0.6+b*0.4),0,Math.PI*2); ctx.fill(); noGlow(); }
            }
        }
        if (mouse.active && quality !== 'low') { const cr = 180; ctx.strokeStyle = 'rgba(124,159,255,0.15)'; ctx.lineWidth = 0.8;
            if (state.layers[2]) for (const s1 of state.layers[2]) { const d1 = dist(s1.x,s1.y,mouse.sx,mouse.sy); if (d1>cr) continue;
                if (state.layers[2]) for (const s2 of state.layers[2]) { if (s1===s2) continue; const d2 = dist(s2.x,s2.y,mouse.sx,mouse.sy); if (d2>cr) continue; const dd = dist(s1.x,s1.y,s2.x,s2.y);
                    if (dd<120) { ctx.globalAlpha = fadeIn*(1-d1/cr)*0.3; ctx.beginPath(); ctx.moveTo(s1.x+px*2.4,s1.y+py*2.4); ctx.lineTo(s2.x+px*2.4,s2.y+py*2.4); ctx.stroke(); }
                }
            }
        }
        if (Math.random()<0.003) state.shootingStars.push({ x:rand(0,W*0.8), y:rand(0,H*0.4), len:rand(80,200), speed:rand(600,1200), angle:rand(0.3,0.7), life:1 });
        for (let i = state.shootingStars.length-1; i >= 0; i--) { const ss = state.shootingStars[i]; ss.x += Math.cos(ss.angle)*ss.speed*dt; ss.y += Math.sin(ss.angle)*ss.speed*dt; ss.life -= dt*2; if (ss.life<=0) { state.shootingStars.splice(i,1); continue; }
            const grad = ctx.createLinearGradient(ss.x,ss.y,ss.x-Math.cos(ss.angle)*ss.len,ss.y-Math.sin(ss.angle)*ss.len);
            grad.addColorStop(0,'rgba(255,255,255,'+ss.life*0.9+')'); grad.addColorStop(0.3,'rgba(124,159,255,'+ss.life*0.5+')'); grad.addColorStop(1,'transparent');
            ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.globalAlpha = fadeIn; ctx.beginPath(); ctx.moveTo(ss.x,ss.y); ctx.lineTo(ss.x-Math.cos(ss.angle)*ss.len,ss.y-Math.sin(ss.angle)*ss.len); ctx.stroke();
        }
        ctx.globalAlpha = fadeIn;
    }
};

// --- UNIQUE: OCEAN ---
AT.ocean = {
    init() {
        state.particles = []; state.bubbles = [];
        for (let i = 0; i < cap(50,quality); i++) state.particles.push({ x:rand(0,W), y:rand(H*0.3,H), vx:rand(-8,8), vy:rand(-5,5), size:rand(1,3), glow:rand(0,Math.PI*2) });
        for (let i = 0; i < cap(20,quality); i++) state.bubbles.push({ x:rand(0,W), y:rand(H*0.5,H+50), size:rand(3,10), speed:rand(25,60), wobble:rand(0,Math.PI*2) });
    },
    render(dt) {
        ctx.clearRect(0, 0, W, H);
        const ws = getStep();
        const wc = [{ yBase:H*0.28, amp:20, freq:0.008, speed:0.8, c:'rgba(0,60,100,0.12)' },{ yBase:H*0.32, amp:15, freq:0.012, speed:-0.5, c:'rgba(0,80,130,0.10)' },{ yBase:H*0.35, amp:25, freq:0.006, speed:0.6, c:'rgba(0,100,160,0.08)' }];
        for (let w = 0; w < (quality==='low'?2:3); w++) { const c = wc[w]; ctx.beginPath(); ctx.moveTo(0,H);
            for (let x = 0; x <= W; x += ws) { const y = c.yBase+Math.sin(x*c.freq+time*c.speed)*c.amp+Math.sin(x*c.freq*2.3+time*c.speed*0.7)*c.amp*0.4; ctx.lineTo(x,y); }
            ctx.lineTo(W,H); ctx.closePath(); ctx.fillStyle = c.c; ctx.globalAlpha = fadeIn; ctx.fill();
        }
        ctx.globalCompositeOperation = 'lighter';
        if (state.particles) for (const p of state.particles) {
            if (quality==='low') { p.x+=p.vx*dt; p.y+=p.vy*dt; } else { p.x+=p.vx*dt+noise2D(p.x*0.005,time*0.3)*15*dt; p.y+=p.vy*dt+noise2D(time*0.3,p.y*0.005)*10*dt; }
            p.glow+=dt*2; if(p.x<-10)p.x=W+10; if(p.x>W+10)p.x=-10; if(p.y<H*0.3)p.y=H; if(p.y>H+10)p.y=H*0.3;
            let b = (Math.sin(p.glow)+1)*0.3+0.2;
            if (mouse.active) { const md=dist(p.x,p.y,mouse.sx,mouse.sy); if(md<200)b+=(1-md/200)*0.6; }
            ctx.globalAlpha=fadeIn*b; glow(12,'#00b4d8'); ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
        }
        noGlow(); ctx.globalCompositeOperation = 'source-over';
        if (state.bubbles) for (const b of state.bubbles) { b.y-=b.speed*dt; b.wobble+=dt*2; b.x+=Math.sin(b.wobble)*0.8; if(b.y<H*0.25){b.y=H+rand(10,50);b.x=rand(0,W);}
            ctx.globalAlpha=fadeIn*0.35; ctx.beginPath(); ctx.arc(b.x,b.y,b.size,0,Math.PI*2); ctx.strokeStyle='rgba(0,180,216,0.5)'; ctx.lineWidth=1.5; ctx.stroke();
            ctx.globalAlpha=fadeIn*0.6; ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(b.x-b.size*0.3,b.y-b.size*0.3,b.size*0.2,0,Math.PI*2); ctx.fill();
        }
        ctx.globalAlpha = fadeIn;
    }
};

// --- UNIQUE: SUNSET ---
AT.sunset = {
    init() { state.embers = []; state.rayAngle = 0.4; for (let i = 0; i < cap(55,quality); i++) state.embers.push(mkEmber()); },
    render(dt) {
        ctx.clearRect(0, 0, W, H); state.rayAngle += dt*0.015;
        if (quality !== 'low') { ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < (quality==='medium'?3:5); i++) { const a = state.rayAngle+i*0.15+noise2D(i,time*0.1)*0.05, ox=W*0.85, oy=-30, len=Math.max(W,H)*1.5, sp=0.04+noise2D(i*2,time*0.2)*0.02;
                ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+Math.cos(a-sp)*len,oy+Math.sin(a-sp)*len); ctx.lineTo(ox+Math.cos(a+sp)*len,oy+Math.sin(a+sp)*len); ctx.closePath();
                const grad = ctx.createLinearGradient(ox,oy,ox+Math.cos(a)*len*0.5,oy+Math.sin(a)*len*0.5);
                grad.addColorStop(0,'rgba(249,115,22,0.06)'); grad.addColorStop(0.5,'rgba(251,191,36,0.03)'); grad.addColorStop(1,'transparent');
                ctx.fillStyle=grad; ctx.globalAlpha=fadeIn; ctx.fill(); }
            ctx.globalCompositeOperation = 'source-over';
        }
        ctx.globalCompositeOperation = 'lighter';
        if (state.embers) for (const e of state.embers) { e.y-=e.speed*dt; e.x+=e.drift*dt+(quality==='low'?0:noise2D(e.x*0.003,time*0.5)*20*dt); e.life-=dt*0.12;
            if (mouse.active) { const md=dist(e.x,e.y,mouse.sx,mouse.sy); if(md<250){const f=(1-md/250)*60*dt; e.x+=(mouse.sx-e.x)/md*f; e.y+=(mouse.sy-e.y)/md*f;} }
            if (e.life<=0||e.y<-20) { Object.assign(e,mkEmber()); continue; }
            ctx.globalAlpha=fadeIn*e.life*0.8; glow(14,e.color); ctx.fillStyle=e.color; ctx.beginPath(); ctx.arc(e.x,e.y,e.size*e.life,0,Math.PI*2); ctx.fill();
        }
        noGlow(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fadeIn;
    }
};
function mkEmber() { return { x:rand(0,W), y:rand(H*0.5,H+30), size:rand(2,6), speed:rand(30,80), drift:rand(-15,15), life:rand(0.6,1), color:['#f97316','#fbbf24','#ef4444','#fb7185','#fcd34d'][(Math.random()*5)|0] }; }

// --- UNIQUE: FOREST ---
AT.forest = {
    init() { state.leaves = []; state.fireflies = [];
        const lc = ['#4aaa64','#70c888','#fbbf24','#f97316','#a3e635','#22c55e'];
        for (let i = 0; i < cap(25,quality); i++) state.leaves.push({ x:rand(0,W), y:rand(-H,H), size:rand(5,12), speed:rand(20,50), drift:rand(-1.5,1.5), rot:rand(0,Math.PI*2), rs:rand(-0.8,0.8), sway:rand(0,Math.PI*2), color:lc[(Math.random()*lc.length)|0] });
        for (let i = 0; i < cap(30,quality); i++) state.fireflies.push({ x:rand(0,W), y:rand(0,H), bx:rand(0,W), by:rand(0,H), phase:rand(0,Math.PI*2), pulse:rand(0,Math.PI*2), radius:rand(30,120), speed:rand(0.3,0.8) });
    },
    render(dt) {
        ctx.clearRect(0, 0, W, H);
        if (quality !== 'low') { ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < (quality==='medium'?2:4); i++) { const a=0.6+i*0.18+noise2D(i,time*0.05)*0.08, ox=W*0.1, len=Math.max(W,H)*1.3;
                ctx.beginPath(); ctx.moveTo(ox,-20); ctx.lineTo(ox+Math.cos(a-0.025)*len,Math.sin(a-0.025)*len); ctx.lineTo(ox+Math.cos(a+0.025)*len,Math.sin(a+0.025)*len); ctx.closePath();
                ctx.fillStyle='rgba(74,170,100,'+(0.03+noise2D(i*3,time*0.15)*0.015)+')'; ctx.globalAlpha=fadeIn; ctx.fill(); }
            ctx.globalCompositeOperation = 'source-over'; }
        const wx = mouse.active?(mouse.sx-W/2)*0.0005:0;
        if (state.leaves) for (const l of state.leaves) { l.y+=l.speed*dt; l.sway+=dt*1.5; l.x+=(Math.sin(l.sway)*l.drift+wx*l.speed)*dt*30; l.rot+=l.rs*dt;
            if(l.y>H+20){l.y=rand(-50,-10);l.x=rand(0,W);} if(l.x<-20)l.x=W+20; if(l.x>W+20)l.x=-20;
            ctx.save(); ctx.translate(l.x,l.y); ctx.rotate(l.rot); ctx.globalAlpha=fadeIn*0.7; ctx.fillStyle=l.color;
            ctx.beginPath(); ctx.ellipse(0,0,l.size,l.size*0.45,0,0,Math.PI*2); ctx.fill(); ctx.restore();
        }
        ctx.globalCompositeOperation = 'lighter';
        if (state.fireflies) for (const f of state.fireflies) { f.phase+=f.speed*dt; f.pulse+=dt*3;
            let tx,ty;
            if(quality==='low'){tx=f.bx+Math.cos(f.phase)*f.radius;ty=f.by+Math.sin(f.phase*0.7)*f.radius*0.6;}
            else{tx=f.bx+Math.cos(f.phase)*f.radius+noise2D(f.phase,f.bx*0.01)*40;ty=f.by+Math.sin(f.phase*0.7)*f.radius*0.6+noise2D(f.by*0.01,f.phase)*30;}
            if(mouse.active){const md=dist(tx,ty,mouse.sx,mouse.sy);if(md<250){const p=(1-md/250)*0.4;tx=lerp(tx,mouse.sx,p);ty=lerp(ty,mouse.sy,p);}}
            f.x=lerp(f.x,tx,dt*3); f.y=lerp(f.y,ty,dt*3);
            const p=(Math.sin(f.pulse)+1)*0.5; ctx.globalAlpha=fadeIn*(0.3+p*0.7); glow(15,'#4aaa64'); ctx.fillStyle='#a3f5a3';
            ctx.beginPath(); ctx.arc(f.x,f.y,2+p*1.5,0,Math.PI*2); ctx.fill();
        }
        noGlow(); ctx.globalCompositeOperation = 'source-over';
        if (quality !== 'low') { const mg = ctx.createLinearGradient(0,H*0.8,0,H); mg.addColorStop(0,'transparent'); mg.addColorStop(1,'rgba(10,30,10,0.15)'); ctx.fillStyle=mg; ctx.globalAlpha=fadeIn; ctx.fillRect(0,H*0.8,W,H*0.2); }
        ctx.globalAlpha = fadeIn;
    }
};

// --- UNIQUE: BUBBLEGUM ---
AT.bubblegum = {
    init() { state.bubbles = []; const colors = ['#ff6b9d','#ff9ec4','#ffc0d0','#ffb3e6','#ff80bf','#ff4d94'];
        for (let i = 0; i < cap(35,quality); i++) state.bubbles.push({ x:rand(0,W), y:rand(0,H), vx:rand(-20,20), vy:rand(-30,-8), size:rand(6,18), color:colors[(Math.random()*colors.length)|0], wobble:rand(0,Math.PI*2) });
    },
    render(dt) {
        ctx.clearRect(0, 0, W, H);
        if (quality !== 'low') { const cd = 120; ctx.lineWidth = 0.8;
            for (let i=0;i<state.bubbles.length;i++) for (let j=i+1;j<state.bubbles.length;j++) { const a=state.bubbles[i],b=state.bubbles[j],d=dist(a.x,a.y,b.x,b.y);
                if(d<cd){ctx.globalAlpha=fadeIn*(1-d/cd)*0.15;ctx.strokeStyle=a.color;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}}
        if (state.bubbles) for (const b of state.bubbles) { b.wobble+=dt*2.5; b.vy-=10*dt; b.x+=b.vx*dt+Math.sin(b.wobble)*0.5; b.y+=b.vy*dt;
            if(mouse.active){const md=dist(b.x,b.y,mouse.sx,mouse.sy);if(md<150){const f=(1-md/150)*300*dt;b.vx+=(b.x-mouse.sx)/md*f;b.vy+=(b.y-mouse.sy)/md*f;}}
            b.vx*=0.998; b.vy*=0.998;
            if(b.x-b.size<0){b.x=b.size;b.vx=Math.abs(b.vx)*0.6;} if(b.x+b.size>W){b.x=W-b.size;b.vx=-Math.abs(b.vx)*0.6;}
            if(b.y-b.size<0){b.y=b.size;b.vy=Math.abs(b.vy)*0.6;} if(b.y+b.size>H){b.y=H-b.size;b.vy=-Math.abs(b.vy)*0.6;}
            ctx.globalAlpha=fadeIn*0.35; ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(b.x,b.y,b.size,0,Math.PI*2); ctx.fill();
            ctx.globalAlpha=fadeIn*0.55; ctx.strokeStyle=b.color; ctx.lineWidth=1.5; ctx.stroke();
            if(quality!=='low'){ctx.globalAlpha=fadeIn*0.7;ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.arc(b.x-b.size*0.3,b.y-b.size*0.3,b.size*0.22,0,Math.PI*2);ctx.fill();}
        }
        ctx.globalAlpha = fadeIn;
    }
};

// --- UNIQUE: AURORA ---
AT.aurora = {
    init() { state.stars = []; state.snow = [];
        for (let i = 0; i < cap(90,quality); i++) state.stars.push({ x:rand(0,W), y:rand(0,H*0.75), size:rand(0.5,2), twinkle:rand(0,Math.PI*2) });
        for (let i = 0; i < cap(40,quality); i++) state.snow.push({ x:rand(0,W), y:rand(0,H), speed:rand(12,35), drift:rand(-0.4,0.4), size:rand(0.8,2.5) });
    },
    render(dt) {
        ctx.clearRect(0, 0, W, H);
        if (state.stars) for (const s of state.stars) { s.twinkle+=dt*rand(0.5,2); const b=(Math.sin(s.twinkle)+1)*0.5; ctx.globalAlpha=fadeIn*(0.15+b*0.6); ctx.fillStyle='#fff'; ctx.fillRect(s.x,s.y,s.size,s.size); }
        ctx.globalCompositeOperation = 'lighter';
        const ribbons = [{ yBase:H*0.2, colors:['rgba(0,255,128,','rgba(0,200,255,'], speed:0.06, amp:70 },{ yBase:H*0.32, colors:['rgba(128,0,255,','rgba(0,255,200,'], speed:-0.04, amp:90 },{ yBase:H*0.15, colors:['rgba(255,80,200,','rgba(80,140,255,'], speed:0.05, amp:55 }];
        if (quality==='ultra'||quality==='high') ribbons.push({ yBase:H*0.4, colors:['rgba(0,180,255,','rgba(80,255,160,'], speed:-0.03, amp:60 });
        const rs = quality==='low'?8:quality==='medium'?14:22, rxs = getStep();
        for (const rb of ribbons) { const rh=100, mi=mouse.active?(mouse.sx/W-0.5)*0.02:0;
            for (let s=0;s<rs;s++) { const t=s/rs, ba=Math.sin(t*Math.PI); ctx.beginPath();
                for (let x=0;x<=W;x+=rxs) { const n=fbm(x*0.0012+time*(rb.speed+mi),rb.yBase*0.003+t*0.3,3); const y=rb.yBase+(t-0.5)*rh+n*rb.amp*ba; if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y); }
                const ci=Math.min((t*rb.colors.length)|0,rb.colors.length-1); ctx.strokeStyle=rb.colors[ci]+(ba*0.12)+')'; ctx.lineWidth=quality==='low'?8:4; ctx.globalAlpha=fadeIn; ctx.stroke();
            }
        }
        ctx.globalCompositeOperation = 'source-over';
        if (state.snow) for (const s of state.snow) { s.y+=s.speed*dt; s.x+=s.drift+Math.sin(time*0.4+s.x*0.008)*0.4; if(s.y>H+5){s.y=-5;s.x=rand(0,W);} ctx.globalAlpha=fadeIn*0.35; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(s.x,s.y,s.size,0,Math.PI*2); ctx.fill(); }
        ctx.globalAlpha = fadeIn;
    }
};

// --- UNIQUE: DESERT ---
AT.desert = {
    init() { state.particles = []; for (let i = 0; i < cap(70,quality); i++) state.particles.push(mkSand()); },
    render(dt) {
        ctx.clearRect(0, 0, W, H);
        let wx=1.0,wy=0; if(mouse.active){wx=0.6+(mouse.sx/W)*0.8;wy=(mouse.sy/H-0.5)*0.3;}
        if (state.particles) for (const p of state.particles) {
            if(quality==='low'){p.x+=p.speed*wx*dt;p.y+=p.speed*wy*0.3*dt+Math.sin(time*0.5+p.x*0.01)*0.5;}
            else{const nx=noise2D(p.x*0.003+time*0.2,p.y*0.003)*40,ny=noise2D(p.y*0.003,p.x*0.003+time*0.2)*25;p.x+=(p.speed*wx+nx)*dt;p.y+=(p.speed*wy*0.3+ny*0.5)*dt;}
            if(p.x>W+20){p.x=-20;p.y=rand(0,H);} if(p.x<-20){p.x=W+20;p.y=rand(0,H);} if(p.y>H+20)p.y=-20; if(p.y<-20)p.y=H+20;
            ctx.globalAlpha=fadeIn*p.opacity; glow(12,'#e07840'); ctx.fillStyle='#f4a261'; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
        }
        noGlow(); ctx.globalAlpha = fadeIn;
    }
};
function mkSand() { return { x:rand(-20,W+20), y:rand(0,H), size:rand(1.5,5), speed:rand(40,120), opacity:rand(0.3,0.7) }; }

// --- UNIQUE: OBSIDIAN ---
AT.obsidian = {
    init() { state.particles = [];
        for (let i = 0; i < cap(35,quality); i++) state.particles.push({ x:rand(0,W), y:rand(0,H), phase:rand(0,Math.PI*2), speed:rand(0.15,0.5), size:rand(1,4), orbit:rand(20,80) });
    },
    render(dt) {
        ctx.clearRect(0, 0, W, H);
        if (mouse.active && quality !== 'low') { const grad=ctx.createRadialGradient(mouse.sx,mouse.sy,0,mouse.sx,mouse.sy,250); grad.addColorStop(0,'rgba(139,92,246,0.04)'); grad.addColorStop(1,'transparent'); ctx.fillStyle=grad; ctx.globalAlpha=fadeIn; ctx.fillRect(mouse.sx-250,mouse.sy-250,500,500); }
        ctx.globalCompositeOperation = 'lighter';
        if (state.particles) for (const p of state.particles) { p.phase+=p.speed*dt;
            const nx=quality==='low'?Math.sin(p.phase):noise2D(p.phase,p.x*0.005), ny=quality==='low'?Math.cos(p.phase*0.7):noise2D(p.y*0.005,p.phase);
            const dx=p.x+nx*p.orbit, dy=p.y+ny*p.orbit, pulse=(Math.sin(p.phase*2)+1)*0.5;
            ctx.globalAlpha=fadeIn*(0.06+pulse*0.08); glow(8,'#8b5cf6'); ctx.fillStyle='#a78bfa'; ctx.beginPath(); ctx.arc(dx,dy,p.size,0,Math.PI*2); ctx.fill();
        }
        noGlow(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fadeIn;
    }
};

// ==========================================================
// SECTION 8: THEME INIT & LOOP
// ==========================================================
function initTheme() {
    try {
        state = {}; fadeIn = 0;
        const theme = getCurrentTheme();
        const cfg = TC[theme];

        // Set canvas opacity per theme, scaled by intensity
        if (canvas) {
            var baseOpacity = cfg ? cfg.a : 0.7;
            var targetOpacity = String(baseOpacity * Math.max(0.05, intensityFactor));
            // Matrix: start invisible, fade in over 2s to hide init artefacts
            if (cfg && cfg.type === 'matrix') {
                canvas.style.transition = 'none';
                canvas.style.opacity = '0';
            } else {
                canvas.style.opacity = targetOpacity;
            }
            state._targetOpacity = targetOpacity;
        }

        if (ctx) { ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0); ctx.clearRect(0, 0, W, H); }

        if (cfg) {
            const anim = AT[cfg.type];
            if (anim && anim.init) anim.init(cfg);
            // Matrix fade-in: trigger after init so first paint is done
            if (cfg.type === 'matrix' && canvas) {
                setTimeout(function() {
                    canvas.style.transition = 'opacity 2s ease-in';
                    canvas.style.opacity = state._targetOpacity;
                }, 50);
            }
        }
    } catch(e) {
        console.error('Animation initTheme error (non-fatal):', e);
        state = {}; // Reset state on error
    }
}

function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || '';
}

function loop(ts) {
    if (!running) return;

    try {
        const dt = Math.min((ts - lastTime) / 1000, 0.05);
        lastTime = ts; time += dt;
        Perf.trackFrame(dt);
        if (quality === 'low') { frameSkipCounter = (frameSkipCounter + 1) % 2; if (frameSkipCounter !== 0) { requestAnimationFrame(loop); return; } }
        if (fadeIn < 1) fadeIn = Math.min(1, fadeIn + dt * 2.5);

        // Smooth intensity transitions
        if (Math.abs(intensityFactor - intensityTarget) > 0.001) {
            intensityFactor = lerp(intensityFactor, intensityTarget, Math.min(1, dt * 4));
        } else {
            intensityFactor = intensityTarget;
        }
        // Skip rendering entirely if intensity is effectively zero
        if (intensityFactor < 0.01) {
            if (ctx) ctx.clearRect(0, 0, W, H);
            requestAnimationFrame(loop);
            return;
        }

        const theme = getCurrentTheme();
        const cfg = TC[theme];
        if (cfg) {
            const anim = AT[cfg.type];
            if (anim && anim.render) anim.render(dt, cfg);
        } else {
            if (ctx) ctx.clearRect(0, 0, W, H);
        }

        updateMouse();
    } catch(e) {
        console.error('Animation loop error (non-fatal):', e);
        // Clear canvas and continue running
        if (ctx) {
            try { ctx.clearRect(0, 0, W, H); } catch(e2) { /* ignore */ }
        }
    }

    requestAnimationFrame(loop);
}

// ==========================================================
// SECTION 9: ENGINE INIT, RESET & GLOBAL API
// ==========================================================
// ==========================================================
// SECTION 8.5: INTENSITY API
// ==========================================================
function setIntensity(value) {
    intensityRaw = Math.max(0, Math.min(100, value));
    intensityTarget = intensityRaw / 100;
    // Update canvas opacity immediately for responsive feel
    if (canvas) {
        var theme = getCurrentTheme();
        var cfg = TC[theme];
        var baseOpacity = cfg ? cfg.a : 0.7;
        canvas.style.opacity = String(baseOpacity * Math.max(0.05, intensityTarget));
    }
}

function engineInit() {
    try {
        canvas = document.getElementById('matrix-bg');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        canvas.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

        // Load saved intensity
        try {
            var savedIntensity = localStorage.getItem('productiveapp_animation_intensity');
            if (savedIntensity !== null) {
                intensityRaw = parseInt(savedIntensity, 10) || 45;
                intensityFactor = intensityRaw / 100;
                intensityTarget = intensityFactor;
            }
        } catch (e) {}

        const deviceScore = Perf.detectDevice();
        resize();
        const gpuTime = Perf.benchmarkGPU(canvas, ctx);
        Perf.initBattery();
        applyResolution();

        window.addEventListener('resize', () => {
            try {
                W = window.innerWidth; H = window.innerHeight;
                applyResolution(); initTheme();
            } catch(e) { console.error('Animation resize error:', e); }
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { running = false; }
            else if (canvas) { running = true; lastTime = performance.now(); Perf.warmup = 30; requestAnimationFrame(loop); }
        });

        initTheme();
        if (!running) { running = true; lastTime = performance.now(); requestAnimationFrame(loop); }

        console.log('Animation Engine v4.0 | Score:', deviceScore, '| GPU:', gpuTime.toFixed(1)+'ms', '| Quality:', quality, '| Res:', Math.round(canvasScale*100)+'%');
    } catch(e) {
        console.error('Animation engine init failed (non-fatal):', e);
        // Disable animation system gracefully
        running = false;
    }
}

function engineReset() {
    if (!canvas || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.opacity = '0';
    setTimeout(() => { applyResolution(); initTheme(); }, 500);
}

window.initAnimation = engineInit;
window.resetAnimationForTheme = engineReset;
window.AnimEngine = {
    setIntensity: setIntensity,
    getIntensity: function() { return intensityRaw; },
    getIntensityFactor: function() { return intensityFactor; },
    getQuality: function() { return quality; },
    reinit: function() { applyResolution(); initTheme(); }
};

})();

console.log('animations.js v4.1 loaded (intensity system)');
