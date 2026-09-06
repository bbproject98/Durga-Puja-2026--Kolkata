"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Car,
  Users,
  CalendarCheck,
  ExternalLink,
  Sparkles,
  Clock,
  X,
} from "lucide-react";
import { useNotifications, NotificationItem } from "../context/NotificationContext";

export default function NotificationBell() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    unreadBookingsCount,
    unreadLeadsCount,
    markAsRead,
    markAllAsRead,
    refresh,
    loading,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "BOOKING" | "LEAD">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "ALL") return true;
    return n.type === filter;
  });

  const handleItemClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsOpen(false);
    router.push(item.link);
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      const now = new Date().getTime();
      const time = new Date(timestamp).getTime();
      if (isNaN(time)) return "";

      const diffSec = Math.floor((now - time) / 1000);
      if (diffSec < 60) return "Just now";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDay = Math.floor(diffHr / 24);
      if (diffDay === 1) return "Yesterday";
      if (diffDay < 7) return `${diffDay}d ago`;

      return new Date(timestamp).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="View Notifications"
        aria-label="View Notifications"
        className={`p-2.5 rounded-xl transition-all relative ${
          isOpen
            ? "bg-amber-100 text-amber-900 ring-2 ring-amber-400/40"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }`}
      >
        <Bell className="w-4 h-4" />

        {/* Dynamic Unread Badge */}
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 animate-ping opacity-60 pointer-events-none" />
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center ring-2 ring-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-mono font-bold">
                  {unreadCount} New
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-mono font-semibold">
                  All caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                title="Refresh notifications"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-600" : ""}`}
                />
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="px-2 py-1 rounded-lg text-slate-600 hover:text-navy-950 hover:bg-slate-200/60 text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mark read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === "ALL"
                  ? "bg-slate-900 text-white shadow-2xs font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("BOOKING")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filter === "BOOKING"
                  ? "bg-slate-900 text-white shadow-2xs font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>Bookings</span>
              {unreadBookingsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  {unreadBookingsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setFilter("LEAD")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filter === "LEAD"
                  ? "bg-slate-900 text-white shadow-2xs font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>Leads</span>
              {unreadLeadsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  {unreadLeadsCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  No notifications
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {filter === "ALL"
                    ? "New bookings and user leads will appear here."
                    : `No ${filter.toLowerCase()} notifications at this moment.`}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative group ${
                    !item.read
                      ? "bg-amber-50/40 hover:bg-amber-50/80"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  {/* Icon Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm shadow-xs ${
                      item.type === "BOOKING"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {item.type === "BOOKING" ? (
                      <Car className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                  </div>

                  {/* Content Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          !item.read
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-700"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {item.subtitle}
                    </p>

                    {item.detail && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {item.detail}
                      </p>
                    )}

                    <div className="mt-1.5 flex items-center gap-1.5">
                      {item.status && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            item.status === "CONFIRMED"
                              ? "bg-blue-100 text-blue-800"
                              : item.status === "PAYMENT_PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : item.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "NEW"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.status.replace(/_/g, " ")}
                        </span>
                      )}

                      <span className="text-[10px] text-amber-600 font-semibold group-hover:underline flex items-center gap-0.5 ml-auto">
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>

                  {/* Unread Glowing Dot */}
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200 shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/admin/bookings"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-slate-600 hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Bookings Queue</span>
            </Link>
            <Link
              href="/admin/leads"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-slate-600 hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Leads</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

