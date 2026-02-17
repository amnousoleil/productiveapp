import type { UUID, PaginationParams } from '../../types/index.js';
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
export declare class TimeEntriesService {
    /**
     * Create a new time entry.
     * If is_running is true, stop any other running entry for the same member first.
     */
    createEntry(workspaceId: UUID, data: CreateTimeEntryInput): Promise<TimeEntry>;
    /**
     * Update a time entry. Auto-calculates duration_minutes if end_time is set.
     */
    updateEntry(workspaceId: UUID, entryId: UUID, data: UpdateTimeEntryInput): Promise<TimeEntry>;
    /**
     * Delete a time entry.
     */
    deleteEntry(workspaceId: UUID, entryId: UUID): Promise<void>;
    /**
     * Get a single time entry with task/project name joins.
     */
    getEntry(workspaceId: UUID, entryId: UUID): Promise<TimeEntryWithRelations>;
    /**
     * List time entries with filters and pagination. Joins tasks and projects for names.
     */
    listEntries(workspaceId: UUID, filters: TimeEntryFilters): Promise<{
        entries: TimeEntryWithRelations[];
        total: number;
    }>;
    /**
     * Get the currently running time entry for a member.
     */
    getRunningEntry(workspaceId: UUID, memberId: UUID): Promise<TimeEntryWithRelations | null>;
    /**
     * Stop a running time entry: set end_time = NOW(), calculate duration, is_running = false.
     */
    stopEntry(workspaceId: UUID, entryId: UUID): Promise<TimeEntry>;
    /**
     * Get weekly summary: hours grouped by date for a given week.
     */
    getWeeklySummary(workspaceId: UUID, memberId: UUID, weekStart: string): Promise<DailySummary[]>;
    /**
     * Get monthly summary: total hours, billable hours, and revenue.
     */
    getMonthlySummary(workspaceId: UUID, memberId: UUID, year: number, month: number): Promise<MonthlySummary>;
    /**
     * Get the current hourly rate for a member (most recent effective_from).
     */
    getMemberRate(workspaceId: UUID, memberId: UUID): Promise<MemberRate | null>;
    /**
     * Set (upsert) the hourly rate for a member.
     * Creates a new rate record with effective_from = NOW().
     */
    setMemberRate(workspaceId: UUID, memberId: UUID, hourlyRate: number, currency?: string): Promise<MemberRate>;
}
export declare const timeEntriesService: TimeEntriesService;
//# sourceMappingURL=time-entries.service.d.ts.map