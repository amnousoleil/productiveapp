-- =============================================
-- MIGRATION 015: EMAIL CAMPAIGNS SYSTEM
-- Tables: contacts, email_templates, campaigns, campaign_sends
-- =============================================

-- Table des contacts (carnet d'adresses)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, email)
);

-- Table des templates email
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des campagnes
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des envois (tracking par destinataire)
CREATE TABLE IF NOT EXISTS campaign_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    resend_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, contact_id)
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_contacts_workspace ON contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_email_templates_workspace ON email_templates(workspace_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_workspace ON campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);

CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_contact ON campaign_sends(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_status ON campaign_sends(status);

-- Triggers pour updated_at
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires
COMMENT ON TABLE contacts IS 'Carnet d''adresses pour les campagnes email';
COMMENT ON TABLE email_templates IS 'Templates d''email reutilisables';
COMMENT ON TABLE campaigns IS 'Campagnes d''email avec tracking';
COMMENT ON TABLE campaign_sends IS 'Suivi individuel des envois par destinataire';
