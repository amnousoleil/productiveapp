-- Migration: 017_giri_vision
-- Description: Create Giri Vision video consultation platform tables
-- Created: 2026-02-06

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE consultation_status AS ENUM (
  'scheduled',    -- Réservée, pas encore commencée
  'waiting',      -- Client dans le salon d'attente
  'in_progress',  -- Séance en cours
  'completed',    -- Séance terminée normalement
  'cancelled',    -- Annulée
  'no_show'       -- Client absent
);

CREATE TYPE therapist_availability_status AS ENUM (
  'available',
  'busy',
  'offline'
);

CREATE TYPE booking_status AS ENUM (
  'pending',      -- En attente de confirmation
  'confirmed',    -- Confirmée par le thérapeute
  'cancelled',    -- Annulée
  'rescheduled'   -- Reportée
);

CREATE TYPE session_report_status AS ENUM (
  'draft',        -- Brouillon (auto-généré par IA)
  'reviewed',     -- Relu par le thérapeute
  'published',    -- Envoyé au client
  'archived'      -- Archivé
);

CREATE TYPE recording_status AS ENUM (
  'recording',    -- En cours d'enregistrement
  'processing',   -- Post-traitement
  'ready',        -- Prêt à visionner
  'failed',       -- Échec
  'deleted'       -- Supprimé
);

-- =============================================
-- THERAPIST PROFILES
-- =============================================

CREATE TABLE therapist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Informations professionnelles
  specialties TEXT[] DEFAULT '{}',
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{fr}',

  -- Tarification
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  session_duration_minutes INTEGER DEFAULT 60,

  -- Disponibilité
  availability_status therapist_availability_status DEFAULT 'offline',
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',

  -- Paramètres
  auto_record BOOLEAN DEFAULT FALSE,
  waiting_room_enabled BOOLEAN DEFAULT TRUE,
  max_daily_sessions INTEGER DEFAULT 8,
  buffer_minutes INTEGER DEFAULT 15, -- pause entre sessions

  -- Stats
  total_sessions INTEGER DEFAULT 0,
  total_hours DECIMAL(10,1) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, workspace_id)
);

-- =============================================
-- AVAILABILITY SLOTS (créneaux récurrents)
-- =============================================

CREATE TABLE therapist_availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES therapist_profiles(id) ON DELETE CASCADE,

  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dimanche
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (start_time < end_time)
);

-- =============================================
-- CONSULTATIONS (séances)
-- =============================================

CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Planning
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status consultation_status DEFAULT 'scheduled',

  -- Jitsi
  room_name VARCHAR(255) NOT NULL UNIQUE,
  room_password VARCHAR(100),
  jitsi_jwt TEXT,

  -- Déroulé
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  actual_duration_minutes INTEGER,

  -- Notes du thérapeute (pendant la séance)
  therapist_notes TEXT,
  therapist_private_notes TEXT, -- jamais partagé avec le client

  -- Feedback
  client_rating INTEGER CHECK (client_rating BETWEEN 1 AND 5),
  client_feedback TEXT,

  -- Paiement (préparé pour Stripe)
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_intent_id VARCHAR(255),

  -- Métadonnées
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BOOKINGS (réservations)
-- =============================================

CREATE TABLE consultation_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  requested_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status booking_status DEFAULT 'pending',

  -- Message du client lors de la réservation
  client_message TEXT,
  therapist_response TEXT,

  responded_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SESSION RECORDINGS (enregistrements)
-- =============================================

CREATE TABLE session_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,

  status recording_status DEFAULT 'recording',

  -- Stockage
  file_path VARCHAR(500),
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  format VARCHAR(20) DEFAULT 'webm',

  -- Transcription
  transcription_text TEXT,
  transcription_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, ready, failed
  transcription_language VARCHAR(10) DEFAULT 'fr',

  -- Sécurité
  encryption_key_id VARCHAR(255),
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,

  -- Rétention
  expires_at TIMESTAMP WITH TIME ZONE, -- date de suppression auto

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SESSION REPORTS (rapports IA)
-- =============================================

