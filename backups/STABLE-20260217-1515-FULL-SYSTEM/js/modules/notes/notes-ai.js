/**
 * NOTES AI - AI-powered note enhancement
 * ProductiveApp v4.2
 *
 * Features:
 * - Automatic spell correction
 * - Text summarization
 * - Reformulation for clarity
 * - Complete/expand text
 */

const NotesAI = (function() {
    'use strict';

    // AI action types
    const AI_ACTIONS = {
        CORRECT: 'correct',
        SUMMARIZE: 'summarize',
        REFORMULATE: 'reformulate',
        COMPLETE: 'complete',
        PROFESSIONAL: 'professional'
    };

    // Icons for AI actions
    const icons = {
        ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>',
        correct: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>',
        summarize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>',
        reformulate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
        complete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
        professional: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>',
        spinner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ai-spinner"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    };

    let isProcessing = false;
    let fabExpanded = false;

    /**
     * Get the AI FAB HTML (floating action button)
     */
    function getFabHTML() {
        return `
            <div class="notes-ai-fab" id="notes-ai-fab">
                <button class="ai-fab-main" onclick="NotesAI.toggleFab()" title="Assistant IA">
                    ${icons.ai}
                </button>
                <div class="ai-fab-menu">
                    <button class="ai-fab-action" data-action="correct" onclick="NotesAI.executeAction('correct')" title="Corriger l'orthographe">
                        ${icons.correct}
                        <span>Corriger</span>
                    </button>
                    <button class="ai-fab-action" data-action="reformulate" onclick="NotesAI.executeAction('reformulate')" title="Reformuler clairement">
                        ${icons.reformulate}
                        <span>Reformuler</span>
                    </button>
                    <button class="ai-fab-action" data-action="summarize" onclick="NotesAI.executeAction('summarize')" title="Résumer le texte">
                        ${icons.summarize}
                        <span>Résumer</span>
                    </button>
                    <button class="ai-fab-action" data-action="complete" onclick="NotesAI.executeAction('complete')" title="Compléter le texte">
                        ${icons.complete}
                        <span>Compléter</span>
                    </button>
                    <button class="ai-fab-action" data-action="professional" onclick="NotesAI.executeAction('professional')" title="Rendre professionnel">
                        ${icons.professional}
                        <span>Pro</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get AI toolbar button HTML (for inline toolbar)
     */
    function getToolbarButtonHTML() {
        return `
            <div class="toolbar-divider"></div>
            <div class="toolbar-group toolbar-ai-group">
                <button class="toolbar-btn toolbar-btn-ai" onclick="NotesAI.toggleFab()" title="Assistant IA (Ctrl+Shift+A)">
                    ${icons.ai}
                </button>
            </div>
        `;
    }

    /**
     * Toggle FAB menu
     */
    function toggleFab() {
        const fab = document.getElementById('notes-ai-fab');
        if (!fab) return;

        fabExpanded = !fabExpanded;
        fab.classList.toggle('expanded', fabExpanded);

        // Close when clicking outside
        if (fabExpanded) {
            setTimeout(() => {
                document.addEventListener('click', closeFabOnClickOutside);
            }, 100);
        }
    }

    function closeFabOnClickOutside(e) {
        const fab = document.getElementById('notes-ai-fab');
        if (fab && !fab.contains(e.target)) {
            fabExpanded = false;
            fab.classList.remove('expanded');
            document.removeEventListener('click', closeFabOnClickOutside);
        }
    }

    /**
     * Execute AI action on note content
     */
    async function executeAction(action) {
        if (isProcessing) return;

        const textarea = document.querySelector('.note-textarea');
        if (!textarea) return;

        const text = textarea.value.trim();
        if (!text) {
            showToast('Ajoutez du texte avant d\'utiliser l\'IA', 'warning');
            return;
        }

        // Close FAB menu
        const fab = document.getElementById('notes-ai-fab');
        if (fab) {
            fabExpanded = false;
            fab.classList.remove('expanded');
        }

        isProcessing = true;
        setProcessingState(true, action);

        try {
            const result = await callAI(action, text);

            if (result) {
                // Show preview modal before applying
                showPreviewModal(action, text, result);
            }
        } catch (error) {
            console.error('NotesAI error:', error);
            showToast('Erreur lors du traitement IA', 'error');
        } finally {
            isProcessing = false;
            setProcessingState(false);
        }
    }

    /**
     * Call AI API based on action
     */
    async function callAI(action, text) {
        // Check if ApiAi is available
        if (typeof ApiAi === 'undefined' || !ApiAi.isAvailable()) {
            showToast('Service IA non disponible', 'error');
            return null;
        }

        const prompts = {
            correct: `Corrige toutes les fautes d'orthographe et de grammaire dans ce texte. Garde le sens et le style exactement identiques. Ne modifie rien d'autre que l'orthographe et la grammaire. Retourne UNIQUEMENT le texte corrigé sans commentaire:

${text}`,

            summarize: `Résume ce texte de manière concise en gardant les points essentiels. Le résumé doit être clair et facile à comprendre. Retourne UNIQUEMENT le résumé sans commentaire:

${text}`,

            reformulate: `Reformule ce texte pour le rendre plus clair et fluide à lire. Garde le sens original mais améliore la formulation. Corrige aussi les fautes s'il y en a. Retourne UNIQUEMENT le texte reformulé sans commentaire:

${text}`,

            complete: `Complète ce texte en ajoutant des détails pertinents, des explications ou des précisions utiles. Garde le style de l'auteur. Retourne UNIQUEMENT le texte complété sans commentaire:

${text}`,

            professional: `Transforme ce texte en version professionnelle, bien structurée et formelle. Corrige les fautes, améliore le vocabulaire et la structure. Retourne UNIQUEMENT le texte professionnel sans commentaire:

${text}`
        };

        const prompt = prompts[action];
        if (!prompt) return null;

        const response = await ApiAi.generate(prompt);
        return response;
    }

    /**
     * Show preview modal with diff
     */
    function showPreviewModal(action, original, result) {
        const actionLabels = {
            correct: 'Correction orthographique',
            summarize: 'Résumé',
            reformulate: 'Reformulation',
            complete: 'Texte complété',
            professional: 'Version professionnelle'
        };

        const modal = document.createElement('div');
        modal.className = 'notes-ai-preview-modal';
        modal.innerHTML = `
            <div class="ai-preview-overlay" onclick="NotesAI.closePreview()"></div>
            <div class="ai-preview-content">
                <div class="ai-preview-header">
                    <h3>${icons.ai} ${actionLabels[action] || 'Résultat IA'}</h3>
                    <button class="ai-preview-close" onclick="NotesAI.closePreview()">
                        ${icons.close}
                    </button>
                </div>
                <div class="ai-preview-body">
                    <div class="ai-preview-section">
                        <label>Texte original</label>
                        <div class="ai-preview-text original">${escapeHtml(original)}</div>
                    </div>
                    <div class="ai-preview-section">
                        <label>Proposition IA</label>
                        <div class="ai-preview-text result">${escapeHtml(result)}</div>
                    </div>
                </div>
                <div class="ai-preview-footer">
                    <button class="btn btn-secondary" onclick="NotesAI.closePreview()">
                        Annuler
                    </button>
                    <button class="btn btn-primary" onclick="NotesAI.applyResult('${action}')">
                        Appliquer
                    </button>
                </div>
            </div>
        `;

        // Store result for apply
        modal.dataset.result = result;
        document.body.appendChild(modal);

        // Animate in
        requestAnimationFrame(() => modal.classList.add('active'));
    }

    /**
     * Close preview modal
     */
    function closePreview() {
        const modal = document.querySelector('.notes-ai-preview-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Apply AI result to textarea
     */
    function applyResult(action) {
        const modal = document.querySelector('.notes-ai-preview-modal');
        const textarea = document.querySelector('.note-textarea');

        if (modal && textarea) {
            const result = modal.dataset.result;
            textarea.value = result;

            // Trigger autosave
            if (typeof NotesEditor !== 'undefined' && NotesEditor.handleAutoSave) {
                NotesEditor.handleAutoSave();
            }

            // Trigger input event for word count update
            textarea.dispatchEvent(new Event('input', { bubbles: true }));

            showToast('Texte mis à jour avec succès', 'success');
        }

        closePreview();
    }

    /**
     * Auto-correct on blur (optional feature)
     */
    async function autoCorrectOnBlur(textarea) {
        // Check if auto-correct is enabled in settings
        const autoCorrectEnabled = localStorage.getItem('notes_auto_correct') === 'true';
        if (!autoCorrectEnabled) return;

        const text = textarea.value.trim();
        if (!text || text.length < 10) return;

        try {
            const corrected = await callAI('correct', text);
            if (corrected && corrected !== text) {
                textarea.value = corrected;
                if (typeof NotesEditor !== 'undefined' && NotesEditor.handleAutoSave) {
                    NotesEditor.handleAutoSave();
                }
            }
        } catch (e) {
            console.warn('Auto-correct failed:', e);
        }
    }

    /**
     * Set processing state (show spinner)
     */
    function setProcessingState(processing, action) {
        const fab = document.getElementById('notes-ai-fab');
        const mainBtn = fab?.querySelector('.ai-fab-main');

        if (mainBtn) {
            if (processing) {
                mainBtn.innerHTML = icons.spinner;
                mainBtn.classList.add('processing');
            } else {
                mainBtn.innerHTML = icons.ai;
                mainBtn.classList.remove('processing');
            }
        }
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        if (typeof Utils !== 'undefined' && Utils.notify) {
            Utils.notify(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    /**
     * Init keyboard shortcuts
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+A = Toggle AI menu
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                toggleFab();
            }
            // Ctrl+Shift+C = Quick correct (when in notes view)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                const textarea = document.querySelector('.note-textarea');
                if (textarea && document.activeElement === textarea) {
                    e.preventDefault();
                    executeAction('correct');
                }
            }
        });
    }

    /**
     * Initialize
     */
    function init() {
        initKeyboardShortcuts();
        console.log('✅ NotesAI: Initialized');
    }

    // Public API
    return {
        init,
        getFabHTML,
        getToolbarButtonHTML,
        toggleFab,
        executeAction,
        closePreview,
        applyResult,
        autoCorrectOnBlur,
        AI_ACTIONS
    };
})();

// Auto-init
if (typeof window !== 'undefined') {
    window.NotesAI = NotesAI;

    // Init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', NotesAI.init);
    } else {
        NotesAI.init();
    }
}
