require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');

  // Create the pages table with a simple insert test first
  console.log('Step 1: Testing database connection...');

  // Try to create the table by attempting to insert (this will fail but give us info)
  const testInsert = await supabase.from('pages').insert({
    name: 'Test Site',
    components: [],
    theme: {
      colors: { primary: '#DC2626', secondary: '#1D4ED8', background: '#ffffff', text: '#1f2937', accent: '#F59E0B' },
      fonts: { heading: 'Inter', body: 'Inter' },
      mode: 'light'
    }
  });

  if (testInsert.error) {
    console.log('ℹ️  Table does not exist yet:', testInsert.error.message);
    console.log('\n📋 Please run this SQL in Supabase Dashboard SQL Editor:');
    console.log('https://supabase.com/dashboard/project/tgysqsudciexskzbvrsr/sql\n');
    console.log('---COPY BELOW---');
    console.log(require('fs').readFileSync('./supabase/migrations/001_create_pages_table.sql', 'utf-8'));
    console.log('---END COPY---\n');
    return false;
  }

  console.log('✅ Table exists! Cleaning up test data...');

  // Clean up test insert
  if (testInsert.data && testInsert.data[0]) {
    await supabase.from('pages').delete().eq('id', testInsert.data[0].id);
  }

  return true;
}

setupDatabase()
  .then((success) => {
    if (success) {
      console.log('✅ Database setup complete!');
      process.exit(0);
    } else {
      console.log('⚠️  Manual SQL execution required');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
