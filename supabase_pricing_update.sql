-- Pricing & Stripe columns for tenants table
-- Adds Stripe connectivity fields and plan tier tracking.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free';

-- Index for Stripe webhook lookups
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id ON tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_subscription_id ON tenants(stripe_subscription_id);
