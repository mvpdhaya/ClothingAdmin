import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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

async function inspect() {
  const tempId = '00000000-0000-0000-0000-000000000000';
  
  // Try inserting section with type = "middle_banner"
  await supabase.from('homepage_sections').upsert({
    id: tempId,
    name: 'Temp Middle Banner Check',
    active: false,
    type: 'middle_banner',
    display_order: 999
  });

  // Try inserting into promo_banners referencing tempId
  const { data: bannerData, error: bannerError } = await supabase
    .from('promo_banners')
    .upsert({
      section_id: tempId,
      image_url: 'https://example.com/image.jpg',
      title: 'FLASH SALE — UP TO 70% OFF',
      subtitle: 'Limited time. Limited stock. Act fast.',
      button_text: 'SHOP FLASH SALE',
      button_link: '/flash-sale',
      alignment: 'left'
    }, { onConflict: 'section_id' });

  if (bannerError) {
    console.error("Failed to insert into promo_banners:", bannerError.message);
  } else {
    console.log("Successfully inserted promo banner for middle_banner section!");
  }

  // Cleanup
  await supabase.from('promo_banners').delete().eq('section_id', tempId);
  await supabase.from('homepage_sections').delete().eq('id', tempId);
}

inspect();
