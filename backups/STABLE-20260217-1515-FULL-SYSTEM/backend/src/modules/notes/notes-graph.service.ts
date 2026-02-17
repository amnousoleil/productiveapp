/**
 * Notes Graph Service - Graph building, auto-linking, layout computation
 * ProductiveApp v5.0
 */

import { sql } from '../../config/database.js';
// import { NotesService } from './notes.service.js';
import { NotesAiService } from './notes-ai.service.js';
import type {
  GetGraphResponse,
  GraphNode,
  GraphEdge,
  GraphStats,
  AutoLinkRequest,
  AutoLinkResponse,
  KnowledgePath,
  GeneratePathRequest,
  GeneratePathResponse,
  ClassifyAllNotesResponse,
  NotePair,
  // KeywordIndex, // Reserved for future optimization
  NoteGraphLayout
} from './notes-graph.types.js';

export class NotesGraphService {
  // private notesService: NotesService; // Reserved for future use
  private aiService: NotesAiService;

  constructor() {
    // this.notesService = new NotesService();
    this.aiService = new NotesAiService();
  }

  /**
   * Build complete graph for a workspace
   */
  async buildGraph(
    workspaceId: string,
    includeManual: boolean = true,
    includeAuto: boolean = true
  ): Promise<GetGraphResponse> {
    // Get all notes with classifications
    const notes = await sql<any[]>`
      SELECT
        n.id,
        n.title,
        n.word_count,
        n.is_pinned,
        n.created_at,
        nc.category,
        nc.subcategory,
        nc.keywords
      FROM notes n
      LEFT JOIN note_classifications nc ON nc.note_id = n.id
      WHERE n.workspace_id = ${workspaceId}
        AND n.deleted_at IS NULL
      ORDER BY n.created_at DESC
    `;

    // Build nodes
    const nodes: GraphNode[] = notes.map(n => ({
      id: n.id,
      title: n.title || 'Sans titre',
      category: n.category || null,
      subcategory: n.subcategory || null,
      keywords: n.keywords || [],
      wordCount: n.word_count || 0,
      isPinned: n.is_pinned || false,
      createdAt: n.created_at
    }));

    // Build edges (both manual and auto)
    const edges: GraphEdge[] = [];

    // Manual links
    if (includeManual) {
      const manualLinks = await sql<any[]>`
        SELECT source_note_id as source, target_note_id as target
        FROM note_links
        WHERE source_note_id IN ${sql(notes.map(n => n.id))}
      `;

      edges.push(...manualLinks.map(link => ({
        source: link.source,
        target: link.target,
        type: 'manual' as const,
        strength: 1.0
      })));
    }

    // Auto links
    if (includeAuto) {
      const autoLinks = await sql<any[]>`
        SELECT
          source_note_id as source,
          target_note_id as target,
          link_type,
          strength,
          ai_reasoning
        FROM note_auto_links
        WHERE source_note_id IN ${sql(notes.map(n => n.id))}
        ORDER BY strength DESC
      `;

      edges.push(...autoLinks.map(link => ({
        source: link.source,
        target: link.target,
        type: link.link_type,
        strength: link.strength,
        aiReasoning: link.ai_reasoning
      })));
    }

    // Calculate stats
    const stats = this.calculateStats(nodes, edges);

    return { nodes, edges, stats };
  }

  /**
   * Calculate graph statistics
   */
  private calculateStats(nodes: GraphNode[], edges: GraphEdge[]): GraphStats {
    const categories: Record<string, number> = {};

    nodes.forEach(node => {
      const cat = node.category || 'uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    return {
      totalNotes: nodes.length,
      totalLinks: edges.length,
      avgLinksPerNote: nodes.length > 0 ? edges.length / nodes.length : 0,
      categories
    };
  }

  /**
   * Auto-link all notes in a workspace (keyword-based)
   */
  async autoLinkWorkspace(
    workspaceId: string,
    options: AutoLinkRequest = {}
  ): Promise<AutoLinkResponse> {
    const startTime = Date.now();

    const {
      strategy: _strategy = 'keyword', // Reserved for embedding strategy
      minStrength = 0.3,
      maxLinksPerNote = 10
    } = options;

    // Get all classified notes
    const notes = await sql<any[]>`
      SELECT
        n.id,
        n.title,
        nc.category,
        nc.keywords,
        nc.ai_summary
      FROM notes n
      JOIN note_classifications nc ON nc.note_id = n.id
      WHERE n.workspace_id = ${workspaceId}
        AND n.deleted_at IS NULL
    `;

    if (notes.length < 2) {
      return {
        linksCreated: 0,
        timeMs: Date.now() - startTime,
        stats: {
          notesAnalyzed: notes.length,
          pairsEvaluated: 0,
          linksCreated: 0
        }
      };
    }

    // Build keyword index for pre-filtering (reserved for future optimization)
    // const keywordIndex = this.buildKeywordIndex(notes);

    // Find candidate pairs with Jaccard similarity
    const candidates = this.findCandidatePairs(notes, minStrength);

    console.log(`Found ${candidates.length} candidate pairs (pre-filtered from ${notes.length * (notes.length - 1) / 2})`);

    // Evaluate pairs with AI
    let linksCreated = 0;
    const linkCounts: Record<string, number> = {};

    for (const pair of candidates) {
      // Check link limits
      const countA = linkCounts[pair.noteA.id] || 0;
      const countB = linkCounts[pair.noteB.id] || 0;

      if (countA >= maxLinksPerNote || countB >= maxLinksPerNote) {
        continue; // Skip if either note has too many links
      }

      // Analyze relationship with AI
      const result = await this.aiService.analyzeRelationship(
        pair.noteA.id,
        pair.noteB.id
      );

      if (result && result.strength >= minStrength) {
        // Create link
        await sql`
          INSERT INTO note_auto_links ${sql({
            source_note_id: pair.noteA.id,
            target_note_id: pair.noteB.id,
            link_type: result.linkType,
            strength: result.strength,
            ai_reasoning: result.reasoning
          })}
          ON CONFLICT (source_note_id, target_note_id) DO UPDATE SET
            strength = EXCLUDED.strength,
            ai_reasoning = EXCLUDED.ai_reasoning
        `;

        linksCreated++;
        linkCounts[pair.noteA.id] = countA + 1;
        linkCounts[pair.noteB.id] = countB + 1;
      }
    }

    const timeMs = Date.now() - startTime;

    return {
      linksCreated,
      timeMs,
      stats: {
        notesAnalyzed: notes.length,
        pairsEvaluated: candidates.length,
        linksCreated
      }
    };
  }

  /**
   * Build keyword index for fast lookup (reserved for future optimization)
   */
  // private buildKeywordIndex(notes: any[]): KeywordIndex {
  //   const index: KeywordIndex = {};
  //   notes.forEach(note => {
  //     const keywords = note.keywords || [];
  //     keywords.forEach((keyword: string) => {
  //       const key = keyword.toLowerCase();
  //       if (!index[key]) {
  //         index[key] = [];
  //       }
  //       if (!index[key].includes(note.id)) {
  //         index[key].push(note.id);
  //       }
  //     });
  //   });
  //   return index;
  // }

  /**
   * Find candidate note pairs using Jaccard similarity
   */
  private findCandidatePairs(notes: any[], minSimilarity: number = 0.2): NotePair[] {
    const pairs: NotePair[] = [];

    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const noteA = notes[i];
        const noteB = notes[j];

        // Calculate Jaccard similarity
        const jaccard = this.aiService.calculateJaccard(
          noteA.keywords || [],
          noteB.keywords || []
        );

        // Only consider pairs with some keyword overlap
        if (jaccard >= minSimilarity) {
          pairs.push({
            noteA: {
              id: noteA.id,
              title: noteA.title,
              keywords: noteA.keywords || [],
              summary: noteA.ai_summary || ''
            },
            noteB: {
              id: noteB.id,
              title: noteB.title,
              keywords: noteB.keywords || [],
              summary: noteB.ai_summary || ''
            },
            jaccard
          });
        }
      }
    }

