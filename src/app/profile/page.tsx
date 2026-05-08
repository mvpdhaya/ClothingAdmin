"use client";

import { useState, useRef } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Shield, 
  Calendar, 
  Save, 
  Eye, 
  EyeOff,
  LogOut,
  ChevronRight,
  BadgeCheck
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { useRouter } from "next/navigation";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProfilePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/signin");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Your Profile</h2>
        <p className="text-sm text-text-muted mt-1">Manage your account settings and security preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-brand-gold flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl overflow-hidden group-hover:brightness-90 transition-all">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  "RS"
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-brand-gold hover:scale-110 transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            
            <div className="mt-6 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl font-bold text-text-primary">Rahul Sharma</h3>
                <BadgeCheck className="w-5 h-5 text-brand-gold" />
              </div>
              <p className="text-sm text-text-muted font-medium">rahul@lumiere.com</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 w-full flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
                <span>Status</span>
                <span className="text-emerald-500">Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Personal Information</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" defaultValue="Rahul Sharma" className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="email" defaultValue="rahul@lumiere.com" className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Bio / Note</label>
                <textarea rows={3} defaultValue="Lead administrator for LUMIÈRE store management. Responsible for inventory and analytics." className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all resize-none" />
              </div>

              <div className="flex justify-end pt-2">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-gold/20 hover:brightness-110 transition-all">
                  <Save className="w-4 h-4" />
                  Update Profile
                </button>
              </div>
            </div>
          </div>

          {/* Security / Password */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Update Password</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type={showPassword ? "text" : "password"} className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input type={showPassword ? "text" : "password"} className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input type={showPassword ? "text" : "password"} className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-brand-gold"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-text-primary text-white rounded-xl text-sm font-bold hover:bg-black transition-all">
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 rounded-3xl shadow-sm border border-red-100 overflow-hidden">
            <div className="p-8 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-red-900 uppercase tracking-widest mb-1">Sign Out</h3>
                <p className="text-xs text-red-700/70">Securely sign out from the current device</p>
              </div>
              <button 
                onClick={handleLogout}
                className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
