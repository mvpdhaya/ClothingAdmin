"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

export const PRESET_COLORS: { name: string; hex: string }[] = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Champagne", hex: "#F7E7CE" },
  { name: "Sand", hex: "#C2B280" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Chocolate", hex: "#7B3F00" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Wine", hex: "#722F37" },
  { name: "Maroon", hex: "#800000" },
  { name: "Red", hex: "#FF0000" },
  { name: "Crimson", hex: "#DC143C" },
  { name: "Coral", hex: "#FF6B6B" },
  { name: "Peach", hex: "#FFCBA4" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Hot Pink", hex: "#FF69B4" },
  { name: "Rose", hex: "#FF007F" },
  { name: "Blush", hex: "#DE5D83" },
  { name: "Mauve", hex: "#E0B0FF" },
  { name: "Lavender", hex: "#E6E6FA" },
  { name: "Purple", hex: "#800080" },
  { name: "Violet", hex: "#EE82EE" },
  { name: "Plum", hex: "#DDA0DD" },
  { name: "Lilac", hex: "#C8A2C8" },
  { name: "Navy", hex: "#001F5B" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Baby Blue", hex: "#89CFF0" },
  { name: "Teal", hex: "#008080" },
  { name: "Turquoise", hex: "#40E0D0" },
  { name: "Mint", hex: "#98FF98" },
  { name: "Sage", hex: "#B2AC88" },
  { name: "Olive", hex: "#808000" },
  { name: "Forest Green", hex: "#228B22" },
  { name: "Green", hex: "#008000" },
  { name: "Lime", hex: "#00FF00" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Mustard", hex: "#FFDB58" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Rust", hex: "#B7410E" },
  { name: "Terracotta", hex: "#E2725B" },
  { name: "Grey", hex: "#808080" },
  { name: "Light Grey", hex: "#D3D3D3" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Denim", hex: "#1560BD" },
  { name: "Indigo", hex: "#4B0082" },
  { name: "Emerald", hex: "#50C878" },
  { name: "Copper", hex: "#B87333" },
  { name: "Bronze", hex: "#CD7F32" },
  { name: "Nude", hex: "#F2C8A0" },
];

export default function AddProductPage() {
  const [productId, setProductId] = useState("");
  const [isOnSale, setIsOnSale] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);
  const [sizeChartPreview, setSizeChartPreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbSubcategories, setDbSubcategories] = useState<Subcategory[]>([]);

  // Variants state
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [showColorSuggestions, setShowColorSuggestions] = useState(false);
  const colorInputRef = useRef<HTMLDivElement>(null);
  const [variantInventory, setVariantInventory] = useState<Record<string, number>>({});
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Derived categories object for easy lookup
  const categories: Record<string, string[]> = {};
  dbCategories.forEach(cat => {
    categories[cat.name] = dbSubcategories
      .filter(sub => sub.category_id === cat.id)
      .map(sub => sub.name);
  });
  
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data: cats } = await supabase.from("categories").select("*").order("display_order");
    const { data: subs } = await supabase.from("subcategories").select("*").order("display_order");
    
    if (cats) {
      setDbCategories(cats);
      if (cats.length > 0) setSelectedCategory(cats[0].name);
    }
    if (subs) setDbSubcategories(subs);
  }
  
  // Auto-generate ID on mount
  useEffect(() => {
    const randomId = "PROD-" + Math.floor(1000 + Math.random() * 9000);
    setProductId(randomId);
  }, []);

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

  // Keep total stock quantity calculated automatically if variants are defined
  useEffect(() => {
    const hasVariants = sizes.length > 0 || colors.length > 0;
    if (hasVariants) {
      let totalStockSum = 0;
      const rows = getVariantRows();
      rows.forEach(row => {
        totalStockSum += variantInventory[row.key] || 0;
      });
      setStock(totalStockSum.toString());
      if (errors.stock) setErrors(prev => ({ ...prev, stock: "" }));
    }
  }, [sizes, colors, variantInventory]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const totalCount = imageFiles.length + newFiles.length;
      if (totalCount > 4) {
        alert("You can only upload up to 4 images in total.");
        const allowedCount = 4 - imageFiles.length;
        if (allowedCount <= 0) return;
        newFiles.splice(allowedCount);
      }
      setImageFiles([...imageFiles, ...newFiles]);
      const urls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...urls]);
    }
  };

  const handleSizeChartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSizeChartFile(file);
      setSizeChartPreview(URL.createObjectURL(file));
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

  const addColor = (colorName: string) => {
    if (!colors.includes(colorName)) {
      setColors([...colors, colorName]);
    }
    setColorSearch("");
    setShowColorSuggestions(false);
  };

  const removeColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
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
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name is required";
    if (!price || parseFloat(price) <= 0) newErrors.price = "Price must be a valid number greater than 0";
    if (!stock || parseInt(stock) < 0) newErrors.stock = "Stock quantity must be a non-negative number";
    if (!selectedSubcategory) newErrors.subcategory = "Sub-category is required";
    if (imageFiles.length === 0) newErrors.images = "At least one product image is required";


    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    
    try {
      // 1. Upload Images to Supabase Storage
      const uploadedImageUrls: string[] = [];
      
      for (const file of imageFiles) {
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
          
        uploadedImageUrls.push(publicUrl);
      }

      // 2. Upload Size Chart if exists
      let uploadedSizeChartUrl = null;
      if (sizeChartFile) {
        const fileExt = sizeChartFile.name.split('.').pop();
        const fileName = `sizechart-${productId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Products')
          .upload(filePath, sizeChartFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('Products')
          .getPublicUrl(filePath);
          
        uploadedSizeChartUrl = publicUrl;
      }

      // 3. Calculate stock status
      const stockNum = parseInt(stock);
      const stockStatus = stockNum === 0 ? "Out of Stock" : stockNum < 10 ? "Low Stock" : "In Stock";
      
      // Calculate discount if applicable
      let discount = "";
      if (isOnSale && oldPrice && parseFloat(oldPrice) > parseFloat(price)) {
        const disc = Math.round(((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) * 100);
        discount = `${disc}%`;
      }

      // 3. Insert into Database
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

      const { error } = await supabase.from("products").insert({
        id: productId,
        name,
        description,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        price: parseFloat(price),
        old_price: isOnSale ? parseFloat(oldPrice) : null,
        discount: discount || null,
        stock: stockNum,
        stock_status: stockStatus,
        status: "Active",
        badges: uploadedImageUrls.length > 0 ? ["NEW"] : [],
        image: uploadedImageUrls[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop",
        images: uploadedImageUrls,
        size_chart: uploadedSizeChartUrl,
        sizes,
        colors: mappedColors,
        variant_inventory: filteredInventory,
      });

      if (error) throw error;
      router.push("/products");

    } catch (error: any) {
      console.error("Error creating product:", error);
      alert("Error creating product: " + error.message);
      setIsSubmitting(false);
    }
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
          <button 
            type="button"
            onClick={() => router.push("/products")}
            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-50 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Product"}
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
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g. Premium Silk Evening Gown"
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all",
                    errors.name && "border-rose-500 bg-rose-50/10 focus:border-rose-500"
                  )}
                />
                {errors.name && <span className="text-xs font-bold text-rose-500 mt-1">{errors.name}</span>}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-secondary">Description</label>
                <textarea 
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors(prev => ({ ...prev, price: "" }));
                    }}
                    placeholder="0.00"
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all font-bold",
                      errors.price && "border-rose-500 bg-rose-50/10 focus:border-rose-500"
                    )}
                  />
                </div>
                {errors.price && <span className="text-xs font-bold text-rose-500 mt-1">{errors.price}</span>}
              </div>

              {isOnSale && (
                <div className="flex flex-col gap-2 animate-fade-in">
                  <label className="text-sm font-bold text-text-secondary">Old Price (M.R.P)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">Rs.</span>
                    <input 
                      type="number" 
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
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
                    value={stock}
                    onChange={(e) => {
                      setStock(e.target.value);
                      if (errors.stock) setErrors(prev => ({ ...prev, stock: "" }));
                    }}
                    placeholder="0"
                    disabled={sizes.length > 0 || colors.length > 0}
                    className={cn(
                      "w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all font-bold",
                      (sizes.length > 0 || colors.length > 0) && "opacity-60 cursor-not-allowed",
                      errors.stock && "border-rose-500 bg-rose-50/10 focus:border-rose-500"
                    )}
                  />
                </div>
                {errors.stock && <span className="text-xs font-bold text-rose-500 mt-1">{errors.stock}</span>}
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
                    className={cn(
                      "flex-1 px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-xs outline-none focus:bg-white focus:border-brand-gold transition-all font-bold",
                      errors.sizes && "border-rose-500 bg-rose-50/10 focus:border-rose-500"
                    )}
                  />
                  <button 
                    onClick={() => {
                      addSize();
                      if (errors.sizes) setErrors(prev => ({ ...prev, sizes: "" }));
                    }}
                    className="p-2 bg-brand-sidebar text-white rounded-lg hover:brightness-110 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {errors.sizes && <p className="text-xs font-bold text-rose-500 mt-1">{errors.sizes}</p>}
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
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus-within:bg-white focus-within:border-brand-gold transition-all",
                    errors.colors && "border-rose-500 bg-rose-50/10 focus-within:border-rose-500"
                  )}>
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
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                      {filteredColorSuggestions.map(c => (
                        <button
                          key={c.name}
                          type="button"
                          onMouseDown={() => {
                            addColor(c.name);
                            if (errors.colors) setErrors(prev => ({ ...prev, colors: "" }));
                          }}
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
                {errors.colors && <p className="text-xs font-bold text-rose-500 mt-1">{errors.colors}</p>}
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
                              value={variantInventory?.[row.key] || ""}
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
              {imagePreviews.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group">
                  <img src={img} alt="product" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => {
                      setImagePreviews(imagePreviews.filter((_, idx) => idx !== i));
                      const remainingFiles = imageFiles.filter((_, idx) => idx !== i);
                      setImageFiles(remainingFiles);
                      if (remainingFiles.length === 0) {
                        setErrors(prev => ({ ...prev, images: "At least one product image is required" }));
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imagePreviews.length < 4 && (
                <label className={cn(
                  "aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-brand-gold/50 hover:bg-brand-gold-light/20 transition-all cursor-pointer group",
                  errors.images && "border-rose-500 bg-rose-50/10 hover:border-rose-500"
                )}>
                  <Upload className="w-5 h-5 text-text-muted group-hover:text-brand-gold transition-colors" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest group-hover:text-brand-gold">Upload</span>
                  <input type="file" className="hidden" multiple onChange={(e) => {
                    handleImageUpload(e);
                    if (errors.images) setErrors(prev => ({ ...prev, images: "" }));
                  }} accept="image/*" />
                </label>
              )}
            </div>
            {errors.images && <p className="text-xs font-bold text-rose-500 mt-1">{errors.images}</p>}
            <p className="text-[10px] text-text-muted leading-relaxed">
              Add up to 4 images. Recommended size: 1080x1080px.
            </p>
          </div>

          {/* Size Chart */}
          <div className="card space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Size Chart</h3>
            {sizeChartPreview ? (
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group">
                <img src={sizeChartPreview} alt="size chart" className="w-full h-full object-cover" />
                <button 
                  onClick={() => {
                    setSizeChartPreview(null);
                    setSizeChartFile(null);
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
                      if (errors.subcategory) setErrors(prev => ({ ...prev, subcategory: "" }));
                    }}
                    className={cn(
                      "w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all appearance-none cursor-pointer pr-10 font-medium disabled:opacity-50 disabled:cursor-not-allowed",
                      errors.subcategory && "border-rose-500 bg-rose-50/10 focus:border-rose-500"
                    )}
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
                {errors.subcategory && <span className="text-xs font-bold text-rose-500 mt-1">{errors.subcategory}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
