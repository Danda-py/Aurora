export type CmsBlockType = 
  | 'welcome' 
  | 'video_tutorial' 
  | 'wifi' 
  | 'house_rules' 
  | 'local_guide' 
  | 'breaker_thermostat'
  | 'legal_bureaucracy';

export type VisibilityCondition = 
  | 'always'
  | 'pass_active'
  | 'tax_paid'
  | 'gps_nearby'
  | 'checkout_day';

export interface CmsBlock {
  id: string;
  type: CmsBlockType;
  title: string;
  category: 'identity' | 'media' | 'network' | 'legal' | 'guide';
  enabled: boolean;
  order: number;
  visibilityRule: VisibilityCondition;
  customTitle?: string;
  data: Record<string, any>;
  i18n?: Record<string, Record<string, any>>;
}

export interface CmsBlockPreset {
  type: CmsBlockType;
  title: string;
  subtitle: string;
  category: 'identity' | 'media' | 'network' | 'legal' | 'guide';
  defaultRule: VisibilityCondition;
  defaultData: Record<string, any>;
}

export const CMS_BLOCK_PRESETS: CmsBlockPreset[] = [
  {
    type: 'video_tutorial',
    title: 'Video Tutorial YouTube',
    subtitle: 'Embed interattivo per Smart Lock, parcheggio o elettrodomestici',
    category: 'media',
    defaultRule: 'pass_active',
    defaultData: {
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoTitle: 'Come aprire il portone principale e la porta blindata',
      videoDescription: 'Guarda questo breve video di 30 secondi per vedere l\'apertura dello Smart Lock e l\'accesso al cortile privato.'
    }
  },
  {
    type: 'wifi',
    title: 'Credenziali Wi-Fi & Copia Veloce',
    subtitle: 'Nome rete, password con copia automatica negli appunti e avviso velocità',
    category: 'network',
    defaultRule: 'pass_active',
    defaultData: {
      networkLabel: 'Aurora_Valtellina_5G',
      passwordLabel: 'AuroraMorbegno2025!',
      speedNotice: 'Fibra ottica ultraveloce fino a 1 Gbps con copertura in ogni stanza.'
    }
  },
  {
    type: 'house_rules',
    title: 'Regole della Casa & Rifiuti',
    subtitle: 'Orari del silenzio, raccolta differenziata e divieti',
    category: 'legal',
    defaultRule: 'always',
    defaultData: {
      quietHours: '22:00 - 08:00 e 13:30 - 15:00 nel rispetto della quiete del condominio.',
      wasteInfo: 'Raccolta differenziata obbligatoria: mastelli colorati nell\'area cortile interno. Carta (Giallo), Plastica (Blu), Umido (Marrone), Secco (Grigio).',
      noSmoking: true,
      noParties: true,
      petsAllowed: false
    }
  },
  {
    type: 'breaker_thermostat',
    title: 'Quadro Elettrico & Termostato',
    subtitle: 'Istruzioni chiare per riarmare il salvavita e regolare la temperatura',
    category: 'identity',
    defaultRule: 'always',
    defaultData: {
      breakerLocation: 'Ingresso dell\'appartamento, a destra della porta principale dentro lo sportellino bianco. Se salta la corrente sollevare la levetta "GENERALE".',
      thermostatInstructions: 'Termostato digitale in corridoio preimpostato a 20.5°C. Toccare + o - per regolare la temperatura.'
    }
  },
  {
    type: 'local_guide',
    title: 'Guida Locale & Ristoranti Tipici',
    subtitle: 'I migliori crotti, botteghe del Bitto e sentieri alpini consigliati dall\'Host',
    category: 'guide',
    defaultRule: 'always',
    defaultData: {
      recommendedRestaurants: 'Trattoria Valtellinese (pizzoccheri autentici a 400m), Crotto Caurga a Chiavenna, Birrificio Valtellinese.',
      highlights: 'Sentiero del Bitto, Ponte nel Cielo in Val Tartano (a 20 min), Lago di Como e Colico (15 min in auto).'
    }
  },
  {
    type: 'legal_bureaucracy',
    title: 'Codici CIN / CIR & Pubblica Sicurezza',
    subtitle: 'Trasparenza ministeriale, conformità Alloggiati Web e identificativi regionali',
    category: 'legal',
    defaultRule: 'always',
    defaultData: {
      cin: 'IT014045B4A1B2C3D4',
      cir: '014045-CNI-00042',
      securityNotice: 'Struttura registrata e conforme a tutte le normative di pubblica sicurezza e Polizia di Stato (Alloggiati Web).'
    }
  },
  {
    type: 'welcome',
    title: 'Card Benvenuto & Ambienti',
    subtitle: 'Intestazione, messaggio caloroso e descrizione salotto/camera/cucina',
    category: 'identity',
    defaultRule: 'always',
    defaultData: {
      title: 'Benvenuti ad Aurora in Valtellina',
      greeting: 'Siamo felici di ospitarvi a Morbegno!',
      message: 'La vostra casa accogliente nel cuore delle Alpi, tra natura, gusto e relax.',
      viewTitle: 'CORTE & VISTA ALPI',
      viewDesc: 'Parcheggio privato riservato in cortile e vista aperta sulle cime Orobie.',
      livingTitle: 'SALOTTO ACCOGLIENTE & RELAX',
      livingDesc: 'Zona giorno luminosa con divano letto, Smart TV 55" e tavolo da pranzo.',
      bedroomTitle: 'LETTO MATRIMONIALE KING SIZE',
      bedroomDesc: 'Letto matrimoniale ergonomico, biancheria fresca in cotone e armadio capiente.',
      kitchenTitle: 'CUCINA COMPLETA & INDUZIONE',
      kitchenDesc: 'Piano cottura a induzione, forno, macchina caffè Nespresso e bollitore.'
    }
  }
];

