import fs from 'fs';
import path from 'path';
import { sql } from '../../config/database.js';
import { openai } from '../../config/openai.js';
import { generateUUID, AppError } from '../../utils/helpers.js';
import type { UUID } from '../../types/index.js';
import { NotesService } from './notes.service.js';

/**
 * Notes Vocal Service - Whisper STT Integration
 *
 * Handles audio transcription using OpenAI Whisper API
 * Costs: $0.006/minute ($0.01/minute rounded billing)
 *
 * Features:
 * - Audio transcription (WebM, MP3, WAV formats)
 * - Cost tracking per transcription
 * - Temporary file management
 * - French language optimization
 */
export class NotesVocalService {
  private notesService: NotesService;
  private tempDir: string;

  constructor() {
    this.notesService = new NotesService();
    this.tempDir = '/tmp/productiveapp-audio';

    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Transcribe audio file using OpenAI Whisper API
   *
   * @param audioBuffer - Audio file buffer (WebM, MP3, WAV)
   * @param language - ISO 639-1 language code (default: 'fr')
   * @returns Transcribed text
   *
   * @throws AppError if transcription fails
   *
   * Cost: $0.006/minute ($0.01/minute rounded billing)
   * Accuracy: 95%+ for French
   * Processing time: 3-10s for 2min audio
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    language: string = 'fr'
  ): Promise<{
    text: string;
    duration: number;
    cost: number;
  }> {
    const startTime = Date.now();
    let tempPath: string | null = null;

    try {
      // Save buffer to temporary file
      const tempFileName = `audio-${generateUUID()}.webm`;
      tempPath = path.join(this.tempDir, tempFileName);

      fs.writeFileSync(tempPath, audioBuffer);
      console.log(`✓ Audio saved to temp file: ${tempPath} (${audioBuffer.length} bytes)`);

      // Calculate audio duration (estimate based on 64kbps bitrate)
      // Real duration would require parsing WebM/MP3 headers, but this is sufficient for cost tracking
      const estimatedDurationSeconds = audioBuffer.length / (64000 / 8);
      const estimatedDurationMinutes = estimatedDurationSeconds / 60;

      // Call Whisper API
      console.log(`🎤 Calling Whisper API (language: ${language}, ~${estimatedDurationSeconds.toFixed(1)}s)...`);

      const file = fs.createReadStream(tempPath);
      const response = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language,
        response_format: 'json'
      });

      const processingTime = Date.now() - startTime;
      console.log(`✓ Whisper transcription completed in ${processingTime}ms`);

      // Calculate cost: $0.006 per minute (Whisper pricing as of 2024)
      // OpenAI rounds up to nearest second: https://openai.com/pricing
      const costPerMinute = 0.006;
      const cost = Math.ceil(estimatedDurationSeconds) / 60 * costPerMinute;

