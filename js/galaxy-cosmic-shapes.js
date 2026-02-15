// ═══════════════════════════════════════════════════════════════════
// GALAXY COSMIC SHAPES - Click-drag drawing + selection + movement
// ═══════════════════════════════════════════════════════════════════
'use strict';

// Shape path functions — trace centered at (0,0), no fill/stroke
const CosmicShapes = {
    circle(ctx, r) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
    },
    rect(ctx, r) {
        const w = r * 1.6, h = r * 1.2;
        ctx.beginPath();
        ctx.rect(-w / 2, -h / 2, w, h);
    },
    diamond(ctx, r) {
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r, 0);
        ctx.closePath();
    },
    hexagon(ctx, r) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 2;
            const px = Math.cos(a) * r, py = Math.sin(a) * r;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
    },
    star(ctx, r) {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const a = (Math.PI / 5) * i - Math.PI / 2;
            const d = i % 2 === 0 ? r : r * 0.4;
            const px = Math.cos(a) * d, py = Math.sin(a) * d;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
    }
};

// Hit-test: is (worldX, worldY) inside node?
// Adds tolerance so small shapes remain clickable: min 10px world-radius + 5px margin
function hitTestNode(node, wx, wy) {
    const zoom = (CosmicState && CosmicState.camera) ? CosmicState.camera.zoom : 1;
    const minR = 10 / zoom;       // 20px minimum hitbox (10px radius) in screen space
    const margin = 5 / zoom;      // 5px extra margin in screen space
    const r = Math.max(node.radius, minR) + margin;
    const dx = wx - node.x, dy = wy - node.y;
    switch (node.shape) {
        case 'rect': return Math.abs(dx) <= r * 0.8 && Math.abs(dy) <= r * 0.6;
        case 'diamond': return (Math.abs(dx) / r + Math.abs(dy) / r) <= 1;
        default: return (dx * dx + dy * dy) <= r * r;
    }
}

// Find topmost node at world position
function getNodeAtWorld(wx, wy) {
    for (let i = CosmicState.nodes.length - 1; i >= 0; i--) {
        if (hitTestNode(CosmicState.nodes[i], wx, wy)) return CosmicState.nodes[i];
    }
    return null;
}

const SHAPE_TOOLS = ['circle', 'rect', 'diamond', 'hexagon', 'star'];
const COSMIC_COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#f87171'];

class ShapeInteraction {
    constructor() {
        this.isDrawing = false;
        this.drawOrigin = null;
        this.drawRadius = 0;
        this.drawShape = null;
        this.isDraggingNode = false;
        this.dragNode = null;
        this.dragOffX = 0;
        this.dragOffY = 0;
        this.pendingConnFrom = null;
        this._lastShape = 'circle';
        // Marquee (group select)
        this.isMarquee = false;
        this.marqueeOrigin = null;
        this.marqueeCurrent = null;
        // Group drag
        this.isDraggingGroup = false;
        this.groupDragStart = null;
        // Freehand pen
        this._penStroke = null;
    }

    onMouseDown(e) {
        const tool = CosmicState.currentTool;
        const wX = CosmicState.mouse.worldX, wY = CosmicState.mouse.worldY;

        // Pen tool: start freehand stroke
        if (tool === 'pen') {
            this._penStroke = {
                id: Date.now() + '_s',
                points: [{ x: wX, y: wY }],
                color: CosmicState.currentColor || '#60a5fa',
                width: CosmicState.penWidth || 4
            };
            return true;
        }

        // Hand tool: always pan
        if (tool === 'hand') {
            CosmicState.interaction.isPanning = true;
            CosmicState.interaction.dragStart = {
                x: CosmicState.mouse.x, y: CosmicState.mouse.y
            };
            return true;
        }

        // Marquee tool: group selection rectangle
        if (tool === 'marquee') {
            const node = getNodeAtWorld(wX, wY);
            if (node && CosmicState.selectedNodes.has(node) && CosmicState.selectedNodes.size > 1) {
                // Drag the existing group
                this.isDraggingGroup = true;
                this.groupDragStart = { x: wX, y: wY };
                return true;
            }
            // Start marquee rectangle
            CosmicState.selectedNodes.clear();
            this.isMarquee = true;
            this.marqueeOrigin = { x: wX, y: wY };
            this.marqueeCurrent = { x: wX, y: wY };
            return true;
        }

        // Connector tool: click nodes to link them
        if (tool === 'connector') {
            const node = getNodeAtWorld(wX, wY);
            if (!node) { this.pendingConnFrom = null; return false; }
            if (!this.pendingConnFrom) {
                this.pendingConnFrom = node;
            } else if (this.pendingConnFrom !== node) {
                CosmicState.connections.push({
                    id: Date.now() + '_c', fromId: this.pendingConnFrom.id, toId: node.id
                });
                this.pendingConnFrom = null;
                if (window.CosmicHistory) window.CosmicHistory.save();
            }
            return true;
        }

        // Any tool: click on node → select/drag
        const node = getNodeAtWorld(wX, wY);
        if (node) {
            if (!CosmicState.selectedNodes.has(node)) {
                CosmicState.selectedNodes.clear();
                CosmicState.selectedNodes.add(node);
            }
            // Drag group if multiple selected, else single drag
            if (CosmicState.selectedNodes.size > 1 && !node.locked) {
                this.isDraggingGroup = true;
                this.groupDragStart = { x: wX, y: wY };
            } else if (!node.locked) {
                this.isDraggingNode = true;
                this.dragNode = node;
                this.dragOffX = wX - node.x;
                this.dragOffY = wY - node.y;
            }
            return true;
        }

        // Empty space with shape tool → draw new shape
        CosmicState.selectedNodes.clear();
        if (SHAPE_TOOLS.includes(tool)) {
            this.isDrawing = true;
            this.drawOrigin = { x: wX, y: wY };
            this.drawRadius = 0;
            this.drawShape = tool;
            return true;
        }

        // Empty space without shape tool → marquee lasso
        this.isMarquee = true;
        this.marqueeOrigin = { x: wX, y: wY };
        this.marqueeCurrent = { x: wX, y: wY };
        return true;
    }

