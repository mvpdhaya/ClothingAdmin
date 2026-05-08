"use client";

import { useState } from "react";
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
  Upload
} from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { initialMainCategories, initialProducts } from "@/lib/data";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Section {
  id: number;
  name: string;
  active: boolean;
  type: "banner" | "products" | "categories" | "content";
  count?: number; // For products
  // Banner specific
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  alignment?: "left" | "center" | "right";
  // Product Grid specific
  source?: "all" | "category" | "manual";
  selectedCategory?: string;
  selectedProducts?: string[]; // Array of product IDs
}

const initialSections: Section[] = [
  { id: 1, name: "Hero Banner", active: true, type: "banner" },
  { id: 2, name: "New Arrivals", active: true, type: "products", count: 8, source: "all" },
  { id: 3, name: "Category Grid", active: true, type: "categories" },
  { id: 4, name: "Flash Sale", active: true, type: "products", count: 4, source: "category", selectedCategory: "Flash Sale" },
  { id: 5, name: "On Sale", active: false, type: "products", count: 4, source: "all" },
  { id: 6, name: "Testimonials", active: true, type: "content" },
  { id: 7, name: "Blog Posts", active: false, type: "content" },
  { id: 8, name: "Newsletter Banner", active: true, type: "banner" },
];

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const handleToggleSection = (id: number) => {
    setSections(sections.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleEditClick = (section: Section) => {
    setEditingSection({ ...section });
    setIsModalOpen(true);
  };

  const handleUpdateSection = () => {
    if (editingSection) {
      setSections(sections.map(s => s.id === editingSection.id ? editingSection : s));
      setIsModalOpen(false);
      setEditingSection(null);
    }
  };

  const handleAddSection = (type: "banner" | "products") => {
    const newId = Math.max(...sections.map(s => s.id)) + 1;
    const newSection: Section = type === "banner" 
      ? { 
          id: newId, 
          name: "New Banner", 
          active: true, 
          type: "banner",
          title: "Elevate Your Style",
          subtitle: "Discover our latest collection",
          buttonText: "Shop Now",
          alignment: "center",
          imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
        }
      : { 
          id: newId, 
          name: "New Product Grid", 
          active: true, 
          type: "products", 
          count: 4,
          source: "all"
        };
    
    setSections([...sections, newSection]);
    setIsAddModalOpen(false);
    // Automatically open edit modal for the new section
    setEditingSection(newSection);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingSection) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingSection({ ...editingSection, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-text-primary">Homepage Layout Builder</h2>
           <p className="text-sm text-text-muted mt-1">Drag sections to reorder. Toggle to show or hide on storefront.</p>
        </div>
        <button className="btn-primary">
          <Save className="w-4 h-4" />
          Save Layout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel - Sections Control */}
        <div className="lg:col-span-7 space-y-4">
           <div className="card">
             <Reorder.Group 
               axis="y" 
               values={sections} 
               onReorder={setSections}
               className="space-y-3"
               style={{ listStyle: "none", margin: 0, padding: 0 }}
             >
               {sections.map((section) => (
                 <SectionItem 
                   key={section.id} 
                   section={section} 
                   onToggle={() => handleToggleSection(section.id)}
                   onEdit={() => handleEditClick(section)}
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
                       <span className="text-xs font-bold tracking-tighter">LUMIÈRE</span>
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
                         ) : section.type === "products" ? (
                            <div className="space-y-2">
                               <div className="flex justify-between items-end">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold">{section.name}</span>
                                    <span className="text-[6px] text-text-muted font-bold uppercase tracking-wider">
                                      {section.source === "all" ? "All Products" : 
                                       section.source === "category" ? `Category: ${section.selectedCategory}` : 
                                       `Selected: ${section.selectedProducts?.length || 0} Products`}
                                    </span>
                                  </div>
                                  <span className="text-[8px] text-text-muted">See all</span>
                               </div>
                               <div className="grid grid-cols-2 gap-2">
                                  <div className="aspect-square bg-gray-100 rounded"></div>
                                  <div className="aspect-square bg-gray-100 rounded"></div>
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

              <div className="mt-8 flex gap-4">
                 <button className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors">
                    <Eye className="w-4 h-4" />
                    Full Screen Preview
                 </button>
                 <button className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors">
                    <Layout className="w-4 h-4" />
                    Reset to Default
                 </button>
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
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                  placeholder="e.g. Featured Products"
                />
              </div>

              {editingSection.type === "banner" && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Banner Image</label>
                    <div className="flex items-center gap-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-brand-gold/30 transition-all">
                       <div className="w-24 h-24 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100 shadow-sm">
                          {editingSection.imageUrl ? (
                            <img src={editingSection.imageUrl} className="w-full h-full object-cover" />
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
                               onChange={handleImageUpload}
                             />
                          </label>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title</label>
                      <input 
                        type="text" 
                        value={editingSection.title}
                        onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-xs outline-none focus:bg-white focus:border-brand-gold transition-all"
                        placeholder="e.g. New Arrivals"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle</label>
                      <input 
                        type="text" 
                        value={editingSection.subtitle}
                        onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-xs outline-none focus:bg-white focus:border-brand-gold transition-all"
                        placeholder="e.g. Explore the collection"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Text</label>
                      <input 
                        type="text" 
                        value={editingSection.buttonText}
                        onChange={(e) => setEditingSection({ ...editingSection, buttonText: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-xs outline-none focus:bg-white focus:border-brand-gold transition-all"
                        placeholder="e.g. Shop Now"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Link</label>
                      <input 
                        type="text" 
                        value={editingSection.buttonLink}
                        onChange={(e) => setEditingSection({ ...editingSection, buttonLink: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-xs outline-none focus:bg-white focus:border-brand-gold transition-all"
                        placeholder="e.g. /products/new"
                      />
                    </div>
                  </div>

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
                           onClick={() => setEditingSection({ ...editingSection, alignment: align.id as any })}
                           className={cn(
                             "flex-1 py-3 rounded-xl border flex items-center justify-center transition-all",
                             editingSection.alignment === align.id ? "bg-brand-gold border-brand-gold text-white" : "bg-gray-50 border-transparent text-text-muted hover:bg-gray-100"
                           )}
                         >
                           <align.icon className="w-5 h-5" />
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {editingSection.count !== undefined && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Product Source</label>
                    <div className="flex gap-2">
                       {[
                         { id: "all", label: "All Products" },
                         { id: "category", label: "By Category" },
                         { id: "manual", label: "Specific Products" },
                       ].map((source) => (
                         <button
                           key={source.id}
                           onClick={() => setEditingSection({ 
                             ...editingSection, 
                             source: source.id as any,
                             selectedCategory: source.id === "category" ? (editingSection.selectedCategory || initialMainCategories[0].name) : editingSection.selectedCategory,
                             selectedProducts: source.id === "manual" ? (editingSection.selectedProducts || []) : editingSection.selectedProducts
                           })}
                           className={cn(
                             "flex-1 py-2 px-3 rounded-xl border text-[10px] font-bold transition-all",
                             editingSection.source === source.id ? "bg-brand-sidebar border-brand-sidebar text-white shadow-md" : "bg-gray-50 border-transparent text-text-muted hover:bg-gray-100"
                           )}
                         >
                           {source.label}
                         </button>
                       ))}
                    </div>
                  </div>

                  {editingSection.source === "category" && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Select Category</label>
                      <select 
                        value={editingSection.selectedCategory}
                        onChange={(e) => setEditingSection({ ...editingSection, selectedCategory: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                      >
                        {initialMainCategories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {editingSection.source === "manual" && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Select Products</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                        <input 
                          type="text" 
                          placeholder="Search products..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-xs outline-none focus:bg-white focus:border-brand-gold transition-all"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                        {initialProducts
                          .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                          .map(product => {
                            const isSelected = !!editingSection.selectedProducts?.includes(product.id);
                            return (
                              <label 
                                key={product.id} 
                                className={cn(
                                  "flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                                  isSelected && "bg-brand-gold-light/20"
                                )}
                              >
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const isNowChecked = e.target.checked;
                                    const current = editingSection.selectedProducts || [];
                                    const updated = !isNowChecked 
                                      ? current.filter(id => id !== product.id)
                                      : [...current, product.id];
                                    setEditingSection({ ...editingSection, selectedProducts: updated });
                                  }}
                                  className="accent-brand-gold"
                                />
                                <img src={product.image} className="w-8 h-8 rounded border border-gray-100 object-cover" />
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-text-primary">{product.name}</p>
                                  <p className="text-[8px] text-text-muted">{product.category} · Rs.{product.price}</p>
                                </div>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />}
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Items to Show</label>
                    <input 
                      type="number" 
                      value={editingSection.count}
                      onChange={(e) => setEditingSection({ ...editingSection, count: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                    />
                    <p className="text-[10px] text-text-muted italic">Set the number of products to display in this grid.</p>
                  </div>
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
          <div className="w-full max-md bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
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

            <div className="p-8 grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleAddSection("banner")}
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-gray-50 hover:border-brand-gold/30 hover:bg-brand-gold-light/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                   <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-center">
                   <p className="text-sm font-bold text-text-primary">Promo Banner</p>
                   <p className="text-[10px] text-text-muted mt-0.5">Full-width display with text & CTAs</p>
                </div>
              </button>

              <button 
                onClick={() => handleAddSection("products")}
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-gray-100 hover:border-brand-gold/30 hover:bg-brand-gold-light/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <LayoutGrid className="w-6 h-6" />
                </div>
                <div className="text-center">
                   <p className="text-sm font-bold text-text-primary">Product Grid</p>
                   <p className="text-[10px] text-text-muted mt-0.5">Dynamic showcase of your products</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual reorderable items
function SectionItem({ section, onToggle, onEdit }: { 
  section: Section; 
  onToggle: () => void; 
  onEdit: () => void;
}) {
  const controls = useDragControls();

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
      <div 
        className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary transition-colors py-2 px-1"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-bold text-text-primary">{section.name}</h4>
          {section.count && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-text-muted rounded">
                Show {section.count} Products
              </span>
              <span className="text-[10px] font-medium text-text-muted italic">
                from {section.source === "all" ? "All Products" : 
                      section.source === "category" ? section.selectedCategory : 
                      `${section.selectedProducts?.length || 0} hand-picked`}
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
        <button 
          onClick={onEdit}
          className="p-2 text-text-muted hover:text-brand-gold transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
}
