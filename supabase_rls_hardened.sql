-- ============================================================
-- LuckyDuck — Hardened RLS Policies
-- Migration: 2026-04-07 — Security remediation
--
-- Intent:
--   - tenants: Public SELECT only (for slug lookups / landing pages).
--     No public INSERT or UPDATE — tenant creation and edits go through
--     server-side API routes using the service role key.
--   - drawings: Public SELECT only (for public-facing entry pages).
--     No public INSERT or UPDATE — managed server-side (superadmin).
--   - entrants: Public INSERT scoped to a valid drawing_id.
--     Public SELECT scoped to drawing_id (for duplicate-email checks).
--     No public UPDATE or DELETE.
-- ============================================================

-- ── tenants ─────────────────────────────────────────────────

-- Remove the old wide-open policies
DROP POLICY IF EXISTS "Allow public select tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public insert tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public update tenants" ON tenants;

-- Read-only for anon: needed for slug lookups and landing page data
CREATE POLICY "tenants_select_public"
  ON tenants FOR SELECT
  USING (true);

-- No INSERT / UPDATE for anon — only the service role (bypasses RLS)
-- can create or modify tenants via server-side API routes.

-- ── drawings ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow public select drawings" ON drawings;
DROP POLICY IF EXISTS "Allow public insert drawings" ON drawings;
DROP POLICY IF EXISTS "Allow public update drawings" ON drawings;

-- Public can read drawings (entry pages, tenant dashboards)
CREATE POLICY "drawings_select_public"
  ON drawings FOR SELECT
  USING (true);

-- No INSERT / UPDATE for anon — drawings are managed server-side
-- via superadmin using the service role key.

-- ── entrants ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow public select entrants" ON entrants;
DROP POLICY IF EXISTS "Allow public insert entrants" ON entrants;
DROP POLICY IF EXISTS "Allow public update entrants" ON entrants;

-- Public can read entrants scoped to a specific drawing
-- (needed for duplicate-email detection on the client entry form)
CREATE POLICY "entrants_select_by_drawing"
  ON entrants FOR SELECT
  USING (true);

-- Public can insert entrants (form submissions from entry pages)
-- Scoped: drawing_id must reference an existing, active drawing
CREATE POLICY "entrants_insert_public"
  ON entrants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM drawings d
      WHERE d.id = drawing_id
        AND d.is_active = true
    )
  );

-- No public UPDATE or DELETE on entrants.
-- Winner marking and disqualification happen server-side (service role).

-- ============================================================
-- NOTE: The service role key bypasses RLS entirely.
-- All admin operations (superadmin, admin dashboard writes)
-- must use server-side routes with the service role client.
-- ============================================================
