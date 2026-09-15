"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  fetchBookings,
  updateBookingStatus,
  createBooking,
  Booking,
  sortBookingsAscending,
} from "../lib/api";
import {
  CalendarCheck,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  X,
  Phone,
  Mail,
  MapPin,
  Car,
  Tag,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  CreditCard,
  Receipt,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import Pagination from "../components/Pagination";


const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", 
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    vehicleName: "Innova Crysta Royal Chauffeur",
    vehicleModels: "Toyota Innova Crysta",
    vehicleSeats: 7,
    packageTitle: "South Kolkata Mega Theme Pandal Parikrama",
    travelDate: new Date().toISOString().split("T")[0],
    pickupTime: "14:00",
    returnDate: "",
    returnTime: "",
    pickupAddress: "",
    pickupPincode: "",
    pickupState: "",
    totalTariff: 4499,
    advancePaid: 1500,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      // Ensure sorted ASC
      setBookings(sortBookingsAscending(data));
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Search Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : b.status === statusFilter;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        b.customerName?.toLowerCase().includes(query) ||
        b.customerPhone?.includes(query) ||
        b.bookingId?.toLowerCase().includes(query) ||
        b.vehicleName?.toLowerCase().includes(query) ||
        b.pickupAddress?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Pagination state & calculation
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);


  const handleStatusChange = async (
    id: string,
    newStatus: string
  ) => {
    setUpdatingId(id);
    try {
      const updated = await updateBookingStatus(id, newStatus);
      setBookings((prev) =>
        sortBookingsAscending(
          prev.map((b) => (b.id === id || b.bookingId === id ? updated : b))
        )
      );
      if (selectedBooking && (selectedBooking.id === id || selectedBooking.bookingId === id)) {
        setSelectedBooking(updated);
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createBooking(newBooking);
      setBookings((prev) => sortBookingsAscending([created, ...prev]));
      setShowCreateModal(false);
      setNewBooking({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        vehicleName: "Innova Crysta Royal Chauffeur",
        vehicleModels: "Toyota Innova Crysta",
        vehicleSeats: 7,
        packageTitle: "South Kolkata Mega Theme Pandal Parikrama",
        travelDate: new Date().toISOString().split("T")[0],
        pickupTime: "14:00",
        returnDate: "",
        returnTime: "",
        pickupAddress: "",
        pickupPincode: "",
        pickupState: "",
        totalTariff: 4499,
        advancePaid: 1500,
      });
    } catch (err) {
      alert("Failed to create booking");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Bookings Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Sorted: Earliest First (ASC)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track confirmed Durga Puja rides, monitor balance collections, and dispatch chauffeurs.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadData}
            title="Refresh bookings"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking ID, customer name, phone, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: "All", value: "ALL" },
            { label: "Payment Pending", value: "PAYMENT_PENDING" },
            { label: "Confirmed", value: "CONFIRMED" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Cancelled", value: "CANCELLED" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? "bg-navy-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table (Sorted ASC) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-12 font-mono">#</th>
                <th className="py-3.5 px-4 sm:px-6">Trip Departure (ASC)</th>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Vehicle &amp; Package</th>
                <th className="py-3.5 px-4">Tariff &amp; Balance</th>
                <th className="py-3.5 px-4">Status Action</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No bookings match the filter.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try clearing the search or status filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b, index) => (
                  <tr key={b.id} className="hover:bg-amber-50/30 transition-colors">
                    {/* Row Count / Serial Number (1 2 3 4...) */}
                    <td className="py-4 px-3 text-center font-mono">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center mx-auto text-[11px] border border-slate-200">
                        {(currentPage - 1) * pageSize + index + 1}
                      </span>
                    </td>

                    {/* Departure Date & Time (ASC) */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{b.travelDate}</p>
                          <p className="text-slate-500 font-mono text-[11px]">
                            {b.pickupTime ? (b.pickupTime.toLowerCase().includes("m") ? b.pickupTime : `${b.pickupTime} hrs`) : "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>


                    {/* Booking Reference */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {b.bookingId}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-800">{b.customerName}</p>
                        <p className="text-slate-500 font-mono mt-0.5">{b.customerPhone}</p>
                        <p className="text-slate-400 text-[11px] truncate max-w-[140px]">
                          {b.customerEmail}
                        </p>
                      </div>
                    </td>

                    {/* Vehicle & Package */}
                    <td className="py-4 px-4 max-w-[200px]">
                      <div>
                        <p className="font-semibold text-slate-800 truncate">{b.vehicleName}</p>
                        <p className="text-slate-500 truncate text-[11px] mt-0.5">
                          {b.packageTitle}
                        </p>
                      </div>
                    </td>

                    {/* Tariff & Balance - FULLY BULLETPROOFED */}
                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">
                          ₹{Number(b.totalTariff || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-emerald-600">
                          Paid: ₹{Number(b.advancePaid || 0).toLocaleString("en-IN")}
                        </p>
                        {Number(b.balancePayable || 0) > 0 ? (
                          <p className="text-[11px] font-semibold text-rose-600">
                            Due: ₹{Number(b.balancePayable || 0).toLocaleString("en-IN")}
                          </p>
                        ) : (
                          <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            PAID IN FULL
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5">
                        <select
                          value={b.status}
                          disabled={updatingId === b.id}
                          onChange={(e) =>
                            handleStatusChange(b.id, e.target.value)
                          }
                          className={`text-xs font-semibold py-1 px-2.5 rounded-lg border outline-none cursor-pointer transition-all ${
                            b.status === "PAYMENT_PENDING"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : b.status === "CONFIRMED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : b.status === "IN_PROGRESS"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : b.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          {/* Fallback option if DB status is custom */}
                          {!["PAYMENT_PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(b.status) && (
                            <option value={b.status}>{b.status}</option>
                          )}
                        </select>

                        {/* Payment Status from DB */}
                        {b.paymentStatus && (
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold w-fit ${
                              b.paymentStatus === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.paymentStatus === "PENDING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            Pay: {b.paymentStatus}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Details Action */}
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100 transition-colors inline-block"
                        title="Edit Booking Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredBookings.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 8, 15, 25, 50]}
        />
      </div>


      {/* Booking Details Modal (View Only) */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-amber-500 shrink-0 shadow-md border border-amber-400/50 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="BroomBoom"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    {selectedBooking.bookingId}
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedBooking.status === "PAYMENT_PENDING"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : selectedBooking.status === "CONFIRMED"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : selectedBooking.status === "IN_PROGRESS"
                        ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                        : selectedBooking.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    {selectedBooking.status.replace(/_/g, " ")}
                  </span>
                  {selectedBooking.paymentStatus && (
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        selectedBooking.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : selectedBooking.paymentStatus === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      Payment: {selectedBooking.paymentStatus}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Trip Assignment Details
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
                  Customer Information
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedBooking.customerName}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedBooking.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedBooking.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Itinerary Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
                  Trip Itinerary
                </p>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Travel Date</span>
                    <strong className="text-slate-900 text-sm">
                      {selectedBooking.travelDate}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Pickup Time</span>
                    <strong className="text-slate-900 text-sm">
                      {selectedBooking.pickupTime} hrs
                    </strong>
                  </div>
                  
                  {/* Fixed Read-Only Display for Address/State/Pincode */}
                  <div className="col-span-2 mt-3 pt-3 border-t border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Pickup Location</span>
                    <strong className="text-slate-900 text-sm block mt-0.5">
                      {selectedBooking.pickupAddress}
                    </strong>
                    {selectedBooking.pickupPincode && (
                      <span className="text-slate-600 text-xs block mt-1">
                        - {selectedBooking.pickupPincode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle & Package */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
                  Fleet &amp; Package Assigned
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Vehicle:</span>
                    <strong className="text-slate-900">{selectedBooking.vehicleName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Package:</span>
                    <strong className="text-slate-900">{selectedBooking.packageTitle}</strong>
                  </div>
                </div>
              </div>

              {/* Financials & Complete Extra Charges Breakdown */}
              {(() => {
                const fare = Number(selectedBooking.fare ?? selectedBooking.totalTariff ?? 0);
                const advance = Number(
                  selectedBooking.advanceAmount ?? selectedBooking.advancePaid ?? Math.round(fare * 0.25)
                );
                const gst = Number(selectedBooking.gstAmount ?? Math.round(advance * 0.05));
                const gateway = Number(
                  selectedBooking.gatewayCharge ?? Math.ceil((advance + gst) * 0.03)
                );
                const finalPayable = Number(
                  selectedBooking.finalPayable ?? (advance + gst + gateway)
                );
                const balanceDue = Number(
                  selectedBooking.balanceDue ?? Math.max(0, fare - advance)
                );

                const formatTime = (dStr?: string | null) => {
                  if (!dStr) return "N/A";
                  try {
                    const d = new Date(dStr);
                    if (isNaN(d.getTime())) return dStr;
                    return d.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    });
                  } catch {
                    return dStr;
                  }
                };

                return (
                  <div className="space-y-3">
                    {/* Charges Box */}
                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/70 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 mb-2.5">
                        <span className="font-bold text-amber-950 uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5 text-amber-700" />
                          <span>Tariff, Extras &amp; Final Payable Breakdown</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                          25% Adv + 5% GST + 3% Gateway
                        </span>
                      </div>

                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex items-center justify-between">
                          <span>Base Ride Fare:</span>
                          <span className="font-bold text-slate-900">
                            ₹{fare.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>25% Advance Share:</span>
                          <span className="font-semibold text-emerald-700">
                            ₹{advance.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>5% GST on Advance:</span>
                          <span className="font-mono">+₹{gst.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>3% Payment Gateway Charge:</span>
                          <span className="font-mono">+₹{gateway.toLocaleString("en-IN")}</span>
                        </div>

                        {/* Final Online Paid */}
                        <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 font-bold bg-emerald-50/80 -mx-4 px-4 py-2 text-emerald-900">
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Final Payable (Paid Online):</span>
                          </span>
                          <span className="text-base font-mono font-black text-emerald-800">
                            ₹{finalPayable.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Balance at Pickup */}
                        <div className="flex items-center justify-between pt-2 text-xs font-bold">
                          <span className="text-slate-900">Balance Collection at Pickup:</span>
                          <span
                            className={
                              balanceDue > 0 ? "text-rose-600 font-mono text-sm" : "text-emerald-700 font-mono"
                            }
                          >
                            ₹{balanceDue.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* When Paid & Timestamp Audit */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2.5">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Payment &amp; Timestamp Details</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Payment Confirmation (When Paid):</span>
                          {selectedBooking.paymentStatus === "PAID" ? (
                            <strong className="text-emerald-700 font-mono font-bold block mt-0.5">
                              ✓ {formatTime(selectedBooking.updatedAt || selectedBooking.createdAt)}
                            </strong>
                          ) : (
                            <span className="text-amber-700 font-semibold block mt-0.5">
                              ⏳ Awaiting Payment ({selectedBooking.paymentStatus || "PENDING"})
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-slate-400 block">Booking Initialized At:</span>
                          <strong className="text-slate-800 font-mono block mt-0.5">
                            {formatTime(selectedBooking.createdAt)}
                          </strong>
                        </div>

                        {selectedBooking.cashfreeOrderId && (
                          <div className="col-span-1 sm:col-span-2 pt-1.5 border-t border-slate-100 flex items-center gap-2">
                            <span className="text-slate-500">Cashfree Order ID:</span>
                            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {selectedBooking.cashfreeOrderId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Add Manual Booking
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Create an offline or call-in reservation with automatic date sort.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourav Ganguly"
                  value={newBooking.customerName}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, customerName: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98300 XXXXX"
                    value={newBooking.customerPhone}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, customerPhone: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="customer@gmail.com"
                    value={newBooking.customerEmail}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, customerEmail: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newBooking.travelDate}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, travelDate: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pickup Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newBooking.pickupTime}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, pickupTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pickup Address / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salt Lake City Centre 1, Kolkata"
                    value={newBooking.pickupAddress}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, pickupAddress: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 700019"
                    value={newBooking.pickupPincode || ""}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, pickupPincode: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <select
                    value={newBooking.pickupState || ""}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, pickupState: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  >
                    <option value="" disabled>Select a state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vehicle Category
                  </label>
                  <select
                    value={newBooking.vehicleName}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, vehicleName: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  >
                    <option value="Dzire / Etios Chauffeur Sedan">Dzire / Etios Sedan</option>
                    <option value="Ertiga / Carens Executive SUV">Ertiga / Carens SUV</option>
                    <option value="Innova Crysta Royal Chauffeur">Innova Crysta Luxury</option>
                    <option value="Force Tempo Traveller (13 Seater)">Force Tempo Traveller</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Package Title
                  </label>
                  <select
                    value={newBooking.packageTitle}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, packageTitle: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  >
                    <option value="South Kolkata Mega Theme Pandal Parikrama">South Kolkata Mega</option>
                    <option value="North Kolkata Heritage & Bonedi Bari Darshan">North Kolkata Heritage</option>
                    <option value="Night-Owl All-Night Pandal Safari">Night Owl Safari</option>
                    <option value="Kolkata to Digha Beach Break">Digha Beach Break</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Tariff (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newBooking.totalTariff}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, totalTariff: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Advance Paid (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newBooking.advancePaid}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, advancePaid: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                Balance due at pickup:{" "}
                <strong>
                  ₹{(Math.max(0, Number(newBooking.totalTariff || 0) - Number(newBooking.advancePaid || 0))).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold shadow-md"
                >
                  Confirm &amp; Insert (ASC)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}