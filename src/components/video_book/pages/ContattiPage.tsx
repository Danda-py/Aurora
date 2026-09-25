import React, { useState } from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { Phone, MessageSquare, Mail, Copy, Check, MessageCircle } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';
import { PageEditable } from '../cmsPageHelpers';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const ContattiPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const c = BOOK_DATA[language].contacts;
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const labels = VIDEO_PAGE_LABELS[language] || VIDEO_PAGE_LABELS.it;
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
          category={labels.directSupport}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Host Profile Avatar & Title */}
        <PageEditable id="page.contatti.host-profile" label="Profilo host">
          <div className="aurora-glass-card text-center space-y-3 pt-4 pb-6">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#62e6bd]/40 shadow-xl ring-4 ring-[#62e6bd]/15 bg-white/10">
              <img
                src="/uploads/host.jpg"
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
        </PageEditable>

        {/* Direct Contact Buttons List */}
        <div className="space-y-3">
          
          {/* WhatsApp direct chat */}
          <PageEditable id="page.contatti.whatsapp" label="Bottone WhatsApp">
            <a
              href={APARTMENT_INFO.hostWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-item-card items-center border-transparent shadow-lg shadow-[#62e6bd]/20 group"
              style={{ backgroundColor: '#128c55', color: '#ffffff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f7548')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#128c55')}
            >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <MessageSquare className="w-5 h-5 fill-current text-white" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold tracking-wide text-white">
                  {c.chatAction}
                </div>
                <div className="text-xs font-mono font-bold truncate text-white/85">
                  {APARTMENT_INFO.hostPhoneDisplay}
                </div>
              </div>
            </div>
              <span className="text-xs font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0 text-white">
                <span>WhatsApp</span>
                <span>→</span>
              </span>
            </a>
          </PageEditable>

          {/* Phone Call */}
          <PageEditable id="page.contatti.phone" label="Telefono host">
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
                    {labels.phone}
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
          </PageEditable>

          {/* SMS option */}
          <PageEditable id="page.contatti.sms" label="Bottone SMS">
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
                {labels.sendSms}
              </span>
            </a>
          </PageEditable>

          {/* Email */}
          <PageEditable id="page.contatti.email" label="Email host">
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
                    {t.contactsPage.supportEmail}
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
          </PageEditable>

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
