/**
 * Notes AI Service - Classification & Auto-linking via OpenAI
 * ProductiveApp v5.0
 */

import { sql } from '../../config/database.js';
import { AiService } from '../ai/ai.service.js';
import { NotesService } from './notes.service.js';
import type {
  AIClassificationPrompt,
  AIClassificationResult,
  AILinkingPrompt,
  AILinkingResult,
  AIPathGenerationPrompt,
  AIPathGenerationResult,
  NoteClassification
} from './notes-graph.types.js';

export class NotesAiService {
  private aiService: AiService;
  private notesService: NotesService;

  constructor() {
    this.aiService = new AiService();
    this.notesService = new NotesService();
  }

  /**
   * Classify a single note using AI
   */
  async classifyNote(noteId: string, force: boolean = false): Promise<NoteClassification> {
    // Check if already classified
    if (!force) {
      const existing = await sql<NoteClassification[]>`
        SELECT * FROM note_classifications WHERE note_id = ${noteId}
      `;
      if (existing.length > 0) {
        return existing[0];
      }
    }

    // Get note content
    const note = await this.notesService.getById(noteId);
    if (!note) {
      throw new Error(`Note not found: ${noteId}`);
    }

    // Truncate content to avoid token limits
    const content = (note.content || '').substring(0, 10000);

    // Build classification prompt
    const prompt = this.buildClassificationPrompt({
      title: note.title,
      content
    });

    // Call OpenAI
    const response = await this.aiService.generate({
      prompt,
      system: 'You are an expert knowledge manager. Return ONLY valid JSON, no markdown.'
    });

    // Parse AI response
    const result = this.parseClassificationResult(response.content);

    // Store classification
    await sql`
      INSERT INTO note_classifications ${sql({
        note_id: noteId,
        category: result.category,
        subcategory: result.subcategory,
        keywords: JSON.stringify(result.keywords),
        confidence: result.confidence,
        ai_summary: result.summary
      })}
      ON CONFLICT (note_id) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        keywords = EXCLUDED.keywords,
        confidence = EXCLUDED.confidence,
        ai_summary = EXCLUDED.ai_summary,
        updated_at = NOW()
    `;

    // Return classification record
    const [classification] = await sql<NoteClassification[]>`
      SELECT * FROM note_classifications WHERE note_id = ${noteId}
    `;

    return classification;
  }

  /**
   * Build classification prompt
   */
  private buildClassificationPrompt(data: AIClassificationPrompt): string {
    return `
Tu es un expert en gestion des connaissances. Analyse cette note et classifie-la.

TITRE: ${data.title}
CONTENU: ${data.content}

Retourne UNIQUEMENT du JSON valide avec cette structure exacte :
{
  "category": "l'une de : technical, creative, planning, research, personal, reference, meeting, idea",
  "subcategory": "sujet spécifique (ex: 'backend', 'design', 'strategy')",
  "keywords": ["tableau", "de", "3-7", "mots-clés"],
  "summary": "Résumé en une phrase (max 100 chars)",
  "confidence": 0.85
}

Règles :
- category DOIT être l'une des 8 catégories listées
- subcategory est une chaîne libre
- keywords doit contenir 3-7 mots-clés pertinents
- summary max 100 caractères
- confidence entre 0.0 et 1.0
- AUCUN markdown, UNIQUEMENT du JSON brut
    `.trim();
  }

  /**
   * Parse AI classification response
   */
  private parseClassificationResult(content: string): AIClassificationResult {
    try {
      // Remove markdown code blocks if present
      let cleaned = content.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```/g, '');
      }

      const result = JSON.parse(cleaned);

      // Validate required fields
      if (!result.category || !result.keywords || !result.summary) {
        throw new Error('Missing required fields in AI response');
      }

      // Ensure keywords is an array
      if (!Array.isArray(result.keywords)) {
        result.keywords = [];
      }

      // Default values
      result.subcategory = result.subcategory || '';
      result.confidence = result.confidence || 0.5;

      return result as AIClassificationResult;
    } catch (error) {
      console.error('Failed to parse classification result:', error);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Analyze semantic relationship between two notes
   */
  async analyzeRelationship(
    noteAId: string,
    noteBId: string
  ): Promise<AILinkingResult | null> {
    // Get classifications for both notes
    const [classA] = await sql<NoteClassification[]>`
      SELECT * FROM note_classifications WHERE note_id = ${noteAId}
    `;
    const [classB] = await sql<NoteClassification[]>`
      SELECT * FROM note_classifications WHERE note_id = ${noteBId}
    `;

    if (!classA || !classB) {
      return null; // Cannot analyze without classifications
    }

    // Get note titles
    const noteA = await this.notesService.getById(noteAId);
    const noteB = await this.notesService.getById(noteBId);

    if (!noteA || !noteB) {
      return null;
    }

    // Build linking prompt
    const prompt = this.buildLinkingPrompt({
      titleA: noteA.title,
      keywordsA: classA.keywords,
      summaryA: classA.ai_summary,
      titleB: noteB.title,
      keywordsB: classB.keywords,
      summaryB: classB.ai_summary
    });

    // Call OpenAI
    const response = await this.aiService.generate({
      prompt,
      system: 'You are an expert at detecting semantic relationships. Return ONLY valid JSON.',
    });

    // Parse result
    const result = this.parseLinkingResult(response.content);

    return result.isRelated ? result : null;
  }

  /**
   * Build linking prompt
   */
  private buildLinkingPrompt(data: AILinkingPrompt): string {
    return `
Analyse la relation sémantique entre ces deux notes.

NOTE A: ${data.titleA}
Keywords: ${data.keywordsA.join(', ')}
Summary: ${data.summaryA}

NOTE B: ${data.titleB}
Keywords: ${data.keywordsB.join(', ')}
Summary: ${data.summaryB}

Retourne UNIQUEMENT du JSON valide :
{
  "isRelated": true/false,
  "strength": 0.0-1.0,
  "linkType": "semantic" | "reference" | "concept" | "prerequisite" | "expands",
  "reasoning": "Explication brève (max 150 chars)"
}

Règles :
- isRelated: true si les notes partagent des concepts communs
- strength: 0.3-0.5 (faible), 0.6-0.8 (moyen), 0.9-1.0 (fort)
- linkType: type de relation la plus appropriée
- reasoning: pourquoi ces notes sont liées
- AUCUN markdown, UNIQUEMENT du JSON brut
    `.trim();
  }

  /**
   * Parse AI linking response
   */
  private parseLinkingResult(content: string): AILinkingResult {
    try {
      // Remove markdown code blocks if present
      let cleaned = content.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```/g, '');
      }