export interface CmsThemeSettings {
  primaryColor: string;
  accentColor: string;
  bgMode: 'dark' | 'warm' | 'slate';
  buttonStyle: 'pill' | 'rounded' | 'glow';
  siteTitle?: string;
}

export const VISIBILITY_RULES_OPTIONS: { value: VisibilityCondition; label: string; description: string; badge: string }[] = [
  {
    value: 'always',
    label: 'Sempre visibile (Tutti gli ospiti)',
    description: 'Il blocco è visibile liberamente a chiunque apra la PWA.',
    badge: 'Sempre Visibile'
  },
  {
    value: 'pass_active',
    label: 'Solo se VIP Pass ATTIVO (In soggiorno)',
    description: 'Mostra questo blocco SOLTANTO se il pass dell\'ospite è attualmente valido e in corso.',
    badge: 'Solo Pass Attivo'
  },
  {
    value: 'tax_paid',
    label: 'Solo dopo Tassa di Soggiorno SALDATA',
    description: 'Nasconde le informazioni riservate (es. Wi-Fi) finché la tassa risulta saldata.',
    badge: 'Tassa Saldata'
  },
  {
    value: 'gps_nearby',
    label: 'Solo vicino all\'appartamento (< 60m GPS)',
    description: 'Abilita il blocco e le azioni solo se l\'ospite si trova nel raggio geofence di 60m.',
    badge: 'GPS < 60m'
  },
  {
    value: 'checkout_day',
    label: 'Solo il giorno del Check-out',
    description: 'Mostra istruzioni per la riconsegna chiavi e raccolta differenziata solo nelle ultime ore.',
    badge: 'Check-out'
  }
];

