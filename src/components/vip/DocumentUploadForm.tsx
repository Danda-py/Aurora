import React, { useState } from 'react';
import { GuestPass, Language } from '../../types';
import { Camera, FileText, Check, AlertCircle, Loader2, CheckCircle2, User, ChevronRight, Crop } from 'lucide-react';
import { trackActivity } from '../../services/activityTrackingService';

const dTranslations: Record<Language, any> = {
  it: {
    title: "Check-in Alloggiati Web",
    subtitle: "Registra i dati personali e i documenti di tutti gli ospiti della prenotazione.",
    guestsList: "Ospiti della Prenotazione",
    guestLeader: "Ospite 1 (Capogruppo)",
    guestLabel: "Ospite",
    toCompile: "Da compilare",
    completed: "COMPLETATO",
    pending: "DA COMPILARE",
    submitAll: "Invia tutti i documenti e completa il Check-in",
    cancel: "Annulla",
    back: "Indietro",
    selectDocType: "Seleziona tipo documento",
    idCard: "C. Identità",
    passport: "Passaporto",
    driverLicense: "Patente",
    snapPhoto: "Scatta Foto Documento (OCR)",
    fillManually: "Compila Manualmente",
    ocrScanning: "Analisi OCR...",
    surname: "Cognome *",
    name: "Nome *",
    gender: "Sesso *",
    male: "Maschio",
    female: "Femmina",
    birthDate: "Data Nascita *",
    birthPlace: "Luogo Nascita *",
    cityOrCountry: "Comune o Stato",
    citizenship: "Cittadinanza *",
    arrivalDate: "Data Arrivo",
    nightsCount: "Notti di Soggiorno",
    docNumber: "Numero Documento *",
    issueDate: "Data Rilascio",
    issueAuthority: "Luogo/Ente Rilascio",
    issuePlacePlaceholder: "es. Comune, Questura, etc.",
    retakePhoto: "Rifare Foto",
    save: "Salva",
    successTitle: "Check-in Completato con Successo!",
    scanFailedAuto: "Impossibile completare la scansione automatica.",
    scanFailedManual: "Scansione fallita. Inserisci i dati manualmente.",
    requiredFields: "Tutti i campi con asterisco (*) sono obbligatori.",
    registerAll: "Registra i dati di tutti gli ospiti della prenotazione."
  },
  en: {
    title: "Alloggiati Web Registration",
    subtitle: "Register details and IDs for all guests on this booking.",
    guestsList: "Guests list",
    guestLeader: "Guest 1 (Group Leader)",
    guestLabel: "Guest",
    toCompile: "To compile",
    completed: "COMPLETED",
    pending: "PENDING",
    submitAll: "Submit All & Complete Check-in",
    cancel: "Cancel",
    back: "Back",
    selectDocType: "Select Document Type",
    idCard: "ID Card",
    passport: "Passport",
    driverLicense: "Driver's Lic.",
    snapPhoto: "Snap ID Photo (OCR)",
    fillManually: "Fill Manually",
    ocrScanning: "OCR Scanning...",
    surname: "Surname *",
    name: "Name *",
    gender: "Gender *",
    male: "Male",
    female: "Female",
    birthDate: "Birth Date *",
    birthPlace: "Birth Place *",
    cityOrCountry: "City or Country",
    citizenship: "Citizenship *",
    arrivalDate: "Arrival Date",
    nightsCount: "Nights of Stay",
    docNumber: "Doc Number *",
    issueDate: "Issue Date",
    issueAuthority: "Issue Authority",
    issuePlacePlaceholder: "e.g. Town Hall, Police",
    retakePhoto: "Retake Photo",
    save: "Save",
    successTitle: "Check-in Completed Successfully!",
    scanFailedAuto: "Failed to complete auto-scan.",
    scanFailedManual: "Scan failed. Please enter details manually.",
    requiredFields: "All fields with asterisk (*) are required.",
    registerAll: "Please register details for all guests."
  },
  es: {
    title: "Registro Alloggiati Web",
    subtitle: "Registra los datos personales y documentos de todos los huéspedes de esta reserva.",
    guestsList: "Lista de huéspedes",
    guestLeader: "Huésped 1 (Responsable de grupo)",
    guestLabel: "Huésped",
    toCompile: "Por rellenar",
    completed: "COMPLETADO",
    pending: "PENDIENTE",
    submitAll: "Enviar todos los documentos y completar check-in",
    cancel: "Cancelar",
    back: "Atrás",
    selectDocType: "Seleccionar tipo de documento",
    idCard: "Doc. Identidad",
    passport: "Pasaporte",
    driverLicense: "Lic. de Conducir",
    snapPhoto: "Tomar foto del documento (OCR)",
    fillManually: "Rellenar manualmente",
    ocrScanning: "Análisis OCR...",
    surname: "Apellido *",
    name: "Nombre *",
    gender: "Sexo *",
    male: "Masculino",
    female: "Femenino",
    birthDate: "Fecha de nacimiento *",
    birthPlace: "Lugar de nacimiento *",
    cityOrCountry: "Ciudad o País",
    citizenship: "Nacionalidad *",
    arrivalDate: "Fecha de llegada",
    nightsCount: "Noches de estancia",
    docNumber: "Número de documento *",
    issueDate: "Fecha de emisión",
    issueAuthority: "Autoridad emisora",
    issuePlacePlaceholder: "ej. Ayuntamiento, Policía",
    retakePhoto: "Repetir foto",
    save: "Guardar",
    successTitle: "¡Check-in completado con éxito!",
    scanFailedAuto: "No se pudo completar el escaneo automático.",
    scanFailedManual: "Escaneo fallido. Por favor, introduce los datos manualmente.",
    requiredFields: "Todos los campos con asterisco (*) son obligatorios.",
    registerAll: "Por favor, registra los datos de todos los huéspedes."
  },
  de: {
    title: "Meldestelle Web-Registrierung",
    subtitle: "Registrieren Sie die persönlichen Daten und Ausweise aller Gäste dieser Buchung.",
    guestsList: "Gästeliste",
    guestLeader: "Gast 1 (Gruppenleiter)",
    guestLabel: "Gast",
    toCompile: "Auszufüllen",
    completed: "AUSGEFÜLLT",
    pending: "OFFEN",
    submitAll: "Alle Dokumente senden & Check-in abschließen",
    cancel: "Abbrechen",
    back: "Zurück",
    selectDocType: "Dokumententyp auswählen",
    idCard: "Personalausweis",
    passport: "Reisepass",
    driverLicense: "Führerschein",
    snapPhoto: "Ausweis-Foto aufnehmen (OCR)",
    fillManually: "Manuell ausfüllen",
    ocrScanning: "OCR-Scannen...",
    surname: "Nachname *",
    name: "Vorname *",
    gender: "Geschlecht *",
    male: "Männlich",
    female: "Weiblich",
    birthDate: "Geburtsdatum *",
    birthPlace: "Geburtsort *",
    cityOrCountry: "Ort oder Land",
    citizenship: "Staatsangehörigkeit *",
    arrivalDate: "Ankunftsdatum",
    nightsCount: "Übernachtungen",
    docNumber: "Ausweisnummer *",
    issueDate: "Ausstellungsdatum",
    issueAuthority: "Ausstellungsbehörde",
    issuePlacePlaceholder: "z. B. Rathaus, Polizei",
    retakePhoto: "Foto erneut aufnehmen",
    save: "Speichern",
    successTitle: "Check-in erfolgreich abgeschlossen!",
    scanFailedAuto: "Automatischer Scan fehlgeschlagen.",
    scanFailedManual: "Scan fehlgeschlagen. Bitte geben Sie die Daten manuell ein.",
    requiredFields: "Alle Felder mit einem Sternchen (*) sind Pflichtfelder.",
    registerAll: "Bitte registrieren Sie die Daten für alle Gäste."
  },
  fr: {
    title: "Enregistrement Alloggiati Web",
    subtitle: "Enregistrez les coordonnées et pièces d'identité de tous les voyageurs de cette réservation.",
    guestsList: "Liste des voyageurs",
    guestLeader: "Voyageur 1 (Chef de groupe)",
    guestLabel: "Voyageur",
    toCompile: "À remplir",
    completed: "COMPLÉTÉ",
    pending: "À REMPLIR",
    submitAll: "Envoyer tous les documents et terminer le check-in",
    cancel: "Annuler",
    back: "Retour",
    selectDocType: "Sélectionner le type de document",
    idCard: "Carte d'identité",
    passport: "Passeport",
    driverLicense: "Permis de conduire",
    snapPhoto: "Prendre photo du document (OCR)",
    fillManually: "Remplir manuellement",
    ocrScanning: "Analyse OCR...",
    surname: "Nom de famille *",
    name: "Prénom *",
    gender: "Sexe *",
    male: "Masculin",
    female: "Féminin",
    birthDate: "Date de naissance *",
    birthPlace: "Lieu de naissance *",
    cityOrCountry: "Ville ou Pays",
    citizenship: "Nationalité *",
    arrivalDate: "Date d'arrivée",
    nightsCount: "Nuits de séjour",
    docNumber: "Numéro de document *",
    issueDate: "Date de délivrance",
    issueAuthority: "Autorité de délivrance",
    issuePlacePlaceholder: "ex. Mairie, Police",
    retakePhoto: "Reprendre la photo",
    save: "Sauvegarder",
    successTitle: "Check-in terminé avec succès !",
    scanFailedAuto: "Échec du scan automatique.",
    scanFailedManual: "Échec du scan. Veuillez saisir les informations manuellement.",
    requiredFields: "Tous les champs avec un astérisque (*) sont obligatoires.",
    registerAll: "Veuillez enregistrer les coordonnées de tous les voyageurs."
  }
};


