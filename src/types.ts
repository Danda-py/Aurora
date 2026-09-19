export type Language = 'it' | 'en' | 'de' | 'fr' | 'es';

export type WelcomePage = 
  | 'language_select'
  | 'grid_menu'
  | 'benvenuto'
  | 'check_in'
  | 'wifi'
  | 'regole'
  | 'posizione'
  | 'trasporti'
  | 'servizi'
  | 'attivita'
  | 'ristoranti'
  | 'bar_club'
  | 'shopping'
  | 'informazioni'
  | 'emergenza'
  | 'check_out'
  | 'contatti';

export type ActiveTab = 'home' | 'house' | 'guide' | 'restaurants' | 'experiences' | 'monuments' | 'contacts' | 'guestbook' | 'gallery';

export interface Amenity {
  id: string;
  name: Record<Language, string>;
  icon: string;
  category: 'comfort' | 'kitchen' | 'tech' | 'bathroom' | 'outdoor';
  description: Record<Language, string>;
}

export interface Appliance {
  id: string;
  title: Record<Language, string>;
  icon: string;
  instructions: Record<Language, string[]>;
  tips?: Record<Language, string>;
  alertNote?: Record<Language, string>;
}

export interface WasteCategory {
  id: string;
  name: Record<Language, string>;
  color: string;
  icon: string;
  items: Record<Language, string[]>;
  binColor: Record<Language, string>;
  daySchedule?: Record<Language, string>;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: 'restaurant' | 'grocery' | 'bar' | 'pharmacy' | 'transport' | 'parking';
  distance: string;
  walkTime: string;
  hours?: string;
  address: string;
  phone?: string;
  description: Record<Language, string>;
  highlight?: Record<Language, string>;
  googleMapsUrl: string;
  rating?: number;
  priceRange?: string;
  image?: string;
}

export interface Experience {
  id: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  duration: string;
  driveTime: string;
  category: 'nature' | 'culture' | 'food' | 'sport' | 'family';
  description: Record<Language, string>;
  tips: Record<Language, string[]>;
  googleMapsUrl: string;
  image: string;
  badge?: Record<Language, string>;
}

export interface GuestReview {
  id: string;
  name: string;
  country: string;
  date: string;
  rating: number;
  comment: string;
  travelType?: string;
}

export interface GuestPass {
  id: string;
  guestName: string;
  guestSurname: string;
  phone?: string;
  checkInDate: string; // YYYY-MM-DD
  checkInTime?: string; // e.g. "14:00"
  checkOutDate: string; // YYYY-MM-DD
  checkOutTime?: string; // e.g. "10:00"
  pinCode: string; // 4-digit code e.g. "2741"
  notes?: string;
  bookingRef?: string;
  guestsCount?: number;
  bookingSource?: 'bed-and-breakfast.it' | 'direct' | 'booking.com' | 'airbnb' | 'other' | string;
  channelSource?: string;
  guestEmail?: string;
  amount?: string;
  apartmentName?: string;
  nightsCount?: number;
  token: string;
  createdAt: string;
  active: boolean;
  firstUsedAt?: string;
  documentsUploaded?: boolean;
  checkInConfirmed?: boolean;
  documentsData?: Array<{
    documentType: 'identita' | 'passaporto' | 'patente';
    documentNumber: string;
    name: string;
    surname: string;
    birthDate: string;
    birthPlace: string;
    nationality: string;
    gender: 'M' | 'F';
    issueDate?: string;
    expiryDate?: string;
  }>;
}

export type SmartLockProviderType = 'home_assistant' | 'shelly' | 'nuki' | 'generic_webhook';

export interface SmartLockConfig {
  provider?: SmartLockProviderType;
  webhookUrl: string; // Home Assistant or eWeLink Webhook
  apiBearerToken?: string;
  deviceEntityId?: string; // e.g. "lock.portone_principale"
  enabled: boolean;
  // Shelly specific
  shellyDeviceId?: string;
  shellyAuthKey?: string;
  shellyRelayIndex?: number;
  shellyServer?: string;
  // Nuki specific
  nukiSmartlockId?: string;
  nukiApiToken?: string;
}

export interface DigitalKeyLog {
  id?: string;
  timestamp: string; // ISO String
  guestPassId: string | null;
  guestName: string;
  success: boolean;
  errorMessage?: string;
  source: string;
  ipAddress?: string;
}

// In-app guest activity tracking: every page view / button click / feature used by
// a guest is recorded here so the host can see, per booking, how the guest is
// using the app (number of opens, most-used features, full click-by-click trail).
export interface GuestActivityEvent {
  id: string;
  passId: string;
  guestName: string;
  action: string;
  detail?: string;
  sessionId?: string;
  timestamp: string; // ISO String
}
