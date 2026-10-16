import React from 'react';
import { EditableElement } from '../visual-cms/EditableElement';
import { EditableImageOverlay } from '../visual-cms/EditableImageOverlay';
import { useEditMode, CMSCustomBlock } from '../visual-cms/EditModeContext';
import { Language } from '../../types';
import { Sparkles, ExternalLink } from 'lucide-react';

export type DoorBannerKind = 'success' | 'error' | 'not_connected' | 'too_far' | 'hint';

type DoorBannerMessage = {
  id: string;
  label: string;
  fallback: Partial<Record<Language, string>>;
};

const DOOR_BANNER_COPY: DoorBannerMessage[] = [
  { id: 'message.door.success.title', label: 'Apertura · titolo conferma', fallback: { it: 'Comando inviato', en: 'Unlock command sent' } },
  { id: 'message.door.success.detail', label: 'Apertura · dettaglio conferma', fallback: { it: 'Home Assistant ha accettato la richiesta. Verifica l’apertura fisica della porta.', en: 'Home Assistant accepted the request. Check that the door physically unlocked.' } },
  { id: 'message.door.too_far.title', label: 'Apertura · titolo fuori zona', fallback: { it: 'Troppo lontano', en: 'Too far away' } },
  { id: 'message.door.too_far.detail', label: 'Apertura · dettaglio fuori zona', fallback: { it: 'Avvicinati all’ingresso o connettiti al Wi-Fi autorizzato.', en: 'Move closer to the entrance or connect to the authorized Wi-Fi.' } },
  { id: 'message.door.not_connected.title', label: 'Apertura · titolo connessione', fallback: { it: 'Non connesso al Wi-Fi', en: 'Not connected to Wi-Fi' } },
  { id: 'message.door.not_connected.detail', label: 'Apertura · dettaglio connessione', fallback: { it: 'Connettiti al Wi-Fi della struttura oppure attiva la posizione.', en: 'Connect to the property Wi-Fi or enable location access.' } },
  { id: 'message.door.error.title', label: 'Apertura · titolo errore', fallback: { it: 'Errore apertura porta', en: 'Door unlock error' } },
  { id: 'message.door.error.detail', label: 'Apertura · dettaglio errore', fallback: { it: 'Richiesta non riuscita. Riprova o contatta l’host.', en: 'The request failed. Try again or contact your host.' } },
  { id: 'message.door.hold.title', label: 'Apertura · titolo pressione breve', fallback: { it: 'Pressione non completata', en: 'Hold not completed' } },
  { id: 'message.door.hold.detail', label: 'Apertura · dettaglio pressione breve', fallback: { it: 'Tieni premuto per 1,2 secondi senza sollevare il dito.', en: 'Keep holding for 1.2 seconds without lifting your finger.' } },
  { id: 'message.door.checkin.title', label: 'Apertura · titolo check-in richiesto', fallback: { it: 'Check-in non confermato', en: 'Check-in not confirmed' } },
  { id: 'message.door.checkin.detail', label: 'Apertura · dettaglio check-in richiesto', fallback: { it: 'L’host deve confermare il check-in prima di abilitare l’apertura.', en: 'Your host must confirm check-in before unlocking is enabled.' } },
];

export function getDoorBannerCopyFields(): DoorBannerMessage[] {
  return DOOR_BANNER_COPY;
}

export function resolveCmsText(
  texts: Record<string, Record<string, string>>,
  id: string,
  language: string,
  fallback: string,
): string {
  return texts[id]?.[language] ?? fallback;
}

const DOOR_BANNER_COPY_BY_KIND: Record<DoorBannerKind | 'checkin', readonly [string, string]> = {
  success: ['message.door.success.title', 'message.door.success.detail'],
  error: ['message.door.error.title', 'message.door.error.detail'],
  not_connected: ['message.door.not_connected.title', 'message.door.not_connected.detail'],
  too_far: ['message.door.too_far.title', 'message.door.too_far.detail'],
  hint: ['message.door.hold.title', 'message.door.hold.detail'],
  checkin: ['message.door.checkin.title', 'message.door.checkin.detail'],
};

export function resolveDoorBannerCopy(
  texts: Record<string, Record<string, string>>,
  language: Language,
  kind: DoorBannerKind,
  originalTitle: string,
  originalDetail: string,
) {
  const messageKind = kind === 'not_connected' && /check-in/i.test(originalTitle) ? 'checkin' : kind;
  const [titleId, detailId] = DOOR_BANNER_COPY_BY_KIND[messageKind];
  return {
    title: resolveCmsText(texts, titleId, language, originalTitle),
    detail: resolveCmsText(texts, detailId, language, originalDetail),
  };
}

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
