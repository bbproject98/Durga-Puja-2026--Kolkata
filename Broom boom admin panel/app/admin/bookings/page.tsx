import React, { useState, useEffect, useMemo } from "react";
import {
  fetchBookings,
  updateBookingStatus,
  createBooking,
  Booking,
  sortBookingsAscending,
  sortBookingsNewestFirst,
} from "../lib/api";
import {
  CalendarCheck,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "PICUP_ASC" | "PICUP_DESC">("NEWEST");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newBooking, setNewBooking] = useState({
    customerName: "",
    customerPhone: "",
    pickupLocation: "",
    dropLocation: "",
    travelDate: "",
    pickupTime: "",
    vehicleType: "Sedan",
    totalAmount: 3000,
    advancePaid: 1500,
  });

  const applySorting = (list: Booking[], order: "NEWEST" | "PICUP_ASC" | "PICUP_DESC") => {
    if (order === "NEWEST") {
      return sortBookingsNewestFirst(list);
    }
    if (order === "PICUP_ASC") {
      return sortBookingsAscending(list);
    }
    if (order === "PICUP_DESC") {
      return [...sortBookingsAscending(list)].reverse();
    }
    return list;
  };

  const formatBookingCreated = (dateStr?: string) => {
    if (!dateStr) return { date: "N/A", time: "", badge: "" };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: dateStr, time: "", badge: "" };

      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      const time = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const date = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      let badge = "";
      if (diffMins >= 0 && diffMins < 60) {
        badge = `${Math.max(1, diffMins)}m ago`;
      } else if (diffHours >= 0 && diffHours < 24) {
        badge = `${diffHours}h ago`;
      }

      return { date, time, badge };
    } catch {
      return { date: dateStr, time: "", badge: "" };
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      setBookings(applySorting(data, sortBy));
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setBookings((prev) => applySorting(prev, sortBy));
    setCurrentPage(1);
  }, [sortBy]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus =
        statusFilter === "ALL" || b.status?.toUpperCase() === statusFilter.toUpperCase();

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesStatus;

      const matchesSearch =
        b.customerName?.toLowerCase().includes(query) ||
        b.customerPhone?.toLowerCase().includes(query) ||
        b.bookingId?.toLowerCase().includes(query) ||
        b.id?.toLowerCase().includes(query) ||
        b.pickupLocation?.toLowerCase().includes(query) ||
        b.dropLocation?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const updated = await updateBookingStatus(id, newStatus);
      setBookings((prev) =>
        applySorting(
          prev.map((b) => (b.id === id || b.bookingId === id ? updated : b)),
          sortBy
        )
      );
      if (selectedBooking && (selectedBooking.id === id || selectedBooking.bookingId === id)) {
        setSelectedBooking(updated);
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createBooking(newBooking);
      setBookings((prev) => applySorting([created, ...prev], sortBy));
      setShowCreateModal(false);
      setNewBooking({
        customerName: "",
        customerPhone: "",
        pickupLocation: "",
        dropLocation: "",
        travelDate: "",
        pickupTime: "",
        vehicleType: "Sedan",
        totalAmount: 3000,
        advancePaid: 1500,
      });
    } catch (err) {
      console.error("Error creating booking:", err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Bookings Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {sortBy === "NEWEST"
                ? "Sorted: Latest Bookings First"
                : sortBy === "PICUP_ASC"
                ? "Sorted: Picup Date (ASC)"
                : "Sorted: Picup Date (DESC)"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track customer bookings, vehicle assignments, and picup schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer disabled:opacity-50"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-navy-950 font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Booking
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking ID, customer, phone, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs shrink-0 self-start sm:self-auto">
          <span className="text-[11px] text-slate-500 font-semibold px-2">Sort:</span>
          <button
            type="button"
            onClick={() => setSortBy("NEWEST")}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              sortBy === "NEWEST"
                ? "bg-amber-500 text-navy-950 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Newest First
          </button>
          <button
            type="button"
            onClick={() => setSortBy("PICUP_ASC")}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              sortBy === "PICUP_ASC"
                ? "bg-amber-500 text-navy-950 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Picup Date (ASC)
          </button>
          <button
            type="button"
            onClick={() => setSortBy("PICUP_DESC")}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              sortBy === "PICUP_DESC"
                ? "bg-amber-500 text-navy-950 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Picup Date (DESC)
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {["ALL", "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-12 font-mono">#</th>
                <th className="py-3.5 px-4 sm:px-6">Picup &amp; Booking Date</th>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Vehicle &amp; Route</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading bookings...
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No bookings found matching the current filters.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b, idx) => {
                  const created = formatBookingCreated(b.createdAt);
                  return (
                    <tr
                      key={b.id || b.bookingId || idx}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-4 px-3 text-center font-mono text-slate-400">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>

                      {/* Booking Date & Picup Schedule */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">
                              {created.date}
                            </span>
                            {created.time && (
                              <span className="text-[11px] text-slate-500 font-mono">
                                {created.time}
                              </span>
                            )}
                            {created.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono border border-amber-200">
                                {created.badge}
                              </span>
                            )}
                          </div>

                          {b.travelDate && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 w-fit">
                              <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="font-medium text-slate-800">
                                Picup: {b.travelDate}
                              </span>
                              {b.pickupTime && (
                                <span className="text-slate-400 font-mono">
                                  • {b.pickupTime}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-medium text-slate-700">
                        {b.bookingId || b.id || "N/A"}
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-900">{b.customerName || "N/A"}</p>
                        <p className="text-slate-500 font-mono text-[11px]">
                          {b.customerPhone || "N/A"}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-800">{b.vehicleType || "Standard"}</p>
                        <p className="text-slate-500 text-[11px] truncate max-w-[200px]">
                          {b.pickupLocation || "N/A"} → {b.dropLocation || "N/A"}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            b.status?.toUpperCase() === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : b.status?.toUpperCase() === "PENDING"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : b.status?.toUpperCase() === "CANCELLED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {b.status || "PENDING"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {b.status?.toUpperCase() === "PENDING" && (
                            <button
                              disabled={updatingId === (b.id || b.bookingId)}
                              onClick={() => handleStatusUpdate(b.id || b.bookingId, "CONFIRMED")}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Confirm booking"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {b.status?.toUpperCase() !== "CANCELLED" && (
                            <button
                              disabled={updatingId === (b.id || b.bookingId)}
                              onClick={() => handleStatusUpdate(b.id || b.bookingId, "CANCELLED")}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Cancel booking"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50">
          <span>
            Showing {paginatedBookings.length ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of{" "}
            {filteredBookings.length} bookings
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-500 block">Booking Reference:</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedBooking.bookingId || selectedBooking.id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Customer:</span>
                  <span className="font-semibold text-slate-800">{selectedBooking.customerName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone:</span>
                  <span className="font-mono text-slate-800">{selectedBooking.customerPhone || "N/A"}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Route:</span>
                <span className="font-medium text-slate-800">
                  {selectedBooking.pickupLocation || "N/A"} → {selectedBooking.dropLocation || "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Picup Date:</span>
                  <span className="font-medium text-slate-800">{selectedBooking.travelDate || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Picup Time:</span>
                  <span className="font-medium text-slate-800">{selectedBooking.pickupTime || "N/A"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <span className="font-bold text-slate-800">{selectedBooking.status || "PENDING"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vehicle:</span>
                  <span className="font-medium text-slate-800">{selectedBooking.vehicleType || "Standard"}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Create Manual Booking</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newBooking.customerName}
                    onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Phone</label>
                  <input
                    type="text"
                    required
                    value={newBooking.customerPhone}
                    onChange={(e) => setNewBooking({ ...newBooking, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Picup Location</label>
                  <input
                    type="text"
                    required
                    value={newBooking.pickupLocation}
                    onChange={(e) => setNewBooking({ ...newBooking, pickupLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Drop Location</label>
                  <input
                    type="text"
                    required
                    value={newBooking.dropLocation}
                    onChange={(e) => setNewBooking({ ...newBooking, dropLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Picup Date</label>
                  <input
                    type="date"
                    required
                    value={newBooking.travelDate}
                    onChange={(e) => setNewBooking({ ...newBooking, travelDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Picup Time</label>
                  <input
                    type="time"
                    required
                    value={newBooking.pickupTime}
                    onChange={(e) => setNewBooking({ ...newBooking, pickupTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}