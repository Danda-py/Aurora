import React, { useState, useRef } from 'react';
import { useCms } from '../../context/CmsContext';
import { 
  Upload, 
  Image as ImageIcon, 
  RotateCcw, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  Sliders,
  BookOpen,
  Settings
} from 'lucide-react';

interface MediaItemMeta {
  key: string;
  title: string;
  desc: string;
  aspect: string;
  badge: string;
  section: 'carousel' | 'covers' | 'other';
}

const MEDIA_ITEMS: MediaItemMeta[] = [
  {
    key: 'heroLiving',
    title: 'Soggiorno & Living Aurora',
    desc: 'Copertina principale di benvenuto, mostrata anche nel carosello.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Carosello',
    section: 'carousel'
  },
  {
    key: 'bedroom',
    title: 'Camera da Letto Matrimoniale',
    desc: 'Foto dei dettagli della camera matrimoniale, inclusa nel carosello.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Carosello',
    section: 'carousel'
  },
  {
    key: 'kitchen',
    title: 'Cucina Attrezzata Moderna',
    desc: 'Foto della cucina ad induzione, inclusa nel carosello.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Carosello',
    section: 'carousel'
  },
  {
    key: 'bathroom',
    title: 'Bagno & Doccia Cromoterapia',
    desc: 'Foto del bagno e della doccia a LED, inclusa nel carosello.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Carosello',
    section: 'carousel'
  },
  {
    key: 'balcony',
    title: 'Terrazzo & Balcone Esterno',
    desc: 'Foto dello spazio all\'aperto e del terrazzo fiorito, inclusa nel carosello.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Carosello',
    section: 'carousel'
  },
  {
    key: 'view',
    title: 'Vista Panorama & Montagne',
    desc: 'Immagine panoramica sul monte Disgrazia, inclusa nel carosello e nelle card.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Carosello',
    section: 'carousel'
  },
  {
    key: 'locationCover',
    title: 'Copertina Come Arrivare & Mappa',
    desc: 'Foto per la scheda di orientamento, GPS e arrivo a Morbegno.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'checkInCover',
    title: 'Copertina Check-in & Smart Lock',
    desc: 'Foto per la procedura di accesso e chiave smart.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'servicesCover',
    title: 'Copertina Servizi Casa & Comfort',
    desc: 'Foto per dotazioni, riscaldamento ed elettrodomestici.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'rulesCover',
    title: 'Copertina Regole della Casa',
    desc: 'Foto per orari di quiete e norme di rispetto.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'restaurantsCover',
    title: 'Copertina Crotti & Ristoranti',
    desc: 'Immagine per la scheda enogastronomia tipica e pizzoccheri.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'barsCover',
    title: 'Copertina Bar & Colazioni',
    desc: 'Immagine per caffetterie, aperitivi e colazioni a Morbegno.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'shoppingCover',
    title: 'Copertina Botteghe del Bitto & Spesa',
    desc: 'Immagine per formaggi tipici, botteghe storiche e alimentari.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'activitiesCover',
    title: 'Copertina Escursioni & Sentieri',
    desc: 'Immagine della scheda escursioni, Val di Mello e trekking alpino.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'transportCover',
    title: 'Copertina Mezzi di Trasporto & Bici',
    desc: 'Immagine per treni FS, orari bus e taxi.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'infoCover',
    title: 'Copertina Informazioni Utili',
    desc: 'Immagine per farmacie, banche e raccolta differenziata.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'emergencyCover',
    title: 'Copertina Emergenze & Soccorso',
    desc: 'Immagine per numero unico 112 e guardia medica.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'checkOutCover',
    title: 'Copertina Check-out & Riconsegna',
    desc: 'Immagine per checklist di partenza e recensioni.',
    aspect: 'Orizzontale (16:9)',
    badge: 'Guida',
    section: 'covers'
  },
  {
    key: 'hostAvatar',
    title: 'Foto Profilo Host Nino',
    desc: 'Mostrata nella scheda Contatti, nell\'intestazione e nell\'accoglienza.',
    aspect: 'Quadrata (1:1)',
    badge: 'Profilo',
    section: 'other'
  },
  {
    key: 'wifiQr',
    title: 'Codice QR Rete Wi-Fi',
    desc: 'Immagine del QR scan per connettere automaticamente gli ospiti al Wi-Fi.',
    aspect: 'Quadrata (1:1)',
    badge: 'Wi-Fi',
    section: 'other'
  }
];

