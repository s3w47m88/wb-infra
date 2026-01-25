-- Ensure pages table has name column

ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Untitled';
