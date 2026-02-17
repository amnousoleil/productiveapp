-- Migration 021: App Configuration Table
-- Table singleton pour configuration globale de l'application
-- Accessible en lecture publique, modification super-admin uniquement

CREATE TABLE IF NOT EXISTS app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Branding
  logo_url VARCHAR(500),
  app_name VARCHAR(100) DEFAULT 'ProductiveApp',
  creator_signature VARCHAR(100) DEFAULT 'BY MAHA GIRI',
  brand_color VARCHAR(7) DEFAULT '#e07840',

  -- Textes
  welcome_text TEXT DEFAULT 'Bienvenue sur ProductiveApp',
  login_subtitle TEXT DEFAULT 'Gérez vos projets efficacement',

  -- Contact & Support
  support_email VARCHAR(100) DEFAULT 'contact@mahagiri.fr',
  custom_domain VARCHAR(200) DEFAULT 'giri-app.com',

  -- Plans tarifaires (JSON array)
  pricing_plans JSONB DEFAULT '[]'::JSONB,

  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insérer configuration par défaut (singleton)
INSERT INTO app_config (
  id,
  logo_url,
  app_name,
  creator_signature,
  brand_color,
  welcome_text,
  login_subtitle,
  support_email,
  custom_domain,
  pricing_plans
) VALUES (
  gen_random_uuid(),
  'assets/images/logos/logo.svg',
  'ProductiveApp',
  'BY MAHA GIRI',
  '#e07840',
  'Bienvenue sur ProductiveApp',
  'Gérez vos projets efficacement',
  'contact@mahagiri.fr',
  'giri-app.com',
  '[]'::JSONB
)
ON CONFLICT DO NOTHING;

-- Index pour performance (bien que table singleton)
CREATE INDEX IF NOT EXISTS idx_app_config_updated_at ON app_config(updated_at DESC);

-- Commentaires
COMMENT ON TABLE app_config IS 'Configuration globale de l''application (singleton)';
COMMENT ON COLUMN app_config.logo_url IS 'URL du logo principal (relatif ou absolu)';
COMMENT ON COLUMN app_config.brand_color IS 'Couleur primaire de la marque (format hex #RRGGBB)';
COMMENT ON COLUMN app_config.pricing_plans IS 'Plans tarifaires (JSON array de {name, price, features[], highlighted})';
