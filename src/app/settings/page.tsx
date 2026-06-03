"use client";

import { useState, useEffect } from "react";
import {
  Store,
  Truck,
  CreditCard,
  Bell,
  Share2,
  Save,
  Pencil,
  Trash2,
  Plus,
  X,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import { useStoreSettings } from "@/lib/StoreContext";
import { StoreSettings, ShippingRate } from "@/lib/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TabType = "general" | "shipping" | "payments" | "notifications" | "social";

const tabs: { id: TabType; label: string; icon: any }[] = [
  { id: "general", label: "General", icon: Store },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "social", label: "Social Media", icon: Share2 },
];

export default function SettingsPage() {
  const { setStoreName, storeName } = useStoreSettings();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    id: 'main',
    store_name: "",
    store_tagline: "",
    store_email: "",
    store_phone: "",
    store_address: "",
    maintenance_mode: false,
    maintenance_message: "",
    free_shipping_enabled: false,
    free_shipping_threshold: 0,
    free_shipping_label: "",
    cod_enabled: false,
    cod_extra_charge: 0,
    cod_min_order: 0,
    social_links: [
      { label: "Instagram", icon: "📸", value: "", active: false },
      { label: "Facebook", icon: "📘", value: "", active: false },
      { label: "Pinterest", icon: "📌", value: "", active: false },
      { label: "Twitter / X", icon: "🐦", value: "", active: false },
      { label: "YouTube", icon: "▶️", value: "", active: false },
      { label: "WhatsApp", icon: "💬", value: "", active: false },
    ],
    payment_methods: [
      { name: "Credit / Debit Card", icon: "💳", active: false },
      { name: "Bank Transfer", icon: "📱", active: false },
      { name: "Cash on Delivery", icon: "💵", active: false },
    ],
    notifications_admin: [
      { label: "New Order Alert", desc: "Show browser notification when a new order is placed", active: false },
      { label: "Inventory Alerts", desc: "Notify when products are low in stock", active: false },
      { label: "Customer Signups", desc: "Notify when a new customer registers", active: false },
    ],
    notifications_customer: [
      { label: "Order Status Updates", desc: "Notify customer when order is shipped/delivered", active: false },
      { label: "Promotional Offers", desc: "Show alerts for new discounts and sales", active: false },
      { label: "Cart Reminders", desc: "Remind customer about items in their cart", active: false },
    ],
    share_buttons: [
      { label: "WhatsApp", active: false },
      { label: "Facebook", active: false },
      { label: "Instagram", active: false },
      { label: "Copy Link", active: false },
    ],
    low_stock_threshold: 5,
    low_stock_enabled: false,
    announcement_bar_text: "",
  });

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, ratesRes] = await Promise.all([
        supabase.from('store_settings').select('*').eq('id', 'main').single(),
        supabase.from('shipping_rates').select('*').order('created_at')
      ]);

      if (settingsRes.data) {
        // Merge with defaults to ensure structure exists if DB has empty arrays
        setSettings(prev => ({
          ...prev,
          ...settingsRes.data,
          social_links: settingsRes.data.social_links?.length ? settingsRes.data.social_links : prev.social_links,
          payment_methods: settingsRes.data.payment_methods?.length ? settingsRes.data.payment_methods : prev.payment_methods,
          notifications_admin: settingsRes.data.notifications_admin?.length ? settingsRes.data.notifications_admin : prev.notifications_admin,
          notifications_customer: settingsRes.data.notifications_customer?.length ? settingsRes.data.notifications_customer : prev.notifications_customer,
          share_buttons: settingsRes.data.share_buttons?.length ? settingsRes.data.share_buttons : prev.share_buttons,
        }));
      }
      if (ratesRes.data) {
        setShippingRates(ratesRes.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert(settings);

      if (error) throw error;

      if (settings.store_name) {
        setStoreName(settings.store_name);
      }

      setSaveStatus({ type: 'success', message: "Settings saved successfully!" });
      setTimeout(() => {
        setSaveStatus(null);
      }, 4000);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setSaveStatus({ type: 'error', message: "Failed to save settings: " + (error.message || error.details || "Unknown error") });
      setTimeout(() => {
        setSaveStatus(null);
      }, 6000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRate = () => {
    setEditingRate({ id: "", name: "", min_order: 0, rate: 0, delivery_time: "" });
    setIsRateModalOpen(true);
  };

  const handleEditRate = (rate: ShippingRate) => {
    setEditingRate({ ...rate });
    setIsRateModalOpen(true);
  };

  const handleSaveRate = async () => {
    if (editingRate) {
      setIsSaving(true);
      try {
        const rateToSave = { ...editingRate };
        if (!rateToSave.id) delete (rateToSave as any).id;

        const { error } = await supabase
          .from('shipping_rates')
          .upsert(rateToSave);

        if (error) throw error;

        await fetchData();
        setIsRateModalOpen(false);
        setEditingRate(null);
        setSaveStatus({ type: 'success', message: "Shipping rate saved successfully!" });
        setTimeout(() => setSaveStatus(null), 4000);
      } catch (error: any) {
        console.error("Error saving rate:", error);
        setSaveStatus({ type: 'error', message: "Failed to save shipping rate: " + (error.message || error.details || "Unknown error") });
        setTimeout(() => setSaveStatus(null), 6000);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteRate = async (id: string) => {
    if (confirm("Are you sure you want to delete this shipping rate?")) {
      try {
        const { error } = await supabase
          .from('shipping_rates')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setShippingRates(shippingRates.filter(r => r.id !== id));
        setSaveStatus({ type: 'success', message: "Shipping rate deleted successfully!" });
        setTimeout(() => setSaveStatus(null), 4000);
      } catch (error: any) {
        console.error("Error deleting rate:", error);
        setSaveStatus({ type: 'error', message: "Failed to delete shipping rate: " + (error.message || error.details || "Unknown error") });
        setTimeout(() => setSaveStatus(null), 6000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div className="-m-8 flex" style={{ height: 'calc(100vh - 64px)' }}>
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

          {saveStatus && (
            <div className={cn(
              "px-5 py-4 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300",
              saveStatus.type === 'success'
                ? "bg-emerald-50/80 border-emerald-100 text-emerald-700"
                : "bg-rose-50/80 border-rose-100 text-rose-700"
            )}>
              <span>{saveStatus.message}</span>
              <button
                onClick={() => setSaveStatus(null)}
                className={cn(
                  "p-1 rounded-full transition-colors",
                  saveStatus.type === 'success' ? "hover:bg-emerald-100 text-emerald-600" : "hover:bg-rose-100 text-rose-600"
                )}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
                      <input
                        type="text"
                        value={settings.store_name || ""}
                        onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all"
                        placeholder={storeName || "Store Name"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Store Tagline</label>
                      <input
                        type="text"
                        value={settings.store_tagline || ""}
                        onChange={(e) => setSettings({ ...settings, store_tagline: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all"
                        placeholder="Effortless Elegance"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Store Email</label>
                      <input
                        type="email"
                        value={settings.store_email || ""}
                        onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all"
                        placeholder="hello@lumiere.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Store Phone</label>
                      <input
                        type="tel"
                        value={settings.store_phone || ""}
                        onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all"
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Store Address</label>
                    <textarea
                      rows={3}
                      value={settings.store_address || ""}
                      onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all resize-none"
                      placeholder="Enter store address..."
                    />
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
                        checked={settings.maintenance_mode}
                        onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  {settings.maintenance_mode && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-sm font-medium flex items-center gap-3">
                        <Bell className="w-5 h-5 text-orange-500" />
                        Your store is currently offline to customers.
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Maintenance Message</label>
                        <textarea
                          rows={3}
                          value={settings.maintenance_message || ""}
                          onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all resize-none"
                          placeholder="We are currently updating our store. Please check back soon!"
                        />
                        <p className="text-[10px] text-text-muted">This message will be shown to visitors while the store is in maintenance mode.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Announcement Bar</h3>
                </div>
                <div className="p-6 space-y-3">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Announcement Bar Text</label>
                  <input
                    type="text"
                    value={settings.announcement_bar_text || ""}
                    onChange={(e) => setSettings({ ...settings, announcement_bar_text: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all"
                    placeholder="e.g. Free shipping on orders above Rs.2000 🎉"
                  />
                  <p className="text-[10px] text-text-muted">This text will be displayed in the announcement bar at the top of your storefront. Leave blank to hide the bar.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SHIPPING */}
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
                      <input
                        type="checkbox"
                        checked={settings.free_shipping_enabled}
                        onChange={(e) => setSettings({ ...settings, free_shipping_enabled: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className={cn("grid grid-cols-2 gap-6 transition-all duration-300", !settings.free_shipping_enabled && "opacity-50 pointer-events-none")}>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Minimum Order Amount (Rs.)</label>
                      <input
                        type="number"
                        value={settings.free_shipping_threshold || ""}
                        onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                        disabled={!settings.free_shipping_enabled}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all"
                        placeholder="2000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Free Shipping Label</label>
                      <input
                        type="text"
                        value={settings.free_shipping_label || ""}
                        onChange={(e) => setSettings({ ...settings, free_shipping_label: e.target.value })}
                        disabled={!settings.free_shipping_enabled}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all"
                        placeholder="Free delivery on orders above Rs.2000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Shipping Rates</h3>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
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
                          <td className="p-4">Rs.{(rate.min_order || 0).toLocaleString()}</td>
                          <td className="p-4 text-text-muted">{rate.delivery_time}</td>
                          <td className="p-4">Rs.{(rate.rate || 0).toLocaleString()}</td>
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

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">COD Settings</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cash on Delivery</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.cod_enabled}
                        onChange={(e) => setSettings({ ...settings, cod_enabled: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className={cn("space-y-6 transition-all duration-300", !settings.cod_enabled && "opacity-50 pointer-events-none")}>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">COD Extra Charge (Rs.)</label>
                      <input
                        type="number"
                        value={settings.cod_extra_charge || ""}
                        onChange={(e) => setSettings({ ...settings, cod_extra_charge: parseFloat(e.target.value) || 0 })}
                        disabled={!settings.cod_enabled}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all"
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Available Above Order Value (Rs.)</label>
                      <input
                        type="number"
                        value={settings.cod_min_order || ""}
                        onChange={(e) => setSettings({ ...settings, cod_min_order: parseFloat(e.target.value) || 0 })}
                        disabled={!settings.cod_enabled}
                        className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Payment Methods</h3>
                </div>
                <div className="p-6 space-y-3">
                  {(settings.payment_methods || []).map((method, index) => (
                    <div key={method.name} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{method.icon}</span>
                        <span className="text-sm font-bold text-text-primary">{method.name}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={method.active}
                          onChange={(e) => {
                            const updated = [...settings.payment_methods];
                            updated[index].active = e.target.checked;
                            setSettings({ ...settings, payment_methods: updated });
                          }}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                  {settings.payment_methods?.length === 0 && (
                    <div className="text-center py-4 text-text-muted text-sm">No payment methods configured.</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Web Notifications — Admin</h3>
                </div>
                <div className="p-6 space-y-6">
                  {(settings.notifications_admin || []).map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-text-primary block">{item.label}</span>
                        <span className="text-xs text-text-muted">{item.desc}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={(e) => {
                            const updated = [...settings.notifications_admin];
                            updated[index].active = e.target.checked;
                            setSettings({ ...settings, notifications_admin: updated });
                          }}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-sm font-bold text-text-primary block">Low Stock Alert Threshold</span>
                        <span className="text-xs text-text-muted">Trigger notification when stock falls below this number</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.low_stock_enabled}
                          onChange={(e) => setSettings({ ...settings, low_stock_enabled: e.target.checked })}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className={`flex items-center gap-4 ml-4 pl-4 border-l-2 border-gray-100 transition-opacity duration-200 ${!settings.low_stock_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="text-sm text-text-secondary">Alert threshold:</span>
                      <input
                        type="number"
                        value={settings.low_stock_threshold || 0}
                        onChange={(e) => setSettings({ ...settings, low_stock_threshold: parseInt(e.target.value) || 0 })}
                        disabled={!settings.low_stock_enabled}
                        className="w-24 px-3 py-1.5 bg-gray-50 border border-transparent rounded-lg text-sm text-center focus:bg-white focus:border-brand-gold outline-none transition-all"
                      />
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
                  {(settings.notifications_customer || []).map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 last:pb-0">
                      <div>
                        <span className="text-sm font-bold text-text-primary block">{item.label}</span>
                        <span className="text-xs text-text-muted">{item.desc}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={(e) => {
                            const updated = [...settings.notifications_customer];
                            updated[index].active = e.target.checked;
                            setSettings({ ...settings, notifications_customer: updated });
                          }}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}


          {/* TAB 5: SOCIAL MEDIA */}
          {activeTab === "social" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-text-primary">Social Links</h3>
                </div>
                <div className="p-6 space-y-4">
                  {(settings.social_links || []).map((social, index) => (
                    <div key={social.label} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0 border border-gray-100">
                        {social.icon}
                      </div>
                      <div className="w-32 text-sm font-bold text-text-primary">{social.label}</div>
                      <input
                        type="text"
                        value={social.value || ""}
                        onChange={(e) => {
                          const updated = [...settings.social_links];
                          updated[index].value = e.target.value;
                          setSettings({ ...settings, social_links: updated });
                        }}
                        placeholder={`Enter ${social.label} URL...`}
                        className="flex-1 px-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all"
                      />
                      <label className="switch ml-2">
                        <input
                          type="checkbox"
                          checked={social.active}
                          onChange={(e) => {
                            const updated = [...settings.social_links];
                            updated[index].active = e.target.checked;
                            setSettings({ ...settings, social_links: updated });
                          }}
                        />
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
                <div className="p-6 flex flex-wrap gap-8">
                  {(settings.share_buttons || []).map((btn, index) => (
                    <label key={btn.label} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={btn.active}
                        onChange={(e) => {
                          const updated = [...settings.share_buttons];
                          updated[index].active = e.target.checked;
                          setSettings({ ...settings, share_buttons: updated });
                        }}
                        className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold"
                      />
                      {btn.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
                  {editingRate.id ? "Edit Shipping Rate" : "Add Shipping Rate"}
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
                    value={editingRate.min_order ?? 0}
                    onChange={(e) => setEditingRate({ ...editingRate, min_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-gold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Estimated Delivery Time</label>
                  <input
                    type="text"
                    value={editingRate.delivery_time || ""}
                    onChange={(e) => setEditingRate({ ...editingRate, delivery_time: e.target.value })}
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
                  disabled={isSaving}
                  className="flex-[2] px-6 py-3 bg-brand-gold text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Rate"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
