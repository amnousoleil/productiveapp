/**
 * Notes AI Service - Classification & Auto-linking via OpenAI
 * ProductiveApp v5.0
 */
import type { AILinkingResult, AIPathGenerationResult, NoteClassification } from './notes-graph.types.js';
export declare class NotesAiService {
    private aiService;
    private notesService;
    constructor();
    /**
     * Classify a single note using AI
     */
    classifyNote(noteId: string, force?: boolean): Promise<NoteClassification>;
    /**
     * Build classification prompt
     */
    private buildClassificationPrompt;
    /**
     * Parse AI classification response
     */
    private parseClassificationResult;
    /**
     * Analyze semantic relationship between two notes
     */
    analyzeRelationship(noteAId: string, noteBId: string): Promise<AILinkingResult | null>;
    /**
     * Build linking prompt
     */
    private buildLinkingPrompt;
    /**
     * Parse AI linking response
     */
    private parseLinkingResult;
    /**
     * Generate knowledge path for a topic
     */
    generatePath(workspaceId: string, topic: string, maxNotes?: number): Promise<AIPathGenerationResult>;
    /**
     * Build path generation prompt
     */
    private buildPathGenerationPrompt;
    /**
     * Parse AI path generation response
     */
    private parsePathGenerationResult;
    /**
     * Extract keywords using Jaccard similarity
     */
    extractCommonKeywords(keywordsA: string[], keywordsB: string[]): string[];
    /**
     * Calculate Jaccard similarity coefficient
     */
    calculateJaccard(keywordsA: string[], keywordsB: string[]): number;
}
//# sourceMappingURL=notes-ai.service.d.ts.map