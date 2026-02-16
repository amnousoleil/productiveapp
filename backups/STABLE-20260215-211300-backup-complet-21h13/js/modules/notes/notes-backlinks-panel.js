/**
 * NOTES BACKLINKS PANEL - Bidirectional links UI
 * ProductiveApp v6.0 - World Class Edition
 *
 * Shows:
 * - Notes that link TO current note (backlinks)
 * - Notes that current note links TO (forward links)
 * - Unlinked mentions (notes that mention the title but don't link)
 */

const NotesBacklinksPanel = (function() {
    'use strict';

    let currentNoteId = null;

    // ========== RENDERING ==========

    function render(containerEl) {
        if (!containerEl) {
            containerEl = document.getElementById('notes-v6-panel-content');
        }

        if (!containerEl) return;

        currentNoteId = typeof NotesModule !== 'undefined' ? NotesModule.currentNoteId : null;

        if (!currentNoteId) {
            containerEl.innerHTML = renderEmpty();
            return;
        }

        const backlinks = getBacklinks();
        const forwardLinks = getForwardLinks();
        const unlinkedMentions = getUnlinkedMentions();

        containerEl.innerHTML = `
            <div class="notes-backlinks-container">
                ${renderSection('Backlinks', backlinks, 'notes-that-link-here')}
                ${renderSection('Liens sortants', forwardLinks, 'notes-this-links-to')}
                ${unlinkedMentions.length > 0 ? renderSection('Mentions non liées', unlinkedMentions, 'unlinked-mentions') : ''}
            </div>
        `;
    }

    function renderEmpty() {
        return `
            <div class="notes-backlinks-empty">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <p>Aucune note sélectionnée</p>
                <span class="notes-backlinks-hint">Sélectionnez une note pour voir ses liens</span>
            </div>
        `;
    }

    function renderSection(title, items, type) {
        const count = items.length;
        const isEmpty = count === 0;

        return `
            <div class="notes-backlinks-section ${isEmpty ? 'empty' : ''}">
                <div class="notes-backlinks-section-header">
                    <h4 class="notes-backlinks-section-title">${escapeHtml(title)}</h4>
                    <span class="notes-backlinks-count">${count}</span>
                </div>
                ${isEmpty
                    ? `<div class="notes-backlinks-section-empty">Aucun lien</div>`
                    : `<div class="notes-backlinks-list">${items.map(item => renderBacklinkItem(item, type)).join('')}</div>`
                }
            </div>
        `;
    }

    function renderBacklinkItem(note, type) {
        const isUnlinked = type === 'unlinked-mentions';

        return `
            <div class="notes-backlink-item ${isUnlinked ? 'unlinked' : ''}" onclick="NotesWikiLinks.openNote('${note.id}')">
                <div class="notes-backlink-item-header">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span class="notes-backlink-title">${escapeHtml(note.title || 'Sans titre')}</span>
                </div>
                ${note.preview ? `<div class="notes-backlink-preview">${escapeHtml(note.preview)}</div>` : ''}
            </div>
        `;
    }

    // ========== DATA FETCHING ==========

    function getBacklinks() {
        if (typeof NotesWikiLinks === 'undefined' || !currentNoteId) return [];
        if (typeof NotesModule === 'undefined') return [];

        const backlinkIds = NotesWikiLinks.getBacklinks(currentNoteId);
        const notes = NotesModule.getNotes();

        return backlinkIds.map(id => {
            const note = notes.find(n => n.id === id);
            if (!note) return null;

            return {
                id: note.id,
                title: note.title,
                preview: note.content ? note.content.substring(0, 100) + '...' : ''
            };
        }).filter(Boolean);
    }

    function getForwardLinks() {
        if (typeof NotesWikiLinks === 'undefined' || !currentNoteId) return [];

        const forwardNotes = NotesWikiLinks.getForwardLinks(currentNoteId);

        return forwardNotes.map(note => ({
            id: note.id,
            title: note.title,
            preview: note.content ? note.content.substring(0, 100) + '...' : ''
        }));
    }

    function getUnlinkedMentions() {
        if (typeof NotesModule === 'undefined' || !currentNoteId) return [];

        const currentNote = NotesModule.getCurrentNote();
        if (!currentNote || !currentNote.title) return [];

        const title = currentNote.title.toLowerCase();
        const notes = NotesModule.getNotes();
        const backlinkIds = typeof NotesWikiLinks !== 'undefined' ? NotesWikiLinks.getBacklinks(currentNoteId) : [];

        return notes
            .filter(note => {
                if (note.id === currentNoteId) return false;
                if (backlinkIds.includes(note.id)) return false;

                const content = (note.content || '').toLowerCase();
                return content.includes(title);
            })
            .map(note => ({
                id: note.id,
                title: note.title,
                preview: extractMention(note.content, currentNote.title)
            }))
            .slice(0, 10);
    }

    function extractMention(content, title) {
        if (!content) return '';

        const lowerContent = content.toLowerCase();
        const lowerTitle = title.toLowerCase();
        const index = lowerContent.indexOf(lowerTitle);

        if (index === -1) return content.substring(0, 100) + '...';

        const start = Math.max(0, index - 40);
        const end = Math.min(content.length, index + title.length + 40);

        return '...' + content.substring(start, end) + '...';
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
        render
    };

})();
