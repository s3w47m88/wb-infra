const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Read environment variables
  require('dotenv').config();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
  }

  // Read the SQL migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_pages_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Running ${statements.length} SQL statements...`);

  // Import Supabase client
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

    try {
      // Use raw SQL query through Supabase
      const { data, error } = await supabase.rpc('exec', { sql: statement });

      if (error) {
        console.error(`Error in statement ${i + 1}:`, error);
        // Try alternate approach - direct table creation
        if (statement.includes('CREATE TABLE')) {
          console.log('Trying direct table creation approach...');
          // Just log - we'll handle this manually
          console.log('Please run this SQL manually in Supabase SQL Editor:', statement);
        }
      } else {
        console.log(`✓ Statement ${i + 1} completed`);
      }
    } catch (err) {
      console.error(`Exception in statement ${i + 1}:`, err.message);
    }
  }

  console.log('\n=== MANUAL MIGRATION REQUIRED ===');
  console.log('Please go to Supabase Dashboard > SQL Editor and run:');
  console.log('\n' + sql);
  console.log('\n=================================');
}

runMigration().catch(console.error);
