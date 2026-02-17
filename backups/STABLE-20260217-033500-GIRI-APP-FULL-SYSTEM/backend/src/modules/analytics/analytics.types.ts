import type { UUID, DailyStats, WorkspaceStats, ActivityAction, EntityType } from '../../types/index.js';

export interface LogActivityInput {
  action: ActivityAction;
  entity_type?: EntityType;
  entity_id?: UUID;
  metadata?: Record<string, unknown>;
}

export interface DailyStatsResponse extends DailyStats {
  date_formatted: string;
}

export interface WorkspaceStatsResponse extends WorkspaceStats {
  date_formatted: string;
}

export interface ActivitySummary {
  total_activities: number;
  activities_by_action: Record<string, number>;
  activities_by_entity: Record<string, number>;
  most_active_hours: { hour: number; count: number }[];
}

export interface UserProductivityStats {
  notes_created_today: number;
  tasks_completed_today: number;
  messages_sent_today: number;
  xp_earned_today: number;
  current_streak: number;
  weekly_comparison: {
    notes: { current: number; previous: number; change: number };
    tasks: { current: number; previous: number; change: number };
    messages: { current: number; previous: number; change: number };
  };
}

export interface DateRangeParams {
  from: string;
  to: string;
}
