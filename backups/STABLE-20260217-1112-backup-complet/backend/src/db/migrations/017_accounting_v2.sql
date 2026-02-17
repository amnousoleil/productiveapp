-- Migration: Module Comptabilité v2.0 "FinScan"
-- Version: 017
-- Description: Extension majeure du module comptabilité

-- ============================================
-- EXTENSION TABLE INVOICES
-- ============================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS member_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_address TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_siret VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS document_type VARCHAR(20) DEFAULT 'invoice';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 6) DEFAULT 1.000000;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS department_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS converted_from_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurring_config JSONB;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);

-- Update status constraint to include new statuses
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
    CHECK (status IN ('draft', 'pending', 'validated', 'paid', 'overdue', 'cancelled', 'sent'));

-- Update source constraint
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_source_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_source_check
    CHECK (source IN ('manual', 'scan', 'photo', 'email', 'recurring', 'api'));

-- New indexes
CREATE INDEX IF NOT EXISTS idx_invoices_member ON invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_invoices_department ON invoices(department_id);
CREATE INDEX IF NOT EXISTS idx_invoices_document_type ON invoices(document_type);
CREATE INDEX IF NOT EXISTS idx_invoices_contact ON invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_invoices_overdue ON invoices(date_echeance) WHERE status NOT IN ('paid', 'cancelled');
CREATE INDEX IF NOT EXISTS idx_invoices_currency ON invoices(currency);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(workspace_id, invoice_number);

-- ============================================
-- TABLE: company_settings
-- ============================================
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL UNIQUE,
    company_name VARCHAR(255),
    siret VARCHAR(20),
    tva_number VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'France',
    phone VARCHAR(30),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    cgv TEXT,
    mentions_legales TEXT,
    default_payment_terms INTEGER DEFAULT 30,
    default_tva_rate DECIMAL(5, 2) DEFAULT 20.00,
    bank_name VARCHAR(100),
    bank_iban VARCHAR(50),
    bank_bic VARCHAR(15),
    invoice_prefix VARCHAR(10) DEFAULT 'FA',
    quote_prefix VARCHAR(10) DEFAULT 'DE',
    credit_note_prefix VARCHAR(10) DEFAULT 'AV',
    next_invoice_number INTEGER DEFAULT 1,
    next_quote_number INTEGER DEFAULT 1,
    next_credit_note_number INTEGER DEFAULT 1,
    fiscal_year_start INTEGER DEFAULT 1,
    default_currency VARCHAR(3) DEFAULT 'EUR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: contacts
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (type IN ('client', 'supplier', 'both')),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'France',
    siret VARCHAR(20),
    tva_number VARCHAR(30),
    default_payment_terms INTEGER DEFAULT 30,
    default_currency VARCHAR(3) DEFAULT 'EUR',
    notes TEXT,
    total_invoiced DECIMAL(14, 2) DEFAULT 0,
    total_paid DECIMAL(14, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contacts_workspace ON contacts(workspace_id);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_name ON contacts(workspace_id, name);

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: departments
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20),
    manager_name VARCHAR(255),
    budget_annual DECIMAL(14, 2) DEFAULT 0,
    budget_monthly DECIMAL(14, 2) DEFAULT 0,
    color VARCHAR(7) DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, code)
);

CREATE INDEX idx_departments_workspace ON departments(workspace_id);

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: budget_lines
-- ============================================
CREATE TABLE IF NOT EXISTS budget_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    category_id UUID REFERENCES accounting_categories(id) ON DELETE SET NULL,
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    month INTEGER CHECK (month >= 1 AND month <= 12),
    budget_amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
    actual_amount DECIMAL(14, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, department_id, category_id, year, month)
);

CREATE INDEX idx_budget_workspace ON budget_lines(workspace_id, year);
CREATE INDEX idx_budget_department ON budget_lines(department_id);

CREATE TRIGGER update_budget_lines_updated_at
    BEFORE UPDATE ON budget_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: expense_reports
