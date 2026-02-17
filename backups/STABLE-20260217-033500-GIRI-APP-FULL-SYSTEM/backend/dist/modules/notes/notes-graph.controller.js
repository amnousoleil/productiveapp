"use strict";
/**
 * Notes Graph Controller - HTTP request handlers
 * ProductiveApp v5.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesGraphController = void 0;
const notes_graph_service_js_1 = require("./notes-graph.service.js");
const notes_ai_service_js_1 = require("./notes-ai.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
class NotesGraphController {
    graphService;
    aiService;
    constructor() {
        this.graphService = new notes_graph_service_js_1.NotesGraphService();
        this.aiService = new notes_ai_service_js_1.NotesAiService();
    }
    /**
     * POST /api/v1/notes/:noteId/classify
     * Classify a single note
     */
    classify = async (req, res) => {
        try {
            const { noteId } = req.params;
            const { force = false } = req.body;
            const classification = await this.aiService.classifyNote(noteId, force);
            res.json({
                category: classification.category,
                subcategory: classification.subcategory,
                keywords: classification.keywords,
                confidence: classification.confidence,
                summary: classification.ai_summary
            });
        }
        catch (error) {
            console.error('Classify note error:', error);
            if (error instanceof Error) {
                throw helpers_js_1.AppError.internal(error.message);
            }
            throw helpers_js_1.AppError.internal('Failed to classify note');
        }
    };
    /**
     * POST /api/v1/notes/workspace/:workspaceId/classify-all
     * Classify all notes in a workspace
     */
    classifyAll = async (req, res) => {
        try {
            const { workspaceId } = req.params;
            const { force = false } = req.body;
            const result = await this.graphService.classifyAllNotes(workspaceId, force);
            res.json(result);
        }
        catch (error) {
            console.error('Classify all notes error:', error);
            throw helpers_js_1.AppError.internal('Failed to classify notes');
        }
    };
    /**
     * POST /api/v1/notes/workspace/:workspaceId/auto-link
     * Auto-link all notes in a workspace
     */
    autoLink = async (req, res) => {
        try {
            const { workspaceId } = req.params;
            const options = req.body;
            const result = await this.graphService.autoLinkWorkspace(workspaceId, options);
            res.json(result);
        }
        catch (error) {
            console.error('Auto-link error:', error);
            throw helpers_js_1.AppError.internal('Failed to auto-link notes');
        }
    };
    /**
     * DELETE /api/v1/notes/workspace/:workspaceId/auto-links
     * Clear all auto-generated links
     */
    clearAutoLinks = async (req, res) => {
        try {
            const { workspaceId } = req.params;
            const deleted = await this.graphService.clearAutoLinks(workspaceId);
            res.json({ deleted });
        }
        catch (error) {
            console.error('Clear auto-links error:', error);
            throw helpers_js_1.AppError.internal('Failed to clear auto-links');
        }
    };
    /**
     * GET /api/v1/notes/workspace/:workspaceId/graph
     * Get graph data for visualization
     */
    getGraph = async (req, res) => {
        try {
            const { workspaceId } = req.params;
            const { includeManual = true, includeAuto = true } = req.query;
            const graph = await this.graphService.buildGraph(workspaceId, includeManual === 'true' || includeManual === true, includeAuto === 'true' || includeAuto === true);
            res.json(graph);
        }
        catch (error) {
            console.error('Get graph error:', error);
            throw helpers_js_1.AppError.internal('Failed to build graph');
        }
    };
    /**
     * POST /api/v1/notes/workspace/:workspaceId/graph/layout
     * Compute and save graph layout
     */
    computeLayout = async (req, res) => {
        try {
            const { workspaceId } = req.params;
            const { algorithm = 'force', iterations = 100 } = req.body;
            // For now, just save empty layout (client-side computes it)
            // In future, implement server-side force layout
            await this.graphService.saveLayout(workspaceId, { nodes: [], edges: [] }, iterations);
            res.json({ success: true, algorithm, iterations });
        }
        catch (error) {
            console.error('Compute layout error:', error);
            throw helpers_js_1.AppError.internal('Failed to compute layout');
        }
    };
    /**
     * GET /api/v1/notes/workspace/:workspaceId/paths
     * Get all knowledge paths
     */
    getPaths = async (req, res) => {
        try {
            const { workspaceId } = req.params;
            const paths = await this.graphService.getKnowledgePaths(workspaceId);
            res.json(paths);
        }
        catch (error) {
            console.error('Get paths error:', error);
            throw helpers_js_1.AppError.internal('Failed to get knowledge paths');
        }
    };
    /**
     * POST /api/v1/notes/workspace/:workspaceId/paths/generate
     * Generate knowledge path using AI
     */
    generatePath = async (req, res) => {
        try {
            const { workspaceId } = req.params;
            const request = req.body;
            const userId = req.user?.id || '';
            if (!request.topic) {
                throw helpers_js_1.AppError.badRequest('Topic is required');
            }
            const result = await this.graphService.generateKnowledgePath(workspaceId, userId, request);
            res.json(result);
        }
        catch (error) {
            console.error('Generate path error:', error);
            if (error instanceof Error && error.message.includes('No classified notes')) {
                throw helpers_js_1.AppError.badRequest('No classified notes found. Please classify notes first.');
            }
            throw helpers_js_1.AppError.internal('Failed to generate knowledge path');
        }
    };
}
exports.NotesGraphController = NotesGraphController;
//# sourceMappingURL=notes-graph.controller.js.map