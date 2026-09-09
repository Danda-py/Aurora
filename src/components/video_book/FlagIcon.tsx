import React from 'react';
import { Language } from '../../types';

interface Props {
  language: Language;
  className?: string;
}

export const FlagIcon: React.FC<Props> = ({ language, className = "w-7 h-7" }) => {
  switch (language) {
    case 'en':
      return (
        <svg viewBox="0 0 60 60" className={`${className} rounded-full overflow-hidden shadow-xs shrink-0 border border-white/40`}>
          <circle cx="30" cy="30" r="30" fill="#012169" />
          <path d="M0,0 L60,60 M60,0 L0,60" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,60 M60,0 L0,60" stroke="#C8102E" strokeWidth="3.5" />
          <path d="M30,0 v60 M0,30 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v60 M0,30 h60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      );
    case 'fr':
      return (
        <svg viewBox="0 0 60 60" className={`${className} rounded-full overflow-hidden shadow-xs shrink-0 border border-white/40`}>
          <circle cx="30" cy="30" r="30" fill="#fff" />
          <path d="M0,0 h20 v60 h-20 z" fill="#002654" />
          <path d="M20,0 h20 v60 h-20 z" fill="#FFFFFF" />
          <path d="M40,0 h20 v60 h-20 z" fill="#ED2939" />
        </svg>
      );
    case 'es':
      return (
        <svg viewBox="0 0 60 60" className={`${className} rounded-full overflow-hidden shadow-xs shrink-0 border border-white/40`}>
          <circle cx="30" cy="30" r="30" fill="#AA151B" />
          <rect y="15" width="60" height="30" fill="#F1BF00" />
          <circle cx="20" cy="30" r="4" fill="#AA151B" opacity="0.8" />
        </svg>
      );
    case 'it':
      return (
        <svg viewBox="0 0 60 60" className={`${className} rounded-full overflow-hidden shadow-xs shrink-0 border border-white/40`}>
          <circle cx="30" cy="30" r="30" fill="#fff" />
          <path d="M0,0 h20 v60 h-20 z" fill="#009246" />
          <path d="M20,0 h20 v60 h-20 z" fill="#FFFFFF" />
          <path d="M40,0 h20 v60 h-20 z" fill="#CE2B37" />
        </svg>
      );
    case 'de':
      return (
        <svg viewBox="0 0 60 60" className={`${className} rounded-full overflow-hidden shadow-xs shrink-0 border border-white/40`}>
          <rect y="0" width="60" height="20" fill="#000000" />
          <rect y="20" width="60" height="20" fill="#DD0000" />
          <rect y="40" width="60" height="20" fill="#FFCE00" />
        </svg>
      );
  }
};
