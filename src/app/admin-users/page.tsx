"use client";

import { 
  ShieldCheck, 
  Users, 
  Calendar
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// MOCK DATA - All admin users
const USERS = [
  { id: 1, name: "Rahul Sharma", email: "rahul@lumiere.com", role: "Super Admin", initials: "RS", joined: "Jan 12, 2024", isCurrentUser: true },
  { id: 2, name: "Priya Nair", email: "priya@lumiere.com", role: "Manager", initials: "PN", joined: "Feb 05, 2024", isCurrentUser: false },
  { id: 3, name: "Arjun Kumar", email: "arjun@lumiere.com", role: "Manager", initials: "AK", joined: "Feb 20, 2024", isCurrentUser: false },
  { id: 4, name: "Sneha Reddy", email: "sneha@lumiere.com", role: "Viewer", initials: "SR", joined: "Mar 01, 2024", isCurrentUser: false },
  { id: 5, name: "Karan Mehta", email: "karan@lumiere.com", role: "Manager", initials: "KM", joined: "Jan 15, 2024", isCurrentUser: false },
];

export default function AdminUsersPage() {
  const currentUser = USERS.find(u => u.isCurrentUser) || USERS[0];

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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex items-center gap-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-bl-full -mr-4 -mt-4"></div>
        
        <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center font-bold text-xl text-white shadow-lg z-10 shrink-0">
          {currentUser.initials}
        </div>
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-text-primary">{currentUser.name}</h3>
            <span className="px-1.5 py-0.5 bg-brand-gold/10 text-brand-gold text-[10px] font-bold rounded uppercase tracking-wider border border-brand-gold/20">You</span>
          </div>
          <p className="text-xs text-text-muted font-medium">{currentUser.email}</p>
        </div>
      </div>

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
              {USERS.map((user) => (
                <tr key={user.id} className={cn("transition-colors", user.isCurrentUser ? "bg-brand-gold/5" : "hover:bg-gray-50/50")}>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm",
                        user.role === "Super Admin" ? "bg-brand-gold" : user.role === "Manager" ? "bg-blue-500" : "bg-gray-400"
                      )}>
                        {user.initials}
                      </div>
                      <div className="font-bold text-text-primary">
                        {user.name}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-medium text-text-secondary">{user.email}</div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="text-text-muted text-xs">{user.joined}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
