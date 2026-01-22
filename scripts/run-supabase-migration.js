const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
  }

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_pages_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('🚀 Running Supabase migration...\n');

  // Try using the Management API
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseSecretKey,
      'Authorization': `Bearer ${supabaseSecretKey}`,
    },
    body: JSON.stringify({ query: sql })
  });

  if (response.ok) {
    console.log('✅ Migration completed successfully!');

    // Verify the table exists
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/pages?limit=0`, {
      headers: {
        'apikey': supabaseSecretKey,
        'Authorization': `Bearer ${supabaseSecretKey}`,
      }
    });

    if (verifyResponse.ok) {
      console.log('✅ Table "pages" verified and accessible');
    } else {
      console.log('⚠️  Migration may have succeeded but table verification failed');
    }
  } else {
    const error = await response.text();
    console.error('❌ Migration failed:', error);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
    console.log('\n' + sql);
  }
}

runMigration().catch(console.error);
