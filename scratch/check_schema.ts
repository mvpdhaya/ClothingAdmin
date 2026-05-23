
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  const { data: tables, error } = await supabase.rpc('get_tables'); // This might not work if RPC not defined
  if (error) {
    console.log("RPC get_tables failed, trying direct select");
    const testTables = ['orders', 'products', 'customers', 'order_items', 'categories', 'subcategories'];
    for (const table of testTables) {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (!error) {
        console.log(`Table '${table}' exists. Count: ${count}`);
        // Get one row to see columns
        const { data: row } = await supabase.from(table).select('*').limit(1);
        if (row && row.length > 0) {
          console.log(`Columns in '${table}':`, Object.keys(row[0]));
        }
      } else {
        console.log(`Table '${table}' does not exist or error:`, error.message);
      }
    }
  } else {
    console.log("Tables:", tables);
  }
}

checkSchema();
