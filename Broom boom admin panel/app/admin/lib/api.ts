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

export function formatLeadContext(context?: string | null): string {
  if (!context) return "";
  let clean = context.trim();

  // Remove trailing internal IDs like "(pkg_10hr_100km)"
  clean = clean.replace(/\s*\([a-zA-Z0-9_-]+\)\s*$/, "");

  // Clean up duplicate prefixes like "Rental Package: 10 Hours / 100 KMs Rental Package"
  clean = clean.replace(/^Rental Package:\s*/i, "");

  // Map known button tracking strings to human-friendly labels
  if (/banner\s+primary\s+book\s+button/i.test(clean)) {
    return "Hero Banner Booking";
  }
  if (/sticky\s+mobile\s+bar\s+booking/i.test(clean)) {
    return "Mobile Quick Booking";
  }
  if (/main\s+navigation\s+booking/i.test(clean)) {
    return "Navbar Booking";
  }
  if (/mobile\s+nav\s+booking/i.test(clean)) {
    return "Mobile Menu Booking";
  }
  if (/about\s+section/i.test(clean)) {
    return "Large Fleet Request";
  }

  // Remove dangling "Button" word at end if any
  clean = clean.replace(/\s+button$/i, "");

  return clean;
}

export function formatLeadAction(action?: string | null): string {
  if (!action) return "User Login";
  const a = action.toLowerCase().trim();
  if (a === "book") return "Book Package";
  if (a === "explore") return "Explore Route";
  return action;
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
// Date Parser & Ascending Sorter for Durga Puja Bookings
// -------------------------------------------------------------
const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseBookingDateTime(b: Booking): number {
  if (!b) return NaN;
  const dateStr = (b.travelDate || "").trim();
  const timeStr = (b.pickupTime || "00:00").trim();

  // 1. If explicit ISO format YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    let hours = 9;
    let minutes = 0;
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      if (timeMatch[3]) {
        const ampm = timeMatch[3].toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
    }
    const d = new Date(year, month, day, hours, minutes);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // 2. Try regex extraction for text dates like "Oct 16 (Maha Saptami)"
  const monthMatch = dateStr.match(
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})/i
  );
  if (monthMatch) {
    const monthKey = monthMatch[1].toLowerCase();
    const monthIndex = MONTH_MAP[monthKey] ?? 9;
    const day = parseInt(monthMatch[2], 10);
    const year = 2026; // Always 2026 festival year!

    let hours = 9;
    let minutes = 0;
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      if (timeMatch[3]) {
        const ampm = timeMatch[3].toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
    }
    const d = new Date(year, monthIndex, day, hours, minutes);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // 3. Fallback to createdAt timestamp
  if (b.createdAt) {
    const c = new Date(b.createdAt).getTime();
    if (!isNaN(c)) return c;
  }

  return NaN;
}

export function sortBookingsNewestFirst(bookings: Booking[]): Booking[] {
  if (!Array.isArray(bookings)) return [];
  return [...bookings].sort((a, b) => {
    const cA = new Date(a.createdAt || 0).getTime();
    const cB = new Date(b.createdAt || 0).getTime();
    if (!isNaN(cA) && !isNaN(cB)) return cB - cA;
    return 0;
  });
}

export function sortBookingsAscending(bookings: Booking[]): Booking[] {
  if (!Array.isArray(bookings)) return [];
  return [...bookings].sort((a, b) => {
    const timeA = parseBookingDateTime(a);
    const timeB = parseBookingDateTime(b);
    if (isNaN(timeA) && isNaN(timeB)) {
      const cA = new Date(a.createdAt || 0).getTime();
      const cB = new Date(b.createdAt || 0).getTime();
      return cB - cA; // newest created first if travel date unknown
    }
    if (isNaN(timeA)) return 1;
    if (isNaN(timeB)) return -1;
    return timeA - timeB;
  });
}

