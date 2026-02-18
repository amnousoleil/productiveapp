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

    function _generateTaskNodes(tasks) {
        // Priority mapping keyed on raw backend string (urgent/high/medium/low)
        var priorityMap = {
            'urgent': { radius: 75, color: '#e74c3c', maxChars: 60, label: 'Urgent',    sortOrder: 1 },
            'high':   { radius: 60, color: '#f39c12', maxChars: 50, label: 'Important',  sortOrder: 2 },
            'medium': { radius: 50, color: '#3498db', maxChars: 40, label: 'Normal',     sortOrder: 3 },
            'low':    { radius: 35, color: '#f0f0f0', maxChars: 25, label: 'Zen', textColor: '#222222', sortOrder: 4 }
        };
        var defaultPrio = priorityMap['medium'];

        // Resolve raw priority string from task
        function _getRaw(task) {
            if (task.priority && task.priority.raw) return task.priority.raw;
            // Fallback: match label (strip emojis from labels like "🔥 Urgent")
            if (task.priority && task.priority.label) {
                var clean = task.priority.label.replace(/[^\w\sÀ-ÿ]/g, '').trim();
                var byLabel = { 'Urgent': 'urgent', 'Important': 'high', 'Normal': 'medium', 'Zen': 'low' };
                return byLabel[clean] || 'medium';
            }
            // Fallback: numeric level → raw string (UI dropdown values 1-4)
            if (task.priority && typeof task.priority.level === 'number') {
                var byLevel = { 1: 'urgent', 2: 'high', 3: 'medium', 4: 'low' };
                return byLevel[task.priority.level] || 'medium';
            }
            if (typeof task.priority === 'string') return task.priority.toLowerCase();
            return 'medium';
        }

        // ── Group tasks by priority ring, then sub-sort by assigned user ──
        var ringOrder = ['urgent', 'high', 'medium', 'low'];
        var rings = { 'urgent': [], 'high': [], 'medium': [], 'low': [] };
        for (var t = 0; t < tasks.length; t++) {
            var raw0 = _getRaw(tasks[t]);
            (rings[raw0] || rings['medium']).push(tasks[t]);
        }
        // Within each ring, group by assigned user so same-person tasks cluster
        for (var ri = 0; ri < ringOrder.length; ri++) {
            var rk = ringOrder[ri];
            rings[rk].sort(function (a, b) {
                var ua = a.userId || a.assigned_to || '';
                var ub = b.userId || b.assigned_to || '';
                return ua < ub ? -1 : ua > ub ? 1 : 0;
            });
        }

        var MARGIN = 25; // min gap between node edges
        var RING_GAP = 20; // extra gap between rings beyond clearance

        var statusLabels = {
            'todo': '\u00c0 faire', 'inprogress': 'En cours',
            'in_progress': 'En cours', 'review': 'En revue',
            'blocked': 'Bloqu\u00e9', 'done': 'Termin\u00e9'
        };

        var nodes = [];
        var prevRingOuter = 0; // tracks outermost edge of previous ring
        var isFirstRing = true;

        for (var ri2 = 0; ri2 < ringOrder.length; ri2++) {
            var ringKey = ringOrder[ri2];
            var ringTasks = rings[ringKey];
            if (ringTasks.length === 0) continue; // skip empty → next ring packs tighter

            var prio = priorityMap[ringKey] || defaultPrio;
            var nodeRadius = prio.radius;
            var n = ringTasks.length;

            // ── Compute ring radius ──
            var ringR;
            if (isFirstRing && n === 1) {
                // Single task in first populated ring → dead centre
                ringR = 0;
            } else if (isFirstRing && n > 1) {
                // First ring with multiple tasks — tight circle just big enough
                var itemSpan0 = (nodeRadius * 2) + MARGIN;
                ringR = Math.max(nodeRadius + MARGIN, (n * itemSpan0) / (2 * Math.PI));
            } else {
                // Subsequent rings — just clear the previous ring
                var itemSpan = (nodeRadius * 2) + MARGIN;
                var minRingR = (n * itemSpan) / (2 * Math.PI);
                var clearance = prevRingOuter + nodeRadius + RING_GAP;
                ringR = Math.max(minRingR, clearance);
            }

            // ── Place nodes evenly around the ring ──
            var angleStep = (2 * Math.PI) / n;
            var startAngle = -Math.PI / 2; // start at top (12 o'clock)

            for (var j = 0; j < n; j++) {
                var task = ringTasks[j];
                var angle = startAngle + j * angleStep;
                var x = (ringR === 0) ? 0 : Math.cos(angle) * ringR;
                var y = (ringR === 0) ? 0 : Math.sin(angle) * ringR;

                var uid = task.userId || task.assigned_to;
                var avatar = _getUserAvatar(uid);
                var userName = _getUserName(uid);
                var fullText = task.text || task.title || '';
                var rawP = _getRaw(task);
                var isUrgent = (rawP === 'urgent');
                var fontSize = rawP === 'urgent' ? 14 : rawP === 'high' ? 13 : rawP === 'medium' ? 12 : 11;

                nodes.push({
                    id: 'task_' + task.id,
                    type: 'thought',
                    shape: 'circle',
                    x: x,
                    y: y,
                    radius: nodeRadius,
                    color: prio.color,
                    textColor: prio.textColor || '#ffffff',
                    text: _smartShorten(fullText, prio.maxChars),
                    fontSize: fontSize,
                    createdAt: Date.now(),
                    breathing: true,
                    glowIntensity: isUrgent ? 0.6 : 0.2,
                    locked: true,
                    isTaskNode: true,
                    taskId: task.id,
                    taskStatus: task.status,
                    taskPriority: prio.sortOrder,
                    taskPriorityRaw: rawP,
                    taskUserAvatar: avatar,
                    metadata: {
                        taskId: task.id,
                        projectId: task.project || task.project_id,
                        fullTitle: fullText,
                        description: task.description || '',
                        status: task.status,
                        statusLabel: statusLabels[task.status] || task.status,
                        priority: prio.sortOrder,
                        priorityRaw: rawP,
                        priorityLabel: prio.label,
                        assignedName: userName,
                        assignedAvatar: avatar,
                        dueDate: _formatDueDate(task.due_date || task.dueDate)
                    }
                });
            }

            // Track outermost edge for next ring clearance
            prevRingOuter = ringR + nodeRadius;
            isFirstRing = false;
        }

        // ── Anti-overlap pass: push outward any overlapping nodes ──
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

        // ── Push into CosmicState ──
        CosmicState.nodes = nodes;

        // ── Auto-zoom to fit all nodes with margin ──
        if (nodes.length > 0) {
            // Bounding box
            var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            for (var ni = 0; ni < nodes.length; ni++) {
                var nd = nodes[ni];
                var left = nd.x - nd.radius;
                var right = nd.x + nd.radius;
                var top = nd.y - nd.radius;
                var bottom = nd.y + nd.radius;
                if (left < minX) minX = left;
                if (right > maxX) maxX = right;
                if (top < minY) minY = top;
                if (bottom > maxY) maxY = bottom;
            }
            // Centre camera on bounding-box centre
            CosmicState.camera.x = (minX + maxX) / 2;
            CosmicState.camera.y = (minY + maxY) / 2;

            // Zoom so the full bounding box fits with 15% margin
            var canvas = CosmicState.canvas;
            if (canvas) {
                var bboxW = (maxX - minX) * 1.15;
                var bboxH = (maxY - minY) * 1.15;
                var zoomX = canvas.width / (bboxW || 1);
                var zoomY = canvas.height / (bboxH || 1);
                var targetZoom = Math.min(zoomX, zoomY);
                targetZoom = Math.min(1.5, Math.max(0.15, targetZoom));
                CosmicState.camera.zoom = targetZoom;
                CosmicState.camera.targetZoom = targetZoom;
            }
        }

        console.log('\u2705 Generated ' + nodes.length + ' task nodes (concentric rings)');
    }

    // ───────────────────────────────────────────────
    // TASK PROJECT MODE
    // ───────────────────────────────────────────────

    function _enterTaskProjectMode(projectId, projectName, projectIcon) {
        _isTaskProjectMode = true;

        var viewGalaxy = document.getElementById('view-galaxy');
        if (viewGalaxy) viewGalaxy.classList.add('task-project-mode');

        // Hide the drawing toolbar
        var cosmicToolbar = document.querySelector('.cosmic-toolbar');
        if (cosmicToolbar) cosmicToolbar.style.display = 'none';

        // Disable 3D button
        var btn3d = document.getElementById('galaxy-toggle-3d');
        if (btn3d) {
            btn3d.disabled = true;
            btn3d.style.opacity = '0.3';
            btn3d.style.pointerEvents = 'none';
        }

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

        var viewGalaxy = document.getElementById('view-galaxy');
        if (viewGalaxy) viewGalaxy.classList.remove('task-project-mode');

        // Show the drawing toolbar again
        var cosmicToolbar = document.querySelector('.cosmic-toolbar');
        if (cosmicToolbar) cosmicToolbar.style.display = '';

        // Re-enable 3D button
        var btn3d = document.getElementById('galaxy-toggle-3d');
        if (btn3d) {
            btn3d.disabled = false;
            btn3d.style.opacity = '';
            btn3d.style.pointerEvents = '';
        }

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
            '<div class="cpp-task-banner-icon">' + (icon || '\ud83d\udcc1') + '</div>' +
            '<div class="cpp-task-banner-text">' +
                '<div class="cpp-task-banner-name">' + _escapeHtml(name || '') + '</div>' +
                '<div class="cpp-task-banner-hint">Les t\u00e2ches de ce projet appara\u00eetront ici bient\u00f4t</div>' +
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
    // PUBLIC API
    // ───────────────────────────────────────────────

    return {
        init: init,
        open: open,
        close: close,
        toggle: toggle,
        createProject: _handleCreate,
        exitTaskProjectMode: _exitTaskProjectMode,
        get isTaskProjectMode() { return _isTaskProjectMode; }
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
