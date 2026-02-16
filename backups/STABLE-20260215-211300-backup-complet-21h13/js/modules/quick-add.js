/**
 * ================================================
 * QUICK-ADD FAB + ZEN MODE - ProductiveApp v1.0
 * Premium floating action button with radial menu
 * Focus/Zen mode for distraction-free work
 * ================================================
 */

/* ================================================
   QUICK-ADD MODULE
   ================================================ */
var QuickAdd = (function() {
    'use strict';

    var isOpen = false;
    var fabEl = null;
    var menuEl = null;
    var backdropEl = null;
    var initialized = false;

    var SVG_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

    var MENU_ITEMS = [
        {
            id: 'quick-add-task', label: 'Nouvelle t\u00e2che',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
            action: function() {
                navigateTo('tasks');
                setTimeout(function() {
                    var taskInput = document.getElementById('task-input');
                    if (taskInput) { taskInput.focus(); taskInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
                    document.dispatchEvent(new CustomEvent('createTask', { detail: { source: 'quick-add' } }));
                }, 300);
            }
        },
        {
            id: 'quick-add-project', label: 'Nouveau projet',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
            action: function() {
                navigateTo('projects');
                setTimeout(function() {
                    if (typeof ProjectsView !== 'undefined' && ProjectsView.openCreateModal) { ProjectsView.openCreateModal(); return; }
                    document.dispatchEvent(new CustomEvent('createProject', { detail: { source: 'quick-add' } }));
                }, 300);
            }
        },
        {
            id: 'quick-add-note', label: 'Nouvelle note',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
            action: function() {
                navigateTo('notes');
                setTimeout(function() {
                    if (typeof NotesModule !== 'undefined' && NotesModule.createNew) { NotesModule.createNew(); return; }
                    document.dispatchEvent(new CustomEvent('createNote', { detail: { source: 'quick-add' } }));
                }, 300);
            }
        },
        {
            id: 'quick-add-meeting', label: 'R\u00e9union rapide',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
            action: function() { navigateTo('giriVision'); }
        }
    ];

    function init() {
        if (initialized) return;
        initialized = true;
        createDOM();
        bindEvents();
    }

    function createDOM() {
        backdropEl = document.createElement('div');
        backdropEl.className = 'quick-add-backdrop';

        menuEl = document.createElement('div');
        menuEl.className = 'quick-add-menu';
        menuEl.setAttribute('role', 'menu');
        menuEl.setAttribute('aria-label', 'Actions rapides');

        for (var i = 0; i < MENU_ITEMS.length; i++) {
            var item = MENU_ITEMS[i];
            var btn = document.createElement('button');
            btn.className = 'quick-add-menu-item';
            btn.id = item.id;
            btn.setAttribute('role', 'menuitem');
            btn.setAttribute('aria-label', item.label);
            btn.setAttribute('tabindex', '-1');
            btn.innerHTML = item.icon + '<span class="quick-add-tooltip">' + item.label + '</span>';

            (function(actionFn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    close();
                    setTimeout(function() { actionFn(); }, 150);
                });
            })(item.action);

            menuEl.appendChild(btn);
        }

        fabEl = document.createElement('button');
        fabEl.className = 'quick-add-fab';
        fabEl.setAttribute('aria-label', 'Ajouter rapidement');
        fabEl.setAttribute('aria-haspopup', 'true');
        fabEl.setAttribute('aria-expanded', 'false');
        fabEl.innerHTML = SVG_PLUS;

        document.body.appendChild(backdropEl);
        document.body.appendChild(menuEl);
        document.body.appendChild(fabEl);
    }

    function bindEvents() {
        fabEl.addEventListener('click', function(e) { e.stopPropagation(); toggle(); });
        backdropEl.addEventListener('click', function(e) { e.stopPropagation(); close(); });
        document.addEventListener('click', function(e) {
            if (isOpen && !menuEl.contains(e.target) && !fabEl.contains(e.target)) close();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) { e.stopPropagation(); close(); }
        });
    }

    function toggle() { isOpen ? close() : open(); }

    function open() {
        isOpen = true;
        fabEl.classList.add('open');
        fabEl.setAttribute('aria-expanded', 'true');
        menuEl.classList.add('open');
        backdropEl.classList.add('visible');
        var firstItem = menuEl.querySelector('.quick-add-menu-item');
        if (firstItem) setTimeout(function() { firstItem.focus(); }, 200);
    }

    function close() {
        isOpen = false;
        fabEl.classList.remove('open');
        fabEl.setAttribute('aria-expanded', 'false');
        menuEl.classList.remove('open');
        backdropEl.classList.remove('visible');
    }

    function navigateTo(route) {
        if (typeof ViewRouter !== 'undefined' && ViewRouter.navigate) ViewRouter.navigate(route);
        else if (typeof Router !== 'undefined' && Router.navigate) Router.navigate(route);
    }

    return {
        init: init, open: open, close: close, toggle: toggle,
        isOpen: function() { return isOpen; }
    };
})();

if (typeof window !== 'undefined') window.QuickAdd = QuickAdd;


/* ================================================
   ZEN MODE MODULE
   ================================================ */
var ZenMode = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_zen_mode';
    var active = false;
    var barEl = null;
    var initialized = false;

    function init() {
        if (initialized) return;
        initialized = true;
        createBar();
        bindEvents();
        restoreState();
    }

    function createBar() {
        barEl = document.createElement('div');
        barEl.className = 'zen-mode-bar';
        barEl.setAttribute('role', 'status');
        barEl.setAttribute('aria-live', 'polite');
        barEl.innerHTML =
            '<span class="zen-mode-bar-label">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' +
                ' Mode Zen actif' +
            '</span>' +
            '<span class="zen-mode-bar-separator"></span>' +
            '<span class="zen-mode-bar-hint">Appuyez \u00C9chap pour quitter</span>' +
            '<button class="zen-mode-bar-exit" aria-label="Quitter le mode Zen">Quitter</button>';

        barEl.querySelector('.zen-mode-bar-exit').addEventListener('click', function(e) {
            e.stopPropagation();
            deactivate();
        });
        document.body.appendChild(barEl);
    }

    function bindEvents() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && active) {
                if (typeof QuickAdd !== 'undefined' && QuickAdd.isOpen && QuickAdd.isOpen()) return;
                e.preventDefault();
                deactivate();
            }
        });
        document.addEventListener('toggleZenMode', function() { toggle(); });
    }

    function saveState() {
        try { localStorage.setItem(STORAGE_KEY, active ? '1' : '0'); } catch (e) {}
    }

    function restoreState() {
        try { if (localStorage.getItem(STORAGE_KEY) === '1') activate(); } catch (e) {}
    }

    function activate() {
        if (active) return;
        active = true;
        document.body.classList.add('zen-mode');
        saveState();
        if (typeof QuickAdd !== 'undefined' && QuickAdd.isOpen && QuickAdd.isOpen()) QuickAdd.close();
    }

    function deactivate() {
        if (!active) return;
        active = false;
        document.body.classList.remove('zen-mode');
        saveState();
    }

    function toggle() { active ? deactivate() : activate(); }

    return {
        init: init, toggle: toggle, activate: activate, deactivate: deactivate,
        isActive: function() { return active; }
    };
})();

if (typeof window !== 'undefined') window.ZenMode = ZenMode;
