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

    async function analyzeAndCluster() {
        const notes = NotesModule.getNotes();

        if (notes.length === 0) {
            if (window.Toast) {
                window.Toast.warning('Aucune note à analyser');
            }
            return { clusters: [], connections: [] };
        }

        if (notes.length < 3) {
            if (window.Toast) {
                window.Toast.warning('Minimum 3 notes nécessaires pour le clustering');
            }
            return { clusters: [], connections: [] };
        }

        // Show loading toast
        if (window.Toast) {
            window.Toast.info('Analyse IA en cours...', { duration: 10000 });
        }

        try {
            const result = await callAiClusteringAPI(notes);

            if (result.clusters && result.connections) {
                clusters = result.clusters;
                connections = result.connections;
                lastClusterDate = new Date().toISOString();

                saveToCache();

                if (window.Toast) {
                    window.Toast.success(
                        `Clustering terminé: ${clusters.length} thèmes, ${connections.length} connexions`,
                        { duration: 5000 }
                    );
                }

                return result;
            } else {
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            console.error('AI Clustering failed:', error);

            if (window.Toast) {
                window.Toast.error('Erreur lors du clustering IA');
            }

            return { clusters: [], connections: [] };
        }
    }

    async function callAiClusteringAPI(notes) {
        if (typeof ApiAi === 'undefined' || !ApiAi.generate) {
            throw new Error('ApiAi not available');
        }

        // Prepare notes data for AI
        const notesData = notes.map(note => ({
            id: note.id,
            title: note.title || 'Sans titre',
            content: (note.content || '').substring(0, 500), // Limit to 500 chars per note
            tags: note.tags || []
        }));

        const systemPrompt = `Tu es un expert en analyse sémantique et clustering de notes.

Analyse les notes fournies et retourne UNIQUEMENT un JSON valide avec cette structure exacte:

{
  "clusters": [
    {
      "theme": "Nom du thème",
      "noteIds": ["note_123", "note_456"],
      "keywords": ["mot-clé1", "mot-clé2"],
      "color": "#8b5cf6"
    }
  ],
  "connections": [
    {
      "fromNoteId": "note_123",
      "toNoteId": "note_456",
      "strength": 0.8,
      "reason": "Raison du lien"
    }
  ]
}

RÈGLES:
- Base ton analyse sur la SÉMANTIQUE, pas juste les mots-clés
- Groupe les notes par thèmes conceptuels (3-7 clusters max)
- Détecte les connexions logiques entre notes (strength: 0.0-1.0)
- Utilise des couleurs variées pour les clusters
- NE génère PAS de texte avant ou après le JSON
- RETOURNE UNIQUEMENT le JSON brut`;

        const userPrompt = `Notes à analyser:\n\n${JSON.stringify(notesData, null, 2)}`;

        try {
            const response = await ApiAi.generate(userPrompt, {
                temperature: 0.3,
                systemPrompt: systemPrompt
            });

            if (!response || !response.content) {
                throw new Error('Empty API response');
            }

            // Extract JSON from response (handle markdown code blocks)
            let jsonText = response.content.trim();

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
