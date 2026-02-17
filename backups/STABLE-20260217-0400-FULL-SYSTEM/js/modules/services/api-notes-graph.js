/**
 * Notes Graph API Client
 * ProductiveApp v5.0
 *
 * Client-side API wrapper for Notes Graph System
 */

const ApiNotesGraph = (function() {
    'use strict';

    const API_BASE_URL = AppConfig?.API_BASE_URL || 'http://localhost:3000/api/v1';

    /**
     * Get auth token from localStorage
     */
    function getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }

    /**
     * Build full API URL
     */
    function buildUrl(path) {
        return `${API_BASE_URL}/notes${path}`;
    }

    /**
     * Make authenticated API request
     */
    async function apiRequest(url, options = {}) {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // ========== Classification Methods ==========

    /**
     * Classify a single note using AI
     * @param {string} noteId - Note ID
     * @param {boolean} force - Force re-classification
     * @returns {Promise<{category, subcategory, keywords, confidence, summary}>}
     */
    async function classifyNote(noteId, force = false) {
        const url = buildUrl(`/${noteId}/classify`);
        return apiRequest(url, {
            method: 'POST',
            body: JSON.stringify({ force })
        });
    }

    /**
     * Classify all notes in a workspace
     * @param {string} workspaceId - Workspace ID
     * @param {boolean} force - Force re-classification
     * @returns {Promise<{classified, skipped, total}>}
     */
    async function classifyAllNotes(workspaceId, force = false) {
        const url = buildUrl(`/workspace/${workspaceId}/classify-all`);
        return apiRequest(url, {
            method: 'POST',
            body: JSON.stringify({ force })
        });
    }

    // ========== Auto-linking Methods ==========

    /**
     * Auto-link notes in a workspace using AI
     * @param {string} workspaceId - Workspace ID
     * @param {object} options - { strategy, minStrength, maxLinksPerNote }
     * @returns {Promise<{linksCreated, timeMs, stats}>}
     */
    async function autoLinkNotes(workspaceId, options = {}) {
        const url = buildUrl(`/workspace/${workspaceId}/auto-link`);
        return apiRequest(url, {
            method: 'POST',
            body: JSON.stringify({
                strategy: options.strategy || 'keyword',
                minStrength: options.minStrength || 0.3,
                maxLinksPerNote: options.maxLinksPerNote || 10
            })
        });
    }

    /**
     * Clear all auto-generated links in a workspace
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<{deleted}>}
     */
    async function clearAutoLinks(workspaceId) {
        const url = buildUrl(`/workspace/${workspaceId}/auto-links`);
        return apiRequest(url, {
            method: 'DELETE'
        });
    }

    // ========== Graph Data Methods ==========

    /**
     * Get graph data for visualization
     * @param {string} workspaceId - Workspace ID
     * @param {object} options - { includeManual, includeAuto }
     * @returns {Promise<{nodes, edges, stats}>}
     */
    async function getGraph(workspaceId, options = {}) {
        const params = new URLSearchParams();
        if (options.includeManual !== undefined) {
            params.set('includeManual', options.includeManual);
        }
        if (options.includeAuto !== undefined) {
            params.set('includeAuto', options.includeAuto);
        }

        const url = buildUrl(`/workspace/${workspaceId}/graph`) +
                    (params.toString() ? `?${params}` : '');

        return apiRequest(url, { method: 'GET' });
    }

    /**
     * Compute and save graph layout
     * @param {string} workspaceId - Workspace ID
     * @param {object} options - { algorithm, iterations }
     * @returns {Promise<{success, algorithm, iterations}>}
     */
    async function computeLayout(workspaceId, options = {}) {
        const url = buildUrl(`/workspace/${workspaceId}/graph/layout`);
        return apiRequest(url, {
            method: 'POST',
            body: JSON.stringify({
                algorithm: options.algorithm || 'force',
                iterations: options.iterations || 100
            })
        });
    }

    // ========== Knowledge Paths Methods ==========

    /**
     * Get all knowledge paths in a workspace
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<Array>}
     */
    async function getKnowledgePaths(workspaceId) {
        const url = buildUrl(`/workspace/${workspaceId}/paths`);
        return apiRequest(url, { method: 'GET' });
    }

    /**
     * Generate knowledge path using AI
     * @param {string} workspaceId - Workspace ID
     * @param {string} topic - Topic to generate path for
     * @param {number} maxNotes - Maximum notes in path
     * @returns {Promise<{path, reasoning}>}
     */
    async function generateKnowledgePath(workspaceId, topic, maxNotes = 8) {
        const url = buildUrl(`/workspace/${workspaceId}/paths/generate`);
        return apiRequest(url, {
            method: 'POST',
            body: JSON.stringify({ topic, maxNotes })
        });
    }

    // Public API
    return {
        // Classification
        classifyNote,
        classifyAllNotes,

        // Auto-linking
        autoLinkNotes,
        clearAutoLinks,

        // Graph data
        getGraph,
        computeLayout,

        // Knowledge paths
        getKnowledgePaths,
        generateKnowledgePath
    };
})();

// Make globally available
window.ApiNotesGraph = ApiNotesGraph;
