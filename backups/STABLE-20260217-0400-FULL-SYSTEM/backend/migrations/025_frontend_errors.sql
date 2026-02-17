-- Migration 025: Frontend Errors Logging Table
-- Description: Table pour stocker les erreurs JavaScript frontend

CREATE TABLE IF NOT EXISTS frontend_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  stack TEXT,
  url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_frontend_errors_created_at ON frontend_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_frontend_errors_severity ON frontend_errors(severity);
CREATE INDEX IF NOT EXISTS idx_frontend_errors_user_id ON frontend_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_frontend_errors_workspace_id ON frontend_errors(workspace_id);

COMMENT ON TABLE frontend_errors IS 'Erreurs JavaScript du frontend pour monitoring';
COMMENT ON COLUMN frontend_errors.message IS 'Message d''erreur';
COMMENT ON COLUMN frontend_errors.stack IS 'Stack trace complète';
COMMENT ON COLUMN frontend_errors.url IS 'URL de la page où l''erreur s''est produite';
COMMENT ON COLUMN frontend_errors.severity IS 'Niveau de sévérité (error, warning, info)';
COMMENT ON COLUMN frontend_errors.metadata IS 'Données supplémentaires (JSON)';
