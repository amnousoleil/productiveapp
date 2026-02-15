// ═══════════════════════════════════════════════════════════════════
// GALAXY COSMIC HISTORY - Undo/Redo (Ctrl+Z / Ctrl+Y)
// ═══════════════════════════════════════════════════════════════════
'use strict';

const CosmicHistory = (function() {
    const MAX = 20;
    const stack = [];   // snapshots of CosmicState.nodes
    let idx = -1;       // current position in stack

    // Deep-clone nodes + connections
    function snap() {
        return JSON.parse(JSON.stringify({
            nodes: CosmicState.nodes,
            connections: CosmicState.connections
        }));
    }

    function restore(s) {
        CosmicState.nodes = JSON.parse(JSON.stringify(s.nodes));
        CosmicState.connections = JSON.parse(JSON.stringify(s.connections));
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

    // Keyboard shortcuts (only active when Galaxy View is open)
    document.addEventListener('keydown', (e) => {
        if (!CosmicState || !CosmicState.canvas) return;
        const galaxy = document.getElementById('view-galaxy');
        if (!galaxy || !galaxy.classList.contains('active')) return;

        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        } else if (
            ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
            ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')
        ) {
            e.preventDefault();
            redo();
        }
    });

    return { save, undo, redo };
})();

window.CosmicHistory = CosmicHistory;
console.log('📦 galaxy-cosmic-history.js loaded');
