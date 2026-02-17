-- Migration: 010_analytics
-- Description: Create analytics and activity logging tables
-- Created: 2024-01-15

-- Create enum type for activity actions
CREATE TYPE activity_action AS ENUM (
    'create', 'update', 'delete', 'view', 'login', 'logout',
    'invite', 'join', 'leave', 'archive', 'restore'
);

-- Activity logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    action activity_action NOT NULL,
    entity_type entity_type,
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily stats per user per workspace
CREATE TABLE daily_stats (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    notes_created INTEGER DEFAULT 0,
    notes_updated INTEGER DEFAULT 0,
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    most_active_hour INTEGER,
    PRIMARY KEY (user_id, workspace_id, date)
);

-- Workspace stats (aggregated)
CREATE TABLE workspace_stats (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    notes_count INTEGER DEFAULT 0,
    tasks_count INTEGER DEFAULT 0,
    messages_count INTEGER DEFAULT 0,
    PRIMARY KEY (workspace_id, date)
);

-- Session tracking for time spent calculation
CREATE TABLE user_sessions_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- Feature usage tracking
CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly/Monthly aggregated reports
CREATE TABLE aggregated_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metrics JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, user_id, period_type, period_start)
);

-- Indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_workspace_id ON activity_logs(workspace_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

CREATE INDEX idx_daily_stats_workspace_date ON daily_stats(workspace_id, date);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);

CREATE INDEX idx_workspace_stats_date ON workspace_stats(date);

CREATE INDEX idx_user_sessions_tracking_user_id ON user_sessions_tracking(user_id);
CREATE INDEX idx_user_sessions_tracking_workspace_id ON user_sessions_tracking(workspace_id);
CREATE INDEX idx_user_sessions_tracking_started_at ON user_sessions_tracking(started_at);
CREATE INDEX idx_user_sessions_tracking_is_active ON user_sessions_tracking(is_active);

CREATE INDEX idx_feature_usage_workspace_id ON feature_usage(workspace_id);
CREATE INDEX idx_feature_usage_feature_name ON feature_usage(feature_name);

CREATE INDEX idx_aggregated_reports_workspace ON aggregated_reports(workspace_id, period_type, period_start);

-- Partitioning for activity_logs (optional, for large scale)
-- Can be implemented later when needed

-- Function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a simplified version
    -- In production, consider using a background job for better performance
    INSERT INTO daily_stats (user_id, workspace_id, date)
    VALUES (NEW.user_id, NEW.workspace_id, CURRENT_DATE)
    ON CONFLICT (user_id, workspace_id, date)
    DO NOTHING;

    -- Update specific counters based on action and entity_type
    IF NEW.action = 'create' THEN
        IF NEW.entity_type = 'note' THEN
            UPDATE daily_stats
            SET notes_created = notes_created + 1
            WHERE user_id = NEW.user_id
              AND workspace_id = NEW.workspace_id
              AND date = CURRENT_DATE;
        ELSIF NEW.entity_type = 'task' THEN
            UPDATE daily_stats
            SET tasks_created = tasks_created + 1
            WHERE user_id = NEW.user_id
              AND workspace_id = NEW.workspace_id
              AND date = CURRENT_DATE;
        ELSIF NEW.entity_type = 'message' THEN
            UPDATE daily_stats
            SET messages_sent = messages_sent + 1
            WHERE user_id = NEW.user_id
              AND workspace_id = NEW.workspace_id
              AND date = CURRENT_DATE;
        END IF;
    ELSIF NEW.action = 'update' AND NEW.entity_type = 'note' THEN
        UPDATE daily_stats
        SET notes_updated = notes_updated + 1
        WHERE user_id = NEW.user_id
          AND workspace_id = NEW.workspace_id
          AND date = CURRENT_DATE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activity_logs_update_daily_stats
    AFTER INSERT ON activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_stats();

-- Function to calculate workspace stats (to be run daily)
CREATE OR REPLACE FUNCTION calculate_workspace_stats(ws_id UUID, stat_date DATE)
RETURNS void AS $$
BEGIN
    INSERT INTO workspace_stats (workspace_id, date, total_users, active_users, notes_count, tasks_count, messages_count)
    SELECT
        ws_id,
        stat_date,
        (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = ws_id),
        (SELECT COUNT(DISTINCT user_id) FROM activity_logs
         WHERE workspace_id = ws_id AND created_at::date = stat_date),
        (SELECT COUNT(*) FROM notes WHERE workspace_id = ws_id AND deleted_at IS NULL),
        (SELECT COUNT(*) FROM tasks WHERE workspace_id = ws_id),
        (SELECT COUNT(*) FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.workspace_id = ws_id AND m.created_at::date = stat_date)
    ON CONFLICT (workspace_id, date)
    DO UPDATE SET
        total_users = EXCLUDED.total_users,
        active_users = EXCLUDED.active_users,
        notes_count = EXCLUDED.notes_count,
        tasks_count = EXCLUDED.tasks_count,
        messages_count = EXCLUDED.messages_count;
END;
$$ LANGUAGE plpgsql;
