// ═══════════════════════════════════════════════════════════════════
// GALAXY COSMIC PROJECTS UI v1.1
// Panneau de gestion des projets Galaxy + section Projets Tâches
// ═══════════════════════════════════════════════════════════════════
'use strict';

const CosmicProjectsUI = (function () {

    let _overlay = null;
    let _panel = null;
    let _isOpen = false;
    let _isTaskProjectMode = false; // true = canvas lié à un projet tâches
    let _currentTaskProjectId = null;
    let _currentTaskProjectName = null;
    let _currentTaskProjectIcon = null;

    // localStorage keys for refresh restore
    var LAST_VIEW_TYPE_KEY = 'galaxy-last-view-type';
    var LAST_TASK_PROJECT_KEY = 'galaxy-last-task-project';

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

    // ───────────────────────────────────────────────
    // REFRESH RESTORE — localStorage persistence
    // ───────────────────────────────────────────────

    function _saveLastViewTask(projectId, projectName, projectIcon) {
        try {
            localStorage.setItem(LAST_VIEW_TYPE_KEY, 'task');
            localStorage.setItem(LAST_TASK_PROJECT_KEY, JSON.stringify({
                id: projectId, name: projectName, icon: projectIcon
            }));
        } catch (_) {}
    }

    function _saveLastViewCanvas() {
        try {
            localStorage.setItem(LAST_VIEW_TYPE_KEY, 'canvas');
            localStorage.removeItem(LAST_TASK_PROJECT_KEY);
        } catch (_) {}
    }

    async function _restoreTaskProject() {
        try {
            var type = localStorage.getItem(LAST_VIEW_TYPE_KEY);
            if (type !== 'task') return false;

            var raw = localStorage.getItem(LAST_TASK_PROJECT_KEY);
            if (!raw) return false;

            var project = JSON.parse(raw);
            if (!project || !project.id) return false;

            // Wait for tasks to be available (up to 5 s)
            var waited = 0;
            while (waited < 5000) {
                if (typeof AppState !== 'undefined' && Array.isArray(AppState.tasks) && AppState.tasks.length > 0) break;
                await new Promise(function (r) { setTimeout(r, 300); });
                waited += 300;
            }

            _clearCosmicState();
            _enterTaskProjectMode(project.id, project.name, project.icon);

            var tasks = _getTasksForProject(project.id);
            if (tasks.length > 0) {
                _generateTaskNodes(tasks);
                _removeTaskProjectBanner();
            }

            console.log('🔄 Restored task project: ' + project.name);
            return true;
        } catch (e) {
            console.warn('⚠️ Failed to restore task project:', e);
            return false;
        }
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
            '<div class="cpp-list-container">' +
                // Section 1: Création libre
                '<div class="cpp-section">' +
                    '<div class="cpp-section-header">' +
                        '<span class="cpp-section-icon">&#10024;</span>' +
                        '<span class="cpp-section-title">Cr\u00e9ation libre</span>' +
                    '</div>' +
                    '<button class="cpp-new-btn">+ Nouveau canvas</button>' +
                    '<div class="cpp-list" id="cpp-list-free"></div>' +
                '</div>' +
                // Section 2: Projets (Tâches)
                '<div class="cpp-section">' +
                    '<div class="cpp-section-header">' +
                        '<span class="cpp-section-icon">&#9745;</span>' +
                        '<span class="cpp-section-title">Projets (T\u00e2ches)</span>' +
                        '<span class="cpp-section-badge">T\u00e2ches</span>' +
                    '</div>' +
                    '<div class="cpp-list" id="cpp-list-tasks"></div>' +
                '</div>' +
            '</div>';

        _overlay.appendChild(_panel);
        document.body.appendChild(_overlay);

        // Close on overlay click (outside panel)
        _overlay.addEventListener('click', function (e) {
            if (e.target === _overlay) close();
        });

        // Close button
        _panel.querySelector('.cpp-close').addEventListener('click', close);

        // New project button (free canvas only)
        _panel.querySelector('.cpp-new-btn').addEventListener('click', function () {
            _handleCreate();
        });
    }

    async function _renderProjectList() {
        if (!_panel) return;

        var freeListEl = _panel.querySelector('#cpp-list-free');
        var taskListEl = _panel.querySelector('#cpp-list-tasks');
        if (!freeListEl || !taskListEl) return;

        freeListEl.innerHTML = '<div class="cpp-loading">Chargement...</div>';
        taskListEl.innerHTML = '<div class="cpp-loading">Chargement...</div>';

        // --- Section 1: Free canvas projects ---
        var projects = await CosmicPersistence.listProjects();
        var currentId = CosmicPersistence.currentProjectId;

        if (projects.length === 0) {
            freeListEl.innerHTML = '<div class="cpp-empty">Aucun canvas</div>';
        } else {
            var html = '';
            for (var i = 0; i < projects.length; i++) {
                var p = projects[i];
                var isCurrent = (p.id === currentId) && !_isTaskProjectMode;
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
            freeListEl.innerHTML = html;

            // Bind free canvas events
            freeListEl.querySelectorAll('.cpp-btn-open').forEach(function (btn) {
                btn.addEventListener('click', function () { _handleLoadFreeCanvas(btn.dataset.id); });
            });
            freeListEl.querySelectorAll('.cpp-btn-rename').forEach(function (btn) {
                btn.addEventListener('click', function () { _handleRename(btn.dataset.id, btn.dataset.name); });
            });
            freeListEl.querySelectorAll('.cpp-btn-delete').forEach(function (btn) {
                btn.addEventListener('click', function () { _handleDelete(btn.dataset.id, btn.dataset.current === 'true'); });
            });
        }

        // --- Section 2: Task projects ---
        await _renderTaskProjects(taskListEl);
    }

    async function _renderTaskProjects(listEl) {
        var taskProjects = [];

        // Try AppState first (already loaded), then fall back to API
        if (typeof AppState !== 'undefined' && Array.isArray(AppState.projects) && AppState.projects.length > 0) {
            taskProjects = AppState.projects.filter(function (p) {
                return p.status === 'active' || !p.status;
            });
        } else if (typeof ApiProjects !== 'undefined') {
            try {
                var fetched = await ApiProjects.getAll({ status: 'active' });
                taskProjects = Array.isArray(fetched) ? fetched : [];
            } catch (e) {
                console.error('CosmicProjectsUI: error loading task projects:', e);
            }
        }

        if (taskProjects.length === 0) {
            listEl.innerHTML = '<div class="cpp-empty">Aucun projet</div>';
            return;
        }

        var html = '';
        for (var i = 0; i < taskProjects.length; i++) {
            var tp = taskProjects[i];
            var icon = tp.icon || '\ud83d\udcc1';
            var name = tp.name || 'Sans nom';
            var color = tp.color || '#6b7280';

            html +=
                '<div class="cpp-item cpp-item-task" data-project-id="' + _escapeAttr(tp.id) + '">' +
                    '<div class="cpp-item-info">' +
                        '<span class="cpp-item-icon" style="background:' + color + '20;color:' + color + '">' + icon + '</span>' +
                        '<span class="cpp-item-name">' + _escapeHtml(name) + '</span>' +
                    '</div>' +
                    '<div class="cpp-item-actions">' +
                        '<button class="cpp-btn-open-task" data-project-id="' + _escapeAttr(tp.id) + '" data-project-name="' + _escapeAttr(name) + '" data-project-icon="' + _escapeAttr(icon) + '">Ouvrir</button>' +
                    '</div>' +
                '</div>';
        }

        listEl.innerHTML = html;

        // Bind task project events
        listEl.querySelectorAll('.cpp-btn-open-task').forEach(function (btn) {
            btn.addEventListener('click', function () {
                _handleOpenTaskProject(btn.dataset.projectId, btn.dataset.projectName, btn.dataset.projectIcon);
            });
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

        // Always save current project before creating a new one
        if (CosmicPersistence.currentProjectId) {
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

    async function _handleLoadFreeCanvas(id) {
        // Save current if dirty
        if (CosmicPersistence.isDirty && CosmicPersistence.currentProjectId) {
            var doSave = confirm('Le projet actuel a des modifications non sauvegardees. Sauvegarder avant de changer ?');
            if (doSave) await CosmicPersistence.save();
        }

        _clearCosmicState();
        _exitTaskProjectMode();
        await CosmicPersistence.load(id);
        _saveLastViewCanvas();

        if (window.CosmicHistory) window.CosmicHistory.save();
        close();
    }

    // Alias for backwards compat
    var _handleLoad = _handleLoadFreeCanvas;

    async function _handleOpenTaskProject(projectId, projectName, projectIcon) {
        // Save current free canvas if dirty
        if (CosmicPersistence.isDirty && CosmicPersistence.currentProjectId) {
            var doSave = confirm('Le projet actuel a des modifications non sauvegardees. Sauvegarder avant de changer ?');
            if (doSave) await CosmicPersistence.save();
        }

        _clearCosmicState();
        _enterTaskProjectMode(projectId, projectName, projectIcon);
        _saveLastViewTask(projectId, projectName, projectIcon);
        close();

        // Load tasks and generate nodes
        var tasks = _getTasksForProject(projectId);
        if (tasks.length > 0) {
            _generateTaskNodes(tasks);
            _removeTaskProjectBanner();
        }
    }

    // ───────────────────────────────────────────────
    // TASK NODE GENERATION
    // ───────────────────────────────────────────────

    function _getTasksForProject(projectId) {
        if (typeof AppState === 'undefined' || !Array.isArray(AppState.tasks)) return [];
        return AppState.tasks.filter(function (t) {
            var matchProject = (t.project === projectId || t.project_id === projectId);
            var notDone = (t.status !== 'done');
            return matchProject && notDone;
        });
    }

    function _getUserAvatar(userId) {
        if (!userId) return '';
        if (typeof AppConfig !== 'undefined' && Array.isArray(AppConfig.USERS)) {
            var user = AppConfig.USERS.find(function (u) { return u.id === userId; });
            if (user && user.avatar) return user.avatar;
        }
        return '';
    }

    function _getUserName(userId) {
        if (!userId) return '';
        if (typeof AppConfig !== 'undefined' && Array.isArray(AppConfig.USERS)) {
            var user = AppConfig.USERS.find(function (u) { return u.id === userId; });
            if (user && user.name) return user.name;
        }
        return '';
    }

    function _formatDueDate(dateStr) {
        if (!dateStr) return '';
        try {
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) { return ''; }
    }

    // ── Smart title shortener (pure frontend, no API) ──

    var _FILLER_PHRASES = [
        // Long phrases first to avoid partial matches
        'faire en sorte que', 'faire en sorte de', 'faire en sorte',
        'il faut que', 'il faut', 'il faudrait que', 'il faudrait',
        'penser a', 'penser à', 'ne pas oublier de', 'ne pas oublier',
        'rappelle moi de', 'rappelle-moi de', 'rappelle moi', 'rappelle-moi',
        'je dois', 'je vais', 'on doit', 'on devrait',
        'essayer de', 'essaye de', 'essaie de',
        'continuer a', 'continuer à', 'continuer de',
        'commencer a', 'commencer à', 'commencer par',
        'finir de', 'terminer de',
        'mettre en place', 'mettre à jour',
        'prendre en charge',
        'sous un même', 'sous le même', 'sous un', 'sous le',
        's\'occuper de', 's\'assurer que', 's\'assurer de'
    ];

    var _STOP_WORDS = new Set([
        // Articles
        'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'la',
        'au', 'aux', 'à', 'a',
        // Prépositions & liaisons
        'en', 'dans', 'sur', 'sous', 'avec', 'sans', 'par', 'vers', 'chez',
        'pour', 'que', 'qui', 'quoi', 'dont', 'où', 'ou',
        // Démonstratifs & possessifs
        'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'mon', 'ma', 'mes',
        'leur', 'leurs', 'notre', 'nos', 'votre', 'vos',
        // Conjonctions
        'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
        // Verbes faibles
        'est', 'sont', 'être', 'etre', 'avoir', 'fait', 'faire',
        'soit', 'soient', 'sera', 'serait',
        'mettre', 'rendre', 'aller',
        // Adverbes & quantificateurs
        'tous', 'toutes', 'tout', 'toute',
        'bien', 'très', 'plus', 'aussi', 'encore', 'même', 'meme',
        'déjà', 'deja', 'vraiment', 'surtout', 'trop',
        // Pronoms
        'se', 'ne', 'pas', 'y', 'en', 'il', 'elle', 'on', 'nous', 'vous',
        // Autres mots vides fréquents
        'lien', 'format', 'officiel', 'niveau', 'façon', 'facon',
        'manière', 'maniere', 'besoin'
    ]);

    var _ABBREVS = {
        'rendez-vous': 'RDV', 'rendez vous': 'RDV', 'rdv': 'RDV',
        'document': 'Doc', 'documents': 'Docs',
        'ordinateur': 'Ordi', 'ordinateurs': 'Ordis',
        'téléphone': 'Tel', 'telephone': 'Tel',
        'vérifier': 'Vérif', 'verifier': 'Vérif', 'vérification': 'Vérif',
        'certification': 'Certif', 'certificat': 'Certif', 'certif': 'Certif',
        'configuration': 'Config', 'configurer': 'Config',
        'information': 'Info', 'informations': 'Infos',
        'application': 'App', 'applications': 'Apps',
        'développement': 'Dev', 'developpement': 'Dev', 'développer': 'Dev',
        'présentation': 'Présent.', 'presentation': 'Présent.',
        'communication': 'Com.',
        'formation': 'Forma.', 'formations': 'Forma.',
        'réunion': 'Réunion', 'reunion': 'Réunion',
        'proposition': 'Prop.',
        'facturation': 'Factu.', 'facture': 'Facture', 'factures': 'Factures',
        'récupérer': 'Récup.', 'recuperer': 'Récup.',
        'contacter': 'Contact', 'contact': 'Contact',
        'envoyer': 'Envoi', 'envoi': 'Envoi',
        'acheter': 'Achat', 'achat': 'Achat',
        'harmonisé': 'Harmoniser', 'harmoniser': 'Harmoniser', 'harmonisée': 'Harmoniser',
        'tunnelle': 'Tunnel', 'tunnel': 'Tunnel',
        'organisation': 'Orga.', 'organiser': 'Orga.',
        'préparation': 'Prépa.', 'preparation': 'Prépa.', 'préparer': 'Prépa.',
        'administration': 'Admin.', 'administratif': 'Admin.',
        'planification': 'Planif.', 'planifier': 'Planif.',
        'installation': 'Install.', 'installer': 'Install.',
        'modification': 'Modif.', 'modifier': 'Modif.',
        'suppression': 'Suppr.', 'supprimer': 'Suppr.',
        'vérification': 'Vérif.', 'validation': 'Valid.',
        'abonnement': 'Abo.', 'abonnements': 'Abo.'
    };

    function _smartShorten(text, maxChars) {
        if (!text) return '';
        var s = text.trim();

        // 1. Remove filler phrases (longest first)
        var lower = s.toLowerCase();
        for (var p = 0; p < _FILLER_PHRASES.length; p++) {
            var phrase = _FILLER_PHRASES[p];
            var idx = lower.indexOf(phrase);
            if (idx !== -1) {
                s = (s.substring(0, idx) + s.substring(idx + phrase.length)).trim();
                lower = s.toLowerCase();
            }
        }

        // 2. Apply abbreviations (case-insensitive, whole-word)
        var words = s.split(/\s+/);
        for (var w = 0; w < words.length; w++) {
            var wLow = words[w].toLowerCase().replace(/[.,;:!?()]/g, '');
            if (_ABBREVS[wLow]) {
                words[w] = _ABBREVS[wLow];
            }
        }

        // 3. Remove stop words (keep proper nouns, acronyms, numbers)
        var filtered = [];
        for (var f = 0; f < words.length; f++) {
            var word = words[f];
            var cleanWord = word.replace(/[.,;:!?()]/g, '');
            if (cleanWord.length === 0) continue;
            var isProperNoun = /^[A-ZÀ-Ú]/.test(cleanWord) && cleanWord.length > 1 && cleanWord !== cleanWord.toUpperCase();
            var isSpecial = /^[A-Z]{2,}$/.test(cleanWord) || /\d/.test(cleanWord) || /[./@]/.test(word);
            if (isProperNoun || isSpecial || !_STOP_WORDS.has(cleanWord.toLowerCase())) {
                filtered.push(word);
            }
        }

        // 4. Remove duplicate words (case-insensitive, keep first occurrence)
        var seen = {};
        var deduped = [];
        for (var d = 0; d < filtered.length; d++) {
            var key = filtered[d].toLowerCase().replace(/[.,;:!?()]/g, '');
            if (!seen[key]) {
                seen[key] = true;
                deduped.push(filtered[d]);
            }
        }
        filtered = deduped;

        if (filtered.length === 0) {
            filtered = words.slice(0, 3);
        }

        // 5. Capitalize first word
        var result = filtered.join(' ');
        if (result.length > 0) {
            result = result.charAt(0).toUpperCase() + result.substring(1);
        }

        // 6. If it fits, return as-is
        if (result.length <= maxChars) return result;

        // 7. Last resort: truncate with "..."
        return result.substring(0, maxChars - 3).trim() + '...';
    }

    // ── Shared priority config (used by _generateTaskNodes + _syncTaskNode) ──
    var _priorityMap = {
        'urgent': { radius: 75, color: '#e74c3c', maxChars: 60, label: 'Urgent',    sortOrder: 1 },
        'high':   { radius: 60, color: '#f39c12', maxChars: 50, label: 'Important',  sortOrder: 2 },
        'medium': { radius: 50, color: '#3498db', maxChars: 40, label: 'Normal',     sortOrder: 3 },
        'low':    { radius: 35, color: '#f0f0f0', maxChars: 25, label: 'Zen', textColor: '#222222', sortOrder: 4 }
    };
    var _defaultPrio = _priorityMap['medium'];

    function _getRawPriority(task) {
        if (task.priority && task.priority.raw) return task.priority.raw;
        if (task.priority && task.priority.label) {
            var clean = task.priority.label.replace(/[^\w\sÀ-ÿ]/g, '').trim();
            var byLabel = { 'Urgent': 'urgent', 'Important': 'high', 'Normal': 'medium', 'Zen': 'low' };
            return byLabel[clean] || 'medium';
        }
        if (task.priority && typeof task.priority.level === 'number') {
            var byLevel = { 1: 'urgent', 2: 'high', 3: 'medium', 4: 'low' };
            return byLevel[task.priority.level] || 'medium';
        }
        if (typeof task.priority === 'string') return task.priority.toLowerCase();
        return 'medium';
    }

    // ───────────────────────────────────────────────
    // LAYOUT: concentric rings (shared by generate + sync)
    // ───────────────────────────────────────────────

    /**
     * Positions an array of task nodes in concentric rings by priority.
     * Mutates each node's x/y in place. Also runs anti-overlap + auto-zoom.
     */
    function _layoutTaskNodes(nodes) {
        if (!nodes || nodes.length === 0) return;

        var MARGIN = 50;
        var RING_GAP = 40;
        var ringOrder = ['urgent', 'high', 'medium', 'low'];

        // Group nodes by priority ring, sub-sort by assigned user
        var rings = { 'urgent': [], 'high': [], 'medium': [], 'low': [] };
        for (var i = 0; i < nodes.length; i++) {
            var rk = nodes[i].taskPriorityRaw || 'medium';
            (rings[rk] || rings['medium']).push(nodes[i]);
        }
        for (var ri = 0; ri < ringOrder.length; ri++) {
            var k = ringOrder[ri];
            rings[k].sort(function (a, b) {
                var ua = a.taskUserAvatar || '';
                var ub = b.taskUserAvatar || '';
                return ua < ub ? -1 : ua > ub ? 1 : 0;
            });
        }

        // Place each ring
        var prevRingOuter = 0;
        var isFirstRing = true;

        for (var ri2 = 0; ri2 < ringOrder.length; ri2++) {
            var ringKey = ringOrder[ri2];
            var ringNodes = rings[ringKey];
            if (ringNodes.length === 0) continue;

            var nodeRadius = (_priorityMap[ringKey] || _defaultPrio).radius;
            var n = ringNodes.length;

            var ringR;
            if (isFirstRing && n === 1) {
                ringR = 0;
            } else if (isFirstRing) {
                var span0 = nodeRadius * 2 + MARGIN;
                ringR = Math.max(nodeRadius + MARGIN, (n * span0) / (2 * Math.PI));
            } else {
                var span = nodeRadius * 2 + MARGIN;
                ringR = Math.max((n * span) / (2 * Math.PI), prevRingOuter + nodeRadius + RING_GAP);
            }

            var angleStep = (2 * Math.PI) / n;
            var startAngle = -Math.PI / 2;

            for (var j = 0; j < n; j++) {
                var angle = startAngle + j * angleStep;
                ringNodes[j].x = (ringR === 0) ? 0 : Math.cos(angle) * ringR;
                ringNodes[j].y = (ringR === 0) ? 0 : Math.sin(angle) * ringR;
            }

            prevRingOuter = ringR + nodeRadius;
            isFirstRing = false;
        }

        // Anti-overlap pass
        for (var a = 0; a < nodes.length; a++) {
            for (var b = a + 1; b < nodes.length; b++) {
                var dx = nodes[b].x - nodes[a].x;
                var dy = nodes[b].y - nodes[a].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var minDist = nodes[a].radius + nodes[b].radius + MARGIN;
                if (dist < minDist && dist > 0) {
                    var overlap = (minDist - dist) / 2;
                    var nx = dx / dist;
                    var ny = dy / dist;
                    nodes[a].x -= nx * overlap;
                    nodes[a].y -= ny * overlap;
                    nodes[b].x += nx * overlap;
                    nodes[b].y += ny * overlap;
                }
            }
        }

        // Auto-zoom to fit bounding box
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (var ni = 0; ni < nodes.length; ni++) {
            var nd = nodes[ni];
            if (nd.x - nd.radius < minX) minX = nd.x - nd.radius;
            if (nd.x + nd.radius > maxX) maxX = nd.x + nd.radius;
            if (nd.y - nd.radius < minY) minY = nd.y - nd.radius;
            if (nd.y + nd.radius > maxY) maxY = nd.y + nd.radius;
        }
        CosmicState.camera.x = (minX + maxX) / 2;
        CosmicState.camera.y = (minY + maxY) / 2;

        var canvas = CosmicState.canvas;
        if (canvas) {
            var bboxW = (maxX - minX) * 1.15;
            var bboxH = (maxY - minY) * 1.15;
            var zoomX = canvas.width / (bboxW || 1);
            var zoomY = canvas.height / (bboxH || 1);
            var targetZoom = Math.min(1.5, Math.max(0.15, Math.min(zoomX, zoomY)));
            CosmicState.camera.zoom = targetZoom;
            CosmicState.camera.targetZoom = targetZoom;
        }
    }

    // ───────────────────────────────────────────────
    // GENERATE: create task nodes from task data
    // ───────────────────────────────────────────────

    function _generateTaskNodes(tasks) {
        var statusLabels = {
            'todo': '\u00c0 faire', 'inprogress': 'En cours',
            'in_progress': 'En cours', 'review': 'En revue',
            'blocked': 'Bloqu\u00e9', 'done': 'Termin\u00e9'
        };

        var nodes = [];
        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            var raw = _getRawPriority(task);
            var prio = _priorityMap[raw] || _defaultPrio;
            var uid = task.userId || task.assigned_to;
            var fullText = task.text || task.title || '';

            nodes.push({
                id: 'task_' + task.id,
                type: 'thought',
                shape: 'circle',
                x: 0, y: 0, // placed by _layoutTaskNodes
                radius: prio.radius,
                color: prio.color,
                textColor: prio.textColor || '#ffffff',
                text: _smartShorten(fullText, prio.maxChars),
                fontSize: raw === 'urgent' ? 14 : raw === 'high' ? 13 : raw === 'medium' ? 12 : 11,
                createdAt: Date.now(),
                breathing: true,
                glowIntensity: (raw === 'urgent') ? 0.6 : 0.2,
                locked: true,
                isTaskNode: true,
                taskId: task.id,
                taskStatus: task.status,
                taskPriority: prio.sortOrder,
                taskPriorityRaw: raw,
                taskUserAvatar: _getUserAvatar(uid),
                metadata: {
                    taskId: task.id,
                    projectId: task.project || task.project_id,
                    fullTitle: fullText,
                    description: task.description || '',
                    status: task.status,
                    statusLabel: statusLabels[task.status] || task.status,
                    priority: prio.sortOrder,
                    priorityRaw: raw,
                    priorityLabel: prio.label,
                    assignedName: _getUserName(uid),
                    assignedAvatar: _getUserAvatar(uid),
                    dueDate: _formatDueDate(task.due_date || task.dueDate)
                }
            });
        }

        // Layout in concentric rings
        _layoutTaskNodes(nodes);

        // Push into CosmicState
        CosmicState.nodes = nodes;

        console.log('\u2705 Generated ' + nodes.length + ' task nodes (concentric rings)');
    }

    // ───────────────────────────────────────────────
    // TASK PROJECT MODE
    // ───────────────────────────────────────────────

    function _enterTaskProjectMode(projectId, projectName, projectIcon) {
        _isTaskProjectMode = true;
        _currentTaskProjectId = projectId;
        _currentTaskProjectName = projectName;
        _currentTaskProjectIcon = projectIcon;

        var viewGalaxy = document.getElementById('view-galaxy');
        if (viewGalaxy) viewGalaxy.classList.add('task-project-mode');

        // Update toolbar project name indicator
        var nameEl = document.querySelector('.cosmic-project-name');
        if (nameEl) nameEl.textContent = (projectIcon || '') + ' ' + (projectName || '');

        var dot = document.querySelector('.cosmic-status-dot');
        if (dot) dot.dataset.status = 'loaded';

        // Show task project banner on canvas
        _showTaskProjectBanner(projectName, projectIcon);

        console.log('\u2705 Task project mode: ' + projectName);
    }

    function _exitTaskProjectMode() {
        if (!_isTaskProjectMode) return;
        _isTaskProjectMode = false;
        _currentTaskProjectId = null;
        _currentTaskProjectName = null;
        _currentTaskProjectIcon = null;

        var viewGalaxy = document.getElementById('view-galaxy');
        if (viewGalaxy) viewGalaxy.classList.remove('task-project-mode');

        // Remove task project banner
        _removeTaskProjectBanner();

        // Hide task tooltip if visible
        var tip = document.querySelector('.cosmic-task-tooltip');
        if (tip) tip.classList.remove('visible');

        // Reset canvas cursor
        var canvas = CosmicState && CosmicState.canvas;
        if (canvas) canvas.style.cursor = '';

        console.log('\u2705 Exited task project mode');
    }

    function _showTaskProjectBanner(name, icon) {
        _removeTaskProjectBanner();

        var container = document.getElementById('galaxy-3d-container');
        if (!container) return;

        var banner = document.createElement('div');
        banner.id = 'cpp-task-banner';
        banner.className = 'cpp-task-banner';
        banner.innerHTML =
            '<div class="cpp-task-banner-text">' +
                '<div class="cpp-task-banner-name">' + _escapeHtml(name || '') + '</div>' +
            '</div>';

        container.appendChild(banner);
    }

    function _removeTaskProjectBanner() {
        var existing = document.getElementById('cpp-task-banner');
        if (existing) existing.remove();
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
    // SYNC: update a single task node from AppState
    // ───────────────────────────────────────────────

    /**
     * Called after a task is saved/modified/completed/deleted from the edit panel.
     * Updates (or removes) the matching node in CosmicState without re-laying-out everything.
     */
    function _syncTaskNode(taskId) {
        if (!_isTaskProjectMode) return;
        if (!CosmicState || !CosmicState.nodes) return;

        var nodeId = 'task_' + taskId;
        var nodeIdx = -1;
        for (var i = 0; i < CosmicState.nodes.length; i++) {
            if (CosmicState.nodes[i].taskId === taskId || CosmicState.nodes[i].id === nodeId) {
                nodeIdx = i;
                break;
            }
        }
        if (nodeIdx === -1) return; // node not on canvas

        var node = CosmicState.nodes[nodeIdx];
        var task = (typeof AppState !== 'undefined') ? AppState.findTask(taskId) : null;

        // ── Task deleted or marked done → animate out & remove ──
        if (!task || task.status === 'done') {
            node._fadeOut = true;
            node._fadeStart = Date.now();
            node._origRadius = node.radius;
            // Animate: shrink + fade over 500ms, then remove
            var fadeInterval = setInterval(function () {
                var elapsed = Date.now() - node._fadeStart;
                var progress = Math.min(1, elapsed / 500);
                node.radius = node._origRadius * (1 - progress);
                node.glowIntensity = (1 - progress) * 0.5;
                if (progress >= 1) {
                    clearInterval(fadeInterval);
                    var idx = CosmicState.nodes.indexOf(node);
                    if (idx !== -1) CosmicState.nodes.splice(idx, 1);
                }
            }, 16);
            return;
        }

        // ── Task still active → update node properties in-place ──
        var oldRaw = node.taskPriorityRaw;
        var raw = _getRawPriority(task);
        var prio = _priorityMap[raw] || _defaultPrio;

        // Update visuals
        node.color = prio.color;
        node.textColor = prio.textColor || '#ffffff';
        node.radius = prio.radius;
        node.taskPriority = prio.sortOrder;
        node.taskPriorityRaw = raw;
        node.glowIntensity = (raw === 'urgent') ? 0.6 : 0.2;
        node.fontSize = raw === 'urgent' ? 14 : raw === 'high' ? 13 : raw === 'medium' ? 12 : 11;

        // ── Re-layout ALL task nodes if priority changed ──
        if (oldRaw && oldRaw !== raw) {
            var taskNodes = [];
            for (var ti = 0; ti < CosmicState.nodes.length; ti++) {
                if (CosmicState.nodes[ti].isTaskNode) taskNodes.push(CosmicState.nodes[ti]);
            }
            _layoutTaskNodes(taskNodes);
        }

        // Update text
        var fullText = task.text || task.title || '';
        node.text = _smartShorten(fullText, prio.maxChars);

        // Update avatar
        var uid = task.userId || task.assigned_to;
        node.taskUserAvatar = _getUserAvatar(uid);

        // Update metadata
        var statusLabels = {
            'todo': '\u00c0 faire', 'inprogress': 'En cours',
            'in_progress': 'En cours', 'review': 'En revue',
            'blocked': 'Bloqu\u00e9', 'done': 'Termin\u00e9'
        };
        node.metadata.fullTitle = fullText;
        node.metadata.description = task.description || '';
        node.metadata.status = task.status;
        node.metadata.statusLabel = statusLabels[task.status] || task.status;
        node.metadata.priority = prio.sortOrder;
        node.metadata.priorityRaw = raw;
        node.metadata.priorityLabel = prio.label;
        node.metadata.assignedName = _getUserName(uid);
        node.metadata.assignedAvatar = _getUserAvatar(uid);
    }

    // ───────────────────────────────────────────────
    // REFRESH ON VIEW ACTIVATION
    // ───────────────────────────────────────────────

    /**
     * Called when Galaxy View becomes visible again (e.g. user navigated away
     * to Tasks, made changes, then came back). Detects if tasks in the current
     * project have changed (added, removed, or modified) and regenerates nodes.
     */
    function _onGalaxyViewActivated() {
        if (!_isTaskProjectMode || !_currentTaskProjectId) return;

        var currentTasks = _getTasksForProject(_currentTaskProjectId);
        var taskNodes = [];
        for (var i = 0; i < CosmicState.nodes.length; i++) {
            if (CosmicState.nodes[i].isTaskNode) taskNodes.push(CosmicState.nodes[i]);
        }

        var currentNodeTaskIds = [];
        for (var ni = 0; ni < taskNodes.length; ni++) {
            currentNodeTaskIds.push(taskNodes[ni].taskId);
        }
        var taskIds = [];
        for (var ti = 0; ti < currentTasks.length; ti++) {
            taskIds.push(currentTasks[ti].id);
        }

        // Check structural changes (added or removed tasks)
        var hasChanged = currentNodeTaskIds.length !== taskIds.length;
        if (!hasChanged) {
            for (var a = 0; a < currentNodeTaskIds.length; a++) {
                if (taskIds.indexOf(currentNodeTaskIds[a]) === -1) { hasChanged = true; break; }
            }
        }
        if (!hasChanged) {
            for (var b = 0; b < taskIds.length; b++) {
                if (currentNodeTaskIds.indexOf(taskIds[b]) === -1) { hasChanged = true; break; }
            }
        }

        // Check property changes (priority, title, assignment, status)
        if (!hasChanged) {
            for (var c = 0; c < currentTasks.length; c++) {
                var t = currentTasks[c];
                var node = null;
                for (var nj = 0; nj < taskNodes.length; nj++) {
                    if (taskNodes[nj].taskId === t.id) { node = taskNodes[nj]; break; }
                }
                if (!node) { hasChanged = true; break; }

                var raw = _getRawPriority(t);
                if (node.taskPriorityRaw !== raw) { hasChanged = true; break; }

                var fullText = t.text || t.title || '';
                if (node.metadata && node.metadata.fullTitle !== fullText) { hasChanged = true; break; }

                var uid = t.userId || t.assigned_to;
                var avatar = _getUserAvatar(uid);
                if (node.taskUserAvatar !== avatar) { hasChanged = true; break; }

                if (node.taskStatus !== t.status) { hasChanged = true; break; }
            }
        }

        if (hasChanged) {
            console.log('🔄 Galaxy: task data changed, regenerating nodes');
            // Keep non-task nodes intact, regenerate task nodes only
            var nonTaskNodes = [];
            for (var k = 0; k < CosmicState.nodes.length; k++) {
                if (!CosmicState.nodes[k].isTaskNode) nonTaskNodes.push(CosmicState.nodes[k]);
            }
            _generateTaskNodes(currentTasks);
            // _generateTaskNodes sets CosmicState.nodes = task nodes only
            // Prepend any non-task nodes that might exist
            if (nonTaskNodes.length > 0) {
                CosmicState.nodes = nonTaskNodes.concat(CosmicState.nodes);
            }
        }
    }

    // Listen for view changes — refresh task nodes when Galaxy View becomes active
    document.addEventListener('viewchange', function (e) {
        if (e.detail && e.detail.view === 'galaxy') {
            _onGalaxyViewActivated();
        }
    });

    // ───────────────────────────────────────────────
    // PUBLIC API
    // ───────────────────────────────────────────────

    return {
        init: init,
        open: open,
        close: close,
        toggle: toggle,
        createProject: _handleCreate,
        exitTaskProjectMode: _exitTaskProjectMode,
        syncTaskNode: _syncTaskNode,
        restoreTaskProject: _restoreTaskProject,
        get isTaskProjectMode() { return _isTaskProjectMode; },
        get taskProjectName() { return _currentTaskProjectName; },
        get taskProjectIcon() { return _currentTaskProjectIcon; }
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

        // Check if last session was a task project → restore it
        var lastViewType = null;
        try { lastViewType = localStorage.getItem('galaxy-last-view-type'); } catch (_) {}

        if (lastViewType === 'task') {
            CosmicProjectsUI.restoreTaskProject().then(function(restored) {
                if (restored) {
                    console.log('🔄 Task project restored after refresh');
                } else {
                    // Fallback: load normal free canvas
                    _initFreeCanvas();
                }
            }).catch(function() {
                _initFreeCanvas();
            });
        } else {
            _initFreeCanvas();
        }

        function _initFreeCanvas() {
            if (!CosmicPersistence.currentProjectId) {
                CosmicPersistence.init().then(result => {
                    console.log('🚀 Cosmic Projects:', result.action, result.name || '');
                }).catch(err => {
                    console.warn('⚠️ Cosmic Projects init failed:', err);
                });
            }
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
