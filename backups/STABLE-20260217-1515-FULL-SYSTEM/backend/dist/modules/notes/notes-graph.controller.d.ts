/**
 * Notes Graph Controller - HTTP request handlers
 * ProductiveApp v5.0
 */
import type { Request, Response } from 'express';
export declare class NotesGraphController {
    private graphService;
    private aiService;
    constructor();
    /**
     * POST /api/v1/notes/:noteId/classify
     * Classify a single note
     */
    classify: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/v1/notes/workspace/:workspaceId/classify-all
     * Classify all notes in a workspace
     */
    classifyAll: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/v1/notes/workspace/:workspaceId/auto-link
     * Auto-link all notes in a workspace
     */
    autoLink: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE /api/v1/notes/workspace/:workspaceId/auto-links
     * Clear all auto-generated links
     */
    clearAutoLinks: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/v1/notes/workspace/:workspaceId/graph
     * Get graph data for visualization
     */
    getGraph: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/v1/notes/workspace/:workspaceId/graph/layout
     * Compute and save graph layout
     */
    computeLayout: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/v1/notes/workspace/:workspaceId/paths
     * Get all knowledge paths
     */
    getPaths: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/v1/notes/workspace/:workspaceId/paths/generate
     * Generate knowledge path using AI
     */
    generatePath: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=notes-graph.controller.d.ts.map