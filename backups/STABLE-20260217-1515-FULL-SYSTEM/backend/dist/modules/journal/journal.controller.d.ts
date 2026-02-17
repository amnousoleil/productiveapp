import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { JournalService } from './journal.service';
export declare class JournalController {
    private journalService;
    constructor(journalService: JournalService);
    /**
     * GET /api/v1/journal
     * Get all journal entries for current user
     */
    getEntries: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * GET /api/v1/journal/:id
     * Get a specific journal entry
     */
    getEntryById: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/v1/journal/date/:date
     * Get journal entry for a specific date
     */
    getEntryByDate: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /api/v1/journal
     * Create or update journal entry (upsert)
     */
    upsertEntry: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * PUT /api/v1/journal/:id
     * Update existing journal entry
     */
    updateEntry: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * DELETE /api/v1/journal/:id
     * Delete journal entry
     */
    deleteEntry: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/v1/journal/statistics
     * Get journal statistics
     */
    getStatistics: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=journal.controller.d.ts.map