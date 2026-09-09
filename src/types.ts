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
  checkInTime?: string; // e.g. "15:00"
  checkOutDate: string; // YYYY-MM-DD
  checkOutTime?: string; // e.g. "10:00"
  pinCode: string; // 4-digit code e.g. "2741"
  notes?: string;
  bookingRef?: string;
  guestsCount?: number;
  bookingSource?: 'bed-and-breakfast.it' | 'direct' | 'booking.com' | 'airbnb' | 'other';
  token: string;
  createdAt: string;
  active: boolean;
}

export interface SmartLockConfig {
  webhookUrl: string; // Home Assistant or eWeLink Webhook
  apiBearerToken?: string;
  deviceEntityId?: string; // e.g. "lock.portone_principale"
  enabled: boolean;
}
