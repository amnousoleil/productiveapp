/**
 * NOTES AI CLUSTER - Automatic clustering & connections via ChatGPT
 * ProductiveApp v5.0 - Phase 3
 * Requires: ApiAi (existing in ProductiveApp)
 */

const NotesAiCluster = (function() {
    'use strict';

    let clusters = [];
    let connections = [];
    let lastClusterDate = null;
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // ========== CACHE MANAGEMENT ==========

    function getCacheKey() {
        const memberId = localStorage.getItem('selectedMemberId') || 'default';
        return `productiveapp_notes_clusters_${memberId}`;
    }

    function loadFromCache() {
        try {
            const cached = localStorage.getItem(getCacheKey());
            if (!cached) return false;

            const data = JSON.parse(cached);
            const age = Date.now() - new Date(data.timestamp).getTime();

            if (age > CACHE_DURATION) {
                console.log('🔮 Cluster cache expired');
                return false;
            }

            clusters = data.clusters || [];
            connections = data.connections || [];
            lastClusterDate = data.timestamp;

            console.log(`🔮 Loaded clusters from cache: ${clusters.length} clusters, ${connections.length} connections`);
            return true;
        } catch (e) {
            console.warn('Failed to load cluster cache', e);
            return false;
        }
    }

    function saveToCache() {
        try {
            const data = {
                clusters,
                connections,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(getCacheKey(), JSON.stringify(data));
            console.log('🔮 Clusters saved to cache');
        } catch (e) {
            console.warn('Failed to save cluster cache', e);
        }
    }

    function clearCache() {
        try {
            localStorage.removeItem(getCacheKey());
            clusters = [];
            connections = [];
            lastClusterDate = null;
            console.log('🔮 Cluster cache cleared');
        } catch (e) {
            console.warn('Failed to clear cluster cache', e);
        }
    }

    // ========== AI CLUSTERING ==========

    // silent=true suppresses all toasts (used for background auto-clustering)
    async function analyzeAndCluster(silent) {
        const notes = NotesModule.getNotes();

        if (notes.length === 0) {
            if (!silent && window.Toast) window.Toast.warning('Aucune note à analyser');
            return { clusters: [], connections: [] };
        }

        if (notes.length < 3) {
            if (!silent && window.Toast) window.Toast.warning('Minimum 3 notes nécessaires pour le clustering');
            return { clusters: [], connections: [] };
        }

        // Show loading toast (only if not silent)
        if (!silent && window.Toast) {
            window.Toast.info('Analyse IA des clusters en cours...', { duration: 8000 });
        }

        try {
            const result = await callAiClusteringAPI(notes);

            if (result.clusters && result.connections) {
                clusters = result.clusters;
                connections = result.connections;
                lastClusterDate = new Date().toISOString();

                saveToCache();

                if (!silent && window.Toast) {
                    window.Toast.success(
                        `✦ ${clusters.length} clusters · ${connections.length} connexions détectés`,
                        { duration: 5000 }
                    );
                }

                return result;
            } else {
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            console.error('AI Clustering failed:', error);
            if (!silent && window.Toast) {
                window.Toast.error('Erreur lors du clustering IA');
            }
            return { clusters: [], connections: [] };
        }
    }

    async function callAiClusteringAPI(notes) {
        if (typeof ApiAi === 'undefined' || !ApiAi.generate) {
            throw new Error('ApiAi not available');
        }

        // Prepare notes data for AI (limit size to avoid payload issues)
        const notesToAnalyze = notes.slice(0, 30); // Max 30 notes per request
        const notesData = notesToAnalyze.map(note => ({
            id: note.id,
            title: (note.title || 'Sans titre').substring(0, 80),
            content: (note.content || '').substring(0, 200), // 200 chars per note max
            tags: (note.tags || []).slice(0, 5)
        }));

        const systemPrompt = `Tu es un expert en analyse sémantique. Analyse ces notes et retourne UNIQUEMENT un JSON valide avec cette structure:
{"clusters":[{"theme":"Nom","noteIds":["id1","id2"],"keywords":["mot1"],"color":"#hex"}],"connections":[{"fromNoteId":"id1","toNoteId":"id2","strength":0.8,"reason":"raison"}]}
RÈGLES: 3-7 clusters max, connexions strength 0.0-1.0, couleurs hex variées, JSON brut uniquement sans markdown.`;

        const userPrompt = `Notes à analyser:\n${JSON.stringify(notesData)}`;

        try {
            // ApiAi.generate(prompt, system) — returns string directly
            const responseText = await ApiAi.generate(userPrompt, systemPrompt);

            if (!responseText) {
                throw new Error('Empty API response');
            }

            // Extract JSON from response (handle markdown code blocks)
            let jsonText = String(responseText).trim();

            // Remove markdown code blocks if present
            jsonText = jsonText.replace(/```json\s*\n?/g, '');
            jsonText = jsonText.replace(/```\s*$/g, '');
            jsonText = jsonText.trim();

            // Parse JSON
            const result = JSON.parse(jsonText);

            // Validate structure
            if (!result.clusters || !Array.isArray(result.clusters)) {
                throw new Error('Invalid clusters format');
            }

            if (!result.connections || !Array.isArray(result.connections)) {
                throw new Error('Invalid connections format');
            }

            return result;
        } catch (error) {
            console.error('AI API call failed:', error);
            throw error;
        }
    }

    // ========== GETTERS ==========

    function getClusters() {
        return clusters;
    }

    function getConnections() {
        return connections;
    }

    function getClusterByNoteId(noteId) {
        return clusters.find(cluster =>
            cluster.noteIds && cluster.noteIds.includes(noteId)
        );
    }

    function getConnectionsForNote(noteId) {
        return connections.filter(conn =>
            conn.fromNoteId === noteId || conn.toNoteId === noteId
        );
    }

    function getCacheAge() {
        if (!lastClusterDate) return null;
        const age = Date.now() - new Date(lastClusterDate).getTime();
        return age;
    }

    function isCacheValid() {
        const age = getCacheAge();
        if (age === null) return false;
        return age < CACHE_DURATION;
    }

    // ========== RENDER BADGE ==========

    function renderClusterBadge(noteId) {
        const cluster = getClusterByNoteId(noteId);
        if (!cluster) return '';

        return `
            <span class="note-cluster-badge"
                  style="background: ${cluster.color}20; color: ${cluster.color}; border-color: ${cluster.color}40;"
                  title="${escapeHtml(cluster.theme)}">
                ${escapeHtml(cluster.theme)}
            </span>
        `;
    }

    function renderConnectionIndicator(noteId) {
        const conns = getConnectionsForNote(noteId);
        if (conns.length === 0) return '';

        return `
            <span class="note-connections-indicator" title="${conns.length} connexion(s)">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                ${conns.length}
            </span>
        `;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========== RENDER CONTROLS ==========

    function renderControlPanel() {
        const age = getCacheAge();
        const ageText = age
            ? formatCacheAge(age)
            : 'Jamais';

        const isValid = isCacheValid();

        return `
            <div class="cluster-control-panel">
                <div class="cluster-info">
                    <span class="cluster-count">${clusters.length} thèmes</span>
                    <span class="cluster-connections">${connections.length} connexions</span>
                    <span class="cluster-cache ${isValid ? 'valid' : 'expired'}">
                        Cache: ${ageText}
                    </span>
                </div>
                <div class="cluster-actions">
                    <button class="cluster-btn cluster-btn-primary"
                            onclick="NotesAiCluster.triggerRecluster()"
                            ${isValid ? '' : ''}>
                        🔮 ${isValid ? 'Re-cluster' : 'Analyser'}
                    </button>
                    ${clusters.length > 0 ? `
                        <button class="cluster-btn"
                                onclick="NotesAiCluster.clearCache()">
                            🗑️ Effacer
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function formatCacheAge(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        if (hours < 1) return 'Récent';
        if (hours < 24) return `Il y a ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Il y a ${days}j`;
    }

    // ========== ACTIONS ==========

    async function triggerRecluster() {
        const confirmed = confirm(
            'Lancer une nouvelle analyse IA ?\n\n' +
            'Cela va analyser toutes vos notes et peut prendre quelques secondes.'
        );

        if (!confirmed) return;

        await analyzeAndCluster();

        // Trigger graph refresh if available
        if (typeof NotesGraphView !== 'undefined' && NotesGraphView.refresh) {
            NotesGraphView.refresh();
        }
    }

    // ========== INIT ==========

    function init() {
        loadFromCache();
        console.log('🔮 NotesAiCluster initialized');
    }

    // ========== PUBLIC API ==========

    return {
        init,
        analyzeAndCluster,
        getClusters,
        getConnections,
        getClusterByNoteId,
        getConnectionsForNote,
        getCacheAge,
        isCacheValid,
        clearCache,
        renderClusterBadge,
        renderConnectionIndicator,
        renderControlPanel,
        triggerRecluster
    };
})();

if (typeof window !== 'undefined') {
    window.NotesAiCluster = NotesAiCluster;
}
