require('dotenv').config();

async function createTable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  console.log('🔧 Creating pages table via Supabase REST API...\n');

  // Try to create a test record - this will auto-create the table if schema allows
  // But since we need specific schema, we'll use the Supabase client
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseSecretKey);

  // First, check if table exists by trying to query it
  console.log('Checking if pages table exists...');
  const { data: existingData, error: existingError } = await supabase
    .from('pages')
    .select('count')
    .limit(0);

  if (!existingError) {
    console.log('✅ Table "pages" already exists!');
    return;
  }

  console.log('Table does not exist. Error:', existingError.message);
  console.log('\n⚠️  Unable to create table programmatically.');
  console.log('Supabase requires manual table creation via SQL Editor.\n');
  console.log('📋 Please follow these steps:');
  console.log('1. Go to: https://supabase.com/dashboard/project/tgysqsudciexskzbvrsr/sql/new');
  console.log('2. Copy the contents of: supabase/migrations/001_create_pages_table.sql');
  console.log('3. Paste into SQL Editor and click "Run"\n');
}

createTable().catch(console.error);
