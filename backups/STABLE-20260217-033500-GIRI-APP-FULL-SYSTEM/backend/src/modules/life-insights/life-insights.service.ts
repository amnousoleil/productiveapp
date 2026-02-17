// =============================================
// PRODUCTIVEAPP - LIFE INSIGHTS SERVICE
// Service de tracking et analytics
// =============================================

import { pool } from './pool.js';
import {
  ActivityLogEntry,
  CreateActivityLogDto,
  BehavioralInsight,
  UserPattern,
  DailySnapshot,
  PsychologicalProfile,
  TimelineQuery,
  ActivityStatsQuery,
  ActivityStats,
  HourlyDistribution,
  DailyTrend,
  LifeInsightsExport,
  ActionType,
} from './life-insights.types';

export class LifeInsightsService {
  // ==================== Activity Logging ====================

  /**
   * Enregistre une nouvelle activité utilisateur
   */
  static async logActivity(dto: CreateActivityLogDto): Promise<ActivityLogEntry> {
    const query = `
      INSERT INTO activity_log (
        user_id, member_id, action_type, entity_type, entity_id,
        action_label, metadata, session_id, device_info, ip_address, duration_seconds
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      dto.user_id,
      dto.member_id || null,
      dto.action_type,
      dto.entity_type || null,
      dto.entity_id || null,
      dto.action_label || null,
      JSON.stringify(dto.metadata || {}),
      dto.session_id || null,
      JSON.stringify(dto.device_info || {}),
      dto.ip_address || null,
      dto.duration_seconds || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Récupère les activités d'un utilisateur
   */
  static async getActivities(query: TimelineQuery): Promise<ActivityLogEntry[]> {
    let sql = `
      SELECT * FROM activity_log
      WHERE user_id = $1
    `;

    const values: any[] = [query.user_id];
    let paramCount = 1;

    if (query.member_id) {
      paramCount++;
      sql += ` AND member_id = $${paramCount}`;
      values.push(query.member_id);
    }

    if (query.start_date) {
      paramCount++;
      sql += ` AND created_at >= $${paramCount}`;
      values.push(query.start_date);
    }

    if (query.end_date) {
      paramCount++;
      sql += ` AND created_at <= $${paramCount}`;
      values.push(query.end_date);
    }

    if (query.action_types && query.action_types.length > 0) {
      paramCount++;
      sql += ` AND action_type = ANY($${paramCount}::varchar[])`;
      values.push(query.action_types);
    }

    if (query.entity_types && query.entity_types.length > 0) {
      paramCount++;
      sql += ` AND entity_type = ANY($${paramCount}::varchar[])`;
      values.push(query.entity_types);
    }

    sql += ` ORDER BY created_at DESC`;

    if (query.limit) {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      values.push(query.limit);
    }

    const result = await pool.query(sql, values);
    return result.rows;
  }

  // ==================== Statistics ====================

  /**
   * Récupère les statistiques d'activité d'un utilisateur
   */
  static async getActivityStats(query: ActivityStatsQuery): Promise<ActivityStats> {
    let dateFilter = '';
    const values: any[] = [query.user_id];

    if (query.period && query.period !== 'all') {
      const intervals = {
        day: '1 day',
        week: '7 days',
        month: '30 days',
        year: '365 days',
      };
      dateFilter = `AND created_at >= NOW() - INTERVAL '${intervals[query.period]}'`;
    }

    if (query.member_id) {
      dateFilter += ' AND member_id = $2';
      values.push(query.member_id);
    }

    const sql = `
      SELECT
        COUNT(*) as total_actions,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(*) FILTER (WHERE action_type LIKE 'task_%') as task_actions,
        COUNT(*) FILTER (WHERE action_type LIKE 'note_%') as note_actions,
        COUNT(*) FILTER (WHERE action_type = 'pomodoro_completed') as pomodoros_completed,
        MIN(created_at) as first_activity,
        MAX(created_at) as last_activity
      FROM activity_log
      WHERE user_id = $1 ${dateFilter}
    `;

    const result = await pool.query(sql, values);
    const row = result.rows[0];

    return {
      total_actions: parseInt(row.total_actions) || 0,
      active_days: parseInt(row.active_days) || 0,
      total_sessions: parseInt(row.total_sessions) || 0,
      task_actions: parseInt(row.task_actions) || 0,
      note_actions: parseInt(row.note_actions) || 0,
      pomodoros_completed: parseInt(row.pomodoros_completed) || 0,
      first_activity: row.first_activity,
      last_activity: row.last_activity,
    };
  }

  /**
   * Récupère la distribution horaire des activités
   */
  static async getHourlyDistribution(userId: string, days: number = 30): Promise<HourlyDistribution[]> {
    const query = `
      SELECT
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as action_count,
        MODE() WITHIN GROUP (ORDER BY action_type) as dominant_action_type
      FROM activity_log
      WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `;

    const result = await pool.query(query, [userId]);
    return result.rows.map((row: any) => ({
      hour: parseInt(row.hour),
      action_count: parseInt(row.action_count),
      dominant_action_type: row.dominant_action_type as ActionType,
    }));
  }

  /**
   * Récupère les tendances quotidiennes
   */
  static async getDailyTrends(userId: string, days: number = 30): Promise<DailyTrend[]> {
    const query = `
      SELECT
        DATE(a.created_at) as date,
        COUNT(*) as action_count,
        COUNT(*) FILTER (WHERE a.action_type = 'task_completed') as tasks_completed,
        COUNT(*) FILTER (WHERE a.action_type = 'note_created') as notes_created,
        COUNT(*) FILTER (WHERE a.action_type = 'pomodoro_completed') as pomodoros_completed,
        COALESCE(s.productivity_score, 0) as productivity_score
      FROM activity_log a
      LEFT JOIN daily_snapshots s ON s.user_id = a.user_id AND s.snapshot_date = DATE(a.created_at)
      WHERE a.user_id = $1
        AND a.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(a.created_at), s.productivity_score
      ORDER BY date DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows.map((row: any) => ({
      date: row.date.toISOString().split('T')[0],
      action_count: parseInt(row.action_count),
      tasks_completed: parseInt(row.tasks_completed),
      notes_created: parseInt(row.notes_created),
      pomodoros_completed: parseInt(row.pomodoros_completed),
      productivity_score: row.productivity_score ? parseFloat(row.productivity_score) : null,
    }));
  }