interface Props {
  pass: GuestPass;
  language: Language;
  onSaveSuccess: (updatedPass: GuestPass) => void;
  onCancel?: () => void;
}

interface GuestDocument {
  name: string;
  surname: string;
  gender: 'M' | 'F';
  birthDate: string;
  birthPlace: string;
  citizenship: string;
  arrivalDate: string;
  nightsCount: number;
  documentType: 'identita' | 'passaporto' | 'patente';
  documentNumber: string;
  issuePlace: string;
  issueDate: string;
  profileImage?: string;
  nationality?: string;
}

/**
 * Le foto scattate con la fotocamera del telefono (capture="environment") sono spesso
 * da 3 a 10+ MB. Le funzioni serverless di Vercel rifiutano qualunque richiesta sopra i
 * 4.5MB con un errore 413, che a schermo si traduceva in "scansione fallita al 90%".
 * Ridimensioniamo e ricomprimiamo l'immagine lato client prima di inviarla, così il
 * payload resta piccolo (tipicamente poche centinaia di KB) senza perdere leggibilità
 * per l'OCR.
 */
/**
 * Le foto scattate con la fotocamera del telefono (capture="environment") sono spesso
 * da 3 a 10+ MB. Le funzioni serverless di Vercel rifiutano qualunque richiesta sopra i
 * 4.5MB con un errore 413, che a schermo si traduceva in "scansione fallita al 90%".
 * Ridimensioniamo e ricomprimiamo l'immagine lato client prima di inviarla.
 * Usiamo l'opzione rapida: maxDimension = 1400, quality = 0.7, e ricompressione a step
 * finché la dimensione stimata del file non è inferiore a 2.5MB.
 */
