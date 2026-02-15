/**
 * NOTES GRAPH 3D ENGINE - Three.js knowledge graph visualization
 * ProductiveApp v5.0
 *
 * Features:
 * - 3D visualization of interconnected notes (Obsidian-style)
 * - Category-based colors (technical, creative, planning, research, etc.)
 * - AI-detected semantic connections with strength opacity
 * - Force-directed layout for optimal spacing
 * - Interactive hover tooltips and click-to-focus
 * - Bloom post-processing for premium look
 * - Auto-rotation and smooth camera transitions
 */
const NotesGraph3D = (function() {
    'use strict';

    // === STATE ===
    let scene, camera, renderer, controls;
    let composer, bloomPass;
    let raycaster, mouse;
    let spheres = [];        // { mesh, data, label, glowMesh }
    let connections = [];    // { line, data }
    let animationId = null;
    let initialized = false;
    let containerEl, canvasEl, tooltipEl;
    let hoveredSphere = null;
    let selectedSphere = null;
    let showLabels = true;
    let autoRotate = false;
    let clock;

    // === CONSTANTS ===
    const CATEGORY_COLORS = {
        technical:  { color: 0x4488ff, emissive: 0x2266ff, intensity: 1.5, pulseSpeed: 1.5 },
        creative:   { color: 0xaa44ff, emissive: 0x8822ff, intensity: 1.8, pulseSpeed: 2.0 },
        planning:   { color: 0xff8800, emissive: 0xff6600, intensity: 1.6, pulseSpeed: 1.7 },
        research:   { color: 0x22cc66, emissive: 0x11aa44, intensity: 1.4, pulseSpeed: 1.3 },
        personal:   { color: 0xff66aa, emissive: 0xff4488, intensity: 1.3, pulseSpeed: 1.8 },
        reference:  { color: 0xcccc44, emissive: 0xaaaa22, intensity: 1.0, pulseSpeed: 1.0 },
        meeting:    { color: 0x44ccff, emissive: 0x22aaff, intensity: 1.2, pulseSpeed: 1.4 },
        idea:       { color: 0xff44ff, emissive: 0xff22ff, intensity: 2.0, pulseSpeed: 2.5 },
        default:    { color: 0xaaaacc, emissive: 0x8888aa, intensity: 0.8, pulseSpeed: 1.0 }
    };

    const SPHERE_BASE_SIZE = 1.0;
    const SPACE_RANGE = 80;
    const BLOOM_STRENGTH = 1.8;
    const BLOOM_RADIUS = 0.5;
    const BLOOM_THRESHOLD = 0.1;

    // === INITIALIZATION ===
    function init(container) {
        if (initialized) {
            onResize();
            return;
        }

        containerEl = typeof container === 'string' ? document.getElementById(container) : container;
        if (!containerEl) {
            console.error('NotesGraph3D: container not found');
            return;
        }

        canvasEl = containerEl.querySelector('#notes-graph-canvas');
        if (!canvasEl) {
            canvasEl = document.createElement('canvas');
            canvasEl.id = 'notes-graph-canvas';
            containerEl.appendChild(canvasEl);
        }

        tooltipEl = containerEl.querySelector('#graph-tooltip');
        if (!tooltipEl) {
            tooltipEl = createTooltipEl();
            containerEl.appendChild(tooltipEl);
        }

        if (!window.THREE) {
            console.error('NotesGraph3D: Three.js not loaded');
            return;
        }

        const THREE = window.THREE;
        clock = new THREE.Clock();

        // Scene with dark background for glowing notes
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a12);
        scene.fog = new THREE.FogExp2(0x0a0a12, 0.003);

        // Camera
        const w = containerEl.clientWidth || 800;
        const h = containerEl.clientHeight || 600;
        camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
        camera.position.set(0, 30, 70);

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
        renderer.toneMappingExposure = 1.0;

        // Post-processing (bloom)
        setupBloom(w, h);

        // Controls
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 5;
            controls.maxDistance = 300;
            controls.autoRotate = autoRotate;
            controls.autoRotateSpeed = 0.2;
            controls.enablePan = true;
            controls.zoomSpeed = 1.2;
        }

        // Raycaster
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2(-999, -999);

        // Lights
        setupLights();

        // Starfield background
        createStarField();

        // Events
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
        renderer.domElement.addEventListener('click', onMouseClick, false);
        window.addEventListener('resize', onResize, false);

        initialized = true;
        startAnimation();
        console.log('NotesGraph3D: initialized');
    }

    function setupBloom(w, h) {
        const THREE = window.THREE;

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
            console.log('NotesGraph3D: bloom enabled');
        } else {
            composer = null;
            console.log('NotesGraph3D: bloom fallback to standard rendering');
        }
    }

    function setupLights() {
        const THREE = window.THREE;

        // Ambient light
        const ambient = new THREE.AmbientLight(0x222244, 0.4);
        scene.add(ambient);

        // Soft point lights for atmosphere
        const light1 = new THREE.PointLight(0x6644ff, 0.6, 200);
        light1.position.set(40, 40, 40);
        scene.add(light1);

        const light2 = new THREE.PointLight(0xff44aa, 0.4, 200);
        light2.position.set(-40, -20, -40);
        scene.add(light2);
    }

    function createStarField() {
        const THREE = window.THREE;
        const starCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 400;
            positions[i3 + 1] = (Math.random() - 0.5) * 400;
            positions[i3 + 2] = (Math.random() - 0.5) * 400;

            const brightness = 0.6 + Math.random() * 0.4;
            colors[i3] = brightness;
            colors[i3 + 1] = brightness;
            colors[i3 + 2] = brightness;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        const stars = new THREE.Points(geometry, material);
        scene.add(stars);
    }

    function createTooltipEl() {
        const el = document.createElement('div');
        el.id = 'graph-tooltip';
        el.className = 'graph-tooltip';
        el.style.cssText = 'position:absolute;display:none;pointer-events:none;';
        return el;
    }

    // === GRAPH DATA LOADING ===
    function loadGraph(graphData) {
        if (!initialized) {
            console.error('NotesGraph3D: not initialized');
            return;
        }

        clearGraph();

        const { nodes, edges } = graphData;

        // Add spheres for each note
        nodes.forEach(node => {
            addSphere(node);
        });

        // Add connections
        edges.forEach(edge => {
            addConnection(edge);
        });

        // Apply force layout if positions not pre-computed
        const hasPositions = nodes.some(n => n.position && n.position.x !== undefined);
        if (!hasPositions) {
            applyForceLayout();
        } else {
            // Use pre-computed positions
            spheres.forEach((sphere, i) => {
                const node = nodes[i];
                if (node.position) {
                    sphere.mesh.position.set(node.position.x, node.position.y, node.position.z);
                }
            });
        }

        console.log(`NotesGraph3D: loaded ${nodes.length} nodes, ${edges.length} edges`);
    }

    function clearGraph() {
        // Remove all spheres
        spheres.forEach(s => {
            scene.remove(s.mesh);
            if (s.glowMesh) scene.remove(s.glowMesh);
            if (s.label) scene.remove(s.label);
        });
        spheres = [];

        // Remove all connections
        connections.forEach(c => scene.remove(c.line));
        connections = [];

        hoveredSphere = null;
        selectedSphere = null;
    }

    // === SPHERE CREATION ===
    function addSphere(noteData) {
        const THREE = window.THREE;

        const category = noteData.category || 'default';
        const colorData = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;

        // Size based on word count (1-5 scale)
        const wordCount = noteData.wordCount || 100;
        const sizeMultiplier = Math.min(Math.max(1 + (wordCount / 500), 1), 5);
        const size = SPHERE_BASE_SIZE * sizeMultiplier;

        // Random initial position (will be adjusted by force layout)
        const x = (Math.random() - 0.5) * SPACE_RANGE;
        const y = (Math.random() - 0.5) * SPACE_RANGE;
        const z = (Math.random() - 0.5) * SPACE_RANGE;

        // Main sphere
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: colorData.color,
            emissive: colorData.emissive,
            emissiveIntensity: colorData.intensity,
            metalness: 0.2,
            roughness: 0.4,
            transparent: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.userData = {
            id: noteData.id,
            type: 'note',
            title: noteData.title,
            category: category,
            keywords: noteData.keywords || [],
            wordCount: wordCount
        };
        scene.add(mesh);

        // Outer glow sphere
        const glowGeometry = new THREE.SphereGeometry(size * 1.3, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: colorData.emissive,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.set(x, y, z);
        scene.add(glowMesh);

        // Store sphere data
        spheres.push({
            mesh,
            glowMesh,
            data: noteData,
            colorData,
            baseEmissiveIntensity: colorData.intensity,
            pulseSpeed: colorData.pulseSpeed
        });
    }

    // === CONNECTION CREATION ===
    function addConnection(edgeData) {
        const THREE = window.THREE;

        // Find source and target spheres
        const sourceSphere = spheres.find(s => s.data.id === edgeData.source);
        const targetSphere = spheres.find(s => s.data.id === edgeData.target);

        if (!sourceSphere || !targetSphere) {
            console.warn('NotesGraph3D: connection missing node', edgeData);
            return;
        }

        const sourcePos = sourceSphere.mesh.position;
        const targetPos = targetSphere.mesh.position;

        // Curved connection using QuadraticBezierCurve3
        const midPoint = new THREE.Vector3(
            (sourcePos.x + targetPos.x) / 2,
            (sourcePos.y + targetPos.y) / 2 + 3,
            (sourcePos.z + targetPos.z) / 2
        );

        const curve = new THREE.QuadraticBezierCurve3(
            sourcePos.clone(),
            midPoint,
            targetPos.clone()
        );

        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Opacity based on link strength (0.0-1.0)
        const strength = edgeData.strength || 0.5;
        const opacity = 0.1 + (strength * 0.4); // 0.1-0.5 range

        // Color based on link type
        let color = 0x6688ff; // semantic (default)
        if (edgeData.type === 'reference') color = 0xffaa44;
        if (edgeData.type === 'concept') color = 0xaa44ff;
        if (edgeData.type === 'prerequisite') color = 0xff6644;
        if (edgeData.type === 'expands') color = 0x44ffaa;

        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            linewidth: 1
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);

        connections.push({
            line,
            data: edgeData,
            sourceSphere,
            targetSphere
        });
    }

    // === FORCE-DIRECTED LAYOUT ===
    function applyForceLayout() {
        const iterations = 80;
        const k = 20; // Optimal distance
        const c_rep = 3000; // Repulsion constant
        const c_spring = 0.08; // Spring constant

        for (let iter = 0; iter < iterations; iter++) {
            const forces = spheres.map(() => ({ x: 0, y: 0, z: 0 }));

            // Coulomb repulsion (all pairs)
            for (let i = 0; i < spheres.length; i++) {
                for (let j = i + 1; j < spheres.length; j++) {
                    const pi = spheres[i].mesh.position;
                    const pj = spheres[j].mesh.position;
                    const dx = pi.x - pj.x;
                    const dy = pi.y - pj.y;
                    const dz = pi.z - pj.z;
                    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.01;
                    const force = c_rep / (dist * dist);

                    forces[i].x += (dx / dist) * force;
                    forces[i].y += (dy / dist) * force;
                    forces[i].z += (dz / dist) * force;
                    forces[j].x -= (dx / dist) * force;
                    forces[j].y -= (dy / dist) * force;
                    forces[j].z -= (dz / dist) * force;
                }
            }

            // Hooke spring attraction (connected pairs)
            connections.forEach(conn => {
                const pi = conn.sourceSphere.mesh.position;
                const pj = conn.targetSphere.mesh.position;
                const dx = pi.x - pj.x;
                const dy = pi.y - pj.y;
                const dz = pi.z - pj.z;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.01;
                const force = c_spring * (dist - k);

                const iIdx = spheres.indexOf(conn.sourceSphere);
                const jIdx = spheres.indexOf(conn.targetSphere);

                forces[iIdx].x -= (dx / dist) * force;
                forces[iIdx].y -= (dy / dist) * force;
                forces[iIdx].z -= (dz / dist) * force;
                forces[jIdx].x += (dx / dist) * force;
                forces[jIdx].y += (dy / dist) * force;
                forces[jIdx].z += (dz / dist) * force;
            });

            // Apply forces
            const damping = 1.0 - (iter / iterations) * 0.95;
            spheres.forEach((sphere, i) => {
                sphere.mesh.position.x += forces[i].x * damping;
                sphere.mesh.position.y += forces[i].y * damping;
                sphere.mesh.position.z += forces[i].z * damping;

                // Keep glow in sync
                if (sphere.glowMesh) {
                    sphere.glowMesh.position.copy(sphere.mesh.position);
                }
            });
        }

        // Update connection curves
        updateConnectionCurves();

        console.log('NotesGraph3D: force layout computed');
    }

    function updateConnectionCurves() {
        const THREE = window.THREE;

        connections.forEach(conn => {
            const sourcePos = conn.sourceSphere.mesh.position;
            const targetPos = conn.targetSphere.mesh.position;

            const midPoint = new THREE.Vector3(
                (sourcePos.x + targetPos.x) / 2,
                (sourcePos.y + targetPos.y) / 2 + 3,
                (sourcePos.z + targetPos.z) / 2
            );

            const curve = new THREE.QuadraticBezierCurve3(
                sourcePos.clone(),
                midPoint,
                targetPos.clone()
            );

            const points = curve.getPoints(20);
            conn.line.geometry.setFromPoints(points);
        });
    }

    // === ANIMATION LOOP ===
    function startAnimation() {
        if (animationId) return;
        animate();
    }

    function stopAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        // Update controls
        if (controls) controls.update();

        // Pulse emissive intensity
        spheres.forEach(sphere => {
            const intensity = sphere.baseEmissiveIntensity;
            const speed = sphere.pulseSpeed;
            const pulseFactor = 1.0 + Math.sin(elapsed * speed) * 0.15;
            sphere.mesh.material.emissiveIntensity = intensity * pulseFactor;
        });

        // Raycasting for hover detection
        if (initialized) {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(spheres.map(s => s.mesh));

            if (intersects.length > 0) {
                const newHovered = intersects[0].object;
                if (hoveredSphere !== newHovered) {
                    // Unhighlight previous
                    if (hoveredSphere) {
                        hoveredSphere.scale.set(1, 1, 1);
                    }

                    // Highlight new
                    hoveredSphere = newHovered;
                    hoveredSphere.scale.set(1.2, 1.2, 1.2);

                    // Show tooltip
                    showTooltip(hoveredSphere.userData);
                }
            } else {
                if (hoveredSphere) {
                    hoveredSphere.scale.set(1, 1, 1);
                    hoveredSphere = null;
                    hideTooltip();
                }
            }
        }

        // Render
        if (composer) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }
    }

    // === EVENT HANDLERS ===
    function onMouseMove(event) {
        if (!containerEl) return;
        const rect = containerEl.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onMouseClick(event) {
        if (!initialized || !hoveredSphere) return;

        selectedSphere = hoveredSphere;

        // Smooth camera transition to selected sphere
        focusOnSphere(selectedSphere);

        // Trigger note open event
        if (typeof NotesGraphView !== 'undefined') {
            NotesGraphView.onNoteClick(selectedSphere.userData.id);
        }
    }

    function focusOnSphere(sphere) {
        if (!sphere || !controls) return;

        const targetPos = sphere.position.clone();
        const distance = 15;

        // Calculate camera position (slightly offset from target)
        const direction = camera.position.clone().sub(controls.target).normalize();
        const newCameraPos = targetPos.clone().add(direction.multiplyScalar(distance));

        // Animate camera (simple lerp)
        const startPos = camera.position.clone();
        const startTarget = controls.target.clone();
        const duration = 1000; // 1 second
        const startTime = Date.now();

        function animateCamera() {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1.0);
            const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic

            camera.position.lerpVectors(startPos, newCameraPos, ease);
            controls.target.lerpVectors(startTarget, targetPos, ease);

            if (progress < 1.0) {
                requestAnimationFrame(animateCamera);
            }
        }

        animateCamera();
    }

    function onResize() {
        if (!initialized || !containerEl) return;

        const w = containerEl.clientWidth || 800;
        const h = containerEl.clientHeight || 600;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h);

        if (composer) {
            composer.setSize(w, h);
        }
    }

    // === TOOLTIP ===
    function showTooltip(userData) {
        if (!tooltipEl) return;

        const title = userData.title || 'Sans titre';
        const category = userData.category || 'default';
        const keywords = (userData.keywords || []).slice(0, 5).join(', ');
        const wordCount = userData.wordCount || 0;

        tooltipEl.innerHTML = `
            <div style="font-weight:600; margin-bottom:4px; color:#fff;">${title}</div>
            <div style="font-size:11px; color:#aaa; margin-bottom:2px;">
                <span style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; margin-right:4px;">${category}</span>
                ${wordCount} mots
            </div>
            ${keywords ? `<div style="font-size:10px; color:#888; margin-top:4px;">${keywords}</div>` : ''}
        `;

        tooltipEl.style.display = 'block';
        tooltipEl.style.left = (mouse.x * 0.5 + 0.5) * containerEl.clientWidth + 'px';
        tooltipEl.style.top = (-mouse.y * 0.5 + 0.5) * containerEl.clientHeight + 'px';
    }

    function hideTooltip() {
        if (tooltipEl) {
            tooltipEl.style.display = 'none';
        }
    }

    // === CONTROLS ===
    function toggleLabels() {
        showLabels = !showLabels;
        // TODO: implement CSS2D labels if needed
    }

    function toggleAutoRotate() {
        autoRotate = !autoRotate;
        if (controls) {
            controls.autoRotate = autoRotate;
        }
    }

    function resetView() {
        if (!camera || !controls) return;

        camera.position.set(0, 30, 70);
        controls.target.set(0, 0, 0);
        controls.update();
    }

    // === PUBLIC API ===
    return {
        init,
        loadGraph,
        clearGraph,
        destroy: () => {
            stopAnimation();
            if (renderer) {
                renderer.dispose();
            }
            if (composer) {
                composer.dispose();
            }
            initialized = false;
        },
        toggleLabels,
        toggleAutoRotate,
        resetView,
        focusOnNote: (noteId) => {
            const sphere = spheres.find(s => s.data.id === noteId);
            if (sphere) focusOnSphere(sphere.mesh);
        }
    };
})();

// Make globally available
if (typeof window !== 'undefined') {
    window.NotesGraph3D = NotesGraph3D;
}
