-- Migration 029 : Système de billing Stripe pour abonnements
-- Ajoute les colonnes Stripe à la table users + table subscriptions

-- 1. Colonnes Stripe sur la table users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none'
    CHECK (subscription_status IN ('none', 'active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free'
    CHECK (subscription_plan IN ('free', 'pro', 'business', 'enterprise')),
  ADD COLUMN IF NOT EXISTS subscription_interval TEXT DEFAULT NULL
    CHECK (subscription_interval IN ('month', 'year', NULL)),
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- 2. Index pour performance lookups Stripe
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- 3. Table d'historique des abonnements (audit trail)
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,      -- checkout.completed, subscription.created, etc.
  stripe_event_id TEXT UNIQUE,   -- ID Stripe du webhook (deduplification)
  old_plan TEXT,
  new_plan TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'eur',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event_id ON billing_events(stripe_event_id);

-- 4. Vue récapitulative billing par user
CREATE OR REPLACE VIEW user_billing_summary AS
SELECT
  u.id,
  u.email,
  u.name,
  COALESCE(u.subscription_plan, 'free') AS plan,
  COALESCE(u.subscription_status, 'none') AS status,
  u.stripe_customer_id,
  u.stripe_subscription_id,
  u.current_period_end,
  u.cancel_at_period_end,
  COUNT(be.id) AS total_events
FROM users u
LEFT JOIN billing_events be ON u.id = be.user_id
GROUP BY u.id, u.email, u.name, u.subscription_plan, u.subscription_status,
         u.stripe_customer_id, u.stripe_subscription_id,
         u.current_period_end, u.cancel_at_period_end;
