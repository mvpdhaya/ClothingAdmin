"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  X,
  BadgeCheck,
  Ban,
  SlidersHorizontal,
  RotateCcw,
  X as CloseIcon
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const customers = [
  { 
    id: "CUS-1001", 
    name: "Sophia Anderson", 
    email: "sophia.a@example.com", 
    orders: 12, 
    spent: "Rs.84,240", 
    joined: "Oct 24, 2023",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  },
  { 
    id: "CUS-1002", 
    name: "James Wilson", 
    email: "j.wilson@example.com", 
    orders: 8, 
    spent: "Rs.42,120", 
    joined: "Oct 22, 2023",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
  },
  { 
    id: "CUS-1003", 
    name: "Olivia Brown", 
    email: "olivia.b@example.com", 
    orders: 5, 
    spent: "Rs.18,450", 
    joined: "Oct 15, 2023",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
  },
  { 
    id: "CUS-1004", 
    name: "Liam Smith", 
    email: "liam.s@example.com", 
    orders: 3, 
    spent: "Rs.8,185", 
    joined: "Sep 28, 2023",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
  },
  { 
    id: "CUS-1005", 
    name: "Emma Davis", 
    email: "emma.d@example.com", 
    orders: 15, 
    spent: "Rs.1,12,300", 
    joined: "Sep 15, 2023",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
  },
];

const segments = ["All"];

export default function CustomersPage() {
  const [customerList, setCustomerList] = useState(customers);
  const [activeSegment, setActiveSegment] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Filter Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minSpent, setMinSpent] = useState("");
  const [minOrders, setMinOrders] = useState("");

  const filteredCustomers = customerList.filter(cus => {
    // Search Filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      cus.name.toLowerCase().includes(query) ||
      cus.email.toLowerCase().includes(query) ||
      cus.id.toLowerCase().includes(query);

    // Advanced Filters
    const spentValue = parseInt(cus.spent.replace(/[^0-9]/g, "")) || 0;
    const matchesSpent = !minSpent || spentValue >= parseInt(minSpent);
    const matchesOrders = !minOrders || cus.orders >= parseInt(minOrders);

    return matchesSearch && matchesSpent && matchesOrders;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setMinSpent("");
    setMinOrders("");
  };

  const activeFiltersCount = 
    (minSpent ? 1 : 0) + 
    (minOrders ? 1 : 0);

  return (
    <div className="space-y-6 animate-fade-in relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-text-primary">Customers</h2>
          <span className="px-2 py-0.5 bg-gray-100 text-text-muted text-xs font-bold rounded-full">2.4k Total</span>
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

      <div className="card p-0 overflow-hidden">
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
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50">
                        <img src={cus.avatar} alt={cus.name} className="w-full h-full object-cover" />
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
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted font-bold">Showing {filteredCustomers.length} of {customerList.length} customers</p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-text-muted hover:bg-white border border-gray-200 bg-white/50 rounded-lg transition-colors disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              {[1, 2, 3, "...", 242].map((p, i) => (
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
               <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
               {/* Header Info */}
               <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                     <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-full h-full object-cover" />
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

               {/* Stats Grid */}
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

               {/* Detailed Info */}
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
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-text-muted">
                           <Phone className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Phone Number</p>
                           <p className="text-sm font-bold text-text-primary">+94 98765 43210</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-text-muted">
                           <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Billing Address</p>
                           <p className="text-sm font-bold text-text-primary leading-relaxed">24, Royal Enclave, Galle Road, Colombo 03, Sri Lanka</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Recent Orders */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Recent Orders</h4>
                     <Link href={`/orders?customer=${encodeURIComponent(selectedCustomer.name)}`} className="text-[10px] font-bold text-brand-gold hover:underline">VIEW ALL</Link>
                  </div>
                  <div className="space-y-3">
                     {[
                        { id: "#ORD-9281", date: "Oct 24", total: "Rs.4,240", status: "Delivered" },
                        { id: "#ORD-9120", date: "Oct 12", total: "Rs.2,185", status: "Delivered" },
                        { id: "#ORD-8942", date: "Sep 28", total: "Rs.12,450", status: "Delivered" },
                     ].map((order) => (
                       <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-text-muted border border-gray-100">
                                <ShoppingBag className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-text-primary">{order.id}</p>
                                <p className="text-[10px] text-text-muted font-bold">{order.date}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-bold text-text-primary">{order.total}</p>
                             <span className="text-[10px] text-emerald-600 font-bold">{order.status}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
               <button className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-100 transition-colors">
                 Edit Profile
               </button>
               <button className="flex-1 px-4 py-3 bg-brand-sidebar text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg">
                 Add Credit
               </button>
            </div>
          </div>
        </>
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
                <h3 className="text-lg font-bold text-text-primary">Customer Filters</h3>
              </div>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-text-muted"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Minimum Spent */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Minimum Spent (₹)</label>
                <div className="relative">
                   <input 
                    type="number" 
                    placeholder="e.g. 50000"
                    value={minSpent}
                    onChange={(e) => setMinSpent(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                  />
                </div>
              </div>

              {/* Minimum Orders */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Minimum Orders</label>
                <div className="relative">
                   <input 
                    type="number" 
                    placeholder="e.g. 10"
                    value={minOrders}
                    onChange={(e) => setMinOrders(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                  />
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
