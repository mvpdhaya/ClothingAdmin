
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ifpvzfuxqgfbgimfpcjl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcHZ6ZnV4cWdmYmdpbWZwY2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDg3NjUsImV4cCI6MjA5MzgyNDc2NX0.MTlTxy0FlGXnDYIcH9-sGkz3cahaG0_Cd_00NnjGG-U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProducts() {
  const { data, error } = await supabase.from('products').select('name, badges').limit(10);
  if (error) {
    console.error("Error fetching products:", error);
  } else if (data && data.length > 0) {
    console.log("Product Badges from Database:");
    data.forEach(p => {
        console.log(`Product: ${p.name}, Badges: ${JSON.stringify(p.badges)}`);
    });
  } else {
    console.log("No products found to inspect.");
  }
}

inspectProducts();
