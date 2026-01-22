import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking if pages table exists...');

  const { data, error } = await supabase
    .from('pages')
    .select('id')
    .limit(1);

  if (error) {
    console.error('❌ Table does not exist or error:', error.message);
    console.log('\n📝 Please create the pages table manually in Supabase Dashboard:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Run the SQL from: supabase/migrations/001_create_pages_table.sql');
    return false;
  }

  console.log('✅ Pages table exists!');
  console.log('Found', data?.length || 0, 'pages');
  return true;
}

checkTable()
  .then((exists) => process.exit(exists ? 0 : 1))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
