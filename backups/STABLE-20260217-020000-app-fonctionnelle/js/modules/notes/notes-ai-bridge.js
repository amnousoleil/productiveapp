/**
 * NOTES AI BRIDGE - Expose AI features in UI
 * ProductiveApp v6.0 - World Class Edition
 *
 * Bridges existing AI modules to new UI:
 * - notes-ai.js (summaries, suggestions)
 * - notes-ai-classifier.js (auto-tagging)
 * - notes-ai-cluster.js (thematic clusters)
 */

const NotesAiBridge = (function() {
    'use strict';

    let currentSummary = null;
    let currentSuggestions = [];
    let clusters = [];

    // ========== SIDEBAR RENDERING (Clusters) ==========

    function renderSidebar() {
        loadClusters();

        if (clusters.length === 0) {
            return renderSidebarEmpty();
        }

        return `
            <div class="notes-ai-sidebar">
                <div class="notes-ai-sidebar-header">
                    <h4>🧠 Clusters IA</h4>
                    <button class="notes-ai-refresh-btn" onclick="NotesAiBridge.refreshClusters()" title="Actualiser">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"/>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                    </button>
                </div>
                <div class="notes-ai-clusters-list">
                    ${clusters.map(cluster => renderClusterItem(cluster)).join('')}
                </div>
            </div>
        `;
    }

    function renderSidebarEmpty() {
        return `
            <div class="notes-ai-empty">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4m0-4h.01"/>
                </svg>
                <p>Aucun cluster détecté</p>
                <button class="notes-ai-generate-btn" onclick="NotesAiBridge.generateClusters()">
                    Analyser mes notes
                </button>
            </div>
        `;
    }

    function renderClusterItem(cluster) {
        return `
            <div class="notes-ai-cluster-item" onclick="NotesAiBridge.openCluster('${escapeAttr(cluster.id)}')">
                <div class="notes-ai-cluster-header">
                    <span class="notes-ai-cluster-icon">${cluster.icon || '📁'}</span>
                    <span class="notes-ai-cluster-name">${escapeHtml(cluster.name)}</span>
                    <span class="notes-ai-cluster-count">${cluster.noteIds.length}</span>
                </div>
                ${cluster.keywords ? `<div class="notes-ai-cluster-keywords">${cluster.keywords.slice(0, 3).map(kw => `<span class="keyword">${escapeHtml(kw)}</span>`).join('')}</div>` : ''}
            </div>
        `;
    }

    // ========== PANEL RENDERING (Summary + Suggestions) ==========

    function renderPanel(containerEl) {
        if (!containerEl) return;

        const currentNote = typeof NotesModule !== 'undefined' ? NotesModule.getCurrentNote() : null;

        if (!currentNote) {
            containerEl.innerHTML = renderPanelEmpty();
            return;
        }

        containerEl.innerHTML = `
            <div class="notes-ai-panel">
                <!-- Auto-Tag Section -->
                <div class="notes-ai-section">
                    <div class="notes-ai-section-header">
                        <h5>🏷️ Suggestion de tags</h5>
                        <button class="notes-ai-section-btn" onclick="NotesAiBridge.suggestTags()" title="Générer">
                            ✨
                        </button>
                    </div>
                    <div id="notes-ai-tags-container" class="notes-ai-tags-container">
                        <div class="notes-ai-placeholder">Cliquez sur ✨ pour générer</div>
                    </div>
                </div>

                <!-- Summary Section -->
                <div class="notes-ai-section">
                    <div class="notes-ai-section-header">
                        <h5>📝 Résumé</h5>
                        <button class="notes-ai-section-btn" onclick="NotesAiBridge.generateSummary()" title="Générer">
                            ✨
                        </button>
                    </div>
                    <div id="notes-ai-summary-container" class="notes-ai-summary-container">
                        ${currentSummary ? `<p>${escapeHtml(currentSummary)}</p>` : '<div class="notes-ai-placeholder">Cliquez sur ✨ pour générer</div>'}
                    </div>
                </div>

                <!-- Related Notes Section -->
                <div class="notes-ai-section">
                    <div class="notes-ai-section-header">
                        <h5>🔗 Notes similaires</h5>
                        <button class="notes-ai-section-btn" onclick="NotesAiBridge.findSimilar()" title="Rechercher">
                            ✨
                        </button>
                    </div>
                    <div id="notes-ai-similar-container" class="notes-ai-similar-container">
                        ${currentSuggestions.length > 0
                            ? currentSuggestions.map(note => renderSimilarNote(note)).join('')
                            : '<div class="notes-ai-placeholder">Cliquez sur ✨ pour rechercher</div>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    function renderPanelEmpty() {
        return `
            <div class="notes-ai-panel-empty">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4m0-4h.01"/>
                </svg>
                <p>Aucune note sélectionnée</p>
            </div>
        `;
    }

    function renderSimilarNote(note) {
        return `
            <div class="notes-ai-similar-item" onclick="NotesWikiLinks.openNote('${note.id}')">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>${escapeHtml(note.title || 'Sans titre')}</span>
            </div>
        `;
    }

    // ========== AI ACTIONS ==========

    async function suggestTags() {
        const currentNote = typeof NotesModule !== 'undefined' ? NotesModule.getCurrentNote() : null;
        if (!currentNote) return;

        const container = document.getElementById('notes-ai-tags-container');
        if (!container) return;

        container.innerHTML = '<div class="notes-ai-loading">⏳ Génération en cours...</div>';

        try {
            // Use AI classifier if available
            let suggestedTags = [];

            if (typeof NotesAiClassifier !== 'undefined' && NotesAiClassifier.suggestTags) {
                suggestedTags = await NotesAiClassifier.suggestTags(currentNote.content);
            } else if (typeof ApiAi !== 'undefined') {
                // Fallback to generic AI API
                const response = await ApiAi.generate(`Suggère 3-5 tags pertinents pour cette note en français (format: mot-clé simple sans #):\n\n${currentNote.content.substring(0, 500)}`);
                suggestedTags = response.split(/[,\n]/).map(t => t.trim()).filter(Boolean).slice(0, 5);
            } else {
                throw new Error('AI module not available');
            }

            container.innerHTML = suggestedTags.map(tag => `
                <button class="notes-ai-tag-suggestion" onclick="NotesAiBridge.applyTag('${escapeAttr(tag)}')">
                    #${escapeHtml(tag)}
                </button>
            `).join('');

        } catch (error) {
            console.error('Failed to suggest tags', error);
            container.innerHTML = '<div class="notes-ai-error">❌ Échec de la génération</div>';
        }
    }

    async function generateSummary() {
        const currentNote = typeof NotesModule !== 'undefined' ? NotesModule.getCurrentNote() : null;
        if (!currentNote || !currentNote.content) return;

        const container = document.getElementById('notes-ai-summary-container');
        if (!container) return;

        container.innerHTML = '<div class="notes-ai-loading">⏳ Génération en cours...</div>';

        try {
            let summary = '';

            if (typeof NotesAi !== 'undefined' && NotesAi.generateSummary) {
                summary = await NotesAi.generateSummary(currentNote.content);
            } else if (typeof ApiAi !== 'undefined') {
                summary = await ApiAi.generate(`Résume cette note en 2-3 phrases concises en français:\n\n${currentNote.content.substring(0, 1000)}`);
            } else {
                throw new Error('AI module not available');
            }

            currentSummary = summary;
            container.innerHTML = `<p>${escapeHtml(summary)}</p>`;

            if (typeof Toast !== 'undefined') {
                Toast.success('Résumé généré');
            }

        } catch (error) {
            console.error('Failed to generate summary', error);
            container.innerHTML = '<div class="notes-ai-error">❌ Échec de la génération</div>';
        }
    }

    async function findSimilar() {
        const currentNote = typeof NotesModule !== 'undefined' ? NotesModule.getCurrentNote() : null;
        if (!currentNote) return;

        const container = document.getElementById('notes-ai-similar-container');
        if (!container) return;

        container.innerHTML = '<div class="notes-ai-loading">⏳ Recherche en cours...</div>';

        try {
            let similarNotes = [];

            if (typeof NotesAi !== 'undefined' && NotesAi.findSimilar) {
                similarNotes = await NotesAi.findSimilar(currentNote.id, 5);
            } else {
                // Fallback: simple keyword matching
                const notes = NotesModule.getNotes().filter(n => n.id !== currentNote.id);
                const keywords = extractKeywords(currentNote.content);

                similarNotes = notes
                    .map(note => ({
                        ...note,
                        score: calculateSimilarity(keywords, extractKeywords(note.content))
                    }))
                    .filter(n => n.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5);
            }

            currentSuggestions = similarNotes;

            if (similarNotes.length === 0) {
                container.innerHTML = '<div class="notes-ai-placeholder">Aucune note similaire trouvée</div>';
            } else {
                container.innerHTML = similarNotes.map(note => renderSimilarNote(note)).join('');
            }

        } catch (error) {
            console.error('Failed to find similar notes', error);
            container.innerHTML = '<div class="notes-ai-error">❌ Échec de la recherche</div>';
        }
    }

    async function applyTag(tag) {
        const currentNote = typeof NotesModule !== 'undefined' ? NotesModule.getCurrentNote() : null;
        if (!currentNote) return;

        const tags = currentNote.tags || [];
        if (!tags.includes(tag)) {
            tags.push(tag);
            await NotesModule.updateNote(currentNote.id, { tags });

            if (typeof Toast !== 'undefined') {
                Toast.success(`Tag #${tag} ajouté`);
            }

            // Refresh UI
            if (typeof NotesModule.render === 'function') {
                NotesModule.render();
            }
        }
    }

    // ========== CLUSTERS ==========

    function loadClusters() {
        if (typeof NotesAiCluster !== 'undefined' && NotesAiCluster.getClusters) {
            clusters = NotesAiCluster.getClusters();
        } else {
            clusters = [];
        }
    }

    async function generateClusters() {
        if (typeof NotesAiCluster === 'undefined') {
            if (typeof Toast !== 'undefined') {
                Toast.error('Module AI Cluster non disponible');
            }
            return;
        }

        if (typeof Toast !== 'undefined') {
            Toast.info('Analyse des notes en cours...');
        }

        try {
            await NotesAiCluster.generateClusters();
            loadClusters();

            if (typeof NotesLayoutV6 !== 'undefined') {
                NotesLayoutV6.switchSidebarTab('ai');
            }

            if (typeof Toast !== 'undefined') {
                Toast.success(`${clusters.length} clusters détectés`);
            }
        } catch (error) {
            console.error('Failed to generate clusters', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Échec de l\'analyse');
            }
        }
    }

    function refreshClusters() {
        generateClusters();
    }

    function openCluster(clusterId) {
        // TODO: Filter notes by cluster
        if (typeof Toast !== 'undefined') {
            Toast.info(`Cluster : ${clusterId}`);
        }
    }

    // ========== UTILS ==========

    function extractKeywords(text) {
        if (!text) return [];

        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3);

        const freq = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);

        return Object.keys(freq)
            .sort((a, b) => freq[b] - freq[a])
            .slice(0, 10);
    }

    function calculateSimilarity(keywords1, keywords2) {
        const intersection = keywords1.filter(k => keywords2.includes(k));
        return intersection.length;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function escapeAttr(text) {
        if (!text) return '';
        return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    // ========== PUBLIC API ==========

    return {
        renderSidebar,
        renderPanel,
        suggestTags,
        generateSummary,
        findSimilar,
        applyTag,
        generateClusters,
        refreshClusters,
        openCluster
    };

})();
