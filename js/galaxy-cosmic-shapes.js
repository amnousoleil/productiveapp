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
function hitTestNode(node, wx, wy) {
    const dx = wx - node.x, dy = wy - node.y, r = node.radius;
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
    }

    onMouseDown(e) {
        const tool = CosmicState.currentTool;
        const wX = CosmicState.mouse.worldX, wY = CosmicState.mouse.worldY;

        if (tool === 'select') {
            const node = getNodeAtWorld(wX, wY);
            if (node) {
                CosmicState.selectedNodes.clear();
                CosmicState.selectedNodes.add(node);
                this.isDraggingNode = true;
                this.dragNode = node;
                this.dragOffX = wX - node.x;
                this.dragOffY = wY - node.y;
                return true;
            }
            CosmicState.selectedNodes.clear();
            return false;
        }

        if (tool === 'hand') {
            CosmicState.interaction.isPanning = true;
            CosmicState.interaction.dragStart = {
                x: CosmicState.mouse.x, y: CosmicState.mouse.y
            };
            return true;
        }

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

        if (SHAPE_TOOLS.includes(tool)) {
            this.isDrawing = true;
            this.drawOrigin = { x: wX, y: wY };
            this.drawRadius = 0;
            this.drawShape = tool;
            return true;
        }

        return false;
    }

    onMouseMove(e) {
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

window.CosmicShapes = CosmicShapes;
window.CosmicShapeInteraction = new ShapeInteraction();
window.renderShapePreview = renderShapePreview;

console.log('📦 galaxy-cosmic-shapes.js loaded');
