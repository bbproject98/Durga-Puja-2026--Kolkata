import { API_BASE_URL } from "./config";

export type BookingStatus =
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export interface Booking {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleName: string;
  vehicleModels: string;
  vehicleSeats: number;
  packageTitle: string;
  travelDate: string;
  pickupTime: string;
  returnDate?: string | null;
  returnTime?: string | null;
  pickupAddress: string;
  pickupPincode?: string;
  pickupState?: string | null;
  totalTariff: number;
  advancePaid: number;
  balancePayable: number;
  fare?: number;
  advanceAmount?: number;
  gstAmount?: number;
  gatewayCharge?: number;
  finalPayable?: number;
  balanceDue?: number;
  status: BookingStatus;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | string;
  cashfreeOrderId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  models: string;
  seats: number;
  luggage: string;
  category: "sedan" | "suv" | "traveller";
  tag: string;
  badgeType: "gold" | "crimson";
  image: string;
  basePrice: number;
  baseHours: number;
  baseKm: number;
  nightPrice: number;
  perExtraHour: number;
  outstationPerKm: number;
  features: string[];
  inclusions?: string[];
  exclusions?: string[];
}

export interface Package {
  id: string;
  type: "rental" | "outstation";
  title: string;
  subtitle?: string | null;
  hoursKm?: string | null;
  rentalType?: string | null;
  distance?: string | null;
  estimatedTime?: string | null;
  priceStarting: number;
  badge: string;
  optimalTime?: string | null;
  highlights: string[];
  image: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  context?: string | null;
  action?: string | null;
  status: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

// -------------------------------------------------------------
// Authentication Helpers
// -------------------------------------------------------------
const AUTH_TOKEN_KEY = "broomboom_admin_token";
const AUTH_USER_KEY = "broomboom_admin_user";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string, user: AdminUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// Fallback Mock Data Store (persists in localStorage when offline)
// -------------------------------------------------------------
const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: "sedan_4",
    name: "Dzire / Etios Chauffeur Sedan",
    models: "Swift Dzire, Toyota Etios, Hyundai Aura",
    seats: 4,
    luggage: "2 Bags",
    category: "sedan",
    tag: "Couple & Small Family Special",
    badgeType: "gold",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    basePrice: 2499,
    baseHours: 8,
    baseKm: 80,
    nightPrice: 3199,
    perExtraHour: 250,
    outstationPerKm: 14,
    features: ["Air Conditioned", "Experienced Chauffeur", "Puja VIP Parking Assistance", "Clean Sanitized Interiors"],
  },
  {
    id: "suv_6",
    name: "Ertiga / Carens Executive SUV",
    models: "Maruti Ertiga, Kia Carens, Triber",
    seats: 6,
    luggage: "4 Bags",
    category: "suv",
    tag: "Family Pandals Favourite",
    badgeType: "gold",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
    basePrice: 3499,
    baseHours: 8,
    baseKm: 80,
    nightPrice: 4299,
    perExtraHour: 350,
    outstationPerKm: 18,
    features: ["6 Passenger Captain Seats", "Dual AC blowers", "Senior Citizen Friendly Access", "Music & Phone Chargers"],
  },
  {
    id: "suv_7",
    name: "Innova Crysta Royal Chauffeur",
    models: "Toyota Innova Crysta 2.4 VX",
    seats: 7,
    luggage: "5 Bags",
    category: "suv",
    tag: "VIP Luxury Parikrama",
    badgeType: "crimson",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
    basePrice: 4499,
    baseHours: 8,
    baseKm: 80,
    nightPrice: 5499,
    perExtraHour: 450,
    outstationPerKm: 22,
    features: ["Ultra Plush Recliners", "White Glove Driver", "Chilled Bottled Water", "Emergency Fast-Tag Lane"],
  },
  {
    id: "traveller_13",
    name: "Force Tempo Traveller (13 Seater)",
    models: "Force Urbania / Traveller Luxury 3350",
    seats: 13,
    luggage: "10 Bags",
    category: "traveller",
    tag: "Corporate & Big Gang Pandal Tour",
    badgeType: "crimson",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80",
    basePrice: 6999,
    baseHours: 8,
    baseKm: 80,
    nightPrice: 8499,
    perExtraHour: 650,
    outstationPerKm: 28,
    features: ["Pushback Luxury Seats", "Surround Audio System", "Overhead AC Vents", "Large Luggage Compartment"],
  },
];

