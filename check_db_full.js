const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ifpvzfuxqgfbgimfpcjl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcHZ6ZnV4cWdmYmdpbWZwY2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDg3NjUsImV4cCI6MjA5MzgyNDc2NX0.MTlTxy0FlGXnDYIcH9-sGkz3cahaG0_Cd_00NnjGG-U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'p.thayayuthan06@gmail.com',
    password: '12345678',
  });

  if (authError) {
    console.error('Auth Error:', authError.message);
    return;
  }

  console.log('Logged in as:', authData.user.id, authData.user.email);

  const tables = ['customers', 'profiles', 'admin_users', 'users', 'store_settings'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.log(`Table ${table}: Error - ${error.message}`);
    } else {
      console.log(`Table ${table}: Success - found ${data.length} rows`);
      if (data.length > 0) {
        console.log(`  First row ID: ${data[0].id || 'no id'}`);
        // Check if any row matches the logged in user ID
        const match = data.find(r => r.id === authData.user.id || r.user_id === authData.user.id || r.email === authData.user.email);
        if (match) {
          console.log(`  MATCH FOUND for current user in ${table}`);
        }
      }
    }
  }
}

checkDatabase();
