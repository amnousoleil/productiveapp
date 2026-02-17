// ═══════════════════════════════════════════════════════════════════
// GALAXY COSMIC HISTORY - Undo/Redo (Ctrl+Z / Ctrl+Y)
//                       + Copy/Paste (Ctrl+C / Ctrl+V)
// ═══════════════════════════════════════════════════════════════════
'use strict';

const CosmicHistory = (function() {
    const MAX = 20;
    const stack = [];   // snapshots of CosmicState.nodes
    let idx = -1;       // current position in stack

    // Deep-clone nodes + connections + strokes
    function snap() {
        return JSON.parse(JSON.stringify({
            nodes: CosmicState.nodes,
            connections: CosmicState.connections,
            strokes: CosmicState.strokes || []
        }));
    }

    function restore(s) {
        CosmicState.nodes = JSON.parse(JSON.stringify(s.nodes));
        CosmicState.connections = JSON.parse(JSON.stringify(s.connections));
        CosmicState.strokes = s.strokes ? JSON.parse(JSON.stringify(s.strokes)) : [];
    }

    // Save current state (call after every mutation)
    function save() {
        stack.splice(idx + 1);
        stack.push(snap());
        if (stack.length > MAX) stack.shift();
        idx = stack.length - 1;
    }

    function undo() {
        if (idx <= 0) return;
        idx--;
        restore(stack[idx]);
    }

    function redo() {
        if (idx >= stack.length - 1) return;
        idx++;
        restore(stack[idx]);
    }

    // ─── Copy/Paste helpers ──────────────────────────────────────

    function _genId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function _cloneNode(n) {
        return {
            id: n.id,
            type: n.type || 'shape',
            shape: n.shape,
            x: n.x,
            y: n.y,
            radius: n.radius,
            color: n.color,
            text: n.text || '',
            fontSize: n.fontSize,
            textColor: n.textColor,
            width: n.width,
            height: n.height,
            rotation: n.rotation,
            locked: !!n.locked,
            metadata: n.metadata ? JSON.parse(JSON.stringify(n.metadata)) : {},
            createdAt: n.createdAt
        };
    }

    function copySelection() {
        const sel = CosmicState.selectedNodes;
        if (!sel || sel.size === 0) return;

        const selectedIds = new Set();
        const nodes = [];
        let sumX = 0, sumY = 0;

        for (const n of sel) {
            selectedIds.add(n.id);
            nodes.push(_cloneNode(n));
            sumX += n.x;
            sumY += n.y;
        }

        const centerX = sumX / nodes.length;
        const centerY = sumY / nodes.length;

        // Store relative positions
        for (const n of nodes) {
            n._relX = n.x - centerX;
            n._relY = n.y - centerY;
        }

        // Clone internal connections (both endpoints in selection)
        const connections = [];
        for (const c of CosmicState.connections) {
            if (selectedIds.has(c.fromId) && selectedIds.has(c.toId)) {
                connections.push({
                    id: c.id,
                    fromId: c.fromId,
                    toId: c.toId,
                    color: c.color,
                    label: c.label
                });
            }
        }

        CosmicState.clipboard = { nodes: nodes, connections: connections };
        console.log('📋 Copié:', nodes.length, 'nœud(s),', connections.length, 'connexion(s)');
    }

    function pasteClipboard() {
        const cb = CosmicState.clipboard;
        if (!cb || !cb.nodes || cb.nodes.length === 0) return;

        // Paste at mouse position + 20px offset
        const pasteX = CosmicState.mouse.worldX + 20;
        const pasteY = CosmicState.mouse.worldY + 20;

        const idMap = new Map(); // oldId → newId

        // Create new nodes
        const newNodes = [];
        for (const n of cb.nodes) {
            const newId = _genId();
            idMap.set(n.id, newId);

            const clone = _cloneNode(n);
            clone.id = newId;
            clone.x = pasteX + (n._relX || 0);
            clone.y = pasteY + (n._relY || 0);
            clone.locked = false;
            clone.createdAt = Date.now();

            CosmicState.nodes.push(clone);
            newNodes.push(clone);
        }

        // Recreate internal connections with new IDs
        for (const c of cb.connections) {
            const newFrom = idMap.get(c.fromId);
            const newTo = idMap.get(c.toId);
            if (newFrom && newTo) {
                CosmicState.connections.push({
                    id: _genId() + '_c',
                    fromId: newFrom,
                    toId: newTo,
                    color: c.color,
                    label: c.label
                });
            }
        }

        // Select only the pasted nodes
        CosmicState.selectedNodes.clear();
        for (const n of newNodes) {
            CosmicState.selectedNodes.add(n);
        }

        // Save to history + persist
        save();
        if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();

        console.log('📌 Collé:', newNodes.length, 'nœud(s) à', Math.round(pasteX), Math.round(pasteY));
    }

    // ─── Keyboard shortcuts ──────────────────────────────────────
    // Only active when Galaxy View is open
    document.addEventListener('keydown', (e) => {
        if (!CosmicState || !CosmicState.canvas) return;
        const galaxy = document.getElementById('view-galaxy');
        if (!galaxy || !galaxy.classList.contains('active')) return;

        // Don't intercept when typing in text fields
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

        if (!(e.ctrlKey || e.metaKey)) return;

        switch (e.key) {
            case 'z':
                if (!e.shiftKey) { e.preventDefault(); undo(); }
                break;
            case 'Z':
                if (e.shiftKey) { e.preventDefault(); redo(); }
                break;
            case 'y':
                e.preventDefault(); redo();
                break;
            case 'c':
                e.preventDefault(); copySelection();
                break;
            case 'v':
                e.preventDefault(); pasteClipboard();
                break;
        }
    });

    return { save, undo, redo, copy: copySelection, paste: pasteClipboard };
})();

window.CosmicHistory = CosmicHistory;
console.log('📦 galaxy-cosmic-history.js loaded');
