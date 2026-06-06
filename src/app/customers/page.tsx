"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  X,
  BadgeCheck,
  SlidersHorizontal,
  RotateCcw,
  X as CloseIcon,
  Loader2,
  User
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import type { Customer } from "@/lib/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const segments = ["All"];

export default function CustomersPage() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minSpent, setMinSpent] = useState("");
  const [minOrders, setMinOrders] = useState("");

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

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCustomerList(data as Customer[]);
    setLoading(false);
  }

  const filteredCustomers = customerList.filter(cus => {
    if (!cus) return false;
    const query = (searchQuery || "").toLowerCase();
    const full_name = (cus.full_name || cus.name || "").toLowerCase();
    const email = (cus.email || "").toLowerCase();
    const id = (cus.id || "").toLowerCase();
    
    const matchesSearch =
      full_name.includes(query) ||
      email.includes(query) ||
      id.includes(query);

    const rawSpent = cus.total_spent ?? (cus as any).spent ?? 0;
    const spentValue = typeof rawSpent === 'number' 
      ? rawSpent 
      : parseFloat(String(rawSpent).replace(/Rs\.?/i, "").replace(/,/g, "")) || 0;
      
    const matchesSpent = !minSpent || spentValue >= parseFloat(minSpent);
    const total_orders = cus.total_orders ?? (cus as any).orders ?? 0;
    const matchesOrders = !minOrders || total_orders >= parseInt(minOrders);

    return matchesSearch && matchesSpent && matchesOrders;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setMinSpent("");
    setMinOrders("");
  };

  const activeFiltersCount = (minSpent ? 1 : 0) + (minOrders ? 1 : 0);

  return (
    <div className="space-y-6 animate-fade-in relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-text-primary">Customers</h2>
          <span className="px-2 py-0.5 bg-gray-100 text-text-muted text-xs font-bold rounded-full">
            {customerList.length} Total
          </span>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-text-secondary hover:bg-gray-50 transition-colors shadow-sm">
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide">
          {segments.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSegment(tab)}
              className={cn(
                "pb-4 text-sm font-bold transition-all relative whitespace-nowrap",
                activeSegment === tab ? "text-brand-gold" : "text-text-muted hover:text-text-secondary"
              )}
            >
              {tab}
              {activeSegment === tab && (
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
              placeholder="Search customers..."
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
                  {/* Minimum Spent */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Minimum Spent</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">Rs.</span>
                      <input 
                        type="number" 
                        placeholder="e.g. 50000" 
                        value={minSpent} 
                        onChange={(e) => setMinSpent(e.target.value)} 
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-brand-gold transition-all" 
                      />
                    </div>
                  </div>

                  {/* Minimum Orders */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Minimum Orders</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">Qty</span>
                      <input 
                        type="number" 
                        placeholder="e.g. 10" 
                        value={minOrders} 
                        onChange={(e) => setMinOrders(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-brand-gold transition-all" 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                  <button onClick={() => setIsFilterOpen(false)} className="w-full py-2.5 bg-brand-gold text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-brand-gold/20 uppercase tracking-widest">
                    Show {filteredCustomers.length} Results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-3" />
            <p className="text-sm text-text-muted font-bold">Loading customers...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Orders</th>
                    <th className="px-6 py-4">Total Spent</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {filteredCustomers.map((cus) => (
                    <tr
                      key={cus.id}
                      className="hover:bg-brand-gold-light transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomer(cus)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border border-gray-200 flex-shrink-0 bg-gray-50 flex items-center justify-center text-text-muted overflow-hidden">
                            {(cus.avatar_url || (cus as any).avatar) ? (
                              <img src={cus.avatar_url || (cus as any).avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-primary">{cus.full_name || cus.name}</span>
                            <span className="text-[10px] text-text-muted font-bold">{cus.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-semibold">{cus.total_orders ?? cus.orders} orders</td>
                      <td className="px-6 py-4 font-bold text-text-primary">
                        {typeof cus.total_spent === 'number' ? `Rs.${cus.total_spent.toLocaleString()}` : (cus.total_spent || cus.spent)}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">{cus.created_at || cus.joined}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-text-muted hover:text-brand-gold hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-100">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-sm text-text-muted font-bold">
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-text-muted font-bold">Showing {filteredCustomers.length} of {customerList.length} customers</p>
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
          </>
        )}
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
          <div
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => setSelectedCustomer(null)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl animate-fade-in flex flex-col pointer-events-auto overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 gap-4 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-text-primary whitespace-nowrap">Customer Profile</h3>
                  <span className="font-mono text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full truncate max-w-[160px]">ID: {selectedCustomer.id}</span>
                </div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">
                  Member since {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ((selectedCustomer as any).joined || "N/A")}
                </p>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)} 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors shrink-0"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl flex-shrink-0 bg-gray-50 flex items-center justify-center text-text-muted overflow-hidden">
                  {(selectedCustomer.avatar_url || (selectedCustomer as any).avatar) ? (
                    <img src={selectedCustomer.avatar_url || (selectedCustomer as any).avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xl font-bold text-text-primary">{selectedCustomer.full_name || selectedCustomer.name}</h4>
                    <BadgeCheck className="w-5 h-5 text-brand-gold flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    {selectedCustomer.email ? (
                      <a 
                        href={`mailto:${selectedCustomer.email}`}
                        className="p-2 bg-gray-50 rounded-lg text-text-muted hover:text-brand-gold transition-colors border border-gray-100 shadow-sm flex items-center justify-center"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-full border border-rose-100 uppercase tracking-widest">
                        no email
                      </span>
                    )}

                    {selectedCustomer.phone ? (
                      <a 
                        href={`tel:${selectedCustomer.phone}`}
                        className="p-2 bg-gray-50 rounded-lg text-text-muted hover:text-brand-gold transition-colors border border-gray-100 shadow-sm flex items-center justify-center"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-full border border-rose-100 uppercase tracking-widest">
                        no number
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Total Spent</p>
                  <h5 className="text-base font-bold text-text-primary">
                    {typeof selectedCustomer.total_spent === 'number' ? `Rs.${selectedCustomer.total_spent.toLocaleString()}` : ((selectedCustomer as any).spent || "Rs.0")}
                  </h5>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Orders</p>
                  <h5 className="text-base font-bold text-text-primary">{selectedCustomer.total_orders ?? (selectedCustomer as any).orders ?? 0}</h5>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Joined Date</p>
                  <h5 className="text-[10px] font-bold text-text-primary truncate">
                    {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ((selectedCustomer as any).joined || "N/A")}
                  </h5>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Contact Information</h4>
                <div className="p-5 rounded-2xl border border-gray-100 space-y-4 bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-text-muted border border-gray-100">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-text-primary">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-text-muted border border-gray-100">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Phone Number</p>
                        <p className="text-sm font-bold text-text-primary">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Activity Summary */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Shopping Activity</h4>
                  <Link href={`/orders?customer=${encodeURIComponent(selectedCustomer.full_name || selectedCustomer.name || "")}`} className="text-[10px] font-bold text-brand-gold hover:underline uppercase tracking-widest flex items-center gap-1">
                    View All Orders <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex flex-col items-center justify-center py-10 bg-gray-900 rounded-2xl text-center shadow-xl text-white">
                  <ShoppingBag className="w-10 h-10 text-brand-gold mb-3" />
                  <p className="text-lg font-bold">{(selectedCustomer.total_orders ?? (selectedCustomer as any).orders ?? 0)} orders placed</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[240px]">This customer has been with us since {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ((selectedCustomer as any).joined || "")}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full px-4 py-3 bg-brand-gold text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20 uppercase tracking-widest"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}


    </div>
  );
}
