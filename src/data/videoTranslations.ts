import { Language } from '../types';

export const VIDEO_TRANSLATIONS: Record<Language, {
  bookTitle: string;
  selectLanguage: string;
  subtitle: string;
  menu: string;
  tiles: {
    benvenuto: string;
    checkIn: string;
    wifi: string;
    regole: string;
    posizione: string;
    trasporti: string;
    servizi: string;
    attivita: string;
    ristoranti: string;
    barClub: string;
    shopping: string;
    informazioni: string;
    emergenza: string;
    checkOut: string;
    contatti: string;
  };
  actions: {
    call: string;
    googleMaps: string;
    copy: string;
    copied: string;
    backToMenu: string;
    openWhatsApp: string;
    rateGoogle: string;
    rateWebsite: string;
  };
}> = {
  it: {
    bookTitle: "Libro Di Benvenuto",
    selectLanguage: "SELEZIONA LINGUA",
    subtitle: "Il tuo rifugio accogliente lontano da casa...",
    menu: "MENU",
    tiles: {
      benvenuto: "BENVENUTO",
      checkIn: "CHECK-IN",
      wifi: "WIFI",
      regole: "REGOLE",
      posizione: "POSIZIONE",
      trasporti: "TRASPORTI",
      servizi: "SERVIZI",
      attivita: "ATTIVITÀ",
      ristoranti: "RISTORANTI",
      barClub: "BAR E CLUB",
      shopping: "SHOPPING",
      informazioni: "INFORMAZIONI",
      emergenza: "EMERGENZA",
      checkOut: "CHECK-OUT",
      contatti: "CONTATTI"
    },
    actions: {
      call: "Chiama",
      googleMaps: "GOOGLE MAPS",
      copy: "Copia",
      copied: "Copiato!",
      backToMenu: "MENU",
      openWhatsApp: "Scrivici su WhatsApp",
      rateGoogle: "VALUTA SU GOOGLE",
      rateWebsite: "VALUTA SUL SITO WEB"
    }
  },
  en: {
    bookTitle: "Welcome Book",
    selectLanguage: "SELECT LANGUAGE",
    subtitle: "Your cozy retreat away from home...",
    menu: "MENU",
    tiles: {
      benvenuto: "WELCOME",
      checkIn: "CHECK-IN",
      wifi: "WIFI",
      regole: "RULES",
      posizione: "LOCATION",
      trasporti: "TRANSPORT",
      servizi: "AMENITIES",
      attivita: "ACTIVITIES",
      ristoranti: "RESTAURANTS",
      barClub: "BARS & CLUBS",
      shopping: "SHOPPING",
      informazioni: "INFORMATION",
      emergenza: "EMERGENCY",
      checkOut: "CHECK-OUT",
      contatti: "CONTACT"
    },
    actions: {
      call: "Call",
      googleMaps: "GOOGLE MAPS",
      copy: "Copy",
      copied: "Copied!",
      backToMenu: "MENU",
      openWhatsApp: "Chat on WhatsApp",
      rateGoogle: "REVIEW ON GOOGLE",
      rateWebsite: "REVIEW ON WEBSITE"
    }
  },
  fr: {
    bookTitle: "Livret D'Accueil",
    selectLanguage: "SÉLECTIONNER LA LANGUE",
    subtitle: "Votre havre de paix loin de chez vous...",
    menu: "MENU",
    tiles: {
      benvenuto: "BIENVENUE",
      checkIn: "ARRIVÉE",
      wifi: "WIFI",
      regole: "RÈGLES",
      posizione: "EMPLACEMENT",
      trasporti: "TRANSPORTS",
      servizi: "SERVICES",
      attivita: "ACTIVITÉS",
      ristoranti: "RESTAURANTS",
      barClub: "BARS & CLUBS",
      shopping: "SHOPPING",
      informazioni: "INFORMATIONS",
      emergenza: "URGENCES",
      checkOut: "DÉPART",
      contatti: "CONTACT"
    },
    actions: {
      call: "Appeler",
      googleMaps: "GOOGLE MAPS",
      copy: "Copier",
      copied: "Copié !",
      backToMenu: "MENU",
      openWhatsApp: "Écrivez sur WhatsApp",
      rateGoogle: "AVIS SUR GOOGLE",
      rateWebsite: "AVIS SUR LE SITE"
    }
  },
  es: {
    bookTitle: "Guía De Bienvenida",
    selectLanguage: "SELECCIONAR IDIOMA",
    subtitle: "Tu refugio acogedor lejos de casa...",
    menu: "MENÚ",
    tiles: {
      benvenuto: "BIENVENIDA",
      checkIn: "LLEGADA",
      wifi: "WIFI",
      regole: "REGLAS",
      posizione: "UBICACIÓN",
      trasporti: "TRANSPORTE",
      servizi: "SERVICIOS",
      attivita: "ACTIVIDADES",
      ristoranti: "RESTAURANTES",
      barClub: "BARES Y CLUBES",
      shopping: "COMPRAS",
      informazioni: "INFORMACIÓN",
      emergenza: "EMERGENCIA",
      checkOut: "SALIDA",
      contatti: "CONTACTO"
    },
    actions: {
      call: "Llamar",
      googleMaps: "GOOGLE MAPS",
      copy: "Copiar",
      copied: "¡Copiado!",
      backToMenu: "MENÚ",
      openWhatsApp: "Escribir en WhatsApp",
      rateGoogle: "VALORAR EN GOOGLE",
      rateWebsite: "VALORAR EN LA WEB"
    }
  },
  de: {
    bookTitle: "Willkommensbuch",
    selectLanguage: "SPRACHE AUSWÄHLEN",
    subtitle: "Ihr gemütlicher Rückzugsort fernab der Heimat...",
    menu: "MENÜ",
    tiles: {
      benvenuto: "WILLKOMMEN",
      checkIn: "CHECK-IN",
      wifi: "WLAN",
      regole: "REGELN",
      posizione: "STANDORT",
      trasporti: "VERKEHR",
      servizi: "AUSSTATTUNG",
      attivita: "AKTIVITÄTEN",
      ristoranti: "RESTAURANTS",
      barClub: "BARS & CLUBS",
      shopping: "EINKAUFEN",
      informazioni: "INFORMATION",
      emergenza: "NOTFALL",
      checkOut: "CHECK-OUT",
      contatti: "KONTAKT"
    },
    actions: {
      call: "Anrufen",
      googleMaps: "GOOGLE MAPS",
      copy: "Kopieren",
      copied: "Kopiert!",
      backToMenu: "MENÜ",
      openWhatsApp: "Auf WhatsApp schreiben",
      rateGoogle: "AUF GOOGLE BEWERTEN",
      rateWebsite: "AUF DER WEBSITE BEWERTEN"
    }
  }
};
