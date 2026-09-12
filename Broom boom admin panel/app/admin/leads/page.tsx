"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchLeads, updateLeadStatus, Lead, formatLeadContext, formatLeadAction } from "../lib/api";
import {
  Search,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Activity,
  ChevronDown,
  X,
  Filter,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import Pagination from "../components/Pagination";


const STATUS_OPTIONS = ["NEW", "ACTIVE", "CONTACTED", "CONVERTED", "LOST"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      NEW: "bg-blue-100 text-blue-800 border-blue-200",
      ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
      CONTACTED: "bg-amber-100 text-amber-800 border-amber-200",
      CONVERTED: "bg-purple-100 text-purple-800 border-purple-200",
      LOST: "bg-rose-100 text-rose-800 border-rose-200",
    };
    return styles[status as keyof typeof styles] || "bg-slate-100 text-slate-800";
  };

  const getActionIcon = (action: string) => {
    if (action === "User Login") return <CheckCircle2 className="w-4 h-4" />;
    if (action === "Book Package") return <MessageCircle className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase().trim();
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.action && lead.action.toLowerCase().includes(q)) ||
        (lead.context && lead.context.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  // Pagination state & calculation
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);


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

  if (loading) return <div className="p-8 text-center text-slate-500">Loading leads...</div>;

  return (
    <div className="space-y-6" data-testid="leads-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Leads</h1>
          <p className="text-sm text-slate-500">Manage all user inquiries and logins.</p>
        </div>
        <button
          onClick={loadLeads}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase text-center w-12 font-mono">#</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Lead</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Date &amp; Time</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No leads match.</td>
                </tr>
              ) : (
                paginatedLeads.map((lead, index) => (
                  <React.Fragment key={lead.id}>
                    <tr className="hover:bg-amber-50/10 transition-colors">
                      {/* Row Count / Serial Number (1 2 3 4...) */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center mx-auto text-[11px] border border-slate-200">
                          {(currentPage - 1) * pageSize + index + 1}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-navy-950 font-bold flex items-center justify-center text-xs">
                            {lead.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{lead.name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <a href={`mailto:${lead.email}`} className="text-slate-600 hover:text-amber-600 inline-flex items-center gap-1 text-xs">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}
                          </a>
                          <a href={`tel:${lead.phone}`} className="text-slate-600 hover:text-amber-600 inline-flex items-center gap-1 text-xs font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {getActionIcon(lead.action || "User Login")}
                          {formatLeadAction(lead.action)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs">{formatDateTime(lead.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${getStatusBadge(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
                          className="text-amber-600 hover:text-amber-700 text-xs font-medium inline-flex items-center gap-1"
                        >
                          {expandedLeadId === lead.id ? "Close" : "Update"}
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedLeadId === lead.id ? "rotate-180" : ""}`} />
                        </button>
                      </td>
                    </tr>
                    {expandedLeadId === lead.id && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 bg-slate-50/60 border-t border-slate-100">
                          {lead.context && (
                            <div className="mb-3 text-xs text-slate-600 flex items-center gap-2">
                              <span className="font-semibold text-slate-700">Inquiry / Source:</span>
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                                {formatLeadContext(lead.context)}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <span className="text-xs font-medium text-slate-600">Change Status:</span>
                            <div className="flex flex-wrap gap-2">
                              {STATUS_OPTIONS.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleStatusUpdate(lead.id, s)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                    lead.status === s
                                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                                      : "bg-white text-slate-700 border-slate-300 hover:border-amber-400 hover:bg-amber-50"
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                            <button onClick={() => setExpandedLeadId(null)} className="ml-auto text-slate-400 hover:text-slate-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
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

    </div>
  );
}