"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  fetchPackages,
  savePackage,
  deletePackage,
  Package,
} from "../lib/api";
import {
  Sparkles,
  MapPin,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Compass,
  RefreshCw,
  IndianRupee,
} from "lucide-react";
import Pagination from "../components/Pagination";


export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Package>({
    id: "",
    type: "rental",
    title: "",
    subtitle: "",
    hoursKm: "8 Hours / 80 KMs",
    rentalType: "Day or Night Safari",
    distance: "",
    estimatedTime: "",
    priceStarting: 2499,
    badge: "Puja Special",
    optimalTime: "4:00 PM – 2:00 AM",
    highlights: ["VIP Pandal Access", "Chauffeur on Standby"],
    image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=600&q=80",
  });

  const [highlightsInput, setHighlightsInput] = useState("");

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await fetchPackages(typeFilter);
      setPackages(data);
    } catch (err) {
      console.error("Failed to load packages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [typeFilter]);

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormData({
      id: `pkg_${Date.now()}`,
      type: "rental",
      title: "",
      subtitle: "",
      hoursKm: "8 Hours / 80 KMs",
      rentalType: "Day or Night Safari",
      distance: "",
      estimatedTime: "",
      priceStarting: 2799,
      badge: "Puja Hit",
      optimalTime: "4:00 PM – 1:00 AM",
      highlights: ["Maddox Square", "Ekdalia Evergreen", "Mudiali Club"],
      image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=600&q=80",
    });
    setHighlightsInput("Maddox Square, Ekdalia Evergreen, Mudiali Club");
    setShowModal(true);
  };

  const handleOpenEdit = (p: Package) => {
    setEditingPackage(p);
    setFormData({ ...p });
    setHighlightsInput(p.highlights ? p.highlights.join(", ") : "");
    setShowModal(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete package "${title}"?`)) {
      await deletePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const highlights = highlightsInput
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);

    const payload: Package = {
      ...formData,
      highlights,
    };

    try {
      const saved = await savePackage(payload);
      if (editingPackage) {
        setPackages((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      } else {
        setPackages((prev) => [saved, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      alert("Failed to save package");
    }
  };

  const filteredPackages = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return packages.filter((p) => {
      return (
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q))
      );
    });
  }, [packages, searchQuery]);

  // Pagination state & calculation
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter]);

  const totalPages = Math.ceil(filteredPackages.length / pageSize) || 1;
  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPackages.slice(start, start + pageSize);
  }, [filteredPackages, currentPage, pageSize]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Rental &amp; Outstation Packages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curate Durga Puja pandal parikrama itineraries and intercity getaway packages.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadPackages}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Package</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search packages by pandal, destination or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: "All Packages", value: "all" },
            { label: "Kolkata Puja Rentals", value: "rental" },
            { label: "Outstation Trips", value: "outstation" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                typeFilter === tab.value
                  ? "bg-navy-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
          <p className="font-semibold text-slate-700">No packages found.</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or package type filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedPackages.map((pkg, index) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:border-amber-400/80 transition-all group"
            >

            {/* Package Hero Image */}
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img
                src={pkg.image}
                alt={pkg.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/20" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                {/* Count Badge (1 2 3 4...) */}
                <span className="w-6 h-6 rounded-full bg-slate-900/90 text-amber-400 border border-amber-400/40 text-[11px] font-mono font-bold flex items-center justify-center backdrop-blur-xs shadow-sm">
                  {(currentPage - 1) * pageSize + index + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-white text-slate-900">
                  {pkg.type}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-navy-950 uppercase shadow-sm">
                  {pkg.badge}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-bold text-lg leading-tight drop-shadow-sm">
                  {pkg.title}
                </h3>
                {pkg.subtitle && (
                  <p className="text-xs text-slate-200 mt-1 line-clamp-1">
                    {pkg.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Package Details */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{pkg.hoursKm || pkg.distance || "Flexible Tour"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>{pkg.rentalType || pkg.estimatedTime || "Puja Safari"}</span>
                </div>
              </div>

              {pkg.optimalTime && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-medium">{pkg.optimalTime}</span>
                </div>
              )}

              {/* Highlights */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Key Itinerary Stops
                </span>
                <div className="space-y-1.5">
                  {pkg.highlights?.map((hl, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">
                    Starting From
                  </span>
                  <p className="text-xl font-black text-slate-900">
                    ₹{pkg.priceStarting.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="p-2 rounded-xl text-slate-600 hover:text-navy-950 hover:bg-slate-100 text-xs font-medium inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id, pkg.title)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}


      {/* Pagination Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPackages.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[2, 4, 8, 12, 20]}
        />
      </div>


      {/* Add / Edit Package Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {editingPackage ? "Edit Package" : "Create New Package"}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Configure parikrama itinerary, badge tags and pricing.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Package Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Kolkata Mega Theme Parikrama"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subtitle / Pandal Coverage
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maddox Square, Suruchi Sangha, Ekdalia"
                  value={formData.subtitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Package Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  >
                    <option value="rental">Kolkata Rental Parikrama</option>
                    <option value="outstation">Outstation Intercity</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Most Popular, Night Safari"
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duration / KMs
                  </label>
                  <input
                    type="text"
                    placeholder="8 Hours / 80 KMs"
                    value={formData.hoursKm || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, hoursKm: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Starting Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.priceStarting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceStarting: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Optimal Timing Recommendation
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4:00 PM to 2:00 AM"
                  value={formData.optimalTime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, optimalTime: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Highlights / Pandal Stops (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  placeholder="Maddox Square, Ekdalia Evergreen, Mudiali Club"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold shadow-md"
                >
                  {editingPackage ? "Save Package" : "Publish Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

