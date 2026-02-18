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

        // Anchor container so position:absolute works
        container.style.position = 'relative';
        container.style.overflow = 'hidden';

        const notes = typeof NotesModule !== 'undefined' ? NotesModule.getNotes() : [];

        container.innerHTML = `
        <style>
            .gn-layout {
                display: flex;
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                overflow: hidden;
                background: var(--bg-primary, #0a0e1a);
            }

            /* ─── LEFT PANE ─── */
            .gn-left-pane {
                width: 300px;
                min-width: 220px;
                max-width: 380px;
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                background: var(--bg-secondary, #0d1117);
                border-right: 1px solid rgba(163,113,247,0.12);
                overflow: hidden;
            }

            .gn-left-header {
                padding: 18px 16px 14px;
                border-bottom: 1px solid rgba(163,113,247,0.1);
                flex-shrink: 0;
            }
            .gn-brand-row {
                display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
            }
            .gn-brand-icon {
                width: 34px; height: 34px;
                background: linear-gradient(135deg, #a371f7, #58a6ff);
                border-radius: 9px;
                display: flex; align-items: center; justify-content: center;
                font-size: 17px; flex-shrink: 0;
                box-shadow: 0 4px 12px rgba(163,113,247,0.35);
            }
            .gn-brand-name {
                font-size: 15px; font-weight: 700;
                background: linear-gradient(135deg, #a371f7, #58a6ff);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                background-clip: text; flex: 1;
            }
            .gn-brand-count {
                font-size: 11px; color: #6b7280;
                background: rgba(163,113,247,0.1);
                padding: 2px 8px; border-radius: 10px;
                border: 1px solid rgba(163,113,247,0.2);
            }
            .gn-new-note-btn {
                width: 100%; padding: 10px 16px;
                background: linear-gradient(135deg, #a371f7 0%, #58a6ff 100%);
                border: none; border-radius: 10px; color: white;
                font-weight: 600; font-size: 13px; cursor: pointer;
                display: flex; align-items: center; justify-content: center; gap: 8px;
                transition: all 0.2s ease;
                box-shadow: 0 4px 14px rgba(163,113,247,0.3);
                letter-spacing: 0.01em;
            }
            .gn-new-note-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(163,113,247,0.5);
            }

            .gn-search-bar {
                padding: 10px 16px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                flex-shrink: 0;
            }
            .gn-search-wrap {
                position: relative; display: flex; align-items: center;
            }
            .gn-search-wrap svg {
                position: absolute; left: 10px; color: #4b5563; pointer-events: none;
            }
            .gn-search-input {
                width: 100%; padding: 8px 10px 8px 34px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 8px; color: #e6edf3; font-size: 13px;
                transition: all 0.2s; outline: none;
            }
            .gn-search-input::placeholder { color: #4b5563; }
            .gn-search-input:focus {
                border-color: rgba(163,113,247,0.4);
                background: rgba(163,113,247,0.05);
                box-shadow: 0 0 0 3px rgba(163,113,247,0.1);
            }

            .gn-graph-btn {
                display: flex; align-items: center; gap: 6px;
                margin: 8px 16px;
                padding: 7px 12px;
                background: rgba(88,166,255,0.07);
                border: 1px solid rgba(88,166,255,0.18);
                border-radius: 8px; color: #58a6ff;
                font-size: 12px; font-weight: 600; cursor: pointer;
                transition: all 0.2s; justify-content: center;
                flex-shrink: 0;
            }
            .gn-graph-btn:hover {
                background: rgba(88,166,255,0.14);
                border-color: rgba(88,166,255,0.35);
            }

            .gn-notes-list {
                flex: 1; overflow-y: auto; padding: 6px 8px 8px;
            }
            .gn-notes-list::-webkit-scrollbar { width: 4px; }
            .gn-notes-list::-webkit-scrollbar-track { background: transparent; }
            .gn-notes-list::-webkit-scrollbar-thumb { background: rgba(163,113,247,0.2); border-radius: 2px; }

            .gn-note-item {
                padding: 6px 8px 6px 10px; border-radius: 8px; cursor: pointer;
                border: 1px solid transparent;
                transition: all 0.15s; margin-bottom: 1px;
                display: flex; align-items: flex-start; gap: 7px;
                position: relative;
            }
            .gn-note-item:hover { background: rgba(163,113,247,0.07); border-color: rgba(163,113,247,0.12); }
            .gn-note-item.active {
                background: linear-gradient(135deg, rgba(163,113,247,0.12), rgba(88,166,255,0.06));
                border-color: rgba(163,113,247,0.28);
            }
            .gn-note-item.active::before {
                content: '';
                position: absolute; left: 0; top: 20%; bottom: 20%;
                width: 3px; border-radius: 0 2px 2px 0;
                background: linear-gradient(180deg, #a371f7, #58a6ff);
            }
            .gn-note-icon { font-size: 13px; flex-shrink: 0; margin-top: 2px; line-height: 1; opacity: 0.85; }
            .gn-note-body { flex: 1; min-width: 0; }
            .gn-note-title-row { display: flex; align-items: baseline; gap: 5px; }
            .gn-note-title {
                flex: 1; font-size: 13px; font-weight: 500; color: #d1d5db;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .gn-note-item.active .gn-note-title { color: #c4b5fd; font-weight: 600; }
            .gn-note-date { font-size: 10px; color: #4b5563; flex-shrink: 0; }
            .gn-note-preview {
                display: block; font-size: 11px; color: #6b7280; line-height: 1.4;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                margin-top: 1px;
            }
            .gn-note-tags { margin-top: 2px; }
            .gn-tag { font-size: 10px; padding: 0 5px; border-radius: 3px; background: rgba(163,113,247,0.1); color: #a371f7; border: 1px solid rgba(163,113,247,0.18); }

            .gn-section-label {
                font-size: 10px; font-weight: 700; color: #374151;
                text-transform: uppercase; letter-spacing: 0.12em;
                padding: 10px 12px 4px;
                display: flex; align-items: center; gap: 6px;
            }
            .gn-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.05); }

            .gn-empty-state { text-align: center; padding: 40px 20px; color: #4b5563; }
            .gn-empty-state svg { margin-bottom: 12px; opacity: 0.3; }
            .gn-empty-state p { font-size: 13px; line-height: 1.6; }

            .gn-left-footer {
                padding: 10px 16px;
                border-top: 1px solid rgba(255,255,255,0.05);
                font-size: 11px; color: #374151; text-align: center;
                letter-spacing: 0.01em; flex-shrink: 0;
            }

            /* ─── RIGHT PANE ─── */
            #gn-editor-pane {
                flex: 1;
                overflow-y: auto;
                background: var(--bg-primary, #0a0e1a);
                display: flex;
                flex-direction: column;
            }
            #gn-editor-pane::-webkit-scrollbar { width: 8px; }
            #gn-editor-pane::-webkit-scrollbar-track { background: transparent; }
            #gn-editor-pane::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

            /* Editor styles (NotesRender.renderEditor) */
            #gn-editor-pane .notes-editor-wrapper { height: 100%; display: flex; flex-direction: column; }
            #gn-editor-pane .notes-editor-header {
                display: flex; align-items: center; gap: 12px;
                padding: 20px 32px 0;
            }
            #gn-editor-pane .note-title-input {
                flex: 1;
                background: transparent; border: none; outline: none;
                font-size: 26px; font-weight: 700; color: #e6edf3;
                letter-spacing: -0.02em;
                padding: 0;
            }
            #gn-editor-pane .note-title-input::placeholder { color: #374151; }
            #gn-editor-pane .notes-editor-content { flex: 1; padding: 16px 32px; }
            #gn-editor-pane .note-textarea {
                width: 100%; height: 100%; min-height: 400px;
                background: transparent; border: none; outline: none; resize: none;
                color: #c9d1d9; font-size: 15px; line-height: 1.75;
                font-family: inherit;
            }
            #gn-editor-pane .note-textarea::placeholder { color: #374151; }
            #gn-editor-pane .note-header-actions { display: flex; gap: 8px; }
            #gn-editor-pane .note-action-btn {
                width: 32px; height: 32px;
                display: flex; align-items: center; justify-content: center;
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
                border-radius: 8px; color: #6b7280; cursor: pointer;
                transition: all 0.2s;
            }
            #gn-editor-pane .note-action-btn:hover { background: rgba(255,255,255,0.1); color: #e6edf3; }
            #gn-editor-pane .note-action-btn svg { width: 14px; height: 14px; stroke-width: 2; }
            #gn-editor-pane .notes-editor-footer {
                display: flex; align-items: center; justify-content: space-between;
                padding: 12px 32px;
                border-top: 1px solid rgba(255,255,255,0.05);
                font-size: 12px; color: #4b5563;
                flex-shrink: 0;
            }
        </style>

        <div class="gn-layout">
            <!-- LEFT: Notes list -->
            <div class="gn-left-pane">
                <div class="gn-left-header">
                    <div class="gn-brand-row">
                        <div class="gn-brand-icon">✦</div>
                        <span class="gn-brand-name">Giri Note</span>
                        <span class="gn-brand-count" id="gn-notes-count">${notes.length}</span>
                    </div>
                    <button class="gn-new-note-btn" onclick="GiriNoteCreate.createNewNote()">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Nouvelle note
                    </button>
                </div>

                <div class="gn-search-bar">
                    <div class="gn-search-wrap">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="text" class="gn-search-input" placeholder="Rechercher..."
                            id="gn-search-input"
                            oninput="GiriNoteUI.onSearch(this.value)">
                    </div>
                </div>

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

                <div class="gn-notes-list" id="gn-notes-list">
                    ${renderNotesList(notes)}
                </div>

                <div class="gn-left-footer">
                    <kbd style="padding:2px 6px;background:rgba(163,113,247,0.1);border:1px solid rgba(163,113,247,0.2);border-radius:4px;font-size:10px;color:#a371f7">Ctrl+N</kbd> nouvelle
                    &nbsp;·&nbsp;
                    <kbd style="padding:2px 6px;background:rgba(163,113,247,0.1);border:1px solid rgba(163,113,247,0.2);border-radius:4px;font-size:10px;color:#a371f7">Ctrl+G</kbd> graph
                </div>
            </div>

            <!-- RIGHT: Editor -->
            <div id="gn-editor-pane"></div>
        </div>
        `;

        // If notes already in memory → open most recent immediately
        if (notes.length > 0) {
            const sorted = [...notes].sort((a, b) =>
                new Date(b.updatedAt || b.updated_at || 0) - new Date(a.updatedAt || a.updated_at || 0)
            );
            setTimeout(() => openNote(sorted[0].id), 30);
        } else {
            // Show welcome screen while notes load from API
            addWelcomeScreen();
        }
        // Always poll for fresh API data
        scheduleNotesCheck();
        console.log('  ✓ Giri Note UI v3.0 rendered');
    }

    // Retry loading notes into sidebar if initially empty (async API load)
    function scheduleNotesCheck() {
        let attempts = 0;
        const maxAttempts = 8;
        const delays = [400, 800, 1500, 2500, 4000, 6000, 9000, 14000];

        function check() {
            if (attempts >= maxAttempts) return;
            const delay = delays[attempts++];
            setTimeout(() => {
                const notes = typeof NotesModule !== 'undefined' ? NotesModule.getNotes() : [];
                if (notes.length > 0) {
                    const listEl = document.getElementById('gn-notes-list');
                    const countEl = document.getElementById('gn-notes-count');
                    if (listEl && (listEl.innerHTML.includes('gn-empty-state') || listEl.innerHTML.trim() === '')) {
                        listEl.innerHTML = renderNotesList(notes);
                        if (countEl) countEl.textContent = notes.length;
                        console.log(`GiriNoteUI: sidebar refreshed with ${notes.length} notes after async load`);

                        // Auto-open most recent note if editor is empty or showing welcome screen
                        const editorContainer = document.getElementById('gn-editor-pane');
                        const hasWelcome = editorContainer && editorContainer.querySelector('.giri-welcome');
                        const isEmpty = editorContainer && editorContainer.children.length === 0;
                        if (hasWelcome || isEmpty) {
                            const sorted = [...notes].sort((a, b) => {
                                const da = new Date(a.updatedAt || a.updated_at || 0);
                                const db = new Date(b.updatedAt || b.updated_at || 0);
                                return db - da;
                            });
                            if (sorted[0]) openNote(sorted[0].id);
                        }
                    } else if (listEl && !listEl.innerHTML.includes('gn-empty-state')) {
                        return; // Notes already showing, stop polling
                    }
                }
                check(); // Continue checking
            }, delay);
        }
        check();
    }


    function getNoteIcon(note) {
        const content = ((note.title || '') + ' ' + (note.content || '')).toLowerCase();
        if (/meeting|réunion|agenda|rendez|visio|call/.test(content)) return '📅';
        if (/budget|finance|coût|argent|euro|dépense|facture/.test(content)) return '💰';
        if (/plan|stratégie|roadmap|objectif|vision|2026/.test(content)) return '🎯';
        if (/code|technique|architecture|api|backend|frontend|dev/.test(content)) return '⚙️';
        if (/santé|bien-être|méditation|thérapie|psycho|yoga/.test(content)) return '🌿';
        if (/sécurité|rgpd|conformité|audit/.test(content)) return '🔒';
        if (/marketing|campagne|communication|branding/.test(content)) return '📣';
        if (/équipe|team|membre|collaborat/.test(content)) return '👥';
        if (/idée|innovation|créat|brainstorm/.test(content)) return '💡';
        if (/\[\[/.test(note.content || '')) return '🔗';
        return '📝';
    }

    function getTimeGroup(dateStr) {
        if (!dateStr) return 'ancien';
        const d = new Date(dateStr);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        if (d >= todayStart) return 'today';
        if (d >= weekStart) return 'week';
        if (d >= monthStart) return 'month';
        return 'ancien';
    }

    function renderNoteItem(note, isActive) {
        const title = note.title || 'Sans titre';
        const preview = (note.content || '')
            .replace(/#{1,6}\s[^\n]*/g, '')
            .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
            .replace(/\n+/g, ' ')
            .trim()
            .slice(0, 55);
        const date = formatNoteDate(note.updatedAt || note.updated_at || note.createdAt || note.created_at);
        const tags = (note.tags || []).slice(0, 1);
        const icon = getNoteIcon(note);

        return `<div class="gn-note-item ${isActive ? 'active' : ''}"
                    data-note-id="${note.id}"
                    onclick="GiriNoteUI.openNote('${note.id}')">
            <span class="gn-note-icon">${icon}</span>
            <div class="gn-note-body">
                <div class="gn-note-title-row">
                    <span class="gn-note-title">${escapeHtml(title)}</span>
                    <span class="gn-note-date">${date}</span>
                </div>
                ${preview ? `<span class="gn-note-preview">${escapeHtml(preview)}</span>` : ''}
                ${tags.length ? `<div class="gn-note-tags">${tags.map(t => `<span class="gn-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
            </div>
        </div>`;
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

        // Group by time period
        const groups = { today: [], week: [], month: [], ancien: [] };
        sorted.forEach(note => {
            const dateStr = note.updatedAt || note.updated_at || note.createdAt || note.created_at;
            groups[getTimeGroup(dateStr)].push(note);
        });

        const groupLabels = {
            today: "Aujourd'hui",
            week: 'Cette semaine',
            month: 'Ce mois',
            ancien: 'Plus ancien'
        };

        let html = '';
        ['today', 'week', 'month', 'ancien'].forEach(groupKey => {
            const groupNotes = groups[groupKey];
            if (!groupNotes.length) return;
            html += `<div class="gn-section-label">${groupLabels[groupKey]}</div>`;
            groupNotes.forEach(note => {
                html += renderNoteItem(note, note.id === currentId);
            });
        });

        return html;
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

        // Update module state
        if (typeof NotesModule !== 'undefined') {
            NotesModule.selectNote(noteId);
        }

        // Find note directly from array (reliable, no getCurrentNote() race condition)
        const allNotes = typeof NotesModule !== 'undefined' ? NotesModule.getNotes() : [];
        const note = allNotes.find(n => n.id === noteId);

        const pane = document.getElementById('gn-editor-pane');
        if (pane && note && typeof NotesRender !== 'undefined') {
            const toolbarHtml = typeof NotesToolbar !== 'undefined' ? NotesToolbar.getToolbarHTML() : '';
            pane.innerHTML = NotesRender.renderEditor(note, toolbarHtml);
            pane.scrollTop = 0;
            return;
        }

        // Fallback
        if (typeof NotesEditor !== 'undefined' && NotesEditor.selectNote) {
            NotesEditor.selectNote(noteId);
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
        const editorContainer = document.getElementById('gn-editor-pane');
        if (!editorContainer) return;
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
