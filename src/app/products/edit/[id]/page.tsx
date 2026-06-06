"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PRESET_COLORS } from "../../add/page";
import type { Product } from "@/lib/types";
import { Loader2 } from "lucide-react";
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
  Layers,
  Search
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Category, Subcategory } from "@/lib/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [productName, setProductName] = useState("Classic Silk Shirt");
  const [description, setDescription] = useState("A premium silk shirt with a classic fit. Perfect for formal and semi-formal occasions.");
  const [isOnSale, setIsOnSale] = useState(true);
  const [basePrice, setBasePrice] = useState(120);
  const [oldPrice, setOldPrice] = useState(150);
  const [totalStock, setTotalStock] = useState(45);
  const [images, setImages] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<{ file: File; url: string }[]>([]);
  const [sizeChart, setSizeChart] = useState<string | null>(null);
  const [originalSizeChart, setOriginalSizeChart] = useState<string | null>(null);
  const [newSizeChartFile, setNewSizeChartFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbSubcategories, setDbSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [existingBadges, setExistingBadges] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const router = useRouter();

  // Browser-level guard (refresh / tab close)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleNavigateAway = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      router.push("/products");
    }
  };

  // Browser back button support
  useEffect(() => {
    if (isDirty) {
      window.history.pushState(null, "", window.location.href);
      const handlePopState = (e: PopStateEvent) => {
        if (isDirty) {
          // Push state again to stay on page
          window.history.pushState(null, "", window.location.href);
          setShowDiscardModal(true);
        }
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [isDirty]);

  // Variants state
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [colors, setColors] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [showColorSuggestions, setShowColorSuggestions] = useState(false);
  const colorInputRef = useRef<HTMLDivElement>(null);
  const [variantInventory, setVariantInventory] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [productId]);

  const getVariantRows = () => {
    if (sizes.length > 0 && colors.length > 0) {
      return sizes.flatMap(size => 
        colors.map(colorName => ({
          key: `${size}-${colorName}`,
          size,
          colorName,
          display: (
            <div className="flex items-center gap-3">
              {(() => {
                const preset = PRESET_COLORS.find(c => c.name === colorName);
                return <div className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: preset?.hex ?? "#ccc" }}></div >;
              })()}
              <span className="text-sm font-bold text-text-primary">{size}</span>
              <span className="text-xs font-semibold text-text-secondary">{colorName}</span>
            </div>
          )
        }))
      );
    } else if (sizes.length > 0) {
      return sizes.map(size => ({
        key: size,
        size,
        colorName: null,
        display: (
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-text-primary">{size}</span>
          </div>
        )
      }));
    } else if (colors.length > 0) {
      return colors.map(colorName => ({
        key: colorName,
        size: null,
        colorName,
        display: (
          <div className="flex items-center gap-3">
            {(() => {
              const preset = PRESET_COLORS.find(c => c.name === colorName);
              return <div className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: preset?.hex ?? "#ccc" }}></div >;
            })()}
            <span className="text-sm font-bold text-text-primary">{colorName}</span>
          </div>
        )
      }));
    }
    return [];
  };

  // Keep total stock in sync with variant stock sum
  useEffect(() => {
    const hasVariants = sizes.length > 0 || colors.length > 0;
    if (hasVariants) {
      let totalStockSum = 0;
      const rows = getVariantRows();
      rows.forEach(row => {
        totalStockSum += variantInventory[row.key] || 0;
      });
      setTotalStock(totalStockSum);
    }
  }, [sizes, colors, variantInventory]);

  async function fetchCategories() {
    const { data: cats } = await supabase.from("categories").select("*").order("display_order");
    const { data: subs } = await supabase.from("subcategories").select("*").order("display_order");
    
    if (cats) setDbCategories(cats);
    if (subs) setDbSubcategories(subs);
  }

  async function fetchProduct() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (!error && data) {
      const p = data as any;
      setProductName(p.name);
      setDescription(p.description || "");
      setIsOnSale(!!p.old_price);
      setBasePrice(p.price);
      setOldPrice(p.old_price || 0);
      setTotalStock(p.stock);
      let loadedImages: string[] = [];
      if (p.images && p.images.length > 0) {
        loadedImages = p.images;
      } else {
        loadedImages = p.image ? [p.image] : [];
      }
      setImages(loadedImages);
      setOriginalImages(loadedImages);
      setSelectedCategory(p.category);
      setSelectedSubcategory(p.subcategory);
      setSizeChart(p.size_chart || null);
      setOriginalSizeChart(p.size_chart || null);
      if (p.sizes && p.sizes.length > 0) setSizes(p.sizes);
      if (p.badges) setExistingBadges(p.badges);
      if (p.colors && p.colors.length > 0) {
        setColors(p.colors.map((c: any) => {
          if (typeof c === 'object' && c !== null) {
            return c.name;
          }
          if (typeof c === 'string' && c.startsWith("#")) {
            const preset = PRESET_COLORS.find(pc => pc.hex.toLowerCase() === c.toLowerCase());
            return preset ? preset.name : c;
          }
          return c;
        }));
      }
      if (p.variant_inventory) {
        const cleanedInventory: Record<string, number> = {};
        Object.entries(p.variant_inventory).forEach(([key, qty]) => {
          const parts = key.split("-");
          if (parts.length === 2) {
            const [size, colorPart] = parts;
            if (colorPart.startsWith("#")) {
              const preset = PRESET_COLORS.find(pc => pc.hex.toLowerCase() === colorPart.toLowerCase());
              const nameKey = preset ? preset.name : colorPart;
              cleanedInventory[`${size}-${nameKey}`] = Number(qty);
            } else {
              cleanedInventory[key] = Number(qty);
            }
          } else {
            cleanedInventory[key] = Number(qty);
          }
        });
        setVariantInventory(cleanedInventory);
      }
    }
    setLoading(false);
  }

  // Derived categories object for easy lookup
  const categories: Record<string, string[]> = {};
  dbCategories.forEach(cat => {
    categories[cat.name] = dbSubcategories
      .filter(sub => sub.category_id === cat.id)
      .map(sub => sub.name);
  });
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewImageFiles([...newImageFiles, { file, url }]);
      setImages([...images, url]);
      setIsDirty(true);
    }
  };

  const handleSizeChartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSizeChartFile(file);
      setSizeChart(URL.createObjectURL(file));
      setIsDirty(true);
    }
  };

  const addSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize("");
      setIsDirty(true);
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
    setIsDirty(true);
  };

  const addColor = (colorName: string) => {
    if (!colors.includes(colorName)) {
      setColors([...colors, colorName]);
      setIsDirty(true);
    }
    setColorSearch("");
    setShowColorSuggestions(false);
  };

  const removeColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
    setIsDirty(true);
  };

  const filteredColorSuggestions = colorSearch.trim().length > 0
    ? PRESET_COLORS.filter(
        c => c.name.toLowerCase().includes(colorSearch.toLowerCase()) && !colors.includes(c.name)
      )
    : [];

  const updateVariantQty = (key: string, qty: number) => {
    setVariantInventory({
      ...variantInventory,
      [key]: qty
    });
    setIsDirty(true);
  };

  const handleUpdate = async () => {
    if (!productName || !basePrice || !totalStock || !selectedSubcategory) {
      alert("Please fill in all required fields (Name, Price, Stock, Sub-category)");
      return;
    }

    setIsUpdating(true);
    
    try {
      // 1. Upload NEW images to Supabase Storage if any
      const uploadedUrls: string[] = [];
      for (const item of newImageFiles) {
        const { file } = item;
        const fileExt = file.name.split('.').pop();
        const cleanBaseName = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `${productId}-${cleanBaseName}.${fileExt}`;
        const filePath = `${fileName}`;

        // Check if file already exists in the bucket to prevent duplicate uploads
        const { data: existingFiles } = await supabase.storage
          .from('Products')
          .list('', {
            search: fileName
          });
        const exists = existingFiles?.some(f => f.name === fileName) ?? false;

        if (!exists) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Products')
            .upload(filePath, file);

          if (uploadError) throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('Products')
          .getPublicUrl(filePath);
          
        uploadedUrls.push(publicUrl);
      }

      // Reconstruct final images list preserving order, deletion, and newly uploaded public URLs
      const finalImageUrls = images.map(img => {
        if (img.startsWith('blob:')) {
          const uploadedItem = newImageFiles.find(item => item.url === img);
          if (uploadedItem) {
            const index = newImageFiles.indexOf(uploadedItem);
            return uploadedUrls[index];
          }
          return null;
        }
        return img;
      }).filter(Boolean) as string[];

      const finalImageUrl = finalImageUrls[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop";

      // 2. Upload NEW size chart if any
      let finalSizeChartUrl = sizeChart;

      if (newSizeChartFile) {
        const fileExt = newSizeChartFile.name.split('.').pop();
        const fileName = `sizechart-${productId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Products')
          .upload(filePath, newSizeChartFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('Products')
          .getPublicUrl(filePath);
          
        finalSizeChartUrl = publicUrl;
      }

      // 3. Update Database
      const stockStatus = totalStock === 0 ? "Out of Stock" : totalStock < 10 ? "Low Stock" : "In Stock";
      
      // Calculate discount if applicable
      let discount = "";
      if (isOnSale && oldPrice && oldPrice > basePrice) {
        const disc = Math.round(((oldPrice - basePrice) / oldPrice) * 100);
        discount = `${disc}%`;
      }

      const mappedColors = colors.map(colorName => {
        const preset = PRESET_COLORS.find(c => c.name === colorName);
        return {
          name: colorName,
          hex: preset?.hex || "#CCCCCC"
        };
      });

      // Filter variant inventory to only include current sizes/colors
      const filteredInventory: Record<string, number> = {};
      const rows = getVariantRows();
      rows.forEach(row => {
        if (variantInventory[row.key] !== undefined) {
          filteredInventory[row.key] = variantInventory[row.key];
        }
      });

       const { error } = await supabase
        .from("products")
        .update({
          name: productName,
          description,
          category: selectedCategory,
          subcategory: selectedSubcategory,
          price: basePrice,
          old_price: isOnSale ? oldPrice : null,
          discount: discount || null,
          stock: totalStock,
          stock_status: stockStatus,
          image: finalImageUrl,
          images: finalImageUrls,
          size_chart: finalSizeChartUrl,
          sizes,
          colors: mappedColors,
          variant_inventory: filteredInventory,
          badges: (() => {
            let updatedBadges = [...existingBadges];
            if (isOnSale && !updatedBadges.includes("SALE")) {
              updatedBadges.push("SALE");
            } else if (!isOnSale && updatedBadges.includes("SALE")) {
              updatedBadges = updatedBadges.filter(b => b !== "SALE");
            }
            return updatedBadges;
          })(),
        })
        .eq("id", productId);

      if (error) throw error;

      // 4. Clean up removed assets from storage bucket
      const getFilePathFromUrl = (url: string) => {
        const marker = '/Products/';
        const index = url.indexOf(marker);
        if (index !== -1) {
          return decodeURIComponent(url.substring(index + marker.length));
        }
        return null;
      };

      const removedFiles: string[] = [];

      originalImages.forEach(img => {
        if (!finalImageUrls.includes(img)) {
          const path = getFilePathFromUrl(img);
          if (path) removedFiles.push(path);
        }
      });

      if (originalSizeChart && originalSizeChart !== finalSizeChartUrl) {
        const path = getFilePathFromUrl(originalSizeChart);
        if (path) removedFiles.push(path);
      }

      if (removedFiles.length > 0) {
        await supabase.storage
          .from('Products')
          .remove(removedFiles);
      }

      router.push("/products");

    } catch (error: any) {
      console.error("Error updating product:", error);
      alert("Error updating product: " + error.message);
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleNavigateAway}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-text-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Edit Product</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Product ID:</span>
              <span className="text-xs font-mono font-bold text-brand-gold bg-brand-gold-light px-2 py-0.5 rounded">
                {productId}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleNavigateAway}
            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-50 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleUpdate}
            disabled={isUpdating || loading}
            className="px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUpdating ? "Updating..." : "Update Product"}
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
                  value={productName}
                  onChange={(e) => { setProductName(e.target.value); setIsDirty(true); }}
                  placeholder="e.g. Premium Silk Evening Gown"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-secondary">Description</label>
                <textarea 
                  rows={6}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
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
                  <input type="checkbox" checked={isOnSale} onChange={(e) => {
                    setIsOnSale(e.target.checked);
                    setIsDirty(true);
                  }} />
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
                    value={basePrice}
                    onChange={(e) => {
                      setBasePrice(Number(e.target.value));
                      setIsDirty(true);
                    }}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all font-bold"
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
                      value={oldPrice}
                      onChange={(e) => {
                        setOldPrice(Number(e.target.value));
                        setIsDirty(true);
                      }}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all font-bold line-through"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-secondary">Total Stock Quantity</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={totalStock}
                    onChange={(e) => {
                      setTotalStock(Number(e.target.value));
                      setIsDirty(true);
                    }}
                    placeholder="0"
                    disabled={sizes.length > 0 || colors.length > 0}
                    className={cn(
                      "w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all font-bold",
                      (sizes.length > 0 || colors.length > 0) && "opacity-60 cursor-not-allowed"
                    )}
                  />
                </div>
                {(sizes.length > 0 || colors.length > 0) && (
                  <span className="text-[10px] font-bold text-brand-gold mt-1 uppercase tracking-wider animate-fade-in">
                    Calculated from variant stocks
                  </span>
                )}
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
                  {colors.map(colorName => {
                    const preset = PRESET_COLORS.find(c => c.name === colorName);
                    return (
                      <div key={colorName} className="group relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-2 pr-7 py-1.5 hover:border-brand-gold transition-all">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: preset?.hex ?? "#ccc" }}
                        />
                        <span className="text-xs font-bold text-text-primary">{colorName}</span>
                        <button
                          onClick={() => removeColor(colorName)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Color name search */}
                <div className="relative" ref={colorInputRef}>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus-within:bg-white focus-within:border-brand-gold transition-all">
                    <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <input
                      type="text"
                      value={colorSearch}
                      onChange={(e) => {
                        setColorSearch(e.target.value);
                        setShowColorSuggestions(true);
                      }}
                      onFocus={() => setShowColorSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowColorSuggestions(false), 150)}
                      placeholder="Type a color name..."
                      className="flex-1 bg-transparent text-xs font-bold outline-none text-text-primary placeholder:text-text-muted"
                    />
                  </div>

                  {/* Suggestions dropdown */}
                  {showColorSuggestions && filteredColorSuggestions.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto animate-fade-in">
                      {filteredColorSuggestions.map(c => (
                        <button
                          key={c.name}
                          type="button"
                          onMouseDown={() => addColor(c.name)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-gold-light transition-colors text-left"
                        >
                          <div
                            className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-sm font-semibold text-text-primary">{c.name}</span>
                          <span className="text-[10px] font-mono text-text-muted ml-auto">{c.hex}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No match message */}
                  {showColorSuggestions && colorSearch.trim().length > 0 && filteredColorSuggestions.length === 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
                      <p className="text-xs text-text-muted font-bold">No matching color found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Variant Specific Inventory Table */}
            {(sizes.length > 0 || colors.length > 0) && (
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
                      {getVariantRows().map(row => (
                        <tr key={row.key} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            {row.display}
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="number" 
                              placeholder="0"
                              value={variantInventory[row.key] || ""}
                              onChange={(e) => updateVariantQty(row.key, parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold outline-none focus:border-brand-gold transition-all"
                            />
                          </td>
                        </tr>
                      ))}
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
                    onClick={() => {
                      const deletedUrl = images[i];
                      setImages(images.filter((_, idx) => idx !== i));
                      setNewImageFiles(newImageFiles.filter(item => item.url !== deletedUrl));
                      setIsDirty(true);
                    }}
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
                  onClick={() => {
                    setSizeChart(null);
                    setIsDirty(true);
                  }}
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
                      setIsDirty(true);
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
                    onChange={(e) => {
                      setSelectedSubcategory(e.target.value);
                      setIsDirty(true);
                    }}
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

      {/* Discard Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm" onClick={() => setShowDiscardModal(false)} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Discard Changes?</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                You have unsaved changes. Are you sure you want to discard them?
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 px-6 py-4 text-sm font-bold text-text-muted hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setIsDirty(false); router.push("/products"); }}
                className="flex-1 px-6 py-4 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors border-l border-gray-100"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-gold animate-spin mb-4" />
          <p className="text-sm font-bold text-text-muted">Loading product details...</p>
        </div>
      )}
    </div>
  );
}