export function mergeLeadsIntoBookings(bookings: Booking[], leads: Lead[]): Booking[] {
  if (!Array.isArray(leads) || leads.length === 0) return bookings;
  const merged = [...bookings];

  leads.forEach((lead) => {
    const isBookingLead =
      lead.action === "book" ||
      (lead.context && /package|pkg_|rental|outstation|tour|5hr|8hr|10hr|12hr/i.test(lead.context));

    if (!isBookingLead) return;

    const leadPhone = String(lead.phone || "").replace(/\D/g, "").slice(-10);
    const cleanContext = (lead.context || "Durga Puja Festive Tour")
      .replace(/^Rental Package:\s*/i, "")
      .replace(/\(pkg_[a-z0-9_]+\)/i, "")
      .trim();

    // Check if this lead is already represented in merged bookings
    const alreadyExists = merged.some((b) => {
      const bPhone = String(b.customerPhone || "").replace(/\D/g, "").slice(-10);
      if (bPhone && leadPhone && bPhone === leadPhone) {
        const bPkg = (b.packageTitle || "").toLowerCase();
        const lPkg = cleanContext.toLowerCase();
        if (bPkg.includes(lPkg.slice(0, 8)) || lPkg.includes(bPkg.slice(0, 8))) {
          const bTime = new Date(b.createdAt || 0).getTime();
          const lTime = new Date(lead.createdAt || 0).getTime();
          if (!isNaN(bTime) && !isNaN(lTime) && Math.abs(bTime - lTime) < 2 * 3600 * 1000) {
            return true;
          }
        }
      }
      return false;
    });

    if (!alreadyExists) {
      const lower = cleanContext.toLowerCase();
      let fare = 4551;
      if (lower.includes("5hr") || lower.includes("5 hour")) fare = 3299;
      else if (lower.includes("8hr") || lower.includes("8 hour")) fare = 4551;
      else if (lower.includes("10hr") || lower.includes("10 hour")) fare = 5499;
      else if (lower.includes("12hr") || lower.includes("12 hour")) fare = 6051;
      else if (lower.includes("midnight")) fare = 4999;
      else if (lower.includes("5day") || lower.includes("5-day")) fare = 24999;

      const syntheticBooking: Booking = {
        id: `lead-b-${lead.id}`,
        bookingId: `BBC-PUJA-${(lead.id || "").slice(-6).toUpperCase() || Math.floor(100000 + Math.random() * 900000)}`,
        customerName: lead.name || "Guest Customer",
        customerPhone: lead.phone,
        customerEmail: lead.email || "",
        vehicleName: "Sedan (4 Seater)",
        vehicleModels: "Swift Dzire / Toyota Etios / Hyundai Aura",
        vehicleSeats: 4,
        packageTitle: cleanContext || "Durga Puja Festive Tour",
        travelDate: "2026-10-16 (Maha Saptami)",
        pickupTime: "09:00 AM",
        returnDate: "Oct 16 (Same Night)",
        returnTime: "11:30 PM",
        pickupAddress: "Pickup coordination pending (Web Lead)",
        totalTariff: fare,
        advancePaid: 0,
        balancePayable: fare,
        status: lead.status === "CONVERTED" ? "CONFIRMED" : "PAYMENT_PENDING",
        paymentStatus: "PENDING",
        createdAt: lead.createdAt || new Date().toISOString(),
        updatedAt: lead.createdAt || new Date().toISOString(),
      };
      merged.push(syntheticBooking);
    }
  });

  return merged;
}

// -------------------------------------------------------------
// API Functions: Bookings (Sorted ASC by travelDate & pickupTime)
// -------------------------------------------------------------
export async function fetchBookings(): Promise<Booking[]> {
  let list: Booking[] = [];
  try {
    const res = await authFetch(`${API_BASE_URL}/api/bookings`, { method: "GET" });
    if (res.ok) {
      const json = await res.json();
      list = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.bookings)
        ? json.bookings
        : [];
    } else {
      console.warn(`[fetchBookings] API returned status ${res.status}`);
    }
  } catch (err) {
    console.warn("[fetchBookings] Network request failed, using cached data:", err);
  }

  if (list.length === 0) {
    const local = getLocalItem<Booking[]>("broomboom_bookings", DEFAULT_BOOKINGS);
    list = Array.isArray(local) ? local : DEFAULT_BOOKINGS;
  }

  // Also seamlessly merge any package booking leads
  try {
    const leads = await fetchLeads().catch(() => []);
    list = mergeLeadsIntoBookings(list, leads);
  } catch {
    // ignore
  }

  const sorted = sortBookingsNewestFirst(list);
  setLocalItem("broomboom_bookings", sorted);
  return sorted;
}

