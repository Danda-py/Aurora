import React from 'react';
import { useCMS } from './CMSContext';
import { EditableBlockWrapper } from './EditableBlockWrapper';
import { InlineEditableText } from './InlineEditableText';
import { InlineTimePicker } from './InlineTimePicker';
import { BOOK_DATA } from '../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';
import { GuestPass } from '../../types';

interface EditableGuidePageProps {
  /** Pass ospite per contestualizzare i testi (opzionale in builder). */
  pass?: GuestPass | null;
}

/**
 * Pagina di esempio della guida dentro l'iPhone, costruita interamente con i
 * componenti del Visual CMS: ogni titolo, testo e orario è un blocco editabile.
 * Serve da dimostrazione/pattern per trasformare le altre pagine della PWA.
 */
export const EditableGuidePage: React.FC<EditableGuidePageProps> = ({ pass }) => {
  const { state, selectBlock } = useCMS();
  const lang = state.language;
  const data = BOOK_DATA[lang];
  const t = VIDEO_TRANSLATIONS[lang] ?? VIDEO_TRANSLATIONS.it;

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="text-center py-3">
        <InlineEditableText
          blockKey="guide.title"
          role="title"
          fallback="Benvenuto in Aurora"
          style={{ display: 'block' }}
        />
        <InlineEditableText
          blockKey="guide.subtitle"
          role="subtitle"
          fallback={pass ? `${pass.guestName} ${pass.guestSurname}` : 'La tua guida ospiti'}
          style={{ display: 'block', marginTop: 4 }}
        />
      </div>

      {/* Card Check-in con orario contestuale */}
      <EditableBlockWrapper
        blockKey="guide.checkin"
        defaultContainer={{ backgroundColor: '#181d2a', glassOpacity: 0.7 }}
        className="aurora-glass-card p-4 space-y-2"
      >
        <InlineEditableText blockKey="checkin.title" role="heading" fallback={data.checkIn?.title ?? 'Check-in'} style={{ display: 'block' }} />
        <InlineEditableText
          blockKey="checkin.desc"
          role="body"
          multiline
          fallback={data.checkIn?.step1 ?? 'Trovi le chiavi nel portachiavi all\u2019ingresso.'}
          style={{ display: 'block' }}
        />
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] text-white/50">Orario:</span>
          <CheckinTimePicker />
        </div>
      </EditableBlockWrapper>

      {/* Card Regole */}
      <EditableBlockWrapper
        blockKey="guide.rules"
        defaultContainer={{ backgroundColor: '#1c2030', layout: 'stacked' }}
        className="aurora-glass-card p-4 space-y-2"
      >
        <InlineEditableText blockKey="rules.title" role="heading" fallback={data.rules?.title ?? 'Regole della casa'} style={{ display: 'block' }} />
        <InlineEditableText blockKey="rules.r1Title" role="body" fallback={data.rules?.r1Title ?? 'Rispetto della quiete'} style={{ display: 'block' }} />
        <InlineEditableText
          blockKey="rules.r1Desc"
          role="body"
          multiline
          fallback={data.rules?.r1Desc ?? 'È gradito un comportamento rispettoso verso i vicini.'}
          style={{ display: 'block' }}
        />
      </EditableBlockWrapper>

      {/* Card Servizi */}
      <EditableBlockWrapper
        blockKey="guide.services"
        defaultContainer={{ backgroundColor: '#20303d', layout: 'stacked' }}
        className="aurora-glass-card p-4 space-y-2"
      >
        <InlineEditableText blockKey="services.title" role="heading" fallback={data.amenities?.title ?? 'Servizi'} style={{ display: 'block' }} />
        <InlineEditableText
          blockKey="services.notice"
          role="body"
          multiline
          fallback={data.amenities?.notice ?? 'Wi-Fi veloce, cucina attrezzata e aria condizionata.'}
          style={{ display: 'block' }}
        />
      </EditableBlockWrapper>

      <p className="text-center text-[10px] text-white/30 pt-2">
        Aurora in Valtellina · Visual CMS
      </p>
    </div>
  );
};

/** Orario check-in collegato al blocco CMS "checkin.time". */
const CheckinTimePicker: React.FC = () => {
  const { state, selectBlock, updateTime } = useCMS();
  const block = state.blocks['checkin.time'];
  const value = block?.content?.time ?? '13:00';

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        selectBlock('checkin.time');
      }}
    >
      <InlineTimePicker
        value={value}
        onChange={(v) => updateTime('checkin.time', v)}
        className="text-emerald-300"
      />
    </span>
  );
};
