-- Ensure pages table has site_id

ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS site_id UUID NOT NULL DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_pages_site_id ON pages(site_id);
