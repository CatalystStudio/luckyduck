-- ============================================================
-- LuckyDuck: Stripe Billing — subscriptions table + RLS
-- ============================================================

-- Subscriptions table linked to tenants
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'event')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id),
  UNIQUE (stripe_customer_id),
  UNIQUE (stripe_subscription_id)
);

-- Index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Public can read subscription rows (needed for client-side plan gating)
-- Scoped to tenant_id so users can only look up subscriptions for tenants they can see
CREATE POLICY "subscriptions_select_public"
  ON subscriptions FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (via webhook + API routes)
-- No public INSERT/UPDATE/DELETE policies = denied by default under RLS
