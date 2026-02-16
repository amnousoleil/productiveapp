// ═══════════════════════════════════════════════════════════════════
// GALAXY COSMIC PROJECTS UI v1.0
// Panneau de gestion des projets Galaxy + status indicator
// ═══════════════════════════════════════════════════════════════════
'use strict';

const CosmicProjectsUI = (function () {

    let _overlay = null;
    let _panel = null;
    let _isOpen = false;

    // ───────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────

    function _formatRelativeDate(dateStr) {
        if (!dateStr) return '';
        var date = new Date(dateStr);
        var now = Date.now();
        var diff = now - date.getTime();
        if (diff < 0) diff = 0;
        var mins = Math.floor(diff / 60000);
        var hours = Math.floor(diff / 3600000);
        var days = Math.floor(diff / 86400000);

        if (mins < 1) return '\u00e0 l\u2019instant';
        if (mins < 60) return 'il y a ' + mins + ' min';
        if (hours < 24) return 'il y a ' + hours + ' h';
        if (days < 7) return 'il y a ' + days + ' j';
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function _clearCosmicState() {
        CosmicState.nodes = [];
        CosmicState.connections = [];
        CosmicState.strokes = [];
        CosmicState.selectedNodes = new Set();
        CosmicState.camera.x = 0;
        CosmicState.camera.y = 0;
        CosmicState.camera.zoom = 1;
        CosmicState.camera.targetZoom = 1;
    }

    // ───────────────────────────────────────────────
    // TOOLBAR BUTTONS
    // ───────────────────────────────────────────────

    function init() {
        // Save button
        var saveBtn = document.getElementById('galaxy-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                if (!CosmicPersistence.currentProjectId) return;
                var original = saveBtn.textContent;
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;
                CosmicPersistence.save().then(function (ok) {
                    saveBtn.textContent = ok ? 'Saved !' : 'Erreur';
                    setTimeout(function () {
                        saveBtn.textContent = original;
                        saveBtn.disabled = false;
                    }, 1200);
                });
            });
        }

        // Sync button
        var syncBtn = document.getElementById('galaxy-sync-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', function () {
                var pid = CosmicPersistence.currentProjectId;
                if (!pid) return;
                var original = syncBtn.textContent;
                syncBtn.textContent = 'Syncing...';
                syncBtn.disabled = true;
                CosmicPersistence.load(pid).then(function () {
                    syncBtn.textContent = 'Synced !';
                    if (window.CosmicHistory) window.CosmicHistory.save();
                    setTimeout(function () {
                        syncBtn.textContent = original;
                        syncBtn.disabled = false;
                    }, 1200);
                });
            });
        }

        // Projects button (filter-projects) — capture mode to fire before legacy handlers
        var projBtn = document.getElementById('filter-projects');
        if (projBtn) {
            projBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                setTimeout(function() { CosmicProjectsUI.toggle(); }, 50);
                return false;
            }, true);
        }

        // Escape to close
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && _isOpen) close();
        });

        // Status indicator in toolbar
        _setupStatusIndicator();

        console.log('CosmicProjectsUI initialized');
    }

    // ───────────────────────────────────────────────
    // STATUS INDICATOR
    // ───────────────────────────────────────────────

    function _setupStatusIndicator() {
        var toolbar = document.getElementById('galaxy-toolbar');
        if (!toolbar) return;

        // Don't create duplicates
        if (toolbar.querySelector('.cosmic-project-indicator')) return;

        var wrapper = document.createElement('div');
        wrapper.className = 'cosmic-project-indicator';
        wrapper.innerHTML =
            '<span class="cosmic-status-dot" data-status="saved"></span>' +
            '<span class="cosmic-project-name"></span>';

        // Insert after the title
        var title = toolbar.querySelector('.galaxy-toolbar-title');
        if (title && title.nextSibling) {
            toolbar.insertBefore(wrapper, title.nextSibling);
        } else {
            toolbar.prepend(wrapper);
        }

        CosmicPersistence.onStatusChange(function (status, detail) {
            var dot = wrapper.querySelector('.cosmic-status-dot');
            var nameEl = wrapper.querySelector('.cosmic-project-name');
            if (dot) dot.dataset.status = status;
            if (nameEl) nameEl.textContent = detail.projectName || '';
        });
    }

    // ───────────────────────────────────────────────
    // PANEL OPEN / CLOSE / TOGGLE
    // ───────────────────────────────────────────────

    function toggle() {
        if (_isOpen) close();
        else open();
    }

    async function open() {
        if (_isOpen) return;
        _isOpen = true;
        _createOverlay();
        if (!_overlay) { _isOpen = false; return; }
        await _renderProjectList();
        if (_overlay) _overlay.classList.add('visible');
    }

    function close() {
        if (!_isOpen) return;
        _isOpen = false;
        if (_overlay) {
            _overlay.classList.add('closing');
            setTimeout(function () {
                if (_overlay && _overlay.parentNode) {
                    _overlay.parentNode.removeChild(_overlay);
                }
                _overlay = null;
                _panel = null;
            }, 250);
        }
    }

    // ───────────────────────────────────────────────
    // PANEL DOM
    // ───────────────────────────────────────────────

    function _createOverlay() {
        // Remove previous if any
        if (_overlay && _overlay.parentNode) {
            _overlay.parentNode.removeChild(_overlay);
        }

        _overlay = document.createElement('div');
        _overlay.className = 'cosmic-projects-overlay';

        _panel = document.createElement('div');
        _panel.className = 'cosmic-projects-panel';

        _panel.innerHTML =
            '<div class="cpp-header">' +
                '<h3 class="cpp-title">Projets Galaxy</h3>' +
                '<button class="cpp-close" title="Fermer">&times;</button>' +
            '</div>' +
            '<button class="cpp-new-btn">+ Nouveau projet</button>' +
            '<div class="cpp-list"></div>';

        _overlay.appendChild(_panel);
        document.body.appendChild(_overlay);

        // Close on overlay click (outside panel)
        _overlay.addEventListener('click', function (e) {
            if (e.target === _overlay) close();
        });

        // Close button
        _panel.querySelector('.cpp-close').addEventListener('click', close);

        // New project button
        _panel.querySelector('.cpp-new-btn').addEventListener('click', function () {
            _handleCreate();
        });
    }

    async function _renderProjectList() {
        if (!_panel) return;
        var listEl = _panel.querySelector('.cpp-list');
        if (!listEl) return;

        listEl.innerHTML = '<div class="cpp-loading">Chargement...</div>';

        var projects = await CosmicPersistence.listProjects();
        var currentId = CosmicPersistence.currentProjectId;

        if (projects.length === 0) {
            listEl.innerHTML = '<div class="cpp-empty">Aucun projet</div>';
            return;
        }

        var html = '';
        for (var i = 0; i < projects.length; i++) {
            var p = projects[i];
            var isCurrent = (p.id === currentId);
            html +=
                '<div class="cpp-item' + (isCurrent ? ' current' : '') + '" data-id="' + p.id + '">' +
                    '<div class="cpp-item-info">' +
                        '<span class="cpp-item-name">' + _escapeHtml(p.name) + '</span>' +
                        '<span class="cpp-item-meta">' + _formatRelativeDate(p.updatedAt) +
                            (p.nodeCount > 0 ? ' \u00b7 ' + p.nodeCount + ' formes' : '') +
                        '</span>' +
                    '</div>' +
                    '<div class="cpp-item-actions">' +
                        (isCurrent
                            ? '<span class="cpp-badge-active">Actif</span>'
                            : '<button class="cpp-btn-open" data-id="' + p.id + '">Ouvrir</button>'
                        ) +
                        '<button class="cpp-btn-rename" data-id="' + p.id + '" data-name="' + _escapeAttr(p.name) + '" title="Renommer">\u270e</button>' +
                        '<button class="cpp-btn-delete" data-id="' + p.id + '" data-current="' + isCurrent + '" title="Supprimer">\ud83d\uddd1</button>' +
                    '</div>' +
                '</div>';
        }

        listEl.innerHTML = html;

        // Bind events
        listEl.querySelectorAll('.cpp-btn-open').forEach(function (btn) {
            btn.addEventListener('click', function () { _handleLoad(btn.dataset.id); });
        });
        listEl.querySelectorAll('.cpp-btn-rename').forEach(function (btn) {
            btn.addEventListener('click', function () { _handleRename(btn.dataset.id, btn.dataset.name); });
        });
        listEl.querySelectorAll('.cpp-btn-delete').forEach(function (btn) {
            btn.addEventListener('click', function () { _handleDelete(btn.dataset.id, btn.dataset.current === 'true'); });
        });
    }

    function _escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    function _escapeAttr(str) {
        return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ───────────────────────────────────────────────
    // ACTIONS
    // ───────────────────────────────────────────────

    async function _handleCreate() {
        var name = prompt('Nom du nouveau projet :');
        if (!name || !name.trim()) return;
        name = name.trim();

        // Save current if dirty
        if (CosmicPersistence.isDirty && CosmicPersistence.currentProjectId) {
            await CosmicPersistence.save();
        }

        var created = await CosmicPersistence.createProject(name);
        if (!created) {
            alert('Erreur lors de la creation du projet.');
            return;
        }

        _clearCosmicState();
        await CosmicPersistence.load(created.id);

        if (window.CosmicHistory) window.CosmicHistory.save();
        await _renderProjectList();
    }

    async function _handleLoad(id) {
        // Save current if dirty
        if (CosmicPersistence.isDirty && CosmicPersistence.currentProjectId) {
            var doSave = confirm('Le projet actuel a des modifications non sauvegardees. Sauvegarder avant de changer ?');
            if (doSave) await CosmicPersistence.save();
        }

        _clearCosmicState();
        await CosmicPersistence.load(id);

        if (window.CosmicHistory) window.CosmicHistory.save();
        close();
    }

    async function _handleRename(id, currentName) {
        var newName = prompt('Nouveau nom :', currentName || '');
        if (!newName || !newName.trim() || newName.trim() === currentName) return;

        var ok = await CosmicPersistence.renameProject(id, newName.trim());
        if (ok) {
            await _renderProjectList();
        } else {
            alert('Erreur lors du renommage.');
        }
    }

    async function _handleDelete(id, isCurrent) {
        if (isCurrent) {
            alert('Impossible de supprimer le projet actuellement ouvert.');
            return;
        }

        if (!confirm('Supprimer ce projet ? Cette action est irreversible.')) return;

        var ok = await CosmicPersistence.deleteProject(id);
        if (ok) {
            await _renderProjectList();
        } else {
            alert('Erreur lors de la suppression.');
        }
    }

    // ───────────────────────────────────────────────
    // PUBLIC API
    // ───────────────────────────────────────────────

    return {
        init: init,
        open: open,
        close: close,
        toggle: toggle
    };

})();

window.CosmicProjectsUI = CosmicProjectsUI;
console.log('CosmicProjectsUI loaded');

// Auto-init avec MutationObserver + polling fallback
(function() {
    let initialized = false;

    function doInit() {
        if (initialized) return;
        const btn = document.getElementById('galaxy-save-btn');
        if (!btn) return;
        if (typeof CosmicPersistence === 'undefined') return;

        initialized = true;
        console.log('🔌 CosmicProjectsUI auto-init triggered');

        try {
            CosmicProjectsUI.init();
        } catch(e) {
            console.error('❌ CosmicProjectsUI.init() error:', e);
        }

        if (!CosmicPersistence.currentProjectId) {
            CosmicPersistence.init().then(result => {
                console.log('🚀 Cosmic Projects:', result.action, result.name || '');
            }).catch(err => {
                console.warn('⚠️ Cosmic Projects init failed:', err);
            });
        }
    }

    // Essayer immédiatement
    doInit();

    // Polling toutes les 300ms pendant 30 secondes max
    let attempts = 0;
    const interval = setInterval(() => {
        if (initialized || attempts > 100) {
            clearInterval(interval);
            return;
        }
        attempts++;
        doInit();
    }, 300);
})();
