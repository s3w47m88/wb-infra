const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function createTables() {
  // Extract password from the secret key
  const password = process.env.SUPABASE_SECRET_KEY.replace('sb_secret_', '');

  // Connection string for Supabase (direct connection, not pooler)
  const connectionString = `postgresql://postgres:${password}@db.tgysqsudciexskzbvrsr.supabase.co:5432/postgres`;

  console.log('Connecting to Supabase database...');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_pages_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('\nExecuting migration...');
    await client.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('\nVerifying table...');

    const result = await client.query('SELECT COUNT(*) FROM pages');
    console.log(`✅ Table 'pages' exists with ${result.rows[0].count} rows`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

createTables();
