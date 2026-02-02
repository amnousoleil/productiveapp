/**
 * NOTES TOOLBAR - Rich text formatting
 * ProductiveApp v4.0
 */

const NotesToolbar = (function() {
    'use strict';

    // Toolbar icons
    const icons = {
        bold: '<svg viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
        italic: '<svg viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
        underline: '<svg viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',
        strikethrough: '<svg viewBox="0 0 24 24"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2"/><path d="M8.7 19.1c1.5.3 3.3.5 4.8.5 3.5 0 6.7-1.1 6.7-5.1 0-2-.6-3.5-2.3-4.5"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
        h1: '<svg viewBox="0 0 24 24"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 10v8"/><path d="M21 18h-4v-8l3 2"/></svg>',
        h2: '<svg viewBox="0 0 24 24"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>',
        h3: '<svg viewBox="0 0 24 24"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/></svg>',
        list: '<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
        numbered: '<svg viewBox="0 0 24 24"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
        checklist: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
        code: '<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        codeblock: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m10 10-2 2 2 2"/><path d="m14 14 2-2-2-2"/></svg>',
        quote: '<svg viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>',
        link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
        image: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
        divider: '<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/></svg>'
    };

    /**
     * Get toolbar HTML
     */
    function getToolbarHTML() {
        return `
            <div class="notes-toolbar">
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="NotesToolbar.format('bold')" title="Gras (Ctrl+B)">
                        ${icons.bold}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('italic')" title="Italique (Ctrl+I)">
                        ${icons.italic}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('underline')" title="Souligné (Ctrl+U)">
                        ${icons.underline}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('strikethrough')" title="Barré">
                        ${icons.strikethrough}
                    </button>
                </div>
                <div class="toolbar-divider"></div>
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="NotesToolbar.format('h1')" title="Titre 1">
                        ${icons.h1}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('h2')" title="Titre 2">
                        ${icons.h2}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('h3')" title="Titre 3">
                        ${icons.h3}
                    </button>
                </div>
                <div class="toolbar-divider"></div>
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="NotesToolbar.format('list')" title="Liste à puces">
                        ${icons.list}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('numbered')" title="Liste numérotée">
                        ${icons.numbered}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('checklist')" title="Checklist">
                        ${icons.checklist}
                    </button>
                </div>
                <div class="toolbar-divider"></div>
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="NotesToolbar.format('code')" title="Code inline">
                        ${icons.code}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('codeblock')" title="Bloc de code">
                        ${icons.codeblock}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('quote')" title="Citation">
                        ${icons.quote}
                    </button>
                </div>
                <div class="toolbar-divider"></div>
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="NotesToolbar.format('link')" title="Lien (Ctrl+K)">
                        ${icons.link}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('image')" title="Image">
                        ${icons.image}
                    </button>
                    <button class="toolbar-btn" onclick="NotesToolbar.format('divider')" title="Séparateur">
                        ${icons.divider}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Apply formatting
     */
    function format(type) {
        const textarea = document.querySelector('.note-textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);

        let before = '', after = '', insert = '';

        switch (type) {
            case 'bold':
                before = '**'; after = '**';
                break;
            case 'italic':
                before = '*'; after = '*';
                break;
            case 'underline':
                before = '<u>'; after = '</u>';
                break;
            case 'strikethrough':
                before = '~~'; after = '~~';
                break;
            case 'h1':
                before = '# '; after = '';
                break;
            case 'h2':
                before = '## '; after = '';
                break;
            case 'h3':
                before = '### '; after = '';
                break;
            case 'list':
                before = '- '; after = '';
                break;
            case 'numbered':
                before = '1. '; after = '';
                break;
            case 'checklist':
                before = '- [ ] '; after = '';
                break;
            case 'code':
                before = '`'; after = '`';
                break;
            case 'codeblock':
                before = '```\n'; after = '\n```';
                break;
            case 'quote':
                before = '> '; after = '';
                break;
            case 'link':
                before = '['; after = '](url)';
                break;
            case 'image':
                insert = '![description](url)';
                break;
            case 'divider':
                insert = '\n---\n';
                break;
        }

        if (insert) {
            textarea.value = text.substring(0, start) + insert + text.substring(end);
            textarea.setSelectionRange(start + insert.length, start + insert.length);
        } else {
            textarea.value = text.substring(0, start) + before + selected + after + text.substring(end);
            textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
        }

        textarea.focus();
        NotesEditor.handleAutoSave();
    }

    /**
     * Initialize keyboard shortcuts
     */
    function initShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!e.target.classList.contains('note-textarea')) return;

            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        format('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        format('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        format('underline');
                        break;
                    case 'k':
                        e.preventDefault();
                        format('link');
                        break;
                }
            }
        });
    }

    return {
        icons,
        getToolbarHTML,
        format,
        initShortcuts
    };
})();

if (typeof window !== 'undefined') {
    window.NotesToolbar = NotesToolbar;
}
