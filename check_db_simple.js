const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ifpvzfuxqgfbgimfpcjl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcHZ6ZnV4cWdmYmdpbWZwY2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDg3NjUsImV4cCI6MjA5MzgyNDc2NX0.MTlTxy0FlGXnDYIcH9-sGkz3cahaG0_Cd_00NnjGG-U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'p.thayayuthan06@gmail.com',
    password: '12345678',
  });

  if (authError) {
    console.error('AUTH_ERROR:', authError.message);
    return;
  }

  console.log('USER_ID:', authData.user.id);

  const tables = ['customers', 'profiles', 'orders', 'store_settings'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.log(`TABLE_${table}_ERROR:`, error.message);
    } else {
      console.log(`TABLE_${table}_COUNT:`, data.length);
      data.forEach((row, i) => {
        if (i < 2) console.log(`  ROW_${i}:`, JSON.stringify(row));
      });
    }
  }
}

checkDatabase();
