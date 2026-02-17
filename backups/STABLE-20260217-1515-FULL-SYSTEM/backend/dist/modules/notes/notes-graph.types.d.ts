/**
 * Notes Graph System - TypeScript Type Definitions
 * ProductiveApp v5.0
 */
export interface NoteClassification {
    note_id: string;
    category: string;
    subcategory: string;
    keywords: string[];
    confidence: number;
    ai_summary: string;
    classified_at: Date;
    updated_at: Date;
}
export interface NoteAutoLink {
    source_note_id: string;
    target_note_id: string;
    link_type: 'semantic' | 'reference' | 'concept' | 'prerequisite' | 'expands';
    strength: number;
    ai_reasoning: string;
    created_at: Date;
}
export interface KnowledgePath {
    id: string;
    workspace_id: string;
    name: string;
    description: string | null;
    note_ids: string[];
    path_type: 'learning' | 'project' | 'research' | 'analysis' | null;
    ai_generated: boolean;
    created_by: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface NoteGraphLayout {
    workspace_id: string;
    layout_data: GraphLayoutData;
    force_layout_iterations: number;
    computed_at: Date;
}
export interface ClassifyNoteRequest {
    force?: boolean;
}
export interface ClassifyNoteResponse {
    category: string;
    subcategory: string;
    keywords: string[];
    confidence: number;
    summary: string;
}
export interface ClassifyAllNotesRequest {
    force?: boolean;
}
export interface ClassifyAllNotesResponse {
    classified: number;
    skipped: number;
    total: number;
}
export interface AutoLinkRequest {
    strategy?: 'keyword' | 'embedding';
    minStrength?: number;
    maxLinksPerNote?: number;
}
export interface AutoLinkResponse {
    linksCreated: number;
    timeMs: number;
    stats: {
        notesAnalyzed: number;
        pairsEvaluated: number;
        linksCreated: number;
    };
}
export interface GetGraphRequest {
    includeManual?: boolean;
    includeAuto?: boolean;
}
export interface GetGraphResponse {
    nodes: GraphNode[];
    edges: GraphEdge[];
    stats: GraphStats;
}
export interface ComputeLayoutRequest {
    algorithm?: 'force' | 'hierarchical';
    iterations?: number;
}
export interface GeneratePathRequest {
    topic: string;
    maxNotes?: number;
}
export interface GeneratePathResponse {
    path: KnowledgePath;
    reasoning: string;
}
export interface GraphNode {
    id: string;
    title: string;
    category: string | null;
    subcategory: string | null;
    keywords: string[];
    wordCount: number;
    isPinned: boolean;
    createdAt: Date;
    position?: Position3D;
}
export interface GraphEdge {
    source: string;
    target: string;
    type: 'manual' | 'semantic' | 'reference' | 'concept' | 'prerequisite' | 'expands';
    strength: number;
    aiReasoning?: string;
}
export interface Position3D {
    x: number;
    y: number;
    z: number;
}
export interface GraphLayoutData {
    nodes: Array<{
        id: string;
        position: Position3D;
    }>;
    edges: Array<{
        id: string;
        source: string;
        target: string;
    }>;
}
export interface GraphStats {
    totalNotes: number;
    totalLinks: number;
    avgLinksPerNote: number;
    categories: Record<string, number>;
}
export interface AIClassificationPrompt {
    title: string;
    content: string;
}
export interface AIClassificationResult {
    category: string;
    subcategory: string;
    keywords: string[];
    summary: string;
    confidence: number;
}
export interface AILinkingPrompt {
    titleA: string;
    keywordsA: string[];
    summaryA: string;
    titleB: string;
    keywordsB: string[];
    summaryB: string;
}
export interface AILinkingResult {
    isRelated: boolean;
    strength: number;
    linkType: 'semantic' | 'reference' | 'concept' | 'prerequisite' | 'expands';
    reasoning: string;
}
export interface AIPathGenerationPrompt {
    topic: string;
    notes: Array<{
        id: string;
        title: string;
        summary: string;
    }>;
}
export interface AIPathGenerationResult {
    name: string;
    pathType: 'learning' | 'project' | 'research' | 'analysis';
    noteIds: string[];
    reasoning: string;
}
export interface KeywordIndex {
    [keyword: string]: string[];
}
export interface NotePair {
    noteA: {
        id: string;
        title: string;
        keywords: string[];
        summary: string;
    };
    noteB: {
        id: string;
        title: string;
        keywords: string[];
        summary: string;
    };
    jaccard: number;
}
export interface ForceLayoutConfig {
    iterations: number;
    repulsionStrength: number;
    attractionStrength: number;
    damping: number;
    cooling: number;
}
export declare const CATEGORIES: readonly ["technical", "creative", "planning", "research", "personal", "reference", "meeting", "idea"];
export type Category = typeof CATEGORIES[number];
export declare const LINK_TYPES: readonly ["manual", "semantic", "reference", "concept", "prerequisite", "expands"];
export type LinkType = typeof LINK_TYPES[number];
export declare const PATH_TYPES: readonly ["learning", "project", "research", "analysis"];
export type PathType = typeof PATH_TYPES[number];
//# sourceMappingURL=notes-graph.types.d.ts.map