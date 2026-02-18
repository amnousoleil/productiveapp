/**
 * GALAXY 3D ENGINE - Three.js powered 3D constellation viewer
 * ProductiveApp v5.0
 *
 * Features:
 * - 3D scene with starfield background
 * - Glowing spheres (suns) for notes/tasks/projects
 * - Priority-based colors (red=urgent, gold=high, blue=low, green=done)
 * - Luminous connections between related items
 * - Post-processing bloom (UnrealBloomPass)
 * - CSS2D labels
 * - Raycaster for hover tooltips and click selection
 * - Force-directed layout algorithm
 * - Smooth camera transitions
 * - Auto-rotation
 */
const Galaxy3D = (function() {
    'use strict';

    // === STATE ===
    let scene, camera, renderer, controls;
    let raycaster, mouse;
    let spheres = [];        // { mesh, data, label, size }
    let connections = [];    // { line, data }
    let starField;
    let animationId = null;
    let initialized = false;
    let containerEl, canvasEl, tooltipEl;
    let hoveredSphere = null;
    let selectedSphere = null;
    let showLabels = true;
    let showOrbits = true;
    let autoRotate = true;
    let clock;

    // === CONSTANTS ===
    const PRIORITY_COLORS = {
        urgent:   { color: 0xff2222, emissive: 0xff2222, intensity: 0.6, pulseSpeed: 3.0 },
        high:     { color: 0xff6600, emissive: 0xff4400, intensity: 0.5, pulseSpeed: 2.0 },
        medium:   { color: 0xffaa00, emissive: 0xff8800, intensity: 0.4, pulseSpeed: 1.5 },
        low:      { color: 0x4488ff, emissive: 0x2266ff, intensity: 0.3, pulseSpeed: 1.0 },
        done:     { color: 0x22cc66, emissive: 0x11aa44, intensity: 0.2, pulseSpeed: 0.5 },
        default:  { color: 0xaaaacc, emissive: 0x8888aa, intensity: 0.2, pulseSpeed: 1.0 }
    };

    const SPHERE_BASE_SIZE = 1.2;
    const SPACE_RANGE = 60;
    // Bloom removed — direct renderer.render() only

    // === INITIALIZATION ===
    var _firstFrame = true; // for one-shot render log

    function init(container) {
        if (initialized) {
            console.log('[3D] Already initialized, calling onResize');
            onResize();
            return;
        }

        console.log('[3D] === INIT START ===');

        containerEl = typeof container === 'string' ? document.getElementById(container) : container;
        if (!containerEl) {
            console.error('[3D] FAIL: container not found');
            return;
        }

        // Find 3D canvas — must be visible BEFORE init
        canvasEl = document.getElementById('galaxy-3d-canvas');
        if (!canvasEl) {
            console.error('[3D] FAIL: #galaxy-3d-canvas not found in DOM');
            return;
        }

        // Force canvas visible and sized
        canvasEl.style.display = 'block';
        canvasEl.style.width = '100%';
        canvasEl.style.height = '100%';

        tooltipEl = containerEl.querySelector('#galaxy-tooltip') || createTooltipEl();

        if (!window.THREE) {
            console.error('[3D] FAIL: THREE.js not loaded');
            return;
        }
        console.log('[3D] THREE.js revision:', window.THREE.REVISION || 'unknown');

        const THREE = window.THREE;
        clock = new THREE.Clock();

        // Get container dimensions (after reflow)
        var w = containerEl.clientWidth;
        var h = containerEl.clientHeight;
        console.log('[3D] Container size:', w, 'x', h);

        // Fallback if container has no size
        if (w < 10 || h < 10) {
            w = window.innerWidth;
            h = window.innerHeight - 60;
            console.warn('[3D] Container too small, using window size:', w, 'x', h);
        }

        // Scene with visible dark blue background
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a2e);

        // Camera — close enough to see the test cube clearly
        camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 2000);
        camera.position.set(0, 0, 80);
        camera.lookAt(0, 0, 0);
        console.log('[3D] Camera at (0,0,80), aspect:', (w/h).toFixed(2));

        // Renderer — create on the 3D canvas
        try {
            renderer = new THREE.WebGLRenderer({
                canvas: canvasEl,
                antialias: true,
                alpha: false
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(w, h);
            renderer.setClearColor(0x0a0a2e, 1);
            console.log('[3D] Renderer OK, canvas:', canvasEl.width, 'x', canvasEl.height,
                'CSS:', canvasEl.style.width, canvasEl.style.height);
        } catch (e) {
            console.error('[3D] FAIL: WebGLRenderer error:', e);
            return;
        }

        // Controls
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, canvasEl);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 2;
            controls.maxDistance = 800;
            controls.autoRotate = false;
            // Mouse: left = orbit, middle = pan, scroll = zoom (standard 3D)
            controls.enableRotate = true;
            controls.enablePan = true;
            controls.enableZoom = true;
            controls.screenSpacePanning = true;
            controls.zoomSpeed = 1.5;
            controls.panSpeed = 1.0;
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.PAN,
                RIGHT: THREE.MOUSE.PAN
            };
            console.log('[3D] OrbitControls OK');

            // Wheel: distinguish trackpad vs mouse, intercept BEFORE OrbitControls
            canvasEl.addEventListener('wheel', function(e) {
                var isTrackpad = Math.abs(e.deltaY) < 50 && e.deltaMode === 0;

                if (isTrackpad && !e.ctrlKey) {
                    // Trackpad two-finger scroll → PAN
                    e.preventDefault();
                    e.stopPropagation();
                    var dist = camera.position.distanceTo(controls.target);
                    var panScale = dist * 0.0015;
                    camera.position.x += e.deltaX * panScale;
                    camera.position.y -= e.deltaY * panScale;
                    controls.target.x += e.deltaX * panScale;
                    controls.target.y -= e.deltaY * panScale;
                } else if (isTrackpad && e.ctrlKey) {
                    // Trackpad pinch → ZOOM — OrbitControls handles it
                } else if (!isTrackpad && e.ctrlKey) {
                    // Mouse CTRL + wheel → PAN vertical
                    e.preventDefault();
                    e.stopPropagation();
                    var dist = camera.position.distanceTo(controls.target);
                    var panScale = dist * 0.002;
                    camera.position.y -= e.deltaY * panScale;
                    controls.target.y -= e.deltaY * panScale;
                }
                // Mouse wheel alone → ZOOM — OrbitControls handles it
            }, { passive: false, capture: true });
        } else {
            console.warn('[3D] OrbitControls NOT available');
        }

        // Raycaster
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2(-999, -999);

        // Lights
        setupLights();

        // Starfield
        createStarField();

        // Nebulae
        initNebulae();

        // Events
        canvasEl.addEventListener('mousemove', onMouseMove, false);
        canvasEl.addEventListener('click', onMouseClick, false);
        canvasEl.addEventListener('mousedown', onUserInterrupt, false);
        canvasEl.addEventListener('wheel', onUserInterrupt, false);
        canvasEl.addEventListener('touchstart', onUserInterrupt, false);
        window.addEventListener('resize', onResize, false);

        initialized = true;
        _firstFrame = true;
        startAnimation();

        // Verify state
        console.log('[3D] === INIT COMPLETE ===');
        console.log('[3D] Scene children:', scene.children.length,
            '| Canvas in DOM:', document.body.contains(canvasEl),
            '| Canvas offset:', canvasEl.offsetWidth, 'x', canvasEl.offsetHeight,
            '| Canvas display:', getComputedStyle(canvasEl).display,
            '| WebGL context:', !!canvasEl.getContext('webgl2') || !!canvasEl.getContext('webgl'));

        // Force one render frame
        renderer.render(scene, camera);
        console.log('[3D] First render done');
    }


    let nodeLights = [];  // [{ light, baseIntensity, pulsePhase, pulsePeriod }]
    const NODE_LIGHTS_MAX = 6;
    const NODE_LIGHT_SIZE_THRESHOLD = 1.5; // minimum sphere size to emit light

    function setupLights() {
        const THREE = window.THREE;

        // Ambient — base illumination so no face is pitch-black
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);

        // Strong directional light — creates specular highlights on shiny surfaces
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        // Atmospheric point lights (subtle color accents)
        const light1 = new THREE.PointLight(0x6644ff, 0.3, 300);
        light1.position.set(30, 30, 30);
        scene.add(light1);

        const light2 = new THREE.PointLight(0xff4466, 0.2, 300);
        light2.position.set(-30, -20, -30);
        scene.add(light2);

        const light3 = new THREE.PointLight(0x44aaff, 0.2, 300);
        light3.position.set(0, 40, -20);
        scene.add(light3);
    }

    function rebuildNodeLights() {
        var THREE = window.THREE;
        disposeNodeLights();
        if (spheres.length === 0) return;

        // Find max size as reference
        var maxSize = 0;
        for (var i = 0; i < spheres.length; i++) {
            if (spheres[i].size > maxSize) maxSize = spheres[i].size;
        }
        if (maxSize < 0.1) return;

        // Sort by size descending, pick top N
        var sorted = spheres.slice().sort(function(a, b) { return b.size - a.size; });
        var count = 0;

        for (var j = 0; j < sorted.length && count < NODE_LIGHTS_MAX; j++) {
            var s = sorted[j];
            var ratio = s.size / maxSize;

            // Skip small nodes (ratio < 0.3)
            if (ratio < 0.3) break; // sorted desc, all following are smaller

            var intensity, distance;
            if (ratio >= 0.6) {
                // Big nodes — strong light
                var t = (ratio - 0.6) / 0.4; // 0→1
                intensity = 0.2 + t * 0.2;   // 0.2→0.4
                distance = s.size * 4;
            } else {
                // Medium nodes — faint glow
                var t2 = (ratio - 0.3) / 0.3; // 0→1
                intensity = 0.05 + t2 * 0.05;  // 0.05→0.1
                distance = s.size * 2.5;
            }

            // Color from the sphere's emissive or main color
            var color;
            if (s.mesh.material && s.mesh.material.emissive) {
                color = s.mesh.material.emissive.clone();
            } else if (s.mesh.material && s.mesh.material.color) {
                color = s.mesh.material.color.clone();
            } else {
                color = new THREE.Color(0x4488ff);
            }

            var light = new THREE.PointLight(color, intensity, distance, 2);
            light.position.copy(s.mesh.position);
            light.castShadow = false;
            scene.add(light);

            nodeLights.push({
                light: light,
                sphereRef: s,
                baseIntensity: intensity,
                pulsePhase: Math.random() * Math.PI * 2,
                pulsePeriod: 8 + Math.random() * 4
            });
            count++;
        }
    }

    function updateNodeLights(time) {
        for (var i = 0; i < nodeLights.length; i++) {
            var nl = nodeLights[i];
            // Follow sphere position (in case of layout changes)
            nl.light.position.copy(nl.sphereRef.mesh.position);
            // Subtle pulse ±10%
            var pulse = 1 + 0.1 * Math.sin(time / nl.pulsePeriod * Math.PI * 2 + nl.pulsePhase);
            nl.light.intensity = nl.baseIntensity * pulse;
        }
    }

    function disposeNodeLights() {
        for (var i = 0; i < nodeLights.length; i++) {
            if (scene) scene.remove(nodeLights[i].light);
        }
        nodeLights = [];
    }

    // === MULTI-LAYER STARFIELD ===
    // 2 layers: far (backdrop) + mid (parallax depth)
    var _starLayers = []; // { points, baseColors, phases, speeds, drift, followFactor }
    var _starTexture = null; // shared round glow texture

    function _getStarTexture() {
        if (_starTexture) return _starTexture;
        var THREE = window.THREE;
        var c = document.createElement('canvas');
        c.width = 32; c.height = 32;
        var ctx = c.getContext('2d');
        var g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.3, 'rgba(255,255,255,0.6)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 32, 32);
        _starTexture = new THREE.CanvasTexture(c);
        return _starTexture;
    }

    function _createStarLayer(count, spread, size, renderOrder, driftSpeed, followFactor) {
        var THREE = window.THREE;
        var positions = new Float32Array(count * 3);
        var colors = new Float32Array(count * 3);
        var baseColors = new Float32Array(count * 3);
        var phases = new Float32Array(count);
        var speeds = new Float32Array(count);

        // Clamp max size to avoid giant square particles
        var clampedSize = Math.min(size, 2.5);

        for (var i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * spread;
            positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
            positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
            // Bright white base — never dark, minimum 0.75
            var brightness = 0.75 + Math.random() * 0.25;
            // Subtle color tint variety
            var tintR = 1.0, tintG = 1.0, tintB = 1.0;
            var tint = Math.random();
            if (tint < 0.12) { tintR = 0.9; tintB = 1.1; } // slight blue
            else if (tint < 0.20) { tintR = 1.1; tintG = 0.95; tintB = 0.9; } // slight warm
            colors[i * 3]     = brightness * tintR;
            colors[i * 3 + 1] = brightness * tintG;
            colors[i * 3 + 2] = brightness * tintB;
            baseColors[i * 3]     = colors[i * 3];
            baseColors[i * 3 + 1] = colors[i * 3 + 1];
            baseColors[i * 3 + 2] = colors[i * 3 + 2];
            phases[i] = Math.random() * Math.PI * 2;
            speeds[i] = 0.3 + Math.random() * 1.5;
        }

        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        var material = new THREE.PointsMaterial({
            size: clampedSize,
            map: _getStarTexture(),
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            alphaTest: 0.01,
            sizeAttenuation: true,
            depthTest: false,
            depthWrite: false
        });
        var points = new THREE.Points(geometry, material);
        points.renderOrder = renderOrder;
        scene.add(points);

        return {
            points: points,
            baseColors: baseColors,
            phases: phases,
            speeds: speeds,
            driftSpeed: driftSpeed,
            followFactor: followFactor,
            count: count
        };
    }

    function createStarField() {
        // Far layer: dense tiny stars, deep background
        _starLayers.push(_createStarLayer(
            2500,   // count
            800,    // spread
            0.8,    // size (small points)
            -2000,  // renderOrder (deepest)
            0.00003, // drift speed (very slow)
            1.0     // follows camera fully
        ));

        // Mid layer: moderate stars at medium distance (parallax depth)
        _starLayers.push(_createStarLayer(
            1200,   // count
            600,    // spread
            1.5,    // size (medium points)
            -1800,  // renderOrder (between far and nodes)
            0.0001,  // drift speed (slow)
            0.95    // follows camera almost fully (slight parallax)
        ));

        // Keep starField reference pointing to far layer for compat
        starField = _starLayers[0].points;
    }

    function updateStarField(time) {
        if (_starLayers.length === 0) return;

        for (var L = 0; L < _starLayers.length; L++) {
            var layer = _starLayers[L];
            var pts = layer.points;

            // Follow camera with per-layer parallax factor
            pts.position.set(
                camera.position.x * layer.followFactor,
                camera.position.y * layer.followFactor,
                camera.position.z * layer.followFactor
            );

            // Slow drift rotation (each layer at different speed/axis)
            pts.rotation.y += layer.driftSpeed;
            pts.rotation.x += layer.driftSpeed * 0.4;

            // Twinkle: batch update colors — never below 0.8x base so no black flicker
            var colors = pts.geometry.attributes.color.array;
            var count = layer.count;
            var batchSize = Math.min(400, count);
            var batchStart = (Math.floor(time * (2 + L)) * batchSize) % count;
            var batchEnd = Math.min(batchStart + batchSize, count);
            for (var i = batchStart; i < batchEnd; i++) {
                var twinkle = 0.8 + 0.2 * Math.sin(time * layer.speeds[i] + layer.phases[i]);
                colors[i * 3]     = layer.baseColors[i * 3]     * twinkle;
                colors[i * 3 + 1] = layer.baseColors[i * 3 + 1] * twinkle;
                colors[i * 3 + 2] = layer.baseColors[i * 3 + 2] * twinkle;
            }
            pts.geometry.attributes.color.needsUpdate = true;
        }
    }

    // === SPHERE MANAGEMENT ===
    // === GEOMETRY BUILDERS per shape type ===

    function createStarGeometry(size) {
        const THREE = window.THREE;
        var shape = new THREE.Shape();
        var outerR = size;
        var innerR = size * 0.4;
        var points = 5;
        for (var i = 0; i < points * 2; i++) {
            var angle = (i * Math.PI) / points - Math.PI / 2;
            var r = i % 2 === 0 ? outerR : innerR;
            if (i === 0) shape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        shape.closePath();
        return new THREE.ExtrudeGeometry(shape, {
            depth: size * 0.35,
            bevelEnabled: true,
            bevelThickness: size * 0.06,
            bevelSize: size * 0.06,
            bevelSegments: 2
        });
    }

    function createRectGeometry(size, widthRatio, heightRatio) {
        var w = size * (widthRatio || 2.2);
        var h = size * (heightRatio || 1.4);
        var d = size * 0.18;
        return new window.THREE.BoxGeometry(w, h, d);
    }

    function createDiamondGeometry(size) {
        return new window.THREE.OctahedronGeometry(size, 0);
    }

    function createHexagonGeometry(size) {
        return new window.THREE.CylinderGeometry(size, size, size * 0.35, 6);
    }

    // === SURFACE TEXT TEXTURE (for rect & diamond) ===
    // rectW/rectH: real pixel dimensions of the 2D node — canvas uses SAME ratio
    function createSurfaceTexture(text, fillColor, rectW, rectH, fontSizeHint, textColor) {
        // Canvas with SAME aspect ratio as the rectangle
        var ratio = (rectW && rectH) ? rectW / rectH : 2;
        var canvasHeight = 512;
        var canvasWidth = Math.round(canvasHeight * ratio);

        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        var ctx = canvas.getContext('2d');

        // Fill background with node color
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Subtle inner border for depth
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 8, canvasWidth - 16, canvasHeight - 16);

        if (!text || !text.trim()) {
            var tex = new window.THREE.CanvasTexture(canvas);
            tex.minFilter = window.THREE.LinearFilter;
            return tex;
        }

        // Text color: use explicit textColor, or strong auto-contrast based on fill luminance
        // THREE.Color stores r/g/b in linear space [0..1]
        var txtColor = textColor;
        if (!txtColor) {
            var tmpC = new window.THREE.Color(fillColor);
            // W3C relative luminance (already linear in THREE.Color)
            var lum = 0.2126 * tmpC.r + 0.7152 * tmpC.g + 0.0722 * tmpC.b;
            // Contrast ratio against white vs black — pick whichever gives better contrast
            var contrastWhite = (1.05) / (lum + 0.05);
            var contrastBlack = (lum + 0.05) / (0.05);
            txtColor = contrastWhite > contrastBlack ? '#ffffff' : '#000000';
        }

        // Auto-size: shrink font until text fits within padded area
        var padding = canvasWidth * 0.10;  // 10% padding each side
        var maxTextWidth = canvasWidth - (padding * 2);
        var maxTextHeight = canvasHeight * 0.50;  // text ≤ 50% of height
        var words = text.split(/\s+/);

        var fontSize = Math.round(maxTextHeight);
        var lines = [];
        while (fontSize >= 12) {
            ctx.font = 'bold ' + fontSize + 'px Inter, Arial, sans-serif';
            lines = _wrapText(ctx, words, maxTextWidth);
            var totalH = lines.length * (fontSize * 1.25);
            if (totalH <= maxTextHeight && lines.length <= 5) break;
            fontSize -= 2;
        }

        // Truncate if still too many lines
        if (lines.length > 5) {
            lines = lines.slice(0, 5);
            lines[4] = lines[4].replace(/.{3}$/, '...');
        }

        // Draw text CENTERED with strong contrast + outline for 3D readability
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        var lineHeight = fontSize * 1.25;
        var startY = (canvasHeight - lines.length * lineHeight) / 2 + lineHeight / 2;
        ctx.font = 'bold ' + fontSize + 'px Inter, Arial, sans-serif';

        // Outline stroke (opposite color) for contrast under 3D lighting
        ctx.strokeStyle = txtColor === '#ffffff' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.6)';
        ctx.lineWidth = Math.max(3, fontSize * 0.08);
        ctx.lineJoin = 'round';
        for (var i = 0; i < lines.length; i++) {
            ctx.strokeText(lines[i], canvasWidth / 2, startY + i * lineHeight);
        }

        // Fill text on top
        ctx.fillStyle = txtColor;
        ctx.shadowColor = txtColor === '#ffffff' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = 6;
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], canvasWidth / 2, startY + i * lineHeight);
        }

        var tex = new window.THREE.CanvasTexture(canvas);
        tex.minFilter = window.THREE.LinearFilter;
        return tex;
    }

    function _wrapText(ctx, words, maxWidth) {
        var lines = [];
        var current = '';
        for (var i = 0; i < words.length; i++) {
            var test = current ? current + ' ' + words[i] : words[i];
            if (ctx.measureText(test).width > maxWidth && current) {
                lines.push(current);
                current = words[i];
            } else {
                current = test;
            }
        }
        if (current) lines.push(current);
        return lines;
    }

    // Create a circular transparent sprite with text — "Universal Pictures" style
    // Placed at sphere center and oriented toward camera in animate()
    function createSphereLabelSprite(text, sphereRadius, fillColor, textColor) {
        var THREE = window.THREE;
        var res = 512;
        var canvas = document.createElement('canvas');
        canvas.width = res;
        canvas.height = res;
        var ctx = canvas.getContext('2d');

        // Transparent background — text only
        ctx.clearRect(0, 0, res, res);

        // Text color: explicit or auto-contrast
        var txtColor = textColor;
        if (!txtColor) {
            var tmpC = new THREE.Color(fillColor);
            var lum = 0.299 * tmpC.r + 0.587 * tmpC.g + 0.114 * tmpC.b;
            txtColor = lum > 0.45 ? '#000000' : '#ffffff';
        }

        ctx.fillStyle = txtColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = txtColor === '#ffffff' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.4)';
        ctx.shadowBlur = 8;

        // Auto-size: fit text within ~70% of the circle diameter
        var maxWidth = res * 0.70;
        var maxHeight = res * 0.40;
        var words = text.split(/\s+/);

        var fontSize = Math.round(maxHeight);
        var lines = [];
        while (fontSize >= 16) {
            ctx.font = 'bold ' + fontSize + 'px Inter, Arial, sans-serif';
            lines = _wrapText(ctx, words, maxWidth);
            var totalH = lines.length * (fontSize * 1.25);
            if (totalH <= maxHeight && lines.length <= 3) break;
            fontSize -= 2;
        }
        if (lines.length > 3) {
            lines = lines.slice(0, 3);
            lines[2] = lines[2].replace(/.{3}$/, '...');
        }

        // Draw centered
        var lineHeight = fontSize * 1.25;
        var startY = (res - lines.length * lineHeight) / 2 + lineHeight / 2;
        ctx.font = 'bold ' + fontSize + 'px Inter, Arial, sans-serif';
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], res / 2, startY + i * lineHeight);
        }

        var texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        var material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            sizeAttenuation: true
        });
        var sprite = new THREE.Sprite(material);
        // Scale to match sphere diameter (slightly larger so text sits on surface)
        var d = sphereRadius * 2.1;
        sprite.scale.set(d, d, 1);
        sprite.userData._isFaceLabel = true;
        return sprite;
    }

    function addSphere(data) {
        const THREE = window.THREE;
        var shape = (data.metadata && data.metadata.shape) || 'circle';
        var isTextNode = data.metadata && data.metadata.isTextNode;
        var hasSurfaceText = (shape === 'rect' || shape === 'diamond') && data.label && data.label.trim();

        // Color
        var sphereColor, emissiveColor, emissiveIntensity, pulseSpeed;
        if (data.hexColor) {
            sphereColor = new THREE.Color(data.hexColor);
            emissiveColor = sphereColor.clone();
            emissiveIntensity = 0.4;
            pulseSpeed = 1.5;
        } else {
            var priority = data.priority || 'default';
            var pConfig = PRIORITY_COLORS[priority] || PRIORITY_COLORS.default;
            sphereColor = new THREE.Color(pConfig.color);
            emissiveColor = new THREE.Color(pConfig.emissive);
            emissiveIntensity = pConfig.intensity;
            pulseSpeed = pConfig.pulseSpeed;
        }

        // Size from adapter — linear scaling, clamp only outliers (>8x median)
        var rawSize = Math.max(0.3, data.size || 1);
        var isStar = (shape === 'star');
        var nodeFontSize = (data.metadata && data.metadata.fontSize) || 16;
        var nodeTextColor = (data.metadata && data.metadata.textColor) || null;
        var nodeOpacity = (data.metadata && data.metadata.opacity != null) ? data.metadata.opacity : 1;
        var pxW = (data.metadata && data.metadata.pxW) || 80;
        var pxH = (data.metadata && data.metadata.pxH) || 80;
        var SCALE3D = 30;

        // Linear sizing — preserves 2D proportions exactly
        var size = Math.min(rawSize, _sizeClamp);

        // Rect dimensions: linear, clamp outliers to median-based threshold
        var rectW = pxW / SCALE3D;
        var rectH = pxH / SCALE3D;
        if (rectW > _sizeClamp || rectH > _sizeClamp) {
            var shrink = _sizeClamp / Math.max(rectW, rectH);
            rectW *= shrink;
            rectH *= shrink;
        }

        // Geometry based on shape
        var geometry;
        if (isTextNode) {
            geometry = null;
        } else if (shape === 'star') {
            geometry = createStarGeometry(size);
        } else if (shape === 'rect') {
            geometry = new THREE.BoxGeometry(rectW, rectH, Math.min(rectW, rectH) * 0.15);
        } else if (shape === 'diamond') {
            geometry = createDiamondGeometry(size);
        } else if (shape === 'hexagon') {
            geometry = createHexagonGeometry(size);
        } else {
            geometry = new THREE.SphereGeometry(size, 32, 32);
        }

        var mesh;

        if (geometry) {
            // Build material — with surface texture for rect/diamond
            var material;
            var isTransparent = nodeOpacity < 1;
            if (shape === 'rect' && hasSurfaceText) {
                // Multi-material: text only on front face (+Z), solid color on sides
                var fillHex = '#' + sphereColor.getHexString();
                var surfaceTex = createSurfaceTexture(data.label, fillHex, pxW, pxH, nodeFontSize, nodeTextColor);
                var faceMaterial = new THREE.MeshStandardMaterial({
                    map: surfaceTex,
                    emissive: emissiveColor,
                    emissiveIntensity: emissiveIntensity * 0.15,
                    metalness: 0.1,
                    roughness: 0.6,
                    transparent: isTransparent,
                    opacity: nodeOpacity
                });
                var sideMaterial = new THREE.MeshStandardMaterial({
                    color: sphereColor,
                    emissive: emissiveColor,
                    emissiveIntensity: emissiveIntensity * 0.3,
                    metalness: 0.05,
                    roughness: 0.6,
                    transparent: isTransparent,
                    opacity: nodeOpacity
                });
                // BoxGeometry face order: +X, -X, +Y, -Y, +Z (front), -Z (back)
                material = [
                    sideMaterial, // right
                    sideMaterial, // left
                    sideMaterial, // top
                    sideMaterial, // bottom
                    faceMaterial, // front — TEXT HERE
                    sideMaterial  // back
                ];
            } else if (hasSurfaceText) {
                // Diamond etc — single material with texture on all faces
                var fillHex = '#' + sphereColor.getHexString();
                var surfaceTex = createSurfaceTexture(data.label, fillHex, pxW, pxH, nodeFontSize, nodeTextColor);
                material = new THREE.MeshStandardMaterial({
                    map: surfaceTex,
                    emissive: emissiveColor,
                    emissiveIntensity: emissiveIntensity * 0.15,
                    metalness: 0.1,
                    roughness: 0.6,
                    transparent: isTransparent,
                    opacity: nodeOpacity
                });
            } else {
                // Spheres/circles/hexagons: shiny for specular highlights
                // Stars/rects: matte flat look
                var isShiny = (shape === 'circle' || shape === 'hexagon' || shape === 'diamond' || shape === '' || !shape);
                material = new THREE.MeshStandardMaterial({
                    color: sphereColor,
                    emissive: emissiveColor,
                    emissiveIntensity: emissiveIntensity,
                    metalness: isShiny ? 0.15 : 0.05,
                    roughness: isShiny ? 0.35 : 0.6,
                    transparent: isTransparent,
                    opacity: nodeOpacity
                });
            }

            mesh = new THREE.Mesh(geometry, material);

            if (shape === 'star') {
                geometry.center();
            }
            if (shape === 'hexagon') {
                mesh.rotation.x = Math.PI / 2;
            }

            mesh.position.set(
                data.position?.x ?? (Math.random() - 0.5) * SPACE_RANGE,
                data.position?.y ?? (Math.random() - 0.5) * SPACE_RANGE,
                data.position?.z ?? (Math.random() - 0.5) * SPACE_RANGE
            );

            // Glow removed — clean airy look matching 2D
        } else {
            mesh = new THREE.Object3D();
            mesh.position.set(
                data.position?.x ?? (Math.random() - 0.5) * SPACE_RANGE,
                data.position?.y ?? (Math.random() - 0.5) * SPACE_RANGE,
                data.position?.z ?? (Math.random() - 0.5) * SPACE_RANGE
            );
        }

        mesh.userData = {
            id: data.id,
            type: data.type || 'shape',
            sourceId: data.sourceId,
            label: data.label || '',
            priority: data.priority || 'default',
            tags: data.tags || [],
            metadata: data.metadata || {},
            pulseSpeed: pulseSpeed,
            pulsePhase: Math.random() * Math.PI * 2,
            isStar: isStar,
            shapeType: shape
        };

        scene.add(mesh);

        // Labels — different strategy per shape:
        // circle/hexagon/star: "Universal" style — text sprite at center, faces camera
        // textNode: floating billboard at center
        // rect/diamond: surface texture (already handled above via hasSurfaceText)
        var label = null;
        if (data.label && data.label.trim() && !hasSurfaceText) {
            var fillHexForLabel = '#' + sphereColor.getHexString();
            if (shape === 'circle' || shape === 'hexagon' || shape === 'star') {
                // "Universal" face label — sits at center, faces camera
                label = createSphereLabelSprite(data.label, size, fillHexForLabel, nodeTextColor);
                label.position.set(0, 0, 0);
                label.visible = showLabels;
                mesh.add(label);
            } else if (isTextNode) {
                // Text-only node — floating billboard at center
                label = createTextSprite(data.label, sphereColor, nodeFontSize, size);
                label.position.set(0, 0, 0);
                label.visible = showLabels;
                mesh.add(label);
            }
        }

        var sphereObj = { mesh, data, label, size };
        spheres.push(sphereObj);
        return sphereObj;
    }

    // fontSizeHint: the node's 2D fontSize (default 16)
    // nodeSize: the 3D size of the parent shape
    function createTextSprite(text, color, fontSizeHint, nodeSize) {
        const THREE = window.THREE;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 80;

        // Scale font from 2D fontSize: 16px → 32px canvas, proportional
        var canvasFont = Math.round(Math.max(20, Math.min(64, (fontSizeHint || 16) * 2)));

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold ' + canvasFont + 'px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Truncate text
        var displayText = text;
        if (displayText.length > 30) displayText = displayText.substring(0, 28) + '...';

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(displayText, 256, 40);

        var texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        var material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            sizeAttenuation: true
        });
        var sprite = new THREE.Sprite(material);

        // Scale sprite to stay proportional to the sphere it sits above
        // Cap width at ~1.5x the sphere diameter so labels never dwarf the shape
        var sizeRef = nodeSize || SPHERE_BASE_SIZE;
        var diameter = sizeRef * 2;
        var spriteW = Math.min(diameter * 1.5, Math.max(1.5, sizeRef * 1.6));
        var spriteH = spriteW * (canvas.height / canvas.width);
        sprite.scale.set(spriteW, spriteH, 1);
        return sprite;
    }

    function disposeMaterial(mat) {
        if (!mat) return;
        if (Array.isArray(mat)) {
            mat.forEach(function(m) { if (m) m.dispose(); });
        } else {
            mat.dispose();
        }
    }

    function removeSphere(id) {
        const idx = spheres.findIndex(s => s.data.id === id);
        if (idx === -1) return;
        const s = spheres[idx];
        scene.remove(s.mesh);
        if (s.mesh.geometry) s.mesh.geometry.dispose();
        disposeMaterial(s.mesh.material);
        spheres.splice(idx, 1);
    }

    function clearAllSpheres() {
        disposeNodeLights();
        spheres.forEach(s => {
            scene.remove(s.mesh);
            if (s.mesh.geometry) s.mesh.geometry.dispose();
            disposeMaterial(s.mesh.material);
        });
        spheres = [];
    }

    // === CONNECTION MANAGEMENT ===
    function addConnection(data) {
        const THREE = window.THREE;
        const fromSphere = spheres.find(s => s.data.id === data.from);
        const toSphere = spheres.find(s => s.data.id === data.to);
        if (!fromSphere || !toSphere) {
            console.warn('[3D] Connection skipped: from=', data.from, !!fromSphere, 'to=', data.to, !!toSphere);
            return null;
        }

        const strength = data.strength || 0.5;
        const color = data.color ? new THREE.Color(data.color) : new THREE.Color(0x4466ff);

        // Create curved line using QuadraticBezierCurve3
        const start = fromSphere.mesh.position.clone();
        const end = toSphere.mesh.position.clone();
        const mid = start.clone().add(end).multiplyScalar(0.5);
        // Push midpoint outward for curve
        const dir = new THREE.Vector3().crossVectors(
            end.clone().sub(start).normalize(),
            new THREE.Vector3(0, 1, 0)
        ).normalize();
        mid.add(dir.multiplyScalar(start.distanceTo(end) * 0.15));

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(30);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            depthWrite: false
        });

        const line = new THREE.Line(geometry, material);
        line.visible = showOrbits;
        scene.add(line);

        const connObj = { line, data, fromSphere, toSphere };
        connections.push(connObj);
        return connObj;
    }

    function clearAllConnections() {
        connections.forEach(c => {
            scene.remove(c.line);
            if (c.line.geometry) c.line.geometry.dispose();
            if (c.line.material) c.line.material.dispose();
        });
        connections = [];
    }

    function updateConnectionPositions() {
        const THREE = window.THREE;
        connections.forEach(c => {
            if (!c.fromSphere || !c.toSphere) return;
            const start = c.fromSphere.mesh.position.clone();
            const end = c.toSphere.mesh.position.clone();
            const mid = start.clone().add(end).multiplyScalar(0.5);
            const dir = new THREE.Vector3().crossVectors(
                end.clone().sub(start).normalize(),
                new THREE.Vector3(0, 1, 0)
            ).normalize();
            if (dir.length() > 0) {
                mid.add(dir.multiplyScalar(start.distanceTo(end) * 0.15));
            }
            const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
            const points = curve.getPoints(30);
            c.line.geometry.setFromPoints(points);
        });
    }

    // === FORCE-DIRECTED LAYOUT ===
    function applyForceLayout(iterations) {
        iterations = iterations || 100;
        const repulsionStrength = 500;
        const attractionStrength = 0.01;
        const damping = 0.9;
        const minDist = 4;

        // Init velocities
        const velocities = spheres.map(() => ({ x: 0, y: 0, z: 0 }));

        // Build connection map
        const connMap = new Set();
        connections.forEach(c => {
            connMap.add(c.data.from + '|' + c.data.to);
            connMap.add(c.data.to + '|' + c.data.from);
        });

        for (let iter = 0; iter < iterations; iter++) {
            const dt = 0.05;
            const cooling = 1 - (iter / iterations) * 0.8;

            for (let i = 0; i < spheres.length; i++) {
                const pi = spheres[i].mesh.position;
                let fx = 0, fy = 0, fz = 0;

                // Repulsion from all others
                for (let j = 0; j < spheres.length; j++) {
                    if (i === j) continue;
                    const pj = spheres[j].mesh.position;
                    let dx = pi.x - pj.x;
                    let dy = pi.y - pj.y;
                    let dz = pi.z - pj.z;
                    let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist < minDist) dist = minDist;
                    const force = repulsionStrength / (dist * dist);
                    fx += (dx / dist) * force;
                    fy += (dy / dist) * force;
                    fz += (dz / dist) * force;
                }

                // Attraction to connected nodes
                for (let j = 0; j < spheres.length; j++) {
                    if (i === j) continue;
                    const key = spheres[i].data.id + '|' + spheres[j].data.id;
                    if (!connMap.has(key)) continue;
                    const pj = spheres[j].mesh.position;
                    let dx = pj.x - pi.x;
                    let dy = pj.y - pi.y;
                    let dz = pj.z - pi.z;
                    let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist < 0.1) dist = 0.1;
                    fx += dx * attractionStrength;
                    fy += dy * attractionStrength;
                    fz += dz * attractionStrength;
                }

                // Center gravity
                fx -= pi.x * 0.001;
                fy -= pi.y * 0.001;
                fz -= pi.z * 0.001;

                velocities[i].x = (velocities[i].x + fx * dt) * damping * cooling;
                velocities[i].y = (velocities[i].y + fy * dt) * damping * cooling;
                velocities[i].z = (velocities[i].z + fz * dt) * damping * cooling;
            }

            // Apply velocities
            for (let i = 0; i < spheres.length; i++) {
                const p = spheres[i].mesh.position;
                p.x += velocities[i].x;
                p.y += velocities[i].y;
                p.z += velocities[i].z;
                // Clamp
                p.x = Math.max(-SPACE_RANGE, Math.min(SPACE_RANGE, p.x));
                p.y = Math.max(-SPACE_RANGE, Math.min(SPACE_RANGE, p.y));
                p.z = Math.max(-SPACE_RANGE, Math.min(SPACE_RANGE, p.z));
            }
        }

        updateConnectionPositions();
    }

    // === LOAD DATA ===
    // Median-based size clamp: computed once per loadData, used by addSphere
    var _sizeClamp = Infinity;

    function loadData(nodes, conns) {
        clearAllSpheres();
        clearAllConnections();

        // Compute median node size → clamp outliers at 8x median
        _sizeClamp = Infinity;
        if (nodes && nodes.length > 2) {
            var SCALE3D = 30;
            var allSizes = nodes.map(function(n) {
                var pxW = (n.metadata && n.metadata.pxW) || 80;
                var pxH = (n.metadata && n.metadata.pxH) || 80;
                return Math.max(pxW, pxH) / SCALE3D;
            }).sort(function(a, b) { return a - b; });
            var median = allSizes[Math.floor(allSizes.length / 2)];
            _sizeClamp = median * 8;
        }

        if (nodes && nodes.length > 0) {
            nodes.forEach(n => addSphere(n));
        }

        if (conns && conns.length > 0) {
            conns.forEach(c => addConnection(c));
        }

        // Apply force layout if no positions defined
        const hasPositions = nodes && nodes.some(n => n.position && (n.position.x !== 0 || n.position.y !== 0));
        if (!hasPositions && spheres.length > 1) {
            applyForceLayout(80);
        }

        // Dynamic node lights (top 6 biggest spheres)
        rebuildNodeLights();

        console.log('Galaxy3D: loaded', spheres.length, 'spheres,', connections.length, 'connections,', nodeLights.length, 'node lights');

        // Auto-fit camera to show all nodes
        fitToView();
    }

    // === ANIMATION LOOP ===
    function animate() {
        animationId = requestAnimationFrame(animate);

        try {
            if (_firstFrame) {
                console.log('[3D] First animation frame running');
                _firstFrame = false;
            }

            const dt = clock.getDelta();
            const time = clock.elapsedTime;

            // Subtle breathing + rotate stars
            spheres.forEach(s => {
                if (!s.mesh || !s.mesh.userData) return;
                const ud = s.mesh.userData;
                const pulse = 1 + 0.02 * Math.sin(time * ud.pulseSpeed * 0.4 + ud.pulsePhase);
                s.mesh.scale.setScalar(pulse);

                // Star rotation removed — label sprite is a child, rotation would spin it
            });

            // Connection glow animation
            connections.forEach(c => {
                if (c.line && c.line.material) {
                    c.line.material.opacity = 0.5 + 0.08 * Math.sin(time * 0.8);
                }
            });

            // Starfield: multi-layer parallax + twinkling
            updateStarField(time);

            // Node lights pulse
            updateNodeLights(time);

            // Comet
            updateComet();

            // Nebulae
            updateNebulae(time, dt);

            // Voyage mode
            updateVoyage();

            // Raycaster hover
            updateHover();

            // Controls update
            if (controls) controls.update();

            // Render
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        } catch (err) {
            console.error('[3D] Animation error:', err);
        }
    }

    function startAnimation() {
        if (!animationId) {
            animate();
            scheduleComet();
        }
    }

    function stopAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // === INTERACTION ===
    function onMouseMove(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update tooltip position
        if (tooltipEl && hoveredSphere) {
            tooltipEl.style.left = (event.clientX - rect.left + 15) + 'px';
            tooltipEl.style.top = (event.clientY - rect.top - 10) + 'px';
        }
    }

    function updateHover() {
        if (!raycaster || !camera) return;
        raycaster.setFromCamera(mouse, camera);

        const meshes = spheres.map(s => s.mesh);
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            if (hoveredSphere !== hit) {
                // Unhover previous
                if (hoveredSphere) {
                    resetSphereHighlight(hoveredSphere);
                }
                hoveredSphere = hit;
                highlightSphere(hit);
                showTooltip(hit.userData);
            }
            renderer.domElement.style.cursor = 'pointer';
        } else {
            if (hoveredSphere) {
                resetSphereHighlight(hoveredSphere);
                hoveredSphere = null;
                hideTooltip();
            }
            renderer.domElement.style.cursor = 'grab';
        }
    }

    function highlightSphere(mesh) {
        if (mesh.material) {
            mesh.material._origEmissiveIntensity = mesh.material.emissiveIntensity;
            mesh.material.emissiveIntensity = mesh.material._origEmissiveIntensity * 2.5;
        }
    }

    function resetSphereHighlight(mesh) {
        if (mesh.material && mesh.material._origEmissiveIntensity !== undefined) {
            mesh.material.emissiveIntensity = mesh.material._origEmissiveIntensity;
        }
    }

    function onMouseClick(event) {
        if (!raycaster || !camera) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const meshes = spheres.map(s => s.mesh);
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            selectedSphere = hit;
            // Emit custom event
            const detail = { ...hit.userData };
            renderer.domElement.dispatchEvent(new CustomEvent('galaxy-sphere-click', { detail, bubbles: true }));

            // Focus camera on sphere
            focusOnSphere(hit);
        }
    }

    function onUserInterrupt() {
        if (voyageState && !voyageState.stopping) {
            stopVoyage();
        }
    }

    function focusOnSphere(mesh) {
        if (!controls) return;
        const THREE = window.THREE;
        const target = mesh.position.clone();

        // Smooth transition
        const startTarget = controls.target.clone();
        const startPos = camera.position.clone();
        const endPos = target.clone().add(new THREE.Vector3(0, 5, 15));
        const duration = 1000;
        const startTime = Date.now();

        function animateCamera() {
            const t = Math.min((Date.now() - startTime) / duration, 1);
            const ease = t * (2 - t); // easeOutQuad

            controls.target.lerpVectors(startTarget, target, ease);
            camera.position.lerpVectors(startPos, endPos, ease);

            if (t < 1) {
                requestAnimationFrame(animateCamera);
            }
        }
        animateCamera();
    }

    // === TOOLTIP ===
    function createTooltipEl() {
        const el = document.createElement('div');
        el.id = 'galaxy-tooltip';
        el.className = 'galaxy-tooltip';
        if (containerEl) containerEl.appendChild(el);
        return el;
    }

    function showTooltip(data) {
        if (!tooltipEl) return;
        const priorityLabels = { urgent: 'URGENT', high: 'Haute', medium: 'Moyenne', low: 'Basse', done: 'Terminé', default: '-' };
        const typeLabels = { note: 'Note', task: 'Tâche', project: 'Projet' };

        let html = `<div class="gt-title">${data.label || 'Sans titre'}</div>`;
        html += `<div class="gt-type">${typeLabels[data.type] || data.type || 'Élément'}</div>`;
        html += `<div class="gt-priority gt-priority-${data.priority || 'default'}">${priorityLabels[data.priority] || priorityLabels.default}</div>`;
        if (data.tags && data.tags.length > 0) {
            html += `<div class="gt-tags">${data.tags.map(t => '<span class="gt-tag">' + t + '</span>').join('')}</div>`;
        }
        if (data.metadata?.wordCount) {
            html += `<div class="gt-meta">${data.metadata.wordCount} mots</div>`;
        }

        tooltipEl.innerHTML = html;
        tooltipEl.style.display = 'block';
    }

    function hideTooltip() {
        if (tooltipEl) {
            tooltipEl.style.display = 'none';
        }
    }

    // === CONTROLS ===
    function resetCamera() {
        fitToView();
    }

    function fitToView() {
        if (!camera || !controls) return;
        var THREE = window.THREE;

        // Compute bounding box of all nodes
        if (spheres.length === 0) {
            // No nodes: default view
            _animateCamera(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 80));
            return;
        }

        var min = new THREE.Vector3(Infinity, Infinity, Infinity);
        var max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        spheres.forEach(function(s) {
            var p = s.mesh.position;
            min.min(p);
            max.max(p);
        });

        var center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
        var boxSize = new THREE.Vector3().subVectors(max, min);
        var maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z, 5); // minimum 5 units

        // Distance to fit: use FOV to compute how far camera must be
        var fov = camera.fov * (Math.PI / 180);
        var dist = (maxDim * 0.5) / Math.tan(fov * 0.5);
        dist *= 1.3; // 30% padding

        var endTarget = center.clone();
        var endPos = new THREE.Vector3(center.x, center.y, center.z + dist);

        _animateCamera(endTarget, endPos);
    }

    function _animateCamera(endTarget, endPos) {
        if (!camera || !controls) return;
        var startTarget = controls.target.clone();
        var startPos = camera.position.clone();

        // Skip if already there
        if (startPos.distanceTo(endPos) < 0.5 && startTarget.distanceTo(endTarget) < 0.5) return;

        var duration = 900;
        var startTime = Date.now();

        function tick() {
            var t = Math.min((Date.now() - startTime) / duration, 1);
            var ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
            controls.target.lerpVectors(startTarget, endTarget, ease);
            camera.position.lerpVectors(startPos, endPos, ease);
            if (t < 1) requestAnimationFrame(tick);
        }
        tick();
    }

    function toggleLabels() {
        showLabels = !showLabels;
        spheres.forEach(s => {
            if (s.label) s.label.visible = showLabels;
        });
        return showLabels;
    }

    function toggleOrbits() {
        showOrbits = !showOrbits;
        connections.forEach(c => {
            if (c.line) c.line.visible = showOrbits;
        });
        return showOrbits;
    }

    function toggleAutoRotate() {
        autoRotate = !autoRotate;
        if (controls) controls.autoRotate = autoRotate;
        return autoRotate;
    }

    // === SCENE DATA EXPORT ===
    function getSceneData() {
        return {
            nodes: spheres.map(s => ({
                id: s.data.id,
                type: s.data.type,
                sourceId: s.data.sourceId,
                label: s.data.label,
                position: {
                    x: Math.round(s.mesh.position.x * 100) / 100,
                    y: Math.round(s.mesh.position.y * 100) / 100,
                    z: Math.round(s.mesh.position.z * 100) / 100
                },
                color: '#' + s.mesh.material.color.getHexString(),
                size: s.data.size || 1,
                priority: s.data.priority,
                tags: s.data.tags || [],
                metadata: s.data.metadata || {}
            })),
            connections: connections.map(c => ({
                id: c.data.id,
                from: c.data.from,
                to: c.data.to,
                strength: c.data.strength || 0.5,
                reason: c.data.reason || '',
                color: c.data.color || '#4466ff'
            })),
            appState: {
                cameraPosition: camera ? {
                    x: Math.round(camera.position.x * 100) / 100,
                    y: Math.round(camera.position.y * 100) / 100,
                    z: Math.round(camera.position.z * 100) / 100
                } : { x: 0, y: 15, z: 50 },
                cameraTarget: controls ? {
                    x: Math.round(controls.target.x * 100) / 100,
                    y: Math.round(controls.target.y * 100) / 100,
                    z: Math.round(controls.target.z * 100) / 100
                } : { x: 0, y: 0, z: 0 },
                autoRotate: autoRotate,
                showLabels: showLabels,
                showOrbits: showOrbits
            }
        };
    }

    function restoreAppState(appState) {
        if (!appState) return;
        if (appState.cameraPosition && camera) {
            camera.position.set(appState.cameraPosition.x, appState.cameraPosition.y, appState.cameraPosition.z);
        }
        if (appState.cameraTarget && controls) {
            controls.target.set(appState.cameraTarget.x, appState.cameraTarget.y, appState.cameraTarget.z);
        }
        if (appState.autoRotate !== undefined) {
            autoRotate = appState.autoRotate;
            if (controls) controls.autoRotate = autoRotate;
        }
        if (appState.showLabels !== undefined) {
            showLabels = appState.showLabels;
            spheres.forEach(s => { if (s.label) s.label.visible = showLabels; });
        }
        if (appState.showOrbits !== undefined) {
            showOrbits = appState.showOrbits;
            connections.forEach(c => { if (c.line) c.line.visible = showOrbits; });
        }
    }

    // === RESIZE ===
    function onResize() {
        if (!containerEl || !camera || !renderer) return;
        const w = containerEl.clientWidth;
        const h = containerEl.clientHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    // === ZOOM CONTROLS ===
    function zoomIn() {
        if (!camera || !controls) return;
        const direction = new window.THREE.Vector3();
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, 5); // Avancer de 5 unités
        if (controls) controls.update();
    }

    function zoomOut() {
        if (!camera || !controls) return;
        const direction = new window.THREE.Vector3();
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, -5); // Reculer de 5 unités
        if (controls) controls.update();
    }

    // === COMET EFFECT ===
    let cometObj = null;
    let cometTimer = null;
    const COMET_BASE_TRAIL = 32;

    // Color palettes: 75% cyan, 25% violet
    const COMET_PALETTES = [
        { head: 0x44ddff, trail: [0.27, 0.87, 1.0] },  // cyan
        { head: 0x44ddff, trail: [0.27, 0.87, 1.0] },  // cyan
        { head: 0x44ddff, trail: [0.27, 0.87, 1.0] },  // cyan
        { head: 0x9945ff, trail: [0.55, 0.22, 1.0] }   // violet
    ];

    function scheduleComet() {
        if (cometTimer) clearTimeout(cometTimer);
        var delay = (30 + Math.random() * 30) * 1000; // 30-60s
        cometTimer = setTimeout(launchComet, delay);
    }

    function launchComet() {
        if (!scene || cometObj) { scheduleComet(); return; }
        var THREE = window.THREE;

        // Pick random color
        var palette = COMET_PALETTES[Math.floor(Math.random() * COMET_PALETTES.length)];

        // Pick random size: small 40%, medium 35%, large 25%
        var sizeRoll = Math.random();
        var scale, trailLen;
        if (sizeRoll < 0.40) {
            scale = 1.0;                                    // small
            trailLen = COMET_BASE_TRAIL;
        } else if (sizeRoll < 0.75) {
            scale = 1.5 + Math.random() * 0.5;             // medium: 1.5x-2x
            trailLen = Math.round(COMET_BASE_TRAIL * 1.4);
        } else {
            scale = 2.5 + Math.random() * 0.5;             // large: 2.5x-3x
            trailLen = Math.round(COMET_BASE_TRAIL * 2.0);
        }

        // Random start/end on a sphere far behind the nodes (z = -80 to -150)
        var zDepth = -80 - Math.random() * 70;
        var angle1 = Math.random() * Math.PI * 2;
        var angle2 = angle1 + Math.PI + (Math.random() - 0.5) * 1.2;
        var spread = 120 + Math.random() * 60;
        var startPos = new THREE.Vector3(
            Math.cos(angle1) * spread,
            (Math.random() - 0.5) * spread * 0.6,
            zDepth + (Math.random() - 0.5) * 30
        );
        var endPos = new THREE.Vector3(
            Math.cos(angle2) * spread,
            (Math.random() - 0.5) * spread * 0.6,
            zDepth + (Math.random() - 0.5) * 30
        );
        var mid = startPos.clone().add(endPos).multiplyScalar(0.5);
        mid.y += (Math.random() - 0.5) * 40;

        var curve = new THREE.QuadraticBezierCurve3(startPos, mid, endPos);

        // Head — bright sphere (always behind scene objects)
        var headGeo = new THREE.SphereGeometry(0.4 * scale, 8, 8);
        var headMat = new THREE.MeshBasicMaterial({ color: palette.head, transparent: true, opacity: 0.9, depthTest: false, depthWrite: false });
        var head = new THREE.Mesh(headGeo, headMat);
        head.position.copy(startPos);
        head.renderOrder = -1000;
        scene.add(head);

        // Trail — line with RGB fade (AdditiveBlending: black = invisible)
        var trailPositions = new Float32Array(trailLen * 3);
        var trailColors = new Float32Array(trailLen * 3);
        for (var i = 0; i < trailLen; i++) {
            trailPositions[i * 3] = startPos.x;
            trailPositions[i * 3 + 1] = startPos.y;
            trailPositions[i * 3 + 2] = startPos.z;
            var fade = 1.0 - (i / trailLen);
            trailColors[i * 3]     = palette.trail[0] * fade * 0.8;
            trailColors[i * 3 + 1] = palette.trail[1] * fade * 0.8;
            trailColors[i * 3 + 2] = palette.trail[2] * fade * 0.8;
        }
        var trailGeo = new THREE.BufferGeometry();
        trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
        trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
        var trailMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        var trail = new THREE.Line(trailGeo, trailMat);
        trail.renderOrder = -1000;
        scene.add(trail);

        cometObj = {
            head: head,
            trail: trail,
            curve: curve,
            trailLen: trailLen,
            trailRGB: palette.trail,
            history: [],
            startTime: clock.getElapsedTime(),
            duration: 3 + Math.random() * 1.5
        };
    }

    function updateComet() {
        if (!cometObj) return;
        var elapsed = clock.getElapsedTime() - cometObj.startTime;
        var t = elapsed / cometObj.duration;

        if (t >= 1) {
            // Done — clean up
            scene.remove(cometObj.head);
            scene.remove(cometObj.trail);
            cometObj.head.geometry.dispose();
            cometObj.head.material.dispose();
            cometObj.trail.geometry.dispose();
            cometObj.trail.material.dispose();
            cometObj = null;
            scheduleComet();
            return;
        }

        // Fade envelope: 0→1 over first 10%, hold, 1→0 over last 25%
        var fade;
        if (t < 0.10) {
            fade = t / 0.10;                       // 0→1
        } else if (t > 0.75) {
            fade = (1 - t) / 0.25;                 // 1→0
        } else {
            fade = 1;
        }

        // Move head along curve
        var pos = cometObj.curve.getPoint(t);
        cometObj.head.position.copy(pos);
        cometObj.head.material.opacity = 0.9 * fade;
        var headScale = 0.3 + 0.7 * fade;         // 1.0→0.3
        cometObj.head.scale.setScalar(headScale);

        // Update trail history
        var fullLen = cometObj.trailLen;
        var activeLen = Math.max(2, Math.round(fullLen * fade)); // trail shrinks with fade
        cometObj.history.unshift(pos.clone());
        if (cometObj.history.length > activeLen) {
            cometObj.history.length = activeLen;
        }

        // Write trail positions + RGB fade (black = invisible with AdditiveBlending)
        var posAttr = cometObj.trail.geometry.attributes.position;
        var colAttr = cometObj.trail.geometry.attributes.color;
        var rgb = cometObj.trailRGB;
        for (var i = 0; i < fullLen; i++) {
            if (i < cometObj.history.length) {
                var p = cometObj.history[i];
                posAttr.array[i * 3] = p.x;
                posAttr.array[i * 3 + 1] = p.y;
                posAttr.array[i * 3 + 2] = p.z;
                var brightness = (1.0 - i / activeLen) * 0.8 * fade;
                colAttr.array[i * 3]     = rgb[0] * brightness;
                colAttr.array[i * 3 + 1] = rgb[1] * brightness;
                colAttr.array[i * 3 + 2] = rgb[2] * brightness;
            } else {
                posAttr.array[i * 3] = pos.x;
                posAttr.array[i * 3 + 1] = pos.y;
                posAttr.array[i * 3 + 2] = pos.z;
                colAttr.array[i * 3] = 0;
                colAttr.array[i * 3 + 1] = 0;
                colAttr.array[i * 3 + 2] = 0;
            }
        }
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
    }

    function disposeComet() {
        if (cometTimer) { clearTimeout(cometTimer); cometTimer = null; }
        if (cometObj) {
            if (scene) {
                scene.remove(cometObj.head);
                scene.remove(cometObj.trail);
            }
            cometObj.head.geometry.dispose();
            cometObj.head.material.dispose();
            cometObj.trail.geometry.dispose();
            cometObj.trail.material.dispose();
            cometObj = null;
        }
    }

    // === NEBULA EFFECT ===
    let nebulae = [];         // [{ sprites[], baseOpacity[], driftDir[], center, palette, state, fadeT, fadeDur, targetOpacity }]
    let nebulaTimer = null;
    const NEBULA_MAX_VISIBLE = 4;
    const NEBULA_MIN_VISIBLE = 1;
    const NEBULA_POOL_SIZE = 5;

    const NEBULA_PALETTES = [
        // Blue-cyan (30%)
        { inner: [10, 80, 180], outer: [0, 206, 209], weight: 30 },
        // Violet-magenta (30%)
        { inner: [80, 30, 140], outer: [200, 50, 255], weight: 30 },
        // Rose-warm (25%)
        { inner: [120, 10, 60], outer: [255, 107, 107], weight: 25 },
        // Emerald-turquoise (15%)
        { inner: [10, 80, 55], outer: [64, 224, 208], weight: 15 }
    ];

    function pickNebulaPalette() {
        var roll = Math.random() * 100, acc = 0;
        for (var i = 0; i < NEBULA_PALETTES.length; i++) {
            acc += NEBULA_PALETTES[i].weight;
            if (roll < acc) return NEBULA_PALETTES[i];
        }
        return NEBULA_PALETTES[0];
    }

    // Generate a procedural nebula texture on a shared canvas
    var _nebulaCanvasCache = {};
    function createNebulaTexture(palette, variant) {
        var THREE = window.THREE;
        var key = palette.inner.join(',') + '|' + variant;
        if (_nebulaCanvasCache[key]) return _nebulaCanvasCache[key].clone();

        var size = 128;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');

        var cx = size / 2 + (variant % 3 - 1) * 8;
        var cy = size / 2 + (Math.floor(variant / 3) - 1) * 8;
        var ri = palette.inner, ro = palette.outer;
        // Blend inner/outer with per-variant randomness
        var blend = 0.3 + (variant % 5) * 0.15;
        var r1 = Math.round(ri[0] + (ro[0] - ri[0]) * blend);
        var g1 = Math.round(ri[1] + (ro[1] - ri[1]) * blend);
        var b1 = Math.round(ri[2] + (ro[2] - ri[2]) * blend);

        var grad = ctx.createRadialGradient(cx, cy, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(' + r1 + ',' + g1 + ',' + b1 + ',0.6)');
        grad.addColorStop(0.3, 'rgba(' + r1 + ',' + g1 + ',' + b1 + ',0.25)');
        grad.addColorStop(0.7, 'rgba(' + ri[0] + ',' + ri[1] + ',' + ri[2] + ',0.08)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        var tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        _nebulaCanvasCache[key] = tex;
        return tex;
    }

    function createNebula(visible) {
        var THREE = window.THREE;
        if (!scene) return null;

        var palette = pickNebulaPalette();
        var spriteCount = 5 + Math.floor(Math.random() * 6); // 5-10
        var center = new THREE.Vector3(
            (Math.random() - 0.5) * 4000,
            (Math.random() - 0.5) * 2000,
            -2000 - Math.random() * 3000
        );

        var sprites = [];
        var baseOpacity = [];
        var driftDir = [];
        var pulsePhase = [];

        for (var i = 0; i < spriteCount; i++) {
            var tex = createNebulaTexture(palette, i);
            var opacity = 0.03 + Math.random() * 0.05; // 0.03-0.08
            var mat = new THREE.SpriteMaterial({
                map: tex,
                transparent: true,
                opacity: visible ? opacity : 0,
                depthTest: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            var sprite = new THREE.Sprite(mat);

            var diameter = 500 + Math.random() * 1500; // 500-2000
            sprite.scale.set(diameter, diameter, 1);

            sprite.position.set(
                center.x + (Math.random() - 0.5) * diameter * 0.4,
                center.y + (Math.random() - 0.5) * diameter * 0.4,
                center.z + (Math.random() - 0.5) * diameter * 0.2
            );
            sprite.renderOrder = -1500;

            scene.add(sprite);
            sprites.push(sprite);
            baseOpacity.push(opacity);
            driftDir.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.06,
                (Math.random() - 0.5) * 0.06,
                (Math.random() - 0.5) * 0.02
            ));
            pulsePhase.push(Math.random() * Math.PI * 2);
        }

        return {
            sprites: sprites,
            baseOpacity: baseOpacity,
            driftDir: driftDir,
            pulsePhase: pulsePhase,
            pulsePeriod: 20 + Math.random() * 20, // 20-40s
            center: center,
            palette: palette,
            state: visible ? 'visible' : 'hidden', // visible | fading_in | fading_out | hidden
            fadeT: 0,
            fadeDur: 10 // seconds
        };
    }

    function initNebulae() {
        for (var i = 0; i < NEBULA_POOL_SIZE; i++) {
            var visible = i < 3; // first 2-3 visible
            nebulae.push(createNebula(visible));
        }
        scheduleNebulaTransition();
    }

    function scheduleNebulaTransition() {
        if (nebulaTimer) clearTimeout(nebulaTimer);
        nebulaTimer = setTimeout(nebulaTransition, (30 + Math.random() * 30) * 1000);
    }

    function nebulaTransition() {
        if (!scene) return;
        var visibleCount = 0, hiddenIndices = [], visibleIndices = [];
        for (var i = 0; i < nebulae.length; i++) {
            var s = nebulae[i].state;
            if (s === 'visible' || s === 'fading_in') { visibleCount++; visibleIndices.push(i); }
            if (s === 'hidden') hiddenIndices.push(i);
        }

        // Decide: fade in or fade out
        var canFadeIn = visibleCount < NEBULA_MAX_VISIBLE && hiddenIndices.length > 0;
        var canFadeOut = visibleCount > NEBULA_MIN_VISIBLE && visibleIndices.length > 0;

        if (canFadeIn && canFadeOut) {
            if (Math.random() < 0.5) fadeInNebula(hiddenIndices); else fadeOutNebula(visibleIndices);
        } else if (canFadeIn) {
            fadeInNebula(hiddenIndices);
        } else if (canFadeOut) {
            fadeOutNebula(visibleIndices);
        }
        scheduleNebulaTransition();
    }

    function fadeInNebula(indices) {
        var idx = indices[Math.floor(Math.random() * indices.length)];
        var n = nebulae[idx];
        // Reposition before fading in
        n.center.set((Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 2000, -2000 - Math.random() * 3000);
        for (var i = 0; i < n.sprites.length; i++) {
            var d = n.sprites[i].scale.x; // diameter
            n.sprites[i].position.set(
                n.center.x + (Math.random() - 0.5) * d * 0.4,
                n.center.y + (Math.random() - 0.5) * d * 0.4,
                n.center.z + (Math.random() - 0.5) * d * 0.2
            );
        }
        n.state = 'fading_in';
        n.fadeT = 0;
    }

    function fadeOutNebula(indices) {
        var idx = indices[Math.floor(Math.random() * indices.length)];
        nebulae[idx].state = 'fading_out';
        nebulae[idx].fadeT = 0;
    }

    function updateNebulae(time, dt) {
        for (var n = 0; n < nebulae.length; n++) {
            var neb = nebulae[n];
            if (neb.state === 'hidden') continue;

            // Fade logic
            var fadeMul = 1;
            if (neb.state === 'fading_in') {
                neb.fadeT += dt;
                fadeMul = Math.min(neb.fadeT / neb.fadeDur, 1);
                if (fadeMul >= 1) neb.state = 'visible';
            } else if (neb.state === 'fading_out') {
                neb.fadeT += dt;
                fadeMul = 1 - Math.min(neb.fadeT / neb.fadeDur, 1);
                if (fadeMul <= 0) {
                    neb.state = 'hidden';
                    for (var j = 0; j < neb.sprites.length; j++) neb.sprites[j].material.opacity = 0;
                    continue;
                }
            }

            for (var i = 0; i < neb.sprites.length; i++) {
                // Drift
                neb.sprites[i].position.add(neb.driftDir[i]);

                // Pulse opacity
                var pulse = 0.85 + 0.15 * Math.sin(time / neb.pulsePeriod * Math.PI * 2 + neb.pulsePhase[i]);
                neb.sprites[i].material.opacity = neb.baseOpacity[i] * pulse * fadeMul;
            }
        }
    }

    function disposeNebulae() {
        if (nebulaTimer) { clearTimeout(nebulaTimer); nebulaTimer = null; }
        for (var n = 0; n < nebulae.length; n++) {
            for (var i = 0; i < nebulae[n].sprites.length; i++) {
                if (scene) scene.remove(nebulae[n].sprites[i]);
                nebulae[n].sprites[i].material.map.dispose();
                nebulae[n].sprites[i].material.dispose();
            }
        }
        nebulae = [];
        _nebulaCanvasCache = {};
    }

    // === DISPOSE ===
    function dispose() {
        voyageState = null;
        disposeNebulae();
        disposeComet();
        stopAnimation();
        clearAllSpheres();
        clearAllConnections();
        _starLayers.forEach(function(layer) {
            if (layer.points && scene) {
                scene.remove(layer.points);
                if (layer.points.geometry) layer.points.geometry.dispose();
                if (layer.points.material) layer.points.material.dispose();
            }
        });
        _starLayers = [];
        starField = null;
        if (renderer && renderer.domElement) {
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('click', onMouseClick);
            renderer.domElement.removeEventListener('mousedown', onUserInterrupt);
            renderer.domElement.removeEventListener('wheel', onUserInterrupt);
            renderer.domElement.removeEventListener('touchstart', onUserInterrupt);
        }
        window.removeEventListener('resize', onResize);
        if (controls) { controls.dispose(); controls = null; }
        if (renderer) { renderer.dispose(); renderer = null; }
        if (scene) {
            // Dispose remaining scene children
            while (scene.children.length > 0) {
                var child = scene.children[0];
                scene.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach(function(m) { m.dispose(); });
                    else child.material.dispose();
                }
            }
            scene = null;
        }
        camera = null;
        initialized = false;
        console.log('Galaxy3D: disposed');
    }

    // === VOYAGE MODE ===
    let voyageState = null; // null = inactive, object = active

    function startVoyage() {
        if (!camera || !controls || spheres.length === 0) return false;
        if (voyageState) { stopVoyage(); return false; }
        var THREE = window.THREE;

        // Build path: nearest-neighbor ordering for smooth route
        var waypoints = spheres
            .slice()
            .sort(function(a, b) { return b.size - a.size; })
            .slice(0, 15); // max 15 nodes

        // Nearest-neighbor from first (biggest) node
        var ordered = [waypoints.shift()];
        while (waypoints.length > 0) {
            var last = ordered[ordered.length - 1].mesh.position;
            var bestIdx = 0, bestDist = Infinity;
            for (var i = 0; i < waypoints.length; i++) {
                var d = last.distanceTo(waypoints[i].mesh.position);
                if (d < bestDist) { bestDist = d; bestIdx = i; }
            }
            ordered.push(waypoints.splice(bestIdx, 1)[0]);
        }

        // Compute center for panoramic start/end
        var center = new THREE.Vector3();
        spheres.forEach(function(s) { center.add(s.mesh.position); });
        center.divideScalar(spheres.length);
        var fov = camera.fov * (Math.PI / 180);
        var bbox = new THREE.Vector3();
        var mn = new THREE.Vector3(Infinity, Infinity, Infinity);
        var mx = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        spheres.forEach(function(s) { mn.min(s.mesh.position); mx.max(s.mesh.position); });
        bbox.subVectors(mx, mn);
        var overviewDist = (Math.max(bbox.x, bbox.y, bbox.z, 5) * 0.5) / Math.tan(fov * 0.5) * 1.5;
        var overviewPos = new THREE.Vector3(center.x, center.y, center.z + overviewDist);

        // Build timeline segments
        var segments = [];

        // Phase 1: zoom out to panoramic
        segments.push({
            type: 'move',
            targetPos: overviewPos.clone(),
            targetLookAt: center.clone(),
            duration: 2000
        });

        // Phase 2: visit each node
        for (var n = 0; n < ordered.length; n++) {
            var node = ordered[n];
            var nodePos = node.mesh.position;
            var approachDist = Math.max(node.size * 2.5, 4);

            // Approach offset: come from above-side for cinematic angle
            var angle = (n / ordered.length) * Math.PI * 2;
            var offsetDir = new THREE.Vector3(
                Math.cos(angle) * approachDist,
                Math.sin(angle * 0.7) * approachDist * 0.4,
                approachDist * 0.6
            );
            var camPos = nodePos.clone().add(offsetDir);

            // Move to node
            segments.push({
                type: 'move',
                targetPos: camPos,
                targetLookAt: nodePos.clone(),
                duration: 4500
            });
            // Pause at node
            segments.push({
                type: 'pause',
                duration: 2500
            });
        }

        // Phase 3: zoom back out
        segments.push({
            type: 'move',
            targetPos: overviewPos.clone(),
            targetLookAt: center.clone(),
            duration: 3000
        });

        // Disable controls, start voyage
        controls.enabled = false;

        voyageState = {
            segments: segments,
            currentSeg: 0,
            segStartTime: Date.now(),
            startPos: camera.position.clone(),
            startLookAt: controls.target.clone(),
            stopping: false,
            stopStartTime: 0
        };

        return true;
    }

    function stopVoyage() {
        if (!voyageState || voyageState.stopping) return;
        // Replace remaining segments with a single smooth return to panoramic view
        voyageState.stopping = true;
        voyageState.startPos = camera.position.clone();
        voyageState.startLookAt = controls.target.clone();

        // Compute panoramic position (same as fitToView)
        var THREE = window.THREE;
        var center = new THREE.Vector3();
        spheres.forEach(function(s) { center.add(s.mesh.position); });
        center.divideScalar(Math.max(spheres.length, 1));
        var mn = new THREE.Vector3(Infinity, Infinity, Infinity);
        var mx = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        spheres.forEach(function(s) { mn.min(s.mesh.position); mx.max(s.mesh.position); });
        var bbox = new THREE.Vector3().subVectors(mx, mn);
        var fov = camera.fov * (Math.PI / 180);
        var dist = (Math.max(bbox.x, bbox.y, bbox.z, 5) * 0.5) / Math.tan(fov * 0.5) * 1.3;

        voyageState.returnPos = new THREE.Vector3(center.x, center.y, center.z + dist);
        voyageState.returnLookAt = center.clone();
        voyageState.stopStartTime = Date.now();
    }

    function updateVoyage() {
        if (!voyageState || !camera || !controls) return;
        var now = Date.now();

        // Handle graceful stop: animate to panoramic over 1.5s
        if (voyageState.stopping) {
            var stopT = Math.min((now - voyageState.stopStartTime) / 1500, 1);
            var ease = stopT < 0.5 ? 2 * stopT * stopT : 1 - Math.pow(-2 * stopT + 2, 2) / 2;
            camera.position.lerpVectors(voyageState.startPos, voyageState.returnPos, ease);
            controls.target.lerpVectors(voyageState.startLookAt, voyageState.returnLookAt, ease);
            if (stopT >= 1) {
                controls.enabled = true;
                voyageState = null;
            }
            return;
        }

        var seg = voyageState.segments[voyageState.currentSeg];
        if (!seg) {
            // Voyage complete
            controls.enabled = true;
            voyageState = null;
            return;
        }

        var elapsed = now - voyageState.segStartTime;
        var t = Math.min(elapsed / seg.duration, 1);

        if (seg.type === 'move') {
            // Smooth ease: ease-in-out cubic
            var ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            camera.position.lerpVectors(voyageState.startPos, seg.targetPos, ease);
            controls.target.lerpVectors(voyageState.startLookAt, seg.targetLookAt, ease);
        }
        // 'pause': camera stays put, controls.target stays put

        if (t >= 1) {
            // Advance to next segment
            voyageState.currentSeg++;
            voyageState.segStartTime = now;
            voyageState.startPos = camera.position.clone();
            voyageState.startLookAt = controls.target.clone();
        }
    }

    function isVoyageActive() {
        return voyageState !== null;
    }

    // === PUBLIC API ===
    return {
        init,
        loadData,
        addSphere,
        removeSphere,
        addConnection,
        clearAllSpheres,
        clearAllConnections,
        applyForceLayout,
        updateConnectionPositions,
        resetCamera,
        fitToView,
        zoomIn,
        zoomOut,
        toggleLabels,
        toggleOrbits,
        toggleAutoRotate,
        focusOnSphere,
        getSceneData,
        restoreAppState,
        onResize,
        dispose,
        startVoyage,
        stopVoyage,
        isVoyageActive,
        get spheres() { return spheres; },
        get connections() { return connections; },
        get isInitialized() { return initialized; }
    };
})();

window.Galaxy3D = Galaxy3D;
console.log('Galaxy3D engine loaded');
