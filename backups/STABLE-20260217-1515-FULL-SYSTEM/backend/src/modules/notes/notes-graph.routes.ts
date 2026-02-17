/**
 * Notes Graph Routes - API route definitions
 * ProductiveApp v5.0
 */

import { Router } from 'express';
import { NotesGraphController } from './notes-graph.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { createRateLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();
const controller = new NotesGraphController();

// AI rate limiter (10 requests per minute per user)
const aiRateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 10,
  keyPrefix: 'ai-graph'
});

// ========== Classification Routes ==========

/**
 * POST /api/v1/notes/:noteId/classify
 * Classify a single note using AI
 */
router.post(
  '/:noteId/classify',
  authMiddleware,
  aiRateLimiter,
  controller.classify
);

/**
 * POST /api/v1/notes/workspace/:workspaceId/classify-all
 * Classify all notes in a workspace (async job)
 */
router.post(
  '/workspace/:workspaceId/classify-all',
  authMiddleware,
  aiRateLimiter,
  controller.classifyAll
);

// ========== Auto-linking Routes ==========

/**
 * POST /api/v1/notes/workspace/:workspaceId/auto-link
 * Auto-link notes using AI relationship detection
 */
router.post(
  '/workspace/:workspaceId/auto-link',
  authMiddleware,
  aiRateLimiter,
  controller.autoLink
);

/**
 * DELETE /api/v1/notes/workspace/:workspaceId/auto-links
 * Clear all auto-generated links
 */
router.delete(
  '/workspace/:workspaceId/auto-links',
  authMiddleware,
  controller.clearAutoLinks
);

// ========== Graph Data Routes ==========

/**
 * GET /api/v1/notes/workspace/:workspaceId/graph
 * Get graph data (nodes + edges) for visualization
 */
router.get(
  '/workspace/:workspaceId/graph',
  authMiddleware,
  controller.getGraph
);

/**
 * POST /api/v1/notes/workspace/:workspaceId/graph/layout
 * Compute and save graph layout
 */
router.post(
  '/workspace/:workspaceId/graph/layout',
  authMiddleware,
  controller.computeLayout
);

// ========== Knowledge Paths Routes ==========

/**
 * GET /api/v1/notes/workspace/:workspaceId/paths
 * List all knowledge paths
 */
router.get(
  '/workspace/:workspaceId/paths',
  authMiddleware,
  controller.getPaths
);

/**
 * POST /api/v1/notes/workspace/:workspaceId/paths/generate
 * Generate knowledge path using AI
 */
router.post(
  '/workspace/:workspaceId/paths/generate',
  authMiddleware,
  aiRateLimiter,
  controller.generatePath
);

export default router;
