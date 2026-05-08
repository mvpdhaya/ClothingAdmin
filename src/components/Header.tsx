"use client";

import { Search, Bell, User, Check, Trash2, ShoppingBag, UserPlus, Info } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Order #ORD-2024", desc: "Arjun Kumar placed an order for Rs. 4,500", time: "5m ago", type: "order", read: false },
    { id: 2, title: "New Customer Signup", desc: "Sneha Reddy created a new account", time: "2h ago", type: "user", read: false },
    { id: 3, title: "Stock Alert: White Oxford", desc: "Classic White Oxford is running low (2 left)", time: "5h ago", type: "alert", read: true },
    { id: 4, title: "Order Cancelled #ORD-2021", desc: "Order was cancelled by the customer", time: "1d ago", type: "alert", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return <ShoppingBag className="w-4 h-4" />;
      case "user": return <UserPlus className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Format pathname to title (e.g., "/flash-sale" -> "Flash Sale")
  const getTitle = () => {
    if (pathname === "/") return "Dashboard";
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    return parts[0]
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header 
      className="fixed top-0 right-0 left-64 h-16 border-b border-gray-100 flex items-center justify-between px-8 z-[100]"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-text-muted group-focus-within:text-brand-gold transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-11 pr-16 py-2.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm w-[280px] focus:w-[320px] outline-none focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/5 transition-all duration-300 placeholder:text-text-muted/60"
          />
          <div className="absolute right-3 hidden lg:flex items-center gap-1 px-1.5 py-1 bg-white border border-gray-200 rounded-md shadow-sm pointer-events-none group-focus-within:opacity-0 transition-opacity">
            <span className="text-[10px] font-bold text-text-muted">⌘</span>
            <span className="text-[10px] font-bold text-text-muted">K</span>
          </div>
        </div>

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-text-secondary hover:bg-gray-100 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-gold rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-brand-gold text-white text-[10px] rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <button 
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-brand-gold hover:underline uppercase tracking-wider"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors relative cursor-pointer group ${!n.read ? 'bg-brand-gold/[0.02]' : ''}`}
                      >
                        {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-gold"></div>}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                          n.type === 'order' ? 'bg-blue-50 text-blue-500' : 
                          n.type === 'user' ? 'bg-purple-50 text-purple-500' : 
                          'bg-amber-50 text-amber-500'
                        }`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className={`text-sm leading-tight truncate ${!n.read ? 'font-bold text-text-primary' : 'text-text-secondary font-medium'}`}>
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-text-muted whitespace-nowrap ml-2">{n.time}</span>
                          </div>
                          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                            {n.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-text-muted">No new notifications</p>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                <Link 
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="w-full py-2.5 text-xs font-bold text-text-primary bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link 
          href="/profile"
          className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 transition-all px-3 py-1.5 rounded-xl group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-text-primary leading-none group-hover:text-brand-gold transition-colors">Rahul Sharma</p>
            <p className="text-xs text-text-muted mt-1">Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center text-white border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
            <User className="w-5 h-5" />
          </div>
        </Link>
      </div>
    </header>
  );
}