  // ==================== Insights Management ====================

  /**
   * Crée un nouvel insight
   */
  static async createInsight(insight: BehavioralInsight): Promise<BehavioralInsight> {
    const query = `
      INSERT INTO behavioral_insights (
        user_id, member_id, insight_type, insight_category,
        title, description, recommendation,
        insight_data, confidence_score, evidence_count, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      insight.user_id,
      insight.member_id || null,
      insight.insight_type,
      insight.insight_category,
      insight.title,
      insight.description,
      insight.recommendation || null,
      JSON.stringify(insight.insight_data || {}),
      insight.confidence_score || 0.0,
      insight.evidence_count || 0,
      insight.priority || 0,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Récupère les insights actifs d'un utilisateur
   */
  static async getInsights(userId: string, memberId?: string | null): Promise<BehavioralInsight[]> {
    let query = `
      SELECT * FROM behavioral_insights
      WHERE user_id = $1
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const values: any[] = [userId];

    if (memberId) {
      query += ` AND member_id = $2`;
      values.push(memberId);
    }

    query += ` ORDER BY priority DESC, generated_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Marque un insight comme lu
   */
  static async markInsightAsRead(insightId: number): Promise<void> {
    await pool.query('UPDATE behavioral_insights SET is_read = true WHERE id = $1', [insightId]);
  }

  // ==================== Patterns Management ====================

  /**
   * Récupère les patterns actifs d'un utilisateur
   */
  static async getPatterns(userId: string, memberId?: string | null): Promise<UserPattern[]> {
    let query = `
      SELECT * FROM user_patterns
      WHERE user_id = $1 AND is_active = true
    `;

    const values: any[] = [userId];

    if (memberId) {
      query += ` AND member_id = $2`;
      values.push(memberId);
    }

    query += ` ORDER BY strength DESC, last_seen_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Enregistre ou met à jour un pattern
   */
  static async upsertPattern(pattern: UserPattern): Promise<UserPattern> {
    const existingQuery = `
      SELECT id FROM user_patterns
      WHERE user_id = $1 AND pattern_type = $2 AND is_active = true
    `;

    const existing = await pool.query(existingQuery, [pattern.user_id, pattern.pattern_type]);

    if (existing.rows.length > 0) {
      // Update existing
      const updateQuery = `
        UPDATE user_patterns
        SET pattern_data = $1,
            strength = $2,
            last_seen_at = NOW(),
            occurrence_count = occurrence_count + 1
        WHERE id = $3
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [
        JSON.stringify(pattern.pattern_data),
        pattern.strength || 0.0,
        existing.rows[0].id,
      ]);

      return result.rows[0];
    } else {
      // Insert new
      const insertQuery = `
        INSERT INTO user_patterns (
          user_id, member_id, pattern_type, pattern_name,
          pattern_data, strength, frequency, is_positive
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        pattern.user_id,
        pattern.member_id || null,
        pattern.pattern_type,
        pattern.pattern_name,
        JSON.stringify(pattern.pattern_data),
        pattern.strength || 0.0,
        pattern.frequency || null,
        pattern.is_positive ?? null,
      ]);

      return result.rows[0];
    }
  }

