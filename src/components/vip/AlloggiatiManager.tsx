import React, { useState, useEffect } from 'react';
import { GuestPass } from '../../types';
import { 
  ArrowLeft, 
  Download, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Settings,
  Key,
  RefreshCw,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface ComunePreset {
  name: string;
  code: string;
  province: string;
}

interface CountryPreset {
  name: string;
  code: string;
}

const popularComuni: ComunePreset[] = [
  { name: 'Morbegno (SO)', code: '101014045', province: 'SO' },
  { name: 'Sondrio (SO)', code: '101014061', province: 'SO' },
  { name: 'Cosio Valtellino (SO)', code: '101014024', province: 'SO' },
  { name: 'Talamona (SO)', code: '101014063', province: 'SO' },
  { name: 'Ardenno (SO)', code: '101014005', province: 'SO' },
  { name: 'Delebio (SO)', code: '101014026', province: 'SO' },
  { name: 'Colico (LC)', code: '101097023', province: 'LC' },
  { name: 'Chiavenna (SO)', code: '101014018', province: 'SO' },
  { name: 'Tirano (SO)', code: '101014066', province: 'SO' },
  { name: 'Bormio (SO)', code: '101014009', province: 'SO' },
  { name: 'Milano (MI)', code: '101015146', province: 'MI' },
  { name: 'Roma (RM)', code: '101058091', province: 'RM' },
  { name: 'Lecco (LC)', code: '101097042', province: 'LC' },
  { name: 'Bergamo (BG)', code: '101016024', province: 'BG' },
  { name: 'Monza (MB)', code: '101108055', province: 'MB' },
  { name: 'Como (CO)', code: '101013075', province: 'CO' },
];

const popularCountries: CountryPreset[] = [
  { name: 'ITALIA', code: '100000100' },
  { name: 'GERMANIA', code: '100000216' },
  { name: 'SVIZZERA', code: '100000244' },
  { name: 'REGNO UNITO', code: '100000219' },
  { name: 'FRANCIA', code: '100000214' },
  { name: 'STATI UNITI (USA)', code: '100000311' },
  { name: 'PAESI BASSI', code: '100000231' },
  { name: 'SPAGNA', code: '100000242' },
  { name: 'BELGIO', code: '100000204' },
  { name: 'AUSTRIA', code: '100000203' },
  { name: 'POLONIA', code: '100000233' },
  { name: 'REPUBBLICA CECA', code: '100000248' },
  { name: 'CANADA', code: '100000302' },
  { name: 'AUSTRALIA', code: '100000501' },
  { name: 'CINA', code: '100000407' },
];

const normalizeAlloggiatiText = (val: string | undefined): string => {
  if (!val) return '';
  return val
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .trim();
};

const formatToItalianDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const mapNationalityToCode = (natStr: string | undefined): string => {
  const normalized = (natStr || '').trim().toUpperCase();
  if (!normalized) return '100000100';
  
  if (normalized.includes('ITA')) return '100000100';
  if (normalized.includes('GERM') || normalized.includes('DEU') || normalized.includes('TED')) return '100000216';
  if (normalized.includes('SVIZ') || normalized.includes('SWIT') || normalized.includes('CHE')) return '100000244';
  if (normalized.includes('FRAN') || normalized.includes('FRA')) return '100000214';
  if (normalized.includes('REGN') || normalized.includes('UNIT') || normalized.includes('GBR') || normalized.includes('UK') || normalized.includes('ENGL')) return '100000219';
  if (normalized.includes('SPAG') || normalized.includes('SPAI') || normalized.includes('ESP')) return '100000242';
  if (normalized.includes('PAES') || normalized.includes('OLAN') || normalized.includes('NETH') || normalized.includes('NLD')) return '100000231';
  if (normalized.includes('AUSTRI') || normalized.includes('AUT')) return '100000203';
  if (normalized.includes('BELG') || normalized.includes('BEL')) return '100000204';
  if (normalized.includes('STAT') || normalized.includes('USA') || normalized.includes('AMER')) return '100000311';
  if (normalized.includes('POLO') || normalized.includes('POL')) return '100000233';
  if (normalized.includes('CZE') || normalized.includes('CECA')) return '100000248';
  if (normalized.includes('CANAD') || normalized.includes('CAN')) return '100000302';
  if (normalized.includes('AUSTRA') || normalized.includes('AUS')) return '100000501';
  if (normalized.includes('CINA') || normalized.includes('CHN')) return '100000407';

  return '100000100';
};

interface AlloggiatiGuestState {
  tipoAlloggiato: '16' | '17' | '18';
  name: string;
  surname: string;
  gender: 'M' | 'F';
  birthDate: string;
  citizenshipCode: string;
  birthPlaceCode: string;
  birthPlaceProvince: string;
  documentType: 'IDENT' | 'PASSA' | 'PATEN';
  documentNumber: string;
  documentIssuingPlace: string;
}

interface Props {
  storedPasses: GuestPass[];
  onUpdatePassList: () => void;
}



export const AlloggiatiManager: React.FC<Props> = ({ storedPasses, onUpdatePassList }) => {
  const [selectedPass, setSelectedPass] = useState<GuestPass | null>(null);
  const [guests, setGuests] = useState<AlloggiatiGuestState[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'loading' | null; message: string }>({ type: null, message: '' });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [stayDays, setStayDays] = useState<number>(1);

  // Web Service Credentials & Config
  const [showConfig, setShowConfig] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [wsConfig, setWsConfig] = useState({
    utente: '',
    password: '',
    wsKey: '',
    autoSubmitOnCheckin: false,
    testMode: false,
    lastSubmitDate: '',
    lastResult: undefined as any
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState<string | null>(null);
  const [isSubmittingDirectly, setIsSubmittingDirectly] = useState(false);

  useEffect(() => {
    fetch('/api/alloggiati/config', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.config) {
          setWsConfig(data.config);
        }
      })
      .catch(err => console.warn('Errore caricamento config alloggiati:', err));
  }, []);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    setConfigMessage(null);
    try {
      const res = await fetch('/api/alloggiati/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(wsConfig)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Errore salvataggio credenziali');
      setWsConfig(data.config);
      setConfigMessage('✓ Configurazione Alloggiati Web salvata con successo nel server!');
    } catch (err: any) {
      setConfigMessage(`Errore: ${err.message}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleTestConnection = async () => {
    if (!wsConfig.utente || !wsConfig.password || !wsConfig.wsKey) {
      setConfigMessage('Compila Utente, Password e WsKey prima di testare la connessione.');
      return;
    }
    setIsTestingConfig(true);
    setConfigMessage(null);
    try {
      const res = await fetch('/api/alloggiati/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          utente: wsConfig.utente,
          password: wsConfig.password,
          wsKey: wsConfig.wsKey
        })
      });
      const data = await res.json();
      if (data.success) {
        setConfigMessage(`✓ Connessione riuscita: ${data.message}`);
      } else {
        setConfigMessage(`✗ Verifica: ${data.message}`);
      }
    } catch (err: any) {
      setConfigMessage(`Test fallito: ${err.message}`);
    } finally {
      setIsTestingConfig(false);
    }
  };

  const handleSelectPass = (pass: GuestPass) => {
    setSelectedPass(pass);
    setFeedback({ type: null, message: '' });
    
    let days = 1;
    if (pass.checkInDate && pass.checkOutDate) {
      const diffTime = new Date(pass.checkOutDate).getTime() - new Date(pass.checkInDate).getTime();
      days = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    }
    setStayDays(days);

    if (pass.documentsData && pass.documentsData.length > 0) {
      const initialGuests: AlloggiatiGuestState[] = pass.documentsData.map((d, index) => ({
        tipoAlloggiato: (d as any).tipoAlloggiato || (index === 0 ? '16' : '17'),
        name: d.name || '',
        surname: d.surname || '',
        gender: d.gender || 'M',
        birthDate: d.birthDate || '',
        citizenshipCode: (d as any).citizenshipCode || mapNationalityToCode(d.nationality),
        birthPlaceCode: (d as any).birthPlaceCode || (d.birthPlace && d.birthPlace.length === 9 ? d.birthPlace : '101014045'),
        birthPlaceProvince: (d as any).birthPlaceProvince || 'SO',
        documentType: d.documentType === 'passaporto' ? 'PASSA' : d.documentType === 'patente' ? 'PATEN' : 'IDENT',
        documentNumber: d.documentNumber || '',
        documentIssuingPlace: (d as any).documentIssuingPlace || '101014045',
      }));
      setGuests(initialGuests);
    } else {
      const firstGuest: AlloggiatiGuestState = {
        tipoAlloggiato: '16',
        name: pass.guestName || '',
        surname: pass.guestSurname || '',
        gender: 'M',
        birthDate: '',
        citizenshipCode: '100000100',
        birthPlaceCode: '101014045',
        birthPlaceProvince: 'SO',
        documentType: 'IDENT',
        documentNumber: '',
        documentIssuingPlace: '101014045',
      };
      
      const initialGuests = [firstGuest];
      const totalCount = pass.guestsCount || 1;
      for (let i = 1; i < totalCount; i++) {
        initialGuests.push({
          tipoAlloggiato: '17',
          name: '',
          surname: '',
          gender: 'M',
          birthDate: '',
          citizenshipCode: '100000100',
          birthPlaceCode: '101014045',
          birthPlaceProvince: 'SO',
          documentType: 'IDENT',
          documentNumber: '',
          documentIssuingPlace: '101014045',
        });
      }
      
      setGuests(initialGuests);
    }
    setExpandedIndex(0);
  };

  const handleAddGuest = () => {
    setGuests(prev => [
      ...prev,
      {
        tipoAlloggiato: '17',
        name: '',
        surname: '',
        gender: 'M',
        birthDate: '',
        citizenshipCode: '100000100',
        birthPlaceCode: '101014045',
        birthPlaceProvince: 'SO',
        documentType: 'IDENT',
        documentNumber: '',
        documentIssuingPlace: '101014045',
      }
    ]);
    setExpandedIndex(guests.length);
  };

  const handleRemoveGuest = (idx: number) => {
    if (guests.length <= 1) {
      setFeedback({ type: 'error', message: 'Deve esserci almeno un ospite (Capogruppo).' });
      return;
    }
    setGuests(prev => prev.filter((_, i) => i !== idx));
    setExpandedIndex(Math.max(0, idx - 1));
  };

  const handleFieldChange = (idx: number, field: keyof AlloggiatiGuestState, value: any) => {
    setGuests(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === 'citizenshipCode' && value !== '100000100') {
        copy[idx].birthPlaceProvince = '';
        copy[idx].birthPlaceCode = value;
      }
      return copy;
    });
  };



  const handleSaveData = async () => {
    if (!selectedPass) return;
    setFeedback({ type: 'loading', message: 'Salvataggio in corso...' });

    const documentsDataToSave = guests.map(g => ({
      documentType: g.documentType === 'PASSA' ? 'passaporto' as const : g.documentType === 'PATEN' ? 'patente' as const : 'identita' as const,
      documentNumber: g.documentNumber,
      name: g.name,
      surname: g.surname,
      birthDate: g.birthDate,
      birthPlace: g.birthPlaceCode,
      nationality: g.citizenshipCode === '100000100' ? 'ITALIANA' : 'ESTERA',
      gender: g.gender,
      tipoAlloggiato: g.tipoAlloggiato,
      citizenshipCode: g.citizenshipCode,
      birthPlaceCode: g.birthPlaceCode,
      birthPlaceProvince: g.birthPlaceProvince,
      documentIssuingPlace: g.documentIssuingPlace
    }));

    try {
      const res = await fetch(`/api/passes/${selectedPass.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentsData: documentsDataToSave })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Errore durante il salvataggio sul server.');
      }

      const localPassesRaw = localStorage.getItem('AURORA_HOST_PASSES_V1');
      if (localPassesRaw) {
        const localPasses: GuestPass[] = JSON.parse(localPassesRaw);
        const idx = localPasses.findIndex(p => p.id === selectedPass.id);
        if (idx !== -1) {
          localPasses[idx].documentsData = documentsDataToSave as any;
          localPasses[idx].documentsUploaded = true;
          localStorage.setItem('AURORA_HOST_PASSES_V1', JSON.stringify(localPasses));
        }
      }
      
      onUpdatePassList();
      setFeedback({ type: 'success', message: 'Dati degli ospiti salvati con successo!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Si è verificato un errore.' });
    }
  };


  const buildMinisterialLines = (): string[] => {
    if (!selectedPass) return [];

    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      if (!g.name.trim() || !g.surname.trim()) {
        throw new Error(`Ospite #${i + 1}: Nome e Cognome sono obbligatori.`);
      }
      if (!g.birthDate) {
        throw new Error(`Ospite #${i + 1}: Data di nascita è obbligatoria.`);
      }
      if (!g.citizenshipCode) {
        throw new Error(`Ospite #${i + 1}: Codice cittadinanza obbligatorio.`);
      }
      if (!g.birthPlaceCode) {
        throw new Error(`Ospite #${i + 1}: Comune o Stato di nascita obbligatorio.`);
      }
      if (g.citizenshipCode === '100000100' && !g.birthPlaceProvince.trim()) {
        throw new Error(`Ospite #${i + 1}: Provincia di nascita obbligatoria per cittadini italiani.`);
      }

      if (['16', '17', '18'].includes(g.tipoAlloggiato)) {
        if (!g.documentNumber.trim()) {
          throw new Error(`Ospite #${i + 1} (Capogruppo/Singolo): Il numero di documento è obbligatorio.`);
        }
        if (!g.documentIssuingPlace) {
          throw new Error(`Ospite #${i + 1} (Capogruppo/Singolo): Il comune o stato di rilascio del documento è obbligatorio.`);
        }
      }
    }

    const lines: string[] = [];

    guests.forEach(g => {
      const pTipo = g.tipoAlloggiato;
      const pDataArrivo = formatToItalianDate(selectedPass.checkInDate);
      const pGiorni = String(stayDays).padStart(2, '0');
      
      const pCognome = normalizeAlloggiatiText(g.surname).substring(0, 50).padEnd(50, ' ');
      const pNome = normalizeAlloggiatiText(g.name).substring(0, 30).padEnd(30, ' ');
      const pSesso = (g.gender === 'F' ? 'F' : 'M') + ' ';
      
      const pDataNascita = formatToItalianDate(g.birthDate);
      const pComuneNascita = g.birthPlaceCode.padStart(9, ' ').substring(0, 9);
      const pProvNascita = (g.citizenshipCode === '100000100' ? g.birthPlaceProvince.toUpperCase().substring(0, 2) : '  ').padEnd(2, ' ');
      const pCittadinanza = g.citizenshipCode.padStart(9, ' ').substring(0, 9);

      let pDocTipo = '     ';
      let pDocNum = '                    ';
      let pDocRilascio = '         ';

      if (['16', '17', '18'].includes(g.tipoAlloggiato)) {
        pDocTipo = g.documentType.padEnd(5, ' ').substring(0, 5);
        pDocNum = g.documentNumber.toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(20, ' ').substring(0, 20);
        pDocRilascio = g.documentIssuingPlace.padStart(9, ' ').substring(0, 9);
      }

      const line = `${pTipo}${pDataArrivo}${pGiorni}${pCognome}${pNome}${pSesso}${pDataNascita}${pComuneNascita}${pProvNascita}${pCittadinanza}${pDocTipo}${pDocNum}${pDocRilascio}`;
      
      if (line.length !== 160) {
        throw new Error(`Errore tracciato: riga generata di ${line.length} caratteri invece di 160.`);
      }

      lines.push(line);
    });

    return lines;
  };

  const handleExportTxt = () => {
    if (!selectedPass) return;

    try {
      const lines = buildMinisterialLines();
      const fileContent = lines.join('\r\n') + '\r\n';

      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanRef = selectedPass.bookingRef ? selectedPass.bookingRef.replace(/[^A-Za-z0-9_-]/g, '') : 'booking';
      a.href = url;
      a.download = `alloggiati_web_${selectedPass.checkInDate}_${cleanRef}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedback({ 
        type: 'success', 
        message: 'File .txt Alloggiati Web generato e scaricato correttamente! Puoi ora importarlo nel portale ministeriale entro 24 ore dall\'arrivo.' 
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Si è verificato un errore durante l\'esportazione.' });
    }
  };

  const handleDirectSubmit = async () => {
    if (!selectedPass) return;

    try {
      const lines = buildMinisterialLines();
      setIsSubmittingDirectly(true);
      setFeedback({ type: 'loading', message: 'Trasmissione telematica in corso al portale Alloggiati Web (Polizia di Stato)...' });

      const res = await fetch('/api/alloggiati/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Errore durante la trasmissione delle schedine.');
      }

      setFeedback({
        type: 'success',
        message: `Schedine caricate e trasmesse con successo alla Polizia di Stato! Ricevuta: ${data.protocol || 'OK'}`
      });
      onUpdatePassList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Errore durante l\'invio ad Alloggiati Web.' });
    } finally {
      setIsSubmittingDirectly(false);
    }
  };


  if (!selectedPass) {
    return (
      <div className="space-y-5">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-gray-50 to-gray-50 border border-emerald-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Portale Alloggiati Web (Polizia di Stato)
                </h3>
                <p className="text-xs text-emerald-700 font-medium">
                  Invio schedine alloggiati autonomo via Web Service o manuale (.txt)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showConfig ? 'Nascondi Configurazione' : 'Alloggiati Configuration'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            I dati degli ospiti vengono elaborati e formattati secondo il tracciato ufficiale ministeriale (160 caratteri). Puoi configurare le credenziali Web Service per inviare automaticamente le schedine in autonomia non appena gli ospiti eseguono il check-in, oppure inviarle con un click o scaricare il file <code>.txt</code>.
          </p>

          {/* Web Service Status pill */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
              wsConfig.utente && wsConfig.wsKey ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              <Key className="w-3 h-3" />
              {wsConfig.utente && wsConfig.wsKey ? `Web Service Configurato (${wsConfig.utente})` : 'Credenziali Ministeriali Mancanti'}
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
              wsConfig.autoSubmitOnCheckin ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}>
              <UploadCloud className="w-3 h-3" />
              {wsConfig.autoSubmitOnCheckin ? 'Invio Autonomo al Check-in: ATTIVO' : 'Invio Autonomo: DISATTIVATO'}
            </span>

            {wsConfig.testMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200">
                ⚡ Modalità Simulazione / Test
              </span>
            )}
          </div>
        </div>

        {/* Alloggiati Configuration Panel */}
        {showConfig && (
          <div id="alloggiatiConfigurationSection" className="p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-gray-900 text-sm">Alloggiati Configuration (Web Service)</h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Questura di Sondrio / WS Ministeriale</span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Inserisci qui le credenziali Web Service generate su <a href="https://alloggiatiweb.poliziadistato.it" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">alloggiatiweb.poliziadistato.it</a> (menu <em>Amministrazione &gt; Web Service &gt; Genera Chiave</em>). I dati vengono salvati in modo sicuro nello storage del server.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Utente Alloggiati (es. SO0012345)</label>
                <input
                  type="text"
                  id="alloggiatiInputUser"
                  value={wsConfig.utente}
                  onChange={e => setWsConfig({ ...wsConfig, utente: e.target.value })}
                  placeholder="Codice utente Questura"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password Alloggiati Web</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="alloggiatiInputPassword"
                    value={wsConfig.password}
                    onChange={e => setWsConfig({ ...wsConfig, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                    title={showPassword ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Chiave WsKey (Web Service)</label>
                <input
                  type="text"
                  id="alloggiatiInputWsKey"
                  value={wsConfig.wsKey}
                  onChange={e => setWsConfig({ ...wsConfig, wsKey: e.target.value })}
                  placeholder="Chiave generata dal portale"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wsConfig.autoSubmitOnCheckin}
                    onChange={e => setWsConfig({ ...wsConfig, autoSubmitOnCheckin: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Carica direttamente i dati nel portale Alloggiati Web in autonomia (al Check-in)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wsConfig.testMode}
                    onChange={e => setWsConfig({ ...wsConfig, testMode: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Modalità Test / Simulazione (senza trasmettere alla Questura reale)</span>
                </label>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="btnTestAlloggiatiCredentials"
                  onClick={handleTestConnection}
                  disabled={isTestingConfig}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-gray-200 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConfig ? 'animate-spin text-emerald-600' : 'text-gray-600'}`} />
                  <span>{isTestingConfig ? 'Verifica in corso...' : 'Test Credenziali'}</span>
                </button>

                <button
                  type="button"
                  id="btnSaveAlloggiatiConfig"
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingConfig ? 'Salvataggio...' : 'Salva Credenziali'}</span>
                </button>
              </div>
            </div>

            {configMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                configMessage.includes('Errore') || configMessage.includes('fallito') || configMessage.includes('✗') 
                  ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                  : configMessage.includes('Compila')
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {configMessage.includes('Errore') || configMessage.includes('fallito') || configMessage.includes('✗') ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : configMessage.includes('Compila') ? (
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{configMessage}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
            Prenotazioni in archivio
          </h4>

          {storedPasses.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
              Nessun pass ospite presente in memoria.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {storedPasses.map((pass) => {
                const uploadedDocsCount = pass.documentsData ? pass.documentsData.length : 0;
                const hasDocs = pass.documentsUploaded || uploadedDocsCount > 0;
                
                return (
                  <div 
                    key={pass.id}
                    onClick={() => handleSelectPass(pass)}
                    className="p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-xs transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 group-hover:text-emerald-700 transition">
                          {pass.guestName} {pass.guestSurname}
                        </span>
                        {pass.bookingRef && (
                          <span className="text-[10px] font-mono bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">
                            {pass.bookingRef}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3 font-mono">
                        <span>Check-in: {formatToItalianDate(pass.checkInDate)}</span>
                        <span>•</span>
                        <span>Check-out: {formatToItalianDate(pass.checkOutDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      {hasDocs ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Documenti ({uploadedDocsCount})</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                          <Info className="w-3.5 h-3.5" />
                          <span>Da caricare</span>
                        </span>
                      )}
                      
                      <button className="py-1.5 px-3 rounded-lg bg-gray-950 group-hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer">
                        Seleziona
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setSelectedPass(null)}
          className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Indietro alla lista</span>
        </button>
        <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
          Rif: {selectedPass.bookingRef || 'N/A'}
        </span>
      </div>

      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="space-y-1">
          <p className="text-gray-500 font-bold">DETTAGLI PRENOTAZIONE</p>
          <p className="text-gray-900 font-bold text-sm">
            {selectedPass.guestName} {selectedPass.guestSurname}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 text-gray-600">
          <div>
            <p className="text-[10px] text-gray-400 font-bold">ARRIVO</p>
            <p className="font-bold text-gray-800">{formatToItalianDate(selectedPass.checkInDate)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold">PARTENZA</p>
            <p className="font-bold text-gray-800">{formatToItalianDate(selectedPass.checkOutDate)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold">GIORNI</p>
            <input 
              type="number" 
              min={1} 
              max={30}
              value={stayDays} 
              onChange={e => setStayDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold text-gray-800 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 border leading-relaxed ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : feedback.type === 'error' 
            ? 'bg-red-50 border-red-100 text-rose-800' 
            : 'bg-blue-50 border-blue-100 text-blue-800'
        }`}>
          {feedback.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          ) : (
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
            Schedine Ospiti ({guests.length})
          </h4>
          <button
            onClick={handleAddGuest}
            className="py-1 px-3 rounded-lg border border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aggiungi Ospite</span>
          </button>
        </div>

        {guests.map((g, idx) => {
          const isExpanded = expandedIndex === idx;
          const isCapogruppo = g.tipoAlloggiato === '16';
          
          return (
            <div 
              key={idx}
              className={`rounded-xl border transition-all ${
                isExpanded 
                  ? 'border-emerald-300 shadow-xs bg-white' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100/50'
              }`}
            >
              <div 
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCapogruppo 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">
                      {g.surname.trim() || g.name.trim() 
                        ? `${g.surname.toUpperCase()} ${g.name.toUpperCase()}` 
                        : `Ospite #${idx + 1} (Da compilare)`
                      }
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 ml-2.5 px-2 py-0.5 rounded-full bg-gray-100/80 border border-gray-200">
                      {isCapogruppo ? 'Capofamiglia/Capogruppo' : g.tipoAlloggiato === '17' ? 'Familiare' : 'Membro gruppo'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {guests.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveGuest(idx); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-500 font-mono mb-1">Tipo Alloggiato *</label>
                    <select
                      value={g.tipoAlloggiato}
                      onChange={e => handleFieldChange(idx, 'tipoAlloggiato', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                    >
                      <option value="16">Capofamiglia / Capogruppo / Ospite Singolo (Cod. 16)</option>
                      <option value="17">Familiare (Cod. 17)</option>
                      <option value="18">Membro del gruppo (Cod. 18)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 font-mono mb-1">Sesso *</label>
                    <select
                      value={g.gender}
                      onChange={e => handleFieldChange(idx, 'gender', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                    >
                      <option value="M">Maschio (M)</option>
                      <option value="F">Femmina (F)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 font-mono mb-1">Cognome *</label>
                    <input
                      type="text"
                      required
                      value={g.surname}
                      onChange={e => handleFieldChange(idx, 'surname', e.target.value.toUpperCase())}
                      placeholder="ES. ROSSI"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 font-mono mb-1">Nome *</label>
                    <input
                      type="text"
                      required
                      value={g.name}
                      onChange={e => handleFieldChange(idx, 'name', e.target.value.toUpperCase())}
                      placeholder="ES. MARIO"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 font-mono mb-1">Data di Nascita *</label>
                    <input
                      type="date"
                      required
                      value={g.birthDate}
                      onChange={e => handleFieldChange(idx, 'birthDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 font-mono mb-1">Cittadinanza Stato *</label>
                    <select
                      value={g.citizenshipCode}
                      onChange={e => handleFieldChange(idx, 'citizenshipCode', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                    >
                      {popularCountries.map(c => (
                        <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                      ))}
                      <option value="custom">--- Inserisci codice manuale ---</option>
                    </select>
                    {popularCountries.every(c => c.code !== g.citizenshipCode) && (
                      <input
                        type="text"
                        maxLength={9}
                        value={g.citizenshipCode === 'custom' ? '' : g.citizenshipCode}
                        onChange={e => handleFieldChange(idx, 'citizenshipCode', e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Codice ministeriale di 9 cifre"
                        className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-500 font-mono mb-1">Luogo di Nascita *</label>
                    {g.citizenshipCode === '100000100' ? (
                      <>
                        <select
                          value={g.birthPlaceCode}
                          onChange={e => {
                            const selected = popularComuni.find(c => c.code === e.target.value);
                            handleFieldChange(idx, 'birthPlaceCode', e.target.value);
                            if (selected) {
                              handleFieldChange(idx, 'birthPlaceProvince', selected.province);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                        >
                          {popularComuni.map(c => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                          <option value="custom">--- Inserisci codice manuale ---</option>
                        </select>
                        {(g.birthPlaceCode === 'custom' || popularComuni.every(c => c.code !== g.birthPlaceCode)) && (
                          <div className="grid grid-cols-2 gap-2 mt-1.5">
                            <input
                              type="text"
                              maxLength={9}
                              value={g.birthPlaceCode === 'custom' ? '' : g.birthPlaceCode}
                              onChange={e => handleFieldChange(idx, 'birthPlaceCode', e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="Codice Comune (9 cifre)"
                              className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <input
                              type="text"
                              maxLength={2}
                              value={g.birthPlaceProvince}
                              onChange={e => handleFieldChange(idx, 'birthPlaceProvince', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                              placeholder="Provincia (ES. SO)"
                              className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 font-bold text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <select
                          value={g.birthPlaceCode}
                          onChange={e => handleFieldChange(idx, 'birthPlaceCode', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                        >
                          {popularCountries.map(c => (
                            <option key={c.code} value={c.code}>Nato in: {c.name} ({c.code})</option>
                          ))}
                          <option value="custom">--- Inserisci codice manuale ---</option>
                        </select>
                        {(g.birthPlaceCode === 'custom' || popularCountries.every(c => c.code !== g.birthPlaceCode)) && (
                          <input
                            type="text"
                            maxLength={9}
                            value={g.birthPlaceCode === 'custom' ? '' : g.birthPlaceCode}
                            onChange={e => handleFieldChange(idx, 'birthPlaceCode', e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Codice Paese di nascita (9 cifre)"
                            className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        )}
                      </>
                    )}
                  </div>

                  {isCapogruppo && (
                    <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2 space-y-4">
                      <h5 className="font-mono font-bold text-[11px] text-emerald-700 tracking-wider uppercase">
                        Dettagli Documento Identità (Solo Capogruppo)
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-500 font-mono mb-1">Tipo Documento *</label>
                          <select
                            value={g.documentType}
                            onChange={e => handleFieldChange(idx, 'documentType', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                          >
                            <option value="IDENT">Carta d'Identità (IDENT)</option>
                            <option value="PASSA">Passaporto (PASSA)</option>
                            <option value="PATEN">Patente di Guida (PATEN)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-500 font-mono mb-1">Numero Documento *</label>
                          <input
                            type="text"
                            required
                            value={g.documentNumber}
                            onChange={e => handleFieldChange(idx, 'documentNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                            placeholder="ES. CA12345AB"
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-500 font-mono mb-1">Luogo Rilascio Documento *</label>
                          {g.documentType === 'PASSA' ? (
                            <select
                              value={g.documentIssuingPlace}
                              onChange={e => handleFieldChange(idx, 'documentIssuingPlace', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                            >
                              {popularCountries.map(c => (
                                <option key={c.code} value={c.code}>Rilasciato da: {c.name}</option>
                              ))}
                              <option value="custom">--- Inserisci codice manuale ---</option>
                            </select>
                          ) : (
                            <select
                              value={g.documentIssuingPlace}
                              onChange={e => handleFieldChange(idx, 'documentIssuingPlace', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                            >
                              {popularComuni.map(c => (
                                <option key={c.code} value={c.code}>Rilasciato a: {c.name}</option>
                              ))}
                              <option value="custom">--- Inserisci codice manuale ---</option>
                            </select>
                          )}
                          {(g.documentIssuingPlace === 'custom' || (g.documentType === 'PASSA' ? popularCountries.every(c => c.code !== g.documentIssuingPlace) : popularComuni.every(c => c.code !== g.documentIssuingPlace))) && (
                            <input
                              type="text"
                              maxLength={9}
                              value={g.documentIssuingPlace === 'custom' ? '' : g.documentIssuingPlace}
                              onChange={e => handleFieldChange(idx, 'documentIssuingPlace', e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="Codice Comune/Paese rilascio (9 cifre)"
                              className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-3">
        <button
          onClick={handleSaveData}
          className="py-3 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Save className="w-4 h-4 text-gray-500" />
          <span>Salva Modifiche</span>
        </button>

        <button
          onClick={handleDirectSubmit}
          disabled={isSubmittingDirectly}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmittingDirectly ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <UploadCloud className="w-4 h-4" />
          )}
          <span>Invia Direttamente ad Alloggiati Web (Polizia)</span>
        </button>

        <button
          onClick={handleExportTxt}
          className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-gray-600" />
          <span>Scarica File .txt</span>
        </button>
      </div>
    </div>
  );
};


