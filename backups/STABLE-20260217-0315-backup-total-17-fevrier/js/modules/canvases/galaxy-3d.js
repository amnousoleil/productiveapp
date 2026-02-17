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
    let composer, bloomPass;
    let raycaster, mouse;
    let spheres = [];        // { mesh, data, label, glowMesh }
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
    const BLOOM_STRENGTH = 1.5;
    const BLOOM_RADIUS = 0.4;
    const BLOOM_THRESHOLD = 0.2;

    // === INITIALIZATION ===
    function init(container) {
        if (initialized) {
            onResize();
            return;
        }

        containerEl = typeof container === 'string' ? document.getElementById(container) : container;
        if (!containerEl) {
            console.error('Galaxy3D: container not found');
            return;
        }

        canvasEl = containerEl.querySelector('#galaxy-3d-canvas') || containerEl.querySelector('canvas');
        tooltipEl = containerEl.querySelector('#galaxy-tooltip') || createTooltipEl();

        if (!window.THREE) {
            console.error('Galaxy3D: Three.js not loaded');
            return;
        }

        const THREE = window.THREE;
        clock = new THREE.Clock();

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8f9fa); // Fond blanc doux style Miro
        // Pas de fog pour un fond clair

        // Camera
        const w = containerEl.clientWidth || 800;
        const h = containerEl.clientHeight || 600;
        camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
        camera.position.set(0, 15, 50);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvasEl,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        // Post-processing (bloom)
        setupBloom(w, h);

        // Controls
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 2;      // Zoom très proche
            controls.maxDistance = 400;    // Dézoom très loin
            controls.autoRotate = autoRotate;
            controls.autoRotateSpeed = 0.3;
            controls.enablePan = true;
            controls.zoomSpeed = 1.5;      // Zoom plus rapide à la molette
        }

        // Raycaster
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2(-999, -999);

        // Lights
        setupLights();

        // Grille de fond style Miro (remplace starfield)
        createGridBackground();

        // Events
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
        renderer.domElement.addEventListener('click', onMouseClick, false);
        window.addEventListener('resize', onResize, false);

        initialized = true;
        startAnimation();
        console.log('Galaxy3D: initialized');
    }

    function setupBloom(w, h) {
        const THREE = window.THREE;

        // Check if post-processing classes are available
        if (THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
            composer = new THREE.EffectComposer(renderer);
            const renderPass = new THREE.RenderPass(scene, camera);
            composer.addPass(renderPass);

            bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(w, h),
                BLOOM_STRENGTH,
                BLOOM_RADIUS,
                BLOOM_THRESHOLD
            );
            composer.addPass(bloomPass);
            console.log('Galaxy3D: bloom enabled');
        } else {
            composer = null;
            console.log('Galaxy3D: bloom not available, falling back to standard rendering');
        }
    }

    function setupLights() {
        const THREE = window.THREE;

        // Ambient
        const ambient = new THREE.AmbientLight(0x222244, 0.5);
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

    function createGridBackground() {
        const THREE = window.THREE;

        // Grille horizontale (sol) - style Miro
        const gridSize = 200;
        const gridDivisions = 40;
        const gridColorMain = 0xd0d0d0;   // Gris doux pour les lignes principales
        const gridColorSub = 0xe8e8e8;    // Gris très clair pour les subdivisions

        // Grille au sol (plan Y=0)
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, gridColorMain, gridColorSub);
        gridHelper.position.y = 0;
        scene.add(gridHelper);

        // Grille verticale XZ (fond) pour effet quadrillage complet
        const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize, gridDivisions, gridDivisions);
        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0xf0f0f0,
            wireframe: true,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });

        // Grille verticale arrière
        const gridBack = new THREE.Mesh(gridGeometry, gridMaterial);
        gridBack.position.z = -gridSize / 2;
        gridBack.rotation.x = 0;
        scene.add(gridBack);

        // Grille verticale gauche
        const gridLeft = new THREE.Mesh(gridGeometry, gridMaterial.clone());
        gridLeft.position.x = -gridSize / 2;
        gridLeft.rotation.y = Math.PI / 2;
        scene.add(gridLeft);

        // Grille verticale droite
        const gridRight = new THREE.Mesh(gridGeometry, gridMaterial.clone());
        gridRight.position.x = gridSize / 2;
        gridRight.rotation.y = Math.PI / 2;
        scene.add(gridRight);

        console.log('Galaxy3D: Grille style Miro créée');
    }

    // === SPHERE MANAGEMENT ===
    function addSphere(data) {
        const THREE = window.THREE;
        const priority = data.priority || 'default';
        const pConfig = PRIORITY_COLORS[priority] || PRIORITY_COLORS.default;
        const size = (data.size || 1) * SPHERE_BASE_SIZE;

        // Main sphere geometry
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: pConfig.color,
            emissive: pConfig.emissive,
            emissiveIntensity: pConfig.intensity,
            metalness: 0.3,
            roughness: 0.4
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            data.position?.x ?? (Math.random() - 0.5) * SPACE_RANGE,
            data.position?.y ?? (Math.random() - 0.5) * SPACE_RANGE,
            data.position?.z ?? (Math.random() - 0.5) * SPACE_RANGE
        );
        mesh.userData = {
            id: data.id,
            type: data.type,
            sourceId: data.sourceId,
            label: data.label || 'Sans titre',
            priority: priority,
            tags: data.tags || [],
            metadata: data.metadata || {},
            pulseSpeed: pConfig.pulseSpeed,
            pulsePhase: Math.random() * Math.PI * 2
        };

        scene.add(mesh);

        // Glow outer sphere
        const glowGeometry = new THREE.SphereGeometry(size * 1.6, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: pConfig.color,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glowMesh);

        // Text label (sprite)
        const label = createTextSprite(data.label || 'Sans titre', pConfig.color);
        label.position.set(0, size + 1.2, 0);
        label.visible = showLabels;
        mesh.add(label);

        const sphereObj = { mesh, data, label, glowMesh, size };
        spheres.push(sphereObj);
        return sphereObj;
    }

    function createTextSprite(text, color) {
        const THREE = window.THREE;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 64;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 28px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Truncate text
        let displayText = text;
        if (displayText.length > 30) displayText = displayText.substring(0, 28) + '...';

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(displayText, 256, 32);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            sizeAttenuation: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(8, 1, 1);
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
        if (!fromSphere || !toSphere) return null;

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
            color: color,
            transparent: true,
            opacity: 0.3 + strength * 0.5,
            blending: THREE.AdditiveBlending,
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
    }

    // === ANIMATION LOOP ===
    function animate() {
        animationId = requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        // Pulse spheres
        spheres.forEach(s => {
            const ud = s.mesh.userData;
            const pulse = 1 + 0.15 * Math.sin(time * ud.pulseSpeed + ud.pulsePhase);
            s.mesh.scale.setScalar(pulse);

            // Glow pulse
            if (s.glowMesh) {
                s.glowMesh.material.opacity = 0.05 + 0.06 * Math.sin(time * ud.pulseSpeed * 0.5 + ud.pulsePhase);
            }
        });

        // Connection glow animation
        connections.forEach(c => {
            if (c.line.material) {
                const baseOpacity = 0.3 + (c.data.strength || 0.5) * 0.5;
                c.line.material.opacity = baseOpacity + 0.1 * Math.sin(time * 1.5);
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
        if (composer) {
            composer.render();
        } else {
            renderer.render(scene, camera);
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
        if (!controls || !camera) return;
        const THREE = window.THREE;
        const startTarget = controls.target.clone();
        const startPos = camera.position.clone();
        const endTarget = new THREE.Vector3(0, 0, 0);
        const endPos = new THREE.Vector3(0, 15, 50);
        const duration = 800;
        const startTime = Date.now();

        function animateReset() {
            const t = Math.min((Date.now() - startTime) / duration, 1);
            const ease = t * (2 - t);
            controls.target.lerpVectors(startTarget, endTarget, ease);
            camera.position.lerpVectors(startPos, endPos, ease);
            if (t < 1) requestAnimationFrame(animateReset);
        }
        animateReset();
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
        if (composer) composer.setSize(w, h);
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
        if (starField) {
            scene.remove(starField);
            starField.geometry.dispose();
            starField.material.dispose();
            starField = null;
        }
        if (renderer) {
            renderer.dispose();
        }
        if (controls) {
            controls.dispose();
        }
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onMouseClick);
        window.removeEventListener('resize', onResize);
        scene = null;
        camera = null;
        renderer = null;
        controls = null;
        composer = null;
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
