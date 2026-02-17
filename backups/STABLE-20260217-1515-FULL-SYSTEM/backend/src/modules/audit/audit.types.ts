import type { AuditReportType, HumanDesignType, BirthData } from '../../types/index.js';

export interface CreateJournalEntryInput {
  date?: string;
  content: string;
  mood?: number;
  energy_level?: number;
  sleep_quality?: number;
  tags?: string[];
  highlights?: string[];
  challenges?: string[];
  gratitude?: string[];
}

export interface UpdateJournalEntryInput {
  content?: string;
  mood?: number;
  energy_level?: number;
  sleep_quality?: number;
  tags?: string[];
  highlights?: string[];
  challenges?: string[];
  gratitude?: string[];
}

export interface CreateHumanDesignInput {
  type: HumanDesignType;
  authority: string;
  profile: string;
  definition: string;
  centers: Record<string, boolean>;
  channels: string[];
  gates: number[];
  incarnation_cross: string;
  variables?: Record<string, unknown>;
  birth_data: BirthData;
}

export interface GenerateReportInput {
  report_type: AuditReportType;
  period_start: string;
  period_end: string;
}

export interface JournalStats {
  total_entries: number;
  average_mood: number;
  average_energy: number;
  average_sleep: number;
  current_streak: number;
  most_used_tags: { tag: string; count: number }[];
}

// Psycho Audit
export interface CreatePsychoAuditInput {
  score: number;
  answers?: unknown[] | Record<string, unknown>;
  recommendations?: unknown[] | Record<string, unknown>;
}

export interface PsychoAudit {
  id: string;
  user_id: string;
  workspace_id: string;
  score: number;
  answers: unknown[] | Record<string, unknown>;
  recommendations: unknown[] | Record<string, unknown>;
  created_at: Date;
}
