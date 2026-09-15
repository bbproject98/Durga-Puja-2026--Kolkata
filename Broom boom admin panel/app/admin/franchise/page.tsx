"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  fetchFranchiseLeads,
  saveFranchiseLead,
  updateFranchiseLead,
  updateFranchiseLeadStatus,
  deleteFranchiseLead,
  FranchiseLead,
  FranchiseStatus,
  FranchiseType,
  InvestmentBudget,
} from "../lib/api";
import {
  Search,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  ChevronDown,
  X,
  Filter,
  Briefcase,
  Building2,
  Car,
  Clock,
  Plus,
  Edit,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Send,
  MessageSquare,
  FileText,
} from "lucide-react";
import Pagination from "../components/Pagination";

const STATUS_OPTIONS: { label: string; value: FranchiseStatus; color: string }[] = [
  { label: "New Lead", value: "NEW", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { label: "Contacted", value: "CONTACTED", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { label: "Under Review", value: "UNDER_REVIEW", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { label: "Meeting Scheduled", value: "MEETING_SCHEDULED", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { label: "Agreement Sent", value: "AGREEMENT_SENT", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { label: "Onboarded", value: "ONBOARDED", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { label: "Rejected / Closed", value: "REJECTED", color: "bg-rose-100 text-rose-800 border-rose-200" },
];

const FRANCHISE_TYPES: FranchiseType[] = [
  "City Master Franchise",
  "District Fleet Partner",
  "Unit Franchise Hub",
  "Single Car / Operator Partner",
  "Corporate Partner",
];

const INVESTMENT_RANGES: InvestmentBudget[] = [
  "₹2 - ₹5 Lakhs",
  "₹5 - ₹10 Lakhs",
  "₹10 - ₹25 Lakhs",
  "₹25 - ₹50 Lakhs",
  "₹50 Lakhs+",
];

const FLEET_SIZES = [
  "None (New Entrepreneur)",
  "1 - 5 Vehicles",
  "6 - 15 Vehicles",
  "15+ Vehicles",
];

export default function FranchisePage() {
  const [leads, setLeads] = useState<FranchiseLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Modals
  const [viewingLead, setViewingLead] = useState<FranchiseLead | null>(null);
  const [editingLead, setEditingLead] = useState<FranchiseLead | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState<Partial<FranchiseLead>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchFranchiseLeads();
      setLeads(data);
    } catch (err) {
      console.error("Failed to load franchise leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, priorityFilter]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    return leads.filter((lead) => {
      if (!lead) return false;
      const matchesSearch =
        !q ||
        String(lead.fullName || "").toLowerCase().includes(q) ||
        String(lead.phone || "").toLowerCase().includes(q) ||
        String(lead.email || "").toLowerCase().includes(q) ||
        String(lead.city || "").toLowerCase().includes(q) ||
        String(lead.leadId || "").toLowerCase().includes(q) ||
        String(lead.franchiseType || "").toLowerCase().includes(q) ||
        String(lead.businessExperience || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesType = typeFilter === "all" || lead.franchiseType === typeFilter;
      const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
  }, [leads, search, statusFilter, typeFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "NEW").length;
    const inDiscussion = leads.filter((l) =>
      ["CONTACTED", "UNDER_REVIEW", "MEETING_SCHEDULED", "AGREEMENT_SENT"].includes(l.status)
    ).length;
    const onboarded = leads.filter((l) => l.status === "ONBOARDED").length;
    return { total, newCount, inDiscussion, onboarded };
  }, [leads]);

  // Open Edit Modal
  const handleOpenEdit = (lead: FranchiseLead) => {
    setEditingLead(lead);
    setIsCreatingNew(false);
    setFormData({ ...lead });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingLead(null);
    setIsCreatingNew(true);
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "",
      address: "",
      franchiseType: "District Fleet Partner",
      investmentBudget: "₹10 - ₹25 Lakhs",
      currentFleetSize: "1 - 5 Vehicles",
      hasCommercialOffice: "Planned",
      businessExperience: "",
      preferredLaunchTimeline: "Within 1 Month",
      status: "NEW",
      priority: "MEDIUM",
      assignedTo: "Franchise Desk",
      inquiryMessage: "",
      adminNotes: "",
    });
  };

  // Save Lead (Edit or Create)
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert("Please enter Applicant Full Name and Phone Number");
      return;
    }

    setSaving(true);
    try {
      if (isCreatingNew) {
        const created = await saveFranchiseLead(formData);
        setLeads((prev) => [created, ...prev]);
        setIsCreatingNew(false);
      } else if (editingLead) {
        const updated = await updateFranchiseLead(editingLead.id, formData);
        setLeads((prev) => prev.map((l) => (l.id === editingLead.id ? updated : l)));
        if (viewingLead && viewingLead.id === editingLead.id) {
          setViewingLead(updated);
        }
        setEditingLead(null);
      }
      setFormData({});
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save franchise lead");
    } finally {
      setSaving(false);
    }
  };

  // Status quick-change
  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateFranchiseLeadStatus(id, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } : l))
      );
      if (viewingLead && viewingLead.id === id) {
        setViewingLead((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Delete Lead
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove franchise inquiry from "${name}"?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteFranchiseLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (viewingLead?.id === id) setViewingLead(null);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete lead");
    } finally {
      setDeletingId(null);
    }
  };

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

  const getStatusBadgeClass = (status: string) => {
    const item = STATUS_OPTIONS.find((s) => s.value === status);
    return item ? item.color : "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="space-y-6" data-testid="franchise-page">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                <Briefcase className="w-5 h-5" />
              </span>
              Broomboom Cabs Franchise
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Franchise Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage commercial franchise inquiries, fleet partner applications, and onboard operators across territories.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={loadData}
            title="Refresh Leads"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Franchise Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Inquiries</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{metrics.total}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">All received applications</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">New Inquiries</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 font-mono">{metrics.newCount}</div>
          <p className="text-[11px] text-amber-600/80 mt-0.5">Needs first callback</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Discussion</span>
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2 font-mono">{metrics.inDiscussion}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Under review &amp; meetings</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Onboarded Partners</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{metrics.onboarded}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Active franchise hubs</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, City, Phone, Email, Lead ID, Model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
            >
              <option value="all">All Application Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Franchise Model Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
            >
              <option value="all">All Franchise Models</option>
              {FRANCHISE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Extra Priority Quick Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Priority:
          </span>
          {["all", "HIGH", "MEDIUM", "LOW"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                priorityFilter === p
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p === "all" ? "All Priorities" : `${p} Priority`}
            </button>
          ))}
          <span className="ml-auto text-slate-400 font-mono text-[11px]">
            Showing {filteredLeads.length} of {leads.length} leads
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-12 font-mono">#</th>
                <th className="py-3 px-4">Applicant &amp; Territory</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Franchise Model &amp; Budget</th>
                <th className="py-3 px-4">Fleet / Office</th>
                <th className="py-3 px-4">Application Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    Loading franchise leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700">No franchise leads match your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the filters or add a new lead.</p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead, index) => (
                  <tr key={lead.id} className="hover:bg-amber-50/15 transition-colors">
                    {/* Row Count */}
                    <td className="py-3.5 px-3 text-center font-mono">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center mx-auto text-[11px] border border-slate-200">
                        {(currentPage - 1) * pageSize + index + 1}
                      </span>
                    </td>

                    {/* Applicant & Territory */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-navy-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs mt-0.5">
                          {(lead.fullName || "BB").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{lead.fullName || "Applicant"}</span>
                            {lead.priority === "HIGH" && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                HOT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>
                              {[lead.city, lead.state].filter(Boolean).join(", ") || "Kolkata, WB"}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded mt-1 inline-block">
                            {lead.leadId || lead.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info with Direct Actions */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${lead.phone || ""}`}
                            className="text-slate-800 font-mono hover:text-amber-600 inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{lead.phone || "No phone"}</span>
                          </a>
                          {/* WhatsApp Chat Button */}
                          <a
                            href={`https://wa.me/${String(lead.phone || "").replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                              lead.fullName || ""
                            )},%20regarding%20your%20Broomboom%20Cabs%20Franchise%20Inquiry%20(${lead.leadId || ""})`}
                            target="_blank"
                            rel="noreferrer"
                            title="Chat on WhatsApp"
                            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        </div>
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-slate-500 hover:text-amber-600 inline-flex items-center gap-1 text-xs truncate max-w-[160px] block"
                          >
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Model & Budget */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-800 block text-xs">
                          {lead.franchiseType}
                        </span>
                        <div className="flex items-center gap-1 text-emerald-700 text-xs font-mono font-bold mt-0.5">
                          <IndianRupee className="w-3 h-3 shrink-0" />
                          <span>{lead.investmentBudget}</span>
                        </div>
                      </div>
                    </td>

                    {/* Fleet / Office */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Car className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{lead.currentFleetSize || "None"}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Office: {lead.hasCommercialOffice || "No"}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatDateTime(lead.createdAt)}</span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleQuickStatusChange(lead.id, e.target.value)}
                        className={`text-[11px] font-mono font-bold uppercase rounded-full px-2.5 py-1 border transition-all cursor-pointer focus:outline-none focus:ring-1 ${getStatusBadgeClass(
                          lead.status
                        )}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingLead(lead)}
                          title="View Full Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          title="Edit All Details"
                          className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id, lead.fullName)}
                          disabled={deletingId === lead.id}
                          title="Delete Lead"
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLeads.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 8, 15, 25, 50]}
        />
      </div>

      {/* ============================================================== */}
      {/* 1. VIEW LEAD DETAILS MODAL                                      */}
      {/* ============================================================== */}
      {viewingLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingLead(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Logo & Title */}
            <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-500 shrink-0 shadow-md border border-amber-400/50 flex items-center justify-center">
                <img src="/broomboom-logo.png" alt="BroomBoom" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    {viewingLead.leadId}
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusBadgeClass(
                      viewingLead.status
                    )}`}
                  >
                    {String(viewingLead.status || "NEW").replace(/_/g, " ")}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      viewingLead.priority === "HIGH"
                        ? "bg-rose-100 text-rose-800"
                        : viewingLead.priority === "MEDIUM"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {viewingLead.priority || "MEDIUM"} PRIORITY
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1 truncate">
                  {viewingLead.fullName}
                </h3>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-4 text-xs">
              {/* Personal & Contact Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  Applicant Contact &amp; Territory
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                    <a
                      href={`tel:${viewingLead.phone}`}
                      className="font-bold text-slate-900 text-sm hover:text-amber-600 font-mono inline-flex items-center gap-1 mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {viewingLead.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <a
                      href={`mailto:${viewingLead.email}`}
                      className="font-semibold text-slate-900 text-sm hover:text-amber-600 inline-flex items-center gap-1 mt-0.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {viewingLead.email || "Not provided"}
                    </a>
                  </div>
                  <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-200/60">
                    <span className="text-slate-400 block text-[11px]">Location &amp; Address</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {viewingLead.address ? `${viewingLead.address}, ` : ""}
                      {viewingLead.city}, {viewingLead.state}
                      {viewingLead.pincode ? ` - ${viewingLead.pincode}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Franchise Commercial Terms */}
              <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60">
                <p className="font-bold text-amber-950 uppercase tracking-wider text-[10px] mb-2.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                  Franchise Proposal &amp; Investment
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Requested Model</span>
                    <strong className="text-slate-900 text-sm font-bold block mt-0.5">
                      {viewingLead.franchiseType}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Proposed Investment</span>
                    <strong className="text-emerald-800 text-base font-mono font-black block mt-0.5">
                      {viewingLead.investmentBudget}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Current Fleet Vehicles</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {viewingLead.currentFleetSize || "None"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Commercial Office Space</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {viewingLead.hasCommercialOffice || "No"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Preferred Launch Timeline</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {viewingLead.preferredLaunchTimeline || "Within 1 Month"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Assigned Representative</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {viewingLead.assignedTo || "Franchise Desk"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Experience & Applicant Message */}
              {viewingLead.businessExperience && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Business Background &amp; Transport Experience
                  </p>
                  <p className="text-slate-800 text-xs leading-relaxed">
                    {viewingLead.businessExperience}
                  </p>
                </div>
              )}

              {viewingLead.inquiryMessage && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    Applicant Inquiry Message
                  </p>
                  <p className="text-slate-800 text-xs italic bg-white p-3 rounded-xl border border-slate-200/70">
                    "{viewingLead.inquiryMessage}"
                  </p>
                </div>
              )}

              {/* Admin Internal Notes */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="font-semibold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                  <Edit className="w-3.5 h-3.5 text-amber-600" />
                  Admin Internal Follow-up Notes
                </p>
                <p className="text-slate-800 text-xs">
                  {viewingLead.adminNotes || "No internal remarks recorded yet. Click 'Edit Lead' to add notes."}
                </p>
              </div>

              {/* Audit Timestamps */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                <span>Submitted: {formatDateTime(viewingLead.createdAt)}</span>
                {viewingLead.updatedAt && (
                  <span>Last Modified: {formatDateTime(viewingLead.updatedAt)}</span>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${viewingLead.phone}`}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  Call Applicant
                </a>
                <a
                  href={`https://wa.me/${String(viewingLead.phone || "").replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                    viewingLead.fullName || ""
                  )},%20regarding%20your%20Broomboom%20Cabs%20Franchise%20Inquiry%20(${viewingLead.leadId || ""})`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs inline-flex items-center gap-1.5 border border-emerald-200"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp
                </a>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => {
                    const l = viewingLead;
                    setViewingLead(null);
                    handleOpenEdit(l);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit All Details
                </button>
                <button
                  onClick={() => setViewingLead(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. EDIT / CREATE FRANCHISE LEAD MODAL (FULL CONTROLS)           */}
      {/* ============================================================== */}
      {(editingLead || isCreatingNew) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setEditingLead(null);
                setIsCreatingNew(false);
              }}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isCreatingNew ? "Add New Franchise Inquiry" : `Edit Franchise Lead: ${formData.fullName}`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update any commercial terms, applicant contacts, fleet sizes, and administrative notes.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              {/* Personal Contact */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Applicant Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName || ""}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Subir Karmakar"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98000 00000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. partner@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Territory & Location */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Franchise Territory &amp; Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Siliguri"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state || "West Bengal"}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode || ""}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="e.g. 700019"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-slate-600 font-semibold mb-1">Full Office / Address</label>
                    <input
                      type="text"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street, Landmark, Commercial Complex"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Franchise Model & Commercial Terms */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-3">
                <h4 className="font-bold text-amber-950 uppercase tracking-wider text-[10px]">
                  Commercial Terms &amp; Capacity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Franchise Model *</label>
                    <select
                      value={formData.franchiseType || "District Fleet Partner"}
                      onChange={(e) => setFormData({ ...formData, franchiseType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      {FRANCHISE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Proposed Investment *</label>
                    <select
                      value={formData.investmentBudget || "₹10 - ₹25 Lakhs"}
                      onChange={(e) => setFormData({ ...formData, investmentBudget: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      {INVESTMENT_RANGES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Current Fleet Owned</label>
                    <select
                      value={formData.currentFleetSize || "1 - 5 Vehicles"}
                      onChange={(e) => setFormData({ ...formData, currentFleetSize: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      {FLEET_SIZES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Commercial Office Space</label>
                    <select
                      value={formData.hasCommercialOffice || "Planned"}
                      onChange={(e) => setFormData({ ...formData, hasCommercialOffice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="Yes">Yes (Available Ready)</option>
                      <option value="Planned">Planned / In Discussion</option>
                      <option value="No">No (Need Assistance)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Preferred Timeline</label>
                    <input
                      type="text"
                      value={formData.preferredLaunchTimeline || "Within 1 Month"}
                      onChange={(e) => setFormData({ ...formData, preferredLaunchTimeline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Assigned Executive</label>
                    <input
                      type="text"
                      value={formData.assignedTo || "Franchise Desk"}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Priority Management */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Administrative Workflow &amp; Priority
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Application Status</label>
                    <select
                      value={formData.status || "NEW"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label} ({s.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Priority Level</label>
                    <select
                      value={formData.priority || "MEDIUM"}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="HIGH">High Priority (Urgent Hot Lead)</option>
                      <option value="MEDIUM">Medium Priority (Standard Review)</option>
                      <option value="LOW">Low Priority (Future Expansion)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">
                      Business Background &amp; Transport Experience
                    </label>
                    <textarea
                      rows={2}
                      value={formData.businessExperience || ""}
                      onChange={(e) => setFormData({ ...formData, businessExperience: e.target.value })}
                      placeholder="e.g. 10 years experience in transport contracting, owns 4 commercial vehicles."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">
                      Internal Admin Follow-up Notes
                    </label>
                    <textarea
                      rows={2}
                      value={formData.adminNotes || ""}
                      onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                      placeholder="Add conversation summary, background check notes, next meeting date..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingLead(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCreatingNew ? "Create Franchise Lead" : "Save All Changes"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