const DEFAULT_PACKAGES: Package[] = [
  {
    id: "south-kolkata-mega",
    type: "rental",
    title: "South Kolkata Mega Theme Pandal Parikrama",
    subtitle: "Maddox Square, Suruchi Sangha, Ekdalia Evergreen, Singhi Park & Mudiali",
    hoursKm: "8 Hours / 80 KMs",
    rentalType: "Day or Night Safari",
    priceStarting: 2499,
    badge: "Top Puja Choice",
    optimalTime: "Best between 4:00 PM – 2:00 AM",
    highlights: ["Maddox Square Chhaddaveshi", "Ekdalia Evergreen Lighting", "Suruchi Sangha Traditional Pandal"],
    image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "north-kolkata-bonedi",
    type: "rental",
    title: "North Kolkata Heritage & Bonedi Bari Darshan",
    subtitle: "Sovabazar Rajbari, Bagbazar Sarbojanin, College Square & Ahiritola",
    hoursKm: "8 Hours / 80 KMs",
    rentalType: "Daytime Heritage Walk",
    priceStarting: 2699,
    badge: "Historic Special",
    optimalTime: "Best between 9:00 AM – 6:00 PM",
    highlights: ["Shovabazar Rajbari Vintage Courtyard", "College Square Water Reflection", "Bagbazar Classic Idol"],
    image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "night-owl-midnight-safari",
    type: "rental",
    title: "Night-Owl All-Night Pandal Safari (Kolkata Uncut)",
    subtitle: "Zero-traffic cruising through 15+ premier pandals across North & South",
    hoursKm: "10 Hours / 100 KMs",
    rentalType: "Midnight to Dawn",
    priceStarting: 3499,
    badge: "Most Popular",
    optimalTime: "10:00 PM to 8:00 AM (Skip Long Queues)",
    highlights: ["Beat Day Crowds & Sweltering Heat", "Scenic Princep Ghat Midnight Stop", "Chauffeur Stays at Pandal Gate"],
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "kolkata-digha-beach",
    type: "outstation",
    title: "Kolkata to Digha / Mandarmani Beach Break",
    subtitle: "Puja Long Weekend Chauffeur Getaway to Sea Beach",
    hoursKm: "Round Trip / Flexible Days",
    rentalType: "Outstation Intercity",
    distance: "185 KM",
    estimatedTime: "4.5 Hours",
    priceStarting: 4199,
    badge: "Puja Escape",
    optimalTime: "Early Morning Departure (6:00 AM)",
    highlights: ["Direct Resort Drop & Return", "Scenic Kolaghat Highway Breakfast Stop", "Toll & State Tax Assistance"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: "bk-101",
    bookingId: "BBC-PUJA-849201",
    customerName: "Subhashis Roy",
    customerPhone: "+91 98311 44520",
    customerEmail: "subhashis.roy@gmail.com",
    vehicleName: "Innova Crysta Royal Chauffeur",
    vehicleModels: "Toyota Innova Crysta 2.4 VX",
    vehicleSeats: 7,
    packageTitle: "South Kolkata Mega Theme Pandal Parikrama",
    travelDate: "2026-10-18",
    pickupTime: "16:00",
    returnDate: "2026-10-19",
    returnTime: "01:00",
    pickupAddress: "Flat 4B, Silver Oak Heights, Ballygunge Circular Rd, Kolkata",
    pickupPincode: "700019",  
    totalTariff: 4499,
    advancePaid: 1000,
    balancePayable: 3499,
    status: "CONFIRMED",
    createdAt: "2026-09-01T10:15:00.000Z",
  },
  {
    id: "bk-102",
    bookingId: "BBC-PUJA-849202",
    customerName: "Ananya Mukherjee",
    customerPhone: "+91 97482 11980",
    customerEmail: "ananya.m@outlook.com",
    vehicleName: "Dzire / Etios Chauffeur Sedan",
    vehicleModels: "Swift Dzire",
    vehicleSeats: 4,
    packageTitle: "Night-Owl All-Night Pandal Safari",
    travelDate: "2026-10-19",
    pickupTime: "22:30",
    returnDate: "2026-10-20",
    returnTime: "06:30",
    pickupAddress: "Tower 2, Urbana NRI Complex, Anandapur, Kolkata",
    pickupPincode: "700019",   // example
    totalTariff: 3199,
    advancePaid: 3199,
    balancePayable: 0,
    status: "CONFIRMED",
    createdAt: "2026-09-02T14:20:00.000Z",
  },
  {
    id: "bk-103",
    bookingId: "BBC-PUJA-849203",
    customerName: "Dr. Debanjan Sen",
    customerPhone: "+91 94330 88219",
    customerEmail: "dr.dsen@medica.in",
    vehicleName: "Ertiga / Carens Executive SUV",
    vehicleModels: "Maruti Ertiga ZXi",
    vehicleSeats: 6,
    packageTitle: "North Kolkata Heritage & Bonedi Bari Darshan",
    travelDate: "2026-10-20",
    pickupTime: "09:00",
    returnDate: "2026-10-20",
    returnTime: "17:30",
    pickupAddress: "12/1A, Lake View Road, Southern Avenue, Kolkata",
    pickupPincode: "700019",   // example
    totalTariff: 3499,
    advancePaid: 1500,
    balancePayable: 1999,
    status: "IN_PROGRESS",
    createdAt: "2026-09-02T16:45:00.000Z",
  },
  {
    id: "bk-104",
    bookingId: "BBC-PUJA-849204",
    customerName: "Rakesh Agarwal",
    customerPhone: "+91 98305 66782",
    customerEmail: "rakesh.agarwal@tcs.com",
    vehicleName: "Force Tempo Traveller (13 Seater)",
    vehicleModels: "Force Urbania 3350 Luxury",
    vehicleSeats: 13,
    packageTitle: "South Kolkata Mega Theme Pandal Parikrama",
    travelDate: "2026-10-21",
    pickupTime: "17:00",
    returnDate: "2026-10-22",
    returnTime: "02:00",
    pickupAddress: "Rosedale Garden, Action Area III, New Town, Kolkata",
    pickupPincode: "700019",   // example
    totalTariff: 6999,
    advancePaid: 2500,
    balancePayable: 4499,
    status: "CONFIRMED",
    createdAt: "2026-09-03T09:00:00.000Z",
  },
  {
    id: "bk-105",
    bookingId: "BBC-PUJA-849205",
    customerName: "Priyanka Chatterjee",
    customerPhone: "+91 98366 12390",
    customerEmail: "priyanka.c@wipro.com",
    vehicleName: "Innova Crysta Royal Chauffeur",
    vehicleModels: "Toyota Innova Crysta",
    vehicleSeats: 7,
    packageTitle: "Kolkata to Digha Beach Break",
    travelDate: "2026-10-22",
    pickupTime: "06:00",
    returnDate: "2026-10-24",
    returnTime: "20:00",
    pickupAddress: "Block CD, Sector 1, Salt Lake, Kolkata",
    pickupPincode: "700019",   // example
    totalTariff: 8999,
    advancePaid: 8999,
    balancePayable: 0,
    status: "COMPLETED",
    createdAt: "2026-08-28T11:00:00.000Z",
  },
];

// Helper to get / set local storage mock persistence
function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// -------------------------------------------------------------
// Authorized Fetch Wrapper
// -------------------------------------------------------------
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// -------------------------------------------------------------
// API Functions: Bookings (Sorted ASC by travelDate & pickupTime)
// -------------------------------------------------------------
export async function fetchBookings(): Promise<Booking[]> {
  try {
    const res = await authFetch(`${API_BASE_URL}/api/bookings`, { method: "GET" });
    if (res.ok) {
      const json = await res.json();
      const list: Booking[] = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.bookings)
        ? json.bookings
        : [];
      // Sort ASC (earliest travelDate and pickupTime first)
      return sortBookingsAscending(list);
    }
  } catch {
    // Backend offline; fallback to local storage
  }

  const local = getLocalItem<Booking[]>("broomboom_bookings", DEFAULT_BOOKINGS);
  return sortBookingsAscending(Array.isArray(local) ? local : DEFAULT_BOOKINGS);
}

