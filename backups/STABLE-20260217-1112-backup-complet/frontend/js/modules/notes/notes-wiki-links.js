/**
 * NOTES WIKI LINKS - [[Note Title]] auto-linking system
 * ProductiveApp v6.0 - World Class Edition
 *
 * Features:
 * - Parser for [[...]] syntax in markdown
 * - Auto-completion dropdown when typing [[
 * - Bidirectional link index
 * - Auto-create note on click if doesn't exist
 */

const NotesWikiLinks = (function() {
    'use strict';

    let linkIndex = new Map(); // noteId -> [linked noteIds]
    let backlinksIndex = new Map(); // noteId -> [noteIds that link to this]

    // ========== INITIALIZATION ==========

    function init() {
        console.log('🔗 NotesWikiLinks: Initializing wiki links system');
        rebuildIndex();
    }

    // ========== INDEX BUILDING ==========

    function rebuildIndex() {
        linkIndex.clear();
        backlinksIndex.clear();

        if (typeof NotesModule === 'undefined') return;

        const notes = NotesModule.getNotes();

        notes.forEach(note => {
            const links = extractWikiLinks(note.content || '');
            linkIndex.set(note.id, links);

            // Build backlinks
            links.forEach(linkedTitle => {
                const linkedNote = findNoteByTitle(linkedTitle);
                if (linkedNote) {
                    if (!backlinksIndex.has(linkedNote.id)) {
                        backlinksIndex.set(linkedNote.id, []);
                    }
                    backlinksIndex.get(linkedNote.id).push(note.id);
                }
            });
        });

        console.log(`  ✓ Indexed ${linkIndex.size} notes with ${getTotalLinksCount()} links`);
    }

    function getTotalLinksCount() {
        let total = 0;
        linkIndex.forEach(links => total += links.length);
        return total;
    }

    // ========== PARSING ==========

    /**
     * Extract all [[wiki link]] from markdown content
     * Returns array of note titles
     */
    function extractWikiLinks(content) {
        if (!content) return [];

        const regex = /\[\[([^\]]+)\]\]/g;
        const links = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            links.push(match[1].trim());
        }

        return links;
    }

    /**
     * Find note by title (fuzzy match)
     */
    function findNoteByTitle(title) {
        if (typeof NotesModule === 'undefined') return null;

        const notes = NotesModule.getNotes();
        const lowerTitle = title.toLowerCase().trim();

        // Exact match first
        let found = notes.find(n => (n.title || '').toLowerCase().trim() === lowerTitle);
        if (found) return found;

        // Partial match
        found = notes.find(n => (n.title || '').toLowerCase().includes(lowerTitle));
        return found || null;
    }

    // ========== RENDERING ==========

    /**
     * Convert [[wiki links]] to clickable HTML
     */
    function renderWikiLinks(content) {
        if (!content) return '';

        return content.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
            const linkedNote = findNoteByTitle(title);

            if (linkedNote) {
                // Link exists
                return `<a href="#" class="wiki-link exists" onclick="NotesWikiLinks.openNote('${linkedNote.id}'); return false;" title="${escapeHtml(linkedNote.title)}">${escapeHtml(title)}</a>`;
            } else {
                // Link doesn't exist - create on click
                return `<a href="#" class="wiki-link missing" onclick="NotesWikiLinks.createNote('${escapeHtml(title)}'); return false;" title="Créer '${escapeHtml(title)}'">${escapeHtml(title)}</a>`;
            }
        });
    }

    /**
     * Get backlinks for a note
     */
    function getBacklinks(noteId) {
        return backlinksIndex.get(noteId) || [];
    }

    /**
     * Get forward links for a note
     */
    function getForwardLinks(noteId) {
        const linkTitles = linkIndex.get(noteId) || [];
        const notes = linkTitles.map(title => findNoteByTitle(title)).filter(Boolean);
        return notes;
    }

    // ========== ACTIONS ==========

    function openNote(noteId) {
        if (typeof NotesModule !== 'undefined' && NotesModule.setCurrentNote) {
            NotesModule.setCurrentNote(noteId);
            if (typeof NotesModule.render === 'function') {
                NotesModule.render();
            }
        }
    }

    async function createNote(title) {
        if (typeof NotesModule === 'undefined') return;

        try {
            const newNote = await NotesModule.createNew();
            await NotesModule.updateNote(newNote.id, { title });

            if (typeof Toast !== 'undefined') {
                Toast.success(`Note créée : ${title}`);
            }

            openNote(newNote.id);
            rebuildIndex();
        } catch (error) {
            console.error('Failed to create note', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Échec de la création de la note');
            }
        }
    }

    // ========== AUTO-COMPLETION ==========

    /**
     * Get suggestions for auto-completion when typing [[
     */
    function getSuggestions(query) {
        if (typeof NotesModule === 'undefined') return [];

        const notes = NotesModule.getNotes();
        const lowerQuery = query.toLowerCase();

        return notes
            .filter(note => {
                const title = (note.title || '').toLowerCase();
                return title.includes(lowerQuery);
            })
            .slice(0, 10)
            .map(note => ({
                id: note.id,
                title: note.title || 'Sans titre',
                preview: note.content ? note.content.substring(0, 60) : ''
            }));
    }

    /**
     * Insert wiki link at cursor position
     */
    function insertWikiLink(textarea, title) {
        const cursorPos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursorPos);
        const textAfter = textarea.value.substring(textarea.selectionEnd);

        // Check if we're inside [[
        const lastBrackets = textBefore.lastIndexOf('[[');
        if (lastBrackets !== -1 && textBefore.substring(lastBrackets).indexOf(']]') === -1) {
            // Replace from [[ to cursor
            const before = textBefore.substring(0, lastBrackets);
            textarea.value = before + `[[${title}]]` + textAfter;
            textarea.selectionStart = textarea.selectionEnd = before.length + title.length + 4;
        } else {
            // Insert new wiki link
            textarea.value = textBefore + `[[${title}]]` + textAfter;
            textarea.selectionStart = textarea.selectionEnd = cursorPos + title.length + 4;
        }

        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
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
        rebuildIndex,
        extractWikiLinks,
        renderWikiLinks,
        getBacklinks,
        getForwardLinks,
        getSuggestions,
        insertWikiLink,
        openNote,
        createNote
    };

})();
