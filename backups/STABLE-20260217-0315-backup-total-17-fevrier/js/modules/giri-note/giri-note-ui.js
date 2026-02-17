/**
 * GIRI NOTE UI - Premium Interface v2.0
 * ProductiveApp - World Class Notes System
 *
 * Complete premium sidebar + editor enhancement
 * Eliminates the mysterious black circle by replacing sidebar entirely
 */

const GiriNoteUI = (function() {
    'use strict';

    let container = null;
    let searchTimeout = null;

    // === RENDER MAIN LAYOUT ===

    function render(targetContainer) {
        container = targetContainer;

        if (!container) {
            console.error('GiriNoteUI: No container provided');
            return;
        }

        // Use NotesLayoutV6 for the structure (editor + right panel)
        if (typeof NotesLayoutV6 !== 'undefined') {
            NotesLayoutV6.init();
            NotesLayoutV6.render();
            // Replace sidebar entirely with our premium version
            replaceSidebar();
            // Add welcome screen if no note open
            addWelcomeScreen();
            // Patch NotesLayoutV6.render to keep our sidebar alive after any re-render
            patchLayoutRender();
            console.log('  ✓ Giri Note UI v2.0 rendered');
            return;
        }

        // Fallback
        renderBasicLayout();
    }

    // === PATCH LAYOUT RENDER (keep our sidebar alive) ===

    function patchLayoutRender() {
        if (typeof NotesLayoutV6 === 'undefined') return;
        if (NotesLayoutV6._giriPatched) return; // Already patched

        const originalRender = NotesLayoutV6.render.bind(NotesLayoutV6);
        NotesLayoutV6.render = function() {
            originalRender();
            // Re-inject our premium sidebar after layout re-render
            setTimeout(() => {
                const sidebar = document.querySelector('.notes-v6-sidebar');
                // Only replace if old sidebar content detected (has the black circle / old structure)
                if (sidebar && !sidebar.querySelector('.gn-sidebar')) {
                    replaceSidebar();
                }
            }, 50);
        };
        NotesLayoutV6._giriPatched = true;
        console.log('  ✓ NotesLayoutV6.render patched - Giri sidebar protected');
    }

    // === PREMIUM SIDEBAR (replaces old sidebar entirely) ===

    function replaceSidebar() {
        const sidebar = document.querySelector('.notes-v6-sidebar');
        if (!sidebar) return;

        const notes = typeof NotesModule !== 'undefined' ? NotesModule.getNotes() : [];

        sidebar.innerHTML = `
            <style>
                .gn-sidebar { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

                .gn-sidebar-header {
                    padding: 16px 16px 12px;
                    border-bottom: 1px solid rgba(163, 113, 247, 0.15);
                    background: linear-gradient(180deg, rgba(163, 113, 247, 0.08) 0%, transparent 100%);
                }
                .gn-sidebar-brand {
                    display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
                }
                .gn-sidebar-brand-icon {
                    width: 32px; height: 32px;
                    background: linear-gradient(135deg, #a371f7, #58a6ff);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 16px;
                    box-shadow: 0 4px 12px rgba(163, 113, 247, 0.4);
                    flex-shrink: 0;
                }
                .gn-sidebar-brand-text {
                    font-size: 16px; font-weight: 700; letter-spacing: -0.01em;
                    background: linear-gradient(135deg, #a371f7, #58a6ff);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .gn-sidebar-brand-count {
                    margin-left: auto;
                    font-size: 11px; color: #6b7280;
                    background: rgba(163, 113, 247, 0.1);
                    padding: 2px 8px; border-radius: 10px;
                    border: 1px solid rgba(163, 113, 247, 0.2);
                }

                .gn-new-note-btn {
                    width: 100%;
                    padding: 10px 16px;
                    background: linear-gradient(135deg, #a371f7 0%, #58a6ff 100%);
                    border: none; border-radius: 10px; color: white;
                    font-weight: 600; font-size: 13px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(163, 113, 247, 0.3);
                    letter-spacing: 0.01em;
                }
                .gn-new-note-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(163, 113, 247, 0.5);
                }

                .gn-search-wrapper {
                    padding: 10px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .gn-search-input-wrap {
                    position: relative; display: flex; align-items: center;
                }
                .gn-search-input-wrap svg {
                    position: absolute; left: 10px; color: #6b7280; pointer-events: none;
                    flex-shrink: 0;
                }
                .gn-search-input {
                    width: 100%; padding: 8px 10px 8px 34px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px; color: #e6edf3; font-size: 13px;
                    transition: all 0.2s;
                    outline: none;
                }
                .gn-search-input::placeholder { color: #4b5563; }
                .gn-search-input:focus {
                    border-color: rgba(163, 113, 247, 0.4);
                    background: rgba(163, 113, 247, 0.05);
                    box-shadow: 0 0 0 3px rgba(163, 113, 247, 0.1);
                }

                .gn-graph-btn {
                    display: flex; align-items: center; gap: 6px;
                    margin: 8px 16px 0;
                    padding: 7px 12px;
                    background: rgba(88, 166, 255, 0.08);
                    border: 1px solid rgba(88, 166, 255, 0.2);
                    border-radius: 8px; color: #58a6ff;
                    font-size: 12px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s;
                    width: calc(100% - 32px);
                    justify-content: center;
                }
                .gn-graph-btn:hover {
                    background: rgba(88, 166, 255, 0.15);
                    border-color: rgba(88, 166, 255, 0.4);
                    transform: translateY(-1px);
                }

                .gn-notes-list {
                    flex: 1; overflow-y: auto; padding: 8px;
                }
                .gn-notes-list::-webkit-scrollbar { width: 4px; }
                .gn-notes-list::-webkit-scrollbar-track { background: transparent; }
                .gn-notes-list::-webkit-scrollbar-thumb { background: rgba(163, 113, 247, 0.2); border-radius: 2px; }

                .gn-note-item {
                    padding: 10px 12px; border-radius: 8px; cursor: pointer;
                    border: 1px solid transparent;
                    transition: all 0.15s ease; margin-bottom: 2px;
                    position: relative;
                }
                .gn-note-item:hover {
                    background: rgba(163, 113, 247, 0.08);
                    border-color: rgba(163, 113, 247, 0.2);
                }
                .gn-note-item.active {
                    background: rgba(163, 113, 247, 0.15);
                    border-color: rgba(163, 113, 247, 0.4);
                }
                .gn-note-item.active::before {
                    content: '';
                    position: absolute; left: 0; top: 20%; bottom: 20%;
                    width: 3px; border-radius: 2px;
                    background: linear-gradient(180deg, #a371f7, #58a6ff);
                }
                .gn-note-title {
                    font-size: 13px; font-weight: 500; color: #e6edf3;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    margin-bottom: 3px;
                }
                .gn-note-item.active .gn-note-title { color: #a371f7; }
                .gn-note-preview {
                    font-size: 11px; color: #6b7280;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .gn-note-date {
                    font-size: 10px; color: #4b5563; margin-top: 4px;
                }
                .gn-note-tags {
                    display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;
                }
                .gn-tag {
                    font-size: 10px; padding: 1px 6px; border-radius: 4px;
                    background: rgba(163, 113, 247, 0.1);
                    color: #a371f7; border: 1px solid rgba(163, 113, 247, 0.2);
                }

                .gn-section-label {
                    font-size: 10px; font-weight: 700; color: #4b5563;
                    text-transform: uppercase; letter-spacing: 0.1em;
                    padding: 8px 12px 4px;
                }

                .gn-empty-state {
                    text-align: center; padding: 40px 20px; color: #4b5563;
                }
                .gn-empty-state svg { margin-bottom: 12px; opacity: 0.3; }
                .gn-empty-state p { font-size: 13px; }

                .gn-shortcuts {
                    padding: 10px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    font-size: 11px; color: #4b5563; text-align: center;
                }
            </style>

            <div class="gn-sidebar">
                <!-- Header -->
                <div class="gn-sidebar-header">
                    <div class="gn-sidebar-brand">
                        <div class="gn-sidebar-brand-icon">✦</div>
                        <span class="gn-sidebar-brand-text">Giri Note</span>
                        <span class="gn-sidebar-brand-count" id="gn-notes-count">${notes.length}</span>
                    </div>
                    <button class="gn-new-note-btn" onclick="GiriNoteCreate.createNewNote()">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Nouvelle note
                    </button>
                </div>

                <!-- Search -->
                <div class="gn-search-wrapper">
                    <div class="gn-search-input-wrap">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="text" class="gn-search-input" placeholder="Rechercher..."
                            id="gn-search-input"
                            oninput="GiriNoteUI.onSearch(this.value)">
                    </div>
                </div>

                <!-- Graph btn -->
                <button class="gn-graph-btn" onclick="if(typeof NotesGraphView!=='undefined')NotesGraphView.open()">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/>
                        <circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
                        <line x1="7" y1="7" x2="10" y2="10"/><line x1="14" y1="10" x2="17" y2="7"/>
                        <line x1="7" y1="17" x2="10" y2="14"/><line x1="14" y1="14" x2="17" y2="17"/>
                    </svg>
                    Voir le graph de connaissances
                </button>

                <!-- Notes list -->
                <div class="gn-notes-list" id="gn-notes-list">
                    ${renderNotesList(notes)}
                </div>

                <!-- Shortcuts -->
                <div class="gn-shortcuts">
                    Ctrl+N nouvelle note &nbsp;·&nbsp; Ctrl+G graph &nbsp;·&nbsp; Ctrl+K commandes
                </div>
            </div>
        `;
    }

    function renderNotesList(notes) {
        if (!notes || notes.length === 0) {
            return `<div class="gn-empty-state">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>Aucune note.<br>Créez votre première note.</p>
            </div>`;
        }

        const currentId = typeof NotesModule !== 'undefined' ? NotesModule.currentNoteId : null;

        // Sort by updatedAt desc
        const sorted = [...notes].sort((a, b) => {
            const da = new Date(a.updatedAt || a.updated_at || 0);
            const db = new Date(b.updatedAt || b.updated_at || 0);
            return db - da;
        });

        return sorted.map(note => {
            const title = note.title || 'Sans titre';
            const preview = (note.content || '').replace(/#{1,6}\s/g, '').replace(/\*{1,2}/g, '').replace(/\n/g, ' ').slice(0, 60);
            const date = formatNoteDate(note.updatedAt || note.updated_at || note.createdAt || note.created_at);
            const tags = note.tags || [];
            const isActive = note.id === currentId;

            return `<div class="gn-note-item ${isActive ? 'active' : ''}"
                        data-note-id="${note.id}"
                        onclick="GiriNoteUI.openNote('${note.id}')">
                <div class="gn-note-title">${escapeHtml(title)}</div>
                ${preview ? `<div class="gn-note-preview">${escapeHtml(preview)}</div>` : ''}
                <div class="gn-note-date">${date}</div>
                ${tags.length > 0 ? `<div class="gn-note-tags">${tags.slice(0, 3).map(t => `<span class="gn-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
            </div>`;
        }).join('');
    }

    function formatNoteDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'À l\'instant';
        if (mins < 60) return `Il y a ${mins}m`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // === OPEN NOTE ===

    function openNote(noteId) {
        // Visual update: mark as active
        document.querySelectorAll('.gn-note-item').forEach(el => {
            el.classList.toggle('active', el.dataset.noteId === noteId);
        });

        // Open in editor via NotesModule
        if (typeof NotesModule !== 'undefined') {
            NotesModule.selectNote(noteId);
        }
        if (typeof NotesEditor !== 'undefined' && NotesEditor.selectNote) {
            NotesEditor.selectNote(noteId);
        } else if (typeof NotesEditor !== 'undefined' && NotesEditor.render) {
            NotesEditor.render();
        }
    }

    // === SEARCH ===

    function onSearch(query) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const notes = typeof NotesModule !== 'undefined' ? NotesModule.getNotes() : [];

            let filtered = notes;
            if (query.trim()) {
                const q = query.toLowerCase();
                filtered = notes.filter(n =>
                    (n.title || '').toLowerCase().includes(q) ||
                    (n.content || '').toLowerCase().includes(q) ||
                    (n.tags || []).some(t => t.toLowerCase().includes(q))
                );
            }

            const listEl = document.getElementById('gn-notes-list');
            if (listEl) {
                listEl.innerHTML = renderNotesList(filtered);
            }
        }, 150);
    }

    // === REFRESH SIDEBAR (called after note creation) ===

    function refreshSidebar() {
        const notes = typeof NotesModule !== 'undefined' ? NotesModule.getNotes() : [];

        // Update count
        const countEl = document.getElementById('gn-notes-count');
        if (countEl) countEl.textContent = notes.length;

        // Update list
        const listEl = document.getElementById('gn-notes-list');
        if (listEl) listEl.innerHTML = renderNotesList(notes);
    }

    // === WELCOME SCREEN ===

    function addWelcomeScreen() {
        const editorContainer = document.querySelector('#notes-v6-editor-container');
        if (!editorContainer) return;

        const noteTitle = document.querySelector('.notes-v6-note-title');
        if (noteTitle && noteTitle.value) return;
        if (editorContainer.children.length > 0) return;

        editorContainer.innerHTML = `
            <style>
                @keyframes giri-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
                @keyframes giri-glow-pulse {
                    0%,100%{filter:drop-shadow(0 0 20px rgba(163,113,247,0.6))}
                    50%{filter:drop-shadow(0 0 40px rgba(88,166,255,0.9))}
                }
                @keyframes giri-fade-up {
                    from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)}
                }
                @keyframes giri-shimmer {
                    0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}
                }
                .giri-welcome {
                    display:flex; flex-direction:column; align-items:center; justify-content:center;
                    height:100%; padding:60px 40px; text-align:center;
                    background:
                        radial-gradient(ellipse 80% 50% at 50% 0%, rgba(163,113,247,0.18) 0%, transparent 70%),
                        radial-gradient(ellipse 80% 50% at 50% 100%, rgba(88,166,255,0.12) 0%, transparent 70%),
                        rgba(10, 14, 26, 0.98);
                    position:relative; overflow:hidden;
                }
                .giri-welcome-logo {
                    width:100px; height:100px; margin-bottom:32px;
                    background: linear-gradient(135deg, rgba(163,113,247,0.15), rgba(88,166,255,0.15));
                    border-radius: 28px;
                    border: 1px solid rgba(163,113,247,0.3);
                    display:flex; align-items:center; justify-content:center;
                    font-size:44px;
                    animation: giri-float 5s ease-in-out infinite, giri-glow-pulse 4s ease-in-out infinite;
                    box-shadow: 0 20px 60px rgba(163,113,247,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
                }
                .giri-welcome-title {
                    font-size:40px; font-weight:800; margin:0 0 8px;
                    background: linear-gradient(135deg, #a371f7 0%, #58a6ff 50%, #3fb950 100%);
                    background-size: 200% 200%;
                    animation: giri-shimmer 4s ease infinite, giri-fade-up 0.6s ease 0.1s backwards;
                    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
                    letter-spacing:-0.02em;
                }
                .giri-welcome-sub {
                    font-size:16px; color:#9ca3af; margin:0 0 6px;
                    animation: giri-fade-up 0.6s ease 0.2s backwards;
                }
                .giri-welcome-desc {
                    font-size:14px; color:#6b7280; margin:0 0 40px;
                    max-width:480px; line-height:1.7;
                    animation: giri-fade-up 0.6s ease 0.3s backwards;
                }
                .giri-welcome-actions {
                    display:flex; gap:14px; flex-wrap:wrap; justify-content:center;
                    animation: giri-fade-up 0.6s ease 0.4s backwards;
                }
                .giri-btn-primary {
                    padding:14px 28px;
                    background: linear-gradient(135deg, #a371f7, #58a6ff);
                    border:none; border-radius:12px; color:white;
                    font-weight:700; font-size:15px; cursor:pointer;
                    box-shadow: 0 8px 24px rgba(163,113,247,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
                    transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
                    letter-spacing:0.01em;
                }
                .giri-btn-primary:hover {
                    transform:translateY(-3px) scale(1.02);
                    box-shadow:0 14px 32px rgba(163,113,247,0.6), inset 0 1px 0 rgba(255,255,255,0.3);
                }
                .giri-btn-secondary {
                    padding:14px 28px;
                    background:rgba(88,166,255,0.08);
                    border:2px solid rgba(88,166,255,0.35);
                    border-radius:12px; color:#58a6ff;
                    font-weight:700; font-size:15px; cursor:pointer;
                    transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
                    backdrop-filter:blur(8px);
                }
                .giri-btn-secondary:hover {
                    background:rgba(88,166,255,0.15);
                    border-color:rgba(88,166,255,0.6);
                    transform:translateY(-3px) scale(1.02);
                    box-shadow:0 8px 24px rgba(88,166,255,0.3);
                }
                .giri-welcome-features {
                    margin-top:48px;
                    display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;
                    max-width:520px;
                    animation: giri-fade-up 0.6s ease 0.5s backwards;
                }
                .giri-feature {
                    padding:16px 14px;
                    background:linear-gradient(135deg, rgba(163,113,247,0.07) 0%, rgba(88,166,255,0.05) 100%);
                    border:1px solid rgba(163,113,247,0.2);
                    border-radius:12px;
                    text-align:center;
                    transition: all 0.2s;
                }
                .giri-feature:hover {
                    background:linear-gradient(135deg, rgba(163,113,247,0.12) 0%, rgba(88,166,255,0.08) 100%);
                    border-color:rgba(163,113,247,0.4);
                    transform:translateY(-2px);
                }
                .giri-feature-icon { font-size:22px; margin-bottom:8px; }
                .giri-feature-label {
                    font-size:12px; font-weight:600; color:#9ca3af;
                }
                .giri-kbd {
                    padding:3px 8px;
                    background:rgba(163,113,247,0.12);
                    border:1px solid rgba(163,113,247,0.25);
                    border-radius:5px;
                    font-family:'SF Mono','Monaco',monospace;
                    font-size:11px; font-weight:700;
                    color:#a371f7;
                }
            </style>

            <div class="giri-welcome">
                <div class="giri-welcome-logo">✦</div>

                <h1 class="giri-welcome-title">Giri Note</h1>
                <p class="giri-welcome-sub">Système de Notes Premium</p>
                <p class="giri-welcome-desc">
                    Graph de connaissances · Clustering IA · Markdown live<br>
                    Backlinks · Recherche fulltext · Vision totale
                </p>

                <div class="giri-welcome-actions">
                    <button class="giri-btn-primary"
                        onclick="GiriNoteCreate.createNewNote()">
                        ✦ Nouvelle Note
                    </button>
                    <button class="giri-btn-secondary"
                        onclick="if(typeof NotesGraphView!=='undefined')NotesGraphView.open()">
                        ◎ Graph de connaissances
                    </button>
                </div>

                <div class="giri-welcome-features">
                    <div class="giri-feature">
                        <div class="giri-feature-icon">⚡</div>
                        <div class="giri-feature-label"><span class="giri-kbd">Ctrl+N</span><br>Nouvelle note</div>
                    </div>
                    <div class="giri-feature">
                        <div class="giri-feature-icon">◎</div>
                        <div class="giri-feature-label"><span class="giri-kbd">Ctrl+G</span><br>Graph view</div>
                    </div>
                    <div class="giri-feature">
                        <div class="giri-feature-icon">⌘</div>
                        <div class="giri-feature-label"><span class="giri-kbd">Ctrl+K</span><br>Commandes</div>
                    </div>
                </div>
            </div>
        `;
    }

    // === FALLBACK BASIC LAYOUT ===

    function renderBasicLayout() {
        container.innerHTML = `
            <div style="display:flex;height:100vh;background:#0a0e1a;color:#e6edf3;font-family:-apple-system,sans-serif;">
                <div style="width:280px;background:#0f1420;border-right:1px solid rgba(255,255,255,0.08);padding:20px;">
                    <h2 style="margin:0 0 16px;background:linear-gradient(135deg,#a371f7,#58a6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">✦ Giri Note</h2>
                    <button onclick="GiriNoteCreate.createNewNote()" style="width:100%;padding:10px;background:linear-gradient(135deg,#a371f7,#58a6ff);border:none;border-radius:8px;color:white;font-weight:600;cursor:pointer;">+ Nouvelle note</button>
                </div>
                <div style="flex:1;display:flex;align-items:center;justify-content:center;">
                    <p style="color:#6b7280;">Chargement...</p>
                </div>
            </div>
        `;
    }

    // === PUBLIC API ===

    return {
        render,
        openNote,
        onSearch,
        refreshSidebar
    };
})();

// Make globally available
if (typeof window !== 'undefined') {
    window.GiriNoteUI = GiriNoteUI;
}
