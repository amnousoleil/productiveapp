-- Migration 030: Vision Meetings (Giri Vision rebuilt from scratch)
-- Simple meetings table for Jitsi-based video conferencing

CREATE TABLE IF NOT EXISTS vision_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) DEFAULT 'Réunion sans titre',
  created_by VARCHAR(255) NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  participants JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vision_meetings_user ON vision_meetings(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vision_meetings_room ON vision_meetings(room_id);
CREATE INDEX IF NOT EXISTS idx_vision_meetings_workspace ON vision_meetings(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vision_meetings_status ON vision_meetings(status, scheduled_at);