      return {
        text: response.text,
        duration: estimatedDurationSeconds,
        cost
      };

    } catch (error: any) {
      console.error('✗ Whisper transcription failed:', error);
      throw AppError.internal(`Whisper transcription failed: ${error.message}`);

    } finally {
      // Cleanup: Delete temporary file
      if (tempPath && fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
          console.log(`✓ Temp file deleted: ${tempPath}`);
        } catch (cleanupError) {
          console.warn('⚠ Failed to delete temp file:', cleanupError);
        }
      }
    }
  }

  /**
   * Create a vocal note from audio input
   *
   * Flow:
   * 1. Decode Base64 audio → Buffer
   * 2. Transcribe via Whisper API
   * 3. Create note with transcribed content
   * 4. Save transcription metadata
   * 5. Track API cost
   *
   * @param workspaceId - Workspace UUID
   * @param userId - User UUID
   * @param audioBase64 - Base64-encoded audio (WebM, MP3, WAV)
   * @param language - ISO 639-1 language code (default: 'fr')
   *
   * @returns Created note + transcription metadata
   *
   * Performance: < 5s end-to-end for 2min audio
   */
  async createVocalNote(
    workspaceId: UUID,
    userId: UUID,
    audioBase64: string,
    language: string = 'fr'
  ): Promise<{
    note: any;
    transcription: {
      id: UUID;
      text: string;
      duration: number;
      cost: number;
    };
  }> {
    const startTime = Date.now();

    try {
      // 1. Decode Base64 → Buffer
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      console.log(`📥 Received audio: ${audioBuffer.length} bytes (Base64 decoded)`);

      if (audioBuffer.length === 0) {
        throw AppError.badRequest('Audio buffer is empty');
      }

      // 2. Transcribe via Whisper
      const { text, duration, cost } = await this.transcribeAudio(audioBuffer, language);

      if (!text || text.trim().length === 0) {
        throw AppError.badRequest('Transcription returned empty text');
      }

      console.log(`✓ Transcription: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}" (${text.length} chars)`);

      // 3. Create note with transcribed content
      // Title = first 100 characters of transcription
      const title = text.length > 100 ? text.substring(0, 97) + '...' : text;

      const note = await this.notesService.create(workspaceId, userId, {
        title,
        content: text,
        is_pinned: false,
        is_public: false,
        is_template: false,
        tags: ['vocal']
      });

      console.log(`✓ Note created: ${note.id} (title: "${title}")`);

      // 4. Save transcription metadata
      const transcriptionId = generateUUID();
      const now = new Date();

      await sql`
        INSERT INTO audio_transcriptions ${sql({
          id: transcriptionId,
          note_id: note.id,
          workspace_id: workspaceId,
          user_id: userId,
          transcription_text: text,
          audio_format: 'webm',
          audio_duration_seconds: duration,
          audio_size_bytes: audioBuffer.length,
          language,
          stt_provider: 'whisper',
          stt_model: 'whisper-1',
          cost_usd: cost,
          created_at: now
        })}
      `;

      // Link transcription to note
      await sql`
        UPDATE notes
        SET is_vocal = true, vocal_transcription_id = ${transcriptionId}
        WHERE id = ${note.id}
      `;

      console.log(`✓ Transcription metadata saved: ${transcriptionId}`);

      // 5. Track API cost
      await sql`
        INSERT INTO api_cost_tracking ${sql({
          id: generateUUID(),
          workspace_id: workspaceId,
          user_id: userId,
          feature: 'stt',
          provider: 'openai',
          model: 'whisper-1',
          audio_minutes: duration / 60,
          cost_usd: cost,
          created_at: now
        })}
      `;

      const totalTime = Date.now() - startTime;
      console.log(`✅ Vocal note created in ${totalTime}ms (cost: $${cost.toFixed(4)})`);

      return {
        note,
        transcription: {
          id: transcriptionId,
          text,
          duration,
          cost
        }
      };

    } catch (error: any) {
      console.error('✗ Vocal note creation failed:', error);
      throw error;
    }
  }

  /**
   * Get transcription metadata for a note
   *
   * @param noteId - Note UUID
   * @returns Transcription metadata or null if not a vocal note
   */
  async getTranscription(noteId: UUID): Promise<any | null> {
    const transcriptions = await sql`
      SELECT * FROM audio_transcriptions
      WHERE note_id = ${noteId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return transcriptions.length > 0 ? transcriptions[0] : null;
  }

  /**
   * Get all vocal notes for a workspace
   *
   * @param workspaceId - Workspace UUID
   * @param limit - Max results (default: 50)
   * @returns Array of vocal notes with transcription metadata
   */
  async getVocalNotes(
    workspaceId: UUID,
    limit: number = 50
  ): Promise<any[]> {
    const notes = await sql`
      SELECT
        n.*,
        at.transcription_text,
        at.audio_duration_seconds,
        at.language,
        at.cost_usd,
        at.created_at as transcription_created_at
      FROM notes n
      INNER JOIN audio_transcriptions at ON at.note_id = n.id
      WHERE n.workspace_id = ${workspaceId}
        AND n.is_vocal = true
        AND n.deleted_at IS NULL
      ORDER BY n.created_at DESC
      LIMIT ${limit}
    `;

    return notes;
  }

  /**
   * Calculate total STT costs for a workspace (last 30 days)
   *
   * @param workspaceId - Workspace UUID
   * @returns Total cost in USD
   */
  async getCosts(workspaceId: UUID): Promise<{
    total: number;
    count: number;
    avgCost: number;
    totalMinutes: number;
  }> {
    const result = await sql`
      SELECT
        COUNT(*) as count,
        SUM(cost_usd) as total_cost,
        AVG(cost_usd) as avg_cost,
        SUM(audio_minutes) as total_minutes
      FROM api_cost_tracking
      WHERE workspace_id = ${workspaceId}
        AND feature = 'stt'
        AND created_at > NOW() - INTERVAL '30 days'
    `;

    const stats = result[0];

    return {
      total: parseFloat(stats.total_cost || 0),
      count: parseInt(stats.count || 0),
      avgCost: parseFloat(stats.avg_cost || 0),
      totalMinutes: parseFloat(stats.total_minutes || 0)
    };
  }

  /**
   * Cleanup old temporary audio files (> 1 hour old)
   * Should be called periodically (e.g., via cron job)
   */
  async cleanupTempFiles(): Promise<void> {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const oneHourMs = 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > oneHourMs) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`✓ Cleaned up ${deletedCount} old temp audio files`);
      }

    } catch (error) {
      console.error('✗ Temp file cleanup failed:', error);
    }
  }
}
