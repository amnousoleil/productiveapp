-- =============================================
-- MIGRATION 016: WORKSPACE CUSTOM DOMAINS
-- For premium email sending with custom domains
-- =============================================

-- Table des domaines personnalisés par workspace
CREATE TABLE IF NOT EXISTS workspace_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    resend_domain_id VARCHAR(255),
    from_email VARCHAR(255),
    from_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, verified, failed
    dns_records JSONB DEFAULT '[]',
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id),
    UNIQUE(domain)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_workspace_domains_workspace ON workspace_domains(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_domains_status ON workspace_domains(status);

-- Trigger pour updated_at
CREATE TRIGGER update_workspace_domains_updated_at
    BEFORE UPDATE ON workspace_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaire
COMMENT ON TABLE workspace_domains IS 'Domaines email personnalisés pour les campagnes (feature premium)';
