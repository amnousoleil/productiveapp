-- Migration 023: Système de Notifications
-- Description: Push notifications, email, SMS, rappels événements

-- Enum pour canaux de notifications (renommé pour éviter conflit avec enum existant)
DO $$ BEGIN
  CREATE TYPE notification_channel AS ENUM ('push', 'email', 'sms', 'in_app');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table préférences utilisateur
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  default_reminder_minutes INTEGER[] DEFAULT ARRAY[15, 60, 1440], -- 15min, 1h, 1 jour
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  sms_enabled BOOLEAN DEFAULT false,
  in_app_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  push_subscription JSONB, -- Web Push subscription object
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table file d'attente notifications
CREATE TABLE notifications_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
  notification_channel notification_channel NOT NULL DEFAULT 'push',
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status notification_status NOT NULL DEFAULT 'pending',
  title VARCHAR(200) NOT NULL,
  body TEXT,
  action_url VARCHAR(500),
  icon_url VARCHAR(500),
  badge_url VARCHAR(500),
  data JSONB, -- Metadata supplémentaire
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table historique notifications (archive)
CREATE TABLE notifications_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID,
  notification_channel notification_channel NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status notification_status NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ,
  -- Pas de FK car peut référencer données supprimées
  CONSTRAINT notifications_history_sent_at_check CHECK (sent_at IS NOT NULL)
);

-- Index pour performance
CREATE INDEX idx_notifications_queue_user ON notifications_queue(user_id);
CREATE INDEX idx_notifications_queue_event ON notifications_queue(event_id);
CREATE INDEX idx_notifications_queue_scheduled ON notifications_queue(scheduled_for, status) WHERE status = 'pending';
CREATE INDEX idx_notifications_queue_status ON notifications_queue(status);
CREATE INDEX idx_notifications_history_user ON notifications_history(user_id);
CREATE INDEX idx_notifications_history_sent_at ON notifications_history(sent_at DESC);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER trigger_notifications_queue_updated_at
  BEFORE UPDATE ON notifications_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_updated_at();

-- Fonction pour archiver notifications envoyées (appelée par cron)
CREATE OR REPLACE FUNCTION archive_sent_notifications()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Déplacer notifications envoyées il y a plus de 7 jours vers l'historique
  INSERT INTO notifications_history (id, user_id, event_id, notification_type, scheduled_for, sent_at, status, title, body, created_at)
  SELECT id, user_id, event_id, notification_type, scheduled_for, sent_at, status, title, body, created_at
  FROM notifications_queue
  WHERE sent_at IS NOT NULL
    AND sent_at < NOW() - INTERVAL '7 days'
    AND status IN ('sent', 'failed');

  GET DIAGNOSTICS archived_count = ROW_COUNT;

  -- Supprimer de la queue
  DELETE FROM notifications_queue
  WHERE sent_at IS NOT NULL
    AND sent_at < NOW() - INTERVAL '7 days'
    AND status IN ('sent', 'failed');

  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer préférences par défaut (appelée au register)
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_notification_preferences
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Commentaires
COMMENT ON TABLE notification_preferences IS 'Préférences de notifications utilisateur';
COMMENT ON TABLE notifications_queue IS 'File d''attente des notifications à envoyer';
COMMENT ON TABLE notifications_history IS 'Archive des notifications envoyées (>7 jours)';
COMMENT ON COLUMN notification_preferences.push_subscription IS 'Objet subscription Web Push API (endpoint, keys)';
COMMENT ON COLUMN notifications_queue.retry_count IS 'Nombre de tentatives d''envoi (max 3)';
COMMENT ON FUNCTION archive_sent_notifications() IS 'Archive notifications envoyées depuis >7 jours';
