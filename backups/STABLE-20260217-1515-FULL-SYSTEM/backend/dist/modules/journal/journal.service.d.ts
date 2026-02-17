import { Pool } from 'pg';
import { JournalEntry, CreateJournalEntryDTO, UpdateJournalEntryDTO, JournalFilters } from './journal.types';
export declare class JournalService {
    private pool;
    constructor(pool: Pool);
    /**
     * Get journal entries for a user with optional filters
     */
    getEntries(userId: string, workspaceId: string, filters?: JournalFilters): Promise<JournalEntry[]>;
    /**
     * Get a single journal entry by ID
     */
    getEntryById(entryId: string, userId: string, workspaceId: string): Promise<JournalEntry | null>;
    /**
     * Get journal entry for a specific date (unique per user/workspace/date)
     */
    getEntryByDate(userId: string, workspaceId: string, date: string): Promise<JournalEntry | null>;
    /**
     * Create or update journal entry for a specific date
     */
    upsertEntry(userId: string, workspaceId: string, data: CreateJournalEntryDTO): Promise<JournalEntry>;
    /**
     * Update journal entry
     */
    updateEntry(entryId: string, userId: string, workspaceId: string, data: UpdateJournalEntryDTO): Promise<JournalEntry>;
    /**
     * Delete journal entry
     */
    deleteEntry(entryId: string, userId: string, workspaceId: string): Promise<void>;
    /**
     * Get statistics for user's journal
     */
    getStatistics(userId: string, workspaceId: string, startDate?: string, endDate?: string): Promise<any>;
}
//# sourceMappingURL=journal.service.d.ts.map