-- ============================================
CREATE TABLE IF NOT EXISTS expense_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    member_id UUID NOT NULL,
    member_name VARCHAR(255),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'reimbursed')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    reimbursed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_expense_reports_workspace ON expense_reports(workspace_id);
CREATE INDEX idx_expense_reports_member ON expense_reports(member_id);
CREATE INDEX idx_expense_reports_status ON expense_reports(status);

CREATE TRIGGER update_expense_reports_updated_at
    BEFORE UPDATE ON expense_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: expense_items
-- ============================================
CREATE TABLE IF NOT EXISTS expense_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
    category_id UUID REFERENCES accounting_categories(id) ON DELETE SET NULL,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    tva_rate DECIMAL(5, 2) DEFAULT 20.00,
    tva_amount DECIMAL(12, 2) DEFAULT 0,
    date_expense DATE NOT NULL,
    receipt_url TEXT,
    ai_confidence DECIMAL(5, 2),
    merchant VARCHAR(255),
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_expense_items_report ON expense_items(expense_report_id);

-- ============================================
-- TABLE: bank_transactions
-- ============================================
CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    bank_account_name VARCHAR(255) DEFAULT 'Compte principal',
    transaction_date DATE NOT NULL,
    value_date DATE,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    reference VARCHAR(100),
    matched_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    match_confidence DECIMAL(5, 2),
    is_reconciled BOOLEAN DEFAULT FALSE,
    category_suggestion VARCHAR(100),
    raw_data JSONB,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bank_tx_workspace ON bank_transactions(workspace_id);
CREATE INDEX idx_bank_tx_date ON bank_transactions(transaction_date DESC);
CREATE INDEX idx_bank_tx_unreconciled ON bank_transactions(workspace_id) WHERE NOT is_reconciled;
CREATE INDEX idx_bank_tx_matched ON bank_transactions(matched_invoice_id);

-- ============================================
-- TABLE: accounting_alerts
-- ============================================
CREATE TABLE IF NOT EXISTS accounting_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'overdue_invoice', 'upcoming_deadline', 'budget_exceeded',
        'anomaly_detected', 'tva_deadline', 'cash_low', 'large_expense',
        'duplicate_invoice', 'missing_receipt', 'payment_received'
    )),
    severity VARCHAR(10) DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_id UUID,
    related_type VARCHAR(50),
    amount DECIMAL(14, 2),
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    auto_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_workspace ON accounting_alerts(workspace_id);
CREATE INDEX idx_alerts_unread ON accounting_alerts(workspace_id) WHERE NOT is_read AND NOT is_dismissed;
CREATE INDEX idx_alerts_type ON accounting_alerts(type);

-- ============================================
-- VIEW: v_balance_sheet
-- ============================================
CREATE OR REPLACE VIEW v_balance_sheet AS
SELECT
    workspace_id,
    EXTRACT(YEAR FROM date_facture)::int as year,
    EXTRACT(MONTH FROM date_facture)::int as month,
    SUM(CASE WHEN type = 'income' AND status IN ('validated', 'paid') THEN montant_ht ELSE 0 END) as produits,
    SUM(CASE WHEN type = 'expense' AND status IN ('validated', 'paid') THEN montant_ht ELSE 0 END) as charges,
    SUM(CASE WHEN type = 'income' AND status IN ('validated', 'paid') THEN montant_tva ELSE 0 END) as tva_collectee,
    SUM(CASE WHEN type = 'expense' AND status IN ('validated', 'paid') THEN montant_tva ELSE 0 END) as tva_deductible,
    SUM(CASE WHEN type = 'income' AND status IN ('validated', 'paid') THEN montant_ht ELSE 0 END) -
    SUM(CASE WHEN type = 'expense' AND status IN ('validated', 'paid') THEN montant_ht ELSE 0 END) as resultat
