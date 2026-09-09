import React, { useState } from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { Phone, MessageSquare, Mail, Instagram, Star, Copy, Check, Send, Heart, MessageCircle } from 'lucide-react';
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
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewModal(false);
      setReviewSubmitted(false);
      setReviewText('');
    }, 3000);
  };

  return (
    <div className="bg-[#0b0e14] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={c.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Host Profile Avatar & Title */}
      <div className="text-center space-y-2 pt-1">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden border-2 border-white/20 shadow-md ring-2 ring-white/10">
          <img
            src={media?.hostAvatar || hostAvatarPhoto}
            alt={APARTMENT_INFO.hostName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            {APARTMENT_INFO.hostName}
          </h3>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            {c.hostRole}
          </span>
        </div>

        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed italic px-2">
          "{c.quote}"
        </p>
      </div>

      {/* Direct Contact Buttons List */}
      <div className="space-y-2 max-w-md mx-auto">
        
        {/* WhatsApp direct chat */}
        <a
          href={APARTMENT_INFO.hostWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-between shadow-sm transition group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold tracking-wide">
                {c.chatAction}
              </div>
              <div className="text-[10px] text-emerald-100 font-mono">
                {APARTMENT_INFO.hostPhoneDisplay}
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-100 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>WhatsApp</span>
            <span>→</span>
          </span>
        </a>

        {/* Phone Call */}
        <div className="p-3 rounded-2xl bg-[#141824] border border-white/[0.08] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Phone className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-white block">
                {APARTMENT_INFO.hostPhoneDisplay}
              </span>
              <span className="text-[10px] text-slate-400">
                Telefono Diretto
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCopy(APARTMENT_INFO.hostPhone, 'phone')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs transition border border-white/10 cursor-pointer"
              title={c.copyPhone}
            >
              {copiedType === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={`tel:${APARTMENT_INFO.hostPhone}`}
              className="text-xs font-semibold text-teal-300 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              {c.callAction}
            </a>
          </div>
        </div>

        {/* SMS option */}
        <a
          href={`sms:${APARTMENT_INFO.hostPhone}`}
          className="p-3 rounded-2xl bg-[#141824] hover:bg-[#181d2c] border border-white/[0.08] flex items-center justify-between shadow-sm transition group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <MessageCircle className="w-4 h-4 text-blue-300" />
            </div>
            <span className="text-xs font-semibold text-white">
              {c.smsAction}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded-lg">
            SMS
          </span>
        </a>

        {/* Email */}
        <div className="p-3 rounded-2xl bg-[#141824] border border-white/[0.08] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Mail className="w-4 h-4 text-neutral-300" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-medium text-white truncate block">
                {APARTMENT_INFO.hostEmail}
              </span>
              <span className="text-[10px] text-slate-400">
                Email Assistenza
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleCopy(APARTMENT_INFO.hostEmail, 'email')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs transition border border-white/10 cursor-pointer"
              title={c.copyEmail}
            >
              {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={`mailto:${APARTMENT_INFO.hostEmail}`}
              className="text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-xl transition cursor-pointer"
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
          className="p-3 rounded-2xl bg-[#141824] hover:bg-[#181d2c] border border-white/[0.08] flex items-center justify-between shadow-sm transition group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Instagram className="w-4 h-4 text-pink-400" />
            </div>
            <span className="text-xs font-medium text-slate-300">
              @aurora_in_valtellina
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-white/10 px-2.5 py-1 rounded-lg">
            Instagram
          </span>
        </a>

      </div>

      {copiedType && (
        <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center font-semibold">
          {c.copied}
        </div>
      )}

      {/* Review Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141824] border border-white/[0.08] shadow-sm text-center space-y-3 max-w-md mx-auto">
        
        {/* 5 Stars */}
        <div className="flex items-center justify-center gap-1 text-white">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="w-5 h-5 fill-white text-white" />
          ))}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
          {c.reviewPrompt}
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <a
            href={APARTMENT_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{c.rateGoogle}</span>
          </a>

          <button
            onClick={() => setShowReviewModal(true)}
            className="py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold text-xs transition border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{c.rateWebsite}</span>
          </button>
        </div>

      </div>

      {/* In-app Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#141824] border border-white/[0.12] p-6 shadow-2xl text-slate-100 space-y-4">
            {reviewSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Heart className="w-6 h-6 fill-emerald-400 text-emerald-400" />
                </div>
                <h4 className="font-bold text-base text-white">
                  {c.reviewSuccess}
                </h4>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <h4 className="font-semibold text-sm text-white text-center">
                  {c.reviewDialogTitle}
                </h4>
                
                <div className="text-center space-y-1.5">
                  <label className="text-xs text-slate-400 block">
                    {c.ratingPrompt}
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 text-white hover:scale-125 transition cursor-pointer"
                      >
                        <Star className={`w-7 h-7 ${star <= rating ? 'fill-white text-white' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block">
                    {c.commentPrompt}
                  </label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    placeholder="Il vostro feedback ci aiuta a migliorare costantemente..."
                    className="w-full text-xs p-3 rounded-xl border border-white/10 bg-[#0d1017] text-white focus:ring-2 focus:ring-white/30 outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 font-medium text-xs hover:bg-white/10 cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{c.submitReview}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
