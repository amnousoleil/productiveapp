-- Migration: 011_notifications
-- Description: Create notifications tables
-- Created: 2024-01-15

-- Create enum types for notifications
CREATE TYPE notification_type AS ENUM (
    'mention', 'assignment', 'achievement', 'message', 'system',
    'invitation', 'task_due', 'comment'
);
CREATE TYPE digest_frequency AS ENUM ('realtime', 'daily', 'weekly', 'none');

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    entity_type entity_type,
    entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification settings per user per workspace
CREATE TABLE notification_settings (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    mention_notifications BOOLEAN DEFAULT TRUE,
    assignment_notifications BOOLEAN DEFAULT TRUE,
    achievement_notifications BOOLEAN DEFAULT TRUE,
    digest_frequency digest_frequency DEFAULT 'realtime',
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    PRIMARY KEY (user_id, workspace_id)
);

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Email notification queue
CREATE TABLE email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    email_type VARCHAR(100) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type notification_type NOT NULL UNIQUE,
    title_template TEXT NOT NULL,
    content_template TEXT NOT NULL,
    email_subject_template TEXT,
    email_body_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);

CREATE INDEX idx_notification_settings_workspace_id ON notification_settings(workspace_id);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled_at ON email_queue(scheduled_at);
CREATE INDEX idx_email_queue_user_id ON email_queue(user_id);

-- Triggers
CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notif_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE id = notif_id AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(uid UUID)
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = uid AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to delete old notifications (cleanup job)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE created_at < NOW() - (days_old || ' days')::INTERVAL
      AND is_read = TRUE;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Seed notification templates
INSERT INTO notification_templates (type, title_template, content_template, email_subject_template, email_body_template)
VALUES
    ('mention', 'Vous avez été mentionné', '{{sender_name}} vous a mentionné dans {{entity_name}}', '[Productive] {{sender_name}} vous a mentionné', NULL),
    ('assignment', 'Nouvelle tâche assignée', '{{sender_name}} vous a assigné la tâche "{{task_title}}"', '[Productive] Nouvelle tâche assignée: {{task_title}}', NULL),
    ('achievement', 'Succès débloqué!', 'Vous avez débloqué le succès "{{achievement_name}}"', '[Productive] Félicitations! Nouveau succès débloqué', NULL),
    ('message', 'Nouveau message', '{{sender_name}}: {{message_preview}}', NULL, NULL),
    ('system', 'Information système', '{{content}}', '[Productive] {{title}}', NULL),
    ('invitation', 'Invitation à rejoindre', '{{sender_name}} vous invite à rejoindre {{workspace_name}}', '[Productive] Invitation à rejoindre {{workspace_name}}', NULL),
    ('task_due', 'Tâche bientôt due', 'La tâche "{{task_title}}" est due {{due_date}}', '[Productive] Rappel: Tâche due bientôt', NULL),
    ('comment', 'Nouveau commentaire', '{{sender_name}} a commenté sur "{{entity_name}}"', '[Productive] Nouveau commentaire sur {{entity_name}}', NULL);

-- Create default notification settings for new workspace members
CREATE OR REPLACE FUNCTION create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_settings (user_id, workspace_id)
    VALUES (NEW.user_id, NEW.workspace_id)
    ON CONFLICT (user_id, workspace_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspace_members_create_notification_settings
    AFTER INSERT ON workspace_members
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_settings();
