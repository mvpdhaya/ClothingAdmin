const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ifpvzfuxqgfbgimfpcjl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcHZ6ZnV4cWdmYmdpbWZwY2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDg3NjUsImV4cCI6MjA5MzgyNDc2NX0.MTlTxy0FlGXnDYIcH9-sGkz3cahaG0_Cd_00NnjGG-U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCustomers() {
  console.log('Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'p.thayayuthan06@gmail.com',
    password: '12345678',
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }

  console.log('Logged in successfully as:', authData.user.email);

  const { data, error } = await supabase
    .from('customers')
    .select('*');
  
  if (error) {
    console.error('Fetch Error:', error);
    return;
  }
  
  console.log('Customers count:', data.length);
  if (data.length > 0) {
    console.log('Customers data (first row):', JSON.stringify(data[0], null, 2));
  }
}

checkCustomers();
