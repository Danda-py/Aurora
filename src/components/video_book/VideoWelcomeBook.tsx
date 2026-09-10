import React, { useState, useEffect } from 'react';
import { Language, WelcomePage, GuestPass } from '../../types';
import { useCms } from '../../context/CmsContext';
import { getStayTiming, validateGuestPassToken } from '../../services/guestPassService';
import { LanguageSelectScreen } from './LanguageSelectScreen';
import { ConciergeHome } from './ConciergeHome';
import { BenvenutoPage } from './pages/BenvenutoPage';
import { CheckinPage } from './pages/CheckinPage';
import { WifiPage } from './pages/WifiPage';
import { RegolePage } from './pages/RegolePage';
import { PosizionePage } from './pages/PosizionePage';
import { TrasportiPage } from './pages/TrasportiPage';
import { ServiziPage } from './pages/ServiziPage';
import { AttivitaPage } from './pages/AttivitaPage';
import { RistorantiPage } from './pages/RistorantiPage';
import { BarClubPage } from './pages/BarClubPage';
import { ShoppingPage } from './pages/ShoppingPage';
import { InformazioniPage } from './pages/InformazioniPage';
import { EmergenzaPage } from './pages/EmergenzaPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContattiPage } from './pages/ContattiPage';
import { SmartLockModal } from '../vip/SmartLockModal';
import { ExpiredPassScreen } from '../vip/ExpiredPassScreen';
import { MessageSquare, Home, Sparkles, Key, ChevronLeft } from 'lucide-react';
import { APARTMENT_INFO } from '../../data/apartmentData';

interface Props {
  initialLanguage?: Language;
}

export const VideoWelcomeBook: React.FC<Props> = ({ initialLanguage }) => {
  const [currentPage, setCurrentPage] = useState<WelcomePage>('language_select');
  const { language, setLanguage } = useCms();
  
  // Set initial language if provided and different
  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);
  
  // Guest Pass State
  const [pass, setPass] = useState<GuestPass | null>(null);
  const [isPassChecking, setIsPassChecking] = useState(true);
  const [isSmartLockOpen, setIsSmartLockOpen] = useState(false);
  const [bypassExpired, setBypassExpired] = useState(false);

  // Only server-issued, time-limited guest links can open the guide.
  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('pass')
      : null;
    validateGuestPassToken(token || '').then(currentPass => {
      if (currentPass) {
        setPass(currentPass);
        setCurrentPage('grid_menu');
      }
      setIsPassChecking(false);
    });
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setCurrentPage('grid_menu');
  };

  const handleBackToMenu = () => {
    setCurrentPage('grid_menu');
  };

  // Expiration check: If pass is expired and user hasn't chosen to view public guide
  const isPassExpired = pass ? getStayTiming(pass).isExpired : false;
  if (pass && isPassExpired && !bypassExpired) {
    return (
      <ExpiredPassScreen
        pass={pass}
        onEnterAsPublicGuest={() => setBypassExpired(true)}
      />
    );
  }

  if (isPassChecking || !pass) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070a0e] px-6 text-center text-slate-100">
        <div className="max-w-sm space-y-3">
          <Key className="mx-auto h-10 w-10 text-emerald-400" />
          <h1 className="text-xl font-semibold">Accesso ospite richiesto</h1>
          <p className="text-sm text-slate-400">Apri il link personale ricevuto dall'host. Il link è limitato al periodo del soggiorno.</p>
        </div>
      </div>
    );
  }

  const isSubpage = currentPage !== 'language_select' && currentPage !== 'grid_menu';

  return (
    <div className="w-full max-w-lg mx-auto min-h-screen relative flex flex-col justify-between overflow-hidden shadow-2xl font-sans bg-[#070a0e] text-slate-100 selection:bg-emerald-500/25 selection:text-emerald-200">
      
      {/* Top App Bar Header (Only when inside subpages) */}
      {isSubpage && (
        <header className="sticky top-0 z-30 bg-[#090d13]/90 backdrop-blur-xl border-b border-emerald-500/15 px-3.5 sm:px-4 py-2 flex items-center justify-between text-slate-100">
          <button
            onClick={handleBackToMenu}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-semibold py-1 px-2 -ml-2 rounded-xl active:bg-white/10 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Guida</span>
          </button>

          <div className="text-center">
            <span className="font-semibold text-xs text-white block">
              Appartamento Aurora
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              Morbegno • Valtellina
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage('language_select')}
              className="px-2 py-1 rounded-full bg-[#0e151e] hover:bg-[#131d27] text-slate-300 font-semibold text-[10px] uppercase border border-emerald-500/20 transition cursor-pointer"
              title="Lingua"
            >
              {language.toUpperCase()}
            </button>
          </div>
        </header>
      )}

      {/* Main Dynamic View Content */}
      <main className="flex-1 w-full p-0">
        {currentPage === 'language_select' && (
          <LanguageSelectScreen onSelectLanguage={handleLanguageSelect} />
        )}

        {currentPage === 'grid_menu' && (
          <ConciergeHome
            language={language}
            onSelectLanguage={setLanguage}
            onNavigate={(page) => setCurrentPage(page)}
            pass={pass!}
            onOpenSmartLock={() => setIsSmartLockOpen(true)}
          />
        )}

        {currentPage === 'benvenuto' && (
          <BenvenutoPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
            pass={pass}
          />
        )}

        {currentPage === 'check_in' && (
          <CheckinPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
            pass={pass}
            onOpenSmartLock={() => setIsSmartLockOpen(true)}
          />
        )}

        {currentPage === 'wifi' && (
          <WifiPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'regole' && (
          <RegolePage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'posizione' && (
          <PosizionePage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'trasporti' && (
          <TrasportiPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'servizi' && (
          <ServiziPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'attivita' && (
          <AttivitaPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'ristoranti' && (
          <RistorantiPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'bar_club' && (
          <BarClubPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'shopping' && (
          <ShoppingPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'informazioni' && (
          <InformazioniPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'emergenza' && (
          <EmergenzaPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'check_out' && (
          <CheckoutPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}

        {currentPage === 'contatti' && (
          <ContattiPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={setLanguage}
          />
        )}
      </main>

      {/* Floating Quick Action Button to Host / WhatsApp (when inside subpages) */}
      {currentPage !== 'language_select' && currentPage !== 'contatti' && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col gap-2">
          <a
            href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(
              pass 
                ? `Ciao Nino! Sono ${pass.guestName} ${pass.guestSurname}, ospite di Aurora in Valtellina.` 
                : 'Ciao Nino!'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ring-2 ring-white/60"
            title="Chatta con l'Host Nino su WhatsApp"
          >
            <MessageSquare className="w-5 h-5 fill-white" />
          </a>
        </div>
      )}

      {/* Smart Lock Modal */}
      <SmartLockModal
        isOpen={isSmartLockOpen}
        onClose={() => setIsSmartLockOpen(false)}
        pass={pass}
      />

      {/* Subtle footer */}
      {currentPage !== 'language_select' && currentPage !== 'grid_menu' && (
        <footer className="p-3 text-center border-t border-emerald-500/15 bg-[#070a0e] flex items-center justify-center text-[10px] text-slate-400 px-4">
          <span>© Aurora in Valtellina • Via Serta 188D, Morbegno (SO)</span>
        </footer>
      )}

    </div>
  );
};
