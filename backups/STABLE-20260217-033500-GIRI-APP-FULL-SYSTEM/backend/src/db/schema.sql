-- ============================================
-- Productive App - Complete Database Schema
-- Generated from migrations 001-011
-- ============================================

-- Run this file to set up the complete database:
-- psql -U postgres -d productive_app -f schema.sql

-- Or run migrations individually in order:
-- 001_users_auth.sql
-- 002_workspaces.sql
-- 003_projects_notes.sql
-- 004_tasks.sql
-- 005_messaging.sql
-- 006_gamification.sql
-- 007_psycho_audit.sql
-- 008_canvases.sql
-- 009_files.sql
-- 010_analytics.sql
-- 011_notifications.sql

\echo 'Running migration 001_users_auth...'
\i migrations/001_users_auth.sql

\echo 'Running migration 002_workspaces...'
\i migrations/002_workspaces.sql

\echo 'Running migration 003_projects_notes...'
\i migrations/003_projects_notes.sql

\echo 'Running migration 004_tasks...'
\i migrations/004_tasks.sql

\echo 'Running migration 005_messaging...'
\i migrations/005_messaging.sql

\echo 'Running migration 006_gamification...'
\i migrations/006_gamification.sql

\echo 'Running migration 007_psycho_audit...'
\i migrations/007_psycho_audit.sql

\echo 'Running migration 008_canvases...'
\i migrations/008_canvases.sql

\echo 'Running migration 009_files...'
\i migrations/009_files.sql

\echo 'Running migration 010_analytics...'
\i migrations/010_analytics.sql

\echo 'Running migration 011_notifications...'
\i migrations/011_notifications.sql

\echo 'All migrations completed successfully!'
