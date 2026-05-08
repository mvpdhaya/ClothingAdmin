"use client";

import { useState, useRef } from "react";
import { 
  Store, 
  Palette, 
  Truck, 
  CreditCard, 
  Bell, 
  Search, 
  Share2,
  Save,
  Upload,
  Pencil,
  Trash2,
  Plus,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TabType = "general" | "shipping" | "payments" | "notifications" | "social";

interface ShippingRate {
  id: string;
  name: string;
  minOrder: number;
  rate: number;
  deliveryTime: string;
}

const initialShippingRates: ShippingRate[] = [
  { id: "1", name: "Standard Delivery", minOrder: 0, rate: 99, deliveryTime: "5-7 days" },
  { id: "2", name: "Express Delivery", minOrder: 0, rate: 199, deliveryTime: "2-3 days" },
  { id: "3", name: "Free Delivery", minOrder: 2000, rate: 0, deliveryTime: "5-7 days" },
];

const tabs: { id: TabType; label: string; icon: any }[] = [
  { id: "general", label: "General", icon: Store },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "social", label: "Social Media", icon: Share2 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testMode, setTestMode] = useState(true);

  // Logo & Favicon State
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconUrl(URL.createObjectURL(file));
    }
  };

  // Shipping Rates State
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>(initialShippingRates);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);

  const handleAddRate = () => {
    setEditingRate({ id: Date.now().toString(), name: "", minOrder: 0, rate: 0, deliveryTime: "" });
    setIsRateModalOpen(true);
  };

  const handleEditRate = (rate: ShippingRate) => {
    setEditingRate({ ...rate });
    setIsRateModalOpen(true);
  };

  const handleSaveRate = () => {
    if (editingRate) {
      if (shippingRates.find(r => r.id === editingRate.id)) {
        setShippingRates(shippingRates.map(r => r.id === editingRate.id ? editingRate : r));
      } else {
        setShippingRates([...shippingRates, editingRate]);
      }
      setIsRateModalOpen(false);
      setEditingRate(null);
    }
  };

  const handleDeleteRate = (id: string) => {
    setShippingRates(shippingRates.filter(r => r.id !== id));
  };

  return (
    <div className="-m-8 flex" style={{height: 'calc(100vh - 64px)'}}>
      {/* Left Tab Nav */}
      <div className="w-[210px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="px-5 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-bold text-text-primary tracking-widest uppercase">Settings</h2>
        </div>
        <nav className="p-2 space-y-0.5 flex-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all text-left rounded-lg",
                  isActive
                    ? "bg-brand-gold/10 text-brand-gold"
                    : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                )}
              >
                <div className={cn("w-0.5 h-4 rounded-full mr-0.5 shrink-0", isActive ? "bg-brand-gold" : "bg-transparent")} />
                <tab.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-brand-gold" : "text-text-muted")} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Content — scrolls independently */}
      <div className="flex-1 min-w-0 overflow-y-auto bg-[#F8FAFC]">
        <div className="max-w-2xl mx-auto px-8 py-8 pb-24 space-y-6 animate-fade-in">

          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Store Identity</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Store Name</label>
                      <input type="text" defaultValue="LUMIÈRE" className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Store Tagline</label>
                      <input type="text" defaultValue="Effortless Elegance" className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Store Email</label>
                      <input type="email" defaultValue="hello@lumiere.com" className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Store Phone</label>
                      <input type="tel" defaultValue="+94 77 123 4567" className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Store Address</label>
                    <textarea rows={3} defaultValue="78, Galle Road,\nColombo 03,\nSri Lanka" className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all resize-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Country</label>
                      <select className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all appearance-none">
                        <option>Sri Lanka</option>
                        <option>India</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Currency</label>
                      <select className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all appearance-none">
                        <option>LKR Rs.</option>
                        <option>INR ₹</option>
                        <option>USD $</option>
                        <option>GBP £</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Language</label>
                      <select className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all appearance-none">
                        <option>English</option>
                        <option>Sinhala</option>
                        <option>Tamil</option>
                        <option>Hindi</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Timezone</label>
                    <select className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all appearance-none">
                      <option>(GMT+05:30) Colombo, Chennai, Kolkata, Mumbai</option>
                      <option>(GMT+00:00) London</option>
                      <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Store Logo & Favicon</h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Store Logo</label>
                    <div className="flex items-center gap-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl border-dashed">
                      <div className="w-32 h-16 bg-brand-sidebar flex items-center justify-center rounded text-brand-gold font-bold text-xl shadow-sm overflow-hidden">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Store Logo" className="w-full h-full object-contain" />
                        ) : (
                          "LUMIÈRE"
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="file" 
                          ref={logoInputRef} 
                          onChange={handleLogoChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <button 
                          onClick={() => logoInputRef.current?.click()}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-text-primary hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-3 h-3" /> Change Logo
                        </button>
                        <p className="text-[10px] text-text-muted">Recommended: 400x120px (PNG)</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Favicon</label>
                    <div className="flex items-center gap-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl border-dashed">
                      <div className="w-16 h-16 bg-brand-sidebar flex items-center justify-center rounded-xl text-brand-gold font-bold text-2xl shadow-sm overflow-hidden">
                        {faviconUrl ? (
                          <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain p-2" />
                        ) : (
                          "L"
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="file" 
                          ref={faviconInputRef} 
                          onChange={handleFaviconChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <button 
                          onClick={() => faviconInputRef.current?.click()}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-text-primary hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-3 h-3" /> Change Favicon
                        </button>
                        <p className="text-[10px] text-text-muted">Recommended: 32x32px (ICO/PNG)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Store Status</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-sm font-bold text-text-primary block">Maintenance Mode</span>
                      <span className="text-xs text-text-muted">Temporarily disable customer access to the storefront</span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={isMaintenance}
                        onChange={(e) => setIsMaintenance(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  {isMaintenance && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-sm font-medium flex items-center gap-3">
                        <Bell className="w-5 h-5 text-orange-500" />
                        Your store is currently offline to customers.
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Maintenance Message</label>
                        <textarea rows={3} defaultValue="We are currently updating our store. Please check back soon!" className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all resize-none" />
                        <p className="text-[10px] text-text-muted">This message will be shown to visitors while the store is in maintenance mode.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}



          {/* TAB 3: SHIPPING */}
          {activeTab === "shipping" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Free Shipping</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-sm font-bold text-text-primary block">Enable Free Shipping</span>
                      <span className="text-xs text-text-muted">Offer free shipping based on order total</span>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Minimum Order Amount (Rs.)</label>
                      <input type="number" defaultValue="2000" className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Free Shipping Label</label>
                      <input type="text" defaultValue="Free delivery on orders above Rs.2000" className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Shipping Rates</h3>
                </div>
                <div className="p-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-text-muted uppercase tracking-wider">
                        <th className="p-4 font-bold">Zone Name</th>
                        <th className="p-4 font-bold">Min Order</th>
                        <th className="p-4 font-bold">Delivery Time</th>
                        <th className="p-4 font-bold">Rate (Rs.)</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {shippingRates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium">{rate.name}</td>
                          <td className="p-4">Rs.{rate.minOrder.toLocaleString()}</td>
                          <td className="p-4 text-text-muted">{rate.deliveryTime}</td>
                          <td className="p-4">Rs.{rate.rate.toLocaleString()}</td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleEditRate(rate)}
                              className="p-2 text-text-muted hover:text-brand-gold transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteRate(rate.id)}
                              className="p-2 text-text-muted hover:text-danger transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button 
                    onClick={handleAddRate}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-text-primary hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" /> Add Shipping Rate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-text-primary">COD Settings</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cash on Delivery</span>
                      <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">COD Extra Charge (Rs.)</label>
                      <input type="number" defaultValue="50" className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Available Above Order Value (Rs.)</label>
                      <input type="number" defaultValue="0" className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Payment Methods</h3>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { name: "Credit / Debit Card", icon: "💳", active: true },
                    { name: "Bank Transfer", icon: "📱", active: true },
                    { name: "Cash on Delivery", icon: "💵", active: true },
                  ].map((method) => (
                    <div key={method.name} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{method.icon}</span>
                        <span className="text-sm font-bold text-text-primary">{method.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="switch">
                          <input type="checkbox" defaultChecked={method.active} />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Web Notifications — Admin</h3>
                </div>
                <div className="p-6 space-y-6">
                  {[
                    { label: "New Order Alert", desc: "Show browser notification when a new order is placed", active: true },
                    { label: "Inventory Alerts", desc: "Notify when products are low in stock", active: true },
                    { label: "Customer Signups", desc: "Notify when a new customer registers", active: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-text-primary block">{item.label}</span>
                        <span className="text-xs text-text-muted">{item.desc}</span>
                      </div>
                      <label className="switch"><input type="checkbox" defaultChecked={item.active} /><span className="slider"></span></label>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-sm font-bold text-text-primary block">Low Stock Alert Threshold</span>
                        <span className="text-xs text-text-muted">Trigger notification when stock falls below this number</span>
                      </div>
                      <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                    </div>
                    <div className="flex items-center gap-4 ml-4 pl-4 border-l-2 border-gray-100">
                      <span className="text-sm text-text-secondary">Alert threshold:</span>
                      <input type="number" defaultValue="5" className="w-24 px-3 py-1.5 bg-gray-50 border border-transparent rounded-lg text-sm text-center focus:bg-white focus:border-brand-gold outline-none transition-all" />
                      <span className="text-sm text-text-secondary">units</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Web Notifications — Customer</h3>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: "Order Status Updates", desc: "Notify customer when order is shipped/delivered", active: true },
                    { label: "Promotional Offers", desc: "Show alerts for new discounts and sales", active: true },
                    { label: "Cart Reminders", desc: "Remind customer about items in their cart", active: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 last:pb-0">
                      <div>
                        <span className="text-sm font-bold text-text-primary block">{item.label}</span>
                        <span className="text-xs text-text-muted">{item.desc}</span>
                      </div>
                      <label className="switch"><input type="checkbox" defaultChecked={item.active} /><span className="slider"></span></label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}


          {/* TAB 7: SOCIAL MEDIA */}
          {activeTab === "social" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Social Links</h3>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: "Instagram", icon: "📸", value: "instagram.com/lumiere", active: true },
                    { label: "Facebook", icon: "📘", value: "facebook.com/lumiere", active: true },
                    { label: "Pinterest", icon: "📌", value: "pinterest.com/lumiere", active: false },
                    { label: "Twitter / X", icon: "🐦", value: "", active: false },
                    { label: "YouTube", icon: "▶️", value: "", active: false },
                    { label: "WhatsApp", icon: "💬", value: "+94 77 123 4567", active: true },
                  ].map((social) => (
                    <div key={social.label} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0 border border-gray-100">
                        {social.icon}
                      </div>
                      <div className="w-32 text-sm font-bold text-text-primary">{social.label}</div>
                      <input 
                        type="text" 
                        defaultValue={social.value} 
                        placeholder={`Enter ${social.label} URL...`}
                        className="flex-1 px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" 
                      />
                      <label className="switch ml-2">
                        <input type="checkbox" defaultChecked={social.active} />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>



              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Share Buttons (Product Page)</h3>
                </div>
                <div className="p-6 flex gap-8">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold" />
                    WhatsApp
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold" />
                    Facebook
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold" />
                    Instagram
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold" />
                    Copy Link
                  </label>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

        </div>

      {/* Shipping Rate Modal */}
      {isRateModalOpen && editingRate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            onClick={() => setIsRateModalOpen(false)}
          ></div>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-text-primary">
                {shippingRates.find(r => r.id === editingRate.id) ? "Edit Shipping Rate" : "Add Shipping Rate"}
              </h3>
              <button 
                onClick={() => setIsRateModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Zone Name</label>
                <input 
                  type="text" 
                  value={editingRate.name || ""}
                  onChange={(e) => setEditingRate({ ...editingRate, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                  placeholder="e.g. Standard Delivery"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Min Order (Rs.)</label>
                <input 
                  type="number" 
                  value={editingRate.minOrder ?? 0}
                  onChange={(e) => setEditingRate({ ...editingRate, minOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Estimated Delivery Time</label>
                <input 
                  type="text" 
                  value={editingRate.deliveryTime || ""}
                  onChange={(e) => setEditingRate({ ...editingRate, deliveryTime: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                  placeholder="e.g. 3-5 business days"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Rate (Rs.)</label>
                <input 
                  type="number" 
                  value={editingRate.rate ?? 0}
                  onChange={(e) => setEditingRate({ ...editingRate, rate: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button 
                onClick={() => setIsRateModalOpen(false)}
                className="flex-1 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-muted hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveRate}
                className="flex-[2] px-6 py-3 bg-brand-gold text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20"
              >
                Save Rate
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