CREATE TABLE session_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapist_profiles(id) ON DELETE CASCADE,

  status session_report_status DEFAULT 'draft',

  -- Rapport IA (version thérapeute - complet)
  ai_summary TEXT,
  ai_key_themes JSONB DEFAULT '[]',     -- ["anxiété", "relation familiale", ...]
  ai_emotional_markers JSONB DEFAULT '[]', -- [{timestamp, emotion, intensity}]
  ai_action_items JSONB DEFAULT '[]',    -- ["exercice respiration", "journal"]
  ai_risk_flags JSONB DEFAULT '[]',      -- alertes éventuelles

  -- Rapport client (version filtrée par le thérapeute)
  client_summary TEXT,
  client_recommendations JSONB DEFAULT '[]',
  client_exercises JSONB DEFAULT '[]',   -- exercices recommandés (lien Psycho-Audit)

  -- Suivi inter-séances
  progress_notes TEXT,
  goals_discussed JSONB DEFAULT '[]',
  next_session_focus TEXT,

  -- Édition par le thérapeute
  therapist_edits JSONB DEFAULT '{}',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CLIENT PROGRESS (suivi longitudinal)
-- =============================================

CREATE TABLE client_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,

  -- Métriques de progression
  session_number INTEGER DEFAULT 1,
  wellbeing_score INTEGER CHECK (wellbeing_score BETWEEN 1 AND 10),
  anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 10),
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),

  -- Notes de progression
  milestones JSONB DEFAULT '[]',
  concerns JSONB DEFAULT '[]',

  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Therapist profiles
CREATE INDEX idx_therapist_profiles_user_id ON therapist_profiles(user_id);
CREATE INDEX idx_therapist_profiles_workspace_id ON therapist_profiles(workspace_id);
CREATE INDEX idx_therapist_profiles_availability ON therapist_profiles(availability_status);
CREATE INDEX idx_therapist_profiles_specialties ON therapist_profiles USING GIN(specialties);

-- Availability slots
CREATE INDEX idx_availability_slots_therapist ON therapist_availability_slots(therapist_id);
CREATE INDEX idx_availability_slots_day ON therapist_availability_slots(day_of_week);

-- Consultations
CREATE INDEX idx_consultations_workspace ON consultations(workspace_id);
CREATE INDEX idx_consultations_therapist ON consultations(therapist_id);
CREATE INDEX idx_consultations_client ON consultations(client_user_id);
CREATE INDEX idx_consultations_scheduled ON consultations(scheduled_at);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_room ON consultations(room_name);

-- Bookings
CREATE INDEX idx_bookings_therapist ON consultation_bookings(therapist_id);
CREATE INDEX idx_bookings_client ON consultation_bookings(client_user_id);
CREATE INDEX idx_bookings_status ON consultation_bookings(status);

-- Recordings
CREATE INDEX idx_recordings_consultation ON session_recordings(consultation_id);
CREATE INDEX idx_recordings_status ON session_recordings(status);

-- Reports
CREATE INDEX idx_reports_consultation ON session_reports(consultation_id);
CREATE INDEX idx_reports_therapist ON session_reports(therapist_id);
CREATE INDEX idx_reports_status ON session_reports(status);

-- Progress
CREATE INDEX idx_progress_client ON client_progress(client_user_id);
CREATE INDEX idx_progress_therapist ON client_progress(therapist_id);
CREATE INDEX idx_progress_consultation ON client_progress(consultation_id);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_therapist_profiles_updated_at
  BEFORE UPDATE ON therapist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recordings_updated_at
  BEFORE UPDATE ON session_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON session_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION: Auto-update therapist stats
-- =============================================

CREATE OR REPLACE FUNCTION update_therapist_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE therapist_profiles SET
      total_sessions = total_sessions + 1,
      total_hours = total_hours + COALESCE(NEW.actual_duration_minutes, NEW.duration_minutes) / 60.0
    WHERE id = NEW.therapist_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultation_completed_update_stats
  AFTER UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_therapist_stats();

-- DOWN
DROP TRIGGER IF EXISTS consultation_completed_update_stats ON consultations;
DROP FUNCTION IF EXISTS update_therapist_stats();
DROP TRIGGER IF EXISTS update_reports_updated_at ON session_reports;
DROP TRIGGER IF EXISTS update_recordings_updated_at ON session_recordings;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON consultation_bookings;
DROP TRIGGER IF EXISTS update_consultations_updated_at ON consultations;
DROP TRIGGER IF EXISTS update_therapist_profiles_updated_at ON therapist_profiles;
DROP TABLE IF EXISTS client_progress;
DROP TABLE IF EXISTS session_reports;
DROP TABLE IF EXISTS session_recordings;
DROP TABLE IF EXISTS consultation_bookings;
DROP TABLE IF EXISTS consultations;
DROP TABLE IF EXISTS therapist_availability_slots;
DROP TABLE IF EXISTS therapist_profiles;
DROP TYPE IF EXISTS recording_status;
DROP TYPE IF EXISTS session_report_status;
DROP TYPE IF EXISTS booking_status;
DROP TYPE IF EXISTS therapist_availability_status;
DROP TYPE IF EXISTS consultation_status;
