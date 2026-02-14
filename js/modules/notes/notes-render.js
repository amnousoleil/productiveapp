/**
 * NOTES RENDER - Rendering functions
 * ProductiveApp v4.0
 */

const NotesRender = (function() {
    'use strict';

    const icons = {
        'file-text': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        plus: '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        trash: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    };

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        if (diff < 60000) return 'A l\'instant';
        if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    function countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    function renderNoteItem(note, isActive) {
        const publicBadge = note.isPublic ? '<span class="note-badge-public" title="Note publique">&#127760;</span>' : '';
        return `
            <div class="note-item ${isActive ? 'active' : ''}"
                 onclick="NotesEditor.selectNote('${note.id}')">
                <h4 class="note-item-title">${publicBadge}${escapeHtml(note.title) || 'Sans titre'}</h4>
                <p class="note-item-preview">${escapeHtml(note.content?.substring(0, 80)) || 'Note vide...'}</p>
                <div class="note-item-meta">
                    <span>${formatDate(note.updatedAt)}</span>
                </div>
            </div>
        `;
    }

    function renderNotesList(notes, currentId) {
        if (notes.length === 0) {
            return '<div class="notes-empty-list">Aucune note</div>';
        }
        return notes.map(note => renderNoteItem(note, note.id === currentId)).join('');
    }

    function renderEmptyEditor() {
        return `
            <div class="notes-empty">
                ${icons['file-text']}
                <h3>Aucune note selectionnee</h3>
                <p>Selectionnez une note ou creez-en une nouvelle</p>
                <button class="btn btn-primary" onclick="NotesEditor.createNew()">
                    ${icons.plus} Nouvelle note
                </button>
            </div>
        `;
    }

    function renderEditor(note, toolbarHtml) {
        const isPublic = note.isPublic || false;
        const visibilityIcon = isPublic ? '&#127760;' : '&#128274;';
        const visibilityLabel = isPublic ? 'Publique' : 'Privée';
        const visibilityClass = isPublic ? 'note-public' : 'note-private';

        return `
            <div class="notes-editor-wrapper">
                <div class="notes-editor-header">
                    <div class="note-title-wrapper">
                        <input type="text"
                               class="note-title-input"
                               placeholder="✨ Titre de la note..."
                               value="${escapeHtml(note.title)}"
                               oninput="NotesEditor.handleAutoSave()">
                    </div>
                    <div class="note-header-actions">
                        <button class="note-action-btn note-visibility-toggle ${visibilityClass}"
                                onclick="NotesEditor.toggleVisibility('${note.id}')"
                                title="${visibilityLabel}">
                            ${visibilityIcon}
                        </button>
                        <button class="note-action-btn note-delete-btn"
                                onclick="NotesEditor.confirmDelete('${note.id}')"
                                title="Supprimer">
                            ${icons.trash}
                        </button>
                    </div>
                </div>
                ${toolbarHtml}
                <div class="notes-editor-content">
                    <textarea class="note-textarea"
                              placeholder="✍️ Commencez à écrire votre note..."
                              oninput="NotesEditor.handleInput(this)"
                              onkeydown="NotesEditor.handleKeydown(event)">${escapeHtml(note.content)}</textarea>
                </div>
                <div class="notes-editor-footer">
                    <div class="save-indicator saved">${renderSaveIndicator('saved')}</div>
                    <div class="word-count">${countWords(note.content)} mots</div>
                </div>
            </div>
        `;
    }

    function renderLayout(notesCount) {
        return `
            <div class="notes-layout">
                <div class="notes-sidebar">
                    <div class="sidebar-toolbar">
                        <div class="notes-sidebar-title">
                            <span>✨ Notes</span>
                            <span class="notes-count">${notesCount}</span>
                        </div>
                        <button class="sidebar-btn sidebar-btn-primary" onclick="NotesEditor.createNew()">
                            ${icons.plus} Nouvelle note
                        </button>
                        <button class="sidebar-btn" onclick="NotesGraphView && NotesGraphView.open()" title="Vision panoramique 3D">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <circle cx="6" cy="6" r="2"/>
                                <circle cx="18" cy="6" r="2"/>
                                <circle cx="6" cy="18" r="2"/>
                                <circle cx="18" cy="18" r="2"/>
                                <line x1="12" y1="9" x2="12" y2="15"/>
                                <line x1="9" y1="12" x2="15" y2="12"/>
                            </svg>
                            Vision Graph 3D
                        </button>
                    </div>
                    <div class="sidebar-search">
                        <span class="sidebar-search-icon">${icons.search}</span>
                        <input type="text"
                               class="sidebar-search-input"
                               placeholder="Rechercher dans les notes..."
                               oninput="NotesEditor.handleSearch(this.value)">
                    </div>
                    <div class="notes-list"></div>
                </div>
                <div class="notes-editor"></div>
            </div>
        `;
    }

    function renderSaveIndicator(status) {
        const labels = {
            saving: '&#9203; Sauvegarde...',
            saved: '&#10003; Sauvegarde',
            unsaved: '&#8226; Non sauvegarde'
        };
        return labels[status] || '';
    }

    return {
        icons,
        escapeHtml,
        formatDate,
        countWords,
        renderNoteItem,
        renderNotesList,
        renderEmptyEditor,
        renderEditor,
        renderLayout,
        renderSaveIndicator
    };
})();

if (typeof window !== 'undefined') {
    window.NotesRender = NotesRender;
}
