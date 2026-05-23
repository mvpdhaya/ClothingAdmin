"use client";

import { useState, useMemo, useEffect, Suspense, Fragment, useRef } from "react";
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
  Printer,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import { useStoreSettings } from "@/lib/StoreContext";
import type { Order } from "@/lib/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState(customerName || "");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [savingStatus, setSavingStatus] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const { storeName } = useStoreSettings();

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (customerName) setSearchQuery(customerName);
  }, [customerName]);

  useEffect(() => {
    if (selectedOrderId) {
      fetchOrderItems();
      // Lock background scroll when drawer is open
      document.body.style.overflow = 'hidden';
      // Also lock the main scroll container (the ml-64 div in layout)
      const mainScroller = document.querySelector<HTMLElement>('.main-scroll-container');
      if (mainScroller) mainScroller.style.overflow = 'hidden';
    } else {
      setOrderItems([]);
      // Restore scroll
      document.body.style.overflow = '';
      const mainScroller = document.querySelector<HTMLElement>('.main-scroll-container');
      if (mainScroller) mainScroller.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      const mainScroller = document.querySelector<HTMLElement>('.main-scroll-container');
      if (mainScroller) mainScroller.style.overflow = '';
    };
  }, [selectedOrderId]);

  async function fetchOrderItems() {
    if (!selectedOrderId) return;
    setLoadingItems(true);
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", selectedOrderId);
    if (!error && data) {
      setOrderItems(data);
    }
    setLoadingItems(false);
  }

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesTab = activeTab === "All" || order.status === activeTab;
      const matchesPayment = paymentFilter === "All" || order.payment === paymentFilter;
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesPayment && matchesSearch;
    });
  }, [orders, activeTab, searchQuery, paymentFilter]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedOrderId) return;
    setSavingStatus(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", selectedOrderId);
    if (!error) {
      setOrders(prev =>
        prev.map(o => o.id === selectedOrderId ? { ...o, status: newStatus } : o)
      );
    }
    setSavingStatus(false);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    } catch {
      return iso;
    }
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export!");
      return;
    }

    const headers = [
      "Order ID", 
      "Customer Name", 
      "Customer Email", 
      "Address", 
      "Items Count", 
      "Total", 
      "Payment", 
      "Status", 
      "Date"
    ];

    const escape = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredOrders.map(order => [
      escape(order.id),
      escape(order.customer_name),
      escape(order.customer_email),
      escape(order.address),
      escape(order.item_count),
      escape(order.total),
      escape(order.payment),
      escape(order.status),
      escape(formatDate(order.created_at))
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintLabel = () => {
    if (!selectedOrder) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const addressLines = selectedOrder.address ? selectedOrder.address.split('\n') : [];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipping Label - ${selectedOrder.id}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div
          style="
            width: 500px;
            border: 2px solid #000;
            border-radius: 12px;
            padding: 32px;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #000;
            background: #fff;
            box-sizing: border-box;
            margin: 0 auto;
          "
        >
          <!-- Top Section: Logo & Ship To -->
          <div
            style="
              display: flex;
              border-bottom: 2px solid #000;
              padding-bottom: 24px;
              margin-bottom: 24px;
            "
          >
            <!-- Logo -->
            <div style="flex: 1; display: flex; align-items: center;">
              <div style="width: 100%;">
                <div
                  style="
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: 4px;
                    line-height: 1;
                    text-transform: uppercase;
                  "
                >
                  ${storeName || 'THREADORA'}
                </div>
                <div
                  style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                    font-size: 14px;
                    letter-spacing: 3px;
                    font-weight: 500;
                  "
                >
                  <span style="flex: 1; height: 1px; background: #000;"></span>
                  CLOTHING CO.
                  <span style="flex: 1; height: 1px; background: #000;"></span>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div
              style="
                width: 1px;
                background: #000;
                margin: 0 24px;
              "
            ></div>

            <!-- Ship To -->
            <div style="flex: 1;">
              <div
                style="
                  font-size: 11px;
                  font-weight: 600;
                  letter-spacing: 1px;
                  margin-bottom: 8px;
                "
              >
                SHIP TO:
              </div>
              <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
                ${selectedOrder.customer_name}
              </div>
              <div style="font-size: 14px; line-height: 1.6; font-weight: 500;">
                ${addressLines.map(line => `<div>${line}</div>`).join('')}
              </div>
            </div>
          </div>

          <!-- Middle Section: Order Info & Shipping Details -->
          <div
            style="
              display: flex;
              border-bottom: 2px solid #000;
              padding-bottom: 24px;
              margin-bottom: 24px;
            "
          >
            <!-- Order Info -->
            <div style="flex: 1;">
              <div
                style="
                  font-size: 11px;
                  font-weight: 600;
                  letter-spacing: 1px;
                  margin-bottom: 8px;
                "
              >
                ORDER NO.
              </div>
              <div
                style="
                  font-size: 22px;
                  font-weight: 700;
                  margin-bottom: 20px;
                "
              >
                ORD-${selectedOrder.id.split('-')[0].toUpperCase()}
              </div>

              <div
                style="
                  font-size: 11px;
                  font-weight: 600;
                  letter-spacing: 1px;
                  margin-bottom: 8px;
                "
              >
                DATE
              </div>
              <div style="font-size: 18px; font-weight: 600;">
                ${new Date(selectedOrder.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <!-- Divider -->
            <div
              style="
                width: 1px;
                background: #000;
                margin: 0 24px;
              "
            ></div>

            <!-- Shipping Details -->
            <div style="flex: 1;">
              <div
                style="
                  font-size: 11px;
                  font-weight: 600;
                  letter-spacing: 1px;
                  margin-bottom: 6px;
                "
              >
                SHIPPING METHOD
              </div>
              <div
                style="
                  font-size: 16px;
                  font-weight: 700;
                  margin-bottom: 16px;
                "
              >
                STANDARD SHIPPING
              </div>

              <div
                style="
                  font-size: 11px;
                  font-weight: 600;
                  letter-spacing: 1px;
                  margin-bottom: 6px;
                "
              >
                PACKAGE TYPE
              </div>
              <div
                style="
                  font-size: 16px;
                  font-weight: 700;
                  margin-bottom: 16px;
                "
              >
                POLY MAILER
              </div>

              <div
                style="
                  font-size: 11px;
                  font-weight: 600;
                  letter-spacing: 1px;
                  margin-bottom: 6px;
                "
              >
                WEIGHT
              </div>
              <div style="font-size: 16px; font-weight: 700;">0.45 kg</div>
            </div>
          </div>

          <!-- Package Contents -->
          <div style="margin-bottom: 24px;">
            <div
              style="
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
              "
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M20.38 3.46L16 2L12 5L8 2L3.62 3.46C3.23 3.59 3 3.96 3 4.37V20.5C3 20.78 3.22 21 3.5 21H20.5C20.78 21 21 20.78 21 20.5V4.37C21 3.96 20.77 3.59 20.38 3.46Z" />
                <path d="M16 2V10" />
                <path d="M8 2V10" />
              </svg>
              <span
                style="
                  font-size: 14px;
                  font-weight: 700;
                  letter-spacing: 1px;
                "
              >
                PACKAGE CONTENTS
              </span>
            </div>

            <!-- Table Header -->
            <div
              style="
                display: flex;
                background: #f5f5f5;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 1px;
                border-radius: 4px;
                margin-bottom: 4px;
              "
            >
              <div style="flex: 2;">ITEM</div>
              <div style="flex: 1; text-align: center;">SIZE</div>
              <div style="flex: 1; text-align: right;">QTY</div>
            </div>

            <!-- Table Rows -->
            ${orderItems.map((item, index) => `
              <div
                style="
                  display: flex;
                  padding: 12px;
                  border-bottom: ${index < orderItems.length - 1 ? '1px solid #e0e0e0' : 'none'};
                  font-size: 14px;
                "
              >
                <div style="flex: 2;">
                  <div style="font-weight: 600;">${item.product_name}</div>
                  <div style="color: #666; font-size: 13px; marginTop: 2px;">
                    ${item.selected_color || ''}
                  </div>
                </div>
                <div
                  style="
                    flex: 1;
                    text-align: center;
                    font-weight: 500;
                    align-self: center;
                  "
                >
                  ${item.selected_size || 'One Size'}
                </div>
                <div
                  style="
                    flex: 1;
                    text-align: right;
                    font-weight: 500;
                    align-self: center;
                  "
                >
                  ${item.quantity}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Footer -->
          <div
            style="
              display: flex;
              border-top: 2px solid #000;
              padding-top: 20px;
            "
          >
            <!-- Thank You -->
            <div style="flex: 1; display: flex; gap: 12px;">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                style="flex-shrink: 0;"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <div>
                <div
                  style="
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                  "
                >
                  THANK YOU FOR YOUR ORDER!
                </div>
                <div
                  style="
                    font-size: 12px;
                    color: #555;
                    line-height: 1.5;
                    font-weight: 500;
                  "
                >
                  <div>We hope you love your new pieces.</div>
                  <div>Made to wear. Made to last.</div>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div
              style="
                width: 1px;
                background: #000;
                margin: 0 20px;
              "
            ></div>

            <!-- Handle With Care -->
            <div
              style="
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              "
            >
              <div
                style="
                  font-size: 13px;
                  font-weight: 700;
                  letter-spacing: 0.5px;
                  margin-bottom: 4px;
                "
              >
                HANDLE WITH CARE
              </div>
              <div
                style="
                  font-size: 12px;
                  font-weight: 600;
                  letter-spacing: 1px;
                "
              >
                THANK YOU!
              </div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-text-primary">Orders</h2>
          <span className="px-2 py-0.5 bg-gray-100 text-text-muted text-xs font-bold rounded-full">
            {filteredOrders.length} {activeTab !== "All" ? activeTab : ""} Orders Found
          </span>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-text-secondary hover:bg-gray-50 transition-colors shadow-sm"
        >
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
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-lg transition-all border shadow-sm relative group",
                showFilters || paymentFilter !== "All" 
                  ? "bg-brand-gold-light border-brand-gold text-brand-gold" 
                  : "bg-white border-gray-200 text-text-muted hover:bg-gray-100"
              )}
            >
              <Filter className="w-4 h-4" />
              {paymentFilter !== "All" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  1
                </span>
              )}
            </button>

            {/* Filter Popover */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] animate-fade-in flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-brand-gold" />
                    <h3 className="text-sm font-bold text-text-primary">Filters</h3>
                  </div>
                  {paymentFilter !== "All" && (
                    <button onClick={() => setPaymentFilter("All")} className="text-[10px] font-bold text-text-muted hover:text-brand-gold uppercase tracking-widest transition-colors">
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Payment Method */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Payment Method</label>
                    <div className="flex flex-wrap gap-2">
                      {["All", "UPI", "COD", "Card"].map((method) => (
                        <button 
                          key={method} 
                          onClick={() => setPaymentFilter(method)} 
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border", 
                            paymentFilter === method 
                              ? "bg-brand-sidebar text-white border-brand-sidebar shadow-sm" 
                              : "bg-white text-text-muted border-gray-200 hover:border-brand-gold hover:text-brand-gold"
                          )}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                  <button onClick={() => setShowFilters(false)} className="w-full py-2.5 bg-brand-gold text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-brand-gold/20 uppercase tracking-widest">
                    Show {filteredOrders.length} Results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-3" />
            <p className="text-sm text-text-muted font-bold">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
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
                            <span className="font-bold text-text-primary">{order.customer_name}</span>
                            <span className="text-[10px] text-text-muted font-bold truncate max-w-[120px]">{order.customer_email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-text-muted" />
                          <span className="text-xs font-bold text-text-secondary">{order.item_count} item{order.item_count !== 1 ? "s" : ""}</span>
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
                      <td className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-tighter">{formatDate(order.created_at)}</td>
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
                <button className="w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg bg-brand-gold text-white shadow-sm">1</button>
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
            <p className="text-sm text-text-muted mt-1">Try adjusting your filters or search query to find what you&apos;re looking for.</p>
            <button
              onClick={() => { setActiveTab("All"); setSearchQuery(""); setPaymentFilter("All"); }}
              className="mt-6 text-sm font-bold text-brand-gold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
          <div
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm transition-opacity pointer-events-auto"
            onClick={() => setSelectedOrderId(null)}
            onWheel={(e) => e.preventDefault()}
          ></div>
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl animate-fade-in flex flex-col pointer-events-auto overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 gap-4 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-text-primary whitespace-nowrap">Order Details</h3>
                  <span className="font-mono text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full truncate max-w-[160px]">{selectedOrder.id}</span>
                </div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrderId(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8">
              {/* Shipping Address */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-brand-gold">
                  <MapPin className="w-4 h-4" />
                  <h4 className="text-[10px] font-bold tracking-widest uppercase">Shipping Address</h4>
                </div>
                <p className="text-sm font-bold text-text-primary leading-relaxed">{selectedOrder.address}</p>
              </div>

              {/* Order Status Timeline */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Order Status</h4>
                {selectedOrder.status === "Cancelled" ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100">
                    <X className="w-5 h-5 text-rose-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-rose-700">Order Cancelled</p>
                      <p className="text-xs text-rose-500">This order has been cancelled</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center px-2">
                    {[
                      { icon: Clock, label: "Pending", active: ["Pending","Confirmed","Shipped","Delivered"].includes(selectedOrder.status) },
                      { icon: CheckCircle, label: "Confirmed", active: ["Confirmed", "Shipped", "Delivered"].includes(selectedOrder.status) },
                      { icon: Package, label: "Shipped", active: ["Shipped", "Delivered"].includes(selectedOrder.status) },
                      { icon: Truck, label: "Delivered", active: selectedOrder.status === "Delivered" },
                    ].map((step, i, arr) => (
                      <Fragment key={i}>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                            step.active ? "bg-brand-gold text-white shadow-md shadow-brand-gold/20" : "bg-gray-100 text-text-muted"
                          )}>
                            <step.icon className="w-4 h-4" />
                          </div>
                          <span className={cn("text-[9px] font-bold text-center", step.active ? "text-text-primary" : "text-text-muted")}>{step.label}</span>
                        </div>
                        {i < arr.length - 1 && (
                          <div className={cn(
                            "flex-1 h-0.5 mb-4 mx-1 transition-colors",
                            arr[i + 1].active ? "bg-brand-gold" : "bg-gray-200"
                          )} />
                        )}
                      </Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Ordered Items</h4>
                <div className="space-y-3">
                  {loadingItems ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
                    </div>
                  ) : orderItems.length > 0 ? (
                    orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                          {item.image ? (
                            <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-bold text-text-primary truncate">{item.product_name}</h5>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Qty: {item.quantity}</span>
                            {item.selected_size && <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Size: {item.selected_size}</span>}
                            {item.selected_color && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Color:</span>
                                <div className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: item.selected_color }}></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-text-primary">Rs.{item.total_price}</p>
                          <p className="text-[10px] text-text-muted font-bold mt-0.5">Rs.{item.price} each</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Package className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-text-muted font-bold">No item details found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & Payment */}
              <div className="grid grid-cols-2 gap-6 border-y border-gray-100 py-6">
                <div>
                  <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-2">Customer Info</h4>
                  <p className="text-sm font-bold text-text-primary">{selectedOrder.customer_name}</p>
                  <p className="text-xs text-text-secondary mt-1">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-2">Payment Details</h4>
                  <p className="text-sm font-bold text-text-primary">{selectedOrder.payment}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1 tracking-widest">Paid Fully</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-900 text-white p-6 rounded-2xl space-y-3 shadow-xl">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-800">
                  <span>Items Ordered</span>
                  <span>{selectedOrder.item_count} item{selectedOrder.item_count !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between text-lg pt-1">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-bold text-brand-gold">{selectedOrder.total}</span>
                </div>
              </div>

              {/* Update Order Status — inside scrollable area */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Update Order Status</h4>
                <div className="relative group">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={savingStatus}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-brand-gold transition-all appearance-none cursor-pointer disabled:opacity-60"
                  >
                    {statusTabs.filter(t => t !== "All").map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-brand-gold transition-colors pointer-events-none" />
                </div>
                {savingStatus && (
                  <div className="flex items-center gap-2 text-xs text-brand-gold font-bold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </div>
                )}
              </div>

              {/* Print Label */}
              <button 
                onClick={handlePrintLabel}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-text-secondary hover:bg-gray-50 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Shipping Label
              </button>

            </div>

            {/* Action Bar — simple close */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="w-full px-4 py-3 bg-brand-gold text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
