// =============================================
// PRODUCTIVEAPP - LIFE INSIGHTS TYPES
// Types et interfaces pour le système d'analyse
// =============================================

export type ActionType =
  | 'login'
  | 'logout'
  | 'session_start'
  | 'session_end'
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_deleted'
  | 'note_created'
  | 'note_updated'
  | 'note_deleted'
  | 'project_created'
  | 'project_updated'
  | 'project_archived'
  | 'pomodoro_started'
  | 'pomodoro_completed'
  | 'pomodoro_cancelled'
  | 'message_sent'
  | 'file_uploaded'
  | 'gamification_xp_earned'
  | 'gamification_level_up'
  | 'audit_started'
  | 'audit_completed'
  | 'ai_chat_message'
  | 'ai_suggestion_accepted'
  | 'theme_changed'
  | 'settings_updated'
  | 'calendar_event_created'
  | 'calendar_event_updated'
  | 'invoice_created'
  | 'payment_received'
  | 'custom';

export type EntityType =
  | 'task'
  | 'note'
  | 'project'
  | 'pomodoro'
  | 'message'
  | 'file'
  | 'user'
  | 'gamification'
  | 'audit'
  | 'calendar_event'
  | 'invoice'
  | null;

export type InsightCategory = 'productivity' | 'emotional' | 'social' | 'health' | 'cognitive' | 'motivation' | 'stress';

export type PatternType =
  | 'peak_hours'
  | 'low_hours'
  | 'task_completion_rhythm'
  | 'procrastination_trigger'
  | 'productivity_spike'
  | 'burnout_risk'
  | 'energy_cycle'
  | 'focus_duration'
  | 'break_pattern'
  | 'social_interaction'
  | 'stress_indicator'
  | 'motivation_driver'
  | 'custom';

export type WorkStyle = 'deep_focus' | 'multitasker' | 'sprinter' | 'marathoner' | 'balanced' | 'adaptive';
export type CommunicationStyle = 'direct' | 'collaborative' | 'reflective';
export type DecisionStyle = 'analytical' | 'intuitive' | 'balanced';
export type EnergyPattern = 'morning_person' | 'night_owl' | 'variable';

// ==================== Activity Log ====================

export interface ActivityLogEntry {
  id?: number;
  user_id: string; // UUID
  member_id?: string | null; // UUID
  action_type: ActionType;
  entity_type?: EntityType;
  entity_id?: string | null;
  action_label?: string | null;
  metadata?: Record<string, any>;
  session_id?: string | null; // UUID
  device_info?: Record<string, any>;
  ip_address?: string | null;
  duration_seconds?: number | null;
  created_at?: Date;
}

export interface CreateActivityLogDto {
  user_id: string;
  member_id?: string | null;
  action_type: ActionType;
  entity_type?: EntityType;
  entity_id?: string | null;
  action_label?: string | null;
  metadata?: Record<string, any>;
  session_id?: string | null;
  device_info?: Record<string, any>;
  ip_address?: string | null;
  duration_seconds?: number | null;
}

// ==================== Behavioral Insights ====================

export interface BehavioralInsight {
  id?: number;
  user_id: string;
  member_id?: string | null;
  insight_type: string;
  insight_category: InsightCategory;
  title: string;
  description: string;
  recommendation?: string | null;
  insight_data?: Record<string, any>;
  confidence_score?: number;
  evidence_count?: number;
  generated_at?: Date;
  expires_at?: Date | null;
  is_active?: boolean;
  is_read?: boolean;
  priority?: number; // 0=low, 1=medium, 2=high, 3=critical
}

export interface GenerateInsightDto {
  user_id: string;
  member_id?: string | null;
  insight_type: string;
  insight_category: InsightCategory;
  title: string;
  description: string;
  recommendation?: string | null;
  insight_data?: Record<string, any>;
  confidence_score?: number;
  evidence_count?: number;
  priority?: number;
}

// ==================== User Patterns ====================

export interface UserPattern {
  id?: number;
  user_id: string;
  member_id?: string | null;
  pattern_type: PatternType;
  pattern_name: string;
  pattern_data: Record<string, any>;
  strength?: number; // 0-1
  frequency?: string | null; // 'daily', 'weekly', 'monthly'
  first_detected_at?: Date;
  last_seen_at?: Date;
  occurrence_count?: number;
  is_positive?: boolean | null;
  is_active?: boolean;
}

