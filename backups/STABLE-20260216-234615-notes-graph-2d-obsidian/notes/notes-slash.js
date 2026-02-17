/**
 * NOTES SLASH COMMANDS - Notion-style commands
 * ProductiveApp v4.0
 */

const NotesSlash = (function() {
    'use strict';

    let menuOpen = false;
    let menuEl = null;
    let selectedIndex = 0;

    // Available commands
    const commands = [
        { id: 'h1', label: 'Titre 1', icon: 'H1', insert: '# ', desc: 'Grand titre' },
        { id: 'h2', label: 'Titre 2', icon: 'H2', insert: '## ', desc: 'Titre moyen' },
        { id: 'h3', label: 'Titre 3', icon: 'H3', insert: '### ', desc: 'Petit titre' },
        { id: 'bullet', label: 'Liste', icon: '•', insert: '- ', desc: 'Liste à puces' },
        { id: 'numbered', label: 'Numérotée', icon: '1.', insert: '1. ', desc: 'Liste numérotée' },
        { id: 'todo', label: 'To-do', icon: '☐', insert: '- [ ] ', desc: 'Checklist' },
        { id: 'code', label: 'Code', icon: '</>', insert: '```\n\n```', desc: 'Bloc de code' },
        { id: 'quote', label: 'Citation', icon: '"', insert: '> ', desc: 'Citation' },
        { id: 'divider', label: 'Séparateur', icon: '—', insert: '\n---\n', desc: 'Ligne horizontale' },
        { id: 'image', label: 'Image', icon: '🖼', insert: '![](url)', desc: 'Insérer une image' },
        { id: 'link', label: 'Lien', icon: '🔗', insert: '[texte](url)', desc: 'Insérer un lien' }
    ];

    /**
     * Create menu element
     */
    function createMenu() {
        if (menuEl) return;

        menuEl = document.createElement('div');
        menuEl.id = 'slash-menu';
        menuEl.className = 'slash-menu';
        menuEl.innerHTML = `
            <div class="slash-menu-header">Commandes</div>
            <div class="slash-menu-list"></div>
        `;
        document.body.appendChild(menuEl);
    }

    /**
     * Show menu
     */
    function show(textarea, position) {
        createMenu();

        const rect = textarea.getBoundingClientRect();
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;

        // Calculate position
        const lines = textarea.value.substring(0, position).split('\n');
        const currentLine = lines.length - 1;
        const top = rect.top + (currentLine * lineHeight) + 30;
        const left = rect.left + 20;

        menuEl.style.top = `${top}px`;
        menuEl.style.left = `${left}px`;

        // Render commands
        renderCommands('');

        menuEl.classList.add('active');
        menuOpen = true;
        selectedIndex = 0;
    }

    /**
     * Hide menu
     */
    function hide() {
        if (menuEl) {
            menuEl.classList.remove('active');
        }
        menuOpen = false;
    }

    /**
     * Render commands
     */
    function renderCommands(filter) {
        if (!menuEl) return;

        const list = menuEl.querySelector('.slash-menu-list');
        const filtered = filter
            ? commands.filter(c => c.label.toLowerCase().includes(filter.toLowerCase()))
            : commands;

        list.innerHTML = filtered.map((cmd, i) => `
            <div class="slash-menu-item ${i === selectedIndex ? 'selected' : ''}"
                 data-id="${cmd.id}"
                 onmouseenter="NotesSlash.selectIndex(${i})"
                 onclick="NotesSlash.executeCommand('${cmd.id}')">
                <span class="slash-menu-icon">${cmd.icon}</span>
                <div class="slash-menu-content">
                    <span class="slash-menu-label">${cmd.label}</span>
                    <span class="slash-menu-desc">${cmd.desc}</span>
                </div>
            </div>
        `).join('');

        if (filtered.length === 0) {
            list.innerHTML = '<div class="slash-menu-empty">Aucune commande trouvée</div>';
        }
    }

    /**
     * Select index
     */
    function selectIndex(index) {
        selectedIndex = index;
        updateSelection();
    }

    /**
     * Update selection visual
     */
    function updateSelection() {
        if (!menuEl) return;

        const items = menuEl.querySelectorAll('.slash-menu-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === selectedIndex);
        });
    }

    /**
     * Execute command
     */
    function executeCommand(id) {
        const cmd = commands.find(c => c.id === id);
        if (!cmd) return;

        const textarea = document.querySelector('.note-textarea');
        if (!textarea) return;

        // Find and remove the / command
        const pos = textarea.selectionStart;
        const text = textarea.value;
        const beforeCursor = text.substring(0, pos);
        const slashIndex = beforeCursor.lastIndexOf('/');

        if (slashIndex !== -1) {
            const afterSlash = text.substring(pos);
            textarea.value = text.substring(0, slashIndex) + cmd.insert + afterSlash;

            // Position cursor
            const newPos = slashIndex + cmd.insert.length;
            textarea.setSelectionRange(newPos, newPos);
        }

        textarea.focus();
        hide();

        // Trigger autosave
        NotesEditor.handleAutoSave();
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeydown(e) {
        if (!menuOpen) return false;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, commands.length - 1);
                updateSelection();
                return true;

            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                updateSelection();
                return true;

            case 'Enter':
                e.preventDefault();
                const items = menuEl.querySelectorAll('.slash-menu-item');
                if (items[selectedIndex]) {
                    const id = items[selectedIndex].dataset.id;
                    executeCommand(id);
                }
                return true;

            case 'Escape':
                e.preventDefault();
                hide();
                return true;
        }

        return false;
    }

    /**
     * Handle input
     */
    function handleInput(textarea) {
        const pos = textarea.selectionStart;
        const text = textarea.value;
        const beforeCursor = text.substring(0, pos);

        // Check for / at start of line or after space
        const lines = beforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];
        const slashMatch = currentLine.match(/\/(\w*)$/);

        if (slashMatch) {
            const filter = slashMatch[1];
            if (!menuOpen) {
                show(textarea, pos);
            }
            renderCommands(filter);
        } else if (menuOpen) {
            hide();
        }
    }

    /**
     * Initialize
     */
    function init() {
        createMenu();
    }

    return {
        commands,
        show,
        hide,
        selectIndex,
        executeCommand,
        handleKeydown,
        handleInput,
        init,
        get isOpen() { return menuOpen; }
    };
})();

if (typeof window !== 'undefined') {
    window.NotesSlash = NotesSlash;
}
