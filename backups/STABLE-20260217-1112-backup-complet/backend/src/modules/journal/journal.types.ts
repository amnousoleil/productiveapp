// =============================================
// JOURNAL MODULE - TYPES
// =============================================

export interface JournalEntry {
  id: string;
  user_id: string;
  workspace_id: string;
  date: string;
  content: string | null;
  mood: number | null;
  energy_level: number | null;
  sleep_quality: number | null;
  tags: string[];
  weather: Record<string, any> | null;
  highlights: string[];
  challenges: string[];
  gratitude: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateJournalEntryDTO {
  date?: string; // Default: today
  content?: string;
  mood?: number; // 1-10
  energy_level?: number; // 1-10
  sleep_quality?: number; // 1-10
  tags?: string[];
  weather?: Record<string, any>;
  highlights?: string[];
  challenges?: string[];
  gratitude?: string[];
}

export interface UpdateJournalEntryDTO {
  content?: string;
  mood?: number;
  energy_level?: number;
  sleep_quality?: number;
  tags?: string[];
  weather?: Record<string, any>;
  highlights?: string[];
  challenges?: string[];
  gratitude?: string[];
}

export interface JournalFilters {
  start_date?: string;
  end_date?: string;
  min_mood?: number;
  max_mood?: number;
  tags?: string[];
}
