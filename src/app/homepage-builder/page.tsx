"use client";

import { useState, useEffect } from "react";
import { 
  GripVertical, 
  Edit, 
  Smartphone,
  Eye,
  Layout,
  Plus,
  Save,
  X,
  Search,
  Image as ImageIcon,
  LayoutGrid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Trash2,
  Columns
} from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import { useStoreSettings } from "@/lib/StoreContext";
import type { Category, Product } from "@/lib/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Section {
  id: string;
  name: string;
  active: boolean;
  type: "banner" | "products" | "categories" | "content" | "middle_banner" | "double_banner";
  count?: number; // For products
  // Banner specific
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  alignment?: string;
  buttonType?: string; // e.g. "sale" or "sale | badge" for double banners
  // Product Grid specific
  productType?: string;
  productLink?: string;
  description?: string; // Product Grid section description
  display_order?: number;
}

const initialSections: Section[] = [
  { id: "1", name: "Hero Banner", active: true, type: "banner" },
  { id: "categories-fixed", name: "Categories", active: true, type: "categories" },
  { id: "2", name: "New Arrivals", active: true, type: "products", count: 8, productType: "sale", productLink: "new" },
  { id: "4", name: "Flash Sale", active: true, type: "products", count: 4, productType: "category", productLink: "Flash Sale" },
  { id: "5", name: "On Sale", active: false, type: "products", count: 4, productType: "sale", productLink: "50" },
  { id: "6", name: "Testimonials", active: true, type: "content" },
  { id: "7", name: "Blog Posts", active: false, type: "content" },
  { id: "8", name: "Newsletter Banner", active: true, type: "banner" },
];

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeBannerTab, setActiveBannerTab] = useState<'left' | 'right'>('left');
  const [activeCatTab, setActiveCatTab] = useState<1 | 2 | 3 | 4>(1);
  const [productSearch, setProductSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [dbSubcategories, setDbSubcategories] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const { storeName } = useStoreSettings();

  useEffect(() => {
    fetchSections();
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, []);

  const fetchSubcategories = async () => {
    const { data } = await supabase.from('subcategories').select('*').order('display_order');
    if (data) setDbSubcategories(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) setDbProducts(data as Product[]);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    if (data) {
      setAvailableCategories(data);
    }
  };

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      // Fetch sections, banners and grids separately to avoid join issues with schema cache
      const [sectionsRes, bannersRes, gridsRes, catGridsRes] = await Promise.all([
        supabase.from('homepage_sections').select('*').order('display_order', { ascending: true }),
        supabase.from('promo_banners').select('*'),
        supabase.from('product_grids').select('*'),
        supabase.from('category_grids').select('*')
      ]);

      if (sectionsRes.error) throw sectionsRes.error;

      const data = sectionsRes.data || [];
      const banners = bannersRes.data || [];
      const grids = gridsRes.data || [];
      const catGrids = catGridsRes.data || [];

      const formattedSections: Section[] = data.map((row: any) => {
        const banner = banners.find(b => b.section_id === row.id);
        const grid = grids.find(g => g.section_id === row.id);
        const catGrid = catGrids.find((c: any) => c.section_id === row.id);

        return {
          id: row.id,
          name: row.name,
          active: row.active,
          type: row.type,
          ...(banner ? {
            imageUrl: banner.image_url,
            title: banner.title,
            subtitle: banner.subtitle,
            buttonText: banner.button_text,
            buttonLink: banner.button_link,
            alignment: banner.alignment,
            buttonType: banner.button_type || "sale",
          } : {}),
          // All product grid types load from product_grids table
          ...(grid ? {
            productType: grid.product_type || "sale",
            productLink: grid.product_link,
            description: grid.description,
            count: grid.item_count,
          } : {}),
          ...(catGrid ? {
            subtitle: catGrid.main_title,
            imageUrl: [catGrid.cat1_image, catGrid.cat2_image, catGrid.cat3_image, catGrid.cat4_image].join(" | "),
            buttonLink: [catGrid.cat1_link, catGrid.cat2_link, catGrid.cat3_link, catGrid.cat4_link].join(" | "),
            title: " | | | " 
          } : {})
        };
      });
      const sortedSections = [...formattedSections];
      
      // Ensure Categories exists (fallback for new users)
      if (!sortedSections.find(s => s.name === "Categories")) {
        sortedSections.push({ 
          id: "categories-fixed", 
          name: "Categories", 
          active: true, 
          type: "categories",
          display_order: sortedSections.length
        });
      }

      // Pin Hero Banner to top
      const heroIndex = sortedSections.findIndex(s => s.name === "Hero Banner");
      if (heroIndex > 0) {
        const hero = sortedSections.splice(heroIndex, 1)[0];
        sortedSections.unshift(hero);
      }

      setSections(sortedSections);
    } catch (error) {
      console.error("Error fetching homepage layout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("This will replace your current layout with the default template. Are you sure?")) {
      const resetSections = initialSections.map(s => ({
        ...s,
        id: crypto.randomUUID()
      }));
      setSections(resetSections);
    }
  };

  const handleSaveLayout = async () => {
    setIsSaving(true);
    
    // Only update the display_order of existing sections (those with valid UUIDs)
    const orderUpdates = sections
      .filter(section => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(section.id))
      .map((section) => ({
        id: section.id,
        name: section.name,
        active: section.active,
        type: section.type,
        // Use the index from the ORIGINAL sections array for absolute stability
        display_order: sections.findIndex(s => s.id === section.id)
      }));

    if (orderUpdates.length === 0) {
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from('homepage_sections').upsert(orderUpdates);
    
    if (error) {
      console.error("Error saving layout order:", error);
      alert("Failed to save layout order.");
    } else {
      await fetchSections();
    }
    
    setIsSaving(false);
  };

  const handleToggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDeleteSection = (id: string) => {
    setSectionToDelete(id);
  };

  const confirmDelete = async () => {
    if (!sectionToDelete) return;
    
    // Check if it's a UUID (stored in DB) or a temporary ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sectionToDelete);
    
    if (isUUID) {
      setIsSaving(true);
      // Manually delete from child tables first as a fallback for missing CASCADE
      await Promise.all([
        supabase.from('promo_banners').delete().eq('section_id', sectionToDelete),
        supabase.from('product_grids').delete().eq('section_id', sectionToDelete)
      ]);
      
      // Finally delete the main section
      await supabase.from('homepage_sections').delete().eq('id', sectionToDelete);
      setIsSaving(false);
    }
    
    setSections(sections.filter(s => s.id !== sectionToDelete));
    setSectionToDelete(null);
  };

  const handleEditClick = (section: Section) => {
    setEditingSection({ ...section });
    setActiveBannerTab('left');
    setIsModalOpen(true);
  };

  const handleUpdateSection = async () => {
    if (editingSection) {
      setIsSaving(true);
      try {
        // 1. Prepare base section
        const currentIndex = sections.findIndex(s => s.id === editingSection.id);
        const sectionToSave: any = {
          name: editingSection.name,
          active: editingSection.active,
          type: editingSection.type,
          display_order: currentIndex === -1 ? sections.length : currentIndex
        };

        // Only include ID if it's not our placeholder
        if (editingSection.id !== "categories-fixed") {
          sectionToSave.id = editingSection.id;
        }

        // 2. Upsert base section into homepage_sections
        const { data: upsertedData, error: sectionError } = await supabase
          .from('homepage_sections')
          .upsert(sectionToSave)
          .select()
          .single();

        if (sectionError) throw new Error('homepage_sections upsert failed: ' + sectionError.message);
        
        const savedSectionId = upsertedData.id;

        // 3. Save specific data per type
        if (editingSection.type === 'banner' || editingSection.type === 'middle_banner' || editingSection.type === 'double_banner') {
          const { error: bannerError } = await supabase.from('promo_banners').upsert({
            section_id: savedSectionId,
            image_url: editingSection.imageUrl,
            title: editingSection.title,
            subtitle: editingSection.subtitle,
            button_text: editingSection.buttonText,
            button_link: editingSection.buttonLink,
            alignment: editingSection.alignment,
            button_type: editingSection.buttonType || 'sale'
          }, { onConflict: 'section_id' });
          if (bannerError) throw new Error('promo_banners upsert failed: ' + bannerError.message);

        } else if (editingSection.type === 'products') {
          // Delete existing product_grids row first, then insert fresh (avoids onConflict issues)
          await supabase.from('product_grids').delete().eq('section_id', savedSectionId);

          const { error: gridError } = await supabase.from('product_grids').insert({
            section_id: savedSectionId,
            product_type: editingSection.productType || "sale",
            product_link: editingSection.productLink || null,
            description: editingSection.description || null,
            item_count: editingSection.count || null
          });
          if (gridError) throw new Error('product_grids insert failed: ' + gridError.message);
        } else if (editingSection.type === 'categories') {
          // Delete existing row first
          await supabase.from('category_grids').delete().eq('section_id', savedSectionId);

          const images = (editingSection.imageUrl || "").split(" | ");
          const links = (editingSection.buttonLink || "").split(" | ");

          const { error: catError } = await supabase.from('category_grids').insert({
            section_id: savedSectionId,
            main_title: editingSection.subtitle || null,
            cat1_image: images[0] || null,
            cat1_link: links[0] || null,
            cat2_image: images[1] || null,
            cat2_link: links[1] || null,
            cat3_image: images[2] || null,
            cat3_link: links[2] || null,
            cat4_image: images[3] || null,
            cat4_link: links[3] || null
          });
          if (catError) throw new Error('category_grids insert failed: ' + catError.message);
        }

        // NOW: Sync display_order for ALL sections to ensure uniqueness and stability
        // This prevents sections from jumping to the top by enforcing the current array sequence
        const updatedSectionsToSync = sections
          .map((s, idx) => {
             const sectionId = s.id === editingSection.id ? savedSectionId : s.id;
             // Only include if it's a UUID (or the newly saved one)
             if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sectionId)) return null;
             
             return {
               id: sectionId,
               name: s.name,
               active: s.active,
               type: s.type,
               display_order: idx
             };
          })
          .filter(Boolean) as any[];

        const { error: syncError } = await supabase
          .from('homepage_sections')
          .upsert(updatedSectionsToSync);
        
        if (syncError) console.error('Ordering sync failed:', syncError.message);

        await fetchSections();
        setIsModalOpen(false);
        setEditingSection(null);
      } catch (err: any) {
        console.error('Error saving section:', err);
        alert('Error saving section: ' + (err?.message || String(err)));
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAddSection = (type: "banner" | "products" | "middle_banner" | "double_banner") => {
    const newId = crypto.randomUUID();
    const newSection: Section = type === "banner" 
      ? { 
          id: newId, 
          name: "Promo Banner", 
          active: true, 
          type: "banner",
          title: "",
          subtitle: "",
          buttonText: "",
          buttonLink: "",
          alignment: "center",
          imageUrl: undefined
        }
      : type === "middle_banner"
      ? {
          id: newId,
          name: "Middle Banner",
          active: true,
          type: "middle_banner",
          title: "FLASH SALE — UP TO 70% OFF",
          subtitle: "Limited time. Limited stock. Act fast.",
          buttonText: "SHOP FLASH SALE",
          buttonLink: "/products",
          alignment: "left",
          imageUrl: "/images/middle_banner_default.png"
        }
      : type === "double_banner"
      ? {
          id: newId,
          name: "Double Banner",
          active: true,
          type: "double_banner",
          title: "Summer Sale Up to 50% Off | Autumn Collection 2026",
          subtitle: "END OF SEASON | NEW ARRIVALS",
          buttonText: "SHOP NOW | DISCOVER",
          buttonLink: "/products | /products",
          alignment: "left | left",
          imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop | https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=450&fit=crop"
        }
      : { 
          id: newId, 
          name: "Product Grid", 
          active: true, 
          type: "products", 
          count: 4,
          productType: "sale",
          productLink: "50"
        };
    
    setIsAddModalOpen(false);
    setEditingSection(newSection);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side?: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (file && editingSection) {
      let currentUrls = (editingSection.imageUrl || "").split(" | ");
      if (editingSection.type === "double_banner" && currentUrls.length < 2) {
        currentUrls = ["", ""];
      }
      if (editingSection.type === "categories" && currentUrls.length < 4) {
        while (currentUrls.length < 4) currentUrls.push("");
      }

      // Local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingSection.type === "double_banner" && side) {
          const idx = side === "left" ? 0 : 1;
          const newUrls = [...currentUrls];
          newUrls[idx] = reader.result as string;
          setEditingSection({ ...editingSection, imageUrl: newUrls.join(" | ") });
        } else if (editingSection.type === "categories") {
          const idx = activeCatTab - 1;
          const newUrls = [...currentUrls];
          newUrls[idx] = reader.result as string;
          setEditingSection({ ...editingSection, imageUrl: newUrls.join(" | ") });
        } else {
          setEditingSection({ ...editingSection, imageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);

      // Supabase upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (error) {
        alert("Image upload failed! Please make sure the 'banners' bucket is created in Supabase. Reverting image.");
        // Revert to original or remove base64 so save doesn't crash
        if (editingSection.type === "double_banner" && side) {
          const idx = side === "left" ? 0 : 1;
          const newUrls = [...currentUrls];
          newUrls[idx] = "";
          setEditingSection(prev => prev ? { ...prev, imageUrl: newUrls.join(" | ") } : prev);
        } else {
          setEditingSection(prev => prev ? { ...prev, imageUrl: undefined } : prev);
        }
        return;
      }

      if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('banners')
          .getPublicUrl(filePath);
        
        if (editingSection.type === "double_banner" && side) {
          const idx = side === "left" ? 0 : 1;
          const newUrls = [...currentUrls];
          newUrls[idx] = publicUrlData.publicUrl;
          setEditingSection(prev => prev ? { ...prev, imageUrl: newUrls.join(" | ") } : prev);
        } else if (editingSection.type === "categories") {
          const idx = activeCatTab - 1;
          const newUrls = [...currentUrls];
          newUrls[idx] = publicUrlData.publicUrl;
          setEditingSection(prev => prev ? { ...prev, imageUrl: newUrls.join(" | ") } : prev);
        } else {
          setEditingSection(prev => prev ? { ...prev, imageUrl: publicUrlData.publicUrl } : prev);
        }
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading Layout...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-text-primary">Homepage Layout Builder</h2>
           <p className="text-sm text-text-muted mt-1">Drag sections to reorder. Toggle to show or hide on storefront.</p>
        </div>
        <button className="btn-primary" onClick={handleSaveLayout} disabled={isSaving || isLoading}>
          {isSaving ? (
             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Layout"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel - Sections Control */}
        <div className="lg:col-span-7 space-y-4">
           <div className="card">
             <Reorder.Group 
               axis="y" 
               values={sections} 
               onReorder={(newOrder) => {
                 // Ensure Hero Banner stays at index 0 if it exists
                 const heroIndex = newOrder.findIndex(s => s.name === "Hero Banner");
                 if (heroIndex > 0) {
                   const hero = newOrder.splice(heroIndex, 1)[0];
                   newOrder.unshift(hero);
                 }

                 setSections(newOrder);
               }}
               className="space-y-3"
               style={{ listStyle: "none", margin: 0, padding: 0 }}
             >
               {sections.map((section) => (
                 <SectionItem 
                   key={section.id} 
                   section={section} 
                   onToggle={() => handleToggleSection(section.id)}
                   onEdit={() => handleEditClick(section)}
                   onDelete={() => handleDeleteSection(section.id)}
                 />
               ))}
             </Reorder.Group>

             <button 
               onClick={() => setIsAddModalOpen(true)}
               className="w-full mt-4 py-4 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center gap-2 text-text-muted hover:text-brand-gold hover:border-brand-gold/30 hover:bg-brand-gold-light/20 transition-all font-bold text-sm"
             >
                <Plus className="w-4 h-4" />
                Add Custom Section
             </button>
           </div>
        </div>

        {/* Right Panel - Phone Preview */}
        <div className="lg:col-span-5 sticky top-24">
           <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 bg-brand-sidebar text-white rounded-lg">
                    <Smartphone className="w-4 h-4" />
                 </div>
                 <h3 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Live Preview</h3>
                 <span className="ml-4 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded animate-pulse">LIVE UPDATING</span>
              </div>

              {/* Phone Frame */}
              <div className="w-72 h-[600px] border-[10px] border-brand-sidebar rounded-[40px] shadow-2xl relative overflow-hidden bg-background">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-brand-sidebar rounded-b-2xl z-20"></div>
                 
                 {/* Mock Store Content */}
                 <div className="h-full overflow-y-auto scrollbar-hide p-3 pt-8 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-xs font-bold tracking-tighter">{storeName}</span>
                       <div className="flex gap-2">
                          <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                          <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                       </div>
                    </div>

                    {/* Dynamic Sections */}
                    {sections.filter(s => s.active).map((section) => (
                      <div key={section.id} className="animate-fade-in">
                         {section.type === "banner" ? (
                            <div className="w-full aspect-[16/9] relative rounded-lg overflow-hidden group">
                               {section.imageUrl ? (
                                 <img src={section.imageUrl} alt={section.name} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
                                    <span className="text-[8px] font-bold text-brand-gold uppercase tracking-widest">{section.name}</span>
                                 </div>
                               )}
                               <div className={cn(
                                 "absolute inset-0 bg-black/20 p-4 flex flex-col justify-center",
                                 section.alignment === "center" ? "items-center text-center" : 
                                 section.alignment === "right" ? "items-end text-right" : "items-start text-left"
                               )}>
                                  {section.title && <h4 className="text-[10px] font-bold text-white leading-tight mb-0.5">{section.title}</h4>}
                                  {section.subtitle && <p className="text-[7px] text-white/80 mb-2">{section.subtitle}</p>}
                                  {section.buttonText && (
                                    <div className="px-2 py-1 bg-white text-black text-[6px] font-bold rounded">
                                      {section.buttonText}
                                    </div>
                                  )}
                               </div>
                            </div>
                         ) : section.type === "middle_banner" ? (
                            <div className="w-full aspect-[16/9] relative rounded-lg overflow-hidden bg-black flex group border border-neutral-900 shadow-lg">
                               <div className={cn(
                                 "w-[55%] z-10 p-2.5 flex flex-col justify-center bg-black/90",
                                 section.alignment === "center" ? "items-center text-center" : 
                                 section.alignment === "right" ? "items-end text-right" : "items-start text-left"
                               )}>
                                  {section.title && <h4 className="text-[9px] font-black text-white uppercase tracking-tight leading-none mb-1 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">{section.title}</h4>}
                                  {section.subtitle && <p className="text-[5.5px] text-neutral-400 mb-2 leading-relaxed">{section.subtitle}</p>}
                                  {section.buttonText && (
                                     <div className="px-2 py-1 border border-white/60 text-white text-[4px] font-bold tracking-wider rounded uppercase bg-transparent">
                                       {section.buttonText}
                                     </div>
                                   )}
                               </div>
                               <div className="w-[45%] h-full relative overflow-hidden">
                                  {section.imageUrl ? (
                                    <img src={section.imageUrl} alt={section.name} className="w-full h-full object-cover" />
                                  ) : (
                                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                                       <span className="text-[6px] font-bold text-neutral-600 uppercase">Image</span>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
                                </div>
                            </div>
                          ) : section.type === "double_banner" ? (
                             <div className="w-full flex flex-col gap-2">
                               {(() => {
                                 const titles = (section.title || "").split(" | ");
                                 const subtitles = (section.subtitle || "").split(" | ");
                                 const buttons = (section.buttonText || "").split(" | ");
                                 const images = (section.imageUrl || "").split(" | ");
                                 
                                 const leftTitle = titles[0] || "Summer Sale";
                                 const leftSubtitle = subtitles[0] || "END OF SEASON";
                                 const leftButton = buttons[0] || "SHOP NOW";
                                 const leftImage = images[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop";

                                 const rightTitle = titles[1] || "Autumn Collection";
                                 const rightSubtitle = subtitles[1] || "NEW ARRIVALS";
                                 const rightButton = buttons[1] || "DISCOVER";
                                 const rightImage = images[1] || "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=450&fit=crop";

                                 return (
                                   <div className="grid grid-cols-2 gap-2">
                                     {/* Left Banner */}
                                     <div className="aspect-[4/5] relative rounded-lg overflow-hidden group border border-gray-100 shadow-sm animate-fade-in">
                                       <img src={leftImage} alt={leftTitle} className="w-full h-full object-cover" />
                                       <div className="absolute inset-0 bg-black/35 p-2 flex flex-col justify-center items-start text-left">
                                         <span className="text-[5px] tracking-widest text-white/90 mb-0.5 uppercase">{leftSubtitle}</span>
                                         <h4 className="text-[8px] font-bold text-white leading-tight mb-1.5">{leftTitle}</h4>
                                         <div className="px-1.5 py-0.5 border border-white/60 text-white text-[4px] font-bold tracking-wider rounded uppercase bg-transparent">
                                           {leftButton}
                                         </div>
                                       </div>
                                     </div>
                                     {/* Right Banner */}
                                     <div className="aspect-[4/5] relative rounded-lg overflow-hidden group border border-gray-100 shadow-sm animate-fade-in">
                                       <img src={rightImage} alt={rightTitle} className="w-full h-full object-cover" />
                                       <div className="absolute inset-0 bg-black/35 p-2 flex flex-col justify-center items-start text-left">
                                         <span className="text-[5px] tracking-widest text-white/90 mb-0.5 uppercase">{rightSubtitle}</span>
                                         <h4 className="text-[8px] font-bold text-white leading-tight mb-1.5">{rightTitle}</h4>
                                         <div className="px-1.5 py-0.5 border border-white/60 text-white text-[4px] font-bold tracking-wider rounded uppercase bg-transparent">
                                           {rightButton}
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                 );
                               })()}
                             </div>
                          ) : section.type === "products" ? (
                            <div className="space-y-2">
                               <div className="flex justify-between items-end">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold">{section.name}</span>
                                    <span className="text-[6px] text-text-muted font-bold uppercase tracking-wider">
                                      {section.productType === "all" ? "All Products" : 
                                       section.productType === "category" ? `Category: ${section.productLink}` : 
                                       section.productType === "sale" ? `${section.productLink}% OFF` : 
                                       section.productType === "badge" ? `Badge: ${section.productLink}` :
                                       `Link: ${section.productLink}`}
                                    </span>
                                  </div>
                                  <span className="text-[8px] text-text-muted">See all</span>
                               </div>
                               <div className="grid grid-cols-2 gap-2">
                                  <div className="aspect-square bg-gray-100 rounded"></div>
                                  <div className="aspect-square bg-gray-100 rounded"></div>
                               </div>
                            </div>
                         ) : section.type === "categories" ? (
                           <div className="space-y-1.5">
                              <div className="flex justify-between items-center px-0.5">
                                 <span className="text-[9px] font-bold tracking-tight uppercase text-text-primary">
                                    {section.subtitle || "SHOP OUR TOP CATEGORIES"}
                                 </span>
                              </div>
                              <div className="grid grid-cols-4 gap-1.5">
                                 {(() => {
                                   const titles = (section.title || "").split(" | ");
                                   const images = (section.imageUrl || "").split(" | ");
                                   
                                   return [0, 1, 2, 3].map(idx => (
                                     <div key={idx} className="aspect-[4/5] relative rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shadow-sm animate-fade-in group">
                                        {images[idx] ? (
                                          <img src={images[idx]} alt={titles[idx]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center opacity-10">
                                             <LayoutGrid className="w-4 h-4" />
                                          </div>
                                        )}
                                     </div>
                                   ));
                                 })()}
                              </div>
                           </div>
                         ) : (
                            <div className="w-full py-4 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 border-dashed">
                               <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{section.name}</span>
                            </div>
                         )}
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
      {/* Edit Section Modal */}
      {isModalOpen && editingSection && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Edit Section</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Customize properties for {editingSection.name}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Name</label>
                <input 
                  type="text" 
                  value={editingSection.name}
                  onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                  disabled={editingSection.name === "Hero Banner"}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. Featured Products"
                />
              </div>

              {editingSection.type === "products" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Description</label>
                  <textarea
                    rows={2}
                    value={editingSection.description || ""}
                    onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all resize-none"
                    placeholder="e.g. Explore our latest arrivals and trending styles"
                  />
                </div>
              )}

              {(editingSection.type === "banner" || editingSection.type === "middle_banner" || editingSection.type === "double_banner" || editingSection.type === "products") && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  {(editingSection.type === "banner" || editingSection.type === "middle_banner" || editingSection.type === "double_banner") && (
                    <div className="space-y-6">
                      {editingSection.type === "double_banner" && (
                        <div className="flex border-b border-gray-200 mb-6 bg-gray-50/50 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setActiveBannerTab('left')}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                              activeBannerTab === 'left' ? "bg-white text-brand-gold shadow-sm" : "text-text-muted hover:text-text-primary"
                            )}
                          >
                            Left Banner Card
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveBannerTab('right')}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                              activeBannerTab === 'right' ? "bg-white text-brand-gold shadow-sm" : "text-text-muted hover:text-text-primary"
                            )}
                          >
                            Right Banner Card
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {(() => {
                    const isDouble = editingSection.type === "double_banner";
                    const isProducts = editingSection.type === "products";
                    
                    const titles = (editingSection.title || "").split(" | ");
                    const subtitles = (editingSection.subtitle || "").split(" | ");
                    const buttons = (editingSection.buttonText || "").split(" | ");
                    const links = (editingSection.buttonLink || "").split(" | ");
                    const alignments = (editingSection.alignment || "").split(" | ");
                    const images = (editingSection.imageUrl || "").split(" | ");

                    const tabIndex = activeBannerTab === 'left' ? 0 : 1;

                    const bannerButtonTypes = (editingSection.buttonType || "").split(" | ");
                    
                    const currentTypeField = isProducts ? 'productType' : 'buttonType';
                    const currentLinkField = isProducts ? 'productLink' : 'buttonLink';

                    const updateField = (field: 'title' | 'subtitle' | 'buttonText' | 'buttonLink' | 'alignment' | 'imageUrl' | 'buttonType' | 'productType' | 'productLink', val: string) => {
                      setEditingSection(prev => {
                        if (!prev) return prev;
                        if (isDouble && field !== 'productType' && field !== 'productLink') {
                          const idx = tabIndex;
                          const currentRawValue = (prev[field as keyof Section] as string) || "";
                          const arr = currentRawValue.split(" | ");
                          
                          // Ensure we have at least 2 slots for double banner
                          while (arr.length < 2) {
                            if (field === 'alignment') arr.push("left");
                            else if (field === 'buttonType') arr.push("sale");
                            else arr.push("");
                          }
                          
                          arr[idx] = val;
                          return { ...prev, [field]: arr.join(" | ") };
                        } else {
                          return { ...prev, [field]: val };
                        }
                      });
                    };

                    const currentTitle = isDouble ? (titles[tabIndex] || "") : (editingSection.title || "");
                    const currentSubtitle = isDouble ? (subtitles[tabIndex] || "") : (editingSection.subtitle || "");
                    const currentButtonText = isDouble ? (buttons[tabIndex] || "") : (editingSection.buttonText || "");
                    const currentButtonLink = isDouble ? (links[tabIndex] || "") : (isProducts ? (editingSection.productLink || "") : (editingSection.buttonLink || ""));
                    const currentAlignment = isDouble ? (alignments[tabIndex] || "left") : (editingSection.alignment || "center");
                    const currentImageUrl = isDouble ? (images[tabIndex] || "") : (editingSection.imageUrl || "");
                    const currentButtonType = isDouble ? (bannerButtonTypes[tabIndex] || "sale") : (isProducts ? (editingSection.productType || "sale") : (editingSection.buttonType || "sale"));

                    return (
                      <div className="space-y-6">
                        {!isProducts && (
                          <>
                            {/* Banner Image */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                {isDouble ? `${activeBannerTab === 'left' ? 'Left' : 'Right'} Banner Image` : 'Banner Image'}
                              </label>
                              <div className="flex items-center gap-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-brand-gold/30 transition-all">
                                 <div className="w-24 h-24 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100 shadow-sm">
                                    {currentImageUrl ? (
                                      <img src={currentImageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                                         <ImageIcon className="w-8 h-8 opacity-20" />
                                      </div>
                                    )}
                                 </div>
                                 <div className="flex-1 space-y-3">
                                    <div>
                                       <p className="text-sm font-bold text-text-primary">Upload Local Image</p>
                                       <p className="text-[10px] text-text-muted mt-0.5">JPG, PNG or WebP. Max 2MB recommended.</p>
                                    </div>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-text-primary hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                                       <Upload className="w-3.5 h-3.5 text-brand-gold" />
                                       Select File
                                       <input 
                                         type="file" 
                                         className="hidden" 
                                         accept="image/*"
                                         onChange={(e) => handleImageUpload(e, isDouble ? activeBannerTab : undefined)}
                                       />
                                    </label>
                                 </div>
                              </div>
                            </div>

                            {/* Title & Subtitle */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title</label>
                                <input 
                                  type="text" 
                                  value={currentTitle}
                                  onChange={(e) => {
                                    if (isDouble) {
                                      updateField('title', e.target.value);
                                    } else {
                                      setEditingSection({ ...editingSection, title: e.target.value });
                                    }
                                  }}
                                  className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-xs outline-none focus:bg-white focus:border-brand-gold transition-all"
                                  placeholder="e.g. New Arrivals"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle</label>
                                <input 
                                  type="text" 
                                  value={currentSubtitle}
                                  onChange={(e) => {
                                    if (isDouble) {
                                      updateField('subtitle', e.target.value);
                                    } else {
                                      setEditingSection({ ...editingSection, subtitle: e.target.value });
                                    }
                                  }}
                                  className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-xs outline-none focus:bg-white focus:border-brand-gold transition-all"
                                  placeholder="e.g. Explore the collection"
                                />
                              </div>
                            </div>

                            {/* Button Text & Link */}
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Text</label>
                                <input 
                                  type="text" 
                                  value={currentButtonText}
                                  onChange={(e) => {
                                    if (isDouble) {
                                      updateField('buttonText', e.target.value);
                                    } else {
                                      setEditingSection({ ...editingSection, buttonText: e.target.value });
                                    }
                                  }}
                                  className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-xs outline-none focus:bg-white focus:border-brand-gold transition-all"
                                  placeholder="e.g. Shop Now"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                              {isProducts ? "Product Type" : "Button Type"}
                            </label>
                            <select 
                              value={currentButtonType}
                              onChange={(e) => {
                                const newType = e.target.value as any;
                                let newLink = currentButtonLink;
                                if (newType === "sale") newLink = "50";
                                else if (newType === "badge") newLink = "new";
                                else if (newType === "category") newLink = availableCategories[0]?.name || "";
                                
                                if (isDouble) {
                                  updateField('buttonType', newType);
                                  updateField('buttonLink', newLink);
                                } else if (isProducts) {
                                  setEditingSection({ 
                                    ...editingSection, 
                                    productType: newType,
                                    productLink: newLink
                                  });
                                } else {
                                  setEditingSection({ 
                                    ...editingSection, 
                                    buttonType: newType,
                                    buttonLink: newLink
                                  });
                                }
                              }}
                              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                            >
                              <option value="sale">Sale</option>
                              <option value="badge">Badge</option>
                              <option value="category">Category</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                              {isProducts ? "Product Link / Value" : "Button Link / Value"}
                            </label>
                            
                            {currentButtonType === "sale" ? (
                              <input 
                                type="number" 
                                value={currentButtonLink}
                                onChange={(e) => {
                                  if (isDouble) updateField('buttonLink', e.target.value);
                                  else if (isProducts) setEditingSection({ ...editingSection, productLink: e.target.value });
                                  else setEditingSection({ ...editingSection, buttonLink: e.target.value });
                                }}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                                placeholder="Enter offer percentage (e.g. 50)"
                              />
                            ) : currentButtonType === "badge" ? (
                              <select 
                                value={currentButtonLink || "new"}
                                onChange={(e) => {
                                  if (isDouble) updateField('buttonLink', e.target.value);
                                  else if (isProducts) setEditingSection({ ...editingSection, productLink: e.target.value });
                                  else setEditingSection({ ...editingSection, buttonLink: e.target.value });
                                }}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                              >
                                <option value="new">New</option>
                                <option value="flash">Flash</option>
                                <option value="sale">Sale</option>
                              </select>
                            ) : currentButtonType === "category" ? (
                              <select 
                                value={currentButtonLink}
                                onChange={(e) => {
                                  if (isDouble) updateField('buttonLink', e.target.value);
                                  else if (isProducts) setEditingSection({ ...editingSection, productLink: e.target.value });
                                  else setEditingSection({ ...editingSection, buttonLink: e.target.value });
                                }}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                              >
                                <optgroup label="Main Categories">
                                  {availableCategories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="Subcategories">
                                  {dbSubcategories.map(sub => (
                                    <option key={sub.id} value={sub.name}>{sub.name}</option>
                                  ))}
                                </optgroup>
                              </select>
                            ) : (
                              <input 
                                type="text" 
                                value={currentButtonLink}
                                onChange={(e) => {
                                  if (isDouble) updateField('buttonLink', e.target.value);
                                  else if (isProducts) setEditingSection({ ...editingSection, productLink: e.target.value });
                                  else setEditingSection({ ...editingSection, buttonLink: e.target.value });
                                }}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                                placeholder={isProducts ? "e.g. /category/electronics" : "e.g. /products/new"}
                              />
                            )}
                          </div>
                        </div>

                        {!isProducts && (
                          /* Text Alignment */
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Text Alignment</label>
                            <div className="flex gap-2">
                               {[
                                 { id: "left", icon: AlignLeft },
                                 { id: "center", icon: AlignCenter },
                                 { id: "right", icon: AlignRight },
                               ].map((align) => (
                                 <button
                                   key={align.id}
                                   type="button"
                                   onClick={() => {
                                     if (isDouble) {
                                       updateField('alignment', align.id);
                                     } else {
                                       setEditingSection({ ...editingSection, alignment: align.id as any });
                                     }
                                   }}
                                   className={cn(
                                     "flex-1 py-3 rounded-xl border flex items-center justify-center transition-all",
                                     currentAlignment === align.id ? "bg-brand-gold border-brand-gold text-white" : "bg-gray-50 border-transparent text-text-muted hover:bg-gray-100"
                                   )}
                                 >
                                   <align.icon className="w-5 h-5" />
                                 </button>
                               ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

          {/* Restored Items to Show UI */}
          {editingSection.count !== undefined && (
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Items to Show</label>
              <input 
                type="number" 
                value={editingSection.count || ""}
                onChange={(e) => setEditingSection({ ...editingSection, count: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
              />
              <p className="text-[10px] text-text-muted italic">Set the number of products to display in this grid.</p>
            </div>
          )}

              {editingSection.type === "categories" && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Main Heading</label>
                    <input 
                      type="text" 
                      value={editingSection.subtitle || ""}
                      onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                      placeholder="e.g. SHOP OUR TOP CATEGORIES"
                    />
                  </div>

                  <div className="flex border-b border-gray-200 mb-6 bg-gray-50/50 p-1 rounded-xl">
                    {[1, 2, 3, 4].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setActiveCatTab(slot as any)}
                        className={cn(
                          "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                          activeCatTab === slot ? "bg-white text-brand-gold shadow-sm" : "text-text-muted hover:text-text-primary"
                        )}
                      >
                        Slot {slot}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const titles = (editingSection.title || "").split(" | ");
                    const links = (editingSection.buttonLink || "").split(" | ");
                    const images = (editingSection.imageUrl || "").split(" | ");
                    const idx = activeCatTab - 1;

                    const currentTitle = titles[idx] || "";
                    const currentLink = links[idx] || "";
                    const currentImageUrl = images[idx] || "";

                    const updateCatField = (field: 'title' | 'link' | 'imageUrl', val: string) => {
                      const tArr = [...titles]; while (tArr.length < 4) tArr.push("");
                      const lArr = [...links]; while (lArr.length < 4) lArr.push("");
                      const iArr = [...images]; while (iArr.length < 4) iArr.push("");

                      if (field === 'title') tArr[idx] = val;
                      if (field === 'link') lArr[idx] = val;
                      if (field === 'imageUrl') iArr[idx] = val;

                      setEditingSection({
                        ...editingSection,
                        title: tArr.join(" | "),
                        buttonLink: lArr.join(" | "),
                        imageUrl: iArr.join(" | ")
                      });
                    };

                    return (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Category Image (Slot {activeCatTab})</label>
                          <div className="flex items-center gap-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-brand-gold/30 transition-all">
                             <div className="w-24 h-24 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100 shadow-sm">
                                {currentImageUrl ? (
                                  <img src={currentImageUrl} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                                     <ImageIcon className="w-8 h-8 opacity-20" />
                                  </div>
                                )}
                             </div>
                             <div className="flex-1 space-y-3">
                                <div>
                                   <p className="text-sm font-bold text-text-primary">Upload Category Image</p>
                                   <p className="text-[10px] text-text-muted mt-0.5">JPG, PNG or WebP. Max 2MB.</p>
                                </div>
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-text-primary hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                                   <Upload className="w-3.5 h-3.5 text-brand-gold" />
                                   Select File
                                   <input 
                                     type="file" 
                                     className="hidden" 
                                     accept="image/*"
                                     onChange={(e) => handleImageUpload(e)}
                                   />
                                </label>
                             </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Link Category</label>
                            <select 
                              value={currentLink}
                              onChange={(e) => updateCatField('link', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-xs outline-none focus:bg-white focus:border-brand-gold transition-all"
                            >
                              <option value="">Select Category</option>
                              {availableCategories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex flex-col gap-0.5">
                   <span className="text-sm font-bold text-text-primary">Visibility</span>
                   <span className="text-[10px] text-text-muted">Show this section on the homepage</span>
                </div>
                <label className="switch">
                   <input 
                     type="checkbox" 
                     checked={editingSection.active}
                     onChange={(e) => setEditingSection({ ...editingSection, active: e.target.checked })}
                   />
                   <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-muted hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateSection}
                className="flex-[2] px-6 py-3 bg-brand-gold text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Section Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Add Custom Section</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Choose a layout type for your new section</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 flex flex-col gap-4">
              <button 
                onClick={() => handleAddSection("middle_banner")}
                className="flex items-center gap-6 p-6 rounded-2xl border-2 border-gray-100 hover:border-brand-gold/30 hover:bg-brand-gold-light/20 transition-all group w-full text-left"
              >
                <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                   <Layout className="w-7 h-7" />
                </div>
                <div>
                   <p className="text-sm font-bold text-text-primary">Middle Banner</p>
                   <p className="text-xs text-text-muted mt-1">Split layout & ghost CTA. Perfect for promotional highlights.</p>
                </div>
              </button>

              <button 
                onClick={() => handleAddSection("double_banner")}
                className="flex items-center gap-6 p-6 rounded-2xl border-2 border-gray-100 hover:border-brand-gold/30 hover:bg-brand-gold-light/20 transition-all group w-full text-left"
              >
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                   <Columns className="w-7 h-7" />
                </div>
                <div>
                   <p className="text-sm font-bold text-text-primary">Double Banner</p>
                   <p className="text-xs text-text-muted mt-1">2-Column split layout for showcasing multiple collections.</p>
                </div>
              </button>

              <button 
                onClick={() => handleAddSection("products")}
                className="flex items-center gap-6 p-6 rounded-2xl border-2 border-gray-100 hover:border-brand-gold/30 hover:bg-brand-gold-light/20 transition-all group w-full text-left"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                   <LayoutGrid className="w-7 h-7" />
                </div>
                <div>
                   <p className="text-sm font-bold text-text-primary">Product Grid</p>
                   <p className="text-xs text-text-muted mt-1">Dynamic showcase of products with customizable source filters.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {sectionToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            onClick={() => setSectionToDelete(null)}
          ></div>
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Delete Section
              </h3>
              <button 
                onClick={() => setSectionToDelete(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-text-secondary">Are you sure you want to delete this section? This action cannot be undone.</p>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button 
                onClick={() => setSectionToDelete(null)}
                className="flex-1 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-muted hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-[2] px-6 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual reorderable items
function SectionItem({ section, onToggle, onEdit, onDelete }: { 
  section: Section; 
  onToggle: () => void; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();
  const isHeroBanner = section.name === "Hero Banner";
  const isCategories = section.name === "Categories";

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={controls}
      layout
      whileDrag={{ 
        scale: 1.03, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50,
        backgroundColor: "#fff"
      }}
      style={{ borderRadius: 12, position: "relative" }}
      className={cn(
        "flex items-center gap-4 p-4 border rounded-xl transition-colors group",
        section.active ? "bg-white border-gray-100 shadow-sm" : "bg-gray-50 border-transparent opacity-60"
      )}
    >
      {!isHeroBanner ? (
        <div 
          className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary transition-colors py-2 px-1"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      ) : (
        <div className="py-2 px-1 text-brand-gold opacity-50">
          <Layout className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-bold text-text-primary">{section.name}</h4>
          {section.count && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-text-muted rounded">
                Show {section.count} Products
              </span>
              <span className="text-[10px] font-medium text-text-muted italic">
                {section.productType === "all" ? "All Products" : 
                 section.productType === "category" ? `Category: ${section.productLink}` : 
                 section.productType === "sale" ? `${section.productLink}% OFF` : 
                 section.productType === "badge" ? `Badge: ${section.productLink}` :
                 `Custom Link`}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            section.active ? "text-success" : "text-text-muted"
          )}>
            {section.active ? "On" : "Off"}
          </span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={section.active} 
              onChange={onToggle}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onEdit}
            className="p-2 text-text-muted hover:text-brand-gold transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          {!isCategories && !isHeroBanner && (
            <button 
              onClick={onDelete}
              className="p-2 text-text-muted hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Reorder.Item>
  );
}
