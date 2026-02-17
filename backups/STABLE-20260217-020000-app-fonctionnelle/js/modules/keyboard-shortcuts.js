// =============================================
// PRODUCTIVEAPP - KEYBOARD SHORTCUTS SYSTEM
// Global keyboard navigation + help overlay
// =============================================

const KeyboardShortcuts = (function() {
    'use strict';

    let overlayEl = null;
    let isOpen = false;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? '⌘' : 'Ctrl';

    const SHORTCUTS = [
        {
            section: 'Navigation',
            items: [
                { keys: [modKey, 'K'], label: 'Palette de commandes', action: () => { if (typeof CommandPalette !== 'undefined') CommandPalette.toggle(); }},
                { keys: ['G', 'D'], label: 'Tableau de bord', action: () => nav('dashboard') },
                { keys: ['G', 'T'], label: 'Tâches', action: () => nav('tasks') },
                { keys: ['G', 'P'], label: 'Projets', action: () => nav('projects') },
                { keys: ['G', 'N'], label: 'Notes', action: () => nav('notes') },
                { keys: ['G', 'R'], label: 'Rapports', action: () => nav('reports') },
                { keys: ['G', 'S'], label: 'Paramètres', action: () => nav('settings') },
                { keys: ['G', 'A'], label: 'Analytique', action: () => nav('analytics') },
                { keys: ['G', 'C'], label: 'Comptabilité', action: () => nav('accounting') },
            ]
        },
        {
            section: 'Actions rapides',
            items: [
                { keys: ['N'], label: 'Nouvelle tâche', action: () => dispatchAction('createTask') },
                { keys: [modKey, 'Shift', 'N'], label: 'Nouvelle note', action: () => { nav('notes'); setTimeout(() => dispatchAction('createNote'), 300); }},
                { keys: ['Z'], label: 'Mode Zen', action: () => { if (typeof ZenMode !== 'undefined') ZenMode.toggle(); }},
                { keys: ['T'], label: 'Changer de thème', action: () => { if (typeof Themes !== 'undefined') Themes.openThemeModal(); }},
            ]
        },
        {
            section: 'Productivité',
            items: [
                { keys: [modKey, 'Shift', 'P'], label: 'Pomodoro', action: () => { if (typeof PomodoroTimer !== 'undefined') PomodoroTimer.toggle(); }},
                { keys: ['Espace'], label: 'Play/Pause Pomodoro', action: () => { if (typeof PomodoroTimer !== 'undefined') PomodoroTimer.togglePlay(); }},
            ]
        },
        {
            section: 'Général',
            items: [
                { keys: ['Shift', '?'], label: 'Raccourcis clavier', action: () => toggle() },
                { keys: ['Esc'], label: 'Fermer le panneau actif', action: null },
            ]
        }
    ];

    let pendingG = false;
    let pendingTimer = null;

    function nav(viewId) {
        if (typeof ViewRouter !== 'undefined') ViewRouter.navigate(viewId);
        else if (typeof Router !== 'undefined') Router.navigate(viewId);
    }

    function dispatchAction(name) {
        document.dispatchEvent(new CustomEvent(name));
    }

    function isInputFocused() {
        var el = document.activeElement;
        if (!el) return false;
        var tag = el.tagName.toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
    }

    function handleKeyDown(e) {
        // Always allow Escape
        if (e.key === 'Escape') {
            if (isOpen) { close(); e.preventDefault(); return; }
            return;
        }

        // Shift+? opens shortcuts overlay
        if (e.key === '?' && e.shiftKey && !isInputFocused()) {
            e.preventDefault();
            toggle();
            return;
        }

        // Cmd/Ctrl+K - command palette
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (typeof CommandPalette !== 'undefined') CommandPalette.toggle();
            return;
        }

        // Cmd/Ctrl+Shift+N - new note
        if (e.key === 'N' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
            e.preventDefault();
            nav('notes');
            setTimeout(() => dispatchAction('createNote'), 300);
            return;
        }

        // Cmd/Ctrl+Shift+P - pomodoro
        if (e.key === 'P' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
            e.preventDefault();
            if (typeof PomodoroTimer !== 'undefined') PomodoroTimer.toggle();
            return;
        }

        // Skip if input is focused for remaining shortcuts
        if (isInputFocused()) return;
        if (isOpen) return;

        // G + letter navigation
        if (pendingG) {
            clearTimeout(pendingTimer);
            pendingG = false;
            var key = e.key.toLowerCase();
            var map = { d: 'dashboard', t: 'tasks', p: 'projects', n: 'notes', r: 'reports', s: 'settings', a: 'analytics', c: 'accounting' };
            if (map[key]) {
                e.preventDefault();
                nav(map[key]);
                return;
            }
        }

        if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
            pendingG = true;
            pendingTimer = setTimeout(function() { pendingG = false; }, 800);
            return;
        }

        // Single key shortcuts
        if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            dispatchAction('createTask');
            return;
        }

        if (e.key === 'z' && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            if (typeof ZenMode !== 'undefined') ZenMode.toggle();
            return;
        }

        if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            if (typeof Themes !== 'undefined') Themes.openThemeModal();
            return;
        }

        if (e.key === ' ' && !e.metaKey && !e.ctrlKey) {
            if (typeof PomodoroTimer !== 'undefined' && PomodoroTimer.isVisible && PomodoroTimer.isVisible()) {
                e.preventDefault();
                PomodoroTimer.togglePlay();
            }
        }
    }

    function createOverlay() {
        if (overlayEl) return;

        overlayEl = document.createElement('div');
        overlayEl.className = 'kb-overlay';
        overlayEl.innerHTML = '<div class="kb-card">' +
            '<div class="kb-header">' +
                '<div class="kb-title">' +
                    '<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="6" y1="16" x2="6" y2="16"/><line x1="10" y1="16" x2="14" y2="16"/><line x1="18" y1="16" x2="18" y2="16"/></svg>' +
                    'Raccourcis clavier' +
                '</div>' +
                '<button class="kb-close" id="kb-close-btn">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                '</button>' +
            '</div>' +
            '<div class="kb-content">' + buildSections() + '</div>' +
            '<div class="kb-footer">Appuyez <span class="kb-key" style="display:inline-flex;vertical-align:middle">Shift</span> <span class="kb-plus">+</span> <span class="kb-key" style="display:inline-flex;vertical-align:middle">?</span> pour ouvrir/fermer</div>' +
        '</div>';

        document.body.appendChild(overlayEl);

        overlayEl.addEventListener('click', function(e) {
            if (e.target === overlayEl) close();
        });

        document.getElementById('kb-close-btn').addEventListener('click', close);
    }

    function buildSections() {
        var html = '';
        for (var s = 0; s < SHORTCUTS.length; s++) {
            var sec = SHORTCUTS[s];
            html += '<div class="kb-section">';
            html += '<div class="kb-section-title">' + sec.section + '</div>';
            for (var i = 0; i < sec.items.length; i++) {
                var item = sec.items[i];
                html += '<div class="kb-row">';
                html += '<span class="kb-label">' + item.label + '</span>';
                html += '<span class="kb-keys">';
                for (var k = 0; k < item.keys.length; k++) {
                    if (k > 0) html += '<span class="kb-plus">+</span>';
                    html += '<span class="kb-key">' + item.keys[k] + '</span>';
                }
                html += '</span>';
                html += '</div>';
            }
            html += '</div>';
        }
        return html;
    }

    function open() {
        createOverlay();
        requestAnimationFrame(function() {
            overlayEl.classList.add('active');
        });
        isOpen = true;
    }

    function close() {
        if (overlayEl) {
            overlayEl.classList.remove('active');
        }
        isOpen = false;
    }

    function toggle() {
        if (isOpen) close(); else open();
    }

    function init() {
        document.addEventListener('keydown', handleKeyDown);
    }

    return {
        init: init,
        open: open,
        close: close,
        toggle: toggle
    };
})();

if (typeof window !== 'undefined') {
    window.KeyboardShortcuts = KeyboardShortcuts;
}
