/**
 * GALAXIE VIEW - Integration module for Excalidraw
 * ProductiveApp v4.0
 *
 * Features:
 * - Excalidraw iframe bridge (same-origin localStorage)
 * - Auto-sync projects/tasks as Excalidraw elements
 * - Save/load via ApiGalaxy backend
 * - Toolbar controls
 */
const GalaxieView = (function() {
    'use strict';

    let initialized = false;
    let autoSaveTimer = null;
    let lastSavedHash = '';
    const EXCALIDRAW_LS_KEY = 'excalidraw';
    const EXCALIDRAW_STATE_KEY = 'excalidraw-state';
    const AUTO_SAVE_INTERVAL = 30000; // 30s

    function init() {
        if (initialized) return;
        console.log('🌌 Galaxie View: init()');
        setupIconListener();
        setupToolbar();
        initialized = true;
        console.log('🌌 Galaxie View initialized');
    }

    function setupIconListener() {
        document.addEventListener('click', function(e) {
            var target = e.target.closest('#galaxy-icon');
            if (target) {
                e.preventDefault();
                e.stopPropagation();
                open();
            }
        });
    }

    function setupToolbar() {
        document.addEventListener('click', function(e) {
            if (e.target.closest('#galaxy-sync-btn')) {
                syncProjects();
            }
            if (e.target.closest('#galaxy-save-btn')) {
                saveToBackend();
            }
        });
    }

    function open() {
        console.log('🌌 GalaxieView.open() -> navigating to galaxy view');
        if (typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate('galaxy');
        } else if (typeof Router !== 'undefined') {
            Router.navigate('galaxy');
        } else {
            document.querySelectorAll('.view-container').forEach(function(v) {
                v.classList.remove('active');
            });
            var galaxyView = document.getElementById('view-galaxy');
            if (galaxyView) {
                galaxyView.classList.add('active');
            }
        }
    }

    function close() {
        console.log('🌌 GalaxieView.close() -> navigating away from galaxy');
        stopAutoSave();
        if (typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate('dashboard');
        } else if (typeof Router !== 'undefined') {
            Router.navigate('dashboard');
        }
    }

    function toggle() {
        var galaxyView = document.getElementById('view-galaxy');
        if (galaxyView && galaxyView.classList.contains('active')) {
            close();
        } else {
            open();
        }
    }

    function isOpened() {
        var galaxyView = document.getElementById('view-galaxy');
        return galaxyView && galaxyView.classList.contains('active');
    }

    /**
     * Refresh: load from backend + start auto-save
     */
    async function refresh() {
        setStatus('Chargement...');
        await loadFromBackend();
        startAutoSave();
        setStatus('');
    }

    /**
     * Load Excalidraw scene from ApiGalaxy backend
     */
    async function loadFromBackend() {
        if (typeof ApiGalaxy === 'undefined' || !ApiGalaxy.isAvailable()) {
            console.log('🌌 ApiGalaxy not available, using localStorage only');
            return;
        }

        try {
            var data = await ApiGalaxy.load();
            if (data.nodes && data.nodes.length > 0) {
                // data.nodes contains Excalidraw elements format
                localStorage.setItem(EXCALIDRAW_LS_KEY, JSON.stringify(data.nodes));
                if (data.appState && Object.keys(data.appState).length > 0) {
                    localStorage.setItem(EXCALIDRAW_STATE_KEY, JSON.stringify(data.appState));
                }
                lastSavedHash = hashElements(data.nodes);
                reloadIframe();
                console.log('🌌 Loaded', data.nodes.length, 'elements from backend');
            }
        } catch (e) {
            console.error('🌌 Error loading from backend:', e);
        }
    }

    /**
     * Save current Excalidraw scene to ApiGalaxy backend
     */
    async function saveToBackend() {
        if (typeof ApiGalaxy === 'undefined' || !ApiGalaxy.isAvailable()) {
            setStatus('API non disponible');
            return;
        }

        setStatus('Sauvegarde...');

        try {
            var elements = getExcalidrawElements();
            var appState = getExcalidrawAppState();
            var currentHash = hashElements(elements);

            if (currentHash === lastSavedHash) {
                setStatus('Deja a jour');
                setTimeout(function() { setStatus(''); }, 2000);
                return;
            }

            var success = await ApiGalaxy.save(elements, [], appState);
            if (success) {
                lastSavedHash = currentHash;
                setStatus('Sauvegarde OK');
            } else {
                setStatus('Erreur sauvegarde');
            }
        } catch (e) {
            console.error('🌌 Error saving:', e);
            setStatus('Erreur');
        }

        setTimeout(function() { setStatus(''); }, 3000);
    }

    /**
     * Sync projects/tasks from AppState as Excalidraw elements
     */
    function syncProjects() {
        if (typeof AppState === 'undefined') {
            setStatus('AppState non disponible');
            return;
        }

        setStatus('Synchronisation...');

        var projects = AppState.projects || [];
        var tasks = AppState.tasks || [];
        var existingElements = getExcalidrawElements();

        // Track which project IDs already have elements
        var existingProjectIds = new Set();
        existingElements.forEach(function(el) {
            if (el.customData && el.customData.projectId && el.customData.type === 'project') {
                existingProjectIds.add(el.customData.projectId);
            }
        });

        var newElements = [];
        var centerX = 400;
        var centerY = 300;
        var radius = 250;

        // Filter projects that don't already exist on canvas
        var projectsToAdd = projects.filter(function(p) {
            return !existingProjectIds.has(p.id);
        });

        if (projectsToAdd.length === 0 && existingElements.length > 0) {
            setStatus('Projets deja synchronises');
            setTimeout(function() { setStatus(''); }, 2000);
            return;
        }

        var allProjectsCount = projects.length;
        var startIndex = existingProjectIds.size;

        projectsToAdd.forEach(function(project, i) {
            var globalIdx = startIndex + i;
            var angle = (globalIdx / Math.max(allProjectsCount, 1)) * 2 * Math.PI - Math.PI / 2;
            var x = centerX + radius * Math.cos(angle);
            var y = centerY + radius * Math.sin(angle);

            // Calculate progress
            var projectTasks = tasks.filter(function(t) { return t.projectId === project.id; });
            var doneTasks = projectTasks.filter(function(t) { return t.status === 'done'; });
            var progress = projectTasks.length > 0 ? Math.round(doneTasks.length / projectTasks.length * 100) : 0;

            var bgColor = getProjectColor(project, progress);
            var ellipseId = 'galaxy_proj_' + project.id;

            // Create ellipse (planet) for the project
            newElements.push({
                id: ellipseId,
                type: 'ellipse',
                x: x - 60,
                y: y - 40,
                width: 120,
                height: 80,
                angle: 0,
                strokeColor: bgColor,
                backgroundColor: bgColor,
                fillStyle: 'solid',
                strokeWidth: 2,
                roughness: 1,
                opacity: 90,
                groupIds: [],
                roundness: null,
                seed: Math.floor(Math.random() * 2000000000),
                version: 1,
                versionNonce: Math.floor(Math.random() * 2000000000),
                isDeleted: false,
                boundElements: [{ id: ellipseId + '_text', type: 'text' }],
                updated: Date.now(),
                link: null,
                locked: false,
                customData: { projectId: project.id, type: 'project' }
            });

            // Create text label bound to the ellipse
            var projectName = project.name || 'Projet';
            if (projectName.length > 14) projectName = projectName.substring(0, 12) + '..';
            var label = projectName + '\n' + progress + '%';

            newElements.push({
                id: ellipseId + '_text',
                type: 'text',
                x: x - 50,
                y: y - 18,
                width: 100,
                height: 36,
                angle: 0,
                strokeColor: '#ffffff',
                backgroundColor: 'transparent',
                fillStyle: 'solid',
                strokeWidth: 1,
                roughness: 0,
                opacity: 100,
                groupIds: [],
                roundness: null,
                seed: Math.floor(Math.random() * 2000000000),
                version: 1,
                versionNonce: Math.floor(Math.random() * 2000000000),
                isDeleted: false,
                boundElements: null,
                updated: Date.now(),
                link: null,
                locked: false,
                text: label,
                fontSize: 14,
                fontFamily: 1,
                textAlign: 'center',
                verticalAlign: 'middle',
                containerId: ellipseId,
                originalText: label,
                autoResize: true
            });

            // Add small task dots around the project planet
            projectTasks.slice(0, 6).forEach(function(task, ti) {
                var taskAngle = (ti / Math.min(projectTasks.length, 6)) * 2 * Math.PI;
                var taskRadius = 55;
                var tx = x + taskRadius * Math.cos(taskAngle);
                var ty = y + taskRadius * Math.sin(taskAngle);
                var taskColor = task.status === 'done' ? '#10b981' : task.status === 'inprogress' ? '#f59e0b' : '#6b7280';

                newElements.push({
                    id: 'galaxy_task_' + task.id,
                    type: 'ellipse',
                    x: tx - 6,
                    y: ty - 6,
                    width: 12,
                    height: 12,
                    angle: 0,
                    strokeColor: taskColor,
                    backgroundColor: taskColor,
                    fillStyle: 'solid',
                    strokeWidth: 1,
                    roughness: 0,
                    opacity: 70,
                    groupIds: [],
                    roundness: null,
                    seed: Math.floor(Math.random() * 2000000000),
                    version: 1,
                    versionNonce: Math.floor(Math.random() * 2000000000),
                    isDeleted: false,
                    boundElements: null,
                    updated: Date.now(),
                    link: null,
                    locked: false,
                    customData: { taskId: task.id, projectId: project.id, type: 'task' }
                });
            });
        });

        if (newElements.length > 0) {
            var allElements = existingElements.concat(newElements);
            localStorage.setItem(EXCALIDRAW_LS_KEY, JSON.stringify(allElements));
            reloadIframe();
            console.log('🌌 Synced', projectsToAdd.length, 'projects as', newElements.length, 'elements');
            setStatus(projectsToAdd.length + ' projets synchronises');
        } else {
            setStatus('Aucun nouveau projet');
        }

        setTimeout(function() { setStatus(''); }, 3000);
    }

    function getProjectColor(project, progress) {
        if (project.status === 'archived') return '#6b7280';
        if (progress >= 80) return '#10b981';
        if (progress >= 50) return '#3b82f6';
        if (progress >= 20) return '#f59e0b';
        return '#E07840';
    }

    // ========== Helpers ==========

    function getExcalidrawElements() {
        try {
            var raw = localStorage.getItem(EXCALIDRAW_LS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function getExcalidrawAppState() {
        try {
            var raw = localStorage.getItem(EXCALIDRAW_STATE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function reloadIframe() {
        var iframe = document.getElementById('galaxy-iframe');
        if (iframe) {
            iframe.src = '/galaxy/index.html';
        }
    }

    function hashElements(elements) {
        try {
            return JSON.stringify(elements).length + '_' + (elements.length || 0);
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
            if (isOpened()) {
                var elements = getExcalidrawElements();
                var currentHash = hashElements(elements);
                if (currentHash !== lastSavedHash && elements.length > 0) {
                    saveToBackend();
                }
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
        syncProjects: syncProjects,
        saveToBackend: saveToBackend
    };
})();

window.GalaxieView = GalaxieView;
window.openGalaxieView = function() { GalaxieView.open(); };
window.closeGalaxieView = function() { GalaxieView.close(); };
window.initGalaxieView = function() { GalaxieView.init(); };

console.log('📦 galaxie-view.js loaded');
