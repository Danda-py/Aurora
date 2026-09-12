import { Language } from '../types';

export interface VideoTranslationSchema {
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
    copyPassword?: string;
    backToMenu: string;
    openWhatsApp: string;
    rateGoogle: string;
    rateWebsite: string;
  };
  gridMenu: {
    categories: {
      home: string;
      food: string;
      explore: string;
    };
    descriptions: {
      benvenuto: string;
      check_in: string;
      wifi: string;
      servizi: string;
      regole: string;
      check_out: string;
      ristoranti: string;
      bar_club: string;
      shopping: string;
      attivita: string;
      posizione: string;
      trasporti: string;
      informazioni: string;
      emergenza: string;
      contatti: string;
    };
    welcomeTag: string;
    apartmentName: string;
    apartmentSubtitle: string;
    pamperingTitle: string;
    pamperingSubtitle: string;
    readyForYou: string;
    freeCoffee: string;
    reservedParking: string;
    smartAccess: string;
    wifiGigabit: string;
    password: string;
    keys: string;
    smartAccessLabel: string;
    car: string;
    parking: string;
    guideSectionTitle: string;
    gridView: string;
    listView: string;
    footerAddress: string;
    footerValtellina: string;
    footerTagline: string;
  };
  concierge: {
    guestCount: string;
    from: string;
    by: string;
    doorOpeningState: {
      opening: string;
      success: string;
      error: string;
      idle: string;
    };
    doorMessage: {
      sending: string;
      unlocked: string;
    };
    nudge: {
      checkoutTitle: string;
      checkoutSub: string;
    };
    sheets: {
      wifiCopiedNotice: string;
      wifiScanNotice: string;
      showQr: string;
      copyPwd: string;
      scheduleEyebrow: string;
      scheduleTitle: string;
      quietHours: string;
      houseLabel: string;
      luggageEyebrow: string;
      luggageTitle: string;
      luggageDesc: string;
      askNino: string;
    };
    changeLanguage: string;
    close: string;
    welcomeCity: string;
  };
  checkInPage: {
    wifi: {
      requiredNotice: string;
      explain: string;
      notConnectedError: string;
      copyPwd: string;
      verifying: string;
      verifiedLabel: string;
      rescanBtn: string;
      openBtn: string;
      wifiRequiredBtn: string;
      checkingConnection: string;
      connected: string;
      copySuccess: string;
      pressToUnlockNotice: string;
    };
    smartHomeAccess: string;
    frontDoor: string;
    authorizedNetwork: string;
    connectToNetwork: string;
    publicNoticeTitle: string;
    publicNoticeDesc: string;
    inPersonWelcome: string;
    keyIntroDesc: string;
    whatsappArrivalMsg: string;
    shareArrivalBtn: string;
    reservedCourtyardParking: string;
  };
  rulesPage: {
    ruleLabel: string;
  };
  locationPage: {
    officialAddress: string;
    startGps: string;
  };
  contactsPage: {
    supportEmail: string;
  };
  emergencyPage: {
    singleEuNumberTitle: string;
    singleEuNumberSubtitle: string;
  };
  infoPage: {
    pharmacyService: {
      title: string;
      desc: string;
    };
    wasteRecycling: string;
  };
  langSelect: {
    badge: string;
    subtitle: string;
    secureAccess: string;
  };
  aiChat: {
    welcomeMessage: string;
    unsupportedImageFormat: string;
    imageTooLarge: string;
    responseError: string;
    unavailableError: string;
    title: string;
    subtitle: string;
    closeLabel: string;
    attachedPhotoAlt: string;
    thinking: string;
    photoReady: string;
    removePhoto: string;
    attachPhoto: string;
    placeholder: string;
    sendQuestion: string;
  };
  smartLock: {
    title: string;
    subtitle: string;
    registeredGuest: string;
    activeStatus: string;
    checkingWifi: string;
    casaAuroraNetwork: string;
    requiredNetwork: string;
    checkingInProgress: string;
    connectedToCasaAurora: string;
    connectToCasaAurora: string;
    rescanTitle: string;
    openingInProgress: string;
    doorUnlocked: string;
    pushDoorToEnter: string;
    connectionError: string;
    tapToRetry: string;
    pressToOpen: string;
    waitAMoment: string;
    verifiedByServer: string;
    physicalKeyNotice: string;
    closeWindow: string;
    openDoorBtn: string;
  };
  staySummary: {
    activeStay: string;
    upcomingStay: string;
    completedStay: string;
    guest: string;
    status: string;
    confirmed: string;
    inProgress: string;
    completed: string;
    mainDoorOpening: string;
    active24h: string;
    openDoorInstructions: string;
    checkInFrom: string;
    checkOutBy: string;
    reservedParkingTitle: string;
    reservedParkingDesc: string;
    needSomethingTitle: string;
    needSomethingDesc: string;
    writeHostWhatsapp: string;
    stayTitle: string;
    staySubtitle: string;
  };
  boardingPass: {
    headerTitle: string;
    headerSub: string;
    statusActive: string;
    statusConfirmed: string;
    statusCompleted: string;
    collapseCard: string;
    expandCard: string;
    guestLabel: string;
    suiteLabel: string;
    suiteValue: string;
    countdownArrival: string;
    stayDuration: string;
    fromTime: string;
    byTime: string;
    smartLockTitle: string;
    smartLockSub: string;
    parkingTitle: string;
    parkingBadge: string;
    wifiTitle: string;
    wifiBadge: string;
    conciergeTitle: string;
    conciergeBadge: string;
  };
  expiredPass: {
    headerSub: string;
    badge: string;
    title: string;
    message: string;
    stayDates: string;
    linkStatus: string;
    disabledForSecurity: string;
    rebookBtn: string;
    generalGuide: string;
    insertAnotherPass: string;
  };
}

