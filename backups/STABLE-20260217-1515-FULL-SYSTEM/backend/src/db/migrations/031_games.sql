-- Migration 031: Giri Games Tables
-- Created: 2026-02-17

-- Game scores table (leaderboard + history)
CREATE TABLE IF NOT EXISTS game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    difficulty VARCHAR(20) DEFAULT 'normal',
    won BOOLEAN DEFAULT FALSE,
    duration_seconds INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON game_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);

-- Game saves table (save/load system)
CREATE TABLE IF NOT EXISTS game_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id VARCHAR(50) NOT NULL,
    save_name VARCHAR(100) DEFAULT 'Autosave',
    state JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_game_saves_user_game ON game_saves(user_id, game_id);

-- Global leaderboard view
CREATE OR REPLACE VIEW game_leaderboard_global AS
SELECT
    u.id AS user_id,
    COALESCE(u.name, u.email) AS display_name,
    SUM(gs.score) AS total_score,
    COUNT(gs.id) AS games_played,
    MAX(gs.created_at) AS last_played
FROM game_scores gs
JOIN users u ON u.id = gs.user_id
GROUP BY u.id, u.name, u.email
ORDER BY total_score DESC;
