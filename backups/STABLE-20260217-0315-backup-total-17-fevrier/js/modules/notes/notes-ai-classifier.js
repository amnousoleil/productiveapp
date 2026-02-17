/**
 * Notes AI Classifier - UI for classification results
 * ProductiveApp v5.0
 */

const NotesAiClassifier = (function() {
    'use strict';

    // Category colors (matching theme)
    const CATEGORY_COLORS = {
        technical: '#4488ff',
        creative: '#aa44ff',
        planning: '#ff8800',
        research: '#22cc66',
        personal: '#ff6b9d',
        reference: '#00bcd4',
        meeting: '#ffd700',
        idea: '#ff6f61'
    };

    /**
     * Classify current note
     */
    async function classifyCurrentNote(noteId, force = false) {
        if (!noteId) {
            Toast.error('Aucune note sélectionnée');
            return;
        }

        // Show loading toast
        const loadingToast = Toast.info('🤖 Classification en cours...', { duration: 0 });

        try {
            const result = await ApiNotesGraph.classifyNote(noteId, force);

            // Hide loading toast
            if (loadingToast && loadingToast.hide) {
                loadingToast.hide();
            }

            // Show result modal
            showClassificationModal(result);

            // Update note badge in UI
            updateNoteBadge(noteId, result);

            Toast.success('✅ Note classifiée avec succès');
        } catch (error) {
            console.error('Classification error:', error);
            if (loadingToast && loadingToast.hide) {
                loadingToast.hide();
            }
            Toast.error('❌ Erreur de classification: ' + error.message);
        }
    }

    /**
     * Classify all notes in workspace
     */
    async function classifyAllNotes(workspaceId, force = false) {
        if (!workspaceId) {
            Toast.error('Workspace non défini');
            return;
        }

        // Show loading modal
        showClassifyAllModal();

        try {
            const result = await ApiNotesGraph.classifyAllNotes(workspaceId, force);

            // Update modal with results
            updateClassifyAllResults(result);

            Toast.success(`✅ ${result.classified} notes classifiées`);
        } catch (error) {
            console.error('Classify all error:', error);
            closeClassifyAllModal();
            Toast.error('❌ Erreur: ' + error.message);
        }
    }

    /**
     * Show classification result modal
     */
    function showClassificationModal(result) {
        const modal = document.createElement('div');
        modal.className = 'ai-classification-modal-overlay';
        modal.innerHTML = `
            <div class="ai-classification-modal">
                <div class="ai-classification-header">
                    <h3>🤖 Résultat de Classification</h3>
                    <button class="ai-modal-close" onclick="this.closest('.ai-classification-modal-overlay').remove()">
                        ✕
                    </button>
                </div>

                <div class="ai-classification-body">
                    <!-- Category -->
                    <div class="ai-classification-section">
                        <label>Catégorie Principale</label>
                        <div class="category-badge" style="background: ${CATEGORY_COLORS[result.category] || '#888'};">
                            ${capitalize(result.category)}
                        </div>
                    </div>

                    <!-- Subcategory -->
                    ${result.subcategory ? `
                    <div class="ai-classification-section">
                        <label>Sous-catégorie</label>
                        <div class="subcategory-tag">
                            ${result.subcategory}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Keywords -->
                    <div class="ai-classification-section">
                        <label>Mots-clés Extraits</label>
                        <div class="keywords-container">
                            ${(result.keywords || []).map(kw => `
                                <span class="keyword-chip">${kw}</span>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Summary -->
                    <div class="ai-classification-section">
                        <label>Résumé IA</label>
                        <p class="ai-summary">${result.summary || 'Aucun résumé'}</p>
                    </div>

                    <!-- Confidence -->
                    <div class="ai-classification-section">
                        <label>Confiance IA</label>
                        <div class="confidence-bar-container">
                            <div class="confidence-bar" style="width: ${(result.confidence * 100)}%">
                                ${Math.round(result.confidence * 100)}%
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ai-classification-footer">
                    <button class="btn-secondary" onclick="this.closest('.ai-classification-modal-overlay').remove()">
                        Fermer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Show classify all modal
     */
    function showClassifyAllModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-classification-modal-overlay';
        modal.id = 'classify-all-modal';
        modal.innerHTML = `
            <div class="ai-classification-modal">
                <div class="ai-classification-header">
                    <h3>🤖 Classification de toutes les notes</h3>
                </div>

                <div class="ai-classification-body">
                    <div class="classify-all-progress">
                        <div class="spinner"></div>
                        <p id="classify-status">Classification en cours...</p>
                    </div>

                    <div id="classify-results" style="display: none;">
                        <div class="classify-stat">
                            <span class="stat-label">✅ Classifiées:</span>
                            <span class="stat-value" id="classified-count">0</span>
                        </div>
                        <div class="classify-stat">
                            <span class="stat-label">⏭️ Ignorées:</span>
                            <span class="stat-value" id="skipped-count">0</span>
                        </div>
                        <div class="classify-stat">
                            <span class="stat-label">📊 Total:</span>
                            <span class="stat-value" id="total-count">0</span>
                        </div>
                    </div>
                </div>

                <div class="ai-classification-footer" id="classify-footer" style="display: none;">
                    <button class="btn-primary" onclick="document.getElementById('classify-all-modal').remove(); location.reload();">
                        OK
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Update classify all results
     */
    function updateClassifyAllResults(result) {
        document.querySelector('.classify-all-progress').style.display = 'none';
        document.getElementById('classify-results').style.display = 'block';
        document.getElementById('classify-footer').style.display = 'flex';

        document.getElementById('classified-count').textContent = result.classified;
        document.getElementById('skipped-count').textContent = result.skipped;
        document.getElementById('total-count').textContent = result.total;
    }

    /**
     * Close classify all modal
     */
    function closeClassifyAllModal() {
        const modal = document.getElementById('classify-all-modal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Update note badge in notes list
     */
    function updateNoteBadge(noteId, classification) {
        const noteEl = document.querySelector(`[data-note-id="${noteId}"]`);
        if (!noteEl) return;

        // Remove old badge if exists
        const oldBadge = noteEl.querySelector('.note-category-badge');
        if (oldBadge) {
            oldBadge.remove();
        }

        // Add new badge
        const badge = document.createElement('div');
        badge.className = 'note-category-badge';
        badge.style.background = CATEGORY_COLORS[classification.category] || '#888';
        badge.textContent = capitalize(classification.category);

        const noteTitle = noteEl.querySelector('.note-title');
        if (noteTitle) {
            noteTitle.appendChild(badge);
        }
    }

    /**
     * Capitalize first letter
     */
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Public API
    return {
        classifyCurrentNote,
        classifyAllNotes,
        showClassificationModal,
        updateNoteBadge
    };
})();

// Make globally available
window.NotesAiClassifier = NotesAiClassifier;
