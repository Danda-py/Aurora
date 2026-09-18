import React, { useState, useEffect, useMemo } from 'react';
import { GuestPass, SmartLockConfig } from '../../types';
import { 
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
  createAutonomousGuestPass,
  sortGuestPasses
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
  Image as ImageIcon,
  Battery,
  WifiOff,
  ShieldCheck,
  Building2,
  Cpu
} from 'lucide-react';
import { APARTMENT_INFO } from '../../data/apartmentData';
import { CmsMediaManager } from './CmsMediaManager';
import { AlloggiatiManager } from './AlloggiatiManager';
import { PropertySettingsManager } from './PropertySettingsManager';
import { ChannelManagerTab } from './ChannelManagerTab';
import { HostCmsTab } from './HostCmsTab';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassToView?: (pass: GuestPass) => void;
  inlineMode?: boolean;
}

export const HostPortalModal: React.FC<Props> = ({ isOpen, onClose, onSelectPassToView, inlineMode = false }) => {
  // Host access is handled exclusively by the standalone authenticated portal.
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Tabs: 'create' | 'list' | 'channels' | 'property_settings' | 'webhook' | 'smart_lock' | 'cms_builder' | 'cms_media' | 'export_zip' | 'alloggiati'
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'channels' | 'property_settings' | 'webhook' | 'smart_lock' | 'cms_builder' | 'cms_media' | 'export_zip' | 'alloggiati'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'cms' || tab === 'cms_builder' || tab === 'visual' || tab === 'visual_cms' || window.location.hash === '#cms') {
        return 'cms_builder';
      }
      if (tab === 'list' || tab === 'channels' || tab === 'property_settings' || tab === 'smart_lock' || tab === 'alloggiati') {
        return tab as any;
      }
    }
    return 'create';
  });
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Form state
  const [rawBookingText, setRawBookingText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestSurname, setGuestSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('10:00');
  const [bookingRef, setBookingRef] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [notes, setNotes] = useState('');

  // Generated pass state
  const [generatedPass, setGeneratedPass] = useState<GuestPass | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Stored passes
  const [storedPasses, setStoredPasses] = useState<GuestPass[]>([]);

  // Pass ordinati: ATTIVI (in corso) sempre in cima, poi futuri in ordine cronologico di check-in, poi passati
  const sortedPasses = useMemo(() => sortGuestPasses(storedPasses), [storedPasses]);

  // Smart lock config
  const [lockConfig, setLockConfig] = useState<SmartLockConfig>(getSmartLockConfig());
  const [homePublicIp, setHomePublicIp] = useState('');
  const [testLockStatus, setTestLockStatus] = useState<string | null>(null);
  const [isTestingLock, setIsTestingLock] = useState(false);

  // Real-time Lock physical status state
  const [lockState, setLockState] = useState<{
    state: 'closed' | 'open' | 'offline';
    lastUpdatedAt: string;
    battery?: number;
    signalStrength?: number;
  } | null>(null);

  // Poll physical lock status from server every 3 seconds
  useEffect(() => {
    let intervalId: any;
    if (isOpen) {
      const fetchStatus = async () => {
        try {
          const res = await fetch('/api/lock/status');
          const data = await res.json();
          if (data.success && data.lockStatus) {
            setLockState(data.lockStatus);
          }
        } catch (err) {
          console.warn('Error fetching lock status:', err);
        }
      };
      fetchStatus();
      intervalId = setInterval(fetchStatus, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen]);

  // Handle local simulation of lock state changes
  const handleSimulateLockState = async (simState: 'closed' | 'open' | 'offline') => {
    try {
      const res = await fetch('/api/webhook/lock-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: simState,
          battery: simState === 'offline' ? undefined : Math.floor(75 + Math.random() * 20),
          signal: simState === 'offline' ? undefined : -Math.floor(55 + Math.random() * 20)
        })
      });
      const data = await res.json();
      if (data.success && data.lockStatus) {
        setLockState(data.lockStatus);
      }
    } catch (err) {
      console.warn('Error simulating lock status:', err);
    }
  };

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
            setHomePublicIp(data.config.homePublicIp || '');
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
      pinCode: '',
      bookingRef: bookingRef.trim() || `BB-${Math.floor(10000 + Math.random() * 90000)}`,
      guestsCount,
      notes: notes.trim(),
      bookingSource: 'bed-and-breakfast.it',
      createdAt: new Date().toISOString(),
      active: true,
      checkInConfirmed: false
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
      credentials: 'include',
      body: JSON.stringify({
        id: fullPass.id,
        guestName: fullPass.guestName,
        guestSurname: fullPass.guestSurname,
        phone: fullPass.phone,
        checkInDate: fullPass.checkInDate,
        checkInTime: fullPass.checkInTime,
        checkOutDate: fullPass.checkOutDate,
        checkOutTime: fullPass.checkOutTime,
        bookingRef: fullPass.bookingRef,
        bookingSource: fullPass.bookingSource,
        guestsCount: fullPass.guestsCount,
        notes: fullPass.notes,
        token: fullPass.token
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.pass) {
          saveHostPass(data.pass);
          setGeneratedPass(data.pass);
          // Re-fetch passes to ensure complete sync
          fetch('/api/passes', { credentials: 'include' })
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

  // Handle Toggle Check-in Confirmation
  const handleToggleCheckInConfirmation = async (pass: GuestPass) => {
    try {
      const newStatus = !pass.checkInConfirmed;
      // Optimistic update locally
      const updatedPasses = storedPasses.map(p => 
        p.id === pass.id ? { ...p, checkInConfirmed: newStatus } : p
      );
      setStoredPasses(updatedPasses);
      localStorage.setItem('AURORA_HOST_PASSES_V1', JSON.stringify(updatedPasses));

      // Call API
      const res = await fetch(`/api/passes/${pass.id}/confirm-checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: newStatus })
      });
      if (!res.ok) {
        throw new Error('Errore durante la conferma del check-in.');
      }
      const data = await res.json();
      if (data.success && data.pass) {
        // Sync with actual server response
        setStoredPasses(prev => prev.map(p => p.id === pass.id ? data.pass : p));
      }
    } catch (error: any) {
      alert(error.message || 'Errore di rete.');
      setStoredPasses(getSavedHostPasses());
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
      const res = await fetch('/api/hass/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: lockConfig.webhookUrl,
          ...(lockConfig.apiBearerToken && !lockConfig.apiBearerToken.includes('••••') && { accessToken: lockConfig.apiBearerToken }),
          entityId: lockConfig.deviceEntityId || 'automation.porta_aurora',
          homePublicIp: homePublicIp.trim(),
          enabled: lockConfig.enabled
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${res.status}`);
      }
      alert('Configurazione Smart Lock salvata con successo!');
    } catch (err: any) {
      alert(`Errore durante il salvataggio: ${err.message || 'Errore di connessione'}`);
    }
  };

  const handleDetectHomePublicIp = async () => {
    setTestLockStatus(null);
    try {
      const response = await fetch('/api/wifi/set-home-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Impossibile rilevare l\'IP');
      setHomePublicIp(data.homePublicIp || '');
      setTestLockStatus('IP pubblico di Casa_Aurora registrato.');
    } catch (error: any) {
      setTestLockStatus(error.message || 'Impossibile registrare l\'IP pubblico.');
    }
  };

  const modalContent = (
      <div className={`relative w-full ${inlineMode || activeTab === 'cms_builder' ? 'max-w-7xl' : 'max-w-3xl'} mx-auto bg-white rounded-2xl sm:rounded-3xl border border-gray-100 text-gray-800 shadow-sm overflow-hidden flex flex-col ${inlineMode ? 'min-h-[85vh]' : 'my-auto max-h-[94vh] sm:max-h-[92vh] shadow-2xl'}`}>
        
        {/* Top Header */}
        {!inlineMode && (
          <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-700 shadow-sm shrink-0">
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm sm:text-lg text-gray-900 leading-tight truncate">
                  Pannello Host • VIP Pass & Smart Lock
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-500 font-mono truncate">
                  Appartamento Aurora in Valtellina
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-100 shadow-sm flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Auth Barrier if not unlocked */}
        {!isAuthenticated && !inlineMode ? (
          <div className="p-6 sm:p-8 text-center space-y-5 my-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 mx-auto">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">Portale host protetto</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                La gestione è disponibile esclusivamente nel portale host con autenticazione email e password.
              </p>
            </div>
            <a
              href="/host-portal/"
              className="inline-flex w-full max-w-xs justify-center rounded-xl bg-black py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-800 shadow-sm"
            >
              Apri portale host
            </a>
          </div>
        ) : (
          <>
            {/* Nav Tabs - responsive horizontal scrollable */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-2 sm:px-4 shrink-0 text-xs font-mono overflow-x-auto">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'create'
                    ? 'border-white text-gray-900 bg-gray-100'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Nuovo Pass</span>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'list'
                    ? 'border-white text-gray-900 bg-gray-100'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Gestione Pass ({storedPasses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('channels')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'channels'
                    ? 'border-white text-gray-900 bg-gray-100'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Channel Manager (iCal)</span>
              </button>

              <button
                onClick={() => setActiveTab('property_settings')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'property_settings'
                    ? 'border-white text-gray-900 bg-gray-100'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                <span>Struttura & Geofence</span>
              </button>

              <button
                onClick={() => setActiveTab('webhook')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'webhook'
                    ? 'border-white text-gray-900 bg-gray-100'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                <span>Automazioni</span>
              </button>

              <button
                onClick={() => setActiveTab('smart_lock')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'smart_lock'
                    ? 'border-white text-gray-900 bg-gray-100'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Smart Lock</span>
              </button>

              <button
                onClick={() => setActiveTab('cms_builder')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'cms_builder'
                    ? 'border-amber-400 text-amber-500 bg-amber-500/10'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                <span>Personalizza PWA (Visual Builder)</span>
              </button>

              <button
                onClick={() => setActiveTab('cms_media')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'cms_media'
                    ? 'border-white text-gray-900 bg-gray-100'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>Foto & Media</span>
              </button>

              <button
                onClick={() => setActiveTab('alloggiati')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'alloggiati'
                    ? 'border-white text-gray-900 bg-gray-100'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Alloggiati Web</span>
              </button>

              <button
                onClick={() => setActiveTab('export_zip')}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 border-b-2 font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-[11px] sm:text-xs ${
                  activeTab === 'export_zip'
                    ? 'border-white text-gray-900 bg-gray-100'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Esporta (.ZIP)</span>
              </button>
            </div>

            {/* Tab Contents (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-xs sm:text-sm">
              
              {/* TAB 1: CREATE PASS */}
              {activeTab === 'create' && (
                <div className="space-y-5 sm:space-y-6">
                  
                  {/* Bed-and-Breakfast.it Quick Parser Box */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-gray-900 text-xs sm:text-sm">
                        <ClipboardPaste className="w-4 h-4 text-gray-600" />
                        <span>Compilazione da Bed-and-Breakfast.it</span>
                      </div>
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                        Smart Parser
                      </span>
                    </div>

                    <p className="text-xs text-gray-600">
                      Incolla qui il testo dell'email o notifica di prenotazione ricevuta dal portale <strong>bed-and-breakfast.it</strong>:
                    </p>

                    <textarea
                      rows={3}
                      value={rawBookingText}
                      onChange={(e) => setRawBookingText(e.target.value)}
                      placeholder="Esempio: Prenotazione #67807 - Ospite: Marco Rossi - Tel: 340 1234567 - Check-in: 15/09/2026 - Check-out: 18/09/2026 - 2 adulti..."
                      className="w-full text-xs font-mono p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300"
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleParseBooking}
                        className="py-2 px-4 rounded-xl bg-white hover:bg-gray-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
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
                        <label className="block text-xs font-mono text-gray-500 mb-1">
                          Nome Ospite *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="Es. Marco"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1">
                          Cognome Ospite
                        </label>
                        <input
                          type="text"
                          value={guestSurname}
                          onChange={(e) => setGuestSurname(e.target.value)}
                          placeholder="Es. Rossi"
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300"
                        />
                      </div>
                    </div>

                    {/* Phone & Booking Ref */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1">
                          Telefono Cellulare (per WhatsApp)
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Es. +39 340 123 4567"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1">
                          Rif. Prenotazione (Bed-and-Breakfast.it)
                        </label>
                        <input
                          type="text"
                          value={bookingRef}
                          onChange={(e) => setBookingRef(e.target.value)}
                          placeholder="Es. BB-67807"
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300"
                        />
                      </div>
                    </div>

                    {/* Dates: Check-in & Check-out */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1">
                          Data Check-in *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            required
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300"
                          />
                          <input
                            type="text"
                            value={checkInTime}
                            onChange={(e) => setCheckInTime(e.target.value)}
                            title="Orario check-in"
                            className="w-20 px-2 py-2 text-center rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1">
                          Data Check-out *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            required
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300"
                          />
                          <input
                            type="text"
                            value={checkOutTime}
                            onChange={(e) => setCheckOutTime(e.target.value)}
                            title="Orario check-out"
                            className="w-20 px-2 py-2 text-center rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guest count */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1">
                          Numero Ospiti
                        </label>
                        <select
                          value={guestsCount}
                          onChange={(e) => setGuestsCount(Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300"
                        >
                          <option value={1} className="bg-white">1 ospite</option>
                          <option value={2} className="bg-white">2 ospiti</option>
                          <option value={3} className="bg-white">3 ospiti</option>
                          <option value={4} className="bg-white">4 ospiti</option>
                          <option value={5} className="bg-white">5 ospiti</option>
                        </select>
                      </div>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Genera Carta d'Imbarco VIP & Link Univoco</span>
                    </button>
                  </form>

                  {/* Generated Pass Result Box */}
                  {generatedPass && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xl space-y-4 animate-fade-in">
                      
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span className="font-bold text-sm sm:text-base text-gray-900 truncate">
                            VIP Pass Generato per {generatedPass.guestName} {generatedPass.guestSurname}!
                          </span>
                        </div>
                      </div>

                      {/* Generated URL field */}
                      <div className="p-3 rounded-xl bg-gray-100 border border-gray-200 text-xs font-mono text-gray-900 truncate flex items-center justify-between gap-2">
                        <span className="truncate">{buildPassUrl(generatedPass.token)}</span>
                        <button
                          onClick={() => handleCopyLink(generatedPass)}
                          title="Copia link"
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 shrink-0 flex items-center gap-1 cursor-pointer transition"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink ? 'Copiato' : 'Copia'}</span>
                        </button>
                      </div>

                      {/* Action Buttons: Copia Link & Anteprima */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <button
                          onClick={() => handleCopyLink(generatedPass)}
                          className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                        >
                          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedLink ? 'Link Copiato negli Appunti!' : 'Copia Link Univoco'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onSelectPassToView) {
                              onSelectPassToView(generatedPass);
                              onClose();
                            } else {
                              window.open(buildPassUrl(generatedPass.token), '_blank');
                            }
                          }}
                          className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-gray-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Apri Schermata Ospite</span>
                        </button>
                      </div>

                      {/* Preview & Management Buttons */}
                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setActiveTab('list')}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
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
                          className="text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 cursor-pointer"
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
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Lista dei VIP Pass generati</span>
                    <span>Totale: {storedPasses.length}</span>
                  </div>

                  {sortedPasses.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 font-mono text-xs">
                      Nessun pass presente. Generane uno dalla scheda "Nuovo Pass".
                    </div>
                  ) : (
                    sortedPasses.map((pass) => {
                      const timing = getStayTiming(pass);
                      const isCancelled = pass.active === false;
                      return (
                        <div
                          key={pass.id}
                          className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 hover:border-white/20 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm sm:text-base text-gray-900">
                                  {pass.guestName} {pass.guestSurname}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    isCancelled
                                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                      : timing.isActive
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      : timing.isUpcoming
                                      ? 'bg-sky-100 text-sky-700 border border-sky-200'
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}
                                >
                                  {isCancelled ? 'CANCELLATO' : timing.isActive ? 'ATTIVO' : timing.isUpcoming ? 'IN ARRIVO' : 'SCADUTO'}
                                </span>
                              </div>
                              <span className="text-[11px] sm:text-xs text-gray-500 font-mono block mt-0.5">
                                {pass.checkInDate} ➔ {pass.checkOutDate} • Rif: {pass.bookingRef || 'N/A'}
                              </span>
                            </div>

                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleToggleCheckInConfirmation(pass)}
                                className={`px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1 cursor-pointer text-xs ${
                                  pass.checkInConfirmed
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200'
                                }`}
                              >
                                {pass.checkInConfirmed ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Check-in Confermato</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Conferma Check-in</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleCopyLink(pass)}
                                className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 transition flex items-center gap-1 cursor-pointer text-xs"
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
                                className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200 transition flex items-center gap-1 cursor-pointer text-xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Visualizza</span>
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeletePass(pass.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-50 transition cursor-pointer"
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

              {/* TAB: CHANNEL MANAGER (iCal) */}
              {activeTab === 'channels' && (
                <ChannelManagerTab 
                  onSyncComplete={async () => {
                    try {
                      const res = await fetch('/api/passes');
                      const data = await res.json();
                      const serverList = Array.isArray(data) ? data : (data.passes || []);
                      if (serverList.length > 0) {
                        setStoredPasses(serverList);
                        localStorage.setItem('AURORA_HOST_PASSES_V1', JSON.stringify(serverList));
                      }
                    } catch (err) {
                      console.warn('Error refreshing passes from channel sync:', err);
                    }
                  }} 
                />
              )}

              {/* TAB: IMPOSTAZIONI STRUTTURA & GEOFENCING */}
              {activeTab === 'property_settings' && (
                <PropertySettingsManager />
              )}

              {/* TAB: WEBHOOK & AUTONOMOUS ENGINE */}
              {activeTab === 'webhook' && (
                <div className="space-y-5 sm:space-y-6">
                  {/* Hero Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                          Generatore Autonomo di Link Univoci
                        </h4>
                        <p className="text-xs text-gray-500">
                          Nessun intervento manuale: riceve le prenotazioni e genera i link da sola
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      L'applicazione include un motore webhook integrato (<code>/api/webhook/booking</code>) in grado di ricevere notifiche da <strong>Bed-and-Breakfast.it</strong>, Zapier, Make.com o email di prenotazione. Calcola le date e genera un link temporaneo.
                    </p>

                    {/* Simulator Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSimulateAutonomousBooking}
                        className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Simula Arrivo Nuova Prenotazione (Test Autonomo 1-Tap)</span>
                      </button>
                      <span className="text-[10px] text-gray-500 block text-center mt-1.5 font-mono">
                        Crea una prenotazione fittizia in 0.5s e mostra il link e il messaggio WhatsApp generati
                      </span>
                    </div>
                  </div>

                  {/* Webhook Endpoint Specs */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                        <Globe className="w-4 h-4 text-sky-400" />
                        <span>Il tuo Webhook URL Personale</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        ATTIVO 24H
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-between gap-2 font-mono text-xs">
                      <span className="text-gray-900 truncate">
                        {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/booking` : 'https://aurora-valtellina.app/api/webhook/booking'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const url = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/booking` : 'https://aurora-valtellina.app/api/webhook/booking';
                          navigator.clipboard.writeText(url);
                          alert('Webhook URL copiato!');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-[11px] shrink-0 cursor-pointer"
                      >
                        Copia URL
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <span className="font-bold text-gray-700 block text-[11px] uppercase tracking-wider">
                        Esempio Payload JSON inviabile dal Channel Manager o Zapier:
                      </span>
                      <pre className="p-3 rounded-xl bg-gray-100 border border-white/5 text-[11px] font-mono text-gray-600 overflow-x-auto">
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
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                      <Bot className="w-4 h-4 text-emerald-600" />
                      <span>Generazione Istantanea tramite Link Rapido</span>
                    </div>
                    <p className="leading-relaxed">
                      Puoi anche generare un pass al volo semplicemente aprendo il link con i parametri dell'ospite:
                    </p>
                    <div className="p-2.5 rounded-xl bg-gray-100 border border-white/5 font-mono text-[11px] text-gray-600 overflow-x-auto">
                      /?auto=1&name=Mario&surname=Rossi&in=2026-09-10&out=2026-09-13&phone=3401234567
                    </div>
                  </div>

                  {/* 3-Step Setup Guide */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs text-gray-600">
                    <span className="font-bold text-gray-900 text-sm block">
                      Come funziona l'automazione con Bed-and-Breakfast.it:
                    </span>
                    <ol className="space-y-2 list-decimal list-inside text-gray-600 leading-relaxed">
                      <li>
                        <strong>Nuova Prenotazione:</strong> Bed-and-Breakfast.it ti invia la consueta email con nome, date e telefono dell'ospite.
                      </li>
                      <li>
                        <strong>Inoltro Automatico:</strong> Con una semplice regola Gmail o Zapier/Make gratuita, l'email viene inoltrata al webhook dell'app.
                      </li>
                      <li>
                        <strong>Invio del Link Univoco:</strong> L'app crea il link personalizzato e prepara il messaggio WhatsApp o SMS già pronto per essere spedito in un click!
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 3: SMART LOCK (HOME ASSISTANT / EWELINK) */}
              {activeTab === 'smart_lock' && (
                <div className="space-y-5">
                  
                  {/* Real-time Status Card */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5 w-full md:w-auto">
                      {/* State Icon Indicator with Pulsing Ring */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative shrink-0 shadow-sm border ${
                        lockState?.state === 'closed'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : lockState?.state === 'open'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                      }`}>
                        {lockState?.state === 'closed' ? (
                          <Lock className="w-5.5 h-5.5 animate-pulse" />
                        ) : lockState?.state === 'open' ? (
                          <Unlock className="w-5.5 h-5.5" />
                        ) : (
                          <WifiOff className="w-5.5 h-5.5" />
                        )}
                        <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          lockState?.state === 'closed'
                            ? 'bg-emerald-500'
                            : lockState?.state === 'open'
                            ? 'bg-amber-500'
                            : 'bg-zinc-400'
                        }`} />
                      </div>

                      {/* State Text & Labels */}
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block font-mono">
                          Stato Serratura Fisica
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                          {lockState?.state === 'closed' && 'Chiusa'}
                          {lockState?.state === 'open' && 'Aperta / Socchiusa'}
                          {lockState?.state === 'offline' && 'Offline (Wi-Fi non raggiungibile)'}
                          {!lockState && 'Caricamento stato...'}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>
                            {lockState?.state === 'closed' && 'Tutti gli accessi sono protetti.'}
                            {lockState?.state === 'open' && 'Attenzione: porta socchiusa.'}
                            {lockState?.state === 'offline' && 'Modulo Wi-Fi non raggiungibile.'}
                          </span>
                          {lockState?.lastUpdatedAt && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                              Aggiornato: {new Date(lockState.lastUpdatedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Sensor Metrics (Battery / Signal) */}
                    {lockState && lockState.state !== 'offline' && (
                      <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 shrink-0">
                        <div className="flex flex-col items-end text-right">
                          <span className="text-[10px] font-mono text-gray-400">Batteria</span>
                          <span className="font-bold text-xs text-gray-700 flex items-center gap-1">
                            <Battery className="w-3.5 h-3.5 text-emerald-500" />
                            {lockState.battery ?? 100}%
                          </span>
                        </div>
                        <div className="h-6 w-px bg-gray-200" />
                        <div className="flex flex-col items-end text-right">
                          <span className="text-[10px] font-mono text-gray-400">Segnale</span>
                          <span className="font-bold text-xs text-gray-700 font-mono">
                            {lockState.signalStrength ?? -50} dBm
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Simulator Panel */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-gray-700 text-[10px] uppercase tracking-wider font-mono">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Simulatore Real-Time</span>
                      </div>
                      <span className="text-[9px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-mono font-bold">
                        Pannello Test
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Cambia lo stato fisico della serratura per testare l'interfaccia host e l'allineamento in tempo reale:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSimulateLockState('closed')}
                        className={`py-2 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 ${
                          lockState?.state === 'closed'
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Chiusa</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleSimulateLockState('open')}
                        className={`py-2 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 ${
                          lockState?.state === 'open'
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Aperta / Socch.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSimulateLockState('offline')}
                        className={`py-2 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 ${
                          lockState?.state === 'offline'
                            ? 'bg-zinc-600 border-zinc-600 text-white shadow-xs'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <WifiOff className="w-3.5 h-3.5" />
                        <span>Offline</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveLockConfig} className="space-y-5 border-t border-gray-150 pt-5">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                        <Sliders className="w-4 h-4 text-gray-600" />
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
                    <p className="text-xs text-gray-500">
                      Collega la serratura smart dell'appartamento tramite <strong>Home Assistant Webhook</strong> o <strong>eWeLink Webhook</strong>. Quando l'ospite preme "Sblocca Porta", il sistema invia la richiesta HTTP POST all'URL configurato.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-600 mb-1.5 font-bold">
                        Seleziona Hardware Smart Lock / Provider
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'home_assistant', label: 'Home Assistant', desc: 'Webhook & REST' },
                          { id: 'shelly', label: 'Shelly Cloud / Relè', desc: 'Gen1 / Gen2 / Pro' },
                          { id: 'nuki', label: 'Nuki Smart Lock', desc: 'Nuki Web API' },
                          { id: 'generic_webhook', label: 'Webhook / eWeLink', desc: 'Custom HTTP' }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setLockConfig({ ...lockConfig, provider: p.id as any })}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                              (lockConfig.provider || 'home_assistant') === p.id
                                ? 'border-amber-500 bg-amber-50/60 text-amber-950 font-bold'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className="text-xs">{p.label}</div>
                            <div className="text-[10px] text-gray-500 font-normal">{p.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shelly specific inputs */}
                    {lockConfig.provider === 'shelly' && (
                      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                        <span className="text-xs font-bold text-blue-900 block">Parametri Shelly Cloud API</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono text-gray-600 mb-1">Shelly Device ID</label>
                            <input
                              type="text"
                              value={lockConfig.shellyDeviceId || ''}
                              onChange={(e) => setLockConfig({ ...lockConfig, shellyDeviceId: e.target.value })}
                              placeholder="Es. 34987a12bc4f"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-gray-600 mb-1">Auth Key (Cloud Token)</label>
                            <input
                              type="password"
                              value={lockConfig.shellyAuthKey || ''}
                              onChange={(e) => setLockConfig({ ...lockConfig, shellyAuthKey: e.target.value })}
                              placeholder="Shelly Auth Key"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-gray-600 mb-1">Shelly Server URL</label>
                            <input
                              type="text"
                              value={lockConfig.shellyServer || 'https://shelly-41-eu.shelly.cloud'}
                              onChange={(e) => setLockConfig({ ...lockConfig, shellyServer: e.target.value })}
                              placeholder="https://shelly-41-eu.shelly.cloud"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-gray-600 mb-1">Indice Canale Relè</label>
                            <input
                              type="number"
                              value={lockConfig.shellyRelayIndex ?? 0}
                              onChange={(e) => setLockConfig({ ...lockConfig, shellyRelayIndex: parseInt(e.target.value, 10) || 0 })}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nuki specific inputs */}
                    {lockConfig.provider === 'nuki' && (
                      <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                        <span className="text-xs font-bold text-amber-900 block">Parametri Nuki Web API</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono text-gray-600 mb-1">Smartlock ID Nuki</label>
                            <input
                              type="text"
                              value={lockConfig.nukiSmartlockId || ''}
                              onChange={(e) => setLockConfig({ ...lockConfig, nukiSmartlockId: e.target.value })}
                              placeholder="Es. 18274619"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-gray-600 mb-1">API Token Nuki Web</label>
                            <input
                              type="password"
                              value={lockConfig.nukiApiToken || ''}
                              onChange={(e) => setLockConfig({ ...lockConfig, nukiApiToken: e.target.value })}
                              placeholder="Token generato su web.nuki.io"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Home Assistant / Generic Webhook fields */}
                    {(lockConfig.provider === 'home_assistant' || lockConfig.provider === 'generic_webhook' || !lockConfig.provider) && (
                      <>
                        <div>
                          <label className="block text-xs font-mono text-gray-600 mb-1">
                            Webhook URL (Home Assistant / eWeLink API)
                          </label>
                          <input
                            type="url"
                            value={lockConfig.webhookUrl}
                            onChange={(e) => setLockConfig({ ...lockConfig, webhookUrl: e.target.value })}
                            placeholder="Es. https://homeassistant.tuodominio.it/api/webhook/aurora_smart_lock"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-mono text-gray-600 mb-1">
                              API Bearer Token (Opzionale)
                            </label>
                            <input
                              type="password"
                              value={lockConfig.apiBearerToken || ''}
                              onChange={(e) => setLockConfig({ ...lockConfig, apiBearerToken: e.target.value })}
                              placeholder="Token autorizzazione se richiesto"
                              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-gray-600 mb-1">
                              Entity ID Serratura (Opzionale)
                            </label>
                            <input
                              type="text"
                              value={lockConfig.deviceEntityId || ''}
                              onChange={(e) => setLockConfig({ ...lockConfig, deviceEntityId: e.target.value })}
                              placeholder="lock.aurora_portone"
                              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-mono text-gray-600 mb-1">
                        IP pubblico rete Casa_Aurora
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={homePublicIp}
                          onChange={(e) => setHomePublicIp(e.target.value)}
                          placeholder="Rilevalo mentre sei connesso a Casa_Aurora"
                          className="min-w-0 flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleDetectHomePublicIp}
                          className="shrink-0 py-2 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-700 text-xs font-bold transition"
                        >
                          Rileva IP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Test Status */}
                  {testLockStatus && (
                    <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs font-mono text-gray-700">
                      {testLockStatus}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleTestLock}
                      disabled={isTestingLock}
                      className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Radio className="w-3.5 h-3.5 text-gray-600" />
                      <span>{isTestingLock ? 'Test in corso...' : 'Invia Test Webhook'}</span>
                    </button>

                    <button
                      type="submit"
                      className="py-2.5 px-5 rounded-xl bg-white hover:bg-gray-800 text-white text-xs font-bold transition cursor-pointer shadow-md"
                    >
                      Salva Configurazione
                    </button>
                  </div>

                  {/* Payload documentation snippet */}
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-white/5 text-[11px] font-mono text-gray-500 space-y-1">
                    <span className="text-gray-900 block font-bold">Formato Payload POST inviato:</span>
                    <code>
                      {`{ "action": "unlock", "guest": "Marco Rossi", "device": "lock.aurora_portone" }`}
                    </code>
                  </div>

                </form>
                </div>
              )}

              {/* TAB: VISUAL CMS BUILDER WYSIWYG */}
              {activeTab === 'cms_builder' && (
                <div className="p-0 -m-4 sm:-m-6">
                  <HostCmsTab />
                </div>
              )}

              {/* TAB 4: CMS FOTO & FILE UPLOAD DEFINITIVO */}
              {activeTab === 'cms_media' && (
                <CmsMediaManager />
              )}

              {/* TAB: ALLOGGIATI WEB GENERATION */}
              {activeTab === 'alloggiati' && (
                <AlloggiatiManager 
                  storedPasses={sortedPasses} 
                  onUpdatePassList={async () => {
                    try {
                      const res = await fetch('/api/passes');
                      const data = await res.json();
                      const serverList = Array.isArray(data) ? data : (data.passes || []);
                      if (serverList.length > 0) {
                        setStoredPasses(serverList);
                        localStorage.setItem('AURORA_HOST_PASSES_V1', JSON.stringify(serverList));
                      }
                    } catch (err) {
                      console.warn('Error syncing passes:', err);
                    }
                  }} 
                />
              )}

              {/* TAB 5: EXPORT STANDALONE HOST SITE (.ZIP) */}
              {activeTab === 'export_zip' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#181d2a] to-[#181d2a] border border-emerald-200 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                        <FolderArchive className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Sito Host Indipendente & Standalone</h3>
                        <p className="text-xs text-gray-500">
                          Controlla il sito, genera link univoci e aziona l'apriporta Home Assistant da un portale dedicato scaricabile in formato .ZIP
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      Questo archivio contiene l'applicazione web completa per l'Host, pronta per essere eseguita in locale su qualsiasi PC facendo doppio clic su <code className="text-gray-900 font-mono bg-gray-50 px-1.5 py-0.5 rounded">index.html</code> oppure pubblicata su qualsiasi dominio/hosting indipendente. Si collega direttamente ad Aurora Valtellina tramite le REST API.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        onClick={handleDownloadZip}
                        disabled={isDownloadingZip}
                        className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-gray-900 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isDownloadingZip ? 'Preparazione pacchetto...' : 'Scarica Sito Host (.ZIP)'}</span>
                      </button>

                      <a
                        href="/host-portal/index.html"
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold transition flex items-center justify-center gap-2 border border-gray-200"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-900" />
                        <span>Apri Portale Esterno nel Browser</span>
                      </a>
                    </div>
                  </div>

                  {/* Architecture & API Connection spec */}
                  <div className="p-4.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-gray-600" />
                      Integrazione e Chiamate API Standalone:
                    </span>
                    <ul className="space-y-2 text-xs text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">GET /api/passes</span>
                        <span>Recupera in tempo reale tutti i pass ospiti attivi con countdown e stato.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">POST /api/webhook/booking</span>
                        <span>Riceve prenotazioni bed-and-breakfast.it, crea un link temporaneo e imposta la durata del soggiorno.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-gray-900 font-bold bg-gray-100 px-1.5 py-0.5 rounded shrink-0">POST /api/hass/unlock</span>
                        <span>Invia l'impulso ON al relè Sonoff su Home Assistant per l'apertura del portone.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-rose-400 font-bold bg-rose-50 px-1.5 py-0.5 rounded shrink-0">DELETE /api/passes/:id</span>
                        <span>Revoca ed elimina immediatamente il pass ospite e la chiave elettronica.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Instructions on how to run locally */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-500 space-y-1.5">
                    <strong className="text-gray-700 block">Istruzioni d'Uso:</strong>
                    <p>1. Estrai l'archivio ZIP su qualsiasi cartella del computer o su una chiavetta USB.</p>
                    <p>2. Fai doppio clic su <span className="text-gray-900 font-mono">index.html</span> per visualizzare la dashboard dark Apple-style.</p>
                    <p>3. In alto a destra clicca sulle impostazioni se desideri modificare l'indirizzo del server remoto.</p>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </div>
  );
  
  if (inlineMode) return modalContent;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {modalContent}
    </div>
  );
};
