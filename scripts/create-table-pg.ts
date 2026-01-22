import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const connectionString = `postgresql://postgres.tgysqsudciexskzbvrsr:${process.env.SUPABASE_SECRET_KEY?.replace('sb_secret_', '')}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function createTable() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase');

    const migrationPath = path.join(process.cwd(), 'supabase/migrations/001_create_pages_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migration...');
    await client.query(sql);
    console.log('✅ Migration complete!');

    // Verify table was created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'pages'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Pages table verified');
    } else {
      console.log('❌ Table not found after creation');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

createTable()
  .then(() => {
    console.log('\n✅ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