export const HUMAN_LABELS: Record<string, { label: string; description: string; placeholder?: string; type?: 'text' | 'textarea' | 'color' | 'select' }> = {
  title: {
    label: 'Titolo della Card di Benvenuto',
    description: 'Il titolo principale che l\'ospite visualizza in cima alla schermata iniziale.',
    placeholder: 'es. Benvenuti ad Aurora in Valtellina'
  },
  greeting: {
    label: 'Intestazione Ospite / Nome Struttura',
    description: 'Il saluto caloroso o nome della struttura visualizzato in evidenza.',
    placeholder: 'es. Siamo felici di ospitarvi a Morbegno!'
  },
  message: {
    label: 'Messaggio Personale dell\'Host',
    description: 'Un breve testo di caloroso benvenuto per far sentire l\'ospite a casa.',
    type: 'textarea',
    placeholder: 'es. Rilassatevi e godetevi la vista alpina e i sapori autentici della Valtellina.'
  },
  viewTitle: {
    label: 'Titolo Vista Panoramica',
    description: 'Intestazione per la scheda dedicata al panorama e alla corte interna.',
    placeholder: 'es. CORTE & VISTA ALPI'
  },
  viewDesc: {
    label: 'Descrizione Servizi Struttura',
    description: 'Dettagli su parcheggio privato e vista sulle montagne Orobie.',
    type: 'textarea',
    placeholder: 'es. Parcheggio privato riservato e vista sulle vette alpine.'
  },
  livingTitle: {
    label: 'Zona Living & Salotto',
    description: 'Descrizione del comfort in soggiorno, divano e smart TV.',
    placeholder: 'es. SALOTTO ACCOGLIENTE & RELAX'
  },
  livingDesc: {
    label: 'Dettagli Salotto',
    description: 'Caratteristiche della zona giorno.',
    type: 'textarea',
    placeholder: 'es. Divano confortevole, Smart TV 55" 4K con Netflix e fibra ultraveloce.'
  },
  bedroomTitle: {
    label: 'Zona Notte & Letto',
    description: 'Dettagli su materasso king size, cuscini ortopedici e quiete notturna.',
    placeholder: 'es. LETTO MATRIMONIALE KING SIZE'
  },
  bedroomDesc: {
    label: 'Dettagli Camera da Letto',
    description: 'Descrizione dell\'ambiente notte e armadiature.',
    type: 'textarea',
    placeholder: 'es. Biancheria in cotone percalle, doppi cuscini anatomici e tende oscuranti.'
  },
  kitchenTitle: {
    label: 'Cucina & Induzione',
    description: 'Istruzioni e dotazione della cucina.',
    placeholder: 'es. CUCINA COMPLETA & PIANO AD INDUZIONE'
  },
  kitchenDesc: {
    label: 'Dettagli Cucina & Istruzioni',
    description: 'Come usare piano induzione, forno e macchina del caffè.',
    type: 'textarea',
    placeholder: 'es. Piano a induzione con pentole dedicate, macchina espresso e forno elettrico.'
  },
  networkLabel: {
    label: 'Nome Rete Wi-Fi (SSID)',
    description: 'Il nome della rete Wi-Fi che gli ospiti troveranno nell\'appartamento.',
    placeholder: 'es. Aurora_Valtellina_Guest'
  },
  passwordLabel: {
    label: 'Password Wi-Fi',
    description: 'La password WPA2/WPA3 per la connessione veloce.',
    placeholder: 'es. AuroraMorbegno2025'
  },
  speedNotice: {
    label: 'Velocità & Tipologia Rete',
    description: 'Avviso sulla velocità di connessione.',
    placeholder: 'es. Fibra ottica ultraveloce 1 Gbps'
  },
  videoUrl: {
    label: 'Link Video Tutorial YouTube',
    description: 'Incolla l\'URL del video YouTube (formato normale o shorts).',
    placeholder: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  videoTitle: {
    label: 'Titolo del Video Tutorial',
    description: 'Spiega all\'ospite cosa imparerà in questo tutorial.',
    placeholder: 'es. Video guida: come usare lo Smart Lock del portone'
  },
  videoDescription: {
    label: 'Descrizione Video',
    description: 'Breve spiegazione testuale a corredo del video.',
    type: 'textarea',
    placeholder: 'es. Segui i passaggi nel video per accedere in autonomia con il tuo smartphone.'
  },
  breakerLocation: {
    label: 'Posizione Quadro Elettrico / Salvavita',
    description: 'Indicazione precisa su dove riarmare il contatore se salta la corrente.',
    placeholder: 'es. All\'ingresso a destra della porta principale, dietro lo sportellino bianco.'
  },
  thermostatInstructions: {
    label: 'Istruzioni Riscaldamento & Condizionatore',
    description: 'Come impostare la temperatura ideale e usare il termostato a parete.',
    type: 'textarea',
    placeholder: 'es. Termostato digitale a parete: impostato a 20.5°C, premere + o - per variare.'
  },
  cin: {
    label: 'Codice Identificativo Nazionale (CIN)',
    description: 'Codice obbligatorio per locazioni turistiche rilasciato dal Ministero.',
    placeholder: 'es. IT014045B4XXXXXXXX'
  },
  cir: {
    label: 'Codice Identificativo Regionale (CIR)',
    description: 'Codice rilasciato da Regione Lombardia.',
    placeholder: 'es. 014045-CNI-000XX'
  },
  quietHours: {
    label: 'Orari del Silenzio',
    description: 'Fasce orarie in cui è richiesto il massimo rispetto dei vicini.',
    placeholder: 'es. 22:00 - 08:00 e 13:00 - 15:00'
  },
  wasteInfo: {
    label: 'Regole Raccolta Differenziata',
    description: 'Istruzioni su bidoni, colori e giorni di esposizione.',
    type: 'textarea',
    placeholder: 'es. I mastelli colorati sono in cortile. Carta (Giallo), Plastica (Blu), Umido (Marrone).'
  },
  recommendedRestaurants: {
    label: 'Ristoranti & Crotti Consigliati',
    description: 'I migliori locali nei dintorni per assaggiare pizzoccheri e sciatt.',
    type: 'textarea',
    placeholder: 'es. Crotto Caurga a Chiavenna, Trattoria Valtellinese a Morbegno.'
  }
};
