import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/001_create_pages_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Running migration...');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    console.log('Executing:', statement.substring(0, 50) + '...');
    const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

    if (error) {
      console.error('Error executing statement:', error);
      console.error('Statement:', statement);
    } else {
      console.log('✅ Success');
    }
  }

  console.log('Migration complete!');
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
