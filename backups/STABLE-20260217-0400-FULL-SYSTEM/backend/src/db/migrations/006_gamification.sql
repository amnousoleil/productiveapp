-- Migration: 006_gamification
-- Description: Create gamification tables (XP, achievements, streaks, leaderboards)
-- Created: 2024-01-15

-- Create enum types for gamification
CREATE TYPE achievement_category AS ENUM ('productivity', 'social', 'streak', 'special');
CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE xp_reason AS ENUM (
    'note_created', 'note_updated', 'task_created', 'task_completed',
    'streak_bonus', 'achievement', 'message_sent', 'login_bonus',
    'daily_goal', 'weekly_goal'
);
CREATE TYPE streak_type AS ENUM ('daily_login', 'daily_note', 'daily_task', 'weekly_goal');
CREATE TYPE leaderboard_period AS ENUM ('daily', 'weekly', 'monthly', 'alltime');

-- User gamification profile table
CREATE TABLE user_gamification (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    prestige INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, workspace_id)
);

-- Achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL,
    category achievement_category NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    condition JSONB NOT NULL,
    is_secret BOOLEAN DEFAULT FALSE,
    rarity achievement_rarity DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements unlocked by users
CREATE TABLE achievements_unlocked (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notified_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, achievement_id)
);

-- XP events log table
CREATE TABLE xp_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason xp_reason NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Streaks table
CREATE TABLE streaks (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    streak_type streak_type NOT NULL,
    current_count INTEGER DEFAULT 0,
    best_count INTEGER DEFAULT 0,
    last_activity_date DATE NOT NULL,
    freeze_available BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, workspace_id, streak_type)
);

-- Leaderboards table
CREATE TABLE leaderboards (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period leaderboard_period NOT NULL,
    period_start DATE NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    rank INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id, period, period_start)
);

-- Daily challenges table
CREATE TABLE daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    challenge_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, date, challenge_type)
);

-- User daily challenge progress
CREATE TABLE user_challenge_progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
    current_value INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, challenge_id)
);

-- Indexes
CREATE INDEX idx_user_gamification_workspace_id ON user_gamification(workspace_id);
CREATE INDEX idx_user_gamification_level ON user_gamification(level);
CREATE INDEX idx_user_gamification_total_xp ON user_gamification(total_xp DESC);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

CREATE INDEX idx_achievements_unlocked_user_id ON achievements_unlocked(user_id);
CREATE INDEX idx_achievements_unlocked_achievement_id ON achievements_unlocked(achievement_id);

CREATE INDEX idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX idx_xp_events_workspace_id ON xp_events(workspace_id);
CREATE INDEX idx_xp_events_created_at ON xp_events(created_at DESC);
CREATE INDEX idx_xp_events_reason ON xp_events(reason);

CREATE INDEX idx_streaks_user_workspace ON streaks(user_id, workspace_id);
CREATE INDEX idx_streaks_current_count ON streaks(current_count DESC);

CREATE INDEX idx_leaderboards_workspace_period ON leaderboards(workspace_id, period, period_start);
CREATE INDEX idx_leaderboards_rank ON leaderboards(rank);

CREATE INDEX idx_daily_challenges_workspace_date ON daily_challenges(workspace_id, date);

-- Triggers
CREATE TRIGGER update_user_gamification_updated_at
    BEFORE UPDATE ON user_gamification
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
    BEFORE UPDATE ON streaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at
    BEFORE UPDATE ON leaderboards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
    base_xp INTEGER := 100;
    multiplier NUMERIC := 1.2;
    level INTEGER := 1;
    required_xp INTEGER := base_xp;
BEGIN
    WHILE xp >= required_xp LOOP
        level := level + 1;
        required_xp := FLOOR(base_xp * POWER(multiplier, level - 1));
    END LOOP;
    RETURN level;
END;
$$ LANGUAGE plpgsql;

-- Function to update user gamification on XP event
CREATE OR REPLACE FUNCTION update_gamification_on_xp()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_gamification (user_id, workspace_id, total_xp, level, last_activity_at)
    VALUES (NEW.user_id, NEW.workspace_id, NEW.amount, calculate_level(NEW.amount), NOW())
    ON CONFLICT (user_id, workspace_id)
    DO UPDATE SET
        total_xp = user_gamification.total_xp + NEW.amount,
        level = calculate_level(user_gamification.total_xp + NEW.amount),
        last_activity_at = NOW(),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER xp_events_update_gamification
    AFTER INSERT ON xp_events
    FOR EACH ROW
    EXECUTE FUNCTION update_gamification_on_xp();
