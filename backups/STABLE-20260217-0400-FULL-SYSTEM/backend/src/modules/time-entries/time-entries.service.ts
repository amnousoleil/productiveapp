import { sql } from '../../config/database.js';
import { generateUUID, AppError, calculateOffset } from '../../utils/helpers.js';
import type { UUID, PaginationParams } from '../../types/index.js';

// ============================================
// Types
// ============================================

export interface CreateTimeEntryInput {
  member_id: UUID;
  task_id?: UUID | null;
  project_id?: UUID | null;
  description?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_minutes?: number | null;
  is_billable?: boolean;
  is_running?: boolean;
  hourly_rate?: number | null;
  currency?: string | null;
  tags?: string[];
}

export interface UpdateTimeEntryInput {
  task_id?: UUID | null;
  project_id?: UUID | null;
  description?: string | null;
  start_time?: string;
  end_time?: string | null;
  duration_minutes?: number | null;
  is_billable?: boolean;
  is_running?: boolean;
  hourly_rate?: number | null;
  currency?: string | null;
  tags?: string[];
}

export interface TimeEntryFilters extends PaginationParams {
  member_id?: UUID;
  project_id?: UUID;
  task_id?: UUID;
  date_from?: string;
  date_to?: string;
  is_billable?: boolean;
  is_running?: boolean;
}

export interface TimeEntry {
  id: UUID;
  workspace_id: UUID;
  member_id: UUID;
  task_id: UUID | null;
  project_id: UUID | null;
  description: string | null;
  start_time: Date;
  end_time: Date | null;
  duration_minutes: number | null;
  is_billable: boolean;
  is_running: boolean;
  hourly_rate: number | null;
  currency: string | null;
  invoice_id: UUID | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface TimeEntryWithRelations extends TimeEntry {
  task_name: string | null;
  project_name: string | null;
  project_color: string | null;
}

export interface DailySummary {
  date: string;
  total_minutes: number;
}

export interface MonthlySummary {
  total_minutes: number;
  billable_minutes: number;
  revenue: number;
}

export interface MemberRate {
  id: UUID;
  workspace_id: UUID;
  member_id: UUID;
  hourly_rate: number;
  currency: string;
  effective_from: Date;
  created_at: Date;
}

// ============================================
// Helpers
// ============================================

function calcDurationMinutes(startTime: string | Date, endTime: string | Date): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}

// ============================================
// Service
// ============================================

export class TimeEntriesService {
  /**
   * Create a new time entry.
   * If is_running is true, stop any other running entry for the same member first.
   */
  async createEntry(workspaceId: UUID, data: CreateTimeEntryInput): Promise<TimeEntry> {
    // If starting a running timer, stop any existing running entry for this member
    if (data.is_running) {
      const running = await sql`
        SELECT id FROM time_entries
        WHERE workspace_id = ${workspaceId}
          AND member_id = ${data.member_id}
          AND is_running = true
      `;
      for (const entry of running) {
        await this.stopEntry(workspaceId, entry.id);
      }
    }

    const id = generateUUID();
    const now = new Date();

    // Auto-calculate duration if both start and end are provided
    let durationMinutes = data.duration_minutes ?? null;
    if (data.end_time && data.start_time && durationMinutes === null) {
      durationMinutes = calcDurationMinutes(data.start_time, data.end_time);
    }

    const entries = await sql`
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

    return entries[0] as TimeEntry;
  }

  /**
   * Update a time entry. Auto-calculates duration_minutes if end_time is set.
   */
  async updateEntry(workspaceId: UUID, entryId: UUID, data: UpdateTimeEntryInput): Promise<TimeEntry> {
    // Verify entry exists and belongs to workspace
    const existing = await sql`
      SELECT * FROM time_entries
      WHERE id = ${entryId} AND workspace_id = ${workspaceId}
    `;
    if (existing.length === 0) {
      throw AppError.notFound('Time entry');
    }

    const updates: Record<string, unknown> = { updated_at: new Date() };

    if (data.task_id !== undefined) updates.task_id = data.task_id;
    if (data.project_id !== undefined) updates.project_id = data.project_id;
    if (data.description !== undefined) updates.description = data.description;
    if (data.start_time !== undefined) updates.start_time = data.start_time;
    if (data.end_time !== undefined) updates.end_time = data.end_time;
    if (data.is_billable !== undefined) updates.is_billable = data.is_billable;
    if (data.is_running !== undefined) updates.is_running = data.is_running;
    if (data.hourly_rate !== undefined) updates.hourly_rate = data.hourly_rate;
    if (data.currency !== undefined) updates.currency = data.currency;
    if (data.tags !== undefined) updates.tags = data.tags;

    // Auto-calculate duration if end_time is being set (or already exists) and start_time is known
    const effectiveStart = data.start_time ?? existing[0].start_time;
    const effectiveEnd = data.end_time !== undefined ? data.end_time : existing[0].end_time;

    if (data.duration_minutes !== undefined) {
      updates.duration_minutes = data.duration_minutes;
    } else if (effectiveEnd && effectiveStart) {
      updates.duration_minutes = calcDurationMinutes(effectiveStart, effectiveEnd);
    }

    const fields = Object.keys(updates);
    const entries = await sql`
      UPDATE time_entries
      SET ${sql(updates, ...fields)}
      WHERE id = ${entryId} AND workspace_id = ${workspaceId}
      RETURNING *
    `;

    if (entries.length === 0) {
      throw AppError.notFound('Time entry');
    }

    return entries[0] as TimeEntry;
  }

  /**
   * Delete a time entry.
   */
  async deleteEntry(workspaceId: UUID, entryId: UUID): Promise<void> {
    const result = await sql`
      DELETE FROM time_entries
      WHERE id = ${entryId} AND workspace_id = ${workspaceId}
    `;

    if (result.count === 0) {
      throw AppError.notFound('Time entry');
    }
  }

  /**
   * Get a single time entry with task/project name joins.
   */
  async getEntry(workspaceId: UUID, entryId: UUID): Promise<TimeEntryWithRelations> {
    const entries = await sql`
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
      throw AppError.notFound('Time entry');
    }

