"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStoreSettings } from "@/lib/StoreContext";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  FolderTree, 
  Image as ImageIcon, 
  Zap, 
  Layout, 
  Settings, 
  ShieldCheck,
  LogOut,
  ChevronRight,
  User,
  Bell
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navSections = [
  {
    title: "MAIN",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: ShoppingBag, label: "Orders", href: "/orders", badge: "3" },
      { icon: Package, label: "Products", href: "/products" },
      { icon: Users, label: "Customers", href: "/customers" },
      { icon: Bell, label: "Notifications", href: "/notifications" },
    ]
  },
  {
    title: "STORE",
    items: [
      { icon: FolderTree, label: "Categories", href: "/categories" },
      { icon: Zap, label: "Flash Sale", href: "/flash-sale", badge: "LIVE", badgeColor: "bg-success" },
      { icon: Layout, label: "Homepage Builder", href: "/homepage-builder" },
    ]
  },

  {
    title: "SETTINGS",
    items: [
      { icon: Settings, label: "Store Settings", href: "/settings" },
      { icon: ShieldCheck, label: "Admin Users", href: "/admin-users" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [isFlashSaleLive, setIsFlashSaleLive] = useState<boolean>(false);
  const { storeName } = useStoreSettings();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchPendingOrdersCount();
    fetchFlashSaleStatus();

    // Set up real-time subscription for orders
    const ordersChannel = supabase
      .channel('orders-count-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchPendingOrdersCount();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const fetchPendingOrdersCount = async () => {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');
      
      if (!error && count !== null) {
        setPendingOrdersCount(count);
      }
    } catch (error) {
      console.error('Error fetching pending orders count:', error);
    }
  };

  const fetchFlashSaleStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('flash_sale_settings')
        .select('active')
        .single();
      
      if (!error && data) {
        setIsFlashSaleLive(data.active);
      }
    } catch (error) {
      console.error('Error fetching flash sale status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      window.location.href = "/";
    }
  };

  const dynamicNavSections = navSections.map(section => ({
    ...section,
    items: section.items.map(item => {
      if (item.label === "Orders") {
        return { ...item, badge: pendingOrdersCount > 0 ? pendingOrdersCount.toString() : undefined };
      }
      if (item.label === "Flash Sale") {
        return { ...item, badge: isFlashSaleLive ? "LIVE" : undefined };
      }
      return item;
    })
  }));

  return (
    <aside 
      className="fixed top-0 left-0 w-64 h-screen flex flex-col z-40 border-r border-white/5"
      style={{ backgroundColor: "#0F172A" }}
    >
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center font-bold text-white text-xl">
            {storeName ? storeName.charAt(0).toUpperCase() : 'L'}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {storeName}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-8 scrollbar-hide">
        {dynamicNavSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-4 text-[10px] font-bold tracking-widest text-text-muted/50 uppercase">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "sidebar-link",
                        isActive && "active"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", isActive ? "text-brand-gold" : "text-text-muted")} />
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-bold text-white",
                          ("badgeColor" in item && item.badgeColor) ? item.badgeColor : "bg-brand-gold"
                        )}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3 h-3 text-brand-gold opacity-50" />}
                    </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 mt-auto border-t border-white/5 bg-black/10">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Administrator</p>
            <p className="text-[10px] text-text-muted truncate">{user?.email || "loading..."}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 text-text-muted hover:text-danger transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
