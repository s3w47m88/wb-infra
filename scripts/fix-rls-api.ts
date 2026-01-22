import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secretKey = process.env.SUPABASE_SECRET_KEY!;

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_fix_rls_recursion.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Executing SQL via Supabase REST API...');
  console.log(sql);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': secretKey,
        'Authorization': `Bearer ${secretKey}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to execute SQL:', error);

      // Try alternative: direct query execution
      console.log('\nTrying alternative approach...');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const statement of statements) {
        console.log(`\nExecuting: ${statement.substring(0, 100)}...`);

        // Drop policy
        if (statement.includes('DROP POLICY')) {
          const policyName = statement.match(/DROP POLICY IF EXISTS "([^"]+)"/)?.[1];
          console.log(`Dropping policy: ${policyName}`);
          // Policies must be dropped via SQL - we'll need to use a different method
        }

        // Create policy
        if (statement.includes('CREATE POLICY')) {
          console.log('Creating new policy...');
          // Policies must be created via SQL - we'll need to use a different method
        }
      }

      console.error('\n❌ Direct API approach not available. Trying psql with correct connection string...');
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Migration completed successfully!');
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

runMigration();
