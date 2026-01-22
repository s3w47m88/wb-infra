import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
const projectId = process.env.SUPABASE_PROJECT_ID!;

if (!supabaseUrl || !supabaseSecret || !projectId) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

async function runMigration() {
  // Connection string using pooler (works better from local environments)
  const connectionString = `postgresql://postgres.${projectId}:${supabaseSecret}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_fix_rls_recursion.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    console.log(sql);
    console.log('');

    await client.query(sql);

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

runMigration();
