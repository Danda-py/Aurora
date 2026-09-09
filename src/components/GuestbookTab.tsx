import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, Check, User, MapPin, Sparkles, Heart } from 'lucide-react';
import { Language, GuestReview } from '../types';
import { translations } from '../data/translations';
import { INITIAL_GUESTBOOK_REVIEWS } from '../data/apartmentData';

interface Props {
  language: Language;
}

const STORAGE_KEY = 'aurora_guestbook_reviews_v1';

export const GuestbookTab: React.FC<Props> = ({ language }) => {
  const [reviews, setReviews] = useState<GuestReview[]>([]);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const t = translations[language];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setReviews(JSON.parse(saved));
      } else {
        setReviews(INITIAL_GUESTBOOK_REVIEWS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GUESTBOOK_REVIEWS));
      }
    } catch {
      setReviews(INITIAL_GUESTBOOK_REVIEWS);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);

    const newReview: GuestReview = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      country: country.trim() || (language === 'it' ? 'Ospite' : 'Guest'),
      date: new Date().toLocaleDateString(language === 'it' ? 'it-IT' : language === 'de' ? 'de-DE' : 'en-US', {
        month: 'long',
        year: 'numeric',
      }),
      rating,
      comment: comment.trim(),
      travelType: language === 'it' ? 'Ospite Verificato' : 'Verified Guest',
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setName('');
    setCountry('');
    setComment('');
    setRating(5);
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
          {t.guestbook.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.guestbook.subtitle}
        </p>
      </div>

      {/* Write a Review Card Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              {t.guestbook.addReview}
            </h3>
            <p className="text-xs text-slate-500">
              Lascia un messaggio o un consiglio per i futuri viaggiatori
            </p>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{t.guestbook.thankYou}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Star Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              {t.guestbook.rating}
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">
                {rating} / 5
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                {t.guestbook.yourName} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Chiara & Luca"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/30"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                {t.guestbook.yourCountry}
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Es. Roma, Italia"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/30"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              {t.guestbook.comment} *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                language === 'it'
                  ? "Cosa ti è piaciuto di più dell'appartamento Aurora o della Valtellina?"
                  : "What did you enjoy most about Aurora Apartment or Valtellina?"
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/30"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {t.guestbook.submit}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-serif text-slate-900">
            {t.guestbook.recentReviews} ({reviews.length})
          </h3>
          <div className="flex items-center gap-1 text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>5.0 / 5.0 Rating Ospiti</span>
          </div>
        </div>

        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {rev.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{rev.country} • {rev.date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
