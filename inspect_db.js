
const { createClient } = require('@supabase/supabase-client');

// Extracting config from the codebase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
  const { data, error } = await supabase.from('order_items').select('*').limit(1);
  if (error) {
    console.error("Error fetching order_items:", error);
  } else if (data && data.length > 0) {
    console.log("Columns in order_items:", Object.keys(data[0]));
    console.log("Sample row:", data[0]);
  } else {
    console.log("No order_items found to inspect.");
  }
}

inspectTable();