export const VIDEO_TRANSLATIONS: Record<Language, VideoTranslationSchema> = {
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
      copyPassword: "Copia Password",
      backToMenu: "MENU",
      openWhatsApp: "Scrivici su WhatsApp",
      rateGoogle: "VALUTA SU GOOGLE",
      rateWebsite: "VALUTA SUL SITO WEB",
      checkoutLabel: "Check-out {time}",
      openHostPortal: "Apri Portale Esterno nel Browser"
    },
    gridMenu: {
      categories: {
        home: "La Casa & Servizi",
        food: "Sapori di Valtellina",
        explore: "Esplorare & Utilità"
      },
      descriptions: {
        benvenuto: "La tua casa a Morbegno e la nostra accoglienza",
        check_in: "Accesso con smart lock e consegna chiavi",
        wifi: "Fibra ad alta velocità e codice rapido",
        servizi: "Elettrodomestici, riscaldamento e raccolta differenziata",
        regole: "Poche e semplici attenzioni per il massimo relax",
        check_out: "Partenza serena entro le ore 10:00",
        ristoranti: "I veri crotti tipici e i pizzoccheri fatti a mano",
        bar_club: "Colazioni con brioches fresche, aperitivi e vini locali",
        shopping: "Botteghe storiche del Bitto, bresaola e botteghe di Morbegno",
        attivita: "Sentiero Valtellina, Val Gerola e passeggiate panoramiche",
        posizione: "Via Serta 188D e posto auto privato",
        trasporti: "Stazione ferroviaria di Morbegno, bus e noleggio bici",
        informazioni: "Cosa sapere su Morbegno e orari utili",
        emergenza: "Farmacie di turno, guardia medica e numeri rapidi",
        contatti: "Parla direttamente con Nino per ogni esigenza"
      },
      welcomeTag: "BENVENUTI",
      apartmentName: "Appartamento Aurora",
      apartmentSubtitle: "La tua sosta serena a Morbegno • Tutto ciò che ti serve a portata di mano",
      pamperingTitle: "Piccole attenzioni per il tuo soggiorno",
      pamperingSubtitle: "Tutto preparato con cura per farti rilassare",
      readyForYou: "Pronto per te",
      freeCoffee: "Caffè & tisane in omaggio",
      reservedParking: "Posto auto riservato",
      smartAccess: "Accesso smart e sicuro",
      wifiGigabit: "Wi-Fi Fibra 1 Gbit",
      password: "Password",
      keys: "Chiavi",
      smartAccessLabel: "Accesso smart",
      car: "Auto",
      parking: "Posto Auto",
      guideSectionTitle: "Guida della Casa & Territorio",
      gridView: "Visualizzazione Griglia",
      listView: "Visualizzazione Lista",
      footerAddress: "Via Serta 188D, Morbegno (SO)",
      footerValtellina: "Valtellina",
      footerTagline: "Aurora in Valtellina • Accoglienza serena e sincera"
    },
    concierge: {
      guestCount: "N. Ospiti",
      from: "dalle",
      by: "entro le",
      doorOpeningState: {
        opening: "Apertura in corso...",
        success: "Portone aperto!",
        error: "Riprova: tieni premuto",
        idle: "Tieni premuto per aprire"
      },
      doorMessage: {
        sending: "Invio comando a Home Assistant...",
        unlocked: "Portone sbloccato. Spingi la porta per entrare."
      },
      nudge: {
        checkoutTitle: "Check-out entro le",
        checkoutSub: "Vuoi lasciare i bagagli o richiedere supporto?"
      },
      sheets: {
        wifiCopiedNotice: "Password copiata negli appunti.",
        wifiScanNotice: "Scansiona il QR o copia la password.",
        showQr: "Mostra QR Wi-Fi",
        copyPwd: "Copia password",
        scheduleEyebrow: "Ritmo del soggiorno",
        scheduleTitle: "Orari & regole essenziali",
        quietHours: "silenzio e rispetto del vicinato",
        houseLabel: "Casa",
        luggageEyebrow: "Flessibilità",
        luggageTitle: "Deposito bagagli",
        luggageDesc: "Scrivi all'host per concordare il deposito prima del check-in o dopo il check-out.",
        askNino: "Chiedi a Nino"
      },
      changeLanguage: "Cambia lingua",
      close: "Chiudi",
      welcomeCity: "Benvenuto a Morbegno."
    },
    checkInPage: {
      wifi: {
        requiredNotice: "Rete richiesta: Casa_Aurora",
        explain: "L'apriporta funziona esclusivamente quando sei collegato al Wi-Fi dell'appartamento.",
        notConnectedError: "Accesso negato: Devi essere connesso alla rete Wi-Fi di casa (Casa_Aurora) per azionare l'apriporta.",
        copyPwd: "Copia password Wi-Fi",
        verifying: "Verifica Wi-Fi Casa_Aurora in corso...",
        verifiedLabel: "Wi-Fi Casa_Aurora Rilevato",
        rescanBtn: "Riprova Rilevamento",
        openBtn: "APRI PORTA",
        wifiRequiredBtn: "Connettiti a Casa_Aurora per Aprire",
        checkingConnection: "Verifica Connessione",
        connected: "Connesso",
        copySuccess: "Copiata!",
        pressToUnlockNotice: "Tocca il pulsante per azionare l'elettroserratura all'arrivo"
      },
      smartHomeAccess: "Accesso Smart Home",
      frontDoor: "Portoncino d'Ingresso",
      authorizedNetwork: "Rete autorizzata per apertura sicura",
      connectToNetwork: "Collegati alla rete \"Casa_Aurora\"",
      publicNoticeTitle: "Apertura Smart Lock",
      publicNoticeDesc: "L'apertura smart lock del portoncino è abilitata solo per gli ospiti con pass personale attivo. All'arrivo le chiavi vi verranno consegnate di persona dall'host Nino.",
      inPersonWelcome: "Accoglienza calorosa di persona dal vostro host Nino",
      keyIntroDesc: "Consegna chiavi tradizionali e breve introduzione alla casa.",
      whatsappArrivalMsg: "Ciao Nino, siamo in viaggio verso Aurora in Valtellina! Il nostro arrivo stimato è per le ore...",
      shareArrivalBtn: "Comunica Orario di Arrivo su WhatsApp",
      reservedCourtyardParking: "Posto auto riservato in cortile"
    },
    rulesPage: {
      ruleLabel: "REGOLA #"
    },
    locationPage: {
      officialAddress: "Indirizzo Ufficiale",
      startGps: "Avvia Navigatore GPS"
    },
    contactsPage: {
      supportEmail: "Email Assistenza"
    },
    emergencyPage: {
      singleEuNumberTitle: "Numero Unico Europeo Emergenze",
      singleEuNumberSubtitle: "Ambulanza, Vigili del Fuoco, Carabinieri, Polizia"
    },
    infoPage: {
      pharmacyService: {
        title: "FARMACIA DI TURNO",
        desc: "Consulta disponibilità, orari e indicazioni aggiornati in tempo reale"
      },
      wasteRecycling: "Raccolta Differenziata"
    },
    langSelect: {
      badge: "Guida Digitale & Concierge",
      subtitle: "Il tuo soggiorno nel cuore delle Alpi",
      secureAccess: "Accesso ospiti protetto e sicuro"
    },
    aiChat: {
      welcomeMessage: 'Ciao, sono Aurora AI. Posso aiutarti con l\'appartamento, Morbegno e le esperienze in Valtellina.',
      unsupportedImageFormat: 'Formato immagine non supportato. Usa JPG, PNG, WEBP o HEIC.',
      imageTooLarge: 'La foto è troppo grande. Allega un\'immagine sotto i 6MB.',
      responseError: 'Impossibile ricevere una risposta.',
      unavailableError: 'Aurora AI non è disponibile al momento.',
      title: 'Aurora AI',
      subtitle: 'Concierge digitale',
      closeLabel: 'Chiudi Aurora AI',
      attachedPhotoAlt: 'Foto allegata',
      thinking: 'Aurora AI sta pensando...',
      photoReady: 'Foto pronta per l\'invio',
      removePhoto: 'Rimuovi foto',
      attachPhoto: 'Allega foto',
      placeholder: 'Chiedi di Morbegno, esperienze o Aurora',
      sendQuestion: 'Invia domanda'
    },
    smartLock: {
      title: 'Home Key Digitale',
      subtitle: 'Appartamento Aurora • Morbegno',
      registeredGuest: 'Ospite Registrato',
      activeStatus: 'Attivo',
      checkingWifi: 'Verifica Wi-Fi...',
      casaAuroraNetwork: 'Rete Casa_Aurora',
      requiredNetwork: 'Rete richiesta',
      checkingInProgress: 'Rilevamento in corso',
      connectedToCasaAurora: 'Connesso a Casa_Aurora',
      connectToCasaAurora: 'Collegati a Casa_Aurora',
      rescanTitle: 'Riprova rilevamento Wi-Fi',
      openingInProgress: 'Apertura in corso...',
      doorUnlocked: 'Portone Aperto!',
      pushDoorToEnter: 'Spingi la porta per entrare',
      connectionError: 'Errore connessione',
      tapToRetry: 'Tocca per riprovare',
      pressToOpen: 'TIENI PREMUTO PER APRIRE',
      waitAMoment: 'Attendi un momento',
      verifiedByServer: 'La sicurezza viene verificata dal server',
      physicalKeyNotice: 'All\'interno troverai anche il mazzo di chiavi tradizionali.',
      closeWindow: 'Chiudi finestra',
      openDoorBtn: 'APRI PORTA'
    },
    staySummary: {
      activeStay: 'Soggiorno attivo',
      upcomingStay: 'Arrivo',
      completedStay: 'Soggiorno completato',
      guest: 'Ospite',
      status: 'Stato',
      confirmed: 'Confermato',
      inProgress: 'In corso',
      completed: 'Concluso',
      mainDoorOpening: 'Apertura Portone Principale',
      active24h: 'Attivo 24h',
      openDoorInstructions: 'Tocca il pulsante per azionare l\'apertura del portoncino d\'ingresso.',
      checkInFrom: 'dalle ore',
      checkOutBy: 'entro le ore',
      reservedParkingTitle: 'Posto Auto Riservato',
      reservedParkingDesc: 'Il tuo parcheggio privato è situato all\'interno della proprietà in Via Serta 188D. Gratuito e utilizzabile liberamente per tutto il soggiorno.',
      needSomethingTitle: 'Ti serve qualcosa?',
      needSomethingDesc: 'Abbiamo preparato caffè, tisane e biancheria fresca per farti rilassare. Se hai bisogno di consigli o altro, Nino è a disposizione.',
      writeHostWhatsapp: 'Scrivi all\'Host Nino su WhatsApp',
      stayTitle: 'Il Tuo Soggiorno ad Aurora',
      staySubtitle: 'Dettagli prenotazione & chiavi'
    },
    boardingPass: {
      headerTitle: 'VIP BOARDING PASS • ESPERIENZA SUITE',
      headerSub: 'Aurora in Valtellina • Morbegno',
      statusActive: 'ATTIVO',
      statusConfirmed: 'CONFERMATO',
      statusCompleted: 'CONCLUSO',
      collapseCard: 'Riduci scheda',
      expandCard: 'Espandi scheda',
      guestLabel: 'Nome Ospite / Guest',
      suiteLabel: 'Alloggio Riservato',
      suiteValue: 'Suite Aurora • 70 m² con Parcheggio',
      countdownArrival: 'COUNTDOWN ALL\'ARRIVO',
      stayDuration: 'TEMPO DI SOGGIORNO',
      fromTime: 'dalle',
      byTime: 'entro le',
      smartLockTitle: 'INGRESSO CON SMART LOCK',
      smartLockSub: 'Apertura porta con 1 tocco',
      parkingTitle: 'Parcheggio Privato',
      parkingBadge: 'Riservato 24/7',
      wifiTitle: 'Wi-Fi Fibra',
      wifiBadge: 'Connetti Rapido',
      conciergeTitle: 'Concierge Nino',
      conciergeBadge: 'Chat WhatsApp'
    },
    expiredPass: {
      headerSub: 'Morbegno • Soggiorno Concluso',
      badge: 'PASS DIGITALE SCADUTO',
      title: 'Grazie della visita',
      message: 'Il tuo pass digitale e la chiave smart per l\'Appartamento Aurora erano attivi per il soggiorno concluso il',
      stayDates: 'Date soggiorno:',
      linkStatus: 'Stato link:',
      disabledForSecurity: 'Disattivato per sicurezza',
      rebookBtn: 'Prenota di nuovo su Bed-and-Breakfast.it',
      generalGuide: 'Guida generale',
      insertAnotherPass: 'Inserisci altro pass'
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
      copyPassword: "Copy Password",
      backToMenu: "MENU",
      openWhatsApp: "Chat on WhatsApp",
      rateGoogle: "REVIEW ON GOOGLE",
      rateWebsite: "REVIEW ON WEBSITE"
    },
    gridMenu: {
      categories: {
        home: "The Apartment & Services",
        food: "Flavors of Valtellina",
        explore: "Explore & Utilities"
      },
      descriptions: {
        benvenuto: "Your home in Morbegno and our warm hospitality",
        check_in: "Smart lock access and key handover",
        wifi: "High-speed fiber and instant Wi-Fi copy",
        servizi: "Appliances, heating and waste recycling",
        regole: "Simple house rules for maximum relaxation",
        check_out: "Smooth check-out before 10:00 AM",
        ristoranti: "Authentic local crotti and handmade pizzoccheri",
        bar_club: "Fresh breakfast, aperitivo and local wines",
        shopping: "Historic Bitto cheese and artisan bresaola shops",
        attivita: "Sentiero Valtellina, Val Gerola and scenic trails",
        posizione: "Via Serta 188D and private parking space",
        trasporti: "Morbegno train station, local buses and bike rental",
        informazioni: "Key facts about Morbegno and local services",
        emergenza: "On-duty pharmacies, urgent care and emergency numbers",
        contatti: "Direct contact with Nino for any needs"
      },
      welcomeTag: "WELCOME",
      apartmentName: "Appartamento Aurora",
      apartmentSubtitle: "Your peaceful stay in Morbegno • Everything you need at your fingertips",
      pamperingTitle: "Little touches for your stay",
      pamperingSubtitle: "Everything carefully prepared for your relaxation",
      readyForYou: "Ready for you",
      freeCoffee: "Complimentary coffee & tea",
      reservedParking: "Reserved parking space",
      smartAccess: "Smart & secure access",
      wifiGigabit: "1 Gbit Fiber Wi-Fi",
      password: "Password",
      keys: "Keys",
      smartAccessLabel: "Smart access",
      car: "Car",
      parking: "Parking Space",
      guideSectionTitle: "Home & Local Guide",
      gridView: "Grid View",
      listView: "List View",
      footerAddress: "Via Serta 188D, Morbegno (SO)",
      footerValtellina: "Valtellina",
      footerTagline: "Aurora in Valtellina • Warm & serene hospitality"
    },
    concierge: {
      guestCount: "Guests",
      from: "from",
      by: "by",
      doorOpeningState: {
        opening: "Opening in progress...",
        success: "Door unlocked!",
        error: "Retry: press & hold",
        idle: "Press & hold to open"
      },
      doorMessage: {
        sending: "Sending command to Home Assistant...",
        unlocked: "Door unlocked. Push the door to enter."
      },
      nudge: {
        checkoutTitle: "Check-out by",
        checkoutSub: "Want to store luggage or need assistance?"
      },
      sheets: {
        wifiCopiedNotice: "Password copied to clipboard.",
        wifiScanNotice: "Scan the QR code or copy the password.",
        showQr: "Show Wi-Fi QR",
        copyPwd: "Copy password",
        scheduleEyebrow: "Stay Rhythm",
        scheduleTitle: "Essential hours & rules",
        quietHours: "quiet and respect for neighbors",
        houseLabel: "House",
        luggageEyebrow: "Flexibility",
        luggageTitle: "Luggage storage",
        luggageDesc: "Contact host to arrange luggage drop before check-in or after check-out.",
        askNino: "Ask Nino"
      },
      changeLanguage: "Change language",
      close: "Close",
      welcomeCity: "Welcome to Morbegno."
    },
    checkInPage: {
      wifi: {
        requiredNotice: "Required Network: Casa_Aurora",
        explain: "Door opener works exclusively when connected to the apartment Wi-Fi.",
        notConnectedError: "Access denied: You must be connected to the home Wi-Fi network (Casa_Aurora) to open the door.",
        copyPwd: "Copy Wi-Fi password",
        verifying: "Checking Casa_Aurora Wi-Fi connection...",
        verifiedLabel: "Casa_Aurora Wi-Fi Verified",
        rescanBtn: "Retry Scan",
        openBtn: "OPEN DOOR",
        wifiRequiredBtn: "Connect to Casa_Aurora to Open",
        checkingConnection: "Checking Connection",
        connected: "Connected",
        copySuccess: "Copied!",
        pressToUnlockNotice: "Tap button to trigger the electric lock upon arrival"
      },
      smartHomeAccess: "Smart Home Access",
      frontDoor: "Front Door",
      authorizedNetwork: "Authorized network for secure unlocking",
      connectToNetwork: "Connect to network \"Casa_Aurora\"",
      publicNoticeTitle: "Smart Lock Opening",
      publicNoticeDesc: "Smart lock door opening is enabled only for guests with an active personal pass. Upon arrival, physical keys will be handed over in person by your host Nino.",
      inPersonWelcome: "Warm in-person welcome from your host Nino",
      keyIntroDesc: "Handover of traditional keys and quick home tour.",
      whatsappArrivalMsg: "Hello Nino, we are on our way to Aurora in Valtellina! Our estimated arrival time is...",
      shareArrivalBtn: "Share Arrival Time on WhatsApp",
      reservedCourtyardParking: "Reserved courtyard parking space"
    },
    rulesPage: {
      ruleLabel: "RULE #"
    },
    locationPage: {
      officialAddress: "Official Address",
      startGps: "Start GPS Navigation"
    },
    contactsPage: {
      supportEmail: "Support Email"
    },
    emergencyPage: {
      singleEuNumberTitle: "European Emergency Number",
      singleEuNumberSubtitle: "Ambulance, Fire Dept, Police & Rescue"
    },
    infoPage: {
      pharmacyService: {
        title: "ON-DUTY PHARMACY",
        desc: "Check live availability, opening hours, and directions"
      },
      wasteRecycling: "Waste Recycling"
    },
    langSelect: {
      badge: "Digital Guide & Concierge",
      subtitle: "Your stay in the heart of the Alps",
      secureAccess: "Protected and secure guest access"
    },
    aiChat: {
      welcomeMessage: 'Hi, I am Aurora AI. I can help you with the apartment, Morbegno and Valtellina experiences.',
      unsupportedImageFormat: 'Unsupported image format. Use JPG, PNG, WEBP or HEIC.',
      imageTooLarge: 'Photo is too large. Attach an image under 6MB.',
      responseError: 'Unable to receive a response.',
      unavailableError: 'Aurora AI is currently unavailable.',
      title: 'Aurora AI',
      subtitle: 'Digital Concierge',
      closeLabel: 'Close Aurora AI',
      attachedPhotoAlt: 'Attached photo',
      thinking: 'Aurora AI is thinking...',
      photoReady: 'Photo ready to send',
      removePhoto: 'Remove photo',
      attachPhoto: 'Attach photo',
      placeholder: 'Ask about Morbegno, experiences or Aurora',
      sendQuestion: 'Send question'
    },
    smartLock: {
      title: 'Digital Home Key',
      subtitle: 'Aurora Apartment • Morbegno',
      registeredGuest: 'Registered Guest',
      activeStatus: 'Active',
      checkingWifi: 'Checking Wi-Fi...',
      casaAuroraNetwork: 'Casa_Aurora Network',
      requiredNetwork: 'Required network',
      checkingInProgress: 'Detection in progress',
      connectedToCasaAurora: 'Connected to Casa_Aurora',
      connectToCasaAurora: 'Connect to Casa_Aurora',
      rescanTitle: 'Retry Wi-Fi scan',
      openingInProgress: 'Opening in progress...',
      doorUnlocked: 'Door Unlocked!',
      pushDoorToEnter: 'Push the door to enter',
      connectionError: 'Connection error',
      tapToRetry: 'Tap to retry',
      pressToOpen: 'PRESS & HOLD TO OPEN',
      waitAMoment: 'Wait a moment',
      verifiedByServer: 'Security is being verified by the server',
      physicalKeyNotice: 'Inside you will also find traditional keys.',
      closeWindow: 'Close window',
      openDoorBtn: 'OPEN DOOR'
    },
    staySummary: {
      activeStay: 'Active stay',
      upcomingStay: 'Arrival',
      completedStay: 'Stay completed',
      guest: 'Guest',
      status: 'Status',
      confirmed: 'Confirmed',
      inProgress: 'In progress',
      completed: 'Completed',
      mainDoorOpening: 'Main Door Unlock',
      active24h: '24/7 Active',
      openDoorInstructions: 'Tap the button to unlock the front door.',
      checkInFrom: 'from',
      checkOutBy: 'by',
      reservedParkingTitle: 'Reserved Parking Space',
      reservedParkingDesc: 'Your private parking space is located inside the property at Via Serta 188D. Free for your whole stay.',
      needSomethingTitle: 'Need anything?',
      needSomethingDesc: 'We provided coffee, teas and fresh linens for your relaxation. If you need any tips, Nino is available.',
      writeHostWhatsapp: 'Chat with Host Nino on WhatsApp',
      stayTitle: 'Your Stay at Aurora',
      staySubtitle: 'Booking details & keys'
    },
    boardingPass: {
      headerTitle: 'VIP BOARDING PASS • SUITE EXPERIENCE',
      headerSub: 'Aurora in Valtellina • Morbegno',
      statusActive: 'ACTIVE',
      statusConfirmed: 'CONFIRMED',
      statusCompleted: 'COMPLETED',
      collapseCard: 'Collapse card',
      expandCard: 'Expand card',
      guestLabel: 'Guest Name',
      suiteLabel: 'Reserved Accommodation',
      suiteValue: 'Suite Aurora • 70 m² with Parking',
      countdownArrival: 'COUNTDOWN TO ARRIVAL',
      stayDuration: 'STAY DURATION',
      fromTime: 'from',
      byTime: 'by',
      smartLockTitle: 'SMART LOCK ACCESS',
      smartLockSub: '1-tap door unlock',
      parkingTitle: 'Private Parking',
      parkingBadge: 'Reserved 24/7',
      wifiTitle: 'Fiber Wi-Fi',
      wifiBadge: 'Quick Connect',
      conciergeTitle: 'Concierge Nino',
      conciergeBadge: 'WhatsApp Chat'
    },
    expiredPass: {
      headerSub: 'Morbegno • Stay Completed',
      badge: 'EXPIRED DIGITAL PASS',
      title: 'Thank you for visiting',
      message: 'Your digital pass and smart key for Aurora Apartment were active for the stay that ended on',
      stayDates: 'Stay dates:',
      linkStatus: 'Link status:',
      disabledForSecurity: 'Deactivated for security',
      rebookBtn: 'Book again on Bed-and-Breakfast.it',
      generalGuide: 'General guide',
      insertAnotherPass: 'Enter another pass'
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
      copyPassword: "Passwort Kopieren",
      backToMenu: "MENÜ",
      openWhatsApp: "Auf WhatsApp schreiben",
      rateGoogle: "AUF GOOGLE BEWERTEN",
      rateWebsite: "AUF DER WEBSITE BEWERTEN"
    },
    gridMenu: {
      categories: {
        home: "Die Wohnung & Services",
        food: "Geschmäcker des Veltlins",
        explore: "Erkunden & Nützliches"
      },
      descriptions: {
        benvenuto: "Ihr Zuhause in Morbegno und unser herzlicher Empfang",
        check_in: "Smart-Lock-Zugang und Schlüsselübergabe",
        wifi: "Highspeed-Glasfaser und schneller WLAN-Code",
        servizi: "Haushaltsgeräte, Heizung und Mülltrennung",
        regole: "Einfache Hausregeln für maximale Entspannung",
        check_out: "Entspannte Abreise bis 10:00 Uhr",
        ristoranti: "Traditionelle Crotti und hausgemachte Pizzoccheri",
        bar_club: "Frühstück mit frischen Croissants, Aperitifs und Weine",
        shopping: "Historische Bitto- und Bresaola-Feinkostläden",
        attivita: "Sentiero Valtellina, Val Gerola und Panoramawanderungen",
        posizione: "Via Serta 188D und privater Parkplatz",
        trasporti: "Bahnhof Morbegno, Busse und Fahrradverleih",
        informazioni: "Wichtiges über Morbegno und Öffnungszeiten",
        emergenza: "Notapotheken, ärztlicher Notdienst und Notrufnummern",
        contatti: "Direkter Kontakt zu Nino für alle Anliegen"
      },
      welcomeTag: "WILLKOMMEN",
      apartmentName: "Appartamento Aurora",
      apartmentSubtitle: "Ihr ruhiger Aufenthalt in Morbegno • Alles was Sie brauchen zur Hand",
      pamperingTitle: "Kleine Aufmerksamkeiten für Ihren Aufenthalt",
      pamperingSubtitle: "Alles sorgfältig vorbereitet für Ihre Entspannung",
      readyForYou: "Bereit für Sie",
      freeCoffee: "Kostenloser Kaffee & Tee",
      reservedParking: "Reservierter Parkplatz",
      smartAccess: "Smarter & sicherer Zugang",
      wifiGigabit: "1 Gbit Glasfaser-WLAN",
      password: "Passwort",
      keys: "Schlüssel",
      smartAccessLabel: "Smarter Zugang",
      car: "Auto",
      parking: "Parkplatz",
      guideSectionTitle: "Haus- & Reiseführer",
      gridView: "Rasteransicht",
      listView: "Listenansicht",
      footerAddress: "Via Serta 188D, Morbegno (SO)",
      footerValtellina: "Valtellina",
      footerTagline: "Aurora in Valtellina • Herzliche & ruhige Gastfreundschaft"
    },
    concierge: {
      guestCount: "Gäste",
      from: "ab",
      by: "bis",
      doorOpeningState: {
        opening: "Wird geöffnet...",
        success: "Tür geöffnet!",
        error: "Erneut versuchen: gedrückt halten",
        idle: "Gedrückt halten zum Öffnen"
      },
      doorMessage: {
        sending: "Befehl an Home Assistant wird gesendet...",
        unlocked: "Tür entriegelt. Tür aufdrücken zum Eintreten."
      },
      nudge: {
        checkoutTitle: "Check-out bis",
        checkoutSub: "Gepäck aufbewahren oder Hilfe benötigt?"
      },
      sheets: {
        wifiCopiedNotice: "Passwort in die Zwischenablage kopiert.",
        wifiScanNotice: "QR-Code scannen oder Passwort kopieren.",
        showQr: "WLAN-QR anzeigen",
        copyPwd: "Passwort kopieren",
        scheduleEyebrow: "Rhythmus des Aufenthalts",
        scheduleTitle: "Wichtige Zeiten & Regeln",
        quietHours: "Ruhe und Rücksicht auf die Nachbarn",
        houseLabel: "Haus",
        luggageEyebrow: "Flexibilität",
        luggageTitle: "Gepäckaufbewahrung",
        luggageDesc: "Schreiben Sie dem Gastgeber, um Gepäck vor Check-in oder nach Check-out abzustellen.",
        askNino: "Nino fragen"
      },
      changeLanguage: "Sprache ändern",
      close: "Schließen",
      welcomeCity: "Willkommen in Morbegno."
    },
    checkInPage: {
      wifi: {
        requiredNotice: "Erforderliches Netzwerk: Casa_Aurora",
        explain: "Der Türöffner funktioniert ausschließlich, wenn Sie mit dem Wohnungs-WLAN verbunden sind.",
        notConnectedError: "Zugriff verweigert: Sie müssen mit dem Haus-WLAN (Casa_Aurora) verbunden sein, um die Tür zu öffnen.",
        copyPwd: "WLAN-Passwort kopieren",
        verifying: "Überprüfung des Casa_Aurora WLANs...",
        verifiedLabel: "Casa_Aurora WLAN Bestätigt",
        rescanBtn: "Erneut prüfen",
        openBtn: "TÜR ÖFFNEN",
        wifiRequiredBtn: "Mit Casa_Aurora verbinden zum Öffnen",
        checkingConnection: "Verbindung wird geprüft",
        connected: "Verbunden",
        copySuccess: "Kopiert!",
        pressToUnlockNotice: "Tippen Sie auf die Schaltfläche, um das Schloss bei der Ankunft zu betätigen"
      },
      smartHomeAccess: "Smart-Home-Zugang",
      frontDoor: "Eingangstür",
      authorizedNetwork: "Autorisiertes Netzwerk für sicheres Öffnen",
      connectToNetwork: "Verbinden Sie sich mit \"Casa_Aurora\"",
      publicNoticeTitle: "Smart-Lock-Öffnung",
      publicNoticeDesc: "Die Smart-Lock-Öffnung ist nur für Gäste mit aktivem Pass aktiviert. Schlüssel werden bei Ankunft persönlich von Nino übergeben.",
      inPersonWelcome: "Herzlicher persönlicher Empfang durch Ihren Gastgeber Nino",
      keyIntroDesc: "Übergabe der Schlüssel und kurze Einweisung.",
      whatsappArrivalMsg: "Hallo Nino, wir sind auf dem Weg zu Aurora in Valtellina! Voraussichtliche Ankunft um...",
      shareArrivalBtn: "Ankunftszeit per WhatsApp senden",
      reservedCourtyardParking: "Reservierter Parkplatz im Innenhof"
    },
    rulesPage: {
      ruleLabel: "REGEL #"
    },
    locationPage: {
      officialAddress: "Offizielle Adresse",
      startGps: "GPS-Navigation starten"
    },
    contactsPage: {
      supportEmail: "Support-E-Mail"
    },
    emergencyPage: {
      singleEuNumberTitle: "Europäische Notrufnummer",
      singleEuNumberSubtitle: "Krankenwagen, Feuerwehr, Polizei"
    },
    infoPage: {
      pharmacyService: {
        title: "NOTDIENST-APOTHEKE",
        desc: "Live-Verfügbarkeit, Öffnungszeiten und Wegbeschreibung prüfen"
      },
      wasteRecycling: "Mülltrennung"
    },
    langSelect: {
      badge: "Digitaler Reiseführer & Concierge",
      subtitle: "Ihr Aufenthalt im Herzen der Alpen",
      secureAccess: "Geschützter und sicherer Gästezugang"
    },
    aiChat: {
      welcomeMessage: 'Hallo, ich bin Aurora AI. Ich helfe Ihnen bei Fragen zur Wohnung, Morbegno und Erlebnissen im Veltlin.',
      unsupportedImageFormat: 'Nicht unterstütztes Bildformat. Nutzen Sie JPG, PNG, WEBP oder HEIC.',
      imageTooLarge: 'Foto ist zu groß. Bild unter 6MB anhängen.',
      responseError: 'Antwort konnte nicht empfangen werden.',
      unavailableError: 'Aurora AI ist derzeit nicht verfügbar.',
      title: 'Aurora AI',
      subtitle: 'Digitaler Concierge',
      closeLabel: 'Aurora AI schließen',
      attachedPhotoAlt: 'Angehängtes Foto',
      thinking: 'Aurora AI denkt nach...',
      photoReady: 'Foto bereit zum Senden',
      removePhoto: 'Foto entfernen',
      attachPhoto: 'Foto anhängen',
      placeholder: 'Fragen zu Morbegno, Erlebnissen oder Aurora',
      sendQuestion: 'Frage senden'
    },
    smartLock: {
      title: 'Digitaler Hausschlüssel',
      subtitle: 'Wohnung Aurora • Morbegno',
      registeredGuest: 'Registrierter Gast',
      activeStatus: 'Aktiv',
      checkingWifi: 'WLAN prüfen...',
      casaAuroraNetwork: 'Casa_Aurora Netzwerk',
      requiredNetwork: 'Erforderliches Netzwerk',
      checkingInProgress: 'Erkennung läuft',
      connectedToCasaAurora: 'Mit Casa_Aurora verbunden',
      connectToCasaAurora: 'Mit Casa_Aurora verbinden',
      rescanTitle: 'WLAN-Erkennung erneut versuchen',
      openingInProgress: 'Wird geöffnet...',
      doorUnlocked: 'Tür geöffnet!',
      pushDoorToEnter: 'Tür aufdrücken zum Eintreten',
      connectionError: 'Verbindungsfehler',
      tapToRetry: 'Tippen zum Wiederholen',
      pressToOpen: 'GEDRÜCKT HALTEN ZUM ÖFFNEN',
      waitAMoment: 'Einen Moment warten',
      verifiedByServer: 'Sicherheit wird vom Server geprüft',
      physicalKeyNotice: 'Im Inneren finden Sie auch den traditionellen Schlüsselbund.',
      closeWindow: 'Fenster schließen',
      openDoorBtn: 'TÜR ÖFFNEN'
    },
    staySummary: {
      activeStay: 'Aufenthalt aktiv',
      upcomingStay: 'Ankunft',
      completedStay: 'Aufenthalt beendet',
      guest: 'Gast',
      status: 'Status',
      confirmed: 'Bestätigt',
      inProgress: 'Laufend',
      completed: 'Abgeschlossen',
      mainDoorOpening: 'Haupttüröffnung',
      active24h: '24 Std. Aktiv',
      openDoorInstructions: 'Tippen Sie auf die Schaltfläche zum Entriegeln der Haustür.',
      checkInFrom: 'ab',
      checkOutBy: 'bis',
      reservedParkingTitle: 'Reservierter Parkplatz',
      reservedParkingDesc: 'Ihr privater Parkplatz befindet sich auf dem Grundstück in der Via Serta 188D. Kostenlos während Ihres Aufenthalts.',
      needSomethingTitle: 'Brauchen Sie etwas?',
      needSomethingDesc: 'Kaffee, Tee und frische Bettwäsche stehen für Sie bereit. Bei Fragen steht Nino gerne zur Verfügung.',
      writeHostWhatsapp: 'Gastgeber Nino auf WhatsApp schreiben',
      stayTitle: 'Ihr Aufenthalt in Aurora',
      staySubtitle: 'Buchungsdetails & Schlüssel'
    },
    boardingPass: {
      headerTitle: 'VIP-BORDKARTE • SUITE-ERLEBNIS',
      headerSub: 'Aurora in Valtellina • Morbegno',
      statusActive: 'AKTIV',
      statusConfirmed: 'BESTÄTIGT',
      statusCompleted: 'BEENDET',
      collapseCard: 'Karte einklappen',
      expandCard: 'Karte ausklappen',
      guestLabel: 'Gastname',
      suiteLabel: 'Reservierte Unterkunft',
      suiteValue: 'Suite Aurora • 70 m² mit Parkplatz',
      countdownArrival: 'COUNTDOWN BIS ZUR ANKUNFT',
      stayDuration: 'AUFENTHALTSDAUER',
      fromTime: 'ab',
      byTime: 'bis',
      smartLockTitle: 'SMART-LOCK-ZUGANG',
      smartLockSub: 'Türöffnung mit 1 Tippen',
      parkingTitle: 'Privatparkplatz',
      parkingBadge: 'Reserviert 24/7',
      wifiTitle: 'Glasfaser Wi-Fi',
      wifiBadge: 'Schnellverbindung',
      conciergeTitle: 'Concierge Nino',
      conciergeBadge: 'WhatsApp-Chat'
    },
    expiredPass: {
      headerSub: 'Morbegno • Aufenthalt beendet',
      badge: 'ABGELAUFENER DIGITALER PASS',
      title: 'Vielen Dank für Ihren Besuch',
      message: 'Ihr digitaler Pass und Smart Key für Appartement Aurora waren für den Aufenthalt aktiv, der endete am',
      stayDates: 'Aufenthaltsdaten:',
      linkStatus: 'Link-Status:',
      disabledForSecurity: 'Aus Sicherheitsgründen deaktiviert',
      rebookBtn: 'Erneut buchen auf Bed-and-Breakfast.it',
      generalGuide: 'Allgemeine Anleitung',
      insertAnotherPass: 'Anderen Pass eingeben'
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
      copyPassword: "Copier le Mot de Passe",
      backToMenu: "MENU",
      openWhatsApp: "Écrivez sur WhatsApp",
      rateGoogle: "AVIS SUR GOOGLE",
      rateWebsite: "AVIS SUR LE SITE"
    },
    gridMenu: {
      categories: {
        home: "Le Logement & Services",
        food: "Saveurs de la Valteline",
        explore: "Explorer & Utilitaires"
      },
      descriptions: {
        benvenuto: "Votre maison à Morbegno et notre accueil chaleureux",
        check_in: "Accès smart lock et remise des clés",
        wifi: "Fibre ultra-rapide et code Wi-Fi rapide",
        servizi: "Appareils ménagers, chauffage et tri sélectif",
        regole: "Règles simples pour une détente maximale",
        check_out: "Départ serein avant 10h00",
        ristoranti: "Crotti typiques et pizzoccheri faits maison",
        bar_club: "Petits-déjeuners frais, apéritifs et vins locaux",
        shopping: "Boutiques artisanales de Bitto et bresaola",
        attivita: "Sentiero Valtellina, Val Gerola et sentiers panoramiques",
        posizione: "Via Serta 188D et place de parking privée",
        trasporti: "Gare de Morbegno, bus et location de vélos",
        informazioni: "Ce qu’il faut savoir sur Morbegno et horaires",
        emergenza: "Pharmacies de garde, urgences et numéros utiles",
        contatti: "Contact direct avec Nino pour toute demande"
      },
      welcomeTag: "BIENVENUE",
      apartmentName: "Appartamento Aurora",
      apartmentSubtitle: "Votre séjour paisible à Morbegno • Tout ce dont vous avez besoin à portée de main",
      pamperingTitle: "Petites attentions pour votre séjour",
      pamperingSubtitle: "Tout préparé avec soin pour vous détendre",
      readyForYou: "Prêt pour vous",
      freeCoffee: "Café et tisanes offerts",
      reservedParking: "Place de parking réservée",
      smartAccess: "Accès smart et sécurisé",
      wifiGigabit: "Wi-Fi Fibre 1 Gbit",
      password: "Mot de passe",
      keys: "Clés",
      smartAccessLabel: "Accès smart",
      car: "Voiture",
      parking: "Parking",
      guideSectionTitle: "Guide Maison & Territoire",
      gridView: "Vue Grille",
      listView: "Vue Liste",
      footerAddress: "Via Serta 188D, Morbegno (SO)",
      footerValtellina: "Valtellina",
      footerTagline: "Aurora in Valtellina • Accueil serein et chaleureux"
    },
    concierge: {
      guestCount: "Nbre d’hôtes",
      from: "à partir de",
      by: "avant",
      doorOpeningState: {
        opening: "Ouverture en cours...",
        success: "Porte ouverte !",
        error: "Réessayer : maintenir appuyé",
        idle: "Maintenir appuyé pour ouvrir"
      },
      doorMessage: {
        sending: "Envoi de la commande à Home Assistant...",
        unlocked: "Porte déverrouillée. Poussez la porte pour entrer."
      },
      nudge: {
        checkoutTitle: "Check-out avant",
        checkoutSub: "Voulez-vous déposer vos bagages ou contacter l’hôte ?"
      },
      sheets: {
        wifiCopiedNotice: "Mot de passe copié dans le presse-papiers.",
        wifiScanNotice: "Scannez le QR code ou copiez le mot de passe.",
        showQr: "Afficher le QR Wi-Fi",
        copyPwd: "Copier mot de passe",
        scheduleEyebrow: "Rythme du séjour",
        scheduleTitle: "Horaires et règles essentielles",
        quietHours: "silence et respect du voisinage",
        houseLabel: "Maison",
        luggageEyebrow: "Flexibilité",
        luggageTitle: "Dépôt de bagages",
        luggageDesc: "Écrivez à l’hôte pour organiser le dépôt de bagages avant le check-in ou après le check-out.",
        askNino: "Demander à Nino"
      },
      changeLanguage: "Changer de langue",
      close: "Fermer",
      welcomeCity: "Bienvenue à Morbegno."
    },
    checkInPage: {
      wifi: {
        requiredNotice: "Réseau requis : Casa_Aurora",
        explain: "L'ouverture de porte fonctionne exclusivement lorsque vous êtes connecté au Wi-Fi de l'appartement.",
        notConnectedError: "Accès refusé : Vous devez être connecté au réseau Wi-Fi de la maison (Casa_Aurora) pour ouvrir la porte.",
        copyPwd: "Copier mot de passe Wi-Fi",
        verifying: "Vérification du Wi-Fi Casa_Aurora...",
        verifiedLabel: "Wi-Fi Casa_Aurora Vérifié",
        rescanBtn: "Réessayer",
        openBtn: "OUVRIR LA PORTE",
        wifiRequiredBtn: "Connectez-vous à Casa_Aurora pour ouvrir",
        checkingConnection: "Vérification connexion",
        connected: "Connecté",
        copySuccess: "Copié !",
        pressToUnlockNotice: "Appuyez pour déverrouiller la serrure électrique à votre arrivée"
      },
      smartHomeAccess: "Accès Smart Home",
      frontDoor: "Porte d’entrée",
      authorizedNetwork: "Réseau autorisé pour ouverture sécurisée",
      connectToNetwork: "Connectez-vous au réseau \"Casa_Aurora\"",
      publicNoticeTitle: "Ouverture Smart Lock",
      publicNoticeDesc: "L’ouverture smart lock est réservée aux hôtes avec un pass actif. Remise des clés en personne par Nino à l’arrivée.",
      inPersonWelcome: "Accueil chaleureux en personne par votre hôte Nino",
      keyIntroDesc: "Remise des clés traditionnelles et présentation de la maison.",
      whatsappArrivalMsg: "Bonjour Nino, nous sommes en route vers Aurora in Valtellina ! Heure estimée d'arrivée...",
      shareArrivalBtn: "Indiquer l'Heure d'Arrivée sur WhatsApp",
      reservedCourtyardParking: "Place de parking réservée dans la cour"
    },
    rulesPage: {
      ruleLabel: "RÈGLE #"
    },
    locationPage: {
      officialAddress: "Adresse officielle",
      startGps: "Lancer le GPS"
    },
    contactsPage: {
      supportEmail: "Email d’assistance"
    },
    emergencyPage: {
      singleEuNumberTitle: "Numéro d’urgence européen",
      singleEuNumberSubtitle: "Ambulance, Pompiers, Police"
    },
    infoPage: {
      pharmacyService: {
        title: "PHARMACIE DE GARDE",
        desc: "Consultez la disponibilité, les horaires et l’itinéraire en direct"
      },
      wasteRecycling: "Tri des déchets"
    },
    langSelect: {
      badge: "Guide Numérique & Concierge",
      subtitle: "Votre séjour au cœur des Alpes",
      secureAccess: "Accès hôtes protégé et sécurisé"
    },
    aiChat: {
      welcomeMessage: 'Bonjour, je suis Aurora AI. Je peux vous aider pour le logement, Morbegno et les activités en Valteline.',
      unsupportedImageFormat: 'Format d’image non supporté. Utilisez JPG, PNG, WEBP ou HEIC.',
      imageTooLarge: 'L’image est trop volumineuse. Joignez une photo de moins de 6 Mo.',
      responseError: 'Impossible de recevoir une réponse.',
      unavailableError: 'Aurora AI n’est pas disponible pour le moment.',
      title: 'Aurora AI',
      subtitle: 'Concierge numérique',
      closeLabel: 'Fermer Aurora AI',
      attachedPhotoAlt: 'Photo jointe',
      thinking: 'Aurora AI réfléchit...',
      photoReady: 'Photo prête à envoyer',
      removePhoto: 'Retirer la photo',
      attachPhoto: 'Joindre une photo',
      placeholder: 'Posez votre question sur Morbegno ou Aurora',
      sendQuestion: 'Envoyer la question'
    },
    smartLock: {
      title: 'Clé Digitale',
      subtitle: 'Appartement Aurora • Morbegno',
      registeredGuest: 'Hôte Enregistré',
      activeStatus: 'Actif',
      checkingWifi: 'Vérification Wi-Fi...',
      casaAuroraNetwork: 'Réseau Casa_Aurora',
      requiredNetwork: 'Réseau requis',
      checkingInProgress: 'Détection en cours',
      connectedToCasaAurora: 'Connecté à Casa_Aurora',
      connectToCasaAurora: 'Connectez-vous à Casa_Aurora',
      rescanTitle: 'Réessayer la détection Wi-Fi',
      openingInProgress: 'Ouverture en cours...',
      doorUnlocked: 'Porte Ouverte !',
      pushDoorToEnter: 'Poussez la porte pour entrer',
      connectionError: 'Erreur de connexion',
      tapToRetry: 'Appuyez pour réessayer',
      pressToOpen: 'MAINTENIR APPUYÉ POUR OUVRIR',
      waitAMoment: 'Attendez un instant',
      verifiedByServer: 'La sécurité est vérifiée par le serveur',
      physicalKeyNotice: 'À l’intérieur, vous trouverez également le trousseau de clés traditionnelles.',
      closeWindow: 'Fermer la fenêtre',
      openDoorBtn: 'OUVRIR LA PORTE'
    },
    staySummary: {
      activeStay: 'Séjour actif',
      upcomingStay: 'Arrivée',
      completedStay: 'Séjour terminé',
      guest: 'Hôte',
      status: 'Statut',
      confirmed: 'Confirmé',
      inProgress: 'En cours',
      completed: 'Terminé',
      mainDoorOpening: 'Ouverture porte principale',
      active24h: 'Actif 24h/24',
      openDoorInstructions: 'Appuyez sur le bouton pour déverrouiller la porte d’entrée.',
      checkInFrom: 'à partir de',
      checkOutBy: 'avant',
      reservedParkingTitle: 'Place de Parking Réservée',
      reservedParkingDesc: 'Votre parking privé se situe dans la propriété au Via Serta 188D. Gratuit et accessible à tout moment.',
      needSomethingTitle: 'Besoin de quelque chose ?',
      needSomethingDesc: 'Café, tisanes et linge frais vous attendent. Pour toute conseil, Nino est à votre disposition.',
      writeHostWhatsapp: 'Écrire à l’Hôte Nino sur WhatsApp',
      stayTitle: 'Votre séjour à Aurora',
      staySubtitle: 'Détails de réservation et clés'
    },
    boardingPass: {
      headerTitle: 'PASS D\'EMBARQUEMENT VIP • EXPÉRIENCE SUITE',
      headerSub: 'Aurora in Valtellina • Morbegno',
      statusActive: 'ACTIF',
      statusConfirmed: 'CONFIRMÉ',
      statusCompleted: 'TERMINÉ',
      collapseCard: 'Réduire la carte',
      expandCard: 'Agrandir la carte',
      guestLabel: 'Nom de l\'invité',
      suiteLabel: 'Hébergement réservé',
      suiteValue: 'Suite Aurora • 70 m² avec Parking',
      countdownArrival: 'COMPTE À REBOURS AVANT ARRIVÉE',
      stayDuration: 'DURÉE DU SÉJOUR',
      fromTime: 'à partir de',
      byTime: 'avant',
      smartLockTitle: 'ACCÈS SMART LOCK',
      smartLockSub: 'Déverrouillage en 1 touche',
      parkingTitle: 'Parking Privé',
      parkingBadge: 'Réservé 24h/24',
      wifiTitle: 'Wi-Fi Fibre',
      wifiBadge: 'Connexion Rapide',
      conciergeTitle: 'Concierge Nino',
      conciergeBadge: 'Chat WhatsApp'
    },
    expiredPass: {
      headerSub: 'Morbegno • Séjour terminé',
      badge: 'PASS NUMÉRIQUE EXPIRÉ',
      title: 'Merci pour votre visite',
      message: 'Votre pass numérique et votre clé intelligente pour l\'Appartement Aurora étaient actifs pour le séjour terminé le',
      stayDates: 'Dates du séjour :',
      linkStatus: 'Statut du lien :',
      disabledForSecurity: 'Désactivé par sécurité',
      rebookBtn: 'Réserver à nouveau sur Bed-and-Breakfast.it',
      generalGuide: 'Guide général',
      insertAnotherPass: 'Saisir un autre pass'
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
      copyPassword: "Copiar Contraseña",
      backToMenu: "MENÚ",
      openWhatsApp: "Escribir en WhatsApp",
      rateGoogle: "VALORAR EN GOOGLE",
      rateWebsite: "VALORAR EN LA WEB"
    },
    gridMenu: {
      categories: {
        home: "La Casa y Servicios",
        food: "Sabores de Valtelina",
        explore: "Explorar y Utilidades"
      },
      descriptions: {
        benvenuto: "Tu hogar en Morbegno y nuestra cálida bienvenida",
        check_in: "Acceso con smart lock y entrega de llaves",
        wifi: "Fibra de alta velocidad y código rápido",
        servizi: "Electrodomésticos, calefacción y reciclaje",
        regole: "Normas sencillas para el máximo relax",
        check_out: "Salida tranquila antes de las 10:00",
        ristoranti: "Crotti típicos y pizzoccheri caseros",
        bar_club: "Desayunos frescos, aperitivos y vinos locales",
        shopping: "Tiendas tradicionales de queso Bitto y bresaola",
        attivita: "Sentiero Valtellina, Val Gerola y rutas panorámicas",
        posizione: "Via Serta 188D y aparcamiento privado",
        trasporti: "Estación de tren de Morbegno, autobuses y alquiler de bicis",
        informazioni: "Información sobre Morbegno y horarios útiles",
        emergenza: "Farmacias de guardia, urgencias y teléfonos de emergencia",
        contatti: "Contacto directo con Nino para cualquier consulta"
      },
      welcomeTag: "BIENVENIDOS",
      apartmentName: "Appartamento Aurora",
      apartmentSubtitle: "Tu estancia tranquila en Morbegno • Todo lo que necesitas a mano",
      pamperingTitle: "Pequeños detalles para tu estancia",
      pamperingSubtitle: "Todo preparado con esmero para tu descanso",
      readyForYou: "Listo para ti",
      freeCoffee: "Café y infusiones de cortesía",
      reservedParking: "Aparcamiento reservado",
      smartAccess: "Acceso inteligente y seguro",
      wifiGigabit: "Wi-Fi Fibra 1 Gbit",
      password: "Contraseña",
      keys: "Llaves",
      smartAccessLabel: "Acceso smart",
      car: "Coche",
      parking: "Aparcamiento",
      guideSectionTitle: "Guía de la Casa y del Territorio",
      gridView: "Vista de Cuadrícula",
      listView: "Vista de Lista",
      footerAddress: "Via Serta 188D, Morbegno (SO)",
      footerValtellina: "Valtellina",
      footerTagline: "Aurora in Valtellina • Acogida serena y sincera"
    },
    concierge: {
      guestCount: "Huéspedes",
      from: "desde",
      by: "antes de",
      doorOpeningState: {
        opening: "Abriendo...",
        success: "¡Puerta abierta!",
        error: "Reintentar: mantén presionado",
        idle: "Mantén presionado para abrir"
      },
      doorMessage: {
        sending: "Enviando comando a Home Assistant...",
        unlocked: "Puerta desbloqueada. Empuja para entrar."
      },
      nudge: {
        checkoutTitle: "Check-out antes de",
        checkoutSub: "¿Quieres dejar el equipaje o necesitas ayuda?"
      },
      sheets: {
        wifiCopiedNotice: "Contraseña copiada al portapapeles.",
        wifiScanNotice: "Escanea el QR o copia la contraseña.",
        showQr: "Mostrar QR Wi-Fi",
        copyPwd: "Copiar contraseña",
        scheduleEyebrow: "Ritmo de la estancia",
        scheduleTitle: "Horarios y normas esenciales",
        quietHours: "silencio y respeto a los vecinos",
        houseLabel: "Casa",
        luggageEyebrow: "Flexibilidad",
        luggageTitle: "Consigna de equipaje",
        luggageDesc: "Escribe al anfitrión para acordar la consigna antes del check-in o después del check-out.",
        askNino: "Preguntar a Nino"
      },
      changeLanguage: "Cambiar idioma",
      close: "Cerrar",
      welcomeCity: "Bienvenido a Morbegno."
    },
    checkInPage: {
      wifi: {
        requiredNotice: "Red requerida: Casa_Aurora",
        explain: "La apertura de la puerta funciona exclusivamente conectado al Wi-Fi del apartamento.",
        notConnectedError: "Acceso denegado: Debes estar conectado a la red Wi-Fi de casa (Casa_Aurora) para abrir la puerta.",
        copyPwd: "Copiar contraseña Wi-Fi",
        verifying: "Verificando red Wi-Fi Casa_Aurora...",
        verifiedLabel: "Wi-Fi Casa_Aurora Verificado",
        rescanBtn: "Reintentar",
        openBtn: "ABRIR PUERTA",
        wifiRequiredBtn: "Conéctate a Casa_Aurora para abrir",
        checkingConnection: "Verificando conexión",
        connected: "Conectado",
        copySuccess: "¡Copiada!",
        pressToUnlockNotice: "Toca el botón para activar la cerradura eléctrica a tu llegada"
      },
      smartHomeAccess: "Acceso Smart Home",
      frontDoor: "Puerta de entrada",
      authorizedNetwork: "Red autorizada para apertura segura",
      connectToNetwork: "Conéctate a la red \"Casa_Aurora\"",
      publicNoticeTitle: "Apertura Smart Lock",
      publicNoticeDesc: "La apertura por smart lock está habilitada solo para huéspedes con pass activo. Las llaves se entregarán en persona por Nino.",
      inPersonWelcome: "Cálida bienvenida en persona de tu anfitrión Nino",
      keyIntroDesc: "Entrega de llaves y breve recorrido de la casa.",
      whatsappArrivalMsg: "¡Hola Nino, estamos de camino a Aurora in Valtellina! Nuestra hora estimada de llegada es...",
      shareArrivalBtn: "Compartir Hora de Llegada por WhatsApp",
      reservedCourtyardParking: "Aparcamiento reservado en el patio"
    },
    rulesPage: {
      ruleLabel: "REGLA #"
    },
    locationPage: {
      officialAddress: "Dirección oficial",
      startGps: "Iniciar Navegador GPS"
    },
    contactsPage: {
      supportEmail: "Correo de asistencia"
    },
    emergencyPage: {
      singleEuNumberTitle: "Número Único Europeo de Emergencias",
      singleEuNumberSubtitle: "Ambulancia, Bomberos, Policía"
    },
    infoPage: {
      pharmacyService: {
        title: "FARMACIA DE GUARDIA",
        desc: "Consulta disponibilidad, horarios e indicaciones en tiempo real"
      },
      wasteRecycling: "Reciclaje de residuos"
    },
    langSelect: {
      badge: "Guía Digital y Conserjería",
      subtitle: "Tu estancia en el corazón de los Alpes",
      secureAccess: "Acceso de huéspedes protegido y seguro"
    },
    aiChat: {
      welcomeMessage: 'Hola, soy Aurora AI. Puedo ayudarte con el apartamento, Morbegno y las actividades en Valtelina.',
      unsupportedImageFormat: 'Formato de imagen no soportado. Usa JPG, PNG, WEBP o HEIC.',
      imageTooLarge: 'La foto es demasiado grande. Adjunta una imagen menor de 6MB.',
      responseError: 'No se pudo recibir respuesta.',
      unavailableError: 'Aurora AI no está disponible en este momento.',
      title: 'Aurora AI',
      subtitle: 'Conserjería digital',
      closeLabel: 'Cerrar Aurora AI',
      attachedPhotoAlt: 'Foto adjunta',
      thinking: 'Aurora AI está pensando...',
      photoReady: 'Foto lista para enviar',
      removePhoto: 'Eliminar foto',
      attachPhoto: 'Adjuntar foto',
      placeholder: 'Pregunta sobre Morbegno, actividades o Aurora',
      sendQuestion: 'Enviar pregunta'
    },
    smartLock: {
      title: 'Llave Digital',
      subtitle: 'Apartamento Aurora • Morbegno',
      registeredGuest: 'Huésped Registrado',
      activeStatus: 'Activo',
      checkingWifi: 'Verificando Wi-Fi...',
      casaAuroraNetwork: 'Red Casa_Aurora',
      requiredNetwork: 'Red requerida',
      checkingInProgress: 'Detección en curso',
      connectedToCasaAurora: 'Conectado a Casa_Aurora',
      connectToCasaAurora: 'Conéctate a Casa_Aurora',
      rescanTitle: 'Reintentar detección Wi-Fi',
      openingInProgress: 'Abriendo...',
      doorUnlocked: '¡Puerta Abierta!',
      pushDoorToEnter: 'Empuja la puerta para entrar',
      connectionError: 'Error de conexión',
      tapToRetry: 'Toca para reintentar',
      pressToOpen: 'MANTÉN PRESIONADO PARA ABRIR',
      waitAMoment: 'Espera un momento',
      verifiedByServer: 'La seguridad es verificada por el servidor',
      physicalKeyNotice: 'En el interior también encontrarás el juego de llaves tradicionales.',
      closeWindow: 'Cerrar ventana',
      openDoorBtn: 'ABRIR PUERTA'
    },
    staySummary: {
      activeStay: 'Estancia activa',
      upcomingStay: 'Llegada',
      completedStay: 'Estancia completada',
      guest: 'Huésped',
      status: 'Estado',
      confirmed: 'Confirmado',
      inProgress: 'En curso',
      completed: 'Finalizado',
      mainDoorOpening: 'Apertura Puerta Principal',
      active24h: 'Activo 24h',
      openDoorInstructions: 'Toca el botón para activar la apertura de la puerta de entrada.',
      checkInFrom: 'desde las',
      checkOutBy: 'antes de las',
      reservedParkingTitle: 'Aparcamiento Reservado',
      reservedParkingDesc: 'Tu aparcamiento privado está dentro de la propiedad en Via Serta 188D. Gratuito para toda tu estancia.',
      needSomethingTitle: '¿Necesitas algo?',
      needSomethingDesc: 'Hemos preparado café, infusiones y ropa limpia para tu descanso. Nino está disponible para lo que necesites.',
      writeHostWhatsapp: 'Escribir al Anfitrión Nino por WhatsApp',
      stayTitle: 'Tu Estancia en Aurora',
      staySubtitle: 'Detalles de reserva y llaves'
    },
    boardingPass: {
      headerTitle: 'TARJETA DE EMBARQUE VIP • EXPERIENCIA SUITE',
      headerSub: 'Aurora in Valtellina • Morbegno',
      statusActive: 'ACTIVO',
      statusConfirmed: 'CONFIRMADO',
      statusCompleted: 'FINALIZADO',
      collapseCard: 'Reducir tarjeta',
      expandCard: 'Expandir tarjeta',
      guestLabel: 'Nombre del Huésped',
      suiteLabel: 'Alojamiento Reservado',
      suiteValue: 'Suite Aurora • 70 m² con Aparcamiento',
      countdownArrival: 'CUENTA ATRÁS PARA LLEGADA',
      stayDuration: 'DURACIÓN DE LA ESTANCIA',
      fromTime: 'desde las',
      byTime: 'hasta las',
      smartLockTitle: 'ACCESO SMART LOCK',
      smartLockSub: 'Apertura de puerta con 1 toque',
      parkingTitle: 'Aparcamiento Privado',
      parkingBadge: 'Reservado 24/7',
      wifiTitle: 'Wi-Fi Fibra',
      wifiBadge: 'Conexión Rápida',
      conciergeTitle: 'Concierge Nino',
      conciergeBadge: 'Chat WhatsApp'
    },
    expiredPass: {
      headerSub: 'Morbegno • Estancia finalizada',
      badge: 'PASE DIGITAL EXPIRADO',
      title: 'Gracias por su visita',
      message: 'Tu pase digital y llave inteligente para el Apartamento Aurora estuvieron activos para la estancia finalizada el',
      stayDates: 'Fechas de estancia:',
      linkStatus: 'Estado del enlace:',
      disabledForSecurity: 'Desactivado por seguridad',
      rebookBtn: 'Reservar de nuevo en Bed-and-Breakfast.it',
      generalGuide: 'Guía general',
      insertAnotherPass: 'Introducir otro pase'
    }
  }
};
