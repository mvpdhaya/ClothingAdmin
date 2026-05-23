import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const parts = line.trim().split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addMiddleBanner() {
  console.log("Checking current homepage sections in Supabase...");
  
  const { data: existingSections, error: fetchErr } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('display_order', { ascending: true });
    
  if (fetchErr) {
    console.error("Error fetching sections:", fetchErr.message);
    return;
  }
  
  console.log("Existing sections inside database:");
  existingSections.forEach(s => {
    console.log(`- [${s.active ? 'ACTIVE' : 'INACTIVE'}] ID: ${s.id}, Name: "${s.name}", Type: "${s.type}", Display Order: ${s.display_order}`);
  });
  
  // Check if a middle_banner section already exists
  const hasMiddleBanner = existingSections.some(s => s.type === 'middle_banner');
  
  if (hasMiddleBanner) {
    console.log("A 'middle_banner' section already exists in the database. No need to insert a duplicate.");
    return;
  }
  
  console.log("\nNo 'middle_banner' section found. Let's create a beautiful one live in Supabase!");
  
  const sectionId = crypto.randomUUID();
  const nextDisplayOrder = existingSections.length;
  
  // 1. Insert into homepage_sections
  const { error: sectionErr } = await supabase
    .from('homepage_sections')
    .insert({
      id: sectionId,
      name: 'Flash Sale Middle Banner',
      active: true,
      type: 'middle_banner',
      display_order: nextDisplayOrder
    });
    
  if (sectionErr) {
    console.error("Failed to create section in homepage_sections:", sectionErr.message);
    return;
  }
  
  console.log("Step 1: Successfully created section row in 'homepage_sections' table!");
  
  // 2. Insert into promo_banners
  const { error: bannerErr } = await supabase
    .from('promo_banners')
    .insert({
      section_id: sectionId,
      image_url: '/images/middle_banner_default.png',
      title: 'FLASH SALE — UP TO 70% OFF',
      subtitle: 'Limited time. Limited stock. Act fast.',
      button_text: 'SHOP FLASH SALE',
      button_link: '/products',
      alignment: 'left'
    });
    
  if (bannerErr) {
    console.error("Failed to create banner details in 'promo_banners' table:", bannerErr.message);
    // Cleanup section row
    await supabase.from('homepage_sections').delete().eq('id', sectionId);
    return;
  }
  
  console.log("Step 2: Successfully created banner details in 'promo_banners' table!");
  console.log(`\n🎉 DONE! The 'middle_banner' section has been successfully linked and saved in Supabase!`);
  console.log(`Section ID: ${sectionId}`);
}

addMiddleBanner();
