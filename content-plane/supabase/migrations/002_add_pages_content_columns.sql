-- Ensure pages table has content columns

ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS components JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS theme JSONB NOT NULL DEFAULT '{
    "colors": {
      "primary": "#DC2626",
      "secondary": "#1D4ED8",
      "background": "#ffffff",
      "text": "#1f2937",
      "accent": "#F59E0B"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "mode": "light"
  }'::jsonb;