    // Sort by Jaccard similarity (highest first)
    pairs.sort((a, b) => b.jaccard - a.jaccard);

    return pairs;
  }

  /**
   * Clear all auto-generated links in a workspace
   */
  async clearAutoLinks(workspaceId: string): Promise<number> {
    const result = await sql`
      DELETE FROM note_auto_links
      WHERE source_note_id IN (
        SELECT id FROM notes WHERE workspace_id = ${workspaceId}
      )
    `;

    return result.count;
  }

  /**
   * Classify all notes in a workspace
   */
  async classifyAllNotes(
    workspaceId: string,
    force: boolean = false
  ): Promise<ClassifyAllNotesResponse> {
    // Get all notes
    const notes = await sql<any[]>`
      SELECT id FROM notes
      WHERE workspace_id = ${workspaceId}
        AND deleted_at IS NULL
    `;

    let classified = 0;
    let skipped = 0;

    for (const note of notes) {
      try {
        await this.aiService.classifyNote(note.id, force);
        classified++;
      } catch (error) {
        console.error(`Failed to classify note ${note.id}:`, error);
        skipped++;
      }
    }

    return {
      classified,
      skipped,
      total: notes.length
    };
  }

  /**
   * Generate knowledge path for a topic
   */
  async generateKnowledgePath(
    workspaceId: string,
    createdBy: string,
    request: GeneratePathRequest
  ): Promise<GeneratePathResponse> {
    // Generate path using AI
    const result = await this.aiService.generatePath(
      workspaceId,
      request.topic,
      request.maxNotes || 8
    );

    // Create knowledge path record
    const [path] = await sql<KnowledgePath[]>`
      INSERT INTO knowledge_paths ${sql({
        workspace_id: workspaceId,
        name: result.name,
        description: result.reasoning,
        note_ids: result.noteIds,
        path_type: result.pathType,
        ai_generated: true,
        created_by: createdBy
      })}
      RETURNING *
    `;

    return {
      path,
      reasoning: result.reasoning
    };
  }

  /**
   * Get all knowledge paths in a workspace
   */
  async getKnowledgePaths(workspaceId: string): Promise<KnowledgePath[]> {
    const paths = await sql<KnowledgePath[]>`
      SELECT * FROM knowledge_paths
      WHERE workspace_id = ${workspaceId}
      ORDER BY created_at DESC
    `;

    return paths;
  }

  /**
   * Get cached graph layout
   */
  async getCachedLayout(workspaceId: string): Promise<NoteGraphLayout | null> {
    const [layout] = await sql<NoteGraphLayout[]>`
      SELECT * FROM note_graph_layout
      WHERE workspace_id = ${workspaceId}
    `;

    return layout || null;
  }

  /**
   * Save graph layout cache
   */
  async saveLayout(
    workspaceId: string,
    layoutData: any,
    iterations: number = 100
  ): Promise<void> {
    await sql`
      INSERT INTO note_graph_layout ${sql({
        workspace_id: workspaceId,
        layout_data: JSON.stringify(layoutData),
        force_layout_iterations: iterations
      })}
      ON CONFLICT (workspace_id) DO UPDATE SET
        layout_data = EXCLUDED.layout_data,
        force_layout_iterations = EXCLUDED.force_layout_iterations,
        computed_at = NOW()
    `;
  }
}
