-- =============================================
-- MAIL PRO V2 - Migration complète
-- Schéma unifié pour emails entrants + sortants
-- Date: 2026-02-17
-- =============================================

-- =============================================
-- ÉTAPE 1 : Créer la nouvelle table emails
-- =============================================

CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,

  -- ID Resend pour traçabilité
  resend_email_id VARCHAR(255),

  -- Direction: inbound (reçu) ou outbound (envoyé)
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),

  -- Adresses email
  from_address VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  to_addresses JSONB NOT NULL DEFAULT '[]',
  cc_addresses JSONB DEFAULT '[]',
  bcc_addresses JSONB DEFAULT '[]',
  reply_to VARCHAR(255),

  -- Contenu
  subject VARCHAR(1000),
  body_text TEXT,
  body_html TEXT,
  is_html BOOLEAN DEFAULT FALSE,

  -- Threading pour conversations
  thread_id VARCHAR(255),
  in_reply_to VARCHAR(255), -- Message-ID du mail parent
  message_id VARCHAR(255) UNIQUE, -- Message-ID de cet email
  email_references TEXT, -- Chaîne des Message-IDs pour threading

  -- Statut
  status VARCHAR(50) NOT NULL DEFAULT 'received',
  -- Valeurs possibles: received, sent, draft, bounced, failed, pending

  -- États utilisateur
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete (corbeille)

  -- Organisation
  folder VARCHAR(100) DEFAULT 'inbox',
  -- Valeurs système: inbox, sent, drafts, trash
  -- Valeurs custom: définies par l'utilisateur

  labels JSONB DEFAULT '[]', -- Array de labels: ["urgent", "projet-alpha"]

  -- Pièces jointes
  has_attachments BOOLEAN DEFAULT FALSE,
  attachments_meta JSONB DEFAULT '[]',
  -- Format: [{id, filename, content_type, size, url}]

  -- Métadonnées tracking (pour emails envoyés)
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Timestamps
  received_at TIMESTAMPTZ, -- Pour inbound
  sent_at TIMESTAMPTZ,     -- Pour outbound
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ÉTAPE 2 : Index pour performance
-- =============================================

-- Index principal pour queries fréquentes
CREATE INDEX idx_emails_user_folder
  ON emails(user_id, folder, is_deleted, created_at DESC);

-- Index pour direction (inbox vs sent)
CREATE INDEX idx_emails_user_direction
  ON emails(user_id, direction, created_at DESC);

-- Index pour emails non lus
CREATE INDEX idx_emails_user_unread
  ON emails(user_id, is_read, folder)
  WHERE is_deleted = FALSE;

-- Index pour threading
CREATE INDEX idx_emails_thread
  ON emails(thread_id, created_at)
  WHERE thread_id IS NOT NULL;

-- Index pour recherche full-text (PostgreSQL)
CREATE INDEX idx_emails_search
  ON emails
  USING GIN(to_tsvector('french',
    coalesce(subject,'') || ' ' ||
    coalesce(body_text,'') || ' ' ||
    coalesce(from_name,'')
  ));

-- Index pour lookup par resend_id
CREATE INDEX idx_emails_resend_id
  ON emails(resend_email_id)
  WHERE resend_email_id IS NOT NULL;

-- Index pour lookup par message_id
CREATE INDEX idx_emails_message_id
  ON emails(message_id)
  WHERE message_id IS NOT NULL;

-- Index pour favoris
CREATE INDEX idx_emails_starred
  ON emails(user_id, is_starred)
  WHERE is_starred = TRUE AND is_deleted = FALSE;

-- =============================================
-- ÉTAPE 3 : Tables auxiliaires
-- =============================================

-- Table des dossiers personnalisés
CREATE TABLE IF NOT EXISTS mail_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7), -- Code hex comme #FF5733
  icon VARCHAR(50), -- Nom de l'icône
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, name) -- Un utilisateur ne peut pas avoir 2 dossiers du même nom
);

CREATE INDEX idx_mail_folders_user
  ON mail_folders(user_id, sort_order);

-- Table des labels
CREATE TABLE IF NOT EXISTS mail_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL, -- Code hex obligatoire pour affichage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, name)
);

CREATE INDEX idx_mail_labels_user
  ON mail_labels(user_id);

-- Table des signatures email
CREATE TABLE IF NOT EXISTS mail_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  content_html TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mail_signatures_user
  ON mail_signatures(user_id);

