-- =============================================
-- MIGRATION 020: MODULE MAIL
-- Tables pour l'envoi et gestion d'emails
-- =============================================

-- Table des emails envoyés
CREATE TABLE IF NOT EXISTS sent_mails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Destinataires
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[],
  bcc_addresses TEXT[],

  -- Contenu
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_html BOOLEAN DEFAULT true,

  -- Tracking
  resend_id TEXT, -- ID Resend pour tracking
  status TEXT NOT NULL DEFAULT 'sent', -- sent | failed | pending
  error_message TEXT,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,

  -- Metadata
  sent_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_sent_mails_user_id ON sent_mails(user_id);
CREATE INDEX idx_sent_mails_workspace_id ON sent_mails(workspace_id);
CREATE INDEX idx_sent_mails_sent_at ON sent_mails(sent_at DESC);
CREATE INDEX idx_sent_mails_resend_id ON sent_mails(resend_id);

-- Table des brouillons
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Destinataires (optionnels)
  to_addresses TEXT[],
  cc_addresses TEXT[],
  bcc_addresses TEXT[],

  -- Contenu (optionnel)
  subject TEXT,
  body TEXT,
  is_html BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_drafts_user_id ON drafts(user_id);
CREATE INDEX idx_drafts_workspace_id ON drafts(workspace_id);
CREATE INDEX idx_drafts_updated_at ON drafts(updated_at DESC);

-- Table des templates d'emails
CREATE TABLE IF NOT EXISTS mail_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Template info
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_html BOOLEAN DEFAULT true,
  category TEXT, -- ex: "Commercial", "Support", "Interne"

  -- Variables disponibles dans le template (ex: {{name}}, {{date}})
  variables TEXT[] DEFAULT '{}',

  -- Stats
  usage_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_mail_templates_user_id ON mail_templates(user_id);
CREATE INDEX idx_mail_templates_category ON mail_templates(category);
CREATE INDEX idx_mail_templates_usage_count ON mail_templates(usage_count DESC);

-- Commentaires pour documentation
COMMENT ON TABLE sent_mails IS 'Historique des emails envoyés via Resend';
COMMENT ON TABLE drafts IS 'Brouillons d''emails en cours de rédaction';
COMMENT ON TABLE mail_templates IS 'Templates d''emails réutilisables';

COMMENT ON COLUMN sent_mails.resend_id IS 'ID fourni par Resend pour tracking';
COMMENT ON COLUMN sent_mails.opened_at IS 'Date d''ouverture (via webhook Resend)';
COMMENT ON COLUMN sent_mails.clicked_at IS 'Date du premier clic (via webhook Resend)';
COMMENT ON COLUMN mail_templates.variables IS 'Liste des variables interpolables (ex: {{name}})';
