import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Try session-mode pooler connection
const client = new Client({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: `postgres.${process.env.SUPABASE_PROJECT_ID}`,
  password: process.env.SUPABASE_SECRET_KEY,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Connecting to Supabase via session-mode pooler...');
    await client.connect();
    console.log('Connected successfully');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_fix_rls_recursion.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    console.log(sql);

    await client.query(sql);

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
