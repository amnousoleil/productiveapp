import type { UUID } from '../../types/index.js';

// =============================================
// THERAPIST PROFILE
// =============================================

export interface TherapistProfile {
  id: UUID;
  user_id: UUID;
  workspace_id: UUID;
  specialties: string[];
  bio: string | null;
  experience_years: number;
  certifications: string[];
  languages: string[];
  hourly_rate: number;
  currency: string;
  session_duration_minutes: number;
  availability_status: 'available' | 'busy' | 'offline';
  timezone: string;
  auto_record: boolean;
  waiting_room_enabled: boolean;
  max_daily_sessions: number;
  buffer_minutes: number;
  total_sessions: number;
  total_hours: number;
  average_rating: number;
  rating_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTherapistProfileInput {
  specialties?: string[];
  bio?: string;
  experience_years?: number;
  certifications?: string[];
  languages?: string[];
  hourly_rate?: number;
  currency?: string;
  session_duration_minutes?: number;
  auto_record?: boolean;
  waiting_room_enabled?: boolean;
  max_daily_sessions?: number;
  buffer_minutes?: number;
}

export interface UpdateTherapistProfileInput extends Partial<CreateTherapistProfileInput> {
  availability_status?: 'available' | 'busy' | 'offline';
}

// =============================================
// AVAILABILITY
// =============================================

export interface AvailabilitySlot {
  id: UUID;
  therapist_id: UUID;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface CreateAvailabilitySlotInput {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

// =============================================
// CONSULTATION
// =============================================

export type ConsultationStatus = 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Consultation {
  id: UUID;
  workspace_id: UUID;
  therapist_id: UUID;
  client_user_id: UUID;
  scheduled_at: Date;
  duration_minutes: number;
  status: ConsultationStatus;
  room_name: string;
  room_password: string | null;
  started_at: Date | null;
  ended_at: Date | null;
  actual_duration_minutes: number | null;
  therapist_notes: string | null;
  therapist_private_notes: string | null;
  client_rating: number | null;
  client_feedback: string | null;
  amount: number | null;
  currency: string;
  payment_status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateConsultationInput {
  therapist_id: UUID;
  client_user_id: UUID;
  scheduled_at: string;
  duration_minutes?: number;
  amount?: number;
}

export interface UpdateConsultationInput {
  status?: ConsultationStatus;
  therapist_notes?: string;
  therapist_private_notes?: string;
  client_rating?: number;
  client_feedback?: string;
}

// =============================================
// BOOKING
// =============================================

export interface Booking {
  id: UUID;
  consultation_id: UUID | null;
  workspace_id: UUID;
  therapist_id: UUID;
  client_user_id: UUID;
  requested_at: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled';
  client_message: string | null;
  therapist_response: string | null;
  responded_at: Date | null;
  created_at: Date;
}

export interface CreateBookingInput {
  therapist_id: UUID;
  requested_at: string;
  client_message?: string;
}

// =============================================
// RECORDING
// =============================================

export interface SessionRecording {
  id: UUID;
  consultation_id: UUID;
  status: 'recording' | 'processing' | 'ready' | 'failed' | 'deleted';
  file_path: string | null;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  transcription_text: string | null;
  transcription_status: string;
  created_at: Date;
}

// =============================================
// SESSION REPORT
// =============================================

export interface SessionReport {
  id: UUID;
  consultation_id: UUID;
  therapist_id: UUID;
  status: 'draft' | 'reviewed' | 'published' | 'archived';
  ai_summary: string | null;
  ai_key_themes: string[];
  ai_emotional_markers: any[];
  ai_action_items: string[];
  ai_risk_flags: string[];
  client_summary: string | null;
  client_recommendations: string[];
  client_exercises: any[];
  progress_notes: string | null;
  goals_discussed: string[];
  next_session_focus: string | null;
  reviewed_at: Date | null;
  published_at: Date | null;
  created_at: Date;
}

export interface UpdateSessionReportInput {
  status?: 'reviewed' | 'published' | 'archived';
  client_summary?: string;
  client_recommendations?: string[];
  client_exercises?: any[];
  progress_notes?: string;
  next_session_focus?: string;
}

// =============================================
// CLIENT PROGRESS
// =============================================

export interface ClientProgress {
  id: UUID;
  therapist_id: UUID;
  client_user_id: UUID;
  consultation_id: UUID | null;
  session_number: number;
  wellbeing_score: number | null;
  anxiety_level: number | null;
  mood_score: number | null;
  milestones: string[];
  concerns: string[];
  recorded_at: Date;
}

// =============================================
// COMBINED VIEWS
// =============================================

export interface ConsultationWithDetails extends Consultation {
  therapist_name?: string;
  therapist_avatar?: string;
  client_name?: string;
  client_avatar?: string;
  has_recording?: boolean;
  has_report?: boolean;
}

export interface TherapistDashboard {
  profile: TherapistProfile;
  today_sessions: ConsultationWithDetails[];
  upcoming_sessions: ConsultationWithDetails[];
  pending_bookings: Booking[];
  stats: {
    total_sessions: number;
    total_hours: number;
    average_rating: number;
    this_month_sessions: number;
    this_month_revenue: number;
  };
}
