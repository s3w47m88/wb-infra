const { Client } = require('pg');
require('dotenv').config();

// Note: This script requires the database password which is different from API keys
// The database password can be found in: Supabase Dashboard > Project Settings > Database > Connection String

const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const projectId = process.env.SUPABASE_PROJECT_ID;

if (!projectId) {
  console.error('Missing SUPABASE_PROJECT_ID in .env file');
  process.exit(1);
}

if (!SUPABASE_DB_PASSWORD) {
  console.error('❌ Missing SUPABASE_DB_PASSWORD in .env file');
  console.log('\n📝 To get your database password:');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + projectId + '/settings/database');
  console.log('2. Find the "Connection string" section');
  console.log('3. Click "Reset database password" if needed');
  console.log('4. Copy the password and add to .env as: SUPABASE_DB_PASSWORD=your_password');
  console.log('\nAlternatively, you can run this migration manually:');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + projectId + '/editor');
  console.log('2. Copy the contents of: supabase/migrations/002_create_auth_and_orgs.sql');
  console.log('3. Paste and run in the SQL Editor');
  process.exit(1);
}

// Connection using direct postgres connection (not pooler)
const connectionString = `postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${projectId}.supabase.co:5432/postgres`;

async function createTables() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase database...');
    await client.connect();
    console.log('✓ Connected successfully!\n');

    const fs = require('fs');
    const path = require('path');

    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_create_auth_and_orgs.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...\n');
    await client.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('\nCreated tables:');
    console.log('  - user_profiles');
    console.log('  - organizations');
    console.log('  - organization_members');
    console.log('  - organization_invitations');
    console.log('\nUpdated tables:');
    console.log('  - pages (added organization_id column)');
    console.log('\nCreated RLS policies for multi-tenant architecture');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Some tables may already exist. This is normal.');
      console.log('Please verify the schema in Supabase dashboard.');
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

createTables();
