"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Filter, 
  Eye,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  User,
  X,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Inbox,
  MapPin,
  ChevronDown,
  Printer
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const initialOrders = [
  { 
    id: "#ORD-9281", 
    customer: "Alice Johnson", 
    email: "alice@example.com",
    address: "123, Galle Road, Colombo 03, Sri Lanka",
    items: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1624371414361-e6e8ea402030?w=100&h=100&fit=crop"
    ],
    itemCount: 3, 
    total: "Rs.12,420", 
    payment: "UPI",
    status: "Delivered", 
    date: "Oct 24, 2023 10:30 AM" 
  },
  { 
    id: "#ORD-9280", 
    customer: "Bob Smith", 
    email: "bob@example.com",
    address: "Apartment 4B, Lotus Grove, Dehiwala, Colombo, Sri Lanka",
    items: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&h=100&fit=crop"
    ],
    itemCount: 1, 
    total: "Rs.2,185", 
    payment: "COD",
    status: "Shipped", 
    date: "Oct 24, 2023 09:15 AM" 
  },
  { 
    id: "#ORD-9279", 
    customer: "Charlie Brown", 
    email: "charlie@example.com",
    address: "Villa 12, Havelock Road, Colombo 05, Sri Lanka",
    items: [
      "https://images.unsplash.com/photo-1535633302723-9993d57af2aa?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=100&h=100&fit=crop"
    ],
    itemCount: 2, 
    total: "Rs.5,190", 
    payment: "Card",
    status: "Confirmed", 
    date: "Oct 23, 2023 04:45 PM" 
  },
  { 
    id: "#ORD-9278", 
    customer: "Diana Prince", 
    email: "diana@example.com",
    address: "7th Floor, Trillium Tower, Kandy, Sri Lanka",
    items: [
      "https://images.unsplash.com/photo-1584917033904-491a84b2efbd?w=100&h=100&fit=crop"
    ],
    itemCount: 4, 
    total: "Rs.12,000", 
    payment: "UPI",
    status: "Cancelled", 
    date: "Oct 22, 2023 11:20 AM" 
  },
  { 
    id: "#ORD-9277", 
    customer: "Ethan Hunt", 
    email: "ethan@example.com",
    address: "House 55, Gregory's Road, Colombo 07, Sri Lanka",
    items: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop"
    ],
    itemCount: 1, 
    total: "Rs.450", 
    payment: "COD",
    status: "Pending", 
    date: "Oct 22, 2023 08:05 AM" 
  },
];

const statusTabs = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const statusStyles = {
  Pending: "bg-amber-50 text-amber-600 border-amber-100",
  Confirmed: "bg-blue-50 text-blue-600 border-blue-100",
  Shipped: "bg-purple-50 text-purple-600 border-purple-100",
  Delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
};

