"use client";

import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { StoreProvider } from "@/lib/StoreContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const AUTH_ROUTES = ["/"];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [storeName, setStoreName] = useState("LUMIÈRE");
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    supabase.from("store_settings").select("store_name").eq("id", "main").single()
      .then(({ data }) => {
        if (data && data.store_name) {
          setStoreName(data.store_name);
          document.title = `${data.store_name} | Admin Panel`;
        }
      });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authed === null) return;
    if (!authed && !isAuthPage) {
      window.location.href = "/";
    } else if (authed && isAuthPage) {
      window.location.href = "/dashboard";
    }
  }, [authed, isAuthPage]);

  const spinner = (
    <html lang="en">
      <head><title>{`${storeName || 'LUMIÈRE'} | Admin Panel`}</title></head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background`}>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </body>
    </html>
  );

  if (authed === null) return spinner;
  if (!authed && !isAuthPage) return spinner;
  if (authed && isAuthPage) return spinner;

  return (
    <html lang="en">
      <head>
        <title>{`${storeName || 'LUMIÈRE'} | Admin Panel`}</title>
        <meta name="description" content="Management dashboard for store." />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background`}>
        <StoreProvider>
          {isAuthPage ? (
            <>{children}</>
          ) : (
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 ml-64 flex flex-col h-screen overflow-y-auto main-scroll-container">
                <Header />
                <main className="flex-1 p-8 mt-16">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          )}
        </StoreProvider>
      </body>
    </html>
  );
}
