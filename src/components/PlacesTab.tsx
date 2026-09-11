import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  Coffee, 
  Cross, 
  Train, 
  MapPin, 
  Navigation, 
  Phone, 
  Star, 
  Footprints,
  Sparkles,
  Search
} from 'lucide-react';
import { Language, NearbyPlace } from '../types';
import { translations } from '../data/translations';
import { NEARBY_PLACES } from '../data/apartmentData';

interface Props {
  language: Language;
}

export const PlacesTab: React.FC<Props> = ({ language }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const t = translations[language];

  const categories = [
    { id: 'all', label: t.places.filterAll, icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'restaurant', label: t.places.filterRestaurants, icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { id: 'grocery', label: t.places.filterGroceries, icon: <ShoppingCart className="w-3.5 h-3.5" /> },
    { id: 'bar', label: t.places.filterBars, icon: <Coffee className="w-3.5 h-3.5" /> },
    { id: 'pharmacy', label: t.places.filterPharmacy, icon: <Cross className="w-3.5 h-3.5" /> },
    { id: 'transport', label: t.places.filterTransport, icon: <Train className="w-3.5 h-3.5" /> },
  ];

  const filteredPlaces = NEARBY_PLACES.filter((place) => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesSearch = 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
          {t.places.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.places.subtitle}
        </p>
      </div>

      {/* Search Input & Filter Pills */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'it' 
                ? "Cerca pizzoccheri, supermercato, farmacia..." 
                : language === 'de'
                ? "Suchen nach Restaurant, Supermarkt, Apotheke..."
                : "Search restaurant, grocery, pharmacy..."
            }
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/30 shadow-xs"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Places List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between gap-4 hover:border-teal-200 hover:shadow-md transition-all"
          >
            <div>
              {/* Header: Title & Badges */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                      <Footprints className="w-3 h-3" />
                      Apri la mappa per il percorso
                    </span>
                    {place.priceRange && (
                      <span className="text-slate-400 font-medium">
                        {place.priceRange}
                      </span>
                    )}
                  </div>
                </div>

                {place.rating && (
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-1 rounded-lg border border-amber-200 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{place.rating}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-2.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{place.address}</span>
              </p>

              {/* Description */}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {place.description[language]}
              </p>

              {/* Highlight Badge */}
              {place.highlight && (
                <div className="mt-3 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{place.highlight[language]}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <a
                href={place.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t.places.openMaps}</span>
              </a>

              {place.phone && (
                <a
                  href={`tel:${place.phone}`}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  title={t.places.call}
                >
                  <Phone className="w-3.5 h-3.5 text-teal-700" />
                  <span>{t.places.call}</span>
                </a>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