  // ==================== Daily Snapshots ====================

  /**
   * Récupère ou crée le snapshot du jour
   */
  static async getTodaySnapshot(userId: string, memberId?: string | null): Promise<DailySnapshot | null> {
    const query = `
      SELECT * FROM daily_snapshots
      WHERE user_id = $1 AND snapshot_date = CURRENT_DATE
      ${memberId ? 'AND member_id = $2' : ''}
    `;

    const values = memberId ? [userId, memberId] : [userId];
    const result = await pool.query(query, values);

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Met à jour le snapshot quotidien
   */
  static async updateDailySnapshot(snapshot: DailySnapshot): Promise<DailySnapshot> {
    const query = `
      INSERT INTO daily_snapshots (
        user_id, member_id, snapshot_date,
        total_actions, tasks_completed, notes_created, pomodoros_completed,
        total_active_time_minutes, dominant_emotion, energy_level,
        productivity_score, stress_score,
        top_action_types, top_categories, ai_summary, highlights, lowlights
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (user_id, snapshot_date)
      DO UPDATE SET
        total_actions = EXCLUDED.total_actions,
        tasks_completed = EXCLUDED.tasks_completed,
        notes_created = EXCLUDED.notes_created,
        pomodoros_completed = EXCLUDED.pomodoros_completed,
        total_active_time_minutes = EXCLUDED.total_active_time_minutes,
        dominant_emotion = EXCLUDED.dominant_emotion,
        energy_level = EXCLUDED.energy_level,
        productivity_score = EXCLUDED.productivity_score,
        stress_score = EXCLUDED.stress_score,
        top_action_types = EXCLUDED.top_action_types,
        top_categories = EXCLUDED.top_categories,
        ai_summary = EXCLUDED.ai_summary,
        highlights = EXCLUDED.highlights,
        lowlights = EXCLUDED.lowlights
      RETURNING *
    `;

    const values = [
      snapshot.user_id,
      snapshot.member_id || null,
      snapshot.snapshot_date,
      snapshot.total_actions || 0,
      snapshot.tasks_completed || 0,
      snapshot.notes_created || 0,
      snapshot.pomodoros_completed || 0,
      snapshot.total_active_time_minutes || 0,
      snapshot.dominant_emotion || null,
      snapshot.energy_level || null,
      snapshot.productivity_score || null,
      snapshot.stress_score || null,
      JSON.stringify(snapshot.top_action_types || []),
      JSON.stringify(snapshot.top_categories || []),
      snapshot.ai_summary || null,
      JSON.stringify(snapshot.highlights || []),
      JSON.stringify(snapshot.lowlights || []),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ==================== Psychological Profile ====================

  /**
   * Récupère le profil psychologique d'un utilisateur
   */
  static async getProfile(userId: string, memberId?: string | null): Promise<PsychologicalProfile | null> {
    let query = `SELECT * FROM psychological_profiles WHERE user_id = $1`;
    const values: any[] = [userId];

    if (memberId) {
      query += ` AND member_id = $2`;
      values.push(memberId);
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Crée ou met à jour le profil psychologique
   */
  static async upsertProfile(profile: PsychologicalProfile): Promise<PsychologicalProfile> {
    const existing = await this.getProfile(profile.user_id, profile.member_id);

    if (existing) {
      // Update
      const query = `
        UPDATE psychological_profiles
        SET openness_score = $1, conscientiousness_score = $2, extraversion_score = $3,
            agreeableness_score = $4, neuroticism_score = $5,
            work_style = $6, communication_style = $7, decision_style = $8,
            peak_performance_hours = $9, preferred_task_types = $10, energy_pattern = $11,
            primary_motivators = $12, stress_triggers = $13, coping_strategies = $14,
            profile_summary = $15, strengths = $16, growth_areas = $17, recommendations = $18,
            confidence_score = $19, data_points_analyzed = $20, updated_at = NOW()
        WHERE user_id = $21
        RETURNING *
      `;

      const result = await pool.query(query, [
        profile.openness_score,
        profile.conscientiousness_score,
        profile.extraversion_score,
        profile.agreeableness_score,
        profile.neuroticism_score,
        profile.work_style,
        profile.communication_style,
        profile.decision_style,
        JSON.stringify(profile.peak_performance_hours || []),
        JSON.stringify(profile.preferred_task_types || []),
        profile.energy_pattern,
        JSON.stringify(profile.primary_motivators || []),
        JSON.stringify(profile.stress_triggers || []),
        JSON.stringify(profile.coping_strategies || []),
        profile.profile_summary,
        JSON.stringify(profile.strengths || []),
        JSON.stringify(profile.growth_areas || []),
        JSON.stringify(profile.recommendations || []),
        profile.confidence_score || 0.0,
        profile.data_points_analyzed || 0,
        profile.user_id,
      ]);

      return result.rows[0];
    } else {
      // Insert
      const query = `
        INSERT INTO psychological_profiles (
          user_id, member_id,
          openness_score, conscientiousness_score, extraversion_score,
          agreeableness_score, neuroticism_score,
          work_style, communication_style, decision_style,
          peak_performance_hours, preferred_task_types, energy_pattern,
          primary_motivators, stress_triggers, coping_strategies,
          profile_summary, strengths, growth_areas, recommendations,
          confidence_score, data_points_analyzed
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING *
      `;

      const result = await pool.query(query, [
        profile.user_id,
        profile.member_id || null,
        profile.openness_score,
        profile.conscientiousness_score,
        profile.extraversion_score,
        profile.agreeableness_score,
        profile.neuroticism_score,
        profile.work_style,
        profile.communication_style,
        profile.decision_style,
        JSON.stringify(profile.peak_performance_hours || []),
        JSON.stringify(profile.preferred_task_types || []),
        profile.energy_pattern,
        JSON.stringify(profile.primary_motivators || []),
        JSON.stringify(profile.stress_triggers || []),
        JSON.stringify(profile.coping_strategies || []),
        profile.profile_summary,
        JSON.stringify(profile.strengths || []),
        JSON.stringify(profile.growth_areas || []),
        JSON.stringify(profile.recommendations || []),
        profile.confidence_score || 0.0,
        profile.data_points_analyzed || 0,
      ]);

      return result.rows[0];
    }
  }

  // ==================== Export ====================

  /**
   * Exporte toutes les données Life Insights d'un utilisateur
   */
  static async exportUserData(userId: string, memberId?: string | null): Promise<LifeInsightsExport> {
    const [activities, insights, patterns, snapshots, profile, stats] = await Promise.all([
      this.getActivities({ user_id: userId, member_id: memberId, limit: 10000 }),
      this.getInsights(userId, memberId),
      this.getPatterns(userId, memberId),
      pool.query('SELECT * FROM daily_snapshots WHERE user_id = $1 ORDER BY snapshot_date DESC LIMIT 90', [userId]),
      this.getProfile(userId, memberId),
      this.getActivityStats({ user_id: userId, member_id: memberId, period: 'all' }),
    ]);

    return {
      user_id: userId,
      member_id: memberId || null,
      export_date: new Date(),
      activity_log: activities,
      insights,
      patterns,
      snapshots: snapshots.rows,
      profile,
      stats,
    };
  }
}
