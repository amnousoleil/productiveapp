"use strict";
// =============================================
// JOURNAL MODULE - CONTROLLER
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalController = void 0;
class JournalController {
    journalService;
    constructor(journalService) {
        this.journalService = journalService;
    }
    /**
     * GET /api/v1/journal
     * Get all journal entries for current user
     */
    getEntries = async (req, res) => {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const filters = {
                start_date: req.query.start_date,
                end_date: req.query.end_date,
                min_mood: req.query.min_mood ? parseInt(req.query.min_mood) : undefined,
                max_mood: req.query.max_mood ? parseInt(req.query.max_mood) : undefined,
                tags: req.query.tags ? req.query.tags.split(',') : undefined,
            };
            const entries = await this.journalService.getEntries(userId, workspaceId, filters);
            res.json(entries);
        }
        catch (error) {
            console.error('Error fetching journal entries:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * GET /api/v1/journal/:id
     * Get a specific journal entry
     */
    getEntryById = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const entry = await this.journalService.getEntryById(id, userId, workspaceId);
            if (!entry) {
                return res.status(404).json({ error: 'Journal entry not found' });
            }
            res.json(entry);
        }
        catch (error) {
            console.error('Error fetching journal entry:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * GET /api/v1/journal/date/:date
     * Get journal entry for a specific date
     */
    getEntryByDate = async (req, res) => {
        try {
            const { date } = req.params;
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const entry = await this.journalService.getEntryByDate(userId, workspaceId, date);
            if (!entry) {
                return res.status(404).json({ error: 'No journal entry found for this date' });
            }
            res.json(entry);
        }
        catch (error) {
            console.error('Error fetching journal entry by date:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * POST /api/v1/journal
     * Create or update journal entry (upsert)
     */
    upsertEntry = async (req, res) => {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const data = req.body;
            const entry = await this.journalService.upsertEntry(userId, workspaceId, data);
            res.status(201).json(entry);
        }
        catch (error) {
            console.error('Error upserting journal entry:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * PUT /api/v1/journal/:id
     * Update existing journal entry
     */
    updateEntry = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const data = req.body;
            const entry = await this.journalService.updateEntry(id, userId, workspaceId, data);
            res.json(entry);
        }
        catch (error) {
            console.error('Error updating journal entry:', error);
            if (error.message === 'Journal entry not found or access denied') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * DELETE /api/v1/journal/:id
     * Delete journal entry
     */
    deleteEntry = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            await this.journalService.deleteEntry(id, userId, workspaceId);
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting journal entry:', error);
            if (error.message === 'Journal entry not found or access denied') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * GET /api/v1/journal/statistics
     * Get journal statistics
     */
    getStatistics = async (req, res) => {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const startDate = req.query.start_date;
            const endDate = req.query.end_date;
            const stats = await this.journalService.getStatistics(userId, workspaceId, startDate, endDate);
            res.json(stats);
        }
        catch (error) {
            console.error('Error fetching journal statistics:', error);
            res.status(500).json({ error: error.message });
        }
    };
}
exports.JournalController = JournalController;
//# sourceMappingURL=journal.controller.js.map