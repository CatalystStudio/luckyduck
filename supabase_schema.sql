-- ============================================================
-- LuckyDuck — Multitenant Prize Drawing Schema
-- ============================================================

-- 1. Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Tier & limits
  tier TEXT NOT NULL DEFAULT 'beta',
  max_drawings INT NOT NULL DEFAULT 1,
  max_entrants_per_drawing INT NOT NULL DEFAULT 250,

  -- Beta signup contact info
  contact_name TEXT,
  contact_email TEXT,
  contact_company TEXT,
  contact_industry TEXT,
  contact_needs TEXT
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select tenants" ON tenants;
CREATE POLICY "Allow public select tenants" ON tenants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert tenants" ON tenants;
CREATE POLICY "Allow public insert tenants" ON tenants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update tenants" ON tenants;
CREATE POLICY "Allow public update tenants" ON tenants FOR UPDATE USING (true);

-- 2. Create drawings table
CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  heading TEXT NOT NULL DEFAULT 'Prize Drawing',
  subheading TEXT NOT NULL DEFAULT 'Enter your details for a chance to win!',
  form_fields JSONB NOT NULL DEFAULT '[
    {"name":"name","label":"Full Name","type":"text","placeholder":"John Doe","required":true},
    {"name":"email","label":"Email Address","type":"email","placeholder":"john@example.com","required":true},
    {"name":"phone","label":"Phone Number","type":"tel","placeholder":"(555) 000-0000","required":true},
    {"name":"company","label":"Company Name","type":"text","placeholder":"Your Company","required":true}
  ]'::jsonb,
  thank_you_heading TEXT NOT NULL DEFAULT 'You''re Entered!',
  thank_you_message TEXT NOT NULL DEFAULT 'Thank you for entering. We''ll contact you if you''re selected as a winner!',
  thank_you_subtext TEXT NOT NULL DEFAULT 'Good luck!',
  admin_pin TEXT NOT NULL DEFAULT '0000',
  view_count INT NOT NULL DEFAULT 0,
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_drawings_tenant_id ON drawings(tenant_id);

ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select drawings" ON drawings;
CREATE POLICY "Allow public select drawings" ON drawings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert drawings" ON drawings;
CREATE POLICY "Allow public insert drawings" ON drawings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update drawings" ON drawings;
CREATE POLICY "Allow public update drawings" ON drawings FOR UPDATE USING (true);

-- 3. Modify entrants table
-- Add drawing_id column (nullable first for migration)
ALTER TABLE entrants ADD COLUMN IF NOT EXISTS drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE;

-- Make previously NOT NULL columns nullable (tenants may not collect all fields)
ALTER TABLE entrants ALTER COLUMN name DROP NOT NULL;
ALTER TABLE entrants ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE entrants ALTER COLUMN company DROP NOT NULL;

-- Drop old global email unique constraint
ALTER TABLE entrants DROP CONSTRAINT IF EXISTS entrants_email_key;

-- Add per-drawing email unique constraint
ALTER TABLE entrants ADD CONSTRAINT entrants_email_drawing_unique UNIQUE (email, drawing_id);

CREATE INDEX IF NOT EXISTS idx_entrants_drawing_id ON entrants(drawing_id);

-- Keep existing RLS policies (already open for public access)

-- 4. View count increment function (atomic)
CREATE OR REPLACE FUNCTION increment_view_count(did UUID)
RETURNS void AS $$
BEGIN
  UPDATE drawings SET view_count = view_count + 1 WHERE id = did;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DATA MIGRATION (run after creating tables above)
-- Migrates existing single-tenant data to the new schema.
-- Only needed if you have existing TelcoMotion data.
-- ============================================================

-- Insert the original TelcoMotion tenant
INSERT INTO tenants (slug, name, logo_url, primary_color, secondary_color, tier, max_drawings, max_entrants_per_drawing)
VALUES ('telcomotion', 'TelcoMotion', '/logo.png', '#005596', '#E47225', 'paid', 100, 10000)
ON CONFLICT (slug) DO NOTHING;

-- Insert the original AHR 2026 drawing
INSERT INTO drawings (tenant_id, slug, name, heading, subheading, thank_you_heading, thank_you_message, thank_you_subtext, admin_pin)
SELECT
  t.id,
  'ahr2026',
  'AHR Tradeshow 2026',
  'Daily Prize Drawing',
  'Enter your details for a chance to win!',
  'You''re Entered!',
  'Thank you for visiting TelcoMotion at AHR 2026. We''ll contact you if you''re selected as a winner!',
  'Prize drawings happen daily. Good luck!',
  '6779'
FROM tenants t WHERE t.slug = 'telcomotion'
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Backfill existing entrants with the drawing_id
UPDATE entrants
SET drawing_id = (
  SELECT d.id FROM drawings d
  JOIN tenants t ON d.tenant_id = t.id
  WHERE t.slug = 'telcomotion' AND d.slug = 'ahr2026'
)
WHERE drawing_id IS NULL;

-- Now make drawing_id NOT NULL
ALTER TABLE entrants ALTER COLUMN drawing_id SET NOT NULL;
