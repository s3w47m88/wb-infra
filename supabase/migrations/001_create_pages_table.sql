-- Create pages table for storing website pages
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme JSONB NOT NULL DEFAULT '{
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
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (adjust based on your auth requirements)
DROP POLICY IF EXISTS "Allow all operations on pages" ON pages;
CREATE POLICY "Allow all operations on pages"
  ON pages
  FOR ALL
  USING (true)
  WITH CHECK (true);
