-- Migration: 014_notes_member_id
-- Add member_id column for team member note isolation
-- member_id stores the frontend team member UUID (from config.js USERS array)
-- Not a FK to users table because team members share one backend account

ALTER TABLE notes ADD COLUMN IF NOT EXISTS member_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_notes_member_id ON notes(member_id);
