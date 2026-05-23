"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X as CloseIcon,
  SlidersHorizontal,
  RotateCcw,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [deleteModalConfig, setDeleteModalConfig] = useState<{ id: string | null; name: string | null; isBulk: boolean } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [stockStatus, setStockStatus] = useState("All");
  const [productStatus, setProductStatus] = useState("All");

  const [dynamicTabs, setDynamicTabs] = useState<string[]>(["All"]);
  const [flashSaleActive, setFlashSaleActive] = useState(false);
  const [flashSaleProductIds, setFlashSaleProductIds] = useState<string[]>([]);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchTabsData() {
    const { data: catData } = await supabase.from('categories').select('name').order('display_order');
    const { data: fsData } = await supabase.from('flash_sale_settings').select('active').eq('id', 1).single();

    let newTabs = ["All"];
    if (catData) {
      newTabs.push(...catData.map(c => c.name));
    }
    if (fsData && fsData.active) {
      newTabs.push("Flash Sale");
    }
    setDynamicTabs(newTabs);
  }

  async function fetchFlashSaleInfo() {
    const { data: fsSettings } = await supabase.from('flash_sale_settings').select('active').eq('id', 1).single();
    const { data: fsItems } = await supabase.from('flash_sale_items').select('product_id');

    if (fsSettings) {
      setFlashSaleActive(fsSettings.active);
    }
    if (fsItems) {
      setFlashSaleProductIds(fsItems.map(item => item.product_id));
    }
  }

  const getProductBadges = (product: Product) => {
    const list: string[] = [];
    
    // 1. NEW - Product added within last 30 days
    const createdDate = new Date(product.created_at).getTime();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - createdDate < thirtyDaysInMs) {
      list.push("NEW");
    }

    // 2. SALE - on sale (old_price and new price both exist, and old_price > price)
    if (product.old_price && product.old_price > product.price) {
      list.push("SALE");
    }

    // 3. FLASH - product added in flash sale and flash sale is active
    if (flashSaleActive && flashSaleProductIds.includes(product.id)) {
      list.push("FLASH");
    }

    return list;
  };

  useEffect(() => {
    fetchProducts();
    fetchTabsData();
    fetchFlashSaleInfo();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }

  const filteredProducts = products.filter(product => {
    const badges = getProductBadges(product);
    const matchesTab = activeTab === "All"
      ? true
      : activeTab === "Flash Sale"
        ? badges.some(b => ["SALE", "FLASH"].includes(b))
        : product.category === activeTab;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.subcategory.toLowerCase().includes(query);

    const matchesPrice =
      (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
      (!priceRange.max || product.price <= parseFloat(priceRange.max));

    const matchesStock = stockStatus === "All" || product.stock_status === stockStatus;
    const matchesStatus = productStatus === "All" || product.status === productStatus;

    return matchesTab && matchesSearch && matchesPrice && matchesStock && matchesStatus;
  });

  const resetFilters = () => {
    setPriceRange({ min: "", max: "" });
    setStockStatus("All");
    setProductStatus("All");
    setSearchQuery("");
  };

  const activeFiltersCount =
    (priceRange.min || priceRange.max ? 1 : 0) +
    (stockStatus !== "All" ? 1 : 0) +
    (productStatus !== "All" ? 1 : 0);

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredProducts.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteModalConfig({ id: product.id, name: product.name, isBulk: false });
  };

  const handleBulkDeleteClick = () => {
    setDeleteModalConfig({ id: null, name: `${selectedRows.length} items`, isBulk: true });
  };

  const getFilePathFromUrl = (url: string) => {
    const marker = '/Products/';
    const index = url.indexOf(marker);
    if (index !== -1) {
      return decodeURIComponent(url.substring(index + marker.length));
    }
    return null;
  };

  const deleteProductAssets = async (productsToDelete: Product[]) => {
    try {
      const filesToDelete: string[] = [];
      productsToDelete.forEach(product => {
        if (product.image) {
          const path = getFilePathFromUrl(product.image);
          if (path) filesToDelete.push(path);
        }
        if ((product as any).images && Array.isArray((product as any).images)) {
          (product as any).images.forEach((img: string) => {
            const path = getFilePathFromUrl(img);
            if (path) filesToDelete.push(path);
          });
        }
        if (product.size_chart) {
          const path = getFilePathFromUrl(product.size_chart);
          if (path) filesToDelete.push(path);
        }
      });

      const uniqueFiles = Array.from(new Set(filesToDelete));
      if (uniqueFiles.length > 0) {
        const { error } = await supabase.storage
          .from('Products')
          .remove(uniqueFiles);
        if (error) {
          console.error("Error deleting files from bucket:", error);
        }
      }
    } catch (err) {
      console.error("Failed asset cleanup:", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModalConfig) return;

    try {
      if (deleteModalConfig.isBulk) {
        const productsToDelete = products.filter(p => selectedRows.includes(p.id));
        await deleteProductAssets(productsToDelete);

        const { error } = await supabase
          .from("products")
          .delete()
          .in("id", selectedRows);
        if (!error) {
          setProducts(prev => prev.filter(p => !selectedRows.includes(p.id)));
          setSelectedRows([]);
        }
      } else if (deleteModalConfig.id) {
        const productToDelete = products.find(p => p.id === deleteModalConfig.id);
        if (productToDelete) {
          await deleteProductAssets([productToDelete]);
        }

        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", deleteModalConfig.id);
        if (!error) {
          setProducts(prev => prev.filter(p => p.id !== deleteModalConfig.id));
          setSelectedRows(prev => prev.filter(id => id !== deleteModalConfig.id));
        }
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
    setDeleteModalConfig(null);
  };

  const handleStatusToggle = async (product: Product) => {
    const newStatus = product.status === "Active" ? "Draft" : "Active";
    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", product.id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-text-primary">Products</h2>
          <span className="px-2 py-0.5 bg-gray-100 text-text-muted text-xs font-bold rounded-full">
            {products.length} Total
          </span>
        </div>
        <Link href="/products/add" className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide">
          {dynamicTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-sm font-bold transition-all relative",
                activeTab === tab ? "text-brand-gold" : "text-text-muted hover:text-text-secondary"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold animate-fade-in"></div>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pb-4 lg:pb-0 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-gold transition-colors shadow-sm"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "p-2 rounded-lg transition-all border shadow-sm relative group",
                activeFiltersCount > 0
                  ? "bg-brand-gold-light border-brand-gold text-brand-gold"
                  : "text-text-muted hover:bg-gray-100 border-gray-200 bg-white"
              )}
            >
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Filter Popover */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] animate-fade-in flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
                    <h3 className="text-sm font-bold text-text-primary">Filters</h3>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button onClick={resetFilters} className="text-[10px] font-bold text-text-muted hover:text-brand-gold uppercase tracking-widest transition-colors">
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Price Range</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">Rs.</span>
                        <input 
                          type="number" 
                          placeholder="Min" 
                          value={priceRange.min} 
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} 
                          className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-transparent rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-brand-gold transition-all" 
                        />
                      </div>
                      <span className="text-text-muted text-xs font-bold">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">Rs.</span>
                        <input 
                          type="number" 
                          placeholder="Max" 
                          value={priceRange.max} 
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} 
                          className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-transparent rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-brand-gold transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Stock Status</label>
                    <div className="flex flex-wrap gap-2">
                      {["All", "In Stock", "Low Stock", "Out of Stock"].map((status) => (
                        <button 
                          key={status} 
                          onClick={() => setStockStatus(status)} 
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border", 
                            stockStatus === status 
                              ? "bg-brand-sidebar text-white border-brand-sidebar shadow-sm" 
                              : "bg-white text-text-muted border-gray-200 hover:border-brand-gold hover:text-brand-gold"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Status */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Product Status</label>
                    <div className="flex flex-wrap gap-2">
                      {["All", "Active", "Draft"].map((status) => (
                        <button 
                          key={status} 
                          onClick={() => setProductStatus(status)} 
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border", 
                            productStatus === status 
                              ? "bg-brand-sidebar text-white border-brand-sidebar shadow-sm" 
                              : "bg-white text-text-muted border-gray-200 hover:border-brand-gold hover:text-brand-gold"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                  <button onClick={() => setIsFilterOpen(false)} className="w-full py-2.5 bg-brand-gold text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-brand-gold/20 uppercase tracking-widest">
                    Show {filteredProducts.length} Results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-3" />
            <p className="text-sm text-text-muted font-bold">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        className="accent-brand-gold"
                        checked={filteredProducts.length > 0 && selectedRows.length === filteredProducts.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={cn(
                        "hover:bg-brand-gold-light transition-colors group cursor-default",
                        selectedRows.includes(product.id) && "bg-brand-gold-light/50"
                      )}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="accent-brand-gold"
                          checked={selectedRows.includes(product.id)}
                          onChange={() => toggleSelectRow(product.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-text-primary">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{product.subcategory}</p>
                              {getProductBadges(product).map(badge => (
                                <span key={badge} className={cn(
                                  "px-1.5 py-0.5 rounded text-[8px] font-bold text-white",
                                  badge === "NEW" ? "bg-teal-500" : badge === "SALE" ? "bg-rose-500" : "bg-orange-500"
                                )}>
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-semibold">{product.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary">Rs.{product.price.toLocaleString()}</span>
                          {product.old_price && (
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-text-muted line-through">Rs.{product.old_price.toLocaleString()}</span>
                              <span className="text-[10px] font-bold text-rose-500">-{product.discount}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "status-badge",
                            product.stock_status === "In Stock" ? "bg-emerald-50 text-emerald-600" :
                            product.stock_status === "Low Stock" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {product.stock_status}
                          </span>
                          <span className="text-[10px] text-text-muted font-bold ml-1">{product.stock} units</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={product.status === "Active"}
                            onChange={() => handleStatusToggle(product)}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/products/edit/${product.id}`}
                            className="p-2 text-text-muted hover:text-brand-gold hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="p-2 text-text-muted hover:text-danger hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-text-muted font-bold">Showing {filteredProducts.length} of {products.length} items</p>
              <div className="flex items-center gap-2">
                <button className="p-2 text-text-muted hover:bg-white border border-gray-200 bg-white/50 rounded-lg transition-colors disabled:opacity-50" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg bg-brand-gold text-white shadow-sm">1</button>
                <button className="p-2 text-text-muted hover:bg-white border border-gray-200 bg-white/50 rounded-lg transition-colors disabled:opacity-50" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedRows.length > 0 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-brand-sidebar text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-6 animate-fade-in z-20 border border-white/10">
                <span className="text-sm font-bold border-r border-white/20 pr-6">{selectedRows.length} items selected</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDeleteClick}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-rose-400"
                    title="Delete selected"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm" onClick={() => setDeleteModalConfig(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Confirm Deletion</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-text-secondary">{deleteModalConfig.name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button onClick={() => setDeleteModalConfig(null)} className="flex-1 px-6 py-4 text-sm font-bold text-text-muted hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 px-6 py-4 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors border-l border-gray-100">Delete</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
