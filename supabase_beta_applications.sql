-- Beta Applications table
-- Replaces the direct self-serve tenant creation with an application flow.
-- Applications are reviewed before provisioning a tenant account.

CREATE TABLE IF NOT EXISTS beta_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  event_type TEXT,
  expected_size TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  notes TEXT
);

-- Index for admin review queries
CREATE INDEX idx_beta_applications_status ON beta_applications(status);
CREATE INDEX idx_beta_applications_email ON beta_applications(email);

-- RLS
ALTER TABLE beta_applications ENABLE ROW LEVEL SECURITY;

-- No public read access — only service role can manage applications
-- Public can insert (via the /api/apply endpoint, but we handle that server-side)
