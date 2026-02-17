/**
 * ================================================
 * COMMAND PALETTE - ProductiveApp
 * Palette de commandes premium (Cmd+K / Ctrl+K)
 * Navigation rapide, recherche fuzzy, actions
 * ================================================
 */
const CommandPalette = (function() {
    'use strict';

    var isOpen = false;
    var activeIndex = 0;
    var filteredItems = [];
    var backdropEl = null;
    var inputEl = null;
    var resultsEl = null;
    var initialized = false;

    var NAV_ITEMS = [
        { id: 'nav-dashboard', icon: '\uD83C\uDFE0', title: 'Tableau de bord', category: 'Navigation', action: function() { nav('dashboard'); } },
        { id: 'nav-tasks', icon: '\u2705', title: 'T\u00E2ches', category: 'Navigation', action: function() { nav('tasks'); } },
        { id: 'nav-projects', icon: '\uD83D\uDCC1', title: 'Projets', category: 'Navigation', action: function() { nav('projects'); } },
        { id: 'nav-notes', icon: '\uD83D\uDDD2\uFE0F', title: 'Notes', category: 'Navigation', action: function() { nav('notes'); } },
        { id: 'nav-galaxy', icon: '\uD83C\uDF0C', title: 'Galaxie', category: 'Navigation', action: function() { nav('galaxy'); } },
        { id: 'nav-journal', icon: '\uD83D\uDCD3', title: 'Journal', category: 'Navigation', action: function() { nav('journal'); } },
        { id: 'nav-settings', icon: '\u2699\uFE0F', title: 'Param\u00E8tres', category: 'Navigation', action: function() { nav('settings'); } },
        { id: 'nav-analytics', icon: '\uD83D\uDCCA', title: 'Analytique', category: 'Navigation', action: function() { nav('analytics'); } },
        { id: 'nav-reports', icon: '\uD83D\uDCCB', title: 'Rapports', category: 'Navigation', action: function() { nav('reports'); } },
        { id: 'nav-accounting', icon: '\uD83D\uDCB0', title: 'Comptabilit\u00E9', category: 'Navigation', action: function() { nav('accounting'); } },
        { id: 'nav-psychoAudit', icon: '\uD83E\uDDE0', title: 'Psycho-Audit', category: 'Navigation', action: function() { nav('psychoAudit'); } },
        { id: 'nav-teamMessaging', icon: '\uD83D\uDCAC', title: 'TeamTalk', category: 'Navigation', action: function() { nav('teamMessaging'); } },
        { id: 'nav-campaigns', icon: '\uD83D\uDE80', title: 'Campagnes', category: 'Navigation', action: function() { nav('campaigns'); } },
        { id: 'nav-gamification', icon: '\uD83C\uDFC6', title: 'Gamification', category: 'Navigation', action: function() { nav('gamification'); } },
        { id: 'nav-behavioral', icon: '\uD83D\uDC64', title: 'Mon Profil', category: 'Navigation', action: function() { nav('behavioral'); } },
        { id: 'nav-teamVision', icon: '\uD83D\uDC65', title: 'Vision \u00E9quipe', category: 'Navigation', action: function() { nav('teamVision'); } },
        { id: 'nav-giriVision', icon: '\uD83D\uDD2E', title: 'Giri Vision', category: 'Navigation', action: function() { nav('giriVision'); } }
    ];

    var ACTION_ITEMS = [
        {
            id: 'act-new-task', icon: '\u2795', title: 'Nouvelle t\u00E2che', category: 'Action',
            action: function() {
                nav('tasks');
                setTimeout(function() {
                    var b = document.querySelector('.add-task-btn, #add-task-btn, [data-action="add-task"]');
                    if (b) b.click();
                    else document.dispatchEvent(new CustomEvent('createTask'));
                }, 200);
            }
        },
        {
            id: 'act-new-project', icon: '\uD83D\uDCC2', title: 'Nouveau projet', category: 'Action',
            action: function() {
                nav('projects');
                setTimeout(function() {
                    if (typeof ProjectsView !== 'undefined' && ProjectsView.showCreateForm) ProjectsView.showCreateForm();
                }, 200);
            }
        },
        {
            id: 'act-new-note', icon: '\uD83D\uDCDD', title: 'Nouvelle note', category: 'Action',
            action: function() {
                nav('notes');
                setTimeout(function() { document.dispatchEvent(new CustomEvent('createNote')); }, 200);
            }
        },
        {
            id: 'act-theme', icon: '\uD83C\uDFA8', title: 'Changer de th\u00E8me', category: 'Action',
            action: function() {
                if (typeof Themes !== 'undefined' && Themes.openThemeModal) Themes.openThemeModal();
            }
        },
        {
            id: 'act-zen', icon: '\uD83E\uDDD8', title: 'Mode Zen', category: 'Action',
            action: function() {
                if (typeof ZenMode !== 'undefined' && ZenMode.toggle) ZenMode.toggle();
            }
        },
        {
            id: 'act-switch-member', icon: '\uD83D\uDD04', title: 'Changer de membre', category: 'Action',
            action: function() {
                if (typeof AuthLogin !== 'undefined' && AuthLogin.switchMember) AuthLogin.switchMember();
            }
        },
        {
            id: 'act-pomodoro', icon: '\uD83C\uDF45', title: 'Pomodoro', category: 'Action',
            action: function() {
                if (typeof PomodoroTimer !== 'undefined' && PomodoroTimer.toggle) PomodoroTimer.toggle();
            }
        },
        {
            id: 'act-kanban', icon: '\uD83D\uDCCB', title: 'Vue Kanban', category: 'Action',
            action: function() {
                nav('tasks');
                setTimeout(function() {
                    if (typeof KanbanBoard !== 'undefined' && KanbanBoard.show) KanbanBoard.show();
                }, 200);
            }
        }
    ];

    function nav(viewId) {
        if (typeof ViewRouter !== 'undefined' && ViewRouter.navigate) ViewRouter.navigate(viewId);
        else if (typeof Router !== 'undefined' && Router.navigate) Router.navigate(viewId);
    }

    function fuzzyMatch(query, text) {
        if (!query) return true;
        var q = query.toLowerCase();
        var t = text.toLowerCase();
        if (t.indexOf(q) !== -1) return true;
        // Simple fuzzy: all chars in order
        var qi = 0;
        for (var ti = 0; ti < t.length && qi < q.length; ti++) {
            if (t[ti] === q[qi]) qi++;
        }
        return qi === q.length;
    }

    function getDynamicTasks() {
        var items = [];
        try {
            if (typeof AppState === 'undefined' || !Array.isArray(AppState.tasks)) return items;
            var tasks = AppState.tasks.slice(0, 20);
            for (var i = 0; i < tasks.length; i++) {
                var t = tasks[i];
                var si = t.status === 'done' || t.status === 'completed' ? '\u2705' : t.status === 'in_progress' ? '\u23F3' : '\u25CB';
                items.push({
                    id: 'task-' + (t.id || i), icon: si,
                    title: t.title || t.name || 'T\u00E2che sans titre',
                    category: 'T\u00E2che',
                    subtitle: t.project_id ? '' : null,
                    action: function() { nav('tasks'); }
                });
            }
        } catch (e) {}
        return items;
    }

    function getDynamicNotes() {
        var items = [];
        try {
            var mid = '';
            if (typeof AppState !== 'undefined' && AppState.currentUser) mid = AppState.currentUser.id || '';
            var sk = mid ? 'productiveapp_notes_' + mid : null;
            var notes = [];
            if (sk) {
                try { var r = localStorage.getItem(sk); if (r) notes = JSON.parse(r); } catch (e) {}
            }
            notes = (notes || []).slice(0, 15);
            for (var i = 0; i < notes.length; i++) {
                var n = notes[i];
                items.push({
                    id: 'note-' + (n.id || i), icon: '\uD83D\uDCDD',
                    title: n.title || 'Note sans titre',
                    category: 'Note',
                    action: function() { nav('notes'); }
                });
            }
        } catch (e) {}
        return items;
    }

    function getAllItems() {
        return [].concat(NAV_ITEMS, ACTION_ITEMS, getDynamicTasks(), getDynamicNotes());
    }

    function filterItems(query) {
        var all = getAllItems();
        if (!query || !query.trim()) return all;
        return all.filter(function(it) {
            return fuzzyMatch(query, it.title) || fuzzyMatch(query, it.category);
        });
    }

    function createDOM() {
        if (backdropEl) return;
        backdropEl = document.createElement('div');
        backdropEl.className = 'cmd-palette-backdrop';
        backdropEl.setAttribute('role', 'dialog');
        backdropEl.setAttribute('aria-label', 'Palette de commandes');

        var h = '<div class="cmd-palette-modal">';
        h += '<div class="cmd-palette-search">';
        h += '<div class="cmd-palette-search-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>';
        h += '<input class="cmd-palette-input" type="text" placeholder="Rechercher une page, t\u00E2che, note, action\u2026" autocomplete="off" spellcheck="false" />';
        h += '<div class="cmd-palette-kbd"><kbd>Esc</kbd></div>';
        h += '</div>';
        h += '<div class="cmd-palette-results"></div>';
        h += '<div class="cmd-palette-footer">';
        h += '<span class="cmd-palette-footer-hint"><kbd>\u2191</kbd><kbd>\u2193</kbd> naviguer</span>';
        h += '<span class="cmd-palette-footer-hint"><kbd>\u21B5</kbd> s\u00E9lectionner</span>';
        h += '<span class="cmd-palette-footer-hint"><kbd>Esc</kbd> fermer</span>';
        h += '</div></div>';

        backdropEl.innerHTML = h;
        document.body.appendChild(backdropEl);

        inputEl = backdropEl.querySelector('.cmd-palette-input');
        resultsEl = backdropEl.querySelector('.cmd-palette-results');

        backdropEl.addEventListener('mousedown', function(e) { if (e.target === backdropEl) close(); });

        inputEl.addEventListener('input', function() {
            filteredItems = filterItems(inputEl.value);
            activeIndex = 0;
            renderResults();
        });

        inputEl.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (filteredItems.length > 0) { activeIndex = (activeIndex + 1) % filteredItems.length; renderResults(); scrollToActive(); }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (filteredItems.length > 0) { activeIndex = (activeIndex - 1 + filteredItems.length) % filteredItems.length; renderResults(); scrollToActive(); }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                selectActive();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                close();
            }
        });
    }

    function renderResults() {
        if (!resultsEl) return;
        if (!filteredItems.length) {
            resultsEl.innerHTML = '<div class="cmd-palette-empty"><div class="cmd-palette-empty-icon">\uD83D\uDD0D</div>Aucun r\u00E9sultat trouv\u00E9</div>';
            return;
        }
        var html = '', lastCat = '';
        for (var i = 0; i < filteredItems.length; i++) {
            var it = filteredItems[i];
            if (it.category !== lastCat) { lastCat = it.category; html += '<div class="cmd-palette-category">' + esc(it.category) + '</div>'; }
            html += '<div class="cmd-palette-item' + (i === activeIndex ? ' active' : '') + '" data-index="' + i + '">';
            html += '<div class="cmd-palette-item-icon">' + it.icon + '</div>';
            html += '<div class="cmd-palette-item-content"><div class="cmd-palette-item-title">' + esc(it.title) + '</div>';
            if (it.subtitle) html += '<div class="cmd-palette-item-subtitle">' + esc(it.subtitle) + '</div>';
            html += '</div>';
            html += '<span class="cmd-palette-tag">' + esc(it.category) + '</span>';
            html += '</div>';
        }
        resultsEl.innerHTML = html;

        var els = resultsEl.querySelectorAll('.cmd-palette-item');
        for (var j = 0; j < els.length; j++) {
            (function(el) {
                el.addEventListener('click', function() {
                    var idx = parseInt(el.getAttribute('data-index'), 10);
                    if (!isNaN(idx) && filteredItems[idx]) { activeIndex = idx; selectActive(); }
                });
                el.addEventListener('mouseenter', function() {
                    var idx = parseInt(el.getAttribute('data-index'), 10);
                    if (!isNaN(idx)) {
                        activeIndex = idx;
                        var all = resultsEl.querySelectorAll('.cmd-palette-item');
                        for (var k = 0; k < all.length; k++) all[k].classList.toggle('active', k === activeIndex);
                    }
                });
            })(els[j]);
        }
    }

    function scrollToActive() {
        if (!resultsEl) return;
        var el = resultsEl.querySelector('.cmd-palette-item.active');
        if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function selectActive() {
        if (!filteredItems.length) return;
        var it = filteredItems[activeIndex];
        if (it && typeof it.action === 'function') {
            close();
            setTimeout(function() { it.action(); }, 50);
        }
    }

    function esc(s) {
        if (!s) return '';
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(s));
        return d.innerHTML;
    }

    function open() {
        if (isOpen) return;
        isOpen = true;
        createDOM();
        inputEl.value = '';
        activeIndex = 0;
        filteredItems = filterItems('');
        renderResults();
        backdropEl.classList.add('active');
        requestAnimationFrame(function() { inputEl.focus(); });
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;
        if (backdropEl) backdropEl.classList.remove('active');
    }

    function toggle() { isOpen ? close() : open(); }

    function init() {
        if (initialized) return;
        initialized = true;
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                e.stopPropagation();
                toggle();
            }
        }, true);
    }

    return { init: init, open: open, close: close, toggle: toggle };
})();

if (typeof window !== 'undefined') window.CommandPalette = CommandPalette;
