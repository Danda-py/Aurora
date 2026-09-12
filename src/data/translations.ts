import { Language } from '../types';

export interface TranslationSchema {
  appName: string;
  tagline: string;
  location: string;
  addressFull: string;
  nav: {
    home: string;
    house: string;
    places: string;
    experiences: string;
    monuments: string;
    gallery: string;
    guestbook: string;
    contacts: string;
  };
  pwa: {
    installPrompt: string;
    installButton: string;
    installed: string;
    iosInstructions: string;
    iosStep1: string;
    iosStep2: string;
    close: string;
    offlineMode: string;
    offlineNotice: string;
  };
  quickActions: {
    wifi: string;
    directions: string;
    callHost: string;
    whatsapp: string;
    checkInOut: string;
    emergency: string;
  };
  hero: {
    welcome: string;
    greeting: string;
    intro: string;
    checkInTime: string;
    checkOutTime: string;
    statusReady: string;
    viewGuide: string;
    weatherInMorbegno: string;
    viewGallery: string;
  };
  wifi: {
    title: string;
    subtitle: string;
    network: string;
    password: string;
    copyPassword: string;
    copied: string;
    scanQr: string;
    speed: string;
    troubleshoot: string;
  };
  house: {
    title: string;
    subtitle: string;
    checkInTitle: string;
    checkInDesc: string;
    checkOutTitle: string;
    checkOutDesc: string;
    appliancesTitle: string;
    appliancesSubtitle: string;
    rulesTitle: string;
    rulesSubtitle: string;
    recyclingTitle: string;
    recyclingSubtitle: string;
    amenitiesTitle: string;
    specsTitle: string;
  };
  places: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterRestaurants: string;
    filterGroceries: string;
    filterBars: string;
    filterPharmacy: string;
    filterTransport: string;
    openMaps: string;
    call: string;
    walkingDistance: string;
  };
  experiences: {
    title: string;
    subtitle: string;
    duration: string;
    distance: string;
    tipsTitle: string;
    getDirections: string;
  };
  monuments: {
    title: string;
    subtitle: string;
    heritageBadge: string;
    viewLocation: string;
  };
  gallery: {
    title: string;
    subtitle: string;
    allPhotos: string;
  };
  guestbook: {
    title: string;
    subtitle: string;
    addReview: string;
    yourName: string;
    yourCountry: string;
    rating: string;
    comment: string;
    submit: string;
    thankYou: string;
    recentReviews: string;
    emptyReviews: string;
  };
  contacts: {
    title: string;
    subtitle: string;
    hostName: string;
    hostRole: string;
    availableHours: string;
    chatWhatsapp: string;
    phoneCall: string;
    sendEmail: string;
    emergencyHeader: string;
    sosNumber: string;
    medicalGuard: string;
    hospital: string;
    police: string;
    taxi: string;
    pharmacyDuty: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  it: {
    appName: "Appartamento Aurora",
    tagline: "Il tuo rifugio tra lago e montagne a Morbegno, Valtellina",
    location: "Morbegno (Sondrio) - Valtellina",
    addressFull: "Via Serta 188D, 23017 Morbegno (SO)",
    nav: {
      home: "Home",
      house: "Casa & Servizi",
      places: "Dintorni & Sapori",
      experiences: "Esperienze",
      monuments: "Monumenti",
      gallery: "Galleria",
      guestbook: "Libro Ospiti",
      contacts: "Contatti & SOS",
    },
    pwa: {
      installPrompt: "Installa l'App per accedere alla guida anche offline durante il tuo soggiorno!",
      installButton: "Installa PWA",
      installed: "App Installata",
      iosInstructions: "Come installare su iPhone & iPad",
      iosStep1: "1. Tocca l'icona Condividi in basso su Safari",
      iosStep2: "2. Scorri e premi 'Aggiungi a schermata Home'",
      close: "Chiudi",
      offlineMode: "Modalità Offline",
      offlineNotice: "Sei offline. Tutte le informazioni della guida rimangono disponibili.",
    },
    quickActions: {
      wifi: "Wi-Fi Casa",
      directions: "Come Arrivare",
      callHost: "Chiama Host",
      whatsapp: "WhatsApp",
      checkInOut: "Check-in / Out",
      emergency: "Emergenze SOS",
    },
    hero: {
      welcome: "Benvenuti all'Appartamento Aurora",
      greeting: "Siamo felici di ospitarvi a Morbegno!",
      intro: "La vostra guida digitale completa per vivere al meglio l'appartamento, scoprire i ristoranti tipici con i migliori pizzoccheri e le meraviglie della Valtellina.",
      checkInTime: "Check-in: dalle 14:00 in poi (2 PM)",
      checkOutTime: "Check-out: entro le 10:00",
      statusReady: "Appartamento Pronto per il Soggiorno",
      viewGuide: "Esplora Guida Casa",
      weatherInMorbegno: "Meteo Morbegno",
      viewGallery: "Guarda Foto Casa",
    },
    wifi: {
      title: "Wi-Fi Fibra Veloce",
      subtitle: "Connessione internet illimitata ad alta velocità inclusa",
      network: "Nome Rete (SSID)",
      password: "Password",
      copyPassword: "Copia Password",
      copied: "Copiata!",
      scanQr: "Scansiona QR per collegarti istantaneamente",
      speed: "Velocità fibra ottimale per streaming e smart working",
      troubleshoot: "In caso di problemi, riavviare il router posto nel soggiorno scollegando l'alimentatore per 10 secondi.",
    },
    house: {
      title: "Guida della Casa & Istruzioni",
      subtitle: "Tutto ciò che serve per vivere al meglio il vostro soggiorno in appartamento",
      checkInTitle: "Check-in & Arrivo",
      checkInDesc: "Accesso autonomo o accoglienza. Parcheggio privato gratuito disponibile all'interno della corte.",
      checkOutTitle: "Check-out & Partenza",
      checkOutDesc: "Entro le 10:00. Lasciare le chiavi sul tavolo e assicurarsi di aver chiuso finestre e spento riscaldamento.",
      appliancesTitle: "Elettrodomestici & Dotazioni",
      appliancesSubtitle: "Istruzioni rapide per l'uso",
      rulesTitle: "Regole della Casa",
      rulesSubtitle: "Piccole attenzioni per il rispetto reciproco e la cura dell'alloggio",
      recyclingTitle: "Raccolta Differenziata",
      recyclingSubtitle: "Aiutaci a proteggere l'ambiente della Valtellina separando correttamente i rifiuti",
      amenitiesTitle: "Tutte le Dotazioni Incluse",
      specsTitle: "Scheda & Dettagli Appartamento",
    },
    places: {
      title: "Morbegno & Dintorni",
      subtitle: "Ristoranti tipici, botteghe storiche del Bitto, supermercati e servizi essenziali a due passi",
      filterAll: "Tutti",
      filterRestaurants: "Ristoranti & Osterie",
      filterGroceries: "Supermercati & Cibo",
      filterBars: "Bar & Colazioni",
      filterPharmacy: "Farmacie & Servizi",
      filterTransport: "Treni & Parcheggio",
      openMaps: "Indicazioni Mappa",
      call: "Chiama",
      walkingDistance: "A piedi",
    },
    experiences: {
      title: "Esperienze in Valtellina",
      subtitle: "I migliori itinerari, valli alpine, ponti tibetani e laghi a portata di mano da Morbegno",
      duration: "Tempo consigliato",
      distance: "Distanza da Aurora",
      tipsTitle: "Consigli dell'Host",
      getDirections: "Come arrivare",
    },
    monuments: {
      title: "Monumenti & Luoghi Storici",
      subtitle: "Scopri il fascino storico e architettonico di Morbegno",
      heritageBadge: "Patrimonio Storico",
      viewLocation: "Vedi su Mappa",
    },
    gallery: {
      title: "Galleria Fotografica",
      subtitle: "Esplora gli spazi interni e l'esterno dell'Appartamento Aurora",
      allPhotos: "Tutte le Foto",
    },
    guestbook: {
      title: "Libro degli Ospiti",
      subtitle: "Leggi i pensieri dei viaggiatori e lascia un ricordo del tuo soggiorno all'Appartamento Aurora",
      addReview: "Scrivi un commento",
      yourName: "Il tuo Nome",
      yourCountry: "Città / Nazione",
      rating: "Valutazione",
      comment: "Il tuo messaggio / impressioni sulla casa e su Morbegno",
      submit: "Pubblica nel Guestbook",
      thankYou: "Grazie di cuore per il tuo messaggio!",
      recentReviews: "I ricordi degli altri ospiti",
      emptyReviews: "Sii il primo a lasciare una recensione!",
    },
    contacts: {
      title: "Contatti & Assistenza",
      subtitle: "Siamo sempre a vostra disposizione per ogni necessità durante il soggiorno",
      hostName: "Nino - Host Appartamento Aurora",
      hostRole: "Gestore & Referente Locale",
      availableHours: "Disponibile 7 giorni su 7 per assistenza",
      chatWhatsapp: "Scrivici su WhatsApp",
      phoneCall: "Chiamata Diretta",
      sendEmail: "Invia un'Email",
      emergencyHeader: "Numeri di Emergenza & Utili",
      sosNumber: "Numero Unico Europeo Emergenze: 112",
      medicalGuard: "Continuità Assistenziale (Guardia Medica): 116 117",
      hospital: "Presidio Ospedaliero di Morbegno: 0342 607111",
      police: "Centro Comando Carabinieri Morbegno: 0342 610210",
      taxi: "Servizio Taxi Morbegno: +39 338 1234567",
      pharmacyDuty: "Farmacia di Turno Morbegno (PharmAround)",
    },
  },
  en: {
    appName: "Aurora Apartment",
    tagline: "Your cozy retreat between lake and mountains in Morbegno, Valtellina",
    location: "Morbegno (Sondrio) - Valtellina, Italy",
    addressFull: "Via Serta 188D, 23017 Morbegno (SO), Italy",
    nav: {
      home: "Home",
      house: "House Guide",
      places: "Dining & Area",
      experiences: "Experiences",
      monuments: "Monuments",
      gallery: "Gallery",
      guestbook: "Guestbook",
      contacts: "Contacts & SOS",
    },
    pwa: {
      installPrompt: "Install the App to access your guest guidebook offline anytime during your stay!",
      installButton: "Install PWA",
      installed: "App Installed",
      iosInstructions: "How to install on iPhone & iPad",
      iosStep1: "1. Tap the Share button at the bottom of Safari",
      iosStep2: "2. Scroll down and tap 'Add to Home Screen'",
      close: "Close",
      offlineMode: "Offline Mode",
      offlineNotice: "You are offline. Full guidebook details remain cached and accessible.",
    },
    quickActions: {
      wifi: "Home Wi-Fi",
      directions: "Directions",
      callHost: "Call Host",
      whatsapp: "WhatsApp",
      checkInOut: "Check-in / Out",
      emergency: "Emergency SOS",
    },
    hero: {
      welcome: "Welcome to Aurora Apartment",
      greeting: "We are thrilled to host you in Morbegno!",
      intro: "Your interactive digital guest portal with full apartment instructions, local Valtellina culinary gems, alpine excursions, and emergency contacts.",
      checkInTime: "Check-in: from 2:00 PM (14:00) onwards",
      checkOutTime: "Check-out: by 10:00 AM",
      statusReady: "Apartment Ready for Your Stay",
      viewGuide: "Explore House Guide",
      weatherInMorbegno: "Morbegno Weather",
      viewGallery: "View Photo Gallery",
    },
    wifi: {
      title: "Fast Fiber Wi-Fi",
      subtitle: "Unlimited high-speed internet connection included",
      network: "Network Name (SSID)",
      password: "Password",
      copyPassword: "Copy Password",
      copied: "Copied!",
      scanQr: "Scan QR Code for instant connection",
      speed: "Fast fiber suitable for 4K streaming and remote work",
      troubleshoot: "If connection drops, reboot the living room router by unplugging for 10 seconds.",
    },
    house: {
      title: "House Guide & Appliances",
      subtitle: "Everything you need to enjoy a smooth, relaxing stay",
      checkInTitle: "Check-in & Arrival",
      checkInDesc: "Self check-in or personal greeting. Free reserved parking space in the inner courtyard.",
      checkOutTitle: "Check-out & Departure",
      checkOutDesc: "By 10:00 AM. Leave the keys on the dining table, close windows, and turn off heating.",
      appliancesTitle: "Appliances & Amenities",
      appliancesSubtitle: "Quick usage tips",
      rulesTitle: "House Rules",
      rulesSubtitle: "Friendly guidelines to keep the apartment in pristine condition",
      recyclingTitle: "Waste Recycling Guide",
      recyclingSubtitle: "Help us protect the Valtellina environment by sorting waste properly",
      amenitiesTitle: "All Included Amenities",
      specsTitle: "Apartment Specifications",
    },
    places: {
      title: "Morbegno & Surroundings",
      subtitle: "Authentic trattorias, historic Bitto cheese cellars, supermarkets, and services nearby",
      filterAll: "All",
      filterRestaurants: "Restaurants & Osterias",
      filterGroceries: "Groceries & Bakeries",
      filterBars: "Cafes & Breakfast",
      filterPharmacy: "Pharmacies & Services",
      filterTransport: "Train & Parking",
      openMaps: "Map Directions",
      call: "Call",
      walkingDistance: "Walking distance",
    },
    experiences: {
      title: "Valtellina Experiences",
      subtitle: "Breathtaking valleys, suspension bridges, scenic cycling, and alpine lakes near Morbegno",
      duration: "Recommended time",
      distance: "Distance from Aurora",
      tipsTitle: "Host Tips",
      getDirections: "Get Directions",
    },
    monuments: {
      title: "Historic Landmarks",
      subtitle: "Discover the architectural and cultural heritage of Morbegno",
      heritageBadge: "Historic Heritage",
      viewLocation: "View on Map",
    },
    gallery: {
      title: "Photo Gallery",
      subtitle: "Explore Aurora Apartment inside and out",
      allPhotos: "All Photos",
    },
    guestbook: {
      title: "Guestbook & Reviews",
      subtitle: "Read traveler impressions and share your memories at Aurora Apartment",
      addReview: "Write a Review",
      yourName: "Your Name",
      yourCountry: "City / Country",
      rating: "Rating",
      comment: "Your review or favorite memories of Morbegno",
      submit: "Post in Guestbook",
      thankYou: "Thank you so much for your kind message!",
      recentReviews: "Notes from other guests",
      emptyReviews: "Be the first to leave a review!",
    },
    contacts: {
      title: "Contacts & Host Support",
      subtitle: "We are available throughout your stay whenever you need assistance",
      hostName: "Nino - Aurora Apartment Host",
      hostRole: "Host & Local Concierge",
      availableHours: "Available 7 days a week for assistance",
      chatWhatsapp: "Message on WhatsApp",
      phoneCall: "Direct Phone Call",
      sendEmail: "Send Email",
      emergencyHeader: "Emergency & Useful Numbers",
      sosNumber: "European Emergency SOS: 112",
      medicalGuard: "Non-Emergency Medical Service: 116 117",
      hospital: "Morbegno Hospital Center: +39 0342 607111",
      police: "Carabinieri Police Command Morbegno: +39 0342 610210",
      taxi: "Morbegno Taxi Service: +39 338 1234567",
      pharmacyDuty: "On-Duty Pharmacy (PharmAround)",
    },
  },
  de: {
    appName: "Aurora Apartment",
    tagline: "Ihre gemütliche Oase zwischen See und Bergen in Morbegno, Veltlin",
    location: "Morbegno (Sondrio) - Veltlin (Valtellina)",
    addressFull: "Via Serta 188D, 23017 Morbegno (SO), Italien",
    nav: {
      home: "Startseite",
      house: "Haus & Regeln",
      places: "Umgebung & Essen",
      experiences: "Erlebnisse",
      monuments: "Sehenswürdigkeiten",
      gallery: "Galerie",
      guestbook: "Gästebuch",
      contacts: "Kontakt & SOS",
    },
    pwa: {
      installPrompt: "Installieren Sie die PWA-App, um den Reiseführer auch offline zu nutzen!",
      installButton: "PWA Installieren",
      installed: "App Installiert",
      iosInstructions: "Installation auf iPhone & iPad",
      iosStep1: "1. Tippen Sie auf das Teilen-Symbol in Safari",
      iosStep2: "2. Wählen Sie 'Zum Home-Bildschirm'",
      close: "Schließen",
      offlineMode: "Offline-Modus",
      offlineNotice: "Sie sind offline. Der komplette Reiseführer steht Ihnen weiterhin zur Verfügung.",
    },
    quickActions: {
      wifi: "WLAN",
      directions: "Anreise / Route",
      callHost: "Host Anrufen",
      whatsapp: "WhatsApp",
      checkInOut: "Check-in / Out",
      emergency: "Notfall SOS",
    },
    hero: {
      welcome: "Willkommen im Appartamento Aurora",
      greeting: "Wir freuen uns auf Ihren Besuch in Morbegno!",
      intro: "Ihr digitaler Reiseführer mit allen Hausanleitungen, den besten traditionellen Restaurants im Veltlin, Bergwanderungen und Notfallkontakten.",
      checkInTime: "Check-in: ab 14:00 Uhr (2 PM)",
      checkOutTime: "Check-out: bis 10:00 Uhr",
      statusReady: "Apartment bereit für Ihren Aufenthalt",
      viewGuide: "Hausanleitung öffnen",
      weatherInMorbegno: "Wetter in Morbegno",
      viewGallery: "Fotogalerie ansehen",
    },
    wifi: {
      title: "Schnelles Glasfaser-WLAN",
      subtitle: "Unbegrenzte Highspeed-Internetverbindung inklusive",
      network: "Netzwerkname (SSID)",
      password: "Passwort",
      copyPassword: "Passwort kopieren",
      copied: "Kopiert!",
      scanQr: "QR-Code scannen für Direktverbindung",
      speed: "Schnelles Internet für Streaming und Homeoffice",
      troubleshoot: "Bei Störungen den Router im Wohnzimmer für 10 Sekunden vom Strom trennen.",
    },
    house: {
      title: "Hausordnung & Geräte",
      subtitle: "Alle wichtigen Informationen für einen perfekten Aufenthalt",
      checkInTitle: "Check-in & Ankunft",
      checkInDesc: "Selbst-Check-in oder persönliche Begrüßung. Kostenloser privater Parkplatz im Innenhof.",
      checkOutTitle: "Check-out & Abreise",
      checkOutDesc: "Bis 10:00 Uhr. Schlüssel auf dem Tisch hinterlassen, Fenster schließen und Heizung ausschalten.",
      appliancesTitle: "Haushaltsgeräte",
      appliancesSubtitle: "Kurzanleitungen",
      rulesTitle: "Hausregeln",
      rulesSubtitle: "Hinweise für ein harmonisches Miteinander",
      recyclingTitle: "Mülltrennung",
      recyclingSubtitle: "Helfen Sie uns, die Natur des Veltlins durch korrekte Mülltrennung zu schützen",
      amenitiesTitle: "Ausstattung",
      specsTitle: "Wohnungsdetails",
    },
    places: {
      title: "Morbegno & Umgebung",
      subtitle: "Typische Restaurants, historische Bitto-Käsekeller, Supermärkte in Gehweite",
      filterAll: "Alle",
      filterRestaurants: "Restaurants & Osterien",
      filterGroceries: "Supermärkte & Bäckereien",
      filterBars: "Cafés & Frühstück",
      filterPharmacy: "Apotheken & Dienste",
      filterTransport: "Bahn & Parken",
      openMaps: "Auf Karte öffnen",
      call: "Anrufen",
      walkingDistance: "Zu Fuß",
    },
    experiences: {
      title: "Ausflüge im Veltlin",
      subtitle: "Traumhafte Bergtäler, Hängebrücken, Radwege und der Comer See ab Morbegno",
      duration: "Empfohlene Dauer",
      distance: "Entfernung von Aurora",
      tipsTitle: "Tipps des Gastgebers",
      getDirections: "Route berechnen",
    },
    monuments: {
      title: "Historische Denkmäler",
      subtitle: "Entdecken Sie die reiche Kultur und Geschichte von Morbegno",
      heritageBadge: "Kulturerbe",
      viewLocation: "Auf Karte anzeigen",
    },
    gallery: {
      title: "Fotogalerie",
      subtitle: "Bilder vom Appartamento Aurora und der Umgebung",
      allPhotos: "Alle Fotos",
    },
    guestbook: {
      title: "Gästebuch",
      subtitle: "Lesen Sie Gästebewertungen und hinterlassen Sie Ihre Eindrücke im Appartamento Aurora",
      addReview: "Eintrag verfassen",
      yourName: "Ihr Name",
      yourCountry: "Stadt / Land",
      rating: "Bewertung",
      comment: "Ihre Bewertung oder Lieblingserlebnisse in Morbegno",
      submit: "Im Gästebuch speichern",
      thankYou: "Vielen herzlichen Dank für Ihre Bewertung!",
      recentReviews: "Einträge anderer Gäste",
      emptyReviews: "Seien Sie der Erste, der einen Eintrag hinterlässt!",
    },
    contacts: {
      title: "Kontakt & Betreuung",
      subtitle: "Wir stehen Ihnen während Ihres gesamten Aufenthalts gerne zur Seite",
      hostName: "Nino - Gastgeber Appartamento Aurora",
      hostRole: "Gastgeber & Ansprechpartner",
      availableHours: "Täglich für Sie erreichbar",
      chatWhatsapp: "Über WhatsApp schreiben",
      phoneCall: "Direktanruf",
      sendEmail: "E-Mail senden",
      emergencyHeader: "Wichtige Notrufnummern",
      sosNumber: "Europäischer Notruf: 112",
      medicalGuard: "Ärztlicher Bereitschaftsdienst: 116 117",
      hospital: "Krankenhaus Morbegno: +39 0342 607111",
      police: "Carabinieri Polizeikommando Morbegno: +39 0342 610210",
      taxi: "Taxi Morbegno: +39 338 1234567",
      pharmacyDuty: "Notdienstapotheke Morbegno (PharmAround)",
    },
  },
  fr: {
    appName: "Appartement Aurora",
    tagline: "Votre refuge entre lac et montagnes à Morbegno, Valteline",
    location: "Morbegno (Sondrio) - Valteline, Italie",
    addressFull: "Via Serta 188D, 23017 Morbegno (SO), Italie",
    nav: {
      home: "Accueil",
      house: "Guide Maison",
      places: "Restaurants & Alentours",
      experiences: "Expériences",
      monuments: "Monuments",
      gallery: "Galerie",
      guestbook: "Livre d'or",
      contacts: "Contacts & SOS",
    },
    pwa: {
      installPrompt: "Installez l'application pour accéder au guide hors-ligne pendant votre séjour !",
      installButton: "Installer PWA",
      installed: "Application installée",
      iosInstructions: "Installation sur iPhone & iPad",
      iosStep1: "1. Appuyez sur Partager dans Safari",
      iosStep2: "2. Choisissez 'Sur l'écran d'accueil'",
      close: "Fermer",
      offlineMode: "Mode hors-ligne",
      offlineNotice: "Vous êtes hors-ligne. Le guide reste consultable.",
    },
    quickActions: {
      wifi: "Wi-Fi Maison",
      directions: "Itinéraire",
      callHost: "Appeler Nino",
      whatsapp: "WhatsApp",
      checkInOut: "Arrivée / Départ",
      emergency: "Urgences SOS",
    },
    hero: {
      welcome: "Bienvenue à l'Appartement Aurora",
      greeting: "Nous sommes ravis de vous accueillir à Morbegno !",
      intro: "Votre livret d'accueil digital complet avec les consignes du logement, les meilleurs restaurants traditionnels et les merveilles alpines de la Valteline.",
      checkInTime: "Arrivée : à partir de 14h00 (2 PM)",
      checkOutTime: "Départ : avant 10h00",
      statusReady: "Appartement prêt pour votre séjour",
      viewGuide: "Consulter le guide",
      weatherInMorbegno: "Météo à Morbegno",
      viewGallery: "Voir les photos",
    },
    wifi: {
      title: "Wi-Fi Fibre Rapide",
      subtitle: "Connexion haut débit illimitée incluse",
      network: "Nom du réseau (SSID)",
      password: "Mot de passe",
      copyPassword: "Copier le mot de passe",
      copied: "Copié !",
      scanQr: "Scannez le QR code pour vous connecter",
      speed: "Fibre optique ultra-rapide pour streaming et télétravail",
      troubleshoot: "En cas de coupure, débranchez le routeur du salon pendant 10 secondes.",
    },
    house: {
      title: "Guide de la Maison & Équipements",
      subtitle: "Tout ce qu'il faut savoir pour un séjour confortable",
      checkInTitle: "Arrivée & Accès",
      checkInDesc: "Entrée autonome ou accueil personnalisé. Parking privé gratuit dans la cour.",
      checkOutTitle: "Départ & Consignes",
      checkOutDesc: "Avant 10h00. Déposer les clés sur la table, fermer fenêtres et couper le chauffage.",
      appliancesTitle: "Appareils Électroménagers",
      appliancesSubtitle: "Modes d'emploi rapides",
      rulesTitle: "Règlement Intérieur",
      rulesSubtitle: "Règles simples pour le confort de tous",
      recyclingTitle: "Tri des Déchets",
      recyclingSubtitle: "Aidez-nous à préserver la nature de la Valteline en triant correctement",
      amenitiesTitle: "Équipements Inclus",
      specsTitle: "Caractéristiques du Logement",
    },
    places: {
      title: "Morbegno & Gastronomie",
      subtitle: "Osterias traditionnelles, caves de Bitto, commerces et supermarchés à proximité",
      filterAll: "Tous",
      filterRestaurants: "Restaurants & Auberges",
      filterGroceries: "Supermarchés & Boulangeries",
      filterBars: "Cafés & Petits-déjeuners",
      filterPharmacy: "Pharmacie & Santé",
      filterTransport: "Gare & Parking",
      openMaps: "Ouvrir dans Maps",
      call: "Appeler",
      walkingDistance: "À pied",
    },
    experiences: {
      title: "Activités & Découvertes",
      subtitle: "Vallées alpines, ponts suspendus, pistes cyclables et lac de Côme",
      duration: "Durée conseillée",
      distance: "Distance depuis Aurora",
      tipsTitle: "Conseils de Nino",
      getDirections: "Itinéraire",
    },
    monuments: {
      title: "Monuments & Patrimoine",
      subtitle: "Découvrez le charme historique et culturel de Morbegno",
      heritageBadge: "Patrimoine",
      viewLocation: "Voir sur la carte",
    },
    gallery: {
      title: "Galerie Photos",
      subtitle: "Découvrez les pièces et l'extérieur de l'appartement",
      allPhotos: "Toutes les photos",
    },
    guestbook: {
      title: "Livre d'Or",
      subtitle: "Lisez les avis des voyageurs et laissez un mot sur votre séjour",
      addReview: "Laisser un avis",
      yourName: "Votre Nom",
      yourCountry: "Ville / Pays",
      rating: "Note",
      comment: "Votre message et impressions",
      submit: "Publier mon avis",
      thankYou: "Merci chaleureusement pour votre avis !",
      recentReviews: "Avis des autres voyageurs",
      emptyReviews: "Soyez le premier à laisser un commentaire !",
    },
    contacts: {
      title: "Contacts & Assistance",
      subtitle: "Nous restons disponibles 7j/7 pour vous assister",
      hostName: "Nino - Hôte Appartement Aurora",
      hostRole: "Hôte & Référent local",
      availableHours: "Disponible tous les jours",
      chatWhatsapp: "Contacter sur WhatsApp",
      phoneCall: "Appel direct",
      sendEmail: "Envoyer un e-mail",
      emergencyHeader: "Numéros d'Urgence",
      sosNumber: "Numéro d'urgence européen : 112",
      medicalGuard: "Permanence médicale : 116 117",
      hospital: "Hôpital de Morbegno : +39 0342 607111",
      police: "Gendarmerie (Carabinieri) Morbegno : +39 0342 610210",
      taxi: "Taxi Morbegno : +39 338 1234567",
      pharmacyDuty: "Pharmacie de Garde Morbegno (PharmAround)",
    },
  },
  es: {
    appName: "Apartamento Aurora",
    tagline: "Tu refugio entre lago y montañas en Morbegno, Valtellina",
    location: "Morbegno (Sondrio) - Valtellina, Italia",
    addressFull: "Via Serta 188D, 23017 Morbegno (SO), Italia",
    nav: {
      home: "Inicio",
      house: "Guía Casa",
      places: "Restaurantes & Zona",
      experiences: "Experiencias",
      monuments: "Monumentos",
      gallery: "Galería",
      guestbook: "Libro de Visitas",
      contacts: "Contactos & SOS",
    },
    pwa: {
      installPrompt: "¡Instala la App para consultar la guía sin conexión durante tu estancia!",
      installButton: "Instalar PWA",
      installed: "App Instalada",
      iosInstructions: "Instalación en iPhone y iPad",
      iosStep1: "1. Toca el botón Compartir en Safari",
      iosStep2: "2. Selecciona 'Añadir a pantalla de inicio'",
      close: "Cerrar",
      offlineMode: "Modo sin conexión",
      offlineNotice: "Estás sin conexión. Toda la guía sigue estando disponible.",
    },
    quickActions: {
      wifi: "Wi-Fi Casa",
      directions: "Cómo Llegar",
      callHost: "Llamar a Nino",
      whatsapp: "WhatsApp",
      checkInOut: "Llegada / Salida",
      emergency: "Emergencias SOS",
    },
    hero: {
      welcome: "Bienvenidos al Apartamento Aurora",
      greeting: "¡Encantados de hospedaros en Morbegno!",
      intro: "Tu guía digital completa con instrucciones de la casa, los mejores restaurantes con pizzoccheri tradicionales y excursiones por los Alpes de Valtellina.",
      checkInTime: "Llegada: a partir de las 14:00 (2 PM)",
      checkOutTime: "Salida: antes de las 10:00",
      statusReady: "Apartamento preparado para tu estancia",
      viewGuide: "Ver Guía de la Casa",
      weatherInMorbegno: "El tiempo en Morbegno",
      viewGallery: "Ver Galería de Fotos",
    },
    wifi: {
      title: "Wi-Fi Fibra Rápida",
      subtitle: "Conexión a internet ilimitada de alta velocidad incluida",
      network: "Nombre de Red (SSID)",
      password: "Contraseña",
      copyPassword: "Copiar Contraseña",
      copied: "¡Copiada!",
      scanQr: "Escanea el código QR para conectarte al instante",
      speed: "Fibra de alta velocidad ideal para streaming y teletrabajo",
      troubleshoot: "En caso de cortes, reinicie el router del salón desconectándolo 10 segundos.",
    },
    house: {
      title: "Guía de la Casa & Electrodomésticos",
      subtitle: "Todo lo necesario para una estancia cómoda y agradable",
      checkInTitle: "Llegada & Entrada",
      checkInDesc: "Entrada autónoma o recibimiento personal. Parking privado gratuito en el patio.",
      checkOutTitle: "Salida & Instrucciones",
      checkOutDesc: "Antes de las 10:00. Dejar las llaves en la mesa, cerrar ventanas y apagar la calefacción.",
      appliancesTitle: "Electrodomésticos",
      appliancesSubtitle: "Instrucciones de uso",
      rulesTitle: "Normas de la Casa",
      rulesSubtitle: "Indicaciones para el cuidado y disfrute del apartamento",
      recyclingTitle: "Reciclaje de Residuos",
      recyclingSubtitle: "Ayúdanos a proteger el medio ambiente de Valtellina separando la basura",
      amenitiesTitle: "Equipamiento Incluido",
      specsTitle: "Ficha del Apartamento",
    },
    places: {
      title: "Morbegno & Gastronomía",
      subtitle: "Tabernas típicas, bodegas históricas de queso Bitto, tiendas y supermercados cercanos",
      filterAll: "Todos",
      filterRestaurants: "Restaurantes & Tabernas",
      filterGroceries: "Supermercados & Alimentación",
      filterBars: "Cafeterías & Desayunos",
      filterPharmacy: "Farmacia & Salud",
      filterTransport: "Estación de Tren & Parking",
      openMaps: "Ver en Google Maps",
      call: "Llamar",
      walkingDistance: "A pie",
    },
    experiences: {
      title: "Excursiones en Valtellina",
      subtitle: "Valles alpinos, puentes colgantes, rutas en bici y el Lago de Como",
      duration: "Tiempo recomendado",
      distance: "Distancia desde Aurora",
      tipsTitle: "Consejos de Nino",
      getDirections: "Cómo llegar",
    },
    monuments: {
      title: "Monumentos Históricos",
      subtitle: "Descubre el patrimonio cultural y monumental de Morbegno",
      heritageBadge: "Patrimonio",
      viewLocation: "Ver en el mapa",
    },
    gallery: {
      title: "Galería de Fotos",
      subtitle: "Descubre el interior y exterior del Apartamento Aurora",
      allPhotos: "Todas las fotos",
    },
    guestbook: {
      title: "Libro de Visitas",
      subtitle: "Lee los comentarios de otros huéspedes y comparte tu experiencia",
      addReview: "Escribir reseña",
      yourName: "Tu Nombre",
      yourCountry: "Ciudad / País",
      rating: "Valoración",
      comment: "Tu comentario sobre la casa y Morbegno",
      submit: "Publicar reseña",
      thankYou: "¡Muchas gracias por tu comentario!",
      recentReviews: "Opiniones de otros viajeros",
      emptyReviews: "¡Sé el primero en dejar una reseña!",
    },
    contacts: {
      title: "Contactos & Asistencia",
      subtitle: "Estamos a tu disposición durante toda tu estancia",
      hostName: "Nino - Anfitrión Apartamento Aurora",
      hostRole: "Anfitrión & Contacto local",
      availableHours: "Disponible todos los días",
      chatWhatsapp: "Escribir por WhatsApp",
      phoneCall: "Llamada directa",
      sendEmail: "Enviar email",
      emergencyHeader: "Números de Emergencia",
      sosNumber: "Emergencias Europeo: 112",
      medicalGuard: "Atención médica continuada: 116 117",
      hospital: "Hospital de Morbegno: +39 0342 607111",
      police: "Centro de Mando Carabinieri Morbegno: +39 0342 610210",
      taxi: "Taxi Morbegno: +39 338 1234567",
      pharmacyDuty: "Farmacia de Guardia Morbegno (PharmAround)",
    },
  },
};
