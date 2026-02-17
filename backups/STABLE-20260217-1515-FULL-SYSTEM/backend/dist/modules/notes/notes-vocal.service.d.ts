import type { UUID } from '../../types/index.js';
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
export declare class NotesVocalService {
    private notesService;
    private tempDir;
    constructor();
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
    transcribeAudio(audioBuffer: Buffer, language?: string): Promise<{
        text: string;
        duration: number;
        cost: number;
    }>;
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
    createVocalNote(workspaceId: UUID, userId: UUID, audioBase64: string, language?: string): Promise<{
        note: any;
        transcription: {
            id: UUID;
            text: string;
            duration: number;
            cost: number;
        };
    }>;
    /**
     * Get transcription metadata for a note
     *
     * @param noteId - Note UUID
     * @returns Transcription metadata or null if not a vocal note
     */
    getTranscription(noteId: UUID): Promise<any | null>;
    /**
     * Get all vocal notes for a workspace
     *
     * @param workspaceId - Workspace UUID
     * @param limit - Max results (default: 50)
     * @returns Array of vocal notes with transcription metadata
     */
    getVocalNotes(workspaceId: UUID, limit?: number): Promise<any[]>;
    /**
     * Calculate total STT costs for a workspace (last 30 days)
     *
     * @param workspaceId - Workspace UUID
     * @returns Total cost in USD
     */
    getCosts(workspaceId: UUID): Promise<{
        total: number;
        count: number;
        avgCost: number;
        totalMinutes: number;
    }>;
    /**
     * Cleanup old temporary audio files (> 1 hour old)
     * Should be called periodically (e.g., via cron job)
     */
    cleanupTempFiles(): Promise<void>;
}
//# sourceMappingURL=notes-vocal.service.d.ts.map