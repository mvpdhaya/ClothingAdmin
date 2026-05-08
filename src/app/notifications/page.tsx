"use client";

import { useState } from "react";
import { 
  Bell, 
  ShoppingBag, 
  UserPlus, 
  Info, 
  Check, 
  Trash2, 
  Search,
  Filter,
  CheckCircle2,
  Clock
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Order #ORD-2024", desc: "Arjun Kumar placed an order for Rs. 4,500. Address: 123 Colombo St, Sri Lanka.", time: "5 minutes ago", date: "Today", type: "order", read: false },
    { id: 2, title: "New Customer Signup", desc: "Sneha Reddy created a new account using Google Auth.", time: "2 hours ago", date: "Today", type: "user", read: false },
    { id: 3, title: "Stock Alert: White Oxford", desc: "Classic White Oxford (Size M) is running low in stock. Current inventory: 2 units.", time: "5 hours ago", date: "Today", type: "alert", read: true },
    { id: 4, title: "Order Cancelled #ORD-2021", desc: "Order was cancelled by the customer due to delivery delay.", time: "1 day ago", date: "Yesterday", type: "alert", read: true },
    { id: 5, title: "System Update Complete", desc: "LUMIÈRE Admin Panel has been updated to v2.4.0 with improved performance.", time: "2 days ago", date: "May 5, 2024", type: "system", read: true },
    { id: 6, title: "New Review Received", desc: "A customer left a 5-star review for 'Linen Summer Dress'.", time: "3 days ago", date: "May 4, 2024", type: "user", read: true },
  ]);

  const [filter, setFilter] = useState("all");

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "orders") return n.type === "order";
    if (filter === "alerts") return n.type === "alert";
    return true;
  });

  const markRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return <ShoppingBag className="w-5 h-5" />;
      case "user": return <UserPlus className="w-5 h-5" />;
      case "system": return <CheckCircle2 className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "order": return "bg-blue-50 text-blue-500 border-blue-100";
      case "user": return "bg-purple-50 text-purple-500 border-purple-100";
      case "system": return "bg-emerald-50 text-emerald-500 border-emerald-100";
      default: return "bg-amber-50 text-amber-500 border-amber-100";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Notifications</h2>
          <p className="text-sm text-text-muted mt-1">Stay updated with your store's latest activities</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-text-primary hover:bg-gray-50 transition-all shadow-sm"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          {["all", "unread", "orders", "alerts"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                filter === t 
                  ? "bg-brand-gold text-white shadow-md shadow-brand-gold/20" 
                  : "text-text-muted hover:bg-gray-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-brand-gold outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredNotifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-6 flex gap-6 group transition-all relative",
                  !n.read ? "bg-brand-gold/[0.02]" : "hover:bg-gray-50/50"
                )}
              >
                {!n.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-gold shadow-[2px_0_10px_rgba(180,145,95,0.2)]"></div>
                )}
                
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
                  getTypeStyles(n.type)
                )}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={cn(
                      "text-base leading-tight",
                      !n.read ? "font-bold text-text-primary" : "text-text-secondary font-medium"
                    )}>
                      {n.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Clock className="w-3 h-3" />
                      {n.time}
                    </div>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed max-w-2xl mb-4">
                    {n.desc}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                      {n.date}
                    </div>
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button 
                          onClick={() => markRead(n.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">All clear!</h3>
            <p className="text-sm text-text-muted">You've caught up with all your notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
