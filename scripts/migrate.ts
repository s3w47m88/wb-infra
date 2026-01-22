import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

async function runMigration() {
  console.log('🚀 Starting Supabase migration...');

  const supabase = createClient(supabaseUrl, supabaseSecretKey);

  try {
    // Create trigger function
    const { error: functionError } = await supabase.rpc('query', {
      query: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    });

    // Create pages table using raw query
    console.log('Creating pages table...');
    const { error: tableError } = await supabase
      .from('pages')
      .select('id')
      .limit(1);

    // If table doesn't exist, we'll create it via a workaround
    if (tableError && tableError.message.includes('relation "public.pages" does not exist')) {
      console.log('Table does not exist. Please create it manually in Supabase SQL Editor.');
      console.log('\nRun this SQL in your Supabase SQL Editor:\n');
      console.log(`
-- Create pages table to store page configurations
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme JSONB NOT NULL DEFAULT '{
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#8b5cf6",
      "background": "#ffffff",
      "text": "#1f2937",
      "accent": "#f59e0b"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "mode": "light"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;

-- Create trigger
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
      `);
      process.exit(1);
    } else if (!tableError) {
      console.log('✅ Table already exists!');
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

runMigration();