    onMouseMove(e) {
        if (this._penStroke) {
            this._penStroke.points.push({ x: CosmicState.mouse.worldX, y: CosmicState.mouse.worldY });
            return true;
        }
        if (this.isMarquee && this.marqueeOrigin) {
            this.marqueeCurrent = { x: CosmicState.mouse.worldX, y: CosmicState.mouse.worldY };
            return true;
        }
        if (this.isDraggingGroup && this.groupDragStart) {
            const dx = CosmicState.mouse.worldX - this.groupDragStart.x;
            const dy = CosmicState.mouse.worldY - this.groupDragStart.y;
            for (const node of CosmicState.selectedNodes) {
                if (!node.locked) { node.x += dx; node.y += dy; }
            }
            this.groupDragStart = { x: CosmicState.mouse.worldX, y: CosmicState.mouse.worldY };
            return true;
        }
        if (this.isDrawing && this.drawOrigin) {
            const dx = CosmicState.mouse.worldX - this.drawOrigin.x;
            const dy = CosmicState.mouse.worldY - this.drawOrigin.y;
            this.drawRadius = Math.hypot(dx, dy);
            return true;
        }
        if (this.isDraggingNode && this.dragNode) {
            this.dragNode.x = CosmicState.mouse.worldX - this.dragOffX;
            this.dragNode.y = CosmicState.mouse.worldY - this.dragOffY;
            return true;
        }
        if (CosmicState.interaction.isPanning) {
            const dx = CosmicState.mouse.x - CosmicState.interaction.dragStart.x;
            const dy = CosmicState.mouse.y - CosmicState.interaction.dragStart.y;
            CosmicState.camera.x -= dx / CosmicState.camera.zoom;
            CosmicState.camera.y -= dy / CosmicState.camera.zoom;
            CosmicState.interaction.dragStart = {
                x: CosmicState.mouse.x, y: CosmicState.mouse.y
            };
            return true;
        }
        return false;
    }

    onMouseUp(e) {
        if (this._penStroke) {
            if (this._penStroke.points.length >= 2) {
                CosmicState.strokes.push(this._penStroke);
                if (window.CosmicHistory) window.CosmicHistory.save();
            }
            this._penStroke = null;
            return true;
        }
        if (this.isMarquee && this.marqueeOrigin) {
            const o = this.marqueeOrigin, c = this.marqueeCurrent;
            const x1 = Math.min(o.x, c.x), x2 = Math.max(o.x, c.x);
            const y1 = Math.min(o.y, c.y), y2 = Math.max(o.y, c.y);
            CosmicState.selectedNodes.clear();
            for (const node of CosmicState.nodes) {
                if (node.x >= x1 && node.x <= x2 && node.y >= y1 && node.y <= y2) {
                    CosmicState.selectedNodes.add(node);
                }
            }
            this.isMarquee = false;
            this.marqueeOrigin = null;
            this.marqueeCurrent = null;
            return true;
        }
        if (this.isDraggingGroup) {
            if (window.CosmicHistory) window.CosmicHistory.save();
            this.isDraggingGroup = false;
            this.groupDragStart = null;
            return true;
        }
        if (this.isDrawing) {
            if (this.drawRadius >= 15) {
                CosmicState.nodes.push({
                    id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    type: 'shape',
                    shape: this.drawShape,
                    x: this.drawOrigin.x,
                    y: this.drawOrigin.y,
                    radius: this.drawRadius,
                    color: CosmicState.currentColor || COSMIC_COLORS[Math.floor(Math.random() * COSMIC_COLORS.length)],
                    text: '',
                    createdAt: Date.now()
                });
                if (window.CosmicHistory) window.CosmicHistory.save();
            }
            this._lastShape = this.drawShape;
            this.isDrawing = false;
            this.drawOrigin = null;
            this.drawRadius = 0;
            return true;
        }
        if (this.isDraggingNode) {
            if (window.CosmicHistory) window.CosmicHistory.save();
            this.isDraggingNode = false;
            this.dragNode = null;
            return true;
        }
        if (CosmicState.interaction.isPanning) {
            CosmicState.interaction.isPanning = false;
            return true;
        }
        return false;
    }
}