export const CmsMediaManager: React.FC = () => {
  const { media, uploadPhoto, resetPhoto, saveMediaUrl } = useCms();
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ key?: string; message: string; type: 'success' | 'error' } | null>(null);
  const [urlInputKey, setUrlInputKey] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [activeMediaSection, setActiveMediaSection] = useState<'all' | 'carousel' | 'covers' | 'other'>('carousel');
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [extraUrl, setExtraUrl] = useState('');
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const showNotification = (message: string, type: 'success' | 'error', key?: string) => {
    setFeedback({ message, type, key });
    setTimeout(() => {
      setFeedback(prev => (prev?.message === message ? null : prev));
    }, 6000);
  };

  const handleAddExtraFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Seleziona un file immagine valido (JPEG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showNotification('Il file supera la dimensione massima di 25MB.', 'error');
      return;
    }

    const key = `carousel_img_${Date.now()}`;
    setUploadingKey(key);
    try {
      const result = await uploadPhoto(key, file);
      if (result.success) {
        showNotification('Nuova foto caricata e aggiunta al carosello con successo!', 'success');
      } else {
        showNotification(result.error || 'Errore durante il caricamento', 'error');
      }
    } catch (err: any) {
      showNotification(`Errore: ${err.message}`, 'error');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleAddExtraUrl = async () => {
    if (!extraUrl.trim()) return;
    const key = `carousel_img_${Date.now()}`;
    try {
      const result = await saveMediaUrl(key, extraUrl.trim());
      if (result.success) {
        showNotification('Nuovo URL immagine aggiunto al carosello!', 'success');
        setExtraUrl('');
        setIsAddingExtra(false);
      } else {
        showNotification(result.error || 'Errore salvataggio URL', 'error');
      }
    } catch (err: any) {
      showNotification(`Errore: ${err.message}`, 'error');
    }
  };

  const handleDeleteExtra = async (key: string) => {
    if (!confirm('Eliminare definitivamente questa foto aggiuntiva dal carosello?')) return;
    try {
      const success = await resetPhoto(key);
      if (success) {
        showNotification('Foto aggiuntiva rimossa con successo.', 'success');
      }
    } catch (err: any) {
      showNotification(`Errore durante la rimozione: ${err.message}`, 'error');
    }
  };

  const handleFileSelected = async (key: string, file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Seleziona un file immagine valido (JPEG, PNG, WebP)', 'error', key);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showNotification('Il file supera la dimensione massima di 25MB.', 'error', key);
      return;
    }

    setUploadingKey(key);
    try {
      const result = await uploadPhoto(key, file);
      if (result.success) {
        showNotification(`Foto "${key}" caricata con successo e salvata in modo definitivo!`, 'success', key);
      } else {
        showNotification(result.error || 'Errore durante il caricamento', 'error', key);
      }
    } catch (err: any) {
      showNotification(`Errore: ${err.message}`, 'error', key);
    } finally {
      setUploadingKey(null);
    }
  };

  const handleReset = async (key: string) => {
    if (!confirm(`Ripristinare la foto originale di fabbrica per "${key}"?`)) return;
    try {
      const success = await resetPhoto(key);
      if (success) {
        showNotification(`Foto "${key}" ripristinata all'immagine originale.`, 'success', key);
      }
    } catch (err: any) {
      showNotification(`Errore ripristino: ${err.message}`, 'error', key);
    }
  };

  const handleSaveCustomUrl = async (key: string) => {
    if (!customUrl.trim()) return;
    try {
      const result = await saveMediaUrl(key, customUrl.trim());
      if (result.success) {
        showNotification(`URL immagine salvato per "${key}"!`, 'success', key);
        setUrlInputKey(null);
        setCustomUrl('');
      } else {
        showNotification(result.error || 'Errore salvataggio URL', 'error', key);
      }
    } catch (err: any) {
      showNotification(`Errore: ${err.message}`, 'error', key);
    }
  };

  const filteredItems = MEDIA_ITEMS.filter((item) => {
    if (activeMediaSection === 'all') return true;
    return item.section === activeMediaSection;
  });

  const carouselCount = MEDIA_ITEMS.filter(item => item.section === 'carousel').length;
  const coversCount = MEDIA_ITEMS.filter(item => item.section === 'covers').length;
  const otherCount = MEDIA_ITEMS.filter(item => item.section === 'other').length;

  return (
    <div className="space-y-6 animate-fade-in text-neutral-100">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#11141c] border border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            CMS Foto & File Multimediali (Salvataggio Permanente)
          </h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Carica file fotografici direttamente dal tuo dispositivo in maniera definitiva.
          I file vengono archiviati permanentemente nella cartella <code className="text-cyan-300 font-mono">/uploads/</code> del server e sono subito visibili a tutti gli ospiti.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap p-1 bg-[#11141c] border border-white/5 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setActiveMediaSection('carousel')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
            activeMediaSection === 'carousel'
              ? 'bg-cyan-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Spazi & Carosello ({carouselCount})</span>
          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-neutral-950 text-[8px] px-1.5 py-0.5 rounded-md font-mono font-extrabold animate-pulse">
            ATTIVO
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMediaSection('covers')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMediaSection === 'covers'
              ? 'bg-cyan-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Copertine Guide ({coversCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMediaSection('other')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMediaSection === 'other'
              ? 'bg-cyan-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Profilo & QR ({otherCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMediaSection('all')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMediaSection === 'all'
              ? 'bg-cyan-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Mostra Tutte ({MEDIA_ITEMS.length})</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)} 
            className="text-white/60 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid of Media Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredItems.map((item) => {
          const currentUrl = (media as any)[item.key] || '';
          const isCustomUploaded = currentUrl.startsWith('/uploads/');
          const isUploading = uploadingKey === item.key;

          return (
            <div 
              key={item.key}
              className="p-4 rounded-2xl bg-[#090b10] border border-white/10 flex flex-col justify-between space-y-3 relative group transition hover:border-white/20"
            >
              <div className="space-y-2">
                {/* Card Title & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">{item.title}</h4>
                    <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">{item.desc}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase shrink-0 ${
                    isCustomUploaded 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                      : 'bg-white/10 text-neutral-400'
                  }`}>
                    {isCustomUploaded ? 'Caricato' : 'Default'}
                  </span>
                </div>

                {/* Preview Image / Click-to-upload container */}
                <div 
                  onClick={() => fileInputRefs.current[item.key]?.click()}
                  className="relative w-full h-40 rounded-xl overflow-hidden bg-black/60 border border-dashed border-white/20 flex items-center justify-center cursor-pointer transition hover:border-cyan-400 group/drop"
                  title="Clicca per caricare un file immagine"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center p-4 text-cyan-300 space-y-2">
                      <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
                      <span className="text-xs font-semibold">Salvataggio sul server in corso...</span>
                    </div>
                  ) : (
                    <>
                      <img 
                        src={currentUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition duration-300 group-hover/drop:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/65 opacity-0 group-hover/drop:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                        <Upload className="w-6 h-6 text-cyan-300 mb-1" />
                        <span className="text-[11px] font-bold text-white">Carica Nuova Foto</span>
                        <span className="text-[9px] text-neutral-400 mt-0.5">{item.aspect}</span>
                      </div>
                    </>
                  )}

                  {/* Hidden Native File Input */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={(el) => (fileInputRefs.current[item.key] = el)}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) handleFileSelected(item.key, file);
                    }}
                  />
                </div>

                {/* Path or URL */}
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 truncate">
                  <span className="truncate" title={currentUrl}>
                    {currentUrl || 'Nessun file configurato'}
                  </span>
                  {currentUrl && (
                    <a 
                      href={currentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-2 text-cyan-400 hover:text-cyan-300 shrink-0"
                      title="Apri immagine a dimensione intera"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Optional Custom URL Input toggle */}
                {urlInputKey === item.key && (
                  <div className="space-y-1.5 p-2 rounded-xl bg-black/50 border border-cyan-500/30 text-xs">
                    <label className="text-[10px] text-neutral-400 block font-semibold">Incolla URL Immagine:</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 p-1.5 rounded-lg bg-black border border-white/20 text-white text-[11px] font-mono outline-none focus:border-cyan-400"
                      />
                      <button 
                        type="button"
                        onClick={() => handleSaveCustomUrl(item.key)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500 text-neutral-950 font-bold text-[10px] hover:bg-cyan-400 cursor-pointer"
                      >
                        Salva
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button 
                    type="button"
                    onClick={() => fileInputRefs.current[item.key]?.click()}
                    disabled={isUploading}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Caricamento...' : 'Carica File'}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      if (urlInputKey === item.key) {
                        setUrlInputKey(null);
                      } else {
                        setUrlInputKey(item.key);
                        setCustomUrl(currentUrl);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-[11px] transition cursor-pointer"
                    title="Inserisci URL manuale"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={() => handleReset(item.key)}
                  disabled={isUploading || !isCustomUploaded}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 text-[11px] font-medium transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                  title="Ripristina immagine di default"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Ripristina</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Dynamic extra carousel photos (only shown in carousel or all tabs) */}
        {(activeMediaSection === 'carousel' || activeMediaSection === 'all') && (
          <>
            {extraCarouselKeys.map((key) => {
              const currentUrl = (media as any)[key] || '';
              const isUploading = uploadingKey === key;
              return (
                <div 
                  key={key}
                  className="p-4 rounded-2xl bg-[#090b10] border border-cyan-500/20 flex flex-col justify-between space-y-3 relative group transition hover:border-cyan-500/30"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">Foto Carosello Extra</h4>
                        <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">Immagine aggiuntiva visualizzata nel carosello.</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase shrink-0 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Carosello +
                      </span>
                    </div>

                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-black/60 border border-dashed border-white/20 flex items-center justify-center">
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center p-4 text-cyan-300 space-y-2">
                          <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
                          <span className="text-xs font-semibold">Caricamento...</span>
                        </div>
                      ) : (
                        <img 
                          src={currentUrl} 
                          alt="Extra Carousel Photo" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                          }}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 truncate">
                      <span className="truncate" title={currentUrl}>
                        {currentUrl}
                      </span>
                      <a 
                        href={currentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 shrink-0 ml-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-2">
                    <button 
                      type="button"
                      onClick={() => handleDeleteExtra(key)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3 text-rose-400" />
                      <span>Elimina</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Custom Upload/Add Photo Card */}
            <div className="p-4 rounded-2xl bg-cyan-950/5 border border-dashed border-cyan-500/30 flex flex-col items-center justify-center text-center space-y-3 min-h-[260px]">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Aggiungi Foto al Carosello</h4>
                <p className="text-[10px] text-neutral-400 max-w-[200px] mx-auto mt-1">
                  Aggiungi un'altra foto da mostrare nel carosello scorrevole della home (da 2 a 100+ foto!).
                </p>
              </div>

              {isAddingExtra ? (
                <div className="w-full space-y-2 p-2 bg-black/30 rounded-xl border border-white/5">
                  <input
                    type="text"
                    value={extraUrl}
                    onChange={(e) => setExtraUrl(e.target.value)}
                    placeholder="Incolla link immagine..."
                    className="w-full p-2 rounded-lg bg-black border border-white/20 text-white text-[11px] font-mono outline-none focus:border-cyan-400"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAddingExtra(false)}
                      className="px-2 py-1 text-[10px] text-neutral-400 hover:text-white"
                    >
                      Annulla
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExtraUrl}
                      className="px-2.5 py-1 text-[10px] bg-cyan-500 text-neutral-950 font-bold rounded-md"
                    >
                      Aggiungi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => extraFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carica File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingExtra(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-[11px] transition cursor-pointer flex items-center gap-1"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Aggiungi URL</span>
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                ref={extraFileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAddExtraFile(file);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
