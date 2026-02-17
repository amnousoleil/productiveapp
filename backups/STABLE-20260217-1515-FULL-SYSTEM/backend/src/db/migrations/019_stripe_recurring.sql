-- Migration: Stripe Payments + Recurring Invoices
-- Version: 019
-- Description: Tables pour paiements Stripe et factures recurrentes

-- ============================================
-- TABLE: payment_transactions
-- Historique de tous les paiements Stripe
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255),
    stripe_checkout_session_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
    payment_method VARCHAR(50),
    payment_method_details JSONB,
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    failure_reason TEXT,
    refunded_amount DECIMAL(12, 2) DEFAULT 0,
    receipt_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_tx_workspace ON payment_transactions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_invoice ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_stripe_pi ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_stripe_cs ON payment_transactions(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_tx_created ON payment_transactions(created_at DESC);

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: payment_links
-- Liens de paiement partageables
-- ============================================
CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    stripe_checkout_session_id VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_links_token ON payment_links(token);
CREATE INDEX IF NOT EXISTS idx_payment_links_invoice ON payment_links(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_workspace ON payment_links(workspace_id);

-- ============================================
-- TABLE: recurring_invoices
-- Configuration des factures recurrentes
-- ============================================
CREATE TABLE IF NOT EXISTS recurring_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES accounting_categories(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    member_id UUID,

    -- Template de facture
    type VARCHAR(20) NOT NULL DEFAULT 'income' CHECK (type IN ('expense', 'income')),
    fournisseur VARCHAR(500) NOT NULL,
    reference_prefix VARCHAR(50),
    notes TEXT,
    currency VARCHAR(3) DEFAULT 'EUR',
    tva_rate DECIMAL(5, 2) DEFAULT 20.00,
    line_items JSONB NOT NULL DEFAULT '[]',

    -- Configuration de recurrence
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 28),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    payment_terms_days INTEGER DEFAULT 30,
    auto_validate BOOLEAN DEFAULT FALSE,
    auto_send BOOLEAN DEFAULT FALSE,

    -- Suivi
    next_generation_date DATE NOT NULL,
    last_generated_at TIMESTAMP WITH TIME ZONE,
    generated_count INTEGER DEFAULT 0,
    max_occurrences INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,

    -- Statut
    is_active BOOLEAN DEFAULT TRUE,
    is_paused BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_workspace ON recurring_invoices(workspace_id);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_invoices(is_active, is_paused, next_generation_date);
CREATE INDEX IF NOT EXISTS idx_recurring_next ON recurring_invoices(next_generation_date) WHERE is_active = TRUE AND is_paused = FALSE;

CREATE TRIGGER update_recurring_invoices_updated_at
    BEFORE UPDATE ON recurring_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: recurring_invoice_history
-- Log des factures generees automatiquement
-- ============================================
CREATE TABLE IF NOT EXISTS recurring_invoice_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recurring_invoice_id UUID NOT NULL REFERENCES recurring_invoices(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    occurrence_number INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recurring_hist_recurring ON recurring_invoice_history(recurring_invoice_id);
CREATE INDEX IF NOT EXISTS idx_recurring_hist_invoice ON recurring_invoice_history(invoice_id);

-- ============================================
-- Ajouter stripe_payment_link_id a invoices
-- ============================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link_token VARCHAR(64);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurring_invoice_id UUID REFERENCES recurring_invoices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_recurring ON invoices(recurring_invoice_id);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE payment_transactions IS 'Historique des paiements Stripe (checkout sessions, payment intents)';
COMMENT ON TABLE payment_links IS 'Liens de paiement partageables pour factures';
COMMENT ON TABLE recurring_invoices IS 'Templates de factures recurrentes avec configuration de frequence';
COMMENT ON TABLE recurring_invoice_history IS 'Log des factures generees depuis les templates recurrents';
