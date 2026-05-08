"use client";

import { 
  ShoppingBag, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  Package
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const stats = [
  { 
    label: "Total Revenue", 
    value: "Rs.1,28,430", 
    change: "+12.5%", 
    trend: "up", 
    icon: DollarSign,
    sparkline: [40, 35, 50, 45, 60, 55, 70]
  },
  { 
    label: "Total Orders", 
    value: "1,240", 
    change: "+8.2%", 
    trend: "up", 
    icon: ShoppingBag,
    sparkline: [30, 40, 35, 50, 45, 55, 50]
  },
  { 
    label: "Total Products", 
    value: "842", 
    change: "Active", 
    trend: "neutral", 
    icon: Package,
    sparkline: [50, 50, 50, 50, 50, 50, 50]
  },
  { 
    label: "Total Customers", 
    value: "2,430", 
    change: "+24 new", 
    trend: "up", 
    icon: Users,
    sparkline: [20, 30, 40, 35, 50, 60, 75]
  },
];

const recentOrders = [
  { id: "#ORD-7231", customer: "Sophia Anderson", date: "Oct 24, 2023", total: "Rs.4,240", status: "Delivered" },
  { id: "#ORD-7230", customer: "James Wilson", date: "Oct 24, 2023", total: "Rs.1,120", status: "Shipped" },
  { id: "#ORD-7229", customer: "Olivia Brown", date: "Oct 23, 2023", total: "Rs.8,450", status: "Confirmed" },
  { id: "#ORD-7228", customer: "Liam Smith", date: "Oct 22, 2023", total: "Rs.2,185", status: "Pending" },
  { id: "#ORD-7227", customer: "Emma Davis", date: "Oct 22, 2023", total: "Rs.3,900", status: "Cancelled" },
];

const topProducts = [
  { name: "Silk Evening Gown", category: "Clothing", sales: 142, revenue: "Rs.28,400", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=100&q=80" },
  { name: "Leather Handbag", category: "Accessories", sales: 98, revenue: "Rs.19,600", image: "https://images.unsplash.com/photo-1584917033904-491a84b2efbd?w=100&q=80" },
  { name: "Cashmere Sweater", category: "Clothing", sales: 85, revenue: "Rs.15,300", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&q=80" },
  { name: "Gold Chain Necklace", category: "Accessories", sales: 74, revenue: "Rs.12,500", image: "https://images.unsplash.com/photo-1535633302723-9993d57af2aa?w=100&h=100&fit=crop" },
  { name: "Floral Summer Dress", category: "Clothing", sales: 62, revenue: "Rs.9,300", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100&q=80" },
];

const statusStyles = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card card-hover flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-gray-50 rounded-lg text-text-secondary">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
                stat.trend === "up" ? "text-success bg-emerald-50" : 
                stat.trend === "down" ? "text-danger bg-rose-50" : "text-text-muted bg-gray-50"
              )}>
                {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3 mr-1" /> : 
                 stat.trend === "down" ? <ArrowDownRight className="w-3 h-3 mr-1" /> : null}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted tracking-widest uppercase">{stat.label}</p>
              <h3 className="text-2xl mono-stats mt-1 text-text-primary">{stat.value}</h3>
            </div>
            <div className="h-10 mt-2">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path 
                  d={`M 0 ${40 - stat.sparkline[0]} ${stat.sparkline.map((val, idx) => `L ${(idx / (stat.sparkline.length - 1)) * 100} ${40 - val}`).join(' ')}`}
                  fill="none"
                  stroke={stat.trend === "up" ? "#10B981" : stat.trend === "down" ? "#EF4444" : "#94A3B8"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-lg text-text-primary">Revenue Analytics</h3>
              <p className="text-xs text-text-muted">Last 30 days performance</p>
            </div>
            <select className="bg-gray-50 border border-gray-100 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-brand-gold transition-colors">
              <option>Last 30 days</option>
              <option>Last 6 months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 relative">
             {/* Mock Line Chart */}
             <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.2" />
                   <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
                 </linearGradient>
               </defs>
               <path 
                 d="M0 250 Q 100 220, 200 240 T 400 180 T 600 210 T 800 120 T 1000 150 V 300 H 0 Z"
                 fill="url(#chartGradient)"
               />
               <path 
                 d="M0 250 Q 100 220, 200 240 T 400 180 T 600 210 T 800 120 T 1000 150"
                 fill="none"
                 stroke="#C9A96E"
                 strokeWidth="3"
               />
               {/* Data points */}
               {[0, 200, 400, 600, 800, 1000].map((x, i) => (
                 <circle key={i} cx={x} cy={i === 0 ? 250 : i === 1 ? 240 : i === 2 ? 180 : i === 3 ? 210 : i === 4 ? 120 : 150} r="4" fill="white" stroke="#C9A96E" strokeWidth="2" />
               ))}
             </svg>
             <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] text-text-muted font-bold mt-4">
               <span>Oct 01</span>
               <span>Oct 07</span>
               <span>Oct 14</span>
               <span>Oct 21</span>
               <span>Oct 28</span>
               <span>Oct 31</span>
             </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-lg mb-2 text-text-primary">Order Status</h3>
          <p className="text-xs text-text-muted mb-8">Current orders by category</p>
          <div className="relative h-48 flex items-center justify-center">
            {/* Mock Donut Chart */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="#E2E8F0" strokeWidth="15" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="#10B981" strokeWidth="15" strokeDasharray="100 440" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="#2563EB" strokeWidth="15" strokeDasharray="80 440" strokeDashoffset="-100" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="#F59E0B" strokeWidth="15" strokeDasharray="60 440" strokeDashoffset="-180" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-text-primary">1,240</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {[
              { label: "Delivered", value: "45%", color: "bg-success" },
              { label: "Confirmed", value: "30%", color: "bg-blue-600" },
              { label: "Pending", value: "25%", color: "bg-warning" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", item.color)}></div>
                  <span className="text-xs font-semibold text-text-secondary">{item.label}</span>
                </div>
                <span className="text-xs font-bold text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-gold-light transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-xs">{order.id}</td>
                    <td className="px-6 py-4 font-semibold text-text-secondary">{order.customer}</td>
                    <td className="px-6 py-4 text-text-muted">{order.date}</td>
                    <td className="px-6 py-4 font-bold text-text-primary">{order.total}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card flex flex-col">
          <h3 className="font-bold text-lg mb-6 text-text-primary">Top Selling Products</h3>
          <div className="space-y-6 flex-1">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
            ))}
          </div>
          <Link href="/products" className="w-full mt-8 py-3 bg-gray-50 rounded-lg text-xs font-bold text-text-secondary hover:bg-gray-100 transition-colors text-center block">
            Full Product Report
          </Link>
        </div>
      </div>
    </div>
  );
}