// ==================== Daily Snapshots ====================

export interface DailySnapshot {
  id?: number;
  user_id: string;
  member_id?: string | null;
  snapshot_date: Date;
  total_actions?: number;
  tasks_completed?: number;
  notes_created?: number;
  pomodoros_completed?: number;
  total_active_time_minutes?: number;
  dominant_emotion?: string | null;
  energy_level?: number | null; // 1-5
  productivity_score?: number | null; // 0-100
  stress_score?: number | null; // 0-100
  top_action_types?: string[]; // JSON
  top_categories?: string[]; // JSON
  ai_summary?: string | null;
  highlights?: string[]; // JSON
  lowlights?: string[]; // JSON
  created_at?: Date;
}

// ==================== Psychological Profile ====================

export interface PsychologicalProfile {
  id?: number;
  user_id: string;
  member_id?: string | null;

  // Big Five
  openness_score?: number | null;
  conscientiousness_score?: number | null;
  extraversion_score?: number | null;
  agreeableness_score?: number | null;
  neuroticism_score?: number | null;

  // Work styles
  work_style?: WorkStyle | null;
  communication_style?: CommunicationStyle | null;
  decision_style?: DecisionStyle | null;

  // Patterns
  peak_performance_hours?: number[]; // [9, 10, 11, 14, 15]
  preferred_task_types?: string[]; // ['creative', 'analytical']
  energy_pattern?: EnergyPattern | null;

  // Motivation & Stress
  primary_motivators?: string[]; // ['achievement', 'autonomy', 'mastery']
  stress_triggers?: string[]; // ['deadlines', 'multitasking']
  coping_strategies?: string[]; // ['breaks', 'exercise', 'music']

  // AI narrative
  profile_summary?: string | null;
  strengths?: string[];
  growth_areas?: string[];
  recommendations?: string[];

  // Metadata
  confidence_score?: number;
  data_points_analyzed?: number;
  generated_at?: Date;
  updated_at?: Date;
}

// ==================== Analytics DTOs ====================

export interface TimelineQuery {
  user_id: string;
  member_id?: string | null;
  start_date?: Date;
  end_date?: Date;
  action_types?: ActionType[];
  entity_types?: EntityType[];
  limit?: number;
}

export interface ActivityStatsQuery {
  user_id: string;
  member_id?: string | null;
  period?: 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface ActivityStats {
  total_actions: number;
  active_days: number;
  total_sessions: number;
  task_actions: number;
  note_actions: number;
  pomodoros_completed: number;
  first_activity: Date | null;
  last_activity: Date | null;
}

export interface HourlyDistribution {
  hour: number; // 0-23
  action_count: number;
  dominant_action_type: ActionType | null;
}

export interface DailyTrend {
  date: string; // YYYY-MM-DD
  action_count: number;
  tasks_completed: number;
  notes_created: number;
  pomodoros_completed: number;
  productivity_score: number | null;
}

// ==================== AI Analysis DTOs ====================

export interface AnalyzeUserRequest {
  user_id: string;
  member_id?: string | null;
  analysis_type: 'full' | 'quick' | 'psychological' | 'behavioral' | 'patterns';
  days_to_analyze?: number; // Défaut 30
  regenerate?: boolean; // Force regenerate même si déjà existant
}

export interface AnalyzeUserResponse {
  user_id: string;
  analysis_type: string;
  profile: PsychologicalProfile | null;
  insights: BehavioralInsight[];
  patterns: UserPattern[];
  daily_snapshots: DailySnapshot[];
  recommendations: string[];
  confidence_score: number;
  data_points_analyzed: number;
  generated_at: Date;
}

// ==================== Exports ====================

export interface LifeInsightsExport {
  user_id: string;
  member_id?: string | null;
  export_date: Date;
  activity_log: ActivityLogEntry[];
  insights: BehavioralInsight[];
  patterns: UserPattern[];
  snapshots: DailySnapshot[];
  profile: PsychologicalProfile | null;
  stats: ActivityStats;
}
