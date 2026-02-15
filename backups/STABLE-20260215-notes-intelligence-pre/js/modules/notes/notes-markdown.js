/**
 * NOTES MARKDOWN - Split view markdown editor with preview
 * ProductiveApp v5.0 - Phase 1
 * Requires: marked.js (https://cdn.jsdelivr.net/npm/marked/marked.min.js)
 */

const NotesMarkdown = (function() {
    'use strict';

    let previewMode = 'split'; // split | edit | preview
    let isFullscreen = false;

    // ========== MARKED.JS CONFIGURATION ==========

    function configureMarked() {
        if (typeof marked === 'undefined') {
            console.warn('marked.js not loaded');
            return;
        }

        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false,
            sanitize: false, // We'll use DOMPurify if available
            smartLists: true,
            smartypants: true,
            xhtml: false
        });
    }

    // ========== MARKDOWN PARSING ==========

    function parseMarkdown(text) {
        if (typeof marked === 'undefined') {
            return escapeHtml(text);
        }

        try {
            let html = marked.parse(text || '');

            // Sanitize if DOMPurify available
            if (typeof DOMPurify !== 'undefined') {
                html = DOMPurify.sanitize(html);
            }

            return html;
        } catch (e) {
            console.error('Markdown parse error:', e);
            return escapeHtml(text);
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========== RENDER SPLIT VIEW ==========

    function renderSplitView(note) {
        if (!note) return renderEmptyView();

        const previewHtml = parseMarkdown(note.content);

        return `
            <div class="markdown-container ${previewMode} ${isFullscreen ? 'fullscreen' : ''}">
                <!-- Toolbar -->
                <div class="markdown-toolbar">
                    <div class="markdown-toolbar-left">
                        <button class="md-btn" onclick="NotesMarkdown.togglePreview('split')"
                            title="Split view"
                            ${previewMode === 'split' ? 'class="active"' : ''}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <line x1="12" y1="3" x2="12" y2="21"/>
                            </svg>
                        </button>
                        <button class="md-btn" onclick="NotesMarkdown.togglePreview('edit')"
                            title="Edit only"
                            ${previewMode === 'edit' ? 'class="active"' : ''}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                            </svg>
                        </button>
                        <button class="md-btn" onclick="NotesMarkdown.togglePreview('preview')"
                            title="Preview only"
                            ${previewMode === 'preview' ? 'class="active"' : ''}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <div class="toolbar-divider"></div>
                        <button class="md-btn" onclick="NotesMarkdown.insertFormat('bold')" title="Bold (Ctrl+B)">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                            </svg>
                        </button>
                        <button class="md-btn" onclick="NotesMarkdown.insertFormat('italic')" title="Italic (Ctrl+I)">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="19" y1="4" x2="10" y2="4"/>
                                <line x1="14" y1="20" x2="5" y2="20"/>
                                <line x1="15" y1="4" x2="9" y2="20"/>
                            </svg>
                        </button>
                        <button class="md-btn" onclick="NotesMarkdown.insertFormat('code')" title="Code (Ctrl+\`)">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="16 18 22 12 16 6"/>
                                <polyline points="8 6 2 12 8 18"/>
                            </svg>
                        </button>
                        <button class="md-btn" onclick="NotesMarkdown.insertFormat('link')" title="Link (Ctrl+K)">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                        </button>
                    </div>
                    <div class="markdown-toolbar-right">
                        <span class="md-word-count" id="md-word-count">${countWords(note.content)} mots</span>
                        <button class="md-btn" onclick="NotesMarkdown.toggleFullscreen()" title="Fullscreen (F11)">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                ${isFullscreen ? `
                                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                                ` : `
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                                `}
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Split panels -->
                <div class="markdown-panels">
                    ${previewMode !== 'preview' ? `
                        <div class="markdown-editor-panel">
                            <textarea
                                class="markdown-textarea"
                                id="markdown-textarea"
                                placeholder="Écrivez en Markdown..."
                                oninput="NotesMarkdown.handleInput(this)"
                                onkeydown="NotesMarkdown.handleKeydown(event)"
                                spellcheck="true">${escapeHtml(note.content)}</textarea>
                        </div>
                    ` : ''}

                    ${previewMode !== 'edit' ? `
                        <div class="markdown-preview-panel">
                            <div class="markdown-preview" id="markdown-preview">${previewHtml || '<p class="preview-empty">Aucun contenu</p>'}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function renderEmptyView() {
        return `
            <div class="markdown-empty">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <h3>Aucune note sélectionnée</h3>
                <p>Sélectionnez une note dans la sidebar ou créez-en une nouvelle</p>
            </div>
        `;
    }

    // ========== ACTIONS ==========

    function togglePreview(mode) {
        previewMode = mode;
        refreshView();
    }

    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
        refreshView();
    }

    function handleInput(textarea) {
        const content = textarea.value;

        // Update preview
        updatePreview(content);

        // Update word count
        updateWordCount(content);

        // Trigger autosave
        if (typeof NotesEditor !== 'undefined' && NotesEditor.handleAutoSave) {
            NotesEditor.handleAutoSave();
        }
    }

    function handleKeydown(e) {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    insertFormat('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    insertFormat('italic');
                    break;
                case '`':
                    e.preventDefault();
                    insertFormat('code');
                    break;
                case 'k':
                    e.preventDefault();
                    insertFormat('link');
                    break;
            }
        }

        // Tab handling
        if (e.key === 'Tab') {
            e.preventDefault();
            insertAtCursor('    '); // 4 spaces
        }

        // Pass to NotesSlash if available
        if (typeof NotesSlash !== 'undefined' && NotesSlash.handleKeydown) {
            NotesSlash.handleKeydown(e);
        }
    }

    function insertFormat(format) {
        const textarea = document.getElementById('markdown-textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';

        switch(format) {
            case 'bold':
                replacement = `**${selectedText || 'texte en gras'}**`;
                break;
            case 'italic':
                replacement = `*${selectedText || 'texte en italique'}*`;
                break;
            case 'code':
                replacement = `\`${selectedText || 'code'}\``;
                break;
            case 'link':
                replacement = `[${selectedText || 'texte du lien'}](url)`;
                break;
            case 'heading':
                replacement = `## ${selectedText || 'Titre'}`;
                break;
            case 'list':
                replacement = `- ${selectedText || 'Élément de liste'}`;
                break;
            case 'quote':
                replacement = `> ${selectedText || 'Citation'}`;
                break;
        }

        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

        // Update cursor position
        const newPos = start + replacement.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();

        // Update preview
        handleInput(textarea);
    }

    function insertAtCursor(text) {
        const textarea = document.getElementById('markdown-textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
        textarea.setSelectionRange(start + text.length, start + text.length);
        textarea.focus();

        handleInput(textarea);
    }

    function updatePreview(content) {
        const preview = document.getElementById('markdown-preview');
        if (!preview) return;

        const html = parseMarkdown(content);
        preview.innerHTML = html || '<p class="preview-empty">Aucun contenu</p>';
    }

    function updateWordCount(content) {
        const counter = document.getElementById('md-word-count');
        if (!counter) return;

        const words = countWords(content);
        counter.textContent = `${words} mot${words !== 1 ? 's' : ''}`;
    }

    function countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    function refreshView() {
        const note = NotesModule.getCurrentNote();
        const container = document.querySelector('.notes-editor');
        if (!container) return;

        const html = renderSplitView(note);
        container.innerHTML = html;

        // Focus textarea if in edit mode
        if (previewMode !== 'preview') {
            setTimeout(() => {
                const textarea = document.getElementById('markdown-textarea');
                if (textarea) textarea.focus();
            }, 100);
        }
    }

    // ========== INIT ==========

    function init() {
        configureMarked();
        console.log('📝 NotesMarkdown initialized');
    }

    // ========== PUBLIC API ==========

    return {
        init,
        renderSplitView,
        togglePreview,
        toggleFullscreen,
        handleInput,
        handleKeydown,
        insertFormat,
        parseMarkdown,
        refreshView
    };
})();

if (typeof window !== 'undefined') {
    window.NotesMarkdown = NotesMarkdown;
}
