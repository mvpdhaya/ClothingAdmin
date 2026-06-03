const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ifpvzfuxqgfbgimfpcjl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcHZ6ZnV4cWdmYmdpbWZwY2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDg3NjUsImV4cCI6MjA5MzgyNDc2NX0.MTlTxy0FlGXnDYIcH9-sGkz3cahaG0_Cd_00NnjGG-U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdminUsers() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'p.thayayuthan06@gmail.com',
    password: '12345678',
  });

  const { data, error } = await supabase
    .from('admin_users')
    .select('*');
  
  if (error) {
    console.error('Error fetching admin_users:', error.message);
  } else {
    console.log('Admin Users count:', data.length);
    console.log('Admin Users data:', JSON.stringify(data, null, 2));
  }
}

checkAdminUsers();
