/**
 * BroomBoom Admin Panel Configuration
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://durgapuja.broomboomcabs.com";

export const APP_CONFIG = {
  name: "BroomBoom Cabs",
  portalName: "Admin Console",
  version: "1.0.0",
  tagline: "Kolkata Puja & Outstation Chauffeur Rentals",
  supportContact: "+91 98300 00000",
  endpoints: {
    health: `${API_BASE_URL}/api/health`,
    bookings: `${API_BASE_URL}/api/bookings`,
    fleet: `${API_BASE_URL}/api/fleet`,
    packages: `${API_BASE_URL}/api/packages`,
    leads: `${API_BASE_URL}/api/leads`,
  },
};

export const BOOKING_STATUSES = [
  { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "COMPLETED", label: "Completed", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-200" },
] as const;

export const FLEET_CATEGORIES = [
  { id: "all", label: "All Vehicles" },
  { id: "sedan", label: "Sedans (Dzire, Etios)" },
  { id: "suv", label: "SUVs (Innova, Ertiga)" },
  { id: "traveller", label: "Tempo Travellers" },
] as const;