export function sortBookingsAscending(bookings: Booking[]): Booking[] {
  if (!Array.isArray(bookings)) return [];
  return [...bookings].sort((a, b) => {
    const dateA = new Date(`${a.travelDate}T${a.pickupTime || "00:00"}`).getTime();
    const dateB = new Date(`${b.travelDate}T${b.pickupTime || "00:00"}`).getTime();
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateA - dateB;
  });
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  try {
    const res = await authFetch(`${API_BASE_URL}/api/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    // local fallback
  }

  const list = getLocalItem<Booking[]>("broomboom_bookings", DEFAULT_BOOKINGS);
  const updated = list.map((b) => (b.id === id || b.bookingId === id ? { ...b, status } : b));
  setLocalItem("broomboom_bookings", updated);
  const found = updated.find((b) => b.id === id || b.bookingId === id);
  if (!found) throw new Error("Booking not found");
  return found;
}

export async function createBooking(data: Partial<Booking>): Promise<Booking> {
  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    bookingId: `BBC-PUJA-${Math.floor(100000 + Math.random() * 900000)}`,
    customerName: data.customerName || "Walk-in Guest",
    customerPhone: data.customerPhone || "+91 90000 00000",
    customerEmail: data.customerEmail || "guest@broomboom.com",
    vehicleName: data.vehicleName || "Dzire / Etios Chauffeur Sedan",
    vehicleModels: data.vehicleModels || "Swift Dzire",
    vehicleSeats: data.vehicleSeats || 4,
    packageTitle: data.packageTitle || "South Kolkata Mega Theme Pandal Parikrama",
    travelDate: data.travelDate || new Date().toISOString().split("T")[0],
    pickupTime: data.pickupTime || "12:00",
    returnDate: data.returnDate || null,
    returnTime: data.returnTime || null,
    pickupAddress: data.pickupAddress || "Kolkata, West Bengal",
    totalTariff: Number(data.totalTariff) || 2999,
    advancePaid: Number(data.advancePaid) || 1000,
    balancePayable: Math.max(0, (Number(data.totalTariff) || 2999) - (Number(data.advancePaid) || 1000)),
    status: data.status || "CONFIRMED",
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await authFetch(`${API_BASE_URL}/api/bookings`, {
      method: "POST",
      body: JSON.stringify(newBooking),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    // local fallback
  }

  const list = getLocalItem<Booking[]>("broomboom_bookings", DEFAULT_BOOKINGS);
  const updated = [newBooking, ...list];
  setLocalItem("broomboom_bookings", updated);
  return newBooking;
}

// -------------------------------------------------------------
// API Functions: Vehicles (Fleet)
// -------------------------------------------------------------
export async function fetchVehicles(category?: string): Promise<Vehicle[]> {
  try {
    const query = category && category !== "all" ? `?category=${category}` : "";
    const res = await authFetch(`${API_BASE_URL}/api/fleet${query}`, { method: "GET" });
    if (res.ok) {
      const json = await res.json();
      const raw = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
      if (raw.length > 0) {
        return raw.map((v: any) => ({
          ...v,
          features: Array.isArray(v.features) ? v.features : JSON.parse(v.features || "[]"),
        }));
      }
    }
  } catch {
    // local fallback
  }

  const list = getLocalItem<Vehicle[]>("broomboom_vehicles", DEFAULT_VEHICLES);
  if (category && category !== "all") {
    return list.filter((v) => v.category === category);
  }
  return list;
}

export async function saveVehicle(vehicle: Vehicle): Promise<Vehicle> {
  try {
    const res = await authFetch(`${API_BASE_URL}/api/fleet`, {
      method: "POST",
      body: JSON.stringify(vehicle),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    // local fallback
  }

  const list = getLocalItem<Vehicle[]>("broomboom_vehicles", DEFAULT_VEHICLES);
  const idx = list.findIndex((v) => v.id === vehicle.id);
  let updated: Vehicle[];
  if (idx >= 0) {
    updated = [...list];
    updated[idx] = vehicle;
  } else {
    updated = [vehicle, ...list];
  }
  setLocalItem("broomboom_vehicles", updated);
  return vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  try {
    await authFetch(`${API_BASE_URL}/api/fleet/${id}`, { method: "DELETE" });
  } catch {
    // local fallback
  }
  const list = getLocalItem<Vehicle[]>("broomboom_vehicles", DEFAULT_VEHICLES);
  setLocalItem(
    "broomboom_vehicles",
    list.filter((v) => v.id !== id)
  );
}

// -------------------------------------------------------------
// API Functions: Packages
// -------------------------------------------------------------
export async function fetchPackages(type?: string): Promise<Package[]> {
  try {
    const query = type && type !== "all" ? `?type=${type}` : "";
    const res = await authFetch(`${API_BASE_URL}/api/packages${query}`, { method: "GET" });
    if (res.ok) {
      const json = await res.json();
      const raw = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
      if (raw.length > 0) {
        return raw.map((p: any) => ({
          ...p,
          highlights: Array.isArray(p.highlights) ? p.highlights : JSON.parse(p.highlights || "[]"),
        }));
      }
    }
  } catch {
    // local fallback
  }

  const list = getLocalItem<Package[]>("broomboom_packages", DEFAULT_PACKAGES);
  if (type && type !== "all") {
    return list.filter((p) => p.type === type);
  }
  return list;
}

export async function savePackage(pkg: Package): Promise<Package> {
  try {
    const res = await authFetch(`${API_BASE_URL}/api/packages`, {
      method: "POST",
      body: JSON.stringify(pkg),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    // local fallback
  }

  const list = getLocalItem<Package[]>("broomboom_packages", DEFAULT_PACKAGES);
  const idx = list.findIndex((p) => p.id === pkg.id);
  let updated: Package[];
  if (idx >= 0) {
    updated = [...list];
    updated[idx] = pkg;
  } else {
    updated = [pkg, ...list];
  }
  setLocalItem("broomboom_packages", updated);
  return pkg;
}

export async function deletePackage(id: string): Promise<void> {
  try {
    await authFetch(`${API_BASE_URL}/api/packages/${id}`, { method: "DELETE" });
  } catch {
    // local fallback
  }
  const list = getLocalItem<Package[]>("broomboom_packages", DEFAULT_PACKAGES);
  setLocalItem(
    "broomboom_packages",
    list.filter((p) => p.id !== id)
  );
}

const DEFAULT_LEADS: Lead[] = [
  {
    id: "ld-1",
    name: "Soumyadeep Ghosh",
    phone: "+91 98301 84729",
    email: "soumyadeep.g@gmail.com",
    context: "User Login via OTP (Kolkata)",
    action: "User Login",
    status: "ACTIVE",
    createdAt: "2026-09-03T16:45:00.000Z",
  },
  {
    id: "ld-2",
    name: "Rwitobroto Bhattacharya",
    phone: "+91 97482 66310",
    email: "rwito.bhatt@outlook.com",
    context: "Night-Owl All-Night Pandal Safari",
    action: "Book Package",
    status: "NEW",
    createdAt: "2026-09-03T15:20:00.000Z",
  },
  {
    id: "ld-3",
    name: "Debashis Banerjee",
    phone: "+91 98300 23145",
    email: "debashis.b@gmail.com",
    context: "Innova Crysta Royal Chauffeur inquiry",
    action: "Explore Fleet",
    status: "CONTACTED",
    createdAt: "2026-09-03T11:00:00.000Z",
  },
  {
    id: "ld-4",
    name: "Kakoli Sengupta",
    phone: "+91 97488 56321",
    email: "kakoli.sen@yahoo.com",
    context: "User Login via Google SSO",
    action: "User Login",
    status: "ACTIVE",
    createdAt: "2026-09-02T16:30:00.000Z",
  },
  {
    id: "ld-5",
    name: "Anirban Chatterjee",
    phone: "+91 98314 90218",
    email: "anirban.chatt@tcs.com",
    context: "South Kolkata Mega Theme Pandal",
    action: "Early Bird Lead",
    status: "CONVERTED",
    createdAt: "2026-09-02T10:15:00.000Z",
  },
  {
    id: "ld-6",
    name: "Sreemoyee Dutta",
    phone: "+91 94331 45098",
    email: "sreemoyee.d@cognizant.com",
    context: "Kolkata to Digha Beach Getaway",
    action: "Explore Outstation",
    status: "NEW",
    createdAt: "2026-09-01T18:05:00.000Z",
  },
];

// -------------------------------------------------------------
// API Functions: Leads
// -------------------------------------------------------------
export async function fetchLeads(): Promise<Lead[]> {
  try {
    const res = await authFetch(`${API_BASE_URL}/api/leads`, { method: "GET" });
    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.leads)
        ? json.leads
        : [];
      if (list.length > 0) return list;
    }
  } catch {
    // local fallback
  }

  const local = getLocalItem<Lead[]>("broomboom_leads", DEFAULT_LEADS);
  return Array.isArray(local) ? local : DEFAULT_LEADS;
}

export async function updateLeadStatus(id: string, status: string): Promise<Lead> {
  try {
    const res = await authFetch(`${API_BASE_URL}/api/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    // local fallback
  }

  const list = getLocalItem<Lead[]>("broomboom_leads", DEFAULT_LEADS);
  const updated = list.map((l) => (l.id === id ? { ...l, status } : l));
  setLocalItem("broomboom_leads", updated);
  const found = updated.find((l) => l.id === id);
  if (!found) throw new Error("Lead not found");
  return found;
}


// lib/api.ts — add this after createBooking

export async function updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
  try {
    const res = await authFetch(`${API_BASE_URL}/api/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    // fallback to localStorage
  }

  const list = getLocalItem<Booking[]>("broomboom_bookings", DEFAULT_BOOKINGS);
  const idx = list.findIndex((b) => b.id === id || b.bookingId === id);
  if (idx === -1) throw new Error("Booking not found");
  const updatedBooking = {
    ...list[idx],
    ...data,
    balancePayable: Math.max(0, (data.totalTariff ?? list[idx].totalTariff) - (data.advancePaid ?? list[idx].advancePaid)),
  };
  const updatedList = [...list];
  updatedList[idx] = updatedBooking;
  setLocalItem("broomboom_bookings", updatedList);
  return updatedBooking;
}