import React, { useState, useEffect } from 'react';
import { GuestPass, SmartLockConfig } from '../../types';
import { 
  generateRandomPin, 
  encodePassToToken, 
  parseBedAndBreakfastBooking, 
  buildPassUrl, 
  formatInvitationMessage,
  getSavedHostPasses,
  saveHostPass,
  deleteHostPass,
  getSmartLockConfig,
  saveSmartLockConfig,
  triggerSmartLockAPI,
  getStayTiming,
  createAutonomousGuestPass
} from '../../services/guestPassService';
import { 
  KeyRound, 
  Sparkles, 
  ClipboardPaste, 
  Send, 
  MessageSquare, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Sliders, 
  X, 
  RefreshCw, 
  Calendar, 
  User, 
  Phone, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Radio, 
  HelpCircle,
  Clock,
  Car,
  Zap,
  Bot,
  Globe,
  Download,
  FolderArchive,
  Image as ImageIcon
} from 'lucide-react';
import { APARTMENT_INFO } from '../../data/apartmentData';
import { CmsMediaManager } from './CmsMediaManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassToView?: (pass: GuestPass) => void;
}

export const HostPortalModal: React.FC<Props> = ({ isOpen, onClose, onSelectPassToView }) => {
  // Host access is handled exclusively by the standalone authenticated portal.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Tabs: 'create' | 'list' | 'webhook' | 'smart_lock' | 'cms_media' | 'export_zip'
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'webhook' | 'smart_lock' | 'cms_media' | 'export_zip'>('create');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Form state
  const [rawBookingText, setRawBookingText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestSurname, setGuestSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('10:00');
  const [pinCode, setPinCode] = useState(generateRandomPin());
  const [bookingRef, setBookingRef] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [notes, setNotes] = useState('');

  // Generated pass state
  const [generatedPass, setGeneratedPass] = useState<GuestPass | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Stored passes
  const [storedPasses, setStoredPasses] = useState<GuestPass[]>([]);

  // Smart lock config
  const [lockConfig, setLockConfig] = useState<SmartLockConfig>(getSmartLockConfig());
  const [testLockStatus, setTestLockStatus] = useState<string | null>(null);
  const [isTestingLock, setIsTestingLock] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const localPasses = getSavedHostPasses();
      setStoredPasses(localPasses);
      setLockConfig(getSmartLockConfig());
      
      // Sync passes with server to ensure passes created via webhook/portal are always visible
      fetch('/api/passes')
        .then(res => res.json())
        .then(data => {
          const serverList: GuestPass[] = Array.isArray(data) ? data : (data.passes || []);
          if (serverList.length > 0) {
            const map = new Map<string, GuestPass>();
            // Add server passes first
            serverList.forEach(p => map.set(p.id, p));
            // Add local passes preserving unique ones
            localPasses.forEach(p => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            const merged = Array.from(map.values());
            setStoredPasses(merged);
            try {
              localStorage.setItem('AURORA_HOST_PASSES_V1', JSON.stringify(merged));
            } catch {}
          }
        })
        .catch(() => {});

      // Sync from Home Assistant API
      fetch('/api/hass/config')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.config) {
            setLockConfig(prev => ({
              ...prev,
              enabled: data.config.enabled ?? true,
              webhookUrl: data.config.webhookUrl || prev.webhookUrl || '',
              apiBearerToken: data.config.hasAccessToken ? '••••••••' : (prev.apiBearerToken || ''),
              deviceEntityId: data.config.entityId || 'automation.porta_aurora'
            }));
          }
        })
        .catch(() => {});

      // Set default dates: check-in today, check-out in 3 days if empty
      if (!checkInDate) {
        const today = new Date();
        const tomorrow3 = new Date(today);
        tomorrow3.setDate(today.getDate() + 3);
        setCheckInDate(today.toISOString().split('T')[0]);
        setCheckOutDate(tomorrow3.toISOString().split('T')[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;


  const handleSimulateAutonomousBooking = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const checkout = new Date(tomorrow);
    checkout.setDate(tomorrow.getDate() + 3);

    const autoResult = createAutonomousGuestPass({
      guestName: 'Sara',
      guestSurname: 'Moretti',
      phone: '+39 349 876 5432',
      checkInDate: tomorrow.toISOString().split('T')[0],
      checkOutDate: checkout.toISOString().split('T')[0],
      bookingRef: `BB-${Math.floor(10000 + Math.random() * 90000)}`,
      guestsCount: 2,
      bookingSource: 'bed-and-breakfast.it',
      notes: 'Ricevuto in totale autonomia via Webhook da Bed-and-Breakfast.it'
    });

    setStoredPasses(getSavedHostPasses());
    setGeneratedPass(autoResult.pass);
    setActiveTab('create');
  };


  // Auto-parse Bed-and-Breakfast.it booking text
  const handleParseBooking = () => {
    if (!rawBookingText.trim()) return;
    const parsed = parseBedAndBreakfastBooking(rawBookingText);
    if (parsed.guestName) setGuestName(parsed.guestName);
    if (parsed.guestSurname) setGuestSurname(parsed.guestSurname);
    if (parsed.phone) setPhone(parsed.phone);
    if (parsed.checkInDate) setCheckInDate(parsed.checkInDate);
    if (parsed.checkOutDate) setCheckOutDate(parsed.checkOutDate);
    if (parsed.guestsCount) setGuestsCount(parsed.guestsCount);
    if (parsed.bookingRef) setBookingRef(parsed.bookingRef);
  };

  // Generate new 4-digit PIN
  const handleRollPin = () => {
    setPinCode(generateRandomPin());
  };

  // Create & Save Guest Pass
  const handleCreatePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !checkInDate || !checkOutDate) {
      alert('Inserisci almeno Nome dell\'ospite, Data Check-in e Data Check-out.');
      return;
    }

    const newPassData: Omit<GuestPass, 'token'> = {
      id: `pass-${Date.now()}`,
      guestName: guestName.trim(),
      guestSurname: guestSurname.trim(),
      phone: phone.trim(),
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      pinCode,
      bookingRef: bookingRef.trim() || `BB-${Math.floor(10000 + Math.random() * 90000)}`,
      guestsCount,
      notes: notes.trim(),
      bookingSource: 'bed-and-breakfast.it',
      createdAt: new Date().toISOString(),
      active: true
    };

    const token = encodePassToToken(newPassData);
    const fullPass: GuestPass = { ...newPassData, token };

    saveHostPass(fullPass);
    setStoredPasses(getSavedHostPasses());
    setGeneratedPass(fullPass);

    // Save to server storage so it is visible across portals
    fetch('/api/generate-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: fullPass.id,
        guestName: fullPass.guestName,
        guestSurname: fullPass.guestSurname,
        phone: fullPass.phone,
        checkInDate: fullPass.checkInDate,
        checkInTime: fullPass.checkInTime,
        checkOutDate: fullPass.checkOutDate,
        checkOutTime: fullPass.checkOutTime,
        pinCode: fullPass.pinCode,
        bookingRef: fullPass.bookingRef,
        bookingSource: fullPass.bookingSource,
        guestsCount: fullPass.guestsCount,
        notes: fullPass.notes
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.pass) {
          // Re-fetch passes to ensure complete sync
          fetch('/api/passes')
            .then(r => r.json())
            .then(d => {
              const list: GuestPass[] = Array.isArray(d) ? d : (d.passes || []);
              if (list.length > 0) {
                setStoredPasses(list);
              }
            })
            .catch(() => {});
        }
      })
      .catch(err => console.warn('Server pass save notice:', err));

    // Automatically synchronize PIN to physical keypad via server API
    fetch('/api/keypad/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: fullPass.pinCode,
        guest: `${fullPass.guestName} ${fullPass.guestSurname}`.trim()
      })
    }).catch(err => console.warn('Keypad sync API notice:', err));

    // If Smart Lock webhook sync is active, also trigger direct webhook
    if (lockConfig.enabled && lockConfig.webhookUrl) {
      triggerSmartLockAPI(fullPass.pinCode, `${fullPass.guestName} ${fullPass.guestSurname}`, 'sync_pin');
    }
  };

  // Handle Delete Pass
  const handleDeletePass = (id: string) => {
    if (confirm('Eliminare questo VIP Pass per l\'ospite?')) {
      deleteHostPass(id);
      setStoredPasses(getSavedHostPasses());
      if (generatedPass?.id === id) {
        setGeneratedPass(null);
      }
      // Also delete from server memory
      fetch(`/api/passes/${id}`, { method: 'DELETE' }).catch(err => console.warn('Delete server pass notice:', err));
    }
  };

  // Download Standalone Host Portal .ZIP
  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      const res = await fetch('/api/download-host-portal-zip');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aurora-host-portal.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Fallback a link diretto');
      }
    } catch {
      window.open('/api/download-host-portal-zip', '_blank');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Copy Link
  const handleCopyLink = (pass: GuestPass) => {
    const url = buildPassUrl(pass.token);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copy Complete WhatsApp message
  const handleCopyMessage = (pass: GuestPass) => {
    const url = buildPassUrl(pass.token);
    const msg = formatInvitationMessage(pass, url);
    navigator.clipboard.writeText(msg);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // Open WhatsApp with pre-composed message
  const handleSendWhatsApp = (pass: GuestPass) => {
    const url = buildPassUrl(pass.token);
    const msg = formatInvitationMessage(pass, url);
    let targetPhone = (pass.phone || '').replace(/[^\d]/g, '');
    if (targetPhone.startsWith('00')) {
      targetPhone = targetPhone.slice(2);
    }
    if (targetPhone.length === 10 && !targetPhone.startsWith('39')) {
      targetPhone = `39${targetPhone}`;
    }

    const waUrl = targetPhone 
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
  };

  // Open SMS with pre-composed message
  const handleSendSMS = (pass: GuestPass) => {
    const url = buildPassUrl(pass.token);
    const msg = formatInvitationMessage(pass, url);
    const cleanPhone = (pass.phone || '').replace(/[^\d+]/g, '');
    window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
  };

  // Test Smart Lock connection
  const handleTestLock = async () => {
    setIsTestingLock(true);
    setTestLockStatus(null);
    try {
      saveSmartLockConfig(lockConfig);
      const res = await triggerSmartLockAPI('TEST', 'Test Host Nino', 'unlock');
      setTestLockStatus(res.message);
    } catch (err: any) {
      setTestLockStatus('Errore connessione: ' + err.message);
    } finally {
      setIsTestingLock(false);
    }
  };

  const handleSaveLockConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSmartLockConfig(lockConfig);
    try {
      await fetch('/api/hass/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: lockConfig.webhookUrl,
          ...(lockConfig.apiBearerToken && !lockConfig.apiBearerToken.includes('••••') && { accessToken: lockConfig.apiBearerToken }),
          entityId: lockConfig.deviceEntityId || 'automation.porta_aurora',
          enabled: lockConfig.enabled
        })
      });
    } catch {
      // ignore
    }
    alert('Configurazione Smart Lock salvata con successo!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto bg-[#18181b] rounded-2xl sm:rounded-3xl border border-white/10 text-white shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#1f1d1b] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm sm:text-lg text-white leading-tight truncate">
                Pannello Host • VIP Pass & Smart Lock
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-mono truncate">
                Appartamento Aurora in Valtellina
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Auth Barrier if not unlocked */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-8 text-center space-y-5 my-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white mx-auto">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-white">Portale host protetto</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                La gestione è disponibile esclusivamente nel portale host con autenticazione email e password.
              </p>
            </div>
            <a
              href="/host-portal/"
              className="inline-flex w-full max-w-xs justify-center rounded-2xl bg-white py-3 text-sm font-bold text-neutral-950 transition hover:bg-neutral-200"
            >
              Apri portale host
            </a>
          </div>
        ) : (
          <>
            {/* Nav Tabs - responsive horizontal scrollable */}
            <div className="flex border-b border-white/10 bg-black/40 px-2 sm:px-4 shrink-0 text-xs font-mono overflow-x-auto">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'create'
                    ? 'border-white text-white bg-white/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Nuovo Pass</span>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'list'
                    ? 'border-white text-white bg-white/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Gestione Pass ({storedPasses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('webhook')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'webhook'
                    ? 'border-white text-white bg-white/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300" />
                <span>Automazioni</span>
              </button>

              <button
                onClick={() => setActiveTab('smart_lock')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'smart_lock'
                    ? 'border-white text-white bg-white/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Smart Lock</span>
              </button>

              <button
                onClick={() => setActiveTab('cms_media')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'cms_media'
                    ? 'border-white text-white bg-white/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>Foto & CMS</span>
              </button>

              <button
                onClick={() => setActiveTab('export_zip')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'export_zip'
                    ? 'border-white text-white bg-white/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span>Esporta (.ZIP)</span>
              </button>
            </div>

            {/* Tab Contents (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-xs sm:text-sm">
              
              {/* TAB 1: CREATE PASS */}
              {activeTab === 'create' && (
                <div className="space-y-5 sm:space-y-6">
                  
                  {/* Bed-and-Breakfast.it Quick Parser Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                        <ClipboardPaste className="w-4 h-4 text-neutral-300" />
                        <span>Compilazione da Bed-and-Breakfast.it</span>
                      </div>
                      <span className="text-[10px] font-mono bg-white/10 text-neutral-200 px-2 py-0.5 rounded-full border border-white/10">
                        Smart Parser
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Incolla qui il testo dell'email o notifica di prenotazione ricevuta dal portale <strong>bed-and-breakfast.it</strong>:
                    </p>

                    <textarea
                      rows={3}
                      value={rawBookingText}
                      onChange={(e) => setRawBookingText(e.target.value)}
                      placeholder="Esempio: Prenotazione #67807 - Ospite: Marco Rossi - Tel: 340 1234567 - Check-in: 15/09/2026 - Check-out: 18/09/2026 - 2 adulti..."
                      className="w-full text-xs font-mono p-3 rounded-xl bg-black/40 border border-white/10 text-slate-200 focus:outline-none focus:border-white/40"
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleParseBooking}
                        className="py-2 px-4 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Estrai Dati e Compila</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual / Verified Form */}
                  <form onSubmit={handleCreatePass} className="space-y-4">
                    
                    {/* Guest Name & Surname */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">
                          Nome Ospite *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="Es. Marco"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-white/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">
                          Cognome Ospite
                        </label>
                        <input
                          type="text"
                          value={guestSurname}
                          onChange={(e) => setGuestSurname(e.target.value)}
                          placeholder="Es. Rossi"
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-white/40"
                        />
                      </div>
                    </div>

                    {/* Phone & Booking Ref */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">
                          Telefono Cellulare (per WhatsApp)
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Es. +39 340 123 4567"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-white/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">
                          Rif. Prenotazione (Bed-and-Breakfast.it)
                        </label>
                        <input
                          type="text"
                          value={bookingRef}
                          onChange={(e) => setBookingRef(e.target.value)}
                          placeholder="Es. BB-67807"
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-white/40"
                        />
                      </div>
                    </div>

                    {/* Dates: Check-in & Check-out */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">
                          Data Check-in *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            required
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-white/40"
                          />
                          <input
                            type="text"
                            value={checkInTime}
                            onChange={(e) => setCheckInTime(e.target.value)}
                            title="Orario check-in"
                            className="w-20 px-2 py-2 text-center rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">
                          Data Check-out *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            required
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-white/40"
                          />
                          <input
                            type="text"
                            value={checkOutTime}
                            onChange={(e) => setCheckOutTime(e.target.value)}
                            title="Orario check-out"
                            className="w-20 px-2 py-2 text-center rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Smart Lock PIN Code & Number of Guests */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-mono text-slate-400">
                            Codice Smart Lock / Tastierino *
                          </label>
                          <button
                            type="button"
                            onClick={handleRollPin}
                            className="text-[11px] text-neutral-400 hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Genera nuovo PIN</span>
                          </button>
                        </div>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                            placeholder="Es. 2741"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white font-mono font-bold text-lg tracking-widest focus:outline-none focus:border-white/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">
                          Numero Ospiti
                        </label>
                        <select
                          value={guestsCount}
                          onChange={(e) => setGuestsCount(Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-white/40"
                        >
                          <option value={1} className="bg-zinc-900">1 ospite</option>
                          <option value={2} className="bg-zinc-900">2 ospiti</option>
                          <option value={3} className="bg-zinc-900">3 ospiti</option>
                          <option value={4} className="bg-zinc-900">4 ospiti</option>
                          <option value={5} className="bg-zinc-900">5 ospiti</option>
                        </select>
                      </div>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Genera Carta d'Imbarco VIP & Link Univoco</span>
                    </button>
                  </form>

                  {/* Generated Pass Result Box */}
                  {generatedPass && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#141824] border border-white/15 shadow-xl space-y-4 animate-fade-in">
                      
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span className="font-bold text-sm sm:text-base text-white truncate">
                            VIP Pass Generato per {generatedPass.guestName} {generatedPass.guestSurname}!
                          </span>
                        </div>
                        <span className="font-mono text-xs text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/15 shrink-0">
                          PIN: {generatedPass.pinCode}
                        </span>
                      </div>

                      {/* Generated URL field */}
                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white truncate flex items-center justify-between gap-2">
                        <span className="truncate">{buildPassUrl(generatedPass.token)}</span>
                        <button
                          onClick={() => handleCopyLink(generatedPass)}
                          title="Copia link"
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0 flex items-center gap-1 cursor-pointer transition"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink ? 'Copiato' : 'Copia'}</span>
                        </button>
                      </div>

                      {/* Action Buttons: WhatsApp, SMS, Copy Message */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        {/* Send on WhatsApp */}
                        <button
                          onClick={() => handleSendWhatsApp(generatedPass)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Invia su WhatsApp</span>
                        </button>

                        {/* Send via SMS */}
                        <button
                          onClick={() => handleSendSMS(generatedPass)}
                          className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                        >
                          <Send className="w-4 h-4" />
                          <span>Invia via SMS</span>
                        </button>

                        {/* Copy Full Message */}
                        <button
                          onClick={() => handleCopyMessage(generatedPass)}
                          className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-white/10"
                        >
                          {copiedMessage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedMessage ? 'Copiato!' : 'Copia Messaggio'}</span>
                        </button>
                      </div>

                      {/* Preview & Management Buttons */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setActiveTab('list')}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Vai alla Gestione Pass ({storedPasses.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectPassToView) {
                              onSelectPassToView(generatedPass);
                              onClose();
                            } else {
                              window.location.href = buildPassUrl(generatedPass.token);
                            }
                          }}
                          className="text-xs text-neutral-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <span>Apri anteprima come ospite</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: STORED PASSES LIST */}
              {activeTab === 'list' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Lista dei VIP Pass generati</span>
                    <span>Totale: {storedPasses.length}</span>
                  </div>

                  {storedPasses.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-mono text-xs">
                      Nessun pass presente. Generane uno dalla scheda "Nuovo Pass".
                    </div>
                  ) : (
                    storedPasses.map((pass) => {
                      const timing = getStayTiming(pass);
                      return (
                        <div
                          key={pass.id}
                          className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-white/20 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm sm:text-base text-white">
                                  {pass.guestName} {pass.guestSurname}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    timing.isActive
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : timing.isUpcoming
                                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                  }`}
                                >
                                  {timing.isActive ? 'ATTIVO' : timing.isUpcoming ? 'IN ARRIVO' : 'SCADUTO'}
                                </span>
                              </div>
                              <span className="text-[11px] sm:text-xs text-slate-400 font-mono block mt-0.5">
                                {pass.checkInDate} ➔ {pass.checkOutDate} • Rif: {pass.bookingRef || 'N/A'}
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                                Smart Lock
                              </span>
                              <span className="font-mono font-bold text-sm sm:text-base text-white">
                                {pass.pinCode}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleSendWhatsApp(pass)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition flex items-center gap-1 cursor-pointer text-xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>

                              <button
                                onClick={() => handleCopyLink(pass)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 cursor-pointer text-xs"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copia Link</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (onSelectPassToView) {
                                    onSelectPassToView(pass);
                                    onClose();
                                  } else {
                                    window.location.href = buildPassUrl(pass.token);
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/10 transition flex items-center gap-1 cursor-pointer text-xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Visualizza</span>
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeletePass(pass.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Elimina pass"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB: WEBHOOK & AUTONOMOUS ENGINE */}
              {activeTab === 'webhook' && (
                <div className="space-y-5 sm:space-y-6">
                  {/* Hero Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">
                          Generatore Autonomo di Link Univoci
                        </h4>
                        <p className="text-xs text-slate-400">
                          Nessun intervento manuale: riceve le prenotazioni e genera i link da sola
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      L'applicazione include un motore webhook integrato (<code>/api/webhook/booking</code>) in grado di ricevere notifiche da <strong>Bed-and-Breakfast.it</strong>, Zapier, Make.com o email di prenotazione. Assegna istantaneamente un codice PIN univoco (es. 2741), calcola le date e genera il link temporizzato.
                    </p>

                    {/* Simulator Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSimulateAutonomousBooking}
                        className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Simula Arrivo Nuova Prenotazione (Test Autonomo 1-Tap)</span>
                      </button>
                      <span className="text-[10px] text-slate-400 block text-center mt-1.5 font-mono">
                        Crea una prenotazione fittizia in 0.5s e mostra il link e il messaggio WhatsApp generati
                      </span>
                    </div>
                  </div>

                  {/* Webhook Endpoint Specs */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Globe className="w-4 h-4 text-sky-400" />
                        <span>Il tuo Webhook URL Personale</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        ATTIVO 24H
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-2 font-mono text-xs">
                      <span className="text-white truncate">
                        {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/booking` : 'https://aurora-valtellina.app/api/webhook/booking'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const url = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/booking` : 'https://aurora-valtellina.app/api/webhook/booking';
                          navigator.clipboard.writeText(url);
                          alert('Webhook URL copiato!');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] shrink-0 cursor-pointer"
                      >
                        Copia URL
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                        Esempio Payload JSON inviabile dal Channel Manager o Zapier:
                      </span>
                      <pre className="p-3 rounded-xl bg-black/60 border border-white/5 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`{
  "guestName": "Marco",
  "guestSurname": "Rossi",
  "phone": "+39 340 123 4567",
  "checkInDate": "2026-09-10",
  "checkOutDate": "2026-09-13",
  "bookingRef": "BB-48921"
}`}
                      </pre>
                    </div>
                  </div>

                  {/* Direct Link Generation via Query Params */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Bot className="w-4 h-4 text-emerald-400" />
                      <span>Generazione Istantanea tramite Link Rapido</span>
                    </div>
                    <p className="leading-relaxed">
                      Puoi anche generare un pass al volo semplicemente aprendo il link con i parametri dell'ospite:
                    </p>
                    <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 font-mono text-[11px] text-neutral-300 overflow-x-auto">
                      /?auto=1&name=Mario&surname=Rossi&in=2026-09-10&out=2026-09-13&phone=3401234567
                    </div>
                  </div>

                  {/* 3-Step Setup Guide */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs text-slate-300">
                    <span className="font-bold text-white text-sm block">
                      Come funziona l'automazione con Bed-and-Breakfast.it:
                    </span>
                    <ol className="space-y-2 list-decimal list-inside text-slate-300 leading-relaxed">
                      <li>
                        <strong>Nuova Prenotazione:</strong> Bed-and-Breakfast.it ti invia la consueta email con nome, date e telefono dell'ospite.
                      </li>
                      <li>
                        <strong>Inoltro Automatico:</strong> Con una semplice regola Gmail o Zapier/Make gratuita, l'email viene inoltrata al webhook dell'app.
                      </li>
                      <li>
                        <strong>Invio del Link Univoco:</strong> L'app genera il PIN, crea il link personalizzato e prepara il messaggio WhatsApp o SMS già pronto per essere spedito in un click!
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 3: SMART LOCK (HOME ASSISTANT / EWELINK) */}
              {activeTab === 'smart_lock' && (
                <form onSubmit={handleSaveLockConfig} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white text-sm">
                        <Sliders className="w-4 h-4 text-neutral-300" />
                        <span>Integrazione Domotica Smart Lock</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lockConfig.enabled}
                          onChange={(e) => setLockConfig({ ...lockConfig, enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    <p className="text-xs text-slate-400">
                      Collega la serratura smart dell'appartamento tramite <strong>Home Assistant Webhook</strong> o <strong>eWeLink Webhook</strong>. Quando l'ospite preme "Sblocca Porta" o riceve il PIN, il sistema invia la richiesta HTTP POST all'URL configurato.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Webhook URL (Home Assistant / eWeLink API)
                      </label>
                      <input
                        type="url"
                        value={lockConfig.webhookUrl}
                        onChange={(e) => setLockConfig({ ...lockConfig, webhookUrl: e.target.value })}
                        placeholder="Es. https://homeassistant.tuodominio.it/api/webhook/aurora_smart_lock"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/40"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">
                          API Bearer Token (Opzionale)
                        </label>
                        <input
                          type="password"
                          value={lockConfig.apiBearerToken || ''}
                          onChange={(e) => setLockConfig({ ...lockConfig, apiBearerToken: e.target.value })}
                          placeholder="Token autorizzazione se richiesto"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">
                          Entity ID Serratura (Opzionale)
                        </label>
                        <input
                          type="text"
                          value={lockConfig.deviceEntityId || ''}
                          onChange={(e) => setLockConfig({ ...lockConfig, deviceEntityId: e.target.value })}
                          placeholder="lock.aurora_portone"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test Status */}
                  {testLockStatus && (
                    <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-neutral-200">
                      {testLockStatus}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleTestLock}
                      disabled={isTestingLock}
                      className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Radio className="w-3.5 h-3.5 text-neutral-300" />
                      <span>{isTestingLock ? 'Test in corso...' : 'Invia Test Webhook'}</span>
                    </button>

                    <button
                      type="submit"
                      className="py-2.5 px-5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold transition cursor-pointer shadow-md"
                    >
                      Salva Configurazione
                    </button>
                  </div>

                  {/* Payload documentation snippet */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
                    <span className="text-white block font-bold">Formato Payload POST inviato:</span>
                    <code>
                      {`{ "action": "unlock"|"sync_pin", "pin": "2741", "guest": "Marco Rossi", "device": "lock.aurora_portone" }`}
                    </code>
                  </div>

                </form>
              )}

              {/* TAB 4: CMS FOTO & FILE UPLOAD DEFINITIVO */}
              {activeTab === 'cms_media' && (
                <CmsMediaManager />
              )}

              {/* TAB 5: EXPORT STANDALONE HOST SITE (.ZIP) */}
              {activeTab === 'export_zip' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#181d2a] to-[#181d2a] border border-emerald-500/30 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <FolderArchive className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Sito Host Indipendente & Standalone</h3>
                        <p className="text-xs text-slate-400">
                          Controlla il sito, genera link univoci e aziona l'apriporta Home Assistant da un portale dedicato scaricabile in formato .ZIP
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Questo archivio contiene l'applicazione web completa per l'Host, pronta per essere eseguita in locale su qualsiasi PC facendo doppio clic su <code className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded">index.html</code> oppure pubblicata su qualsiasi dominio/hosting indipendente. Si collega direttamente ad Aurora Valtellina tramite le REST API.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        onClick={handleDownloadZip}
                        disabled={isDownloadingZip}
                        className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isDownloadingZip ? 'Preparazione pacchetto...' : 'Scarica Sito Host (.ZIP)'}</span>
                      </button>

                      <a
                        href="/host-portal/index.html"
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition flex items-center justify-center gap-2 border border-white/10"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                        <span>Apri Portale Esterno nel Browser</span>
                      </a>
                    </div>
                  </div>

                  {/* Architecture & API Connection spec */}
                  <div className="p-4.5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-neutral-300" />
                      Integrazione e Chiamate API Standalone:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">GET /api/passes</span>
                        <span>Recupera in tempo reale tutti i pass ospiti attivi con countdown e stato.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">POST /api/webhook/booking</span>
                        <span>Riceve prenotazioni bed-and-breakfast.it, assegna un PIN a 4 cifre e imposta la durata del soggiorno.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-white font-bold bg-white/10 px-1.5 py-0.5 rounded shrink-0">POST /api/hass/unlock</span>
                        <span>Invia l'impulso ON al relè Sonoff su Home Assistant per l'apertura del portone.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded shrink-0">DELETE /api/passes/:id</span>
                        <span>Revoca ed elimina immediatamente il pass ospite e la chiave elettronica.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Instructions on how to run locally */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 space-y-1.5">
                    <strong className="text-slate-200 block">Istruzioni d'Uso:</strong>
                    <p>1. Estrai l'archivio ZIP su qualsiasi cartella del computer o su una chiavetta USB.</p>
                    <p>2. Fai doppio clic su <span className="text-white font-mono">index.html</span> per visualizzare la dashboard dark Apple-style.</p>
                    <p>3. In alto a destra clicca sulle impostazioni se desideri modificare l'indirizzo del server remoto.</p>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