// Preview ghost shape during drag
function renderShapePreview(ctx, camera) {
    const si = window.CosmicShapeInteraction;
    if (!si || !si.isDrawing || !si.drawOrigin || si.drawRadius < 2) return;

    const { x: camX, y: camY, zoom } = camera;
    const sx = (si.drawOrigin.x - camX) * zoom + ctx.canvas.width / 2;
    const sy = (si.drawOrigin.y - camY) * zoom + ctx.canvas.height / 2;
    const sr = si.drawRadius * zoom;
    const pathFn = CosmicShapes[si.drawShape];
    if (!pathFn) return;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    pathFn(ctx, sr);
    ctx.stroke();
    // Light fill preview
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#60a5fa';
    ctx.fill();
    ctx.restore();
}

// Delete/Backspace: remove selected nodes (only when Galaxy View is open)
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Delete' && e.key !== 'Backspace') return;
    if (!CosmicState || !CosmicState.canvas) return;
    const galaxy = document.getElementById('view-galaxy');
    if (!galaxy || !galaxy.classList.contains('active')) return;
    // Don't intercept when typing in an input/textarea
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const selected = Array.from(CosmicState.selectedNodes);
    if (selected.length === 0) return;

    e.preventDefault();
    let deleted = 0;
    for (const node of selected) {
        if (node.locked) continue;
        CosmicState.connections = CosmicState.connections.filter(
            c => c.fromId !== node.id && c.toId !== node.id
        );
        CosmicState.nodes = CosmicState.nodes.filter(n => n.id !== node.id);
        CosmicState.selectedNodes.delete(node);
        deleted++;
    }
    if (deleted > 0) {
        if (window.CosmicHistory) window.CosmicHistory.save();
        if (typeof debouncedSave === 'function') debouncedSave();
    }
});

// Clear button: erase all shapes, connections, strokes
(function initClearButton() {
    const btn = document.getElementById('galaxy-clear-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        if (!CosmicState || !CosmicState.canvas) return;
        const total = CosmicState.nodes.length + CosmicState.connections.length + (CosmicState.strokes ? CosmicState.strokes.length : 0);
        if (total === 0) return;
        if (!confirm('🗑️ Effacer tout le contenu du canvas ?')) return;
        CosmicState.nodes = [];
        CosmicState.connections = [];
        CosmicState.strokes = [];
        CosmicState.selectedNodes.clear();
        if (window.CosmicHistory) window.CosmicHistory.save();
        if (typeof debouncedSave === 'function') debouncedSave();
        console.log('🗑️ Canvas effacé');
    });
})();

// Render the marquee selection rectangle
function renderMarqueeRect(ctx, camera) {
    const si = window.CosmicShapeInteraction;
    if (!si || !si.isMarquee || !si.marqueeOrigin || !si.marqueeCurrent) return;
    const { x: camX, y: camY, zoom } = camera;
    const toSx = wx => (wx - camX) * zoom + ctx.canvas.width / 2;
    const toSy = wy => (wy - camY) * zoom + ctx.canvas.height / 2;
    const sx = toSx(si.marqueeOrigin.x), sy = toSy(si.marqueeOrigin.y);
    const ex = toSx(si.marqueeCurrent.x), ey = toSy(si.marqueeCurrent.y);
    ctx.save();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(sx, sy, ex - sx, ey - sy);
    ctx.fillStyle = 'rgba(96, 165, 250, 0.08)';
    ctx.fillRect(sx, sy, ex - sx, ey - sy);
    ctx.restore();
}

window.CosmicShapes = CosmicShapes;
window.CosmicShapeInteraction = new ShapeInteraction();
window.renderShapePreview = renderShapePreview;
window.renderMarqueeRect = renderMarqueeRect;
window.getNodeAtWorld = getNodeAtWorld;

console.log('📦 galaxy-cosmic-shapes.js loaded');
