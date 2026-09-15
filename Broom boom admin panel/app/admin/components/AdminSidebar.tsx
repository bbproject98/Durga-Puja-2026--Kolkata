"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  CarFront,
  Sparkles,
  LogOut,
  X,
  ExternalLink,
  ShieldCheck,
  Users
} from "lucide-react";
import { removeAuthToken, getStoredAdminUser } from "../lib/api";
import { useNotifications } from "../context/NotificationContext";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredAdminUser();
  const { unreadBookingsCount, unreadLeadsCount } = useNotifications();

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "User Leads",
      href: "/admin/leads",
      icon: Users,
      badge: unreadLeadsCount > 0 ? `${unreadLeadsCount} NEW` : undefined,
      badgeHighlight: unreadLeadsCount > 0,
    },
    {
      name: "Bookings",
      href: "/admin/bookings",
      icon: CalendarCheck,
      badge: unreadBookingsCount > 0 ? `${unreadBookingsCount} NEW` : "ASC",
      badgeHighlight: unreadBookingsCount > 0,
    },
    {
      name: "Vehicles & Fleet",
      href: "/admin/vehicles",
      icon: CarFront,
    },
    {
      name: "Rental Packages",
      href: "/admin/packages",
      icon: Sparkles,
    },
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out of the Admin Console?")) {
      removeAuthToken();
      router.push("/admin/login");
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-navy-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-navy-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-amber-500 shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center border-2 border-amber-400/40">
              <img
                src="/logo.png"
                alt="BroomBoom Cabs"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                BroomBoom
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-medium border border-amber-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Puja &amp; Outstation Fleet</p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Main Management
          </div>

          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-amber-500 text-navy-950 font-semibold shadow-md shadow-amber-500/20"
                    : "text-slate-300 hover:text-white hover:bg-navy-800/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      active ? "text-navy-950" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold transition-all ${
                      (item as any).badgeHighlight
                        ? active
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse"
                        : active
                        ? "bg-navy-950 text-amber-400"
                        : "bg-navy-800 text-slate-400 border border-navy-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            System Links
          </div>

          <a
            href="http://durgapuja-admin.broomboomcabs.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-amber-400 hover:bg-navy-800/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4" />
              <span>Customer Website</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono"></span>
          </a>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/60">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-navy-950 font-bold flex items-center justify-center text-sm shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "BroomBoom Admin"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-amber-400/90 truncate">
                <ShieldCheck className="w-3 h-3" />
                <span>{user?.role || "Super Controller"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-navy-800 hover:border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