-- =============================================
-- ÉTAPE 4 : Ajouter email_address aux users
-- =============================================

-- Ajouter la colonne email_address si elle n'existe pas
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_address VARCHAR(255);

-- Index pour lookup rapide par email_address
CREATE INDEX IF NOT EXISTS idx_users_email_address
  ON users(email_address)
  WHERE email_address IS NOT NULL;

-- =============================================
-- ÉTAPE 5 : Migrer les données existantes
-- =============================================

-- Migrer tous les emails de sent_mails vers emails
INSERT INTO emails (
  user_id,
  resend_email_id,
  direction,
  from_address,
  to_addresses,
  cc_addresses,
  bcc_addresses,
  subject,
  body_text,
  body_html,
  is_html,
  status,
  folder,
  has_attachments,
  opened_at,
  sent_at,
  created_at
)
SELECT
  user_id::VARCHAR(255),
  resend_id as resend_email_id,
  'outbound' as direction, -- Tous les sent_mails sont des emails envoyés
  'noreply@giri-app.com' as from_address, -- Adresse par défaut
  ARRAY_TO_JSON(to_addresses)::JSONB,
  COALESCE(ARRAY_TO_JSON(cc_addresses), '[]')::JSONB,
  COALESCE(ARRAY_TO_JSON(bcc_addresses), '[]')::JSONB,
  subject,
  body as body_text,
  body as body_html,
  is_html,
  status,
  'sent' as folder, -- Les emails envoyés vont dans le dossier "sent"
  false as has_attachments,
  opened_at,
  sent_at,
  created_at
FROM sent_mails
WHERE NOT EXISTS (
  SELECT 1 FROM emails
  WHERE emails.resend_email_id = sent_mails.resend_id
);

-- =============================================
-- ÉTAPE 6 : Attribuer adresses email aux users
-- =============================================

-- Générer les adresses email automatiquement
-- Format: prenom@giri-app.com
UPDATE users
SET email_address = LOWER(
  REGEXP_REPLACE(
    SPLIT_PART(name, ' ', 1), -- Prendre le prénom
    '[^a-zA-Z0-9]', -- Remplacer tous les caractères non alphanumériques
    '',
    'g'
  )
) || '@giri-app.com'
WHERE email_address IS NULL AND name IS NOT NULL;

-- En cas de conflit (2 personnes avec le même prénom), on les marquera manuellement après
-- (ROW_NUMBER dans UPDATE n'est pas supporté directement)

-- =============================================
-- ÉTAPE 7 : Trigger pour updated_at
-- =============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur emails
DROP TRIGGER IF EXISTS update_emails_updated_at ON emails;
CREATE TRIGGER update_emails_updated_at
  BEFORE UPDATE ON emails
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger sur signatures
DROP TRIGGER IF EXISTS update_mail_signatures_updated_at ON mail_signatures;
CREATE TRIGGER update_mail_signatures_updated_at
  BEFORE UPDATE ON mail_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ÉTAPE 8 : Vues utiles
-- =============================================

-- Vue pour compter les non-lus par utilisateur
CREATE OR REPLACE VIEW mail_unread_counts AS
SELECT
  user_id,
  COUNT(*) as unread_count
FROM emails
WHERE is_read = FALSE
  AND is_deleted = FALSE
  AND folder = 'inbox'
GROUP BY user_id;

-- Vue pour stats par utilisateur
CREATE OR REPLACE VIEW mail_user_stats AS
SELECT
  user_id,
  COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as sent_count,
  COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as received_count,
  COUNT(CASE WHEN is_read = FALSE AND direction = 'inbound' THEN 1 END) as unread_count,
  COUNT(CASE WHEN is_starred = TRUE THEN 1 END) as starred_count,
  MAX(created_at) as last_email_at
FROM emails
WHERE is_deleted = FALSE
GROUP BY user_id;

-- =============================================
-- FIN DE LA MIGRATION
-- =============================================

-- Résumé de la migration
DO $$
DECLARE
  total_emails INTEGER;
  total_users INTEGER;
  users_with_email INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_emails FROM emails;
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO users_with_email FROM users WHERE email_address IS NOT NULL;

  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'MAIL PRO V2 - Migration terminée avec succès !';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Emails migrés: %', total_emails;
  RAISE NOTICE 'Utilisateurs total: %', total_users;
  RAISE NOTICE 'Utilisateurs avec adresse email: %', users_with_email;
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
