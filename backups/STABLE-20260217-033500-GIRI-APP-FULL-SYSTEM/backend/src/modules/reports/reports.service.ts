import { sql } from '../../config/database.js';
import { generateUUID, calculateOffset } from '../../utils/helpers.js';
import type { UUID } from '../../types/index.js';
import type {
  Report,
  ReportMetrics,
  ReportSummary,
  PeriodType,
  GenerateReportInput,
  ReportListParams,
} from './reports.types.js';

export class ReportsService {
  /**
   * Get reports list for a workspace
   */
  async getReports(
    workspaceId: UUID,
    userId: UUID | null,
    params: ReportListParams
  ): Promise<{ reports: Report[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = calculateOffset(page, limit);

    let conditions = sql`workspace_id = ${workspaceId}`;

    if (userId) {
      conditions = sql`${conditions} AND (user_id = ${userId} OR user_id IS NULL)`;
    }

    if (params.period_type) {
      conditions = sql`${conditions} AND period_type = ${params.period_type}`;
    }

    if (params.from) {
      conditions = sql`${conditions} AND period_start >= ${params.from}`;
    }

    if (params.to) {
      conditions = sql`${conditions} AND period_end <= ${params.to}`;
    }

    const reports = await sql`
      SELECT
        id, workspace_id, user_id, period_type,
        period_start, period_end, metrics, created_at
      FROM aggregated_reports
      WHERE ${conditions}
      ORDER BY period_start DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int as count
      FROM aggregated_reports
      WHERE ${conditions}
    `;

    return {
      reports: reports as unknown as Report[],
      total: countResult[0].count,
    };
  }

  /**
   * Get a single report by ID
   */
  async getReportById(reportId: UUID, workspaceId: UUID): Promise<Report | null> {
    const reports = await sql`
      SELECT
        id, workspace_id, user_id, period_type,
        period_start, period_end, metrics, created_at
      FROM aggregated_reports
      WHERE id = ${reportId} AND workspace_id = ${workspaceId}
    `;

    return (reports[0] as Report) || null;
  }

  /**
   * Get quick summary for current period
   */
  async getSummary(
    workspaceId: UUID,
    userId: UUID,
    period: PeriodType
  ): Promise<ReportSummary> {
    const { start, end } = this.getPeriodDates(period);


    const tasksCompleted = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND completed_at >= ${start} AND completed_at <= ${end}
    `;

    const totalTasks = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND created_at <= ${end}
    `;

    // XP earned
    const xpResult = await sql`
      SELECT COALESCE(SUM(amount), 0)::int as total FROM xp_events
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND created_at >= ${start} AND created_at <= ${end}
    `;

    // Streak
    const streakResult = await sql`
      SELECT current_streak, level FROM user_gamification
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
    `;

    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const tasksPerDay = daysInPeriod > 0 ? tasksCompleted[0].count / daysInPeriod : 0;

    const completionRate = totalTasks[0].count > 0
      ? Math.round((tasksCompleted[0].count / totalTasks[0].count) * 100)
      : 0;

    // Calculate score (0-100)
    const score = this.calculateScore({
      tasksCompleted: tasksCompleted[0].count,
      completionRate,
      streak: streakResult[0]?.current_streak || 0,
      xpEarned: xpResult[0].total,
    });

    return {
      tasks_completed: tasksCompleted[0].count,
      completion_rate: completionRate,
      score,
      streak: streakResult[0]?.current_streak || 0,
      xp_earned: xpResult[0].total,
      tasks_per_day: Math.round(tasksPerDay * 10) / 10,
    };
  }

  /**
   * Generate a new report
   */
  async generateReport(
    workspaceId: UUID,
    userId: UUID,
    input: GenerateReportInput
  ): Promise<Report> {
    const { start, end } = input.period_start && input.period_end
      ? { start: new Date(input.period_start), end: new Date(input.period_end) }
      : this.getPeriodDates(input.period_type);

    // Aggregate all metrics
    const metrics = await this.aggregateMetrics(workspaceId, userId, start, end);

    const id = generateUUID();

    // Upsert report
    const reports = await sql`
      INSERT INTO aggregated_reports (
        id, workspace_id, user_id, period_type, period_start, period_end, metrics, created_at
      )
      VALUES (
        ${id}, ${workspaceId}, ${userId}, ${input.period_type},
        ${start}, ${end}, ${sql.json(metrics as any)}, NOW()
      )
      ON CONFLICT (workspace_id, user_id, period_type, period_start)
      DO UPDATE SET
        metrics = ${sql.json(metrics as any)},
        period_end = ${end},
        created_at = NOW()
      RETURNING *
    `;

    return reports[0] as Report;
  }

  /**
   * Aggregate all metrics for a period
   */
  private async aggregateMetrics(
    workspaceId: UUID,
    userId: UUID,
    start: Date,
    end: Date
  ): Promise<ReportMetrics> {
    // Tasks metrics
    const tasksCreated = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND created_at >= ${start} AND created_at <= ${end}
    `;

    const tasksCompleted = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND completed_at >= ${start} AND completed_at <= ${end}
    `;

    const tasksOverdue = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND due_date < NOW() AND status != 'done'
        AND created_at >= ${start} AND created_at <= ${end}
    `;

    const totalTasksInPeriod = await sql`
      SELECT COUNT(*)::int as count FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND created_at >= ${start} AND created_at <= ${end}
    `;

    const completionRate = totalTasksInPeriod[0].count > 0
      ? Math.round((tasksCompleted[0].count / totalTasksInPeriod[0].count) * 100)
      : 0;

    // Projects metrics
    const projectsTotal = await sql`
      SELECT COUNT(*)::int as count FROM projects
      WHERE workspace_id = ${workspaceId}
    `;

    const projectsActive = await sql`
      SELECT COUNT(*)::int as count FROM projects
      WHERE workspace_id = ${workspaceId} AND status = 'active'
    `;

    const projectsCompleted = await sql`
      SELECT COUNT(*)::int as count FROM projects
      WHERE workspace_id = ${workspaceId} AND status = 'archived'
    `;

    const projectsProgress = await sql`
      SELECT COALESCE(AVG(
        CASE WHEN total > 0 THEN (done * 100 / total) ELSE 0 END
      ), 0)::int as avg
      FROM (
        SELECT p.id,
          COUNT(t.id)::int as total,
          COUNT(t.id) FILTER (WHERE t.status = 'done')::int as done
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.id AND t.workspace_id = ${workspaceId}
        WHERE p.workspace_id = ${workspaceId} AND p.status = 'active'
        GROUP BY p.id
      ) project_progress
    `;

    // Productivity metrics
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const tasksPerDay = tasksCompleted[0].count / daysInPeriod;

    const avgCompletionTime = await sql`
      SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600)::float as avg_hours
      FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND completed_at IS NOT NULL
        AND completed_at >= ${start} AND completed_at <= ${end}
    `;

    const mostProductiveDay = await sql`
      SELECT TO_CHAR(completed_at, 'Day') as day_name, COUNT(*)::int as count
      FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND completed_at >= ${start} AND completed_at <= ${end}
      GROUP BY day_name
      ORDER BY count DESC
      LIMIT 1
    `;

    const mostProductiveHour = await sql`
      SELECT EXTRACT(HOUR FROM completed_at)::int as hour, COUNT(*)::int as count
      FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND completed_at >= ${start} AND completed_at <= ${end}
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `;

    // Gamification metrics
    const xpEarned = await sql`
      SELECT COALESCE(SUM(amount), 0)::int as total FROM xp_events
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND created_at >= ${start} AND created_at <= ${end}
    `;

    const gamificationData = await sql`
      SELECT current_streak, level FROM user_gamification
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
    `;

    const achievementsCount = await sql`
      SELECT COUNT(*)::int as count FROM achievements_unlocked
      WHERE user_id = ${userId}
        AND unlocked_at >= ${start} AND unlocked_at <= ${end}
    `;

    const metrics: ReportMetrics = {
      tasks: {
        created: tasksCreated[0].count,
        completed: tasksCompleted[0].count,
        overdue: tasksOverdue[0].count,
        completion_rate: completionRate,
      },
      projects: {
        total: projectsTotal[0].count,
        active: projectsActive[0].count,
        completed: projectsCompleted[0].count,
        avg_progress: projectsProgress[0]?.avg || 0,
      },
      productivity: {
        tasks_per_day: Math.round(tasksPerDay * 10) / 10,
        avg_completion_time_hours: avgCompletionTime[0]?.avg_hours
          ? Math.round(avgCompletionTime[0].avg_hours * 10) / 10
          : null,
        most_productive_day: mostProductiveDay[0]?.day_name?.trim() || null,
        most_productive_hour: mostProductiveHour[0]?.hour ?? null,
      },
      gamification: {
        xp_earned: xpEarned[0].total,
        current_streak: gamificationData[0]?.current_streak || 0,
        achievements_unlocked: achievementsCount[0].count,
        level: gamificationData[0]?.level || 1,
      },
      score: 0,
    };

    // Calculate overall score
    metrics.score = this.calculateScore({
      tasksCompleted: metrics.tasks.completed,
      completionRate: metrics.tasks.completion_rate,
      streak: metrics.gamification.current_streak,
      xpEarned: metrics.gamification.xp_earned,
    });

    return metrics;
  }

  /**
   * Calculate productivity score (0-100)
   */
  private calculateScore(data: {
    tasksCompleted: number;
    completionRate: number;
    streak: number;
    xpEarned: number;
  }): number {
    let score = 0;

    // Task completion (40 points max)
    score += Math.min(data.tasksCompleted * 2, 40);

    // Completion rate (30 points max)
    score += Math.round(data.completionRate * 0.3);

    // Streak bonus (15 points max)
    score += Math.min(data.streak * 3, 15);

    // XP bonus (15 points max)
    score += Math.min(Math.floor(data.xpEarned / 100), 15);

    return Math.min(score, 100);
  }

  /**
   * Get start/end dates for a period type
   */
  private getPeriodDates(periodType: PeriodType): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    switch (periodType) {
      case 'week':
        start.setDate(now.getDate() - now.getDay());
        break;
      case 'month':
        start.setDate(1);
        break;
      case 'year':
        start.setMonth(0, 1);
        break;
    }

    return { start, end };
  }
}

export const reportsService = new ReportsService();
