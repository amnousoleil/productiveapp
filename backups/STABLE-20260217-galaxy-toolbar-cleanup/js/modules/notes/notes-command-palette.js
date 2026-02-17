/**
 * NOTES COMMAND PALETTE - Ultra-fast navigation & commands
 * ProductiveApp v6.0 - World Class Edition
 *
 * Features:
 * - Fuzzy search across notes, commands, tags
 * - Keyboard navigation (↑↓ Enter Esc)
 * - Recent notes tracking
 * - AI-powered suggestions
 * - Ctrl+P shortcut
 */

const NotesCommandPalette = (function() {
    'use strict';

    let isOpen = false;
    let modalEl = null;
    let inputEl = null;
    let resultsEl = null;
    let selectedIndex = 0;
    let currentQuery = '';
    let currentResults = [];
    let recentNotes = [];

    const MAX_RECENT = 10;
    const MAX_RESULTS = 50;

    // ========== INITIALIZATION ==========

    function init() {
        console.log('⌨️  NotesCommandPalette: Initializing');
        loadRecentNotes();
        attachKeyboardShortcut();
        createModal();
    }

    function loadRecentNotes() {
        try {
            const saved = localStorage.getItem('productiveapp_notes_recent_v6');
            if (saved) {
                recentNotes = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load recent notes', e);
        }
    }

    function saveRecentNotes() {
        try {
            localStorage.setItem('productiveapp_notes_recent_v6', JSON.stringify(recentNotes));
        } catch (e) {
            console.warn('Failed to save recent notes', e);
        }
    }

    function addRecentNote(noteId) {
        // Remove if already exists
        recentNotes = recentNotes.filter(id => id !== noteId);
        // Add to front
        recentNotes.unshift(noteId);
        // Keep max size
        if (recentNotes.length > MAX_RECENT) {
            recentNotes = recentNotes.slice(0, MAX_RECENT);
        }
        saveRecentNotes();
    }

    // ========== KEYBOARD SHORTCUT ==========

    function attachKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+P or Cmd+P
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                open();
            }

            // Ctrl+K (alternative)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !e.shiftKey) {
                e.preventDefault();
                open();
            }

            // Esc to close
            if (e.key === 'Escape' && isOpen) {
                close();
            }
        });

        console.log('  ✓ Keyboard shortcuts registered (Ctrl+P, Ctrl+K)');
    }

    // ========== MODAL ==========

    function createModal() {
        modalEl = document.createElement('div');
        modalEl.className = 'notes-command-palette-overlay';
        modalEl.style.display = 'none';

        modalEl.innerHTML = `
            <div class="notes-command-palette">
                <div class="notes-command-palette-header">
                    <svg class="notes-command-palette-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text"
                           class="notes-command-palette-input"
                           placeholder="Rechercher notes, commandes, tags..."
                           autocomplete="off"
                           spellcheck="false">
                    <kbd class="notes-command-palette-hint">Esc</kbd>
                </div>
                <div class="notes-command-palette-results"></div>
                <div class="notes-command-palette-footer">
                    <div class="notes-command-palette-shortcuts">
                        <span><kbd>↑↓</kbd> Navigation</span>
                        <span><kbd>Enter</kbd> Sélectionner</span>
                        <span><kbd>Esc</kbd> Fermer</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalEl);

        inputEl = modalEl.querySelector('.notes-command-palette-input');
        resultsEl = modalEl.querySelector('.notes-command-palette-results');

        // Click outside to close
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                close();
            }
        });

        // Input handler
        inputEl.addEventListener('input', handleInput);

        // Keyboard navigation
        inputEl.addEventListener('keydown', handleKeydown);
    }

    // ========== OPEN/CLOSE ==========

    function open() {
        if (isOpen) return;

        isOpen = true;
        modalEl.style.display = 'flex';
        currentQuery = '';
        selectedIndex = 0;

        // Clear and focus
        inputEl.value = '';
        inputEl.focus();

        // Show recent notes by default
        showRecentNotes();

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    function close() {
        if (!isOpen) return;

        isOpen = false;
        modalEl.style.display = 'none';
        document.body.style.overflow = '';
    }

    // ========== INPUT HANDLING ==========

    function handleInput(e) {
        currentQuery = e.target.value.trim();
        selectedIndex = 0;

        if (!currentQuery) {
            showRecentNotes();
            return;
        }

        // Search
        search(currentQuery);
    }

    function handleKeydown(e) {
        const totalResults = currentResults.length;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % totalResults;
            renderResults();
            scrollToSelected();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = selectedIndex === 0 ? totalResults - 1 : selectedIndex - 1;
            renderResults();
            scrollToSelected();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentResults[selectedIndex]) {
                executeResult(currentResults[selectedIndex]);
            }
        }
    }

    function scrollToSelected() {
        const selectedEl = resultsEl.querySelector('.notes-command-result.selected');
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    // ========== SEARCH ==========

    function search(query) {
        currentResults = [];

        // Search notes
        const notes = searchNotes(query);
        currentResults.push(...notes);

        // Search commands
        const commands = searchCommands(query);
        currentResults.push(...commands);

        // Search tags
        const tags = searchTags(query);
        currentResults.push(...tags);

        // Limit results
        if (currentResults.length > MAX_RESULTS) {
            currentResults = currentResults.slice(0, MAX_RESULTS);
        }

        renderResults();
    }

    function searchNotes(query) {
        if (typeof NotesModule === 'undefined') return [];

        const notes = NotesModule.getNotes();
        const lowerQuery = query.toLowerCase();

        return notes
            .filter(note => {
                const title = (note.title || '').toLowerCase();
                const content = (note.content || '').toLowerCase();
                return fuzzyMatch(title, lowerQuery) || fuzzyMatch(content, lowerQuery);
            })
            .slice(0, 20)
            .map(note => ({
                type: 'note',
                id: note.id,
                title: note.title || 'Sans titre',
                subtitle: note.content ? note.content.substring(0, 80) + '...' : '',
                icon: '📄',
                score: calculateScore(note.title, query)
            }))
            .sort((a, b) => b.score - a.score);
    }

    function searchCommands(query) {
        const commands = [
            { id: 'new-note', title: 'Nouvelle note', subtitle: 'Créer une nouvelle note vide', icon: '➕', keywords: ['new', 'create', 'nouveau', 'creer'] },
            { id: 'new-daily', title: 'Note du jour', subtitle: 'Créer/ouvrir la note quotidienne', icon: '📅', keywords: ['daily', 'today', 'jour', 'quotidien'] },
            { id: 'graph-view', title: 'Vue Graph 3D', subtitle: 'Ouvrir la visualisation 3D des notes', icon: '🌐', keywords: ['graph', 'visual', 'vue', '3d'] },
            { id: 'export-all', title: 'Exporter toutes les notes', subtitle: 'Export Markdown ZIP', icon: '📦', keywords: ['export', 'download', 'backup'] },
            { id: 'ai-summary', title: 'Résumé IA de toutes mes notes', subtitle: 'Génération IA', icon: '🧠', keywords: ['ai', 'summary', 'resume', 'ia'] },
            { id: 'settings', title: 'Paramètres Notes', subtitle: 'Configuration et préférences', icon: '⚙️', keywords: ['settings', 'config', 'parametres'] }
        ];

        const lowerQuery = query.toLowerCase();

        return commands
            .filter(cmd => {
                const titleMatch = fuzzyMatch(cmd.title.toLowerCase(), lowerQuery);
                const keywordMatch = cmd.keywords.some(kw => fuzzyMatch(kw, lowerQuery));
                return titleMatch || keywordMatch;
            })
            .map(cmd => ({
                type: 'command',
                id: cmd.id,
                title: cmd.title,
                subtitle: cmd.subtitle,
                icon: cmd.icon,
                score: calculateScore(cmd.title, query)
            }));
    }

    function searchTags(query) {
        if (typeof NotesModule === 'undefined') return [];

        const notes = NotesModule.getNotes();
        const tagsSet = new Set();

        notes.forEach(note => {
            if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach(tag => tagsSet.add(tag));
            }
        });

        const lowerQuery = query.toLowerCase();

        return Array.from(tagsSet)
            .filter(tag => fuzzyMatch(tag.toLowerCase(), lowerQuery))
            .slice(0, 10)
            .map(tag => ({
                type: 'tag',
                id: tag,
                title: `#${tag}`,
                subtitle: `Filtrer par tag`,
                icon: '🏷️',
                score: calculateScore(tag, query)
            }));
    }

    // ========== RECENT NOTES ==========

    function showRecentNotes() {
        if (typeof NotesModule === 'undefined') {
            currentResults = [];
            renderResults();
            return;
        }

        const notes = NotesModule.getNotes();
        currentResults = recentNotes
            .map(id => notes.find(n => n.id === id))
            .filter(Boolean)
            .slice(0, 10)
            .map(note => ({
                type: 'note',
                id: note.id,
                title: note.title || 'Sans titre',
                subtitle: note.content ? note.content.substring(0, 80) + '...' : '',
                icon: '🕐',
                score: 0
            }));

        renderResults();
    }

    // ========== RENDER ==========

    function renderResults() {
        if (currentResults.length === 0) {
            resultsEl.innerHTML = `
                <div class="notes-command-empty">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <p>Aucun résultat trouvé</p>
                </div>
            `;
            return;
        }

        resultsEl.innerHTML = currentResults.map((result, index) => {
            const isSelected = index === selectedIndex;
            const typeClass = `type-${result.type}`;

            return `
                <div class="notes-command-result ${typeClass} ${isSelected ? 'selected' : ''}"
                     data-index="${index}"
                     onmouseenter="NotesCommandPalette.selectIndex(${index})"
                     onclick="NotesCommandPalette.executeIndex(${index})">
                    <span class="notes-command-result-icon">${result.icon}</span>
                    <div class="notes-command-result-content">
                        <div class="notes-command-result-title">${escapeHtml(result.title)}</div>
                        ${result.subtitle ? `<div class="notes-command-result-subtitle">${escapeHtml(result.subtitle)}</div>` : ''}
                    </div>
                    <div class="notes-command-result-meta">
                        ${result.type === 'note' ? '<span class="badge">Note</span>' : ''}
                        ${result.type === 'command' ? '<span class="badge command">Action</span>' : ''}
                        ${result.type === 'tag' ? '<span class="badge tag">Tag</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function selectIndex(index) {
        selectedIndex = index;
        renderResults();
    }

    function executeIndex(index) {
        if (currentResults[index]) {
            executeResult(currentResults[index]);
        }
    }

    // ========== EXECUTE ==========

    function executeResult(result) {
        close();

        switch(result.type) {
            case 'note':
                openNote(result.id);
                addRecentNote(result.id);
                break;
            case 'command':
                executeCommand(result.id);
                break;
            case 'tag':
                filterByTag(result.id);
                break;
        }
    }

    function openNote(noteId) {
        if (typeof NotesModule !== 'undefined' && NotesModule.setCurrentNote) {
            NotesModule.setCurrentNote(noteId);
            if (typeof NotesModule.render === 'function') {
                NotesModule.render();
            }
        }

        if (typeof Toast !== 'undefined') {
            const note = NotesModule.getCurrentNote();
            Toast.success(`Note ouverte : ${note.title || 'Sans titre'}`);
        }
    }

    function executeCommand(commandId) {
        switch(commandId) {
            case 'new-note':
                if (typeof NotesModule !== 'undefined' && NotesModule.createNew) {
                    NotesModule.createNew();
                }
                break;
            case 'new-daily':
                if (typeof NotesDailyView !== 'undefined' && NotesDailyView.openToday) {
                    NotesDailyView.openToday();
                }
                break;
            case 'graph-view':
                if (typeof NotesGraphView !== 'undefined' && NotesGraphView.open) {
                    NotesGraphView.open();
                }
                break;
            case 'export-all':
                if (typeof NotesModule !== 'undefined') {
                    exportAllNotes();
                }
                break;
            case 'ai-summary':
                if (typeof NotesAiBridge !== 'undefined' && NotesAiBridge.generateSummary) {
                    NotesAiBridge.generateSummary();
                }
                break;
            case 'settings':
                if (typeof Toast !== 'undefined') {
                    Toast.info('Paramètres à venir...');
                }
                break;
        }
    }

    function filterByTag(tag) {
        // TODO: implement tag filtering
        if (typeof Toast !== 'undefined') {
            Toast.info(`Filtre par tag : #${tag}`);
        }
    }

    function exportAllNotes() {
        // TODO: implement export
        if (typeof Toast !== 'undefined') {
            Toast.info('Export à venir...');
        }
    }

    // ========== FUZZY SEARCH ==========

    function fuzzyMatch(text, query) {
        if (!text || !query) return false;

        let textIndex = 0;
        let queryIndex = 0;

        while (textIndex < text.length && queryIndex < query.length) {
            if (text[textIndex] === query[queryIndex]) {
                queryIndex++;
            }
            textIndex++;
        }

        return queryIndex === query.length;
    }

    function calculateScore(text, query) {
        if (!text || !query) return 0;

        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();

        // Exact match = highest score
        if (lowerText === lowerQuery) return 1000;

        // Starts with = high score
        if (lowerText.startsWith(lowerQuery)) return 500;

        // Contains = medium score
        if (lowerText.includes(lowerQuery)) return 100;

        // Fuzzy match = low score
        if (fuzzyMatch(lowerText, lowerQuery)) return 10;

        return 0;
    }

    // ========== UTILS ==========

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========== PUBLIC API ==========

    return {
        init,
        open,
        close,
        selectIndex,
        executeIndex,
        isOpen: () => isOpen
    };

})();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotesCommandPalette.init());
} else {
    NotesCommandPalette.init();
}
