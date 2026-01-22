import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function createTable() {
  console.log('Creating pages table...');

  const createTableSQL = `
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

    CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at DESC);

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
    CREATE TRIGGER update_pages_updated_at
      BEFORE UPDATE ON pages
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow all operations on pages" ON pages;
    CREATE POLICY "Allow all operations on pages"
      ON pages
      FOR ALL
      USING (true)
      WITH CHECK (true);
  `;

  try {
    // Use the SQL editor API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query: createTableSQL }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API Error:', error);
      throw new Error(`Failed to create table: ${response.statusText}`);
    }

    console.log('✅ Pages table created successfully!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

createTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
