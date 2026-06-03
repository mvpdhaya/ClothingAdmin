const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ifpvzfuxqgfbgimfpcjl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcHZ6ZnV4cWdmYmdpbWZwY2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDg3NjUsImV4cCI6MjA5MzgyNDc2NX0.MTlTxy0FlGXnDYIcH9-sGkz3cahaG0_Cd_00NnjGG-U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPublic() {
  const { data, error } = await supabase
    .from('customers')
    .select('*');
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Public customers count:', data.length);
  }
}

checkPublic();
