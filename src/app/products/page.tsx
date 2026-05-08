"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertTriangle,
  X as CloseIcon,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { initialMainCategories, initialProducts } from "@/lib/data";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tabs = ["All", ...initialMainCategories.map(c => c.name)];

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [deleteModalConfig, setDeleteModalConfig] = useState<{ id: string | null; name: string | null; isBulk: boolean } | null>(null);
  
  // Filter Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [stockStatus, setStockStatus] = useState("All");
  const [productStatus, setProductStatus] = useState("All");

  const filteredProducts = products.filter(product => {
    // Tab Filter
    const matchesTab = activeTab === "All" 
      ? true 
      : activeTab === "Flash Sale" 
        ? product.badges.some(b => ["SALE", "FLASH"].includes(b))
        : product.category === activeTab;

    // Search Filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.subcategory.toLowerCase().includes(query);

    // Price Filter
    const matchesPrice = 
      (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
      (!priceRange.max || product.price <= parseFloat(priceRange.max));

    // Stock Filter
    const matchesStock = stockStatus === "All" || product.stockStatus === stockStatus;

    // Status Filter
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
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleDeleteClick = (product: any) => {
    setDeleteModalConfig({ id: product.id, name: product.name, isBulk: false });
  };

  const handleBulkDeleteClick = () => {
    setDeleteModalConfig({ id: null, name: `${selectedRows.length} items`, isBulk: true });
  };

  const confirmDelete = () => {
    if (!deleteModalConfig) return;

    if (deleteModalConfig.isBulk) {
      setProducts(products.filter(p => !selectedRows.includes(p.id)));
      setSelectedRows([]);
    } else if (deleteModalConfig.id) {
      setProducts(products.filter(p => p.id !== deleteModalConfig.id));
      setSelectedRows(selectedRows.filter(rowId => rowId !== deleteModalConfig.id));
    }
    setDeleteModalConfig(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-text-primary">Products</h2>
          <span className="px-2 py-0.5 bg-gray-100 text-text-muted text-xs font-bold rounded-full">128 Total</span>
        </div>
        <Link href="/products/add" className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
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
          <button 
            onClick={() => setIsFilterOpen(true)}
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
        </div>
      </div>

      <div className="card p-0 overflow-hidden relative">
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
                          {product.badges.map(badge => (
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
                      {product.oldPrice && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-text-muted line-through">Rs.{product.oldPrice.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-rose-500">-{product.discount}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "status-badge",
                        product.stockStatus === "In Stock" ? "bg-emerald-50 text-emerald-600" :
                        product.stockStatus === "Low Stock" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {product.stockStatus}
                      </span>
                      <span className="text-[10px] text-text-muted font-bold ml-1">{product.stock} units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <label className="switch">
                      <input type="checkbox" defaultChecked={product.status === "Active"} />
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
            <div className="flex gap-1">
              {[1, 2, 3, "...", 12].map((p, i) => (
                <button 
                  key={i} 
                  className={cn(
                    "w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all",
                    p === 1 ? "bg-brand-gold text-white shadow-sm" : "text-text-muted hover:bg-white border border-transparent hover:border-gray-200"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className="p-2 text-text-muted hover:bg-white border border-gray-200 bg-white/50 rounded-lg transition-colors">
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
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-rose-400 group" 
                title="Delete selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors">Mark as Sale</button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors">Mark as New</button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteModalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            onClick={() => setDeleteModalConfig(null)}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Confirm Deletion</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-text-secondary">{deleteModalConfig.name}</span>? 
                This action cannot be undone and will permanently remove the data.
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button 
                onClick={() => setDeleteModalConfig(null)}
                className="flex-1 px-6 py-4 text-sm font-bold text-text-muted hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors border-l border-gray-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          ></div>
          <div className="w-full max-w-sm bg-white h-full relative z-10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-gold/10 rounded-xl">
                  <SlidersHorizontal className="w-5 h-5 text-brand-gold" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Advanced Filters</h3>
              </div>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-text-muted"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Price Range */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Price Range (Rs.)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-text-muted">Min</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-text-muted">Max</span>
                    <input 
                      type="number" 
                      placeholder="No limit"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Stock Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["All", "In Stock", "Low Stock", "Out of Stock"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStockStatus(status)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                        stockStatus === status 
                          ? "bg-brand-sidebar text-white border-brand-sidebar shadow-md" 
                          : "bg-gray-50 text-text-muted border-transparent hover:bg-gray-100"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Status */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Product Status</label>
                <div className="flex gap-2">
                  {["All", "Active", "Draft"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setProductStatus(status)}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                        productStatus === status 
                          ? "bg-brand-sidebar text-white border-brand-sidebar shadow-md" 
                          : "bg-gray-50 text-text-muted border-transparent hover:bg-gray-100"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button 
                onClick={resetFilters}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-muted hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 px-4 py-3 bg-brand-gold text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

