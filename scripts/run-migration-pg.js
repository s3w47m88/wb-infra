const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const projectId = process.env.SUPABASE_PROJECT_ID;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!projectId || !secretKey) {
  console.error('Missing SUPABASE_PROJECT_ID or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

// Extract the actual password from the secret key format
// Supabase secret keys are in format: sb_secret_XXXXX
const password = secretKey.replace('sb_secret_', '');

// Use the pooler connection for Session mode (Transaction mode doesn't support DDL)
const connectionString = `postgresql://postgres.${projectId}:${password}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_create_auth_and_orgs.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    await client.query(sql);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