FROM invoices
WHERE document_type = 'invoice' OR document_type IS NULL
GROUP BY workspace_id, EXTRACT(YEAR FROM date_facture), EXTRACT(MONTH FROM date_facture);

-- ============================================
-- VIEW: v_overdue_invoices
-- ============================================
CREATE OR REPLACE VIEW v_overdue_invoices AS
SELECT i.*,
    c.name as category_name,
    CURRENT_DATE - i.date_echeance as days_overdue,
    CASE
        WHEN CURRENT_DATE - i.date_echeance > 90 THEN 'critical'
        WHEN CURRENT_DATE - i.date_echeance > 30 THEN 'warning'
        ELSE 'mild'
    END as overdue_severity
FROM invoices i
LEFT JOIN accounting_categories c ON i.category_id = c.id
WHERE i.status NOT IN ('paid', 'cancelled')
    AND i.date_echeance IS NOT NULL
    AND i.date_echeance < CURRENT_DATE;

-- ============================================
-- VIEW: v_budget_variance
-- ============================================
CREATE OR REPLACE VIEW v_budget_variance AS
SELECT
    bl.workspace_id,
    bl.department_id,
    d.name as department_name,
    d.color as department_color,
    bl.year,
    bl.month,
    bl.budget_amount,
    COALESCE(actual.total, 0) as actual_amount,
    bl.budget_amount - COALESCE(actual.total, 0) as variance,
    CASE WHEN bl.budget_amount > 0
        THEN ROUND((COALESCE(actual.total, 0) / bl.budget_amount * 100)::numeric, 1)
        ELSE 0
    END as utilization_pct
FROM budget_lines bl
LEFT JOIN departments d ON bl.department_id = d.id
LEFT JOIN LATERAL (
    SELECT SUM(i.montant_ht) as total
    FROM invoices i
    WHERE i.workspace_id = bl.workspace_id
      AND i.department_id = bl.department_id
      AND EXTRACT(YEAR FROM i.date_facture) = bl.year
      AND (bl.month IS NULL OR EXTRACT(MONTH FROM i.date_facture) = bl.month)
      AND i.type = 'expense'
      AND i.status IN ('validated', 'paid')
) actual ON true;

-- ============================================
-- Update exports type constraint for FEC
-- ============================================
ALTER TABLE accounting_exports DROP CONSTRAINT IF EXISTS accounting_exports_type_check;
ALTER TABLE accounting_exports ADD CONSTRAINT accounting_exports_type_check
    CHECK (type IN ('invoices', 'tva', 'analytics', 'fec', 'balance_sheet'));

ALTER TABLE accounting_exports DROP CONSTRAINT IF EXISTS accounting_exports_format_check;
ALTER TABLE accounting_exports ADD CONSTRAINT accounting_exports_format_check
    CHECK (format IN ('csv', 'pdf', 'excel', 'txt', 'json'));

-- ============================================
-- FK constraint for invoices.contact_id
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_contact_id_fkey') THEN
        ALTER TABLE invoices ADD CONSTRAINT invoices_contact_id_fkey
            FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_department_id_fkey') THEN
        ALTER TABLE invoices ADD CONSTRAINT invoices_department_id_fkey
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE company_settings IS 'Parametres entreprise pour facturation (SIRET, TVA, logo, CGV)';
COMMENT ON TABLE contacts IS 'Repertoire clients et fournisseurs';
COMMENT ON TABLE departments IS 'Departements avec budgets';
COMMENT ON TABLE budget_lines IS 'Lignes budgetaires par departement/categorie/mois';
COMMENT ON TABLE expense_reports IS 'Notes de frais avec workflow de validation';
COMMENT ON TABLE expense_items IS 'Lignes individuelles de notes de frais';
COMMENT ON TABLE bank_transactions IS 'Transactions bancaires pour rapprochement';
COMMENT ON TABLE accounting_alerts IS 'Alertes comptables (impayees, echeances, anomalies)';
