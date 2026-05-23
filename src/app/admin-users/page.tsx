"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Calendar,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import { AdminProfile } from "@/lib/types";
import { format } from "date-fns";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get current auth user
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Fetch profiles with role = 'admin'
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setUsers(data);
        if (authUser) {
          const current = data.find(u => u.id === authUser.id);
          if (current) setCurrentUser(current);
        }
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        <p className="text-sm text-text-muted font-medium">Loading administrators...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Admin Users</h2>
          <p className="text-sm text-text-muted mt-1">View all administrators with access to this panel</p>
        </div>
      </div>

      {/* Your Profile Card (Minimized) */}
      {currentUser && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex items-center gap-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-bl-full -mr-4 -mt-4"></div>
          
          <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center font-bold text-xl text-white shadow-lg z-10 shrink-0 overflow-hidden">
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full object-cover" />
            ) : (
              getInitials(currentUser.full_name || "Admin")
            )}
          </div>
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-primary">{currentUser.full_name}</h3>
              <span className="px-1.5 py-0.5 bg-brand-gold/10 text-brand-gold text-[10px] font-bold rounded uppercase tracking-wider border border-brand-gold/20">You</span>
            </div>
            <p className="text-xs text-text-muted font-medium">{currentUser.email}</p>
          </div>
        </div>
      )}

      {/* Minimal Table - All Users */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Active Administrators</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-gray-100">
                <th className="p-6">Administrator</th>
                <th className="p-6">Email Address</th>
                <th className="p-6 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {users.map((user) => (
                <tr key={user.id} className={cn("transition-colors", currentUser?.id === user.id ? "bg-brand-gold/5" : "hover:bg-gray-50/50")}>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm overflow-hidden",
                        user.role === "Super Admin" || user.role === "admin" ? "bg-brand-gold" : "bg-blue-500"
                      )}>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(user.full_name || "Admin")
                        )}
                      </div>
                      <div className="font-bold text-text-primary">
                        {user.full_name}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-medium text-text-secondary">{user.email}</div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="text-text-muted text-xs">
                      {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-text-muted italic">
                    No administrators found with the required role.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
