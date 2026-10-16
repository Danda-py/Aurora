import React from 'react';
import { EditableElement } from '../visual-cms/EditableElement';
import { EditableImageOverlay } from '../visual-cms/EditableImageOverlay';
import { useEditMode, CMSCustomBlock } from '../visual-cms/EditModeContext';
import { Sparkles, ExternalLink } from 'lucide-react';

/** Sorgente immagine con override CMS (upload host) o fallback. */
export const useCmsImage = (id: string, fallback: string): string => {
  const { images } = useEditMode();
  return images[id] || fallback;
};

/**
 * Banner hero editabile delle sottopagine: foto sostituibile con upload,
 * eyebrow e titolo modificabili in-place o dal pannello laterale.
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

/**
 * Renderizza i blocchi personalizzati aggiunti dall'host per la pagina corrente
 * (o per la Home se pageKey="grid_menu").
 */
export const CustomBlocksRenderer: React.FC<{ pageKey: string }> = ({ pageKey }) => {
  const { customBlocks } = useEditMode();
  const blocks: CMSCustomBlock[] = customBlocks[pageKey] ?? [];
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      {blocks.map((block) => (
        <PageEditable key={block.id} id={`custom.${pageKey}.${block.id}`} label={block.title || 'Blocco personalizzato'}>
          <div className="aurora-glass-card overflow-hidden p-0 flex flex-col">
            {block.imageUrl && (
              <div className="h-40 w-full overflow-hidden relative">
                <EditableImage
                  id={`custom.${pageKey}.${block.id}.img`}
                  src={block.imageUrl}
                  alt={block.title}
                />
              </div>
            )}
            <div className="p-4 space-y-2">
              {block.badge && (
                <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> {block.badge}
                </span>
              )}
              {block.title && (
                <h4 className="font-bold text-base text-white tracking-tight">
                  {block.title}
                </h4>
              )}
              {block.body && (
                <p className="text-xs text-white/75 leading-relaxed whitespace-pre-line">
                  {block.body}
                </p>
              )}
              {block.buttonLabel && block.buttonUrl && (
                <div className="pt-1.5">
                  <a
                    href={block.buttonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aurora-action-pill inline-flex items-center gap-1.5"
                  >
                    <span>{block.buttonLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#07110d]" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </PageEditable>
      ))}
    </div>
  );
};
