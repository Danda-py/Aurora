import React, { useState } from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { Phone, MessageSquare, Mail, Instagram, Copy, Check, MessageCircle } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';
import hostAvatarPhoto from '../../../assets/images/host_nino_photo_1788354896364.jpg';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const ContattiPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData, media } = useCms();
  const cmsContacts = getPageData('contacts') || getPageData('contact') || {};
  const c = { ...BOOK_DATA[language].contacts, ...cmsContacts };
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={c.title}
          category="Assistenza Diretta"
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Host Profile Avatar & Title */}
        <div className="aurora-glass-card text-center space-y-3 pt-4 pb-6">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#62e6bd]/40 shadow-xl ring-4 ring-[#62e6bd]/15">
            <img
              src={media?.hostAvatar || hostAvatarPhoto}
              alt={APARTMENT_INFO.hostName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {APARTMENT_INFO.hostName}
            </h3>
            <span className="aurora-eyebrow text-[#62e6bd] block mt-1">
              {c.hostRole}
            </span>
          </div>

          <p className="text-xs text-white/75 max-w-sm mx-auto leading-relaxed italic px-2">
            "{c.quote}"
          </p>
        </div>

        {/* Direct Contact Buttons List */}
        <div className="space-y-3">
          
          {/* WhatsApp direct chat */}
          <a
            href={APARTMENT_INFO.hostWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-item-card items-center bg-[#62e6bd] hover:bg-[#93f4d4] text-[#07110d] border-transparent shadow-lg shadow-[#62e6bd]/20 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#07110d]/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <MessageSquare className="w-5 h-5 fill-current text-[#07110d]" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold tracking-wide text-[#07110d]">
                  {c.chatAction}
                </div>
                <div className="text-xs text-[#07110d]/80 font-mono font-bold truncate">
                  {APARTMENT_INFO.hostPhoneDisplay}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#07110d] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
              <span>WhatsApp</span>
              <span>→</span>
            </span>
          </a>

          {/* Phone Call */}
          <div className="aurora-item-card items-center">
            <div className="flex items-center gap-3 min-w-0">
              <div className="aurora-icon-box">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-xs font-bold text-white block">
                  {APARTMENT_INFO.hostPhoneDisplay}
                </span>
                <span className="text-xs text-white/60 block">
                  Telefono Diretto
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(APARTMENT_INFO.hostPhone, 'phone')}
                className="aurora-secondary-pill"
                title={c.copyPhone}
              >
                {copiedType === 'phone' ? <Check className="w-3.5 h-3.5 text-[#62e6bd]" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
              </button>
              <a
                href={`tel:${APARTMENT_INFO.hostPhone}`}
                className="aurora-action-pill"
              >
                {c.callAction}
              </a>
            </div>
          </div>

          {/* SMS option */}
          <a
            href={`sms:${APARTMENT_INFO.hostPhone}`}
            className="aurora-item-card items-center group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="aurora-icon-box">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white">
                {c.smsAction}
              </span>
            </div>
            <span className="aurora-secondary-pill">
              Invia SMS
            </span>
          </a>

          {/* Email */}
          <div className="aurora-item-card items-center">
            <div className="flex items-center gap-3 min-w-0">
              <div className="aurora-icon-box">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white truncate block">
                  {APARTMENT_INFO.hostEmail}
                </span>
                <span className="text-xs text-white/60 block">
                  Email Assistenza
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(APARTMENT_INFO.hostEmail, 'email')}
                className="aurora-secondary-pill"
                title={c.copyEmail}
              >
                {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-[#62e6bd]" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
              </button>
              <a
                href={`mailto:${APARTMENT_INFO.hostEmail}`}
                className="aurora-action-pill"
              >
                Email
              </a>
            </div>
          </div>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-item-card items-center group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="aurora-icon-box">
                <Instagram className="w-5 h-5 text-pink-400" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white">
                @aurora_in_valtellina
              </span>
            </div>
            <span className="aurora-secondary-pill">
              Instagram
            </span>
          </a>

        </div>

        {copiedType && (
          <div className="p-3 rounded-2xl bg-[#62e6bd]/20 border border-[#62e6bd]/30 text-[#9ef2d3] text-xs text-center font-bold animate-fade-in">
            {c.copied}
          </div>
        )}

      </div>
    </div>
  );
};
