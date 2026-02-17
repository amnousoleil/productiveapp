export type ActionType = 'login' | 'logout' | 'session_start' | 'session_end' | 'task_created' | 'task_updated' | 'task_completed' | 'task_deleted' | 'note_created' | 'note_updated' | 'note_deleted' | 'project_created' | 'project_updated' | 'project_archived' | 'pomodoro_started' | 'pomodoro_completed' | 'pomodoro_cancelled' | 'message_sent' | 'file_uploaded' | 'gamification_xp_earned' | 'gamification_level_up' | 'audit_started' | 'audit_completed' | 'ai_chat_message' | 'ai_suggestion_accepted' | 'theme_changed' | 'settings_updated' | 'calendar_event_created' | 'calendar_event_updated' | 'invoice_created' | 'payment_received' | 'custom';
export type EntityType = 'task' | 'note' | 'project' | 'pomodoro' | 'message' | 'file' | 'user' | 'gamification' | 'audit' | 'calendar_event' | 'invoice' | null;
export type InsightCategory = 'productivity' | 'emotional' | 'social' | 'health' | 'cognitive' | 'motivation' | 'stress';
export type PatternType = 'peak_hours' | 'low_hours' | 'task_completion_rhythm' | 'procrastination_trigger' | 'productivity_spike' | 'burnout_risk' | 'energy_cycle' | 'focus_duration' | 'break_pattern' | 'social_interaction' | 'stress_indicator' | 'motivation_driver' | 'custom';
export type WorkStyle = 'deep_focus' | 'multitasker' | 'sprinter' | 'marathoner' | 'balanced' | 'adaptive';
export type CommunicationStyle = 'direct' | 'collaborative' | 'reflective';
export type DecisionStyle = 'analytical' | 'intuitive' | 'balanced';
export type EnergyPattern = 'morning_person' | 'night_owl' | 'variable';
export interface ActivityLogEntry {
    id?: number;
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
    priority?: number;
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
export interface UserPattern {
    id?: number;
    user_id: string;
    member_id?: string | null;
    pattern_type: PatternType;
    pattern_name: string;
    pattern_data: Record<string, any>;
    strength?: number;
    frequency?: string | null;
    first_detected_at?: Date;
    last_seen_at?: Date;
    occurrence_count?: number;
    is_positive?: boolean | null;
    is_active?: boolean;
}
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
    energy_level?: number | null;
    productivity_score?: number | null;
    stress_score?: number | null;
    top_action_types?: string[];
    top_categories?: string[];
    ai_summary?: string | null;
    highlights?: string[];
    lowlights?: string[];
    created_at?: Date;
}
export interface PsychologicalProfile {
    id?: number;
    user_id: string;
    member_id?: string | null;
    openness_score?: number | null;
    conscientiousness_score?: number | null;
    extraversion_score?: number | null;
    agreeableness_score?: number | null;
    neuroticism_score?: number | null;
    work_style?: WorkStyle | null;
    communication_style?: CommunicationStyle | null;
    decision_style?: DecisionStyle | null;
    peak_performance_hours?: number[];
    preferred_task_types?: string[];
    energy_pattern?: EnergyPattern | null;
    primary_motivators?: string[];
    stress_triggers?: string[];
    coping_strategies?: string[];
    profile_summary?: string | null;
    strengths?: string[];
    growth_areas?: string[];
    recommendations?: string[];
    confidence_score?: number;
    data_points_analyzed?: number;
    generated_at?: Date;
    updated_at?: Date;
}
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
    hour: number;
    action_count: number;
    dominant_action_type: ActionType | null;
}
export interface DailyTrend {
    date: string;
    action_count: number;
    tasks_completed: number;
    notes_created: number;
    pomodoros_completed: number;
    productivity_score: number | null;
}
export interface AnalyzeUserRequest {
    user_id: string;
    member_id?: string | null;
    analysis_type: 'full' | 'quick' | 'psychological' | 'behavioral' | 'patterns';
    days_to_analyze?: number;
    regenerate?: boolean;
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
//# sourceMappingURL=life-insights.types.d.ts.map