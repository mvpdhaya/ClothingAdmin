"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  Package,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const statusStyles = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const STATUS_COLORS = [
  { key: "Delivered", color: "bg-emerald-500", stroke: "#10B981" },
  { key: "Confirmed", color: "bg-blue-500",    stroke: "#2563EB" },
  { key: "Shipped",   color: "bg-purple-500",  stroke: "#7C3AED" },
  { key: "Pending",   color: "bg-amber-500",   stroke: "#F59E0B" },
  { key: "Cancelled", color: "bg-rose-500",    stroke: "#EF4444" },
];

// Parse total whether stored as number or "Rs.1,200" string
function parseTotal(total: string | number): number {
  if (typeof total === "number") return total;
  // Remove "Rs." prefix first to prevent the dot from being treated as a decimal point
  const clean = String(total).replace(/Rs\.?/i, "");
  return parseFloat(clean.replace(/[^0-9.]/g, "")) || 0;
}

export default function Dashboard() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [statsCards, setStatsCards] = useState([
    { label: "Total Revenue",   value: "—", change: "—",      trend: "neutral" as "up"|"down"|"neutral", icon: DollarSign, sparkline: [40,35,50,45,60,55,70] },
    { label: "Total Orders",    value: "—", change: "—",      trend: "neutral" as "up"|"down"|"neutral", icon: ShoppingBag, sparkline: [30,40,35,50,45,55,50] },
    { label: "Total Products",  value: "—", change: "Active", trend: "neutral" as "up"|"down"|"neutral", icon: Package,    sparkline: [50,50,50,50,50,50,50] },
    { label: "Total Customers", value: "—", change: "—",      trend: "neutral" as "up"|"down"|"neutral", icon: Users,      sparkline: [20,30,40,35,50,60,75] },
  ]);

  const [chartPoints, setChartPoints] = useState<{ x: number; y: number }[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ key: string; count: number; pct: number; color: string; stroke: string }[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [topProducts, setTopProducts] = useState<{ name: string; category: string; sales: number; revenue: string; image: string }[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [timeFilter, setTimeFilter] = useState("30days");

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Fetch everything in parallel
      const [
        { count: productCount },
        { count: activeProductCount },
        { count: customerCount },
        { data: rawCustomers },
        { data: rawOrders },
      ] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("status", "Active"),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("created_at"),
        supabase.from("orders").select("id, created_at, total, status, customer:customers(full_name), subtotal").order("created_at", { ascending: false }),
      ]);

      const orders = (rawOrders ?? []) as unknown as Order[];
      setAllOrders(orders);
      const now = new Date();
      const ms30 = 30 * 24 * 60 * 60 * 1000;
      const cutoff30 = new Date(now.getTime() - ms30);
      const cutoff60 = new Date(now.getTime() - 2 * ms30);

      const cur = orders.filter(o => new Date(o.created_at) >= cutoff30);
      const prev = orders.filter(o => { const d = new Date(o.created_at); return d >= cutoff60 && d < cutoff30; });

      const nonCancelled = (arr: Order[]) => arr.filter(o => o.status !== "Cancelled");
      const sumRevenue = (arr: Order[]) => nonCancelled(arr).reduce((s, o) => s + parseTotal(o.total), 0);

      const totalRev  = sumRevenue(orders);
      const curRev    = sumRevenue(cur);
      const prevRev   = sumRevenue(prev);
      const curCount  = cur.length;
      const prevCount = prev.length;

      const pctChange = (a: number, b: number) => {
        if (b === 0) return a > 0 ? "+New" : "—";
        const pct = ((a - b) / b) * 100;
        return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
      };
      const trend = (a: number, b: number): "up" | "down" | "neutral" => {
        if (b === 0) return a > 0 ? "up" : "neutral";
        return a >= b ? "up" : "down";
      };

      // Customers joined calculations
      const customers = (rawCustomers ?? []) as any[];
      const curCustomers = customers.filter(c => {
        const joinDateStr = c.created_at || c.joined;
        if (!joinDateStr) return false;
        const joinDate = new Date(joinDateStr);
        return !isNaN(joinDate.getTime()) && joinDate >= cutoff30;
      });
      const prevCustomers = customers.filter(c => {
        const joinDateStr = c.created_at || c.joined;
        if (!joinDateStr) return false;
        const joinDate = new Date(joinDateStr);
        return !isNaN(joinDate.getTime()) && joinDate >= cutoff60 && joinDate < cutoff30;
      });

      const curCustomerCount = curCustomers.length;
      const prevCustomerCount = prevCustomers.length;

      const activePCount = activeProductCount ?? 0;

      setStatsCards([
        {
          label: "Total Revenue",
          value: `Rs.${Math.round(totalRev).toLocaleString()}`,
          change: pctChange(curRev, prevRev),
          trend: trend(curRev, prevRev),
          icon: DollarSign,
          sparkline: [40,35,50,45,60,55,70],
        },
        {
          label: "Total Orders",
          value: orders.length.toLocaleString(),
          change: pctChange(curCount, prevCount),
          trend: trend(curCount, prevCount),
          icon: ShoppingBag,
          sparkline: [30,40,35,50,45,55,50],
        },
        {
          label: "Total Products",
          value: (productCount ?? 0).toLocaleString(),
          change: activePCount > 0 ? "Active" : "Inactive",
          trend: activePCount > 0 ? "up" : "neutral",
          icon: Package,
          sparkline: [50,50,50,50,50,50,50],
        },
        {
          label: "Total Customers",
          value: (customerCount ?? 0).toLocaleString(),
          change: curCustomerCount > 0 ? `+${curCustomerCount} this month` : "—",
          trend: trend(curCustomerCount, prevCustomerCount),
          icon: Users,
          sparkline: [20,30,40,35,50,60,75],
        },
      ]);

      // --- Order Status Breakdown ---
      const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const total = orders.length || 1;
      setTotalOrders(orders.length);
      setStatusBreakdown(
        STATUS_COLORS
          .map(s => ({ ...s, count: statusCounts[s.key] || 0, pct: Math.round(((statusCounts[s.key] || 0) / total) * 100) }))
          .filter(s => s.count > 0)
      );

      // --- Recent Orders (already sorted by created_at desc from query) ---
      setRecentOrders(orders.slice(0, 5));

      // --- Top Selling Products ---
      // Note: New schema doesn't have 'items' array in 'orders' table directly
      // We should use 'order_items' for this, but for now we'll skip or use fallback
      let freq: Record<string, number> = {};
      // If we joined order_items we could do this properly. 
      // For now, let's just make sure it doesn't crash if items is missing.
      orders.forEach(o => {
        if (Array.isArray((o as any).items)) {
          (o as any).items.forEach((item: string) => {
            freq[item] = (freq[item] || 0) + 1;
          });
        }
      });

      const topNames = Object.entries(freq).sort(([, a], [, b]) => b - a).slice(0, 5);
      if (topNames.length > 0) {
        const { data: prods } = await supabase
          .from("products")
          .select("name, category, image, price")
          .in("name", topNames.map(([n]) => n));
        setTopProducts(
          topNames.map(([name, sales]) => {
            const p = (prods ?? []).find(x => x.name === name);
            return {
              name,
              category: p?.category ?? "—",
              sales,
              revenue: `Rs.${Math.round((p?.price ?? 0) * sales).toLocaleString()}`,
              image: p?.image ?? "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&q=80",
            };
          })
        );
      } else {
        setTopProducts([]);
      }

      setLoading(false);
    }

    load();
  }, []);

  useEffect(() => {
    if (!allOrders.length && !loading) return;

    const nonCancelled = allOrders.filter(o => o.status !== "Cancelled");
    const now = new Date();
    
    let labels: string[] = [];
    let vals: number[] = [];

    if (timeFilter === "30days") {
      const days: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        days[d.toISOString().split("T")[0]] = 0;
      }
      nonCancelled.forEach(o => {
        const k = o.created_at.split("T")[0];
        if (k in days) days[k] += parseTotal(o.total);
      });
      const dayKeys = Object.keys(days).sort();
      vals = dayKeys.map(k => days[k]);
      labels = [dayKeys[0], dayKeys[7], dayKeys[14], dayKeys[21], dayKeys[29]].map(k => {
        if (!k) return "";
        return new Date(k).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      });
    } 
    else if (timeFilter === "6months") {
      const months: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months[k] = 0;
      }
      nonCancelled.forEach(o => {
        const d = new Date(o.created_at);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (k in months) months[k] += parseTotal(o.total);
      });
      const monthKeys = Object.keys(months).sort();
      vals = monthKeys.map(k => months[k]);
      labels = monthKeys.map(k => {
        const [y, m] = k.split("-");
        return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("en-GB", { month: "short" });
      });
    }
    else if (timeFilter === "year") {
      const months: Record<string, number> = {};
      const currentYear = now.getFullYear();
      for (let i = 0; i < 12; i++) {
        const k = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
        months[k] = 0;
      }
      nonCancelled.forEach(o => {
        const d = new Date(o.created_at);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (k in months) months[k] += parseTotal(o.total);
      });
      const monthKeys = Object.keys(months).sort();
      vals = monthKeys.map(k => months[k]);
      labels = monthKeys.map(k => {
        const [y, m] = k.split("-");
        return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("en-GB", { month: "short" });
      });
    }

    const maxVal = Math.max(...vals, 1);
    setChartPoints(vals.map((v, i) => ({
      x: vals.length > 1 ? (i / (vals.length - 1)) * 1000 : 500,
      y: 280 - (v / maxVal) * 250,
    })));
    setChartLabels(labels);
    
  }, [timeFilter, allOrders, loading]);

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return iso; }
  };

  // Build donut segments
  let dashOffsetAcc = 0;
  const circumference = 2 * Math.PI * 70; // ~440

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <div key={i} className="card card-hover flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-gray-50 rounded-lg text-text-secondary">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
                stat.trend === "up"   ? "text-success bg-emerald-50" :
                stat.trend === "down" ? "text-danger bg-rose-50" :
                "text-text-muted bg-gray-50"
              )}>
                {stat.trend === "up"   && <ArrowUpRight className="w-3 h-3 mr-1" />}
                {stat.trend === "down" && <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted tracking-widest uppercase">{stat.label}</p>
              {loading
                ? <div className="h-8 w-24 bg-gray-100 rounded animate-pulse mt-1" />
                : <h3 className="text-2xl mono-stats mt-1 text-text-primary">{stat.value}</h3>
              }
            </div>
            <div className="h-10 mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                {(() => {
                  const max = Math.max(...stat.sparkline);
                  const min = Math.min(...stat.sparkline);
                  const range = max - min || 1;
                  const getY = (v: number) => 38 - ((v - min) / range) * 36;
                  return (
                    <path
                      d={`M 0 ${getY(stat.sparkline[0])} ${stat.sparkline.map((v, j) => `L ${(j / (stat.sparkline.length - 1)) * 100} ${getY(v)}`).join(" ")}`}
                      fill="none"
                      stroke={stat.trend === "up" ? "#10B981" : stat.trend === "down" ? "#EF4444" : "#94A3B8"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    />
                  );
                })()}
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* ── REVENUE CHART + ORDER STATUS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Revenue Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-lg text-text-primary">Revenue Analytics</h3>
              <p className="text-xs text-text-muted">
                {timeFilter === "30days" ? "Last 30 days performance" : 
                 timeFilter === "6months" ? "Last 6 months performance" : "This year's performance"}
              </p>
            </div>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-gray-50 border border-gray-100 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-brand-gold transition-colors"
            >
              <option value="30days">Last 30 days</option>
              <option value="6months">Last 6 months</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="h-64 relative">
            {loading ? (
              <div className="w-full h-full bg-gray-50 rounded-xl animate-pulse" />
            ) : chartPoints.length > 0 ? (
              <>
                <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${chartPoints[0].x} 300 ${chartPoints.map(p => `L ${p.x} ${p.y}`).join(" ")} L ${chartPoints[chartPoints.length-1].x} 300 Z`}
                    fill="url(#chartGradient)"
                  />
                  <path
                    d={`M ${chartPoints[0].x} ${chartPoints[0].y} ${chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")}`}
                    fill="none" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                  {chartPoints.filter((_, i) => i % 6 === 0 || i === chartPoints.length - 1).map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#C9A96E" strokeWidth="2" />
                  ))}
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[10px] text-text-muted font-bold">
                  {chartLabels.map((l, i) => <span key={i}>{l}</span>)}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No revenue data for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Donut */}
        <div className="card">
          <h3 className="font-bold text-lg mb-2 text-text-primary">Order Status</h3>
          <p className="text-xs text-text-muted mb-6">Current orders by status</p>
          <div className="relative h-48 flex items-center justify-center">
            {loading ? (
              <div className="w-40 h-40 rounded-full bg-gray-100 animate-pulse" />
            ) : (
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#F1F5F9" strokeWidth="16" />
                {statusBreakdown.map((s) => {
                  const dash = (s.pct / 100) * circumference;
                  const seg = (
                    <circle
                      key={s.key}
                      cx="80" cy="80" r="70"
                      fill="none"
                      stroke={s.stroke}
                      strokeWidth="16"
                      strokeDasharray={`${dash} ${circumference}`}
                      strokeDashoffset={-dashOffsetAcc}
                      className="transition-all duration-700"
                    />
                  );
                  dashOffsetAcc += dash;
                  return seg;
                })}
              </svg>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-text-primary">{totalOrders.toLocaleString()}</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="mt-6 space-y-2.5">
            {loading
              ? [1,2,3].map(i => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)
              : statusBreakdown.map(s => (
                <div key={s.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", s.color)} />
                    <span className="text-xs font-semibold text-text-secondary">{s.key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-bold">{s.count}</span>
                    <span className="text-xs font-bold text-text-primary">{s.pct}%</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* ── RECENT ORDERS + TOP PRODUCTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Orders */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-text-primary">Recent Orders</h3>
            <Link href="/orders" className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <Loader2 className="w-6 h-6 text-brand-gold animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-text-muted font-bold">No orders yet.</td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-brand-gold-light transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-xs">{order.id}</td>
                      <td className="px-6 py-4 font-semibold text-text-secondary">
                        {order.customer?.full_name || order.customer_name || "Guest"}
                      </td>
                      <td className="px-6 py-4 text-text-muted">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 font-bold text-text-primary">
                        {typeof order.total === "number" ? `Rs.${(order.total as number).toLocaleString()}` : order.total}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("status-badge", statusStyles[order.status as keyof typeof statusStyles])}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-text-muted hover:text-brand-gold transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="card flex flex-col">
          <h3 className="font-bold text-lg mb-6 text-text-primary">Top Selling Products</h3>
          <div className="space-y-5 flex-1">
            {loading ? (
              [1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-gray-100 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            ) : topProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center py-8">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No sales data yet</p>
              </div>
            ) : (
              topProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-text-primary truncate">{product.name}</h4>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">{product.revenue}</p>
                    <p className="text-[10px] text-text-muted font-bold mt-0.5">{product.sales} sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/products" className="w-full mt-8 py-3 bg-gray-50 rounded-lg text-xs font-bold text-text-secondary hover:bg-gray-100 transition-colors text-center block">
            Full Product Report
          </Link>
        </div>
      </div>
    </div>
  );
}
