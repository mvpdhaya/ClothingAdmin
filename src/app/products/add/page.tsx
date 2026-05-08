"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  ImageIcon,
  Info,
  DollarSign,
  Tag,
  ChevronDown,
  Palette,
  Layers
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { initialMainCategories, initialSubcategoriesData } from "@/lib/data";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AddProductPage() {
  const [productId, setProductId] = useState("");
  const [isOnSale, setIsOnSale] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [sizeChart, setSizeChart] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Clothing");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  // Variants state
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [colors, setColors] = useState<string[]>(["#000000", "#FFFFFF", "#C9A96E"]);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [variantInventory, setVariantInventory] = useState<Record<string, number>>({});

  const categories: Record<string, string[]> = {};
  initialMainCategories.forEach(cat => {
    categories[cat.name] = (initialSubcategoriesData as any)[cat.name]?.map((s: any) => s.name) || [];
  });
  
  // Auto-generate ID on mount
  useEffect(() => {
    const randomId = "PROD-" + Math.floor(1000 + Math.random() * 9000);
    setProductId(randomId);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImages([...images, url]);
    }
  };

  const handleSizeChartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSizeChart(URL.createObjectURL(file));
    }
  };

  const addSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize("");
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
  };

  const addColor = () => {
    if (!colors.includes(newColor)) {
      setColors([...colors, newColor]);
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
  };

  const updateVariantQty = (size: string, color: string, qty: number) => {
    setVariantInventory({
      ...variantInventory,
      [`${size}-${color}`]: qty
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/products" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-text-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Add New Product</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Product ID:</span>
              <span className="text-xs font-mono font-bold text-brand-gold bg-brand-gold-light px-2 py-0.5 rounded">
                {productId}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-50 transition-colors">
            Discard
          </button>
          <button className="px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20">
            Create Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information */}
          <div className="card space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-gold" />
              General Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-secondary">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Premium Silk Evening Gown"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-secondary">Description</label>
                <textarea 
                  rows={6}
                  placeholder="Describe the product material, fit, and style..."
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="card space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-gold" />
                Pricing & Total Stock
              </h3>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isOnSale ? "text-rose-500" : "text-text-muted"
                )}>
                  On Sale
                </span>
                <label className="switch">
                  <input type="checkbox" onChange={(e) => setIsOnSale(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-secondary">
                  {isOnSale ? "Sale Price" : "Base Price"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">Rs.</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all font-bold"
                  />
                </div>
              </div>

              {isOnSale && (
                <div className="flex flex-col gap-2 animate-fade-in">
                  <label className="text-sm font-bold text-text-secondary">Old Price (M.R.P)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">Rs.</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all font-bold line-through"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-secondary">Total Stock Quantity</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Variants Management */}
          <div className="card space-y-8">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Tag className="w-5 h-5 text-brand-gold" />
              Product Variants & Stock
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sizes Management */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <div key={size} className="group relative">
                      <button className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold bg-white text-text-primary group-hover:border-brand-gold transition-all">
                        {size}
                      </button>
                      <button 
                        onClick={() => removeSize(size)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <input 
                    type="text" 
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value.toUpperCase())}
                    placeholder="e.g. XXL"
                    className="flex-1 px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-xs outline-none focus:bg-white focus:border-brand-gold transition-all font-bold"
                  />
                  <button 
                    onClick={addSize}
                    className="p-2 bg-brand-sidebar text-white rounded-lg hover:brightness-110 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Colors Management */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Available Colors</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => (
                    <div key={color} className="group relative">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                        style={{ backgroundColor: color }}
                      ></div>
                      <button 
                        onClick={() => removeColor(color)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 relative overflow-hidden rounded-lg">
                    <input 
                      type="color" 
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer"
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center px-3 gap-2 bg-gray-50 border border-transparent rounded-lg">
                       <Palette className="w-3 h-3 text-text-muted" />
                       <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{newColor}</span>
                    </div>
                  </div>
                  <button 
                    onClick={addColor}
                    className="p-2 bg-brand-sidebar text-white rounded-lg hover:brightness-110 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Variant Specific Inventory Table */}
            {sizes.length > 0 && colors.length > 0 && (
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-gold" />
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest">Variant-Specific Stock</h4>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      <tr>
                        <th className="px-4 py-3">Variant (Size/Color)</th>
                        <th className="px-4 py-3 w-40">Stock Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sizes.flatMap(size => 
                        colors.map(color => (
                          <tr key={`${size}-${color}`} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border border-gray-100" style={{ backgroundColor: color }}></div>
                                <span className="text-sm font-bold text-text-primary">{size}</span>
                                <span className="text-[10px] text-text-muted font-mono uppercase">{color}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="number" 
                                placeholder="0"
                                value={variantInventory[`${size}-${color}`] || ""}
                                onChange={(e) => updateVariantQty(size, color, parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold outline-none focus:border-brand-gold transition-all"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Media & Organization */}
        <div className="space-y-8">
          {/* Media */}
          <div className="card space-y-6">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Media</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group">
                  <img src={img} alt="product" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 p-1 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-brand-gold/50 hover:bg-brand-gold-light/20 transition-all cursor-pointer group">
                  <Upload className="w-5 h-5 text-text-muted group-hover:text-brand-gold transition-colors" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest group-hover:text-brand-gold">Upload</span>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              )}
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed">
              Add up to 4 images. Recommended size: 1080x1080px.
            </p>
          </div>

          {/* Size Chart */}
          <div className="card space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Size Chart</h3>
            {sizeChart ? (
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group">
                <img src={sizeChart} alt="size chart" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSizeChart(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full py-12 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 hover:border-brand-gold/50 hover:bg-brand-gold-light/20 transition-all cursor-pointer group">
                <div className="p-3 bg-gray-50 rounded-full group-hover:bg-brand-gold/10 transition-colors">
                  <ImageIcon className="w-6 h-6 text-text-muted group-hover:text-brand-gold" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-text-primary">Upload Size Chart</p>
                  <p className="text-[10px] text-text-muted mt-1">PNG, JPG up to 5MB</p>
                </div>
                <input type="file" className="hidden" onChange={handleSizeChartUpload} accept="image/*" />
              </label>
            )}
          </div>

          {/* Organization */}
          <div className="card space-y-6">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Organization</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary">Category</label>
                <div className="relative group">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubcategory(""); // Reset subcategory
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all appearance-none cursor-pointer pr-10 font-medium"
                  >
                    {Object.keys(categories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-brand-gold transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary">Sub-category</label>
                <div className="relative group">
                  <select 
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all appearance-none cursor-pointer pr-10 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedCategory}
                  >
                    <option value="" disabled>Select Sub-category</option>
                    {categories[selectedCategory as keyof typeof categories]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-brand-gold transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
