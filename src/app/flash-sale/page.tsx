"use client";

import { useState } from "react";
import { 
  Zap, 
  Clock, 
  Plus, 
  Search, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Percent,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const initialSaleProducts = [
  { id: 1, name: "Silk Evening Gown", price: 4200, salePrice: 2100, discount: 50, stock: 45, sold: 12, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=100&q=80" },
  { id: 2, name: "Cashmere Sweater", price: 3500, salePrice: 2450, discount: 30, stock: 24, sold: 8, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&q=80" },
  { id: 3, name: "Gold Chain Necklace", price: 1200, salePrice: 840, discount: 30, stock: 12, sold: 10, image: "https://images.unsplash.com/photo-1535633302723-9993d57af2aa?w=100&q=80" },
];

const availableProductsPool = [
  { id: 10, name: "Leather Jacket", price: 8500, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&q=80" },
  { id: 11, name: "Classic Denim", price: 2400, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&q=80" },
  { id: 12, name: "Woolen Scarf", price: 1200, image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=100&q=80" },
  { id: 13, name: "Cotton T-Shirt", price: 800, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80" },
  { id: 14, name: "Formal Shoes", price: 4500, image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=100&q=80" },
];

export default function FlashSalePage() {
  const [active, setActive] = useState(true);
  const [saleProducts, setSaleProducts] = useState(initialSaleProducts);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedPoolIds, setSelectedPoolIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Settings States
  const [startDate, setStartDate] = useState("2023-10-30T00:00");
  const [endDate, setEndDate] = useState("2023-10-31T00:00");
  const [defaultDiscount, setDefaultDiscount] = useState(30);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleToggleSale = () => {
    setActive(!active);
  };

  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsUpdating(false);
    setUpdateSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  const handleAddProductsToSale = () => {
    const productsToAdd = availableProductsPool
      .filter(p => selectedPoolIds.includes(p.id))
      .map(p => ({
        ...p,
        salePrice: p.price * 0.7, // Default 30% discount
        discount: 30,
        stock: 50,
        sold: 0
      }));

    setSaleProducts([...saleProducts, ...productsToAdd]);
    setIsSelectOpen(false);
    setSelectedPoolIds([]);
  };

  const removeProduct = (id: number) => {
    setSaleProducts(saleProducts.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg">
                 <Zap className="w-5 h-5 fill-current" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Flash Sale Manager</h2>
           </div>
           <p className="text-sm text-text-muted mt-1">Manage limited-time discounts and campaign products.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <span className={cn(
                "w-2 h-2 rounded-full",
                active ? "bg-success animate-pulse" : "bg-text-muted"
              )}></span>
              <span className="text-xs font-bold text-text-primary uppercase tracking-widest">{active ? "Sale Active" : "Sale Inactive"}</span>
           </div>
           <button 
             onClick={handleToggleSale}
             className={cn(
             "px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg",
             active ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-emerald-500 text-white shadow-emerald-500/20"
           )}>
              {active ? "Stop Sale" : "Start Sale"}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Section */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-brand-sidebar rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-6">Time Remaining</h3>
              <div className="flex gap-4">
                 {[
                   { label: "HRS", val: "08" },
                   { label: "MIN", val: "42" },
                   { label: "SEC", val: "15" },
                 ].map((t) => (
                   <div key={t.label} className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-mono font-bold border border-white/10">
                        {t.val}
                      </div>
                      <span className="text-[8px] font-bold text-white/60 tracking-widest">{t.label}</span>
                   </div>
                 ))}
              </div>
              <div className="mt-8 flex items-center gap-4 py-4 border-t border-white/10">
                 <div className="flex-1">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Revenue</p>
                    <p className="text-xl font-bold mt-1">Rs.28,420</p>
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total Sold</p>
                    <p className="text-xl font-bold mt-1">32 Items</p>
                 </div>
              </div>
           </div>

           <div className="card space-y-4">
              <h3 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Sale Settings</h3>
              <div className="space-y-4">
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-secondary">Start Date</label>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-text-primary focus-within:bg-white focus-within:border-brand-gold transition-all">
                       <Clock className="w-4 h-4 text-text-muted" />
                       <input 
                         type="datetime-local" 
                         value={startDate}
                         onChange={(e) => setStartDate(e.target.value)}
                         className="bg-transparent outline-none w-full font-medium" 
                       />
                    </div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-secondary">End Date</label>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-text-primary focus-within:bg-white focus-within:border-brand-gold transition-all">
                       <Clock className="w-4 h-4 text-text-muted" />
                       <input 
                         type="datetime-local" 
                         value={endDate}
                         onChange={(e) => setEndDate(e.target.value)}
                         className="bg-transparent outline-none w-full font-medium" 
                       />
                    </div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-secondary">Default Discount (%)</label>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-text-primary focus-within:bg-white focus-within:border-brand-gold transition-all">
                       <Percent className="w-4 h-4 text-text-muted" />
                       <input 
                         type="number" 
                         value={defaultDiscount}
                         onChange={(e) => setDefaultDiscount(Number(e.target.value))}
                         className="bg-transparent outline-none w-full font-bold" 
                       />
                    </div>
                 </div>
                 <button 
                   onClick={handleUpdateSettings}
                   disabled={isUpdating}
                   className={cn(
                     "w-full py-3 mt-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                     updateSuccess 
                       ? "bg-emerald-500 text-white" 
                       : "bg-gray-50 text-text-secondary hover:bg-gray-100"
                   )}
                 >
                    {isUpdating ? (
                      <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin"></div>
                    ) : updateSuccess ? (
                      "Settings Updated!"
                    ) : (
                      "Update Settings"
                    )}
                 </button>
              </div>
           </div>
        </div>

        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="card p-0 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                 <div>
                    <h3 className="font-bold text-lg text-text-primary">Campaign Products</h3>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Products participating in current sale</p>
                 </div>
                  <button 
                    onClick={() => setIsSelectOpen(true)}
                    className="btn-primary py-2 px-4 text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Select Products
                 </button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-gray-100">
                       <tr>
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">Base Price</th>
                          <th className="px-6 py-4">Sale Price</th>
                          <th className="px-6 py-4">Discount</th>
                          <th className="px-6 py-4 text-right">Progress</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                       {saleProducts.map((p) => (
                         <tr key={p.id} className="hover:bg-brand-gold-light transition-colors group">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                                     <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  </div>
                                  <span className="font-bold text-text-primary truncate max-w-[140px]">{p.name}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-text-muted line-through">Rs.{p.price}</td>
                            <td className="px-6 py-4 font-bold text-text-primary">Rs.{p.salePrice}</td>
                            <td className="px-6 py-4">
                               <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded">-{p.discount}%</span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col gap-1 items-end">
                                  <span className="text-[10px] font-bold text-text-secondary">{p.sold}/{p.stock + p.sold} SOLD</span>
                                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                     <div 
                                       className="h-full bg-brand-gold" 
                                       style={{ width: `${(p.sold / (p.stock + p.sold)) * 100}%` }}
                                     ></div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button 
                                 onClick={() => removeProduct(p.id)}
                                 className="p-2 text-text-muted hover:text-danger hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-100"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>


        </div>
      </div>
      {/* Select Products Modal */}
      {isSelectOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            onClick={() => setIsSelectOpen(false)}
          ></div>
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Select Products</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Choose products to add to the Flash Sale</p>
              </div>
              <button 
                onClick={() => setIsSelectOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Search products by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {availableProductsPool
                 .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                 .map((p) => {
                   const isSelected = selectedPoolIds.includes(p.id);
                   const isAlreadyInSale = saleProducts.some(sp => sp.id === p.id);

                   return (
                     <div 
                        key={p.id}
                        onClick={() => !isAlreadyInSale && (
                          isSelected 
                            ? setSelectedPoolIds(selectedPoolIds.filter(id => id !== p.id))
                            : setSelectedPoolIds([...selectedPoolIds, p.id])
                        )}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group",
                          isAlreadyInSale ? "opacity-50 cursor-not-allowed bg-gray-50 border-transparent" :
                          isSelected ? "bg-brand-gold-light border-brand-gold/20" : "hover:bg-gray-50 border-transparent"
                        )}
                     >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                           <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-text-primary truncate">{p.name}</p>
                           <p className="text-xs text-text-muted font-bold">Base Price: Rs.{p.price}</p>
                        </div>
                        {isAlreadyInSale ? (
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">In Sale</span>
                        ) : (
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected ? "bg-brand-gold border-brand-gold text-white" : "border-gray-200 group-hover:border-brand-gold"
                          )}>
                            {isSelected && <Plus className="w-4 h-4" />}
                          </div>
                        )}
                     </div>
                   );
                 })}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button 
                onClick={() => setIsSelectOpen(false)}
                className="flex-1 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-muted hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProductsToSale}
                disabled={selectedPoolIds.length === 0}
                className="flex-[2] px-6 py-3 bg-brand-gold text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {selectedPoolIds.length} Products to Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