async function resizeImageForOcr(file: File, maxDimension = 1400, quality = 0.7): Promise<string> {
  const originalDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Se il browser non supporta canvas per qualche motivo, torniamo all'originale.
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = originalDataUrl;
    });

    let currentDimension = maxDimension;
    let currentQuality = quality;
    let resultDataUrl = '';
    const maxSteps = 5;

    for (let step = 0; step < maxSteps; step++) {
      const scale = Math.min(1, currentDimension / Math.max(img.width, img.height));
      const targetWidth = Math.round(img.width * scale);
      const targetHeight = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resultDataUrl = originalDataUrl;
        break;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      resultDataUrl = canvas.toDataURL('image/jpeg', currentQuality);

      // Stima della dimensione in byte dal base64
      const sizeInBytes = (resultDataUrl.length * 3) / 4;
      if (sizeInBytes <= 2.5 * 1024 * 1024) {
        break; // Sotto i 2.5MB, ottimo!
      }

      // Riduciamo la risoluzione del 15% e la qualità di 0.1 per il prossimo ciclo
      currentDimension = Math.round(currentDimension * 0.85);
      currentQuality = Math.max(0.3, currentQuality - 0.1);
    }

    return resultDataUrl || originalDataUrl;
  } catch {
    return originalDataUrl;
  }
}

