"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import StatsCard from "./components/StatsCard";
import {
  fetchBookings,
  fetchVehicles,
  fetchPackages,
  fetchLeads,
  updateLeadStatus,
  Booking,
  Vehicle,
  Package,
  Lead,
  formatLeadAction,
} from "./lib/api";
import {
  IndianRupee,
  CalendarCheck,
  CarFront,
  Sparkles,
  ArrowRight,
  Clock,
  UserCheck,
  Phone,
  Mail,
  RefreshCw,
  PlusCircle,
  MapPin,
  Search,
  Activity,
  Calendar,
  Users,
} from "lucide-react";
import Pagination from "./components/Pagination";


export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");

  const loadData = async () => {
    try {
      const [b, v, p, l] = await Promise.all([
        fetchBookings(),
        fetchVehicles(),
        fetchPackages(),
        fetchLeads(),
      ]);
      setBookings(b);
      setVehicles(v);
      setPackages(p);
      setLeads(l);
    } catch (err) {
      console.error("Failed loading dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Format Date and Time
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // Calculations
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalTariff || 0), 0);
  const advanceCollected = bookings.reduce((sum, b) => sum + (b.advancePaid || 0), 0);
  const balancePending = bookings.reduce((sum, b) => sum + (b.balancePayable || 0), 0);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    const q = leadSearch.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.status && l.status.toLowerCase().includes(q))
    );
  }, [leads, leadSearch]);

  // Leads Pagination state & calculation
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsPageSize, setLeadsPageSize] = useState(5);

  useEffect(() => {
    setLeadsPage(1);
  }, [leadSearch]);

  const totalLeadsPages = Math.ceil(filteredLeads.length / leadsPageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (leadsPage - 1) * leadsPageSize;
    return filteredLeads.slice(start, start + leadsPageSize);
  }, [filteredLeads, leadsPage, leadsPageSize]);

  // Upcoming Bookings Pagination state & calculation
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsPageSize, setBookingsPageSize] = useState(5);

  const totalBookingsPages = Math.ceil(bookings.length / bookingsPageSize) || 1;
  const paginatedUpcomingBookings = useMemo(() => {
    const start = (bookingsPage - 1) * bookingsPageSize;
    return bookings.slice(start, start + bookingsPageSize);
  }, [bookings, bookingsPage, bookingsPageSize]);


  return (
    <div className="space-y-8">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-navy-850 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-navy-800 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold mb-3 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kolkata Fleet Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Durga Puja 2026 Fleet Operations
          </h1>
          <p className="text-sm text-slate-300 mt-1.5 max-w-xl">
            Real-time status of chauffeur rentals, bookings queue sorted by travel departure date, and registered customer user leads.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium border border-navy-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Sync Fleet"}</span>
          </button>

          <Link
            href="/admin/bookings"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manage Bookings</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Booking Value"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          color="amber"
          trend={{ value: "+24.8%", positive: true, label: "vs last season" }}
          subtitle={`₹${advanceCollected.toLocaleString("en-IN")} Advance Collected`}
        />

        <StatsCard
          title="Active Confirmed Bookings"
          value={bookings.length}
          icon={CalendarCheck}
          color="blue"
          trend={{ value: "Sorted ASC", positive: null, label: "departure sequence" }}
          subtitle={`₹${balancePending.toLocaleString("en-IN")} Balance to collect`}
        />

        <StatsCard
          title="User Leads & Logins"
          value={leads.length}
          icon={Users}
          color="emerald"
          trend={{ value: "Live Inquiries", positive: true, label: "real-time" }}
          subtitle="Customer auth & requests"
        />

        <StatsCard
          title="Fleet Categories"
          value={vehicles.length}
          icon={CarFront}
          color="purple"
          trend={{ value: "100% Ready", positive: true, label: "Sanitized & AC" }}
          subtitle="Sedans, SUVs & Travellers"
        />
      </div>

      {/* SECTION: User Leads (Name, Email, Phone, Action, Date and Time) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                User Leads
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-semibold">
                {filteredLeads.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              User login details, contact inquiries, requested actions, and timestamp history.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            {/* Search Input for Leads */}
            <div className="relative sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads by name, email, phone..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-12 font-mono">#</th>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Phone Number</th>
                <th className="py-3.5 px-6">Action</th>
                <th className="py-3.5 px-6">Date &amp; Time</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No user leads matching your search.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead, index) => (
                  <tr key={lead.id} className="hover:bg-amber-50/20 transition-colors">
                    {/* Row Count / Serial Number (1 2 3 4...) */}
                    <td className="py-4 px-3 text-center font-mono">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center mx-auto text-[11px] border border-slate-200">
                        {(leadsPage - 1) * leadsPageSize + index + 1}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-navy-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {lead.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{lead.name}</p>
                        </div>
                      </div>
                    </td>


                    {/* Email */}
                    <td className="py-4 px-6">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-slate-700 hover:text-amber-600 font-medium inline-flex items-center gap-1.5 transition-colors"
                        title="Send email"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.email}</span>
                      </a>
                    </td>

                    {/* Phone Number */}
                    <td className="py-4 px-6">
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-slate-700 hover:text-amber-600 font-mono font-medium inline-flex items-center gap-1.5 transition-colors"
                        title="Call user"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.phone}</span>
                      </a>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          lead.action === "User Login"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : lead.action === "Book Package" || lead.action === "book"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : lead.action === "Explore Fleet" || lead.action === "Explore Outstation" || lead.action === "explore"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        <Activity className="w-3 h-3 shrink-0" />
                        <span>{formatLeadAction(lead.action)}</span>
                      </span>
                    </td>

                    {/* Date and Time */}
                    <td className="py-4 px-6 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700">
                          {formatDateTime(lead.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          lead.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : lead.status === "NEW"
                            ? "bg-blue-100 text-blue-800"
                            : lead.status === "CONTACTED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* User Leads Pagination */}
        <Pagination
          currentPage={leadsPage}
          totalPages={totalLeadsPages}
          totalItems={filteredLeads.length}
          pageSize={leadsPageSize}
          onPageChange={setLeadsPage}
          onPageSizeChange={(sz) => {
            setLeadsPageSize(sz);
            setLeadsPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>


      {/* Upcoming Bookings Queue (Sorted ASC) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Upcoming Chauffeur Departures
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-semibold">
                SORTED ASC
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Earliest scheduled Puja pandal tours and outstation trips at the top
            </p>
          </div>

          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 group"
          >
            <span>View All {bookings.length} Bookings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12 font-mono">#</th>
                <th className="py-3 px-6">Departure Date &amp; Time</th>
                <th className="py-3 px-6">Booking ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Vehicle / Package</th>
                <th className="py-3 px-6">Tariff Breakdown</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUpcomingBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No upcoming bookings found.
                  </td>
                </tr>
              ) : (
                paginatedUpcomingBookings.map((b, index) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Row Count / Serial Number (1 2 3 4...) */}
                    <td className="py-4 px-3 text-center font-mono">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center mx-auto text-[11px] border border-slate-200">
                        {(bookingsPage - 1) * bookingsPageSize + index + 1}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <div>
                          <p className="font-semibold text-xs">{b.travelDate}</p>
                          <p className="text-[11px] text-slate-500">{b.pickupTime ? (b.pickupTime.toLowerCase().includes("m") ? b.pickupTime : `${b.pickupTime} hrs`) : "N/A"}</p>
                        </div>
                      </div>
                    </td>


                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {b.bookingId}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">{b.customerName}</p>
                        <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{b.customerPhone}</span>
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800">{b.vehicleName}</p>
                        <p className="text-slate-500 truncate max-w-xs">{b.packageTitle}</p>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">₹{b.totalTariff.toLocaleString("en-IN")}</p>
                        <p className="text-[11px] text-emerald-600">
                          Paid: ₹{b.advancePaid.toLocaleString("en-IN")}
                          {b.balancePayable > 0 && (
                            <span className="text-amber-700 ml-1">
                              (Bal: ₹{b.balancePayable.toLocaleString("en-IN")})
                            </span>
                          )}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                          b.status === "PAYMENT_PENDING"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : b.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : b.status === "IN_PROGRESS"
                            ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                            : b.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {b.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Upcoming Bookings Pagination */}
        <Pagination
          currentPage={bookingsPage}
          totalPages={totalBookingsPages}
          totalItems={bookings.length}
          pageSize={bookingsPageSize}
          onPageChange={setBookingsPage}
          onPageSizeChange={(sz) => {
            setBookingsPageSize(sz);
            setBookingsPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>


      {/* Fleet Lineup & Pricing */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Fleet Lineup &amp; Pricing</h3>
            <p className="text-xs text-slate-500">
              Chauffeur-driven vehicles available for Puja parikrama
            </p>
          </div>
          <Link
            href="/admin/vehicles"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700"
          >
            Configure Fleet →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-amber-400 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {v.category}
                  </span>
                  <span className="text-xs font-bold text-amber-600">
                    ₹{v.basePrice} / {v.baseHours}h
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-800">{v.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{v.models}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Seats: {v.seats}</span>
                <span>Extra: ₹{v.perExtraHour}/hr</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
