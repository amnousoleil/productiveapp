/**
 * Notes Graph Controller - HTTP request handlers
 * ProductiveApp v5.0
 */

import type { Request, Response } from 'express';
import { NotesGraphService } from './notes-graph.service.js';
import { NotesAiService } from './notes-ai.service.js';
import { AppError } from '../../utils/helpers.js';
import type {
  ClassifyNoteRequest,
  ClassifyAllNotesRequest,
  AutoLinkRequest,
  ComputeLayoutRequest,
  GeneratePathRequest
} from './notes-graph.types.js';

export class NotesGraphController {
  private graphService: NotesGraphService;
  private aiService: NotesAiService;

  constructor() {
    this.graphService = new NotesGraphService();
    this.aiService = new NotesAiService();
  }

  /**
   * POST /api/v1/notes/:noteId/classify
   * Classify a single note
   */
  classify = async (req: Request, res: Response): Promise<void> => {
    try {
      const { noteId } = req.params;
      const { force = false } = req.body as ClassifyNoteRequest;

      const classification = await this.aiService.classifyNote(noteId, force);

      res.json({
        category: classification.category,
        subcategory: classification.subcategory,
        keywords: classification.keywords,
        confidence: classification.confidence,
        summary: classification.ai_summary
      });
    } catch (error) {
      console.error('Classify note error:', error);
      if (error instanceof Error) {
        throw AppError.internal(error.message);
      }
      throw AppError.internal('Failed to classify note');
    }
  };

  /**
   * POST /api/v1/notes/workspace/:workspaceId/classify-all
   * Classify all notes in a workspace
   */
  classifyAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const { force = false } = req.body as ClassifyAllNotesRequest;

      const result = await this.graphService.classifyAllNotes(workspaceId, force);

      res.json(result);
    } catch (error) {
      console.error('Classify all notes error:', error);
      throw AppError.internal('Failed to classify notes');
    }
  };

  /**
   * POST /api/v1/notes/workspace/:workspaceId/auto-link
   * Auto-link all notes in a workspace
   */
  autoLink = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const options = req.body as AutoLinkRequest;

      const result = await this.graphService.autoLinkWorkspace(workspaceId, options);

      res.json(result);
    } catch (error) {
      console.error('Auto-link error:', error);
      throw AppError.internal('Failed to auto-link notes');
    }
  };

  /**
   * DELETE /api/v1/notes/workspace/:workspaceId/auto-links
   * Clear all auto-generated links
   */
  clearAutoLinks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;

      const deleted = await this.graphService.clearAutoLinks(workspaceId);

      res.json({ deleted });
    } catch (error) {
      console.error('Clear auto-links error:', error);
      throw AppError.internal('Failed to clear auto-links');
    }
  };

  /**
   * GET /api/v1/notes/workspace/:workspaceId/graph
   * Get graph data for visualization
   */
  getGraph = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const {
        includeManual = true,
        includeAuto = true
      } = req.query as any;

      const graph = await this.graphService.buildGraph(
        workspaceId,
        includeManual === 'true' || includeManual === true,
        includeAuto === 'true' || includeAuto === true
      );

      res.json(graph);
    } catch (error) {
      console.error('Get graph error:', error);
      throw AppError.internal('Failed to build graph');
    }
  };

  /**
   * POST /api/v1/notes/workspace/:workspaceId/graph/layout
   * Compute and save graph layout
   */
  computeLayout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const { algorithm = 'force', iterations = 100 } = req.body as ComputeLayoutRequest;

      // For now, just save empty layout (client-side computes it)
      // In future, implement server-side force layout
      await this.graphService.saveLayout(workspaceId, { nodes: [], edges: [] }, iterations);

      res.json({ success: true, algorithm, iterations });
    } catch (error) {
      console.error('Compute layout error:', error);
      throw AppError.internal('Failed to compute layout');
    }
  };

  /**
   * GET /api/v1/notes/workspace/:workspaceId/paths
   * Get all knowledge paths
   */
  getPaths = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;

      const paths = await this.graphService.getKnowledgePaths(workspaceId);

      res.json(paths);
    } catch (error) {
      console.error('Get paths error:', error);
      throw AppError.internal('Failed to get knowledge paths');
    }
  };

  /**
   * POST /api/v1/notes/workspace/:workspaceId/paths/generate
   * Generate knowledge path using AI
   */
  generatePath = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const request = req.body as GeneratePathRequest;
      const userId = (req as any).user?.id || '';

      if (!request.topic) {
        throw AppError.badRequest('Topic is required');
      }

      const result = await this.graphService.generateKnowledgePath(
        workspaceId,
        userId,
        request
      );

      res.json(result);
    } catch (error) {
      console.error('Generate path error:', error);
      if (error instanceof Error && error.message.includes('No classified notes')) {
        throw AppError.badRequest('No classified notes found. Please classify notes first.');
      }
      throw AppError.internal('Failed to generate knowledge path');
    }
  };
}