      const result = JSON.parse(cleaned);

      // Validate required fields
      if (typeof result.isRelated !== 'boolean') {
        throw new Error('Missing isRelated field');
      }

      // Default values
      result.strength = result.strength || 0.5;
      result.linkType = result.linkType || 'semantic';
      result.reasoning = result.reasoning || '';

      return result as AILinkingResult;
    } catch (error) {
      console.error('Failed to parse linking result:', error);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Generate knowledge path for a topic
   */
  async generatePath(
    workspaceId: string,
    topic: string,
    maxNotes: number = 8
  ): Promise<AIPathGenerationResult> {
    // Get all classified notes in workspace
    const notes = await sql<any[]>`
      SELECT
        n.id,
        n.title,
        nc.ai_summary as summary,
        nc.category,
        nc.keywords
      FROM notes n
      JOIN note_classifications nc ON nc.note_id = n.id
      WHERE n.workspace_id = ${workspaceId}
        AND n.deleted_at IS NULL
      ORDER BY n.created_at DESC
      LIMIT ${maxNotes * 2}
    `;

    if (notes.length === 0) {
      throw new Error('No classified notes found');
    }

    // Build path generation prompt
    const prompt = this.buildPathGenerationPrompt({
      topic,
      notes: notes.map(n => ({
        id: n.id,
        title: n.title,
        summary: n.summary || ''
      }))
    });

    // Call OpenAI
    const response = await this.aiService.generate({
      prompt,
      system: 'You are an expert learning path designer. Return ONLY valid JSON.',
    });

    // Parse result
    const result = this.parsePathGenerationResult(response.content);

    return result;
  }

  /**
   * Build path generation prompt
   */
  private buildPathGenerationPrompt(data: AIPathGenerationPrompt): string {
    const notesText = data.notes.map((n, i) => `${i + 1}. [${n.id}] ${n.title}: ${n.summary}`).join('\n');

    return `
Tu es un expert en création de chemins d'apprentissage. Crée un chemin conceptuel sur le sujet "${data.topic}".

NOTES DISPONIBLES:
${notesText}

Retourne UNIQUEMENT du JSON valide :
{
  "name": "Nom du chemin (court)",
  "pathType": "learning" | "project" | "research" | "analysis",
  "noteIds": ["id1", "id2", "id3"],
  "reasoning": "Pourquoi cet ordre (max 200 chars)"
}

Règles :
- noteIds: ordre logique (fondamental → avancé)
- Sélectionne 3-8 notes pertinentes pour le sujet
- pathType selon le contexte
- AUCUN markdown, UNIQUEMENT du JSON brut
    `.trim();
  }

  /**
   * Parse AI path generation response
   */
  private parsePathGenerationResult(content: string): AIPathGenerationResult {
    try {
      // Remove markdown code blocks if present
      let cleaned = content.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```/g, '');
      }

      const result = JSON.parse(cleaned);

      // Validate required fields
      if (!result.name || !result.noteIds || !Array.isArray(result.noteIds)) {
        throw new Error('Missing required fields');
      }

      // Default values
      result.pathType = result.pathType || 'learning';
      result.reasoning = result.reasoning || '';

      return result as AIPathGenerationResult;
    } catch (error) {
      console.error('Failed to parse path generation result:', error);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Extract keywords using Jaccard similarity
   */
  extractCommonKeywords(keywordsA: string[], keywordsB: string[]): string[] {
    const setA = new Set(keywordsA.map(k => k.toLowerCase()));
    const setB = new Set(keywordsB.map(k => k.toLowerCase()));
    const intersection = [...setA].filter(k => setB.has(k));
    return intersection;
  }

  /**
   * Calculate Jaccard similarity coefficient
   */
  calculateJaccard(keywordsA: string[], keywordsB: string[]): number {
    const setA = new Set(keywordsA.map(k => k.toLowerCase()));
    const setB = new Set(keywordsB.map(k => k.toLowerCase()));
    const intersection = [...setA].filter(k => setB.has(k));
    const union = new Set([...setA, ...setB]);

    if (union.size === 0) return 0;
    return intersection.length / union.size;
  }
}
