import React, { useState, useEffect, useRef } from 'react';
import { Language, WelcomePage, GuestPass } from '../../types';
import { useCms } from '../../context/CmsContext';
import { getStayTiming, validateGuestPassToken, getActiveGuestPass } from '../../services/guestPassService';
import { trackActivity, attachGlobalClickTracking } from '../../services/activityTrackingService';
import { LanguageSelectScreen } from './LanguageSelectScreen';
import { ConciergeHome } from './ConciergeHome';
import { AuroraAiChat } from './AuroraAiChat';
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
import { Key } from 'lucide-react';
import { APARTMENT_INFO } from '../../data/apartmentData';

interface Props {
  initialLanguage?: Language;
}

export const VideoWelcomeBook: React.FC<Props> = ({ initialLanguage }: Props) => {
  const [currentPage, setCurrentPage] = useState<WelcomePage>('grid_menu');
  const { language, setLanguage } = useCms();
  
  // Set initial language if provided and different
  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);
  
  // Guest Pass State
  const [pass, setPass] = useState<GuestPass | null>(null);
  const [isPassChecking, setIsPassChecking] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(new URLSearchParams(window.location.search).get('pass'));
  });
  const [isSmartLockOpen, setIsSmartLockOpen] = useState(false);
  const [isAuroraAiOpen, setIsAuroraAiOpen] = useState(false);
  const [bypassExpired, setBypassExpired] = useState(false);
  const homeScrollPosition = useRef(0);
  const hasTrackedAppOpen = useRef(false);
  const currentPageRef = useRef<WelcomePage>(currentPage);

  // Keep a ref in sync with the current page so the global click tracker below
  // (attached once) always reports clicks against the page they actually happened on.
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Track EVERY click on a button/link anywhere in the app, in addition to the
  // specific semantic events (wifi_copy, smart_lock_open_success, ...) tracked
  // elsewhere - so the host's activity card always shows a full, complete trail.
  useEffect(() => {
    if (!pass) return;
    return attachGlobalClickTracking(pass, () => currentPageRef.current);
  }, [pass?.id]);

  // Track a single "app_open" event per session, once the guest pass is known
  useEffect(() => {
    if (pass && !hasTrackedAppOpen.current) {
      hasTrackedAppOpen.current = true;
      trackActivity(pass, 'app_open');
    }
  }, [pass]);

  // If a pass token is present, validate it
  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('pass')
      : null;
    if (!token) {
      const active = getActiveGuestPass();
      if (active) {
        setPass(active);
      }
      setIsPassChecking(false);
      return;
    }
    validateGuestPassToken(token).then(currentPass => {
      if (currentPass) {
        setPass(currentPass);
        setCurrentPage('grid_menu');
        if (typeof window !== 'undefined') {
          window.history.replaceState({ page: 'grid_menu' }, '');
        }
      }
      setIsPassChecking(false);
    });
  }, []);

  // Intercept the browser/gesture back action so it navigates within the app
  // instead of leaving the site.
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const page = (event.state && event.state.page) as WelcomePage | undefined;
      setCurrentPage(page || 'grid_menu');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Preserve the home position while subpages open at their top.
  useEffect(() => {
    if (currentPage === 'grid_menu') {
      window.scrollTo({ top: homeScrollPosition.current, behavior: 'auto' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentPage]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    trackActivity(pass, 'language_change', lang);
    setCurrentPage('grid_menu');
    if (typeof window !== 'undefined') {
      window.history.replaceState({ page: 'grid_menu' }, '');
    }
  };

  // Every language switch from anywhere in the app is tracked for the host's activity card
  const trackedSetLanguage = (lang: Language) => {
    setLanguage(lang);
    trackActivity(pass, 'language_change', lang);
  };

  const handleOpenSmartLock = () => {
    trackActivity(pass, 'smart_lock_open_attempt');
    setIsSmartLockOpen(true);
  };

  const handleBackToMenu = () => {
    if (typeof window !== 'undefined' && window.history.state?.page && window.history.state.page !== 'grid_menu') {
      window.history.back();
      return;
    }
    setCurrentPage('grid_menu');
  };

  const handleNavigate = (page: WelcomePage) => {
    homeScrollPosition.current = window.scrollY;
    if (typeof window !== 'undefined') {
      window.history.pushState({ page }, '');
    }
    setCurrentPage(page);
    trackActivity(pass, 'page_view', page);
  };

  // Expiration check: If pass is expired and user hasn't chosen to view public guide
  const isPassExpired = pass ? getStayTiming(pass).isExpired : false;
  if (pass && isPassExpired && !bypassExpired) {
    return (
      <ExpiredPassScreen
        pass={pass}
        onEnterAsPublicGuest={() => setBypassExpired(true)}
        language={language}
      />
    );
  }
  if (isPassChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070a0e] px-6 text-center text-slate-100">
        <div className="max-w-sm space-y-3">
          <Key className="mx-auto h-10 w-10 text-emerald-400" />
          <h1 className="text-xl font-semibold">
            {language === 'it' && "Verifica link..."}
            {language === 'en' && "Verifying link..."}
            {language === 'de' && "Link wird überprüft..."}
            {language === 'fr' && "Vérification du lien..."}
            {language === 'es' && "Verificando enlace..."}
          </h1>
          <p className="text-sm text-slate-400">
            {language === 'it' && "Sto verificando il link ospite, attendere prego."}
            {language === 'en' && "Verifying guest link, please wait."}
            {language === 'de' && "Gästelink wird überprüft, bitte warten."}
            {language === 'fr' && "Vérification du lien invité, veuillez patienter."}
            {language === 'es' && "Verificando el enlace de invitado, por favor espere."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative flex flex-col justify-between font-sans bg-black text-slate-100 selection:bg-emerald-500/25 selection:text-emerald-200">

      {/* Main Dynamic View Content */}
      <main className="flex-1 w-full p-0">
        {currentPage === 'language_select' && (
          <LanguageSelectScreen onSelectLanguage={handleLanguageSelect} />
        )}

        {currentPage === 'grid_menu' && (
          <ConciergeHome
            language={language}
            onSelectLanguage={trackedSetLanguage}
            onNavigate={handleNavigate}
            pass={pass}
            onOpenSmartLock={handleOpenSmartLock}
          />
        )}

        {currentPage === 'benvenuto' && (
          <BenvenutoPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
            pass={pass}
          />
        )}

        {currentPage === 'check_in' && (
          <CheckinPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
            pass={pass}
            onOpenSmartLock={handleOpenSmartLock}
            onUpdatePass={(updatedPass) => setPass(updatedPass)}
          />
        )}

        {currentPage === 'wifi' && (
          <WifiPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'regole' && (
          <RegolePage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'posizione' && (
          <PosizionePage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'trasporti' && (
          <TrasportiPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'servizi' && (
          <ServiziPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'attivita' && (
          <AttivitaPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'ristoranti' && (
          <RistorantiPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'bar_club' && (
          <BarClubPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'shopping' && (
          <ShoppingPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'informazioni' && (
          <InformazioniPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'emergenza' && (
          <EmergenzaPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}

        {currentPage === 'check_out' && (
          <CheckoutPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
            pass={pass}
          />
        )}

        {currentPage === 'contatti' && (
          <ContattiPage
            language={language}
            onBackToMenu={handleBackToMenu}
            onSelectLanguage={trackedSetLanguage}
          />
        )}
      </main>

      {/* Floating dual chat capsule (WhatsApp Nino & Aurora AI) */}
      {currentPage !== 'language_select' && currentPage !== 'contatti' && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center bg-slate-900/85 backdrop-blur-xl border border-white/20 rounded-full p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.55)] ring-1 ring-white/10 gap-1.5">
          {/* WhatsApp Host Nino */}
          <a
            href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(
              pass
                ? `Ciao Nino! Sono ${pass.guestName} ${pass.guestSurname}, ospite di Aurora in Valtellina.`
                : 'Ciao Nino!'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-md"
            title="Chatta con l'Host Nino su WhatsApp"
            aria-label="Chatta con l'Host Nino su WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.49-1.02-.91-1.708-2.034-1.908-2.379-.2-.345-.021-.531.13-.68.135-.134.3-.349.45-.524.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.584-.492-.505-.675-.514-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.026-1.05 2.5 0 1.474 1.075 2.898 1.225 3.098.15.2 2.115 3.23 5.124 4.529.716.309 1.275.493 1.71.632.718.228 1.372.196 1.888.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.575-.351z"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.892.524 3.662 1.434 5.176L2.057 22l4.986-1.308A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167a8.13 8.13 0 01-4.148-1.134l-.297-.176-3.078.807.822-2.999-.193-.307A8.138 8.138 0 013.833 12c0-4.502 3.665-8.167 8.167-8.167 4.502 0 8.167 3.665 8.167 8.167 0 4.502-3.665 8.167-8.167 8.167z"/>
            </svg>
          </a>

          {/* Segno centrale */}
          <div className="w-[1.5px] h-5 bg-white/25 rounded-full mx-0.5" aria-hidden="true" />

          {/* AI Message Chat */}
          <button
            type="button"
            onClick={() => { trackActivity(pass, 'ai_chat_open'); setIsAuroraAiOpen(true); }}
            className="w-11 h-11 rounded-full bg-white hover:bg-slate-100 text-slate-900 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-md"
            title="Chat AI Concierge"
            aria-label="Apri Chat AI Concierge"
          >
            {/* Logo messaggio con scritto AI */}
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M20 12c0 3.866-3.582 7-8 7-1.314 0-2.548-.278-3.623-.772L4 19.5l1.282-3.237C4.485 15.026 4 13.57 4 12c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                fill="#0f172a"
              />
              <text
                x="12"
                y="11.8"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="6.8"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fill="#ffffff"
                letterSpacing="0.2px"
              >
                AI
              </text>
            </svg>
          </button>
        </div>
      )}

      {/* Smart Lock Modal */}
      <SmartLockModal
        isOpen={isSmartLockOpen}
        onClose={() => setIsSmartLockOpen(false)}
        pass={pass}
        language={language}
      />

      <AuroraAiChat
        isOpen={isAuroraAiOpen}
        onClose={() => setIsAuroraAiOpen(false)}
        pass={pass}
        language={language}
      />

      {/* Subtle footer */}
      {currentPage !== 'language_select' && currentPage !== 'grid_menu' && (
        <footer className="p-3 text-center border-t border-emerald-500/15 bg-[#070a0e] flex items-center justify-center text-[10px] text-slate-400 px-4">
          <span>
            {language === 'it' && "© Aurora in Valtellina • Via Serta 188D, Morbegno (SO) • App di Andaloro Davide"}
            {language === 'en' && "© Aurora in Valtellina • Via Serta 188D, Morbegno (SO) • App by Andaloro Davide"}
            {language === 'de' && "© Aurora in Valtellina • Via Serta 188D, Morbegno (SO) • App von Andaloro Davide"}
            {language === 'fr' && "© Aurora in Valtellina • Via Serta 188D, Morbegno (SO) • App par Andaloro Davide"}
            {language === 'es' && "© Aurora in Valtellina • Via Serta 188D, Morbegno (SO) • App de Andaloro Davide"}
          </span>
        </footer>
      )}

    </div>
  );
};


