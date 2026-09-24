import React, { useEffect } from 'react';
import { iPhone18Frame } from './iPhone18Frame';
import { GlobalToolbar } from './GlobalToolbar';
import { CMSProvider, useCMS } from './CMSContext';
import { BlockControlsWrapper } from './BlockControlsWrapper';
import { InlineEditableText } from './InlineEditableText';
import { InlineTimePicker } from './InlineTimePicker';

// Simple block renderer - in a real app, you'd have more sophisticated rendering
const BlockRenderer: React.FC<{ block: any }> = ({ block }) => {
  const { state, dispatch } = useCMS();

  // For text-based blocks, we make them editable
  if (block.type === 'text' || block.type === 'heading' || block.type === 'paragraph') {
    return (
      <InlineEditableText
        value={block.content.text || ''}
        onSave={(newText) => {
          dispatch({
            type: 'UPDATE_BLOCK',
            payload: {
              id: block.id,
              updates: { content: { ...block.content, text: newText } }
            }
          });
        }}
        placeholder="Inserisci testo qui..."
        className={`block-content p-3 rounded ${block.type === 'heading' ? 'font-bold text-lg' : ''}`}
      />
    );
  }

  // For image blocks, we show a placeholder with upload capability
  if (block.type === 'image') {
    return (
      <div className="block-content aspect-w-4 aspect-h-3 bg-gray-200 flex items-center justify-center rounded relative">
        {block.content.url ? (
          <img
            src={block.content.url}
            alt="Caricata"
            className="max-w-full max-h-full rounded"
          />
        ) : (
          <div className="text-gray-500">
            🖼️ Immagine
            <br className="hidden sm:block" />
            Clicca per caricare
          </div>
        )}
        {/* In a real implementation, you'd add an upload button or make this area droppable */}
      </div>
    );
  }

  // For button blocks
  if (block.type === 'button') {
    return (
      <div className="block-content flex items-center justify-center p-3 rounded bg-blue-500 text-white">
        <InlineEditableText
          value={block.content.text || 'Clicca qui'}
          onSave={(newText) => {
            dispatch({
              type: 'UPDATE_BLOCK',
              payload: {
                id: block.id,
                updates: { content: { ...block.content, text: newText } }
              }
            });
          }}
          className="text-white"
          placeholder="Testo pulsante"
        />
      </div>
    );
  }

  // For divider
  if (block.type === 'divider') {
    return (
      <div className="block-content h-1 bg-gray-300 my-4" />
    );
  }

  // For spacer
  if (block.type === 'spacer') {
    return (
      <div className="block-content h-4" />
    );
  }

  // Default fallback
  return (
    <div className="block-content p-4 bg-gray-100 rounded text-gray-500 italic">
      Tipo di blocco non supportato: {block.type}
    </div>
  );
};

interface VisualCMSBuilderProps {
  className?: string;
}

export const VisualCMSBuilder = ({ className = '' }: VisualCMSBuilderProps) => {
  const { state, dispatch } = useCMS();

  // Map layout to blocks with controls
  const blocksWithControls = state.layout.map((block, index) => (
    <BlockControlsWrapper
      key={block.id}
      blockId={block.id}
      isSelected={false} // We could add selection logic
    >
      <div className={`block-wrapper mb-4 p-2 rounded-lg border border-gray-200 bg-white/50`}>
        <BlockRenderer block={block} />
      </div>
    </BlockControlsWrapper>
  ));

  return (
    <CMSProvider>
      <div className={`${className} w-full max-w-[400px] mx-auto`}>
        <GlobalToolbar />

        <iPhone18Frame className="mb-4">
          {blocksWithControls}

          {/* Add block button - in a real implementation, this would open a block picker */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <button
              onClick={() => {
                // Add a new text block by default
                dispatch({
                  type: 'ADD_BLOCK',
                  payload: {
                    type: 'text',
                    content: { text: 'Nuovo blocco di testo' },
                    style: {}
                  }
                });
              }}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Aggiungi blocco</span>
            </button>
          </div>
        </iPhone18Frame>
      </div>
    </CMSProvider>
  );
};