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
        urgent:   { color: 0xff2222, emissive: 0xff2222, intensity: 2.0, pulseSpeed: 3.0 },
        high:     { color: 0xff6600, emissive: 0xff4400, intensity: 1.5, pulseSpeed: 2.0 },
        medium:   { color: 0xffaa00, emissive: 0xff8800, intensity: 1.0, pulseSpeed: 1.5 },
        low:      { color: 0x4488ff, emissive: 0x2266ff, intensity: 0.5, pulseSpeed: 1.0 },
        done:     { color: 0x22cc66, emissive: 0x11aa44, intensity: 0.3, pulseSpeed: 0.5 },
        default:  { color: 0xaaaacc, emissive: 0x8888aa, intensity: 0.4, pulseSpeed: 1.0 }
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

            // Trackpad: intercept wheel BEFORE OrbitControls
            // Two-finger scroll (no ctrlKey) = pan, pinch (ctrlKey) = let OrbitControls zoom
            canvasEl.addEventListener('wheel', function(e) {
                if (!e.ctrlKey) {
                    // Two-finger trackpad scroll → pan
                    e.preventDefault();
                    e.stopPropagation();
                    var dist = camera.position.distanceTo(controls.target);
                    var panScale = dist * 0.0015;
                    camera.position.x += e.deltaX * panScale;
                    camera.position.y -= e.deltaY * panScale;
                    controls.target.x += e.deltaX * panScale;
                    controls.target.y -= e.deltaY * panScale;
                }
                // ctrlKey = true → pinch zoom, OrbitControls handles it
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

        // Events
        canvasEl.addEventListener('mousemove', onMouseMove, false);
        canvasEl.addEventListener('click', onMouseClick, false);
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


    function setupLights() {
        const THREE = window.THREE;

        // Ambient
        const ambient = new THREE.AmbientLight(0x445577, 1.0);
        scene.add(ambient);

        // Point lights for atmosphere
        const light1 = new THREE.PointLight(0x6644ff, 0.8, 200);
        light1.position.set(30, 30, 30);
        scene.add(light1);

        const light2 = new THREE.PointLight(0xff4466, 0.5, 200);
        light2.position.set(-30, -20, -30);
        scene.add(light2);

        const light3 = new THREE.PointLight(0x44aaff, 0.4, 200);
        light3.position.set(0, 40, -20);
        scene.add(light3);
    }

    function createStarField() {
        const THREE = window.THREE;
        const count = 3000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        for (var i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 600;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
            var brightness = 0.4 + Math.random() * 0.6;
            colors[i * 3]     = brightness;
            colors[i * 3 + 1] = brightness;
            colors[i * 3 + 2] = brightness + Math.random() * 0.15;
        }
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        var material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true,
            depthWrite: false
        });
        starField = new THREE.Points(geometry, material);
        scene.add(starField);
        console.log('Galaxy3D: starfield created (' + count + ' stars)');
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
        var txtColor = textColor;
        if (!txtColor) {
            var tmpC = new window.THREE.Color(fillColor);
            var lum = 0.299 * tmpC.r + 0.587 * tmpC.g + 0.114 * tmpC.b;
            txtColor = lum > 0.45 ? '#000000' : '#ffffff';
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

        // Draw text CENTERED with strong contrast
        ctx.fillStyle = txtColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = txtColor === '#ffffff' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = 6;

        var lineHeight = fontSize * 1.25;
        var startY = (canvasHeight - lines.length * lineHeight) / 2 + lineHeight / 2;
        ctx.font = 'bold ' + fontSize + 'px Inter, Arial, sans-serif';
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
            emissiveIntensity = 1.2;
            pulseSpeed = 1.5;
        } else {
            var priority = data.priority || 'default';
            var pConfig = PRIORITY_COLORS[priority] || PRIORITY_COLORS.default;
            sphereColor = new THREE.Color(pConfig.color);
            emissiveColor = new THREE.Color(pConfig.emissive);
            emissiveIntensity = pConfig.intensity;
            pulseSpeed = pConfig.pulseSpeed;
        }

        // Size comes directly from adapter: pxRadius / SCALE (no clamping)
        var size = Math.max(0.3, data.size || 1);
        var isStar = (shape === 'star');
        var nodeFontSize = (data.metadata && data.metadata.fontSize) || 16;
        var nodeTextColor = (data.metadata && data.metadata.textColor) || null;
        var nodeOpacity = (data.metadata && data.metadata.opacity != null) ? data.metadata.opacity : 1;
        var pxW = (data.metadata && data.metadata.pxW) || 80;
        var pxH = (data.metadata && data.metadata.pxH) || 80;
        var SCALE3D = 30; // same scale as position conversion

        // Geometry based on shape — use real pixel proportions
        var geometry;
        if (isTextNode) {
            geometry = null;
        } else if (shape === 'star') {
            geometry = createStarGeometry(size);
        } else if (shape === 'rect') {
            // Real rect: use pixel W/H converted to 3D units
            geometry = new THREE.BoxGeometry(pxW / SCALE3D, pxH / SCALE3D, Math.min(pxW, pxH) / SCALE3D * 0.15);
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
            if (hasSurfaceText) {
                var fillHex = '#' + sphereColor.getHexString();
                // Pass real pixel dimensions — createSurfaceTexture will compute canvas at same ratio
                var surfaceTex = createSurfaceTexture(data.label, fillHex, pxW, pxH, nodeFontSize, nodeTextColor);
                material = new THREE.MeshStandardMaterial({
                    map: surfaceTex,
                    emissive: emissiveColor,
                    emissiveIntensity: emissiveIntensity * 0.5,
                    metalness: 0.2,
                    roughness: 0.5,
                    transparent: isTransparent,
                    opacity: nodeOpacity
                });
            } else {
                material = new THREE.MeshStandardMaterial({
                    color: sphereColor,
                    emissive: emissiveColor,
                    emissiveIntensity: emissiveIntensity,
                    metalness: 0.3,
                    roughness: 0.4,
                    transparent: isTransparent,
                    opacity: nodeOpacity
                });
            }

            mesh = new THREE.Mesh(geometry, material);

            if (shape === 'star') {
                geometry.center();
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

    function removeSphere(id) {
        const idx = spheres.findIndex(s => s.data.id === id);
        if (idx === -1) return;
        const s = spheres[idx];
        scene.remove(s.mesh);
        if (s.mesh.geometry) s.mesh.geometry.dispose();
        if (s.mesh.material) s.mesh.material.dispose();
        spheres.splice(idx, 1);
    }

    function clearAllSpheres() {
        spheres.forEach(s => {
            scene.remove(s.mesh);
            if (s.mesh.geometry) s.mesh.geometry.dispose();
            if (s.mesh.material) s.mesh.material.dispose();
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
    function loadData(nodes, conns) {
        clearAllSpheres();
        clearAllConnections();

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

        console.log('Galaxy3D: loaded', spheres.length, 'spheres,', connections.length, 'connections');

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

            const time = clock.getElapsedTime();

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

            // Rotate starfield slowly
            if (starField) {
                starField.rotation.y += 0.00005;
                starField.rotation.x += 0.00002;
            }

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

    // === DISPOSE ===
    function dispose() {
        stopAnimation();
        clearAllSpheres();
        clearAllConnections();
        if (starField && scene) {
            scene.remove(starField);
            if (starField.geometry) starField.geometry.dispose();
            if (starField.material) starField.material.dispose();
            starField = null;
        }
        if (renderer && renderer.domElement) {
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('click', onMouseClick);
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
        get spheres() { return spheres; },
        get connections() { return connections; },
        get isInitialized() { return initialized; }
    };
})();

window.Galaxy3D = Galaxy3D;
console.log('Galaxy3D engine loaded');
