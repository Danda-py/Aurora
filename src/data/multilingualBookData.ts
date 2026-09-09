import { Language } from '../types';

export interface PageContentTranslation {
  title: string;
  subtitle?: string;
  [key: string]: any;
}

export const BOOK_DATA: Record<Language, {
  appName: string;
  appSubtitle: string;
  welcome: {
    title: string;
    greeting: string;
    message: string;
    roomsTitle: string;
    livingTitle: string;
    livingDesc: string;
    bedroomTitle: string;
    bedroomDesc: string;
    kitchenTitle: string;
    kitchenDesc: string;
    viewTitle: string;
    viewDesc: string;
  };
  checkIn: {
    title: string;
    badge: string;
    timingNotice: string;
    houseAccessTitle: string;
    keyboxCodeLabel: string;
    step1: string;
    step2: string;
    step3: string;
    parkingTitle: string;
    parkingDesc: string;
    parkingNote: string;
  };
  wifi: {
    title: string;
    networkLabel: string;
    passwordLabel: string;
    speedNotice: string;
    troubleshootTitle: string;
    troubleshootText: string;
  };
  rules: {
    title: string;
    r1Title: string;
    r1Desc: string;
    r2Title: string;
    r2Desc: string;
    r3Title: string;
    r3Desc: string;
    r4Title: string;
    r4Desc: string;
    r5Title: string;
    r5Desc: string;
    r6Title: string;
    r6Desc: string;
  };
  location: {
    title: string;
    heading: string;
    howToArrive: string;
    byTrain: string;
    byTrainDesc: string;
    byCar: string;
    byCarDesc: string;
    byPlane: string;
    byPlaneDesc: string;
  };
  transport: {
    title: string;
    items: Array<{ title: string; subtitle: string; time: string; desc: string; mapsUrl?: string; phone?: string }>;
  };
  amenities: {
    title: string;
    items: Array<{ title: string; desc: string }>;
    notice: string;
  };
  activities: {
    title: string;
    bannerText: string;
    highlights: Array<{
      tag: string;
      title: string;
      desc: string;
      mapsUrl: string;
      tagColor: string;
    }>;
    categoryTitle: string;
    categories: Array<{ title: string; desc: string }>;
  };
  restaurants: {
    title: string;
    bannerText: string;
    recommended: Array<{ name: string; time: string; address: string; phone: string; desc: string; mapsUrl: string }>;
    deliveryTitle: string;
    deliveries: Array<{ name: string; type: string; phone: string }>;
  };
  bars: {
    title: string;
    bannerText: string;
    recommended: Array<{ name: string; time: string; address: string; phone: string; desc: string; mapsUrl: string }>;
    coffeeTitle: string;
    coffeeDesc: string;
  };
  shopping: {
    title: string;
    shops: Array<{ title: string; time: string; hours: string; desc: string; mapsUrl: string }>;
  };
  info: {
    title: string;
    services: Array<{ title: string; desc: string; mapsUrl: string }>;
    wasteTitle: string;
    wasteDesc: string;
    cirLabel: string;
    cinLabel: string;
  };
  emergency: {
    title: string;
    freeBadge: string;
    nationalNumbersTitle: string;
    items: Array<{ title: string; subtitle: string; phone: string; mapsUrl?: string }>;
  };
  checkOut: {
    title: string;
    badge: string;
    lateNote: string;
    checklistTitle: string;
    checklist: Array<{ title: string; desc: string }>;
    thankYou: string;
  };
  contacts: {
    title: string;
    hostRole: string;
    quote: string;
    callAction: string;
    chatAction: string;
    smsAction: string;
    emailAction: string;
    copyPhone: string;
    copyEmail: string;
    copied: string;
    reviewPrompt: string;
    rateGoogle: string;
    rateWebsite: string;
    reviewDialogTitle: string;
    ratingPrompt: string;
    commentPrompt: string;
    submitReview: string;
    reviewSuccess: string;
  };
}> = {
  it: {
    appName: "Aurora in Valtellina",
    appSubtitle: "Il tuo rifugio accogliente a Morbegno, tra lago e Alpi...",
    welcome: {
      title: "BENVENUTO",
      greeting: "Benvenuti ad Aurora in Valtellina!",
      message: "Siamo felici di ospitarvi nella nostra casa a Morbegno. Abbiamo preparato questa guida digitale per aiutarvi a vivere al meglio il vostro soggiorno in Valtellina tra comfort, relax e splendide valli alpine.",
      roomsTitle: "Gli Ambienti Della Casa",
      livingTitle: "SOGGIORNO & RELAX",
      livingDesc: "Smart TV, divano letto e zona pranzo",
      bedroomTitle: "CAMERA MATRIMONIALE",
      bedroomDesc: "Letto king size, armadio e biancheria",
      kitchenTitle: "CUCINA ATTREZZATA",
      kitchenDesc: "Piano cottura, forno, lavastoviglie & caffè",
      viewTitle: "CORTE & VISTA ALPI",
      viewDesc: "Parcheggio privato riservato e vista sulle Orobie"
    },
    checkIn: {
      title: "CHECK-IN",
      badge: "::: 15:00 (3 PM) :::",
      timingNotice: "Vi chiediamo gentilmente di rispettare l'orario di check-in dalle ore 15:00. Se arrivate prima o avete esigenze particolari, scriveteci su WhatsApp.",
      houseAccessTitle: "Consegna Chiavi di Persona",
      keyboxCodeLabel: "CONSEGNA A MANO DALL'HOST",
      step1: "1. Le chiavi dell'appartamento vi verranno consegnate a mano direttamente dall'host al vostro arrivo.",
      step2: "2. Vi preghiamo di comunicarci con un messaggio su WhatsApp il vostro orario stimato di arrivo.",
      step3: "3. Al vostro arrivo vi accoglieremo per mostrarvi l'appartamento, rispondere a ogni domanda e darvi le chiavi.",
      parkingTitle: "PARCHEGGIO PRIVATO RISERVATO",
      parkingDesc: "L'abitazione dispone di parcheggio privato con un posto auto sempre libero e riservato per gli ospiti dell'Appartamento Aurora per tutta la durata del soggiorno.",
      parkingNote: "Sempre a vostra disposizione senza costi aggiuntivi."
    },
    wifi: {
      title: "WIFI",
      networkLabel: "NOME DELLA RETE (SSID)",
      passwordLabel: "PASSWORD WI-FI",
      speedNotice: "Connessione Wi-Fi veloce fino a 500 Mbps • Streaming HD, navigazione e smart working",
      troubleshootTitle: "Problemi di Connessione?",
      troubleshootText: "In caso di rallentamenti temporanei, provate a disattivare e riattivare il Wi-Fi sul vostro dispositivo o a riavviare la connessione dello smartphone."
    },
    rules: {
      title: "REGOLE DELLA CASA",
      r1Title: "DIVIETO DI FUMO",
      r1Desc: "È severamente vietato fumare all'interno dell'appartamento. Consentito solo all'aperto.",
      r2Title: "CURA DEGLI ARREDI",
      r2Desc: "Vi preghiamo di trattare la casa con cura e rispetto, come fosse la vostra.",
      r3Title: "ORARI DEL SILENZIO",
      r3Desc: "Rispettare la quiete e il riposo durante le ore notturne (dalle 23:00 alle 08:00).",
      r4Title: "OSPITI NON REGISTRATI",
      r4Desc: "Non è consentito far pernottare o accedere a persone esterne non registrate.",
      r5Title: "SICUREZZA & RISPARMIO",
      r5Desc: "Chiudere sempre a chiave la porta e spegnere luci ed elettrodomestici quando uscite.",
      r6Title: "SEGNALAZIONI GUASTI",
      r6Desc: "Informateci tempestivamente in caso di guasti accidentali o necessità di assistenza."
    },
    location: {
      title: "POSIZIONE",
      heading: "Indicazioni per la nostra casa",
      howToArrive: "Come Arrivare",
      byTrain: "In Treno:",
      byTrainDesc: "Stazione FS Morbegno a 600m (8 min a piedi). Treni diretti ogni ora da Milano Centrale (linea Milano-Tirano/Bernina).",
      byCar: "In Auto:",
      byCarDesc: "Dalla SS38 Nuova Variante di Morbegno, prendere uscita Morbegno Centro. Parcheggio privato dell'abitazione con posto auto sempre riservato.",
      byPlane: "Dagli Aeroporti:",
      byPlaneDesc: "Milano Bergamo Orio al Serio (80 km), Milano Linate (100 km), Milano Malpensa (125 km)."
    },
    transport: {
      title: "TRASPORTI",
      items: [
        {
          title: "STAZIONE FERROVIARIA MORBEGNO",
          subtitle: "Stop FS Morbegno",
          time: "8 min a piedi (600 m)",
          desc: "Treni regionali diretti per Milano Centrale, Lecco, Colico, Sondrio, Tirano e Bernina Express.",
          mapsUrl: "https://maps.google.com/?q=Stazione+Morbegno"
        },
        {
          title: "AUTOBUS DI LINEA (VALLE E DINTORNI)",
          subtitle: "Fermata Via Roma / Piazza S. Antonio",
          time: "5 min a piedi",
          desc: "Autobus per Val Tartano (Ponte nel Cielo), Val Gerola, Val Masino e centri limitrofi.",
          mapsUrl: "https://maps.google.com/?q=Fermata+Bus+Morbegno"
        },
        {
          title: "SERVIZIO TAXI MORBEGNO",
          subtitle: "Piazza Stazione",
          time: "Disponibile h24 su chiamata",
          desc: "Transfer per le valli alpine, Passo San Marco, Lago di Como e stazioni sciistiche.",
          phone: "+39 0342 610000"
        },
        {
          title: "AEROPORTI DI MILANO",
          subtitle: "Orio al Serio (BGY) / Linate / Malpensa",
          time: "1h 15m in auto / Treno diretto",
          desc: "Collegamenti frequenti in treno da Morbegno per Milano Centrale e navette aeroportuali.",
          mapsUrl: "https://maps.google.com/?q=Milano+Bergamo+Airport"
        }
      ]
    },
    amenities: {
      title: "SERVIZI & DOTAZIONI",
      items: [
        { title: "LETTO MATRIMONIALE KING", desc: "Materasso ortopedico e lenzuola fresche" },
        { title: "DIVANO LETTO MATRIMONIALE", desc: "Comodo per 2 adulti o bambini" },
        { title: "WI-FI FINO A 500 MBPS", desc: "Connessione veloce senza limiti" },
        { title: "RISCALDAMENTO & RAFFRESCAMENTO A PAVIMENTO", desc: "Climatizzazione radiante autonoma a pavimento" },
        { title: "SMART TV 50\" 4K", desc: "Netflix, Prime Video & Canali satellitari" },
        { title: "POSTAZIONE SMART WORKING", desc: "Tavolo, sedia confortevole e prese vicine" },
        { title: "PIANO COTTURA COMPLETO", desc: "Fornelli e set completo di pentole" },
        { title: "LAVASTOVIGLIE", desc: "Pastiglie incluse sotto il lavello" },
        { title: "MACCHINA CAFFÈ ESPRESSO", desc: "Cialde di caffè offerte di benvenuto" },
        { title: "FORNO & MICROONDE", desc: "Funzione grill, riscaldamento e cottura" },
        { title: "FRIGORIFERO & CONGELATORE", desc: "Capiente con scomparto freezer" },
        { title: "LAVATRICE & STENDIBIANCHERIA", desc: "Detersivo e stendibiancheria forniti" },
        { title: "KIT CORTESIA BAGNO", desc: "Asciugacapelli potente, sapone e docciaschiuma" },
        { title: "PARCHEGGIO PRIVATO RISERVATO", desc: "Posto auto privato dell'abitazione sempre libero e riservato" }
      ],
      notice: "Tutti i servizi sono a vostro uso esclusivo. Vi chiediamo di spegnere luci ed elettrodomestici quando uscite per rispettare l'ambiente."
    },
    activities: {
      title: "ATTIVITÀ & ITINERARI",
      bannerText: "Esperienze indimenticabili in Valtellina & Lago di Como",
      highlights: [
        {
          tag: "UNESCO & PANORAMA",
          title: "Trenino Rosso del Bernina (Tirano - St. Moritz)",
          desc: "Patrimonio Mondiale UNESCO: la ferrovia alpina più alta d'Europa. Viaggio spettacolare tra ghiacciai, laghi alpini e valichi fino in Engadina a St. Moritz. A 45 min in treno/auto da Morbegno.",
          mapsUrl: "https://maps.google.com/?q=Stazione+Tirano+Trenino+Rosso",
          tagColor: "bg-rose-100 text-rose-800"
        },
        {
          tag: "ATTRAZIONE TOP 1",
          title: "Ponte nel Cielo (Val Tartano)",
          desc: "Ponte tibetano pedonale a 140 metri di quota sospeso sulla vallata (lungo 234m). Panorama mozzafiato fino al Lago di Como. A soli 15 min di auto o bus.",
          mapsUrl: "https://maps.google.com/?q=Ponte+nel+Cielo+Campo+Tartano",
          tagColor: "bg-amber-100 text-amber-900"
        },
        {
          tag: "NATURA & TREKKING",
          title: "Riserva Naturale Val di Mello (Val Masino)",
          desc: "La 'Piccola Yosemite' italiana: pareti di granito maestose, piscine naturali color smeraldo, cascate spettacolari e rifugi con polenta taragna. A 20 min in auto.",
          mapsUrl: "https://maps.google.com/?q=Val+di+Mello+Val+Masino",
          tagColor: "bg-emerald-100 text-emerald-900"
        },
        {
          tag: "ADRENALINA & VOLO",
          title: "Fly Emotion - Aerofune (Albaredo per San Marco)",
          desc: "Volo d'angelo panoramico assicurati a un cavo d'acciaio che attraversa la valle tra Albaredo e Bema ad oltre 100 km/h. Adatto a tutti!",
          mapsUrl: "https://maps.google.com/?q=Fly+Emotion+Albaredo",
          tagColor: "bg-blue-100 text-blue-900"
        },
        {
          tag: "LAGO & RELAX",
          title: "Spiagge di Colico & Kitesurf sul Lago di Como",
          desc: "A 15 min da Morbegno: spiagge balneabili, lungolago, noleggio barche, windsurf/kitesurf e la magnifica Abbazia di Piona.",
          mapsUrl: "https://maps.google.com/?q=Spiaggia+di+Colico+Lago+di+Como",
          tagColor: "bg-cyan-100 text-cyan-900"
        },
        {
          tag: "BENESSERE & TERME",
          title: "QC Terme Bagni di Bormio (Bagni Vecchi e Nuovi)",
          desc: "Grotte termali romane millenarie, vasche panoramiche a sfioro all'aperto affacciate sulle vette innevate alpine.",
          mapsUrl: "https://maps.google.com/?q=QC+Terme+Bormio",
          tagColor: "bg-purple-100 text-purple-900"
        }
      ],
      categoryTitle: "Altre Esperienze da Vivere",
      categories: [
        { title: "SENTIERO VALTELLINA", desc: "114 km ciclo-pedonale pianeggiante lungo l'Adda (noleggio E-bike)" },
        { title: "CANTINE & VINO SFORZATO", desc: "Tour degustazione tra i muretti a secco e cantine di Nebbiolo" },
        { title: "SCI & SPORT INVERNALI", desc: "Impianti di Pescegallo (Valgerola), Aprica, Bormio e Chiesa Valmalenco" },
        { title: "CENTRO STORICO & CROTTI", desc: "Passeggiata tra via Garibaldi, Ponte Ganda e le botteghe storiche del Bitto" }
      ]
    },
    restaurants: {
      title: "RISTORANTI CONSIGLIATI",
      bannerText: "I migliori ristoranti e osterie autentiche di Morbegno",
      recommended: [
        {
          name: "ANTICA OSTERIA RAPELLA (DAL 1886)",
          time: "7 min a piedi (550 m)",
          address: "Via Margna 36, Morbegno",
          phone: "+39 0342 610377",
          desc: "Locale storico dal 1886 nel centro di Morbegno: celebri pizzoccheri della tradizione, sciatt croccanti, carni selezionate e grandi etichette DOCG.",
          mapsUrl: "https://maps.google.com/?q=Antica+Osteria+Rapella+Morbegno"
        },
        {
          name: "OSTERIA DEL ZEP",
          time: "6 min a piedi (500 m)",
          address: "Piazza Marconi 16, Morbegno",
          phone: "+39 0342 610058",
          desc: "Osteria tipica con suggestiva cantina del '700 e camino: pasta fresca fatta in casa, pizzoccheri, sciatt con cicoria e carni alla griglia.",
          mapsUrl: "https://maps.google.com/?q=Osteria+del+Zep+Morbegno"
        },
        {
          name: "OSTERIA DEL CROTTO",
          time: "8 min a piedi (650 m)",
          address: "Via Don Giovanni Guanella 18, Morbegno",
          phone: "+39 0342 614800",
          desc: "Caratteristico crotto naturale in roccia: sciatt filanti, polenta taragna, costine e piatti della genuina cucina valtellinese.",
          mapsUrl: "https://maps.google.com/?q=Osteria+del+Crotto+Morbegno"
        },
        {
          name: "BRACERIA DEL CROTTO",
          time: "9 min a piedi (750 m)",
          address: "Via Crotto Lambertenghi 1, Morbegno",
          phone: "+39 0342 615000",
          desc: "Rinomata braceria nel crotto per tagliate di manzo, costate alla brace e specialità della tradizione montana.",
          mapsUrl: "https://maps.google.com/?q=Braceria+del+Crotto+Morbegno"
        }
      ],
      deliveryTitle: "Botteghe Storiche & Degustazione",
      deliveries: [
        { name: "FRATELLI CIAPPONI (1883)", type: "Bitto DOP, Casera, Bresaola & Grandi Vini", phone: "+39 0342 610012" },
        { name: "PASTICCERIA POLETTI", type: "Bisciola valtellinese & dolci tipici", phone: "+39 0342 611234" }
      ]
    },
    bars: {
      title: "BAR, COLAZIONI & APERITIVI",
      bannerText: "I bar e le caffetterie storiche del centro di Morbegno",
      recommended: [
        {
          name: "WINE BAR LA TAVERNETTA",
          time: "6 min a piedi (500 m)",
          address: "Via Ezio Vanoni 64, Morbegno",
          phone: "+39 0342 611007",
          desc: "Locale storico dal 1970 con ampio dehor sulla piazza: rinomato per aperitivi con sciatt caldi, birre artigianali e calici di vino.",
          mapsUrl: "https://maps.google.com/?q=Wine+Bar+La+Tavernetta+Morbegno"
        },
        {
          name: "PANIFICIO & PASTICCERIA POLETTI",
          time: "5 min a piedi (400 m)",
          address: "Via Ezio Vanoni 32, Morbegno",
          phone: "+39 0342 611234",
          desc: "Pasticceria artigianale di riferimento per colazioni con brioches fresche, ottimo caffè, pane di segale e la tipica Bisciola della Valtellina.",
          mapsUrl: "https://maps.google.com/?q=Panificio+Pasticceria+Poletti+Morbegno"
        },
        {
          name: "CAFFÈ GALLERY",
          time: "7 min a piedi (600 m)",
          address: "Via Garibaldi 42, Morbegno",
          phone: "+39 0342 615432",
          desc: "Caffetteria e cocktail bar raffinato nel centro storico, famoso per gli aperitivi gourmet e i cocktail serali.",
          mapsUrl: "https://maps.google.com/?q=Caffe+Gallery+Morbegno"
        },
        {
          name: "VINERIA BIRRERIA OTTOCENTO",
          time: "8 min a piedi (650 m)",
          address: "Via Garibaldi 16, Morbegno",
          phone: "+39 0342 612500",
          desc: "Accogliente vineria nel borgo antico con ampia selezione di vini valtellinesi DOCG, birre e taglieri di salumi locali.",
          mapsUrl: "https://maps.google.com/?q=Ottocento+Morbegno"
        }
      ],
      coffeeTitle: "Macchina del caffè a disposizione",
      coffeeDesc: "All'interno dell'appartamento troverete a vostra disposizione la macchina da caffè espresso con cialde di benvenuto in omaggio."
    },
    shopping: {
      title: "SHOPPING & ALIMENTARI",
      shops: [
        {
          title: "FRATELLI CIAPPONI - BOTTEGA STORICA",
          time: "6 min a piedi (Piazza 3 Novembre)",
          hours: "Tutti i giorni 08:30 - 19:30 (chiuso lunedì pom)",
          desc: "Autentico tempio enogastronomico dal 1883: formaggi Bitto e Casera stagionati nelle cantine sotterranee, funghi porcini, bresaola e vini.",
          mapsUrl: "https://maps.google.com/?q=Fratelli+Ciapponi+Morbegno"
        },
        {
          title: "SUPERMERCATO IPERAL / CARREFOUR",
          time: "4 min a piedi (300 m)",
          hours: "Aperto 7 giorni su 7: 08:00 - 20:30",
          desc: "Supermercato completo per la spesa quotidiana: alimentari freschi, panetteria, frutta e prodotti per la casa.",
          mapsUrl: "https://maps.google.com/?q=Supermercato+Iperal+Morbegno"
        },
        {
          title: "CENTRO COMMERCIALE FUENTES",
          time: "12 min in auto (Piantedo / Colico)",
          hours: "Tutti i giorni 09:00 - 20:30",
          desc: "Grande ipermercato con oltre 60 negozi di abbigliamento, farmacia, elettronica e ristorazione.",
          mapsUrl: "https://maps.google.com/?q=Centro+Commerciale+Fuentes+Piantedo"
        },
        {
          title: "MERCATO SETTIMANALE DI MORBEGNO",
          time: "Piazza Sant'Antonio & Centro",
          hours: "Ogni Sabato mattina: 08:00 - 13:00",
          desc: "Bancarelle di formaggi d'alpeggio, salumi a km zero, frutta fresca, abbigliamento e artigianato locale.",
          mapsUrl: "https://maps.google.com/?q=Piazza+Sant+Antonio+Morbegno"
        }
      ]
    },
    info: {
      title: "INFORMAZIONI UTILI",
      services: [
        {
          title: "FARMACIA DI TURNO",
          desc: "Farmacia San Giovanni • Via Garibaldi (5 min a piedi)",
          mapsUrl: "https://maps.google.com/?q=Farmacia+Morbegno"
        },
        {
          title: "BANCA / SPORTELLO BANCOMAT",
          desc: "Banca Popolare di Sondrio • Piazza Caduti (6 min a piedi)",
          mapsUrl: "https://maps.google.com/?q=Bancomat+Morbegno"
        },
        {
          title: "DISTRIBUTORE CARBURANTE & RICARICA EV",
          desc: "Stazione Eni Station & Colonne ricarica rapida Enel X (400 m)",
          mapsUrl: "https://maps.google.com/?q=Distributore+Morbegno"
        },
        {
          title: "UFFICIO POSTALE",
          desc: "Poste Italiane Morbegno • Via Garibaldi (8 min a piedi)",
          mapsUrl: "https://maps.google.com/?q=Poste+Italiane+Morbegno"
        },
        {
          title: "CHIESA & MONUMENTI STORICI",
          desc: "Collegiata San Giovanni Battista (sec. XVI) & Ponte Ganda (500 m)",
          mapsUrl: "https://maps.google.com/?q=Collegiata+San+Giovanni+Morbegno"
        }
      ],
      wasteTitle: "Bidoni della Spazzatura (Raccolta Differenziata)",
      wasteDesc: "I bidoni della raccolta differenziata si trovano sul retro della casa. Si prega di differenziare: Umido (marrone), Carta (blu), Plastica/Lattine (giallo) e Vetro (verde).",
      cirLabel: "Codice Identificativo Regionale (CIR):",
      cinLabel: "Codice Identificativo Nazionale (CIN):"
    },
    emergency: {
      title: "EMERGENZA & SOCCORSO",
      freeBadge: "GRATUITO",
      nationalNumbersTitle: "NUMERI SOCCORSO NAZIONALI H24",
      items: [
        {
          title: "OSPEDALE PIÙ VICINO",
          subtitle: "Presidio Ospedaliero di Morbegno / Sondrio",
          phone: "+39 0342 607111",
          mapsUrl: "https://maps.google.com/?q=Ospedale+Morbegno"
        },
        {
          title: "FARMACIA 24 ORE / TURNO",
          subtitle: "Farmacia Comunale Morbegno",
          phone: "+39 0342 611222",
          mapsUrl: "https://maps.google.com/?q=Farmacia+Morbegno"
        },
        {
          title: "CONTINUITÀ ASSISTENZIALE (GUARDIA MEDICA)",
          subtitle: "Attiva notturna e giorni festivi",
          phone: "116 117"
        },
        {
          title: "STAZIONE CARABINIERI MORBEGNO",
          subtitle: "Via Merizzi 2, Morbegno",
          phone: "+39 0342 606100",
          mapsUrl: "https://maps.google.com/?q=Carabinieri+Morbegno"
        },
        {
          title: "SERVIZIO TAXI URGENZE",
          subtitle: "Piazza Stazione Morbegno",
          phone: "+39 0342 610000"
        }
      ]
    },
    checkOut: {
      title: "CHECK-OUT",
      badge: "::: 10:00 (10 AM) :::",
      lateNote: "Se avete bisogno di un check-out posticipato, vi preghiamo di informarci in anticipo per verificare la disponibilità.",
      checklistTitle: "Prima di partire, per favore:",
      checklist: [
        { title: "PORTA VIA I TUOI OGGETTI PERSONALI", desc: "Controlla armadi, cassetti, prese elettriche e bagno per non dimenticare nulla." },
        { title: "CONTROLLA GLI ELETTRODOMESTICI", desc: "Spegni tutte le luci, il climatizzatore/riscaldamento e la TV." },
        { title: "SVUOTA I CESTINI DELLA SPAZZATURA", desc: "Porta i rifiuti differenziati nei bidoni condominiali nel cortile." },
        { title: "CHIUDI FINESTRE E IMPOSTE", desc: "Assicurati che finestre e persiane siano ben chiuse a prova di maltempo." },
        { title: "RESTITUISCI LE CHIAVI NELLA KEYBOX", desc: "Riponi le chiavi nella cassetta di sicurezza e blocca la combinazione." },
        { title: "GESTISCI GLI ASCIUGAMANI USATI", desc: "Lascia gli asciugamani usati all'interno della doccia o vasca da bagno." },
        { title: "CUCINA IN ORDINE", desc: "Lascia la cucina in ordine e attiva l'ultimo lavaggio della lavastoviglie se necessario." }
      ],
      thankYou: "Vi ringraziamo di cuore per aver soggiornato ad Aurora in Valtellina. Buon rientro a casa e a presto!"
    },
    contacts: {
      title: "CONTATTI & HOST",
      hostRole: "Il Tuo Host Locale • Aurora in Valtellina",
      quote: "Cari ospiti, sono a vostra completa disposizione durante tutto il vostro soggiorno a Morbegno. Per qualsiasi necessità, consiglio o informazione, non esitate a scrivermi o chiamarmi!",
      callAction: "Chiama",
      chatAction: "Chat WhatsApp",
      smsAction: "Invia SMS",
      emailAction: "Invia Email",
      copyPhone: "Copia Numero",
      copyEmail: "Copia Email",
      copied: "Copiato negli appunti!",
      reviewPrompt: "Speriamo che il vostro soggiorno sia stato piacevole! Il vostro feedback è prezioso per noi. Se vi fa piacere, lasciateci una recensione:",
      rateGoogle: "VALUTA SU GOOGLE",
      rateWebsite: "VALUTA NEL SITO",
      reviewDialogTitle: "Lascia la tua recensione per Aurora in Valtellina",
      ratingPrompt: "Come valuti la tua esperienza complessiva?",
      commentPrompt: "Scrivi un commento o suggerimento:",
      submitReview: "Invia Recensione",
      reviewSuccess: "Grazie di cuore per la tua preziosa recensione!"
    }
  },

  en: {
    appName: "Aurora in Valtellina",
    appSubtitle: "Your cozy mountain and lake retreat in Morbegno, Italian Alps...",
    welcome: {
      title: "WELCOME",
      greeting: "Welcome to Aurora in Valtellina!",
      message: "We are thrilled to host you in our home in Morbegno. We have prepared this digital guide to help you enjoy the best of your stay in Valtellina with comfort, relaxation, and breathtaking alpine valleys.",
      roomsTitle: "The Spaces of the House",
      livingTitle: "LIVING ROOM & LOUNGE",
      livingDesc: "Smart TV, sofa bed, and dining area",
      bedroomTitle: "MASTER BEDROOM",
      bedroomDesc: "King size bed, spacious wardrobe & fresh linens",
      kitchenTitle: "FULLY EQUIPPED KITCHEN",
      kitchenDesc: "Cooktop, oven, dishwasher & coffee maker",
      viewTitle: "COURTYARD & ALPINE VIEW",
      viewDesc: "Reserved private parking and mountain vistas"
    },
    checkIn: {
      title: "CHECK-IN",
      badge: "::: 15:00 (3 PM) :::",
      timingNotice: "Please kindly respect our check-in time from 3:00 PM onwards. If you arrive earlier or have special requests, feel free to text us on WhatsApp.",
      houseAccessTitle: "In-Person Key Handover",
      keyboxCodeLabel: "HAND DELIVERED BY HOST",
      step1: "1. The apartment keys will be handed to you in person directly by the host upon your arrival.",
      step2: "2. Please send us a quick message on WhatsApp with your estimated arrival time.",
      step3: "3. Upon arrival we will welcome you, show you the apartment, and hand you the keys.",
      parkingTitle: "RESERVED PRIVATE PARKING",
      parkingDesc: "The property features private parking with a dedicated space always free and reserved for Aurora Apartment guests throughout your stay.",
      parkingNote: "Always available for you at no additional cost."
    },
    wifi: {
      title: "WI-FI",
      networkLabel: "NETWORK NAME (SSID)",
      passwordLabel: "WI-FI PASSWORD",
      speedNotice: "Fast Wi-Fi up to 500 Mbps • HD streaming, browsing, and remote work",
      troubleshootTitle: "Having Connection Issues?",
      troubleshootText: "If the connection slows down temporarily, try toggling Wi-Fi off and back on on your device or restarting your smartphone network connection."
    },
    rules: {
      title: "HOUSE RULES",
      r1Title: "STRICT NO SMOKING",
      r1Desc: "Smoking is strictly prohibited inside the apartment. Allowed outdoors only.",
      r2Title: "CARE FOR THE HOME",
      r2Desc: "Please treat our home with care and respect, as if it were your own.",
      r3Title: "QUIET HOURS",
      r3Desc: "Please respect peace and quiet during nighttime hours (from 23:00 to 08:00).",
      r4Title: "UNREGISTERED GUESTS",
      r4Desc: "External visitors not registered in the booking are strictly not allowed.",
      r5Title: "SAFETY & ENERGY",
      r5Desc: "Always lock the entrance door and turn off lights and appliances when leaving.",
      r6Title: "PROMPT REPORTING",
      r6Desc: "Please notify us right away if anything needs maintenance or attention."
    },
    location: {
      title: "LOCATION",
      heading: "Directions to our house",
      howToArrive: "How to Arrive",
      byTrain: "By Train:",
      byTrainDesc: "Morbegno FS Train Station is 600m away (8 min walk). Direct hourly trains from Milan Central (Milan-Tirano line).",
      byCar: "By Car:",
      byCarDesc: "From SS38 Morbegno bypass, take Morbegno Centro exit. Private property parking with space always reserved for guests.",
      byPlane: "From Airports:",
      byPlaneDesc: "Milan Bergamo (80 km), Milan Linate (100 km), Milan Malpensa (125 km)."
    },
    transport: {
      title: "TRANSPORT",
      items: [
        {
          title: "MORBEGNO TRAIN STATION",
          subtitle: "Stop Morbegno FS",
          time: "8 min walk (600 m)",
          desc: "Direct regional trains to Milan Central, Lake Como (Lecco, Colico), Sondrio, Tirano, and Bernina Express.",
          mapsUrl: "https://maps.google.com/?q=Stazione+Morbegno"
        },
        {
          title: "LOCAL BUS LINES",
          subtitle: "Via Roma / Piazza S. Antonio Stop",
          time: "5 min walk",
          desc: "Buses to Val Tartano (Bridge in the Sky), Val Gerola, Val Masino, and surrounding valleys.",
          mapsUrl: "https://maps.google.com/?q=Fermata+Bus+Morbegno"
        },
        {
          title: "TAXI SERVICE MORBEGNO",
          subtitle: "Station Square",
          time: "24/7 on call",
          desc: "Direct transfers to mountain valleys, San Marco Pass, Lake Como, and ski resorts.",
          phone: "+39 0342 610000"
        },
        {
          title: "MILAN AIRPORTS",
          subtitle: "Bergamo (BGY) / Linate / Malpensa",
          time: "1h 15m by car / Direct train",
          desc: "Convenient rail connections from Morbegno to Milan Central followed by express airport shuttles.",
          mapsUrl: "https://maps.google.com/?q=Milano+Bergamo+Airport"
        }
      ]
    },
    amenities: {
      title: "AMENITIES & COMFORTS",
      items: [
        { title: "KING SIZE BED", desc: "Orthopedic mattress and crisp fresh linens" },
        { title: "DOUBLE SOFA BED", desc: "Comfortable for 2 additional guests" },
        { title: "WI-FI UP TO 500 MBPS", desc: "Fast unlimited wireless connection" },
        { title: "UNDERFLOOR HEATING & COOLING", desc: "Radiant floor climate control system" },
        { title: "50\" 4K SMART TV", desc: "Netflix, Prime Video & satellite channels" },
        { title: "WORK DESK AREA", desc: "Comfortable table, chair and nearby power outlets" },
        { title: "FULL COOKTOP & STOVE", desc: "Complete cookware set and burners" },
        { title: "DISHWASHER", desc: "Detergent pods provided under the sink" },
        { title: "ESPRESSO COFFEE MAKER", desc: "Complimentary welcome coffee pods" },
        { title: "OVEN & MICROWAVE", desc: "Grill, heating, and baking modes" },
        { title: "REFRIGERATOR & FREEZER", desc: "Spacious fridge with freezer box" },
        { title: "WASHING MACHINE & DRYING RACK", desc: "Detergent and drying rack provided" },
        { title: "BATHROOM COURTESY SET", desc: "Hair dryer, soap, body wash and fresh towels" },
        { title: "RESERVED PRIVATE PARKING", desc: "Dedicated space always free and reserved on the property" }
      ],
      notice: "All amenities are for your exclusive use. Please help us conserve energy by turning off appliances and lights when leaving the house."
    },
    activities: {
      title: "ACTIVITIES & EXCURSIONS",
      bannerText: "Unforgettable alpine experiences in Valtellina & Lake Como",
      highlights: [
        {
          tag: "UNESCO WORLD HERITAGE",
          title: "Bernina Red Train Express (Tirano - St. Moritz)",
          desc: "UNESCO World Heritage: Europe's highest alpine railway. A breathtaking journey across glaciers, alpine lakes, and passes all the way to St. Moritz in Switzerland.",
          mapsUrl: "https://maps.google.com/?q=Stazione+Tirano+Trenino+Rosso",
          tagColor: "bg-rose-100 text-rose-800"
        },
        {
          tag: "TOP HIGHLIGHT 1",
          title: "Bridge in the Sky / Ponte nel Cielo (Val Tartano)",
          desc: "One of Europe's highest pedestrian suspension bridges at 140m altitude (234m long) with stunning vistas over Orobie Alps and Lake Como. 15 min drive.",
          mapsUrl: "https://maps.google.com/?q=Ponte+nel+Cielo+Campo+Tartano",
          tagColor: "bg-amber-100 text-amber-900"
        },
        {
          tag: "NATURE & HIKING",
          title: "Val di Mello Nature Reserve (Val Masino)",
          desc: "Known as Italy's 'Little Yosemite': towering granite cliffs, crystal-clear emerald pools, waterfalls, and alpine huts serving polenta taragna. 20 min drive.",
          mapsUrl: "https://maps.google.com/?q=Val+di+Mello+Val+Masino",
          tagColor: "bg-emerald-100 text-emerald-900"
        },
        {
          tag: "ADVENTURE & ZIPLINE",
          title: "Fly Emotion Zipline (Albaredo per San Marco)",
          desc: "Fly like an eagle across the alpine valley attached to a scenic zip-line at over 100 km/h. Suitable for couples and families!",
          mapsUrl: "https://maps.google.com/?q=Fly+Emotion+Albaredo",
          tagColor: "bg-blue-100 text-blue-900"
        },
        {
          tag: "LAKE & WATERSPORTS",
          title: "Lake Como Beaches & Kitesurfing in Colico",
          desc: "Only 15 min from Morbegno: pebble beaches, lakeside promenade, boat rentals, windsurfing, kitesurfing, and historic Piona Abbey.",
          mapsUrl: "https://maps.google.com/?q=Spiaggia+di+Colico+Lago+di+Como",
          tagColor: "bg-cyan-100 text-cyan-900"
        },
        {
          tag: "THERMAL SPA & WELLNESS",
          title: "QC Terme Bormio Thermal Baths",
          desc: "Millenary Roman thermal caves and outdoor panoramic infinity pools overlooking snow-capped alpine peaks.",
          mapsUrl: "https://maps.google.com/?q=QC+Terme+Bormio",
          tagColor: "bg-purple-100 text-purple-900"
        }
      ],
      categoryTitle: "More Things To Do",
      categories: [
        { title: "VALTELLINA BIKE TRAIL", desc: "114 km flat scenic cycling path along Adda River (E-bike rentals available)" },
        { title: "NEBBIOLO & SFORZATO WINE TOURS", desc: "Tasting tours across ancient terraced vineyards and historic wine cellars" },
        { title: "SKI & WINTER SPORTS", desc: "Pescegallo (Valgerola), Aprica, Bormio, and Chiesa Valmalenco slopes" },
        { title: "HISTORIC MORBEGNO & BITTO CHEESE", desc: "Stroll through antique alleyways, Ganda Bridge, and century-old artisan shops" }
      ]
    },
    restaurants: {
      title: "RECOMMENDED DINING",
      bannerText: "Authentic restaurants & historic taverns in Morbegno",
      recommended: [
        {
          name: "ANTICA OSTERIA RAPELLA (SINCE 1886)",
          time: "7 min walk (550 m)",
          address: "Via Margna 36, Morbegno",
          phone: "+39 0342 610377",
          desc: "Historic tavern since 1886 in Morbegno center: famous traditional pizzoccheri, crispy sciatt fritters, choice meats, and premier DOCG wines.",
          mapsUrl: "https://maps.google.com/?q=Antica+Osteria+Rapella+Morbegno"
        },
        {
          name: "OSTERIA DEL ZEP",
          time: "6 min walk (500 m)",
          address: "Piazza Marconi 16, Morbegno",
          phone: "+39 0342 610058",
          desc: "Authentic tavern with 18th-century cellar and fireplace: handmade fresh pasta, pizzoccheri, sciatt on chicory, and grilled meats.",
          mapsUrl: "https://maps.google.com/?q=Osteria+del+Zep+Morbegno"
        },
        {
          name: "OSTERIA DEL CROTTO",
          time: "8 min walk (650 m)",
          address: "Via Don Giovanni Guanella 18, Morbegno",
          phone: "+39 0342 614800",
          desc: "Traditional alpine crotto tavern set in natural rock: gooey cheese sciatt, polenta taragna, ribs, and wholesome Valtellina specialties.",
          mapsUrl: "https://maps.google.com/?q=Osteria+del+Crotto+Morbegno"
        },
        {
          name: "BRACERIA DEL CROTTO",
          time: "9 min walk (750 m)",
          address: "Via Crotto Lambertenghi 1, Morbegno",
          phone: "+39 0342 615000",
          desc: "Renowned grill house in a stone crotto setting for prime beef cuts, flame-grilled steaks, and mountain dishes.",
          mapsUrl: "https://maps.google.com/?q=Braceria+del+Crotto+Morbegno"
        }
      ],
      deliveryTitle: "Historic Bottegas & Tasting",
      deliveries: [
        { name: "FRATELLI CIAPPONI (1883)", type: "Bitto DOP, Casera, Bresaola & Fine Wines", phone: "+39 0342 610012" },
        { name: "PASTICCERIA POLETTI", type: "Valtellina Bisciola & Traditional Pastries", phone: "+39 0342 611234" }
      ]
    },
    bars: {
      title: "BARS, CAFÉS & APERITIFS",
      bannerText: "Historic bakeries, wine bars & aperitivo in Morbegno",
      recommended: [
        {
          name: "WINE BAR LA TAVERNETTA",
          time: "6 min walk (500 m)",
          address: "Via Ezio Vanoni 64, Morbegno",
          phone: "+39 0342 611007",
          desc: "Historic wine bar since 1970 with outdoor seating: famous for aperitifs with warm sciatt fritters, craft beers, and local wines.",
          mapsUrl: "https://maps.google.com/?q=Wine+Bar+La+Tavernetta+Morbegno"
        },
        {
          name: "PANIFICIO & PASTICCERIA POLETTI",
          time: "5 min walk (400 m)",
          address: "Via Ezio Vanoni 32, Morbegno",
          phone: "+39 0342 611234",
          desc: "Artisan bakery and pastry shop for breakfast with fresh croissants, creamy espresso, rye bread, and authentic Valtellina Bisciola.",
          mapsUrl: "https://maps.google.com/?q=Panificio+Pasticceria+Poletti+Morbegno"
        },
        {
          name: "CAFFÈ GALLERY",
          time: "7 min walk (600 m)",
          address: "Via Garibaldi 42, Morbegno",
          phone: "+39 0342 615432",
          desc: "Refined café and cocktail bar in Morbegno's historic center, popular for gourmet aperitivo and evening drinks.",
          mapsUrl: "https://maps.google.com/?q=Caffe+Gallery+Morbegno"
        },
        {
          name: "VINERIA BIRRERIA OTTOCENTO",
          time: "8 min walk (650 m)",
          address: "Via Garibaldi 16, Morbegno",
          phone: "+39 0342 612500",
          desc: "Cozy wine & beer tavern in the old town featuring Valtellina DOCG wines, local beers, and cured meat platters.",
          mapsUrl: "https://maps.google.com/?q=Ottocento+Morbegno"
        }
      ],
      coffeeTitle: "Coffee Machine Available in House",
      coffeeDesc: "Inside the apartment you will find an espresso coffee machine with complimentary welcome coffee pods."
    },
    shopping: {
      title: "SHOPPING & GROCERIES",
      shops: [
        {
          title: "FRATELLI CIAPPONI - HISTORIC BOTTEGA",
          time: "6 min walk (Piazza 3 Novembre)",
          hours: "Daily 08:30 - 19:30 (closed Mon afternoon)",
          desc: "A culinary wonderland since 1883: vintage underground cellars aging Bitto and Casera cheeses, porcini mushrooms, and wines.",
          mapsUrl: "https://maps.google.com/?q=Fratelli+Ciapponi+Morbegno"
        },
        {
          title: "IPERAL / CARREFOUR SUPERMARKET",
          time: "4 min walk (300 m)",
          hours: "Open 7 days a week: 08:00 - 20:30",
          desc: "Fully stocked supermarket for daily essentials: fresh produce, bakery, deli, and home products.",
          mapsUrl: "https://maps.google.com/?q=Supermercato+Iperal+Morbegno"
        },
        {
          title: "FUENTES SHOPPING MALL",
          time: "12 min drive (Piantedo / Colico)",
          hours: "Daily 09:00 - 20:30",
          desc: "Large hypermarket with 60+ stores, fashion, pharmacy, electronics, and dining.",
          mapsUrl: "https://maps.google.com/?q=Centro+Commerciale+Fuentes+Piantedo"
        },
        {
          title: "MORBEGNO SATURDAY MARKET",
          time: "Piazza Sant'Antonio & Center",
          hours: "Every Saturday morning: 08:00 - 13:00",
          desc: "Local open-air market with regional farm cheeses, cured meats, fresh fruit, apparel, and crafts.",
          mapsUrl: "https://maps.google.com/?q=Piazza+Sant+Antonio+Morbegno"
        }
      ]
    },
    info: {
      title: "USEFUL INFORMATION",
      services: [
        {
          title: "ON-DUTY PHARMACY",
          desc: "San Giovanni Pharmacy • Via Garibaldi (5 min walk)",
          mapsUrl: "https://maps.google.com/?q=Farmacia+Morbegno"
        },
        {
          title: "BANK / 24/7 ATM",
          desc: "Banca Popolare di Sondrio • Piazza Caduti (6 min walk)",
          mapsUrl: "https://maps.google.com/?q=Bancomat+Morbegno"
        },
        {
          title: "GAS STATION & EV CHARGERS",
          desc: "Eni Station & Enel X fast EV chargers (400 m)",
          mapsUrl: "https://maps.google.com/?q=Distributore+Morbegno"
        },
        {
          title: "POST OFFICE",
          desc: "Poste Italiane Morbegno • Via Garibaldi (8 min walk)",
          mapsUrl: "https://maps.google.com/?q=Poste+Italiane+Morbegno"
        },
        {
          title: "CHURCH & HISTORIC MONUMENTS",
          desc: "St. John the Baptist Collegiate Church & Ganda Bridge (500 m)",
          mapsUrl: "https://maps.google.com/?q=Collegiata+San+Giovanni+Morbegno"
        }
      ],
      wasteTitle: "Waste & Recycling Bins",
      wasteDesc: "Recycling bins are located at the back of the house. Please separate: Organic (brown), Paper (blue), Plastic & Cans (yellow), Glass (green).",
      cirLabel: "Regional Identification Code (CIR):",
      cinLabel: "National Identification Code (CIN):"
    },
    emergency: {
      title: "EMERGENCY CONTACTS",
      freeBadge: "FREE CALL",
      nationalNumbersTitle: "24/7 EMERGENCY HOTLINES",
      items: [
        {
          title: "NEAREST HOSPITAL",
          subtitle: "Morbegno / Sondrio Regional Hospital",
          phone: "+39 0342 607111",
          mapsUrl: "https://maps.google.com/?q=Ospedale+Morbegno"
        },
        {
          title: "24/7 PHARMACY",
          subtitle: "Morbegno Municipal Pharmacy",
          phone: "+39 0342 611222",
          mapsUrl: "https://maps.google.com/?q=Farmacia+Morbegno"
        },
        {
          title: "DOCTOR ON CALL (GUARDIA MEDICA)",
          subtitle: "Night & holiday emergency doctor",
          phone: "116 117"
        },
        {
          title: "CARABINIERI POLICE STATION",
          subtitle: "Via Merizzi 2, Morbegno",
          phone: "+39 0342 606100",
          mapsUrl: "https://maps.google.com/?q=Carabinieri+Morbegno"
        },
        {
          title: "EMERGENCY TAXI",
          subtitle: "Station Square Morbegno",
          phone: "+39 0342 610000"
        }
      ]
    },
    checkOut: {
      title: "CHECK-OUT",
      badge: "::: 10:00 (10 AM) :::",
      lateNote: "If you require late check-out, please let us know in advance so we can verify availability.",
      checklistTitle: "Before leaving, please kindly:",
      checklist: [
        { title: "TAKE ALL PERSONAL BELONGINGS", desc: "Check closets, drawers, bathroom, and charging plugs to ensure nothing is left behind." },
        { title: "TURN OFF APPLIANCES", desc: "Switch off all lights, air conditioning/heating, and TV." },
        { title: "EMPTY TRASH BINS", desc: "Dispose of sorted recycling in the courtyard bins." },
        { title: "CLOSE WINDOWS & SHUTTERS", desc: "Ensure all windows and shutters are securely latched against weather." },
        { title: "RETURN KEYS TO KEYBOX", desc: "Place the house keys back inside the lockbox and scramble the code." },
        { title: "PLACE USED TOWELS IN SHOWER", desc: "Leave damp towels inside the shower or bathtub." },
        { title: "LEAVE KITCHEN TIDY", desc: "Ensure dishes are in the dishwasher and start the final cleaning cycle if needed." }
      ],
      thankYou: "Thank you wholeheartedly for staying at Aurora in Valtellina. Safe travels home, and we hope to welcome you again soon!"
    },
    contacts: {
      title: "CONTACT & HOST",
      hostRole: "Your Local Host • Aurora in Valtellina",
      quote: "Dear guests, I am completely at your service throughout your stay in Morbegno. For any assistance, recommendations, or questions, please don't hesitate to text or call me!",
      callAction: "Call Host",
      chatAction: "WhatsApp Chat",
      smsAction: "Send SMS",
      emailAction: "Send Email",
      copyPhone: "Copy Number",
      copyEmail: "Copy Email",
      copied: "Copied to clipboard!",
      reviewPrompt: "We hope you had a memorable stay! Your feedback means the world to us. Please take a moment to share your review:",
      rateGoogle: "REVIEW ON GOOGLE",
      rateWebsite: "REVIEW ON WEBSITE",
      reviewDialogTitle: "Leave your review for Aurora in Valtellina",
      ratingPrompt: "How would you rate your overall stay?",
      commentPrompt: "Write your feedback or comments:",
      submitReview: "Submit Review",
      reviewSuccess: "Thank you sincerely for your valuable review!"
    }
  },

  fr: {
    appName: "Aurora in Valtellina",
    appSubtitle: "Votre havre de paix alpin à Morbegno, entre lac et montagnes...",
    welcome: {
      title: "BIENVENUE",
      greeting: "Bienvenue à Aurora in Valtellina !",
      message: "Nous sommes ravis de vous accueillir dans notre maison à Morbegno. Ce livret digital est conçu pour vous offrir un séjour parfait en Valtelline entre confort, nature et détente.",
      roomsTitle: "Les Espaces De La Maison",
      livingTitle: "SALON & DÉTENTE",
      livingDesc: "Smart TV, canapé-lit et coin repas",
      bedroomTitle: "CHAMBRE PRINCIPALE",
      bedroomDesc: "Lit King Size, grande armoire et draps frais",
      kitchenTitle: "CUISINE ÉQUIPÉE",
      kitchenDesc: "Plaque de cuisson, four, lave-vaisselle & machine à café",
      viewTitle: "COUR & VUE SUR LES ALPES",
      viewDesc: "Parking privé réservé et panorama sur les sommets"
    },
    checkIn: {
      title: "ARRIVÉE (CHECK-IN)",
      badge: "::: 15:00 (3 PM) :::",
      timingNotice: "L'accès au logement est possible dès 15h00. Pour toute demande d'arrivée anticipée, écrivez-nous sur WhatsApp.",
      houseAccessTitle: "Remise des Clés en Main Propre",
      keyboxCodeLabel: "REMISE EN PERSONNE PAR L'HÔTE",
      step1: "1. Les clés de l'appartement vous seront remises en main propre par votre hôte à votre arrivée.",
      step2: "2. Merci de nous envoyer un message sur WhatsApp pour nous indiquer votre heure d'arrivée estimée.",
      step3: "3. À votre arrivée, nous vous accueillerons chaleureusement pour vous présenter l'appartement et vous remettre les clés.",
      parkingTitle: "PARKING PRIVÉ RÉSERVÉ",
      parkingDesc: "La propriété dispose d'un parking privé avec une place toujours libre et réservée pour les hôtes de l'Appartement Aurora.",
      parkingNote: "Toujours à votre disposition sans frais supplémentaires."
    },
    wifi: {
      title: "WI-FI",
      networkLabel: "NOM DU RÉSEAU (SSID)",
      passwordLabel: "MOT DE PASSE WI-FI",
      speedNotice: "Wi-Fi rapide jusqu'à 500 Mbps • Streaming HD, navigation et télétravail",
      troubleshootTitle: "Problème de connexion ?",
      troubleshootText: "En cas de ralentissement, désactivez puis réactivez le Wi-Fi sur votre appareil ou redémarrez la connexion de votre smartphone."
    },
    rules: {
      title: "RÈGLEMENT INTÉRIEUR",
      r1Title: "STRICTEMENT NON-FUMEUR",
      r1Desc: "Il est strictement interdit de fumer à l'intérieur. Autorisé uniquement dehors.",
      r2Title: "SOIN DU LOGEMENT",
      r2Desc: "Merci de prendre soin de la maison comme s'il s'agissait de la vôtre.",
      r3Title: "HEURES DE CALME",
      r3Desc: "Merci de respecter le calme pendant les heures de nuit (de 23h00 à 08h00).",
      r4Title: "INVITÉS NON ENREGISTRÉS",
      r4Desc: "Les personnes extérieures non mentionnées dans la réservation ne sont pas admises.",
      r5Title: "SÉCURITÉ & ÉNERGIE",
      r5Desc: "Verrouillez la porte et éteignez les appareils et lumières en partant.",
      r6Title: "SIGNALEMENT",
      r6Desc: "Prévenez-nous immédiatement en cas de panne ou de besoin particulier."
    },
    location: {
      title: "EMPLACEMENT",
      heading: "Itinéraire vers notre maison",
      howToArrive: "Comment Venir",
      byTrain: "En Train :",
      byTrainDesc: "Gare FS de Morbegno à 600m (8 min à pied). Trains directs depuis Milan-Centrale chaque heure.",
      byCar: "En Voiture :",
      byCarDesc: "Via la SS38, sortie Morbegno Centro. Parking privé de l'habitation avec place toujours réservée.",
      byPlane: "Depuis les Aéroports :",
      byPlaneDesc: "Milan Bergame (80 km), Milan Linate (100 km), Milan Malpensa (125 km)."
    },
    transport: {
      title: "TRANSPORTS",
      items: [
        {
          title: "GARE FERROVIAIRE DE MORBEGNO",
          subtitle: "Arrêt Morbegno FS",
          time: "8 min à pied (600 m)",
          desc: "Trains directs vers Milan Centrale, Lac de Côme, Sondrio, Tirano et le Bernina Express.",
          mapsUrl: "https://maps.google.com/?q=Stazione+Morbegno"
        },
        {
          title: "BUS LOCAUX",
          subtitle: "Arrêt Via Roma / Piazza S. Antonio",
          time: "5 min à pied",
          desc: "Lignes pour le Val Tartano (Ponte nel Cielo), Val Gerola et Val Masino.",
          mapsUrl: "https://maps.google.com/?q=Fermata+Bus+Morbegno"
        },
        {
          title: "SERVICE TAXI MORBEGNO",
          subtitle: "Place de la Gare",
          time: "Disponible 24h/24",
          desc: "Transferts vers les vallées alpines, cols, Lac de Côme et stations de ski.",
          phone: "+39 0342 610000"
        },
        {
          title: "AÉROPORTS DE MILAN",
          subtitle: "Bergame / Linate / Malpensa",
          time: "1h 15m en voiture / Train direct",
          desc: "Liaisons ferroviaires fréquentes vers Milan Centrale puis navettes express.",
          mapsUrl: "https://maps.google.com/?q=Milano+Bergamo+Airport"
        }
      ]
    },
    amenities: {
      title: "ÉQUIPEMENTS & SERVICES",
      items: [
        { title: "LIT KING SIZE", desc: "Matelas orthopédique et literie soignée" },
        { title: "CANAPÉ-LIT DOUBLE", desc: "Confortable pour 2 personnes" },
        { title: "WI-FI JUSQU'À 500 MBPS", desc: "Connexion sans fil rapide et illimitée" },
        { title: "CHAUFFAGE & RAFRAÎCHISSEMENT AU SOL", desc: "Climatisation par plancher rayonnant" },
        { title: "SMART TV 50\" 4K", desc: "Netflix, Prime Video et chaînes streaming" },
        { title: "ESPACE BUREAU", desc: "Table de travail et prises électriques" },
        { title: "PLAQUE DE CUISSON COMPLÈTE", desc: "Cuisine équipée avec casseroles et poêles" },
        { title: "LAVE-VAISSELLE", desc: "Pastilles fournies sous l'évier" },
        { title: "MACHINE À CAFÉ ESPRESSO", desc: "Capsules de café de bienvenue offertes" },
        { title: "FOUR & MICRO-ONDES", desc: "Cuisson, réchauffage et décongélation" },
        { title: "RÉFRIGÉRATEUR & CONGÉLATEUR", desc: "Grand modèle avec compartiment congélateur" },
        { title: "LAVE-LINGE & ÉTENDOIR", desc: "Lessive et étendoir fournis" },
        { title: "ARTICLES DE TOILETTE", desc: "Sèche-cheveux puissant, serviettes et gel douche" },
        { title: "PARKING PRIVÉ RÉSERVÉ", desc: "Parking privé de l'habitation avec place toujours réservée" }
      ],
      notice: "Tous les équipements sont réservés à votre usage exclusif. Merci d'éteindre les appareils et lumières en quittant les lieux."
    },
    activities: {
      title: "ACTIVITÉS & NATURE",
      bannerText: "Expériences inoubliables en Valtelline & Lac de Côme",
      highlights: [
        {
          tag: "PATRIMOINE UNESCO",
          title: "Train Rouge du Bernina (Tirano - Saint-Moritz)",
          desc: "Patrimoine mondial UNESCO : le train panoramique alpin le plus haut d'Europe traversant glaciers et cols jusqu'en Suisse à Saint-Moritz.",
          mapsUrl: "https://maps.google.com/?q=Stazione+Tirano+Trenino+Rosso",
          tagColor: "bg-rose-100 text-rose-800"
        },
        {
          tag: "INCONTOURNABLE 1",
          title: "Ponte nel Cielo (Val Tartano)",
          desc: "Pont suspendu piétonnier à 140 m au-dessus du vide (234 m de long) avec une vue panoramique grandiose jusqu'au lac de Côme. À 15 min.",
          mapsUrl: "https://maps.google.com/?q=Ponte+nel+Cielo+Campo+Tartano",
          tagColor: "bg-amber-100 text-amber-900"
        },
        {
          tag: "NATURE & RANDONNÉE",
          title: "Réserve Naturelle du Val di Mello",
          desc: "Le 'Petit Yosemite' italien : falaises granitiques grandioses, vasques d'eau turquoise et auberges d'alpage. À 20 min.",
          mapsUrl: "https://maps.google.com/?q=Val+di+Mello+Val+Masino",
          tagColor: "bg-emerald-100 text-emerald-900"
        },
        {
          tag: "SENSATIONS FORTES",
          title: "Fly Emotion - Tyrolienne (Albaredo)",
          desc: "Survolez la vallée alpine suspendu à un câble à plus de 100 km/h pour une expérience unique !",
          mapsUrl: "https://maps.google.com/?q=Fly+Emotion+Albaredo",
          tagColor: "bg-blue-100 text-blue-900"
        },
        {
          tag: "LAC & NAUTISME",
          title: "Plages de Colico & Kitesurf au Lac de Côme",
          desc: "À 15 min de Morbegno : plages de baignade, voile, kitesurf et l'abbaye historique de Piona.",
          mapsUrl: "https://maps.google.com/?q=Spiaggia+di+Colico+Lago+di+Como",
          tagColor: "bg-cyan-100 text-cyan-900"
        },
        {
          tag: "THERMES & DÉTENTE",
          title: "QC Terme Bormio (Bains Romains)",
          desc: "Bains thermaux historiques et bassins extérieurs chauds face aux sommets enneigés.",
          mapsUrl: "https://maps.google.com/?q=QC+Terme+Bormio",
          tagColor: "bg-purple-100 text-purple-900"
        }
      ],
      categoryTitle: "Autres découvertes locales",
      categories: [
        { title: "PISTE CYCLABLE VALTELLINA", desc: "114 km le long de la rivière Adda (location de vélos électriques)" },
        { title: "DÉGUSTATION DE VINS SFORZATO", desc: "Visite des vignobles en terrasses de Nebbiolo et caves historiques" },
        { title: "SKI & MONTAGNE", desc: "Stations de Pescegallo (Valgerola), Aprica et Bormio" },
        { title: "CENTRE HISTORIQUE DE MORBEGNO", desc: "Ruelles pavées, Pont Ganda et caves à fromage Bitto séculaires" }
      ]
    },
    restaurants: {
      title: "RESTAURANTS RECOMMANDÉS",
      bannerText: "Les meilleures tables et osterias authentiques de Morbegno",
      recommended: [
        {
          name: "ANTICA OSTERIA RAPELLA (DEPUIS 1886)",
          time: "7 min à pied (550 m)",
          address: "Via Margna 36, Morbegno",
          phone: "+39 0342 610377",
          desc: "Établissement historique depuis 1886 : pizzoccheri traditionnels réputés, sciatt croustillants, viandes sélectionnées et vins DOCG.",
          mapsUrl: "https://maps.google.com/?q=Antica+Osteria+Rapella+Morbegno"
        },
        {
          name: "OSTERIA DEL ZEP",
          time: "6 min à pied (500 m)",
          address: "Piazza Marconi 16, Morbegno",
          phone: "+39 0342 610058",
          desc: "Osteria typique avec cave voûtée du XVIIIe siècle : pâtes fraîches maison, pizzoccheri, sciatt et viandes grillées.",
          mapsUrl: "https://maps.google.com/?q=Osteria+del+Zep+Morbegno"
        },
        {
          name: "OSTERIA DEL CROTTO",
          time: "8 min à pied (650 m)",
          address: "Via Don Giovanni Guanella 18, Morbegno",
          phone: "+39 0342 614800",
          desc: "Crotto traditionnel en roche naturelle : sciatt fondants, polenta taragna, travers de porc et cuisine valtellinaise généreuse.",
          mapsUrl: "https://maps.google.com/?q=Osteria+del+Crotto+Morbegno"
        },
        {
          name: "BRACERIA DEL CROTTO",
          time: "9 min à pied (750 m)",
          address: "Via Crotto Lambertenghi 1, Morbegno",
          phone: "+39 0342 615000",
          desc: "Brasserie et grillade réputée pour ses viandes de bœuf maturées au feu de bois et ses plats d'alpage.",
          mapsUrl: "https://maps.google.com/?q=Braceria+del+Crotto+Morbegno"
        }
      ],
      deliveryTitle: "Épiceries Historiques & Dégustation",
      deliveries: [
        { name: "FRATELLI CIAPPONI (1883)", type: "Bitto DOP, Casera, Bresaola & Grands Vins", phone: "+39 0342 610012" },
        { name: "PASTICCERIA POLETTI", type: "Bisciola de Valtelline & Pâtisseries", phone: "+39 0342 611234" }
      ]
    },
    bars: {
      title: "BARS, CAFÉS & APÉRITIFS",
      bannerText: "Pâtisseries d'époque, bars à vin et terrasses à Morbegno",
      recommended: [
        {
          name: "WINE BAR LA TAVERNETTA",
          time: "6 min à pied (500 m)",
          address: "Via Ezio Vanoni 64, Morbegno",
          phone: "+39 0342 611007",
          desc: "Bar à vin historique depuis 1970 avec terrasse : apéritifs avec sciatt chauds, bières artisanales et sélection de vins.",
          mapsUrl: "https://maps.google.com/?q=Wine+Bar+La+Tavernetta+Morbegno"
        },
        {
          name: "PANIFICIO & PASTICCERIA POLETTI",
          time: "5 min à pied (400 m)",
          address: "Via Ezio Vanoni 32, Morbegno",
          phone: "+39 0342 611234",
          desc: "Pâtisserie artisanale incontournable pour le petit-déjeuner avec viennoiseries, café expresso, pain de seigle et Bisciola.",
          mapsUrl: "https://maps.google.com/?q=Panificio+Pasticceria+Poletti+Morbegno"
        },
        {
          name: "CAFFÈ GALLERY",
          time: "7 min à pied (600 m)",
          address: "Via Garibaldi 42, Morbegno",
          phone: "+39 0342 615432",
          desc: "Café et bar à cocktails élégant au cœur du centre historique, prisé pour ses apéritifs et verres en soirée.",
          mapsUrl: "https://maps.google.com/?q=Caffe+Gallery+Morbegno"
        },
        {
          name: "VINERIA BIRRERIA OTTOCENTO",
          time: "8 min à pied (650 m)",
          address: "Via Garibaldi 16, Morbegno",
          phone: "+39 0342 612500",
          desc: "Bar à vin et bières chaleureux dans le vieux bourg avec vins valtellinais DOCG et planches de charcuteries locales.",
          mapsUrl: "https://maps.google.com/?q=Ottocento+Morbegno"
        }
      ],
      coffeeTitle: "Machine à café à disposition",
      coffeeDesc: "La machine à café espresso de l'appartement est à votre disposition avec capsules de bienvenue offertes."
    },
    shopping: {
      title: "COMMERCES & ALIMENTATION",
      shops: [
        {
          title: "FRATELLI CIAPPONI - ÉPICERIE HISTORIQUE",
          time: "6 min à pied (Piazza 3 Novembre)",
          hours: "Tous les jours 08h30 - 19h30 (fermé lun. après-midi)",
          desc: "Temple de la gastronomie depuis 1883 : caves souterraines d'affinage de Bitto et Casera, cèpes séchés, bresaola et vins rares.",
          mapsUrl: "https://maps.google.com/?q=Fratelli+Ciapponi+Morbegno"
        },
        {
          title: "SUPERMARCHÉ IPERAL / CARREFOUR",
          time: "4 min à pied (300 m)",
          hours: "Ouvert 7j/7 : 08h00 - 20h30",
          desc: "Supermarché complet pour vos courses quotidiennes : produits frais, boulangerie et épicerie.",
          mapsUrl: "https://maps.google.com/?q=Supermercato+Iperal+Morbegno"
        },
        {
          title: "CENTRE COMMERCIAL FUENTES",
          time: "12 min en voiture (Piantedo / Colico)",
          hours: "Tous les jours 09h00 - 20h30",
          desc: "Hypermarché et plus de 60 boutiques de mode, pharmacie, électronique et restaurants.",
          mapsUrl: "https://maps.google.com/?q=Centro+Commerciale+Fuentes+Piantedo"
        },
        {
          title: "MARCHÉ DU SAMEDI DE MORBEGNO",
          time: "Piazza Sant'Antonio & Centre",
          hours: "Chaque samedi matin : 08h00 - 13h00",
          desc: "Marché traditionnel de producteurs locaux, fromages d'alpage, charcuterie et artisanat.",
          mapsUrl: "https://maps.google.com/?q=Piazza+Sant+Antonio+Morbegno"
        }
      ]
    },
    info: {
      title: "INFORMATIONS PRATIQUES",
      services: [
        {
          title: "PHARMACIE DE GARDE",
          desc: "Pharmacie San Giovanni • Via Garibaldi (5 min à pied)",
          mapsUrl: "https://maps.google.com/?q=Farmacia+Morbegno"
        },
        {
          title: "BANQUE & DISTRIBUTEUR 24H",
          desc: "Banca Popolare di Sondrio • Piazza Caduti (6 min à pied)",
          mapsUrl: "https://maps.google.com/?q=Bancomat+Morbegno"
        },
        {
          title: "STATION SERVICE & BORNES VE",
          desc: "Eni Station & recharge rapide Enel X (400 m)",
          mapsUrl: "https://maps.google.com/?q=Distributore+Morbegno"
        },
        {
          title: "BUREAU DE POSTE",
          desc: "Poste Italiane Morbegno • Via Garibaldi (8 min à pied)",
          mapsUrl: "https://maps.google.com/?q=Poste+Italiane+Morbegno"
        },
        {
          title: "ÉGLISES & MONUMENTS",
          desc: "Collégiale San Giovanni Battista & Pont Ganda (500 m)",
          mapsUrl: "https://maps.google.com/?q=Collegiata+San+Giovanni+Morbegno"
        }
      ],
      wasteTitle: "Tri des Déchets (Bacs à l'Arrière)",
      wasteDesc: "Les bacs de tri sélectif se trouvent sur le côté arrière de la maison : Déchets organiques (marron), Papier (bleu), Plastique/Métal (jaune), Verre (vert).",
      cirLabel: "Code d'identification régional (CIR) :",
      cinLabel: "Code d'identification national (CIN) :"
    },
    emergency: {
      title: "URGENCES & SECOURS",
      freeBadge: "GRATUIT",
      nationalNumbersTitle: "NUMÉROS D'URGENCE 24H/24",
      items: [
        {
          title: "HÔPITAL LE PLUS PROCHE",
          subtitle: "Hôpital de Morbegno / Sondrio",
          phone: "+39 0342 607111",
          mapsUrl: "https://maps.google.com/?q=Ospedale+Morbegno"
        },
        {
          title: "PHARMACIE 24H / DE GARDE",
          subtitle: "Pharmacie Municipale de Morbegno",
          phone: "+39 0342 611222",
          mapsUrl: "https://maps.google.com/?q=Farmacia+Morbegno"
        },
        {
          title: "MÉDECIN DE GARDE (GUARDIA MEDICA)",
          subtitle: "Nuits et jours fériés",
          phone: "116 117"
        },
        {
          title: "GENDARMERIE (CARABINIERI)",
          subtitle: "Via Merizzi 2, Morbegno",
          phone: "+39 0342 606100",
          mapsUrl: "https://maps.google.com/?q=Carabinieri+Morbegno"
        },
        {
          title: "TAXI D'URGENCE",
          subtitle: "Place de la Gare",
          phone: "+39 0342 610000"
        }
      ]
    },
    checkOut: {
      title: "DÉPART (CHECK-OUT)",
      badge: "::: 10:00 (10 AM) :::",
      lateNote: "Si vous souhaitez un départ tardif, prévenez-nous à l'avance pour vérifier la faisabilité.",
      checklistTitle: "Avant de partir, merci de :",
      checklist: [
        { title: "VÉRIFIER VOS AFFAIRES PERSONNELLES", desc: "Regardez dans les placards, tiroirs, prises et salle de bain pour ne rien oublier." },
        { title: "ÉTEINDRE LES APPAREILS", desc: "Éteignez toutes les lumières, le chauffage/climatiseur et le téléviseur." },
        { title: "VIDER LES POUBELLES", desc: "Déposez les sacs poubelles triés dans les bacs de la cour." },
        { title: "FERMER PORTES ET FENÊTRES", desc: "Assurez-vous que les fenêtres et volets sont bien verrouillés." },
        { title: "REMETTRE LES CLÉS DANS LA BOÎTE", desc: "Replacez les clés dans la boîte à clés sécurisée et brouillez la combinaison." },
        { title: "SERVIETTES USAGÉES", desc: "Déposez les serviettes utilisées dans la douche ou la baignoire." },
        { title: "CUISINE PROPRE", desc: "Laissez la vaisselle dans le lave-vaisselle et lancez un cycle si nécessaire." }
      ],
      thankYou: "Nous vous remercions chaleureusement pour votre séjour à Aurora in Valtellina. Bon retour et à très bientôt !"
    },
    contacts: {
      title: "CONTACT & HÔTE",
      hostRole: "Votre Hôte Local • Aurora in Valtellina",
      quote: "Chers voyageurs, je suis à votre entière disposition pendant tout votre séjour à Morbegno. Pour toute question, conseil ou besoin, n'hésitez pas à me contacter !",
      callAction: "Appeler",
      chatAction: "Chat WhatsApp",
      smsAction: "Envoyer un SMS",
      emailAction: "Envoyer un Email",
      copyPhone: "Copier le numéro",
      copyEmail: "Copier l'email",
      copied: "Copié dans le presse-papiers !",
      reviewPrompt: "Nous espérons que votre séjour s'est déroulé à merveille ! Votre avis nous aide énormément :",
      rateGoogle: "NOTER SUR GOOGLE",
      rateWebsite: "NOTER SUR LE SITE",
      reviewDialogTitle: "Laissez votre avis pour Aurora in Valtellina",
      ratingPrompt: "Quelle note donnez-vous à votre séjour ?",
      commentPrompt: "Votre commentaire ou suggestion :",
      submitReview: "Envoyer l'Avis",
      reviewSuccess: "Merci infiniment pour votre précieux commentaire !"
    }
  },

  es: {
    appName: "Aurora in Valtellina",
    appSubtitle: "Tu acogedor refugio alpino en Morbegno, entre lagos y montañas...",
    welcome: {
      title: "BIENVENIDA",
      greeting: "¡Bienvenidos a Aurora in Valtellina!",
      message: "Estamos encantados de recibiros en nuestra casa de Morbegno. Hemos preparado esta guía digital para que disfrutéis al máximo de vuestra estancia en Valtellina con total comodidad.",
      roomsTitle: "Los Espacios De La Casa",
      livingTitle: "SALÓN Y RELAX",
      livingDesc: "Smart TV, sofá cama y zona de comedor",
      bedroomTitle: "DORMITORIO PRINCIPAL",
      bedroomDesc: "Cama king size, amplio armario y sábanas suaves",
      kitchenTitle: "COCINA EQUIPADA",
      kitchenDesc: "Placa de cocción, horno, lavavajillas y cafetera",
      viewTitle: "PATIO Y VISTAS A LOS ALPES",
      viewDesc: "Aparcamiento privado reservado y vistas a las montañas"
    },
    checkIn: {
      title: "LLEGADA (CHECK-IN)",
      badge: "::: 15:00 (3 PM) :::",
      timingNotice: "La entrada es a partir de las 15:00 h. Si necesitáis llegar antes o tenéis peticiones especiales, avisadnos por WhatsApp.",
      houseAccessTitle: "Entrega de Llaves en Mano",
      keyboxCodeLabel: "ENTREGA EN PERSONA POR EL ANFITRIÓN",
      step1: "1. Las llaves del apartamento os serán entregadas en mano directamente por el anfitrión a vuestra llegada.",
      step2: "2. Os rogamos enviarnos un mensaje por WhatsApp con vuestra hora estimada de llegada.",
      step3: "3. A vuestra llegada os recibiremos para mostraros la casa y entregaros las llaves.",
      parkingTitle: "APARCAMIENTO PRIVADO RESERVADO",
      parkingDesc: "La propiedad cuenta con aparcamiento privado con una plaza siempre libre y reservada para los huéspedes del Apartamento Aurora.",
      parkingNote: "Siempre a vuestra disposición sin costes adicionales."
    },
    wifi: {
      title: "WI-FI",
      networkLabel: "NOMBRE DE LA RED (SSID)",
      passwordLabel: "CONTRASEÑA WI-FI",
      speedNotice: "Wi-Fi rápido hasta 500 Mbps • Streaming en HD, navegación y teletrabajo",
      troubleshootTitle: "¿Problemas de conexión?",
      troubleshootText: "En caso de lentitud, probad a desactivar y reactivar el Wi-Fi en vuestro dispositivo o reiniciad la conexión de red del móvil."
    },
    rules: {
      title: "NORMAS DE LA CASA",
      r1Title: "PROHIBIDO FUMAR",
      r1Desc: "Está terminantemente prohibido fumar dentro del apartamento. Solo al aire libre.",
      r2Title: "CUIDADO DEL HOGAR",
      r2Desc: "Os rogamos cuidar la casa con cariño y respeto, como si fuera la vuestra.",
      r3Title: "HORAS DE DESCANSO",
      r3Desc: "Por favor, respetad el descanso durante las horas nocturnas (de 23:00 a 08:00).",
      r4Title: "HUÉSPEDES NO REGISTRADOS",
      r4Desc: "No se permite el acceso a personas ajenas a la reserva.",
      r5Title: "SEGURIDAD Y ENERGÍA",
      r5Desc: "Cerrad bien con llave al salir y apagad electrodomésticos y luces.",
      r6Title: "AVISO DE INCIDENCIAS",
      r6Desc: "Avisadnos de inmediato si algo necesita reparación o asistencia."
    },
    location: {
      title: "UBICACIÓN",
      heading: "Cómo llegar a nuestra casa",
      howToArrive: "Cómo Llegar",
      byTrain: "En Tren:",
      byTrainDesc: "Estación FS de Morbegno a 600m (8 min a pie). Trenes directos cada hora desde Milán Central.",
      byCar: "En Coche:",
      byCarDesc: "Por la SS38, salida Morbegno Centro. Aparcamiento privado de la vivienda con plaza siempre reservada.",
      byPlane: "Desde Aeropuertos:",
      byPlaneDesc: "Milán Bérgamo (80 km), Milán Linate (100 km), Milán Malpensa (125 km)."
    },
    transport: {
      title: "TRANSPORTE",
      items: [
        {
          title: "ESTACIÓN DE TREN DE MORBEGNO",
          subtitle: "Parada Morbegno FS",
          time: "8 min a pie (600 m)",
          desc: "Trenes directos a Milán Central, Lago de Como, Sondrio, Tirano y el Bernina Express.",
          mapsUrl: "https://maps.google.com/?q=Stazione+Morbegno"
        },
        {
          title: "AUTOBUSES LOCALES",
          subtitle: "Parada Via Roma / Piazza S. Antonio",
          time: "5 min a pie",
          desc: "Conexiones a Val Tartano (Puente en el Cielo), Val Gerola y Val Masino.",
          mapsUrl: "https://maps.google.com/?q=Fermata+Bus+Morbegno"
        },
        {
          title: "SERVICIO DE TAXI MORBEGNO",
          subtitle: "Plaza de la Estación",
          time: "Disponible 24h",
          desc: "Traslados a valles alpinos, Lago de Como y pistas de esquí.",
          phone: "+39 0342 610000"
        },
        {
          title: "AEROPUERTOS DE MILÁN",
          subtitle: "Bérgamo / Linate / Malpensa",
          time: "1h 15m en coche / Tren directo",
          desc: "Conexiones frecuentes en tren hasta Milán Central y lanzaderas de autobús.",
          mapsUrl: "https://maps.google.com/?q=Milano+Bergamo+Airport"
        }
      ]
    },
    amenities: {
      title: "SERVICIOS Y EQUIPAMIENTO",
      items: [
        { title: "CAMA KING SIZE", desc: "Colchón ortopédico y ropa de cama limpia" },
        { title: "SOFÁ CAMA DOBLE", desc: "Cómodo para 2 huéspedes adicionales" },
        { title: "WI-FI HASTA 500 MBPS", desc: "Conexión inalámbrica rápida e ilimitada" },
        { title: "CALEFACCIÓN Y REFRIGERACIÓN POR SUELO RADIANTE", desc: "Climatización integral por suelo radiante" },
        { title: "SMART TV 50\" 4K", desc: "Netflix, Prime Video y canales vía satélite" },
        { title: "ESPACIO DE TRABAJO", desc: "Escritorio con enchufes para teletrabajo" },
        { title: "PLACA DE COCCIÓN COMPLETA", desc: "Cocina equipada con sartenes y cazuelas" },
        { title: "LAVAVAJILLAS", desc: "Pastillas de detergente incluidas bajo el fregadero" },
        { title: "CAFETERA ESPRESSO", desc: "Cápsulas de café de bienvenida incluidas" },
        { title: "HORNO Y MICROONDAS", desc: "Modo grill, horneado y descongelación" },
        { title: "FRIGORÍFICO Y CONGELADOR", desc: "Nevera espaciosa con congelador" },
        { title: "LAVADORA Y TENDEDERO", desc: "Detergente y tendedero disponibles" },
        { title: "KIT DE BAÑO DE CORTESÍA", desc: "Secador de pelo potente, toallas y gel de ducha" },
        { title: "APARCAMIENTO PRIVADO RESERVADO", desc: "Aparcamiento privado de la vivienda con plaza reservada" }
      ],
      notice: "Todos los servicios son de uso exclusivo. Ayúdanos a cuidar el entorno apagando electrodomésticos y luces al salir."
    },
    activities: {
      title: "ACTIVIDADES Y RUTAS",
      bannerText: "Experiencias alpinas inolvidables en Valtellina y Lago de Como",
      highlights: [
        {
          tag: "PATRIMONIO UNESCO",
          title: "Tren Rojo del Bernina (Tirano - St. Moritz)",
          desc: "Patrimonio de la Humanidad UNESCO: el ferrocarril alpino más alto de Europa que atraviesa glaciares hasta St. Moritz en Suiza.",
          mapsUrl: "https://maps.google.com/?q=Stazione+Tirano+Trenino+Rosso",
          tagColor: "bg-rose-100 text-rose-800"
        },
        {
          tag: "IMPRESCINDIBLE 1",
          title: "Ponte nel Cielo (Val Tartano)",
          desc: "Puente tibetano peatonal suspendido a 140 m de altura (234 m de largo) con vistas impresionantes de los Alpes y el Lago de Como. A 15 min.",
          mapsUrl: "https://maps.google.com/?q=Ponte+nel+Cielo+Campo+Tartano",
          tagColor: "bg-amber-100 text-amber-900"
        },
        {
          tag: "NATURALEZA Y SENDERISMO",
          title: "Reserva Natural Val di Mello",
          desc: "El 'Pequeño Yosemite' italiano: paredes de granito, lagunas de agua esmeralda y refugios con polenta taragna. A 20 min.",
          mapsUrl: "https://maps.google.com/?q=Val+di+Mello+Val+Masino",
          tagColor: "bg-emerald-100 text-emerald-900"
        },
        {
          tag: "ADRENALINA",
          title: "Fly Emotion - Tirolina (Albaredo)",
          desc: "Vuela sobre el valle alpino colgado de una tirolina a más de 100 km/h. ¡Una experiencia única para todas las edades!",
          mapsUrl: "https://maps.google.com/?q=Fly+Emotion+Albaredo",
          tagColor: "bg-blue-100 text-blue-900"
        },
        {
          tag: "LAGO Y DEPORTES",
          title: "Playas de Colico y Kitesurf en el Lago de Como",
          desc: "A 15 min de Morbegno: playas de baño, paseo marítimo, alquiler de barcos, windsurf y la Abadía de Piona.",
          mapsUrl: "https://maps.google.com/?q=Spiaggia+di+Colico+Lago+di+Como",
          tagColor: "bg-cyan-100 text-cyan-900"
        },
        {
          tag: "TERMAS Y RELAX",
          title: "QC Terme Bormio (Baños Romanos)",
          desc: "Cuevas termales romanas milenarias y piscinas panorámicas al aire libre con vistas a los picos nevados.",
          mapsUrl: "https://maps.google.com/?q=QC+Terme+Bormio",
          tagColor: "bg-purple-100 text-purple-900"
        }
      ],
      categoryTitle: "Más experiencias locales",
      categories: [
        { title: "CARRIL BICI VALTELLINA", desc: "114 km llanos junto al río Adda (alquiler de bicicletas eléctricas)" },
        { title: "CATAS DE VINO SFORZATO", desc: "Visitas a bodegas históricas y viñedos en terrazas de Nebbiolo" },
        { title: "ESQUÍ Y MONTAÑA", desc: "Estaciones de Pescegallo (Valgerola), Aprica y Bormio" },
        { title: "CASCO HISTÓRICO DE MORBEGNO", desc: "Paseo por calles antiguas, Puente Ganda y bodegas centenarias de queso Bitto" }
      ]
    },
    restaurants: {
      title: "RESTAURANTES RECOMENDADOS",
      bannerText: "Las mejores tabernas y osterias auténticas de Morbegno",
      recommended: [
        {
          name: "ANTICA OSTERIA RAPELLA (DESDE 1886)",
          time: "7 min a pie (550 m)",
          address: "Via Margna 36, Morbegno",
          phone: "+39 0342 610377",
          desc: "Taberna histórica desde 1886 en el centro: famosos pizzoccheri tradicionales, crujientes sciatt de queso, carnes selectas y vinos DOCG.",
          mapsUrl: "https://maps.google.com/?q=Antica+Osteria+Rapella+Morbegno"
        },
        {
          name: "OSTERIA DEL ZEP",
          time: "6 min a pie (500 m)",
          address: "Piazza Marconi 16, Morbegno",
          phone: "+39 0342 610058",
          desc: "Osteria típica con bodega del siglo XVIII y chimenea: pasta fresca casera, pizzoccheri, sciatt con achicoria y carnes a la parrilla.",
          mapsUrl: "https://maps.google.com/?q=Osteria+del+Zep+Morbegno"
        },
        {
          name: "OSTERIA DEL CROTTO",
          time: "8 min a pie (650 m)",
          address: "Via Don Giovanni Guanella 18, Morbegno",
          phone: "+39 0342 614800",
          desc: "Crotto tradicional en roca natural: sciatt fundentes, polenta taragna, costillas y cocina auténtica de montaña.",
          mapsUrl: "https://maps.google.com/?q=Osteria+del+Crotto+Morbegno"
        },
        {
          name: "BRACERIA DEL CROTTO",
          time: "9 min a pie (750 m)",
          address: "Via Crotto Lambertenghi 1, Morbegno",
          phone: "+39 0342 615000",
          desc: "Reconocida brasería en un crotto de piedra para cortes de carne a la brasa y platos alpinos.",
          mapsUrl: "https://maps.google.com/?q=Braceria+del+Crotto+Morbegno"
        }
      ],
      deliveryTitle: "Tiendas Históricas y Degustación",
      deliveries: [
        { name: "FRATELLI CIAPPONI (1883)", type: "Bitto DOP, Casera, Bresaola y Grandes Vinos", phone: "+39 0342 610012" },
        { name: "PASTICCERIA POLETTI", type: "Bisciola de Valtellina y Dulces Tradicionales", phone: "+39 0342 611234" }
      ]
    },
    bars: {
      title: "BARES, CAFÉS Y APERITIVOS",
      bannerText: "Pastelerías de época, bares de vinos y terrazas en Morbegno",
      recommended: [
        {
          name: "WINE BAR LA TAVERNETTA",
          time: "6 min a pie (500 m)",
          address: "Via Ezio Vanoni 64, Morbegno",
          phone: "+39 0342 611007",
          desc: "Bar de vinos histórico desde 1970 con terraza: aperitivos con sciatt calientes, cervezas artesanales y vinos locales.",
          mapsUrl: "https://maps.google.com/?q=Wine+Bar+La+Tavernetta+Morbegno"
        },
        {
          name: "PANIFICIO & PASTICCERIA POLETTI",
          time: "5 min a pie (400 m)",
          address: "Via Ezio Vanoni 32, Morbegno",
          phone: "+39 0342 611234",
          desc: "Pastelería artesanal para el desayuno con croissants recién hechos, café espresso, pan de centeno y auténtica Bisciola.",
          mapsUrl: "https://maps.google.com/?q=Panificio+Pasticceria+Poletti+Morbegno"
        },
        {
          name: "CAFFÈ GALLERY",
          time: "7 min a pie (600 m)",
          address: "Via Garibaldi 42, Morbegno",
          phone: "+39 0342 615432",
          desc: "Elegante cafetería y bar de copas en el casco histórico, ideal para el aperitivo y copas por la noche.",
          mapsUrl: "https://maps.google.com/?q=Caffe+Gallery+Morbegno"
        },
        {
          name: "VINERIA BIRRERIA OTTOCENTO",
          time: "8 min a pie (650 m)",
          address: "Via Garibaldi 16, Morbegno",
          phone: "+39 0342 612500",
          desc: "Acogedor bar de vinos y cervezas en el casco antiguo con vinos DOCG y tablas de embutidos y quesos locales.",
          mapsUrl: "https://maps.google.com/?q=Ottocento+Morbegno"
        }
      ],
      coffeeTitle: "Cafetera disponible en el apartamento",
      coffeeDesc: "En el apartamento tenéis a vuestra disposición la cafetera espresso con cápsulas de bienvenida incluidas."
    },
    shopping: {
      title: "COMPRAS Y SUPERMERCADOS",
      shops: [
        {
          title: "FRATELLI CIAPPONI - TIENDA HISTÓRICA",
          time: "6 min a pie (Piazza 3 Novembre)",
          hours: "Todos los días 08:30 - 19:30 (cerrado lunes tarde)",
          desc: "Templo gastronómico desde 1883: bodegas subterráneas con quesos Bitto y Casera curados, setas porcini y vinos.",
          mapsUrl: "https://maps.google.com/?q=Fratelli+Ciapponi+Morbegno"
        },
        {
          title: "SUPERMERCADO IPERAL / CARREFOUR",
          time: "4 min a pie (300 m)",
          hours: "Abierto los 7 días: 08:00 - 20:30",
          desc: "Supermercado completo para la compra diaria: productos frescos, panadería y bazar.",
          mapsUrl: "https://maps.google.com/?q=Supermercato+Iperal+Morbegno"
        },
        {
          title: "CENTRO COMERCIAL FUENTES",
          time: "12 min en coche (Piantedo / Colico)",
          hours: "Todos los días 09:00 - 20:30",
          desc: "Gran hipermercado con más de 60 tiendas de moda, farmacia, electrónica y restaurantes.",
          mapsUrl: "https://maps.google.com/?q=Centro+Commerciale+Fuentes+Piantedo"
        },
        {
          title: "MERCADILLO DE LOS SÁBADOS EN MORBEGNO",
          time: "Piazza Sant'Antonio y centro",
          hours: "Cada sábado por la mañana: 08:00 - 13:00",
          desc: "Puestos de quesos de montaña, embutidos locales, fruta fresca y artesanía.",
          mapsUrl: "https://maps.google.com/?q=Piazza+Sant+Antonio+Morbegno"
        }
      ]
    },
    info: {
      title: "INFORMACIÓN ÚTIL",
      services: [
        {
          title: "FARMACIA DE GUARDIA",
          desc: "Farmacia San Giovanni • Via Garibaldi (5 min a pie)",
          mapsUrl: "https://maps.google.com/?q=Farmacia+Morbegno"
        },
        {
          title: "BANCO Y CAJERO 24H",
          desc: "Banca Popolare di Sondrio • Piazza Caduti (6 min a pie)",
          mapsUrl: "https://maps.google.com/?q=Bancomat+Morbegno"
        },
        {
          title: "GASOLINERA Y CARGA ELÉCTRICA EV",
          desc: "Estación Eni y cargadores rápidos Enel X (400 m)",
          mapsUrl: "https://maps.google.com/?q=Distributore+Morbegno"
        },
        {
          title: "OFICINA DE CORREOS",
          desc: "Poste Italiane Morbegno • Via Garibaldi (8 min a pie)",
          mapsUrl: "https://maps.google.com/?q=Poste+Italiane+Morbegno"
        },
        {
          title: "IGLESIAS Y MONUMENTOS",
          desc: "Colegiata San Giovanni Battista y Puente Ganda (500 m)",
          mapsUrl: "https://maps.google.com/?q=Collegiata+San+Giovanni+Morbegno"
        }
      ],
      wasteTitle: "Recogida Selectiva (Cubos en la Parte Trasera)",
      wasteDesc: "Los contenedores de reciclaje se encuentran en la parte trasera de la casa: Orgánico (marrón), Papel (azul), Plástico/Latas (amarillo), Vidrio (verde).",
      cirLabel: "Código de Identificación Regional (CIR):",
      cinLabel: "Código de Identificación Nacional (CIN):"
    },
    emergency: {
      title: "EMERGENCIAS Y ASISTENCIA",
      freeBadge: "GRATUITO",
      nationalNumbersTitle: "NÚMEROS DE EMERGENCIA 24H",
      items: [
        {
          title: "HOSPITAL MÁS CERCANO",
          subtitle: "Hospital de Morbegno / Sondrio",
          phone: "+39 0342 607111",
          mapsUrl: "https://maps.google.com/?q=Ospedale+Morbegno"
        },
        {
          title: "FARMACIA 24H / GUARDIA",
          subtitle: "Farmacia Municipal de Morbegno",
          phone: "+39 0342 611222",
          mapsUrl: "https://maps.google.com/?q=Farmacia+Morbegno"
        },
        {
          title: "MÉDICO DE GUARDIA (GUARDIA MEDICA)",
          subtitle: "Noches y festivos",
          phone: "116 117"
        },
        {
          title: "POLICÍA (CARABINIERI)",
          subtitle: "Via Merizzi 2, Morbegno",
          phone: "+39 0342 606100",
          mapsUrl: "https://maps.google.com/?q=Carabinieri+Morbegno"
        },
        {
          title: "TAXI DE URGENCIAS",
          subtitle: "Plaza de la Estación",
          phone: "+39 0342 610000"
        }
      ]
    },
    checkOut: {
      title: "SALIDA (CHECK-OUT)",
      badge: "::: 10:00 (10 AM) :::",
      lateNote: "Si necesitáis salir más tarde, avisadnos con tiempo para consultar la disponibilidad.",
      checklistTitle: "Antes de marcharos, por favor:",
      checklist: [
        { title: "REVISAD VUESTROS OBJETOS PERSONALES", desc: "Comprobad armarios, cajones, enchufes y baño para no olvidar nada." },
        { title: "APAGAD LOS ELECTRODOMÉSTICOS", desc: "Apagad todas las luces, el aire acondicionado/calefacción y la televisión." },
        { title: "VACIAD LAS PAPELERAS", desc: "Llevad las bolsas de reciclaje a los cubos del patio." },
        { title: "CERRAD PUERTAS Y VENTANAS", desc: "Asegurad que ventanas y persianas quedan bien cerradas." },
        { title: "DEJAD LAS LLAVES EN LA KEYBOX", desc: "Colocad las llaves dentro de la caja de seguridad y cambiad la combinación." },
        { title: "TOALLAS USADAS", desc: "Dejad las toallas usadas dentro de la ducha o bañera." },
        { title: "COCINA RECOGIDA", desc: "Dejad la vajilla en el lavavajillas y ponedlo en marcha si es necesario." }
      ],
      thankYou: "¡Muchas gracias por elegir Aurora in Valtellina! ¡Buen viaje de vuelta y hasta pronto!"
    },
    contacts: {
      title: "CONTACTO Y ANFITRIÓN",
      hostRole: "Tu Anfitrión Local • Aurora in Valtellina",
      quote: "Estimados huéspedes, estoy a vuestra completa disposición durante toda vuestra estancia en Morbegno. ¡Para cualquier duda, recomendación o consulta, escribidme o llamadme sin dudar!",
      callAction: "Llamar",
      chatAction: "Chat WhatsApp",
      smsAction: "Enviar SMS",
      emailAction: "Enviar Email",
      copyPhone: "Copiar teléfono",
      copyEmail: "Copiar email",
      copied: "¡Copiado al portapapeles!",
      reviewPrompt: "¡Esperamos que hayáis disfrutado de la estancia! Vuestra opinión es muy importante para nosotros:",
      rateGoogle: "VALORAR EN GOOGLE",
      rateWebsite: "VALORAR EN LA WEB",
      reviewDialogTitle: "Deja tu valoración para Aurora in Valtellina",
      ratingPrompt: "¿Cómo valoras tu experiencia global?",
      commentPrompt: "Escribe un comentario o sugerencia:",
      submitReview: "Enviar Valoración",
      reviewSuccess: "¡Muchas gracias por tu valiosa valoración!"
    }
  },

  de: {
    appName: "Aurora in Valtellina",
    appSubtitle: "Ihr gemütlicher Rückzugsort in Morbegno zwischen See und Alpengipfeln...",
    welcome: {
      title: "WILLKOMMEN",
      greeting: "Herzlich willkommen im Aurora in Valtellina!",
      message: "Wir freuen uns sehr, Sie in unserem Haus in Morbegno begrüßen zu dürfen. Dieser digitale Guide begleitet Sie durch Ihren erholsamen Aufenthalt im Veltlin.",
      roomsTitle: "Die Räumlichkeiten Des Hauses",
      livingTitle: "WOHNBEREICH & ENTSPANNUNG",
      livingDesc: "Smart-TV, Schlafsofa und Essbereich",
      bedroomTitle: "HAUPTSCHLAFZIMMER",
      bedroomDesc: "Kingsize-Bett, geräumiger Schrank und frische Bettwäsche",
      kitchenTitle: "VOLL AUSGESTATTETE KÜCHE",
      kitchenDesc: "Kochfeld, Backofen, Spülmaschine & Kaffeemaschine",
      viewTitle: "INNENHOF & ALPENBLICK",
      viewDesc: "Reservierter Privatparkplatz und Bergblick"
    },
    checkIn: {
      title: "CHECK-IN",
      badge: "::: 15:00 (3 PM) :::",
      timingNotice: "Der Check-in ist ab 15:00 Uhr möglich. Bei früherer Ankunft oder Sonderwünschen schreiben Sie uns gerne per WhatsApp.",
      houseAccessTitle: "Persönliche Schlüsselübergabe",
      keyboxCodeLabel: "PERSÖNLICHE ÜBERGABE DURCH DEN GASTGEBER",
      step1: "1. Die Wohnungsschlüssel werden Ihnen bei Ihrer Ankunft persönlich direkt vom Gastgeber übergeben.",
      step2: "2. Bitte senden Sie uns vorab eine kurze Nachricht per WhatsApp mit Ihrer voraussichtlichen Ankunftszeit.",
      step3: "3. Bei Ihrer Ankunft heißen wir Sie herzlich willkommen, zeigen Ihnen das Apartment und übergeben die Schlüssel.",
      parkingTitle: "RESERVIERTER PRIVATPARKPLATZ",
      parkingDesc: "Das Haus verfügt über einen privaten Parkplatz mit einem stets freien und reservierten Stellplatz für Gäste des Appartamento Aurora.",
      parkingNote: "Jederzeit ohne Aufpreis für Sie verfügbar."
    },
    wifi: {
      title: "WI-FI",
      networkLabel: "NETZWERKNAME (SSID)",
      passwordLabel: "WLAN-PASSWORT",
      speedNotice: "Schnelles WLAN bis zu 500 Mbit/s • HD-Streaming, Surfen und Homeoffice",
      troubleshootTitle: "Verbindungsprobleme?",
      troubleshootText: "Schalten Sie bei Verbindungsabbrüchen kurz das WLAN am Gerät aus und wieder ein oder starten Sie die Netzwerkverbindung Ihres Smartphones neu."
    },
    rules: {
      title: "HAUSORDNUNG",
      r1Title: "STRIKTES RAUCHVERBOT",
      r1Desc: "Rauchen ist in der Wohnung strengstens untersagt. Nur im Freien gestattet.",
      r2Title: "PFLEGLICHER UMGANG",
      r2Desc: "Bitte behandeln Sie das Apartment so sorgsam, als wäre es Ihr eigenes Zuhause.",
      r3Title: "RUHEZEITEN",
      r3Desc: "Bitte beachten Sie die Nachtruhe von 23:00 bis 08:00 Uhr.",
      r4Title: "UNANGEMELDETE GÄSTE",
      r4Desc: "Übernachtungsgäste außerhalb der Buchung sind nicht gestattet.",
      r5Title: "SICHERHEIT & ENERGIE",
      r5Desc: "Schließen Sie die Eingangstür stets ab und schalten Sie Geräte und Licht beim Verlassen aus.",
      r6Title: "MÄNGELMELDUNG",
      r6Desc: "Informieren Sie uns bitte unverzüglich über eventuelle Schäden oder Störungen."
    },
    location: {
      title: "STANDORT & ANREISE",
      heading: "Wegbeschreibung zu unserer Unterkunft",
      howToArrive: "Anreisehinweise",
      byTrain: "Mit der Bahn:",
      byTrainDesc: "Bahnhof Morbegno FS in 600m (8 Min. Fußweg). Stündliche Direktzüge ab Mailand Centrale.",
      byCar: "Mit dem Auto:",
      byCarDesc: "Über die SS38, Ausfahrt Morbegno Centro. Privater Parkplatz des Hauses mit stets reserviertem Stellplatz.",
      byPlane: "Von den Flughäfen:",
      byPlaneDesc: "Mailand Bergamo (80 km), Mailand Linate (100 km), Mailand Malpensa (125 km)."
    },
    transport: {
      title: "VERKEHRSVERBINDUNGEN",
      items: [
        {
          title: "BAHNHOF MORBEGNO FS",
          subtitle: "Haltestelle Morbegno",
          time: "8 Min. Fußweg (600 m)",
          desc: "Direkte Regionalzüge nach Mailand Centrale, Comer See, Sondrio, Tirano und Bernina Express.",
          mapsUrl: "https://maps.google.com/?q=Stazione+Morbegno"
        },
        {
          title: "REGIONALBUSSE",
          subtitle: "Haltestelle Via Roma / Piazza S. Antonio",
          time: "5 Min. Fußweg",
          desc: "Linienbusse ins Val Tartano (Hängebrücke Ponte nel Cielo), Val Gerola und Val Masino.",
          mapsUrl: "https://maps.google.com/?q=Fermata+Bus+Morbegno"
        },
        {
          title: "TAXIRUF MORBEGNO",
          subtitle: "Bahnhofsplatz",
          time: "Rund um die Uhr auf Abruf",
          desc: "Transfers in Bergtäler, zum Comer See und in Skigebiete.",
          phone: "+39 0342 610000"
        },
        {
          title: "FLUGHÄFEN MAILAND",
          subtitle: "Bergamo / Linate / Malpensa",
          time: "1 Std. 15 Min. mit dem Auto / Direktzug",
          desc: "Direkte Bahnverbindungen ab Morbegno nach Mailand Centrale mit Anschluss-Shuttles.",
          mapsUrl: "https://maps.google.com/?q=Milano+Bergamo+Airport"
        }
      ]
    },
    amenities: {
      title: "AUSSTATTUNG & SERVICE",
      items: [
        { title: "KINGSIZE-BETT", desc: "Orthopädische Matratze und hochwertige Bettwäsche" },
        { title: "DOPPELSCHLAFSOFA", desc: "Bequemer Schlafplatz für 2 weitere Gäste" },
        { title: "WLAN BIS ZU 500 MBIT/S", desc: "Schnelles unbegrenztes Highspeed-Internet" },
        { title: "FUSSBODENHEIZUNG & -KÜHLUNG", desc: "Angenehme Flächenkühlung und -heizung über den Boden" },
        { title: "50\" 4K SMART-TV", desc: "Netflix, Prime Video und Satellitenprogramme" },
        { title: "ARBEITSPLATZ", desc: "Schreibtisch mit Steckdosen für Telearbeit" },
        { title: "VOLLSTÄNDIGES KOCHFELD", desc: "Kochgeschirr-Set und vollständige Küchenausstattung" },
        { title: "GESCHIRRSPÜLER", desc: "Spültabs unter der Spüle vorhanden" },
        { title: "ESPRESSO-KAFFEEMASCHINE", desc: "Kostenlose Willkommens-Kaffeekapseln" },
        { title: "BACKOFEN & MIKROWELLE", desc: "Mit Grill-, Auftau- und Backfunktion" },
        { title: "KÜHLSCHRANK & GEFRIERFACH", desc: "Großer Kühlschrank mit Eisfach" },
        { title: "WASCHMASCHINE & WÄSCHESTÄNDER", desc: "Waschmittel und Wäscheständer vorhanden" },
        { title: "BAD-KOMFORTSET", desc: "Leistungsstarker Föhn, Handtücher und Duschgel vorhanden" },
        { title: "RESERVIERTER PRIVATPARKPLATZ", desc: "Privater Parkplatz des Hauses mit stets reserviertem Stellplatz" }
      ],
      notice: "Alle Ausstattungen stehen Ihnen exklusiv zur Verfügung. Bitte schalten Sie beim Verlassen Geräte und Lichter aus."
    },
    activities: {
      title: "AKTIVITÄTEN & AUSFLÜGE",
      bannerText: "Unvergessliche Erlebnisse im Veltlin & am Comer See",
      highlights: [
        {
          tag: "UNESCO WELTKULTURERBE",
          title: "Bernina Express Panoramazug (Tirano - St. Moritz)",
          desc: "UNESCO-Welterbe: Die höchste Alpenbahnstrecke Europas über Gletscher und spektakuläre Pässe bis ins mondäne St. Moritz in der Schweiz.",
          mapsUrl: "https://maps.google.com/?q=Stazione+Tirano+Trenino+Rosso",
          tagColor: "bg-rose-100 text-rose-800"
        },
        {
          tag: "TOP HIGHLIGHT 1",
          title: "Ponte nel Cielo Hängebrücke (Val Tartano)",
          desc: "Eine der höchsten Fußgänger-Hängebrücken Europas in 140 m Höhe (234 m Länge) mit atemberaubendem Blick bis zum Comer See. 15 Min. Fahrt.",
          mapsUrl: "https://maps.google.com/?q=Ponte+nel+Cielo+Campo+Tartano",
          tagColor: "bg-amber-100 text-amber-900"
        },
        {
          tag: "NATUR & WANDERN",
          title: "Naturreservat Val di Mello (Val Masino)",
          desc: "Das 'Kleine Yosemite' Italiens: gewaltige Granitwände, smaragdgrüne Bergseen, Wasserfälle und urige Berghütten. 20 Min. Fahrt.",
          mapsUrl: "https://maps.google.com/?q=Val+di+Mello+Val+Masino",
          tagColor: "bg-emerald-100 text-emerald-900"
        },
        {
          tag: "ADRENALIN & FLUG",
          title: "Fly Emotion Zipline (Albaredo per San Marco)",
          desc: "Fliegen Sie mit über 100 km/h an einem Stahlseil gesichert über das Alpental zwischen Albaredo und Bema. Ein unvergessliches Erlebnis!",
          mapsUrl: "https://maps.google.com/?q=Fly+Emotion+Albaredo",
          tagColor: "bg-blue-100 text-blue-900"
        },
        {
          tag: "SEE & WASSERSPORT",
          title: "Strände in Colico & Kitesurfen am Comer See",
          desc: "Nur 15 Min. von Morbegno: Badestrände, Uferpromenade, Bootsverleih, Kitesurfen und die historische Abtei Piona.",
          mapsUrl: "https://maps.google.com/?q=Spiaggia+di+Colico+Lago+di+Como",
          tagColor: "bg-cyan-100 text-cyan-900"
        },
        {
          tag: "THERMALBAD & WELLNESS",
          title: "QC Terme Bormio (Historische Römische Bäder)",
          desc: "Jahrtausendealte Thermalhöhlen und beheizte Panorama-Außenbecken mit direktem Blick auf die schneebedeckten Alpengipfel.",
          mapsUrl: "https://maps.google.com/?q=QC+Terme+Bormio",
          tagColor: "bg-purple-100 text-purple-900"
        }
      ],
      categoryTitle: "Weitere Erlebnisse in der Region",
      categories: [
        { title: "SENTIERO VALTELLINA RADWEG", desc: "114 km flacher Panoramaradweg entlang des Flusses Adda (E-Bike-Verleih)" },
        { title: "WEINTOUREN & SFORZATO WEINE", desc: "Weinproben in historischen Kellern und Nebbiolo-Terrassenweinbergen" },
        { title: "SKI- & WINTERSPORT", desc: "Skigebiete Pescegallo (Valgerola), Aprica, Bormio und Valmalenco" },
        { title: "ALTSTADT MORBEGNO & BITTO-KÄSE", desc: "Spaziergang über die Ganda-Brücke und Besuch traditioneller Käsekeller" }
      ]
    },
    restaurants: {
      title: "EMPFEHLENSWERTE RESTAURANTS",
      bannerText: "Authentische Traditionslokale und Osterien in Morbegno",
      recommended: [
        {
          name: "ANTICA OSTERIA RAPELLA (SEIT 1886)",
          time: "7 Min. Fußweg (550 m)",
          address: "Via Margna 36, Morbegno",
          phone: "+39 0342 610377",
          desc: "Traditionshaus seit 1886 im Zentrum: berühmte hausgemachte Pizzoccheri, knusprige Sciatt-Käsebällchen, Fleischgerichte und DOCG-Spitzenweine.",
          mapsUrl: "https://maps.google.com/?q=Antica+Osteria+Rapella+Morbegno"
        },
        {
          name: "OSTERIA DEL ZEP",
          time: "6 Min. Fußweg (500 m)",
          address: "Piazza Marconi 16, Morbegno",
          phone: "+39 0342 610058",
          desc: "Uriges Lokal mit Gewölbekeller aus dem 18. Jahrhundert: frische handgemachte Pasta, Pizzoccheri, Sciatt und Grillspezialitäten.",
          mapsUrl: "https://maps.google.com/?q=Osteria+del+Zep+Morbegno"
        },
        {
          name: "OSTERIA DEL CROTTO",
          time: "8 Min. Fußweg (650 m)",
          address: "Via Don Giovanni Guanella 18, Morbegno",
          phone: "+39 0342 614800",
          desc: "Traditionelles Crotto im Naturfelsen: geschmolzene Sciatt, Polenta Taragna, Veltliner Spezialitäten und herzhafte alpine Gerichte.",
          mapsUrl: "https://maps.google.com/?q=Osteria+del+Crotto+Morbegno"
        },
        {
          name: "BRACERIA DEL CROTTO",
          time: "9 Min. Fußweg (750 m)",
          address: "Via Crotto Lambertenghi 1, Morbegno",
          phone: "+39 0342 615000",
          desc: "Renommierte Steakhouse-Grillstube im Steincrotto für erstklassige Rindersteaks über Holzkohle und Bergküche.",
          mapsUrl: "https://maps.google.com/?q=Braceria+del+Crotto+Morbegno"
        }
      ],
      deliveryTitle: "Historische Feinkostläden & Verkostung",
      deliveries: [
        { name: "FRATELLI CIAPPONI (1883)", type: "Bitto DOP, Casera, Bresaola & Spitzenweine", phone: "+39 0342 610012" },
        { name: "PASTICCERIA POLETTI", type: "Veltliner Bisciola & Feingebäck", phone: "+39 0342 611234" }
      ]
    },
    bars: {
      title: "BARS, CAFÉS & APERITIFS",
      bannerText: "Traditionsbäckereien, Weinbars und Terrassen in Morbegno",
      recommended: [
        {
          name: "WINE BAR LA TAVERNETTA",
          time: "6 Min. Fußweg (500 m)",
          address: "Via Ezio Vanoni 64, Morbegno",
          phone: "+39 0342 611007",
          desc: "Historische Weinbar seit 1970 mit Außenterrasse: Aperitifs mit warmen Sciatt, Craft-Bieren und regionalen Weinen.",
          mapsUrl: "https://maps.google.com/?q=Wine+Bar+La+Tavernetta+Morbegno"
        },
        {
          name: "PANIFICIO & PASTICCERIA POLETTI",
          time: "5 Min. Fußweg (400 m)",
          address: "Via Ezio Vanoni 32, Morbegno",
          phone: "+39 0342 611234",
          desc: "Handwerksbäckerei und Konditorei für das Frühstück mit ofenfrischen Croissants, Espresso, Roggenbrot und Bisciola.",
          mapsUrl: "https://maps.google.com/?q=Panificio+Pasticceria+Poletti+Morbegno"
        },
        {
          name: "CAFFÈ GALLERY",
          time: "7 Min. Fußweg (600 m)",
          address: "Via Garibaldi 42, Morbegno",
          phone: "+39 0342 615432",
          desc: "Stilvolles Café und Cocktailbar in der Altstadt von Morbegno, beliebt für Aperitifs und Drinks am Abend.",
          mapsUrl: "https://maps.google.com/?q=Caffe+Gallery+Morbegno"
        },
        {
          name: "VINERIA BIRRERIA OTTOCENTO",
          time: "8 Min. Fußweg (650 m)",
          address: "Via Garibaldi 16, Morbegno",
          phone: "+39 0342 612500",
          desc: "Gemütliche Wein- und Bierstube in der Altstadt mit Veltliner DOCG-Weinen und regionalen Wurst- und Käseplatten.",
          mapsUrl: "https://maps.google.com/?q=Ottocento+Morbegno"
        }
      ],
      coffeeTitle: "Kaffeemaschine im Apartment vorhanden",
      coffeeDesc: "In der Wohnung steht Ihnen die Espresso-Kaffeemaschine mit kostenlosen Willkommenskapseln zur Verfügung."
    },
    shopping: {
      title: "EINKAUFEN & LEBENSMITTEL",
      shops: [
        {
          title: "FRATELLI CIAPPONI - HISTORISCHER FEINKOSTLADEN",
          time: "6 Min. Fußweg (Piazza 3 Novembre)",
          hours: "Täglich 08:30 - 19:30 (Montagnachmittag geschlossen)",
          desc: "Kult-Feinkostladen seit 1883: Unterirdische Gewölbekeller mit gereiftem Bitto- und Casera-Käse, Steinpilzen und Weinen.",
          mapsUrl: "https://maps.google.com/?q=Fratelli+Ciapponi+Morbegno"
        },
        {
          title: "SUPERMARKT IPERAL / CARREFOUR",
          time: "4 Min. Fußweg (300 m)",
          hours: "7 Tage die Woche geöffnet: 08:00 - 20:30",
          desc: "Gut sortierter Supermarkt für den täglichen Bedarf: Frischetheke, Bäckerei und Haushaltswaren.",
          mapsUrl: "https://maps.google.com/?q=Supermercato+Iperal+Morbegno"
        },
        {
          title: "EINKAUFSZENTRUM FUENTES",
          time: "12 Min. mit dem Auto (Piantedo / Colico)",
          hours: "Täglich 09:00 - 20:30",
          desc: "Großes Einkaufszentrum mit über 60 Modegeschäften, Apotheke, Elektronik und Gastronomie.",
          mapsUrl: "https://maps.google.com/?q=Centro+Commerciale+Fuentes+Piantedo"
        },
        {
          title: "SAMSTAGSMARKT IN MORBEGNO",
          time: "Piazza Sant'Antonio & Zentrum",
          hours: "Jeden Samstagvormittag: 08:00 - 13:00",
          desc: "Traditioneller Wochenmarkt mit Almkäse, regionalen Wurstwaren, frischem Obst und Kunsthandwerk.",
          mapsUrl: "https://maps.google.com/?q=Piazza+Sant+Antonio+Morbegno"
        }
      ]
    },
    info: {
      title: "NÜTZLICHE INFORMATIONEN",
      services: [
        {
          title: "NOTDIENST-APOTHEKE",
          desc: "Farmacia San Giovanni • Via Garibaldi (5 Min. Fußweg)",
          mapsUrl: "https://maps.google.com/?q=Farmacia+Morbegno"
        },
        {
          title: "BANK & 24H-GELDAUTOMAT",
          desc: "Banca Popolare di Sondrio • Piazza Caduti (6 Min. Fußweg)",
          mapsUrl: "https://maps.google.com/?q=Bancomat+Morbegno"
        },
        {
          title: "TANKSTELLE & E-LADESÄULEN",
          desc: "Eni Station & Enel X Schnellladesäulen (400 m)",
          mapsUrl: "https://maps.google.com/?q=Distributore+Morbegno"
        },
        {
          title: "POSTAMT",
          desc: "Poste Italiane Morbegno • Via Garibaldi (8 Min. Fußweg)",
          mapsUrl: "https://maps.google.com/?q=Poste+Italiane+Morbegno"
        },
        {
          title: "SEHENSWÜRDIGKEITEN & KIRCHEN",
          desc: "Stiftskirche San Giovanni Battista & Ganda-Brücke (500 m)",
          mapsUrl: "https://maps.google.com/?q=Collegiata+San+Giovanni+Morbegno"
        }
      ],
      wasteTitle: "Mülltrennung (Tonnen auf der Hausrückseite)",
      wasteDesc: "Die Mülltrennungstonnen befinden sich auf der Rückseite des Hauses: Biomüll (braun), Papier (blau), Plastik/Dosen (gelb), Glas (grün).",
      cirLabel: "Regionaler Identifikationscode (CIR):",
      cinLabel: "Nationaler Identifikationscode (CIN):"
    },
    emergency: {
      title: "NOTFALL & HILFE",
      freeBadge: "KOSTENFREI",
      nationalNumbersTitle: "24-STUNDEN-NOTRUFNUMMERN",
      items: [
        {
          title: "NÄCHSTES KRANKENHAUS",
          subtitle: "Krankenhaus Morbegno / Sondrio",
          phone: "+39 0342 607111",
          mapsUrl: "https://maps.google.com/?q=Ospedale+Morbegno"
        },
        {
          title: "24H NOTAPOTHEKE",
          subtitle: "Städtische Apotheke Morbegno",
          phone: "+39 0342 611222",
          mapsUrl: "https://maps.google.com/?q=Farmacia+Morbegno"
        },
        {
          title: "ÄRZTLICHER BEREITSCHAFTSDIENST",
          subtitle: "Nacht- und Feiertagsnotdienst",
          phone: "116 117"
        },
        {
          title: "POLIZEISTATION (CARABINIERI)",
          subtitle: "Via Merizzi 2, Morbegno",
          phone: "+39 0342 606100",
          mapsUrl: "https://maps.google.com/?q=Carabinieri+Morbegno"
        },
        {
          title: "NOTFALL-TAXI",
          subtitle: "Bahnhofsplatz Morbegno",
          phone: "+39 0342 610000"
        }
      ]
    },
    checkOut: {
      title: "CHECK-OUT (ABREISE)",
      badge: "::: 10:00 (10 AM) :::",
      lateNote: "Wenn Sie einen späteren Check-out wünschen, kontaktieren Sie uns bitte rechtzeitig zwecks Verfügbarkeit.",
      checklistTitle: "Vor Ihrer Abreise bitten wir Sie um Folgendes:",
      checklist: [
        { title: "PERSÖNLICHE GEGENSTÄNDE PRÜFEN", desc: "Schränke, Schubladen, Steckdosen und Bad überprüfen, um nichts zu vergessen." },
        { title: "GERÄTE AUSSCHALTEN", desc: "Alle Lichter, Klimaanlage/Heizung und den Fernseher ausschalten." },
        { title: "MÜLL ENTSORGEN", desc: "Getrennten Müll in den Tonnen im Innenhof deponieren." },
        { title: "FENSTER & LÄDEN SCHLIESSEN", desc: "Fenster und Fensterläden wetterfest verriegeln." },
        { title: "SCHLÜSSEL IN DIE KEYBOX LEGEN", desc: "Schlüssel im Schlüsseltresor deponieren und Zahlencode verstellen." },
        { title: "BENUTZTE HANDTÜCHER", desc: "Benutzte Handtücher in die Duschwanne oder Badewanne legen." },
        { title: "KÜCHE AUFRÄUMEN", desc: "Geschirr in die Spülmaschine einräumen und ggf. Spülgang starten." }
      ],
      thankYou: "Wir danken Ihnen herzlich für Ihren Aufenthalt im Aurora in Valtellina. Gute Heimreise und auf ein baldiges Wiedersehen!"
    },
    contacts: {
      title: "KONTAKT & GASTGEBER",
      hostRole: "Ihr Lokaler Gastgeber • Aurora in Valtellina",
      quote: "Liebe Gäste, ich stehe Ihnen während Ihres gesamten Aufenthalts in Morbegno jederzeit gerne mit Rat und Tat zur Seite. Zögern Sie nicht, mich zu kontaktieren!",
      callAction: "Anrufen",
      chatAction: "WhatsApp Chat",
      smsAction: "SMS senden",
      emailAction: "E-Mail senden",
      copyPhone: "Nummer kopieren",
      copyEmail: "E-Mail kopieren",
      copied: "In die Zwischenablage kopiert!",
      reviewPrompt: "Wir hoffen, Sie hatten einen wundervollen Aufenthalt! Ihre Bewertung ist uns sehr wichtig:",
      rateGoogle: "AUF GOOGLE BEWERTEN",
      rateWebsite: "AUF DER WEBSITE BEWERTEN",
      reviewDialogTitle: "Bewertung für Aurora in Valtellina abgeben",
      ratingPrompt: "Wie bewerten Sie Ihren Aufenthalt insgesamt?",
      commentPrompt: "Ihr Kommentar oder Verbesserungsvorschlag:",
      submitReview: "Bewertung absenden",
      reviewSuccess: "Herzlichen Dank für Ihre wertvolle Bewertung!"
    }
  }
};
