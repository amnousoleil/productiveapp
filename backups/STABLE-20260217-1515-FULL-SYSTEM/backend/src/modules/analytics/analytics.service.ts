import { sql } from '../../config/database.js';
import { generateUUID, calculateOffset } from '../../utils/helpers.js';
import type { UUID, ActivityLog, DailyStats, WorkspaceStats, PaginationParams } from '../../types/index.js';
import type {
  LogActivityInput,
  DailyStatsResponse,
  WorkspaceStatsResponse,
  ActivitySummary,
  UserProductivityStats,
  DateRangeParams,
} from './analytics.types.js';

export class AnalyticsService {
  async logActivity(
    userId: UUID,
    workspaceId: UUID,
    input: LogActivityInput,
    ip?: string,
    userAgent?: string
  ): Promise<ActivityLog> {
    const id = generateUUID();
    const now = new Date();

    const activities = await sql`
      INSERT INTO activity_logs (
        id, user_id, workspace_id, action, entity_type, entity_id,
        metadata, ip_address, user_agent, created_at
      )
      VALUES (
        ${id}, ${userId}, ${workspaceId}, ${input.action},
        ${input.entity_type || null}, ${input.entity_id || null},
        ${JSON.stringify(input.metadata || {})}, ${ip || null}, ${userAgent || null}, ${now}
      )
      RETURNING *
    `;

    return activities[0] as ActivityLog;
  }