export async function fetchBookingById(id: string): Promise<Booking | null> {
  try {
    const res = await authFetch(`${API_BASE_URL}/api/bookings/${id}`, { method: "GET" });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (err) {
    console.warn(`[fetchBookingById] Failed for ${id}:`, err);
  }

  const all = await fetchBookings();
  return all.find((b) => b.id === id || b.bookingId === id) || null;
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
      const list: Lead[] = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.leads)
        ? json.leads
        : [];
      // Cache fresh live leads in localStorage to replace any old mock dummy data
      setLocalItem("broomboom_leads", list);
      return list;
    } else {
      console.warn(`[fetchLeads] API returned status ${res.status}`);
    }
  } catch (err) {
    console.warn("[fetchLeads] Network request failed, using cached data:", err);
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

// -------------------------------------------------------------
// Franchise Leads Types & API Functions
// -------------------------------------------------------------
export type FranchiseStatus =
  | "NEW"
  | "CONTACTED"
  | "UNDER_REVIEW"
  | "MEETING_SCHEDULED"
  | "AGREEMENT_SENT"
  | "ONBOARDED"
  | "REJECTED"
  | string;

export type FranchiseType =
  | "City Master Franchise"
  | "District Fleet Partner"
  | "Unit Franchise Hub"
  | "Single Car / Operator Partner"
  | "Corporate Partner"
  | string;

export type InvestmentBudget =
  | "₹2 - ₹5 Lakhs"
  | "₹5 - ₹10 Lakhs"
  | "₹10 - ₹25 Lakhs"
  | "₹25 - ₹50 Lakhs"
  | "₹50 Lakhs+"
  | string;

export interface FranchiseLead {
  id: string;
  leadId: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  pincode?: string;
  address?: string;
  franchiseType: FranchiseType;
  investmentBudget: InvestmentBudget;
  currentFleetSize?: string;
  hasCommercialOffice?: string;
  businessExperience?: string;
  preferredLaunchTimeline?: string;
  status: FranchiseStatus;
  priority?: "HIGH" | "MEDIUM" | "LOW" | string;
  assignedTo?: string;
  inquiryMessage?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export function normalizeFranchiseLead(raw: any): FranchiseLead {
  if (!raw || typeof raw !== "object") {
    return {
      id: `fr-${Date.now()}`,
      leadId: `BBC-FR-${Math.floor(100 + Math.random() * 900)}`,
      fullName: "New Applicant",
      phone: "",
      email: "",
      city: "Kolkata",
      state: "West Bengal",
      franchiseType: "District Fleet Partner",
      investmentBudget: "Flexible",
      status: "NEW",
      createdAt: new Date().toISOString(),
    };
  }

  const id = String(raw.id || raw._id || `fr-${Date.now()}`);
  const leadId = String(raw.leadId || raw.applicationId || raw.appId || `BBC-FR-${id.slice(-4)}`);
  const fullName = String(raw.fullName || raw.name || "Franchise Partner").trim();
  const phone = String(raw.phone || raw.mobile || raw.alternatePhone || "").trim();
  const email = String(raw.email || "").trim();
  const city = String(raw.city || "Kolkata").trim();
  const state = String(raw.state || "West Bengal").trim();
  const pincode = raw.pincode ? String(raw.pincode).trim() : undefined;
  const address = raw.address || raw.proposedAddress ? String(raw.address || raw.proposedAddress).trim() : undefined;

  let franchiseType = raw.franchiseType;
  if (!franchiseType) {
    if (raw.packageName) franchiseType = raw.packageName;
    else if (raw.preferredPackage) {
      const p = String(raw.preferredPackage).toLowerCase();
      if (p.includes("plat")) franchiseType = "Platinum Partner (Regional Master Franchise)";
      else if (p.includes("gold")) franchiseType = "Gold Partner (District Exclusive Hub)";
      else if (p.includes("silver")) franchiseType = "Silver Partner (Booking Kiosk)";
      else franchiseType = `${p.toUpperCase()} Partner`;
    } else {
      franchiseType = "District Fleet Partner";
    }
  }

  const investmentBudget = String(raw.investmentBudget || "Flexible").trim();
  const currentFleetSize = raw.currentFleetSize || (raw.hasExperience ? "Experienced Fleet Operator" : "None (New Entrepreneur)");
  const hasCommercialOffice = raw.hasCommercialOffice || raw.spaceStatus || (raw.carpetArea ? `${raw.carpetArea} Commercial Space` : "Planned");
  const businessExperience = raw.businessExperience || raw.hasExperience || raw.currentProfession || "";
  const preferredLaunchTimeline = raw.preferredLaunchTimeline || "Within 1 Month";

  const rawStatus = String(raw.status || "NEW").toUpperCase();
  const status = rawStatus === "APPROVED" ? "ONBOARDED" : rawStatus === "PENDING" ? "UNDER_REVIEW" : rawStatus;
  const priority = String(raw.priority || (status === "NEW" ? "HIGH" : "MEDIUM")).toUpperCase();
  const assignedTo = raw.assignedTo || "Franchise Desk";
  const inquiryMessage = raw.inquiryMessage || raw.message || "";
  const adminNotes = raw.adminNotes || "";
  const createdAt = raw.createdAt || new Date().toISOString();
  const updatedAt = raw.updatedAt || raw.createdAt || new Date().toISOString();

  return {
    id,
    leadId,
    fullName,
    phone,
    email,
    city,
    state,
    pincode,
    address,
    franchiseType,
    investmentBudget,
    currentFleetSize,
    hasCommercialOffice,
    businessExperience,
    preferredLaunchTimeline,
    status,
    priority,
    assignedTo,
    inquiryMessage,
    adminNotes,
    createdAt,
    updatedAt,
  };
}

export const DEFAULT_FRANCHISE_LEADS: FranchiseLead[] = [
  {
    id: "lead-1789105907910",
    leadId: "BB-2026-1011",
    fullName: "Partha Sarkar",
    phone: "08583992978",
    email: "sakarpartha222@gmail.com",
    city: "Singur",
    state: "West Bengal",
    pincode: "712124",
    address: "Singur Market, Hooghly District, WB",
    franchiseType: "Gold Partner (District Exclusive Hub)",
    investmentBudget: "₹5.0 Lakhs - ₹10.0 Lakhs",
    currentFleetSize: "3 - 5 Vehicles",
    hasCommercialOffice: "Owned commercial space ready (300 - 500 sq.ft)",
    businessExperience: "Currently in travel / taxi / logistics services.",
    preferredLaunchTimeline: "Immediate (Within 15 days)",
    status: "NEW",
    priority: "HIGH",
    assignedTo: "Franchise Desk",
    inquiryMessage: "Exclusive franchise application for Singur and Hooghly district travel network.",
    adminNotes: "Application submitted via online portal. Ready for territory manager call.",
    createdAt: "2026-09-11T05:51:47.910Z",
    updatedAt: "2026-09-11T05:51:47.910Z",
  },
  {
    id: "lead-1789072693291",
    leadId: "BB-2026-1006",
    fullName: "Amitabh Sen Sharma",
    phone: "+91 98300 12345",
    email: "amitabh.sen@kolkata-travels.com",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700029",
    address: "Southern Avenue Main Road, Near Lake Stadium, Kolkata",
    franchiseType: "Gold Partner (District Exclusive Hub)",
    investmentBudget: "₹5.0 Lakhs - ₹10.0 Lakhs",
    currentFleetSize: "6 - 15 Vehicles",
    hasCommercialOffice: "Owned commercial space ready (350 sq.ft)",
    businessExperience: "Fleet & Logistics Operator with 10+ commercial cabs.",
    preferredLaunchTimeline: "Within 1 Month",
    status: "UNDER_REVIEW",
    priority: "HIGH",
    assignedTo: "Territory Lead Kolkata",
    inquiryMessage: "Requesting district exclusive territory for South Kolkata.",
    adminNotes: "Discussion held on Tuesday. Territory agreement draft prepared.",
    createdAt: "2026-09-10T20:38:13.291Z",
    updatedAt: "2026-09-12T14:10:00.000Z",
  },
  {
    id: "lead-init-1",
    leadId: "BB-2026-1001",
    fullName: "Rohan Agrawal",
    phone: "+91 98310 54321",
    email: "rohan.agrawal@gmail.com",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700019",
    address: "Ballygunge Circular Road, South Kolkata",
    franchiseType: "Platinum Partner (Regional Master Franchise)",
    investmentBudget: "₹15L - ₹20L",
    currentFleetSize: "15+ Vehicles",
    hasCommercialOffice: "Commercial property owned (450 sq.ft)",
    businessExperience: "Logistics & Corporate Fleet Business Owner.",
    preferredLaunchTimeline: "Immediate (Within 15 days)",
    status: "ONBOARDED",
    priority: "HIGH",
    assignedTo: "Executive Director - Franchise",
    inquiryMessage: "Looking to take master franchise rights for South 24 Parganas district.",
    adminNotes: "Territory agreement signed. Chauffeur onboarding scheduled.",
    createdAt: "2026-03-01T08:30:00.000Z",
    updatedAt: "2026-09-10T16:00:00.000Z",
  },
  {
    id: "lead-1789105805954",
    leadId: "BB-2026-1010",
    fullName: "Priyanka Roy",
    phone: "+91 98300 12345",
    email: "priyanka.roy@example.com",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700032",
    address: "Jadavpur Central Road, Kolkata",
    franchiseType: "Gold Partner (District Exclusive Hub)",
    investmentBudget: "₹5.0 Lakhs - ₹10.0 Lakhs",
    currentFleetSize: "1 - 5 Vehicles",
    hasCommercialOffice: "Planned",
    businessExperience: "Travel consultant with 4 years corporate booking experience.",
    preferredLaunchTimeline: "Within 1 Month",
    status: "CONTACTED",
    priority: "MEDIUM",
    assignedTo: "Franchise Desk",
    inquiryMessage: "Require bank loan assistance for franchise setup.",
    adminNotes: "Connected with banking partner desk for loan pre-assessment.",
    createdAt: "2026-09-11T05:50:05.954Z",
    updatedAt: "2026-09-12T11:30:00.000Z",
  },
  {
    id: "lead-1789045261129",
    leadId: "BB-2026-1004",
    fullName: "Siddharth Mukherjee",
    phone: "+91 98319 87654",
    email: "siddharth.m@gmail.com",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700053",
    address: "New Alipore Block C, Kolkata",
    franchiseType: "Gold Partner (District Exclusive Hub)",
    investmentBudget: "₹5 Lakhs - ₹10 Lakhs",
    currentFleetSize: "1 - 5 Vehicles",
    hasCommercialOffice: "400 sq.ft prime commercial office ready",
    businessExperience: "Owns 4 commercial tourist vehicles.",
    preferredLaunchTimeline: "Within 1 Month",
    status: "MEETING_SCHEDULED",
    priority: "HIGH",
    assignedTo: "Kolkata Operations Desk",
    inquiryMessage: "Wants to operate South-West Kolkata and Diamond Harbour route franchise.",
    adminNotes: "Meeting scheduled for Friday at Kolkata regional office.",
    createdAt: "2026-09-10T13:01:01.129Z",
    updatedAt: "2026-09-13T10:00:00.000Z",
  },
  {
    id: "fr-102",
    leadId: "BBC-FR-102",
    fullName: "Rajesh Kumar Agarwal",
    phone: "+91 97480 88231",
    email: "rajesh.agarwal@siliguritravels.in",
    city: "Siliguri",
    state: "West Bengal",
    pincode: "734001",
    address: "Hill Cart Road, Near Sevoke More, Siliguri",
    franchiseType: "District Fleet Partner",
    investmentBudget: "₹10 - ₹25 Lakhs",
    currentFleetSize: "6 - 15 Vehicles",
    hasCommercialOffice: "Yes (Roadside commercial front)",
    businessExperience: "8 years operating Darjeeling & Sikkim tourist cabs.",
    preferredLaunchTimeline: "Within 1 Month",
    status: "UNDER_REVIEW",
    priority: "HIGH",
    assignedTo: "North Bengal Regional Head",
    inquiryMessage: "Seeking franchise for Siliguri corridor connecting Bagdogra airport, Darjeeling, and Dooars routes.",
    adminNotes: "Requested airport counter allocation details and rate card integration.",
    createdAt: "2026-09-09T14:15:00.000Z",
    updatedAt: "2026-09-11T16:00:00.000Z",
  },
  {
    id: "fr-103",
    leadId: "BBC-FR-103",
    fullName: "Tanmoy Mukherjee",
    phone: "+91 94340 71205",
    email: "tanmoy.m@rediffmail.com",
    city: "Durgapur",
    state: "West Bengal",
    pincode: "713216",
    address: "City Centre, Opp. Junction Mall, Durgapur",
    franchiseType: "Unit Franchise Hub",
    investmentBudget: "₹5 - ₹10 Lakhs",
    currentFleetSize: "1 - 5 Vehicles",
    hasCommercialOffice: "Planned",
    businessExperience: "Owns 3 commercial Innovas doing industrial contracts with SAIL & DSP.",
    preferredLaunchTimeline: "Within 1 Month",
    status: "CONTACTED",
    priority: "MEDIUM",
    assignedTo: "Franchise Desk",
    inquiryMessage: "Want to launch Broomboom Cabs franchise for Durgapur-Asansol industrial belt.",
    adminNotes: "Call conducted. Sent standard franchise presentation brochure and royalty sheet.",
    createdAt: "2026-09-10T09:40:00.000Z",
    updatedAt: "2026-09-11T11:00:00.000Z",
  },
  {
    id: "fr-104",
    leadId: "BBC-FR-104",
    fullName: "Subrata Mondal",
    phone: "+91 98315 22910",
    email: "subrata.howrahfleet@gmail.com",
    city: "Howrah",
    state: "West Bengal",
    pincode: "711101",
    address: "Station Road, Kona Expressway Hub, Howrah",
    franchiseType: "District Fleet Partner",
    investmentBudget: "₹10 - ₹25 Lakhs",
    currentFleetSize: "6 - 15 Vehicles",
    hasCommercialOffice: "Yes",
    businessExperience: "10 years in interstate taxi transport and railway station pre-paid operations.",
    preferredLaunchTimeline: "Immediate (Within 15 days)",
    status: "ONBOARDED",
    priority: "HIGH",
    assignedTo: "Operations Lead",
    inquiryMessage: "Franchise agreement finalized for Howrah Railway Station hub and West Bengal highway connections.",
    adminNotes: "Franchise fee deposited. Chauffeur training scheduled for 18th Sept.",
    createdAt: "2026-09-02T11:00:00.000Z",
    updatedAt: "2026-09-13T18:30:00.000Z",
  },
  {
    id: "lead-init-3",
    leadId: "BB-2026-1003",
    fullName: "Priya Chauhan",
    phone: "+91 98290 11223",
    email: "priya.chauhan@outlook.com",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302004",
    address: "Raja Park Main Market, Jaipur",
    franchiseType: "Silver Partner (Booking Kiosk)",
    investmentBudget: "₹2 - ₹5 Lakhs",
    currentFleetSize: "None (New Entrepreneur)",
    hasCommercialOffice: "Renting in prime retail spot (150 sq.ft)",
    businessExperience: "Over 6 years in tour & travels agency.",
    preferredLaunchTimeline: "Within 1 Month",
    status: "NEW",
    priority: "LOW",
    assignedTo: "Franchise Desk",
    inquiryMessage: "Interested in adding BroomBoom cab booking kiosk to existing travel desk.",
    adminNotes: "Inquiry received. Assigned territory manager for video call.",
    createdAt: "2026-09-08T15:20:00.000Z",
    updatedAt: "2026-09-08T15:20:00.000Z",
  }
];

export async function fetchFranchiseLeads(): Promise<FranchiseLead[]> {
  try {
    const res = await authFetch(`${API_BASE_URL}/api/franchise-leads`, { method: "GET" });
    if (res.ok) {
      const json = await res.json();
      const rawList = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.leads)
        ? json.leads
        : [];
      if (rawList.length > 0) {
        const normalized = rawList.map(normalizeFranchiseLead);
        setLocalItem("broomboom_franchise_leads", normalized);
        return normalized;
      }
    }
  } catch (err) {
    console.warn("[fetchFranchiseLeads] Remote fetch failed, using local cache:", err);
  }

  const local = getLocalItem<any[]>("broomboom_franchise_leads", DEFAULT_FRANCHISE_LEADS);
  const safeList = Array.isArray(local) && local.length > 0 ? local : DEFAULT_FRANCHISE_LEADS;
  return safeList.map(normalizeFranchiseLead);
}

export async function fetchFranchiseLeadById(id: string): Promise<FranchiseLead | null> {
  const all = await fetchFranchiseLeads();
  return all.find((l) => l.id === id || l.leadId === id) || null;
}

export async function saveFranchiseLead(leadData: Partial<FranchiseLead>): Promise<FranchiseLead> {
  const isNew = !leadData.id;
  const id = leadData.id || `fr-${Date.now()}`;
  const leadId = leadData.leadId || `BBC-FR-${Math.floor(100 + Math.random() * 900)}`;

  const lead: FranchiseLead = normalizeFranchiseLead({
    ...leadData,
    id,
    leadId,
    updatedAt: new Date().toISOString(),
  });

  try {
    const method = isNew ? "POST" : "PUT";
    const url = isNew
      ? `${API_BASE_URL}/api/franchise-leads`
      : `${API_BASE_URL}/api/franchise-leads/${id}`;

    const res = await authFetch(url, {
      method,
      body: JSON.stringify(lead),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return normalizeFranchiseLead(json.data);
    }
  } catch {
    // local fallback
  }

  const list = await fetchFranchiseLeads();
  let updated: FranchiseLead[];
  const idx = list.findIndex((l) => l.id === id || l.leadId === id);
  if (idx >= 0) {
    updated = [...list];
    updated[idx] = { ...list[idx], ...lead, updatedAt: new Date().toISOString() };
  } else {
    updated = [lead, ...list];
  }
  setLocalItem("broomboom_franchise_leads", updated);
  return lead;
}

export async function updateFranchiseLead(id: string, data: Partial<FranchiseLead>): Promise<FranchiseLead> {
  try {
    const res = await authFetch(`${API_BASE_URL}/api/franchise-leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return normalizeFranchiseLead(json.data);
    }
  } catch {
    // local fallback
  }

  const list = await fetchFranchiseLeads();
  const idx = list.findIndex((l) => l.id === id || l.leadId === id);
  if (idx === -1) throw new Error("Franchise lead not found");

  const updatedLead: FranchiseLead = normalizeFranchiseLead({
    ...list[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  });
  const updatedList = [...list];
  updatedList[idx] = updatedLead;
  setLocalItem("broomboom_franchise_leads", updatedList);
  return updatedLead;
}

export async function updateFranchiseLeadStatus(id: string, status: string): Promise<FranchiseLead> {
  return updateFranchiseLead(id, { status });
}

export async function deleteFranchiseLead(id: string): Promise<void> {
  try {
    await authFetch(`${API_BASE_URL}/api/franchise-leads/${id}`, {
      method: "DELETE",
    });
  } catch {
    // local fallback
  }

  const list = await fetchFranchiseLeads();
  const filtered = list.filter((l) => l.id !== id && l.leadId !== id);
  setLocalItem("broomboom_franchise_leads", filtered);
}