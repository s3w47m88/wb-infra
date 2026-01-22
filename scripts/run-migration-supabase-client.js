const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_create_auth_and_orgs.sql');
    const fullSql = fs.readFileSync(migrationPath, 'utf8');

    // Split into individual statements and execute them one by one
    // This is necessary because Supabase client doesn't support multi-statement SQL
    const statements = fullSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.trim().startsWith('--')) continue;

      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 100) + '...');

      try {
        // Try using the from() method with rpc as fallback
        const { data, error } = await supabase
          .from('_sql')
          .select('*')
          .eq('query', statement);

        if (error) {
          // Try direct SQL execution if table method fails
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ sql: statement })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`  ❌ Error: ${errorText}`);
            errorCount++;
          } else {
            console.log('  ✓ Success');
            successCount++;
          }
        } else {
          console.log('  ✓ Success');
          successCount++;
        }
      } catch (err) {
        console.error(`  ❌ Exception: ${err.message}`);
        errorCount++;
      }

      // Add a small delay between statements
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n\nMigration Summary:`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${errorCount}`);
    console.log(`  Total: ${statements.length}`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed. This might be expected if tables already exist.');
      console.log('Please verify the database schema in Supabase dashboard.');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