  async getActivityLogs(
    workspaceId: UUID,
    params: PaginationParams & { user_id?: UUID; action?: string; entity_type?: string }
  ): Promise<{ activities: ActivityLog[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const offset = calculateOffset(page, limit);

    let conditions = sql`workspace_id = ${workspaceId}`;

    if (params.user_id) {
      conditions = sql`${conditions} AND user_id = ${params.user_id}`;
    }

    if (params.action) {
      conditions = sql`${conditions} AND action = ${params.action}`;
    }

    if (params.entity_type) {
      conditions = sql`${conditions} AND entity_type = ${params.entity_type}`;
    }

    const activities = await sql`
      SELECT * FROM activity_logs
      WHERE ${conditions}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM activity_logs
      WHERE ${conditions}
    `;

    return {
      activities: activities as unknown as ActivityLog[],
      total: countResult[0].count,
    };
  }

  async getActivitySummary(
    userId: UUID,
    workspaceId: UUID,
    dateRange: DateRangeParams
  ): Promise<ActivitySummary> {
    const conditions = sql`user_id = ${userId} AND workspace_id = ${workspaceId} AND created_at >= ${dateRange.from} AND created_at <= ${dateRange.to}`;

    const total = await sql`
      SELECT COUNT(*)::int as count FROM activity_logs
      WHERE ${conditions}
    `;

    const byAction = await sql`
      SELECT action, COUNT(*)::int as count
      FROM activity_logs
      WHERE ${conditions}
      GROUP BY action
    `;

    const byEntity = await sql`
      SELECT entity_type, COUNT(*)::int as count
      FROM activity_logs
      WHERE ${conditions} AND entity_type IS NOT NULL
      GROUP BY entity_type
    `;

    const byHour = await sql`
      SELECT EXTRACT(HOUR FROM created_at)::int as hour, COUNT(*)::int as count
      FROM activity_logs
      WHERE ${conditions}
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 24
    `;

    return {
      total_activities: total[0].count,
      activities_by_action: Object.fromEntries(byAction.map((r) => [r.action, r.count])),
      activities_by_entity: Object.fromEntries(byEntity.map((r) => [r.entity_type, r.count])),
      most_active_hours: byHour as unknown as { hour: number; count: number }[],
    };
  }

  async getDailyStats(
    userId: UUID,
    workspaceId: UUID,
    dateRange: DateRangeParams
  ): Promise<DailyStatsResponse[]> {
    const stats = await sql`
      SELECT *,
             TO_CHAR(date, 'YYYY-MM-DD') as date_formatted
      FROM daily_stats
      WHERE user_id = ${userId}
        AND workspace_id = ${workspaceId}
        AND date >= ${dateRange.from}
        AND date <= ${dateRange.to}
      ORDER BY date DESC
    `;

    return stats as unknown as DailyStatsResponse[];
  }

  async updateDailyStats(userId: UUID, workspaceId: UUID): Promise<DailyStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate stats for today
    const notesCreated = await sql`
      SELECT COUNT(*)::int as count FROM notes
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${today} AND created_at < ${tomorrow}
    `;

    const notesUpdated = await sql`
      SELECT COUNT(*)::int as count FROM notes
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND updated_at >= ${today} AND updated_at < ${tomorrow}
        AND created_at < ${today}
    `;

    const tasksCreated = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${today} AND created_at < ${tomorrow}
    `;

    const tasksCompleted = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND completed_at >= ${today} AND completed_at < ${tomorrow}
    `;

    const messagesSent = await sql`
      SELECT COUNT(*)::int as count FROM messages m
      INNER JOIN conversations c ON m.conversation_id = c.id
      WHERE m.sender_id = ${userId} AND c.workspace_id = ${workspaceId}
        AND m.created_at >= ${today} AND m.created_at < ${tomorrow}
    `;

    const xpEarned = await sql`
      SELECT COALESCE(SUM(amount), 0)::int as total FROM xp_events
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${today} AND created_at < ${tomorrow}
    `;

    const mostActiveHour = await sql`
      SELECT EXTRACT(HOUR FROM created_at)::int as hour
      FROM activity_logs
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${today} AND created_at < ${tomorrow}
      GROUP BY hour
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `;

    // Upsert daily stats
    const stats = await sql`
      INSERT INTO daily_stats (
        user_id, workspace_id, date, notes_created, notes_updated,
        tasks_created, tasks_completed, messages_sent, xp_earned,
        most_active_hour
      )
      VALUES (
        ${userId}, ${workspaceId}, ${today},
        ${notesCreated[0].count}, ${notesUpdated[0].count},
        ${tasksCreated[0].count}, ${tasksCompleted[0].count},
        ${messagesSent[0].count}, ${xpEarned[0].total},
        ${mostActiveHour[0]?.hour ?? null}
      )
      ON CONFLICT (user_id, workspace_id, date) DO UPDATE SET
        notes_created = ${notesCreated[0].count},
        notes_updated = ${notesUpdated[0].count},
        tasks_created = ${tasksCreated[0].count},
        tasks_completed = ${tasksCompleted[0].count},
        messages_sent = ${messagesSent[0].count},
        xp_earned = ${xpEarned[0].total},
        most_active_hour = ${mostActiveHour[0]?.hour ?? null}
      RETURNING *
    `;

    return stats[0] as DailyStats;
  }

  async getWorkspaceStats(
    workspaceId: UUID,
    dateRange: DateRangeParams
  ): Promise<WorkspaceStatsResponse[]> {
    const stats = await sql`
      SELECT *,
             TO_CHAR(date, 'YYYY-MM-DD') as date_formatted
      FROM workspace_stats
      WHERE workspace_id = ${workspaceId}
        AND date >= ${dateRange.from}
        AND date <= ${dateRange.to}
      ORDER BY date DESC
    `;

    return stats as unknown as WorkspaceStatsResponse[];
  }

  async updateWorkspaceStats(workspaceId: UUID): Promise<WorkspaceStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalUsers = await sql`
      SELECT COUNT(*)::int as count FROM workspace_members
      WHERE workspace_id = ${workspaceId}
    `;

    const activeUsers = await sql`
      SELECT COUNT(DISTINCT user_id)::int as count FROM activity_logs
      WHERE workspace_id = ${workspaceId}
        AND created_at >= ${new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)}
    `;

    const notesCount = await sql`
      SELECT COUNT(*)::int as count FROM notes
      WHERE workspace_id = ${workspaceId} AND deleted_at IS NULL
    `;

