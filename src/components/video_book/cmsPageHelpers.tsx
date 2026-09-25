import React from 'react';
import { EditableElement } from '../visual-cms/EditableElement';
import { EditableImageOverlay } from '../visual-cms/EditableImageOverlay';
import { useEditMode } from '../visual-cms/EditModeContext';

/** Sorgente immagine con override CMS (upload host) o fallback. */
export const useCmsImage = (id: string, fallback: string): string => {
  const { images } = useEditMode();
  return images[id] || fallback;
};

/**
 * Banner hero editabile delle sottopagine: foto sostituibile con upload,
 * eyebrow e titolo modificabili in-place (1° click seleziona, poi clicca
 * i testi per editarli).
 */
export const EditableHeroBanner: React.FC<{
  page: string;
  img: string;
  alt: string;
  eyebrow?: React.ReactNode;
  title: string;
}> = ({ page, img, alt, eyebrow, title }) => {
  const src = useCmsImage(`page.${page}.hero-img`, img);
  return (
    <EditableElement id={`page.${page}`} label="Intestazione pagina" className="rounded-[1.6rem]">
      <div className="aurora-hero-banner">
        <EditableImageOverlay id={`page.${page}.hero-img`} buttonPosition="center" triggerOnHover>
          <img src={src} alt={alt} />
        </EditableImageOverlay>
        <div className="aurora-hero-banner-overlay">
          {eyebrow}
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {title}
          </h1>
        </div>
      </div>
    </EditableElement>
  );
};

/** Immagine editabile delle card: al hover compare "Sostituisci immagine". */
export const EditableImage: React.FC<{
  id: string;
  src: string;
  alt: string;
  className?: string;
}> = ({ id, src, alt, className = 'w-full h-full object-cover' }) => {
  const resolved = useCmsImage(id, src);
  return (
    <EditableImageOverlay id={id} buttonPosition="center" triggerOnHover>
      <img src={resolved} alt={alt} className={className} loading="lazy" />
    </EditableImageOverlay>
  );
};

/** Card/elemento editabile standard delle sottopagine. */
export const PageEditable: React.FC<{
  id: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ id, label, className = 'rounded-2xl', children }) => (
  <EditableElement id={id} label={label} className={className}>
    {children}
  </EditableElement>
);
