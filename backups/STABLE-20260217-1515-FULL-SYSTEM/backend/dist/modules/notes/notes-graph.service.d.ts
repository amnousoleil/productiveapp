/**
 * Notes Graph Service - Graph building, auto-linking, layout computation
 * ProductiveApp v5.0
 */
import type { GetGraphResponse, AutoLinkRequest, AutoLinkResponse, KnowledgePath, GeneratePathRequest, GeneratePathResponse, ClassifyAllNotesResponse, NoteGraphLayout } from './notes-graph.types.js';
export declare class NotesGraphService {
    private aiService;
    constructor();
    /**
     * Build complete graph for a workspace
     */
    buildGraph(workspaceId: string, includeManual?: boolean, includeAuto?: boolean): Promise<GetGraphResponse>;
    /**
     * Calculate graph statistics
     */
    private calculateStats;
    /**
     * Auto-link all notes in a workspace (keyword-based)
     */
    autoLinkWorkspace(workspaceId: string, options?: AutoLinkRequest): Promise<AutoLinkResponse>;
    /**
     * Build keyword index for fast lookup (reserved for future optimization)
     */
    /**
     * Find candidate note pairs using Jaccard similarity
     */
    private findCandidatePairs;
    /**
     * Clear all auto-generated links in a workspace
     */
    clearAutoLinks(workspaceId: string): Promise<number>;
    /**
     * Classify all notes in a workspace
     */
    classifyAllNotes(workspaceId: string, force?: boolean): Promise<ClassifyAllNotesResponse>;
    /**
     * Generate knowledge path for a topic
     */
    generateKnowledgePath(workspaceId: string, createdBy: string, request: GeneratePathRequest): Promise<GeneratePathResponse>;
    /**
     * Get all knowledge paths in a workspace
     */
    getKnowledgePaths(workspaceId: string): Promise<KnowledgePath[]>;
    /**
     * Get cached graph layout
     */
    getCachedLayout(workspaceId: string): Promise<NoteGraphLayout | null>;
    /**
     * Save graph layout cache
     */
    saveLayout(workspaceId: string, layoutData: any, iterations?: number): Promise<void>;
}
//# sourceMappingURL=notes-graph.service.d.ts.map