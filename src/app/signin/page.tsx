"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck 
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay
    setTimeout(() => {
      router.push("/");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full -mr-64 -mt-64 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full -ml-64 -mb-64 blur-3xl"></div>

      <div className="w-full max-w-[440px] z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-gold rounded-2xl shadow-2xl shadow-brand-gold/20 mb-6 transform hover:rotate-12 transition-transform">
            <span className="text-white text-3xl font-bold">L</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-text-muted mt-2">Sign in to manage your LUMIÈRE store</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-brand-gold transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="admin@lumiere.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-brand-gold focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-[10px] font-bold text-brand-gold hover:underline uppercase tracking-widest">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-brand-gold transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white text-sm outline-none focus:border-brand-gold focus:bg-white/10 transition-all placeholder:text-white/20"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-gold hover:brightness-110 disabled:brightness-75 text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-gold/20 transition-all flex items-center justify-center gap-2 group mt-8"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-text-muted">
              New administrator? {" "}
              <Link href="/signup" className="text-brand-gold font-bold hover:underline transition-all">Create account</Link>
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-white/30 text-xs font-medium">
          <ShieldCheck className="w-4 h-4" />
          Secure Enterprise-Grade Encryption
        </div>
      </div>
    </div>
  );
}
