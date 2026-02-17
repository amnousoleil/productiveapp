-- ============================================
-- Migration 020: Freelancer Power Pack
-- Time Tracking, CRM Pipeline, Calendar, Contracts,
-- Financial Goals, Auto-relances, Client Portal, URSSAF
-- ============================================

-- ============================================
-- 1. TIME TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER, -- calculated or manual
  is_billable BOOLEAN DEFAULT true,
  is_running BOOLEAN DEFAULT false,
  hourly_rate NUMERIC(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_time_entries_workspace ON time_entries(workspace_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_time_entries_member ON time_entries(member_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_time_entries_task ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_time_entries_running ON time_entries(workspace_id, is_running) WHERE is_running = true;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_time_entries_dates ON time_entries(workspace_id, start_time);

-- Default hourly rates per member
CREATE TABLE IF NOT EXISTS member_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id),
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  effective_from DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_member_rates_unique ON member_rates(workspace_id, member_id, effective_from);

-- ============================================
-- 2. CRM PIPELINE
-- ============================================

CREATE TYPE deal_stage AS ENUM ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost');

CREATE TABLE IF NOT EXISTS crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL DEFAULT 'Pipeline principal',
  stages JSONB NOT NULL DEFAULT '[
    {"key":"lead","label":"Lead","color":"#6366f1","order":0},
    {"key":"qualified","label":"Qualifié","color":"#3b82f6","order":1},
    {"key":"proposal","label":"Proposition","color":"#f59e0b","order":2},
    {"key":"negotiation","label":"Négociation","color":"#f97316","order":3},
    {"key":"won","label":"Gagné","color":"#22c55e","order":4},
    {"key":"lost","label":"Perdu","color":"#ef4444","order":5}
  ]',
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  member_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  amount NUMERIC(12,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  stage VARCHAR(50) NOT NULL DEFAULT 'lead',
  probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  source VARCHAR(50), -- website, referral, linkedin, cold_call, event, other
  tags TEXT[],
  notes TEXT,
  lost_reason TEXT,
  won_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_deals_workspace ON crm_deals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(workspace_id, stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_contact ON crm_deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_pipeline ON crm_deals(pipeline_id);

CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
  member_id UUID REFERENCES users(id),
  type VARCHAR(30) NOT NULL, -- call, email, meeting, note, task, stage_change
  title VARCHAR(200),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_deal ON crm_activities(deal_id);

-- ============================================
-- 3. CALENDAR / EVENTS
-- ============================================

CREATE TYPE event_type AS ENUM ('meeting', 'deadline', 'reminder', 'availability', 'blocked', 'task_due', 'invoice_due');

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'meeting',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  location VARCHAR(500),
  video_url VARCHAR(500),
  color VARCHAR(7),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule VARCHAR(200), -- RRULE format
  recurrence_end DATE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  reminder_minutes INTEGER[], -- e.g. [15, 60, 1440]
  attendees JSONB DEFAULT '[]', -- [{email, name, status}]
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_workspace ON calendar_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calendar_member ON calendar_events(member_id);
CREATE INDEX IF NOT EXISTS idx_calendar_dates ON calendar_events(workspace_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_calendar_type ON calendar_events(workspace_id, event_type);

-- ============================================
-- 4. CONTRACTS & TEMPLATES
-- ============================================

CREATE TYPE contract_status AS ENUM ('draft', 'sent', 'viewed', 'signed', 'expired', 'cancelled');

CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- HTML/Markdown template with {{variables}}
  variables JSONB DEFAULT '[]', -- [{key, label, type, default}]
  category VARCHAR(50), -- freelance, nda, service, consulting
  is_default BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL, -- rendered HTML
  variables_data JSONB DEFAULT '{}', -- filled variable values
  status contract_status NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  signer_name VARCHAR(200),
  signer_email VARCHAR(200),
  signer_ip VARCHAR(45),
  signature_data TEXT, -- base64 signature image
  public_token VARCHAR(64) UNIQUE,
  expires_at TIMESTAMPTZ,
  amount NUMERIC(12,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  pdf_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_workspace ON contracts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contact ON contracts(contact_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_contracts_token ON contracts(public_token);

-- ============================================
-- 5. FINANCIAL GOALS
-- ============================================

CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  type VARCHAR(30) NOT NULL, -- revenue, profit, invoiced, collected, hours_billed, clients_won
  target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  period VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly, custom
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_workspace ON financial_goals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_goals_active ON financial_goals(workspace_id, is_active) WHERE is_active = true;

-- ============================================
-- 6. AUTO-RELANCES (Invoice Reminders)
-- ============================================

CREATE TYPE reminder_status AS ENUM ('pending', 'sent', 'failed', 'cancelled');

CREATE TABLE IF NOT EXISTS invoice_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  reminder_level INTEGER NOT NULL DEFAULT 1, -- 1=gentle, 2=firm, 3=final
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status reminder_status NOT NULL DEFAULT 'pending',
  email_to VARCHAR(200),
  email_subject VARCHAR(500),
  email_body TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_pending ON invoice_reminders(workspace_id, status, scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminders_invoice ON invoice_reminders(invoice_id);

CREATE TABLE IF NOT EXISTS reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  reminder_1_days INTEGER DEFAULT 7, -- days after due date
  reminder_2_days INTEGER DEFAULT 15,
  reminder_3_days INTEGER DEFAULT 30,
  reminder_1_subject VARCHAR(500) DEFAULT 'Rappel : Facture {{reference}} en attente de paiement',
  reminder_1_body TEXT DEFAULT 'Bonjour {{client_name}},\n\nNous vous rappelons que la facture {{reference}} d''un montant de {{amount}} est arrivée à échéance le {{due_date}}.\n\nMerci de procéder au règlement dans les meilleurs délais.\n\nCordialement,\n{{company_name}}',
  reminder_2_subject VARCHAR(500) DEFAULT 'Second rappel : Facture {{reference}} impayée',
  reminder_2_body TEXT DEFAULT 'Bonjour {{client_name}},\n\nMalgré notre précédent rappel, la facture {{reference}} d''un montant de {{amount}} reste impayée.\n\nNous vous remercions de bien vouloir régulariser cette situation.\n\nCordialement,\n{{company_name}}',
  reminder_3_subject VARCHAR(500) DEFAULT 'Dernier rappel avant mise en demeure : Facture {{reference}}',
  reminder_3_body TEXT DEFAULT 'Bonjour {{client_name}},\n\nLa facture {{reference}} d''un montant de {{amount}} est impayée depuis {{days_overdue}} jours.\n\nSans règlement sous 8 jours, nous serons contraints d''engager une procédure de recouvrement.\n\nCordialement,\n{{company_name}}',
  send_before_due BOOLEAN DEFAULT false,
  before_due_days INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reminder_settings_ws ON reminder_settings(workspace_id);

-- ============================================
-- 7. CLIENT PORTAL (public access tokens)
-- ============================================

CREATE TABLE IF NOT EXISTS client_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  pin_hash VARCHAR(200), -- optional PIN for extra security
  is_active BOOLEAN DEFAULT true,
  last_accessed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  permissions JSONB DEFAULT '{"view_invoices":true,"pay_invoices":true,"view_quotes":true,"sign_contracts":true,"view_projects":false}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_token ON client_portal_tokens(token) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_portal_contact ON client_portal_tokens(contact_id);

-- ============================================
-- 8. URSSAF / FISCAL REPORTING
-- ============================================

CREATE TABLE IF NOT EXISTS fiscal_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL, -- urssaf_monthly, urssaf_quarterly, tva_monthly, tva_quarterly, ir_annual
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue_total NUMERIC(12,2) DEFAULT 0,
  revenue_services NUMERIC(12,2) DEFAULT 0,
  revenue_sales NUMERIC(12,2) DEFAULT 0,
  charges_total NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,2),
  status VARCHAR(20) DEFAULT 'draft', -- draft, calculated, declared, paid
  declared_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  reference VARCHAR(100),
  notes TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fiscal_workspace ON fiscal_declarations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_period ON fiscal_declarations(workspace_id, type, period_start);

-- ============================================
-- 9. TASK DEPENDENCIES & RECURRENCE
-- ============================================

CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, finish_to_finish
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_task_deps_unique ON task_dependencies(task_id, depends_on_task_id);

-- Add recurrence columns to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_rule VARCHAR(200);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_end DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_recurring_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

-- ============================================
-- 10. DOCUMENT SIGNATURES
-- ============================================

CREATE TABLE IF NOT EXISTS signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  document_type VARCHAR(20) NOT NULL, -- invoice, quote, contract
  document_id UUID NOT NULL,
  signer_name VARCHAR(200) NOT NULL,
  signer_email VARCHAR(200) NOT NULL,
  public_token VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, viewed, signed, expired, cancelled
  signature_data TEXT, -- base64 SVG/PNG
  signed_at TIMESTAMPTZ,
  signed_ip VARCHAR(45),
  viewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signatures_token ON signature_requests(public_token);
CREATE INDEX IF NOT EXISTS idx_signatures_pending ON signature_requests(workspace_id, status) WHERE status = 'pending';

-- ============================================
-- DONE
-- ============================================