export const DocumentUploadForm: React.FC<Props> = ({ pass, language, onSaveSuccess, onCancel }) => {
  const t = dTranslations[language] || dTranslations.en;
  
  // State for list of guests, prefilled from previous data or booking info
  const [guests, setGuests] = useState<Array<{ id: number; data: Partial<GuestDocument> | null; isCompleted: boolean }>>(() => {
    if (pass.documentsData && pass.documentsData.length > 0) {
      return pass.documentsData.map((doc: any, idx) => ({
        id: idx + 1,
        data: doc,
        isCompleted: true
      }));
    } else {
      const count = pass.guestsCount && pass.guestsCount > 0 ? pass.guestsCount : 2;
      const nights = (() => {
        try {
          const d1 = new Date(pass.checkInDate);
          const d2 = new Date(pass.checkOutDate);
          return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
        } catch { return 1; }
      })();
      return Array.from({ length: count }, (_, idx) => ({
        id: idx + 1,
        data: idx === 0 ? {
          name: pass.guestName || '',
          surname: pass.guestSurname || '',
          arrivalDate: pass.checkInDate || '',
          nightsCount: nights,
          citizenship: 'ITALIANA'
        } : {
          arrivalDate: pass.checkInDate || '',
          nightsCount: nights,
          citizenship: 'ITALIANA'
        },
        isCompleted: false
      }));
    }
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [docType, setDocType] = useState<'identita' | 'passaporto' | 'patente'>('identita');
  const [state, setState] = useState({ isScanning: false, scanProgress: 0, ocrStatus: 'idle', isSubmitting: false, error: null as string | null, success: false });
  const [form, setForm] = useState<Partial<GuestDocument>>({});
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [cropSelection, setCropSelection] = useState({ x: 32, y: 18, width: 36, height: 44 });
  const cropStart = React.useRef<{ pointerX: number; pointerY: number; x: number; y: number; width: number; height: number; mode: 'move' | 'resize' } | null>(null);

  const inputC = "w-full p-2 rounded-xl bg-[#131d27] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500";
  const labelC = "text-[10px] font-mono text-slate-400 uppercase block";

  const startEdit = (idx: number) => {
    setActiveIndex(idx);
    const g = guests.find(item => item.id === idx);
    const nights = (() => {
      try {
        const d1 = new Date(pass.checkInDate);
        const d2 = new Date(pass.checkOutDate);
        return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
      } catch { return 1; }
    })();

    if (g && g.isCompleted && g.data) {
      setForm(g.data);
      setDocumentPreview(null);
      setCropSelection({ x: 32, y: 18, width: 36, height: 44 });
      setDocType(g.data.documentType || 'identita');
      setState(s => ({ ...s, ocrStatus: 'success' }));
    } else {
      setDocumentPreview(null);
      setCropSelection({ x: 32, y: 18, width: 36, height: 44 });
      setForm({
        name: idx === 1 ? pass.guestName || '' : '',
        surname: idx === 1 ? pass.guestSurname || '' : '',
        gender: 'M',
        birthDate: '',
        birthPlace: '',
        citizenship: 'ITALIANA',
        arrivalDate: pass.checkInDate || '',
        nightsCount: nights,
        documentType: 'identita',
        documentNumber: '',
        issuePlace: '',
        issueDate: ''
      });
      setDocType('identita');
      setState(s => ({ ...s, ocrStatus: 'idle' }));
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setState(s => ({ ...s, isScanning: true, scanProgress: 15, error: null }));
    try {
      // Simulation of progress bar since backend call has no real-time percentage
      const progressInterval = setInterval(() => {
        setState(s => {
          if (s.scanProgress >= 90) {
            clearInterval(progressInterval);
            return s;
          }
          return { ...s, scanProgress: s.scanProgress + 10 };
        });
      }, 350);

      // Ridimensiona e comprimi la foto (evita il 413 "payload too large" di Vercel
      // sulle foto ad alta risoluzione scattate dalla fotocamera del telefono).
      const dataUrl = await resizeImageForOcr(file);

      setState(s => ({ ...s, scanProgress: 45 }));

      setDocumentPreview(dataUrl);
      setCropSelection({ x: 32, y: 18, width: 36, height: 44 });
      setState(s => ({ ...s, scanProgress: 65 }));

      const res = await fetch('/api/guest/ocr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-token': pass?.token || ''
        },
        credentials: 'include',
        body: JSON.stringify({
          dataUrl,
          docType,
          token: pass?.token,
          guestToken: pass?.token
        })
      });

      clearInterval(progressInterval);
      setState(s => ({ ...s, scanProgress: 100 }));

      if (res.status === 413) {
        throw new Error('La foto è troppo pesante anche dopo la compressione. Riprova con più luce o inquadrando solo il documento, oppure inserisci i dati manualmente.');
      }

      if (!res.ok) {
        let errMessage = t.scanFailedAuto;
        try {
          const errJson = await res.json();
          if (errJson?.error) errMessage = errJson.error;
        } catch (_) {}
        throw new Error(errMessage);
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Errore OCR.');
      }

      const data = json.data;
      setForm(f => ({
        ...f,
        name: data.name || f.name || '',
        surname: data.surname || f.surname || '',
        gender: data.gender || f.gender || 'M',
        birthDate: data.birthDate || f.birthDate || '',
        birthPlace: data.birthPlace || f.birthPlace || '',
        citizenship: data.citizenship || f.citizenship || 'ITALIANA',
        documentNumber: data.documentNumber || f.documentNumber || '',
        issuePlace: data.issuePlace || f.issuePlace || '',
        issueDate: data.issueDate || f.issueDate || ''
      }));

      setState(s => ({ ...s, ocrStatus: 'success' }));
    } catch (err: any) {
      console.error(err);
      setState(s => ({ ...s, ocrStatus: 'success', error: err?.message || t.scanFailedManual }));
    } finally {
      setState(s => ({ ...s, isScanning: false }));
    }
  };

  const saveGuestForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentPreview && !form.profileImage) {
      setState(s => ({ ...s, error: 'Conferma il ritaglio del volto per salvare la foto profilo.' }));
      return;
    }
    if (!form.name || !form.surname || !form.documentNumber || !form.birthDate || !form.citizenship) {
      setState(s => ({ ...s, error: t.requiredFields }));
      return;
    }
    const finalData = { ...form, documentType: docType, profileImage: form.profileImage };
    setGuests(guests.map(g => g.id === activeIndex ? { ...g, data: finalData, isCompleted: true } : g));
    setActiveIndex(null);
    setState(s => ({ ...s, error: null }));
  };

  const saveProfileCrop = () => {
    if (!documentPreview) return;
    const image = new Image();
    image.onload = () => {
      const sourceX = image.width * cropSelection.x / 100;
      const sourceY = image.height * cropSelection.y / 100;
      const sourceWidth = image.width * cropSelection.width / 100;
      const sourceHeight = image.height * cropSelection.height / 100;
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 300;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      setForm(current => ({ ...current, profileImage: canvas.toDataURL('image/jpeg', 0.82) }));
    };
    image.src = documentPreview;
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLElement>, mode: 'move' | 'resize' = 'move') => {
    event.preventDefault();
    event.stopPropagation();
    const cropContainer = mode === 'resize' ? event.currentTarget.parentElement?.parentElement : event.currentTarget.parentElement;
    const rect = cropContainer?.getBoundingClientRect();
    if (!rect) return;
    cropStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: cropSelection.x,
      y: cropSelection.y,
      width: cropSelection.width,
      height: cropSelection.height,
      mode
    };
    const update = (clientX: number, clientY: number) => {
      const start = cropStart.current;
      if (!start) return;
      const deltaX = (clientX - start.pointerX) / rect.width * 100;
      const deltaY = (clientY - start.pointerY) / rect.height * 100;
      setCropSelection(current => start.mode === 'resize' ? ({
        ...current,
        width: Math.max(16, Math.min(100 - start.x, start.width + deltaX)),
        height: Math.max(18, Math.min(100 - start.y, start.height + deltaY))
      }) : ({
        ...current,
        x: Math.max(0, Math.min(100 - current.width, start.x + deltaX)),
        y: Math.max(0, Math.min(100 - current.height, start.y + deltaY))
      }));
    };
    const move = (moveEvent: PointerEvent) => update(moveEvent.clientX, moveEvent.clientY);
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      cropStart.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop, { once: true });
  };

  const submitAll = async () => {
    const incomplete = guests.filter(g => !g.isCompleted);
    if (incomplete.length > 0) {
      setState(s => ({ ...s, error: t.registerAll }));
      return;
    }
    setState(s => ({ ...s, isSubmitting: true, error: null }));
    try {
      const payload = guests.map(g => g.data);
      const res = await fetch('/api/guest/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: pass.token, documentsData: payload })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setState(s => ({ ...s, success: true }));
      trackActivity(pass, 'document_upload', `${payload.length} ospite/i`);
      setTimeout(() => onSaveSuccess(data.pass), 2000);
    } catch (err: any) {
      setState(s => ({ ...s, error: err.message || 'Error saving data' }));
    } finally {
      setState(s => ({ ...s, isSubmitting: false }));
    }
  };

  if (state.success) return (
    <div className="aurora-glass-card p-6 text-center space-y-4 animate-scale-up">
      <CheckCircle2 className="w-12 h-12 text-[#62e6bd] mx-auto animate-pulse" />
      <h3 className="text-base font-bold text-white">{t.successTitle}</h3>
    </div>
  );

  if (activeIndex !== null) {
    const isMain = activeIndex === 1;
    return (
      <div className="aurora-glass-card p-4 sm:p-5 space-y-4 text-left animate-fade-in relative">
        <button onClick={() => setActiveIndex(null)} className="absolute top-4 left-4 text-xs text-slate-400 hover:text-white flex items-center gap-1">
          &larr; {t.back}
        </button>
        <div className="text-center pt-4 pb-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{isMain ? t.guestLeader : `${t.guestLabel} ${activeIndex}`}</h3>
        </div>
        {state.ocrStatus === 'idle' && !state.isScanning ? (
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <span className={labelC}>{t.selectDocType}</span>
              <div className="grid grid-cols-3 gap-2">
                {(['identita', 'passaporto', 'patente'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setDocType(type)} className={`py-2 px-1 text-center rounded-xl border text-[11px] font-semibold transition cursor-pointer flex flex-col items-center justify-center gap-1 ${docType === type ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold' : 'bg-white/[0.03] border-white/10 text-slate-400'}`}>
                    <FileText className="w-3.5 h-3.5" />
                    <span>{type === 'identita' ? t.idCard : type === 'passaporto' ? t.passport : t.driverLicense}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="w-full py-5 px-4 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 hover:border-emerald-500/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition">
              <Camera className="w-6 h-6 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">{t.snapPhoto}</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
            </label>
            <div className="text-center">
              <button onClick={() => setState(s => ({ ...s, ocrStatus: 'success' }))} className="text-xs text-emerald-400 underline font-mono cursor-pointer font-bold">{t.fillManually}</button>
            </div>
          </div>
        ) : state.isScanning ? (
          <div className="p-6 text-center space-y-3">
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mx-auto" />
            <p className="text-xs font-bold text-white">{t.ocrScanning} ({state.scanProgress}%)</p>
          </div>
        ) : (
          <form onSubmit={saveGuestForm} className="space-y-3.5 pt-1 animate-fade-in">
            {state.error && <div className="p-2 rounded-xl bg-red-950/20 border border-red-500/30 text-rose-300 text-[11px]">{state.error}</div>}

            {documentPreview && (
              <div className="space-y-2">
                <p className={labelC}>Ritaglia la foto profilo · trascina il riquadro</p>
                <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-white/10 select-none touch-none">
                  <img src={documentPreview} alt="Anteprima documento in memoria" className="block w-full h-auto" draggable={false} />
                  <div
                    className="absolute cursor-move border-2 border-emerald-300 bg-emerald-300/15 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] touch-none"
                    style={{ left: `${cropSelection.x}%`, top: `${cropSelection.y}%`, width: `${cropSelection.width}%`, height: `${cropSelection.height}%` }}
                    onPointerDown={handleCropPointerDown}
                    aria-label="Sposta il riquadro di ritaglio"
                  >
                    <span className="absolute inset-x-0 bottom-0 bg-black/65 py-0.5 text-center text-[9px] font-bold text-white">VOLTO</span>
                    <span onPointerDown={event => handleCropPointerDown(event, 'resize')} className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-zinc-950 bg-emerald-300" aria-label="Ridimensiona il riquadro di ritaglio" />
                  </div>
                </div>
                <button type="button" onClick={saveProfileCrop} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-bold text-emerald-200">
                  <Crop className="h-3.5 w-3.5" /> {form.profileImage ? 'Aggiorna ritaglio profilo' : 'Conferma ritaglio profilo'}
                </button>
                {form.profileImage && <img src={form.profileImage} alt="Anteprima ritaglio profilo" className="h-14 w-14 rounded-full border border-emerald-400/50 object-cover" />}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelC}>{t.surname}</label>
                <input type="text" required value={form.surname || ''} onChange={e => setForm({ ...form, surname: e.target.value.toUpperCase() })} className={inputC} />
              </div>
              <div>
                <label className={labelC}>{t.name}</label>
                <input type="text" required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })} className={inputC} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelC}>{t.gender}</label>
                <select value={form.gender || 'M'} onChange={e => setForm({ ...form, gender: e.target.value as any })} className={inputC}>
                  <option value="M">{t.male}</option>
                  <option value="F">{t.female}</option>
                </select>
              </div>
              <div>
                <label className={labelC}>{t.birthDate}</label>
                <input type="date" required value={form.birthDate || ''} onChange={e => setForm({ ...form, birthDate: e.target.value })} className={inputC} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelC}>{t.birthPlace}</label>
                <input type="text" required placeholder={t.cityOrCountry} value={form.birthPlace || ''} onChange={e => setForm({ ...form, birthPlace: e.target.value.toUpperCase() })} className={inputC} />
              </div>
              <div>
                <label className={labelC}>{t.citizenship}</label>
                <input type="text" required value={form.citizenship || form.nationality || 'ITALIANA'} onChange={e => setForm({ ...form, citizenship: e.target.value.toUpperCase() })} className={inputC} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <label className={labelC}>{t.arrivalDate}</label>
                <input type="text" disabled value={form.arrivalDate || ''} className={`${inputC} opacity-60`} />
              </div>
              <div>
                <label className={labelC}>{t.nightsCount}</label>
                <input type="text" disabled value={form.nightsCount || 1} className={`${inputC} opacity-60`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelC}>{t.docNumber}</label>
                <input type="text" required value={form.documentNumber || ''} onChange={e => setForm({ ...form, documentNumber: e.target.value.toUpperCase() })} className={`${inputC} font-mono`} />
              </div>
              <div>
                <label className={labelC}>{t.issueDate}</label>
                <input type="date" value={form.issueDate || ''} onChange={e => setForm({ ...form, issueDate: e.target.value })} className={inputC} />
              </div>
            </div>

            <div>
              <label className={labelC}>{t.issueAuthority}</label>
              <input type="text" placeholder={t.issuePlacePlaceholder} value={form.issuePlace || ''} onChange={e => setForm({ ...form, issuePlace: e.target.value.toUpperCase() })} className={inputC} />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { setDocumentPreview(null); setForm(current => ({ ...current, profileImage: undefined })); setState(s => ({ ...s, ocrStatus: 'idle', isScanning: false, scanProgress: 0 })); }} className="py-2.5 px-3 rounded-xl bg-amber-500/10 text-amber-300 font-bold text-xs border border-amber-500/20 cursor-pointer">
                <Camera className="w-4 h-4 inline-block mr-1" />
                {t.retakePhoto}
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer">
                <Check className="w-3.5 h-3.5" />
                <span>{t.save}</span>
              </button>
              <button type="button" onClick={() => setActiveIndex(null)} className="py-2.5 px-3 rounded-xl bg-white/[0.04] text-slate-400 font-bold text-xs border border-white/5 cursor-pointer">{t.cancel}</button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Else, render List of Guests Dashboard
  return (
    <div className="aurora-glass-card p-4 sm:p-5 space-y-4 text-left">
      <div className="text-center space-y-1">
        <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
          <User className="w-4 h-4 text-emerald-400" />
          <span>{t.title}</span>
        </h3>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">{t.subtitle}</p>
      </div>

      {state.error && <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-rose-300 text-xs">{state.error}</div>}

      <div className="space-y-2.5">
        <span className={labelC}>{t.guestsList}</span>
        <div className="space-y-2">
          {guests.map((g, idx) => {
            const isCompleted = g.isCompleted && g.data;
            const title = g.id === 1 ? t.guestLeader : `${t.guestLabel} ${g.id}`;
            const nameLabel = isCompleted ? `${g.data?.name} ${g.data?.surname}`.trim() : t.toCompile;

            return (
              <div key={g.id} onClick={() => startEdit(g.id)} className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer active:scale-[0.99] group ${isCompleted ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50' : 'bg-white/[0.03] border-white/10 hover:border-white/20'}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500/15 border-emerald-500/25 text-[#62e6bd]' : 'bg-white/[0.04] border-white/10 text-slate-400'}`}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none">{title}</span>
                    <span className={`text-xs font-semibold block mt-1 truncate ${isCompleted ? 'text-emerald-300' : 'text-white'}`}>{nameLabel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${isCompleted ? 'text-[#62e6bd] bg-emerald-500/10 border-emerald-500/25' : 'text-slate-400 bg-white/[0.04] border-white/5'}`}>
                    {isCompleted ? t.completed : t.pending}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        <button type="button" onClick={submitAll} disabled={state.isSubmitting || guests.filter(g => !g.isCompleted).length > 0} className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition">
          {state.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{t.submitAll}</span>
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="w-full mt-2 py-2 rounded-xl bg-white/[0.02] text-slate-400 hover:text-white text-xs border border-white/5 cursor-pointer">{t.cancel}</button>
        )}
      </div>
    </div>
  );
};