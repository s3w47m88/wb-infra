const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_create_auth_and_orgs.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration via SQL Editor API...');

    // Use the Supabase SQL Editor endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Migration failed:', data);

      // Try alternative approach - execute through pg connection
      console.log('\nTrying alternative approach using fetch to query endpoint...');

      const altResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ sql })
      });

      const altData = await altResponse.json();
      console.log('Alternative response:', altData);

      process.exit(1);
    }

    console.log('Migration completed successfully!');
    console.log('Response:', data);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
