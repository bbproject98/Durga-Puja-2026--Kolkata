"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { fetchBookings, fetchLeads, Booking, Lead } from "../lib/api";

export interface NotificationItem {
  id: string;
  type: "BOOKING" | "LEAD";
  title: string;
  subtitle: string;
  detail?: string;
  timestamp: string;
  read: boolean;
  link: string;
  status?: string;
  amount?: number;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: "BOOKING" | "LEAD";
  link: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  unreadBookingsCount: number;
  unreadLeadsCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => Promise<void>;
  loading: boolean;
  toast: ToastItem | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const READ_STORAGE_KEY = "broomboom_read_notification_ids";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastItem | null>(null);

  // Keep track of previously known IDs to trigger toasts only on new items
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);

  // Initialize read IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(READ_STORAGE_KEY);
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch {
      // fallback
    }
  }, []);

  const persistReadIds = (ids: string[]) => {
    setReadIds(ids);
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const [bookings, leads] = await Promise.all([
        fetchBookings().catch(() => [] as Booking[]),
        fetchLeads().catch(() => [] as Lead[]),
      ]);

      const storedRead = (() => {
        try {
          const s = localStorage.getItem(READ_STORAGE_KEY);
          return s ? (JSON.parse(s) as string[]) : [];
        } catch {
          return [];
        }
      })();

      const items: NotificationItem[] = [];
      const newItemsForToast: NotificationItem[] = [];

      // Process Bookings
      bookings.forEach((b) => {
        const id = `booking-${b.id || b.bookingId}`;
        const isRead = storedRead.includes(id);
        const notif: NotificationItem = {
          id,
          type: "BOOKING",
          title: `New Booking: ${b.bookingId}`,
          subtitle: `${b.customerName} • ${b.vehicleName}`,
          detail: `₹${Number(b.totalTariff || 0).toLocaleString("en-IN")} • ${b.packageTitle}`,
          timestamp: b.createdAt || new Date().toISOString(),
          read: isRead,
          link: "/admin/bookings",
          status: b.status,
          amount: b.totalTariff,
        };
        items.push(notif);

        if (initialLoadDoneRef.current && !knownIdsRef.current.has(id)) {
          newItemsForToast.push(notif);
        }
        knownIdsRef.current.add(id);
      });

      // Process Leads
      leads.forEach((l) => {
        const id = `lead-${l.id}`;
        const isRead = storedRead.includes(id);
        const notif: NotificationItem = {
          id,
          type: "LEAD",
          title: `New Lead: ${l.name}`,
          subtitle: `${l.phone} • ${l.action || "Inquiry Captured"}`,
          detail: l.context || l.email,
          timestamp: l.createdAt || new Date().toISOString(),
          read: isRead,
          link: "/admin/leads",
          status: l.status,
        };
        items.push(notif);

        if (initialLoadDoneRef.current && !knownIdsRef.current.has(id)) {
          newItemsForToast.push(notif);
        }
        knownIdsRef.current.add(id);
      });

      // Sort by newest first
      items.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(items);

      // Trigger toast for newest incoming item if this is a live update
      if (initialLoadDoneRef.current && newItemsForToast.length > 0) {
        const latest = newItemsForToast[0];
        setToast({
          id: latest.id,
          title: latest.title,
          message: latest.subtitle,
          type: latest.type,
          link: latest.link,
        });
      }

      initialLoadDoneRef.current = true;
    } catch (err) {
      console.error("Failed to poll notifications:", err);
    } finally {
      if (isManual) setLoading(false);
    }
  }, []);

  // Poll on mount and interval (every 15s)
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 15000);

    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadData]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const markAsRead = useCallback(
    (id: string) => {
      const updated = Array.from(new Set([...readIds, id]));
      persistReadIds(updated);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
    [readIds]
  );

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    persistReadIds(updated);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications, readIds]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadBookingsCount = notifications.filter(
    (n) => n.type === "BOOKING" && !n.read
  ).length;
  const unreadLeadsCount = notifications.filter(
    (n) => n.type === "LEAD" && !n.read
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        unreadBookingsCount,
        unreadLeadsCount,
        markAsRead,
        markAllAsRead,
        refresh,
        loading,
        toast,
        dismissToast,
      }}
    >
      {children}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-amber-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === "BOOKING"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {toast.type === "BOOKING" ? "🚗" : "👤"}
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-bold text-slate-100 flex items-center gap-1.5">
              <span>{toast.title}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </p>
            <p className="text-slate-400 truncate mt-0.5">{toast.message}</p>
            <div className="mt-2 flex items-center gap-2">
              <a
                href={toast.link}
                onClick={dismissToast}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
              >
                View Details →
              </a>
            </div>
          </div>
          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            ✕
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

