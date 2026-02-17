-- Migration: 013_gamification_v2
-- Description: Add V2 gamification features (streak protection, daily activity, prestige history)
-- Created: 2024-02-03

-- ============================================================================
-- ALTER STREAKS TABLE - Add protection fields
-- ============================================================================

-- Add jokers and freezes tracking
ALTER TABLE streaks
ADD COLUMN IF NOT EXISTS jokers_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS freezes_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS freeze_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_joker_reset_month VARCHAR(7); -- YYYY-MM format

-- ============================================================================
-- DAILY ACTIVITY TABLE - For habit analysis and heatmaps
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,

    -- Métriques du jour
    action_count INTEGER NOT NULL DEFAULT 0,
    xp_gained INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    notes_created INTEGER NOT NULL DEFAULT 0,
    active_minutes INTEGER NOT NULL DEFAULT 0,
    peak_hour INTEGER, -- 0-23
    productivity_score INTEGER NOT NULL DEFAULT 0, -- 0-100

    -- Détail par type d'action
    action_breakdown JSONB NOT NULL DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, workspace_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_activity_user_workspace_date
ON daily_activity(user_id, workspace_id, activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_activity_date
ON daily_activity(activity_date DESC);

-- ============================================================================
-- PRESTIGE HISTORY TABLE - Track prestige resets
-- ============================================================================

CREATE TABLE IF NOT EXISTS prestige_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    prestige_level INTEGER NOT NULL, -- Niveau atteint après ce prestige
    level_at_prestige INTEGER NOT NULL, -- Niveau avant reset
    xp_at_prestige BIGINT NOT NULL, -- XP avant reset
    tokens_gained INTEGER NOT NULL DEFAULT 0,

    -- Bonus choisi (si applicable)
    bonus_chosen VARCHAR(100),
    bonus_value NUMERIC(5,2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prestige_history_user
ON prestige_history(user_id, workspace_id);

-- ============================================================================
-- BONUS EVENTS TABLE - For special multiplier events
-- ============================================================================

CREATE TABLE IF NOT EXISTS bonus_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE, -- NULL = global

    name VARCHAR(255) NOT NULL,
    description TEXT,
    multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.5,

    -- Timing
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Scope
    affected_actions TEXT[] DEFAULT '{}', -- Empty = all actions

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bonus_events_active
ON bonus_events(is_active, start_time, end_time);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update daily_activity updated_at
DROP TRIGGER IF EXISTS update_daily_activity_updated_at ON daily_activity;
CREATE TRIGGER update_daily_activity_updated_at
    BEFORE UPDATE ON daily_activity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Aggregate daily activity from xp_events
-- ============================================================================

CREATE OR REPLACE FUNCTION aggregate_daily_activity(
    p_user_id UUID,
    p_workspace_id UUID,
    p_date DATE
) RETURNS void AS $$
DECLARE
    v_action_count INTEGER;
    v_xp_gained INTEGER;
    v_tasks_completed INTEGER;
    v_notes_created INTEGER;
    v_peak_hour INTEGER;
    v_action_breakdown JSONB;
BEGIN
    -- Count actions and XP
    SELECT
        COUNT(*),
        COALESCE(SUM(amount), 0),
        COUNT(*) FILTER (WHERE reason IN ('task_completed')),
        COUNT(*) FILTER (WHERE reason IN ('note_created')),
        MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM created_at))
    INTO v_action_count, v_xp_gained, v_tasks_completed, v_notes_created, v_peak_hour
    FROM xp_events
    WHERE user_id = p_user_id
      AND workspace_id = p_workspace_id
      AND DATE(created_at) = p_date;

    -- Action breakdown
    SELECT jsonb_object_agg(reason, cnt)
    INTO v_action_breakdown
    FROM (
        SELECT reason, COUNT(*) as cnt
        FROM xp_events
        WHERE user_id = p_user_id
          AND workspace_id = p_workspace_id
          AND DATE(created_at) = p_date
        GROUP BY reason
    ) sub;

    -- Upsert daily_activity
    INSERT INTO daily_activity (
        user_id, workspace_id, activity_date,
        action_count, xp_gained, tasks_completed, notes_created,
        peak_hour, action_breakdown, productivity_score
    ) VALUES (
        p_user_id, p_workspace_id, p_date,
        v_action_count, v_xp_gained, v_tasks_completed, v_notes_created,
        v_peak_hour, COALESCE(v_action_breakdown, '{}'),
        LEAST(100, v_xp_gained / 5) -- Simple score: 500 XP = 100 points
    )
    ON CONFLICT (user_id, workspace_id, activity_date)
    DO UPDATE SET
        action_count = EXCLUDED.action_count,
        xp_gained = EXCLUDED.xp_gained,
        tasks_completed = EXCLUDED.tasks_completed,
        notes_created = EXCLUDED.notes_created,
        peak_hour = EXCLUDED.peak_hour,
        action_breakdown = EXCLUDED.action_breakdown,
        productivity_score = EXCLUDED.productivity_score,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Auto-aggregate on xp_event insert
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_aggregate_daily_activity()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM aggregate_daily_activity(NEW.user_id, NEW.workspace_id, DATE(NEW.created_at));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS xp_events_aggregate_daily ON xp_events;
CREATE TRIGGER xp_events_aggregate_daily
    AFTER INSERT ON xp_events
    FOR EACH ROW
    EXECUTE FUNCTION trigger_aggregate_daily_activity();

-- ============================================================================
-- ADD PRESTIGE TOKENS to user_gamification
-- ============================================================================

ALTER TABLE user_gamification
ADD COLUMN IF NOT EXISTS prestige_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS prestige_multiplier NUMERIC(3,2) DEFAULT 1.0;
