"use strict";
/**
 * Behavioral Profile Computation Service
 * Calculates comprehensive behavioral profile from raw signals
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeProfile = computeProfile;
exports.getStoredProfile = getStoredProfile;
const database_js_1 = require("../../config/database.js");
async function computeProfile(userId, workspaceId) {
    // 1. Get hourly activity distribution (last 30 days)
    const hourlyActivity = await (0, database_js_1.sql) `
    SELECT hour_of_day, COUNT(*) as count
    FROM behavioral_signals
    WHERE user_id = ${userId} AND occurred_at > NOW() - INTERVAL '30 days'
    GROUP BY hour_of_day
    ORDER BY count DESC
  `;
    // Extract peak and low hours
    const hourCounts = hourlyActivity.map(r => ({
        hour: Number(r.hour_of_day),
        count: Number(r.count)
    }));
    const peakHours = hourCounts.slice(0, 3).map(h => h.hour);
    const lowHours = hourCounts.slice(-3).map(h => h.hour).reverse();
    // 2. Calculate completion and overdue rates
    const taskStats = await (0, database_js_1.sql) `
    SELECT
      COUNT(*) FILTER (WHERE signal_type = 'task_completed') as completed,
      COUNT(*) FILTER (WHERE signal_type = 'task_abandoned') as abandoned,
      COUNT(*) FILTER (WHERE signal_type = 'task_completed' AND (payload->>'was_overdue')::boolean = true) as overdue_completed
    FROM behavioral_signals
    WHERE user_id = ${userId} AND occurred_at > NOW() - INTERVAL '30 days'
      AND signal_type IN ('task_completed', 'task_abandoned')
  `;
    const completed = Number(taskStats[0]?.completed || 0);
    const abandoned = Number(taskStats[0]?.abandoned || 0);
    const overdueCompleted = Number(taskStats[0]?.overdue_completed || 0);
    const completionRate = completed + abandoned > 0
        ? Math.round((completed / (completed + abandoned)) * 100)
        : 0;
    const overdueRate = completed > 0
        ? Math.round((overdueCompleted / completed) * 100)
        : 0;
    // 3. Night owl index (22h-5h)
    const nightActivity = await (0, database_js_1.sql) `
    SELECT
      COUNT(*) FILTER (WHERE hour_of_day >= 22 OR hour_of_day < 5) as night_count,
      COUNT(*) as total_count
    FROM behavioral_signals
    WHERE user_id = ${userId} AND occurred_at > NOW() - INTERVAL '30 days'
  `;
    const nightCount = Number(nightActivity[0]?.night_count || 0);
    const totalCount = Number(nightActivity[0]?.total_count || 0);
    const nightOwlIndex = totalCount > 0 ? Math.round((nightCount / totalCount) * 100) : 0;
    // 4. Burst vs steady index
    const hourlyMax = await (0, database_js_1.sql) `
    SELECT MAX(hourly_count) as max_count, AVG(hourly_count) as avg_count
    FROM (
      SELECT DATE_TRUNC('hour', occurred_at) as hour, COUNT(*) as hourly_count
      FROM behavioral_signals
      WHERE user_id = ${userId} AND occurred_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('hour', occurred_at)
    ) hourly
  `;
    const maxHourly = Number(hourlyMax[0]?.max_count || 0);
    const avgHourly = Number(hourlyMax[0]?.avg_count || 1);
    const burstVsSteadyIndex = avgHourly > 0 ? Math.round((maxHourly / avgHourly) * 10) / 10 : 0;
    // 5. Signal counts
    const signalCounts = await (0, database_js_1.sql) `
    SELECT
      COUNT(*) FILTER (WHERE occurred_at > NOW() - INTERVAL '7 days') as count_7d,
      COUNT(*) FILTER (WHERE occurred_at > NOW() - INTERVAL '30 days') as count_30d
    FROM behavioral_signals
    WHERE user_id = ${userId}
  `;
    const signalsCount7d = Number(signalCounts[0]?.count_7d || 0);
    const signalsCount30d = Number(signalCounts[0]?.count_30d || 0);
    // 6. Project engagement
    const projectActivity = await (0, database_js_1.sql) `
    SELECT payload->>'project_name' as project_name, COUNT(*) as count
    FROM behavioral_signals
    WHERE user_id = ${userId}
      AND occurred_at > NOW() - INTERVAL '30 days'
      AND payload->>'project_name' IS NOT NULL
    GROUP BY payload->>'project_name'
    ORDER BY count DESC
    LIMIT 10
  `;
    const projectEngagement = {};
    for (const row of projectActivity) {
        if (row.project_name) {
            projectEngagement[row.project_name] = Number(row.count);
        }
    }
    // 7. Upsert profile in database
    const now = new Date();
    await (0, database_js_1.sql) `
    INSERT INTO user_behavioral_profile (
      user_id, workspace_id, peak_activity_hours, low_activity_hours,
      completion_rate, overdue_rate, night_owl_index, burst_vs_steady_index,
      signals_count_7d, signals_count_30d, project_engagement, updated_at
    ) VALUES (
      ${userId}, ${workspaceId}, ${JSON.stringify(peakHours)}, ${JSON.stringify(lowHours)},
      ${completionRate}, ${overdueRate}, ${nightOwlIndex}, ${burstVsSteadyIndex},
      ${signalsCount7d}, ${signalsCount30d}, ${JSON.stringify(projectEngagement)}, ${now}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      workspace_id = EXCLUDED.workspace_id,
      peak_activity_hours = EXCLUDED.peak_activity_hours,
      low_activity_hours = EXCLUDED.low_activity_hours,
      completion_rate = EXCLUDED.completion_rate,
      overdue_rate = EXCLUDED.overdue_rate,
      night_owl_index = EXCLUDED.night_owl_index,
      burst_vs_steady_index = EXCLUDED.burst_vs_steady_index,
      signals_count_7d = EXCLUDED.signals_count_7d,
      signals_count_30d = EXCLUDED.signals_count_30d,
      project_engagement = EXCLUDED.project_engagement,
      updated_at = EXCLUDED.updated_at
  `;
    return {
        user_id: userId,
        workspace_id: workspaceId,
        peak_activity_hours: peakHours,
        low_activity_hours: lowHours,
        completion_rate: completionRate,
        overdue_rate: overdueRate,
        night_owl_index: nightOwlIndex,
        burst_vs_steady_index: burstVsSteadyIndex,
        signals_count_7d: signalsCount7d,
        signals_count_30d: signalsCount30d,
        project_engagement: projectEngagement,
        updated_at: now
    };
}
async function getStoredProfile(userId) {
    const result = await (0, database_js_1.sql) `
    SELECT * FROM user_behavioral_profile WHERE user_id = ${userId}
  `;
    if (result.length === 0)
        return null;
    const row = result[0];
    return {
        user_id: row.user_id,
        workspace_id: row.workspace_id,
        peak_activity_hours: row.peak_activity_hours,
        low_activity_hours: row.low_activity_hours,
        completion_rate: Number(row.completion_rate),
        overdue_rate: Number(row.overdue_rate),
        night_owl_index: Number(row.night_owl_index),
        burst_vs_steady_index: Number(row.burst_vs_steady_index),
        signals_count_7d: Number(row.signals_count_7d),
        signals_count_30d: Number(row.signals_count_30d),
        project_engagement: row.project_engagement,
        updated_at: row.updated_at
    };
}
//# sourceMappingURL=signals-profile.service.js.map