function OrdersList() {
  const searchParams = useSearchParams();
  const customerName = searchParams.get("customer");

  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState(customerName || "");

  useEffect(() => {
    if (customerName) {
      setSearchQuery(customerName);
    }
  }, [customerName]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("All");

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesTab = activeTab === "All" || order.status === activeTab;
      const matchesPayment = paymentFilter === "All" || order.payment === paymentFilter;
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesPayment && matchesSearch;
    });
  }, [orders, activeTab, searchQuery, paymentFilter]);

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedOrderId) {
      setOrders(prev => prev.map(o => 
        o.id === selectedOrderId ? { ...o, status: newStatus } : o
      ));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-text-primary">Orders</h2>
          <span className="px-2 py-0.5 bg-gray-100 text-text-muted text-xs font-bold rounded-full">
            {filteredOrders.length} {activeTab !== "All" ? activeTab : ""} Orders Found
          </span>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-text-secondary hover:bg-gray-50 transition-colors shadow-sm">
          Export CSV
        </button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-sm font-bold transition-all relative whitespace-nowrap",
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, customer or email..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-gold transition-colors shadow-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 text-text-muted hover:bg-gray-100 rounded-lg transition-colors border bg-white relative",
                showFilters ? "border-brand-gold text-brand-gold" : "border-gray-200"
              )}
            >
              <Filter className="w-4 h-4" />
              {paymentFilter !== "All" && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-gold rounded-full border-2 border-white"></span>
              )}
            </button>
            
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 animate-fade-in">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary">Filters</h4>
                  {(paymentFilter !== "All") && (
                    <button 
                      onClick={() => setPaymentFilter("All")}
                      className="text-[10px] font-bold text-brand-gold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Payment Method</label>
                    <select 
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-gold focus:bg-white transition-colors cursor-pointer appearance-none font-bold text-text-secondary"
                    >
                      <option value="All">All Methods</option>
                      <option value="UPI">UPI</option>
                      <option value="COD">COD</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden min-h-[400px] flex flex-col">
        {filteredOrders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-brand-gold-light/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-xs text-text-primary">{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary overflow-hidden">
                             <User className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-primary">{order.customer}</span>
                            <span className="text-[10px] text-text-muted font-bold truncate max-w-[120px]">{order.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-3 group-hover:-space-x-1 transition-all">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="w-8 h-8 rounded border-2 border-white overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm">
                              <img src={item} alt="item" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {order.itemCount > order.items.length && (
                            <div className="w-8 h-8 rounded border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-text-muted shadow-sm">
                              +{order.itemCount - order.items.length}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-text-primary">{order.total}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{order.payment}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "status-badge border text-[10px] py-1 px-3",
                          statusStyles[order.status as keyof typeof statusStyles]
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-tighter">{order.date}</td>
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

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between mt-auto gap-4">
              <p className="text-xs text-text-muted font-bold">Showing {filteredOrders.length} of {orders.length} orders</p>
              <div className="flex items-center gap-2">
                <button className="p-2 text-text-muted hover:bg-white border border-gray-200 bg-white/50 rounded-lg transition-colors disabled:opacity-50" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {[1].map((p, i) => (
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
                <button className="p-2 text-text-muted hover:bg-white border border-gray-200 bg-white/50 rounded-lg transition-colors disabled:opacity-50" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-fade-in">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Inbox className="w-8 h-8 text-text-muted" />
             </div>
             <h3 className="text-lg font-bold text-text-primary">No orders found</h3>
             <p className="text-sm text-text-muted mt-1">Try adjusting your filters or search query to find what you're looking for.</p>
             <button 
              onClick={() => {setActiveTab("All"); setSearchQuery(""); setPaymentFilter("All");}}
              className="mt-6 text-sm font-bold text-brand-gold hover:underline"
             >
               Clear all filters
             </button>
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <>
          <div 
            className="fixed inset-0 bg-brand-sidebar/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setSelectedOrderId(null)}
          ></div>
          <div className="fixed top-0 right-0 h-screen w-full sm:w-[520px] bg-white z-[60] shadow-2xl drawer-animate flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-text-primary">Order Details</h3>
                  <span className="font-mono text-xs font-bold text-brand-gold">{selectedOrder.id}</span>
                </div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">{selectedOrder.date}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderId(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Shipping Address */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-brand-gold">
                  <MapPin className="w-4 h-4" />
                  <h4 className="text-[10px] font-bold tracking-widest uppercase">Shipping Address</h4>
                </div>
                <p className="text-sm font-bold text-text-primary leading-relaxed">
                  {selectedOrder.address}
                </p>
              </div>

              {/* Order Status Timeline Mock */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Order Status History</h4>
                <div className="flex justify-between items-center px-4">
                  {[
                    { icon: Clock, label: "Pending", active: true },
                    { icon: CheckCircle, label: "Confirmed", active: ["Confirmed", "Shipped", "Delivered"].includes(selectedOrder.status) },
                    { icon: Package, label: "Shipped", active: ["Shipped", "Delivered"].includes(selectedOrder.status) },
                    { icon: Truck, label: "Delivered", active: selectedOrder.status === "Delivered" },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 relative">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        step.active ? "bg-brand-gold text-white shadow-lg shadow-brand-gold/20" : "bg-gray-100 text-text-muted"
                      )}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold",
                        step.active ? "text-text-primary" : "text-text-muted"
                      )}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Payment */}
              <div className="grid grid-cols-2 gap-6 border-y border-gray-100 py-6">
                <div>
                  <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-2">Customer Info</h4>
                  <p className="text-sm font-bold text-text-primary">{selectedOrder.customer}</p>
                  <p className="text-xs text-text-secondary mt-1">{selectedOrder.email}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-2">Payment Details</h4>
                  <p className="text-sm font-bold text-text-primary">{selectedOrder.payment}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1 tracking-widest">Paid Fully</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Items Ordered ({selectedOrder.itemCount})</h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={item} alt="product" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-text-primary truncate">Premium Silk Collection Item</h5>
                        <p className="text-[10px] text-text-muted mt-0.5 font-bold uppercase tracking-widest">SKU: LMR-SK-00{i+1}</p>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-xs font-bold text-text-secondary tracking-widest">1 x Rs.4,140</span>
                           <span className="text-sm font-bold text-text-primary">Rs.4,140</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-900 text-white p-6 rounded-2xl space-y-3 shadow-xl">
                 <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                   <span>Subtotal</span>
                   <span>Rs.11,820</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                   <span>Shipping</span>
                   <span className="text-emerald-400">FREE</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-800">
                   <span>Tax (VAT)</span>
                   <span>Rs.600</span>
                 </div>
                 <div className="flex justify-between text-lg pt-1">
                   <span className="font-bold">Total Amount</span>
                   <span className="font-bold text-brand-gold">{selectedOrder.total}</span>
                 </div>
              </div>
            </div>

            {/* Action Bar with Status Update */}
            <div className="p-6 border-t border-gray-100 bg-white flex flex-col gap-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Update Order Status</label>
                 <div className="relative group">
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-brand-gold transition-all appearance-none cursor-pointer"
                    >
                      {statusTabs.filter(t => t !== "All").map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-brand-gold transition-colors pointer-events-none" />
                 </div>
               </div>
               <div className="flex gap-3 mt-2">
                 <button className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-text-secondary hover:bg-gray-100 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                   <Printer className="w-3.5 h-3.5" />
                   Shipping Label
                 </button>
                 <button 
                  onClick={() => setSelectedOrderId(null)}
                  className="flex-1 px-4 py-3 bg-brand-gold text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20 uppercase tracking-widest"
                 >
                   Save & Close
                 </button>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <OrdersList />
    </Suspense>
  );
}
