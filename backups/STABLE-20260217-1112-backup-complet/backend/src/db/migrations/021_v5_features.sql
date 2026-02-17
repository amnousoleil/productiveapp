-- ============================================
-- Migration 021: ProductiveApp v5.0 Features
-- 2FA, API Keys, Webhooks, Automations,
-- Dashboard Layouts, Favorites, Subtasks
-- ============================================

-- ============================================
-- 1. TWO-FACTOR AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret VARCHAR(64) NOT NULL,
  backup_codes TEXT[] DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT false,
  enabled_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_2fa_user ON user_2fa(user_id);

-- ============================================
-- 2. API KEYS (external integrations)
-- ============================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  key_prefix VARCHAR(8) NOT NULL,
  key_hash VARCHAR(128) NOT NULL,
  permissions JSONB DEFAULT '["read"]',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_workspace ON api_keys(workspace_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- ============================================
-- 3. WEBHOOKS
-- ============================================

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret VARCHAR(128),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_workspace ON webhooks(workspace_id);

-- Webhook delivery logs
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);

-- ============================================
-- 4. AUTOMATION RULES
-- ============================================

CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  trigger_event VARCHAR(50) NOT NULL,
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_workspace ON automation_rules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_event) WHERE is_active = true;

-- Automation execution logs
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  trigger_event VARCHAR(50) NOT NULL,
  trigger_data JSONB,
  actions_executed JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_rule ON automation_logs(rule_id);

-- ============================================
-- 5. DASHBOARD LAYOUTS
-- ============================================

CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) DEFAULT 'Mon tableau de bord',
  widgets JSONB NOT NULL DEFAULT '[]',
  grid_config JSONB DEFAULT '{"columns": 3, "row_height": 200}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_layouts_member ON dashboard_layouts(workspace_id, member_id, name);

-- ============================================
-- 6. FAVORITES
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(30) NOT NULL,
  entity_id UUID NOT NULL,
  display_name VARCHAR(200),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique ON favorites(workspace_id, member_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_favorites_member ON favorites(workspace_id, member_id);

-- ============================================
-- 7. SUBTASKS (parent_task_id on tasks)
-- ============================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;

-- ============================================
-- 8. SMART TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS smart_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smart_templates_workspace ON smart_templates(workspace_id, category);

-- ============================================
-- 9. ONBOARDING PROGRESS
-- ============================================

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steps_completed JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_member ON onboarding_progress(workspace_id, member_id);

-- ============================================
-- 10. BACKUP HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'manual',
  file_path TEXT,
  file_size_bytes BIGINT,
  tables_included TEXT[],
  rows_count INTEGER,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backup_history_workspace ON backup_history(workspace_id);

-- ============================================
-- DONE
-- ============================================
