// ═══════════════════════════════════════════════════════════════════
// GALAXY COSMIC PERSISTENCE v1.0
// Couche de persistance pour les projets Galaxy Cosmic
// Sérialise/désérialise CosmicState vers le backend canvases API
// ═══════════════════════════════════════════════════════════════════
'use strict';

const CosmicPersistence = (function () {

    const SCHEMA_VERSION = 1;
    const LAST_PROJECT_KEY = 'cosmicLastProjectId';
    const DEBOUNCE_MS = 1200;

    let currentProjectId = null;
    let currentProjectName = null;
    let isSaving = false;
    let isDirty = false;

    let _saveTimer = null;
    const _listeners = [];

    // ───────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────

    function _getWorkspaceId() {
        return (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId)
            ? ApiTokens.getWorkspaceId()
            : null;
    }

    function _isAvailable() {
        return typeof ApiGalaxy !== 'undefined' && ApiGalaxy.isAvailable();
    }

    // ───────────────────────────────────────────────
    // EVENT SYSTEM
    // ───────────────────────────────────────────────

    function onStatusChange(fn) {
        if (typeof fn === 'function') _listeners.push(fn);
    }

    function _emitStatus(status) {
        const detail = {
            projectId: currentProjectId,
            projectName: currentProjectName,
            isDirty: isDirty
        };
        for (const fn of _listeners) {
            try { fn(status, detail); } catch (e) { console.error('CosmicPersistence listener error:', e); }
        }
    }

    // ───────────────────────────────────────────────
    // SERIALIZE / DESERIALIZE
    // ───────────────────────────────────────────────

    function serializeState() {
        const nodes = CosmicState.nodes.map(function (n) {
            var obj = {
                id: n.id,
                x: n.x,
                y: n.y,
                text: n.text || '',
                color: n.color || '#60a5fa',
                shape: n.shape || 'circle',
                width: n.width,
                height: n.height,
                radius: n.radius,
                fontSize: n.fontSize,
                rotation: n.rotation,
                locked: !!n.locked,
                metadata: n.metadata || {}
            };
            // Text node properties
            if (n.textColor) obj.textColor = n.textColor;
            if (n.opacity != null && n.opacity !== 1) obj.opacity = n.opacity;
            if (n.isTextNode) {
                obj.isTextNode = true;
                obj.textBoxWidth = n.textBoxWidth || 0;
                obj.textBoxHeight = n.textBoxHeight || 0;
            }
            if (n.type && n.type !== 'shape') obj.type = n.type;
            return obj;
        });

        const connections = CosmicState.connections.map(function (c) {
            return {
                id: c.id,
                from: c.fromId,
                to: c.toId,
                color: c.color,
                label: c.label
            };
        });

        const strokes = (CosmicState.strokes || []).map(function (s) {
            return {
                id: s.id,
                points: s.points,
                color: s.color,
                width: s.width
            };
        });

        return {
            version: SCHEMA_VERSION,
            timestamp: Date.now(),
            nodes: nodes,
            connections: connections,
            strokes: strokes,
            camera: {
                x: CosmicState.camera.x,
                y: CosmicState.camera.y,
                zoom: CosmicState.camera.zoom
            },
            prefs: Object.assign({}, CosmicState.prefs)
        };
    }

    function deserializeState(data) {
        if (!data) return;

        CosmicState.nodes = (data.nodes || []).map(function (n) {
            var node = {
                id: n.id,
                type: n.type || 'shape',
                shape: n.shape || 'circle',
                x: parseFloat(n.x) || 0,
                y: parseFloat(n.y) || 0,
                text: n.text || '',
                color: n.color || '#60a5fa',
                width: n.width,
                height: n.height,
                radius: n.radius || 60,
                fontSize: n.fontSize,
                rotation: n.rotation,
                locked: !!n.locked,
                metadata: n.metadata || {},
                createdAt: n.createdAt || Date.now(),
                breathing: true,
                glowIntensity: 0
            };
            // Restore text node properties
            if (n.textColor) node.textColor = n.textColor;
            if (n.opacity != null) node.opacity = n.opacity;
            if (n.isTextNode) {
                node.isTextNode = true;
                node.textBoxWidth = n.textBoxWidth || 0;
                node.textBoxHeight = n.textBoxHeight || 0;
            }
            return node;
        });

        CosmicState.connections = (data.connections || []).map(function (c) {
            return {
                id: c.id,
                fromId: c.from,
                toId: c.to,
                color: c.color,
                label: c.label
            };
        });

        CosmicState.strokes = (data.strokes || []).map(function (s) {
            return {
                id: s.id,
                points: s.points || [],
                color: s.color || '#60a5fa',
                width: s.width || 4
            };
        });

        if (data.camera) {
            CosmicState.camera.x = data.camera.x || 0;
            CosmicState.camera.y = data.camera.y || 0;
            CosmicState.camera.zoom = data.camera.zoom || 1;
            CosmicState.camera.targetZoom = data.camera.zoom || 1;
        }

        if (data.prefs) {
            Object.assign(CosmicState.prefs, data.prefs);
        }

        CosmicState.selectedNodes = new Set();
    }

    // ───────────────────────────────────────────────
    // VALIDATE
    // ───────────────────────────────────────────────

    function validateState(data) {
        if (!data || !Array.isArray(data.nodes)) {
            return { valid: false, error: 'Missing or invalid nodes array' };
        }

        for (var i = 0; i < data.nodes.length; i++) {
            var n = data.nodes[i];
            if (!n.id || n.x === undefined || n.y === undefined) {
                return { valid: false, error: 'Node ' + i + ' missing id, x, or y' };
            }
        }

        if (data.connections && data.connections.length > 0) {
            var nodeIds = new Set(data.nodes.map(function (n) { return n.id; }));
            for (var j = 0; j < data.connections.length; j++) {
                var c = data.connections[j];
                if (!nodeIds.has(c.from)) {
                    return { valid: false, error: 'Connection ' + j + ' references unknown from-node: ' + c.from };
                }
                if (!nodeIds.has(c.to)) {
                    return { valid: false, error: 'Connection ' + j + ' references unknown to-node: ' + c.to };
                }
            }
        }

        return { valid: true, error: null };
    }

    // ───────────────────────────────────────────────
    // DEBOUNCED SAVE
    // ───────────────────────────────────────────────

    function debouncedSave() {
        isDirty = true;
        _emitStatus('modified');
        if (_saveTimer) clearTimeout(_saveTimer);
        _saveTimer = setTimeout(function () {
            save();
        }, DEBOUNCE_MS);
    }

    // ───────────────────────────────────────────────
    // SAVE
    // ───────────────────────────────────────────────

    async function save() {
        if (!currentProjectId) {
            console.warn('CosmicPersistence.save(): no project loaded');
            return false;
        }
        if (isSaving) {
            // Re-schedule if dirty
            isDirty = true;
            return false;
        }

        isSaving = true;
        _emitStatus('saving');

        var serialized = serializeState();
        var validation = validateState(serialized);
        if (!validation.valid) {
            console.error('CosmicPersistence.save(): validation failed -', validation.error);
            isSaving = false;
            _emitStatus('error');
            return false;
        }

        try {
            var response = await Api.put('/canvases/' + currentProjectId, {
                elements: {
                    nodes: serialized.nodes,
                    connections: serialized.connections,
                    strokes: serialized.strokes
                },
                app_state: {
                    version: serialized.version,
                    camera: serialized.camera,
                    prefs: serialized.prefs,
                    timestamp: serialized.timestamp
                }
            });

            isSaving = false;

            if (response.success) {
                isDirty = false;
                _emitStatus('saved');
                console.log('CosmicPersistence: saved', serialized.nodes.length, 'nodes,',
                    serialized.connections.length, 'connections,',
                    serialized.strokes.length, 'strokes');
                return true;
            }

            console.error('CosmicPersistence.save(): API error', response.error);
            _emitStatus('error');
            return false;
        } catch (e) {
            isSaving = false;
            console.error('CosmicPersistence.save(): exception', e);
            _emitStatus('error');
            return false;
        }
    }

    // ───────────────────────────────────────────────
    // LOAD
    // ───────────────────────────────────────────────

    async function load(canvasId) {
        if (!canvasId) return false;
        _emitStatus('loading');

        try {
            var response = await Api.get('/canvases/' + canvasId);
            console.log('CosmicPersistence.load() raw response:', JSON.stringify(response).substring(0, 500));

            if (!response.success || !response.data) {
                console.error('CosmicPersistence.load(): no data in response');
                _emitStatus('error');
                return false;
            }

            // Handle both response shapes: { data: { canvas: {...} } } and { data: {...} }
            var canvas = response.data.canvas || response.data;
            if (!canvas || !canvas.id) {
                console.error('CosmicPersistence.load(): no canvas object found');
                _emitStatus('error');
                return false;
            }

            var elements = canvas.elements || {};
            if (typeof elements === 'string') {
                try {
                    elements = JSON.parse(elements);
                } catch (e) {
                    console.error('❌ Failed to parse elements JSON:', e);
                    elements = {};
                }
            }

            var appState = canvas.app_state || canvas.appState || {};
            if (typeof appState === 'string') {
                try {
                    appState = JSON.parse(appState);
                } catch (e) {
                    console.error('❌ Failed to parse app_state JSON:', e);
                    appState = {};
                }
            }

            console.log('CosmicPersistence.load() elements keys:', Object.keys(elements),
                'nodes:', (elements.nodes || []).length,
                'connections:', (elements.connections || []).length,
                'strokes:', (elements.strokes || []).length);

            var data = {
                nodes: elements.nodes || [],
                connections: elements.connections || [],
                strokes: elements.strokes || [],
                camera: appState.camera || {},
                prefs: appState.prefs || {}
            };

            deserializeState(data);

            currentProjectId = canvas.id;
            currentProjectName = canvas.name || 'Sans nom';
            isDirty = false;

            try { localStorage.setItem(LAST_PROJECT_KEY, currentProjectId); } catch (_) {}

            _emitStatus('loaded');
            console.log('CosmicPersistence: loaded "' + currentProjectName + '" -',
                CosmicState.nodes.length, 'nodes');
            return true;
        } catch (e) {
            console.error('CosmicPersistence.load(): exception', e);
            _emitStatus('error');
            return false;
        }
    }

    // ───────────────────────────────────────────────
    // LIST PROJECTS
    // ───────────────────────────────────────────────

    async function listProjects() {
        var workspaceId = _getWorkspaceId();
        if (!workspaceId) return [];

        try {
            var response = await Api.get('/canvases/workspace/' + workspaceId + '?limit=100');
            if (!response.success || !response.data) return [];

            var canvases = response.data.items || response.data;
            if (!Array.isArray(canvases)) return [];

            var list = canvases.map(function (c) {
                var elems = c.elements || {};
                return {
                    id: c.id,
                    name: c.name || 'Sans nom',
                    updatedAt: c.updated_at || c.updatedAt || c.created_at || c.createdAt,
                    createdAt: c.created_at || c.createdAt,
                    nodeCount: (elems.nodes || []).length
                };
            });

            list.sort(function (a, b) {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });

            return list;
        } catch (e) {
            console.error('CosmicPersistence.listProjects():', e);
            return [];
        }
    }

    // ───────────────────────────────────────────────
    // CREATE PROJECT
    // ───────────────────────────────────────────────

    async function createProject(name) {
        var workspaceId = _getWorkspaceId();
        if (!workspaceId) return null;

        try {
            var response = await Api.post('/canvases/workspace/' + workspaceId, {
                name: name || 'Nouveau projet',
                elements: { nodes: [], connections: [], strokes: [] },
                app_state: {
                    version: SCHEMA_VERSION,
                    camera: { x: 0, y: 0, zoom: 1 },
                    prefs: {},
                    timestamp: Date.now()
                },
                is_public: false,
                is_template: false
            });

            if (response.success && response.data && response.data.canvas) {
                var canvas = response.data.canvas;
                console.log('CosmicPersistence: created project "' + name + '" id=' + canvas.id);
                return { id: canvas.id, name: canvas.name || name };
            }

            console.error('CosmicPersistence.createProject(): failed', response.error);
            return null;
        } catch (e) {
            console.error('CosmicPersistence.createProject():', e);
            return null;
        }
    }

    // ───────────────────────────────────────────────
    // DELETE PROJECT
    // ───────────────────────────────────────────────

    async function deleteProject(canvasId) {
        if (!canvasId) return false;

        try {
            var response = await Api.delete('/canvases/' + canvasId);
            if (response.success) {
                // Clean up if it was the current project
                if (currentProjectId === canvasId) {
                    currentProjectId = null;
                    currentProjectName = null;
                    isDirty = false;
                    try { localStorage.removeItem(LAST_PROJECT_KEY); } catch (_) {}
                }
                console.log('CosmicPersistence: deleted canvas', canvasId);
                return true;
            }
            console.error('CosmicPersistence.deleteProject(): failed', response.error);
            return false;
        } catch (e) {
            console.error('CosmicPersistence.deleteProject():', e);
            return false;
        }
    }

    // ───────────────────────────────────────────────
    // RENAME PROJECT
    // ───────────────────────────────────────────────

    async function renameProject(canvasId, newName) {
        if (!canvasId || !newName) return false;

        try {
            var response = await Api.put('/canvases/' + canvasId, { name: newName });
            if (response.success) {
                if (currentProjectId === canvasId) {
                    currentProjectName = newName;
                    _emitStatus('saved');
                }
                console.log('CosmicPersistence: renamed', canvasId, '→', newName);
                return true;
            }
            return false;
        } catch (e) {
            console.error('CosmicPersistence.renameProject():', e);
            return false;
        }
    }

    // ───────────────────────────────────────────────
    // INIT
    // ───────────────────────────────────────────────

    async function init() {
        if (!_isAvailable()) {
            console.warn('CosmicPersistence.init(): API not available');
            return { action: 'offline', projectId: null, name: null };
        }

        // 1. Try last project from localStorage
        var lastId = null;
        try { lastId = localStorage.getItem(LAST_PROJECT_KEY); } catch (_) {}

        if (lastId) {
            var loaded = await load(lastId);
            if (loaded) {
                return { action: 'loaded', projectId: currentProjectId, name: currentProjectName };
            }
        }

        // 2. Try first project from list
        var projects = await listProjects();
        if (projects.length > 0) {
            var loaded2 = await load(projects[0].id);
            if (loaded2) {
                return { action: 'loaded', projectId: currentProjectId, name: currentProjectName };
            }
        }

        // 3. Create default project
        var created = await createProject('Galaxy View');
        if (created) {
            await load(created.id);
            return { action: 'created', projectId: currentProjectId, name: currentProjectName };
        }

        return { action: 'offline', projectId: null, name: null };
    }

    // ───────────────────────────────────────────────
    // PUBLIC API
    // ───────────────────────────────────────────────

    return {
        init: init,
        save: save,
        load: load,
        debouncedSave: debouncedSave,
        listProjects: listProjects,
        createProject: createProject,
        deleteProject: deleteProject,
        renameProject: renameProject,
        serializeState: serializeState,
        validateState: validateState,
        onStatusChange: onStatusChange,

        get currentProjectId() { return currentProjectId; },
        get currentProjectName() { return currentProjectName; },
        get isDirty() { return isDirty; }
    };

})();

window.CosmicPersistence = CosmicPersistence;
console.log('CosmicPersistence loaded');
