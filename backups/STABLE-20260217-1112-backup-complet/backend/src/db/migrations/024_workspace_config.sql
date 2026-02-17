-- Migration 024: Workspace Configuration
-- Ajouter colonnes de personnalisation à la table workspaces

-- Ajouter colonnes config à table workspaces
ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#d4af37',
ADD COLUMN IF NOT EXISTS default_theme TEXT DEFAULT 'executive',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Paris',
ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr';

-- Index pour perfs
CREATE INDEX IF NOT EXISTS idx_workspaces_logo ON workspaces(logo_url);

-- Commentaires
COMMENT ON COLUMN workspaces.logo_url IS 'URL du logo workspace (local /uploads/logos/ ou CloudFront)';
COMMENT ON COLUMN workspaces.primary_color IS 'Couleur primaire hex (ex: #d4af37)';
COMMENT ON COLUMN workspaces.default_theme IS 'Thème par défaut (executive, sakura, lavender, etc)';
COMMENT ON COLUMN workspaces.timezone IS 'Fuseau horaire (ex: Europe/Paris, America/New_York)';
COMMENT ON COLUMN workspaces.locale IS 'Langue interface (fr, en, es, de)';

-- Validation
DO $$
BEGIN
  -- Vérifier que les colonnes ont été ajoutées
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workspaces' AND column_name = 'logo_url'
  ) THEN
    RAISE EXCEPTION 'Migration 024 failed: logo_url column not added';
  END IF;

  RAISE NOTICE 'Migration 024 completed successfully';
END $$;
