"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  fetchVehicles,
  saveVehicle,
  deleteVehicle,
  Vehicle,
} from "../lib/api";
import {
  CarFront,
  Users,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Search,
  Check,
  X,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import Pagination from "../components/Pagination";


export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Vehicle>({
    id: "",
    name: "",
    models: "",
    seats: 4,
    luggage: "2 Bags",
    category: "sedan",
    tag: "Puja Special",
    badgeType: "gold",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    basePrice: 2499,
    baseHours: 8,
    baseKm: 80,
    nightPrice: 3199,
    perExtraHour: 250,
    outstationPerKm: 14,
    features: ["Air Conditioned", "Sanitized", "Puja Pass"],
  });

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await fetchVehicles(categoryFilter);
      setVehicles(data);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [categoryFilter]);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      id: `vehicle_${Date.now()}`,
      name: "",
      models: "",
      seats: 4,
      luggage: "2 Bags",
      category: "sedan",
      tag: "Puja Parikrama",
      badgeType: "gold",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
      basePrice: 2999,
      baseHours: 8,
      baseKm: 80,
      nightPrice: 3899,
      perExtraHour: 300,
      outstationPerKm: 16,
      features: ["Air Conditioned", "Chauffeur Driven"],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({ ...v });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from active fleet?`)) {
      await deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await saveVehicle(formData);
      if (editingVehicle) {
        setVehicles((prev) => prev.map((v) => (v.id === saved.id ? saved : v)));
      } else {
        setVehicles((prev) => [saved, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      alert("Failed to save vehicle");
    }
  };

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return vehicles.filter((v) => {
      return (
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.models.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    });
  }, [vehicles, searchQuery]);

  // Pagination state & calculation
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredVehicles.length / pageSize) || 1;
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, currentPage, pageSize]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Fleet &amp; Vehicle Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure car models, seating capacity, hourly rates, and outstation pricing.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadVehicles}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search fleet by model, name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: "All Fleet", value: "all" },
            { label: "Sedans", value: "sedan" },
            { label: "SUVs", value: "suv" },
            { label: "Tempo Travellers", value: "traveller" },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat.value
                  ? "bg-navy-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
          <p className="font-semibold text-slate-700">No vehicles found.</p>
          <p className="text-xs text-slate-400 mt-1">Try changing your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedVehicles.map((v, index) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:border-amber-400/80 transition-all group"
            >

            {/* Vehicle Image Header */}
            <div className="relative h-44 bg-slate-100 overflow-hidden">
              <img
                src={v.image}
                alt={v.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                {/* Count Badge (1 2 3 4...) */}
                <span className="w-6 h-6 rounded-full bg-slate-900/90 text-amber-400 border border-amber-400/40 text-[11px] font-mono font-bold flex items-center justify-center backdrop-blur-xs shadow-sm">
                  {(currentPage - 1) * pageSize + index + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-white/90 text-slate-900 backdrop-blur-xs">
                  {v.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase ${
                    v.badgeType === "crimson" ? "bg-rose-600" : "bg-amber-600"
                  }`}
                >
                  {v.tag}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-bold text-base leading-tight drop-shadow-sm">
                  {v.name}
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5 drop-shadow-sm">
                  {v.models}
                </p>
              </div>
            </div>

            {/* Specs & Pricing */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              {/* Capacity Chips */}
              <div className="flex items-center gap-3 text-xs text-slate-600 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>{v.seats} Seats</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  <span>{v.luggage}</span>
                </div>
              </div>

              {/* Pricing Matrix */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Base Package
                  </span>
                  <strong className="text-slate-900 font-bold text-sm">
                    ₹{v.basePrice}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">
                    {v.baseHours}h / {v.baseKm}km
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Night Safari
                  </span>
                  <strong className="text-amber-700 font-bold text-sm">
                    ₹{v.nightPrice}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">
                    All-Night Rate
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 text-[10px]">Extra Hour:</span>{" "}
                  <strong className="text-slate-800">₹{v.perExtraHour}</strong>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 text-[10px]">Outstation:</span>{" "}
                  <strong className="text-slate-800">₹{v.outstationPerKm}/km</strong>
                </div>
              </div>

              {/* Features List */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Highlights
                </span>
                <div className="flex flex-wrap gap-1">
                  {v.features?.map((feat, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(v)}
                  className="p-2 rounded-xl text-slate-600 hover:text-navy-950 hover:bg-slate-100 text-xs font-medium inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(v.id, v.name)}
                  className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
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
          totalItems={filteredVehicles.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[3, 6, 9, 15, 30]}
        />
      </div>


      {/* Add / Edit Vehicle Modal */}
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
              {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Configure fleet specifications and tariff cards.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vehicle Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Innova Crysta Royal Chauffeur"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Car Models *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swift Dzire, Toyota Etios"
                    value={formData.models}
                    onChange={(e) =>
                      setFormData({ ...formData, models: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="traveller">Tempo Traveller</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.seats}
                    onChange={(e) =>
                      setFormData({ ...formData, seats: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Luggage Capacity
                  </label>
                  <input
                    type="text"
                    value={formData.luggage}
                    onChange={(e) =>
                      setFormData({ ...formData, luggage: e.target.value })
                    }
                    placeholder="e.g. 4 Bags"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, basePrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Night Safari Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.nightPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, nightPrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Extra Hour Rate (₹/hr)
                  </label>
                  <input
                    type="number"
                    value={formData.perExtraHour}
                    onChange={(e) =>
                      setFormData({ ...formData, perExtraHour: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Outstation Rate (₹/km)
                  </label>
                  <input
                    type="number"
                    value={formData.outstationPerKm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        outstationPerKm: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  />
                </div>
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
                  {editingVehicle ? "Save Changes" : "Create Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

