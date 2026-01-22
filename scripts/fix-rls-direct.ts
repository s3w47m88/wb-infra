import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLS() {
  try {
    console.log('Attempting to fix RLS policies...\n');

    // Step 1: Drop the problematic policy
    console.log('Step 1: Dropping old policy...');
    const dropSql = `DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members`;

    // We can't execute DDL via the REST API, so we'll try through rpc if available
    // Otherwise we need to use psql or the SQL editor

    console.log('SQL to execute:');
    console.log('----------------');
    console.log(dropSql);
    console.log('');

    // Step 2: Create new policy
    const createSql = `CREATE POLICY "Users can view members of their organizations"
  ON organization_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_members.organization_id
      AND organizations.created_by = auth.uid()
    )
  )`;

    console.log(createSql);
    console.log('----------------\n');

    console.log('❌ Cannot execute DDL via Supabase REST API');
    console.log('\nThe migration requires direct database access. Database connection details needed:');
    console.log('- Database password (may be different from API secret key)');
    console.log('- Or access to Supabase SQL Editor');

  } catch (err) {
    console.error('Error:', err);
  }
}

fixRLS();
