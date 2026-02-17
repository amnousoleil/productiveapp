"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeEntriesService = exports.TimeEntriesService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
// ============================================
// Helpers
// ============================================
function calcDurationMinutes(startTime, endTime) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.max(0, Math.round((end - start) / 60000));
}
// ============================================
// Service
// ============================================
class TimeEntriesService {
    /**
     * Create a new time entry.
     * If is_running is true, stop any other running entry for the same member first.
     */
    async createEntry(workspaceId, data) {
        // If starting a running timer, stop any existing running entry for this member
        if (data.is_running) {
            const running = await (0, database_js_1.sql) `
        SELECT id FROM time_entries
        WHERE workspace_id = ${workspaceId}
          AND member_id = ${data.member_id}
          AND is_running = true
      `;
            for (const entry of running) {
                await this.stopEntry(workspaceId, entry.id);
            }
        }
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        // Auto-calculate duration if both start and end are provided
        let durationMinutes = data.duration_minutes ?? null;
        if (data.end_time && data.start_time && durationMinutes === null) {
            durationMinutes = calcDurationMinutes(data.start_time, data.end_time);
        }
        const entries = await (0, database_js_1.sql) `
      INSERT INTO time_entries (
        id, workspace_id, member_id, task_id, project_id,
        description, start_time, end_time, duration_minutes,
        is_billable, is_running, hourly_rate, currency,
        tags, created_at, updated_at
      )
      VALUES (
        ${id}, ${workspaceId}, ${data.member_id},
        ${data.task_id || null}, ${data.project_id || null},
        ${data.description || null}, ${data.start_time},
        ${data.end_time || null}, ${durationMinutes},
        ${data.is_billable ?? false}, ${data.is_running ?? false},
        ${data.hourly_rate ?? null}, ${data.currency ?? null},
        ${data.tags || []}, ${now}, ${now}
      )
      RETURNING *
    `;
        return entries[0];
    }
    /**
     * Update a time entry. Auto-calculates duration_minutes if end_time is set.
     */
    async updateEntry(workspaceId, entryId, data) {
        // Verify entry exists and belongs to workspace
        const existing = await (0, database_js_1.sql) `
      SELECT * FROM time_entries
      WHERE id = ${entryId} AND workspace_id = ${workspaceId}
    `;
        if (existing.length === 0) {
            throw helpers_js_1.AppError.notFound('Time entry');
        }
        const updates = { updated_at: new Date() };
        if (data.task_id !== undefined)
            updates.task_id = data.task_id;
        if (data.project_id !== undefined)
            updates.project_id = data.project_id;
        if (data.description !== undefined)
            updates.description = data.description;
        if (data.start_time !== undefined)
            updates.start_time = data.start_time;
        if (data.end_time !== undefined)
            updates.end_time = data.end_time;
        if (data.is_billable !== undefined)
            updates.is_billable = data.is_billable;
        if (data.is_running !== undefined)
            updates.is_running = data.is_running;
        if (data.hourly_rate !== undefined)
            updates.hourly_rate = data.hourly_rate;
        if (data.currency !== undefined)
            updates.currency = data.currency;
        if (data.tags !== undefined)
            updates.tags = data.tags;
        // Auto-calculate duration if end_time is being set (or already exists) and start_time is known
        const effectiveStart = data.start_time ?? existing[0].start_time;
        const effectiveEnd = data.end_time !== undefined ? data.end_time : existing[0].end_time;
        if (data.duration_minutes !== undefined) {
            updates.duration_minutes = data.duration_minutes;
        }
        else if (effectiveEnd && effectiveStart) {
            updates.duration_minutes = calcDurationMinutes(effectiveStart, effectiveEnd);
        }
        const fields = Object.keys(updates);
        const entries = await (0, database_js_1.sql) `
      UPDATE time_entries
      SET ${(0, database_js_1.sql)(updates, ...fields)}
      WHERE id = ${entryId} AND workspace_id = ${workspaceId}
      RETURNING *
    `;
        if (entries.length === 0) {
            throw helpers_js_1.AppError.notFound('Time entry');
        }
        return entries[0];
    }
    /**
     * Delete a time entry.
     */
    async deleteEntry(workspaceId, entryId) {
        const result = await (0, database_js_1.sql) `
      DELETE FROM time_entries
      WHERE id = ${entryId} AND workspace_id = ${workspaceId}
    `;
        if (result.count === 0) {
            throw helpers_js_1.AppError.notFound('Time entry');
        }
    }
    /**
     * Get a single time entry with task/project name joins.
     */
    async getEntry(workspaceId, entryId) {
        const entries = await (0, database_js_1.sql) `
      SELECT te.*,
             t.title as task_name,
             p.name as project_name,
             p.color as project_color
      FROM time_entries te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.id = ${entryId} AND te.workspace_id = ${workspaceId}
    `;
        if (entries.length === 0) {
            throw helpers_js_1.AppError.notFound('Time entry');
        }
        return entries[0];
    }
    /**
     * List time entries with filters and pagination. Joins tasks and projects for names.
     */
    async listEntries(workspaceId, filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        let conditions = (0, database_js_1.sql) `te.workspace_id = ${workspaceId}`;
        if (filters.member_id) {
            conditions = (0, database_js_1.sql) `${conditions} AND te.member_id = ${filters.member_id}`;
        }
        if (filters.project_id) {
            conditions = (0, database_js_1.sql) `${conditions} AND te.project_id = ${filters.project_id}`;
        }
        if (filters.task_id) {
            conditions = (0, database_js_1.sql) `${conditions} AND te.task_id = ${filters.task_id}`;
        }
        if (filters.date_from) {
            conditions = (0, database_js_1.sql) `${conditions} AND te.start_time >= ${filters.date_from}`;
        }
        if (filters.date_to) {
            conditions = (0, database_js_1.sql) `${conditions} AND te.start_time <= ${filters.date_to}`;
        }
        if (filters.is_billable !== undefined) {
            conditions = (0, database_js_1.sql) `${conditions} AND te.is_billable = ${filters.is_billable}`;
        }
        if (filters.is_running !== undefined) {
            conditions = (0, database_js_1.sql) `${conditions} AND te.is_running = ${filters.is_running}`;
        }
        const entries = await (0, database_js_1.sql) `
      SELECT te.*,
             t.title as task_name,
             p.name as project_name,
             p.color as project_color
      FROM time_entries te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE ${conditions}
      ORDER BY te.start_time DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count
      FROM time_entries te
      WHERE ${conditions}
    `;
        return {
            entries: entries,
            total: countResult[0].count,
        };
    }
    /**
     * Get the currently running time entry for a member.
     */
    async getRunningEntry(workspaceId, memberId) {
        const entries = await (0, database_js_1.sql) `
      SELECT te.*,
             t.title as task_name,
             p.name as project_name,
             p.color as project_color
      FROM time_entries te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.workspace_id = ${workspaceId}
        AND te.member_id = ${memberId}
        AND te.is_running = true
      ORDER BY te.start_time DESC
      LIMIT 1
    `;
        if (entries.length === 0) {
            return null;
        }
        return entries[0];
    }
    /**
     * Stop a running time entry: set end_time = NOW(), calculate duration, is_running = false.
     */
    async stopEntry(workspaceId, entryId) {
        const existing = await (0, database_js_1.sql) `
      SELECT * FROM time_entries
      WHERE id = ${entryId} AND workspace_id = ${workspaceId}
    `;
        if (existing.length === 0) {
            throw helpers_js_1.AppError.notFound('Time entry');
        }
        if (!existing[0].is_running) {
            throw helpers_js_1.AppError.badRequest('Time entry is not running');
        }
        const now = new Date();
        const durationMinutes = calcDurationMinutes(existing[0].start_time, now);
        const entries = await (0, database_js_1.sql) `
      UPDATE time_entries
      SET end_time = ${now},
          duration_minutes = ${durationMinutes},
          is_running = false,
          updated_at = ${now}
      WHERE id = ${entryId} AND workspace_id = ${workspaceId}
      RETURNING *
    `;
        return entries[0];
    }
    /**
     * Get weekly summary: hours grouped by date for a given week.
     */
    async getWeeklySummary(workspaceId, memberId, weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const rows = await (0, database_js_1.sql) `
      SELECT
        DATE(start_time AT TIME ZONE 'UTC') as date,
        COALESCE(SUM(duration_minutes), 0)::int as total_minutes
      FROM time_entries
      WHERE workspace_id = ${workspaceId}
        AND member_id = ${memberId}
        AND start_time >= ${weekStart}
        AND start_time < ${weekEnd.toISOString()}
        AND is_running = false
      GROUP BY DATE(start_time AT TIME ZONE 'UTC')
      ORDER BY date
    `;
        return rows;
    }
    /**
     * Get monthly summary: total hours, billable hours, and revenue.
     */
    async getMonthlySummary(workspaceId, memberId, year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        const rows = await (0, database_js_1.sql) `
      SELECT
        COALESCE(SUM(duration_minutes), 0)::int as total_minutes,
        COALESCE(SUM(CASE WHEN is_billable = true THEN duration_minutes ELSE 0 END), 0)::int as billable_minutes,
        COALESCE(
          SUM(
            CASE WHEN is_billable = true AND hourly_rate IS NOT NULL
              THEN (duration_minutes / 60.0) * hourly_rate
              ELSE 0
            END
          ), 0
        )::numeric(10,2) as revenue
      FROM time_entries
      WHERE workspace_id = ${workspaceId}
        AND member_id = ${memberId}
        AND start_time >= ${startDate.toISOString()}
        AND start_time < ${endDate.toISOString()}
        AND is_running = false
    `;
        const row = rows[0];
        return {
            total_minutes: row.total_minutes,
            billable_minutes: row.billable_minutes,
            revenue: parseFloat(row.revenue) || 0,
        };
    }
    /**
     * Get the current hourly rate for a member (most recent effective_from).
     */
    async getMemberRate(workspaceId, memberId) {
        const rates = await (0, database_js_1.sql) `
      SELECT *
      FROM member_rates
      WHERE workspace_id = ${workspaceId}
        AND member_id = ${memberId}
      ORDER BY effective_from DESC
      LIMIT 1
    `;
        if (rates.length === 0) {
            return null;
        }
        return rates[0];
    }
    /**
     * Set (upsert) the hourly rate for a member.
     * Creates a new rate record with effective_from = NOW().
     */
    async setMemberRate(workspaceId, memberId, hourlyRate, currency = 'EUR') {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        const rates = await (0, database_js_1.sql) `
      INSERT INTO member_rates (id, workspace_id, member_id, hourly_rate, currency, effective_from, created_at)
      VALUES (${id}, ${workspaceId}, ${memberId}, ${hourlyRate}, ${currency}, ${now}, ${now})
      RETURNING *
    `;
        return rates[0];
    }
}
exports.TimeEntriesService = TimeEntriesService;
exports.timeEntriesService = new TimeEntriesService();
//# sourceMappingURL=time-entries.service.js.map