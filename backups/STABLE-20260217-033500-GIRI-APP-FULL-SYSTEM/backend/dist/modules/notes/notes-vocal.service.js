"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesVocalService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_js_1 = require("../../config/database.js");
const openai_js_1 = require("../../config/openai.js");
const helpers_js_1 = require("../../utils/helpers.js");
const notes_service_js_1 = require("./notes.service.js");
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
class NotesVocalService {
    notesService;
    tempDir;
    constructor() {
        this.notesService = new notes_service_js_1.NotesService();
        this.tempDir = '/tmp/productiveapp-audio';
        // Ensure temp directory exists
        if (!fs_1.default.existsSync(this.tempDir)) {
            fs_1.default.mkdirSync(this.tempDir, { recursive: true });
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
    async transcribeAudio(audioBuffer, language = 'fr') {
        const startTime = Date.now();
        let tempPath = null;
        try {
            // Save buffer to temporary file
            const tempFileName = `audio-${(0, helpers_js_1.generateUUID)()}.webm`;
            tempPath = path_1.default.join(this.tempDir, tempFileName);
            fs_1.default.writeFileSync(tempPath, audioBuffer);
            console.log(`✓ Audio saved to temp file: ${tempPath} (${audioBuffer.length} bytes)`);
            // Calculate audio duration (estimate based on 64kbps bitrate)
            // Real duration would require parsing WebM/MP3 headers, but this is sufficient for cost tracking
            const estimatedDurationSeconds = audioBuffer.length / (64000 / 8);
            const estimatedDurationMinutes = estimatedDurationSeconds / 60;
            // Call Whisper API
            console.log(`🎤 Calling Whisper API (language: ${language}, ~${estimatedDurationSeconds.toFixed(1)}s)...`);
            const file = fs_1.default.createReadStream(tempPath);
            const response = await openai_js_1.openai.audio.transcriptions.create({
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
        }
        catch (error) {
            console.error('✗ Whisper transcription failed:', error);
            throw helpers_js_1.AppError.internal(`Whisper transcription failed: ${error.message}`);
        }
        finally {
            // Cleanup: Delete temporary file
            if (tempPath && fs_1.default.existsSync(tempPath)) {
                try {
                    fs_1.default.unlinkSync(tempPath);
                    console.log(`✓ Temp file deleted: ${tempPath}`);
                }
                catch (cleanupError) {
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
    async createVocalNote(workspaceId, userId, audioBase64, language = 'fr') {
        const startTime = Date.now();
        try {
            // 1. Decode Base64 → Buffer
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            console.log(`📥 Received audio: ${audioBuffer.length} bytes (Base64 decoded)`);
            if (audioBuffer.length === 0) {
                throw helpers_js_1.AppError.badRequest('Audio buffer is empty');
            }
            // 2. Transcribe via Whisper
            const { text, duration, cost } = await this.transcribeAudio(audioBuffer, language);
            if (!text || text.trim().length === 0) {
                throw helpers_js_1.AppError.badRequest('Transcription returned empty text');
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
            const transcriptionId = (0, helpers_js_1.generateUUID)();
            const now = new Date();
            await (0, database_js_1.sql) `
        INSERT INTO audio_transcriptions ${(0, database_js_1.sql)({
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
            await (0, database_js_1.sql) `
        UPDATE notes
        SET is_vocal = true, vocal_transcription_id = ${transcriptionId}
        WHERE id = ${note.id}
      `;
            console.log(`✓ Transcription metadata saved: ${transcriptionId}`);
            // 5. Track API cost
            await (0, database_js_1.sql) `
        INSERT INTO api_cost_tracking ${(0, database_js_1.sql)({
                id: (0, helpers_js_1.generateUUID)(),
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
        }
        catch (error) {
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
    async getTranscription(noteId) {
        const transcriptions = await (0, database_js_1.sql) `
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
    async getVocalNotes(workspaceId, limit = 50) {
        const notes = await (0, database_js_1.sql) `
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
    async getCosts(workspaceId) {
        const result = await (0, database_js_1.sql) `
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
    async cleanupTempFiles() {
        try {
            const files = fs_1.default.readdirSync(this.tempDir);
            const now = Date.now();
            const oneHourMs = 60 * 60 * 1000;
            let deletedCount = 0;
            for (const file of files) {
                const filePath = path_1.default.join(this.tempDir, file);
                const stats = fs_1.default.statSync(filePath);
                const age = now - stats.mtimeMs;
                if (age > oneHourMs) {
                    fs_1.default.unlinkSync(filePath);
                    deletedCount++;
                }
            }
            if (deletedCount > 0) {
                console.log(`✓ Cleaned up ${deletedCount} old temp audio files`);
            }
        }
        catch (error) {
            console.error('✗ Temp file cleanup failed:', error);
        }
    }
}
exports.NotesVocalService = NotesVocalService;
//# sourceMappingURL=notes-vocal.service.js.map