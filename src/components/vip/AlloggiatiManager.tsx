import React, { useState } from 'react';
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
  ChevronUp
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


  const handleExportTxt = () => {
    if (!selectedPass) return;

    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      if (!g.name.trim() || !g.surname.trim()) {
        setFeedback({ type: 'error', message: `Ospite #${i + 1}: Nome e Cognome sono obbligatori.` });
        setExpandedIndex(i);
        return;
      }
      if (!g.birthDate) {
        setFeedback({ type: 'error', message: `Ospite #${i + 1}: Data di nascita è obbligatoria.` });
        setExpandedIndex(i);
        return;
      }
      if (!g.citizenshipCode) {
        setFeedback({ type: 'error', message: `Ospite #${i + 1}: Codice cittadinanza obbligatorio.` });
        setExpandedIndex(i);
        return;
      }
      if (!g.birthPlaceCode) {
        setFeedback({ type: 'error', message: `Ospite #${i + 1}: Comune o Stato di nascita obbligatorio.` });
        setExpandedIndex(i);
        return;
      }
      if (g.citizenshipCode === '100000100' && !g.birthPlaceProvince.trim()) {
        setFeedback({ type: 'error', message: `Ospite #${i + 1}: Provincia di nascita obbligatoria per cittadini italiani.` });
        setExpandedIndex(i);
        return;
      }

      if (g.tipoAlloggiato === '16') {
        if (!g.documentNumber.trim()) {
          setFeedback({ type: 'error', message: `Ospite #${i + 1} (Capogruppo): Il numero di documento è obbligatorio.` });
          setExpandedIndex(i);
          return;
        }
        if (!g.documentIssuingPlace) {
          setFeedback({ type: 'error', message: `Ospite #${i + 1} (Capogruppo): Il comune o stato di rilascio del documento è obbligatorio.` });
          setExpandedIndex(i);
          return;
        }
      }
    }

    try {
      let fileContent = '';

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

        if (g.tipoAlloggiato === '16') {
          pDocTipo = g.documentType.padEnd(5, ' ').substring(0, 5);
          pDocNum = g.documentNumber.toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(20, ' ').substring(0, 20);
          pDocRilascio = g.documentIssuingPlace.padStart(9, ' ').substring(0, 9);
        }

        const line = `${pTipo}${pDataArrivo}${pGiorni}${pCognome}${pNome}${pSesso}${pDataNascita}${pComuneNascita}${pProvNascita}${pCittadinanza}${pDocTipo}${pDocNum}${pDocRilascio}`;
        
        if (line.length !== 160) {
          throw new Error(`Errore interno: riga generata di lunghezza ${line.length} anziché 160 caratteri.`);
        }

        fileContent += line + '\r\n';
      });

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


  if (!selectedPass) {
    return (
      <div className="space-y-5">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-gray-50 to-gray-50 border border-emerald-100 space-y-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              Generazione Schedine Alloggiati Web
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Seleziona una prenotazione attiva per verificarne i documenti caricati dagli ospiti e generare il file <code>.txt</code> pronto per l'invio sul portale ministeriale della Polizia di Stato entro 24 ore dal check-in.
          </p>
        </div>

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
          className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Save className="w-4 h-4 text-gray-500" />
          <span>Salva Modifiche</span>
        </button>

        <button
          onClick={handleExportTxt}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shadow-emerald-500/10 active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Scarica File Alloggiati (.txt)</span>
        </button>
      </div>
    </div>
  );
};


