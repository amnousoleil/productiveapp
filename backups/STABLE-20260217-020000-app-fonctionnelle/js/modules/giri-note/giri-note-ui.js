/**
 * GIRI NOTE UI - Premium 3-Column Interface
 * ProductiveApp - Obsidian-Style World Class Design
 *
 * Architecture: Delegates to existing NotesLayoutV6 + custom enhancements
 */

const GiriNoteUI = (function() {
    'use strict';

    let container = null;

    // === RENDER MAIN LAYOUT ===

    function render(targetContainer) {
        container = targetContainer;

        if (!container) {
            console.error('GiriNoteUI: No container provided');
            return;
        }

        // Use existing NotesLayoutV6 if available (best option)
        if (typeof NotesLayoutV6 !== 'undefined') {
            NotesLayoutV6.init();
            NotesLayoutV6.render();
            enhanceLayout();
            console.log('  ✓ Using NotesLayoutV6 (premium)');
            return;
        }

        // Fallback: render basic layout
        renderBasicLayout();
        console.log('  ⚠️  Using basic layout (NotesLayoutV6 not available)');
    }

    function enhanceLayout() {
        // Add Giri Note branding
        addBranding();

        // Add quick action buttons
        addQuickActions();

        // Add keyboard shortcuts hint
        addKeyboardHints();

        // Add welcome screen if no note selected
        addWelcomeScreen();

        // Auto-select first note if available
        autoSelectFirstNote();
    }

    function addBranding() {
        const header = document.querySelector('.notes-v6-sidebar-header');
        if (!header) return;

        const logo = header.querySelector('.notes-v6-logo');
        if (logo) {
            // Update logo text to Giri Note
            const titleEl = logo.querySelector('.notes-v6-title');
            if (titleEl) {
                titleEl.innerHTML = `
                    <span style="background: linear-gradient(135deg, #a371f7, #58a6ff);
                                 -webkit-background-clip: text;
                                 -webkit-text-fill-color: transparent;
                                 font-weight: 700;">
                        Giri Note
                    </span>
                `;
            }
        }
    }

    function addQuickActions() {
        const commandBar = document.querySelector('.notes-v6-command-bar');
        if (!commandBar) return;

        // Check if already added
        if (commandBar.querySelector('.giri-quick-actions')) return;

        const actionsHTML = `
            <div class="giri-quick-actions" style="display: flex; gap: 8px; margin-left: auto;">
                <button class="notes-v6-btn-icon"
                        onclick="GiriNote.openGraphView()"
                        title="Graph View (Ctrl+G)">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <circle cx="6" cy="6" r="2"/>
                        <circle cx="18" cy="6" r="2"/>
                        <circle cx="6" cy="18" r="2"/>
                        <circle cx="18" cy="18" r="2"/>
                        <line x1="12" y1="9" x2="12" y2="15"/>
                        <line x1="9" y1="12" x2="15" y2="12"/>
                    </svg>
                </button>
                <button class="notes-v6-btn-icon"
                        onclick="GiriNote.openAIView()"
                        title="AI Assistant (Ctrl+I)">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v8m-4-4h8"/>
                    </svg>
                </button>
            </div>
        `;

        commandBar.insertAdjacentHTML('beforeend', actionsHTML);
    }

    function addKeyboardHints() {
        const footer = document.querySelector('.notes-v6-sidebar-footer');
        if (!footer) return;

        // Check if already added
        if (footer.querySelector('.giri-keyboard-hints')) return;

        const hintsHTML = `
            <div class="giri-keyboard-hints" style="
                padding: 8px 12px;
                margin-top: 8px;
                background: rgba(163, 113, 247, 0.05);
                border-radius: 8px;
                font-size: 11px;
                color: var(--text-secondary, #9ca3af);
                text-align: center;
            ">
                <div style="margin-bottom: 4px; font-weight: 600; color: var(--primary-color, #a371f7);">
                    ⌨️ Raccourcis
                </div>
                <div>Ctrl+N: Nouvelle note • Ctrl+G: Graph • Ctrl+K: Commandes</div>
            </div>
        `;

        footer.insertAdjacentHTML('beforeend', hintsHTML);
    }

    // === FALLBACK: BASIC LAYOUT ===

    function renderBasicLayout() {
        const notes = GiriNote.getNotes();

        container.innerHTML = `
            <div class="giri-note-basic-layout" style="
                display: flex;
                height: 100vh;
                background: var(--bg-primary, #0a0e1a);
                color: var(--text-primary, #e4e7ec);
            ">
                <!-- Sidebar -->
                <div class="giri-sidebar" style="
                    width: 300px;
                    background: var(--bg-secondary, #0f1420);
                    border-right: 1px solid rgba(255,255,255,0.08);
                    display: flex;
                    flex-direction: column;
                ">
                    <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                        <h2 style="
                            margin: 0 0 16px 0;
                            font-size: 24px;
                            background: linear-gradient(135deg, #a371f7, #58a6ff);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        ">🧠 Giri Note</h2>
                        <button onclick="GiriNote.createNote('Nouvelle note', '')" style="
                            width: 100%;
                            padding: 12px;
                            background: linear-gradient(135deg, #a371f7, #58a6ff);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">+ Nouvelle note</button>
                    </div>
                    <div style="flex: 1; overflow-y: auto; padding: 16px;">
                        <div style="color: var(--text-secondary, #9ca3af); text-align: center; padding: 40px 20px;">
                            ${notes.length} note${notes.length !== 1 ? 's' : ''} chargée${notes.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                <!-- Main -->
                <div class="giri-main" style="flex: 1; display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center; max-width: 500px; padding: 40px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">📝</div>
                        <h3 style="
                            font-size: 24px;
                            margin: 0 0 12px 0;
                            background: linear-gradient(135deg, #a371f7, #58a6ff);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        ">Giri Note - World Class</h3>
                        <p style="color: var(--text-secondary, #9ca3af); margin: 0 0 24px 0;">
                            Système de notes premium avec graph 3D et clustering IA
                        </p>
                        <button onclick="GiriNote.openGraphView()" style="
                            padding: 12px 24px;
                            background: rgba(163, 113, 247, 0.1);
                            border: 1px solid rgba(163, 113, 247, 0.3);
                            border-radius: 8px;
                            color: #a371f7;
                            font-weight: 600;
                            cursor: pointer;
                            margin-right: 12px;
                        ">🌐 Voir le Graph</button>
                        <button onclick="GiriNote.createNote('Nouvelle note', '')" style="
                            padding: 12px 24px;
                            background: linear-gradient(135deg, #a371f7, #58a6ff);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">+ Créer une note</button>
                    </div>
                </div>
            </div>
        `;
    }

    function addWelcomeScreen() {
        // Check if editor container exists
        const editorContainer = document.querySelector('#notes-v6-editor-container');
        if (!editorContainer) {
            console.warn('GiriNoteUI: Editor container not found');
            return;
        }

        // Check if a note is already loaded
        const noteTitle = document.querySelector('.notes-v6-note-title');
        if (noteTitle && noteTitle.value) return; // Note already loaded

        // Check if container is empty
        if (editorContainer.children.length > 0) return; // Already has content

        // Inject welcome screen
        console.log('  🎨 Injecting Giri Note ULTRA PREMIUM welcome screen');
        editorContainer.innerHTML = `
            <style>
                @keyframes giri-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes giri-glow-pulse {
                    0%, 100% { filter: drop-shadow(0 0 20px rgba(163, 113, 247, 0.6)); }
                    50% { filter: drop-shadow(0 0 40px rgba(88, 166, 255, 0.8)); }
                }
                @keyframes giri-fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .giri-welcome-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 60px;
                    text-align: center;
                    background:
                        radial-gradient(ellipse at top, rgba(163, 113, 247, 0.15), transparent 50%),
                        radial-gradient(ellipse at bottom, rgba(88, 166, 255, 0.12), transparent 50%),
                        linear-gradient(180deg, rgba(10, 14, 26, 0.95), rgba(15, 20, 32, 0.98));
                    position: relative;
                    overflow: hidden;
                }
                .giri-welcome-container::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(163, 113, 247, 0.08) 0%, transparent 70%);
                    animation: giri-float 8s ease-in-out infinite;
                }
            </style>
            <div class="giri-welcome-container">
                <svg width="120" height="120" viewBox="0 0 120 120" style="
                    margin-bottom: 32px;
                    animation: giri-float 4s ease-in-out infinite, giri-glow-pulse 3s ease-in-out infinite;
                    filter: drop-shadow(0 0 30px rgba(163, 113, 247, 0.6));
                ">
                    <defs>
                        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#a371f7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#58a6ff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3fb950;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <circle cx="60" cy="60" r="50" fill="url(#brainGradient)" opacity="0.2"/>
                    <path d="M60 25 C75 25, 85 35, 85 50 C85 65, 75 75, 60 75 C45 75, 35 65, 35 50 C35 35, 45 25, 60 25 M50 45 L70 45 M50 55 L70 55 M50 65 L70 65"
                          stroke="url(#brainGradient)" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <circle cx="50" cy="35" r="3" fill="url(#brainGradient)"/>
                    <circle cx="70" cy="35" r="3" fill="url(#brainGradient)"/>
                </svg>

                <h2 style="
                    font-size: 42px;
                    font-weight: 800;
                    margin: 0 0 12px 0;
                    background: linear-gradient(135deg, #a371f7 0%, #58a6ff 50%, #3fb950 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: -0.02em;
                    animation: giri-fade-in-up 0.6s ease 0.2s backwards;
                    text-shadow: 0 0 40px rgba(163, 113, 247, 0.3);
                ">Giri Note</h2>

                <p style="
                    font-size: 18px;
                    color: #b8c5d0;
                    margin: 0 0 8px 0;
                    font-weight: 600;
                    animation: giri-fade-in-up 0.6s ease 0.3s backwards;
                ">Système de Notes Premium</p>

                <p style="
                    font-size: 15px;
                    color: #8b949e;
                    margin: 0 0 40px 0;
                    max-width: 520px;
                    line-height: 1.7;
                    animation: giri-fade-in-up 0.6s ease 0.4s backwards;
                ">
                    Graph intelligent • Clustering IA • Markdown WYSIWYG<br>
                    Liens wiki • Backlinks automatiques • Recherche fulltext
                </p>

                <div style="
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    justify-content: center;
                    animation: giri-fade-in-up 0.6s ease 0.5s backwards;
                ">
                    <button onclick="if(typeof GiriNoteCreate !== 'undefined') GiriNoteCreate.createNewNote()" style="
                        padding: 16px 32px;
                        background: linear-gradient(135deg, #a371f7 0%, #58a6ff 100%);
                        border: none;
                        border-radius: 12px;
                        color: white;
                        font-weight: 700;
                        font-size: 16px;
                        cursor: pointer;
                        box-shadow: 0 8px 24px rgba(163, 113, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                    " onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 12px 32px rgba(163, 113, 247, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)'" onmouseout="this.style.transform=''; this.style.boxShadow='0 8px 24px rgba(163, 113, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'">
                        <span style="position: relative; z-index: 1;">✨ Nouvelle Note</span>
                    </button>

                    <button onclick="if(typeof NotesGraphView !== 'undefined') NotesGraphView.open()" style="
                        padding: 16px 32px;
                        background: rgba(163, 113, 247, 0.08);
                        border: 2px solid rgba(163, 113, 247, 0.4);
                        border-radius: 12px;
                        color: #a371f7;
                        font-weight: 700;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        backdrop-filter: blur(8px);
                    " onmouseover="this.style.background='rgba(163, 113, 247, 0.15)'; this.style.borderColor='rgba(163, 113, 247, 0.6)'; this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 8px 20px rgba(163, 113, 247, 0.3)'" onmouseout="this.style.background='rgba(163, 113, 247, 0.08)'; this.style.borderColor='rgba(163, 113, 247, 0.4)'; this.style.transform=''; this.style.boxShadow=''">
                        🌐 Voir le Graph
                    </button>
                </div>

                <div style="
                    margin-top: 56px;
                    padding: 24px 32px;
                    background: linear-gradient(135deg, rgba(163, 113, 247, 0.1) 0%, rgba(88, 166, 255, 0.08) 100%);
                    border-radius: 16px;
                    border: 1px solid rgba(163, 113, 247, 0.3);
                    max-width: 460px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    animation: giri-fade-in-up 0.6s ease 0.6s backwards;
                ">
                    <div style="
                        font-size: 13px;
                        font-weight: 700;
                        color: #a371f7;
                        margin-bottom: 16px;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                    ">⌨️ Raccourcis Clavier</div>
                    <div style="font-size: 14px; color: #b8c5d0; line-height: 2.2; display: grid; gap: 4px;">
                        <div><kbd style="padding: 4px 10px; background: rgba(163, 113, 247, 0.15); border: 1px solid rgba(163, 113, 247, 0.3); border-radius: 6px; font-family: 'SF Mono', 'Monaco', monospace; font-weight: 600; color: #a371f7;">Ctrl+N</kbd> <span style="color: #8b949e;">→</span> Nouvelle note</div>
                        <div><kbd style="padding: 4px 10px; background: rgba(88, 166, 255, 0.15); border: 1px solid rgba(88, 166, 255, 0.3); border-radius: 6px; font-family: 'SF Mono', 'Monaco', monospace; font-weight: 600; color: #58a6ff;">Ctrl+G</kbd> <span style="color: #8b949e;">→</span> Graph View</div>
                        <div><kbd style="padding: 4px 10px; background: rgba(63, 185, 80, 0.15); border: 1px solid rgba(63, 185, 80, 0.3); border-radius: 6px; font-family: 'SF Mono', 'Monaco', monospace; font-weight: 600; color: #3fb950;">Ctrl+K</kbd> <span style="color: #8b949e;">→</span> Commandes</div>
                    </div>
                </div>
            </div>
        `;
    }

    function autoSelectFirstNote() {
        // Check if a note is already selected
        if (typeof NotesModule === 'undefined') return;
        if (NotesModule.currentNoteId) return;

        // Get notes
        const notes = NotesModule.getNotes ? NotesModule.getNotes() : [];
        if (notes.length === 0) return;

        // Select first note
        setTimeout(() => {
            const firstNote = notes[0];
            if (typeof NotesModule.selectNote === 'function') {
                NotesModule.selectNote(firstNote.id);
                console.log('  ✓ Auto-selected first note:', firstNote.title);
            }
        }, 500);
    }

    // === PUBLIC API ===

    return {
        render
    };
})();

// Make globally available
if (typeof window !== 'undefined') {
    window.GiriNoteUI = GiriNoteUI;
}
