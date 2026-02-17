// =============================================
// JOURNAL MODULE - SERVICE
// =============================================

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import {
  JournalEntry,
  CreateJournalEntryDTO,
  UpdateJournalEntryDTO,
  JournalFilters,
} from './journal.types';

export class JournalService {
  constructor(private pool: Pool) {}

  /**
   * Get journal entries for a user with optional filters
   */
  async getEntries(
    userId: string,
    workspaceId: string,
    filters: JournalFilters = {}
  ): Promise<JournalEntry[]> {
    let query = `
      SELECT * FROM journal_entries
      WHERE user_id = $1 AND workspace_id = $2
    `;
    const params: any[] = [userId, workspaceId];
    let paramIndex = 3;

    if (filters.start_date) {
      query += ` AND date >= $${paramIndex}`;
      params.push(filters.start_date);
      paramIndex++;
    }

    if (filters.end_date) {
      query += ` AND date <= $${paramIndex}`;
      params.push(filters.end_date);
      paramIndex++;
    }

    if (filters.min_mood) {
      query += ` AND mood >= $${paramIndex}`;
      params.push(filters.min_mood);
      paramIndex++;
    }

    if (filters.max_mood) {
      query += ` AND mood <= $${paramIndex}`;
      params.push(filters.max_mood);
      paramIndex++;
    }

    if (filters.tags && filters.tags.length > 0) {
      query += ` AND tags @> $${paramIndex}::jsonb`;
      params.push(JSON.stringify(filters.tags));
      paramIndex++;
    }

    query += ` ORDER BY date DESC, created_at DESC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Get a single journal entry by ID
   */
  async getEntryById(
    entryId: string,
    userId: string,
    workspaceId: string
  ): Promise<JournalEntry | null> {
    const result = await this.pool.query(
      `SELECT * FROM journal_entries
       WHERE id = $1 AND user_id = $2 AND workspace_id = $3`,
      [entryId, userId, workspaceId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get journal entry for a specific date (unique per user/workspace/date)
   */
  async getEntryByDate(
    userId: string,
    workspaceId: string,
    date: string
  ): Promise<JournalEntry | null> {
    const result = await this.pool.query(
      `SELECT * FROM journal_entries
       WHERE user_id = $1 AND workspace_id = $2 AND date = $3`,
      [userId, workspaceId, date]
    );

    return result.rows[0] || null;
  }

  /**
   * Create or update journal entry for a specific date
   */
  async upsertEntry(
    userId: string,
    workspaceId: string,
    data: CreateJournalEntryDTO
  ): Promise<JournalEntry> {
    const date = data.date || new Date().toISOString().split('T')[0];

    // Check if entry exists for this date
    const existing = await this.getEntryByDate(userId, workspaceId, date);

    if (existing) {
      // Update existing entry
      return this.updateEntry(existing.id, userId, workspaceId, data);
    }

    // Create new entry
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO journal_entries (
        id, user_id, workspace_id, date, content, mood, energy_level,
        sleep_quality, tags, weather, highlights, challenges, gratitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        id,
        userId,
        workspaceId,
        date,
        data.content || null,
        data.mood || null,
        data.energy_level || null,
        data.sleep_quality || null,
        JSON.stringify(data.tags || []),
        data.weather ? JSON.stringify(data.weather) : null,
        JSON.stringify(data.highlights || []),
        JSON.stringify(data.challenges || []),
        JSON.stringify(data.gratitude || []),
      ]
    );

    return result.rows[0];
  }

  /**
   * Update journal entry
   */
  async updateEntry(
    entryId: string,
    userId: string,
    workspaceId: string,
    data: UpdateJournalEntryDTO
  ): Promise<JournalEntry> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      params.push(data.content);
      paramIndex++;
    }

    if (data.mood !== undefined) {
      updates.push(`mood = $${paramIndex}`);
      params.push(data.mood);
      paramIndex++;
    }

    if (data.energy_level !== undefined) {
      updates.push(`energy_level = $${paramIndex}`);
      params.push(data.energy_level);
      paramIndex++;
    }

    if (data.sleep_quality !== undefined) {
      updates.push(`sleep_quality = $${paramIndex}`);
      params.push(data.sleep_quality);
      paramIndex++;
    }

    if (data.tags !== undefined) {
      updates.push(`tags = $${paramIndex}::jsonb`);
      params.push(JSON.stringify(data.tags));
      paramIndex++;
    }

    if (data.weather !== undefined) {
      updates.push(`weather = $${paramIndex}::jsonb`);
      params.push(data.weather ? JSON.stringify(data.weather) : null);
      paramIndex++;
    }

    if (data.highlights !== undefined) {
      updates.push(`highlights = $${paramIndex}::jsonb`);
      params.push(JSON.stringify(data.highlights));
      paramIndex++;
    }

    if (data.challenges !== undefined) {
      updates.push(`challenges = $${paramIndex}::jsonb`);
      params.push(JSON.stringify(data.challenges));
      paramIndex++;
    }

    if (data.gratitude !== undefined) {
      updates.push(`gratitude = $${paramIndex}::jsonb`);
      params.push(JSON.stringify(data.gratitude));
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(entryId, userId, workspaceId);

    const result = await this.pool.query(
      `UPDATE journal_entries
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} AND workspace_id = $${paramIndex + 2}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('Journal entry not found or access denied');
    }

    return result.rows[0];
  }

  /**
   * Delete journal entry
   */
  async deleteEntry(
    entryId: string,
    userId: string,
    workspaceId: string
  ): Promise<void> {
    const result = await this.pool.query(
      `DELETE FROM journal_entries
       WHERE id = $1 AND user_id = $2 AND workspace_id = $3`,
      [entryId, userId, workspaceId]
    );

    if (result.rowCount === 0) {
      throw new Error('Journal entry not found or access denied');
    }
  }

  /**
   * Get statistics for user's journal
   */
  async getStatistics(
    userId: string,
    workspaceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    let query = `
      SELECT
        COUNT(*) as total_entries,
        AVG(mood) as avg_mood,
        AVG(energy_level) as avg_energy,
        AVG(sleep_quality) as avg_sleep,
        MIN(date) as first_entry_date,
        MAX(date) as last_entry_date
      FROM journal_entries
      WHERE user_id = $1 AND workspace_id = $2
    `;
    const params: any[] = [userId, workspaceId];
    let paramIndex = 3;

    if (startDate) {
      query += ` AND date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    const result = await this.pool.query(query, params);
    return result.rows[0];
  }
}
