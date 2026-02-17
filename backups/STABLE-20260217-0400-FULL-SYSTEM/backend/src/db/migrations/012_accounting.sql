-- Migration: Module Comptabilité
-- Version: 012
-- Description: Création des tables pour le module de comptabilité

-- Extension UUID si pas déjà présente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: accounting_categories
-- Catégories comptables (dépenses/revenus)
-- ============================================
CREATE TABLE IF NOT EXISTS accounting_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
    icon VARCHAR(50) DEFAULT 'folder',
    color VARCHAR(7) DEFAULT '#6B7280',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_accounting_categories_workspace ON accounting_categories(workspace_id);
CREATE INDEX idx_accounting_categories_type ON accounting_categories(type);

-- ============================================
-- Table: invoices
-- Factures (dépenses et revenus)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    category_id UUID REFERENCES accounting_categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'validated', 'paid')),
    fournisseur VARCHAR(255) NOT NULL,
    reference VARCHAR(100),
    montant_ht DECIMAL(12, 2) NOT NULL DEFAULT 0,
    montant_tva DECIMAL(12, 2) NOT NULL DEFAULT 0,
    montant_ttc DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tva_rate DECIMAL(5, 2) DEFAULT 20.00,
    date_facture DATE NOT NULL,
    date_echeance DATE,
    source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'scan', 'photo')),
    ai_confidence DECIMAL(5, 2),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_workspace ON invoices(workspace_id);
CREATE INDEX idx_invoices_category ON invoices(category_id);
CREATE INDEX idx_invoices_type ON invoices(type);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(date_facture);
CREATE INDEX idx_invoices_workspace_date ON invoices(workspace_id, date_facture DESC);

-- ============================================
-- Table: invoice_line_items
-- Lignes de facture détaillées
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    tva_rate DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);

-- ============================================
-- Table: accounting_periods
-- Périodes comptables mensuelles
-- ============================================
CREATE TABLE IF NOT EXISTS accounting_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    total_income DECIMAL(14, 2) DEFAULT 0,
    total_expense DECIMAL(14, 2) DEFAULT 0,
    balance DECIMAL(14, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(workspace_id, month, year)
);

CREATE INDEX idx_periods_workspace ON accounting_periods(workspace_id);
CREATE INDEX idx_periods_date ON accounting_periods(year, month);

-- ============================================
-- Table: tva_summary
-- Résumé TVA par période et taux
-- ============================================
CREATE TABLE IF NOT EXISTS tva_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_id UUID NOT NULL REFERENCES accounting_periods(id) ON DELETE CASCADE,
    taux DECIMAL(5, 2) NOT NULL,
    base_ht DECIMAL(14, 2) NOT NULL DEFAULT 0,
    montant_tva DECIMAL(14, 2) NOT NULL DEFAULT 0,
    type VARCHAR(20) NOT NULL CHECK (type IN ('collectee', 'deductible')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(period_id, taux, type)
);

CREATE INDEX idx_tva_summary_period ON tva_summary(period_id);

-- ============================================
-- Table: accounting_exports
-- Historique des exports générés
-- ============================================
CREATE TABLE IF NOT EXISTS accounting_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('invoices', 'tva', 'analytics')),
    format VARCHAR(10) NOT NULL CHECK (format IN ('csv', 'pdf', 'excel')),
    file_url TEXT,
    filters JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exports_workspace ON accounting_exports(workspace_id);
CREATE INDEX idx_exports_created ON accounting_exports(created_at DESC);

-- ============================================
-- Triggers pour updated_at automatique
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounting_categories_updated_at
    BEFORE UPDATE ON accounting_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounting_periods_updated_at
    BEFORE UPDATE ON accounting_periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger pour calculer montant TTC automatique
-- ============================================
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.montant_ht IS NOT NULL AND NEW.tva_rate IS NOT NULL THEN
        NEW.montant_tva = ROUND(NEW.montant_ht * NEW.tva_rate / 100, 2);
        NEW.montant_ttc = NEW.montant_ht + NEW.montant_tva;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_invoice_totals_trigger
    BEFORE INSERT OR UPDATE OF montant_ht, tva_rate ON invoices
    FOR EACH ROW
    WHEN (NEW.montant_tva IS NULL OR NEW.montant_ttc IS NULL)
    EXECUTE FUNCTION calculate_invoice_totals();

-- ============================================
-- Vue pour statistiques rapides
-- ============================================
CREATE OR REPLACE VIEW v_invoice_stats AS
SELECT
    workspace_id,
    type,
    status,
    COUNT(*) as count,
    SUM(montant_ht) as total_ht,
    SUM(montant_tva) as total_tva,
    SUM(montant_ttc) as total_ttc,
    DATE_TRUNC('month', date_facture) as month
FROM invoices
GROUP BY workspace_id, type, status, DATE_TRUNC('month', date_facture);

-- ============================================
-- Commentaires sur les tables
-- ============================================
COMMENT ON TABLE accounting_categories IS 'Catégories comptables pour classifier les factures';
COMMENT ON TABLE invoices IS 'Factures de dépenses et revenus';
COMMENT ON TABLE invoice_line_items IS 'Lignes détaillées des factures';
COMMENT ON TABLE accounting_periods IS 'Périodes comptables mensuelles avec totaux';
COMMENT ON TABLE tva_summary IS 'Résumé TVA par période et taux';
COMMENT ON TABLE accounting_exports IS 'Historique des exports générés';
