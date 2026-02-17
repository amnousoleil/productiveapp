"use strict";
/**
 * Notes Graph Routes - API route definitions
 * ProductiveApp v5.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notes_graph_controller_js_1 = require("./notes-graph.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const rateLimit_middleware_js_1 = require("../../middleware/rateLimit.middleware.js");
const router = (0, express_1.Router)();
const controller = new notes_graph_controller_js_1.NotesGraphController();
// AI rate limiter (10 requests per minute per user)
const aiRateLimiter = (0, rateLimit_middleware_js_1.createRateLimiter)({
    windowMs: 60000,
    max: 10,
    keyPrefix: 'ai-graph'
});
// ========== Classification Routes ==========
/**
 * POST /api/v1/notes/:noteId/classify
 * Classify a single note using AI
 */
router.post('/:noteId/classify', auth_middleware_js_1.authMiddleware, aiRateLimiter, controller.classify);
/**
 * POST /api/v1/notes/workspace/:workspaceId/classify-all
 * Classify all notes in a workspace (async job)
 */
router.post('/workspace/:workspaceId/classify-all', auth_middleware_js_1.authMiddleware, aiRateLimiter, controller.classifyAll);
// ========== Auto-linking Routes ==========
/**
 * POST /api/v1/notes/workspace/:workspaceId/auto-link
 * Auto-link notes using AI relationship detection
 */
router.post('/workspace/:workspaceId/auto-link', auth_middleware_js_1.authMiddleware, aiRateLimiter, controller.autoLink);
/**
 * DELETE /api/v1/notes/workspace/:workspaceId/auto-links
 * Clear all auto-generated links
 */
router.delete('/workspace/:workspaceId/auto-links', auth_middleware_js_1.authMiddleware, controller.clearAutoLinks);
// ========== Graph Data Routes ==========
/**
 * GET /api/v1/notes/workspace/:workspaceId/graph
 * Get graph data (nodes + edges) for visualization
 */
router.get('/workspace/:workspaceId/graph', auth_middleware_js_1.authMiddleware, controller.getGraph);
/**
 * POST /api/v1/notes/workspace/:workspaceId/graph/layout
 * Compute and save graph layout
 */
router.post('/workspace/:workspaceId/graph/layout', auth_middleware_js_1.authMiddleware, controller.computeLayout);
// ========== Knowledge Paths Routes ==========
/**
 * GET /api/v1/notes/workspace/:workspaceId/paths
 * List all knowledge paths
 */
router.get('/workspace/:workspaceId/paths', auth_middleware_js_1.authMiddleware, controller.getPaths);
/**
 * POST /api/v1/notes/workspace/:workspaceId/paths/generate
 * Generate knowledge path using AI
 */
router.post('/workspace/:workspaceId/paths/generate', auth_middleware_js_1.authMiddleware, aiRateLimiter, controller.generatePath);
exports.default = router;
//# sourceMappingURL=notes-graph.routes.js.map