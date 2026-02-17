/**
 * API Galaxy Module
 * ProductiveApp v4.0
 *
 * Connects Galaxy View to the backend canvases API
 * Stores nodes and connections in a dedicated canvas per user
 */

const ApiGalaxy = (function() {
    'use strict';

    const GALAXY_CANVAS_NAME = 'Galaxy View';
    let currentCanvasId = null;

    /**
     * Get workspace ID from tokens
     */
    function getWorkspaceId() {
        return ApiTokens?.getWorkspaceId() || null;
    }

    /**
     * Check if API is available
     */
    function isAvailable() {
        return typeof Api !== 'undefined' &&
               typeof ApiTokens !== 'undefined' &&
               ApiTokens.isAuthenticated() &&
               getWorkspaceId();
    }

    /**
     * Find or create the Galaxy canvas for current user
     * @returns {Promise<string>} - Canvas ID
     */
    async function getOrCreateGalaxyCanvas() {
        if (currentCanvasId) {
            return currentCanvasId;
        }

        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            throw new Error('No workspace selected');
        }

        try {
            // List canvases to find existing Galaxy canvas
            const response = await Api.get(`/canvases/workspace/${workspaceId}?limit=100`);

            if (response.success && response.data) {
                const canvases = response.data.items || response.data;
                const galaxyCanvas = canvases.find(c => c.name === GALAXY_CANVAS_NAME);

                if (galaxyCanvas) {
                    currentCanvasId = galaxyCanvas.id;
                    console.log('📂 Galaxy canvas found:', currentCanvasId);
                    return currentCanvasId;
                }
            }

            // Create new Galaxy canvas if not found
            console.log('📝 Creating new Galaxy canvas...');
            const createResponse = await Api.post(`/canvases/workspace/${workspaceId}`, {
                name: GALAXY_CANVAS_NAME,
                elements: { nodes: [], connections: [] },
                app_state: { zoom: 1, panX: 0, panY: 0 },
                is_public: false,
                is_template: false
            });

            if (createResponse.success && createResponse.data?.canvas) {
                currentCanvasId = createResponse.data.canvas.id;
                console.log('✅ Galaxy canvas created:', currentCanvasId);
                return currentCanvasId;
            }

            throw new Error('Failed to create Galaxy canvas');
        } catch (error) {
            console.error('❌ Error getting/creating Galaxy canvas:', error);
            throw error;
        }
    }

    /**
     * Load Galaxy data (nodes and connections) from backend
     * @returns {Promise<Object>} - { nodes: [], connections: [] }
     */
    async function load() {
        if (!isAvailable()) {
            console.warn('⚠️ Galaxy API not available');
            return { nodes: [], connections: [] };
        }

        try {
            const canvasId = await getOrCreateGalaxyCanvas();
            const response = await Api.get(`/canvases/${canvasId}`);

            if (response.success && response.data?.canvas) {
                const canvas = response.data.canvas;
                const elements = canvas.elements || {};

                console.log('📂 Galaxy loaded from DB:',
                    (elements.nodes || []).length, 'nodes,',
                    (elements.connections || []).length, 'connections'
                );

                return {
                    nodes: elements.nodes || [],
                    connections: elements.connections || [],
                    appState: canvas.app_state || {}
                };
            }

            return { nodes: [], connections: [] };
        } catch (error) {
            console.error('❌ Error loading Galaxy:', error);
            return { nodes: [], connections: [] };
        }
    }

    /**
     * Save Galaxy data (nodes and connections) to backend
     * @param {Array} nodes - Galaxy nodes
     * @param {Array} connections - Galaxy connections
     * @param {Object} appState - App state (zoom, pan, etc.)
     * @returns {Promise<boolean>} - Success
     */
    async function save(nodes, connections, appState = {}) {
        if (!isAvailable()) {
            console.warn('⚠️ Galaxy API not available, data not saved');
            return false;
        }

        try {
            const canvasId = await getOrCreateGalaxyCanvas();

            const response = await Api.put(`/canvases/${canvasId}`, {
                elements: {
                    nodes: nodes || [],
                    connections: connections || []
                },
                app_state: appState
            });

            if (response.success) {
                console.log('💾 Galaxy saved to DB:', nodes.length, 'nodes,', connections.length, 'connections');
                return true;
            }

            console.error('❌ Error saving Galaxy:', response.error);
            return false;
        } catch (error) {
            console.error('❌ Error saving Galaxy:', error);
            return false;
        }
    }

    /**
     * Save a single node (creates/updates)
     * This is a convenience method that saves all data
     * @param {Object} node - Node to save
     * @param {Array} allNodes - All nodes
     * @param {Array} allConnections - All connections
     */
    async function saveNode(node, allNodes, allConnections) {
        return save(allNodes, allConnections);
    }

    /**
     * Delete a node
     * @param {string} nodeId - Node ID to delete
     * @param {Array} allNodes - All nodes (after deletion)
     * @param {Array} allConnections - All connections (after deletion)
     */
    async function deleteNode(nodeId, allNodes, allConnections) {
        return save(allNodes, allConnections);
    }

    /**
     * Save a connection
     * @param {Object} connection - Connection to save
     * @param {Array} allNodes - All nodes
     * @param {Array} allConnections - All connections
     */
    async function saveConnection(connection, allNodes, allConnections) {
        return save(allNodes, allConnections);
    }

    /**
     * Delete a connection
     * @param {string} connectionId - Connection ID to delete
     * @param {Array} allNodes - All nodes
     * @param {Array} allConnections - All connections (after deletion)
     */
    async function deleteConnection(connectionId, allNodes, allConnections) {
        return save(allNodes, allConnections);
    }

    /**
     * Clear the current canvas ID (for logout/switch)
     */
    function clearCache() {
        currentCanvasId = null;
    }

    return {
        isAvailable,
        load,
        save,
        saveNode,
        deleteNode,
        saveConnection,
        deleteConnection,
        clearCache,
        getOrCreateGalaxyCanvas
    };
})();

if (typeof window !== 'undefined') {
    window.ApiGalaxy = ApiGalaxy;
}
