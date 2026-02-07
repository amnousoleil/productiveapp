/**
 * GALAXIE VIEW - 3D Constellation Orchestrator
 * ProductiveApp v5.0
 *
 * Orchestrates Galaxy3D engine + GalaxyAI
 * - Initializes 3D scene on #galaxy-3d-container
 * - Loads/saves data via ApiGalaxy backend
 * - Syncs projects/tasks/notes as 3D spheres
 * - AI constellation generation
 * - Toolbar controls (reset, labels, orbits, auto-rotate, AI)
 * - Auto-save every 30s
 */
const GalaxieView = (function() {
    'use strict';

    let initialized = false;
    let autoSaveTimer = null;
    let lastSavedHash = '';
    const AUTO_SAVE_INTERVAL = 30000;

    function init() {
        if (initialized) return;
        console.log('GalaxieView: init()');
        setupToolbar();
        setupIconListener();
        initialized = true;
        console.log('GalaxieView: initialized (3D mode)');
    }

    function setupIconListener() {
        document.addEventListener('click', function(e) {
            if (e.target.closest('#galaxy-icon')) {
                e.preventDefault();
                e.stopPropagation();
                open();
            }
        });
    }

    function setupToolbar() {
        document.addEventListener('click', function(e) {
            if (e.target.closest('#galaxy-sync-btn')) {
                syncAll();
            }
            if (e.target.closest('#galaxy-save-btn')) {
                saveToBackend();
            }
            if (e.target.closest('#galaxy-reset-view')) {
                if (Galaxy3D) Galaxy3D.resetCamera();
            }
            if (e.target.closest('#galaxy-toggle-labels')) {
                if (Galaxy3D) {
                    var on = Galaxy3D.toggleLabels();
                    e.target.closest('#galaxy-toggle-labels').classList.toggle('active', on);
                }
            }
            if (e.target.closest('#galaxy-toggle-orbits')) {
                if (Galaxy3D) {
                    var on = Galaxy3D.toggleOrbits();
                    e.target.closest('#galaxy-toggle-orbits').classList.toggle('active', on);
                }
            }
            if (e.target.closest('#galaxy-toggle-autorotate')) {
                if (Galaxy3D) {
                    var on = Galaxy3D.toggleAutoRotate();
                    e.target.closest('#galaxy-toggle-autorotate').classList.toggle('active', on);
                }
            }
            if (e.target.closest('#galaxy-ai-btn')) {
                runAIConstellation();
            }
            if (e.target.closest('#galaxy-mindmap-btn')) {
                promptMindMap();
            }
        });

        // Sphere click handler
        document.addEventListener('galaxy-sphere-click', function(e) {
            var detail = e.detail;
            if (detail && detail.sourceId) {
                showSphereDetail(detail);
            }
        });
    }

    function open() {
        console.log('GalaxieView: opening 3D view');
        if (typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate('galaxy');
        } else if (typeof Router !== 'undefined') {
            Router.navigate('galaxy');
        } else {
            document.querySelectorAll('.view-container').forEach(function(v) {
                v.classList.remove('active');
            });
            var el = document.getElementById('view-galaxy');
            if (el) el.classList.add('active');
        }
    }

    function close() {
        console.log('GalaxieView: closing');
        stopAutoSave();
        if (typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate('dashboard');
        } else if (typeof Router !== 'undefined') {
            Router.navigate('dashboard');
        }
    }

    function toggle() {
        var el = document.getElementById('view-galaxy');
        if (el && el.classList.contains('active')) {
            close();
        } else {
            open();
        }
    }

    function isOpened() {
        var el = document.getElementById('view-galaxy');
        return el && el.classList.contains('active');
    }

    /**
     * Refresh: init 3D engine + load data + start auto-save
     */
    async function refresh() {
        setStatus('Initialisation 3D...');

        // Small delay to ensure the view container has rendered with correct dimensions
        await new Promise(function(resolve) { requestAnimationFrame(resolve); });

        // Init Galaxy3D engine
        var container = document.getElementById('galaxy-3d-container');
        if (container && typeof Galaxy3D !== 'undefined') {
            Galaxy3D.init(container);
            // Force resize after a frame to get correct dimensions
            requestAnimationFrame(function() {
                Galaxy3D.onResize();
            });
        }

        setStatus('Chargement...');
        var loaded = await loadFromBackend();

        // Auto-sync projects/tasks if no data was loaded from backend
        if (!loaded && typeof Galaxy3D !== 'undefined') {
            setStatus('Sync automatique...');
            await syncAll();
        }

        startAutoSave();
        setStatus('');
    }

    /**
     * Load scene from backend
     */
    async function loadFromBackend() {
        if (typeof ApiGalaxy === 'undefined' || !ApiGalaxy.isAvailable()) {
            console.log('GalaxieView: ApiGalaxy not available');
            return false;
        }

        try {
            var data = await ApiGalaxy.load();
            if (data.nodes && data.nodes.length > 0 && typeof Galaxy3D !== 'undefined') {
                Galaxy3D.loadData(data.nodes, data.connections || []);
                if (data.appState) {
                    Galaxy3D.restoreAppState(data.appState);
                }
                lastSavedHash = hashData(data);
                console.log('GalaxieView: loaded', data.nodes.length, 'nodes from backend');
                return true;
            }
        } catch (e) {
            console.error('GalaxieView: load error:', e);
        }
        return false;
    }

    /**
     * Save current 3D scene to backend
     */
    async function saveToBackend() {
        if (typeof ApiGalaxy === 'undefined' || !ApiGalaxy.isAvailable()) {
            setStatus('API non disponible');
            return;
        }
        if (typeof Galaxy3D === 'undefined') return;

        setStatus('Sauvegarde...');

        try {
            var sceneData = Galaxy3D.getSceneData();
            var currentHash = hashData(sceneData);

            if (currentHash === lastSavedHash) {
                setStatus('Deja a jour');
                setTimeout(function() { setStatus(''); }, 2000);
                return;
            }

            var success = await ApiGalaxy.save(sceneData.nodes, sceneData.connections, sceneData.appState);
            if (success) {
                lastSavedHash = currentHash;
                setStatus('Sauvegarde OK');
            } else {
                setStatus('Erreur sauvegarde');
            }
        } catch (e) {
            console.error('GalaxieView: save error:', e);
            setStatus('Erreur');
        }

        setTimeout(function() { setStatus(''); }, 3000);
    }

    /**
     * Sync projects + tasks + notes as 3D spheres
     */
    async function syncAll() {
        setStatus('Synchronisation...');

        if (typeof Galaxy3D === 'undefined') {
            setStatus('Moteur 3D non disponible');
            return;
        }

        var nodes = [];
        var conns = [];

        // Projects
        var projects = (typeof AppState !== 'undefined' && AppState.projects) ? AppState.projects : [];
        var tasks = (typeof AppState !== 'undefined' && AppState.tasks) ? AppState.tasks : [];

        projects.forEach(function(project) {
            var projectTasks = tasks.filter(function(t) { return t.projectId === project.id; });
            var doneTasks = projectTasks.filter(function(t) { return t.status === 'done'; });
            var progress = projectTasks.length > 0 ? Math.round(doneTasks.length / projectTasks.length * 100) : 0;

            var priority = 'medium';
            if (project.status === 'archived') priority = 'done';
            else if (progress < 20) priority = 'high';
            else if (progress >= 80) priority = 'done';

            nodes.push({
                id: 'proj_' + project.id,
                type: 'project',
                sourceId: project.id,
                label: project.name || 'Projet',
                priority: priority,
                size: 2.0,
                tags: [],
                metadata: { progress: progress, taskCount: projectTasks.length }
            });

            // Tasks as smaller spheres
            projectTasks.forEach(function(task) {
                var taskPriority = 'medium';
                var pLevel = task.priority?.level || task.priority || 2;
                if (task.status === 'done') taskPriority = 'done';
                else if (pLevel >= 4) taskPriority = 'urgent';
                else if (pLevel >= 3) taskPriority = 'high';
                else if (pLevel <= 1) taskPriority = 'low';

                nodes.push({
                    id: 'task_' + task.id,
                    type: 'task',
                    sourceId: task.id,
                    label: task.text || task.title || 'Tache',
                    priority: taskPriority,
                    size: 0.7,
                    tags: task.tags || [],
                    metadata: { status: task.status, project: project.name }
                });

                // Connect task to its project
                conns.push({
                    id: 'conn_proj_task_' + task.id,
                    from: 'proj_' + project.id,
                    to: 'task_' + task.id,
                    strength: 0.6,
                    reason: 'Projet parent'
                });
            });
        });

        // Notes (from API)
        try {
            if (typeof ApiNotes !== 'undefined') {
                var notesList = await ApiNotes.getAll({ limit: 100 });
                if (notesList && notesList.length > 0) {
                    notesList.forEach(function(note) {
                        var notePriority = note.is_pinned ? 'high' : 'medium';
                        var wordCount = note.content ? note.content.split(/\s+/).length : 0;
                        var noteSize = Math.max(0.6, Math.min(1.8, wordCount / 200));

                        nodes.push({
                            id: 'note_' + note.id,
                            type: 'note',
                            sourceId: note.id,
                            label: note.title || 'Note sans titre',
                            priority: notePriority,
                            size: noteSize,
                            tags: note.tags || [],
                            metadata: { wordCount: wordCount, pinned: note.is_pinned }
                        });
                    });

                    // Link notes to projects with matching tags
                    notesList.forEach(function(note) {
                        if (note.project_id) {
                            conns.push({
                                id: 'conn_proj_note_' + note.id,
                                from: 'proj_' + note.project_id,
                                to: 'note_' + note.id,
                                strength: 0.4,
                                reason: 'Note du projet'
                            });
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('GalaxieView: could not load notes:', e);
        }

        if (nodes.length === 0) {
            setStatus('Aucune donnee a synchroniser');
            setTimeout(function() { setStatus(''); }, 3000);
            return;
        }

        // Load into 3D
        Galaxy3D.loadData(nodes, conns);
        Galaxy3D.applyForceLayout(80);

        setStatus(nodes.length + ' elements synchronises');
        setTimeout(function() { setStatus(''); }, 3000);

        console.log('GalaxieView: synced', nodes.length, 'nodes,', conns.length, 'connections');
    }

    /**
     * Run AI constellation analysis
     */
    async function runAIConstellation() {
        if (typeof GalaxyAI === 'undefined') {
            setStatus('Module IA non disponible');
            return;
        }

        setStatus('IA en cours...');
        var aiBtn = document.getElementById('galaxy-ai-btn');
        if (aiBtn) {
            aiBtn.disabled = true;
            aiBtn.classList.add('loading');
        }

        try {
            // Gather data
            var notes = [];
            var tasks = (typeof AppState !== 'undefined' && AppState.tasks) ? AppState.tasks : [];

            try {
                if (typeof ApiNotes !== 'undefined') {
                    notes = await ApiNotes.getAll({ limit: 50 });
                }
            } catch (e) {
                console.warn('GalaxieView: notes not available for AI');
            }

            var result = await GalaxyAI.generateConstellation(notes, tasks);

            if (result && result.nodes && result.nodes.length > 0) {
                Galaxy3D.loadData(result.nodes, result.connections || []);
                Galaxy3D.applyForceLayout(100);
                setStatus('Constellation IA generee (' + result.nodes.length + ' elements)');
            } else {
                setStatus('Pas de resultats IA');
            }
        } catch (e) {
            console.error('GalaxieView: AI error:', e);
            setStatus('Erreur IA');
        } finally {
            if (aiBtn) {
                aiBtn.disabled = false;
                aiBtn.classList.remove('loading');
            }
            setTimeout(function() { setStatus(''); }, 4000);
        }
    }

    /**
     * Prompt user for mind map topic
     */
    function promptMindMap() {
        var topic = prompt('Sujet de la Mind Map :');
        if (!topic || !topic.trim()) return;
        generateMindMap(topic.trim());
    }

    async function generateMindMap(topic) {
        if (typeof GalaxyAI === 'undefined') {
            setStatus('Module IA non disponible');
            return;
        }

        setStatus('Generation mind map...');

        try {
            var result = await GalaxyAI.generateMindMap(topic);
            if (result && result.nodes && result.nodes.length > 0) {
                Galaxy3D.loadData(result.nodes, result.connections || []);
                Galaxy3D.applyForceLayout(80);
                setStatus('Mind map: ' + result.nodes.length + ' noeuds');
            } else {
                setStatus('Mind map vide');
            }
        } catch (e) {
            console.error('GalaxieView: mind map error:', e);
            setStatus('Erreur mind map');
        }

        setTimeout(function() { setStatus(''); }, 4000);
    }

    /**
     * Show detail panel for a clicked sphere
     */
    function showSphereDetail(data) {
        console.log('GalaxieView: sphere clicked:', data);
        // Could open a side panel or navigate to the note/task
        // For now, show a toast notification
        if (typeof ToastManager !== 'undefined') {
            ToastManager.show(data.label + ' (' + (data.type || 'element') + ')', 'info');
        }
    }

    // === HELPERS ===
    function hashData(data) {
        try {
            var nodes = data.nodes || [];
            var conns = data.connections || [];
            return nodes.length + '_' + conns.length + '_' + JSON.stringify(nodes).length;
        } catch (e) {
            return '';
        }
    }

    function setStatus(text) {
        var el = document.getElementById('galaxy-status');
        if (el) el.textContent = text;
    }

    function startAutoSave() {
        stopAutoSave();
        autoSaveTimer = setInterval(function() {
            if (isOpened() && typeof Galaxy3D !== 'undefined' && Galaxy3D.spheres.length > 0) {
                saveToBackend();
            }
        }, AUTO_SAVE_INTERVAL);
    }

    function stopAutoSave() {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
            autoSaveTimer = null;
        }
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

    return {
        init: init,
        open: open,
        close: close,
        toggle: toggle,
        isOpened: isOpened,
        refresh: refresh,
        syncAll: syncAll,
        syncProjects: syncAll, // backward compat
        saveToBackend: saveToBackend,
        runAIConstellation: runAIConstellation,
        generateMindMap: generateMindMap
    };
})();

window.GalaxieView = GalaxieView;
window.openGalaxieView = function() { GalaxieView.open(); };
window.closeGalaxieView = function() { GalaxieView.close(); };
window.initGalaxieView = function() { GalaxieView.init(); };

console.log('galaxie-view.js loaded (3D orchestrator)');
