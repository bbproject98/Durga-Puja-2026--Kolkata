"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import NotificationBell from "./components/NotificationBell";
import { NotificationProvider } from "./context/NotificationContext";
import { isAuthenticated, getStoredAdminUser } from "./lib/api";
import { Menu, Search, Sparkles, CheckCircle2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If we are on the login page, bypass layout auth guard & sidebar
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      setAuthorized(true);
      return;
    }

    const auth = isAuthenticated();
    if (!auth) {
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
      setLoading(false);
    }
  }, [pathname, isLoginPage, router]);

  // If on login page, render child without sidebar and header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while checking authentication
  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-pulse mb-4">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-300">Verifying Admin Session...</p>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-slate-100/70 text-slate-900 flex">
        {/* Sidebar Navigation */}
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Puja Season Tag */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600/30" />
                <span>Durga Puja 2026 Fleet Operations</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* System Status Pill */}
              <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Admin Online</span>
              </div>

              {/* Live Active Notification Bell */}
              <NotificationBell />
            </div>
          </header>

          {/* Page Content Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}

