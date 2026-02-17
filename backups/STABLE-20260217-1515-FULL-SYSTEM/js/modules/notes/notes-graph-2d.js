/**
 * NOTES GRAPH 2D ENGINE - Lightweight Canvas 2D Obsidian-style graph
 * ProductiveApp v6.0 - Ultra-lightweight alternative to Three.js
 *
 * Features:
 * - Pure Canvas 2D (no WebGL/Three.js)
 * - Force-Directed Graph layout (Coulomb + Hooke)
 * - Smooth zoom/pan (wheel + drag)
 * - AI clustering with theme colors
 * - Hover tooltips & click-to-open
 * - <50KB uncompressed vs 300KB+ with Three.js
 */
const NotesGraph2D = (function() {
    'use strict';

    // === STATE ===
    let canvas, ctx;
    let width, height;
    let nodes = [];           // { id, x, y, vx, vy, note, cluster, radius, color }
    let edges = [];           // { from, to, strength }
    let animationId = null;
    let initialized = false;

    // Camera/Transform
    let offsetX = 0;
    let offsetY = 0;
    let scale = 1.0;
    let targetScale = 1.0;

    // Interaction
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let hoveredNode = null;
    let selectedNode = null;

    // Settings
    let showLabels = true;
    let autoRotate = false;
    let simulationRunning = true;

    // Physics
    const REPULSION_STRENGTH = 1200;
    const ATTRACTION_STRENGTH = 0.03;
    const DAMPING = 0.88;
    const MIN_DISTANCE = 40;
    const MAX_FORCE = 5;
    const GRAVITY = 0.003;       // Pull toward center
    const NODE_RADIUS = 20;
    const EDGE_WIDTH = 2;

    // Simulation cooling (stabilize after ~3 seconds)
    let simFrame = 0;
    const SIM_COOLDOWN = 180; // frames before reducing forces

    // Colors (matching NotesAiCluster themes)
    const DEFAULT_COLORS = {
        technical:  '#4488ff',
        creative:   '#aa44ff',
        planning:   '#ff8800',
        research:   '#22cc66',
        personal:   '#ff66aa',
        reference:  '#cccc44',
        meeting:    '#44ccff',
        idea:       '#ff44ff',
        default:    '#aaaacc'
    };

    // === INITIALIZATION ===

    function init(container) {
        const containerEl = typeof container === 'string' ? document.getElementById(container) : container;
        if (!containerEl) {
            console.error('NotesGraph2D: container not found');
            return;
        }

        canvas = containerEl.querySelector('#notes-graph-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'notes-graph-canvas';
            containerEl.appendChild(canvas);
        }

        ctx = canvas.getContext('2d');

        resize(containerEl);

        // Events
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseLeave);
        canvas.addEventListener('click', onClick);
        window.addEventListener('resize', () => resize(containerEl));

        initialized = true;
        startAnimation();

        console.log('NotesGraph2D: initialized (lightweight Canvas 2D)');
    }

    function resize(containerEl) {
        width = containerEl.clientWidth || 800;
        height = containerEl.clientHeight || 600;

        canvas.width = width;
        canvas.height = height;

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }

    // === DATA LOADING ===

    function loadGraph(graphData) {
        if (!graphData || !graphData.nodes) {
            console.warn('NotesGraph2D: no graph data');
            return;
        }

        console.log('NotesGraph2D: loading graph', graphData);

        // Reset
        nodes = [];
        edges = [];
        simFrame = 0;

        // Get clusters from NotesAiCluster if available
        const clusters = typeof NotesAiCluster !== 'undefined'
            ? NotesAiCluster.getClusters()
            : [];

        const connections = typeof NotesAiCluster !== 'undefined'
            ? NotesAiCluster.getConnections()
            : [];

        // Build cluster map for quick lookup
        const clusterMap = {};
        clusters.forEach(cluster => {
            cluster.noteIds.forEach(noteId => {
                clusterMap[noteId] = {
                    theme: cluster.theme,
                    color: cluster.color || DEFAULT_COLORS.default,
                    keywords: cluster.keywords
                };
            });
        });

        // Create nodes
        graphData.nodes.forEach((noteData, i) => {
            const cluster = clusterMap[noteData.id] || null;

            // Initial position in circle
            const angle = (i / graphData.nodes.length) * Math.PI * 2;
            const radius = Math.min(width, height) * 0.3;

            nodes.push({
                id: noteData.id,
                x: width / 2 + Math.cos(angle) * radius,
                y: height / 2 + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                note: noteData,
                cluster: cluster,
                radius: NODE_RADIUS,
                color: cluster ? cluster.color : DEFAULT_COLORS.default,
                label: noteData.title || 'Sans titre'
            });
        });

        // Create edges — merge AI connections + graphData.connections (wiki links, manual)
        const allConnections = [...connections];
        if (graphData.connections && graphData.connections.length > 0) {
            graphData.connections.forEach(conn => {
                // Avoid duplicate edges
                const dup = allConnections.some(c =>
                    (c.fromNoteId === conn.fromNoteId && c.toNoteId === conn.toNoteId) ||
                    (c.fromNoteId === conn.toNoteId && c.toNoteId === conn.fromNoteId)
                );
                if (!dup) allConnections.push(conn);
            });
        }

        allConnections.forEach(conn => {
            const fromNode = nodes.find(n => n.id === conn.fromNoteId);
            const toNode = nodes.find(n => n.id === conn.toNoteId);

            if (fromNode && toNode) {
                edges.push({
                    from: fromNode,
                    to: toNode,
                    strength: conn.strength || 0.5
                });
            }
        });

        // Fit all nodes into view after a short delay (let initial layout settle)
        setTimeout(() => fitAllNodes(), 500);

        console.log(`NotesGraph2D: loaded ${nodes.length} nodes, ${edges.length} edges`);
    }

    // === PHYSICS SIMULATION ===

    function simulate() {
        if (!simulationRunning) return;

        simFrame++;

        // Cooling factor: simulation slows down over time → stabilization
        const cooling = Math.max(0.05, 1.0 - simFrame / (SIM_COOLDOWN * 3));
        const repulsion = REPULSION_STRENGTH * cooling;

        const cx = width / 2;
        const cy = height / 2;
        const margin = 80;

        // Coulomb repulsion (all pairs)
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];

                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const distSq = Math.max(dx * dx + dy * dy, MIN_DISTANCE * MIN_DISTANCE);
                const dist = Math.sqrt(distSq);

                const force = repulsion / distSq;
                const fx = Math.max(-MAX_FORCE, Math.min(MAX_FORCE, (dx / dist) * force));
                const fy = Math.max(-MAX_FORCE, Math.min(MAX_FORCE, (dy / dist) * force));

                n1.vx -= fx;
                n1.vy -= fy;
                n2.vx += fx;
                n2.vy += fy;
            }
        }

        // Hooke attraction (edges)
        edges.forEach(edge => {
            const dx = edge.to.x - edge.from.x;
            const dy = edge.to.y - edge.from.y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

            const force = dist * ATTRACTION_STRENGTH * edge.strength;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            edge.from.vx += fx;
            edge.from.vy += fy;
            edge.to.vx -= fx;
            edge.to.vy -= fy;
        });

        // Update positions
        nodes.forEach(node => {
            // Gravity toward center
            const gdx = cx - node.x;
            const gdy = cy - node.y;
            node.vx += gdx * GRAVITY;
            node.vy += gdy * GRAVITY;

            node.x += node.vx;
            node.y += node.vy;
            node.vx *= DAMPING;
            node.vy *= DAMPING;

            // Hard boundary walls — strong proportional push
            if (node.x < margin) {
                node.x = margin;
                node.vx = Math.abs(node.vx) * 0.5;
            } else if (node.x > width - margin) {
                node.x = width - margin;
                node.vx = -Math.abs(node.vx) * 0.5;
            }
            if (node.y < margin) {
                node.y = margin;
                node.vy = Math.abs(node.vy) * 0.5;
            } else if (node.y > height - margin) {
                node.y = height - margin;
                node.vy = -Math.abs(node.vy) * 0.5;
            }
        });
    }

    // === RENDERING ===

    function render() {
        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#0a0a12';
        ctx.fillRect(0, 0, width, height);

        // Save transform
        ctx.save();

        // Apply camera transform
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2 + offsetX, -height / 2 + offsetY);

        // Render edges
        ctx.lineWidth = EDGE_WIDTH / scale;
        edges.forEach(edge => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${edge.strength * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(edge.from.x, edge.from.y);
            ctx.lineTo(edge.to.x, edge.to.y);
            ctx.stroke();
        });

        // Render nodes
        nodes.forEach(node => {
            const isHovered = node === hoveredNode;
            const isSelected = node === selectedNode;
            const r = node.radius * (isHovered ? 1.3 : isSelected ? 1.2 : 1.0);

            // Outer glow (guard against NaN/Infinity from camera transforms)
            if (isHovered || isSelected) {
                if (isFinite(node.x) && isFinite(node.y) && isFinite(r) && r > 0) {
                    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2);
                    gradient.addColorStop(0, node.color + '40');
                    gradient.addColorStop(1, node.color + '00');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Main circle
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = isHovered ? '#ffffff' : node.color;
            ctx.lineWidth = (isHovered ? 3 : 2) / scale;
            ctx.stroke();

            // Label (if enabled and zoomed in enough)
            if (showLabels && scale > 0.5) {
                ctx.fillStyle = '#ffffff';
                ctx.font = `${14 / scale}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label,
                    node.x,
                    node.y + r + 15 / scale
                );
            }
        });

        // Restore transform
        ctx.restore();

        // UI overlay (stats, cluster legend)
        renderUIOverlay();
    }

    function renderUIOverlay() {
        // Cluster legend (top-right)
        if (nodes.length > 0) {
            const clusters = {};
            nodes.forEach(node => {
                if (node.cluster) {
                    clusters[node.cluster.theme] = node.cluster.color;
                }
            });

            const clusterNames = Object.keys(clusters);
            if (clusterNames.length > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(width - 200, 10, 190, clusterNames.length * 25 + 15);

                ctx.font = '12px Inter, sans-serif';
                ctx.textAlign = 'left';
                clusterNames.forEach((name, i) => {
                    ctx.fillStyle = clusters[name];
                    ctx.fillRect(width - 190, 20 + i * 25, 15, 15);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(name, width - 170, 28 + i * 25);
                });
            }
        }

        // Stats (bottom-left)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, height - 50, 150, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Notes: ${nodes.length}`, 20, height - 30);
        ctx.fillText(`Liens: ${edges.length}`, 20, height - 15);

        // Hover tooltip
        if (hoveredNode) {
            const mouseX = hoveredNode.screenX || width / 2;
            const mouseY = hoveredNode.screenY || height / 2;

            const tooltipText = hoveredNode.label;
            const tooltipWidth = ctx.measureText(tooltipText).width + 20;
            const tooltipHeight = 30;

            let tx = mouseX + 15;
            let ty = mouseY - 15;

            // Keep in bounds
            if (tx + tooltipWidth > width) tx = mouseX - tooltipWidth - 15;
            if (ty - tooltipHeight < 0) ty = mouseY + 15 + tooltipHeight;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(tx, ty - tooltipHeight, tooltipWidth, tooltipHeight);
            ctx.fillStyle = '#ffffff';
            ctx.font = '13px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(tooltipText, tx + 10, ty - tooltipHeight / 2);
        }
    }

    // === ANIMATION LOOP ===

    function startAnimation() {
        if (animationId) return;

        function animate() {
            simulate();
            render();

            // Smooth zoom
            if (Math.abs(scale - targetScale) > 0.01) {
                scale += (targetScale - scale) * 0.1;
            }

            animationId = requestAnimationFrame(animate);
        }

        animate();
    }

    function stopAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // === CAMERA CONTROLS ===

    function centerCamera() {
        offsetX = 0;
        offsetY = 0;
        targetScale = 1.0;
        scale = 1.0;
    }

    function fitAllNodes() {
        if (nodes.length === 0) {
            centerCamera();
            return;
        }

        // Compute bounding box of all nodes
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        nodes.forEach(node => {
            if (!isFinite(node.x) || !isFinite(node.y)) return;
            const r = node.radius || NODE_RADIUS;
            minX = Math.min(minX, node.x - r);
            maxX = Math.max(maxX, node.x + r);
            minY = Math.min(minY, node.y - r);
            maxY = Math.max(maxY, node.y + r);
        });

        if (!isFinite(minX)) { centerCamera(); return; }

        const graphW = maxX - minX;
        const graphH = maxY - minY;
        const padding = 80;

        // Scale to fit canvas
        const scaleX = (width - padding * 2) / Math.max(graphW, 1);
        const scaleY = (height - padding * 2) / Math.max(graphH, 1);
        const newScale = Math.max(0.1, Math.min(2.0, Math.min(scaleX, scaleY)));

        // Center of bounding box → canvas center
        const graphCX = (minX + maxX) / 2;
        const graphCY = (minY + maxY) / 2;

        targetScale = newScale;
        scale = newScale;
        offsetX = (width / 2 - graphCX) / newScale;
        offsetY = (height / 2 - graphCY) / newScale;

        console.log(`NotesGraph2D: fitAllNodes scale=${newScale.toFixed(2)} offset=(${offsetX.toFixed(0)},${offsetY.toFixed(0)})`);
    }

    function resetView() {
        fitAllNodes();
    }

    function focusNode(node) {
        const targetX = width / 2 - node.x * scale;
        const targetY = height / 2 - node.y * scale;

        offsetX = targetX / scale;
        offsetY = targetY / scale;
        targetScale = 1.5;

        selectedNode = node;
    }

    // === EVENT HANDLERS ===

    function onWheel(e) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        targetScale = Math.max(0.1, Math.min(5.0, targetScale * delta));
    }

    function onMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const node = getNodeAtPosition(mouseX, mouseY);

        if (node) {
            selectedNode = node;
        } else {
            isDragging = true;
            dragStartX = mouseX - offsetX * scale;
            dragStartY = mouseY - offsetY * scale;
            canvas.style.cursor = 'grabbing';
        }
    }

    function onMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (isDragging) {
            offsetX = (mouseX - dragStartX) / scale;
            offsetY = (mouseY - dragStartY) / scale;
        } else {
            const node = getNodeAtPosition(mouseX, mouseY);

            if (node !== hoveredNode) {
                hoveredNode = node;
                canvas.style.cursor = node ? 'pointer' : 'grab';

                if (node) {
                    node.screenX = mouseX;
                    node.screenY = mouseY;
                }
            }
        }
    }

    function onMouseUp() {
        isDragging = false;
        canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
    }

    function onMouseLeave() {
        isDragging = false;
        hoveredNode = null;
        canvas.style.cursor = 'grab';
    }

    let lastClickTime = 0;
    let lastClickNodeId = null;

    function onClick(e) {
        if (!selectedNode || isDragging) return;

        const now = Date.now();
        const isDoubleClick = selectedNode.id === lastClickNodeId && (now - lastClickTime) < 350;
        lastClickTime = now;
        lastClickNodeId = selectedNode.id;

        if (isDoubleClick) {
            // Double click → close graph + open note in editor
            console.log('NotesGraph2D: double-click → open note', selectedNode.id);
            if (typeof NotesGraphView !== 'undefined' && NotesGraphView.onNoteClick) {
                NotesGraphView.onNoteClick(selectedNode.id);
            }
        } else {
            // Single click → show inline preview panel (stay in graph)
            console.log('NotesGraph2D: single-click → preview note', selectedNode.id);
            focusNode(selectedNode);
            if (typeof NotesGraphView !== 'undefined' && NotesGraphView.showNotePreview) {
                NotesGraphView.showNotePreview(selectedNode.id, selectedNode.note, selectedNode.cluster);
            }
        }
    }

    function getNodeAtPosition(mouseX, mouseY) {
        // Transform mouse coords to world space
        const worldX = (mouseX - width / 2) / scale - offsetX + width / 2;
        const worldY = (mouseY - height / 2) / scale - offsetY + height / 2;

        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            const dx = worldX - node.x;
            const dy = worldY - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < node.radius * 1.2) {
                return node;
            }
        }

        return null;
    }

    // === PUBLIC CONTROLS ===

    function toggleLabels() {
        showLabels = !showLabels;
        console.log('NotesGraph2D: labels', showLabels ? 'ON' : 'OFF');
    }

    function toggleAutoRotate() {
        autoRotate = !autoRotate;
        console.log('NotesGraph2D: auto-rotate', autoRotate ? 'ON' : 'OFF');
    }

    function toggleSimulation() {
        simulationRunning = !simulationRunning;
        console.log('NotesGraph2D: simulation', simulationRunning ? 'RUNNING' : 'PAUSED');
    }

    // === PUBLIC API ===

    return {
        init,
        loadGraph,
        resetView,
        fitAllNodes,
        toggleLabels,
        toggleAutoRotate,
        toggleSimulation,
        focusNode,
        centerCamera
    };
})();

// Make globally available
if (typeof window !== 'undefined') {
    window.NotesGraph2D = NotesGraph2D;
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('NotesGraph2D: ready');
    });
} else {
    console.log('NotesGraph2D: ready');
}
