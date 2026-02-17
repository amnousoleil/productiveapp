-- Migration 026: Daily Task Journal System
-- Persistent daily task logs with AI-powered insights

-- Task activity log (all actions on tasks)
CREATE TABLE IF NOT EXISTS task_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'completed', 'deleted', 'reopened', 'assigned'
    previous_state JSONB, -- État avant l'action
    new_state JSONB, -- État après l'action
    changes JSONB, -- Détail des changements (quels champs modifiés)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for task_activity_log
CREATE INDEX IF NOT EXISTS idx_task_activity_workspace ON task_activity_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_task ON task_activity_log(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_user ON task_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_date ON task_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_task_activity_action ON task_activity_log(action_type);

-- Daily summary (automatically generated end of day)
CREATE TABLE IF NOT EXISTS daily_task_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = summary for entire workspace
    summary_date DATE NOT NULL,

    -- Statistiques
    tasks_created INT DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    tasks_updated INT DEFAULT 0,
    tasks_deleted INT DEFAULT 0,
    total_actions INT DEFAULT 0,

    -- Données brutes pour IA
    task_ids UUID[], -- IDs des tâches touchées ce jour
    activity_data JSONB, -- Données complètes pour analyse IA

    -- AI-generated insights
    ai_summary TEXT, -- Résumé IA du jour
    ai_achievements TEXT[], -- Accomplissements notables
    ai_patterns TEXT[], -- Patterns détectés (ex: "80% tâches complétées le matin")
    ai_recommendations TEXT[], -- Recommandations pour demain
    ai_productivity_score INT, -- Score 0-100 basé sur l'analyse
    ai_generated_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Contrainte d'unicité: 1 summary par user/workspace/date
    UNIQUE(workspace_id, user_id, summary_date)
);

-- Indexes for daily_task_summary
CREATE INDEX IF NOT EXISTS idx_daily_summary_workspace ON daily_task_summary(workspace_id);
CREATE INDEX IF NOT EXISTS idx_daily_summary_user ON daily_task_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_task_summary(summary_date);
CREATE INDEX IF NOT EXISTS idx_daily_summary_score ON daily_task_summary(ai_productivity_score);

-- Weekly/Monthly aggregates (for long-term insights)
CREATE TABLE IF NOT EXISTS task_period_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period_type VARCHAR(20) NOT NULL, -- 'week', 'month', 'quarter', 'year'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Statistiques agrégées
    total_tasks_created INT DEFAULT 0,
    total_tasks_completed INT DEFAULT 0,
    total_actions INT DEFAULT 0,
    avg_daily_productivity_score DECIMAL(5,2),

    -- AI analysis
    ai_summary TEXT,
    ai_trends TEXT[],
    ai_top_achievements TEXT[],
    ai_areas_improvement TEXT[],
    ai_generated_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(workspace_id, user_id, period_type, period_start)
);

-- Indexes for task_period_summary
CREATE INDEX IF NOT EXISTS idx_period_summary_workspace ON task_period_summary(workspace_id);
CREATE INDEX IF NOT EXISTS idx_period_summary_period ON task_period_summary(period_type, period_start);

-- Function to automatically create daily summary at end of day
CREATE OR REPLACE FUNCTION generate_daily_task_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be called by a cron job or scheduled task
    -- For now, just a placeholder
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON task_activity_log TO productive_user;
GRANT SELECT, INSERT, UPDATE ON daily_task_summary TO productive_user;
GRANT SELECT, INSERT, UPDATE ON task_period_summary TO productive_user;

-- Initial comments
COMMENT ON TABLE task_activity_log IS 'Logs every action performed on tasks for daily journaling and AI analysis';
COMMENT ON TABLE daily_task_summary IS 'Auto-generated daily summaries with AI-powered insights and recommendations';
COMMENT ON TABLE task_period_summary IS 'Weekly/monthly aggregates for long-term trend analysis';