    return entries[0] as TimeEntryWithRelations;
  }

  /**
   * List time entries with filters and pagination. Joins tasks and projects for names.
   */
  async listEntries(
    workspaceId: UUID,
    filters: TimeEntryFilters
  ): Promise<{ entries: TimeEntryWithRelations[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = calculateOffset(page, limit);

    let conditions = sql`te.workspace_id = ${workspaceId}`;

    if (filters.member_id) {
      conditions = sql`${conditions} AND te.member_id = ${filters.member_id}`;
    }
    if (filters.project_id) {
      conditions = sql`${conditions} AND te.project_id = ${filters.project_id}`;
    }
    if (filters.task_id) {
      conditions = sql`${conditions} AND te.task_id = ${filters.task_id}`;
    }
    if (filters.date_from) {
      conditions = sql`${conditions} AND te.start_time >= ${filters.date_from}`;
    }
    if (filters.date_to) {
      conditions = sql`${conditions} AND te.start_time <= ${filters.date_to}`;
    }
    if (filters.is_billable !== undefined) {
      conditions = sql`${conditions} AND te.is_billable = ${filters.is_billable}`;
    }
    if (filters.is_running !== undefined) {
      conditions = sql`${conditions} AND te.is_running = ${filters.is_running}`;
    }

    const entries = await sql`
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

    const countResult = await sql`
      SELECT COUNT(*)::int as count
      FROM time_entries te
      WHERE ${conditions}
    `;

    return {
      entries: entries as unknown as TimeEntryWithRelations[],
      total: countResult[0].count,
    };
  }

  /**
   * Get the currently running time entry for a member.
   */
  async getRunningEntry(workspaceId: UUID, memberId: UUID): Promise<TimeEntryWithRelations | null> {
    const entries = await sql`
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

    return entries[0] as TimeEntryWithRelations;
  }

  /**
   * Stop a running time entry: set end_time = NOW(), calculate duration, is_running = false.
   */
  async stopEntry(workspaceId: UUID, entryId: UUID): Promise<TimeEntry> {
    const existing = await sql`
      SELECT * FROM time_entries
      WHERE id = ${entryId} AND workspace_id = ${workspaceId}
    `;

    if (existing.length === 0) {
      throw AppError.notFound('Time entry');
    }

    if (!existing[0].is_running) {
      throw AppError.badRequest('Time entry is not running');
    }

    const now = new Date();
    const durationMinutes = calcDurationMinutes(existing[0].start_time, now);

    const entries = await sql`
      UPDATE time_entries
      SET end_time = ${now},
          duration_minutes = ${durationMinutes},
          is_running = false,
          updated_at = ${now}
      WHERE id = ${entryId} AND workspace_id = ${workspaceId}
      RETURNING *
    `;

    return entries[0] as TimeEntry;
  }

  /**
   * Get weekly summary: hours grouped by date for a given week.
   */
  async getWeeklySummary(
    workspaceId: UUID,
    memberId: UUID,
    weekStart: string
  ): Promise<DailySummary[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const rows = await sql`
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

    return rows as unknown as DailySummary[];
  }

  /**
   * Get monthly summary: total hours, billable hours, and revenue.
   */
  async getMonthlySummary(
    workspaceId: UUID,
    memberId: UUID,
    year: number,
    month: number
  ): Promise<MonthlySummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const rows = await sql`
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
  async getMemberRate(workspaceId: UUID, memberId: UUID): Promise<MemberRate | null> {
    const rates = await sql`
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

    return rates[0] as MemberRate;
  }

  /**
   * Set (upsert) the hourly rate for a member.
   * Creates a new rate record with effective_from = NOW().
   */
  async setMemberRate(
    workspaceId: UUID,
    memberId: UUID,
    hourlyRate: number,
    currency: string = 'EUR'
  ): Promise<MemberRate> {
    const id = generateUUID();
    const now = new Date();

    const rates = await sql`
      INSERT INTO member_rates (id, workspace_id, member_id, hourly_rate, currency, effective_from, created_at)
      VALUES (${id}, ${workspaceId}, ${memberId}, ${hourlyRate}, ${currency}, ${now}, ${now})
      RETURNING *
    `;

    return rates[0] as MemberRate;
  }
}

export const timeEntriesService = new TimeEntriesService();