    const tasksCount = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE workspace_id = ${workspaceId}
    `;

    const messagesCount = await sql`
      SELECT COUNT(*)::int as count FROM messages m
      INNER JOIN conversations c ON m.conversation_id = c.id
      WHERE c.workspace_id = ${workspaceId}
    `;

    const stats = await sql`
      INSERT INTO workspace_stats (
        workspace_id, date, total_users, active_users,
        notes_count, tasks_count, messages_count
      )
      VALUES (
        ${workspaceId}, ${today}, ${totalUsers[0].count}, ${activeUsers[0].count},
        ${notesCount[0].count}, ${tasksCount[0].count}, ${messagesCount[0].count}
      )
      ON CONFLICT (workspace_id, date) DO UPDATE SET
        total_users = ${totalUsers[0].count},
        active_users = ${activeUsers[0].count},
        notes_count = ${notesCount[0].count},
        tasks_count = ${tasksCount[0].count},
        messages_count = ${messagesCount[0].count}
      RETURNING *
    `;

    return stats[0] as WorkspaceStats;
  }

  async getUserProductivityStats(userId: UUID, workspaceId: UUID): Promise<UserProductivityStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Today's stats
    const notesToday = await sql`
      SELECT COUNT(*)::int as count FROM notes
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${today} AND created_at < ${tomorrow}
    `;

    const tasksToday = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND completed_at >= ${today} AND completed_at < ${tomorrow}
    `;

    const messagesToday = await sql`
      SELECT COUNT(*)::int as count FROM messages m
      INNER JOIN conversations c ON m.conversation_id = c.id
      WHERE m.sender_id = ${userId} AND c.workspace_id = ${workspaceId}
        AND m.created_at >= ${today} AND m.created_at < ${tomorrow}
    `;

    const xpToday = await sql`
      SELECT COALESCE(SUM(amount), 0)::int as total FROM xp_events
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${today} AND created_at < ${tomorrow}
    `;

    const streak = await sql`
      SELECT current_streak FROM user_gamification
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
    `;

    // Weekly comparison
    const notesThisWeek = await sql`
      SELECT COUNT(*)::int as count FROM notes
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${weekAgo}
    `;

    const notesLastWeek = await sql`
      SELECT COUNT(*)::int as count FROM notes
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo}
    `;

    const tasksThisWeek = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND completed_at >= ${weekAgo}
    `;

    const tasksLastWeek = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND completed_at >= ${twoWeeksAgo} AND completed_at < ${weekAgo}
    `;

    const messagesThisWeek = await sql`
      SELECT COUNT(*)::int as count FROM messages m
      INNER JOIN conversations c ON m.conversation_id = c.id
      WHERE m.sender_id = ${userId} AND c.workspace_id = ${workspaceId}
        AND m.created_at >= ${weekAgo}
    `;

    const messagesLastWeek = await sql`
      SELECT COUNT(*)::int as count FROM messages m
      INNER JOIN conversations c ON m.conversation_id = c.id
      WHERE m.sender_id = ${userId} AND c.workspace_id = ${workspaceId}
        AND m.created_at >= ${twoWeeksAgo} AND m.created_at < ${weekAgo}
    `;

    const calcChange = (current: number, previous: number) =>
      previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

    return {
      notes_created_today: notesToday[0].count,
      tasks_completed_today: tasksToday[0].count,
      messages_sent_today: messagesToday[0].count,
      xp_earned_today: xpToday[0].total,
      current_streak: streak[0]?.current_streak || 0,
      weekly_comparison: {
        notes: {
          current: notesThisWeek[0].count,
          previous: notesLastWeek[0].count,
          change: calcChange(notesThisWeek[0].count, notesLastWeek[0].count),
        },
        tasks: {
          current: tasksThisWeek[0].count,
          previous: tasksLastWeek[0].count,
          change: calcChange(tasksThisWeek[0].count, tasksLastWeek[0].count),
        },
        messages: {
          current: messagesThisWeek[0].count,
          previous: messagesLastWeek[0].count,
          change: calcChange(messagesThisWeek[0].count, messagesLastWeek[0].count),
        },
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
