"use client";

import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

const AUTH_ROUTES = ["/signin", "/signup"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  return (
    <html lang="en">
      <head>
        <title>LUMIÈRE | Admin Panel</title>
        <meta name="description" content="Management dashboard for LUMIÈRE fashion store." />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background`}>
        {isAuthPage ? (
          // Auth pages — no Sidebar or Header
          <>{children}</>
        ) : (
          // Dashboard pages — full layout
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 p-8 mt-16 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
