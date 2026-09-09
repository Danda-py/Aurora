import React, { useState } from 'react';
import { Camera, Eye, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { GALLERY_PHOTOS } from '../data/apartmentData';
import { translations } from '../data/translations';

interface Props {
  language: Language;
}

export const GalleryTab: React.FC<Props> = ({ language }) => {
  const t = translations[language];
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const prevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length);
    }
  };

  const nextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % GALLERY_PHOTOS.length);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-800">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              {t.gallery.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.gallery.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {GALLERY_PHOTOS.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <img
                src={photo.url}
                alt={photo.title[language]}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
              </div>
            </div>

            <div className="p-4 bg-white flex-1 flex flex-col justify-between">
              <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-teal-800 transition-colors">
                {photo.title[language]}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {photo.desc[language]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="p-4 flex items-center justify-between text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300">
                  {selectedPhotoIndex + 1} / {GALLERY_PHOTOS.length}
                </span>
                <span className="text-sm font-serif font-bold">
                  {GALLERY_PHOTOS[selectedPhotoIndex].title[language]}
                </span>
              </div>
              <button
                onClick={closeLightbox}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Photo Preview Container */}
            <div className="relative aspect-16/10 sm:aspect-16/9 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={GALLERY_PHOTOS[selectedPhotoIndex].url}
                alt={GALLERY_PHOTOS[selectedPhotoIndex].title[language]}
                className="max-h-full max-w-full object-contain"
              />

              {/* Prev / Next controls */}
              <button
                onClick={prevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 transition cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 transition cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Caption Footer */}
            <div className="p-4 bg-slate-900/90 text-slate-300 text-xs sm:text-sm border-t border-white/10">
              <p>{GALLERY_PHOTOS[selectedPhotoIndex].desc[language]}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
