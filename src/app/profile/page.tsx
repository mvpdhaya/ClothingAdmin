"use client";

import { useState, useRef, useEffect } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  Eye, 
  EyeOff,
  LogOut,
  BadgeCheck,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import { AdminProfile } from "@/lib/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProfilePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (data) {
            setProfile(data);
            setAvatarUrl(data.avatar_url);
          } else {
            setProfile({ 
              id: user.id, 
              full_name: user.user_metadata?.full_name || "Admin", 
              email: user.email || "", 
              avatar_url: "",
              role: "admin",
              created_at: user.created_at
            } as AdminProfile);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/";
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    
    try {
      // Local preview immediately
      setAvatarUrl(URL.createObjectURL(file));
      setIsSaving(true);
      setMessage({ text: "Uploading avatar...", type: "success" });
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars') 
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      
      setAvatarUrl(publicUrl);
      setProfile({ ...profile, avatar_url: publicUrl });
      setMessage({ text: "Avatar updated successfully!", type: "success" });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setMessage({ text: "Could not upload avatar. Please ensure an 'avatars' storage bucket is created in Supabase.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      setMessage({ text: "", type: "" });
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
        })
        .eq('id', profile.id);

      if (error) throw error;
      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ text: error.message || "Failed to update profile.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordMessage({ text: "", type: "" });
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setPasswordMessage({ text: "Password updated successfully!", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      setPasswordMessage({ text: error.message || "Failed to update password.", type: "error" });
    } finally {
      setIsUpdatingPassword(false);
      setTimeout(() => setPasswordMessage({ text: "", type: "" }), 3000);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        <p className="text-sm text-text-muted font-medium">Loading profile...</p>
      </div>
    );
  }

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
                  getInitials(profile?.full_name || "Admin")
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
                <h3 className="text-xl font-bold text-text-primary">{profile?.full_name || "Administrator"}</h3>
                <BadgeCheck className="w-5 h-5 text-brand-gold" />
              </div>
              <p className="text-sm text-text-muted font-medium">{profile?.email}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 w-full flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
                <span>Role</span>
                <span className="text-brand-gold">{profile?.role || "Admin"}</span>
              </div>
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
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Personal Information</h3>
              {message.text && (
                <span className={cn("text-xs font-bold px-2 py-1 rounded", message.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {message.text}
                </span>
              )}
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="text" 
                      value={profile?.full_name || ""} 
                      onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="email" 
                      value={profile?.email || ""} 
                      disabled
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl text-sm text-text-muted cursor-not-allowed outline-none" 
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">Email cannot be changed here.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-gold/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update Profile
                </button>
              </div>
            </div>
          </div>

          {/* Security / Password */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Update Password</h3>
              {passwordMessage.text && (
                <span className={cn("text-xs font-bold px-2 py-1 rounded", passwordMessage.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {passwordMessage.text}
                </span>
              )}
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" 
                      />
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
                <button 
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  className="flex items-center gap-2 px-6 py-2.5 bg-text-primary text-white rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50"
                >
                  {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
