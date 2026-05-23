"use client";

import { useState, useEffect, useRef } from "react";
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
      .order("joined", { ascending: false });
    if (!error && data) setCustomerList(data as Customer[]);
    setLoading(false);
  }

  const filteredCustomers = customerList.filter(cus => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      cus.name.toLowerCase().includes(query) ||
      cus.email.toLowerCase().includes(query) ||
      cus.id.toLowerCase().includes(query);

    const spentValue = parseInt(cus.spent.replace(/Rs\.?/i, "").replace(/[^0-9]/g, "")) || 0;
    const matchesSpent = !minSpent || spentValue >= parseInt(minSpent);
    const matchesOrders = !minOrders || cus.orders >= parseInt(minOrders);

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
                          <div className="w-10 h-10 rounded-full border border-gray-200 flex-shrink-0 bg-gray-50 flex items-center justify-center text-text-muted">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-primary">{cus.name}</span>
                            <span className="text-[10px] text-text-muted font-bold">{cus.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-semibold">{cus.orders} orders</td>
                      <td className="px-6 py-4 font-bold text-text-primary">{cus.spent}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">{cus.joined}</td>
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

      {/* Customer Profile Drawer */}
      {selectedCustomer && (
        <>
          <div
            className="fixed inset-0 bg-brand-sidebar/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          ></div>
          <div className="fixed top-0 right-0 h-screen w-full sm:w-[540px] bg-white z-[60] shadow-2xl drawer-animate flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-text-primary">Customer Profile</h3>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl flex-shrink-0 bg-gray-50 flex items-center justify-center text-text-muted">
                  <User className="w-12 h-12" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold text-text-primary">{selectedCustomer.name}</h4>
                    <BadgeCheck className="w-5 h-5 text-brand-gold" />
                  </div>
                  <p className="text-sm text-text-muted mt-1">{selectedCustomer.id}</p>
                  <div className="flex gap-2 mt-4">
                    <button className="p-2 bg-gray-50 rounded-lg text-text-muted hover:text-brand-gold transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-50 rounded-lg text-text-muted hover:text-brand-gold transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="card bg-gray-50 border-none p-4">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Total Spent</p>
                  <h5 className="text-lg font-bold text-text-primary">{selectedCustomer.spent}</h5>
                </div>
                <div className="card bg-gray-50 border-none p-4">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Orders</p>
                  <h5 className="text-lg font-bold text-text-primary">{selectedCustomer.orders}</h5>
                </div>
                <div className="card bg-gray-50 border-none p-4">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Joined</p>
                  <h5 className="text-sm font-bold text-text-primary mt-1">{selectedCustomer.joined}</h5>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Contact Information</h4>
                <div className="card border-gray-100 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-text-muted">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-text-primary">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-text-muted">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Phone Number</p>
                        <p className="text-sm font-bold text-text-primary">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-text-muted">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Member Since</p>
                      <p className="text-sm font-bold text-text-primary">{selectedCustomer.joined}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Recent Orders</h4>
                  <Link href={`/orders?customer=${encodeURIComponent(selectedCustomer.name)}`} className="text-[10px] font-bold text-brand-gold hover:underline">VIEW ALL</Link>
                </div>
                <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl text-center">
                  <ShoppingBag className="w-8 h-8 text-text-muted mb-2" />
                  <p className="text-sm font-bold text-text-primary">{selectedCustomer.orders} orders placed</p>
                  <p className="text-xs text-text-muted mt-1">View all orders in the Orders page</p>
                </div>
              </div>
            </div>


          </div>
        </>
      )}


    </div>
  );
}
